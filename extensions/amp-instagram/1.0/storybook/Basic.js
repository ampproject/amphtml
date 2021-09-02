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
