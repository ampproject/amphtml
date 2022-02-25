import {expect} from 'chai';
import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoAutocomplete} from '../component';

// It filters the list of options based on the input value
// It filters the list of options using an input substring
// It shows the list of options when the input value is empty if min characters is 0
// It shows the list of options if the min characters threshold is met
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
  it('requires a single input or textarea descendant', () => {
    const onError = env.sandbox.spy();

    mount(<Autocomplete items={[]} onError={onError}></Autocomplete>);
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
    const onError = env.sandbox.spy();

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
});
