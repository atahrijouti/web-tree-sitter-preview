import { html } from "unbundle";
import { Language, Parser } from "web-tree-sitter";
const metadata = {
  title: "Tree sitter preview",
  description: "Preview your tree-sitter theme"
};
const ready = async () => {
  await Parser.init({});
  const parser = new Parser();
  const JavaScript = await Language.load(
    "node_modules/tree-sitter-javascript/tree-sitter-javascript.wasm"
  );
  parser.setLanguage(JavaScript);
  const sourceCode = "let x = 1; console.log(x);";
  const tree = parser.parse(sourceCode);
  console.log(tree);
};
const content = () => {
  return html`<div class="tree-sitter-page">
    <h2>tree-sitter</h2>
  </div>`;
};
export {
  content,
  metadata,
  ready
};
