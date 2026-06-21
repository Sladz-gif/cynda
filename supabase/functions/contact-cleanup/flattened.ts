// Contact Cleanup - Flattened for Supabase Edge Function
// Copy-paste directly into Supabase Edge Functions Editor
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function cleanName(name: string): string {
  return name.trim().split(" ").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ");
}

function cleanPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone.trim();
}

function cleanCompany(company: string): string {
  return company.trim().split(" ").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ");
}

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

  try {
    const { data: contacts, error: fetchError } = await supabase
      .from("crm_contacts")
      .select("id, name, email, phone, company, business_id");

    if (fetchError) throw fetchError;

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({
          status: "success",
          summary: "No contacts to clean.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let cleanedCount = 0;
    const cleanedNames: string[] = [];

    for (const contact of contacts) {
      const updates: Record<string, any> = {};

      if (contact.name) {
        updates.name = cleanName(contact.name);
      }

      if (contact.email) {
        updates.email = contact.email.toLowerCase().trim();
      }

      if (contact.phone) {
        updates.phone = cleanPhone(contact.phone);
      }

      if (contact.company) {
        updates.company = cleanCompany(contact.company);
      }

      if (Object.keys(updates).length > 0) {
        updates.last_cleaned_at = new Date().toISOString();
        const { error: updateError } = await supabase
          .from("crm_contacts")
          .update(updates)
          .eq("id", contact.id);

        if (updateError) throw updateError;
        cleanedCount++;
        if (contact.name) cleanedNames.push(contact.name);
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        summary: `Cleaned ${cleanedCount} contact records.`,
        actionsTaken: cleanedNames.map(name => `Cleaned contact: ${name}`),
        artifact: { cleanedCount },
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
