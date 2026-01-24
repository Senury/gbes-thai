import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";

const SimpleEmailTest = () => {
  const { toast } = useToast();

  const testEmail = async () => {
    console.log('Testing email function...');
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: "henry@metaviewllc.net",
          firstName: "Test",
          lastName: "User", 
          service: "premium",
          language: 'en'
        }
      });

      console.log('Email function response:', { data, error });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Email sent successfully. Check console for details.",
      });
    } catch (error) {
      console.error('Email test failed:', error);
      toast({
        title: "Error",
        description: `Email failed: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <PageShell className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-foreground">
              Simple Email Test
            </h1>
            <p className="text-xl text-muted-foreground">
              If you can see this page, routing is working correctly
            </p>
            
            <div className="space-y-4">
              <Button onClick={testEmail} size="lg">
                Test Welcome Email
              </Button>
              
              <p className="text-sm text-muted-foreground">
                This will send a test email to henry@metaviewllc.net
              </p>
            </div>
          </div>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
};

export default SimpleEmailTest;
