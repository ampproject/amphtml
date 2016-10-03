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
import {EXPERIMENT_ATTRIBUTE} from '../traffic-experiments';
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

// From
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions
/**
 * Escape a string for use as a literal inside a regular expression.
 * @param {!string} string
 * @returns {!string}
 * @private
 */
function escapeRegExp_(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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
          /[&?]s=test_foo/,
          // In unit tests, internalRuntimeVersion is not substituted.
          /[&?]rls=\$internalRuntimeVersion\$/,
          /[&?]c=[0-9]+/,
          /[&?]it=[^&?]*onLayoutMeasure\.[0-9]+/,
          /[&?]it=[^&?]*onLayoutMeasure_0\.[0-9]+/,
          /[&?]rt=stage\.1+/,
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
            /[&?]s=test_foo/,
            // In unit tests, internalRuntimeVersion is not substituted.
            /[&?]rls=\$internalRuntimeVersion\$/,
            /[&?]c=[0-9]+/,
            new RegExp(`[&?]it=[^&?]*${k}\.[0-9]+`),
            new RegExp(`[&?]it=[^&?]*${k}_0\.[0-9]+`),
            new RegExp(`[&?]rt=stage\.${stages[k]}`),
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
        const nStages = 3;
        const allReporters = [];
        const nSlots = 20;
        for (let i = 0; i < nSlots; ++i) {
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
        expect(emitPingSpy.callCount).to.equal(nSlots * nStages);
        const allImgNodes = childElements(doc.body, x => isImgNode(x));
        expect(allImgNodes.length).to.equal(nSlots * nStages);
        let commonCorrelator = null;
        const slotCounts = {};
        allImgNodes.forEach(n => {
          const src = n.getAttribute('src');
          expect(src).to.match(/[?&]s=test_foo/);
          const corr = /[?&]c=([0-9]+)/.exec(src)[1];
          const slotId = /[?&]rt=[^&?]*slotId\.([0-9]+)[&?,]/.exec(src)[1];
          commonCorrelator = commonCorrelator || corr;
          expect(corr).to.equal(commonCorrelator);
          slotCounts[slotId] = slotCounts[slotId] || 0;
          ++slotCounts[slotId];
        });
        for (let s = 0; s < nSlots; ++s) {
          expect(slotCounts[s], 'slotCounts[' + s + ']').to.equal(nStages);
        }
      });
    });

    it('should capture eid', () => {
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
        // No e= param when no EID is present on element.
        expect(arg).to.not.match(/[&?]e=/);
        const elem2 = doc.createElement('div');
        elem2.setAttribute(EXPERIMENT_ATTRIBUTE, '123456');
        doc.body.appendChild(elem2);
        const reporter2 = new AmpAdLifecycleReporter(win, elem2, 'test_foo');
        reporter2.setPingAddress('/');
        reporter2.sendPing('onLayoutMeasure');
        expect(emitPingSpy).to.be.calledTwice;
        const arg2 = emitPingSpy.getCall(1).args[0];
        // Now there should be an e= param.
        expect(arg2).to.match(/[&?]e=123456/);
      });
    });

    it('eid should be URL encoded', () => {
      return createIframePromise(false).then(fixture => {
        const win = fixture.win;
        const doc = fixture.doc;
        const elem = doc.createElement('div');
        // The following string is deliberately a script URL to test that
        // the ping system correctly URL encodes such strings.
        /* eslint-disable no-script-url */
        const rawEid =
            'javascript:{doSomethingHeinous("https://malware.central.com");}';
        /* eslint-enable no-script-url */
        elem.setAttribute(EXPERIMENT_ATTRIBUTE, rawEid);
        doc.body.appendChild(elem);
        const reporter = new AmpAdLifecycleReporter(win, elem, 'test_foo');
        reporter.setPingAddress('/');
        expect(emitPingSpy).to.not.be.called;
        reporter.sendPing('onLayoutMeasure');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const encodedEid = encodeURIComponent(rawEid);
        expect(arg).to.match(new RegExp(`[&?]e=${escapeRegExp_(encodedEid)}`));
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

    it('qqid should be url encoded', () => {
      return createIframePromise(false).then(fixture => {
        const win = fixture.win;
        const doc = fixture.doc;
        const elem = doc.createElement('div');
        doc.body.appendChild(elem);
        const reporter = new AmpAdLifecycleReporter(win, elem, 'test_foo');
        reporter.setPingAddress('/');
        expect(emitPingSpy).to.not.be.called;
        // The following string is deliberately a script URL to test that
        // the ping system correctly URL encodes such strings.
        /* eslint-disable no-script-url */
        const rawQqid =
            'javascript:{doSomethingHeinous("https://malware.central.com");}';
        /* eslint-enable no-script-url */
        const encodedQqid = encodeURIComponent(rawQqid);
        reporter.setQqid(rawQqid);
        reporter.sendPing('renderViaIframe');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        expect(arg).to.match(
            new RegExp(`[&?]qqid\.0=${escapeRegExp_(encodedQqid)}`));
      });
    });
  });
});
