import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import NativePortfolioScroll from "../components/NativePortfolioScroll";
import { portfolioSections } from "../utils/scrollToSection";

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

function renderPortfolio(viewport) {
  vi.stubGlobal("visualViewport", viewport);
  const setActive = vi.fn();
  const tops = [0, 600, 1200, 1800];
  render(
    <NativePortfolioScroll ready request={{ id: "home" }} setActive={setActive}>
      {portfolioSections.map(({ id }) => <section key={id} id={id} />)}
    </NativePortfolioScroll>
  );
  portfolioSections.forEach(({ id }, index) => {
    vi.spyOn(document.getElementById(id), "getBoundingClientRect")
      .mockImplementation(() => ({ top: tops[index] }));
  });
  return { setActive, tops };
}

test("updates the dock when scrolling inside the page does not bubble to the window", async () => {
  const viewport = Object.assign(new EventTarget(), { height: 700, offsetTop: 0 });
  const { setActive, tops } = renderPortfolio(viewport);
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith("Home"));

  tops.splice(0, tops.length, -1040, -440, 160, 760);
  fireEvent.scroll(screen.getByRole("main"), { bubbles: false });

  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith("Projects"));
  expect(window.location.hash).toBe("#projects");
});

test("uses the visible viewport when the browser toolbar changes its height", async () => {
  const viewport = Object.assign(new EventTarget(), { height: 500, offsetTop: 100 });
  const { setActive, tops } = renderPortfolio(viewport);
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith("Home"));

  tops.splice(0, tops.length, -922, -322, 278, 878);
  fireEvent.scroll(window);
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith("About"));

  viewport.height = 680;
  viewport.dispatchEvent(new Event("resize"));
  await waitFor(() => expect(setActive).toHaveBeenLastCalledWith("Projects"));
});
