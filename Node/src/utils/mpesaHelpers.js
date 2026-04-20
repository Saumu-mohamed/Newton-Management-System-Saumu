export const normalizeKenyanPhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");

    if (!digits) {
        return null;
    }

    if (digits.startsWith("254") && digits.length === 12) {
        return digits;
    }

    if (digits.startsWith("0") && digits.length === 10) {
        return `254${digits.slice(1)}`;
    }

    if (digits.length === 9) {
        return `254${digits}`;
    }

    return null;
};

export const isValidMpesaPhone = (value) => Boolean(normalizeKenyanPhone(value));

export const normalizeAmount = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return null;
    }

    return Math.round(amount);
};

export const generateTimestamp = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hour}${minute}${second}`;
};

export const generatePassword = ({ shortcode, passkey, timestamp }) => Buffer
    .from(`${shortcode}${passkey}${timestamp}`)
    .toString("base64");

export const buildPaymentReference = ({ student, user, reference, amount }) => {
    const baseReference = String(reference || "School Fees").trim() || "School Fees";
    const regNo = student?.registrationNumber ? ` ${student.registrationNumber}` : "";
    const roundedAmount = Number(amount || 0).toLocaleString("en-KE");

    return `${baseReference}${regNo} KES ${roundedAmount}`.slice(0, 182);
};

export const buildTransactionReference = ({ studentId, userId }) => {
    const id = String(studentId || userId || "").slice(-6).toUpperCase();
    return `STK-${Date.now()}-${id || "PAY"}`;
};

export const extractCallbackMetadata = (callbackMetadata = {}) => {
    const items = Array.isArray(callbackMetadata?.Item) ? callbackMetadata.Item : [];

    return items.reduce((accumulator, item) => {
        if (item?.Name) {
            accumulator[item.Name] = item.Value ?? null;
        }

        return accumulator;
    }, {});
};

export const mapCallbackStatus = (resultCode) => Number(resultCode) === 0 ? "success" : "failed";

export const maskPhone = (phone) => {
    const normalized = normalizeKenyanPhone(phone);

    if (!normalized) {
        return "invalid-phone";
    }

    return `${normalized.slice(0, 5)}****${normalized.slice(-3)}`;
};
