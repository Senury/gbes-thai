import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const promptMap = {
  ja: `あなたは日本の輸出入業務の専門家です。日本企業の海外展開、輸出入手続き、貿易規制、関税、必要書類、パートナー探し、多国間取引などについて詳しくアドバイスしてください。

- 回答は常に日本語で、Markdown形式（見出し/箇条書きなど）を使って整理してください。
- 実用的で具体的な情報、手順、注意点を明確に示してください。
- 不明点があれば確認事項を提示してください。`,
  en: `You are an expert in Japan export/import operations.
Help with Japanese companies' global expansion, export/import
procedures, trade regulations, customs, required documentation,
partner discovery, and multi-country transactions.

- Always respond in English using Markdown (headings, lists, code
blocks, tables when helpful).
- Provide practical, specific information with clear steps/
considerations.
- Surface assumptions or clarifying questions if needed.`,
  th: `คุณคือผู้เชี่ยวชาญด้านการนำเข้า/ส่งออกของบริษัทญี่ปุ่น ช่วยเหลือการขยายธุรกิจ
การดำเนินพิธีการนำเข้า/ส่งออก กฎระเบียบ ศุลกากร เอกสารที่จำเป็น การหาพันธมิตร
และการทำธุรกรรมหลายประเทศ

- ตอบเป็นภาษาไทย และใช้ Markdown ในการจัดหัวข้อ/รายการ/ตาราง
- ให้ข้อมูลเชิงปฏิบัติ พร้อมขั้นตอนและข้อควรระวังที่ชัดเจน
- หากข้อมูลไม่ครบควรแจ้งคำถามเพื่อขอรายละเอียดเพิ่มเติม`,
} as const;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey =
      Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_API_SECRET');

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { message, language } = await req.json();
    const locale = language === 'ja' || language === 'th' ? language : 'en';
    const systemPrompt = promptMap[locale];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new TransformStream<Uint8Array, Uint8Array>();
    const writer = stream.writable.getWriter();
    const reader = response.body?.getReader();

    // Fallback if body streaming isn't available (rare)
    if (!reader) {
      const text = await response.text();
      await writer.write(encoder.encode(text));
      await writer.close();
      return new Response(stream.readable, {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    (async () => {
      try {
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();

            if (
              !trimmed ||
              trimmed === 'data:' ||
              trimmed === 'data: [DONE]' ||
              trimmed === '[DONE]'
            ) {
              continue;
            }

            if (!trimmed.startsWith('data:')) continue;

            const payload = trimmed.replace(/^data:\s*/, '');
            if (payload === '[DONE]') continue;

            try {
              const json = JSON.parse(payload);
              const textChunk = json.choices?.[0]?.delta?.content;
              if (textChunk) {
                await writer.write(encoder.encode(textChunk));
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }

        // Try to parse any remaining buffer
        if (buffer.trim()) {
          try {
            const payload = buffer.replace(/^data:\s*/, '');
            if (payload && payload !== '[DONE]') {
              const json = JSON.parse(payload);
              const textChunk = json.choices?.[0]?.delta?.content;
              if (textChunk) {
                await writer.write(encoder.encode(textChunk));
              }
            }
          } catch {
            // ignore final chunk parse errors
          }
        }
      } catch (err) {
        console.error('Streaming error', err);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        // Note: In many runtimes, setting this manually is unnecessary or ignored.
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in chat-export-import function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
