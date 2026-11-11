import React from 'react';
import { X, CreditCard, ShieldCheck, QrCode, Copy, Check, Sparkles } from 'lucide-react';
import { HealthProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: HealthProfile;
}

export const WalletCardModal: React.FC<Props> = ({ isOpen, onClose, profile }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-[#0d1b2a] border border-[#415a77] rounded-2xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#415a77]/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#e0a96d]" />
            <h3 className="text-xl font-bold text-white">بطاقة المحفظة الرقمية المشفرة</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1b263b] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realistic Virtual Vault Card */}
        <div className="mt-6 relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#1b263b] via-[#0d1b2a] to-[#1e3a5f] border-2 border-[#e0a96d]/60 shadow-xl">
          {/* Hologram sheen pattern */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-44 h-44 bg-[#e0a96d]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#e0a96d] uppercase block">
                DIGITAL VAULT CARD • TITANIUM
              </span>
              <p className="text-sm text-gray-300">الخزنة الرقمية الشخصية المعتمدة</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d1b2a]/80 border border-[#415a77] text-xs text-[#38bdf8]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مشفرة محلياً</span>
            </div>
          </div>

          {/* Chip & Wireless */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-[#d4af37] to-[#f9d976] border border-[#ffe082] shadow-inner flex items-center justify-center">
              <div className="w-8 h-6 border border-yellow-800/40 rounded flex flex-col justify-around py-0.5">
                <div className="h-0.5 bg-yellow-900/30 w-full" />
                <div className="h-0.5 bg-yellow-900/30 w-full" />
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-[#38bdf8]/70" />
          </div>

          {/* Account Number */}
          <div className="mb-6">
            <span className="text-xs text-gray-400 block mb-1">رقم الحساب الرقمي / Phone ID</span>
            <div className="font-mono text-2xl tracking-wider text-white font-bold flex items-center gap-3">
              <span dir="ltr">{profile.accountNumber}</span>
              <button
                onClick={handleCopy}
                title="نسخ رقم الحساب"
                className="text-xs p-1.5 rounded bg-[#415a77]/50 hover:bg-[#415a77] text-[#38bdf8] transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Card Bottom: Holder Name, Expiry, PIN */}
          <div className="flex justify-between items-end border-t border-[#415a77]/40 pt-4">
            <div>
              <span className="text-[11px] text-gray-400 block">صاحب الحساب المعتمد</span>
              <p className="font-semibold text-white text-base">{profile.fullName}</p>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-gray-400 block">رمز الوصول السريع</span>
              <p className="font-mono font-bold text-[#e0a96d]">{profile.quickAccessPin}</p>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-gray-400 block">فصيلة الدم</span>
              <p className="font-bold text-[#e63946] text-base">{profile.bloodType}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#1b263b] hover:bg-[#415a77] border border-[#415a77] text-white flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#38bdf8]" />}
            <span>{copied ? 'تم نسخ رقم الحساب!' : 'نسخ رقم الحساب'}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-lg bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white font-medium transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
