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


import {BatchingPluginFunctions} from '../batching-plugins';
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
 *   'out': Array<string>
 * }
 */
const pingTestData = {
  'in': [{
    'baseUrl': 'base.com?',
    'batchSegments': [{
      'trigger': 'click',
      'timestamp': 0,
      'extraUrlParams': 123,
    }],
  }],
  'out': ['testFinalUrl'],
};

/**
 * Please register your custom test data to the test in alphabetic order.
 */
const BatchingPluginTests = {
  '_ping_': pingTestData,
};

/**
 * Real test. Plugin vendors don't need to modify
 */
describe('Batching Plugins', () => {
  it('BatchPluginFunctions sort in alphabetic order', () => {
    const keys = Object.keys(BatchingPluginFunctions);
    const sorted = Object.keys(BatchingPluginFunctions).sort();
    expect(keys).to.deep.equal(sorted);
  });

  for (const name in BatchingPluginFunctions) {
    const plugin = BatchingPluginFunctions[name];
    describe('Default tests for every plugin', () => {
      it('should handle empty batchSegment array', () => {
        try {
          const output = plugin('base', []);
          expect(output).to.be.ok;
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
          const output = plugin('base', [batchSegment]);
          expect(output).to.be.ok;
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
          const output = plugin('base', [batchSegment]);
          expect(output).to.not.contain('12?3');
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
          const output = plugin('base', [batchSegment]);
          expect(typeof output).to.equal('string');
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
        testData = BatchingPluginTests[name];
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
          const baseUrl = input[i].baseUrl;
          expect(baseUrl).to.be.ok;
          const batchSegments = input[i].batchSegments;
          expect(batchSegments).to.be.ok;
          expect(isArray(batchSegments)).to.be.true;
          const url = output[i];
          expect(plugin(baseUrl, batchSegments)).to.equal(url);
        }
      });
    });
  }
});
