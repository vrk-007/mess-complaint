"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";
import { sendApprovalRequestEmail } from "@/lib/email";

// Helper: get escalator emails from env
function getEscalateEmails(): string[] {
  return (process.env.ESCALATE_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// ── Step 1 (Maker): Admin submits a resolution request with a remark ──────────
// Sets pendingApproval=true, saves resolutionRemark & resolvedBy.
// Does NOT set resolved=true yet.
export async function requestResolve(
  complaintId: string,
  remark: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized." };

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
      return { success: false, error: "Only admins can request resolution." };

    const allowed = rateLimit("requestResolve", session.user.id, {
      max: 30,
      windowMs: 60 * 1000,
    });
    if (!allowed) return { success: false, error: "Too many actions. Please slow down." };

    if (!complaintId || typeof complaintId !== "string" || complaintId.length > 64)
      return { success: false, error: "Invalid complaint ID." };

    const trimmed = remark.trim().slice(0, 500);
    if (trimmed.length < 2) return { success: false, error: "Remark is too short (min 2 chars)." };

    const userEmail = session.user.email.trim().toLowerCase();

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        pendingApproval: true,
        resolutionRemark: trimmed,
        resolvedBy: userEmail,
        // clear any previous rejection state
        approvedBy: null,
        approvedAt: null,
      },
    });

    // Fire approval-request email (non-blocking — don't let email failure break the action)
    try {
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        include: { user: { select: { name: true } } },
      });
      if (complaint) {
        await sendApprovalRequestEmail({
          complaintId,
          studentName: complaint.user.name ?? "Unknown",
          description: complaint.description,
          remark: trimmed,
          submittedBy: userEmail,
        });
      }
    } catch (emailErr) {
      console.error("[requestResolve] Email send failed:", emailErr);
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit resolution request." };
  }
}

// ── Step 2a (Checker): Escalator APPROVES → complaint is finally resolved ─────
export async function approveResolution(
  complaintId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized." };

    const userEmail = session.user.email.trim().toLowerCase();
    const escalateEmails = getEscalateEmails();
    if (!escalateEmails.includes(userEmail))
      return { success: false, error: "Only authorized escalators can approve resolutions." };

    const allowed = rateLimit("approveResolution", session.user.id, {
      max: 30,
      windowMs: 60 * 1000,
    });
    if (!allowed) return { success: false, error: "Too many actions. Please slow down." };

    if (!complaintId || typeof complaintId !== "string" || complaintId.length > 64)
      return { success: false, error: "Invalid complaint ID." };

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        resolved: true,
        pendingApproval: false,
        approvedBy: userEmail,
        approvedAt: new Date(),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/superadmin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve resolution." };
  }
}

// ── Step 2b (Checker): Escalator REJECTS → complaint goes back to Active ──────
export async function rejectResolution(
  complaintId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized." };

    const userEmail = session.user.email.trim().toLowerCase();
    const escalateEmails = getEscalateEmails();
    if (!escalateEmails.includes(userEmail))
      return { success: false, error: "Only authorized escalators can reject resolutions." };

    const allowed = rateLimit("rejectResolution", session.user.id, {
      max: 30,
      windowMs: 60 * 1000,
    });
    if (!allowed) return { success: false, error: "Too many actions. Please slow down." };

    if (!complaintId || typeof complaintId !== "string" || complaintId.length > 64)
      return { success: false, error: "Invalid complaint ID." };

    // Reset back to fully Active state
    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        pendingApproval: false,
        resolutionRemark: null,
        resolvedBy: null,
        approvedBy: null,
        approvedAt: null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/superadmin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject resolution." };
  }
}
