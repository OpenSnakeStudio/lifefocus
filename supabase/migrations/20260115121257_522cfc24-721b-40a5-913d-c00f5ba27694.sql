-- Add invite_code column to group_chats for invite links
ALTER TABLE public.group_chats 
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Create function to generate random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substr(md5(random()::text), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Set invite codes for existing chats
UPDATE public.group_chats 
SET invite_code = public.generate_invite_code()
WHERE invite_code IS NULL;

-- Add default for new chats
ALTER TABLE public.group_chats 
ALTER COLUMN invite_code SET DEFAULT public.generate_invite_code();

-- Create trigger to notify users about new messages in chats
CREATE OR REPLACE FUNCTION public.notify_on_new_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  member_record RECORD;
  chat_name TEXT;
  sender_name TEXT;
BEGIN
  -- Get chat name
  SELECT name INTO chat_name FROM public.group_chats WHERE id = NEW.chat_id;
  
  -- Get sender display name
  SELECT display_name INTO sender_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Notify all other members
  FOR member_record IN 
    SELECT user_id FROM public.group_chat_members 
    WHERE chat_id = NEW.chat_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.user_notifications (
      user_id,
      type,
      title,
      message,
      reference_id,
      reference_type,
      actor_id
    ) VALUES (
      member_record.user_id,
      'new_chat_message',
      COALESCE(sender_name, 'Пользователь') || ' в ' || chat_name,
      substring(NEW.content, 1, 100),
      NEW.chat_id,
      'group_chat',
      NEW.user_id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for chat message notifications
DROP TRIGGER IF EXISTS notify_on_chat_message ON public.group_chat_messages;
CREATE TRIGGER notify_on_chat_message
  AFTER INSERT ON public.group_chat_messages
  FOR EACH ROW
  WHEN (NEW.is_deleted = false)
  EXECUTE FUNCTION public.notify_on_new_chat_message();

-- Create index for faster invite code lookups
CREATE INDEX IF NOT EXISTS idx_group_chats_invite_code ON public.group_chats(invite_code);