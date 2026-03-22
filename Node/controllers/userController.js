import bcrypt from "bcrypt";
import User from "../models/User.js";
import { roleHierarchy } from "../utils/roleHierachy.js";

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const creatorPower = roleHierarchy[req.user.role];
        const newUserPower = roleHierarchy[role];

        // Prevent creating higher or equal role
        if (creatorPower <= newUserPower) {
            return res.status(403).json({
                message: "You cannot create a user with equal or higher role.",
            });
        }
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Temporary password
        const tempPassword = "123456";

        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User created successfully",
            tempPassword,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};