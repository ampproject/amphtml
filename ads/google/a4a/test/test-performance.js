/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AmpAdLifecycleReporter} from '../performance';
import {childElements} from '../../../../src/dom';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

/**
 * Verify that `address` matches all of the patterns in `matchlist`.
 *
 * @param {!string} address
 * @param {!Array<!RegExp>} matchList
 */
function expectMatchesAll(address, matchList) {
  matchList.forEach(m => {
    expect(address).to.match(m);
  });
}

/**
 * Whether `element` is an `img` DOM node.
 * @param {!Element} element
 * @returns {boolean}
 */
function isImgNode(element) {
  return element.tagName == 'IMG';
}

/**
 * Verify that `element` has at least one sibling DOM node that is an
 * `img` tag whose `src` matches all of the patterns in `matchList`.
 *
 * @param {!Element} element
 * @param {!Array<!RegExp>} matchList
 */
function expectHasSiblingImgMatchingAll(element, matchList) {
  const imgSiblings = childElements(
      element.parentElement, e => isImgNode(e));
  expect(imgSiblings).to.not.be.empty;
  const result = imgSiblings.some(e => {
    const src = e.getAttribute('src');
    return matchList.map(m => m.test(src)).every(x => x);
  });
  expect(result, 'No element sibling of ' + element + ' matched all patterns')
      .to.be.true;
}

describe('AmpAdLifecycleReporter', () => {
  let sandbox;
  let emitPingSpy;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    emitPingSpy = sandbox.spy(AmpAdLifecycleReporter.prototype, 'emitPing_');
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('#sendPing', () => {
    it('should request a single ping and insert into DOM', () => {
      return createIframePromise(false).then(fixture => {
        const win = fixture.win;
        const doc = fixture.doc;
        const elem = doc.createElement('div');
        doc.body.appendChild(elem);
        const reporter = new AmpAdLifecycleReporter(win, elem, 'test_foo');
        reporter.setPingAddress('/');
        expect(emitPingSpy).to.not.be.called;
        reporter.sendPing('onLayoutMeasure');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          /s=test_foo/,
          // In unit tests, substition of AMP_VERSION apparently returns this
          // string, instead of an expanded, numeric form.  See
          // testing/functional/test-url-replacements.js.
          /rls=%24internalRuntimeVersion%24+/,
          /c=[0-9]+/,
          /it=onLayoutMeasure\.[0-9]+/,
          /onLayoutMeasure_0\.[0-9]+/,
          /rt=stage\.1+/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });

    it('should request multiple pings and write all to the DOM', () => {
      return createIframePromise().then(fixture => {
        const stages = {
          constructor: '0',
          onLayoutMeasure: '1',
          buildUrl: '2',
          sendXhrRequest: '3',
          extractCreativeAndSignature: '4',
          validateAdResponse: '5',
          maybeRenderAmpAd: '6',
          renderViaIframe: '7',
          layoutCallback: '10',
          unlayoutCallback: '20',
        };
        const win = fixture.win;
        const doc = fixture.doc;
        const elem = doc.createElement('div');
        doc.body.appendChild(elem);
        const reporter = new AmpAdLifecycleReporter(win, elem, 'test_foo');
        reporter.setPingAddress('/');
        expect(emitPingSpy).to.not.be.called;
        let count = 0;
        for (const k in stages) {
          reporter.sendPing(k);
          ++count;
        }
        expect(emitPingSpy.callCount).to.equal(count);
        count = 0;
        for (const k in stages) {
          const expectations = [
            /s=test_foo/,
            // In unit tests, substition of AMP_VERSION apparently returns this
            // string, instead of an expanded, numeric form.  See
            // testing/functional/test-url-replacements.js.
            /rls=%24internalRuntimeVersion%24+/,
            /c=[0-9]+/,
            new RegExp(`it=${k}\.[0-9]+`),
            new RegExp(`${k}_0\.[0-9]+`),
            new RegExp(`rt=stage\.${stages[k]}`),
          ];
          const arg = emitPingSpy.getCall(count++).args[0];
          expectMatchesAll(arg, expectations);
          expectHasSiblingImgMatchingAll(elem, expectations);
        }
      });
    });

    it('should use diff slot IDs, but the same correlator', () => {
      return createIframePromise(false).then(fixture => {
        const win = fixture.win;
        const doc = fixture.doc;
        const stages = {
          constructor: '0',
          validateAdResponse: '5',
          layoutCallback: '10',
        };
        const allReporters = [];
        const nDomElements = 20;
        for (let i = 0; i < nDomElements; ++i) {
          const elem = doc.createElement('div');
          elem.setAttribute('id', i);
          doc.body.appendChild(elem);
          const reporter = new AmpAdLifecycleReporter(win, elem, 'test_foo');
          reporter.setPingAddress('/');
          allReporters.push(reporter);
        }
        allReporters.forEach(r => {
          for (const k in stages) {
            r.sendPing(k);
          }
        });
        expect(emitPingSpy.callCount).to.equal(nDomElements * 3);
        const allImgNodes = childElements(doc.body, x => isImgNode(x));
      });
    });
  });

  describe('#setQqid', () => {
    it('should populate qqid after set', () => {
      return createIframePromise(false).then(fixture => {
        const win = fixture.win;
        const doc = fixture.doc;
        const elem = doc.createElement('div');
        doc.body.appendChild(elem);
        const reporter = new AmpAdLifecycleReporter(win, elem, 'test_foo');
        reporter.setPingAddress('/');
        expect(emitPingSpy).to.not.be.called;
        reporter.sendPing('buildUrl');
        expect(emitPingSpy).to.be.calledOnce;
        let arg = emitPingSpy.getCall(0).args[0];
        expect(arg).to.not.match(/qqid/);
        reporter.setQqid('zort');
        reporter.sendPing('renderViaIframe');
        expect(emitPingSpy).to.be.calledTwice;
        arg = emitPingSpy.getCall(1).args[0];
        expect(arg).to.match(/&qqid\.0=zort/);
      });
    });
  });
});
