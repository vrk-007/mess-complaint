"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

export async function resolveComplaint(complaintId: string) {
  const session = await auth();

  // ── Auth check: only admins ───────────────────────────────────────────────
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  // ── Rate limit: max 60 resolves per minute per admin (prevent script abuse)
  const allowed = rateLimit("resolveComplaint", session.user.id, {
    max: 60,
    windowMs: 60 * 1000,
  });
  if (!allowed) throw new Error("Too many actions. Please slow down.");

  // ── Input validation ──────────────────────────────────────────────────────
  if (!complaintId || typeof complaintId !== "string" || complaintId.length > 64)
    throw new Error("Invalid complaint ID.");

  await prisma.complaint.update({
    where: { id: complaintId },
    data:  { resolved: true },
  });

  revalidatePath("/admin");
}
