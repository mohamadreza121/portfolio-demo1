import React from "react";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../test/test-utils";
import Navbar from "../components/Navbar.jsx";

describe("Navbar integration", () => {
  it("renders navigation dock buttons", () => {
    renderWithRouter(<Navbar />);

    const buttons = screen.getAllByRole("button");

    expect(buttons).toHaveLength(5);
  });

  it("labels the compact dock, marks the active section, and hides during quotes", () => {
    const { unmount } = renderWithRouter(<Navbar compact active="Projects" />);
    const projects = screen.getByRole("button", { name: "Projects" });
    expect(projects).toHaveAttribute("aria-current", "location");
    expect(screen.getAllByRole("button")).toHaveLength(5);

    unmount();
    renderWithRouter(<Navbar compact active="Projects" hidden />);
    expect(screen.queryByRole("navigation", { name: "Primary navigation" })).not.toBeInTheDocument();
  });
});
