import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Введите код из письма" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const { code } = parsed.data;

  if (!(await checkRateLimit(`verify-email:${clientIp(request)}:${email}`, 8, 15 * 60_000))) {
    return NextResponse.json({ error: "Слишком много попыток. Запросите новый код." }, { status: 429 });
  }

  const record = await prisma.verificationToken.findFirst({
    where: {
      code,
      OR: [{ newEmail: email }, { newEmail: null, user: { email } }],
    },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Код неверен или истёк. Запросите новый." },
      { status: 400 },
    );
  }

  if (record.newEmail) {
    // Email-change confirmation: re-check for a collision in case someone
    // else took this address between the request and now.
    const emailTaken = await prisma.user.findUnique({ where: { email: record.newEmail } });
    if (emailTaken && emailTaken.id !== record.userId) {
      await prisma.verificationToken.delete({ where: { id: record.id } });
      return NextResponse.json(
        { error: "Этот email уже используется другим аккаунтом." },
        { status: 409 },
      );
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { email: record.newEmail, pendingEmail: null, emailVerified: new Date() },
    });
  } else {
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    });
  }

  await prisma.verificationToken.delete({ where: { id: record.id } });

  return NextResponse.json({ ok: true });
}
