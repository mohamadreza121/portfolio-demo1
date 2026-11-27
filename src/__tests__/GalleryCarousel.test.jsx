import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import GalleryCarousel from "../components/GalleryCarousel";

const items = Array.from({ length: 7 }, (_, index) => ({
  title: "Capture " + (index + 1),
  thumb: "/image-" + (index + 1) + ".png",
}));

const show = (renderViewer = () => null) => (
  <GalleryCarousel items={items} label="Lab evidence" itemLabel="screenshot"
    viewLabel="View screenshot" renderCaption={(item) => <h2>{item.title}</h2>} renderViewer={renderViewer} />
);

afterEach(() => {
  delete document.documentElement.dataset.phase;
  vi.unstubAllGlobals();
});

test("withholds image requests through the intro and until the deck panel is active", async () => {
  let notify;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) { notify = callback; }
    observe() {}
    disconnect() {}
  });
  document.documentElement.dataset.phase = "intro";
  const { container } = render(<div className="scroll-deck__panel" aria-hidden="true">{show()}</div>);
  act(() => notify([{ isIntersecting: true }]));
  expect(container.querySelectorAll("img[src]")).toHaveLength(0);

  document.documentElement.dataset.phase = "ready";
  await waitFor(() => expect(container.querySelectorAll("img[src]")).toHaveLength(0));
  container.firstElementChild.setAttribute("aria-hidden", "false");
  await waitFor(() => expect(container.querySelectorAll("img[src]")).toHaveLength(5));
});

test("wraps with the same keys and opens the selected screenshot", () => {
  const renderViewer = vi.fn();
  render(show(renderViewer));
  fireEvent.click(screen.getByRole("button", { name: "Previous screenshot" }));
  expect(screen.getByRole("heading", { name: "Capture 7" })).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole("button", { name: "View Capture 7" }), { key: "ArrowRight" });
  expect(screen.getByRole("heading", { name: "Capture 1" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "View screenshot" }));
  expect(renderViewer).toHaveBeenCalledWith(items[0], expect.objectContaining({ index: 0 }), expect.any(Function));
});
