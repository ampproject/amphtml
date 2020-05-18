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
import {Option, Selector} from '../selector';
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Selector',
  component: Selector,
  decorators: [withA11y, withKnobs],
};

const imgStyle = {
  width: '90px',
  height: '60px',
  display: 'inline-block',
  margin: '2px',
};

export const listItems = () => {
  return (
    <Selector aria-label="Image menu">
      <Option
        as="img"
        alt="Sea landscape"
        style={{...imgStyle, width: '90px', height: '60px'}}
        src="https://amp.dev/static/samples/img/landscape_sea_300x199.jpg"
        option="1"
        disabled
      ></Option>
      <Option
        as="img"
        alt="Desert landscape"
        style={{...imgStyle, width: '90px', height: '60px'}}
        src="https://amp.dev/static/samples/img/landscape_desert_300x200.jpg"
        option="2"
      ></Option>
      <br></br>
      <Option
        as="img"
        alt="Ship landscape"
        style={{...imgStyle, width: '90px', height: '60px'}}
        src="https://amp.dev/static/samples/img/landscape_ship_300x200.jpg"
        option="3"
      ></Option>
      <Option
        as="img"
        alt="Village landscape"
        style={{...imgStyle, width: '90px', height: '60px'}}
        src="https://amp.dev/static/samples/img/landscape_village_300x200.jpg"
        option="4"
      ></Option>
    </Selector>
  );
};

export const optionItems = () => {
  return (
    <Selector aria-label="Option menu">
      <Option option="1">Option 1</Option>
      <Option option="2">Option 2</Option>
      <Option option="3">Option 3</Option>
      <Option option="4">Option 4</Option>
    </Selector>
  );
};

export const multiselect = () => {
  return (
    <Selector as="ul" multiple aria-label="Multiselect menu">
      <Option as="li" option="1">
        Option 1
      </Option>
      <Option as="li" disabled option="2">
        Option 2 (disabled)
      </Option>
      <Option as="li" option="3">
        Option 3
      </Option>
      <Option as="li" option="4">
        Option 4
      </Option>
    </Selector>
  );
};
