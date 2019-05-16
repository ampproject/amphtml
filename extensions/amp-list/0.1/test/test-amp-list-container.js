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
import {
  measureElementStub,
  measureMutateElementStub,
  mutateElementStub,
} from '../../../../testing/test-helper';

describes.realWin(
  'amp-list layout container',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-list'],
    },
  },
  env => {
    let win;
    let doc;
    let ampdoc;
    let sandbox;
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
      list = new AmpList(element);

      sandbox.stub(list, 'getAmpDoc').returns(ampdoc);
      sandbox.stub(list, 'getFallback').returns(null);

      sandbox.stub(list, 'mutateElement').callsFake(mutateElementStub);
      sandbox.stub(list, 'measureElement').callsFake(measureElementStub);
      sandbox
        .stub(list, 'measureMutateElement')
        .callsFake(measureMutateElementStub);
      element.setAttribute('src', '/list');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '50');
      element.setAttribute('height', '10');
      doc.body.appendChild(element);

      sandbox.stub(list, 'getOverflowElement').returns(null);
      sandbox.stub(list, 'fetchList_').returns(Promise.resolve());
      list.element.changeSize = () => {};
      list.buildCallback();
    });

    it('should change to layout container', async () => {
      await list.layoutCallback();
      await list.changeToLayoutContainer_();
      expect(element.style.height).to.equal('');
      expect(element.getAttribute('layout')).to.equal('container');
      expect(element.classList.contains('i-amphtml-layout-container')).to.be
        .true;
      const containerClasses = list.container_.classList;
      expect(containerClasses.contains('i-amphtml-fill-content')).to.be.false;
      expect(containerClasses.contains('i-amphtml-replaced-content')).to.be
        .false;
    });

    it('should trigger on bind', async () => {
      const changeSpy = sandbox.spy(list, 'changeToLayoutContainer_');
      await list.layoutCallback();
      await list.mutatedAttributesCallback({'is-layout-container': true});
      expect(changeSpy).to.be.calledOnce;
    });
  }
);
