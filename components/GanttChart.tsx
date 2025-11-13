"use client";

import React, { useEffect, useRef } from "react";

type Category = { id: string; name: string };
type Task = {
  id: string;
  name: string;
  start: number | null;          // ms epoch
  duration: number;              // days
  end: number | null;            // ms epoch
  linkTo: string[];
};
type RawTask = {
  id: string;
  name: string;
  start: number;
  duration: number | string;
  coTo?: string[]; // 👈 add this (array of ids like "gantt_622")
};
const DAY_MS = 24 * 60 * 60 * 1000;

export default function GanttChart({
  categoryData,
  seriesData,
  height = 600,
  onBarClick, // NEW
}: {
  categoryData: Category[];
  seriesData: RawTask[];
  height?: number;
  onBarClick?: (task: Task & { end: number }) => void; // NEW 
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
      const gantt = root.container.children.push(am5gantt.Gantt.new(root, {
    durationUnit: "day",   // or "hour" but be consistent
    excludeWeekends: true,
  }));


      // Bind your data (ids must match between axis categories and series items)
      gantt.yAxis.data.setAll(categoryData);
      gantt.series.data.setAll(seriesData);
      gantt.editButton.set("visible", false);
      const series = gantt.series; // main bar series

      // Click -> bubble up to parent
      series.columns.template.setAll({ cursorOverStyle: "pointer" });
      series.columns.template.events.on("click", (ev: any) => {
        const di = ev?.target?.dataItem;
        const ctx = di?.dataContext as Task & { end: number } | undefined;
        if (ctx && onBarClick) onBarClick(ctx);
      });

    
      gantt.set("editable", false);
      gantt.appear();
    })();

    return () => {
      if (root) root.dispose();
    };
  }, [categoryData, seriesData]);

  return <div ref={divRef} style={{ width: "100%", height }} />;
}
