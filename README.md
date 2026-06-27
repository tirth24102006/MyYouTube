# MyYouTube
A fully responsive, feature-rich YouTube clone built to replicate the core video streaming experience. Key features include dynamic video playback, responsive user interface layouts, seamlessly integrated search capabilities, and optimized content discovery modules. Proudly deployed on Vercel and ready for community exploration!

# 📺 YouTube Clone App

[![Framework: React / Vite](https://img.shields.io/badge/Frontend-React_19_&_Vite_6-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube-clone-kohl-xi.vercel.app)
[![Deployment: Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://youtube-clone-kohl-xi.vercel.app)

A high-fidelity YouTube clone application built to replicate the core layout and video streaming experiences. Featuring custom responsive navigation, category filters, interactive content configurations, and robust full-stack data modeling supporting user sessions and video interactions.

🔗 **Live Demo:** [Launch Live Application](https://youtube-clone-kohl-xi.vercel.app)

---

## 🚀 Key Features

* **Responsive Layout:** A modern user interface fully optimized for mobile, tablet, and desktop viewports.
* **Navigation & Content Filtering:** Interactive sidebar layouts along with quick top category chips for fluid content discovery.
* **Full Authentication Flow:** Integrated cloud identity mapping matching user sessions using secure Firebase UIDs.
* **State Management & Animations:** High-performance UI state handling accompanied by smooth animations powered by `motion`.
* **Extensive Relational Data Model:** Backed by structured schemas managing users, channels, videos, playlists, interactions, and metrics.

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Core Framework:** React 19, TypeScript
* **Build System & Tooling:** Vite 6
* **CSS Framework:** Tailwind CSS v4 (`@tailwindcss/vite`)
* **Icons & Animation:** Lucide React, Framer Motion (`motion`)

### Backend & Storage
* **Server Runtime:** Express (executed via `tsx` development runner)
* **Primary Cloud DB / Auth:** Firebase 12 & Google Cloud Firestore
* **Local Cache Engine:** Better-SQLite3 (`database.db`)

---

## 📂 Data Model & Architecture

### 1. Cloud Firestore Collections Schema
The application's cloud back-end maps structured documents using the following collections layout:

| Collection | Document ID Pattern | Key Fields | Description |
| :--- | :--- | :--- | :--- |
| **`users`** | `{userId}` | `uid`, `email`, `displayName`, `photoURL`, `createdAt` | Core profile records linking authenticated users. |
| **`channels`** | `{channelId}` | `id`, `ownerUid`, `name`, `subscribersCount` | Dedicated creator channel metadata mappings. |
| **`videos`** | `{videoId}` | `id`, `title`, `videoUrl`, `ownerUid`, `views`, `likesCount` | Individual video file resources and play metrics. |
| **`comments`** | `{commentId}` | `id`, `videoId`, `userUid`, `text`, `createdAt` | Viewer feedback sequences tied directly to videos. |
| **`likes`** | `{likeId}` | `videoId`, `userUid`, `createdAt` | Tracked interactive user reaction metrics. |
| **`subscriptions`**| `{subscriptionId}` | `channelId`, `userUid`, `createdAt` | Links matching creator accounts to user profiles. |
| **`playlists`** | `{playlistId}` | `id`, `userUid`, `title`, `visibility` | Aggregated custom public or private video folders. |
| **`playlistItems`**| `{itemId}` | `id`, `playlistId`, `videoId`, `addedAt` | Categorized index listings nested within playlists. |

### 2. Local Relational Schema (`SQLite`)
For optimized lookups or hybrid edge performance, the offline data engine runs a dual-table layout:
* **`users`:** Tracks `id` (Primary Key/Firebase UID), `email`, `display_name`, `photo_url`, `created_at`, and `last_login`.
* **`user_profiles`:** A complementary profile lookup mapping explicit biographical extensions (`bio`, `location`, `website`) mapped securely via a Foreign Key cascade (`FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`).

### 3. Firestore Security Rules Policy
* **Public Visibility:** Globally permits all unauthenticated read requests across core view data streams including `users`, `channels`, `videos`, `comments`, `likes`, and `subscriptions`.
* **Resource Access Control:** Enforces strict execution bounds checking matching `request.auth.uid` validation parameters on all mutations (`create`, `update`, `delete`) to ensure documents can only be modified by their rightful owners.
* **Schema Sanitization Rules:** Includes validation policies regulating user comments length constraints (`< 1000` chars), channel text properties limit checks (`< 100` chars), email formats verification, and strict atomic updates (`+1` / `-1`) on collection count counters.

---

## 💻 Local Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js** (v20.0.0 or higher recommended) installed locally on your system.

### 2. Run Setup Steps
Extract the repository setup components onto your environment workspace:

```bash
# Install package dependencies
npm install

# Initialize local environment variables
cp .env.example .env # Create your own environment configuration file

```

Ensure your `.env` parameters are accurately configured to connect your local runtime build to your live Firebase Cloud database platform:

```env
PROJECT_ID="gen-lang-client-0667749412"
APP_ID="1:868100826178:web:6ae4755c2f230dacf9f9db"
API_KEY="AIzaSyCkIke5ecAgFtBZcUA_i_ukYBIxfGw1nqw"
AUTH_DOMAIN="gen-lang-client-0667749412.firebaseapp.com"
FIRESTORE_DB_ID="ai-studio-65ddb87c-b282-4729-9378-ad29ad0aae92"
STORAGE_BUCKET="gen-lang-client-0667749412.firebasestorage.app"
MESSAGING_SENDER_ID="868100826178"

```

---

## 🛠️ Available Core Scripts

Inside your project pipeline, you can execute the following build instructions:

* **`npm run dev`**: Launches your backend Express framework combined with the front-end Vite local server pipeline simultaneously.
* **`npm run build`**: Compiles and minifies optimization builds ready for static output distributions.
* **`npm run preview`**: Audits and provisions local browser previews over built workspace production assets.
* **`npm run lint`**: Inspects standard program structures executing non-emit structural checks via the TypeScript compiler.
* **`npm run clean`**: Cleans local workspace environments by purging structural target folders.

---

## 🌐 Deployment Configuration

This workspace is fully optimized for instant distribution deployments on the Vercel Edge Framework:

1. Link your personal account workspace to the **Vercel Dashboard**.
2. Import the project workspace repository source folder.
3. Verify project environmental variable configuration settings fields mirror your production credentials keys.
4. Click **Deploy** to publish your application live!

---

## 📄 License & Open Source

Distributed under the MIT License provisions parameters. See standard licensing documentation for open-source usages.

---

⭐ *If you find this project resourceful or educational, feel free to give it a star!*
