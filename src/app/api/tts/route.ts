import { NextResponse } from "next/server";
import { synthesizeSpeech, ttsConfigured } from "@/lib/tts";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const HEBREW_RE = new RegExp("[\\u0590-\\u05FF]");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim() ?? "";

  if (!text || text.length > 2000 || !HEBREW_RE.test(text)) {
    return NextResponse.json({ error: "Некорректный текст" }, { status: 400 });
  }

  if (!(await checkRateLimit(`tts:${clientIp(request)}`, 15, 60_000))) {
    return NextResponse.json({ error: "Слишком много запросов, попробуйте позже" }, { status: 429 });
  }

  if (!ttsConfigured()) {
    return NextResponse.json({ error: "Озвучка недоступна" }, { status: 501 });
  }

  try {
    const audio = await synthesizeSpeech(text);
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Не удалось синтезировать речь" }, { status: 502 });
  }
}
