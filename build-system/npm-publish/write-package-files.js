/**
 * @fileoverview
 * Creates npm package files for a given component and AMP version.
 */

const [extension, ampVersion, extensionVersion] = process.argv.slice(2);
const fastGlob = require('fast-glob');
const marked = require('marked');
const path = require('path');
const posthtml = require('posthtml');
const {copyFile, pathExists, readFile} = require('fs-extra');
const {getNameWithoutComponentPrefix} = require('../tasks/bento-helpers');
const {getSemver} = require('./utils');
const {log} = require('../common/logging');
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
 * @param {string} html
 * @return {Promise<string>}
 */
async function getHtmlTextContent(html) {
  const getTextContent = (node, out = []) => {
    if (typeof node === 'string') {
      out.push(node);
    } else if (Array.isArray(node)) {
      for (const child of node) {
        getTextContent(child, out);
      }
    } else if (node?.content) {
      getTextContent(node.content, out);
    }
    return out;
  };
  const result = await posthtml([
    (node) => getTextContent(node).join(''),
  ]).process(html);
  return result.html.trim();
}

/**
 * @param {string} markdown
 * @param {number} maxLengthChars
 * @return {Promise<?string>}
 */
async function getFirstParagraphOrSentence(markdown, maxLengthChars) {
  const token = marked.lexer(markdown).find(({type}) => type === 'paragraph');
  if (!token) {
    return null;
  }
  const html = marked.parser([token]);
  const paragraph = await getHtmlTextContent(html);
  if (paragraph.length <= maxLengthChars) {
    return paragraph;
  }
  const [sentence] = paragraph.split('.', 1);
  if (sentence.length < maxLengthChars) {
    return `${sentence}.`;
  }
  return null;
}

/**
 * Get package description from its README.md file, or a generic description
 * if the file does not exist.
 * @return {Promise<string>}
 */
async function getDescription() {
  let description;
  try {
    const markdown = await readFile(`${dir}/README.md`, 'utf8');
    description = await getFirstParagraphOrSentence(markdown, 200);
  } catch {}
  return description || `Bento ${packageName} Component`;
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

  const json = {
    name: `@bentoproject/${packageName}`,
    version,
    description: await getDescription(),
    author: 'Bento Authors',
    license: 'Apache-2.0',
    main: './dist/web-component.js',
    module: './dist/web-component.module.js',
    exports,
    files: ['dist/*', 'react.js', 'styles.css'],
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
 * todo(kvchari): temporarily copy styles to root of each package to support importing styles from root
 * Remove when we begin properly proxying style imports.
 * See issue from more information:
 * @return {Promise<void>}
 */
async function copyCssToRoot() {
  try {
    const extDir = path.join('extensions', extension, '1.0');
    const preactCssDist = path.join(extDir, 'dist', 'styles.css');
    if (await pathExists(preactCssDist)) {
      const preactCssRoot = path.join(extDir, 'styles.css');
      await copyFile(preactCssDist, preactCssRoot);
      log('Copied', preactCssDist, 'to npm package root');
    }
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
  await writePackageJson();
  await writeReactJs();
  await copyCssToRoot();
}

main();
