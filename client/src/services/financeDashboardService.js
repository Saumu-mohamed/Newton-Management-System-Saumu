import api from "../../lib/api";

export const getFinanceDashboard = async () => {
    const response = await api.get("/dashboard/finance/overview");
    return response.data;
};

export const getPaymentsPageData = async (params = {}) => {
    const response = await api.get("/finance/payments", { params });
    return response.data;
};

export const getFeeStructures = async (params = {}) => {
    const response = await api.get("/finance/fee-structures", { params });
    return response.data;
};

export const getFinanceReports = async (params = {}) => {
    const response = await api.get("/finance/reports", { params });
    return response.data;
};

export const syncMpesaTransactions = async () => {
    const response = await api.post("/finance/mpesa/sync");
    return response.data;
};

export const retryMpesaTransaction = async (transactionId) => {
    const response = await api.post(`/finance/mpesa/${transactionId}/retry`);
    return response.data;
};

export const retryPaymentTransaction = async (paymentId) => {
    const response = await api.post(`/finance/payments/${paymentId}/retry`);
    return response.data;
};

export const sendPaymentReminder = async (studentId) => {
    const response = await api.post(`/finance/students/${studentId}/remind`);
    return response.data;
};

export const sendBulkPaymentReminders = async () => {
    const response = await api.post("/finance/reminders/bulk");
    return response.data;
};

export const reconcileBankTransactions = async (payload) => {
    const response = await api.post("/finance/reconciliation", payload);
    return response.data;
};
