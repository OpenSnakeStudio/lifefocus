-- Create user_subscriptions table for following users
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can subscribe to others" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unsubscribe" 
ON public.user_subscriptions 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Create indexes
CREATE INDEX idx_user_subscriptions_follower ON public.user_subscriptions(follower_id);
CREATE INDEX idx_user_subscriptions_following ON public.user_subscriptions(following_id);

-- Add notification settings columns to notification_settings table
ALTER TABLE public.notification_settings
ADD COLUMN IF NOT EXISTS likes_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS comments_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS subscriptions_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '23:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '07:00';

-- Create trigger function for new post notifications to subscribers
CREATE OR REPLACE FUNCTION public.notify_subscribers_on_new_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  author_name TEXT;
  subscriber RECORD;
BEGIN
  -- Get author name
  SELECT COALESCE(display_name, 'Пользователь') INTO author_name
  FROM public.profiles 
  WHERE user_id = NEW.user_id;
  
  -- Notify all subscribers
  FOR subscriber IN 
    SELECT follower_id FROM public.user_subscriptions WHERE following_id = NEW.user_id
  LOOP
    INSERT INTO public.user_notifications (user_id, type, title, message, reference_id, reference_type, actor_id)
    VALUES (subscriber.follower_id, 'new_post', '📸 Новая публикация', author_name || ' опубликовал(а) новый пост', NEW.id, 'post', NEW.user_id);
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new posts
DROP TRIGGER IF EXISTS notify_subscribers_on_post ON public.achievement_posts;
CREATE TRIGGER notify_subscribers_on_post
AFTER INSERT ON public.achievement_posts
FOR EACH ROW
EXECUTE FUNCTION public.notify_subscribers_on_new_post();