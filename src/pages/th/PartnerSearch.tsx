import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, MapPin, Building, Globe, CheckCircle, Plus, ExternalLink, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/th/Navigation";
import Footer from "@/components/th/Footer";
import { CompanySearchService, CompanySearchFilters } from "@/utils/CompanySearchService";
import { DataSourceSelector } from "@/components/DataSourceSelector";

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
}

const PartnerSearch = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CompanySearchFilters>({
    industry: 'all',
    location: 'all-regions',
    companySize: 'all'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [websiteUrls, setWebsiteUrls] = useState('');
  const [showScrapeDialog, setShowScrapeDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(['google_places', 'opencorporates']);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const companySizes = [
    { value: "micro", label: "ไมโคร (1-9 พนักงาน)" },
    { value: "small", label: "เล็ก (10-49 พนักงาน)" },
    { value: "medium", label: "กลาง (50-249 พนักงาน)" },
    { value: "large", label: "ใหญ่ (250+ พนักงาน)" }
  ];

  const searchCompanies = async () => {
    setIsSearching(true);
    setLoading(true);
    try {
      const searchFilters = {
        industry: filters.industry && filters.industry !== 'all' ? filters.industry : undefined,
        location: filters.location && filters.location !== 'all-regions' ? filters.location : undefined,
        companySize: filters.companySize && filters.companySize !== 'all' ? filters.companySize : undefined,
        dataSources: selectedDataSources
      };
      
      const results = await CompanySearchService.searchCompanies(searchQuery || "", searchFilters);

      setCompanies(results.companies);
      setTotalCount(results.count);
      toast({
        title: "ค้นหาเสร็จสิ้น",
        description: `พบ ${results.companies.length} บริษัทจาก ${selectedDataSources.length} แหล่งข้อมูล`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "ข้อผิดพลาดในการค้นหา",
        description: "เกิดข้อผิดพลาดขณะค้นหา",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
      setShowFilters(false);
      setShowDataSourceSelector(false);
    }
  };

  const getDisplayName = (company: Company) => {
    const raw = company.name?.trim() || '';
    const genericWords = ['group','company','co','co., ltd','co ltd','ltd','inc','llc','services','solutions','corp','corporation','holdings','partners'];
    const isGeneric = !raw || raw.length < 3 || genericWords.includes(raw.toLowerCase());

    if (!isGeneric) return raw;

    if (company.website_url) {
      try {
        const u = new URL(company.website_url);
        const host = u.hostname.replace(/^www\./, '');
        let label = host.split('.')[0]?.replace(/[-_]/g, ' ') || '';
        label = label.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
        if (label && !genericWords.includes(label.toLowerCase())) return label;
      } catch {}
    }

    const industry = company.industry?.[0] || 'บริษัท';
    const location = company.location_city || company.location_country || '';
    return `${industry}${location ? ' - ' + location : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            ค้นหาพันธมิตร
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ค้นหาพันธมิตรธุรกิจที่เชื่อถือได้ทั่วโลกและสร้างโอกาสใหม่ในการเติบโต
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="w-full lg:flex-[3]">
            <Input
              placeholder="ค้นหาตามชื่อบริษัท อุตสาหกรรม บริการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCompanies()}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:flex-[2] lg:justify-end">
            <Button onClick={searchCompanies} disabled={loading} className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรอง
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDataSourceSelector(!showDataSourceSelector)}
              className="w-full sm:w-auto"
            >
              <Globe className="w-4 h-4 mr-2" />
              แหล่งข้อมูล ({selectedDataSources.length})
            </Button>
            <Dialog open={showScrapeDialog} onOpenChange={setShowScrapeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มบริษัท
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>ดึงข้อมูลบริษัทจากเว็บไซต์</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="กรอก URL เว็บไซต์ (หนึ่งรายการต่อบรรทัด)"
                    value={websiteUrls}
                    onChange={(e) => setWebsiteUrls(e.target.value)}
                    rows={6}
                  />
                  <Button onClick={scrapeWebsites} disabled={loading}>
                    ดึงข้อมูล
                  </Button>
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
              locale="th"
            />
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                ตัวกรองขั้นสูง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">หมวดหมู่อุตสาหกรรม</label>
                  <Select 
                    value={filters.industry || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกอุตสาหกรรม" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">อุตสาหกรรมทั้งหมด</SelectItem>
                      <SelectItem value="medical">🏥 การแพทย์และสุขภาพ</SelectItem>
                      <SelectItem value="manufacturing">🏭 การผลิต</SelectItem>
                      <SelectItem value="technology">💻 เทคโนโลยี</SelectItem>
                      <SelectItem value="logistics">🚛 โลจิสติกส์และขนส่ง</SelectItem>
                      <SelectItem value="trade">📦 การค้าและนำเข้า/ส่งออก</SelectItem>
                      <SelectItem value="finance">💰 การเงินและฟินเทค</SelectItem>
                      <SelectItem value="fashion">👗 แฟชั่นและเครื่องแต่งกาย</SelectItem>
                      <SelectItem value="automotive">🚗 ยานยนต์</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ภูมิภาค</label>
                  <Select 
                    value={filters.location || "all-regions"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกภูมิภาค" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-regions">ทุกภูมิภาค</SelectItem>
                      <SelectItem value="asia">🌏 เอเชีย</SelectItem>
                      <SelectItem value="japan">🇯🇵 ญี่ปุ่น</SelectItem>
                      <SelectItem value="thailand">🇹🇭 ไทย</SelectItem>
                      <SelectItem value="china">🇨🇳 จีน</SelectItem>
                      <SelectItem value="europe">🇪🇺 ยุโรป</SelectItem>
                      <SelectItem value="usa">🇺🇸 สหรัฐอเมริกา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ขนาดบริษัท</label>
                  <Select 
                    value={filters.companySize || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ขนาดบริษัท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกขนาด</SelectItem>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t mt-4">
                <Button onClick={searchCompanies} disabled={loading}>
                  ใช้ตัวกรอง
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setFilters({ industry: 'all', location: 'all-regions', companySize: 'all' })}
                >
                  ล้างตัวกรอง
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {companies.length > 0 && (
          <div className="mb-4">
            <p className="text-muted-foreground">
              พบ {companies.length} บริษัท {totalCount > companies.length && `(จากทั้งหมด ${totalCount})`}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{getDisplayName(company)}</CardTitle>
                  {company.verified && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {company.location_city}, {company.location_country}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {company.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {company.industry?.slice(0, 3).map((ind, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {ind}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    {company.company_size}
                  </div>
                  {company.website_url && (
                    <a 
                      href={company.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      เว็บไซต์
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              ไม่พบผลลัพธ์ ลองค้นหาด้วยคำค้นหาหรือตัวกรองอื่น
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PartnerSearch;
