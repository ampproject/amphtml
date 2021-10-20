import {mount} from 'enzyme';

import {dict} from '#core/types/object';

import * as Preact from '#preact';

import {BentoSocialShare} from '../component';

describes.sandboxed('BentoSocialShare 1.0 preact component', {}, () => {
  const originalWarn = console.warn;

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
});
