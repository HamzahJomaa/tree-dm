"use client";
import { useEffect, useState } from "react";
import GanttChart from "@/components/GanttChart";

type Category = { id: string; name: string };
type Task = { id: string; name: string; start: number; duration: number | string };
type ApiResponse = { categories: Category[]; series: Task[] };

export default function TimelinePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/timeline", { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json: ApiResponse = await res.json();
        const series = json.series.map(t => ({ ...t, duration: Number(t.duration ?? 0) }));
        if (mounted) setData({ categories: json.categories, series });
      } catch (e: any) {
        if (mounted) setErr(e.message ?? "Failed to load timeline");
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (err) return <main className="p-6">Error: {err}</main>;
  if (!data) return <main className="p-6">Loading…</main>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Timeline</h1>
      <GanttChart categoryData={data.categories} seriesData={data.series} height={600} />
    </main>
  );
}
