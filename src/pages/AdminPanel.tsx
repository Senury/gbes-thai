import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, Package, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string;
  created_at: string;
}

export default function AdminPanel() {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const dateLocale = localePrefix === "ja" ? "ja-JP" : localePrefix === "th" ? "th-TH" : "en-US";
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRegistrations: 0,
    tokenACount: 0,
    tokenBCount: 0,
    premiumCount: 0,
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch all registrations
        const { data: registrationsData, error: regError } = await (supabase as any)
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (regError) {
          console.error('Error fetching registrations:', regError);
          toast({
            variant: "destructive",
            title: t("admin.toasts.errorTitle"),
            description: t("admin.toasts.registrationsError"),
          });
        } else {
          setRegistrations(registrationsData || []);
          
          // Calculate stats
          const tokenACount = registrationsData?.filter(r => r.service === 'token-a').length || 0;
          const tokenBCount = registrationsData?.filter(r => r.service === 'token-b').length || 0;
          const premiumCount = registrationsData?.filter(r => r.service === 'premium').length || 0;
          
          setStats({
            totalUsers: registrationsData?.length || 0,
            totalRegistrations: registrationsData?.length || 0,
            tokenACount,
            tokenBCount,
            premiumCount,
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: t("admin.toasts.errorTitle"),
          description: t("admin.toasts.dataError"),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, toast]);

  const getServiceDetails = (service: string) => {
    const services = {
      'token-a': { name: t("admin.services.tokenA"), price: t("admin.services.tokenAPrice"), color: 'bg-blue-100 text-blue-800' },
      'token-b': { name: t("admin.services.tokenB"), price: t("admin.services.tokenBPrice"), color: 'bg-green-100 text-green-800' },
      'premium': { name: t("admin.services.premium"), price: t("admin.services.premiumPrice"), color: 'bg-purple-100 text-purple-800' }
    };
    return services[service as keyof typeof services] || { name: service, price: t("admin.services.notAvailable"), color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <DashboardLayout language={localePrefix}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">{t("admin.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.subtitle")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.totalUsers")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.tokenA")}</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokenACount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.tokenB")}</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokenBCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.premium")}</CardTitle>
              <Package className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("admin.table.title")}
            </CardTitle>
            <CardDescription>
              {t("admin.table.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.table.headers.name")}</TableHead>
                    <TableHead>{t("admin.table.headers.email")}</TableHead>
                    <TableHead>{t("admin.table.headers.company")}</TableHead>
                    <TableHead>{t("admin.table.headers.service")}</TableHead>
                    <TableHead>{t("admin.table.headers.registered")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.first_name} {registration.last_name}
                      </TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>{registration.company || t("admin.table.notProvided")}</TableCell>
                      <TableCell>
                        <Badge className={getServiceDetails(registration.service).color}>
                          {getServiceDetails(registration.service).name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(registration.created_at).toLocaleDateString(dateLocale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {registrations.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                {t("admin.table.empty")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
