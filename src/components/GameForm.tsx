import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { PLATAFORMAS, GENEROS, STATUS_JOGO, PLATAFORMA_ICONS, GENERO_ICONS } from "@/types";
import type { Jogo } from "@/types";

const jogoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  plataforma: z.enum(["PC", "PS5", "Xbox", "Nintendo Switch", "Mobile"]),
  genero: z.enum(["RPG", "Ação", "Aventura", "Estratégia", "Esporte", "Corrida", "Terror", "Indie"]),
  nota: z.number().min(0, "Nota mínima é 0").max(10, "Nota máxima é 10"),
  status: z.enum(["Jogando", "Concluído", "Abandonado", "Quero Jogar"]),
  capa_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type JogoForm = z.infer<typeof jogoSchema>;

export type JogoFormData = {
  nome: string;
  plataforma: "PC" | "PS5" | "Xbox" | "Nintendo Switch" | "Mobile";
  genero: "RPG" | "Ação" | "Aventura" | "Estratégia" | "Esporte" | "Corrida" | "Terror" | "Indie";
  nota: number;
  status: "Jogando" | "Concluído" | "Abandonado" | "Quero Jogar";
  capa_url?: string;
};

interface GameFormProps {
  jogo?: Jogo | null;
  onSave: (data: JogoFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function GameForm({ jogo, onSave, onClose, loading }: GameFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<JogoForm>({
    resolver: zodResolver(jogoSchema),
    defaultValues: {
      nome: jogo?.nome || "",
      plataforma: jogo?.plataforma || "PC",
      genero: jogo?.genero || "RPG",
      nota: jogo?.nota ?? 5,
      status: jogo?.status || "Quero Jogar",
      capa_url: jogo?.capa_url || "",
    },
  });

  const notaValue = watch("nota");

  useEffect(() => {
    if (jogo) {
      setValue("nome", jogo.nome);
      setValue("plataforma", jogo.plataforma);
      setValue("genero", jogo.genero);
      setValue("nota", jogo.nota);
      setValue("status", jogo.status);
      setValue("capa_url", jogo.capa_url || "");
    }
  }, [jogo, setValue]);

  const getNoteColor = (nota: number) => {
    if (nota >= 8) return "#CCFF00";
    if (nota >= 6) return "#FFD700";
    if (nota >= 4) return "#B400FF";
    return "#FF0033";
  };

  const noteColor = getNoteColor(notaValue);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold" style={{ background: "linear-gradient(135deg, #B400FF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {jogo ? "✏️ Editar Jogo" : "➕ Adicionar Jogo"}
        </DialogTitle>
        <DialogDescription>
          {jogo ? "Atualize as informações do jogo" : "Adicione um novo jogo ao seu catálogo"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Jogo *</Label>
          <Input
            id="nome"
            placeholder="Ex: The Witcher 3"
            {...register("nome")}
          />
          {errors.nome && <p className="text-[#FF0033] text-xs">{errors.nome.message}</p>}
        </div>

        {/* Capa URL */}
        <div className="space-y-2">
          <Label htmlFor="capa_url">URL da Capa (opcional)</Label>
          <Input
            id="capa_url"
            placeholder="https://imagem.com/capa.jpg"
            {...register("capa_url")}
          />
          {errors.capa_url && <p className="text-[#FF0033] text-xs">{errors.capa_url.message}</p>}
        </div>

        {/* Plataforma + Gênero */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Plataforma *</Label>
            <Controller
              name="plataforma"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATAFORMAS.map((p) => (
                      <SelectItem key={p} value={p}>
                        <span className="flex items-center gap-2">
                          <span>{PLATAFORMA_ICONS[p]}</span>
                          <span>{p}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.plataforma && <p className="text-[#FF0033] text-xs">{errors.plataforma.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Gênero *</Label>
            <Controller
              name="genero"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GENEROS.map((g) => (
                      <SelectItem key={g} value={g}>
                        <span className="flex items-center gap-2">
                          <span>{GENERO_ICONS[g]}</span>
                          <span>{g}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.genero && <p className="text-[#FF0033] text-xs">{errors.genero.message}</p>}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status *</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_JOGO.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "Jogando" && "🎮 "}
                      {s === "Concluído" && "✅ "}
                      {s === "Abandonado" && "❌ "}
                      {s === "Quero Jogar" && "🔥 "}
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-[#FF0033] text-xs">{errors.status.message}</p>}
        </div>

        {/* Nota */}
        <div className="space-y-3">
          <Label>Avaliação *</Label>
          <div
            className="rounded-xl p-4 border"
            style={{ borderColor: `${noteColor}60`, background: `${noteColor}08` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Nota:</span>
              <span
                className="text-3xl font-black tabular-nums"
                style={{ color: noteColor, textShadow: `0 0 15px ${noteColor}` }}
              >
                {notaValue.toFixed(1)}
              </span>
            </div>
            <Controller
              name="nota"
              control={control}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={10}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
              )}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          {errors.nota && <p className="text-[#FF0033] text-xs">{errors.nota.message}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="lime"
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
