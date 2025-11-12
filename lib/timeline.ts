// Share one source of truth for both the page and API.
import categoriesJson from "@/data/Timeline/records_basic.json";
import rawSeriesJson from "@/data/Timeline/records_with_dates.json";

type Category = { id: string; name: string };
type Task = { id: string; name: string; start: number; duration: number | string };

const categories: Category[] = categoriesJson as Category[];
const rawSeries: Task[] = rawSeriesJson as Task[];

const categoryIds = new Set(categories.map(c => c.id));
const series = rawSeries
  .map(t => ({ ...t, duration: Number(t.duration ?? 0) }))
  .filter(t => categoryIds.has(t.id));

export function getTimelineData() {
  // Pure, synchronous, no I/O per request.
  return { categories, series };
}
