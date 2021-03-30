/**
 * Copyright __current_year__ The AMP HTML Authors. All Rights Reserved.
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
import {__component_name_pascalcase__} from '../component'
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: '__component_name_pascalcase__',
  component: __component_name_pascalcase__,
  decorators: [withKnobs, withA11y],
};

export const _default = () => {
  // __do_not_submit__: This is example code only.
  return (
    <__component_name_pascalcase__
      style={{width: 300, height: 200}}
      example-property="example string property value"
    >
      This text is inside.
    </__component_name_pascalcase__>
  );
};
