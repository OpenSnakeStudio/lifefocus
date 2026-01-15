-- Create notifications table for user notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'like', 'dislike', 'comment', 'mention', 'system'
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  reference_id UUID, -- post_id or comment_id
  reference_type TEXT, -- 'post', 'comment'
  actor_id UUID, -- who triggered the notification
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own notifications" 
ON public.user_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.user_notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- System can insert notifications (via triggers or edge functions)
CREATE POLICY "System can insert notifications" 
ON public.user_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX idx_user_notifications_is_read ON public.user_notifications(user_id, is_read);

-- Create function to create notification on post reaction
CREATE OR REPLACE FUNCTION public.notify_on_post_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  actor_name TEXT;
  post_desc TEXT;
  notif_type TEXT;
  notif_title TEXT;
BEGIN
  -- Get post owner
  SELECT user_id, COALESCE(description, 'публикации') INTO post_owner_id, post_desc
  FROM public.achievement_posts 
  WHERE id = NEW.post_id;
  
  -- Don't notify if user reacted to their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get actor name
  SELECT COALESCE(display_name, 'Пользователь') INTO actor_name
  FROM public.profiles 
  WHERE user_id = NEW.user_id;
  
  -- Determine notification type and title
  IF NEW.reaction_type = 'like' THEN
    notif_type := 'like';
    notif_title := '❤️ Новый лайк';
  ELSE
    notif_type := 'dislike';
    notif_title := '👎 Новая реакция';
  END IF;
  
  -- Insert notification
  INSERT INTO public.user_notifications (user_id, type, title, message, reference_id, reference_type, actor_id)
  VALUES (post_owner_id, notif_type, notif_title, actor_name || ' оценил(а) вашу публикацию', NEW.post_id, 'post', NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to create notification on comment
CREATE OR REPLACE FUNCTION public.notify_on_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  actor_name TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id
  FROM public.achievement_posts 
  WHERE id = NEW.post_id;
  
  -- Don't notify if user commented on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get actor name
  SELECT COALESCE(display_name, 'Пользователь') INTO actor_name
  FROM public.profiles 
  WHERE user_id = NEW.user_id;
  
  -- Insert notification
  INSERT INTO public.user_notifications (user_id, type, title, message, reference_id, reference_type, actor_id)
  VALUES (post_owner_id, 'comment', '💬 Новый комментарий', actor_name || ' прокомментировал(а) вашу публикацию', NEW.post_id, 'post', NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
CREATE TRIGGER trigger_notify_on_post_reaction
AFTER INSERT ON public.post_reactions
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_post_reaction();

CREATE TRIGGER trigger_notify_on_post_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_post_comment();