# T-Shirt Image Generation Server

AI-powered image generation server for t-shirt designs. Integrates with Nano Banana API and can be called by Supabase Edge Functions.

## Features

- Generate AI images from text prompts
- Create transparent PNG designs for print-on-demand
- Compose designs onto t-shirt mockups
- Batch generate multiple images
- RESTful API for easy integration

## API Endpoints

### Health Check
```
GET /health
```

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
Body: { "designUrl": "string", "tshirtColor": "black|white|navy" }
```

### Generate Complete Design
```
POST /api/generate-complete
Body: { "prompt": "string", "tshirtColor": "black|white|navy" }
```

### Batch Generate
```
POST /api/generate-batch
Body: { "prompts": ["string"], "width": number, "height": number }
```

## Integration with Supabase

Call this server from Supabase Edge Functions:

```typescript
const response = await fetch('https://your-server-url/api/generate-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A cosmic astronaut',
    tshirtColor: 'black'
  })
});
```

## Deployment

This server is deployed on Manus and can be called via HTTPS.

**Server URL:** Will be provided after deployment

## Environment Variables

- `NANO_BANANA_API_KEY` - Your Nano Banana API key (required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Support

For issues or questions, refer to the documentation or contact support.
