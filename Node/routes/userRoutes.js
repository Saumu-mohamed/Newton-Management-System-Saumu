import express from "express";
import { createUser, deleteUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

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