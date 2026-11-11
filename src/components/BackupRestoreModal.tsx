import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, CheckCircle, AlertCircle, Database, ShieldCheck } from 'lucide-react';
import { VaultData } from '../types';
import { exportVaultJson, resetVaultToDefault } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vaultData: VaultData;
  onUpdateVault: (data: VaultData) => void;
}

export const BackupRestoreModal: React.FC<Props> = ({ isOpen, onClose, vaultData, onUpdateVault }) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    try {
      const jsonStr = exportVaultJson(vaultData);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const updated = {
        ...vaultData,
        lastBackupDate: new Date().toISOString()
      };
      onUpdateVault(updated);

      setStatusMessage({
        type: 'success',
        text: `تم تنزيل النسخة الاحتياطية بنجاح (${filename})!`
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'حدث خطأ أثناء إنشاء ملف النسخ الاحتياطي.'
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as VaultData;
        if (!parsed.photos || !parsed.files || !parsed.contacts) {
          throw new Error('ملف النسخ الاحتياطي غير صالح');
        }
        onUpdateVault(parsed);
        setStatusMessage({
          type: 'success',
          text: `تم استرجاع البيانات بنجاح! (${parsed.photos.length} صور، ${parsed.files.length} ملفات، ${parsed.contacts.length} أرقام)`
        });
      } catch (err: unknown) {
        setStatusMessage({
          type: 'error',
          text: 'فشل في قراءة ملف النسخة الاحتياطية. يرجى التأكد من صحة الملف.'
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط الخزنة إلى البيانات الافتراضية؟')) {
      const resetData = resetVaultToDefault();
      onUpdateVault(resetData);
      setStatusMessage({
        type: 'info',
        text: 'تمت استعادة البيانات الافتراضية للخزنة بنجاح.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0d1b2a] border border-[#415a77] rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-[#415a77]/50">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-[#38bdf8]" />
            <h3 className="text-xl font-bold text-white">إدارة النسخ الاحتياطي والاسترجاع</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1b263b] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-500 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-950/70 border border-red-500 text-red-200'
                : 'bg-sky-950/70 border border-sky-500 text-sky-200'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
            {statusMessage.type === 'info' && <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Summary Box */}
          <div className="p-4 bg-[#1b263b] rounded-xl border border-[#415a77]/60">
            <span className="text-xs text-gray-400 block mb-2">محتويات الخزنة الحالية المراد نسخها:</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-[#0d1b2a] border border-[#415a77]/40">
                <span className="text-xs text-gray-400 block">الصور</span>
                <span className="font-bold text-lg text-[#38bdf8]">{vaultData.photos.length}</span>
              </div>
              <div className="p-2 rounded bg-[#0d1b2a] border border-[#415a77]/40">
                <span className="text-xs text-gray-400 block">الملفات</span>
                <span className="font-bold text-lg text-[#e0a96d]">{vaultData.files.length}</span>
              </div>
              <div className="p-2 rounded bg-[#0d1b2a] border border-[#415a77]/40">
                <span className="text-xs text-gray-400 block">الأرقام</span>
                <span className="font-bold text-lg text-emerald-400">{vaultData.contacts.length}</span>
              </div>
            </div>
            {vaultData.lastBackupDate && (
              <p className="text-[11px] text-gray-400 mt-3 text-center">
                آخر تصدير: {new Date(vaultData.lastBackupDate).toLocaleString('ar-EG')}
              </p>
            )}
          </div>

          {/* Backup Button */}
          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1b263b] to-[#1e3a5f] hover:from-[#233554] hover:to-[#2c4f7c] border border-[#38bdf8]/50 text-white font-medium flex items-center justify-center gap-2 shadow transition"
          >
            <Download className="w-5 h-5 text-[#38bdf8]" />
            <span>تنزيل نسخة احتياطية مشفرة (.json)</span>
          </button>

          {/* Restore File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl bg-[#1b263b] hover:bg-[#415a77] border border-[#415a77] text-white font-medium flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-5 h-5 text-[#e0a96d]" />
            <span>استيراد واسترجاع من ملف نسخة احتياطية</span>
          </button>

          {/* Reset Option */}
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-red-950/30 border border-red-900/50 text-red-300 text-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>استعادة البيانات الافتراضية الأصلية</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#415a77]/40 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-lg bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white font-medium transition"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
