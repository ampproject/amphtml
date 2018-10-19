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

import {AmpEvents} from '../../../../src/amp-events';
import {AmpList} from '../amp-list';
import {Deferred} from '../../../../src/utils/promise';
import {Services} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-list component', {
  amp: {
    ampdoc: 'single',
    extensions: ['amp-list'],
  },
}, env => {
  let win, doc, ampdoc, sandbox;
  let element, list, listMock;
  let resource;
  let setBindService;
  let ssrTemplateHelper;
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

    resource = {
      resetPendingChangeSize: sandbox.stub(),
    };
    const resources = {
      getResourceForElement: e => (e === element) ? resource : null,
    };

    element = doc.createElement('div');
    element.setAttribute('src', 'https://data.com/list.json');
    element.getAmpDoc = () => ampdoc;
    element.getFallback = () => null;
    element.getPlaceholder = () => null;
    element.getResources = () => resources;

    const template = doc.createElement('template');
    template.content.appendChild(doc.createTextNode('{{template}}'));
    element.appendChild(template);

    const {promise, resolve} = new Deferred();
    sandbox.stub(Services, 'bindForDocOrNull').returns(promise);
    setBindService = resolve;

    ssrTemplateHelper = {
      isSupported: () => false,
      fetchAndRenderTemplate: () => Promise.resolve(),
      verifySsrResponse: () => Promise.resolve(),
    };

    list = new AmpList(element);
    list.buildCallback();
    list.ssrTemplateHelper_ = ssrTemplateHelper;
    listMock = sandbox.mock(list);

    element.style.height = '10px';
    doc.body.appendChild(element);
  });

  afterEach(() => {
    // There should only be one mock to verify.
    listMock.verify();
  });

  const DEFAULT_LIST_OPTS = {
    expr: 'items',
    maxItems: 0,
    singleItem: false,
    refresh: false,
    resetOnRefresh: false,
  };

  const DEFAULT_ITEMS = [{title: 'Title1'}];
  const DEFAULT_FETCHED_DATA = {
    items: DEFAULT_ITEMS,
  };

  /**
   * @param {!Array|!Object} fetched
   * @param {!Array<!Element>} rendered
   * @param {Object=} opts
   * @return {!Promise}
   */
  function expectFetchAndRender(fetched, rendered, opts = DEFAULT_LIST_OPTS) {
    // Mock the actual network request.
    listMock.expects('fetch_')
        .withExactArgs(!!opts.refresh)
        .returns(Promise.resolve(fetched))
        .atLeast(1);

    // If "reset-on-refresh" is set, show loading/placeholder before fetch.
    if (opts.resetOnRefresh) {
      listMock.expects('togglePlaceholder').withExactArgs(true).once();
      listMock.expects('toggleLoading').withExactArgs(true, true).once();
    }

    // Stub the rendering of the template.
    let itemsToRender = fetched[opts.expr];
    if (opts.singleItem) {
      expect(itemsToRender).to.be.a('object');
      itemsToRender = [fetched[opts.expr]];
    } else if (opts.maxItems > 0) {
      itemsToRender = fetched[opts.expr].slice(0, opts.maxItems);
    }
    templates.findAndRenderTemplateArray
        .withArgs(element, itemsToRender)
        .returns(Promise.resolve(rendered));

    expectRender();
  }

  function expectRender() {
    // Call mutate/measure during render.
    listMock.expects('mutateElement').callsFake(m => m()).atLeast(1);
    listMock.expects('measureElement').callsFake(m => m()).atLeast(1);

    // Hide loading/placeholder during render.
    listMock.expects('toggleLoading').withExactArgs(false).atLeast(1);
    listMock.expects('togglePlaceholder').withExactArgs(false).atLeast(1);
  }

  describe('without amp-bind', () => {
    beforeEach(() => {
      setBindService(null);
    });

    it('should fetch and render', () => {
      const itemElem = doc.createElement('div');
      const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElem]);
      return list.layoutCallback().then(() => rendered).then(() => {
        expect(list.container_.contains(itemElem)).to.be.true;
      });
    });

    it('should reset pending change-size request after render', function*() {
      const itemElement = doc.createElement('div');
      const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA,
          [itemElement]);
      yield list.layoutCallback();
      yield rendered;
      expect(resource.resetPendingChangeSize).calledOnce;
    });

    it('should attemptChangeHeight the placeholder, if present', () => {
      const itemElement = doc.createElement('div');
      const placeholder = doc.createElement('div');
      placeholder.style.height = '1337px';
      element.appendChild(placeholder);
      element.getPlaceholder = () => placeholder;

      expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

      listMock.expects('attemptChangeHeight')
          .withExactArgs(1337)
          .returns(Promise.resolve());

      return list.layoutCallback();
    });

    it('should attemptChangeHeight rendered contents', () => {
      const itemElement = doc.createElement('div');
      itemElement.style.height = '1337px';

      expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

      listMock.expects('attemptChangeHeight')
          .withExactArgs(1337)
          .returns(Promise.resolve());

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(itemElement)).to.be.true;
      });
    });

    it('should fetch and render non-array if single-item is set', () => {
      const fetched = {'items': {title: 'Title1'}};
      const itemElement = doc.createElement('div');
      element.setAttribute('single-item', 'true');

      const rendered = expectFetchAndRender(
          fetched, [itemElement], {expr: 'items', singleItem: true});

      return list.layoutCallback().then(() => rendered).then(() => {
        expect(list.container_.contains(itemElement)).to.be.true;
      });
    });

    it('should trim the results to max-items', () => {
      const fetched = {items: [
        {title: 'Title1'},
        {title: 'Title2'},
        {title: 'Title3'},
      ]};
      const itemElement = doc.createElement('div');
      element.setAttribute('max-items', '2');

      expectFetchAndRender(
          fetched, [itemElement], {expr: 'items', maxItems: 2});

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(itemElement)).to.be.true;
      });
    });

    it('should dispatch DOM_UPDATE event after render', () => {
      const spy = sandbox.spy(list.container_, 'dispatchEvent');

      const itemElement = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

      return list.layoutCallback().then(() => {
        expect(spy).to.have.been.calledOnce;
        expect(spy).calledWithMatch({
          type: AmpEvents.DOM_UPDATE,
          bubbles: true,
        });
      });
    });

    // TODO(choumx, #14772): Flaky.
    it.skip('should only process one result at a time for rendering', () => {
      const doRenderPassSpy = sandbox.spy(list, 'doRenderPass_');
      const scheduleRenderSpy = sandbox.spy(list.renderPass_, 'schedule');

      const items = [{title: 'foo'}];
      const foo = doc.createElement('div');
      expectFetchAndRender(items, [foo]);
      const layout = list.layoutCallback();

      // Execute another fetch-triggering action immediately (actually on
      // the next tick to avoid losing the layoutCallback() promise resolver).
      Promise.resolve().then(() => {
        element.setAttribute('src', 'https://new.com/list.json');
        list.mutatedAttributesCallback({'src': 'https://new.com/list.json'});
      });
      // TODO(#14772): this expectation is sometimes not met.
      listMock.expects('toggleLoading').withExactArgs(false).once();
      listMock.expects('togglePlaceholder').withExactArgs(false).once();


      return layout.then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        // Only one render pass should be invoked at a time.
        expect(doRenderPassSpy).to.be.calledOnce;
        // But the next render pass should be scheduled.
        expect(scheduleRenderSpy).to.be.calledTwice;
        expect(scheduleRenderSpy).to.be.calledWith(1);
      });
    });

    it('should refetch if refresh action is called', () => {
      const foo = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        expectFetchAndRender(DEFAULT_FETCHED_DATA,
            [foo], {refresh: true, expr: 'items'});

        return list.executeAction({
          method: 'refresh',
          satisfiesTrust: () => true,
        });
      });
    });

    it('should reset on refresh if `reset-on-refresh` is set', () => {
      element.setAttribute('reset-on-refresh', '');
      const foo = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        const opts = {refresh: true, resetOnRefresh: true, expr: 'items'};
        expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo], opts);

        return list.executeAction({
          method: 'refresh',
          satisfiesTrust: () => true,
        });
      });
    });

    it('fetch should resolve if `src` is empty', () => {
      const spy = sandbox.spy(list, 'fetchList_');
      element.setAttribute('src', '');

      return list.layoutCallback().then(() => {
        expect(spy).to.have.been.calledOnce;
      });
    });

    it('should fail to load b/c data array is absent', () => {
      listMock.expects('fetch_').returns(Promise.resolve({})).once();
      listMock.expects('toggleLoading').withExactArgs(false).once();
      return expect(list.layoutCallback()).to.eventually.be
          .rejectedWith(/Response must contain an array/);
    });

    it('should fail to load b/c data single-item object is absent', () => {
      element.setAttribute('single-item', 'true');
      listMock.expects('fetch_').returns(Promise.resolve()).once();
      listMock.expects('toggleLoading').withExactArgs(false).once();
      return expect(list.layoutCallback()).to.eventually.be
          .rejectedWith(/Response must contain an array or object/);
    });

    it('should load and render with a different root', () => {
      const items = {different: [{title: 'Title1'}]};
      const itemElement = doc.createElement('div');
      element.setAttribute('items', 'different');
      expectFetchAndRender(items, [itemElement], {expr: 'different'});

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(itemElement)).to.be.true;
      });
    });

    it('should set accessibility roles', () => {
      const itemElement = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

      return list.layoutCallback().then(() => {
        expect(list.container_.getAttribute('role')).to.equal('list');
        expect(itemElement.getAttribute('role')).to.equal('listitem');
      });
    });

    it('should preserve accessibility roles', () => {
      element.setAttribute('role', 'list1');
      const itemElement = doc.createElement('div');
      itemElement.setAttribute('role', 'listitem1');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

      return list.layoutCallback().then(() => {
        expect(list.element.getAttribute('role')).to.equal('list1');
        expect(itemElement.getAttribute('role')).to.equal('listitem1');
      });
    });

    it('should show placeholder on fetch failure (w/o fallback)', () => {
      // Stub fetch_() to fail.
      listMock.expects('fetch_').returns(Promise.reject()).once();
      listMock.expects('toggleLoading').withExactArgs(false).once();
      listMock.expects('togglePlaceholder').never();
      return list.layoutCallback().catch(() => {});
    });

    describe('DOM diffing', () => {
      beforeEach(() => {
        toggleExperiment(win, 'amp-list-diffing', true, true);
      });

      it('should keep unchanged elements', function*() {
        const itemElement = doc.createElement('div');
        const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA,
            [itemElement]);
        yield list.layoutCallback().then(() => rendered);

        const newFetched = [{title: 'Title2'}];
        const newItemElement = doc.createElement('div');
        templates.findAndRenderTemplateArray
            .withArgs(element, newFetched)
            .returns(Promise.resolve([newItemElement]));
        yield list.mutatedAttributesCallback({src: newFetched});

        expect(list.container_.contains(itemElement)).to.be.true;
        expect(list.container_.contains(newItemElement)).to.be.false;
      });

      it('should use i-amphtml-key as a replacement key', function*() {
        const itemElement = doc.createElement('div');
        itemElement.setAttribute('i-amphtml-key', '1');
        const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA,
            [itemElement]);
        yield list.layoutCallback().then(() => rendered);

        const newFetched = [{title: 'Title2'}];
        const newItemElement = doc.createElement('div');
        newItemElement.setAttribute('i-amphtml-key', '2');
        templates.findAndRenderTemplateArray
            .withArgs(element, newFetched)
            .returns(Promise.resolve([newItemElement]));
        yield list.mutatedAttributesCallback({src: newFetched});

        expect(list.container_.contains(itemElement)).to.be.false;
        expect(list.container_.contains(newItemElement)).to.be.true;
      });
    });

    describe('SSR templates', () => {
      beforeEach(() => {
        sandbox.stub(ssrTemplateHelper, 'isSupported').returns(true);
      });

      it('should error if proxied fetch fails', () => {
        sandbox.stub(ssrTemplateHelper, 'fetchAndRenderTemplate')
            .returns(Promise.reject());

        listMock.expects('toggleLoading').withExactArgs(false).once();

        return expect(list.layoutCallback()).to.eventually.be
            .rejectedWith(/Error proxying amp-list templates/);
      });

      it('should error if proxied fetch returns invalid data', () => {
        sandbox.stub(ssrTemplateHelper, 'fetchAndRenderTemplate')
            .returns(Promise.resolve(undefined));

        listMock.expects('toggleLoading').withExactArgs(false).once();

        return expect(list.layoutCallback()).to.eventually.be.rejected;
      });

      it('should delegate template rendering to viewer', function*() {
        sandbox.stub(ssrTemplateHelper, 'fetchAndRenderTemplate')
            .returns(Promise.resolve({html: '<p>foo</p>'}));

        // Expects mutate/measure and hiding of loading/placeholder indicators.
        expectRender();

        const rendered = doc.createElement('p');
        templates.findAndSetHtmlForTemplate
            .withArgs(element, '<p>foo</p>')
            .returns(Promise.resolve(rendered));

        yield list.layoutCallback();

        const request = sinon.match({
          xhrUrl: 'https://data.com/list.json',
          fetchOpt: sinon.match({
            method: 'GET',
          }),
        });
        const attrs = sinon.match({
          ampListAttributes: sinon.match({items: 'items'}),
        });
        expect(ssrTemplateHelper.fetchAndRenderTemplate).to.be.calledOnce;
        expect(ssrTemplateHelper.fetchAndRenderTemplate)
            .to.be.calledWithExactly(element, request, null, attrs);

        expect(list.container_.contains(rendered)).to.be.true;
      });
    });

    // TODO(aghassemi, #12476): Make this test work with sinon 4.0.
    describe.skip('with fallback', () => {
      beforeEach(() => {
        // Stub getFallback() with fake truthy value.
        listMock.expects('getFallback').returns(true);
        // Stub getVsync().mutate() to execute immediately.
        listMock.expects('getVsync').returns({
          measure: () => {},
          mutate: block => block(),
        }).atLeast(1);
      });

      it('should hide fallback element on fetch success', () => {
        // Stub fetch and render to succeed.
        listMock.expects('fetch_').returns(Promise.resolve([])).once();
        templates.findAndRenderTemplateArray.returns(Promise.resolve([]));
        // Act as if a fallback is already displayed.
        sandbox.stub(list, 'fallbackDisplayed_').callsFake(true);

        listMock.expects('togglePlaceholder').never();
        listMock.expects('toggleFallback').withExactArgs(false).once();
        return list.layoutCallback().catch(() => {});
      });

      it('should hide placeholder and show fallback on fetch failure', () => {
        // Stub fetch_() to fail.
        listMock.expects('fetch_').returns(Promise.reject()).once();

        listMock.expects('togglePlaceholder').withExactArgs(false).once();
        listMock.expects('toggleFallback').withExactArgs(true).once();
        return list.layoutCallback().catch(() => {});
      });
    });
  }); // without amp-bind

  describe('with amp-bind', () => {
    let bind;

    beforeEach(() => {
      bind = {
        scanAndApply: sandbox.stub().returns(Promise.resolve()),
        signals: () => {
          return {get: unusedName => false};
        },
      };
      setBindService(bind);
    });

    it('should _not_ refetch if [src] attr changes (before layout)', () => {
      // Not allowed before layout.
      listMock.expects('fetchList_').never();

      element.setAttribute('src', 'https://new.com/list.json');
      list.mutatedAttributesCallback({'src': 'https://new.com/list.json'});
      expect(element.getAttribute('src')).to.equal('https://new.com/list.json');
    });

    it('should render and remove `src` if [src] points to local data', () => {
      const foo = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        listMock.expects('fetchList_').never();
        // Expect hiding of placeholder/loading after render.
        listMock.expects('togglePlaceholder').withExactArgs(false).once();
        listMock.expects('toggleLoading').withExactArgs(false).once();

        element.setAttribute('src', 'https://new.com/list.json');
        list.mutatedAttributesCallback({'src': [{title: 'Title1'}]});
        expect(element.getAttribute('src')).to.equal('');
      });
    });

    it('should reset if `reset-on-refresh` is set (new URL)', () => {
      element.setAttribute('reset-on-refresh', '');
      const foo = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        expectFetchAndRender(DEFAULT_FETCHED_DATA,
            [foo], {resetOnRefresh: true});
        element.setAttribute('src', 'https://new.com/list.json');
        list.mutatedAttributesCallback({'src': 'https://new.com/list.json'});
      });
    });

    it('should not reset if `reset-on-refresh=""` (new data)', () => {
      element.setAttribute('reset-on-refresh', '');
      const foo = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        listMock.expects('fetchList_').never();
        // Expect hiding of placeholder/loading after render.
        listMock.expects('togglePlaceholder').withExactArgs(false).once();
        listMock.expects('toggleLoading').withExactArgs(false).once();

        element.setAttribute('src', 'https://new.com/list.json');
        list.mutatedAttributesCallback({'src': DEFAULT_ITEMS});
      });
    });

    it('should reset if `reset-on-refresh="always"` (new data)', () => {
      element.setAttribute('reset-on-refresh', 'always');
      const foo = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        listMock.expects('fetchList_').never();
        // Expect display of placeholder/loading before render.
        listMock.expects('togglePlaceholder').withExactArgs(true).once();
        listMock.expects('toggleLoading').withExactArgs(true, true).once();
        // Expect hiding of placeholder/loading after render.
        listMock.expects('togglePlaceholder').withExactArgs(false).once();
        listMock.expects('toggleLoading').withExactArgs(false).once();

        element.setAttribute('src', 'https://new.com/list.json');
        list.mutatedAttributesCallback({'src': DEFAULT_ITEMS});
      });
    });

    it('should refetch if [src] attribute changes (after layout)', () => {
      const foo = doc.createElement('div');
      expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

      return list.layoutCallback().then(() => {
        expect(list.container_.contains(foo)).to.be.true;

        // Allowed post-layout.
        listMock.expects('fetchList_').once();

        element.setAttribute('src', 'https://new.com/list.json');
        list.mutatedAttributesCallback({'src': 'https://new.com/list.json'});
      });
    });

    describe('no `binding` attribute', () => {
      it('should call scanAndApply()', function*() {
        const output = [doc.createElement('div')];
        expectFetchAndRender(DEFAULT_FETCHED_DATA, output);
        yield list.layoutCallback();
        expect(bind.scanAndApply).to.have.been.calledOnce;
      });
    });

    describe('binding="always"', () => {
      beforeEach(() => {
        element.setAttribute('binding', 'always');
      });

      it('should call scanAndApply()', function*() {
        const output = [doc.createElement('div')];
        expectFetchAndRender(DEFAULT_FETCHED_DATA, output);
        yield list.layoutCallback();
        expect(bind.scanAndApply).to.have.been.calledOnce;
      });
    });

    describe('binding="refresh"', () => {
      beforeEach(() => {
        element.setAttribute('binding', 'refresh');
      });

      it('should not call scanAndApply() before FIRST_MUTATE', function*() {
        const output = [doc.createElement('div')];
        expectFetchAndRender(DEFAULT_FETCHED_DATA, output);
        yield list.layoutCallback();
        expect(bind.scanAndApply).to.not.have.been.called;
      });

      it('should call scanAndApply() after FIRST_MUTATE', function*() {
        bind.signals = () => {
          return {get: name => (name === 'FIRST_MUTATE')};
        };
        const output = [doc.createElement('div')];
        expectFetchAndRender(DEFAULT_FETCHED_DATA, output);
        yield list.layoutCallback();
        expect(bind.scanAndApply).to.have.been.calledOnce;
        expect(bind.scanAndApply).calledWithExactly(output, [list.container_]);
      });
    });

    describe('binding="no"', () => {
      beforeEach(() => {
        element.setAttribute('binding', 'no');
      });

      it('should not call scanAndApply()', function*() {
        const output = [doc.createElement('div')];
        expectFetchAndRender(DEFAULT_FETCHED_DATA, output);
        yield list.layoutCallback();
        expect(bind.scanAndApply).to.not.have.been.called;
      });
    });
  }); // with amp-bind
});
