import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Main from "../pages/Main";

test("renders all major sections", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Main />
    </MemoryRouter>
  );

  for (const heading of [/networks.*web apps/i, /selected work/i, /about me/i, /professional credentials/i, /services/i, /get in touch/i]) {
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  }
});
