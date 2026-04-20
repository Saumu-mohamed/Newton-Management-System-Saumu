import mongoose from "mongoose";

const academicResultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        semester: {
            type: String,
            required: true,
            trim: true,
        },
        unitCode: {
            type: String,
            required: true,
            trim: true,
        },
        unitName: {
            type: String,
            required: true,
            trim: true,
        },
        catScore: {
            type: Number,
            default: 0,
        },
        cat1Score: {
            type: Number,
            default: 0,
        },
        cat2Score: {
            type: Number,
            default: 0,
        },
        assignmentScore: {
            type: Number,
            default: 0,
        },
        examScore: {
            type: Number,
            default: 0,
        },
        totalScore: {
            type: Number,
            default: 0,
        },
        lecturer: {
            type: String,
            trim: true,
            default: "TBA",
        },
        grade: {
            type: String,
            trim: true,
            default: "N/A",
        },
        points: {
            type: Number,
            default: 0,
        },
        credits: {
            type: Number,
            default: 0,
        },
        publishedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Draft", "Submitted", "Published"],
            default: "Published",
        },
        submittedAt: {
            type: Date,
        },
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("AcademicResult", academicResultSchema);
