// This file should be placed at: supabase/functions/generate-design/index.ts
// Deploy with: supabase functions deploy generate-design

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get the image generation server URL from environment
const IMAGE_GEN_SERVER_URL = Deno.env.get("IMAGE_GEN_SERVER_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!IMAGE_GEN_SERVER_URL) {
  throw new Error("IMAGE_GEN_SERVER_URL environment variable is not set");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface GenerateDesignRequest {
  prompt: string;
  tshirtColor?: string;
  userId?: number;
}

interface GenerateDesignResponse {
  success: boolean;
  design?: {
    id: number;
    prompt: string;
    imageUrl: string;
    logoUrl: string;
    slug: string;
    creatorId: number;
    creatorName: string;
  };
  error?: string;
}

serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body: GenerateDesignRequest = await req.json();
    const { prompt, tshirtColor = "black", userId } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating design for prompt: "${prompt}"`);

    // Call image generation server
    const generateResponse = await fetch(
      `${IMAGE_GEN_SERVER_URL}/api/generate-complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          tshirtColor,
        }),
      }
    );

    if (!generateResponse.ok) {
      const error = await generateResponse.text();
      console.error(`Image generation failed: ${error}`);
      return new Response(
        JSON.stringify({
          error: "Failed to generate image",
          details: error,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const generatedData = await generateResponse.json();

    if (!generatedData.success) {
      return new Response(
        JSON.stringify({
          error: "Image generation failed",
          details: generatedData.error,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate slug from prompt
    const slug = generateSlug(prompt);

    // Get creator info
    let creatorId = 1;
    let creatorName = "tshirt.is";

    if (userId) {
      const { data: user } = await supabase
        .from("users")
        .select("id, name")
        .eq("id", userId)
        .single();

      if (user) {
        creatorId = user.id;
        creatorName = user.name || "User";
      }
    }

    // Save design to database
    const { data: design, error: dbError } = await supabase
      .from("designs")
      .insert({
        prompt,
        image_url: generatedData.data.imageUrl,
        logo_url: generatedData.data.logoUrl,
        slug,
        creator_id: creatorId,
        creator_name: creatorName,
        is_public: true,
        is_featured: false,
        position_width: 1200,
        position_height: 1200,
        position_top: 100,
        position_left: 300,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to save design",
          details: dbError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success response
    const response: GenerateDesignResponse = {
      success: true,
      design: {
        id: design.id,
        prompt: design.prompt,
        imageUrl: design.image_url,
        logoUrl: design.logo_url,
        slug: design.slug,
        creatorId: design.creator_id,
        creatorName: design.creator_name,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * Generate a URL-friendly slug from a prompt
 */
function generateSlug(prompt: string): string {
  // Take first 5-6 words, convert to lowercase, replace spaces with hyphens
  const words = prompt.split(" ").slice(0, 6);
  const slug = words.join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");

  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${suffix}`;
}
