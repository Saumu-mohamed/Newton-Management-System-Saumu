import api from "../../lib/api";

export const getUsers = async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
};

export const createUser = async (payload) => {
    const response = await api.post("/users", payload);
    return response.data;
};

export const importUsers = async (users) => {
    const response = await api.post("/users/import", { users });
    return response.data;
};

export const updateUser = async (userId, payload) => {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
    const response = await api.patch(`/users/${userId}/status`, { isActive });
    return response.data;
};

export const resetUserPassword = async (userId) => {
    const response = await api.post(`/users/${userId}/reset-password`);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};
