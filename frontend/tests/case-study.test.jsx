import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  fireEvent.error(screen.getByAltText("ApexMetrics hero view"));
  expect(screen.getByText("Preview unavailable")).toBeInTheDocument();
});

test("missing case study renders an elegant not found state", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Project not found" }), { status: 404, headers: { "Content-Type": "application/json" } })));
  render(<HelmetProvider><MemoryRouter initialEntries={["/portfolio/missing"]}><Routes><Route path="/portfolio/:slug" element={<CaseStudyPage />}/></Routes></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(screen.getByText("PROJECT NOT FOUND")).toBeInTheDocument());
});

test("case study still renders when adjacent project navigation fails", async () => {
  vi.stubGlobal("fetch", vi.fn((url) => Promise.resolve(String(url).endsWith("/apexmetrics")
    ? new Response(JSON.stringify(projectList[0]), { status: 200, headers: { "Content-Type": "application/json" } })
    : new Response(JSON.stringify({ detail: "Unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } }))));
  render(<HelmetProvider><MemoryRouter initialEntries={["/portfolio/apexmetrics"]}><Routes><Route path="/portfolio/:slug" element={<CaseStudyPage />}/></Routes></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "ApexMetrics" })).toBeInTheDocument());
  expect(screen.queryByText("PROJECT NOT FOUND")).not.toBeInTheDocument();
});

test("operational project failures show a retry state instead of a false 404", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Temporarily unavailable" }), { status: 503, headers: { "Content-Type": "application/json" } })));
  render(<HelmetProvider><MemoryRouter initialEntries={["/portfolio/apexmetrics"]}><Routes><Route path="/portfolio/:slug" element={<CaseStudyPage />}/></Routes></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(screen.getByText("PROJECT UNAVAILABLE")).toBeInTheDocument());
  expect(screen.getByTestId("case-retry")).toBeInTheDocument();
  expect(screen.queryByText("PROJECT NOT FOUND")).not.toBeInTheDocument();
});
