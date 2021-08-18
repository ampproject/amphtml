const firstVisibleTime = Date.now();

export default new (class {
  /** */
  constructor() {
    /** @public @const {!Window} */
    this.win = self;
  }
  /**
   * @return {time}
   */
  getFirstVisibleTime() {
    // TODO(alanorozco): Maybe the visible signal is not appropriate if we're
    // not co-ordinating visibility like the runtime would. If we track some
    // kind of visibility in a different way, the meaning changes.
    return firstVisibleTime;
  }
  /**
   * @return {!Document}
   */
  getRootNode() {
    return this.win.document;
  }
  /**
   * @return {!Node}
   */
  getHeadNode() {
    return this.win.document.head;
  }
  /**
   * @return {boolean}
   */
  isSingleDoc() {
    return true;
  }
  /**
   * @return {!Promise}
   */
  whenFirstVisible() {
    return Promise.resolve(); // TODO
  }
  /**
   * @return {boolean}
   */
  isVisible() {
    return true;
  }
  /**
   * @param {function(!VisibilityState):*} handler
   * @return {function():void}
   */
  onVisibilityChanged(handler) {
    // TODO
    handler('visible');
    return () => {};
  }
})();
