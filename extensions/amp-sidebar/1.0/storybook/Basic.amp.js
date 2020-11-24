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
import {boolean, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-sidebar-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-sidebar', version: '1.0'}],
    experiments: ['amp-sidebar-bento'],
  },
};

export const _default = () => {
  return (
    <main>
      <amp-sidebar id="sidebar">Hello World!</amp-sidebar>
      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:sidebar.toggle()">toggle</button>
        <button on="tap:sidebar.open()">open</button>
        <button on="tap:sidebar.close()">close</button>
      </div>
    </main>
  );
};
