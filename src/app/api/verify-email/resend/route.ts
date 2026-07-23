import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationEmail } from "@/lib/verification";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!email) {
    return NextResponse.json({ error: "Укажите email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    const origin = new URL(request.url).origin;
    await createAndSendVerificationEmail(user.id, user.email, user.name, origin);
  }

  // Always respond with success so we don't leak whether an email is registered.
  return NextResponse.json({ ok: true });
}
