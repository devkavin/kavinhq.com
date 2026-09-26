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
  fireEvent.click(screen.getByTestId("mobile-menu-close"));
  await waitFor(() => expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument());
});

test("seo writes a unique document title and description", async () => {
  render(<HelmetProvider><Seo title="Portfolio" description="Selected KAVINHQ work." /></HelmetProvider>);
  await waitFor(() => expect(document.title).toBe("Portfolio | KAVINHQ"));
  expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Selected KAVINHQ work.");
});
