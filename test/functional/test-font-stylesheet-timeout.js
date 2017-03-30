/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {
  fontStylesheetTimeout,
} from '../../src/font-stylesheet-timeout';


describes.realWin('font-stylesheet-timeout', {
  amp: true,
}, env => {
  let clock;
  let win;
  let readyState;
  let responseStart;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    win = env.win;
    win.setTimeout = self.setTimeout;
    readyState = 'interactive';
    responseStart = 0;
    Object.defineProperty(win.document, 'readyState', {
      get: function() {
        return readyState;
      },
    });
    Object.defineProperty(win.performance.timing, 'responseStart', {
      get: function() {
        return responseStart;
      },
    });
  });

  function addLink(opt_content) {
    const link = document.createElement('link');
    link.href = 'data:text/css;charset=utf-8,' + (opt_content || '');
    link.setAttribute('rel', 'stylesHEet');
    win.document.head.appendChild(link);
    return link;
  }

  it('should not time out for ready doc', () => {
    const link = addLink();
    fontStylesheetTimeout(win);
    clock.tick(10000);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"]')).to.have.length(1);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]')).to.equal(link);
  });

  it('should not time out for complete doc', () => {
    readyState = 'complete';
    const link = addLink();
    fontStylesheetTimeout(win);
    clock.tick(10000);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"]')).to.have.length(1);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]')).to.equal(link);
  });

  it('should time out if doc is not interactive', done => {
    readyState = 'loading';
    const link = addLink();
    fontStylesheetTimeout(win);
    clock.tick(999);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(0);
    clock.tick(1);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(1);
    const after = win.document.querySelector(
        'link[rel="stylesheet"]');
    expect(after).to.not.equal(link);
    expect(after.href).to.equal(link.href);
    expect(after.media).to.equal('not-matching');
    after.addEventListener('load', () => {
      expect(after.media).to.equal('all');
      done();
    });
  });

  it('should time out from response start', () => {
    responseStart = 500;
    clock.tick(1000);
    readyState = 'loading';
    const link = addLink();
    fontStylesheetTimeout(win);
    clock.tick(499);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(0);
    clock.tick(1);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(1);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]')).to.not.equal(link);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]').href).to.equal(link.href);
  });

  it('should time out multiple style sheets', () => {
    responseStart = 500;
    clock.tick(10000);
    readyState = 'loading';
    const link0 = addLink(1);
    const link1 = addLink(2);
    fontStylesheetTimeout(win);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(0);
    clock.tick(1);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(2);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]')).to.not.equal(link0);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"]')[0].href).to.equal(link0.href);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"]')[1].href).to.equal(link1.href);
  });
});
