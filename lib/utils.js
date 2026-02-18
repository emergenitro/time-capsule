import nodemailer from "nodemailer";


export function getRandomDateTime() {
    const oneHour = 60 * 60 * 1000;
    const oneYear = 365 * 24 * oneHour;

    const randomTime = Math.floor(Math.random() * (oneYear - oneHour)) + oneHour;
    return new Date(Date.now() + randomTime);
}

export function sendMail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to, subject, text,
    });
}