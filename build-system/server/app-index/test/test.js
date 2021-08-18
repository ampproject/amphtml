const test = require('ava');
const {serveIndexForTesting} = require('../');

const NOOP = () => {};

test('renders HTML', async (t) => {
  const renderedHtml = await serveIndexForTesting({url: '/'}, {end: NOOP});
  t.truthy(renderedHtml);
});
