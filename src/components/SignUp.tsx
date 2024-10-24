import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Logo from "./Logo";
import axios from "axios";
import Swal from "sweetalert2";

const theme = createTheme({
  palette: {
    primary: {
      main: "#9571f5",
    },
    secondary: {
      main: "#ff6b6b",
    },
  },
});

const SignUp: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido");
      return;
    }

    if (senha !== confirmSenha) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      const response = await axios.post("http://148.113.172.140:8080/Usuario", {
        nome,
        email,
        senha,
      });

      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Cadastro realizado com sucesso!",
          text: "Você será redirecionado para a página de login.",
          confirmButtonColor: "#9571f5",
        });
        window.location.href = "http://148.113.172.140:3000";
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao cadastrar usuário. Por favor, tente novamente.";
      await Swal.fire({
        icon: "error",
        title: "Erro no cadastro",
        text: errorMessage,
        confirmButtonColor: "#9571f5",
      });
      setError(errorMessage);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              marginTop: 8,
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
              borderRadius: "16px",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Logo />
            <Typography
              component="h1"
              variant="h5"
              sx={{ mt: 2, color: "#757575" }}
            >
              Cadastre-se no Vote.io
            </Typography>
            <form
              onSubmit={handleSubmit}
              style={{ width: "100%", marginTop: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    autoComplete="name"
                    name="nome"
                    variant="outlined"
                    required
                    fullWidth
                    id="nome"
                    label="Nome completo"
                    autoFocus
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="E-mail"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="senha"
                    label="Senha"
                    type="password"
                    id="senha"
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="confirmSenha"
                    label="Confirmar senha"
                    type="password"
                    id="confirmSenha"
                    value={confirmSenha}
                    onChange={(e) => setConfirmSenha(e.target.value)}
                  />
                </Grid>
              </Grid>
              {error && (
                <Typography color="error" align="center" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    background:
                      "linear-gradient(45deg, #9571f5 30%, #ff6b6b 90%)",
                    color: "white",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #8460e4 30%, #ff5a5a 90%)",
                    },
                  }}
                >
                  Cadastrar
                </Button>
              </motion.div>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default SignUp;
