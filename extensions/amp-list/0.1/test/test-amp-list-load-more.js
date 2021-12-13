import {toggleExperiment} from '#experiments';

import {Services} from '#service';
import {AmpDocService} from '#service/ampdoc-impl';

import {
  measureElementStub,
  measureMutateElementStub,
  mutateElementStub,
} from '#testing/helpers/service';

import {AmpList} from '../amp-list';

const HAS_MORE_ITEMS_PAYLOAD = {
  'items': ['1', '2'],
  'load-more-src': '/list/infinite-scroll?items=2&left=0',
};

describes.realWin(
  'amp-list with load-more',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-list'],
    },
  },
  (env) => {
    let win;
    let doc;
    let ampdoc;
    let element, list;
    let templates;
    let lockHeightSpy, unlockHeightSpy;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;

      templates = {
        findAndSetHtmlForTemplate: env.sandbox.stub(),
        findAndRenderTemplate: env.sandbox.stub(),
        findAndRenderTemplateArray: env.sandbox.stub(),
      };
      env.sandbox.stub(Services, 'templatesForDoc').returns(templates);
      env.sandbox.stub(AmpDocService.prototype, 'getAmpDoc').returns(ampdoc);
      element = doc.createElement('amp-list');
      list = new AmpList(element);
      lockHeightSpy = env.sandbox.spy(list, 'lockHeightAndMutate_');
      unlockHeightSpy = env.sandbox.spy(list, 'unlockHeightInsideMutate_');
    });

    afterEach(() => {
      expect(lockHeightSpy).not.called;
      expect(unlockHeightSpy).not.called;
    });

    it('should not init if layout="container"', async () => {
      toggleExperiment(win, 'amp-list-layout-container', true);
      const placeholder = doc.createElement('div');
      placeholder.style.height = '1337px';
      element.appendChild(placeholder);
      element.getPlaceholder = () => placeholder;

      element.setAttribute('load-more', 'manual');
      doc.body.appendChild(element);

      element.setAttribute('layout', 'container');

      list = new AmpList(element);
      list.isLayoutSupported('container');
      list.element.applySize = () => {};

      env.sandbox.stub(list, 'getOverflowElement').returns(null);
      env.sandbox.stub(list, 'fetchList_').returns(Promise.resolve());

      allowConsoleError(() => {
        expect(() => list.buildCallback()).to.throw(
          'amp-list initialized with layout=container does not support infinite scrolling with [load-more]. amp-list​​​'
        );
      });
      toggleExperiment(win, 'amp-list-layout-container', false);
    });

    describe('manual', () => {
      beforeEach(() => {
        env.sandbox.stub(list, 'getAmpDoc').returns(ampdoc);
        env.sandbox.stub(list, 'getFallback').returns(null);

        env.sandbox.stub(list, 'mutateElement').callsFake(mutateElementStub);
        env.sandbox.stub(list, 'measureElement').callsFake(measureElementStub);
        env.sandbox
          .stub(list, 'measureMutateElement')
          .callsFake(measureMutateElementStub);

        element.setAttribute('src', '/list/infinite-scroll?items=2&left=1');
        element.setAttribute('load-more', 'manual');
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '50');
        element.setAttribute('height', '10');

        element.style.height = '10px';
        doc.body.appendChild(element);

        env.sandbox.stub(list, 'getOverflowElement').returns(null);
        env.sandbox.stub(list, 'fetchList_').returns(Promise.resolve());
        list.element.applySize = () => {};
        list.buildCallback();
      });

      it('should create load-more elements after init', async () => {
        env.sandbox.stub(list, 'getPlaceholder').returns(null);
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
        env.sandbox.stub(list, 'getPlaceholder').returns(null);
        await list.initializeLoadMoreElements_();

        const button = list.element.querySelector('[load-more-button]');
        const buttonStyles = win.getComputedStyle(button);
        expect(buttonStyles).include({
          'display': 'block',
          'visibility': 'hidden',
        });
      });

      it('should hide load-more-failed element after init', async () => {
        env.sandbox.stub(list, 'getPlaceholder').returns(null);
        await list.initializeLoadMoreElements_();

        const failedElement = list.element.querySelector('[load-more-failed]');
        const failedStyles = win.getComputedStyle(failedElement);
        expect(failedStyles.display).to.equal('none');
      });

      it('should hide load-more-loading element after init', async () => {
        env.sandbox.stub(list, 'getPlaceholder').returns(null);
        await list.initializeLoadMoreElements_();

        const loader = list.element.querySelector('[load-more-loading]');
        const loaderStyles = win.getComputedStyle(loader);
        expect(loaderStyles.display).to.equal('none');
      });

      it('should resize the list to fit a placeholder', async () => {
        const attemptChangeHeightSpy = env.sandbox.spy(
          list,
          'attemptChangeHeight'
        );
        const placeholder = doc.createElement('div');
        placeholder.setAttribute('placeholder', '');
        placeholder.style.height = '50px';
        placeholder.style.width = '50px';
        list.element.appendChild(placeholder);
        env.sandbox.stub(list, 'getPlaceholder').returns(placeholder);
        await list.layoutCallback();
        expect(attemptChangeHeightSpy).to.be.calledOnceWith(50);
      });
    });

    describe('loading states', () => {
      beforeEach(() => {
        env.sandbox.stub(list, 'getAmpDoc').returns(ampdoc);
        env.sandbox.stub(list, 'getFallback').returns(null);

        env.sandbox.stub(list, 'mutateElement').callsFake(mutateElementStub);
        env.sandbox.stub(list, 'measureElement').callsFake(measureElementStub);
        env.sandbox
          .stub(list, 'measureMutateElement')
          .callsFake(measureMutateElementStub);

        element.setAttribute('src', '/list/infinite-scroll?items=2&left=1');
        element.setAttribute('load-more', 'manual');
        element.setAttribute('layout', 'fixed');
        element.setAttribute('width', '50');
        element.setAttribute('height', '10');
        element.style.height = '10px';
        doc.body.appendChild(element);

        env.sandbox.stub(list, 'getOverflowElement').returns(null);
        env.sandbox
          .stub(list, 'prepareAndSendFetch_')
          .returns(Promise.resolve(HAS_MORE_ITEMS_PAYLOAD));
        list.element.applySize = () => {};
        list.buildCallback();
      });

      it('should update the next loading src', async () => {
        env.sandbox.stub(list, 'scheduleRender_').returns(Promise.resolve());
        await list.layoutCallback();
        expect(element.getAttribute('src')).to.equal(
          '/list/infinite-scroll?items=2&left=1'
        );
        await list.loadMoreCallback_();
        expect(element.getAttribute('src')).to.equal(
          '/list/infinite-scroll?items=2&left=0'
        );
      });

      it('should append items to the existing list', async () => {
        const div1 = doc.createElement('div');
        div1.textContent = '1';

        const div2 = doc.createElement('div');
        div2.textContent = '2';
        env.sandbox
          .stub(list.ssrTemplateHelper_, 'applySsrOrCsrTemplate')
          .returns(Promise.resolve([]));
        const updateBindingsStub = env.sandbox.stub(list, 'updateBindings_');
        env.sandbox
          .stub(list, 'maybeRenderLoadMoreTemplates_')
          .returns(Promise.resolve([]));
        updateBindingsStub.onCall(0).returns(Promise.resolve([div1, div2]));

        const div3 = doc.createElement('div');
        div3.textContent = '3';
        const div4 = doc.createElement('div');
        div4.textContent = '4';
        updateBindingsStub.onCall(1).returns(Promise.resolve([div3, div4]));

        const renderSpy = env.sandbox.spy(list, 'render_');
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

      // TODO(cathyxz) Create a mirror test for automatic amp-list loading once the automatic tests are unskipped
      it('should call focus on the last focusable element after load more is clicked', async () => {
        env.sandbox
          .stub(list.ssrTemplateHelper_, 'applySsrOrCsrTemplate')
          .returns(Promise.resolve([]));
        const updateBindingsStub = env.sandbox.stub(list, 'updateBindings_');
        env.sandbox
          .stub(list, 'maybeRenderLoadMoreTemplates_')
          .returns(Promise.resolve([]));

        const el1 = doc.createElement('div');
        el1.textContent = '1';
        const el2 = doc.createElement('a');
        el2.setAttribute('href', 'https://google.com/');
        el2.textContent = '2';
        updateBindingsStub.onCall(0).returns(Promise.resolve([el1, el2]));
        const focusSpy = env.sandbox.spy(el2, 'focus');

        await list.layoutCallback();

        const el3 = doc.createElement('div');
        el3.textContent = '3';
        const el4 = doc.createElement('div');
        el4.textContent = '4';
        updateBindingsStub.onCall(1).returns(Promise.resolve([el3, el4]));

        await list.loadMoreCallback_(
          /* opt_reload */ false,
          /* opt_fromClick */ true
        );

        await expect(focusSpy).to.have.been.called;
      });
    });
  }
);
