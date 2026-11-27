import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import PortfolioIntro from "../components/PortfolioIntro";

beforeEach(() => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] }));
afterEach(() => vi.useRealTimers());

test.each([
  { compact: false, lead: 540, interval: 48, hold: 360, exit: 520 },
  { compact: true, lead: 270, interval: 38, hold: 230, exit: 340 },
])("types the full command before the handoff (compact: $compact)", ({ compact, lead, interval, hold, exit }) => {
  const onHandoff = vi.fn();
  const onComplete = vi.fn();
  render(<PortfolioIntro compact={compact} onHandoff={onHandoff} onComplete={onComplete} />);

  act(() => vi.advanceTimersByTime(lead - 1));
  expect(screen.queryByText("s", { exact: true })).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByText("s", { exact: true })).toBeInTheDocument();

  act(() => vi.advanceTimersByTime("show portfolio".length * interval - interval));
  expect(screen.getByText("show portfolio", { exact: true })).toBeInTheDocument();
  expect(onHandoff).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(hold));
  expect(onHandoff).toHaveBeenCalledOnce();
  expect(onComplete).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(exit));
  expect(onComplete).toHaveBeenCalledOnce();
});

test("skipping cancels the pending typing and handoff", () => {
  const onHandoff = vi.fn();
  const onComplete = vi.fn();
  const { unmount } = render(<PortfolioIntro onHandoff={onHandoff} onComplete={onComplete} />);

  fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
  expect(onComplete).toHaveBeenCalledOnce();

  unmount();
  act(() => vi.runAllTimers());
  expect(onHandoff).not.toHaveBeenCalled();
  expect(onComplete).toHaveBeenCalledOnce();
});
