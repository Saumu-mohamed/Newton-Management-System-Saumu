import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";


dotenv.config();

const app = express();


connectDB();

// Middleware
app.use(express.json());

app.use(cors({
    origin: "http://localhost:8080",
    credentials: true
}));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);

// Test Route
app.get("/", (req, res) => res.send("Backend Running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);




