import mongoose from "mongoose";
import AcademicResult from "../models/AcademicResult.js";
import CourseRegistration from "../models/CourseRegistration.js";
import DashboardAction from "../models/DashboardAction.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { buildLecturerDashboardView } from "../services/lecturerDashboardService.js";

const average = (values) => {
    if (!values.length) {
        return 0;
    }

    return Math.round(values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length);
};

const getStudentStatus = ({ totalScore, attendance }) => {
    if (attendance !== null && attendance < 70) {
        return "Probation";
    }

    if (totalScore !== null && totalScore < 50) {
        return "At Risk";
    }

    return "Regular";
};

const deriveAttendance = (student, result) => {
    if (result) {
        return Math.min(98, Math.max(55, 60 + Math.round(Number(result.totalScore || 0) / 2)));
    }

    return Math.min(95, 65 + (Number(student.year || 1) * 5));
};

const createLecturerAction = async ({
    actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata = {},
}) => DashboardAction.create({
    area: "lecturer",
    actor: actorId,
    actionType,
    message,
    targetType,
    targetId,
    metadata,
});

const calculateGradeDetails = (score) => {
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

const getLecturerScope = (lecturer) => ({
    $or: [
        lecturer.department ? { course: lecturer.department } : null,
        lecturer.faculty ? { faculty: lecturer.faculty } : null,
    ].filter(Boolean),
});

export const getLecturerDashboard = async (req, res) => {
    try {
        const data = await buildLecturerDashboardView(req.user._id);

        if (data?.error) {
            return res.status(data.error.status).json({ message: data.error.message });
        }

        res.json(data);
    } catch (error) {
        console.error("Lecturer dashboard error:", error);
        res.status(500).json({ message: "Failed to load lecturer dashboard" });
    }
};

export const queueLecturerStudentAlerts = async (req, res) => {
    try {
        const lecturer = await User.findById(req.user._id).lean();

        if (!lecturer) {
            return res.status(404).json({ message: "Lecturer profile not found" });
        }

        const [students, results] = await Promise.all([
            Student.find({
                $or: [
                    lecturer.department ? { course: lecturer.department } : null,
                    lecturer.faculty ? { faculty: lecturer.faculty } : null,
                ].filter(Boolean),
            }).sort({ name: 1 }).lean(),
            AcademicResult.find().lean(),
        ]);

        const relevantStudentIds = new Set(students.map((student) => String(student._id)));
        const resultsByStudent = results.reduce((accumulator, result) => {
            const studentId = String(result.student);

            if (!relevantStudentIds.has(studentId)) {
                return accumulator;
            }

            if (!accumulator.has(studentId)) {
                accumulator.set(studentId, []);
            }

            accumulator.get(studentId).push(result);
            return accumulator;
        }, new Map());

        const recipients = students
            .map((student) => {
                const studentResults = resultsByStudent.get(String(student._id)) || [];
                const result = studentResults[0];
                const totalScore = result ? Number(result.totalScore || 0) : null;
                const attendance = deriveAttendance(student, result);
                const status = getStudentStatus({ totalScore, attendance });

                if (status === "Regular") {
                    return null;
                }

                return {
                    id: student._id.toString(),
                    name: student.name,
                    regNo: student.registrationNumber,
                    email: student.email,
                    status,
                };
            })
            .filter(Boolean);

        if (!recipients.length) {
            return res.status(400).json({ message: "No at-risk students found for the current lecturer." });
        }

        await createLecturerAction({
            actorId: req.user._id,
            actionType: "student_alerts_queued",
            message: `Academic alert emails queued for ${recipients.length} students.`,
            targetType: "student_alert_batch",
            targetId: req.user._id.toString(),
            metadata: {
                count: recipients.length,
                recipients: recipients.slice(0, 20),
            },
        });

        res.json({
            message: `Alert emails queued for ${recipients.length} students.`,
            count: recipients.length,
            recipients: recipients.slice(0, 10),
        });
    } catch (error) {
        console.error("Queue lecturer student alerts error:", error);
        res.status(500).json({ message: "Failed to queue student alerts" });
    }
};

export const getLecturerClasses = async (req, res) => {
    try {
        const lecturer = await User.findById(req.user._id).lean();

        if (!lecturer) {
            return res.status(404).json({ message: "Lecturer profile not found" });
        }

        const [registrations, students] = await Promise.all([
            CourseRegistration.find({
                $or: [
                    { lecturer: lecturer.name },
                    lecturer.department ? { department: lecturer.department } : null,
                ].filter(Boolean),
            }).sort({ semester: 1, code: 1 }).lean(),
            Student.find(getLecturerScope(lecturer)).lean(),
        ]);

        const studentsById = new Map(students.map((student) => [String(student._id), student]));
        const classMap = registrations.reduce((accumulator, registration) => {
            const key = registration.code;

            if (!accumulator.has(key)) {
                accumulator.set(key, {
                    id: registration._id.toString(),
                    code: registration.code,
                    name: registration.name,
                    program: registration.department || lecturer.department || "General",
                    year: studentsById.get(String(registration.student))?.year || 1,
                    students: 0,
                    schedule: registration.day && registration.time ? `${registration.day} ${registration.time}` : "TBA",
                    room: registration.room || "TBA",
                    semester: registration.semester || "Current Semester",
                });
            }

            accumulator.get(key).students += 1;
            return accumulator;
        }, new Map());

        const classes = Array.from(classMap.values());

        res.json({
            classes,
            stats: {
                totalClasses: classes.length,
                totalStudents: classes.reduce((sum, item) => sum + Number(item.students || 0), 0),
                weeklyHours: classes.reduce((sum, item) => sum + (item.schedule.includes("-") ? 2 : 1), 0),
                activeSemester: classes[0]?.semester || "Current Semester",
            },
        });
    } catch (error) {
        console.error("Get lecturer classes error:", error);
        res.status(500).json({ message: "Failed to load lecturer classes" });
    }
};

export const getLecturerGradebook = async (req, res) => {
    try {
        const lecturer = await User.findById(req.user._id).lean();

        if (!lecturer) {
            return res.status(404).json({ message: "Lecturer profile not found" });
        }

        const registrations = await CourseRegistration.find({
            $or: [
                { lecturer: lecturer.name },
                lecturer.department ? { department: lecturer.department } : null,
            ].filter(Boolean),
        })
            .populate("student", "name registrationNumber year")
            .sort({ code: 1, createdAt: 1 })
            .lean();

        const unitsMap = registrations.reduce((accumulator, registration) => {
            if (!accumulator.has(registration.code)) {
                accumulator.set(registration.code, {
                    code: registration.code,
                    name: registration.name,
                    status: "pending",
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    semester: registration.semester || "Current Semester",
                    students: [],
                });
            }

            accumulator.get(registration.code).students.push(registration.student);
            return accumulator;
        }, new Map());

        const requestedUnit = req.query?.unitCode || Array.from(unitsMap.keys())[0];
        const selectedUnit = unitsMap.get(requestedUnit);

        if (!selectedUnit) {
            return res.json({ units: [], selectedUnit: null, students: [] });
        }

        const studentIds = selectedUnit.students.map((student) => student?._id).filter(Boolean);
        const results = await AcademicResult.find({
            student: { $in: studentIds },
            unitCode: selectedUnit.code,
        }).lean();

        const resultsByStudent = new Map(results.map((result) => [String(result.student), result]));
        const students = selectedUnit.students.map((student) => {
            const result = resultsByStudent.get(String(student._id));
            const total = Number(result?.totalScore || 0);

            return {
                id: student._id.toString(),
                regNo: student.registrationNumber,
                name: student.name,
                cat1: Number(result?.cat1Score ?? 0),
                cat2: Number(result?.cat2Score ?? 0),
                assignment: Number(result?.assignmentScore ?? 0),
                exam: result?.examScore ?? null,
                total: total || null,
                grade: result?.grade || "--",
            };
        });

        const unitStatus = results.length > 0
            ? results.every((result) => result.status === "Submitted" || result.status === "Published")
                ? "submitted"
                : "pending"
            : "pending";

        const units = Array.from(unitsMap.values()).map((unit) => {
            const unitResults = results.filter((result) => result.unitCode === unit.code);
            const hasPublished = unitResults.some((result) => result.status === "Submitted" || result.status === "Published");

            return {
                code: unit.code,
                name: unit.name,
                status: hasPublished && unit.code === selectedUnit.code ? unitStatus : "pending",
                deadline: unit.deadline,
            };
        });

        res.json({
            units,
            selectedUnit: {
                code: selectedUnit.code,
                name: selectedUnit.name,
                semester: selectedUnit.semester,
                status: unitStatus,
            },
            students,
        });
    } catch (error) {
        console.error("Get lecturer gradebook error:", error);
        res.status(500).json({ message: "Failed to load gradebook" });
    }
};

const persistLecturerGrades = async ({ req, res, submit }) => {
    const session = await mongoose.startSession();

    try {
        const lecturer = await User.findById(req.user._id).lean();

        if (!lecturer) {
            return res.status(404).json({ message: "Lecturer profile not found" });
        }

        const gradeRows = Array.isArray(req.body?.students) ? req.body.students : [];

        if (!gradeRows.length) {
            return res.status(400).json({ message: "No student grades supplied." });
        }

        const registrations = await CourseRegistration.find({
            code: req.params.unitCode,
            $or: [
                { lecturer: lecturer.name },
                lecturer.department ? { department: lecturer.department } : null,
            ].filter(Boolean),
        }).session(session);

        if (!registrations.length) {
            return res.status(404).json({ message: "Selected unit was not found for this lecturer." });
        }

        await session.withTransaction(async () => {
            for (const row of gradeRows) {
                const registration = registrations.find((item) => String(item.student) === String(row.id));

                if (!registration) {
                    continue;
                }

                const cat1 = Number(row.cat1 || 0);
                const cat2 = Number(row.cat2 || 0);
                const assignment = Number(row.assignment || 0);
                const exam = row.exam === null || row.exam === undefined || row.exam === "" ? 0 : Number(row.exam);
                const catScore = cat1 + cat2 + assignment;
                const totalScore = catScore + exam;
                const { grade, points } = calculateGradeDetails(totalScore);

                await AcademicResult.findOneAndUpdate(
                    {
                        student: registration.student,
                        unitCode: registration.code,
                    },
                    {
                        $set: {
                            semester: registration.semester || "Current Semester",
                            unitCode: registration.code,
                            unitName: registration.name,
                            lecturer: lecturer.name,
                            cat1Score: cat1,
                            cat2Score: cat2,
                            assignmentScore: assignment,
                            catScore,
                            examScore: exam,
                            totalScore,
                            grade,
                            points,
                            credits: Number(registration.credits || 15),
                            status: submit ? "Submitted" : "Draft",
                            submittedAt: submit ? new Date() : null,
                            submittedBy: submit ? req.user._id : null,
                            publishedAt: new Date(),
                        },
                    },
                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true,
                        session,
                    }
                );
            }
        });

        await createLecturerAction({
            actorId: req.user._id,
            actionType: submit ? "grades_submitted" : "grades_saved",
            message: `${req.params.unitCode} grades ${submit ? "submitted for approval" : "saved as draft"}.`,
            targetType: "academic_result_batch",
            targetId: req.params.unitCode,
            metadata: {
                unitCode: req.params.unitCode,
                count: gradeRows.length,
            },
        });

        res.json({
            message: `${req.params.unitCode} grades ${submit ? "submitted for approval" : "saved as draft"}.`,
        });
    } catch (error) {
        console.error("Persist lecturer grades error:", error);
        res.status(500).json({ message: "Failed to save lecturer grades" });
    } finally {
        await session.endSession();
    }
};

export const saveLecturerGrades = async (req, res) => persistLecturerGrades({ req, res, submit: false });

export const submitLecturerGrades = async (req, res) => persistLecturerGrades({ req, res, submit: true });
