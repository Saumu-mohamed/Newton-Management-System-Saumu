import bcrypt from "bcryptjs";
import CollegeApproval from "../models/CollegeApproval.js";
import DashboardAction from "../models/DashboardAction.js";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

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
        const [users, students, payments, approvals, actions] = await Promise.all([
            User.find().sort({ createdAt: -1 }).lean(),
            Student.find().sort({ createdAt: -1 }).lean(),
            Payment.find().sort({ createdAt: -1 }).lean(),
            CollegeApproval.find({ status: { $ne: "Approved" } }).sort({ createdAt: -1 }).lean(),
            DashboardAction.find().sort({ createdAt: -1 }).limit(20).populate("actor", "name email").lean(),
        ]);

        const userById = new Map(users.map((user) => [String(user._id), user]));
        const successfulPayments = payments.filter((payment) => String(payment.status).toLowerCase() === "success");
        const totalRevenue = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const totalOutstanding = students.reduce((sum, student) => (
            sum + Math.max(Number(student.totalFee || 0) - Number(student.paidAmount || 0), 0)
        ), 0);

        const campusMap = new Map();

        users.forEach((user) => {
            const campus = getCampusName(user.campus);

            if (!campusMap.has(campus)) {
                campusMap.set(campus, {
                    campus,
                    enrolled: 0,
                    collected: 0,
                    outstanding: 0,
                    staff: 0,
                });
            }

            if (user.role !== "student") {
                campusMap.get(campus).staff += 1;
            }
        });

        students.forEach((student) => {
            const creator = student.createdBy ? userById.get(String(student.createdBy)) : null;
            const campus = getCampusName(creator?.campus);

            if (!campusMap.has(campus)) {
                campusMap.set(campus, {
                    campus,
                    enrolled: 0,
                    collected: 0,
                    outstanding: 0,
                    staff: 0,
                });
            }

            const current = campusMap.get(campus);
            current.enrolled += 1;
            current.collected += Number(student.paidAmount || 0);
            current.outstanding += Math.max(Number(student.totalFee || 0) - Number(student.paidAmount || 0), 0);
        });

        const enrollmentMap = new Map();
        const now = new Date();

        for (let offset = 5; offset >= 0; offset -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            const key = `${date.getFullYear()}-${date.getMonth()}`;

            enrollmentMap.set(key, {
                month: date.toLocaleString("en-US", { month: "short" }),
                students: 0,
                lecturers: 0,
            });
        }

        students.forEach((student) => {
            const createdAt = new Date(student.createdAt);
            const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;

            if (enrollmentMap.has(key)) {
                enrollmentMap.get(key).students += 1;
            }
        });

        users
            .filter((user) => user.role === "lecturer")
            .forEach((lecturer) => {
                const createdAt = new Date(lecturer.createdAt);
                const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;

                if (enrollmentMap.has(key)) {
                    enrollmentMap.get(key).lecturers += 1;
                }
            });

        const roleCounts = users.reduce((accumulator, user) => {
            accumulator[user.role] = (accumulator[user.role] || 0) + 1;
            return accumulator;
        }, {});

        const allUserRows = users
            .map((user) => ({
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                campus: getCampusName(user.campus),
                status: getUserStatus(user),
                lastLogin: formatRelativeTime(user.updatedAt || user.createdAt),
            }))
            .sort((left, right) => left.name.localeCompare(right.name))
            .slice(0, 20);

        const pendingApprovals = approvals.slice(0, 10).map((approval) => ({
            id: String(approval._id),
            name: approval.from,
            type: approval.type,
            campus: approval.department || "General",
            date: new Date(approval.date || approval.createdAt).toISOString().split("T")[0],
            priority: getApprovalPriority(approval),
        }));

        const urgentActionCount = approvals.filter((approval) => getApprovalPriority(approval) === "High").length;
        const activeUsers = users.filter((user) => user.isActive !== false).length;
        const suspendedUsers = users.filter((user) => user.isActive === false).length;
        const dormantUsers = users.filter((user) => user.isFirstLogin).length;
        const readyForGraduation = students.filter((student) => Number(student.year || 0) >= 4).length;

        const recentAuditLogs = actions.slice(0, 8).map((action) => {
            const severity = getAlertStatus(action.message);

            return {
                id: String(action._id),
                action: action.actionType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
                user: action.actor?.email || action.actor?.name || action.area,
                ip: action.area.toUpperCase(),
                time: formatRelativeTime(action.createdAt),
                status: severity === "error" ? "failed" : severity === "warning" ? "warning" : "success",
                details: action.message,
            };
        });

        const acknowledgedAlerts = new Set(req.user?.acknowledgedAlerts || []);
        const systemAlerts = [];
        const failedPayments = payments.filter((payment) => String(payment.status).toLowerCase() === "failed").length;

        if (failedPayments > 0) {
            systemAlerts.push({
                id: "failed-payments",
                type: "error",
                title: "Failed payment transactions",
                message: `${failedPayments} payment records are currently marked as failed.`,
                time: "Live",
            });
        }

        if (approvals.length > 0) {
            systemAlerts.push({
                id: "pending-approvals",
                type: "warning",
                title: "Administrative approvals pending",
                message: `${approvals.length} approval requests still require action.`,
                time: "Live",
            });
        }

        if (dormantUsers > 0) {
            systemAlerts.push({
                id: "pending-onboarding",
                type: "info",
                title: "User onboarding pending",
                message: `${dormantUsers} users have not completed first login yet.`,
                time: "Live",
            });
        }

        actions.slice(0, 2).forEach((action) => {
            systemAlerts.push({
                id: `action-${action._id}`,
                type: getAlertType(getAlertStatus(action.message)),
                title: action.actionType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
                message: action.message,
                time: formatRelativeTime(action.createdAt),
            });
        });

        const visibleAlerts = systemAlerts.filter((alert) => !acknowledgedAlerts.has(alert.id));

        const accountStatus = [
            { name: "Active", value: activeUsers },
            { name: "Pending", value: dormantUsers },
            { name: "Suspended", value: suspendedUsers },
            { name: "Students", value: students.length },
        ].filter((item) => item.value > 0);

        const userDistribution = [
            { name: "Students", value: students.length },
            { name: "Lecturers", value: roleCounts.lecturer || 0 },
            { name: "Admin Staff", value: (roleCounts.finance || 0) + (roleCounts.registrator || 0) + (roleCounts.collegeadmin || 0) + (roleCounts.superadmin || 0) },
        ].filter((item) => item.value > 0);

        res.json({
            overview: {
                title: "Super Admin Dashboard",
                subtitle: "System-Wide Monitoring & Governance",
                systemStatus: "Operational",
            },
            kpis: {
                totalIdentities: users.length + students.length,
                academicPopulation: students.length,
                campusCount: campusMap.size,
                actionPipeline: approvals.length,
                activeAccounts: activeUsers,
                dormantAccounts: dormantUsers,
                suspendedAccounts: suspendedUsers,
                institutionalRevenue: totalRevenue,
                readyForGraduation,
                urgentActionCount,
                totalOutstanding,
            },
            systemStatusCards: {
                coreEngine: "ONLINE",
                activePulse: `${activeUsers} USERS`,
                computeLoad: `${approvals.length} QUEUED`,
                securityAlerts: `${systemAlerts.length} URGENT`,
            },
            enrollmentData: Array.from(enrollmentMap.values()),
            campusComparison: Array.from(campusMap.values()).sort((left, right) => right.enrolled - left.enrolled),
            userDistribution,
            accountStatus,
            pendingApprovals,
            recentAuditLogs,
            systemAlerts: visibleAlerts.slice(0, 6),
            allUsers: allUserRows,
        });
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
