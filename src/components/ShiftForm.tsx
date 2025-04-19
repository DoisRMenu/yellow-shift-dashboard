
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Pause, Play, StopCircle } from "lucide-react";

const ShiftForm = () => {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeShift, setActiveShift] = useState<any>(null);

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cargo) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('turnos_administradores')
        .insert({
          nome_personagem: nome,
          cargo: cargo,
          inicio_turno: new Date().toISOString(),
          status_turno: 'ativo',
          pausas: []
        })
        .select()
        .single();

      if (error) throw error;
      setActiveShift(data);
      toast.success("Turno iniciado com sucesso!");
    } catch (error) {
      toast.error("Erro ao iniciar o turno");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseShift = async () => {
    if (!activeShift) return;

    setLoading(true);
    try {
      const pausas = [...(activeShift.pausas || [])];
      const isPaused = activeShift.status_turno === 'pausado';
      
      if (isPaused) {
        pausas[pausas.length - 1].fim = new Date().toISOString();
      } else {
        pausas.push({
          inicio: new Date().toISOString(),
          fim: null
        });
      }

      const { data, error } = await supabase
        .from('turnos_administradores')
        .update({
          status_turno: isPaused ? 'ativo' : 'pausado',
          pausas: pausas
        })
        .eq('id', activeShift.id)
        .select()
        .single();

      if (error) throw error;
      setActiveShift(data);
      toast.success(isPaused ? "Turno retomado!" : "Turno pausado!");
    } catch (error) {
      toast.error("Erro ao atualizar o turno");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('turnos_administradores')
        .update({
          status_turno: 'encerrado',
          fim_turno: new Date().toISOString()
        })
        .eq('id', activeShift.id);

      if (error) throw error;
      setActiveShift(null);
      setNome('');
      setCargo('');
      toast.success("Turno encerrado com sucesso!");
    } catch (error) {
      toast.error("Erro ao encerrar o turno");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (activeShift) {
    return (
      <Card className="p-4 md:p-6 bg-gray-800/50 border-gray-700">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">{activeShift.nome_personagem}</h3>
              <p className="text-sm text-gray-400">{activeShift.cargo}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseShift}
                disabled={loading}
                className="gap-2 h-10 min-w-[120px] justify-center"
              >
                {activeShift.status_turno === 'pausado' ? (
                  <>
                    <Play className="h-4 w-4" />
                    Retomar
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndShift}
                disabled={loading}
                className="gap-2 h-10 min-w-[120px] justify-center"
              >
                <StopCircle className="h-4 w-4" />
                Encerrar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleStartShift} className="space-y-6 w-full max-w-md mx-auto">
      <Card className="p-4 md:p-6 bg-gray-800/50 border-gray-700">
        <div className="space-y-4">
          <Input
            placeholder="Nome do Personagem"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-gray-800 border-gray-700 h-12"
          />
          
          <Select value={cargo} onValueChange={setCargo}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 h-12">
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="Administrador Assistente">Administrador Assistente</SelectItem>
              <SelectItem value="Administrador Nível 2">Administrador Nível 2</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 text-base bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
          >
            {loading ? "Iniciando..." : "Iniciar Turno"}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default ShiftForm;
