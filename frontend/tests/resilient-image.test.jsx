import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ResilientImage from "../src/components/media/ResilientImage";

test("image fallback recovers when the source is corrected", async () => {
  const { rerender } = render(<ResilientImage src="https://example.test/broken.jpg" alt="Project preview"/>);
  fireEvent.error(screen.getByRole("img", { name: "Project preview" }));
  expect(screen.getByRole("img", { name: /Preview unavailable/ })).toBeInTheDocument();

  rerender(<ResilientImage src="https://example.test/working.jpg" alt="Project preview"/>);

  await waitFor(() => expect(screen.getByRole("img", { name: "Project preview" })).toHaveAttribute("src", "https://example.test/working.jpg"));
});
