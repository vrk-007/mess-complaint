"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitComplaint(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to submit a complaint.");
  }

  const meal = formData.get("meal") as string;
  const category = formData.get("category") as string;
  const incidentDate = formData.get("incidentDate") as string;
  const description = formData.get("description") as string;

  if (!meal || !category || !description?.trim()) {
    throw new Error("All fields are required.");
  }

  if (description.trim().length < 10) {
    throw new Error("Description must be at least 10 characters.");
  }

  if (description.trim().length > 500) {
    throw new Error("Description must be at most 500 characters.");
  }

  await prisma.complaint.create({
    data: {
      userId: session.user.id,
      meal,
      category,
      incidentDate: incidentDate || null,
      description: description.trim(),
    },
  });

  revalidatePath("/");
}
