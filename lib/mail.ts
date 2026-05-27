import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Transporter verification error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Auxillium Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Resetowanie hasła - Auxillium",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Resetowanie hasła</h2>
        <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w systemie Auxillium.</p>
        <p>Kliknij w poniższy przycisk, aby ustawić nowe hasło. Link jest ważny przez 1 godzinę.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Resetuj hasło</a>
        </div>
        <p>Jeśli to nie Ty prosiłeś o reset hasła, możesz zignorować tę wiadomość.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Wiadomość wygenerowana automatycznie przez system Auxillium.</p>
      </div>
    `,
  };

  console.log(`Attempting to send reset password email to: ${email}`);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"Auxillium" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Weryfikacja konta — Auxillium",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #0A0A0A; text-align: center; font-size: 24px; letter-spacing: 0.05em;">WERYFIKACJA KONTA</h2>
        <p style="color: #444;">Twój jednorazowy kod weryfikacyjny (ważny przez 15 minut):</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 0.3em; color: #0A0A0A; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #888; font-size: 12px;">Jeśli nie zakładałeś konta w Auxillium, zignoruj tę wiadomość.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #aaa; text-align: center;">Wiadomość wygenerowana automatycznie przez Auxillium.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}
