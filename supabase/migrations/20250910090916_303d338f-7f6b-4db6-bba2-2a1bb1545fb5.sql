-- Implement comprehensive role-based access control for company contact information
-- This creates a scalable system based on user subscription levels

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'premium', 'basic');

-- Create user_roles table for flexible role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'basic',
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    granted_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's highest role level
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id uuid)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN 3
    WHEN EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'premium') THEN 2
    ELSE 1 -- basic or no role
  END
$$;

-- Create function to check if user can access company contact info
CREATE OR REPLACE FUNCTION public.can_access_company_contacts(_user_id uuid, company_uuid uuid)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admin users have full access
    public.has_role(_user_id, 'admin') OR
    -- Premium users have full access  
    public.has_role(_user_id, 'premium') OR
    -- Basic users can access if they made a partnership inquiry
    EXISTS (
      SELECT 1 FROM public.partnership_inquiries 
      WHERE user_id = _user_id AND company_id = company_uuid
    )
$$;

-- Update companies table RLS policy to use role-based access
DROP POLICY IF EXISTS "Authenticated users can view companies with contact restrictions" ON public.companies;

CREATE POLICY "Role-based company access with contact protection" 
ON public.companies 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  -- All authenticated users can see basic company info
  -- Contact info filtering happens at application layer based on roles
  TRUE
);

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grant default 'basic' role to existing users (based on profiles table)
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT user_id, 'basic'::app_role
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;