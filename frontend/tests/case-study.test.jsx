import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import CaseStudyPage from "../src/pages/CaseStudyPage";
import { projectList } from "./fixtures/projects";

test("case study renders build story, stack, gallery and adjacent projects", async () => {
  vi.stubGlobal("fetch", vi.fn((url) => Promise.resolve(new Response(JSON.stringify(String(url).endsWith("/apexmetrics") ? projectList[0] : projectList), { status: 200, headers: { "Content-Type": "application/json" } }))));
  render(<HelmetProvider><MemoryRouter initialEntries={["/portfolio/apexmetrics"]}><Routes><Route path="/portfolio/:slug" element={<CaseStudyPage />}/></Routes></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "ApexMetrics" })).toBeInTheDocument());
  expect(screen.getByText("A complex starting point.")).toBeInTheDocument();
  expect(screen.getByText("A clear finished system.")).toBeInTheDocument();
  expect(screen.getByTestId("stack-react")).toBeInTheDocument();
  expect(screen.getByTestId("case-whatsapp")).toHaveAttribute("href", expect.stringContaining("ApexMetrics"));
  expect(screen.getByTestId("project-next")).toHaveTextContent("Vanguard");
  expect(screen.getAllByTestId(/gallery-image-/)).toHaveLength(2);
});

test("missing case study renders an elegant not found state", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Project not found" }), { status: 404, headers: { "Content-Type": "application/json" } })));
  render(<HelmetProvider><MemoryRouter initialEntries={["/portfolio/missing"]}><Routes><Route path="/portfolio/:slug" element={<CaseStudyPage />}/></Routes></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(screen.getByText("PROJECT NOT FOUND")).toBeInTheDocument());
});
