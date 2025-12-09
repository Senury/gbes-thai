-- Fix security vulnerability: Restrict companies table access to authenticated users only
-- This prevents competitors from harvesting contact information

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Companies are publicly readable" ON public.companies;

-- Create new policy that only allows authenticated users to view companies
CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Optional: If you want to allow public access to basic company info but hide contact details,
-- you could create a view instead. For now, we're securing all data behind authentication.