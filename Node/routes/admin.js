import express from "express";


import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";


const router = express.Router();

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({ message: "Welcome Admin" });
    }
);

