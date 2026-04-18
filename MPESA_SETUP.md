# M-Pesa STK Push Setup

## Backend environment

Update `Node/.env` with:

- `CLIENT_URL=http://localhost:8080`
- `MPESA_ENV=sandbox`
- `MPESA_CONSUMER_KEY=...`
- `MPESA_CONSUMER_SECRET=...`
- `MPESA_SHORTCODE=174379`
- `MPESA_PASSKEY=...`
- `MPESA_CALLBACK_URL=https://your-ngrok-domain.ngrok-free.app/api/payments/mpesa/callback`

## Frontend environment

Update `client/.env` with:

- `VITE_API_URL=http://localhost:5000/api`
- `VITE_SOCKET_URL=http://localhost:5000`

## Local run

1. Install dependencies in both apps.
2. Start MongoDB.
3. Start the backend with `npm run dev` inside `Node/`.
4. Start the frontend with `npm run dev` inside `client/`.
5. Expose the backend using `ngrok http 5000`.
6. Copy the HTTPS forwarding URL into `MPESA_CALLBACK_URL`.
7. Restart the backend after updating the callback URL.

## Sandbox test flow

1. Log in as a student account with a linked `Student` record and a valid `phone` on the `User`.
2. Open the Fees page and submit an M-Pesa payment.
3. Approve the STK push on the sandbox test phone.
4. Confirm the backend receives `POST /api/payments/mpesa/callback`.
5. Verify the payment moves from `pending` to `success` or `failed` in MongoDB.
6. Check that the student Fees page and finance dashboard refresh automatically through the websocket event.

## Callback checklist

- The callback endpoint must be publicly reachable over HTTPS.
- Safaricom should call `POST /api/payments/mpesa/callback`.
- Duplicate callbacks are ignored after the first successful update because `isCallbackProcessed` is persisted on the payment.
- Successful callbacks increment `Student.paidAmount` once and update `Student.lastPayment`.
