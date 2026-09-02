"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

// ─── Limits ──────────────────────────────────────────────────────────────────
const VALID_MEALS      = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const VALID_CATEGORIES = ["Food Quality", "Cleanliness", "Quantity", "Service", "Other"];

const NAME_MIN = 2;
const NAME_MAX = 80;
const ROLL_REGEX = /^[A-Za-z0-9]{3,20}$/;
const HOSTEL_MAX = 60;
const MESS_MAX   = 60;

export async function completeProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // ── Rate limit: max 5 profile saves per 10 minutes per user ──────────────
  const allowed = rateLimit("completeProfile", session.user.id, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) throw new Error("Too many attempts. Please wait a few minutes and try again.");

  const name   = (formData.get("name")   as string)?.trim();
  const rollNo = (formData.get("rollNo") as string)?.trim();
  const hostel = (formData.get("hostel") as string)?.trim();
  const mess   = (formData.get("mess")   as string)?.trim();

  // ── Required check ────────────────────────────────────────────────────────
  if (!name || !rollNo || !hostel || !mess) throw new Error("All fields are required.");

  // ── Length limits ─────────────────────────────────────────────────────────
  if (name.length < NAME_MIN || name.length > NAME_MAX)
    throw new Error(`Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`);

  if (!ROLL_REGEX.test(rollNo))
    throw new Error("Roll number must be 3–20 alphanumeric characters (no spaces or symbols).");

  if (hostel.length > HOSTEL_MAX)
    throw new Error("Hostel name is too long.");

  if (mess.length > MESS_MAX)
    throw new Error("Mess name is too long.");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, rollNo, hostel, mess },
  });

  revalidatePath("/");
  // redirect must be called outside try/catch; it throws internally
  const { redirect } = await import("next/navigation");
  redirect("/");
}
