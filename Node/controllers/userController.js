import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import { roleHierarchy } from "../utils/roleHierachy.js";

const ROLE_LABELS = {
    superadmin: "Super Admin",
    collegeadmin: "College Admin",
    lecturer: "Lecturer",
    student: "Student",
    registrator: "Registrar",
    finance: "Finance Officer",
};

const ROLE_INPUT_MAP = {
    "super admin": "superadmin",
    superadmin: "superadmin",
    "college admin": "collegeadmin",
    collegeadmin: "collegeadmin",
    lecturer: "lecturer",
    student: "student",
    registrar: "registrator",
    registrator: "registrator",
    "finance officer": "finance",
    finance: "finance",
};

const STATUS_INPUT_MAP = {
    active: true,
    inactive: false,
    suspended: false,
};

const normalizeRole = (value = "") => ROLE_INPUT_MAP[String(value).trim().toLowerCase()];

const buildTemporaryPassword = () => {
    const randomToken = Math.random().toString(36).slice(-6).toUpperCase();
    return `Temp${randomToken}!`;
};

const formatUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: ROLE_LABELS[user.role] || user.role,
    roleValue: user.role,
    campus: user.campus || "Main Campus",
    department: user.department || user.faculty || "General",
    faculty: user.faculty || "",
    status: user.isActive === false ? "Suspended" : "Active",
    phone: user.phone || "",
    createdAt: new Date(user.createdAt).toISOString().split("T")[0],
});

const validateCreatorCanManageRole = (actorRole, targetRole) => {
    const creatorPower = roleHierarchy[actorRole];
    const newUserPower = roleHierarchy[targetRole];

    return creatorPower > newUserPower;
};

const buildUserPayload = async (payload, actorRole, existingUser = null) => {
    const normalizedRole = normalizeRole(payload.role || existingUser?.role);

    if (!normalizedRole) {
        return { error: "Unsupported user role." };
    }

    if (!validateCreatorCanManageRole(actorRole, normalizedRole)) {
        return { error: "You cannot manage a user with equal or higher role." };
    }

    const userPayload = {
        name: payload.name?.trim(),
        email: payload.email?.trim().toLowerCase(),
        role: normalizedRole,
        department: payload.department?.trim() || "",
        faculty: payload.faculty?.trim() || "",
        campus: payload.campus?.trim() || "",
        phone: payload.phone?.trim() || "",
    };

    if (!userPayload.name || !userPayload.email || !userPayload.role) {
        return { error: "Name, email, and role are required." };
    }

    if (payload.status) {
        const isActive = STATUS_INPUT_MAP[String(payload.status).trim().toLowerCase()];
        userPayload.isActive = typeof isActive === "boolean" ? isActive : true;
    }

    return { userPayload };
};

export const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        const query = {};

        if (role && role !== "all") {
            const normalizedRole = normalizeRole(role);

            if (normalizedRole) {
                query.role = normalizedRole;
            }
        }

        if (status && status !== "all") {
            const normalizedStatus = STATUS_INPUT_MAP[String(status).toLowerCase()];

            if (typeof normalizedStatus === "boolean") {
                query.isActive = normalizedStatus;
            }
        }

        if (search?.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { email: { $regex: search.trim(), $options: "i" } },
                { department: { $regex: search.trim(), $options: "i" } },
                { campus: { $regex: search.trim(), $options: "i" } },
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 }).lean();
        const formattedUsers = users.map(formatUser);

        res.json({
            users: formattedUsers,
            stats: {
                total: formattedUsers.length,
                active: formattedUsers.filter((user) => user.status === "Active").length,
                suspended: formattedUsers.filter((user) => user.status === "Suspended").length,
                byRole: formattedUsers.reduce((accumulator, user) => {
                    accumulator[user.role] = (accumulator[user.role] || 0) + 1;
                    return accumulator;
                }, {}),
            },
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Failed to load users" });
    }
};

export const createUser = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { userPayload, error } = await buildUserPayload(req.body, req.user.role);

        if (error) {
            return res.status(400).json({ message: error });
        }

        let createdUser;
        let tempPassword;

        await session.withTransaction(async () => {
            const existingUser = await User.findOne({ email: userPayload.email }).session(session);

            if (existingUser) {
                throw new Error("User already exists");
            }

            tempPassword = buildTemporaryPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            const [user] = await User.create([{
                ...userPayload,
                password: hashedPassword,
                isFirstLogin: true,
                isActive: typeof userPayload.isActive === "boolean" ? userPayload.isActive : true,
            }], { session });

            createdUser = user;
        });

        res.status(201).json({
            message: "User created successfully",
            tempPassword,
            user: formatUser(createdUser),
        });
    } catch (error) {
        const message = error.message === "User already exists" ? error.message : "Server error";
        console.error("Create user error:", error);
        res.status(message === "User already exists" ? 400 : 500).json({ message });
    } finally {
        await session.endSession();
    }
};

export const importUsers = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const users = Array.isArray(req.body?.users) ? req.body.users : [];

        if (!users.length) {
            return res.status(400).json({ message: "No users supplied for import." });
        }

        const importedUsers = [];
        const skipped = [];

        await session.withTransaction(async () => {
            for (const candidate of users) {
                const { userPayload, error } = await buildUserPayload(candidate, req.user.role);

                if (error) {
                    skipped.push({ email: candidate.email || "Unknown", reason: error });
                    continue;
                }

                const exists = await User.findOne({ email: userPayload.email }).session(session);

                if (exists) {
                    skipped.push({ email: userPayload.email, reason: "User already exists" });
                    continue;
                }

                const tempPassword = buildTemporaryPassword();
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                const [createdUser] = await User.create([{
                    ...userPayload,
                    password: hashedPassword,
                    isFirstLogin: true,
                    isActive: typeof userPayload.isActive === "boolean" ? userPayload.isActive : true,
                }], { session });

                importedUsers.push({
                    ...formatUser(createdUser),
                    tempPassword,
                });
            }
        });

        res.status(201).json({
            message: `Imported ${importedUsers.length} users.`,
            users: importedUsers,
            skipped,
        });
    } catch (error) {
        console.error("Import users error:", error);
        res.status(500).json({ message: "Failed to import users" });
    } finally {
        await session.endSession();
    }
};

export const updateUser = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        let updatedUser;

        await session.withTransaction(async () => {
            const existingUser = await User.findById(req.params.id).session(session);

            if (!existingUser) {
                throw new Error("User not found");
            }

            const { userPayload, error } = await buildUserPayload(req.body, req.user.role, existingUser);

            if (error) {
                throw new Error(error);
            }

            const duplicateEmail = await User.findOne({
                email: userPayload.email,
                _id: { $ne: existingUser._id },
            }).session(session);

            if (duplicateEmail) {
                throw new Error("Another user already uses that email address.");
            }

            Object.assign(existingUser, userPayload);
            updatedUser = await existingUser.save({ session });
        });

        res.json({
            message: "User updated successfully",
            user: formatUser(updatedUser),
        });
    } catch (error) {
        const clientErrors = new Set([
            "User not found",
            "Unsupported user role.",
            "You cannot manage a user with equal or higher role.",
            "Name, email, and role are required.",
            "Another user already uses that email address.",
        ]);
        console.error("Update user error:", error);
        res.status(clientErrors.has(error.message) ? 400 : 500).json({
            message: clientErrors.has(error.message) ? error.message : "Server error",
        });
    } finally {
        await session.endSession();
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!validateCreatorCanManageRole(req.user.role, user.role)) {
            return res.status(403).json({ message: "You cannot manage a user with equal or higher role." });
        }

        const nextStatus = req.body?.isActive;
        user.isActive = typeof nextStatus === "boolean" ? nextStatus : !user.isActive;
        await user.save();

        res.json({
            message: `${user.name} has been ${user.isActive ? "activated" : "suspended"}.`,
            user: formatUser(user),
        });
    } catch (error) {
        console.error("Update user status error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const resetUserPassword = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!validateCreatorCanManageRole(req.user.role, user.role)) {
            return res.status(403).json({ message: "You cannot manage a user with equal or higher role." });
        }

        const tempPassword = buildTemporaryPassword();
        user.password = await bcrypt.hash(tempPassword, 10);
        user.isFirstLogin = true;
        await user.save();

        res.json({
            message: `Temporary password reset for ${user.email}.`,
            tempPassword,
            user: formatUser(user),
        });
    } catch (error) {
        console.error("Reset user password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!validateCreatorCanManageRole(req.user.role, user.role)) {
            return res.status(403).json({ message: "You cannot manage a user with equal or higher role." });
        }

        await user.deleteOne();

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
