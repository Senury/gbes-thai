-- Fix security vulnerability: Secure access to sensitive subscription data
-- Remove potentially insecure email-based access and restrict to user_id only
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create a secure policy that only allows users to see their own subscription data
-- Based solely on user_id matching auth.uid() for maximum security
CREATE POLICY "users_can_view_own_subscription_only" ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);