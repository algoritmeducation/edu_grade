# Base Node.js environment
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production || npm install --production

# Copy application source code
COPY . .

# Expose server port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start Express server
CMD ["node", "server.js"]
