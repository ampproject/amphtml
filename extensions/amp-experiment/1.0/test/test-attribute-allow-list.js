/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  AllowedAttributeMutationEntry,
  DefaultStyleAllowedAttributeMutationEntry,
} from '../attribute-allow-list/allowed-attribute-mutation-entry';
import {
  attributeMutationAllowList,
  getAllowedAttributeMutationEntry,
} from '../attribute-allow-list/attribute-allow-list';

const MUTATION_NAME = 'TEST-MUTATION';

const ORIGINAL_ALLOW_LIST = {
  ...attributeMutationAllowList,
};

describes.realWin('amp-experiment attribute-allow-list', {}, () => {
  function getAttributeMutation(opt_attributeName, opt_value) {
    return {
      type: 'attributes',
      targetElement: {
        tagName: 'DIV',
      },
      attributeName: opt_attributeName || 'style',
      value: opt_value || 'color: #FF0000',
    };
  }

  class FakeAllowedAttributeMutationEntry extends AllowedAttributeMutationEntry {}

  afterEach(() => {
    // Reset the attributeMutationAllowList for other tests
    Object.assign(attributeMutationAllowList, ORIGINAL_ALLOW_LIST);
  });

  it('should allow a valid attribute, value', () => {
    const allowedAttributeMutationEntry = getAllowedAttributeMutationEntry(
      getAttributeMutation(),
      MUTATION_NAME
    );

    expect(allowedAttributeMutationEntry).to.be.ok;
    expect(allowedAttributeMutationEntry).to.be.instanceOf(
      DefaultStyleAllowedAttributeMutationEntry
    );
  });

  it('should travese by attributeName', () => {
    const testAttributeName = 'test';
    attributeMutationAllowList[testAttributeName] = {
      '*': new AllowedAttributeMutationEntry(),
    };

    const allowedAttributeMutationEntry = getAllowedAttributeMutationEntry(
      getAttributeMutation(testAttributeName),
      MUTATION_NAME
    );

    expect(allowedAttributeMutationEntry).to.be.ok;
    expect(allowedAttributeMutationEntry).to.be.instanceOf(
      AllowedAttributeMutationEntry
    );
  });

  it('should traverse by tagName', () => {
    const testAttributeName = 'style';
    attributeMutationAllowList[testAttributeName] = {
      'div': new AllowedAttributeMutationEntry(),
    };

    const allowedAttributeMutationEntry = getAllowedAttributeMutationEntry(
      getAttributeMutation(testAttributeName),
      MUTATION_NAME
    );

    expect(allowedAttributeMutationEntry).to.be.ok;
    expect(allowedAttributeMutationEntry).to.be.instanceOf(
      AllowedAttributeMutationEntry
    );
  });

  it('should return the assigned attributeMutationEntry type', () => {
    const testAttributeName = 'test';
    attributeMutationAllowList[testAttributeName] = {
      '*': new FakeAllowedAttributeMutationEntry(),
    };

    const allowedAttributeMutationEntry = getAllowedAttributeMutationEntry(
      getAttributeMutation(testAttributeName),
      MUTATION_NAME
    );

    expect(allowedAttributeMutationEntry).to.be.ok;
    expect(allowedAttributeMutationEntry).to.be.instanceOf(
      FakeAllowedAttributeMutationEntry
    );
  });

  it('should not allow unsupported attributeName', () => {
    const testAttributeName = 'test-invalid';
    attributeMutationAllowList['test'] = {
      '*': new AllowedAttributeMutationEntry(),
    };

    expectAsyncConsoleError(/attributeName/);
    try {
      getAllowedAttributeMutationEntry(
        getAttributeMutation(testAttributeName),
        MUTATION_NAME
      );
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).to.match(/attributeName/);
    }
  });

  it('should not allow unsupported tagName', () => {
    const testAttributeName = 'test';
    attributeMutationAllowList[testAttributeName] = {
      'invalid': new AllowedAttributeMutationEntry(),
    };

    expectAsyncConsoleError(/attributeName/);
    try {
      getAllowedAttributeMutationEntry(
        getAttributeMutation(testAttributeName),
        MUTATION_NAME
      );
      expect(false).to.be.ok;
    } catch (e) {
      expect(e.message).to.match(/attributeName/);
    }
  });
});
