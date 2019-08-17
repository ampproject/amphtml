/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpGeo} from '../amp-geo';
import {GEO_IN_GROUP} from '../amp-geo-in-group';
import {Services} from '../../../../src/services';
import {user} from '../../../../src/log';
import {vsyncForTesting} from '../../../../src/service/vsync-impl';

describes.realWin(
  'amp-geo',
  {
    amp: {
      extensions: ['amp-geo'],
    },
  },
  env => {
    const expectedState =
      '<amp-state id="ampGeo"><script type="application/json">{"ISOCountry":"unknown","nafta":true,"unknown":true,"ISOCountryGroups":["nafta","unknown"]}</script></amp-state>'; // eslint-disable-line

    const config = {
      ISOCountryGroups: {
        nafta: ['ca', 'mx', 'us', 'unknown'],
        unknown: ['unknown'],
        eea: ['preset-eea'],
        myGroup: ['preset-eea', 'us'],
        anz: ['au', 'nz'],
      },
    };

    const configWithState = {
      AmpBind: true,
      ISOCountryGroups: {
        nafta: ['ca', 'mx', 'us', 'unknown'],
        unknown: ['unknown'],
        anz: ['au', 'nz'],
      },
    };

    const configWithUppercase = {
      ISOCountryGroups: {
        nafta: ['CA', 'mx', 'us', 'unknown'],
        unknown: ['unknown'],
        anz: ['au', 'NZ'],
      },
    };

    let win, doc;
    let ampdoc;
    let geo;
    let el;
    let userErrorStub;

    beforeEach(() => {
      userErrorStub = sandbox.stub(user(), 'error');
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      el = doc.createElement('amp-geo');
      el.setAttribute('layout', 'nodisplay');
      doc.body.appendChild(el);
      el.ampdoc_ = ampdoc;
      const vsync = vsyncForTesting(win);
      vsync.schedule_ = () => {
        vsync.runScheduledTasks_();
      };

      geo = new AmpGeo(el);
    });

    afterEach(() => {
      delete win.AMP_MODE.geoOverride;
    });

    function addConfigElement(opt_elementName, opt_type, opt_textContent) {
      const child = doc.createElement(opt_elementName || 'script');
      child.setAttribute('type', opt_type || 'application/json');
      child.textContent = opt_textContent || JSON.stringify(config);
      geo.element.appendChild(child);
    }

    function expectBodyHasClass(klasses, expected) {
      for (const k in klasses) {
        expect(doc.body.classList.contains(klasses[k])).to.equal(expected);
      }
    }

    it('should not throw or error on empty config', () => {
      expect(() => {
        geo.buildCallback();
      }).to.not.throw();
      expect(userErrorStub).to.not.be.called;
    });

    it('should not throw or error on valid config', () => {
      expect(() => {
        addConfigElement('script');
        geo.buildCallback();
      }).to.not.throw();
      expect(userErrorStub).to.not.be.called;
    });

    it('should add classes to body element for the geo', () => {
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('unknown');
        expectBodyHasClass(
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          true
        );
        expectBodyHasClass(['amp-iso-country-nz', 'amp-geo-group-anz'], false);
      });
    });

    it('should remove amp-geo-pending class from body element', () => {
      addConfigElement('script');
      doc.body.classList.add('amp-geo-pending');

      expectBodyHasClass(['amp-geo-pending'], true);

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('unknown');
        expectBodyHasClass(['amp-geo-pending'], false);
      });
    });

    it('should insert an amp-state if enabled', () => {
      addConfigElement(
        'script',
        'application/json',
        JSON.stringify(configWithState)
      );
      geo.buildCallback();

      // Make an amp-state that should be removed and replaced.
      const child = doc.createElement('amp-state');
      child.setAttribute('id', 'ampGeo');
      child.textContent = 'bad state';
      doc.body.appendChild(child);

      return Services.geoForDocOrNull(el).then(() => {
        expect(win.document.getElementById('ampGeo').outerHTML).to.equal(
          expectedState
        );
      });
    });

    it('should not insert an amp-state by default', () => {
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(() => {
        expect(win.document.getElementById('ampGeo')).to.equal(null);
      });
    });

    it('should allow hash to override geo in test', () => {
      win.AMP_MODE.geoOverride = 'nz';
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');
        expectBodyHasClass(['amp-iso-country-nz', 'amp-geo-group-anz'], true);
        expectBodyHasClass(
          [
            'amp-iso-country-unknown',
            'amp-geo-group-nafta',
            'amp-geo-no-group',
            'amp-geo-group-eea',
            'amp-geo-group-myGroup',
          ],
          false
        );
      });
    });

    it('should allow preset country groups', () => {
      win.AMP_MODE.geoOverride = 'fr';
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('fr');
        expectBodyHasClass(
          ['amp-iso-country-fr', 'amp-geo-group-eea', 'amp-geo-group-myGroup'],
          true
        );
        expectBodyHasClass([, 'amp-geo-no-group'], false);
      });
    });

    it('should set amp-geo-no-group if no group matches', () => {
      win.AMP_MODE.geoOverride = 'za';
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('za');
        expectBodyHasClass(['amp-iso-country-za', 'amp-geo-no-group'], true);
        expectBodyHasClass(
          [
            'amp-iso-country-unknown',
            'amp-geo-group-nafta',
            'amp-geo-group-anz',
          ],
          false
        );
      });
    });

    it('should return configured and matched groups in `geo` service', () => {
      win.AMP_MODE.geoOverride = 'nz';
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');
        expect(geo.allISOCountryGroups).to.deep.equal(
          Object.keys(config.ISOCountryGroups)
        );
        expect(geo.matchedISOCountryGroups).to.deep.equal(['anz']);
      });
    });

    it('isInCountryGroup works with multiple group targets', () => {
      win.AMP_MODE.geoOverride = 'nz';
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');

        /* multi group case */
        expect(geo.isInCountryGroup('nafta, anz')).to.equal(GEO_IN_GROUP.IN);
        expect(geo.isInCountryGroup('nafta, unknown')).to.equal(
          GEO_IN_GROUP.NOT_IN
        );
        expect(geo.isInCountryGroup('nafta, foobar')).to.equal(
          GEO_IN_GROUP.NOT_DEFINED
        );
      });
    });

    it('isInCountryGroup works with single group targets', () => {
      win.AMP_MODE.geoOverride = 'nz';
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');

        /* single group case */
        expect(geo.isInCountryGroup('anz')).to.equal(GEO_IN_GROUP.IN);
        expect(geo.isInCountryGroup('nafta')).to.equal(GEO_IN_GROUP.NOT_IN);
        expect(geo.isInCountryGroup('foobar')).to.equal(
          GEO_IN_GROUP.NOT_DEFINED
        );
      });
    });

    it('should allow uppercase hash to override geo in test', () => {
      win.AMP_MODE.geoOverride = 'NZ';
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');
        expectBodyHasClass(['amp-iso-country-nz', 'amp-geo-group-anz'], true);
        expectBodyHasClass(
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    it('should accept uppercase country codes in config', () => {
      win.AMP_MODE.geoOverride = 'nz';
      addConfigElement(
        'script',
        'application/json',
        JSON.stringify(configWithUppercase)
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');
        expectBodyHasClass(['amp-iso-country-nz', 'amp-geo-group-anz'], true);
        expectBodyHasClass(
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    /**
     * pre-rendered geo is the the case where a publisher uses their own
     * infrastructure to add a country tag to the body.
     */
    it('should respect pre-rendered geo tags', () => {
      addConfigElement('script');
      doc.body.classList.add('amp-iso-country-nz', 'amp-geo-group-anz');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');
        expectBodyHasClass(['amp-iso-country-nz', 'amp-geo-group-anz'], true);
        expectBodyHasClass(
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    it('should allow hash to override pre-rendered geo in test', () => {
      win.AMP_MODE.geoOverride = 'nz';
      doc.body.classList.add('amp-iso-country-mx', 'amp-geo-group-nafta');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('nz');
        expectBodyHasClass(['amp-iso-country-nz', 'amp-geo-group-anz'], true);
        expectBodyHasClass(
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    it('geo service should resolve correctly.', () => {
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('unknown');
        expect(geo.matchedISOCountryGroups).to.deep.equal(['nafta', 'unknown']);
        expect(geo.allISOCountryGroups).to.deep.equal([
          'nafta',
          'unknown',
          'eea',
          'myGroup',
          'anz',
        ]);
        expect(geo.isInCountryGroup).to.be.a('function');
      });
    });

    it('geo service should return null on bad config. ', () => {
      addConfigElement('script');
      addConfigElement('script');
      expect(() =>
        allowConsoleError(() => {
          geo.buildCallback();
        })
      ).to.throw();

      return expect(Services.geoForDocOrNull(el)).to.eventually.equal(null);
    });

    it('geo should log an error if unpatched in production. ', () => {
      expectAsyncConsoleError(/GEONOTPATCHED/);
      sandbox.stub(win.AMP_MODE, 'localDev').value(false);
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then(geo => {
        expect(geo.ISOCountry).to.equal('unknown');
        expectBodyHasClass(['amp-geo-error'], true);
      });
    });

    it('should throw if it has multiple script child elements', () => {
      expect(() => {
        addConfigElement('script');
        addConfigElement('script');
        allowConsoleError(() => {
          geo.buildCallback();
        });
      }).to.throw(
        /can only have one <script type="application\/json"> child​​​/
      );
    });

    it('should throw if the child element is not a <script> element', () => {
      expect(() => {
        addConfigElement('a');
        allowConsoleError(() => {
          geo.buildCallback();
        });
      }).to.throw(/script/);
    });

    it('should throw if the child script element is not json typed', () => {
      expect(() => {
        addConfigElement('script', 'wrongtype');
        allowConsoleError(() => {
          geo.buildCallback();
        });
      }).to.throw(/application\/json/);
    });

    it('should error if the child script element has non-JSON content', () => {
      expect(() => {
        addConfigElement('script', 'application/json', '{not json}');
        allowConsoleError(() => {
          geo.buildCallback();
        });
      }).to.throw(/JSON/);
    });

    it('should throw if the group name is not valid', () => {
      expect(() => {
        addConfigElement('script', 'application/json', {
          'ISOCountryGroups': {'foo<': ['us']},
        });
        allowConsoleError(() => {
          geo.buildCallback();
        });
      }).to.throw();
    });

    it('should throw if the preset name is not valid', () => {
      expect(() => {
        addConfigElement('script', 'application/json', {
          'ISOCountryGroups': {'foo': ['preset-foo']},
        });
        allowConsoleError(() => {
          geo.buildCallback();
        });
      }).to.throw();
    });
  }
);
