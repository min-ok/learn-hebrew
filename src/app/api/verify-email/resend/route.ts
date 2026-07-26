import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationEmail } from "@/lib/verification";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!email) {
    return NextResponse.json({ error: "Укажите email" }, { status: 400 });
  }

  if (!(await checkRateLimit(`verify-resend:${clientIp(request)}:${email}`, 3, 10 * 60_000))) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    await createAndSendVerificationEmail(user.id, user.email, user.name);
  }

  // Always respond with success so we don't leak whether an email is registered.
  return NextResponse.json({ ok: true });
}
