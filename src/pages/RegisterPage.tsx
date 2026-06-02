import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gamepad2, Mail, Lock, Eye, EyeOff, User, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const registerSchema = z.object({
  nickname: z.string().min(2, "Nickname deve ter pelo menos 2 caracteres").max(20, "Nickname deve ter no máximo 20 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): { level: 0 | 1 | 2 | 3; label: string; color: string; glow: string } {
  if (!password) return { level: 0, label: "", color: "", glow: "" };
  if (password.length < 6) return { level: 1, label: "Fraca", color: "#FF0033", glow: "0 0 10px #FF0033" };
  
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [password.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (score <= 1) return { level: 1, label: "Fraca", color: "#FF0033", glow: "0 0 10px #FF0033" };
  if (score <= 2) return { level: 2, label: "Média", color: "#B400FF", glow: "0 0 10px #B400FF" };
  return { level: 3, label: "🏆 Senha Lendária!", color: "#CCFF00", glow: "0 0 15px #CCFF00" };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const watchPassword = watch("password", "");

  useEffect(() => {
    setPasswordValue(watchPassword || "");
  }, [watchPassword]);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Circuit animation (same as login)
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

    const nodes = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });
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
      nodes.forEach((node) => {
        const pulse = (Math.sin(node.pulse) + 1) / 2;
        const radius = 2 + pulse * 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${0.4 + pulse * 0.6})`;
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

  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.nickname);
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao criar conta",
        description: error.message,
      });
    } else {
      toast({
        variant: "success",
        title: "🎮 Missão iniciada!",
        description: "Conta criada com sucesso! Verifique seu email para confirmar.",
      });
      navigate("/login");
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden py-8">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#B400FF]/5 via-transparent to-[#00E5FF]/5" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="w-10 h-10 text-[#B400FF]" style={{ filter: "drop-shadow(0 0 10px #B400FF)" }} />
            <h1 className="text-4xl font-black tracking-wider"
              style={{ background: "linear-gradient(135deg, #B400FF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              GameVault
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Crie sua conta e inicie sua missão</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(26, 26, 26, 0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 0 1px rgba(180, 0, 255, 0.4), 0 0 0 2px rgba(0, 229, 255, 0.1), 0 25px 50px rgba(0,0,0,0.5)",
          }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Criar Conta</h2>
            <p className="text-gray-400 text-sm">Inicie sua jornada gamer</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="nickname"
                  type="text"
                  placeholder="SeuNickname"
                  className="pl-10"
                  {...register("nickname")}
                />
              </div>
              {errors.nickname && <p className="text-[#FF0033] text-xs mt-1">{errors.nickname.message}</p>}
            </div>

            {/* Email */}
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

            {/* Password */}
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

              {/* Password strength meter */}
              {passwordValue && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          background: passwordStrength.level >= i ? passwordStrength.color : "rgba(255,255,255,0.1)",
                          boxShadow: passwordStrength.level >= i ? passwordStrength.glow : "none",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordStrength.level === 3 && <Trophy className="w-3 h-3" style={{ color: passwordStrength.color }} />}
                    <p className="text-xs font-semibold transition-all duration-300"
                      style={{ color: passwordStrength.color, textShadow: passwordStrength.glow }}>
                      {passwordStrength.label}
                    </p>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-[#FF0033] text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-[#FF0033] text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full h-11 text-base font-black tracking-wider"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  CRIAR CONTA / INICIAR MISSÃO
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Já tem conta?{" "}
            <Link to="/login" className="text-[#B400FF] hover:text-[#B400FF]/80 font-semibold transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
