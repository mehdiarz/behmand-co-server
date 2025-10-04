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

const app = express();

// ✅ CORS اصلاح‌شده
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://behman-co.vercel.app"   // دامنه‌ی فرانت روی Vercel
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// برای اطمینان از پاسخ به preflight
app.options("/api/*", cors());

app.use(morgan("dev"));
app.use(express.json());

// اتصال به دیتابیس
await connectDB(process.env.MONGO_URI);

// تنظیمات آپلود فایل با multer
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// 📌 مسیر ثبت رزومه + ذخیره در DB + ارسال ایمیل
app.post("/api/resume", upload.single("file"), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const f = req.file;

        if (!f) {
            return res
                .status(400)
                .json({ success: false, error: "فایل رزومه الزامی است" });
        }

        // ذخیره در دیتابیس
        const doc = await Resume.create({
            name,
            email,
            message,
            fileName: f.originalname,
            filePath: f.path,
            fileMime: f.mimetype,
            fileSize: f.size,
        });

        // ارسال ایمیل نوتیفیکیشن
        const transporter = createTransport({
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFY_TO,
            subject: `رزومه جدید: ${doc.name}`,
            text: `نام: ${doc.name}\nایمیل: ${doc.email}\n\n${doc.message || ""}`,
            attachments: [{ filename: doc.fileName, path: doc.filePath }],
        });

        console.log("✅ Notification email sent");
        res.json({ success: true, id: doc._id });
    } catch (err) {
        console.error("❌ Error saving resume:", err.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 📌 مسیر لاگین ادمین
app.use("/api/admin", adminRouter);

// 📌 مسیرهای مدیریتی رزومه‌ها (فقط برای ادمین لاگین‌شده)
app.use("/api/resumes", adminAuth, resumesRouter);

app.use("/api/customers", customersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/blogs", blogsRouter);

// 📂 برای دسترسی به فایل‌های آپلود
app.use("/uploads", express.static("uploads"));

// 📌 health check route
app.get("/", (req, res) => {
    res.send("✅ API is running. Welcome to Behmand backend!");
});

const port = process.env.PORT || 5000;
app.listen(port, () =>
    console.log(`🚀 Server running on http://localhost:${port}`)
);
