import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allRatingsRaw = await prisma.canteenRating.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      item: true,
      rating: true,
      comment: true,
      createdAt: true,
      quantityRating: true,
      hygieneRating: true,
      staffRating: true,
      cleanlinessRating: true,
    },
  });

  const allRatings = allRatingsRaw.map((r) => ({
    id: r.id,
    item: r.item,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    quantityRating: r.quantityRating,
    hygieneRating: r.hygieneRating,
    staffRating: r.staffRating,
    cleanlinessRating: r.cleanlinessRating,
  }));

  return NextResponse.json({ allRatings });
}

