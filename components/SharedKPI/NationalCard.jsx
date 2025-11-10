// src/components/cards/NationalOKRCard.js
import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";
import { Star } from "@mui/icons-material";

const NationalOKRCard = ({ node, cardRef, onClick, sx = {
  backgroundColor: "#8A1538",
  borderRadius: 3,
  boxShadow: 3,
  width: 200,
  height: 150,
  textAlign: "center",
  position: "relative",
  color: "#fff",
} }) => {
  return (
    <Card
      ref={cardRef}
      sx={sx}
      onClick={onClick}
    >
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
        <Typography variant="body2" >
          {node.name || "No description available"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NationalOKRCard;
