import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Encoding from "https://esm.sh/encoding-japanese@1.0.30";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
const openAiModel = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { urls, industry, confirm = false, replace = false, llm = false } = await req.json();
    console.log('Scraping request for URLs:', urls);

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'URLs array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedUrls = urls
      .map((url: string) => normalizeUrl(url))
      .filter((url: string | null) => !!url) as string[];

    if (normalizedUrls.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid URLs provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const companies = [];
    let storedCount = 0;
    let replacedCount = 0;
    let skippedCount = 0;

    const results = await runWithConcurrencyLimit(
      normalizedUrls,
      3,
      async (url) => {
        const companyData = await scrapeCompanyWebsite(url, industry, llm);
        if (!companyData) {
          return null;
        }
        if (confirm) {
          const storedResult = await storeCompanyInDB(companyData, replace);
          if (storedResult?.stored) {
            storedCount += 1;
          } else if (storedResult?.replaced) {
            storedCount += 1;
            replacedCount += 1;
          } else {
            skippedCount += 1;
          }
        }
        return companyData;
      }
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        companies.push(result.value);
      } else if (result.status === 'rejected') {
        console.error('Scrape task failed:', result.reason);
      }
    }

    return new Response(JSON.stringify({
      companies,
      count: companies.length,
      storedCount,
      replacedCount,
      skippedCount,
      confirm,
    }), {
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

async function scrapeCompanyWebsite(url: string, industry?: string, useLlm?: boolean) {
  try {
    // First try with Firecrawl if API key is available
    if (firecrawlApiKey) {
      const firecrawlResult = await scrapeWithFirecrawl(url, industry);
    if (firecrawlResult && !isGarbledCompanyData(firecrawlResult)) {
        const withContacts = await maybeFillMissingContacts(firecrawlResult);
        const withAbout = await maybeFillDescriptionFromAbout(withContacts);
        return await maybeEnrichWithLlm(withAbout, useLlm);
      }
    }

    // Fallback to basic web scraping
    const basicResult = await scrapeWithBasicFetch(url, industry);
    const withContacts = await maybeFillMissingContacts(basicResult);
    const withAbout = await maybeFillDescriptionFromAbout(withContacts);
    return await maybeEnrichWithLlm(withAbout, useLlm);
  } catch (error) {
    console.error('Error scraping website:', error);
    return null;
  }
}

async function scrapeWithFirecrawl(url: string, industry?: string) {
  try {
    const response = await fetchWithTimeout(
      'https://api.firecrawl.dev/v0/scrape',
      {
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
      },
      20000
    );

    if (!response.ok) {
      console.error('Firecrawl API error:', response.status);
      return null;
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      console.error('Firecrawl response parse error');
      return null;
    }
    
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
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SME-Partner-Search/1.0)',
        },
      },
      15000
    );

    if (!response.ok) {
      console.error('Basic fetch error:', response.status);
      return null;
    }

    const html = await decodeResponseBody(response);
    return extractCompanyInfoFromContent(html, url, industry);
  } catch (error) {
    console.error('Basic fetch error:', error);
    return null;
  }
}

function extractCompanyInfoFromContent(content: string, websiteUrl: string, industry?: string) {
  try {
    const jsonLd = extractJsonLd(content);
    const orgData = selectOrganizationData(jsonLd);
    const plainText = extractPlainText(content);
    const metaDescription =
      extractMetaContent(content, 'name', 'description') ||
      extractMetaContent(content, 'property', 'og:description');
    const metaTitle =
      extractMetaContent(content, 'property', 'og:title') ||
      extractMetaContent(content, 'name', 'twitter:title');
    const metaKeywords = extractMetaContent(content, 'name', 'keywords');
    const metaSiteName = extractMetaContent(content, 'property', 'og:site_name');

    // Extract company name from title or h1 tags
    const nameMatch = content.match(/<title[^>]*>([^<]+)</i) || content.match(/<h1[^>]*>([^<]+)</i);
    const name = orgData?.name ||
      (metaSiteName ? metaSiteName.trim() : null) ||
      (metaTitle ? stripTitleSuffix(metaTitle.trim()) : null) ||
      (nameMatch ? stripTitleSuffix(nameMatch[1].trim()) : null) ||
      getDomainName(websiteUrl);

    // Extract description from meta description or first paragraph
    const descMatch = extractFirstMeaningfulParagraph(content);
    const description = cleanDescription(
      orgData?.description ||
      (metaDescription ? metaDescription.trim() : null) ||
      (descMatch ? descMatch.trim() : null) ||
      'Company information extracted from website'
    );

    // Extract contact information
    const email = orgData?.email || extractEmailFromContent(content);
    const phone = orgData?.telephone || extractPhoneFromContent(content);

    // Extract location information
    const addressMatch = content.match(/(?:address|location|based in|headquarters?)[^a-zA-Z]*([a-zA-Z\s,]{10,50})/i);
    const addressText = extractAddressText(orgData?.address);
    
    // Infer industry from content keywords
    const normalizedIndustry = industry === 'all' ? undefined : industry;
    let inferredIndustry = normalizedIndustry
      ? [normalizedIndustry]
      : normalizeIndustryList(orgData?.industry) ||
        inferIndustryFromContent(`${plainText}\n${metaKeywords || ''}`);
    if (inferredIndustry.includes('finance')) {
      inferredIndustry = inferredIndustry.filter((item) => item !== 'retail');
    }
    const specialties = extractSpecialtiesFromContent(plainText, metaKeywords, orgData?.keywords || orgData?.knowsAbout);

    return {
      name: sanitizeText(name),
      description: sanitizeText(description).substring(0, 500),
      website_url: normalizeUrl(websiteUrl) || websiteUrl,
      contact_email: email ? sanitizeText(email) : null,
      phone: phone ? sanitizeText(phone).replace(/\s+/g, '') : null,
      location_country: orgData?.addressCountry || extractCountryFromContent(`${content}\n${addressText || ''}`),
      location_city: orgData?.addressLocality || extractCityFromContent(content, addressText || addressMatch?.[1]),
      industry: inferredIndustry,
      specialties: specialties,
      data_source: 'web_scraping',
      verified: false,
      company_size: inferCompanySizeFromContent(content, orgData?.numberOfEmployees),
      raw_content: content,
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
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\uFFFD+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTitleSuffix(title: string): string {
  return title.replace(/\s*[-|｜·•]\s*.*$/, '').trim();
}

function cleanDescription(text: string): string {
  const cleaned = sanitizeText(text);
  const lower = cleaned.toLowerCase();
  if (
    lower.includes('cookie') ||
    lower.includes('privacy') ||
    lower.includes('copyright') ||
    lower.includes('official website') ||
    lower.includes('official web') ||
    cleaned.length < 30
  ) {
    return 'Company information extracted from website';
  }
  if (
    cleaned.includes('公式ウェブサイト') ||
    cleaned.includes('公式サイト') ||
    cleaned.includes('公式Webサイト')
  ) {
    return 'Company information extracted from website';
  }
  return cleaned;
}

function extractFirstMeaningfulParagraph(content: string): string | null {
  const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = paragraphPattern.exec(content)) !== null) {
    const candidate = sanitizeText(match[1]);
    if (candidate.length < 60 || candidate.length > 400) {
      continue;
    }
    if (looksLikeHtml(candidate) || isGenericSpecialty(candidate)) {
      continue;
    }
    if (candidate.toLowerCase().includes('cookie')) {
      continue;
    }
    return candidate;
  }
  return null;
}

async function maybeEnrichWithLlm(
  companyData: Record<string, unknown> | null,
  useLlm?: boolean
): Promise<Record<string, unknown> | null> {
  if (!companyData) {
    return null;
  }

  const data = companyData as Record<string, unknown>;
  if (!useLlm || !openAiApiKey) {
    if (useLlm && !openAiApiKey) {
      console.warn('LLM enrichment requested but OPENAI_API_KEY is not set.');
    }
    return stripRawContent(data);
  }

  if (!shouldUseLlm(data)) {
    return stripRawContent(data);
  }

  try {
    const content = typeof data.raw_content === 'string' ? data.raw_content : '';
    const enriched = await callOpenAiExtraction(content, data);
    const merged = mergeExtraction(data, enriched);
    return stripRawContent(merged);
  } catch (error) {
    console.error('LLM enrichment error:', error);
    return stripRawContent(data);
  }
}

function stripRawContent(data: Record<string, unknown>) {
  const { raw_content, ...rest } = data;
  return rest;
}

function shouldUseLlm(data: Record<string, unknown>): boolean {
  const contactEmail = typeof data.contact_email === 'string' ? data.contact_email : '';
  const phone = typeof data.phone === 'string' ? data.phone : '';
  const industry = Array.isArray(data.industry) ? data.industry : [];
  const specialties = Array.isArray(data.specialties) ? data.specialties : [];
  const companySize = typeof data.company_size === 'string' ? data.company_size : '';
  const description = typeof data.description === 'string' ? data.description : '';

  const missingContact = !contactEmail && !phone;
  const missingIndustry = industry.length === 0 || industry.includes('business_services') || industry.includes('all');
  const missingSpecialties = specialties.length === 0;
  const placeholderDescription = description.toLowerCase().includes('company information extracted');
  const weakSize = companySize === 'small';

  return missingContact || missingIndustry || missingSpecialties || placeholderDescription || weakSize;
}

async function callOpenAiExtraction(content: string, baseData: Record<string, unknown>) {
  const plainText = extractPlainText(content);
  const prompt = [
    'Extract company information as JSON. Use only what is explicitly stated in the content.',
    'If a field is unknown, return null or an empty array.',
    'Return JSON with keys: name, description, industry, specialties, company_size, contact_email, phone, location_city, location_country.',
    'company_size must be one of: micro, small, medium, large.',
    `Website: ${baseData.website_url || ''}`,
    'Content:',
    plainText.slice(0, 6000),
  ].join('\n\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openAiModel,
      messages: [
        {
          role: 'system',
          content: 'You extract structured company data from website text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    }),
  });

  if (!response.ok) {
    console.error('OpenAI response error:', response.status);
    return null;
  }

  const data = await response.json().catch(() => null);
  const contentText = data?.choices?.[0]?.message?.content;
  if (!contentText) {
    return null;
  }
  return parseJsonFromString(contentText);
}

function parseJsonFromString(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function mergeExtraction(
  base: Record<string, unknown>,
  enriched: Record<string, unknown> | null
): Record<string, unknown> {
  if (!enriched) {
    return base;
  }
  const result = { ...base };

  if (!result.name && typeof enriched.name === 'string') result.name = enriched.name;
  if (
    typeof result.description !== 'string' ||
    result.description.toLowerCase().includes('company information extracted')
  ) {
    if (typeof enriched.description === 'string') result.description = enriched.description;
  }

  const industry = Array.isArray(result.industry) ? result.industry : [];
  const enrichedIndustry = Array.isArray(enriched.industry) ? enriched.industry : [];
  if (industry.length === 0 || industry.includes('business_services') || industry.includes('all')) {
    if (enrichedIndustry.length > 0) result.industry = enrichedIndustry;
  }

  const specialties = Array.isArray(result.specialties) ? result.specialties : [];
  const enrichedSpecialties = Array.isArray(enriched.specialties) ? enriched.specialties : [];
  if (specialties.length === 0 && enrichedSpecialties.length > 0) {
    result.specialties = enrichedSpecialties;
  }

  if (!result.contact_email && typeof enriched.contact_email === 'string') {
    result.contact_email = enriched.contact_email;
  }
  if (!result.phone && typeof enriched.phone === 'string') {
    result.phone = enriched.phone;
  }
  if (!result.location_city && typeof enriched.location_city === 'string') {
    result.location_city = enriched.location_city;
  }
  if (!result.location_country && typeof enriched.location_country === 'string') {
    result.location_country = enriched.location_country;
  }

  if (typeof enriched.company_size === 'string') {
    const normalized = normalizeCompanySize(enriched.company_size);
    if (normalized) {
      result.company_size = normalized;
    }
  }

  return result;
}

function normalizeCompanySize(value: string): string | null {
  const lowered = value.toLowerCase().trim();
  if (['micro', 'small', 'medium', 'large'].includes(lowered)) {
    return lowered;
  }
  if (['tiny', 'startup'].includes(lowered)) return 'micro';
  if (['midsize', 'mid', 'mid-size'].includes(lowered)) return 'medium';
  if (['enterprise', 'big', 'large enterprise'].includes(lowered)) return 'large';
  return null;
}

function extractPlainText(content: string): string {
  const withoutScripts = content
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  return sanitizeText(withoutScripts);
}

function isGarbledCompanyData(companyData: Record<string, unknown>): boolean {
  const fields = [
    companyData.name,
    companyData.description,
    companyData.location_city,
    companyData.location_country,
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

  return isGarbledText(fields);
}

function isGarbledText(text: string): boolean {
  if (!text) {
    return false;
  }
  const replacementCount = (text.match(/\uFFFD/g) || []).length;
  if (replacementCount >= 3) {
    return true;
  }
  const garbledSequenceCount = (text.match(/\\�/g) || []).length;
  return garbledSequenceCount >= 2;
}

function normalizeUrl(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    url.hash = '';
    url.search = '';
    url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function decodeResponseBody(response: Response): Promise<string> {
  const buffer = await response.arrayBuffer();
  const fallbackText = new TextDecoder('utf-8').decode(buffer);
  const contentType = response.headers.get('content-type') || '';
  let charset = detectCharset(contentType, fallbackText);
  const detectedFromBytes = Encoding.detect(new Uint8Array(buffer));
  const normalizedDetected = normalizeEncodingName(detectedFromBytes);
  if (!charset || charset === 'utf-8') {
    charset = normalizedDetected;
  }

  if (!charset || charset === 'utf-8') {
    return fallbackText;
  }

  if (charset === 'shift_jis' || charset === 'euc-jp') {
    const encoding = charset === 'shift_jis' ? 'SJIS' : 'EUCJP';
    return decodeWithEncoding(buffer, encoding, fallbackText);
  }

  try {
    return new TextDecoder(charset).decode(buffer);
  } catch (error) {
    console.warn(`Unsupported charset "${charset}", falling back to utf-8`, error);
    return fallbackText;
  }
}

function detectCharset(contentType: string, html: string): string | null {
  const contentTypeMatch = contentType.match(/charset=([^;]+)/i);
  const metaMatch =
    html.match(/<meta[^>]+charset=["']?([^"'>\s]+)/i) ||
    html.match(/<meta[^>]+http-equiv=["']content-type["'][^>]*content=["'][^"']*charset=([^"'>\s]+)/i);

  const rawCharset = (contentTypeMatch?.[1] || metaMatch?.[1] || '').trim().toLowerCase();
  if (!rawCharset) {
    return null;
  }

  if (['shift_jis', 'shift-jis', 'sjis', 'windows-31j', 'cp932'].includes(rawCharset)) {
    return 'shift_jis';
  }
  if (['euc-jp', 'eucjp', 'euc_jp'].includes(rawCharset)) {
    return 'euc-jp';
  }
  if (['utf8', 'utf-8'].includes(rawCharset)) {
    return 'utf-8';
  }

  return rawCharset;
}

function normalizeEncodingName(name: string | null): string | null {
  if (!name) {
    return null;
  }
  const normalized = name.toLowerCase();
  if (normalized.includes('shift') || normalized.includes('sjis')) {
    return 'shift_jis';
  }
  if (normalized.includes('euc')) {
    return 'euc-jp';
  }
  if (normalized.includes('utf')) {
    return 'utf-8';
  }
  return normalized;
}

function decodeWithEncoding(
  buffer: ArrayBuffer,
  from: 'SJIS' | 'EUCJP',
  fallbackText: string
): string {
  try {
    const unicodeArray = Encoding.convert(new Uint8Array(buffer), {
      to: 'UNICODE',
      from,
      type: 'array',
    }) as number[];
    return Encoding.codeToString(unicodeArray);
  } catch (error) {
    console.warn(`${from} decode failed, falling back to utf-8`, error);
    return fallbackText;
  }
}

async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  const executing = new Set<Promise<void>>();

  for (const item of items) {
    const p = (async () => {
      try {
        const value = await task(item);
        results.push({ status: 'fulfilled', value });
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
      }
    })();

    executing.add(p);
    p.finally(() => executing.delete(p));

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

function inferIndustryFromContent(content: string): string[] {
  const industryKeywords = {
    'technology': ['software', 'tech', 'digital', 'AI', 'artificial intelligence', 'blockchain', 'cloud'],
    'manufacturing': ['manufacturing', 'production', 'factory', 'industrial', 'machinery'],
    'consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
    'healthcare': ['healthcare', 'medical', 'hospital', 'clinic', 'pharmaceutical'],
    'finance': ['finance', 'financial', 'banking', 'investment', 'insurance', 'bank', 'loans', 'mortgage', 'credit'],
    'retail': ['retail', 'e-commerce', 'shopping', 'store', 'marketplace'],
    'education': ['education', 'training', 'learning', 'university', 'school'],
    'food_service': ['restaurant', 'food', 'catering', 'hospitality', 'cuisine'],
    'logistics': ['logistics', 'shipping', 'transportation', 'supply chain', 'delivery'],
  };

  const contentLower = content.toLowerCase();
  const foundIndustries = [];

  if (
    contentLower.includes('bank') ||
    contentLower.includes('banking') ||
    contentLower.includes('loan') ||
    contentLower.includes('mortgage') ||
    contentLower.includes('investment') ||
    content.includes('銀行') ||
    content.includes('金融') ||
    content.includes('投資') ||
    content.includes('ローン') ||
    content.includes('証券') ||
    content.includes('保険')
  ) {
    foundIndustries.push('finance');
  }

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      if (!foundIndustries.includes(industry)) {
        foundIndustries.push(industry);
      }
    }
  }

  return foundIndustries.length > 0 ? foundIndustries : ['business_services'];
}

function extractSpecialtiesFromContent(
  content: string,
  metaKeywords?: string | null,
  orgKeywords?: string | string[] | null
): string[] {
  const keywordList = [];
  if (typeof orgKeywords === 'string') {
    keywordList.push(...orgKeywords.split(','));
  } else if (Array.isArray(orgKeywords)) {
    keywordList.push(...orgKeywords.map(String));
  }
  if (metaKeywords) {
    keywordList.push(...metaKeywords.split(','));
  }
  const cleanedKeywords = keywordList
    .map((item) => sanitizeText(item))
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item.length > 2 && item.length <= 50)
    .filter((item) => !looksLikeHtml(item))
    .filter((item) => !isGenericSpecialty(item));

  const specialtyPatterns = [
    /(?:specializ(?:e|ing) in|expertise in|focus(?:es)? on|services include)[^.]{1,100}/gi,
    /(?:we offer|providing|solutions for)[^.]{1,100}/gi,
    /(?:サービス|事業内容|取り扱い|提供)[^。]{1,60}/gi,
  ];

  const specialties = [];
  if (cleanedKeywords.length > 0) {
    specialties.push(...cleanedKeywords.slice(0, 8));
  }
  for (const pattern of specialtyPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      specialties.push(
        ...matches
          .map(match => sanitizeText(match).substring(0, 50))
          .filter((item) => item.length > 2 && item.length <= 50)
          .filter((item) => !looksLikeHtml(item))
          .filter((item) => !isGenericSpecialty(item))
      );
    }
  }

  const unique = Array.from(new Set(specialties)).slice(0, 5);
  return unique;
}

function looksLikeHtml(text: string): boolean {
  return /<[^>]+>/.test(text) || /&[a-z]+;/.test(text);
}

function isGenericSpecialty(text: string): boolean {
  const lowered = text.toLowerCase();
  const genericPhrases = [
    'official website',
    'service information',
    'services',
    'website',
    'learn more',
    'details',
  ];
  if (genericPhrases.some((phrase) => lowered.includes(phrase))) {
    return true;
  }
  if (
    text.includes('公式ウェブサイト') ||
    text.includes('公式サイト') ||
    text.includes('サービスのご案内') ||
    text.includes('サービス終了') ||
    text.includes('ご案内') ||
    text.includes('一覧')
  ) {
    return true;
  }
  return false;
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

function inferCompanySizeFromContent(content: string, employees?: unknown): string {
  const countFromStructured = parseEmployeeCount(employees);
  if (countFromStructured !== null) {
    return sizeFromEmployeeCount(countFromStructured);
  }

  const contentLower = content.toLowerCase();
  const employeeMatch = contentLower.match(/(\d{1,5})\s*(employees|staff|people|personnel|employees\.|employees,|人|名)/);
  if (employeeMatch) {
    const count = Number(employeeMatch[1]);
    if (!Number.isNaN(count)) {
      return sizeFromEmployeeCount(count);
    }
  }
  
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

function sizeFromEmployeeCount(count: number): string {
  if (count < 10) return 'micro';
  if (count < 50) return 'small';
  if (count < 250) return 'medium';
  return 'large';
}

function parseEmployeeCount(employees: unknown): number | null {
  if (typeof employees === 'number') {
    return employees;
  }
  if (typeof employees === 'string') {
    const parsed = parseInt(employees.replace(/[^\d]/g, ''), 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof employees === 'object' && employees) {
    const value = (employees as Record<string, unknown>).value;
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseInt(value.replace(/[^\d]/g, ''), 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
  }
  return null;
}

function extractEmailFromContent(content: string): string | null {
  const mailtoMatch = content.match(/mailto:([^\s"'<>]+)/i);
  if (mailtoMatch) {
    return mailtoMatch[1];
  }
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : null;
}

function extractPhoneFromContent(content: string): string | null {
  const telMatch = content.match(/tel:([+\d\s().-]+)/i);
  if (telMatch) {
    return telMatch[1];
  }
  const jpPhoneMatch = content.match(/0\d{1,4}-\d{1,4}-\d{3,4}/);
  if (jpPhoneMatch) {
    return jpPhoneMatch[0];
  }
  const phoneMatch = content.match(/[\+]?[1-9]?[\d\s\-\(\)]{9,}/);
  return phoneMatch ? phoneMatch[0] : null;
}

async function maybeFillDescriptionFromAbout(
  companyData: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  if (!companyData) {
    return null;
  }
  const description = typeof companyData.description === 'string' ? companyData.description : '';
  if (description && !description.toLowerCase().includes('company information extracted')) {
    return companyData;
  }

  const websiteUrl = typeof companyData.website_url === 'string' ? companyData.website_url : '';
  if (!websiteUrl) {
    return companyData;
  }

  const aboutCandidates = buildAboutUrls(websiteUrl);
  for (const candidate of aboutCandidates) {
    try {
      const response = await fetchWithTimeout(
        candidate,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SME-Partner-Search/1.0)',
          },
        },
        12000
      );
      if (!response.ok) {
        continue;
      }
      const html = await decodeResponseBody(response);
      const paragraph = extractFirstMeaningfulParagraph(html);
      if (paragraph) {
        return {
          ...companyData,
          description: cleanDescription(paragraph),
        };
      }
    } catch (error) {
      console.warn('About page fetch failed:', candidate, error);
    }
  }

  return companyData;
}

function buildAboutUrls(websiteUrl: string): string[] {
  try {
    const url = new URL(websiteUrl);
    const origin = `${url.protocol}//${url.host}`;
    const paths = [
      '/about',
      '/about-us',
      '/company',
      '/corporate',
      '/profile',
      '/overview',
      '/ja/about',
      '/ja/company',
      '/ja/corporate',
      '/ja/profile',
      '/ja/overview',
      '/jp/about',
      '/jp/company',
      '/jp/corporate',
      '/jp/profile',
      '/jp/overview',
      '/ja/ir',
    ];
    return paths.map((path) => `${origin}${path}`);
  } catch {
    return [];
  }
}

async function maybeFillMissingContacts(
  companyData: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  if (!companyData) {
    return null;
  }
  const hasEmail = typeof companyData.contact_email === 'string' && companyData.contact_email.length > 0;
  const hasPhone = typeof companyData.phone === 'string' && companyData.phone.length > 0;
  if (hasEmail && hasPhone) {
    return companyData;
  }

  const websiteUrl = typeof companyData.website_url === 'string' ? companyData.website_url : '';
  if (!websiteUrl) {
    return companyData;
  }

  const contactCandidates = buildContactUrls(websiteUrl);
  for (const candidate of contactCandidates) {
    try {
      const response = await fetchWithTimeout(
        candidate,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SME-Partner-Search/1.0)',
          },
        },
        12000
      );
      if (!response.ok) {
        continue;
      }
      const html = await decodeResponseBody(response);
      const email = hasEmail ? null : extractEmailFromContent(html);
      const phone = hasPhone ? null : extractPhoneFromContent(html);

      if (email || phone) {
        return {
          ...companyData,
          contact_email: email || companyData.contact_email,
          phone: phone ? sanitizeText(phone).replace(/\s+/g, '') : companyData.phone,
        };
      }
    } catch (error) {
      console.warn('Contact page fetch failed:', candidate, error);
    }
  }

  return companyData;
}

function buildContactUrls(websiteUrl: string): string[] {
  try {
    const url = new URL(websiteUrl);
    const origin = `${url.protocol}//${url.host}`;
    const paths = [
      '/contact',
      '/contact-us',
      '/contactus',
      '/support',
      '/inquiry',
      '/inquiries',
      '/help',
      '/about',
      '/company',
      '/corporate',
      '/ja/contact',
      '/ja/about',
      '/jp/contact',
      '/jp/about',
      '/ja/contacts',
      '/ja/inquiry',
      '/jp/inquiry',
    ];

    return paths.map((path) => `${origin}${path}`);
  } catch {
    return [];
  }
}

function extractMetaContent(content: string, attribute: string, value: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  const match = content.match(pattern);
  return match ? match[1] : null;
}

function extractJsonLd(content: string): Record<string, unknown>[] {
  const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const results: Record<string, unknown>[] = [];
  let match;
  while ((match = scriptPattern.exec(content)) !== null) {
    const jsonText = match[1].trim();
    if (!jsonText) continue;
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        results.push(...parsed.filter(Boolean));
      } else if (parsed && typeof parsed === 'object') {
        results.push(parsed);
      }
    } catch {
      continue;
    }
  }
  return results;
}

function selectOrganizationData(jsonLd: Record<string, unknown>[]) {
  for (const item of jsonLd) {
    const type = item['@type'];
    const types = Array.isArray(type) ? type : [type];
    if (types.some((t) => typeof t === 'string' && /organization|corporation|localbusiness/i.test(t))) {
      return normalizeOrganization(item);
    }
    const graph = item['@graph'];
    if (Array.isArray(graph)) {
      for (const node of graph) {
        const nodeType = node?.['@type'];
        const nodeTypes = Array.isArray(nodeType) ? nodeType : [nodeType];
        if (nodeTypes.some((t) => typeof t === 'string' && /organization|corporation|localbusiness/i.test(t))) {
          return normalizeOrganization(node as Record<string, unknown>);
        }
      }
    }
  }
  return null;
}

function normalizeOrganization(item: Record<string, unknown>) {
  const address = item.address as Record<string, unknown> | undefined;
  return {
    name: typeof item.name === 'string' ? item.name : null,
    description: typeof item.description === 'string' ? item.description : null,
    email: typeof item.email === 'string' ? item.email : null,
    telephone: typeof item.telephone === 'string' ? item.telephone : null,
    industry: item.industry ?? null,
    keywords: item.keywords ?? null,
    knowsAbout: item.knowsAbout ?? null,
    numberOfEmployees: item.numberOfEmployees ?? null,
    addressCountry: typeof address?.addressCountry === 'string' ? address.addressCountry : null,
    addressLocality: typeof address?.addressLocality === 'string' ? address.addressLocality : null,
  };
}

function normalizeIndustryList(industry: unknown): string[] | null {
  if (!industry) return null;
  if (Array.isArray(industry)) {
    const values = industry.map((item) => String(item)).filter(Boolean);
    return values.length > 0 ? values : null;
  }
  if (typeof industry === 'string') {
    const values = industry.split(',').map((item) => sanitizeText(item)).filter(Boolean);
    return values.length > 0 ? values : null;
  }
  return null;
}

function extractAddressText(address: unknown): string | null {
  if (!address) return null;
  if (typeof address === 'string') {
    return sanitizeText(address);
  }
  if (typeof address === 'object') {
    const addr = address as Record<string, unknown>;
    const parts = [
      addr.streetAddress,
      addr.addressLocality,
      addr.addressRegion,
      addr.postalCode,
      addr.addressCountry,
    ]
      .filter((item) => typeof item === 'string')
      .map((item) => sanitizeText(item as string));
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }
  return null;
}

async function storeCompanyInDB(companyData: any, replace: boolean) {
  try {
    const normalizedUrl = normalizeUrl(companyData.website_url) || companyData.website_url;
    const { raw_content, ...payload } = companyData;
    // Check if company already exists to avoid duplicates
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('website_url', normalizedUrl)
      .maybeSingle();

    if (existing) {
      if (!replace) {
        console.log('Company website already exists:', companyData.website_url);
        return { stored: false, replaced: false };
      }

      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Error replacing company:', deleteError);
        return { stored: false, replaced: false };
      }
    }

    const { error } = await supabase
      .from('companies')
      .insert([{ ...payload, website_url: normalizedUrl }]);

    if (error) {
      console.error('Error storing company:', error);
      return { stored: false, replaced: false };
    }

    console.log('Successfully stored company:', companyData.name);
    return { stored: true, replaced: !!existing && replace };
  } catch (error) {
    console.error('Database error:', error);
    return { stored: false, replaced: false };
  }
}
