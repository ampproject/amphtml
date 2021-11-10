const express = require('express');
const {
  // @ts-ignore
  renderMarkdown,
  // @ts-ignore
  renderMarkdownSnippet,
} = require('./transforms/dist/markdown');
// @ts-ignore
const {transform} = require('./transforms/dist/transform');

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {string} content
 */
function serveHtml(req, res, content) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.query.__amp_source_origin) {
    res.setHeader('Access-Control-Allow-Origin', req.query.__amp_source_origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.end(content);
}

const router = express.Router();

router.get('/examples/*.html', async (req, res) => {
  let transformedHTML;
  const filePath = `${process.cwd()}${req.path}`;
  try {
    transformedHTML = await transform(filePath);
  } catch (e) {
    console./*OK*/ log(
      `${req.path} could not be transformed by the postHTML ` +
        `pipeline.\n${e.message}`
    );
  }
  serveHtml(req, res, transformedHTML);
});

router.get('/*.md', async (req, res) => {
  const filename = req.path;
  const html = await renderMarkdown(filename, process.cwd());
  serveHtml(req, res, html);
});

router.get('/*.md.html', async (req, res) => {
  const filename = req.path.replace(/.html$/, '');
  const html = await renderMarkdownSnippet(filename, process.cwd());
  serveHtml(req, res, html);
});

module.exports = router;
