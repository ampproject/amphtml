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

import {AmpDocShadow} from '../../src/service/ampdoc-impl';
import {Observable} from '../../src/observable';
import {adopt, adoptShadowMode} from '../../src/runtime';
import {dev} from '../../src/log';
import {getServicePromise} from '../../src/service';
import {parseUrl} from '../../src/url';
import {platformFor} from '../../src/platform';
import * as dom from '../../src/dom';
import * as sinon from 'sinon';

describe('runtime', () => {

  let win;
  let sandbox;
  let errorStub;
  let ampdocService;
  let ampdocServiceMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ampdocService = {
      isSingleDoc: () => true,
      getAmpDoc: () => null,
    };
    ampdocServiceMock = sandbox.mock(ampdocService);
    win = {
      AMP: [],
      location: {},
      addEventListener: () => {},
      document: window.document,
      history: {},
      navigator: {},
      setTimeout: () => {},
      location: parseUrl('https://acme.com/document1'),
      Object,
      HTMLElement,
      services: {
        ampdoc: {obj: ampdocService},
      },
    };
    errorStub = sandbox.stub(dev, 'error');
  });

  afterEach(() => {
    ampdocServiceMock.verify();
    sandbox.restore();
  });

  it('should export properties to global AMP object', () => {
    expect(win.AMP.push).to.equal([].push);
    adopt(win);
    expect(win.AMP.BaseElement).to.be.a('function');
    expect(win.AMP.BaseTemplate).to.be.a('function');
    expect(win.AMP.registerElement).to.be.a('function');
    expect(win.AMP.registerTemplate).to.be.a('function');
    expect(win.AMP.setTickFunction).to.be.a('function');
    expect(win.AMP.win).to.equal(win);
    expect(win.AMP.viewer).to.be.a('object');
    expect(win.AMP.viewport).to.be.a('object');
    // Single-doc mode does not create `attachShadowRoot`.
    expect(win.AMP.attachShadowRoot).to.not.exist;
    expect(win.AMP_TAG).to.be.true;

    expect(win.AMP.push).to.not.equal([].push);
  });

  it('should NOT set cursor:pointer on document element on non-IOS', () => {
    const platform = platformFor(win);
    sandbox.stub(platform, 'isIos').returns(false);
    adopt(win);
    expect(win.document.documentElement.style.cursor).to.not.be.ok;
  });

  it('should set cursor:pointer on document element on IOS', () => {
    const platform = platformFor(win);
    sandbox.stub(platform, 'isIos').returns(true);
    adopt(win);
    expect(win.document.documentElement.style.cursor).to.equal('pointer');
  });

  it('should execute scheduled extensions & execute new extensions', () => {
    let progress = '';
    const queueExtensions = win.AMP;
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '2';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    });
    expect(queueExtensions).to.have.length(3);
    adopt(win);
    expect(queueExtensions).to.have.length(0);
    expect(progress).to.equal('123');
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '4';
    });
    expect(progress).to.equal('1234');
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '5';
    });
    expect(progress).to.equal('12345');
    expect(queueExtensions).to.have.length(0);

    // New format: {n:string, f:function()}.
    win.AMP.push({
      n: 'ext6',
      f: amp => {
        expect(amp).to.equal(win.AMP);
        progress += '6';
      },
    });
    expect(progress).to.equal('123456');
    expect(queueExtensions).to.have.length(0);
  });

  it('should wait for body before processing extensions', () => {
    const bodyCallbacks = new Observable();
    sandbox.stub(dom, 'waitForBody', (unusedDoc, callback) => {
      bodyCallbacks.add(callback);
    });

    let progress = '';
    const queueExtensions = win.AMP;
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '2';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    });
    expect(queueExtensions).to.have.length(3);
    adopt(win);

    // Extensions are still unprocessed
    expect(queueExtensions).to.have.length(3);
    expect(progress).to.equal('');

    // Add one more
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '4';
    });
    expect(queueExtensions).to.have.length(3);
    expect(progress).to.equal('');

    // Body is available now.
    bodyCallbacks.fire();
    expect(progress).to.equal('1234');
    expect(queueExtensions).to.have.length(0);
  });

  it('should be robust against errors in early extensions', () => {
    let progress = '';
    win.AMP.push(() => {
      progress += '1';
    });
    win.AMP.push(() => {
      throw new Error('extension error');
    });
    win.AMP.push(() => {
      progress += '3';
    });
    adopt(win);
    expect(progress).to.equal('13');

    expect(errorStub.callCount).to.equal(1);
    expect(errorStub.calledWith('runtime',
        sinon.match(() => true),
        sinon.match(arg => {
          return !!arg.message.match(/extension error/);
        }))).to.be.true;
  });

  describe('registerElement', () => {
    beforeEach(() => {
      adopt(win);
    });

    it('resolves any pending service promises for the element', () => {
      const promise = getServicePromise(win, 'amp-test-register');
      win.AMP.registerElement('amp-test-register', win.AMP.BaseElement);
      return promise;
    });
  });

  describe('attachShadowRoot', () => {
    beforeEach(() => {
      adoptShadowMode(win);
    });

    it('should register attachShadowRoot callback for a multi-doc', () => {
      expect(win.AMP.attachShadowRoot).to.be.a('function');
    });

    it('should register services and install stylesheet', () => {
      const shadowRoot = document.createElement('div');
      const ampdoc = new AmpDocShadow(win, shadowRoot);
      ampdocServiceMock.expects('getAmpDoc')
          .withExactArgs(shadowRoot)
          .returns(ampdoc)
          .atLeast(1);
      const ret = win.AMP.attachShadowRoot(shadowRoot);
      expect(ret).to.exist;

      // Stylesheet has been installed.
      expect(shadowRoot.querySelector('style[amp-runtime]')).to.exist;

      // Globla services have been installed.
      expect(win.AMP.BaseElement).to.be.a('function');
      expect(win.AMP.BaseTemplate).to.be.a('function');
      expect(win.AMP.registerElement).to.be.a('function');
      expect(win.AMP.isExperimentOn).to.be.a('function');
      expect(win.AMP.toggleExperiment).to.be.a('function');

      // Doc services have been installed.
      expect(ampdoc.services.action).to.exist;
      expect(ampdoc.services.action.obj).to.exist;

      // Single-doc bidings should not be installed.
      expect(win.AMP.viewer).to.not.exist;
      expect(win.AMP.viewport).to.not.exist;
      expect(ret.viewer).to.not.exist;
      expect(ret.viewport).to.not.exist;
    });
  });
});
