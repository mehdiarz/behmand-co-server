import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Resume from "../models/Resume.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_, file, cb) => {
        const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        cb(null, allowed.includes(file.mimetype));
    },
});

// ثبت رزومه
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const f = req.file;
        if (!f) return res.status(400).json({ error: "No file uploaded" });

        const doc = await Resume.create({
            name,
            email,
            message,
            fileName: f.originalname,
            filePath: f.path,
            fileMime: f.mimetype,
            fileSize: f.size,
        });

        res.json({ success: true, id: doc._id });
    } catch (err) {
        console.error("Resume create error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// لیست رزومه‌ها (ادمین)
router.get("/", adminAuth, async (req, res) => {
    const list = await Resume.find().sort({ createdAt: -1 });
    res.json(list);
});

// دانلود فایل رزومه (ادمین)
router.get("/:id/file", adminAuth, async (req, res) => {
    const doc = await Resume.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.download(doc.filePath, doc.fileName);
});

// تغییر وضعیت رزومه (ادمین)
router.patch("/:id/status", adminAuth, async (req, res) => {
    const { status } = req.body;
    const doc = await Resume.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(doc);
});

export default router;
