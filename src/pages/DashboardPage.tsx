import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, LogOut, Gamepad2, SlidersHorizontal, X, Trophy, Sword,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import GameCard from "@/components/GameCard";
import GameForm from "@/components/GameForm";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { Jogo, Plataforma, Genero } from "@/types";
import { PLATAFORMAS, GENEROS, STATUS_JOGO, PLATAFORMA_ICONS, STATUS_COLORS } from "@/types";
import { MOCK_JOGOS } from "@/lib/mock-data";

type DialogMode = "add" | "edit" | "delete" | null;

const DEMO_JOGOS_KEY = "gamevault_demo_jogos";

function getDemoJogos(): Jogo[] {
  try {
    const saved = localStorage.getItem(DEMO_JOGOS_KEY);
    if (saved) return JSON.parse(saved) as Jogo[];
    // Do not prefill with MOCK_JOGOS by default; start empty for new users
    return [];
  } catch {
    return [];
  }
}

function saveDemoJogos(jogos: Jogo[]) {
  localStorage.setItem(DEMO_JOGOS_KEY, JSON.stringify(jogos));
}

export default function DashboardPage() {
  const { user, profile, signOut, isDemo } = useAuth();
  const navigate = useNavigate();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Plataforma[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genero[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedJogo, setSelectedJogo] = useState<Jogo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nome: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchJogos = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (isDemo) {
      const demoJogos = getDemoJogos();
      setJogos(demoJogos);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("jogos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJogos(data as Jogo[]);
    }
    setLoading(false);
  }, [user, isDemo]);

  useEffect(() => {
    fetchJogos();
  }, [fetchJogos]);

  const handleAddJogo = async (data: { nome: string; plataforma: string; genero: string; nota: number; status: string; capa_url?: string }) => {
    if (!user) return;
    setFormLoading(true);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 400));
      const newJogo: Jogo = {
        id: Date.now().toString(),
        user_id: user.id,
        nome: data.nome,
        plataforma: data.plataforma as Jogo["plataforma"],
        genero: data.genero as Jogo["genero"],
        nota: data.nota,
        status: data.status as Jogo["status"],
        capa_url: data.capa_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newJogo, ...jogos];
      saveDemoJogos(updated);
      setJogos(updated);
      setFormLoading(false);
      toast({ variant: "success", title: "🎮 Jogo adicionado!", description: `"${data.nome}" foi adicionado ao catálogo.` });
      setDialogMode(null);
      return;
    }

    const { error } = await supabase.from("jogos").insert({
      nome: data.nome,
      plataforma: data.plataforma,
      genero: data.genero,
      nota: data.nota,
      status: data.status,
      user_id: user.id,
      capa_url: data.capa_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setFormLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "❌ Erro", description: "Não foi possível adicionar o jogo." });
    } else {
      toast({ variant: "success", title: "🎮 Jogo adicionado!", description: `"${data.nome}" foi adicionado ao catálogo.` });
      setDialogMode(null);
      fetchJogos();
    }
  };

  const handleEditJogo = async (data: { nome: string; plataforma: string; genero: string; nota: number; status: string; capa_url?: string }) => {
    if (!selectedJogo) return;
    setFormLoading(true);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 400));
      const updated = jogos.map((j) =>
        j.id === selectedJogo.id
          ? { ...j, ...data, plataforma: data.plataforma as Jogo["plataforma"], genero: data.genero as Jogo["genero"], status: data.status as Jogo["status"], capa_url: data.capa_url || null, updated_at: new Date().toISOString() }
          : j
      );
      saveDemoJogos(updated);
      setJogos(updated);
      setFormLoading(false);
      toast({ variant: "success", title: "✅ Jogo atualizado!", description: `"${data.nome}" foi atualizado.` });
      setDialogMode(null);
      setSelectedJogo(null);
      return;
    }

    const { error } = await supabase
      .from("jogos")
      .update({
        nome: data.nome,
        plataforma: data.plataforma,
        genero: data.genero,
        nota: data.nota,
        status: data.status,
        capa_url: data.capa_url || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedJogo.id);
    setFormLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "❌ Erro", description: "Não foi possível atualizar o jogo." });
    } else {
      toast({ variant: "success", title: "✅ Jogo atualizado!", description: `"${data.nome}" foi atualizado.` });
      setDialogMode(null);
      setSelectedJogo(null);
      fetchJogos();
    }
  };

  const handleDeleteJogo = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 300));
      const updated = jogos.filter((j) => j.id !== deleteTarget.id);
      saveDemoJogos(updated);
      setJogos(updated);
      setFormLoading(false);
      toast({ variant: "success", title: "🗑️ Jogo removido", description: `"${deleteTarget.nome}" foi removido.` });
      setDialogMode(null);
      setDeleteTarget(null);
      return;
    }

    const { error } = await supabase.from("jogos").delete().eq("id", deleteTarget.id);
    setFormLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "❌ Erro", description: "Não foi possível deletar o jogo." });
    } else {
      toast({ variant: "success", title: "🗑️ Jogo removido", description: `"${deleteTarget.nome}" foi removido.` });
      setDialogMode(null);
      setDeleteTarget(null);
      fetchJogos();
    }
  };

  const openEdit = (jogo: Jogo) => {
    setSelectedJogo(jogo);
    setDialogMode("edit");
  };

  const openDelete = (id: string) => {
    const jogo = jogos.find((j) => j.id === id);
    if (jogo) {
      setDeleteTarget({ id, nome: jogo.nome });
      setDialogMode("delete");
    }
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedJogo(null);
    setDeleteTarget(null);
  };

  const togglePlatform = (p: Plataforma) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleGenre = (g: Genero) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleStatus = (s: string) => {
    setSelectedStatus((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const clearFilters = () => {
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setSelectedStatus([]);
    setSearchQuery("");
  };

  const filteredJogos = jogos.filter((j) => {
    const matchSearch = j.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(j.plataforma);
    const matchGenre = selectedGenres.length === 0 || selectedGenres.includes(j.genero);
    const matchStatus = selectedStatus.length === 0 || selectedStatus.includes(j.status);
    return matchSearch && matchPlatform && matchGenre && matchStatus;
  });

  const activeFiltersCount = selectedPlatforms.length + selectedGenres.length + selectedStatus.length;

  const stats = {
    total: jogos.length,
    concluidos: jogos.filter((j) => j.status === "Concluído").length,
    jogando: jogos.filter((j) => j.status === "Jogando").length,
    avgNota: jogos.length > 0 ? (jogos.reduce((acc, j) => acc + j.nota, 0) / jogos.length).toFixed(1) : "—",
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Gamepad2 className="w-7 h-7" style={{ color: "#B400FF", filter: "drop-shadow(0 0 8px #B400FF)" }} />
            <span className="text-xl font-black tracking-wider hidden sm:block"
              style={{ background: "linear-gradient(135deg, #B400FF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              GameVault
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar jogos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0D0D0D] border-white/10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => navigate('/catalog')}
              variant="ghost"
              className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white"
            >
              Catálogo
            </Button>
            <Button
              size="sm"
              onClick={() => setDialogMode("add")}
              className="hidden sm:flex items-center gap-2 bg-[#B400FF] hover:bg-[#9900DD] text-white"
              style={{ boxShadow: "0 0 12px rgba(180, 0, 255, 0.4)" }}
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
            <Button
              size="icon"
              onClick={() => setDialogMode("add")}
              className="sm:hidden bg-[#B400FF] hover:bg-[#9900DD] text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>

            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
                style={{ background: "linear-gradient(135deg, #B400FF, #00E5FF)", boxShadow: "0 0 10px rgba(180, 0, 255, 0.5)" }}>
                {profile?.nickname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-white font-medium leading-tight">
                  {profile?.nickname || user?.email?.split("@")[0]}
                </p>
                {isDemo && <p className="text-xs text-[#B400FF]">Modo Demo</p>}
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />
            </Button>
          </div>
        </div>

        {/* Demo banner */}
        {isDemo && (
          <div className="border-t border-[#FFD700]/20 bg-[#FFD700]/5 py-1.5 px-4 text-center">
            <p className="text-xs text-[#FFD700]">
              🎮 <strong>Modo Demo</strong> — Dados salvos localmente. Configure o Supabase para persistência em nuvem.
            </p>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total de Jogos", value: stats.total, icon: "🎮", color: "#B400FF" },
            { label: "Jogando", value: stats.jogando, icon: "▶️", color: "#00E5FF" },
            { label: "Concluídos", value: stats.concluidos, icon: "🏆", color: "#CCFF00" },
            { label: "Nota Média", value: stats.avgNota, icon: "⭐", color: "#FFD700" },
          ].map((stat) => (
            <div key={stat.label}
              className="rounded-xl p-4 border border-white/5 bg-[#0D0D0D] relative overflow-hidden"
              style={{ boxShadow: `inset 0 0 30px ${stat.color}05` }}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-5"
                style={{ background: stat.color }} />
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                <span className="text-base">{stat.icon}</span>
              </div>
              <div className="text-3xl font-black tabular-nums" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}60` }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-400 hover:text-white flex-shrink-0"
              style={showFilters ? { color: "#B400FF" } : {}}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ background: "#B400FF" }}>
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Platform quick filters */}
            <div className="flex gap-1.5 overflow-x-auto flex-1 scrollbar-hide">
              {PLATAFORMAS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1"
                  style={
                    selectedPlatforms.includes(p)
                      ? { background: "#B400FF", color: "white", boxShadow: "0 0 10px rgba(180, 0, 255, 0.5)" }
                      : { background: "#1A1A1A", color: "#888", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  <span>{PLATAFORMA_ICONS[p]}</span>
                  <span className="hidden sm:inline">{p}</span>
                </button>
              ))}
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-[#FF0033] flex-shrink-0 transition-colors">
                <X className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="rounded-xl p-4 bg-[#0D0D0D] border border-white/5 space-y-4 mb-4"
              style={{ animation: "fadeIn 0.2s ease" }}>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Gênero</p>
                <div className="flex flex-wrap gap-1.5">
                  {GENEROS.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                      style={
                        selectedGenres.includes(g)
                          ? { background: "#00E5FF", color: "black", boxShadow: "0 0 10px rgba(0, 229, 255, 0.5)" }
                          : { background: "#1A1A1A", color: "#888", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_JOGO.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
                      style={
                        selectedStatus.includes(s)
                          ? { background: STATUS_COLORS[s], color: "black", boxShadow: `0 0 10px ${STATUS_COLORS[s]}` }
                          : { background: "#1A1A1A", color: "#888", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {s === "Jogando" ? "🎮 " : s === "Concluído" ? "✅ " : s === "Abandonado" ? "❌ " : "🔥 "}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {filteredJogos.length === jogos.length
              ? `${jogos.length} jogo${jogos.length !== 1 ? "s" : ""} no catálogo`
              : `${filteredJogos.length} de ${jogos.length} jogos`}
          </p>
          {searchQuery && (
            <p className="text-xs text-[#00E5FF]">Buscando: "{searchQuery}"</p>
          )}
        </div>

        {/* Game Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-t-2 border-[#B400FF] rounded-full animate-spin"
              style={{ borderWidth: "2px", filter: "drop-shadow(0 0 8px #B400FF)" }} />
            <p className="text-gray-500 animate-pulse text-sm">Carregando catálogo...</p>
          </div>
        ) : filteredJogos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            {jogos.length === 0 ? (
              <>
                <div className="text-6xl mb-2 animate-bounce">🎮</div>
                <h3 className="text-xl font-bold text-white">Catálogo vazio!</h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  Adicione seu primeiro jogo e comece a construir seu catálogo épico.
                </p>
                <Button
                  onClick={() => setDialogMode("add")}
                  className="mt-2 bg-[#B400FF] hover:bg-[#9900DD] text-white"
                  style={{ boxShadow: "0 0 20px rgba(180, 0, 255, 0.5)" }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Jogo
                </Button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-2">🔍</div>
                <h3 className="text-xl font-bold text-white">Nenhum resultado</h3>
                <p className="text-gray-500 max-w-xs text-sm">
                  Nenhum jogo corresponde aos filtros aplicados.
                </p>
                <Button variant="ghost" onClick={clearFilters} className="mt-2 text-[#00E5FF]">
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredJogos.map((jogo) => (
              <GameCard
                key={jogo.id}
                jogo={jogo}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating stats footer */}
      {jogos.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full"
            style={{
              background: "rgba(13, 13, 13, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(180, 0, 255, 0.3)",
              boxShadow: "0 0 30px rgba(180, 0, 255, 0.15), 0 4px 20px rgba(0,0,0,0.5)",
            }}>
            <Trophy className="w-4 h-4 flex-shrink-0" style={{ color: "#FFD700" }} />
            <span className="text-xs text-gray-400 whitespace-nowrap">
              <span className="text-white font-bold">{stats.concluidos}</span>{" "}
              <span className="hidden sm:inline">concluídos •</span>
              <span className="sm:hidden">✓ •</span>{" "}
              <span className="text-white font-bold">{stats.jogando}</span>{" "}
              <span className="hidden sm:inline">em progresso •</span>
              <span className="sm:hidden">▶ •</span>{" "}
              <span style={{ color: "#FFD700" }} className="font-bold">⭐ {stats.avgNota}</span>
            </span>
            <Sword className="w-4 h-4 flex-shrink-0" style={{ color: "#B400FF" }} />
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={dialogMode === "add"} onOpenChange={(o) => !o && closeDialog()}>
        <GameForm
          onSave={handleAddJogo}
          onClose={closeDialog}
          loading={formLoading}
        />
      </Dialog>

      <Dialog open={dialogMode === "edit"} onOpenChange={(o) => !o && closeDialog()}>
        <GameForm
          jogo={selectedJogo}
          onSave={handleEditJogo}
          onClose={closeDialog}
          loading={formLoading}
        />
      </Dialog>

      <Dialog open={dialogMode === "delete"} onOpenChange={(o) => !o && closeDialog()}>
        {deleteTarget && (
          <DeleteConfirmDialog
            gameName={deleteTarget.nome}
            onConfirm={handleDeleteJogo}
            onCancel={closeDialog}
            loading={formLoading}
          />
        )}
      </Dialog>
    </div>
  );
}
