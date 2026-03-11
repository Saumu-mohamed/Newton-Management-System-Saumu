import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const existing = await User.findOne({ role: "superadmin" });
if (existing) {
    console.log("Super Admin already exists");
    process.exit();
}

const hashedPassword = await bcrypt.hash("superadmin123", 10);

await User.create({
    name: "super Admin",
    email: "superadmin@school.com",
    password: hashedPassword,
    role: "superadmin",
    isFirstLogin: false,
});
console.log("Super Admin created successfully ");