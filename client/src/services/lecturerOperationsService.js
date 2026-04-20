import api from "../../lib/api";

export const getLecturerClasses = async () => {
    const response = await api.get("/dashboard/lecturer/classes");
    return response.data;
};

export const getLecturerGradebook = async (unitCode) => {
    const response = await api.get("/dashboard/lecturer/grades", {
        params: unitCode ? { unitCode } : {},
    });
    return response.data;
};

export const saveLecturerGrades = async (unitCode, students) => {
    const response = await api.put(`/dashboard/lecturer/grades/${unitCode}/draft`, { students });
    return response.data;
};

export const submitLecturerGrades = async (unitCode, students) => {
    const response = await api.post(`/dashboard/lecturer/grades/${unitCode}/submit`, { students });
    return response.data;
};
