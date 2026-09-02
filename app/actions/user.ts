"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function completeProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const rollNo = formData.get("rollNo") as string;
  const hostel = formData.get("hostel") as string;
  const mess = formData.get("mess") as string;

  if (!name || !rollNo || !hostel || !mess) {
    throw new Error("Missing required fields");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      rollNo,
      hostel,
      mess,
    },
  });

  revalidatePath("/");
  redirect("/");
}
