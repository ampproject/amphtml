/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {AmpDocService} from '../../../../src/service/ampdoc-impl';
import {AmpList} from '../amp-list';
import {Services} from '../../../../src/services';
import {isExperimentOn, toggleExperiment} from '../../../../src/experiments';


describes.realWin('amp-list component', {
  amp: {
    ampdoc: 'single',
    extensions: ['amp-list'],
  },
}, env => {
  let win, doc, ampdoc, sandbox;
  let element, list;
  let templates;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    sandbox = env.sandbox;

    templates = {
      findAndSetHtmlForTemplate: sandbox.stub(),
      findAndRenderTemplate: sandbox.stub(),
      findAndRenderTemplateArray: sandbox.stub(),
    };
    sandbox.stub(Services, 'templatesFor').returns(templates);
    sandbox.stub(AmpDocService.prototype, 'getAmpDoc').returns(ampdoc);

    element = doc.createElement('amp-list');
    element.setAttribute('src', '/list/infinite-scroll?items=2&left=1');
    element.setAttribute('load-more', 'manual');

    list = new AmpList(element);

    sandbox.stub(list, 'getAmpDoc').returns(ampdoc);
    sandbox.stub(list, 'getFallback').returns(null);

    sandbox.stub(list, 'mutateElement').callsFake(mutator => {
      mutator();
      return Promise.resolve();
    });

    sandbox.stub(list, 'measureElement').callsFake(measurer => {
      measurer();
      return Promise.resolve();
    });

    sandbox.stub(list, 'measureMutateElement').callsFake(
        (measurer, mutator) => {
          measurer();
          mutator();
          return Promise.resolve();
        });

    toggleExperiment(win, 'amp-list-load-more', true);
    expect(isExperimentOn(win, 'amp-list-load-more')).to.be.true;

    element.style.height = '10px';
    doc.body.appendChild(element);
  });

  afterEach(() => {

  });

  describe('manual', () => {

    beforeEach(() => {
      expect(isExperimentOn(win, 'amp-list-load-more')).to.be.true;
      sandbox.stub(list, 'getPlaceholder').returns(null);
      sandbox.stub(list, 'getOverflowElement').returns(null);
      sandbox.stub(list, 'fetchList_').returns(Promise.resolve());
      list.element.changeSize = () => {};
      list.buildCallback();
    });

    it('should create load-more elements after layout callback', async() => {
      await list.layoutCallback();
      expect(list.element.querySelector('[load-more-button]')).to.be.ok;
      expect(list.element.querySelector('[load-more-failed]')).to.be.ok;
      expect(list.element.querySelector('[load-more-end]')).to.be.null;
    });

    it('should hide load-more elements at layout', async() => {
      await list.layoutCallback();
      const button = list.element.querySelector('[load-more-button]');
      const buttonStyles = win.getComputedStyle(button);
      expect(buttonStyles.display).to.equal('block');
      expect(buttonStyles.visibility).to.equal('hidden');
      const failedElement = list.element.querySelector('[load-more-failed]');
      const failedStyles = win.getComputedStyle(failedElement);
      expect(failedStyles.display).to.equal('none');
    });

  });

});
