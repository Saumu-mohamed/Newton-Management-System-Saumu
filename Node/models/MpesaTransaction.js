import mongoose from "mongoose";

const mpesaSchema = new mongoose.Schema({
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    phone: String,
    amount: Number,
    reference: String,
    transactionRef: String,
    transactionId: String,
    status: String,
    merchantRequestID: String,
    checkoutRequestID: String,
    mpesaReceiptNumber: String,
    resultCode: Number,
    resultDesc: String,
    callbackMetadata: mongoose.Schema.Types.Mixed,
    timestamp: Date
}, { timestamps: true });

export default mongoose.model("MpesaTransaction", mpesaSchema);
