function tokenize(text) {
  return Array.from(text.toLowerCase().matchAll(/\S+/g), (match) => ({
    value: match[0],
    index: match.index,
  }));
}

function optionsAt(leaves, depth) {
  return [...new Set(leaves.map(({ words }) => words[depth]).filter(Boolean))].sort();
}

function matchesPrefix(word, value) {
  const numbered = value.match(/^([a-z]+)(\d[\d/.]*)$/);
  if (!numbered) return word.startsWith(value);
  const [, type, number] = numbered;
  return word.startsWith(type) && word.slice(word.search(/\d/)) === number;
}

function walk(text, commands) {
  const path = [];
  let leaves = commands.map((command) => ({ ...command, words: command.name.split(" ") }));
  for (const token of tokenize(text)) {
    const options = optionsAt(leaves, path.length);
    const candidates = options.includes(token.value)
      ? [token.value]
      : options.filter((option) => matchesPrefix(option, token.value));
    if (candidates.length !== 1) {
      return { options: candidates, index: token.index, ambiguous: candidates.length > 1 };
    }
    path.push(candidates[0]);
    leaves = leaves.filter(({ words }) => words[path.length - 1] === candidates[0]);
  }
  return {
    command: leaves.find(({ words }) => words.length === path.length),
    options: optionsAt(leaves, path.length),
    leaves,
    depth: path.length,
  };
}

export function runLabCommand(input, commands, prompt) {
  const separator = input.indexOf("|");
  const text = separator < 0 ? input : input.slice(0, separator);
  const result = walk(text, commands);

  if (result.ambiguous) return { text: `% Ambiguous command:  "${text.trim()}"` };
  if (result.index !== undefined) return { text: invalid(prompt.length + result.index) };
  if (!result.command) return { text: "% Incomplete command." };

  let output = result.command.output();
  if (separator >= 0) {
    const directive = input.slice(separator + 1).trimStart();
    const [, filter = "", pattern = ""] = directive.match(/^(\S+)\s+(.+)$/) ?? [];
    const filters = ["include", "exclude", "begin"];
    const selected = filter && filters.find((name) => name.startsWith(filter.toLowerCase()));
    if (!filter || !pattern.trim()) {
      if (!directive || filters.some((name) => name.startsWith(directive.toLowerCase()))) {
        return { text: "% Incomplete command." };
      }
      return { text: invalid(separator + prompt.length + 1) };
    }
    if (!selected) return { text: invalid(input.indexOf(directive, separator + 1) + prompt.length) };
    output = filterOutput(output, selected, pattern.trim());
  }

  return { text: output, name: result.command.name };
}

function invalid(caret) {
  return `${" ".repeat(caret)}^\n% Invalid input detected at '^' marker.`;
}

function filterOutput(output, filter, pattern) {
  const lines = output.split("\n");
  if (filter === "begin") {
    const index = lines.findIndex((line) => line.includes(pattern));
    return index === -1 ? "" : lines.slice(index).join("\n");
  }
  return lines.filter((line) => line.includes(pattern) === (filter === "include")).join("\n");
}

export function labCommandHelp(input, commands) {
  if (input.includes("|")) {
    const [text, rest] = input.split("|", 2);
    if (!walk(text, commands).command) return "";
    const filter = rest.trim().split(/\s+/)[0].toLowerCase();
    if (/\S\s$/.test(rest) && ["begin", "exclude", "include"].some((name) => name.startsWith(filter))) {
      return "  LINE     Literal text to match";
    }
    return [
      ["begin", "Start at the first matching line"],
      ["exclude", "Display lines without a match"],
      ["include", "Display only matching lines"],
    ].filter(([name]) => name.startsWith(filter))
      .map(([name, description]) => `  ${name.padEnd(16)}${description}`).join("\n");
  }

  const { options, command, leaves, depth } = choicesFor(input, commands);
  const text = options.map((name) => {
    const matches = leaves.filter(({ words }) => words[depth] === name);
    return `  ${name.padEnd(16)}${matches.length === 1 ? matches[0].description : ""}`.trimEnd();
  });
  if (command && /\s$/.test(input)) text.push("  |               Output filter", "  <cr>");
  return text.join("\n");
}

function choicesFor(input, commands) {
  const partial = input.match(/\S+$/)?.[0] ?? "";
  const base = input.slice(0, input.length - partial.length);
  const result = walk(base, commands);
  const options = result.index === undefined
    ? result.options.filter((word) => matchesPrefix(word, partial.toLowerCase()))
    : [];
  return { options, command: result.command, base, leaves: result.leaves, depth: result.depth };
}

export function completeLabCommand(input, commands) {
  const { options, base } = choicesFor(input, commands);
  if (options.length !== 1) return null;
  return `${base}${options[0]} `;
}
