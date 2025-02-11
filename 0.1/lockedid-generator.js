export class LockedIdGenerator {
  /** constructor */
  constructor() {
    /** @public {string} */
    this.win = this.getTopWindow_();

    /** @public {string} */
    this.c = this.win.__tgconf = this.win.__tgconf || {};
  }

  /**
   * Get Top Window
   *  @return {Window}
   */
  getTopWindow_() {
    let tempwin = (this.win = window);
    while (tempwin != tempwin.top) {
      try {
        if (tempwin.frameElement) {
          this.win = tempwin.parent;
        }
      } catch (e) {}
      tempwin = tempwin.parent;
    }
    return this.win;
  }

  /**
   * A javascript implementation of MurmurHash3's x86 hashing algorithms.
   * @param {string} key
   * @param {number} seed
   * @return {string}
   */
  murmur_(key, seed) {
    const _x86Multiply = (m, n) => {
      //
      // Given two 32bit ints, returns the two multiplied together as a
      // 32bit int.
      //

      return (m & 0xffff) * n + ((((m >>> 16) * n) & 0xffff) << 16);
    };

    const _x86Rotl = (m, n) => {
      //
      // Given a 32bit int and an int representing a number of bit positions,
      // returns the 32bit int rotated left by that number of positions.
      //

      return (m << n) | (m >>> (32 - n));
    };

    const _x86Fmix = (h) => {
      //
      // Given a block, returns murmurHash3's final x86 mix of that block.
      //

      h ^= h >>> 16;
      h = _x86Multiply(h, 0x85ebca6b);
      h ^= h >>> 13;
      h = _x86Multiply(h, 0xc2b2ae35);
      h ^= h >>> 16;

      return h;
    };

    //
    // Given a string and an optional seed as an int, returns a 128 bit
    // hash using the x86 flavor of MurmurHash3, as an unsigned hex.
    //

    key = key || '';
    seed = seed || 0;

    const remainder = key.length % 16;
    const bytes = key.length - remainder;

    let h1 = seed;
    let h2 = seed;
    let h3 = seed;
    let h4 = seed;

    let k1 = 0;
    let k2 = 0;
    let k3 = 0;
    let k4 = 0;

    const c1 = 0x239b961b;
    const c2 = 0xab0e9789;
    const c3 = 0x38b34ae5;
    const c4 = 0xa1e38b93;
    let n;

    for (n = 0; n < bytes; n = n + 16) {
      k1 =
        (key.charCodeAt(n) & 0xff) |
        ((key.charCodeAt(n + 1) & 0xff) << 8) |
        ((key.charCodeAt(n + 2) & 0xff) << 16) |
        ((key.charCodeAt(n + 3) & 0xff) << 24);
      k2 =
        (key.charCodeAt(n + 4) & 0xff) |
        ((key.charCodeAt(n + 5) & 0xff) << 8) |
        ((key.charCodeAt(n + 6) & 0xff) << 16) |
        ((key.charCodeAt(n + 7) & 0xff) << 24);
      k3 =
        (key.charCodeAt(n + 8) & 0xff) |
        ((key.charCodeAt(n + 9) & 0xff) << 8) |
        ((key.charCodeAt(n + 10) & 0xff) << 16) |
        ((key.charCodeAt(n + 11) & 0xff) << 24);
      k4 =
        (key.charCodeAt(n + 12) & 0xff) |
        ((key.charCodeAt(n + 13) & 0xff) << 8) |
        ((key.charCodeAt(n + 14) & 0xff) << 16) |
        ((key.charCodeAt(n + 15) & 0xff) << 24);

      k1 = _x86Multiply(k1, c1);
      k1 = _x86Rotl(k1, 15);
      k1 = _x86Multiply(k1, c2);
      h1 ^= k1;

      h1 = _x86Rotl(h1, 19);
      h1 += h2;
      h1 = _x86Multiply(h1, 5) + 0x561ccd1b;

      k2 = _x86Multiply(k2, c2);
      k2 = _x86Rotl(k2, 16);
      k2 = _x86Multiply(k2, c3);
      h2 ^= k2;

      h2 = _x86Rotl(h2, 17);
      h2 += h3;
      h2 = _x86Multiply(h2, 5) + 0x0bcaa747;

      k3 = _x86Multiply(k3, c3);
      k3 = _x86Rotl(k3, 17);
      k3 = _x86Multiply(k3, c4);
      h3 ^= k3;

      h3 = _x86Rotl(h3, 15);
      h3 += h4;
      h3 = _x86Multiply(h3, 5) + 0x96cd1c35;

      k4 = _x86Multiply(k4, c4);
      k4 = _x86Rotl(k4, 18);
      k4 = _x86Multiply(k4, c1);
      h4 ^= k4;

      h4 = _x86Rotl(h4, 13);
      h4 += h1;
      h4 = _x86Multiply(h4, 5) + 0x32ac3b17;
    }

    k1 = 0;
    k2 = 0;
    k3 = 0;
    k4 = 0;

    switch (remainder) {
      case 15:
        k4 ^= key.charCodeAt(n + 14) << 16;

      case 14:
        k4 ^= key.charCodeAt(n + 13) << 8;

      case 13:
        k4 ^= key.charCodeAt(n + 12);
        k4 = _x86Multiply(k4, c4);
        k4 = _x86Rotl(k4, 18);
        k4 = _x86Multiply(k4, c1);
        h4 ^= k4;

      case 12:
        k3 ^= key.charCodeAt(n + 11) << 24;

      case 11:
        k3 ^= key.charCodeAt(n + 10) << 16;

      case 10:
        k3 ^= key.charCodeAt(n + 9) << 8;

      case 9:
        k3 ^= key.charCodeAt(n + 8);
        k3 = _x86Multiply(k3, c3);
        k3 = _x86Rotl(k3, 17);
        k3 = _x86Multiply(k3, c4);
        h3 ^= k3;

      case 8:
        k2 ^= key.charCodeAt(n + 7) << 24;

      case 7:
        k2 ^= key.charCodeAt(n + 6) << 16;

      case 6:
        k2 ^= key.charCodeAt(n + 5) << 8;

      case 5:
        k2 ^= key.charCodeAt(n + 4);
        k2 = _x86Multiply(k2, c2);
        k2 = _x86Rotl(k2, 16);
        k2 = _x86Multiply(k2, c3);
        h2 ^= k2;

      case 4:
        k1 ^= key.charCodeAt(n + 3) << 24;

      case 3:
        k1 ^= key.charCodeAt(n + 2) << 16;

      case 2:
        k1 ^= key.charCodeAt(n + 1) << 8;

      case 1:
        k1 ^= key.charCodeAt(n);
        k1 = _x86Multiply(k1, c1);
        k1 = _x86Rotl(k1, 15);
        k1 = _x86Multiply(k1, c2);
        h1 ^= k1;
    }

    h1 ^= key.length;
    h2 ^= key.length;
    h3 ^= key.length;
    h4 ^= key.length;

    h1 += h2;
    h1 += h3;
    h1 += h4;
    h2 += h1;
    h3 += h1;
    h4 += h1;

    h1 = _x86Fmix(h1);
    h2 = _x86Fmix(h2);
    h3 = _x86Fmix(h3);
    h4 = _x86Fmix(h4);

    h1 += h2;
    h1 += h3;
    h1 += h4;
    h2 += h1;
    h3 += h1;
    h4 += h1;

    return (
      ('00000000' + (h1 >>> 0).toString(16)).slice(-8) +
      ('00000000' + (h2 >>> 0).toString(16)).slice(-8) +
      ('00000000' + (h3 >>> 0).toString(16)).slice(-8) +
      ('00000000' + (h4 >>> 0).toString(16)).slice(-8)
    );
  }

  /**
   * Get Hash
   * controlHash is the hash returned from server that contains the public ip address of the client
   * @param {string} visitCookie
   * @return {object}
   */
  getLockedIdData(visitCookie) {
    this.c.locked = this.c.locked || {};
    const {locked} = this.c;
    // locked.log = debugCallback;

    if (locked.iatId) {
      return locked;
    }

    const keyParts = [
      this.getUA_(),
      this.getTimeZone_(),
      this.getCanvasPrint_(),
      this.getGPUInfo_(),
      navigator.language,
      navigator.languages,
      navigator.systemLanguage || window.navigator.language,
      navigator.hardwareConcurrency,
    ];

    // Compose matrix
    let matrix = '';
    for (let index = 0; index < keyParts.length; index++) {
      matrix += keyParts[index] ? '1' : '0';
    }

    const separator = '|';
    const key = keyParts.join(separator);

    // Retrieve last values
    locked.lIatId = (visitCookie && visitCookie.split('.')[1]) || 0;
    locked.lIatIdB = (visitCookie && visitCookie.split('.')[3]) || 0;
    locked.lIatIdM = (visitCookie && visitCookie.split('.')[5]) || 0;
    locked.lIatIdV = (visitCookie && visitCookie.split('.')[6]) || 0;
    locked.controlHash =
      visitCookie && visitCookie.split('.')[4]
        ? visitCookie.split('.')[4]
        : this.c.controlHash
          ? this.c.controlHash
          : '';

    // Compute main and backup hashes
    locked.iatId = this.murmur_(key, 256);
    locked.iatIdB = this.murmur_(key + separator + locked.controlHash, 256);
    locked.iatIdM = matrix;
    locked.iatIdV = '1.0';

    // This will be used in debug callback
    locked.parts = keyParts;

    return locked;
  }

  /**
   * /(\d+(?:\.\d+)*)/g find all numbers with period & /(\d+\.)(\d+)/g get first part of the number until it finds the period
   * @return {string}
   */
  getUA_() {
    return navigator.userAgent.replace(/(\d+(?:\.\d+)*)/g, (values) => {
      return values.includes('.') ? values.match(/(\d+\.)(\d+)/g)[0] : values;
    });
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
    // if (!this.c.allowLockedId || !this.c.consent) {
    //   return '';
    // }

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
