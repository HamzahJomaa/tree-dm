"use client";

import React, { useEffect, useRef } from "react";

type Category = { id: string; name: string };
type Task = { id: string; name: string; start: number; duration: string | number };

const DAY_MS = 24 * 60 * 60 * 1000;

export default function GanttChart({
  categoryData,
  seriesData,
  height = 600,
}: {
  categoryData: Category[];
  seriesData: Task[];
  height?: number;
}) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let root: any | undefined;

    (async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5gantt = await import("@amcharts/amcharts5/gantt");
      const am5themes_Animated = await import("@amcharts/amcharts5/themes/Animated");

      if (!divRef.current) return;

      root = am5.Root.new(divRef.current);
      root.setThemes([am5themes_Animated.default.new(root)]);

      // Create the Gantt
      const gantt = root.container.children.push(am5gantt.Gantt.new(root, {}));

      // If your tasks have "start" and "duration (days)", convert to "end"
      const dataWithEnd = seriesData.map((t) => ({
        ...t,
        end: Number(t.start) + Number(t.duration) * DAY_MS,
      }));

      // Bind your data (ids must match between axis categories and series items)
      gantt.yAxis.data.setAll(categoryData);
      gantt.series.data.setAll(dataWithEnd);

      gantt.appear();
    })();

    return () => {
      if (root) root.dispose();
    };
  }, [categoryData, seriesData]);

  return <div ref={divRef} style={{ width: "100%", height }} />;
}
