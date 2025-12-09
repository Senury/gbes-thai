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

const registerSchema = z.object({
  firstName: z.string().min(1, "名前を入力してください"),
  lastName: z.string().min(1, "姓を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  company: z.string().min(1, "会社名を入力してください"),
  phone: z.string().min(1, "電話番号を入力してください"),
  service: z.enum(["token-a", "token-b", "premium"]).refine((val) => val !== undefined, {
    message: "サービスを選択してください"
  })
});

type RegisterForm = z.infer<typeof registerSchema>;

const services = [
  {
    id: "token-a",
    name: "トークンA",
    price: "¥5,000/月",
    description: "パートナー検索 + 限定サポート",
    features: ["パートナー検索機能", "基本AI支援", "複数チャネル配信", "限定サポート"]
  },
  {
    id: "token-b",
    name: "トークンB", 
    price: "¥10,000/月",
    description: "AI支援 + 標準サポート",
    features: ["AI支援機能", "高度な分析", "優先サポート", "カスタム統合"]
  },
  {
    id: "premium",
    name: "プレミアム",
    price: "¥20,000/月",
    description: "フルアクセス + プレミアムサポート", 
    features: ["全機能利用可能", "24/7サポート", "専用アカウントマネージャー", "カスタム開発"]
  }
];

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/ja/login");
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
      if (error) {
        toast({
          variant: "destructive",
          title: "登録に失敗しました",
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
              language: 'ja'
            }
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }

        toast({
          title: "登録が完了しました！",
          description: "サービスへの登録が正常に完了しました。",
        });
        form.reset();
        navigate("/ja/dashboard");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "登録に失敗しました",
        description: "システムエラーが発生しました。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">読み込み中...</div>;
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
                サービス登録
              </h1>
              <p className="text-xl text-muted-foreground">
                最適なプランを選択して、今すぐ始めましょう
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                    <CardDescription>
                      アカウント作成に必要な情報を入力してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>名前</FormLabel>
                            <FormControl>
                              <Input placeholder="太郎" {...field} />
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
                            <FormLabel>姓</FormLabel>
                            <FormControl>
                              <Input placeholder="田中" {...field} />
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
                          <FormLabel>メールアドレス</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@company.com" {...field} />
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
                            <FormLabel>会社名</FormLabel>
                            <FormControl>
                              <Input placeholder="株式会社〇〇" {...field} />
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
                            <FormLabel>電話番号</FormLabel>
                            <FormControl>
                              <Input placeholder="03-1234-5678" {...field} />
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
                    <CardTitle>サービス選択</CardTitle>
                    <CardDescription>
                      ご利用になりたいサービスプランを選択してください
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
                    {isSubmitting ? "登録中..." : "登録する"}
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