import { useState } from "react";
import { Edit2, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Jogo } from "@/types";
import { PLATAFORMA_ICONS, STATUS_COLORS, GENERO_ICONS } from "@/types";

interface GameCardProps {
  jogo: Jogo;
  onEdit: (jogo: Jogo) => void;
  onDelete: (id: string) => void;
}

export default function GameCard({ jogo, onEdit, onDelete }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getNoteColor = (nota: number) => {
    if (nota >= 8) return "#CCFF00";
    if (nota >= 6) return "#FFD700";
    if (nota >= 4) return "#B400FF";
    return "#FF0033";
  };

  const noteColor = getNoteColor(jogo.nota);
  const statusColor = STATUS_COLORS[jogo.status];

  const renderStars = (nota: number) => {
    const stars = Math.round(nota / 2);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className="w-3 h-3"
        fill={i < stars ? "#FFD700" : "transparent"}
        stroke={i < stars ? "#FFD700" : "#444"}
        style={{ filter: i < stars ? "drop-shadow(0 0 3px #FFD700)" : "none" }}
      />
    ));
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group"
      style={{
        background: "#000",
        border: `1px solid ${hovered ? "#00E5FF" : "rgba(255,255,255,0.08)"}`,
        boxShadow: hovered ? "0 0 20px rgba(0, 229, 255, 0.2), 0 8px 30px rgba(0,0,0,0.5)" : "0 4px 15px rgba(0,0,0,0.4)",
        transform: hovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#0D0D0D]">
        {jogo.capa_url && !imgError ? (
          <img
            src={jogo.capa_url}
            alt={jogo.nome}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0D0D0D, #1A1A1A)" }}>
            <div className="text-center">
              <div className="text-5xl mb-2">{GENERO_ICONS[jogo.genero]}</div>
              <div className="text-xs text-gray-600 px-2 text-center">{jogo.nome}</div>
            </div>
          </div>
        )}

        {/* Status badge */}
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-black"
          style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
        >
          {jogo.status === "Jogando" && "🎮"}
          {jogo.status === "Concluído" && "✅"}
          {jogo.status === "Abandonado" && "❌"}
          {jogo.status === "Quero Jogar" && "🔥"}
          <span className="ml-1 hidden sm:inline">{jogo.status}</span>
        </div>

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.7)", opacity: hovered ? 1 : 0 }}
        >
          <Button
            variant="electric"
            size="icon"
            className="h-9 w-9"
            onClick={(e) => { e.stopPropagation(); onEdit(jogo); }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="neon"
            size="icon"
            className="h-9 w-9"
            onClick={(e) => { e.stopPropagation(); onDelete(jogo.id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 bg-[#0D0D0D]">
        <h3 className="font-bold text-white text-sm truncate mb-1" title={jogo.nome}>
          {jogo.nome}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{PLATAFORMA_ICONS[jogo.plataforma]}</span>
            <span>{jogo.plataforma}</span>
          </div>
          <span className="text-xs text-gray-500">{GENERO_ICONS[jogo.genero]} {jogo.genero}</span>
        </div>

        {/* Stars + Note */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {renderStars(jogo.nota)}
          </div>
          <span
            className="text-sm font-black tabular-nums"
            style={{ color: noteColor, textShadow: `0 0 8px ${noteColor}` }}
          >
            {jogo.nota.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
