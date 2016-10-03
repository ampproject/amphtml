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

import {AmpDocShadow} from '../../src/service/ampdoc-impl';
import {
  Extensions,
  addDocFactoryToExtension,
  addElementToExtension,
  addShadowRootFactoryToExtension,
  calculateExtensionScriptUrl,
  installExtensionsInShadowDoc,
  installExtensionsService,
  registerExtension,
} from '../../src/service/extensions-impl';
import {adopt} from '../../src/runtime';
import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../testing/iframe';
import {
  initLogConstructor,
  resetLogConstructorForTesting,
} from '../../src/log';
import {loadPromise} from '../../src/event-helper';
import * as cust from '../../src/custom-element';
import * as sinon from 'sinon';

import {describeFakeWindow} from '../../testing/describe';


describeFakeWindow('Extensions', function(test) {

  let sandbox;

  beforeEach(() => {
    sandbox = test.sandbox;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('registerExtension', () => {
    let windowApi;
    let extensions;

    beforeEach(() => {
      windowApi = test.win;
      extensions = new Extensions(windowApi);
    });

    it('should register successfully without promise', () => {
      expect(windowApi.document.defaultView).to.equal(windowApi);
      const amp = {};
      let factoryExecuted = false;
      let currentHolder;
      registerExtension(extensions, 'amp-ext', arg => {
        expect(factoryExecuted).to.be.false;
        expect(arg).to.equal(amp);
        expect(extensions.currentExtensionId_).to.equal('amp-ext');
        currentHolder = extensions.getCurrentExtensionHolder_();
        factoryExecuted = true;
      }, amp);
      expect(factoryExecuted).to.be.true;
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(extensions.getExtensionHolder_('amp-ext')).to.equal(holder);
      expect(currentHolder).to.equal(holder);
      expect(holder.loaded).to.be.true;
      expect(holder.error).to.be.undefined;
      expect(holder.resolve).to.be.undefined;
      expect(holder.reject).to.be.undefined;
      expect(holder.promise).to.be.undefined;
      expect(holder.scriptPresent).to.be.undefined;

      // However, the promise is created lazily.
      return extensions.waitForExtension('amp-ext').then(extension => {
        expect(extension).to.exist;
        expect(extension.elements).to.exist;
      });
    });

    it('should register successfully with promise', () => {
      const promise = extensions.waitForExtension('amp-ext');
      registerExtension(extensions, 'amp-ext', () => {}, {});
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(holder.loaded).to.be.true;
      expect(holder.error).to.be.undefined;
      expect(holder.resolve).to.exist;
      expect(holder.reject).to.exist;
      expect(holder.promise).to.exist;
      expect(promise).to.equal(holder.promise);

      return promise.then(extension => {
        expect(extension).to.exist;
        expect(extension.elements).to.exist;
      });
    });
  });
});
