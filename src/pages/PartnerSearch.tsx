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
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CompanySearchService, CompanySearchFilters } from "@/utils/CompanySearchService";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { ContactAccessPrompt } from "@/components/ContactAccessPrompt";
import { useUserRole } from "@/hooks/useUserRole";

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
  });
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [websiteUrls, setWebsiteUrls] = useState('');
  const [showScrapeDialog, setShowScrapeDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(['supabase', 'google_places', 'opencorporates']);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
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

  const industries = [
    "製造業", "技術", "物流", "貿易", "金融", "ファッション", "テキスタイル", "自動車", "ソフトウェア"
  ];

  const companySizes = [
    { value: "micro", label: "マイクロ企業 (1-9人)" },
    { value: "small", label: "小企業 (10-49人)" },
    { value: "medium", label: "中企業 (50-249人)" },
    { value: "large", label: "大企業 (250人以上)" }
  ];

  // Add defensive error boundary for the component
  useEffect(() => {
    console.log('PartnerSearch component mounted');
    console.log('Initial filters state:', filters);
    
    // Validate that all filter values are valid
    if (!filters.industry || !filters.location || !filters.companySize) {
      console.warn('Invalid filter state detected, resetting...');
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
      console.log('Starting search with query:', searchQuery);
      console.log('Current filters:', filters);
      
      const searchFilters = {
        industry: filters.industry === "all" ? undefined : filters.industry || undefined,
        location: filters.location === "all-regions" ? undefined : filters.location || undefined,
        companySize: filters.companySize === "all" ? undefined : filters.companySize || undefined,
        dataSources: selectedDataSources,
        externalPageTokens: googleNextPageTokens[nextPage]
          ? { google_places: googleNextPageTokens[nextPage] }
          : undefined,
      };
      
      console.log('Processed filters:', searchFilters);
      
      const results = await CompanySearchService.searchCompanies(
        searchQuery || "", // Allow empty search query
        searchFilters,
        nextPage,
        pageSize
      );

      console.log('Search results:', results.companies);
      console.log('First company:', results.companies[0]);
      console.log('About to set companies. Current filters:', filters);
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
          title: "検索完了",
          description: `全${results.count}件の企業が見つかりました（${selectedDataSources.length}件のデータソース）。`,
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "検索エラー",
        description: "検索中にエラーが発生しました。",
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
        title: "ログインが必要です",
        description: "お問い合わせにはログインが必要です",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCompany(company);
    setInquiryMessage(`${getDisplayName(company)}様

お世話になっております。

貴社のサービス・事業内容について興味を持ち、パートナーシップの可能性について相談させていただきたくご連絡いたします。

具体的には以下についてお聞かせいただけますでしょうか：
・パートナーシップの形態や条件
・協業における具体的なメリット
・今後のビジネス展開について

ご検討のほど、よろしくお願いいたします。`);
    setShowInquiryDialog(true);
  };

  const handleInquiry = async () => {
    if (!selectedCompany || !inquiryMessage.trim()) {
      toast({
        title: "エラー",
        description: "メッセージを入力してください",
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
        title: "お問い合わせ送信完了",
        description: "パートナー企業にお問い合わせを送信しました",
      });
      
      setShowInquiryDialog(false);
      setSelectedCompany(null);
      setInquiryMessage("");
    } catch (error: any) {
      console.error('Inquiry error:', error);
      toast({
        title: "送信エラー",
        description: error.message || "お問い合わせの送信中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  const scrapeWebsites = async () => {
    if (!websiteUrls.trim()) {
      toast({
        title: "エラー",
        description: "WebサイトのURLを入力してください。",
        variant: "destructive",
      });
      return;
    }

    const urls = websiteUrls.split('\n').map(url => url.trim()).filter(Boolean);
    if (urls.length === 0) {
      toast({
        title: "エラー",
        description: "有効なURLを入力してください。",
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
        title: "スクレイピング完了",
        description: `${result?.count || 0}件の企業データを取得しました。`,
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
        title: "スクレイピングエラー",
        description: "Webサイトからのデータ取得中にエラーが発生しました。",
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
      'web_scraping': 'Webスクレイピング',
      'sample': 'サンプル',
      'manual': '手動'
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

    // Fallback: Industry + Location (JA)
    const industry = company.industry?.[0] || '企業';
    const location = company.location_city || company.location_country || '';
    return `${industry}${location ? ' - ' + location : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            パートナー検索
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            世界中の信頼できるビジネスパートナーを見つけて、新たな機会を創出しましょう
          </p>
        </div>


        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="w-full lg:flex-[3]">
            <Input
              placeholder="企業名、業界、サービス等で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCompanies()}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:flex-[2] lg:justify-end">
            <Button onClick={() => searchCompanies(0, true)} disabled={loading} className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "検索中..." : "検索"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowFilters(prev => !prev);
                setShowDataSourceSelector(false);
              }}
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              フィルター
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
              データソース ({selectedDataSources.length})
            </Button>
            <Dialog open={showScrapeDialog} onOpenChange={setShowScrapeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  企業追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Webサイトから企業データを取得</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="WebサイトのURLを入力してください（1行に1つ）&#10;例：&#10;https://example.com&#10;https://company2.com"
                    value={websiteUrls}
                    onChange={(e) => setWebsiteUrls(e.target.value)}
                    rows={6}
                    aria-describedby="scrape-description"
                  />
                  <p id="scrape-description" className="text-sm text-muted-foreground">
                    入力されたWebサイトから企業情報を自動的に抽出します。
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={scrapeWebsites} 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "取得中..." : "データ取得"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowScrapeDialog(false)}
                    >
                      キャンセル
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
              locale="ja"
            />
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                詳細フィルター
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                業界やエリアを選択して検索結果を絞り込めます
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">業界カテゴリー</label>
                  <Select 
                    value={filters.industry || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="業界を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全ての業界</SelectItem>
                      <SelectItem value="医療">🏥 医療・ヘルスケア</SelectItem>
                      <SelectItem value="製造業">🏭 製造業</SelectItem>
                      <SelectItem value="技術">💻 テクノロジー</SelectItem>
                      <SelectItem value="物流">🚛 物流・運輸</SelectItem>
                      <SelectItem value="貿易">📦 貿易・輸出入</SelectItem>
                      <SelectItem value="金融">💰 金融・フィンテック</SelectItem>
                      <SelectItem value="ファッション">👗 ファッション</SelectItem>
                      <SelectItem value="自動車">🚗 自動車</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Region Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">地域・エリア</label>
                    <Select
                    value={filters.location || "all-regions"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="地域を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-regions">全ての地域</SelectItem>
                      <SelectItem value="アジア">🌏 アジア</SelectItem>
                      <SelectItem value="日本">🇯🇵 日本</SelectItem>
                      <SelectItem value="中国">🇨🇳 中国</SelectItem>
                      <SelectItem value="タイ">🇹🇭 タイ</SelectItem>
                      <SelectItem value="ヨーロッパ">🇪🇺 ヨーロッパ</SelectItem>
                      <SelectItem value="アメリカ">🇺🇸 アメリカ</SelectItem>
                      <SelectItem value="北米">🌎 北米</SelectItem>
                      <SelectItem value="南米">🌎 南米</SelectItem>
                      <SelectItem value="アフリカ">🌍 アフリカ</SelectItem>
                      <SelectItem value="オセアニア">🇦🇺 オセアニア</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">企業規模</label>
                    <Select 
                      value={filters.companySize || "all"} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="企業規模" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全ての規模</SelectItem>
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
                    フィルター適用
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
                    リセット
                  </Button>
                </div>
                
                {/* Helpful Tips */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">💡 検索のヒント</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 複数の条件を組み合わせて検索できます</li>
                    <li>• 検索バーに「製造業 アジア」などと入力しても検索できます</li>
                    <li>• 企業が見つからない場合は「企業追加」をお試しください</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {totalCount > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            {companies.length}件の企業を表示中（全{totalCount}件）
          </div>
        )}

        {companies.length === 0 && !loading && searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {(() => {
                const detectedCategory = searchQuery.includes('医療') ? '医療業界' :
                  searchQuery.includes('製造業') ? '製造業' :
                  searchQuery.includes('技術') ? '技術業界' :
                  searchQuery.includes('物流') ? '物流業界' :
                  searchQuery.includes('貿易') ? '貿易業界' :
                  searchQuery.includes('金融') ? '金融業界' :
                  searchQuery.includes('ファッション') ? 'ファッション業界' :
                  searchQuery.includes('自動車') ? '自動車業界' : '';
                
                return detectedCategory 
                  ? `${detectedCategory}の企業が見つかりませんでした。`
                  : '検索条件に一致する企業が見つかりませんでした。';
              })()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {(() => {
                const hasCategory = searchQuery.includes('医療') || searchQuery.includes('製造業') || 
                  searchQuery.includes('技術') || searchQuery.includes('物流') || 
                  searchQuery.includes('貿易') || searchQuery.includes('金融') || 
                  searchQuery.includes('ファッション') || searchQuery.includes('自動車');
                
                return hasCategory
                  ? '「企業追加」ボタンから関連企業のWebサイトを追加してください。'
                  : '検索キーワードを変更するか、外部データソースから新しい企業を追加してみてください。';
              })()}
            </p>
          </div>
        )}

        {companies.length === 0 && !loading && !searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              検索キーワードを入力して、パートナー企業を探してみましょう。
            </p>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-glow transition-all duration-300 h-full flex flex-col">
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
              
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {company.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">業界</h4>
                      <div className="flex flex-wrap gap-1">
                        {company.industry.slice(0, 3).map((ind, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ind}
                          </Badge>
                        ))}
                        {company.verified && (
                          <Badge variant="default" className="text-xs">
                            認証済み
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {getDataSourceLabel(company.data_source)}
                        </Badge>
                      </div>
                    </div>
                    
                    {company.specialties.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">専門分野</h4>
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
                        <h4 className="font-semibold text-sm">連絡先</h4>
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
                          window.location.href = '/ja#pricing';
                        }
                      }}
                      onMakeInquiry={() => openInquiryDialog(company)}
                    />
                  )}
                </div>
                
                <div className="flex gap-2 mt-auto pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openInquiryDialog(company)}
                  >
                    お問い合わせ
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

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={loading || page === 0}
              >
                前へ
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
                次へ
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Partnership Inquiry Dialog */}
      <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedCompany ? getDisplayName(selectedCompany) : ''} へのパートナーシップ問い合わせ
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              以下のメッセージが企業の連絡先に送信されます。内容を確認・編集してから送信してください。
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">送信先企業情報</h4>
              <div className="space-y-1 text-sm">
                <p><strong>企業名:</strong> {selectedCompany ? getDisplayName(selectedCompany) : ''}</p>
                <p><strong>業界:</strong> {selectedCompany?.industry.join(', ')}</p>
                <p><strong>所在地:</strong> {selectedCompany?.location_city && `${selectedCompany.location_city}, `}{selectedCompany?.location_country}</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="inquiry-message" className="text-sm font-medium mb-2 block">
                パートナーシップ問い合わせメッセージ
              </label>
              <Textarea
                id="inquiry-message"
                placeholder="パートナーシップについてのメッセージを入力してください..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={12}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                このメッセージと共に、あなたの連絡先情報（名前、メールアドレス、会社名など）も送信されます。
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleInquiry}
                disabled={!inquiryMessage.trim()}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                問い合わせを送信
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowInquiryDialog(false)}
              >
                キャンセル
              </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>📧 送信について:</strong> このメッセージは企業の登録メールアドレスに直接送信され、
                企業からの返信はあなたのメールアドレスに届きます。
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
