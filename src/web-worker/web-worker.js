/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../../third_party/babel/custom-babel-helpers';
import {BindEvaluator} from '../../extensions/amp-bind/0.1/bind-evaluator';

let evaluator; // TODO(willchou)

self.addEventListener('message', function(event) {
  const {method, args, index} = event.data;

  let returnValue;

  switch (method) {
    case 'initialize':
      evaluator = new BindEvaluator();
      returnValue = evaluator.setBindings.apply(evaluator, args);
      break;

    case 'evaluate':
      returnValue = evaluator.evaluate.apply(evaluator, args);
      break;
  }

  self.postMessage({method, returnValue, index});
});
