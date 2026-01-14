# Use Bun base image
FROM oven/bun:latest

LABEL maintainer="tech7@sumomedia.co"
LABEL app_environment="development"

# Set working dir
WORKDIR /app

# Copy lockfiles first (better caching)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Expose Nuxt dev port AND HMR port
EXPOSE 3000 24678

# Start Nuxt in dev mode
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]