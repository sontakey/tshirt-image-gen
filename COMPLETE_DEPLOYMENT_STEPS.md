# Complete Your Permanent Deployment - Final Steps

Your code is now on GitHub! Complete the deployment in just **5 minutes** by following these steps.

---

## ✅ What's Already Done

- ✅ Code pushed to GitHub: **https://github.com/sontakey/tshirt-image-gen**
- ✅ Project configured for Vercel deployment
- ✅ All necessary files prepared (vercel.json, .gitignore, etc.)
- ✅ Server currently running in sandbox with PM2

---

## 🚀 Complete Deployment (Choose One Method)

### Method 1: Vercel via GitHub (Recommended - 5 minutes)

This is the **easiest and most automated** method:

#### Step 1: Import to Vercel

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select **"sontakey/tshirt-image-gen"** from the list
   - If you don't see it, click "Adjust GitHub App Permissions" to grant access
4. Click **"Import"**

#### Step 2: Configure Build Settings

Vercel will auto-detect most settings, but verify:

- **Framework Preset:** Other
- **Root Directory:** `./` (leave as default)
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`

Click **"Deploy"**

#### Step 3: Add Environment Variables

After the first deployment:

1. Go to your project dashboard on Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables (for all environments):

   ```
   BUILT_IN_FORGE_API_KEY = your_actual_forge_api_key
   BUILT_IN_FORGE_API_URL = https://forge-api.manus.ai
   NODE_ENV = production
   PORT = 3001
   ```

4. Click **"Save"**

#### Step 4: Redeploy with Environment Variables

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"**
5. Click **"Redeploy"**

#### Step 5: Add Custom Domain (gen.tshirt.is)

1. In Vercel Dashboard, go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter: `gen.tshirt.is`
4. Click **"Add"**

Vercel will show you the DNS configuration.

#### Step 6: Configure DNS

Go to your DNS provider (where **tshirt.is** is registered):

1. Add a **CNAME** record:
   ```
   Type: CNAME
   Name: gen
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

2. Save the DNS record

#### Step 7: Wait for DNS Propagation

- Usually takes **5-30 minutes**
- Can take up to 48 hours in rare cases
- Check status: https://dnschecker.org/?query=gen.tshirt.is&type=CNAME

#### Step 8: Test Your Deployment

```bash
# Health check
curl https://gen.tshirt.is/health

# API documentation
curl https://gen.tshirt.is/

# Generate design (requires valid API key)
curl -X POST https://gen.tshirt.is/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cosmic astronaut", "tshirtColor": "black"}'
```

✅ **Done!** Your API is permanently deployed at **https://gen.tshirt.is**

---

### Method 2: Vercel CLI (Alternative - 10 minutes)

If you prefer command line:

#### Step 1: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

#### Step 2: Deploy

```bash
cd /home/ubuntu/tshirt-image-gen
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **What's your project's name?** tshirt-image-gen
- **In which directory is your code located?** ./ (press Enter)

#### Step 3: Add Environment Variables

```bash
vercel env add BUILT_IN_FORGE_API_KEY production
# Paste your API key when prompted

vercel env add BUILT_IN_FORGE_API_URL production
# Enter: https://forge-api.manus.ai

vercel env add NODE_ENV production
# Enter: production

vercel env add PORT production
# Enter: 3001
```

#### Step 4: Redeploy with Environment Variables

```bash
vercel --prod
```

#### Step 5: Add Custom Domain

```bash
vercel domains add gen.tshirt.is
```

Or via Vercel Dashboard (Settings → Domains).

#### Step 6: Configure DNS

Same as Method 1, Step 6.

---

### Method 3: Alternative Platforms

If you prefer a different platform:

#### Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select **sontakey/tshirt-image-gen**
4. Add environment variables in Settings
5. Add custom domain in Settings → Domains

#### Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub and select **sontakey/tshirt-image-gen**
4. Configure:
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
5. Add environment variables
6. Add custom domain in Settings

---

## 🔧 Environment Variables Required

Make sure to add these on your hosting platform:

```env
BUILT_IN_FORGE_API_KEY=your_actual_forge_api_key
BUILT_IN_FORGE_API_URL=https://forge-api.manus.ai
NODE_ENV=production
PORT=3001
```

**Important:** Replace `your_actual_forge_api_key` with your real Manus Forge API key.

---

## 📊 DNS Configuration Summary

For **gen.tshirt.is** to work:

### Vercel:
```
Type: CNAME
Name: gen
Value: cname.vercel-dns.com
TTL: 3600
```

### Railway:
```
Type: CNAME
Name: gen
Value: [provided by Railway]
TTL: 3600
```

### Render:
```
Type: CNAME
Name: gen
Value: [your-app].onrender.com
TTL: 3600
```

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] GitHub repository is public and accessible
- [ ] Hosting platform successfully built the project
- [ ] Environment variables are configured
- [ ] Deployment is live (check the platform-provided URL)
- [ ] Health endpoint works: `curl https://[your-url]/health`
- [ ] Custom domain added to hosting platform
- [ ] DNS CNAME record configured
- [ ] DNS propagation complete (check dnschecker.org)
- [ ] SSL certificate active (https works)
- [ ] API endpoints respond correctly
- [ ] Image generation works (with valid API key)

---

## 🧪 Testing Your Deployment

### Test Platform URL First

Before DNS propagates, test with the platform-provided URL:

**Vercel:**
```bash
curl https://tshirt-image-gen-[random].vercel.app/health
```

**Railway:**
```bash
curl https://tshirt-image-gen-production-[random].up.railway.app/health
```

**Render:**
```bash
curl https://tshirt-image-gen-[random].onrender.com/health
```

### Test Custom Domain

After DNS propagates:

```bash
# Health check
curl https://gen.tshirt.is/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-12-29T...",
  "uptime": 123.456
}
```

### Test API Endpoints

```bash
# API documentation
curl https://gen.tshirt.is/

# Generate complete design
curl -X POST https://gen.tshirt.is/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating in space",
    "tshirtColor": "black"
  }'
```

---

## 🔄 Continuous Deployment

Once connected to GitHub, your hosting platform will automatically:

- ✅ Deploy every push to `master` branch
- ✅ Create preview deployments for pull requests (Vercel)
- ✅ Run build checks before deploying
- ✅ Rollback to previous versions if needed

To update your API:

```bash
# Make changes to your code
cd /home/ubuntu/tshirt-image-gen
git add .
git commit -m "Update API"
git push origin master

# Platform automatically deploys!
```

---

## 🆘 Troubleshooting

### Build Fails

**Check build logs** on your hosting platform:
- Vercel: Deployments → Click deployment → View Function Logs
- Railway: Deployments → Click deployment → View Logs
- Render: Logs tab

**Common issues:**
- Missing dependencies: Ensure `package.json` is complete
- TypeScript errors: Run `pnpm build` locally to check
- Node version: Ensure platform uses Node.js 18+

### Environment Variables Not Working

- Verify variables are set for **Production** environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Custom Domain Not Working

- Check DNS propagation: https://dnschecker.org
- Verify CNAME record points to correct value
- Wait up to 48 hours for full propagation
- Clear browser cache / try incognito mode

### API Returns Errors

- Check environment variables are set correctly
- Verify `BUILT_IN_FORGE_API_KEY` is valid
- Check platform logs for error messages
- Test with platform URL first before custom domain

---

## 📚 Additional Resources

- **GitHub Repository:** https://github.com/sontakey/tshirt-image-gen
- **Vercel Documentation:** https://vercel.com/docs
- **Railway Documentation:** https://docs.railway.app
- **Render Documentation:** https://render.com/docs
- **DNS Checker:** https://dnschecker.org

---

## 🎯 Quick Summary

**What you need to do:**

1. ✅ Go to https://vercel.com/new
2. ✅ Import **sontakey/tshirt-image-gen** from GitHub
3. ✅ Deploy with default settings
4. ✅ Add environment variables (Settings → Environment Variables)
5. ✅ Redeploy
6. ✅ Add domain **gen.tshirt.is** (Settings → Domains)
7. ✅ Configure DNS CNAME record
8. ✅ Wait for DNS propagation (5-30 minutes)
9. ✅ Test: `curl https://gen.tshirt.is/health`

**Total time:** 5-10 minutes + DNS propagation

---

## 🎉 Success!

Once complete, your t-shirt image generation API will be:

- ✅ **Permanently hosted** at https://gen.tshirt.is
- ✅ **Auto-deploying** from GitHub
- ✅ **SSL-secured** with HTTPS
- ✅ **Scalable** and production-ready
- ✅ **Monitored** with platform dashboards

Your API will be available 24/7 with automatic scaling and zero maintenance!

---

**Need help?** Check the troubleshooting section or platform documentation.
