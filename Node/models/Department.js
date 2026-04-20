import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        faculty: {
            type: String,
            trim: true,
            default: "General",
        },
        head: {
            type: String,
            trim: true,
            default: "TBA",
        },
        email: {
            type: String,
            trim: true,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["Active", "Inactive", "Under Review"],
            default: "Active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
