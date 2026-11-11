import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  File, 
  Trash2, 
  Download, 
  CheckCircle, 
  Eye, 
  X, 
  BookOpen,
  Music,
  Video,
  Archive,
  FileSpreadsheet,
  FileCode,
  Layers,
  Plus
} from 'lucide-react';
import { VaultFile } from '../types';
import { formatBytes } from '../services/storage';

interface Props {
  files: VaultFile[];
  onAddFiles: (files: VaultFile[]) => void;
  onDeleteFile: (id: string) => void;
}

interface StagedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  notes?: string;
}

export const FileVault: React.FC<Props> = ({ files, onAddFiles, onDeleteFile }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [previewingFile, setPreviewingFile] = useState<VaultFile | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    const readers = rawFiles.map(file => {
      return new Promise<StagedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: 'staged_f_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            dataUrl: e.target?.result as string,
            notes: ''
          });
        };
        // For large files (> 15MB), warn user or read as data URL
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newStaged => {
      setStagedFiles(prev => [...prev, ...newStaged]);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveStaged = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveAllStaged = () => {
    if (stagedFiles.length === 0) return;

    const newVaultFiles: VaultFile[] = stagedFiles.map(f => ({
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: f.name,
      type: f.type,
      size: f.size,
      dataUrl: f.dataUrl,
      createdAt: new Date().toISOString(),
      notes: f.notes?.trim() || undefined
    }));

    onAddFiles(newVaultFiles);
    setSuccessMessage(`تم رفع وحفظ (${newVaultFiles.length}) ملفات بنجاح في الخزنة!`);
    setStagedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  const handleCancelStaged = () => {
    setStagedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadFile = (file: VaultFile) => {
    if (!file.dataUrl) {
      alert('محتوى الملف غير متاح للتحميل المباشر.');
      return;
    }
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFileBadgeAndIcon = (fileName: string, mimeType?: string) => {
    const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    const lower = fileName.toLowerCase();

    // PDF
    if (lower.endsWith('.pdf')) {
      return {
        icon: <FileText className="w-5 h-5 text-red-400" />,
        badge: <span className="p-1 px-2 rounded bg-red-950/80 border border-red-500/60 text-red-300 font-bold text-[10px]">{ext}</span>
      };
    }
    // Office / Word
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      return {
        icon: <FileText className="w-5 h-5 text-blue-400" />,
        badge: <span className="p-1 px-2 rounded bg-blue-950/80 border border-blue-500/60 text-blue-300 font-bold text-[10px]">{ext}</span>
      };
    }
    // Excel / Sheets
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      return {
        icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
        badge: <span className="p-1 px-2 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-[10px]">{ext}</span>
      };
    }
    // Audio
    if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg') || lower.endsWith('.m4a') || mimeType?.includes('audio')) {
      return {
        icon: <Music className="w-5 h-5 text-purple-400" />,
        badge: <span className="p-1 px-2 rounded bg-purple-950/80 border border-purple-500/60 text-purple-300 font-bold text-[10px]">{ext}</span>
      };
    }
    // Video
    if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.mkv') || lower.endsWith('.webm') || mimeType?.includes('video')) {
      return {
        icon: <Video className="w-5 h-5 text-rose-400" />,
        badge: <span className="p-1 px-2 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 font-bold text-[10px]">{ext}</span>
      };
    }
    // Archive / Compressed
    if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z') || lower.endsWith('.tar') || lower.endsWith('.gz')) {
      return {
        icon: <Archive className="w-5 h-5 text-amber-400" />,
        badge: <span className="p-1 px-2 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold text-[10px]">{ext}</span>
      };
    }
    // Code / Text
    if (lower.endsWith('.txt') || lower.endsWith('.json') || lower.endsWith('.js') || lower.endsWith('.py') || lower.endsWith('.html')) {
      return {
        icon: <FileCode className="w-5 h-5 text-sky-400" />,
        badge: <span className="p-1 px-2 rounded bg-sky-950/80 border border-sky-500/60 text-sky-300 font-bold text-[10px]">{ext}</span>
      };
    }

    // Default any format
    return {
      icon: <File className="w-5 h-5 text-[#38bdf8]" />,
      badge: <span className="p-1 px-2 rounded bg-gray-800 border border-gray-600 text-gray-300 font-bold text-[10px]">{ext}</span>
    };
  };

  const handlePreview = (file: VaultFile) => {
    setPreviewingFile(file);
    if (file.dataUrl && (file.name.endsWith('.txt') || file.type.includes('text') || file.name.endsWith('.json'))) {
      try {
        const base64Index = file.dataUrl.indexOf(';base64,');
        if (base64Index !== -1) {
          const rawBase64 = file.dataUrl.substring(base64Index + 8);
          const decoded = decodeURIComponent(escape(window.atob(rawBase64)));
          setPreviewContent(decoded);
        } else {
          setPreviewContent('المحتوى النصي غير متاح للمعاينة المباشرة.');
        }
      } catch {
        setPreviewContent(file.notes || 'تعذر فك تشفير النص المباشر، يمكنك تحميل الملف للاطلاع عليه.');
      }
    } else {
      setPreviewContent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#415a77]/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#1b263b] border border-[#415a77] text-2xl">
            📄
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">رفع الملفات (مرونة كاملة لكافة الصيغ + رفع متعدد)</h3>
            <p className="text-xs text-gray-400">يدعم كافة أنواع الملفات (PDF، أوفيس، صوت، فيديو، مضغوطة، كود... دون أي قيود)</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-[#1b263b] border border-[#415a77] text-[#e0a96d] font-mono">
          {files.length} ملفات محفوظة
        </span>
      </div>

      {/* Universal Upload Dropzone (No Accept Restrictions + Multiple) */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-[#1b263b] border-2 border-dashed rounded-2xl p-6 transition text-center ${
          isDragging 
            ? 'border-[#e0a96d] bg-[#1e3a5f]/40 scale-[1.01]' 
            : 'border-[#415a77] hover:border-[#e0a96d]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
          id="file-universal-multi-input"
        />

        <label htmlFor="file-universal-multi-input" className="cursor-pointer block">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#0d1b2a] border border-[#415a77] flex items-center justify-center text-[#e0a96d] hover:scale-105 transition shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <p className="font-bold text-base sm:text-lg text-white mb-1">
            اختر ملفاً أو عدة ملفات (من أي نوع) أو اسحبها هنا
          </p>
          <p className="text-xs text-gray-300 mb-2">
            مرونة غير محدودة: PDF، Word، Excel، صوت MP3، فيديو MP4، أرشيف ZIP/RAR، برمجيات، مستندات...
          </p>

          {/* نص توضيحي واضح للمستخدم بشأن الدخول داخل المجلد */}
          <div className="max-w-md mx-auto my-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs text-center flex items-center justify-center gap-2">
            <span className="font-bold shrink-0">⚠️ ملاحظة:</span>
            <span>يرجى الدخول داخل المجلد واختيار الملفات المطلوبة، حيث لا يدعم المتصفح رفع المجلدات كاملة دفعة واحدة.</span>
          </div>

          <span className="inline-flex items-center gap-2 py-3 px-7 rounded-xl bg-[#415a77] hover:bg-[#e0a96d] hover:text-[#0d1b2a] text-white text-xs sm:text-sm font-bold transition shadow-lg mt-1">
            <Plus className="w-4 h-4" />
            <span>تصفح ملفات جهازك (ادخل المجلد وحدد الملفات معاً)</span>
          </span>
        </label>
      </div>

      {/* Staged Files Preview Before Save */}
      {stagedFiles.length > 0 && (
        <div className="bg-[#0f2137] border-2 border-[#e0a96d]/60 rounded-2xl p-5 shadow-2xl animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#415a77]/50">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#e0a96d]" />
              <h4 className="font-bold text-white text-sm sm:text-base">
                معاينة الملفات المختارة قبل الحفظ ({stagedFiles.length} ملف)
              </h4>
            </div>
            <span className="text-xs text-gray-300">
              إجمالي الحجم: <b className="font-mono text-[#e0a96d]">{formatBytes(stagedFiles.reduce((acc, curr) => acc + curr.size, 0))}</b>
            </span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto p-1">
            {stagedFiles.map((staged) => {
              const { icon, badge } = getFileBadgeAndIcon(staged.name, staged.type);
              return (
                <div
                  key={staged.id}
                  className="bg-[#1b263b] rounded-xl border border-[#415a77] p-2.5 flex items-center justify-between gap-3 shadow"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">{icon}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs truncate">{staged.name}</p>
                      <span className="text-[10px] text-gray-400 font-mono">{formatBytes(staged.size)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {badge}
                    <button
                      type="button"
                      onClick={() => handleRemoveStaged(staged.id)}
                      className="p-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition"
                      title="استبعاد"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#415a77]/50">
            <button
              type="button"
              onClick={handleSaveAllStaged}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>حفظ كل الملفات ({stagedFiles.length}) في الخزنة</span>
            </button>
            <button
              type="button"
              onClick={handleCancelStaged}
              className="py-2.5 px-4 rounded-xl bg-[#415a77]/50 hover:bg-[#415a77] text-gray-300 hover:text-white text-xs sm:text-sm transition"
            >
              إلغاء الكل
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-sm flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Saved Files List */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#e0a96d]" />
          الملفات والمستندات المحفوظة
        </h4>

        {files.length === 0 ? (
          <div className="text-center py-10 bg-[#1b263b]/40 rounded-xl border border-[#415a77]/40 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">لا توجد ملفات محفوظة في الخزنة</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {files.map((file) => {
              const { icon, badge } = getFileBadgeAndIcon(file.name, file.type);
              const isAudio = file.type.includes('audio') || file.name.match(/\.(mp3|wav|ogg|m4a)$/i);

              return (
                <div
                  key={file.id}
                  className="bg-[#1b263b] hover:bg-[#1f2d45] border border-[#415a77] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{badge}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white text-sm truncate" title={file.name}>
                          {file.name}
                        </h5>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="font-mono">{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString('ar-EG')}</span>
                        {file.notes && (
                          <>
                            <span>•</span>
                            <span className="text-[#a8dadc] truncate max-w-xs">{file.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Audio Player if audio file */}
                  {isAudio && file.dataUrl && (
                    <audio controls className="h-8 max-w-[200px] w-full accent-[#38bdf8]">
                      <source src={file.dataUrl} />
                    </audio>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-[#415a77]/40 pt-2 sm:pt-0">
                    {(file.name.endsWith('.txt') || file.name.endsWith('.json')) && (
                      <button
                        type="button"
                        onClick={() => handlePreview(file)}
                        className="py-1 px-2.5 rounded-lg bg-[#0d1b2a] hover:bg-[#415a77] text-xs text-[#38bdf8] flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        قراءة
                      </button>
                    )}
                    {file.dataUrl && (
                      <button
                        type="button"
                        onClick={() => downloadFile(file)}
                        title="تنزيل الملف"
                        className="py-1 px-2.5 rounded-lg bg-[#0d1b2a] hover:bg-[#415a77] text-xs text-gray-200 flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-[#e0a96d]" />
                        تحميل
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف الملف "${file.name}"؟`)) {
                          onDeleteFile(file.id);
                        }
                      }}
                      title="حذف الملف"
                      className="p-1.5 rounded-lg bg-[#0d1b2a] hover:bg-red-950 text-gray-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0d1b2a] border border-[#415a77] rounded-2xl shadow-2xl p-6 text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#415a77]/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#38bdf8]" />
                <h4 className="font-bold text-white text-base truncate">{previewingFile.name}</h4>
              </div>
              <button
                onClick={() => setPreviewingFile(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-auto bg-[#1b263b] p-4 rounded-xl font-mono text-xs text-gray-200 leading-relaxed whitespace-pre-wrap border border-[#415a77]/50">
              {previewContent || previewingFile.notes || 'محتوى المستند محمي ومتاح للتحميل المباشر.'}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-400">الحجم: {formatBytes(previewingFile.size)}</span>
              <button
                onClick={() => setPreviewingFile(null)}
                className="py-1.5 px-5 rounded-lg bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white text-xs font-semibold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
