import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CommentIcon from "@mui/icons-material/Comment";
import Logo from "./Logo";
import DashboardHeader from "./DashboardHeader";
import { getToken } from "../utils/auth";
import axios from "axios";
import theme from "../theme";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import Skeleton from "@mui/material/Skeleton";

interface Comentario {
  codigoUsuario: string;
  nomeUsuario: string;
  email: string;
  comentario: string;
}

interface Ideia {
  codigo: string;
  titulo: string;
  descricao: string;
  upvotes: number;
  downvotes: number;
  comentarios: Comentario[];
  userVote?: 1 | 2 | null;
}

const api = axios.create({
  baseURL: "http://localhost:5045",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Dashboard: React.FC = () => {
  const [newIdea, setNewIdea] = useState("");
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [focusedIdea, setFocusedIdea] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeias();
  }, []);

  const fetchIdeias = async () => {
    try {
      setLoading(true);
      const response = await api.get("http://localhost:5045/Ideias");
      const ideiasData = response.data.ideias;
      const ideiasVotadas = await fetchIdeiasVotadas();

      const ideiasAtualizadas = ideiasData.map((ideia: Ideia) => {
        const votoUsuario = ideiasVotadas.find(
          (v: { codigoIdeia: string; tipoVote: 1 | 2 }) =>
            v.codigoIdeia === ideia.codigo
        );
        return votoUsuario
          ? { ...ideia, userVote: votoUsuario.tipoVote }
          : ideia;
      });

      setIdeias(ideiasAtualizadas);
    } catch (error) {
      console.error("Erro ao buscar ideias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(
        "http://localhost:5045/Ideia",
        { descricao: newIdea },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setNewIdea("");
      fetchIdeias();
    } catch (error) {
      console.error("Erro ao submeter ideia:", error);
    }
  };

  const handleFocusIdea = (codigo: string) => {
    setFocusedIdea((prevFocusedIdea) =>
      prevFocusedIdea === codigo ? null : codigo
    );
  };

  const handleVote = async (codigoIdeia: string, tipoVote: 1 | 2) => {
    try {
      const ideia = ideias.find((i) => i.codigo === codigoIdeia);
      if (!ideia) return;

      if (ideia.userVote === tipoVote) {
        // Deletar o voto
        const response = await api.delete("http://localhost:5045/Ideias", {
          data: { codigoIdeia },
        });
        if (response.data.sucesso) {
          setIdeias((prevIdeias) =>
            prevIdeias.map((ideia) =>
              ideia.codigo === codigoIdeia
                ? {
                    ...ideia,
                    userVote: null,
                    upvotes: tipoVote === 1 ? ideia.upvotes - 1 : ideia.upvotes,
                    downvotes:
                      tipoVote === 2 ? ideia.downvotes - 1 : ideia.downvotes,
                  }
                : ideia
            )
          );
        }
      } else {
        // Se já existe um voto diferente, primeiro remova-o
        if (ideia.userVote) {
          await api.delete("http://localhost:5045/Ideias", {
            data: { codigoIdeia },
          });
        }

        // Adicionar o novo voto
        const response = await api.post("http://localhost:5045/Ideias/Vote", {
          codigoIdeia,
          tipoVote,
        });
        if (response.data.sucesso) {
          setIdeias((prevIdeias) =>
            prevIdeias.map((ideia) =>
              ideia.codigo === codigoIdeia
                ? {
                    ...ideia,
                    userVote: tipoVote,
                    upvotes:
                      tipoVote === 1
                        ? ideia.upvotes + 1
                        : ideia.userVote === 1
                        ? ideia.upvotes - 1
                        : ideia.upvotes,
                    downvotes:
                      tipoVote === 2
                        ? ideia.downvotes + 1
                        : ideia.userVote === 2
                        ? ideia.downvotes - 1
                        : ideia.downvotes,
                  }
                : ideia
            )
          );
        }
      }
    } catch (error) {
      console.error("Erro ao votar:", error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const calcularNovaNota = (
    ideia: Ideia,
    novoVoto: 1 | 2
  ): { upvotes: number; downvotes: number } => {
    let { upvotes, downvotes } = ideia;

    if (ideia.userVote === novoVoto) {
      // Se o usuário está removendo seu voto
      if (novoVoto === 1) {
        upvotes--;
      } else {
        downvotes--;
      }
    } else if (ideia.userVote) {
      // Se o usuário está mudando seu voto
      if (novoVoto === 1) {
        upvotes++;
        downvotes--;
      } else {
        upvotes--;
        downvotes++;
      }
    } else {
      // Se o usuário está votando pela primeira vez
      if (novoVoto === 1) {
        upvotes++;
      } else {
        downvotes++;
      }
    }

    return { upvotes, downvotes };
  };

  const fetchIdeiasVotadas = async () => {
    try {
      const response = await api.get(
        "http://localhost:5045/Usuario/ObterIdeiasVotadas"
      );
      return response.data.ideiasVotadas;
    } catch (error) {
      console.error("Erro ao buscar ideias votadas:", error);
      return [];
    }
  };

  const LoadingSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {[1, 2, 3].map((item) => (
        <Card key={item} sx={{ mb: 2, borderRadius: "12px" }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
          </CardContent>
          <CardActions>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={20} height={20} sx={{ ml: 1 }} />
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ ml: 2 }}
            />
            <Skeleton variant="text" width={20} height={20} sx={{ ml: 1 }} />
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ ml: 2 }}
            />
            <Skeleton variant="text" width={20} height={20} sx={{ ml: 1 }} />
          </CardActions>
        </Card>
      ))}
    </motion.div>
  );

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <DashboardHeader />
        <Container
          maxWidth="lg"
          sx={{
            mt: 4,
            mb: 4,
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Paper
                  sx={{
                    p: 2,
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
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ color: "#757575" }}
                  >
                    Bem-vindo ao Portal de Ideias
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  ideias.map((ideia) => (
                    <motion.div
                      key={ideia.codigo}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card
                        id={`ideia-${ideia.codigo}`}
                        sx={{
                          mb: 2,
                          borderRadius: "12px",
                          transition: "all 0.3s ease-in-out",
                          cursor: "pointer",
                          transform:
                            focusedIdea === ideia.codigo
                              ? "scale(1.02)"
                              : "scale(1)",
                          boxShadow:
                            focusedIdea === ideia.codigo
                              ? "0 8px 16px rgba(0, 0, 0, 0.1)"
                              : "0 4px 8px rgba(0, 0, 0, 0.05)",
                        }}
                        onClick={() => handleFocusIdea(ideia.codigo)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {ideia.titulo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ideia.descricao}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <IconButton
                            aria-label="upvote"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(ideia.codigo, 1);
                            }}
                            color={ideia.userVote === 1 ? "primary" : "default"}
                          >
                            {ideia.userVote === 1 ? (
                              <ThumbUpIcon />
                            ) : (
                              <ThumbUpOutlinedIcon />
                            )}
                          </IconButton>
                          <Typography variant="body2">
                            {ideia.upvotes}
                          </Typography>
                          <IconButton
                            aria-label="downvote"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(ideia.codigo, 2);
                            }}
                            color={ideia.userVote === 2 ? "primary" : "default"}
                          >
                            {ideia.userVote === 2 ? (
                              <ThumbDownIcon />
                            ) : (
                              <ThumbDownOutlinedIcon />
                            )}
                          </IconButton>
                          <Typography variant="body2">
                            {ideia.downvotes}
                          </Typography>
                          <IconButton
                            aria-label="comments"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFocusIdea(ideia.codigo);
                            }}
                          >
                            <CommentIcon />
                          </IconButton>
                          <Typography variant="body2">
                            {ideia.comentarios.length}
                          </Typography>
                        </CardActions>
                        {focusedIdea === ideia.codigo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Comentários
                              </Typography>
                              {ideia.comentarios.map((comentario, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="subtitle2">
                                      {comentario.nomeUsuario}
                                    </Typography>
                                    <Typography variant="body2">
                                      {comentario.comentario}
                                    </Typography>
                                  </Paper>
                                </motion.div>
                              ))}
                            </CardContent>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </Grid>
            <Grid item xs={12}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    borderRadius: "16px",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Typography variant="h6" gutterBottom component="div">
                    Submeter Nova Ideia
                  </Typography>
                  <form onSubmit={handleSubmitIdea}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Digite sua ideia aqui..."
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        background:
                          "linear-gradient(45deg, #9571f5 30%, #ff6b6b 90%)",
                        color: "white",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #8460e4 30%, #ff5a5a 90%)",
                        },
                      }}
                    >
                      Submeter Ideia
                    </Button>
                  </form>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
