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

import {MessageId} from '../messages';

describes.fakeWin('amp-story messages', {}, () => {
  describe('message IDs', () => {
    it('should have unique values', () => {
      // Transform message IDs from a map of keys to values to a multimap of
      // values to a list of keys that have that value.
      const messageIdKeys = Object.keys(MessageId);
      const valuesToKeys = messageIdKeys.reduce((freq, messageIdKey) => {
        const messageIdValue = MessageId[messageIdKey];
        if (!freq[messageIdValue]) {
          freq[messageIdValue] = [];
        }

        freq[messageIdValue].push(messageIdKey);
        return freq;
      }, {});

      // Assert that each of the lists of keys from the created multimap has
      // exactly one value.
      const messageIdValues = Object.keys(valuesToKeys);
      messageIdValues.forEach(value => {
        const keys = valuesToKeys[value];
        expect(keys, `${value} is never used in a message ID`)
            .to.not.be.empty;
        expect(keys).to.have
            .lengthOf(1, `${value} is used as a value for more than one ` +
                `message ID: ${keys}`);
      });
    });
  });
});

