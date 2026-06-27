import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { email, amount, currency = "NGN", plan_name, billing_cycle, user_type, credits_awarded } = await req.json();
    if (!email || !amount || !plan_name || !billing_cycle || !user_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (email, amount, plan_name, billing_cycle, user_type)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Convert amount to kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(amount * 100);

    const callbackUrl = new URL("/payment/callback", req.headers.get("Referer") || req.headers.get("Origin") || "http://localhost:5173").toString();

    const initializeResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        currency,
        callback_url: callbackUrl,
        metadata: {
          user_id: user.id,
          plan_name,
          billing_cycle,
          user_type,
          credits_awarded,
        },
      }),
    });

    const initializeData = await initializeResponse.json();

    if (!initializeResponse.ok) {
      console.error("Paystack initialize error:", initializeData);
      return new Response(
        JSON.stringify({ error: "Failed to initialize payment", details: initializeData }),
        {
          status: initializeResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        authorization_url: initializeData.data.authorization_url,
        reference: initializeData.data.reference,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in paystack-initialize:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
