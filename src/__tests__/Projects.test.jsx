import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Projects from "../pages/Projects";

function Lab() {
  const { state } = useLocation();
  return <h1>{state?.fromRackPreview ? "Lab after zoom" : "Lab opened directly"}</h1>;
}

function renderProjects(reduced, onEnterLab = vi.fn(), mobile = false) {
  const query = vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    matches: (media.includes("prefers-reduced-motion") && reduced) || (media.includes("max-width: 760px") && mobile),
    media,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const view = render(
    <MemoryRouter initialEntries={["/#projects"]}>
      <Routes>
        <Route path="/" element={<Projects onEnterLab={onEnterLab} />} />
        <Route path="/projects/1" element={<Lab />} />
      </Routes>
    </MemoryRouter>,
  );
  vi.spyOn(view.container.querySelector(".project-rack-link"), "getBoundingClientRect")
    .mockReturnValue({ left: 20, top: 100, width: 400, height: 340 });
  return { ...view, query, onEnterLab, link: screen.getByRole("link", { name: "Enter the lab" }) };
}

test("starts a live rack transition immediately from the project preview", () => {
  const { link, container, query, onEnterLab } = renderProjects(false);
  try {
    expect(container.querySelector("video")).not.toBeInTheDocument();
    fireEvent.click(link);
    expect(onEnterLab).toHaveBeenCalledOnce();
    expect(onEnterLab).toHaveBeenCalledWith(expect.objectContaining({ left: 20, top: 100, width: 400, height: 340 }));
  } finally {
    query.mockRestore();
  }
});

test("opens the lab immediately with reduced motion", () => {
  const { link, query, onEnterLab } = renderProjects(true);
  try {
    fireEvent.click(link);
    expect(screen.getByRole("heading", { name: "Lab opened directly" })).toBeInTheDocument();
    expect(onEnterLab).not.toHaveBeenCalled();
  } finally {
    query.mockRestore();
  }
});


test("uses a simple route transition on phones", () => {
  const { link, query, onEnterLab } = renderProjects(false, vi.fn(), true);
  try {
    fireEvent.click(link);
    expect(screen.getByRole("heading", { name: "Lab opened directly" })).toBeInTheDocument();
    expect(onEnterLab).not.toHaveBeenCalled();
  } finally {
    query.mockRestore();
  }
});
