"use client";

import { useEffect, useState } from "react";
import GanttChart from "@/components/GanttChart";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";

type Category = { id: string; name: string };
type Task = {
  id: string;
  name: string;
  start: number;
  duration: number | string;
  coTo?: string[]; // 👈 add this (array of ids like "gantt_622")
};
type ApiResponse = { categories: Category[]; series: Task[] };

export default function TimelinePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<(Task & { end: number }) | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/timeline", { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json: ApiResponse = await res.json();

        if (mounted) setData({ categories: json.categories, series: json.series });
      } catch (e: any) {
        if (mounted) setErr(e.message ?? "Failed to load timeline");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (err) return <main className="p-6">Error: {err}</main>;
  if (!data) return <main className="p-6">Loading…</main>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Timeline</h1>

      <GanttChart
        categoryData={data.categories}
        seriesData={data.series}
        height={600}
        onBarClick={(task) => {
          // task has { id, name, start, duration, end, coTo?, ... }
          setSelected(task as Task & { end: number });
          setOpen(true);
        }}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Task details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <div style={{ lineHeight: 1.7 }}>
              <div>
                <b>Name:</b> {selected.name}
              </div>
              <div>
                <b>ID:</b> {selected.id}
              </div>
              <div>
                <b>Duration:</b> {selected.duration} days
              </div>
              <div>
                <b>Start:</b>{" "}
                {new Date(Number(selected.start)).toLocaleString()}
              </div>


              {/* 👇 CoTo table (filtered from data.categories) */}
              {selected.coTo && selected.coTo.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Corequisites (coTo)
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><b>ID</b></TableCell>
                        <TableCell><b>Name</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selected.coTo.map((id) => {
                        const match = data.categories.find((c) => c.id === id);
                        return (
                          <TableRow key={id}>
                            <TableCell>{id}</TableCell>
                            <TableCell>
                              {match ? match.name : "Not found in categories"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
