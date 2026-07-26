import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAndSendEmailChangeVerification } from "@/lib/verification";

const schema = z.object({
  newEmail: z.string().trim().email("Некорректный email"),
  currentPassword: z.string().min(1, "Введите пароль"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизованы" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const newEmail = parsed.data.newEmail.toLowerCase();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 400 });
  }

  if (newEmail === user.email) {
    return NextResponse.json({ error: "Это и есть ваш текущий email" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) {
    return NextResponse.json({ error: "Этот email уже используется другим аккаунтом" }, { status: 409 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { pendingEmail: newEmail } });

  await createAndSendEmailChangeVerification(user.id, newEmail, user.name);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизованы" }, { status: 401 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { pendingEmail: null } });
  await prisma.verificationToken.deleteMany({
    where: { userId: session.user.id, newEmail: { not: null } },
  });

  return NextResponse.json({ ok: true });
}
