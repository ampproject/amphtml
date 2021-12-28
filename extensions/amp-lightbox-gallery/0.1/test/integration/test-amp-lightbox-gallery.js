import * as analytics from '#utils/analytics';

import {poll} from '#testing/iframe';

// TODO(cathyxz, #16822): This suite is flaky.
describes.sandboxed.configure().skip('amp-lightbox-gallery', function () {
  this.timeout(10000);
  const extensions = ['amp-lightbox-gallery'];
  const body = `
  <style amp-custom>
    .amp-lightbox-gallery-caption{
      color: red;
    }
  </style>
  <figure>
  <amp-img id="img0"
      src="/examples/img/sample.jpg"
      width=641 height=481 layout="responsive"
      lightbox
      role="button" tabindex="0"></amp-img>
  <figcaption>
    This is a figcaption.
  </figcaption>
</figure>
`;

  describes.integration(
    'amp-lightbox-gallery with one image',
    {
      body,
      extensions,
    },
    (env) => {
      let win;
      let triggerAnalyticsEventSpy;

      beforeEach(() => {
        win = env.win;
        win.__AMP_MODE.localDev = true;
        triggerAnalyticsEventSpy = env.sandbox.spy(
          analytics,
          'triggerAnalyticsEvent'
        );
      });

      it('should open and close correctly', () => {
        const lightbox = win.document.getElementById('amp-lightbox-gallery');
        return openLightbox(win.document)
          .then(() => {
            expect(lightbox).to.not.have.display('none');
            const carouselQuery = lightbox.getElementsByTagName('AMP-CAROUSEL');
            expect(carouselQuery.length).to.equal(1);
            const carousel = carouselQuery[0];
            const imageViewerQuery =
              carousel.getElementsByTagName('AMP-IMAGE-VIEWER');
            expect(imageViewerQuery.length).to.equal(1);
            const imageViewer = imageViewerQuery[0];
            const img = imageViewer.querySelector(
              'img.i-amphtml-image-viewer-image'
            );
            expect(img.getAttribute('src')).to.equal(
              '/examples/img/sample.jpg'
            );
            const closeButton = lightbox.querySelector(
              '.i-amphtml-lbg-button-close.i-amphtml-lbg-button'
            );
            const lightboxClose = waitForLightboxClose(lightbox, carousel);
            closeButton.click();
            return lightboxClose;
          })
          .then(() => {
            expect(lightbox).to.have.display('none');
          });
      });

      it('should show close button only for one lightboxed item', () => {
        return openLightbox(win.document).then(() => {
          const controlsContainerQuery = win.document.getElementsByClassName(
            'i-amphtml-lbg-controls'
          );
          expect(controlsContainerQuery.length).to.equal(1);
          const controlsContainer = controlsContainerQuery[0];
          expect(controlsContainer.classList.contains('i-amphtml-lbg-single'))
            .to.be.true;

          const closeButton = getButton(
            win.document,
            'i-amphtml-lbg-button-close'
          );
          expect(closeButton.getAttribute('aria-label')).to.equal('Close');
          expect(closeButton).to.have.display('block');

          const galleryButton = getButton(
            win.document,
            'i-amphtml-lbg-button-gallery'
          );
          expect(galleryButton.getAttribute('aria-label')).to.equal('Gallery');
          expect(galleryButton).to.have.display('none');

          const prevButton = getButton(
            win.document,
            'i-amphtml-lbg-button-prev'
          );
          expect(prevButton.getAttribute('aria-label')).to.equal('Prev');
          expect(prevButton).to.have.display('none');

          const nextButton = getButton(
            win.document,
            'i-amphtml-lbg-button-next'
          );
          expect(nextButton.getAttribute('aria-label')).to.equal('Next');
          expect(nextButton).to.have.display('none');
        });
      });

      it('should display text description with applied style', () => {
        openLightbox(win.document).then(() => {
          const descBoxQuery = win.document.getElementsByClassName(
            'i-amphtml-lbg-desc-box'
          );
          expect(descBoxQuery.length).to.equal(1);
          const descBox = descBoxQuery[0];
          expect(descBox.classList.contains('i-amphtml-lbg-standard')).to.be
            .true;
          expect(descBox.children.length).to.equal(2);
          const descriptionMask = descBox.children[0];
          expect(descriptionMask.classList.contains('i-amphtml-lbg-desc-mask'))
            .to.be.true;

          const descriptionText = descBox.children[1];
          expect(descriptionText.classList.contains('i-amphtml-lbg-desc-text'))
            .to.be.true;
          expect(descriptionText.textContent).to.equal('This is a figcaption.');
          expect(descriptionText.style).to.have.property('color', 'red');
        });
      });

      it('should trigger analytics events for description displayed', () => {
        openLightbox(win.document).then(() => {
          expect(triggerAnalyticsEventSpy).to.be.called;
          expect(triggerAnalyticsEventSpy).to.be.calledWith(
            win.document.getElementById('amp-lightbox-gallery'),
            'controlsToggled'
          );
        });
      });

      it('should trigger analytics events for thumbnails displayed', () => {
        openLightbox(win.document).then(() => {
          const thumbnail = document.getElementsByClassName(
            'i-amphtml-lbg-button-gallery'
          );
          thumbnail[0].click();
          const thumbnailQuery = win.document.getElementsByClassName(
            'i-amphtml-lbg-gallery'
          );
          expect(triggerAnalyticsEventSpy).to.be.called;
          expect(triggerAnalyticsEventSpy).to.be.calledWith(
            win.document.getElementById('amp-lightbox-gallery'),
            'descriptionToggled'
          );
          expect(thumbnailQuery.length).to.equal(1);
        });
      });
    }
  );

  const multipleImagesBody = `
  <figure>
  <amp-img id="img0"
      src="/examples/img/sample.jpg"
      width=641 height=481 layout="responsive"
      lightbox
      role="button" tabindex="0"></amp-img>
  <figcaption>
    This is a figcaption.
  </figcaption>
  </figure>
  <figure>
  <amp-img id="img1"
    src="/examples/img/sample.jpg"
    width=641 height=481 layout="responsive"
    lightbox
    role="button" tabindex="0"></amp-img>
  <figcaption>
  This is a figcaption.
  </figcaption>
  </figure>
  `;

  describes.integration(
    'amp-lightbox-gallery with multiple images',
    {
      multipleImagesBody,
      extensions,
    },
    (env) => {
      let win;
      let triggerAnalyticsEventSpy;

      beforeEach(() => {
        win = env.win;
        win.__AMP_MODE.localDev = true;
        triggerAnalyticsEventSpy = env.sandbox.spy(
          analytics,
          'triggerAnalyticsEvent'
        );
      });

      it('should trigger analytics events for description toggled', () => {
        const lightbox = win.document.getElementById('amp-lightbox-gallery');
        openLightbox(win.document).then(() => {
          const nextButton = lightbox.querySelector(
            'i-amphtml-lbg-button-next'
          );
          nextButton.click();
          expect(triggerAnalyticsEventSpy).to.be.called;
          expect(triggerAnalyticsEventSpy).to.be.calledWith(
            win.document.getElementById('amp-lightbox-gallery'),
            'descriptionToggled'
          );
        });
      });
    }
  );
});

function openLightbox(document) {
  const lightbox = document.getElementById('amp-lightbox-gallery');
  expect(lightbox).to.have.display('none');
  const ampImage = document.getElementById('img0');
  const imageLoadedPromise = waitForImageToLoad(ampImage);
  return imageLoadedPromise.then(() => {
    const ampImage = document.getElementById('img0');
    // Simulate a click on the img inside the amp-img, because this is
    // what people tend to actually click on.
    const openerImage = ampImage.querySelector('img[amp-img-id="img0"]');
    const openedPromise = waitForLightboxOpen(lightbox);
    openerImage.click();
    return openedPromise;
  });
}

function getButton(document, className) {
  const buttonQuery = document.getElementsByClassName(className);
  const button = buttonQuery[0];
  return button;
}

function waitForLightboxOpen(lightbox) {
  return poll('wait for amp-lightbox-gallery to open', () => {
    const styles = lightbox.ownerNode.defaultView.getComputedStyle(lightbox);
    return styles.display != 'none' && lightbox.style.opacity == '';
  });
}

function waitForLightboxClose(lightbox, carousel) {
  return poll('wait for amp-lightbox-gallery to close', () => {
    const styles = carousel.ownerNode.defaultView.getComputedStyle(carousel);
    return styles.display == 'none';
  });
}

function waitForImageToLoad(ampImage) {
  return poll('wait for img0 to load', () => {
    const openerImage = ampImage.querySelector('img[amp-img-id="img0"]');
    return openerImage !== null;
  });
}
