"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in IST (UTC+5:30) */
function getTodayIST(): string {
  const now = new Date();
  // Offset to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/** Generates a random 4-digit zero-padded code e.g. "0471", "8823" */
function generateCode(): string {
  const num = Math.floor(Math.random() * 10000);
  return num.toString().padStart(4, "0");
}

// ─── Public Actions ───────────────────────────────────────────────────────────

/**
 * Returns today's DailyCode record.
 * Auto-creates one if none exists for today — so admins never have to
 * worry about generating the first code of the day.
 */
export async function getTodayCode() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const today = getTodayIST();

  // Try to fetch existing code for today
  const existing = await prisma.dailyCode.findUnique({ where: { date: today } });
  if (existing) return existing;

  // None exists yet — auto-generate
  const created = await prisma.dailyCode.create({
    data: {
      code: generateCode(),
      date: today,
      createdBy: session.user.id,
    },
  });

  return created;
}

/**
 * Regenerates a fresh 4-digit code for today, invalidating the old one.
 * Useful if the previous code was accidentally shared/leaked.
 */
export async function regenerateCode(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const today = getTodayIST();
  const newCode = generateCode();

  // Upsert — create if missing, update if it exists
  await prisma.dailyCode.upsert({
    where: { date: today },
    update: { code: newCode, createdBy: session.user.id, createdAt: new Date() },
    create: { code: newCode, date: today, createdBy: session.user.id },
  });

  // Return the new code so the client can update its state instantly
  // without triggering a full page revalidation
  return newCode;
}


/**
 * Validates a code string against today's active DailyCode.
 * Called internally by the complaint server action — NOT exported to client.
 * Returns true if valid, throws an Error with a user-friendly message if not.
 */
export async function validateDailyCode(submitted: string): Promise<true> {
  const today = getTodayIST();
  const record = await prisma.dailyCode.findUnique({ where: { date: today } });

  if (!record) {
    throw new Error(
      "No authority code is active for today. Please ask the Mess Coordinator to contact the Admin."
    );
  }

  if (submitted.trim() !== record.code) {
    throw new Error(
      "Invalid authority code. Please ask the Mess or Canteen Coordinator for today's code."
    );
  }

  return true;
}
