import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    createAcademicCourse,
    createAcademicDepartment,
    createAcademicEvent,
    deleteAcademicCourse,
    deleteAcademicDepartment,
    getAcademicCalendar,
    getAcademicCourses,
    getAcademicDepartments,
    updateAcademicCourse,
    updateAcademicDepartment,
} from "../controllers/academicController.js";

const router = express.Router();

router.get("/courses", authMiddleware, getAcademicCourses);
router.post("/courses", authMiddleware, createAcademicCourse);
router.patch("/courses/:id", authMiddleware, updateAcademicCourse);
router.delete("/courses/:id", authMiddleware, deleteAcademicCourse);

router.get("/departments", authMiddleware, getAcademicDepartments);
router.post("/departments", authMiddleware, createAcademicDepartment);
router.patch("/departments/:id", authMiddleware, updateAcademicDepartment);
router.delete("/departments/:id", authMiddleware, deleteAcademicDepartment);

router.get("/calendar", authMiddleware, getAcademicCalendar);
router.post("/calendar", authMiddleware, createAcademicEvent);

export default router;
