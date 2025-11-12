import { NextResponse } from "next/server";

// --- Inline "lib": types + data loader/transformers ---
type Category = { id: string; name: string };
type Task = { id: string; name: string; start: number; duration: number };

async function getTimelineData(): Promise<{ categories: Category[]; series: Task[] }> {
  // Static JSON imports (tree-shakable and edge-safe)
  const categories: Category[] = (await import("@/data/Timeline/records_basic.json")).default;
  const rawSeries: Array<{ id: string; name: string; start: number; duration: number | string }> =
    (await import("@/data/Timeline/records_with_dates.json")).default;

  // Normalize duration to number, guard against bad values
  const series: Task[] = rawSeries.map((t) => ({
    ...t,
    duration: Number(t.duration ?? 0),
  }));

  // (Optional) ensure every task id exists in categories
  const categoryIds = new Set(categories.map((c) => c.id));
  const filtered = series.filter((t) => categoryIds.has(t.id));

  return { categories, series: filtered };
}
// --- end inline "lib" ---

export async function GET() {
  try {
    const data = await getTimelineData();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[/api/timeline] error:", err);
    return NextResponse.json({ error: "Failed to load timeline data" }, { status: 500 });
  }
}
