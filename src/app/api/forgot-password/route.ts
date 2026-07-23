import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendPasswordResetEmail } from "@/lib/verification";

const schema = z.object({
  email: z.string().trim().email("Некорректный email"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const origin = new URL(request.url).origin;
    await createAndSendPasswordResetEmail(user.id, user.email, user.name, origin);
  }

  // Always respond with success so we don't leak whether an email is registered.
  return NextResponse.json({ ok: true });
}
