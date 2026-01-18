import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile, Profile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { getPlanDetails, normalizePlanKey } from '@/utils/servicePlans';

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  service_plan: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  language?: 'en' | 'ja' | 'th';
}

export function ProfileForm({ language = 'en' }: ProfileFormProps) {
  const { profile, loading, initialData, latestRegistrationPlan, updateProfile, createProfile } = useProfile();
  const { user } = useAuth();
  const { subscriptionTier } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      company: '',
      phone: '',
      service_plan: '',
    },
  });

  const normalizePlan = (plan?: string | null) => {
    if (!plan) return '';
    const value = plan.toString().toLowerCase();
    if (value.includes('token-a') || value.includes('token a')) return 'token-a';
    if (value.includes('token-b') || value.includes('token b')) return 'token-b';
    if (value.includes('premium')) return 'premium';
    if (value.includes('admin')) return 'admin';
    return plan.toString();
  };

  useEffect(() => {
    const source = profile || initialData;
    const planSource = latestRegistrationPlan || subscriptionTier || source?.service_plan || '';
    const normalizedPlan = normalizePlan(planSource);
    reset({
      first_name: source?.first_name || '',
      last_name: source?.last_name || '',
      company: source?.company || '',
      phone: source?.phone || '',
      service_plan: normalizedPlan,
    });
  }, [profile, initialData, subscriptionTier, latestRegistrationPlan, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      if (profile) {
        await updateProfile(data);
      } else {
        await createProfile(data);
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const texts = {
    en: {
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      company: 'Company',
      phone: 'Phone Number',
      servicePlan: 'Service Plan',
      noPlan: 'No active plan',
      save: 'Save Changes',
      saving: 'Saving...',
    },
    ja: {
      title: 'プロフィール設定',
      description: '個人情報と設定を管理',
      firstName: '名',
      lastName: '姓',
      email: 'メールアドレス',
      company: '会社',
      phone: '電話番号',
      servicePlan: 'サービスプラン',
      noPlan: '契約プランはありません',
      save: '変更を保存',
      saving: '保存中...',
    },
    th: {
      title: 'ตั้งค่าโปรไฟล์',
      description: 'จัดการข้อมูลส่วนตัวและการตั้งค่าของคุณ',
      firstName: 'ชื่อ',
      lastName: 'นามสกุล',
      email: 'อีเมล',
      company: 'บริษัท',
      phone: 'เบอร์โทรศัพท์',
      servicePlan: 'แผนบริการ',
      noPlan: 'ยังไม่มีการสมัครแพ็กเกจ',
      save: 'บันทึกการเปลี่ยนแปลง',
      saving: 'กำลังบันทึก...',
    },
  };

  const t = texts[language];
  const currentPlanKey = watch('service_plan') || '';
  const planDetails = getPlanDetails(currentPlanKey, language);
  const planDisplay = currentPlanKey ? planDetails.name : t.noPlan;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">{t.firstName}</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder={t.firstName}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">{t.lastName}</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder={t.lastName}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">{t.company}</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder={t.company}
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder={t.phone}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.servicePlan}</Label>
            <Input
              id="service_plan"
              value={planDisplay}
              disabled
              className="bg-muted"
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.saving : t.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
