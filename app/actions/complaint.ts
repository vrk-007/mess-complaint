"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { validateAndBurnToken } from "@/app/actions/qrToken";
import { revalidatePath } from "next/cache";

// ─── Limits ──────────────────────────────────────────────────────────────────
const VALID_MEALS      = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const VALID_CATEGORIES = ["Food Quality", "Hygiene", "Quantity", "Service", "Other"];
const MAIN_CANTEEN     = "VNIT Canteen";
const DESC_MIN = 10;
const DESC_MAX = 500;

export async function submitComplaint(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { success: false, error: "Unauthorized: You must be logged in to submit a complaint." };

    const userMess = session.user.mess;

    // ── Rate limit: max 5 complaints per 10 minutes per user ─────────────────
    const allowed = rateLimit("submitComplaint", session.user.id, {
      max: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed)
      return {
        success: false,
        error: "You're submitting too fast. Please wait a few minutes before submitting another complaint.",
      };

    const mess         = (formData.get("mess")         as string)?.trim();
    const meal         = (formData.get("meal")         as string)?.trim();
    const category     = (formData.get("category")     as string)?.trim();
    const incidentDate = (formData.get("incidentDate") as string)?.trim();
    const description  = (formData.get("description")  as string)?.trim();
    const qrToken      = (formData.get("qrToken")      as string)?.trim();
    const imageUrl     = (formData.get("imageUrl")     as string)?.trim() || null;

    // ── Required check ────────────────────────────────────────────────────────
    if (!mess || !meal || !category || !description)
      return { success: false, error: "All fields are required." };

    // ── Venue validation ─────────────────────────────────────────────────────
    const validMesses = [userMess, MAIN_CANTEEN].filter(Boolean);
    if (!validMesses.includes(mess))
      return { success: false, error: "Invalid venue selection." };

    // ── QR token check (validate and atomically burn — only required for Mess) ─
    let tokenId: string | null = null;
    if (mess !== MAIN_CANTEEN) {
      if (!qrToken)
        return {
          success: false,
          error: "Mess Authority QR scan is required. Please scan the coordinator's QR code.",
        };
      tokenId = await validateAndBurnToken(qrToken);
    }

    // ── Enum validation (prevents injecting garbage values) ──────────────────
    if (!VALID_MEALS.includes(meal))
      return { success: false, error: "Invalid meal selection." };

    if (!VALID_CATEGORIES.includes(category))
      return { success: false, error: "Invalid category selection." };

    // ── Length limits ─────────────────────────────────────────────────────────
    if (description.length < DESC_MIN)
      return { success: false, error: `Description must be at least ${DESC_MIN} characters.` };

    if (description.length > DESC_MAX)
      return { success: false, error: `Description must be at most ${DESC_MAX} characters.` };

    // ── Date sanity check ────────────────────────────────────────────────────
    // ── Image URL validation (if provided, must be a Supabase storage URL) ──────
    const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
      ?.replace(/\/rest\/v1\/?$/, "")
      .replace(/\/$/, "");
    if (imageUrl) {
      try {
        const parsed = new URL(imageUrl);
        if (!SUPABASE_HOST || !imageUrl.startsWith(SUPABASE_HOST)) {
          return { success: false, error: "Invalid image URL. Must be an official upload." };
        }
        void parsed;
      } catch {
        return { success: false, error: "Invalid image URL. Must be an official upload." };
      }
    }

    if (incidentDate) {
      const d = new Date(incidentDate);
      const now = new Date();
      if (isNaN(d.getTime()))
        return { success: false, error: "Invalid date selected." };
      if (d > now)
        return { success: false, error: "Incident date cannot be in the future." };
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (d < oneYearAgo)
        return { success: false, error: "Incident date cannot be older than 1 year." };
    }

    await prisma.complaint.create({
      data: {
        userId:       session.user.id,
        mess,
        meal,
        category,
        incidentDate: incidentDate || null,
        description,
        imageUrl,
        tokenId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to submit complaint. Please try again.",
    };
  }
}
