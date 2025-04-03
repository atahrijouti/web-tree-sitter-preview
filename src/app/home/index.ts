import { html, type Metadata } from "unbundle"
import { Language, Node, Parser, TreeCursor } from "web-tree-sitter"

export const metadata: Metadata = {
  title: "Tree sitter preview",
  description: "Preview your tree-sitter theme",
}

const sourceCode = `import globals from "globals"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import unbundle from "unbundle/eslint"

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  {
    files: ["**/**.ts"],
    ignores: ["!node_modules/", "node_modules/*"],
  },
  {
    files: ["src/**/*.ts"],
    plugins: { unbundle },
    rules: unbundle.configs.recommended.rules,
  },
  //
  { languageOptions: { globals: globals.browser } },
  eslint.configs.recommended,
  tseslint.configs.recommended,
)
`
const walk = (node: Node, depth = 0) => {
  console.log(" ".repeat(depth * 2) + node.type)
  for (let i = 0; i < node.childCount; i++) {
    const nthChild = node.child(i)
    if (nthChild == null) {
      continue
    }
    walk(nthChild, depth + 1)
  }
}

const highlightCode = (cursor: TreeCursor, sourceCode: string) => {
  // Create an array representing each character position in the source code
  // Each position will store the node with the smallest size that covers it
  const positions = Array(sourceCode.length).fill(null)

  // Traverse the tree and mark positions
  const traverseTree = (cursor: TreeCursor) => {
    do {
      const node = cursor.currentNode
      if (!node) continue

      const { startIndex, endIndex, type } = node

      // Check if this node has children
      let hasChildren = false
      if (cursor.gotoFirstChild()) {
        hasChildren = true
        traverseTree(cursor)
        cursor.gotoParent()
      }

      // Only assign this node to positions that don't have a more specific node assigned
      if (!hasChildren) {
        for (let i = startIndex; i < endIndex; i++) {
          positions[i] = { type, start: startIndex, end: endIndex }
        }
      }
    } while (cursor.gotoNextSibling())
  }

  traverseTree(cursor)

  // Generate output by combining adjacent positions with the same node
  let output = ""
  let currentType = null
  let currentStart = 0

  for (let i = 0; i < sourceCode.length; i++) {
    const pos = positions[i]

    // If we don't have a node for this position or it's a different node type
    if (!pos || (currentType && pos.type !== currentType)) {
      // Close previous span if there was one
      if (currentType) {
        const text = sourceCode.slice(currentStart, i)
        const className = `syntax-${currentType.replace(/\W/g, "-")}`
        output += `<span class="${className}">${text}</span>`
        currentType = null
      }

      // Start a new span if we have a node
      if (pos) {
        currentType = pos.type
        currentStart = i
      } else {
        // Just add this character without a span
        output += sourceCode[i]
      }
    } else if (!currentType && pos) {
      // Start a new span
      currentType = pos.type
      currentStart = i
    }
  }

  // Close the final span if there is one
  if (currentType) {
    const text = sourceCode.slice(currentStart)
    const className = `syntax-${currentType.replace(/\W/g, "-")}`
    output += `<span class="${className}">${text}</span>`
  }

  return output
}

export const ready = async () => {
  await Parser.init({})
  const parser = new Parser()
  const JavaScript = await Language.load(
    "node_modules/tree-sitter-javascript/tree-sitter-javascript.wasm",
  )
  parser.setLanguage(JavaScript)

  const codeElement: HTMLElement | null = document.querySelector(".tree-sitter-page pre")
  if (!codeElement) {
    return
  }
  codeElement.textContent = sourceCode

  const tree = parser.parse(sourceCode)

  if (!tree?.rootNode) {
    return
  }

  walk(tree?.rootNode)

  if (codeElement) {
    codeElement.innerHTML = highlightCode(tree.walk(), sourceCode)
  }
}

export const content = () => {
  return html`<div class="tree-sitter-page">
    <h2>tree-sitter</h2>
    <div class="sample-code">
      <pre></pre>
    </div>
    <div class="theme-config"></div>
  </div>`
}
