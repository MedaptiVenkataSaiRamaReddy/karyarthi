# ════════════════════════════════════════════════════════════════
#  Karyarthi — Production Dockerfile
#  Multi-stage: Node (frontend) + Maven (backend) → slim JRE image
# ════════════════════════════════════════════════════════════════

# ── Stage 1: Build Vite frontend ────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build
# output → /app/frontend/../src/main/resources/static  (relative path in vite.config.js)
# But in Docker we need to copy it explicitly:
RUN ls -la ../src/main/resources/static 2>/dev/null || echo "No static dir from vite"

# ── Stage 2: Build Spring Boot backend ──────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Cache Maven dependencies first (faster rebuilds)
COPY pom.xml mvnw ./
COPY .mvn .mvn/
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q 2>/dev/null || true

# Copy source
COPY src ./src

# Copy frontend build output into Spring's static directory
COPY --from=frontend /app/frontend/../src/main/resources/static ./src/main/resources/static/ 2>/dev/null || true
# Fallback: copy from the mounted build output
COPY --from=frontend /app/src/main/resources/static ./src/main/resources/static/ 2>/dev/null || true

# Build JAR (skip tests in CI — run them separately)
RUN ./mvnw package -DskipTests -q

# ── Stage 3: Slim runtime image ─────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory
RUN mkdir -p uploads/generated

# Copy built JAR
COPY --from=builder /app/target/karyarthi-*.jar app.jar

# Expose port (Railway/Render set PORT env var automatically)
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8081}/api/health || exit 1

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dserver.port=${PORT:-8081}", \
  "-jar", "app.jar"]
