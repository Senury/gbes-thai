import { supabase } from "@/integrations/supabase/client";

export interface CompanySearchFilters {
  industry?: string;
  location?: string;
  companySize?: string;
  verified?: boolean;
  dataSources?: string[];
  locationPlaceId?: string;
}

export interface DataSourceConfig {
  name: string;
  enabled: boolean;
  priority: number;
  rateLimit?: number;
}

export interface SearchResults {
  companies: any[];
  count: number;
  hasMore: boolean;
}

export class CompanySearchService {
  // Available data sources configuration
  static readonly DATA_SOURCES: DataSourceConfig[] = [
    { name: 'supabase', enabled: true, priority: 1 },
    { name: 'google_places', enabled: true, priority: 2 },
    { name: 'opencorporates', enabled: true, priority: 3 },
    { name: 'crunchbase', enabled: true, priority: 4 },
    { name: 'yellow_pages', enabled: true, priority: 5 },
    { name: 'companies_house', enabled: true, priority: 6 },
  ];

  // Region mapping for enhanced geographical search
  private static regionMappings = {
    // Japanese regions
    'アジア': ['asia', 'japan', 'china', 'korea', 'thailand', 'singapore', 'malaysia', 'indonesia', 'vietnam', 'philippines', 'india'],
    'ヨーロッパ': ['europe', 'germany', 'france', 'italy', 'spain', 'netherlands', 'belgium', 'switzerland', 'austria', 'sweden', 'norway', 'denmark', 'finland', 'poland', 'czech', 'hungary'],
    '北米': ['north america', 'usa', 'united states', 'canada', 'mexico'],
    '南米': ['south america', 'brazil', 'argentina', 'chile', 'colombia', 'peru', 'venezuela'],
    'アフリカ': ['africa', 'south africa', 'egypt', 'nigeria', 'kenya', 'morocco'],
    'オセアニア': ['oceania', 'australia', 'new zealand'],
    '日本': ['japan', 'tokyo', 'osaka', 'kyoto', 'yokohama', 'nagoya', 'fukuoka'],
    '中国': ['china', 'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'hong kong'],
    'アメリカ': ['usa', 'united states', 'america', 'california', 'new york', 'texas', 'florida'],
    'タイ': ['thailand', 'bangkok', 'phuket', 'chiang mai'],
    
    // English regions  
    'asia': ['asia', 'japan', 'china', 'korea', 'thailand', 'singapore', 'malaysia', 'indonesia', 'vietnam', 'philippines', 'india'],
    'europe': ['europe', 'germany', 'france', 'italy', 'spain', 'netherlands', 'belgium', 'switzerland', 'austria', 'sweden', 'norway', 'denmark', 'finland', 'poland', 'czech', 'hungary'],
    'north america': ['north america', 'usa', 'united states', 'canada', 'mexico'],
    'south america': ['south america', 'brazil', 'argentina', 'chile', 'colombia', 'peru', 'venezuela'],
    'africa': ['africa', 'south africa', 'egypt', 'nigeria', 'kenya', 'morocco'],
    'oceania': ['oceania', 'australia', 'new zealand'],
    'japan': ['japan', 'tokyo', 'osaka', 'kyoto', 'yokohama', 'nagoya', 'fukuoka'],
    'china': ['china', 'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'hong kong'],
    'usa': ['usa', 'united states', 'america', 'california', 'new york', 'texas', 'florida'],
    'america': ['usa', 'united states', 'america', 'california', 'new york', 'texas', 'florida'],
    'thailand': ['thailand', 'bangkok', 'phuket', 'chiang mai'],
    'germany': ['germany', 'berlin', 'munich', 'hamburg', 'cologne'],
    'france': ['france', 'paris', 'lyon', 'marseille', 'nice'],
    'italy': ['italy', 'rome', 'milan', 'naples', 'turin'],
    'spain': ['spain', 'madrid', 'barcelona', 'valencia', 'seville']
  };

  private static detectSearchRegion(query: string): string[] | null {
    const queryLower = query.toLowerCase();
    
    // Check for region matches
    for (const [regionKey, countries] of Object.entries(this.regionMappings)) {
      if (queryLower.includes(regionKey.toLowerCase()) || 
          countries.some(country => queryLower.includes(country.toLowerCase()))) {
        console.log(`Detected region: ${regionKey} -> ${countries}`);
        return countries;
      }
    }
    
    return null;
  }

  // Category mapping for enhanced search
  private static categoryMappings = {
    // Japanese to search terms and industries
    '医療': {
      searchTerms: ['health', 'medical', 'clinic', 'hospital', 'pharmaceutical', 'healthcare'],
      industries: [],
      japanese: '医療業界'
    },
    '製造業': {
      searchTerms: ['manufacturing', 'factory', 'production', 'assembly', 'industrial'],
      industries: ['manufacturing', 'automotive'],
      japanese: '製造業'
    },
    '技術': {
      searchTerms: ['technology', 'tech', 'software', 'IT', 'digital', 'innovation'],
      industries: ['technology', 'software'],
      japanese: '技術'
    },
    '物流': {
      searchTerms: ['logistics', 'shipping', 'transport', 'delivery', 'supply chain', 'warehouse'],
      industries: ['logistics'],
      japanese: '物流'
    },
    '貿易': {
      searchTerms: ['trade', 'import', 'export', 'international', 'commerce'],
      industries: ['trade'],
      japanese: '貿易'
    },
    '金融': {
      searchTerms: ['finance', 'financial', 'banking', 'investment', 'fintech'],
      industries: ['fintech'],
      japanese: '金融'
    },
    'ファッション': {
      searchTerms: ['fashion', 'clothing', 'apparel', 'garment', 'textile'],
      industries: ['fashion', 'textile'],
      japanese: 'ファッション'
    },
    '自動車': {
      searchTerms: ['automotive', 'automobile', 'car', 'vehicle', 'auto'],
      industries: ['automotive'],
      japanese: '自動車'
    },
    // English terms
    'medical': {
      searchTerms: ['health', 'medical', 'clinic', 'hospital', 'pharmaceutical', 'healthcare'],
      industries: [],
      japanese: '医療業界'
    },
    'manufacturing': {
      searchTerms: ['manufacturing', 'factory', 'production', 'assembly', 'industrial'],
      industries: ['manufacturing', 'automotive'],
      japanese: '製造業'
    },
    'technology': {
      searchTerms: ['technology', 'tech', 'software', 'IT', 'digital', 'innovation'],
      industries: ['technology', 'software'],
      japanese: '技術'
    },
    'logistics': {
      searchTerms: ['logistics', 'shipping', 'transport', 'delivery', 'supply chain', 'warehouse'],
      industries: ['logistics'],
      japanese: '物流'
    },
    'trade': {
      searchTerms: ['trade', 'import', 'export', 'international', 'commerce'],
      industries: ['trade'],
      japanese: '貿易'
    },
    'finance': {
      searchTerms: ['finance', 'financial', 'banking', 'investment', 'fintech'],
      industries: ['fintech'],
      japanese: '金融'
    },
    'fashion': {
      searchTerms: ['fashion', 'clothing', 'apparel', 'garment', 'textile'],
      industries: ['fashion', 'textile'],
      japanese: 'ファッション'
    },
    'automotive': {
      searchTerms: ['automotive', 'automobile', 'car', 'vehicle', 'auto'],
      industries: ['automotive'],
      japanese: '自動車'
    },
    'fintech': {
      searchTerms: ['fintech', 'finance', 'financial', 'banking', 'investment'],
      industries: ['fintech'],
      japanese: '金融'
    },
    'software': {
      searchTerms: ['software', 'app', 'application', 'development', 'programming'],
      industries: ['software', 'technology'],
      japanese: 'ソフトウェア'
    },
    'retail': {
      searchTerms: ['retail', 'store', 'shop', 'sales', 'commerce'],
      industries: ['retail'],
      japanese: '小売'
    }
  };

  private static detectSearchCategory(query: string): string | null {
    const queryLower = query.toLowerCase();
    
    // Check for exact category matches first (highest priority)
    for (const [category, config] of Object.entries(this.categoryMappings)) {
      if (queryLower === category.toLowerCase()) {
        console.log(`Exact category match found: ${category}`);
        return category;
      }
    }
    
    // Then check for partial matches in search terms
    for (const [category, config] of Object.entries(this.categoryMappings)) {
      if (config.searchTerms.some(term => queryLower.includes(term.toLowerCase()))) {
        console.log(`Partial category match found: ${category} via search terms`);
        return category;
      }
    }
    
    console.log(`No category match found for: ${query}`);
    return null;
  }

  static async searchCompanies(
    query: string, 
    filters: CompanySearchFilters = {},
    page: number = 0,
    pageSize: number = 20
  ): Promise<SearchResults> {
    try {
      // First search existing companies in database
      const dbResults = await this.searchExistingCompanies(query, filters, page, pageSize);
      
      // Filter sensitive contact information based on user access
      const filteredResults = await this.filterContactInformation(dbResults);
      
      // If we have fewer results than requested, try to fetch more from external sources
      if (filteredResults.companies.length < pageSize && page === 0) {
        const hasSearchQuery = Boolean(query && query.trim().length >= 2);
        const hasFilterCriteria =
          Boolean(filters.industry && filters.industry !== 'all') ||
          Boolean(filters.location && filters.location !== 'all-regions') ||
          Boolean(filters.companySize && filters.companySize !== 'all');

        if (hasSearchQuery || hasFilterCriteria) {
          console.log('Searching external sources for more companies...');
          const enabledSources = filters.dataSources || this.getEnabledDataSources();
          await this.searchMultipleExternalSources(query, filters, enabledSources);
          
          // Search again after populating with external data
          const updatedResults = await this.searchExistingCompanies(query, filters, page, pageSize);
          const finalResults = await this.filterContactInformation(updatedResults);
          return finalResults;
        } else {
          console.log('Skipping external search: no keyword or filter criteria provided.');
        }
      }
      
      return filteredResults;
    } catch (error) {
      console.error('Error in company search:', error);
      throw error;
    }
  }

  private static async filterContactInformation(results: SearchResults): Promise<SearchResults> {
    // Filter out contact information based on role-based access control
    // Get auth user once to avoid repeating the call for every company
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const filteredCompanies = await Promise.all(
      results.companies.map(async (company) => {
        // If user is not logged in, do not attempt RPC; mask contact info
        if (!userId) {
          return {
            ...company,
            contact_email: null,
            phone: null,
            _contact_restricted: true,
            _upgrade_required: true,
          };
        }

        // Check if user has access to this company's contact info using new role-based system
        const { data: hasAccess, error } = await supabase
          .rpc('can_access_company_contacts', { 
            _user_id: userId,
            company_uuid: company.id 
          });

        if (error) {
          console.error('Error checking company contact access:', error);
          // Default to restricted access on error
          return {
            ...company,
            contact_email: null,
            phone: null,
            _contact_restricted: true,
            _access_error: true,
          };
        }

        if (!hasAccess) {
          // Mask sensitive contact information for users without proper access
          return {
            ...company,
            contact_email: null, // Hide email
            phone: null, // Hide phone
            _contact_restricted: true, // Flag to indicate contact info is restricted
            _upgrade_required: true, // Flag to suggest upgrade for access
          };
        }

        return {
          ...company,
          _contact_restricted: false, // Flag that contact info is available
        };
      })
    );

    return {
      ...results,
      companies: filteredCompanies,
    };
  }

  private static async searchExistingCompanies(
    query: string,
    filters: CompanySearchFilters,
    page: number,
    pageSize: number
  ): Promise<SearchResults> {
    console.log('Searching for:', query);
    console.log('Filters received:', filters);
    console.log('=== DEBUGGING PARTNER SEARCH ===');
    console.log('Raw filters object:', JSON.stringify(filters, null, 2));
    
    // Detect if this is a category-specific search and/or region-specific search
    const detectedCategory = this.detectSearchCategory(query);
    const detectedRegion = this.detectSearchRegion(query);
    
    // Also check for location from filters and map it to region
    let filterRegion: string[] | null = null;
    if (filters.location && filters.location !== 'all-regions') {
      filterRegion = this.regionMappings[filters.location] || [filters.location];
      console.log('Filter location mapped to regions:', filterRegion);
    }
    
    // Combine detected region with filter region
    const effectiveRegion = detectedRegion || filterRegion;
    
    // Also check if we have a filter-based industry search
    const filterIndustry = filters.industry && filters.industry !== 'all' ? filters.industry : undefined;
    console.log('Filter industry:', filterIndustry);
    console.log('Detected category from query:', detectedCategory);
    console.log('Effective region:', effectiveRegion);
    
    if (detectedCategory || effectiveRegion || filterIndustry) {
      // Use detected category from query OR filter industry
      const effectiveCategory = detectedCategory || filterIndustry;
      console.log('Effective category being used:', effectiveCategory);
      
      let logMessage = 'Detected: ';
      if (effectiveCategory) {
        const categoryConfig = this.categoryMappings[effectiveCategory];
        if (categoryConfig) {
          logMessage += `${categoryConfig.japanese} industry`;
        } else {
          logMessage += `Unknown category: ${effectiveCategory}`;
          console.warn('Category not found in mappings:', effectiveCategory);
        }
      }
      if (effectiveRegion) {
        logMessage += effectiveCategory ? ` + region filter (${effectiveRegion.join(', ')})` : `region filter (${effectiveRegion.join(', ')})`;
      }
      console.log(`${logMessage} for query: "${query}"`);
      
      let queryBuilder = supabase
        .from('companies')
        .select('*', { count: 'exact' });
      
      // Build search conditions based on category and region
      const searchConditions: string[] = [];
      
      // Add category-based search conditions if category detected or filter provided
      if (effectiveCategory) {
        const categoryConfig = this.categoryMappings[effectiveCategory];
        if (categoryConfig) {
          console.log(`Using search terms:`, categoryConfig.searchTerms);
          console.log(`Using industries:`, categoryConfig.industries);
          
          // Add industry-based searches
          categoryConfig.industries.forEach(industry => {
            searchConditions.push(`industry.cs.{${industry}}`);
          });
          // Category-specific search logic to prevent cross-contamination
          if (effectiveCategory === '医療' || effectiveCategory === 'medical') {
            // Medical: Only medical terms
            const medicalOnlyTerms = ['health', 'medical', 'clinic', 'hospital', 'pharmaceutical', 'healthcare'];
            medicalOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === '製造業' || effectiveCategory === 'manufacturing') {
            // Manufacturing: Only manufacturing terms
            const manufacturingOnlyTerms = ['manufacturing', 'factory', 'production', 'assembly', 'industrial', 'manufacturer'];
            manufacturingOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === '技術' || effectiveCategory === 'technology') {
            // Technology: Only tech terms
            const techOnlyTerms = ['technology', 'tech', 'software', 'IT', 'digital', 'innovation', 'app', 'development'];
            techOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === '物流' || effectiveCategory === 'logistics') {
            // Logistics: Only logistics terms
            const logisticsOnlyTerms = ['logistics', 'shipping', 'transport', 'delivery', 'supply chain', 'warehouse', 'freight'];
            logisticsOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === '貿易' || effectiveCategory === 'trade') {
            // Trade: Only trade terms
            const tradeOnlyTerms = ['trade', 'import', 'export', 'international', 'commerce', 'trading', 'global'];
            tradeOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === '金融' || effectiveCategory === 'finance' || effectiveCategory === 'fintech') {
            // Finance: Only finance terms
            const financeOnlyTerms = ['finance', 'financial', 'banking', 'investment', 'fintech', 'bank', 'capital'];
            financeOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === 'ファッション' || effectiveCategory === 'fashion') {
            // Fashion: Only fashion terms
            const fashionOnlyTerms = ['fashion', 'clothing', 'apparel', 'garment', 'textile', 'wear', 'style'];
            fashionOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === '自動車' || effectiveCategory === 'automotive') {
            // Automotive: Only automotive terms
            const automotiveOnlyTerms = ['automotive', 'automobile', 'car', 'vehicle', 'auto', 'motor'];
            automotiveOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === 'software') {
            // Software: Only software terms
            const softwareOnlyTerms = ['software', 'app', 'application', 'development', 'programming', 'code'];
            softwareOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else if (effectiveCategory === 'retail') {
            // Retail: Only retail terms
            const retailOnlyTerms = ['retail', 'store', 'shop', 'sales', 'commerce', 'shopping'];
            retailOnlyTerms.forEach(term => {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            });
          } else {
            // Fallback: Use original search terms for any other categories
            const categoryConfig = this.categoryMappings[effectiveCategory];
            if (categoryConfig) {
              categoryConfig.searchTerms.forEach(term => {
                searchConditions.push(`name.ilike.%${term}%`);
                searchConditions.push(`description.ilike.%${term}%`);
              });
            }
          }
        } else {
          console.warn('No categoryConfig found for:', effectiveCategory);
        }
      } else if (effectiveRegion) {
        // If only region is detected without category, search all companies in that region
        console.log('Region-only search detected');
        searchConditions.push('id.neq.00000000-0000-0000-0000-000000000000'); // Match all companies
      }
      
      if (searchConditions.length > 0) {
        // Apply region filter by adding to search conditions instead of separate or() call
        if (effectiveRegion) {
          effectiveRegion.forEach(country => {
            searchConditions.push(`location_country.ilike.%${country}%`);
          });
          console.log(`Added region filter to search conditions:`, effectiveRegion);
        }
        
        // Single OR call with all conditions
        queryBuilder = queryBuilder.or(searchConditions.join(','));
        console.log(`All search conditions:`, searchConditions);
      } else {
        console.log(`No search conditions built`);
        return { companies: [], count: 0, hasMore: false };
      }
      
      const { data: results, error, count } = await queryBuilder
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('verified', { ascending: false })
        .order('created_at', { ascending: false });
        
       if (error) {
         const errorType = effectiveCategory ? 
           (this.categoryMappings[effectiveCategory]?.japanese || effectiveCategory) : 
           'Region';
         console.error(`${errorType} search error:`, error);
         throw error;
       }
       
       const resultType = effectiveCategory ? 
         (this.categoryMappings[effectiveCategory]?.japanese || effectiveCategory) : 
         'region';
       console.log(`Found ${results?.length || 0} ${resultType} companies from database`);
      
      // Apply additional filters if needed
      let filteredResults = results || [];
      
      if (filters.location && filters.location !== 'all-regions') {
        // Map Japanese location names to English equivalents
        const locationTerms = this.regionMappings[filters.location] || [filters.location];
        console.log('Filtering by location terms:', locationTerms);
        
        filteredResults = filteredResults.filter(company => {
          const country = company.location_country?.toLowerCase() || '';
          const city = company.location_city?.toLowerCase() || '';
          return locationTerms.some(term => 
            country.includes(term.toLowerCase()) || 
            city.includes(term.toLowerCase())
          );
        });
      }
      
      if (filters.companySize && filters.companySize !== 'all') {
        filteredResults = filteredResults.filter(company => 
          company.company_size === filters.companySize
        );
      }
      
      return {
        companies: filteredResults,
        count: filteredResults.length,
        hasMore: false
      };
    }

    // Default search for non-category queries
    let queryBuilder = supabase
      .from('companies')
      .select('*', { count: 'exact' });

    // Build search conditions for general queries
    const searchConditions: string[] = [];
    
    // Only add text search if query is not empty
    if (query && query.trim()) {
      searchConditions.push(`name.ilike.%${query}%`);
      searchConditions.push(`description.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.industry && filters.industry !== 'all') {
      console.log('=== APPLYING INDUSTRY FILTER ===');
      console.log('Original industry filter:', filters.industry);
      
      // Map Japanese industry terms to English database terms
      const industryMap: { [key: string]: string[] } = {
        '医療': ['medical', 'healthcare', 'health'],
        '製造業': ['manufacturing', 'automotive', 'industrial'],
        '技術': ['technology', 'software', 'tech'],
        '物流': ['logistics', 'transport', 'shipping'],
        '貿易': ['trade', 'import', 'export'],
        '金融': ['fintech', 'finance', 'financial'],
        'ファッション': ['fashion', 'textile', 'apparel'],
        '自動車': ['automotive', 'automobile'],
        // English terms (for English interface)
        'medical': ['medical', 'healthcare', 'health'],
        'manufacturing': ['manufacturing', 'automotive', 'industrial'],
        'technology': ['technology', 'software', 'tech'],
        'logistics': ['logistics', 'transport', 'shipping'],
        'trade': ['trade', 'import', 'export'],
        'finance': ['fintech', 'finance', 'financial'],
        'fashion': ['fashion', 'textile', 'apparel'],
        'automotive': ['automotive', 'automobile']
      };
      
      const mappedIndustries = industryMap[filters.industry] || [filters.industry];
      console.log('Mapped industries:', mappedIndustries);
      
      // Use text-based search for industry matching - more reliable than array operations
      mappedIndustries.forEach(industry => {
        searchConditions.push(`name.ilike.%${industry}%`);
        searchConditions.push(`description.ilike.%${industry}%`);
        console.log('Adding text search conditions for industry:', industry);
      });
      
      // Use proper PostgREST array containment syntax
      mappedIndustries.forEach(industry => {
        searchConditions.push(`industry.cs.["${industry}"]`);
        console.log('Adding array condition:', `industry.cs.["${industry}"]`);
      });
    }

    // Consolidate all search conditions before applying
    if (filters.location && filters.location !== 'all-regions') {
      // Map Japanese location names to English equivalents
      const locationTerms = this.regionMappings[filters.location] || [filters.location];
      console.log('Adding location filter with terms:', locationTerms);
      
      locationTerms.forEach(term => {
        searchConditions.push(`location_country.ilike.%${term}%`);
        searchConditions.push(`location_city.ilike.%${term}%`);
      });
    }

    console.log('=== ALL SEARCH CONDITIONS ===');
    console.log('Search conditions array:', searchConditions);

    // Apply all search conditions in a SINGLE OR call
    if (searchConditions.length > 0) {
      console.log('=== APPLYING SEARCH CONDITIONS ===');
      console.log('Final OR condition:', searchConditions.join(','));
      queryBuilder = queryBuilder.or(searchConditions.join(','));
    } else {
      console.log('=== NO SEARCH CONDITIONS - GETTING ALL COMPANIES ===');
    }

    if (filters.companySize && filters.companySize !== 'all') {
      queryBuilder = queryBuilder.eq('company_size', filters.companySize);
    }

    if (filters.verified !== undefined) {
      queryBuilder = queryBuilder.eq('verified', filters.verified);
    }

    const { data, error, count } = await queryBuilder
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('verified', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database search error:', error);
      throw error;
    }

    return {
      companies: data || [],
      count: count || 0,
      hasMore: (count || 0) > (page + 1) * pageSize
    };
  }

  static getEnabledDataSources(): string[] {
    return this.DATA_SOURCES
      .filter(source => source.enabled && source.name !== 'supabase')
      .map(source => source.name);
  }

  static async searchMultipleExternalSources(
    query: string,
    filters: CompanySearchFilters,
    dataSources: string[]
  ): Promise<void> {
    try {
      console.log('Searching external sources:', dataSources);
      
      const { data, error } = await supabase.functions.invoke('search-companies', {
        body: {
          query,
          dataSources,
          filters
        }
      });

      if (error) {
        console.error('External search error:', error);
        throw error;
      }

      console.log('External search completed:', data);
    } catch (error) {
      console.error('Failed to search external sources:', error);
      throw error;
    }
  }

  static async getAvailableDataSources(): Promise<DataSourceConfig[]> {
    return this.DATA_SOURCES;
  }

  static async testDataSourceConnection(sourceName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('search-companies', {
        body: {
          query: 'test',
          dataSources: [sourceName],
          test: true
        }
      });

      if (error) {
        console.error(`Connection test failed for ${sourceName}:`, error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error(`Connection test failed for ${sourceName}:`, error);
      return false;
    }
  }

  static async scrapeCompanyWebsites(
    urls: string[],
    industry?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-company-data', {
        body: {
          urls,
          industry
        }
      });

      if (error) {
        console.error('Website scraping error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to scrape company websites:', error);
      throw error;
    }
  }

  static async createPartnershipInquiry(
    companyId: string,
    message: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to create partnership inquiry');
    }

    // First, create the inquiry record in the database
    const { error } = await supabase.from('partnership_inquiries').insert({
      user_id: user.id,
      company_id: companyId,
      message,
      status: 'pending'
    });

    if (error) {
      console.error('Partnership inquiry error:', error);
      throw error;
    }

    // Then, send the email to the company (background task)
    try {
      const { error: emailError } = await supabase.functions.invoke('send-partnership-inquiry', {
        body: {
          companyId,
          message,
          userId: user.id
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // Don't throw here - the inquiry was saved successfully
        // The email failure shouldn't block the user experience
      }
    } catch (emailError) {
      console.error('Failed to send partnership inquiry email:', emailError);
      // Continue without throwing - inquiry was saved successfully
    }
  }

  static async getUserInquiries(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to get inquiries');
    }

    const { data, error } = await supabase
      .from('partnership_inquiries')
      .select(`
        *,
        companies:company_id (
          id,
          name,
          description,
          website_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get inquiries error:', error);
      throw error;
    }

    return data || [];
  }
}
