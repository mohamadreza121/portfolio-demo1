import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import RackTransition from "../components/RackTransition";
import { loadProjectLab } from "../routes/loadProjectLab";

vi.mock("../routes/loadProjectLab", () => ({ loadProjectLab: vi.fn() }));
const source = { left: 20, top: 100, width: 400, height: 500, rackWidth: 340, pose: "none", perspective: "1500px", host: "SW1" };

test("keeps the live rack visible while loading and completes after the destination mounts", async () => {
  let resolveModule;
  loadProjectLab.mockReturnValue(new Promise((resolve) => { resolveModule = resolve; }));
  const previousAnimate = Element.prototype.animate;
  Element.prototype.animate = vi.fn(() => ({ finished: Promise.resolve(), cancel: vi.fn() }));
  const navigate = vi.fn();
  function Harness() {
    const [loaded, setLoaded] = useState(false);
    const [active, setActive] = useState(true);
    return <>
      {active && <RackTransition source={source} onNavigate={() => { navigate(); setLoaded(true); }} onComplete={() => setActive(false)} />}
      {loaded && <main className="project-page--lab"><div className="lab-stage__hardware"><div className="rack-model">Lab ready</div></div></main>}
    </>;
  }
  try {
    render(<Harness />);
    expect(document.querySelector(".rack-transition__flight")).toBeInTheDocument();
    expect(Element.prototype.animate).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    await act(async () => resolveModule({}));
    expect(await screen.findByText("Lab ready")).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector(".rack-transition")).not.toBeInTheDocument());
    expect(navigate).toHaveBeenCalledOnce();
    expect(document.documentElement).not.toHaveAttribute("data-rack-transition");
  } finally {
    Element.prototype.animate = previousAnimate;
  }
});

test("lets visitors dismiss a failed load and restores the original rack", async () => {
  loadProjectLab.mockRejectedValue(new Error("Unavailable"));
  function Harness() {
    const [active, setActive] = useState(true);
    return active && <RackTransition source={source} onNavigate={vi.fn()} onComplete={() => setActive(false)} />;
  }
  render(<Harness />);
  expect(await screen.findByText("The lab couldn’t open. Please try again.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(document.querySelector(".rack-transition")).not.toBeInTheDocument();
  expect(document.documentElement).not.toHaveAttribute("data-rack-transition");
});


test("cancels an unfinished load without navigating later", async () => {
  let resolveModule;
  loadProjectLab.mockReturnValue(new Promise((resolve) => { resolveModule = resolve; }));
  const navigate = vi.fn();
  function Harness() {
    const [active, setActive] = useState(true);
    return active && <RackTransition source={source} onNavigate={navigate} onComplete={() => setActive(false)} />;
  }
  render(<Harness />);
  fireEvent.keyDown(window, { key: "Escape" });
  await act(async () => resolveModule({}));
  expect(navigate).not.toHaveBeenCalled();
  expect(document.querySelector(".rack-transition")).not.toBeInTheDocument();
  expect(document.documentElement).not.toHaveAttribute("data-rack-transition");
});
