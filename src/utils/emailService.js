import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Send an email (Promise-based)
export async function sendEmail(to, subject, message, chatUrl, roomId = "", token = "", userType = "guest") {
  try {
    // ⚙️ Build tracking redirect URL
    const baseUrl =
      process.env.SITE_URL ||
      "https://smartcompanion-h9bqcgcqcegaecd7.italynorth-01.azurewebsites.net";

    // When user clicks “Open Chat”, first hit tracking endpoint, then redirect
    const trackingUrl = `${baseUrl}/api/tracking/open?roomId=${encodeURIComponent(
      roomId
    )}&token=${encodeURIComponent(token)}&userType=${encodeURIComponent(
      userType
    )}`;

    // ✅ Email content
    const html = `
      <div style="font-family:Arial, sans-serif; background:#f8f8f8; padding:20px;">
        <h2>${subject}</h2>
        <p>${message}</p>
        ${
          roomId
            ? `<a href="${trackingUrl}" style="background:#1f3b2e;color:white;padding:10px 15px;text-decoration:none;border-radius:6px;">Open Chat</a>`
            : ""
        }
      </div>
    `;

    await transporter.sendMail({
      from: `"Smart Companion" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
}
