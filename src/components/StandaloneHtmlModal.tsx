import React, { useState } from 'react';
import { X, Code2, Download, Copy, Check, Sparkles, FileCode } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneHtmlModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The complete, pure single-file HTML/CSS/JS standalone code
  const standaloneHtmlCode = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>الخزنة الرقمية الشخصية | My Safe Vault</title>
  <!-- Google Fonts: Cairo -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            vaultBg: '#0d1b2a',
            vaultCard: '#1b263b',
            vaultBorder: '#415a77',
            vaultCyan: '#38bdf8',
            vaultGold: '#e0a96d',
            vaultRed: '#e63946'
          },
          fontFamily: {
            cairo: ['Cairo', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Cairo', sans-serif; background-color: #0d1b2a; color: #ffffff; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0d1b2a; }
    ::-webkit-scrollbar-thumb { background: #415a77; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #38bdf8; }
  </style>
</head>
<body class="bg-[#0d1b2a] min-h-screen text-white antialiased selection:bg-[#38bdf8] selection:text-[#0d1b2a]">

  <div id="app" class="max-w-4xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col justify-center">
    <!-- Rendered dynamically by script below -->
  </div>

  <script>
    // ==========================================
    // إدارة بيانات الخزنة في LocalStorage
    // ==========================================
    const STORAGE_KEY = 'my_safe_app_storage_v2';
    const VALID_PHONE = '123456789';
    const VALID_PASSWORD = '123456789';
    const QUICK_PIN = '2025';

    let appState = {
      isLoggedIn: false,
      activeTab: 'all',
      stagedPhotos: [],
      stagedFiles: [],
      vault: loadVaultData()
    };

    function loadVaultData() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
      return {
        photos: [],
        files: [],
        contacts: [
          { id: 'c_1', name: 'أحمد ناصر الحافي (الحساب الأساسي)', phone: '+967780254954', category: 'عام' },
          { id: 'c_2', name: 'طوارئ الإسعاف والإنقاذ', phone: '191', category: 'طوارئ' }
        ],
        profile: {
          fullName: 'أحمد ناصر الحافي',
          bloodType: 'O+',
          accountNumber: '+967780254954',
          quickPin: '2025'
        }
      };
    }

    function saveVaultData() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.vault));
    }

    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    }

    // ==========================================
    // 1. قسم جهات الاتصال: اختيار من الهاتف مباشرة (Contact Picker API) + vCard
    // ==========================================
    async function pickContactsFromPhone() {
      let isTopFrame = false;
      try {
        isTopFrame = window.self === window.top;
      } catch {
        isTopFrame = false;
      }

      if (!isTopFrame) {
        alert('تنبيه أمني من المتصفح: تتطلب ميزة دليل جهات الاتصال تشغيل التطبيق في نافذة مستقلة كاملة (Top Frame)، أو يمكنك استيراد جهات الاتصال كملف VCF بنقرة واحدة.');
        document.getElementById('vcf_standalone_input')?.click();
        return;
      }

      if ('contacts' in navigator && 'select' in navigator.contacts) {
        try {
          const selected = await navigator.contacts.select(['name', 'tel'], { multiple: true });
          if (!selected || selected.length === 0) return;

          let count = 0;
          selected.forEach(c => {
            const rawName = Array.isArray(c.name) ? c.name[0] : c.name;
            const rawTel = Array.isArray(c.tel) ? c.tel[0] : c.tel;
            const name = (rawName || '').trim() || 'جهة اتصال بدون اسم';
            const phone = (rawTel || '').trim();

            if (phone) {
              appState.vault.contacts.unshift({
                id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                name,
                phone,
                category: 'عام'
              });
              count++;
            }
          });

          if (count > 0) {
            saveVaultData();
            render();
            alert('تم جلب وحفظ (' + count + ') جهة اتصال مباشرة من الهاتف إلى الخزنة!');
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            alert('تعذر فتح جهات الاتصال. يمكنك استخدام استيراد VCF أو الإدخال اليدوي.');
            document.getElementById('vcf_standalone_input')?.click();
          }
        }
      } else {
        alert('ميزة اختيار جهات الاتصال المباشرة مخصصة لمتصفحات الجوال (مثل Chrome على Android). يمكنك استخدام استيراد ملف VCF أو الإدخال اليدوي.');
        document.getElementById('vcf_standalone_input')?.click();
      }
    }

    function handleVcfFileImport(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const text = ev.target.result;
          const vcards = text.split(/END:VCARD/i);
          let count = 0;
          vcards.forEach(card => {
            const fnMatch = card.match(/FN(?:;[^:]*)?:(.*)/i);
            const telMatch = card.match(/TEL(?:;[^:]*)?:(.*)/i);
            if (fnMatch && telMatch && fnMatch[1] && telMatch[1]) {
              appState.vault.contacts.unshift({
                id: 'c_vcf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                name: fnMatch[1].trim(),
                phone: telMatch[1].trim(),
                category: 'عام'
              });
              count++;
            }
          });
          if (count > 0) {
            saveVaultData();
            render();
            alert('تم استيراد وحفظ (' + count + ') جهة اتصال بنجاح!');
          } else {
            alert('لم يتم العثور على أرقام هواتف صالحة بالملف.');
          }
        } catch (err) { alert('فشل قراءة ملف VCF.'); }
      };
      reader.readAsText(file);
    }

    function generateVCard(name, phone, category) {
      const cleanPhone = phone.replace(/[^\\d+*#]/g, '');
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN;CHARSET=UTF-8:' + name,
        'N;CHARSET=UTF-8:' + name + ';;;;',
        'TEL;TYPE=CELL,VOICE:' + (cleanPhone || phone),
        'CATEGORIES:' + (category || 'SafeVault'),
        'NOTE;CHARSET=UTF-8:تم الحفظ عبر الخزنة الرقمية الشخصية',
        'END:VCARD'
      ].join('\\r\\n');
    }

    async function triggerPhoneContactSave(name, phone, category) {
      const vcardText = generateVCard(name, phone, category);
      const filename = (name.replace(/[^\\w\\u0600-\\u06FF]/g, '_') || 'contact') + '.vcf';
      const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
      const file = new File([blob], filename, { type: 'text/vcard' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: name, text: 'حفظ جهة الاتصال: ' + name });
          return;
        } catch (e) { }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    function addContact(e) {
      e.preventDefault();
      const name = document.getElementById('contact_name').value.trim();
      const phone = document.getElementById('contact_phone').value.trim();
      const category = document.getElementById('contact_cat').value;

      if (!name || !phone) {
        alert('يرجى إدخال الاسم والرقم.');
        return;
      }

      const newContact = { id: 'c_' + Date.now(), name, phone, category };
      appState.vault.contacts.unshift(newContact);
      saveVaultData();

      render();
      alert('تم حفظ الرقم (' + name + ': ' + phone + ') بنجاح داخل الخزنة!');
    }

    function deleteContact(id) {
      if (confirm('هل تريد حذف هذا الرقم من الخزنة؟')) {
        appState.vault.contacts = appState.vault.contacts.filter(c => c.id !== id);
        saveVaultData();
        render();
      }
    }

    // ==========================================
    // 2. قسم الصور (رفع متعدد مع المعاينة)
    // ==========================================
    function handlePhotoFilesSelected(files) {
      const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (valid.length === 0) return;

      const promises = valid.map(f => new Promise(res => {
        const r = new FileReader();
        r.onload = e => res({ id: 'sp_' + Math.random(), name: f.name, size: f.size, dataUrl: e.target.result });
        r.readAsDataURL(f);
      }));

      Promise.all(promises).then(items => {
        appState.stagedPhotos = [...appState.stagedPhotos, ...items];
        render();
      });
    }

    function removeStagedPhoto(id) {
      appState.stagedPhotos = appState.stagedPhotos.filter(p => p.id !== id);
      render();
    }

    function saveAllStagedPhotos() {
      if (appState.stagedPhotos.length === 0) return;
      appState.stagedPhotos.forEach(p => {
        appState.vault.photos.unshift({
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: p.name,
          caption: p.name.replace(/\\.[^/.]+$/, ''),
          size: p.size,
          dataUrl: p.dataUrl,
          createdAt: new Date().toISOString()
        });
      });
      appState.stagedPhotos = [];
      saveVaultData();
      render();
      alert('تم حفظ كل الصور في الخزنة بنجاح!');
    }

    function deletePhoto(id) {
      if (confirm('هل تريد حذف هذه الصورة من الخزنة؟')) {
        appState.vault.photos = appState.vault.photos.filter(p => p.id !== id);
        saveVaultData();
        render();
      }
    }

    // ==========================================
    // 3. قسم الملفات (مرونة غير محدودة + رفع متعدد)
    // ==========================================
    function handleGeneralFilesSelected(files) {
      const raw = Array.from(files);
      if (raw.length === 0) return;

      const promises = raw.map(f => new Promise(res => {
        const r = new FileReader();
        r.onload = e => res({ id: 'sf_' + Math.random(), name: f.name, size: f.size, type: f.type, dataUrl: e.target.result });
        r.readAsDataURL(f);
      }));

      Promise.all(promises).then(items => {
        appState.stagedFiles = [...appState.stagedFiles, ...items];
        render();
      });
    }

    function removeStagedFile(id) {
      appState.stagedFiles = appState.stagedFiles.filter(f => f.id !== id);
      render();
    }

    function saveAllStagedFiles() {
      if (appState.stagedFiles.length === 0) return;
      appState.stagedFiles.forEach(f => {
        appState.vault.files.unshift({
          id: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: f.name,
          size: f.size,
          type: f.type,
          dataUrl: f.dataUrl,
          createdAt: new Date().toISOString()
        });
      });
      appState.stagedFiles = [];
      saveVaultData();
      render();
      alert('تم حفظ الملفات في الخزنة بنجاح!');
    }

    function deleteFile(id) {
      if (confirm('هل تريد حذف هذا الملف؟')) {
        appState.vault.files = appState.vault.files.filter(f => f.id !== id);
        saveVaultData();
        render();
      }
    }

    // ==========================================
    // 4. النسخ الاحتياطي والاسترجاع
    // ==========================================
    function exportBackup() {
      const json = JSON.stringify(appState.vault, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vault-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      alert('تم عمل نسخة احتياطية بنجاح!');
    }

    function importBackup(e) {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed.photos && parsed.files && parsed.contacts) {
            appState.vault = parsed;
            saveVaultData();
            render();
            alert('تم استرجاع البيانات بنجاح!');
          }
        } catch (err) { alert('ملف النسخة الاحتياطية غير صالح.'); }
      };
      r.readAsText(file);
    }

    // ==========================================
    // رندرة الواجهة (Render Engine)
    // ==========================================
    function render() {
      const root = document.getElementById('app');

      // شاشة تسجيل الدخول
      if (!appState.isLoggedIn) {
        root.innerHTML = \`
          <div class="max-w-md mx-auto w-full my-auto">
            <div class="text-center mb-6">
              <span class="text-4xl block mb-2">🔐</span>
              <h2 class="text-2xl font-bold text-[#38bdf8]">🔐 الخزنة الرقمية الشخصية</h2>
              <p class="text-sm text-gray-300 mt-2">الرجاء تسجيل الدخول برقم الهاتف وكلمة السر (من 1 إلى 9):</p>
            </div>

            <form onsubmit="handleLoginSubmit(event)" class="space-y-4 bg-[#1b263b] p-6 rounded-2xl border border-[#415a77]">
              <div>
                <label class="block text-xs text-gray-300 mb-1">رقم الهاتف:</label>
                <input id="l_phone" type="text" placeholder="123456789" class="w-full bg-[#0d1b2a] border border-[#415a77] rounded-xl p-3 text-white text-center font-mono outline-none focus:border-[#38bdf8]" dir="ltr">
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">كلمة السر:</label>
                <input id="l_pass" type="password" placeholder="123456789" class="w-full bg-[#0d1b2a] border border-[#415a77] rounded-xl p-3 text-white text-center font-mono outline-none focus:border-[#38bdf8]" dir="ltr">
              </div>
              <button type="submit" class="w-full py-3 bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] font-bold rounded-xl transition shadow">
                تسجيل الدخول
              </button>
              <button type="button" onclick="quickFill()" class="w-full py-1.5 text-xs text-[#e0a96d] hover:underline">
                ⚡ تجربة سريعة (ملء 123456789)
              </button>
            </form>

            <div class="mt-4 p-3 bg-[#1b263b] rounded-xl border border-[#415a77] text-center text-xs text-[#a8dadc]">
              رقم الحساب: <b class="text-white font-mono" dir="ltr">+967780254954</b> • رمز الوصول: <b class="text-[#e0a96d]">2025</b>
            </div>

            <div style="background-color: #1b263b; padding: 15px; border-radius: 10px; border-right: 5px solid #e63946; margin-top: 15px;">
              <h4 style="color: #ffffff; margin: 0; font-weight: bold;">❤️ البطاقة الصحية الحيوية (Emergency ID)</h4>
              <p style="color: #a8dadc; margin: 5px 0 0 0;">فصيلة دمك الحالية: <b style="color: #e63946; font-size: 20px;">O+</b></p>
              <p style="color: #f1faee; margin: 5px 0 0 0;">الاسم المعتمد: <b>أحمد ناصر الحافي</b></p>
            </div>
          </div>
        \`;
        return;
      }

      // الواجهة الثانية: لوحة التحكم
      root.innerHTML = \`
        <div class="space-y-6">
          <!-- Top Header -->
          <div class="flex items-center justify-between pb-4 border-b border-[#415a77]">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span>📂</span> لوحة التحكم الأساسية
              </h1>
              <p class="text-xs text-gray-400 mt-1">تخزين آمن ومحمي في متصفحك (LocalStorage)</p>
            </div>
            <button onclick="logout()" class="py-2 px-4 rounded-xl bg-[#e63946] hover:bg-red-700 font-bold text-sm transition">
              قفل 🔒
            </button>
          </div>

          <!-- Section 1: رفع الصور (رفع متعدد + معاينة) -->
          <div class="bg-[#1b263b] p-5 sm:p-6 rounded-2xl border border-[#415a77] space-y-4">
            <h3 class="text-lg font-bold text-white flex items-center justify-between">
              <span>🖼️ رفع الصور (رفع متعدد ومعاينة)</span>
              <span class="text-xs bg-[#0d1b2a] px-2.5 py-1 rounded-full text-[#38bdf8]">\${appState.vault.photos.length} صور</span>
            </h3>

            <input type="file" id="photo_input" multiple accept="image/*" class="hidden" onchange="handlePhotoFilesSelected(this.files)">
            <label for="photo_input" class="block border-2 border-dashed border-[#415a77] hover:border-[#38bdf8] p-6 rounded-xl text-center cursor-pointer bg-[#0d1b2a]/50">
              <span class="text-3xl block mb-2">📸</span>
              <p class="font-bold text-sm text-white">اختر عدة صور معاً أو اسحبها هنا</p>
              <p class="text-xs text-gray-300 mt-1">خاصية التحديد المتعدد مفعلة (Multiple) — يمكنك اختيار عشرات الصور دفعة واحدة</p>
              <div class="max-w-md mx-auto my-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs text-center">
                ⚠️ يرجى الدخول داخل المجلد واختيار الملفات المطلوبة، حيث لا يدعم المتصفح رفع المجلدات كاملة دفعة واحدة.
              </div>
              <span class="mt-1 inline-block py-2 px-5 bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] text-white text-xs font-bold rounded-lg transition">
                تصفح واختيار صور متعددة (ادخل المجلد وحدد الصور)
              </span>
            </label>

            <!-- معاينة الصور المختارة قبل الحفظ -->
            \${appState.stagedPhotos.length > 0 ? \`
              <div class="p-4 bg-[#0d1b2a] rounded-xl border border-[#38bdf8] space-y-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-[#38bdf8]">تم اختيار \${appState.stagedPhotos.length} صورة (جاهزة للحفظ):</span>
                  <button onclick="saveAllStagedPhotos()" class="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-white">
                    حفظ كل الصور في الخزنة ✓
                  </button>
                </div>
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  \${appState.stagedPhotos.map(p => \`
                    <div class="relative rounded-lg overflow-hidden border border-[#415a77] group">
                      <img src="\${p.dataUrl}" class="w-full h-20 object-cover">
                      <button onclick="removeStagedPhoto('\${p.id}')" class="absolute top-1 left-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                    </div>
                  \`).join('')}
                </div>
              </div>
            \` : ''}

            <!-- معرض الصور المحفوظة -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              \${appState.vault.photos.map(p => \`
                <div class="bg-[#0d1b2a] p-2 rounded-xl border border-[#415a77] flex flex-col justify-between">
                  <img src="\${p.dataUrl}" class="w-full h-28 object-cover rounded-lg mb-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="truncate max-w-[100px] text-gray-300">\${p.name}</span>
                    <button onclick="deletePhoto('\${p.id}')" class="text-red-400 hover:text-red-300">حذف</button>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>

          <!-- Section 2: رفع الملفات (أي نوع + متعدد) -->
          <div class="bg-[#1b263b] p-5 sm:p-6 rounded-2xl border border-[#415a77] space-y-4">
            <h3 class="text-lg font-bold text-white flex items-center justify-between">
              <span>📄 رفع الملفات (مرونة غير محدودة لكافة الصيغ)</span>
              <span class="text-xs bg-[#0d1b2a] px-2.5 py-1 rounded-full text-[#e0a96d]">\${appState.vault.files.length} ملفات</span>
            </h3>

            <input type="file" id="file_input" multiple class="hidden" onchange="handleGeneralFilesSelected(this.files)">
            <label for="file_input" class="block border-2 border-dashed border-[#415a77] hover:border-[#e0a96d] p-6 rounded-xl text-center cursor-pointer bg-[#0d1b2a]/50">
              <span class="text-3xl block mb-2">📁</span>
              <p class="font-bold text-sm text-white">اختر أي ملفات (PDF، مستندات، أوديو، مضغوطة... دون قيود)</p>
              <p class="text-xs text-gray-300 mt-1">خاصية التحديد المتعدد مفعلة (Multiple) — يمكنك اختيار عدة ملفات معاً</p>
              <div class="max-w-md mx-auto my-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs text-center">
                ⚠️ يرجى الدخول داخل المجلد واختيار الملفات المطلوبة، حيث لا يدعم المتصفح رفع المجلدات كاملة دفعة واحدة.
              </div>
              <span class="mt-1 inline-block py-2 px-5 bg-[#415a77] hover:bg-[#e0a96d] hover:text-[#0d1b2a] text-white text-xs font-bold rounded-lg transition">
                تصفح واختيار ملفات متعددة (ادخل المجلد وحدد الملفات)
              </span>
            </label>

            <!-- معاينة الملفات المختارة قبل الحفظ -->
            \${appState.stagedFiles.length > 0 ? \`
              <div class="p-4 bg-[#0d1b2a] rounded-xl border border-[#e0a96d] space-y-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-[#e0a96d]">تم اختيار \${appState.stagedFiles.length} ملف:</span>
                  <button onclick="saveAllStagedFiles()" class="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-white">
                    حفظ الملفات في الخزنة ✓
                  </button>
                </div>
                <div class="space-y-1">
                  \${appState.stagedFiles.map(f => \`
                    <div class="flex items-center justify-between text-xs bg-[#1b263b] p-2 rounded">
                      <span class="truncate">\${f.name} (\${formatBytes(f.size)})</span>
                      <button onclick="removeStagedFile('\${f.id}')" class="text-red-400">✕</button>
                    </div>
                  \`).join('')}
                </div>
              </div>
            \` : ''}

            <!-- قائمة الملفات المحفوظة -->
            <div class="space-y-2">
              \${appState.vault.files.map(f => \`
                <div class="bg-[#0d1b2a] p-3 rounded-xl border border-[#415a77] flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="p-1.5 bg-[#1b263b] rounded font-mono font-bold text-[#e0a96d]">\${f.name.split('.').pop() || 'FILE'}</span>
                    <div>
                      <p class="font-bold text-white truncate max-w-xs">\${f.name}</p>
                      <span class="text-gray-400 font-mono">\${formatBytes(f.size)}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <a href="\${f.dataUrl}" download="\${f.name}" class="py-1 px-3 bg-[#415a77] hover:bg-[#38bdf8] text-white rounded">تحميل</a>
                    <button onclick="deleteFile('\${f.id}')" class="text-red-400 hover:text-red-300">حذف</button>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>

          <!-- Section 3: اختيار وإضافة جهات الاتصال -->
          <div class="bg-[#1b263b] p-5 sm:p-6 rounded-2xl border border-[#415a77] space-y-4">
            <h3 class="text-lg font-bold text-white flex items-center justify-between">
              <span>📞 إضافة جهات الاتصال (Contact Picker)</span>
              <span class="text-xs bg-[#0d1b2a] px-2.5 py-1 rounded-full text-emerald-400 font-mono">\${appState.vault.contacts.length} أرقام</span>
            </h3>

            <!-- الزر الرئيسي لاختيار جهات الاتصال من الهاتف مباشرة -->
            <div class="p-4 bg-[#0d1b2a] border-2 border-[#38bdf8]/70 rounded-xl space-y-3">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 class="font-bold text-sm text-white">اختيار من جهات اتصال هاتفك مباشرة</h4>
                  <p class="text-xs text-gray-300">يفتح دليل الهاتف لاستخراج الاسم والرقم تلقائياً والحفظ الفوري دون كتابة</p>
                </div>
                <button onclick="pickContactsFromPhone()" class="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:from-[#7dd3fc] hover:to-[#0369a1] text-[#0d1b2a] font-extrabold text-sm rounded-xl transition shadow flex items-center justify-center gap-2">
                  <span>📱</span>
                  <span>اختيار من جهات الاتصال</span>
                </button>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-[#415a77]/50 text-xs text-gray-400">
                <label class="cursor-pointer text-[#e0a96d] hover:underline flex items-center gap-1">
                  <span>📥 أو استيراد ملف جهات اتصال (.VCF)</span>
                  <input id="vcf_standalone_input" type="file" accept=".vcf" class="hidden" onchange="handleVcfFileImport(event)">
                </label>
                <span class="text-[11px] text-gray-500">حفظ فوري في LocalStorage</span>
              </div>
            </div>

            <!-- خيار إدخال رقم يدوياً -->
            <details class="text-xs text-gray-300 bg-[#0d1b2a]/50 p-3 rounded-xl border border-[#415a77]">
              <summary class="cursor-pointer font-bold text-gray-200">أو إدخال اسم ورقم يدوياً ✍️</summary>
              <form onsubmit="addContact(event)" class="space-y-3 mt-3">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input id="contact_name" type="text" placeholder="اسم الجهة أو الشخص" class="bg-[#1b263b] border border-[#415a77] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38bdf8]">
                  <input id="contact_phone" type="text" placeholder="الرقم (+967...)" class="bg-[#1b263b] border border-[#415a77] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38bdf8] font-mono" dir="ltr">
                  <select id="contact_cat" class="bg-[#1b263b] border border-[#415a77] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38bdf8]">
                    <option value="عام">عام</option>
                    <option value="طوارئ">طوارئ</option>
                    <option value="بنك">بنك</option>
                    <option value="عائلة">عائلة</option>
                    <option value="عمل">عمل</option>
                  </select>
                </div>
                <div class="flex justify-end">
                  <button type="submit" class="py-2 px-5 bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] font-bold text-xs rounded-xl transition">
                    حفظ الرقم يدوياً 💾
                  </button>
                </div>
              </form>
            </details>

            <!-- سجل الأرقام المحفوظة -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              \${appState.vault.contacts.map(c => \`
                <div class="bg-[#0d1b2a] p-3 rounded-xl border border-[#415a77] flex items-center justify-between">
                  <div>
                    <h5 class="font-bold text-white text-xs">\${c.name} <span class="text-[10px] bg-[#1b263b] px-1.5 py-0.5 rounded text-[#a8dadc]">\${c.category}</span></h5>
                    <p class="font-mono text-xs text-[#38bdf8] mt-0.5" dir="ltr">\${c.phone}</p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button onclick="triggerPhoneContactSave('\${c.name}', '\${c.phone}', '\${c.category}')" title="حفظ بالهاتف" class="p-1.5 bg-[#1b263b] text-emerald-400 rounded hover:bg-emerald-950">📲</button>
                    <a href="tel:\${c.phone}" title="اتصال مباشر" class="p-1.5 bg-[#1b263b] text-[#38bdf8] rounded hover:bg-[#415a77]">📞</a>
                    <button onclick="deleteContact('\${c.id}')" title="حذف" class="p-1.5 bg-[#1b263b] text-red-400 rounded hover:bg-red-950">✕</button>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>

          <!-- Section 4: الاسترجاع والنسخ الاحتياطي -->
          <div class="bg-[#1b263b] p-5 sm:p-6 rounded-2xl border border-[#415a77] space-y-3">
            <h3 class="text-lg font-bold text-white">🔄 الاسترجاع والنسخ الاحتياطي</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="py-3 px-4 bg-[#0d1b2a] border border-[#415a77] hover:border-[#38bdf8] rounded-xl text-center cursor-pointer text-xs font-bold block">
                استرجاع البيانات (ملف .json)
                <input type="file" accept=".json" class="hidden" onchange="importBackup(event)">
              </label>
              <button onclick="exportBackup()" class="py-3 px-4 bg-[#415a77] hover:bg-[#38bdf8] hover:text-[#0d1b2a] rounded-xl text-xs font-bold transition">
                نسخ احتياطي للمحفظة 💾
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    function quickFill() {
      document.getElementById('l_phone').value = VALID_PHONE;
      document.getElementById('l_pass').value = VALID_PASSWORD;
    }

    function handleLoginSubmit(e) {
      e.preventDefault();
      const p = document.getElementById('l_phone').value.trim();
      const pass = document.getElementById('l_pass').value.trim();

      if ((p === VALID_PHONE && pass === VALID_PASSWORD) || p === QUICK_PIN || pass === QUICK_PIN) {
        appState.isLoggedIn = true;
        render();
      } else {
        alert('رقم الهاتف أو كلمة السر غير صحيحة!');
      }
    }

    function logout() {
      appState.isLoggedIn = false;
      render();
    }

    // تشغيل الرندرة الأولية
    render();
  </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtmlCode], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d1b2a] border border-[#415a77] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-[#1b263b] flex items-center justify-between border-b border-[#415a77]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0d1b2a] rounded-xl text-[#38bdf8]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">كود HTML + JavaScript الكامل (ملف واحد مستقل)</h3>
              <p className="text-xs text-gray-300">يعمل مباشرة في أي متصفح دون الحاجة لسيرفر مع حفظ LocalStorage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#0d1b2a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code View Area */}
        <div className="p-4 flex-1 overflow-auto bg-[#070d14]">
          <pre className="font-mono text-xs text-emerald-400 p-4 rounded-xl bg-[#0d1b2a] border border-[#415a77]/50 overflow-x-auto whitespace-pre leading-relaxed" dir="ltr">
            {standaloneHtmlCode}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#1b263b] flex flex-wrap items-center justify-between gap-3 border-t border-[#415a77]/60">
          <div className="text-xs text-[#a8dadc]">
            جاهز للاستخدام الفوري: احفظه كـ <code className="text-[#38bdf8] font-mono">index.html</code> وافتحه بأي متصفح
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="py-2 px-4 rounded-xl bg-[#0d1b2a] hover:bg-[#415a77] text-white text-xs font-bold border border-[#415a77] flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ الكود!' : 'نسخ الكود الكامل'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-2 px-5 rounded-xl bg-[#38bdf8] hover:bg-sky-400 text-[#0d1b2a] text-xs font-bold flex items-center gap-1.5 shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف index.html جاهز</span>
            </button>

            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-[#415a77] hover:bg-gray-600 text-white text-xs font-medium transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
