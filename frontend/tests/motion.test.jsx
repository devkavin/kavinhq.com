import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CustomCursor from "../src/components/motion/CustomCursor";
import MagneticButton from "../src/components/motion/MagneticButton";
import Marquee from "../src/components/motion/Marquee";
import ScrambleLabel from "../src/components/motion/ScrambleLabel";
import SpotlightCard from "../src/components/motion/SpotlightCard";

function setReducedMotion(matches) {
  window.matchMedia = (query) => ({
    matches: query.includes("prefers-reduced-motion") ? matches : true,
    media: query,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
}

test("reduced motion removes the custom cursor and keeps scramble text stable", () => {
  setReducedMotion(true);
  const { container } = render(<><CustomCursor /><ScrambleLabel text="01 / SELECTED WORK" /></>);
  expect(container.querySelector(".cursor-dot")).not.toBeInTheDocument();
  expect(screen.getByText("01 / SELECTED WORK")).toBeInTheDocument();
});

test("magnetic wrapper preserves keyboard button activation", () => {
  setReducedMotion(false);
  let activated = false;
  render(<MagneticButton><button onClick={() => { activated = true; }}>Start</button></MagneticButton>);
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  expect(activated).toBe(true);
});

test("marquee duplicates content and hides the repeated copy", () => {
  render(<Marquee items={["Landing Pages", "E-Commerce"]} />);
  expect(screen.getAllByText("Landing Pages")).toHaveLength(2);
  expect(screen.getByTestId("marquee-copy")).toHaveAttribute("aria-hidden", "true");
});

test("spotlight card records local pointer coordinates", () => {
  render(<SpotlightCard data-testid="spotlight-card">Content</SpotlightCard>);
  const card = screen.getByTestId("spotlight-card");
  fireEvent.mouseMove(card, { clientX: 40, clientY: 25 });
  expect(card.style.getPropertyValue("--mx")).toBe("40px");
  expect(card.style.getPropertyValue("--my")).toBe("25px");
});
