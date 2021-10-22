import {adplugg} from '#ads/vendors/adplugg';

import {createIframePromise} from '#testing/iframe';

describes.fakeWin('amp-ad-adplugg-impl', {}, (env) => {
  let win;
  let testData;

  /**
   * Set up our test environment.
   */
  beforeEach(() => {
    // Set up our test sandbox.
    return createIframePromise(true).then((iframe) => {
      // Simulate the iframe that adplugg will be called inside.
      win = iframe.win;
      win.context = {
        initialIntersection: {
          boundingClientRect: {
            height: 0,
          },
        },
        requestResize() {},
        renderStart() {},
        noContentAvailable() {},
        referrer: null,
      };
      const div = win.document.createElement('div');
      div.id = 'c';
      win.document.body.appendChild(div);

      // Create some data to test against.
      testData = {
        'accessCode': 'A48214096',
        'width': 300,
        'height': 250,
        'zone': 'my_amp_zone_300x250',
      };
    });
  });

  /**
   * Tear down the test enviroment.
   */
  afterEach(() => {
    // Reset window properties.
    win.context = {};
  });

  describe('adplugg', () => {
    it('should create an AdPlugg ad tag', () => {
      // Call the function.
      adplugg(win, testData);

      // Assert that an adplugg ad tag was created.
      const adTags = win.document.getElementsByClassName('adplugg-tag');
      expect(adTags).to.have.length(1);
    });

    it('should queue an anon function to register the event listeners', () => {
      // Create the async command queue.
      win.AdPlugg = [];

      // Call the function.
      adplugg(win, testData);

      // Assert that the function was queued as expected.
      expect(win.AdPlugg).to.have.length(2);
      expect(win.AdPlugg[0]).to.be.an.instanceof(Function);
    });

    it('should queue the run command to fill the tag', () => {
      // Create the async command queue.
      win.AdPlugg = [];

      // Call the function.
      adplugg(win, testData);

      // Assert that the run command was queued as expected.
      expect(win.AdPlugg).to.have.length(2);
      expect(win.AdPlugg[1]).to.be.an('object');
      expect(win.AdPlugg[1]).to.include.keys('command');
      expect(win.AdPlugg[1].command).to.equal('run');
    });

    it('implement the renderStart API', () => {
      // Set up mocks, spys, etc.
      const renderStartSpy = env.sandbox.stub(win.context, 'renderStart');
      win.AdPlugg = {
        push: function () {},
        on: function () {},
      };
      const AdPluggPushSpy = env.sandbox.spy(win.AdPlugg, 'push');
      const AdPluggOnSpy = env.sandbox.spy(win.AdPlugg, 'on');

      // Call the function.
      adplugg(win, testData);

      // Assert that AdPlugg.push was called as expected
      expect(AdPluggPushSpy).to.be.calledTwice;

      // Call the queued function that registers the event listeners
      const func = AdPluggPushSpy.getCall(0).args[0];
      func();

      // Assert that AdPlugg.on was called as expected
      expect(AdPluggOnSpy).to.be.calledTwice;

      // Call the queued function that registers the event listeners
      const {args} = AdPluggOnSpy.getCall(0);

      // Assert that the renderStart listener was registered
      expect(args[1]).to.equal('adplugg:renderStart');

      // Get the listener function and spy on it
      const listenerFunc = args[2];
      const listenerFuncSpy = env.sandbox.spy(listenerFunc);

      // Call the listener function (with a mock Event)
      const event = win.document.createEvent('Event');
      event.initEvent('adplugg:renderStart', true, true);
      event.width = 300;
      event.height = 250;
      listenerFuncSpy(event);

      // Assert that renderStart API was called as expected
      expect(renderStartSpy).to.be.calledOnce;
      const renderStartArgs = renderStartSpy.getCall(0).args[0];
      expect(renderStartArgs.width).to.equal(300);
      expect(renderStartArgs.height).to.equal(250);
    });

    it('implement the noContentAvailable API', () => {
      // Set up mocks, spys, etc.
      const noContentAvailableSpy = env.sandbox.stub(
        win.context,
        'noContentAvailable'
      );
      win.AdPlugg = {
        push: function () {},
        on: function () {},
      };
      const AdPluggPushSpy = env.sandbox.spy(win.AdPlugg, 'push');
      const AdPluggOnSpy = env.sandbox.spy(win.AdPlugg, 'on');

      // Call the function.
      adplugg(win, testData);

      // Assert that AdPlugg.push was called as expected
      expect(AdPluggPushSpy).to.be.calledTwice;

      // Call the queued function that registers the event listeners
      const func = AdPluggPushSpy.getCall(0).args[0];
      func();

      // Assert that AdPlugg.on was called as expected
      expect(AdPluggOnSpy).to.be.calledTwice;

      // Call the queued function that registers the event listeners
      const {args} = AdPluggOnSpy.getCall(1);

      // Assert that the noContentAvailable listener was registered
      expect(args[1]).to.equal('adplugg:noContentAvailable');

      // Get the listener function and spy on it
      const listenerFunc = args[2];
      const listenerFuncSpy = env.sandbox.spy(listenerFunc);

      // Call the listener function (with a mock Event)
      const event = win.document.createEvent('Event');
      event.initEvent('adplugg:noContentAvailable', true, true);
      listenerFuncSpy(event);

      // Assert that noContentAvailable API was called as expected
      expect(noContentAvailableSpy).to.be.calledOnce;
    });
  });
});
