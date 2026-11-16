"use client";

import { useEffect, useState } from "react";

interface DateType {
  year: number;
  month: number;
  day: number;
  time: string;
}

export default function DateUI() {
  const [date, setDate] = useState<DateType | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/date", { signal: controller.signal })
      .then((res) => res.json())
      .then((data: DateType) => setDate(data))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort();
  }, []); // Empty array [] ensures it only fetches once on mount

  if (!date) return null;

  return (
    <span>
      {date.year}-{String(date.month).padStart(2, "0")}-{String(date.day).padStart(2, "0")} {date.time}
    </span>
  );
}