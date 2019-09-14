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
const Intaker = {};
Intaker.Widget = function() {
  let {
    CookiesApi: CookiesAPI,
    USE_INTAKER_QA: useQA,
    IntakerWidgetTemplates: Templates,
  } = window;
  let chatIsActive = false;
  let previewChatIsActive = false;
  const frameId = 'chatter-bot-iframe';
  const frameContainerId = 'chatter-bot-frame-container';
  const btnId = 'chatter-bot-launcher';
  const closeBtnId = 'chatter-bot-widget-close';
  const restartBtnId = 'chatter-bot-launcher-restart';
  const INTAKER_CHAT_URL = btoa('INTAKER_CHAT_URL');
  const INTKER_CHAT_URL = btoa('INTKER_CHAT_URL'); //support for old generated widgets
  let chatUrlHash = ''; //window[INTAKER_CHAT_URL] || window[INTKER_CHAT_URL];
  let url = ''; //atob(chatUrlHash);

  let frameContainer, closeBtn, restartBtn, lunchBtn, frame;
  let api = '';
  const cssUrl =
    (useQA
      ? 'https://intakerclientqa.azurewebsites.net'
      : 'https://intaker.co') + '/dist/chat-widget.min.css';
  let directLink = '';
  const isDesktop = !isMobile();
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

  let chatUniqueId = null;
  let manualOpenedChat = false;

  /**
   *
   * @param {HTMLBaseElement} el
   * @param {string} name
   * @return {HTMLBaseElement}
   */
  function addClass(el, name) {
    el.classList.add(name);
    return el;
  }

  /**
   *
   * @param {HTMLBaseElement} el
   * @param {string} name
   * @return {HTMLBaseElement}
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
  function addToBody(string) {
    let tmp = document.createElement('div');
    tmp /*OK*/.innerHTML /*OK*/ = string;
    document.body.appendChild(tmp.firstChild);
    tmp = null;
  }

  /**
   * @return {null}
   */
  function closeFrame() {
    exitPreview();
    visitor(false);
    chatIsActive = false;
    removeClass(frameContainer, 'chatter-bot-frame-container-active');
    removeClass(document.body, 'chatter-bot-body-noscroll');
    removeClass(launcherContainer, 'chatter-bot-frame-container-active');
    hideEl(frameContainer);
    document.title = originalTitle;
  }

  /**
   * @return {null}
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
   * @param {string} url
   * @param {object} data
   * @param {function} success
   * @return {XMLHttpRequest}
   */
  function postAjax(url, data, success) {
    const xhr = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new window.ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
      if (xhr.readyState > 3 && xhr.status === 200) {
        success(xhr.responseText);
      }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(JSON.stringify(data));
    return xhr;
  }

  /**
   *
   * @param {boolean} [preview]
   */
  function lunch(preview) {
    previewChatIsActive = false;
    const dt = new Date();
    dt.setMinutes(dt.getMinutes() + 15);
    cookieValue.autoLunch = false;
    CookiesAPI.set(cookieName, cookieValue, {expires: dt});

    if (!chatIsActive) {
      if (preview) {
        previewChatIsActive = true;
      } else {
        chatIsActive = true;
      }

      if (!frameContainer) {
        addToBody(Templates.frame);
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
   * @return {null}
   */
  function exitPreview() {
    addClass(document.body, 'chatter-bot-body-noscroll');
    removeClass(frameContainer, 'preview');
    removeClass(launcherContainer, 'preview');
    Intaker.SetStyle(frameContainer, 'height', '');
    frame.contentWindow /*OK*/
      .postMessage(/*OK*/ 'exitPreview', '*');
  }

  /**
   *
   * @param {string} url
   * @return {string}
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
   * @return {boolean}
   */
  function isMobile() {
    let check = false;
    (function(a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      ) {
        check = true;
      }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }

  /**
   *
   * @param {function} callback
   */
  function authenticate(callback) {
    // if (useQA)
    //   return callback();

    postAjax(
      api + '/api/Chat/CheckCustomerSubscription',
      {
        'directLink': directLink,
        'externalLink': externalUrl,
      },
      function(result) {
        result = JSON.parse(result);
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
   * @param {object} setting
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
   * @param {function} callback
   */
  function getChatSetting(callback) {
    postAjax(
      api + '/api/Chat/GetChatSetting',
      {
        'directLink': directLink,
        'externalLink': externalUrl,
      },
      function(result) {
        result = JSON.parse(result);
        injectThemeCss(result);
        callback(result);
      }
    );
  }

  /**
   * @return {null}
   */
  function playDingSound() {
    const promise = dingSound.play();
    if (promise !== undefined) {
      promise.then(function() {}).catch(function() {});
    }
  }

  /**
   * @return {null}
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
   * @param {object} setting
   *
   * @return {null}
   */
  function autoLunch(setting) {
    const cookie = CookiesAPI.getJSON(cookieName);
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
    const cookie = CookiesAPI.get(cn);

    if (cookie) {
      return false;
    }

    const dt = new Date();
    dt.setMinutes(dt.getMinutes() + 60);
    CookiesAPI.set(cn, 1, {expires: dt});

    return true;
  }

  /**
   *
   * @param {boolean} [openedChat]
   */
  function visitor(openedChat) {
    ///api/Chat/Visitor

    postAjax(
      api + '/api/Chat/Visitor',
      {
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
      },
      function() {}
    );
  }

  /**
   * @return {null}
   */
  function lunchBtnClicked() {
    manualOpenedChat = true;
    lunch();
  }

  /**
   *
   * @param {HTMLBaseElement} el
   */
  function showEl(el) {
    Intaker.Toggle(el, 'block');
  }

  /**
   *
   * @param {HTMLBaseElement} el
   */
  function hideEl(el) {
    Intaker.Toggle(el, isAMP ? false : 'none');
  }

  /**
   *
   * @param {object} [amp]
   */
  this.bootstrap = amp => {
    if (amp) {
      isAMP = true;
      chatUrlHash = amp.urlHash;
      CookiesAPI = amp.CookiesAPI;
      Templates = amp.templates;
      useQA = amp.QA;
      Intaker.SetStyle = amp.setStyle;
      Intaker.Toggle = amp.toggle;
      Intaker.Referrer = amp.referrer;

      if (amp.DEV_ENV) {
        window.DEV_ENV = amp.DEV_ENV;
      }
    } else {
      chatUrlHash = window[INTAKER_CHAT_URL] || window[INTKER_CHAT_URL];
    }

    url = atob(chatUrlHash);
    cookieName += chatUrlHash;
    directLink = getDirectLink(url);
    isUniqueVisit = setUniqueVisit();
    externalUrl = encodeURI(
      window.DEV_ENV
        ? 'https://intakerclientqa.azurewebsites.net'
        : location.host
    );
    url = url.replace('attorney.chat', 'intaker.co/chat');
    useQA &&
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
    api = useQA
      ? 'https://intakerapiqa.azurewebsites.net'
      : 'https://idemanducoreapi20180624025640.azurewebsites.net';

    authenticate(function() {
      loadDingSound();
      loadCss('https://fonts.googleapis.com/css?family=Open+Sans:400');
      !window.DEV_ENV && !isAMP && loadCss(cssUrl);

      getChatSetting(function(setting) {
        addToBody(Templates.button);
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

  window.onmessage = function(e) {
    console.log(e.data);
    if (e.data.INTAKER_CHAT_WIDGET) {
      const data = e.data.INTAKER_CHAT_WIDGET;
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
        case 'newMessage':
          //isFromBot
          if (data.source === 1) {
            document.title = '(1) You have a new message - ' + originalTitle;
          } else {
            document.title = originalTitle;
          }
          break;
        case 'chatStarted':
          chatUniqueId = data.uniqueId;
          platform = data.platform;

          visitor(manualOpenedChat ? true : null);
          manualOpenedChat = false;
          break;
      }
    }
  };
};

export const widget = Intaker.Widget;
