import nodemailer from "nodemailer";

const port = parseInt(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "mock_user",
    pass: process.env.SMTP_PASS || "mock_pass",
  },
});

export const sendWelcomeEmail = async (email, username) => {
  try {
    const info = await transporter.sendMail({
      from: '"SocialApp Team" <noreply@socialapp.com>',
      to: email,
      subject: "Welcome to SocialApp!",
      text: `Hi ${username},\n\nWelcome to SocialApp! We are excited to have you on board.\n\nBest,\nThe SocialApp Team`,
      html: `<p>Hi <b>${username}</b>,</p><p>Welcome to SocialApp! We are excited to have you on board.</p><p>Best,<br>The SocialApp Team</p>`,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};
