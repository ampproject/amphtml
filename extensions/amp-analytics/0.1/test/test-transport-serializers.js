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

import {TransportSerializers} from '../transport-serializer';
import {dict} from '../../../../src/utils/object';
import {isArray} from '../../../../src/types';

/**
 * Please add your custom test data here in alphabetic order.
 * Test data should be an object like
 * {
 *   'in': Array<{
 *      'baseUrl': string,
 *      'batchSegments': Array<batchSegmentDef>
 *    }>
 *   'out': Array<{
 *     'generateRequest': BatchSegmentDef,
 *     'generateBatchRequest': BatchSegmentDef,
 *     'generateRequestWithPayload': BatchSegmentDef,
 *     'generateBatchRequestWithPayload': BatchSegmentDef,
 *   }>
 * }
 */
const defaultTestData = {
  'in': [
    {
      'baseUrl': 'https://base.com',
      'batchSegments': [
        {
          'trigger': 'click',
          'timestamp': 0,
          'extraUrlParams': {
            a: 1,
            b: 'xyz',
          },
        },
      ],
    },
    {
      'baseUrl': 'https://base.com?${extraUrlParams}&z=1',
      'batchSegments': [
        {
          'trigger': 'click',
          'timestamp': 0,
          'extraUrlParams': {
            a: 1,
            b: 'xyz',
          },
        },
      ],
    },
  ],

  'out': [
    {
      generateRequest: {
        url: 'https://base.com?a=1&b=xyz',
      },
      generateBatchRequest: {
        url: 'https://base.com?a=1&b=xyz',
      },
      generateRequestWithPayload: {
        url: 'https://base.com',
        payload: '{"a":1,"b":"xyz"}',
      },
      generateBatchRequestWithPayload: {
        url: 'https://base.com',
        payload: '[{"a":1,"b":"xyz"}]',
      },
    },
    {
      generateRequest: {
        url: 'https://base.com?a=1&b=xyz&z=1',
      },
      generateBatchRequest: {
        url: 'https://base.com?a=1&b=xyz&z=1',
      },
      generateRequestWithPayload: {
        url: 'https://base.com?&z=1',
        payload: '{"a":1,"b":"xyz"}',
      },
      generateBatchRequestWithPayload: {
        url: 'https://base.com?&z=1',
        payload: '[{"a":1,"b":"xyz"}]',
      },
    },
  ],
};

/**
 * Please register your custom test data to the test in alphabetic order.
 */
const SerializerTests = {
  'default': defaultTestData,
};

/**
 * Real test. Plugin vendors don't need to modify
 */
describe('Transport serializers', () => {
  it('TransportSerializers sort in alphabetic order', () => {
    const keys = Object.keys(TransportSerializers);
    const sorted = Object.keys(TransportSerializers).sort();
    expect(keys).to.deep.equal(sorted);
  });

  for (const name in TransportSerializers) {
    const serializer = TransportSerializers[name];
    describe('Default tests for every serializer', () => {
      it('should handle empty batchSegment array', () => {
        try {
          const output = serializer.generateBatchRequest('base', []);
          expect(output.url).to.be.ok;
        } catch (e) {
          throw e;
        }
      });

      it('should handler extraUrlParams with value null', () => {
        const batchSegment = dict({
          'trigger': 'click',
          'timestamp': 0,
          'extraUrlParams': null,
        });
        try {
          const output = serializer.generateBatchRequest('base', [
            batchSegment,
          ]);
          expect(output.url).to.be.ok;
        } catch (e) {
          throw e;
        }
      });

      it('should properly encode segments', () => {
        const batchSegment = dict({
          'trigger': 'click',
          'timestamp': 0,
          'extraUrlParams': '12?3',
        });
        try {
          const output = serializer.generateBatchRequest('base', [
            batchSegment,
          ]);
          expect(output.url).to.not.contain('12?3');
        } catch (e) {
          throw e;
        }
      });

      it('should return a string', () => {
        const batchSegment = dict({
          'trigger': 'click',
          'timestamp': 0,
          'extraUrlParams': '123',
        });
        try {
          const output = serializer.generateBatchRequest('base', [
            batchSegment,
          ]);
          expect(typeof output.url).to.equal('string');
        } catch (e) {
          throw e;
        }
      });
    });

    describe('custom test', () => {
      let testData;
      let input;
      let output;

      beforeEach(() => {
        testData = SerializerTests[name];
        input = testData['in'];
        output = testData['out'];
      });

      it('has custom test', () => {
        expect(testData).to.be.ok;
        expect(input).to.be.ok;
        expect(output).to.be.ok;
        expect(isArray(input)).to.be.true;
        expect(isArray(output)).to.be.true;
        expect(input.length).to.be.greaterThan(0);
        expect(output.length).to.be.greaterThan(0);
        expect(input.length).to.equal(output.length);
      });

      it('run custom test', () => {
        for (let i = 0; i < input.length; i++) {
          const {baseUrl} = input[i];
          expect(baseUrl).to.be.ok;
          const {batchSegments} = input[i];
          expect(batchSegments).to.be.ok;
          expect(isArray(batchSegments)).to.be.true;
          const request = output[i];
          expect(
            serializer.generateRequest(baseUrl, batchSegments[0])
          ).to.jsonEqual(request.generateRequest);
          expect(
            serializer.generateRequest(baseUrl, batchSegments[0], true)
          ).to.jsonEqual(request.generateRequestWithPayload);
          expect(
            serializer.generateBatchRequest(baseUrl, batchSegments)
          ).to.jsonEqual(request.generateRequest);
          expect(
            serializer.generateBatchRequest(baseUrl, batchSegments, true)
          ).to.jsonEqual(request.generateBatchRequestWithPayload);
        }
      });
    });
  }
});
