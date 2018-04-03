/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../../src/services';


describes.realWin('amp-geo', {
  amp: {
    extensions: ['amp-geo'],
  },
}, env => {

  const config = {
    ISOCountryGroups: {
      nafta: ['ca', 'mx', 'us', 'unknown'],
      unknown: ['unknown'],
      anz: ['au', 'nz'],
    },
  };

  let win, doc;
  let ampdoc;
  let geo;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    const el = doc.createElement('amp-geo');
    el.ampdoc_ = ampdoc;
    geo = new AmpGeo(el);
  });

  function addConfigElement(opt_elementName, opt_type, opt_textContent) {
    const child = doc.createElement(opt_elementName || 'script');
    child.setAttribute('type', opt_type || 'application/json');
    child.textContent = opt_textContent || JSON.stringify(config);
    geo.element.appendChild(child);
  }

  function expectBodyHasClass(klasses, expected) {
    const bodyKlasses = doc.body.className.split(' ');
    for (const k in klasses) {
      expect(bodyKlasses.includes(klasses[k]))
          .to.equal(expected);
    }
  }

  it('should not throw on valid config', () => {
    expect(() => {
      addConfigElement('script');
      geo.buildCallback();
    }).to.not.throw();
  });

  it('should throw if it has multiple child elements', () => {
    expect(() => {
      addConfigElement('script');
      addConfigElement('script');
      geo.buildCallback();
    }).to.throw(/should have exactly one <script> child​​​/);
  });

  it('should throw if the child element is not a <script> element', () => {
    expect(() => {
      addConfigElement('a');
      geo.buildCallback();
    }).to.throw(/script/);
  });

  it('should throw if the child script element is not json typed', () => {
    expect(() => {
      addConfigElement('script', 'wrongtype');
      geo.buildCallback();
    }).to.throw(/application\/json/);
  });

  it('should throw if the child script element has non-JSON content', () => {
    expect(() => {
      addConfigElement('script', 'application/json', '{not json}');
      geo.buildCallback();
    }).to.throw();
  });

  it('should add classes to body element for the geo', () => {
    addConfigElement('script');

    geo.buildCallback();
    return Services.geoForOrNull(win).then(geo => {
      expect(geo.ISOCountry).to.equal('unknown');
      expectBodyHasClass([
        'amp-iso-country-unknown',
        'nafta',
      ], true);
      expectBodyHasClass([
        'amp-iso-country-nz',
        'anz',
      ], false);
    });
  });

  it('should allow hash to override geo in test', () => {
    win.location.hash = '#amp-geo=nz';
    addConfigElement('script');

    geo.buildCallback();

    return Services.geoForOrNull(win).then(geo => {
      expect(geo.ISOCountry).to.equal('nz');
      expectBodyHasClass([
        'amp-iso-country-nz',
        'anz',
      ], true);
      expectBodyHasClass([
        'amp-iso-country-unknown',
        'nafta',
      ], false);
    });
  });
});
