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
            title: "Error",
            description: "Failed to load registration data",
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
      'token-a': { name: 'Token A', price: '$9.99', color: 'bg-blue-100 text-blue-800' },
      'token-b': { name: 'Token B', price: '$19.99', color: 'bg-green-100 text-green-800' },
      'premium': { name: 'Premium', price: '$39.99', color: 'bg-purple-100 text-purple-800' }
    };
    return services[service as keyof typeof services] || { name: service, price: 'N/A', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <DashboardLayout language="en">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.email}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your account and registration status.
          </p>
        </div>

        {/* Subscription Status */}
        <SubscriptionStatus />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Account created {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? 'Completed' : 'Pending'}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? 'Service registration complete' : 'Complete your service registration'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? getServiceDetails(registration.service).name : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? getServiceDetails(registration.service).price : 'No active plan'}
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
                Registration Details
              </CardTitle>
              <CardDescription>
                Your service registration information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{registration.first_name} {registration.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{registration.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="text-sm">{registration.company || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{registration.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Service Plan:</label>
                <Badge className={getServiceDetails(registration.service).color}>
                  {getServiceDetails(registration.service).name} - {getServiceDetails(registration.service).price}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Registered on {new Date(registration.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                You haven't completed your service registration yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/en/register')}>
                Complete Registration
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}