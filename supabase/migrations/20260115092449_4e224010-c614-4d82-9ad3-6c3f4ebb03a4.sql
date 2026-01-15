-- Create cloud_user_data table for full PRO user data backup
CREATE TABLE IF NOT EXISTS public.cloud_user_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  habits JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  transactions JSONB DEFAULT '[]'::jsonb,
  time_entries JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  pomodoro_sessions JSONB DEFAULT '[]'::jsonb,
  checklists JSONB DEFAULT '[]'::jsonb,
  counters JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cloud_user_data_user_id ON public.cloud_user_data(user_id);

-- Enable RLS
ALTER TABLE public.cloud_user_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for cloud_user_data
CREATE POLICY "Users can view their own cloud data" 
ON public.cloud_user_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cloud data" 
ON public.cloud_user_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cloud data" 
ON public.cloud_user_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add unique constraint for leaderboard aggregates to enable upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_aggregates_unique 
ON public.leaderboard_aggregates(user_id, period_type, period_key);

-- Create trigger for updated_at on cloud_user_data
CREATE TRIGGER update_cloud_user_data_updated_at
BEFORE UPDATE ON public.cloud_user_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on cloud_user_settings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_cloud_user_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_cloud_user_settings_updated_at
    BEFORE UPDATE ON public.cloud_user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;