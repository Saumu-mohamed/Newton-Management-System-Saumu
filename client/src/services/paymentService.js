import api from "../../lib/api";

export const initiateMpesaPayment = async (payload = {}) => {
    const response = await api.post("/payments/mpesa", payload);
    return response.data;
};

export const getMyPayments = async () => {
    const response = await api.get("/payments/mine");
    return response.data;
};
