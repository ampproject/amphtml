const _ZERO_PADDING = '00000000';
const _GROUPS = [0, 0, 0, 0, 0, 0];

/**
 * Check wether it is a mobile browser
 */
const isMobileBrowser = () => {
  return (a => {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      return true;
    }
    return false;
  })(navigator.userAgent || navigator.vendor || window.opera);
};

/**
 * Generate an uinique identifier
 */
const getGUID = () => {
  _GROUPS[0] = Math.floor(Math.random() * 0x10000000).toString(16);
  _GROUPS[1] = Math.floor(Math.random() * 0x10000).toString(16);
  _GROUPS[2] = (Math.floor(Math.random() * 0x1000) + 0x4000).toString(16);
  _GROUPS[3] = (Math.floor(Math.random() * 0x4000) + 0x8000).toString(16);
  _GROUPS[4] = Math.floor(Math.random() * 0x1000000).toString(16);
  _GROUPS[5] = Math.floor(Math.random() * 0x1000000).toString(16);
  return `${_GROUPS[0] + _ZERO_PADDING.slice(0, 8 - _GROUPS[0].length)}-${_GROUPS[1] + _ZERO_PADDING.slice(0, 4 - _GROUPS[1].length)}-${_GROUPS[2] + _ZERO_PADDING.slice(0, 4 - _GROUPS[2].length)}-${_GROUPS[3] + _ZERO_PADDING.slice(0, 4 - _GROUPS[3].length)}-${_GROUPS[4] + _ZERO_PADDING.slice(0, 6 - _GROUPS[4].length) + _GROUPS[5] + _ZERO_PADDING.slice(0, 6 - _GROUPS[5].length)}`;
};

const PING = 'x-dl8-ping';
const PONG = 'x-dl8-pong';
const ACK = 'x-dl8-ack';
const SCREEN_CHANGE = 'x-dl8-iframe-screen-change';
const WINDOW_ORIENTATIONCHANGE = 'x-dl8-iframe-window-orientationchange';
const WINDOW_DEVICEORIENTATION = 'x-dl8-iframe-window-deviceorientation';
const WINDOW_DEVICEMOTION = 'x-dl8-iframe-window-devicemotion';
const ENTER_FULLSCREEN = 'x-dl8-iframe-enter-fullscreen';
const EXIT_FULLSCREEN = 'x-dl8-iframe-exit-fullscreen';
const REDIRECT = 'x-dl8-iframe-redirect';

export class IFrameManager {
  /**
   * Creates an instance of IframeManager.
   */
  constructor() {
    /** @private {boolean} */
    this.connected_ = false;

    /** @private {Map} */
    this.contentWindowToIframeMap_ = new Map();

    /** @private {Map} */
    this.iframeToContentWindowMap_ = new Map();
    
    /** @private {Map} */
    this.guidToCandidatesMap_ = new Map();

    /** @private {Map} */
    this.iframeToStyleMap_ = new Map();

    /** @private {Set} */
    this.connectedListeners_ = new Set();

    /** @private {Array} */
    this._guid = getGUID();

    window.addEventListener('message', this._receiveMessageFromIframe.bind(this));

    let newiframes = document.querySelectorAll('iframe');
    let oldiframes = newiframes;

    setInterval(() => {
      newiframes = document.querySelectorAll('iframe');
      for (const iframe of oldiframes) {
        iframe.onload = function () {
          this.contentWindowToIframeMap_.delete(this.iframeToContentWindowMap_.get(iframe));
          this.iframeToContentWindowMap_.delete(iframe);
        }.bind(this);

        const newarray = Array.from(newiframes);
        if ((newarray.indexOf(iframe) === -1)) {
          this.contentWindowToIframeMap_.delete(this.iframeToContentWindowMap_.get(iframe));
          this.iframeToContentWindowMap_.delete(iframe);
        }
      }
      oldiframes = newiframes;
    }, 1000);
  }

  addConnectedListener(fn) {
    this.connectedListeners_.add(fn);
  }

  removeConnectedListener(fn) {
    this.connectedListeners_.delete(fn);
  }

  enterFullscreen(useRedirect) {
    if (useRedirect && isMobileBrowser()) {
      parent.postMessage(JSON.stringify({
        type: REDIRECT,
        protocol: location.protocol,
        host: location.host,
        pathname: location.pathname,
        hash: location.hash,
        search: location.search
      }), '*');
    } else {
      parent.postMessage(JSON.stringify({
        type: ENTER_FULLSCREEN,
        src: window.location.href.replace(/http[s]{0,1}:/, '')
      }), '*');
    }
  }

  exitFullscreen() {
    parent.postMessage(JSON.stringify({
      type: EXIT_FULLSCREEN,
      src: window.location.href.replace(/http[s]{0,1}:/, '')
    }), '*');
  }

  _receiveMessageFromIframe(e) {
    let data;
    try {
      data = JSON.parse(e.data);
    } catch (e) {
      // ignore parse error.
      return;
    }
    if (!data) {
      return;
    }

    if (data.type === REDIRECT) {
      const hasQueryParams = data.search.length > 1;
      const host = data.host.replace('/', '');
      let pathname = data.pathname;
      if (pathname.startsWith('/')) {
        pathname = pathname.substring(1);
      }
      window.location = `${data.protocol}//${host}/${pathname}${data.search}${hasQueryParams ? '&' : '?'}dl8-start-from-cors-fallback=true${data.hash}`;
      return;
    }

    if (data.type === PING) {
      // broadcast a PONG with the iframe into all iframes that are not currently registered
      // if one replies with ACK it's the one we were looking for...
      if (!this.contentWindowToIframeMap_.has(e.source)) {
        const {guid} = data;
        if (guid) {
          // new protocol, it sent a guid
          const iframes = document.querySelectorAll('iframe');
          const idxToIframeMap = new Map();
          this.guidToCandidatesMap_.set(guid, idxToIframeMap);
          Array.from(iframes).forEach((iframe, idx) => {
            if (!this.contentWindowToIframeMap_.has(iframe.contentWindow)) {
              iframe.contentWindow.postMessage(JSON.stringify({
                type: PONG,
                guid,
                idx
              }), '*');
              idxToIframeMap.set(idx, iframe);
            }
          });
          return;
        } else {
          // this is an old iframe that does not support the new ack protocol. try the old discovery:
          // first, directly search for iframe with src
          let iframe = document.querySelector(`iframe[src*="${data.src}"]`);
          if (iframe === null && data.src && data.src.endsWith('/')) {
            // if it's not there: try again without trailing slash
            iframe = document.querySelector(`iframe[src*="${data.src.substring(0, data.src.length - 1)}"]`);
          }
          if (iframe === null) {
            // if we still cannot find the iframe with absolute url, try relative
            const host = `//${window.location.host}/`;
            if (host && data.src && data.src.startsWith(host)) {
              iframe = document.querySelector(`iframe[src*="${data.src.replace(host, '')}"]`);
            }
          }
          if (!iframe) {
            // give up
            return;
          }
          this.contentWindowToIframeMap_.set(iframe.contentWindow, iframe);
          this.iframeToContentWindowMap_.set(iframe, iframe.contentWindow);
        }
      }
    }

    const wasEmpty = this.contentWindowToIframeMap_.size === 0;
    if (data.type === ACK) {
      // the iframe acknowledged our request, so we save it
      const idx = data.idx;
      const guid = data.guid;
      const candidates = this.guidToCandidatesMap_.get(guid);
      if (!candidates) {
        // this ack was not requested
        console.warn(`Unrequested ACK received from iframe: ${e}`);
        return;
      }
      const candidate = candidates.get(idx);
      if (!candidate) {
        console.warn(`Unknown candidate idx=${idx} within ACK from iframe: ${e}`);
        return;
      }
      this.guidToCandidatesMap_.delete(guid);
      this.contentWindowToIframeMap_.set(e.source, candidate);
      this.iframeToContentWindowMap_.set(candidate, e.source);
    }

    const iframe = this.contentWindowToIframeMap_.get(e.source);
    if (!iframe) {
      return;
    }

    switch (data.type) {
      case ENTER_FULLSCREEN: {
        this.iframeToStyleMap_.set(iframe, {
          width: iframe.width,
          height: iframe.height,
          style: {
            width: iframe.style.width,
            height: iframe.style.height,
            left: iframe.style.left,
            top: iframe.style.top,
            margin: iframe.style.margin,
            padding: iframe.style.padding,
            zIndex: iframe.style.zIndex,
            position: iframe.style.position,
            display: iframe.style.display
          }
        });
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.left = '0';
        iframe.style.top = '0';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        iframe.style.zIndex = '9999999';
        iframe.style.position = 'fixed';
        iframe.style.display = 'block';
        let viewportMeta = document.querySelector('#dl8-meta-viewport');
        if (!viewportMeta) {
          viewportMeta = document.createElement('meta');
          viewportMeta.setAttribute('id', 'dl8-meta-viewport');
          viewportMeta.setAttribute('name', 'viewport');
          viewportMeta.setAttribute('content', 'initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no, width = device-width');
          document.head.appendChild(viewportMeta);
        }
        document.body.classList.add('x-dl8-fullscreen');
        break;
      }
      case EXIT_FULLSCREEN: {
        if (this.iframeToStyleMap_.has(iframe)) {
          const { style, width, height } = this.iframeToStyleMap_.get(iframe);
          iframe.width = width;
          iframe.height = height;
          iframe.style.width = style.width;
          iframe.style.height = style.height;
          iframe.style.left = style.left;
          iframe.style.top = style.top;
          iframe.style.margin = style.margin;
          iframe.style.padding = style.padding;
          iframe.style.zIndex = style.zIndex;
          iframe.style.position = style.position;
          iframe.style.display = style.display;
        }
        const viewportMeta = document.querySelector('#dl8-meta-viewport');
        if (viewportMeta) {
          document.head.removeChild(viewportMeta);
        }
        document.body.classList.remove('x-dl8-fullscreen');
        break;
      }
    }
    if (wasEmpty && this.contentWindowToIframeMap_.size > 0 && isMobileBrowser()) {
      this._registerEventHandlers();
    }
  }

  _registerEventHandlers() {
    if (window.screen) {
      const screen = window.screen.orientation || window.screen.mozOrientation || window.screen.msOrientation;
      if (screen && screen.addEventListener) {
        screen.addEventListener('change', this._dispatchScreenOrientationChangeEvents.bind(this), false);
      } else {
        window.addEventListener('orientationchange', this._dispatchOrientationChangeEvents.bind(this), false);
      }
    } else {
      window.addEventListener('orientationchange', this._dispatchOrientationChangeEvents.bind(this), false);
    }
    window.addEventListener('deviceorientation', this._dispatchDeviceOrientationEvents.bind(this), false);
    window.addEventListener('devicemotion', this._dispatchDeviceMotionEvents.bind(this), false);
  }

  _postMessage(obj) {
    for (const [ contentWindow ] of this.contentWindowToIframeMap_) {
      contentWindow.postMessage(JSON.stringify(obj), '*');
    }
  }

  _dispatchScreenOrientationChangeEvents() {
    const orientation = window.screen.orientation || window.screen.mozOrientation || window.screen.msOrientation;
    this._postMessage({ 
      type: SCREEN_CHANGE, 
      payload: { 
        orientation: { 
          angle: orientation.angle, 
          type: orientation.type 
        } 
      } 
    });
  }

  _dispatchOrientationChangeEvents() {
    const { orientation } = window;
    this._postMessage({
      type: WINDOW_ORIENTATIONCHANGE,
      payload: {
        orientation
      }
    });
  }

  _dispatchDeviceOrientationEvents(event) {
    this._postMessage({
      type: WINDOW_DEVICEORIENTATION,
      payload: {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
        timeStamp: event.timeStamp
      }
    });
  }

  _dispatchDeviceMotionEvents(event) {
    this._postMessage({
      type: WINDOW_DEVICEMOTION,
      payload: {
        acceleration: {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z
        },
        accelerationIncludingGravity: {
          x: event.accelerationIncludingGravity.x,
          y: event.accelerationIncludingGravity.y,
          z: event.accelerationIncludingGravity.z
        },
        rotationRate: {
          alpha: event.rotationRate.alpha,
          beta: event.rotationRate.beta,
          gamma: event.rotationRate.gamma
        },
        interval: event.interval,
        timeStamp: event.timeStamp
      }
    });
  }

  _sendPingUntilConnected() {
    if (this._connected) {
      return;
    }
    
    parent.postMessage(JSON.stringify({
      type: PING,
      src: window.location.href.replace(/http[s]{0,1}:/, ''),
      guid: this._guid
    }), '*');

    setTimeout(() => {
      this._sendPingUntilConnected();
    }, 500);

  }
}