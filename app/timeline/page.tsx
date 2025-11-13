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
  coTo?: string[];
};


type ApiResponse = { categories: Category[]; series: Task[] };


export default function TimelinePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<(Task & { end_date: number }) | null>(null);

  useEffect(() => {
    let mounted = true;
    document.title = "NDS3 Masterplan";
    (async () => {
      try {
        // 👇 static JSON served from /public/data/timeline.json
        const res = await fetch("/data/timeline.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

        const json: ApiResponse = await res.json();
        if (mounted) setData(json);
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
      {/* <h1 className="text-2xl font-semibold mb-4">NDS3 roadmap</h1> */}

      <GanttChart
        categoryData={data.categories}
        seriesData={data.series}
        height={600}
        onBarClick={(task) => {
          setSelected(task as Task & { end_date: number });
          setOpen(true);
        }}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Task details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <div style={{ lineHeight: 1.7 }}>
              <div>
                <b>Name:</b> {selected.name}
              </div>

              <div>
                <b>Duration:</b> {selected.duration} days
              </div>
              <div>
                <b>Start Date:</b>{" "}
                {new Date(Number(selected.start)).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}
              </div>
              <div>
                <b>End Date:</b>{" "}
                {new Date(Number(selected.end_date)).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}
              </div>
              {selected.coTo && selected.coTo.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Co-requisites
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Code</b>
                        </TableCell>
                        <TableCell>
                          <b>Project</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selected.coTo.map((id) => {
                        const match = data.categories.find((c) => c.id === id);
                        return (
                          <TableRow key={id}>
                            <TableCell>{match?.name.split("-")[0]}</TableCell>
                            <TableCell>
                              {match ? match?.name.split("-")[1] : "Not found in categories"}
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


