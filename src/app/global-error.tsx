"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 16, fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Что-то пошло не так</h1>
          <p style={{ color: "#57534e" }}>Произошла критическая ошибка. Попробуйте обновить страницу.</p>
          <button onClick={reset} style={{ marginTop: 8, borderRadius: 8, background: "#166534", color: "white", padding: "8px 16px", border: "none", cursor: "pointer" }}>
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
