import React from "react";
import { Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

const Logo: React.FC = () => {
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h3"
          component="span"
          sx={{
            fontWeight: "bold",
            color: "#9571f5",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Vote
        </Typography>
      </motion.div>
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h3"
          component="span"
          sx={{
            fontWeight: "bold",
            color: "#ff6b6b",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          .io
        </Typography>
      </motion.div>
    </Box>
  );
};

export default Logo;
