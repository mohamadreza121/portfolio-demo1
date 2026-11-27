import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Main from "../pages/Main";

test("renders all major sections", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Main setActive={vi.fn()} revealKey={1} />
    </MemoryRouter>
  );

  // Use findByRole to allow async layout/state updates
  expect(await screen.findByRole("heading", { name: /about me/i })).toBeInTheDocument();

  expect(
    await screen.findByRole("heading", { name: "Enterprise Multi-Site Network Lab" })
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("heading", { name: /professional certifications/i })
  ).toBeInTheDocument();

  expect(screen.getByRole("heading", { name: "Get in touch" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /request a quote/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: /professional it & network services/i })).not.toBeInTheDocument();
});
