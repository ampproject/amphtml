/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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


import {getAncestorBlacklist} from '../ancestor-blacklist';

describes.realWin('getAncestorBlacklist', {
  amp: {
    runtimeOn: true,
    ampdoc: 'single',
    extensions: ['amp-ad'],
  },
}, env => {
  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  it('should disallow blacklisted element.', () => {
    const node = doc.createElement('amp-sidebar');
    doc.body.appendChild(node);

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(true);
  });

  it('should disallow child of blacklisted element.', () => {
    const parent = doc.createElement('amp-sidebar');
    doc.body.appendChild(parent);

    const node = doc.createElement('div');
    parent.appendChild(node);

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(true);
  });

  it('should allow parent of blacklisted element.', () => {
    const node = doc.createElement('div');
    doc.body.appendChild(node);

    const child = doc.createElement('amp-sidebar');
    node.appendChild(child);

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(false);
  });

  it('should allow sibling of blacklisted element.', () => {
    const node = doc.createElement('div');
    doc.body.appendChild(node);

    const sibling = doc.createElement('amp-sidebar');
    doc.body.appendChild(sibling);

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(false);
  });

  it('should work with parentless node.', () => {
    const node = doc.createElement('div');

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(false);
  });

  it('should work with text node.', () => {
    const node = doc.createTextNode('hello');

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(false);
  });

  it('should disallow amp-sidebar.', () => {
    const node = doc.createElement('amp-sidebar');
    doc.body.appendChild(node);

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(true);
  });

  it('should disallow amp-app-banner.', () => {
    const node = doc.createElement('amp-app-banner');
    doc.body.appendChild(node);

    const blacklist = getAncestorBlacklist(win);
    expect(blacklist.isOrDescendantOfBlacklistedElement(node)).to.equal(true);
  });
});
