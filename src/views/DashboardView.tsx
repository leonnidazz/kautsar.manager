import React from 'react';
import {
  CheckSquare,
  Wallet,
  FolderClosed,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Plus,
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Task, Transaction, FileItem, WishlistItem, ActiveTab, UserProfile } from '../types';
import {
  formatRupiah,
  formatCompactNumber,
  formatDateIndo,
  formatRelativeTime,
  getPriorityLabel,
} from '../utils/formatters';

interface DashboardViewProps {
  tasks: Task[];
  transactions: Transaction[];
  files: FileItem[];
  wishlist: WishlistItem[];
  profile: UserProfile;
  setActiveTab: (tab: ActiveTab) => void;
  openQuickAddWithTab: (tab: 'task' | 'transaction' | 'file' | 'wishlist') => void;
  onToggleTask: (id: string) => void;
  onSelectFileForPreview: (file: FileItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  transactions,
  files,
  wishlist,
  profile,
  setActiveTab,
  openQuickAddWithTab,
  onToggleTask,
  onSelectFileForPreview,
}) => {
  // Calculations for Metrics
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const incomeThisMonth = transactions
    .filter(t => t.type === 'income' && t.transaction_at.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseThisMonth = transactions
    .filter(t => t.type === 'expense' && t.transaction_at.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = incomeThisMonth - expenseThisMonth;

  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Nearest deadline tasks (sorted by due date)
  const upcomingTasks = [...pendingTasks]
    .sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    })
    .slice(0, 4);

  // Recent files
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Top pending wishlist
  const pendingWishlist = wishlist.filter(w => !w.is_completed);
  const featuredWishlist = pendingWishlist[0] || wishlist[0];

  // Cashflow 7-day mini chart data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });

    const dayExpense = transactions
      .filter(t => t.type === 'expense' && t.transaction_at === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const dayIncome = transactions
      .filter(t => t.type === 'income' && t.transaction_at === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);

    return { dateStr, dayLabel, expense: dayExpense, income: dayIncome };
  });

  const maxChartVal = Math.max(...last7Days.map(d => Math.max(d.income, d.expense)), 500000);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Glance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#222631]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#9ca3af] mb-1">
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Sistem Aktif</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Selamat datang, {profile.name}
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openQuickAddWithTab('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#181c26] hover:bg-[#202534] border border-[#272e3f] text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Tugas</span>
          </button>
          <button
            onClick={() => openQuickAddWithTab('transaction')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#181c26] hover:bg-[#202534] border border-[#272e3f] text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Transaksi</span>
          </button>
          <button
            onClick={() => openQuickAddWithTab('file')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#181c26] hover:bg-[#202534] border border-[#272e3f] text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ File</span>
          </button>
          <button
            onClick={() => openQuickAddWithTab('wishlist')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0d0f12] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Wishlist</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards: Saldo, Cashflow Bulan Ini, Tugas Berjalan, Target Wishlist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div
          onClick={() => setActiveTab('finance')}
          className="p-4 rounded-xl bg-[#141720] border border-[#242937] hover:border-[#353d52] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
            <span>Saldo Berjalan</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatRupiah(totalBalance)}
          </p>
          <div className="mt-2 text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>Status Akumulasi</span>
            <span className="text-emerald-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Lihat ledger <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Cashflow Bulan Ini */}
        <div
          onClick={() => setActiveTab('finance')}
          className="p-4 rounded-xl bg-[#141720] border border-[#242937] hover:border-[#353d52] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
            <span>Net Cashflow Bulan Ini</span>
            {netCashflow >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <p className={`text-xl font-bold font-mono tabular-nums tracking-tight ${netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netCashflow >= 0 ? `+${formatRupiah(netCashflow)}` : formatRupiah(netCashflow)}
          </p>
          <div className="mt-2 text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>Masuk: {formatCompactNumber(incomeThisMonth)} · Keluar: {formatCompactNumber(expenseThisMonth)}</span>
          </div>
        </div>

        {/* Tugas & Target */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-xl bg-[#141720] border border-[#242937] hover:border-[#353d52] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
            <span>Tugas & Target Aktif</span>
            <CheckSquare className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-white tracking-tight">
            {pendingTasks.length} <span className="text-xs font-normal text-[#6b7280]">tersisa</span>
          </p>
          <div className="mt-2 text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>{completedTasks.length} tugas telah selesai</span>
            <span className="text-sky-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Buka <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Wishlist Goal */}
        <div
          onClick={() => setActiveTab('wishlist')}
          className="p-4 rounded-xl bg-[#141720] border border-[#242937] hover:border-[#353d52] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
            <span>Wishlist & Impian</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-white tracking-tight">
            {wishlist.filter(w => w.is_completed).length} / {wishlist.length}{' '}
            <span className="text-xs font-normal text-[#6b7280]">tercapai</span>
          </p>
          <div className="mt-2 text-[11px] text-[#6b7280] flex items-center justify-between">
            <span>{pendingWishlist.length} target menunggu</span>
            <span className="text-amber-400 flex items-center group-hover:translate-x-0.5 transition-transform">
              Kelola <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 span): Tasks & Cashflow Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nearest Deadline Tasks */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222735]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Tugas & Deadline Terdekat</h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-[#9ca3af] hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <span>Lihat semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6b7280]">
                Semua tugas telah selesai atau belum ada tugas aktif.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map(task => {
                  const priority = getPriorityLabel(task.priority);
                  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-[#181c26] border border-[#222735] hover:border-[#2f3647] flex items-start justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 w-4 h-4 rounded border border-[#374154] hover:border-emerald-400 flex items-center justify-center shrink-0 transition-colors"
                        >
                          {task.status === 'completed' && (
                            <span className="w-2 h-2 rounded-sm bg-emerald-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#6b7280] mt-1 flex-wrap">
                            <span>{task.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className={priority.textClass}>{priority.label}</span>
                            {task.due_at && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="flex items-center gap-1 text-slate-300">
                                  <Clock className="w-3 h-3 text-[#6b7280]" />
                                  {formatRelativeTime(task.due_at)}
                                </span>
                              </>
                            )}
                            {task.subtasks.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{completedSubtasks}/{task.subtasks.length} langkah</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cashflow 7-day Interactive Bar Chart */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222735]">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Aktivitas Cashflow 7 Hari Terakhir</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Masuk</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  <span>Keluar</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-2">
              <div className="h-40 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {last7Days.map((day, idx) => {
                  const incomeHeight = Math.max(4, Math.round((day.income / maxChartVal) * 110));
                  const expenseHeight = Math.max(4, Math.round((day.expense / maxChartVal) * 110));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end justify-center gap-1 h-32 relative">
                        {/* Income Bar */}
                        <div
                          style={{ height: `${day.income > 0 ? incomeHeight : 4}px` }}
                          className={`w-2.5 sm:w-4 rounded-t transition-all ${
                            day.income > 0 ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-[#222735]'
                          }`}
                          title={`Masuk: ${formatRupiah(day.income)}`}
                        />
                        {/* Expense Bar */}
                        <div
                          style={{ height: `${day.expense > 0 ? expenseHeight : 4}px` }}
                          className={`w-2.5 sm:w-4 rounded-t transition-all ${
                            day.expense > 0 ? 'bg-rose-500 group-hover:bg-rose-400' : 'bg-[#222735]'
                          }`}
                          title={`Keluar: ${formatRupiah(day.expense)}`}
                        />
                      </div>
                      <span className="text-[10px] text-[#6b7280] font-mono group-hover:text-white transition-colors">
                        {day.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-[#222735] flex items-center justify-between text-xs text-[#9ca3af]">
                <span>Total 7 Hari: Masuk {formatRupiah(last7Days.reduce((a, b) => a + b.income, 0))}</span>
                <span>Keluar {formatRupiah(last7Days.reduce((a, b) => a + b.expense, 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Featured Wishlist & Recent Files */}
        <div className="space-y-6">
          {/* Featured Wishlist Card */}
          {featuredWishlist && (
            <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222735]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Target Wishlist Utama</h3>
                </div>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className="text-xs text-[#9ca3af] hover:text-amber-400 transition-colors"
                >
                  Semua
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-white line-clamp-1">
                  {featuredWishlist.title}
                </p>
                <p className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-2">
                  {featuredWishlist.description || 'Target pembelian impian'}
                </p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1">
                    <span className="text-white font-medium">
                      {formatRupiah(featuredWishlist.current_saved)}
                    </span>
                    <span className="text-[#6b7280]">
                      Target {formatRupiah(featuredWishlist.target_price)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1e2330] overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((featuredWishlist.current_saved / (featuredWishlist.target_price || 1)) * 100)
                        )}%`,
                      }}
                      className="h-full rounded-full bg-amber-400 transition-all"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#6b7280]">
                    <span>
                      {Math.min(
                        100,
                        Math.round((featuredWishlist.current_saved / (featuredWishlist.target_price || 1)) * 100)
                      )}% tercapai
                    </span>
                    {featuredWishlist.link && (
                      <a
                        href={featuredWishlist.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        Lihat produk <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Files */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222735]">
              <div className="flex items-center gap-2">
                <FolderClosed className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">File & Berkas Terbaru</h3>
              </div>
              <button
                onClick={() => setActiveTab('files')}
                className="text-xs text-[#9ca3af] hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <span>Lihat folder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentFiles.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6b7280]">
                Belum ada file tersimpan.
              </div>
            ) : (
              <div className="space-y-2">
                {recentFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => onSelectFileForPreview(file)}
                    className="p-2.5 rounded-lg bg-[#181c26] border border-[#222735] hover:border-[#2f3647] flex items-center justify-between gap-2.5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-[#202534] flex items-center justify-center text-emerald-400 shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate group-hover:text-emerald-300 transition-colors">
                          {file.name}
                        </p>
                        <div className="text-[10px] text-[#6b7280] truncate">
                          {file.folder} · {formatDateIndo(file.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cloud Sync Status info card */}
          <div className="p-4 rounded-xl bg-[#10131a] border border-[#1e2330] text-xs text-[#9ca3af]">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Arsitektur Offline-First</p>
                <p className="text-[11px] text-[#6b7280] mt-0.5 leading-relaxed">
                  Data tersimpan secara aman di peramban lokal dan siap diekspor / disinkronkan ke PostgreSQL / Supabase kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
