import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Resume from "../models/Resume.js";
import { adminAuth } from "../middleware/auth.js";
import { generateFormPDF } from "../utils/pdfGenerator.js";

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, _, cb) => {
        const personFolder = path.join(uploadDir, `${req.body.name}-${req.body.family}`);
        if (!fs.existsSync(personFolder)) fs.mkdirSync(personFolder, { recursive: true });
        cb(null, personFolder);
    },
    filename: (req, file, cb) => {
        const personName = `${req.body.name}-${req.body.family}`;
        cb(null, `${personName}-رزومه${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

// 📥 ارسال رزومه
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const data = req.body;
        const f = req.file;
        if (!f) return res.status(400).json({ success: false, error: "فایل رزومه الزامی است" });

        // Parse arrays
        data.educations = JSON.parse(data.educations || "[]");
        data.languages = JSON.parse(data.languages || "[]");
        data.workHistories = JSON.parse(data.workHistories || "[]");
        data.referees = JSON.parse(data.referees || "[]");

        // Generate PDF
        const personFolder = path.join(uploadDir, `${data.name}-${data.family}`);
        const pdfPath = path.join(personFolder, `${data.name}-${data.family}-فورم.pdf`);
        await generateFormPDF(data, pdfPath);

        // Save in DB
        const doc = await Resume.create({
            ...data,
            fileName: f.originalname,
            filePath: f.path,
            fileMime: f.mimetype,
            fileSize: f.size,
            generatedPdfPath: pdfPath,
        });

        res.json({ success: true, id: doc._id });
    } catch (err) {
        console.error("❌ Error saving resume:", err.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 📤 لیست رزومه‌ها (ادمین)
router.get("/", adminAuth, async (req, res) => {
    const list = await Resume.find().sort({ createdAt: -1 });
    res.json(list);
});

// 📥 دانلود فایل اصلی
router.get("/:id/file", adminAuth, async (req, res) => {
    const doc = await Resume.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.download(doc.filePath, `${doc.name}-${doc.family}-رزومه${path.extname(doc.fileName)}`);
});

// 📥 دانلود PDF فرم
router.get("/:id/pdf", adminAuth, async (req, res) => {
    const doc = await Resume.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    if (!doc.generatedPdfPath || !fs.existsSync(doc.generatedPdfPath)) {
        const personFolder = path.join(uploadDir, `${doc.name}-${doc.family}`);
        const pdfPath = path.join(personFolder, `${doc.name}-${doc.family}-فورم.pdf`);
        await generateFormPDF(doc, pdfPath);
        doc.generatedPdfPath = pdfPath;
        await doc.save();
    }

    res.download(doc.generatedPdfPath, `${doc.name}-${doc.family}-فورم.pdf`);
});

// ✏️ تغییر وضعیت رزومه
router.patch("/:id/status", adminAuth, async (req, res) => {
    const { status } = req.body;
    const doc = await Resume.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(doc);
});

export default router;
