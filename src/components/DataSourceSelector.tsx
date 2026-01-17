import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { CompanySearchService, DataSourceConfig } from '@/utils/CompanySearchService';
import { useToast } from '@/hooks/use-toast';

interface DataSourceSelectorProps {
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
  locale?: 'ja' | 'en' | 'th';
}

export function DataSourceSelector({ selectedSources, onSourcesChange, locale = 'en' }: DataSourceSelectorProps) {
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: boolean | null }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const sources = await CompanySearchService.getAvailableDataSources();
      setDataSources(sources);
      
      // Initialize connection status
      const status: { [key: string]: boolean | null } = {};
      sources.forEach(source => {
        status[source.name] = null;
      });
      setConnectionStatus(status);
    } catch (error) {
      console.error('Error loading data sources:', error);
      toast({
        title: locale === 'ja' ? "エラー" : locale === 'th' ? "ข้อผิดพลาด" : "Error",
        description: locale === 'ja'
          ? "利用可能なデータソースの読み込みに失敗しました"
          : locale === 'th'
            ? "ไม่สามารถโหลดแหล่งข้อมูลได้"
            : "Failed to load available data sources",
        variant: "destructive",
      });
    }
  };

  const toggleSource = (sourceName: string) => {
    const newSources = selectedSources.includes(sourceName)
      ? selectedSources.filter(s => s !== sourceName)
      : [...selectedSources, sourceName];
    
    onSourcesChange(newSources);
  };

  const testConnection = async (sourceName: string) => {
    if (sourceName === 'supabase') return; // Skip testing local database
    
    setTesting(prev => ({ ...prev, [sourceName]: true }));
    
    try {
      const isConnected = await CompanySearchService.testDataSourceConnection(sourceName);
      setConnectionStatus(prev => ({ ...prev, [sourceName]: isConnected }));
      
      toast({
        title: isConnected
          ? locale === 'ja' ? "接続に成功しました" : locale === 'th' ? "เชื่อมต่อสำเร็จ" : "Connection Successful"
          : locale === 'ja' ? "接続に失敗しました" : locale === 'th' ? "การเชื่อมต่อล้มเหลว" : "Connection Failed",
        description: locale === 'ja'
          ? `${sourceName} は${isConnected ? '利用可能です' : '利用できません'}`
          : locale === 'th'
            ? `${sourceName} ${isConnected ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}`
            : `${sourceName} ${isConnected ? 'is available' : 'is not available'}`,
        variant: isConnected ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Error testing ${sourceName}:`, error);
      setConnectionStatus(prev => ({ ...prev, [sourceName]: false }));
      toast({
        title: locale === 'ja' ? "接続エラー" : locale === 'th' ? "ข้อผิดพลาดในการเชื่อมต่อ" : "Connection Error",
        description: locale === 'ja'
          ? `${sourceName} の接続テストに失敗しました`
          : locale === 'th'
            ? `ไม่สามารถทดสอบการเชื่อมต่อ ${sourceName}`
            : `Failed to test ${sourceName} connection`,
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, [sourceName]: false }));
    }
  };

  const getLocalizedName = (sourceName: string, locale: 'ja' | 'en' | 'th') => {
    const names = {
      supabase: { ja: 'Supabase', en: 'Supabase', th: 'Supabase' },
      google_places: { ja: 'Googleプレイス', en: 'Google Places', th: 'Google Places' },
      opencorporates: { ja: 'OpenCorporates', en: 'OpenCorporates', th: 'OpenCorporates' },
      crunchbase: { ja: 'Crunchbase', en: 'Crunchbase', th: 'Crunchbase' },
      yellow_pages: { ja: 'イエローページ', en: 'Yellow Pages', th: 'Yellow Pages' },
      companies_house: { ja: 'Companies House', en: 'Companies House', th: 'Companies House' },
    };
    return names[sourceName]?.[locale] || sourceName.replace('_', ' ');
  };

  const getSourceDescription = (sourceName: string, locale: 'ja' | 'en' | 'th'): string => {
    const descriptions: Record<string, { ja: string; en: string; th: string }> = {
      supabase: {
        ja: '検証済み企業記録を持つローカルデータベース',
        en: 'Local database with verified company records',
        th: 'ฐานข้อมูลท้องถิ่นพร้อมข้อมูลบริษัทที่ผ่านการตรวจสอบ',
      },
      google_places: {
        ja: '評価とレビュー付きビジネス情報 (Google Places API)',
        en: 'Google Places API for business listings with ratings and reviews',
        th: 'Google Places API สำหรับข้อมูลธุรกิจพร้อมคะแนนและรีวิว',
      },
      opencorporates: {
        ja: '企業登記と法人情報 (OpenCorporates)',
        en: 'Global company registry with corporate filings',
        th: 'ทะเบียนบริษัททั่วโลกพร้อมเอกสารจดทะเบียน',
      },
      crunchbase: {
        ja: 'スタートアップと投資情報データベース (Crunchbase)',
        en: 'Startup and investment database with funding information',
        th: 'ฐานข้อมูลสตาร์ทอัพและการลงทุนพร้อมข้อมูลทุน',
      },
      yellow_pages: {
        ja: '連絡先付きローカル企業ディレクトリ (Yellow Pages)',
        en: 'Local business directory with contact information',
        th: 'ไดเรกทอรีธุรกิจท้องถิ่นพร้อมข้อมูลติดต่อ',
      },
      companies_house: {
        ja: '英国公式企業登記情報 (Companies House)',
        en: 'UK official company registry with legal information',
        th: 'ทะเบียนบริษัททางการของสหราชอาณาจักร',
      },
    };
    
    return descriptions[sourceName]?.[locale] || (locale === 'ja'
      ? '外部データソース'
      : locale === 'th'
        ? 'แหล่งข้อมูลภายนอก'
        : 'External data source');
  };

  const getConnectionIcon = (sourceName: string) => {
    const status = connectionStatus[sourceName];
    const isTestingSource = testing[sourceName];
    
    if (isTestingSource) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    
    if (status === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (status === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {locale === 'ja'
            ? "データソース設定"
            : locale === 'th'
              ? "การตั้งค่าแหล่งข้อมูล"
              : "Data Sources Configuration"}
        </CardTitle>
        <CardDescription>
          {locale === 'ja'
            ? "企業データを取得するデータベースやAPIを選択してください"
            : locale === 'th'
              ? "เลือกฐานข้อมูลและ API สำหรับค้นหาข้อมูลบริษัท"
              : "Select which databases and APIs to search for company data"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dataSources.map((source) => (
          <div key={source.name} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Switch
                checked={selectedSources.includes(source.name)}
                onCheckedChange={() => toggleSource(source.name)}
                disabled={!source.enabled}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium capitalize">
                    {getLocalizedName(source.name, locale)}
                  </h4>
                  <Badge variant="outline">
                    {locale === 'ja'
                      ? `優先度 ${source.priority}`
                      : locale === 'th'
                        ? `ลำดับ ${source.priority}`
                        : `Priority ${source.priority}`}
                  </Badge>
                  {getConnectionIcon(source.name)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getSourceDescription(source.name, locale)}
                </p>
              </div>
            </div>
            {source.name !== 'supabase' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection(source.name)}
                disabled={testing[source.name]}
              >
                {testing[source.name] ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {locale === 'ja' ? "テスト中" : locale === 'th' ? "กำลังทดสอบ" : "Testing"}
                  </>
                ) : (
                  (locale === 'ja' ? 'テスト' : locale === 'th' ? 'ทดสอบ' : 'Test')
                )}
              </Button>
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {locale === 'ja'
              ? `選択中: ${selectedSources.length} / ${dataSources.length}`
              : locale === 'th'
                ? `แหล่งข้อมูลที่เลือก: ${selectedSources.length} / ${dataSources.length}`
                : `Selected sources: ${selectedSources.length} / ${dataSources.length}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === 'ja'
              ? "複数のソースを優先順位で検索し、幅広い結果を提供します。"
              : locale === 'th'
                ? "แหล่งข้อมูลหลายแหล่งจะค้นหาในลำดับความสำคัญเพื่อให้ผลลัพธ์ที่ครอบคลุม"
                : "Multiple sources will be searched in priority order to provide comprehensive results."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
