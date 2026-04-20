import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        course: {
            type: String,
            required: true
        },

        year: {
            type: Number,
            required: true
        },
        campus: {
            type: String,
            trim: true,
            default: "Main"
        },
        status: {
            type: String,
            enum: ["Active", "Probation", "Suspended", "Graduated"],
            default: "Active"
        },
        registrationNumber: {
            type: String,
            required: true,
            unique: true
        },
        faculty: {
            type: String,
            required: true
        },
        totalFee: {
            type: Number,
            required: true
        },
        program: {
            type: String,
            required: true
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        lastPayment: {
            type: Date
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },
    { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
