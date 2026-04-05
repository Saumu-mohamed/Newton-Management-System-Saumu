import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
    createCampus,
    createStaff,
    deleteCampus,
    deleteStaff,
    getAuditLogs,
    getCampuses,
    getReportData,
    getReportOverview,
    getSettings,
    getStaff,
    updateCampus,
    updateSettings,
    updateStaff,
} from "../controllers/adminUtilityController.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("collegeadmin"));

router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.patch("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

router.get("/campuses", getCampuses);
router.post("/campuses", createCampus);
router.patch("/campuses/:id", updateCampus);
router.delete("/campuses/:id", deleteCampus);

router.get("/audit-logs", getAuditLogs);

router.get("/settings", getSettings);
router.patch("/settings", updateSettings);

router.get("/reports", getReportOverview);
router.get("/reports/:reportKey", getReportData);

export default router;
