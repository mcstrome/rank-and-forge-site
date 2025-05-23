import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL")!;

serve(async (req) => {
  try {
    const { name, email, phone, message } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    await supabase.from("leads").insert([{ name, email, phone, message }]);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "leads@rankandforge.com",
        to: NOTIFICATION_EMAIL,
        subject: "New Lead Submission",
        html: `<p><strong>Name:</strong> ${name}<br/>
               <strong>Email:</strong> ${email}<br/>
               <strong>Phone:</strong> ${phone || 'N/A'}<br/>
               <strong>Message:</strong> ${message || 'N/A'}</p>`
      })
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});