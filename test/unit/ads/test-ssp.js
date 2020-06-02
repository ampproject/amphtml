/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as _3p from '../../../3p/3p';
import {createIframePromise} from '../../../testing/iframe';
import {ssp} from '../../../ads/ssp';

describes.fakeWin('amp-ad-ssp', {}, () => {
  let sandbox;
  let win;
  let commonData;
  const noop = () => {};

  /**
   * Set up our test environment.
   */
  beforeEach(() => {
    sandbox = window.sandbox;

    commonData = {
      width: '200',
      height: '200',
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
        position:
          '{ "id": "id-1", "width": "200", "height": "200", "zoneId": "1234" }',
      },
      ['position'],
      ['site']
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
    expect(sssp.config).to.have.been.calledWith({site: 'https://test.com'});
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
    expect(sssp.getAds).to.have.been.calledWith([
      {id: 'id-1', width: '200', height: '200', zoneId: '1234'},
    ]);
  });
});
