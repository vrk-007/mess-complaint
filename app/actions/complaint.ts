"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { validateAndBurnToken } from "@/app/actions/qrToken";
import { revalidatePath } from "next/cache";

// ─── Limits ──────────────────────────────────────────────────────────────────
const VALID_MEALS      = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const VALID_CATEGORIES = ["Food Quality", "Hygiene", "Quantity", "Service", "Other"];
const DESC_MIN = 10;
const DESC_MAX = 500;

export async function submitComplaint(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized: You must be logged in to submit a complaint.");

  // ── Rate limit: max 5 complaints per 10 minutes per user ─────────────────
  const allowed = rateLimit("submitComplaint", session.user.id, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed)
    throw new Error("You're submitting too fast. Please wait a few minutes before submitting another complaint.");

  const meal         = (formData.get("meal")         as string)?.trim();
  const category     = (formData.get("category")     as string)?.trim();
  const incidentDate = (formData.get("incidentDate") as string)?.trim();
  const description  = (formData.get("description")  as string)?.trim();
  const qrToken      = (formData.get("qrToken")      as string)?.trim();
  const imageUrl     = (formData.get("imageUrl")     as string)?.trim() || null;

  // ── Required check ────────────────────────────────────────────────────────
  if (!meal || !category || !description)
    throw new Error("All fields are required.");

  // ── QR token check (validate and atomically burn — must come first) ───────
  if (!qrToken)
    throw new Error("Mess Authority QR scan is required. Please scan the coordinator's QR code.");
  const tokenId = await validateAndBurnToken(qrToken);

  // ── Enum validation (prevents injecting garbage values) ──────────────────
  if (!VALID_MEALS.includes(meal))
    throw new Error("Invalid meal selection.");

  if (!VALID_CATEGORIES.includes(category))
    throw new Error("Invalid category selection.");

  // ── Length limits ─────────────────────────────────────────────────────────
  if (description.length < DESC_MIN)
    throw new Error(`Description must be at least ${DESC_MIN} characters.`);

  if (description.length > DESC_MAX)
    throw new Error(`Description must be at most ${DESC_MAX} characters.`);

  // ── Date sanity check ────────────────────────────────────────────────────
  // ── Image URL validation (if provided, must be a Supabase storage URL) ──────
  const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");
  if (imageUrl) {
    try {
      const parsed = new URL(imageUrl);
      if (SUPABASE_HOST && !imageUrl.startsWith(SUPABASE_HOST)) {
        throw new Error("Invalid image URL.");
      }
      void parsed;
    } catch {
      throw new Error("Invalid image URL.");
    }
  }

  if (incidentDate) {
    const d = new Date(incidentDate);
    const now = new Date();
    if (isNaN(d.getTime()))    throw new Error("Invalid date.");
    if (d > now)               throw new Error("Incident date cannot be in the future.");
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (d < oneYearAgo)        throw new Error("Incident date cannot be older than 1 year.");
  }

  await prisma.complaint.create({
    data: {
      userId:       session.user.id,
      meal,
      category,
      incidentDate: incidentDate || null,
      description,
      imageUrl,    // optional Supabase Storage URL for photo evidence
      tokenId,     // audit: links to the QR token that authorized this complaint
    },
  });

  revalidatePath("/");
}
