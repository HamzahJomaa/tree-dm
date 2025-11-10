// src/components/cards/InitiativeCard.js
import { Card, CardHeader, CardContent, Typography, Box, Grid, Tooltip } from "@mui/material";
import { Star } from "@mui/icons-material";
import {
  GaugeContainer,
  GaugeReferenceArc,
  GaugeValueArc,
} from "@mui/x-charts";
import GaugePointer from "./GaugePointer"; // adjust import path if needed

const InitiativeCard = ({ node, cardRef, impact, setHoveredNode }) => {
  const backgroundColor = node?.transformative == "Transformative" ? "#EAF5FC" : "#F2F2F2";

  return (
            <Tooltip followCursor title={node.name || "No description available"} arrow>

    <Card
            onMouseEnter={() => setHoveredNode(node.code)}   // 👈 set hover start
  onMouseLeave={() => setHoveredNode(null)} 
      ref={cardRef}
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        width: 200,
        height: "fit-content",
        textAlign: "center",
        position: "relative",
        backgroundColor,
        color: "#000",
      }}
    >
      <CardHeader
        sx={{ p: 0.2 }}
        title={
          <Box sx={{ position: "relative" }}>
            {/* ✅ Node code */}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              noWrap
              sx={{ color: "#000" }}
            >
              {node.code}
            </Typography>
          </Box>
        }
      />

      <CardContent style={{paddingBottom: 0}}>
        {/* ✅ Description with hover tooltip */}
          <Typography
            variant="body2"
            sx={{
              color: "black",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
              cursor: "pointer",
            }}
          >
            {node.name || "No description available"}
          </Typography>

        {/* ✅ Gauge (impact %) */}
        <Grid container justifyContent="flex-start" alignItems="center" sx={{ mt: 1 }}>
          <GaugeContainer
            width={40}
            height={40}
            startAngle={-110}
            endAngle={110}
            value={impact || 0}
            speed={6}
          >
            <GaugeReferenceArc />
            <GaugeValueArc />
            <GaugePointer />
          </GaugeContainer>
        </Grid>
      </CardContent>
    </Card>
        </Tooltip>

  );
};

export default InitiativeCard;
