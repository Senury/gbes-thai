-- Update the RLS policy to allow public access to company listings
-- Companies should be publicly visible for partner search functionality
DROP POLICY IF EXISTS "Role-based company access with contact protection" ON companies;

CREATE POLICY "Public can view companies for partner search" ON companies
FOR SELECT USING (true);

-- Note: Contact information like email/phone should still be protected 
-- but basic company info should be publicly accessible for search