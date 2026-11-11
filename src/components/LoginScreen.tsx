import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, KeyRound, Sparkles, AlertCircle, Phone, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { HealthProfile, VaultData } from '../types';
import { WalletCardModal } from './WalletCardModal';
import { HealthIdModal } from './HealthIdModal';
import { BackupRestoreModal } from './BackupRestoreModal';

interface Props {
  onLoginSuccess: () => void;
  vaultData: VaultData;
  onUpdateVault: (data: VaultData) => void;
}

const VALID_PHONE = '123456789';
const VALID_PASSWORD = '123456789';
const QUICK_PIN = '2025';

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess, vaultData, onUpdateVault }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeInput, setActiveInput] = useState<'phone' | 'password'>('phone');

  // Modals state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  const profile = vaultData.healthProfile;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    // Check valid credentials (phone & pass = 123456789 or quick pin 2025)
    if (
      (phone.trim() === VALID_PHONE && password.trim() === VALID_PASSWORD) ||
      (phone.trim() === profile.accountNumber && password.trim() === VALID_PASSWORD) ||
      phone.trim() === QUICK_PIN ||
      password.trim() === QUICK_PIN
    ) {
      onLoginSuccess();
    } else {
      setErrorMessage('رقم الهاتف أو كلمة السر غير صحيحة!');
    }
  };

  const handleQuickFill = () => {
    setPhone(VALID_PHONE);
    setPassword(VALID_PASSWORD);
    setErrorMessage('');
  };

  const handleKeypadPress = (val: string) => {
    if (activeInput === 'phone') {
      setPhone((prev) => prev + val);
    } else {
      setPassword((prev) => prev + val);
    }
  };

  const handleKeypadBackspace = () => {
    if (activeInput === 'phone') {
      setPhone((prev) => prev.slice(0, -1));
    } else {
      setPassword((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white flex flex-col items-center justify-center p-4 selection:bg-[#38bdf8] selection:text-[#0d1b2a]">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#38bdf8]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#e0a96d]/5 rounded-full blur-3xl" />
      </div>

      {/* Main Container - Centered to match Streamlit layout */}
      <div className="relative w-full max-w-md mx-auto my-6 z-10">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#1b263b] border border-[#415a77] shadow-lg mb-3">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#38bdf8] tracking-tight">
            🔐 الخزنة الرقمية الشخصية
          </h2>
          <p className="text-sm text-gray-300 mt-2">
            الرجاء تسجيل الدخول برقم الهاتف وكلمة السر (من 1 إلى 9):
          </p>
        </div>

        {/* Quick autofill helper badge */}
        <div className="mb-4 flex items-center justify-between bg-[#1b263b]/70 border border-[#415a77]/60 rounded-xl p-2.5 px-3.5 text-xs text-gray-300">
          <span className="flex items-center gap-1.5 text-[#38bdf8]">
            <KeyRound className="w-3.5 h-3.5" />
            <span>بيانات التجربة المعتمدة: 123456789</span>
          </span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-xs bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white font-semibold py-1 px-2.5 rounded-lg transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#e0a96d]" />
            ملء تلقائي
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Phone input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#38bdf8]" />
              رقم الهاتف
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setActiveInput('phone')}
                placeholder="123456789"
                className="w-full bg-[#0d1b2a] border border-[#415a77] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl py-3 px-4 text-white text-base font-mono placeholder-gray-500 transition outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#38bdf8]" />
              كلمة السر
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveInput('password')}
                placeholder="123456789"
                className="w-full bg-[#0d1b2a] border border-[#415a77] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl py-3 px-4 text-white text-base font-mono placeholder-gray-500 transition outline-none pr-11"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/80 text-red-200 text-sm flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#1b263b] hover:bg-[#415a77] text-white border border-[#415a77] hover:border-[#e0a96d] font-bold text-base shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
            <span>تسجيل الدخول</span>
          </button>
        </form>

        {/* Tactical 1-9 On-Screen Keypad Toggle */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowKeypad(!showKeypad)}
            className="w-full py-1.5 text-xs text-gray-400 hover:text-[#38bdf8] flex items-center justify-center gap-1 transition"
          >
            <span>{showKeypad ? 'إخفاء لوحة الأرقام اللمسية (1-9)' : 'إظهار لوحة الأرقام اللمسية (1-9)'}</span>
            {showKeypad ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showKeypad && (
            <div className="mt-2 p-3 bg-[#1b263b] border border-[#415a77] rounded-xl shadow-inner">
              <div className="text-[11px] text-gray-400 text-center mb-2">
                المدخل الحالي: <span className="text-[#38bdf8] font-bold">{activeInput === 'phone' ? 'رقم الهاتف' : 'كلمة السر'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2" dir="ltr">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="py-2.5 rounded-lg bg-[#0d1b2a] hover:bg-[#415a77] text-white text-lg font-mono font-bold border border-[#415a77]/50 active:scale-95 transition"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPhone('');
                    setPassword('');
                  }}
                  className="py-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/40 transition"
                >
                  مسح الكل
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 rounded-lg bg-[#0d1b2a] hover:bg-[#415a77] text-white text-lg font-mono font-bold border border-[#415a77]/50 transition"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="py-2.5 rounded-lg bg-[#415a77]/40 hover:bg-[#415a77] text-gray-200 text-xs font-semibold border border-[#415a77] transition"
                >
                  ← حذف
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-[#415a77]/40" />

        {/* Account Info Box (From Streamlit st.info) */}
        <div className="bg-[#1b263b] border border-[#415a77] rounded-xl p-3.5 text-center text-sm text-[#a8dadc] shadow-sm mb-4">
          <span className="font-medium">رقم الحساب: </span>
          <span className="font-mono text-white font-bold" dir="ltr">+967780254954</span>
          <span className="mx-2 text-gray-500">•</span>
          <span className="font-medium">رمز الوصول السريع: </span>
          <span className="font-mono text-[#e0a96d] font-bold">2025</span>
        </div>

        {/* 3 Columns Buttons (From Streamlit st.columns(3)) */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <button
            type="button"
            onClick={() => setBackupModalOpen(true)}
            className="py-2.5 px-2 bg-[#1b263b] hover:bg-[#415a77] text-white text-xs sm:text-sm font-semibold rounded-lg border border-[#415a77] hover:border-[#e0a96d] transition shadow active:scale-95 text-center"
          >
            نسخة احتياطية
          </button>
          <button
            type="button"
            onClick={() => setWalletModalOpen(true)}
            className="py-2.5 px-2 bg-[#1b263b] hover:bg-[#415a77] text-white text-xs sm:text-sm font-semibold rounded-lg border border-[#415a77] hover:border-[#38bdf8] transition shadow active:scale-95 text-center"
          >
            بطاقة المحفظة
          </button>
          <button
            type="button"
            onClick={() => setHealthModalOpen(true)}
            className="py-2.5 px-2 bg-[#1b263b] hover:bg-[#415a77] text-white text-xs sm:text-sm font-semibold rounded-lg border border-[#415a77] hover:border-[#e63946] transition shadow active:scale-95 text-center"
          >
            وصول الطوارئ
          </button>
        </div>

        {/* Emergency ID Card (Matching Streamlit HTML exactly) */}
        <div
          onClick={() => setHealthModalOpen(true)}
          className="cursor-pointer transition hover:brightness-110 shadow-lg"
          style={{
            backgroundColor: '#1b263b',
            padding: '16px',
            borderRadius: '10px',
            borderRight: '5px solid #e63946',
            marginTop: '15px'
          }}
        >
          <div className="flex items-center justify-between">
            <h4 style={{ color: '#ffffff', margin: 0, fontWeight: 700, fontSize: '16px' }}>
              ❤️ البطاقة الصحية الحيوية (Emergency ID)
            </h4>
            <span className="text-[11px] text-gray-400 bg-[#0d1b2a] px-2 py-0.5 rounded border border-[#415a77]/50">
              عرض التفاصيل
            </span>
          </div>
          <p style={{ color: '#a8dadc', margin: '8px 0 0 0', fontSize: '14px' }}>
            فصيلة دمك الحالية:{' '}
            <b style={{ color: '#e63946', fontSize: '20px' }}>{profile.bloodType}</b>
          </p>
          <p style={{ color: '#f1faee', margin: '4px 0 0 0', fontSize: '14px' }}>
            الاسم المعتمد: <b>{profile.fullName}</b>
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-gray-500 mt-2 z-10">
        خزنة رقمية شخصية مشفرة محلياً • حماية البيانات الشخصية والصحية
      </div>

      {/* Interactive Modals */}
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
      <BackupRestoreModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        vaultData={vaultData}
        onUpdateVault={onUpdateVault}
      />
    </div>
  );
};
