# Background Removal Guide - Client-Side Approach

## 🎯 The Problem

AI image generators (including Nano Banana) **cannot create true transparent PNGs**. They can only generate images with backgrounds. Adding "transparent background" to the prompt doesn't actually make the background transparent - it just tries to generate a clean background.

## ✅ The Solution

**Two-step process:**
1. **Server-side:** Generate images with **clean white backgrounds**
2. **Client-side:** Remove white pixels using Canvas API (free, fast, no external APIs)

---

## 📝 What Changed

### Server Updates

#### 1. Node.js Server (`src/services/nanoBananaClient.ts`)

**Before:**
```typescript
const enhancedPrompt = `${prompt}, transparent background, PNG, no background, isolated design`;
```

**After:**
```typescript
const enhancedPrompt = `${prompt}, pure white background, clean white background, isolated design on white, no shadows on background, sharp edges`;
```

#### 2. Supabase Edge Function (`supabase/functions/generate-design/index.ts`)

**Before:**
```typescript
const enhancedPrompt = `${prompt}, transparent background, PNG, no background, isolated design`;
const designPrompt = `Create a standalone illustration for t-shirt printing: ${enhancedPrompt}. 

IMPORTANT REQUIREMENTS:
- Transparent/clean background (no t-shirt, no clothing)
...`;
```

**After:**
```typescript
const designPrompt = `Create a standalone illustration for t-shirt printing: ${prompt}. 

IMPORTANT REQUIREMENTS:
- PURE WHITE BACKGROUND (#FFFFFF) - no gradients, no shadows on background
- Clean, isolated design with no background elements
- Design should be clearly separated from the white background
...`;
```

### Key Changes:
- ✅ Removed "transparent background" from prompts
- ✅ Added "pure white background" instructions
- ✅ Emphasized clean separation between design and background
- ✅ Specified no gradients or shadows on background

---

## 🛠️ Client-Side Implementation

### JavaScript/TypeScript Utility

A complete client-side background removal utility is provided in `client-side-bg-removal.ts`:

```typescript
import { removeWhiteBackground } from './client-side-bg-removal';

// Basic usage
const imageUrl = 'https://example.com/design-with-white-bg.png';
const transparentBlob = await removeWhiteBackground(imageUrl);
const transparentUrl = URL.createObjectURL(transparentBlob);

// With options
const transparentBlob = await removeWhiteBackground(imageUrl, {
  threshold: 240,      // How aggressive to remove white (0-255)
  smoothing: 1,        // Edge smoothing (0-10)
  feathering: true,    // Soft edges
  outputFormat: 'image/png',
  quality: 0.95
});
```

### React Hook

```tsx
import { useBackgroundRemoval } from './client-side-bg-removal';

function DesignGenerator() {
  const { removeBackground, isProcessing, error } = useBackgroundRemoval();
  const [transparentImage, setTransparentImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    // 1. Generate image with white background
    const response = await fetch('/api/generate-complete', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'A cosmic astronaut',
        tshirtColor: 'black'
      })
    });
    
    const { data } = await response.json();
    
    // 2. Remove white background client-side
    const blob = await removeBackground(data.logoUrl);
    const url = URL.createObjectURL(blob);
    setTransparentImage(url);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isProcessing}>
        Generate Design
      </button>
      {transparentImage && (
        <img src={transparentImage} alt="Transparent design" />
      )}
    </div>
  );
}
```

### Vanilla JavaScript

```html
<script>
async function removeWhiteBackground(imageUrl, threshold = 240) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Remove white pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(resolve, 'image/png');
    };
    
    img.src = imageUrl;
  });
}

// Usage
const blob = await removeWhiteBackground('https://example.com/image.png');
const url = URL.createObjectURL(blob);
document.getElementById('output').src = url;
</script>
```

---

## 🎨 How It Works

### 1. Threshold-Based Removal

The algorithm checks each pixel's brightness:

```typescript
const brightness = (r + g + b) / 3;
if (brightness > threshold) {
  alpha = 0; // Make transparent
}
```

- **threshold = 240**: Removes very light colors (recommended)
- **threshold = 200**: More aggressive, removes light grays too
- **threshold = 255**: Only removes pure white

### 2. Edge Smoothing

Averages surrounding pixels to reduce jagged edges:

```typescript
for (let dy = -smoothing; dy <= smoothing; dy++) {
  for (let dx = -smoothing; dx <= smoothing; dx++) {
    // Average neighboring pixels
  }
}
```

### 3. Feathering

Creates soft transitions at edges:

```typescript
if (alpha > 0 && alpha < 255) {
  // If next to transparent pixel, reduce alpha
  if (neighborIsTransparent) {
    alpha = alpha * 0.8;
  }
}
```

---

## 📊 Comparison: Client-Side vs API Services

| Feature | Client-Side | Remove.bg API | Clipdrop API |
|---------|------------|---------------|--------------|
| **Cost** | Free | $0.20/image after 50 | Paid plans |
| **Speed** | Instant | 2-5 seconds | 2-5 seconds |
| **Quality** | Good for clean backgrounds | Excellent | Excellent |
| **Complex backgrounds** | Limited | Excellent | Excellent |
| **Privacy** | 100% private | Uploads to API | Uploads to API |
| **Offline** | Works offline | Requires internet | Requires internet |
| **Setup** | Zero config | API key needed | API key needed |

---

## ✅ Advantages of Client-Side Approach

### 1. **Zero Cost**
- No API subscriptions
- No per-image charges
- Unlimited usage

### 2. **Instant Processing**
- No network latency
- No API rate limits
- Works in real-time

### 3. **Privacy**
- Images never leave the browser
- No data sent to third parties
- GDPR/privacy compliant

### 4. **Reliability**
- No API downtime
- No rate limiting
- Works offline

### 5. **Perfect for T-Shirts**
- AI-generated designs have clean backgrounds
- White background is easy to remove
- Results are excellent for print-on-demand

---

## 🎯 When to Use Each Approach

### Use Client-Side (Recommended)
- ✅ AI-generated designs with clean backgrounds
- ✅ T-shirt designs
- ✅ Logos and icons
- ✅ Illustrations with solid colors
- ✅ High-volume applications
- ✅ Privacy-sensitive applications

### Use API Service
- ⚠️ Photos with complex backgrounds
- ⚠️ Hair/fur details
- ⚠️ Semi-transparent objects
- ⚠️ Professional photography
- ⚠️ When quality is critical

---

## 🧪 Testing

### Test the Server

```bash
# Generate image with clean white background
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate-transparent \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A fierce dragon head",
    "width": 1024,
    "height": 1024
  }'
```

The response will include an `image_url` with a clean white background.

### Test Client-Side Removal

```html
<!DOCTYPE html>
<html>
<body>
  <img id="original" src="https://example.com/design.png">
  <img id="transparent">
  
  <script>
    // Use the removeWhiteBackground function
    const blob = await removeWhiteBackground(
      document.getElementById('original').src
    );
    document.getElementById('transparent').src = URL.createObjectURL(blob);
  </script>
</body>
</html>
```

---

## 📚 Files Updated

### Server Code
- ✅ `src/services/nanoBananaClient.ts` - Updated prompt for white backgrounds
- ✅ `supabase/functions/generate-design/index.ts` - Updated Supabase function

### New Files
- ✅ `client-side-bg-removal.ts` - Complete client-side utility
- ✅ `BACKGROUND_REMOVAL_GUIDE.md` - This guide

### Repositories
- ✅ `sontakey/tshirt-image-gen` - Server code updated
- ✅ `sontakey/tshirt-is` - Supabase function updated

---

## 🚀 Deployment

### Server
Already deployed and running:
- **Sandbox:** https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer
- **Production:** Deploy to Vercel (see DEPLOYMENT_QUICKSTART.md)

### Client-Side Utility
Copy `client-side-bg-removal.ts` to your frontend project:

```bash
# React/Next.js project
cp client-side-bg-removal.ts src/utils/

# Import in your components
import { removeWhiteBackground } from '@/utils/client-side-bg-removal';
```

---

## 💡 Tips for Best Results

### 1. Prompt Engineering
```typescript
// Good prompts for clean backgrounds
"A dragon logo"
"Geometric mountain design"
"Abstract wave pattern"

// Avoid prompts that imply backgrounds
"A dragon in a cave" ❌
"Mountains with clouds" ❌
"Ocean waves on a beach" ❌
```

### 2. Threshold Tuning
```typescript
// For designs with very light colors
threshold: 250  // Only removes near-white

// For designs with bold colors
threshold: 240  // Recommended default

// For designs with pastels
threshold: 220  // More conservative
```

### 3. Edge Quality
```typescript
// For pixel art or sharp designs
smoothing: 0, feathering: false

// For organic designs (recommended)
smoothing: 1, feathering: true

// For very soft edges
smoothing: 2, feathering: true
```

---

## 🆘 Troubleshooting

### Issue: Some white parts of design are removed

**Solution:** Lower the threshold
```typescript
const blob = await removeWhiteBackground(imageUrl, { threshold: 220 });
```

### Issue: Background not fully removed

**Solution:** Increase the threshold
```typescript
const blob = await removeWhiteBackground(imageUrl, { threshold: 250 });
```

### Issue: Jagged edges

**Solution:** Enable smoothing and feathering
```typescript
const blob = await removeWhiteBackground(imageUrl, {
  smoothing: 2,
  feathering: true
});
```

### Issue: CORS error

**Solution:** Ensure image has CORS headers or use a proxy
```typescript
img.crossOrigin = 'anonymous';
```

---

## 📖 Summary

**Old Approach (Didn't Work):**
- ❌ Added "transparent background" to prompt
- ❌ AI couldn't actually create transparency
- ❌ Used `sharp.ensureAlpha()` which just added alpha channel

**New Approach (Works!):**
- ✅ Generate with **clean white background**
- ✅ Remove white pixels **client-side** using Canvas API
- ✅ Free, fast, and works perfectly for t-shirt designs

**Result:** True transparent PNGs suitable for any t-shirt color! 🎉
