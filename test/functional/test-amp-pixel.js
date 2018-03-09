/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {VariableSource} from '../../src/service/variable-source';
import {
  installUrlReplacementsForEmbed,
} from '../../src/service/url-replacements-impl';

describes.realWin('amp-pixel', {amp: true}, env => {
  let win;
  let whenFirstVisiblePromise, whenFirstVisibleResolver;
  let pixel;
  let implementation;

  beforeEach(() => {
    win = env.win;
    const viewer = win.services.viewer.obj;
    whenFirstVisiblePromise = new Promise(resolve => {
      whenFirstVisibleResolver = resolve;
    });
    sandbox.stub(viewer, 'whenFirstVisible').callsFake(
        () => whenFirstVisiblePromise);
    createPixel('https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
  });

  function createPixel(src, referrerPolicy) {
    pixel = win.document.createElement('amp-pixel');
    pixel.setAttribute('src', src);
    if (referrerPolicy) {
      pixel.setAttribute('referrerpolicy', referrerPolicy);
    }
    win.document.body.appendChild(pixel);
    const buildPromise = pixel.build();
    implementation = pixel.implementation_;
    return buildPromise;
  }

  /**
   * @param {string=} opt_src
   * @return {!Promise<?Image>}
   */
  function trigger(opt_src) {
    if (opt_src != null) {
      pixel.setAttribute('src', opt_src);
    }
    whenFirstVisibleResolver();
    return whenFirstVisiblePromise.then(() => {
      expect(implementation.triggerPromise_).to.be.not.null;
      return implementation.triggerPromise_;
    });
  }

  it('should be non-displayed', () => {
    expect(pixel.style.width).to.equal('0px');
    expect(pixel.style.height).to.equal('0px');
    expect(pixel.getAttribute('aria-hidden')).to.equal('true');
    expect(win.getComputedStyle(pixel).display).to.equal('none');
  });

  it('should NOT trigger when src is empty', () => {
    expect(pixel.children).to.have.length(0);
    expect(implementation.triggerPromise_).to.be.null;
    return trigger('').then(img => {
      expect(implementation.triggerPromise_).to.be.ok;
      expect(img).to.be.undefined;
    });
  });

  it('should trigger when doc becomes visible', () => {
    expect(pixel.children).to.have.length(0);
    expect(implementation.triggerPromise_).to.be.null;
    return trigger().then(img => {
      expect(implementation.triggerPromise_).to.be.ok;
      expect(img.src).to.equal(
          'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
    });
  });

  it('should allow protocol-relative URLs', () => {
    const url = '//pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=2';
    return trigger(url).then(img => {
      // Protocol is resolved to `http:` relative to test server.
      expect(img.src).to.equal(
          'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=2');
    });
  });

  it('should disallow http URLs', () => {
    const url = 'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=2';
    return expect(trigger(url)).to.eventually
        .rejectedWith(/src attribute must start with/);
  });

  it('should disallow relative URLs', () => {
    const url = '/activity;dc_iu=1/abc;ord=2';
    return expect(trigger(url)).to.eventually
        .rejectedWith(/src attribute must start with/);
  });

  it('should disallow fake-protocol URLs', () => {
    const url = 'https/activity;dc_iu=1/abc;ord=2';
    return expect(trigger(url)).to.eventually
        .rejectedWith(/src attribute must start with/);
  });

  it('should replace URL parameters', () => {
    sandbox.stub(Math, 'random').callsFake(() => 111);
    const url = 'https://pubads.g.doubleclick.net/activity;r=RANDOM';
    return trigger(url).then(img => {
      expect(img.src).to.equal(
          'https://pubads.g.doubleclick.net/activity;r=111');
    });
  });

  it('should throw for referrerpolicy with value other than ' +
      'no-referrer', () => {
    return createPixel(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?',
        'origin')
        .then(() => {
          throw new Error('must have failed.');
        }, reason => {
          expect(reason.message).to.match(/referrerpolicy/);
        });
  });
});


describes.realWin('amp-pixel in embed', {
  amp: {
    ampdoc: 'fie',
  },
}, env => {

  class TestVariableSource extends VariableSource {
    constructor() {
      super(env.ampdoc);
    }
    initialize() {
      this.set('TEST', () => 'value1');
    }
  }

  let win, parentWin;
  let whenFirstVisiblePromise, whenFirstVisibleResolver;
  let pixel;
  let implementation;

  beforeEach(() => {
    win = env.win;
    parentWin = env.parentWin;

    const viewer = parentWin.services.viewer.obj;
    whenFirstVisiblePromise = new Promise(resolve => {
      whenFirstVisibleResolver = resolve;
    });
    sandbox.stub(viewer, 'whenFirstVisible').callsFake(
        () => whenFirstVisiblePromise);

    installUrlReplacementsForEmbed(env.ampdoc, win, new TestVariableSource());

    pixel = win.document.createElement('amp-pixel');
    pixel.setAttribute('src',
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
    win.document.body.appendChild(pixel);
    pixel.build();
    implementation = pixel.implementation_;
  });

  /**
   * @param {string=} opt_src
   * @return {!Promise<?Image>}
   */
  function trigger(opt_src) {
    if (opt_src) {
      pixel.setAttribute('src', opt_src);
    }
    whenFirstVisibleResolver();
    return whenFirstVisiblePromise.then(() => {
      expect(implementation.triggerPromise_).to.be.not.null;
      return implementation.triggerPromise_;
    });
  }

  it('should use embed\'s URL replacer', () => {
    const url = 'https://pubads.g.doubleclick.net/activity;t=TEST';
    return trigger(url).then(img => {
      expect(img.src).to.equal(
          'https://pubads.g.doubleclick.net/activity;t=value1');
    });
  });
});
