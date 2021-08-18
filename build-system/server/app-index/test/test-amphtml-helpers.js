const posthtml = require('posthtml');
const test = require('ava');
const {
  AmpDoc,
  AmpState,
  addRequiredExtensionsToHead,
  ampStateKey,
} = require('../amphtml-helpers');
const {getElementChildren, posthtmlGetTextContent} = require('./helpers');
const {html} = require('../html');

test('AmpDoc fails without args', (t) => {
  t.throws(() => AmpDoc());
});

test('AmpDoc fails without min required fields', (t) => {
  t.throws(() => AmpDoc({}));
});

test('ampStateKey concats arguments', (t) => {
  t.is(ampStateKey('foo', 'bar'), 'foo.bar');
  t.is(ampStateKey('tacos', 'al', 'pastor'), 'tacos.al.pastor');
});

function containsExtension(scripts, expectedExtension) {
  return scripts.some(
    (s) =>
      s.attrs?.['custom-element'] == expectedExtension &&
      s.attrs?.['custom-template'] == null
  );
}

function containsTemplate(scripts, expectedTemplate) {
  return scripts.some(
    (s) =>
      s.attrs?.['custom-template'] == expectedTemplate &&
      s.attrs?.['custom-extension'] == null
  );
}

async function getScriptNodes(document) {
  const scripts = [];

  await posthtml([
    (tree) => {
      tree.match({tag: 'script'}, (node) => {
        scripts.push(node);
        return node;
      });
      return tree;
    },
  ]).process(document);

  return scripts;
}

test('AmpState generates tree', async (t) => {
  const id = 'foo';
  const state = 'bar';
  const document = AmpState(id, state);

  await posthtml([
    (tree) => {
      const nodes = getElementChildren(tree);
      t.is(nodes.length, 1);
      const [root] = nodes;
      t.is(root.tag, 'amp-state');
      const rootChildren = getElementChildren(root.content);
      t.is(rootChildren.length, 1);
      const [firstElementChild] = rootChildren;
      t.is(firstElementChild.tag, 'script');
      t.is(firstElementChild.attrs?.type, 'application/json');
    },
  ]).process(document);
});

test('AmpState renders json object', async (t) => {
  const id = 'whatever';
  const state = {foo: 'bar', baz: {yes: 'no'}};

  const document = AmpState(id, state);

  const textContent = await posthtmlGetTextContent(document, {
    tag: 'script',
  });

  t.deepEqual(JSON.parse(textContent), state);
});

test('AmpState renders string literal', async (t) => {
  const id = 'whatever';
  const state = 'foo';

  const document = AmpState(id, state);

  const textContent = await posthtmlGetTextContent(document, {
    tag: 'script',
  });

  t.is(JSON.parse(textContent), state);
});

test('AmpState renders array', async (t) => {
  const id = 'whatever';
  const state = ['foo', 'bar', 'baz'];

  const document = AmpState(id, state);

  const textContent = await posthtmlGetTextContent(document, {
    tag: 'script',
  });

  t.deepEqual(JSON.parse(textContent), state);
});

test('addRequiredExtensionsToHead adds mixed', async (t) => {
  const expectedExtensions = [
    'amp-foo',
    'amp-bar',
    'amp-foo-bar-baz',
    'amp-bind',
    'amp-form',
  ];

  const expectedTemplates = ['amp-mustache'];

  // eslint-disable-next-line local/html-template
  const rawStr = html`
    <html>
      <head></head>
      <body>
        <amp-foo foo="bar"></amp-foo>
        <amp-foo foo="bar"></amp-foo>
        <amp-foo foo="bar"></amp-foo>
        <div>
          <amp-bar></amp-bar>
          <div>
            <amp-foo-bar-baz many="1" attributes="2">
              Text content
            </amp-foo-bar-baz>
          </div>
          <input />
          <amp-state id="myState"></amp-state>
          <template type="amp-mustache"></template>
        </div>
      </body>
    </html>
  `;

  const scripts = await getScriptNodes(addRequiredExtensionsToHead(rawStr));

  t.is(scripts.length, expectedExtensions.length + expectedTemplates.length);

  scripts.forEach((script) => {
    t.truthy(script.attrs?.src);
    t.is(script.attrs?.async, '');
  });

  expectedExtensions.forEach((expectedScript) => {
    t.assert(containsExtension(scripts, expectedScript));
  });

  expectedTemplates.forEach((expectedScript) => {
    t.assert(containsTemplate(scripts, expectedScript));
  });
});

test('addRequiredExtensionsToHead adds extensions', async (t) => {
  const expected = ['amp-foo', 'amp-bar', 'amp-foo-bar-baz'];

  // eslint-disable-next-line local/html-template
  const rawStr = html`
    <html>
      <head></head>
      <body>
        <amp-foo foo="bar"></amp-foo>
        <amp-foo foo="bar"></amp-foo>
        <amp-foo foo="bar"></amp-foo>
        <div>
          <amp-bar></amp-bar>
          <div>
            <amp-foo-bar-baz many="1" attributes="2">
              Text content
            </amp-foo-bar-baz>
          </div>
        </div>
      </body>
    </html>
  `;

  const scripts = await getScriptNodes(addRequiredExtensionsToHead(rawStr));

  t.is(scripts.length, expected.length);

  scripts.forEach((script) => {
    t.truthy(script.attrs?.src);
    t.is(script.attrs?.async, '');
    t.falsy(script.attrs?.['custom-template']);
  });

  expected.forEach((expectedScript) => {
    t.assert(containsExtension(scripts, expectedScript));
  });
});

test('addRequiredExtensionsToHead adds template', async (t) => {
  const expected = 'amp-mustache';

  // eslint-disable-next-line local/html-template
  const rawStr = html`
    <html>
      <head></head>
      <body>
        <div>
          <template type="amp-mustache"></template>
          <template type="amp-mustache"></template>
          <template type="amp-mustache"></template>
        </div>
      </body>
    </html>
  `;

  const scripts = await getScriptNodes(addRequiredExtensionsToHead(rawStr));

  t.is(scripts.length, 1);

  const [script] = scripts;

  t.truthy(script.attrs?.src);
  t.is(script.attrs?.async, '');
  t.falsy(script.attrs?.['custom-element']);
  t.is(script.attrs?.['custom-template'], expected);
});

test('addRequiredExtensionsToHead adds <amp-form> per <form>', async (t) => {
  const expected = 'amp-form';

  // eslint-disable-next-line local/html-template
  const rawStr = html` <html>
    <head></head>
    <body>
      <form action="whatever.com"></form>
    </body>
  </html>`;

  const scripts = await getScriptNodes(addRequiredExtensionsToHead(rawStr));

  t.is(scripts.length, 1);

  const [script] = scripts;

  t.truthy(script.attrs?.src);
  t.is(script.attrs?.async, '');
  t.falsy(script.attrs?.['custom-template']);
  t.is(script.attrs?.['custom-element'], expected);
});

test('addRequiredExtensionsToHead adds <amp-form> per <input>', async (t) => {
  const expected = 'amp-form';

  // eslint-disable-next-line local/html-template
  const rawStr = html`
    <html>
      <head></head>
      <body>
        <input />
        <input />
        <input />
      </body>
    </html>
  `;

  const scripts = await getScriptNodes(addRequiredExtensionsToHead(rawStr));

  t.is(scripts.length, 1);

  const [script] = scripts;

  t.truthy(script.attrs?.src);
  t.is(script.attrs?.async, '');
  t.falsy(script.attrs?.['custom-template']);
  t.is(script.attrs?.['custom-element'], expected);
});

test('addRequiredExtensionsToHead adds <amp-form> per <select>', async (t) => {
  const expected = 'amp-form';

  // eslint-disable-next-line local/html-template
  const rawStr = html`
    <html>
      <head></head>
      <body>
        <select></select>
      </body>
    </html>
  `;

  const scripts = await getScriptNodes(addRequiredExtensionsToHead(rawStr));

  t.is(scripts.length, 1);

  const [script] = scripts;

  t.truthy(script.attrs?.src);
  t.is(script.attrs?.async, '');
  t.falsy(script.attrs?.['custom-template']);
  t.is(script.attrs?.['custom-element'], expected);
});
