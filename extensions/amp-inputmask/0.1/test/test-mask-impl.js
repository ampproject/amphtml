import {Mask} from '../mask-impl';

describes.sandboxed('amp-inputmask mask-impl', {}, (env) => {
  class FakeElement {}

  describe('config', () => {
    let constructorStub;

    beforeEach(() => {
      constructorStub = env.sandbox.stub();
      constructorStub.extendDefaults = function () {};
      constructorStub.extendAliases = function () {};
      globalThis.AMP.dependencies = {'inputmaskFactory': () => constructorStub};

      FakeElement.prototype.getAttribute = env.sandbox.stub();
      FakeElement.prototype.addEventListener = env.sandbox.stub();
    });

    it(
      'should create a custom mask with the custom mask string' +
        ' and default options',
      () => {
        const fakeElement = new FakeElement();
        const maskString = '0';

        new Mask(fakeElement, maskString);
        const results = constructorStub.getCall(0).args[0];
        expect(results).to.include.deep({
          'alias': 'custom',
          'customMask': ['9'],
          'jitMasking': true,
          'noValuePatching': true,
          'placeholder': '\u2000',
          'showMaskOnFocus': false,
          'showMaskOnHover': false,
          'trimZeros': 2,
        });
      }
    );

    it(
      'should create a custom mask with the custom mask string' +
        ' and configurable zeros',
      () => {
        const fakeElement = new FakeElement();
        fakeElement.getAttribute.withArgs('mask-trim-zeros').returns('0');
        const maskString = '0';

        new Mask(fakeElement, maskString);

        const results = constructorStub.getCall(0).args[0];
        expect(results).to.include.deep({
          'trimZeros': 0,
        });
      }
    );
  });
});
