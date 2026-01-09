-- Fix the handle_new_user function to also create user_stars record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  referrer_code text;
  referrer_user_id uuid;
BEGIN
  -- Get referral code from metadata
  referrer_code := new.raw_user_meta_data ->> 'referred_by';
  
  -- Find referrer by code
  IF referrer_code IS NOT NULL THEN
    SELECT user_id INTO referrer_user_id
    FROM public.profiles
    WHERE referral_code = referrer_code
    LIMIT 1;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name, avatar_url, referral_code, referred_by)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    lower(substr(md5(random()::text || new.id::text), 1, 8)),
    referrer_user_id
  );

  -- Create user_stars record
  INSERT INTO public.user_stars (user_id)
  VALUES (new.id);

  -- Create referral record if referrer exists
  IF referrer_user_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id)
    VALUES (referrer_user_id, new.id);
  END IF;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$;

-- Create unique constraint for daily_post_count upsert
ALTER TABLE public.daily_post_count
DROP CONSTRAINT IF EXISTS daily_post_count_user_date_unique;

ALTER TABLE public.daily_post_count
ADD CONSTRAINT daily_post_count_user_date_unique UNIQUE (user_id, post_date);

-- Create achievements storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('achievements', 'achievements', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for achievements bucket
DROP POLICY IF EXISTS "Anyone can view achievements" ON storage.objects;
CREATE POLICY "Anyone can view achievements"
ON storage.objects FOR SELECT
USING (bucket_id = 'achievements');

DROP POLICY IF EXISTS "Users can upload achievements" ON storage.objects;
CREATE POLICY "Users can upload achievements"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own achievements" ON storage.objects;
CREATE POLICY "Users can delete own achievements"
ON storage.objects FOR DELETE
USING (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Recreate avatars bucket policies (ensure they exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);