import api from "../../lib/api";

export const getAcademicStudents = async () => {
    const response = await api.get("/students");
    return response.data;
};

export const createAcademicStudent = async (payload) => {
    const response = await api.post("/students", payload);
    return response.data;
};

export const updateAcademicStudent = async (id, payload) => {
    const response = await api.patch(`/students/${id}`, payload);
    return response.data;
};

export const deleteAcademicStudent = async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
};

export const getAcademicCourses = async () => {
    const response = await api.get("/academic/courses");
    return response.data;
};

export const createAcademicCourse = async (payload) => {
    const response = await api.post("/academic/courses", payload);
    return response.data;
};

export const updateAcademicCourse = async (id, payload) => {
    const response = await api.patch(`/academic/courses/${id}`, payload);
    return response.data;
};

export const deleteAcademicCourse = async (id) => {
    const response = await api.delete(`/academic/courses/${id}`);
    return response.data;
};

export const getAcademicDepartments = async () => {
    const response = await api.get("/academic/departments");
    return response.data;
};

export const createAcademicDepartment = async (payload) => {
    const response = await api.post("/academic/departments", payload);
    return response.data;
};

export const updateAcademicDepartment = async (id, payload) => {
    const response = await api.patch(`/academic/departments/${id}`, payload);
    return response.data;
};

export const deleteAcademicDepartment = async (id) => {
    const response = await api.delete(`/academic/departments/${id}`);
    return response.data;
};

export const getAcademicCalendar = async () => {
    const response = await api.get("/academic/calendar");
    return response.data;
};

export const createAcademicEvent = async (payload) => {
    const response = await api.post("/academic/calendar", payload);
    return response.data;
};
