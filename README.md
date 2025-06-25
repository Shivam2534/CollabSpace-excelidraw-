# CollabSpace Excelidraw

A full-stack, real-time collaborative whiteboard and communication platform, featuring live drawing, video streaming, chat, AI-powered shape generation, and more. Built as a monorepo with modern technologies for seamless teamwork and creativity.

---

## Features

- **Real-time Collaborative Whiteboard:** Draw, sketch, and annotate with others in real time.
- **Canvas Rooms:** Create or join drawing rooms for focused collaboration.
- **Video Streaming:** Upload and stream videos, with backend HLS conversion for smooth playback.
- **Video Calls & Chat:** Integrated chat rooms and video call invites for seamless communication.
- **AI-Powered Drawing:** Generate shapes and diagrams from text prompts using AI.
- **Recording & Replay:** Record drawing sessions locally and replay them.
- **Shape Recognition:** Smart drawing assistance for perfect diagrams.
- **User Authentication:** Secure login and signup with NextAuth.
- **Modern UI:** Built with Next.js, Tailwind CSS, and a custom UI component library.
- **Monorepo Architecture:** Shared code and types across frontend, backend, and utilities.

---

## Monorepo Structure

```
apps/
  excele_frontend/   # Next.js frontend app
  http-backend/      # Express.js HTTP backend (video, API)
  ws-backend/        # WebSocket backend (real-time sync)
packages/
  backend-common/    # Shared backend utilities
  common/            # Shared types and hooks
  db/                # Prisma database schema and client
  eslint-config/     # Shared ESLint config
  typescript-config/ # Shared TS config
  ui/                # Shared UI components
```

---

## Frontend (`excele_frontend`)

- **Framework:** Next.js (App Router)
- **Key Features:**
  - Landing page with authentication (NextAuth)
  - Canvas room creation/joining
  - Real-time collaborative drawing (WebSocket)
  - Video streaming and video call invite
  - AI shape generation (`Ai.tsx`)
  - Recording and replay of drawing sessions (`Recording.tsx`)
  - Modern, responsive UI (Tailwind CSS, custom components)
- **Main Components:**
  - `CreateRoom`, `EnterRoom`, `LandingNavbar`, `ToolPanal`, `ShapFun`, `colorPanal`, `shareOnCanvas`, `Ai`, `Recording`
- **Pages:**
  - `/` (Landing, features, CTA)
  - `/canvas/[roomId]` (Collaborative whiteboard)
  - `/video_stream` (Video streaming)
  - `/signup` (User registration)
  - `/draw/canvasRoom` (Drawing logic)
- **Authentication:** NextAuth with session management

---

## HTTP Backend (`http-backend`)

- **Framework:** Express.js
- **Key Features:**
  - Video upload and HLS conversion (using FFmpeg)
  - Serves HLS video segments for streaming
  - API endpoints for video and possibly AI/chat
- **Video Streaming:**
  - Upload video files, convert to HLS (`.m3u8` and `.ts` segments)
  - Supports multiple resolutions (360p, 720p)
  - Publicly serves converted videos for frontend playback
- **Controllers:**
  - `videoStream.ts` (handles video conversion and streaming)
- **Middleware:**
  - Multer for file uploads
  - Custom middleware for request handling

---

## WebSocket Backend (`ws-backend`)

- **Purpose:** Real-time synchronization for collaborative drawing and chat
- **Features:**
  - Manages canvas state and events between users in a room
  - Broadcasts drawing, shape, and chat events
  - Ensures low-latency, multi-user collaboration

---

## Shared Packages

- **`common/`:** Shared React hooks (e.g., `useSocket`), TypeScript types for events and shapes
- **`backend-common/`:** Utilities for backend services
- **`ui/`:** Shared UI components (Button, Card, etc.)
- **`db/`:** Prisma schema and migrations for user and session management

---

## Database

- **ORM:** Prisma
- **Schema:** User, session, and possibly room/canvas models
- **Migrations:** Versioned in `packages/db/prisma/migrations`

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (preferred), npm, or yarn
- FFmpeg (for video conversion)
- PostgreSQL (or your preferred DB, configured in Prisma)

### Clone the Repository

```bash
git clone https://github.com/Shivam2534/CollabSpace-excelidraw-.git
cd CollabSpace-excelidraw-
```

### Install Dependencies

This project uses [pnpm](https://pnpm.io/) for managing dependencies. If you don't have it installed, you can install it globally:

```bash
npm install -g pnpm
```

Then, install all dependencies for the monorepo:

```bash
pnpm install
```

### Setup Environment Variables

- Copy `.env.example` to `.env` in each app/package as needed and fill in required values (DB, API keys, etc.)

### Run Development Servers

In separate terminals (or using a process manager), run:

```bash
# To start the project run
pnpm run dev

```

### Open the App

- By default, the frontend will be available at [http://localhost:3002](http://localhost:3002).
- Make sure your database and FFmpeg are set up and running if you use video features.
