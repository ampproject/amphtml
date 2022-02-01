import {toggleExperiment} from '#experiments';

import {AttributeMutationDefaultClass} from '../mutation/attribute-mutation-default-class';
import {AttributeMutationDefaultStyle} from '../mutation/attribute-mutation-default-style';
import {AttributeMutationDefaultUrl} from '../mutation/attribute-mutation-default-url';

describes.realWin(
  'amp-experiment attribute-mutation-*',
  {
    amp: {
      extensions: ['amp-experiment:1.0'],
    },
  },
  (env) => {
    let win, doc;
    let elements;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      toggleExperiment(win, 'amp-experiment-1.0', true);
      elements = [doc.createElement('test1'), doc.createElement('test2')];
      doc.body.innerHTML = '';
    });

    function getAttributeMutationParamsObject(attributeName, value) {
      return {
        mutationRecord: {
          'type': 'characterData',
          'target': '.my-test-element-with-this-class',
          'value': value,
          'attributeName': attributeName,
        },
        elements,
      };
    }

    function getAttributeMutationDefaultClass(value) {
      const paramsObject = getAttributeMutationParamsObject(
        'class',
        value,
        'div'
      );
      return new AttributeMutationDefaultClass(
        paramsObject.mutationRecord,
        paramsObject.elements
      );
    }

    function getAttributeMutationDefaultStyle(value) {
      const paramsObject = getAttributeMutationParamsObject(
        'style',
        value,
        'div'
      );
      return new AttributeMutationDefaultStyle(
        paramsObject.mutationRecord,
        paramsObject.elements
      );
    }

    function getAttributeMutationDefaultUrl(value) {
      elements = elements;
      const paramsObject = getAttributeMutationParamsObject('href', value);
      return new AttributeMutationDefaultUrl(
        paramsObject.mutationRecord,
        paramsObject.elements
      );
    }

    describe('parseAndValidate', () => {
      describe('default class', () => {
        it('should allow valid mutations', () => {
          const attributeMutation =
            getAttributeMutationDefaultClass('my-class');
          expect(attributeMutation.parseAndValidate()).to.be.equal(true);
        });

        it('should not allow i-amphtml-*', () => {
          const attributeMutation =
            getAttributeMutationDefaultClass('i-amphtml-my-class');
          expect(attributeMutation.parseAndValidate()).to.be.equal(false);
        });
      });

      describe('default style', () => {
        it('forbid keywords', () => {
          // !important
          let attributeMutation = getAttributeMutationDefaultStyle(
            'color: #000000 !important;'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(false);

          // invalid style attribute value "<"
          attributeMutation =
            getAttributeMutationDefaultStyle('color: <#000000;');
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });

        it('NOT allowed style mutations', () => {
          const attributeMutation =
            getAttributeMutationDefaultStyle('random: abc');
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });

        it('style mutations format', () => {
          let attributeMutation = getAttributeMutationDefaultStyle('');
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation = getAttributeMutationDefaultStyle(
            'background-color red'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(false);

          attributeMutation = getAttributeMutationDefaultStyle(
            'background-color ::red'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(false);

          attributeMutation =
            getAttributeMutationDefaultStyle('background-color: ');
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: red; ;'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation = getAttributeMutationDefaultStyle(
            '  background-color: red      ;background-color:green;   '
          );
          expect(attributeMutation.parseAndValidate()).to.equal(true);
        });

        it('allow all mutations', () => {
          let attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: #o7FogD'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: red'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: invalid'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(true);
        });

        it('visibility mutations', () => {
          let attributeMutation =
            getAttributeMutationDefaultStyle('visibility: hidden');
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation = getAttributeMutationDefaultStyle(
            'visibility: visible'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(false);

          attributeMutation = getAttributeMutationDefaultStyle(
            'visibility: hiddenhidden'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(false);

          attributeMutation = getAttributeMutationDefaultStyle('visibility: ');
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });

        it('display mutations', () => {
          let attributeMutation =
            getAttributeMutationDefaultStyle('display: none');
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation = getAttributeMutationDefaultStyle(
            'display: nonehidden'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });

        it('position mutations', () => {
          let attributeMutation =
            getAttributeMutationDefaultStyle('position: absolute');
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          attributeMutation =
            getAttributeMutationDefaultStyle('position: fixed');
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });

        it('width height mutations', () => {
          let attributeMutation = getAttributeMutationDefaultStyle(
            'width: 100; height: inherit'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(true);

          elements = [doc.createElement('amp-foo')];
          attributeMutation = getAttributeMutationDefaultStyle(
            'width: 100; height: inherit'
          );
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });
      });

      describe('default url', () => {
        it('should allow valid mutations', () => {
          elements = [document.createElement('a')];
          const attributeMutation =
            getAttributeMutationDefaultUrl('https://amp.dev/');
          expect(attributeMutation.parseAndValidate()).to.equal(true);
        });

        it('should not allow http:// mutations', () => {
          const attributeMutation =
            getAttributeMutationDefaultUrl('http://amp.dev/');
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });

        it('should not allow non HTTPS mutations', () => {
          const attributeMutation =
            getAttributeMutationDefaultUrl('tel:555-555-5555');
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });

        it('should not allow unsupported element mutations', () => {
          const attributeMutation =
            getAttributeMutationDefaultUrl('tel:555-555-5555');
          attributeMutation.elements = [doc.createElement('div')];
          expect(attributeMutation.parseAndValidate()).to.equal(false);
        });
      });
    });

    describe('mutate', () => {
      it('should mutate default class mutations', () => {
        const attributeMutation = getAttributeMutationDefaultClass('my-class');
        const {attributeName, value} = attributeMutation.mutationRecord_;

        attributeMutation.parseAndValidate();
        attributeMutation.mutate();

        attributeMutation.elements_.forEach((element) => {
          expect(element.getAttribute(attributeName)).to.equal(value);
        });
      });

      describe('style mutations', () => {
        it('should mutate default style mutations with multi', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: #000000; color: #000000'
          );
          attributeMutation.parseAndValidate();
          attributeMutation.mutate();

          attributeMutation.elements_.forEach((element) => {
            expect(element.getAttribute('style')).to.equal(
              'background-color: rgb(0, 0, 0); color: rgb(0, 0, 0);'
            );
          });
        });

        it('should not override', () => {
          const attributeMutation = getAttributeMutationDefaultStyle(
            'background-color: #000000; color: #000000'
          );

          elements[0].setAttribute(
            'style',
            'width: 30px; background-color: #ffffff'
          );
          attributeMutation.parseAndValidate();
          attributeMutation.mutate();

          expect(elements[0].getAttribute('style')).to.equal(
            'width: 30px; ' +
              'background-color: rgb(0, 0, 0); ' +
              'color: rgb(0, 0, 0);'
          );
        });
      });

      it('should mutate default url mutations', () => {
        const element1 = document.createElement('amp-img');
        const element2 = document.createElement('a');
        elements = [element1, element2];
        const mutatedAttributesCallbackSpy = env.sandbox.spy();
        element1.mutatedAttributesCallback = () => {
          mutatedAttributesCallbackSpy();
        };
        const attributeMutation =
          getAttributeMutationDefaultUrl('https://amp.dev/');
        const {attributeName, value} = attributeMutation.mutationRecord_;
        attributeMutation.parseAndValidate();
        attributeMutation.mutate();

        attributeMutation.elements_.forEach((element) => {
          expect(element.getAttribute(attributeName)).to.equal(value);
        });
        expect(mutatedAttributesCallbackSpy).to.be.calledOnce;
      });
    });
  }
);
