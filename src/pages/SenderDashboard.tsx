import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, Play, CheckCircle, Loader2, Clock, BarChart3, History } from 'lucide-react';
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

interface PeriodData {
  label: string;
  startDate: Date;
  endDate: Date;
  events: TimelineEvent[];
  reactions: Reaction[];
  viewCount: number;
  isCurrent: boolean;
}

const eventConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  opened: { icon: <Eye size={16} />, label: 'Gift Viewed', color: 'text-green-500' },
  letter_viewed: { icon: <Mail size={16} />, label: 'Letter Viewed', color: 'text-blue-500' },
  video_started: { icon: <Play size={16} />, label: 'Video Started', color: 'text-purple-500' },
  video_completed: { icon: <CheckCircle size={16} />, label: 'Video Watched', color: 'text-pink-500' },
  note_reading: { icon: <Eye size={16} />, label: 'Reading Note', color: 'text-emerald-500' },
  note_left: { icon: <EyeOff size={16} />, label: 'Left Note', color: 'text-orange-500' },
};

const SenderDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const [gift, setGift] = useState<any>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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

  // Compute periods (2-day windows) from first opened event
  const { periods, totalViews, timeSinceFirstOpen, firstOpenDate } = useMemo(() => {
    const openedEvents = events.filter(e => e.event_type === 'opened');
    const totalViews = openedEvents.length;

    if (openedEvents.length === 0) {
      return { periods: [] as PeriodData[], totalViews: 0, timeSinceFirstOpen: null, firstOpenDate: null };
    }

    const firstOpen = new Date(openedEvents[0].created_at);
    const now = new Date();
    const diffMs = now.getTime() - firstOpen.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    let timeSinceFirstOpen: string;
    if (diffDays > 0) {
      timeSinceFirstOpen = `${diffDays}d ${remainingHours}h ago`;
    } else if (diffHours > 0) {
      timeSinceFirstOpen = `${diffHours}h ago`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      timeSinceFirstOpen = `${Math.max(1, diffMins)}m ago`;
    }

    // Build 2-day periods from first open
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    const periods: PeriodData[] = [];
    let periodStart = new Date(firstOpen);

    while (periodStart.getTime() <= now.getTime()) {
      const periodEnd = new Date(periodStart.getTime() + TWO_DAYS_MS);
      const isCurrent = now.getTime() < periodEnd.getTime();

      const periodEvents = events.filter(e => {
        const t = new Date(e.created_at).getTime();
        return t >= periodStart.getTime() && t < periodEnd.getTime();
      });

      const periodReactions = reactions.filter(r => {
        const t = new Date(r.created_at).getTime();
        return t >= periodStart.getTime() && t < periodEnd.getTime();
      });

      const viewCount = periodEvents.filter(e => e.event_type === 'opened').length;

      const label = isCurrent
        ? 'Current Period'
        : `${formatDateShort(periodStart)} – ${formatDateShort(new Date(periodEnd.getTime() - 1))}`;

      periods.push({
        label,
        startDate: new Date(periodStart),
        endDate: periodEnd,
        events: periodEvents,
        reactions: periodReactions,
        viewCount,
        isCurrent,
      });

      periodStart = new Date(periodEnd);
    }

    return { periods: periods.reverse(), totalViews, timeSinceFirstOpen, firstOpenDate: firstOpen };
  }, [events, reactions]);

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

  const currentPeriod = periods.find(p => p.isCurrent);
  const historyPeriods = periods.filter(p => !p.isCurrent);

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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {/* View Count */}
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <BarChart3 size={20} className="text-primary" />
            </div>
            <p className="font-display font-bold text-2xl">{totalViews}</p>
            <p className="text-xs text-muted-foreground font-body">Total Views</p>
          </div>

          {/* Time Since First Open */}
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-2">
              <Clock size={20} className="text-pink-500" />
            </div>
            <p className="font-display font-bold text-lg">
              {timeSinceFirstOpen || '—'}
            </p>
            <p className="text-xs text-muted-foreground font-body">Since First Open</p>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
                {isOpened && firstOpenDate
                  ? `First opened ${formatDateFull(firstOpenDate)} at ${formatTimeFull(firstOpenDate)}`
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

        {/* Current Period Timeline */}
        {currentPeriod && currentPeriod.events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">📝 Current Activity</h2>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-body">
                {currentPeriod.viewCount} view{currentPeriod.viewCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-body mb-3">
              Resets every 2 days · History is preserved below
            </p>
            <div className="space-y-3">
              {currentPeriod.events.map((event, i) => {
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
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
                    <div className="flex-1">
                      <p className="font-body font-medium text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {formatDateFull(new Date(event.created_at))} at {formatTimeFull(new Date(event.created_at))}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* History Toggle */}
        {historyPeriods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <History size={18} className="text-muted-foreground" />
                <span className="font-display font-bold text-sm">
                  📜 View History ({historyPeriods.length} period{historyPeriods.length !== 1 ? 's' : ''})
                </span>
              </div>
              <motion.span
                animate={{ rotate: showHistory ? 180 : 0 }}
                className="text-muted-foreground"
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {historyPeriods.map((period, pi) => (
                    <div key={pi} className="glass-card rounded-2xl p-5 mt-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-display font-bold text-sm">{period.label}</p>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-body">
                          {period.viewCount} view{period.viewCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {period.events.map((event) => {
                          const config = eventConfig[event.event_type] || {
                            icon: <Eye size={14} />,
                            label: event.event_type,
                            color: 'text-muted-foreground',
                          };
                          return (
                            <div key={event.id} className="flex items-start gap-2 text-sm">
                              <div className={`mt-0.5 ${config.color} opacity-70`}>{config.icon}</div>
                              <div className="flex-1">
                                <span className="font-body text-xs">{config.label}</span>
                                <span className="text-xs text-muted-foreground font-body ml-2">
                                  {formatTimeFull(new Date(event.created_at))}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {period.reactions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-muted/30">
                          <div className="flex flex-wrap gap-1">
                            {period.reactions.map(r => (
                              <span key={r.id} className="text-sm">{r.reaction_type}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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

// Helper functions
function formatDateShort(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeFull(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default SenderDashboard;
