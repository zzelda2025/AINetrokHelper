# Stage 1: Build ứng dụng
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then \
        npm ci --legacy-peer-deps; \
    else \
        npm install --legacy-peer-deps; \
    fi

# Copy .env file trước (quan trọng!)
COPY .env* ./

# Copy toàn bộ source code
COPY . .

# Arguments từ docker-compose
ARG GEMINI_API_KEY
ARG VITE_API_KEY

# Set ENV variables cho Vite build
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY

# Debug: kiểm tra ENV variables
RUN echo "=== Environment Variables ===" && \
    echo "GEMINI_API_KEY: ${GEMINI_API_KEY:0:20}..." && \
    echo "VITE_API_KEY: ${VITE_API_KEY:0:20}..." && \
    ls -la .env* 2>/dev/null || echo "No .env files"

# Build ứng dụng
RUN npm run build

# Debug: Kiểm tra API key trong build
RUN echo "=== Build Output ===" && \
    ls -la dist/ && \
    if grep -r "AIzaSy" dist/ 2>/dev/null; then \
        echo "✓ API key found in build files"; \
    else \
        echo "✗ WARNING: API key NOT found in build files"; \
        echo "Checking dist structure:"; \
        find dist/ -type f; \
    fi

# Stage 2: Serve với Nginx
FROM nginx:1.25-alpine

# Xóa config mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy config nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/

# Copy file đã build từ stage builder
# Vite build vào thư mục 'dist'
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
