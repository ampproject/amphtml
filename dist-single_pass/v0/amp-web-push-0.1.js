(self.AMP=self.AMP||[]).push({n:"amp-web-push",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $WebPushConfig$$module$extensions$amp_web_push$0_1$amp_web_push_config$$ = function($element$jscomp$702$$) {
  return window.AMP.BaseElement.call(this, $element$jscomp$702$$) || this;
}, $JSCompiler_StaticMethods_parseConfig$$ = function($JSCompiler_StaticMethods_parseConfig$self$$) {
  var $config$jscomp$95$$ = {}, $attribute$jscomp$11$$;
  for ($attribute$jscomp$11$$ in $WebPushConfigAttributes$$module$extensions$amp_web_push$0_1$amp_web_push_config$$) {
    var $value$jscomp$313$$ = $WebPushConfigAttributes$$module$extensions$amp_web_push$0_1$amp_web_push_config$$[$attribute$jscomp$11$$];
    $config$jscomp$95$$[$value$jscomp$313$$] = $JSCompiler_StaticMethods_parseConfig$self$$.element.getAttribute($value$jscomp$313$$);
  }
  return $config$jscomp$95$$;
}, $JSCompiler_StaticMethods_isValidHelperOrPermissionDialogUrl_$$ = function($url$jscomp$244$$) {
  try {
    var $parsedUrl$jscomp$4$$ = _.$parseUrlDeprecated$$module$src$url$$($url$jscomp$244$$), $isNotRootUrl$$ = 1 < $parsedUrl$jscomp$4$$.pathname.length;
    return "https:" === $parsedUrl$jscomp$4$$.protocol && $isNotRootUrl$$;
  } catch ($e$379$$) {
    return !1;
  }
}, $WebPushWidget$$module$extensions$amp_web_push$0_1$amp_web_push_widget$$ = function($element$jscomp$703$$) {
  return window.AMP.BaseElement.call(this, $element$jscomp$703$$) || this;
}, $IFrameHost$$module$extensions$amp_web_push$0_1$iframehost$$ = function($ampdoc$jscomp$238$$, $url$jscomp$245$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$238$$;
  this.$url_$ = $url$jscomp$245$$;
  this.$D$ = null;
  this.$loadPromise_$ = new window.Promise(function() {
  });
}, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$ = function($options$jscomp$75$$) {
  $options$jscomp$75$$ || ($options$jscomp$75$$ = {debug:!1, $windowContext$:window});
  this.$I$ = {};
  this.$F$ = {};
  this.$G$ = $options$jscomp$75$$.debug;
  this.$J$ = !1;
  this.$K$ = this.$O$ = this.$P$ = this.$D$ = this.$channel_$ = null;
  this.$R$ = $options$jscomp$75$$.$windowContext$ || window;
}, $JSCompiler_StaticMethods_listen$$ = function($JSCompiler_StaticMethods_listen$self$$, $allowedOrigins$$) {
  (new window.Promise(function($resolve$jscomp$108$$, $reject$jscomp$40$$) {
    $JSCompiler_StaticMethods_listen$self$$.$J$ ? $reject$jscomp$40$$(Error("Already connected.")) : Array.isArray($allowedOrigins$$) ? ($JSCompiler_StaticMethods_listen$self$$.$P$ = $JSCompiler_StaticMethods_listen$self$$.$onListenConnectionMessageReceived_$.bind($JSCompiler_StaticMethods_listen$self$$, $allowedOrigins$$, $resolve$jscomp$108$$, $reject$jscomp$40$$), $JSCompiler_StaticMethods_listen$self$$.$R$.addEventListener("message", $JSCompiler_StaticMethods_listen$self$$.$P$), $JSCompiler_StaticMethods_listen$self$$.$G$ && 
    "amp-web-push") : $reject$jscomp$40$$(Error("allowedOrigins should be a string array of allowed origins to accept messages from. Got:", $allowedOrigins$$));
  })).then(function() {
    $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$send$$($JSCompiler_StaticMethods_listen$self$$, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$CONNECT_HANDSHAKE$, null);
    $JSCompiler_StaticMethods_listen$self$$.$J$ = !0;
  });
}, $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$$ = function($JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$, $remoteWindowContext$$, $expectedRemoteOrigin$$) {
  return new window.Promise(function($resolve$jscomp$109$$, $reject$jscomp$41$$) {
    $remoteWindowContext$$ || $reject$jscomp$41$$(Error("Provide a valid Window context to connect to."));
    $expectedRemoteOrigin$$ || $reject$jscomp$41$$(Error("Provide an expected origin for the remote Window or provide the wildcard *."));
    $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$J$ ? $reject$jscomp$41$$(Error("Already connected.")) : ($JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$channel_$ = new window.MessageChannel, $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$D$ = $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$channel_$.port1, 
    $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$O$ = $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$onConnectConnectionMessageReceived_$.bind($JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$, $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$D$, 
    $expectedRemoteOrigin$$, $resolve$jscomp$109$$), $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$D$.addEventListener("message", $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$O$), $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$D$.start(), $remoteWindowContext$$.postMessage({$topic$:$WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$CONNECT_HANDSHAKE$}, 
    "*" === $expectedRemoteOrigin$$ ? "*" : _.$parseUrlDeprecated$$module$src$url$$($expectedRemoteOrigin$$).origin, [$JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$self$$.$channel_$.port2]), "amp-web-push");
  });
}, $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$send$$ = function($JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$send$self$$, $topic$jscomp$3$$, $data$jscomp$221$$) {
  var $payload$jscomp$38$$ = {id:window.crypto.getRandomValues(new window.Uint8Array(10)).join(""), $topic$:$topic$jscomp$3$$, data:$data$jscomp$221$$};
  $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$send$self$$.$G$ && "amp-web-push";
  $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$send$self$$.$D$.postMessage($payload$jscomp$38$$);
  return new window.Promise(function($resolve$jscomp$111$$) {
    $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$send$self$$.$I$[$payload$jscomp$38$$.id] = {message:$data$jscomp$221$$, $topic$:$topic$jscomp$3$$, $promiseResolver$:$resolve$jscomp$111$$};
  });
}, $WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$ = function($ampdoc$jscomp$239$$) {
  this.ampdoc = $ampdoc$jscomp$239$$;
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$239$$, "amp-web-push-widget.amp-invisible{visibility:hidden}\n/*# sourceURL=/extensions/amp-web-push/0.1/amp-web-push.css*/", function() {
  }, !1, "amp-web-push");
  this.$config_$ = {"helper-iframe-url":null, "permission-dialog-url":null, "service-worker-url":null, debug:null};
  this.$F$ = _.$getMode$$module$src$mode$$().$development$;
  this.$I$ = this.$iframe_$ = null;
  this.$G$ = new $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$({debug:this.$F$});
  this.$D$ = null;
}, $JSCompiler_StaticMethods_removePermissionPopupUrlFragmentFromUrl$$ = function($url$jscomp$246_urlWithoutFragment$$) {
  $url$jscomp$246_urlWithoutFragment$$ = $url$jscomp$246_urlWithoutFragment$$.replace("?" + $WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.$D$, "");
  return $url$jscomp$246_urlWithoutFragment$$ = $url$jscomp$246_urlWithoutFragment$$.replace("&" + $WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.$D$, "");
}, $JSCompiler_StaticMethods_queryHelperFrame_$$ = function($JSCompiler_StaticMethods_queryHelperFrame_$self$$, $messageTopic$$, $message$jscomp$89$$) {
  return $JSCompiler_StaticMethods_queryHelperFrame_$self$$.$iframe_$.$whenReady$().then(function() {
    return $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$send$$($JSCompiler_StaticMethods_queryHelperFrame_$self$$.$G$, $messageTopic$$, $message$jscomp$89$$);
  }).then(function($JSCompiler_StaticMethods_queryHelperFrame_$self$$) {
    $JSCompiler_StaticMethods_queryHelperFrame_$self$$ = $JSCompiler_StaticMethods_queryHelperFrame_$self$$[0];
    if ($JSCompiler_StaticMethods_queryHelperFrame_$self$$.$success$) {
      return $JSCompiler_StaticMethods_queryHelperFrame_$self$$.result;
    }
    throw Error("AMP page helper iframe query topic " + $messageTopic$$ + " " + ("and message " + $message$jscomp$89$$ + " failed with: " + $JSCompiler_StaticMethods_queryHelperFrame_$self$$.error));
  });
}, $JSCompiler_StaticMethods_queryServiceWorker_$$ = function($JSCompiler_StaticMethods_queryServiceWorker_$self$$, $messageTopic$jscomp$1$$) {
  return $JSCompiler_StaticMethods_queryHelperFrame_$$($JSCompiler_StaticMethods_queryServiceWorker_$self$$, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$SERVICE_WORKER_QUERY$, {$topic$:$messageTopic$jscomp$1$$, $payload$:null});
}, $JSCompiler_StaticMethods_isServiceWorkerActivated$$ = function($JSCompiler_StaticMethods_isServiceWorkerActivated$self$$) {
  return $JSCompiler_StaticMethods_queryHelperFrame_$$($JSCompiler_StaticMethods_isServiceWorkerActivated$self$$, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$SERVICE_WORKER_STATE$, null).then(function($serviceWorkerActivated_serviceWorkerState$$) {
    var $isControllingFrame$$ = !0 === $serviceWorkerActivated_serviceWorkerState$$.$isControllingFrame$;
    a: {
      var $urlToTest$jscomp$inline_5489_urlToTestString$jscomp$inline_5486$$ = $JSCompiler_StaticMethods_isServiceWorkerActivated$self$$.$config_$["service-worker-url"];
      var $JSCompiler_inline_result$jscomp$1061_originalUrl$jscomp$inline_5487$$ = _.$parseUrlDeprecated$$module$src$url$$($serviceWorkerActivated_serviceWorkerState$$.url);
      var $originalUrlQueryParams$jscomp$inline_5488$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_inline_result$jscomp$1061_originalUrl$jscomp$inline_5487$$.search);
      $urlToTest$jscomp$inline_5489_urlToTestString$jscomp$inline_5486$$ = _.$parseUrlDeprecated$$module$src$url$$($urlToTest$jscomp$inline_5489_urlToTestString$jscomp$inline_5486$$);
      var $urlToTestQueryParams$jscomp$inline_5490$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($urlToTest$jscomp$inline_5489_urlToTestString$jscomp$inline_5486$$.search), $originalKey$jscomp$inline_5491$$;
      for ($originalKey$jscomp$inline_5491$$ in $originalUrlQueryParams$jscomp$inline_5488$$) {
        if ($urlToTestQueryParams$jscomp$inline_5490$$[$originalKey$jscomp$inline_5491$$] !== $originalUrlQueryParams$jscomp$inline_5488$$[$originalKey$jscomp$inline_5491$$]) {
          $JSCompiler_inline_result$jscomp$1061_originalUrl$jscomp$inline_5487$$ = !1;
          break a;
        }
      }
      $JSCompiler_inline_result$jscomp$1061_originalUrl$jscomp$inline_5487$$ = $JSCompiler_inline_result$jscomp$1061_originalUrl$jscomp$inline_5487$$.origin === $urlToTest$jscomp$inline_5489_urlToTestString$jscomp$inline_5486$$.origin && $JSCompiler_inline_result$jscomp$1061_originalUrl$jscomp$inline_5487$$.pathname === $urlToTest$jscomp$inline_5489_urlToTestString$jscomp$inline_5486$$.pathname;
    }
    $serviceWorkerActivated_serviceWorkerState$$ = "activated" === $serviceWorkerActivated_serviceWorkerState$$.state;
    return $isControllingFrame$$ && $JSCompiler_inline_result$jscomp$1061_originalUrl$jscomp$inline_5487$$ && $serviceWorkerActivated_serviceWorkerState$$;
  });
}, $JSCompiler_StaticMethods_setWidgetVisibilities$$ = function($JSCompiler_StaticMethods_setWidgetVisibilities$self_widgetDomElements$$, $i$382_widgetCategoryName$$, $isVisible$jscomp$8$$) {
  $JSCompiler_StaticMethods_setWidgetVisibilities$self_widgetDomElements$$ = $JSCompiler_StaticMethods_setWidgetVisibilities$self_widgetDomElements$$.ampdoc.getRootNode().querySelectorAll(_.$cssEscape$$module$third_party$css_escape$css_escape$$("amp-web-push-widget") + "[visibility=" + _.$cssEscape$$module$third_party$css_escape$css_escape$$($i$382_widgetCategoryName$$) + "]");
  for ($i$382_widgetCategoryName$$ = 0; $i$382_widgetCategoryName$$ < $JSCompiler_StaticMethods_setWidgetVisibilities$self_widgetDomElements$$.length; $i$382_widgetCategoryName$$++) {
    var $widgetDomElement$$ = $JSCompiler_StaticMethods_setWidgetVisibilities$self_widgetDomElements$$[$i$382_widgetCategoryName$$];
    $isVisible$jscomp$8$$ ? $widgetDomElement$$.classList.remove("amp-invisible") : $widgetDomElement$$.classList.add("amp-invisible");
  }
}, $JSCompiler_StaticMethods_storeLastKnownPermission_$$ = function($JSCompiler_StaticMethods_storeLastKnownPermission_$self$$) {
  return $JSCompiler_StaticMethods_queryHelperFrame_$$($JSCompiler_StaticMethods_storeLastKnownPermission_$self$$, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$NOTIFICATION_PERMISSION_STATE$, null).then(function($permission$jscomp$2$$) {
    $JSCompiler_StaticMethods_storeLastKnownPermission_$self$$.$I$ = $permission$jscomp$2$$;
  });
}, $JSCompiler_StaticMethods_updateWidgetVisibilities$$ = function($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$) {
  return $JSCompiler_StaticMethods_storeLastKnownPermission_$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$).then(function() {
    return $JSCompiler_StaticMethods_queryHelperFrame_$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$NOTIFICATION_PERMISSION_STATE$, {$isQueryTopicSupported$:$WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$STORAGE_GET$});
  }).then(function($response$jscomp$88$$) {
    return !0 === $response$jscomp$88$$ ? $JSCompiler_StaticMethods_queryHelperFrame_$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$STORAGE_GET$, {key:"amp-web-push-notification-permission"}) : window.Promise.resolve("default");
  }).then(function($canonicalNotificationPermission$$) {
    if ("denied" === $canonicalNotificationPermission$$) {
      0 < $JSCompiler_StaticMethods_updateWidgetVisibilities$self$$.ampdoc.getRootNode().querySelectorAll(_.$cssEscape$$module$third_party$css_escape$css_escape$$("amp-web-push-widget") + "[visibility=" + _.$cssEscape$$module$third_party$css_escape$css_escape$$("blocked") + "]").length ? ($JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$, "unsubscribed", !1), $JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$, 
      "subscribed", !1), $JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$, "blocked", !0)) : $JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$);
    } else {
      return $JSCompiler_StaticMethods_isServiceWorkerActivated$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$).then(function($canonicalNotificationPermission$$) {
        $canonicalNotificationPermission$$ ? $JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$) : $JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$$($JSCompiler_StaticMethods_updateWidgetVisibilities$self$$);
      });
    }
  });
}, $JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$$ = function($JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$self$$) {
  _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$self$$.ampdoc.$win$), 5000, $JSCompiler_StaticMethods_queryServiceWorker_$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$self$$, "amp-web-push-subscription-state").then(function($reply$$) {
    switch("boolean" === typeof $reply$$ ? 1 : void 0) {
      case $WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.$F$:
        $reply$$ ? ($JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$self$$, "unsubscribed", !1), $JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$self$$, "subscribed", !0), $JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$self$$, "blocked", !1)) : $JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesServiceWorkerActivated_$self$$);
        break;
      default:
        throw _.$user$$module$src$log$$().$createError$("The controlling service worker replied to amp-web-push with an unexpected value.");
    }
  }), "The controlling service worker does not support amp-web-push.");
}, $JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$$ = function($JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$self$$) {
  $JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$self$$, "unsubscribed", !0);
  $JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$self$$, "subscribed", !1);
  $JSCompiler_StaticMethods_setWidgetVisibilities$$($JSCompiler_StaticMethods_updateWidgetVisibilitiesUnsubscribed_$self$$, "blocked", !1);
}, $JSCompiler_StaticMethods_checkPermissionDialogClosedInterval_$$ = function($JSCompiler_StaticMethods_checkPermissionDialogClosedInterval_$self$$, $permissionDialogWindow$jscomp$1$$, $onPopupClosed$jscomp$1$$) {
  if ($permissionDialogWindow$jscomp$1$$ && !$permissionDialogWindow$jscomp$1$$.closed) {
    var $interval$jscomp$11$$ = $JSCompiler_StaticMethods_checkPermissionDialogClosedInterval_$self$$.ampdoc.$win$.setInterval(function() {
      $permissionDialogWindow$jscomp$1$$.closed && ($onPopupClosed$jscomp$1$$(), $JSCompiler_StaticMethods_checkPermissionDialogClosedInterval_$self$$.ampdoc.$win$.clearInterval($interval$jscomp$11$$));
    }, 500);
  }
}, $JSCompiler_StaticMethods_onPermissionGrantedSubscribe_$$ = function($JSCompiler_StaticMethods_onPermissionGrantedSubscribe_$self$$) {
  return $JSCompiler_StaticMethods_queryServiceWorker_$$($JSCompiler_StaticMethods_onPermissionGrantedSubscribe_$self$$, "amp-web-push-subscribe").then(function() {
    return $JSCompiler_StaticMethods_updateWidgetVisibilities$$($JSCompiler_StaticMethods_onPermissionGrantedSubscribe_$self$$);
  });
}, $JSCompiler_StaticMethods_onPermissionDialogInteracted$$ = function($JSCompiler_StaticMethods_onPermissionDialogInteracted$self$$) {
  return new window.Promise(function($resolve$jscomp$113$$) {
    $JSCompiler_StaticMethods_onPermissionDialogInteracted$self$$.$D$.$on$($WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$NOTIFICATION_PERMISSION_STATE$, function($JSCompiler_StaticMethods_onPermissionDialogInteracted$self$$, $replyToFrame$$) {
      $resolve$jscomp$113$$([$JSCompiler_StaticMethods_onPermissionDialogInteracted$self$$, $replyToFrame$$]);
    });
  });
}, $JSCompiler_StaticMethods_openPopupOrRedirect$$ = function($JSCompiler_StaticMethods_openPopupOrRedirect$self$$) {
  var $openingPopupUrl$$ = $JSCompiler_StaticMethods_openPopupOrRedirect$self$$.$config_$["permission-dialog-url"] + (-1 !== $JSCompiler_StaticMethods_openPopupOrRedirect$self$$.$config_$["permission-dialog-url"].indexOf("?") ? "&" : "?") + ("return=" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_openPopupOrRedirect$self$$.ampdoc.$win$.location.href + (-1 !== $JSCompiler_StaticMethods_openPopupOrRedirect$self$$.ampdoc.$win$.location.href.indexOf("?") ? "&" : "?") + $WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.$D$)), 
  $w$jscomp$inline_5509$$ = Math.floor(Math.min(700, 0.9 * window.screen.width)), $h$jscomp$inline_5510$$ = Math.floor(Math.min(450, 0.9 * window.screen.height));
  return _.$openWindowDialog$$module$src$dom$$($JSCompiler_StaticMethods_openPopupOrRedirect$self$$.ampdoc.$win$, $openingPopupUrl$$, "_blank", "height=" + $h$jscomp$inline_5510$$ + ",width=" + $w$jscomp$inline_5509$$ + ",left=" + Math.floor((window.screen.width - $w$jscomp$inline_5509$$) / 2) + ",top=" + Math.floor((window.screen.height - $h$jscomp$inline_5510$$) / 2) + ",resizable=yes,scrollbars=yes");
}, $JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$$ = function($JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$self$$) {
  $JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$self$$.ampdoc.$win$.history.replaceState(null, "", $JSCompiler_StaticMethods_removePermissionPopupUrlFragmentFromUrl$$($JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$self$$.ampdoc.$win$.location.href));
  $JSCompiler_StaticMethods_queryHelperFrame_$$($JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$self$$, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$NOTIFICATION_PERMISSION_STATE$, null).then(function($permission$jscomp$4$$) {
    switch($permission$jscomp$4$$) {
      case "denied":
      case "default":
        return $JSCompiler_StaticMethods_updateWidgetVisibilities$$($JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$self$$);
      case "granted":
        $JSCompiler_StaticMethods_onPermissionGrantedSubscribe_$$($JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$self$$);
        break;
      default:
        throw Error("Unexpected permission value", $permission$jscomp$4$$);
    }
  });
};
var $WebPushConfigAttributes$$module$extensions$amp_web_push$0_1$amp_web_push_config$$ = {$HELPER_FRAME_URL$:"helper-iframe-url", $PERMISSION_DIALOG_URL$:"permission-dialog-url", $SERVICE_WORKER_URL$:"service-worker-url"};
_.$$jscomp$inherits$$($WebPushConfig$$module$extensions$amp_web_push$0_1$amp_web_push_config$$, window.AMP.BaseElement);
$WebPushConfig$$module$extensions$amp_web_push$0_1$amp_web_push_config$$.prototype.$validate$ = function() {
  if ("amp-web-push" !== this.element.getAttribute("id")) {
    throw _.$user$$module$src$log$$().$createError$("<amp-web-push> must have an id attribute with value 'amp-web-push'.");
  }
  if (1 < this.$getAmpDoc$().getRootNode().querySelectorAll("#" + _.$cssEscape$$module$third_party$css_escape$css_escape$$("amp-web-push")).length) {
    throw _.$user$$module$src$log$$().$createError$("Only one <amp-web-push> element may exist on a page.");
  }
  var $config$jscomp$94$$ = {"helper-iframe-url":null, "permission-dialog-url":null, "service-worker-url":null}, $attribute$jscomp$10$$;
  for ($attribute$jscomp$10$$ in $WebPushConfigAttributes$$module$extensions$amp_web_push$0_1$amp_web_push_config$$) {
    var $value$jscomp$312$$ = $WebPushConfigAttributes$$module$extensions$amp_web_push$0_1$amp_web_push_config$$[$attribute$jscomp$10$$];
    $config$jscomp$94$$[$value$jscomp$312$$] = this.element.getAttribute($value$jscomp$312$$);
  }
  if (!$JSCompiler_StaticMethods_isValidHelperOrPermissionDialogUrl_$$($config$jscomp$94$$["helper-iframe-url"])) {
    throw _.$user$$module$src$log$$().$createError$("<amp-web-push> must have a valid helper-iframe-url attribute. It should begin with the https:// protocol and point to the provided lightweight template page provided for AMP messaging.");
  }
  if (!$JSCompiler_StaticMethods_isValidHelperOrPermissionDialogUrl_$$($config$jscomp$94$$["permission-dialog-url"])) {
    throw _.$user$$module$src$log$$().$createError$("<amp-web-push> must have a valid permission-dialog-url attribute. It should begin with the https:// protocol and point to the provided template page for showing the permission prompt.");
  }
  if ("https:" !== _.$parseUrlDeprecated$$module$src$url$$($config$jscomp$94$$["service-worker-url"]).protocol) {
    throw _.$user$$module$src$log$$().$createError$("<amp-web-push> must have a valid service-worker-url attribute. It should begin with the https:// protocol and point to the service worker JavaScript file to be installed.");
  }
  if (_.$parseUrlDeprecated$$module$src$url$$($config$jscomp$94$$["service-worker-url"]).origin !== _.$parseUrlDeprecated$$module$src$url$$($config$jscomp$94$$["permission-dialog-url"]).origin || _.$parseUrlDeprecated$$module$src$url$$($config$jscomp$94$$["permission-dialog-url"]).origin !== _.$parseUrlDeprecated$$module$src$url$$($config$jscomp$94$$["helper-iframe-url"]).origin) {
    throw _.$user$$module$src$log$$().$createError$("<amp-web-push> URL attributes service-worker-url, permission-dialog-url, and helper-iframe-url must all share the same origin.");
  }
};
$WebPushConfig$$module$extensions$amp_web_push$0_1$amp_web_push_config$$.prototype.$buildCallback$ = function() {
  this.$validate$();
  var $config$jscomp$96$$ = $JSCompiler_StaticMethods_parseConfig$$(this);
  _.$getServiceForDoc$$module$src$service$$(this.$getAmpDoc$(), "amp-web-push-service").start($config$jscomp$96$$).catch(function() {
  });
  _.$JSCompiler_StaticMethods_registerAction$$(this, "subscribe", this.$D$.bind(this));
  _.$JSCompiler_StaticMethods_registerAction$$(this, "unsubscribe", this.$F$.bind(this));
};
$WebPushConfig$$module$extensions$amp_web_push$0_1$amp_web_push_config$$.prototype.$D$ = function($invocation$jscomp$51$$) {
  var $widget$jscomp$1$$ = $invocation$jscomp$51$$.event.target;
  $widget$jscomp$1$$.disabled = !0;
  _.$getServiceForDoc$$module$src$service$$(this.$getAmpDoc$(), "amp-web-push-service").subscribe(function() {
    $widget$jscomp$1$$.disabled = !1;
  }).then(function() {
    $widget$jscomp$1$$.disabled = !1;
  });
};
$WebPushConfig$$module$extensions$amp_web_push$0_1$amp_web_push_config$$.prototype.$F$ = function($invocation$jscomp$52$$) {
  var $widget$jscomp$3$$ = $invocation$jscomp$52$$.event.target;
  $widget$jscomp$3$$.disabled = !0;
  _.$getServiceForDoc$$module$src$service$$(this.$getAmpDoc$(), "amp-web-push-service").unsubscribe().then(function() {
    $widget$jscomp$3$$.disabled = !1;
  });
};
_.$$jscomp$inherits$$($WebPushWidget$$module$extensions$amp_web_push$0_1$amp_web_push_widget$$, window.AMP.BaseElement);
$WebPushWidget$$module$extensions$amp_web_push$0_1$amp_web_push_widget$$.prototype.$isLayoutSupported$ = function($layout$jscomp$114$$) {
  return "fixed" == $layout$jscomp$114$$;
};
$WebPushWidget$$module$extensions$amp_web_push$0_1$amp_web_push_widget$$.prototype.$buildCallback$ = function() {
  this.element.classList.add("amp-invisible");
};
$IFrameHost$$module$extensions$amp_web_push$0_1$iframehost$$.prototype.load = function() {
  var $$jscomp$this$jscomp$1339$$ = this;
  return this.$ampdoc_$.$whenReady$().then(function() {
    $$jscomp$this$jscomp$1339$$.$D$ = $$jscomp$this$jscomp$1339$$.$ampdoc_$.$win$.document.createElement("iframe");
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$1339$$.$D$, !1);
    $$jscomp$this$jscomp$1339$$.$D$.sandbox = "allow-same-origin allow-scripts";
    $$jscomp$this$jscomp$1339$$.$D$.src = $$jscomp$this$jscomp$1339$$.$url_$;
    $$jscomp$this$jscomp$1339$$.$ampdoc_$.$getBody$().appendChild($$jscomp$this$jscomp$1339$$.$D$);
    $$jscomp$this$jscomp$1339$$.$loadPromise_$ = _.$loadPromise$$module$src$event_helper$$($$jscomp$this$jscomp$1339$$.$D$);
    return $$jscomp$this$jscomp$1339$$.$whenReady$();
  });
};
$IFrameHost$$module$extensions$amp_web_push$0_1$iframehost$$.prototype.$whenReady$ = function() {
  return this.$loadPromise_$;
};
_.$JSCompiler_prototypeAlias$$ = $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.prototype;
_.$JSCompiler_prototypeAlias$$.$onListenConnectionMessageReceived_$ = function($JSCompiler_inline_result$jscomp$1059_allowedOrigins$jscomp$2$$, $resolvePromise$$, $message$jscomp$87_rejectPromise$$, $messageChannelEvent_messagePorts$$) {
  $message$jscomp$87_rejectPromise$$ = $messageChannelEvent_messagePorts$$.data;
  var $normalizedOrigin$jscomp$inline_5476_origin$jscomp$48$$ = $messageChannelEvent_messagePorts$$.origin;
  $messageChannelEvent_messagePorts$$ = $messageChannelEvent_messagePorts$$.ports;
  this.$G$ && "amp-web-push";
  a: {
    $normalizedOrigin$jscomp$inline_5476_origin$jscomp$48$$ = _.$parseUrlDeprecated$$module$src$url$$($normalizedOrigin$jscomp$inline_5476_origin$jscomp$48$$).origin;
    for (var $i$380$jscomp$inline_5477$$ = 0; $i$380$jscomp$inline_5477$$ < $JSCompiler_inline_result$jscomp$1059_allowedOrigins$jscomp$2$$.length; $i$380$jscomp$inline_5477$$++) {
      if (_.$parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$1059_allowedOrigins$jscomp$2$$[$i$380$jscomp$inline_5477$$]).origin === $normalizedOrigin$jscomp$inline_5476_origin$jscomp$48$$) {
        $JSCompiler_inline_result$jscomp$1059_allowedOrigins$jscomp$2$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$1059_allowedOrigins$jscomp$2$$ = !1;
  }
  $JSCompiler_inline_result$jscomp$1059_allowedOrigins$jscomp$2$$ ? $message$jscomp$87_rejectPromise$$ && $message$jscomp$87_rejectPromise$$.topic === $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$CONNECT_HANDSHAKE$ ? ("amp-web-push", this.$R$.removeEventListener("message", this.$P$), this.$D$ = $messageChannelEvent_messagePorts$$[0], this.$K$ = this.$onChannelMessageReceived_$.bind(this), this.$D$.addEventListener("message", this.$K$, !1), this.$D$.start(), $resolvePromise$$()) : 
  "amp-web-push" : "amp-web-push";
};
_.$JSCompiler_prototypeAlias$$.$onConnectConnectionMessageReceived_$ = function($messagePort$$, $expectedRemoteOrigin$jscomp$1$$, $resolvePromise$jscomp$1$$) {
  this.$J$ = !0;
  this.$G$ && "amp-web-push";
  $messagePort$$.removeEventListener("message", this.$O$);
  this.$K$ = this.$onChannelMessageReceived_$.bind(this);
  $messagePort$$.addEventListener("message", this.$K$, !1);
  $resolvePromise$jscomp$1$$();
};
_.$JSCompiler_prototypeAlias$$.$onChannelMessageReceived_$ = function($event$jscomp$255_message$jscomp$88$$) {
  $event$jscomp$255_message$jscomp$88$$ = $event$jscomp$255_message$jscomp$88$$.data;
  if (this.$I$[$event$jscomp$255_message$jscomp$88$$.id] && $event$jscomp$255_message$jscomp$88$$.isReply) {
    var $existingMessage_listeners$jscomp$1$$ = this.$I$[$event$jscomp$255_message$jscomp$88$$.id];
    delete this.$I$[$event$jscomp$255_message$jscomp$88$$.id];
    var $i$381_promiseResolver$$ = $existingMessage_listeners$jscomp$1$$.$promiseResolver$;
    $existingMessage_listeners$jscomp$1$$.message = $event$jscomp$255_message$jscomp$88$$.data;
    this.$G$ && "amp-web-push";
    $i$381_promiseResolver$$([$event$jscomp$255_message$jscomp$88$$.data, this.$sendReply_$.bind(this, $event$jscomp$255_message$jscomp$88$$.id, $existingMessage_listeners$jscomp$1$$.topic)]);
  } else {
    if ($existingMessage_listeners$jscomp$1$$ = this.$F$[$event$jscomp$255_message$jscomp$88$$.topic]) {
      for (this.$G$ && "amp-web-push", $i$381_promiseResolver$$ = 0; $i$381_promiseResolver$$ < $existingMessage_listeners$jscomp$1$$.length; $i$381_promiseResolver$$++) {
        (0,$existingMessage_listeners$jscomp$1$$[$i$381_promiseResolver$$])($event$jscomp$255_message$jscomp$88$$.data, this.$sendReply_$.bind(this, $event$jscomp$255_message$jscomp$88$$.id, $event$jscomp$255_message$jscomp$88$$.topic));
      }
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$on$ = function($topic$$, $callback$jscomp$168$$) {
  this.$F$[$topic$$] ? this.$F$[$topic$$].push($callback$jscomp$168$$) : this.$F$[$topic$$] = [$callback$jscomp$168$$];
};
_.$JSCompiler_prototypeAlias$$.$off$ = function($topic$jscomp$1$$, $callback$jscomp$169_callbackIndex$$) {
  $callback$jscomp$169_callbackIndex$$ ? ($callback$jscomp$169_callbackIndex$$ = this.$F$[$topic$jscomp$1$$].indexOf($callback$jscomp$169_callbackIndex$$), -1 !== $callback$jscomp$169_callbackIndex$$ && this.$F$[$topic$jscomp$1$$].splice($callback$jscomp$169_callbackIndex$$, 1)) : this.$F$[$topic$jscomp$1$$] && delete this.$F$[$topic$jscomp$1$$];
};
_.$JSCompiler_prototypeAlias$$.$sendReply_$ = function($id$jscomp$111$$, $topic$jscomp$2$$, $data$jscomp$220$$) {
  var $$jscomp$this$jscomp$1342$$ = this, $payload$jscomp$37$$ = {id:$id$jscomp$111$$, $topic$:$topic$jscomp$2$$, data:$data$jscomp$220$$, $isReply$:!0};
  this.$D$.postMessage($payload$jscomp$37$$);
  return new window.Promise(function($id$jscomp$111$$) {
    $$jscomp$this$jscomp$1342$$.$I$[$payload$jscomp$37$$.id] = {message:$data$jscomp$220$$, $topic$:$topic$jscomp$2$$, $promiseResolver$:$id$jscomp$111$$};
  });
};
_.$$jscomp$global$$.Object.defineProperties($WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$, {$D$:{configurable:!0, enumerable:!0, get:function() {
  return {$CONNECT_HANDSHAKE$:"topic-connect-handshake", $NOTIFICATION_PERMISSION_STATE$:"topic-notification-permission-state", $SERVICE_WORKER_STATE$:"topic-service-worker-state", $SERVICE_WORKER_REGISTRATION$:"topic-service-worker-registration", $SERVICE_WORKER_QUERY$:"topic-service-worker-query", $STORAGE_GET$:"topic-storage-get"};
}}});
$WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.prototype.start = function($JSCompiler_inline_result$jscomp$1060_configJson$jscomp$15$$) {
  var $$jscomp$this$jscomp$1344$$ = this;
  "amp-web-push";
  if (void 0 === this.ampdoc.$win$.Notification || void 0 === this.ampdoc.$win$.navigator.serviceWorker || void 0 === this.ampdoc.$win$.PushManager || "https:" !== this.ampdoc.$win$.location.protocol && "localhost" !== this.ampdoc.$win$.location.hostname && "127.0.0.1" !== this.ampdoc.$win$.location.hostname && !_.$getMode$$module$src$mode$$().$development$) {
    return _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-web-push", "Web push is not supported."), window.Promise.reject("Web push is not supported");
  }
  this.$config_$ = $JSCompiler_inline_result$jscomp$1060_configJson$jscomp$15$$;
  this.$iframe_$ = new $IFrameHost$$module$extensions$amp_web_push$0_1$iframehost$$(this.ampdoc, "" + this.$config_$["helper-iframe-url"] + (-1 !== this.$config_$["helper-iframe-url"].indexOf("?") ? "&" : "?") + ("parentOrigin=" + this.ampdoc.$win$.location.origin));
  $JSCompiler_inline_result$jscomp$1060_configJson$jscomp$15$$ = this.$iframe_$.load();
  $JSCompiler_inline_result$jscomp$1060_configJson$jscomp$15$$.then(function() {
    "amp-web-push";
    return $JSCompiler_StaticMethods_WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger_prototype$connect$$($$jscomp$this$jscomp$1344$$.$G$, $$jscomp$this$jscomp$1344$$.$iframe_$.$D$.contentWindow, _.$parseUrlDeprecated$$module$src$url$$($$jscomp$this$jscomp$1344$$.$config_$["helper-iframe-url"]).origin);
  }).then(function() {
    if (-1 !== ($$jscomp$this$jscomp$1344$$.ampdoc.$win$.$testLocation$ || $$jscomp$this$jscomp$1344$$.ampdoc.$win$.location).search.indexOf($WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.$D$)) {
      $JSCompiler_StaticMethods_resumeSubscribingForPushNotifications_$$($$jscomp$this$jscomp$1344$$);
    } else {
      return $JSCompiler_StaticMethods_updateWidgetVisibilities$$($$jscomp$this$jscomp$1344$$);
    }
  });
  return $JSCompiler_inline_result$jscomp$1060_configJson$jscomp$15$$;
};
$WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.prototype.subscribe = function($onPopupClosed$$) {
  var $$jscomp$this$jscomp$1350$$ = this, $promises$jscomp$26$$ = [];
  $promises$jscomp$26$$.push($JSCompiler_StaticMethods_queryHelperFrame_$$(this, $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$.$D$.$SERVICE_WORKER_REGISTRATION$, {$workerUrl$:this.$config_$["service-worker-url"], $registrationOptions$:this.$config_$.$serviceWorkerRegistrationOptions$ || {scope:"/"}}));
  $promises$jscomp$26$$.push(new window.Promise(function($promises$jscomp$26$$) {
    switch($$jscomp$this$jscomp$1350$$.$I$) {
      case "granted":
        return $JSCompiler_StaticMethods_onPermissionGrantedSubscribe_$$($$jscomp$this$jscomp$1350$$).then(function() {
          $promises$jscomp$26$$();
        });
      default:
        var $resolve$jscomp$112$$ = $JSCompiler_StaticMethods_openPopupOrRedirect$$($$jscomp$this$jscomp$1350$$);
        $JSCompiler_StaticMethods_checkPermissionDialogClosedInterval_$$($$jscomp$this$jscomp$1350$$, $resolve$jscomp$112$$, $onPopupClosed$$);
        $$jscomp$this$jscomp$1350$$.$D$ = new $WindowMessenger$$module$extensions$amp_web_push$0_1$window_messenger$$({debug:$$jscomp$this$jscomp$1350$$.$F$});
        $JSCompiler_StaticMethods_listen$$($$jscomp$this$jscomp$1350$$.$D$, [$$jscomp$this$jscomp$1350$$.$config_$["permission-dialog-url"]]);
        $JSCompiler_StaticMethods_onPermissionDialogInteracted$$($$jscomp$this$jscomp$1350$$).then(function($onPopupClosed$$) {
          a: {
            var $promises$jscomp$26$$ = $onPopupClosed$$[0];
            $onPopupClosed$$ = $onPopupClosed$$[1];
            switch($promises$jscomp$26$$) {
              case "denied":
              case "default":
                $onPopupClosed$$({$closeFrame$:!0});
                $promises$jscomp$26$$ = $JSCompiler_StaticMethods_updateWidgetVisibilities$$($$jscomp$this$jscomp$1350$$);
                break a;
              case "granted":
                $onPopupClosed$$({$closeFrame$:!0});
                $JSCompiler_StaticMethods_onPermissionGrantedSubscribe_$$($$jscomp$this$jscomp$1350$$);
                break;
              default:
                throw Error("Unexpected permission value:", $promises$jscomp$26$$);
            }
            $promises$jscomp$26$$ = void 0;
          }
          return $promises$jscomp$26$$;
        }).then(function() {
          $promises$jscomp$26$$();
        });
    }
  }));
  return window.Promise.all($promises$jscomp$26$$);
};
$WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$.prototype.unsubscribe = function() {
  var $$jscomp$this$jscomp$1353$$ = this;
  return $JSCompiler_StaticMethods_queryServiceWorker_$$(this, "amp-web-push-unsubscribe").then(function() {
    return $JSCompiler_StaticMethods_updateWidgetVisibilities$$($$jscomp$this$jscomp$1353$$);
  });
};
_.$$jscomp$global$$.Object.defineProperties($WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$, {$D$:{configurable:!0, enumerable:!0, get:function() {
  return "amp-web-push-subscribing=yes";
}}, $F$:{configurable:!0, enumerable:!0, get:function() {
  return 1;
}}});
var $AMP$jscomp$inline_5512$$ = window.self.AMP;
$AMP$jscomp$inline_5512$$.registerServiceForDoc("amp-web-push-service", $WebPushService$$module$extensions$amp_web_push$0_1$web_push_service$$);
$AMP$jscomp$inline_5512$$.registerElement("amp-web-push", $WebPushConfig$$module$extensions$amp_web_push$0_1$amp_web_push_config$$);
$AMP$jscomp$inline_5512$$.registerElement("amp-web-push-widget", $WebPushWidget$$module$extensions$amp_web_push$0_1$amp_web_push_widget$$, "amp-web-push-widget.amp-invisible{visibility:hidden}\n/*# sourceURL=/extensions/amp-web-push/0.1/amp-web-push.css*/");

})});
