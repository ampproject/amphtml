const router = require('express').Router();
// @ts-ignore
const {transform} = require('./transforms/dist/transform');

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
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (req.query.__amp_source_origin) {
    res.setHeader('Access-Control-Allow-Origin', req.query.__amp_source_origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.end(transformedHTML);
});

module.exports = router;
