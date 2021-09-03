import * as Preact from '#preact';

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionSection,
} from '../../../amp-accordion/1.0/component';
import {BentoInstagram} from '../component';

export default {
  title: 'Instagram',
  component: BentoInstagram,
  args: {
    width: 500,
    height: 600,
    shortcode: 'B8QaZW4AQY_',
    captioned: false,
  },
};

export const _default = ({height, width, ...args}) => {
  return (
    <BentoInstagram
      style={{width, height}}
      alt="Bento Instagram Storybook Preact Example"
      {...args}
    ></BentoInstagram>
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
          <BentoInstagram
            style={{width, height}}
            alt="Bento Instagram Storybook Preact Example"
            {...args}
          ></BentoInstagram>
        </AccordionContent>
      </AccordionSection>
    </Accordion>
  );
};
