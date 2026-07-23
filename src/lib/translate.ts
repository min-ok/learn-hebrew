export function translateConfigured(): boolean {
  return true;
}

// Unofficial Google Translate endpoint (same engine as translate.google.com).
// No API key required, but undocumented — may rate-limit under heavy load.
export async function translateText(text: string): Promise<string> {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "he");
  url.searchParams.set("tl", "ru");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Google Translate error", res.status, body);
    throw new Error("Не удалось перевести текст");
  }

  const data = (await res.json()) as [[string, string][]];
  return data[0].map((chunk) => chunk[0]).join("");
}
