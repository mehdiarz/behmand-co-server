import nodemailer from "nodemailer";

export function createTransport({ user, pass }) {
    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
}
