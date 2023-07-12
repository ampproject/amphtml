import {Services} from '#service';
import {vsyncForTesting} from '#service/vsync-impl';

import {user} from '#utils/log';

import * as urls from '../../../../src/config/urls';
import {AmpGeo} from '../amp-geo';
import {GEO_IN_GROUP} from '../amp-geo-in-group';

describes.realWin(
  'amp-geo',
  {
    amp: {
      extensions: ['amp-geo'],
    },
  },
  (env) => {
    const expectedState =
      '<amp-state id="ampGeo"><script type="application/json">{"ISOCountry":"unknown","ISOSubdivision":"unknown","nafta":true,"unknown":true,"ISOCountryGroups":["nafta","unknown"]}</script></amp-state>';

    const config = {
      ISOCountryGroups: {
        nafta: ['ca', 'mx', 'us', 'unknown'],
        unknown: ['unknown'],
        eea: ['preset-eea'],
        myGroup: ['preset-eea', 'us'],
        usSubdivisions: ['us-al', 'us-ny', 'us-va', 'us-co', 'us-ct'],
        usVA: ['us-va'],
        usCO: ['us-co'],
        usCT: ['us-ct'],
        canadaSubdivisions: ['ca-mb', 'ca-nb'],
        anz: ['au', 'nz'],
        uscaGroup: ['preset-us-ca'],
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
        canadaSubdivision: ['CA-MB'],
      },
    };

    const configWithInvalidCountry = {
      ISOCountryGroups: {
        nafta: ['CA', 'mx', 'us', 'unknown'],
        unknown: ['unknown'],
        anz: ['au', 'NZ'],
        uscaGroup: ['preset-us-ca'],
        california: ['us-ca'],
        tatarstan: ['ru-ta'],
        myGroup: ['ru'],
        invalid: ['ru-svee'],
      },
    };

    let win, doc;
    let ampdoc;
    let geo;
    let el;
    let userErrorStub;
    let xhr;

    beforeEach(() => {
      userErrorStub = env.sandbox.stub(user(), 'error');
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
      xhr = {
        fetchJson: env.sandbox.stub(),
      };
      env.sandbox.stub(Services, 'xhrFor').returns(xhr);

      geo = new AmpGeo(el);
    });

    function setGeoOverrideHash(hashValue) {
      geo.win.location.originalHash = `#amp-geo=${hashValue}`;
    }

    function addConfigElement(opt_elementName, opt_type, opt_textContent) {
      const child = doc.createElement(opt_elementName || 'script');
      child.setAttribute('type', opt_type || 'application/json');
      child.textContent = opt_textContent || JSON.stringify(config);
      geo.element.appendChild(child);
    }

    function expectElementHasClass(target, klasses, expected) {
      for (const k in klasses) {
        const klass = klasses[k];
        expect(target.classList.contains(klass)).to.equal(
          expected,
          expected
            ? `missing ${klass} class for ${target.tagName}`
            : `should not have ${klass} class for ${target.tagName}`
        );
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

    it('should be able to handle `documentElement` being null (shadow mode instances)', () => {
      env.sandbox.stub(ampdoc, 'getRootNode').returns({});
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('unknown');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          true
        );
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          false
        );
      });
    });

    it('should add classes to html and body element for the geo', () => {
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('unknown');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          true
        );
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          false
        );
      });
    });

    it('should remove amp-geo-pending class from html and body element', () => {
      addConfigElement('script');
      doc.documentElement.classList.add('amp-geo-pending');
      doc.body.classList.add('amp-geo-pending');

      expectElementHasClass(doc.body, ['amp-geo-pending'], true);
      expectElementHasClass(doc.documentElement, ['amp-geo-pending'], true);

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('unknown');
        expectElementHasClass(doc.body, ['amp-geo-pending'], false);
        expectElementHasClass(doc.documentElement, ['amp-geo-pending'], false);
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
      setGeoOverrideHash('nz');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('nz');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-unknown',
            'amp-geo-group-nafta',
            'amp-geo-no-group',
            'amp-geo-group-eea',
            'amp-geo-group-myGroup',
          ],
          false
        );
        expectElementHasClass(
          doc.documentElement,
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

    it('should allow hash to override subdivision in test', () => {
      setGeoOverrideHash('us us-ca');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('us');

        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-us',
            'amp-geo-group-nafta',
            'amp-geo-group-myGroup',
            'amp-geo-group-uscaGroup',
            'amp-iso-subdivision-us-ca',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-iso-country-us',
            'amp-geo-group-nafta',
            'amp-geo-group-myGroup',
            'amp-geo-group-uscaGroup',
            'amp-iso-subdivision-us-ca',
          ],
          true
        );
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-unknown', 'amp-geo-no-group', 'amp-geo-group-eea'],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown', 'amp-geo-no-group', 'amp-geo-group-eea'],
          false
        );
      });
    });

    it('should allow preset country groups', () => {
      setGeoOverrideHash('fr');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('fr');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-fr', 'amp-geo-group-eea', 'amp-geo-group-myGroup'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-fr', 'amp-geo-group-eea', 'amp-geo-group-myGroup'],
          true
        );
        expectElementHasClass(doc.body, [, 'amp-geo-no-group'], false);
        expectElementHasClass(
          doc.documentElement,
          [, 'amp-geo-no-group'],
          false
        );
      });
    });

    it('should allow preset-us-ca and us-ca subdivision', () => {
      setGeoOverrideHash('us us-ca');
      addConfigElement(
        'script',
        'application/json',
        JSON.stringify(configWithInvalidCountry)
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('us-ca');
        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-uscaGroup',
            'amp-geo-group-california',
            'amp-iso-subdivision-us-ca',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-uscaGroup',
            'amp-geo-group-california',
            'amp-iso-subdivision-us-ca',
          ],
          true
        );
      });
    });

    it('should allow us-co subdivision', () => {
      setGeoOverrideHash('us us-co');
      addConfigElement('script', 'application/json', JSON.stringify(config));
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('us-co');
        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-usCO',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-co',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-usCO',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-co',
          ],
          true
        );
      });
    });

    it('should allow us-ct subdivision', () => {
      setGeoOverrideHash('us us-ct');
      addConfigElement('script', 'application/json', JSON.stringify(config));
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('us-ct');
        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-usCT',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-ct',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-usCT',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-ct',
          ],
          true
        );
      });
    });

    it('should allow us-va subdivision', () => {
      setGeoOverrideHash('us us-va');
      addConfigElement('script', 'application/json', JSON.stringify(config));
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('us-va');
        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-usVA',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-va',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-usVA',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-va',
          ],
          true
        );
      });
    });

    it('should allow ru-ta subdivision', () => {
      setGeoOverrideHash('ru ru-ta');
      addConfigElement(
        'script',
        'application/json',
        JSON.stringify(configWithInvalidCountry)
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('ru-ta');
        expectElementHasClass(
          doc.body,
          ['amp-geo-group-myGroup', 'amp-geo-group-tatarstan'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-geo-group-myGroup', 'amp-geo-group-tatarstan'],
          true
        );
      });
    });

    it('should allow subdivisions that have max 3 symbol length', () => {
      setGeoOverrideHash('ru ru-svee');
      addConfigElement(
        'script',
        'application/json',
        JSON.stringify(configWithInvalidCountry)
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('ru-sve');
        expectElementHasClass(
          doc.body,
          ['amp-geo-group-myGroup', 'amp-iso-subdivision-ru-sve'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-geo-group-myGroup', 'amp-iso-subdivision-ru-sve'],
          true
        );
        expectElementHasClass(doc.body, ['amp-geo-group-invalid'], false);
        expectElementHasClass(
          doc.documentElement,
          ['amp-geo-group-invalid'],
          false
        );
      });
    });

    it('Should support Canada subdivisions', () => {
      setGeoOverrideHash('ca ca-mb');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('ca-mb');
        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-nafta',
            'amp-geo-group-canadaSubdivisions',
            'amp-iso-subdivision-ca-mb',
            'amp-iso-country-ca',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-nafta',
            'amp-geo-group-canadaSubdivisions',
            'amp-iso-subdivision-ca-mb',
            'amp-iso-country-ca',
          ],
          true
        );

        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-usSubdivisions',
            'amp-geo-group-myGroup',
            'amp-geo-group-uscaGroup',
            'amp-geo-group-anz',
            'amp-geo-group-eea',
            'amp-geo-group-unknown',
          ],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-usSubdivisions',
            'amp-geo-group-myGroup',
            'amp-geo-group-uscaGroup',
            'amp-geo-group-anz',
            'amp-geo-group-eea',
            'amp-geo-group-unknown',
          ],
          false
        );
      });
    });

    it('Should support US subdivisions', () => {
      setGeoOverrideHash('us us-ny');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOSubdivision).to.equal('us-ny');
        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-nafta',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-ny',
            'amp-iso-country-us',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-nafta',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-ny',
            'amp-iso-country-us',
          ],
          true
        );
      });
    });

    it('should set amp-geo-no-group if no group matches', () => {
      setGeoOverrideHash('za');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('za');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-za', 'amp-geo-no-group'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-za', 'amp-geo-no-group'],
          true
        );
        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-unknown',
            'amp-geo-group-nafta',
            'amp-geo-group-anz',
          ],
          false
        );
        expectElementHasClass(
          doc.documentElement,
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
      setGeoOverrideHash('nz');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('nz');
        expect(geo.allISOCountryGroups).to.deep.equal(
          Object.keys(config.ISOCountryGroups)
        );
        expect(geo.matchedISOCountryGroups).to.deep.equal(['anz']);
      });
    });

    it('isInCountryGroup works with multiple group targets', () => {
      setGeoOverrideHash('nz');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
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
      setGeoOverrideHash('nz');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
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
      setGeoOverrideHash('NZ');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('nz');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    it('should allow uppercase hash for subdivisions', () => {
      setGeoOverrideHash('US US-AL');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('us');
        expect(geo.ISOSubdivision).to.equal('us-al');
        expectElementHasClass(
          doc.body,
          [
            'amp-geo-group-nafta',
            'amp-iso-country-us',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-al',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-geo-group-nafta',
            'amp-iso-country-us',
            'amp-geo-group-usSubdivisions',
            'amp-iso-subdivision-us-al',
          ],
          true
        );
        expectElementHasClass(doc.body, ['amp-iso-country-unknown'], false);
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown'],
          false
        );
      });
    });

    it('should accept uppercase country codes in config', () => {
      setGeoOverrideHash('nz');
      addConfigElement(
        'script',
        'application/json',
        JSON.stringify(configWithUppercase)
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('nz');
        expect(geo.ISOSubdivision).to.equal('unknown');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    it('should accept uppercase country subdivision codes in config', () => {
      setGeoOverrideHash('ca ca-mb');
      addConfigElement(
        'script',
        'application/json',
        JSON.stringify(configWithUppercase)
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('ca');
        expect(geo.ISOSubdivision).to.equal('ca-mb');
        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-ca',
            'amp-iso-subdivision-ca-mb',
            'amp-geo-group-nafta',
            'amp-geo-group-canadaSubdivision',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-iso-country-ca',
            'amp-iso-subdivision-ca-mb',
            'amp-geo-group-nafta',
            'amp-geo-group-canadaSubdivision',
          ],
          true
        );
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-unknown', 'amp-geo-group-anz'],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown', 'amp-geo-group-anz'],
          false
        );
      });
    });

    it('should subdivisions work in GEO_HOT_PATCH mode', () => {
      env.sandbox.stub(geo, 'getHotPatchCountry_').returns('ca ca-nb');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('ca');
        expect(geo.ISOSubdivision).to.equal('ca-nb');

        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-ca',
            'amp-iso-subdivision-ca-nb',
            'amp-geo-group-nafta',
            'amp-geo-group-canadaSubdivisions',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-iso-country-ca',
            'amp-iso-subdivision-ca-nb',
            'amp-geo-group-nafta',
            'amp-geo-group-canadaSubdivisions',
          ],
          true
        );
      });
    });

    it('should allow uppercase for subdivisions in GEO_HOT_PATCH mode', () => {
      env.sandbox.stub(geo, 'getHotPatchCountry_').returns('US US-AL');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('us');
        expect(geo.ISOSubdivision).to.equal('us-al');

        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-us',
            'amp-iso-subdivision-us-al',
            'amp-geo-group-usSubdivisions',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-iso-country-us',
            'amp-iso-subdivision-us-al',
            'amp-geo-group-usSubdivisions',
          ],
          true
        );
      });
    });

    /**
     * pre-rendered geo is the the case where a publisher uses their own
     * infrastructure to add a country tag to the body.
     */
    it('should respect pre-rendered geo tags in the body', () => {
      addConfigElement('script');
      doc.body.classList.add('amp-iso-country-nz', 'amp-geo-group-anz');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('nz');
        expect(geo.ISOSubdivision).to.equal('unknown');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.body[('amp-iso-country-unknown', 'amp-geo-group-nafta')],
          false
        );
      });
    });

    it('should respect pre-rendered geo subscription tags in the body', () => {
      addConfigElement('script');
      doc.body.classList.add(
        'amp-iso-country-ca',
        'amp-iso-subdivision-ca-mb',
        'amp-geo-group-nafta'
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('ca');
        expect(geo.ISOSubdivision).to.equal('ca-mb');
        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-ca',
            'amp-iso-subdivision-ca-mb',
            'amp-geo-group-nafta',
          ],
          true
        );
        expectElementHasClass(
          doc.body[
            ('amp-iso-country-unknown',
            'amp-geo-group-anz',
            'amp-geo-group-canadaSubdivisions')
          ],
          false
        );
      });
    });

    it('should respect pre-rendered geo tags in the html element', () => {
      addConfigElement('script');
      doc.documentElement.classList.add(
        'amp-iso-country-nz',
        'amp-geo-group-anz'
      );
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('nz');
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    it('should allow hash to override pre-rendered geo in test', () => {
      setGeoOverrideHash('nz');
      // NOTE: notide that we cause the the body and html element classes
      // to go out of sync but we still clear `amp-iso-country-mx` AND
      // `amp-geo-group-nafta`.
      doc.documentElement.classList.add('amp-iso-country-mx');
      doc.body.classList.add('amp-geo-group-nafta');
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('nz');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-nz', 'amp-geo-group-anz'],
          true
        );
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-unknown', 'amp-geo-group-nafta'],
          false
        );
      });
    });

    it('should allow hash to override pre-rendered geo sudivision in test', () => {
      setGeoOverrideHash('us us-ny');
      doc.documentElement.classList.add(
        'amp-geo-group-canadaSubdivisions',
        'amp-iso-country-ca',
        'amp-iso-subdivision-ca-mb'
      );
      doc.body.classList.add(
        'amp-geo-group-canadaSubdivisions',
        'amp-iso-country-ca',
        'amp-iso-subdivision-ca-mb'
      );
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('us');
        expect(geo.ISOSubdivision).to.equal('us-ny');
        expectElementHasClass(
          doc.body,
          ['amp-iso-country-us', 'amp-iso-subdivision-us-ny'],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          ['amp-iso-country-us', 'amp-iso-subdivision-us-ny'],
          true
        );
        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-unknown',
            'amp-geo-group-canadaSubdivisions',
            'amp-iso-country-ca',
            'amp-iso-subdivision-ca-mb',
          ],
          false
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-iso-country-unknown',
            'amp-geo-group-canadaSubdivisions',
            'amp-iso-country-ca',
            'amp-iso-subdivision-ca-mb',
          ],
          false
        );
      });
    });

    it('geo service should resolve correctly.', () => {
      addConfigElement('script');
      geo.buildCallback();

      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('unknown');
        expect(geo.matchedISOCountryGroups).to.deep.equal(['nafta', 'unknown']);
        expect(geo.allISOCountryGroups).to.deep.equal([
          'nafta',
          'unknown',
          'eea',
          'myGroup',
          'usSubdivisions',
          'usVA',
          'usCO',
          'usCT',
          'canadaSubdivisions',
          'anz',
          'uscaGroup',
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
      env.sandbox.stub(win.__AMP_MODE, 'localDev').value(false);
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(geo.ISOCountry).to.equal('unknown');
        expectElementHasClass(doc.body, ['amp-geo-error'], true);
        expectElementHasClass(doc.documentElement, ['amp-geo-error'], true);
      });
    });

    it('should recognize country if API has valid schema', () => {
      env.sandbox.stub(win.__AMP_MODE, 'localDev').value(false);
      env.sandbox.stub(urls, 'geoApi').value('/geoapi');
      xhr.fetchJson.resolves({
        json: () => Promise.resolve(JSON.parse('{"country": "ca", "x": "y"}')),
      });
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(userErrorStub).to.not.be.called;
        expect(geo.ISOCountry).to.equal('ca');
      });
    });

    it('should recognize country and subdivision if API has valid schema', () => {
      env.sandbox.stub(win.__AMP_MODE, 'localDev').value(false);
      env.sandbox.stub(urls, 'geoApi').value('/geoapi');
      xhr.fetchJson.resolves({
        json: () =>
          Promise.resolve(JSON.parse('{"country": "us", "subdivision": "ca"}')),
      });
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(userErrorStub).to.not.be.called;
        expect(geo.ISOCountry).to.equal('us');
        expect(geo.ISOSubdivision).to.equal('us-ca');
        expectElementHasClass(
          doc.body,
          [
            'amp-iso-country-us',
            'amp-iso-subdivision-us-ca',
            'amp-geo-group-nafta',
            'amp-geo-group-myGroup',
            'amp-geo-group-uscaGroup',
          ],
          true
        );
        expectElementHasClass(
          doc.documentElement,
          [
            'amp-iso-country-us',
            'amp-iso-subdivision-us-ca',
            'amp-geo-group-nafta',
            'amp-geo-group-myGroup',
            'amp-geo-group-uscaGroup',
          ],
          true
        );
      });
    });

    it('should not recognize country if API has invalid schema', () => {
      expectAsyncConsoleError(/GEONOTPATCHED/);
      env.sandbox.stub(win.__AMP_MODE, 'localDev').value(false);
      env.sandbox.stub(urls, 'geoApi').value('/geoapi');
      xhr.fetchJson.resolves({
        json: () =>
          Promise.resolve(JSON.parse('{"country": "a", "subdivision": "ca"}')),
      });
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(userErrorStub).to.be.called;
        expect(geo.ISOCountry).to.equal('unknown');
        expect(geo.ISOSubdivision).to.equal('unknown');
      });
    });

    it('should not recognize country if API unreachable', () => {
      expectAsyncConsoleError(/GEONOTPATCHED/);
      env.sandbox.stub(win.__AMP_MODE, 'localDev').value(false);
      env.sandbox.stub(urls, 'geoApi').value('/geoapi');
      xhr.fetchJson.rejects({status: 404});
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(userErrorStub).to.be.called;
        expect(geo.ISOCountry).to.equal('unknown');
      });
    });

    it('should not recognize country if API times out', () => {
      expectAsyncConsoleError(/GEONOTPATCHED/);
      env.sandbox.stub(win.__AMP_MODE, 'localDev').value(false);
      env.sandbox.stub(urls, 'geoApi').value('/geoapi');
      env.sandbox.stub(Services, 'timerFor').returns({
        timeoutPromise: function (delay, racePromise, msg) {
          return Promise.race([
            racePromise,
            Promise.reject(user().createError(msg)),
          ]);
        },
      });
      xhr.fetchJson.resolves({
        json: () =>
          new Promise((res) => {
            setTimeout(() => {
              res(JSON.parse('{"country": "ca"}'));
            }, 10);
          }),
      });
      addConfigElement('script');

      geo.buildCallback();
      return Services.geoForDocOrNull(el).then((geo) => {
        expect(userErrorStub).to.be.called;
        expect(geo.ISOCountry).to.equal('unknown');
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
