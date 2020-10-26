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
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-iframe',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-iframe', version: '0.1'}],
    experiments: ['same-origin-iframe'],
  },
};

export const SameOriginWithDocumentAccess = () => {
  return (
    <amp-iframe
      disallowdocumentaccess
      sandbox="allow-same-origin allow-scripts"
      src="http://localhost:9001/extensions/amp-iframe/0.1/storybook/iframe.html"
      width="400"
      height="300"
      layout="fixed"
    >
      <div placeholder>loading...</div>
      <div fallback>disallowed</div>
    </amp-iframe>
  );
};
