import {expect} from 'chai';
import {mount} from 'enzyme';

import {BentoAutocomplete} from '#bento/components/bento-autocomplete/1.0/component';

import {Keys_Enum} from '#core/constants/key-codes';

import * as Preact from '#preact';
import {xhrUtils} from '#preact/utils/xhr';

import {waitFor} from '#testing/helpers/service';

const defaultProps = {
  items: [],
};

function Autocomplete(initialProps) {
  const props = {...defaultProps, ...initialProps};
  return <BentoAutocomplete {...props} />;
}

function areOptionsVisible(wrapper) {
  return !wrapper.find('[role="listbox"]').prop('hidden');
}

describes.sandboxed('BentoAutocomplete preact component v1.0', {}, (env) => {
  let onError;
  let onSelect;
  beforeEach(() => {
    onError = env.sandbox.spy();
    onSelect = env.sandbox.spy();
  });

  it('requires a single input or textarea descendant', () => {
    mount(<Autocomplete onError={onError}></Autocomplete>);
    expect(onError).to.have.been.calledWith(
      'should contain exactly one <input> or <textarea> descendant.'
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
      'requires the "type" attribute to be "text" or "search" if present on <input>.'
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
    expect(input.getAttribute('aria-expanded')).to.equal('false');
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
    expect(input.getAttribute('aria-expanded')).to.equal('false');
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

    it('shows options on focus if minCharacters is 0', () => {
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

      input.simulate('focus');

      expect(areOptionsVisible(wrapper)).to.be.true;
    });

    it('hides options on blur', () => {
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
      input.simulate('focus');

      expect(areOptionsVisible(wrapper)).to.be.true;

      input.simulate('blur');

      expect(areOptionsVisible(wrapper)).to.be.false;
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

    it('resets the input value and attributes if the user arrows down the bottom', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one']} minChars={0}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.simulate('focus');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

      expect(input.getDOMNode().value).to.equal('one');
      expect(input.getDOMNode().getAttribute('aria-activedescendant')).to.equal(
        'id-0'
      );
      expect(wrapper.find('[data-value="one"]').prop('aria-selected')).to.be
        .true;

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

      expect(input.getDOMNode().value).to.equal('');
      expect(input.getDOMNode().getAttribute('aria-activedescendant')).to.be
        .null;
      expect(wrapper.find('[data-value="one"]').prop('aria-selected')).to.be
        .false;
      expect(areOptionsVisible(wrapper)).to.be.true;
    });

    it('updates the input value on arrow up', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});
      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

      expect(input.getDOMNode().value).to.equal('three');

      input.simulate('keydown', {key: Keys_Enum.UP_ARROW});

      expect(input.getDOMNode().value).to.equal('two');
    });

    it('resets the input value and attributes if the user arrows up to the top', () => {
      const wrapper = mount(
        <Autocomplete id="id" filter="prefix" items={['one', 'two', 'three']}>
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

      expect(input.getDOMNode().value).to.equal('two');

      input.simulate('keydown', {key: Keys_Enum.UP_ARROW});

      expect(input.getDOMNode().value).to.equal('t');
      expect(input.getDOMNode().getAttribute('aria-activedescendant')).to.be
        .null;
      expect(wrapper.find('[data-value="two"]').prop('aria-selected')).to.be
        .false;
      expect(areOptionsVisible(wrapper)).to.be.true;
    });

    it('selects the last item if the user uses the up arrow without an active item', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="prefix"
          items={['one', 'two', 'three']}
          minChars={0}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.simulate('focus');

      input.simulate('keydown', {key: Keys_Enum.UP_ARROW});

      expect(wrapper.find('[data-value="three"]').prop('aria-selected')).to.be
        .true;
    });

    it('hides the options on enter and sets the input to the selected item', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="prefix"
          items={['one', 'two', 'three']}
          onSelect={onSelect}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});
      input.simulate('keydown', {key: Keys_Enum.ENTER});

      expect(onSelect).to.have.been.calledWith({value: 'two'});
      expect(input.getDOMNode().value).to.equal('two');
      expect(areOptionsVisible(wrapper)).to.be.false;
    });

    it('hides the options on tab and sets the input to the selected item', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="prefix"
          items={['one', 'two', 'three']}
          onSelect={onSelect}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});
      input.simulate('keydown', {key: Keys_Enum.TAB});

      expect(onSelect).to.have.been.calledWith({value: 'two'});
      expect(input.getDOMNode().value).to.equal('two');
      expect(areOptionsVisible(wrapper)).to.be.false;
    });

    it('hides the options on escape and resets the selection state', () => {
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

      // It should reset the active index
      input.simulate('focus');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});
      input.simulate('keydown', {key: Keys_Enum.ENTER});

      expect(input.getDOMNode().value).to.equal('two');
    });

    it('does not reset the input value if an option has been selected', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="prefix"
          items={['one', 'two', 'three']}
          onSelect={onSelect}
        >
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

      // It should not reset the input value
      input.simulate('keydown', {key: Keys_Enum.ESCAPE});

      expect(input.getDOMNode().value).to.equal('two');
    });

    it('selects an option on mousedown', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="prefix"
          items={['one', 'two', 'three']}
          onSelect={onSelect}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 't';
      input.simulate('input');

      const option = wrapper.find('[data-value="two"]');
      option.simulate('mousedown');

      expect(onSelect).to.have.been.calledWith({value: 'two'});
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
      span.simulate('mousedown', {bubbles: true});

      expect(input.getDOMNode().value).to.equal('two');
      expect(areOptionsVisible(wrapper)).to.be.false;
    });

    describe('suggesting the first option', () => {
      it('calls onError if suggestFirst is true but filter is not prefix', () => {
        mount(
          <Autocomplete
            id="id"
            filter="none"
            items={['one', 'two', 'three']}
            onError={onError}
            suggestFirst
          >
            <input type="text"></input>
          </Autocomplete>
        );

        expect(onError).to.have.been.calledWith(
          `"suggest-first" expected "filter" type "prefix".`
        );
      });

      it('selects the first option if suggestFirst is true', () => {
        const wrapper = mount(
          <Autocomplete
            id="id"
            filter="prefix"
            items={['one', 'two', 'three']}
            onError={onError}
            suggestFirst
          >
            <input type="text"></input>
          </Autocomplete>
        );

        const input = wrapper.find('input');

        input.getDOMNode().value = 't';
        input.simulate('input');

        expect(input.getDOMNode().value).to.equal('two');
        expect(areOptionsVisible(wrapper)).to.be.true;
      });
    });
  });

  describe('inline autocomplete', () => {
    it('displays autocomplete suggestions when the inline token is used', () => {
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

    it('does not show options on focus', () => {
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

      input.simulate('focus');

      expect(areOptionsVisible(wrapper)).to.be.false;
    });
  });

  describe('item templates', () => {
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
      <div
        class="city-item"
        data-value={`${city}, ${state}`}
        data-json={JSON.stringify({city, state})}
      >
        <span>
          {city}, {state}
        </span>
      </div>
    );

    it('calls onError if items are an object type and an itemTemplate prop is not present', () => {
      mount(
        <Autocomplete
          id="id"
          onError={onError}
          items={items}
          filterValue="city"
        >
          <input type="text"></input>
        </Autocomplete>
      );

      expect(onError).to.have.been.calledWith(
        'data must provide template for non-string items.'
      );
    });

    it('renders an item template with attributes', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          items={items}
          filter="none"
          itemTemplate={itemTemplate}
          filterValue="city"
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

    it('tries to use a default filter-value when a filter type is specified and calls onError if it does not exist', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          onError={onError}
          items={items}
          itemTemplate={itemTemplate}
          filter="prefix"
          minChars={0}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = '';
      input.simulate('input');

      expect(onError).to.have.been.calledWith(
        'data property "value" must map to string type.'
      );
    });

    it('calls onError it items are an object type and filterValue is not present on object', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          onError={onError}
          items={items}
          itemTemplate={itemTemplate}
          filter="prefix"
          filterValue="something"
          minChars={0}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = '';
      input.simulate('input');

      expect(onError).to.have.been.calledWith(
        'data property "something" must map to string type.'
      );
    });

    it('filters options using the filterValue', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          items={items}
          filterValue="city"
          filter="token-prefix"
          itemTemplate={itemTemplate}
          minChars={0}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = 'sea';
      input.simulate('input');

      expect(wrapper.exists('[data-value="Seattle, WA"]')).to.be.true;
      expect(wrapper.exists('[data-value="Portland, OR"]')).to.be.false;
    });

    it('calls onError if the data-value attribute is not present on the template', () => {
      const itemTemplate = ({city, state}) => (
        <div class="city-item">
          <span>
            {city}, {state}
          </span>
        </div>
      );
      const wrapper = mount(
        <Autocomplete
          id="id"
          items={items}
          filterValue="city"
          filter="token-prefix"
          itemTemplate={itemTemplate}
          minChars={0}
          onError={onError}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = 'sea';
      input.simulate('input');

      expect(onError).to.have.been.calledWith(
        'expected a "data-value" or "data-disabled" attribute on the rendered template item.'
      );
    });

    it('selects an item using the data-value attribute on mousedown', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          items={items}
          filterValue="city"
          filter="token-prefix"
          itemTemplate={itemTemplate}
          minChars={0}
          onSelect={onSelect}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = 'sea';
      input.simulate('input');

      wrapper.find('[data-value="Seattle, WA"]').simulate('mousedown');

      expect(onSelect).to.have.been.calledWith({
        value: 'Seattle, WA',
        valueAsObject: {city: 'Seattle', state: 'WA'},
      });
      expect(input.getDOMNode().value).to.equal('Seattle, WA');
    });

    it('sets the input value using the data-value attribute on arrow down', () => {
      const wrapper = mount(
        <Autocomplete
          id="id"
          items={items}
          filterValue="city"
          filter="token-prefix"
          itemTemplate={itemTemplate}
          minChars={0}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');

      input.getDOMNode().value = 'sea';
      input.simulate('input');

      input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

      expect(input.getDOMNode().value).to.equal('Seattle, WA');
    });

    describe('templates with disabled items', () => {
      const items = [
        {
          city: 'City',
          state: 'State',
          disabled: true,
        },
        {
          city: 'Seattle',
          state: 'WA',
        },
        {
          city: 'Portland',
          state: 'OR',
        },
      ];
      const itemTemplate = ({city, disabled, state}) => (
        <div
          class="city-item"
          data-value={!disabled && `${city}, ${state}`}
          data-disabled={disabled}
        >
          <span>
            {city}, {state}
          </span>
        </div>
      );
      it('sets aria-disabled on the option if data-disabled is true', () => {
        const wrapper = mount(
          <Autocomplete
            id="id"
            items={items}
            filterValue="city"
            filter="none"
            itemTemplate={itemTemplate}
            minChars={0}
          >
            <input type="text"></input>
          </Autocomplete>
        );

        expect(
          wrapper.find('[data-disabled=true]').prop('aria-disabled')
        ).to.equal(true);
      });

      it('selects the first non-disabled option', () => {
        const wrapper = mount(
          <Autocomplete
            id="id"
            items={items}
            filterValue="city"
            filter="none"
            itemTemplate={itemTemplate}
            minChars={0}
          >
            <input type="text"></input>
          </Autocomplete>
        );
        const input = wrapper.find('input');

        input.simulate('focus');

        input.simulate('keydown', {key: Keys_Enum.DOWN_ARROW});

        expect(input.getDOMNode().value).to.equal('Seattle, WA');
      });

      it('does not select a disabled option on mouse down', () => {
        const wrapper = mount(
          <Autocomplete
            id="id"
            items={items}
            filterValue="city"
            filter="none"
            itemTemplate={itemTemplate}
            minChars={0}
          >
            <input type="text"></input>
          </Autocomplete>
        );
        const input = wrapper.find('input');

        input.simulate('focus');

        wrapper.find('[data-disabled=true]').simulate('mousedown');

        expect(input.getDOMNode().value).to.equal('');
      });
    });
  });

  describe('fetching items', async () => {
    let fetchJson;
    beforeEach(() => {
      fetchJson = env.sandbox
        .stub(xhrUtils, 'fetchJson')
        .resolves({items: ['one', 'two', 'three']});
    });

    async function waitForData(component, callCount = 1) {
      await waitFor(
        () => fetchJson.callCount === callCount,
        'expected fetchJson to have been called' +
          (callCount > 1 ? ` ${callCount} times` : '')
      );
      // Ensure everything has settled:
      await new Promise((r) => setTimeout(r, 0));
      component.update();
    }

    it('fetches data on initial render if a src is provided and prefetch is true', async () => {
      const wrapper = mount(
        <Autocomplete id="id" src="/items.json" prefetch>
          <input type="text"></input>
        </Autocomplete>
      );

      await waitForData(wrapper);

      expect(fetchJson).calledWith('/items.json').callCount(1);
    });

    it('fetches on user input if prefetch is false', async () => {
      const wrapper = mount(
        <Autocomplete id="id" src="/items.json" prefetch={false}>
          <input type="text"></input>
        </Autocomplete>
      );

      expect(fetchJson).not.to.have.been.called;

      const input = wrapper.find('input');
      input.getDOMNode().value = 'o';
      input.simulate('input');

      await waitForData(wrapper);

      expect(fetchJson).calledWith('/items.json').callCount(1);
    });

    it('displays fetched results and does not re-fetch by default', async () => {
      const wrapper = mount(
        <Autocomplete id="id" src="/items.json">
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'o';
      input.simulate('input');

      await waitForData(wrapper);

      expect(fetchJson).calledWith('/items.json').callCount(1);

      expect(wrapper.exists('[data-value="one"]')).to.be.true;
      expect(wrapper.exists('[data-value="two"]')).to.be.true;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });

    it('can parse response data', async () => {
      fetchJson.resolves({
        data: [
          {name: 'one', value: 1},
          {name: 'two', value: 2},
          {name: 'three', value: 3},
        ],
      });

      const wrapper = mount(
        <Autocomplete
          id="id"
          filter="none"
          src="/items.json"
          parseJson={(response) => response.data.map(({name}) => name)}
        >
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'o';
      input.simulate('input');

      await waitForData(wrapper);

      expect(wrapper.exists('[data-value="one"]')).to.be.true;
      expect(wrapper.exists('[data-value="two"]')).to.be.true;
      expect(wrapper.exists('[data-value="three"]')).to.be.true;
    });

    it('accepts a query prop and fetches from the URL with query params', async () => {
      const wrapper = mount(
        <Autocomplete id="id" src="https://test.com/api/items" query="q">
          <input type="text"></input>
        </Autocomplete>
      );

      await waitForData(wrapper, 0);

      expect(fetchJson).not.to.have.been.called;

      const input = wrapper.find('input');
      input.getDOMNode().value = 'value';
      input.simulate('input');

      await waitForData(wrapper);

      expect(fetchJson)
        .to.have.been.calledWith('https://test.com/api/items?q=value')
        .callCount(1);
    });

    it('re-fetches when the input value changes', async () => {
      const wrapper = mount(
        <Autocomplete id="id" src="https://test.com/api/items" query="q">
          <input type="text"></input>
        </Autocomplete>
      );

      const input = wrapper.find('input');
      input.getDOMNode().value = 'value';
      input.simulate('input');

      await waitForData(wrapper);

      expect(fetchJson).to.have.been.calledWith(
        'https://test.com/api/items?q=value'
      );

      input.getDOMNode().value = 'value2';
      input.simulate('input');

      await waitForData(wrapper, 2);

      expect(fetchJson).to.have.been.calledWith(
        'https://test.com/api/items?q=value2'
      );
    });

    describe('when the request returns an error', () => {
      it('calls onError', async () => {
        fetchJson.returns(Promise.reject({message: 'test error'}));

        const wrapper = mount(
          <Autocomplete id="id" src="/items.json" onError={onError} prefetch>
            <input type="text"></input>
          </Autocomplete>
        );

        await waitForData(wrapper);

        expect(fetchJson).calledWith('/items.json').callCount(1);

        expect(onError).to.have.been.calledOnceWith('test error');
      });

      it('refetches when the data changes', async () => {
        fetchJson.returns(Promise.reject({message: 'test error'}));

        const wrapper = mount(
          <Autocomplete id="id" src="https://test.com/api/items" query="q">
            <input type="text"></input>
          </Autocomplete>
        );

        const input = wrapper.find('input');
        input.getDOMNode().value = 'value';
        input.simulate('input');

        await waitForData(wrapper);

        expect(fetchJson).to.have.been.calledWith(
          'https://test.com/api/items?q=value'
        );

        input.getDOMNode().value = 'value2';
        input.simulate('input');

        await waitForData(wrapper, 2);

        expect(fetchJson).to.have.been.calledWith(
          'https://test.com/api/items?q=value2'
        );
      });
    });
  });
});
