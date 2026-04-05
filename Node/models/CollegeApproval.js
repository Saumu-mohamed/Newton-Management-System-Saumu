import mongoose from "mongoose";

const collegeApprovalSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },
        from: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Pending", "Urgent", "Review", "Approved", "Rejected"],
            default: "Pending",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.model("CollegeApproval", collegeApprovalSchema);
