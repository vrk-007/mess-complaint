"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePath } from "next/cache";

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
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: You must be logged in to rate items." };
    }

    // Rate limit: max 15 ratings per 10 minutes per student
    const allowed = rateLimit("canteenRating", session.user.id, {
      max: 15,
      windowMs: 10 * 60 * 1000,
    });
    if (!allowed) {
      return {
        success: false,
        error: "You are submitting ratings too quickly. Please wait a moment.",
      };
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
        userId: session.user.id,
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
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to submit rating. Please try again.",
    };
  }
}
