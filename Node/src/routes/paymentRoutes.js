import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import roleMiddleware from "../../middleware/roleMiddleware.js";
import {
    getMyPaymentHistory,
    handleMpesaCallback,
    initiateMpesaPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
    "/mpesa",
    authMiddleware,
    roleMiddleware("student"),
    initiateMpesaPayment
);

router.post("/mpesa/callback", handleMpesaCallback);

router.get(
    "/mine",
    authMiddleware,
    getMyPaymentHistory
);

export default router;
