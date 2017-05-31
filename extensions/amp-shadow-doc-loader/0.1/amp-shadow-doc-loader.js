import {xhrFor} from '../../../src/services';
import {dev} from '../../../src/log';
import {createLoaderElement} from '../../../src/loader';
import {Layout} from '../../../src/layout';
import {VisibilityState} from '../../../src/visibility-state';
import {CSS} from '../../../build/amp-shadow-doc-loader-0.1.css';

const RETRY_BUTTON_CLASS_NAME = 'amp-shadow-doc-loader-retry-button';
const RETRY_PLACEHOLDER_CLASS_NAME = 'amp-shadow-doc-loader-retry-placeholder';
const VISIBILITY_MANAGMENT = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual'
};

let uuid = 0;

export default class AmpShadowDocLoader extends AMP.BaseElement {
  constructor(element) {
    super(element);

    this.xhr_ = xhrFor(element.ownerDocument.defaultView);
    this.ampDocRequest_ = null;
    this.ampDoc_ = null;
    this.retry_ = this.retry_.bind(this);

    this.registerAction('retry', this.retry_);
  }

  buildCallback() {
    if (!this.element.id) {
      this.element.id = `AMP_SHADOW_DOC_LOADER_${uuid++}`;
    }

    this.visibilityManagment_ =
      this.element.getAttribute('visibility-managment')
        === VISIBILITY_MANAGMENT.MANUAL
          ? VISIBILITY_MANAGMENT.MANUAL : VISIBILITY_MANAGMENT.AUTOMATIC;
    this.docUrl_ = this.element.getAttribute('doc-url');
    this.retryLabel_ = this.element.getAttribute('retry-label');
    dev().assert(this.docUrl_ !== null, 'Attribute "doc-url" is required');
    dev().assert(this.retryLabel_ !== null,
      'Attribute "retry-label" is required');
  }

  getInnerAmpDoc() {
    return this.ampDoc_;
  }

  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  layoutCallback() {
    return this.createLoader_()
      .then(() => this.fetchAmpDocument())
      .then(doc => this.attachAMPDocument_(doc))
      .catch(error => this.handleDocRequestError_(error));
  }

  prerenderAllowed() {
    return true;
  }

  getDefaultVisibilityState() {
    return this.isInViewport()
      ? VisibilityState.VISIBLE
      : VisibilityState.PRERENDER;
  }

  createPlaceholderCallback() {
    return this.createPlaceholder_();
  }

  preconnectCallback() {
    this.fetchAmpDocument();
  }

  viewportCallback() {
    if (this.visibilityManagment_ === VISIBILITY_MANAGMENT.AUTOMATIC
      && this.ampDoc_) {

      this.ampDoc_.setVisibilityState(VisibilityState.VISIBLE);
    }
  }

  detachedCallback() {
    if (this.ampDoc_) {
      this.ampDoc_.close();
      this.ampDoc_ = null;
    }
  }

  retry_() {
    this.createLoader_()
      .then(() => this.fetchAmpDocument(true))
      .then(doc => this.attachAMPDocument_(doc))
      .catch(error => this.handleDocRequestError_(error));
  }

  handleDocRequestError_(error) {
    this.dispatchEvent_('error', error);
    this.createRetryButton_();
  }

  attachAMPDocument_(doc) {
    return new Promise(resolve => {
      this.deferMutate(() => {
        this.removePlaceholder_();
        this.ampDoc_ = AMP.attachShadowDoc(this.element, doc, this.docUrl_,
          { visibilityState: this.getDefaultVisibilityState() });
        resolve();
      });
    })
    .then(() => this.dispatchEvent_('load'));
  }

  dispatchEvent_(type, detail = {}) {
    this.element.dispatchEvent(new CustomEvent(type, {detail, bubbles: true}));
  }

  createRetryButton_() {
    const container = this.createPlaceholder_();
    container.classList.add(RETRY_PLACEHOLDER_CLASS_NAME);

    const button = this.element.ownerDocument.createElement('button');

    button.classList.add(RETRY_BUTTON_CLASS_NAME);
    button.innerText = this.retryLabel_;
    button.setAttribute('on', `tap:${this.element.id}.retry`);
    container.appendChild(button);

    return this.replacePlaceholder_(container);
  }

  createLoader_() {
    const container = this.createPlaceholder_();
    const loader = createLoaderElement(
      this.element.ownerDocument, this.element.tagName);

    loader.classList.add('amp-active');
    container.appendChild(loader);

    return this.replacePlaceholder_(container);
  }

  createPlaceholder_() {
    const container = this.element.ownerDocument.createElement('div');
    container.style.height = '100vh';

    return container;
  }

  removePlaceholder_() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
  }

  replacePlaceholder_(el) {
    return new Promise(resolve => {
      this.getVsync().mutate(() => {
        this.element.replaceChild(el, this.element.firstChild);
        resolve();
      });
    });
  }

  fetchAmpDocument(force = false) {
    this.ampDocRequest_ = this.ampDocRequest_ && !force
      ? this.ampDocRequest_
      : this.xhr_.fetchDocument(this.docUrl_, {ampCors: false});

    return this.ampDocRequest_;
  }
}

AMP.registerElement('amp-shadow-doc-loader', AmpShadowDocLoader, CSS);
