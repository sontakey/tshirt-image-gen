# Quick Reference Guide

## Deployment Checklist

- [ ] Create Manus web project named `tshirt-image-gen`
- [ ] Copy server code to Manus project
- [ ] Deploy on Manus (automatic build and start)
- [ ] Get Manus server URL (e.g., `https://tshirt-image-gen-xxxxx.manus.space`)
- [ ] Test health endpoint: `curl https://your-server/health`
- [ ] Update Supabase secret: `IMAGE_GEN_SERVER_URL=https://your-server`
- [ ] Deploy Supabase Edge Function: `supabase functions deploy generate-design`
- [ ] Test Edge Function
- [ ] Integrate with frontend

## Server URLs

### Manus Server
```
https://tshirt-image-gen-xxxxx.manus.space
```

### Supabase Edge Function
```
https://your-project.supabase.co/functions/v1/generate-design
```

## Key Endpoints

### Health Check
```bash
GET https://tshirt-image-gen-xxxxx.manus.space/health
```

### Generate Complete Design
```bash
POST https://tshirt-image-gen-xxxxx.manus.space/api/generate-complete
Content-Type: application/json

{
  "prompt": "A cosmic astronaut floating through a nebula",
  "tshirtColor": "black"
}
```

### Call from Supabase
```bash
POST https://your-project.supabase.co/functions/v1/generate-design
Content-Type: application/json

{
  "prompt": "A cosmic astronaut floating through a nebula",
  "tshirtColor": "black"
}
```

## Environment Variables

### Manus (Automatic)
- `BUILT_IN_FORGE_API_KEY` - Manus API key
- `BUILT_IN_FORGE_API_URL` - Manus API URL
- `PORT` - Server port (3001)

### Supabase
- `IMAGE_GEN_SERVER_URL` - Your Manus server URL

## Testing

### Test Server Health
```bash
curl https://tshirt-image-gen-xxxxx.manus.space/health
```

### Test Image Generation
```bash
curl -X POST https://tshirt-image-gen-xxxxx.manus.space/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Phoenix rising from flames",
    "tshirtColor": "black"
  }'
```

### Test Edge Function
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-design \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Mountain peak with sunrise",
    "tshirtColor": "black"
  }'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Server not responding | Check Manus dashboard logs |
| Image generation timeout | Increase timeout, check Forge API |
| Edge Function error | Check Supabase logs, verify secret |
| Database error | Check table schema, verify connection |
| CORS error | Server has CORS enabled, check origin |

## File Structure

```
tshirt-image-gen-deploy/
├── src/
│   ├── index.ts                 # Main server
│   └── services/
│       ├── nanoBananaClient.ts # Image generation (uses Manus)
│       └── imageComposer.ts    # Image composition
├── dist/                        # Compiled JavaScript
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── README.md                   # Basic info
├── MANUS_DEPLOYMENT.md         # Full deployment guide
├── QUICK_REFERENCE.md          # This file
└── supabase-edge-function.ts   # Edge Function code
```

## Next Steps

1. **Deploy Server**
   - Create Manus project
   - Upload code
   - Deploy

2. **Configure Supabase**
   - Set IMAGE_GEN_SERVER_URL secret
   - Deploy Edge Function

3. **Test Integration**
   - Call Edge Function from frontend
   - Verify images are saved to database

4. **Monitor**
   - Check Manus logs
   - Monitor Supabase invocations
   - Track Forge API usage

## API Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "logoUrl": "https://...",
    "imageUrl": "data:image/png;base64,...",
    "prompt": "A cosmic astronaut",
    "seed": 42
  }
}
```

### Error Response
```json
{
  "error": "Failed to generate image",
  "message": "Manus Forge API error: 503 - Service unavailable"
}
```

## Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| Health check | <100ms | Instant |
| Image generation | 30-60s | Depends on Forge API |
| Mockup composition | 2-5s | Image processing |
| Database insert | <1s | Supabase |

## Support Resources

- **Manus Docs**: https://manus.im/docs
- **Supabase Docs**: https://supabase.com/docs
- **Express.js**: https://expressjs.com
- **TypeScript**: https://www.typescriptlang.org

---

**Ready to deploy!** 🚀
