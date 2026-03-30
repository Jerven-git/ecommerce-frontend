# Use specific Bun version
FROM oven/bun:1.3.11

LABEL maintainer="tech7@sumomedia.co"
LABEL app_environment="development"

# Set working dir
WORKDIR /app

# Copy package files first
COPY package.json ./

# Install dependencies
RUN bun install

# Copy the rest of the app
COPY . .

# Expose Nuxt dev port AND HMR port
EXPOSE 3000 24678

# Install deps into the named volume (if needed) and start dev server
CMD ["sh", "-c", "bun install --frozen-lockfile 2>/dev/null || bun install && bun run dev --host 0.0.0.0"]