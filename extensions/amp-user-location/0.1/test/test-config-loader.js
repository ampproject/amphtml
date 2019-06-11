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

import {ConfigLoader} from '../config-loader';

describes.fakeWin(
  'ConfigLoader',
  {
    amp: {
      extensions: ['amp-user-location'],
    },
  },
  env => {
    let win;
    let doc;
    let fakeAmpdoc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      fakeAmpdoc = {win};
    });

    function newFakeUserLocation(opt_config, opt_src) {
      const userLocation = doc.createElement('fake-amp-user-location');
      doc.body.appendChild(userLocation);

      if (opt_config) {
        const configElement = win.document.createElement('script');
        configElement.setAttribute('type', 'application/json');
        if (typeof opt_config == 'string') {
          configElement.textContent = opt_config;
        } else {
          configElement.textContent = JSON.stringify(opt_config);
        }
        userLocation.appendChild(configElement);
      }

      if (opt_src) {
        userLocation.setAttribute('src', opt_src);
      }

      return userLocation;
    }

    describe('script tag config', () => {
      it('should parse config if present', async () => {
        const EMPTY_CONFIG = {};
        const elementNoConfig = newFakeUserLocation();
        const noConfigLoader = new ConfigLoader(fakeAmpdoc, elementNoConfig);
        const emptyConfig = await noConfigLoader.getConfig();
        expect(emptyConfig).to.deep.equal(EMPTY_CONFIG);

        const elementWithConfig = await newFakeUserLocation({});
        const configLoader = new ConfigLoader(fakeAmpdoc, elementWithConfig);
        const config = await configLoader.getConfig();
        expect(config).to.deep.equal(EMPTY_CONFIG);
      });

      it('should error with unparseable script tag config', async () => {
        const invalidElement = newFakeUserLocation('this is not valid json');
        const invalidConfigLoader = new ConfigLoader(
          fakeAmpdoc,
          invalidElement
        );
        await expect(
          invalidConfigLoader.getConfig()
        ).to.eventually.be.rejectedWith(/unexpected token/i);
      });

      it('should error with array script tag config', async () => {
        expectAsyncConsoleError(/expected .+ configuration/, 1);

        const arrayElement = newFakeUserLocation('[]');
        const arrayConfigLoader = new ConfigLoader(fakeAmpdoc, arrayElement);
        await expect(
          arrayConfigLoader.getConfig()
        ).to.eventually.be.rejectedWith(/expected .+ configuration/);
      });

      it('should parse all fields in the config', async () => {
        const testConfig = {
          fallback: '40,-22',
          maximumAge: 60000,
          precision: 'low',
          timeout: 10000,
          doNotExpose: 'wow',
        };

        const element = newFakeUserLocation(testConfig);
        const configLoader = new ConfigLoader(fakeAmpdoc, element);
        const config = await configLoader.getConfig();
        expect(config).to.deep.equal(testConfig);
      });
    });

    describe('remote src config', () => {
      it('should parse remote config if present', async () => {
        const element = await newFakeUserLocation(
          null,
          'https://example.com/location'
        );
        sandbox.stub(ConfigLoader.prototype, 'fetch_').resolves({});

        const configLoader = new ConfigLoader(fakeAmpdoc, element);
        const config = await configLoader.getConfig();

        expect(config).to.deep.equal({});
      });

      it('should parse all fields in the config', async () => {
        const testConfig = {
          fallback: '40,-22',
          maximumAge: 60000,
          precision: 'low',
          timeout: 10000,
          doNotExpose: 'wow',
        };
        const element = await newFakeUserLocation(
          null,
          'https://example.com/location'
        );
        sandbox.stub(ConfigLoader.prototype, 'fetch_').resolves(testConfig);

        const configLoader = new ConfigLoader(fakeAmpdoc, element);
        const config = await configLoader.getConfig();

        expect(config).to.deep.equal(testConfig);
      });

      it('should error with invalid remote config', async () => {
        expectAsyncConsoleError(/expected .+ configuration/);
        const testConfig = [
          {
            fallback: '40,-22',
            maximumAge: 60000,
            precision: 'low',
            timeout: 10000,
            doNotExpose: 'wow',
          },
        ];
        const element = newFakeUserLocation(
          null,
          'https://example.com/location'
        );
        sandbox.stub(ConfigLoader.prototype, 'fetch_').resolves(testConfig);

        const arrayConfigLoader = new ConfigLoader(fakeAmpdoc, element);
        await expect(
          arrayConfigLoader.getConfig()
        ).to.eventually.be.rejectedWith(/expected .+ configuration/);
      });
    });

    describe('script config and remote src config', () => {
      it('should parse remote config if both present at same time', async () => {
        const element = await newFakeUserLocation(
          {local: true},
          'https://example.com/location'
        );
        sandbox.stub(ConfigLoader.prototype, 'fetch_').resolves({remote: true});

        const configLoader = new ConfigLoader(fakeAmpdoc, element);
        const config = await configLoader.getConfig();

        expect(config).to.deep.equal({remote: true});
      });

      it('should parse local config if remote is not yet available', async () => {
        const element = await newFakeUserLocation(
          {local: true},
          'https://example.com/location'
        );
        sandbox.stub(ConfigLoader.prototype, 'fetch_').callsFake(() => {
          return new Promise(resolve => {
            setTimeout(() => resolve({remote: true}, 16));
          });
        }); // resolves after local config

        const configLoader = new ConfigLoader(fakeAmpdoc, element);
        const config = await configLoader.getConfig();

        expect(config).to.deep.equal({local: true});
      });

      it('should parse remote config if remote is pre-fetched', async () => {
        const element = await newFakeUserLocation(
          {local: true},
          'https://example.com/location'
        );
        sandbox
          .stub(ConfigLoader.prototype, 'fetch_')
          .callsFake(
            () =>
              new Promise(resolve => setTimeout(resolve({remote: true}, 16)))
          ); // resolves after local config

        const configLoader = new ConfigLoader(fakeAmpdoc, element);
        await configLoader.fetchConfig(); // pre-fetch
        const config = await configLoader.getConfig();

        expect(config).to.deep.equal({remote: true});
      });
    });
  }
);
