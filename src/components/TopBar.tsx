import React from 'react';
import { Search, Plus, Bell, RefreshCw } from 'lucide-react';
import { ActiveTab } from '../types';

interface TopBarProps {
  activeTab: ActiveTab;
  openQuickAdd: () => void;
  openSearch: () => void;
  onSync: () => void;
  isSyncing: boolean;
  hasNotificationPermission: boolean;
  onRequestNotification: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Ringkasan', subtitle: 'Ikhtisar aktivitas, target, dan keuangan hari ini' },
  tasks: { title: 'Tugas & Target', subtitle: 'Kelola jadwal harian, deadline, dan subtask target' },
  finance: { title: 'Keuangan & Cashflow', subtitle: 'Pencatatan arus kas masuk, keluar, dan saldo berjalan' },
  files: { title: 'File & Materi Belajar', subtitle: 'Penyimpanan dokumen, modul perkuliahan, dan sertifikat' },
  wishlist: { title: 'Wishlist & Target Nabung', subtitle: 'Daftar keinginan barang/target dengan progres tabungan' },
  settings: { title: 'Pengaturan & Supabase Schema', subtitle: 'Profil akun, cadangan data JSON, dan migrasi SQL' },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  openQuickAdd,
  openSearch,
  onSync,
  isSyncing,
  hasNotificationPermission,
  onRequestNotification,
}) => {
  const meta = TAB_TITLES[activeTab] || { title: 'Personal OS', subtitle: 'Sistem Manajemen Personal' };

  return (
    <header className="h-16 px-4 md:px-6 bg-[#0f1116] border-b border-[#222631] flex items-center justify-between sticky top-0 z-20">
      {/* Zone 1: Title & Breadcrumb */}
      <div className="min-w-0 pr-4">
        <h2 className="text-sm md:text-base font-semibold text-white tracking-tight truncate">
          {meta.title}
        </h2>
        <p className="hidden md:block text-[11px] text-[#6b7280] truncate">
          {meta.subtitle}
        </p>
      </div>

      {/* Zone 2 & 3: Actions */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Sync Trigger button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181c24] border border-[#262c3b] text-xs text-[#9ca3af] hover:text-white hover:border-[#374154] transition-colors"
          title="Sinkronisasi status lokal"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-[#6b7280]'}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Sinkron...' : 'Sync'}</span>
        </button>

        {/* Notification Permission Toggle */}
        <button
          onClick={onRequestNotification}
          className={`p-2 rounded-lg border text-xs transition-colors ${
            hasNotificationPermission
              ? 'bg-[#181c24] border-[#262c3b] text-emerald-400'
              : 'bg-[#181c24] border-[#262c3b] text-[#6b7280] hover:text-white'
          }`}
          title={hasNotificationPermission ? 'Notifikasi aktif' : 'Aktifkan alarm notifikasi'}
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* Search button on tablet/desktop */}
        <button
          onClick={openSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181c24] border border-[#262c3b] text-xs text-[#9ca3af] hover:text-white transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#6b7280]" />
          <span>Cari</span>
        </button>

        {/* Quick Add CTA */}
        <button
          onClick={openQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-[#0d0f12] text-xs font-semibold hover:bg-emerald-400 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline">Quick Add</span>
        </button>
      </div>
    </header>
  );
};
