import express from "express";
import http from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import financeRoutes from "./routes/financeRoute.js";
import collegeAdminRoutes from "./routes/collegeAdminRoutes.js";
import navigationRoutes from "./routes/navigationRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import adminUtilityRoutes from "./routes/adminUtilityRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import { initializePaymentSocket } from "./src/realtime/paymentSocket.js";


dotenv.config();

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_URL || "http://localhost:8080";

connectDB();

// Middleware
app.use(express.json());

app.use(cors({
    origin: clientOrigin,
    credentials: true
}));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/collegeadmin", collegeAdminRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/admin-utils", adminUtilityRoutes);
app.use("/api/payments", paymentRoutes);

// Test Route
app.get("/", (req, res) => res.send("Backend Running"));

const PORT = process.env.PORT || 5000;

initializePaymentSocket(server);

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
