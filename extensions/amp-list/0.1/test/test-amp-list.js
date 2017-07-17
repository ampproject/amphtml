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
import * as sinon from 'sinon';

describe('amp-list component', () => {
  let sandbox;
  let templatesMock;
  let element;
  let list;
  let listMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    const templates = Services.templatesFor(window);
    templatesMock = sandbox.mock(templates);

    const ampdoc = Services.ampdocServiceFor(window).getAmpDoc();

    element = document.createElement('div');
    element.setAttribute('src', 'https://data.com/list.json');
    element.getAmpDoc = () => ampdoc;
    element.getFallback = () => null;

    list = new AmpList(element);
    list.buildCallback();
    listMock = sandbox.mock(list);

    element.style.height = '10px';
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    templatesMock.verify();
    listMock.verify();
    sandbox.restore();
  });

  it('should load and render', () => {
    const items = [
      {title: 'Title1'},
    ];
    const newHeight = 127;
    const itemElement = document.createElement('div');
    itemElement.style.height = newHeight + 'px';
    const fetchPromise = Promise.resolve(items);
    const renderPromise = Promise.resolve([itemElement]);
    listMock.expects('fetchItems_').withExactArgs('items')
        .returns(fetchPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    let measureFunc;
    listMock.expects('getVsync').returns({
      measure: func => {
        measureFunc = func;
      },
    }).once();
    listMock.expects('attemptChangeHeight').withExactArgs(newHeight).returns(
        Promise.resolve());
    return list.layoutCallback().then(() => {
      return Promise.all([fetchPromise, renderPromise]);
    }).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
      expect(measureFunc).to.exist;
      measureFunc();
    });
  });

  it('should dispatch "amp:template-rendered" event after render', () => {
    const items = [{title: 'Title1'}];
    const itemElement = document.createElement('div');
    const fetchPromise = Promise.resolve(items);
    const renderPromise = Promise.resolve([itemElement]);
    listMock.expects('fetchItems_').withExactArgs('items')
        .returns(fetchPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withArgs()
        .returns(renderPromise).once();
    const spy = sandbox.spy(list.container_, 'dispatchEvent');
    return list.layoutCallback().then(() => {
      return Promise.all([fetchPromise, renderPromise]);
    }).then(() => {
      expect(spy).to.have.been.calledOnce;
      expect(spy).calledWithMatch({
        type: AmpEvents.TEMPLATE_RENDERED,
        bubbles: true,
      });
    });
  });

  it('should reload data if the src attribute changes', () => {
    const initialItems = [
      {title: 'Title1'},
    ];
    const newItems = [
      {title: 'Title2'}, {title: 'Title3'},
    ];
    const itemElement = document.createElement('div');
    const itemElement2 = document.createElement('div');
    const itemElement3 = document.createElement('div');
    const fetchPromise = Promise.resolve(initialItems);
    const renderPromise = Promise.resolve([itemElement]);
    listMock.expects('fetchItems_').withExactArgs('items')
        .returns(fetchPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, initialItems)
        .returns(renderPromise);
    listMock.expects('getVsync').returns({
      measure: () => {},
    }).twice();
    return list.layoutCallback().then(() => {
      return Promise.all([fetchPromise, renderPromise]);
    }).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
      const newFetchPromise = Promise.resolve(newItems);
      const newRenderPromise = Promise.resolve([itemElement2, itemElement3]);
      listMock.expects('fetchItems_').withExactArgs('items')
          .returns(newFetchPromise).once();
      templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
          element, newItems)
          .returns(newRenderPromise).once();
      const spy = sandbox.spy(list, 'populateList_');
      element.setAttribute('src', 'https://data2.com/list.json');
      list.mutatedAttributesCallback({'src': 'https://data2.com/list.json'});
      expect(spy).to.be.calledOnce;
    });
  });

  it('should fail to load b/c data is absent', () => {
    listMock.expects('fetchItems_')
        .returns(Promise.resolve({})).once();
    templatesMock.expects('findAndRenderTemplateArray').never();
    return expect(list.layoutCallback()).to.eventually.be
        .rejectedWith(/Response must contain an array/);
  });

  it('should load and render with a different root', () => {
    const different = [
      {title: 'Title1'},
    ];
    element.setAttribute('items', 'different');
    const itemElement = document.createElement('div');
    listMock.expects('fetchItems_')
        .returns(Promise.resolve(different)).once();
    templatesMock.expects('findAndRenderTemplateArray')
        .withExactArgs(element, different)
        .returns(Promise.resolve([itemElement])).once();
    return list.layoutCallback().then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
    });
  });

  it('should set accessibility roles', () => {
    const items = [
      {title: 'Title1'},
    ];
    const itemElement = document.createElement('div');
    const fetchPromise = Promise.resolve(items);
    const renderPromise = Promise.resolve([itemElement]);
    listMock.expects('fetchItems_').withExactArgs('items')
        .returns(fetchPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    return list.layoutCallback().then(() => {
      return Promise.all([fetchPromise, renderPromise]).then(() => {
        expect(list.container_.getAttribute('role')).to.equal('list');
        expect(itemElement.getAttribute('role')).to.equal('listitem');
      });
    });
  });

  it('should preserve accessibility roles', () => {
    const items = [
      {title: 'Title1'},
    ];
    element.setAttribute('role', 'list1');
    const itemElement = document.createElement('div');
    itemElement.setAttribute('role', 'listitem1');
    const fetchPromise = Promise.resolve(items);
    const renderPromise = Promise.resolve([itemElement]);
    listMock.expects('fetchItems_').withExactArgs('items')
        .returns(fetchPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    return list.layoutCallback().then(() => {
      return Promise.all([fetchPromise, renderPromise]).then(() => {
        expect(list.element.getAttribute('role')).to.equal('list1');
        expect(itemElement.getAttribute('role')).to.equal('listitem1');
      });
    });
  });

  it('should show placeholder on fetch failure (w/o fallback)', () => {
    // Stub fetchItems_() to fail.
    listMock.expects('fetchItems_').returns(Promise.reject()).once();
    listMock.expects('togglePlaceholder').never();
    return list.layoutCallback().catch(() => {});
  });

  describe('with fallback', () => {
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
      listMock.expects('fetchItems_').returns(Promise.resolve([])).once();
      templatesMock.expects('findAndRenderTemplateArray')
          .returns(Promise.resolve([]));
      // Act as if a fallback is already displayed.
      sandbox.stub(list, 'fallbackDisplayed_', true);

      listMock.expects('togglePlaceholder').never();
      listMock.expects('toggleFallback').withExactArgs(false).once();
      return list.layoutCallback().catch(() => {});
    });

    it('should hide placeholder and display fallback on fetch failure', () => {
      // Stub fetchItems_() to fail.
      listMock.expects('fetchItems_').returns(Promise.reject()).once();

      listMock.expects('togglePlaceholder').withExactArgs(false).once();
      listMock.expects('toggleFallback').withExactArgs(true).once();
      return list.layoutCallback().catch(() => {});
    });
  });
});
