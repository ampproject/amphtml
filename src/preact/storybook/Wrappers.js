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

import * as Preact from '../';
import {ContainWrapper, Wrapper} from '../component';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: '0/Wrappers',
  decorators: [withA11y, withKnobs],
};

export const wrapper = () => {
  const asProp = text('As', 'span');
  const className = text('className', '');
  const style = object('style', {border: '1px solid'});
  const wrapperClassName = text('wrapperClassName', '');
  const wrapperStyle = object('wrapperStyle', {});
  const ariaLabel = text('ariaLabel', 'aria label');
  return (
    <Wrapper
      as={asProp}
      className={className}
      style={style}
      wrapperClassName={wrapperClassName}
      wrapperStyle={wrapperStyle}
      aria-label={ariaLabel}
    >
      content
    </Wrapper>
  );
};

export const containWrapper = () => {
  const asProp = text('As', 'div');
  const className = text('className', '');
  const style = object('style', {border: '1px solid', width: 200, height: 50});
  const wrapperClassName = text('wrapperClassName', '');
  const wrapperStyle = object('wrapperStyle', {padding: 4});
  const contentClassName = text('contentClassName', 'content');
  const contentStyle = object('contentStyle', {border: '1px dotted'});
  const size = boolean('size', true);
  const layout = boolean('layout', true);
  const paint = boolean('paint', true);
  const ariaLabel = text('ariaLabel', 'aria label');
  return (
    <ContainWrapper
      as={asProp}
      className={className}
      style={style}
      wrapperClassName={wrapperClassName}
      wrapperStyle={wrapperStyle}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      size={size}
      layout={layout}
      paint={paint}
      aria-label={ariaLabel}
    >
      content
    </ContainWrapper>
  );
};
