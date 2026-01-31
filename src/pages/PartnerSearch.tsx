import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, MapPin, Building, Globe, Users, CheckCircle, Plus, ExternalLink, Filter, Mail, Phone, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CompanySearchService, CompanySearchFilters } from "@/utils/CompanySearchService";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { ContactAccessPrompt } from "@/components/ContactAccessPrompt";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
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
  user_id?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  _contact_restricted?: boolean;
  _upgrade_required?: boolean;
  _access_error?: boolean;
}

const PartnerSearch = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CompanySearchFilters>({
    industry: 'all',
    location: 'all-regions',
    companySize: 'all',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [websiteUrls, setWebsiteUrls] = useState('');
  const [showScrapeDialog, setShowScrapeDialog] = useState(false);
  const [showScrapeResults, setShowScrapeResults] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<Company[]>([]);
  const [lastScrapeUrls, setLastScrapeUrls] = useState<string[]>([]);
  const [lastScrapeIndustry, setLastScrapeIndustry] = useState<string | undefined>(undefined);
  const [confirmingScrape, setConfirmingScrape] = useState(false);
  const [scrapePreviewOnly, setScrapePreviewOnly] = useState(false);
  const [useLlm, setUseLlm] = useState(false);
  const [lastScrapeUseLlm, setLastScrapeUseLlm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(['supabase', 'google_places', 'opencorporates']);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPremium, isAdmin } = useUserRole();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const [googleNextPageTokens, setGoogleNextPageTokens] = useState<Record<number, string>>({});

  const sortByQueryRelevance = (items: Company[], query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;

    const getScore = (company: Company) => {
      const name = company.name?.toLowerCase() || "";
      if (!name) return 0;
      if (name === normalizedQuery) return 400;
      if (name.startsWith(normalizedQuery)) return 300;
      const index = name.indexOf(normalizedQuery);
      if (index >= 0) return 200 - Math.min(index, 50);
      return 0;
    };

    return [...items].sort((a, b) => {
      const scoreDiff = getScore(b) - getScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const industries = t("partnerSearch.industries", { returnObjects: true }) as Array<{ value: string; label: string }>;
  const companySizes = t("partnerSearch.companySizes", { returnObjects: true }) as Array<{ value: string; label: string }>;

  const activeFilterCount = [
    filters.industry !== 'all',
    filters.location !== 'all-regions',
    filters.companySize !== 'all',
  ].filter(Boolean).length;

  const handlePrimaryAction = async (company: Company) => {
    if (company.verified) {
      if (!user) {
        toast({
          title: t("partnerSearch.chatAuthRequiredTitle"),
          description: t("partnerSearch.chatAuthRequiredDescription"),
        });
        navigate(`/${localePrefix}/login`);
        return;
      }

      const linkedUserId = company.user_id ?? null;

      if (!linkedUserId && !company.contact_email) {
        toast({
          title: t("partnerSearch.chatUnavailableTitle"),
          description: t("partnerSearch.chatUnavailableDescription"),
        });
        openInquiryDialog(company);
        return;
      }

      try {
        let targetUserId = linkedUserId;

        if (!targetUserId && company.contact_email) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_id, email")
            .eq("email", company.contact_email)
            .maybeSingle();

          if (profileError) throw profileError;
          targetUserId = profile?.user_id ?? null;
        }

        if (!targetUserId) {
          toast({
            title: t("partnerSearch.chatUnavailableTitle"),
            description: t("partnerSearch.chatUnavailableDescription"),
          });
          openInquiryDialog(company);
          return;
        }

        if (targetUserId === user.id) {
          toast({
            title: t("partnerSearch.chatSelfTitle"),
            description: t("partnerSearch.chatSelfDescription"),
          });
          return;
        }

        const { data: conversationId, error: conversationError } = await supabase.rpc(
          "create_direct_conversation",
          { other_user: targetUserId }
        );

        if (conversationError) throw conversationError;

        toast({
          title: t("partnerSearch.chatToastTitle"),
          description: t("partnerSearch.chatToastDescription", { company: getDisplayName(company) }),
        });
        navigate(`/${localePrefix}/messages?conversation=${conversationId}`);
        return;
      } catch (error) {
        console.error("Failed to start chat:", error);
        toast({
          title: t("partnerSearch.chatErrorTitle"),
          description: t("partnerSearch.chatErrorDescription"),
          variant: "destructive",
        });
        return;
      }
    }

    openInquiryDialog(company);
  };

  // Add defensive error boundary for the component
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Validate that all filter values are valid
    if (!filters.industry || !filters.location || !filters.companySize) {
      setFilters({
        industry: 'all',
        location: 'all-regions',
        companySize: 'all',
      });
    }
  }, []);

  const searchCompanies = async (nextPage: number = 0, showToast = true) => {
    // Allow search with just filters, no keyword required
    setIsSearching(true);
    setLoading(true);
    try {
      const searchFilters = {
        industry: filters.industry === "all" ? undefined : filters.industry || undefined,
        location: filters.location === "all-regions" ? undefined : filters.location || undefined,
        companySize: filters.companySize === "all" ? undefined : filters.companySize || undefined,
        dataSources: selectedDataSources,
        externalPageTokens: googleNextPageTokens[nextPage]
          ? { google_places: googleNextPageTokens[nextPage] }
          : undefined,
      };
      
      const results = await CompanySearchService.searchCompanies(
        searchQuery || "", // Allow empty search query
        searchFilters,
        nextPage,
        pageSize
      );

      const sortedCompanies = sortByQueryRelevance(results.companies, searchQuery);
      setCompanies(sortedCompanies);
      setTotalCount(results.count);
      setPage(nextPage);
      let computedTotalPages = Math.max(1, Math.ceil(results.count / pageSize));
      if (results.externalNextPageToken) {
        setGoogleNextPageTokens(prev => ({ ...prev, [nextPage + 1]: results.externalNextPageToken! }));
        computedTotalPages = Math.max(computedTotalPages, nextPage + 2);
      }
      setTotalPages(computedTotalPages);
      if (showToast) {
        toast({
          title: t("partnerSearch.toasts.searchCompleteTitle"),
          description: t("partnerSearch.toasts.searchCompleteDescription", {
            count: results.count,
            sources: selectedDataSources.length,
          }),
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: t("partnerSearch.toasts.searchErrorTitle"),
        description: t("partnerSearch.toasts.searchErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
      setShowFilters(false);
      setShowDataSourceSelector(false);
    }
  };

  const handlePageChange = async (nextPage: number) => {
    if (loading) return;
    if (nextPage === page) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    await searchCompanies(nextPage, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageItems = (currentPage: number, pageCount: number) => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, index) => index);
    }

    const lastPage = pageCount - 1;
    if (currentPage <= 2) {
      return [0, 1, 2, 3, lastPage];
    }
    if (currentPage >= lastPage - 2) {
      return [0, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    }

    return [0, currentPage - 1, currentPage, currentPage + 1, lastPage];
  };

  const openInquiryDialog = (company: Company) => {
    if (!user) {
      toast({
        title: t("partnerSearch.toasts.loginRequiredTitle"),
        description: t("partnerSearch.toasts.loginRequiredDescription"),
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCompany(company);
    setInquiryMessage(
      t("partnerSearch.inquiryTemplate", {
        company: getDisplayName(company),
      })
    );
    setShowInquiryDialog(true);
  };

  const handleInquiry = async () => {
    if (!selectedCompany || !inquiryMessage.trim()) {
      toast({
        title: t("partnerSearch.toasts.validationErrorTitle"),
        description: t("partnerSearch.toasts.validationErrorDescription"),
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
        title: t("partnerSearch.toasts.inquirySentTitle"),
        description: t("partnerSearch.toasts.inquirySentDescription"),
      });
      
      setShowInquiryDialog(false);
      setSelectedCompany(null);
      setInquiryMessage("");
    } catch (error: any) {
      console.error('Inquiry error:', error);
      toast({
        title: t("partnerSearch.toasts.sendErrorTitle"),
        description: error.message || t("partnerSearch.toasts.sendErrorDescription"),
        variant: "destructive",
      });
    }
  };

  const scrapeWebsites = async () => {
    if (!websiteUrls.trim()) {
      toast({
        title: t("partnerSearch.toasts.validationErrorTitle"),
        description: t("partnerSearch.toasts.websiteRequiredDescription"),
        variant: "destructive",
      });
      return;
    }

    const urls = websiteUrls.split('\n').map(url => url.trim()).filter(Boolean);
    if (urls.length === 0) {
      toast({
        title: t("partnerSearch.toasts.validationErrorTitle"),
        description: t("partnerSearch.toasts.websiteInvalidDescription"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      setLastScrapeUrls(urls);
      setLastScrapeIndustry(filters.industry || undefined);
      setLastScrapeUseLlm(useLlm);

      const result = await CompanySearchService.scrapeCompanyWebsites(
        urls,
        filters.industry || undefined,
        { confirm: false, llm: useLlm }
      );

      const scrapedCompanies = (result?.companies || []) as Company[];
      setScrapeResults(scrapedCompanies);
      setShowScrapeResults(scrapedCompanies.length > 0);
      setScrapePreviewOnly(true);

      toast({
        title: t("partnerSearch.toasts.scrapePreviewTitle"),
        description: t("partnerSearch.toasts.scrapePreviewDescription", {
          count: result?.count || 0,
        }),
      });

      setWebsiteUrls('');
      setShowScrapeDialog(false);
    } catch (error: any) {
      console.error('Scraping error:', error);
      if (error?.message === 'Authentication required') {
        toast({
          title: t("partnerSearch.toasts.scrapeLoginRequiredTitle"),
          description: t("partnerSearch.toasts.scrapeLoginRequiredDescription"),
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t("partnerSearch.toasts.scrapeErrorTitle"),
        description: t("partnerSearch.toasts.scrapeErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmScrape = async (replace = false) => {
    if (lastScrapeUrls.length === 0) {
      toast({
        title: t("partnerSearch.toasts.validationErrorTitle"),
        description: t("partnerSearch.toasts.websiteRequiredDescription"),
        variant: "destructive",
      });
      return;
    }

    setConfirmingScrape(true);
    try {
      const result = await CompanySearchService.scrapeCompanyWebsites(
        lastScrapeUrls,
        lastScrapeIndustry,
        { confirm: true, replace, llm: lastScrapeUseLlm }
      );

      const scrapedCompanies = (result?.companies || []) as Company[];
      setScrapeResults(scrapedCompanies);
      setShowScrapeResults(scrapedCompanies.length > 0);
      setScrapePreviewOnly(false);

      toast({
        title: t("partnerSearch.toasts.scrapeCompleteTitle"),
        description: t("partnerSearch.toasts.scrapeCompleteDescription", {
          count: result?.storedCount ?? result?.count ?? 0,
        }),
      });

      if (searchQuery.trim()) {
        await searchCompanies();
      }
    } catch (error: any) {
      console.error('Scrape confirm error:', error);
      if (error?.message === 'Authentication required') {
        toast({
          title: t("partnerSearch.toasts.scrapeLoginRequiredTitle"),
          description: t("partnerSearch.toasts.scrapeLoginRequiredDescription"),
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t("partnerSearch.toasts.scrapeErrorTitle"),
        description: t("partnerSearch.toasts.scrapeErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setConfirmingScrape(false);
    }
  };

  const getDataSourceLabel = (source: string) => {
    const label = t(`partnerSearch.dataSources.${source}`);
    return label && !label.startsWith("partnerSearch.dataSources.") ? label : source;
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

    const industry = company.industry?.[0] || t("partnerSearch.companyFallback");
    const location = company.location_city || company.location_country || '';
    return `${industry}${location ? ' - ' + location : ''}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <PageShell className="container mx-auto px-4 py-8 flex-1 min-h-[calc(100vh+8rem)]">
        <section className="rounded-3xl border border-border bg-hero-surface px-6 py-10 md:px-10 md:py-14 mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs text-foreground mb-4">
                <CheckCircle className="h-4 w-4 text-primary" />
                {t("partnerSearch.heroBadge")}
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
                {t("partnerSearch.title")}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                {t("partnerSearch.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                <div className="text-xs">{t("partnerSearch.selectedSourcesLabel")}</div>
                <div className="text-lg font-semibold text-foreground">{selectedDataSources.length} {t("partnerSearch.countUnit")}</div>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                <div className="text-xs">{t("partnerSearch.totalResultsLabel")}</div>
                <div className="text-lg font-semibold text-foreground">{totalCount.toLocaleString()} {t("partnerSearch.countUnit")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <Card className="mb-6 bg-card/80 border-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:flex-[3] relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder={t("partnerSearch.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCompanies()}
                  className="w-full pl-10"
                  aria-label={t("partnerSearch.searchPlaceholder")}
                />
              </div>
              <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:flex-[2] lg:justify-end" role="group" aria-label={t("partnerSearch.searchActions")}>
                <Button onClick={() => searchCompanies(0, true)} disabled={loading} className="w-full sm:w-auto" aria-label={t("partnerSearch.search")}>
                  <Search className="w-4 h-4 mr-2" aria-hidden="true" />
                  {isSearching ? t("partnerSearch.searching") : t("partnerSearch.search")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFilters(prev => !prev);
                    setShowDataSourceSelector(false);
                  }}
                  className="w-full sm:w-auto relative"
                  aria-expanded={showFilters}
                  aria-label={t("partnerSearch.filters")}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t("partnerSearch.filters")}
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDataSourceSelector(prev => !prev);
                    setShowFilters(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t("partnerSearch.dataSourcesLabel", { count: selectedDataSources.length })}
                </Button>
                <Dialog open={showScrapeDialog} onOpenChange={setShowScrapeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("partnerSearch.addCompanies")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("partnerSearch.scrapeTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder={t("partnerSearch.scrapePlaceholder")}
                        value={websiteUrls}
                        onChange={(e) => setWebsiteUrls(e.target.value)}
                        rows={6}
                        aria-describedby="scrape-description"
                      />
                      <p id="scrape-description" className="text-sm text-muted-foreground">
                        {t("partnerSearch.scrapeDescription")}
                      </p>
                      <label className="flex items-start gap-3 rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-muted-foreground">
                        <Checkbox
                          checked={useLlm}
                          onCheckedChange={(checked) => setUseLlm(Boolean(checked))}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="font-medium text-foreground">
                            {t("partnerSearch.scrapeUseAiLabel")}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {t("partnerSearch.scrapeUseAiHint")}
                          </span>
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <Button 
                          onClick={scrapeWebsites} 
                          disabled={loading}
                          className="flex-1"
                        >
                          {loading ? t("partnerSearch.scraping") : t("partnerSearch.scrapeAction")}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowScrapeDialog(false)}
                        >
                          {t("partnerSearch.cancel")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Selector */}
        {showDataSourceSelector && (
          <Card className="mt-4 bg-card/80 border-border">
            <CardContent className="p-6">
              <DataSourceSelector
                selectedSources={selectedDataSources}
                onSourcesChange={setSelectedDataSources}
                locale={localePrefix as "ja" | "en" | "th"}
              />
            </CardContent>
          </Card>
        )}

        <Dialog open={showScrapeResults} onOpenChange={setShowScrapeResults}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t("partnerSearch.scrapeResultsTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {scrapePreviewOnly
                    ? t("partnerSearch.scrapeResultsPreview")
                    : t("partnerSearch.scrapeResultsAdded")}
                </Badge>
                <span>
                  {scrapePreviewOnly
                    ? t("partnerSearch.scrapeResultsSubtitlePreview", { count: scrapeResults.length })
                    : t("partnerSearch.scrapeResultsSubtitle", { count: scrapeResults.length })}
                </span>
              </div>
              {scrapeResults.length > 0 ? (
                <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-card/80 p-4 space-y-4">
                  {scrapeResults.map((company) => {
                    const location = [company.location_city, company.location_country]
                      .filter(Boolean)
                      .join(", ");
                    return (
                      <div key={company.id || company.website_url} className="rounded-2xl border border-border bg-background/90 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-foreground">
                              {company.name || company.website_url || t("partnerSearch.fields.noValue")}
                            </p>
                            {company.website_url && (
                              <a
                                href={company.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary"
                              >
                                {company.website_url.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {scrapePreviewOnly
                              ? t("partnerSearch.scrapeResultsPreview")
                              : t("partnerSearch.scrapeResultsAdded")}
                          </Badge>
                        </div>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {t("partnerSearch.fields.description")}
                            </p>
                            <p className="text-sm text-foreground/90 line-clamp-3">
                              {company.description || t("partnerSearch.fields.noValue")}
                            </p>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {t("partnerSearch.fields.location")}
                              </p>
                              <p className="text-foreground/90">{location || t("partnerSearch.fields.noValue")}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                {t("partnerSearch.fields.companySize")}
                              </p>
                              <p className="text-foreground/90">{company.company_size || t("partnerSearch.fields.noValue")}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {t("partnerSearch.fields.industry")}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {company.industry?.length ? (
                                company.industry.map((item, index) => (
                                  <Badge key={`${item}-${index}`} variant="outline" className="text-[11px]">
                                    {item}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">{t("partnerSearch.fields.noValue")}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {t("partnerSearch.fields.specialties")}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {company.specialties?.length ? (
                                company.specialties.map((item, index) => (
                                  <Badge key={`${item}-${index}`} variant="secondary" className="text-[11px]">
                                    {item}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">{t("partnerSearch.fields.noValue")}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {t("partnerSearch.fields.contactEmail")}
                            </p>
                            <p className="text-foreground/90">{company.contact_email || t("partnerSearch.fields.noValue")}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">
                              {t("partnerSearch.fields.phone")}
                            </p>
                            <p className="text-foreground/90">{company.phone || t("partnerSearch.fields.noValue")}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  {t("partnerSearch.scrapeResultsEmpty")}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {t("partnerSearch.scrapeConfirmNote")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => confirmScrape(true)}
                    disabled={confirmingScrape}
                  >
                    {confirmingScrape ? t("partnerSearch.scraping") : t("partnerSearch.scrapeReplaceAction")}
                  </Button>
                  <Button
                    onClick={() => confirmScrape(false)}
                    disabled={confirmingScrape}
                  >
                    {confirmingScrape ? t("partnerSearch.scraping") : t("partnerSearch.scrapeConfirmAction")}
                  </Button>
                  <Button variant="outline" onClick={() => setShowScrapeResults(false)}>
                    {t("partnerSearch.close")}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6 bg-card/80 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t("partnerSearch.advancedFiltersTitle")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("partnerSearch.advancedFiltersDescription")}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("partnerSearch.industryLabel")}</label>
                  <Select 
                    value={filters.industry || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("partnerSearch.industryPlaceholder")} />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("partnerSearch.industryAll")}</SelectItem>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>

                {/* Region Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("partnerSearch.locationLabel")}</label>
                    <Select
                    value={filters.location || "all-regions"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("partnerSearch.locationPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-regions">{t("partnerSearch.locationAll")}</SelectItem>
                      <SelectItem value="Asia">{t("partnerSearch.locations.asia")}</SelectItem>
                      <SelectItem value="Japan">{t("partnerSearch.locations.japan")}</SelectItem>
                      <SelectItem value="China">{t("partnerSearch.locations.china")}</SelectItem>
                      <SelectItem value="Thailand">{t("partnerSearch.locations.thailand")}</SelectItem>
                      <SelectItem value="Europe">{t("partnerSearch.locations.europe")}</SelectItem>
                      <SelectItem value="USA">{t("partnerSearch.locations.usa")}</SelectItem>
                      <SelectItem value="North America">{t("partnerSearch.locations.northAmerica")}</SelectItem>
                      <SelectItem value="South America">{t("partnerSearch.locations.southAmerica")}</SelectItem>
                      <SelectItem value="Africa">{t("partnerSearch.locations.africa")}</SelectItem>
                      <SelectItem value="Oceania">{t("partnerSearch.locations.oceania")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">{t("partnerSearch.companySizeLabel")}</label>
                    <Select 
                      value={filters.companySize || "all"} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("partnerSearch.companySizePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("partnerSearch.companySizeAll")}</SelectItem>
                        {companySizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                {/* Filter Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => searchCompanies(0, true)} 
                    className="flex-1"
                    disabled={loading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {t("partnerSearch.applyFilters")}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setFilters({ 
                        industry: 'all', 
                        location: 'all-regions', 
                        companySize: 'all',
                      });
                      setSearchQuery('');
                      setPage(0);
                      setTotalPages(1);
                      setGoogleNextPageTokens({});
                    }}
                  >
                    {t("partnerSearch.reset")}
                  </Button>
                </div>
                
                {/* Helpful Tips */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">{t("partnerSearch.tipsTitle")}</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>{t("partnerSearch.tips.0")}</li>
                    <li>{t("partnerSearch.tips.1")}</li>
                    <li>{t("partnerSearch.tips.2")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {totalCount > 0 && (
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <span>{t("partnerSearch.resultsSummary", { shown: companies.length, total: totalCount })}</span>
            <div className="inline-flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {t("partnerSearch.pageLabel", { current: page + 1, total: totalPages })}
              </Badge>
              {selectedDataSources.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {t("partnerSearch.sourcesLabel", { count: selectedDataSources.length })}
                </Badge>
              )}
            </div>
          </div>
        )}

        {companies.length === 0 && !loading && searchQuery && (
          <Card className="bg-card/80 border-border">
            <CardContent className="p-10 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-base mb-2">
                {t("partnerSearch.noResultsDefault")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("partnerSearch.noResultsTipChangeQuery")}
              </p>
            </CardContent>
          </Card>
        )}

        {companies.length === 0 && !loading && !searchQuery && (
          <Card className="bg-card/80 border-border">
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground">
                {t("partnerSearch.emptyState")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading && companies.length === 0 && (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-border bg-card/80 h-full flex flex-col">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-2/3" />
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-4" />
                    <div className="space-y-3">
                      <div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <div className="flex gap-1.5">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto pt-4">
                      <Skeleton className="h-9 flex-1 rounded-md" />
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
          {companies.map((company) => (
            <Card key={company.id} className="border-border bg-card/80 hover:shadow-soft transition-all duration-300 h-full flex flex-col">
              <CardHeader className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Building className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <span className="truncate">{getDisplayName(company)}</span>
                      {company.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                          <CheckCircle className="h-3 w-3" />
                          {t("partnerSearch.verifiedBadge")}
                        </span>
                      )}
                    </CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.location_city && `${company.location_city}, `}{company.location_country}
                      </span>
                      {company.company_size && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {companySizes.find(s => s.value === company.company_size)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {company.website_url && (
                  <a 
                    href={company.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{company.website_url.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                    {company.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("partnerSearch.industryLabel")}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {company.industry?.slice(0, 3).map((ind, index) => (
                          <Badge key={index} variant="secondary" className="text-[11px] px-2 py-0.5">
                            {ind}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                          {getDataSourceLabel(company.data_source)}
                        </Badge>
                      </div>
                    </div>

                    {(company.specialties?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("partnerSearch.specialtiesLabel")}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {company.specialties.slice(0, 3).map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-[11px] px-2 py-0.5">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Contact Information - Show based on access control */}
                    {(company.contact_email || company.phone) && !company._contact_restricted && (
                      <div className="space-y-2 pt-3 border-t border-muted/50">
                        <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">{t("partnerSearch.contactLabel")}</h4>
                        {company.contact_email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <a href={`mailto:${company.contact_email}`} className="hover:text-primary">
                              {company.contact_email}
                            </a>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
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
                            window.location.href = `/${localePrefix}#pricing`;
                          }
                        }}
                        onMakeInquiry={() => openInquiryDialog(company)}
                      />
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4">
                  <Button
                    variant={company.verified ? "cta" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePrimaryAction(company)}
                  >
                    {company.verified ? t("partnerSearch.chatAction") : t("partnerSearch.contactAction")}
                  </Button>
                  {company.website_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="sm:w-auto"
                      asChild
                    >
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        {t("partnerSearch.websiteAction")}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={loading || page === 0}
              >
                {t("partnerSearch.prev")}
              </Button>
              {getPageItems(page, totalPages).map((pageIndex, index, items) => {
                const prevPage = index > 0 ? items[index - 1] : null;
                const showEllipsis = prevPage !== null && pageIndex - prevPage > 1;
                return (
                  <div key={`page-${pageIndex}`} className="flex items-center gap-2">
                    {showEllipsis && <span className="px-1 text-muted-foreground">…</span>}
                    <Button
                      variant={page === pageIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageIndex)}
                      disabled={loading}
                    >
                      {pageIndex + 1}
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                disabled={loading || page >= totalPages - 1}
              >
                {t("partnerSearch.next")}
              </Button>
            </div>
          </div>
        )}
      </PageShell>

      {/* Partnership Inquiry Dialog */}
      <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {t("partnerSearch.inquiryTitle", { company: selectedCompany ? getDisplayName(selectedCompany) : "" })}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t("partnerSearch.inquirySubtitle")}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("partnerSearch.inquiryCompanyInfoTitle")}</h4>
              <div className="space-y-1 text-sm">
                <p><strong>{t("partnerSearch.inquiryCompanyLabel")}</strong> {selectedCompany ? getDisplayName(selectedCompany) : ''}</p>
                <p><strong>{t("partnerSearch.inquiryIndustryLabel")}</strong> {selectedCompany?.industry.join(', ')}</p>
                <p><strong>{t("partnerSearch.inquiryLocationLabel")}</strong> {selectedCompany?.location_city && `${selectedCompany.location_city}, `}{selectedCompany?.location_country}</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="inquiry-message" className="text-sm font-medium mb-2 block">
                {t("partnerSearch.inquiryMessageLabel")}
              </label>
              <Textarea
                id="inquiry-message"
                placeholder={t("partnerSearch.inquiryPlaceholder")}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={12}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("partnerSearch.inquiryNote")}
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleInquiry}
                disabled={!inquiryMessage.trim()}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t("partnerSearch.sendInquiry")}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowInquiryDialog(false)}
              >
                {t("partnerSearch.cancel")}
              </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>{t("partnerSearch.inquiryFooterTitle")}</strong> {t("partnerSearch.inquiryFooterNote")}
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
