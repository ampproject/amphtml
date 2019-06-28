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
import {
  measureElementStub,
  measureMutateElementStub,
  mutateElementStub,
} from '../../../../testing/test-helper';

const HAS_MORE_ITEMS_PAYLOAD = {
  'items': ['1', '2'],
  'load-more-src': '/list/infinite-scroll?items=2&left=0',
};

describes.realWin(
  'amp-list component',
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

      toggleExperiment(win, 'amp-list-load-more', true);
    });

    describe('manual', () => {
      beforeEach(() => {
        expect(isExperimentOn(win, 'amp-list-load-more')).to.be.true;

        element = doc.createElement('amp-list');
        list = new AmpList(element);

        sandbox.stub(list, 'getAmpDoc').returns(ampdoc);
        sandbox.stub(list, 'getFallback').returns(null);

        sandbox.stub(list, 'mutateElement').callsFake(mutateElementStub);
        sandbox.stub(list, 'measureElement').callsFake(measureElementStub);
        sandbox
          .stub(list, 'measureMutateElement')
          .callsFake(measureMutateElementStub);

        element.setAttribute('src', '/list/infinite-scroll?items=2&left=1');
        element.setAttribute('load-more', 'manual');
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '50');
        element.setAttribute('height', '10');

        element.style.height = '10px';
        doc.body.appendChild(element);

        sandbox.stub(list, 'getOverflowElement').returns(null);
        sandbox.stub(list, 'fetchList_').returns(Promise.resolve());
        list.element.changeSize = () => {};
        list.buildCallback();
      });

      it('should create load-more elements after init', async () => {
        sandbox.stub(list, 'getPlaceholder').returns(null);
        await list.initializeLoadMoreElements_();

        expect(
          list.element.querySelectorAll('[load-more-button]')
        ).to.have.lengthOf(1);
        expect(
          list.element.querySelectorAll('[load-more-failed]')
        ).to.have.lengthOf(1);
        expect(list.element.querySelector('[load-more-end]')).to.be.null;
      });

      it('should hide load-more-button after init', async () => {
        sandbox.stub(list, 'getPlaceholder').returns(null);
        await list.initializeLoadMoreElements_();

        const button = list.element.querySelector('[load-more-button]');
        const buttonStyles = win.getComputedStyle(button);
        expect(buttonStyles).include({
          'display': 'block',
          'visibility': 'hidden',
        });
      });

      it('should hide load-more-failed element after init', async () => {
        sandbox.stub(list, 'getPlaceholder').returns(null);
        await list.initializeLoadMoreElements_();

        const failedElement = list.element.querySelector('[load-more-failed]');
        const failedStyles = win.getComputedStyle(failedElement);
        expect(failedStyles.display).to.equal('none');
      });

      it('should hide load-more-loading element after init', async () => {
        sandbox.stub(list, 'getPlaceholder').returns(null);
        await list.initializeLoadMoreElements_();

        const loader = list.element.querySelector('[load-more-loading]');
        const loaderStyles = win.getComputedStyle(loader);
        expect(loaderStyles.display).to.equal('none');
      });

      it('should resize the list to fit a placeholder', async () => {
        const attemptChangeHeightSpy = sandbox.spy(list, 'attemptChangeHeight');
        const placeholder = doc.createElement('div');
        placeholder.setAttribute('placeholder', '');
        placeholder.style.height = '50px';
        placeholder.style.width = '50px';
        list.element.appendChild(placeholder);
        sandbox.stub(list, 'getPlaceholder').returns(placeholder);
        await list.layoutCallback();
        expect(attemptChangeHeightSpy).to.be.calledOnceWith(50);
      });
    });

    describe('loading states', () => {
      beforeEach(() => {
        expect(isExperimentOn(win, 'amp-list-load-more')).to.be.true;

        element = doc.createElement('amp-list');
        list = new AmpList(element);

        sandbox.stub(list, 'getAmpDoc').returns(ampdoc);
        sandbox.stub(list, 'getFallback').returns(null);

        sandbox.stub(list, 'mutateElement').callsFake(mutateElementStub);
        sandbox.stub(list, 'measureElement').callsFake(measureElementStub);
        sandbox
          .stub(list, 'measureMutateElement')
          .callsFake(measureMutateElementStub);

        element.setAttribute('src', '/list/infinite-scroll?items=2&left=1');
        element.setAttribute('load-more', 'manual');
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '50');
        element.setAttribute('height', '10');
        element.style.height = '10px';
        doc.body.appendChild(element);

        sandbox.stub(list, 'getOverflowElement').returns(null);
        sandbox
          .stub(list, 'prepareAndSendFetch_')
          .returns(Promise.resolve(HAS_MORE_ITEMS_PAYLOAD));
        list.element.changeSize = () => {};
        list.buildCallback();
      });

      it('should update the next loading src', async () => {
        const fetchListSpy = sandbox.spy(list, 'fetchList_');
        sandbox.stub(list, 'scheduleRender_').returns(Promise.resolve());
        await list.layoutCallback();
        expect(element.getAttribute('src')).to.equal(
          '/list/infinite-scroll?items=2&left=1'
        );
        expect(fetchListSpy).to.be.calledOnce;
        await list.loadMoreCallback_();
        expect(element.getAttribute('src')).to.equal(
          '/list/infinite-scroll?items=2&left=0'
        );
        expect(fetchListSpy).to.be.calledTwice;
        expect(fetchListSpy).to.be.calledWith(true);
      });

      it('should append items to the existing list', async () => {
        const div1 = doc.createElement('div');
        div1.textContent = '1';

        const div2 = doc.createElement('div');
        div2.textContent = '2';
        sandbox
          .stub(list.ssrTemplateHelper_, 'renderTemplate')
          .returns(Promise.resolve([]));
        const updateBindingsStub = sandbox.stub(list, 'updateBindings_');
        sandbox
          .stub(list, 'maybeRenderLoadMoreTemplates_')
          .returns(Promise.resolve([]));
        updateBindingsStub.onCall(0).returns(Promise.resolve([div1, div2]));

        const div3 = doc.createElement('div');
        div3.textContent = '3';
        const div4 = doc.createElement('div');
        div4.textContent = '4';
        updateBindingsStub.onCall(1).returns(Promise.resolve([div3, div4]));

        const renderSpy = sandbox.spy(list, 'render_');
        await list.layoutCallback();
        expect(renderSpy).to.be.calledOnce;
        expect(renderSpy).to.be.calledWith([div1, div2], false);
        expect(list.container_.children).to.have.lengthOf(2);

        await list.loadMoreCallback_();
        expect(renderSpy).to.be.calledTwice;
        expect(renderSpy).to.be.calledWith([div3, div4], true);

        list.container_;
        expect(list.container_.children).to.have.lengthOf(4);
      });
    });
  }
);
