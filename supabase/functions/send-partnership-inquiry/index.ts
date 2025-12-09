import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PartnershipInquiryRequest {
  companyId: string;
  message: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { companyId, message, userId }: PartnershipInquiryRequest = await req.json();

    // Get company details
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('name, contact_email, description')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found');
    }

    // Get user profile for sender information
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, email, company, phone')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Only send email if company has contact email
    if (company.contact_email) {
      const senderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      const senderCompany = profile.company ? ` from ${profile.company}` : '';

      const emailResponse = await resend.emails.send({
        from: "Partnership Inquiry <partnerships@resend.dev>",
        to: [company.contact_email],
        subject: `Partnership Inquiry for ${company.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Partnership Inquiry
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Company: ${company.name}</h3>
              <p style="color: #6c757d; margin-bottom: 0;">${company.description}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #495057;">Inquiry Details:</h3>
              <p style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
                ${message}
              </p>
            </div>

            <div style="background-color: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #495057; margin-top: 0;">Contact Information:</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 5px 0;"><strong>Name:</strong> ${senderName || 'Not provided'}</li>
                <li style="margin: 5px 0;"><strong>Email:</strong> ${profile.email}</li>
                ${profile.company ? `<li style="margin: 5px 0;"><strong>Company:</strong> ${profile.company}</li>` : ''}
                ${profile.phone ? `<li style="margin: 5px 0;"><strong>Phone:</strong> ${profile.phone}</li>` : ''}
              </ul>
            </div>

            <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-radius: 6px; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724;">
                <strong>Next Steps:</strong> Please reply directly to this email to connect with ${senderName}${senderCompany} regarding their partnership inquiry.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
              <p>This email was sent through our partnership inquiry system. If you have questions about this inquiry, please contact our support team.</p>
            </div>
          </div>
        `,
        reply_to: profile.email,
      });

      console.log("Partnership inquiry email sent successfully:", emailResponse);
    }

    return new Response(JSON.stringify({ 
      success: true,
      emailSent: !!company.contact_email,
      message: company.contact_email ? 'Inquiry sent to company' : 'Inquiry recorded (no company email available)'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-partnership-inquiry function:", error);
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