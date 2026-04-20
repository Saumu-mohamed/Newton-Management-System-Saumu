import mongoose from "mongoose";

const courseRegistrationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        lecturer: {
            type: String,
            trim: true,
            default: "TBA",
        },
        credits: {
            type: Number,
            default: 0,
        },
        day: {
            type: String,
            trim: true,
            default: "TBA",
        },
        time: {
            type: String,
            trim: true,
            default: "TBA",
        },
        room: {
            type: String,
            trim: true,
            default: "TBA",
        },
        status: {
            type: String,
            enum: ["Active", "Dropped", "Completed"],
            default: "Active",
        },
        reviewStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        reviewedAt: {
            type: Date,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        rejectionReason: {
            type: String,
            trim: true,
            default: "",
        },
        department: {
            type: String,
            trim: true,
            default: "General",
        },
        semester: {
            type: String,
            trim: true,
            default: "Current Semester",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        overrideStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        overrideApprovedAt: {
            type: Date,
        },
        overrideApprovedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        overrideNotes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.model("CourseRegistration", courseRegistrationSchema);
