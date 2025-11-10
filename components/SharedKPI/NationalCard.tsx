// components/SharedKPI/NationalCard.tsx
"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  SxProps,
  Theme,
  CardProps,
} from "@mui/material";

type NodeType = { code: string; name?: string };

export interface NationalOKRCardProps extends Omit<CardProps, "title"> {
  node: NodeType;
  sx?: SxProps<Theme>;
}

const defaultSx: SxProps<Theme> = {
  backgroundColor: "#8A1538",
  borderRadius: 3,
  boxShadow: 3,
  width: 200,
  height: 150,
  textAlign: "center",
  position: "relative",
  color: "#fff",
  opacity: 0.9,
  cursor: "pointer",
};

const NationalOKRCard = React.forwardRef<HTMLDivElement, NationalOKRCardProps>(
  ({ node, sx, onClick, ...cardProps }, ref) => {
    // ✅ Build a merged sx that never includes `undefined`
    const mergedSx: SxProps<Theme> = React.useMemo(() => {
      const rest = Array.isArray(sx) ? sx : sx ? [sx] : [];
      return [defaultSx, ...rest] as SxProps<Theme>;
    }, [sx]);

    return (
      <Card ref={ref} onClick={onClick} sx={mergedSx} {...cardProps}>
        <CardHeader
          sx={{ p: 0.2 }}
          title={
            <Box sx={{ position: "relative" }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {node.code}
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Typography variant="body2">
            {node.name || "No description available"}
          </Typography>
        </CardContent>
      </Card>
    );
  }
);

NationalOKRCard.displayName = "NationalOKRCard";
export default NationalOKRCard;
