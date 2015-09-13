/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

require('./polyfills');

import {installAd} from './amp-ad';
import {installImg} from './amp-img';
import {installVideo} from './amp-video';
import {installPixel} from './amp-pixel';
import {installStyles} from './styles';
import {stubElements} from './custom-element';
import {adopt} from './runtime';
import {installExperimentalViewerIntegration} from './experimental-viewer-integration';
import {cssText} from '../build/css.js';
import {action} from './action';
import {installHistory} from './history';
import {maybeValidate} from './validator-integration';

installAd(window);
installImg(window);
installPixel(window);
installVideo(window);

installStyles(document, cssText);
adopt(window);
stubElements(window);

installHistory(window);
action.addEvent('tap');

maybeValidate(window);

installExperimentalViewerIntegration();
