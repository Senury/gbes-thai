-- Create companies table for partner matching
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT[] NOT NULL DEFAULT '{}',
  location_country TEXT,
  location_city TEXT,
  company_size TEXT CHECK (company_size IN ('micro', 'small', 'medium', 'large')) DEFAULT 'small',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  certifications TEXT[] NOT NULL DEFAULT '{}',
  website_url TEXT,
  contact_email TEXT,
  phone TEXT,
  established_year INTEGER,
  data_source TEXT NOT NULL DEFAULT 'manual',
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for better search performance
CREATE INDEX idx_companies_industry ON public.companies USING GIN(industry);
CREATE INDEX idx_companies_specialties ON public.companies USING GIN(specialties);
CREATE INDEX idx_companies_location ON public.companies (location_country, location_city);
CREATE INDEX idx_companies_size ON public.companies (company_size);
CREATE INDEX idx_companies_verified ON public.companies (verified);

-- Create partnership inquiries table
CREATE TABLE public.partnership_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'contacted', 'responded', 'closed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS policies for companies (publicly readable for search)
CREATE POLICY "Companies are publicly readable" 
ON public.companies 
FOR SELECT 
USING (true);

-- RLS policies for partnership inquiries (users can only see their own)
CREATE POLICY "Users can view their own inquiries" 
ON public.partnership_inquiries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inquiries" 
ON public.partnership_inquiries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inquiries" 
ON public.partnership_inquiries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partnership_inquiries_updated_at
BEFORE UPDATE ON public.partnership_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.companies (name, description, industry, location_country, location_city, company_size, specialties, website_url, data_source) VALUES
('Tokyo Manufacturing Co.', 'Precision parts manufacturer with 30 years experience', ARRAY['manufacturing', 'automotive'], 'Japan', 'Tokyo', 'medium', ARRAY['precision machining', 'quality control', 'automotive parts'], 'https://example-tokyo-mfg.com', 'sample'),
('Berlin Tech Solutions', 'Software development and digital transformation', ARRAY['technology', 'software'], 'Germany', 'Berlin', 'small', ARRAY['web development', 'AI solutions', 'digital transformation'], 'https://example-berlin-tech.com', 'sample'),
('Sydney Export Services', 'International trade and logistics specialist', ARRAY['logistics', 'trade'], 'Australia', 'Sydney', 'small', ARRAY['export consultation', 'shipping logistics', 'customs clearance'], 'https://example-sydney-export.com', 'sample'),
('Milan Fashion House', 'Sustainable fashion and textile manufacturing', ARRAY['fashion', 'textile'], 'Italy', 'Milan', 'medium', ARRAY['sustainable fashion', 'textile design', 'brand development'], 'https://example-milan-fashion.com', 'sample'),
('Singapore FinTech Hub', 'Financial technology and blockchain solutions', ARRAY['fintech', 'technology'], 'Singapore', 'Singapore', 'small', ARRAY['blockchain', 'payment systems', 'regulatory compliance'], 'https://example-sg-fintech.com', 'sample');