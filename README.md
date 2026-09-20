<p align="center">
  <a href="https://github.com/muneebkhan08/Capite">
    <img src="docs/capite-logo.png" alt="Capite Logo" width="160" style="border-radius: 28px; box-shadow: 0 12px 36px rgba(0,0,0,0.25);" />
  </a>
</p>

<h1 align="center">Capite</h1>

<p align="center">
  <strong>The Open-Source AI Video Captions & Animated Motion Subtitles Studio</strong>
</p>

<p align="center">
  Transform any video into engaging, viral content with word-animated captions in seconds.<br/>
  27 trending motion styles &bull; Interactive word-level transcript editor &bull; Instant in-place re-rendering &bull; Multi-format export (MP4, SRT, VTT, TXT, ASS) &bull; 100+ languages &bull; 100% self-hosted &bull; Private & free forever.
</p>

<p align="center">
  <a href="https://github.com/muneebkhan08/Capite/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT"></a>
  <a href="https://github.com/muneebkhan08/Capite"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Ready"></a>
  <a href="https://github.com/muneebkhan08/Capite"><img src="https://img.shields.io/badge/Next.js-16%20(React%2019)-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 16"></a>
  <a href="https://github.com/muneebkhan08/Capite"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.11+"></a>
  <a href="https://github.com/muneebkhan08/Capite"><img src="https://img.shields.io/badge/AI-faster--whisper-brightgreen.svg?style=flat-square" alt="faster-whisper"></a>
  <a href="https://github.com/muneebkhan08/Capite"><img src="https://img.shields.io/badge/Styles-27%20Motion%20Presets-orange.svg?style=flat-square" alt="27 Motion Presets"></a>
  <a href="https://www.linkedin.com/in/muhammadmuneebkhan8304/"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:muneebkhan08304@gmail.com"><img src="https://img.shields.io/badge/Email-Contact-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>
</p>

<p align="center">
  <img src="docs/screenshots/capite-hero-landing.jpg" alt="Capite — AI Video Caption Studio Interface" width="950" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);">
</p>

---

## 📑 Table of Contents

1. [About Capite](#-about-capite)
2. [Interface & Studio Showcase](#-interface--studio-showcase)
3. [Key Features](#-key-features)
4. [Quick Start Guide](#-quick-start-guide)
   - [Docker Setup (Recommended)](#1-docker-compose-recommended)
   - [Local Development Setup](#2-local-development-setup)
5. [Complete Usage Guide](#-complete-usage-guide)
6. [27 Built-In Caption Styles](#-27-built-in-caption-styles)
7. [Subtitle & Video Export](#-subtitle--video-export)
8. [System Architecture](#-system-architecture)
9. [REST API Reference](#-rest-api-reference)
10. [Configuration & Environment Variables](#-configuration--environment-variables)
11. [Documentation Index](#-documentation-index)
12. [Creator & Contact](#-creator--contact)
13. [License](#-license)

---

## ⚡ About Capite

**Capite** is a modern, high-performance, open-source video captioning studio designed for content creators, video editors, and developers. Built from the ground up to bring viral, animated typography to your short-form and long-form videos without relying on costly third-party SaaS subscriptions.

### The Stack
- **AI Speech Transcription**: Powered by `faster-whisper` (CTranslate2-optimized Whisper models) providing blazing fast, offline speech-to-text with millisecond-accurate word timestamps.
- **Motion Typography Engine**: `pysubs2` + `FFmpeg libass` rendering broadcast-grade ASS subtitle animations directly into high-definition video.
- **Web Studio**: Next.js 16 (React 19) App Router, Tailwind CSS v4, and a warm paper-inspired Oat & Clay design system with full dark and light mode support.

**Zero cloud subscriptions. Zero watermarks. Zero minute caps. Zero telemetry.** Everything runs 100% locally on your machine.

---

## 📸 Interface & Studio Showcase

### 1. Interactive Studio & Word-Level Transcript Editor
Edit transcript errors, adjust word timing, tweak styles, and re-render in seconds — all in one unified workspace.

<p align="center">
  <img src="docs/screenshots/capite-studio-editor.jpg" alt="Capite Studio - Word-Level Transcript Editor" width="950" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);">
</p>

- **Click-to-Seek Word Chips**: Every word is rendered as an interactive chip. Click any word to jump playback directly to that millisecond.
- **Direct Inline Editing**: Fix transcription typos, technical terms, or names immediately in the script cards.
- **Timing Nudge Controls**: Adjust sentence segment boundaries with `-0.1s` / `+0.1s` micro-nudges.
- **Batch Text Tools**: Built-in Find & Replace, text casing converters (`AA` UPPERCASE, `Aa` Title Case, `aa` lowercase), auto-scroll follower, and one-click copy.
- **Synchronized Video Player**: Variable playback speed (`0.75x`, `1x`, `1.25x`, `1.5x`), frame seeking, and instant preview.

---

### 2. 27 Caption Styles & Live Mobile Mockup Preview
Browse trending, editorial, pop, and tech styles with a responsive live phone preview before processing.

<p align="center">
  <img src="docs/screenshots/capite-style-picker.jpg" alt="Capite Style Picker and Live Mockup" width="950" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);">
</p>

- **Categorized Presets**: Filter through *Trending (8)*, *Clean & Tech (5)*, *Editorial & Film (6)*, and *Pop & Expressive (8)*.
- **Style Details**: Real-time descriptions of animation types, active fonts, and recommended content formats (e.g., Podcasts, TikTok, Reels, Financial, Documentaries).
- **Interactive Positioning**: Drag subtitles up or down on the phone screen or use quick presets (`Top`, `Middle`, `Bottom`).
- **Dynamic Backgrounds**: Test subtitle visibility against multiple mock backdrops (`Cinematic`, `Dark Glass`, `Light`, `Grid`).

---

### 3. Motion & Style Customizer & Light/Dark Themes
Fine-tune fonts, animation physics, weight transitions, and color shaders.

| Studio Style & Motion Panel | Paper Oat Light Mode |
|:---:|:---:|
| ![Capite Studio Motion and Style Editor](docs/screenshots/capite-studio-style-motion.png) | ![Capite Light Mode Theme](docs/screenshots/capite-hero-light.jpg) |
| *Customize fonts, font weights, weight transitions, casing, and custom color shaders.* | *Warm, paper-inspired oat light palette with accessible WCAG AA contrast.* |

---

## ✨ Key Features

- **27 Viral Caption Styles**: Inspired by top creators across TikTok, YouTube Shorts, and Instagram Reels (Hormozi, MrBeast, Crimson Pop, Podcast Viral, Submagic Storyteller, Ali Abdaal, Vox Explainer, and more).
- **7 Motion Engines**: Dynamic Word Highlight, Karaoke Fill, Pop-In / Spring, Elastic Bounce, Smooth Zoom / Scale, Neon Glow, and Accent Highlight Box.
- **Interactive Live Studio Suite**: Word-level transcript editing, click-to-seek playback, millisecond timestamp adjustment, and keyboard shortcuts (`Space` to play/pause).
- **Instant In-Place Re-Rendering**: Updated words or picked a new motion style? Re-burn your video in seconds without re-running transcription!
- **Multi-Format Subtitle Export**: Download hardcoded HD MP4, SubRip (`.srt`), WebVTT (`.vtt`), plain text (`.txt`), or Advanced SubStation Alpha (`.ass`).
- **100+ Languages with Script-Aware Fonts**: Automatic language detection with script-aware font fallback (Latin, CJK, Arabic, Devanagari, Thai, Hebrew, Cyrillic).
- **100% Private, Local & Self-Hosted**: Your videos, audio, and transcripts never leave your computer. No external API keys needed.
- **Modern Oat & Clay Design System**: Crafted with Next.js 16, React 19, and Tailwind CSS v4 for an elegant, distraction-free editing experience.

---

## 🚀 Quick Start Guide

### 1. Docker Compose (Recommended)

Run Capite with Docker in under 2 minutes:

```bash
# 1. Clone repository
git clone https://github.com/muneebkhan08/Capite.git
cd Capite

# 2. Launch services
docker compose up
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

To stop the containers:
```bash
docker compose down
```

---

### 2. Local Development Setup

#### Prerequisites
- **Python 3.11+**
- **Node.js 20+** & npm
- **FFmpeg** with `libass` support (`brew install ffmpeg` on macOS, `sudo apt install ffmpeg libass-dev` on Ubuntu/Debian)

#### One-Command Setup
```bash
# 1. Clone repository
git clone https://github.com/muneebkhan08/Capite.git
cd Capite

# 2. Run automated setup (creates virtualenv & installs packages)
make setup

# 3. Start development servers (frontend on :3000, backend on :5000)
make dev
```

#### Manual Setup

**Backend (Flask):**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Frontend (Next.js 16):**
```bash
cd frontend
npm install
DATABASE_URL="file:./data/captions.db" npx prisma generate
DATABASE_URL="file:./data/captions.db" npx prisma db push
DATABASE_URL="file:./data/captions.db" npm run dev
```

---

## 📖 Complete Usage Guide

### Step 1: Upload Your Video
- Drag and drop your `.mp4`, `.mov`, or `.webm` file into the upload dropzone (up to 500MB, up to 30 minutes duration).
- Select your preferred default caption style from the 27 presets.
- Drag the caption position slider to adjust vertical placement on the screen (5% to 50% from the bottom).
- Click **Generate Captions →**.

### Step 2: Transparent Processing Pipeline
- **Upload**: Video streams directly to the local backend.
- **Transcribe**: `faster-whisper` isolates spoken words and generates millisecond-accurate timestamps and language confidence.
- **Generate Subtitles**: `pysubs2` constructs an ASS subtitle script applying animations, highlight shaders, and fonts.
- **Burn-In**: FFmpeg burns the subtitle layer onto the video using `libass` at CRF 18 visually lossless quality.

### Step 3: Studio Transcript & Motion Editor
- Once completed, the Studio Editor opens automatically.
- **Seek Video**: Click any word in the transcript on the right to jump playback to that exact word.
- **Edit Script**: Click on any word to fix speech typos, replace names, or modify punctuation.
- **Customize Motion & Typography**: Switch to the **Motion & Style** tab to test new fonts, font weights, weight transitions (`light_to_bold` or `bold_to_light`), or custom colors.
- **Re-render**: Click **Apply & Re-render** to burn the new subtitles into the video in seconds without waiting for transcription again.

### Step 4: Export Your Work
- Click **Download Video (.mp4)** to download your final captioned video.
- Or click **.SRT**, **.VTT**, or **.TXT** to export subtitle files for Premiere Pro, DaVinci Resolve, Final Cut, or YouTube.

---

## 🎨 27 Built-In Caption Styles

| Preset ID | Name | Category | Animation | Primary Color | Highlight Color | Best For |
|---|---|---|---|---|---|---|
| `hormozi` | Hormozi | Trending | Highlight | White `#FFFFFF` | Cyan `#00FFFF` | Business & Motivation |
| `mrbeast` | MrBeast | Trending | Highlight | Yellow `#FFFF00` | Orange `#FF6600` | Gaming & Entertainment |
| `crimson-pop` | Crimson Pop | Trending | Box Pop | White `#FFFFFF` | Crimson `#DC2626` | High-Retention Hooks |
| `podcast-viral` | Podcast Viral | Trending | Highlight | White `#FFFFFF` | Electric Lime `#A3E635` | Podcasts & Interviews |
| `fintech-wealth` | Fintech & Wealth | Trending | Glow | Fluorescent `#E0E7FF` | Emerald `#10B981` | Finance & Tech |
| `dark-documentary`| Dark Documentary | Trending | Scale | Pale Gray `#F1F5F9` | Crimson `#E11D48` | Crime & Mystery Stories |
| `submagic` | Submagic Storyteller | Trending | Bounce | Cream `#FEF9C3` | Vivid Purple `#A855F7` | Narrative & Storytelling |
| `dark-psychology` | Dark Psychology | Trending | Glow | Pure White `#FFFFFF` | Blood Red `#DC2626` | Thrillers & Philosophy |
| `classic` | Classic | Trending | Highlight | White `#FFFFFF` | Yellow `#FFFF00` | General Short-Form |
| `ali-abdaal` | Ali Abdaal | Trending | Highlight | Soft Cream `#FFFBEB` | Pastel Blue `#38BDF8` | Productivity & Study |
| `vox-explainer` | Vox Explainer | Editorial-Film | Highlight | Off-White `#F8FAFC` | Bright Yellow `#FBBF24` | Educational Essays |
| `iman-luxury` | Iman Luxury | Editorial-Film | Scale | Off-White `#F8FAFC` | Champagne Gold `#D97706` | Luxury & Aesthetics |
| `cyberpunk-neon` | Cyberpunk Neon | Pop-Expressive | Glow | Cyan `#22D3EE` | Neon Magenta `#F43F5E` | Gaming & Sci-Fi |
| `cinema-noir` | Cinema Noir | Editorial-Film | Fade / Scale | Silver `#E2E8F0` | White `#FFFFFF` | Dramatic Storytelling |
| `code-terminal` | Code Terminal | Clean-Tech | Highlight | Terminal White `#F1F5F9` | Matrix Green `#22C55E` | Tech & Dev Tutorials |
| `creator-pop` | Creator Pop | Pop-Expressive | Pop | White `#FFFFFF` | Hot Pink `#EC4899` | Vlogs & Lifestyle |
| `warm-pastel` | Warm Pastel | Pop-Expressive | Bounce | Lavender `#F3E8FF` | Coral Rose `#FB7185` | Wellness & Beauty |
| `urban-rebel` | Urban Rebel | Pop-Expressive | Pop | Pale Yellow `#FEF08A` | Bright Red `#EF4444` | Streetwear & Music |
| `nordic-clean` | Nordic Clean | Clean-Tech | Highlight | Pure White `#FFFFFF` | Slate `#94A3B8` | Architecture & Design |
| `kapwing-viral` | Kapwing Viral | Trending | Highlight | White `#FFFFFF` | Vibrant Blue `#2563EB` | Fast-Paced Clips |
| `neon-cyber` | Neon Cyber | Pop-Expressive | Glow | Pure White `#FFFFFF` | Electric Teal `#14B8A6` | Futuristic Reviews |
| `retro-glitch` | Retro Glitch | Pop-Expressive | Pop | Light Pink `#FCE7F3` | Violet `#8B5CF6` | Nostalgia & Anime |
| `cinema-gold` | Cinema Gold | Editorial-Film | Highlight | Off-White `#FAFAFA` | Vintage Gold `#CA8A04` | Cinematic Shorts |
| `tiktok-hype` | TikTok Hype | Trending | Bounce | White `#FFFFFF` | Bright Orange `#F97316` | Trends & Reactions |
| `karaoke` | Karaoke | Trending | Karaoke Wipe | White `#FFFFFF` | Electric Blue `#3B82F6` | Sing-Alongs & Music |
| `minimal` | Minimal | Clean-Tech | Highlight | Pure White `#FFFFFF` | Soft Yellow `#FEF08A` | Clean Minimalist Content |
| `clean-tech` | Clean Tech | Clean-Tech | Highlight | Pure White `#FFFFFF` | Electric Blue `#38BDF8` | SaaS & Product Demos |

---

## 📦 Subtitle & Video Export

Capite supports direct export to industry-standard subtitle formats:

- **Burned HD MP4 Video**: High-definition MP4 encoded with CRF 18 quality and original audio stream preserved.
- **SubRip (`.srt`)**:
  ```srt
  1
  00:00:00,000 --> 00:00:04,280
  This is Muneeb, founder of Edvay.

  2
  00:00:04,280 --> 00:00:09,340
  Edvay is an education platform providing personalized learning.
  ```
- **WebVTT (`.vtt`)**:
  ```vtt
  WEBVTT

  1
  00:00:00.000 --> 00:00:04.280
  This is Muneeb, founder of Edvay.
  ```
- **Plain Text (`.txt`)**: Raw transcript text without timing tags.
- **Advanced SubStation Alpha (`.ass`)**: Complete subtitle styling script with word-by-word animation tags.

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    Browser["Client Browser<br/>(React 19 / Next.js 16)"]

    subgraph Frontend["Frontend (Port 3000)"]
      UI["Capite Studio & Landing<br/>(Tailwind v4 / Oat Theme)"]
      Actions["Server Actions<br/>(src/actions/captions.ts)"]
      DB[("SQLite via Prisma<br/>Job History & Cache")]
    end

    subgraph Backend["Backend (Flask — Port 5000)"]
      API["REST API<br/>(app.py)"]
      Worker["Worker Daemon<br/>(caption_job.py)"]
      Storage["JobStorage<br/>(Thread-Safe + JSON)"]
    end

    subgraph Engine["Processing Pipeline"]
      Whisper["faster-whisper<br/>(Speech to Word Timestamps)"]
      Subtitles["pysubs2<br/>(ASS Animation Engine)"]
      FFmpeg["FFmpeg + libass<br/>(CRF 18 Video Burn-In)"]
    end

    Browser <-->|"HTTP & Streaming"| Actions
    Browser -.->|"Direct Stream: /api/video"| API
    Actions <--> DB
    Actions <--> API
    API --> Worker
    Worker --> Whisper
    Worker --> Subtitles
    Worker --> FFmpeg
    API --> Storage
```

For complete architectural details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📡 REST API Reference

Full REST API documentation is available in [docs/API.md](docs/API.md).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/process` | Upload video file and queue transcription & caption job |
| `GET` | `/api/status/{jobId}` | Poll progress percentage, phases, language, and transcript |
| `POST` | `/api/rerender/{jobId}` | Fast re-render with updated transcript, styles, or colors |
| `GET` | `/api/export/{jobId}` | Export subtitles as `.srt`, `.vtt`, `.txt`, or `.ass` |
| `GET` | `/api/video/{jobId}` | Stream original or captioned video with seeking support |
| `GET` | `/api/download/{jobId}` | Download finalized captioned video file |
| `DELETE` | `/api/jobs/{jobId}` | Delete job and cleanup media scratch files |

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env` to configure your instance:

| Variable | Default | Description |
|---|---|---|
| `WHISPER_MODEL_SIZE` | `base` | Whisper model: `tiny`, `base`, `small`, `medium`, `large-v3` |
| `MAX_FILE_SIZE_MB` | `500` | Maximum upload size in MB |
| `MAX_DURATION_MINUTES` | `30` | Maximum video duration allowed |
| `MAX_CONCURRENT_JOBS` | `2` | Simultaneous encoding worker threads |
| `OUTPUT_TTL_HOURS` | `24` | Auto-cleanup time for temporary output files |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |
| `BACKEND_URL` | `http://localhost:5000` | Backend API URL for Next.js server actions |
| `DATABASE_URL` | `file:./data/captions.db` | SQLite database connection string |

---

## 📚 Documentation Index

- [ARCHITECTURE.md](ARCHITECTURE.md) — System processes, thread lifecycle, concurrency model, and data flow.
- [docs/API.md](docs/API.md) — Full REST API specification with parameter tables, request bodies, and curl examples.
- [CONTRIBUTING.md](CONTRIBUTING.md) — Development setup, branch guidelines, and testing workflow.
- [frontend/DESIGN.md](frontend/DESIGN.md) — Oat & Clay design tokens, contrast ratios, and typography rules.

---

## 👨‍💻 Creator & Contact

**Muhammad Muneeb Khan**

- **LinkedIn**: [https://www.linkedin.com/in/muhammadmuneebkhan8304/](https://www.linkedin.com/in/muhammadmuneebkhan8304/)
- **Email**: [muneebkhan08304@gmail.com](mailto:muneebkhan08304@gmail.com)
- **GitHub**: [@muneebkhan08](https://github.com/muneebkhan08)
- **Project Repo**: [https://github.com/muneebkhan08/Capite](https://github.com/muneebkhan08/Capite)

---

## 📄 License

Capite is open-source software licensed under the [MIT License](LICENSE).
