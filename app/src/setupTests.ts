import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom does not implement IntersectionObserver. Framer Motion's
// whileInView (used by the Reveal component throughout the site) depends
// on it at mount time, so without this stub every test touching a page
// with a Reveal-wrapped section throws ReferenceError. This is a minimal
// stub sufficient for rendering tests — it never actually fires the
// callback, since these tests don't assert on scroll-triggered animation.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly scrollMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
  takeRecords = (): IntersectionObserverEntry[] => [];
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
