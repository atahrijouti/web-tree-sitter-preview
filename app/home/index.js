import { html } from "unbundle";
import { Language, Parser } from "web-tree-sitter";
const metadata = {
  title: "Tree sitter preview",
  description: "Preview your tree-sitter theme"
};
const sourceCode = `
    // --- Modules ---
    import fs from "fs";
    import { join } from "path";

    // --- Variables & Constants ---
    const PI = 3.1415;
    let counter = 0;

    // --- Arrow Function ---
    const add = (a, b) => a + b;
    console.log(add(2, 3));

    // --- Classes & Inheritance ---
    class Person {
        constructor(name) { this.name = name; }
        greet() { return \`Hello, \${this.name}!\`; }
    }

    class Admin extends Person {
        constructor(name, level) {
            super(name);
            this.level = level;
        }
    }

    console.log(new Admin("Eve", 10).greet());

    // --- Async/Await & Optional Chaining ---
    async function fetchData(url) {
        try {
            const res = await fetch(url);
            return res.ok ? await res.json() : null;
        } catch { return null; }
    }

    const config = { theme: "dark" };
    console.log(config?.theme ?? "light");

    // --- Generators & Symbols ---
    function* idGen() { let id = 1; while (true) yield id++; }
    const uniqueID = Symbol("id");
`;
const walk = (node, depth = 0) => {
  console.log(" ".repeat(depth * 2) + node.type);
  for (let i = 0; i < node.childCount; i++) {
    const nthChild = node.child(i);
    if (nthChild == null) {
      continue;
    }
    walk(nthChild, depth + 1);
  }
};
const highlightCode = (cursor, sourceCode2) => {
  const positions = Array(sourceCode2.length).fill(null);
  const traverseTree = (cursor2) => {
    do {
      const node = cursor2.currentNode;
      if (!node) continue;
      const { startIndex, endIndex, type } = node;
      let hasChildren = false;
      if (cursor2.gotoFirstChild()) {
        hasChildren = true;
        traverseTree(cursor2);
        cursor2.gotoParent();
      }
      if (!hasChildren) {
        for (let i = startIndex; i < endIndex; i++) {
          positions[i] = { type, start: startIndex, end: endIndex };
        }
      }
    } while (cursor2.gotoNextSibling());
  };
  traverseTree(cursor);
  let output = "";
  let currentType = null;
  let currentStart = 0;
  for (let i = 0; i < sourceCode2.length; i++) {
    const pos = positions[i];
    if (!pos || currentType && pos.type !== currentType) {
      if (currentType) {
        const text = sourceCode2.slice(currentStart, i);
        const className = `syntax-${currentType.replace(/\W/g, "-")}`;
        output += `<span class="${className}">${text}</span>`;
        currentType = null;
      }
      if (pos) {
        currentType = pos.type;
        currentStart = i;
      } else {
        output += sourceCode2[i];
      }
    } else if (!currentType && pos) {
      currentType = pos.type;
      currentStart = i;
    }
  }
  if (currentType) {
    const text = sourceCode2.slice(currentStart);
    const className = `syntax-${currentType.replace(/\W/g, "-")}`;
    output += `<span class="${className}">${text}</span>`;
  }
  return output;
};
const ready = async () => {
  await Parser.init({});
  const parser = new Parser();
  const JavaScript = await Language.load(
    "node_modules/tree-sitter-javascript/tree-sitter-javascript.wasm"
  );
  parser.setLanguage(JavaScript);
  const codeElement = document.querySelector(".tree-sitter-page pre");
  if (!codeElement) {
    return;
  }
  codeElement.textContent = sourceCode;
  const tree = parser.parse(sourceCode);
  if (!tree?.rootNode) {
    return;
  }
  walk(tree?.rootNode);
  if (codeElement) {
    codeElement.innerHTML = highlightCode(tree.walk(), sourceCode);
  }
};
const content = () => {
  return html`<div class="tree-sitter-page">
    <h2>tree-sitter</h2>
    <div class="sample-code">
      <pre></pre>
    </div>
    <div class="theme-config"></div>
  </div>`;
};
export {
  content,
  metadata,
  ready
};
