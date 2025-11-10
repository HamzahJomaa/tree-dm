// src/components/cards/EntityOKRCard.js
import { Card, CardHeader, CardContent, Typography, Box, Tooltip } from "@mui/material";
import { Star } from "@mui/icons-material";
import logo from "@/data/SharedKPI/logos.json";
import RandomLevelIndicator from "./RandomLevelIndicator";
import ownership from "@/data/SharedKPI/ownership.json";

const EntityOKRCard = ({ parent, node, cardRef }) => {
  return (
    <Card
      ref={cardRef}
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        width: node?.logo ? 240 : 200,
        height: logo[node.ownership] ? 180 : 110,
        textAlign: "center",
        position: "relative",
        backgroundColor: "#F9DCE4",
        color: "#8A1538",
      }}
    >
      <CardHeader
        sx={{ p: 0.2 }}
        title={
          <Box sx={{ position: "relative" }}>
            <RandomLevelIndicator parent={parent} node={node} />

            {/* ✅ Node code */}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              noWrap
              sx={{ color: "#8A1538" }}
            >
              {node.code}
            </Typography>
            { ownership[parent] == node.ownership && <Star sx={{ position: "absolute", left: 0, top: 0, color: "#8A1538" }} /> }
          </Box>
        }
      />

      <CardContent>
        {/* ✅ Optional logo */}
        {logo[node.ownership] && (
          <Box sx={{ mb: 1 }}>
            <img
              src={`./assets/${logo[node.ownership]}`}
              alt={`${node.code}-logo`}
              style={{ maxWidth: "100%", maxHeight: 60, objectFit: "contain" }}
            />
          </Box>
        )}

        {/* ✅ Description with hover tooltip */}
        <Tooltip title={node.name || "No description available"} arrow>
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
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default EntityOKRCard;
