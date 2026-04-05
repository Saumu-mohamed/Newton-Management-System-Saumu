import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getCookieToken = (cookieHeader) => {
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";").map((entry) => entry.trim());
    const authCookie = cookies.find((entry) => entry.startsWith("cms_auth="));

    if (!authCookie) {
        return null;
    }

    return decodeURIComponent(authCookie.split("=")[1] || "");
};

const authMiddleware = async (req, res, next) => {
    let token = getCookieToken(req.headers.cookie);

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

export default authMiddleware;
