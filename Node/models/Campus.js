import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 0,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["Active", "Inactive", "Under Construction"],
            default: "Active",
        },
        established: {
            type: String,
            trim: true,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Campus", campusSchema);
