import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Eye, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGift, GiftData } from '@/lib/giftStorage';
import { useState, useEffect } from 'react';
import FloatingHearts from '@/components/FloatingHearts';

const ShareGift = () => {
  const { id } = useParams<{ id: string }>();
  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Gift not found</h1>
          <Link to="/">
            <Button variant="default" className="rounded-full font-body">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const giftUrl = `${window.location.origin}/gift/${gift.gift_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(giftUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#fdf6f0';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 50, 50, 300, 300);
      }
      const a = document.createElement('a');
      a.download = `surprise-gift-${gift.gift_id}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen gradient-romantic relative">
      <FloatingHearts count={6} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body"
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-5xl mb-4"
          >
            🎉
          </motion.div>
          <h1 className="font-display text-3xl font-bold mb-2">Gift Created!</h1>
          <p className="text-muted-foreground font-body mb-8">
            Share the link or QR code with {gift.recipient_name}
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-8 inline-block mb-6"
          >
            <QRCodeSVG
              id="qr-code"
              value={giftUrl}
              size={200}
              fgColor="hsl(340, 45%, 65%)"
              bgColor="transparent"
              level="H"
              includeMargin
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4 mb-6"
          >
            <p className="text-xs text-muted-foreground font-body mb-2">Shareable Link</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-body bg-background/50 px-3 py-2 rounded-lg flex-1 truncate">
                {giftUrl}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-full shrink-0">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button onClick={handleDownloadQR} variant="outline" className="rounded-full font-body gap-2">
              <Download size={16} />
              Download QR Code
            </Button>
            <Link to={`/gift/${gift.gift_id}`}>
              <Button className="rounded-full font-body gap-2 w-full">
                <Eye size={16} />
                Preview Gift
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShareGift;
