# Deploying Image Generation Server on Manus

Complete guide to deploy the t-shirt image generation server on Manus and integrate with Supabase Edge Functions.

## Architecture

```
┌─────────────────────────────────────┐
│  Your T-Shirt App (tshirt-is)       │
│  - Frontend (React)                 │
│  - Supabase Database                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Supabase Edge Function             │
│  (generate-design)                  │
└────────────┬────────────────────────┘
             │ HTTP POST
             ▼
┌─────────────────────────────────────┐
│  Image Generation Server (Manus)    │
│  - Node.js/Express                  │
│  - Manus Forge API Integration      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Manus Forge API                    │
│  - Image Generation                 │
│  - Storage                          │
│  - Notifications                    │
└─────────────────────────────────────┘
```

## Step 1: Create Manus Web Project

### Option A: Using Manus Dashboard (Recommended)

1. Go to https://manus.im
2. Create a new Web Project
3. Choose **"Node.js + Express"** template
4. Name it: `tshirt-image-gen`
5. Click Create

### Option B: Using Manus CLI

```bash
manus create tshirt-image-gen --template node-express
```

## Step 2: Deploy Server Code

### 1. Copy Project Files

Copy all files from `tshirt-image-gen-deploy` to your Manus project:

```bash
# If using Manus Dashboard:
# - Upload the src/ directory
# - Upload package.json
# - Upload tsconfig.json

# If using Git:
git clone <your-manus-repo>
cd tshirt-image-gen
cp -r ../tshirt-image-gen-deploy/src .
cp ../tshirt-image-gen-deploy/package.json .
cp ../tshirt-image-gen-deploy/tsconfig.json .
git add .
git commit -m "Add image generation server"
git push
```

### 2. Build Configuration

The server will automatically:
- Install dependencies from `package.json`
- Build TypeScript with `pnpm build`
- Start with `pnpm start`

### 3. Environment Variables

Manus automatically provides these variables:
- `BUILT_IN_FORGE_API_KEY` - Manus API key
- `BUILT_IN_FORGE_API_URL` - Manus API URL

No additional configuration needed!

## Step 3: Verify Deployment

Once deployed, your server will have a public URL like:
```
https://tshirt-image-gen-xxxxx.manus.space
```

### Test Health Endpoint

```bash
curl https://tshirt-image-gen-xxxxx.manus.space/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-29T16:30:00.000Z",
  "uptime": 123.456
}
```

### Test Image Generation

```bash
curl -X POST https://tshirt-image-gen-xxxxx.manus.space/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating through a nebula",
    "width": 1024,
    "height": 1024
  }'
```

## Step 4: Supabase Edge Function Integration

### 1. Update Edge Function

Replace the content of `supabase/functions/generate-design/index.ts`:

```typescript
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
    const { prompt, tshirtColor = "black" } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating design for prompt: "${prompt}"`);

    // Call the image generation server
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

    // Save design to database
    const { data: design, error: dbError } = await supabase
      .from("designs")
      .insert({
        prompt,
        image_url: generatedData.data.imageUrl,
        logo_url: generatedData.data.logoUrl,
        slug,
        creator_id: 1,
        creator_name: "tshirt.is",
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

    return new Response(JSON.stringify({
      success: true,
      design: {
        id: design.id,
        prompt: design.prompt,
        imageUrl: design.image_url,
        logoUrl: design.logo_url,
        slug: design.slug,
      },
    }), {
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

function generateSlug(prompt: string): string {
  const words = prompt.split(" ").slice(0, 6);
  const slug = words.join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${suffix}`;
}
```

### 2. Set Supabase Secret

In your Supabase project dashboard:

1. Go to **Settings → Secrets**
2. Create new secret: `IMAGE_GEN_SERVER_URL`
3. Value: `https://tshirt-image-gen-xxxxx.manus.space`
   (Replace with your actual Manus server URL)

### 3. Deploy Edge Function

```bash
supabase functions deploy generate-design
```

### 4. Test Edge Function

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-design \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating through a nebula",
    "tshirtColor": "black"
  }'
```

## Step 5: Frontend Integration

### Call from React Component

```typescript
import { useState } from 'react';

export function GenerateDesignForm() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://your-project.supabase.co/functions/v1/generate-design',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            tshirtColor: 'black',
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setDesign(data.design);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your t-shirt design..."
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Design'}
      </button>
      {design && (
        <div>
          <img src={design.imageUrl} alt="Generated design" />
          <p>Design ID: {design.id}</p>
        </div>
      )}
    </div>
  );
}
```

## API Endpoints Reference

### Generate Single Image
```
POST /api/generate
Body: { "prompt": "string", "width": number, "height": number }
```

### Generate Transparent Image
```
POST /api/generate-transparent
Body: { "prompt": "string", "width": number, "height": number }
```

### Generate T-Shirt Mockup
```
POST /api/generate-mockup
Body: { 
  "designUrl": "string", 
  "tshirtColor": "black|white|navy",
  "positionTop": number,
  "designWidth": number,
  "designHeight": number
}
```

### Generate Complete Design (Logo + Mockup)
```
POST /api/generate-complete
Body: { "prompt": "string", "tshirtColor": "black|white|navy" }
Response: { 
  "success": true,
  "data": {
    "logoUrl": "string",
    "imageUrl": "string (base64)",
    "prompt": "string",
    "seed": number
  }
}
```

### Batch Generate
```
POST /api/generate-batch
Body: { "prompts": ["string"], "width": number, "height": number }
```

## Troubleshooting

### "IMAGE_GEN_SERVER_URL is not set"

Make sure you've set the Supabase secret:
```bash
supabase secrets set IMAGE_GEN_SERVER_URL=https://your-manus-url
```

### "Connection timeout"

- Check Manus server is running: `curl https://your-server/health`
- Check firewall/CORS settings
- Increase timeout in Edge Function

### "Image generation failed"

- Check Manus Forge API is available
- Check server logs in Manus dashboard
- Verify prompt is not empty

### "Database error"

- Check Supabase database connection
- Verify `designs` table exists
- Check table schema matches

## Monitoring

### Manus Dashboard

1. Go to your Manus project
2. View **Logs** to see server output
3. Monitor **Performance** metrics
4. Check **Health** status

### Supabase Dashboard

1. Go to **Functions** → **generate-design**
2. View **Logs** for Edge Function execution
3. Monitor **Invocations** count

## Performance Tips

1. **Cache Generated Images**
   - Store images in Supabase Storage
   - Reuse for similar prompts

2. **Batch Processing**
   - Generate multiple designs at once
   - Use `/api/generate-batch` endpoint

3. **Optimize Image Size**
   - Use smaller dimensions for faster generation
   - Default: 1024x1024 (adjust as needed)

4. **Monitor Usage**
   - Track API calls
   - Monitor Manus Forge API quota
   - Set up alerts for errors

## Security

1. **CORS Configuration**
   - Server allows all origins (for Supabase)
   - Restrict in production if needed

2. **Rate Limiting**
   - Implement in production
   - Prevent abuse

3. **Input Validation**
   - Validate prompt length
   - Check image dimensions
   - Sanitize user input

## Next Steps

1. ✅ Deploy server on Manus
2. ✅ Configure Supabase Edge Function
3. ✅ Test end-to-end flow
4. ✅ Integrate with frontend
5. ✅ Monitor and optimize
6. ✅ Scale as needed

## Support

For issues:
1. Check Manus server logs
2. Check Supabase Edge Function logs
3. Test endpoints with curl
4. Verify environment variables
5. Check network connectivity

---

**You're all set!** 🚀

Your image generation server is now integrated with Supabase and ready to generate AI t-shirt designs on demand.
