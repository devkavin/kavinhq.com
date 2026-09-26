import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../src/components/layout/Navbar";
import Seo from "../src/components/layout/Seo";

test("navigation exposes active state and mobile menu controls", async () => {
  render(<MemoryRouter initialEntries={["/portfolio"]}><Navbar /></MemoryRouter>);
  expect(screen.getByTestId("nav-link-portfolio")).toHaveAttribute("aria-current", "page");
  fireEvent.click(screen.getByTestId("nav-mobile-toggle"));
  expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  expect(screen.getByTestId("mobile-menu-close")).toHaveFocus();
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  expect(screen.getByTestId("mobile-link-contact")).toHaveFocus();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(screen.getByTestId("mobile-menu-close")).toHaveFocus();
  fireEvent.keyDown(document, { key: "Escape" });
  await waitFor(() => expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument());
  expect(screen.getByTestId("nav-mobile-toggle")).toHaveFocus();
});

test("seo writes title, description, canonical URL and open graph URL", async () => {
  render(<HelmetProvider><MemoryRouter initialEntries={["/portfolio/apexmetrics"]}><Seo title="Portfolio" description="Selected KAVINHQ work." /></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(document.title).toBe("Portfolio | KAVINHQ"));
  expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Selected KAVINHQ work.");
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3000/portfolio/apexmetrics");
  expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute("content", "http://localhost:3000/portfolio/apexmetrics");
});
