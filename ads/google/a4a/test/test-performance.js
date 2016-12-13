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
  getLifecycleReporter,
} from '../performance';
import {EXPERIMENT_ATTRIBUTE} from '../utils';
import {childElements} from '../../../../src/dom';
import {createIframePromise} from '../../../../testing/iframe';
import {
    ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
    ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES,
} from '../../../../extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config';  // eslint-disable-line max-len
import {
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES,
} from '../../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config';  // eslint-disable-line max-len
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

/**
 * Construct a lifecycle reporter for an element with a given eid in one of
 * the reporting namespaces.  If eid is not specified, creates an element with
 * no eid.
 * @param {string} namespace
 * @param {string} ad type
 * @param {string=} opt_eid
 * @returns {*}
 */
function buildElementWithEid(namespace, type, opt_eid) {
  return createIframePromise(false).then(iframeFixture => {
    const win = iframeFixture.win;
    const doc = iframeFixture.doc;
    const elem = doc.createElement('div');
    elem.setAttribute('type', type);
    if (opt_eid) {
      elem.setAttribute(EXPERIMENT_ATTRIBUTE, opt_eid);
    }
    doc.body.appendChild(elem);
    const pseudoAmpElement = {
      win,
      element: elem,
    };
    return getLifecycleReporter(pseudoAmpElement, namespace, 0, 0);
  });
}

describe('#getLifecycleReporter', () => {
  const EXPERIMENT_BRANCH_EIDS = [
    ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment,
    ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.experiment,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES.experiment,
    '117152632',
  ];
  const CONTROL_BRANCH_EIDS = [
    ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control,
    ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.control,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES.control,
  ];

  ['adsense', 'doubleclick'].forEach(type => {
    describe(`type = ${type}`, () => {
      EXPERIMENT_BRANCH_EIDS.forEach(eid => {
        it(`should return real reporter for a4a eid = ${eid}`, () => {
          return buildElementWithEid('a4a', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(GoogleAdLifecycleReporter);
          });
        });

        it(`should return a null reporter for amp eid = ${eid}`, () => {
          return buildElementWithEid('amp', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
          });
        });

        it(`should return null reporter for bogus namespace eid = ${eid}`,
            () => {
              return buildElementWithEid('fnord', type, eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });

        it(`should return null reporter for non-Google ad, eid = ${eid}`,
            () => {
              return buildElementWithEid('a4a', 'a9', eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });
      });

      CONTROL_BRANCH_EIDS.forEach(eid => {
        it(`should return null reporter for a4a eid = ${eid}`, () => {
          return buildElementWithEid('a4a', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
          });
        });

        it(`should return a real reporter for amp eid = ${eid}`, () => {
          return buildElementWithEid('amp', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(GoogleAdLifecycleReporter);
          });
        });

        it(`should return null reporter for bogus namespace eid = ${eid}`,
            () => {
              return buildElementWithEid('fnord', type, eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });

        it(`should return null reporter for non-Google ad, eid = ${eid}`,
            () => {
              return buildElementWithEid('amp', 'a9', eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });
      });

      for (const namespace in ['a4a', 'amp']) {
        it(`should return null reporter for ${namespace} and no eid`, () => {
          return buildElementWithEid(namespace, type).then(reporter => {
            expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
          });
        });
      }
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
      const elem = doc.createElement('div');
      doc.body.appendChild(elem);
      const reporter = new GoogleAdLifecycleReporter(
          win, elem, 'test_foo', 0, 0);
      reporter.setPingAddress('/');
      return {win, doc, elem, reporter};
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('#sendPing', () => {
    it('should request a single ping and insert into DOM', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        expect(emitPingSpy).to.not.be.called;
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        const arg = emitPingSpy.getCall(0).args[0];
        const expectations = [
          /[&?]s=test_foo/,
          // In unit tests, internalRuntimeVersion is not substituted.
          /[&?]rls=\$internalRuntimeVersion\$/,
          /[&?]c=[0-9]+/,
          /[&?]it=[^&?]*adRequestStart\.[0-9]+/,
          /[&?]it=[^&?]*adRequestStart_0\.[0-9]+/,
          /[&?]rt=stage\.2+/,
        ];
        expectMatchesAll(arg, expectations);
        expectHasSiblingImgMatchingAll(elem, expectations);
      });
    });

    it('should request multiple pings and write all to the DOM', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        const stages = {
          urlBuilt: '1',
          adRequestStart: '2',
          adRequestEnd: '3',
          extractCreativeAndSignature: '4',
          adResponseValidateStart: '5',
          renderFriendlyStart: '6',
          renderCrossDomainStart: '7',
          renderFriendlyEnd: '8',
          renderCrossDomainEnd: '9',
          adSlotCleared: '20',
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
              1, i + 1);
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
        const commonCorrelator = '1';
        const slotCounts = {};
        allImgNodes.forEach(n => {
          const src = n.getAttribute('src');
          expect(src).to.match(/[?&]s=test_foo/);
          const corr = /[?&]c=([0-9]+)/.exec(src)[1];
          const slotId = /[?&]rt=[^&?]*slotId\.([0-9]+)[&?,]/.exec(src)[1];
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

  describe('#setPingVariable', () => {
    it('should pass through static ping variables', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingVariable('zort', 314159);
        reporter.setPingVariable('gack', 'flubble');
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
        reporter.setPingVariable('', '');
        reporter.setPingVariable('foo', '');
        reporter.setPingVariable('bar', null);
        reporter.setPingVariable('baz', undefined);
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
        reporter.setPingVariable('foo', 0);
        reporter.setPingVariable('bar', 0.0);
        reporter.setPingVariable('baz', -0);
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
        reporter.setPingVariable('evil',
            '<script src="https://evil.com">doEvil()</script>');
        reporter.setPingVariable(
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
        reporter.setPingVariable('zort', 'RANDOM');
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

  describe('#setPingVariables', () => {
    it('should do nothing on an an empty input', () => {
      return iframe.then(({unusedWin, unusedDoc, elem, reporter}) => {
        const setPingVariableSpy = sandbox.spy(reporter, 'setPingVariable');
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingVariables({});
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        expect(setPingVariableSpy).not.to.be.called;
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
        const setPingVariableSpy = sandbox.spy(reporter, 'setPingVariable');
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingVariables({zort: '12345'});
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        expect(setPingVariableSpy).to.be.calledOnce;
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
        const setPingVariableSpy = sandbox.spy(reporter, 'setPingVariable');
        expect(emitPingSpy).to.not.be.called;
        reporter.setPingVariables({zort: '12345', gax: 99, flub: 0});
        reporter.sendPing('adRequestStart');
        expect(emitPingSpy).to.be.calledOnce;
        expect(setPingVariableSpy).to.be.calledThrice;
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
