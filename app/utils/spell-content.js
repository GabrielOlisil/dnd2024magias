import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true
});

// Shared across card instances so filtering/remounting reuses the rendered text.
const renderedContent = new Map();

export function renderSpellMarkdown(content) {
  if (typeof content !== 'string' || !content) {return '';}
  if (!renderedContent.has(content)) {
    renderedContent.set(content, markdown.render(content));
  }
  return renderedContent.get(content);
}
