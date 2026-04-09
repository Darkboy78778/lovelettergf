
-- Add tracking columns to gifts table
ALTER TABLE public.gifts 
ADD COLUMN tracking_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN sender_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex');

-- Create gift_events table
CREATE TABLE public.gift_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id text NOT NULL,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_gift_events_gift_id ON public.gift_events (gift_id);

ALTER TABLE public.gift_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create gift events"
ON public.gift_events FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Events are publicly readable"
ON public.gift_events FOR SELECT
TO public
USING (true);

-- Create gift_reactions table
CREATE TABLE public.gift_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id text NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_gift_reactions_gift_id ON public.gift_reactions (gift_id);

ALTER TABLE public.gift_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create gift reactions"
ON public.gift_reactions FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Reactions are publicly readable"
ON public.gift_reactions FOR SELECT
TO public
USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_reactions;
