import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const publicFile = (name) => resolve(process.cwd(), "public", name);

function jpegDimensions(buffer) {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xc3;

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  throw new Error("No JPEG dimensions found");
}

describe("static search and sharing assets", () => {
  it("keeps admin routes out of search results", async () => {
    const robots = await readFile(publicFile("robots.txt"), "utf8");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap:");
  });

  it.each(["/", "/portfolio", "/about", "/services", "/contact"])(
    "lists %s in the public sitemap",
    async (route) => {
      const sitemap = await readFile(publicFile("sitemap.xml"), "utf8");
      expect(sitemap).toContain(`<loc>https://kavinhq.com${route}</loc>`);
    },
  );

  it("ships a valid SVG favicon", async () => {
    const favicon = await readFile(publicFile("favicon.svg"), "utf8");
    expect(favicon.trim()).toMatch(/^<svg[\s>]/);
    expect(favicon).toContain("</svg>");
  });

  it("ships a 1200 by 630 JPEG social image", async () => {
    const image = await readFile(publicFile("og-image.jpg"));
    expect(image.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
    expect(jpegDimensions(image)).toEqual({ width: 1200, height: 630 });
  });
});
