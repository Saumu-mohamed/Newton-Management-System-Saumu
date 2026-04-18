import api from "../../lib/api";

export const getStudentDashboard = async () => {
    const response = await api.get("/dashboard/student/overview");
    return response.data;
};

export const getStudentResults = async (params = {}) => {
    const response = await api.get("/students/results", { params });
    return response.data;
};

export const initiateStudentPayment = async (payload = {}) => {
    const response = await api.post("/payments/mpesa", payload);
    return response.data;
};
