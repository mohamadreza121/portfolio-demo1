import { fireEvent, render, screen } from "@testing-library/react";
import NetworkRack from "../components/NetworkRack";

test("opens the same device from its faceplate and exposed chassis surfaces", () => {
  const onOpen = vi.fn();
  render(<NetworkRack onOpen={onOpen} />);
  const switchButton = screen.getByRole("button", { name: "Open SW2 console" });
  const routerButton = screen.getByRole("button", { name: "Open R2 console" });
  const routerBay = routerButton.closest(".rack-bay");

  fireEvent.click(routerBay.querySelector(".rack-bay__side i"));
  fireEvent.click(routerBay.querySelector(".rack-bay__lid"));
  fireEvent.click(switchButton);

  expect(onOpen.mock.calls).toEqual([
    ["R2", routerButton],
    ["R2", routerButton],
    ["SW2", switchButton],
  ]);
});
