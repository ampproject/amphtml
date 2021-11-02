import {hasOwn} from '#core/types/object';

import {Services} from '#service';

import {AmpExperiment} from '../amp-experiment';
import * as variant from '../variant';

describes.realWin(
  'amp-experiment',
  {
    amp: {
      extensions: ['amp-experiment'],
    },
  },
  (env) => {
    const config = {
      'experiment-1': {
        variants: {
          'variant-a': 50,
          'variant-b': 50,
        },
      },
      'experiment-2': {
        variants: {
          'variant-c': 50,
          'variant-d': 50,
        },
      },
      'experiment-3': {
        variants: {
          'variant-e': 1,
        },
      },
    };

    let win, doc;
    let ampdoc;
    let experiment;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      const el = doc.createElement('amp-experiment');
      el.ampdoc_ = ampdoc;
      experiment = new AmpExperiment(el);
    });

    function addConfigElement(opt_elementName, opt_type, opt_textContent) {
      const child = doc.createElement(opt_elementName || 'script');
      child.setAttribute('type', opt_type || 'application/json');
      child.textContent = opt_textContent || JSON.stringify(config);
      experiment.element.appendChild(child);
    }

    function expectBodyHasAttributes(attributes) {
      for (const attributeName in attributes) {
        if (hasOwn(attributes, attributeName)) {
          expect(doc.body.getAttribute(attributeName)).to.equal(
            attributes[attributeName]
          );
        }
      }
    }

    it('should not throw on valid config', () => {
      expect(() => {
        addConfigElement('script');
        experiment.buildCallback();
      }).to.not.throw();
    });

    it('should throw if it has no child element', () => {
      expectAsyncConsoleError(/should contain exactly one/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /should contain exactly one/
      );
    });

    it('should throw if it has multiple child elements', () => {
      addConfigElement('script');
      addConfigElement('script');
      expectAsyncConsoleError(/should contain exactly one/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /should contain exactly one/
      );
    });

    it('should throw if the child element is not a <script> element', () => {
      addConfigElement('a');
      expectAsyncConsoleError(/script/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /script/
      );
    });

    it('should throw if the child script element is not json typed', () => {
      addConfigElement('script', 'wrongtype');
      expectAsyncConsoleError(/application\/json/);
      return expect(experiment.buildCallback()).to.eventually.be.rejectedWith(
        /application\/json/
      );
    });

    it('should throw if the child script element has non-JSON content', () => {
      addConfigElement('script', 'application/json', '{not json}');
      expectAsyncConsoleError(/.*/);
      return experiment.buildCallback().then(
        () => {
          throw new Error('must have failed');
        },
        () => {
          return Services.variantsForDocOrNull(ampdoc.getHeadNode())
            .then((service) => service.getVariants())
            .then((variants) => {
              expect(variants).to.deep.equal({});
            });
        }
      );
    });

    it('should add attributes to body element for the allocated variants', () => {
      addConfigElement('script');
      const stub = env.sandbox.stub(variant, 'allocateVariant');
      stub
        .withArgs(ampdoc, 'experiment-1', config['experiment-1'])
        .returns(Promise.resolve('variant-a'));
      stub
        .withArgs(ampdoc, 'experiment-2', config['experiment-2'])
        .returns(Promise.resolve('variant-d'));
      stub
        .withArgs(ampdoc, 'experiment-3', config['experiment-3'])
        .returns(Promise.resolve(null));

      experiment.buildCallback();
      return Services.variantsForDocOrNull(ampdoc.getHeadNode())
        .then((variantsService) => variantsService.getVariants())
        .then((variants) => {
          expect(variants).to.jsonEqual({
            'experiment-1': 'variant-a',
            'experiment-2': 'variant-d',
            'experiment-3': null,
          });
          expectBodyHasAttributes({
            'amp-x-experiment-1': 'variant-a',
            'amp-x-experiment-2': 'variant-d',
          });
          expect(doc.body.getAttribute('amp-x-experiment-3')).to.equal(null);
        });
    });
  }
);
