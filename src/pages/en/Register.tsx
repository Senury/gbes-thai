import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Navigation from "@/components/en/Navigation";
import Footer from "@/components/en/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company name is required"),
  phone: z.string().min(1, "Phone number is required"),
  service: z.enum(["token-a", "token-b", "premium"]).refine((val) => val !== undefined, {
    message: "Please select a service"
  })
});

type RegisterForm = z.infer<typeof registerSchema>;

const services = [
  {
    id: "token-a",
    name: "Token A",
    price: "¥5,000/month",
    description: "Partner Search + Limited Support",
    features: ["Partner search functionality", "Basic AI assistance", "Multi-channel distribution", "Limited support"]
  },
  {
    id: "token-b",
    name: "Token B", 
    price: "¥10,000/month",
    description: "AI Assistance + Standard Support",
    features: ["AI assistance features", "Advanced analytics", "Priority support", "Custom integrations"]
  },
  {
    id: "premium",
    name: "Premium",
    price: "¥20,000/month",
    description: "Full Access + Premium Support", 
    features: ["All features available", "24/7 support", "Dedicated account manager", "Custom development"]
  }
];

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/en/login");
    }
  }, [user, loading, navigate]);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      service: undefined
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Save registration data to Supabase
      const { error } = await (supabase as any)
        .from('registrations')
        .insert({
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          company: data.company,
          phone: data.phone,
          service: data.service,
        });

      if (error) throw error;

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            service: data.service,
            language: 'en'
          }
        });
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail registration if email fails
      }
      
      toast({
        title: "Registration Complete",
        description: "Your registration was successful. Check your email for confirmation."
      });
      
      form.reset();
      navigate("/en");
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Service Registration
              </h1>
              <p className="text-xl text-muted-foreground">
                Choose your ideal plan and get started today
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Please enter the required information to create your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Selection</CardTitle>
                    <CardDescription>
                      Please select the service plan you would like to use
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-3 gap-6"
                            >
                              {services.map((service) => (
                                <div key={service.id} className="flex items-start space-x-3">
                                  <RadioGroupItem 
                                    value={service.id} 
                                    id={service.id}
                                    className="mt-1"
                                  />
                                  <Label htmlFor={service.id} className="cursor-pointer flex-1">
                                    <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                                      <div className="font-semibold text-lg mb-1">
                                        {service.name}
                                      </div>
                                      <div className="text-primary font-medium mb-2">
                                        {service.price}
                                      </div>
                                      <div className="text-sm text-muted-foreground mb-3">
                                        {service.description}
                                      </div>
                                      <ul className="text-sm space-y-1">
                                        {service.features.map((feature, index) => (
                                          <li key={index} className="flex items-center">
                                            <span className="w-1 h-1 bg-primary rounded-full mr-2"></span>
                                            {feature}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;