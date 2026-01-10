-- Assign SuperAdmin role to specific user
INSERT INTO public.user_roles (user_id, role)
VALUES ('d9d7749a-68db-41be-adb5-bb96f109ae34', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;