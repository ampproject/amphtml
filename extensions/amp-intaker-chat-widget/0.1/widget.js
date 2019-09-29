/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *
 */
function Intaker() {}

/**
 *
 * @constructor
 */
Intaker.Widget = function() {
  let chatIsActive = false;
  let previewChatIsActive = false;
  const frameId = 'chatter-bot-iframe';
  const frameContainerId = 'chatter-bot-frame-container';
  const btnId = 'chatter-bot-launcher';
  const closeBtnId = 'chatter-bot-widget-close';
  const restartBtnId = 'chatter-bot-launcher-restart';
  const INTAKER_CHAT_URL = btoa('INTAKER_CHAT_URL');
  const INTKER_CHAT_URL = btoa('INTKER_CHAT_URL'); //support for old generated widgets
  let url = ''; //atob(chatUrlHash);
  let frameContainer, closeBtn, restartBtn, lunchBtn, frame;
  let api = '';
  const cssUrl =
    (Intaker.useQA
      ? 'https://intakerclientqa.azurewebsites.net'
      : 'https://intaker.co') + '/dist/chat-widget.min.css';
  let directLink = '';
  let isDesktop = true;
  let cookieName = 'INTAKER_CHAT_WIDGET_';
  const cookieValue = {};
  const DEFAULT_AVATAR =
    'https://intaker.blob.core.windows.net/dashboard/a6.png';
  let dingSound = null;
  let launcherContainer = null;
  let isUniqueVisit = false;
  let externalUrl = '';
  const originalTitle = document.title || '';
  let isAMP = false;
  let platform = null;
  // Intaker.Templates       = window['IntakerWidgetTemplates'];
  let chatUniqueId = null;
  let manualOpenedChat = false;
  const buttonTemplate = {
    tag: 'div',
    attrs: {'id': 'chatter-bot-launcher-container'},
    classNames: [
      'chatter-bot-flex-end',
      'chatter-bot-avatar-launcher',
      'chatter-bot-launcher-enabled',
    ],
    childNodes: [
      {
        tag: 'div',
        attrs: {id: 'chatter-bot-avatar-text'},
        childNodes: [
          {
            tag: 'div',
            attrs: {id: 'chatter-bot-avatar-text-inner'},
            content: 'Hi how can I help?',
          },
        ],
      },
      {
        tag: 'div',
        attrs: {id: 'chatter-bot-launcher'},
        classNames: [
          'chatter-bot-launcher',
          'chatter-bot-flex-center',
          'chatter-bot-launcher-active',
        ],
        childNodes: [
          {
            tag: 'div',
            attrs: {id: 'chatter-bot-launcher-button'},
            classNames: ['chatter-bot-launcher-button'],
          },
          {
            tag: 'div',
            attrs: {id: 'chatter-bot-launcher-text'},
            content: 'Hi how can I help?',
          },
        ],
      },
    ],
  };
  const frameTemplate = {
    tag: 'div',
    attrs: {id: 'chatter-bot-frame-container'},
    childNodes: [
      {
        tag: 'div',
        attrs: {id: 'chatter-bot-frame-wrap'},
        childNodes: [
          {
            tag: 'iframe',
            attrs: {scrolling: 'no', id: 'chatter-bot-iframe'},
          },
        ],
      },
      {
        tag: 'div',
        attrs: {id: 'chatter-bot-widget-close', title: 'Close'},
      },
      {
        tag: 'div',
        attrs: {id: 'chatter-bot-launcher-restart', title: 'Start Over'},
      },
    ],
  };

  /**
   *
   * @param {Object} config
   * @param {!Element} [parentElement]
   */
  function renderElement(config, parentElement) {
    const el = document.createElement(config.tag);

    if (config.attrs) {
      for (const name in config.attrs) {
        el.setAttribute(name, config.attrs[name]);
      }
    }
    if (config.classNames) {
      for (let i = 0, l = config.classNames.length; i < l; i++) {
        el.classList.add(config.classNames[i]);
      }
    }

    if (config.content) {
      el.appendChild(document.createTextNode(config.content));
    }

    if (parentElement) {
      parentElement.appendChild(el);
    }

    if (config.childNodes && config.childNodes.length) {
      for (let i = 0, l = config.childNodes.length; i < l; i++) {
        renderElement(config.childNodes[i], el);
      }
    }
  }

  /**
   *
   * @param {Element} el
   * @param {string} name
   * @return {Element}
   */
  function addClass(el, name) {
    el.classList.add(name);
    return el;
  }

  /**
   *
   * @param {Element} el
   * @param {string} name
   * @return {Element}
   */
  function removeClass(el, name) {
    el.classList.remove(name);
    return el;
  }

  /**
   *
   * @param {string} url
   */
  function loadCss(url) {
    const link = document.createElement('link');
    // link.id    = 'chatter-bot-css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.media = 'all';
    (document.getElementsByTagName('head')[0] || document.body).appendChild(
      link
    );
  }

  /**
   *
   * @param {string} string
   */
  // function addToBody(string) {
  //   let tmp             = document.createElement('div');
  //   tmp./*OK*/innerHTML = Intaker.sanitizeTemplate(string);
  //   document.body.appendChild(tmp.firstChild);
  //   tmp = null;
  // }

  /**
   *
   */
  function closeFrame() {
    exitPreview();
    visitor(false);
    chatIsActive = false;
    removeClass(frameContainer, 'chatter-bot-frame-container-active');
    removeClass(document.body, 'chatter-bot-body-noscroll');
    removeClass(launcherContainer, 'chatter-bot-frame-container-active');
    hideEl(frameContainer);
    // document.title = originalTitle
  }

  /**
   *
   */
  function openFrame() {
    showEl(frameContainer);
    addClass(frameContainer, 'chatter-bot-frame-container-active');
    addClass(launcherContainer, 'chatter-bot-frame-container-active');
    if (!isDesktop) {
      if (previewChatIsActive) {
        addClass(frameContainer, 'preview');
        addClass(launcherContainer, 'preview');
      } else {
        exitPreview();
      }
    }
  }

  /**
   *
   * @param {boolean} [preview]
   */
  function lunch(preview) {
    previewChatIsActive = false;
    // let dt              = new Date();
    // dt.setMinutes(dt.getMinutes() + 15);
    cookieValue.autoLunch = false;
    Intaker.CookiesAPI.set(cookieName, cookieValue);

    if (!chatIsActive) {
      if (preview) {
        previewChatIsActive = true;
      } else {
        chatIsActive = true;
      }

      if (!frameContainer) {
        renderElement(frameTemplate, document.body);
        frameContainer = document.getElementById(frameContainerId);
        closeBtn = document.getElementById(closeBtnId);
        restartBtn = document.getElementById(restartBtnId);
        frame = document.getElementById(frameId);

        hideEl(frameContainer);
        closeBtn.addEventListener('click', closeFrame);
        restartBtn.addEventListener('click', function() {
          frame.src = url;
        });
        frame.src = url + (preview ? '&preview=true' : '');
      }

      openFrame();
    } else {
      closeFrame();
    }
  }

  /**
   *
   */
  function exitPreview() {
    addClass(document.body, 'chatter-bot-body-noscroll');
    removeClass(frameContainer, 'preview');
    removeClass(launcherContainer, 'preview');
    Intaker.SetStyle(frameContainer, 'height', '');
    frame.contentWindow./*OK*/ postMessage('exitPreview', '*');
  }

  /**
   *
   * @param {string} url
   * @return {string|null}
   */
  function getDirectLink(url) {
    const parts = url.split('/');
    while (true) {
      let name = parts.pop();
      if (name) {
        name = name.trim();
        if (name.length) {
          return name;
        }
      } else {
        return null;
      }
    }
  }

  /**
   *
   * @param {function(): undefined} callback
   */
  function authenticate(callback) {
    // if (Intaker.useQA)
    //   return callback();

    Intaker.postAjax(
      api + '/api/Chat/CheckCustomerSubscription',
      /** @type {!JsonObject} */ ({
        'directLink': directLink,
        'externalLink': externalUrl,
      }),
      function(result) {
        if (result === 'Paid' || result === 'Trial') {
          callback();
        } else {
          if (console.error) {
            if (result === 'CustomerNotFound') {
              console /*OK*/
                .error('This is not the chat you are looking for.');
            } else {
              console /*OK*/
                .error(
                  'Intaker Chatter Bot client is expired. Login to your dashboard and upgrade.'
                );
              console /*OK*/
                .error('https://intaker.co/dashboard');
            }
          }
        }
      }
    );
  }

  /**
   *
   * @param {Object} setting
   */
  function injectThemeCss(setting) {
    const avatar = setting.avatarUrl || DEFAULT_AVATAR;
    const color = setting.colorPick || '2DC464';
    const css =
      '#chatter-bot-launcher-container .chatter-bot-launcher-button {background-image : url(' +
      avatar +
      ');}' +
      '#chatter-bot-launcher {background : #' +
      color +
      ';}';
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute(
      'href',
      'data:text/css;charset=UTF-8,' + encodeURIComponent(css)
    );
    document.body.appendChild(linkElement);
  }

  /**
   *
   * @param {function(?): undefined} callback
   */
  function getChatSetting(callback) {
    Intaker.postAjax(
      api + '/api/Chat/GetChatSetting',
      /** @type {!JsonObject} */ ({
        'directLink': directLink,
        'externalLink': externalUrl,
      }),
      function(result) {
        injectThemeCss(result);
        callback(result);
      }
    );
  }

  /**
   *
   */
  function playDingSound() {
    const promise = dingSound.play();
    if (promise !== undefined) {
      promise.then(function() {}).catch(function() {});
    }
  }

  /**
   *
   */
  function loadDingSound() {
    if (window.Audio) {
      dingSound = new Audio();
      dingSound.src = 'https://intaker.co/dist/light.mp3';
      dingSound.load();
    }
  }

  /**
   *
   * @param {Object} setting
   * @return {undefined}
   */
  function autoLunch(setting) {
    const cookie = Intaker.CookiesAPI.getJSON(cookieName);
    if (cookie && cookie.autoLunch === false && !window.DEV_ENV) {
      return;
    }

    //MINI-WIDGET
    if (!isDesktop && setting.miniPopup) {
      setTimeout(
        function() {
          if (!chatIsActive) {
            lunch(true);
            playDingSound();
          }
        },
        window.DEV_ENV ? 100 : 3000
      );
    }

    //ruye mobile fagat age aggresiveLeadGeneration==true hast
    //ruye desktop hamishe
    //setting.aggresiveLeadGeneration ||
    if (isDesktop) {
      //auto lunch
      setTimeout(function() {
        if (!chatIsActive) {
          lunch();
          playDingSound();
        }
      }, 10000);
    }
  }

  /**
   *
   * @return {boolean}
   */
  function setUniqueVisit() {
    const cn = cookieName + '_UniqueVisit';
    const cookie = Intaker.CookiesAPI.get(cn);

    if (cookie) {
      return false;
    }

    const dt = new Date();
    dt.setMinutes(dt.getMinutes() + 60);
    Intaker.CookiesAPI.set(cn, 1, {expires: dt});

    return true;
  }

  /**
   *
   * @param {boolean|undefined|null} [openedChat]
   */
  function visitor(openedChat) {
    ///api/Chat/Visitor

    Intaker.postAjax(
      api + '/api/Chat/Visitor',
      /** @type {!JsonObject} */ ({
        'uniqueVisit': isUniqueVisit,
        'pageName': originalTitle,
        'pageTitle': originalTitle,
        'openedChat': openedChat === true,
        'closedChat': openedChat === false,
        'userBrowser': platform.name,
        'browserVersion': platform.version,
        'customerName': directLink,
        'Device': navigator.userAgent || navigator.vendor || window.opera,
        'chatUniqueId': chatUniqueId,
      }),
      function() {}
    );
  }

  /**
   *
   */
  function lunchBtnClicked() {
    manualOpenedChat = true;
    lunch();
  }

  /**
   *
   * @param {Element} el
   */
  function showEl(el) {
    Intaker.Toggle(el, 'block');
  }

  /**
   *
   * @param {Element} el
   */
  function hideEl(el) {
    Intaker.Toggle(el, isAMP ? false : 'none');
  }

  /**
   *
   * @param {Object} [amp]
   * @public
   */
  this.bootstrap = amp => {
    if (amp) {
      isAMP = true;

      if (amp.DEV_ENV) {
        window.DEV_ENV = amp.DEV_ENV;
      }
    } else {
      Intaker.chatUrlHash = window[INTAKER_CHAT_URL] || window[INTKER_CHAT_URL];
    }

    isDesktop = !Intaker.isMobile;
    url = atob(Intaker.chatUrlHash);
    cookieName += Intaker.chatUrlHash;
    directLink = getDirectLink(url);
    isUniqueVisit = setUniqueVisit();
    externalUrl = encodeURI(
      window.DEV_ENV
        ? 'https://intakerclientqa.azurewebsites.net'
        : location.host
    );
    url = url.replace('attorney.chat', 'intaker.co/chat');
    Intaker.useQA &&
      (url = url.replace(
        'intaker.co/chat',
        'intakerclientqa.azurewebsites.net/chat'
      ));
    url =
      url +
      '?externalUrl=' +
      externalUrl +
      '&referrer=' +
      encodeURI(Intaker.Referrer || '');
    api = Intaker.useQA
      ? 'https://intakerapiqa.azurewebsites.net'
      : 'https://idemanducoreapi20180624025640.azurewebsites.net';

    authenticate(function() {
      loadDingSound();
      loadCss('https://fonts.googleapis.com/css?family=Open+Sans:400');
      !window.DEV_ENV && !isAMP && loadCss(cssUrl);

      getChatSetting(function(setting) {
        renderElement(buttonTemplate, document.body);
        launcherContainer = document.getElementById(
          'chatter-bot-launcher-container'
        );
        isDesktop && addClass(launcherContainer, 'chatter-bot-is-desktop');

        lunchBtn = document.getElementById(btnId);
        lunchBtn.addEventListener('click', lunchBtnClicked);

        autoLunch(setting);
      });
    });
  };

  window.addEventListener('message', function(e) {
    const data = Intaker.eventHelper.getData(e)['INTAKER_CHAT_WIDGET'];
    if (data) {
      switch (data.action) {
        case 'exitPreview':
          exitPreview();
          break;
        case 'adjustHeight':
          if (frameContainer) {
            const h = data.height ? data.height + 10 : 0;
            Intaker.SetStyle(frameContainer, 'height', h ? h + 'px' : '');
          }
          break;
        // case 'newMessage':
        //   //isFromBot
        //   if (data.source === 1)
        //     document.title = "(1) You have a new message - " + originalTitle;
        //   else
        //     document.title = originalTitle;
        //   break;
        case 'chatStarted':
          chatUniqueId = data.uniqueId;
          platform = data.platform;

          visitor(manualOpenedChat ? true : null);
          manualOpenedChat = false;
          break;
      }
    }
  });

  //dummy
  // ajaxSuccessCallback('');
};

export default Intaker;
