// app/timeline/page.tsx
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import GanttChart from "@/components/GanttChart";


type Category = { id: string; name: string };
type Task = { id: string; name: string; start: number; duration: number | string };
type ApiResponse = { categories: Category[]; series: Task[] };

async function getTimelineFromRoute(): Promise<ApiResponse> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  if (!host) throw new Error("Cannot determine host for API call");

  const origin = `${proto}://${host}`;
  const res = await fetch(`${origin}/api/timeline`, {
    // Ensure you always get fresh data (no ISR caching)
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch /api/timeline: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export default async function TimelinePage() {
  const { categories, series } = await getTimelineFromRoute();

  // Normalize duration to number (in case JSON has strings)
  const seriesData = series.map((t) => ({ ...t, duration: Number(t.duration ?? 0) }));

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Timeline</h1>
      <GanttChart categoryData={categories} seriesData={seriesData} height={600} />
    </main>
  );
}
