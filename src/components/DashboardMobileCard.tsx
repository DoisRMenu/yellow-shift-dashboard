
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  pausas: Json;
  timestamp_criacao?: string;
};

interface DashboardMobileCardProps {
  shift: Shift;
  currentTime: Date;
  onDelete: (id: string) => void;
  formatDateTime: (date: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  calculateDuration: (startTime: string, endTime: string | null) => string;
}

const DashboardMobileCard = ({
  shift,
  currentTime,
  onDelete,
  formatDateTime,
  getStatusBadge,
  calculateDuration
}: DashboardMobileCardProps) => {
  return (
    <Card className="p-4 mb-4 bg-gray-700/50 border-gray-600">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-white text-lg">{shift.nome_personagem}</h3>
          <p className="text-sm text-gray-300">{shift.cargo}</p>
        </div>
        <div className="flex items-center">
          {getStatusBadge(shift.status_turno)}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(shift.id)}
            className="ml-2 hover:bg-red-500/20 hover:text-red-500 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir turno</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div className="text-gray-400">Início:</div>
        <div className="text-white">{formatDateTime(shift.inicio_turno)}</div>
        
        <div className="text-gray-400">Duração:</div>
        <div className="text-white">{calculateDuration(shift.inicio_turno, shift.fim_turno)}</div>
      </div>
    </Card>
  );
};

export default DashboardMobileCard;
