import AcademicResult from "../models/AcademicResult.js";
import AuditLog from "../models/AuditLog.js";
import Campus from "../models/Campus.js";
import Course from "../models/Course.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Department from "../models/Department.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Student from "../models/Student.js";
import SystemSetting from "../models/SystemSetting.js";
import User from "../models/User.js";

const defaultCampuses = [
    {
        name: "Main Campus",
        location: "Nairobi, Kenya",
        capacity: 4000,
        phone: "+254 20 123 4567",
        email: "main@cms.edu",
        status: "Active",
        established: "1985",
    },
    {
        name: "Mombasa Campus",
        location: "Mombasa, Kenya",
        capacity: 2500,
        phone: "+254 41 234 5678",
        email: "mombasa@cms.edu",
        status: "Active",
        established: "1998",
    },
    {
        name: "Kisumu Campus",
        location: "Kisumu, Kenya",
        capacity: 1800,
        phone: "+254 57 345 6789",
        email: "kisumu@cms.edu",
        status: "Active",
        established: "2005",
    },
    {
        name: "Nakuru Campus",
        location: "Nakuru, Kenya",
        capacity: 1500,
        phone: "+254 51 456 7890",
        email: "nakuru@cms.edu",
        status: "Active",
        established: "2010",
    },
];

const reportCategories = [
    {
        title: "Student Reports",
        icon: "GraduationCap",
        color: "text-blue-600",
        bgColor: "bg-blue-500/10",
        reports: [
            { name: "Enrollment Report", key: "enrollment-report", description: "Student enrollment by campus, faculty, and program", format: "PDF/Excel" },
            { name: "Academic Performance", key: "academic-performance", description: "Average performance across academic programs", format: "PDF/Excel" },
            { name: "Attendance Report", key: "attendance-report", description: "Registration participation across offered courses", format: "Excel" },
            { name: "Graduation Eligibility", key: "graduation-eligibility", description: "Students approaching or meeting graduation conditions", format: "PDF" },
        ],
    },
    {
        title: "Financial Reports",
        icon: "Wallet",
        color: "text-green-600",
        bgColor: "bg-green-500/10",
        reports: [
            { name: "Fee Collection Report", key: "fee-collection-report", description: "Collection totals grouped by date and faculty", format: "PDF/Excel" },
            { name: "Outstanding Balances", key: "outstanding-balances", description: "Students with outstanding fee balances", format: "Excel" },
            { name: "Payment Methods", key: "payment-methods", description: "Payment volume by collection channel", format: "PDF" },
            { name: "Revenue by Faculty", key: "revenue-by-faculty", description: "Successful collections grouped by faculty", format: "PDF/Excel" },
        ],
    },
    {
        title: "Staff Reports",
        icon: "Users",
        color: "text-purple-600",
        bgColor: "bg-purple-500/10",
        reports: [
            { name: "Staff Directory", key: "staff-directory", description: "Complete list of staff records", format: "Excel" },
            { name: "Lecturer Workload", key: "lecturer-workload", description: "Courses and enrollment load per lecturer", format: "PDF/Excel" },
            { name: "Department Summary", key: "department-summary", description: "Staff, students, and courses by department", format: "PDF" },
        ],
    },
    {
        title: "Campus Reports",
        icon: "Building2",
        color: "text-yellow-600",
        bgColor: "bg-yellow-500/10",
        reports: [
            { name: "Campus Comparison", key: "campus-comparison", description: "Campus-by-campus enrollment and staffing", format: "PDF/Excel" },
            { name: "Capacity Utilization", key: "capacity-utilization", description: "Enrollment compared with campus capacity", format: "PDF" },
            { name: "Resource Allocation", key: "resource-allocation", description: "Staff and learner distribution across campuses", format: "Excel" },
        ],
    },
];

const formatDateTime = (value) =>
    new Intl.DateTimeFormat("en-KE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));

const normalizeIp = (req) =>
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    "Unknown";

const logAuditEvent = async (req, payload) => {
    await AuditLog.create({
        action: payload.action,
        user: req.user?.email || "system@cms.edu",
        role: req.user?.role || "System",
        ip: normalizeIp(req),
        status: payload.status || "success",
        details: payload.details || "",
        category: payload.category || "general",
        metadata: payload.metadata || {},
    });
};

const ensureBaseAdminData = async () => {
    const [campusCount, settingCount] = await Promise.all([
        Campus.countDocuments(),
        SystemSetting.countDocuments(),
    ]);

    if (!campusCount) {
        await Campus.insertMany(defaultCampuses);
    }

    if (!settingCount) {
        await SystemSetting.create({});
    }
};

const mapStaffRecord = (staff) => ({
    id: staff._id.toString(),
    name: staff.name,
    email: staff.email,
    phone: staff.phone || "N/A",
    department: staff.department,
    position: staff.position,
    status: staff.status,
});

const mapCampusRecord = (campus, counts) => ({
    id: campus._id.toString(),
    name: campus.name,
    location: campus.location,
    students: counts.students || 0,
    staff: counts.staff || 0,
    capacity: Number(campus.capacity || 0),
    phone: campus.phone || "N/A",
    email: campus.email || "N/A",
    status: campus.status,
    established: campus.established,
});

const getCampusCountMaps = async () => {
    const [students, staff] = await Promise.all([
        Student.find({}, "campus").lean(),
        Staff.find({}, "department").lean(),
    ]);

    const studentCounts = students.reduce((accumulator, student) => {
        const key = student.campus || "Main Campus";
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
    }, {});

    const staffCounts = staff.reduce((accumulator, staffMember) => {
        const department = String(staffMember.department || "");
        const campusName = defaultCampuses.find((campus) => department.includes(campus.name.replace(" Campus", "")))?.name || "Main Campus";
        accumulator[campusName] = (accumulator[campusName] || 0) + 1;
        return accumulator;
    }, {});

    return { studentCounts, staffCounts };
};

const buildReportData = async (reportKey) => {
    const [
        students,
        results,
        payments,
        campuses,
        staff,
        users,
        courses,
        registrations,
        departments,
    ] = await Promise.all([
        Student.find().lean(),
        AcademicResult.find().lean(),
        Payment.find().lean(),
        Campus.find().lean(),
        Staff.find().lean(),
        User.find().lean(),
        Course.find().lean(),
        CourseRegistration.find().lean(),
        Department.find().lean(),
    ]);

    const studentById = new Map(students.map((student) => [String(student._id), student]));
    const registrationsByCode = registrations.reduce((accumulator, registration) => {
        accumulator[registration.code] = (accumulator[registration.code] || 0) + 1;
        return accumulator;
    }, {});

    switch (reportKey) {
        case "enrollment-report": {
            const grouped = students.reduce((accumulator, student) => {
                const key = `${student.campus}|${student.faculty}|${student.program}|Year ${student.year}`;
                if (!accumulator[key]) {
                    accumulator[key] = {
                        campus: student.campus || "Main",
                        faculty: student.faculty || "General",
                        program: student.program || student.course,
                        intake: `Year ${student.year}`,
                        students: 0,
                    };
                }
                accumulator[key].students += 1;
                return accumulator;
            }, {});

            return {
                data: Object.values(grouped),
                columns: [
                    { key: "campus", label: "Campus" },
                    { key: "faculty", label: "Faculty" },
                    { key: "program", label: "Program" },
                    { key: "intake", label: "Intake" },
                    { key: "students", label: "Students" },
                ],
            };
        }
        case "academic-performance": {
            const grouped = results.reduce((accumulator, result) => {
                const student = studentById.get(String(result.student));
                const program = student?.program || student?.course || "General";
                if (!accumulator[program]) {
                    accumulator[program] = { program, scores: [], enrolled: new Set(), passed: 0, failed: 0 };
                }
                accumulator[program].scores.push(Number(result.totalScore || 0));
                accumulator[program].enrolled.add(String(result.student));
                if (Number(result.totalScore || 0) >= 40) {
                    accumulator[program].passed += 1;
                } else {
                    accumulator[program].failed += 1;
                }
                return accumulator;
            }, {});

            return {
                data: Object.values(grouped).map((entry) => ({
                    program: entry.program,
                    enrolled: entry.enrolled.size,
                    passed: entry.passed,
                    failed: entry.failed,
                    avgScore: entry.scores.length
                        ? Math.round(entry.scores.reduce((sum, value) => sum + value, 0) / entry.scores.length)
                        : 0,
                })),
                columns: [
                    { key: "program", label: "Program" },
                    { key: "enrolled", label: "Enrolled" },
                    { key: "passed", label: "Passed Units" },
                    { key: "failed", label: "Failed Units" },
                    { key: "avgScore", label: "Average Score" },
                ],
            };
        }
        case "attendance-report": {
            return {
                data: courses.map((course) => ({
                    code: course.code,
                    course: course.title,
                    semester: course.semester,
                    registered: registrationsByCode[course.code] || 0,
                    status: course.status,
                })),
                columns: [
                    { key: "code", label: "Code" },
                    { key: "course", label: "Course" },
                    { key: "semester", label: "Semester" },
                    { key: "registered", label: "Registered Students" },
                    { key: "status", label: "Status" },
                ],
            };
        }
        case "graduation-eligibility": {
            return {
                data: students
                    .filter((student) => student.status === "Graduated" || (student.year >= 4 && Number(student.totalFee || 0) - Number(student.paidAmount || 0) <= 0))
                    .map((student) => ({
                        regNo: student.registrationNumber,
                        name: student.name,
                        program: student.program || student.course,
                        year: student.year,
                        feeBalance: Math.max(Number(student.totalFee || 0) - Number(student.paidAmount || 0), 0),
                        status: student.status,
                    })),
                columns: [
                    { key: "regNo", label: "Reg No" },
                    { key: "name", label: "Student Name" },
                    { key: "program", label: "Program" },
                    { key: "year", label: "Year" },
                    { key: "feeBalance", label: "Fee Balance" },
                    { key: "status", label: "Status" },
                ],
            };
        }
        case "fee-collection-report": {
            const grouped = payments.reduce((accumulator, payment) => {
                const student = studentById.get(String(payment.student));
                const date = new Date(payment.date || payment.createdAt).toISOString().split("T")[0];
                const faculty = student?.faculty || "General";
                const key = `${date}|${faculty}`;
                if (!accumulator[key]) {
                    accumulator[key] = { date, faculty, collected: 0, mpesa: 0, bank: 0, cash: 0, card: 0 };
                }
                const amount = Number(payment.amount || 0);
                accumulator[key].collected += amount;
                accumulator[key][payment.method || "cash"] += amount;
                return accumulator;
            }, {});

            return {
                data: Object.values(grouped),
                columns: [
                    { key: "date", label: "Date" },
                    { key: "faculty", label: "Faculty" },
                    { key: "collected", label: "Collected" },
                    { key: "mpesa", label: "M-Pesa" },
                    { key: "bank", label: "Bank" },
                    { key: "cash", label: "Cash" },
                    { key: "card", label: "Card" },
                ],
            };
        }
        case "outstanding-balances": {
            return {
                data: students.map((student) => ({
                    regNo: student.registrationNumber,
                    name: student.name,
                    program: student.program || student.course,
                    totalFees: Number(student.totalFee || 0),
                    paid: Number(student.paidAmount || 0),
                    balance: Math.max(Number(student.totalFee || 0) - Number(student.paidAmount || 0), 0),
                })),
                columns: [
                    { key: "regNo", label: "Reg No" },
                    { key: "name", label: "Student Name" },
                    { key: "program", label: "Program" },
                    { key: "totalFees", label: "Total Fees" },
                    { key: "paid", label: "Paid" },
                    { key: "balance", label: "Balance" },
                ],
            };
        }
        case "payment-methods": {
            const grouped = payments.reduce((accumulator, payment) => {
                const method = payment.method || "unknown";
                if (!accumulator[method]) {
                    accumulator[method] = { method, transactions: 0, amount: 0, successful: 0, pending: 0 };
                }
                accumulator[method].transactions += 1;
                accumulator[method].amount += Number(payment.amount || 0);
                if (payment.status === "success") {
                    accumulator[method].successful += 1;
                }
                if (payment.status === "pending") {
                    accumulator[method].pending += 1;
                }
                return accumulator;
            }, {});

            return {
                data: Object.values(grouped),
                columns: [
                    { key: "method", label: "Method" },
                    { key: "transactions", label: "Transactions" },
                    { key: "amount", label: "Amount" },
                    { key: "successful", label: "Successful" },
                    { key: "pending", label: "Pending" },
                ],
            };
        }
        case "revenue-by-faculty": {
            const grouped = payments.reduce((accumulator, payment) => {
                const student = studentById.get(String(payment.student));
                const faculty = student?.faculty || "General";
                if (!accumulator[faculty]) {
                    accumulator[faculty] = { faculty, amount: 0, transactions: 0 };
                }
                accumulator[faculty].amount += Number(payment.amount || 0);
                accumulator[faculty].transactions += 1;
                return accumulator;
            }, {});

            return {
                data: Object.values(grouped),
                columns: [
                    { key: "faculty", label: "Faculty" },
                    { key: "transactions", label: "Transactions" },
                    { key: "amount", label: "Collected Amount" },
                ],
            };
        }
        case "staff-directory": {
            return {
                data: staff.map((staffMember) => ({
                    name: staffMember.name,
                    email: staffMember.email,
                    phone: staffMember.phone,
                    department: staffMember.department,
                    position: staffMember.position,
                    status: staffMember.status,
                })),
                columns: [
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    { key: "department", label: "Department" },
                    { key: "position", label: "Position" },
                    { key: "status", label: "Status" },
                ],
            };
        }
        case "lecturer-workload": {
            const lecturers = users.filter((user) => user.role === "lecturer");
            return {
                data: lecturers.map((lecturer) => {
                    const assignedCourses = courses.filter((course) => String(course.lecturer) === String(lecturer._id));
                    const studentLoad = assignedCourses.reduce((sum, course) => sum + (registrationsByCode[course.code] || 0), 0);
                    return {
                        lecturer: lecturer.name,
                        department: lecturer.department || lecturer.faculty || "General",
                        courses: assignedCourses.length,
                        students: studentLoad,
                    };
                }),
                columns: [
                    { key: "lecturer", label: "Lecturer" },
                    { key: "department", label: "Department" },
                    { key: "courses", label: "Assigned Courses" },
                    { key: "students", label: "Student Load" },
                ],
            };
        }
        case "department-summary": {
            return {
                data: departments.map((department) => ({
                    department: department.name,
                    faculty: department.faculty,
                    students: students.filter((student) => (student.program || student.course) === department.name).length,
                    staff: staff.filter((staffMember) => staffMember.department === department.name).length,
                    courses: courses.filter((course) => course.department === department.name).length,
                })),
                columns: [
                    { key: "department", label: "Department" },
                    { key: "faculty", label: "Faculty" },
                    { key: "students", label: "Students" },
                    { key: "staff", label: "Staff" },
                    { key: "courses", label: "Courses" },
                ],
            };
        }
        case "campus-comparison":
        case "capacity-utilization":
        case "resource-allocation": {
            const campusData = campuses.map((campus) => {
                const campusStudents = students.filter((student) => (student.campus || "Main Campus") === campus.name).length;
                const campusStaff = staff.filter((staffMember) => {
                    const department = staffMember.department || "";
                    return department.includes(campus.name.replace(" Campus", "")) || campus.name === "Main Campus";
                }).length;
                return {
                    campus: campus.name,
                    location: campus.location,
                    students: campusStudents,
                    staff: campusStaff,
                    capacity: Number(campus.capacity || 0),
                    utilization: campus.capacity ? Math.round((campusStudents / campus.capacity) * 100) : 0,
                    status: campus.status,
                };
            });

            return {
                data: campusData,
                columns: [
                    { key: "campus", label: "Campus" },
                    { key: "location", label: "Location" },
                    { key: "students", label: "Students" },
                    { key: "staff", label: "Staff" },
                    { key: "capacity", label: "Capacity" },
                    { key: "utilization", label: "Utilization %" },
                    { key: "status", label: "Status" },
                ],
            };
        }
        default:
            return {
                data: [],
                columns: [{ key: "message", label: "Message" }],
            };
    }
};

export const getStaff = async (_req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 }).lean();

        res.json({
            staff: staff.map(mapStaffRecord),
            stats: {
                total: staff.length,
                active: staff.filter((staffMember) => staffMember.status === "Active").length,
                departments: new Set(staff.map((staffMember) => staffMember.department)).size,
            },
        });
    } catch (error) {
        console.error("Get staff error:", error);
        res.status(500).json({ message: "Failed to load staff" });
    }
};

export const createStaff = async (req, res) => {
    try {
        const existingStaff = await Staff.findOne({ email: req.body.email?.trim().toLowerCase() }).lean();
        if (existingStaff) {
            return res.status(400).json({ message: "A staff member with that email already exists" });
        }

        const staff = await Staff.create({
            name: req.body.name?.trim(),
            email: req.body.email?.trim().toLowerCase(),
            phone: req.body.phone?.trim(),
            department: req.body.department?.trim(),
            position: req.body.position?.trim(),
            status: req.body.status || "Active",
        });

        await logAuditEvent(req, {
            action: "Staff Created",
            details: `Created staff record for ${staff.name}`,
            category: "staff",
        });

        res.status(201).json({ message: "Staff created successfully", staff: mapStaffRecord(staff) });
    } catch (error) {
        console.error("Create staff error:", error);
        res.status(500).json({ message: "Failed to create staff member" });
    }
};

export const updateStaff = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const duplicateStaff = await Staff.findOne({ email, _id: { $ne: req.params.id } }).lean();
        if (duplicateStaff) {
            return res.status(400).json({ message: "Another staff member already uses that email" });
        }

        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name?.trim(),
                email,
                phone: req.body.phone?.trim(),
                department: req.body.department?.trim(),
                position: req.body.position?.trim(),
                status: req.body.status || "Active",
            },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        await logAuditEvent(req, {
            action: "Staff Updated",
            details: `Updated staff record for ${staff.name}`,
            category: "staff",
        });

        res.json({ message: "Staff updated successfully", staff: mapStaffRecord(staff) });
    } catch (error) {
        console.error("Update staff error:", error);
        res.status(500).json({ message: "Failed to update staff member" });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        await logAuditEvent(req, {
            action: "Staff Deleted",
            details: `Deleted staff record for ${staff.name}`,
            category: "staff",
            status: "warning",
        });

        res.json({ message: "Staff deleted successfully" });
    } catch (error) {
        console.error("Delete staff error:", error);
        res.status(500).json({ message: "Failed to delete staff member" });
    }
};

export const getCampuses = async (_req, res) => {
    try {
        await ensureBaseAdminData();
        const campuses = await Campus.find().sort({ name: 1 }).lean();
        const { studentCounts, staffCounts } = await getCampusCountMaps();
        const campusRows = campuses.map((campus) =>
            mapCampusRecord(campus, {
                students: studentCounts[campus.name] || 0,
                staff: staffCounts[campus.name] || 0,
            })
        );

        res.json({
            campuses: campusRows,
            stats: {
                totalCampuses: campusRows.length,
                totalStudents: campusRows.reduce((sum, campus) => sum + campus.students, 0),
                totalStaff: campusRows.reduce((sum, campus) => sum + campus.staff, 0),
                countiesCovered: new Set(campusRows.map((campus) => campus.location.split(",").at(0)?.trim())).size,
            },
        });
    } catch (error) {
        console.error("Get campuses error:", error);
        res.status(500).json({ message: "Failed to load campuses" });
    }
};

export const createCampus = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const existingCampus = await Campus.findOne({ name }).lean();
        if (existingCampus) {
            return res.status(400).json({ message: "A campus with that name already exists" });
        }

        const campus = await Campus.create({
            name,
            location: req.body.location?.trim(),
            capacity: Number(req.body.capacity || 0),
            phone: req.body.phone?.trim(),
            email: req.body.email?.trim(),
            status: req.body.status || "Active",
            established: req.body.established?.trim(),
        });

        await logAuditEvent(req, {
            action: "Campus Created",
            details: `Created campus ${campus.name}`,
            category: "campus",
        });

        res.status(201).json({ message: "Campus created successfully", campus });
    } catch (error) {
        console.error("Create campus error:", error);
        res.status(500).json({ message: "Failed to create campus" });
    }
};

export const updateCampus = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const duplicateCampus = await Campus.findOne({ name, _id: { $ne: req.params.id } }).lean();
        if (duplicateCampus) {
            return res.status(400).json({ message: "Another campus already uses that name" });
        }

        const campus = await Campus.findByIdAndUpdate(
            req.params.id,
            {
                name,
                location: req.body.location?.trim(),
                capacity: Number(req.body.capacity || 0),
                phone: req.body.phone?.trim(),
                email: req.body.email?.trim(),
                status: req.body.status || "Active",
                established: req.body.established?.trim(),
            },
            { new: true }
        );

        if (!campus) {
            return res.status(404).json({ message: "Campus not found" });
        }

        await logAuditEvent(req, {
            action: "Campus Updated",
            details: `Updated campus ${campus.name}`,
            category: "campus",
        });

        res.json({ message: "Campus updated successfully", campus });
    } catch (error) {
        console.error("Update campus error:", error);
        res.status(500).json({ message: "Failed to update campus" });
    }
};

export const deleteCampus = async (req, res) => {
    try {
        const campus = await Campus.findByIdAndDelete(req.params.id);
        if (!campus) {
            return res.status(404).json({ message: "Campus not found" });
        }

        await logAuditEvent(req, {
            action: "Campus Deleted",
            details: `Deleted campus ${campus.name}`,
            category: "campus",
            status: "warning",
        });

        res.json({ message: "Campus deleted successfully" });
    } catch (error) {
        console.error("Delete campus error:", error);
        res.status(500).json({ message: "Failed to delete campus" });
    }
};

export const getAuditLogs = async (_req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).lean();
        const formatted = logs.map((log) => ({
            id: log._id.toString(),
            action: log.action,
            user: log.user,
            role: log.role,
            ip: log.ip,
            time: formatDateTime(log.createdAt),
            status: log.status,
            details: log.details,
            category: log.category,
        }));

        res.json({
            logs: formatted,
            stats: {
                total: formatted.length,
                success: formatted.filter((log) => log.status === "success").length,
                failed: formatted.filter((log) => log.status === "failed").length,
                warning: formatted.filter((log) => log.status === "warning").length,
            },
        });
    } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({ message: "Failed to load audit logs" });
    }
};

export const getSettings = async (_req, res) => {
    try {
        await ensureBaseAdminData();
        const settings = await SystemSetting.findOne().lean();
        res.json({ settings });
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ message: "Failed to load settings" });
    }
};

export const updateSettings = async (req, res) => {
    try {
        await ensureBaseAdminData();
        const updates = req.body || {};
        const settings = await SystemSetting.findOneAndUpdate(
            {},
            {
                $set: {
                    ...(updates.institution ? { institution: updates.institution } : {}),
                    ...(updates.appearance ? { appearance: updates.appearance } : {}),
                    ...(updates.notifications ? { notifications: updates.notifications } : {}),
                    ...(updates.security ? { security: updates.security } : {}),
                    ...(updates.academic ? { academic: updates.academic } : {}),
                },
            },
            { new: true }
        );

        await logAuditEvent(req, {
            action: "Settings Updated",
            details: "System settings were updated",
            category: "settings",
        });

        res.json({ message: "Settings updated successfully", settings });
    } catch (error) {
        console.error("Update settings error:", error);
        res.status(500).json({ message: "Failed to update settings" });
    }
};

export const getReportOverview = async (_req, res) => {
    try {
        await ensureBaseAdminData();
        const [students, payments, recentReportLogs] = await Promise.all([
            Student.countDocuments(),
            Payment.countDocuments(),
            AuditLog.find({ category: "reports" }).sort({ createdAt: -1 }).limit(10).lean(),
        ]);

        res.json({
            summary: {
                availableReports: reportCategories.reduce((sum, category) => sum + category.reports.length, 0),
                downloadsThisMonth: recentReportLogs.filter((log) => {
                    const now = new Date();
                    const createdAt = new Date(log.createdAt);
                    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                }).length,
                scheduledReports: 0,
                generatedToday: recentReportLogs.filter((log) => {
                    const now = new Date();
                    const createdAt = new Date(log.createdAt);
                    return createdAt.toDateString() === now.toDateString();
                }).length,
                students,
                payments,
            },
            reportCategories,
            recentReports: recentReportLogs.map((log) => ({
                name: log.metadata?.reportName || log.action,
                generated: formatDateTime(log.createdAt),
                by: log.user,
                size: `${Math.max(1, Math.round((log.metadata?.rows || 1) / 10))} KB`,
                type: log.metadata?.reportName || log.action,
                key: log.metadata?.reportKey,
            })),
        });
    } catch (error) {
        console.error("Get report overview error:", error);
        res.status(500).json({ message: "Failed to load reports" });
    }
};

export const getReportData = async (req, res) => {
    try {
        const reportKey = req.params.reportKey;
        const metadata = reportCategories.flatMap((category) => category.reports).find((report) => report.key === reportKey);
        if (!metadata) {
            return res.status(404).json({ message: "Report not found" });
        }

        const report = await buildReportData(reportKey);

        await logAuditEvent(req, {
            action: "Report Generated",
            details: `Generated ${metadata.name}`,
            category: "reports",
            metadata: {
                reportKey,
                reportName: metadata.name,
                rows: report.data.length,
            },
        });

        res.json({
            report: {
                name: metadata.name,
                key: reportKey,
                data: report.data,
                columns: report.columns,
            },
        });
    } catch (error) {
        console.error("Get report data error:", error);
        res.status(500).json({ message: "Failed to generate report" });
    }
};
