
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
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

type Shift = {
  id: string;
  nome_personagem: string;
  cargo: string;
  inicio_turno: string;
  fim_turno: string | null;
  status_turno: string;
  pausas: Json; // Changed from any[] to Json to match the Supabase types
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

    // Subscribe to realtime changes
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-yellow-500">Dashboard de Turnos</h2>
      <div className="rounded-lg border border-gray-700 bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-yellow-500">Nome</TableHead>
              <TableHead className="text-yellow-500">Cargo</TableHead>
              <TableHead className="text-yellow-500">Início</TableHead>
              <TableHead className="text-yellow-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id} className="border-gray-700">
                <TableCell>{shift.nome_personagem}</TableCell>
                <TableCell>{shift.cargo}</TableCell>
                <TableCell>{formatDateTime(shift.inicio_turno)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    shift.status_turno === 'ativo' ? 'bg-green-500/20 text-green-500' :
                    shift.status_turno === 'pausado' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {shift.status_turno.charAt(0).toUpperCase() + shift.status_turno.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
