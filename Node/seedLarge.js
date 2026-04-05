import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import AcademicEvent from "./models/AcademicEvent.js";
import AcademicResult from "./models/AcademicResult.js";
import CollegeApproval from "./models/CollegeApproval.js";
import CourseRegistration from "./models/CourseRegistration.js";
import Mpesa from "./models/MpesaTransaction.js";
import Payment from "./models/Payment.js";
import Student from "./models/Student.js";
import StudentDocument from "./models/StudentDocument.js";
import User from "./models/User.js";

dotenv.config();

const faculties = ["Computing", "Business", "Engineering", "Health Sciences"];
const programsByFaculty = {
    Computing: ["Computer Science", "Information Technology", "Software Engineering"],
    Business: ["Finance", "Accounting", "Procurement"],
    Engineering: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering"],
    "Health Sciences": ["Nursing", "Public Health", "Clinical Medicine"],
};

const departmentsByFaculty = {
    Computing: ["Computer Science", "Informatics"],
    Business: ["Finance", "Accounting"],
    Engineering: ["Civil Engineering", "Electrical Engineering"],
    "Health Sciences": ["Nursing", "Public Health"],
};

const unitTemplatesByFaculty = {
    Computing: [
        { code: "CSC101", name: "Programming Fundamentals" },
        { code: "CSC102", name: "Data Structures" },
        { code: "CSC201", name: "Database Systems" },
        { code: "CSC202", name: "Computer Networks" },
        { code: "CSC301", name: "Operating Systems" },
        { code: "CSC302", name: "Software Engineering" },
        { code: "CSC401", name: "Artificial Intelligence" },
        { code: "CSC402", name: "Distributed Systems" },
    ],
    Business: [
        { code: "BUS101", name: "Financial Accounting" },
        { code: "BUS102", name: "Business Statistics" },
        { code: "BUS201", name: "Microeconomics" },
        { code: "BUS202", name: "Financial Management" },
        { code: "BUS301", name: "Business Law" },
        { code: "BUS302", name: "Taxation" },
        { code: "BUS401", name: "Strategic Management" },
        { code: "BUS402", name: "Investment Analysis" },
    ],
    Engineering: [
        { code: "ENG101", name: "Engineering Mathematics" },
        { code: "ENG102", name: "Mechanics" },
        { code: "ENG201", name: "Materials Science" },
        { code: "ENG202", name: "Thermodynamics" },
        { code: "ENG301", name: "Structural Analysis" },
        { code: "ENG302", name: "Applied Design" },
        { code: "ENG401", name: "Project Management" },
        { code: "ENG402", name: "Industrial Systems" },
    ],
    "Health Sciences": [
        { code: "HS101", name: "Human Anatomy" },
        { code: "HS102", name: "Clinical Practice" },
        { code: "HS201", name: "Community Health" },
        { code: "HS202", name: "Health Research Methods" },
        { code: "HS301", name: "Patient Care Management" },
        { code: "HS302", name: "Pharmacology" },
        { code: "HS401", name: "Medical Ethics" },
        { code: "HS402", name: "Healthcare Leadership" },
    ],
};

const documentStatuses = ["Processing", "Ready for Collection", "Pending Fee Clearance"];
const paymentMethods = ["mpesa", "bank", "card", "cash"];
const paymentStatuses = ["success", "success", "success", "pending", "failed"];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const timeSlots = ["8:00-10:00", "10:00-12:00", "14:00-16:00", "16:00-18:00"];

const sampleNames = [
    "Amina Yusuf", "Brian Otieno", "Caroline Wambui", "Daniel Kiptoo", "Esther Achieng",
    "Felix Mwangi", "Gloria Njeri", "Hassan Ali", "Irene Jepkoech", "John Kariuki",
    "Kevin Ouma", "Lilian Auma", "Mercy Atieno", "Nicholas Mutua", "Olive Chebet",
    "Patrick Maina", "Queenter Akinyi", "Ruth Wanjiku", "Samuel Kiprono", "Teresia Naliaka",
];

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const getGradeDetails = (score) => {
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

const buildUsers = async () => {
    const password = await bcrypt.hash("Password123!", 10);

    return [
        {
            name: "System Super Admin",
            email: "superadmin@cms.edu",
            password,
            role: "superadmin",
            campus: "Main Campus",
            isFirstLogin: false,
        },
        {
            name: "Clara Muthoni",
            email: "collegeadmin@cms.edu",
            password,
            role: "collegeadmin",
            faculty: "Computing",
            campus: "Main Campus",
            isFirstLogin: false,
        },
        {
            name: "Peter Kamau",
            email: "finance@cms.edu",
            password,
            role: "finance",
            department: "Finance",
            campus: "Main Campus",
            isFirstLogin: false,
        },
        {
            name: "Janet Wairimu",
            email: "registrator@cms.edu",
            password,
            role: "registrator",
            department: "Registry",
            campus: "Main Campus",
            isFirstLogin: false,
        },
        {
            name: "Dr. Allan Ndegwa",
            email: "lecturer1@cms.edu",
            password,
            role: "lecturer",
            department: "Computer Science",
            faculty: "Computing",
            campus: "Main Campus",
            isFirstLogin: false,
        },
        {
            name: "Dr. Faith Akinyi",
            email: "lecturer2@cms.edu",
            password,
            role: "lecturer",
            department: "Finance",
            faculty: "Business",
            campus: "Main Campus",
            isFirstLogin: false,
        },
        {
            name: "Dr. Victor Kiplangat",
            email: "lecturer3@cms.edu",
            password,
            role: "lecturer",
            department: "Civil Engineering",
            faculty: "Engineering",
            campus: "Main Campus",
            isFirstLogin: false,
        },
        {
            name: "Dr. Mercy Ochieng",
            email: "lecturer4@cms.edu",
            password,
            role: "lecturer",
            department: "Nursing",
            faculty: "Health Sciences",
            campus: "City Campus",
            isFirstLogin: false,
        },
    ];
};

const buildStudents = (users) => {
    const students = [];
    const collegeAdmin = users.find((user) => user.role === "collegeadmin");
    const registrator = users.find((user) => user.role === "registrator");

    for (let index = 1; index <= 120; index += 1) {
        const faculty = randomItem(faculties);
        const program = randomItem(programsByFaculty[faculty]);
        const department = randomItem(departmentsByFaculty[faculty]);
        const year = Math.floor(Math.random() * 4) + 1;
        const totalFee = 90000 + (year * 15000) + Math.floor(Math.random() * 30000);
        const paidAmount = Math.floor(totalFee * (0.2 + Math.random() * 0.8));
        const name = `${randomItem(sampleNames)} ${index}`;
        const creator = faculty === "Computing" ? collegeAdmin : registrator;

        students.push({
            name,
            registrationNumber: `REG${(1000 + index).toString()}`,
            program,
            faculty,
            course: department,
            year,
            email: `student${index}@cms.edu`,
            totalFee,
            paidAmount,
            lastPayment: new Date(Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000),
            createdBy: creator?._id,
        });
    }

    return students;
};

const buildPayments = (students) => {
    const payments = [];
    const mpesaTransactions = [];

    students.forEach((student, studentIndex) => {
        const paymentCount = Math.floor(Math.random() * 3) + 1;

        for (let index = 0; index < paymentCount; index += 1) {
            const amount = Math.floor(Math.random() * 35000) + 5000;
            const method = randomItem(paymentMethods);
            const status = randomItem(paymentStatuses);
            const createdAt = new Date(Date.now() - Math.floor(Math.random() * 120) * 24 * 60 * 60 * 1000);
            const transactionRef = `TXN-${studentIndex + 1}-${index + 1}-${createdAt.getTime()}`;

            payments.push({
                student: student._id,
                amount,
                method,
                transactionRef,
                transactionReference: transactionRef,
                status,
                date: createdAt,
                createdAt,
                updatedAt: createdAt,
            });

            if (method === "mpesa") {
                mpesaTransactions.push({
                    phone: `07${Math.floor(10000000 + Math.random() * 89999999)}`,
                    amount,
                    transactionRef,
                    status: status === "success" ? "confirmed" : status === "pending" ? "Pending Callback" : "Failed",
                    mpesaReceiptNumber: status === "success" ? `MPESA${createdAt.getTime()}` : undefined,
                    timestamp: createdAt,
                    createdAt,
                    updatedAt: createdAt,
                });
            }
        }
    });

    return { payments, mpesaTransactions };
};

const buildCourseRegistrations = (students, users) => {
    const lecturersByFaculty = users
        .filter((user) => user.role === "lecturer")
        .reduce((accumulator, lecturer) => {
            if (!accumulator.has(lecturer.faculty)) {
                accumulator.set(lecturer.faculty, []);
            }

            accumulator.get(lecturer.faculty).push(lecturer);
            return accumulator;
        }, new Map());

    return students.flatMap((student, studentIndex) => {
        const templates = unitTemplatesByFaculty[student.faculty] || unitTemplatesByFaculty.Computing;
        const lecturerPool = lecturersByFaculty.get(student.faculty) || [];
        const currentUnitCount = 4 + (studentIndex % 2);
        const currentTemplates = templates.slice(0, currentUnitCount);

        return currentTemplates.map((unit, unitIndex) => {
            const lecturer = lecturerPool.length > 0
                ? lecturerPool[unitIndex % lecturerPool.length]
                : null;

            return {
                student: student._id,
                code: `${unit.code}-${student.year}`,
                name: unit.name,
                lecturer: lecturer?.name || "TBA",
                credits: 15,
                day: weekDays[(studentIndex + unitIndex) % weekDays.length],
                time: timeSlots[(studentIndex + unitIndex) % timeSlots.length],
                room: `R-${100 + ((studentIndex + unitIndex) % 40)}`,
                status: unitIndex === currentUnitCount - 1 && studentIndex % 9 === 0 ? "Dropped" : "Active",
                department: student.course,
                semester: `Year ${student.year} Semester ${studentIndex % 2 === 0 ? 1 : 2}`,
                description: `${unit.name} assigned to ${student.name}.`,
                overrideStatus: studentIndex % 8 === 0 && unitIndex === 0 ? "Approved" : "Pending",
                reviewStatus: studentIndex % 9 === 0 ? "Pending" : studentIndex % 11 === 0 ? "Rejected" : "Approved",
            };
        });
    });
};

const buildAcademicResults = (students) => (
    students.flatMap((student, studentIndex) => {
        const templates = unitTemplatesByFaculty[student.faculty] || unitTemplatesByFaculty.Computing;
        const resultCount = Math.max(4, student.year * 3);

        return Array.from({ length: resultCount }, (_, index) => {
            const template = templates[index % templates.length];
            const cat1Score = Math.min(30, 8 + ((studentIndex + index) % 18));
            const cat2Score = Math.min(30, 7 + ((studentIndex * 2 + index) % 17));
            const assignmentScore = Math.min(10, 4 + ((studentIndex + index * 2) % 7));
            const examScore = 20 + ((studentIndex * 5 + index * 7) % 45);
            const catScore = cat1Score + cat2Score + assignmentScore;
            const totalScore = Math.min(catScore + examScore, 100);
            const { grade, points } = getGradeDetails(totalScore);
            const semesterIndex = Math.floor(index / 3) + 1;
            const yearLevel = Math.min(Math.ceil(semesterIndex / 2), 4);

            return {
                student: student._id,
                semester: `Year ${yearLevel} Semester ${semesterIndex % 2 === 0 ? 2 : 1}`,
                unitCode: `${template.code}-${yearLevel}`,
                unitName: template.name,
                cat1Score,
                cat2Score,
                assignmentScore,
                catScore: cat1Score + cat2Score + assignmentScore,
                examScore,
                totalScore,
                grade,
                points,
                credits: 15,
                lecturer: student.faculty === "Computing"
                    ? "Dr. Allan Ndegwa"
                    : student.faculty === "Business"
                        ? "Dr. Faith Akinyi"
                        : student.faculty === "Engineering"
                            ? "Dr. Victor Kiplangat"
                            : "Dr. Mercy Ochieng",
                status: index % 4 === 0 ? "Draft" : index % 5 === 0 ? "Submitted" : "Published",
                publishedAt: new Date(Date.now() - (index + 5) * 24 * 60 * 60 * 1000),
            };
        });
    })
);

const buildStudentDocuments = (students) => (
    students
        .filter((_, index) => index % 2 === 0 || index % 5 === 0)
        .flatMap((student, index) => {
            const documents = [
                {
                    student: student._id,
                    document: "Transcript Request",
                    requestType: index % 3 === 0 ? "Unofficial" : "Official",
                    copies: (index % 3) + 1,
                    fee: index % 3 === 0 ? 0 : ((index % 3) + 1) * 250,
                    status: documentStatuses[index % documentStatuses.length],
                    location: "Registry Office",
                },
            ];

            if (student.year >= 4) {
                documents.push({
                    student: student._id,
                    document: "Graduation Clearance",
                    requestType: "Official",
                    copies: 1,
                    fee: 500,
                    status: index % 3 === 0 ? "Ready for Collection" : "Processing",
                    location: "Graduation Office",
                });
            }

            return documents;
        })
);

const buildApprovals = () => ([
    {
        type: "Course Update",
        from: "School of Computing",
        department: "Computer Science",
        status: "Pending",
        date: new Date(),
    },
    {
        type: "Budget Adjustment",
        from: "School of Business",
        department: "Finance",
        status: "Urgent",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        type: "Teaching Allocation",
        from: "School of Engineering",
        department: "Civil Engineering",
        status: "Review",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
]);

const buildEvents = () => ([
    {
        title: "Semester Examination Window",
        description: "Main semester exams begin for all schools.",
        type: "exam",
        location: "Main Campus",
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: "scheduled",
    },
    {
        title: "Fee Clearance Deadline",
        description: "Last day for finance clearance before exams.",
        type: "deadline",
        location: "Finance Office",
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: "scheduled",
    },
    {
        title: "Department Heads Meeting",
        description: "College admin strategy check-in.",
        type: "meeting",
        location: "Senate Boardroom",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "scheduled",
    },
]);

await mongoose.connect(process.env.MONGO_URI);

await Promise.all([
    AcademicEvent.deleteMany({}),
    AcademicResult.deleteMany({}),
    CollegeApproval.deleteMany({}),
    CourseRegistration.deleteMany({}),
    Mpesa.deleteMany({}),
    Payment.deleteMany({}),
    Student.deleteMany({}),
    StudentDocument.deleteMany({}),
    User.deleteMany({}),
]);

const users = await User.insertMany(await buildUsers());
const students = await Student.insertMany(buildStudents(users));
const { payments, mpesaTransactions } = buildPayments(students);
const registrations = buildCourseRegistrations(students, users);
const results = buildAcademicResults(students);
const documents = buildStudentDocuments(students);

await Promise.all([
    AcademicEvent.insertMany(buildEvents().map((event) => ({
        ...event,
        createdBy: users[1]?._id,
    }))),
    AcademicResult.insertMany(results),
    CollegeApproval.insertMany(buildApprovals().map((approval) => ({
        ...approval,
        reviewedBy: null,
    }))),
    CourseRegistration.insertMany(registrations),
    Mpesa.insertMany(mpesaTransactions),
    Payment.insertMany(payments),
    StudentDocument.insertMany(documents),
]);

console.log("Seed complete.");
console.log(`Users: ${users.length}`);
console.log(`Students: ${students.length}`);
console.log(`Registrations: ${registrations.length}`);
console.log(`Results: ${results.length}`);
console.log(`Documents: ${documents.length}`);
console.log("Login users:");
console.log("superadmin@cms.edu / Password123!");
console.log("collegeadmin@cms.edu / Password123!");
console.log("finance@cms.edu / Password123!");
console.log("registrator@cms.edu / Password123!");
console.log("lecturer1@cms.edu / Password123!");

process.exit(0);
