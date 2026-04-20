import AcademicResult from "../models/AcademicResult.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Student from "../models/Student.js";

const roundToTwo = (value) => Math.round(Number(value || 0) * 100) / 100;

const calculateWeightedGpa = (results) => {
    const totalCredits = results.reduce((sum, result) => sum + Number(result.credits || 0), 0);

    if (!totalCredits) {
        return 0;
    }

    const weightedPoints = results.reduce(
        (sum, result) => sum + (Number(result.points || 0) * Number(result.credits || 0)),
        0
    );

    return roundToTwo(weightedPoints / totalCredits);
};

const resolveClassStanding = (cgpa) => {
    if (cgpa >= 3.5) {
        return "First Class";
    }

    if (cgpa >= 3.0) {
        return "Second Class Upper";
    }

    if (cgpa >= 2.5) {
        return "Second Class Lower";
    }

    return "Pass";
};

const mapResultRow = (result) => ({
    id: String(result._id),
    semester: result.semester,
    unit: result.unitCode,
    name: result.unitName,
    cat: Number(result.catScore || 0),
    exam: Number(result.examScore || 0),
    total: Number(result.totalScore || 0),
    grade: result.grade || "N/A",
    points: Number(result.points || 0),
    credits: Number(result.credits || 0),
    status: result.status || "Published",
    publishedAt: result.publishedAt || result.createdAt,
});

const mapUnitRow = (registration) => ({
    id: String(registration._id),
    code: registration.code,
    name: registration.name,
    credits: Number(registration.credits || 0),
    lecturer: registration.lecturer || "TBA",
    semester: registration.semester || "Current Semester",
    reviewStatus: registration.reviewStatus || "Pending",
    status: registration.status || "Active",
});

export const buildStudentResultsView = async ({ userEmail, semester }) => {
    const student = await Student.findOne({ email: userEmail }).lean();

    if (!student) {
        return { error: { status: 404, message: "Student profile not found for the logged-in user" } };
    }

    const [results, registrations] = await Promise.all([
        AcademicResult.find({ student: student._id, status: "Published" })
            .sort({ publishedAt: -1, createdAt: -1 })
            .lean(),
        CourseRegistration.find({ student: student._id, status: "Active" })
            .sort({ semester: -1, createdAt: -1 })
            .lean(),
    ]);

    const semesterMap = results.reduce((accumulator, result) => {
        const key = result.semester || "Unspecified Semester";

        if (!accumulator.has(key)) {
            accumulator.set(key, []);
        }

        accumulator.get(key).push(result);
        return accumulator;
    }, new Map());

    const semesterOptions = Array.from(semesterMap.keys());
    const selectedSemester = semester && semesterMap.has(semester)
        ? semester
        : semesterOptions[0] || "";
    const selectedSemesterResults = selectedSemester
        ? semesterMap.get(selectedSemester) || []
        : [];
    const selectedSemesterUnits = registrations.filter((registration) => (
        !selectedSemester || registration.semester === selectedSemester
    ));

    const academicHistory = semesterOptions.map((semesterName) => {
        const semesterResults = semesterMap.get(semesterName) || [];
        const credits = semesterResults.reduce((sum, result) => sum + Number(result.credits || 0), 0);
        const gpa = calculateWeightedGpa(semesterResults);

        return {
            semester: semesterName,
            credits,
            gpa,
            status: semesterName === selectedSemester ? "Selected" : "Completed",
            resultsCount: semesterResults.length,
        };
    });

    const cgpa = calculateWeightedGpa(results);
    const totalCredits = results.reduce((sum, result) => sum + Number(result.credits || 0), 0);
    const currentSemesterGpa = selectedSemesterResults.length
        ? calculateWeightedGpa(selectedSemesterResults)
        : 0;
    const unitsSummary = {
        totalUnits: selectedSemesterUnits.length,
        totalCredits: selectedSemesterUnits.reduce((sum, unit) => sum + Number(unit.credits || 0), 0),
        approvedUnits: selectedSemesterUnits.filter((unit) => unit.reviewStatus === "Approved").length,
        pendingUnits: selectedSemesterUnits.filter((unit) => unit.reviewStatus === "Pending").length,
    };

    return {
        profile: {
            name: student.name,
            registrationNumber: student.registrationNumber,
            program: student.program || student.course,
            faculty: student.faculty,
            year: student.year,
        },
        summary: {
            currentGpa: currentSemesterGpa,
            cgpa,
            totalCredits,
            classStanding: resolveClassStanding(cgpa),
            selectedSemester,
        },
        semesterOptions,
        currentResults: selectedSemesterResults.map(mapResultRow),
        academicHistory,
        unitsSummary,
        currentUnits: selectedSemesterUnits.map(mapUnitRow),
    };
};
