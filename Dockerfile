# Multi-stage build for production
FROM node:18-alpine AS client-build

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build server
FROM node:18-alpine AS server-build

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Final production image
FROM node:18-alpine

WORKDIR /app

# Copy server build and dependencies
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/package*.json ./server/
COPY --from=server-build /app/server/node_modules ./server/node_modules

# Copy client build
COPY --from=client-build /app/client/dist ./client/dist

# Expose ports
EXPOSE 3001

# Set working directory to server
WORKDIR /app/server

# Start the server
CMD ["node", "dist/index.js"]
