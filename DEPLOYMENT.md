# Deployment Guide - AgencyOS

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- VPS with at least 2GB RAM and 10GB disk space
- Domain name (optional, for SSL)

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url> agencyos
cd agencyos
```

### 2. Create Environment File

```bash
# Copy the example and fill in your production values
cp .env.production.example .env.production

# Edit with your Supabase credentials
nano .env.production
```

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### 3. Build and Run with Docker

#### Option A: Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f agencyos

# Stop the application
docker-compose down
```

#### Option B: Using Docker Directly

```bash
# Build the image
docker build -t agencyos:latest .

# Run the container
docker run -d \
  --name agencyos-app \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  agencyos:latest

# View logs
docker logs -f agencyos-app

# Stop the container
docker stop agencyos-app
docker rm agencyos-app
```

### 4. Verify Deployment

```bash
# Check if the container is running
docker ps | grep agencyos

# Test the application
curl http://localhost:3000

# Check application health
docker-compose exec agencyos wget --quiet --spider http://localhost:3000/
```

## Production Setup with Nginx (Optional)

If you want to use Nginx as a reverse proxy with SSL:

### 1. Create `nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    upstream agencyos_backend {
        server agencyos:3000;
    }

    server {
        listen 80;
        server_name _;
        client_max_body_size 10M;

        location / {
            proxy_pass http://agencyos_backend;
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

    # HTTPS configuration (uncomment and configure if using SSL)
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com;
    #
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #     ssl_prefer_server_ciphers on;
    #
    #     location / {
    #         proxy_pass http://agencyos_backend;
    #         proxy_http_version 1.1;
    #         proxy_set_header Upgrade $http_upgrade;
    #         proxy_set_header Connection 'upgrade';
    #         proxy_set_header Host $host;
    #         proxy_set_header X-Real-IP $remote_addr;
    #         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #         proxy_set_header X-Forwarded-Proto $scheme;
    #         proxy_cache_bypass $http_upgrade;
    #     }
    # }
    #
    # # Redirect HTTP to HTTPS
    # server {
    #     listen 80;
    #     server_name your-domain.com;
    #     return 301 https://$server_name$request_uri;
    # }
}
```

### 2. Create SSL directory and add certificates

```bash
mkdir -p ssl
# Copy your SSL certificates to ssl/cert.pem and ssl/key.pem
```

### 3. Start with Nginx

```bash
docker-compose up -d
```

## Database Migrations

The application uses Supabase for database management. Ensure all migrations have been applied:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the migrations from `sql/` directory (if any)
4. Verify tables and enums are created correctly

## Monitoring and Maintenance

### View Logs

```bash
# Application logs
docker-compose logs -f agencyos

# All container logs
docker-compose logs -f
```

### Health Check

```bash
docker-compose exec agencyos curl http://localhost:3000/
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild image
docker-compose build

# Restart service
docker-compose up -d
```

### Backup

Database backups are managed through Supabase. Configure automated backups in your Supabase dashboard.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs agencyos

# Check if port 3000 is already in use
lsof -i :3000

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Supabase connection error

1. Verify environment variables:
   ```bash
   cat .env.production | grep SUPABASE
   ```

2. Check Supabase project is active and accessible

3. Restart the container:
   ```bash
   docker-compose restart agencyos
   ```

### High memory usage

- Increase Node.js memory limit in Docker: `--memory=2g`
- Monitor with: `docker stats`

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] `.env.production` is in `.gitignore`
- [ ] SSL certificates are valid and up-to-date
- [ ] Firewall rules restrict access appropriately
- [ ] Docker containers run as non-root users
- [ ] Regular security updates are applied

## Support

For issues or questions, check the application logs and ensure all prerequisites are met.
