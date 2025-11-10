// ControlPanel.jsx
import * as React from "react";
import {
  Paper, Stack, Typography, FormControl, InputLabel, Select, MenuItem,
  Slider, Switch, TextField, FormControlLabel, Button, Box, Chip, Divider
} from "@mui/material";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import ReplayIcon from "@mui/icons-material/Replay";

const impactColors = [
  { label: "High", color: "red", text: "white" },
  { label: "Medium", color: "yellow", text: "black" },
  { label: "Low", color: "green", text: "white" },
];

const statusColors = [
  { label: "On track",   color: "#4CAF50", text: "white" },
  { label: "Delayed",    color: "#FFC107", text: "black" },
  { label: "Completed",  color: "#2196F3", text: "white" },
  { label: "Not started",color: "#9E9E9E", text: "white" },
];

export default function ControlPanel({
  orientation,
  setOrientation,
  pathFunc,
  setPathFunc,
  zoomable,
  setZoomable,
  collapsible,
  setCollapsible,
  zoom,
  setZoom,
  nodeSize,
  setNodeSize,
  separation,
  setSeparation,
  transitionDuration,
  setTransitionDuration,
  centerTree,
  resetAll,
  outcomes,
  selectedOutcome,
  setSelectedOutcome,

  // NEW filter props
  selectedImpacts,
  setSelectedImpacts,
  selectedStatuses,
  setSelectedStatuses,
}) {
  // --- helpers for toggleable chips ---
  const toggleImpact = (label) => {
    setSelectedImpacts((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const toggleStatus = (label) => {
    setSelectedStatuses((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const selectAllImpacts = () => setSelectedImpacts(impactColors.map((i) => i.label));
  const clearImpacts = () => setSelectedImpacts([]);

  const selectAllStatuses = () => setSelectedStatuses(statusColors.map((s) => s.label));
  const clearStatuses = () => setSelectedStatuses([]);

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 10,
        width: 360,
        maxHeight: "90vh",
        overflow: "auto",
        p: 2,
        borderRadius: 3,
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            Tree Controls
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CenterFocusStrongIcon />}
              onClick={centerTree}
            >
              Center
            </Button>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<ReplayIcon />}
              onClick={resetAll}
            >
              Reset
            </Button>
          </Stack>
        </Stack>

        {/* Outcome filter */}
        <FormControl size="small" fullWidth>
          <InputLabel id="outcome-label">Outcome</InputLabel>
          <Select
            labelId="outcome-label"
            value={selectedOutcome}
            label="Outcome"
            onChange={(e) => setSelectedOutcome(e.target.value)}
          >
            <MenuItem value="">All outcomes</MenuItem>
            {outcomes?.map((o) => (
              <MenuItem key={o.code} value={o.code}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* --- Impact Filter (Toggleable Chips) --- */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Impact Filter
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="text" onClick={selectAllImpacts}>
                Select All
              </Button>
              <Button size="small" variant="text" onClick={clearImpacts}>
                Clear
              </Button>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
            {impactColors.map((item) => {
              const active = selectedImpacts.includes(item.label);
              return (
                <Chip
                  key={item.label}
                  label={item.label}
                  size="small"
                  onClick={() => toggleImpact(item.label)}
                  variant={active ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: active ? item.color : "transparent",
                    color: active ? item.text : "inherit",
                    borderColor: item.color,
                    fontWeight: 600,
                    mb: 1,
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* --- Status Filter (Toggleable Chips) --- */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Status Filter
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="text" onClick={selectAllStatuses}>
                Select All
              </Button>
              <Button size="small" variant="text" onClick={clearStatuses}>
                Clear
              </Button>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
            {statusColors.map((item) => {
              const active = selectedStatuses.includes(item.label);
              return (
                <Chip
                  key={item.label}
                  label={item.label}
                  size="small"
                  onClick={() => toggleStatus(item.label)}
                  variant={active ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: active ? item.color : "transparent",
                    color: active ? item.text : "inherit",
                    borderColor: item.color,
                    fontWeight: 600,
                    mb: 1,
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        <Divider />

        {/* Orientation */}
        <FormControl size="small" fullWidth>
          <InputLabel id="orientation-label">Orientation</InputLabel>
          <Select
            labelId="orientation-label"
            value={orientation}
            label="Orientation"
            onChange={(e) => setOrientation(e.target.value)}
          >
            <MenuItem value="vertical">vertical</MenuItem>
            <MenuItem value="horizontal">horizontal</MenuItem>
          </Select>
        </FormControl>

        {/* Path Function */}
        <FormControl size="small" fullWidth>
          <InputLabel id="pathfunc-label">Path Function</InputLabel>
          <Select
            labelId="pathfunc-label"
            value={pathFunc}
            label="Path Function"
            onChange={(e) => setPathFunc(e.target.value)}
          >
            <MenuItem value="diagonal">diagonal</MenuItem>
            <MenuItem value="elbow">elbow</MenuItem>
            <MenuItem value="step">step</MenuItem>
            <MenuItem value="straight">straight</MenuItem>
          </Select>
        </FormControl>

        {/* Zoom */}
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Zoom ({zoom.toFixed(1)}x)
          </Typography>
          <Slider
            size="small"
            min={0.2}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(_, v) => setZoom(v)}
            valueLabelDisplay="auto"
          />
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.1))}>
              –
            </Button>
            <Button size="small" onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}>
              +
            </Button>
          </Stack>
        </Box>

        {/* Node Size */}
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Node Size (x, y)
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              label="x"
              type="number"
              value={nodeSize.x}
              onChange={(e) => setNodeSize((s) => ({ ...s, x: Number(e.target.value) }))}
              fullWidth
            />
            <TextField
              size="small"
              label="y"
              type="number"
              value={nodeSize.y}
              onChange={(e) => setNodeSize((s) => ({ ...s, y: Number(e.target.value) }))}
              fullWidth
            />
          </Stack>
        </Stack>

        {/* Separation */}
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Separation (siblings, nonSiblings)
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              label="siblings"
              type="number"
              inputProps={{ step: "0.1" }}
              value={separation.siblings}
              onChange={(e) =>
                setSeparation((s) => ({ ...s, siblings: parseFloat(e.target.value) || 0 }))
              }
              fullWidth
            />
            <TextField
              size="small"
              label="nonSiblings"
              type="number"
              inputProps={{ step: "0.1" }}
              value={separation.nonSiblings}
              onChange={(e) =>
                setSeparation((s) => ({ ...s, nonSiblings: parseFloat(e.target.value) || 0 }))
              }
              fullWidth
            />
          </Stack>
        </Stack>

        {/* Transition Duration */}
        <TextField
          size="small"
          label="Transition Duration (ms)"
          type="number"
          value={transitionDuration}
          onChange={(e) => setTransitionDuration(parseInt(e.target.value || "0", 10))}
          fullWidth
        />

        {/* Toggles */}
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={collapsible}
                onChange={(e) => setCollapsible(e.target.checked)}
                size="small"
              />
            }
            label="collapsible"
          />
          <FormControlLabel
            control={
              <Switch
                checked={zoomable}
                onChange={(e) => setZoomable(e.target.checked)}
                size="small"
              />
            }
            label="zoomable"
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
