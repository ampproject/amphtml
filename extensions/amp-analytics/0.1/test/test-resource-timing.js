/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {installVariableService} from '../variables';
import {serializeResourceTiming} from '../resource-timing';

/**
 * Returns a new, pre-filled resourceTimingSpec.
 * @return {!JsonObject}
 */
export function newResourceTimingSpec() {
  return {
    'resources': {
      'foo_bar': {
        'host': '(foo|bar).example.com',
        'path': '/lib.js',
      },
      'foo_style': {
        'host': 'example.com',
        'path': '.*.css',
      },
    },
    'encoding': {
      'entry':
          '${key}-${initiatorType}-${startTime}-${duration}-${transferSize}',
      'delim': '~',
    },
  };
}

/**
 * Returns a sample PerformanceResourceTiming entry. Timing intervals are fixed
 * fractions of the total duration. For example, domainLookupTime will be a
 * tenth of the duration if cached = false.
 * @param {string} url
 * @param {string} initiatorType
 * @param {number} startTime
 * @param {number} duration
 * @param {number} bodySize
 * @param {boolean} cached;
 * @return {!JsonObject}
 */
export function newPerformanceResourceTiming(
  url, initiatorType, startTime, duration, bodySize, cached) {
  const dnsTime = cached ? 0 : duration * 0.1;
  const tcpTime = cached ? 0 : duration * 0.2;
  const serverTime = cached ? duration : duration * 0.4;
  const transferTime = cached ? 0 : duration * 0.3;
  return {
    name: url,
    initiatorType,
    startTime,
    duration,
    redirectStart: 0,
    redirectEnd: 0,
    domainLookupStart: startTime,
    domainLookupEnd: startTime + dnsTime,
    connectStart: startTime + dnsTime,
    connectEnd: startTime + dnsTime + tcpTime,
    requestStart: startTime + dnsTime + tcpTime,
    responseStart: startTime + dnsTime + tcpTime + serverTime,
    responseEnd: startTime + dnsTime + tcpTime + serverTime + transferTime,
    decodedBodySize: bodySize,
    encodedBodySize: bodySize * 0.7,
    transferSize: cached ? 0 : bodySize * 0.7 + 200, // +200 for header size
  };
}

describes.fakeWin('resourceTiming', {amp: true}, env => {
  let win;

  /**
   * @param {!Array<!PerformanceResourceTiming} fakeEntries
   * @param {!JsonObject} resourceTimingSpec
   * @param {string} expectedResult
   * @return {!Promise<undefined>}
   */
  const runSerializeTest = function(
    fakeEntries, resourceTimingSpec, expectedResult) {
    sandbox.stub(win.performance, 'getEntriesByType').returns(fakeEntries);
    return serializeResourceTiming(resourceTimingSpec, win).then(result => {
      expect(result).to.equal(expectedResult);
    });
  };

  beforeEach(() => {
    win = env.win;
    win.performance = window.performance;
    installVariableService(win);
  });

  it('should return empty if the performance API is not supported', () => {
    const fakeWin = {};
    return serializeResourceTiming(newResourceTimingSpec(), fakeWin)
        .then(result => {
          expect(result).to.equal('');
        });
  });

  it('should return empty when resource timing is not supported', () => {
    // Performance API (fakeWin.performance)  oesn't support resource timing.
    const fakeWin = {performance: {}};
    return serializeResourceTiming(newResourceTimingSpec(), fakeWin)
        .then(result => {
          expect(result).to.equal('');
        });
  });

  it('should return empty if resourceTimingSpec is empty', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    return runSerializeTest([entry], {}, '');
  });

  it('should return empty if encoding spec is empty', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    delete spec['encoding'];
    return runSerializeTest([entry], spec, '');
  });

  it('should return empty if encoding spec is missing delim', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    delete spec['encoding']['delim'];
    return runSerializeTest([entry], spec, '');
  });

  it('should return empty if encoding spec is missing entry', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    delete spec['encoding']['entry'];
    return runSerializeTest([entry], spec, '');
  });

  it('should serialize matching entries', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    const expect = 'foo_bar-script-100-500-7200';
    return runSerializeTest([entry], spec, expect);
  });

  it('should serialize multiple matching entries', () => {
    const entry1 = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    const entry2 = newPerformanceResourceTiming(
        'http://bar.example.com/lib.js', 'script', 700, 100, 80 * 1000, true);
    return runSerializeTest(
        [entry1, entry2], newResourceTimingSpec(),
        'foo_bar-script-100-500-7200~foo_bar-script-700-100-0');
  });

  it('should match against the first spec', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);

    const spec = newResourceTimingSpec();
    // Note that both spec'd resources match.
    spec.resources = {
      'foo_bar': {
        'host': '(foo|bar).example.com',
        'path': '/lib.js',
      },
      'any': {},
    };

    return runSerializeTest([entry], spec, 'foo_bar-script-100-500-7200');
  });

  it('should accept empty per-resource specs', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);

    const spec = newResourceTimingSpec();
    // Note that both spec'd resources match.
    spec.resources = {
      'any': {},
      'foo_bar': {
        'host': '(foo|bar).example.com',
        'path': '/lib.js',
      },
    };

    return runSerializeTest([entry], spec, 'any-script-100-500-7200');
  });

  it('should should only report resources if the host matches', () => {
    const entry1 = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js', 'script', 100, 500, 10 * 1000, false);
    const entry2 = newPerformanceResourceTiming(
        'http://baz.example.com/lib.js', 'script', 700, 100, 80 * 1000, true);

    const spec = newResourceTimingSpec();
    spec.resources = {'foo': {'host': 'foo.example.com'}};
    return runSerializeTest([entry1, entry2], spec, 'foo-script-100-500-7200');
  });

  it('should should only report resources if the path matches', () => {
    const entry1 = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js', 'script', 100, 500, 10 * 1000, false);
    const entry2 = newPerformanceResourceTiming(
        'http://foo.example.com/extra.js', 'script', 700, 100, 80 * 1000, true);

    const spec = newResourceTimingSpec();
    spec.resources = {
      'foo': {'host': 'foo.example.com', 'path': 'lib.js'},
    };
    return runSerializeTest([entry1, entry2], spec, 'foo-script-100-500-7200');
  });

  it('should should only report resources if the query matches', () => {
    const entry1 = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=200', 'script', 100, 500, 10 * 1000,
        false);
    const entry2 = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=test', 'script', 700, 100, 80 * 1000,
        true);

    const spec = newResourceTimingSpec();
    spec.resources = {
      'foo': {
        'host': 'foo.example.com',
        'path': 'lib.js',
        'query': '^\\?v=\\d+',
      },
    };
    return runSerializeTest([entry1, entry2], spec, 'foo-script-100-500-7200');
  });

  it('should replace ${key} and ${initiatorType}', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/style.css?v=200', 'link', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${key}.${initiatorType}';
    return runSerializeTest([entry], spec, 'foo_style.link');
  });

  it('should replace ${startTime} and ${duration}', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/style.css?v=200', 'link', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${startTime}.${duration}';
    return runSerializeTest([entry], spec, '100.500');
  });

  it('should replace ${domainLookupTime} and ${tcpConnectTime}', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/style.css?v=200', 'link', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${domainLookupTime}.${tcpConnectTime}';
    return runSerializeTest([entry], spec, '50.100');
  });

  it('should replace ${serverResponseTime} and ${networkTransferTime}', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/style.css?v=200', 'link', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${serverResponseTime}.${networkTransferTime}';
    return runSerializeTest([entry], spec, '200.150');
  });

  it('should replace ${transferSize}, ${encodedBodySize}, ${decodedBodySize}',
      () => {
        const entry = newPerformanceResourceTiming(
            'http://foo.example.com/style.css?v=200', 'link', 100, 500,
            10 * 1000, false);
        const spec = newResourceTimingSpec();
        spec['encoding']['entry'] =
           '${transferSize}.${encodedBodySize}.${decodedBodySize}';
        return runSerializeTest([entry], spec, '7200.7000.10000');
      });

  it('should use the base specified in encoding', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/style.css?v=200', 'link', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${decodedBodySize}';
    spec['encoding']['base'] = 36;
    // 10,000 in base 36 is '7ps'.
    return runSerializeTest([entry], spec, '7ps');
  });

  it('should reject invalid bases (over 36)', () => {
    const entry = newPerformanceResourceTiming(
        'http://foo.example.com/style.css?v=200', 'link', 100, 500, 10 * 1000,
        false);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${decodedBodySize}';
    spec['encoding']['base'] = 40;
    return runSerializeTest([entry], spec, '');
  });

  it('should not replace other analytics variables', () => {
    const entry1 = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    const entry2 = newPerformanceResourceTiming(
        'http://bar.example.com/lib.js', 'script', 700, 100, 80 * 1000, true);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${startTime}.${random}.${undefinedVariable}';
    // The counter is incremented for each entry.
    return runSerializeTest([entry1, entry2], spec, '100..~700..');
  });

  it('should URL-encode the results', () => {
    const entry1 = newPerformanceResourceTiming(
        'http://foo.example.com/lib.js?v=123', 'script', 100, 500, 10 * 1000,
        false);
    const entry2 = newPerformanceResourceTiming(
        'http://bar.example.com/lib.js', 'script', 700, 100, 80 * 1000, true);
    const spec = newResourceTimingSpec();
    spec['encoding']['entry'] = '${key}?${startTime},${duration}';
    spec['encoding']['delim'] = ':';
    return runSerializeTest(
        [entry1, entry2], spec, 'foo_bar?100,500:foo_bar?700,100');
  });
});
