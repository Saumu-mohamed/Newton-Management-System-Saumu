import express from "express";
import {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentDashboard,
    initiateStudentPayment,
} from "../controllers/studentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("student"),
    getStudentDashboard
);

router.post(
    "/fees/payment",
    authMiddleware,
    roleMiddleware("student"),
    initiateStudentPayment
);

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("create:student"),
    createStudent
);

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("view:student"),
    getStudents
);

router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("view:student"),
    getStudentById
);

router.patch(
    "/:id",
    authMiddleware,
    permissionMiddleware("update:student"),
    updateStudent
);

router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("delete:student"),
    deleteStudent
);

export default router;
