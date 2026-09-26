import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const siteBase = (process.env.KAVINHQ_SITE_BASE || "http://127.0.0.1:5173").replace(/\/$/, "");
const apiBase = (process.env.KAVINHQ_API_BASE || siteBase).replace(/\/$/, "");
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const screenshotDir = resolve("artifacts", "screenshots");
if (!adminEmail || !adminPassword) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for browser verification.");

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const pageChecks = [
  ["home", "/", "WEBSITES THAT DEMAND ATTENTION.", '[data-testid="hero-cta-whatsapp"]'],
  ["portfolio", "/portfolio", "WORK THAT EARNS ATTENTION.", '[data-testid="portfolio-filter-all"]'],
  ["case-study", "/portfolio/apexmetrics-saas-dashboard", "ApexMetrics SaaS Dashboard", '[data-testid="case-live"]'],
  ["case-study-missing", "/portfolio/does-not-exist", "PROJECT NOT FOUND", '[data-testid="not-found-back"]'],
  ["about", "/about", "THE PERSON BEHIND THE PIXELS", '[data-testid="about-contact"]'],
  ["services", "/services", "EVERYTHING YOUR SITE NEEDS. ONE ROOF.", '[data-testid="services-contact"]'],
  ["contact", "/contact", "LET'S BUILD YOURS.", '[data-testid="contact-form"]'],
  ["admin-login", "/admin", "Welcome back.", '[data-testid="admin-login-submit"]'],
];

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function fileExists(path) {
  try {
    const { access } = await import("node:fs/promises");
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function findChrome() {
  for (const candidate of chromeCandidates) if (await fileExists(candidate)) return candidate;
  throw new Error("Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable.");
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolveReady, rejectReady) => {
      this.socket.addEventListener("open", resolveReady, { once: true });
      this.socket.addEventListener("error", rejectReady, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data.toString());
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolveResponse, rejectResponse) => this.pending.set(id, { resolve: resolveResponse, reject: rejectResponse }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  close() {
    this.socket.close();
  }
}

async function waitFor(check, label, timeout = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await check()) return;
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function openTarget(port) {
  const endpoint = `http://127.0.0.1:${port}`;
  await waitFor(async () => {
    try {
      return (await fetch(`${endpoint}/json/version`)).ok;
    } catch {
      return false;
    }
  }, "the browser debugging endpoint", 20000);
  const response = await fetch(`${endpoint}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create browser target: ${response.status}`);
  return response.json();
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Browser evaluation failed";
    throw new Error(detail);
  }
  return result.result.value;
}

async function navigate(client, path) {
  await client.send("Page.navigate", { url: `${siteBase}${path}` });
  await waitFor(() => evaluate(client, 'document.readyState === "complete"'), `${path} to load`);
  await sleep(1100);
}

async function assertPage(client, name, path, expectedHeading, criticalSelector) {
  await navigate(client, path);
  try {
    await waitFor(
      () => evaluate(client, `Boolean(document.querySelector("h1"))`),
      `${name} heading`,
    );
  } catch (error) {
    const diagnostics = await evaluate(client, `({ path: location.pathname, body: document.body.innerText.slice(0, 500), main: document.querySelector("main")?.className || "missing" })`);
    throw new Error(`${error.message}. Browser state: ${JSON.stringify(diagnostics)}`);
  }
  const state = await evaluate(client, `(() => {
    const normalize = (value) => value.replace(/\\s+/g, " ").trim();
    const heading = document.querySelector("h1");
    const critical = document.querySelector(${JSON.stringify(criticalSelector)});
    const badImages = [...document.images].filter((image) => {
      const style = getComputedStyle(image);
      const box = image.getBoundingClientRect();
      const inViewport = box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
      return inViewport && style.display !== "none" && image.complete && image.naturalWidth === 0;
    }).map((image) => image.currentSrc || image.src);
    return {
      heading: normalize(heading?.getAttribute("aria-label") || heading?.textContent || ""),
      headingClipped: heading ? heading.getBoundingClientRect().left + heading.scrollWidth > innerWidth + 1 || heading.getBoundingClientRect().left < -1 : true,
      headingMetrics: heading ? { scrollWidth: heading.scrollWidth, clientWidth: heading.clientWidth, left: heading.getBoundingClientRect().left, right: heading.getBoundingClientRect().right, viewport: innerWidth } : null,
      criticalVisible: Boolean(critical && critical.getBoundingClientRect().width > 0 && critical.getBoundingClientRect().height > 0),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      badImages,
    };
  })()`);
  if (!state.heading.includes(expectedHeading)) throw new Error(`${name} heading was ${state.heading}`);
  if (state.headingClipped) throw new Error(`${name} heading is clipped by the viewport: ${JSON.stringify(state.headingMetrics)}`);
  if (!state.criticalVisible) throw new Error(`${name} critical control is not visible`);
  if (state.overflow > 1) throw new Error(`${name} has ${state.overflow}px horizontal overflow`);
  if (state.badImages.length) throw new Error(`${name} has broken images: ${state.badImages.join(", ")}`);
}

async function capture(client, name, viewportName) {
  const result = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(join(screenshotDir, `${viewportName}-${name}.png`), Buffer.from(result.data, "base64"));
  console.log(`PASS  ${viewportName}/${name}`);
}

async function setInput(client, selector, value) {
  await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error(${JSON.stringify(`Missing input: ${selector}`)});
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(element, ${JSON.stringify(value)});
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  })()`);
}

async function click(client, selector) {
  await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error(${JSON.stringify(`Missing control: ${selector}`)});
    element.click();
  })()`);
}

async function setCheckbox(client, selector, checked) {
  await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error(${JSON.stringify(`Missing checkbox: ${selector}`)});
    if (element.checked !== ${Boolean(checked)}) element.click();
  })()`);
}

async function verifyHomeInteractions(client) {
  const state = await evaluate(client, `(() => {
    const marquee = document.querySelector(".marquee-track");
    const card = document.querySelector(".spotlight-card");
    const box = card?.getBoundingClientRect();
    if (card && box) card.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: box.left + 24, clientY: box.top + 24 }));
    const animation = marquee ? getComputedStyle(marquee) : null;
    return {
      marqueeGroups: marquee?.querySelectorAll(":scope > .marquee-group").length || 0,
      marqueeItems: marquee?.querySelectorAll(".marquee-group > span").length || 0,
      duplicateHidden: marquee?.querySelector('[data-testid="marquee-copy"]')?.getAttribute("aria-hidden") === "true",
      animationName: animation?.animationName || "",
      animationDuration: animation?.animationDuration || "",
      spotlightX: card?.style.getPropertyValue("--mx") || "",
      spotlightY: card?.style.getPropertyValue("--my") || "",
    };
  })()`);
  if (state.marqueeGroups !== 2 || state.marqueeItems < 16 || !state.duplicateHidden || state.animationName !== "marquee" || state.animationDuration !== "48s") throw new Error(`Marquee verification failed: ${JSON.stringify(state)}`);
  if (!state.spotlightX || !state.spotlightY) throw new Error("Spotlight card did not respond to pointer movement");
}

async function verifyCaseGallery(client, mobile) {
  const state = await evaluate(client, `(() => {
    const gallery = document.querySelector(".case-gallery");
    const items = [...document.querySelectorAll(".gallery-item")];
    return { display: gallery ? getComputedStyle(gallery).display : "", widths: items.map((item) => Math.round(item.getBoundingClientRect().width)) };
  })()`);
  if (state.display !== "grid" || state.widths.length < 2) throw new Error(`Case gallery verification failed: ${JSON.stringify(state)}`);
  if (mobile && Math.abs(state.widths[0] - state.widths[1]) > 2) throw new Error(`Mobile gallery did not collapse evenly: ${JSON.stringify(state.widths)}`);
  if (!mobile && state.widths[0] <= state.widths[1]) throw new Error(`Desktop gallery did not keep the 7/5 layout: ${JSON.stringify(state.widths)}`);
}

async function verifyContactPreview(client) {
  await navigate(client, "/contact");
  await waitFor(() => evaluate(client, `Boolean(document.querySelector('[data-testid="contact-name"]'))`), "contact form inputs");
  await setInput(client, '[data-testid="contact-name"]', "Kavin verification");
  await setInput(client, '[data-testid="contact-brief"]', "A fast portfolio with a clear project path.");
  await waitFor(
    () => evaluate(client, `document.querySelector('[data-testid="whatsapp-preview"]')?.textContent.includes("Kavin verification")`),
    "the live WhatsApp preview",
  );
}

async function verifyAdmin(client, viewportName) {
  const verificationSlug = `browser-verification-${viewportName}`;
  await navigate(client, "/admin");
  await setInput(client, "#admin-email", adminEmail);
  await setInput(client, "#admin-password", adminPassword);
  await click(client, '[data-testid="admin-login-submit"]');
  await waitFor(() => evaluate(client, 'location.pathname === "/admin/dashboard"'), "admin dashboard", 15000);
  await waitFor(
    () => evaluate(client, `document.querySelector('[data-testid="admin-db-health"]')?.textContent.includes("Connected")`),
    "connected database badge",
    15000,
  );
  const overflow = await evaluate(client, "document.documentElement.scrollWidth - window.innerWidth");
  if (overflow > 1) throw new Error(`admin projects has ${overflow}px horizontal overflow`);
  await capture(client, "admin-projects", viewportName);

  await click(client, '[data-testid="admin-add-project"]');
  await waitFor(() => evaluate(client, 'Boolean(document.querySelector("[role=dialog]"))'), "project modal");
  await capture(client, "admin-project-modal", viewportName);
  await setInput(client, '[data-testid="admin-project-title"]', "Browser Verification Project");
  await setInput(client, '[data-testid="admin-project-slug"]', verificationSlug);
  await setInput(client, '[data-testid="admin-project-category"]', "Custom Apps & Fixing");
  await setInput(client, '[data-testid="admin-project-year"]', "2026");
  await setInput(client, '[data-testid="admin-project-description"]', "Temporary project created by the browser verification flow.");
  await setInput(client, '[data-testid="admin-project-image"]', "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85");
  await setInput(client, '[data-testid="admin-project-live"]', "https://browser-verification.kavinhq.com");
  await setInput(client, '[data-testid="admin-project-stack"]', "React, FastAPI");
  await setInput(client, '[data-testid="admin-project-order"]', "99");
  await setInput(client, '[data-testid="admin-project-gallery"]', "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85");
  await setInput(client, '[data-testid="admin-project-story"]', "Verification challenge.\n\nVerification result.");
  await setCheckbox(client, '[data-testid="admin-project-featured"]', false);
  await click(client, '[data-testid="admin-project-save"]');
  await waitFor(() => evaluate(client, `Boolean(document.querySelector('[data-testid="admin-delete-${verificationSlug}"]'))`), "created project row", 15000);

  await click(client, `[data-testid="admin-edit-${verificationSlug}"]`);
  await waitFor(() => evaluate(client, 'Boolean(document.querySelector("[role=dialog]"))'), "edit project modal");
  await setInput(client, '[data-testid="admin-project-title"]', "Browser Verification Project Updated");
  await click(client, '[data-testid="admin-project-save"]');
  await waitFor(() => evaluate(client, `[...document.querySelectorAll(".admin-project-row h3")].some((item) => item.textContent.includes("Updated"))`), "updated project row", 15000);

  await click(client, `[data-testid="admin-delete-${verificationSlug}"]`);
  const armedLabel = await evaluate(client, `document.querySelector('[data-testid="admin-delete-${verificationSlug}"]')?.textContent || ""`);
  if (!armedLabel.includes("Confirm delete")) throw new Error("Project deletion did not require confirmation");
  await click(client, `[data-testid="admin-delete-${verificationSlug}"]`);
  await waitFor(() => evaluate(client, `!document.querySelector('[data-testid="admin-delete-${verificationSlug}"]')`), "deleted project row", 15000);

  await click(client, '[data-testid="admin-tab-settings"]');
  await waitFor(() => evaluate(client, 'Boolean(document.querySelector(\'[data-testid="admin-settings-form"]\'))'), "settings tab");
  await capture(client, "admin-settings", viewportName);
  await click(client, '[data-testid="admin-settings-save"]');
  await sleep(400);
  await click(client, '[data-testid="admin-logout"]');
  await waitFor(() => evaluate(client, 'location.pathname === "/admin"'), "admin logout", 10000);
}

async function verifyViewport(chromePath, viewport) {
  const userDataDir = join(tmpdir(), `kavinhq-browser-${viewport.name}-${process.pid}`);
  const processHandle = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${viewport.port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });
  let client;
  let verificationError;

  try {
    const target = await openTarget(viewport.port);
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Network.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
      screenWidth: viewport.width,
      screenHeight: viewport.height,
    });
    await client.send("Emulation.setTouchEmulationEnabled", { enabled: viewport.mobile, maxTouchPoints: viewport.mobile ? 5 : 1 });
    await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

    for (const [name, path, heading, selector] of pageChecks) {
      await assertPage(client, name, path, heading, selector);
      if (name === "home") {
        await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 220, y: 180 });
        const cursor = await evaluate(client, `({ fine: matchMedia("(pointer: fine)").matches, present: Boolean(document.querySelector(".cursor-dot")) })`);
        if (!viewport.mobile && (!cursor.fine || !cursor.present)) throw new Error("Desktop custom cursor did not render in fine-pointer mode");
        if (viewport.mobile && cursor.present) throw new Error("Custom cursor rendered in mobile touch mode");
        await verifyHomeInteractions(client);
      }
      if (name === "case-study") await verifyCaseGallery(client, viewport.mobile);
      await capture(client, name, viewport.name);
    }

    await verifyContactPreview(client);
    await capture(client, "contact-live-preview", viewport.name);

    await navigate(client, "/");
    await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(() => evaluate(client, 'document.readyState === "complete"'), "reduced-motion home");
    await waitFor(() => evaluate(client, 'Boolean(document.querySelector("h1"))'), "reduced-motion hero");
    const reducedVisible = await evaluate(client, `(() => { const h1 = document.querySelector("h1"); const box = h1?.getBoundingClientRect(); return Boolean(h1 && box.width > 0 && box.height > 0 && getComputedStyle(h1).opacity !== "0"); })()`);
    if (!reducedVisible) throw new Error("Hero content was hidden with reduced motion enabled");
    await capture(client, "home-reduced-motion", viewport.name);
    await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

    await verifyAdmin(client, viewport.name);
  } catch (error) {
    verificationError = error;
    throw error;
  } finally {
    let cleanupError;
    if (client) {
      try {
        const cleanup = await evaluate(client, `(async () => {
          const response = await fetch(${JSON.stringify(`${apiBase}/api/projects`)}, { credentials: "include" });
          if (!response.ok) throw new Error("Project cleanup lookup failed with status " + response.status);
          const projects = await response.json();
          const temporary = projects.find((project) => project.slug === ${JSON.stringify(`browser-verification-${viewport.name}`)});
          if (!temporary) return { deleted: false };
          const deleted = await fetch(${JSON.stringify(`${apiBase}/api/projects/`)} + temporary.id, { method: "DELETE", credentials: "include" });
          if (!deleted.ok) throw new Error("Project cleanup delete failed with status " + deleted.status);
          return { deleted: true };
        })()`);
        if (cleanup?.deleted) console.log(`CLEANUP  ${viewport.name}/temporary-project`);
      } catch (error) {
        cleanupError = error;
      }
    }
    client?.close();
    processHandle.kill();
    await sleep(300);
    const safePrefix = resolve(tmpdir()).toLowerCase();
    if (resolve(userDataDir).toLowerCase().startsWith(safePrefix)) await rm(userDataDir, { recursive: true, force: true });
    if (cleanupError) {
      if (verificationError) console.error(`CLEANUP FAILED after verification error: ${cleanupError.message}`);
      else throw cleanupError;
    }
  }
}

await mkdir(screenshotDir, { recursive: true });
const chromePath = await findChrome();
const requestedViewport = process.env.KAVINHQ_VIEWPORT;
if (!requestedViewport || requestedViewport === "desktop") await verifyViewport(chromePath, { name: "desktop", width: 1440, height: 900, mobile: false, port: 9333 });
if (!requestedViewport || requestedViewport === "mobile") await verifyViewport(chromePath, { name: "mobile", width: 390, height: 844, mobile: true, port: 9334 });
console.log("Browser verification completed with responsive screenshots.");
