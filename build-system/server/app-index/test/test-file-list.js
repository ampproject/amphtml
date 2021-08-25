const posthtml = require('posthtml');
const test = require('ava');
const {FileList} = require('../file-list');
const {getElementChildren} = require('./helpers');

test('creates [role=list]', async (t) => {
  const document = FileList({
    basepath: 'basepath',
    fileSet: [],
    htmlEnvelopePrefix: '/',
  });

  const elements = [];
  await posthtml([
    (tree) =>
      tree.match({attrs: {role: 'list'}}, (node) => {
        elements.push(node);
        return node;
      }),
  ]).process(document);

  const {length} = elements;
  t.is(length, 1);
});

test('creates placeholder inside [role=list] with rendered data', async (t) => {
  const fileSet = ['foo.bar', 'tacos.al.pastor'];

  const document = FileList({
    fileSet,
    basepath: 'basepath',
    htmlEnvelopePrefix: '/',
  });

  const items = [];
  await posthtml([
    (tree) => {
      tree.match({attrs: {class: /file-link-container/}}, (node) => {
        items.push(node);

        const children = getElementChildren(node.content);
        t.is(children.length, 1);

        const [a] = children;
        t.is(a.tag, 'a');
        t.truthy(a.attrs?.href);
      });

      return tree;
    },
  ]).process(document);

  t.is(items.length, fileSet.length);
});

async function getListitemAElements(document) {
  const elements = [];

  await posthtml([
    (tree) =>
      tree.match({attrs: {role: 'listitem'}}, (node) => {
        const [a] = getElementChildren(node.content);
        if (a && a.tag === 'a' && a.attrs?.href) {
          elements.push(a);
        }
        return node;
      }),
  ]).process(document);

  return elements;
}

test('binds /examples hrefs', async (t) => {
  const fileSet = ['asada.html', 'adobada.html', 'pastor.html'];
  const basepath = '/examples/';

  const document = FileList({
    fileSet,
    basepath,
    htmlEnvelopePrefix: '/',
  });

  const elements = await getListitemAElements(document);

  t.is(elements.length, fileSet.length);

  for (const [i, element] of elements.entries()) {
    t.truthy(element.attrs?.['[href]']);
    t.is(element.attrs?.href, basepath + fileSet[i]);
  }
});

test('does not bind non-/examples hrefs', async (t) => {
  const fileSet = ['asada.html', 'adobada.html', 'pastor.html'];
  const basepath = '/potato/';

  const document = FileList({
    fileSet,
    basepath,
    htmlEnvelopePrefix: '/',
  });

  const elements = await getListitemAElements(document);

  t.is(elements.length, fileSet.length);

  for (const [i, element] of elements.entries()) {
    t.falsy(element.attrs?.['[href]']);
    t.is(element.attrs?.href, basepath + fileSet[i]);
  }
});

test('binds/does not bind mixed', async (t) => {
  const bound = ['asada.html', 'adobada.html', 'pastor.html'];
  const notBound = ['chabbuddy.g', 'dj.beats', 'mc.grindah'];
  const basepath = '/examples/';

  const document = FileList({
    fileSet: [...bound, ...notBound],
    basepath,
    htmlEnvelopePrefix: '/',
  });

  const elements = await getListitemAElements(document);

  t.is(elements.length, bound.length + notBound.length);

  bound.forEach((expectedHref, i) => {
    const element = elements[i];
    t.truthy(element.attrs?.['[href]']);
    t.is(element.attrs?.href, basepath + expectedHref);
  });

  notBound.forEach((expectedHref, i) => {
    const element = elements[bound.length + i];
    t.falsy(element.attrs?.['[href]']);
    t.is(element.attrs?.href, basepath + expectedHref);
  });
});
