"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Tree from "react-d3-tree";
import ControlPanel from "@/components/ControlPanel"; // keep your MUI panel
import FullScreenLoader from "@/components/Loading"; // <-- add this

// Add this: unique outcomes list (deduped)
const OUTCOMES = [
  { code: "NO.1", label: "NO.1 - Sustainable Economic Growth" },
  { code: "NO.2", label: "NO.2 - Fiscal Sustainability" },
  { code: "NO.3", label: "NO.3 - Future-Ready Workforce" },
  { code: "NO.4", label: "NO.4 - Cohesive Society" },
  { code: "NO.5", label: "NO.5 - Quality of Life" },
  { code: "NO.6", label: "NO.6 - Environmental Sustainability" },
  { code: "NO.7", label: "NO.7 - Government Excellence" },
];



const containerStyles = { width: "100vw", height: "100vh", background: "#fff" };

// ---- center helper (unchanged) ----
const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState(defaultTranslate);
  const containerRef = React.useCallback((el) => {
    if (el) {
      const { width, height } = el.getBoundingClientRect();
      setTranslate({ x: width / 2, y: height / 2 });
    }
  }, []);
  const centerTree = React.useCallback(() => {
    const el = document.querySelector("#tree-container");
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setTranslate({ x: width / 2, y: height / 2 });
  }, []);
  return [translate, containerRef, centerTree, setTranslate];
};
const getImpactColor = (impact) => {
  switch (impact?.toLowerCase()) {
    case "high":
      return "red";
    case "medium":
      return "yellow";
    case "low":
      return "green";
    default:
      return "gray"; // fallback color
  }
};

// statusColors.ts
const STATUS_COLORS = {
  "on track":   "#4CAF50",
  "delayed":    "#FFC107",
  "completed":  "#2196F3",
  "not started":"#9E9E9E",
};

const getStatusColor = (status) =>
  STATUS_COLORS[status?.toLowerCase?.()] || "#BDBDBD";

// small helper to wrap label
const wrapLabel = (text, maxChars = 15) =>
  (text || "").match(new RegExp(`.{1,${maxChars}}`, "g")) || [];

// --- Custom node (click anywhere to toggle) ---
const renderNodeWithCustomEvents = ({ nodeDatum, toggleNode }) => {
  const lines = wrapLabel(nodeDatum.name, 20);
  const impactColor = getImpactColor(nodeDatum.impact);
  const lineHeight = 15;
  const R = 8;
  const PAD = 10;
  const firstLineY = R + PAD;
  const bgPaddingX = 6;
  const bgPaddingY = 4;
  const textWidth = Math.max(...lines.map((l) => l.length), 1) * 7; // estimate
  const textHeight = lines.length * lineHeight;
  const statusColor = getStatusColor(nodeDatum.status);

  const onClick = (e) => {
    toggleNode();
    e.stopPropagation();
  };

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <circle r={R} fill={impactColor} stroke={statusColor} strokeWidth={3} />
      <rect
        x={-textWidth / 2 - bgPaddingX}
        y={firstLineY - bgPaddingY}
        width={textWidth + bgPaddingX * 2}
        height={textHeight + bgPaddingY * 2}
        rx={4}
        ry={4}
        fill="#f5f5f5"
        stroke="#d0d0d0"
      />
      <text
        x={0}
        y={firstLineY}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize="12px"
        fill="black"
        strokeWidth={0}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Filter root → only keep first-level child whose name starts with selected code
function filterByOutcome(root, code) {
  if (!root || !code) return root;
  if (!Array.isArray(root.children)) return root;
  const kept = root.children.filter((ch) => ch?.name?.startsWith(code));
  return { ...root, children: kept };
}


export default function Page() {
  const [orgChartJson, setOrgChartJson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [translate, containerRef, centerTree] = useCenteredTree();
  const [orientation, setOrientation] = useState("vertical");
  const [pathFunc, setPathFunc] = useState("step");
  const [zoomable, setZoomable] = useState(true);
  const [collapsible, setCollapsible] = useState(true);
  const [zoom, setZoom] = useState(0.9);
  const [nodeSize, setNodeSize] = useState({ x: 200, y: 200 });
  const [separation, setSeparation] = useState({ siblings: 1, nonSiblings: 1.2 });
  const [transitionDuration, setTransitionDuration] = useState(600);

  // NEW: selected outcome code ("" = all)
  const [selectedOutcome, setSelectedOutcome] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tree", { cache: "no-store" });
        const data = await res.json();
        setOrgChartJson(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedOutcome]);

  const resetAll = useCallback(() => {
    setOrientation("vertical");
    setPathFunc("step");
    setZoomable(true);
    setCollapsible(true);
    setZoom(0.9);
    setNodeSize({ x: 200, y: 200 });
    setSeparation({ siblings: 1, nonSiblings: 1.2 });
    setTransitionDuration(600);
    setSelectedOutcome(""); // reset filter
    centerTree();
  }, [centerTree]);

  // NEW: derive filtered data
  const displayedData = useMemo(
    () => (orgChartJson ? filterByOutcome(orgChartJson, selectedOutcome) : null),
    [orgChartJson, selectedOutcome]
  );

  return (
    <div id="tree-container" style={containerStyles} ref={containerRef}>
      <ControlPanel
        // existing props...
        orientation={orientation}
        setOrientation={setOrientation}
        pathFunc={pathFunc}
        setPathFunc={setPathFunc}
        zoomable={zoomable}
        setZoomable={setZoomable}
        collapsible={collapsible}
        setCollapsible={setCollapsible}
        zoom={zoom}
        setZoom={setZoom}
        nodeSize={nodeSize}
        setNodeSize={setNodeSize}
        separation={separation}
        setSeparation={setSeparation}
        transitionDuration={transitionDuration}
        setTransitionDuration={setTransitionDuration}
        centerTree={centerTree}
        resetAll={resetAll}

        // NEW props for the dropdown
        outcomes={OUTCOMES}
        selectedOutcome={selectedOutcome}
        setSelectedOutcome={setSelectedOutcome}
      />

      <FullScreenLoader open={loading} label="Loading tree…" />

      {!loading && displayedData && (
        <Tree
          data={displayedData}
          orientation={orientation}
          translate={translate}
          nodeSize={nodeSize}
          separation={separation}
          zoomable={zoomable}
          zoom={zoom}
          collapsible={collapsible}
          transitionDuration={transitionDuration}
          pathFunc={pathFunc}
          initialDepth={0}
          renderCustomNodeElement={(rd3tProps) =>
            renderNodeWithCustomEvents({ ...rd3tProps })
          }
        />
      )}
    </div>
  );
}