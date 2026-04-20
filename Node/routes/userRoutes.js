import express from "express";
import {
    createUser,
    deleteUser,
    getUsers,
    importUsers,
    resetUserPassword,
    updateUser,
    updateUserStatus,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("create:user"),
    createUser
);

router.post(
    "/import",
    authMiddleware,
    permissionMiddleware("import:user"),
    importUsers
);

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("view:user"),
    getUsers
);

router.patch(
    "/:id",
    authMiddleware,
    permissionMiddleware("update:user"),
    updateUser
);

router.patch(
    "/:id/status",
    authMiddleware,
    permissionMiddleware("update:user"),
    updateUserStatus
);

router.post(
    "/:id/reset-password",
    authMiddleware,
    permissionMiddleware("update:user"),
    resetUserPassword
);

router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("delete:user"),
    deleteUser
);


export default router;
