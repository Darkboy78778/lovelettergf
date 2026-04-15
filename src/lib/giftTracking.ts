import { supabase } from '@/integrations/supabase/client';

export type EventType = 'opened' | 'letter_viewed' | 'video_started' | 'video_completed' | 'note_reading' | 'note_left';
export type ReactionType = '❤️' | '🥺' | '😍' | '🎉';

function getDeviceInfo(): Record<string, string> {
  const ua = navigator.userAgent;
  let device_model = 'Unknown Device';
  let device_type = 'Unknown';

  // Try to extract device model from UA
  if (/iPhone/.test(ua)) {
    device_type = 'iPhone';
    device_model = 'iPhone';
  } else if (/iPad/.test(ua)) {
    device_type = 'iPad';
    device_model = 'iPad';
  } else if (/Android/.test(ua)) {
    device_type = 'Android';
    // Extract model: "Android X.X; MODEL)" or "Android X.X; xx-xx; MODEL)"
    const modelMatch = ua.match(/Android\s[\d.]+;\s(?:[a-zA-Z]{2}-[a-zA-Z]{2};\s)?(.+?)(?:\s?Build|[);])/);
    if (modelMatch) {
      device_model = modelMatch[1].trim();
    } else {
      device_model = 'Android Device';
    }
  } else if (/Windows/.test(ua)) {
    device_type = 'Desktop';
    device_model = 'Windows PC';
  } else if (/Mac OS/.test(ua)) {
    device_type = 'Desktop';
    device_model = 'Mac';
  } else if (/Linux/.test(ua)) {
    device_type = 'Desktop';
    device_model = 'Linux PC';
  }

  return { device_model, device_type, user_agent: ua };
}

export async function trackEvent(giftId: string, eventType: EventType, metadata: Record<string, unknown> = {}) {
  const deviceInfo = getDeviceInfo();
  const enrichedMetadata = { ...metadata, ...deviceInfo };

  // Call edge function to capture IP server-side
  try {
    await supabase.functions.invoke('track-event', {
      body: {
        gift_id: giftId,
        event_type: eventType,
        metadata: enrichedMetadata,
      },
    });
  } catch {
    // Fallback to direct insert without IP
    await supabase.from('gift_events').insert({
      gift_id: giftId,
      event_type: eventType,
      metadata: enrichedMetadata as any,
    } as any);
  }
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
  const { data } = await (supabase as any)
    .from('gifts')
    .select('*')
    .eq('sender_token', senderToken)
    .single();
  return data;
}
