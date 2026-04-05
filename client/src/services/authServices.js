import api from "../../lib/api";

export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "auth_user";

const canUseStorage = () => typeof window !== "undefined";

export const persistAuth = ({ token, user }) => {
    if (!canUseStorage()) {
        return;
    }

    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
};

export const clearStoredAuth = () => {
    if (!canUseStorage()) {
        return;
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
};

export const getStoredToken = () => (
    canUseStorage()
        ? localStorage.getItem(AUTH_TOKEN_KEY)
        : null
);

export const getStoredUser = () => {
    if (!canUseStorage()) {
        return null;
    }

    const rawUser = localStorage.getItem(AUTH_USER_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch (_error) {
        clearStoredAuth();
        return null;
    }
};

export const loginUser = async (email, password) => {
    const res = await api.post("/auth/login", {
        email,
        password
    });

    persistAuth(res.data);
    return res.data;
};

export const getCurrentUser = async () => {
    const res = await api.get("/auth/me");

    if (res.data?.user) {
        persistAuth({ user: res.data.user });
    }

    return res.data;
};

export const updateUserProfile = async (payload) => {
    const res = await api.patch("/auth/profile", payload);

    if (res.data?.user) {
        persistAuth({ user: res.data.user });
    }

    return res.data;
};

export const logoutUser = async () => {
    try {
        const res = await api.post("/auth/logout");
        return res.data;
    } finally {
        clearStoredAuth();
    }
};

export const changeUserPassword = async (newPassword) => {
    const res = await api.post("/auth/change-password", { newPassword });
    return res.data;
};
