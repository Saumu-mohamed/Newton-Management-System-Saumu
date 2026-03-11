import express from "express";
import { loginUser, changePassword } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import { deleteUser } from "../controllers/userController.js";
import { createUser } from "../controllers/userController.js";

const router = express.Router();


router.post("/login", loginUser);
router.post("/change-password", authMiddleware, changePassword);

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