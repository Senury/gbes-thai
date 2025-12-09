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
}

export function DataSourceSelector({ selectedSources, onSourcesChange }: DataSourceSelectorProps) {
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
        title: "Error",
        description: "Failed to load available data sources",
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
        title: isConnected ? "Connection Successful" : "Connection Failed",
        description: `${sourceName} ${isConnected ? 'is available' : 'is not available'}`,
        variant: isConnected ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Error testing ${sourceName}:`, error);
      setConnectionStatus(prev => ({ ...prev, [sourceName]: false }));
      toast({
        title: "Connection Error",
        description: `Failed to test ${sourceName} connection`,
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, [sourceName]: false }));
    }
  };

  const getSourceDescription = (sourceName: string): string => {
    const descriptions: { [key: string]: string } = {
      'supabase': 'Local database with verified company records',
      'google_places': 'Google Places API for business listings with ratings and reviews',
      'opencorporates': 'Global company registry with corporate filings',
      'crunchbase': 'Startup and investment database with funding information',
      'yellow_pages': 'Local business directory with contact information',
      'companies_house': 'UK official company registry with legal information',
    };
    
    return descriptions[sourceName] || 'External data source';
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
        <CardTitle>Data Sources Configuration</CardTitle>
        <CardDescription>
          Select which databases and APIs to search for company data
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
                    {source.name.replace('_', ' ')}
                  </h4>
                  <Badge variant="outline">Priority {source.priority}</Badge>
                  {getConnectionIcon(source.name)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getSourceDescription(source.name)}
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
                    Testing
                  </>
                ) : (
                  'Test'
                )}
              </Button>
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Selected sources: {selectedSources.length} / {dataSources.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Multiple sources will be searched in priority order to provide comprehensive results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}