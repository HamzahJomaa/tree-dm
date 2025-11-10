"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import data from "@/data/SharedKPI/tree.json";
import NationalOKRCard from "@/components/SharedKPI/NationalCard";
import { useRouter } from "next/navigation";

const Home: React.FC = () => {
  const router = useRouter();

  // 🔹 Handle card click and send selected node data to /tree
  const handleNationalClick = (node: any) => {
    router.push(`/shared?code=${encodeURIComponent(node.code)}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        National OKRs
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 2,
        }}
      >
        {data.map((item, index) => (
          <NationalOKRCard
            key={index}
            node={item}
            onClick={() => handleNationalClick(item)}
            sx={{
              opacity: 0.8,
              backgroundColor: "grey",
              color: "#fff",
              cursor: "pointer",
              textAlign: "center",
              transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                opacity: 1,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Home;
