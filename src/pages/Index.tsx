import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Gift, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingHearts from '@/components/FloatingHearts';
import SparkleParticles from '@/components/SparkleParticles';

const Index = () => {
  return (
    <div className="min-h-screen gradient-romantic relative overflow-hidden">
      <FloatingHearts count={10} />
      <SparkleParticles count={15} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Heart className="text-primary fill-primary" size={24} />
          <span className="font-display text-xl font-bold text-foreground">
            SurpriseLetters
          </span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/create">
            <Button variant="default" size="sm" className="rounded-full font-body">
              Create Gift
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8"
          >
            <Gift size={16} />
            <span className="text-sm font-medium font-body">Send love, digitally</span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Create a{' '}
            <span className="text-gradient-gold italic">Surprise Letter</span>
            <br />
            for Someone Special
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 font-body">
            Craft beautiful digital letters with animations, photos, and QR codes.
            Perfect for birthdays, love notes, anniversaries, and more.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/create">
              <Button size="lg" className="rounded-full px-8 text-lg font-body gap-2">
                <Send size={18} />
                Create Your Gift
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto w-full"
        >
          {[
            {
              icon: '✉️',
              title: 'Write Your Letter',
              desc: 'Pour your heart into a beautiful message with photos',
            },
            {
              icon: '🎁',
              title: 'Animated Surprise',
              desc: 'Recipients see a cinematic gift opening experience',
            },
            {
              icon: '📱',
              title: 'Share via QR Code',
              desc: 'Generate a styled QR code to share anywhere',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
