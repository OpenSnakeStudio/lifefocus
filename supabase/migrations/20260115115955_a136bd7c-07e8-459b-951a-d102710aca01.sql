-- =====================================================
-- GROUP CHATS SYSTEM
-- =====================================================

-- Group chats table
CREATE TABLE public.group_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL,
  is_public BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group chat members
CREATE TABLE public.group_chat_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- Group chat messages
CREATE TABLE public.group_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES public.group_chat_messages(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;

-- Group chats policies
CREATE POLICY "Users can view chats they are members of"
  ON public.group_chats FOR SELECT
  USING (
    is_public = true OR
    id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create chats"
  ON public.group_chats FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat admins can update chats"
  ON public.group_chats FOR UPDATE
  USING (
    auth.uid() = created_by OR
    id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Chat creator can delete chats"
  ON public.group_chats FOR DELETE
  USING (auth.uid() = created_by);

-- Members policies
CREATE POLICY "Members can view other members in their chats"
  ON public.group_chat_members FOR SELECT
  USING (
    chat_id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can add members"
  ON public.group_chat_members FOR INSERT
  WITH CHECK (
    chat_id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    OR (SELECT created_by FROM public.group_chats WHERE id = chat_id) = auth.uid()
  );

CREATE POLICY "Users can leave chats"
  ON public.group_chat_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    chat_id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Admins can update member roles"
  ON public.group_chat_members FOR UPDATE
  USING (
    chat_id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Messages policies
CREATE POLICY "Members can view messages in their chats"
  ON public.group_chat_messages FOR SELECT
  USING (
    chat_id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can send messages"
  ON public.group_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    chat_id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can edit their own messages"
  ON public.group_chat_messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.group_chat_messages FOR DELETE
  USING (
    user_id = auth.uid() OR
    chat_id IN (SELECT chat_id FROM public.group_chat_members WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Indexes for performance
CREATE INDEX idx_group_chat_members_user ON public.group_chat_members(user_id);
CREATE INDEX idx_group_chat_members_chat ON public.group_chat_members(chat_id);
CREATE INDEX idx_group_chat_messages_chat ON public.group_chat_messages(chat_id);
CREATE INDEX idx_group_chat_messages_created ON public.group_chat_messages(created_at DESC);

-- =====================================================
-- SUBSCRIPTION ACHIEVEMENTS SYSTEM
-- =====================================================

-- User streak achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL, -- 'subscription_streak', 'task_master', 'habit_hero', etc.
  achievement_key TEXT NOT NULL, -- specific achievement identifier
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_key)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievement policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON public.user_achievements(achievement_type);

-- Trigger to update group_chats updated_at
CREATE TRIGGER update_group_chats_updated_at
  BEFORE UPDATE ON public.group_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update messages updated_at
CREATE TRIGGER update_group_chat_messages_updated_at
  BEFORE UPDATE ON public.group_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();