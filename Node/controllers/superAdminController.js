import bcrypt from "bcryptjs";
import CollegeApproval from "../models/CollegeApproval.js";
import DashboardAction from "../models/DashboardAction.js";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { buildSuperAdminDashboardView } from "../services/superAdminDashboardService.js";

const createSuperAdminAction = async ({
    actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata = {},
}) => DashboardAction.create({
    area: "superadmin",
    actor: actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata,
});

const buildTemporaryPassword = () => {
    const randomToken = Math.random().toString(36).slice(-6).toUpperCase();
    return `Reset${randomToken}!`;
};

const formatRelativeTime = (dateValue) => {
    const timestamp = new Date(dateValue).getTime();
    const diffMs = Math.max(0, Date.now() - timestamp);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) {
        return "Just now";
    }

    if (diffMs < hour) {
        return `${Math.floor(diffMs / minute)} min ago`;
    }

    if (diffMs < day) {
        const hours = Math.floor(diffMs / hour);
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(diffMs / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
};

const getCampusName = (value) => value || "Main Campus";

const getApprovalPriority = (approval) => {
    const normalizedStatus = String(approval.status || "").toLowerCase();

    if (normalizedStatus === "urgent") {
        return "High";
    }

    if (normalizedStatus === "review") {
        return "Medium";
    }

    return "Low";
};

const getUserStatus = (user) => {
    if (!user.isActive) {
        return "Suspended";
    }

    if (user.isFirstLogin) {
        return "Pending";
    }

    return "Active";
};

const getAlertType = (severity) => {
    if (severity === "error") {
        return "error";
    }

    if (severity === "warning") {
        return "warning";
    }

    return "info";
};

const getAlertStatus = (message = "") => {
    const normalized = message.toLowerCase();

    if (normalized.includes("failed") || normalized.includes("error")) {
        return "error";
    }

    if (normalized.includes("pending") || normalized.includes("warning")) {
        return "warning";
    }

    return "info";
};

export const getSuperAdminDashboard = async (req, res) => {
    try {
        const data = await buildSuperAdminDashboardView(req.user);
        res.json(data);
    } catch (error) {
        console.error("Super admin dashboard error:", error);
        res.status(500).json({ message: "Failed to load super admin dashboard" });
    }
};

export const updateSuperAdminApprovalStatus = async (req, res) => {
    try {
        const { decision } = req.body;
        const normalizedDecision = String(decision || "").toLowerCase();

        if (!["approved", "rejected"].includes(normalizedDecision)) {
            return res.status(400).json({ message: "Decision must be approved or rejected." });
        }

        const approval = await CollegeApproval.findById(req.params.approvalId);

        if (!approval) {
            return res.status(404).json({ message: "Approval request not found" });
        }

        approval.status = normalizedDecision === "approved" ? "Approved" : "Rejected";
        approval.reviewedBy = req.user._id;
        approval.reviewedAt = new Date();
        await approval.save();

        await createSuperAdminAction({
            actorId: req.user._id,
            actionType: normalizedDecision === "approved" ? "approval_approved" : "approval_rejected",
            message: `${approval.type} from ${approval.from} was ${normalizedDecision} by super admin.`,
            targetType: "approval",
            targetId: approval._id.toString(),
            metadata: {
                approvalType: approval.type,
                source: approval.from,
                status: approval.status,
            },
        });

        res.json({
            message: `${approval.type} from ${approval.from} has been ${normalizedDecision}.`,
            approval: {
                id: approval._id.toString(),
                status: approval.status,
            },
        });
    } catch (error) {
        console.error("Update super admin approval status error:", error);
        res.status(500).json({ message: "Failed to process approval request" });
    }
};

export const updateSuperAdminUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({ message: "isActive must be a boolean value." });
        }

        if (String(req.params.userId) === String(req.user._id) && isActive === false) {
            return res.status(400).json({ message: "You cannot deactivate your own account." });
        }

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = isActive;
        await user.save();

        await createSuperAdminAction({
            actorId: req.user._id,
            actionType: isActive ? "user_unblocked" : "user_blocked",
            message: `${user.name} was ${isActive ? "re-activated" : "suspended"} by super admin.`,
            targetType: "user",
            targetId: user._id.toString(),
            metadata: {
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });

        res.json({
            message: `${user.name} has been ${isActive ? "re-activated" : "blocked"}.`,
            user: {
                id: user._id.toString(),
                isActive: user.isActive,
            },
        });
    } catch (error) {
        console.error("Update super admin user status error:", error);
        res.status(500).json({ message: "Failed to update user status" });
    }
};

export const resetSuperAdminUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const temporaryPassword = buildTemporaryPassword();
        user.password = await bcrypt.hash(temporaryPassword, 10);
        user.isFirstLogin = true;
        await user.save();

        await createSuperAdminAction({
            actorId: req.user._id,
            actionType: "password_reset",
            message: `Temporary password was issued for ${user.name}.`,
            targetType: "user",
            targetId: user._id.toString(),
            metadata: {
                email: user.email,
                role: user.role,
            },
        });

        res.json({
            message: `Password reset completed for ${user.name}.`,
            temporaryPassword,
            user: {
                id: user._id.toString(),
                email: user.email,
                isFirstLogin: user.isFirstLogin,
            },
        });
    } catch (error) {
        console.error("Reset super admin user password error:", error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};

export const acknowledgeSuperAdminAlert = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { acknowledgedAlerts: req.params.alertId } },
            { new: true }
        );

        await createSuperAdminAction({
            actorId: req.user._id,
            actionType: "alert_acknowledged",
            message: `System alert ${req.params.alertId} was acknowledged.`,
            targetType: "system_alert",
            targetId: req.params.alertId,
            metadata: {
                alertId: req.params.alertId,
            },
        });

        res.json({
            message: "Alert acknowledged successfully.",
            alertId: req.params.alertId,
        });
    } catch (error) {
        console.error("Acknowledge super admin alert error:", error);
        res.status(500).json({ message: "Failed to acknowledge alert" });
    }
};
