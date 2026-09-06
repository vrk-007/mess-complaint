"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/** Generates a cryptographically secure random token string */
function generateToken(): string {
  return "qr_" + crypto.randomBytes(24).toString("hex");
}

/**
 * Creates a fresh ACTIVE ComplaintToken.
 * Called when the admin opens the QR popup.
 * Returns the token string to be embedded in the QR code.
 */
export async function createQRToken(): Promise<{ id: string; token: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");

  const record = await prisma.complaintToken.create({
    data: {
      token: generateToken(),
      createdBy: session.user.id,
    },
  });

  return { id: record.id, token: record.token };
}

/**
 * Validates that a submitted token is ACTIVE (not yet burned).
 * Returns the token record id if valid.
 * Throws a user-friendly error otherwise.
 * Called internally by the complaint server action — NOT exported to client.
 */
export async function validateAndBurnToken(
  submittedToken: string
): Promise<string> {
  const record = await prisma.complaintToken.findUnique({
    where: { token: submittedToken },
  });

  if (!record) {
    throw new Error(
      "Invalid QR code. Please ask the Mess Coordinator to show you the current QR."
    );
  }

  if (record.status === "USED") {
    throw new Error(
      "This QR code has already been used. Please ask the Coordinator to show the new QR."
    );
  }

  // Burn the token atomically — mark USED with timestamp
  await prisma.complaintToken.update({
    where: { id: record.id },
    data: { status: "USED", usedAt: new Date() },
  });

  return record.id;
}
