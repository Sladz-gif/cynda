import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

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

    // Get the raw body
    const rawBody = await req.text();
    const paystackSignature = req.headers.get("x-paystack-signature");

    if (!paystackSignature) {
      console.warn("No x-paystack-signature header found");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the signature
    const encoder = new TextEncoder();
    const key = encoder.encode(PAYSTACK_SECRET_KEY);
    const data = encoder.encode(rawBody);
    const computedHash = await crypto.subtle.sign("HMAC", key, data);
    const computedHashHex = encodeHex(new Uint8Array(computedHash));

    if (computedHashHex !== paystackSignature) {
      console.warn("Invalid Paystack signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the event
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log("Received Paystack webhook event:", eventType);

    // Handle charge.success event
    if (eventType === "charge.success") {
      const transactionData = event.data;
      const reference = transactionData.reference;
      const metadata = transactionData.metadata || {};
      const userId = metadata.user_id;

      if (!userId) {
        console.warn("No user_id found in metadata");
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if transaction already exists
      const { data: existingTransaction } = await supabaseClient
        .from("transactions")
        .select("id")
        .eq("paystack_reference", reference)
        .single();

      if (existingTransaction) {
        console.log("Transaction already processed via webhook or callback");
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract plan info from metadata
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
        .eq("id", userId);

      // Save transaction to DB
      await supabaseClient
        .from("transactions")
        .insert({
          profile_id: userId,
          paystack_reference: reference,
          amount: transactionData.amount / 100, // Convert kobo back
          currency: transactionData.currency,
          plan_name: planName,
          billing_cycle: billingCycle,
          credits_awarded: creditsAwarded,
          status: "success",
        });

      console.log("Processed charge.success via webhook for user:", userId);
    }

    // Always return 200 OK to Paystack
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to prevent Paystack from retrying excessively, but log the error
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
