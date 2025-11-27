FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies (requires package-lock.json)
RUN npm ci --omit=dev

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

# Build
RUN npm run build --workspace=@living-taskboard/backend

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace=@living-taskboard/backend"]
