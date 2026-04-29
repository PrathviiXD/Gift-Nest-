import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RecommendationRequest {
  query: string;
  occasion?: string;
  budget?: number;
}

interface GrokMessage {
  role: "user" | "assistant";
  content: string;
}

async function callGrokAPI(messages: GrokMessage[], apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Grok API call failed:", error);
    throw error;
  }
}

function buildRecommendationPrompt(query: string, occasion?: string, budget?: number): string {
  let prompt = `You are a luxury gift recommendation expert specializing in Indian artisanal and handcrafted gifts.
Based on the customer's request, provide personalized gift recommendations.

Customer Request: ${query}`;

  if (occasion) {
    prompt += `\nOccasion: ${occasion}`;
  }
  if (budget) {
    prompt += `\nBudget: ₹${budget}`;
  }

  prompt += `

Available Gift Categories:
- Home Decor (pottery, vases, decorative pieces)
- Jewelry & Boxes (wooden jewelry boxes, ornate storage)
- Candles & Fragrances (soy wax, aromatherapy)
- Textiles (silk scarves, block prints)
- Gift Hampers (curated luxury sets)
- Art & Figurines (brass, traditional pieces)
- Stationery (leather journals, notebooks)
- Wellness (diffusers, aromatherapy sets)

Provide 3-4 specific gift recommendations with:
1. Product name and category
2. Price range (in INR)
3. Why it's perfect for the occasion/person
4. Key features and appeal

Keep recommendations culturally thoughtful and artisanal in nature. Focus on gifts that tell a story and celebrate Indian craftsmanship.`;

  return prompt;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GROK_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROK_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: RecommendationRequest = await req.json();
    const { query, occasion, budget } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = buildRecommendationPrompt(query, occasion, budget);
    const messages: GrokMessage[] = [
      {
        role: "user",
        content: systemPrompt,
      },
    ];

    const recommendation = await callGrokAPI(messages, apiKey);

    return new Response(
      JSON.stringify({
        success: true,
        recommendation: recommendation,
        query: query,
        occasion: occasion,
        budget: budget,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in grok-recommendations:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
