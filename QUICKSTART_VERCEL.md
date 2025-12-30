# Quick Start: Deploy to gen.tshirt.is via Vercel

The **fastest and easiest** way to deploy your t-shirt image generation server to **gen.tshirt.is**.

## Prerequisites

- Vercel account (free at https://vercel.com)
- Access to tshirt.is DNS settings
- GitHub account (optional, but recommended)

---

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

```bash
# Navigate to your project
cd /home/ubuntu/tshirt-image-gen

# Create a new repository on GitHub (via web or CLI)
gh repo create tshirt-image-gen --public --source=. --remote=origin

# Push your code
git push -u origin master
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `tshirt-image-gen` repository
4. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
5. Click "Deploy"

### Step 3: Add Environment Variables

After deployment:
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   - `BUILT_IN_FORGE_API_KEY` = `your_actual_api_key`
   - `BUILT_IN_FORGE_API_URL` = `https://forge-api.manus.ai`
   - `NODE_ENV` = `production`
4. Click **Redeploy** to apply changes

### Step 4: Add Custom Domain

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `gen.tshirt.is`
4. Click **Add**

Vercel will show you the DNS configuration needed.

### Step 5: Configure DNS

Go to your DNS provider (where tshirt.is is registered) and add:

```
Type: CNAME
Name: gen
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 6: Wait for DNS Propagation

- Usually takes 5-30 minutes
- Check status at https://dnschecker.org/?query=gen.tshirt.is&type=CNAME

### Step 7: Test Your API

```bash
curl https://gen.tshirt.is/health
```

✅ **Done!** Your API is live at https://gen.tshirt.is

---

## Method 2: Deploy via Vercel CLI (Faster)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /home/ubuntu/tshirt-image-gen
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **What's your project's name?** tshirt-image-gen
- **In which directory is your code located?** ./ (press Enter)
- **Want to override the settings?** N

### Step 4: Add Environment Variables

```bash
vercel env add BUILT_IN_FORGE_API_KEY production
# Paste your API key when prompted

vercel env add BUILT_IN_FORGE_API_URL production
# Enter: https://forge-api.manus.ai

vercel env add NODE_ENV production
# Enter: production
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

### Step 6: Add Custom Domain

```bash
vercel domains add gen.tshirt.is
```

Or via Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Domains → Add Domain
4. Enter: `gen.tshirt.is`

### Step 7: Configure DNS

Add CNAME record in your DNS provider:
```
Type: CNAME
Name: gen
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 8: Test

```bash
curl https://gen.tshirt.is/health
```

✅ **Done!** Your API is live at https://gen.tshirt.is

---

## Method 3: Deploy via Vercel MCP (You Already Have This!)

Since you have Vercel MCP configured, you can deploy directly:

### Step 1: Deploy Using MCP

```bash
cd /home/ubuntu/tshirt-image-gen

manus-mcp-cli tool call deploy_to_vercel --server vercel --input '{
  "projectName": "tshirt-image-gen"
}'
```

### Step 2: Add Domain via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your deployed project
3. Settings → Domains → Add Domain
4. Enter: `gen.tshirt.is`

### Step 3: Configure DNS

```
Type: CNAME
Name: gen
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 4: Add Environment Variables via Dashboard

1. Settings → Environment Variables
2. Add:
   - `BUILT_IN_FORGE_API_KEY`
   - `BUILT_IN_FORGE_API_URL`
   - `NODE_ENV`

### Step 5: Redeploy

Go to Deployments → Click "Redeploy" on the latest deployment

---

## DNS Configuration Details

### Where to Find Your DNS Settings

Common DNS providers for .is domains:
- **Namecheap:** Dashboard → Domain List → Manage → Advanced DNS
- **GoDaddy:** My Products → Domains → DNS → Manage Zones
- **Cloudflare:** Dashboard → Select domain → DNS
- **ISNIC (Iceland):** Contact your registrar

### CNAME Record Configuration

```
Record Type: CNAME
Host/Name: gen
Value/Points to: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

**Important:** Remove any existing A or CNAME records for `gen` subdomain before adding the new one.

---

## Verification Steps

### 1. Check DNS Propagation
```bash
dig gen.tshirt.is CNAME
# Should show: cname.vercel-dns.com
```

Or use online tool: https://dnschecker.org

### 2. Check SSL Certificate
```bash
curl -I https://gen.tshirt.is/health
# Should show: HTTP/2 200
```

### 3. Test API Endpoints

**Health Check:**
```bash
curl https://gen.tshirt.is/health
```

**API Documentation:**
```bash
curl https://gen.tshirt.is/
```

**Generate Image (requires API key configured):**
```bash
curl -X POST https://gen.tshirt.is/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut",
    "tshirtColor": "black"
  }'
```

---

## Troubleshooting

### Domain Shows "Not Found" or 404
- **Wait longer:** DNS can take up to 48 hours (usually 5-30 minutes)
- **Check DNS:** Verify CNAME record is correct
- **Clear cache:** Try in incognito/private browsing mode

### SSL Certificate Error
- Vercel auto-provisions SSL certificates
- Wait a few minutes after DNS propagation
- Check Vercel Dashboard → Settings → Domains for status

### API Returns Errors
- **Check environment variables:** Settings → Environment Variables
- **Redeploy:** After adding env vars, click "Redeploy"
- **Check logs:** Deployments → Select deployment → View Function Logs

### "getaddrinfo ENOTFOUND" Error
- Environment variables not set correctly
- Redeploy after setting `BUILT_IN_FORGE_API_KEY` and `BUILT_IN_FORGE_API_URL`

---

## Post-Deployment Checklist

- [ ] Code deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domain added in Vercel
- [ ] DNS CNAME record configured
- [ ] DNS propagation complete (check with dnschecker.org)
- [ ] SSL certificate active (https works)
- [ ] Health endpoint responds: `curl https://gen.tshirt.is/health`
- [ ] API documentation accessible: `curl https://gen.tshirt.is/`
- [ ] Image generation works (test with valid API key)

---

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- ✅ Deploy every push to `master` branch
- ✅ Create preview deployments for pull requests
- ✅ Run build checks before deploying
- ✅ Rollback to previous versions if needed

To update your API:
```bash
# Make changes to your code
git add .
git commit -m "Update API"
git push

# Vercel automatically deploys!
```

---

## Estimated Time

- **Method 1 (GitHub):** 10-15 minutes + DNS propagation
- **Method 2 (CLI):** 5-10 minutes + DNS propagation
- **Method 3 (MCP):** 5-10 minutes + DNS propagation

**DNS Propagation:** Usually 5-30 minutes, can take up to 48 hours

---

## Need Help?

- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **DNS Checker:** https://dnschecker.org
- **Project Documentation:** See DEPLOY_TO_CUSTOM_DOMAIN.md for more options

---

🚀 **Your API will be live at: https://gen.tshirt.is**
