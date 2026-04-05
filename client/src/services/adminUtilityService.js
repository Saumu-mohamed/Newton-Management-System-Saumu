import api from "../../lib/api";

export const getStaffRecords = async () => {
    const response = await api.get("/admin-utils/staff");
    return response.data;
};

export const createStaffRecord = async (payload) => {
    const response = await api.post("/admin-utils/staff", payload);
    return response.data;
};

export const updateStaffRecord = async (id, payload) => {
    const response = await api.patch(`/admin-utils/staff/${id}`, payload);
    return response.data;
};

export const deleteStaffRecord = async (id) => {
    const response = await api.delete(`/admin-utils/staff/${id}`);
    return response.data;
};

export const getCampuses = async () => {
    const response = await api.get("/admin-utils/campuses");
    return response.data;
};

export const createCampusRecord = async (payload) => {
    const response = await api.post("/admin-utils/campuses", payload);
    return response.data;
};

export const updateCampusRecord = async (id, payload) => {
    const response = await api.patch(`/admin-utils/campuses/${id}`, payload);
    return response.data;
};

export const deleteCampusRecord = async (id) => {
    const response = await api.delete(`/admin-utils/campuses/${id}`);
    return response.data;
};

export const getAuditLogs = async () => {
    const response = await api.get("/admin-utils/audit-logs");
    return response.data;
};

export const getSettings = async () => {
    const response = await api.get("/admin-utils/settings");
    return response.data;
};

export const updateSettings = async (payload) => {
    const response = await api.patch("/admin-utils/settings", payload);
    return response.data;
};

export const getReportOverview = async () => {
    const response = await api.get("/admin-utils/reports");
    return response.data;
};

export const getReportData = async (reportKey) => {
    const response = await api.get(`/admin-utils/reports/${reportKey}`);
    return response.data;
};
