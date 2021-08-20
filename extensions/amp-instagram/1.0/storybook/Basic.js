import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';

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
  decorators: [withKnobs],
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
  const shortcode = text('shortcode', 'Bp4I3hRhd_v');
  const width = number('width', 500);
  const height = number('height', 600);
  return (
    <Accordion expandSingleSection>
      <AccordionSection key={1} expanded={true}>
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
