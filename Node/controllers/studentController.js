import Student from "../models/Student.js";


// CREATE STUDENT
export const createStudent = async (req, res) => {
    try {

        const { name, email, course, year } = req.body;

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

        res.status(200).json(students);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

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
            req.body,
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