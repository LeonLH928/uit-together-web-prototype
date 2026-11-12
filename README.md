# UIT-Together Research Group Web Portal

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern, high-performance web portal and publication management system for the **UIT-Together Research Group** at the University of Information Technology (VNU-HCM).

This project modernizes the legacy Jekyll static site into a data-driven, accessible, and fast web platform featuring an integrated management hub designed specifically for a **single administrator** to publish research without writing code.

---

## 🔬 About UIT-Together

**UIT-Together** is an academic research group affiliated with the **University of Information Technology, Vietnam National University - Ho Chi Minh City (VNU-HCM)**, operating out of **Room A108, Block A**.

Led by **Dr. Nguyễn Tấn Trần Minh Khang** and **Dr. Võ Duy Nguyên**, the group conducts foundational and applied research in:
- **Aerial & UAV Computer Vision**: Rotated object detection, adverse weather dehazing (fog, rain), and drone aerial surveillance.
- **Traffic Anomaly Detection**: Deep spatial-temporal modeling on UAV streams and collision prediction (`UIT-ADrone`).
- **Vietnamese Document AI**: Optical character recognition, document layout analysis, and benchmark suites.
- **Multimodal AI**: Vision-language reasoning, human-object interaction, and Vietnamese image captioning (`UIT-OpenViIC`).

---

## 🏗️ Architecture & Modernization Highlights

| Dimension | Legacy Jekyll Site (`UIT-Together.github.io`) | Modern Portal (`prototype/`) |
| :--- | :--- | :--- |
| **Content Architecture** | Hardcoded HTML tables and divs (`papers/index.html`) | **Typed, structured JSON collections** (`src/data/`) |
| **Admin Experience** | Manual HTML editing, Git CLI, and Ruby/Rake maintenance | **Built-in `/admin` web hub** with BibTeX auto-parser & GitHub API direct commit |
| **Tech Stack** | Ruby 2.x, Jekyll, Bootstrap 3/4, jQuery | **Vite 6, React 19, React Router v7, Tailwind CSS v4, Phosphor Icons** |
| **State & Cache** | Static HTML only | **Zustand + TanStack Query** (reactive search, instant client filters, 10-per-page pagination) |
| **Citations** | Static text | **1-click BibTeX copy modal**, DOI badges, PDF links |
| **Branding & Assets** | Legacy generic templates | **Official UIT-Together high-res branding & SVG logos** |
| **Hosting Cost** | $0/mo (GitHub Pages) | **$0/mo (GitHub Pages or Vercel)** |

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: v20+ (recommended: v24+)
- **Package Manager**: `pnpm` (recommended: v10+)

```bash
# Verify runtimes
node -v
pnpm -v
```

### Installation & Development

```bash
# Navigate under uit-together-web-prototype/ directory first

# Install dependencies
pnpm install

# Start local development server with Hot Module Replacement (HMR)
pnpm run dev
```

Open your browser at **`http://localhost:5173`**.

### Building for Production

```bash
# Typecheck and compile static bundle
pnpm run build

# Preview production build locally
pnpm run preview
```

Static build outputs are emitted to `prototype/dist/`, ready for zero-server deployment to GitHub Pages or any static CDN.

---

## 🗂️ Project Structure

```
prototype/
├── public/
│   ├── images/
│   │   ├── team/             # Researcher and faculty photos
│   │   ├── papers/           # Publication figures and thumbnails
│   │   └── projects/         # Dataset and project banners
│   └── logo.svg              # Lab brand SVG logo
├── src/
│   ├── components/
│   │   ├── Navbar.tsx        # Responsive header with mobile drawer
│   │   ├── Footer.tsx        # University contact, map, and lab address
│   │   ├── PaperCard.tsx     # Publication card with quartile badges & actions
│   │   ├── BibtexModal.tsx   # Interactive BibTeX viewer and clipboard copy
│   │   └── MemberCard.tsx    # Academic researcher card with Scholar/GitHub
│   ├── data/                 # Seeded structured data collections
│   │   ├── papers.json       # 95+ publications migrated from legacy site
│   │   ├── members.json      # Faculty, researchers, graduate students, alumni
│   │   ├── news.json         # Announcements and defense notices
│   │   ├── datasets.json     # Lab datasets (UIT-ADrone, UIT-DODV, etc.)
│   │   ├── tutorials.json    # Lab guides and external HackMD links
│   │   └── projects.json     # Core research domains
│   ├── pages/
│   │   ├── Home.tsx          # Hero banner, stats, news feed, featured papers
│   │   ├── Papers.tsx        # Real-time search, year & type filters, BibTeX modal
│   │   ├── Research.tsx      # Research pillars and benchmark datasets
│   │   ├── Team.tsx          # People categorized by role with join FAQ
│   │   ├── Tutorials.tsx     # External tutorial links and lab guides
│   │   ├── DatasetsPage.tsx  # Benchmark datasets showcase
│   │   └── Admin.tsx         # Passcode-gated Single-Admin Management Hub
│   ├── store/
│   │   └── useDataStore.ts   # Zustand state with localStorage synchronization
│   ├── types/
│   │   └── index.ts          # TypeScript domain interfaces
│   ├── App.tsx               # Route declarations
│   ├── index.css             # Tailwind CSS v4 design tokens
│   └── main.tsx              # Application bootstrap
├── package.json
├── tsconfig.json
└── vite.config.ts            # Vite bundler with @tailwindcss/vite & code-splitting
```

---

## 🛡️ Single-Admin Content Management Guide

The website features a dedicated administrative portal at **`/admin`** specifically engineered for the single lab administrator.

### 1. Authenticating
1. Navigate to `http://localhost:5173/admin` (or `https://uit-together.github.io/admin` in production).
2. Enter the admin passcode. The default prototype passcode is:
   ```
   uit-admin
   ```
   *(or `uit2024`)*

### 2. Adding a Research Publication
1. Go to the **Publications** tab.
2. **Option A (Instant Import via BibTeX)**:
   - Paste a standard BibTeX entry into the **Auto-Fill from BibTeX** box.
   - Click **"Parse & Auto-Fill"**. The form fields (Title, Authors, Venue, Year, DOI) will automatically populate!
3. **Option B (Manual Entry)**:
   - Enter Title, Authors (comma-separated), Venue, Year, Type (Journal or Conference), and Quartile (e.g. `SCIE, Q1, IF: 5.1`).
   - Add optional links: DOI URL, PDF URL, Code/Dataset URL.
4. Preview the paper card live in real-time on the right side of the screen.
5. Click **"Save Publication"**. The publication will immediately appear in the public `/papers` directory!

### 3. Publishing to Production (Zero Server Overhead)

Because this website is 100% static, there is no database server to maintain. You can publish updates through either of two straightforward workflows:

#### Workflow A: Direct Browser-to-GitHub API Commit (Recommended for iPad / Web)
1. Open the **GitHub Sync & Export** tab in `/admin`.
2. Enter your **GitHub Personal Access Token (PAT)** (requires `repo` write permissions).
3. Confirm repository name: `UIT-Together/UIT-Together.github.io`.
4. Click **"Publish & Commit to GitHub"**.
5. The browser will directly commit the updated `papers.json` into the GitHub repository via GitHub's REST API.
6. GitHub Actions will detect the commit and automatically deploy the updated site in ~20 seconds!

#### Workflow B: Local Git Push (Recommended during dev)
1. In local dev mode, save your new publications in `/admin`.
2. Click **"Download Updated papers.json"** or export the file.
3. Commit and push:
   ```bash
   git add src/data/papers.json
   git commit -m "Add new publications for 2024"
   git push origin main
   ```

### 4. Managing Announcements & Tutorials
- **Announcements**: Add recent paper acceptances, student defenses, or awards from the **Announcements** tab.
- **Tutorials**: Add external tutorial links (e.g. HackMD, Google Colab, official documentation) from the **Tutorials** tab.

---

## 🌐 Deployment Instructions

### Option 1: GitHub Pages (Default & 100% Free)

To deploy to `https://uit-together.github.io`:

1. Add a GitHub Actions workflow at `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
          cache-dependency-path: 'prototype/pnpm-lock.yaml'
      - name: Install dependencies
        run: cd prototype && pnpm install --frozen-lockfile
      - name: Build
        run: cd prototype && pnpm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'prototype/dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
2. In GitHub repository settings: **Pages** -> **Source** -> Select **GitHub Actions**.

### Option 2: Vercel (Edge CDN & Instant PR Previews)

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set Root Directory to `prototype`.
3. Build command: `pnpm run build`.
4. Output directory: `dist`.
5. Deploy! Every branch push will automatically generate an immutable preview URL.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Copyright (c) UIT-Together Research Group, University of Information Technology (VNU-HCM).
