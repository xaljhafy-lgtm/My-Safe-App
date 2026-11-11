import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Eye, 
  X, 
  CheckCircle, 
  Tag, 
  Maximize2,
  Plus,
  Layers
} from 'lucide-react';
import { VaultPhoto } from '../types';
import { formatBytes } from '../services/storage';

interface Props {
  photos: VaultPhoto[];
  onAddPhotos: (photos: VaultPhoto[]) => void;
  onDeletePhoto: (id: string) => void;
}

interface StagedPhoto {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  caption: string;
  tag: string;
}

export const PhotoVault: React.FC<Props> = ({ photos, onAddPhotos, onDeletePhoto }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<VaultPhoto | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [batchTag, setBatchTag] = useState('شخصي');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | File[]) => {
    const validImageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validImageFiles.length === 0) {
      alert('يرجى اختيار ملفات صور صالحة (JPG, PNG, JPEG, WEBP, GIF)');
      return;
    }

    const readers = validImageFiles.map(file => {
      return new Promise<StagedPhoto>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: 'staged_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            dataUrl: e.target?.result as string,
            size: file.size,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            tag: batchTag
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newStaged => {
      setStagedPhotos(prev => [...prev, ...newStaged]);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setStagedPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateStagedCaption = (id: string, caption: string) => {
    setStagedPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
  };

  const handleSaveAllStaged = () => {
    if (stagedPhotos.length === 0) return;

    const newVaultPhotos: VaultPhoto[] = stagedPhotos.map(p => ({
      id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: p.name,
      caption: p.caption.trim() || p.name,
      dataUrl: p.dataUrl,
      size: p.size,
      createdAt: new Date().toISOString(),
      tag: p.tag || batchTag
    }));

    onAddPhotos(newVaultPhotos);
    setSuccessMessage(`تم رفع وحفظ ${newVaultPhotos.length} صورة بنجاح داخل الخزنة!`);
    setStagedPhotos([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  const handleCancelAllStaged = () => {
    setStagedPhotos([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadPhoto = (photo: VaultPhoto) => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = photo.name || 'vault-image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#415a77]/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#1b263b] border border-[#415a77] text-2xl">
            🖼️
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">رفع الصور (رفع متعدد Multi-Upload)</h3>
            <p className="text-xs text-gray-400">اختر أو اسحب عدة صور في آنٍ واحد، وعاينها قبل حفظها المشفر</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-[#1b263b] border border-[#415a77] text-[#38bdf8] font-mono">
          {photos.length} صور في الخزنة
        </span>
      </div>

      {/* Multi-Image Upload Dropzone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-[#1b263b] border-2 border-dashed rounded-2xl p-6 transition text-center ${
          isDragging 
            ? 'border-[#38bdf8] bg-[#1e3a5f]/40 scale-[1.01]' 
            : 'border-[#415a77] hover:border-[#38bdf8]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          id="photo-multi-input"
        />

        <label htmlFor="photo-multi-input" className="cursor-pointer block">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#0d1b2a] border border-[#415a77] flex items-center justify-center text-[#38bdf8] hover:scale-105 transition shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <p className="font-bold text-base sm:text-lg text-white mb-1">
            اختر عدة صور معاً أو اسحبها هنا
          </p>
          <p className="text-xs text-gray-300 mb-2">
            خاصية التحديد المتعدد مفعلة (Multiple) — يمكنك اختيار عشرات الصور دفعة واحدة
          </p>

          {/* نص توجيهي واضح عن الدخول داخل المجلد */}
          <div className="max-w-md mx-auto my-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs text-center flex items-center justify-center gap-2">
            <span className="font-bold shrink-0">⚠️ ملاحظة:</span>
            <span>يرجى الدخول داخل المجلد واختيار الملفات المطلوبة، حيث لا يدعم المتصفح رفع المجلدات كاملة دفعة واحدة.</span>
          </div>

          <span className="inline-flex items-center gap-2 py-3 px-7 rounded-xl bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white text-xs sm:text-sm font-bold transition shadow-lg mt-1">
            <Plus className="w-4 h-4" />
            <span>تصفح واختيار صور متعددة (ادخل المجلد وحدد الصور)</span>
          </span>
        </label>
      </div>

      {/* Staging Area / Preview Selected Images Before Final Save */}
      {stagedPhotos.length > 0 && (
        <div className="bg-[#0f2137] border-2 border-[#38bdf8]/60 rounded-2xl p-5 shadow-2xl animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#415a77]/50">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#38bdf8]" />
              <h4 className="font-bold text-white text-sm sm:text-base">
                معاينة الصور المختارة قبل الحفظ ({stagedPhotos.length} صورة)
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">تصنيف جماعي:</span>
              <select
                value={batchTag}
                onChange={(e) => {
                  setBatchTag(e.target.value);
                  setStagedPhotos(prev => prev.map(p => ({ ...p, tag: e.target.value })));
                }}
                className="bg-[#1b263b] border border-[#415a77] text-white text-xs rounded-lg py-1 px-2.5 outline-none focus:border-[#38bdf8]"
              >
                <option value="شخصي">شخصي</option>
                <option value="وثائق رسمية">وثائق رسمية</option>
                <option value="تراخيص">تراخيص</option>
                <option value="بنك ومحفظة">بنك ومحفظة</option>
                <option value="طبي">طبي</option>
                <option value="عائلة">عائلة</option>
              </select>
            </div>
          </div>

          {/* Staged Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1">
            {stagedPhotos.map((photo) => (
              <div 
                key={photo.id}
                className="relative bg-[#1b263b] rounded-xl border border-[#415a77] overflow-hidden p-2 group shadow flex flex-col justify-between"
              >
                <div className="relative h-28 bg-[#0d1b2a] rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.dataUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStaged(photo.id)}
                    title="استبعاد من الرفع"
                    className="absolute top-1 left-1 p-1 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-white font-mono">
                    {formatBytes(photo.size)}
                  </span>
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handleUpdateStagedCaption(photo.id, e.target.value)}
                    placeholder="وصف الصورة..."
                    className="w-full bg-[#0d1b2a] border border-[#415a77] rounded px-2 py-1 text-xs text-white focus:border-[#38bdf8] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons for Staged batch */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#415a77]/50">
            <div className="text-xs text-gray-300">
              إجمالي الحجم:{' '}
              <span className="font-mono text-[#38bdf8] font-bold">
                {formatBytes(stagedPhotos.reduce((acc, curr) => acc + curr.size, 0))}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAllStaged}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>حفظ كل الصور ({stagedPhotos.length}) في الخزنة</span>
              </button>
              <button
                type="button"
                onClick={handleCancelAllStaged}
                className="py-2.5 px-4 rounded-xl bg-[#415a77]/50 hover:bg-[#415a77] text-gray-300 hover:text-white text-xs sm:text-sm transition"
              >
                إلغاء الكل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success notification banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-sm flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Gallery of Saved Vault Photos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#38bdf8]" />
            معرض الصور المحفوظة في الخزنة
          </h4>
          <span className="text-xs text-gray-500">مشفرة ومحفوظة في المتصفح</span>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 bg-[#1b263b]/40 rounded-xl border border-[#415a77]/40 text-gray-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">لا توجد صور محفوظة في الخزنة حالياً</p>
            <p className="text-xs text-gray-500 mt-1">ارفع مجموعة من الصور لحفظها بأمان تام</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-[#1b263b] rounded-xl border border-[#415a77] overflow-hidden hover:border-[#38bdf8] transition shadow-md flex flex-col"
              >
                {/* Image Container */}
                <div
                  className="relative h-44 bg-[#0d1b2a] cursor-pointer overflow-hidden flex items-center justify-center"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption || photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <span className="p-2 rounded-full bg-[#1b263b]/90 text-[#38bdf8] hover:scale-110 transition shadow">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                  {photo.tag && (
                    <span className="absolute top-2 right-2 text-[10px] bg-[#0d1b2a]/90 text-[#38bdf8] border border-[#415a77] px-2 py-0.5 rounded-full font-medium">
                      {photo.tag}
                    </span>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-white text-sm truncate" title={photo.caption || photo.name}>
                      {photo.caption || photo.name}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span>{new Date(photo.createdAt).toLocaleDateString('ar-EG')}</span>
                      <span className="font-mono">{formatBytes(photo.size)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-[#415a77]/40">
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                      className="text-xs py-1 px-2.5 rounded bg-[#0d1b2a] hover:bg-[#415a77] text-[#38bdf8] flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      عرض
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => downloadPhoto(photo)}
                        title="تحميل الصورة"
                        className="p-1.5 rounded bg-[#0d1b2a] hover:bg-[#415a77] text-gray-300 hover:text-white transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف الصورة "${photo.caption || photo.name}"؟`)) {
                            onDeletePhoto(photo.id);
                          }
                        }}
                        title="حذف من الخزنة"
                        className="p-1.5 rounded bg-[#0d1b2a] hover:bg-red-950 text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-[#0d1b2a] border border-[#415a77] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#1b263b] flex items-center justify-between border-b border-[#415a77]/50">
              <div>
                <h4 className="font-bold text-white text-base">{selectedPhoto.caption || selectedPhoto.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  تاريخ الحفظ: {new Date(selectedPhoto.createdAt).toLocaleString('ar-EG')} • الحجم:{' '}
                  {formatBytes(selectedPhoto.size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="py-1.5 px-3 rounded-lg bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  تحميل
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#0d1b2a] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#070d14]">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.caption || selectedPhoto.name}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
