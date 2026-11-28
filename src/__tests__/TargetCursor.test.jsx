import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { gsap } from "gsap";
import TargetCursor from "../components/TargetCursor";

vi.mock("gsap", () => ({
  gsap: {
    quickTo: vi.fn((state, key, { onUpdate }) => Object.assign(
      vi.fn((value) => {
        state[key] = value;
        onUpdate();
      }),
      { tween: { duration: vi.fn(), kill: vi.fn() } }
    )),
  },
}));

let frames;
let hitTest;

beforeEach(() => {
  vi.clearAllMocks();
  frames = new Map();
  let nextFrame = 0;
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id) => frames.delete(id));
  hitTest = vi.fn();
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: hitTest });
});

afterEach(() => {
  delete document.elementFromPoint;
  vi.unstubAllGlobals();
});

function paint() {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback());
  });
}

function renderCursor() {
  const { container } = render(<><TargetCursor /><button className="cursor-target"><span>Open lab</span></button></>);
  const cursor = container.querySelector(".target-cursor-wrapper");
  const control = screen.getByRole("button", { name: "Open lab" });
  const bounds = vi.spyOn(control, "getBoundingClientRect")
    .mockReturnValue({ left: 20, top: 30, right: 140, bottom: 70 });
  hitTest.mockReturnValue(control);
  return { cursor, control, bounds };
}

test("locks on nested content and reuses its tweens without measuring on each mouse move", () => {
  const { cursor, control, bounds } = renderCursor();
  fireEvent.mouseOver(control.firstElementChild, { clientX: 30, clientY: 42 });

  expect(cursor).toHaveAttribute("data-locked");
  expect(cursor.style.getPropertyValue("--lock-left")).toBe("17px");
  expect(cursor.style.getPropertyValue("--lock-bottom")).toBe("61px");

  fireEvent.mouseMove(control, { clientX: 60, clientY: 42 });
  fireEvent.mouseMove(control, { clientX: 92, clientY: 54 });

  expect(bounds).toHaveBeenCalledOnce();
  expect(gsap.quickTo).toHaveBeenCalledTimes(3);
  expect(cursor.style.getPropertyValue("--cursor-x")).toBe("92px");
  expect(frames.size).toBe(0);
});

test("coalesces geometry updates and releases when scrolling moves the target away", () => {
  const { cursor, control, bounds } = renderCursor();
  fireEvent.mouseOver(control, { clientX: 30, clientY: 42 });
  bounds.mockReturnValue({ left: 26, top: 24, right: 146, bottom: 64 });

  fireEvent.scroll(window);
  fireEvent.scroll(window);
  expect(frames.size).toBe(1);
  paint();
  expect(bounds).toHaveBeenCalledTimes(2);
  expect(cursor.style.getPropertyValue("--lock-top")).toBe("21px");

  hitTest.mockReturnValue(document.body);
  fireEvent.scroll(window);
  paint();
  expect(cursor.style.getPropertyValue("--lock-progress")).toBe("0");
});

test("uses CSS states for the click feedback and clears them on blur", () => {
  const { cursor, control } = renderCursor();
  fireEvent.mouseDown(control);
  expect(cursor).toHaveAttribute("data-pressed");
  fireEvent.mouseUp(control);
  expect(cursor).not.toHaveAttribute("data-pressed");
  fireEvent.mouseDown(control);
  fireEvent.blur(window);
  expect(cursor).not.toHaveAttribute("data-pressed");
});

test("leaves controls inside the native cursor region to the browser", () => {
  const { container } = render(
    <>
      <TargetCursor />
      <button type="button" className="cursor-target">Open console</button>
      <section data-native-cursor="">
        <button type="button" className="cursor-target">Switch device</button>
      </section>
    </>
  );
  const cursor = container.querySelector(".target-cursor-wrapper");
  fireEvent.mouseOver(screen.getByRole("button", { name: "Open console" }));
  expect(cursor.style.getPropertyValue("--lock-progress")).toBe("1");
  fireEvent.mouseOver(screen.getByRole("button", { name: "Switch device" }));
  expect(cursor.style.getPropertyValue("--lock-progress")).toBe("0");
});
