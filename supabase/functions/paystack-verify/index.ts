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

    const { reference } = await req.json();
    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Missing reference" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // First check if transaction already processed in our DB
    const { data: existingTransaction } = await supabaseClient
      .from("transactions")
      .select("id")
      .eq("paystack_reference", reference)
      .single();

    if (existingTransaction) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Transaction already processed",
          transaction: existingTransaction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error("Paystack verify error:", verifyData);
      return new Response(
        JSON.stringify({ error: "Failed to verify transaction", details: verifyData }),
        {
          status: verifyResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const transactionData = verifyData.data;
    if (transactionData.status !== "success") {
      return new Response(
        JSON.stringify({
          error: "Payment not successful",
          paystackStatus: transactionData.status,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract metadata
    const metadata = transactionData.metadata || {};
    const planName = metadata.plan_name || "Unknown Plan";
    const billingCycle = metadata.billing_cycle || "Monthly";
    const userType = metadata.user_type || "solo";
    const creditsAwarded = metadata.credits_awarded || 0;

    // Calculate subscription expiry
    const now = new Date();
    const subscriptionExpiresAt = billingCycle === "Annual"
      ? new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
      : new Date(now.setMonth(now.getMonth() + 1)).toISOString();

    // Update user profile
    await supabaseClient
      .from("profiles")
      .update({
        subscription_tier: "paid",
        user_type: userType,
        subscription_expires_at: subscriptionExpiresAt,
      })
      .eq("id", user.id);

    // Save transaction to DB
    const { data: transactionRecord, error: txError } = await supabaseClient
      .from("transactions")
      .insert({
        profile_id: user.id,
        paystack_reference: reference,
        amount: transactionData.amount / 100, // Convert kobo back to main currency
        currency: transactionData.currency,
        plan_name: planName,
        billing_cycle: billingCycle,
        credits_awarded: creditsAwarded,
        status: "success",
      })
      .select()
      .single();

    if (txError) {
      console.error("Error saving transaction:", txError);
      return new Response(
        JSON.stringify({ error: "Failed to save transaction", details: txError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction: transactionRecord,
        subscription_expires_at: subscriptionExpiresAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in paystack-verify:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
