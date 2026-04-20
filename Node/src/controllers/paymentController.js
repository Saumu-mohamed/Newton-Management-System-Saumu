import AuditLog from "../../models/AuditLog.js";
import MpesaTransaction from "../../models/MpesaTransaction.js";
import Payment from "../../models/Payment.js";
import Student from "../../models/Student.js";
import User from "../../models/User.js";
import { getMpesaAccessToken, mpesaConfig } from "../config/mpesa.js";
import {
    buildPaymentReference,
    buildTransactionReference,
    extractCallbackMetadata,
    generatePassword,
    generateTimestamp,
    mapCallbackStatus,
    maskPhone,
    normalizeAmount,
    normalizeKenyanPhone,
} from "../utils/mpesaHelpers.js";
import { emitPaymentUpdate } from "../realtime/paymentSocket.js";

const getRequesterIp = (req) => req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "Unknown";

const createAuditEntry = async ({ req, action, status = "success", details, metadata = {} }) => {
    await AuditLog.create({
        action,
        user: req.user?.email || "system@mpesa-callback",
        role: req.user?.role || "System",
        ip: getRequesterIp(req),
        status,
        details,
        category: "payments",
        metadata,
    });
};

const resolvePaymentActor = async (req) => {
    const actor = req.user;
    let targetUser = actor;
    let targetStudent = await Student.findOne({ email: actor.email });

    if ((actor.role === "finance" || actor.role === "superadmin") && req.body?.userId) {
        targetUser = await User.findById(req.body.userId).select("-password");

        if (!targetUser) {
            return { error: { status: 404, message: "Payment user not found" } };
        }

        targetStudent = await Student.findOne({ email: targetUser.email });
    }

    if (!targetUser) {
        return { error: { status: 404, message: "Authenticated user not found" } };
    }

    if (!targetStudent) {
        return { error: { status: 404, message: "Student profile not found for the selected user" } };
    }

    return { targetUser, targetStudent };
};

const serializePayment = (payment) => ({
    id: payment._id.toString(),
    userId: String(payment.userId),
    studentId: payment.student ? String(payment.student) : null,
    phone: payment.phone,
    amount: Number(payment.amount || 0),
    method: payment.method,
    status: payment.status,
    reference: payment.reference,
    transactionId: payment.transactionId,
    checkoutRequestId: payment.checkoutRequestId,
    merchantRequestId: payment.merchantRequestId,
    transactionRef: payment.transactionRef || payment.transactionReference || payment.reference,
    resultCode: payment.resultCode,
    resultDesc: payment.resultDesc,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    completedAt: payment.completedAt,
});

export const initiateMpesaPayment = async (req, res) => {
    try {
        const { targetStudent, targetUser, error } = await resolvePaymentActor(req);

        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const phone = normalizeKenyanPhone(req.body?.phone || targetUser.phone);
        const requestedAmount = normalizeAmount(req.body?.amount);
        const balance = Math.max(Number(targetStudent.totalFee || 0) - Number(targetStudent.paidAmount || 0), 0);
        const amount = requestedAmount ? Math.min(requestedAmount, balance) : balance;
        const reference = String(req.body?.reference || "School Fees").trim() || "School Fees";

        if (!phone) {
            return res.status(400).json({ message: "A valid Safaricom phone number is required." });
        }

        if (!amount || amount < 1) {
            return res.status(400).json({ message: "A valid payment amount is required." });
        }

        if (balance <= 0) {
            return res.status(400).json({ message: "No outstanding balance available for payment." });
        }

        const existingPendingPayment = await Payment.findOne({
            userId: targetUser._id,
            status: "pending",
            method: "mpesa",
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
        }).sort({ createdAt: -1 });

        if (existingPendingPayment) {
            return res.status(409).json({
                message: "There is already a pending M-Pesa request for this account. Complete or cancel it before trying again.",
                payment: serializePayment(existingPendingPayment),
            });
        }

        const timestamp = generateTimestamp();
        const password = generatePassword({
            shortcode: mpesaConfig.shortcode,
            passkey: mpesaConfig.passkey,
            timestamp,
        });
        const transactionRef = buildTransactionReference({
            studentId: targetStudent._id,
            userId: targetUser._id,
        });
        const accountReference = buildPaymentReference({
            student: targetStudent,
            user: targetUser,
            reference,
            amount,
        });
        const token = await getMpesaAccessToken();

        const darajaResponse = await fetch(mpesaConfig.stkPushUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                BusinessShortCode: mpesaConfig.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phone,
                PartyB: mpesaConfig.shortcode,
                PhoneNumber: phone,
                CallBackURL: mpesaConfig.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: reference,
            }),
        });

        const darajaPayload = await darajaResponse.json();

        if (!darajaResponse.ok || String(darajaPayload?.ResponseCode) !== "0") {
            await createAuditEntry({
                req,
                action: "mpesa_stk_push_initiated",
                status: "failed",
                details: darajaPayload?.errorMessage || darajaPayload?.ResponseDescription || "Daraja STK push request failed",
                metadata: {
                    amount,
                    phone: maskPhone(phone),
                    darajaPayload,
                    targetUserId: targetUser._id.toString(),
                },
            });

            return res.status(502).json({
                message: darajaPayload?.errorMessage || darajaPayload?.ResponseDescription || "Failed to initiate M-Pesa STK push.",
            });
        }

        const payment = await Payment.create({
            student: targetStudent._id,
            userId: targetUser._id,
            phone,
            amount,
            method: "mpesa",
            status: "pending",
            reference,
            transactionRef,
            transactionReference: transactionRef,
            checkoutRequestId: darajaPayload.CheckoutRequestID,
            merchantRequestId: darajaPayload.MerchantRequestID,
            resultCode: null,
            resultDesc: darajaPayload.CustomerMessage || darajaPayload.ResponseDescription,
            requestedAt: new Date(),
            date: new Date(),
        });

        await MpesaTransaction.create({
            payment: payment._id,
            userId: targetUser._id,
            phone,
            amount,
            reference,
            transactionRef,
            status: "Pending Callback",
            merchantRequestID: darajaPayload.MerchantRequestID,
            checkoutRequestID: darajaPayload.CheckoutRequestID,
            resultDesc: darajaPayload.CustomerMessage || darajaPayload.ResponseDescription,
            timestamp: new Date(),
        });

        await createAuditEntry({
            req,
            action: "mpesa_stk_push_initiated",
            details: "M-Pesa STK push initiated successfully.",
            metadata: {
                amount,
                phone: maskPhone(phone),
                checkoutRequestId: darajaPayload.CheckoutRequestID,
                targetUserId: targetUser._id.toString(),
                targetStudentId: targetStudent._id.toString(),
            },
        });

        const serializedPayment = serializePayment(payment);
        emitPaymentUpdate(serializedPayment);

        return res.status(201).json({
            message: darajaPayload.CustomerMessage || "M-Pesa prompt sent. Complete payment on your phone.",
            payment: serializedPayment,
            mpesa: {
                merchantRequestId: darajaPayload.MerchantRequestID,
                checkoutRequestId: darajaPayload.CheckoutRequestID,
                responseCode: darajaPayload.ResponseCode,
                responseDescription: darajaPayload.ResponseDescription,
                customerMessage: darajaPayload.CustomerMessage,
            },
        });
    } catch (error) {
        console.error("M-Pesa STK push error:", error);
        return res.status(500).json({
            message: error.message?.includes("M-Pesa config")
                ? error.message
                : "Failed to initiate M-Pesa payment.",
        });
    }
};

export const handleMpesaCallback = async (req, res) => {
    try {
        const stkCallback = req.body?.Body?.stkCallback;

        if (!stkCallback?.CheckoutRequestID) {
            return res.status(400).json({ message: "Invalid M-Pesa callback payload." });
        }

        const callbackData = extractCallbackMetadata(stkCallback.CallbackMetadata);
        const mappedStatus = mapCallbackStatus(stkCallback.ResultCode);
        const checkoutRequestId = stkCallback.CheckoutRequestID;

        const updatedPayment = await Payment.findOneAndUpdate(
            {
                checkoutRequestId,
                isCallbackProcessed: { $ne: true },
            },
            {
                $set: {
                    status: mappedStatus,
                    transactionId: callbackData.MpesaReceiptNumber || null,
                    resultCode: Number(stkCallback.ResultCode),
                    resultDesc: stkCallback.ResultDesc,
                    callbackMetadata: callbackData,
                    rawCallback: req.body,
                    isCallbackProcessed: true,
                    callbackProcessedAt: new Date(),
                    completedAt: new Date(),
                    date: new Date(),
                },
            },
            { new: true }
        );

        const existingPayment = updatedPayment || await Payment.findOne({ checkoutRequestId });

        if (!existingPayment) {
            await AuditLog.create({
                action: "mpesa_callback_unmatched",
                user: "system@mpesa-callback",
                role: "System",
                ip: getRequesterIp(req),
                status: "warning",
                details: "Received callback for unknown CheckoutRequestID.",
                category: "payments",
                metadata: { checkoutRequestId, payload: req.body },
            });

            return res.status(200).json({ message: "Callback received." });
        }

        await MpesaTransaction.findOneAndUpdate(
            { checkoutRequestID: checkoutRequestId },
            {
                $set: {
                    payment: existingPayment._id,
                    userId: existingPayment.userId,
                    phone: existingPayment.phone,
                    amount: existingPayment.amount,
                    reference: existingPayment.reference,
                    transactionRef: existingPayment.transactionRef,
                    transactionId: callbackData.MpesaReceiptNumber || null,
                    mpesaReceiptNumber: callbackData.MpesaReceiptNumber || null,
                    merchantRequestID: stkCallback.MerchantRequestID,
                    status: mappedStatus === "success" ? "Confirmed" : "Failed",
                    resultCode: Number(stkCallback.ResultCode),
                    resultDesc: stkCallback.ResultDesc,
                    callbackMetadata: callbackData,
                    timestamp: new Date(),
                },
            },
            { new: true, upsert: true }
        );

        if (updatedPayment && mappedStatus === "success" && existingPayment.student) {
            await Student.findByIdAndUpdate(existingPayment.student, {
                $inc: { paidAmount: Number(existingPayment.amount || 0) },
                $set: { lastPayment: new Date() },
            });
        }

        await AuditLog.create({
            action: "mpesa_callback_processed",
            user: "system@mpesa-callback",
            role: "System",
            ip: getRequesterIp(req),
            status: mappedStatus === "success" ? "success" : "warning",
            details: stkCallback.ResultDesc,
            category: "payments",
            metadata: {
                paymentId: existingPayment._id.toString(),
                checkoutRequestId,
                transactionId: callbackData.MpesaReceiptNumber || null,
                resultCode: Number(stkCallback.ResultCode),
                duplicate: !updatedPayment,
            },
        });

        emitPaymentUpdate(serializePayment(existingPayment));

        return res.status(200).json({ message: "Callback processed successfully." });
    } catch (error) {
        console.error("M-Pesa callback error:", error);
        return res.status(500).json({ message: "Failed to process M-Pesa callback." });
    }
};

export const getMyPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(25)
            .lean();

        return res.json({
            payments: payments.map((payment) => serializePayment(payment)),
        });
    } catch (error) {
        console.error("Payment history error:", error);
        return res.status(500).json({ message: "Failed to load payment history." });
    }
};
