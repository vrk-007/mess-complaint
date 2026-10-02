"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getEscalateEmails(): string[] {
  return (process.env.ESCALATE_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function getSuperAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// ── Escalate complaint to SuperAdmin ─────────────────────────────────────────
export async function escalateComplaint(
  complaintId: string,
  forwardNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized." };

    const userEmail = session.user.email.trim().toLowerCase();

    // Only specific emails (ESCALATE_EMAILS) can forward
    const escalateEmails = getEscalateEmails();
    if (!escalateEmails.includes(userEmail))
      return { success: false, error: "You are not authorized to escalate complaints." };

    // Rate limit: max 30 escalations per minute
    const allowed = rateLimit("escalateComplaint", session.user.id, {
      max: 30,
      windowMs: 60 * 1000,
    });
    if (!allowed) return { success: false, error: "Too many actions. Please slow down." };

    if (!complaintId || typeof complaintId !== "string" || complaintId.length > 64)
      return { success: false, error: "Invalid complaint ID." };

    const note = forwardNote?.trim().slice(0, 300) || null;

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        isForwarded: true,
        forwardedAt: new Date(),
        forwardedBy: userEmail,
        forwardNote: note,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/superadmin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to escalate complaint." };
  }
}

// ── Update remark on a complaint (Admin or SuperAdmin) ────────────────────────
export async function updateComplaintRemark(
  complaintId: string,
  remark: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized." };

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN")
      return { success: false, error: "Only admins can add remarks." };

    // Rate limit: max 60 remarks per minute
    const allowed = rateLimit("updateRemark", session.user.id, {
      max: 60,
      windowMs: 60 * 1000,
    });
    if (!allowed) return { success: false, error: "Too many actions. Please slow down." };

    if (!complaintId || typeof complaintId !== "string" || complaintId.length > 64)
      return { success: false, error: "Invalid complaint ID." };

    const trimmed = remark.trim().slice(0, 500);
    if (trimmed.length < 2) return { success: false, error: "Remark is too short." };

    const userEmail = session.user.email.trim().toLowerCase();

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        adminRemark: trimmed,
        remarkBy: userEmail,
        remarkAt: new Date(),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/superadmin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save remark." };
  }
}

// ── Resolve a complaint (SuperAdmin) ─────────────────────────────────────────
export async function superAdminResolveComplaint(
  complaintId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const userEmail = session.user.email.trim().toLowerCase();
  const superAdminEmails = getSuperAdminEmails();
  if (!superAdminEmails.includes(userEmail)) throw new Error("Unauthorized");

  if (!complaintId || typeof complaintId !== "string" || complaintId.length > 64)
    throw new Error("Invalid complaint ID.");

  await prisma.complaint.update({
    where: { id: complaintId },
    data: { resolved: true },
  });

  revalidatePath("/superadmin");
  revalidatePath("/admin");
}
