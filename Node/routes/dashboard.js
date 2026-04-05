import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getCollegeAdminDashboard } from "../controllers/collegeAdminController.js";
import { getFinanceDashboard } from "../controllers/financeController.js";
import {
    getLecturerClasses,
    getLecturerDashboard,
    getLecturerGradebook,
    queueLecturerStudentAlerts,
    saveLecturerGrades,
    submitLecturerGrades,
} from "../controllers/lecturerController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
    approvePrerequisiteOverride,
    decideStudentRegistration,
    generateGraduationList,
    getRegistratorCourseRegistrations,
    getRegistratorDashboard,
    getTranscriptPreview,
    getTranscriptRequests,
    reviewStudentRegistration,
    updateTranscriptRequestStatus,
} from "../controllers/registratorController.js";
import { getStudentDashboard } from "../controllers/studentController.js";
import {
    acknowledgeSuperAdminAlert,
    getSuperAdminDashboard,
    resetSuperAdminUserPassword,
    updateSuperAdminApprovalStatus,
    updateSuperAdminUserStatus,
} from "../controllers/superAdminController.js";

const router = express.Router();

router.get(
    "/superadmin",
    authMiddleware,
    roleMiddleware("superadmin"),
    (req, res) => res.json({ message: "Welcome SuperAdmin" })
);

router.get(
    "/superadmin/overview",
    authMiddleware,
    roleMiddleware("superadmin"),
    getSuperAdminDashboard
);

router.post(
    "/superadmin/approvals/:approvalId/decision",
    authMiddleware,
    roleMiddleware("superadmin"),
    updateSuperAdminApprovalStatus
);

router.patch(
    "/superadmin/users/:userId/status",
    authMiddleware,
    roleMiddleware("superadmin"),
    updateSuperAdminUserStatus
);

router.post(
    "/superadmin/users/:userId/reset-password",
    authMiddleware,
    roleMiddleware("superadmin"),
    resetSuperAdminUserPassword
);

router.post(
    "/superadmin/alerts/:alertId/acknowledge",
    authMiddleware,
    roleMiddleware("superadmin"),
    acknowledgeSuperAdminAlert
);

router.get(
    "/collegeadmin",
    authMiddleware,
    roleMiddleware("collegeadmin"),
    (req, res) => res.json({ message: "Welcome College Admin" })
);

router.get(
    "/collegeadmin/overview",
    authMiddleware,
    roleMiddleware("collegeadmin"),
    getCollegeAdminDashboard
);

router.get(
    "/lecturer",
    authMiddleware,
    roleMiddleware("lecturer"),
    (req, res) => res.json({ message: "Welcome Lecturer" })
);

router.get(
    "/lecturer/overview",
    authMiddleware,
    roleMiddleware("lecturer"),
    getLecturerDashboard
);

router.post(
    "/lecturer/alerts/notify",
    authMiddleware,
    roleMiddleware("lecturer"),
    queueLecturerStudentAlerts
);

router.get(
    "/lecturer/classes",
    authMiddleware,
    roleMiddleware("lecturer"),
    getLecturerClasses
);

router.get(
    "/lecturer/grades",
    authMiddleware,
    roleMiddleware("lecturer"),
    getLecturerGradebook
);

router.put(
    "/lecturer/grades/:unitCode/draft",
    authMiddleware,
    roleMiddleware("lecturer"),
    saveLecturerGrades
);

router.post(
    "/lecturer/grades/:unitCode/submit",
    authMiddleware,
    roleMiddleware("lecturer"),
    submitLecturerGrades
);

router.get(
    "/student",
    authMiddleware,
    roleMiddleware("student"),
    (req, res) => res.json({ message: "Welcome Student" })
);

router.get(
    "/student/overview",
    authMiddleware,
    roleMiddleware("student"),
    getStudentDashboard
);

router.get(
    "/registrator",
    authMiddleware,
    roleMiddleware("registrator"),
    (req, res) => res.json({ message: "Welcome Registrator" })
);

router.get(
    "/registrator/overview",
    authMiddleware,
    roleMiddleware("registrator"),
    getRegistratorDashboard
);

router.post(
    "/registrator/registrations/:studentId/review",
    authMiddleware,
    roleMiddleware("registrator"),
    reviewStudentRegistration
);

router.get(
    "/registrator/registrations",
    authMiddleware,
    roleMiddleware("registrator"),
    getRegistratorCourseRegistrations
);

router.patch(
    "/registrator/registrations/:studentId/decision",
    authMiddleware,
    roleMiddleware("registrator"),
    decideStudentRegistration
);

router.post(
    "/registrator/registrations/:registrationId/override",
    authMiddleware,
    roleMiddleware("registrator"),
    approvePrerequisiteOverride
);

router.post(
    "/registrator/graduation/finalize",
    authMiddleware,
    roleMiddleware("registrator"),
    generateGraduationList
);

router.get(
    "/registrator/transcripts",
    authMiddleware,
    roleMiddleware("registrator"),
    getTranscriptRequests
);

router.get(
    "/registrator/transcripts/:documentId/preview",
    authMiddleware,
    roleMiddleware("registrator"),
    getTranscriptPreview
);

router.patch(
    "/registrator/transcripts/:documentId/status",
    authMiddleware,
    roleMiddleware("registrator"),
    updateTranscriptRequestStatus
);

router.get(
    "/finance",
    authMiddleware,
    roleMiddleware("finance"),
    (req, res) => res.json({ message: "Welcome Finance" })
);

router.get(
    "/finance/overview",
    authMiddleware,
    roleMiddleware("finance"),
    getFinanceDashboard
);

export default router;
