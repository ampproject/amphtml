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

import {
  GoogleAdLifecycleReporter,
  BaseLifecycleReporter,
} from '../performance';
import {createIframePromise} from '../../../../testing/iframe';
import {viewerForDoc} from '../../../../src/services';
import {toArray} from '../../../../src/types';
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
 * Verify that `element` has at least one sibling DOM node that is an
 * `img` tag whose `src` matches all of the patterns in `matchList`.
 *
 * @param {!Element} element
 * @param {!Array<!RegExp>} matchList
 */
function expectHasSiblingImgMatchingAll(element, matchList) {
  const imgSiblings = toArray(element.parentElement.querySelectorAll('img'));
  expect(imgSiblings).to.not.be.empty;
  const result = imgSiblings.some(e => {
    const src = e.getAttribute('src');
    return matchList.map(m => m.test(src)).every(x => x);
  });
  expect(result, 'No element sibling of ' + element + ' matched all patterns')
      .to.be.true;
}

describe('BaseLifecycleReporter', () => {
  describes.fakeWin('', {}, env => {
    let doc;
    beforeEach(() => {
      doc = env.win.document;
    });

    it('should not modify the DOM', () => {
      expect(doc.querySelector('img')).not.to.be.ok;
      const reporter = new BaseLifecycleReporter();
      reporter.sendPing('foo');
      expect(doc.querySelector('img')).not.to.be.ok;
    });

    it('should store single parameters', () => {
      const reporter = new BaseLifecycleReporter();
      expect(reporter.extraVariables_).to.be.empty;
      reporter.setPingParameter('x', 3);
      reporter.setPingParameter('y', 'kumquat');
      expect(reporter.extraVariables_).to.deep.equal({
        x: '3',
        y: 'kumquat',
      });
    });

    it('should ignore null-ish parameter values', () => {
      const reporter = new BaseLifecycleReporter();
      expect(reporter.extraVariables_).to.be.empty;
      reporter.setPingParameter('x', null);
      reporter.setPingParameter('y', '');
      reporter.setPingParameter('z', undefined);
      expect(reporter.extraVariables_).to.be.empty;
    });
  });
});

describe('GoogleAdLifecycleReporter', () => {
  let sandbox;
  let emitPingSpy;
  let iframe;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    emitPingSpy = sandbox.spy(GoogleAdLifecycleReporter.prototype, 'emitPing_');
    iframe = createIframePromise(false).then(iframeFixture => {
      const win = iframeFixture.win;
      const doc = iframeFixture.doc;
      const viewer = viewerForDoc(doc);
      const elem = doc.createElement('div');
      doc.body.appendChild(elem);
      const reporter = new GoogleAdLifecycleReporter(
          win, elem, 'test_foo', 42);
      reporter.setPingAddress('/');
      reporter.setPingParameters({
        's': 'AD_SLOT_NAMESPACE',
        'rls': 'AMP_VERSION',
        'c': 'AD_PAGE_CORRELATOR',
        'it.AD_SLOT_ID': 'AD_SLOT_TIME_TO_EVENT',
        's_n_id': 'AD_SLOT_EVENT_NAME.AD_SLOT_EVENT_ID',
        'p_v': 'AD_PAGE_VISIBLE',
        'p_v1': 'AD_PAGE_FIRST_VISIBLE_TIME',
        'p_v2': 'AD_PAGE_LAST_VISIBLE_TIME',
      });
      return {win, doc, viewer, elem, reporter};
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('#sendPing', () => {
    it('should request a single ping and insert into DOM', () => {
      return iframe.then(({viewer, elem, reporter}) => {
        const iniTime = reporter.initTime_;
        sandbox.stub(viewer, 'getFirstVisibleTime', () => iniTime + 11);
        sandbox.stub(viewer, 'getLastVisibleTime', () => iniTime + 12);
        expect(emitPingSpy).to.not.be.called;
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          /[&?]s=test_foo(&|$)/,
          // In unit tests, internalRuntimeVersion is not substituted.  %24 ==
          // ASCII encoding of '$'.
          /[&?]rls=%24internalRuntimeVersion%24(&|$)/,
          /[&?]c=[0-9]+(&|$)/,
          /[&?]it.42=[0-9]+(&|$)/,
          /[&?]s_n_id=adRequestStart.2(&|$)/,
          /[&?]p_v=1(&|$)/,
          /[&?]p_v1=11(&|$)/,
          /[&?]p_v2=12(&|$)/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });

    it('should request multiple pings and write all to the DOM', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        const stages = {
          adSlotCleared: '-1',
          urlBuilt: '1',
          adRequestStart: '2',
          adRequestEnd: '3',
          extractCreativeAndSignature: '4',
          adResponseValidateStart: '5',
          renderFriendlyStart: '6',
          renderCrossDomainStart: '7',
          renderFriendlyEnd: '8',
          renderCrossDomainEnd: '9',
        };
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
            /[&?]s=test_foo(&|$)/,
            // In unit tests, internalRuntimeVersion is not substituted.  %24 ==
            // ASCII encoding of '$'.
            /[&?]rls=%24internalRuntimeVersion%24(&|$)/,
            /[&?]c=[0-9]+(&|$)/,
            /[&?]it.42=[0-9]+(&|$)/,
            RegExp(`[&?]s_n_id=${k}.${stages[k]}(&|$)`),
          ];
          const arg = emitPingSpy.getCall(count++).args[0];
          expectMatchesAll(arg, expectations);
          expectHasSiblingImgMatchingAll(elem, expectations);
        }
      });
    });

    it('should use diff slot IDs, but the same correlator', () => {
      return iframe.then(({win, doc, unusedElem, unusedReporter}) => {
        const stages = {
          adSlotBuilt: '0',
          adResponseValidateStart: '5',
          renderFriendlyStart: '6',
          renderCrossDomainStart: '7',
        };
        const nStages = 4;
        const allReporters = [];
        const nSlots = 20;
        for (let i = 0; i < nSlots; ++i) {
          const elem = doc.createElement('div');
          elem.setAttribute('id', i);
          doc.body.appendChild(elem);
          const reporter = new GoogleAdLifecycleReporter(win, elem, 'test_foo',
              i + 1);
          reporter.setPingAddress('/');
          reporter.setPingParameters({
            's': 'AD_SLOT_NAMESPACE',
            'c': 'AD_PAGE_CORRELATOR',
            'it.AD_SLOT_ID': 'AD_SLOT_TIME_TO_EVENT',
          });
          allReporters.push(reporter);
        }
        allReporters.forEach(r => {
          for (const k in stages) {
            r.sendPing(k);
          }
        });
        expect(emitPingSpy.callCount).to.equal(nSlots * nStages);
        const allImgNodes = toArray(doc.querySelectorAll('img'));
        expect(allImgNodes.length).to.equal(nSlots * nStages);
        let commonCorrelator;
        const slotCounts = {};
        allImgNodes.forEach(n => {
          const src = n.getAttribute('src');
          expect(src).to.match(/[?&]s=test_foo(&|$)/);
          expect(src).to.match(/[?&]c=[0-9]+/);
          const corr = /[?&]c=([0-9]+)/.exec(src)[1];
          commonCorrelator = commonCorrelator || corr;
          const slotId = /[?&]it.([0-9]+)=[0-9]+(&|$)/.exec(src)[1];
          expect(corr).to.equal(commonCorrelator);
          slotCounts[slotId] = slotCounts[slotId] || 0;
          ++slotCounts[slotId];
        });
        // SlotId 0 corresponds to unusedReporter, so ignore it.
        for (let s = 1; s <= nSlots; ++s) {
          expect(slotCounts[s], 'slotCounts[' + s + ']').to.equal(nStages);
        }
      });
    });
  });

  describe('#setPingParameter', () => {
    it('should pass through static ping variables', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameter('zort', 314159);
        reporter.setPingParameter('gack', 'flubble');
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          // Be sure that existing ping not deleted by args.
          /[&?]s=test_foo/,
          /zort=314159/,
          /gack=flubble/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });

    it('does not allow empty args', () => {
      return iframe.then(({unusedWin, unusedDoc, unusedElem, reporter}) => {
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameter('', '');
        reporter.setPingParameter('foo', '');
        reporter.setPingParameter('bar', null);
        reporter.setPingParameter('baz', undefined);
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        expect(arg).not.to.match(/\&=?\&/);
        expect(arg).not.to.match(/[&?]foo/);
        expect(arg).not.to.match(/[&?]bar/);
        expect(arg).not.to.match(/[&?]baz/);
      });
    });

    it('does allow value === 0', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameter('foo', 0);
        reporter.setPingParameter('bar', 0.0);
        reporter.setPingParameter('baz', -0);
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          /foo=0/,
          /bar=0/,
          /baz=0/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });

    it('should uri encode extra params', () => {
      return iframe.then(({unusedWin, unusedDoc, unusedElem, reporter}) => {
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameter('evil',
            '<script src="https://evil.com">doEvil()</script>');
        reporter.setPingParameter(
            '<script src="https://very.evil.com">doMoreEvil()</script>', 3);
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        expect(arg).not.to.have.string(
            '<script src="https://evil.com">doEvil()</script>');
        expect(arg).to.have.string('&evil=' + encodeURIComponent(
                '<script src="https://evil.com">doEvil()</script>'));
        expect(arg).not.to.have.string(
            '<script src="https://very.evil.com">doMoreEvil()</script>');
        expect(arg).to.have.string('&' + encodeURIComponent(
                '<script src="https://very.evil.com">doMoreEvil()</script>') +
            '=3');
      });
    });

    it('should expand URL parameters in extra params', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameter('zort', 'RANDOM');
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          // Be sure that existing ping not deleted by args.
          /[&?]s=test_foo/,
          /zort=[0-9.]+/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });
  });

  describe('#setPingParameters', () => {
    it('should do nothing on an an empty input', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        const setPingParameterSpy = sandbox.spy(reporter, 'setPingParameter');
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameters({});
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        expect(setPingParameterSpy).not.to.be.called;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          // Be sure that existing ping not deleted by args.
          /[&?]s=test_foo/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });

    it('should set a singleton input', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        const setPingParameterSpy = sandbox.spy(reporter, 'setPingParameter');
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameters({zort: '12345'});
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        expect(setPingParameterSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          // Be sure that existing ping not deleted by args.
          /[&?]s=test_foo/,
          /zort=12345/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });

    it('should set multiple inputs', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        const setPingParameterSpy = sandbox.spy(reporter, 'setPingParameter');
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingParameters({zort: '12345', gax: 99, flub: 0});
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        expect(setPingParameterSpy).to.be.calledThrice;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          // Be sure that existing ping not deleted by args.
          /[&?]s=test_foo/,
          /zort=12345/,
          /gax=99/,
          /flub=0/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });
  });
});
