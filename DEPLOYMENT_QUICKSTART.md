# 🚀 Deploy to gen.tshirt.is - 5 Minute Quickstart

Your code is ready! Follow these simple steps to deploy permanently.

---

## 📦 What's Ready

✅ **GitHub Repository:** https://github.com/sontakey/tshirt-image-gen  
✅ **Vercel Configuration:** Ready  
✅ **All Files:** Committed and pushed

---

## 🎯 Deploy in 5 Steps

### Step 1: Import to Vercel (1 minute)

1. Open: **https://vercel.com/new**
2. Click: **"Import Git Repository"**
3. Find: **sontakey/tshirt-image-gen**
4. Click: **"Import"**
5. Click: **"Deploy"** (use default settings)

⏱️ Wait 2-3 minutes for build to complete.

---

### Step 2: Add Environment Variables (2 minutes)

After deployment completes:

1. Click: **"Go to Dashboard"**
2. Click: **"Settings"** (top menu)
3. Click: **"Environment Variables"** (left sidebar)
4. Add these 4 variables:

   **Variable 1:**
   - Key: `BUILT_IN_FORGE_API_KEY`
   - Value: `your_actual_forge_api_key`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Key: `BUILT_IN_FORGE_API_URL`
   - Value: `https://forge-api.manus.ai`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - Key: `NODE_ENV`
   - Value: `production`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 4:**
   - Key: `PORT`
   - Value: `3001`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. Click: **"Save"** for each variable

---

### Step 3: Redeploy (30 seconds)

1. Click: **"Deployments"** (top menu)
2. Find the latest deployment
3. Click: **"..."** (three dots menu)
4. Click: **"Redeploy"**
5. Click: **"Redeploy"** to confirm

⏱️ Wait 2-3 minutes for redeployment.

---

### Step 4: Add Custom Domain (1 minute)

1. Click: **"Settings"** (top menu)
2. Click: **"Domains"** (left sidebar)
3. Type: `gen.tshirt.is`
4. Click: **"Add"**

Vercel will show: **"Invalid Configuration"** - This is normal!

You'll see instructions like:
```
Add a CNAME record:
Name: gen
Value: cname.vercel-dns.com
```

---

### Step 5: Configure DNS (1 minute)

Go to your DNS provider (where **tshirt.is** is registered):

1. Find: **DNS Settings** or **DNS Management**
2. Click: **"Add Record"** or **"Add DNS Record"**
3. Select: **CNAME**
4. Fill in:
   - **Type:** CNAME
   - **Name/Host:** `gen`
   - **Value/Points to:** `cname.vercel-dns.com`
   - **TTL:** `3600` (or leave default)
5. Click: **"Save"** or **"Add Record"**

---

## ⏰ Wait for DNS Propagation

- **Typical:** 5-30 minutes
- **Maximum:** Up to 48 hours

Check status: https://dnschecker.org/?query=gen.tshirt.is&type=CNAME

---

## ✅ Test Your Deployment

### Test Vercel URL (Immediate)

```bash
# Replace [random] with your actual Vercel URL
curl https://tshirt-image-gen-[random].vercel.app/health
```

### Test Custom Domain (After DNS Propagates)

```bash
curl https://gen.tshirt.is/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T...",
  "uptime": 123.456
}
```

---

## 🎉 You're Done!

Your API is now permanently deployed at:

🌐 **https://gen.tshirt.is**

### What Happens Now?

- ✅ **Auto-deploys** when you push to GitHub
- ✅ **Always online** with 99.99% uptime
- ✅ **SSL secured** with automatic HTTPS
- ✅ **Globally distributed** via Vercel CDN
- ✅ **Zero maintenance** required

---

## 🧪 Test API Endpoints

```bash
# Health check
curl https://gen.tshirt.is/health

# API documentation
curl https://gen.tshirt.is/

# Generate design (requires valid API key)
curl -X POST https://gen.tshirt.is/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating in space",
    "tshirtColor": "black"
  }'
```

---

## 🔄 Update Your API

Make changes and deploy automatically:

```bash
cd /home/ubuntu/tshirt-image-gen

# Make your changes to src/ files

# Commit and push
git add .
git commit -m "Update API"
git push origin master

# Vercel automatically deploys!
```

---

## 📊 Common DNS Providers

### Namecheap
1. Dashboard → Domain List → Manage
2. Advanced DNS → Add New Record

### GoDaddy
1. My Products → Domains → DNS
2. Add → CNAME

### Cloudflare
1. Dashboard → Select domain
2. DNS → Add record

### Google Domains
1. My domains → Manage → DNS
2. Custom records → Manage custom records

---

## 🆘 Troubleshooting

### "Build Failed"
- Check Vercel deployment logs
- Ensure all files are pushed to GitHub
- Verify `package.json` is correct

### "Environment Variables Not Working"
- Redeploy after adding variables
- Check variable names match exactly
- Ensure all 4 variables are added

### "Domain Not Working"
- Wait longer (DNS can take time)
- Check DNS configuration is correct
- Use https://dnschecker.org to verify
- Try incognito/private browsing

### "API Returns Errors"
- Verify `BUILT_IN_FORGE_API_KEY` is correct
- Check Vercel function logs
- Test with Vercel URL first

---

## 📱 Quick Links

- **GitHub Repo:** https://github.com/sontakey/tshirt-image-gen
- **Vercel Dashboard:** https://vercel.com/dashboard
- **DNS Checker:** https://dnschecker.org
- **Full Guide:** See COMPLETE_DEPLOYMENT_STEPS.md

---

## ⏱️ Timeline

| Step | Time | Status |
|------|------|--------|
| Import to Vercel | 1 min | ⏳ |
| First deployment | 2-3 min | ⏳ |
| Add env variables | 2 min | ⏳ |
| Redeploy | 2-3 min | ⏳ |
| Add domain | 1 min | ⏳ |
| Configure DNS | 1 min | ⏳ |
| DNS propagation | 5-30 min | ⏳ |
| **Total** | **15-40 min** | |

---

## 🎯 Summary

1. ✅ Go to https://vercel.com/new
2. ✅ Import **sontakey/tshirt-image-gen**
3. ✅ Deploy
4. ✅ Add 4 environment variables
5. ✅ Redeploy
6. ✅ Add domain **gen.tshirt.is**
7. ✅ Configure DNS CNAME
8. ✅ Wait & test

**Your API will be live at https://gen.tshirt.is** 🚀
