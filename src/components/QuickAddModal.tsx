import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Wallet,
  FolderClosed,
  Sparkles,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { Priority, TransactionType, Task, Transaction, FileItem, WishlistItem } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'transaction' | 'file' | 'wishlist';
  onAddTask: (task: Omit<Task, 'id' | 'created_at' | 'completed_at'>) => void;
  defaultTaskCategory?: string;
  onAddTransaction: (trx: Omit<Transaction, 'id' | 'created_at'>) => void;
  onAddFile: (
  file: Omit<FileItem, 'id' | 'created_at' | 'dataUrl'> & {
    file: File;
  }
) => Promise<void>;
  onAddWishlist: (wishlist: Omit<WishlistItem, 'id' | 'created_at' | 'completed_at' | 'is_completed'>) => void;
  userId: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'task',
  defaultTaskCategory = 'Pribadi',
  onAddTask,
  onAddTransaction,
  onAddFile,
  onAddWishlist,
  userId,
}) => {
  const [tab, setTab] = useState<'task' | 'transaction' | 'file' | 'wishlist'>(defaultTab);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] =
  useState(defaultTaskCategory);
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDueTime, setTaskDueTime] = useState('23:59');
  const [taskSubtasks, setTaskSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [taskReminderEnabled, setTaskReminderEnabled] = useState(false);
  useEffect(() => {
  if (!isOpen) return;

  setTab(defaultTab);
  setTaskCategory(defaultTaskCategory);
}, [
  isOpen,
  defaultTab,
  defaultTaskCategory,
]);

  // Transaction form state
  const [trxType, setTrxType] = useState<TransactionType>('expense');
  const [trxAmount, setTrxAmount] = useState('');
  const [trxCategory, setTrxCategory] = useState('Makanan');
  const [trxSource, setTrxSource] = useState('GoPay');
  const [trxDate, setTrxDate] = useState(new Date().toISOString().split('T')[0]);

  // File form state
  const [fileName, setFileName] = useState('');
  const [fileFolder, setFileFolder] = useState('Kuliah');
  const [fileDesc, setFileDesc] = useState('');
  const [fileTags, setFileTags] = useState('kuliah, materi');
  const [selectedFileBlob, setSelectedFileBlob] = useState<{
  name: string;
  size: number;
  mime: string;
  file: File;
} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wishlist form state
  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistDesc, setWishlistDesc] = useState('');
  const [wishlistPrice, setWishlistPrice] = useState('');
  const [wishlistSaved, setWishlistSaved] = useState('0');
  const [wishlistLink, setWishlistLink] = useState('');
  const [wishlistCategory, setWishlistCategory] = useState('Hardware');
  const [wishlistPriority, setWishlistPriority] = useState<Priority>('medium');
  const [wishlistDate, setWishlistDate] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
  console.log('TOMBOL TAMBAH SUBTASK DIKLIK');

  if (!newSubtaskInput.trim()) return;

  setTaskSubtasks(prev => {
    const updated = [...prev, newSubtaskInput.trim()];
    console.log('SUBTASK DITAMBAHKAN:', updated);
    return updated;
  });

  setNewSubtaskInput('');
};

  const handleRemoveSubtask = (index: number) => {
    setTaskSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const f = e.target.files?.[0];

  if (f) {
    setSelectedFileBlob({
      name: f.name,
      size: f.size,
      mime: f.type || 'application/octet-stream',
      file: f,
    });

    if (!fileName) {
      setFileName(f.name);
    }
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === 'task') {
      if (!taskTitle.trim()) return;
      let dueIso: string | null = null;
      if (taskDueDate) {
        dueIso = new Date(`${taskDueDate}T${taskDueTime || '23:59'}:00`).toISOString();
      }
      console.log('SUBTASK SAAT SIMPAN:', taskSubtasks);
      onAddTask({
        user_id: userId,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        category: taskCategory,
        priority: taskPriority,
        status: 'todo',
        due_at: dueIso,
        subtasks: taskSubtasks.map((st, i) => ({
          id: `sub_${Date.now()}_${i}`,
          title: st,
          completed: false,
        })),
        reminder: taskReminderEnabled && dueIso ? {
          remind_at: dueIso,
          repeat_rule: 'none',
          enabled: true,
        } : undefined,
      });
      // reset
      setTaskTitle('');
      setTaskDesc('');
      setTaskSubtasks([]);
      onClose();
    } else if (tab === 'transaction') {
      const num = parseFloat(trxAmount.replace(/[^0-9.-]+/g, ''));
      if (isNaN(num) || num <= 0) return;
      onAddTransaction({
        user_id: userId,
        type: trxType,
        amount: num,
        category: trxCategory,
        source_or_note: trxSource.trim(),
        transaction_at: trxDate || new Date().toISOString().split('T')[0],
      });
      setTrxAmount('');
      setTrxSource('');
      onClose();
    } else if (tab === 'file') {
  const name =
    fileName.trim() ||
    selectedFileBlob?.name ||
    'Dokumen_Baru.pdf';

  const tagsArray = fileTags
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  if (!selectedFileBlob?.file) {
    return;
  }

  await onAddFile({
    user_id: userId,
    name,
    storage_path: '',
    mime_type: selectedFileBlob.mime,
    size: selectedFileBlob.size,
    folder: fileFolder,
    tags: tagsArray,
    description: fileDesc.trim(),
    file: selectedFileBlob.file,
  });

  setFileName('');
  setFileDesc('');
  setSelectedFileBlob(null);
  onClose();
    } else if (tab === 'wishlist') {
      if (!wishlistTitle.trim()) return;
      const targetPrice = parseFloat(wishlistPrice.replace(/[^0-9.-]+/g, '')) || 0;
      const currentSaved = parseFloat(wishlistSaved.replace(/[^0-9.-]+/g, '')) || 0;

      onAddWishlist({
        user_id: userId,
        title: wishlistTitle.trim(),
        description: wishlistDesc.trim(),
        target_price: targetPrice,
        current_saved: currentSaved,
        link: wishlistLink.trim() || undefined,
        category: wishlistCategory,
        priority: wishlistPriority,
        target_date: wishlistDate || undefined,
      });
      setWishlistTitle('');
      setWishlistDesc('');
      setWishlistPrice('');
      setWishlistSaved('0');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#141720] border border-[#262c3b] rounded-2xl shadow-2xl text-[#d1d5db] my-8 overflow-hidden">
        {/* Header with Close */}
        <div className="p-4 sm:p-5 border-b border-[#222735] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Tambah Catatan Baru</h3>
            <p className="text-xs text-[#6b7280]">Pilih modul yang ingin dicatat secara cepat</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6b7280] hover:text-white hover:bg-[#202534] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Buttons */}
        <div className="grid grid-cols-4 p-2 gap-1 bg-[#10121a] border-b border-[#222735]">
          <button
            type="button"
            onClick={() => setTab('task')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium rounded-lg transition-colors ${
              tab === 'task'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tugas</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('transaction')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium rounded-lg transition-colors ${
              tab === 'transaction'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Keuangan</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium rounded-lg transition-colors ${
              tab === 'file'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            <FolderClosed className="w-3.5 h-3.5" />
            <span>File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('wishlist')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium rounded-lg transition-colors ${
              tab === 'wishlist'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wishlist</span>
          </button>
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {tab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Judul Tugas / Target <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selesaikan laporan tugas besar lab..."
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Deskripsi & Keterangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan pendukung atau detail tugas..."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Kategori</label>
                  <select
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Kuliah">Kuliah</option>
                    <option value="Pekerjaan">Pekerjaan</option>
                    <option value="Riset">Riset</option>
                    <option value="Pribadi">Pribadi</option>
                    <option value="Kesehatan">Kesehatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Prioritas</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Tenggat Tanggal</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Jam Deadline</label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={e => setTaskDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Subtasks breakdown */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Pecah Target Jadi Subtugas Kecil (Opsional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Tambah langkah kecil..."
                    value={newSubtaskInput}
                    onChange={e => setNewSubtaskInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 rounded-lg bg-[#202534] border border-[#2b3345] text-xs text-white hover:bg-[#272e40] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {taskSubtasks.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {taskSubtasks.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 px-2.5 rounded bg-[#181c26] text-xs text-slate-300"
                      >
                        <span className="truncate">{st}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(idx)}
                          className="text-[#6b7280] hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reminder toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181c26] border border-[#222735]">
                <div className="text-xs">
                  <span className="font-medium text-white block">Aktifkan Reminder Alarm</span>
                  <span className="text-[11px] text-[#6b7280]">Peringatan audio & notifikasi sebelum batas waktu</span>
                </div>
                <input
                  type="checkbox"
                  checked={taskReminderEnabled}
                  onChange={e => setTaskReminderEnabled(e.target.checked)}
                  className="rounded border-[#2b3345] text-emerald-500 focus:ring-emerald-500 bg-[#1a1e28] w-4 h-4 cursor-pointer"
                />
              </div>
            </>
          )}

          {tab === 'transaction' && (
            <>
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#10121a] rounded-lg border border-[#222735]">
                <button
                  type="button"
                  onClick={() => {
                    setTrxType('expense');
                    setTrxCategory('Makanan');
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    trxType === 'expense'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrxType('income');
                    setTrxCategory('Gaji');
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    trxType === 'income'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Nominal (Rp) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#6b7280] font-mono">Rp</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="0"
                    value={trxAmount}
                    onChange={e => setTrxAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Kategori</label>
                  <select
                    value={trxCategory}
                    onChange={e => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {trxType === 'expense' ? (
                      <>
                        <option value="Makanan">Makanan & Minuman</option>
                        <option value="Tagihan">Tagihan & Kos</option>
                        <option value="Transport">Transportasi</option>
                        <option value="Belanja">Belanja & Kebutuhan</option>
                        <option value="Pendidikan">Pendidikan & Buku</option>
                        <option value="Hiburan">Hiburan & Self-Reward</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Gaji">Gaji Utama</option>
                        <option value="Freelance">Freelance & Project</option>
                        <option value="Investasi">Investasi / Dividen</option>
                        <option value="Hadiah">Hadiah / Transfer</option>
                        <option value="Lainnya">Pemasukan Lain</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={trxDate}
                    onChange={e => setTrxDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Sumber Rekening / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BCA, GoPay, Tunai, atau Catatan..."
                  value={trxSource}
                  onChange={e => setTrxSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {tab === 'file' && (
            <>
              {/* Drag & Drop / File Input Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2b3345] hover:border-emerald-500/50 bg-[#161a24] rounded-xl p-5 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className="w-6 h-6 mx-auto mb-2 text-[#6b7280]" />
                <p className="text-xs font-medium text-white">
                  {selectedFileBlob ? selectedFileBlob.name : 'Pilih file atau seret ke sini'}
                </p>
                <p className="text-[11px] text-[#6b7280] mt-1">
                  {selectedFileBlob
                    ? `Ukuran: ${(selectedFileBlob.size / 1024).toFixed(1)} KB`
                    : 'PDF, DOCX, PPTX, JPG, PNG, ZIP hingga 25MB'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Nama Dokumen / Berkas
                </label>
                <input
                  type="text"
                  placeholder="Nama file..."
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Folder / Modul</label>
                  <select
                    value={fileFolder}
                    onChange={e => setFileFolder(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Kuliah">Kuliah & Materi</option>
                    <option value="Pekerjaan">Pekerjaan & Karir</option>
                    <option value="Sertifikat">Sertifikat Resmi</option>
                    <option value="Referensi">Referensi & Riset</option>
                    <option value="Pribadi">Pribadi / Arsip</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Tags (pisahkan koma)</label>
                  <input
                    type="text"
                    placeholder="kuliah, slide, semester6"
                    value={fileTags}
                    onChange={e => setFileTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Deskripsi Berkas</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat isi berkas atau catatan penggunaan..."
                  value={fileDesc}
                  onChange={e => setFileDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </>
          )}

          {tab === 'wishlist' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Nama Barang / Impian <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Monitor 27 4K IPS..."
                  value={wishlistTitle}
                  onChange={e => setWishlistTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                    Target Harga (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={wishlistPrice}
                    onChange={e => setWishlistPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Tabungan Terkumpul</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={wishlistSaved}
                    onChange={e => setWishlistSaved(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Kategori</label>
                  <select
                    value={wishlistCategory}
                    onChange={e => setWishlistCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hardware">Hardware / Elektronik</option>
                    <option value="Buku & Belajar">Buku & Kursus</option>
                    <option value="Pakaian">Pakaian / Gaya Hidup</option>
                    <option value="Kamera">Kamera & Audio</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Prioritas</label>
                  <select
                    value={wishlistPriority}
                    onChange={e => setWishlistPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                    <option value="urgent">Mendesak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Link Toko / Produk</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={wishlistLink}
                    onChange={e => setWishlistLink(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Target Tanggal</label>
                  <input
                    type="date"
                    value={wishlistDate}
                    onChange={e => setWishlistDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Keterangan / Alasan</label>
                <textarea
                  rows={2}
                  placeholder="Mengapa barang ini penting atau spesifikasi khusus..."
                  value={wishlistDesc}
                  onChange={e => setWishlistDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#1a1e28] border border-[#282f40] rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#222735]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#2b3345] text-xs font-medium text-[#9ca3af] hover:text-white hover:bg-[#202534] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-[#0d0f12] text-xs font-semibold hover:bg-emerald-400 transition-colors shadow-sm"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
