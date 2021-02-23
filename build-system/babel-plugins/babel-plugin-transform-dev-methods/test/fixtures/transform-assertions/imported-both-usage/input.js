/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {dev, user} from '../../../../../../../src/log';

dev().info(
  TAG,
  'Removing iframe query string before navigation:',
  fromLocation.search
);
dev().info;
user().fine(TAG, 'fine');
user().fine;
user().info('Should not be removed');

function hello() {
  dev().info(
    TAG,
    'Removing iframe query string before navigation:',
    fromLocation.search
  );
  dev().fine(TAG, 'fine');
  user().fine(TAG, 'fine');
  user().info('Should be removed');
  user().error('Should not be removed');
  return false;
}

export function helloAgain() {
  dev().info(
    TAG,
    'Removing iframe query string before navigation:',
    fromLocation.search
  );
  dev().fine(TAG, 'fine');
  user().warn(TAG, 'warn');
  user().error('Should not be removed');
  return false;
}

class Foo {
  method() {
    dev().info(
      TAG,
      'Removing iframe query string before navigation:',
      fromLocation.search
    );
    dev().fine(TAG, 'fine');
    user().fine(TAG, 'fine');
    dev().error(TAG, 'Should not be removed');
    user().error('Should not be removed');
  }
}