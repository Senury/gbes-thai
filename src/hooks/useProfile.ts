import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  service_plan?: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<Profile> | null>(null);
  const [latestRegistrationPlan, setLatestRegistrationPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setInitialData(data);
      } else {
        setInitialData(null);
      }

      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .select('first_name,last_name,company,phone,service,email')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (registrationError) {
        throw registrationError;
      }

      if (registrationData) {
        setLatestRegistrationPlan(registrationData.service || null);
        if (!data) {
          setInitialData({
            first_name: registrationData.first_name || '',
            last_name: registrationData.last_name || '',
            company: registrationData.company || '',
            phone: registrationData.phone || '',
            service_plan: registrationData.service || '',
            email: registrationData.email || user.email || '',
          } as Partial<Profile>);
        }
      } else {
        setLatestRegistrationPlan(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setInitialData(data);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createProfile = async (profileData: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email || '',
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setInitialData(data);
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    initialData,
    latestRegistrationPlan,
    updateProfile,
    createProfile,
    refetchProfile: fetchProfile,
  };
}
