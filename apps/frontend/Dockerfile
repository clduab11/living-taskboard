FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace=@living-taskboard/frontend", "--", "--host"]
