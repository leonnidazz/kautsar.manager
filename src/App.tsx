import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  Task,
  Transaction,
  FileItem,
  WishlistItem,
  UserProfile,
} from './types';

import { StorageService } from './services/storage';
import { NotificationService } from './services/notification';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileNav } from './components/MobileNav';
import { QuickAddModal } from './components/QuickAddModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ConfirmationModal } from './components/ConfirmationModal';

import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { FinanceView } from './views/FinanceView';
import { FilesView } from './views/FilesView';
import { WishlistView } from './views/WishlistView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>('dashboard');

  // =========================================================
  // DATA STATES
  // =========================================================

  const [profile, setProfile] =
    useState<UserProfile>(() =>
      StorageService.getProfile()
    );

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [files, setFiles] =
    useState<FileItem[]>([]);

  const [wishlist, setWishlist] =
    useState<WishlistItem[]>(() =>
      StorageService.getWishlist()
    );

  // =========================================================
  // UI MODALS
  // =========================================================

  const [isQuickAddOpen, setIsQuickAddOpen] =
    useState(false);

  const [quickAddTab, setQuickAddTab] =
    useState<
      'task' |
      'transaction' |
      'file' |
      'wishlist'
    >('task');

  const [quickAddTaskCategory, setQuickAddTaskCategory] =
    useState('Pribadi');

  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [previewFile, setPreviewFile] =
    useState<FileItem | null>(null);

  // =========================================================
  // SYNC & NOTIFICATION
  // =========================================================

  const [isSyncing, setIsSyncing] =
    useState(false);

  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(() =>
      NotificationService.hasPermission()
    );

  // =========================================================
  // CONFIRMATION MODAL
  // =========================================================

  const [confirmDialog, setConfirmDialog] =
    useState<{
      isOpen: boolean;
      title: string;
      message: string;
      confirmLabel?: string;
      onConfirm: () => void;
    }>({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
    });

  // =========================================================
  // RELOAD DATA
  // =========================================================

  const reloadData = useCallback(async () => {
    setProfile(
      StorageService.getProfile()
    );

    setTasks(
      await StorageService.getTasks()
    );

    setTransactions(
      await StorageService.getTransactions()
    );

    setFiles(
      await StorageService.getFiles()
    );

    setWishlist(
      StorageService.getWishlist()
    );
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // =========================================================
  // KEYBOARD SHORTCUT
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'j'
      ) {
        e.preventDefault();
        setIsQuickAddOpen(prev => !prev);
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, []);

  // =========================================================
  // NOTIFICATION
  // =========================================================

  const handleRequestNotification =
    async () => {
      const granted =
        await NotificationService.requestPermission();

      setHasNotificationPermission(
        granted
      );

      if (granted) {
        NotificationService.playAlertSound();

        NotificationService.sendNotification(
          'Notifikasi Diaktifkan',
          {
            body: 'Personal OS siap mengingatkan jadwal deadline dan target harian Anda.',
          }
        );
      }
    };

  // =========================================================
  // SYNC
  // =========================================================

  const handleSync = () => {
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      reloadData();
    }, 600);
  };

  // =========================================================
  // QUICK ADD
  // =========================================================

  const handleOpenQuickAddWithTab = (
    tab:
      | 'task'
      | 'transaction'
      | 'file'
      | 'wishlist',
    taskCategory = 'Pribadi'
  ) => {
    setQuickAddTab(tab);
    setQuickAddTaskCategory(
      taskCategory
    );
    setIsQuickAddOpen(true);
  };

  // Quick Add dari tombol global berdasarkan halaman aktif.
  //
  // Cashflow -> Tugas kategori Keuangan
  // File     -> Tugas kategori File
  // Wishlist -> Tugas kategori Wishlist
  // Tugas    -> Tugas kategori Pribadi
  // Dashboard/Settings -> Tugas kategori Pribadi
  const handleOpenContextQuickAdd = () => {
    const categoryMap: Record<
      string,
      string
    > = {
      dashboard: 'Pribadi',
      tasks: 'Pribadi',
      finance: 'Keuangan',
      files: 'File',
      wishlist: 'Wishlist',
      settings: 'Pribadi',
    };

    setQuickAddTab('task');

    setQuickAddTaskCategory(
      categoryMap[activeTab] ||
        'Pribadi'
    );

    setIsQuickAddOpen(true);
  };

  // =========================================================
  // TASK ACTIONS
  // =========================================================

  const handleAddTask = async (
    taskData: Omit<
      Task,
      'id' |
      'created_at' |
      'completed_at'
    >
  ) => {
    await StorageService.saveTask(
      taskData
    );

    await reloadData();

    NotificationService.playAlertSound();
  };

  const handleUpdateTask = async (
    task: Task
  ) => {
    await StorageService.updateTask(
      task
    );

    await reloadData();
  };

  const handleToggleTask = async (
    id: string
  ) => {
    const updated =
      await StorageService.toggleTaskStatus(
        id
      );

    if (
      updated?.status ===
      'completed'
    ) {
      NotificationService.playAlertSound();
    }

    await reloadData();
  };

  const handleToggleSubtask = async (
    taskId: string,
    subtaskId: string
  ) => {
    await StorageService.toggleSubtask(
      taskId,
      subtaskId
    );

    await reloadData();
  };

  const handleDeleteTask = (
    id: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Tugas',
      message:
        'Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',

      onConfirm: async () => {
        await StorageService.deleteTask(
          id
        );

        await reloadData();
      },
    });
  };

  // =========================================================
  // TRANSACTION ACTIONS
  // =========================================================

  const handleAddTransaction = async (
    trxData: Omit<
      Transaction,
      'id' | 'created_at'
    >
  ) => {
    await StorageService.saveTransaction(
      trxData
    );

    await reloadData();

    NotificationService.playAlertSound();
  };

  const handleDeleteTransaction = (
    id: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Transaksi',
      message:
        'Apakah Anda yakin ingin menghapus catatan transaksi ini dari ledger keuangan?',
      confirmLabel: 'Hapus Transaksi',

      onConfirm: async () => {
        await StorageService.deleteTransaction(
          id
        );

        await reloadData();
      },
    });
  };

  // =========================================================
  // FILE ACTIONS
  // =========================================================

  const handleAddFile = async (
    fileData: Omit<
      FileItem,
      'id' | 'created_at'
    > & {
      file: File;
    }
  ) => {
    await StorageService.uploadFile(
      fileData
    );

    await reloadData();
  };

  const handleDeleteFile = (
    id: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Berkas',
      message:
        'Apakah Anda yakin ingin menghapus berkas ini dari daftar file dan materi belajar?',
      confirmLabel: 'Hapus Berkas',

      onConfirm: async () => {
        await StorageService.deleteFile(
          id
        );

        if (
          previewFile?.id === id
        ) {
          setPreviewFile(null);
        }

        await reloadData();
      },
    });
  };

  // =========================================================
  // WISHLIST ACTIONS
  // =========================================================

  const handleAddWishlist = (
    itemData: Omit<
      WishlistItem,
      | 'id'
      | 'created_at'
      | 'completed_at'
      | 'is_completed'
    >
  ) => {
    StorageService.saveWishlistItem({
      ...itemData,
      is_completed:
        itemData.current_saved >=
        itemData.target_price,
    });

    reloadData();
  };

  const handleToggleWishlistCompleted = (
    id: string
  ) => {
    const updated =
      StorageService.toggleWishlistCompleted(
        id
      );

    if (updated?.is_completed) {
      NotificationService.playAlertSound();
    }

    reloadData();
  };

  const handleAddSavingsToWishlist = (
    id: string,
    amount: number
  ) => {
    StorageService.addSavingsToWishlist(
      id,
      amount
    );

    reloadData();
  };

  const handleDeleteWishlist = (
    id: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Wishlist',
      message:
        'Apakah Anda yakin ingin menghapus target wishlist ini?',
      confirmLabel: 'Hapus Wishlist',

      onConfirm: () => {
        StorageService.deleteWishlistItem(
          id
        );

        reloadData();
      },
    });
  };

  // =========================================================
  // RESET DATA
  // =========================================================

  const handleResetSeed = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset ke Data Awal',
      message:
        'Seluruh data tugas, transaksi, dan wishlist akan dikembalikan ke data contoh awal. Lanjutkan?',
      confirmLabel: 'Reset Sekarang',

      onConfirm: () => {
        StorageService.resetToDefaultSeed();
        reloadData();
      },
    });
  };

  // =========================================================
  // BADGES
  // =========================================================

  const now = new Date();

  const todayStr =
    now.toISOString().split('T')[0];

  const tasksDueToday =
    tasks.filter(
      t =>
        t.status !==
          'completed' &&
        t.due_at &&
        t.due_at.startsWith(
          todayStr
        )
    ).length;

  const pendingWishlistCount =
    wishlist.filter(
      w => !w.is_completed
    ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e2e5eb] flex flex-col md:flex-row antialiased">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openQuickAdd={
          handleOpenContextQuickAdd
        }
        openSearch={() =>
          setIsSearchOpen(true)
        }
        profile={profile}
        counts={{
          tasksDueToday,
          pendingWishlist:
            pendingWishlistCount,
        }}
      />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">

        {/* TOP BAR */}

        <TopBar
          activeTab={activeTab}
          openQuickAdd={
            handleOpenContextQuickAdd
          }
          openSearch={() =>
            setIsSearchOpen(true)
          }
          onSync={handleSync}
          isSyncing={isSyncing}
          hasNotificationPermission={
            hasNotificationPermission
          }
          onRequestNotification={
            handleRequestNotification
          }
        />

        {/* ===================================================
            MAIN VIEW
        =================================================== */}

        <main className="flex-1 overflow-x-hidden">

          {/* DASHBOARD */}

          {activeTab ===
            'dashboard' && (
            <DashboardView
              tasks={tasks}
              transactions={
                transactions
              }
              files={files}
              wishlist={wishlist}
              profile={profile}
              setActiveTab={
                setActiveTab
              }
              openQuickAddWithTab={
                handleOpenQuickAddWithTab
              }
              onToggleTask={
                handleToggleTask
              }
              onSelectFileForPreview={
                setPreviewFile
              }
            />
          )}

          {/* TASKS */}

          {activeTab ===
            'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={
                handleToggleTask
              }
              onToggleSubtask={
                handleToggleSubtask
              }
              onDeleteTask={
                handleDeleteTask
              }
              openQuickAdd={() =>
                handleOpenQuickAddWithTab(
                  'task',
                  'Pribadi'
                )
              }
              onUpdateTask={
                handleUpdateTask
              }
            />
          )}

          {/* FINANCE */}

          {activeTab ===
            'finance' && (
            <FinanceView
              transactions={
                transactions
              }

              /*
               * Tombol khusus Cashflow:
               * langsung membuka FORM TRANSAKSI.
               */
              openQuickAdd={() =>
                handleOpenQuickAddWithTab(
                  'transaction'
                )
              }

              onDeleteTransaction={
                handleDeleteTransaction
              }
            />
          )}

          {/* FILES */}

          {activeTab ===
            'files' && (
            <FilesView
              files={files}
              openQuickAdd={() =>
                handleOpenQuickAddWithTab(
                  'file'
                )
              }
              onDeleteFile={
                handleDeleteFile
              }
              previewFile={
                previewFile
              }
              setPreviewFile={
                setPreviewFile
              }
            />
          )}

          {/* WISHLIST */}

          {activeTab ===
            'wishlist' && (
            <WishlistView
              wishlist={wishlist}
              openQuickAdd={() =>
                handleOpenQuickAddWithTab(
                  'wishlist'
                )
              }
              onToggleCompleted={
                handleToggleWishlistCompleted
              }
              onAddSavings={
                handleAddSavingsToWishlist
              }
              onDeleteWishlist={
                handleDeleteWishlist
              }
            />
          )}

          {/* SETTINGS */}

          {activeTab ===
            'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={p => {
                const updated =
                  StorageService.updateProfile(
                    p
                  );

                setProfile(updated);
              }}
              onResetSeed={
                handleResetSeed
              }
              onDataImported={
                reloadData
              }
              taskCount={
                tasks.length
              }
              trxCount={
                transactions.length
              }
              fileCount={
                files.length
              }
              wishlistCount={
                wishlist.length
              }
            />
          )}

        </main>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openQuickAdd={
          handleOpenContextQuickAdd
        }
        taskDueCount={
          tasksDueToday
        }
      />

      {/* =====================================================
          QUICK ADD MODAL
      ===================================================== */}

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() =>
          setIsQuickAddOpen(false)
        }

        /*
         * Tab selalu diberikan dari halaman
         * yang sedang aktif / tombol yang diklik.
         */
        defaultTab={
          quickAddTab
        }

        /*
         * Kategori tugas juga mengikuti
         * halaman yang sedang aktif.
         */
        defaultTaskCategory={
          quickAddTaskCategory
        }

        onAddTask={
          handleAddTask
        }

        onAddTransaction={
          handleAddTransaction
        }

        onAddFile={
          handleAddFile
        }

        onAddWishlist={
          handleAddWishlist
        }

        userId={profile.id}
      />

      {/* =====================================================
          GLOBAL SEARCH
      ===================================================== */}

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() =>
          setIsSearchOpen(false)
        }
        tasks={tasks}
        transactions={
          transactions
        }
        files={files}
        wishlist={wishlist}
        onNavigateToTab={tab =>
          setActiveTab(tab)
        }
      />

      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      <ConfirmationModal
        isOpen={
          confirmDialog.isOpen
        }
        onClose={() =>
          setConfirmDialog(
            prev => ({
              ...prev,
              isOpen: false,
            })
          )
        }
        onConfirm={
          confirmDialog.onConfirm
        }
        title={
          confirmDialog.title
        }
        message={
          confirmDialog.message
        }
        confirmLabel={
          confirmDialog.confirmLabel
        }
      />

    </div>
  );
}