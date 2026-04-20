import AcademicEvent from "../models/AcademicEvent.js";
import CollegeApproval from "../models/CollegeApproval.js";
import DashboardAction from "../models/DashboardAction.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

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

export const buildCollegeAdminDashboardView = async (user) => {
    const students = await Student.find().sort({ createdAt: -1 }).lean();

    const [lecturers, approvals, upcomingEvents] = await Promise.all([
        getLecturerWorkload(students),
        CollegeApproval.find({ status: { $ne: "Approved" } })
            .sort({ date: -1, createdAt: -1 })
            .lean(),
        getUpcomingEvents(),
    ]);

    const totalStudents = students.length;

    const facultyMap = students.reduce((accumulator, student) => {
        const faculty = resolveStudentFaculty(student);

        if (!accumulator.has(faculty)) {
            accumulator.set(faculty, {
                faculty,
                students: 0,
            });
        }

        accumulator.get(faculty).students += 1;
        return accumulator;
    }, new Map());

    const enrollmentByFaculty = Array.from(facultyMap.values())
        .map((entry) => ({
            ...entry,
            target: deriveFacultyTarget(entry.students),
        }))
        .sort((left, right) => right.students - left.students);

    const departmentSeed = students.reduce((accumulator, student) => {
        const department = resolveStudentDepartment(student);
        const faculty = resolveStudentFaculty(student);
        const key = `${faculty}::${department}`;

        if (!accumulator.has(key)) {
            accumulator.set(key, {
                department,
                faculty,
                students: 0,
            });
        }

        accumulator.get(key).students += 1;
        return accumulator;
    }, new Map());

    const lecturerDepartmentCounts = lecturers.reduce((accumulator, lecturer) => {
        const department = lecturer.department || "Unassigned";
        accumulator[department] = (accumulator[department] || 0) + 1;
        return accumulator;
    }, {});

    const enrollmentByDepartment = Array.from(departmentSeed.values())
        .map((entry) => ({
            ...entry,
            lecturers: lecturerDepartmentCounts[entry.department] || 0,
        }))
        .sort((left, right) => right.students - left.students)
        .slice(0, 12);

    const totalTarget = enrollmentByFaculty.reduce((sum, entry) => sum + entry.target, 0);
    const enrollmentPercentage = totalTarget > 0 ? (totalStudents / totalTarget) * 100 : 0;
    const graduationRateData = buildGraduationRateData(students);

    const probationStudents = students
        .map((student) => {
            const gpa = resolveStudentGpa(student);
            const status = resolveAcademicStatus(student);

            return {
                id: student._id.toString(),
                studentId: student._id.toString(),
                name: student.name,
                regNo: resolveStudentRegNo(student),
                department: resolveStudentDepartment(student),
                gpa,
                status,
                semester: resolveStudentSemester(student),
            };
        })
        .filter((student) => student.status !== "Good Standing")
        .sort((left, right) => left.gpa - right.gpa)
        .slice(0, 20);

    const probationCount = probationStudents.length;

    const feeStatusCounts = students.reduce((accumulator, student) => {
        const totalFee = Number(student.totalFee || 0);
        const paidAmount = resolveStudentPaidAmount(student);
        const ratio = totalFee > 0 ? paidAmount / totalFee : 0;

        if (ratio >= 1) {
            accumulator.fullyPaid += 1;
        } else if (ratio >= 0.5) {
            accumulator.partial += 1;
        } else if (paidAmount > 0) {
            accumulator.overdue += 1;
        } else {
            accumulator.pending += 1;
        }

        return accumulator;
    }, { fullyPaid: 0, partial: 0, overdue: 0, pending: 0 });

    const percentage = (count) => totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;

    const feeCollectionData = [
        { name: "Fully Paid", value: percentage(feeStatusCounts.fullyPaid) },
        { name: "Partial", value: percentage(feeStatusCounts.partial) },
        { name: "Overdue", value: percentage(feeStatusCounts.overdue) },
        { name: "Pending", value: percentage(feeStatusCounts.pending) },
    ];

    const feeClearanceSummary = [
        { label: "Fully Cleared", value: percentage(feeStatusCounts.fullyPaid), color: "text-green-600" },
        { label: "Partial Payment", value: percentage(feeStatusCounts.partial), color: "text-primary" },
        { label: "Overdue", value: percentage(feeStatusCounts.overdue), color: "text-destructive" },
        { label: "Pending", value: percentage(feeStatusCounts.pending), color: "text-muted-foreground" },
    ];

    const pendingApprovals = approvals.map((approval) => ({
        id: approval._id.toString(),
        type: approval.type,
        from: approval.from,
        department: approval.department,
        date: new Date(approval.date).toISOString().split("T")[0],
        status: approval.status,
    }));

    const courseCount = dedupeBy(
        students.map((student) => labelFromValue(student.course)).filter(Boolean),
        (value) => value
    ).length;

    const campusName = user?.campus || user?.faculty || labelFromValue(user?.role, "College Admin");
    const subtitle = `${totalStudents} students across ${enrollmentByFaculty.length} faculties`;

    return {
        overview: {
            campusName,
            subtitle,
        },
        kpis: {
            totalStudents,
            activeCourses: courseCount,
            graduationRate: graduationRateData[graduationRateData.length - 1]?.rate || 0,
            probationCount,
            enrollmentPercentage: Number(enrollmentPercentage.toFixed(1)),
            totalTarget,
        },
        enrollmentByFaculty,
        enrollmentByDepartment,
        feeCollectionData,
        graduationRateData,
        probationStudents,
        upcomingEvents,
        pendingApprovals,
        lecturerWorkload: lecturers,
        feeClearanceSummary,
    };
};
