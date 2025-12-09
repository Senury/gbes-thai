import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfileForm } from '@/components/ProfileForm';

export default function Profile() {
  return (
    <DashboardLayout language="ja">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">プロフィール</h1>
          <p className="text-muted-foreground">
            個人情報と設定を管理してください
          </p>
        </div>
        
        <ProfileForm language="ja" />
      </div>
    </DashboardLayout>
  );
}