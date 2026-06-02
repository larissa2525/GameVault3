import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MOCK_JOGOS } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Jogo } from "@/types";

const DEMO_JOGOS_KEY = "gamevault_demo_jogos";

function getDemoJogos(): Jogo[] {
  try {
    const saved = localStorage.getItem(DEMO_JOGOS_KEY);
    if (saved) return JSON.parse(saved) as Jogo[];
    return [];
  } catch {
    return [];
  }
}

function saveDemoJogos(jogos: Jogo[]) {
  localStorage.setItem(DEMO_JOGOS_KEY, JSON.stringify(jogos));
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleAdd = async (item: Jogo) => {
    if (!user) return;
    // prevent double clicks
    if (loadingIds.includes(item.id)) return;
    setLoadingIds((s) => [...s, item.id]);

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 300));
      const existing = getDemoJogos();
      // avoid duplicates by nome
      if (existing.some((e) => e.nome === item.nome)) {
        toast({ variant: "destructive", title: "Já existe", description: `"${item.nome}" já está na sua lista.` });
        setLoadingIds((s) => s.filter((id) => id !== item.id));
        return;
      }
      const newJogo: Jogo = {
        ...item,
        id: Date.now().toString(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newJogo, ...existing];
      saveDemoJogos(updated);
      toast({ variant: "success", title: "✅ Adicionado", description: `"${item.nome}" foi adicionado à sua lista.` });
      setLoadingIds((s) => s.filter((id) => id !== item.id));
      return;
    }

    const { error } = await supabase.from("jogos").insert({
      nome: item.nome,
      plataforma: item.plataforma,
      genero: item.genero,
      nota: item.nota,
      status: item.status,
      user_id: user.id,
      capa_url: item.capa_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setLoadingIds((s) => s.filter((id) => id !== item.id));

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar o jogo." });
    } else {
      toast({ variant: "success", title: "✅ Adicionado", description: `"${item.nome}" foi adicionado à sua lista.` });
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-white font-black">Catálogo</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Voltar</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-400 mb-4">Explore jogos do catálogo e adicione-os à sua lista.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {MOCK_JOGOS.map((j) => (
            <div key={j.id} className="rounded-xl overflow-hidden bg-[#0D0D0D] border border-white/5 p-2">
              <div className="aspect-[3/4] overflow-hidden mb-2 bg-[#0D0D0D]">
                {j.capa_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={j.capa_url} alt={j.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D0D0D, #1A1A1A)" }}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎮</div>
                      <div className="text-xs text-gray-600 px-2 text-center">{j.nome}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white truncate">{j.nome}</div>
                <Button size="sm" onClick={() => handleAdd(j)} disabled={loadingIds.includes(j.id)}>Adicionar</Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
