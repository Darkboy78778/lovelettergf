import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, X, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface VideoUploadProps {
  videoUrl: string;
  onVideoChange: (url: string) => void;
}

const VideoUpload = ({ videoUrl, onVideoChange }: VideoUploadProps) => {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Video must be under 50MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${ext}`;
      const { error } = await supabase.storage
        .from('gift-videos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('gift-videos')
        .getPublicUrl(fileName);

      onVideoChange(publicUrl);
    } catch {
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-body font-medium">Upload Video (optional, max 50MB)</Label>
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {videoUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border">
          <video src={videoUrl} controls className="w-full max-h-48 object-cover rounded-xl" />
          <button
            type="button"
            onClick={() => onVideoChange('')}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <motion.div
          onClick={() => !uploading && videoInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {uploading ? (
            <>
              <Loader2 className="mx-auto text-primary mb-2 animate-spin" size={24} />
              <p className="text-sm text-muted-foreground font-body">Uploading video...</p>
            </>
          ) : (
            <>
              <Video className="mx-auto text-muted-foreground mb-2" size={24} />
              <p className="text-sm text-muted-foreground font-body">Click to upload a video</p>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VideoUpload;
