# T-Shirt Image Generation API - Curl Commands

Complete curl command reference for testing your API at:
**https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer**

---

## ✅ Working Endpoints (No API Key Required)

### 1. Health Check

Check if the server is running:

```bash
curl https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T22:37:31.201Z",
  "uptime": 2327.704471802
}
```

---

### 2. API Documentation

Get list of all available endpoints:

```bash
curl https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/
```

**Response:**
```json
{
  "name": "tshirt-image-gen",
  "version": "1.0.0",
  "description": "AI image generation server for t-shirt designs (powered by Manus Forge API)",
  "endpoints": {
    "health": "GET /health",
    "generate": "POST /api/generate",
    "generateTransparent": "POST /api/generate-transparent",
    "generateMockup": "POST /api/generate-mockup",
    "generateComplete": "POST /api/generate-complete",
    "generateBatch": "POST /api/generate-batch"
  }
}
```

---

### 3. Error Handling Test

Test input validation (missing prompt):

```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "error": "Missing required field: prompt"
}
```

---

## 🔑 Endpoints Requiring API Key Configuration

These endpoints need `BUILT_IN_FORGE_API_KEY` to be configured in the `.env` file:

### 4. Generate Image

Generate an AI image from a text prompt:

```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating in space",
    "width": 1024,
    "height": 1024,
    "seed": 12345
  }'
```

**Parameters:**
- `prompt` (required): Text description of the image
- `width` (optional): Image width in pixels (default: 1024)
- `height` (optional): Image height in pixels (default: 1024)
- `seed` (optional): Random seed for reproducible results

**Expected Response (when API key is configured):**
```json
{
  "success": true,
  "data": {
    "image_url": "https://...",
    "seed": 12345,
    "prompt": "A cosmic astronaut floating in space"
  }
}
```

---

### 5. Generate Transparent Image

Generate an image with transparent background (perfect for t-shirt designs):

```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate-transparent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A fierce dragon head logo",
    "width": 1024,
    "height": 1024
  }'
```

**Parameters:**
- `prompt` (required): Text description of the design
- `width` (optional): Image width in pixels (default: 1024)
- `height` (optional): Image height in pixels (default: 1024)
- `seed` (optional): Random seed for reproducible results

**Note:** The prompt is automatically enhanced with "transparent background, PNG, no background, isolated design"

**Expected Response (when API key is configured):**
```json
{
  "success": true,
  "data": {
    "image_url": "https://...",
    "seed": 67890,
    "prompt": "A fierce dragon head logo, transparent background, PNG, no background, isolated design"
  }
}
```

---

### 6. Generate T-Shirt Mockup

Compose a design onto a t-shirt mockup:

```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate-mockup \
  -H "Content-Type: application/json" \
  -d '{
    "designUrl": "https://example.com/design.png",
    "tshirtColor": "black",
    "positionTop": 300,
    "positionLeft": 200,
    "designWidth": 800,
    "designHeight": 800
  }' \
  --output mockup.png
```

**Parameters:**
- `designUrl` (required): URL of the design image
- `tshirtColor` (optional): T-shirt color - black, white, navy, gray, red, blue (default: black)
- `positionTop` (optional): Top position in pixels (default: 300)
- `positionLeft` (optional): Left position in pixels (default: centered)
- `designWidth` (optional): Design width in pixels (default: 800)
- `designHeight` (optional): Design height in pixels (default: 800)

**Response:** PNG image file (binary data)

**Note:** Use `--output mockup.png` to save the image to a file

---

### 7. Generate Complete Design (Logo + Mockup)

Generate a transparent logo and compose it onto a t-shirt mockup in one call:

```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating through a nebula",
    "tshirtColor": "black",
    "width": 1024,
    "height": 1024
  }'
```

**Parameters:**
- `prompt` (required): Text description of the design
- `tshirtColor` (optional): T-shirt color - black, white, navy, gray, red, blue (default: black)
- `width` (optional): Logo width in pixels (default: 1024)
- `height` (optional): Logo height in pixels (default: 1024)

**Expected Response (when API key is configured):**
```json
{
  "success": true,
  "data": {
    "logoUrl": "https://...",
    "imageUrl": "data:image/png;base64,...",
    "prompt": "A cosmic astronaut floating through a nebula",
    "seed": 54321
  }
}
```

**Note:** `imageUrl` is a base64-encoded PNG that can be used directly in HTML `<img>` tags

---

### 8. Batch Generate Images

Generate multiple images from different prompts in parallel:

```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": [
      "A mountain landscape",
      "A city skyline at sunset",
      "An ocean wave"
    ],
    "width": 1024,
    "height": 1024
  }'
```

**Parameters:**
- `prompts` (required): Array of text descriptions
- `width` (optional): Image width in pixels (default: 1024)
- `height` (optional): Image height in pixels (default: 1024)

**Expected Response (when API key is configured):**
```json
{
  "success": true,
  "data": [
    {
      "image_url": "https://...",
      "seed": 11111,
      "prompt": "A mountain landscape"
    },
    {
      "image_url": "https://...",
      "seed": 22222,
      "prompt": "A city skyline at sunset"
    },
    {
      "image_url": "https://...",
      "seed": 33333,
      "prompt": "An ocean wave"
    }
  ],
  "count": 3
}
```

---

## 🎨 T-Shirt Color Options

Supported colors for mockup generation:
- `black` (default)
- `white`
- `navy`
- `gray`
- `red`
- `blue`

---

## 📊 Design Placement Configuration

Default values for t-shirt mockup composition:
- **Canvas Size:** 1200x1600px
- **Design Size:** 800x800px
- **Position Top:** 300px
- **Position Left:** Centered (200px)

These follow industry standards similar to Printful API.

---

## 🔧 Testing with Pretty Output

Add `| python3 -m json.tool` or `| jq` for formatted JSON:

```bash
curl -s https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/health | python3 -m json.tool
```

Or with jq:
```bash
curl -s https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/health | jq
```

---

## 📝 Save Response to File

Save JSON response:
```bash
curl -s https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/health > response.json
```

Save image response:
```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate-mockup \
  -H "Content-Type: application/json" \
  -d '{"designUrl": "https://example.com/design.png"}' \
  --output mockup.png
```

---

## 🚨 Current Status

**Server Status:** ✅ Online and Running

**Working Endpoints:**
- ✅ Health check
- ✅ API documentation
- ✅ Input validation

**Requires Configuration:**
- ⚠️ Image generation endpoints (need `BUILT_IN_FORGE_API_KEY`)

**Error Message:**
```
"Image generation error: undefined - getaddrinfo ENOTFOUND forge-api.manus.ai"
```

This means the Forge API key is not configured. To enable image generation:

1. Add `BUILT_IN_FORGE_API_KEY` to `.env` file
2. Restart the server: `pm2 restart tshirt-image-gen`

---

## 🔄 Testing After Deployment

Once deployed to Vercel with environment variables configured, replace the URL:

```bash
# Instead of:
https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer

# Use:
https://gen.tshirt.is

# Or Vercel URL:
https://tshirt-image-gen-[random].vercel.app
```

Example:
```bash
curl https://gen.tshirt.is/health
```

---

## 📚 Quick Reference

| Endpoint | Method | Requires API Key | Response Type |
|----------|--------|------------------|---------------|
| `/health` | GET | No | JSON |
| `/` | GET | No | JSON |
| `/api/generate` | POST | Yes | JSON |
| `/api/generate-transparent` | POST | Yes | JSON |
| `/api/generate-mockup` | POST | No* | PNG Image |
| `/api/generate-complete` | POST | Yes | JSON |
| `/api/generate-batch` | POST | Yes | JSON |

*`/api/generate-mockup` doesn't require API key if you provide a `designUrl`, but the design must already exist.

---

## 🎯 Complete Test Script

Save this as `test-all-endpoints.sh`:

```bash
#!/bin/bash

BASE_URL="https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer"

echo "Testing T-Shirt Image Generation API"
echo "====================================="
echo ""

echo "1. Health Check"
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""

echo "2. API Documentation"
curl -s "$BASE_URL/" | python3 -m json.tool
echo ""

echo "3. Error Handling (Missing Prompt)"
curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool
echo ""

echo "4. Generate Image (Requires API Key)"
curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cosmic astronaut", "width": 512, "height": 512}' | python3 -m json.tool
echo ""

echo "====================================="
echo "Test Complete"
```

Run with:
```bash
chmod +x test-all-endpoints.sh
./test-all-endpoints.sh
```

---

**API is ready for testing!** Configure the Forge API key to enable image generation features.
