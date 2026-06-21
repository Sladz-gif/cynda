// Contact Birthday - Flattened for Supabase Edge Function
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
      Deno.env.get("URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? "",
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data: birthdayContacts, error: fetchError } = await supabase
      .from("crm_contacts")
      .select("id, name, email, business_id")
      .eq("birthday", today)
      .is("birthday_sent_at", null);

    if (fetchError) throw fetchError;

    if (!birthdayContacts || birthdayContacts.length === 0) {
      return new Response(
        JSON.stringify({
          status: "success",
          summary: "No birthdays today.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sent: string[] = [];

    for (const contact of birthdayContacts) {
      const draft = `Happy Birthday, ${contact.name}! 🎉 Wishing you a wonderful day and a fantastic year ahead from the entire team.`;

      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert({
          business_id: contact.business_id,
          contact_id: contact.id,
          kind: "birthday_greeting",
          message_text: draft,
          status: "pending_review",
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("crm_contacts")
        .update({ birthday_sent_at: new Date().toISOString() })
        .eq("id", contact.id);

      if (updateError) throw updateError;

      sent.push(contact.name);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        summary: `Sent ${sent.length} birthday greeting(s).`,
        actionsTaken: sent.map((name) => `Birthday message sent to: ${name}`),
        artifact: { contactNames: sent },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
