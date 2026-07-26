import { ImageResponse } from "next/og";

export const alt = "Иврит — изучение языка";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c4a3a 0%, #166534 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 160, display: "flex" }}>עברית</div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 24, display: "flex" }}>
          Иврит — изучение языка
        </div>
        <div style={{ fontSize: 32, marginTop: 12, opacity: 0.85, display: "flex" }}>
          Тексты, грамматика и карточки с интервальным повторением
        </div>
      </div>
    ),
    { ...size },
  );
}
