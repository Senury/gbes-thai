-- Fix security vulnerability: Remove overly permissive insert policy
-- Subscription records should only be created by edge functions using service role key
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create a restrictive policy that blocks user inserts
-- Only edge functions (using service role key) should create subscription records
CREATE POLICY "no_user_inserts_on_subscriptions" ON public.subscribers
FOR INSERT
WITH CHECK (false);