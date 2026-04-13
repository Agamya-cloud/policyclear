import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const textDecoder = new TextDecoder("utf-8", { fatal: false });
    let rawText = textDecoder.decode(bytes);

    const textMatches = rawText.match(/\(([^)]{2,200})\)/g) || [];
    const extractedParts = textMatches
      .map(m => m.slice(1, -1))
      .filter(s => /[a-zA-Z]/.test(s))
      .join(' ');

    const streamMatches = rawText.match(/BT[\s\S]*?ET/g) || [];
    const streamText = streamMatches
      .join(' ')
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const text = extractedParts || streamText || "Could not extract text from PDF. Please try uploading an image instead.";

    return new Response(JSON.stringify({ text: text.slice(0, 5000) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error), text: "" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
