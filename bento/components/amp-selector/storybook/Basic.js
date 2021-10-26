import {select, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';
import {useState} from '#preact';

import {BentoSelector, BentoSelectorOption} from '../component';
export default {
  title: 'Selector',
  component: BentoSelector,
  decorators: [withKnobs],
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

export const actionsAndOrder = () => {
  const keyboardSelectMode = select(
    'keyboard select mode',
    ['none', 'focus', 'select'],
    'select'
  );
  return (
    <form>
      <SelectorWithActions
        keyboardSelectMode={keyboardSelectMode}
        multiple
        name="poll"
        aria-label="Image menu"
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

export const optionItems = () => {
  return (
    <BentoSelector aria-label="Option menu">
      <BentoSelectorOption option="1">Option 1</BentoSelectorOption>
      <BentoSelectorOption option="2">Option 2</BentoSelectorOption>
      <BentoSelectorOption option="3">Option 3</BentoSelectorOption>
      <BentoSelectorOption option="4">Option 4</BentoSelectorOption>
    </BentoSelector>
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
