/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  TemplateValidator,
  getAmpAdTemplateHelper,
} from '../template-validator';
import {AmpMustache} from '../../../amp-mustache/0.1/amp-mustache';
import {TemplateRenderer} from '../template-renderer';
import {ValidatorResult} from '../amp-ad-type-defs';
import {data} from './testdata/valid_css_at_rules_amp.reserialized';
import {utf8Encode} from '../../../../src/utils/bytes';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('TemplateRenderer', realWinConfig, env => {
  const templateUrl = 'https://adnetwork.com/amp-template.html';
  const headers = {
    get: name => {
      if (name == AMP_TEMPLATED_CREATIVE_HEADER_NAME) {
        return 'amp-mustache';
      }
    },
  };

  let containerElement;
  let context;
  let renderer;
  let validator;
  let validatorPromise;
  let sandbox;

  beforeEach(() => {
    renderer = new TemplateRenderer();
    validator = new TemplateValidator();

    containerElement = document.createElement('div');
    containerElement.setAttribute('height', 50);
    containerElement.setAttribute('width', 320);
    containerElement.signals = () => ({
      whenSignal: () => Promise.resolve(),
    });
    containerElement.renderStarted = () => {};
    containerElement.getPageLayoutBox = () => ({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    containerElement.getLayoutBox = () => ({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    containerElement.getIntersectionChangeEntry = () => ({});
    containerElement.isInViewport = () => true;
    containerElement.getAmpDoc = () => env.ampdoc;
    document.body.appendChild(containerElement);

    context = {
      win: env.win,
      adUrl: 'http://www.google.com',
      size: {width: '320', height: '50'},
      sentinel: 's-1234',
    };

    sandbox = sinon.sandbox;
    sandbox.stub(getAmpAdTemplateHelper(env.win), 'fetch').callsFake(url => {
      expect(url).to.equal(templateUrl);
      return Promise.resolve(data.adTemplate);
    });

    validatorPromise = validator.validate(
      context,
      utf8Encode(
        JSON.stringify({
          templateUrl,
          data: {url: 'https://buy.com/buy-1'},
          analytics: {foo: 'bar'},
        })
      ),
      headers
    );
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(containerElement);
  });

  it('should append iframe child with correct template values', () => {
    env.win.AMP.registerTemplate('amp-mustache', AmpMustache);
    return validatorPromise.then(validatorOutput => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          const iframe = containerElement.querySelector('iframe');
          expect(iframe).to.be.ok;
          expect(iframe.contentWindow.document.body.innerHTML.trim()).to.equal(
            '<div>\n      <p>ipsum lorem</p>\n      <a href=' +
              '"https://buy.com/buy-1" target="_top">Click for ad!</a>' +
              '\n    <amp-analytics class="i-amphtml-element i-amphtml' +
              '-notbuilt amp-notbuilt i-amphtml-layout-fixed i-amphtml' +
              '-layout-size-defined amp-unresolved i-amphtml-' +
              'unresolved" i-amphtml-layout="fixed" style="width: 1px;' +
              ' height: 1px;"></amp-analytics></div>'
          );
        });
    });
  });

  it('should set correct attributes on the iframe', () => {
    env.win.AMP.registerTemplate('amp-mustache', AmpMustache);
    return validatorPromise.then(validatorOutput => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          const iframe = containerElement.querySelector('iframe');
          expect(iframe).to.be.ok;
          expect(iframe.getAttribute('width')).to.equal('320');
          expect(iframe.getAttribute('height')).to.equal('50');
          expect(iframe.getAttribute('frameborder')).to.equal('0');
          expect(iframe.getAttribute('allowfullscreen')).to.equal('');
          expect(iframe.getAttribute('allowtransparency')).to.equal('');
          expect(iframe.getAttribute('scrolling')).to.equal('no');
        });
    });
  });

  it('should style body of iframe document to be visible', () => {
    env.win.AMP.registerTemplate('amp-mustache', AmpMustache);
    return validatorPromise.then(validatorOutput => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          const iframe = containerElement.querySelector('iframe');
          expect(iframe).to.be.ok;
          expect(iframe.contentWindow.document.body.style.visibility).to.equal(
            'visible'
          );
        });
    });
  });

  it('should insert analytics', () => {
    env.win.AMP.registerTemplate('amp-mustache', AmpMustache);
    const insertAnalyticsSpy = sandbox.spy(
      getAmpAdTemplateHelper(env.win),
      'insertAnalytics'
    );
    return validatorPromise.then(validatorOutput => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          expect(insertAnalyticsSpy).to.be.calledOnce;
        });
    });
  });
});
