-- Enable required extensions for cron and HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule hourly aggregation of leaderboard
SELECT cron.schedule(
  'aggregate-leaderboard-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://jexrtsyokhegjxnvqjur.supabase.co/functions/v1/aggregate-leaderboard',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
    ),
    body := jsonb_build_object('source', 'cron', 'timestamp', now())
  ) AS request_id;
  $$
);

-- Add new profile fields for enhanced public profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS status_tag TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expertise TEXT,
ADD COLUMN IF NOT EXISTS can_help TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;