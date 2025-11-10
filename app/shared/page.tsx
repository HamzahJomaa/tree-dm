"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // MUI Grid v2 (for `size` prop)
import SectorFilter from "@/components/SharedKPI/custom/SectorFilter";
import TreeDashboard from "@/components/SharedKPI/TreeDashboard";

// If you use baseUrl/paths in tsconfig, @/ is great. Otherwise adjust relative paths:
import initiatives from "@/data/SharedKPI/initiatives.json";
import rawTree from "@/data/SharedKPI/tree.json";
import Entities from "@/data/SharedKPI/logos.json";

type AnyObj = Record<string, any>;


// types shared near the component
type Initiative = { code: string; name: string; groupby?: string };

// in app/shared/page.tsx
const toInitiative = (o: Record<string, any>): Initiative => ({
  code: String(o.code ?? o.Code ?? o.id),      // adapt to your real keys
  name: String(o.name ?? o.Name ?? o.title),   // adapt to your real keys
  groupby: o.groupby ?? o.Group ?? o.category, // optional
});


function transformData(data: AnyObj[]): AnyObj[] {
  return data.map((item) => ({
    ...item,
    Sector: String(item.code || "").substring(0, 2),
    children: item.children ? transformData(item.children) : [],
  }));
}

function filterInitiativesBottomUp(data: AnyObj[], filters: AnyObj[]) {
  const allowedCodes = filters.map((f) => String(f.code || "").toLowerCase());

  function applyFilter(items: AnyObj[]): AnyObj[] {
    return items
      .map((item) => {
        const filteredChildren = applyFilter(item.children || []);
        const sectorOk = allowedCodes.includes(String(item.Sector || "").toLowerCase());
        const ownerOk = allowedCodes.includes(String(item.ownership || "").toLowerCase());
        if (sectorOk || ownerOk || filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as AnyObj[];
  }

  return applyFilter(data);
}

export default function TreeApp() {
  const [Sectors, setSectors] = useState<AnyObj[]>([]);
  const [InitiativesData, setInitiativesData] = useState<AnyObj[]>([]);
  const [showInterDependcies, setShowInterDependcies] = useState(false);

  // Prepare sector list and initial data
  useEffect(() => {
    // sectors from initiatives.json
    const sectors = Array.from(new Set((initiatives as AnyObj[]).map((i) => i["Sector"])))
      .map((code) => ({ code, name: code }));
    setSectors(sectors);

    // initial tree shown (transformed once)
    setInitiativesData(transformData(rawTree as AnyObj[]));
  }, []);

  const handleChange = (value: AnyObj[], filter_name: "national" | null = null) => {
    if (filter_name === "national") {
      // filter top-level by selected national OKRs
      const selectedCodes = value.map((v) => v.code);
      setInitiativesData(transformData((rawTree as AnyObj[]).filter((n) => selectedCodes.includes(n.code))));
      return;
    }

    if (value.length > 0) {
      const filtered = filterInitiativesBottomUp(transformData(rawTree as AnyObj[]), value);
      setInitiativesData(filtered);
    } else {
      setInitiativesData(transformData(rawTree as AnyObj[]));
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* Sticky controls bar */}
      <Box
        sx={{
          zIndex: 1000,
          position: "fixed",
          width: "calc(100% - 20rem)", // matches your drawer width (240px ≈ 15rem); adjust as needed
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
          p: 2,
        }}
      >
        <Grid container gap={2}>
          {/* Legend: Transformative / Strategic */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              bgcolor: "background.paper",
              width: "fit-content",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: "#EAF5FC", borderRadius: "4px" }} />
              <Typography variant="body2">Transformative</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: "#F2F2F2", borderRadius: "4px" }} />
              <Typography variant="body2">Strategic</Typography>
            </Box>
          </Box>

          {/* Legend: High / Medium */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              bgcolor: "background.paper",
              width: "fit-content",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: "green", borderRadius: "20px" }} />
              <Typography variant="body2">High</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: "yellow", borderRadius: "20px" }} />
              <Typography variant="body2">Medium</Typography>
            </Box>
          </Box>
        </Grid>

        <Grid container spacing={3} py={3}>
          <Grid size={3}>
            {(rawTree as AnyObj[]).length > 0 && (
              <SectorFilter
                limitTags={2}
                label="National OKR"
                placeholder="Select OKR"
                onChange={(value: AnyObj[]) => handleChange(value, "national")}
                groupby={false}
                initiatives={(rawTree as AnyObj[]).map((item) => ({
                  code: item?.code,
                  name: `${item?.code}: ${item?.name}`,
                }))}
              />
            )}
          </Grid>

          <Grid size={3}>
            {Sectors.length > 0 && (
              <SectorFilter
                label="Sectors"
                placeholder="Select Sectors"
                onChange={handleChange}
                groupby={false}
                initiatives={Sectors.map(toInitiative)} 
              />
            )}
          </Grid>

          <Grid size={3}>
            {Entities && (
              <SectorFilter
                label="Entities"
                placeholder="Select Entities"
                onChange={handleChange}
                groupby={false}
                initiatives={Object.keys(Entities as AnyObj).map((k) => ({ code: k, name: k }))}
              />
            )}
          </Grid>

          <Grid size={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showInterDependcies}
                  onChange={(e) => setShowInterDependcies(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable interdependencies"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main visualization */}
      <Box sx={{ pt: 24 /* push content below the fixed controls */ }}>
        <TreeDashboard data={InitiativesData} interdependencies={showInterDependcies} />
      </Box>
    </Box>
  );
}
