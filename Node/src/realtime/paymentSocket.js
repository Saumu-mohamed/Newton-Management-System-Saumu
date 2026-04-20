import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

let ioInstance = null;

const getSocketToken = (socket) => {
    const bearerToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!bearerToken) {
        return null;
    }

    if (String(bearerToken).startsWith("Bearer ")) {
        return String(bearerToken).slice(7);
    }

    return bearerToken;
};

export const initializePaymentSocket = (server) => {
    ioInstance = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:8080",
            credentials: true,
        },
    });

    ioInstance.use(async (socket, next) => {
        try {
            const token = getSocketToken(socket);

            if (!token) {
                return next(new Error("Authentication token missing"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password").lean();

            if (!user) {
                return next(new Error("Authenticated user not found"));
            }

            socket.data.user = user;
            return next();
        } catch (error) {
            return next(new Error("Socket authentication failed"));
        }
    });

    ioInstance.on("connection", (socket) => {
        const user = socket.data.user;
        socket.join(`user:${user._id}`);

        if (user.role === "finance" || user.role === "superadmin") {
            socket.join("finance:payments");
        }
    });

    return ioInstance;
};

export const emitPaymentUpdate = (paymentPayload) => {
    if (!ioInstance || !paymentPayload?.userId) {
        return;
    }

    ioInstance.to(`user:${paymentPayload.userId}`).emit("payment:updated", paymentPayload);
    ioInstance.to("finance:payments").emit("finance:payment-updated", paymentPayload);
};

export const getPaymentSocket = () => ioInstance;
