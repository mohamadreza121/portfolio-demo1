import { getOpeningVariant, markOpeningSeen } from "../utils/opening";

const home = { pathname: "/", hash: "" };

beforeEach(() => window.sessionStorage.clear());

test("chooses the desktop or compact sequence for a first home visit", () => {
  expect(getOpeningVariant(home, false)).toBe("desktop");
  expect(getOpeningVariant(home, true)).toBe("compact");
});

test("opens immediately after the sequence has been seen in this session", () => {
  markOpeningSeen();
  expect(getOpeningVariant(home, false)).toBeNull();
});

test("opens directly to a project or a bookmarked section", () => {
  expect(getOpeningVariant({ pathname: "/projects/2", hash: "" }, false)).toBeNull();
  expect(getOpeningVariant({ pathname: "/", hash: "#projects" }, true)).toBeNull();
});

test("skips the sequence when reduced motion is requested", () => {
  const previous = window.matchMedia;
  window.matchMedia = (query) => ({ matches: query.includes("prefers-reduced-motion") });
  try {
    expect(getOpeningVariant(home, false)).toBeNull();
  } finally {
    window.matchMedia = previous;
  }
});
