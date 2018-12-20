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

import {isExperimentOn} from '../../../../../src/experiments';
import {poll} from '../../../../../testing/iframe';

const TIMEOUT = 12500;
const extensions = ['amp-list', 'amp-mustache', 'amp-bind'];

describe('amp-list (integration)', function() {
  this.timeout(TIMEOUT);

  const basicBody =
    `<amp-list width=300 height=100 src="http://localhost:9876/list/fruit-data/get?cors=0">
      <template type="amp-mustache">
        {{name}} : {{quantity}} @ {{unitPrice}}
      </template>
    '</amp-list>`;

  const basicTests = env => {
    it('should render items', function*() {
      const list = env.win.document.querySelector('amp-list');
      expect(list).to.exist;

      let children;
      yield poll('#list render', () => {
        children = list.querySelectorAll('div[role=list] > div');
        return children.length > 0;
      }, /* onError */ undefined, TIMEOUT);

      expect(children.length).to.equal(3);
      expect(children[0].textContent.trim()).to.equal('apple : 47 @ 0.33');
      expect(children[1].textContent.trim()).to.equal('pear : 538 @ 0.54');
      expect(children[2].textContent.trim()).to.equal('tomato : 0 @ 0.23');
    });
  };

  describes.integration('basic (mustache-0.1)', {
    body: basicBody,
    extensions: ['amp-list', 'amp-mustache:0.1', 'amp-bind'],
  }, basicTests);

  describes.integration('basic (mustache-0.2)', {
    body: basicBody,
    extensions: ['amp-list', 'amp-mustache:0.2', 'amp-bind'],
  }, basicTests);

  describes.integration('"changeToLayoutContainer" action', {
    body: `
      <button on="tap:list.changeToLayoutContainer()">+</button>
      <amp-list width=300 height=100 src="http://localhost:9876/list/fruit-data/get?cors=0">
        <template type="amp-mustache">
          {{name}} : {{quantity}} @ {{unitPrice}}
        </template>
      </amp-list>`,
    extensions,
    experiments: ['amp-list-resizable-children'],
  }, env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('should change to layout container as action', function*() {
      expect(isExperimentOn(win, 'amp-list-resizable-children')).to.be.true;

      const button = doc.querySelector('button');
      const list = doc.querySelector('amp-list');
      button.click();

      yield poll('changes to layout container', () => {
        const layout = list.getAttribute('layout');
        return layout === 'container';
      }, undefined, /* opt_timeout */ TIMEOUT);

      expect(list.classList.contains('i-amphtml-layout-container')).to.be.true;
    });
  });

  // TODO(cathyxz, #19647): Fix test on Chrome 71. Might be because
  // amp-bind isn't ready by the time the button is clicked.
  describes.integration.skip('[is-layout-container]', {
    body: `
    <amp-state id="state">
      <script type="application/json">
        false
      </script>
    </amp-state>
    <button on="tap:AMP.setState({state: true})">+</button>
    <amp-list width=300 height=100 [is-layout-container]="state" src="http://localhost:9876/list/fruit-data/get?cors=0">
      <template type="amp-mustache">
        {{name}} : {{quantity}} @ {{unitPrice}}
      </template>
    </amp-list>`,
    extensions,
    experiments: ['amp-list-resizable-children'],
  }, env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('should change to layout container as on bind', function*() {
      expect(isExperimentOn(win, 'amp-list-resizable-children')).to.be.true;

      const button = doc.querySelector('button');
      const list = doc.querySelector('amp-list');
      button.click();

      yield poll('changes to layout container', () => {
        const layout = list.getAttribute('layout');
        return layout == 'container';
      }, undefined, /* opt_timeout */ TIMEOUT);

      expect(list.classList.contains('i-amphtml-layout-container')).to.be.true;
    });
  });
});
