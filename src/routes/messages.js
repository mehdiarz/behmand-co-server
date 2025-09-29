import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// 📌 گرفتن همه پیام‌ها
router.get("/", async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 ثبت پیام جدید
router.post("/", async (req, res) => {
    try {
        const { firstName, lastName, phone, message } = req.body;
        if (!firstName || !lastName || !phone || !message) {
            return res.status(400).json({ error: "تمام فیلدها الزامی هستند" });
        }
        const doc = await Message.create({ firstName, lastName, phone, message });
        res.json({ success: true, id: doc._id });
    } catch (err) {
        console.error("❌ Error saving message:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 تغییر وضعیت به خوانده‌شده
router.patch("/:id/read", async (req, res) => {
    try {
        const updated = await Message.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "پیام یافت نشد" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 حذف پیام
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Message.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "پیام یافت نشد" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
