"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Tree from "react-d3-tree";
import ControlPanel from "@/components/ControlPanel";
import FullScreenLoader from "@/components/Loading";

// Deduped outcomes for the dropdown
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

// Centering helper
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

// Color helpers
const getImpactColor = (impact) => {
  switch ((impact || "").toLowerCase()) {
    case "high":
      return "red";
    case "medium":
      return "yellow";
    case "low":
      return "green";
    default:
      return "gray";
  }
};

const STATUS_COLORS = {
  "on track": "#4CAF50",
  delayed: "#FFC107",
  completed: "#2196F3",
  "not started": "#9E9E9E",
};
const getStatusColor = (status) =>
  STATUS_COLORS[status?.toLowerCase?.()] || "#BDBDBD";

// Wrap text helper
const wrapLabel = (text, maxChars = 15) =>
  (text || "").match(new RegExp(`.{1,${maxChars}}`, "g")) || [];

// Custom node
const renderNodeWithCustomEvents = ({ nodeDatum, toggleNode }) => {
  const lines = wrapLabel(nodeDatum.name, 20);
  const impactColor = getImpactColor(nodeDatum.impact);
  const statusColor = getStatusColor(nodeDatum.status);

  const lineHeight = 15;
  const R = 8;
  const PAD = 10;
  const firstLineY = R + PAD;
  const bgPaddingX = 6;
  const bgPaddingY = 4;
  const textWidth = Math.max(...lines.map((l) => l.length), 1) * 7; // estimate
  const textHeight = lines.length * lineHeight;

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

// Optional: additionally restrict to a single top-level outcome by code (client-side)
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

  // Filters for ControlPanel
  const [selectedOutcome, setSelectedOutcome] = useState(""); // maps to code
  const [selectedImpacts, setSelectedImpacts] = useState([]); // e.g. ["High","Medium"]
  const [selectedStatuses, setSelectedStatuses] = useState([]); // e.g. ["Delayed","On Track"]

  // Fetch server-pruned tree whenever filters change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedOutcome) params.set("code", selectedOutcome);
        if (selectedImpacts.length) params.set("impact", selectedImpacts.join(","));
        if (selectedStatuses.length) params.set("status", selectedStatuses.join(","));

        const url = `/api/tree${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        setOrgChartJson(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedOutcome, selectedImpacts, selectedStatuses]);

  const resetAll = useCallback(() => {
    setOrientation("vertical");
    setPathFunc("step");
    setZoomable(true);
    setCollapsible(true);
    setZoom(0.9);
    setNodeSize({ x: 200, y: 200 });
    setSeparation({ siblings: 1, nonSiblings: 1.2 });
    setTransitionDuration(600);

    // Reset filters
    setSelectedOutcome("");
    setSelectedImpacts([]);
    setSelectedStatuses([]);

    centerTree();
  }, [centerTree]);

  // If you still want client-side restriction to one outcome, keep this; otherwise just use orgChartJson
  const displayedData = useMemo(() => {
    if (!orgChartJson) return null;
    // comment next line if you rely entirely on server filtering by code
    return filterByOutcome(orgChartJson, selectedOutcome);
  }, [orgChartJson, selectedOutcome]);

  return (
    <div id="tree-container" style={containerStyles} ref={containerRef}>
      <ControlPanel
        // existing tree controls
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

        // outcome dropdown
        outcomes={OUTCOMES}
        selectedOutcome={selectedOutcome}
        setSelectedOutcome={setSelectedOutcome}

        // NEW: filters (wire these in your ControlPanel UI)
        selectedImpacts={selectedImpacts}
        setSelectedImpacts={setSelectedImpacts}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
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
