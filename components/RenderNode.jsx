import React, { useMemo, useCallback } from "react";

// ---- constants (hoisted) ----
const R = 8;
const PAD = 10;
const LINE_HEIGHT = 15;
const BG_PAD_X = 6;
const BG_PAD_Y = 4;
const FONT = "12px sans-serif";

// ---- color helper (hoisted) ----
const getImpactColor = (impact) => {
  switch (impact?.toLowerCase()) {
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

// ---- fast canvas text measurement with cache (hoisted) ----
const __measureCache = new Map(); // key: `${FONT}::${text}`
let __canvas, __ctx;
function measureText(text, font = FONT) {
  const key = `${font}::${text}`;
  const cached = __measureCache.get(key);
  if (cached) return cached;
  if (!__canvas) {
    __canvas = document.createElement("canvas");
    __ctx = __canvas.getContext("2d");
  }
  __ctx.font = font;
  const width = __ctx.measureText(text).width;
  __measureCache.set(key, width);
  return width;
}

// Optional: memoize wrapLabel by (name, wrapAt)
function wrapMemo(name, wrapAt, wrapLabel) {
  const key = `wrap::${wrapAt}::${name}`;
  if (!wrapMemo.cache) wrapMemo.cache = new Map();
  if (wrapMemo.cache.has(key)) return wrapMemo.cache.get(key);
  const lines = wrapLabel(name, wrapAt);
  wrapMemo.cache.set(key, lines);
  return lines;
}

// ---- component ----
const RenderNode = React.memo(function RenderNode({ nodeDatum, toggleNode, wrapLabel }) {
  const impactColor = getImpactColor(nodeDatum.impact);

  // 1) Wrap once per name
  const lines = useMemo(
    () => wrapMemo(nodeDatum.name, 20, wrapLabel),
    [nodeDatum.name, wrapLabel]
  );

  // 2) Measure max width precisely (cached)
  const textWidth = useMemo(() => {
    if (!lines?.length) return 1;
    let max = 1;
    for (const line of lines) {
      const w = measureText(line, FONT);
      if (w > max) max = w;
    }
    return Math.ceil(max);
  }, [lines]);

  const textHeight = lines.length * LINE_HEIGHT;
  const firstLineY = R + PAD;

  // 3) Stable handler
  const onClick = useCallback(
    (e) => {
      toggleNode();
      e.stopPropagation();
    },
    [toggleNode]
  );

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <circle r={R} strokeWidth={0} fill={impactColor} />
      <rect
        x={-textWidth / 2 - BG_PAD_X}
        y={firstLineY - BG_PAD_Y}
        width={textWidth + BG_PAD_X * 2}
        height={textHeight + BG_PAD_Y * 2}
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
          <tspan key={i} x={0} dy={i === 0 ? 0 : LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}, areEqual);

// Only re-render when the bits we care about change
function areEqual(prev, next) {
  const p = prev.nodeDatum;
  const n = next.nodeDatum;
  return (
    p?.name === n?.name &&
    p?.impact === n?.impact &&
    prev.toggleNode === next.toggleNode &&
    prev.wrapLabel === next.wrapLabel
  );
}

export default RenderNode;
