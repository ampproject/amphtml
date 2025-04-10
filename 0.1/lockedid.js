export class LockedId {
  /** constructor */
  constructor() {}

  /**
   * Get Hash
   * controlHash is the hash returned from server that contains the public ip address of the client
   * @return {object}
   */
  getLockedIdData() {
    const keyParts = [
      this.getTimeZone_(),
      this.getCanvasPrint_(),
      this.getGPUInfo_(),
      navigator.language,
      navigator.languages.join(','), // TODO: check this with aribeiro
      navigator.systemLanguage || window.navigator.language,
      navigator.hardwareConcurrency,
    ];
    return keyParts;
  }

  /**
   * Get Time Zone.  Return a string containing the time zone.
   * @return {string}
   */
  getTimeZone_() {
    const rightNow = new Date();
    let myNumber, formattedNumber, result;
    myNumber = String(-(rightNow.getTimezoneOffset() / 60));
    if (myNumber < 0) {
      myNumber = myNumber * -1;
      formattedNumber = ('0' + myNumber).slice(-2);
      result = '-' + formattedNumber;
    } else {
      formattedNumber = ('0' + myNumber).slice(-2);
      result = '+' + formattedNumber;
    }
    return result;
  }

  /**
   * Get Canvas Print. Return a string containing the canvas URI data.
   * @return {string}
   * */
  getCanvasPrint_() {
    // create a canvas element
    const canvas = document.createElement('canvas');
    // define a context var that will be used for browsers with canvas support
    let ctx;

    // try/catch for older browsers that don't support the canvas element
    try {
      // attempt to give ctx a 2d canvas context value
      ctx = canvas.getContext('2d');
    } catch (e) {
      // return empty string if canvas element not supported
      return '';
    }

    // https://www.browserleaks.com/canvas#how-does-it-work
    // Text with lowercase/uppercase/punctuation symbols
    const txt = 'IaID,org <canvas> 1.0';
    ctx.textBaseline = 'top';
    // The most common type
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    // Some tricks for color mixing to increase the difference in rendering
    ctx.fillStyle = '#069';
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(txt, 4, 17);
    return canvas.toDataURL();
  }

  /**
   * Get GPU Info. Return a string containing the GPU vendor and renderer.
   * @return {string}
   */
  getGPUInfo_() {
    // if (!this.c.allowLockedId || !this.c.consent) {
    //   return '';
    // }

    const canvas = document.createElement('canvas');
    let gl;
    let debugInfo;
    let vendor;
    let renderer;

    try {
      gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {}

    if (gl) {
      debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    return vendor + '~' + renderer;
  }
}
