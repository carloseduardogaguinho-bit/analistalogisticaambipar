export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const getNowLocalBR = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const min = pad(now.getMinutes());
  return `${y}-${m}-${d} ${h}:${min}`;
};

export const getTodayLocalBR = (): string => {
  return getNowLocalBR().slice(0, 10);
};

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    let date = new Date(dateStr.replace(' ', 'T'));
    const now = new Date();
    
    // Auto-correção para timestamps salvos com toISOString() UTC (3 horas à frente do horário do Brasil)
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours > 0.5 && diffHours < 5) {
      date = new Date(date.getTime() - 3 * 3600 * 1000);
    }

    if (isNaN(date.getTime())) return dateStr;

    const pad = (n: number) => String(n).padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const isYesterday =
      date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Hoje às ${hours}:${minutes}`;
    }
    if (isYesterday) {
      return `Ontem às ${hours}:${minutes}`;
    }

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
};

export const getStatusColor = (status: string): { bg: string; text: string; border: string; dot: string } => {
  switch (status) {
    case 'Em Trânsito':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500 animate-pulse' };
    case 'No Cliente':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-500' };
    case 'Carregando':
    case 'Descarregando':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500 animate-spin' };
    case 'Concluída':
    case 'CDF Gerado':
    case 'Válido':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' };
    case 'Atrasada':
    case 'Vencido':
    case 'Crítica (Emergência)':
    case 'Pendente Regularização':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-500 animate-ping' };
    case 'Atenção (Expira em 30d)':
    case 'Alta':
    case 'Média':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' };
    case 'Programada':
    case 'Emitido no SINIR':
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400' };
  }
};
