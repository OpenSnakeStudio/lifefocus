-- Make all profiles permanently public
-- Set all existing profiles to is_public = true
UPDATE public.profiles SET is_public = true WHERE is_public IS NULL OR is_public = false;

-- Set default value for is_public to true
ALTER TABLE public.profiles ALTER COLUMN is_public SET DEFAULT true;

-- Drop RLS policies that check is_public for viewing and recreate without that check
-- (profiles are always public)

-- Drop existing select policy if it checks is_public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create new policy that allows viewing all profiles (they're always public)
CREATE POLICY "All profiles are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (true);