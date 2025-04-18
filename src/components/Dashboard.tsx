
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
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "./LoginDialog";
import { toast } from "sonner";

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
  const { isDeveloper, isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchShifts = async () => {
      try {
        const { data, error } = await supabase
          .from('turnos_administradores')
          .select('*')
          .order('inicio_turno', { ascending: false });

        if (error) {
          console.error('Error fetching shifts:', error);
          toast.error('Erro ao buscar turnos');
          return;
        }

        setShifts(data || []);
      } catch (err) {
        console.error('Exception fetching shifts:', err);
        toast.error('Erro ao buscar turnos');
      }
    };

    fetchShifts();

    const channel = supabase
      .channel('shifts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'turnos_administradores'
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchShifts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!isDeveloper) {
      toast.error('Você não tem permissão para excluir turnos.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('turnos_administradores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shift:', error);
        toast.error('Erro ao excluir o turno: ' + error.message);
        return;
      }
      
      toast.success('Turno excluído com sucesso!');
    } catch (error) {
      console.error('Exception deleting shift:', error);
      toast.error('Erro ao excluir o turno.');
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
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-yellow-500">Dashboard de Turnos</h2>
            <LoginDialog />
          </div>
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
            {filteredShifts.length} turnos registrados
          </Badge>
        </div>

        {isAuthenticated ? (
          <>
            <div className="w-full max-w-sm">
              <Input
                placeholder="Pesquisar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div className="rounded-lg border border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-yellow-500">Nome</TableHead>
                    <TableHead className="text-yellow-500">Cargo</TableHead>
                    <TableHead className="text-yellow-500">Início</TableHead>
                    <TableHead className="text-yellow-500">Status</TableHead>
                    <TableHead className="text-yellow-500 text-right">Duração</TableHead>
                    {isDeveloper && <TableHead className="text-yellow-500">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id} className="border-gray-700">
                      <TableCell className="font-medium text-white">{shift.nome_personagem}</TableCell>
                      <TableCell className="text-white">{shift.cargo}</TableCell>
                      <TableCell className="text-white">{formatDateTime(shift.inicio_turno)}</TableCell>
                      <TableCell>{getStatusBadge(shift.status_turno)}</TableCell>
                      <TableCell className="text-right text-white">
                        {calculateDuration(shift.inicio_turno, shift.fim_turno)}
                      </TableCell>
                      {isDeveloper && (
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(shift.id)}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-gray-400">Faça login para visualizar os turnos</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Dashboard;
