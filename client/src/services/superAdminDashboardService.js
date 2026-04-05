import api from "../../lib/api";

export const getSuperAdminDashboard = async () => {
    const response = await api.get("/dashboard/superadmin/overview");
    return response.data;
};

export const updateSuperAdminApproval = async (approvalId, decision) => {
    const response = await api.post(`/dashboard/superadmin/approvals/${approvalId}/decision`, {
        decision,
    });
    return response.data;
};

export const updateSuperAdminUserStatus = async (userId, isActive) => {
    const response = await api.patch(`/dashboard/superadmin/users/${userId}/status`, {
        isActive,
    });
    return response.data;
};

export const resetSuperAdminPassword = async (userId) => {
    const response = await api.post(`/dashboard/superadmin/users/${userId}/reset-password`);
    return response.data;
};

export const acknowledgeSuperAdminAlert = async (alertId) => {
    const response = await api.post(`/dashboard/superadmin/alerts/${alertId}/acknowledge`);
    return response.data;
};
