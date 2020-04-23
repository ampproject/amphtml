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

import * as Preact from '../../../../src/preact';
import {SocialShare} from '../social-share';
import {addParamsToUrl} from '../../../../src/url';
import {getSocialConfig} from '../amp-social-share-config';
import {select, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Social Share',
  component: SocialShare,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const knobConfigurations = [
    'email',
    'facebook',
    'linkedin',
    'pinterest',
    'tumblr',
    'twitter',
    'whatsapp',
    'line',
    'sms',
    'system',
    'custom endpoint',
  ];
  let type = select('Provider Type', knobConfigurations, knobConfigurations[0]);
  let href = text('Custom Share Endpoint', 'Not Specified');

  const config = getSocialConfig(type);
  if (type !== 'custom endpoint') {
    href = addParamsToUrl(config.shareEndpoint, config.defaultParams);
  } else {
    type = 'system';
  }
  return (
    <div>
      <p>
        Click the button below to share this page using the configured provider.
        Update the provider using storybook knobs. Choose Provider Type: 'custom
        endpoint' to specify your own share endpoint.
      </p>
      <SocialShare type={type} href={href} />
    </div>
  );
};
