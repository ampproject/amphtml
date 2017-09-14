import {Services} from '../../../src/services';
import {Layout} from '../../../src/layout';

const requests = {};

export default class AmpFetch extends AMP.BaseElement {
  constructor(element) {
    super(element);
    this.xhr_ = Services.xhrFor(element.ownerDocument.defaultView);
  }

  buildCallback() {
    this.url = this.element.getAttribute('url');
  }

  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  viewportCallback(visible) {
    if (this.url && visible) {
      requests[this.url] = requests[this.url] ||
        this.xhr_.fetchDocument(this.url, {ampCors: false});
    }
  }
}


AMP.extension('amp-fetch', '1.0', AMP => {
  AMP.registerElement('amp-fetch', AmpFetch);
});

