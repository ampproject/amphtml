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
import {BaseCarousel} from '../base-carousel';
import {number, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'BaseCarousel',
  component: BaseCarousel,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  return (
    <BaseCarousel style={{width, height, position: 'relative'}}>
      {['lightcoral', 'peachpuff', 'lavender'].map((color) => (
        <div style={{backgroundColor: color, width, height}}></div>
      ))}
    </BaseCarousel>
  );
};

export const provideArrows = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const myButtonStyle = (side) => ({
    background: 'lightblue',
    borderRadius: '50%',
    fontSize: 20,
    color: 'white',
    bottom: 0,
    [side]: 0,
    width: '30px',
    height: '30px',
    position: 'absolute',
    lineHeight: '30px',
    textAlign: 'center',
  });
  return (
    <BaseCarousel
      style={{width, height, position: 'relative'}}
      arrowPrev={
        <div role="button" style={myButtonStyle('left')}>
          ←
        </div>
      }
      arrowNext={
        <div role="button" style={myButtonStyle('right')}>
          →
        </div>
      }
    >
      {['lightcoral', 'peachpuff', 'lavender'].map((color) => (
        <div style={{backgroundColor: color, width, height}}></div>
      ))}
    </BaseCarousel>
  );
};
