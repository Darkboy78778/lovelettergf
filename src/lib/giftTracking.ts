import { supabase } from '@/integrations/supabase/client';

export type EventType = 'opened' | 'letter_viewed' | 'video_started' | 'video_completed';
export type ReactionType = '❤️' | '🥺' | '😍' | '🎉';

export async function trackEvent(giftId: string, eventType: EventType, metadata: Record<string, unknown> = {}) {
  await supabase.from('gift_events').insert({
    gift_id: giftId,
    event_type: eventType,
    metadata: metadata as any,
  } as any);
}

export async function sendReaction(giftId: string, reactionType: ReactionType) {
  await supabase.from('gift_reactions').insert({
    gift_id: giftId,
    reaction_type: reactionType,
  } as any);
}

export async function getGiftEvents(giftId: string) {
  const { data } = await (supabase as any)
    .from('gift_events')
    .select('*')
    .eq('gift_id', giftId)
    .order('created_at', { ascending: true });
  return data || [];
}

export async function getGiftReactions(giftId: string) {
  const { data } = await (supabase as any)
    .from('gift_reactions')
    .select('*')
    .eq('gift_id', giftId)
    .order('created_at', { ascending: true });
  return data || [];
}

export async function getGiftBySenderToken(senderToken: string) {
  const { data } = await supabase
    .from('gifts')
    .select('*')
    .eq('sender_token' as any, senderToken)
    .single();
  return data;
}
