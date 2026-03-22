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
    isFirstLogin: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;