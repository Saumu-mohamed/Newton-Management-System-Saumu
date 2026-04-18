import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
    },
    method: {
        type: String,
        enum: ["mpesa", "bank", "cash", "card"],
        default: "mpesa",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
        index: true,
    },
    reference: {
        type: String,
        trim: true,
        default: "School Fees",
    },
    transactionId: {
        type: String,
        trim: true,
        default: null,
    },
    checkoutRequestId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    merchantRequestId: {
        type: String,
        trim: true,
        default: null,
    },
    transactionRef: {
        type: String,
        trim: true,
        default: null,
    },
    transactionReference: {
        type: String,
        trim: true,
        default: null,
    },
    resultCode: {
        type: Number,
        default: null,
    },
    resultDesc: {
        type: String,
        trim: true,
        default: null,
    },
    callbackMetadata: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    rawCallback: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    isCallbackProcessed: {
        type: Boolean,
        default: false,
        index: true,
    },
    callbackProcessedAt: {
        type: Date,
        default: null,
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
