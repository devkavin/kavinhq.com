import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthProvider } from "../src/context/AuthContext";
import AdminRoutes from "../src/admin/AdminRoutes";

test("admin login restores session and enters the protected dashboard", async () => {
  const user = { id: "1", email: "admin@kavinhq.com", name: "Kavin", role: "admin" };
  const fetchMock = vi.fn((url) => {
    if (String(url).includes("/auth/me")) return Promise.resolve(new Response(JSON.stringify({ detail: "Authentication required" }), { status: 401, headers: { "Content-Type": "application/json" } }));
    if (String(url).includes("/auth/refresh")) return Promise.resolve(new Response(JSON.stringify({ detail: "Refresh token required" }), { status: 401, headers: { "Content-Type": "application/json" } }));
    if (String(url).includes("/auth/login")) return Promise.resolve(new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } }));
    if (String(url).includes("/health")) return Promise.resolve(new Response(JSON.stringify({ status: "ok", database: "connected" }), { status: 200, headers: { "Content-Type": "application/json" } }));
    if (String(url).includes("/projects")) return Promise.resolve(new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }));
    return Promise.resolve(new Response(JSON.stringify({ whatsapp_number: "15550192834", whatsapp_message: "Hello" }), { status: 200, headers: { "Content-Type": "application/json" } }));
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<HelmetProvider><MemoryRouter initialEntries={["/admin"]}><AuthProvider><AdminRoutes/></AuthProvider></MemoryRouter></HelmetProvider>);
  await waitFor(() => expect(screen.getByLabelText("Email")).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@kavinhq.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-password" } });
  fireEvent.click(screen.getByTestId("admin-login-submit"));
  await waitFor(() => expect(screen.getByText("Projects")).toBeInTheDocument());
  await waitFor(() => expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow"));
  expect(screen.getByTestId("admin-db-health")).toHaveTextContent("Connected");
});
