import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  service: string;
  language?: 'en' | 'ja';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, service, language = 'en' }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email, "Language:", language);

    const serviceDetails = {
      'token-a': { name: 'Token A', price: '$9.99' },
      'token-b': { name: 'Token B', price: '$19.99' },
      'premium': { name: 'Premium', price: '$39.99' }
    }[service] || { name: service, price: 'N/A' };

    const isJapanese = language === 'ja';

    const subject = isJapanese 
      ? `ようこそ！${firstName}様、ご登録ありがとうございます`
      : `Welcome ${firstName}! Registration Confirmed`;

    const htmlContent = isJapanese ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          ご登録ありがとうございます！
        </h1>
        
        <p>こんにちは ${firstName} ${lastName}様、</p>
        
        <p>この度は弊社サービスにご登録いただき、誠にありがとうございます。</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">登録詳細</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>お名前:</strong> ${firstName} ${lastName}</li>
            <li><strong>メールアドレス:</strong> ${email}</li>
            <li><strong>選択プラン:</strong> ${serviceDetails.name} (${serviceDetails.price})</li>
          </ul>
        </div>
        
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        
        <p style="color: #64748b; font-size: 14px;">
          今後ともよろしくお願いいたします。<br>
          サポートチーム
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          Welcome to Our Service!
        </h1>
        
        <p>Hello ${firstName} ${lastName},</p>
        
        <p>Thank you for registering with our service. We're excited to have you on board!</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Registration Details</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Name:</strong> ${firstName} ${lastName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Selected Plan:</strong> ${serviceDetails.name} (${serviceDetails.price})</li>
          </ul>
        </div>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          The Support Team
        </p>
      </div>
    `;

const emailResponse = await resend.emails.send({
      from: "MetaView LLC <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);