import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TestEmailFunctions = () => {
  const [isTestingWelcome, setIsTestingWelcome] = useState(false);
  const [isTestingSubscription, setIsTestingSubscription] = useState(false);
  const [isTestingPasswordReset, setIsTestingPasswordReset] = useState(false);
  const [testEmail, setTestEmail] = useState("henry@metaviewllc.net");
  const { toast } = useToast();

  const testWelcomeEmail = async () => {
    setIsTestingWelcome(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: testEmail,
          firstName: "Test",
          lastName: "User",
          service: "premium",
          language: 'en'
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Welcome email sent successfully. Check your inbox.",
      });
      console.log('Welcome email response:', data);
    } catch (error) {
      console.error('Welcome email test failed:', error);
      toast({
        title: "Error",
        description: `Welcome email failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingWelcome(false);
    }
  };

  const testSubscriptionEmail = async () => {
    setIsTestingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-subscription-email', {
        body: {
          email: testEmail,
          firstName: "Test",
          lastName: "User",
          planName: "Premium Plan",
          planPrice: "$39.99",
          language: 'en'
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Subscription email sent successfully. Check your inbox.",
      });
      console.log('Subscription email response:', data);
    } catch (error) {
      console.error('Subscription email test failed:', error);
      toast({
        title: "Error",
        description: `Subscription email failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingSubscription(false);
    }
  };

  const testPasswordResetEmail = async () => {
    setIsTestingPasswordReset(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: testEmail,
          resetLink: "https://example.com/reset-password?token=test123",
          language: 'en'
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Password reset email sent successfully. Check your inbox.",
      });
      console.log('Password reset email response:', data);
    } catch (error) {
      console.error('Password reset email test failed:', error);
      toast({
        title: "Error",
        description: `Password reset email failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingPasswordReset(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Functions Test</CardTitle>
          <CardDescription>
            Test the email notification system to ensure everything works correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={testWelcomeEmail}
              disabled={isTestingWelcome || !testEmail}
              className="w-full"
            >
              {isTestingWelcome ? "Sending..." : "Test Welcome Email"}
            </Button>

            <Button
              onClick={testSubscriptionEmail}
              disabled={isTestingSubscription || !testEmail}
              className="w-full"
            >
              {isTestingSubscription ? "Sending..." : "Test Subscription Email"}
            </Button>

            <Button
              onClick={testPasswordResetEmail}
              disabled={isTestingPasswordReset || !testEmail}
              className="w-full"
            >
              {isTestingPasswordReset ? "Sending..." : "Test Password Reset"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2"><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Enter your email address above</li>
              <li>Click each button to test the respective email function</li>
              <li>Check your inbox for the test emails</li>
              <li>Open the browser console to see function responses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEmailFunctions;