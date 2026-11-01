"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function submitCanteenRating(data: {
  item: string;
  rating: number;
  comment?: string;
  quantityRating?: number;
  hygieneRating?: number;
  staffRating?: number;
  cleanlinessRating?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    let userId: string;

    if (session?.user?.id) {
      userId = session.user.id;
      // Rate limit: max 15 ratings per 10 minutes per student
      const allowed = rateLimit("canteenRating", userId, {
        max: 15,
        windowMs: 10 * 60 * 1000,
      });
      if (!allowed) {
        return {
          success: false,
          error: "You are submitting ratings too quickly. Please wait a moment.",
        };
      }
    } else {
      // ── Guest Rate Limiting by IP Address ──
      const headerStore = await headers();
      const ip =
        headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerStore.get("x-real-ip") ||
        "guest-client";

      const allowed = rateLimit("canteenRatingGuest", ip, {
        max: 10,
        windowMs: 10 * 60 * 1000,
      });
      if (!allowed) {
        return {
          success: false,
          error: "You are submitting ratings too quickly. Please wait a moment.",
        };
      }

      // Upsert dedicated system guest user to maintain relational integrity
      const guestUser = await prisma.user.upsert({
        where: { email: "guest@vnitcanteen.local" },
        update: {},
        create: {
          email: "guest@vnitcanteen.local",
          name: "Guest Visitor",
          role: "STUDENT",
        },
      });
      userId = guestUser.id;
    }

    const item = data.item?.trim();
    const rating = Number(data.rating);
    const comment = data.comment?.trim() ? data.comment.trim().slice(0, 500) : null;

    if (!item) {
      return { success: false, error: "Please select an item from the list." };
    }

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: "Please provide a rating between 1 and 5." };
    }

    if (!comment) {
      return { success: false, error: "Please provide a remark explaining your rating." };
    }

    // Validate optional ratings (must be 1-5 if provided)
    const validateOptional = (val?: number) =>
      val === undefined || val === null || (Number.isInteger(val) && val >= 1 && val <= 5);

    if (!validateOptional(data.quantityRating))
      return { success: false, error: "Quantity rating must be between 1 and 5." };
    if (!validateOptional(data.hygieneRating))
      return { success: false, error: "Hygiene rating must be between 1 and 5." };
    if (!validateOptional(data.staffRating))
      return { success: false, error: "Staff behaviour rating must be between 1 and 5." };
    if (!validateOptional(data.cleanlinessRating))
      return { success: false, error: "Cleanliness rating must be between 1 and 5." };

    await prisma.canteenRating.create({
      data: {
        userId,
        item,
        rating,
        comment,
        quantityRating: data.quantityRating ?? null,
        hygieneRating: data.hygieneRating ?? null,
        staffRating: data.staffRating ?? null,
        cleanlinessRating: data.cleanlinessRating ?? null,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/superadmin", "layout");
    revalidatePath("/rate", "layout");
    revalidatePath("/admin", "page");
    revalidatePath("/superadmin", "page");
    revalidatePath("/rate", "page");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to submit rating. Please try again.",
    };
  }
}
