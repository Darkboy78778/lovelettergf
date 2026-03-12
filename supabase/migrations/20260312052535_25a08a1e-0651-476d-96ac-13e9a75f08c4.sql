
-- Add video_url column to gifts table
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS video_url text DEFAULT NULL;

-- Create storage bucket for gift videos
INSERT INTO storage.buckets (id, name, public) VALUES ('gift-videos', 'gift-videos', true) ON CONFLICT DO NOTHING;

-- Allow public uploads to gift-videos bucket
CREATE POLICY "Anyone can upload gift videos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'gift-videos');

-- Allow public reads from gift-videos bucket
CREATE POLICY "Gift videos are publicly readable" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gift-videos');
