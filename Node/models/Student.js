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

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },
    { timestamps: true }
);

export default mongoose.model("Student", studentSchema);