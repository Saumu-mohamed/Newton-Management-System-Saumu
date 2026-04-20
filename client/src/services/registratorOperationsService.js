import api from "../../lib/api";

export const getRegistrationWorkflow = async (params = {}) => {
    const response = await api.get("/dashboard/registrator/registrations", { params });
    return response.data;
};

export const decideRegistrationWorkflow = async (studentId, payload) => {
    const response = await api.patch(`/dashboard/registrator/registrations/${studentId}/decision`, payload);
    return response.data;
};

export const getTranscriptRequests = async (params = {}) => {
    const response = await api.get("/dashboard/registrator/transcripts", { params });
    return response.data;
};

export const getTranscriptPreview = async (documentId) => {
    const response = await api.get(`/dashboard/registrator/transcripts/${documentId}/preview`);
    return response.data;
};

export const updateTranscriptStatus = async (documentId, status) => {
    const response = await api.patch(`/dashboard/registrator/transcripts/${documentId}/status`, { status });
    return response.data;
};
