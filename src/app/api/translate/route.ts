import { NextResponse } from "next/server";
import { translateText, translateConfigured } from "@/lib/translate";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const HEBREW_RE = new RegExp("[\\u0590-\\u05FF]");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim() ?? "";

  if (!text || text.length > 300 || !HEBREW_RE.test(text)) {
    return NextResponse.json({ error: "Некорректный текст" }, { status: 400 });
  }

  if (!(await checkRateLimit(`translate:${clientIp(request)}`, 30, 60_000))) {
    return NextResponse.json({ error: "Слишком много запросов, попробуйте позже" }, { status: 429 });
  }

  if (!translateConfigured()) {
    return NextResponse.json({ error: "Перевод недоступен" }, { status: 501 });
  }

  try {
    const translated = await translateText(text);
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Не удалось перевести текст" }, { status: 502 });
  }
}
