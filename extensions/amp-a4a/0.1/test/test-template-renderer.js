import '../../../amp-mustache/0.2/amp-mustache';
import {utf8Encode} from '#core/types/string/bytes';

import {data} from './testdata/valid_css_at_rules_amp.reserialized';

import {getAmpAdTemplateHelper} from '../amp-ad-template-helper';
import {ValidatorResult} from '../amp-ad-type-defs';
import {TemplateRenderer} from '../template-renderer';
import {
  AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  TemplateValidator,
} from '../template-validator';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('TemplateRenderer', realWinConfig, (env) => {
  const templateUrl = 'https://adnetwork.com/amp-template.html';
  const headers = {
    get: (name) => {
      if (name == AMP_TEMPLATED_CREATIVE_HEADER_NAME) {
        return 'amp-mustache';
      }
    },
  };

  let doc, ampdoc;
  let containerElement;
  let context;
  let renderer;
  let validator;
  let validatorPromise;

  beforeEach(() => {
    doc = env.win.document;
    ampdoc = env.ampdoc;
    renderer = new TemplateRenderer();
    validator = new TemplateValidator();

    containerElement = doc.createElement('div');
    containerElement.setAttribute('height', 50);
    containerElement.setAttribute('width', 320);
    containerElement.signals = () => ({
      signal: () => {},
      reset: () => {},
      whenSignal: () => Promise.resolve(),
    });
    containerElement.renderStarted = () => {};
    containerElement.getLayoutBox = () => ({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    containerElement.getIntersectionChangeEntry = () => ({});
    containerElement.isInViewport = () => true;
    containerElement.getAmpDoc = () => env.ampdoc;
    doc.body.appendChild(containerElement);

    context = {
      win: env.win,
      adUrl: 'http://www.google.com',
      size: {width: '320', height: '50'},
      sentinel: 's-1234',
    };

    env.sandbox
      .stub(getAmpAdTemplateHelper(ampdoc), 'fetch')
      .callsFake((url) => {
        expect(url).to.equal(templateUrl);
        return Promise.resolve(data.adTemplate);
      });

    validatorPromise = validator.validate(
      context,
      containerElement,
      utf8Encode(
        JSON.stringify({
          templateUrl,
          data: {url: 'https://buy.com/buy-1'},
          analytics: {foo: 'bar'},
        })
      ),
      headers
    );
  });

  afterEach(() => {
    doc.body.removeChild(containerElement);
  });

  it('should append iframe child with correct template values', () => {
    env.installExtension(
      'amp-mustache',
      '0.2',
      /* latest */ true,
      /* auto */ false
    );
    return validatorPromise.then((validatorOutput) => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          const iframe = containerElement.querySelector('iframe');
          expect(iframe).to.be.ok;
          expect(iframe.contentWindow.document.body.innerHTML.trim()).to.equal(
            '<div>\n      <p>ipsum lorem</p>\n      <a target="_top" href=' +
              '"https://buy.com/buy-1">Click for ad!</a>' +
              '\n    <amp-analytics class="i-amphtml-element i-amphtml' +
              '-notbuilt amp-notbuilt i-amphtml-layout-fixed i-amphtml' +
              '-layout-size-defined" i-amphtml-layout="fixed" style="width: ' +
              '1px; height: 1px;"></amp-analytics></div>'
          );
        });
    });
  });

  it('should set correct attributes on the iframe', () => {
    env.installExtension(
      'amp-mustache',
      '0.2',
      /* latest */ true,
      /* auto */ false
    );
    return validatorPromise.then((validatorOutput) => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          const iframe = containerElement.querySelector('iframe');
          expect(iframe).to.be.ok;
          expect(iframe.getAttribute('width')).to.equal('320');
          expect(iframe.getAttribute('height')).to.equal('50');
          expect(iframe.getAttribute('frameborder')).to.equal('0');
          expect(iframe.getAttribute('allowfullscreen')).to.equal('');
          expect(iframe.getAttribute('allowtransparency')).to.equal('');
          expect(iframe.getAttribute('scrolling')).to.equal('no');
        });
    });
  });

  it('should style body of iframe document to be visible', () => {
    env.installExtension(
      'amp-mustache',
      '0.2',
      /* latest */ true,
      /* auto */ false
    );
    return validatorPromise.then((validatorOutput) => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          const iframe = containerElement.querySelector('iframe');
          expect(iframe).to.be.ok;
          expect(iframe.contentWindow.document.body.style.visibility).to.equal(
            'visible'
          );
        });
    });
  });

  it('should insert analytics', () => {
    env.installExtension(
      'amp-mustache',
      '0.2',
      /* latest */ true,
      /* auto */ false
    );
    const insertAnalyticsSpy = env.sandbox.spy(
      getAmpAdTemplateHelper(ampdoc),
      'insertAnalytics'
    );
    return validatorPromise.then((validatorOutput) => {
      // Sanity check. This behavior is tested in test-template-validator.js.
      expect(validatorOutput).to.be.ok;
      expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      const {creativeData} = validatorOutput;
      expect(creativeData).to.be.ok;
      return renderer
        .render(context, containerElement, creativeData)
        .then(() => {
          expect(insertAnalyticsSpy).to.be.calledOnce;
        });
    });
  });
});
