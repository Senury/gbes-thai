import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_API_SECRET');
    
    console.log('OpenAI API Key configured:', !!openAIApiKey);
    console.log('Available environment variables:', Object.keys(Deno.env.toObject()));
    
    if (!openAIApiKey) {
      console.error('No OpenAI API key found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY in Supabase Edge Function secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, language } = await req.json();
    console.log('Processing message:', { messageLength: message?.length, language });

    const systemPrompt = language === 'ja' 
      ? `あなたは日本の輸出入業務の専門家です。日本企業の海外展開、輸出入手続き、貿易規制、関税、必要書類、パートナー探し、多国間取引などについて詳しくアドバイスしてください。実用的で具体的な情報を提供し、日本語で回答してください。`
      : `You are an expert in Japan export/import operations. Help with Japanese companies' global expansion, export/import procedures, trade regulations, customs, required documentation, partner discovery, and multi-country transactions. Provide practical and specific information in English.`;

    console.log('Making OpenAI API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status} - ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('Successfully received AI response');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-export-import function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});