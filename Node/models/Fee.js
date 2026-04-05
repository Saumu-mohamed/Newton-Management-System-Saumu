import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    totalFee: Number,
    paidAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("Fee", feeSchema);