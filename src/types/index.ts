export type Plataforma = "PC" | "PS5" | "Xbox" | "Nintendo Switch" | "Mobile";
export type Genero = "RPG" | "Ação" | "Aventura" | "Estratégia" | "Esporte" | "Corrida" | "Terror" | "Indie";
export type StatusJogo = "Jogando" | "Concluído" | "Abandonado" | "Quero Jogar";

export interface Jogo {
  id: string;
  user_id: string;
  nome: string;
  plataforma: Plataforma;
  genero: Genero;
  nota: number;
  status: StatusJogo;
  capa_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const PLATAFORMAS: Plataforma[] = ["PC", "PS5", "Xbox", "Nintendo Switch", "Mobile"];
export const GENEROS: Genero[] = ["RPG", "Ação", "Aventura", "Estratégia", "Esporte", "Corrida", "Terror", "Indie"];
export const STATUS_JOGO: StatusJogo[] = ["Jogando", "Concluído", "Abandonado", "Quero Jogar"];

export const PLATAFORMA_ICONS: Record<Plataforma, string> = {
  "PC": "🖥️",
  "PS5": "🎮",
  "Xbox": "🟢",
  "Nintendo Switch": "🔴",
  "Mobile": "📱",
};

export const STATUS_COLORS: Record<StatusJogo, string> = {
  "Jogando": "#00E5FF",
  "Concluído": "#CCFF00",
  "Abandonado": "#FF0033",
  "Quero Jogar": "#B400FF",
};

export const GENERO_ICONS: Record<Genero, string> = {
  "RPG": "⚔️",
  "Ação": "💥",
  "Aventura": "🗺️",
  "Estratégia": "♟️",
  "Esporte": "⚽",
  "Corrida": "🏎️",
  "Terror": "👻",
  "Indie": "🎨",
};
