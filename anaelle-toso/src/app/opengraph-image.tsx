import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.identity.fullName} — ${site.identity.profession}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(ellipse at 75% 70%, #c4834a 0%, #3b2618 38%, #0d0a07 75%)",
          color: "#f4eadb",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", opacity: 0.7, fontFamily: "sans-serif" }}>{site.identity.profession}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, lineHeight: 0.9, letterSpacing: -2 }}>{site.identity.fullName}</div>
          <div style={{ fontSize: 40, marginTop: 28, color: "#d9c4a0", fontStyle: "italic" }}>{site.identity.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
