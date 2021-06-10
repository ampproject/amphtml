/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '#preact/index';
import {boolean, optionsKnob, text, withKnobs} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-facebook-page-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-facebook-page', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = () => {
  const href = text('href', 'https://www.facebook.com/nasa/');
  const locale = boolean('french locale') ? 'fr_FR' : undefined;

  const hideCover = boolean('hide cover') ? 'true' : undefined;
  const hideCta = boolean('hide cta') ? 'true' : undefined;
  const smallHeader = boolean('small header') ? 'true' : undefined;
  const showFacepile = boolean('show facepile') ? undefined : 'false';
  const tabs = optionsKnob(
    'tabs',
    {timeline: 'timeline', events: 'events', messages: 'messages'},
    undefined,
    {display: 'inline-check'}
  );

  return (
    <amp-facebook-page
      width="400"
      height="600"
      data-href={href}
      data-locale={locale}
      data-hide-cover={hideCover}
      date-hide-cta={hideCta}
      data-small-header={smallHeader}
      data-show-facepile={showFacepile}
      data-tabs={tabs}
    ></amp-facebook-page>
  );
};

_default.story = {
  name: 'Default',
};
