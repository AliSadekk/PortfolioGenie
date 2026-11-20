// hello-world Edge Function: first pair test for members C and D.
// Checks that deploy, secrets, CORS and login protection work. Never returns the secret itself.
// JWT verification stays on (Supabase default): calls without a valid user token get 401 from the gateway.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // true only if `supabase secrets set TEST_SECRET=...` was run.
  const secretIsSet = Boolean(Deno.env.get('TEST_SECRET'));

  return new Response(
    JSON.stringify({ message: 'Hello from Supabase Edge Functions!', secretIsSet }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
