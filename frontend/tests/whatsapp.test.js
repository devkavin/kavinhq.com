import { expect, test } from "vitest";
import { buildWhatsAppUrl, composeWhatsAppMessage } from "../src/lib/whatsapp";

test("composes visitor details on separate lines", () => {
  const message = composeWhatsAppMessage("Hello KAVINHQ!", { name: "Maya", projectType: "Landing Page", budget: "$2k", brief: "Launch in October" });
  expect(message).toBe("Hello KAVINHQ!\n\nName: Maya\nProject type: Landing Page\nBudget: $2k\nBrief: Launch in October");
});

test("builds a wa.me URL from a sanitized international number", () => {
  expect(buildWhatsAppUrl("+1 (555) 019-2834", "Hello there")).toBe("https://wa.me/15550192834?text=Hello%20there");
});
