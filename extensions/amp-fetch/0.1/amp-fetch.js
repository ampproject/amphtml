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
        this.xhr_.fetchDocument(this.url, {ampCors: false})
          .catch(error => this.handleDocRequestError_(error));
    }
  }

  handleDocRequestError_(error) {
    error.message += ` ------------ uri: ${this.url}`;
    error.message += ` body: ${this.httpGet(this.url)}`;

    this.dispatchEvent_('error', error);
  }

  httpGet(theUrl) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( 'GET', theUrl, false );
      xmlHttp.send( null );
      return xmlHttp.responseText;
  }

  dispatchEvent_(type, detail = {}) {
    this.element.dispatchEvent(new CustomEvent(type, {detail, bubbles: true}));
  }
}


AMP.extension('amp-fetch', '1.0', AMP => {
  AMP.registerElement('amp-fetch', AmpFetch);
});

