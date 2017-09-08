import {xhrFor} from '../../../src/services';
import {Layout} from '../../../src/layout';

const requests = {};

export default class AmpFetch extends AMP.BaseElement {
  constructor(element) {
    super(element);
    this.xhr_ = xhrFor(element.ownerDocument.defaultView);
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

AMP.registerElement('amp-fetch', AmpFetch);
