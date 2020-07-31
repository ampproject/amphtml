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
import {scrollerStyles} from '../base-carousel.css';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'BaseCarousel',
  component: BaseCarousel,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const slideCount = number('slide count', 5, {min: 0, max: 99});
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <WithStyles>
      <BaseCarousel style={{width, height, position: 'relative'}}>
        {Array.from({length: slideCount}, (x, i) => {
          const v = colorIncrement * (i + 1);
          return (
            <div
              style={{backgroundColor: `rgb(${v}, 100, 100)`, width, height}}
            ></div>
          );
        })}
      </BaseCarousel>
    </WithStyles>
  );
};

export const provideArrows = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const myButtonStyle = {
    background: 'lightblue',
    borderRadius: '50%',
    fontSize: 14,
    color: 'white',
    width: '30px',
    height: '30px',
  };
  const MyButton = (props) => {
    const {children} = props;
    return (
      <button style={myButtonStyle} {...props}>
        {children}
      </button>
    );
  };
  return (
    <WithStyles>
      <BaseCarousel
        style={{width, height, position: 'relative'}}
        arrowPrev={<MyButton>←</MyButton>}
        arrowNext={<MyButton>→</MyButton>}
      >
        {['lightcoral', 'peachpuff', 'lavender'].map((color) => (
          <div style={{backgroundColor: color, width, height}}></div>
        ))}
      </BaseCarousel>
    </WithStyles>
  );
};

export const WithLooping = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  return (
    <WithStyles>
      <BaseCarousel loop style={{width, height, position: 'relative'}}>
        {[
          'lightpink',
          'lightcoral',
          'peachpuff',
          'powderblue',
          'lavender',
          'thistle',
        ].map((color, index) => (
          <div
            style={{
              backgroundColor: color,
              width,
              height,
              textAlign: 'center',
              fontSize: '48pt',
              lineHeight: height + 'px',
            }}
          >
            {index}
          </div>
        ))}
      </BaseCarousel>
    </WithStyles>
  );
};

export const WithCaptions = () => {
  return (
    <WithStyles>
      <BaseCarousel
        loop
        style={{width: '500px', height: '400px', position: 'relative'}}
      >
        <figure>
          <img
            style={{width: '500px', height: '300px'}}
            src="https://amp.dev/static/samples/img/landscape_lake_1280x857.jpg"
          />
          <figcaption>Each image has a different caption.</figcaption>
        </figure>
        <figure>
          <img
            style={{width: '600px', height: '300px'}}
            src="https://amp.dev/static/samples/img/landscape_village_1280x853.jpg"
          />
          <figcaption>This caption is different.</figcaption>
        </figure>
        <figure>
          <img
            style={{width: '500px', height: '300px'}}
            src="https://amp.dev/static/samples/img/landscape_desert_1280x853.jpg"
          />
          <figcaption>The third image has its caption.</figcaption>
        </figure>
      </BaseCarousel>
    </WithStyles>
  );
};

const WithStyles = ({children}) => {
  // TODO(wg-bento#7): remove this method once the stylesheet is bundled
  // with the component.
  return (
    <div>
      <style>${scrollerStyles}</style>
      {children}
    </div>
  );
};
