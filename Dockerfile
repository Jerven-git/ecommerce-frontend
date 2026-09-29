# Use specific Bun version
FROM oven/bun:1.3.11

LABEL maintainer="tech7@sumomedia.co"
LABEL app_environment="development"

# Set working dir
WORKDIR /app

# Copy package files first so dependency layers only rebuild when they change
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Expose Nuxt dev port AND HMR port
EXPOSE 3000 24678

# Dependencies are baked into the image and copied into the named volume on its
# first use. Rebuild the image when package files change.
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
