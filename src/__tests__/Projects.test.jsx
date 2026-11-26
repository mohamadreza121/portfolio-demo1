import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Projects from "../pages/Projects";

function Lab() {
  const { state } = useLocation();
  return <h1>{state?.fromRackPreview ? "Lab after zoom" : "Lab opened directly"}</h1>;
}

function renderProjects(reduced) {
  const query = vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: media.includes("prefers-reduced-motion") && reduced,
    media,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const view = render(
    <MemoryRouter initialEntries={["/#projects"]}>
      <Routes>
        <Route path="/" element={<Projects />} />
        <Route path="/projects/1" element={<Lab />} />
      </Routes>
    </MemoryRouter>,
  );
  vi.spyOn(view.container.querySelector(".project-rack-link"), "getBoundingClientRect")
    .mockReturnValue({ left: 20, top: 100, width: 400, height: 340 });
  return { ...view, query, link: screen.getByRole("link", { name: "Enter the lab" }) };
}

test("opens the project after zooming the video-free rack preview", () => {
  const { link, container, query } = renderProjects(false);
  try {
    expect(container.querySelector("video")).not.toBeInTheDocument();
    fireEvent.click(link);
    const transition = document.querySelector(".project-launch__screen");
    expect(transition).toBeInTheDocument();
    fireEvent.animationEnd(transition);
    expect(screen.getByRole("heading", { name: "Lab after zoom" })).toBeInTheDocument();
    expect(transition).not.toBeInTheDocument();
  } finally {
    query.mockRestore();
  }
});

test("opens the lab immediately with reduced motion", () => {
  const { link, query } = renderProjects(true);
  try {
    fireEvent.click(link);
    expect(screen.getByRole("heading", { name: "Lab opened directly" })).toBeInTheDocument();
    expect(document.querySelector(".project-launch__screen")).not.toBeInTheDocument();
  } finally {
    query.mockRestore();
  }
});


test("carries the rack into the lab with a native view transition", async () => {
  const originalTransition = document.startViewTransition;
  let update;
  let finish;
  const finished = new Promise((resolve) => { finish = resolve; });
  document.startViewTransition = vi.fn((callback) => {
    update = callback;
    return { finished };
  });
  const { link, query } = renderProjects(false);
  try {
    fireEvent.click(link);
    await waitFor(() => expect(document.startViewTransition).toHaveBeenCalledOnce());
    const navigation = update();
    expect(await screen.findByRole("heading", { name: "Lab after zoom" })).toBeInTheDocument();
    // This test route has no real rack. The bounded wait must still complete.
    await navigation;
    finish();
    await waitFor(() => expect(document.documentElement).not.toHaveClass("rack-morphing"));
  } finally {
    query.mockRestore();
    document.startViewTransition = originalTransition;
  }
});
