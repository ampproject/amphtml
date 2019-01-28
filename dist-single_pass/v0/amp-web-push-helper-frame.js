(function(){var $JSCompiler_prototypeAlias$$, $$jscomp$global$$ = function($maybeGlobal$$) {
  return "undefined" != typeof window && window === $maybeGlobal$$ ? $maybeGlobal$$ : "undefined" != typeof global && null != global ? global : $maybeGlobal$$;
}(this);
function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
  $fallback$$ = void 0 === $fallback$$ ? "" : $fallback$$;
  try {
    return decodeURIComponent($component$jscomp$4$$);
  } catch ($e$jscomp$7$$) {
    return $fallback$$;
  }
}
;var $regex$$module$src$url_parse_query_string$$ = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
self.log = self.log || {user:null, dev:null, userForEmbed:null};
var $logs$$module$src$log$$ = self.log;
function $LruCache$$module$src$utils$lru_cache$$() {
  var $capacity$$ = 100;
  this.$capacity_$ = $capacity$$;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$35$$) {
  return !!this.$cache_$[$key$jscomp$35$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$36$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$36$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    if ($logs$$module$src$log$$.dev) {
      $JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$ = $logs$$module$src$log$$.dev;
    } else {
      throw Error("failed to call initLogConstructor");
    }
    $JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$.warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_9$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_11$$;
    for ($JSCompiler_key$jscomp$inline_11$$ in $JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$) {
      var $JSCompiler_access$jscomp$inline_12$$ = $JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$[$JSCompiler_key$jscomp$inline_11$$].access;
      if ($JSCompiler_access$jscomp$inline_12$$ < $JSCompiler_oldest$jscomp$inline_9$$) {
        $JSCompiler_oldest$jscomp$inline_9$$ = $JSCompiler_access$jscomp$inline_12$$;
        var $JSCompiler_oldestKey$jscomp$inline_10$$ = $JSCompiler_key$jscomp$inline_11$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_10$$ && (delete $JSCompiler_cache$jscomp$inline_8_JSCompiler_inline_result$jscomp$30_key$jscomp$37$$[$JSCompiler_oldestKey$jscomp$inline_10$$], this.$size_$--);
  }
};
(function($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
})({c:!0, v:!0, a:!0, ad:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$5_url$jscomp$21$$) {
  var $opt_nocache$$;
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.UrlCache || (self.UrlCache = new $LruCache$$module$src$utils$lru_cache$$));
  var $JSCompiler_opt_cache$jscomp$inline_15$$ = $opt_nocache$$ ? null : $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_16$$ = $a$$module$src$url$$;
  if ($JSCompiler_opt_cache$jscomp$inline_15$$ && $JSCompiler_opt_cache$jscomp$inline_15$$.has($JSCompiler_inline_result$jscomp$5_url$jscomp$21$$)) {
    $JSCompiler_inline_result$jscomp$5_url$jscomp$21$$ = $JSCompiler_opt_cache$jscomp$inline_15$$.get($JSCompiler_inline_result$jscomp$5_url$jscomp$21$$);
  } else {
    $JSCompiler_a$jscomp$inline_16$$.href = $JSCompiler_inline_result$jscomp$5_url$jscomp$21$$;
    $JSCompiler_a$jscomp$inline_16$$.protocol || ($JSCompiler_a$jscomp$inline_16$$.href = $JSCompiler_a$jscomp$inline_16$$.href);
    var $JSCompiler_info$jscomp$inline_17$$ = {href:$JSCompiler_a$jscomp$inline_16$$.href, protocol:$JSCompiler_a$jscomp$inline_16$$.protocol, host:$JSCompiler_a$jscomp$inline_16$$.host, hostname:$JSCompiler_a$jscomp$inline_16$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_16$$.port ? "" : $JSCompiler_a$jscomp$inline_16$$.port, pathname:$JSCompiler_a$jscomp$inline_16$$.pathname, search:$JSCompiler_a$jscomp$inline_16$$.search, hash:$JSCompiler_a$jscomp$inline_16$$.hash, origin:null};
    "/" !== $JSCompiler_info$jscomp$inline_17$$.pathname[0] && ($JSCompiler_info$jscomp$inline_17$$.pathname = "/" + $JSCompiler_info$jscomp$inline_17$$.pathname);
    if ("http:" == $JSCompiler_info$jscomp$inline_17$$.protocol && 80 == $JSCompiler_info$jscomp$inline_17$$.port || "https:" == $JSCompiler_info$jscomp$inline_17$$.protocol && 443 == $JSCompiler_info$jscomp$inline_17$$.port) {
      $JSCompiler_info$jscomp$inline_17$$.port = "", $JSCompiler_info$jscomp$inline_17$$.host = $JSCompiler_info$jscomp$inline_17$$.hostname;
    }
    $JSCompiler_info$jscomp$inline_17$$.origin = $JSCompiler_a$jscomp$inline_16$$.origin && "null" != $JSCompiler_a$jscomp$inline_16$$.origin ? $JSCompiler_a$jscomp$inline_16$$.origin : "data:" != $JSCompiler_info$jscomp$inline_17$$.protocol && $JSCompiler_info$jscomp$inline_17$$.host ? $JSCompiler_info$jscomp$inline_17$$.protocol + "//" + $JSCompiler_info$jscomp$inline_17$$.host : $JSCompiler_info$jscomp$inline_17$$.href;
    $JSCompiler_opt_cache$jscomp$inline_15$$ && $JSCompiler_opt_cache$jscomp$inline_15$$.put($JSCompiler_inline_result$jscomp$5_url$jscomp$21$$, $JSCompiler_info$jscomp$inline_17$$);
    $JSCompiler_inline_result$jscomp$5_url$jscomp$21$$ = $JSCompiler_info$jscomp$inline_17$$;
  }
  return $JSCompiler_inline_result$jscomp$5_url$jscomp$21$$;
}
;function $WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$($options$jscomp$14$$) {
  $options$jscomp$14$$ || ($options$jscomp$14$$ = {debug:!1, windowContext:window});
  this.$messages_$ = {};
  this.$listeners_$ = {};
  this.$debug_$ = $options$jscomp$14$$.debug;
  this.$connected_$ = this.$connecting_$ = this.$listening_$ = !1;
  this.$onChannelMessageReceivedProc_$ = this.$onConnectConnectionMessageReceivedProc_$ = this.$onListenConnectionMessageReceivedProc_$ = this.$messagePort_$ = this.$channel_$ = null;
  this.$window_$ = $options$jscomp$14$$.windowContext || window;
}
$JSCompiler_prototypeAlias$$ = $WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.prototype;
$JSCompiler_prototypeAlias$$.listen = function($allowedOrigins$$) {
  var $$jscomp$this$$ = this;
  return (new Promise(function($resolve$jscomp$2$$, $reject$jscomp$1$$) {
    $$jscomp$this$$.$connected_$ ? $reject$jscomp$1$$(Error("Already connected.")) : $$jscomp$this$$.$listening_$ ? $reject$jscomp$1$$(Error("Already listening for connections.")) : Array.isArray($allowedOrigins$$) ? ($$jscomp$this$$.$onListenConnectionMessageReceivedProc_$ = $$jscomp$this$$.$onListenConnectionMessageReceived_$.bind($$jscomp$this$$, $allowedOrigins$$, $resolve$jscomp$2$$, $reject$jscomp$1$$), $$jscomp$this$$.$window_$.addEventListener("message", $$jscomp$this$$.$onListenConnectionMessageReceivedProc_$)) : 
    $reject$jscomp$1$$(Error("allowedOrigins should be a string array of allowed origins to accept messages from. Got:", $allowedOrigins$$));
  })).then(function() {
    $$jscomp$this$$.send($WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.CONNECT_HANDSHAKE, null);
    $$jscomp$this$$.$connected_$ = !0;
  });
};
$JSCompiler_prototypeAlias$$.$onListenConnectionMessageReceived_$ = function($JSCompiler_inline_result$jscomp$6_allowedOrigins$jscomp$2$$, $resolvePromise$$, $rejectPromise$$, $messageChannelEvent$$) {
  var $message$jscomp$29$$ = $messageChannelEvent$$.data, $$jscomp$destructuring$var5_JSCompiler_normalizedOrigin$jscomp$inline_23$$ = $messageChannelEvent$$, $messagePorts$$ = $$jscomp$destructuring$var5_JSCompiler_normalizedOrigin$jscomp$inline_23$$.ports;
  a: {
    $$jscomp$destructuring$var5_JSCompiler_normalizedOrigin$jscomp$inline_23$$ = $parseUrlDeprecated$$module$src$url$$($$jscomp$destructuring$var5_JSCompiler_normalizedOrigin$jscomp$inline_23$$.origin).origin;
    for (var $JSCompiler_i$jscomp$inline_24$$ = 0; $JSCompiler_i$jscomp$inline_24$$ < $JSCompiler_inline_result$jscomp$6_allowedOrigins$jscomp$2$$.length; $JSCompiler_i$jscomp$inline_24$$++) {
      if ($parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$6_allowedOrigins$jscomp$2$$[$JSCompiler_i$jscomp$inline_24$$]).origin === $$jscomp$destructuring$var5_JSCompiler_normalizedOrigin$jscomp$inline_23$$) {
        $JSCompiler_inline_result$jscomp$6_allowedOrigins$jscomp$2$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$6_allowedOrigins$jscomp$2$$ = !1;
  }
  $JSCompiler_inline_result$jscomp$6_allowedOrigins$jscomp$2$$ && $message$jscomp$29$$ && $message$jscomp$29$$.topic === $WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.CONNECT_HANDSHAKE && (this.$window_$.removeEventListener("message", this.$onListenConnectionMessageReceivedProc_$), this.$messagePort_$ = $messagePorts$$[0], this.$onChannelMessageReceivedProc_$ = this.$onChannelMessageReceived_$.bind(this), this.$messagePort_$.addEventListener("message", this.$onChannelMessageReceivedProc_$, 
  !1), this.$messagePort_$.start(), $resolvePromise$$());
};
$JSCompiler_prototypeAlias$$.connect = function($remoteWindowContext$$, $expectedRemoteOrigin$$) {
  var $$jscomp$this$jscomp$1$$ = this;
  return new Promise(function($resolve$jscomp$3$$, $reject$jscomp$2$$) {
    $remoteWindowContext$$ || $reject$jscomp$2$$(Error("Provide a valid Window context to connect to."));
    $expectedRemoteOrigin$$ || $reject$jscomp$2$$(Error("Provide an expected origin for the remote Window or provide the wildcard *."));
    $$jscomp$this$jscomp$1$$.$connected_$ ? $reject$jscomp$2$$(Error("Already connected.")) : $$jscomp$this$jscomp$1$$.$connecting_$ ? $reject$jscomp$2$$(Error("Already connecting.")) : ($$jscomp$this$jscomp$1$$.$channel_$ = new MessageChannel, $$jscomp$this$jscomp$1$$.$messagePort_$ = $$jscomp$this$jscomp$1$$.$channel_$.port1, $$jscomp$this$jscomp$1$$.$onConnectConnectionMessageReceivedProc_$ = $$jscomp$this$jscomp$1$$.$onConnectConnectionMessageReceived_$.bind($$jscomp$this$jscomp$1$$, $$jscomp$this$jscomp$1$$.$messagePort_$, 
    $expectedRemoteOrigin$$, $resolve$jscomp$3$$), $$jscomp$this$jscomp$1$$.$messagePort_$.addEventListener("message", $$jscomp$this$jscomp$1$$.$onConnectConnectionMessageReceivedProc_$), $$jscomp$this$jscomp$1$$.$messagePort_$.start(), $remoteWindowContext$$.postMessage({topic:$WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.CONNECT_HANDSHAKE}, "*" === $expectedRemoteOrigin$$ ? "*" : $parseUrlDeprecated$$module$src$url$$($expectedRemoteOrigin$$).origin, [$$jscomp$this$jscomp$1$$.$channel_$.port2]));
  });
};
$JSCompiler_prototypeAlias$$.$onConnectConnectionMessageReceived_$ = function($messagePort$$, $expectedRemoteOrigin$jscomp$1$$, $resolvePromise$jscomp$1$$) {
  this.$connected_$ = !0;
  $messagePort$$.removeEventListener("message", this.$onConnectConnectionMessageReceivedProc_$);
  this.$onChannelMessageReceivedProc_$ = this.$onChannelMessageReceived_$.bind(this);
  $messagePort$$.addEventListener("message", this.$onChannelMessageReceivedProc_$, !1);
  $resolvePromise$jscomp$1$$();
};
$JSCompiler_prototypeAlias$$.$onChannelMessageReceived_$ = function($event$jscomp$5_message$jscomp$30$$) {
  $event$jscomp$5_message$jscomp$30$$ = $event$jscomp$5_message$jscomp$30$$.data;
  if (this.$messages_$[$event$jscomp$5_message$jscomp$30$$.id] && $event$jscomp$5_message$jscomp$30$$.isReply) {
    var $existingMessage$$ = this.$messages_$[$event$jscomp$5_message$jscomp$30$$.id];
    delete this.$messages_$[$event$jscomp$5_message$jscomp$30$$.id];
    var $promiseResolver$$ = $existingMessage$$.promiseResolver;
    $existingMessage$$.message = $event$jscomp$5_message$jscomp$30$$.data;
    $promiseResolver$$([$event$jscomp$5_message$jscomp$30$$.data, this.$sendReply_$.bind(this, $event$jscomp$5_message$jscomp$30$$.id, $existingMessage$$.topic)]);
  } else {
    var $listeners$$ = this.$listeners_$[$event$jscomp$5_message$jscomp$30$$.topic];
    if ($listeners$$) {
      for (var $i$jscomp$10$$ = 0; $i$jscomp$10$$ < $listeners$$.length; $i$jscomp$10$$++) {
        (0,$listeners$$[$i$jscomp$10$$])($event$jscomp$5_message$jscomp$30$$.data, this.$sendReply_$.bind(this, $event$jscomp$5_message$jscomp$30$$.id, $event$jscomp$5_message$jscomp$30$$.topic));
      }
    }
  }
};
$JSCompiler_prototypeAlias$$.on = function($topic$$, $callback$jscomp$51$$) {
  this.$listeners_$[$topic$$] ? this.$listeners_$[$topic$$].push($callback$jscomp$51$$) : this.$listeners_$[$topic$$] = [$callback$jscomp$51$$];
};
$JSCompiler_prototypeAlias$$.off = function($topic$jscomp$1$$, $callback$jscomp$52$$) {
  if ($callback$jscomp$52$$) {
    var $callbackIndex$$ = this.$listeners_$[$topic$jscomp$1$$].indexOf($callback$jscomp$52$$);
    -1 !== $callbackIndex$$ && this.$listeners_$[$topic$jscomp$1$$].splice($callbackIndex$$, 1);
  } else {
    this.$listeners_$[$topic$jscomp$1$$] && delete this.$listeners_$[$topic$jscomp$1$$];
  }
};
$JSCompiler_prototypeAlias$$.$sendReply_$ = function($id$jscomp$6$$, $topic$jscomp$2$$, $data$jscomp$33$$) {
  var $$jscomp$this$jscomp$2$$ = this, $payload$jscomp$1$$ = {id:$id$jscomp$6$$, topic:$topic$jscomp$2$$, data:$data$jscomp$33$$, isReply:!0};
  this.$messagePort_$.postMessage($payload$jscomp$1$$);
  return new Promise(function($id$jscomp$6$$) {
    $$jscomp$this$jscomp$2$$.$messages_$[$payload$jscomp$1$$.id] = {message:$data$jscomp$33$$, topic:$topic$jscomp$2$$, promiseResolver:$id$jscomp$6$$};
  });
};
$JSCompiler_prototypeAlias$$.send = function($topic$jscomp$3$$, $data$jscomp$34$$) {
  var $$jscomp$this$jscomp$3$$ = this, $payload$jscomp$2$$ = {id:crypto.getRandomValues(new Uint8Array(10)).join(""), topic:$topic$jscomp$3$$, data:$data$jscomp$34$$};
  this.$messagePort_$.postMessage($payload$jscomp$2$$);
  return new Promise(function($resolve$jscomp$5$$) {
    $$jscomp$this$jscomp$3$$.$messages_$[$payload$jscomp$2$$.id] = {message:$data$jscomp$34$$, topic:$topic$jscomp$3$$, promiseResolver:$resolve$jscomp$5$$};
  });
};
$$jscomp$global$$.Object.defineProperties($WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$, {Topics:{configurable:!0, enumerable:!0, get:function() {
  return {CONNECT_HANDSHAKE:"topic-connect-handshake", NOTIFICATION_PERMISSION_STATE:"topic-notification-permission-state", SERVICE_WORKER_STATE:"topic-service-worker-state", SERVICE_WORKER_REGISTRATION:"topic-service-worker-registration", SERVICE_WORKER_QUERY:"topic-service-worker-query", STORAGE_GET:"topic-storage-get"};
}}});
function $AmpWebPushHelperFrame$$module$build$all$amp_web_push_0_1$amp_web_push_helper_frame$$() {
  var $options$jscomp$15$$ = {debug:!1};
  this.$debug_$ = $options$jscomp$15$$ && $options$jscomp$15$$.debug;
  this.$window_$ = $options$jscomp$15$$.windowContext || window;
  this.$ampMessenger_$ = new $WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$({debug:this.$debug_$, windowContext:this.$window_$});
  this.$allowedWorkerMessageTopics_$ = {};
}
function $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrameFunction$$, $successPayload$$) {
  var $wasSuccessful$$ = !0, $errorPayload$$ = null;
  $replyToFrameFunction$$({success:$wasSuccessful$$, error:$wasSuccessful$$ ? void 0 : $errorPayload$$, result:$wasSuccessful$$ ? $successPayload$$ : void 0});
}
$JSCompiler_prototypeAlias$$ = $AmpWebPushHelperFrame$$module$build$all$amp_web_push_0_1$amp_web_push_helper_frame$$.prototype;
$JSCompiler_prototypeAlias$$.$onAmpPageMessageReceivedNotificationPermissionState_$ = function($message$jscomp$31$$, $replyToFrame$$) {
  if ($message$jscomp$31$$ && $message$jscomp$31$$.isQueryTopicSupported) {
    var $foundTopicValue$$ = !1, $topicName$$;
    for ($topicName$$ in $WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics) {
      $message$jscomp$31$$.isQueryTopicSupported === $WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics[$topicName$$] && ($foundTopicValue$$ = !0);
    }
    $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrame$$, $foundTopicValue$$);
  } else {
    $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrame$$, Notification.permission);
  }
};
$JSCompiler_prototypeAlias$$.$onAmpPageMessageReceivedStorageGet_$ = function($message$jscomp$32$$, $replyToFrame$jscomp$1$$) {
  var $storageValue$$ = null;
  try {
    if ($message$jscomp$32$$ && $message$jscomp$32$$.key && this.$window_$.localStorage) {
      $storageValue$$ = this.$window_$.localStorage.getItem($message$jscomp$32$$.key);
    } else {
      if (!$logs$$module$src$log$$.user) {
        throw Error("failed to call initLogConstructor");
      }
      $logs$$module$src$log$$.user.warn("amp-web-push", "LocalStorage retrieval failed.");
    }
  } catch ($e$jscomp$12$$) {
  }
  $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrame$jscomp$1$$, $storageValue$$);
};
$JSCompiler_prototypeAlias$$.$onAmpPageMessageReceivedServiceWorkerState_$ = function($_$$, $replyToFrame$jscomp$2$$) {
  var $serviceWorkerState$$ = {isControllingFrame:!!this.$window_$.navigator.serviceWorker.controller, url:this.$window_$.navigator.serviceWorker.controller ? this.$window_$.navigator.serviceWorker.controller.scriptURL : null, state:this.$window_$.navigator.serviceWorker.controller ? this.$window_$.navigator.serviceWorker.controller.state : null};
  $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrame$jscomp$2$$, $serviceWorkerState$$);
};
$JSCompiler_prototypeAlias$$.$onAmpPageMessageReceivedServiceWorkerRegistration_$ = function($message$jscomp$33$$, $replyToFrame$jscomp$3$$) {
  if (!$message$jscomp$33$$ || !$message$jscomp$33$$.workerUrl || !$message$jscomp$33$$.registrationOptions) {
    throw Error("Expected arguments workerUrl and registrationOptions in message, got:", $message$jscomp$33$$);
  }
  this.$window_$.navigator.serviceWorker.register($message$jscomp$33$$.workerUrl, $message$jscomp$33$$.registrationOptions).then(function() {
    $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrame$jscomp$3$$, null);
  }).catch(function($message$jscomp$33$$) {
    $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrame$jscomp$3$$, $message$jscomp$33$$ ? $message$jscomp$33$$.message || $message$jscomp$33$$.toString() : null);
  });
};
$JSCompiler_prototypeAlias$$.messageServiceWorker = function($message$jscomp$34$$) {
  this.$window_$.navigator.serviceWorker.controller.postMessage({command:$message$jscomp$34$$.topic, payload:$message$jscomp$34$$.payload});
};
$JSCompiler_prototypeAlias$$.$onAmpPageMessageReceivedServiceWorkerQuery_$ = function($message$jscomp$35$$, $replyToFrame$jscomp$4$$) {
  var $$jscomp$this$jscomp$5$$ = this;
  if (!$message$jscomp$35$$ || !$message$jscomp$35$$.topic) {
    throw Error("Expected argument topic in message, got:", $message$jscomp$35$$);
  }
  (new Promise(function($replyToFrame$jscomp$4$$) {
    $$jscomp$this$jscomp$5$$.$allowedWorkerMessageTopics_$[$message$jscomp$35$$.topic] = $replyToFrame$jscomp$4$$;
    $$jscomp$this$jscomp$5$$.waitUntilWorkerControlsPage().then(function() {
      $$jscomp$this$jscomp$5$$.messageServiceWorker($message$jscomp$35$$);
    });
  })).then(function($workerReplyPayload$$) {
    delete $$jscomp$this$jscomp$5$$.$allowedWorkerMessageTopics_$[$message$jscomp$35$$.topic];
    return $JSCompiler_StaticMethods_replyToFrameWithPayload_$$($replyToFrame$jscomp$4$$, $workerReplyPayload$$);
  });
};
function $JSCompiler_StaticMethods_getParentOrigin_$$($JSCompiler_StaticMethods_getParentOrigin_$self_JSCompiler_queryString$jscomp$inline_36$$) {
  $JSCompiler_StaticMethods_getParentOrigin_$self_JSCompiler_queryString$jscomp$inline_36$$ = $JSCompiler_StaticMethods_getParentOrigin_$self_JSCompiler_queryString$jscomp$inline_36$$.$window_$.location.search;
  var $JSCompiler_params$jscomp$inline_37$$ = Object.create(null);
  if ($JSCompiler_StaticMethods_getParentOrigin_$self_JSCompiler_queryString$jscomp$inline_36$$) {
    for (var $JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$; $JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$ = $regex$$module$src$url_parse_query_string$$.exec($JSCompiler_StaticMethods_getParentOrigin_$self_JSCompiler_queryString$jscomp$inline_36$$);) {
      var $JSCompiler_name$jscomp$inline_39$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$[1], $JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$[1]);
      $JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$ = $JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$[2], $JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$[2]) : "";
      $JSCompiler_params$jscomp$inline_37$$[$JSCompiler_name$jscomp$inline_39$$] = $JSCompiler_match$jscomp$inline_38_JSCompiler_value$jscomp$inline_40$$;
    }
  }
  var $queryParams$$ = $JSCompiler_params$jscomp$inline_37$$;
  if (!$queryParams$$.parentOrigin) {
    throw Error("Expecting parentOrigin URL query parameter.");
  }
  return $queryParams$$.parentOrigin;
}
$JSCompiler_prototypeAlias$$.$onPageMessageReceivedFromServiceWorker_$ = function($$jscomp$destructuring$var7_event$jscomp$6_payload$jscomp$3$$) {
  $$jscomp$destructuring$var7_event$jscomp$6_payload$jscomp$3$$ = $$jscomp$destructuring$var7_event$jscomp$6_payload$jscomp$3$$.data;
  var $command$$ = $$jscomp$destructuring$var7_event$jscomp$6_payload$jscomp$3$$.command;
  $$jscomp$destructuring$var7_event$jscomp$6_payload$jscomp$3$$ = $$jscomp$destructuring$var7_event$jscomp$6_payload$jscomp$3$$.payload;
  var $callbackPromiseResolver$$ = this.$allowedWorkerMessageTopics_$[$command$$];
  "function" === typeof $callbackPromiseResolver$$ && $callbackPromiseResolver$$($$jscomp$destructuring$var7_event$jscomp$6_payload$jscomp$3$$);
};
function $JSCompiler_StaticMethods_isWorkerControllingPage_$$($JSCompiler_StaticMethods_isWorkerControllingPage_$self$$) {
  return $JSCompiler_StaticMethods_isWorkerControllingPage_$self$$.$window_$.navigator.serviceWorker && $JSCompiler_StaticMethods_isWorkerControllingPage_$self$$.$window_$.navigator.serviceWorker.controller && "activated" === $JSCompiler_StaticMethods_isWorkerControllingPage_$self$$.$window_$.navigator.serviceWorker.controller.state;
}
$JSCompiler_prototypeAlias$$.waitUntilWorkerControlsPage = function() {
  var $$jscomp$this$jscomp$6$$ = this;
  return new Promise(function($resolve$jscomp$7$$) {
    $JSCompiler_StaticMethods_isWorkerControllingPage_$$($$jscomp$this$jscomp$6$$) ? $resolve$jscomp$7$$() : $$jscomp$this$jscomp$6$$.$window_$.navigator.serviceWorker.addEventListener("controllerchange", function() {
      $JSCompiler_StaticMethods_isWorkerControllingPage_$$($$jscomp$this$jscomp$6$$) ? $resolve$jscomp$7$$() : $$jscomp$this$jscomp$6$$.$window_$.navigator.serviceWorker.controller.addEventListener("statechange", function() {
        $JSCompiler_StaticMethods_isWorkerControllingPage_$$($$jscomp$this$jscomp$6$$) && $resolve$jscomp$7$$();
      });
    });
  });
};
$JSCompiler_prototypeAlias$$.run = function($allowedOrigin$jscomp$1$$) {
  var $$jscomp$this$jscomp$7$$ = this;
  this.$ampMessenger_$.on($WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.NOTIFICATION_PERMISSION_STATE, this.$onAmpPageMessageReceivedNotificationPermissionState_$.bind(this));
  this.$ampMessenger_$.on($WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.SERVICE_WORKER_STATE, this.$onAmpPageMessageReceivedServiceWorkerState_$.bind(this));
  this.$ampMessenger_$.on($WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.SERVICE_WORKER_REGISTRATION, this.$onAmpPageMessageReceivedServiceWorkerRegistration_$.bind(this));
  this.$ampMessenger_$.on($WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.SERVICE_WORKER_QUERY, this.$onAmpPageMessageReceivedServiceWorkerQuery_$.bind(this));
  this.$ampMessenger_$.on($WindowMessenger$$module$build$all$amp_web_push_0_1$window_messenger$$.Topics.STORAGE_GET, this.$onAmpPageMessageReceivedStorageGet_$.bind(this));
  this.waitUntilWorkerControlsPage().then(function() {
    $$jscomp$this$jscomp$7$$.$window_$.navigator.serviceWorker.addEventListener("message", $$jscomp$this$jscomp$7$$.$onPageMessageReceivedFromServiceWorker_$.bind($$jscomp$this$jscomp$7$$));
  });
  this.$ampMessenger_$.listen([$allowedOrigin$jscomp$1$$ || $JSCompiler_StaticMethods_getParentOrigin_$$(this)]);
};
window._ampWebPushHelperFrame = new $AmpWebPushHelperFrame$$module$build$all$amp_web_push_0_1$amp_web_push_helper_frame$$;
window._ampWebPushHelperFrame.run();
})();
//# sourceMappingURL=amp-web-push-helper-frame.js.map

