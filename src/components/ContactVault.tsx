import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  UserPlus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone,
  Users,
  Sparkles,
  Upload,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink
} from 'lucide-react';
import { VaultContact } from '../types';

interface Props {
  contacts: VaultContact[];
  onAddContact: (contact: VaultContact) => void;
  onAddContacts?: (contacts: VaultContact[]) => void;
  onDeleteContact: (id: string) => void;
}

// Generate standard vCard 3.0 content with UTF-8 support
export function generateVCardString(name: string, phone: string, category: string = 'SafeVault'): string {
  const cleanPhone = phone.replace(/[^\d+*#]/g, '');
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${name}`,
    `N;CHARSET=UTF-8:${name};;;;`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone || phone}`,
    `CATEGORIES:${category}`,
    'NOTE;CHARSET=UTF-8:تم الحفظ عبر الخزنة الرقمية الشخصية',
    'END:VCARD'
  ].join('\r\n');
}

// Trigger native smartphone contact save (via Web Share API or vCard download)
export async function saveToPhoneContacts(contact: VaultContact): Promise<boolean> {
  const vcardText = generateVCardString(contact.name, contact.phone, contact.category);
  const cleanFilename = `${contact.name.replace(/[^\w\u0600-\u06FF]/g, '_') || 'contact'}.vcf`;
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const file = new File([blob], cleanFilename, { type: 'text/vcard' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: contact.name,
        text: `حفظ جهة الاتصال: ${contact.name}`
      });
      return true;
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return true;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', cleanFilename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

export const ContactVault: React.FC<Props> = ({ 
  contacts, 
  onAddContact, 
  onAddContacts,
  onDeleteContact 
}) => {
  const [isSupportedContactPicker, setIsSupportedContactPicker] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'طوارئ' | 'عائلة' | 'بنك' | 'عمل' | 'عام'>('عام');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const vcfInputRef = useRef<HTMLInputElement>(null);

  // Check Contact Picker API support and iframe status on mount
  useEffect(() => {
    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      inIframe = true;
    }
    setIsInIframe(inIframe);

    const hasApi = 'contacts' in navigator && 'ContactsManager' in window;
    // Contact Picker API only works in top frame per W3C specification
    setIsSupportedContactPicker(!inIframe && hasApi);
  }, []);

  // 1. Native Mobile Contact Picker (navigator.contacts.select)
  const handlePickContactsFromPhone = async () => {
    setSuccessMessage(null);
    setWarningMessage(null);

    // If running inside an iframe, browser security prohibits ContactsManager.select
    let inIframe = false;
    try {
      inIframe = window.self !== window.top;
    } catch {
      inIframe = true;
    }

    if (inIframe) {
      setWarningMessage(
        'تنبيه أمني من المتصفح: تمنع المتصفحات وصول نافذة المعاينة المضمنة (iFrame) لدليل الهاتف مباشرة. يمكنك إما فتح التطبيق في نافذة مستقلة جديدة، أو استيراد جهات الاتصال كملف VCF بنقرة واحدة أدناه.'
      );
      // Trigger VCF file selector as a seamless fallback
      setTimeout(() => {
        vcfInputRef.current?.click();
      }, 300);
      return;
    }

    // Top frame execution
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const props = ['name', 'tel'];
        const options = { multiple: true };
        const selectedContacts = await (navigator as any).contacts.select(props, options);

        if (!selectedContacts || selectedContacts.length === 0) {
          return; // User cancelled
        }

        const newContactsList: VaultContact[] = [];

        for (const item of selectedContacts) {
          const rawName = Array.isArray(item.name) ? item.name[0] : item.name;
          const rawTel = Array.isArray(item.tel) ? item.tel[0] : item.tel;

          const contactName = (rawName || '').trim() || 'جهة اتصال بدون اسم';
          const contactPhone = (rawTel || '').trim();

          if (contactPhone) {
            newContactsList.push({
              id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              name: contactName,
              phone: contactPhone,
              category: 'عام',
              createdAt: new Date().toISOString()
            });
          }
        }

        if (newContactsList.length > 0) {
          // Direct Auto-Save into LocalStorage / Vault state
          if (onAddContacts) {
            onAddContacts(newContactsList);
          } else {
            newContactsList.forEach(c => onAddContact(c));
          }

          setSuccessMessage(`تم جلب وحفظ (${newContactsList.length}) جهة اتصال مباشرة من الهاتف إلى الخزنة!`);
          setTimeout(() => setSuccessMessage(null), 5000);
        } else {
          setWarningMessage('لم يتم العثور على أرقام هواتف مسجلة لجهات الاتصال المحددة.');
          setTimeout(() => setWarningMessage(null), 4000);
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') {
          // User closed the selector without picking, no warning needed
          return;
        }

        if (error.name === 'InvalidStateError' || error.message?.includes('top frame')) {
          setWarningMessage(
            'قيود المتصفح: تتطلب ميزة دليل جهات الاتصال تشغيل التطبيق في نافذة مستقلة كاملة (Top Frame). جارٍ فتح اختيار ملف VCF كبديل سريع...'
          );
          setTimeout(() => {
            vcfInputRef.current?.click();
          }, 300);
        } else {
          setWarningMessage('تعذر الوصول إلى جهات الاتصال. يمكنك استخدام استيراد VCF أو الإدخال اليدوي.');
          setShowManualForm(true);
        }
      }
    } else {
      // Fallback for desktop/unsupported browser: prompt VCF import or manual input
      setWarningMessage(
        'ميزة Contact Picker المباشرة مخصصة لمتصفحات الجوال (مثل Chrome على Android). يمكنك استيراد جهات الاتصال عبر ملف VCF أو الإدخال اليدوي أدناه.'
      );
      vcfInputRef.current?.click();
    }
  };

  // 2. Fallback: Import contacts from VCF / vCard file (Universal for all devices)
  const handleVcfImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const vcards = text.split(/END:VCARD/i);
        const imported: VaultContact[] = [];

        vcards.forEach((card) => {
          let cName = '';
          let cPhone = '';

          const fnMatch = card.match(/FN(?:;[^:]*)?:(.*)/i);
          if (fnMatch && fnMatch[1]) cName = fnMatch[1].trim();

          const telMatch = card.match(/TEL(?:;[^:]*)?:(.*)/i);
          if (telMatch && telMatch[1]) cPhone = telMatch[1].trim();

          if (cName && cPhone) {
            imported.push({
              id: 'contact_vcf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
              name: cName,
              phone: cPhone,
              category: 'عام',
              createdAt: new Date().toISOString()
            });
          }
        });

        if (imported.length > 0) {
          if (onAddContacts) {
            onAddContacts(imported);
          } else {
            imported.forEach(c => onAddContact(c));
          }
          setSuccessMessage(`تم استيراد وحفظ (${imported.length}) جهة اتصال بنجاح في الخزنة!`);
          setTimeout(() => setSuccessMessage(null), 5000);
        } else {
          setWarningMessage('لم يتم العثور على جهات اتصال صالحة في ملف VCF.');
        }
      } catch {
        setWarningMessage('فشل في قراءة ملف VCF.');
      }
    };
    reader.readAsText(file);
    if (vcfInputRef.current) vcfInputRef.current.value = '';
  };

  // 3. Manual Contact Form Submit
  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMessage(null);

    if (name.trim() && phone.trim()) {
      const newContact: VaultContact = {
        id: 'contact_' + Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        category: category,
        createdAt: new Date().toISOString()
      };

      onAddContact(newContact);
      setSuccessMessage(`تم حفظ الرقم (${newContact.name}: ${newContact.phone}) بنجاح في الخزنة!`);
      setName('');
      setPhone('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setWarningMessage('يرجى إدخال الاسم والرقم.');
      setTimeout(() => setWarningMessage(null), 4000);
    }
  };

  const handleCopyPhone = (contact: VaultContact) => {
    navigator.clipboard.writeText(contact.phone);
    setCopiedId(contact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (cat: VaultContact['category']) => {
    switch (cat) {
      case 'طوارئ':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-400">طوارئ</span>;
      case 'بنك':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300">بنك</span>;
      case 'عائلة':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/50 text-sky-300">عائلة</span>;
      case 'عمل':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/50 text-indigo-300">عمل</span>;
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-800 border border-gray-600 text-gray-300">عام</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden VCF file picker */}
      <input
        type="file"
        ref={vcfInputRef}
        onChange={handleVcfImport}
        accept=".vcf,text/vcard"
        className="hidden"
      />

      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#415a77]/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#1b263b] border border-[#415a77] text-2xl">
            📞
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">إضافة جهات الاتصال والأرقام (Contact Picker)</h3>
            <p className="text-xs text-gray-400">
              اختيار مباشر من دليل هاتف الجوال + حفظ فوري في LocalStorage دون كتابة يدوية
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-[#1b263b] border border-[#415a77] text-emerald-400 font-mono">
          {contacts.length} أرقام محفوظة
        </span>
      </div>

      {/* Primary Contact Picker Card (الزر الرئيسي لاختيار جهات الاتصال) */}
      <div className="bg-gradient-to-br from-[#1b263b] via-[#10243d] to-[#0d1b2a] border-2 border-[#38bdf8]/70 hover:border-[#38bdf8] rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#e0a96d]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/50 text-[#38bdf8] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>جلب تلقائي فوري</span>
              </span>
              {isSupportedContactPicker ? (
                <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  متصفح الجوال مدعوم ✓
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-[#0d1b2a]/80 px-2 py-0.5 rounded border border-[#415a77]">
                  دعم متصفحات الجوال & VCF
                </span>
              )}
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              اختيار من جهات اتصال الهاتف مباشرة
            </h4>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              انقر لفتح دليل جهات اتصال هاتفك واختيار رقم أو عدة أرقام؛ سيقوم التطبيق باستخراج الاسم والرقم وحفظهما فوراً في الخزنة دون أي كتابة يدوية!
            </p>

            {isInIframe && (
              <div className="pt-1 flex items-center gap-2 text-xs text-[#a8dadc]">
                <span>داخل نافذة المعاينة:</span>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#38bdf8] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>فتح كنافذة مستقلة (لتمكين دليل الجوال المباشر)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePickContactsFromPhone}
              className="py-4 px-7 rounded-2xl bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:from-[#7dd3fc] hover:to-[#0369a1] text-[#0d1b2a] font-extrabold text-base sm:text-lg shadow-xl hover:shadow-cyan-500/25 transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Smartphone className="w-6 h-6 text-[#0d1b2a]" />
              <span>اختيار من جهات الاتصال</span>
            </button>

            {/* Quick VCF fallback button */}
            <button
              type="button"
              onClick={() => vcfInputRef.current?.click()}
              className="py-2 px-4 rounded-xl bg-[#0d1b2a]/80 hover:bg-[#1b263b] text-xs text-gray-300 hover:text-white border border-[#415a77] transition flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#e0a96d]" />
              <span>أو استيراد ملف جهات اتصال (.VCF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#1b263b] to-emerald-950/70 border-2 border-emerald-500 text-emerald-200 text-sm flex items-center gap-3 shadow-xl animate-fade-in">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block">{successMessage}</span>
            <span className="text-xs text-emerald-300">تم التخزين في LocalStorage بنجاح وتحديث السجل.</span>
          </div>
        </div>
      )}

      {/* Warning / Error Notification */}
      {warningMessage && (
        <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/80 text-amber-200 text-xs sm:text-sm flex items-center gap-2.5 shadow-lg animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Collapsible Manual Input (Option for desktop or manual typing) */}
      <div className="border border-[#415a77]/50 rounded-2xl overflow-hidden bg-[#1b263b]/60">
        <button
          type="button"
          onClick={() => setShowManualForm(!showManualForm)}
          className="w-full py-3 px-5 flex items-center justify-between text-xs text-gray-300 hover:text-white hover:bg-[#1b263b] transition"
        >
          <span className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#38bdf8]" />
            <span>هل تفضل إدخال رقم يدوياً بدلاً من سحبه من جهات الاتصال؟</span>
          </span>
          {showManualForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showManualForm && (
          <form onSubmit={handleManualSave} className="p-5 border-t border-[#415a77]/50 bg-[#1b263b] space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                  اسم الجهة أو الشخص:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: د. أحمد ناصر / البنك المركزي"
                  className="w-full bg-[#0d1b2a] border border-[#415a77] focus:border-[#38bdf8] rounded-xl py-2 px-3 text-sm text-white placeholder-gray-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                  الرقم:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: +967780254954"
                  className="w-full bg-[#0d1b2a] border border-[#415a77] focus:border-[#38bdf8] rounded-xl py-2 px-3 text-sm text-white placeholder-gray-500 outline-none transition font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                  تصنيف جهة الاتصال:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#0d1b2a] border border-[#415a77] focus:border-[#38bdf8] rounded-xl py-2 px-3 text-sm text-white outline-none transition"
                >
                  <option value="عام">عام</option>
                  <option value="طوارئ">طوارئ</option>
                  <option value="عائلة">عائلة</option>
                  <option value="بنك">بنك / حساب مالي</option>
                  <option value="عمل">عمل ومستشارين</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>حفظ الرقم يدوياً</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Saved Contacts List (سجل الأرقام المحفوظة داخل الخزنة في LocalStorage) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#38bdf8]" />
            <h4 className="text-sm sm:text-base font-bold text-white">
              سجل الأرقام المحفوظة في الخزنة
            </h4>
            <span className="text-xs text-gray-400 font-mono">({filteredContacts.length})</span>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في الأسماء أو الأرقام..."
              className="w-full bg-[#1b263b] border border-[#415a77] rounded-xl py-2 pr-8 pl-3 text-xs text-white placeholder-gray-400 focus:border-[#38bdf8] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-[#1b263b]/40 rounded-2xl border border-[#415a77]/40 text-gray-400 space-y-2">
            <Smartphone className="w-12 h-12 mx-auto text-gray-500/50" />
            <p className="text-sm font-semibold text-gray-300">لا توجد جهات اتصال محفوظة حالياً</p>
            <p className="text-xs text-gray-400">
              اضغط على زر <b className="text-[#38bdf8]">"اختيار من جهات الاتصال"</b> أعلاه لجلب أرقامك مباشرة من الهاتف
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-[#1b263b] border border-[#415a77] rounded-xl p-3.5 hover:border-[#38bdf8] transition shadow flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-bold text-white text-sm truncate" title={contact.name}>
                      {contact.name}
                    </h5>
                    {getCategoryBadge(contact.category)}
                  </div>
                  <div className="font-mono text-sm text-[#38bdf8] font-bold" dir="ltr">
                    {contact.phone}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Share/Save vCard to Mobile */}
                  <button
                    type="button"
                    onClick={() => saveToPhoneContacts(contact)}
                    title="حفظ/مشاركة جهة الاتصال بالهاتف (vCard)"
                    className="p-2 rounded-lg bg-[#0d1b2a] hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>

                  {/* Direct Native Call (tel:) */}
                  <a
                    href={`tel:${contact.phone}`}
                    title="فتح تطبيق الاتصال (Dialer)"
                    className="p-2 rounded-lg bg-[#0d1b2a] hover:bg-[#415a77] text-[#38bdf8] hover:text-white transition"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  {/* Copy Number */}
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(contact)}
                    title="نسخ الرقم"
                    className="p-2 rounded-lg bg-[#0d1b2a] hover:bg-[#415a77] text-gray-300 hover:text-white transition"
                  >
                    {copiedId === contact.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف الرقم "${contact.name}" من الخزنة؟`)) {
                        onDeleteContact(contact.id);
                      }
                    }}
                    title="حذف الرقم"
                    className="p-2 rounded-lg bg-[#0d1b2a] hover:bg-red-950 text-gray-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
