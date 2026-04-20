import express from "express";
import {
    changePassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    updateProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import { deleteUser } from "../controllers/userController.js";
import { createUser } from "../controllers/userController.js";

const router = express.Router();


router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logoutUser);
router.post("/change-password", authMiddleware, changePassword);
router.patch("/profile", authMiddleware, updateProfile);

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("create:user"),
    createUser
);



router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("delete:user"),
    deleteUser
);



export default router;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
