import React from "react";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import AboutPage from "../src/pages/AboutPage";
import ServicesPage from "../src/pages/ServicesPage";

const wrap = (component) => render(<HelmetProvider><MemoryRouter>{component}</MemoryRouter></HelmetProvider>);

test("about page tells the story through profile, stack and principles", () => {
  wrap(<AboutPage />);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("THE PERSON BEHIND THE PIXELS");
  expect(screen.getByText("$ whoami")).toBeInTheDocument();
  expect(screen.getByText("$ cat specialties.txt")).toBeInTheDocument();
  expect(screen.getByText("$ status")).toBeInTheDocument();
  expect(screen.getByTestId("stack-docker")).toBeInTheDocument();
  expect(screen.getAllByTestId(/principle-card-/)).toHaveLength(3);
});

test("services page details eight services and closes with guidance", () => {
  wrap(<ServicesPage />);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("EVERYTHING YOUR SITE NEEDS. ONE ROOF.");
  expect(screen.getAllByTestId(/service-detail-/)).toHaveLength(8);
  expect(screen.getByText("NOT SURE WHICH ONE YOU NEED?")).toBeInTheDocument();
});
