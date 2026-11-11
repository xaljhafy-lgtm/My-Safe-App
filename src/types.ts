export interface VaultPhoto {
  id: string;
  name: string;
  caption?: string;
  dataUrl: string;
  size: number;
  createdAt: string;
  tag?: string;
}

export interface VaultFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  createdAt: string;
  notes?: string;
}

export interface VaultContact {
  id: string;
  name: string;
  phone: string;
  category: 'طوارئ' | 'عائلة' | 'بنك' | 'عمل' | 'عام';
  createdAt: string;
}

export interface HealthProfile {
  fullName: string;
  bloodType: string;
  accountNumber: string;
  quickAccessPin: string;
  nationalId?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface VaultData {
  photos: VaultPhoto[];
  files: VaultFile[];
  contacts: VaultContact[];
  healthProfile: HealthProfile;
  lastBackupDate?: string;
}
