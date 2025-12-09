import { AlertTriangle, Crown, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserRole } from "@/hooks/useUserRole";

interface ContactAccessPromptProps {
  companyName: string;
  companyId: string;
  onUpgrade?: () => void;
  onMakeInquiry?: () => void;
}

export const ContactAccessPrompt = ({ 
  companyName, 
  companyId, 
  onUpgrade, 
  onMakeInquiry 
}: ContactAccessPromptProps) => {
  const { role, isBasic } = useUserRole();

  if (!isBasic && role !== 'basic') {
    return null; // Don't show for premium/admin users
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          Contact Information Restricted
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Contact details for <span className="font-semibold">{companyName}</span> are protected. 
            Choose an option below to access this information.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Premium Upgrade Option */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-primary" />
                <Badge variant="default" className="text-xs">PREMIUM</Badge>
              </div>
              <h4 className="font-semibold text-sm mb-2">Unlimited Access</h4>
              <p className="text-xs text-muted-foreground mb-3">
                View all company contact details instantly
              </p>
              <Button 
                size="sm" 
                className="w-full" 
                onClick={onUpgrade}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>

          {/* Partnership Inquiry Option */}
          <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-secondary" />
                <Badge variant="secondary" className="text-xs">FREE</Badge>
              </div>
              <h4 className="font-semibold text-sm mb-2">Make Inquiry</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Send partnership inquiry to access contact info
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={onMakeInquiry}
              >
                Send Inquiry
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>
            🔒 We protect business contact information to prevent spam and maintain 
            professional networking standards.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};