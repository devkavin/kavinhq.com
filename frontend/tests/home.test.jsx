import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import HomePage from "../src/pages/HomePage";

const projects = [{
  id: 1, title: "ApexMetrics SaaS Dashboard", slug: "apexmetrics-saas-dashboard", description: "Realtime analytics made clear.", category: "Custom Apps & Fixing", image_url: "https://images.unsplash.com/photo.jpg", live_url: "https://apex.kavinhq.com", gallery: [], story: "Challenge.\n\nResult.", stack: "React, FastAPI", year: 2025, featured: true, sort_order: 1, created_at: "2026-01-01T00:00:00Z",
}];

test("home page presents the complete project path", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(projects), { status: 200, headers: { "Content-Type": "application/json" } })));
  render(<HelmetProvider><MemoryRouter><HomePage /></MemoryRouter></HelmetProvider>);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("WEBSITES THAT DEMAND ATTENTION.");
  expect(screen.getByTestId("hero-cta-whatsapp")).toHaveAttribute("href", expect.stringContaining("wa.me"));
  expect(screen.getByTestId("hero-cta-portfolio")).toHaveAttribute("href", "/portfolio");
  expect(screen.getAllByTestId(/service-card-/)).toHaveLength(8);
  expect(screen.getAllByTestId(/process-step-/)).toHaveLength(4);
  expect(screen.getAllByTestId(/trust-item-/)).toHaveLength(3);
  await waitFor(() => expect(screen.getByText("ApexMetrics SaaS Dashboard")).toBeInTheDocument());
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining("featured=true"), expect.anything());
});
