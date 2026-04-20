import express from "express";
import {
    getCollegeAdminDashboard,
    approveCollegeApproval,
    notifyProbationStudent
} from "../controllers/collegeAdminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/overview",
    authMiddleware,
    roleMiddleware("collegeadmin"),
    getCollegeAdminDashboard
);

router.post(
    "/approvals/:approvalId/approve",
    authMiddleware,
    roleMiddleware("collegeadmin"),
    approveCollegeApproval
);

router.post(
    "/students/:studentId/notify-warning",
    authMiddleware,
    roleMiddleware("collegeadmin"),
    notifyProbationStudent
);

export default router;
