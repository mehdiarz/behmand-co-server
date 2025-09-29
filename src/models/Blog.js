import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    fileMime: String,
    fileSize: Number,
}, { _id: false });

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true }, // توضیح کوتاه
    content: { type: String, required: true }, // متن کامل (HTML/Markdown)
    coverImage: {
        fileName: String,
        filePath: String,
        fileMime: String,
        fileSize: Number,
    },
    tags: [{ type: String }],
    author: { type: String },
    publishedAt: { type: Date, default: Date.now },
    attachments: [attachmentSchema],
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);
