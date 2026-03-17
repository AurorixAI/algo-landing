# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS production

WORKDIR /app

# Ensure we have a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactjs

# Re-install only production dependencies (optional if dist is fully standalone, 
# but needed for express backend typically)
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets
COPY --from=builder /app/dist ./dist

# Provide appropriate env
ENV NODE_ENV=production
ENV PORT=5000

USER reactjs

EXPOSE 5000

CMD ["npm", "start"]
