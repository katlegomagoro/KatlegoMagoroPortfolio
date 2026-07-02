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

// Deterministic media query behavior for tests:
// - reduced motion: true (skip typing delays)
// - color scheme dark: false (light-mode default)
vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string): MediaQueryList => {
    const matches =
      query.includes("prefers-reduced-motion") ||
      (!query.includes("prefers-color-scheme") && false);

    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  })
);
