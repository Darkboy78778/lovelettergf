
CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id TEXT NOT NULL UNIQUE,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  message TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  theme TEXT NOT NULL DEFAULT 'love',
  unlock_date TIMESTAMPTZ,
  password TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gifts are publicly readable" ON public.gifts FOR SELECT USING (true);

CREATE POLICY "Anyone can create gifts" ON public.gifts FOR INSERT WITH CHECK (true);
