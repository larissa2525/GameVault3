import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gamepad2, Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;



export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; pulse: number; pulseSpeed: number }>>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Circuit animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create nodes
    const nodeCount = 40;
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = nodesRef.current;

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.25;
            const pulse = (Math.sin(nodes[i].pulse) + 1) / 2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * (0.5 + pulse * 0.5)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        const pulse = (Math.sin(node.pulse) + 1) / 2;
        const radius = 2 + pulse * 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${0.4 + pulse * 0.6})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${0.05 + pulse * 0.1})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao entrar",
        description: error.message === "Invalid login credentials"
          ? "Email ou senha inválidos"
          : error.message,
      });
    } else {
      toast({ variant: "success", title: "✅ Login realizado!", description: "Bem-vindo de volta, player!" });
      navigate("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#B400FF]/5 via-transparent to-[#00E5FF]/5" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <Gamepad2 className="w-10 h-10 text-[#B400FF]" style={{ filter: "drop-shadow(0 0 10px #B400FF)" }} />
            </div>
            <h1 className="text-4xl font-black tracking-wider"
              style={{ background: "linear-gradient(135deg, #B400FF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              GameVault
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Seu catálogo pessoal de jogos</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(26, 26, 26, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid transparent",
            backgroundClip: "padding-box",
            boxShadow: "0 0 0 1px rgba(180, 0, 255, 0.4), 0 0 0 2px rgba(0, 229, 255, 0.1), 0 25px 50px rgba(0,0,0,0.5)",
          }}>
          {/* Demo mode hint */}
          <div className="mb-5 p-3 rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/5">
            <p className="text-xs text-[#FFD700] font-medium">🎮 Modo Demo Ativo</p>
            <p className="text-xs text-gray-400 mt-0.5">Use qualquer email e senha para entrar</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Entrar</h2>
            <p className="text-gray-400 text-sm">Continue sua jornada</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-[#FF0033] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[#FF0033] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              variant="neon"
              className="w-full h-11 text-base font-bold tracking-wider"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  ENTRAR
                </span>
              )}
            </Button>
          </form>

          {/* Social icons */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-xs">ou entre com</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="flex justify-center gap-4">
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 hover:border-[#1b2838] hover:shadow-[0_0_10px_rgba(27,40,56,0.5)] transition-all" title="Steam">
                <span className="text-lg">🎮</span>
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 hover:border-[#5865F2] hover:shadow-[0_0_10px_rgba(88,101,242,0.5)] transition-all" title="Discord">
                <span className="text-lg">💬</span>
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 hover:border-[#EA4335] hover:shadow-[0_0_10px_rgba(234,67,53,0.5)] transition-all" title="Google">
                <span className="text-lg">🔍</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Não tem conta?{" "}
            <Link to="/register" className="text-[#B400FF] hover:text-[#B400FF]/80 font-semibold transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
