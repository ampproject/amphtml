export default class AmpAnalyticsMultiPageTracker extends AMP.BaseElement {
        constructor(element) {
            super(element);
        }

        isLayoutSupported(layout) {
            return true;
        }
    }

AMP.extension('amp-analytics-multi-page-tracker', '1.0', AMP => {
    AMP.registerElement('amp-analytics-multi-page-tracker', AmpAnalyticsMultiPageTracker);
});
