import api from "../../lib/api";

export const getSidebarNavigation = async () => {
    const response = await api.get("/navigation/sidebar");
    return response.data;
};

export const getNotifications = async () => {
    const response = await api.get("/navigation/notifications");
    return response.data;
};
