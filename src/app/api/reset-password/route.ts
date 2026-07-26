import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов").max(100),
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
  const { code, password } = parsed.data;

  if (!checkRateLimit(`reset-password:${clientIp(request)}:${email}`, 8, 15 * 60_000)) {
    return NextResponse.json({ error: "Слишком много попыток. Запросите новый код." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const record = user
    ? await prisma.passwordResetToken.findFirst({ where: { userId: user.id, code } })
    : null;

  if (!user || !record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Код неверен или истёк. Запросите новый." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({ ok: true });
}
