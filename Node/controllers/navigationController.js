import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import CollegeApproval from "../models/CollegeApproval.js";
import DashboardAction from "../models/DashboardAction.js";
import AcademicEvent from "../models/AcademicEvent.js";

const BASE_MENU = {
    superadmin: [
        { title: "Dashboard", url: "/superadmin/dashboard" },
        { title: "Users", url: "/users" },
        { title: "Campuses", url: "/campuses" },
        { title: "Audit Logs", url: "/audit-logs" },
        { title: "Reports", url: "/reports" },
        { title: "Settings", url: "/settings" },
    ],
    collegeadmin: [
        { title: "Dashboard", url: "/collegeadmin/dashboard" },
        { title: "Departments", url: "/departments" },
        { title: "Staff", url: "/staff" },
        { title: "Students", url: "/students" },
        { title: "Courses", url: "/courses" },
        { title: "Reports", url: "/reports" },
    ],
    registrator: [
        { title: "Dashboard", url: "/registrator/dashboard" },
        { title: "Registrations", url: "/registrations" },
        { title: "Students", url: "/students" },
        { title: "Transcripts", url: "/transcripts" },
        { title: "Calendar", url: "/calendar" },
    ],
    finance: [
        { title: "Dashboard", url: "/finance/dashboard" },
        { title: "Payments", url: "/payments" },
        { title: "Fee Structure", url: "/fee-structure" },
        { title: "Reports", url: "/finance-reports" },
    ],
    lecturer: [
        { title: "Dashboard", url: "/lecturer/dashboard" },
        { title: "My Classes", url: "/my-classes" },
        { title: "Grades", url: "/grades" },
        { title: "Schedule", url: "/schedule" },
    ],
    student: [
        { title: "Dashboard", url: "/student/dashboard" },
        { title: "My Courses", url: "/my-courses" },
        { title: "Results", url: "/results" },
        { title: "Fees", url: "/fees" },
        { title: "Timetable", url: "/timetable" },
    ],
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
        return `${Math.floor(diffMs / hour)} hour${Math.floor(diffMs / hour) === 1 ? "" : "s"} ago`;
    }

    return `${Math.floor(diffMs / day)} day${Math.floor(diffMs / day) === 1 ? "" : "s"} ago`;
};

const resolveNotificationAreas = (role) => {
    if (role === "superadmin") {
        return ["finance", "collegeadmin"];
    }

    if (role === "finance") {
        return ["finance"];
    }

    if (role === "collegeadmin") {
        return ["collegeadmin"];
    }

    return [];
};

const getStudentNotifications = async (user) => {
    const notifications = [];
    const student = await Student.findOne({ email: user?.email }).lean();

    if (!student) {
        return notifications;
    }

    const feeBalance = Math.max(Number(student.totalFee || 0) - Number(student.paidAmount || 0), 0);

    if (feeBalance > 0) {
        notifications.push({
            id: `student-fee-balance-${student._id}`,
            title: "Fee balance reminder",
            description: `You still have an outstanding fee balance of KES ${feeBalance.toLocaleString()}.`,
            time: "Live",
            unread: true,
            area: "student",
            type: "warning",
        });
    }

    const upcomingEvents = await AcademicEvent.find({
        status: "scheduled",
        startDate: { $gte: new Date() },
    })
        .sort({ startDate: 1 })
        .limit(2)
        .lean();

    upcomingEvents.forEach((event) => {
        notifications.push({
            id: `student-event-${event._id}`,
            title: event.title,
            description: event.description || `${event.type} scheduled at ${event.location || "TBA"}.`,
            time: formatRelativeTime(event.startDate),
            unread: true,
            area: "student",
            type: event.type === "deadline" ? "warning" : "info",
        });
    });

    const recentPayments = await Payment.find({ student: student._id, status: "success" })
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();

    recentPayments.forEach((payment) => {
        notifications.push({
            id: `student-payment-${payment._id}`,
            title: "Payment received",
            description: `Your payment of KES ${Number(payment.amount || 0).toLocaleString()} was recorded successfully.`,
            time: formatRelativeTime(payment.createdAt),
            unread: Date.now() - new Date(payment.createdAt).getTime() < 24 * 60 * 60 * 1000,
            area: "student",
            type: "success",
        });
    });

    return notifications;
};

export const getSidebarNavigation = async (req, res) => {
    try {
        const role = req.user?.role;
        const items = BASE_MENU[role] || [];

        if (!items.length) {
            return res.json({ items: [] });
        }

        let badgeMap = {};

        if (role === "finance") {
            const [pendingPayments, overdueStudents] = await Promise.all([
                Payment.countDocuments({ status: "pending" }),
                Student.countDocuments({
                    $expr: { $gt: [{ $subtract: ["$totalFee", "$paidAmount"] }, 0] },
                }),
            ]);

            badgeMap = {
                Payments: pendingPayments > 0 ? String(pendingPayments) : null,
                "Fee Structure": overdueStudents > 0 ? `${overdueStudents} due` : null,
            };
        }

        if (role === "collegeadmin") {
            const [studentCount, pendingApprovals] = await Promise.all([
                Student.countDocuments(),
                CollegeApproval.countDocuments({ status: { $ne: "Approved" } }),
            ]);

            badgeMap = {
                Students: studentCount > 0 ? String(studentCount) : null,
                Reports: pendingApprovals > 0 ? String(pendingApprovals) : null,
            };
        }

        res.json({
            items: items.map((item) => ({
                ...item,
                badge: badgeMap[item.title] || null,
            })),
        });
    } catch (error) {
        console.error("Sidebar navigation error:", error);
        res.status(500).json({ message: "Failed to load sidebar navigation" });
    }
};

export const getHeaderNotifications = async (req, res) => {
    try {
        const role = req.user?.role;
        const areas = resolveNotificationAreas(role);
        const notifications = [];

        if (role === "finance" || role === "superadmin") {
            const [pendingPayments, overdueStudents] = await Promise.all([
                Payment.countDocuments({ status: "pending" }),
                Student.countDocuments({
                    $expr: { $gt: [{ $subtract: ["$totalFee", "$paidAmount"] }, 0] },
                }),
            ]);

            if (pendingPayments > 0) {
                notifications.push({
                    id: "finance-pending-payments",
                    title: "Pending finance transactions",
                    description: `${pendingPayments} payment transactions are still pending.`,
                    time: "Live",
                    unread: true,
                    area: "finance",
                });
            }

            if (overdueStudents > 0) {
                notifications.push({
                    id: "finance-overdue-students",
                    title: "Outstanding fee balances",
                    description: `${overdueStudents} students still have outstanding balances.`,
                    time: "Live",
                    unread: true,
                    area: "finance",
                });
            }
        }

        if (role === "collegeadmin" || role === "superadmin") {
            const [pendingApprovals, probationStudents] = await Promise.all([
                CollegeApproval.countDocuments({ status: { $ne: "Approved" } }),
                Student.countDocuments({
                    $expr: {
                        $and: [
                            { $gt: ["$totalFee", 0] },
                            {
                                $gt: [
                                    { $divide: [{ $subtract: ["$totalFee", "$paidAmount"] }, "$totalFee"] },
                                    0.5,
                                ],
                            },
                        ],
                    },
                }),
            ]);

            if (pendingApprovals > 0) {
                notifications.push({
                    id: "collegeadmin-pending-approvals",
                    title: "College approvals waiting",
                    description: `${pendingApprovals} approval requests still need review.`,
                    time: "Live",
                    unread: true,
                    area: "collegeadmin",
                });
            }

            if (probationStudents > 0) {
                notifications.push({
                    id: "collegeadmin-flagged-students",
                    title: "Students need attention",
                    description: `${probationStudents} students may require administrative follow-up.`,
                    time: "Live",
                    unread: true,
                    area: "collegeadmin",
                });
            }
        }

        if (areas.length > 0) {
            const recentActions = await DashboardAction.find({ area: { $in: areas } })
                .sort({ createdAt: -1 })
                .limit(8)
                .lean();

            recentActions.forEach((action) => {
                notifications.push({
                    id: action._id.toString(),
                    title: action.actionType
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase()),
                    description: action.message,
                    time: formatRelativeTime(action.createdAt),
                    unread: Date.now() - new Date(action.createdAt).getTime() < 24 * 60 * 60 * 1000,
                    area: action.area,
                });
            });
        }

        if (role === "student") {
            notifications.push(...await getStudentNotifications(req.user));
        }

        const dedupedNotifications = notifications
            .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index)
            .slice(0, 10);

        res.json({
            items: dedupedNotifications,
            unreadCount: dedupedNotifications.filter((item) => item.unread).length,
        });
    } catch (error) {
        console.error("Header notifications error:", error);
        res.status(500).json({ message: "Failed to load notifications" });
    }
};
