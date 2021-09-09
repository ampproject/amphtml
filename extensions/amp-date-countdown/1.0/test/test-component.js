import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoDateCountdown} from '../component';

describes.sandboxed('DateCountdown 1.0 preact component', {}, (env) => {
  let sandbox;
  let clock;

  function render(data) {
    return JSON.stringify(
      data,
      (key, value) => {
        if (typeof value === 'number') {
          return String(value);
        }
        return value;
      },
      4
    );
  }

  beforeEach(() => {
    sandbox = env.sandbox;
    clock = sandbox.useFakeTimers(new Date('2018-01-01T08:00:00Z'));
  });

  afterEach(() => {
    clock.runAll();
  });

  function syncPromise(response) {
    return {
      then(callback) {
        callback(response);
      },
    };
  }

  it('should render as a div by default', () => {
    const props = {
      render,
      datetime: Date.parse('2018-01-01T08:00:00Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);

    // Generic test for the Wrapper
    // This is actually fairly arbitrary that it should be a "div". But it's
    // checked here to ensure that we can change it controllably when needed.
    expect(wrapper.getDOMNode().tagName).to.equal('DIV');
  });

  it('should default to english locale if invalid locale provided', () => {
    const originalWarn = console.warn;
    const consoleOutput = [];
    const mockedWarn = (output) => consoleOutput.push(output);
    console.warn = mockedWarn;

    const props = {
      render,
      datetime: Date.parse('2018-01-01T08:00:00Z'),
      locale: 'invalid-locale',
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Check that warning message is print to the screen
    expect(consoleOutput.length).to.equal(1);
    expect(consoleOutput[0]).to.equal(
      'Invalid locale invalid-locale, defaulting to en. DateCountdown'
    );

    expect(data['years']).to.equal('Years');
    expect(data['months']).to.equal('Months');
    expect(data['days']).to.equal('Days');
    expect(data['hours']).to.equal('Hours');
    expect(data['minutes']).to.equal('Minutes');
    expect(data['seconds']).to.equal('Seconds');

    console.warn = originalWarn;
  });

  it('should count down if target date is in the future', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-01T08:00:10Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    let data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('11');
    expect(data['ss']).to.equal('11');

    // Count down 3 seconds
    clock.tick(3000);
    wrapper.update();
    data = JSON.parse(wrapper.text());

    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('8');
    expect(data['ss']).to.equal('08');
  });

  it('should display a negative number if target date is in the past', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have negative 1 year on it
    const props = {
      render,
      datetime: Date.parse('2017-01-01T08:00:00Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    expect(data['d']).to.equal('-364');
    expect(data['dd']).to.equal('-364');
    expect(data['h']).to.equal('-23');
    expect(data['hh']).to.equal('-23');
    expect(data['m']).to.equal('-59');
    expect(data['mm']).to.equal('-59');
    expect(data['s']).to.equal('-58');
    expect(data['ss']).to.equal('-58');
  });

  it('should count down to and stop at 0 by default', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-01T08:00:10Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    let data = JSON.parse(wrapper.text());

    // Count down 15 seconds
    clock.tick(15000);
    wrapper.update();
    data = JSON.parse(wrapper.text());

    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('0');
    expect(data['ss']).to.equal('00');
  });

  it('should count down past 0 if whenEnded is set to "continue"', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-01T08:00:10Z'),
      whenEnded: 'continue',
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    let data = JSON.parse(wrapper.text());

    // Count down 15 seconds
    clock.tick(15000);
    wrapper.update();
    data = JSON.parse(wrapper.text());

    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('-3');
    expect(data['ss']).to.equal('-03');

    wrapper.unmount();
  });

  it('should count up when countUp prop is set to "true"', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have -10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-01T08:00:10Z'),
      countUp: true,
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    let data = JSON.parse(wrapper.text());

    // Count up 7 seconds
    clock.tick(7000);
    wrapper.update();
    data = JSON.parse(wrapper.text());

    // -3 seconds left on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('-3');
    expect(data['ss']).to.equal('-03');

    // Count up 10 more seconds
    clock.tick(10000);
    wrapper.update();
    data = JSON.parse(wrapper.text());

    // 0 seconds left on the clock (does not continue past 0)
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('0');
    expect(data['ss']).to.equal('00');

    wrapper.unmount();
  });

  it('should count up past 0 when whenEnded prop is set to "continue"', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have -10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-01T08:00:10Z'),
      countUp: true,
      whenEnded: 'continue',
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    let data = JSON.parse(wrapper.text());

    // Count up 15 seconds
    clock.tick(15000);
    wrapper.update();
    data = JSON.parse(wrapper.text());

    // 4 seconds on the clock counting upwards (has an extra second at 0)
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('4');
    expect(data['ss']).to.equal('04');

    wrapper.unmount();
  });

  it('should display biggest unit as "days" by default', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 1 day and 10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-02T08:00:10Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('1');
    expect(data['dd']).to.equal('01');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('11');
    expect(data['ss']).to.equal('11');

    wrapper.unmount();
  });

  it('should display biggest unit as "hours" when set', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 1 day and 10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-02T08:00:10Z'),
      biggestUnit: 'HOURS',
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('24');
    expect(data['hh']).to.equal('24');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('11');
    expect(data['ss']).to.equal('11');

    wrapper.unmount();
  });

  it('should display biggest unit as "minutes" when set', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 1 day and 10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-02T08:00:10Z'),
      biggestUnit: 'MINUTES',
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('1440');
    expect(data['mm']).to.equal('1440');
    expect(data['s']).to.equal('11');
    expect(data['ss']).to.equal('11');

    wrapper.unmount();
  });

  it('should display biggest unit as "seconds" when set', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 1 day and 10 seconds on it
    const props = {
      render,
      datetime: Date.parse('2018-01-02T08:00:10Z'),
      biggestUnit: 'SECONDS',
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('86411');
    expect(data['ss']).to.equal('86411');

    wrapper.unmount();
  });

  it('should handle an async renderer', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 10 seconds on it
    const props = {
      render: (data) => syncPromise(render(data)),
      datetime: Date.parse('2018-01-01T08:00:10Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('11');
    expect(data['ss']).to.equal('11');
  });

  it('should use the default renderer when a renderer is not provided', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 10 seconds on it
    const props = {
      datetime: Date.parse('2018-01-01T08:00:10Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(wrapper.text()).to.equal(
      'Days 00, Hours 00, Minutes 00, Seconds 11'
    );
  });

  it('should accept a Date type object for the datetime prop', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 10 seconds on it
    const props = {
      render,
      datetime: new Date('2018-01-01T08:00:10Z'),
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('11');
    expect(data['ss']).to.equal('11');
  });

  it('should accept a String type object for the datetime prop', () => {
    // Reference date is 2018-01-01T08:00:00Z
    // Timer should have 10 seconds on it
    const props = {
      render,
      datetime: '2018-01-01T08:00:10Z',
    };
    const wrapper = mount(<BentoDateCountdown {...props} />);
    const data = JSON.parse(wrapper.text());

    // Component adds one second delay for slight execution delay in real world
    // In our mocked clock situation, we start with 11 seconds on the clock
    expect(data['d']).to.equal('0');
    expect(data['dd']).to.equal('00');
    expect(data['h']).to.equal('0');
    expect(data['hh']).to.equal('00');
    expect(data['m']).to.equal('0');
    expect(data['mm']).to.equal('00');
    expect(data['s']).to.equal('11');
    expect(data['ss']).to.equal('11');
  });
});
