
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Json } from '@/integrations/supabase/types';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Shift = {
  id: string;
  nome_personagem: string;
  cargo: string;
  inicio_turno: string;
  fim_turno: string | null;
  status_turno: string;
  pausas: Json;
  timestamp_criacao?: string;
};

const Dashboard = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Função para buscar turnos do Supabase
  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('turnos_administradores')
        .select('*')
        .order('inicio_turno', { ascending: false });

      if (error) {
        console.error('Error fetching shifts:', error);
        return;
      }

      console.log('Turnos buscados:', data?.length);
      setShifts(data || []);
    } catch (err) {
      console.error('Erro ao buscar turnos:', err);
    }
  };

  useEffect(() => {
    // Busca inicial dos turnos
    fetchShifts();

    // Configurar subscription para atualizações em tempo real
    const channel = supabase
      .channel('shifts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'turnos_administradores'
        },
        (payload) => {
          console.log('Evento real-time recebido:', payload.eventType, payload);
          
          // Atualizar a lista de turnos com base no tipo de evento
          if (payload.eventType === 'DELETE') {
            // Remove o turno excluído da lista
            const deletedId = payload.old?.id;
            if (deletedId) {
              setShifts(currentShifts => 
                currentShifts.filter(shift => shift.id !== deletedId)
              );
            }
          } else {
            // Para INSERT ou UPDATE, buscar todos os turnos novamente
            fetchShifts();
          }
        }
      )
      .subscribe();

    // Limpar subscription quando componente desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteShift = async (shiftId: string) => {
    try {
      // Executar a exclusão no Supabase
      const { error } = await supabase
        .from('turnos_administradores')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      // Atualizar o estado local imediatamente após a exclusão bem-sucedida
      setShifts(currentShifts => currentShifts.filter(shift => shift.id !== shiftId));
      
      toast({
        title: "Turno excluído",
        description: "O turno foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir turno",
        description: "Não foi possível excluir o turno. Tente novamente.",
      });
      console.error('Error deleting shift:', error);
    }
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : currentTime;
    
    const diffInMilliseconds = end.getTime() - start.getTime();
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Ativo</Badge>;
      case 'pausado':
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Pausado</Badge>;
      case 'encerrado':
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Encerrado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredShifts = shifts.filter(shift =>
    shift.nome_personagem.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-4 md:p-6 bg-gray-800/50 border-gray-700">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-yellow-500">Dashboard de Turnos</h2>
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 self-start md:self-auto">
            {filteredShifts.length} turnos registrados
          </Badge>
        </div>

        <div className="w-full md:max-w-sm">
          <Input
            placeholder="Pesquisar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-transparent">
                <TableHead className="text-yellow-500">Nome</TableHead>
                <TableHead className="text-yellow-500 hidden md:table-cell">Cargo</TableHead>
                <TableHead className="text-yellow-500">Início</TableHead>
                <TableHead className="text-yellow-500">Status</TableHead>
                <TableHead className="text-yellow-500 text-right hidden md:table-cell">Duração</TableHead>
                <TableHead className="text-yellow-500 w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map((shift) => (
                <TableRow key={shift.id} className="border-gray-700">
                  <TableCell className="font-medium text-white">{shift.nome_personagem}</TableCell>
                  <TableCell className="text-white hidden md:table-cell">{shift.cargo}</TableCell>
                  <TableCell className="text-white">{formatDateTime(shift.inicio_turno)}</TableCell>
                  <TableCell>{getStatusBadge(shift.status_turno)}</TableCell>
                  <TableCell className="text-right text-white hidden md:table-cell">
                    {calculateDuration(shift.inicio_turno, shift.fim_turno)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteShift(shift.id)}
                      className="hover:bg-red-500/20 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir turno</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
