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

let evaluator;

self.addEventListener('message', function(event) {
  const data = event.data;
  switch (data.method) {
    case 'initialize':
      evaluator = new BindEvaluator();
      const parseErrors = evaluator.setBindings(data.args);
      self.postMessage({method: data.method, parseErrors});
      break;

    case 'evaluate':
      const scope = data.args;
      const {results, errors} = evaluator.evaluate(scope);
      self.postMessage({method: data.method, results, errors});
      break;
  }
});
