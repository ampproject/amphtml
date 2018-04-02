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
import {Services} from '../../../../src/services';


describes.realWin('amp-list component', {
  amp: {
    extensions: ['amp-list'],
  },
}, env => {
  let win, doc, ampdoc;
  let templatesMock;
  let element;
  let list;
  let listMock;
  let bindForDocOrNull;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    const templates = Services.templatesFor(win);
    templatesMock = sandbox.mock(templates);

    element = doc.createElement('div');
    element.setAttribute('src', 'https://data.com/list.json');
    element.getAmpDoc = () => ampdoc;
    element.getFallback = () => null;

    bindForDocOrNull = sandbox.stub(Services, 'bindForDocOrNull')
        .returns(Promise.resolve(null));

    list = new AmpList(element);
    list.buildCallback();
    listMock = sandbox.mock(list);

    element.style.height = '10px';
    doc.body.appendChild(element);
  });

  afterEach(() => {
    templatesMock.verify();
    listMock.verify();
  });

  const DEFAULT_LIST_OPTS = {
    expr: 'items',
    maxItems: 0,
    singleItem: false,
    resetOnRefresh: false,
  };

  /**
   * @param {!Array|!Object} fetched
   * @param {!Array<!Element>} rendered
   * @param {Object=} opts
   * @return {!Promise}
   */
  function expectFetchAndRender(fetched, rendered, opts = DEFAULT_LIST_OPTS) {
    const fetch = Promise.resolve(fetched);
    if (opts.resetOnRefresh) {
      listMock.expects('togglePlaceholder').withExactArgs(true).once();
      listMock.expects('toggleLoading').withExactArgs(true).once();
    }
    listMock.expects('fetch_')
        .withExactArgs(opts.expr).returns(fetch).atLeast(1);
    listMock.expects('toggleLoading').withExactArgs(false).once();
    listMock.expects('togglePlaceholder').withExactArgs(false).once();

    let itemsToRender = fetched;
    if (opts.singleItem) {
      expect(fetched).to.be.a('object');
      itemsToRender = [fetched];
    } else if (opts.maxItems > 0) {
      itemsToRender = fetched.slice(0, opts.maxItems);
    }
    const render = Promise.resolve(rendered);
    templatesMock.expects('findAndRenderTemplateArray')
        .withExactArgs(element, itemsToRender).returns(render).atLeast(1);

    return Promise.all([fetch, render]);
  }

  it('should fetch and render', () => {
    const items = [
      {title: 'Title1'},
    ];
    const itemElement = doc.createElement('div');
    const rendered = expectFetchAndRender(items, [itemElement]);
    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
    });
  });

  it('should attemptChangeHeight after render', () => {
    const items = [
      {title: 'Title1'},
    ];
    const itemElement = doc.createElement('div');
    itemElement.style.height = '1337px';

    const rendered = expectFetchAndRender(items, [itemElement]);

    let measureFunc;
    listMock.expects('getVsync').returns({
      measure: func => {
        measureFunc = func;
      },
    }).once();

    listMock.expects('attemptChangeHeight')
        .withExactArgs(1337)
        .returns(Promise.resolve());

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
      expect(measureFunc).to.exist;
      measureFunc();
    });
  });

  it('should fetch and render non-array if single-item is set', () => {
    const items = {title: 'Title1'};
    const itemElement = doc.createElement('div');
    element.setAttribute('single-item', 'true');

    const rendered = expectFetchAndRender(
        items, [itemElement], {expr: 'items', singleItem: true});

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
    });
  });

  it('should trim the results to max-items', () => {
    const items = [
      {title: 'Title1'},
      {title: 'Title2'},
      {title: 'Title3'},
    ];
    const itemElement = doc.createElement('div');
    element.setAttribute('max-items', '2');

    const rendered = expectFetchAndRender(
        items, [itemElement], {expr: 'items', maxItems: 2});

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
    });
  });

  it('should dispatch DOM_UPDATE event after render', () => {
    const spy = sandbox.spy(list.container_, 'dispatchEvent');

    const items = [{title: 'Title1'}];
    const itemElement = doc.createElement('div');
    const rendered = expectFetchAndRender(items, [itemElement]);

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(spy).to.have.been.calledOnce;
      expect(spy).calledWithMatch({
        type: AmpEvents.DOM_UPDATE,
        bubbles: true,
      });
    });
  });

  it('should call scanAndApply() if amp-bind is available', () => {
    const bind = {scanAndApply: sandbox.spy()};
    bindForDocOrNull.returns(Promise.resolve(bind));

    const items = [{title: 'Title1'}];
    const output = [doc.createElement('div')];
    const rendered = expectFetchAndRender(items, output);

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(bind.scanAndApply).to.have.been.calledOnce;
      expect(bind.scanAndApply).calledWithExactly(output, [list.container_]);
    });
  });

  it('should _not_ refetch if [src] attribute changes (before layout)', () => {
    // Not allowed before layout.
    listMock.expects('fetchList_').never();

    element.setAttribute('src', 'https://new.com/list.json');
    list.mutatedAttributesCallback({'src': 'https://new.com/list.json'});
    expect(element.getAttribute('src')).to.equal('https://new.com/list.json');
  });

  it('should render and remove `src` if [src] points to local data', () => {
    const items = [{title: 'foo'}];
    const foo = doc.createElement('div');
    const rendered = expectFetchAndRender(items, [foo]);

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(foo)).to.be.true;

      listMock.expects('fetchList_').never();

      element.setAttribute('src', 'https://new.com/list.json');
      list.mutatedAttributesCallback({'src': items});
      expect(element.getAttribute('src')).to.equal('');
    });
  });

  it('should refetch if [src] attribute changes (after layout)', () => {
    const items = [{title: 'foo'}];
    const foo = doc.createElement('div');
    const rendered = expectFetchAndRender(items, [foo]);

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(foo)).to.be.true;

      // Allowed post-layout.
      listMock.expects('fetchList_').once();

      element.setAttribute('src', 'https://new.com/list.json');
      list.mutatedAttributesCallback({'src': 'https://new.com/list.json'});
    });
  });

  it('should only process one fetch result at a time for rendering', () => {
    const doRenderPassSpy = sandbox.spy(list, 'doRenderPass_');
    const scheduleRenderSpy = sandbox.spy(list.renderPass_, 'schedule');

    const items = [{title: 'foo'}];
    const foo = doc.createElement('div');
    const rendered = expectFetchAndRender(items, [foo]);
    const layout = list.layoutCallback();

    // Execute another fetch-triggering action immediately (actually on
    // the next tick to avoid losing the layoutCallback() promise resolver).
    Promise.resolve().then(() => {
      element.setAttribute('src', 'https://new.com/list.json');
      list.mutatedAttributesCallback({'src': 'https://new.com/list.json'});
    });
    listMock.expects('toggleLoading').withExactArgs(false).once();
    listMock.expects('togglePlaceholder').withExactArgs(false).once();


    return layout.then(() => rendered).then(() => {
      expect(list.container_.contains(foo)).to.be.true;

      // Only one render pass should be invoked at a time.
      expect(doRenderPassSpy).to.be.calledOnce;
      // But the next render pass should be scheduled.
      expect(scheduleRenderSpy).to.be.calledTwice;
      expect(scheduleRenderSpy).to.be.calledWith(1);
    });
  });

  it('should refetch if refresh action is called', () => {
    const items = [{title: 'foo'}];
    const foo = doc.createElement('div');
    const rendered = expectFetchAndRender(items, [foo]);

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(foo)).to.be.true;

      const renderedAgain = expectFetchAndRender(items, [foo]);

      list.executeAction({
        method: 'refresh',
        satisfiesTrust: () => true,
      });
      return renderedAgain;
    });
  });

  it('should show placeholder and loading while refreshing when ' +
    'reset-on-refresh is set', () => {
    element.setAttribute('reset-on-refresh', 'true');
    const items = [{title: 'foo'}];
    const foo = doc.createElement('div');
    const opts = {expr: 'items', resetOnRefresh: true};
    const rendered = expectFetchAndRender(items, [foo], opts);

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.contains(foo)).to.be.true;

      const renderedAgain = expectFetchAndRender(items, [foo], opts);

      list.executeAction({
        method: 'refresh',
        satisfiesTrust: () => true,
      });
      return renderedAgain;
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
    templatesMock.expects('findAndRenderTemplateArray').never();
    return expect(list.layoutCallback()).to.eventually.be
        .rejectedWith(/Response must contain an array/);
  });

  it('should fail to load b/c data single-item object is absent', () => {
    element.setAttribute('single-item', 'true');
    listMock.expects('fetch_').returns(Promise.resolve()).once();
    listMock.expects('toggleLoading').withExactArgs(false).once();
    templatesMock.expects('findAndRenderTemplateArray').never();
    return expect(list.layoutCallback()).to.eventually.be
        .rejectedWith(/Response must contain an array or object/);
  });

  it('should load and render with a different root', () => {
    const items = [{title: 'Title1'}];
    const itemElement = doc.createElement('div');
    element.setAttribute('items', 'different');
    expectFetchAndRender(items, [itemElement], {expr: 'different'});

    return list.layoutCallback().then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
    });
  });

  it('should set accessibility roles', () => {
    const items = [{title: 'Title1'}];
    const itemElement = doc.createElement('div');
    const rendered = expectFetchAndRender(items, [itemElement]);

    return list.layoutCallback().then(() => rendered).then(() => {
      expect(list.container_.getAttribute('role')).to.equal('list');
      expect(itemElement.getAttribute('role')).to.equal('listitem');
    });
  });

  it('should preserve accessibility roles', () => {
    const items = [{title: 'Title1'}];
    element.setAttribute('role', 'list1');
    const itemElement = doc.createElement('div');
    itemElement.setAttribute('role', 'listitem1');
    const rendered = expectFetchAndRender(items, [itemElement]);

    return list.layoutCallback().then(() => rendered).then(() => {
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
      templatesMock.expects('findAndRenderTemplateArray')
          .returns(Promise.resolve([]));
      // Act as if a fallback is already displayed.
      sandbox.stub(list, 'fallbackDisplayed_').callsFake(true);

      listMock.expects('togglePlaceholder').never();
      listMock.expects('toggleFallback').withExactArgs(false).once();
      return list.layoutCallback().catch(() => {});
    });

    it('should hide placeholder and display fallback on fetch failure', () => {
      // Stub fetch_() to fail.
      listMock.expects('fetch_').returns(Promise.reject()).once();

      listMock.expects('togglePlaceholder').withExactArgs(false).once();
      listMock.expects('toggleFallback').withExactArgs(true).once();
      return list.layoutCallback().catch(() => {});
    });
  });
});
