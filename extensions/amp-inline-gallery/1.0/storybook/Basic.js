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
import {BaseCarousel} from '../../../amp-base-carousel/1.0/base-carousel';
import {InlineGallery} from '../inline-gallery';
import {Pagination} from '../pagination';
import {Thumbnails} from '../thumbnails';
import {boolean, number, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'InlineGallery',
  component: InlineGallery,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const paginationHeight = number('top indicator height', 20);
  const topInset = boolean('top indicator inset?', false);
  const bottomInset = boolean('bottom indicator inset?', false);
  const slideCount = number('slide count', 12, {min: 3, max: 99});
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  const thumbnailHeight = number('thumbnail height', 50);
  const loop = boolean('thumbnail loop', false);
  const aspectRatio = number('thumbnail aspect ratio (w/h)', 3);

  return (
    <>
      <InlineGallery style={{width}}>
        <Pagination inset={topInset} style={{height: paginationHeight}} />
        <BaseCarousel style={{height}}>
          {Array.from({length: slideCount}, (_, i) => {
            const v = colorIncrement * (i + 1);
            return (
              <div
                style={{
                  backgroundColor: `rgb(${v}, 100, 100)`,
                  width,
                  height,
                }}
              ></div>
            );
          })}
        </BaseCarousel>
        <Pagination inset={bottomInset} />
        <Thumbnails
          aspectRatio={aspectRatio}
          loop={loop}
          style={{height: thumbnailHeight}}
        >
          {Array.from({length: slideCount}, (_, i) => {
            const v = colorIncrement * (i + 1);
            return (
              <div
                style={{
                  backgroundColor: `rgb(${v}, 100, 100)`,
                  width,
                  height,
                }}
              ></div>
            );
          })}
        </Thumbnails>
      </InlineGallery>
      Content below carousel
    </>
  );
};

export const WithLooping = () => {
  const width = number('width', 440);
  const height = number('height', 225);
  const paginationHeight = number('indicator height', 20);
  const inset = boolean('inset?', false);
  const thumbnailHeight = number('thumbnail height', 50);
  const loop = boolean('thumbnail loop', true);
  const aspectRatio = number('thumbnail aspect ratio', 2);
  const slides = [
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
      {index + 1}
    </div>
  ));

  return (
    <InlineGallery style={{width, position: 'relative'}}>
      <BaseCarousel loop style={{height, position: 'relative'}}>
        {slides}
      </BaseCarousel>
      <Pagination inset={inset} style={{height: paginationHeight}} />
      <Thumbnails
        aspectRatio={aspectRatio}
        loop={loop}
        style={{height: thumbnailHeight}}
      >
        <div>a</div>
        <div>b</div>
        <div>c</div>
        <div>d</div>
      </Thumbnails>
    </InlineGallery>
  );
};
