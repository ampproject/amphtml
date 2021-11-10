// @ts-ignore
import dedent from 'dedent';
import {readFile} from 'fs/promises';
import {marked, Lexer, Parser} from 'marked';
import {basename} from 'path';

async function lexFile(filename: string) {
  const markdown = await readFile(filename, 'utf8');
  return Lexer.lex(markdown);
}

export function getHtmlSnippetFromMarkdown(
  tokens: marked.Token[]
): marked.Tokens.Code | null {
  for (const token of tokens) {
    if (
      token.type === 'code' &&
      token.lang === 'html' &&
      token.text.includes('<html>')
    ) {
      return token;
    }
  }
  return null;
}

export async function renderMarkdown(filename: string, cwd = '.') {
  const tokens = await lexFile(`${cwd}/${filename}`);
  const snippet = getHtmlSnippetFromMarkdown(tokens);
  if (snippet) {
    const link = `[**▶️ Run this snippet**](${filename}.html)`;
    const index = tokens.indexOf(snippet);
    tokens.splice(index, 0, ...Lexer.lex(link));
  }
  const body = Parser.parse(tokens);
  return wrapTextBody(body, basename(filename));
}

export async function renderMarkdownSnippet(filename: string, cwd = '.') {
  const tokens = await lexFile(`${cwd}/${filename}`);
  const snippet = getHtmlSnippetFromMarkdown(tokens);
  if (snippet) {
    return snippet.text;
  }
  const body = dedent(/* HTML */ `
    <p>
      To add a runnable snippet, make sure that
      <code><a href="${filename}">${filename}</a></code> contains:
    </p>
    <pre><code>${dedent(`
      &lt;html&gt;
        ...
      &lt;/html&gt;
    `)}</code></pre>
  `);
  return wrapTextBody(body, basename(filename));
}

export function wrapTextBody(body: string, title: string): string {
  return dedent(/* HTML */ `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: sans-serif;
            line-height: 1.4;
            margin: 0;
            padding: 10px 20px;
            font-size: 14px;
          }
          pre {
            color: #444;
            overflow: auto;
            margin: 20px -20px;
            padding: 0 20px;
          }
          a {
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `);
}
