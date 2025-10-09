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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, email, trial_days = 30, has_trial_ended = false } = await req.json()

    if (!user_id || !email) {
      throw new Error('Missing required fields: user_id and email')
    }

    // Create Stripe customer and subscription with trial
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'customer_email': email,
        'mode': 'subscription',
        'line_items[0][price]': 'price_1RHtBRC8j5ZYmSqnvXQJYGzH', // Your monthly price ID
        'line_items[0][quantity]': '1',
        'subscription_data[trial_period_days]': has_trial_ended ? '0' : trial_days.toString(),
        'success_url': `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${req.headers.get('origin')}/dashboard`,
        'metadata[user_id]': user_id,
        'subscription_data[metadata][user_id]': user_id,
      }),
    })

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text()
      throw new Error(`Stripe API error: ${errorText}`)
    }

    const session = await stripeResponse.json()

    // Update user subscription record with trial info
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + (has_trial_ended ? 0 : trial_days))

    const { error: updateError } = await supabaseClient
      .from('user_subscriptions')
      .update({
        trial_end_date: has_trial_ended ? null : trialEndDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
    }

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})