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
import '../../../../third_party/react-dates/bundle';
import {AmpDatePicker} from '../amp-date-picker';
import {requireExternal} from '../../../../src/module';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-date-picker', {
  amp: {
    runtimeOn: true,
    extensions: ['amp-date-picker'],
  },
}, env => {
  const moment = requireExternal('moment');
  let win;
  let document;

  const templateJson = `{
    "templates": [{
      "id": "srcTemplate",
      "dates": [
        "2018-01-01",
        "FREQ=WEEKLY;DTSTART=20180101T080000Z;WKST=SU;BYDAY=WE"
      ]
    }, {
      "id": "defaultTemplate"
    }]
  }`;

  const DEFAULT_ATTRS = {
    layout: 'fixed-height',
    height: '360',
  };

  function createDatePicker(opt_attrs) {
    const element = document.createElement('amp-date-picker');
    const attrs = Object.assign({}, DEFAULT_ATTRS, opt_attrs);
    for (const key in attrs) {
      element.setAttribute(key, attrs[key]);
    }

    document.body.appendChild(element);
    const picker = new AmpDatePicker(element);

    return {
      element,
      picker,
    };
  }

  /**
   * Create a template element
   * @param {string} body
   */
  function createTemplate(body) {
    const template = document.createElement('template');
    template.setAttribute('type', 'amp-mustache');
    template.content.appendChild(document.createTextNode(body));
    return template;
  }

  const DEFAULT_TEMPLATE_ATTRS = {
    'date-template': '',
  };

  /**
   * Create a template from a body and attributes
   * @param {string} body
   * @param {!Object<string, string>=} opt_attrs
   */
  function createDateTemplate(body, opt_attrs) {
    const template = createTemplate(body);
    const attrs = Object.assign({}, DEFAULT_TEMPLATE_ATTRS, opt_attrs);
    for (const key in attrs) {
      template.setAttribute(key, attrs[key]);
    }
    return template;
  }

  beforeEach(() => {
    win = env.win;
    document = env.win.document;
    toggleExperiment(win, 'amp-date-picker', true);
  });

  it('should render in the simplest case', () => {
    const {picker} = createDatePicker({
      layout: 'fixed-height',
      height: 360,
    });

    return picker.layoutCallback().then(() => {
      const container = picker.container_;
      expect(container.children.length).to.be.greaterThan(0);
    });
  });

  describe('getFormattedDate_', () => {
    it('should render dates in the default format', () => {
      const {picker} = createDatePicker({locale: 'en'});
      const date = moment('2018-01-01 08Z');
      const formattedDate = picker.getFormattedDate_(date);
      expect(formattedDate).to.equal('2018-01-01');
    });

    it('should always render Unix epoch seconds in english digits', () => {
      const {picker} = createDatePicker({locale: 'en', format: 'X'});
      const date = moment('2018-01-01 08Z');
      const formattedDate = picker.getFormattedDate_(date);
      expect(formattedDate).to.equal('1514793600');
    });

    it('should always render Unix epoch millis in english digits', () => {
      const {picker} = createDatePicker({locale: 'en', format: 'x'});
      const date = moment('2018-01-01 08Z');
      const formattedDate = picker.getFormattedDate_(date);
      expect(formattedDate).to.equal('1514793600000');
    });
  });

  describe('templates', () => {
    describe('element templates', () => {
      it('should parse RRULE and date templates', () => {
        const template = createDateTemplate('{{template}}', {
          dates: '2018-01-01',
        });
        const {picker} = createDatePicker();
        const results = picker.parseElementTemplates_([template]);
        expect(results[0].dates.contains('2018-01-01')).to.be.true;
        expect(results[0].dates.contains('2018-01-02')).to.be.false;
        expect(results[0].template).to.equal(template);
      });
    });

    describe('src templates', () => {
      it('should parse RRULE and date templates', () => {
        const template = createDateTemplate('{{val}}', {
          dates: '2018-01-01',
          id: 'srcTemplate',
        });
        const defaultTemplate = createDateTemplate('{{val}}', {
          id: 'defaultTemplate',
        });
        const {picker, element} = createDatePicker();
        element.appendChild(template);
        element.appendChild(defaultTemplate);

        const {srcTemplates, srcDefaultTemplate} =
            picker.parseSrcTemplates_(win.JSON.parse(templateJson));
        expect(srcTemplates[0].dates.contains('2018-01-01')).to.be.true;
        expect(srcTemplates[0].dates.contains('2018-01-02')).to.be.false;
        expect(srcTemplates[0].dates.contains('2018-01-03')).to.be.true;
        expect(srcTemplates[0].template).to.equal(template);
        expect(srcDefaultTemplate).to.equal(defaultTemplate);
      });
    });
  });
});
