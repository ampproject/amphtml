/**
 * Copyright 2015 The AMP HTML Authors.
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

import {createIframePromise} from '../../../../testing/iframe';
require('../amp-viafoura');

import {adopt} from '../../../../src/runtime';
adopt(window);

describe('amp-viafoura', () => {

  function getViafouraWidget(widget) {
    return createIframePromise().then(iframe => {
      const viafoura = iframe.doc.createElement('amp-viafoura');
      viafoura.setAttribute('data-widget', widget);
      viafoura.setAttribute('data-limit', 5);
      viafoura.setAttribute('width', 500);
      viafoura.setAttribute('height', 600);
      return iframe.addElement(viafoura);
    });
  }

  it('renders the Viafoura commenting widget', () => {
    return getViafouraWidget('comments').then(ampViafoura => {
      const iframe = ampViafoura.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('500');
      expect(iframe.getAttribute('height')).to.equal('600');
    });
  });

  it('should pass data-attributes to the iframe src', () => {
    return getViafouraWidget('comments').then(ampViafoura => {
      const iframe = ampViafoura.firstChild;
      expect(iframe.src).to.match(/data-widget=comments(&|&amp;)data-limit=5/);
    });
  });
});
