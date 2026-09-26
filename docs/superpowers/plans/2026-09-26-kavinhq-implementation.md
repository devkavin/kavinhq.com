# KAVINHQ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the complete KAVINHQ public portfolio, protected admin dashboard, FastAPI service, safe MySQL initialization, and Docker deployment files.

**Architecture:** A single route-split React application serves the editorial public site and local admin interface. A modular FastAPI application provides public content, cookie-based JWT authentication, protected management routes, and additive-only MySQL initialization. Nginx serves the built frontend and proxies `/api` to the backend in both deployment modes.

**Tech Stack:** React 18, Vite, React Router 7, Tailwind CSS 3, Framer Motion 11, Lenis 1, React Helmet Async 3, Lucide React, Sonner, FastAPI, SQLAlchemy 2, PyMySQL, MySQL, PyJWT, bcrypt, Docker, nginx

**Spec:** `docs/superpowers/specs/2026-09-26-kavinhq-design.md`

## Global Constraints

- Use only the frontend and backend packages named in the user brief, plus test packages needed to verify them.
- Read the API base from `import.meta.env.VITE_API_BASE || ""` because Vite exposes environment values through `import.meta.env`.
- Prefix every backend route with `/api`.
- Never create or drop a database, drop tables or columns, or overwrite existing seed data.
- Create missing tables and add missing columns only after checking `information_schema`.
- Keep all secrets in environment variables.
- Use the exact dark palette, type families, glass treatment, logo concept, motion details, and responsive requirements from the spec.
- Use Lucide icons instead of emoji or decorative text symbols.
- Give every interactive element a stable kebab-case `data-testid`.
- Do not use em dashes or vague AI-related language in user-facing copy.
- Respect `prefers-reduced-motion` for every animation and disable the custom cursor when appropriate.
- Preserve one semantic H1 and unique metadata on every public page.

## Review Focus

1. A `DATABASE_URL` password containing reserved URL characters must work when correctly URL-encoded and must never be logged. Task 2 covers configuration parsing and secret-safe errors.
2. A forwarded client IP must not be trusted unless proxy trust is explicitly enabled. Task 4 covers lockout identity selection.
3. Empty, malformed, or non-JSON API responses must produce readable admin feedback without a refresh loop. Task 7 covers response normalization.
4. A missing or broken external project image must preserve card geometry and readable content. Tasks 9 and 10 cover fallback rendering.
5. Keyboard and reduced-motion users must retain all navigation, filtering, modal, form, and case-study functionality. Tasks 8 through 11 cover focus, motion fallback, and keyboard tests.

---

### Task 1: Repository Scaffolding and Test Runners

**Files:**
- Create: `.gitignore`, `.env.example`, `README.md`
- Create: `backend/requirements.txt`, `backend/requirements-dev.txt`, `backend/pytest.ini`, `backend/tests/test_smoke.py`
- Create: `frontend/package.json`, `frontend/yarn.lock`, `frontend/vite.config.js`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/index.html`
- Create: `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/styles/index.css`, `frontend/tests/setup.js`, `frontend/tests/smoke.test.jsx`

**Interfaces:**
- Consumes: approved specification
- Produces: `pytest` backend runner, `yarn test` frontend runner, Vite build entry, Tailwind tokens

- [ ] **Step 1: Write failing smoke tests**

Add backend and frontend tests asserting that their application entry points import and render without dependency or configuration errors.

- [ ] **Step 2: Run tests and confirm missing entry-point failures**

Run: `python -m pytest backend/tests/test_smoke.py -v` and `yarn --cwd frontend test --run frontend/tests/smoke.test.jsx`

Expected: FAIL because the application entry points do not exist.

- [ ] **Step 3: Add exact dependencies and minimal entry points**

Pin the requested frontend major versions, add Vitest, Testing Library, jsdom, pytest, HTTPX, and SQLite test support, then create the minimal renderable applications and exact Tailwind theme tokens.

- [ ] **Step 4: Install and verify both smoke tests**

Run: `python -m pytest backend/tests/test_smoke.py -v` and `yarn --cwd frontend test --run frontend/tests/smoke.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `chore: scaffold frontend and backend`

### Task 2: Backend Configuration, Models, and Safe Schema Initialization

**Files:**
- Create: `backend/app/core/config.py`, `backend/app/db/session.py`, `backend/app/db/schema.py`
- Create: `backend/app/models/base.py`, `backend/app/models/admin_user.py`, `backend/app/models/project.py`, `backend/app/models/setting.py`, `backend/app/models/login_attempt.py`
- Create: `backend/tests/test_config.py`, `backend/tests/test_schema.py`

**Interfaces:**
- Consumes: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, `CORS_ORIGINS`, optional `TRUST_PROXY_HEADERS`
- Produces: `Settings`, `engine`, `SessionLocal`, `get_db()`, `ensure_schema(engine)`, and SQLAlchemy model classes

- [ ] **Step 1: Write failing configuration and schema tests**

Test environment parsing, masked configuration output, table creation on an empty schema, no destructive SQL, missing-column detection, additive column SQL, and a second initialization that makes no changes.

- [ ] **Step 2: Run focused tests and confirm missing-module failures**

Run: `python -m pytest backend/tests/test_config.py backend/tests/test_schema.py -v`

Expected: FAIL because configuration, models, and schema helpers do not exist.

- [ ] **Step 3: Implement configuration and SQLAlchemy models**

Use the requested field types, UUID string primary key for admins, JSON gallery, UTC timestamps, unique slugs, and safe defaults for additive columns.

- [ ] **Step 4: Implement additive-only initialization**

Use SQLAlchemy inspection for tables and `information_schema.columns` for column checks. Allow only a fixed model-owned table and column map when building `ALTER TABLE ADD COLUMN` statements.

- [ ] **Step 5: Run schema tests and full backend suite**

Run: `python -m pytest backend/tests -v`

Expected: PASS with no destructive statement recorded.

- [ ] **Step 6: Commit**

Commit message: `feat: add safe database foundation`

### Task 3: Seed Data and Project Serialization

**Files:**
- Create: `backend/app/services/seeding.py`, `backend/app/schemas/project.py`, `backend/app/schemas/setting.py`, `backend/app/schemas/user.py`
- Create: `backend/tests/test_seeding.py`, `backend/tests/test_project_schemas.py`

**Interfaces:**
- Consumes: Task 2 models and sessions
- Produces: `seed_if_empty(session, settings)`, `ProjectCreate`, `ProjectUpdate`, `ProjectRead`, `SettingsRead`, `SettingsUpdate`, `UserRead`

- [ ] **Step 1: Write failing seed and schema tests**

Assert all six supplied projects, first four featured, exact default settings, two story paragraphs, two gallery images, slug validation, gallery URL validation, and preservation of all existing rows and password hashes on restart.

- [ ] **Step 2: Run tests and confirm missing-service failures**

Run: `python -m pytest backend/tests/test_seeding.py backend/tests/test_project_schemas.py -v`

Expected: FAIL because schemas and seeding do not exist.

- [ ] **Step 3: Implement schemas and conditional seed service**

Seed each table independently only when that table is empty. Hash the initial admin password with bcrypt and never expose password fields in response schemas.

- [ ] **Step 4: Verify focused and full tests**

Run: `python -m pytest backend/tests -v`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add validated seed content`

### Task 4: JWT Authentication and Login Lockout

**Files:**
- Create: `backend/app/core/security.py`, `backend/app/services/auth.py`, `backend/app/api/dependencies.py`, `backend/app/api/auth.py`
- Create: `backend/app/schemas/auth.py`, `backend/tests/test_auth.py`

**Interfaces:**
- Consumes: Task 2 sessions and Task 3 `UserRead`
- Produces: `hash_password()`, `verify_password()`, `create_token()`, `decode_token()`, `get_current_user()`, and `/api/auth/*` routes

- [ ] **Step 1: Write failing authentication tests**

Cover valid login, invalid login, fifth-failure lockout, 15-minute expiry, successful reset, trusted and untrusted forwarded IP behavior, cookies on local HTTP and HTTPS, bearer access, refresh rotation, refresh token rejection as access, expired token, logout cookie clearing, 401, and 403.

- [ ] **Step 2: Run auth tests and confirm missing-route failures**

Run: `python -m pytest backend/tests/test_auth.py -v`

Expected: FAIL because security helpers and routes do not exist.

- [ ] **Step 3: Implement security and lockout services**

Use PyJWT token type claims, constant-time library verification, normalized lowercase email identifiers, database-backed attempt rows, and HTTPS-aware cookie options.

- [ ] **Step 4: Implement authentication routes and dependencies**

Return only `UserRead`, support cookie or bearer access, and prevent refresh loops by making refresh failures final.

- [ ] **Step 5: Verify authentication and full backend suite**

Run: `python -m pytest backend/tests -v`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: secure admin authentication`

### Task 5: Project, Settings, Health, and Application Routes

**Files:**
- Create: `backend/app/api/health.py`, `backend/app/api/projects.py`, `backend/app/api/settings.py`, `backend/app/api/router.py`
- Create: `backend/server.py`, `backend/tests/test_health.py`, `backend/tests/test_projects.py`, `backend/tests/test_settings.py`, `backend/tests/test_startup.py`

**Interfaces:**
- Consumes: Tasks 2 through 4
- Produces: complete FastAPI `app` and all required `/api` endpoints

- [ ] **Step 1: Write failing API tests**

Cover database health, database failure, ordered public listing, category and boolean filters, slug lookup, 404, protected create, replace, delete, duplicate slug 409, unauthenticated 401, public setting allowlist, protected setting update, CORS credentials, and startup order.

- [ ] **Step 2: Run API tests and confirm missing-route failures**

Run: `python -m pytest backend/tests/test_health.py backend/tests/test_projects.py backend/tests/test_settings.py backend/tests/test_startup.py -v`

Expected: FAIL because routers and application wiring do not exist.

- [ ] **Step 3: Implement routers and exception handling**

Keep route handlers focused on validation and response mapping. Commit writes once per request and return generic database failure responses without secrets.

- [ ] **Step 4: Assemble FastAPI startup and CORS**

Run schema reconciliation before independent seeding. Parse allowed origins from the environment and enable credentials.

- [ ] **Step 5: Verify the complete backend suite**

Run: `python -m pytest backend/tests -v`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: complete portfolio API`

### Task 6: Frontend Visual Foundation and Shared Motion

**Files:**
- Create: `frontend/src/components/brand/Logo.jsx`
- Create: `frontend/src/components/motion/CustomCursor.jsx`, `MagneticButton.jsx`, `MaskedHeading.jsx`, `Marquee.jsx`, `Reveal.jsx`, `ScrambleLabel.jsx`, `ScrollProgress.jsx`, `SpotlightCard.jsx`, `TiltVisual.jsx`
- Create: `frontend/src/hooks/useReducedMotionPreference.js`, `useLenis.js`
- Modify: `frontend/src/styles/index.css`, `frontend/src/App.jsx`, `frontend/public/favicon.svg`
- Create: `frontend/tests/motion.test.jsx`, `frontend/tests/logo.test.jsx`

**Interfaces:**
- Consumes: Task 1 React shell and tokens
- Produces: reusable visual primitives with reduced-motion fallbacks and contextual cursor data contract

- [ ] **Step 1: Write failing component behavior tests**

Assert logo accessibility, reduced-motion static states, cursor disabling, keyboard-safe magnetic buttons, marquee duplication with hidden copy, stable scramble output, and spotlight pointer variables.

- [ ] **Step 2: Run tests and confirm missing-component failures**

Run: `yarn --cwd frontend test --run frontend/tests/motion.test.jsx frontend/tests/logo.test.jsx`

Expected: FAIL because shared components do not exist.

- [ ] **Step 3: Implement the logo, global texture, typography, cursor, motion, and glass utilities**

Match the exact colors, sizes, easing, labels, grid, grain, scrollbar, selection, and pointer media queries in the brief.

- [ ] **Step 4: Verify focused tests and frontend suite**

Run: `yarn --cwd frontend test --run`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: build visual motion system`

### Task 7: Frontend API, SEO, Settings, and Application Shell

**Files:**
- Create: `frontend/src/lib/api.js`, `frontend/src/lib/errors.js`, `frontend/src/lib/whatsapp.js`
- Create: `frontend/src/context/AuthContext.jsx`, `frontend/src/context/SettingsContext.jsx`
- Create: `frontend/src/components/layout/Navbar.jsx`, `Footer.jsx`, `MobileMenu.jsx`, `PageTransition.jsx`, `Seo.jsx`
- Create: `frontend/tests/api.test.js`, `frontend/tests/whatsapp.test.js`, `frontend/tests/layout.test.jsx`

**Interfaces:**
- Consumes: Task 5 API and Task 6 visual primitives
- Produces: `apiRequest()`, `normalizeApiError()`, `composeWhatsAppMessage()`, `buildWhatsAppUrl()`, auth/settings hooks, and public application shell

- [ ] **Step 1: Write failing client and shell tests**

Cover empty responses, malformed JSON, validation arrays, one refresh attempt, no retry loop, API base joining, WhatsApp number sanitation, line-preserving message composition, mobile-menu focus and dismissal, active underline, SEO tags, and interactive test identifiers.

- [ ] **Step 2: Run tests and confirm missing-module failures**

Run: `yarn --cwd frontend test --run frontend/tests/api.test.js frontend/tests/whatsapp.test.js frontend/tests/layout.test.jsx`

Expected: FAIL because the client and shell do not exist.

- [ ] **Step 3: Implement API and state contexts**

Use credentials on every request, a single refresh retry for protected calls, public settings fallback values, and readable error normalization.

- [ ] **Step 4: Implement the responsive shell and metadata component**

Add fixed navigation, full-screen mobile menu, footer, route transitions, progress bar, cursor, Lenis integration, and back-to-top behavior.

- [ ] **Step 5: Verify frontend suite**

Run: `yarn --cwd frontend test --run`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: add frontend application shell`

### Task 8: Home Page

**Files:**
- Create: `frontend/src/pages/HomePage.jsx`
- Create: `frontend/src/components/home/Hero.jsx`, `ServiceMarquee.jsx`, `SelectedWork.jsx`, `ServicesBento.jsx`, `Process.jsx`, `TrustRow.jsx`, `ContactBand.jsx`
- Create: `frontend/src/data/services.js`, `frontend/tests/home.test.jsx`

**Interfaces:**
- Consumes: public project API, public settings, shell, motion primitives
- Produces: complete `/` route and shared eight-service content data

- [ ] **Step 1: Write failing home-page tests**

Assert one H1, exact core copy, two hero actions, featured-project request, eight services, four process steps, three trust points, WhatsApp URL, image fallback, reduced-motion visibility, and all critical test identifiers.

- [ ] **Step 2: Run tests and confirm missing-page failures**

Run: `yarn --cwd frontend test --run frontend/tests/home.test.jsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement the hero and marquee**

Add masked headline, pointer glow, tilted visual, floating badges, parallax orb, and velocity-skewed 48-second marquee with plain accessible text.

- [ ] **Step 4: Implement remaining home sections**

Use the asymmetric work grid, requested bento spans, process, trust row, and contact band with responsive one-column fallbacks.

- [ ] **Step 5: Verify home tests and frontend suite**

Run: `yarn --cwd frontend test --run`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: create KAVINHQ home page`

### Task 9: Portfolio and Case Study Pages

**Files:**
- Create: `frontend/src/pages/PortfolioPage.jsx`, `frontend/src/pages/CaseStudyPage.jsx`, `frontend/src/pages/NotFoundPage.jsx`
- Create: `frontend/src/components/projects/ProjectCard.jsx`, `ProjectGrid.jsx`, `ProjectGallery.jsx`, `ProjectNavigation.jsx`
- Create: `frontend/tests/portfolio.test.jsx`, `frontend/tests/case-study.test.jsx`

**Interfaces:**
- Consumes: project API, settings, motion primitives
- Produces: `/portfolio`, `/portfolio/:slug`, project card contract used by home and project pages

- [ ] **Step 1: Write failing portfolio tests**

Cover derived category filters, animated filtered results, independent internal and live links, safe broken-image fallback, empty state, and keyboard use.

- [ ] **Step 2: Write failing case-study tests**

Cover metadata, story paragraph splitting, stack chips, WhatsApp reference, alternating gallery layout, previous and next navigation, 404 response, and one H1.

- [ ] **Step 3: Run tests and confirm missing-page failures**

Run: `yarn --cwd frontend test --run frontend/tests/portfolio.test.jsx frontend/tests/case-study.test.jsx`

Expected: FAIL because project pages do not exist.

- [ ] **Step 4: Implement project pages and card system**

Maintain fixed media aspect ratios and visible content when external images fail. Use Lucide external-link icons instead of text symbols.

- [ ] **Step 5: Verify frontend suite**

Run: `yarn --cwd frontend test --run`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: add portfolio case studies`

### Task 10: About, Services, and Contact Pages

**Files:**
- Create: `frontend/src/pages/AboutPage.jsx`, `frontend/src/pages/ServicesPage.jsx`, `frontend/src/pages/ContactPage.jsx`
- Create: `frontend/src/components/contact/ContactForm.jsx`, `WhatsAppPreview.jsx`
- Create: `frontend/tests/about-services.test.jsx`, `frontend/tests/contact.test.jsx`

**Interfaces:**
- Consumes: shared services data, settings context, WhatsApp helpers, motion primitives
- Produces: `/about`, `/services`, `/contact`

- [ ] **Step 1: Write failing content-page tests**

Assert single H1s, required headings, terminal commands, stack chips, three principles, eight numbered services, closing guidance panel, and page metadata.

- [ ] **Step 2: Write failing contact tests**

Assert required fields, select options, live whitespace-preserving preview, delivered caption, invalid-submit behavior, configured opening message, composed visitor details, WhatsApp navigation, and keyboard access.

- [ ] **Step 3: Run tests and confirm missing-page failures**

Run: `yarn --cwd frontend test --run frontend/tests/about-services.test.jsx frontend/tests/contact.test.jsx`

Expected: FAIL because the pages do not exist.

- [ ] **Step 4: Implement all three pages**

Keep compositions distinct while using shared spacing, typography, reveal, spotlight, metadata, and CTA primitives.

- [ ] **Step 5: Verify frontend suite**

Run: `yarn --cwd frontend test --run`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit message: `feat: add service and contact pages`

### Task 11: Admin Login and Dashboard

**Files:**
- Create: `frontend/src/admin/AdminRoutes.jsx`, `LoginPage.jsx`, `DashboardPage.jsx`, `ProtectedRoute.jsx`
- Create: `frontend/src/admin/components/ProjectTable.jsx`, `ProjectModal.jsx`, `SettingsPanel.jsx`, `AdminHeader.jsx`
- Create: `frontend/src/admin/lib/projectForm.js`
- Create: `frontend/tests/admin-auth.test.jsx`, `frontend/tests/admin-projects.test.jsx`, `frontend/tests/admin-settings.test.jsx`
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: auth context, API client, health, projects, settings
- Produces: lazy `/admin` and `/admin/dashboard` routes with complete management workflows

- [ ] **Step 1: Write failing admin authentication tests**

Cover login success, validation-array errors, invalid credentials, loading state, protected redirect, session restore, health state, logout, and noindex metadata.

- [ ] **Step 2: Write failing project and settings tests**

Cover add and edit field conversion, category datalist, image preview fallback, gallery line parsing, two-step deletion, featured and sort values, setting prefill, save feedback, and keyboard-safe modal dismissal.

- [ ] **Step 3: Run tests and confirm missing-admin failures**

Run: `yarn --cwd frontend test --run frontend/tests/admin-auth.test.jsx frontend/tests/admin-projects.test.jsx frontend/tests/admin-settings.test.jsx`

Expected: FAIL because admin routes do not exist.

- [ ] **Step 4: Implement lazy admin routes and authentication flow**

Do not render protected data before the session check resolves. Use Sonner for mutation outcomes and inline text for login errors.

- [ ] **Step 5: Implement project and settings management**

Keep form state local to the modal, disable actions while saving, and refresh only affected data after mutations.

- [ ] **Step 6: Verify frontend suite and production build**

Run: `yarn --cwd frontend test --run` and `yarn --cwd frontend build`

Expected: all tests pass and Vite builds without warnings that affect behavior.

- [ ] **Step 7: Commit**

Commit message: `feat: add protected admin dashboard`

### Task 12: Static Search Assets and Branded Social Image

**Files:**
- Create: `frontend/public/robots.txt`, `frontend/public/sitemap.xml`, `frontend/public/og-image.jpg`
- Create: `frontend/tests/static-assets.test.js`

**Interfaces:**
- Consumes: logo and brand system
- Produces: crawler rules, public sitemap, 1200 by 630 social preview image

- [ ] **Step 1: Write failing asset tests**

Assert robots blocks `/admin`, sitemap includes every fixed public route, favicon parses as SVG, and social image dimensions are exactly 1200 by 630.

- [ ] **Step 2: Run tests and confirm missing-asset failures**

Run: `yarn --cwd frontend test --run frontend/tests/static-assets.test.js`

Expected: FAIL because the static assets are missing.

- [ ] **Step 3: Create crawler assets and branded image**

Generate the image from a deterministic local SVG or canvas source using the exact palette, K badge, wordmark, and supplied tagline.

- [ ] **Step 4: Verify asset tests and build**

Run: `yarn --cwd frontend test --run` and `yarn --cwd frontend build`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add search and sharing assets`

### Task 13: Docker, Nginx, and Documentation

**Files:**
- Create: `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`
- Create: `docker-compose.yml`, `docker-compose.admin.yml`, `DEPLOY.md`
- Modify: `.env.example`, `README.md`
- Create: `tests/test_deployment_files.py`

**Interfaces:**
- Consumes: complete frontend and backend builds
- Produces: production and local-admin container workflows and operator documentation

- [ ] **Step 1: Write failing deployment-file tests**

Assert no database service, no literal secrets, Python 3.11 slim, Node 20 Alpine, nginx Alpine, `/api` proxy target, SPA fallback, gzip, static cache, required environment names, and documentation coverage.

- [ ] **Step 2: Run test and confirm missing-file failures**

Run: `python -m pytest tests/test_deployment_files.py -v`

Expected: FAIL because deployment files do not exist.

- [ ] **Step 3: Implement container and nginx files**

Use a `VITE_API_BASE` build argument defaulting to an empty string, health checks, service dependency health, and no MySQL container.

- [ ] **Step 4: Write setup and deployment documentation**

Document native development, Coolify, local admin, required secrets, TLS URL examples, least privilege, backup responsibility, and non-destructive startup behavior.

- [ ] **Step 5: Validate Compose and image builds**

Run: `docker compose config`, `docker compose -f docker-compose.admin.yml config`, `docker compose build`

Expected: valid configuration and successful images.

- [ ] **Step 6: Commit**

Commit message: `ops: add Docker deployment workflows`

### Task 14: End-to-End API and Responsive Browser Verification

**Files:**
- Create: `scripts/verify-api.ps1`, `scripts/verify-ui.mjs`
- Create: `artifacts/screenshots/.gitkeep`
- Modify: `README.md`, `DEPLOY.md`

**Interfaces:**
- Consumes: running Docker services and safe configured database
- Produces: repeatable API verification and desktop/mobile screenshot set

- [ ] **Step 1: Write API verification script with cleanup guarantees**

Exercise health, unauthenticated project write 401, login, current user, create, retrieve, update, delete, settings read and update, logout, and post-logout 401. Restore the prior settings value and remove the temporary project even when a later check fails.

- [ ] **Step 2: Run the API script against the safe verification environment**

Run: `powershell -ExecutionPolicy Bypass -File scripts/verify-api.ps1`

Expected: every named check passes and temporary data is removed.

- [ ] **Step 3: Write browser verification script**

Capture `/`, `/portfolio`, a seeded case study, missing case study, `/about`, `/services`, `/contact`, `/admin`, and authenticated dashboard tabs at 1440 by 900 and 390 by 844. Assert zero horizontal overflow, expected H1, visible critical controls, preview updates, modal operation, cursor presence only for desktop fine-pointer mode, and reduced-motion visibility.

- [ ] **Step 4: Run browser verification and inspect every screenshot**

Run: `node scripts/verify-ui.mjs`

Expected: all assertions pass and all screenshots show polished layouts without clipping, overlap, missing content, or broken images.

- [ ] **Step 5: Run final verification suite**

Run: `python -m pytest backend/tests tests -v`, `yarn --cwd frontend test --run`, `yarn --cwd frontend build`, `docker compose config`, and both verification scripts.

Expected: all commands pass. Record any environment limitation explicitly instead of reporting an unverified result as complete.

- [ ] **Step 6: Run content and safety scans**

Run: `rg -n "—|AI-powered|revolutionary|game-changing|CREATE DATABASE|DROP DATABASE|DROP TABLE|DROP COLUMN" frontend backend README.md DEPLOY.md docker-compose*.yml`

Expected: no user-facing banned language and no destructive database commands.

- [ ] **Step 7: Commit**

Commit message: `test: verify complete KAVINHQ experience`
