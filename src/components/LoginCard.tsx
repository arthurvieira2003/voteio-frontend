import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  ThemeProvider,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import theme from "../theme";
import { useStyles } from "../styles/useStyles";

const LoginCard: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const classes = useStyles();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5045/Usuario/login", {
        email,
        password,
      });

      if (response.status === 200 && response.data.token) {
        // Armazenar o token nos cookies
        document.cookie = `token=${response.data.token}; path=/; max-age=3600; SameSite=Strict; Secure`;
        navigate("/dashboard");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao fazer login. Por favor, tente novamente.";
      await Swal.fire({
        icon: "error",
        title: "Erro no login",
        text: errorMessage,
        confirmButtonColor: "#9571f5",
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={3} className="login-card">
        <Logo />
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
            InputLabelProps={{
              style: { color: theme.palette.primary.main },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
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
            InputLabelProps={{
              style: { color: theme.palette.primary.main },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className={classes.gradientButton}
            >
              Entrar
            </Button>
          </motion.div>
          <Typography
            variant="body2"
            align="center"
            style={{ marginTop: "16px" }}
          ></Typography>
          <Typography
            variant="body2"
            align="center"
            style={{ marginTop: "16px" }}
          >
            Não tem uma conta?{" "}
            <a
              href="/signup"
              style={{ color: "#9571f5", textDecoration: "none" }}
            >
              Cadastre-se
            </a>
          </Typography>
        </form>
      </Paper>
    </ThemeProvider>
  );
};

export default LoginCard;
