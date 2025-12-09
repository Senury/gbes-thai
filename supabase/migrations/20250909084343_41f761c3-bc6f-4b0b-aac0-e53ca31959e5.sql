-- Fix security vulnerability: Remove overly permissive update policy
-- Subscription updates should only come from edge functions using service role key
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create a more restrictive policy that only allows edge functions to update
-- (Edge functions use service role key which bypasses RLS anyway)
-- Users should not be able to directly modify subscription data
CREATE POLICY "no_user_updates_on_subscriptions" ON public.subscribers
FOR UPDATE
USING (false);