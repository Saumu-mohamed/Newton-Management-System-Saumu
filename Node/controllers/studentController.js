import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import AcademicEvent from "../models/AcademicEvent.js";
import CourseRegistration from "../models/CourseRegistration.js";
import AcademicResult from "../models/AcademicResult.js";
import StudentDocument from "../models/StudentDocument.js";
import MpesaTransaction from "../models/MpesaTransaction.js";

const formatCurrency = (value) => Number(value || 0);

const formatDisplayDate = (dateValue, options = {}) => {
    if (!dateValue) {
        return "TBA";
    }

    return new Intl.DateTimeFormat("en-KE", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...options,
    }).format(new Date(dateValue));
};

const formatDisplayTime = (dateValue) => {
    if (!dateValue) {
        return "TBA";
    }

    return new Intl.DateTimeFormat("en-KE", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(dateValue));
};

const humanizePaymentMethod = (method) => {
    const labels = {
        mpesa: "M-Pesa",
        bank: "Bank",
        cash: "Cash",
        card: "Card",
    };

    return labels[method] || "Unknown";
};

const roundToTwo = (value) => Math.round(Number(value || 0) * 100) / 100;

const calculateWeightedGpa = (results) => {
    const totalCredits = results.reduce((sum, result) => sum + Number(result.credits || 0), 0);

    if (!totalCredits) {
        return null;
    }

    const totalWeightedPoints = results.reduce(
        (sum, result) => sum + (Number(result.points || 0) * Number(result.credits || 0)),
        0
    );

    return roundToTwo(totalWeightedPoints / totalCredits);
};


// CREATE STUDENT
export const createStudent = async (req, res) => {
    try {

        const {
            name,
            email,
            course,
            year,
            registrationNumber,
            regNo,
            faculty,
            program,
            totalFee,
            campus,
            status,
        } = req.body;

        const existingStudent = await Student.findOne({ email });

        if (existingStudent) {
            return res.status(400).json({
                message: "Student already exists"
            });
        }

        const student = await Student.create({
            name,
            email,
            course,
            year,
            registrationNumber: registrationNumber || regNo,
            faculty: faculty || "General",
            program: program || course,
            totalFee: Number(totalFee || 120000),
            campus: campus || "Main",
            status: status || "Active",
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Student created successfully",
            student
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET ALL STUDENTS
export const getStudents = async (req, res) => {

    try {

        const students = await Student.find();
        res.status(200).json(students.map((student) => ({
            id: student._id.toString(),
            regNo: student.registrationNumber,
            name: student.name,
            email: student.email,
            course: student.program || student.course,
            year: student.year,
            campus: student.campus || "Main",
            status: student.status || "Active",
            faculty: student.faculty,
        })));

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};

export const getStudentDashboard = async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.user.email }).lean();

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found for the logged-in user"
            });
        }

        const [payments, upcomingEvents, courseRegistrations, results, documents] = await Promise.all([
            Payment.find({ student: student._id })
                .sort({ date: -1, createdAt: -1 })
                .limit(10)
                .lean(),
            AcademicEvent.find({
                status: "scheduled",
                startDate: { $gte: new Date() }
            })
                .sort({ startDate: 1 })
                .limit(8)
                .lean(),
            CourseRegistration.find({ student: student._id })
                .sort({ createdAt: -1 })
                .lean(),
            AcademicResult.find({ student: student._id })
                .sort({ publishedAt: -1, createdAt: -1 })
                .lean(),
            StudentDocument.find({ student: student._id })
                .sort({ updatedAt: -1, createdAt: -1 })
                .lean()
        ]);

        const totalFees = formatCurrency(student.totalFee);
        const paidAmount = formatCurrency(student.paidAmount);
        const feeBalance = Math.max(totalFees - paidAmount, 0);
        const feePercentage = totalFees > 0 ? (paidAmount / totalFees) * 100 : 0;

        const paymentHistory = payments.map((payment) => ({
            id: String(payment._id),
            date: formatDisplayDate(payment.date || payment.createdAt),
            isoDate: payment.date || payment.createdAt,
            description: "Fee Payment",
            amount: formatCurrency(payment.amount),
            method: humanizePaymentMethod(payment.method),
            reference: payment.transactionReference || payment.transactionRef || "N/A",
            status: payment.status === "success" ? "Completed" : payment.status === "failed" ? "Failed" : "Pending",
        }));

        const deadlines = upcomingEvents
            .filter((event) => event.type === "deadline" || event.type === "exam")
            .slice(0, 4)
            .map((event) => ({
                id: String(event._id),
                title: event.title,
                date: formatDisplayDate(event.startDate),
                type: event.type === "exam" ? "exam" : "deadline",
                urgent: event.type === "deadline",
                description: event.description || `${event.type} scheduled at ${event.location || "TBA"}`,
            }));

        const examSchedule = upcomingEvents
            .filter((event) => event.type === "exam")
            .map((event) => ({
                id: String(event._id),
                date: formatDisplayDate(event.startDate),
                time: formatDisplayTime(event.startDate),
                unit: event.title,
                venue: event.location || "TBA",
                seat: "TBA",
            }));

        const registeredUnits = courseRegistrations.map((course) => ({
            id: String(course._id),
            code: course.code,
            name: course.name,
            lecturer: course.lecturer,
            credits: Number(course.credits || 0),
            day: course.day,
            time: course.time,
            room: course.room,
            status: course.status,
            department: course.department,
            semester: course.semester,
            description: course.description,
        }));

        const groupedResults = results.reduce((accumulator, result) => {
            const semester = result.semester || "Unspecified Semester";

            if (!accumulator[semester]) {
                accumulator[semester] = [];
            }

            accumulator[semester].push(result);
            return accumulator;
        }, {});

        const semesterOrder = Object.keys(groupedResults).sort((left, right) => {
            const leftDate = groupedResults[left][0]?.publishedAt || groupedResults[left][0]?.createdAt || 0;
            const rightDate = groupedResults[right][0]?.publishedAt || groupedResults[right][0]?.createdAt || 0;

            return new Date(leftDate).getTime() - new Date(rightDate).getTime();
        });

        const gpaProgress = semesterOrder.map((semester) => {
            const semesterResults = groupedResults[semester];
            const credits = semesterResults.reduce((sum, result) => sum + Number(result.credits || 0), 0);

            return {
                semester,
                gpa: calculateWeightedGpa(semesterResults) || 0,
                credits,
            };
        });

        const latestSemester = semesterOrder.at(-1);
        const latestSemesterResults = latestSemester ? groupedResults[latestSemester] : [];

        const semesterPerformance = latestSemesterResults.map((result) => ({
            unit: result.unitCode,
            score: Number(result.totalScore || 0),
        }));

        const recentResults = results.slice(0, 8).map((result) => ({
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
        }));

        const totalCredits = results.reduce((sum, result) => sum + Number(result.credits || 0), 0);
        const currentCgpa = calculateWeightedGpa(results);

        const pendingDocuments = documents.map((document) => ({
            id: String(document._id),
            document: document.document,
            status: document.status,
            location: document.location,
        }));

        res.status(200).json({
            profile: {
                name: student.name,
                email: student.email,
                registrationNumber: student.registrationNumber,
                program: student.program,
                faculty: student.faculty,
                course: student.course,
                year: student.year,
            },
            summary: {
                feeBalance,
                totalFees,
                paidAmount,
                feePercentage,
                registeredUnitsCount: registeredUnits.filter((unit) => unit.status === "Active").length,
                currentCgpa,
                totalCredits,
                upcomingExamsCount: examSchedule.length,
            },
            registeredUnits,
            gpaProgress,
            semesterPerformance,
            recentResults,
            paymentHistory,
            deadlines,
            examSchedule,
            documents: pendingDocuments,
        });
    } catch (error) {
        console.error("Student dashboard error:", error);
        res.status(500).json({
            message: "Failed to load student dashboard"
        });
    }
};

export const initiateStudentPayment = async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.user.email });

        if (!student) {
            return res.status(404).json({ message: "Student profile not found for the logged-in user" });
        }

        const balance = Math.max(Number(student.totalFee || 0) - Number(student.paidAmount || 0), 0);
        const requestedAmount = Number(req.body?.amount || balance);
        const amount = Math.min(Math.max(requestedAmount, 0), balance);

        if (amount <= 0) {
            return res.status(400).json({ message: "No outstanding balance available for payment." });
        }

        const transactionRef = `STK-${Date.now()}-${String(student._id).slice(-4).toUpperCase()}`;

        const [payment] = await Promise.all([
            Payment.create({
                student: student._id,
                amount,
                method: "mpesa",
                transactionRef,
                transactionReference: transactionRef,
                status: "pending",
                date: new Date(),
            }),
            MpesaTransaction.create({
                phone: req.body?.phone || req.user.phone || "N/A",
                amount,
                transactionRef,
                status: "Pending Callback",
                resultDesc: "STK push initiated from student portal",
                timestamp: new Date(),
            }),
        ]);

        res.status(201).json({
            message: "Payment request created. Awaiting M-Pesa confirmation.",
            payment: {
                id: payment._id.toString(),
                amount,
                reference: transactionRef,
                status: "Pending",
            },
        });
    } catch (error) {
        console.error("Initiate student payment error:", error);
        res.status(500).json({ message: "Failed to initiate payment" });
    }
};


// GET SINGLE STUDENT
export const getStudentById = async (req, res) => {

    try {

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json(student);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};


// UPDATE STUDENT
export const updateStudent = async (req, res) => {

    try {

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
                course: req.body.course,
                program: req.body.program || req.body.course,
                year: req.body.year,
                campus: req.body.campus,
                status: req.body.status,
                registrationNumber: req.body.registrationNumber || req.body.regNo,
                faculty: req.body.faculty || "General",
            },
            { new: true }
        );

        res.status(200).json({
            message: "Student updated",
            student
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};


// DELETE STUDENT
export const deleteStudent = async (req, res) => {

    try {

        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Student deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};
