import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  FolderClosed,
  Sparkles,
  Settings,
  Plus,
  CloudCheck,
  Search,
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openQuickAdd: () => void;
  openSearch: () => void;
  profile: UserProfile;
  counts: {
    tasksDueToday: number;
    pendingWishlist: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openQuickAdd,
  openSearch,
  profile,
  counts,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tugas & Target', icon: CheckSquare, badge: counts.tasksDueToday },
    { id: 'finance', label: 'Keuangan & Saldo', icon: Wallet },
    { id: 'files', label: 'File & Materi', icon: FolderClosed },
    { id: 'wishlist', label: 'Wishlist & Impian', icon: Sparkles, badge: counts.pendingWishlist },
    { id: 'settings', label: 'Pengaturan & Cloud', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#12141a] border-r border-[#222631] text-[#9ca3af] h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#222631]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm tracking-wider">
            PM
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight leading-none">
              Personal OS
            </h1>
            <span className="text-[11px] text-[#6b7280]">v1.0 · Sync Siap</span>
          </div>
        </div>
      </div>

      {/* Quick Add CTA */}
      <div className="p-3">
        <button
          onClick={openQuickAdd}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-500 text-[#0d0f12] hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Add Baru</span>
        </button>
      </div>

      {/* Global Search trigger */}
      <div className="px-3 pb-2">
        <button
          onClick={openSearch}
          className="w-full flex items-center justify-between py-2 px-3 text-xs rounded-lg bg-[#181c24] border border-[#262c3b] text-[#9ca3af] hover:text-white hover:border-[#374154] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Cari cepat...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202532] text-[#9ca3af] border border-[#2b3345]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#181c24]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#6b7280]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#202532] text-[#9ca3af] border border-[#2b3345]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile & Sync status */}
      <div className="p-3 border-t border-[#222631]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#181c24] border border-[#222631]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile.name}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <CloudCheck className="w-3 h-3 shrink-0" />
                <span className="truncate">Lokal Terjaga</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-1 text-[#6b7280] hover:text-white rounded hover:bg-[#202532] transition-colors"
            title="Buka Pengaturan"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
