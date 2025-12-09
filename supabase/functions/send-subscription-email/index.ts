import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  planName: string;
  planPrice: string;
  language?: 'en' | 'ja';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, planName, planPrice, language = 'en' }: SubscriptionEmailRequest = await req.json();

    console.log("Sending subscription confirmation email to:", email, "Language:", language);

    const isJapanese = language === 'ja';

    const subject = isJapanese 
      ? `ご購読ありがとうございます！${planName}プランをご利用いただけます`
      : `Subscription Confirmed! Welcome to ${planName}`;

    const htmlContent = isJapanese ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          ご購読ありがとうございます！
        </h1>
        
        <p>こんにちは ${firstName} ${lastName}様、</p>
        
        <p>この度は${planName}プランにご登録いただき、誠にありがとうございます。</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">ご購読詳細</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>プラン名:</strong> ${planName}</li>
            <li><strong>月額料金:</strong> ${planPrice}</li>
            <li><strong>ご購読開始日:</strong> ${new Date().toLocaleDateString('ja-JP')}</li>
          </ul>
        </div>
        
        <p>ダッシュボードにアクセスして、すべての機能をお楽しみください。</p>
        
        <p style="color: #64748b; font-size: 14px;">
          ご不明な点がございましたら、お気軽にお問い合わせください。<br>
          MetaView LLC サポートチーム
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          Subscription Confirmed!
        </h1>
        
        <p>Hello ${firstName} ${lastName},</p>
        
        <p>Thank you for subscribing to the ${planName} plan. Your subscription is now active!</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Subscription Details</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Plan:</strong> ${planName}</li>
            <li><strong>Monthly Price:</strong> ${planPrice}</li>
            <li><strong>Subscription Start:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>
        
        <p>You can now access your dashboard and enjoy all the features of your plan.</p>
        
        <p style="color: #64748b; font-size: 14px;">
          If you have any questions, please don't hesitate to contact our support team.<br>
          Best regards,<br>
          MetaView LLC Support Team
        </p>
      </div>
    `;

const emailResponse = await resend.emails.send({
      from: "MetaView LLC <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Subscription email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-email function:", error);
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