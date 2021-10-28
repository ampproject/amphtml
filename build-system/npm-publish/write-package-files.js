/**
 * @fileoverview
 * Creates npm package files for a given component and AMP version.
 */

const [extension, ampVersion, extensionVersion] = process.argv.slice(2);
const fastGlob = require('fast-glob');
const marked = require('marked');
const path = require('path');
const PostHTML = require('posthtml');
const {getNameWithoutComponentPrefix} = require('../tasks/bento-helpers');
const {getSemver} = require('./utils');
const {log} = require('../common/logging');
const {readFile} = require('fs-extra');
const {stat, writeFile} = require('fs/promises');
const {valid} = require('semver');

const packageName = getNameWithoutComponentPrefix(extension);
const dir = `extensions/${extension}/${extensionVersion}`;

/**
 * Determines whether to skip
 * @return {Promise<boolean>}
 */
async function shouldSkip() {
  try {
    await stat(dir);
    return false;
  } catch {
    log(`${extension} ${extensionVersion} : skipping, does not exist`);
    return true;
  }
}

/**
 * Returns relative paths to all the extension's CSS file
 *
 * @return {Promise<string[]>}
 */
async function getStylesheets() {
  const extDir = `${dir}/dist`.split('/').join(path.sep);
  const files = await fastGlob(path.join(extDir, '**', '*.css'));
  return files.map((file) => path.relative(extDir, file));
}

/**
 * @param {*} node
 * @param {string[]=} out
 * @return {string[]}
 */
function getHtmlTextContentRecursive(node, out = []) {
  if (typeof node === 'string') {
    out.push(node);
  } else if (Array.isArray(node)) {
    for (const child of node) {
      getHtmlTextContentRecursive(child, out);
    }
  } else if (node?.content) {
    getHtmlTextContentRecursive(node.content, out);
  }
  return out;
}

/**
 * @param {string} html
 * @return {Promise<string>}
 */
async function getHtmlTextContent(html) {
  const out = [];
  await PostHTML([
    (tree) => {
      getHtmlTextContentRecursive(tree, out);
    },
  ]).process(html);
  return out.join('');
}

/**
 * Uses either the first paragraph, or the first sentence from a Markdown file,
 * as long as it's under maxLengthChars.
 * @param {string} filename
 * @param {number=} maxLengthChars
 * @return {Promise<?string>} Returns plain text with any Markdown or HTML
 *  syntax stripped out.
 */
async function getDescriptionFromMarkdown(filename, maxLengthChars = 200) {
  let markdown;
  try {
    markdown = await readFile(filename, 'utf8');
  } catch (_) {
    return null;
  }
  const tokens = marked.lexer(markdown);
  const token = tokens.find((token) => token.type === 'paragraph');
  if (!token) {
    return null;
  }
  const textContent = await getHtmlTextContent(marked.parser([token]));
  const paragraph = textContent.trim();
  if (paragraph.length <= maxLengthChars) {
    return paragraph;
  }
  let [sentence] = paragraph.split('.', 1);
  sentence += '.';
  if (sentence.length <= maxLengthChars) {
    return sentence;
  }
  return null;
}

/**
 * Write package.json
 * @return {Promise<void>}
 */
async function writePackageJson() {
  const version = getSemver(extensionVersion, ampVersion);
  if (!valid(version) || ampVersion.length != 13) {
    log(
      'Invalid semver version',
      version,
      'or AMP version',
      ampVersion,
      'or extension version',
      extensionVersion
    );
    process.exitCode = 1;
    return;
  }

  const exports = {
    '.': {
      import: './dist/web-component.module.js',
      require: './dist/web-component.js',
    },
    './web-component': {
      import: './dist/web-component.module.js',
      require: './dist/web-component.js',
    },
    './preact': {
      import: './dist/component-preact.module.js',
      require: './dist/component-preact.js',
    },
    './react': {
      import: './dist/component-react.module.js',
      require: './dist/component-react.js',
    },
  };

  for (const stylesheet of await getStylesheets()) {
    exports[`./${stylesheet}`] = `./dist/${stylesheet}`;
  }

  const description =
    (await getDescriptionFromMarkdown(`${dir}/README.md`)) ||
    `Bento ${packageName} Component`;

  const json = {
    name: `@bentoproject/${packageName}`,
    version,
    description,
    author: 'Bento Authors',
    license: 'Apache-2.0',
    main: './dist/web-component.js',
    module: './dist/web-component.module.js',
    exports,
    files: ['dist/*', 'react.js'],
    repository: {
      type: 'git',
      url: 'https://github.com/ampproject/amphtml.git',
      directory: `extensions/${extension}/${extensionVersion}`,
    },
    homepage: `https://github.com/ampproject/amphtml/tree/main/extensions/${extension}/${extensionVersion}`,
    peerDependencies: {
      preact: '^10.2.1',
      react: '^17.0.0',
    },
  };

  try {
    await writeFile(`${dir}/package.json`, JSON.stringify(json, null, 2));
    log(
      json.name,
      extensionVersion,
      ': created package.json for',
      json.version
    );
  } catch (e) {
    log(e);
    process.exitCode = 1;
    return;
  }
}

/**
 * Write react.js
 * @return {Promise<void>}
 */
async function writeReactJs() {
  const content = "module.exports = require('./dist/component-react');";
  try {
    await writeFile(`${dir}/react.js`, content);
    log(packageName, extensionVersion, ': created react.js');
  } catch (e) {
    log(e);
    process.exitCode = 1;
    return;
  }
}

/**
 * Main
 * @return {Promise<void>}
 */
async function main() {
  if (await shouldSkip()) {
    return;
  }
  writePackageJson();
  writeReactJs();
}

main();
