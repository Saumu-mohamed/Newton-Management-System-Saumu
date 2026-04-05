import mongoose from "mongoose";
import AcademicEvent from "../models/AcademicEvent.js";
import Course from "../models/Course.js";
import CourseRegistration from "../models/CourseRegistration.js";
import Department from "../models/Department.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

const formatDate = (value) => new Date(value).toISOString().split("T")[0];

const buildCourseStatus = (status) => {
    if (status === "Archived" || status === "Inactive") {
        return status;
    }

    return "Active";
};

const syncDerivedCourses = async () => {
    const registrations = await CourseRegistration.find().lean();

    if (!registrations.length) {
        return;
    }

    const grouped = registrations.reduce((accumulator, registration) => {
        const key = registration.code;

        if (!accumulator.has(key)) {
            accumulator.set(key, {
                code: registration.code,
                title: registration.name,
                department: registration.department || "General",
                faculty: "General",
                semester: registration.semester || "Current Semester",
                credits: Number(registration.credits || 0),
                status: "Active",
            });
        }

        return accumulator;
    }, new Map());

    await Course.bulkWrite(
        Array.from(grouped.values()).map((course) => ({
            updateOne: {
                filter: { code: course.code },
                update: { $setOnInsert: course },
                upsert: true,
            },
        }))
    );
};

const syncDerivedDepartments = async () => {
    const [students, lecturers] = await Promise.all([
        Student.find().lean(),
        User.find({ role: "lecturer" }).lean(),
    ]);

    const grouped = new Map();

    students.forEach((student) => {
        const name = student.course || student.program || "General";

        if (!grouped.has(name)) {
            grouped.set(name, {
                name,
                faculty: student.faculty || "General",
                head: "TBA",
            });
        }
    });

    lecturers.forEach((lecturer) => {
        const name = lecturer.department || lecturer.faculty || "General";

        if (!grouped.has(name)) {
            grouped.set(name, {
                name,
                faculty: lecturer.faculty || "General",
                head: lecturer.name,
            });
        } else if (grouped.get(name).head === "TBA") {
            grouped.get(name).head = lecturer.name;
        }
    });

    if (!grouped.size) {
        return;
    }

    await Department.bulkWrite(
        Array.from(grouped.values()).map((department) => ({
            updateOne: {
                filter: { name: department.name },
                update: {
                    $setOnInsert: {
                        ...department,
                        status: "Active",
                    },
                },
                upsert: true,
            },
        }))
    );
};

export const getAcademicCourses = async (_req, res) => {
    try {
        await syncDerivedCourses();

        const [courses, registrations, lecturers] = await Promise.all([
            Course.find().sort({ code: 1 }).lean(),
            CourseRegistration.find().lean(),
            User.find({ role: "lecturer" }).lean(),
        ]);

        const lecturerMap = new Map(lecturers.map((lecturer) => [String(lecturer._id), lecturer.name]));
        const studentCounts = registrations.reduce((accumulator, registration) => {
            accumulator[registration.code] = (accumulator[registration.code] || 0) + 1;
            return accumulator;
        }, {});

        res.json({
            courses: courses.map((course) => ({
                id: course._id.toString(),
                code: course.code,
                name: course.title,
                department: course.department,
                credits: Number(course.credits || 0),
                students: studentCounts[course.code] || 0,
                lecturer: lecturerMap.get(String(course.lecturer)) || "Unassigned",
                semester: course.semester,
                status: buildCourseStatus(course.status),
            })),
        });
    } catch (error) {
        console.error("Get academic courses error:", error);
        res.status(500).json({ message: "Failed to load courses" });
    }
};

export const createAcademicCourse = async (req, res) => {
    try {
        const code = req.body.code?.trim();
        const title = req.body.name?.trim();

        if (!code || !title) {
            return res.status(400).json({ message: "Course code and name are required" });
        }

        const existingCourse = await Course.findOne({ code }).lean();

        if (existingCourse) {
            return res.status(400).json({ message: "A course with that code already exists" });
        }

        const lecturer = await User.findOne({ name: req.body.lecturer, role: "lecturer" }).lean();
        const course = await Course.create({
            code,
            title,
            department: req.body.department?.trim(),
            semester: req.body.semester?.trim(),
            credits: Number(req.body.credits || 0),
            lecturer: lecturer?._id,
            status: "Active",
        });

        res.status(201).json({ message: "Course created successfully", course });
    } catch (error) {
        console.error("Create academic course error:", error);
        res.status(500).json({ message: "Failed to create course" });
    }
};

export const updateAcademicCourse = async (req, res) => {
    try {
        const code = req.body.code?.trim();
        const title = req.body.name?.trim();

        if (!code || !title) {
            return res.status(400).json({ message: "Course code and name are required" });
        }

        const duplicateCourse = await Course.findOne({
            code,
            _id: { $ne: req.params.id },
        }).lean();

        if (duplicateCourse) {
            return res.status(400).json({ message: "Another course with that code already exists" });
        }

        const lecturer = await User.findOne({ name: req.body.lecturer, role: "lecturer" }).lean();
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                code,
                title,
                department: req.body.department?.trim(),
                semester: req.body.semester?.trim(),
                credits: Number(req.body.credits || 0),
                lecturer: lecturer?._id,
                status: req.body.status || "Active",
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course updated successfully", course });
    } catch (error) {
        console.error("Update academic course error:", error);
        res.status(500).json({ message: "Failed to update course" });
    }
};

export const deleteAcademicCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Delete academic course error:", error);
        res.status(500).json({ message: "Failed to delete course" });
    }
};

export const getAcademicDepartments = async (_req, res) => {
    try {
        await syncDerivedDepartments();

        const [departments, students, lecturers, courses] = await Promise.all([
            Department.find().sort({ name: 1 }).lean(),
            Student.find().lean(),
            User.find({ role: "lecturer" }).lean(),
            Course.find().lean(),
        ]);

        res.json({
            departments: departments.map((department) => ({
                id: department._id.toString(),
                name: department.name,
                faculty: department.faculty,
                head: department.head,
                students: students.filter((student) => (student.course || student.program) === department.name).length,
                lecturers: lecturers.filter((lecturer) => (lecturer.department || lecturer.faculty) === department.name).length,
                courses: courses.filter((course) => course.department === department.name).length,
                status: department.status,
                description: department.description,
            })),
        });
    } catch (error) {
        console.error("Get academic departments error:", error);
        res.status(500).json({ message: "Failed to load departments" });
    }
};

export const createAcademicDepartment = async (req, res) => {
    try {
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({ message: "Department name is required" });
        }

        const existingDepartment = await Department.findOne({ name }).lean();

        if (existingDepartment) {
            return res.status(400).json({ message: "A department with that name already exists" });
        }

        const department = await Department.create({
            name,
            faculty: req.body.faculty?.trim(),
            head: req.body.head?.trim(),
            email: req.body.email?.trim() || "",
            phone: req.body.phone?.trim() || "",
            description: req.body.description?.trim() || "",
            status: "Active",
        });

        res.status(201).json({ message: "Department created successfully", department });
    } catch (error) {
        console.error("Create academic department error:", error);
        res.status(500).json({ message: "Failed to create department" });
    }
};

export const updateAcademicDepartment = async (req, res) => {
    try {
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({ message: "Department name is required" });
        }

        const duplicateDepartment = await Department.findOne({
            name,
            _id: { $ne: req.params.id },
        }).lean();

        if (duplicateDepartment) {
            return res.status(400).json({ message: "Another department with that name already exists" });
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            {
                name,
                faculty: req.body.faculty?.trim(),
                head: req.body.head?.trim(),
                description: req.body.description?.trim() || "",
                status: req.body.status || "Active",
            },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }

        res.json({ message: "Department updated successfully", department });
    } catch (error) {
        console.error("Update academic department error:", error);
        res.status(500).json({ message: "Failed to update department" });
    }
};

export const deleteAcademicDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }

        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        console.error("Delete academic department error:", error);
        res.status(500).json({ message: "Failed to delete department" });
    }
};

export const getAcademicCalendar = async (_req, res) => {
    try {
        const events = await AcademicEvent.find().sort({ startDate: 1 }).lean();

        res.json({
            events: events.map((event) => ({
                id: event._id.toString(),
                event: event.title,
                date: formatDate(event.startDate),
                endDate: event.endDate ? formatDate(event.endDate) : null,
                type: event.type === "exam" ? "Exam" : event.type === "deadline" ? "Deadline" : event.type === "meeting" ? "Meeting" : "Event",
                status: event.status === "completed" ? "Completed" : "Upcoming",
            })),
        });
    } catch (error) {
        console.error("Get academic calendar error:", error);
        res.status(500).json({ message: "Failed to load calendar" });
    }
};

export const createAcademicEvent = async (req, res) => {
    try {
        if (!req.body.title?.trim() || !req.body.startDate) {
            return res.status(400).json({ message: "Event title and start date are required" });
        }

        const event = await AcademicEvent.create({
            title: req.body.title?.trim(),
            description: req.body.description?.trim() || "",
            type: String(req.body.type || "event").toLowerCase(),
            location: req.body.location?.trim() || "TBA",
            startDate: req.body.startDate,
            endDate: req.body.endDate || null,
            status: "scheduled",
            createdBy: req.user?.id,
        });

        res.status(201).json({ message: "Academic event created successfully", event });
    } catch (error) {
        console.error("Create academic event error:", error);
        res.status(500).json({ message: "Failed to create academic event" });
    }
};

export const getAcademicAuditLogs = async (_req, res) => {
    res.json({ logs: [] });
};
