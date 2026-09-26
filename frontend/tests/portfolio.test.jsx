import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import PortfolioPage from "../src/pages/PortfolioPage";
import { projectList } from "./fixtures/projects";

test("portfolio derives filters and keeps case study and live links separate", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(projectList), { status: 200, headers: { "Content-Type": "application/json" } })));
  render(<HelmetProvider><MemoryRouter><PortfolioPage /></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(screen.getByText("ApexMetrics")).toBeInTheDocument());
  expect(screen.getByTestId("portfolio-filter-custom-apps")).toBeInTheDocument();
  expect(screen.getByTestId("project-case-apexmetrics")).toHaveAttribute("href", "/portfolio/apexmetrics");
  expect(screen.getByTestId("project-live-apexmetrics")).toHaveAttribute("href", "https://apex.kavinhq.com");
  fireEvent.click(screen.getByTestId("portfolio-filter-e-commerce"));
  await waitFor(() => expect(screen.queryByText("ApexMetrics")).not.toBeInTheDocument());
  expect(screen.getByText("Vanguard")).toBeInTheDocument();
});
