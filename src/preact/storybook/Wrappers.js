import * as Preact from '#preact';
import {ContainWrapper, Wrapper} from '#preact/component';

export default {
  title: '0/Wrappers',
};

export const wrapper = ({ariaLabel, asProp, className, ...args}) => {
  return (
    <Wrapper as={asProp} class={className} aria-label={ariaLabel}>
      content
    </Wrapper>
  );
};

wrapper.args = {
  asProp: 'span',
  ariaLabel: 'aria Label',
};

wrapper.argTypes = {
  asProp: {
    name: 'asProp',
    defaultValue: 'span',
    control: {type: 'text'},
  },
  ariaLabel: {
    name: 'ariaLabel',
    defaultValue: 'ariaLabel',
    control: {type: 'text'},
  },
  className: {
    name: 'className',
    control: {type: 'text'},
  },
  style: {
    name: 'style',
    defaultValue: {border: '1px solid'},
    control: {type: 'object'},
  },
  wrapperClassName: {
    name: 'wrapperClassName',
    control: {type: 'text'},
  },
  wrapperStyle: {
    name: 'wrapperStyle',
    control: {type: 'object'},
  },
};

export const containWrapper = ({ariaLabel, asProp, className, ...args}) => {
  return (
    <ContainWrapper
      as={asProp}
      class={className}
      aria-label={ariaLabel}
      {...args}
    >
      content
    </ContainWrapper>
  );
};

wrapper.args = {
  asProp: 'div',
  ariaLabel: 'aria Label',
  contentClassName: 'content',
};

wrapper.argTypes = {
  className: {
    name: 'className',
    control: {type: 'text'},
  },
  style: {
    name: 'style',
    defaultValue: {border: '1px solid', width: 200, height: 50},
    control: {type: 'object'},
  },
  wrapperClassName: {
    name: 'wrapperClassName',
    control: {type: 'text'},
  },
  wrapperStyle: {
    name: 'wrapperStyle',
    control: {type: 'object'},
  },
  contentStyle: {
    name: 'contentStyle',
    defaultValue: {border: '1px dotted'},
    control: {type: 'object'},
  },
  size: {
    name: 'size',
    defaultValue: true,
    control: {type: 'boolean'},
  },
  layout: {
    name: 'layout',
    defaultValue: true,
    control: {type: 'boolean'},
  },
  paint: {
    name: 'paint',
    defaultValue: true,
    control: {type: 'boolean'},
  },
};
