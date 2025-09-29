import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

// 📌 گرفتن همه مشتری‌ها
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 افزودن مشتری جدید
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "نام الزامی است" });

        const customer = await Customer.create({ name });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 ویرایش مشتری
router.patch("/:id", async (req, res) => {
    try {
        const { name } = req.body;
        const updated = await Customer.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "مشتری یافت نشد" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 حذف مشتری
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Customer.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "مشتری یافت نشد" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
