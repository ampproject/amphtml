import {htmlFor} from '#core/dom/static-template';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {buildGtagConfig} from './auto-analytics-configs';

const buildAutoAnalyticsTemplate = (element) => {
  const html = htmlFor(element);
  return html` <amp-analytics data-credentials="include" type="gtag">
    <script type="application/json"></script>
  </amp-analytics>`;
};

export class AmpStoryAutoAnalytics extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-analytics'
    );
    const analyticsEl = buildAutoAnalyticsTemplate(this.element);
    const configEl = analyticsEl.querySelector('script');
    const gtagId = devAssert(this.element.getAttribute('gtag-id'));
    const analyticsJson = buildGtagConfig(gtagId);
    configEl.textContent = JSON.stringify(analyticsJson);
    this.element.appendChild(analyticsEl);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }
}

AMP.extension('amp-story-auto-analytics', '0.1', (AMP) => {
  AMP.registerElement('amp-story-auto-analytics', AmpStoryAutoAnalytics);
});
