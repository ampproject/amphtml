// We have two types of function to share
// One is UI behavior that both 3p and A4A would need, possiblity analysis feature?
// Other is original 3p function that A4A would need when fallback


// Proposal #1: Both extend from a base class
Base {

  shareAdReponse(data) {
    this.noContentUI();
    this.renderStartUI();
  }

  handleAdResponse(data) {
    this.shareAdReponse(data);
    this.3pCode();
  }

  renderViaIframe(iframe) {
    //register listener to iframe
    this.handleAdResponse(data);

  }

  this.3pCode();

}

3pAdImpl {
  this.iframe_ = getIframe();
  this.renderViaIframe(this.iframe_)
  this.3pCode();
  unlayoutCallback() {
    this.3pCode();
  }
}

A4AImpl {
  if (valid A4A) {
    this.shareAdReponse(data);
  } else {
    this.iframe_
    this.renderViaIframe(this.iframe_);
    this.3pCode();
  }

  unlayoutCallback() {
    this.a4aCode();
    if (fallback) {
      this.3pCode();
    }
  }
}

// Proposal #2: Both import from a handler class
// to use UI behavior function, will need to init handler class at beginning
Handler {
  this.renderViaIframe(this.iframe_);
  this.noContent();
  this.renderStart();
}


// Proposal #3: Having a handler to share fallback code, and extend from same
// class to share UI behavior.
// Is good because only when fallback to 3p ad will the handler be initiated.
Base {
  noContentUI();
  renderStartUI();
}

Handler {
  this.renderViaIframe(this.iframe_, this.implInstance_) {
    this.noContentUI(); PerformanceMark
    this.renderStartUI()
    extra this.3pCode();
  }
  cleanUp functions;
  unlayoutCallback();
  viewportCallback();
}

3pAdImpl {
  this.iframe_;
  this.renderViaIframe(this.iframe_, this.implInstance_);
}

A4AImpl {
  if (valid A4A) {
    noContentUI()/renderStartUI();
  } else {
    new Handler();
    this.iframe_
    this.Handler.renderViaIframe(this.iframe_, this.implInstance_);
  }
}


// Proposal #4: Can we have such function inside baseElement?
