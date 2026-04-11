import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

export async function sendInquiryEmail(content: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const html = `
    <h2>New Pitch to Paradise Inquiry</h2>
    <p><b>Name:</b> ${content.name}</p>
    <p><b>Email:</b> ${content.email}</p>
    <p><b>Phone:</b> ${content.phone}</p>
    <p><b>Message:</b><br/>${content.message}</p>
  `;

  await transporter.sendMail({
    from: env.INQUIRY_FROM_EMAIL,
    to: env.INQUIRY_TO_EMAIL,
    subject: "New Pitch to Paradise Inquiry",
    html
  });
}
