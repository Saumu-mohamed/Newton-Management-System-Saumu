import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
    {
        institution: {
            name: { type: String, default: "Kenya College of Technology" },
            abbreviation: { type: String, default: "KCT" },
            email: { type: String, default: "info@kct.ac.ke" },
            phone: { type: String, default: "+254 20 123 4567" },
        },
        appearance: {
            darkMode: { type: Boolean, default: false },
            compactMode: { type: Boolean, default: false },
        },
        notifications: {
            emailNotifications: { type: Boolean, default: true },
            smsAlerts: { type: Boolean, default: false },
            paymentAlerts: { type: Boolean, default: true },
            registrationAlerts: { type: Boolean, default: true },
        },
        security: {
            minPasswordLength: { type: String, default: "8" },
            passwordExpiryDays: { type: String, default: "90" },
            requireSpecialCharacters: { type: Boolean, default: true },
            twoFactorAuthRequired: { type: Boolean, default: false },
            sessionTimeoutMinutes: { type: String, default: "30" },
        },
        academic: {
            academicYear: { type: String, default: "2024-2025" },
            semester: { type: String, default: "2" },
            gradingSystem: { type: String, default: "points" },
            passMark: { type: Number, default: 40 },
            allowLateRegistration: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

export default mongoose.model("SystemSetting", systemSettingSchema);
