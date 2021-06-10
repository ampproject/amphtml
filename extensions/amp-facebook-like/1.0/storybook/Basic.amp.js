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
import {boolean, select, text, withKnobs} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-facebook-like-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-facebook-like', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = () => {
  const href = text('href', 'https://www.facebook.com/nasa/');
  const locale = boolean('french locale') ? 'fr_FR' : undefined;

  const action = select('action', ['like', 'recommend'], undefined);
  const colorscheme = select(
    'colorscheme (broken)',
    ['light', 'dark'],
    undefined
  );
  const kdSite = boolean('kd_site') || undefined;
  const layout = select(
    'layout',
    ['standard', 'button_count', 'button', 'box_count'],
    undefined
  );
  const refLabel = text('ref', undefined);
  const share = boolean('share') ? 'true' : undefined;
  const size = select('size (small by default)', ['large', 'small'], undefined);
  return (
    <amp-facebook-like
      width="400"
      height="600"
      data-href={href}
      data-locale={locale}
      data-action={action}
      data-colorscheme={colorscheme}
      data-kd_site={kdSite}
      data-layout={layout}
      data-ref={refLabel}
      data-share={share}
      data-size={size}
    ></amp-facebook-like>
  );
};

_default.story = {
  name: 'Default',
};
