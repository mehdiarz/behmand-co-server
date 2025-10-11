import express from "express";
import multer from "multer";
import fs from "fs";
import Blog from "../models/Blog.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// مسیر ذخیره فایل‌ها
const imageDir = "uploads/blog-images";
const fileDir = "uploads/blog-files";
[imageDir, fileDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// یک storage مشترک برای همه فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "coverImage") cb(null, imageDir);
    else cb(null, fileDir);
  },
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const upload = multer({ storage });

/* ------------------- 📌 گرفتن همه بلاگ‌ها ------------------- */
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "خطای سرور" });
  }
});

/* ------------------- 📌 گرفتن بلاگ با slug ------------------- */
router.get("/slug/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "بلاگ پیدا نشد" });
    res.json(blog);
  } catch (err) {
    console.error("❌ Error fetching blog by slug:", err);
    res.status(500).json({ error: "خطای سرور" });
  }
});

/* ------------------- 📌 گرفتن بلاگ با id (برای ویرایش) ------------------- */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "بلاگ پیدا نشد" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "خطای سرور" });
  }
});

/* ------------------- 📌 ایجاد بلاگ جدید ------------------- */
router.post(
  "/",
  adminAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { title, slug, excerpt, content, tags, author } = req.body;

      const coverImage = req.files["coverImage"]
        ? {
            fileName: req.files["coverImage"][0].originalname,
            filePath: req.files["coverImage"][0].path,
            fileMime: req.files["coverImage"][0].mimetype,
            fileSize: req.files["coverImage"][0].size,
          }
        : null;

      const attachments = req.files["attachments"]
        ? req.files["attachments"].map((f) => ({
            fileName: f.originalname,
            filePath: f.path,
            fileMime: f.mimetype,
            fileSize: f.size,
          }))
        : [];

      const blog = await Blog.create({
        title,
        slug,
        excerpt,
        content,
        tags: tags ? JSON.parse(tags) : [],
        author,
        coverImage,
        attachments,
      });

      res.json({ success: true, blog });
    } catch (err) {
      console.error("❌ Error saving blog:", err);
      res.status(500).json({ error: "خطای سرور" });
    }
  },
);

/* ------------------- 📌 ویرایش بلاگ ------------------- */
router.patch(
  "/:id",
  adminAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const update = { ...req.body };

      if (req.files["coverImage"]) {
        update.coverImage = {
          fileName: req.files["coverImage"][0].originalname,
          filePath: req.files["coverImage"][0].path,
          fileMime: req.files["coverImage"][0].mimetype,
          fileSize: req.files["coverImage"][0].size,
        };
      }

      if (req.files["attachments"]) {
        update.attachments = req.files["attachments"].map((f) => ({
          fileName: f.originalname,
          filePath: f.path,
          fileMime: f.mimetype,
          fileSize: f.size,
        }));
      }

      if (update.tags && typeof update.tags === "string") {
        update.tags = JSON.parse(update.tags);
      }

      const blog = await Blog.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });
      if (!blog) return res.status(404).json({ error: "بلاگ پیدا نشد" });

      res.json({ success: true, blog });
    } catch (err) {
      console.error("❌ Error updating blog:", err);
      res.status(500).json({ error: "خطای سرور" });
    }
  },
);

/* ------------------- 📌 حذف بلاگ ------------------- */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "بلاگ پیدا نشد" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "خطای سرور" });
  }
});

export default router;
