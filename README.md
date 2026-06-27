# PinPoint Client

> Frontend for the PinPoint visual website feedback platform.
> Built with Next.js 15 (App Router), Tailwind CSS, shadcn/ui, TanStack Query, and Socket.io.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (Radix primitives) |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query (React Query v5) |
| Real-time | Socket.io Client |
| Charts | Recharts |
| Auth | Better Auth (self-hosted) |
| Language | JavaScript / JSX |

## Project Structure

```
PinPoint-client/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── dashboard/            # Dashboard pages (authenticated)
│   │   │   ├── layout.jsx        # Dashboard shell (sidebar + header)
│   │   │   ├── page.jsx          # Dashboard home (stats + charts)
│   │   │   ├── inbox/            # Feedback inbox with filters
│   │   │   ├── projects/         # Project management
│   │   │   │   └── [id]/         # Project detail (websites, feedback, widget)
│   │   │   │       └── feedback/
│   │   │   │           └── [feedbackId]/  # Feedback detail + timeline
│   │   │   ├── assigned/         # My assigned feedback
│   │   │   ├── resolved/         # Resolved feedback history
│   │   │   ├── settings/         # Workspace settings
│   │   │   └── members/          # Team management
│   │   ├── (marketing)/          # Public pages
│   │   │   ├── page.jsx          # Landing page
│   │   │   └── pricing/          # Pricing page
│   │   ├── features/             # Features page
│   │   ├── auth/                 # Auth pages
│   │   │   ├── login/            # Login page
│   │   │   └── register/         # Registration page
│   │   ├── layout.jsx            # Root layout
│   │   └── page.jsx              # Root page (landing)
│   ├── components/
│   │   ├── common/               # Reusable UI components
│   │   │   ├── DataTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── feedback/             # Feedback-specific components
│   │   │   ├── FeedbackCard.jsx
│   │   │   └── FeedbackTimeline.jsx
│   │   └── project/              # Project-specific components
│   │       ├── InstallScript.jsx  # Widget embed code + copy
│   │       └── WidgetConfigForm.jsx  # Widget config form
│   ├── hooks/
│   │   ├── useFeedback.js        # Feedback TanStack Query hooks
│   │   ├── useWorkspace.js       # Workspace/project/website hooks
│   │   └── useWebSocket.js       # Socket.io client hook
│   ├── lib/
│   │   ├── api.js                # Fetch wrapper (auth, error handling)
│   │   └── utils.js              # Utility functions (cn, etc.)
│   ├── providers/
│   │   ├── AuthProvider.jsx      # Auth context & token management
│   │   ├── QueryProvider.jsx     # TanStack Query provider
│   │   └── ThemeProvider.jsx     # Dark/light mode toggle
│   └── styles/
│       └── globals.css           # Tailwind + CSS variables
├── public/
│   └── widget.js                 # Feedback widget script (embed)
├── next.config.mjs
├── tailwind.config.js
├── jsconfig.json
├── package.json
└── .env.example
```

## Prerequisites

- **Node.js** v22 or later
- **npm** or **yarn**
- [PinPoint Server](../PinPoint-server) running

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd PinPoint-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket URL | `http://localhost:4000` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Pages

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, features, pricing, CTA |
| `/pricing` | Pricing tiers (Free / Pro / Business) |
| `/auth/login` | Login with email + password |
| `/auth/register` | Create new account |

### Dashboard (Authenticated)

| Route | Description |
|-------|-------------|
| `/dashboard` | Home — feedback stats, trend chart, recent activity |
| `/dashboard/inbox` | All feedback with filters and DataTable |
| `/dashboard/projects` | Project management with create/list |
| `/dashboard/projects/[id]` | Project detail — websites, feedback, widget installation |
| `/dashboard/projects/[id]/feedback/[feedbackId]` | Feedback detail with timeline, comments, inline editing |
| `/dashboard/assigned` | Feedback assigned to me |
| `/dashboard/resolved` | Resolved feedback history |
| `/dashboard/settings` | User profile + workspace settings |
| `/dashboard/members` | Team management — invite, roles, remove |

## Widget Installation

The feedback widget is a JavaScript snippet you embed on your website. Visitors click a floating button, pin feedback anywhere on the page, and submit it directly to your PinPoint dashboard — no auth required.

### Step 1: Create a Project

1. Log in to your dashboard at `/dashboard`
2. Go to **Projects** → click **New Project**
3. Enter a project name (e.g., "Company Website") and optional description
4. Click **Create**

### Step 2: Add a Website

1. Click into your newly created project
2. Under the **Websites** section, click **Add Website**
3. Enter your website URL (e.g., `https://example.com`)
4. Click **Add**

### Step 3: Configure the Widget

1. Click **Install Widget** in the project header
2. In the **Configure** tab, customize:
   - **Button Color** — pick a color that matches your brand
   - **Position** — bottom-right, bottom-left, top-right, or top-left
   - **Button Text** — e.g., "Feedback", "Report Bug"
   - **Icon** — chat bubble, bug, or feedback icon
   - **Dark Mode** — enable for dark-themed websites
3. Click **Save Widget Settings**

### Step 4: Get the Embed Code

1. Switch to the **Embed Code** tab
2. Copy the HTML snippet using the **Copy** button
3. The snippet contains two parts:
   - A `<script>` tag that loads the widget
   - A `Feedback.init()` call with your project ID and config

### Step 5: Paste on Your Website

Add the snippet just before the closing `</body>` tag on every page where you want to collect feedback:

```html
<script src="/widget.js"></script>
<script>
  Feedback.init({
    projectId: "your-project-uuid",
    color: "#3B82F6",
    position: "bottom-right",
    buttonText: "Feedback",
    icon: "chat"
  });
</script>
```

> **Note:** Replace `/widget.js` with the production URL (e.g., `https://cdn.pinpoint.dev/feedback.js`) when deploying. During development, the widget JS is served from the Next.js `public/` folder.

### How It Works

Once the widget is installed on your website:

1. A floating feedback button appears in the configured position
2. Visitors click the button, then click anywhere on the page to pin their feedback
3. A form pops up where they type their comment (optional name/email)
4. On submit, the widget captures:
   - **Coordinates** — exact page X/Y position and DOM element
   - **Screenshot** — a full-page screenshot (via `html-to-image`)
   - **Metadata** — browser, OS, screen resolution, viewport, timezone, dark mode
   - **Page URL** — the exact URL where feedback was submitted
5. Data is sent to `POST /v1/widget/:projectId/feedback` (no auth required)
6. Feedback appears instantly in your dashboard Inbox

### Environment Variable

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WIDGET_URL` | Widget script URL in embed code | `/widget.js` |

## Key Patterns

### Authentication

All pages in `dashboard/` are protected via the AuthProvider. The `api.js` lib:

- Automatically injects `Authorization: Bearer <token>` header
- Redirects to `/auth/login` on 401
- Handles token storage in localStorage (key: `pp_token`)

### Data Fetching

All server data is fetched through TanStack Query hooks in `src/hooks/useFeedback.js`. Example:

```js
import { useFeedbackList, useFeedbackDetail } from '@/hooks/useFeedback';

function FeedbackPage() {
  const { data, isLoading } = useFeedbackList(websiteId, { status: 'open' });
  const { data: detail } = useFeedbackDetail(feedbackId);
  const { mutate: updateStatus } = useUpdateFeedback();
}
```

### Real-time Updates

The `useWebSocket` hook connects to Socket.io and listens for:

- `activity:new` — New timeline activity (automatically refreshes query cache)
- `feedback:updated` — Feedback status/priority changes

```js
import { useWebSocket } from '@/hooks/useWebSocket';

function FeedbackTimeline({ feedbackId }) {
  useWebSocket(feedbackId);
  // TanStack Query auto-refreshes on socket events
}
```

### Feedback Timeline

Each feedback ticket has a full activity timeline (like GitHub Issues):

📍 User created an issue — *2h ago*
👤 Sahil assigned this to Priya — *1h ago*
🔄 Status changed from "Open" → "In Progress" — *30m ago*
💬 Sahil commented: "Fixed the alignment..." — *10m ago*

The `FeedbackTimeline` component renders this activity feed with icons for each action type.

### Screenshot Strategy

PinPoint uses a hybrid approach:

1. **Client-side (primary):** Uses `html-to-image` to capture the viewport in the browser
2. **Server-side (fallback):** If client capture fails, the server uses Puppeteer to take a screenshot

Screenshots are stored on **Cloudflare R2** (S3-compatible, zero egress fees).

### Theming

The app supports both light and dark mode via Tailwind CSS classes + CSS custom properties defined in `globals.css`. Toggle via the ThemeProvider:

```js
const { dark, toggleTheme } = useTheme();
<button onClick={toggleTheme}>{dark ? '☀️' : '🌙'}</button>
```

## Common Issues

### "Module not found: Can't resolve '@/...'"
The `@` alias is configured via `jsconfig.json`. Restart the dev server if path resolution fails.

### "Network Error" when fetching data
Make sure PinPoint Server is running on `http://localhost:4000` and `NEXT_PUBLIC_API_URL` is set correctly.

---

## Related

- [PinPoint Server](../PinPoint-server) — Backend API
- [PLAN.md](../PLAN.md) — Full product plan and architecture
