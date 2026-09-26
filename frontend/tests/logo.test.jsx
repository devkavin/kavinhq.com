import React from "react";
import { render, screen } from "@testing-library/react";
import Logo from "../src/components/brand/Logo";

test("logo exposes the KAVINHQ brand name", () => {
  render(<Logo />);
  expect(screen.getByRole("img", { name: "KAVINHQ" })).toBeInTheDocument();
});
