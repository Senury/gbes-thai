import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfileForm } from '@/components/ProfileForm';

export default function Profile() {
  return (
    <DashboardLayout language="th">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">โปรไฟล์</h1>
          <p className="text-muted-foreground">
            จัดการข้อมูลส่วนตัวและการตั้งค่าของคุณ
          </p>
        </div>
        
        <ProfileForm language="th" />
      </div>
    </DashboardLayout>
  );
}
