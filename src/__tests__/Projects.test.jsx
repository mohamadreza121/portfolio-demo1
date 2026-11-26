import { fireEvent, render, screen } from "@testing-library/react";
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
  vi.spyOn(view.container.querySelector(".project-viewfinder"), "getBoundingClientRect")
    .mockReturnValue({ left: 20, top: 100, width: 400, height: 340 });
  return { ...view, query, link: screen.getByRole("link", { name: "Enterprise Multi-Site Network Lab" }) };
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
