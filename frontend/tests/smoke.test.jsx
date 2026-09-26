import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

test("renders the KAVINHQ application shell", () => {
  render(<App />);
  expect(screen.getByText("KAVINHQ")).toBeInTheDocument();
});
