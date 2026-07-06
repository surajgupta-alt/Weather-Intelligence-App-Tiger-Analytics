# AeroIntel Weather Intelligence System 🌌🌡️

AeroIntel is a high-fidelity full-stack weather application that integrates real-time meteorological coordinates with advanced generative diagnostics. Developed with a modern **"Frosted Glass" (Glassmorphism)** theme, AeroIntel turns standard atmosphere figures into highly personalized apparel guidelines, optimal activity timings, and multi-hazard safety reports using **Gemini AI**.

---

## 🛠️ Project Overview

AeroIntel is a weather-centric planning assistant. It solves the limitation of traditional weather apps that only present raw data (like "64% humidity" or "18°C") without translating it into practical advice. By utilizing structured JSON generation from the **Gemini 3.5 Flash** model, the system takes into account temperature, wind speeds, humidity, ultraviolet (UV) indices, and precipitation trends to answer three major user questions:
1. **What should I wear today?** (Apparel and Outfitting Suggestions)
2. **Is it safe to do my favorite activities?** (Activity Feasibility Reports)
3. **When is the best time to go outside?** (Optimal Scheduling Guidance)

The interface is built on a custom twilight theme, rich glassmorphic layers, radial gradients, blurred backdrops, and active animated accents.

---

## 🚀 Key Features

* **Real-time Meteorological Handshake**: Synchronizes instantly with local and global city telemetry using geocoding and the **Open-Meteo API**.
* **Astronomical Intel**: Computes precision sunrise/sunset schedules, atmospheric pressure, UV curves, and WMO meteorological codes.
* **Hourly Chronology Trends**: Multi-layered interactive charts (powered by **Recharts**) that toggle between Temperature Trend lines and Precipitation/Rain Probability curves.
* **Generative Weather Reports**: A server-side integration with **Gemini 3.5 Flash** to compile hyper-personalized, structured suggestions.
* **Deterministic Local Fallback**: When offline or if API keys are absent, a comprehensive meteorological rule engine activates to serve accurate fallbacks.
* **Atmospheric Favorites Registry**: Save frequently audited locations to local memory for single-click diagnostic retrieval.
* **"Frosted Glass" Visual Identity**: Glassmorphic borders (`border-white/10`), ambient backdrops (`backdrop-blur-xl`), fluid card animations, and a midnight slate palette.

---

## 💻 Tech Stack & Configuration

AeroIntel is built with a highly decoupled, modern full-stack web structure.

### Frontend
* **Core Framework**: React 19 & TypeScript 5
* **Build Bundler**: Vite 6
* **Styling Engine**: Tailwind CSS v4 (native CSS configuration, custom color extension, transition-utility filters)
* **Data Visualization**: Recharts 3 (rendering high-performance SVG area/line graphs with customized glassmorphic tooltips)
* **Animation Engine**: Motion v12 (`motion/react` layout transitions)
* **Iconographies**: Lucide-React 0.546 (vector indicators)

### Backend
* **Runtime**: Node.js
* **Server Framework**: Express 4 (custom proxy layer)
* **AI Engine**: `@google/genai` (Official modern Google GenAI SDK) using the `gemini-3.5-flash` model with schema enforcement.
* **Development Executor**: `tsx` (TypeScript Execute without compilation overhead)
* **Bundler & Compiler**: `esbuild` (bundling the TypeScript server into CJS for optimal container speeds)

---

## ⚙️ Environment Variables

AeroIntel reads environment variables securely from the backend to ensure secret API keys are never exposed to the client browser. Create a `.env` file in the root directory based on `.env.example`:

```env
# Required for making Gemini AI requests
GEMINI_API_KEY="your_gemini_api_key_here"

# The host URL where the app is running
APP_URL="http://localhost:3000"
```

---

## 🛠️ CLI Reference & Development Commands

All development tasks can be run through the terminal using standard `npm` scripts.

### 1. Install Dependencies
Initialize the project workspace by downloading all frontend and backend node modules:
```bash
npm install
```

### 2. Launch Local Development Server
Boots the Express backend server on port `3000` and configures Vite to handle Hot Module Replacement in the same process:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

### 3. Build for Production
Compiles the React single-page application into optimized static assets (`dist/`) and bundles the server-side TypeScript code into a single, self-contained CommonJS file (`dist/server.cjs`) using `esbuild` to bypass runtime import overheads:
```bash
npm run build
```

### 4. Start Production Server
Executes the fully compiled, optimized production server:
```bash
npm run start
```

### 5. Lint and Type-Check
Runs the TypeScript compiler in dry-run mode to ensure perfect type safety across all files:
```bash
npm run lint
```

### 6. Clean Artifacts
Deletes the production builds and compiled artifacts:
```bash
npm run clean
```

---

## 🧩 Directory Architecture

```
├── .env.example            # Environment blueprint variables
├── package.json            # Scripts and NPM dependency management
├── server.ts               # Express.js entrypoint & Gemini AI integration
├── tsconfig.json           # Global TypeScript compiler rules
├── vite.config.ts          # Vite compiler and asset configurations
├── index.html              # HTML DOM anchor
├── metadata.json           # Platform applet configuration
├── src/
│   ├── main.tsx            # React client mount root
│   ├── App.tsx             # Master Layout & core state machine
│   ├── index.css           # Global Tailwind CSS configurations & custom theme
│   └── components/         # Modular user interface blocks
│       ├── Header.tsx      # Diagnostic search panel, favorites, and quick actions
│       ├── CurrentWeather.tsx  # Hero conditions card & Astronomical telemetry
│       ├── WeatherCharts.tsx   # Recharts trend curves
│       ├── Forecast7Day.tsx    # Extended day-by-day telemetry preview grid
│       └── PlanningRecommendations.tsx # AI intelligence hub & activity checklist
```

---

## 🐙 Publishing to a GitHub Repository

To persist your progress and coordinate collaboration or deployment, push this codebase to a remote GitHub repository.

### Step 1: Initialize Git Local Workspace
If you are initializing git for the first time, open your terminal and run:
```bash
git init
```

### Step 2: Configure Staging and Commits
Add all source files to the local staging index (the existing `.gitignore` prevents uploading heavy cache directories like `node_modules` or local production builds):
```bash
git add .
git commit -m "feat: implement frosted glass theme & full-stack weather intelligence"
```

### Step 3: Create GitHub Remote Link
1. Navigate to [GitHub](https://github.com) and create a new repository (do not check "Initialize this repository with a README" to prevent conflict merges).
2. Copy the remote URL (e.g., `https://github.com/your-username/aero-intel.git`).
3. Set the remote path and rename your default branch to `main`:
```bash
git branch -M main
git remote add origin https://github.com/your-username/aero-intel.git
```

### Step 4: Push to Remote Repository
```bash
git push -u origin main
```

---

## ⚡ Deploying to Cloudflare via GitHub Integration

Cloudflare provides a world-class global network. Because this is a **Full-Stack Application** (composed of a static SPA client-side frontend and a server-side Node.js proxy to securely call Gemini AI), you have two standard routes to deploy to Cloudflare:

### Option A: Cloudflare Pages + Server-side Proxy (Recommended)
You deploy the static React frontend to **Cloudflare Pages** and configure the server endpoint separately, or adapt the backend Express endpoints to run inside **Cloudflare Pages Functions** (under a `/functions/api/` folder structure) to achieve 100% serverless edge distribution.

#### 1. Setup GitHub Connection in Cloudflare Dashboard
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
3. Authorize Cloudflare to access your GitHub account and select your newly published repository (`aero-intel`).

#### 2. Configure Build & Deployment Pipeline Settings
When setting up the project build options in Cloudflare, specify the following parameters:
* **Project Name**: `aero-intel`
* **Production Branch**: `main`
* **Framework Preset**: `Vite` (or set manually)
* **Build Command**: `npm run build`
* **Build Output Directory**: `dist` (this matches where Vite compiles client-side code)

#### 3. Inject Environment Secrets Securely
Cloudflare Pages lets you define backend variables so they remain hidden from search engines and network inspector logs:
1. Under your Cloudflare Pages project settings, click **Settings** > **Environment Variables**.
2. Add your server credentials:
   * **`GEMINI_API_KEY`**: Paste your Google Gemini API Key here.
3. Deploy the project. Cloudflare will automatically build and publish your React front-end to a secure `.pages.dev` subdomain on every commit push.

### Option B: Deploying Full-Stack with Wrangler (Express on Cloudflare Workers)
To host the full node-style web server on Cloudflare Edge using the **Cloudflare Workers** engine, you can adapt the Express application with a handler wrapper (like `@cloudflare/kv-asset-handler` or `hono`) or run Wrangler:

1. Install the Cloudflare Wrangler CLI tool:
   ```bash
   npm install -D wrangler
   ```
2. Configure a `wrangler.toml` file in your root to bind the assets:
   ```toml
   name = "aero-intel"
   main = "dist/server.cjs"
   compatibility_date = "2026-07-01"

   [assets]
   directory = "./dist"
   binding = "ASSETS"
   ```
3. Run Wrangler to publish:
   ```bash
   npx wrangler deploy
   ```

