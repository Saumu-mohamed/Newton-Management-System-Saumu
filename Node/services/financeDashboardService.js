import DashboardAction from "../models/DashboardAction.js";
import Mpesa from "../models/MpesaTransaction.js";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

const formatCurrencyNumber = (value) => Number(value || 0);

const resolveStudentPaidAmount = (student) => Number(
    student?.paidAmount ||
    student?.paid ||
    0
);

const resolveStudentBalance = (student) => Math.max(
    Number(student?.totalFee || 0) - resolveStudentPaidAmount(student),
    0
);

const resolveTransactionRef = (record) => (
    record?.transactionId ||
    record?.transactionRef ||
    record?.transactionReference ||
    record?.reference ||
    record?.transRef ||
    "N/A"
);

const formatPaymentStatus = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "success") {
        return "Success";
    }

    if (normalized === "failed") {
        return "Failed";
    }

    return "Pending";
};

const formatMpesaStatus = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "success" || normalized === "confirmed") {
        return "Confirmed";
    }

    if (normalized.includes("pending")) {
        return "Pending Callback";
    }

    return "Failed";
};

const getMonthLabel = (dateValue) => new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
}).format(new Date(dateValue));

const getStudentsPaidToday = (payments, today) => new Set(
    payments
        .filter((payment) => new Date(payment.createdAt) >= today && payment.student?._id)
        .map((payment) => String(payment.student._id))
).size;

const getFinanceBaseData = async () => {
    const [students, recentPayments, recentMpesa, successfulPayments, pendingPaymentsCount] = await Promise.all([
        Student.find().sort({ createdAt: -1 }).lean(),
        Payment.find().populate("student").sort({ createdAt: -1 }).limit(50).lean(),
        Mpesa.find().sort({ createdAt: -1 }).limit(20).lean(),
        Payment.find({ status: "success" }).sort({ createdAt: 1 }).lean(),
        Payment.countDocuments({ status: "pending" }),
    ]);

    return {
        students,
        recentPayments,
        recentMpesa,
        successfulPayments,
        pendingPaymentsCount,
    };
};

export const buildFinanceDashboardView = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { students, recentPayments, recentMpesa, successfulPayments, pendingPaymentsCount } = await getFinanceBaseData();

    const totalCollected = successfulPayments.reduce(
        (sum, payment) => sum + formatCurrencyNumber(payment.amount),
        0
    );

    const totalOutstanding = students.reduce(
        (sum, student) => sum + resolveStudentBalance(student),
        0
    );

    const todayPayments = successfulPayments.filter((payment) => new Date(payment.createdAt) >= today);
    const todayCollection = todayPayments.reduce((sum, payment) => sum + formatCurrencyNumber(payment.amount), 0);

    const failedTodayCount = recentPayments.filter((payment) => (
        new Date(payment.createdAt) >= today && String(payment.status).toLowerCase() === "failed"
    )).length;

    const recentTransactions = recentPayments.slice(0, 10).map((payment) => ({
        id: payment._id.toString(),
        student: payment.student?.name || "N/A",
        regNo: payment.student?.registrationNumber || "N/A",
        amount: formatCurrencyNumber(payment.amount),
        method: String(payment.method || "unknown").toUpperCase(),
        transRef: resolveTransactionRef(payment),
        status: formatPaymentStatus(payment.status),
        time: new Date(payment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    const mpesaTransactions = recentMpesa.map((transaction) => ({
        id: transaction._id.toString(),
        phone: transaction.phone || "N/A",
        amount: formatCurrencyNumber(transaction.amount),
        transRef: resolveTransactionRef(transaction),
        status: formatMpesaStatus(transaction.status),
        timestamp: new Date(transaction.createdAt || transaction.timestamp).toLocaleString(),
    }));

    const topDefaulters = students
        .map((student) => ({
            id: student._id.toString(),
            name: student.name,
            regNo: student.registrationNumber || "N/A",
            program: student.program || student.course || "General",
            balance: resolveStudentBalance(student),
            months: resolveStudentBalance(student) > 0 ? Math.max(1, Math.ceil((Date.now() - new Date(student.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000))) : 0,
            lastPayment: student.lastPayment ? new Date(student.lastPayment).toLocaleDateString() : "-",
        }))
        .filter((student) => student.balance > 0)
        .sort((left, right) => right.balance - left.balance)
        .slice(0, 10);

    const examClearance = students
        .map((student) => {
            const balance = resolveStudentBalance(student);

            return {
                id: student._id.toString(),
                name: student.name,
                regNo: student.registrationNumber || "N/A",
                balance,
                status: balance === 0 ? "Cleared" : "Not Cleared",
                clearanceDate: balance === 0 && student.lastPayment
                    ? new Date(student.lastPayment).toLocaleDateString()
                    : null,
            };
        });

    const partialPayments = students
        .map((student) => {
            const totalFee = Number(student.totalFee || 0);
            const paid = resolveStudentPaidAmount(student);
            const balance = resolveStudentBalance(student);

            return {
                id: student._id.toString(),
                name: student.name,
                regNo: student.registrationNumber || "N/A",
                totalFee,
                paid,
                balance,
                percentage: totalFee > 0 ? (paid / totalFee) * 100 : 0,
            };
        })
        .filter((student) => student.paid > 0 && student.balance > 0)
        .sort((left, right) => right.balance - left.balance)
        .slice(0, 10);

    const collectionTrendMap = successfulPayments.reduce((accumulator, payment) => {
        const paymentDate = new Date(payment.createdAt);
        const key = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;

        if (!accumulator.has(key)) {
            accumulator.set(key, { sortKey: key, month: getMonthLabel(paymentDate), amount: 0 });
        }

        accumulator.get(key).amount += formatCurrencyNumber(payment.amount);
        return accumulator;
    }, new Map());

    const collectionTrend = Array.from(collectionTrendMap.values())
        .sort((left, right) => left.sortKey.localeCompare(right.sortKey))
        .slice(-6)
        .map(({ sortKey, ...entry }) => entry);

    const paymentMethodMap = successfulPayments.reduce((accumulator, payment) => {
        const method = String(payment.method || "unknown").toUpperCase();
        accumulator.set(method, (accumulator.get(method) || 0) + formatCurrencyNumber(payment.amount));
        return accumulator;
    }, new Map());

    const paymentMethods = Array.from(paymentMethodMap.entries()).map(([name, value]) => ({ name, value }));

    const facultyTotals = students.reduce((accumulator, student) => {
        const faculty = student.faculty || "General";

        if (!accumulator.has(faculty)) {
            accumulator.set(faculty, { faculty, collected: 0, outstanding: 0 });
        }

        const current = accumulator.get(faculty);
        current.collected += resolveStudentPaidAmount(student);
        current.outstanding += resolveStudentBalance(student);
        return accumulator;
    }, new Map());

    const feeCollectionByFaculty = Array.from(facultyTotals.values()).sort((left, right) => right.collected - left.collected);
    const overdueStudents = students.filter((student) => resolveStudentBalance(student) > 0).length;
    const totalExpected = totalCollected + totalOutstanding;
    const collectionRate = totalExpected > 0 ? Number(((totalCollected / totalExpected) * 100).toFixed(1)) : 0;

    return {
        totalCollected,
        totalOutstanding,
        todayCollection,
        recentTransactions,
        mpesaTransactions,
        topDefaulters,
        examClearance,
        partialPayments,
        collectionTrend,
        paymentMethods,
        feeCollectionByFaculty,
        pendingTransactions: pendingPaymentsCount,
        failedTodayCount,
        overdueStudents,
        collectionRate,
    };
};
