/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview
 * Allows web push notification subscription widgets on AMP pages of
 * push vendor-enabled sites that open to a special subscription page on the
 * canonical origin when clicked.
 *
 * An iFrame to a prepared lightweight page on the canonical origin is opened to
 * check for an existing web push subscription.
 */

import {CONFIG_TAG, SERVICE_TAG, TAG, WIDGET_TAG} from './vars';
import {CSS} from '../../../build/amp-web-push-0.1.css';
import {WebPushConfig} from './amp-web-push-config';
import {WebPushService} from './web-push-service';
import {WebPushWidget} from './amp-web-push-widget';

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(SERVICE_TAG, WebPushService);
  AMP.registerElement(CONFIG_TAG, WebPushConfig);
  AMP.registerElement(WIDGET_TAG, WebPushWidget, CSS);
});
