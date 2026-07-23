import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;

  if (!token) {
    return NextResponse.json({ error: "Некорректная ссылка подтверждения" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Ссылка недействительна или истекла. Запросите новое письмо." },
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
