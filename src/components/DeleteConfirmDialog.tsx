import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  gameName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmDialog({ gameName, onConfirm, onCancel, loading }: DeleteConfirmDialogProps) {
  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full" style={{ background: "rgba(255, 0, 51, 0.15)" }}>
            <AlertTriangle className="w-6 h-6" style={{ color: "#FF0033" }} />
          </div>
          <DialogTitle className="text-white">Deletar Jogo</DialogTitle>
        </div>
        <DialogDescription>
          Tem certeza que deseja remover{" "}
          <span className="text-white font-semibold">"{gameName}"</span> do seu catálogo?
          <br />
          <span className="text-[#FF0033] text-xs mt-1 block">Esta ação não pode ser desfeita.</span>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}
          style={{ boxShadow: "0 0 15px rgba(255, 0, 51, 0.4)" }}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Deletando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Deletar
            </span>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
