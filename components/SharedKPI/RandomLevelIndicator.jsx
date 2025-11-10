import { Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";

const getRandomLevel = () => {
  const levels = ["Low", "Medium", "High"];
  return levels[Math.floor(Math.random() * levels.length)];
};

const levelColors = {
  Low: "red",    // green
  Medium: "yellow", // yellow
  High: "green",     // red
};

export default function RandomLevelIndicator({ parent, node }) {
  const [level, setLevel] = useState("");

  useEffect(() => {
    // Run once on mount to fix the level
    setLevel(node.impact);
  }, []);

  return (
    <Box
      sx={{
        position: "absolute",
        right: 8,
        top: 8,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* Colored Dot */}
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          bgcolor: levelColors[level],
        }}
      />
    </Box>
  );
}
