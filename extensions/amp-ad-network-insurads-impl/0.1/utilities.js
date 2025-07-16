import {stringHash32} from '#core/types/string';

export class LockedId {
  /**
   * Get Hash
   * controlHash is the hash returned from server that contains the public ip address of the client
   * @param {boolean} allowStorage
   * @return {object}
   */
  getLockedIdData(allowStorage = false) {
    const keyParts = [
      this.getTimeZone_(),
      this.getCanvasPrint_(allowStorage),
      this.getGPUInfo_(allowStorage),
      navigator.language,
      navigator.languages.join(','),
      navigator.systemLanguage || window.navigator.language,
      navigator.hardwareConcurrency,
    ];
    return keyParts;
  }

  /**
   * Get Time Zone.  Return a string containing the time zone.
   * @return {string}
   * @private
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
   * @param {boolean} allowStorage
   * @return {string}
   * @private
   * */
  getCanvasPrint_(allowStorage = false) {
    if (!allowStorage) {
      return '';
    }
    const canvas = document.createElement('canvas');
    let ctx;

    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      return '';
    }

    const txt = 'IaID,org <canvas> 1.0';
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(txt, 4, 17);
    return stringHash32(canvas.toDataURL());
  }

  /**
   * Get GPU Info. Return a string containing the GPU vendor and renderer.
   * @param {boolean} allowStorage
   * @return {string}
   * @private
   */
  getGPUInfo_(allowStorage = false) {
    if (!allowStorage) {
      return '';
    }

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

export class CryptoUtils {
  /**
   * Generates a random code.
   * @return {string}
   */
  static generateCode() {
    return this.generate_(11).toLowerCase();
  }

  /**
   * Generates an impression id.
   * @return {string}
   */
  static generateImpressionId() {
    return this.generate_(43).toLowerCase();
  }

  /**
   * Generates a session id.
   * @return {string}
   */
  static generateSessionId() {
    return this.generate_(16).toUpperCase();
  }

  /**
   * Generates a random string.
   * @param {number} length
   * @return {string}
   * @private
   */
  static generate_(length) {
    let text = '';
    const charSet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return text;
  }
}
