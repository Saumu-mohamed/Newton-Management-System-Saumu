import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const authCookieName = "cms_auth";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

const getCookieOptions = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
});

export const loginUser = async (req, res) => {
    try {

        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id);

        res.cookie(authCookieName, token, getCookieOptions());

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
                department: user.department || null,
                faculty: user.faculty || null,
                campus: user.campus || null,
                phone: user.phone || null,
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isFirstLogin: req.user.isFirstLogin,
            department: req.user.department || null,
            faculty: req.user.faculty || null,
            campus: req.user.campus || null,
            phone: req.user.phone || null,
        },
    });
};

export const logoutUser = async (_req, res) => {
    res.clearCookie(authCookieName, getCookieOptions());
    res.json({ message: "Logged out successfully" });
};
export const changePassword = async (req, res) => {
    try {

        const { newPassword } = req.body;

        if (!newPassword || String(newPassword).length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(req.user.id, {
            password: hashedPassword,
            isFirstLogin: false
        });

        res.json({ message: "Password changed successfully" });

    } catch (error) {

        res.status(500).json({ message: "Server error" });

    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (!name || String(name).trim().length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters." });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = String(name).trim();
        user.phone = phone?.trim() || "";
        await user.save();

        await Student.findOneAndUpdate(
            { email: user.email },
            { $set: { name: user.name } }
        );

        res.json({
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
                department: user.department || null,
                faculty: user.faculty || null,
                campus: user.campus || null,
                phone: user.phone || null,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
