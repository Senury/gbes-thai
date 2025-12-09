import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, industry } = await req.json();
    console.log('Scraping request for URLs:', urls);

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'URLs array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const companies = [];

    for (const url of urls) {
      try {
        const companyData = await scrapeCompanyWebsite(url, industry);
        if (companyData) {
          companies.push(companyData);
          await storeCompanyInDB(companyData);
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    return new Response(JSON.stringify({ companies, count: companies.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scrape-company-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scrapeCompanyWebsite(url: string, industry?: string) {
  try {
    // First try with Firecrawl if API key is available
    if (firecrawlApiKey) {
      return await scrapeWithFirecrawl(url, industry);
    }

    // Fallback to basic web scraping
    return await scrapeWithBasicFetch(url, industry);
  } catch (error) {
    console.error('Error scraping website:', error);
    return null;
  }
}

async function scrapeWithFirecrawl(url: string, industry?: string) {
  try {
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('Firecrawl scraping failed:', data.error);
      return null;
    }

    return extractCompanyInfoFromContent(data.data.markdown || data.data.html, url, industry);
  } catch (error) {
    console.error('Firecrawl error:', error);
    return null;
  }
}

async function scrapeWithBasicFetch(url: string, industry?: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SME-Partner-Search/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Basic fetch error:', response.status);
      return null;
    }

    const html = await response.text();
    return extractCompanyInfoFromContent(html, url, industry);
  } catch (error) {
    console.error('Basic fetch error:', error);
    return null;
  }
}

function extractCompanyInfoFromContent(content: string, websiteUrl: string, industry?: string) {
  try {
    // Extract company name from title or h1 tags
    const nameMatch = content.match(/<title[^>]*>([^<]+)</i) || content.match(/<h1[^>]*>([^<]+)</i);
    const name = nameMatch ? nameMatch[1].replace(/\s*[-|]\s*.*$/, '').trim() : getDomainName(websiteUrl);

    // Extract description from meta description or first paragraph
    const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i) ||
                     content.match(/<p[^>]*>([^<]{50,200})</i);
    const description = descMatch ? descMatch[1].trim() : 'Company information extracted from website';

    // Extract contact information
    const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = content.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);

    // Extract location information
    const addressMatch = content.match(/(?:address|location|based in|headquarters?)[^a-zA-Z]*([a-zA-Z\s,]{10,50})/i);
    
    // Infer industry from content keywords
    const inferredIndustry = industry ? [industry] : inferIndustryFromContent(content);
    const specialties = extractSpecialtiesFromContent(content);

    return {
      name: sanitizeText(name),
      description: sanitizeText(description).substring(0, 500),
      website_url: websiteUrl,
      contact_email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : null,
      location_country: extractCountryFromContent(content),
      location_city: extractCityFromContent(content, addressMatch?.[1]),
      industry: inferredIndustry,
      specialties: specialties,
      data_source: 'web_scraping',
      verified: false,
      company_size: inferCompanySizeFromContent(content),
    };
  } catch (error) {
    console.error('Error extracting company info:', error);
    return null;
  }
}

function getDomainName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch {
    return 'Unknown Company';
  }
}

function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function inferIndustryFromContent(content: string): string[] {
  const industryKeywords = {
    'technology': ['software', 'tech', 'digital', 'AI', 'artificial intelligence', 'blockchain', 'cloud'],
    'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'machinery'],
    'consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
    'healthcare': ['healthcare', 'medical', 'hospital', 'clinic', 'pharmaceutical'],
    'finance': ['finance', 'financial', 'banking', 'investment', 'insurance'],
    'retail': ['retail', 'e-commerce', 'shopping', 'store', 'marketplace'],
    'education': ['education', 'training', 'learning', 'university', 'school'],
    'food_service': ['restaurant', 'food', 'catering', 'hospitality', 'cuisine'],
    'logistics': ['logistics', 'shipping', 'transportation', 'supply chain', 'delivery'],
  };

  const contentLower = content.toLowerCase();
  const foundIndustries = [];

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      foundIndustries.push(industry);
    }
  }

  return foundIndustries.length > 0 ? foundIndustries : ['business_services'];
}

function extractSpecialtiesFromContent(content: string): string[] {
  const specialtyPatterns = [
    /(?:specializ(?:e|ing) in|expertise in|focus(?:es)? on|services include)[^.]{1,100}/gi,
    /(?:we offer|providing|solutions for)[^.]{1,100}/gi,
  ];

  const specialties = [];
  for (const pattern of specialtyPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      specialties.push(...matches.map(match => sanitizeText(match).substring(0, 50)));
    }
  }

  return specialties.slice(0, 5); // Limit to 5 specialties
}

function extractCountryFromContent(content: string): string | null {
  const countries = ['United States', 'Germany', 'Japan', 'Australia', 'United Kingdom', 'Canada', 'France', 'Italy', 'Singapore'];
  const contentLower = content.toLowerCase();
  
  for (const country of countries) {
    if (contentLower.includes(country.toLowerCase())) {
      return country;
    }
  }
  
  return null;
}

function extractCityFromContent(content: string, addressText?: string): string | null {
  if (addressText) {
    const cities = addressText.split(',').map(s => s.trim()).find(s => s.length > 2 && s.length < 30);
    return cities || null;
  }
  
  const cityPattern = /(?:located in|based in|headquarters in)\s*([A-Za-z\s]{2,30})/i;
  const match = content.match(cityPattern);
  return match ? match[1].trim() : null;
}

function inferCompanySizeFromContent(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('fortune 500') || contentLower.includes('global leader') || contentLower.includes('multinational')) {
    return 'large';
  }
  if (contentLower.includes('startup') || contentLower.includes('small business') || contentLower.includes('freelance')) {
    return 'micro';
  }
  if (contentLower.includes('medium') || contentLower.includes('growing company')) {
    return 'medium';
  }
  
  return 'small'; // Default
}

async function storeCompanyInDB(companyData: any) {
  try {
    // Check if company already exists to avoid duplicates
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('website_url', companyData.website_url)
      .maybeSingle();

    if (existing) {
      console.log('Company website already exists:', companyData.website_url);
      return;
    }

    const { error } = await supabase
      .from('companies')
      .insert([companyData]);

    if (error) {
      console.error('Error storing company:', error);
    } else {
      console.log('Successfully stored company:', companyData.name);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}