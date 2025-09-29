import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        message: { type: String },
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
        fileMime: { type: String, required: true },
        fileSize: { type: Number, required: true },
        status: { type: String, enum: ["new", "reviewed", "archived"], default: "new" }
    },
    { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
