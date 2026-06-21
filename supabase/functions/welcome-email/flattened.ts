// Welcome Email - Flattened for Supabase Edge Function
// Copy-paste directly into Supabase Edge Functions Editor
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

  try {
    const payload = await req.json();
    const record = payload.record;
    const companyId = record.id;
    const companyName = record.name || "New Company";
    const businessId = record.business_id;

    if (!companyId) {
      return new Response(
        JSON.stringify({
          status: "error",
          summary: "No company ID found in payload.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const draft = `Welcome to our platform, ${companyName}!

We're excited to have you on board. Here's what you need to know to get started:

1. Complete your profile setup
2. Invite your team members
3. Explore our documentation
4. Schedule your onboarding call

If you have any questions, our support team is here to help. We look forward to a successful partnership!

Best regards,
The Team`;

    const { error: insertError } = await supabase
      .from("company_messages")
      .insert({
        business_id: businessId,
        company_id: companyId,
        kind: "welcome_email",
        message_text: draft,
        status: "pending_review",
      });

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from("crm_companies")
      .update({ welcome_sent_at: new Date().toISOString() })
      .eq("id", companyId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        status: "success",
        summary: `Welcome email drafted for ${companyName}.`,
        actionsTaken: [`Welcome email drafted for: ${companyName}`],
        artifact: { companyName },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
