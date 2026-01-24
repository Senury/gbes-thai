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
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/PageShell";

const Register = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const registerSchema = z.object({
    firstName: z.string().min(1, t("register.validation.firstNameRequired")),
    lastName: z.string().min(1, t("register.validation.lastNameRequired")),
    email: z.string().email(t("register.validation.emailInvalid")),
    company: z.string().min(1, t("register.validation.companyRequired")),
    phone: z.string().min(1, t("register.validation.phoneRequired")),
    service: z.enum(["token-a", "token-b", "premium"]).refine((val) => val !== undefined, {
      message: t("register.validation.serviceRequired"),
    }),
  });
  type RegisterForm = z.infer<typeof registerSchema>;
  const services = t("register.services", { returnObjects: true }) as Array<{
    id: "token-a" | "token-b" | "premium";
    name: string;
    price: string;
    description: string;
    features: string[];
  }>;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/${localePrefix}/login`);
    }
  }, [user, loading, navigate, localePrefix]);

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
      if (error) {
        toast({
          variant: "destructive",
          title: t("register.toasts.errorTitle"),
          description: error.message,
        });
      } else {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              service: data.service,
              language: localePrefix
            }
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }

        toast({
          title: t("register.toasts.successTitle"),
          description: t("register.toasts.successDescription"),
        });
        form.reset();
        navigate(`/${localePrefix}/dashboard`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: t("register.toasts.errorTitle"),
        description: t("register.toasts.errorDescription"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">{t("common.loading")}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <PageShell className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {t("register.title")}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t("register.subtitle")}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("register.basicInfoTitle")}</CardTitle>
                    <CardDescription>
                      {t("register.basicInfoDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("register.labels.firstName")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("register.placeholders.firstName")} {...field} />
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
                            <FormLabel>{t("register.labels.lastName")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("register.placeholders.lastName")} {...field} />
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
                          <FormLabel>{t("register.labels.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t("register.placeholders.email")} {...field} />
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
                            <FormLabel>{t("register.labels.company")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("register.placeholders.company")} {...field} />
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
                            <FormLabel>{t("register.labels.phone")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("register.placeholders.phone")} {...field} />
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
                    <CardTitle>{t("register.serviceTitle")}</CardTitle>
                    <CardDescription>
                      {t("register.serviceDescription")}
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
                    {isSubmitting ? t("register.submitting") : t("register.submit")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </PageShell>

      <Footer />
    </div>
  );
};

export default Register;
