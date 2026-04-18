const MPESA_ENV = process.env.MPESA_ENV || "sandbox";

const baseUrls = {
    sandbox: "https://sandbox.safaricom.co.ke",
    production: "https://api.safaricom.co.ke",
};

const resolveBaseUrl = () => baseUrls[MPESA_ENV] || baseUrls.sandbox;

export const mpesaConfig = {
    env: MPESA_ENV,
    baseUrl: resolveBaseUrl(),
    accessTokenUrl: `${resolveBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    stkPushUrl: `${resolveBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    initiatorName: process.env.MPESA_INITIATOR_NAME || "",
    queueTimeoutUrl: process.env.MPESA_QUEUE_TIMEOUT_URL || process.env.MPESA_CALLBACK_URL,
    resultUrl: process.env.MPESA_RESULT_URL || process.env.MPESA_CALLBACK_URL,
};

export const assertMpesaConfig = () => {
    const missing = [
        ["MPESA_CONSUMER_KEY", mpesaConfig.consumerKey],
        ["MPESA_CONSUMER_SECRET", mpesaConfig.consumerSecret],
        ["MPESA_SHORTCODE", mpesaConfig.shortcode],
        ["MPESA_PASSKEY", mpesaConfig.passkey],
        ["MPESA_CALLBACK_URL", mpesaConfig.callbackUrl],
    ].filter(([, value]) => !value).map(([name]) => name);

    if (missing.length) {
        throw new Error(`Missing required M-Pesa config: ${missing.join(", ")}`);
    }
};

export const getMpesaAccessToken = async () => {
    assertMpesaConfig();

    const credentials = Buffer
        .from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`)
        .toString("base64");

    const response = await fetch(mpesaConfig.accessTokenUrl, {
        method: "GET",
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch M-Pesa access token: ${response.status} ${errorText}`);
    }

    const payload = await response.json();

    if (!payload?.access_token) {
        throw new Error("M-Pesa access token response did not include access_token");
    }

    return payload.access_token;
};
