import React from "react";
import { Grid, Container } from "@mui/material";
import { motion } from "framer-motion";
import LoginCard from "./LoginCard";
import "../styles/Login.css";
import loginImage from "../assets/Login.png";

const Login: React.FC = () => {
  return (
    <Container maxWidth={false} disableGutters className="login-container">
      <Grid container spacing={0} className="full-height">
        <Grid item xs={12} md={6} className="login-card-container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginCard />
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6} className="login-image-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img src={loginImage} alt="Vote.io" className="login-image" />
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
