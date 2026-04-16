# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy API, WebSocket, and media to backend
    # BACKEND_HOST defaults to "backend" (docker-compose service name);
    # override with --env BACKEND_HOST=localhost for standalone runs.
    location /api/ {
        proxy_pass http://${BACKEND_HOST:-backend}:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io/ {
        proxy_pass http://${BACKEND_HOST:-backend}:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /media/ {
        proxy_pass http://${BACKEND_HOST:-backend}:8000;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
