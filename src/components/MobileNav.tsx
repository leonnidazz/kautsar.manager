import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  FolderClosed,
  Sparkles,
  Plus,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openQuickAdd: () => void;
  taskDueCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  openQuickAdd,
  taskDueCount,
}) => {
  const items: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tugas', icon: CheckSquare, badge: taskDueCount },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
    { id: 'files', label: 'File', icon: FolderClosed },
    { id: 'wishlist', label: 'Wishlist', icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Floating Action Button */}
      <button
        onClick={openQuickAdd}
        aria-label="Quick Add"
        className="md:hidden fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-emerald-500 text-[#0d0f12] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#12141a]/95 backdrop-blur-md border-t border-[#222631] px-2 py-1.5 flex items-center justify-around h-16">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] transition-colors relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-[#6b7280] hover:text-[#9ca3af]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-[#6b7280]'}`} />
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-[#0d0f12] text-[9px] font-mono font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
