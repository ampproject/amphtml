import {mount} from 'enzyme';

import {dict} from '#core/types/object';

import * as Preact from '#preact';
import {Wrapper} from '#preact/component';

import {BentoSocialShare} from '../component';

describes.sandboxed('BentoSocialShare 1.0 preact component', {}, (env) => {
  const originalWarn = console.warn;
  let openSpy;

  beforeEach(() => {
    openSpy = env.sandbox.stub(window, 'open');
  });

  afterEach(() => (console.warn = originalWarn));

  it(
    'warns when the required endpoint is not provided when not using' +
      ' a pre-configured type',
    () => {
      const consoleOutput = [];
      const mockedWarn = (output) => consoleOutput.push(output);
      console.warn = mockedWarn;

      const jsx = (
        <BentoSocialShare {...dict({'type': 'not-configured-type'})} />
      );
      const wrapper = mount(jsx);

      expect(wrapper.exists('div')).to.equal(false);
      expect(consoleOutput.length).to.equal(1);
      expect(consoleOutput[0]).to.equal(
        'An endpoint is required if not using a pre-configured type. BentoSocialShare'
      );
    }
  );

  it('should include the button class for focus styling', () => {
    const jsx = <BentoSocialShare {...dict({'type': 'email'})} />;
    const wrapper = mount(jsx);

    const button = wrapper.getDOMNode();
    expect(button.className.includes('button')).to.be.true;
  });

  it('should call window.open when clicked', () => {
    const wrapper = mount(<BentoSocialShare type="twitter" />);

    const button = wrapper.find(Wrapper);

    expect(button.length).to.equal(1);

    button.getDOMNode().dispatchEvent(new Event('click'));

    expect(openSpy).called;
  });
});
