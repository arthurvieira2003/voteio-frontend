import React, { useState } from "react";
import { TextField, Button, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";

const LoginCard: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticação aqui
    console.log("Login:", email, password);
  };

  return (
    <Paper elevation={3} className="login-card">
      <Typography variant="h4" component="h1" className="login-title">
        Vote.io
      </Typography>
      <Typography variant="subtitle1" className="login-subtitle">
        Faça login para acessar o portal de ideias
      </Typography>
      <form onSubmit={handleSubmit} className="login-form">
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="E-mail"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Senha"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="submit-button"
          >
            Entrar
          </Button>
        </motion.div>
      </form>
    </Paper>
  );
};

export default LoginCard;
