const router = require('express').Router();
// @ts-ignore
const {transform} = require('./transforms/dist/transform');

router.get('/examples/*.html', async (req, res, next) => {
  let transformedHTML;

  // ?transform=0 or ?transform=false will force an opt-out of the
  // transformation. This can be useful if we want to explicitly test the
  // nomodule version of the code.
  const skipTransform =
    'transform' in req.query &&
    (req.query.transform === '0' || req.query.transform === 'false');
  if (skipTransform) {
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
