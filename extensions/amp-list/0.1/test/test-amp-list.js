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
import {templatesFor} from '../../../../src/template';
import {xhrFor} from '../../../../src/xhr';
import * as promise from '../../../../src/promise';
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

    xhr = xhrFor(window);
    xhrMock = sandbox.mock(xhr);

    element = document.createElement('div');
    element.setAttribute('src', 'https://data.com/list.json');
    list = new AmpList(element);
    list.buildCallback();
    listMock = sandbox.mock(list);

    element.style.height = '10px';
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
    templatesMock.verify();
    templatesMock.restore();
    templatesMock = null;
    xhrMock.verify();
    xhrMock.restore();
    xhrMock = null;
    listMock.verify();
    listMock.restore();
    listMock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should load and render', () => {
    const items = [
      {title: 'Title1'}
    ];
    const newHeight = 127;
    const itemElement = document.createElement('div');
    itemElement.style.height = newHeight + 'px';
    const xhrPromise = Promise.resolve({items: items});
    const renderPromise = Promise.resolve([itemElement]);
    let measureFunc;
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => !opts.credentials))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    listMock.expects('getVsync').returns({
      measure: func => {
        measureFunc = func;
      }
    }).once();
    listMock.expects('requestChangeHeight').withExactArgs(newHeight);
    return list.layoutCallback().then(() => {
      return promise.all([xhrPromise, renderPromise]).then(() => {
        expect(list.container_.contains(itemElement)).to.be.true;
        expect(measureFunc).to.exist;
        measureFunc();
      });
    });
  });

  it('should set accessibility roles', () => {
    const items = [
      {title: 'Title1'}
    ];
    const itemElement = document.createElement('div');
    const xhrPromise = Promise.resolve({items: items});
    const renderPromise = Promise.resolve([itemElement]);
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => !opts.credentials))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    return list.layoutCallback().then(() => {
      return promise.all([xhrPromise, renderPromise]).then(() => {
        expect(list.element.getAttribute('role')).to.equal('list');
        expect(itemElement.getAttribute('role')).to.equal('listitem');
      });
    });
  });

  it('should preserve accessibility roles', () => {
    const items = [
      {title: 'Title1'}
    ];
    element.setAttribute('role', 'list1');
    const itemElement = document.createElement('div');
    itemElement.setAttribute('role', 'listitem1');
    const xhrPromise = Promise.resolve({items: items});
    const renderPromise = Promise.resolve([itemElement]);
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => !opts.credentials))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    return list.layoutCallback().then(() => {
      return promise.all([xhrPromise, renderPromise]).then(() => {
        expect(list.element.getAttribute('role')).to.equal('list1');
        expect(itemElement.getAttribute('role')).to.equal('listitem1');
      });
    });
  });

  it('should request credentials', () => {
    const items = [];
    const xhrPromise = Promise.resolve({items: items});
    element.setAttribute('credentials', 'include');
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => opts.credentials == 'include'))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(Promise.resolve([])).once();
    return list.layoutCallback();
  });
});
