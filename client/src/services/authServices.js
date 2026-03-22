import api from "../../lib/api";

export const loginUser = async (email, password) => {
    const res = await api.post("/auth/login", {
        email,
        password
    });

    return res.data;
};

export const changeUserPassword = async (newPassword) => {
    const res = await api.post("/auth/change-password", { newPassword });
    return res.data;
};