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
import {toggleExperiment} from '../../src/experiments';

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
      get() {
        return readyState;
      },
    });
    Object.defineProperty(win.performance.timing, 'responseStart', {
      get() {
        return responseStart;
      },
    });
  });

  function addLink(opt_content, opt_href) {
    const link = document.createElement('link');
    link.href = opt_href || immediatelyLoadingHref(opt_content);
    link.setAttribute('rel', 'stylesHEet');
    win.document.head.appendChild(link);
    return link;
  }

  function immediatelyLoadingHref(opt_content) {
    return 'data:text/css;charset=utf-8,' + (opt_content || '');
  }

  // TODO(cramforce, #11827): Make this test work on Safari.
  it.configure().skipSafari().run('should not time out for immediately ' +
      'loading style sheets', () => {
    const link = addLink();
    fontStylesheetTimeout(win);
    clock.tick(10000);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"]')).to.have.length(1);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]')).to.equal(link);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(0);
  });

  it('should time out if style sheets do not load', () => {
    const link = addLink(undefined, '/does-not-exist.css');
    fontStylesheetTimeout(win);
    clock.tick(249);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(0);
    clock.tick(1);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(1);
    const after = win.document.querySelector(
        'link[rel="stylesheet"]');
    expect(after).to.equal(link);
    expect(after.href).to.equal(link.href);
    expect(after.media).to.equal('not-matching');
    after.href = immediatelyLoadingHref('/* make-it-load */');
    return new Promise(resolve => {
      after.addEventListener('load', () => {
        resolve();
      });
    }).then(() => {
      expect(after.media).to.equal('all');
    });
  });

  it('should time out from response start', () => {
    responseStart = 200;
    clock.tick(250);
    const link = addLink(undefined, '/does-not-exist.css');
    fontStylesheetTimeout(win);
    clock.tick(199);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(0);
    clock.tick(1);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(1);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]')).to.equal(link);
    expect(win.document.querySelector(
        'link[rel="stylesheet"]').href).to.equal(link.href);
  });

  it('should time out multiple style sheets and ignore CDN URLs', () => {
    responseStart = 500;
    clock.tick(10000);
    const link0 = addLink(undefined, '/does-not-exist.css');
    const link1 = addLink(undefined, '/does-not-exist.css');
    const cdnLink = addLink(undefined,
        'https://cdn.ampproject.org/does-not-exist.css');
    fontStylesheetTimeout(win);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(0);
    clock.tick(1);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')).to.have.length(2);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')[0]).to.equal(link0);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"][i-amphtml-timeout]')[1]).to.equal(link1);
    expect(win.document.querySelectorAll(
        'link[rel="stylesheet"]')[2]).to.equal(cdnLink);
  });

  describe('font-display: swap', () => {
    let fonts;
    beforeEach(() => {
      fonts = [
        {
          status: 'loaded',
          display: 'auto',
        },
        {
          status: 'loading',
          display: 'auto',
        },
        {
          status: 'loading',
          display: 'auto',
        },
        {
          status: 'loading',
          display: 'optional',
        },
        null,
      ];
      let index = 0;
      Object.defineProperty(win.document, 'fonts', {
        get: () => {
          return {
            values: () => {
              return {next: () => {
                return {value: fonts[index++]};
              }};
            },
          };
        },
      });
      toggleExperiment(win, 'font-display-swap', true);
    });

    it('should not do anything with experiment off', () => {
      toggleExperiment(win, 'font-display-swap', false);
      fontStylesheetTimeout(win);
      expect(fonts[1].display).to.equal('auto');
    });

    it('should not change loaded fonts', () => {
      fontStylesheetTimeout(win);
      expect(fonts[0].display).to.equal('auto');
    });

    it('should change loading fonts to swap', () => {
      fontStylesheetTimeout(win);
      expect(fonts[1].display).to.equal('swap');
      expect(fonts[2].display).to.equal('swap');
    });

    it('should not override non-default values', () => {
      fontStylesheetTimeout(win);
      expect(fonts[3].display).to.equal('optional');
    });
  });
});
