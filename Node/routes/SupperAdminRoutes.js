import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { createUser } from "../controllers/userController.js";

const router = express.Router();



router.get(
    "/superadmin/dashboard",
    authMiddleware,
    roleMiddleware("superadmin"),
    (req, res) => {
        res.json({ message: "Welcome Super Admin" });
    }
);

router.post(
    "/create-user",
    authMiddleware,
    roleMiddleware("superadmin", "collegeadmin"),
    createUser
);