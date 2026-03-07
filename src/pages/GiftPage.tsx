import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGift, isGiftLocked, GiftData } from '@/lib/giftStorage';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingHearts from '@/components/FloatingHearts';
import SparkleParticles from '@/components/SparkleParticles';
import GiftBox from '@/components/GiftBox';
import ChibiDecorations from '@/components/ChibiDecorations';
import OpeningAnimation from '@/components/OpeningAnimation';

const GiftPage = () => {
  const { id } = useParams<{ id: string }>();
  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<'intro' | 'opening' | 'revealed'>('intro');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const data = await getGift(id);
        setGift(data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleOpeningComplete = useCallback(() => {
    setStage('revealed');
  }, []);

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
          <p className="text-5xl mb-4">💔</p>
          <h1 className="font-display text-2xl font-bold mb-2">Gift Not Found</h1>
          <p className="text-muted-foreground font-body">This gift doesn't exist or has been removed.</p>
        </motion.div>
      </div>
    );
  }

  if (isGiftLocked(gift)) {
    const unlockDate = new Date(gift.unlock_date!);
    return (
      <div className="min-h-screen gradient-romantic flex items-center justify-center">
        <FloatingHearts count={8} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-6 relative z-10">
          <Lock className="mx-auto text-primary mb-4" size={48} />
          <h1 className="font-display text-2xl font-bold mb-2">Not Yet!</h1>
          <p className="text-muted-foreground font-body mb-4">This surprise will unlock on</p>
          <div className="glass-card rounded-2xl px-6 py-4 inline-block">
            <p className="font-display text-xl font-semibold text-primary">
              {unlockDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-muted-foreground font-body mt-1">
              at {unlockDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gift.password && !authenticated) {
    return (
      <div className="min-h-screen gradient-romantic flex items-center justify-center">
        <FloatingHearts count={6} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6 relative z-10 max-w-sm w-full">
          <Lock className="mx-auto text-primary mb-4" size={48} />
          <h1 className="font-display text-2xl font-bold mb-2">Password Protected</h1>
          <p className="text-muted-foreground font-body mb-6">Enter the password to view this gift</p>
          <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === gift.password) { setAuthenticated(true); setPasswordError(false); } else { setPasswordError(true); } }} className="space-y-3">
            <Input type="password" value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }} placeholder="Enter password" className="rounded-xl text-center font-body" />
            {passwordError && <p className="text-destructive text-sm font-body">Incorrect password</p>}
            <Button type="submit" className="w-full rounded-full font-body">Unlock</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  const themeEmoji: Record<string, string> = { love: '❤️', birthday: '🎂', friendship: '🤝', romantic: '🌹', surprise: '🎉' };

  return (
    <div className="min-h-screen gradient-romantic relative overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex items-center justify-center relative"
          >
            <FloatingHearts count={14} />
            <SparkleParticles count={25} />
            <ChibiDecorations />

            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.3 }}
              className="relative z-10"
            >
              <GiftBox
                senderName={gift.sender_name}
                theme={gift.theme}
                onOpen={() => setStage('opening')}
              />
            </motion.div>
          </motion.div>
        )}

        {stage === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SparkleParticles count={35} />
            <OpeningAnimation theme={gift.theme} onComplete={handleOpeningComplete} />
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen py-12 px-4"
          >
            <FloatingHearts count={8} />
            <SparkleParticles count={15} />
            <div className="relative z-10 max-w-lg mx-auto">
              {/* Letter card */}
              <motion.div
                initial={{ opacity: 0, y: 60, rotateX: 30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="glass-card rounded-2xl p-8 md:p-10 mb-8"
              >
                <motion.div
                  className="text-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                >
                  <span className="text-4xl">{themeEmoji[gift.theme]}</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="font-display text-2xl font-bold text-center mb-2"
                >
                  Dear {gift.recipient_name},
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 1 }}
                  className="font-body text-foreground/90 leading-relaxed whitespace-pre-wrap text-center mt-6"
                >
                  {gift.message}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="font-display text-lg text-right mt-8 text-primary italic"
                >
                  With love, {gift.sender_name} 💕
                </motion.p>
              </motion.div>

              {/* Photos as polaroids */}
              {gift.photos.length > 0 && (
                <div className="space-y-6">
                  {gift.photos.map((photo, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 50, rotate: i % 2 === 0 ? -5 : 5, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -2 : 2, scale: 1 }}
                      transition={{ delay: 1.8 + i * 0.4, duration: 0.8, type: 'spring' }}
                      className="glass-card rounded-xl p-3 shadow-xl mx-auto max-w-xs"
                    >
                      <img src={photo} alt={`Memory ${i + 1}`} className="w-full rounded-lg" />
                      <div className="h-6 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-body">📸 Memory {i + 1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-center text-sm text-muted-foreground font-body mt-8"
              >
                Made with ❤️ using SurpriseLetters
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftPage;
