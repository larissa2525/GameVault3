import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#B400FF]/20 border-t-[#B400FF] rounded-full animate-spin"
            style={{ filter: "drop-shadow(0 0 8px #B400FF)" }} />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🎮</div>
        </div>
        <p className="text-gray-500 animate-pulse text-sm">Carregando GameVault...</p>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
