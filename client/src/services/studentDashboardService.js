import api from "../../lib/api";

export const getStudentDashboard = async () => {
    const response = await api.get("/dashboard/student/overview");
    return response.data;
};

export const initiateStudentPayment = async (payload = {}) => {
    const response = await api.post("/students/fees/payment", payload);
    return response.data;
};
