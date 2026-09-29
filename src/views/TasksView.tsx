import React, { useState, useMemo } from 'react';
import {
  Plus,
  Clock,
  Trash2,
  Bell,
  Pencil,
  Save,
  X,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';
import {
  formatDateIndo,
  formatTimeIndo,
  formatRelativeTime,
  getPriorityLabel,
  getStatusLabel,
} from '../utils/formatters';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (id: string) => void;
  openQuickAdd: () => void;
  onUpdateTask: (task: Task) => void;
}

type TaskFilterTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  openQuickAdd,
  onUpdateTask,
}) => {
  const [activeFilter, setActiveFilter] = useState<TaskFilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
const [editTitle, setEditTitle] = useState('');
const [editDescription, setEditDescription] = useState('');
const [editCategory, setEditCategory] = useState('');
const [editPriority, setEditPriority] = useState<Priority>('medium');
const [editDueDate, setEditDueDate] = useState('');
const [editDueTime, setEditDueTime] = useState('23:59');
  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => set.add(t.category));
    return Array.from(set);
  }, [tasks]);

  // Filter tasks based on activeFilter, category, priority
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return tasks.filter(task => {
      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Tab filter
      if (activeFilter === 'completed') {
        return task.status === 'completed';
      }
      if (activeFilter === 'today') {
        if (!task.due_at) return false;
        return task.due_at.startsWith(todayStr) && task.status !== 'completed';
      }
      if (activeFilter === 'overdue') {
        if (!task.due_at || task.status === 'completed') return false;
        return new Date(task.due_at).getTime() < now.getTime();
      }
      if (activeFilter === 'upcoming') {
        if (!task.due_at || task.status === 'completed') return false;
        return new Date(task.due_at).getTime() > now.getTime();
      }

      // 'all' tab: all tasks
      return true;
    });
  }, [tasks, activeFilter, selectedCategory, selectedPriority]);

  const toggleExpand = (id: string) => {
    setExpandedTaskIds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const handleStartEdit = (task: Task) => {
  setEditingTaskId(task.id);
  setEditTitle(task.title);
  setEditDescription(task.description);
  setEditCategory(task.category);
  setEditPriority(task.priority);

  if (task.due_at) {
    const date = new Date(task.due_at);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    setEditDueDate(`${year}-${month}-${day}`);
    setEditDueTime(
      `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes()
      ).padStart(2, '0')}`
    );
  } else {
    setEditDueDate('');
    setEditDueTime('23:59');
  }
};

const handleCancelEdit = () => {
  setEditingTaskId(null);
};

const handleSaveEdit = (task: Task) => {
  if (!editTitle.trim()) return;

  let dueIso: string | null = null;

  if (editDueDate) {
    dueIso = new Date(
      `${editDueDate}T${editDueTime || '23:59'}:00`
    ).toISOString();
  }

  const updatedTask: Task = {
    ...task,
    title: editTitle.trim(),
    description: editDescription.trim(),
    category: editCategory.trim() || 'Umum',
    priority: editPriority,
    due_at: dueIso,
  };

  onUpdateTask(updatedTask);
  setEditingTaskId(null);
};

  const handleAddInlineSubtask = (taskId: string) => {
    const title = newSubtaskInputs[taskId]?.trim();
    if (!title) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      subtasks: [
        ...task.subtasks,
        {
          id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title,
          completed: false,
        },
      ],
    };

    onUpdateTask(updatedTask);
    setNewSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const updated: Task = {
      ...task,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      subtasks:
        newStatus === 'completed'
          ? task.subtasks.map(s => ({ ...s, completed: true }))
          : task.subtasks,
    };
    onUpdateTask(updated);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#222631]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tugas, Target & Jadwal
          </h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Daftar tugas harian, target besar yang dipecah menjadi subtask, dan alarm reminder.
          </p>
        </div>
        <button
          onClick={openQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0d0f12] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#141720] border border-[#222735] rounded-xl overflow-x-auto">
          {(
            [
              { id: 'all', label: 'Semua Tugas' },
              { id: 'today', label: 'Hari Ini' },
              { id: 'upcoming', label: 'Mendatang' },
              { id: 'overdue', label: 'Terlambat' },
              { id: 'completed', label: 'Selesai' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                  : 'text-[#6b7280] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Category & Priority Dropdowns */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[#6b7280]">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#141720] border border-[#222735] text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#6b7280]">Prioritas:</span>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#141720] border border-[#222735] text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Prioritas</option>
              <option value="urgent">Mendesak</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>

          <span className="text-[#6b7280] ml-auto">
            Menampilkan {filteredTasks.length} tugas
          </span>
        </div>
      </div>

      {/* Task Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141720] border border-[#222735]">
          <CheckCircle2 className="w-8 h-8 mx-auto text-[#374154] mb-2" />
          <p className="text-sm font-medium text-white">Tidak ada tugas dalam kategori ini</p>
          <p className="text-xs text-[#6b7280] mt-1">
            Klik tombol "Tambah Tugas Baru" untuk mencatat agenda atau target kerja Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const priority = getPriorityLabel(task.priority);
            const status = getStatusLabel(task.status);
            const isExpanded = !!expandedTaskIds[task.id];
            const completedCount = task.subtasks.filter(s => s.completed).length;
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl bg-[#141720] border transition-all ${
                  isDone
                    ? 'border-[#1e2330] opacity-75'
                    : 'border-[#242937] hover:border-[#353e52]'
                }`}
              >
                {editingTaskId === task.id && (
  <div className="mb-4 p-4 rounded-xl bg-[#10131a] border border-emerald-500/30">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

      {/* Judul */}
      <div className="md:col-span-2">
        <label className="block text-[11px] text-[#9ca3af] mb-1">
          Judul Tugas
        </label>
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-[#181c26] border border-[#293042] rounded-lg text-white focus:outline-none focus:border-emerald-500"
          placeholder="Judul tugas..."
        />
      </div>

      {/* Deskripsi */}
      <div className="md:col-span-2">
        <label className="block text-[11px] text-[#9ca3af] mb-1">
          Deskripsi
        </label>
        <textarea
          value={editDescription}
          onChange={e => setEditDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-[#181c26] border border-[#293042] rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
          placeholder="Deskripsi tugas..."
        />
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-[11px] text-[#9ca3af] mb-1">
          Kategori
        </label>
        <input
          type="text"
          value={editCategory}
          onChange={e => setEditCategory(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-[#181c26] border border-[#293042] rounded-lg text-white focus:outline-none focus:border-emerald-500"
          placeholder="Kategori..."
        />
      </div>

      {/* Prioritas */}
      <div>
        <label className="block text-[11px] text-[#9ca3af] mb-1">
          Prioritas
        </label>
        <select
          value={editPriority}
          onChange={e => setEditPriority(e.target.value as Priority)}
          className="w-full px-3 py-2 text-sm bg-[#181c26] border border-[#293042] rounded-lg text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="urgent">Mendesak</option>
          <option value="high">Tinggi</option>
          <option value="medium">Sedang</option>
          <option value="low">Rendah</option>
        </select>
      </div>

      {/* Tanggal */}
      <div>
        <label className="block text-[11px] text-[#9ca3af] mb-1">
          Tanggal
        </label>
        <input
          type="date"
          value={editDueDate}
          onChange={e => setEditDueDate(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-[#181c26] border border-[#293042] rounded-lg text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Waktu */}
      <div>
        <label className="block text-[11px] text-[#9ca3af] mb-1">
          Waktu
        </label>
        <input
          type="time"
          value={editDueTime}
          onChange={e => setEditDueTime(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-[#181c26] border border-[#293042] rounded-lg text-white focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>

    {/* Tombol */}
    <div className="flex justify-end gap-2 mt-4">
      <button
        type="button"
        onClick={handleCancelEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#202534] text-[#9ca3af] hover:text-white border border-[#2c3346]"
      >
        <X className="w-3.5 h-3.5" />
        Batal
      </button>

      <button
        type="button"
        onClick={() => handleSaveEdit(task)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0d0f12]"
      >
        <Save className="w-3.5 h-3.5" />
        Simpan Perubahan
      </button>
    </div>
  </div>
)}
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Title + Description */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-[#0d0f12]'
                          : 'border-[#384154] hover:border-emerald-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <Circle className="w-3 h-3 text-transparent" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-semibold tracking-tight ${
                            isDone ? 'line-through text-[#6b7280]' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Clean Unboxed Metadata with · separator */}
                      <div className="flex items-center gap-2 text-[11px] text-[#6b7280] mt-2 flex-wrap">
                        <span className="text-slate-300">{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-medium ${priority.textClass}`}>{priority.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className={status.textClass}>{status.label}</span>

                        {task.due_at && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <Clock className="w-3 h-3 text-[#6b7280]" />
                              {formatDateIndo(task.due_at)} {formatTimeIndo(task.due_at)} ({formatRelativeTime(task.due_at)})
                            </span>
                          </>
                        )}

                        {task.reminder?.enabled && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Bell className="w-3 h-3" />
                              Alarm Aktif
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Status Dropdown & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
  type="button"
  onClick={() => handleStartEdit(task)}
  className="p-1.5 text-[#6b7280] hover:text-emerald-400 rounded hover:bg-[#202534] transition-colors"
  title="Edit Tugas"
>
  <Pencil className="w-3.5 h-3.5" />
</button>
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task, e.target.value as TaskStatus)}
                      className="px-2 py-1 text-[11px] font-medium rounded-lg bg-[#1a1e28] border border-[#293042] text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="todo">Belum Mulai</option>
                      <option value="in_progress">Berjalan</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-[#6b7280] hover:text-rose-400 rounded hover:bg-[#202534] transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Section & Progress */}
                {task.subtasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1e2330]">
                    <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1.5">
                      <span className="text-[11px]">
                        Langkah Subtugas: {completedCount}/{task.subtasks.length} Selesai
                      </span>
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Tutup rincian' : 'Buka rincian'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#1e2330] overflow-hidden mb-2">
                      <div
                        style={{
                          width: `${Math.round((completedCount / task.subtasks.length) * 100)}%`,
                        }}
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      />
                    </div>

                    {/* Expanded Subtask List */}
                    {isExpanded && (
                      <div className="space-y-1.5 pt-2 pl-2">
                        {task.subtasks.map(st => (
                          <div
                            key={st.id}
                            className="flex items-center gap-2.5 text-xs text-slate-300"
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => onToggleSubtask(task.id, st.id)}
                              className="rounded border-[#2c3346] text-emerald-500 focus:ring-emerald-500 bg-[#161a24] cursor-pointer"
                            />
                            <span className={st.completed ? 'line-through text-[#6b7280]' : ''}>
                              {st.title}
                            </span>
                          </div>
                        ))}

                        {/* Add inline subtask */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Tambah langkah baru..."
                            value={newSubtaskInputs[task.id] || ''}
                            onChange={e =>
                              setNewSubtaskInputs(prev => ({
                                ...prev,
                                [task.id]: e.target.value,
                              }))
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddInlineSubtask(task.id);
                              }
                            }}
                            className="flex-1 px-2.5 py-1 text-xs bg-[#181c26] border border-[#272e3f] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddInlineSubtask(task.id)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-[#202534] text-white hover:bg-[#282f42] border border-[#2c3346]"
                          >
                            + Tambah
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
