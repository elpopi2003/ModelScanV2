
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Kits catalog table (shared/public reference data)
CREATE TABLE public.kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  scale TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  reference TEXT,
  barcode TEXT,
  image_url TEXT,
  scalemates_url TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;

-- Kits catalog is readable by all authenticated users
CREATE POLICY "Authenticated users can view kits"
  ON public.kits FOR SELECT
  USING (auth.role() = 'authenticated');

-- Any authenticated user can add to catalog
CREATE POLICY "Authenticated users can insert kits"
  ON public.kits FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- User kits (personal stash)
CREATE TABLE public.user_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'stash' CHECK (status IN ('stash', 'in-progress', 'completed', 'wishlist')),
  notes TEXT,
  purchase_date DATE,
  price NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own kits"
  ON public.user_kits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kits"
  ON public.user_kits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kits"
  ON public.user_kits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kits"
  ON public.user_kits FOR DELETE
  USING (auth.uid() = user_id);

-- User kit photos table
CREATE TABLE public.user_kit_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_kit_id UUID NOT NULL REFERENCES public.user_kits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_kit_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own photos"
  ON public.user_kit_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos"
  ON public.user_kit_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON public.user_kit_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_kits_updated_at
  BEFORE UPDATE ON public.user_kits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for kit photos (PRIVATE — access via signed URLs / owner RLS only)
INSERT INTO storage.buckets (id, name, public) VALUES ('kit-photos', 'kit-photos', false);

CREATE POLICY "Users can upload their own kit photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own kit photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own kit photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'kit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes
CREATE INDEX idx_user_kits_user_id ON public.user_kits(user_id);
CREATE INDEX idx_user_kits_kit_id ON public.user_kits(kit_id);
CREATE INDEX idx_user_kits_status ON public.user_kits(status);
CREATE INDEX idx_kits_barcode ON public.kits(barcode);
CREATE INDEX idx_kits_brand ON public.kits(brand);
