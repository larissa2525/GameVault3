import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gamepad2, Mail, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

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

    const nodes = Array.from({ length: 30 }, () => ({
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

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    setErrorMsg("");
    const { error } = await resetPassword(data.email);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#B400FF]/5 via-transparent to-[#00E5FF]/5" />

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
        </div>

        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(26, 26, 26, 0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 0 1px rgba(180, 0, 255, 0.4), 0 0 0 2px rgba(0, 229, 255, 0.1), 0 25px 50px rgba(0,0,0,0.5)",
          }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16" style={{ color: "#CCFF00", filter: "drop-shadow(0 0 15px #CCFF00)" }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Link enviado!</h2>
              <p className="text-sm mb-2" style={{ color: "#CCFF00", textShadow: "0 0 10px #CCFF00" }}>
                ✓ Verifique seu email para redefinir sua senha
              </p>
              <p className="text-gray-400 text-sm mt-4">
                Não recebeu?{" "}
                <button onClick={() => setSent(false)} className="text-[#00E5FF] hover:underline">
                  Tentar novamente
                </button>
              </p>
              <Link to="/login" className="block mt-4 text-sm text-gray-400 hover:text-white transition-colors">
                ← Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Recuperar Senha</h2>
                <p className="text-gray-400 text-sm">Enviaremos um link de recuperação para seu email</p>
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
                  {errorMsg && <p className="text-[#FF0033] text-xs mt-1">{errorMsg}</p>}
                </div>

                <Button
                  type="submit"
                  variant="electric"
                  className="w-full h-11 text-base font-bold tracking-wider"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      ENVIAR LINK DE RECUPERAÇÃO
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Lembrou a senha?{" "}
                <Link to="/login" className="text-[#B400FF] hover:text-[#B400FF]/80 font-semibold transition-colors">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
