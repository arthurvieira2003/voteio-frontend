import { jwtDecode } from "jwt-decode";

export const getToken = (): string | null => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  return token ? token.split("=")[1] : null;
};

export const decodeToken = (token: string) => {
  try {
    const decoded = jwtDecode(token) as { [key: string]: any };
    return {
      id: decoded.nameid,
      nome: decoded.unique_name,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Erro ao decodificar o token:", error);
    return null;
  }
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token) as { exp: number };
    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};
