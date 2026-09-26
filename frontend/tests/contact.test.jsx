import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ContactPage from "../src/pages/ContactPage";

test("contact form updates preview and opens a composed WhatsApp message", () => {
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  render(<HelmetProvider><MemoryRouter><ContactPage /></MemoryRouter></HelmetProvider>);
  expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("LET'S BUILD YOURS.");
  fireEvent.submit(screen.getByTestId("contact-form"));
  expect(screen.getByRole("alert")).toHaveTextContent("Tell me your name and a little about the project.");
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Maya" } });
  fireEvent.change(screen.getByLabelText("Project type"), { target: { value: "Landing Page" } });
  fireEvent.change(screen.getByLabelText("Budget"), { target: { value: "$2k to $5k" } });
  fireEvent.change(screen.getByLabelText("Project brief"), { target: { value: "Launch a focused product page in October." } });
  expect(screen.getByTestId("whatsapp-preview")).toHaveTextContent("Maya");
  expect(screen.getByText("Delivered")).toBeInTheDocument();
  fireEvent.submit(screen.getByTestId("contact-form"));
  expect(open).toHaveBeenCalledWith(expect.stringContaining("wa.me/15550192834"), "_blank", "noopener,noreferrer");
  expect(decodeURIComponent(open.mock.calls[0][0])).toContain("Launch a focused product page in October.");
});
