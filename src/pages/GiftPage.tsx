import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGift, isGiftLocked } from '@/lib/giftStorage';
import { Lock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingHearts from '@/components/FloatingHearts';
import SparkleParticles from '@/components/SparkleParticles';

const GiftPage = () => {
  const { id } = useParams<{ id: string }>();
  const gift = id ? getGift(id) : null;
  const [stage, setStage] = useState<'intro' | 'opening' | 'revealed'>('intro');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

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

  // Date lock
  if (isGiftLocked(gift)) {
    const unlockDate = new Date(gift.unlock_date!);
    return (
      <div className="min-h-screen gradient-romantic flex items-center justify-center">
        <FloatingHearts count={8} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6 relative z-10"
        >
          <Lock className="mx-auto text-primary mb-4" size={48} />
          <h1 className="font-display text-2xl font-bold mb-2">Not Yet!</h1>
          <p className="text-muted-foreground font-body mb-4">
            This surprise will unlock on
          </p>
          <div className="glass-card rounded-2xl px-6 py-4 inline-block">
            <p className="font-display text-xl font-semibold text-primary">
              {unlockDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-muted-foreground font-body mt-1">
              at {unlockDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Password protection
  if (gift.password && !authenticated) {
    return (
      <div className="min-h-screen gradient-romantic flex items-center justify-center">
        <FloatingHearts count={6} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-6 relative z-10 max-w-sm w-full"
        >
          <Lock className="mx-auto text-primary mb-4" size={48} />
          <h1 className="font-display text-2xl font-bold mb-2">Password Protected</h1>
          <p className="text-muted-foreground font-body mb-6">Enter the password to view this gift</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === gift.password) {
                setAuthenticated(true);
                setPasswordError(false);
              } else {
                setPasswordError(true);
              }
            }}
            className="space-y-3"
          >
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              placeholder="Enter password"
              className="rounded-xl text-center font-body"
            />
            {passwordError && (
              <p className="text-destructive text-sm font-body">Incorrect password</p>
            )}
            <Button type="submit" className="w-full rounded-full font-body">
              Unlock
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  const themeEmoji = {
    love: '❤️',
    birthday: '🎂',
    friendship: '🤝',
    romantic: '🌹',
    surprise: '🎉',
  };

  return (
    <div className="min-h-screen gradient-romantic relative overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <FloatingHearts count={12} />
            <SparkleParticles count={20} />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
              className="text-8xl mb-8"
            >
              {gift.theme === 'birthday' ? '🎁' : '💌'}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-display text-2xl md:text-3xl font-bold text-center mb-3"
            >
              A letter for you
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground font-body text-lg mb-8"
            >
              from <span className="text-primary font-semibold">{gift.sender_name}</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button
                size="lg"
                onClick={() => {
                  setStage('opening');
                  setTimeout(() => setStage('revealed'), 2000);
                }}
                className="rounded-full px-10 text-lg font-body gap-2 animate-float"
              >
                <Heart size={18} className="fill-primary-foreground" />
                Tap to Open
              </Button>
            </motion.div>
          </motion.div>
        )}

        {stage === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <SparkleParticles count={30} />
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 180, scale: [1, 1.2, 0.8] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="text-9xl"
            >
              {gift.theme === 'birthday' ? '🎁' : '💌'}
            </motion.div>
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
              {/* Letter */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-card rounded-2xl p-8 md:p-10 mb-8"
              >
                <div className="text-center mb-6">
                  <span className="text-3xl">{themeEmoji[gift.theme]}</span>
                </div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="font-display text-2xl font-bold text-center mb-2"
                >
                  Dear {gift.recipient_name},
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="font-body text-foreground/90 leading-relaxed whitespace-pre-wrap text-center mt-6"
                >
                  {gift.message}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="font-display text-lg text-right mt-8 text-primary italic"
                >
                  With love, {gift.sender_name} 💕
                </motion.p>
              </motion.div>

              {/* Photos */}
              {gift.photos.length > 0 && (
                <div className="space-y-4">
                  {gift.photos.map((photo, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -3 : 3 }}
                      animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -2 : 2 }}
                      transition={{ delay: 1.4 + i * 0.3, duration: 0.6 }}
                      className="glass-card rounded-xl p-3 shadow-lg"
                    >
                      <img
                        src={photo}
                        alt={`Memory ${i + 1}`}
                        className="w-full rounded-lg"
                      />
                      <div className="h-6" />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
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
