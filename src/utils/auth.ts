import { jwtDecode } from "jwt-decode";

export const getToken = (): string | null => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("token=")) {
      return cookie.substring("token=".length, cookie.length);
    }
  }
  return null;
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
