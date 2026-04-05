import api from "../../lib/api";

export const getRegistratorDashboard = async () => {
    const response = await api.get("/dashboard/registrator/overview");
    return response.data;
};

export const reviewRegistratorStudentRegistration = async (studentId) => {
    const response = await api.post(`/dashboard/registrator/registrations/${studentId}/review`);
    return response.data;
};

export const approveRegistratorOverride = async (registrationId) => {
    const response = await api.post(`/dashboard/registrator/registrations/${registrationId}/override`);
    return response.data;
};

export const generateRegistratorGraduationList = async () => {
    const response = await api.post("/dashboard/registrator/graduation/finalize");
    return response.data;
};
