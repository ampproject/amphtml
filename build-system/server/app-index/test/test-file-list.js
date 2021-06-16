/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const posthtml = require('posthtml');
const test = require('ava');
const {extractMatching, getElementChildren} = require('./helpers');
const {FileList} = require('../file-list');

test('wraps', async (t) => {
  const document = FileList({
    basepath: 'basepath',
    fileSet: [],
    selectModePrefix: '/',
  });

  await posthtml([
    (tree) => {
      const elements = getElementChildren(tree);
      t.is(elements.length, 1);

      const [root] = elements;
      t.is(root.attrs.class, 'file-list-container');

      const [firstElementChild] = getElementChildren(root.content);
      t.is(firstElementChild.attrs.class, 'wrap');
    },
  ]).process(document);
});

test('creates amp-list', async (t) => {
  const document = FileList({
    basepath: 'basepath',
    fileSet: [],
    selectModePrefix: '/',
  });

  const elements = [];
  await posthtml([
    (tree) =>
      tree.match({tag: 'amp-list'}, (node) => {
        elements.push(node);
        return node;
      }),
  ]).process(document);

  const {length} = elements;
  t.is(length, 1);
});

test('creates placeholder inside amp-list with rendered data', async (t) => {
  const fileSet = ['foo.bar', 'tacos.al.pastor'];

  const document = FileList({
    fileSet,
    basepath: 'basepath',
    selectModePrefix: '/',
  });

  const extractedAmplist = await extractMatching(document, {
    tag: 'amp-list',
  });
  t.truthy(extractedAmplist);

  const extractedPlaceholder = await extractMatching(extractedAmplist, {
    attrs: {placeholder: ''},
  });
  t.truthy(extractedPlaceholder);

  let placeholders = [];
  const fileLinkContainers = [];
  await posthtml([
    (tree) => {
      placeholders = getElementChildren(tree);
      tree.match({attrs: {class: /file-link-container/}}, (node) => {
        const [a] = getElementChildren(node.content);
        if (a && a.tag === 'a' && !a.attrs?.['[href]']) {
          fileLinkContainers.push(node);
        }
      });

      return tree;
    },
  ]).process(extractedPlaceholder);

  const [placeholder] = placeholders;
  const [firstElementChild] = getElementChildren(placeholder.content || []);

  t.is(firstElementChild.attrs?.role, 'list');
  t.is(fileLinkContainers.length, fileSet.length);
});

async function getListitemAElements(document) {
  const extractedList = await extractMatching(document, {
    attrs: {role: 'list'},
  });

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
  ]).process(extractedList);

  return elements;
}

test('binds /examples hrefs', async (t) => {
  const fileSet = ['asada.html', 'adobada.html', 'pastor.html'];
  const basepath = '/examples/';

  const document = FileList({
    fileSet,
    basepath,
    selectModePrefix: '/',
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
    selectModePrefix: '/',
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
    selectModePrefix: '/',
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
