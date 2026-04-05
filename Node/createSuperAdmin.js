import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const bootstrapSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const existing = await User.findOne({ role: "superadmin" });

        if (existing) {
            console.log(`Super Admin already exists: ${existing.email}`);
            return;
        }

        const password = process.env.SUPERADMIN_PASSWORD || "Password123!";
        const email = process.env.SUPERADMIN_EMAIL || "superadmin@cms.edu";
        const name = process.env.SUPERADMIN_NAME || "Super Admin";
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: "superadmin",
            isFirstLogin: false,
        });

        console.log(`Super Admin created successfully: ${email}`);
    } catch (error) {
        console.error("Failed to bootstrap super admin:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

bootstrapSuperAdmin();
