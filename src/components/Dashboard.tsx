
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

  useEffect(() => {
    const fetchShifts = async () => {
      const { data, error } = await supabase
        .from('turnos_administradores')
        .select('*')
        .order('inicio_turno', { ascending: false });

      if (error) {
        console.error('Error fetching shifts:', error);
        return;
      }

      setShifts(data || []);
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
  }, []);

  const formatDateTime = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
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

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-yellow-500">Dashboard de Turnos</h2>
        <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
          {shifts.length} turnos registrados
        </Badge>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id} className="border-gray-700">
                <TableCell className="font-medium">{shift.nome_personagem}</TableCell>
                <TableCell>{shift.cargo}</TableCell>
                <TableCell>{formatDateTime(shift.inicio_turno)}</TableCell>
                <TableCell>{getStatusBadge(shift.status_turno)}</TableCell>
                <TableCell className="text-right">
                  {shift.fim_turno 
                    ? format(
                        new Date(new Date(shift.fim_turno).getTime() - new Date(shift.inicio_turno).getTime()),
                        "HH:mm:ss"
                      )
                    : "Em andamento"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default Dashboard;
