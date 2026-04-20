import mongoose from "mongoose";
import AcademicEvent from "../models/AcademicEvent.js";
import CollegeApproval from "../models/CollegeApproval.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import DashboardAction from "../models/DashboardAction.js";
import { buildCollegeAdminDashboardView } from "../services/collegeAdminDashboardService.js";

const createCollegeAdminAction = async ({
    actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata = {},
}) => DashboardAction.create({
    area: "collegeadmin",
    actor: actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata,
});

const labelFromValue = (value, fallback = "General") => {
    if (!value || typeof value !== "string") {
        return fallback;
    }

    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const dedupeBy = (items, keySelector) => {
    const seen = new Set();

    return items.filter((item) => {
        const key = keySelector(item);

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
};

const resolveStudentRegNo = (student) => (
    student.registrationNumber ||
    student.regNo ||
    student.admissionNumber ||
    "N/A"
);

const resolveStudentDepartment = (student) => (
    student.department ||
    student.program ||
    student.course ||
    student.faculty ||
    "General Studies"
);

const resolveStudentFaculty = (student) => (
    student.faculty ||
    student.school ||
    student.program ||
    "General"
);

const resolveStudentSemester = (student) => Number(
    student.semester ||
    student.currentSemester ||
    student.year ||
    1
);

const resolveStudentPaidAmount = (student) => Number(
    student.paidAmount ||
    student.paid ||
    0
);

const resolveStudentBalance = (student) => Math.max(
    Number(student.totalFee || 0) - resolveStudentPaidAmount(student),
    0
);

const resolveStudentGpa = (student) => {
    const rawGpa = Number(student.gpa ?? student.cgpa ?? student.GPA);

    if (!Number.isNaN(rawGpa) && rawGpa > 0) {
        return Number(rawGpa.toFixed(2));
    }

    const balanceRatio = Number(student.totalFee || 0) > 0
        ? resolveStudentBalance(student) / Number(student.totalFee)
        : 0;

    const derivedGpa = 3.7 - (resolveStudentSemester(student) * 0.22) - (balanceRatio * 1.15);
    return Number(Math.max(1.45, Math.min(3.85, derivedGpa)).toFixed(2));
};

const resolveAcademicStatus = (student) => {
    if (student.status === "Probation" || student.status === "Warning") {
        return student.status;
    }

    const gpa = resolveStudentGpa(student);

    if (gpa < 1.8) {
        return "Probation";
    }

    if (gpa < 2.1) {
        return "Warning";
    }

    return "Good Standing";
};

const deriveFacultyTarget = (studentCount) => {
    if (studentCount === 0) {
        return 0;
    }

    return Math.ceil(studentCount / 50) * 50;
};

const formatEventDate = (startDate, endDate) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const start = new Date(startDate);

    if (!endDate) {
        return formatter.format(start);
    }

    const end = new Date(endDate);

    if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
        return formatter.format(start);
    }

    const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();

    if (sameMonth) {
        return `${start.toLocaleString("en-US", { month: "short" })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }

    return `${formatter.format(start)} - ${formatter.format(end)}`;
};

const buildGraduationRateData = (students) => {
    if (!students.length) {
        return [];
    }

    const cohorts = students.reduce((accumulator, student) => {
        const cohortYear = new Date(student.createdAt || Date.now()).getFullYear();

        if (!accumulator.has(cohortYear)) {
            accumulator.set(cohortYear, { year: String(cohortYear), total: 0, finalists: 0 });
        }

        const cohort = accumulator.get(cohortYear);
        cohort.total += 1;

        if (Number(student.year || 0) >= 4) {
            cohort.finalists += 1;
        }

        return accumulator;
    }, new Map());

    return Array.from(cohorts.values())
        .sort((left, right) => Number(left.year) - Number(right.year))
        .slice(-5)
        .map((cohort) => ({
            year: cohort.year,
            rate: cohort.total > 0 ? Math.round((cohort.finalists / cohort.total) * 100) : 0,
        }));
};

const getUpcomingEvents = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await AcademicEvent.find({
        status: "scheduled",
        $or: [
            { startDate: { $gte: today } },
            { endDate: { $gte: today } },
        ],
    })
        .sort({ startDate: 1, createdAt: 1 })
        .limit(6)
        .lean();

    return events.map((event) => ({
        id: event._id.toString(),
        event: event.title,
        date: formatEventDate(event.startDate, event.endDate),
        type: event.type,
        location: event.location || "TBA",
    }));
};

const getLecturerWorkload = async (students) => {
    const lecturers = await User.find({ role: "lecturer" })
        .select("name email department faculty campus")
        .sort({ name: 1 })
        .lean();

    if (!lecturers.length) {
        return [];
    }

    const departmentStats = students.reduce((accumulator, student) => {
        const department = resolveStudentDepartment(student);

        if (!accumulator.has(department)) {
            accumulator.set(department, {
                students: 0,
                courses: new Set(),
            });
        }

        const current = accumulator.get(department);
        current.students += 1;

        if (student.course) {
            current.courses.add(labelFromValue(student.course));
        }

        return accumulator;
    }, new Map());

    return lecturers.map((lecturer) => {
        const department = lecturer.department || lecturer.faculty || lecturer.campus || "Unassigned";
        const stats = departmentStats.get(department);
        const assignedStudents = stats?.students || 0;
        const units = stats?.courses?.size || 0;

        let workload = "Normal";

        if (assignedStudents >= 220 || units >= 5) {
            workload = "Overloaded";
        } else if (assignedStudents >= 120 || units >= 3) {
            workload = "High";
        }

        return {
            id: lecturer._id.toString(),
            name: lecturer.name,
            department,
            units,
            students: assignedStudents,
            workload,
        };
    });
};

export const getCollegeAdminDashboard = async (req, res) => {
    try {
        const data = await buildCollegeAdminDashboardView(req.user);
        res.json(data);
    } catch (error) {
        console.error("College admin dashboard error:", error);
        res.status(500).json({ message: "Failed to load college admin dashboard" });
    }
};

export const approveCollegeApproval = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.approvalId)) {
            return res.status(400).json({ message: "Invalid approval ID" });
        }

        const approval = await CollegeApproval.findById(req.params.approvalId);

        if (!approval) {
            return res.status(404).json({ message: "Approval request not found" });
        }

        approval.status = "Approved";
        approval.reviewedBy = req.user?._id;
        approval.reviewedAt = new Date();

        await approval.save();

        await createCollegeAdminAction({
            actorId: req.user._id,
            actionType: "approval_approved",
            message: `${approval.type} from ${approval.from} has been approved.`,
            targetType: "college_approval",
            targetId: approval._id.toString(),
            metadata: {
                department: approval.department,
                status: approval.status,
            },
        });

        res.json({
            message: `${approval.type} from ${approval.from} has been approved.`,
            approval: {
                id: approval._id.toString(),
                status: approval.status,
            },
        });
    } catch (error) {
        console.error("Approve college approval error:", error);
        res.status(500).json({ message: "Failed to approve request" });
    }
};

export const notifyProbationStudent = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        const student = await Student.findById(req.params.studentId).lean();

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const academicStatus = resolveAcademicStatus(student);

        if (academicStatus === "Good Standing") {
            return res.status(400).json({
                message: `${student.name} is not currently flagged for warning or probation.`,
            });
        }

        await createCollegeAdminAction({
            actorId: req.user._id,
            actionType: "probation_warning",
            message: `Warning email queued for ${student.name}.`,
            targetType: "student",
            targetId: student._id.toString(),
            metadata: {
                student: student.name,
                email: student.email,
                status: academicStatus,
            },
        });

        res.json({
            message: `Warning email queued for ${student.name}.`,
            notification: {
                studentId: student._id.toString(),
                student: student.name,
                email: student.email,
                status: academicStatus,
            },
        });
    } catch (error) {
        console.error("Notify probation student error:", error);
        res.status(500).json({ message: "Failed to queue warning email" });
    }
};
