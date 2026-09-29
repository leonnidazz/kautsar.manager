import React, { useState, useMemo } from 'react';
import {
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  ExternalLink,
  Trash2,
  Calendar,
  PiggyBank,
  X,
} from 'lucide-react';
import { WishlistItem } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  getPriorityLabel,
} from '../utils/formatters';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  openQuickAdd: () => void;
  onToggleCompleted: (id: string) => void;
  onAddSavings: (id: string, amount: number) => void;
  onDeleteWishlist: (id: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  openQuickAdd,
  onToggleCompleted,
  onAddSavings,
  onDeleteWishlist,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Savings allocation modal
  const [allocatingItem, setAllocatingItem] = useState<WishlistItem | null>(null);
  const [allocationAmount, setAllocationAmount] = useState('100000');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    wishlist.forEach(w => set.add(w.category));
    return Array.from(set);
  }, [wishlist]);

  // Overall metrics
  const totalTargetValue = useMemo(
    () => wishlist.reduce((s, w) => s + w.target_price, 0),
    [wishlist]
  );
  const totalSavedValue = useMemo(
    () => wishlist.reduce((s, w) => s + w.current_saved, 0),
    [wishlist]
  );
  const completedCount = useMemo(
    () => wishlist.filter(w => w.is_completed).length,
    [wishlist]
  );

  // Filtered list
  const filteredList = useMemo(() => {
    return wishlist.filter(item => {
      if (filterState === 'pending' && item.is_completed) return false;
      if (filterState === 'completed' && !item.is_completed) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [wishlist, filterState, categoryFilter]);

  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingItem) return;
    const num = parseFloat(allocationAmount.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(num) && num > 0) {
      onAddSavings(allocatingItem.id, num);
    }
    setAllocatingItem(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#222631]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Wishlist & Target Impian
          </h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Daftar barang kebutuhan, gadget, atau target masa depan dengan pelacak progres tabungan.
          </p>
        </div>
        <button
          onClick={openQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0d0f12] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Wishlist Baru</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Target Price */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
            <span>Total Nilai Target</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-white">
            {formatRupiah(totalTargetValue)}
          </p>
          <p className="text-[11px] text-[#6b7280] mt-1">
            Dari {wishlist.length} item impian
          </p>
        </div>

        {/* Total Saved */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
            <span>Tabungan Terkumpul</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {formatRupiah(totalSavedValue)}
          </p>
          <p className="text-[11px] text-[#6b7280] mt-1">
            {totalTargetValue > 0
              ? `${Math.round((totalSavedValue / totalTargetValue) * 100)}% dari total target impian`
              : 'Belum ada target'}
          </p>
        </div>

        {/* Completion Count */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
            <span>Status Tercapai</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-white">
            {completedCount} <span className="text-sm font-normal text-[#6b7280]">/ {wishlist.length}</span>
          </p>
          <p className="text-[11px] text-[#6b7280] mt-1">
            {wishlist.length - completedCount} item masih dalam perjuangan
          </p>
        </div>
      </div>

      {/* Filter Tabs & Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#141720] border border-[#222735] rounded-xl overflow-x-auto text-xs">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterState === 'all'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            Semua ({wishlist.length})
          </button>
          <button
            onClick={() => setFilterState('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterState === 'pending'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            Dalam Proses ({wishlist.length - completedCount})
          </button>
          <button
            onClick={() => setFilterState('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterState === 'completed'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            Tercapai ({completedCount})
          </button>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6b7280]">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#141720] border border-[#222735] text-white focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wishlist Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141720] border border-[#222735]">
          <Sparkles className="w-8 h-8 mx-auto text-[#374154] mb-2" />
          <p className="text-sm font-medium text-white">Tidak ada wishlist dalam kategori ini</p>
          <p className="text-xs text-[#6b7280] mt-1">
            Klik tombol "Tambah Wishlist Baru" untuk mencatat target barang atau impian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map(item => {
            const priority = getPriorityLabel(item.priority);
            const progress = Math.min(
              100,
              Math.round((item.current_saved / (item.target_price || 1)) * 100)
            );
            const isDone = item.is_completed;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl bg-[#141720] border flex flex-col justify-between transition-all ${
                  isDone
                    ? 'border-[#1e2330] opacity-80'
                    : 'border-[#242937] hover:border-[#353e52]'
                }`}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleCompleted(item.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-[#0d0f12]'
                            : 'border-[#384154] hover:border-emerald-400'
                        }`}
                        title={isDone ? 'Tandai belum tercapai' : 'Tandai sudah tercapai'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <Circle className="w-3 h-3 text-transparent" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <h3
                          className={`text-sm font-semibold tracking-tight ${
                            isDone ? 'line-through text-[#6b7280]' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-[#6b7280] mt-1 flex-wrap">
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className={priority.textClass}>{priority.label}</span>
                          {item.target_date && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3 text-[#6b7280]" />
                                {formatDateIndo(item.target_date)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteWishlist(item.id)}
                      className="text-[#6b7280] hover:text-rose-400 p-1 rounded hover:bg-[#1f2432] transition-colors shrink-0"
                      title="Hapus Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.description && (
                    <p className="text-xs text-[#9ca3af] mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Savings Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-[#1e2330]">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1.5">
                      <span className="text-white font-medium">
                        {formatRupiah(item.current_saved)}
                      </span>
                      <span className="text-[#6b7280]">
                        Target: {formatRupiah(item.target_price)}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#1e2330] overflow-hidden">
                      <div
                        style={{ width: `${progress}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone || progress >= 100 ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6b7280]">
                      <span className={progress >= 100 ? 'text-emerald-400 font-medium' : ''}>
                        {progress}% Terpenuhi
                      </span>
                      {isDone && item.completed_at && (
                        <span className="text-emerald-400">
                          Tercapai {formatDateIndo(item.completed_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-[#1e2330] flex items-center justify-between gap-2">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#9ca3af] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Lihat Toko</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#6b7280]">Target Pribadi</span>
                  )}

                  {!isDone && (
                    <button
                      onClick={() => setAllocatingItem(item)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#1a1f2c] hover:bg-[#222838] border border-[#2b3345] text-emerald-400 transition-colors"
                    >
                      <PiggyBank className="w-3.5 h-3.5" />
                      <span>+ Tabung</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Savings Allocation Dialog */}
      {allocatingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#141720] border border-[#272d3c] rounded-2xl p-5 shadow-2xl text-slate-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#222735]">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Alokasikan Tabungan</h3>
              </div>
              <button
                onClick={() => setAllocatingItem(null)}
                className="text-[#6b7280] hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-[#9ca3af] mb-1">Target Wishlist:</p>
                <p className="text-sm font-semibold text-white truncate">{allocatingItem.title}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  Terkumpul saat ini: {formatRupiah(allocatingItem.current_saved)} / {formatRupiah(allocatingItem.target_price)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Tambahkan Nominal Tabungan (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1000"
                  value={allocationAmount}
                  onChange={e => setAllocationAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2">
                {[50000, 100000, 250000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAllocationAmount(amt.toString())}
                    className="flex-1 py-1 text-[11px] rounded bg-[#1a1e28] hover:bg-[#222838] border border-[#262c3b] text-[#9ca3af] hover:text-white"
                  >
                    +{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#222735]">
                <button
                  type="button"
                  onClick={() => setAllocatingItem(null)}
                  className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-[#0d0f12] hover:bg-emerald-400 transition-colors"
                >
                  Simpan Tabungan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
