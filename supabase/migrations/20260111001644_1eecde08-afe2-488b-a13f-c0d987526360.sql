-- Create user_levels table for XP and level tracking (PRO feature)
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  habits_completed INTEGER NOT NULL DEFAULT 0,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own level data"
ON public.user_levels
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level data"
ON public.user_levels
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own level data"
ON public.user_levels
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_levels_updated_at
BEFORE UPDATE ON public.user_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp INTEGER)
RETURNS TABLE(level INTEGER, xp_for_next INTEGER, xp_in_current_level INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_xp INTEGER := xp;
  calc_level INTEGER := 1;
  level_requirement INTEGER := 100;
BEGIN
  -- Level formula: each level requires 100 * level XP
  WHILE current_xp >= level_requirement LOOP
    current_xp := current_xp - level_requirement;
    calc_level := calc_level + 1;
    level_requirement := 100 * calc_level;
  END LOOP;
  
  level := calc_level;
  xp_for_next := level_requirement;
  xp_in_current_level := current_xp;
  RETURN NEXT;
END;
$$;

-- Create function to add XP and update level
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_xp_source TEXT
)
RETURNS TABLE(new_level INTEGER, new_total_xp INTEGER, leveled_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_level INTEGER;
  calc_level INTEGER;
  calc_xp_next INTEGER;
  new_xp INTEGER;
BEGIN
  -- Get or create user level record
  INSERT INTO public.user_levels (user_id, total_xp, current_level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current level
  SELECT current_level INTO old_level FROM public.user_levels WHERE user_id = p_user_id;
  
  -- Update XP and source counters
  UPDATE public.user_levels
  SET total_xp = total_xp + p_xp_amount,
      tasks_completed = CASE WHEN p_xp_source = 'task' THEN tasks_completed + 1 ELSE tasks_completed END,
      habits_completed = CASE WHEN p_xp_source = 'habit' THEN habits_completed + 1 ELSE habits_completed END,
      stars_earned = CASE WHEN p_xp_source = 'star' THEN stars_earned + 1 ELSE stars_earned END
  WHERE user_id = p_user_id
  RETURNING total_xp INTO new_xp;
  
  -- Calculate new level
  SELECT level, xp_for_next INTO calc_level, calc_xp_next
  FROM public.calculate_level_from_xp(new_xp);
  
  -- Update level if changed
  UPDATE public.user_levels
  SET current_level = calc_level,
      xp_to_next_level = calc_xp_next
  WHERE user_id = p_user_id;
  
  new_level := calc_level;
  new_total_xp := new_xp;
  leveled_up := calc_level > old_level;
  RETURN NEXT;
END;
$$;