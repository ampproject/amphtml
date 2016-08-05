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

import '../../../../third_party/babel/custom-babel-helpers';
import '../../../../src/polyfills';
import {App} from './app';
import {CastChannelDebug, CastChannelProd} from './cast-channel';
import {onDocumentReady} from '../../../../src/document-ready';
import {initLog, log} from './cast-log';

const VERSION = '0.1';


onDocumentReady(window.document, () => {
  const debug = true;
  const win = window;
  initLog(true);
  log('Started ' + VERSION);
  const channel = debug ?
      new CastChannelDebug(win) :
      new CastChannelProd(win);
  const app = new App(win, channel);
  window.app = app;
});
