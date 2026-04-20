import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        department: {
            type: String,
            trim: true,
            default: "General",
        },
        faculty: {
            type: String,
            trim: true,
            default: "General",
        },
        semester: {
            type: String,
            trim: true,
            default: "Current Semester",
        },
        credits: {
            type: Number,
            default: 0,
        },
        lecturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["Active", "Archived"],
            default: "Active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
