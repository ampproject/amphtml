import * as _3p from '#3p/3p';

import {
  handlePosition,
  handlePositionResponsive,
  keyBy,
  runWhenFetchingSettled,
  sizeAgainstWindow,
  ssp,
} from '#ads/vendors/ssp';

import {createIframePromise} from '#testing/iframe';

describes.fakeWin('amp-ad-ssp', {}, (env) => {
  let sandbox;
  let win;
  let commonData;
  const noop = () => {};

  /**
   * Set up our test environment.
   */
  beforeEach(() => {
    sandbox = env.sandbox;

    commonData = {
      width: '200',
      height: '200',
      said: 'said1234',
      position:
        '{ "id": "id-1", "width": "200", "height": "200", "zoneId": "1234" }',
    };

    // 3p library stubs
    sandbox.stub(_3p, 'validateData').callsFake(noop);
    sandbox.stub(_3p, 'computeInMasterFrame').callsFake(noop);
    sandbox.stub(_3p, 'loadScript').callsFake(noop);

    return createIframePromise(true).then((iframe) => {
      // Simulate the iframe that ssp will be called inside.
      win = iframe.win;
      win.context = {
        isMaster: false,
        master: {},
        renderStart: sandbox.spy(),
        noContentAvailable: sandbox.spy(),
        canonicalUrl: 'https://test.com',
      };
      const div = win.document.createElement('div');
      div.id = 'c';
      win.document.body.appendChild(div);
    });
  });

  /**
   * Tear down the test environment.
   */
  afterEach(() => {
    sandbox.restore();
  });

  it('should add root div', () => {
    ssp(win, commonData);

    const rootElement = win.document.getElementById('id-1');

    expect(rootElement).to.not.be.null;
  });

  it('should call validateData()', () => {
    ssp(win, commonData);

    expect(_3p.validateData).to.have.been.calledOnce;
    expect(_3p.validateData).to.have.been.calledWith(
      {
        width: '200',
        height: '200',
        said: 'said1234',
        position:
          '{ "id": "id-1", "width": "200", "height": "200", "zoneId": "1234" }',
      },
      ['position'],
      ['site', 'said']
    );
  });

  it('should call computeInMasterFrame()', () => {
    ssp(win, commonData);

    expect(_3p.computeInMasterFrame).to.have.been.calledOnce;
    expect(_3p.computeInMasterFrame).to.have.been.calledWith(win, 'ssp-load');
  });

  it('should call loadScript()', () => {
    _3p.computeInMasterFrame.restore();

    sandbox
      .stub(_3p, 'computeInMasterFrame')
      .callsFake((global, id, work) => work());

    ssp(win, commonData);

    expect(_3p.loadScript).to.have.been.calledOnce;
    expect(_3p.loadScript).to.have.been.calledWith(
      win,
      'https://ssp.imedia.cz/static/js/ssp.js'
    );
  });

  it('should call finish work with true', () => {
    _3p.computeInMasterFrame.restore();
    _3p.loadScript.restore();

    const callbackSpy = sandbox.spy();

    const sssp = {
      config: sandbox.spy(),
      writeAd: sandbox.spy(),
    };

    sandbox.stub(_3p, 'loadScript').callsFake((window, url, cb) => {
      // Mock script adding global object
      window.sssp = sssp;

      cb();
    });
    sandbox
      .stub(_3p, 'computeInMasterFrame')
      .callsFake((global, id, work) => work(callbackSpy));

    ssp(win, commonData);

    expect(callbackSpy).to.have.been.calledOnce;
    expect(callbackSpy).to.have.been.calledWith(true);
  });

  it('should call ssp.config()', () => {
    _3p.computeInMasterFrame.restore();
    _3p.loadScript.restore();

    const callbackSpy = sandbox.spy();

    const sssp = {
      config: sandbox.spy(),
      writeAd: sandbox.spy(),
    };

    sandbox.stub(_3p, 'loadScript').callsFake((window, url, cb) => {
      // Mock script adding global object
      window.sssp = sssp;

      cb();
    });
    sandbox
      .stub(_3p, 'computeInMasterFrame')
      .callsFake((global, id, work) => work(callbackSpy));

    ssp(win, commonData);

    expect(sssp.config).to.have.been.calledOnce;
    expect(sssp.config).to.have.been.calledWith({
      site: 'https://test.com',
      said: 'said1234',
    });
  });

  it('should call context.noContentAvailable() when position is invalid', () => {
    _3p.computeInMasterFrame.restore();
    _3p.loadScript.restore();

    sandbox
      .stub(_3p, 'computeInMasterFrame')
      .callsFake((global, id, work, cb) => cb(true));

    commonData.position = '{}';

    ssp(win, commonData);

    expect(win.context.renderStart).to.not.have.been.called;
    expect(win.context.noContentAvailable).to.have.been.calledOnce;
    expect(win.context.noContentAvailable).to.have.been.calledWith();
  });

  it('should call context.noContentAvailable() when script is not loaded', () => {
    _3p.computeInMasterFrame.restore();
    _3p.loadScript.restore();

    const sssp = {
      config: sandbox.spy(),
      getAds: sandbox.spy(),
      writeAd: sandbox.spy(),
    };
    const callbackSpy = sandbox.spy();

    sandbox.stub(_3p, 'loadScript').callsFake((window, url, cb) => {
      // Mock script adding global object
      window.sssp = sssp;
      window.context.master.ssp = sssp;
      window.ssp = sssp;

      cb();
    });
    sandbox
      .stub(_3p, 'computeInMasterFrame')
      .callsFake((global, id, work, cb) => {
        work(callbackSpy);
        cb(false);
      });

    ssp(win, commonData);

    expect(win.context.renderStart).to.not.have.been.called;
    expect(win.context.noContentAvailable).to.have.been.calledOnce;
    expect(win.context.noContentAvailable).to.have.been.calledWith();
  });

  it('should call getAds()', () => {
    _3p.computeInMasterFrame.restore();
    _3p.loadScript.restore();

    const sssp = {
      config: sandbox.spy(),
      getAds: sandbox.spy(),
      writeAd: sandbox.spy(),
    };
    const callbackSpy = sandbox.spy();

    sandbox.stub(_3p, 'loadScript').callsFake((window, url, cb) => {
      // Mock script adding global object
      window.sssp = sssp;

      cb();
    });

    sandbox
      .stub(_3p, 'computeInMasterFrame')
      .callsFake((global, id, work, cb) => {
        work(callbackSpy);
        cb(true);
      });

    ssp(win, commonData);

    expect(sssp.getAds).to.have.been.calledOnce;
    expect(sssp.getAds).to.have.been.calledWith(
      [
        {
          id: 'id-1',
          width: '200',
          height: '200',
          zoneId: '1234',
        },
      ],
      {AMPcallback: sandbox.match.func}
    );
  });

  it('sizeAgainstWindow() should generate sizing object', () => {
    const sizing = sizeAgainstWindow(100, {
      width: 200,
      height: 100,
    });

    expect(sizing).to.eql({width: 100, height: 50});
  });

  it('sizeAgainstWindow() should not generate sizing object', () => {
    const sizing = sizeAgainstWindow(100, {
      width: 100,
      height: 100,
    });

    expect(sizing).to.be.undefined;
  });

  it('handlePosition() should center and size element', () => {
    const div = win.document.createElement('div');
    win.document.body.appendChild(div);
    handlePosition(div, true, {width: '100%', height: '100%'});

    const divStyles = {
      width: div.style.width,
      height: div.style.height,
      position: div.style.position,
      top: div.style.top,
      left: div.style.left,
      transform: div.style.transform,
      maxWidth: div.style.maxWidth,
    };
    expect(divStyles).to.eql({
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '100%',
    });
  });

  it('handlePositionResponsive() should center element', () => {
    const div = win.document.createElement('div');
    win.document.body.appendChild(div);
    const e = {data: JSON.stringify({height: 200})};
    handlePositionResponsive(e, div);

    const divStyles = {
      height: div.style.height,
      position: div.style.position,
      top: div.style.top,
      left: div.style.left,
      transform: div.style.transform,
      maxWidth: div.style.maxWidth,
    };
    expect(divStyles).to.eql({
      height: '200px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '100%',
    });
  });

  it('keyBy() should return object from array with specified keys', () => {
    const data = [{id: 'id-1', key1: 'value1', key2: 'value2'}];
    const dataById = keyBy(data, (item) => item.id);

    expect(dataById['id-1']).to.eql(data[0]);
  });

  it('runWhenFetchingSettled() should run callbeck only if no registered XHR running', () => {
    win.fetchingSSPs = {xhr1: true, xhr2: true};
    const cbSpy = sandbox.spy();
    const clock = sandbox.useFakeTimers();
    runWhenFetchingSettled(win.fetchingSSPs, cbSpy);

    clock.tick(100);

    expect(cbSpy).to.not.have.been.called;

    delete win.fetchingSSPs.xhr1;
    delete win.fetchingSSPs.xhr2;

    clock.tick(200);

    expect(cbSpy).to.have.been.calledOnce;
  });
});
