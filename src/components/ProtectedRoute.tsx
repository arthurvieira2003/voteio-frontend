import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isTokenValid()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
