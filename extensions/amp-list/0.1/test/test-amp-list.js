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

import {AmpList} from '../amp-list';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import {batchedXhrServiceForTesting,} from
    '../../../../src/service/batched-xhr-impl';
import {templatesFor} from '../../../../src/services';
import * as sinon from 'sinon';


describe('amp-list component', () => {

  let sandbox;
  let templates;
  let templatesMock;
  let xhr;
  let xhrMock;
  let element;
  let list;
  let listMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    templates = templatesFor(window);
    templatesMock = sandbox.mock(templates);

    xhr = batchedXhrServiceForTesting(window);
    xhrMock = sandbox.mock(xhr);

    const ampdoc = ampdocServiceFor(window).getAmpDoc();

    element = document.createElement('div');
    element.setAttribute('src', 'https://data.com/list.json');
    element.getAmpDoc = () => ampdoc;
    list = new AmpList(element);
    list.buildCallback();
    listMock = sandbox.mock(list);

    element.style.height = '10px';
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    templatesMock.verify();
    xhrMock.verify();
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
    const xhrPromise = Promise.resolve({items});
    const renderPromise = Promise.resolve([itemElement]);
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => opts.credentials === undefined))
        .returns(xhrPromise).once();
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
      return Promise.all([xhrPromise, renderPromise]);
    }).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
      expect(measureFunc).to.exist;
      measureFunc();
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
    const xhrPromise = Promise.resolve({items: initialItems});
    const renderPromise = Promise.resolve([itemElement]);
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => opts.credentials === undefined))
        .returns(xhrPromise);
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, initialItems)
        .returns(renderPromise);
    listMock.expects('getVsync').returns({
      measure: () => {},
    }).twice();
    return list.layoutCallback().then(() => {
      return Promise.all([xhrPromise, renderPromise]);
    }).then(() => {
      expect(list.container_.contains(itemElement)).to.be.true;
      const newXhrPromise = Promise.resolve({items: newItems});
      const newRenderPromise = Promise.resolve([itemElement2, itemElement3]);
      xhrMock.expects('fetchJson').withExactArgs('https://data2.com/list.json',
          sinon.match(opts => opts.credentials === undefined))
          .returns(newXhrPromise).once();
      templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
          element, newItems)
          .returns(newRenderPromise).once();
      const spy = sinon.spy(list, 'populateList_');
      element.setAttribute('src', 'https://data2.com/list.json');
      list.mutatedAttributesCallback({'src': 'https://data2.com/list.json'});
      expect(spy).to.be.calledOnce;
    });
  });

  it('should fail to load b/c data is absent', () => {
    xhrMock.expects('fetchJson')
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
    xhrMock.expects('fetchJson')
        .returns(Promise.resolve({different})).once();
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
    const xhrPromise = Promise.resolve({items});
    const renderPromise = Promise.resolve([itemElement]);
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => opts.credentials === undefined))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    return list.layoutCallback().then(() => {
      return Promise.all([xhrPromise, renderPromise]).then(() => {
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
    const xhrPromise = Promise.resolve({items});
    const renderPromise = Promise.resolve([itemElement]);
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => opts.credentials === undefined))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    return list.layoutCallback().then(() => {
      return Promise.all([xhrPromise, renderPromise]).then(() => {
        expect(list.element.getAttribute('role')).to.equal('list1');
        expect(itemElement.getAttribute('role')).to.equal('listitem1');
      });
    });
  });

  it('should request credentials', () => {
    const items = [];
    const xhrPromise = Promise.resolve({items});
    element.setAttribute('credentials', 'include');
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => {
          return opts.credentials == 'include';
        }))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(Promise.resolve([])).once();
    return list.layoutCallback();
  });
});
