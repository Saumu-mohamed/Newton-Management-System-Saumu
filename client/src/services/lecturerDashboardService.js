import api from "../../lib/api";

export const getLecturerDashboard = async () => {
    const response = await api.get("/dashboard/lecturer/overview");
    return response.data;
};

export const queueLecturerStudentAlerts = async () => {
    const response = await api.post("/dashboard/lecturer/alerts/notify");
    return response.data;
};
