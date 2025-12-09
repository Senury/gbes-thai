import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, Package } from "lucide-react";

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
        const { data: registrationsData, error: regError } = await (supabase as any)
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (regError) {
          console.error('Error fetching registrations:', regError);
          toast({
            variant: "destructive",
            title: "ข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลการลงทะเบียนได้",
          });
        } else {
          setRegistrations(registrationsData || []);
          
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
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, toast]);

  const getServiceDetails = (service: string) => {
    const services = {
      'token-a': { name: 'Token A', price: '฿350', color: 'bg-blue-100 text-blue-800' },
      'token-b': { name: 'Token B', price: '฿700', color: 'bg-green-100 text-green-800' },
      'premium': { name: 'Premium', price: '฿1,400', color: 'bg-purple-100 text-purple-800' }
    };
    return services[service as keyof typeof services] || { name: service, price: 'N/A', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <DashboardLayout language="th">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">แผงผู้ดูแลระบบ</h1>
          <p className="text-muted-foreground">
            จัดการผู้ใช้ การลงทะเบียน และดูการวิเคราะห์
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แผน Token A</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokenACount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แผน Token B</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokenBCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แผน Premium</CardTitle>
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
              การลงทะเบียนทั้งหมด
            </CardTitle>
            <CardDescription>
              รายการผู้ใช้ที่ลงทะเบียนทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>บริษัท</TableHead>
                    <TableHead>บริการ</TableHead>
                    <TableHead>วันที่ลงทะเบียน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.first_name} {registration.last_name}
                      </TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>{registration.company || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getServiceDetails(registration.service).color}>
                          {getServiceDetails(registration.service).name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(registration.created_at).toLocaleDateString('th-TH')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {registrations.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                ไม่พบการลงทะเบียน
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
