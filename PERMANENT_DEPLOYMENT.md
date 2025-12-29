# T-Shirt Image Generation Server - Permanent Deployment

## Deployment Status

✅ **DEPLOYED AND RUNNING**

The t-shirt image generation server has been permanently deployed using PM2 process manager and is configured to automatically restart on system reboot.

## Deployment Details

### Server Information

- **Status:** Online and Running
- **Process Manager:** PM2
- **Public URL:** https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer
- **Local Port:** 3001
- **Environment:** Production
- **Auto-Restart:** Enabled
- **Boot on Startup:** Enabled

### Process Configuration

- **Process Name:** tshirt-image-gen
- **Script:** dist/index.js
- **Working Directory:** /home/ubuntu/tshirt-image-gen
- **Instances:** 1
- **Max Memory:** 1GB (auto-restart if exceeded)
- **Auto-Restart:** Yes
- **Watch Mode:** Disabled (production)

### Log Files

All logs are stored in `/home/ubuntu/tshirt-image-gen/logs/`:

- **Error Log:** `logs/error.log`
- **Output Log:** `logs/out.log`
- **Combined Log:** `logs/combined.log`

## PM2 Management Commands

### View Status
```bash
pm2 status
```

### View Logs
```bash
# View all logs (live)
pm2 logs tshirt-image-gen

# View last 100 lines
pm2 logs tshirt-image-gen --lines 100

# View only error logs
pm2 logs tshirt-image-gen --err

# View only output logs
pm2 logs tshirt-image-gen --out
```

### Restart Server
```bash
pm2 restart tshirt-image-gen
```

### Stop Server
```bash
pm2 stop tshirt-image-gen
```

### Start Server (if stopped)
```bash
pm2 start tshirt-image-gen
```

### Reload Server (zero-downtime)
```bash
pm2 reload tshirt-image-gen
```

### Delete from PM2
```bash
pm2 delete tshirt-image-gen
```

### View Detailed Info
```bash
pm2 show tshirt-image-gen
```

### Monitor Resources
```bash
pm2 monit
```

## Updating the Application

When you need to update the code:

```bash
# 1. Navigate to project directory
cd /home/ubuntu/tshirt-image-gen

# 2. Make your changes to the source files in src/

# 3. Rebuild the TypeScript
pnpm build

# 4. Reload the application (zero-downtime)
pm2 reload tshirt-image-gen

# 5. Save the PM2 process list
pm2 save
```

## Environment Configuration

The server uses environment variables from the `.env` file:

```env
BUILT_IN_FORGE_API_KEY=your_actual_api_key_here
BUILT_IN_FORGE_API_URL=https://forge-api.manus.ai
PORT=3001
NODE_ENV=production
```

**Important:** After changing environment variables, you must restart the server:
```bash
pm2 restart tshirt-image-gen
```

## Startup Configuration

The server is configured to automatically start on system boot using systemd:

- **Service Name:** pm2-ubuntu
- **Service File:** /etc/systemd/system/pm2-ubuntu.service
- **Status:** Enabled

### Systemd Commands

```bash
# Check service status
sudo systemctl status pm2-ubuntu

# Start service
sudo systemctl start pm2-ubuntu

# Stop service
sudo systemctl stop pm2-ubuntu

# Restart service
sudo systemctl restart pm2-ubuntu

# Disable auto-start
sudo systemctl disable pm2-ubuntu

# Enable auto-start
sudo systemctl enable pm2-ubuntu
```

## Testing the Deployment

### Health Check
```bash
curl https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T21:59:07.079Z",
  "uptime": 23.547344619
}
```

### API Documentation
```bash
curl https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/
```

### Generate Complete Design
```bash
curl -X POST https://3001-ivmkj07faiter6yf3whev-ee373f36.us2.manus.computer/api/generate-complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cosmic astronaut floating in space",
    "tshirtColor": "black"
  }'
```

## Monitoring and Maintenance

### Check Server Status
```bash
pm2 status
```

### View Real-Time Logs
```bash
pm2 logs tshirt-image-gen --lines 50
```

### Check Memory Usage
```bash
pm2 monit
```

### Restart if Issues Occur
```bash
pm2 restart tshirt-image-gen
```

### View Detailed Process Info
```bash
pm2 show tshirt-image-gen
```

## Backup and Recovery

### Backup PM2 Configuration
```bash
# PM2 process list is saved at
/home/ubuntu/.pm2/dump.pm2

# Backup command
cp /home/ubuntu/.pm2/dump.pm2 /home/ubuntu/tshirt-image-gen/pm2-backup.dump
```

### Restore PM2 Configuration
```bash
# Copy backup to PM2 home
cp /home/ubuntu/tshirt-image-gen/pm2-backup.dump /home/ubuntu/.pm2/dump.pm2

# Resurrect processes
pm2 resurrect
```

## Performance Optimization

### Current Configuration
- **Instances:** 1 (single instance)
- **Max Memory:** 1GB restart threshold
- **Auto-Restart:** Enabled on crash

### Scaling Up (if needed)
```bash
# Scale to 2 instances
pm2 scale tshirt-image-gen 2

# Scale to 4 instances
pm2 scale tshirt-image-gen 4
```

### Load Balancing
PM2 automatically load balances requests across multiple instances when scaled.

## Security Considerations

1. **API Keys:** Ensure `.env` file is not exposed publicly
2. **File Permissions:** Keep `.env` file readable only by ubuntu user
3. **HTTPS:** Use HTTPS in production (currently using Manus proxy)
4. **Rate Limiting:** Consider implementing rate limiting for production
5. **CORS:** Configure CORS policy based on your requirements

## Troubleshooting

### Server Not Responding
```bash
# Check if process is running
pm2 status

# Check logs for errors
pm2 logs tshirt-image-gen --err --lines 50

# Restart the server
pm2 restart tshirt-image-gen
```

### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart to clear memory
pm2 restart tshirt-image-gen
```

### Port Already in Use
```bash
# Check what's using port 3001
sudo lsof -i :3001

# Stop the PM2 process
pm2 stop tshirt-image-gen

# Start again
pm2 start tshirt-image-gen
```

### Startup Issues After Reboot
```bash
# Check systemd service status
sudo systemctl status pm2-ubuntu

# Manually start PM2 service
sudo systemctl start pm2-ubuntu

# Check PM2 status
pm2 status
```

## Uninstalling

If you need to completely remove the deployment:

```bash
# 1. Stop and delete PM2 process
pm2 stop tshirt-image-gen
pm2 delete tshirt-image-gen
pm2 save

# 2. Disable systemd service
pm2 unstartup systemd

# 3. Remove project directory (optional)
rm -rf /home/ubuntu/tshirt-image-gen

# 4. Uninstall PM2 (optional)
npm uninstall -g pm2
```

## Support and Resources

- **Project Directory:** /home/ubuntu/tshirt-image-gen
- **PM2 Documentation:** https://pm2.keymetrics.io/
- **Deployment Guide:** DEPLOYMENT_GUIDE.md
- **Project Summary:** PROJECT_SUMMARY.md
- **Test Script:** test-api.sh

## Quick Reference

```bash
# View status
pm2 status

# View logs
pm2 logs tshirt-image-gen

# Restart
pm2 restart tshirt-image-gen

# Monitor
pm2 monit

# Update code
cd /home/ubuntu/tshirt-image-gen && pnpm build && pm2 reload tshirt-image-gen
```

---

**Deployment Date:** December 29, 2025  
**Deployment Method:** PM2 Process Manager with systemd integration  
**Status:** ✅ Production Ready
