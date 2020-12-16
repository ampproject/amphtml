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
import {boolean, select, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-lightbox-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-lightbox', version: '1.0'}],
  },
};

export const Default = () => {
  const animateIn = select('animate-in', [
    'fade-in',
    'fly-in-top',
    'fly-in-bottom',
  ]);
  const enableAnimation = boolean('enable animation', true);
  const backgroundColor = text('background color', '');
  const color = text('font color', '');
  return (
    <>
      <style>{`
        #lightbox {
          background-color: ${backgroundColor};
          color: ${color};
        }
      `}</style>
      <div style="height: 300px;">
        <amp-lightbox
          id="lightbox"
          layout="nodisplay"
          animate-in={animateIn}
          enable-animation={enableAnimation}
        >
          <p>Test</p>
          <button on="tap:lightbox.close">Close</button>
        </amp-lightbox>
        <div class="buttons">
          <button on="tap:lightbox">Open</button>
        </div>
      </div>
    </>
  );
};

Default.story = {
  name: 'Default',
};
