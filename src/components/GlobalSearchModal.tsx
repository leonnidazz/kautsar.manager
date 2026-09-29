import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Wallet,
  FolderClosed,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Task, Transaction, FileItem, WishlistItem, ActiveTab } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  transactions: Transaction[];
  files: FileItem[];
  wishlist: WishlistItem[];
  onNavigateToTab: (tab: ActiveTab) => void;
}

type SearchFilterType = 'all' | 'tasks' | 'finance' | 'files' | 'wishlist';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  transactions,
  files,
  wishlist,
  onNavigateToTab,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<SearchFilterType>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      id: string;
      type: SearchFilterType;
      title: string;
      subtitle: string;
      meta: string;
      targetTab: ActiveTab;
    }> = [];

    // Search tasks
    if (filterType === 'all' || filterType === 'tasks') {
      tasks.forEach(t => {
        if (
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        ) {
          results.push({
            id: t.id,
            type: 'tasks',
            title: t.title,
            subtitle: t.description || `Kategori: ${t.category}`,
            meta: `Tugas · ${t.status === 'completed' ? 'Selesai' : 'Aktif'} · ${formatDateIndo(t.due_at)}`,
            targetTab: 'tasks',
          });
        }
      });
    }

    // Search transactions
    if (filterType === 'all' || filterType === 'finance') {
      transactions.forEach(trx => {
        if (
          trx.category.toLowerCase().includes(q) ||
          trx.source_or_note?.toLowerCase().includes(q) ||
          trx.amount.toString().includes(q)
        ) {
          results.push({
            id: trx.id,
            type: 'finance',
            title: `${trx.type === 'income' ? '+ ' : '- '}${formatRupiah(trx.amount)}`,
            subtitle: `${trx.category} · ${trx.source_or_note || '-'}`,
            meta: `Keuangan · ${formatDateIndo(trx.transaction_at)}`,
            targetTab: 'finance',
          });
        }
      });
    }

    // Search files
    if (filterType === 'all' || filterType === 'files') {
      files.forEach(f => {
        if (
          f.name.toLowerCase().includes(q) ||
          f.folder.toLowerCase().includes(q) ||
          f.tags.some(tag => tag.toLowerCase().includes(q)) ||
          f.description?.toLowerCase().includes(q)
        ) {
          results.push({
            id: f.id,
            type: 'files',
            title: f.name,
            subtitle: f.description || `Folder: ${f.folder}`,
            meta: `File · ${f.folder} · ${f.tags.join(', ')}`,
            targetTab: 'files',
          });
        }
      });
    }

    // Search wishlist
    if (filterType === 'all' || filterType === 'wishlist') {
      wishlist.forEach(w => {
        if (
          w.title.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q)
        ) {
          results.push({
            id: w.id,
            type: 'wishlist',
            title: w.title,
            subtitle: `Target: ${formatRupiah(w.target_price)} (Terkumpul: ${formatRupiah(w.current_saved)})`,
            meta: `Wishlist · ${w.is_completed ? 'Tercapai' : 'Proses'} · ${w.category}`,
            targetTab: 'wishlist',
          });
        }
      });
    }

    return results;
  }, [query, filterType, tasks, transactions, files, wishlist]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#141720] border border-[#272d3c] rounded-2xl shadow-2xl text-[#d1d5db] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#222735] flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Cari tugas, transaksi, file, atau wishlist..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b7280] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#6b7280] hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-[#9ca3af] hover:text-white px-2 py-1 rounded bg-[#1c202c] border border-[#282f40]"
          >
            Esc
          </button>
        </div>

        {/* Filter Type Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#10121a] border-b border-[#222735] overflow-x-auto text-xs">
          <span className="text-[#6b7280] text-[11px] pr-1 shrink-0">Filter:</span>
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'tasks', label: 'Tugas' },
              { id: 'finance', label: 'Keuangan' },
              { id: 'files', label: 'File' },
              { id: 'wishlist', label: 'Wishlist' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#1e2330]">
          {!query.trim() ? (
            <div className="p-8 text-center text-[#6b7280] text-xs">
              <p>Ketik kata kunci untuk mencari di seluruh modul.</p>
              <p className="mt-1 text-[11px]">Contoh: "Raft", "Gaji", "Monitor", "Slide", "Tagihan"</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280] text-xs">
              Tidak ada hasil yang cocok dengan "{query}".
            </div>
          ) : (
            searchResults.map(item => {
              const Icon =
                item.type === 'tasks'
                  ? CheckSquare
                  : item.type === 'finance'
                  ? Wallet
                  : item.type === 'files'
                  ? FolderClosed
                  : Sparkles;

              return (
                <div
                  key={`${item.type}_${item.id}`}
                  onClick={() => {
                    onNavigateToTab(item.targetTab);
                    onClose();
                  }}
                  className="p-3.5 hover:bg-[#191d28] cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#1c212e] border border-[#282f40] flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#9ca3af] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                      <div className="text-[10px] text-[#6b7280] mt-1">
                        {item.meta}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6b7280] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
