import { completeLabCommand, labCommandHelp, runLabCommand } from "../utils/labConsole";
import { commandsFor, consoleGroups } from "../data/projects/project1Console";

const host = "HQ-EDGE";
const commands = commandsFor(host);
const run = (input, device = host) => runLabCommand(input, commandsFor(device), `${device}#`);

test("resolves Cisco-style abbreviations against the active device", () => {
  expect(run("SH   IP INT BR")).toMatchObject({ name: "show ip interface brief", text: expect.stringContaining("10.255.101.1") });
  expect(run("sh int tun20")).toMatchObject({ name: "show interfaces tunnel20", text: expect.stringContaining("administratively down") });
  expect(run("sh vl br", "SW1").text).toContain("HQ-SERVERS");
  expect(run("sh vl br").text).toContain("Invalid input detected");
});

test("distinguishes ambiguous, incomplete, and invalid input", () => {
  expect(run("show ip o").text).toBe("% Incomplete command.");
  expect(run("show interfaces t").text).toContain("Ambiguous command");
  expect(run("show ib route").text.split("\n")[0].indexOf("^")).toBe("HQ-EDGE#show ".length);
  expect(run("configure terminal").text).toContain("Invalid input detected");
});

test("provides context-sensitive help and only completes a unique token", () => {
  expect(labCommandHelp("sh ip ", commands)).toContain("ospf");
  expect(labCommandHelp("sh ip route ", commands)).toContain("<cr>");
  expect(completeLabCommand("sh ip i", commands)).toBe("sh ip interface ");
  expect(completeLabCommand("sh int t", commands)).toBeNull();
  expect(labCommandHelp("sh ip route | i", commands)).toContain("include");
});

test("filters simulated output while preserving line formatting", () => {
  const command = "sh ip route";
  const full = run(command).text;
  const filtered = run(command + " | inc Tunnel10");
  expect(filtered.name).toBe("show ip route");
  expect(filtered.text).toBe(full.split("\n").filter((line) => line.includes("Tunnel10")).join("\n"));
  expect(run(command + " | exclude Tunnel10").text).not.toContain("Tunnel10");
  expect(run(command + " | begin Gateway of last resort").text).toMatch(/^Gateway of last resort/);
  expect(run(command + " | include never-matches").text).toBe("");
});

test("every advertised command has output on its device", () => {
  for (const { nodes } of consoleGroups) {
    for (const [device] of nodes) {
      for (const { name } of commandsFor(device)) {
        expect(run(name, device), `${device}#${name}`).toMatchObject({
          name,
          text: expect.stringMatching(/\S/),
        });
      }
    }
  }
});
