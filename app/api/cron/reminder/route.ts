import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// This route is called by Vercel Cron every 2 days at 9 AM UTC.
// It is protected by a CRON_SECRET so nobody can trigger it manually.
export async function GET(request: Request) {
  // ── Security: verify this is a legitimate Vercel cron call ──────────────────
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all active (unresolved) complaints with student name
    const activeComplaints = await prisma.complaint.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });

    const pendingCount = activeComplaints.filter((c) => !c.pendingApproval).length;
    const pendingApprovalCount = activeComplaints.filter((c) => c.pendingApproval).length;

    await sendReminderEmail({
      pendingCount,
      pendingApprovalCount,
      complaints: activeComplaints.map((c) => ({
        studentName: c.user.name ?? "Unknown",
        description: c.description,
        createdAt: c.createdAt,
        mess: c.mess,
      })),
    });

    return NextResponse.json({
      ok: true,
      sent: true,
      pendingCount,
      pendingApprovalCount,
    });
  } catch (err: any) {
    console.error("[cron/reminder] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
