import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Upload, ArrowLeft, Sparkles, Loader2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { saveGift, GiftTheme } from '@/lib/giftStorage';
import FloatingHearts from '@/components/FloatingHearts';
import VideoUpload from '@/components/VideoUpload';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const themes: { value: GiftTheme; label: string; emoji: string }[] = [
  { value: 'love', label: 'Love', emoji: '❤️' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'friendship', label: 'Friendship', emoji: '🤝' },
  { value: 'romantic', label: 'Romantic', emoji: '🌹' },
  { value: 'surprise', label: 'Surprise', emoji: '🎉' },
];

const CreateGift = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [theme, setTheme] = useState<GiftTheme>('love');
  const [unlockDate, setUnlockDate] = useState('');
  const [password, setPassword] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !senderName || !message) return;

    setIsSubmitting(true);
    try {
      const gift = await saveGift({
        sender_name: senderName,
        recipient_name: recipientName,
        message,
        photos,
        theme,
        unlock_date: unlockDate || undefined,
        password: password || undefined,
        video_url: videoUrl || undefined,
      });
      navigate(`/share/${gift.gift_id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create gift. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-romantic relative">
      <FloatingHearts count={6} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles size={16} />
              <span className="text-sm font-medium font-body">Create Magic</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Create Your Gift
            </h1>
            <p className="text-muted-foreground mt-2 font-body">
              Fill in the details to create a magical surprise
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body font-medium">Recipient Name *</Label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Who is this for?"
                    required
                    className="rounded-xl bg-background/50 font-body"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body font-medium">Your Name *</Label>
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="rounded-xl bg-background/50 font-body"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-body font-medium">Your Message *</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your heartfelt message here..."
                  required
                  rows={6}
                  className="rounded-xl bg-background/50 font-body resize-none"
                />
              </div>

              {/* Theme Selection */}
              <div className="space-y-2">
                <Label className="font-body font-medium">Theme</Label>
                <div className="flex flex-wrap gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTheme(t.value)}
                      className={`px-4 py-2 rounded-full text-sm font-body transition-all ${
                        theme === t.value
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-background/50 text-foreground hover:bg-primary/10'
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="font-body font-medium">Upload Photos</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="mx-auto text-muted-foreground mb-2" size={24} />
                  <p className="text-sm text-muted-foreground font-body">
                    Click to upload photos
                  </p>
                </div>
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Upload ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
              )}
              </div>

              {/* Video Upload */}
              <VideoUpload videoUrl={videoUrl} onVideoChange={setVideoUrl} />

              {/* Unlock Date */}
              <div className="space-y-2">
                <Label className="font-body font-medium">Unlock Date (optional)</Label>
                <Input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="rounded-xl bg-background/50 font-body"
                />
                <p className="text-xs text-muted-foreground font-body">
                  The letter won't be visible until this date
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="font-body font-medium">Password Protection (optional)</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password"
                  className="rounded-xl bg-background/50 font-body"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full rounded-full text-lg font-body gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Heart size={18} className="fill-primary-foreground" />
              )}
              {isSubmitting ? 'Creating...' : 'Create Surprise Gift'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateGift;
