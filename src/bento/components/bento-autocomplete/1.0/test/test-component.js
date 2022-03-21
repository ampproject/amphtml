import {expect} from 'chai';
import {mount} from 'enzyme';

import {Keys_Enum} from '#core/constants/key-codes';

import * as Preact from '#preact';

import {areOptionsVisible} from './test-helpers';

import {BentoAutocomplete} from '../component';

// TODO
// It accepts a list of objects as items and searches based on the filter value
// it hides items on tab
// something with backspace (1357)

// Maybe TODO
// it sets the item id to be autocomplete-selected

const defaultProps = {
  items: [],
};

function Autocomplete(initialProps) {
  const props = {...defaultProps, ...initialProps};
  return <BentoAutocomplete {...props} />;
}

describes.sandboxed('BentoAutocomplete preact component v1.0', {}, (env) => {
  let onError;
  beforeEach(() => {
    onError = env.sandbox.spy();
  });

  it('requires a single input or textarea descendant', () => {
    mount(<Autocomplete onError={onError}></Autocomplete>);
    expect(onError).to.have.been.calledWith(
      'bento-autocomplete should contain exactly one <input> or <textarea> descendant.'
    );

    mount(
      <Autocomplete onError={onError}>
        <input></input>
        <input></input>
      </Autocomplete>
    );
    expect(onError).to.have.been.calledTwice;
  });

  it('requires the type attribute to be "text" or "search"', () => {
    mount(
      <Autocomplete onError={onError}>
        <input type="hidden"></input>
      </Autocomplete>
    );
    expect(onError).to.have.been.calledWith(
      'bento-autocomplete requires the "type" attribute to be "text" or "search" if present on <input>.'
    );
  });

  it('adds attributes to the text input field', () => {
    const wrapper = mount(
      <Autocomplete id="id">
        <input type="text"></input>
      </Autocomplete>
    );

    const input = wrapper.find('input').getDOMNode();

    expect(input.getAttribute('dir')).to.equal('auto');
    expect(input.getAttribute('aria-autocomplete')).to.equal('both');
    expect(input.getAttribute('aria-controls')).to.equal('id');
    expect(input.getAttribute('role')).to.equal('combobox');
    expect(input.getAttribute('aria-multiline')).to.equal('false');
    expect(input.getAttribute('aria-haspopup')).to.equal('listbox');
    expect(input.getAttribute('aria-expanded')).to.equal('false');
    expect(input.getAttribute('aria-owns')).to.equal('id');
  });

  it('adds attributes to the textarea input field', () => {
    const wrapper = mount(
      <Autocomplete id="id">
        <textarea></textarea>
      </Autocomplete>
    );

    const input = wrapper.find('textarea').getDOMNode();

    expect(input.getAttribute('dir')).to.equal('auto');
    expect(input.getAttribute('aria-autocomplete')).to.equal('both');
    expect(input.getAttribute('role')).to.equal('textbox');
    expect(input.getAttribute('aria-controls')).to.equal('id');
    expect(input.getAttribute('aria-haspopup')).to.equal('listbox');
    expect(input.getAttribute('aria-expanded')).to.equal('false');
    expect(input.getAttribute('aria-owns')).to.equal('id');
  });

  it('requires the filer value to be one of the expected types', () => {
    mount(
      <Autocomplete id="id" onError={onError} filter="bad-filter">
        <input type="text"></input>
      </Autocomplete>
    );

    expect(onError).to.have.been.calledWith('Unexpected filter: bad-filter.');
  });

  describe('filtering items', () => {
    it('displays autocomplete suggestions on input for substring match', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="substring"
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'e';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.true;
      expect(wrapper.exists('[data-value="two"]')).to.be.false;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });

    it('displays autocomplete suggestions on input for prefix match', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.false;
      expect(wrapper.exists('[data-value="two"]')).to.be.true;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;

      input.getDOMNode().value = 'th';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.false;
      expect(wrapper.exists('[data-value="two"]')).to.be.false;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });

    it('displays autocomplete suggestions on input for fuzzy match', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="fuzzy" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'te';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.false;
      expect(wrapper.exists('[data-value="two"]')).to.be.false;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });

    it('displays autocomplete suggestions for a token prefix match', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="token-prefix"
          items={['Seattle, WA', 'Portland, OR']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'Seattle';
      input.simulate('input');

      expect(wrapper.exists('[data-value="Seattle, WA"]')).to.be.true;
      expect(wrapper.exists('[data-value="Portland, OR"]')).to.be.false;

      input.getDOMNode().value = 'OR';
      input.simulate('input');

      expect(wrapper.exists('[data-value="Seattle, WA"]')).to.be.false;
      expect(wrapper.exists('[data-value="Portland, OR"]')).to.be.true;
    });

    it('displays all items if filter type is none', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="none" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.true;
      expect(wrapper.exists('[data-value="two"]')).to.be.true;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });

    it('is case insensitive', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['One', 'Two', 'Three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(wrapper.exists('[data-value="One"]')).to.be.false;
      expect(wrapper.exists('[data-value="Two"]')).to.be.true;
      expect(wrapper.exists('[data-value="Three"]')).to.be.true;
    });

    it('sets attributes on each item', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="none" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = '';
      input.simulate('input');

      expect(wrapper.find('[role="option"]')).to.have.lengthOf(3);
      expect(wrapper.find('[dir="auto"]')).to.have.lengthOf(3);
    });

    it('does not show options if the minimum characters has not been met', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="prefix"
          minChars={2}
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(areOptionsVisible(wrapper)).to.be.false;
    });

    // TODO: Simulate click or focus
    it('shows options by default if minCharacters is 0', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="prefix"
          minChars={0}
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = '';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.true;
      expect(wrapper.exists('[data-value="two"]')).to.be.true;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });

    it('truncates items if max-items is set', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          maxItems={1}
          filter="substring"
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(wrapper.find('[role="option"]')).to.have.lengthOf(1);
    });

    it('truncates items if max-items is set and filter is none', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          maxItems={1}
          filter="none"
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(wrapper.find('[role="option"]')).to.have.lengthOf(1);
    });

    it('highlights the substring for the current input if highlightUserEntry is true', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          highlightUserEntry={true}
          filter="substring"
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'hr';
      input.simulate('input');

      const option = wrapper.find('[role="option"]');

      expect(option.getDOMNode().innerHTML).to.equal(
        `t<span class="autocomplete-partial">hr</span>ee`
      );
    });

    it('highlights the substrings for fuzzy search', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          highlightUserEntry={true}
          filter="fuzzy"
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'oe';
      input.simulate('input');

      const option = wrapper.find('[role="option"]');

      expect(option.getDOMNode().innerHTML).to.equal(
        `<span class="autocomplete-partial">o</span>n<span class="autocomplete-partial">e</span>`
      );
    });
  });

  describe('selecting an item', () => {
    it('updates the input value on arrow down', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.false;
      expect(wrapper.exists('[data-value="two"]')).to.be.true;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

      expect(input.getDOMNode().value).to.equal('two');
      expect(input.getDOMNode().getAttribute('aria-activedescendant')).to.equal(
        'id-0'
      );
      expect(wrapper.find('[data-value="two"]').prop('aria-selected')).to.be
        .true;

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

      expect(input.getDOMNode().value).to.equal('three');
      expect(input.getDOMNode().getAttribute('aria-activedescendant')).to.equal(
        'id-1'
      );
      expect(wrapper.find('[data-value="three"]').prop('aria-selected')).to.be
        .true;
    });

    it('hides the options on enter and sets the input to the selected item', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});
      input.simulate('keydown', {key: Keys_Enum.ENTER});

      expect(input.getDOMNode().value).to.equal('two');
      expect(areOptionsVisible(wrapper)).to.be.false;
    });

    it('hides the options on escape and resets the text field to the original text', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});
      input.simulate('keydown', {key: Keys_Enum.ESCAPE});

      expect(input.getDOMNode().value).to.equal('t');
      expect(areOptionsVisible(wrapper)).to.be.false;
    });

    it('selects an option on click', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      const option = wrapper.find('[data-value="two"]');
      option.simulate('click');

      expect(input.getDOMNode().value).to.equal('two');
      expect(areOptionsVisible(wrapper)).to.be.false;
    });

    it('selects an option if highlightUserEntry is true', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          highlightUserEntry
          filter="prefix"
          items={['one', 'two', 'three']}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'tw';
      input.simulate('input');

      const span = wrapper.find('.autocomplete-partial');
      span.simulate('click', {bubbles: true});

      expect(input.getDOMNode().value).to.equal('two');
      expect(areOptionsVisible(wrapper)).to.be.false;
    });
  });

  describe('inline autocomplete', () => {
    it('displays options when the inline token is used', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          inline=":"
          filter="prefix"
          items={['one', 'two', 'three']}
          minChars={0}
        >
          <textarea></textarea>
        </Autocomplete>
      );

      const input = wrapper.find('textarea');

      input.getDOMNode().value = 't';
      input.simulate('input');

      expect(areOptionsVisible(wrapper)).to.be.false;

      input.getDOMNode().value = ':';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.true;
      expect(wrapper.exists('[data-value="two"]')).to.be.true;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;

      input.getDOMNode().value = ':th';
      input.simulate('input');

      expect(wrapper.exists('[data-value="one"]')).to.be.false;
      expect(wrapper.exists('[data-value="two"]')).to.be.false;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });
  });

  describe('item templates', () => {
    it('calls onError if items are an object type and an itemTemplate prop is not present', () => {
      mount(
        <Autocomplete
          id="id"
          onError={onError}
          items={[{name: 'one'}, {name: 'two'}]}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      expect(onError).to.have.been.calledWith(
        'bento-autocomplete data must provide template for non-string items.'
      );
    });

    it('renders an item template with attributes', () => {
      const items = [
        {
          city: 'Seattle',
          state: 'WA',
        },
        {
          city: 'Portland',
          state: 'OR',
        },
      ];
      const itemTemplate = ({city, state}) => (
        <div class="city-item" data-value={`${city}, ${state}`}>
          {city}, {state}
        </div>
      );
      const wrapper = mount(
        <Autocomplete
          id="id"
          items={items}
          filterValue="name"
          itemTemplate={itemTemplate}
          minChars={0}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = '';
      input.simulate('input');

      expect(wrapper.exists('[data-value="Seattle, WA"]')).to.be.true;
      expect(wrapper.exists('[data-value="Portland, OR"]')).to.be.true;

      expect(wrapper.find('[role="option"]').length).to.equal(2);
      expect(wrapper.find('.city-item').length).to.equal(2);
    });
  });
});
