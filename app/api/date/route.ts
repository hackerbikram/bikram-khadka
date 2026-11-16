import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  return NextResponse.json(
    {
      year: now.getFullYear(),
      month: now.getMonth() + 1, // 1-12 instead of 0-11
      day: now.getDate(),        // Day of month (1-31), not getDay()
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    },
    {
      // Prevent caching so time is always fresh
      headers: { "Cache-Control": "no-store" },
    }
  );
}