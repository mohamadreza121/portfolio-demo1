import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Router from "../routes/Router";

test("renders Main page on /", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Router
        active="Home"
        setActive={vi.fn()}
        revealKey={1}
      />
    </MemoryRouter>
  );

  expect(
    screen.getByRole("heading", { name: /about me/i })
  ).toBeInTheDocument();
});

test("renders Project1 on /projects/1", async () => {
  render(
    <MemoryRouter initialEntries={["/projects/1"]}>
      <Router
        active="Projects"
        setActive={vi.fn()}
        revealKey={1}
      />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole("heading", {
      name: /two sites\.\s*one network\./i,
    })
  ).toBeInTheDocument();
});
