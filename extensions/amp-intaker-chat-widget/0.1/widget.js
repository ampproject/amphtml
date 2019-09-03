function addClass(el, name) {
  el.classList.add(name);
  return el;
}

function removeClass(el, name) {
  el.classList.remove(name);
  return el;
}

function loadCss(url) {
  var link   = document.createElement('link');
  // link.id    = 'chatter-bot-css';
  link.rel   = 'stylesheet';
  link.type  = 'text/css';
  link.href  = url;
  link.media = 'all';
  (document.getElementsByTagName('head')[0] || document.body).appendChild(link);
}

function injectStyle(css) {
  var head  = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

function loadInlineCss(css) {
  var head  = document.querySelector('head');
  var style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

function addToBody(string) {
  var tmp       = document.createElement('div');
  tmp.innerHTML = string;
  document.body.appendChild(tmp.firstChild);
  tmp = null;
}

function closeFrame() {
  exitPreview();
  visitor(false);
  chatIsActive = false;
  removeClass(frameContainer, 'chatter-bot-frame-container-active');
  removeClass(document.body, 'chatter-bot-body-noscroll');
  removeClass(launcherContainer, 'chatter-bot-frame-container-active');
  frameContainer.style.display = 'none';
  document.title               = originalTitle
}

function openFrame() {
  frameContainer.style.display = 'block';
  addClass(frameContainer, 'chatter-bot-frame-container-active');
  addClass(launcherContainer, 'chatter-bot-frame-container-active');
  if (!isDesktop) {
    if (previewChatIsActive) {
      addClass(frameContainer, 'preview');
      addClass(launcherContainer, 'preview')
    } else
      exitPreview();
  }

  resizeAmpFrame();
}

function postAjax(url, data, success) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  xhr.open('POST', url);
  xhr.onreadystatechange = function () {
    if (xhr.readyState > 3 && xhr.status === 200) { success(xhr.responseText); }
  };
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send(JSON.stringify(data));
  return xhr;
}

function lunch(preview) {
  previewChatIsActive = false;
  var dt              = new Date();
  dt.setMinutes(dt.getMinutes() + 15);
  cookieValue.autoLunch = false;
  CookiesAPI.set(cookieName, cookieValue, { expires: dt });

  if (!chatIsActive) {
    if (preview)
      previewChatIsActive = true;
    else
      chatIsActive = true;

    if (!frameContainer) {
      addToBody(INTAKER_CW_TMP.frame);
      frameContainer = document.getElementById(frameContainerId);
      closeBtn       = document.getElementById(closeBtnId);
      restartBtn     = document.getElementById(restartBtnId);
      frame          = document.getElementById(frameId);

      closeBtn.addEventListener('click', closeFrame);
      restartBtn.addEventListener('click', function () {
        frame.src = url;
      });
      frame.src = url + (preview ? '&preview=true' : '');
    }

    openFrame();
  } else {
    closeFrame();
  }
}

function exitPreview() {
  addClass(document.body, 'chatter-bot-body-noscroll');
  removeClass(frameContainer, 'preview');
  removeClass(launcherContainer, 'preview');
  frameContainer.style.height = '';
  frame.contentWindow.postMessage('exitPreview', '*');
}

function getDirectLink(url) {
  var parts = url.split('/');
  while (true) {
    var name = parts.pop();
    if (name) {
      name = name.trim();
      if (name.length)
        return name;
    } else
      return null;
  }
}

function isMobile() {
  var check = false;
  (function (a) {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;})(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

function authenticate(callback) {
  // if (useQA)
  //   return callback();

  postAjax(api + '/api/Chat/CheckCustomerSubscription', {
    "directLink"  : directLink,
    "externalLink": externalUrl
  }, function (result) {
    result = JSON.parse(result);
    if (result === 'Paid' || result === 'Trial') {
      callback();
    } else {
      if (console.error) {
        if (result === 'CustomerNotFound')
          console.error('This is not the chat you are looking for.');
        else {
          console.error('Intaker Chatter Bot client is expired. Login to your dashboard and upgrade.');
          console.error('https://intaker.co/dashboard');
        }
      }
    }
  });
}

function injectThemeCss(setting) {
  var avatar      = setting.avatarUrl || DEFAULT_AVATAR;
  var color       = setting.colorPick || '2DC464';
  var css         =
        '#chatter-bot-launcher-container .chatter-bot-launcher-button {background-image : url(' + avatar + ');}' +
        '#chatter-bot-launcher {background : #' + color + ';}';
  var linkElement = document.createElement('link');
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute('type', 'text/css');
  linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(css));
  document.body.appendChild(linkElement);
}

function getChatSetting(callback) {
  postAjax(api + '/api/Chat/GetChatSetting', {
    "directLink"  : directLink,
    "externalLink": externalUrl
  }, function (result) {
    result = JSON.parse(result);
    injectThemeCss(result);
    callback(result);
  });
}

function playDingSound() {
  var promise = dingSound.play();
  if (promise !== undefined) {
    promise.then(function () {
    }).catch(function (error) {
    });
  }
}

function loadDingSound() {
  if (window.Audio) {
    dingSound     = new Audio();
    dingSound.src = "https://intaker.co/dist/light.mp3";
    dingSound.load();
  }
}

function autoLunch(setting) {
  resizeAmpFrame();

  var cookie = CookiesAPI.getJSON(cookieName);
  if (cookie && cookie.autoLunch === false && !window.DEV_ENV)
    return;

  //MINI-WIDGET
  if (!isDesktop && setting.miniPopup) {
    setTimeout(function () {
      if (!chatIsActive) {
        lunch(true);
        playDingSound();
      }
    }, window.DEV_ENV ? 100 : 3000);
  }

  //ruye mobile fagat age aggresiveLeadGeneration==true hast
  //ruye desktop hamishe
  //setting.aggresiveLeadGeneration ||
  if (isDesktop) {
    //auto lunch
    setTimeout(function () {
      if (!chatIsActive) {
        lunch();
        playDingSound();
      }
    }, 10000);
  }
}

function setUniqueVisit() {
  var cn     = cookieName + '_UniqueVisit';
  var cookie = CookiesAPI.get(cn);

  if (cookie)
    return false;

  var dt = new Date();
  dt.setMinutes(dt.getMinutes() + 60);
  CookiesAPI.set(cn, 1, { expires: dt });

  return true;
}

function visitor(openedChat) {
  ///api/Chat/Visitor

  postAjax(api + '/api/Chat/Visitor', {
    "uniqueVisit"   : isUniqueVisit,
    "pageName"      : document.title,
    "pageTitle"     : document.title,
    "openedChat"    : openedChat === true,
    "closedChat"    : openedChat === false,
    "userBrowser"   : platform.name,
    "browserVersion": platform.version,
    "customerName"  : directLink,
    "Device"        : navigator.userAgent || navigator.vendor || window.opera,
  }, function (result) {
  });
}

function lunchBtnClicked() {
  visitor(true);
  lunch();
}

var CHAT_TYPE_FULL      = 'full';
var CHAT_TYPE_PREVIEW   = 'preview';
var CookiesAPI          = window.CookiesApi;
var chatIsActive        = false;
var previewChatIsActive = false;
var frameId             = 'chatter-bot-iframe';
var frameContainerId    = 'chatter-bot-frame-container';
var btnId               = 'chatter-bot-launcher';
var closeBtnId          = 'chatter-bot-widget-close';
var restartBtnId        = 'chatter-bot-launcher-restart';
var INTAKER_CHAT_URL    = btoa('INTAKER_CHAT_URL');
var INTKER_CHAT_URL     = btoa('INTKER_CHAT_URL');//support for old generated widgets
var chatUrlHash         = '';//window[INTAKER_CHAT_URL] || window[INTKER_CHAT_URL];
var url                 = '';//atob(chatUrlHash);
var useQA               = window['USE_INTAKER_QA'];
var frameContainer, closeBtn, restartBtn, lunchBtn, frame;
var api                 = '';//useQA ? 'https://intakerapiqa.azurewebsites.net' :
                             // 'https://idemanducoreapi20180624025640.azurewebsites.net';
var cssUrl            = (useQA ? 'https://intakerclientqa.azurewebsites.net' : 'https://intaker.co') + '/dist/chat-widget.min.css';
var directLink        = '';//getDirectLink(url);
var isDesktop         = !isMobile();
var cookieName        = 'INTAKER_CHAT_WIDGET_';
var cookieValue       = {};
var DEFAULT_AVATAR    = 'https://intaker.blob.core.windows.net/dashboard/a6.png';
var dingSound         = null;
var launcherContainer = null;
var isUniqueVisit     = false;
var externalUrl       = '';
var originalTitle     = document.title || '';
var isAMP             = false;
var platform          = window.platform;
var INTAKER_CW_TMP    = INTAKER_CW_TMP || {};

window.onmessage = function (e) {
  if (e.data.INTAKER_CHAT_WIDGET) {
    var data = e.data.INTAKER_CHAT_WIDGET;
    switch (data.action) {
      case  'exitPreview':
        exitPreview();
        break;
      case  'adjustHeight':
        if (frameContainer) {
          var h                       = data.height ? data.height + 10 : 0;
          frameContainer.style.height = h ? h + 'px' : '';
          var opt                     = {};
          if (h) {
            opt.height = h + 90;
            opt.width  = 400;
          } else {
            opt.height = 2000;
            opt.width  = 2000;
          }

          resizeAmpFrame(opt);
        }
        break;
      case 'newMessage':
        //isFromBot
        if (data.source === 1)
          document.title = "(1) You have a new message - " + originalTitle;
        else
          document.title = originalTitle;
        break;
    }

  }
};

function resizeAmpFrame(options) {
  if (!isAMP)
    return;

  options = options || {};

  //full size
  var w = isDesktop ? 460 : 2000;
  var h = isDesktop ? 720 : 2000;

  if (previewChatIsActive || !chatIsActive) {
    h = options.height || document.body.scrollHeight;
    if (h < 100)
      h = 100;
    w = options.width || document.body.scrollWidth;
    if (w < 300)
      w = 300;
  }

  window.parent.postMessage({
    sentinel: 'amp',
    type    : 'embed-size',
    height  : h,
    width   : w,
  }, '*');
}

function bootstrap(amp) {
  if (amp) {
    isAMP          = true;
    chatUrlHash    = amp.urlHash;
    CookiesAPI     = amp.CookiesAPI;
    platform       = amp.platform;
    INTAKER_CW_TMP = amp.templates;
    useQA          = amp.QA;

    if (amp.DEV_ENV)
      window.DEV_ENV = amp.DEV_ENV;
  } else {
    chatUrlHash = window[INTAKER_CHAT_URL] || window[INTKER_CHAT_URL];
  }

  url           = atob(chatUrlHash);
  cookieName += chatUrlHash;
  directLink    = getDirectLink(url);
  isUniqueVisit = setUniqueVisit();
  externalUrl   = encodeURI(window.DEV_ENV ? 'https://intakerclientqa.azurewebsites.net' : location.host);
  url           = url.replace('attorney.chat', 'intaker.co/chat');
  useQA && (url = url.replace('intaker.co/chat', 'intakerclientqa.azurewebsites.net/chat'));
  url = url + '?externalUrl=' + externalUrl + '&referrer=' + encodeURI(document.referrer || '');
  api = useQA ? 'https://intakerapiqa.azurewebsites.net' : 'https://idemanducoreapi20180624025640.azurewebsites.net';

  isAMP && window.parent.postMessage({
    sentinel: 'amp',
    type    : 'embed-ready'
  }, '*');

  authenticate(function () {

    loadDingSound();
    loadCss('https://fonts.googleapis.com/css?family=Open+Sans:400');
    !window.DEV_ENV && !isAMP && loadCss(cssUrl);

    getChatSetting(function (setting) {

      addToBody(INTAKER_CW_TMP.button);
      launcherContainer = document.getElementById('chatter-bot-launcher-container');
      isDesktop && addClass(launcherContainer, 'chatter-bot-is-desktop');

      lunchBtn = document.getElementById(btnId);
      lunchBtn.addEventListener('click', lunchBtnClicked);

      autoLunch(setting);
    });
  });
  visitor();
}

if (typeof AMP === 'object') {
  module.exports.widget = bootstrap;
} else
  bootstrap();


