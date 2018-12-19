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

const body =
    '<amp-list id="list" width=300 height=100 ' +
        'src="http://localhost:9876/list/fruit-data/get?cors=0">' +
      '<template type="amp-mustache">' +
        '{{name}} : {{quantity}} @ ${{unitPrice}}' +
      '</template>' +
    '</amp-list>';

const extensions = ['amp-list', 'amp-mustache', 'amp-bind'];

describe('amp-list', function() {
  const TIMEOUT = Math.max(window.ampTestRuntimeConfig.mochaTimeout, 4000);
  this.timeout(TIMEOUT);

  describes.integration('(integration)', {
    body, extensions,
  }, env => {
    it('should render items', function*() {
      const list = env.win.document.getElementById('list');
      expect(list).to.exist;

      let children;
      yield poll('#list render', () => {
        children = list.querySelectorAll('div[role=list] > div');
        return children.length > 0;
      }, undefined, /* opt_timeout */ TIMEOUT);

      expect(children.length).to.equal(3);
      expect(children[0].textContent.trim()).to.equal('apple : 47 @ $0.33');
      expect(children[1].textContent.trim()).to.equal('pear : 538 @ $0.54');
      expect(children[2].textContent.trim()).to.equal('tomato : 0 @ $0.23');
    });
  });

  const body2 =
  '<button id="button" on="tap:list.changeToLayoutContainer()">+</button>' +
  '<amp-list id="list" width=300 height=100 ' +
      'src="http://localhost:9876/list/fruit-data/get?cors=0">' +
    '<template type="amp-mustache">' +
      '{{name}} : {{quantity}} @ ${{unitPrice}}' +
    '</template>' +
  '</amp-list>';

  describes.integration('with changeToLayoutContainer', {
    body: body2, extensions,
    experiments: ['amp-list-resizable-children']},
  env => {

    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('should change to layout container as action', function*() {
      expect(isExperimentOn(win, 'amp-list-resizable-children')).to.be.true;

      const button = doc.getElementById('button');
      const list = doc.getElementById('list');
      button.click();

      yield poll('changes to layout container', () => {
        const layout = list.getAttribute('layout');
        return layout == 'container';
      }, undefined, /* opt_timeout */ TIMEOUT);

      expect(list.classList.contains('i-amphtml-layout-container')).to.be.true;
    });
  });

  const body3 =
  '<amp-state id="state">' +
    '<script type="application/json">' +
      'false' +
    '</script>' +
  '</amp-state>' +
    '<button id="button" on="tap:AMP.setState({state: true})">+</button>' +
    '<amp-list id="list" width=300 height=100 ' +
      '[is-layout-container]="state" ' +
      'src="http://localhost:9876/list/fruit-data/get?cors=0">' +
      '<template type="amp-mustache">' +
        '{{name}} : {{quantity}} @ ${{unitPrice}}' +
      '</template>' +
    '</amp-list>';

  // TODO(cathyxz, #19647): Fix test on Chrome 71.
  describes.integration.skip('with bindable is-layout-container', {
    body: body3, extensions,
    experiments: ['amp-list-resizable-children']},
  env => {

    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it.configure().skipChromeDev().run(
        'should change to layout container as on bind', function*() {
          expect(isExperimentOn(win, 'amp-list-resizable-children')).to.be.true;

          const button = doc.getElementById('button');
          const list = doc.getElementById('list');
          button.click();

          yield poll('changes to layout container', () => {
            const layout = list.getAttribute('layout');
            return layout == 'container';
          }, undefined, /* opt_timeout */ TIMEOUT);

          expect(list.classList.contains('i-amphtml-layout-container'))
              .to.be.true;
        });
  });
});
