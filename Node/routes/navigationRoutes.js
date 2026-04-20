import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getHeaderNotifications, getSidebarNavigation } from "../controllers/navigationController.js";

const router = express.Router();

router.get("/sidebar", authMiddleware, getSidebarNavigation);
router.get("/notifications", authMiddleware, getHeaderNotifications);

export default router;
