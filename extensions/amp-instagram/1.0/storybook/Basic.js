<<<<<<< HEAD
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

import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';

=======
>>>>>>> 64cb73b217... ♻️ Use Storybook `args` (first round) (#35915)
import * as Preact from '#preact';

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionSection,
} from '../../../amp-accordion/1.0/component';
import {Instagram} from '../component';

export default {
  title: 'Instagram',
  component: Instagram,
  args: {
    width: 500,
    height: 600,
    shortcode: 'B8QaZW4AQY_',
    captioned: false,
  },
};

export const _default = ({height, width, ...args}) => {
  return (
    <Instagram
      style={{width, height}}
      alt="AMP Instagram Storybook Preact Example"
      {...args}
    ></Instagram>
  );
};

export const InsideAccordion = ({height, width, ...args}) => {
  return (
    <Accordion expandSingleSection>
      <AccordionSection key={1} expanded={true}>
        <AccordionHeader>
          <h2>Post</h2>
        </AccordionHeader>
        <AccordionContent>
          <Instagram
            style={{width, height}}
            alt="AMP Instagram Storybook Preact Example"
            {...args}
          ></Instagram>
        </AccordionContent>
      </AccordionSection>
    </Accordion>
  );
};
