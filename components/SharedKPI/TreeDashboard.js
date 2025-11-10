import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { Box, IconButton, Collapse } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import links from "@/data/SharedKPI/links.json";


import NationalOKRCard from "./NationalCard";
import EntityOKRCard from "./EntityOKRCard";
import InitiativeCard from "./InitiativeCard";

// Contexts to share node expansion state and node position data across the tree
const NodePositionContext = React.createContext();
const NodeExpansionContext = React.createContext();

/**
 * Recursively renders a tree of OKR cards.  Each card measures its own
 * on‑screen position relative to the container and registers that position in
 * the NodePositionContext.  When a branch collapses, all descendant
 * positions are removed so interdependency lines are not drawn to hidden
 * nodes.
 */
const TreeNode = ({ parent, node, level = 0 }) => {
  const { expanded, setExpanded } = useContext(NodeExpansionContext);
const { setPositions, containerRef, setHoveredNode } = useContext(NodePositionContext);
  const cardRef = useRef(null);

  // Determine whether this node is currently expanded
  const isOpen = expanded[node.code] || false;
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  // Example impact score for initiative cards
  const [impact] = useState(() => Math.floor(Math.random() * 101));

  // Toggle this node's expanded state
  const toggleExpand = () => {
    setExpanded((prev) => ({
      ...prev,
      [node.code]: !prev[node.code],
    }));
  };

  // Measure the card's position relative to the scroll container and store it
  const updatePosition = useCallback(() => {
    if (cardRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = cardRef.current.getBoundingClientRect();
      setPositions((prev) => ({
        ...prev,
        [node.code]: {
          x:
            rect.left -
            containerRect.left +
            rect.width / 2 +
            containerRef.current.scrollLeft,
          y:
            rect.top -
            containerRect.top +
            rect.height / 2 +
            containerRef.current.scrollTop,
          width: rect.width,
          height: rect.height,
          parent,
        },
      }));
    }
  }, [node.code, parent, setPositions, containerRef]);

  // Update position on mount and when the window resizes
  useEffect(() => {
    updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePosition]);

  // Update position again when this node expands or collapses
  useEffect(() => {
    updatePosition();
  }, [isOpen, updatePosition]);

  // When collapsing, remove all descendant positions so hidden nodes don't get lines
  useEffect(() => {
    if (!isOpen) {
      setPositions((prev) => {
        const updated = { ...prev };
        const removeDescendants = (current) => {
          if (current.children) {
            current.children.forEach((child) => {
              delete updated[child.code];
              removeDescendants(child);
            });
          }
        };
        removeDescendants(node);
        return updated;
      });
    }
  }, [isOpen, node, setPositions]);

  // Render the appropriate OKR card type based on the current tree depth
  const renderCard = () => {
    if (level === 0) return <NationalOKRCard node={node} cardRef={cardRef} />;
    if (level === 1) return <EntityOKRCard parent={parent} node={node} cardRef={cardRef} />;
    if (level === 2)
      return <InitiativeCard setHoveredNode={setHoveredNode}
     node={node} cardRef={cardRef} impact={impact} />;
    return <div>Unsupported level</div>;
  };

  // Use a row layout for top level nodes and column layout for deeper levels
  const isRowLayout = level < 1;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        m: 0.5,
      }}
    >
      {renderCard()}
      {hasChildren && (
        <IconButton onClick={toggleExpand} size="small" sx={{ mt: 0.5 }}>
          {isOpen ? <Remove /> : <Add />}
        </IconButton>
      )}
      {hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit onExit={updatePosition}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isRowLayout ? "row" : "column",
              justifyContent: "center",
              alignItems: isRowLayout ? "flex-start" : "center",
              mt: isRowLayout ? 4 : 0,
              position: "relative",
            }}
          >
            {node.children.map((child) => (
              <Box key={child.code} sx={{ mx: 1, my: 0.5 }}>
                <TreeNode parent={node.code} node={child} level={level + 1} />
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

/**
 * The top level component that renders a forest of root OKR nodes and draws
 * optional interdependency connectors between them.  When interdependencies
 * are enabled, only visible nodes have their positions registered and only
 * links between those nodes are drawn.  A ResizeObserver ensures that the
 * canvas updates whenever the container's dimensions change due to the
 * dynamic height provided by `height: fit-content`.
 */
const TreeDashboard = ({ data, interdependencies = false }) => {
  const [positions, setPositions] = useState({});
  const [expanded, setExpanded] = useState({});
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null); // 👈 new

  // Draw connectors between visible nodes.  A unique color is assigned to
  // each visible link so that multiple interdependencies are easily
  // distinguishable.  If there are no visible links, nothing is drawn.
const drawLinks = useCallback(() => {
  if (!interdependencies) return;

  const canvas = canvasRef.current;
  const container = containerRef.current;
  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { scrollWidth, scrollHeight } = container;
  const dpr = window.devicePixelRatio || 1;

  // --- scale canvas for crisp lines ---
  canvas.width = scrollWidth * dpr;
  canvas.height = scrollHeight * dpr;
  canvas.style.width = `${scrollWidth}px`;
  canvas.style.height = `${scrollHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, scrollWidth, scrollHeight);

  const visibleLinks = links.filter(l => positions[l.from] && positions[l.to]);
  if (!visibleLinks.length) return;

  const colors = visibleLinks.map((_, i) =>
    `hsl(${Math.round((360 / visibleLinks.length) * i)}, 100%, 50%)`
  );

  for (let i = 0; i < visibleLinks.length; i++) {
    const link = visibleLinks[i];
    const from = positions[link.from];
    const to = positions[link.to];
    if (!from || !to) continue;

    const isHighlighted = !hoveredNode || link.from === hoveredNode || link.to === hoveredNode;
    ctx.globalAlpha = isHighlighted ? 1 : 0;

    const midX = (from.x + to.x) / 2;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x + 0.5, from.y + 0.5);
    ctx.lineTo(midX + 0.5, from.y + 0.5);
    ctx.lineTo(midX + 0.5, to.y + 0.5);
    ctx.lineTo(to.x + 0.5, to.y + 0.5);
    ctx.strokeStyle = colors[i];
    ctx.stroke();

    // Dots
    ctx.beginPath();
    ctx.arc(from.x, from.y, 4, 0, Math.PI * 2);
    ctx.arc(to.x, to.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}, [positions, interdependencies, hoveredNode]);

  // Redraw links whenever node positions or expansion state changes
  useEffect(() => {
    drawLinks();
}, [positions, expanded, drawLinks, hoveredNode]);

  // Attach scroll/resize observers when interdependencies are enabled
  useEffect(() => {
    if (!interdependencies) return;
    const handle = () => drawLinks();
    const el = containerRef.current;
    if (!el) return;
    // Scroll and window resize events affect link positions
    el.addEventListener("scroll", handle);
    window.addEventListener("resize", handle);
    // Observe container size changes due to dynamic height (fit‑content)
    const observer = new ResizeObserver(() => drawLinks());
    observer.observe(el);
    return () => {
      if (el) el.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);
      observer.disconnect();
    };
  }, [drawLinks, interdependencies]);

  return (
    <Box
      ref={containerRef}
      sx={{
        p: 2,
        height: "fit-content",
        display: "flex",
        width: "100%",
        position: "relative",
      }}
    >
      {interdependencies && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}
      <NodeExpansionContext.Provider value={{ expanded, setExpanded }}>
        <NodePositionContext.Provider
          value={{ positions, setPositions, containerRef, hoveredNode, setHoveredNode }}
        >
          {data.map((root) => (
            <TreeNode
              key={root.code}
              parent={root.code}
              node={root}
              level={0}
            />
          ))}
        </NodePositionContext.Provider>
      </NodeExpansionContext.Provider>
    </Box>
  );
};

export default TreeDashboard;