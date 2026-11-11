import React, { useState, useRef } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Image as ImageIcon, 
  FileText, 
  Phone, 
  RefreshCw, 
  Download, 
  Upload, 
  CreditCard, 
  Heart, 
  CheckCircle, 
  Info, 
  HardDrive,
  Sliders,
  ExternalLink,
  Code2
} from 'lucide-react';
import { VaultData, VaultPhoto, VaultFile, VaultContact } from '../types';
import { PhotoVault } from './PhotoVault';
import { FileVault } from './FileVault';
import { ContactVault } from './ContactVault';
import { WalletCardModal } from './WalletCardModal';
import { HealthIdModal } from './HealthIdModal';
import { StandaloneHtmlModal } from './StandaloneHtmlModal';
import { exportVaultJson, resetVaultToDefault } from '../services/storage';

interface Props {
  vaultData: VaultData;
  onUpdateVault: (data: VaultData) => void;
  onLogout: () => void;
}

export const VaultDashboard: React.FC<Props> = ({ vaultData, onUpdateVault, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'files' | 'contacts' | 'backup'>('all');
  const [backupNotice, setBackupNotice] = useState<{ type: 'info' | 'success'; text: string } | null>(null);

  // Modals
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [standaloneModalOpen, setStandaloneModalOpen] = useState(false);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  const profile = vaultData.healthProfile;

  // Photo handlers (supports multiple photos)
  const handleAddPhotos = (newPhotos: VaultPhoto[]) => {
    const updated = {
      ...vaultData,
      photos: [...newPhotos, ...vaultData.photos]
    };
    onUpdateVault(updated);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = {
      ...vaultData,
      photos: vaultData.photos.filter((p) => p.id !== id)
    };
    onUpdateVault(updated);
  };

  // File handlers (supports multiple files of any format)
  const handleAddFiles = (newFiles: VaultFile[]) => {
    const updated = {
      ...vaultData,
      files: [...newFiles, ...vaultData.files]
    };
    onUpdateVault(updated);
  };

  const handleDeleteFile = (id: string) => {
    const updated = {
      ...vaultData,
      files: vaultData.files.filter((f) => f.id !== id)
    };
    onUpdateVault(updated);
  };

  // Contact handlers
  const handleAddContact = (newContact: VaultContact) => {
    const updated = {
      ...vaultData,
      contacts: [newContact, ...vaultData.contacts]
    };
    onUpdateVault(updated);
  };

  const handleAddContacts = (newContacts: VaultContact[]) => {
    const updated = {
      ...vaultData,
      contacts: [...newContacts, ...vaultData.contacts]
    };
    onUpdateVault(updated);
  };

  const handleDeleteContact = (id: string) => {
    const updated = {
      ...vaultData,
      contacts: vaultData.contacts.filter((c) => c.id !== id)
    };
    onUpdateVault(updated);
  };

  // Backup & Restore handlers
  const handleBackupWallet = () => {
    try {
      const jsonStr = exportVaultJson(vaultData);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `wallet-backup-${new Date().toISOString().slice(0, 10)}.json`;
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

      setBackupNotice({
        type: 'success',
        text: 'تم عمل نسخة احتياطية بنجاح!'
      });
      setTimeout(() => setBackupNotice(null), 4500);
    } catch {
      alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية.');
    }
  };

  const handleRestoreClick = () => {
    setBackupNotice({
      type: 'info',
      text: 'جاري استرجاع البيانات المحفوظة...'
    });
    // Open file picker to let user choose backup if they want to restore an external file
    setTimeout(() => {
      restoreFileInputRef.current?.click();
    }, 400);
  };

  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as VaultData;
        if (!parsed.photos || !parsed.files || !parsed.contacts) {
          throw new Error('الملف غير صالح');
        }
        onUpdateVault(parsed);
        setBackupNotice({
          type: 'success',
          text: `تم استرجاع البيانات المحفوظة بنجاح! (${parsed.photos.length} صور، ${parsed.files.length} ملفات، ${parsed.contacts.length} أرقام)`
        });
      } catch {
        alert('فشل في قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
    if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d1b2a]/95 backdrop-blur-md border-b border-[#415a77]/60 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          {/* Header col 1: Matches col_head1 from Streamlit */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1b263b] border border-[#415a77] text-xl">
              📂
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                لوحة التحكم الأساسية
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-normal">
                  <ShieldCheck className="w-3 h-3" />
                  الخزنة مفتوحة
                </span>
              </h1>
              <p className="text-xs text-[#a8dadc] hidden sm:block">
                الحساب: <span className="font-mono text-white">{profile.accountNumber}</span> • المالك: {profile.fullName}
              </p>
            </div>
          </div>

          {/* Quick Access Badges + Lock button (col_head2 from Streamlit) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStandaloneModalOpen(true)}
              title="عرض وتحميل كود index.html المستقل"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1b263b] hover:bg-[#415a77] border border-[#38bdf8]/50 text-xs font-bold text-[#38bdf8] flex items-center gap-1.5 transition shadow"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden md:inline">كود index.html</span>
            </button>

            <button
              onClick={() => setWalletModalOpen(true)}
              title="عرض بطاقة المحفظة"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1b263b] hover:bg-[#415a77] border border-[#415a77] text-xs font-medium text-white flex items-center gap-1.5 transition"
            >
              <CreditCard className="w-4 h-4 text-[#e0a96d]" />
              <span className="hidden md:inline">بطاقة المحفظة</span>
            </button>

            <button
              onClick={() => setHealthModalOpen(true)}
              title="عرض البطاقة الصحية"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1b263b] hover:bg-[#415a77] border border-[#e63946]/50 text-xs font-medium text-white flex items-center gap-1.5 transition"
            >
              <Heart className="w-4 h-4 text-[#e63946]" />
              <span className="hidden md:inline">الهوية الصحية</span>
            </button>

            {/* Lock Button (matching st.button("قفل 🔒")) */}
            <button
              onClick={onLogout}
              className="py-2 px-3.5 sm:px-4 rounded-xl bg-[#e63946] hover:bg-[#d62828] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <span>قفل</span>
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher / Tabs */}
        <div className="max-w-5xl mx-auto px-4 border-t border-[#415a77]/30 flex overflow-x-auto no-scrollbar gap-2 py-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#38bdf8] text-[#0d1b2a]'
                : 'bg-[#1b263b] text-gray-300 hover:bg-[#415a77] hover:text-white'
            }`}
          >
            كل الأقسام
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-[#38bdf8] text-[#0d1b2a]'
                : 'bg-[#1b263b] text-gray-300 hover:bg-[#415a77] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>🖼️ الصور ({vaultData.photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'bg-[#38bdf8] text-[#0d1b2a]'
                : 'bg-[#1b263b] text-gray-300 hover:bg-[#415a77] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 الملفات ({vaultData.files.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-[#38bdf8] text-[#0d1b2a]'
                : 'bg-[#1b263b] text-gray-300 hover:bg-[#415a77] hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>📞 الأرقام ({vaultData.contacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-[#38bdf8] text-[#0d1b2a]'
                : 'bg-[#1b263b] text-gray-300 hover:bg-[#415a77] hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>🔄 النسخ والاسترجاع</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Hidden restore file picker */}
        <input
          type="file"
          ref={restoreFileInputRef}
          onChange={handleRestoreFileSelected}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Global Backup Notification (from Streamlit st.info / st.success) */}
        {backupNotice && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-2.5 shadow-lg animate-fade-in ${
              backupNotice.type === 'success'
                ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-200'
                : 'bg-sky-950/90 border border-sky-500 text-sky-200'
            }`}
          >
            {backupNotice.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0 animate-spin" />
            )}
            <span className="font-bold">{backupNotice.text}</span>
          </div>
        )}

        {/* SECTION 1: رفع الصور (رفع متعدد) */}
        {(activeTab === 'all' || activeTab === 'photos') && (
          <section className="bg-[#0f2137]/60 border border-[#415a77]/60 rounded-2xl p-5 sm:p-6 shadow-xl">
            <PhotoVault
              photos={vaultData.photos}
              onAddPhotos={handleAddPhotos}
              onDeletePhoto={handleDeletePhoto}
            />
          </section>
        )}

        {/* SECTION 2: رفع الملفات (كافة الصيغ + متعدد) */}
        {(activeTab === 'all' || activeTab === 'files') && (
          <section className="bg-[#0f2137]/60 border border-[#415a77]/60 rounded-2xl p-5 sm:p-6 shadow-xl">
            <FileVault
              files={vaultData.files}
              onAddFiles={handleAddFiles}
              onDeleteFile={handleDeleteFile}
            />
          </section>
        )}

        {/* SECTION 3: إضافة الأرقام */}
        {(activeTab === 'all' || activeTab === 'contacts') && (
          <section className="bg-[#0f2137]/60 border border-[#415a77]/60 rounded-2xl p-5 sm:p-6 shadow-xl">
            <ContactVault
              contacts={vaultData.contacts}
              onAddContact={handleAddContact}
              onAddContacts={handleAddContacts}
              onDeleteContact={handleDeleteContact}
            />
          </section>
        )}

        {/* SECTION 4: أزرار الاسترجاع والنسخ الاحتياطي (matching Streamlit 4th section exactly) */}
        {(activeTab === 'all' || activeTab === 'backup') && (
          <section className="bg-[#0f2137]/60 border border-[#415a77]/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#415a77]/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1b263b] border border-[#415a77] text-2xl">
                  🔄
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">الاسترجاع والنسخ الاحتياطي</h3>
                  <p className="text-xs text-gray-400">حماية البيانات خارجياً وإمكانية استرجاعها في أي وقت</p>
                </div>
              </div>
            </div>

            {/* 2 columns buttons: matching Streamlit c1, c2 = st.columns(2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* c1: استرجاع البيانات */}
              <button
                type="button"
                onClick={handleRestoreClick}
                className="py-4 px-5 rounded-xl bg-[#1b263b] hover:bg-[#415a77] border border-[#415a77] hover:border-[#38bdf8] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg transition active:scale-[0.99]"
              >
                <Upload className="w-5 h-5 text-[#38bdf8]" />
                <span>استرجاع البيانات</span>
              </button>

              {/* c2: نسخ احتياطي للمحفظة */}
              <button
                type="button"
                onClick={handleBackupWallet}
                className="py-4 px-5 rounded-xl bg-gradient-to-r from-[#1b263b] to-[#1e3a5f] hover:from-[#233554] hover:to-[#2b517d] border border-[#38bdf8]/50 hover:border-[#e0a96d] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg transition active:scale-[0.99]"
              >
                <Download className="w-5 h-5 text-[#e0a96d]" />
                <span>نسخ احتياطي للمحفظة</span>
              </button>
            </div>

            {/* Export single file index.html button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStandaloneModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#1b263b] hover:bg-[#415a77] border border-[#38bdf8]/40 text-xs sm:text-sm font-bold text-[#38bdf8] flex items-center justify-center gap-2 transition shadow"
              >
                <Code2 className="w-4 h-4 text-[#38bdf8]" />
                <span>عرض وتحميل كود التطبيق في ملف index.html مستقل وذاتي التشغيل</span>
              </button>
            </div>

            {/* Extra Reset option */}
            <div className="pt-3 flex justify-between items-center text-xs text-gray-400 border-t border-[#415a77]/30">
              <span>جميع البيانات مشفرة ومحفوظة على متصفحك محلياً (LocalStorage)</span>
              <button
                onClick={() => {
                  if (window.confirm('هل تريد إعادة تحميل البيانات الافتراضية؟')) {
                    const data = resetVaultToDefault();
                    onUpdateVault(data);
                    setBackupNotice({ type: 'info', text: 'تمت استعادة البيانات الافتراضية بنجاح.' });
                    setTimeout(() => setBackupNotice(null), 3000);
                  }
                }}
                className="text-red-400 hover:text-red-300 underline"
              >
                إعادة ضبط البيانات الافتراضية
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <WalletCardModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        profile={profile}
      />
      <HealthIdModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        profile={profile}
      />
      <StandaloneHtmlModal
        isOpen={standaloneModalOpen}
        onClose={() => setStandaloneModalOpen(false)}
      />
    </div>
  );
};
