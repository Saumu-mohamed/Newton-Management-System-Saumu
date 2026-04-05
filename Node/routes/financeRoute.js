import express from "express";
import {
    getFinanceDashboard,
    getPaymentsPageData,
    getFeeStructures,
    getFinanceReports,
    syncMpesaTransactions,
    retryMpesaTransaction,
    retryPaymentTransaction,
    sendPaymentReminder,
    sendBulkPaymentReminders,
    reconcileBankTransactions,
} from "../controllers/financeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, roleMiddleware("finance"), getFinanceDashboard);
router.get("/payments", authMiddleware, roleMiddleware("finance"), getPaymentsPageData);
router.get("/fee-structures", authMiddleware, roleMiddleware("finance"), getFeeStructures);
router.get("/reports", authMiddleware, roleMiddleware("finance"), getFinanceReports);
router.post("/mpesa/sync", authMiddleware, roleMiddleware("finance"), syncMpesaTransactions);
router.post("/mpesa/:transactionId/retry", authMiddleware, roleMiddleware("finance"), retryMpesaTransaction);
router.post("/payments/:paymentId/retry", authMiddleware, roleMiddleware("finance"), retryPaymentTransaction);
router.post("/students/:studentId/remind", authMiddleware, roleMiddleware("finance"), sendPaymentReminder);
router.post("/reminders/bulk", authMiddleware, roleMiddleware("finance"), sendBulkPaymentReminders);
router.post("/reconciliation", authMiddleware, roleMiddleware("finance"), reconcileBankTransactions);

export default router;
