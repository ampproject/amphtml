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
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionSection,
} from '../../../amp-accordion/1.0/component';
import {Instagram} from '../component';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Instagram',
  component: Instagram,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const width = number('width', 500);
  const height = number('height', 600);
  const shortcode = text('shortcode', 'B8QaZW4AQY_');
  const captioned = boolean('captioned');

  return (
    <Instagram
      shortcode={shortcode}
      style={{width, height}}
      captioned={captioned}
      alt="AMP Instagram Storybook Preact Example"
    ></Instagram>
  );
};

export const InsideAccordion = () => {
  const shortcode = text('shortcode', 'B8QaZW4AQY_');
  const width = number('width', 500);
  const height = number('height', 600);
  return (
    <Accordion expandSingleSection>
      <AccordionSection key={1} expanded={false}>
        <AccordionHeader>
          <h2>Post</h2>
        </AccordionHeader>
        <AccordionContent>
          <Instagram
            shortcode={shortcode}
            style={{width, height}}
            alt="AMP Instagram Storybook Preact Example"
          ></Instagram>
        </AccordionContent>
      </AccordionSection>
    </Accordion>
  );
};
