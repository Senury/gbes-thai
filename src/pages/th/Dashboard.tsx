import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, FileText, Calendar, Package } from "lucide-react";
import SubscriptionStatus from "@/components/SubscriptionStatus";

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

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegistration() {
      if (!user) return;

      try {
        const { data, error } = await (supabase as any)
          .from('registrations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching registration:', error);
          toast({
            variant: "destructive",
            title: "ข้อผิดพลาด",
            description: "ไม่สามารถโหลดข้อมูลการลงทะเบียนได้",
          });
        } else if (data && data.length > 0) {
          setRegistration(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegistration();
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            ยินดีต้อนรับกลับ, {user?.email}!
          </h1>
          <p className="text-muted-foreground">
            นี่คือภาพรวมบัญชีและสถานะการลงทะเบียนของคุณ
          </p>
        </div>

        {/* Subscription Status */}
        <SubscriptionStatus />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะบัญชี</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">ใช้งานอยู่</div>
              <p className="text-xs text-muted-foreground">
                บัญชีสร้างเมื่อ {new Date(user?.created_at || '').toLocaleDateString('th-TH')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะการลงทะเบียน</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? 'เสร็จสมบูรณ์' : 'รอดำเนินการ'}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? 'ลงทะเบียนบริการเรียบร้อย' : 'กรุณาลงทะเบียนบริการ'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แผนปัจจุบัน</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? getServiceDetails(registration.service).name : 'ไม่มี'}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? getServiceDetails(registration.service).price : 'ไม่มีแผนที่ใช้งาน'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Details */}
        {registration ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                รายละเอียดการลงทะเบียน
              </CardTitle>
              <CardDescription>
                ข้อมูลการลงทะเบียนบริการของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ชื่อ</label>
                  <p className="text-sm">{registration.first_name} {registration.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">อีเมล</label>
                  <p className="text-sm">{registration.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">บริษัท</label>
                  <p className="text-sm">{registration.company || 'ไม่ได้ระบุ'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">โทรศัพท์</label>
                  <p className="text-sm">{registration.phone || 'ไม่ได้ระบุ'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">แผนบริการ:</label>
                <Badge className={getServiceDetails(registration.service).color}>
                  {getServiceDetails(registration.service).name} - {getServiceDetails(registration.service).price}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  ลงทะเบียนเมื่อ {new Date(registration.created_at).toLocaleDateString('th-TH')}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>ลงทะเบียนให้เสร็จสมบูรณ์</CardTitle>
              <CardDescription>
                คุณยังไม่ได้ลงทะเบียนบริการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/th/register')}>
                ลงทะเบียนเลย
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
