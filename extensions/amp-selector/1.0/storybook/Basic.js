import * as Preact from '#preact';
import {useRef, useState} from '#preact';

import '../component.jss';

import {BentoSelector, BentoSelectorOption} from '../component';

export default {
  title: 'Selector',
  component: BentoSelector,
};

const imgStyle = {
  width: '90px',
  height: '60px',
  display: 'inline-block',
  margin: '2px',
};

/**
 * @param {!Object} props
 * @return {*}
 */
function SelectorWithActions(props) {
  const [show, setShow] = useState(false);

  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <button onClick={() => setShow(!show)}>
        toggle option 2.5 visibility
      </button>
      <BentoSelector ref={ref} {...props}>
        {props.children.slice(0, 2)}
        {show && (
          <BentoSelectorOption as="div" option="2.5" index={2}>
            Option 2.5
          </BentoSelectorOption>
        )}
        <br />
        {props.children.slice(2)}
      </BentoSelector>
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current./*OK*/ toggle('2')}>
          toggle(option "2")
        </button>
        <button onClick={() => ref.current./*OK*/ toggle('2.5')}>
          toggle(option "2.5")
        </button>
        <button onClick={() => ref.current./*OK*/ toggle('2', true)}>
          select (option "2")
        </button>
        <button onClick={() => ref.current./*OK*/ toggle('2', false)}>
          deselect (option "2")
        </button>
        <button onClick={() => ref.current./*OK*/ selectBy(-2)}>
          select up by 2
        </button>
        <button onClick={() => ref.current./*OK*/ selectBy(1)}>
          select down by 1
        </button>
        <button onClick={() => ref.current./*OK*/ clear()}>clear all</button>
      </div>
    </section>
  );
}

export const actionsAndOrder = (args) => {
  return (
    <form>
      <SelectorWithActions
        multiple
        name="poll"
        aria-label="Image menu"
        {...args}
      >
        <BentoSelectorOption
          as="img"
          alt="Sea landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_sea_300x199.jpg"
          option="1"
          index={0}
          disabled
        ></BentoSelectorOption>
        <BentoSelectorOption
          as="img"
          alt="Desert landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_desert_300x200.jpg"
          option="2"
          index={1}
        ></BentoSelectorOption>
        <br />
        <BentoSelectorOption
          as="img"
          alt="Ship landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_ship_300x200.jpg"
          option="3"
          index={3}
        ></BentoSelectorOption>
        <BentoSelectorOption
          as="img"
          alt="Village landscape"
          style={imgStyle}
          src="https://amp.dev/static/samples/img/landscape_village_300x200.jpg"
          option="4"
          index={4}
        ></BentoSelectorOption>
      </SelectorWithActions>
    </form>
  );
};

actionsAndOrder.argTypes = {
  'keyboard-select-mode': {
    name: 'keyboard-select-mode',
    defaultValue: 'select',
    options: ['none', 'focus', 'select'],
    control: {type: 'select'},
  },
};

export const OptionItems = () => {
  const ref = useRef(null);
  return (
    <>
      <button onClick={() => ref.current.toggle('1')}>toggle1</button>
      <button onClick={() => ref.current.toggle('2')}>toggle2</button>
      <BentoSelector ref={ref} aria-label="Option menu">
        <BentoSelectorOption option="1">Option 1</BentoSelectorOption>
        <BentoSelectorOption option="2">Option 2</BentoSelectorOption>
        <BentoSelectorOption option="3">Option 3</BentoSelectorOption>
        <BentoSelectorOption option="4">Option 4</BentoSelectorOption>
      </BentoSelector>
    </>
  );
};

export const multiselect = () => {
  return (
    <BentoSelector
      as="ul"
      multiple
      aria-label="Multiselect menu"
      defaultValue={['2']}
    >
      <BentoSelectorOption as="li" option="1">
        Option 1
      </BentoSelectorOption>
      <BentoSelectorOption as="li" disabled option="2">
        Option 2 (disabled)
      </BentoSelectorOption>
      <BentoSelectorOption as="li" option="3">
        Option 3
      </BentoSelectorOption>
      <BentoSelectorOption as="li" option="4">
        Option 4
      </BentoSelectorOption>
    </BentoSelector>
  );
};
