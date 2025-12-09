import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'premium' | 'basic';

export interface UserRoleInfo {
  role: UserRole;
  roleLevel: number;
  canAccessContacts: boolean;
  hasSubscription: boolean;
  subscriptionTier: string | null;
  loading: boolean;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo>({
    role: 'basic',
    roleLevel: 1,
    canAccessContacts: false,
    hasSubscription: false,
    subscriptionTier: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setRoleInfo({
        role: 'basic',
        roleLevel: 1,
        canAccessContacts: false,
        hasSubscription: false,
        subscriptionTier: null,
        loading: false,
      });
      return;
    }

    const fetchUserRole = async () => {
      try {
        // Get user's subscription and role info
        const { data: subscriptionInfo, error: subError } = await supabase
          .rpc('get_user_subscription_info', { _user_id: user.id });

        if (subError) {
          console.error('Error fetching user subscription info:', subError);
        }

        // Get user's role level
        const { data: roleLevel, error: levelError } = await supabase
          .rpc('get_user_role_level', { _user_id: user.id });

        if (levelError) {
          console.error('Error fetching user role level:', levelError);
        }

        // Get user's roles for admin check
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
        }

        // Determine highest role
        let highestRole: UserRole = 'basic';
        if (roles?.some(r => r.role === 'admin')) {
          highestRole = 'admin';
        } else if (roles?.some(r => r.role === 'premium')) {
          highestRole = 'premium';
        }

        const subInfo = subscriptionInfo?.[0];
        
        setRoleInfo({
          role: highestRole,
          roleLevel: roleLevel || 1,
          canAccessContacts: subInfo?.can_access_contacts || false,
          hasSubscription: subInfo?.has_subscription || false,
          subscriptionTier: subInfo?.subscription_tier || null,
          loading: false,
        });
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRoleInfo({
          role: 'basic',
          roleLevel: 1,
          canAccessContacts: false,
          hasSubscription: false,
          subscriptionTier: null,
          loading: false,
        });
      }
    };

    fetchUserRole();
  }, [user]);

  const checkCompanyAccess = async (companyId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('can_access_company_contacts', {
          _user_id: user.id,
          company_uuid: companyId
        });

      if (error) {
        console.error('Error checking company access:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkCompanyAccess:', error);
      return false;
    }
  };

  const upgradeRole = async (targetRole: UserRole): Promise<boolean> => {
    if (!user) return false;

    try {
      // This would typically integrate with your subscription system
      // For now, it's a placeholder that admins could use
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: targetRole,
          granted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error upgrading role:', error);
        return false;
      }

      // Refresh role info
      const { data: newRoleLevel } = await supabase
        .rpc('get_user_role_level', { _user_id: user.id });

        setRoleInfo(prev => ({
          ...prev,
          role: targetRole,
          roleLevel: newRoleLevel || prev.roleLevel,
          canAccessContacts: targetRole === 'admin' || prev.hasSubscription
        }));

      return true;
    } catch (error) {
      console.error('Error in upgradeRole:', error);
      return false;
    }
  };

  return {
    ...roleInfo,
    checkCompanyAccess,
    upgradeRole,
    isAdmin: roleInfo.role === 'admin',
    isPremium: roleInfo.role === 'premium' || roleInfo.role === 'admin',
    isBasic: roleInfo.role === 'basic'
  };
};