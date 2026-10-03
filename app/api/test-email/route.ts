import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY is not set in env vars" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: "Mess Portal <noreply@nexalaya.com>",
    to: ["varadvrk007@gmail.com"],
    subject: "Test Email - Mess Portal",
    html: "<div style='font-family:sans-serif;padding:20px'><h2>Email is working!</h2><p>This is a test email from the Mess Portal using Resend.</p></div>",
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message, details: error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Email sent successfully!", data });
}
