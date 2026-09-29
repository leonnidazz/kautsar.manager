import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Trash2,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface FinanceViewProps {
  transactions: Transaction[];
  openQuickAdd: () => void;
  onDeleteTransaction: (id: string) => void;
}

type ChartGranularity = 'daily' | 'weekly' | 'monthly';

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  openQuickAdd,
  onDeleteTransaction,
}) => {
  const [chartGranularity, setChartGranularity] =
    useState<ChartGranularity>('daily');

  const [typeFilter, setTypeFilter] = useState<
    'all' | 'income' | 'expense'
  >('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // =========================================================
  // TOTAL KEUANGAN
  // =========================================================

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0),
    [transactions]
  );

  const runningBalance = totalIncome - totalExpense;

  // =========================================================
  // DAFTAR KATEGORI
  // =========================================================

  const categories = useMemo(() => {
    const set = new Set<string>();

    transactions.forEach(t => {
      set.add(t.category);
    });

    return Array.from(set);
  }, [transactions]);

  // =========================================================
  // BREAKDOWN PENGELUARAN PER KATEGORI
  // =========================================================

  const categoryBreakdown = useMemo(() => {
    const expenseOnly = transactions.filter(
      t => t.type === 'expense'
    );

    const map: Record<string, number> = {};

    expenseOnly.forEach(t => {
      map[t.category] =
        (map[t.category] || 0) + Number(t.amount);
    });

    const entries = Object.entries(map).sort(
      (a, b) => b[1] - a[1]
    );

    const total =
      expenseOnly.reduce(
        (s, t) => s + Number(t.amount),
        0
      ) || 1;

    return entries.map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100),
    }));
  }, [transactions]);

  // =========================================================
  // BREAKDOWN SUMBER / REKENING
  // =========================================================

  const sourceBreakdown = useMemo(() => {
    const map: Record<
      string,
      {
        income: number;
        expense: number;
      }
    > = {};

    transactions.forEach(t => {
      const src =
        t.source_or_note
          ?.split(' - ')[0]
          ?.trim() || 'Lainnya';

      if (!map[src]) {
        map[src] = {
          income: 0,
          expense: 0,
        };
      }

      if (t.type === 'income') {
        map[src].income += Number(t.amount);
      } else {
        map[src].expense += Number(t.amount);
      }
    });

    return Object.entries(map).map(
      ([source, data]) => ({
        source,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      })
    );
  }, [transactions]);

  // =========================================================
  // HELPER TANGGAL
  // =========================================================

  const getDateKey = (value: string | Date) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // DATA GRAFIK
  // =========================================================

  const chartData = useMemo(() => {
    // -------------------------------------------------------
    // 10 HARI TERAKHIR
    // -------------------------------------------------------

    if (chartGranularity === 'daily') {
      return Array.from({ length: 10 }).map(
        (_, i) => {
          const d = new Date();

          d.setHours(0, 0, 0, 0);

          d.setDate(
            d.getDate() - (9 - i)
          );

          const dateStr = getDateKey(d);

          const label =
            d.toLocaleDateString(
              'id-ID',
              {
                day: 'numeric',
                month: 'numeric',
              }
            );

          const inc = transactions
            .filter(t => {
              if (t.type !== 'income') {
                return false;
              }

              return (
                getDateKey(
                  t.transaction_at
                ) === dateStr
              );
            })
            .reduce(
              (s, t) =>
                s + Number(t.amount),
              0
            );

          const exp = transactions
            .filter(t => {
              if (t.type !== 'expense') {
                return false;
              }

              return (
                getDateKey(
                  t.transaction_at
                ) === dateStr
              );
            })
            .reduce(
              (s, t) =>
                s + Number(t.amount),
              0
            );

          return {
            label,
            income: inc,
            expense: exp,
          };
        }
      );
    }

    // -------------------------------------------------------
    // MINGGUAN
    // -------------------------------------------------------

    if (chartGranularity === 'weekly') {
      return Array.from({ length: 6 }).map(
        (_, i) => {
          const endDay = new Date();

          endDay.setHours(
            23,
            59,
            59,
            999
          );

          endDay.setDate(
            endDay.getDate() -
              (5 - i) * 7
          );

          const startDay = new Date(
            endDay
          );

          startDay.setHours(
            0,
            0,
            0,
            0
          );

          startDay.setDate(
            startDay.getDate() - 6
          );

          const startTime =
            startDay.getTime();

          const endTime =
            endDay.getTime();

          const label = `M-${i + 1}`;

          const inc = transactions
            .filter(t => {
              if (t.type !== 'income') {
                return false;
              }

              const time =
                new Date(
                  t.transaction_at
                ).getTime();

              return (
                time >= startTime &&
                time <= endTime
              );
            })
            .reduce(
              (s, t) =>
                s + Number(t.amount),
              0
            );

          const exp = transactions
            .filter(t => {
              if (t.type !== 'expense') {
                return false;
              }

              const time =
                new Date(
                  t.transaction_at
                ).getTime();

              return (
                time >= startTime &&
                time <= endTime
              );
            })
            .reduce(
              (s, t) =>
                s + Number(t.amount),
              0
            );

          return {
            label,
            income: inc,
            expense: exp,
          };
        }
      );
    }

    // -------------------------------------------------------
    // BULANAN
    // -------------------------------------------------------

    return Array.from({ length: 6 }).map(
      (_, i) => {
        const d = new Date();

        d.setDate(1);

        d.setMonth(
          d.getMonth() - (5 - i)
        );

        const yearMonth =
          `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, '0')}`;

        const label =
          d.toLocaleDateString(
            'id-ID',
            {
              month: 'short',
            }
          );

        const inc = transactions
          .filter(t => {
            if (t.type !== 'income') {
              return false;
            }

            return getDateKey(
              t.transaction_at
            ).startsWith(yearMonth);
          })
          .reduce(
            (s, t) =>
              s + Number(t.amount),
            0
          );

        const exp = transactions
          .filter(t => {
            if (t.type !== 'expense') {
              return false;
            }

            return getDateKey(
              t.transaction_at
            ).startsWith(yearMonth);
          })
          .reduce(
            (s, t) =>
              s + Number(t.amount),
            0
          );

        return {
          label,
          income: inc,
          expense: exp,
        };
      }
    );
  }, [
    transactions,
    chartGranularity,
  ]);

  // =========================================================
  // NILAI MAKSIMUM GRAFIK
  // =========================================================

  const maxVal = Math.max(
    ...chartData.map(d =>
      Math.max(
        d.income,
        d.expense
      )
    ),
    1000000
  );

  // =========================================================
  // FILTER TRANSAKSI
  // =========================================================

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(t => {
        if (
          typeFilter !== 'all' &&
          t.type !== typeFilter
        ) {
          return false;
        }

        if (
          categoryFilter !== 'all' &&
          t.category !== categoryFilter
        ) {
          return false;
        }

        if (searchQuery.trim()) {
          const q =
            searchQuery
              .toLowerCase();

          const matchNote =
            t.source_or_note
              ?.toLowerCase()
              .includes(q);

          const matchCat =
            t.category
              .toLowerCase()
              .includes(q);

          const matchAmount =
            t.amount
              .toString()
              .includes(q);

          if (
            !matchNote &&
            !matchCat &&
            !matchAmount
          ) {
            return false;
          }
        }

        return true;
      });
    }, [
      transactions,
      typeFilter,
      categoryFilter,
      searchQuery,
    ]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#222631]">

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Keuangan & Arus Kas (Cashflow)
          </h1>

          <p className="text-xs text-[#9ca3af] mt-0.5">
            Pencatatan pemasukan & pengeluaran,
            saldo berjalan, analisis kategori,
            dan rekening.
          </p>
        </div>

        <button
          onClick={openQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0d0f12] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />

          <span>
            Catat Transaksi Baru
          </span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* SALDO */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">

          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">

            <span>
              Saldo Berjalan (Total)
            </span>

            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>

          <p className="text-2xl font-bold font-mono tabular-nums text-white">
            {formatRupiah(
              runningBalance
            )}
          </p>

          <p className="text-[11px] text-[#6b7280] mt-1">
            Akumulasi seluruh akun
            terdaftar
          </p>
        </div>

        {/* PEMASUKAN */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">

          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">

            <span>
              Total Pemasukan
            </span>

            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>

          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {formatRupiah(
              totalIncome
            )}
          </p>

          <p className="text-[11px] text-[#6b7280] mt-1">
            {
              transactions.filter(
                t => t.type === 'income'
              ).length
            }{' '}
            transaksi tercatat
          </p>
        </div>

        {/* PENGELUARAN */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">

          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">

            <span>
              Total Pengeluaran
            </span>

            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>

          <p className="text-2xl font-bold font-mono tabular-nums text-rose-400">
            {formatRupiah(
              totalExpense
            )}
          </p>

          <p className="text-[11px] text-[#6b7280] mt-1">
            {
              transactions.filter(
                t => t.type === 'expense'
              ).length
            }{' '}
            transaksi tercatat
          </p>
        </div>
      </div>

      {/* =====================================================
          CASHFLOW CHART
      ===================================================== */}

      <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#222735]">

          <div>
            <h3 className="text-sm font-semibold text-white">
              Grafik Tren Arus Kas
            </h3>

            <p className="text-xs text-[#6b7280]">
              Perbandingan nominal pemasukan
              dan pengeluaran
            </p>
          </div>

          <div className="flex items-center gap-2">

            {/* LEGEND */}
            <div className="hidden sm:flex items-center gap-3 text-xs mr-2">

              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Masuk
              </span>

              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Keluar
              </span>

            </div>

            {/* GRANULARITY */}
            <div className="flex items-center gap-1 p-1 bg-[#10121a] rounded-lg border border-[#222735] text-xs">

              <button
                onClick={() =>
                  setChartGranularity(
                    'daily'
                  )
                }
                className={`px-2.5 py-1 rounded transition-colors ${
                  chartGranularity ===
                  'daily'
                    ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                10 Hari
              </button>

              <button
                onClick={() =>
                  setChartGranularity(
                    'weekly'
                  )
                }
                className={`px-2.5 py-1 rounded transition-colors ${
                  chartGranularity ===
                  'weekly'
                    ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                Mingguan
              </button>

              <button
                onClick={() =>
                  setChartGranularity(
                    'monthly'
                  )
                }
                className={`px-2.5 py-1 rounded transition-colors ${
                  chartGranularity ===
                  'monthly'
                    ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                Bulanan
              </button>

            </div>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 px-2 pt-2">

          {chartData.map(
            (item, idx) => {

              const incH =
                Math.max(
                  4,
                  Math.round(
                    (item.income /
                      maxVal) *
                      140
                  )
                );

              const expH =
                Math.max(
                  4,
                  Math.round(
                    (item.expense /
                      maxVal) *
                      140
                  )
                );

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5 group"
                >

                  <div className="w-full flex items-end justify-center gap-1 h-36">

                    {/* INCOME */}
                    <div
                      style={{
                        height: `${
                          item.income >
                          0
                            ? incH
                            : 4
                        }px`,
                      }}
                      className={`w-3 sm:w-5 rounded-t transition-all ${
                        item.income >
                        0
                          ? 'bg-emerald-500 group-hover:bg-emerald-400'
                          : 'bg-[#1e2330]'
                      }`}
                      title={`Masuk: ${formatRupiah(
                        item.income
                      )}`}
                    />

                    {/* EXPENSE */}
                    <div
                      style={{
                        height: `${
                          item.expense >
                          0
                            ? expH
                            : 4
                        }px`,
                      }}
                      className={`w-3 sm:w-5 rounded-t transition-all ${
                        item.expense >
                        0
                          ? 'bg-rose-500 group-hover:bg-rose-400'
                          : 'bg-[#1e2330]'
                      }`}
                      title={`Keluar: ${formatRupiah(
                        item.expense
                      )}`}
                    />

                  </div>

                  <span className="text-[10px] sm:text-xs text-[#6b7280] font-mono group-hover:text-white transition-colors">
                    {item.label}
                  </span>

                </div>
              );
            }
          )}

        </div>
      </div>

      {/* =====================================================
          CATEGORY + SOURCE
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CATEGORY */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">

          <h3 className="text-sm font-semibold text-white mb-1">
            Distribusi Pengeluaran
            Berdasarkan Kategori
          </h3>

          <p className="text-xs text-[#6b7280] mb-4">
            Rincian alokasi biaya
            pengeluaran terbesar
          </p>

          <div className="space-y-3">

            {categoryBreakdown.length ===
            0 ? (
              <p className="text-xs text-[#6b7280] py-4 text-center">
                Belum ada pengeluaran
                tercatat.
              </p>
            ) : (
              categoryBreakdown.map(
                cat => (
                  <div
                    key={cat.category}
                    className="space-y-1"
                  >

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-slate-300">
                        {cat.category}
                      </span>

                      <span className="font-mono tabular-nums text-white">
                        {formatRupiah(
                          cat.amount
                        )}{' '}
                        ({cat.percentage}%)
                      </span>

                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#1e2330] overflow-hidden">

                      <div
                        style={{
                          width: `${cat.percentage}%`,
                        }}
                        className="h-full rounded-full bg-rose-400 transition-all"
                      />

                    </div>
                  </div>
                )
              )
            )}

          </div>
        </div>

        {/* SOURCE */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">

          <h3 className="text-sm font-semibold text-white mb-1">
            Ringkasan Rekening &
            Dompet Digital
          </h3>

          <p className="text-xs text-[#6b7280] mb-4">
            Aktivitas pemasukan dan
            pengeluaran per sumber dana
          </p>

          <div className="space-y-2.5">

            {sourceBreakdown.length ===
            0 ? (
              <p className="text-xs text-[#6b7280] py-4 text-center">
                Belum ada rekening
                tercatat.
              </p>
            ) : (
              sourceBreakdown.map(
                src => (
                  <div
                    key={src.source}
                    className="p-2.5 rounded-lg bg-[#181c26] border border-[#222735] flex items-center justify-between text-xs"
                  >

                    <span className="font-medium text-white">
                      {src.source}
                    </span>

                    <div className="flex items-center gap-3 font-mono tabular-nums">

                      <span className="text-emerald-400">
                        +
                        {formatRupiah(
                          src.income
                        )}
                      </span>

                      <span className="text-rose-400">
                        -
                        {formatRupiah(
                          src.expense
                        )}
                      </span>

                    </div>

                  </div>
                )
              )
            )}

          </div>
        </div>
      </div>

      {/* =====================================================
          RIWAYAT TRANSAKSI
      ===================================================== */}

      <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">

        {/* FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#222735]">

          <div className="flex items-center gap-2">

            <h3 className="text-sm font-semibold text-white">
              Riwayat Transaksi
            </h3>

            <span className="text-xs text-[#6b7280]">
              (
              {
                filteredTransactions.length
              }{' '}
              entri)
            </span>

          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">

            {/* TYPE */}
            <div className="flex items-center gap-1 p-0.5 bg-[#10121a] rounded-lg border border-[#222735]">

              <button
                onClick={() =>
                  setTypeFilter(
                    'all'
                  )
                }
                className={`px-2.5 py-1 rounded transition-colors ${
                  typeFilter ===
                  'all'
                    ? 'bg-[#1e2330] text-emerald-400 font-medium'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                Semua
              </button>

              <button
                onClick={() =>
                  setTypeFilter(
                    'income'
                  )
                }
                className={`px-2.5 py-1 rounded transition-colors ${
                  typeFilter ===
                  'income'
                    ? 'bg-[#1e2330] text-emerald-400 font-medium'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                Masuk
              </button>

              <button
                onClick={() =>
                  setTypeFilter(
                    'expense'
                  )
                }
                className={`px-2.5 py-1 rounded transition-colors ${
                  typeFilter ===
                  'expense'
                    ? 'bg-[#1e2330] text-rose-400 font-medium'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                Keluar
              </button>

            </div>

            {/* CATEGORY */}
            <select
              value={categoryFilter}
              onChange={e =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="px-2 py-1 rounded-lg bg-[#141720] border border-[#222735] text-white focus:outline-none"
            >

              <option value="all">
                Semua Kategori
              </option>

              {categories.map(c => (
                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>
              ))}

            </select>

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={e =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="px-2.5 py-1 text-xs bg-[#141720] border border-[#222735] rounded-lg text-white placeholder-[#6b7280] focus:outline-none focus:border-emerald-500"
            />

          </div>
        </div>

        {/* TABLE */}
        {filteredTransactions.length ===
        0 ? (
          <div className="py-8 text-center text-xs text-[#6b7280]">
            Tidak ada transaksi
            yang cocok dengan filter
            ini.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-xs text-left">

              <thead>
                <tr className="border-b border-[#222735] text-[#6b7280]">

                  <th className="py-2.5 px-3 font-medium">
                    Tanggal
                  </th>

                  <th className="py-2.5 px-3 font-medium">
                    Kategori
                  </th>

                  <th className="py-2.5 px-3 font-medium">
                    Keterangan / Sumber
                  </th>

                  <th className="py-2.5 px-3 font-medium text-right">
                    Nominal
                  </th>

                  <th className="py-2.5 px-3 font-medium text-right">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#1b1f2b]">

                {filteredTransactions.map(
                  trx => (
                    <tr
                      key={trx.id}
                      className="hover:bg-[#181c26] transition-colors"
                    >

                      <td className="py-2.5 px-3 text-[#9ca3af] whitespace-nowrap">
                        {formatDateIndo(
                          trx.transaction_at
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-white font-medium">
                        {trx.category}
                      </td>

                      <td className="py-2.5 px-3 text-[#9ca3af]">
                        {trx.source_or_note ||
                          '-'}
                      </td>

                      <td
                        className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                          trx.type ===
                          'income'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {trx.type ===
                        'income'
                          ? '+'
                          : '-'}{' '}
                        {formatRupiah(
                          trx.amount
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">

                        <button
                          onClick={() =>
                            onDeleteTransaction(
                              trx.id
                            )
                          }
                          className="p-1 text-[#6b7280] hover:text-rose-400 rounded hover:bg-[#202534] transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
};