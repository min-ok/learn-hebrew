import { NextResponse } from "next/server";
import { z } from "zod";
import { sendSupportEmail } from "@/lib/email";

const supportSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(60),
  email: z.string().trim().email("Некорректный email"),
  message: z.string().trim().min(10, "Опишите проблему чуть подробнее").max(3000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = supportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;

  try {
    await sendSupportEmail(name, email, message);
  } catch {
    return NextResponse.json(
      { error: "Не удалось отправить сообщение, попробуйте позже" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
