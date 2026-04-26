import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ratelimit } from '@/lib/rateLimiting';
import { headers } from 'next/headers';

// Validation Schema
import { contactSchema } from '@/lib/validate.ts';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') ?? '127.0.0.1';
    
    const { success: limitSuccess } = await ratelimit.limit(ip);
    if (!limitSuccess) {
      return NextResponse.json(
        { error: 'Zbyt wiele prób. Spróbuj ponownie później.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Honeypot check (Bot protection)
    if (body.website) {
      console.warn('Bot detected via honeypot');
      return NextResponse.json({ success: true }); // Silent fail for bots
    }

    // 3. Validation & Sanitization (XSS protection via Zod & plain text)
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // 4. Mail Transport (Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // 5. Send Mail
    await transporter.sendMail({
      from: `"${data.name}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: data.email,
      subject: `Nowa wiadomość od ${data.name} (Auxillium Contact)`,
      text: `Otrzymałeś nową wiadomość z formularza kontaktowego.\n\n` +
            `Imię: ${data.name}\n` +
            `Email: ${data.email}\n\n` +
            `Treść:\n${data.message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0A0A0A;">
          <h2 style="border-bottom: 1px solid #D4D4D8; padding-bottom: 10px;">Nowa wiadomość</h2>
          <p><strong>Imię:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <div style="background: #FAFAFA; padding: 15px; border-left: 4px solid #0A0A0A; margin-top: 20px;">
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas wysyłania wiadomości.' },
      { status: 500 }
    );
  }
}