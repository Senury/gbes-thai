import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import i18n from "@/i18n";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export function useSubscription() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: i18n.t("subscription.errorTitle"),
        description: i18n.t("subscription.checkError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (planId: string) => {
    if (!user || !session) {
      toast({
        title: i18n.t("subscription.authRequiredTitle"),
        description: i18n.t("subscription.authRequiredDescription"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: i18n.t("subscription.errorTitle"),
        description: i18n.t("subscription.checkoutError"),
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast({
        title: i18n.t("subscription.authRequiredTitle"),
        description: i18n.t("subscription.manageAuthRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: i18n.t("subscription.errorTitle"),
        description: i18n.t("subscription.portalError"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
