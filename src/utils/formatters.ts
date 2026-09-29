import { Priority, TaskStatus } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1) + 'M';
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + 'jt';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'rb';
  }
  return amount.toString();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatTimeIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diffHours = Math.round((target - now) / (1000 * 60 * 60));

    if (diffHours < -24) {
      const days = Math.abs(Math.round(diffHours / 24));
      return `Terlambat ${days} hari`;
    }
    if (diffHours < 0) {
      return `Terlambat ${Math.abs(diffHours)} jam`;
    }
    if (diffHours === 0) {
      return 'Hari ini';
    }
    if (diffHours < 24) {
      return `Dalam ${diffHours} jam`;
    }
    const days = Math.round(diffHours / 24);
    if (days === 1) return 'Besok';
    return `${days} hari lagi`;
  } catch {
    return dateStr;
  }
}

export function getPriorityLabel(priority: Priority): { label: string; textClass: string; dotClass: string } {
  switch (priority) {
    case 'urgent':
      return { label: 'Mendesak', textClass: 'text-rose-400', dotClass: 'bg-rose-500' };
    case 'high':
      return { label: 'Tinggi', textClass: 'text-amber-400', dotClass: 'bg-amber-500' };
    case 'medium':
      return { label: 'Sedang', textClass: 'text-sky-400', dotClass: 'bg-sky-500' };
    case 'low':
    default:
      return { label: 'Rendah', textClass: 'text-zinc-400', dotClass: 'bg-zinc-500' };
  }
}

export function getStatusLabel(status: TaskStatus): { label: string; textClass: string } {
  switch (status) {
    case 'completed':
      return { label: 'Selesai', textClass: 'text-emerald-400' };
    case 'in_progress':
      return { label: 'Berjalan', textClass: 'text-amber-400' };
    case 'cancelled':
      return { label: 'Dibatalkan', textClass: 'text-zinc-500' };
    case 'todo':
    default:
      return { label: 'Belum Dimulai', textClass: 'text-zinc-300' };
  }
}
