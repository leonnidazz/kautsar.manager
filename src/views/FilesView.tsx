import React, { useState, useMemo } from 'react';
import {
  Upload,
  Search,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File as FileIcon,
  Download,
  Eye,
  Trash2,
  FolderClosed,
  X,
} from 'lucide-react';
import { FileItem } from '../types';
import { formatFileSize, formatDateIndo } from '../utils/formatters';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

interface FilesViewProps {
  files: FileItem[];
  openQuickAdd: () => void;
  onDeleteFile: (id: string) => void;
  previewFile: FileItem | null;
  setPreviewFile: (file: FileItem | null) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  openQuickAdd,
  onDeleteFile,
  previewFile,
  setPreviewFile,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract all distinct folders
  const folders = useMemo(() => {
    const set = new Set<string>();

    files.forEach(file => {
      set.add(file.folder);
    });

    return Array.from(set);
  }, [files]);

  // Extract all distinct tags
  const allTags = useMemo(() => {
    const set = new Set<string>();

    files.forEach(file => {
      file.tags.forEach(tag => {
        set.add(tag);
      });
    });

    return Array.from(set);
  }, [files]);

  // Filter files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      if (
        selectedFolder !== 'all' &&
        file.folder !== selectedFolder
      ) {
        return false;
      }

      if (
        selectedTag !== 'all' &&
        !file.tags.includes(selectedTag)
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();

        const matchName = file.name
          .toLowerCase()
          .includes(q);

        const matchDesc = file.description
          ?.toLowerCase()
          .includes(q);

        const matchTags = file.tags.some(tag =>
          tag.toLowerCase().includes(q)
        );

        if (!matchName && !matchDesc && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [
    files,
    selectedFolder,
    selectedTag,
    searchQuery,
  ]);

  // File icon
  const getFileIcon = (mime: string, name: string) => {
    if (
      mime.includes('image') ||
      /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)
    ) {
      return (
        <FileImage className="w-5 h-5 text-emerald-400" />
      );
    }

    if (
      mime.includes('pdf') ||
      /\.pdf$/i.test(name)
    ) {
      return (
        <FileText className="w-5 h-5 text-rose-400" />
      );
    }

    if (
      mime.includes('zip') ||
      mime.includes('compressed') ||
      /\.(zip|rar|7z|tar)$/i.test(name)
    ) {
      return (
        <FileArchive className="w-5 h-5 text-amber-400" />
      );
    }

    if (
      mime.includes('javascript') ||
      mime.includes('json') ||
      /\.(ts|tsx|js|jsx|py|json|html)$/i.test(name)
    ) {
      return (
        <FileCode className="w-5 h-5 text-sky-400" />
      );
    }

    return (
      <FileIcon className="w-5 h-5 text-slate-400" />
    );
  };

  // Real download handler
  const handleDownload = async (file: FileItem) => {
    try {
      if (!file.storage_path) {
        throw new Error(
          'File tidak memiliki storage path'
        );
      }

      const url =
        `${API_BASE_URL}${file.storage_path}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil file (${response.status})`
        );
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = blobUrl;
      a.download = file.name;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(
        'DOWNLOAD FILE ERROR:',
        error
      );

      alert(
        'File tidak dapat didownload.'
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#222631]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            File, Materi Kuliah & Berkas
          </h1>

          <p className="text-xs text-[#9ca3af] mt-0.5">
            Penyimpanan PDF modul, slide kuliah,
            tugas besar, dan sertifikat terorganisir
            per folder.
          </p>
        </div>

        <button
          onClick={openQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0d0f12] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload File Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        {/* Folder Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141720] border border-[#222735] rounded-xl overflow-x-auto text-xs">

          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedFolder === 'all'
                ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            Semua Folder ({files.length})
          </button>

          {folders.map(folder => {
            const count = files.filter(
              file => file.folder === folder
            ).length;

            return (
              <button
                key={folder}
                onClick={() =>
                  setSelectedFolder(folder)
                }
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedFolder === folder
                    ? 'bg-[#1e2330] text-emerald-400 font-semibold shadow-sm'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                {folder} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#6b7280] absolute left-3 top-2.5" />

          <input
            type="text"
            placeholder="Cari nama, tag, atau deskripsi..."
            value={searchQuery}
            onChange={e =>
              setSearchQuery(e.target.value)
            }
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#141720] border border-[#222735] rounded-lg text-white placeholder-[#6b7280] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 text-xs flex-wrap">

          <span className="text-[11px] text-[#6b7280]">
            Tag:
          </span>

          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              selectedTag === 'all'
                ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                : 'text-[#6b7280] hover:text-white bg-[#141720]'
            }`}
          >
            Semua Tag
          </button>

          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() =>
                setSelectedTag(tag)
              }
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                selectedTag === tag
                  ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                  : 'text-[#6b7280] hover:text-white bg-[#141720]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141720] border border-[#222735]">

          <FolderClosed className="w-8 h-8 mx-auto text-[#374154] mb-2" />

          <p className="text-sm font-medium text-white">
            Tidak ada file yang ditemukan
          </p>

          <p className="text-xs text-[#6b7280] mt-1">
            Klik tombol "Upload File Baru" untuk
            menambahkan modul materi atau dokumen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="p-4 rounded-xl bg-[#141720] border border-[#242937] hover:border-[#353e52] flex flex-col justify-between transition-all group"
            >

              {/* Card Content */}
              <div>

                <div className="flex items-start justify-between gap-3 mb-2">

                  <div className="flex items-center gap-2.5 min-w-0">

                    <div className="w-9 h-9 rounded-lg bg-[#181c26] border border-[#272e3f] flex items-center justify-center shrink-0">
                      {getFileIcon(
                        file.mime_type,
                        file.name
                      )}
                    </div>

                    <div className="min-w-0">

                      <h3
                        onClick={() =>
                          setPreviewFile(file)
                        }
                        className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors truncate cursor-pointer"
                        title={file.name}
                      >
                        {file.name}
                      </h3>

                      <p className="text-[11px] text-[#6b7280]">
                        {file.folder} ·{' '}
                        {formatFileSize(file.size)}
                      </p>

                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onDeleteFile(file.id)
                    }
                    className="text-[#6b7280] hover:text-rose-400 p-1 rounded hover:bg-[#1f2432] transition-colors shrink-0"
                    title="Hapus Berkas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

                {file.description && (
                  <p className="text-[11px] text-[#9ca3af] line-clamp-2 mt-1 leading-relaxed">
                    {file.description}
                  </p>
                )}

                {file.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#6b7280] mt-3 flex-wrap">

                    {file.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}

                  </div>
                )}

              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#1e2330] flex items-center justify-between text-[11px]">

                <span className="text-[#6b7280]">
                  {formatDateIndo(
                    file.created_at
                  )}
                </span>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      setPreviewFile(file)
                    }
                    className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-[#181c26] hover:bg-[#202534] transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Buka</span>
                  </button>

                  <button
                    onClick={() =>
                      handleDownload(file)
                    }
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh</span>
                  </button>

                </div>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">

          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#141720] border border-[#272d3c] rounded-2xl p-5 shadow-2xl text-slate-200">

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#222735]">

              <div className="flex items-center gap-2.5 min-w-0">

                <div className="w-8 h-8 rounded-lg bg-[#181c26] border border-[#282f40] flex items-center justify-center text-emerald-400 shrink-0">
                  {getFileIcon(
                    previewFile.mime_type,
                    previewFile.name
                  )}
                </div>

                <div className="min-w-0">

                  <h3 className="text-sm font-semibold text-white truncate">
                    {previewFile.name}
                  </h3>

                  <p className="text-xs text-[#6b7280]">
                    {previewFile.folder} ·{' '}
                    {formatFileSize(
                      previewFile.size
                    )}{' '}
                    ·{' '}
                    {formatDateIndo(
                      previewFile.created_at
                    )}
                  </p>

                </div>
              </div>

              <button
                onClick={() =>
                  setPreviewFile(null)
                }
                className="text-[#6b7280] hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            {/* Preview Body */}
            <div className="my-4 rounded-xl bg-[#0f1116] border border-[#1e2330] overflow-hidden">

              {/* PDF */}
              {previewFile.storage_path &&
              previewFile.mime_type ===
                'application/pdf' ? (

                <div className="h-[65vh] w-full bg-black">

                  <iframe
                    src={`${API_BASE_URL}${previewFile.storage_path}`}
                    title={previewFile.name}
                    className="w-full h-full border-0"
                  />

                </div>

              ) : previewFile.storage_path &&
                previewFile.mime_type.startsWith(
                  'image/'
                ) ? (

                /* IMAGE */
                <div className="max-h-[65vh] min-h-[300px] flex items-center justify-center overflow-auto bg-black/50 p-4">

                  <img
                    src={`${API_BASE_URL}${previewFile.storage_path}`}
                    alt={previewFile.name}
                    className="max-h-[60vh] max-w-full object-contain"
                  />

                </div>

              ) : (

                /* OTHER FILE */
                <div className="p-10 text-center text-[#6b7280]">

                  <FileText className="w-14 h-14 mx-auto text-[#2b3345] mb-3" />

                  <p className="text-white font-medium text-sm">
                    File siap dibuka
                  </p>

                  <p className="text-xs text-[#6b7280] mt-2 break-all">
                    {previewFile.name}
                  </p>

                  <p className="text-[10px] text-[#4b5563] mt-2 break-all">
                    {previewFile.storage_path}
                  </p>

                  <p className="text-[11px] text-[#6b7280] mt-4">
                    Format ini belum memiliki preview
                    langsung di browser.
                  </p>

                </div>
              )}

            </div>

            {/* Description */}
            <div className="mb-4">

              <span className="text-[#6b7280] block text-[11px]">
                Keterangan & Deskripsi:
              </span>

              <p className="text-slate-300 mt-0.5 leading-relaxed">
                {previewFile.description ||
                  'Tidak ada deskripsi berkas.'}
              </p>

            </div>

            {/* Tags */}
            {previewFile.tags.length > 0 && (
              <div className="mb-4">

                <span className="text-[#6b7280] block text-[11px]">
                  Tags:
                </span>

                <div className="flex gap-1.5 mt-1 flex-wrap">

                  {previewFile.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-emerald-400"
                    >
                      #{tag}
                    </span>
                  ))}

                </div>

              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#222735]">

              <span className="text-[11px] text-[#6b7280]">
                Tersimpan di Object Storage Local
              </span>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setPreviewFile(null)
                  }
                  className="px-3.5 py-1.5 rounded-lg border border-[#2b3345] text-xs text-[#9ca3af] hover:text-white"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDownload(previewFile)
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-[#0d0f12] text-xs font-semibold hover:bg-emerald-400 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Berkas</span>
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};