# Karyarthi — Master Clone & Setup Guide

## Project Overview
**Karyarthi** is an AI-powered Resume SaaS Platform for resume optimization, parsing, and generation.

- **Technology Stack**: Spring Boot 3 + React 19 + Vite + MongoDB
- **Backend**: Java 21, Spring Boot 3.5.14, JWT Authentication, Razorpay Payments
- **Frontend**: React 19.2, Vite 8, React Router, Tailwind CSS
- **Database**: MongoDB (Atlas or Local)
- **Deployment**: Docker, Railway/Render-ready

---

## 🎯 Prerequisites

### Local Development
- **Java 21** — `java -version` should show 21.x.x
- **Maven 4.0+** — `mvn -v` (or use bundled `./mvnw`)
- **Node.js 20+** — `node -v` and `npm -v`
- **MongoDB 6.0+** — Running locally OR using MongoDB Atlas
- **Git** — For cloning the repo

### Required for Full Features (Optional but Recommended)
- **MongoDB Atlas Account** — Free tier available at [mongodb.com/atlas](https://mongodb.com/atlas)
- **Anthropic API Key** — For AI resume optimization (optional during development)
- **Razorpay API Keys** — For payment processing (optional)
- **Gmail Account** — For SMTP email sending (optional)

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/karyarthi.git
cd karyarthi
```

---

## 🔧 Step 2: Set Up Local Environment

### Create `.env` file in project root (for local development):

```bash
# MongoDB — Use local or Atlas
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/karyarthi
# OR for Atlas:
# SPRING_DATA_MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/karyarthi?retryWrites=true&w=majority

# JWT Secret (min 32 characters)
JWT_SECRET=your-local-dev-secret-must-be-min-32-characters-long

# API Keys (optional for dev, required for production)
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Not required for basic testing
NVIDIA_API_KEY=nvapi-xxxxx      # Default included for local dev
AI_MODEL=meta/openai/gpt-oss-20b

# Razorpay Payment Keys (optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email Configuration (optional)
SMTP_USER=
SMTP_PASSWORD=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# CORS & Frontend URL
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081
FRONTEND_URL=http://localhost:5173

# File Upload Directory
UPLOAD_DIR=uploads

# Server Port
PORT=8081
```

### Load Environment Variables

**Windows (PowerShell):**
```powershell
# Option 1: Set individual variables
$env:SPRING_DATA_MONGODB_URI = "mongodb://localhost:27017/karyarthi"
$env:JWT_SECRET = "your-local-dev-secret-min-32-chars"
$env:PORT = "8081"

# Option 2: Create a .env file and use a tool like dotenv
```

**macOS/Linux (Bash):**
```bash
export SPRING_DATA_MONGODB_URI="mongodb://localhost:27017/karyarthi"
export JWT_SECRET="your-local-dev-secret-min-32-chars"
export PORT="8081"
```

---

## 🗄️ Step 3: Set Up MongoDB

### Option A: Local MongoDB (macOS with Homebrew)
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Option B: Docker Container
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option C: MongoDB Atlas (Cloud)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account and new project
3. Create a free M0 cluster
4. Click **Connect** → **Drivers** → Copy your connection string
5. Add the URI to your `.env` file

---

## 🚀 Step 4: Build & Run Locally

### Quick Setup (All-in-One):

**Windows:**
```powershell
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build and run backend
.\mvnw.cmd clean package -DskipTests
java -Dserver.port=8081 -jar target/karyarthi-1.0.0.jar
```

**macOS/Linux:**
```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build and run backend
./mvnw clean package -DskipTests
java -Dserver.port=8081 -jar target/karyarthi-1.0.0.jar
```

### Or Use the Development Script:

```bash
# macOS/Linux
chmod +x run-dev.sh
./run-dev.sh

# Windows - you can adapt the script or run the commands manually
```

### Run Frontend in Development Mode (Hot Reload):

Open a **new terminal** in `frontend/` directory:
```bash
cd frontend
npm run dev
# Frontend available at http://localhost:5173
```

---

## 🌐 Access Your Application

| Component | URL | Notes |
|-----------|-----|-------|
| Frontend | `http://localhost:5173` | Hot reload enabled |
| Backend API | `http://localhost:8081` | Spring Boot |
| API Docs | `http://localhost:8081/swagger-ui.html` | OpenAPI/Swagger |
| Admin Setup | `http://localhost:8081/admin/setup` | First-time admin creation |

---

## 👨‍💼 Step 5: Admin Setup (First Time Only)

### Local Development:
1. Open `http://localhost:8081/admin/setup`
2. Fill in admin details:
   - Full Name: `Admin`
   - Email: `admin@example.com`
   - Password: `SecurePass123`
3. Submit
4. Login at `http://localhost:8081/admin` with your credentials

---

## 📦 Step 6: Project Structure Overview

```
karyarthi/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── contexts/           # React Context (Auth, Resume)
│   │   ├── services/           # API calls
│   │   ├── hooks/              # Custom React hooks
│   │   └── assets/             # Images, icons, CSS
│   ├── package.json
│   └── vite.config.js
├── src/                        # Spring Boot backend
│   ├── main/java/com/example/demo/
│   │   ├── DemoApplication.java        # Main entry point
│   │   ├── controller/                 # REST endpoints
│   │   ├── service/                    # Business logic
│   │   ├── repository/                 # MongoDB data access
│   │   ├── entity/                     # Data models
│   │   ├── dto/                        # Data transfer objects
│   │   ├── security/                   # JWT, authentication
│   │   ├── config/                     # Spring configuration
│   │   └── exception/                  # Error handling
│   └── resources/application.yml       # Spring Boot config
├── pom.xml                     # Maven dependencies
├── Dockerfile                  # Production Docker image
├── mvnw / mvnw.cmd            # Maven wrapper (cross-platform)
├── DEPLOY.md                   # Deployment guide
├── run-dev.sh                  # Dev startup script
└── README.md
```

---

## 🧪 Step 7: Testing the Application

### Test User Registration:
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "fullName": "Test User"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Test Resume Upload:
```bash
# Upload a resume (PDF, DOCX, or TXT)
curl -X POST http://localhost:8081/api/resumes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

### Test Health Check:
```bash
curl http://localhost:8081/api/health
```

---

## 🐳 Step 8: Docker & Production Build

### Build Docker Image Locally:
```bash
docker build -t karyarthi:latest .
```

### Run Docker Container Locally:
```bash
docker run -d \
  -p 8081:8081 \
  -e SPRING_DATA_MONGODB_URI="mongodb+srv://user:pass@cluster.net/karyarthi" \
  -e JWT_SECRET="your-prod-secret-min-32-chars" \
  -e RAZORPAY_KEY_ID="your-key" \
  -e RAZORPAY_KEY_SECRET="your-secret" \
  -e ANTHROPIC_API_KEY="your-api-key" \
  --name karyarthi \
  karyarthi:latest
```

### View Logs:
```bash
docker logs -f karyarthi
```

---

## ☁️ Step 9: Deploy to Production (Railway/Render)

### Deploy to Railway (Recommended)

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/karyarthi.git
   git branch -M main
   git push -u origin main
   ```

2. **On Railway Dashboard:**
   - New Project → Deploy from GitHub
   - Select `yourusername/karyarthi`
   - Railway auto-detects Docker and builds

3. **Set Environment Variables** in Railway Dashboard:
   | Variable | Example Value |
   |----------|---------------|
   | `SPRING_DATA_MONGODB_URI` | `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/karyarthi?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `your-secure-32-char-min-secret-key` |
   | `ANTHROPIC_API_KEY` | `sk-ant-xxxxx` |
   | `RAZORPAY_KEY_ID` | `razorpay_key_id_xxxxx` |
   | `RAZORPAY_KEY_SECRET` | `razorpay_key_secret_xxxxx` |
   | `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` |
   | `SMTP_USER` | `your-email@gmail.com` |
   | `SMTP_PASSWORD` | `your-app-password` |

4. **Railway provides a public URL** like `https://karyarthi.up.railway.app`

### Deploy Frontend to Vercel

1. **Create `frontend/.env.production`:**
   ```
   VITE_API_URL=https://karyarthi.up.railway.app
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import project → Select `frontend/` folder
   - Set environment variables → Deploy

---

## 📝 Environment Variables Reference

### Core (Always Required)
- `SPRING_DATA_MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Min 32 chars for token signing
- `PORT` — Server port (default: 8081)

### Optional but Recommended
- `ANTHROPIC_API_KEY` — For AI resume optimization
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Payment processing
- `SMTP_USER` / `SMTP_PASSWORD` — Email notifications
- `ALLOWED_ORIGINS` — CORS origins (comma-separated)
- `FRONTEND_URL` — Frontend URL for redirects

### AI & NLP
- `NVIDIA_API_KEY` — Nvidia API for LLM (provided default)
- `AI_MODEL` — Model name (default: `meta/openai/gpt-oss-20b`)

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `mongosh --eval "db.runCommand({ping:1})"`
- Or use MongoDB Atlas URI instead

### Port Already in Use
```
Address already in use: 0.0.0.0:8081
```
**Solution:**
```bash
# Find process using port 8081
lsof -i :8081  # macOS/Linux
netstat -ano | findstr :8081  # Windows

# Kill the process or use different port:
java -Dserver.port=8080 -jar target/karyarthi-1.0.0.jar
```

### Frontend API Calls Failing (CORS Error)
**Solution:** Ensure `ALLOWED_ORIGINS` environment variable includes your frontend URL:
```bash
export ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081
```

### Node/npm Version Issues
**Solution:**
```bash
node -v  # Should be 20+
npm -v   # Should be 10+

# Update if needed:
npm install -g npm@latest
```

### Java Version Mismatch
**Solution:**
```bash
java -version  # Should show 21.x

# If not installed:
# Download from oracle.com/java or use SDKMAN: sdk install java 21.0.x
```

---

## 📚 Key API Endpoints

### Authentication
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login (returns JWT)
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Logout

### Resume Management
- `POST /api/resumes` — Upload & parse resume
- `GET /api/resumes/{id}` — Fetch resume by ID
- `GET /api/resumes` — List user's resumes
- `DELETE /api/resumes/{id}` — Delete resume

### Admin
- `POST /api/admin/bootstrap` — Create first admin (secure endpoint)

### Health
- `GET /api/health` — Service health check

---

## 🚀 Next Steps After Setup

1. **Explore the codebase** — Check `src/main/java` for backend logic
2. **Frontend development** — Run `npm run dev` in `frontend/` for hot-reload
3. **Database** — Create sample data in MongoDB or via API
4. **Testing** — Run unit tests: `./mvnw test`
5. **Deployment** — Follow Step 9 for production deployment

---

## 📞 Support & Resources

- **Spring Boot Docs**: [spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
- **React Docs**: [react.dev](https://react.dev)
- **MongoDB Docs**: [docs.mongodb.com](https://docs.mongodb.com)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **JWT Intro**: [jwt.io](https://jwt.io)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Clone successful: `git clone` completed
- [ ] Java 21 installed: `java -version` shows 21.x
- [ ] Node.js 20+ installed: `node -v` and `npm -v` correct
- [ ] MongoDB running: `mongosh` connects successfully
- [ ] Environment variables set: `.env` file created
- [ ] Frontend built: `npm run build` succeeds
- [ ] Backend compiles: `./mvnw clean package` succeeds
- [ ] Services running: Backend on 8081, frontend on 5173
- [ ] API responds: `curl http://localhost:8081/api/health` returns success
- [ ] Admin setup complete: Can login at `/admin`
- [ ] UI loads: `http://localhost:5173` displays landing page

---

**Last Updated:** June 2026  
**Application Version:** 1.0.0  
**License:** MIT or as per your repo settings

