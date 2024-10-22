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
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CommentIcon from "@mui/icons-material/Comment";
import Logo from "./Logo";
import DashboardHeader from "./DashboardHeader";
import { getToken, decodeToken } from "../utils/auth";
import axios from "axios";
import theme from "../theme";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import Skeleton from "@mui/material/Skeleton";
import PublishIdeaSection from "./PublishIdeaSection";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";

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
  nomeUsuario: string;
  emailUsuario: string;
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
  const [commentText, setCommentText] = useState("");
  const [commentingIdeaId, setCommentingIdeaId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    nome: string;
    email: string;
  } | null>(null);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");

  useEffect(() => {
    fetchIdeias();
    const token = getToken();
    if (token) {
      const decodedToken = decodeToken(token);
      console.log("Decoded Token:", decodedToken);
      if (decodedToken) {
        setCurrentUser({ nome: decodedToken.nome, email: decodedToken.email });
      }
    }
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
      console.log("Ideias atualizadas:", ideiasAtualizadas);
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
        "http://localhost:5045/Ideias",
        {
          titulo: newIdeaTitle,
          descricao: newIdea,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setNewIdeaTitle("");
      setNewIdea("");
      fetchIdeias();
    } catch (error) {
      console.error("Erro ao submeter ideia:", error);
    }
  };

  const handleFocusIdea = (
    codigo: string,
    focusCommentInput: boolean = false
  ) => {
    setFocusedIdea((prevFocusedIdea) =>
      prevFocusedIdea === codigo ? null : codigo
    );
    setCommentingIdeaId(codigo);
    if (focusCommentInput) {
      setTimeout(() => {
        const commentInput = document.getElementById(`comment-input-${codigo}`);
        if (commentInput) {
          (commentInput as HTMLInputElement).focus();
        }
      }, 100);
    }
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

  const handleCommentSubmit = async (ideaId: string) => {
    if (!currentUser) {
      console.error("Usuário não está logado");
      return;
    }

    try {
      const response = await api.post(
        "http://localhost:5045/Ideias/Comentario",
        {
          codigoIdeia: ideaId,
          texto: commentText,
        }
      );

      if (response.status === 200) {
        // Buscar todas as ideias atualizadas
        const ideiasAtualizadas = await api.get("http://localhost:5045/Ideias");

        if (ideiasAtualizadas.status === 200) {
          const todasIdeias = ideiasAtualizadas.data.ideias;
          const novaIdeia = todasIdeias.find(
            (ideia: Ideia) => ideia.codigo === ideaId
          );

          if (novaIdeia) {
            setIdeias((prevIdeias) =>
              prevIdeias.map((ideia) =>
                ideia.codigo === ideaId ? novaIdeia : ideia
              )
            );

            setCommentText("");
            setCommentingIdeaId(null);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      // Aqui você pode adicionar uma notificação de erro para o usuário
    }
  };

  const handleDeleteIdea = async (codigoIdeia: string) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter esta ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, delete!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete("http://localhost:5045/Ideias", {
          data: { codigoIdeia },
        });

        if (response.data.sucesso) {
          setIdeias((prevIdeias) =>
            prevIdeias.filter((ideia) => ideia.codigo !== codigoIdeia)
          );
          Swal.fire(
            "Deletado!",
            "Sua ideia foi removida com sucesso.",
            "success"
          );
        }
      } catch (error) {
        console.error("Erro ao deletar ideia:", error);
        Swal.fire(
          "Erro",
          "Não foi possível deletar a ideia. Por favor, tente novamente.",
          "error"
        );
      }
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

  console.log("Current User:", currentUser);

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
            <Grid item xs={12} md={4}>
              <PublishIdeaSection
                newIdeaTitle={newIdeaTitle}
                setNewIdeaTitle={setNewIdeaTitle}
                newIdea={newIdea}
                setNewIdea={setNewIdea}
                handleSubmitIdea={handleSubmitIdea}
              />
            </Grid>
            <Grid item xs={12} md={8}>
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
                        <CardContent sx={{ padding: 3 }}>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: "bold", color: "#333" }}
                          >
                            {ideia.titulo}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 2,
                              color: "#666",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 18, mr: 1 }} />
                            Postado por: {ideia.nomeUsuario}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 2, lineHeight: 1.6 }}
                          >
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
                              handleFocusIdea(ideia.codigo, true);
                            }}
                          >
                            <CommentIcon />
                          </IconButton>
                          <Typography variant="body2">
                            {ideia.comentarios.length}
                          </Typography>
                          {currentUser &&
                            ideia.emailUsuario === currentUser.email &&
                            (console.log(
                              "Rendering delete button for idea:",
                              ideia.codigo
                            ),
                            (
                              <IconButton
                                aria-label="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteIdea(ideia.codigo);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            ))}
                        </CardActions>
                        {focusedIdea === ideia.codigo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent onClick={(e) => e.stopPropagation()}>
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
                              <TextField
                                id={`comment-input-${ideia.codigo}`}
                                fullWidth
                                variant="outlined"
                                placeholder="Adicione um comentário..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                sx={{ mt: 2 }}
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleCommentSubmit(ideia.codigo)
                                }
                                sx={{ mt: 1 }}
                              >
                                Publicar Comentário
                              </Button>
                            </CardContent>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
