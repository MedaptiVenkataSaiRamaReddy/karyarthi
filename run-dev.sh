#!/bin/bash
# ════════════════════════════════════════════════════════════════
#  Karyarthi — Local Development Startup
#  Prerequisites: JDK 21, Maven, Node 20, MongoDB running locally
# ════════════════════════════════════════════════════════════════
set -e

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║     Karyarthi — Dev Startup           ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# ── Check MongoDB is running ─────────────────────────────────────
if ! mongosh --eval "db.runCommand({ping:1})" --quiet &>/dev/null; then
  echo "⚠️  MongoDB not detected on localhost:27017"
  echo "   Start it with: brew services start mongodb-community"
  echo "   Or use the Atlas URI: export SPRING_DATA_MONGODB_URI='mongodb+srv://...'"
  echo ""
fi

# ── Build frontend ───────────────────────────────────────────────
if [ -d "frontend" ]; then
  echo "📦 Building Vite frontend..."
  cd frontend && npm install --silent && npm run build
  cd ..
  echo "✅ Frontend ready → src/main/resources/static/"
fi

# ── Build backend ────────────────────────────────────────────────
echo "☕ Building Spring Boot backend..."
./mvnw package -DskipTests -q
echo "✅ Backend JAR built"

echo ""
echo "🚀 Starting Karyarthi on http://localhost:${PORT:-8081}"
echo ""
echo "Required env vars for full functionality:"
echo "  SPRING_DATA_MONGODB_URI  — MongoDB Atlas connection string"
echo "  JWT_SECRET               — Min 32 chars, change in prod"
echo "  ANTHROPIC_API_KEY        — For AI resume optimization"
echo "  RAZORPAY_KEY_ID          — For ₹9 payment processing"
echo "  RAZORPAY_KEY_SECRET"
echo "  SMTP_USER / SMTP_PASSWORD — For email (optional)"
echo ""

exec java \
  -Dserver.port=${PORT:-8081} \
  -jar target/karyarthi-*.jar
