# KAVINHQ Portfolio and Admin Design

## Purpose

KAVINHQ is a premium portfolio for Kavin, a solo web professional. It must turn visitors into qualified project conversations while showing a clear point of view about design quality, speed, search visibility, ownership, and managed delivery.

The public experience should feel authored and editorial. It should avoid template-like section rhythms, exaggerated claims, generic technology language, and decorative text symbols. Copy should be direct, specific, and human. Em dashes are not used anywhere in user-facing copy.

The same repository also contains a practical admin dashboard for managing projects and WhatsApp settings. The public site will run on Coolify in Docker. The admin will run locally in Docker and connect to the same externally hosted MySQL database.

## Success Criteria

1. All public routes are responsive and visually polished at 1440 by 900 and 390 by 844 without horizontal overflow.
2. Motion supports the visual hierarchy and respects reduced-motion preferences.
3. Project and WhatsApp content comes from the API and can be managed through the protected admin dashboard.
4. Authentication, refresh, logout, lockout, authorization, project CRUD, and settings updates work through documented API contracts.
5. Database startup is safe for an existing hosted MySQL database. It creates missing tables and adds missing columns only.
6. Production and local-admin Docker workflows require secrets only through environment variables.
7. Automated tests and browser checks cover the critical public, admin, API, security, and responsive flows.

## Repository Architecture

The repository is split into focused frontend and backend applications with deployment files at the root.

```text
kavinhq/
  backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
    tests/
    Dockerfile
    requirements.txt
    server.py
  frontend/
    public/
    src/
      admin/
      components/
      context/
      hooks/
      lib/
      pages/
      styles/
    tests/
    Dockerfile
    nginx.conf
  docker-compose.yml
  docker-compose.admin.yml
  DEPLOY.md
  README.md
```

The frontend is one React application. Public routes use shared visual and motion primitives. Admin routes are loaded with `React.lazy` so admin code does not enlarge the initial public bundle. Shared API and authentication helpers provide a single place for credentials, error normalization, and refresh behavior.

The backend is one FastAPI application with independent routers for health, authentication, projects, and settings. Database access uses SQLAlchemy 2 sessions. Authentication, seeding, and schema reconciliation live in services rather than route handlers.

## Frontend Application

### Routing and Application Shell

React Router 7 provides these routes:

| Route | Purpose |
| --- | --- |
| `/` | Home page |
| `/portfolio` | Filterable project index |
| `/portfolio/:slug` | API-backed project case study |
| `/about` | Personal story, profile, principles, and stack |
| `/services` | Eight detailed service offerings |
| `/contact` | WhatsApp-oriented contact form and live preview |
| `/admin` | Admin login |
| `/admin/dashboard` | Protected project and settings management |
| `*` | Branded not-found page |

The public shell owns the fixed navigation, footer, cursor, progress bar, noise layer, Lenis instance, route transitions, and global glow treatment. The admin shell uses the same logo and core colors but prioritizes clarity and compact information density.

Lenis is initialized once inside the router. It is disabled when reduced motion is requested. Route changes reset scroll position. Hash and in-page navigation use the active Lenis instance when available.

### Design System

The Tailwind theme defines the required ink, panel, accent, mint, text, and muted colors, plus display, body, and mono font families. The visual foundation includes:

- Page background `#05070A`
- Panel background `#0B0F17`
- Glass background `rgba(15,23,42,0.6)` with 20px blur and a subtle white border
- Cyan `#00F0FF` and mint `#00FF87` accents
- Off-white `#F8FAFC` and muted slate `#94A3B8` text
- Fixed low-opacity SVG grain
- A 64px hero grid and large blurred radial glows
- Cyan-to-mint gradient text without purple
- Ten-pixel custom scrollbar and cyan selection color

The original logo is a rounded-square SVG badge with a cyan-to-mint stroked K and cyan dot. The same geometry is used in the navbar, footer, admin, favicon, and generated social image.

All interactive elements have stable kebab-case `data-testid` attributes. Icons come from Lucide React. Text avoids emoji and decorative arrows. External-link meaning is conveyed with an icon and an accessible label.

### Motion and Interaction Primitives

Shared components implement motion once and expose simple props to pages:

- `CustomCursor` shows a small cyan point and spring-following ring only for fine pointers without reduced motion. It reads contextual labels from interactive element data attributes.
- `MagneticButton` applies a restrained spring pull and fully resets on pointer leave.
- `ScrollProgress` maps document progress to a two-pixel cyan-to-mint bar.
- `MaskedHeading` reveals lines from an overflow-hidden mask with the specified easing and stagger.
- `HeroGlow` follows spring-smoothed pointer coordinates inside the hero.
- `TiltVisual` applies perspective rotation to the hero image and resets accessibly.
- `Marquee` duplicates content for a continuous loop, pauses on hover, and clamps velocity-based skew.
- `SpotlightCard` writes local pointer coordinates to CSS variables for a hover glow.
- `ScrambleLabel` runs once in view, then leaves stable readable text.
- `Reveal` provides the standard once-only section entrance.

Every primitive checks reduced-motion preferences. Reduced motion produces fully visible content, disables pointer-following movement, and retains functional hover and focus states.

### Public Pages

The home page follows the requested sequence: full-height hero, editorial service marquee, selected API projects, eight-service bento grid, four-step process, trust row, and large contact band. The hero image remains a dark web-design workspace visual and is framed as a tall editorial panel rather than a generic device mockup.

The portfolio page derives filter chips from returned project categories. Filtering is client-side after one public project request, with animated layout changes. Each project card separates its case-study link from its external live-site action.

The case-study page fetches by slug. It renders structured metadata, stack values, story paragraphs split on blank lines, alternating gallery spans, and previous and next projects derived from the ordered project list. Missing projects get a composed 404 state with useful navigation.

The about and services pages use the same editorial typography but distinct compositions. About balances personal narrative with a restrained terminal-style profile. Services expands the eight offerings into clear numbered cards and closes with guidance for unsure visitors.

The contact page loads public WhatsApp settings. Form input updates a WhatsApp-style preview. Submission composes the configured opening message plus visitor details and opens a `wa.me` URL. Required inputs are validated before navigation.

### Search and Sharing

Each page provides one semantic H1, a unique title, description, canonical context, Open Graph tags, and Twitter summary image tags through React Helmet Async. The case-study metadata uses project data. The static sitemap contains public fixed routes, while project discovery remains crawlable through the portfolio links.

The branded 1200 by 630 social image is generated as a repository asset. It uses the obsidian background, glowing K badge, KAVINHQ wordmark, and the line `WEBSITES THAT DEMAND ATTENTION`.

`robots.txt` permits public pages and blocks `/admin`. Admin routes also use noindex metadata.

## Admin Experience

The admin login is a centered glass card with logo, email, password, submission state, and inline error feedback. FastAPI validation arrays are reduced to concise readable messages.

The dashboard checks `/api/auth/me` before rendering protected content. A failed check returns the visitor to `/admin`. The header displays database health, a public-site link, and logout.

The Projects tab lists thumbnails, titles, categories, years, sort order, and featured state. Add and edit share one modal form. Gallery URLs are entered one per line and converted to a JSON array. The image field includes a live preview with a safe fallback. Deletion requires a first click to arm the action and a second explicit confirmation.

The Settings tab edits the WhatsApp number and opening message. It explains the expected international number format. Sonner communicates successful saves and actionable failures.

## Backend and API

All routes begin with `/api`.

### Public Contracts

- `GET /api/health` executes a lightweight database query and returns service and database status.
- `GET /api/projects` accepts optional `category` and `featured` filters and returns projects ordered by `sort_order`, then creation time.
- `GET /api/projects/{slug}` returns one project or a 404 response.
- `GET /api/settings` returns only `whatsapp_number` and `whatsapp_message`.

### Authentication Contracts

- `POST /api/auth/login` verifies credentials, applies lockout policy, sets access and refresh cookies, and returns the public user shape.
- `POST /api/auth/refresh` rotates the short-lived access cookie after validating the refresh token.
- `POST /api/auth/logout` clears both cookies.
- `GET /api/auth/me` accepts the access cookie or an Authorization bearer token.

Access tokens expire after 15 minutes. Refresh tokens expire after seven days. Cookies are HTTP-only. For HTTPS requests they are secure with `SameSite=None`; for local HTTP they use a compatible local policy. Token payloads include subject, type, issued time, and expiry. Access and refresh token types cannot be exchanged.

Login failures are stored under normalized `ip:email` identifiers. Five failed attempts produce a 15-minute lock. A locked request returns 429. A successful login resets the stored failure state. Client IP handling prefers trusted proxy forwarding only when deployment configuration enables it, otherwise it uses the direct connection address.

### Protected Contracts

- `POST /api/projects` creates a project after validating its slug and URLs.
- `PUT /api/projects/{id}` replaces editable project fields.
- `DELETE /api/projects/{id}` removes one project.
- `PUT /api/settings` upserts only allowed setting keys.

Missing or invalid admin credentials return 401. Authenticated non-admin users return 403. Duplicate slugs return 409. Validation errors retain FastAPI's structured 422 format for the admin client to normalize.

## Database Safety and Initialization

The application reads `DATABASE_URL` exactly as an environment variable and uses PyMySQL. Optional PyMySQL TLS parameters can be supplied through query-string values supported by SQLAlchemy and documented examples.

Startup performs these operations in order:

1. Connect to the named existing database.
2. Create declared tables only when they do not exist.
3. Query `information_schema.columns` for every managed table.
4. Add missing columns with additive `ALTER TABLE ADD COLUMN` statements.
5. Never drop a table, database, column, key, or existing row.
6. Seed an admin only when `admin_users` is empty.
7. Seed projects only when `projects` is empty.
8. Seed default settings only when `settings` is empty.

The seeded password is read from `ADMIN_PASSWORD`, hashed with bcrypt, and never logged. An existing admin password is never changed by startup. Initialization fails clearly if required production environment values are missing.

The model shapes follow the requested fields. Project `gallery` uses a MySQL JSON column. Timestamps are stored in UTC. Boolean and integer fields have explicit database defaults suitable for existing-row column additions.

## Error Handling and Resilience

The backend returns consistent JSON errors and never leaks database messages, token contents, password hashes, or environment values. Database failures are logged server-side with request context and presented as generic 503 responses where appropriate.

The frontend API client always includes credentials, handles empty response bodies, normalizes FastAPI validation errors, and performs one refresh attempt after an authenticated 401. It does not loop if refresh fails. Public project errors produce designed retry or empty states rather than blank sections.

External images use lazy loading below the fold, fixed aspect ratios, meaningful alt text, and local fallback styling. Motion and data errors must not block primary navigation or contact access.

## Deployment Design

The backend image uses Python 3.11 slim, installs only `requirements.txt`, and launches Uvicorn on port 8001. The frontend image builds with Node 20 Alpine and Yarn, then serves static output from nginx Alpine.

The production nginx configuration provides SPA fallback, gzip, long-lived immutable asset caching, conservative document caching, security headers, and `/api/` proxying to `backend:8001`.

`docker-compose.yml` defines only backend and frontend services. It contains no database service and no baked secrets. Coolify supplies `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, and `CORS_ORIGINS`.

`docker-compose.admin.yml` runs the same services locally with the externally hosted MySQL URL supplied at runtime. It does not expose MySQL or copy credentials into an image.

`DEPLOY.md` documents Coolify configuration, health checks, environment variables, local admin startup, optional TLS connection parameters, backup expectations, least-privilege database permissions, secret rotation, and why the database should not be publicly reachable.

## Testing and Verification

### Backend Automated Tests

Backend tests use dependency-injected test sessions and cover:

- Health success and database failure reporting
- First-start seeding and restart idempotency
- Existing admin password preservation
- Missing-column addition without destructive schema changes
- Login success, failure, fifth-failure lockout, lock expiry, and reset after success
- Access-cookie, bearer-token, refresh, logout, expired-token, and wrong-token-type behavior
- Public project listing, filtering, ordering, slug lookup, and 404 responses
- Unauthenticated write rejection
- Authenticated project create, update, delete, duplicate slug, and validation behavior
- Public settings visibility and protected settings update

### Frontend Automated Tests

Frontend tests cover route rendering, API-base construction, validation-message normalization, category filtering, protected-route redirection, contact message composition, WhatsApp URL generation, reduced-motion fallbacks, and presence of stable test identifiers on critical actions.

### Runtime Verification

The final Docker verification uses the configured test database or an explicitly supplied safe database. It exercises health, login, current user, project creation, update, retrieval, deletion, settings update, logout, and the unauthenticated 401 path through HTTP requests.

Browser verification captures every public page, one real case study, the case-study 404 state, login, project list and modal, and settings at 1440 by 900 and 390 by 844. It checks overflow, navigation, cursor behavior on fine pointers, hero reveal, marquee, spotlight hover, gallery layout, WhatsApp preview updates, modal behavior, and logout. Reduced-motion mode gets a separate smoke check.

## Content Rules

- Use plain, confident language tied to specific outcomes.
- Do not use em dashes.
- Do not describe the work with vague AI-related language.
- Do not use emoji or decorative Unicode arrows in interface copy.
- Use Lucide icons for interface meaning and CSS shapes only for visual texture.
- Preserve the supplied core headings and project data, adjusting punctuation only to satisfy these rules.
- Keep WhatsApp language warm and practical.

## Explicit Non-Goals

- Creating, dropping, or replacing the hosted MySQL database
- Destructive database migrations
- A public account system
- Media uploads or asset storage
- A content-management system beyond projects and WhatsApp settings
- Analytics, billing, email delivery, or third-party form storage
- A separate admin frontend deployment codebase
