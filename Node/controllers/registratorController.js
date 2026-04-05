import mongoose from "mongoose";
import AcademicEvent from "../models/AcademicEvent.js";
import AcademicResult from "../models/AcademicResult.js";
import CourseRegistration from "../models/CourseRegistration.js";
import DashboardAction from "../models/DashboardAction.js";
import Student from "../models/Student.js";
import StudentDocument from "../models/StudentDocument.js";

const roundToTwo = (value) => Math.round(Number(value || 0) * 100) / 100;
const unitTemplatesByFaculty = {
    Computing: [
        { code: "CSC101", name: "Programming Fundamentals" },
        { code: "CSC102", name: "Data Structures" },
        { code: "CSC103", name: "Database Systems" },
        { code: "CSC104", name: "Computer Networks" },
        { code: "CSC105", name: "Software Engineering Studio" },
    ],
    Business: [
        { code: "BUS101", name: "Financial Accounting" },
        { code: "BUS102", name: "Business Statistics" },
        { code: "BUS103", name: "Microeconomics" },
        { code: "BUS104", name: "Financial Management" },
        { code: "BUS105", name: "Business Law" },
    ],
    Engineering: [
        { code: "ENG101", name: "Engineering Mathematics" },
        { code: "ENG102", name: "Mechanics" },
        { code: "ENG103", name: "Materials Science" },
        { code: "ENG104", name: "Thermodynamics" },
        { code: "ENG105", name: "Applied Design" },
    ],
    "Health Sciences": [
        { code: "HS101", name: "Human Anatomy" },
        { code: "HS102", name: "Clinical Practice" },
        { code: "HS103", name: "Community Health" },
        { code: "HS104", name: "Health Research Methods" },
        { code: "HS105", name: "Patient Care Management" },
    ],
};

const createRegistratorAction = async ({
    actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata = {},
}) => DashboardAction.create({
    area: "registrator",
    actor: actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata,
});

const formatDateValue = (value) => new Date(value).toISOString().split("T")[0];
const calculateLetterGrade = (score) => {
    if (score >= 70) {
        return { grade: "A", points: 4.0 };
    }

    if (score >= 60) {
        return { grade: "B", points: 3.0 };
    }

    if (score >= 50) {
        return { grade: "C", points: 2.0 };
    }

    if (score >= 40) {
        return { grade: "D", points: 1.0 };
    }

    return { grade: "E", points: 0 };
};

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

const getSuggestedUnits = (student, existingCount = 0) => {
    const templates = unitTemplatesByFaculty[student.faculty] || unitTemplatesByFaculty.Computing;
    const requiredCount = Math.max(4 - existingCount, 0);
    const semesterNumber = Math.min(Number(student.year || 1) * 2, 8);

    return templates.slice(0, requiredCount).map((template, index) => ({
        student: student._id,
        code: `${template.code}-${student.year || 1}${index + 1}`,
        name: template.name,
        lecturer: student.course || "Assigned by Registry",
        credits: 15,
        day: ["Mon", "Tue", "Wed", "Thu", "Fri"][index % 5],
        time: ["8:00-10:00", "10:00-12:00", "14:00-16:00", "16:00-18:00"][index % 4],
        room: `R-${student.year || 1}${index + 1}`,
        status: "Active",
        department: student.course || student.program || "General",
        semester: `Semester ${semesterNumber}`,
        description: `${template.name} registration reviewed by registry.`,
        reviewStatus: "Approved",
    }));
};

export const getRegistratorDashboard = async (_req, res) => {
    try {
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

        const semesterCalendar = events
            .slice(0, 8)
            .map((event) => ({
                id: String(event._id),
                event: event.title,
                date: formatEventDate(event.startDate, event.endDate),
                status: event.status === "completed" ? "Completed" : "Upcoming",
            }));

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
                desc: `${graduationEligible.filter((item) => item.status === "Eligible").length} students currently qualify for graduation.`,
                type: "info",
            },
            {
                title: "Transcript Queue",
                desc: `${transcriptRequests.length} document requests are in the registrar workflow.`,
                type: "success",
            },
        ];

        res.json({
            overview: {
                title: "Registrar Dashboard",
                subtitle: "Academic Records & Enrollment Management",
            },
            kpis: {
                registeredStudents: students.length,
                pendingRegistrations: pendingRegistrations.length,
                transcriptRequests: transcriptRequests.length,
                graduationEligible: graduationEligible.filter((item) => item.status === "Eligible").length,
                prerequisiteViolations: prerequisiteViolations.length,
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
        });
    } catch (error) {
        console.error("Registrator dashboard error:", error);
        res.status(500).json({ message: "Failed to load registrator dashboard" });
    }
};

export const reviewStudentRegistration = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const registrations = await CourseRegistration.find({ student: student._id }).sort({ createdAt: 1 });
        const missingUnits = getSuggestedUnits(student, registrations.length);

        if (missingUnits.length > 0) {
            await CourseRegistration.insertMany(missingUnits);
        }

        await CourseRegistration.updateMany(
            { student: student._id },
            {
                $set: {
                    status: "Active",
                    reviewStatus: "Approved",
                    reviewedAt: new Date(),
                    reviewedBy: req.user._id,
                    rejectionReason: "",
                },
            }
        );

        student.lastPayment = new Date();
        await student.save();

        await createRegistratorAction({
            actorId: req.user._id,
            actionType: "registration_reviewed",
            message: `${student.name}'s semester registration was reviewed and updated.`,
            targetType: "student",
            targetId: student._id.toString(),
            metadata: {
                registrationNumber: student.registrationNumber,
                unitsAdded: missingUnits.length,
            },
        });

        res.json({
            message: `${student.name}'s registration has been reviewed.`,
            student: {
                id: student._id.toString(),
                registrationsAdded: missingUnits.length,
            },
        });
    } catch (error) {
        console.error("Review student registration error:", error);
        res.status(500).json({ message: "Failed to review registration" });
    }
};

export const getRegistratorCourseRegistrations = async (req, res) => {
    try {
        const { search = "", status = "all", semester = "all" } = req.query;
        const [students, registrations] = await Promise.all([
            Student.find().sort({ name: 1 }).lean(),
            CourseRegistration.find()
                .sort({ updatedAt: -1, createdAt: -1 })
                .lean(),
        ]);

        const studentMap = new Map(students.map((student) => [String(student._id), student]));
        const grouped = registrations.reduce((accumulator, registration) => {
            const studentId = String(registration.student);
            const key = `${studentId}::${registration.semester || "Current Semester"}`;

            if (!accumulator.has(key)) {
                accumulator.set(key, {
                    id: studentId,
                    studentId,
                    semester: registration.semester || "Current Semester",
                    registrations: [],
                });
            }

            accumulator.get(key).registrations.push(registration);
            return accumulator;
        }, new Map());

        const rows = Array.from(grouped.values()).map((entry) => {
            const student = studentMap.get(entry.studentId);
            const reviewStatuses = entry.registrations.map((item) => item.reviewStatus || "Pending");
            const approvedCount = reviewStatuses.filter((value) => value === "Approved").length;
            const rejectedCount = reviewStatuses.filter((value) => value === "Rejected").length;
            let reviewStatus = "pending";

            if (approvedCount === reviewStatuses.length) {
                reviewStatus = "approved";
            } else if (rejectedCount === reviewStatuses.length) {
                reviewStatus = "rejected";
            }

            return {
                id: entry.studentId,
                student: student?.name || "Unknown Student",
                regNo: student?.registrationNumber || "N/A",
                program: student?.program || student?.course || "General",
                semester: entry.semester,
                units: entry.registrations.length,
                date: formatDateValue(entry.registrations[0]?.updatedAt || entry.registrations[0]?.createdAt || new Date()),
                status: reviewStatus,
            };
        });

        const normalizedSearch = search.trim().toLowerCase();
        const filteredRows = rows.filter((row) => {
            const matchesSearch = !normalizedSearch || [
                row.student,
                row.regNo,
                row.program,
            ].some((value) => String(value).toLowerCase().includes(normalizedSearch));
            const matchesStatus = status === "all" || row.status === status;
            const matchesSemester = semester === "all" || row.semester === semester;

            return matchesSearch && matchesStatus && matchesSemester;
        });

        res.json({
            registrations: filteredRows,
            semesters: [...new Set(rows.map((row) => row.semester))].sort(),
            stats: {
                total: rows.length,
                approved: rows.filter((row) => row.status === "approved").length,
                pending: rows.filter((row) => row.status === "pending").length,
                rejected: rows.filter((row) => row.status === "rejected").length,
            },
        });
    } catch (error) {
        console.error("Get registrator course registrations error:", error);
        res.status(500).json({ message: "Failed to load course registrations" });
    }
};

export const decideStudentRegistration = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { decision, reason = "" } = req.body;

        if (!["approved", "rejected"].includes(decision)) {
            return res.status(400).json({ message: "Decision must be approved or rejected." });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        let student;
        let registrationCount = 0;

        await session.withTransaction(async () => {
            student = await Student.findById(req.params.studentId).session(session);

            if (!student) {
                throw new Error("Student not found");
            }

            const registrations = await CourseRegistration.find({ student: student._id }).session(session);
            const missingUnits = decision === "approved"
                ? getSuggestedUnits(student, registrations.length)
                : [];

            if (missingUnits.length > 0) {
                await CourseRegistration.insertMany(missingUnits, { session });
            }

            const finalRegistrations = await CourseRegistration.find({ student: student._id }).session(session);
            registrationCount = finalRegistrations.length;

            await CourseRegistration.updateMany(
                { student: student._id },
                {
                    $set: {
                        reviewStatus: decision === "approved" ? "Approved" : "Rejected",
                        reviewedAt: new Date(),
                        reviewedBy: req.user._id,
                        rejectionReason: decision === "rejected" ? reason : "",
                        status: decision === "approved" ? "Active" : "Dropped",
                    },
                },
                { session }
            );
        });

        await createRegistratorAction({
            actorId: req.user._id,
            actionType: decision === "approved" ? "registration_approved" : "registration_rejected",
            message: `${student.name}'s course registration was ${decision}.`,
            targetType: "student",
            targetId: student._id.toString(),
            metadata: {
                registrationNumber: student.registrationNumber,
                registrationCount,
                reason,
            },
        });

        res.json({
            message: `${student.name}'s registration was ${decision}.`,
            studentId: student._id.toString(),
        });
    } catch (error) {
        console.error("Decide student registration error:", error);
        res.status(error.message === "Student not found" ? 404 : 500).json({
            message: error.message === "Student not found" ? error.message : "Failed to update registration decision",
        });
    } finally {
        await session.endSession();
    }
};

export const approvePrerequisiteOverride = async (req, res) => {
    try {
        const registration = await CourseRegistration.findById(req.params.registrationId).populate("student", "name registrationNumber");

        if (!registration) {
            return res.status(404).json({ message: "Course registration not found" });
        }

        registration.overrideStatus = "Approved";
        registration.overrideApprovedAt = new Date();
        registration.overrideApprovedBy = req.user._id;
        registration.overrideNotes = "Approved from registrar dashboard.";
        await registration.save();

        await createRegistratorAction({
            actorId: req.user._id,
            actionType: "prerequisite_override_approved",
            message: `Prerequisite override approved for ${registration.student?.name || "student"} on ${registration.code}.`,
            targetType: "registration",
            targetId: registration._id.toString(),
            metadata: {
                regNo: registration.student?.registrationNumber,
                unitCode: registration.code,
            },
        });

        res.json({
            message: `Prerequisite override approved for ${registration.student?.name || "the selected student"}.`,
            registration: {
                id: registration._id.toString(),
                overrideStatus: registration.overrideStatus,
            },
        });
    } catch (error) {
        console.error("Approve prerequisite override error:", error);
        res.status(500).json({ message: "Failed to approve prerequisite override" });
    }
};

export const generateGraduationList = async (req, res) => {
    try {
        const [students, results] = await Promise.all([
            Student.find({ year: { $gte: 4 } }).lean(),
            AcademicResult.find().lean(),
        ]);

        const resultsByStudent = results.reduce((accumulator, result) => {
            const studentId = String(result.student);

            if (!accumulator.has(studentId)) {
                accumulator.set(studentId, []);
            }

            accumulator.get(studentId).push(result);
            return accumulator;
        }, new Map());

        const eligibleStudents = students.filter((student) => {
            const studentResults = resultsByStudent.get(String(student._id)) || [];
            const credits = studentResults.reduce((sum, result) => sum + Number(result.credits || 0), 0);
            const cgpa = calculateWeightedGpa(studentResults) || 0;

            return credits >= 180 && cgpa >= 2;
        });

        if (!eligibleStudents.length) {
            return res.status(400).json({ message: "No students currently qualify for the graduation list." });
        }

        const bulkOperations = eligibleStudents.map((student) => ({
            updateOne: {
                filter: { student: student._id, document: "Graduation Clearance" },
                update: {
                    $set: {
                        status: "Processing",
                        location: "Graduation Office",
                    },
                },
                upsert: true,
            },
        }));

        if (bulkOperations.length > 0) {
            await StudentDocument.bulkWrite(bulkOperations);
        }

        await createRegistratorAction({
            actorId: req.user._id,
            actionType: "graduation_list_generated",
            message: `Graduation clearance workflow opened for ${eligibleStudents.length} students.`,
            targetType: "graduation_batch",
            targetId: `${new Date().toISOString()}`,
            metadata: {
                count: eligibleStudents.length,
                students: eligibleStudents.slice(0, 10).map((student) => ({
                    id: student._id.toString(),
                    name: student.name,
                    regNo: student.registrationNumber,
                })),
            },
        });

        res.json({
            message: `Graduation list generated for ${eligibleStudents.length} students.`,
            count: eligibleStudents.length,
        });
    } catch (error) {
        console.error("Generate graduation list error:", error);
        res.status(500).json({ message: "Failed to generate graduation list" });
    }
};

export const getTranscriptRequests = async (req, res) => {
    try {
        const { search = "", status = "all", type = "all" } = req.query;
        const documents = await StudentDocument.find()
            .sort({ updatedAt: -1, createdAt: -1 })
            .populate("student", "name registrationNumber program faculty createdAt")
            .lean();

        const normalizedSearch = search.trim().toLowerCase();
        const transcriptRequests = documents
            .map((document) => ({
                id: document._id.toString(),
                student: document.student?.name || "Unknown Student",
                regNo: document.student?.registrationNumber || "N/A",
                program: document.student?.program || "General",
                type: document.requestType || "Official",
                copies: Number(document.copies || 1),
                status: mapDocumentStatus(document.status).toLowerCase(),
                requestDate: formatDateValue(document.updatedAt || document.createdAt || new Date()),
                fee: Number(document.fee || 0),
                document: document.document,
            }))
            .filter((document) => {
                const matchesSearch = !normalizedSearch || [
                    document.student,
                    document.regNo,
                    document.program,
                ].some((value) => String(value).toLowerCase().includes(normalizedSearch));
                const matchesStatus = status === "all" || document.status === status;
                const matchesType = type === "all" || document.type.toLowerCase() === type;

                return matchesSearch && matchesStatus && matchesType;
            });

        res.json({
            transcriptRequests,
            stats: {
                total: transcriptRequests.length,
                processing: transcriptRequests.filter((item) => item.status === "processing").length,
                ready: transcriptRequests.filter((item) => item.status === "ready").length,
                collected: transcriptRequests.filter((item) => item.status === "collected").length,
            },
        });
    } catch (error) {
        console.error("Get transcript requests error:", error);
        res.status(500).json({ message: "Failed to load transcript requests" });
    }
};

export const getTranscriptPreview = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.documentId)) {
            return res.status(400).json({ message: "Invalid transcript request ID" });
        }

        const document = await StudentDocument.findById(req.params.documentId)
            .populate("student", "name registrationNumber program faculty createdAt year")
            .lean();

        if (!document?.student?._id) {
            return res.status(404).json({ message: "Transcript request not found" });
        }

        const results = await AcademicResult.find({ student: document.student._id })
            .sort({ publishedAt: 1, createdAt: 1 })
            .lean();

        const semesterMap = results.reduce((accumulator, result) => {
            const semester = result.semester || "Unspecified Semester";

            if (!accumulator.has(semester)) {
                accumulator.set(semester, []);
            }

            accumulator.get(semester).push(result);
            return accumulator;
        }, new Map());

        const semesters = Array.from(semesterMap.entries()).map(([name, semesterResults]) => ({
            name,
            gpa: calculateWeightedGpa(semesterResults) || 0,
            courses: semesterResults.map((result) => ({
                code: result.unitCode,
                name: result.unitName,
                credits: Number(result.credits || 0),
                grade: result.grade || "N/A",
                points: Number(result.points || 0),
            })),
        }));

        res.json({
            studentName: document.student.name,
            studentId: document.student.registrationNumber,
            program: document.student.program,
            faculty: document.student.faculty,
            dateOfAdmission: formatDateValue(document.student.createdAt || new Date()),
            status: Number(document.student.year || 0) >= 4 ? "Graduated" : "In Progress",
            cgpa: calculateWeightedGpa(results) || 0,
            totalCredits: results.reduce((sum, result) => sum + Number(result.credits || 0), 0),
            semesters,
        });
    } catch (error) {
        console.error("Get transcript preview error:", error);
        res.status(500).json({ message: "Failed to generate transcript preview" });
    }
};

export const updateTranscriptRequestStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.documentId)) {
            return res.status(400).json({ message: "Invalid transcript request ID" });
        }

        const allowedStatuses = ["Processing", "Ready for Collection", "Collected", "Pending Fee Clearance"];
        const nextStatus = req.body?.status;

        if (!allowedStatuses.includes(nextStatus)) {
            return res.status(400).json({ message: "Invalid transcript status supplied." });
        }

        const document = await StudentDocument.findById(req.params.documentId).populate("student", "name registrationNumber");

        if (!document) {
            return res.status(404).json({ message: "Transcript request not found" });
        }

        document.status = nextStatus;
        await document.save();

        await createRegistratorAction({
            actorId: req.user._id,
            actionType: "transcript_status_updated",
            message: `${document.student?.name || "Student"} transcript marked as ${nextStatus}.`,
            targetType: "student_document",
            targetId: document._id.toString(),
            metadata: {
                registrationNumber: document.student?.registrationNumber,
                status: nextStatus,
            },
        });

        res.json({
            message: `Transcript request updated to ${nextStatus}.`,
            document: {
                id: document._id.toString(),
                status: mapDocumentStatus(document.status),
            },
        });
    } catch (error) {
        console.error("Update transcript request status error:", error);
        res.status(500).json({ message: "Failed to update transcript request" });
    }
};
