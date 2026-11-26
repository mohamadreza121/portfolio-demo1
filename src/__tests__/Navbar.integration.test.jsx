import React from "react";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "../test/test-utils";
import Navbar from "../components/Navbar.jsx";

describe("Navbar integration", () => {
  it("renders navigation dock buttons", () => {
    renderWithRouter(<Navbar />);

    const buttons = screen.getAllByRole("button");

    expect(buttons.length).toBeGreaterThan(0);
  });

  it("labels the compact dock, marks the active section, and hides during quotes", () => {
    const { unmount } = renderWithRouter(<Navbar compact active="Projects" theme="night" />);
    const projects = screen.getByRole("button", { name: "Projects" });
    expect(projects).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeVisible();

    unmount();
    renderWithRouter(<Navbar compact active="Projects" theme="night" hidden />);
    expect(screen.queryByRole("navigation", { name: "Primary navigation" })).not.toBeInTheDocument();
  });
});
