import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetEmailRequest {
  email: string;
  resetLink: string;
  language?: 'en' | 'ja';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink, language = 'en' }: PasswordResetEmailRequest = await req.json();

    console.log("Sending password reset email to:", email, "Language:", language);

    const isJapanese = language === 'ja';

    const subject = isJapanese 
      ? "パスワードリセットのご案内"
      : "Reset Your Password";

    const htmlContent = isJapanese ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          パスワードリセット
        </h1>
        
        <p>こんにちは、</p>
        
        <p>パスワードのリセットをご希望とのことですので、下記のリンクをクリックして新しいパスワードを設定してください。</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            パスワードをリセット
          </a>
        </div>
        
        <p style="color: #dc2626; font-size: 14px;">
          このリンクは15分間有効です。この時間を過ぎると無効になりますので、お早めにご利用ください。
        </p>
        
        <p>もしパスワードリセットをご希望でない場合は、このメールを無視してください。</p>
        
        <p style="color: #64748b; font-size: 14px;">
          MetaView LLC サポートチーム
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          Reset Your Password
        </h1>
        
        <p>Hello,</p>
        
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${resetLink}" style="background-color: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #dc2626; font-size: 14px;">
          This link will expire in 15 minutes for security reasons.
        </p>
        
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        
        <p style="color: #64748b; font-size: 14px;">
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

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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