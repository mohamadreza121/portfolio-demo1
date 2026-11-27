import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import LetterGlitch from "../components/LetterGlitch";

let ctx;
let frames;
let getContext;

beforeEach(() => {
  frames = new Map();
  let nextFrame = 0;
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id) => frames.delete(id));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ width: 200, height: 100 });
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.spyOn(Math, "random").mockReturnValue(.01);
  ctx = {
    setTransform: vi.fn(),
    measureText: () => ({ actualBoundingBoxLeft: 0, actualBoundingBoxRight: 9, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 16 }),
    clearRect: vi.fn(),
    fillText: vi.fn(),
  };
  getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function advance(now) {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(now));
  });
}

test("paints only the cells selected for a flicker, deduplicating repeated selections", () => {
  render(<LetterGlitch smooth={false} />);
  expect(ctx.fillText).toHaveBeenCalledTimes(100);
  ctx.fillText.mockClear();

  advance(0);
  advance(100);

  expect(ctx.clearRect).toHaveBeenCalledTimes(1);
  expect(ctx.clearRect).toHaveBeenCalledWith(10, 0, 10, 20);
  expect(ctx.fillText).toHaveBeenCalledTimes(1);

  advance(150);
  expect(ctx.fillText).toHaveBeenCalledTimes(1);
});

test("continues painting only the fading cell between flicker updates", () => {
  render(<LetterGlitch glitchSpeed={120} />);
  ctx.fillText.mockClear();

  advance(0);
  advance(50);
  advance(100);
  advance(150);
  advance(200);

  expect(ctx.fillText).toHaveBeenCalledTimes(2);
  expect(ctx.clearRect.mock.calls).toEqual([[10, 0, 10, 20], [10, 0, 10, 20]]);
});

test("skips drawing behind the intro and pauses while the tab is hidden", () => {
  const { rerender, unmount } = render(<LetterGlitch enabled={false} />);
  expect(getContext).not.toHaveBeenCalled();
  expect(frames.size).toBe(0);

  rerender(<LetterGlitch enabled />);
  expect(ctx.fillText).toHaveBeenCalledTimes(100);
  expect(frames.size).toBe(1);

  vi.mocked(Object.getOwnPropertyDescriptor(document, "hidden").get).mockReturnValue(true);
  fireEvent(document, new Event("visibilitychange"));
  expect(frames.size).toBe(0);

  vi.mocked(Object.getOwnPropertyDescriptor(document, "hidden").get).mockReturnValue(false);
  fireEvent(document, new Event("visibilitychange"));
  expect(frames.size).toBe(1);
  expect(ctx.fillText).toHaveBeenCalledTimes(100);

  unmount();
  expect(frames.size).toBe(0);
});
