import {expect} from 'chai';
import {mount} from 'enzyme';

import {Keys_Enum} from '#core/constants/key-codes';

import * as Preact from '#preact';

import {areOptionsVisible} from './test-helpers';

import {BentoAutocomplete} from '../component';

// TODO
// It shows the list of options when the input value is empty if min characters is 0
// It accepts a list of objects as items and searches based on the filter value
// It shows the list of options when the inline token is entered by the user

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
  });

  describe('selecting an item', () => {
    it.skip('sets the input value to the first result on arrow down', () => {
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
    });
  });
});
