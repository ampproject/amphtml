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
import {AnimationTemplate} from './template';
import {storiesOf} from '@storybook/preact';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

const CONTAINER_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'space-around',
};

const DROP_STYLE = {
  width: '20px',
  height: '20px',
  background: 'rgba(0, 0, 0, 0.25)',
  borderRadius: '50%',
  transform: 'translateY(-20vh)',
};

// eslint-disable-next-line
storiesOf('Animation', module)
  .addDecorator(withKnobs)
  .addDecorator(withAmp)
  .addParameters({extensions: [{name: 'amp-animation', version: 0.1}]})
  .add('random', () => {
    const spec = {
      selector: '.drop',
      '--delay': 'rand(0.1s, 5s)',
      delay: 'var(--delay)',
      direction: 'normal',
      subtargets: [
        {
          index: 0,
          direction: 'reverse',
        },
        {
          selector: '.antigrav',
          direction: 'reverse',
          '--delay': '0s',
        },
      ],
      keyframes: {
        transform: 'translateY(120vh)',
      },
    };
    return (
      <AnimationTemplate spec={spec}>
        <div style={CONTAINER_STYLE}>
          <div class="drop" style={DROP_STYLE}></div>
          <div class="drop" style={DROP_STYLE}></div>
          <div class="drop antigrav" style={DROP_STYLE}></div>
          <div class="drop" style={DROP_STYLE}></div>
          <div class="drop" style={DROP_STYLE}></div>
          <div class="drop" style={DROP_STYLE}></div>
          <div class="drop" style={DROP_STYLE}></div>
        </div>
      </AnimationTemplate>
    );
  });
