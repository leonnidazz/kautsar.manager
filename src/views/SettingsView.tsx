import React, { useState } from 'react';
import {
  User,
  Database,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Bell,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { NotificationService } from '../services/notification';
import { formatRupiah } from '../utils/formatters';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onResetSeed: () => void;
  onDataImported: () => void;
  taskCount: number;
  trxCount: number;
  fileCount: number;
  wishlistCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetSeed,
  onDataImported,
  taskCount,
  trxCount,
  fileCount,
  wishlistCount,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [monthlyBudget, setMonthlyBudget] = useState(profile.monthly_budget.toString());
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const sqlSchema = StorageService.generateSupabaseMigrationSQL();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      monthly_budget: parseFloat(monthlyBudget) || 0,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-management-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const success = StorageService.importDataJSON(content);
      if (success) {
        setImportStatus('Data berhasil diimpor!');
        onDataImported();
      } else {
        setImportStatus('Gagal membaca file JSON cadangan.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestNotification = async () => {
    NotificationService.playAlertSound();
    const granted = await NotificationService.requestPermission();
    if (granted) {
      NotificationService.sendNotification('Personal OS Reminder', {
        body: 'Notifikasi sistem berfungsi sempurna untuk alarm dan jadwal tugas.',
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#222631]">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Pengaturan, Cloud & Cadangan Data
        </h1>
        <p className="text-xs text-[#9ca3af] mt-0.5">
          Konfigurasi profil pengguna, skema PostgreSQL / Supabase, cadangan JSON, dan sinkronisasi lokal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Profile & Notification Settings */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#222735]">
              <User className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Profil Pengguna</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Target Anggaran Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={monthlyBudget}
                  onChange={e => setMonthlyBudget(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-[#6b7280] mt-0.5 block">
                  Format: {formatRupiah(parseFloat(monthlyBudget) || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-emerald-400">
                  {isSaved ? 'Profil berhasil diperbarui!' : ''}
                </span>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-[#0d0f12] text-xs font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>

          {/* Diagnostics & Notification Card */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#222735]">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Status Penyimpanan Lokal</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 rounded-lg bg-[#181c26] border border-[#222735]">
                <span className="text-[#6b7280] block text-[11px]">Total Tugas</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">
                  {taskCount} Entri
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#181c26] border border-[#222735]">
                <span className="text-[#6b7280] block text-[11px]">Total Transaksi</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">
                  {trxCount} Transaksi
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#181c26] border border-[#222735]">
                <span className="text-[#6b7280] block text-[11px]">Total Berkas</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">
                  {fileCount} File
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#181c26] border border-[#222735]">
                <span className="text-[#6b7280] block text-[11px]">Total Wishlist</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">
                  {wishlistCount} Item
                </span>
              </div>
            </div>

            {/* Notification test */}
            <div className="p-3 rounded-lg bg-[#181c26] border border-[#222735] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Alarm & Peringatan Audio</p>
                <p className="text-[11px] text-[#6b7280]">
                  Uji chime audio dan izin notifikasi browser
                </p>
              </div>
              <button
                onClick={handleTestNotification}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#202534] hover:bg-[#282f42] text-white border border-[#2c3346] transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Alarm</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore JSON */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#242937]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#222735]">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Cadangan & Pemulihan (JSON)</h3>
            </div>

            <p className="text-xs text-[#9ca3af] mb-4 leading-relaxed">
              Ekspor seluruh data tugas, keuangan, file, dan wishlist ke file JSON, atau pulihkan dari cadangan sebelumnya.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-[#202534] border border-[#272e3f] text-xs font-medium text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ekspor JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-[#202534] border border-[#272e3f] text-xs font-medium text-white cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Impor JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={onResetSeed}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#181c26] hover:bg-[#202534] border border-[#272e3f] text-xs font-medium text-rose-400 transition-colors ml-auto"
                title="Kembalikan data ke contoh awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Awal</span>
              </button>
            </div>

            {importStatus && (
              <p className="mt-2 text-xs text-emerald-400 font-medium">{importStatus}</p>
            )}
          </div>
        </div>

        {/* Right Column: Supabase / PostgreSQL Schema */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#242937] flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222735]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Skema Supabase / PostgreSQL</h3>
                <span className="text-[11px] text-[#6b7280]">
                  DDL SQL terintegrasi Row Level Security (RLS)
                </span>
              </div>
            </div>

            <button
              onClick={handleCopySQL}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Tersalin' : 'Salin SQL'}</span>
            </button>
          </div>

          <p className="text-xs text-[#9ca3af] mb-3 leading-relaxed">
            Skema ini mencerminkan struktur database cloud Supabase sesuai Master Plan:
            <code className="text-emerald-400 mx-1">profiles</code>,
            <code className="text-emerald-400 mx-1">tasks</code>,
            <code className="text-emerald-400 mx-1">reminders</code>,
            <code className="text-emerald-400 mx-1">transactions</code>,
            <code className="text-emerald-400 mx-1">files</code>, dan
            <code className="text-emerald-400 mx-1">wishlist</code>.
          </p>

          {/* SQL Code Box */}
          <div className="flex-1 bg-[#0b0d11] border border-[#1e2330] rounded-xl p-3 font-mono text-[11px] text-[#9ca3af] overflow-x-auto max-h-[500px]">
            <pre className="text-emerald-300 whitespace-pre leading-relaxed">{sqlSchema}</pre>
          </div>

          <div className="mt-3 pt-3 border-t border-[#222735] flex items-center justify-between text-[11px] text-[#6b7280]">
            <span>Siap dieksekusi di Supabase SQL Editor</span>
            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              Dokumentasi Supabase <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
