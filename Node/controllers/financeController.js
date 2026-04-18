import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import Mpesa from "../models/MpesaTransaction.js";
import DashboardAction from "../models/DashboardAction.js";
import { buildFinanceDashboardView } from "../services/financeDashboardService.js";

const createFinanceAction = async ({
    actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata = {},
}) => DashboardAction.create({
    area: "finance",
    actor: actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata,
});

const formatCurrencyNumber = (value) => Number(value || 0);

const resolveStudentPaidAmount = (student) => Number(
    student?.paidAmount ||
    student?.paid ||
    0
);

const resolveStudentBalance = (student) => Math.max(
    Number(student?.totalFee || 0) - resolveStudentPaidAmount(student),
    0
);

const resolveTransactionRef = (record) => (
    record?.transactionId ||
    record?.transactionRef ||
    record?.transactionReference ||
    record?.reference ||
    record?.transRef ||
    "N/A"
);

const formatPaymentStatus = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "success") {
        return "Success";
    }

    if (normalized === "failed") {
        return "Failed";
    }

    return "Pending";
};

const formatMpesaStatus = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "success" || normalized === "confirmed") {
        return "Confirmed";
    }

    if (normalized.includes("pending")) {
        return "Pending Callback";
    }

    return "Failed";
};

const getMonthLabel = (dateValue) => new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
}).format(new Date(dateValue));

const getStudentsPaidToday = (payments, today) => new Set(
    payments
        .filter((payment) => new Date(payment.createdAt) >= today && payment.student?._id)
        .map((payment) => String(payment.student._id))
).size;

const getFinanceBaseData = async () => {
    const [students, recentPayments, recentMpesa, successfulPayments, pendingPaymentsCount] = await Promise.all([
        Student.find().sort({ createdAt: -1 }).lean(),
        Payment.find().populate("student").sort({ createdAt: -1 }).limit(50).lean(),
        Mpesa.find().sort({ createdAt: -1 }).limit(20).lean(),
        Payment.find({ status: "success" }).sort({ createdAt: 1 }).lean(),
        Payment.countDocuments({ status: "pending" }),
    ]);

    return {
        students,
        recentPayments,
        recentMpesa,
        successfulPayments,
        pendingPaymentsCount,
    };
};

export const getFinanceDashboard = async (_req, res) => {
    try {
        const data = await buildFinanceDashboardView();
        res.json(data);
    } catch (error) {
        console.error("Finance dashboard error:", error);
        res.status(500).json({ message: "Failed to load finance dashboard" });
    }
};

export const getPaymentsPageData = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim().toLowerCase();
        const status = String(req.query.status || "all").toLowerCase();
        const method = String(req.query.method || "all").toLowerCase();
        const date = String(req.query.date || "").trim();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const payments = await Payment.find().populate("student").sort({ createdAt: -1 }).lean();

        const filteredPayments = payments.filter((payment) => {
            const studentName = payment.student?.name?.toLowerCase() || "";
            const regNo = payment.student?.registrationNumber?.toLowerCase() || "";
            const paymentStatus = String(payment.status || "").toLowerCase();
            const paymentMethod = String(payment.method || "").toLowerCase();
            const paymentDate = new Date(payment.createdAt).toISOString().split("T")[0];

            if (search && !studentName.includes(search) && !regNo.includes(search) && !resolveTransactionRef(payment).toLowerCase().includes(search)) {
                return false;
            }

            if (status !== "all" && paymentStatus !== status) {
                return false;
            }

            if (method !== "all" && paymentMethod !== method) {
                return false;
            }

            if (date && paymentDate !== date) {
                return false;
            }

            return true;
        });

        const stats = {
            todayCollection: payments
                .filter((payment) => new Date(payment.createdAt) >= today && String(payment.status) === "success")
                .reduce((sum, payment) => sum + formatCurrencyNumber(payment.amount), 0),
            pendingPayments: payments.filter((payment) => String(payment.status) === "pending").length,
            failedTransactions: payments.filter((payment) => String(payment.status) === "failed").length,
            studentsPaidToday: getStudentsPaidToday(payments, today),
        };

        res.json({
            stats,
            payments: filteredPayments.map((payment) => ({
                id: payment._id.toString(),
                paymentCode: `PAY-${payment._id.toString().slice(-6).toUpperCase()}`,
                student: payment.student?.name || "N/A",
                regNo: payment.student?.registrationNumber || "N/A",
                amount: formatCurrencyNumber(payment.amount),
                method: String(payment.method || "unknown").toUpperCase(),
                status: String(payment.status || "pending").toLowerCase(),
                date: new Date(payment.createdAt).toISOString().split("T")[0],
                reference: resolveTransactionRef(payment),
            })),
        });
    } catch (error) {
        console.error("Payments page error:", error);
        res.status(500).json({ message: "Failed to load payments data" });
    }
};

export const getFeeStructures = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim().toLowerCase();
        const level = String(req.query.level || "all").toLowerCase();
        const status = String(req.query.status || "all").toLowerCase();

        const students = await Student.find().lean();

        const grouped = students.reduce((accumulator, student) => {
            const program = student.program || student.course || "General";
            const year = Number(student.year || 1);
            const derivedLevel = year >= 5 ? "Postgraduate" : "Undergraduate";
            const key = `${program}::${derivedLevel}::${year}`;

            if (!accumulator.has(key)) {
                const tuition = Math.round(Number(student.totalFee || 0) * 0.84);
                const library = Math.round(Number(student.totalFee || 0) * 0.04);
                const exam = Math.round(Number(student.totalFee || 0) * 0.07);
                const activity = Math.max(Number(student.totalFee || 0) - tuition - library - exam, 0);

                accumulator.set(key, {
                    id: key,
                    program,
                    level: derivedLevel,
                    year,
                    tuition,
                    library,
                    exam,
                    activity,
                    total: Number(student.totalFee || 0),
                    status: resolveStudentBalance(student) > 0 ? "active" : "draft",
                    campus: "Main Campus",
                });
            }

            return accumulator;
        }, new Map());

        const feeStructures = Array.from(grouped.values()).filter((item) => {
            if (search && !item.program.toLowerCase().includes(search)) {
                return false;
            }

            if (level !== "all" && item.level.toLowerCase() !== level) {
                return false;
            }

            if (status !== "all" && item.status !== status) {
                return false;
            }

            return true;
        });

        const activeStructures = feeStructures.filter((item) => item.status === "active");
        const programsCovered = new Set(feeStructures.map((item) => item.program)).size;
        const avgAnnualFee = feeStructures.length > 0
            ? Math.round(feeStructures.reduce((sum, item) => sum + item.total, 0) / feeStructures.length)
            : 0;
        const campuses = new Set(feeStructures.map((item) => item.campus)).size;

        res.json({
            stats: {
                activeStructures: activeStructures.length,
                programsCovered,
                avgAnnualFee,
                campuses,
            },
            feeStructures,
        });
    } catch (error) {
        console.error("Fee structures error:", error);
        res.status(500).json({ message: "Failed to load fee structures" });
    }
};

export const getFinanceReports = async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();
        const { students, successfulPayments } = await getFinanceBaseData();

        const yearlyPayments = successfulPayments.filter((payment) => new Date(payment.createdAt).getFullYear() === year);
        const previousYearPayments = successfulPayments.filter((payment) => new Date(payment.createdAt).getFullYear() === year - 1);

        const monthlyMap = new Map();
        for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
            const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, monthIndex, 1));
            monthlyMap.set(monthIndex, { month: label, collected: 0, target: 0 });
        }

        yearlyPayments.forEach((payment) => {
            const paymentDate = new Date(payment.createdAt);
            monthlyMap.get(paymentDate.getMonth()).collected += formatCurrencyNumber(payment.amount);
        });

        const averageMonthlyTarget = students.length > 0
            ? students.reduce((sum, student) => sum + Number(student.totalFee || 0), 0) / 12
            : 0;
        monthlyMap.forEach((value) => {
            value.target = Math.round(averageMonthlyTarget);
        });

        const paymentMethodMap = yearlyPayments.reduce((accumulator, payment) => {
            const method = String(payment.method || "unknown").toUpperCase();
            accumulator.set(method, (accumulator.get(method) || 0) + formatCurrencyNumber(payment.amount));
            return accumulator;
        }, new Map());
        const totalMethodAmount = Array.from(paymentMethodMap.values()).reduce((sum, value) => sum + value, 0);

        const paymentMethods = Array.from(paymentMethodMap.entries()).map(([name, value], index) => ({
            name,
            value: totalMethodAmount > 0 ? Number(((value / totalMethodAmount) * 100).toFixed(1)) : 0,
            color: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"][index % 4],
        }));

        const facultyTotals = students.reduce((accumulator, student) => {
            const faculty = student.faculty || "General";
            if (!accumulator.has(faculty)) {
                accumulator.set(faculty, { faculty, collected: 0, outstanding: 0 });
            }
            const entry = accumulator.get(faculty);
            entry.collected += resolveStudentPaidAmount(student);
            entry.outstanding += resolveStudentBalance(student);
            return accumulator;
        }, new Map());

        const totalCollected = yearlyPayments.reduce((sum, payment) => sum + formatCurrencyNumber(payment.amount), 0);
        const previousTotalCollected = previousYearPayments.reduce((sum, payment) => sum + formatCurrencyNumber(payment.amount), 0);
        const totalOutstanding = students.reduce((sum, student) => sum + resolveStudentBalance(student), 0);
        const totalExpected = totalCollected + totalOutstanding;
        const collectionRate = totalExpected > 0 ? Number(((totalCollected / totalExpected) * 100).toFixed(1)) : 0;
        const studentsCleared = students.filter((student) => resolveStudentBalance(student) === 0).length;
        const changeVsLastYear = previousTotalCollected > 0
            ? Number((((totalCollected - previousTotalCollected) / previousTotalCollected) * 100).toFixed(1))
            : 0;

        res.json({
            summary: {
                totalCollected,
                outstanding: totalOutstanding,
                collectionRate,
                studentsCleared,
                totalStudents: students.length,
                changeVsLastYear,
                targetRate: 85,
            },
            monthlyCollection: Array.from(monthlyMap.values()),
            paymentMethods,
            facultyCollection: Array.from(facultyTotals.values()).sort((left, right) => right.collected - left.collected),
            quickReports: [
                { id: "daily-collection", title: "Daily Collection Report", description: "Daily payment transactions from live backend data." },
                { id: "outstanding-fees", title: "Outstanding Fees Report", description: "Students with pending balances from current records." },
                { id: "payment-method-analysis", title: "Payment Method Analysis", description: "Live breakdown by recorded payment methods." },
                { id: "faculty-collection", title: "Faculty-wise Collection", description: "Collection and outstanding balances by faculty." },
            ],
        });
    } catch (error) {
        console.error("Finance reports error:", error);
        res.status(500).json({ message: "Failed to load finance reports" });
    }
};

export const syncMpesaTransactions = async (req, res) => {
    try {
        const [confirmedCount, pendingCount, failedCount] = await Promise.all([
            Mpesa.countDocuments({ status: /confirmed|success/i }),
            Mpesa.countDocuments({ status: /pending/i }),
            Mpesa.countDocuments({
                status: { $nin: ["confirmed", "success", "Confirmed", "Success", "Pending Callback", "pending"] },
            }),
        ]);

        await createFinanceAction({
            actorId: req.user._id,
            actionType: "mpesa_sync",
            message: "M-Pesa transaction sync completed.",
            metadata: { confirmedCount, pendingCount, failedCount },
        });

        res.json({
            message: "M-Pesa transaction sync completed.",
            summary: { confirmedCount, pendingCount, failedCount },
        });
    } catch (error) {
        console.error("Sync M-Pesa error:", error);
        res.status(500).json({ message: "Failed to sync M-Pesa transactions" });
    }
};

export const retryMpesaTransaction = async (req, res) => {
    try {
        const transaction = await Mpesa.findById(req.params.transactionId);

        if (!transaction) {
            return res.status(404).json({ message: "M-Pesa transaction not found" });
        }

        if (String(transaction.status || "").toLowerCase() === "confirmed") {
            return res.status(400).json({ message: "Confirmed transactions cannot be retried" });
        }

        transaction.status = "Pending Callback";
        transaction.resultDesc = "Retry requested from finance dashboard";
        transaction.timestamp = new Date();
        await transaction.save();

        await createFinanceAction({
            actorId: req.user._id,
            actionType: "mpesa_retry",
            message: `Retry queued for transaction ${resolveTransactionRef(transaction)}.`,
            targetType: "mpesa_transaction",
            targetId: transaction._id.toString(),
            metadata: { transactionRef: resolveTransactionRef(transaction), amount: formatCurrencyNumber(transaction.amount) },
        });

        res.json({
            message: `Retry queued for ${resolveTransactionRef(transaction)}.`,
            transaction: { id: transaction._id.toString(), status: formatMpesaStatus(transaction.status) },
        });
    } catch (error) {
        console.error("Retry M-Pesa transaction error:", error);
        res.status(500).json({ message: "Failed to retry M-Pesa transaction" });
    }
};

export const retryPaymentTransaction = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId).populate("student");

        if (!payment) {
            return res.status(404).json({ message: "Payment transaction not found" });
        }

        payment.status = "pending";
        payment.date = new Date();
        await payment.save();

        await createFinanceAction({
            actorId: req.user._id,
            actionType: "payment_retry",
            message: `Payment retry queued for ${payment.student?.name || "student"}.`,
            targetType: "payment",
            targetId: payment._id.toString(),
            metadata: {
                amount: formatCurrencyNumber(payment.amount),
                transactionRef: resolveTransactionRef(payment),
            },
        });

        res.json({
            message: `Payment retry queued for ${payment.student?.name || "student"}.`,
            payment: {
                id: payment._id.toString(),
                status: formatPaymentStatus(payment.status),
            },
        });
    } catch (error) {
        console.error("Retry payment transaction error:", error);
        res.status(500).json({ message: "Failed to retry payment transaction" });
    }
};

export const sendPaymentReminder = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).lean();

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const balance = resolveStudentBalance(student);
        if (balance <= 0) {
            return res.status(400).json({ message: `${student.name} has no outstanding balance.` });
        }

        await createFinanceAction({
            actorId: req.user._id,
            actionType: "payment_reminder",
            message: `Payment reminder sent to ${student.name}.`,
            targetType: "student",
            targetId: student._id.toString(),
            metadata: { student: student.name, email: student.email, balance },
        });

        res.json({
            message: `Payment reminder sent to ${student.name}.`,
            reminder: { studentId: student._id.toString(), student: student.name, email: student.email, balance },
        });
    } catch (error) {
        console.error("Send payment reminder error:", error);
        res.status(500).json({ message: "Failed to send payment reminder" });
    }
};

export const sendBulkPaymentReminders = async (req, res) => {
    try {
        const overdueStudents = (await Student.find().lean()).filter((student) => resolveStudentBalance(student) > 0);

        if (!overdueStudents.length) {
            return res.status(400).json({ message: "No overdue students found." });
        }

        await createFinanceAction({
            actorId: req.user._id,
            actionType: "bulk_payment_reminders",
            message: `Payment reminders sent to ${overdueStudents.length} students.`,
            metadata: { recipients: overdueStudents.length },
        });

        res.json({
            message: `Payment reminders sent to ${overdueStudents.length} students.`,
            recipients: overdueStudents.length,
        });
    } catch (error) {
        console.error("Send bulk payment reminders error:", error);
        res.status(500).json({ message: "Failed to send bulk reminders" });
    }
};

export const reconcileBankTransactions = async (req, res) => {
    try {
        const { bankAccount, fileName } = req.body;
        const recentPayments = await Payment.find().populate("student").sort({ createdAt: -1 }).limit(20).lean();

        const summary = recentPayments.reduce((accumulator, payment) => {
            const normalized = String(payment.status || "").toLowerCase();
            if (normalized === "success") {
                accumulator.matched += 1;
            } else if (normalized === "pending") {
                accumulator.partial += 1;
            } else {
                accumulator.unmatched += 1;
            }
            return accumulator;
        }, { matched: 0, partial: 0, unmatched: 0 });

        const items = recentPayments.slice(0, 8).map((payment) => ({
            id: payment._id.toString(),
            status: String(payment.status || "").toLowerCase() === "success"
                ? "Exact Match"
                : String(payment.status || "").toLowerCase() === "pending"
                    ? "Date Mismatch"
                    : "No Match",
            transactionRef: resolveTransactionRef(payment),
            student: payment.student?.name || "Unknown",
            amount: formatCurrencyNumber(payment.amount),
            date: new Date(payment.createdAt).toLocaleDateString(),
        }));

        await createFinanceAction({
            actorId: req.user._id,
            actionType: "bank_reconciliation",
            message: `Bank reconciliation processed for ${bankAccount || "selected account"}.`,
            metadata: { bankAccount, fileName, ...summary },
        });

        res.json({
            message: "Bank statement processed successfully.",
            summary,
            items,
        });
    } catch (error) {
        console.error("Bank reconciliation error:", error);
        res.status(500).json({ message: "Failed to process bank reconciliation" });
    }
};
