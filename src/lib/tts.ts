const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

export function ttsConfigured(): boolean {
  return Boolean(GOOGLE_TTS_API_KEY);
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  if (!GOOGLE_TTS_API_KEY) {
    throw new Error("GOOGLE_TTS_API_KEY не задан");
  }

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "he-IL", ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3" },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Google TTS error", res.status, body);
    throw new Error("Не удалось синтезировать речь");
  }

  const { audioContent } = (await res.json()) as { audioContent: string };
  return Buffer.from(audioContent, "base64");
}
