# T-Shirt Image Generation Server - Deployment Guide

## Overview

This is a Node.js + Express API server for generating AI-powered t-shirt designs. The server integrates with the Manus Forge API to generate transparent PNG designs and compose them onto t-shirt mockups.

## Features

- **AI Image Generation**: Generate images from text prompts using Manus Forge API
- **Transparent Design Creation**: Automatically create transparent PNG designs suitable for print-on-demand
- **T-Shirt Mockup Composition**: Compose designs onto t-shirt mockups with customizable colors and positioning
- **Batch Processing**: Generate multiple images in parallel
- **RESTful API**: Easy-to-integrate API endpoints

## Project Structure

```
tshirt-image-gen/
├── src/
│   ├── index.ts                    # Main Express server
│   └── services/
│       ├── nanoBananaClient.ts     # Image generation client
│       └── imageComposer.ts        # Image composition service
├── dist/                           # Compiled JavaScript (generated)
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── .env                            # Environment variables
└── README.md                       # Project documentation
```

## Prerequisites

- Node.js 22.13.0 or higher
- pnpm package manager
- Manus Forge API credentials

## Installation

### 1. Install Dependencies

```bash
cd /home/ubuntu/tshirt-image-gen
pnpm install
```

### 2. Configure Environment Variables

Edit the `.env` file and add your Manus Forge API credentials:

```env
# Manus Forge API Configuration
BUILT_IN_FORGE_API_KEY=your_actual_api_key_here
BUILT_IN_FORGE_API_URL=https://forge-api.manus.ai

# Server Configuration
PORT=3001
NODE_ENV=production
```

### 3. Build the Project

```bash
pnpm build
```

### 4. Start the Server

```bash
pnpm start
```

For development with auto-reload:

```bash
pnpm dev
```

## API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T21:54:51.120Z",
  "uptime": 35.303784728
}
```

### Generate Image
```http
POST /api/generate
Content-Type: application/json

{
  "prompt": "A cosmic astronaut floating in space",
  "width": 1024,
  "height": 1024,
  "seed": 12345
}
```

**Response:**
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

### Generate Transparent Image
```http
POST /api/generate-transparent
Content-Type: application/json

{
  "prompt": "A cool dragon logo",
  "width": 1024,
  "height": 1024
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "image_url": "https://...",
    "seed": 67890,
    "prompt": "A cool dragon logo, transparent background, PNG, no background, isolated design"
  }
}
```

### Generate T-Shirt Mockup
```http
POST /api/generate-mockup
Content-Type: application/json

{
  "designUrl": "https://example.com/design.png",
  "tshirtColor": "black",
  "positionTop": 300,
  "positionLeft": 200,
  "designWidth": 800,
  "designHeight": 800
}
```

**Response:** PNG image buffer

### Generate Complete Design (Logo + Mockup)
```http
POST /api/generate-complete
Content-Type: application/json

{
  "prompt": "A fierce tiger head",
  "tshirtColor": "white",
  "width": 1024,
  "height": 1024
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logoUrl": "https://...",
    "imageUrl": "data:image/png;base64,...",
    "prompt": "A fierce tiger head",
    "seed": 54321
  }
}
```

### Batch Generate
```http
POST /api/generate-batch
Content-Type: application/json

{
  "prompts": [
    "A mountain landscape",
    "A city skyline",
    "An ocean sunset"
  ],
  "width": 1024,
  "height": 1024
}
```

**Response:**
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
      "prompt": "A city skyline"
    },
    {
      "image_url": "https://...",
      "seed": 33333,
      "prompt": "An ocean sunset"
    }
  ],
  "count": 3
}
```

## T-Shirt Colors

Supported t-shirt colors for mockup generation:
- `black` (default)
- `white`
- `navy`
- `gray`
- `red`
- `blue`

## Design Placement Configuration

The mockup generation follows industry standards for design placement:

- **Default Position**: Top: 300px, Left: centered
- **Default Design Size**: 800x800px
- **Canvas Size**: 1200x1600px

You can customize these values using the optional parameters in the `/api/generate-mockup` endpoint.

## Integration Examples

### JavaScript/TypeScript
```typescript
const response = await fetch('http://localhost:3001/api/generate-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A cosmic astronaut',
    tshirtColor: 'black'
  })
});

const result = await response.json();
console.log(result.data.logoUrl);
console.log(result.data.imageUrl);
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3001/api/generate-complete',
    json={
        'prompt': 'A cosmic astronaut',
        'tshirtColor': 'black'
    }
)

result = response.json()
print(result['data']['logoUrl'])
print(result['data']['imageUrl'])
```

### cURL
```bash
curl -X POST http://localhost:3001/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut",
    "tshirtColor": "black"
  }'
```

## Deployment Options

### Option 1: Local Development
```bash
pnpm dev
```
Access at: `http://localhost:3001`

### Option 2: Production Server
```bash
pnpm build
pnpm start
```

### Option 3: Process Manager (PM2)
```bash
npm install -g pm2
pm2 start dist/index.js --name tshirt-image-gen
pm2 save
pm2 startup
```

### Option 4: Docker
Create a `Dockerfile`:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3001
CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t tshirt-image-gen .
docker run -p 3001:3001 --env-file .env tshirt-image-gen
```

## Troubleshooting

### Issue: "BUILT_IN_FORGE_API_KEY environment variable is not set"
**Solution:** Make sure you've created a `.env` file with valid API credentials.

### Issue: Sharp installation errors
**Solution:** Run `pnpm approve-builds` and select both `esbuild` and `sharp` to allow build scripts.

### Issue: Port already in use
**Solution:** Change the `PORT` in `.env` or kill the process using the port:
```bash
lsof -ti:3001 | xargs kill -9
```

### Issue: Image generation fails
**Solution:** Verify your Manus Forge API key is valid and has sufficient credits.

## Performance Considerations

- **Image Generation**: Typically takes 5-15 seconds depending on complexity
- **Mockup Composition**: Fast (< 1 second) using Sharp image processing
- **Batch Processing**: Processes images in parallel for optimal performance
- **Memory Usage**: Approximately 200-500MB depending on concurrent requests

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use HTTPS** in production environments
3. **Implement rate limiting** for public-facing deployments
4. **Validate and sanitize** all user inputs
5. **Set appropriate CORS policies** based on your use case

## Support and Documentation

- **Project README**: `/home/ubuntu/tshirt-image-gen/README.md`
- **API Reference**: Access `http://localhost:3001/` for endpoint list
- **Health Check**: Access `http://localhost:3001/health` to verify server status

## License

MIT License - See LICENSE file for details
