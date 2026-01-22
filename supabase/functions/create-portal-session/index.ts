import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { createClient } = await import('jsr:@supabase/supabase-js@2');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log(`[create-portal-session] Processing request for user: ${user.id}`);

    const { returnUrl } = await req.json().catch(() => ({}));
    const defaultReturnUrl = `${req.headers.get('origin') || 'https://writestuffassistant.com'}/dashboard`;
    const finalReturnUrl = returnUrl || defaultReturnUrl;

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: subscription, error: subError } = await adminClient
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      throw new Error('Failed to fetch subscription data');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    if (subscription?.stripe_customer_id) {
      console.log(`[create-portal-session] Customer exists: ${subscription.stripe_customer_id}`);

      const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'customer': subscription.stripe_customer_id,
          'return_url': finalReturnUrl,
        }),
      });

      if (!portalResponse.ok) {
        const errorText = await portalResponse.text();
        console.error('Stripe portal error:', errorText);
        throw new Error(`Failed to create portal session: ${errorText}`);
      }

      const portalSession = await portalResponse.json();
      console.log(`[create-portal-session] Portal session created successfully`);

      return new Response(
        JSON.stringify({ url: portalSession.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.log(`[create-portal-session] No customer found, creating checkout session`);

      const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'customer_email': user.email || '',
          'mode': 'subscription',
          'line_items[0][price]': 'price_1RHtBRC8j5ZYmSqnvXQJYGzH',
          'line_items[0][quantity]': '1',
          'subscription_data[trial_period_days]': '0',
          'success_url': `${finalReturnUrl}?session_id={CHECKOUT_SESSION_ID}`,
          'cancel_url': finalReturnUrl,
          'metadata[user_id]': user.id,
          'subscription_data[metadata][user_id]': user.id,
        }),
      });

      if (!checkoutResponse.ok) {
        const errorText = await checkoutResponse.text();
        console.error('Stripe checkout error:', errorText);
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      const checkoutSession = await checkoutResponse.json();
      console.log(`[create-portal-session] Checkout session created successfully`);

      return new Response(
        JSON.stringify({ url: checkoutSession.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('[create-portal-session] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
