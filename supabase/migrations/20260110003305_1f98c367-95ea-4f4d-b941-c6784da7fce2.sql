-- Grant PRO subscription to Butenkoe200@gmail.com
UPDATE public.subscriptions 
SET plan = 'pro', 
    expires_at = '2099-12-31 23:59:59+00',
    updated_at = now()
WHERE user_id = 'a9d78871-ebd6-47ca-85c1-483fc80be520';

-- If no subscription exists, insert one
INSERT INTO public.subscriptions (user_id, plan, expires_at, started_at)
SELECT 'a9d78871-ebd6-47ca-85c1-483fc80be520', 'pro', '2099-12-31 23:59:59+00', now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions WHERE user_id = 'a9d78871-ebd6-47ca-85c1-483fc80be520'
);