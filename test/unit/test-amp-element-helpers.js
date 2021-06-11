/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {BaseElement} from '../../src/base-element';
import {createAmpElementForTesting} from '../../src/custom-element';
import {whenUpgradedToCustomElement} from '../../src/amp-element-helpers';

describes.realWin(
  'AMPElement helpers',
  {
    amp: {
      /* amp spec */
      ampdoc: 'single',
    },
  },
  (env) => {
    let doc;
    class TestElement extends BaseElement {}
    describe('whenUpgradeToCustomElement function', () => {
      beforeEach(() => {
        doc = env.win.document;
      });

      it('should not continue if element is not AMP element', () => {
        const element = doc.createElement('div');
        allowConsoleError(() => {
          expect(() => whenUpgradedToCustomElement(element)).to.throw(
            'element is not AmpElement'
          );
        });
      });

      it('should resolve if element has already upgrade', () => {
        const element = doc.createElement('amp-img');
        element.setAttribute('layout', 'nodisplay');
        doc.body.appendChild(element);
        return whenUpgradedToCustomElement(element).then((element) => {
          expect(element.whenBuilt).to.exist;
        });
      });

      it('should resolve when element upgrade', () => {
        const element = doc.createElement('amp-test');
        element.setAttribute('layout', 'nodisplay');
        doc.body.appendChild(element);
        env.win.setTimeout(() => {
          env.win.customElements.define(
            'amp-test',
            createAmpElementForTesting(env.win, TestElement)
          );
        }, 100);
        return whenUpgradedToCustomElement(element).then((element) => {
          expect(element.whenBuilt).to.exist;
        });
      });
    });
  }
);
