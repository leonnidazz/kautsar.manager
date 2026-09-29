import { Task, Transaction, FileItem, WishlistItem, UserProfile } from '../types';
const API_BASE_URL =
  import.meta.env.VITE_API_URL || '${API_BASE_URL}';

const STORAGE_KEYS = {
  PROFILE: 'pms_profile',
  TASKS: 'pms_tasks',
  TRANSACTIONS: 'pms_transactions',
  FILES: 'pms_files',
  WISHLIST: 'pms_wishlist',
  LAST_SYNC: 'pms_last_sync',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_01h8q7k9',
  name: 'bang yazid',
  email: 'yazidmuhammadalkautsar@gmail.com',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'IDR',
  monthly_budget: 4500000,
  created_at: new Date('2026-01-15T08:00:00Z').toISOString(),
};

const SEED_TASKS: Task[] = [
  {
    id: 'tsk_01',
    user_id: 'usr_01h8q7k9',
    title: 'Selesaikan Tugas Besar Sistem Terdistribusi',
    description:
      'Implementasi Raft consensus algorithm & laporan benchmarking cluster 5 nodes.',
    category: 'Kuliah',
    priority: 'urgent',
    status: 'in_progress',
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completed_at: null,
    subtasks: [
      {
        id: 'sub_1',
        title: 'Leader election simulation',
        completed: true,
      },
      {
        id: 'sub_2',
        title: 'Log replication edge-case tests',
        completed: true,
      },
      {
        id: 'sub_3',
        title: 'Penulisan laporan & diagram arsitektur',
        completed: false,
      },
    ],
    reminder: {
      remind_at: new Date(
        Date.now() + 1000 * 60 * 60 * 6,
      ).toISOString(),
      repeat_rule: 'none',
      enabled: true,
    },
  },
  {
    id: 'tsk_02',
    user_id: 'usr_01h8q7k9',
    title: 'Review PR & Code Refactor Client Gateway',
    description:
      'Pastikan rate limiting middleware dan schema validation berjalan dengan test suite 100% pass.',
    category: 'Pekerjaan',
    priority: 'high',
    status: 'todo',
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completed_at: null,
    subtasks: [
      {
        id: 'sub_4',
        title: 'Periksa backward compatibility API v2',
        completed: false,
      },
      {
        id: 'sub_5',
        title: 'Jalankan benchmark latency',
        completed: false,
      },
    ],
  },
  {
    id: 'tsk_03',
    user_id: 'usr_01h8q7k9',
    title: 'Bayar Internet & Tagihan Kos Bulan Ini',
    description:
      'Transfer via virtual account sebelum tanggal jatuh tempo.',
    category: 'Pribadi',
    priority: 'medium',
    status: 'completed',
    due_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    completed_at: new Date(
      Date.now() - 1000 * 60 * 60 * 10,
    ).toISOString(),
    subtasks: [],
  },
  {
    id: 'tsk_04',
    user_id: 'usr_01h8q7k9',
    title: 'Persiapan Bahan Diskusi Proyek AI Personal',
    description:
      'Susun pipeline data preprocessing dan evaluasi model Gemini untuk integrasi bot.',
    category: 'Riset',
    priority: 'medium',
    status: 'todo',
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 80).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    completed_at: null,
    subtasks: [
      {
        id: 'sub_6',
        title: 'Eksperimen prompt chaining',
        completed: true,
      },
      {
        id: 'sub_7',
        title: 'Dokumentasi token cost calculation',
        completed: false,
      },
    ],
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx_01',
    user_id: 'usr_01h8q7k9',
    type: 'income',
    amount: 7500000,
    category: 'Gaji',
    source_or_note: 'Transfer Payroll PT Karya Digital Nusantara',
    transaction_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 3,
    )
      .toISOString()
      .split('T')[0],
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 3,
    ).toISOString(),
  },
  {
    id: 'trx_02',
    user_id: 'usr_01h8q7k9',
    type: 'income',
    amount: 1850000,
    category: 'Freelance',
    source_or_note: 'BCA - Honor UI/UX Design System Client',
    transaction_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 5,
    )
      .toISOString()
      .split('T')[0],
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 5,
    ).toISOString(),
  },
  {
    id: 'trx_03',
    user_id: 'usr_01h8q7k9',
    type: 'expense',
    amount: 1200000,
    category: 'Tagihan',
    source_or_note: 'Mandiri - Sewa Kamar Kos Bulan Berjalan',
    transaction_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 2,
    )
      .toISOString()
      .split('T')[0],
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 2,
    ).toISOString(),
  },
  {
    id: 'trx_04',
    user_id: 'usr_01h8q7k9',
    type: 'expense',
    amount: 375000,
    category: 'Tagihan',
    source_or_note: 'BCA VA - Langganan Internet & Cloud Hosting',
    transaction_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 2,
    )
      .toISOString()
      .split('T')[0],
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 2,
    ).toISOString(),
  },
  {
    id: 'trx_05',
    user_id: 'usr_01h8q7k9',
    type: 'expense',
    amount: 185000,
    category: 'Makanan',
    source_or_note: 'GoPay - Makan siang & kopi mingguan tim',
    transaction_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24,
    )
      .toISOString()
      .split('T')[0],
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24,
    ).toISOString(),
  },
  {
    id: 'trx_06',
    user_id: 'usr_01h8q7k9',
    type: 'expense',
    amount: 95000,
    category: 'Transport',
    source_or_note: 'GoPay - Tiket KRL & Ojek Online',
    transaction_at: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
];

const SEED_FILES: FileItem[] = [
  {
    id: 'fl_01',
    user_id: 'usr_01h8q7k9',
    name: 'Sistem-Terdistribusi-Slide-Bab-06.pdf',
    storage_path: 'kuliah/sistem-terdistribusi/slide-06.pdf',
    mime_type: 'application/pdf',
    size: 4820300,
    folder: 'Kuliah',
    tags: ['kuliah', 'raft', 'distributed-systems', 'semester-6'],
    description:
      'Slide materi perkuliahan konsensus terdistribusi dan Byzantine fault tolerance.',
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 4,
    ).toISOString(),
  },
  {
    id: 'fl_02',
    user_id: 'usr_01h8q7k9',
    name: 'Arsitektur-Personal-Management-App.docx',
    storage_path: 'proyek/dokumen/arsitektur-v1.docx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1450200,
    folder: 'Pekerjaan',
    tags: ['master-plan', 'spesifikasi', 'supabase', 'database-schema'],
    description:
      'Dokumentasi teknis master plan, ERD PostgreSQL, dan wireframe flow.',
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 2,
    ).toISOString(),
  },
  {
    id: 'fl_03',
    user_id: 'usr_01h8q7k9',
    name: 'Cloud-Computing-Certification.pdf',
    storage_path: 'sertifikat/aws-solutions-architect.pdf',
    mime_type: 'application/pdf',
    size: 2120000,
    folder: 'Sertifikat',
    tags: ['sertifikat', 'cloud', 'karir'],
    description:
      'Sertifikat resmi kompetensi arsitektur cloud tingkat associate.',
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 14,
    ).toISOString(),
  },
  {
    id: 'fl_04',
    user_id: 'usr_01h8q7k9',
    name: 'Rangkuman-UAS-Algoritma-Lanjut.pdf',
    storage_path: 'kuliah/algoritma/rangkuman-uas.pdf',
    mime_type: 'application/pdf',
    size: 3200150,
    folder: 'Kuliah',
    tags: ['kuliah', 'uas', 'algoritma', 'catatan'],
    description:
      'Catatan rumus dynamic programming, graph flow, dan complexity proofs.',
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 6,
    ).toISOString(),
  },
];

const SEED_WISHLIST: WishlistItem[] = [
  {
    id: 'wsh_01',
    user_id: 'usr_01h8q7k9',
    title: 'Monitor 27" 4K IPS 144Hz Ergonomis',
    description:
      'Monitor setup kerja coding & multitasking dengan port USB-C 90W PD charging.',
    target_price: 5200000,
    current_saved: 3800000,
    link: 'https://tokopedia.com/search?q=monitor+27+inch+4k',
    category: 'Hardware',
    priority: 'urgent',
    target_date: '2026-11-30',
    is_completed: false,
    completed_at: null,
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 20,
    ).toISOString(),
  },
  {
    id: 'wsh_02',
    user_id: 'usr_01h8q7k9',
    title: 'Mechanical Keyboard Wireless Gasket Mount',
    description:
      'Keyboard 75% tactile switches untuk pengetikan cepat dan kenyamanan pergelangan tangan.',
    target_price: 1350000,
    current_saved: 1350000,
    link: 'https://shopee.co.id/search?keyword=mechanical+keyboard+75',
    category: 'Hardware',
    priority: 'medium',
    target_date: '2026-09-15',
    is_completed: true,
    completed_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 5,
    ).toISOString(),
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 35,
    ).toISOString(),
  },
  {
    id: 'wsh_03',
    user_id: 'usr_01h8q7k9',
    title: 'Buku Designing Data-Intensive Applications',
    description:
      'Buku referensi arsitektur data Martin Kleppmann untuk pedoman sistem berskala tinggi.',
    target_price: 680000,
    current_saved: 450000,
    link: 'https://periplus.com',
    category: 'Buku & Belajar',
    priority: 'high',
    target_date: '2026-10-15',
    is_completed: false,
    completed_at: null,
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 10,
    ).toISOString(),
  },
];

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return defaultValue;
    }

    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(
      STORAGE_KEYS.LAST_SYNC,
      new Date().toISOString(),
    );
  } catch (err) {
    console.error(`Failed to store key ${key}:`, err);
  }
}

export const StorageService = {
  // =========================
  // PROFILE
  // =========================

  getProfile(): UserProfile {
    return getFromStorage<UserProfile>(
      STORAGE_KEYS.PROFILE,
      DEFAULT_PROFILE,
    );
  },

  updateProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();

    const updated = {
      ...current,
      ...profile,
    };

    setToStorage(STORAGE_KEYS.PROFILE, updated);

    return updated;
  },

  // =========================
  // TASKS - POSTGRESQL
  // =========================

  async getTasks(): Promise<Task[]> {
    const response = await fetch('${API_BASE_URL}/api/tasks');

    if (!response.ok) {
      throw new Error('Gagal mengambil tasks dari PostgreSQL');
    }

    return await response.json();
  },

  async saveTask(
    taskData: Omit<Task, 'id' | 'created_at' | 'completed_at'> & {
      id?: string;
      completed_at?: string | null;
    },
  )
  
  : Promise<Task> {
    
    const newTask: Task = {
      ...taskData,
      id:
        taskData.id ||
        `tsk_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 6)}`,
      created_at: new Date().toISOString(),
      completed_at:
        taskData.status === 'completed'
          ? taskData.completed_at || new Date().toISOString()
          : null,
    };

    const response = await fetch('${API_BASE_URL}/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    if (!response.ok) {
      throw new Error('Gagal menyimpan task ke PostgreSQL');
    }

    return await response.json();
  },
  async updateTask(task: Task): Promise<Task> {
  const response = await fetch(
    `${API_BASE_URL}/api/tasks/${encodeURIComponent(task.id)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    },
  );

  if (!response.ok) {
    throw new Error('Gagal mengupdate task di PostgreSQL');
  }

  return await response.json();
},

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error('Gagal menghapus task dari PostgreSQL');
    }
  },

  async toggleTaskStatus(id: string): Promise<Task | null> {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${encodeURIComponent(id)}/toggle`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Gagal mengubah status task');
    }

    return await response.json();
  },

  async toggleSubtask(
    taskId: string,
    subtaskId: string,
  ): Promise<Task | null> {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${encodeURIComponent(
        taskId,
      )}/subtasks/${encodeURIComponent(subtaskId)}/toggle`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Gagal mengubah subtask');
    }

    return await response.json();
  },

  // =========================
  // TRANSACTIONS
  // =========================

    // =========================
  // TRANSACTIONS
  // =========================

  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(
      '${API_BASE_URL}/api/transactions'
    );

    if (!response.ok) {
      throw new Error(
        'Gagal mengambil transactions dari PostgreSQL'
      );
    }

    return await response.json();
  },

  async saveTransaction(
    trxData: Omit<Transaction, 'id' | 'created_at'> & {
      id?: string;
    },
  ): Promise<Transaction> {
    const newTrx: Transaction = {
      ...trxData,
      id:
        trxData.id ||
        `trx_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    const response = await fetch(
      `${API_BASE_URL}/api/transactions${
        trxData.id
          ? `/${encodeURIComponent(trxData.id)}`
          : ''
      }`,
      {
        method: trxData.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrx),
      },
    );

    if (!response.ok) {
      throw new Error(
        trxData.id
          ? 'Gagal mengupdate transaction di PostgreSQL'
          : 'Gagal menyimpan transaction ke PostgreSQL',
      );
    }

    return await response.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/transactions/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new Error(
        'Gagal menghapus transaction dari PostgreSQL'
      );
    }
  },

  // =========================
  // FILES
  // =========================

  async getFiles(): Promise<FileItem[]> {
  const response = await fetch(
    '${API_BASE_URL}/api/files'
  );

  if (!response.ok) {
    throw new Error(
      'Gagal mengambil files dari PostgreSQL'
    );
  }

  const files = await response.json();

  return files.map((file: FileItem) => ({
    ...file,
    tags: Array.isArray(file.tags) ? file.tags : [],
  }));
},

async saveFile(
  fileData: Omit<FileItem, 'id' | 'created_at'> & {
    id?: string;
  },
): Promise<FileItem> {
  const newFile: FileItem = {
    ...fileData,
    id:
      fileData.id ||
      `fl_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 6)}`,
    created_at:
      fileData.id
        ? fileData.created_at || new Date().toISOString()
        : new Date().toISOString(),
  };

  const response = await fetch(
    `${API_BASE_URL}/api/files${
      fileData.id
        ? `/${encodeURIComponent(fileData.id)}`
        : ''
    }`,
    {
      method: fileData.id ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFile),
    },
  );

  if (!response.ok) {
    throw new Error(
      fileData.id
        ? 'Gagal mengupdate file di PostgreSQL'
        : 'Gagal menyimpan file ke PostgreSQL',
    );
  }

  const savedFile = await response.json();

  return {
    ...savedFile,
    tags: Array.isArray(savedFile.tags)
      ? savedFile.tags
      : [],
  };
},

async uploadFile(
  fileData: Omit<FileItem, 'id' | 'created_at' | 'dataUrl'> & {
    file: File;
  },
): Promise<FileItem> {
  const id =
    `fl_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 6)}`;

  const formData = new FormData();

  formData.append('file', fileData.file);
  formData.append('id', id);
  formData.append('user_id', fileData.user_id);
  formData.append('folder', fileData.folder || 'Umum');
  formData.append(
    'tags',
    JSON.stringify(
      Array.isArray(fileData.tags)
        ? fileData.tags
        : []
    )
  );
  formData.append(
    'description',
    fileData.description || ''
  );

  const response = await fetch(
    '${API_BASE_URL}/api/files/upload',
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gagal mengupload file: ${errorText}`
    );
  }

  const savedFile = await response.json();

  return {
    ...savedFile,
    tags: Array.isArray(savedFile.tags)
      ? savedFile.tags
      : [],
  };
},

async deleteFile(id: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/files/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(
      'Gagal menghapus file dari PostgreSQL'
    );
  }
},

  // =========================
  // WISHLIST
  // =========================

  getWishlist(): WishlistItem[] {
    const list = getFromStorage<WishlistItem[]>(
      STORAGE_KEYS.WISHLIST,
      SEED_WISHLIST,
    );

    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      setToStorage(
        STORAGE_KEYS.WISHLIST,
        SEED_WISHLIST,
      );
    }

    return list;
  },

  saveWishlistItem(
    data: Omit<
      WishlistItem,
      'id' | 'created_at' | 'completed_at'
    > & {
      id?: string;
      completed_at?: string | null;
    },
  ): WishlistItem {
    const list = this.getWishlist();

    if (data.id) {
      const idx = list.findIndex(
        (w) => w.id === data.id,
      );

      if (idx !== -1) {
        const updated: WishlistItem = {
          ...list[idx],
          ...data,
          id: list[idx].id,
          created_at: list[idx].created_at,
          completed_at: data.is_completed
            ? data.completed_at ||
              list[idx].completed_at ||
              new Date().toISOString()
            : null,
        };

        list[idx] = updated;

        setToStorage(
          STORAGE_KEYS.WISHLIST,
          list,
        );

        return updated;
      }
    }

    const newItem: WishlistItem = {
      ...data,
      id: `wsh_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 6)}`,
      created_at: new Date().toISOString(),
      completed_at: data.is_completed
        ? data.completed_at ||
          new Date().toISOString()
        : null,
    };

    list.unshift(newItem);

    setToStorage(
      STORAGE_KEYS.WISHLIST,
      list,
    );

    return newItem;
  },

  toggleWishlistCompleted(
    id: string,
  ): WishlistItem | null {
    const list = this.getWishlist();

    const item = list.find(
      (w) => w.id === id,
    );

    if (!item) {
      return null;
    }

    item.is_completed = !item.is_completed;

    if (item.is_completed) {
      item.completed_at = new Date().toISOString();

      if (item.current_saved < item.target_price) {
        item.current_saved = item.target_price;
      }
    } else {
      item.completed_at = null;
    }

    setToStorage(
      STORAGE_KEYS.WISHLIST,
      list,
    );

    return item;
  },

  addSavingsToWishlist(
    id: string,
    additionalAmount: number,
  ): WishlistItem | null {
    const list = this.getWishlist();

    const item = list.find(
      (w) => w.id === id,
    );

    if (!item) {
      return null;
    }

    item.current_saved = Math.max(
      0,
      item.current_saved + additionalAmount,
    );

    if (
      item.current_saved >= item.target_price &&
      !item.is_completed
    ) {
      item.is_completed = true;
      item.completed_at = new Date().toISOString();
    }

    setToStorage(
      STORAGE_KEYS.WISHLIST,
      list,
    );

    return item;
  },

  deleteWishlistItem(id: string): void {
    const list = this.getWishlist().filter(
      (w) => w.id !== id,
    );

    setToStorage(
      STORAGE_KEYS.WISHLIST,
      list,
    );
  },

  // =========================
  // SYNC / EXPORT / IMPORT
  // =========================

  getLastSyncTime(): string {
    return (
      localStorage.getItem(
        STORAGE_KEYS.LAST_SYNC,
      ) || new Date().toISOString()
    );
  },

  exportAllDataJSON(): string {
    const payload = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      profile: this.getProfile(),
      transactions: this.getTransactions(),
      files: this.getFiles(),
      wishlist: this.getWishlist(),
    };

    return JSON.stringify(
      payload,
      null,
      2,
    );
  },

  importDataJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      if (data.profile) {
        setToStorage(
          STORAGE_KEYS.PROFILE,
          data.profile,
        );
      }

      if (data.transactions) {
        setToStorage(
          STORAGE_KEYS.TRANSACTIONS,
          data.transactions,
        );
      }

      if (data.files) {
        setToStorage(
          STORAGE_KEYS.FILES,
          data.files,
        );
      }

      if (data.wishlist) {
        setToStorage(
          STORAGE_KEYS.WISHLIST,
          data.wishlist,
        );
      }

      return true;
    } catch (e) {
      console.error(
        'Import failed:',
        e,
      );

      return false;
    }
  },

  resetToDefaultSeed(): void {
    setToStorage(
      STORAGE_KEYS.PROFILE,
      DEFAULT_PROFILE,
    );

    setToStorage(
      STORAGE_KEYS.TASKS,
      SEED_TASKS,
    );

    setToStorage(
      STORAGE_KEYS.TRANSACTIONS,
      SEED_TRANSACTIONS,
    );

    setToStorage(
      STORAGE_KEYS.FILES,
      SEED_FILES,
    );

    setToStorage(
      STORAGE_KEYS.WISHLIST,
      SEED_WISHLIST,
    );
  },

  generateSupabaseMigrationSQL(): string {
    return `-- ========================================================
-- PERSONAL MANAGEMENT APP - SUPABASE / POSTGRESQL SCHEMA
-- ========================================================

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  avatar text,
  currency text default 'IDR',
  monthly_budget numeric default 0,
  created_at timestamp with time zone
    default timezone('utc'::text, now()) not null
);

create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id)
    on delete cascade not null,
  title text not null,
  description text,
  category text default 'Umum',
  priority text check (
    priority in ('low', 'medium', 'high', 'urgent')
  ) default 'medium',
  status text check (
    status in (
      'todo',
      'in_progress',
      'completed',
      'cancelled'
    )
  ) default 'todo',
  due_at timestamp with time zone,
  subtasks jsonb default '[]'::jsonb,
  created_at timestamp with time zone
    default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

create table if not exists public.reminders (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id)
    on delete cascade not null,
  user_id uuid references public.profiles(id)
    on delete cascade not null,
  remind_at timestamp with time zone not null,
  repeat_rule text check (
    repeat_rule in (
      'none',
      'daily',
      'weekly',
      'monthly'
    )
  ) default 'none',
  enabled boolean default true,
  created_at timestamp with time zone
    default timezone('utc'::text, now()) not null
);

create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id)
    on delete cascade not null,
  type text check (
    type in ('income', 'expense')
  ) not null,
  amount numeric not null,
  category text not null,
  source_or_note text,
  transaction_at date default current_date not null,
  created_at timestamp with time zone
    default timezone('utc'::text, now()) not null
);

create table if not exists public.files (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id)
    on delete cascade not null,
  name text not null,
  storage_path text not null,
  mime_type text not null,
  size bigint default 0,
  folder text default 'Umum',
  tags text[] default '{}',
  description text,
  created_at timestamp with time zone
    default timezone('utc'::text, now()) not null
);

create table if not exists public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id)
    on delete cascade not null,
  title text not null,
  description text,
  target_price numeric not null,
  current_saved numeric default 0,
  link text,
  category text default 'Pribadi',
  priority text check (
    priority in (
      'low',
      'medium',
      'high',
      'urgent'
    )
  ) default 'medium',
  target_date date,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone
    default timezone('utc'::text, now()) not null
);
`;
  },
};
