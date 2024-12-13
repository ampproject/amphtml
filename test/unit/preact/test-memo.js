import {mount} from 'enzyme';

import * as Preact from '#preact';
import {memo} from '#preact/compat';

describes.sandboxed('preact/compat/memo', {}, (env) => {
  let Component;
  let Memoized;
  let wrapper;
  beforeEach(() => {
    Component = env.sandbox.stub();
    Component.callsFake((props) => {
      return <div {...props} />;
    });
    Memoized = memo(Component);

    wrapper = mount(<Memoized foo="foo" />);
  });

  it('should pass-through the props and render the component', () => {
    expect(wrapper.find('div').props()).to.deep.equal({
      foo: 'foo',
    });

    expect(Component).callCount(1);
  });
  it('should rerender if the props change', () => {
    wrapper.setProps({foo: 'BAR'});

    expect(Component).callCount(2);
  });
  it("should not rerender if the props haven't changed", () => {
    wrapper.setProps({foo: 'foo'});

    expect(Component).callCount(1);
  });
  it('should rerender if an extra prop is added', () => {
    wrapper.setProps({bar: 'bar'});

    expect(Component).callCount(2);
  });
});
