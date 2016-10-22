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
import {templatesFor} from '../../../../src/template';
import {installXhrService} from '../../../../src/service/xhr-impl';
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

    xhr = installXhrService(window);
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
    let measureFunc;
    xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
        sinon.match(opts => opts.credentials === undefined))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(renderPromise).once();
    listMock.expects('getVsync').returns({
      measure: func => {
        measureFunc = func;
      },
    }).once();
    listMock.expects('attemptChangeHeight').withExactArgs(newHeight).returns(
        Promise.resolve());
    return list.layoutCallback().then(() => {
      return Promise.all([xhrPromise, renderPromise]).then(() => {
        expect(list.container_.contains(itemElement)).to.be.true;
        expect(measureFunc).to.exist;
        measureFunc();
      });
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
          return opts.credentials == 'include' &&
              opts.requireAmpResponseSourceOrigin;
        }))
        .returns(xhrPromise).once();
    templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
        element, items)
        .returns(Promise.resolve([])).once();
    return list.layoutCallback();
  });
});
