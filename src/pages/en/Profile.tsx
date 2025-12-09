import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfileForm } from '@/components/ProfileForm';

export default function Profile() {
  return (
    <DashboardLayout language="en">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        
        <ProfileForm language="en" />
      </div>
    </DashboardLayout>
  );
}