import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Router from "../routes/Router";

test("renders Main page on /", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Router />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("heading", { name: /about me/i })
  ).toBeInTheDocument();
});

test("renders Project1 on /projects/1", async () => {
  render(
    <MemoryRouter initialEntries={["/projects/1"]}>
      <Router />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole("heading", {
      name: /enterprise multi-site network lab/i,
    })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "All Projects" })).toHaveAttribute("href", "/#projects");
});
