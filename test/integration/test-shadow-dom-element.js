import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {toggleExperiment} from '#experiments';

import {createFixtureIframe} from '#testing/iframe';

describes.sandboxed('Render a shadow-dom based element', {}, () => {
  let fixture;

  beforeEach(async () => {
    fixture = await createFixtureIframe(
      'test/fixtures/shadow-dom-element.html',
      3000
    );
    toggleExperiment(fixture.win, 'bento', true, true);
  });

  it('should create shadow root', async () => {
    const carousel = fixture.doc.querySelector('amp-base-carousel');
    await whenUpgradedToCustomElement(carousel);
    await carousel.whenBuilt();
    await new Promise(setTimeout);

    expect(carousel.shadowRoot).to.exist;

    const slides = carousel.querySelectorAll('amp-img');
    expect(slides).to.have.length(2);

    const slots = carousel.shadowRoot
      .querySelector('c')
      .querySelectorAll('slot');
    expect(slots).to.have.length(2);

    expect(slides[0].assignedSlot).to.equal(slots[0]);
    expect(slides[1].assignedSlot).to.equal(slots[1]);
    expect(slots[0].assignedNodes()[0]).to.equal(slides[0]);
    expect(slots[1].assignedNodes()[0]).to.equal(slides[1]);
    expect(slots[0].getRootNode()).to.equal(carousel.shadowRoot);
  });
});

describes.sandboxed(
  'Render a shadow-dom based element, force polyfill',
  {},
  () => {
    let fixture;

    beforeEach(async () => {
      fixture = await createFixtureIframe(
        'test/fixtures/shadow-dom-element-polyfill.html',
        3000
      );
      toggleExperiment(fixture.win, 'bento', true, true);
    });

    it('should create shadow root', async () => {
      const carousel = fixture.doc.querySelector('amp-base-carousel');
      await whenUpgradedToCustomElement(carousel);
      await carousel.whenBuilt();
      await new Promise(setTimeout);

      expect(carousel.shadowRoot).to.exist;

      const slides = carousel.querySelectorAll('amp-img');
      expect(slides).to.have.length(2);

      const slots = carousel.shadowRoot
        .querySelector('c')
        .querySelectorAll('slot');
      expect(slots).to.have.length(2);

      expect(slides[0].assignedSlot).to.equal(slots[0]);
      expect(slides[1].assignedSlot).to.equal(slots[1]);
      expect(slots[0].assignedNodes()[0]).to.equal(slides[0]);
      expect(slots[1].assignedNodes()[0]).to.equal(slides[1]);
      expect(slots[0].getRootNode()).to.equal(carousel.shadowRoot);
    });
  }
);
