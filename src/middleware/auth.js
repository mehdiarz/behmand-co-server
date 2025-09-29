import jwt from "jsonwebtoken";

export function adminAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "توکن وجود ندارد" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") throw new Error();
        next();
    } catch {
        res.status(403).json({ error: "توکن نامعتبر است" });
    }
}
