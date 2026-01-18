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
import { getPlanDetails } from "@/utils/servicePlans";

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
            title: "エラー",
            description: "登録データの取得に失敗しました。",
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

  return (
    <DashboardLayout language="ja">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            ようこそ、{user?.email} さん
          </h1>
          <p className="text-muted-foreground">
            アカウントと登録状況の概要をご確認ください。
          </p>
        </div>

        {/* Subscription Status */}
        <SubscriptionStatus language="ja" />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">アカウント状況</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">アクティブ</div>
              <p className="text-xs text-muted-foreground">
                作成日: {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">登録状況</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? '完了' : '未完了'}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? 'サービス登録が完了しています' : 'サービス登録を完了してください'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現在のプラン</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? getPlanDetails(registration.service, 'ja').name : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? getPlanDetails(registration.service, 'ja').price : 'No active plan'}
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
                登録詳細
              </CardTitle>
              <CardDescription>
                最新のサービス登録情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">氏名</label>
                  <p className="text-sm">{registration.first_name} {registration.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">メールアドレス</label>
                  <p className="text-sm">{registration.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">会社名</label>
                  <p className="text-sm">{registration.company || '未入力'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">電話番号</label>
                  <p className="text-sm">{registration.phone || '未入力'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">契約プラン:</label>
                <Badge className={getPlanDetails(registration.service, 'ja').color}>
                  {getPlanDetails(registration.service, 'ja').name} - {getPlanDetails(registration.service, 'ja').price}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  登録日: {new Date(registration.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>登録を完了してください</CardTitle>
              <CardDescription>
                サービス登録がまだ完了していません。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/ja/register')}>
                登録を完了する
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
