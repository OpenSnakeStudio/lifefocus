import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, data);
}

async function verifyTelegramWebAppData(initData: string, botToken: string) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return { valid: false, error: 'Hash not found' };

    urlParams.delete('hash');
    const dataCheckArr: string[] = [];
    urlParams.forEach((value, key) => dataCheckArr.push(`${key}=${value}`));
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    const encoder = new TextEncoder();
    const secretKey = await hmacSha256(encoder.encode('WebAppData').buffer, encoder.encode(botToken).buffer);
    const calculatedHashBuf = await hmacSha256(secretKey, encoder.encode(dataCheckString).buffer);
    const calculatedHash = bytesToHex(new Uint8Array(calculatedHashBuf));

    if (calculatedHash !== hash) return { valid: false, error: 'Invalid hash' };

    const userParam = urlParams.get('user');
    if (!userParam) return { valid: false, error: 'User data not found' };

    return { valid: true, user: JSON.parse(userParam) as TelegramUser };
  } catch (err) {
    console.error('Verification error:', err);
    return { valid: false, error: 'Verification failed' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    if (!initData) {
      return new Response(JSON.stringify({ valid: false, error: 'initData required' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return new Response(JSON.stringify({ valid: false, error: 'Config error' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    const result = await verifyTelegramWebAppData(initData, botToken);
    if (!result.valid) {
      return new Response(JSON.stringify(result), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let profileData = null;
    if (result.user?.username) {
      const { data } = await supabase.from('profiles').select('user_id, display_name, avatar_url')
        .eq('telegram_username', result.user.username).single();
      profileData = data;
    }

    return new Response(JSON.stringify({ valid: true, telegramUser: result.user, linkedProfile: profileData }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: 'Server error' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
