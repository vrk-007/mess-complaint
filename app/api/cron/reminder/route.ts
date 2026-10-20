import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// This route is called by Vercel Cron every 2 days at 6:10 PM IST (12:40 PM UTC).
export async function GET(request: Request) {
  // ── Security: verify this is a legitimate Vercel cron call or authorized key ──
  const authHeader = request.headers.get("authorization");
  const userAgent = request.headers.get("user-agent") ?? "";
  const isVercelCron = userAgent.includes("vercel-cron");
  const url = new URL(request.url);
  const keyParam = url.searchParams.get("key");

  const isAuthorized =
    !process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    (keyParam && keyParam === process.env.CRON_SECRET) ||
    isVercelCron;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [pendingCount, pendingApprovalCount] = await Promise.all([
      prisma.complaint.count({ where: { resolved: false, pendingApproval: false } }),
      prisma.complaint.count({ where: { resolved: false, pendingApproval: true } }),
    ]);

    await sendReminderEmail({ pendingCount, pendingApprovalCount });

    return NextResponse.json({ ok: true, sent: true, pendingCount, pendingApprovalCount });
  } catch (err: any) {
    console.error("[cron/reminder] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
