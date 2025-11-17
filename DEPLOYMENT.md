# Deployment Guide

This guide covers deploying the Living Taskboard application to various platforms.

## Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Node.js 18+ (for manual deployment)
- Environment variables configured

## Environment Variables

### Server (.env)
```bash
PORT=3001
CLIENT_URL=http://localhost:5173  # Change to your production URL
NODE_ENV=production

# Optional: AI Features
OPENAI_API_KEY=your_openai_api_key

# Optional: Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Client (.env)
```bash
VITE_SERVER_URL=http://localhost:3001  # Change to your production server URL
```

## Docker Deployment (Recommended)

### 1. Using Docker Compose

```bash
# Clone the repository
git clone https://github.com/clduab11/living-taskboard.git
cd living-taskboard

# Create .env file with your configuration
cp server/.env.example server/.env
# Edit server/.env with your values

# Build and start the containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the containers
docker-compose down
```

### 2. Using Docker Only

```bash
# Build the image
docker build -t living-taskboard .

# Run the container
docker run -d \
  -p 3001:3001 \
  -e PORT=3001 \
  -e CLIENT_URL=http://your-domain.com \
  -e OPENAI_API_KEY=your_key \
  --name living-taskboard \
  living-taskboard
```

## Manual Deployment

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Build the Application

```bash
npm run build
```

### 3. Configure Environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your values
```

### 4. Start the Server

```bash
cd server
npm start
```

### 5. Serve the Client

Option 1: Using a static file server (recommended)
```bash
# Install a static file server
npm install -g serve

# Serve the client build
serve -s client/dist -p 5173
```

Option 2: Configure a web server (nginx, Apache, etc.)
Point your web server to `client/dist` directory.

## Cloud Platform Deployment

### Heroku

1. Create a new Heroku app
2. Add buildpacks:
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```
3. Set environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set STRIPE_SECRET_KEY=your_key
   ```
4. Deploy:
   ```bash
   git push heroku main
   ```

### AWS (EC2)

1. Launch an EC2 instance (Ubuntu 22.04 LTS recommended)
2. Install Node.js and npm
3. Clone the repository
4. Install dependencies and build
5. Use PM2 to manage the Node.js process:
   ```bash
   npm install -g pm2
   pm2 start server/dist/index.js --name living-taskboard
   pm2 save
   pm2 startup
   ```
6. Configure nginx as a reverse proxy

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure the app:
   - Build Command: `npm run build`
   - Run Command: `cd server && npm start`
3. Set environment variables in the dashboard
4. Deploy

### Vercel (Client Only)

For deploying just the client to Vercel:

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to client directory: `cd client`
3. Deploy: `vercel`
4. Configure environment variables in Vercel dashboard

Note: You'll need to deploy the server separately.

### Railway

1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Node.js app
3. Add environment variables in Railway dashboard
4. Deploy

## Nginx Configuration

If you're using nginx as a reverse proxy, here's a sample configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Client files
    location / {
        root /path/to/living-taskboard/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API and WebSocket proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /yjs {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/TLS Configuration

For production, always use HTTPS. Use Let's Encrypt for free SSL certificates:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Health Checks

The application provides a health check endpoint:

```
GET /health
```

Returns: `{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}`

## Monitoring

Consider setting up monitoring with:
- PM2 monitoring dashboard
- Application Performance Monitoring (APM) tools
- Log aggregation services
- Uptime monitoring

## Scaling

For high-traffic scenarios:

1. **Horizontal Scaling**: Deploy multiple instances behind a load balancer
2. **Database**: Add a database (PostgreSQL, MongoDB) for persistence
3. **Redis**: Use Redis for session storage and pub/sub
4. **CDN**: Serve static assets via CDN
5. **WebSocket Scaling**: Use Redis adapter for Socket.IO clustering

## Troubleshooting

### WebSocket Connection Issues
- Ensure firewall allows WebSocket connections
- Check reverse proxy WebSocket configuration
- Verify CORS settings

### Build Failures
- Check Node.js version (requires 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for missing environment variables

### Performance Issues
- Enable gzip compression
- Optimize canvas rendering
- Implement lazy loading for large boards
- Use production builds (not dev mode)

## Support

For issues or questions:
- Open an issue on GitHub
- Check the README.md for common questions
- Review server logs for errors
