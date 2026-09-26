import React from "react";
import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "../src/App";

test("renders the KAVINHQ application shell", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "unauthenticated" }), { status: 401, headers: { "Content-Type": "application/json" } })));
  render(<App />);
  expect(screen.getAllByRole("img", { name: "KAVINHQ" }).length).toBeGreaterThan(0);
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
});
