import api from "../../lib/api";

export const getCollegeAdminDashboard = async () => {
    const response = await api.get("/dashboard/collegeadmin/overview");
    return response.data;
};

export const approveCollegeApproval = async (approvalId) => {
    const response = await api.post(`/collegeadmin/approvals/${approvalId}/approve`);
    return response.data;
};

export const notifyProbationStudent = async (studentId) => {
    const response = await api.post(`/collegeadmin/students/${studentId}/notify-warning`);
    return response.data;
};
