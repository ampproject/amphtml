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

import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-iframe-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-iframe', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const WithSrc = () => {
  return (
    <amp-iframe
      width="800"
      height="600"
      src="https://www.wikipedia.org/"
    ></amp-iframe>
  );
};

WithSrc.storyName = 'amp-iframe with src attribute';

export const WithPlaceholder = () => {
  return (
    <amp-iframe width="800" height="600" src="https://www.wikipedia.org/">
      <h1>Placeholder</h1>
    </amp-iframe>
  );
};

WithPlaceholder.storyName = 'amp-iframe with placeholder';

export const WithResizableIframe = () => {
  return (
    <amp-iframe
      id="sample-resizable-iframe"
      title="Resizable iframe example"
      width="100"
      height="100"
      sandbox="allow-scripts allow-same-origin"
      resizable
      src="/examples/amp-iframe-storybook.html"
    >
      <div placeholder>Placeholder</div>
    </amp-iframe>
  );
};

WithResizableIframe.storyName = 'resizable amp-iframe';
