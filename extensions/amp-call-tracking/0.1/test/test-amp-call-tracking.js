/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {AmpCallTracking} from '../amp-call-tracking';
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {createIframePromise} from '../../../../testing/iframe';
import {installXhrService} from '../../../../src/service/xhr-impl';
import * as sinon from 'sinon';


describe('amp-call-tracking', () => {

  let sandbox;
  let xhr;
  let xhrMock;
  let element;
  let callTrackingEl;
  let callTrackingElMock;

  function getTestFrame() {
    return createIframePromise().then(iframe => {
      const ampdoc = new AmpDocSingle(iframe.win);
      //const viewer = viewerForDoc(ampdoc);
      //sandbox.stub(viewer, 'isEmbedded', () => isEmbedded);
      // platform = platformFor(iframe.win);
      // sandbox.stub(platform, 'isIos', () => isIos);
      // sandbox.stub(platform, 'isAndroid', () => isAndroid);
      // sandbox.stub(platform, 'isChrome', () => isChrome);
      // sandbox.stub(platform, 'isSafari', () => isSafari);

      //vsync = vsyncFor(iframe.win);
      // sandbox.stub(vsync, 'runPromise', (task, state) => {
      //   runTask(task, state);
      //   return Promise.resolve();
      // });
      //sandbox.stub(vsync, 'run', runTask);
      return iframe;
    });
  }

  function getCallTrackingEl(config = {}) {
    return getTestFrame().then(iframe => {
      const anchorEl = iframe.doc.createElement('a');
      const callTrackingEl = iframe.doc.createElement('amp-call-tracking');

      callTrackingEl.setAttribute('config', config.url);

      anchorEl.setAttribute('href', `tel:${config.defaultNumber}`);
      anchorEl.textContent = config.defaultContent || config.defaultNumber;

      callTrackingEl.appendChild(anchorEl);

      return iframe.addElement(callTrackingEl);
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass always', () => {
    return getCallTrackingEl({
      url: 'https://example.com/test.json',
      defaultNumber: '123456',
      defaultContent: '+1 (23) 456',
    }).then(el => true);
  });

  // it('should load and render', () => {
  //   const items = [
  //     {title: 'Title1'},
  //   ];
  //   const newHeight = 127;
  //   const itemElement = document.createElement('div');
  //   itemElement.style.height = newHeight + 'px';
  //   const xhrPromise = Promise.resolve({items});
  //   const renderPromise = Promise.resolve([itemElement]);
  //   let measureFunc;
  //   xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
  //       sinon.match(opts => opts.credentials === undefined))
  //       .returns(xhrPromise).once();
  //   templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
  //       element, items)
  //       .returns(renderPromise).once();
  //   listMock.expects('getVsync').returns({
  //     measure: func => {
  //       measureFunc = func;
  //     },
  //   }).once();
  //   listMock.expects('attemptChangeHeight').withExactArgs(newHeight).returns(
  //       Promise.resolve());
  //   return list.layoutCallback().then(() => {
  //     return Promise.all([xhrPromise, renderPromise]).then(() => {
  //       expect(list.container_.contains(itemElement)).to.be.true;
  //       expect(measureFunc).to.exist;
  //       measureFunc();
  //     });
  //   });
  // });

  // it('should fail to load b/c data is absent', () => {
  //   xhrMock.expects('fetchJson')
  //       .returns(Promise.resolve({})).once();
  //   templatesMock.expects('findAndRenderTemplateArray').never();
  //   return expect(list.layoutCallback()).to.eventually.be
  //       .rejectedWith(/Response must contain an array/);
  // });

  // it('should load and render with a different root', () => {
  //   const different = [
  //     {title: 'Title1'},
  //   ];
  //   element.setAttribute('items', 'different');
  //   const itemElement = document.createElement('div');
  //   xhrMock.expects('fetchJson')
  //       .returns(Promise.resolve({different})).once();
  //   templatesMock.expects('findAndRenderTemplateArray')
  //       .withExactArgs(element, different)
  //       .returns(Promise.resolve([itemElement])).once();
  //   return list.layoutCallback().then(() => {
  //     expect(list.container_.contains(itemElement)).to.be.true;
  //   });
  // });

  // it('should set accessibility roles', () => {
  //   const items = [
  //     {title: 'Title1'},
  //   ];
  //   const itemElement = document.createElement('div');
  //   const xhrPromise = Promise.resolve({items});
  //   const renderPromise = Promise.resolve([itemElement]);
  //   xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
  //       sinon.match(opts => opts.credentials === undefined))
  //       .returns(xhrPromise).once();
  //   templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
  //       element, items)
  //       .returns(renderPromise).once();
  //   return list.layoutCallback().then(() => {
  //     return Promise.all([xhrPromise, renderPromise]).then(() => {
  //       expect(list.container_.getAttribute('role')).to.equal('list');
  //       expect(itemElement.getAttribute('role')).to.equal('listitem');
  //     });
  //   });
  // });

  // it('should preserve accessibility roles', () => {
  //   const items = [
  //     {title: 'Title1'},
  //   ];
  //   element.setAttribute('role', 'list1');
  //   const itemElement = document.createElement('div');
  //   itemElement.setAttribute('role', 'listitem1');
  //   const xhrPromise = Promise.resolve({items});
  //   const renderPromise = Promise.resolve([itemElement]);
  //   xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
  //       sinon.match(opts => opts.credentials === undefined))
  //       .returns(xhrPromise).once();
  //   templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
  //       element, items)
  //       .returns(renderPromise).once();
  //   return list.layoutCallback().then(() => {
  //     return Promise.all([xhrPromise, renderPromise]).then(() => {
  //       expect(list.element.getAttribute('role')).to.equal('list1');
  //       expect(itemElement.getAttribute('role')).to.equal('listitem1');
  //     });
  //   });
  // });

  // it('should request credentials', () => {
  //   const items = [];
  //   const xhrPromise = Promise.resolve({items});
  //   element.setAttribute('credentials', 'include');
  //   xhrMock.expects('fetchJson').withExactArgs('https://data.com/list.json',
  //       sinon.match(opts => {
  //         return opts.credentials == 'include';
  //       }))
  //       .returns(xhrPromise).once();
  //   templatesMock.expects('findAndRenderTemplateArray').withExactArgs(
  //       element, items)
  //       .returns(Promise.resolve([])).once();
  //   return list.layoutCallback();
  // });
});
