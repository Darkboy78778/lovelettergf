import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

export type GiftTheme = 'love' | 'birthday' | 'friendship' | 'romantic' | 'surprise';

export interface GiftData {
  gift_id: string;
  sender_name: string;
  recipient_name: string;
  message: string;
  photos: string[];
  video_url?: string;
  theme: GiftTheme;
  unlock_date?: string;
  password?: string;
  created_at: string;
}

export async function saveGift(data: Omit<GiftData, 'gift_id' | 'created_at'>): Promise<GiftData> {
  const gift_id = uuidv4();
  
  const { data: inserted, error } = await supabase
    .from('gifts')
    .insert({
      gift_id,
      sender_name: data.sender_name,
      recipient_name: data.recipient_name,
      message: data.message,
      photos: data.photos,
      theme: data.theme,
      unlock_date: data.unlock_date || null,
      password: data.password || null,
      video_url: data.video_url || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    gift_id: inserted.gift_id,
    sender_name: inserted.sender_name,
    recipient_name: inserted.recipient_name,
    message: inserted.message,
    photos: inserted.photos || [],
    theme: inserted.theme as GiftTheme,
    unlock_date: inserted.unlock_date || undefined,
    password: inserted.password || undefined,
    created_at: inserted.created_at,
  };
}

export async function getGift(id: string): Promise<GiftData | null> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('gift_id', id)
    .single();

  if (error || !data) return null;

  return {
    gift_id: data.gift_id,
    sender_name: data.sender_name,
    recipient_name: data.recipient_name,
    message: data.message,
    photos: data.photos || [],
    theme: data.theme as GiftTheme,
    unlock_date: data.unlock_date || undefined,
    password: data.password || undefined,
    created_at: data.created_at,
  };
}

export function isGiftLocked(gift: GiftData): boolean {
  if (!gift.unlock_date) return false;
  return new Date() < new Date(gift.unlock_date);
}
