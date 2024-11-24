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
import { io } from "socket.io-client";

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
  baseURL: "http://148.113.172.140:8080",
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
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentingIdeaId, setCommentingIdeaId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    nome: string;
    email: string;
  } | null>(null);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    fetchIdeias();
    const pollInterval = setInterval(() => {
      fetchIdeias();
    }, 5000);

    const token = getToken();
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        setCurrentUser({ nome: decodedToken.nome, email: decodedToken.email });
      }
    }

    return () => clearInterval(pollInterval);
  }, []);

  const fetchIdeias = async () => {
    try {
      const response = await api.get("http://148.113.172.140:8080/Ideias");
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

      setIdeias((prevIdeias) => {
        const ideiasMap = new Map(
          prevIdeias.map((ideia) => [ideia.codigo, ideia])
        );
        const atualizadas = ideiasAtualizadas.map((ideia: Ideia) => {
          const anterior = ideiasMap.get(ideia.codigo);
          if (!anterior) return ideia;

          if (
            anterior.upvotes === ideia.upvotes &&
            anterior.downvotes === ideia.downvotes &&
            anterior.comentarios.length === ideia.comentarios.length
          ) {
            return anterior;
          }
          return ideia;
        });

        return atualizadas;
      });
    } catch (error) {
      console.error("Erro ao buscar ideias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIdeaTitle.trim() || !newIdea.trim()) {
      Swal.fire({
        title: "Atenção",
        text: "O título e a descrição da ideia não podem estar vazios",
        icon: "warning",
      });
      return;
    }

    try {
      await api.post(
        "http://148.113.172.140:8080/Ideias",
        {
          titulo: newIdeaTitle.trim(),
          descricao: newIdea.trim(),
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
    // Atualização otimista
    const ideiaIndex = ideias.findIndex((i) => i.codigo === codigoIdeia);
    const novasIdeias = [...ideias];
    const novasNotas = calcularNovaNota(ideias[ideiaIndex], tipoVote);

    novasIdeias[ideiaIndex] = {
      ...novasIdeias[ideiaIndex],
      upvotes: novasNotas.upvotes,
      downvotes: novasNotas.downvotes,
      userVote: tipoVote,
    };

    setIdeias(novasIdeias);

    try {
      const ideia = ideias.find((i) => i.codigo === codigoIdeia);
      if (!ideia) return;

      let response;
      if (ideia.userVote === tipoVote) {
        response = await api.delete("http://148.113.172.140:8080/Ideias", {
          data: { codigoIdeia },
        });
      } else {
        if (ideia.userVote) {
          await api.delete("http://148.113.172.140:8080/Ideias", {
            data: { codigoIdeia },
          });
        }
        response = await api.post("http://148.113.172.140:8080/Ideias/Vote", {
          codigoIdeia,
          tipoVote,
        });
      }

      if (response.data.sucesso) {
        fetchIdeias(); // Atualiza a lista após votar
      }
    } catch (error) {
      // Em caso de erro, reverte a atualização otimista
      setIdeias(ideias);
      console.error("Erro ao votar:", error);
    }
  };

  const calcularNovaNota = (
    ideia: Ideia,
    novoVoto: 1 | 2
  ): { upvotes: number; downvotes: number } => {
    let { upvotes, downvotes } = ideia;

    if (ideia.userVote === novoVoto) {
      if (novoVoto === 1) {
        upvotes--;
      } else {
        downvotes--;
      }
    } else if (ideia.userVote) {
      if (novoVoto === 1) {
        upvotes++;
        downvotes--;
      } else {
        upvotes--;
        downvotes++;
      }
    } else {
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
        "http://148.113.172.140:8080/Usuario/ObterIdeiasVotadas"
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

    if (!commentText.trim()) {
      Swal.fire({
        title: "Atenção",
        text: "O comentário não pode estar vazio",
        icon: "warning",
      });
      return;
    }

    try {
      const response = await api.post(
        "http://148.113.172.140:8080/Ideias/Comentario",
        {
          codigoIdeia: ideaId,
          texto: commentText.trim(),
        }
      );

      if (response.status === 200) {
        setCommentText("");
        setCommentingIdeaId(null);
        fetchIdeias();
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
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
        const response = await api.delete(
          "http://148.113.172.140:8080/Ideias",
          {
            data: { codigoIdeia },
          }
        );

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
                      layoutId={ideia.codigo}
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
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
                        <CardContent
                          sx={{
                            padding: 3,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
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
                            sx={{
                              mt: 2,
                              lineHeight: 1.6,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              transition: "all 0.3s ease-in-out",
                            }}
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
                          <AnimatePresence mode="wait">
                            <motion.div
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              exit={{ opacity: 0, scaleY: 0 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
                              style={{
                                overflow: "hidden",
                                transformOrigin: "top",
                              }}
                            >
                              <CardContent
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  paddingBottom: 2,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="h6" gutterBottom>
                                  Comentários
                                </Typography>
                                <AnimatePresence>
                                  {ideia.comentarios.map(
                                    (comentario, index) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Paper
                                          elevation={1}
                                          sx={{ p: 2, mb: 2 }}
                                        >
                                          <Typography variant="subtitle2">
                                            {comentario.nomeUsuario}
                                          </Typography>
                                          <Typography variant="body2">
                                            {comentario.comentario}
                                          </Typography>
                                        </Paper>
                                      </motion.div>
                                    )
                                  )}
                                </AnimatePresence>
                                <TextField
                                  id={`comment-input-${ideia.codigo}`}
                                  fullWidth
                                  variant="outlined"
                                  placeholder="Adicione um comentário..."
                                  value={commentText}
                                  onChange={(e) =>
                                    setCommentText(e.target.value)
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleCommentSubmit(ideia.codigo);
                                    }
                                  }}
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
                          </AnimatePresence>
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
