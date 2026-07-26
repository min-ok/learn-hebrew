import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationEmail } from "@/lib/verification";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(60),
  email: z.string().trim().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов").max(100),
});

export async function POST(request: Request) {
  if (!checkRateLimit(`register:${clientIp(request)}`, 10, 60 * 60_000)) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже зарегистрирован" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash },
  });

  await createAndSendVerificationEmail(user.id, user.email, user.name);

  return NextResponse.json({ ok: true });
}
