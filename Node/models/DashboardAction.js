import mongoose from "mongoose";

const dashboardActionSchema = new mongoose.Schema(
    {
        area: {
            type: String,
            enum: ["finance", "collegeadmin", "superadmin", "registrator", "lecturer"],
            required: true,
        },
        actionType: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["completed", "failed"],
            default: "completed",
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetType: {
            type: String,
            trim: true,
        },
        targetId: {
            type: String,
            trim: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

export default mongoose.model("DashboardAction", dashboardActionSchema);
