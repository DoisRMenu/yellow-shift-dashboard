
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

const ShiftForm = () => {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cargo) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('turnos_administradores')
        .insert({
          nome_personagem: nome,
          cargo: cargo,
          inicio_turno: new Date().toISOString(),
          status_turno: 'ativo'
        });

      if (error) throw error;
      toast.success("Turno iniciado com sucesso!");
    } catch (error) {
      toast.error("Erro ao iniciar o turno");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleStartShift} className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-4">
        <Input
          placeholder="Nome do Personagem"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="bg-gray-800 border-gray-700"
        />
        
        <Select value={cargo} onValueChange={setCargo}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
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
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
        >
          {loading ? "Iniciando..." : "Iniciar Turno"}
        </Button>
      </div>
    </form>
  );
};

export default ShiftForm;
