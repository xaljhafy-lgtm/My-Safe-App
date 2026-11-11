import React from 'react';
import { X, Heart, Phone, AlertTriangle, ShieldAlert, User, Activity } from 'lucide-react';
import { HealthProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: HealthProfile;
}

export const HealthIdModal: React.FC<Props> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0d1b2a] border-2 border-[#e63946] rounded-2xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Top Emergency Banner */}
        <div className="bg-[#e63946]/20 border border-[#e63946] rounded-xl p-3 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#e63946] animate-pulse" />
            <div>
              <h3 className="font-bold text-white text-lg">وصول الطوارئ الطبي (Emergency Medical ID)</h3>
              <p className="text-xs text-red-200">متاح لفرق الإسعاف والإنقاذ بدون الحاجة لكلمة سر الخزنة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#1b263b] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vital Info Grid */}
        <div className="space-y-4">
          {/* Blood Type & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 bg-[#1b263b] border-r-4 border-[#e63946] p-4 rounded-xl flex flex-col items-center justify-center">
              <span className="text-xs text-gray-300">فصيلة الدم</span>
              <span className="text-3xl font-extrabold text-[#e63946] mt-1">{profile.bloodType}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">RH Positive</span>
            </div>
            <div className="col-span-2 bg-[#1b263b] p-4 rounded-xl border border-[#415a77]/50 flex flex-col justify-center">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#38bdf8]" />
                الاسم المعتمد
              </span>
              <span className="text-lg font-bold text-white mt-1">{profile.fullName}</span>
              <span className="text-xs text-[#a8dadc] mt-0.5" dir="ltr">{profile.accountNumber}</span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-[#1b263b] p-4 rounded-xl border border-[#415a77]/60">
            <span className="text-xs text-[#e0a96d] font-semibold flex items-center gap-1.5 mb-2">
              <Phone className="w-4 h-4" />
              جهة الاتصال في حالات الطوارئ
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{profile.emergencyContactName}</p>
                <p className="text-sm text-gray-300 font-mono mt-0.5" dir="ltr">{profile.emergencyContactPhone}</p>
              </div>
              <a
                href={`tel:${profile.emergencyContactPhone}`}
                className="py-2 px-4 rounded-lg bg-[#e63946] hover:bg-[#d62828] text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Phone className="w-3.5 h-3.5" />
                اتصال فوري
              </a>
            </div>
          </div>

          {/* Allergies & Conditions */}
          <div className="bg-[#1b263b] p-4 rounded-xl border border-[#415a77]/60">
            <span className="text-xs text-[#38bdf8] font-semibold flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              الحساسيات الدوائية والغذائية
            </span>
            <p className="text-sm text-gray-200">{profile.allergies || 'لا توجد حساسيات مسجلة'}</p>
          </div>

          {/* Notes */}
          <div className="bg-[#1b263b] p-4 rounded-xl border border-[#415a77]/60">
            <span className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              ملاحظات طبية وتعليمات
            </span>
            <p className="text-xs text-gray-300 leading-relaxed">{profile.notes}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <a
            href="tel:191"
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#e63946] hover:bg-[#d62828] text-white font-bold flex items-center justify-center gap-2 text-sm transition"
          >
            <ShieldAlert className="w-4 h-4" />
            اتصال برقم الإسعاف (191)
          </a>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-lg bg-[#1b263b] hover:bg-[#415a77] text-white text-sm font-medium transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
