import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === process.env.ADMIN_USER &&
        password === process.env.ADMIN_PASS
    ) {
        const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "20m",
        });
        console.log(token);
        return res.json({ token });
    }

    res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
});

export default router;
