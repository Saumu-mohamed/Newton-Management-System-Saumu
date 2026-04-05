import mongoose from "mongoose";

const studentDocumentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        document: {
            type: String,
            required: true,
            trim: true,
        },
        requestType: {
            type: String,
            trim: true,
            default: "Official",
        },
        copies: {
            type: Number,
            default: 1,
        },
        fee: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["Ready for Collection", "Processing", "Pending Fee Clearance", "Collected"],
            default: "Processing",
        },
        location: {
            type: String,
            trim: true,
            default: "Registry Office",
        },
    },
    { timestamps: true }
);

export default mongoose.model("StudentDocument", studentDocumentSchema);
