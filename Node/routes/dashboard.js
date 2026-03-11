import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/superadmin",
    authMiddleware,
    roleMiddleware("superadmin"),
    (req, res) => res.json({ message: "Welcome SuperAdmin" })
);

router.get(
    "/collegeadmin",
    authMiddleware,
    roleMiddleware("collegeadmin"),
    (req, res) => res.json({ message: "Welcome College Admin" })
);

router.get(
    "/lecturer",
    authMiddleware,
    roleMiddleware("lecturer"),
    (req, res) => res.json({ message: "Welcome Lecturer" })
);

router.get(
    "/student",
    authMiddleware,
    roleMiddleware("student"),
    (req, res) => res.json({ message: "Welcome Student" })
);

router.get(
    "/registrator",
    authMiddleware,
    roleMiddleware("registrator"),
    (req, res) => res.json({ message: "Welcome Registrator" })
);

router.get(
    "/finance",
    authMiddleware,
    roleMiddleware("finance"),
    (req, res) => res.json({ message: "Welcome Finance" })
);

export default router;