import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    amount: Number,
    method: {
        type: String,
        enum: ["mpesa", "bank", "cash", "card"]
    },
    transactionRef: String,
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },
    transactionReference: String,

    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
