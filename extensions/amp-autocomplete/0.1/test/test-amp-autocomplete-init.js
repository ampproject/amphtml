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

import '../amp-autocomplete';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-autocomplete init', {
  amp: {
    extensions: ['amp-autocomplete'],
  },
}, env => {

  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    toggleExperiment(win, 'amp-autocomplete', true);
  });

  function getAutocomplete(attributes,
    json = '{ "items" : ["apple", "banana", "orange"] }',
    wantInlineData = true) {
    const ampAutocomplete = doc.createElement('amp-autocomplete');
    ampAutocomplete.setAttribute('layout', 'container');
    for (const key in attributes) {
      ampAutocomplete.setAttribute(key, attributes[key]);
    }

    const input = win.document.createElement('input');
    input.setAttribute('type', 'text');
    ampAutocomplete.appendChild(input);

    if (wantInlineData) {
      const script = win.document.createElement('script');
      script.setAttribute('type', 'application/json');
      script.innerHTML = json;
      ampAutocomplete.appendChild(script);
    } else {
      sandbox.stub(ampAutocomplete.implementation_, 'getRemoteData_').returns(
          Promise.resolve(json.items)
      );
    }

    doc.body.appendChild(ampAutocomplete);
    return ampAutocomplete.build().then(() => ampAutocomplete);
  }

  it('should render with experiment on', () => {
    return getAutocomplete({
      'filter': 'substring',
    }).then(ampAutocomplete => {
      const impl = ampAutocomplete.implementation_;
      const expectedItems = ['apple', 'banana', 'orange'];
      expect(impl.inlineData_).to.have.ordered.members(expectedItems);
      expect(impl.inputElement__).not.to.be.null;
      expect(impl.container_).not.to.be.null;
      expect(impl.filter_).to.equal('substring');

      const renderSpy = sandbox.spy(impl, 'renderResults_');
      return ampAutocomplete.layoutCallback().then(() => {
        expect(impl.inputElement_.hasAttribute('autocomplete')).to.be.true;
        expect(renderSpy).to.have.been.calledOnce;
      });
    });
  });

  it('should require filter attribute', () => {
    return allowConsoleError(() => {
      return expect(getAutocomplete({})).to.be
          .rejectedWith('amp-autocomplete requires "filter" attribute.​​​');
    });
  });

  it('should require valid filter attribute', () => {
    return allowConsoleError(() => {
      return expect(getAutocomplete({
        'filter': 'invalid-option',
      })).to.be.rejectedWith('Unexpected filter: invalid-option');
    });
  });

  it('should render with min-characters passed', () => {
    return getAutocomplete({
      'filter': 'substring',
      'min-characters': '3',
    }).then(ampAutocomplete => {
      expect(ampAutocomplete.implementation_.minChars_).to.equal(3);
    });
  });

  it('should render with max-entries passed', () => {
    return getAutocomplete({
      'filter': 'substring',
      'max-entries': '10',
    }).then(ampAutocomplete => {
      expect(ampAutocomplete.implementation_.maxEntries_).to.equal(10);
    });
  });

  it('should not render with experiment off', () => {
    toggleExperiment(win, 'amp-autocomplete', false);
    return allowConsoleError(() => {
      return expect(getAutocomplete({})).to.be.rejectedWith(
          'Experiment amp-autocomplete is not turned on.');
    });
  });

  it('should error with invalid JSON script', () => {
    expectAsyncConsoleError('Unexpected token o in JSON at position'
      + ' 32 [object HTMLElement]');
    return expect(getAutocomplete({
      'filter': 'substring',
    }, '{ "items" : ["apple", "banana", orange] }')).to.be.rejectedWith(
        'Unexpected token o in JSON at position 32');
  });

  it('should accept empty JSON script', () => {
    return getAutocomplete({
      'filter': 'substring',
    }, '{}').then(ampAutocomplete => {
      const impl = ampAutocomplete.implementation_;
      expect(impl.inlineData_).to.be.an('array').that.is.empty;
    });
  });

  it('should accept empty items JSON script', () => {
    return getAutocomplete({
      'filter': 'substring',
    }, '{ "items" : [] }').then(ampAutocomplete => {
      const impl = ampAutocomplete.implementation_;
      expect(impl.inlineData_).to.be.an('array').that.is.empty;
    });
  });

  it('should fetch remote data when specified in src', () => {
    const data = {
      items: [
        'Albany, New York',
        'Annapolis, Maryland',
        'Atlanta, Georgia',
        'Augusta, Maine',
        'Austin, Texas',
      ],
    };
    return getAutocomplete({
      'filter': 'substring',
      'src': 'https://examples.com/json',
    }, data, false).then(ampAutocomplete => {
      const impl = ampAutocomplete.implementation_;
      expect(impl.inlineData_).to.have.ordered.members(data.items);
    });
  });
});
