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

import {createIframePromise} from '../../testing/iframe';
import {BaseElement} from '../../src/base-element';
import {installImg} from '../../builtins/amp-img';
import * as sinon from 'sinon';

describe('amp-img', () => {
  let sandbox, methodStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    methodStub.restore();
    methodStub = null;
    sandbox.restore();
    sandbox = null;
  });

  function getImg(attributes, children) {
    methodStub = sinon.stub(BaseElement.prototype, 'isInViewport')
        .returns(true);
    return createIframePromise().then(iframe => {
      installImg(iframe.win);
      const img = iframe.doc.createElement('amp-img');
      for (const key in attributes) {
        img.setAttribute(key, attributes[key]);
      }

      if (children != null) {
        for (const key in children) {
          img.appendChild(children[key]);
        }
      }
      return iframe.addElement(img);
    });
  }

  it('should load an img', () => {
    return getImg({
      src: 'test.jpg',
      width: 300,
      height: 200
    }).then(ampImg => {
      const img = ampImg.querySelector('img');
      expect(img).to.be.an.instanceof(Element);
      expect(img.tagName).to.equal('IMG');
      expect(img.getAttribute('src')).to.equal('test.jpg');
    });
  });
});
