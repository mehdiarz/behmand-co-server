import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";

import { connectDB } from "./src/config/db.js";
import resumesRouter from "./src/routes/resumes.js";
import adminRouter from "./src/routes/admin.js";
import { adminAuth } from "./src/middleware/auth.js";
import { createTransport } from "./src/config/mailer.js";
import Resume from "./src/models/Resume.js";
import customersRouter from "./src/routes/Customer.js";
import messagesRouter from "./src/routes/messages.js";
import blogsRouter from "./src/routes/blog.js";
import { generateFormPDF } from "./src/utils/pdfGenerator.js"; // ✅ استفاده از نسخه‌ای که فونت رو از ریشه می‌خونه

const app = express();

// ✅ CORS configuration
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://behman-co.vercel.app"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(morgan("dev"));
app.use(express.json());

// ✅ Connect to database
await connectDB(process.env.MONGO_URI);

// ✅ File upload setup
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

// ✅ Route for resume submission
app.post("/api/resume", upload.single("file"), async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const f = req.file;

        if (!f) {
            return res.status(400).json({ success: false, error: "فایل رزومه الزامی است" });
        }

        // Parse arrays
        data.educations = JSON.parse(data.educations || "[]");
        data.languages = JSON.parse(data.languages || "[]");
        data.workHistories = JSON.parse(data.workHistories || "[]");
        data.referees = JSON.parse(data.referees || "[]");

        // ✅ Generate PDF from form data
        const personFolder = path.join(uploadDir, `${data.name}-${data.family}`);
        const pdfPath = path.join(personFolder, `${data.name}-${data.family}-فورم.pdf`);
        await generateFormPDF(data, pdfPath);

        // ✅ Store in database
        const doc = await Resume.create({
            ...data,
            fileName: f.originalname,
            filePath: f.path,
            fileMime: f.mimetype,
            fileSize: f.size,
            generatedPdfPath: pdfPath,
        });

        // ✅ Send email notification
        const transporter = createTransport({
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "job@behmand-co.com",
            subject: `رزومه جدید: ${doc.name}`,
            text: `نام: ${doc.name}\nایمیل: ${doc.email}\n\n${doc.otherInfo || ""}`,
            attachments: [
                {
                    filename: `${doc.name}-${doc.family}-رزومه${path.extname(doc.fileName)}`,
                    path: doc.filePath,
                },
                {
                    filename: `${doc.name}-${doc.family}-فورم.pdf`,
                    path: doc.generatedPdfPath,
                },
            ],
        });

        console.log("✅ Notification email sent");
        res.json({ success: true, id: doc._id });
    } catch (err) {
        console.error("❌ Error saving resume:", err.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// ✅ Other routes
app.use("/api/admin", adminRouter);
app.use("/api/resumes", adminAuth, resumesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/blogs", blogsRouter);

// ✅ Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ✅ Health check
app.get("/", (req, res) => {
    res.send("✅ API is running. Welcome to Behmand backend!");
});

// ✅ Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
