

import {
  ShadowDomVersion,
  getShadowDomSupportedVersion,
  isShadowDomSupported,
  setShadowDomSupportedVersionForTesting,
} from '#core/dom/web-components';

describes.sandboxed('DOM - web components', {}, () => {
  beforeEach(() => {
    setShadowDomSupportedVersionForTesting(undefined);
  });

  it('should report whether native shadow dom supported', () => {
    const shadowDomV0 = !!Element.prototype.createShadowRoot;
    const shadowDomV1 = !!Element.prototype.attachShadow;
    expect(isShadowDomSupported()).to.equal(shadowDomV0 || shadowDomV1);
  });
});

describes.realWin('Web Components spec', {}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
    setShadowDomSupportedVersionForTesting(undefined);
  });

  describe('Shadow DOM', () => {
    it('reports NONE when no spec is available', () => {
      win.Element.prototype.createShadowRoot = undefined;
      win.Element.prototype.attachShadow = undefined;

      expect(getShadowDomSupportedVersion(win.Element)).to.equal(
        ShadowDomVersion.NONE
      );
    });

    it('gives preference to v1 over v0 when both specs are available', () => {
      if (
        !!win.Element.prototype.createShadowRoot &&
        !!win.Element.prototype.attachShadow
      ) {
        expect(getShadowDomSupportedVersion(win.Element)).to.equal(
          ShadowDomVersion.V1
        );
      }
    });

    it('reports v0 when available but v1 is not', () => {
      if (!!win.Element.prototype.createShadowRoot) {
        win.Element.prototype.attachShadow = undefined;

        expect(getShadowDomSupportedVersion(win.Element)).to.equal(
          ShadowDomVersion.V0
        );
      }
    });
  });
});
