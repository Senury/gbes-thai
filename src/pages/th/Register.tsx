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
import Navigation from "@/components/th/Navigation";
import Footer from "@/components/th/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const registerSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  company: z.string().min(1, "กรุณากรอกชื่อบริษัท"),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  service: z.enum(["token-a", "token-b", "premium"]).refine((val) => val !== undefined, {
    message: "กรุณาเลือกบริการ"
  })
});

type RegisterForm = z.infer<typeof registerSchema>;

const services = [
  {
    id: "token-a",
    name: "Token A",
    price: "฿1,750/เดือน",
    description: "ค้นหาพันธมิตร + การสนับสนุนจำกัด",
    features: ["ฟังก์ชันค้นหาพันธมิตร", "ความช่วยเหลือ AI พื้นฐาน", "การกระจายหลายช่องทาง", "การสนับสนุนจำกัด"]
  },
  {
    id: "token-b",
    name: "Token B", 
    price: "฿3,500/เดือน",
    description: "ความช่วยเหลือ AI + การสนับสนุนมาตรฐาน",
    features: ["ฟีเจอร์ความช่วยเหลือ AI", "การวิเคราะห์ขั้นสูง", "การสนับสนุนลำดับความสำคัญ", "การรวมระบบที่กำหนดเอง"]
  },
  {
    id: "premium",
    name: "Premium",
    price: "฿7,000/เดือน",
    description: "เข้าถึงทั้งหมด + การสนับสนุน Premium", 
    features: ["ฟีเจอร์ทั้งหมดที่มี", "การสนับสนุน 24/7", "ผู้จัดการบัญชีเฉพาะ", "การพัฒนาที่กำหนดเอง"]
  }
];

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/th/login");
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

      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            service: data.service,
            language: 'th'
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
      
      toast({
        title: "ลงทะเบียนเรียบร้อย",
        description: "การลงทะเบียนของคุณสำเร็จแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยัน"
      });
      
      form.reset();
      navigate("/th");
    } catch (error) {
      toast({
        title: "ข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดระหว่างการลงทะเบียน กรุณาลองใหม่",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">กำลังโหลด...</div>;
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
                ลงทะเบียนบริการ
              </h1>
              <p className="text-xl text-muted-foreground">
                เลือกแผนที่เหมาะสมกับคุณและเริ่มต้นวันนี้
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                    <CardDescription>
                      กรุณากรอกข้อมูลที่จำเป็นเพื่อสร้างบัญชีของคุณ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ชื่อ</FormLabel>
                            <FormControl>
                              <Input placeholder="ชื่อของคุณ" {...field} />
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
                            <FormLabel>นามสกุล</FormLabel>
                            <FormControl>
                              <Input placeholder="นามสกุลของคุณ" {...field} />
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
                          <FormLabel>อีเมล</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@company.com" {...field} />
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
                            <FormLabel>ชื่อบริษัท</FormLabel>
                            <FormControl>
                              <Input placeholder="บริษัท ของคุณ จำกัด" {...field} />
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
                            <FormLabel>เบอร์โทรศัพท์</FormLabel>
                            <FormControl>
                              <Input placeholder="+66 XX XXX XXXX" {...field} />
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
                    <CardTitle>เลือกบริการ</CardTitle>
                    <CardDescription>
                      กรุณาเลือกแผนบริการที่คุณต้องการใช้
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
                    {isSubmitting ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
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
