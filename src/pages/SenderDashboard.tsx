import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, Play, CheckCircle, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getGiftBySenderToken, getGiftEvents, getGiftReactions } from '@/lib/giftTracking';
import FloatingHearts from '@/components/FloatingHearts';

interface TimelineEvent {
  id: string;
  event_type: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface Reaction {
  id: string;
  reaction_type: string;
  created_at: string;
}

const eventConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  opened: { icon: <Eye size={16} />, label: 'Gift Opened', color: 'text-green-500' },
  letter_viewed: { icon: <Mail size={16} />, label: 'Letter Viewed', color: 'text-blue-500' },
  video_started: { icon: <Play size={16} />, label: 'Video Started', color: 'text-purple-500' },
  video_completed: { icon: <CheckCircle size={16} />, label: 'Video Watched', color: 'text-pink-500' },
};

const SenderDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const [gift, setGift] = useState<any>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const giftData = await getGiftBySenderToken(token);
      if (giftData) {
        setGift(giftData);
        const [evts, rxns] = await Promise.all([
          getGiftEvents(giftData.gift_id),
          getGiftReactions(giftData.gift_id),
        ]);
        setEvents(evts as TimelineEvent[]);
        setReactions(rxns as Reaction[]);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  // Realtime subscriptions
  useEffect(() => {
    if (!gift) return;

    const eventsChannel = supabase
      .channel(`events-${gift.gift_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'gift_events',
        filter: `gift_id=eq.${gift.gift_id}`,
      }, (payload) => {
        setEvents(prev => [...prev, payload.new as TimelineEvent]);
      })
      .subscribe();

    const reactionsChannel = supabase
      .channel(`reactions-${gift.gift_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'gift_reactions',
        filter: `gift_id=eq.${gift.gift_id}`,
      }, (payload) => {
        const newReaction = payload.new as Reaction;
        setReactions(prev => [...prev, newReaction]);
        setFloatingReaction(newReaction.reaction_type);
        setTimeout(() => setFloatingReaction(null), 2000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [gift]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-romantic flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen gradient-romantic flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-6">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="font-display text-2xl font-bold mb-2">Dashboard Not Found</h1>
          <p className="text-muted-foreground font-body">This dashboard link is invalid.</p>
        </motion.div>
      </div>
    );
  }

  const isOpened = events.some(e => e.event_type === 'opened');
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen gradient-romantic relative">
      <FloatingHearts count={5} />

      {/* Floating reaction popup */}
      <AnimatePresence>
        {floatingReaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1.5, y: -50 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 text-6xl z-50 pointer-events-none"
          >
            {floatingReaction}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body">
            <ArrowLeft size={18} />
            Back
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-4xl mb-2">📊</p>
          <h1 className="font-display text-2xl font-bold">Sender Dashboard</h1>
          <p className="text-muted-foreground font-body mt-1">
            Gift for <span className="text-primary font-semibold">{gift.recipient_name}</span>
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            {isOpened ? (
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Eye size={20} className="text-green-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <EyeOff size={20} className="text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-display font-bold text-lg">
                {isOpened ? 'Gift Opened! 🎉' : 'Not Opened Yet'}
              </p>
              <p className="text-sm text-muted-foreground font-body">
                {isOpened
                  ? `Opened at ${formatTime(events.find(e => e.event_type === 'opened')!.created_at)}`
                  : 'Waiting for the magic moment...'}
              </p>
            </div>
          </div>

          {!isOpened && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <Clock size={14} className="animate-pulse" />
              <span>Listening for updates in real time...</span>
            </div>
          )}
        </motion.div>

        {/* Timeline */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h2 className="font-display font-bold text-lg mb-4">📝 Activity Timeline</h2>
            <div className="space-y-4">
              {events.map((event, i) => {
                const config = eventConfig[event.event_type] || {
                  icon: <Eye size={16} />,
                  label: event.event_type,
                  color: 'text-muted-foreground',
                };
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
                    <div className="flex-1">
                      <p className="font-body font-medium text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {formatDate(event.created_at)} at {formatTime(event.created_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Reactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display font-bold text-lg mb-4">💕 Reactions Received</h2>
          {reactions.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-4">
              No reactions yet. They'll appear here in real time! ✨
            </p>
          ) : (
            <>
              <div className="flex justify-center gap-6 mb-4">
                {['❤️', '🥺', '😍', '🎉'].map(emoji => (
                  <div key={emoji} className="text-center">
                    <span className="text-2xl">{emoji}</span>
                    <p className="text-sm font-bold font-body mt-1">{reactionCounts[emoji] || 0}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {reactions.slice(-20).map((r) => (
                  <motion.span
                    key={r.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-lg"
                  >
                    {r.reaction_type}
                  </motion.span>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Gift Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link to={`/gift/${gift.gift_id}`}>
            <button className="text-sm text-primary font-body underline underline-offset-2">
              View Gift Page →
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default SenderDashboard;
