import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, MapPin, Building, Globe, Users, CheckCircle, Plus, ExternalLink, Filter, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/en/Navigation";
import Footer from "@/components/en/Footer";
import { CompanySearchService, CompanySearchFilters } from "@/utils/CompanySearchService";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { ContactAccessPrompt } from "@/components/ContactAccessPrompt";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  description: string;
  industry: string[];
  location_country: string;
  location_city: string;
  company_size: string;
  specialties: string[];
  website_url: string;
  verified: boolean;
  data_source: string;
  contact_email?: string | null;
  phone?: string | null;
  _contact_restricted?: boolean;
  _upgrade_required?: boolean;
  _access_error?: boolean;
}

const PartnerSearch = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CompanySearchFilters>({
    industry: 'all',
    location: 'all-regions',
    companySize: 'all',
    locationPlaceId: undefined,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [websiteUrls, setWebsiteUrls] = useState('');
  const [showScrapeDialog, setShowScrapeDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(['google_places', 'opencorporates']);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, isAdmin } = useUserRole();

  const industries = [
    "manufacturing", "technology", "logistics", "trade", "fintech", "fashion", "textile", "automotive", "software"
  ];

  const companySizes = [
    { value: "micro", label: "Micro (1-9 employees)" },
    { value: "small", label: "Small (10-49 employees)" },
    { value: "medium", label: "Medium (50-249 employees)" },
    { value: "large", label: "Large (250+ employees)" }
  ];

  // Add defensive error boundary for the component
  useEffect(() => {
    console.log('English PartnerSearch component mounted');
    console.log('Initial filters state:', filters);
    
    // Validate that all filter values are valid
    if (!filters.industry || !filters.location || !filters.companySize) {
      console.warn('Invalid filter state detected, resetting...');
      setFilters({
        industry: 'all',
        location: 'all-regions',
        companySize: 'all',
        locationPlaceId: undefined,
      });
    }
  }, []);

  useEffect(() => {
    if (!locationQuery || locationQuery.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setIsLocationLoading(true);
        const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
          body: {
            input: locationQuery,
            language: 'en'
          }
        });
        if (!error && data?.predictions) {
          setLocationSuggestions(data.predictions);
        }
      } catch (error) {
        console.error('Location autocomplete error:', error);
      } finally {
        setIsLocationLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [locationQuery]);

  const handleSelectLocation = (prediction: any) => {
    setFilters(prev => ({
      ...prev,
      location: prediction.description,
      locationPlaceId: prediction.place_id,
    }));
    setLocationQuery(prediction.description);
    setLocationSuggestions([]);
  };

  const clearSelectedLocation = () => {
    setFilters(prev => ({
      ...prev,
      location: 'all-regions',
      locationPlaceId: undefined,
    }));
    setLocationQuery("");
    setLocationSuggestions([]);
  };

  const searchCompanies = async () => {
    // Allow search with just filters, no keyword required
    setIsSearching(true);
    setLoading(true);
    try {
      const searchFilters = {
        industry: filters.industry && filters.industry !== 'all' ? filters.industry : undefined,
        location: filters.location && filters.location !== 'all-regions' ? filters.location : undefined,
        companySize: filters.companySize && filters.companySize !== 'all' ? filters.companySize : undefined,
        dataSources: selectedDataSources,
        locationPlaceId: filters.locationPlaceId,
      };
      
      const results = await CompanySearchService.searchCompanies(searchQuery || "", searchFilters);

      setCompanies(results.companies);
      setTotalCount(results.count);
      toast({
        title: "Search Complete",
        description: `Found ${results.companies.length} companies from ${selectedDataSources.length} data sources.${results.count > results.companies.length ? ` (${results.count} total)` : ''}`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
      setShowFilters(false);
      setShowDataSourceSelector(false);
    }
  };

  const openInquiryDialog = (company: Company) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to send partnership inquiries",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCompany(company);
    setInquiryMessage(`Dear ${getDisplayName(company)} Team,

I hope this message finds you well.

I am reaching out to explore potential partnership opportunities between our organizations. After reviewing your company profile, I believe there may be synergies that could benefit both parties.

I would be particularly interested in discussing:
• Partnership structures and terms
• Mutual benefits of collaboration  
• Future business development opportunities

I would welcome the opportunity to schedule a call or meeting to discuss this further.

Thank you for your time and consideration.

Best regards`);
    setShowInquiryDialog(true);
  };

  const handleInquiry = async () => {
    if (!selectedCompany || !inquiryMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      await CompanySearchService.createPartnershipInquiry(
        selectedCompany.id,
        inquiryMessage
      );

      toast({
        title: "Inquiry Sent",
        description: "Your partnership inquiry has been sent successfully",
      });
      
      setShowInquiryDialog(false);
      setSelectedCompany(null);
      setInquiryMessage("");
    } catch (error: any) {
      console.error('Inquiry error:', error);
      toast({
        title: "Send Error",
        description: error.message || "An error occurred while sending your inquiry",
        variant: "destructive",
      });
    }
  };

  const scrapeWebsites = async () => {
    if (!websiteUrls.trim()) {
      toast({
        title: "Error",
        description: "Please enter website URLs.",
        variant: "destructive",
      });
      return;
    }

    const urls = websiteUrls.split('\n').map(url => url.trim()).filter(Boolean);
    if (urls.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid URLs.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await CompanySearchService.scrapeCompanyWebsites(
        urls,
        filters.industry || undefined
      );

      toast({
        title: "Scraping Complete",
        description: `Retrieved ${result?.count || 0} company records.`,
      });

      setWebsiteUrls('');
      setShowScrapeDialog(false);
      
      // Refresh search if there's an active query
      if (searchQuery.trim()) {
        await searchCompanies();
      }
    } catch (error: any) {
      console.error('Scraping error:', error);
      toast({
        title: "Scraping Error",
        description: "An error occurred while scraping website data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDataSourceLabel = (source: string) => {
    const labels: { [key: string]: string } = {
      'google_places': 'Google Places',
      'opencorporates': 'OpenCorporates',
      'web_scraping': 'Web Scraping',
      'sample': 'Sample',
      'manual': 'Manual'
    };
    return labels[source] || source;
  };

  // Helper function to get a displayable company name
  const getDisplayName = (company: Company) => {
    const raw = company.name?.trim() || '';
    const genericWords = [
      'group','company','co','co., ltd','co ltd','ltd','inc','llc','services','solutions','corp','corporation','holdings','partners'
    ];
    const isGeneric = !raw || raw.length < 3 || genericWords.includes(raw.toLowerCase());

    if (!isGeneric) return raw;

    // Try deriving from website domain
    if (company.website_url) {
      try {
        const u = new URL(company.website_url);
        const host = u.hostname.replace(/^www\./, '');
        let label = host.split('.')[0]?.replace(/[-_]/g, ' ') || '';
        label = label.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
        if (label && !genericWords.includes(label.toLowerCase())) return label;
      } catch {}
    }

    // Fallback: Industry + Location (EN)
    const industry = company.industry?.[0] || 'Company';
    const location = company.location_city || company.location_country || '';
    return `${industry}${location ? ' - ' + location : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Partner Search
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover trusted business partners worldwide and create new opportunities for growth
          </p>
        </div>


        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="w-full lg:flex-[3]">
            <Input
              placeholder="Search by company name, industry, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCompanies()}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:flex-[2] lg:justify-end">
            <Button onClick={searchCompanies} disabled={loading} className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDataSourceSelector(!showDataSourceSelector)}
              className="w-full sm:w-auto"
            >
              <Globe className="w-4 h-4 mr-2" />
              Data Sources ({selectedDataSources.length})
            </Button>
            <Dialog open={showScrapeDialog} onOpenChange={setShowScrapeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Companies
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Scrape Company Data from Websites</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter website URLs (one per line)&#10;Example:&#10;https://example.com&#10;https://company2.com"
                    value={websiteUrls}
                    onChange={(e) => setWebsiteUrls(e.target.value)}
                    rows={6}
                    aria-describedby="scrape-description-en"
                  />
                  <p id="scrape-description-en" className="text-sm text-muted-foreground">
                    Company information will be automatically extracted from the provided websites.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={scrapeWebsites} 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Scraping..." : "Scrape Data"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowScrapeDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

          {/* Data Source Selector */}
          {showDataSourceSelector && (
            <div className="mt-4">
              <DataSourceSelector
                selectedSources={selectedDataSources}
                onSourcesChange={setSelectedDataSources}
                locale="en"
              />
            </div>
          )}

          {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select industry categories and regions to refine your search results
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry Category</label>
                  <Select 
                    value={filters.industry || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="medical">🏥 Medical & Healthcare</SelectItem>
                      <SelectItem value="manufacturing">🏭 Manufacturing</SelectItem>
                      <SelectItem value="technology">💻 Technology</SelectItem>
                      <SelectItem value="logistics">🚛 Logistics & Transport</SelectItem>
                      <SelectItem value="trade">📦 Trade & Import/Export</SelectItem>
                      <SelectItem value="finance">💰 Finance & Fintech</SelectItem>
                      <SelectItem value="fashion">👗 Fashion & Apparel</SelectItem>
                      <SelectItem value="automotive">🚗 Automotive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Region Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Region & Location</label>
                  <Select 
                    value={filters.location || "all-regions"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value, locationPlaceId: undefined }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-regions">All Regions</SelectItem>
                      <SelectItem value="asia">🌏 Asia</SelectItem>
                      <SelectItem value="japan">🇯🇵 Japan</SelectItem>
                      <SelectItem value="china">🇨🇳 China</SelectItem>
                      <SelectItem value="thailand">🇹🇭 Thailand</SelectItem>
                      <SelectItem value="europe">🇪🇺 Europe</SelectItem>
                      <SelectItem value="usa">🇺🇸 United States</SelectItem>
                      <SelectItem value="north america">🌎 North America</SelectItem>
                      <SelectItem value="south america">🌎 South America</SelectItem>
                      <SelectItem value="africa">🌍 Africa</SelectItem>
                      <SelectItem value="oceania">🇦🇺 Oceania</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                      Google location search
                      {filters.locationPlaceId && (
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={clearSelectedLocation}
                        >
                          Clear
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Search city or landmark"
                        value={locationQuery}
                        onChange={(e) => {
                          setLocationQuery(e.target.value);
                          setFilters(prev => ({ ...prev, locationPlaceId: undefined }));
                        }}
                      />
                      {locationSuggestions.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow">
                          {locationSuggestions.map((prediction) => (
                            <button
                              type="button"
                              key={prediction.place_id}
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                              onClick={() => handleSelectLocation(prediction)}
                            >
                              {prediction.description}
                            </button>
                          ))}
                        </div>
                      )}
                      {isLocationLoading && (
                        <p className="text-xs text-muted-foreground mt-1">Fetching suggestions...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Company Size</label>
                  <Select 
                    value={filters.companySize || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Company Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={searchCompanies} 
                    className="flex-1"
                    disabled={loading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setFilters({ 
                        industry: 'all', 
                        location: 'all-regions', 
                        companySize: 'all',
                        locationPlaceId: undefined,
                      });
                      setSearchQuery('');
                      setLocationQuery('');
                      setLocationSuggestions([]);
                    }}
                  >
                    Reset
                  </Button>
                </div>
                
                {/* Helpful Tips */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">💡 Search Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Combine multiple criteria for better results</li>
                    <li>• You can also type "manufacturing asia" in the search bar</li>
                    <li>• Use "Add Companies" if no results are found</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {totalCount > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {companies.length} companies ({totalCount} total)
          </div>
        )}

        {companies.length === 0 && !loading && searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {(() => {
                const detectedCategory = 
                  /manufacturing|factory|production/i.test(searchQuery) ? 'Manufacturing' :
                  /technology|tech|software|IT/i.test(searchQuery) ? 'Technology' :
                  /logistics|shipping|transport/i.test(searchQuery) ? 'Logistics' :
                  /trade|import|export/i.test(searchQuery) ? 'Trade' :
                  /finance|financial|fintech/i.test(searchQuery) ? 'Finance' :
                  /fashion|clothing|apparel/i.test(searchQuery) ? 'Fashion' :
                  /automotive|automobile|car/i.test(searchQuery) ? 'Automotive' :
                  /medical|health|healthcare/i.test(searchQuery) ? 'Medical' : '';
                
                return detectedCategory 
                  ? `No ${detectedCategory.toLowerCase()} companies found.`
                  : 'No companies found matching your search criteria.';
              })()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {(() => {
                const hasCategory = /manufacturing|technology|logistics|trade|finance|fashion|automotive|medical|health/i.test(searchQuery);
                
                return hasCategory
                  ? 'Try using the "Add Companies" button to scrape relevant company websites.'
                  : 'Try changing your search terms or add new companies from external data sources.';
              })()}
            </p>
          </div>
        )}

        {companies.length === 0 && !loading && !searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Enter a search keyword to find partner companies.
            </p>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {getDisplayName(company)}
                    {company.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {company.location_city && `${company.location_city}, `}{company.location_country}
                  </span>
                </div>
                {company.website_url && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <a 
                      href={company.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {company.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {company.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Industries</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.industry.slice(0, 3).map((ind, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {ind.charAt(0).toUpperCase() + ind.slice(1)}
                        </Badge>
                      ))}
                      {company.verified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {getDataSourceLabel(company.data_source)}
                      </Badge>
                    </div>
                  </div>
                  
                  {company.specialties.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {company.specialties.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{companySizes.find(s => s.value === company.company_size)?.label}</span>
                  </div>
                  
                  {/* Contact Information - Show based on access control */}
                  {(company.contact_email || company.phone) && !company._contact_restricted && (
                    <div className="space-y-2 pt-2 border-t border-muted/50">
                      <h4 className="font-semibold text-sm">Contact</h4>
                      {company.contact_email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${company.contact_email}`} className="hover:text-primary">
                            {company.contact_email}
                          </a>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${company.phone}`} className="hover:text-primary">
                            {company.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Show access prompt if contact info is restricted */}
                {company._contact_restricted && (
                  <ContactAccessPrompt 
                    companyName={getDisplayName(company)}
                    companyId={company.id}
                    onUpgrade={() => {
                      // Navigate to pricing section
                      const pricingSection = document.getElementById('pricing');
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        // If pricing section not on current page, navigate to home page with pricing section
                        window.location.href = '/en#pricing';
                      }
                    }}
                    onMakeInquiry={() => openInquiryDialog(company)}
                  />
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openInquiryDialog(company)}
                  >
                    Contact
                  </Button>
                  {company.website_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Partnership Inquiry Dialog */}
      <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Partnership Inquiry to {selectedCompany?.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              The message below will be sent to the company's contact email. Please review and edit the content before sending.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Company Information</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Company:</strong> {selectedCompany?.name}</p>
                <p><strong>Industry:</strong> {selectedCompany?.industry.join(', ')}</p>
                <p><strong>Location:</strong> {selectedCompany?.location_city && `${selectedCompany.location_city}, `}{selectedCompany?.location_country}</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="inquiry-message-en" className="text-sm font-medium mb-2 block">
                Partnership Inquiry Message
              </label>
              <Textarea
                id="inquiry-message-en"
                placeholder="Enter your partnership inquiry message..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={12}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your contact information (name, email, company, etc.) will be included with this message.
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleInquiry}
                disabled={!inquiryMessage.trim()}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Inquiry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowInquiryDialog(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>📧 About Sending:</strong> This message will be sent directly to the company's registered email address, 
                and their reply will be delivered to your email address.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PartnerSearch;
