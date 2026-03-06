import { v4 as uuidv4 } from 'uuid';

export type GiftTheme = 'love' | 'birthday' | 'friendship' | 'romantic' | 'surprise';

export interface GiftData {
  gift_id: string;
  sender_name: string;
  recipient_name: string;
  message: string;
  photos: string[]; // base64 data URLs
  theme: GiftTheme;
  unlock_date?: string;
  password?: string;
  created_at: string;
}

const STORAGE_KEY = 'surprise_gifts';

function getAllGifts(): Record<string, GiftData> {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function saveGift(data: Omit<GiftData, 'gift_id' | 'created_at'>): GiftData {
  const gift: GiftData = {
    ...data,
    gift_id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  const all = getAllGifts();
  all[gift.gift_id] = gift;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return gift;
}

export function getGift(id: string): GiftData | null {
  const all = getAllGifts();
  return all[id] || null;
}

export function isGiftLocked(gift: GiftData): boolean {
  if (!gift.unlock_date) return false;
  return new Date() < new Date(gift.unlock_date);
}
