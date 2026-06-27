// supabase/functions/subscription-reminders/index.ts
// Checks for upcoming subscription expiries and sends reminders

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Inlined shared code ---
function createSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
// ---------------------------

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createSupabaseClient();

  try {
    // Get all users with subscription_expires_at set
    const { data: profiles, error: fetchError } = await supabase
      .from("profiles")
      .select("id, full_name, email, subscription_expires_at");

    if (fetchError) throw fetchError;

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({
          status: "success",
          summary: "No profiles with subscriptions found.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reminderDays = [7, 5, 3, 2, 1];
    const today = new Date();
    const actionsTaken: string[] = [];

    for (const profile of profiles) {
      if (!profile.subscription_expires_at) continue;

      const expiryDate = new Date(profile.subscription_expires_at);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if we need to send a reminder for any of the reminder days
      for (const days of reminderDays) {
        if (daysUntilExpiry === days) {
          // Check if we've already sent this reminder
          const { data: existingReminder } = await supabase
            .from("subscription_reminders")
            .select("id")
            .eq("profile_id", profile.id)
            .eq("reminder_days", days)
            .maybeSingle();

          if (!existingReminder) {
            // Send reminder (in a real app, you'd use an email service like Resend, SendGrid, etc.
            console.log(`Sending ${days} day reminder to ${profile.email} (${profile.full_name})`);

            // For now, let's just log it and save that we sent it
            const { error: insertError } = await supabase
              .from("subscription_reminders")
              .insert({
                profile_id: profile.id,
                reminder_days: days,
              });

            if (insertError) {
              console.error("Error inserting reminder:", insertError);
            } else {
              actionsTaken.push(`Sent ${days} day reminder to ${profile.email}`);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        summary: `Processed ${profiles.length} profiles. ${actionsTaken.length} reminders sent/queued.`,
        actionsTaken: actionsTaken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: (error as Error).message,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
