import { html, type Metadata } from "unbundle"

export const metadata: Metadata = {
  title: "Tree-sitter web preview",
  description: "A Tree-sitter theme previewer for your favorite text-editor",
}

export const content = () => {
  return html`<div class="home-page">The Web Tree-Sitter Previewer will go here</div>`
}
