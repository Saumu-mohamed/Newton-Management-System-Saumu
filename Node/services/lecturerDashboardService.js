import AcademicResult from "../models/AcademicResult.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

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

export const buildLecturerDashboardView = async (userId) => {
    const lecturer = await User.findById(userId).lean();

    if (!lecturer) {
        return { error: { status: 404, message: "Lecturer profile not found" } };
    }

    const [students, registrations, results] = await Promise.all([
        Student.find({
            $or: [
                lecturer.department ? { course: lecturer.department } : null,
                lecturer.faculty ? { faculty: lecturer.faculty } : null,
            ].filter(Boolean),
        }).sort({ name: 1 }).lean(),
        CourseRegistration.find({
            $or: [
                { lecturer: lecturer.name },
                lecturer.department ? { department: lecturer.department } : null,
            ].filter(Boolean),
        }).sort({ createdAt: -1 }).lean(),
        AcademicResult.find().sort({ publishedAt: -1, createdAt: -1 }).lean(),
    ]);

    const relevantStudentIds = new Set(students.map((student) => String(student._id)));
    const relevantResults = results.filter((result) => relevantStudentIds.has(String(result.student)));
    const resultsByStudent = relevantResults.reduce((accumulator, result) => {
        const studentId = String(result.student);

        if (!accumulator.has(studentId)) {
            accumulator.set(studentId, []);
        }

        accumulator.get(studentId).push(result);
        return accumulator;
    }, new Map());

    const derivedUnitMap = students.reduce((accumulator, student) => {
        const key = student.course || "General";

        if (!accumulator.has(key)) {
            accumulator.set(key, {
                id: key,
                code: key,
                name: student.program || key,
                students: 0,
                catSubmitted: false,
                examSubmitted: false,
                deadline: "TBA",
                semester: `Year ${student.year || 1}`,
            });
        }

        accumulator.get(key).students += 1;
        return accumulator;
    }, new Map());

    registrations.forEach((registration) => {
        const key = registration.code || registration.name;

        if (!derivedUnitMap.has(key)) {
            derivedUnitMap.set(key, {
                id: String(registration._id),
                code: registration.code,
                name: registration.name,
                students: 0,
                catSubmitted: false,
                examSubmitted: false,
                deadline: "TBA",
                semester: registration.semester || "Current Semester",
                day: registration.day,
                time: registration.time,
                room: registration.room,
                type: "Class",
            });
        }
    });

    relevantResults.forEach((result) => {
        const key = result.unitCode || result.unitName;

        if (!derivedUnitMap.has(key)) {
            derivedUnitMap.set(key, {
                id: String(result._id),
                code: result.unitCode,
                name: result.unitName,
                students: 0,
                catSubmitted: false,
                examSubmitted: false,
                deadline: "TBA",
                semester: result.semester || "Current Semester",
            });
        }

        const unit = derivedUnitMap.get(key);
        unit.catSubmitted = unit.catSubmitted || Number(result.catScore || 0) > 0;
        unit.examSubmitted = unit.examSubmitted || Number(result.examScore || 0) > 0;
    });

    const assignedUnits = Array.from(derivedUnitMap.values()).slice(0, 8);

    const classPerformance = assignedUnits
        .map((unit) => {
            const unitResults = relevantResults.filter((result) => result.unitCode === unit.code || result.unitName === unit.name);

            if (!unitResults.length) {
                return {
                    unit: unit.code,
                    average: 0,
                    highest: 0,
                    lowest: 0,
                    submitted: 0,
                };
            }

            const totals = unitResults.map((result) => Number(result.totalScore || 0));

            return {
                unit: unit.code,
                average: average(totals),
                highest: Math.max(...totals),
                lowest: Math.min(...totals),
                submitted: unitResults.length,
            };
        })
        .filter((unit) => unit.submitted > 0);

    const gradeMap = relevantResults.reduce((accumulator, result) => {
        const grade = result.grade || "Ungraded";
        accumulator[grade] = (accumulator[grade] || 0) + 1;
        return accumulator;
    }, {});

    const gradeDistribution = Object.entries(gradeMap).map(([name, value]) => ({ name, value }));

    const pendingGrades = assignedUnits
        .map((unit, index) => ({
            id: unit.id || `${unit.code}-${index}`,
            unit: unit.code,
            type: unit.catSubmitted ? "Exam Results" : "CAT Results",
            students: unit.students,
            due: unit.catSubmitted ? "1 week" : "3 days",
            urgency: unit.catSubmitted ? "Medium" : "High",
        }))
        .filter((unit) => !unit.catSubmitted || !assignedUnits.find((item) => item.code === unit.unit)?.examSubmitted)
        .slice(0, 6);

    const todaySchedule = registrations
        .filter((registration) => registration.day && registration.time)
        .slice(0, 4)
        .map((registration) => ({
            id: String(registration._id),
            time: registration.time,
            unit: registration.code,
            room: registration.room || "TBA",
            type: "Lecture",
            status: "Upcoming",
        }));

    const firstUnit = assignedUnits[0];
    const classList = students
        .filter((student) => !firstUnit || student.course === firstUnit.code)
        .slice(0, 20)
        .map((student) => {
            const studentResults = resultsByStudent.get(String(student._id)) || [];
            const result = firstUnit
                ? studentResults.find((item) => item.unitCode === firstUnit.code || item.unitName === firstUnit.name)
                : studentResults[0];
            const totalScore = result ? Number(result.totalScore || 0) : null;
            const attendance = deriveAttendance(student, result);

            return {
                id: String(student._id),
                regNo: student.registrationNumber,
                name: student.name,
                cat1: result ? Number(result.catScore || 0) : null,
                cat2: result && Number(result.examScore || 0) > 0 ? Number(result.examScore || 0) : null,
                attendance,
                status: getStudentStatus({ totalScore, attendance }),
            };
        });

    const studentAlerts = classList
        .filter((student) => student.status !== "Regular")
        .map((student) => ({
            id: student.id,
            student: student.name,
            regNo: student.regNo,
            unit: firstUnit?.code || "General",
            issue: student.status === "Probation" ? "Low attendance trend" : "Below target assessment score",
            action: student.status === "Probation" ? "Contact Required" : "Warning Issued",
        }));

    const weeklyScheduleMap = registrations.reduce((accumulator, registration) => {
        const day = registration.day || "TBA";

        if (!accumulator.has(day)) {
            accumulator.set(day, {
                day,
                classes: 0,
                hours: 0,
            });
        }

        const current = accumulator.get(day);
        current.classes += 1;
        current.hours += registration.time && String(registration.time).includes("-") ? 2 : 1;
        return accumulator;
    }, new Map());

    return {
        profile: {
            name: lecturer.name,
            department: lecturer.department || lecturer.faculty || "General",
        },
        kpis: {
            assignedUnits: assignedUnits.length,
            totalStudents: assignedUnits.reduce((sum, unit) => sum + Number(unit.students || 0), 0),
            pendingGrades: pendingGrades.length,
            todayClasses: todaySchedule.length,
        },
        assignedUnits,
        classPerformance,
        gradeDistribution,
        pendingGrades,
        todaySchedule,
        weekSchedule: Array.from(weeklyScheduleMap.values()),
        classList,
        studentAlerts,
        highlightedUnit: firstUnit?.code || "Current Class",
        highlightedUnitName: firstUnit?.name || "No assigned unit yet",
    };
};
