# Deploy to Custom Domain: gen.tshirt.is

This guide will walk you through deploying your t-shirt image generation server to your custom subdomain **gen.tshirt.is**.

## Deployment Options

You have several options to deploy this Node.js + Express application to your custom domain:

### Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel is perfect for Node.js applications and offers:
- ✅ Free SSL certificates
- ✅ Automatic deployments from Git
- ✅ Easy custom domain configuration
- ✅ Built-in environment variable management
- ✅ Global CDN

#### Steps for Vercel Deployment

**1. Install Vercel CLI (if not already installed)**
```bash
npm install -g vercel
```

**2. Navigate to your project**
```bash
cd /home/ubuntu/tshirt-image-gen
```

**3. Login to Vercel**
```bash
vercel login
```

**4. Deploy to Vercel**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- What's your project's name? **tshirt-image-gen**
- In which directory is your code located? **./** (press Enter)

**5. Configure Environment Variables**

After deployment, add your environment variables:

```bash
vercel env add BUILT_IN_FORGE_API_KEY
# Paste your API key when prompted

vercel env add BUILT_IN_FORGE_API_URL
# Enter: https://forge-api.manus.ai
```

Or via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `BUILT_IN_FORGE_API_KEY` = your_api_key
   - `BUILT_IN_FORGE_API_URL` = https://forge-api.manus.ai

**6. Add Custom Domain**

In Vercel Dashboard:
1. Go to your project → Settings → Domains
2. Add domain: **gen.tshirt.is**
3. Vercel will provide DNS records to configure

**7. Configure DNS**

In your DNS provider (where tshirt.is is registered):
- Add a **CNAME** record:
  - Name: `gen`
  - Value: `cname.vercel-dns.com`
  - TTL: 3600 (or default)

**8. Redeploy with Environment Variables**
```bash
vercel --prod
```

Your API will be live at: **https://gen.tshirt.is**

---

### Option 2: Deploy to Your Own VPS/Server

If you have your own server (DigitalOcean, AWS, Linode, etc.):

#### Prerequisites
- Ubuntu/Debian server with root access
- Node.js 22+ installed
- Domain DNS pointing to your server IP

#### Steps

**1. Point DNS to Your Server**

In your DNS provider:
- Add an **A** record:
  - Name: `gen`
  - Value: `your_server_ip_address`
  - TTL: 3600

**2. SSH into Your Server**
```bash
ssh user@your_server_ip
```

**3. Install Dependencies**
```bash
# Install Node.js 22 (if not installed)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt-get install -y nginx

# Install Certbot (for SSL)
sudo apt-get install -y certbot python3-certbot-nginx
```

**4. Clone/Upload Your Project**
```bash
# Option A: Upload via SCP
scp -r /home/ubuntu/tshirt-image-gen user@your_server:/var/www/

# Option B: Clone from Git (if you pushed to GitHub)
cd /var/www
git clone https://github.com/yourusername/tshirt-image-gen.git
```

**5. Install and Build**
```bash
cd /var/www/tshirt-image-gen
pnpm install
pnpm build
```

**6. Configure Environment Variables**
```bash
nano .env
```

Add:
```env
BUILT_IN_FORGE_API_KEY=your_actual_api_key
BUILT_IN_FORGE_API_URL=https://forge-api.manus.ai
PORT=3001
NODE_ENV=production
```

**7. Start with PM2**
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

**8. Configure Nginx Reverse Proxy**
```bash
sudo nano /etc/nginx/sites-available/gen.tshirt.is
```

Add:
```nginx
server {
    listen 80;
    server_name gen.tshirt.is;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**9. Enable the Site**
```bash
sudo ln -s /etc/nginx/sites-available/gen.tshirt.is /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**10. Install SSL Certificate**
```bash
sudo certbot --nginx -d gen.tshirt.is
```

Follow the prompts to:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

Your API will be live at: **https://gen.tshirt.is**

---

### Option 3: Deploy to Railway

Railway is another easy option with great Node.js support:

**1. Install Railway CLI**
```bash
npm install -g @railway/cli
```

**2. Login to Railway**
```bash
railway login
```

**3. Initialize and Deploy**
```bash
cd /home/ubuntu/tshirt-image-gen
railway init
railway up
```

**4. Add Environment Variables**
```bash
railway variables set BUILT_IN_FORGE_API_KEY=your_api_key
railway variables set BUILT_IN_FORGE_API_URL=https://forge-api.manus.ai
```

**5. Add Custom Domain**
- Go to Railway Dashboard
- Select your project
- Go to Settings → Domains
- Add custom domain: **gen.tshirt.is**
- Configure DNS as instructed

---

### Option 4: Deploy to Render

Render offers free Node.js hosting with custom domains:

**1. Create a Render Account**
Go to https://render.com and sign up

**2. Create New Web Service**
- Click "New +" → "Web Service"
- Connect your Git repository (or use manual deploy)
- Configure:
  - Name: `tshirt-image-gen`
  - Environment: `Node`
  - Build Command: `pnpm install && pnpm build`
  - Start Command: `pnpm start`

**3. Add Environment Variables**
In Render Dashboard:
- Go to Environment
- Add:
  - `BUILT_IN_FORGE_API_KEY` = your_api_key
  - `BUILT_IN_FORGE_API_URL` = https://forge-api.manus.ai

**4. Add Custom Domain**
- Go to Settings → Custom Domains
- Add: **gen.tshirt.is**
- Configure DNS as instructed (usually CNAME to your-app.onrender.com)

---

## Testing Your Deployment

Once deployed, test your API:

### Health Check
```bash
curl https://gen.tshirt.is/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T...",
  "uptime": 123.456
}
```

### API Documentation
```bash
curl https://gen.tshirt.is/
```

### Generate Complete Design
```bash
curl -X POST https://gen.tshirt.is/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating in space",
    "tshirtColor": "black"
  }'
```

---

## DNS Configuration Summary

Regardless of which platform you choose, you'll need to configure DNS:

### For Vercel, Railway, Render (CNAME)
```
Type: CNAME
Name: gen
Value: [provided by platform]
TTL: 3600
```

### For Your Own Server (A Record)
```
Type: A
Name: gen
Value: your_server_ip_address
TTL: 3600
```

**Note:** DNS changes can take 5 minutes to 48 hours to propagate worldwide.

---

## Recommended: Vercel Deployment (Step-by-Step)

Since you have Vercel MCP configured, here's the quickest path:

### Using Vercel MCP (Already Configured)

You can deploy directly using the Vercel MCP tools that are already set up:

**1. Prepare for deployment**
```bash
cd /home/ubuntu/tshirt-image-gen
```

**2. Deploy using MCP**
```bash
manus-mcp-cli tool call deploy_to_vercel --server vercel --input '{
  "projectName": "tshirt-image-gen",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}'
```

**3. After deployment, add custom domain via Vercel Dashboard:**
- Go to https://vercel.com/dashboard
- Select your project
- Settings → Domains → Add Domain
- Enter: **gen.tshirt.is**

**4. Configure DNS:**
Add CNAME record in your DNS provider:
```
Name: gen
Value: cname.vercel-dns.com
```

**5. Add environment variables via Vercel Dashboard:**
- Settings → Environment Variables
- Add `BUILT_IN_FORGE_API_KEY` and `BUILT_IN_FORGE_API_URL`

---

## Troubleshooting

### Domain Not Working
- Check DNS propagation: https://dnschecker.org
- Verify DNS records are correct
- Wait up to 48 hours for full propagation

### SSL Certificate Issues
- Most platforms auto-provision SSL
- For custom servers, ensure Certbot ran successfully
- Check firewall allows ports 80 and 443

### API Not Responding
- Check environment variables are set
- Verify the application is running
- Check logs for errors

### Image Generation Fails
- Verify `BUILT_IN_FORGE_API_KEY` is set correctly
- Check API key has sufficient credits
- Review application logs

---

## Next Steps

1. Choose your deployment platform (Vercel recommended)
2. Follow the deployment steps for that platform
3. Configure your custom domain DNS
4. Add environment variables
5. Test your API endpoints
6. Monitor logs and performance

Your t-shirt image generation API will be live at **https://gen.tshirt.is**! 🚀
