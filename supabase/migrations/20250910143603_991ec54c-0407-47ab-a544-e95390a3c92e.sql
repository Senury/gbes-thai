-- Update contact access to be based on subscription tiers (Standard and Business plans)
-- instead of user roles

-- Create function to check if user has paid subscription (Standard or Business)
CREATE OR REPLACE FUNCTION public.has_paid_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscribers
    WHERE user_id = _user_id 
      AND subscribed = true
      AND subscription_tier IN ('Standard', 'Business')
      AND (subscription_end IS NULL OR subscription_end > now())
  )
$$;

-- Update the existing company contact access function to use subscription-based access
CREATE OR REPLACE FUNCTION public.can_access_company_contacts(_user_id uuid, company_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    -- Admin users still have full access
    public.has_role(_user_id, 'admin') OR
    -- Users with Standard/Business subscriptions have access
    public.has_paid_subscription(_user_id) OR
    -- Basic users can access if they made a partnership inquiry (fallback)
    EXISTS (
      SELECT 1 FROM public.partnership_inquiries 
      WHERE user_id = _user_id AND company_id = company_uuid
    )
$$;

-- Create function to get user subscription info for frontend
CREATE OR REPLACE FUNCTION public.get_user_subscription_info(_user_id uuid)
RETURNS TABLE (
  has_subscription boolean,
  subscription_tier text,
  can_access_contacts boolean
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(s.subscribed, false) as has_subscription,
    s.subscription_tier,
    (
      public.has_role(_user_id, 'admin') OR 
      public.has_paid_subscription(_user_id)
    ) as can_access_contacts
  FROM public.subscribers s
  WHERE s.user_id = _user_id
  UNION ALL
  SELECT 
    false as has_subscription,
    null::text as subscription_tier,
    public.has_role(_user_id, 'admin') as can_access_contacts
  WHERE NOT EXISTS (SELECT 1 FROM public.subscribers WHERE user_id = _user_id)
  LIMIT 1;
$$;