export type GrammarBlock =
  | { type: "paragraph"; text: string }
  | { type: "example"; hebrew: string; transliteration?: string; translation: string; note?: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "list"; items: string[] }
  | { type: "mistakes"; items: string[] }
  | { type: "exercise"; items: { prompt: string; answer: string }[] };
