import React from "react";
import { Paper, Typography, TextField, Button } from "@mui/material";
import { motion } from "framer-motion";

interface PublishIdeaSectionProps {
  newIdeaTitle: string;
  setNewIdeaTitle: (title: string) => void;
  newIdea: string;
  setNewIdea: (idea: string) => void;
  handleSubmitIdea: (e: React.FormEvent) => void;
}

const PublishIdeaSection: React.FC<PublishIdeaSectionProps> = ({
  newIdeaTitle,
  setNewIdeaTitle,
  newIdea,
  setNewIdea,
  handleSubmitIdea,
}) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
          borderRadius: "16px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          component="div"
          sx={{ mb: 2, color: "#757575" }}
        >
          Compartilhe sua ideia inovadora
        </Typography>
        <form onSubmit={handleSubmitIdea}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Título da sua ideia"
            value={newIdeaTitle}
            onChange={(e) => setNewIdeaTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Descreva sua ideia em detalhes..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!newIdeaTitle.trim() || !newIdea.trim()}
          >
            Publicar Ideia
          </Button>
        </form>
      </Paper>
    </motion.div>
  );
};

export default PublishIdeaSection;
