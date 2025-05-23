import { createClient } from "@supabase/supabase-js";

export async function onRequest(context: { 
  request: Request, 
  env: { 
    SUPABASE_URL: string, 
    SUPABASE_ANON_KEY: string, 
    RESEND_API_KEY: string, 
    NOTIFICATION_EMAIL: string 
  } 
}) {
  try {
    const SUPABASE_URL = context.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = context.env.SUPABASE_ANON_KEY;
    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const NOTIFICATION_EMAIL = context.env.NOTIFICATION_EMAIL;
    
    const req = context.request;
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
}