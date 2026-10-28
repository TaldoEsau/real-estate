import { BookingRequest } from '../types';
import { StorageService } from './storageService';

export const ExportService = {
  exportBookingsToCsv(bookings: BookingRequest[]): void {
    const agents = StorageService.getAgents();
    const getAgentName = (id: string) => {
      const a = agents.find(agent => agent.id === id);
      return a ? a.name : 'Não atribuído';
    };

    const headers = [
      'ID do Agendamento',
      'Título do Imóvel',
      'Data da Visita',
      'Horário',
      'Nome do Cliente',
      'E-mail do Cliente',
      'Telefone do Cliente',
      'Status',
      'Corretor Responsável',
      'Observações',
      'Data de Criação'
    ];

    const escapeCsv = (val: string | number | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = bookings.map(b => [
      escapeCsv(b.id),
      escapeCsv(b.propertyTitle),
      escapeCsv(b.date),
      escapeCsv(b.timeSlot),
      escapeCsv(b.clientName),
      escapeCsv(b.clientEmail),
      escapeCsv(b.clientPhone),
      escapeCsv(b.status),
      escapeCsv(getAgentName(b.agentId)),
      escapeCsv(b.notes || ''),
      escapeCsv(b.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.download = `visitas-agendadas-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
