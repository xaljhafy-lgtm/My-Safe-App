import { VaultData, VaultPhoto, VaultFile, VaultContact, HealthProfile } from '../types';

const STORAGE_KEY = 'personal_digital_vault_v1';

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  fullName: 'أحمد ناصر الحافي',
  bloodType: 'O+',
  accountNumber: '+967780254954',
  quickAccessPin: '2025',
  nationalId: 'YE-88492019-2',
  allergies: 'لا توجد حساسيات دوائية مسجلة (None)',
  emergencyContactName: 'ناصر الحافي (الأب)',
  emergencyContactPhone: '+967771234567',
  notes: 'مريض سليم، يرجى التواصل برقم الطوارئ المعتمد فوراً في الحالات الحرجة.'
};

// Initial realistic seed data so vault is immediately rich and functional
export const DEFAULT_VAULT_DATA: VaultData = {
  photos: [
    {
      id: 'photo-1',
      name: 'بطاقة الهوية الوطنية المشفرة',
      caption: 'نسخة رقمية رسمية معتمدة',
      // SVG data URL preview for clean crisp encrypted badge look
      dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380"><rect width="600" height="380" rx="20" fill="%231b263b" stroke="%23415a77" stroke-width="4"/><rect x="20" y="20" width="560" height="60" rx="10" fill="%230d1b2a"/><text x="550" y="55" fill="%2338bdf8" font-size="20" font-family="sans-serif" text-anchor="end" font-weight="bold">الجمهورية اليمنية - بطاقة شخصية ذكية</text><circle cx="100" cy="180" r="50" fill="%23415a77"/><text x="100" y="190" fill="%23ffffff" font-size="30" text-anchor="middle">👤</text><text x="450" y="140" fill="%23ffffff" font-size="18" text-anchor="end">الاسم: أحمد ناصر الحافي</text><text x="450" y="175" fill="%23a8dadc" font-size="15" text-anchor="end">الرقم الوطني: 884920192</text><text x="450" y="210" fill="%23a8dadc" font-size="15" text-anchor="end">فصيلة الدم: O+</text><text x="450" y="245" fill="%23e0a96d" font-size="14" text-anchor="end">حالة السجل: موثق ومحمي بتقنية التشفير</text><rect x="30" y="290" width="540" height="60" rx="8" fill="%230d1b2a"/><text x="540" y="325" fill="%2338bdf8" font-size="12" text-anchor="end">CHIP ID: 967-780254954-SECURE-VAULT-2026</text></svg>',
      size: 145200,
      createdAt: '2026-11-01T10:15:00Z',
      tag: 'وثائق رسمية'
    },
    {
      id: 'photo-2',
      name: 'رخصة القيادة الرقمية',
      caption: 'رخصة قيادة خصوصي سارية',
      dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380"><rect width="600" height="380" rx="20" fill="%231b263b" stroke="%2338bdf8" stroke-width="2"/><rect x="25" y="25" width="550" height="50" rx="8" fill="%230d1b2a"/><text x="540" y="58" fill="%23e0a96d" font-size="18" font-family="sans-serif" text-anchor="end" font-weight="bold">رخصة قيادة مركبة - الإدارة العامة للمرور</text><circle cx="90" cy="170" r="45" fill="%230d1b2a" stroke="%23e0a96d" stroke-width="2"/><text x="90" y="180" fill="%23ffffff" font-size="28" text-anchor="middle">🚗</text><text x="450" y="140" fill="%23ffffff" font-size="17" text-anchor="end">الاسم: أحمد ناصر الحافي</text><text x="450" y="175" fill="%23a8dadc" font-size="15" text-anchor="end">رقم الرخصة: DL-967-2025</text><text x="450" y="210" fill="%23a8dadc" font-size="15" text-anchor="end">تاريخ الانتهاء: 2030/12/31</text><rect x="30" y="280" width="540" height="70" rx="8" fill="%230d1b2a"/><text x="540" y="320" fill="%23a8dadc" font-size="13" text-anchor="end">تصريح قيادة ساري ومعتمد محلياً ودولياً</text></svg>',
      size: 98400,
      createdAt: '2026-11-02T14:30:00Z',
      tag: 'تراخيص'
    }
  ],
  files: [
    {
      id: 'file-1',
      name: 'وثيقة_التأمين_الصحي_الشامل_2026.pdf',
      type: 'application/pdf',
      size: 2450000,
      createdAt: '2026-10-28T09:00:00Z',
      notes: 'عقد التأمين الطبي ساري المفعول مع تغطية شاملة للطوارئ'
    },
    {
      id: 'file-2',
      name: 'ملاحظات_حسابات_واستثمارات_سرية.txt',
      type: 'text/plain',
      size: 14200,
      createdAt: '2026-11-03T18:20:00Z',
      notes: 'أرقام الحسابات البنكية ومفاتيح الاسترداد الاحتياطية'
    },
    {
      id: 'file-3',
      name: 'عقد_إيجار_المقر_الرسمي.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 890000,
      createdAt: '2026-10-15T12:00:00Z',
      notes: 'عقد موثق لدى الجهات الرسمية'
    }
  ],
  contacts: [
    {
      id: 'contact-1',
      name: 'أحمد ناصر الحافي (الحساب الأساسي)',
      phone: '+967780254954',
      category: 'عام',
      createdAt: '2026-11-01T08:00:00Z'
    },
    {
      id: 'contact-2',
      name: 'طوارئ الإسعاف والإنقاذ الطبي',
      phone: '191',
      category: 'طوارئ',
      createdAt: '2026-11-01T08:05:00Z'
    },
    {
      id: 'contact-3',
      name: 'ناصر الحافي (طوارئ العائلة)',
      phone: '+967771234567',
      category: 'طوارئ',
      createdAt: '2026-11-01T08:10:00Z'
    },
    {
      id: 'contact-4',
      name: 'خدمة كبار العملاء - البنك المركزي',
      phone: '+9671234500',
      category: 'بنك',
      createdAt: '2026-11-02T11:20:00Z'
    },
    {
      id: 'contact-5',
      name: 'المستشار القانوني الخاص',
      phone: '+967779876543',
      category: 'عمل',
      createdAt: '2026-11-03T16:00:00Z'
    }
  ],
  healthProfile: DEFAULT_HEALTH_PROFILE,
  lastBackupDate: new Date().toISOString()
};

export function getVaultData(): VaultData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveVaultData(DEFAULT_VAULT_DATA);
      return DEFAULT_VAULT_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_VAULT_DATA,
      ...parsed,
      healthProfile: {
        ...DEFAULT_HEALTH_PROFILE,
        ...(parsed.healthProfile || {})
      }
    };
  } catch (e) {
    console.error('Failed to load vault data:', e);
    return DEFAULT_VAULT_DATA;
  }
}

export function saveVaultData(data: VaultData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save vault data:', e);
  }
}

export function resetVaultToDefault(): VaultData {
  saveVaultData(DEFAULT_VAULT_DATA);
  return DEFAULT_VAULT_DATA;
}

export function exportVaultJson(data: VaultData): string {
  return JSON.stringify(
    {
      ...data,
      exportedAt: new Date().toISOString(),
      vaultVersion: '1.0-encrypted',
      appName: 'الخزنة الرقمية الشخصية'
    },
    null,
    2
  );
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
