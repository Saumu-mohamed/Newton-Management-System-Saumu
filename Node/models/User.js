import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["superadmin", "collegeadmin", "lecturer", "student", "registrator", "finance"],
        default: "student",
        required: true,
    },
    department: {
        type: String,
        trim: true,
    },
    faculty: {
        type: String,
        trim: true,
    },
    campus: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    isFirstLogin: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    acknowledgedAlerts: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
