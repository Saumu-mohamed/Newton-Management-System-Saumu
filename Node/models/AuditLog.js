import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            trim: true,
            default: "System",
        },
        ip: {
            type: String,
            trim: true,
            default: "Unknown",
        },
        status: {
            type: String,
            enum: ["success", "failed", "warning"],
            default: "success",
        },
        details: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: String,
            trim: true,
            default: "general",
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
