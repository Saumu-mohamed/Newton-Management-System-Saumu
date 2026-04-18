import AcademicEvent from "../models/AcademicEvent.js";
import AcademicResult from "../models/AcademicResult.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Student from "../models/Student.js";
import StudentDocument from "../models/StudentDocument.js";

const roundToTwo = (value) => Math.round(Number(value || 0) * 100) / 100;

const calculateWeightedGpa = (results) => {
    const totalCredits = results.reduce((sum, result) => sum + Number(result.credits || 0), 0);

    if (!totalCredits) {
        return null;
    }

    const weightedPoints = results.reduce(
        (sum, result) => sum + (Number(result.points || 0) * Number(result.credits || 0)),
        0
    );

    return roundToTwo(weightedPoints / totalCredits);
};

const formatEventDate = (startDate, endDate) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    if (!startDate) {
        return "TBA";
    }

    const start = new Date(startDate);

    if (!endDate) {
        return formatter.format(start);
    }

    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
        return formatter.format(start);
    }

    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
        return `${start.toLocaleString("en-US", { month: "short" })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }

    return `${formatter.format(start)} - ${formatter.format(end)}`;
};

const getRegistrationStatus = ({ unitCount, feeBalance, lastPayment }) => {
    if (unitCount === 0) {
        return { status: "Pending", daysLate: 0 };
    }

    if (unitCount < 4) {
        return { status: "Incomplete", daysLate: 0 };
    }

    const ageInDays = lastPayment
        ? Math.floor((Date.now() - new Date(lastPayment).getTime()) / (24 * 60 * 60 * 1000))
        : 0;

    if (feeBalance > 0 && ageInDays > 30) {
        return { status: "Late", daysLate: ageInDays - 30 };
    }

    return { status: "Completed", daysLate: 0 };
};

const mapDocumentStatus = (status) => {
    if (status === "Collected") {
        return "Collected";
    }

    if (status === "Ready for Collection") {
        return "Ready";
    }

    if (status === "Processing") {
        return "Processing";
    }

    return "Pending";
};

export const buildRegistratorDashboardView = async () => {
    const [students, registrations, results, documents, events] = await Promise.all([
        Student.find().sort({ createdAt: -1 }).lean(),
        CourseRegistration.find().sort({ createdAt: -1 }).lean(),
        AcademicResult.find().sort({ publishedAt: -1, createdAt: -1 }).lean(),
        StudentDocument.find().sort({ updatedAt: -1, createdAt: -1 }).populate("student", "name registrationNumber program").lean(),
        AcademicEvent.find().sort({ startDate: 1, createdAt: -1 }).lean(),
    ]);

    const registrationsByStudent = registrations.reduce((accumulator, registration) => {
        const studentId = String(registration.student);

        if (!accumulator.has(studentId)) {
            accumulator.set(studentId, []);
        }

        accumulator.get(studentId).push(registration);
        return accumulator;
    }, new Map());

    const resultsByStudent = results.reduce((accumulator, result) => {
        const studentId = String(result.student);

        if (!accumulator.has(studentId)) {
            accumulator.set(studentId, []);
        }

        accumulator.get(studentId).push(result);
        return accumulator;
    }, new Map());

    const pendingRegistrations = students
        .map((student) => {
            const studentRegistrations = registrationsByStudent.get(String(student._id)) || [];
            const feeBalance = Math.max(Number(student.totalFee || 0) - Number(student.paidAmount || 0), 0);
            const { status, daysLate } = getRegistrationStatus({
                unitCount: studentRegistrations.filter((item) => item.status === "Active").length,
                feeBalance,
                lastPayment: student.lastPayment,
            });

            return {
                id: String(student._id),
                name: student.name,
                regNo: student.registrationNumber,
                semester: `Semester ${Math.min(Number(student.year || 1) * 2, 8)}`,
                units: studentRegistrations.length,
                status,
                daysLate,
            };
        })
        .filter((student) => student.status !== "Completed")
        .slice(0, 20);

    const registrationStatusCounts = pendingRegistrations.reduce((accumulator, item) => {
        accumulator[item.status] = (accumulator[item.status] || 0) + 1;
        return accumulator;
    }, {});

    const registrationStatus = [
        { name: "Completed", value: Math.max(students.length - pendingRegistrations.length, 0) },
        { name: "Pending", value: registrationStatusCounts.Pending || 0 },
        { name: "Late", value: registrationStatusCounts.Late || 0 },
        { name: "Incomplete", value: registrationStatusCounts.Incomplete || 0 },
    ].filter((item) => item.value > 0);

    const prerequisiteViolations = registrations
        .map((registration) => {
            if (registration.overrideStatus === "Approved") {
                return null;
            }

            const studentResults = resultsByStudent.get(String(registration.student)) || [];
            const averagePoints = studentResults.length
                ? studentResults.reduce((sum, result) => sum + Number(result.points || 0), 0) / studentResults.length
                : null;

            if (averagePoints === null || averagePoints >= 2.5) {
                return null;
            }

            const student = students.find((item) => String(item._id) === String(registration.student));

            return {
                id: String(registration._id),
                student: student?.name || "Unknown Student",
                regNo: student?.registrationNumber || "N/A",
                unit: registration.code,
                prerequisite: `${registration.department} foundation`,
                status: averagePoints < 2 ? "Blocked" : "Warning",
            };
        })
        .filter(Boolean)
        .slice(0, 20);

    const transcriptRequests = documents
        .map((document) => ({
            id: String(document._id),
            name: document.student?.name || "Unknown Student",
            regNo: document.student?.registrationNumber || "N/A",
            type: document.document,
            purpose: document.location || "Registry Office",
            status: mapDocumentStatus(document.status),
            requestDate: new Date(document.updatedAt || document.createdAt).toISOString().split("T")[0],
        }))
        .slice(0, 20);

    const graduationEligible = students
        .filter((student) => Number(student.year || 0) >= 4)
        .map((student) => {
            const studentResults = resultsByStudent.get(String(student._id)) || [];
            const credits = studentResults.reduce((sum, result) => sum + Number(result.credits || 0), 0);
            const cgpa = calculateWeightedGpa(studentResults);
            const status = credits >= 180 && (cgpa || 0) >= 2
                ? "Eligible"
                : "Pending Credits";

            return {
                id: String(student._id),
                name: student.name,
                regNo: student.registrationNumber,
                program: student.program,
                credits,
                cgpa: cgpa || 0,
                status,
            };
        })
        .slice(0, 20);

    const registrationTrendMap = new Map();
    const currentDate = new Date();

    for (let offset = 4; offset >= 0; offset -= 1) {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - (offset * 7));
        const key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;

        registrationTrendMap.set(key, {
            week: `Week ${5 - offset}`,
            registrations: 0,
        });
    }

    students.forEach((student) => {
        const createdAt = new Date(student.createdAt);
        const diffWeeks = Math.floor((currentDate.getTime() - createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000));

        if (diffWeeks >= 0 && diffWeeks < 5) {
            const index = 4 - diffWeeks;
            const key = Array.from(registrationTrendMap.keys())[index];

            if (key && registrationTrendMap.has(key)) {
                registrationTrendMap.get(key).registrations += 1;
            }
        }
    });

    const admissionsByIntakeMap = students.reduce((accumulator, student) => {
        const createdAt = new Date(student.createdAt);
        const intake = `${createdAt.toLocaleString("en-US", { month: "short" })} ${createdAt.getFullYear()}`;

        if (!accumulator.has(intake)) {
            accumulator.set(intake, {
                intake,
                admitted: 0,
                graduated: 0,
                current: 0,
            });
        }

        const entry = accumulator.get(intake);
        entry.admitted += 1;

        if (Number(student.year || 0) >= 4) {
            entry.graduated += 1;
        } else {
            entry.current += 1;
        }

        return accumulator;
    }, new Map());

    const semesterCalendar = events.slice(0, 8).map((event) => ({
        id: String(event._id),
        event: event.title,
        date: formatEventDate(event.startDate, event.endDate),
        status: event.status === "completed" ? "Completed" : "Upcoming",
    }));

    const eligibleGraduatesCount = graduationEligible.filter((item) => item.status === "Eligible").length;
    const academicWarnings = prerequisiteViolations.filter((item) => item.status === "Warning").length;

    const academicAlerts = [
        {
            title: "Registration Deadline",
            desc: `${pendingRegistrations.length} students still need registration review.`,
            type: "warning",
        },
        {
            title: "Prerequisite Blocks",
            desc: `${prerequisiteViolations.length} registrations require prerequisite review.`,
            type: "warning",
        },
        {
            title: "Graduation Pipeline",
            desc: `${eligibleGraduatesCount} students currently qualify for graduation.`,
            type: "info",
        },
        {
            title: "Transcript Queue",
            desc: `${transcriptRequests.length} document requests are in the registrar workflow.`,
            type: "success",
        },
    ];

    return {
        overview: {
            title: "Registrar Dashboard",
            subtitle: "Academic Records & Enrollment Management",
        },
        kpis: {
            registeredStudents: students.length,
            pendingRegistrations: pendingRegistrations.length,
            transcriptRequests: transcriptRequests.length,
            graduationEligible: eligibleGraduatesCount,
            prerequisiteViolations: prerequisiteViolations.length,
            academicWarnings,
            activeCourses: registrations.length,
            daysToDeadline: 12,
            completedPercentage: students.length > 0
                ? Number((((students.length - pendingRegistrations.length) / students.length) * 100).toFixed(1))
                : 0,
        },
        registrationTrend: Array.from(registrationTrendMap.values()),
        registrationStatus,
        admissionsByIntake: Array.from(admissionsByIntakeMap.values()).slice(-5),
        pendingRegistrations,
        prerequisiteViolations,
        transcriptRequests,
        graduationEligible,
        semesterCalendar,
        academicAlerts,
    };
};
