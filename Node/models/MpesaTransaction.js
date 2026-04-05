import mongoose from "mongoose";

const mpesaSchema = new mongoose.Schema({
    phone: String,
    amount: Number,
    transactionRef: String,
    status: String,
    checkoutRequestID: String,
    mpesaReceiptNumber: String,
    resultCode: Number,
    resultDesc: String,
    timestamp: Date
}, { timestamps: true });

export default mongoose.model("MpesaTransaction", mpesaSchema);