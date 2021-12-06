const router = require('express').Router();
// @ts-ignore
const {transform} = require('./transforms/dist/transform');

// There are some pages that we do not want transformed explicitly.
const exemptPages = [
  // We do not transform amp-story-unsupported-browser-layer as it tests
  // a page that explicitly wants to load the js version since and not the mjs
  // as it executes a code block that is guarded by `isEsm()` which is
  // dead code eliminated in the mjs version.
  '/examples/visual-tests/amp-story/amp-story-unsupported-browser-layer.html',
];

router.get('/examples/*.html', async (req, res, next) => {
  let transformedHTML;
  if (exemptPages.includes(req.path)) {
    return next();
  }
  const filePath = `${process.cwd()}${req.path}`;
  try {
    transformedHTML = await transform(filePath);
  } catch (e) {
    console./*OK*/ log(
      `${req.path} could not be transformed by the postHTML ` +
        `pipeline.\n${e.message}`
    );
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.query.__amp_source_origin) {
    res.setHeader('Access-Control-Allow-Origin', req.query.__amp_source_origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.end(transformedHTML);
});

module.exports = router;
