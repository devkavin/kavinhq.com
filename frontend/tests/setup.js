import "@testing-library/jest-dom/vitest";

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = IntersectionObserverStub;
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

window.matchMedia ||= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return true; },
});
