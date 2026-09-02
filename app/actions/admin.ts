"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resolveComplaint(complaintId: string) {
  const session = await auth();

  // Security check: only admins can resolve complaints
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.complaint.update({
    where: { id: complaintId },
    data: { resolved: true },
  });

  // Refresh the admin page data
  revalidatePath("/admin");
}
