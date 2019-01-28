(self.AMP=self.AMP||[]).push({n:"amp-subscriptions-google",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
/*

 Copyright 2018 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

     Math.uuid.js (v1.4)
     http://www.broofa.com
     mailto:robert@broofa.com
     Copyright (c) 2010 Robert Kieffer
     Dual licensed under the MIT and GPL licenses.

  Math.uuid.js (v1.4)
  http://www.broofa.com
  mailto:robert@broofa.com
  Copyright (c) 2010 Robert Kieffer
  Dual licensed under the MIT and GPL licenses.

 Copyright 2017 The Web Activities Authors. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
var $ActivityResult$$module$third_party$subscriptions_project$swg$$ = function($code$jscomp$3$$, $data$jscomp$180$$, $mode$jscomp$14$$, $origin$jscomp$33$$, $originVerified$$, $secureChannel$$) {
  this.code = $code$jscomp$3$$;
  this.data = "ok" == $code$jscomp$3$$ ? $data$jscomp$180$$ : null;
  this.mode = $mode$jscomp$14$$;
  this.origin = $origin$jscomp$33$$;
  this.$originVerified$ = $originVerified$$;
  this.$secureChannel$ = $secureChannel$$;
  this.$D$ = "ok" == $code$jscomp$3$$;
  this.error = "failed" == $code$jscomp$3$$ ? Error(String($data$jscomp$180$$) || "") : null;
}, $parseUrl$$module$third_party$subscriptions_project$swg$$ = function($urlString$jscomp$6$$) {
  $aResolver$$module$third_party$subscriptions_project$swg$$ || ($aResolver$$module$third_party$subscriptions_project$swg$$ = window.document.createElement("a"));
  $aResolver$$module$third_party$subscriptions_project$swg$$.href = $urlString$jscomp$6$$;
  return $aResolver$$module$third_party$subscriptions_project$swg$$;
}, $getOrigin$$module$third_party$subscriptions_project$swg$$ = function($host$jscomp$8_loc$jscomp$11$$) {
  if ($host$jscomp$8_loc$jscomp$11$$.origin) {
    return $host$jscomp$8_loc$jscomp$11$$.origin;
  }
  var $protocol$jscomp$9$$ = $host$jscomp$8_loc$jscomp$11$$.protocol;
  $host$jscomp$8_loc$jscomp$11$$ = $host$jscomp$8_loc$jscomp$11$$.host;
  "https:" == $protocol$jscomp$9$$ && $host$jscomp$8_loc$jscomp$11$$.indexOf(":443") == $host$jscomp$8_loc$jscomp$11$$.length - 4 ? $host$jscomp$8_loc$jscomp$11$$ = $host$jscomp$8_loc$jscomp$11$$.replace(":443", "") : "http:" == $protocol$jscomp$9$$ && $host$jscomp$8_loc$jscomp$11$$.indexOf(":80") == $host$jscomp$8_loc$jscomp$11$$.length - 3 && ($host$jscomp$8_loc$jscomp$11$$ = $host$jscomp$8_loc$jscomp$11$$.replace(":80", ""));
  return $protocol$jscomp$9$$ + "//" + $host$jscomp$8_loc$jscomp$11$$;
}, $removeFragment$$module$third_party$subscriptions_project$swg$$ = function($urlString$jscomp$8$$) {
  var $index$jscomp$151$$ = $urlString$jscomp$8$$.indexOf("#");
  return -1 == $index$jscomp$151$$ ? $urlString$jscomp$8$$ : $urlString$jscomp$8$$.substring(0, $index$jscomp$151$$);
}, $parseQueryString$$module$third_party$subscriptions_project$swg$$ = function($query$jscomp$20$$) {
  return $query$jscomp$20$$ ? (/^[?#]/.test($query$jscomp$20$$) ? $query$jscomp$20$$.slice(1) : $query$jscomp$20$$).split("&").reduce(function($query$jscomp$20$$, $key$jscomp$154_param$jscomp$20$$) {
    var $params$jscomp$42$$ = $key$jscomp$154_param$jscomp$20$$.split("=");
    $key$jscomp$154_param$jscomp$20$$ = (0,window.decodeURIComponent)($params$jscomp$42$$[0] || "");
    $params$jscomp$42$$ = (0,window.decodeURIComponent)($params$jscomp$42$$[1] || "");
    $key$jscomp$154_param$jscomp$20$$ && ($query$jscomp$20$$[$key$jscomp$154_param$jscomp$20$$] = $params$jscomp$42$$);
    return $query$jscomp$20$$;
  }, {}) : {};
}, $serializeRequest$$module$third_party$subscriptions_project$swg$$ = function($request$jscomp$36$$) {
  var $map$jscomp$4$$ = {requestId:$request$jscomp$36$$.$requestId$, returnUrl:$request$jscomp$36$$.$returnUrl$, args:$request$jscomp$36$$.args};
  void 0 !== $request$jscomp$36$$.origin && ($map$jscomp$4$$.origin = $request$jscomp$36$$.origin);
  void 0 !== $request$jscomp$36$$.$originVerified$ && ($map$jscomp$4$$.originVerified = $request$jscomp$36$$.$originVerified$);
  return JSON.stringify($map$jscomp$4$$);
}, $createAbortError$$module$third_party$subscriptions_project$swg$$ = function($constr$jscomp$1_win$jscomp$445$$, $message$jscomp$76_opt_message$jscomp$18$$) {
  $message$jscomp$76_opt_message$jscomp$18$$ = "AbortError" + ($message$jscomp$76_opt_message$jscomp$18$$ ? ": " + $message$jscomp$76_opt_message$jscomp$18$$ : "");
  var $error$jscomp$86$$ = null;
  if ("function" == typeof $constr$jscomp$1_win$jscomp$445$$.DOMException) {
    $constr$jscomp$1_win$jscomp$445$$ = $constr$jscomp$1_win$jscomp$445$$.DOMException;
    try {
      $error$jscomp$86$$ = new $constr$jscomp$1_win$jscomp$445$$($message$jscomp$76_opt_message$jscomp$18$$, "AbortError");
    } catch ($e$319$$) {
    }
  }
  $error$jscomp$86$$ || ($error$jscomp$86$$ = Error($message$jscomp$76_opt_message$jscomp$18$$), $error$jscomp$86$$.name = "AbortError", $error$jscomp$86$$.code = 20);
  return $error$jscomp$86$$;
}, $resolveResult$$module$third_party$subscriptions_project$swg$$ = function($error$jscomp$87_win$jscomp$446$$, $result$jscomp$67$$, $resolver$jscomp$6$$) {
  $result$jscomp$67$$.$D$ ? $resolver$jscomp$6$$($result$jscomp$67$$) : ($error$jscomp$87_win$jscomp$446$$ = $result$jscomp$67$$.error || $createAbortError$$module$third_party$subscriptions_project$swg$$($error$jscomp$87_win$jscomp$446$$), $error$jscomp$87_win$jscomp$446$$.$activityResult$ = $result$jscomp$67$$, $resolver$jscomp$6$$(window.Promise.reject($error$jscomp$87_win$jscomp$446$$)));
}, $isIeBrowser$$module$third_party$subscriptions_project$swg$$ = function($nav$jscomp$1_win$jscomp$447$$) {
  $nav$jscomp$1_win$jscomp$447$$ = $nav$jscomp$1_win$jscomp$447$$.navigator;
  return /Trident|MSIE|IEMobile/i.test($nav$jscomp$1_win$jscomp$447$$ && $nav$jscomp$1_win$jscomp$447$$.userAgent);
}, $throwAsync$$module$third_party$subscriptions_project$swg$$ = function($e$jscomp$328$$) {
  (0,window.setTimeout)(function() {
    throw $e$jscomp$328$$;
  });
}, $isNodeConnected$$module$third_party$subscriptions_project$swg$$ = function($node$jscomp$104$$) {
  if ("isConnected" in $node$jscomp$104$$) {
    return $node$jscomp$104$$.isConnected;
  }
  var $root$jscomp$88$$ = $node$jscomp$104$$.ownerDocument && $node$jscomp$104$$.ownerDocument.documentElement;
  return $root$jscomp$88$$ && $root$jscomp$88$$.contains($node$jscomp$104$$) || !1;
}, $Messenger$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$449$$, $targetOrCallback$jscomp$1$$, $targetOrigin$jscomp$5$$) {
  this.$I$ = $win$jscomp$449$$;
  this.$J$ = $targetOrCallback$jscomp$1$$;
  this.$targetOrigin_$ = $targetOrigin$jscomp$5$$;
  this.$target_$ = null;
  this.$P$ = !1;
  this.$G$ = this.$K$ = this.$F$ = this.$D$ = null;
  this.$O$ = this.$R$.bind(this);
}, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$$ = function($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$self$$, $onCommand$jscomp$1$$) {
  if ($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$self$$.$F$) {
    throw Error("already connected");
  }
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$self$$.$F$ = $onCommand$jscomp$1$$;
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$self$$.$I$.addEventListener("message", $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$self$$.$O$);
}, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$$ = function($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$) {
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$F$ && !$JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$target_$ && ("function" == typeof $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$J$ ? $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$target_$ = 
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$J$() : $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$target_$ = $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$J$);
  return $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$self$$.$target_$;
}, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getTargetOrigin$$ = function($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getTargetOrigin$self$$) {
  if (null == $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getTargetOrigin$self$$.$targetOrigin_$) {
    throw Error("not connected");
  }
  return $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getTargetOrigin$self$$.$targetOrigin_$;
}, $JSCompiler_StaticMethods_sendStartCommand$$ = function($JSCompiler_StaticMethods_sendStartCommand$self$$, $args$jscomp$54$$) {
  var $channel$jscomp$2$$ = null;
  $JSCompiler_StaticMethods_sendStartCommand$self$$.$P$ && "function" == typeof $JSCompiler_StaticMethods_sendStartCommand$self$$.$I$.MessageChannel && ($channel$jscomp$2$$ = new $JSCompiler_StaticMethods_sendStartCommand$self$$.$I$.MessageChannel);
  $channel$jscomp$2$$ ? ($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$($JSCompiler_StaticMethods_sendStartCommand$self$$, "start", $args$jscomp$54$$, [$channel$jscomp$2$$.port2]), $JSCompiler_StaticMethods_switchToChannel_$$($JSCompiler_StaticMethods_sendStartCommand$self$$, $channel$jscomp$2$$.port1)) : $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$($JSCompiler_StaticMethods_sendStartCommand$self$$, 
  "start", $args$jscomp$54$$);
}, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$ = function($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$, $cmd$jscomp$6$$, $data$jscomp$181_opt_payload$jscomp$4$$, $opt_transfer$jscomp$6$$) {
  $data$jscomp$181_opt_payload$jscomp$4$$ = {sentinel:"__ACTIVITIES__", cmd:$cmd$jscomp$6$$, payload:$data$jscomp$181_opt_payload$jscomp$4$$ || null};
  if ($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$.$D$) {
    $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$.$D$.postMessage($data$jscomp$181_opt_payload$jscomp$4$$, $opt_transfer$jscomp$6$$ || void 0);
  } else {
    var $target$jscomp$inline_4645$$ = $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$$($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$);
    if (!$target$jscomp$inline_4645$$) {
      throw Error("not connected");
    }
    $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$ = "connect" == $cmd$jscomp$6$$ ? null != $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$.$targetOrigin_$ ? $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$.$targetOrigin_$ : "*" : $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getTargetOrigin$$($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$);
    $target$jscomp$inline_4645$$.postMessage($data$jscomp$181_opt_payload$jscomp$4$$, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$self_targetOrigin$jscomp$6$$, $opt_transfer$jscomp$6$$ || void 0);
  }
}, $JSCompiler_StaticMethods_getChannelObj_$$ = function($JSCompiler_StaticMethods_getChannelObj_$self$$, $name$jscomp$268$$) {
  $JSCompiler_StaticMethods_getChannelObj_$self$$.$G$ || ($JSCompiler_StaticMethods_getChannelObj_$self$$.$G$ = {});
  var $channelObj$jscomp$4_promise$jscomp$57$$ = $JSCompiler_StaticMethods_getChannelObj_$self$$.$G$[$name$jscomp$268$$];
  if (!$channelObj$jscomp$4_promise$jscomp$57$$) {
    var $resolver$jscomp$7$$;
    $channelObj$jscomp$4_promise$jscomp$57$$ = new window.Promise(function($JSCompiler_StaticMethods_getChannelObj_$self$$) {
      $resolver$jscomp$7$$ = $JSCompiler_StaticMethods_getChannelObj_$self$$;
    });
    $channelObj$jscomp$4_promise$jscomp$57$$ = {port1:null, port2:null, $resolver$:$resolver$jscomp$7$$, $promise$:$channelObj$jscomp$4_promise$jscomp$57$$};
    $JSCompiler_StaticMethods_getChannelObj_$self$$.$G$[$name$jscomp$268$$] = $channelObj$jscomp$4_promise$jscomp$57$$;
  }
  return $channelObj$jscomp$4_promise$jscomp$57$$;
}, $JSCompiler_StaticMethods_switchToChannel_$$ = function($JSCompiler_StaticMethods_switchToChannel_$self$$, $port$jscomp$5$$) {
  $JSCompiler_StaticMethods_switchToChannel_$self$$.$D$ && $closePort$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_switchToChannel_$self$$.$D$);
  $JSCompiler_StaticMethods_switchToChannel_$self$$.$D$ = $port$jscomp$5$$;
  $JSCompiler_StaticMethods_switchToChannel_$self$$.$D$.onmessage = function($port$jscomp$5$$) {
    var $event$jscomp$239$$ = $port$jscomp$5$$.data, $cmd$jscomp$7$$ = $event$jscomp$239$$ && $event$jscomp$239$$.cmd;
    $event$jscomp$239$$ = $event$jscomp$239$$ && $event$jscomp$239$$.payload || null;
    $cmd$jscomp$7$$ && $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$$($JSCompiler_StaticMethods_switchToChannel_$self$$, $cmd$jscomp$7$$, $event$jscomp$239$$, $port$jscomp$5$$);
  };
}, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$$ = function($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$, $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$, $name$jscomp$inline_4649_payload$jscomp$30$$, $channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$) {
  "connect" == $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$ ? ($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$D$ && ($closePort$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$D$), $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$D$ = 
  null), $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$P$ = $name$jscomp$inline_4649_payload$jscomp$30$$ && $name$jscomp$inline_4649_payload$jscomp$30$$.acceptsChannel || !1, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$F$($channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$, $name$jscomp$inline_4649_payload$jscomp$30$$)) : 
  "start" == $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$ ? (($channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$ = $channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$.ports && $channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$.ports[0]) && $JSCompiler_StaticMethods_switchToChannel_$$($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$, $channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$), 
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$F$($channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$, $name$jscomp$inline_4649_payload$jscomp$30$$)) : "msg" == $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$ ? null != $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$K$ && 
  null != $name$jscomp$inline_4649_payload$jscomp$30$$ && $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$K$($name$jscomp$inline_4649_payload$jscomp$30$$) : "cnget" == $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$ ? ($name$jscomp$inline_4649_payload$jscomp$30$$ = $name$jscomp$inline_4649_payload$jscomp$30$$.name || "", $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$ = 
  $JSCompiler_StaticMethods_getChannelObj_$$($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$, $name$jscomp$inline_4649_payload$jscomp$30$$), $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.port1 || ($channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$ = new $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$I$.MessageChannel, 
  $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.port1 = $channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$.port1, $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.port2 = $channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$.port2, $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.$resolver$($channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.port1)), $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.port2 && 
  ($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$, "cnset", {name:$name$jscomp$inline_4649_payload$jscomp$30$$}, [$channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.port2]), $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$.port2 = null)) : "cnset" == $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$ ? 
  ($channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$ = $channel$jscomp$inline_4651_event$jscomp$241_port$jscomp$6$$.ports[0], $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$ = $JSCompiler_StaticMethods_getChannelObj_$$($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$, $name$jscomp$inline_4649_payload$jscomp$30$$.name), 
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.port1 = $channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$resolver$($channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$)) : $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$self_channelObj$jscomp$inline_4656$$.$F$($channelObj$jscomp$inline_4650_cmd$jscomp$9_port$jscomp$inline_4655$$, 
  $name$jscomp$inline_4649_payload$jscomp$30$$);
}, $closePort$$module$third_party$subscriptions_project$swg$$ = function($port$jscomp$7$$) {
  try {
    $port$jscomp$7$$.close();
  } catch ($e$323$$) {
  }
}, $ActivityIframePort$$module$third_party$subscriptions_project$swg$$ = function($iframe$jscomp$84$$, $url$jscomp$213$$, $opt_args$jscomp$15$$) {
  var $$jscomp$this$jscomp$1135$$ = this;
  this.$iframe_$ = $iframe$jscomp$84$$;
  this.$url_$ = $url$jscomp$213$$;
  this.$R$ = $opt_args$jscomp$15$$ || null;
  this.$P$ = this.$iframe_$.ownerDocument.defaultView;
  this.$targetOrigin_$ = $getOrigin$$module$third_party$subscriptions_project$swg$$($parseUrl$$module$third_party$subscriptions_project$swg$$($url$jscomp$213$$));
  this.$J$ = !1;
  this.$O$ = null;
  this.$U$ = new window.Promise(function($iframe$jscomp$84$$) {
    $$jscomp$this$jscomp$1135$$.$O$ = $iframe$jscomp$84$$;
  });
  this.$F$ = null;
  this.$V$ = new window.Promise(function($iframe$jscomp$84$$) {
    $$jscomp$this$jscomp$1135$$.$F$ = $iframe$jscomp$84$$;
  });
  this.$G$ = null;
  this.$W$ = new window.Promise(function($iframe$jscomp$84$$) {
    $$jscomp$this$jscomp$1135$$.$G$ = $iframe$jscomp$84$$;
  });
  this.$I$ = this.$K$ = null;
  this.$D$ = new $Messenger$$module$third_party$subscriptions_project$swg$$(this.$P$, function() {
    return $$jscomp$this$jscomp$1135$$.$iframe_$.contentWindow;
  }, this.$targetOrigin_$);
}, $JSCompiler_StaticMethods_onResizeRequest$$ = function($JSCompiler_StaticMethods_onResizeRequest$self$$, $callback$jscomp$124$$) {
  $JSCompiler_StaticMethods_onResizeRequest$self$$.$K$ = $callback$jscomp$124$$;
  window.Promise.resolve().then(function() {
    null != $JSCompiler_StaticMethods_onResizeRequest$self$$.$I$ && $callback$jscomp$124$$($JSCompiler_StaticMethods_onResizeRequest$self$$.$I$);
  });
}, $ActivityWindowPort$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$450$$, $requestId$$, $url$jscomp$214$$, $target$jscomp$186$$, $opt_args$jscomp$16$$, $opt_options$jscomp$84$$) {
  var $$jscomp$this$jscomp$1137$$ = this;
  if (!$target$jscomp$186$$ || "_blank" != $target$jscomp$186$$ && "_top" != $target$jscomp$186$$ && "_" == $target$jscomp$186$$[0]) {
    throw Error('The only allowed targets are "_blank", "_top" and name targets');
  }
  this.$D$ = $win$jscomp$450$$;
  this.$R$ = $requestId$$;
  this.$url_$ = $url$jscomp$214$$;
  this.$V$ = $target$jscomp$186$$;
  this.$O$ = $opt_args$jscomp$16$$ || null;
  this.$J$ = $opt_options$jscomp$84$$ || {};
  this.$K$ = null;
  this.$P$ = new window.Promise(function($win$jscomp$450$$) {
    $$jscomp$this$jscomp$1137$$.$K$ = $win$jscomp$450$$;
  });
  this.$F$ = this.$I$ = this.$G$ = null;
}, $JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$$ = function($JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$) {
  var $featuresStr$$ = $JSCompiler_StaticMethods_buildFeatures_$$($JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$), $url$jscomp$215$$ = $JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$url_$;
  if (!$JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$J$.$skipRequestInUrl$) {
    var $openTarget_requestString$$ = $serializeRequest$$module$third_party$subscriptions_project$swg$$({$requestId$:$JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$R$, $returnUrl$:$JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$J$.$returnUrl$ || $removeFragment$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$D$.location.href), 
    args:$JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$O$});
    $url$jscomp$215$$ = $url$jscomp$215$$ + (-1 == $url$jscomp$215$$.indexOf("#") ? "#" : "&") + (0,window.encodeURIComponent)("__WA__") + "=" + (0,window.encodeURIComponent)($openTarget_requestString$$);
  }
  $openTarget_requestString$$ = $JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$V$;
  "_top" != $openTarget_requestString$$ && $isIeBrowser$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$D$) && ($openTarget_requestString$$ = "_top");
  try {
    var $targetWin$$ = $JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$D$.open($url$jscomp$215$$, $openTarget_requestString$$, $featuresStr$$);
  } catch ($e$325$$) {
  }
  if (!$targetWin$$ && "_top" != $openTarget_requestString$$ && !$JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$J$.$disableRedirectFallback$) {
    $openTarget_requestString$$ = "_top";
    try {
      $targetWin$$ = $JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$D$.open($url$jscomp$215$$, $openTarget_requestString$$);
    } catch ($e$326$$) {
    }
  }
  $targetWin$$ ? ($JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$G$ = $targetWin$$, "_top" != $openTarget_requestString$$ && $JSCompiler_StaticMethods_setupPopup_$$($JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$)) : $JSCompiler_StaticMethods_disconnectWithError_$$($JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$, 
  Error("failed to open window"));
  return $JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$self$$.$P$.catch(function() {
  });
}, $JSCompiler_StaticMethods_buildFeatures_$$ = function($JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$) {
  var $screen$jscomp$8_y$jscomp$83$$ = $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.screen, $availWidth_features$jscomp$3_maxWidth$jscomp$1$$ = $screen$jscomp$8_y$jscomp$83$$.availWidth || $screen$jscomp$8_y$jscomp$83$$.width, $availHeight_w$jscomp$19$$ = $screen$jscomp$8_y$jscomp$83$$.availHeight || $screen$jscomp$8_y$jscomp$83$$.height, $h$jscomp$62_isTop$$ = $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$ == $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.top;
  var $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ = $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.navigator;
  $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ = /Edge/i.test($JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ && $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$.userAgent);
  $availWidth_features$jscomp$3_maxWidth$jscomp$1$$ = Math.max($availWidth_features$jscomp$3_maxWidth$jscomp$1$$ - ($h$jscomp$62_isTop$$ && $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.outerWidth > $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.innerWidth ? Math.min(100, $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.outerWidth - $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.innerWidth) : $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ ? 
  100 : 0), 0.5 * $availWidth_features$jscomp$3_maxWidth$jscomp$1$$);
  var $maxHeight$jscomp$6$$ = Math.max($availHeight_w$jscomp$19$$ - ($h$jscomp$62_isTop$$ && $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.outerHeight > $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.innerHeight ? Math.min(100, $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.outerHeight - $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$D$.innerHeight) : $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ ? 
  100 : 0), 0.5 * $availHeight_w$jscomp$19$$);
  $availHeight_w$jscomp$19$$ = Math.floor(Math.min(600, 0.9 * $availWidth_features$jscomp$3_maxWidth$jscomp$1$$));
  $h$jscomp$62_isTop$$ = Math.floor(Math.min(600, 0.9 * $maxHeight$jscomp$6$$));
  $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$J$.width && ($availHeight_w$jscomp$19$$ = Math.min($JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$J$.width, $availWidth_features$jscomp$3_maxWidth$jscomp$1$$));
  $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$J$.height && ($h$jscomp$62_isTop$$ = Math.min($JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$.$J$.height, $maxHeight$jscomp$6$$));
  $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$ = Math.floor(($screen$jscomp$8_y$jscomp$83$$.width - $availHeight_w$jscomp$19$$) / 2);
  $screen$jscomp$8_y$jscomp$83$$ = Math.floor(($screen$jscomp$8_y$jscomp$83$$.height - $h$jscomp$62_isTop$$) / 2);
  $availWidth_features$jscomp$3_maxWidth$jscomp$1$$ = {height:$h$jscomp$62_isTop$$, width:$availHeight_w$jscomp$19$$, resizable:"yes", scrollbars:"yes"};
  $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ || ($availWidth_features$jscomp$3_maxWidth$jscomp$1$$.left = $JSCompiler_StaticMethods_buildFeatures_$self_x$jscomp$110$$, $availWidth_features$jscomp$3_maxWidth$jscomp$1$$.top = $screen$jscomp$8_y$jscomp$83$$);
  $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ = "";
  for (var $f$jscomp$83$$ in $availWidth_features$jscomp$3_maxWidth$jscomp$1$$) {
    $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ && ($JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ += ","), $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$ += $f$jscomp$83$$ + "=" + $availWidth_features$jscomp$3_maxWidth$jscomp$1$$[$f$jscomp$83$$];
  }
  return $JSCompiler_inline_result$jscomp$951_featuresStr$jscomp$1_nav$jscomp$inline_4665$$;
}, $JSCompiler_StaticMethods_setupPopup_$$ = function($JSCompiler_StaticMethods_setupPopup_$self$$) {
  $JSCompiler_StaticMethods_setupPopup_$self$$.$I$ = $JSCompiler_StaticMethods_setupPopup_$self$$.$D$.setInterval(function() {
    $JSCompiler_StaticMethods_check_$$($JSCompiler_StaticMethods_setupPopup_$self$$, !0);
  }, 500);
  $JSCompiler_StaticMethods_setupPopup_$self$$.$F$ = new $Messenger$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_setupPopup_$self$$.$D$, $JSCompiler_StaticMethods_setupPopup_$self$$.$G$, null);
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$$($JSCompiler_StaticMethods_setupPopup_$self$$.$F$, $JSCompiler_StaticMethods_setupPopup_$self$$.$U$.bind($JSCompiler_StaticMethods_setupPopup_$self$$));
}, $JSCompiler_StaticMethods_check_$$ = function($JSCompiler_StaticMethods_check_$self$$, $opt_delayCancel$$) {
  if (!$JSCompiler_StaticMethods_check_$self$$.$G$ || $JSCompiler_StaticMethods_check_$self$$.$G$.closed) {
    $JSCompiler_StaticMethods_check_$self$$.$I$ && ($JSCompiler_StaticMethods_check_$self$$.$D$.clearInterval($JSCompiler_StaticMethods_check_$self$$.$I$), $JSCompiler_StaticMethods_check_$self$$.$I$ = null), $JSCompiler_StaticMethods_check_$self$$.$D$.setTimeout(function() {
      try {
        $JSCompiler_StaticMethods_result_$$($JSCompiler_StaticMethods_check_$self$$, "canceled", null);
      } catch ($e$327$$) {
        $JSCompiler_StaticMethods_disconnectWithError_$$($JSCompiler_StaticMethods_check_$self$$, $e$327$$);
      }
    }, $opt_delayCancel$$ ? 3000 : 0);
  }
}, $JSCompiler_StaticMethods_disconnectWithError_$$ = function($JSCompiler_StaticMethods_disconnectWithError_$self$$, $reason$jscomp$41$$) {
  $JSCompiler_StaticMethods_disconnectWithError_$self$$.$K$ && $JSCompiler_StaticMethods_disconnectWithError_$self$$.$K$(window.Promise.reject($reason$jscomp$41$$));
  $JSCompiler_StaticMethods_disconnectWithError_$self$$.disconnect();
}, $JSCompiler_StaticMethods_result_$$ = function($JSCompiler_StaticMethods_result_$self$$, $code$jscomp$5_result$jscomp$69$$, $data$jscomp$185$$) {
  if ($JSCompiler_StaticMethods_result_$self$$.$K$) {
    var $isConnected$$ = $JSCompiler_StaticMethods_result_$self$$.$F$.isConnected();
    $code$jscomp$5_result$jscomp$69$$ = new $ActivityResult$$module$third_party$subscriptions_project$swg$$($code$jscomp$5_result$jscomp$69$$, $data$jscomp$185$$, "popup", $isConnected$$ ? $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getTargetOrigin$$($JSCompiler_StaticMethods_result_$self$$.$F$) : $getOrigin$$module$third_party$subscriptions_project$swg$$($parseUrl$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_result_$self$$.$url_$)), 
    $isConnected$$, $isConnected$$);
    $resolveResult$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_result_$self$$.$D$, $code$jscomp$5_result$jscomp$69$$, $JSCompiler_StaticMethods_result_$self$$.$K$);
    $JSCompiler_StaticMethods_result_$self$$.$K$ = null;
  }
  $JSCompiler_StaticMethods_result_$self$$.$F$ && $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$($JSCompiler_StaticMethods_result_$self$$.$F$, "close");
  $JSCompiler_StaticMethods_result_$self$$.disconnect();
}, $ActivityWindowRedirectPort$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$452$$, $code$jscomp$8$$, $data$jscomp$188$$, $targetOrigin$jscomp$7$$, $targetOriginVerified$$) {
  this.$D$ = $win$jscomp$452$$;
  this.$F$ = $code$jscomp$8$$;
  this.$data_$ = $data$jscomp$188$$;
  this.$targetOrigin_$ = $targetOrigin$jscomp$7$$;
  this.$G$ = $targetOriginVerified$$;
}, $ActivityPorts$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$453$$) {
  var $$jscomp$this$jscomp$1142$$ = this;
  this.version = "1.20";
  this.$I$ = $win$jscomp$453$$;
  this.$G$ = $win$jscomp$453$$.location.hash;
  this.$F$ = {};
  this.$D$ = {};
  this.$J$ = null;
  this.$K$ = new window.Promise(function($win$jscomp$453$$) {
    $$jscomp$this$jscomp$1142$$.$J$ = $win$jscomp$453$$;
  });
}, $JSCompiler_StaticMethods_openIframe$$ = function($iframe$jscomp$85$$, $url$jscomp$216$$, $opt_args$jscomp$17$$) {
  var $port$jscomp$8$$ = new $ActivityIframePort$$module$third_party$subscriptions_project$swg$$($iframe$jscomp$85$$, $url$jscomp$216$$, $opt_args$jscomp$17$$);
  if (!$isNodeConnected$$module$third_party$subscriptions_project$swg$$($port$jscomp$8$$.$iframe_$)) {
    throw Error("iframe must be in DOM");
  }
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$connect$$($port$jscomp$8$$.$D$, $port$jscomp$8$$.$ActivityIframePort$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$.bind($port$jscomp$8$$));
  $port$jscomp$8$$.$iframe_$.src = $port$jscomp$8$$.$url_$;
  return $port$jscomp$8$$.$U$.then(function() {
    return $port$jscomp$8$$;
  });
}, $JSCompiler_StaticMethods_onRedirectError$$ = function($JSCompiler_StaticMethods_onRedirectError$self$$, $handler$jscomp$59$$) {
  $JSCompiler_StaticMethods_onRedirectError$self$$.$K$.then($handler$jscomp$59$$);
}, $JSCompiler_StaticMethods_consumeResult_$$ = function($port$jscomp$11$$, $callback$jscomp$126$$) {
  window.Promise.resolve().then(function() {
    $callback$jscomp$126$$($port$jscomp$11$$);
  });
}, $JSCompiler_StaticMethods_consumeResultAll_$$ = function($JSCompiler_StaticMethods_consumeResultAll_$self$$, $requestId$jscomp$5$$, $port$jscomp$12$$) {
  var $handlers$jscomp$2$$ = $JSCompiler_StaticMethods_consumeResultAll_$self$$.$F$[$requestId$jscomp$5$$];
  $handlers$jscomp$2$$ && $handlers$jscomp$2$$.forEach(function($JSCompiler_StaticMethods_consumeResultAll_$self$$) {
    $JSCompiler_StaticMethods_consumeResult_$$($port$jscomp$12$$, $JSCompiler_StaticMethods_consumeResultAll_$self$$);
  });
  $JSCompiler_StaticMethods_consumeResultAll_$self$$.$D$[$requestId$jscomp$5$$] = $port$jscomp$12$$;
}, $activityPorts$$module$third_party$subscriptions_project$swg$isAbortError$$ = function($error$jscomp$85$$) {
  return $error$jscomp$85$$ && "object" == typeof $error$jscomp$85$$ ? "AbortError" === $error$jscomp$85$$.name : !1;
}, $AnalyticsContext$$module$third_party$subscriptions_project$swg$$ = function($data$jscomp$189$$) {
  $data$jscomp$189$$ = void 0 === $data$jscomp$189$$ ? [] : $data$jscomp$189$$;
  this.$P$ = null == $data$jscomp$189$$[1] ? null : $data$jscomp$189$$[1];
  this.$F$ = null == $data$jscomp$189$$[2] ? null : $data$jscomp$189$$[2];
  this.$I$ = null == $data$jscomp$189$$[3] ? null : $data$jscomp$189$$[3];
  this.$O$ = null == $data$jscomp$189$$[4] ? null : $data$jscomp$189$$[4];
  this.$J$ = null == $data$jscomp$189$$[5] ? null : $data$jscomp$189$$[5];
  this.$K$ = null == $data$jscomp$189$$[6] ? null : $data$jscomp$189$$[6];
  this.$D$ = null == $data$jscomp$189$$[7] ? null : $data$jscomp$189$$[7];
  this.$G$ = null == $data$jscomp$189$$[8] ? null : $data$jscomp$189$$[8];
  this.$label_$ = $data$jscomp$189$$[9] || [];
}, $AnalyticsRequest$$module$third_party$subscriptions_project$swg$$ = function() {
  var $data$jscomp$190$$ = void 0 === $data$jscomp$190$$ ? [] : $data$jscomp$190$$;
  this.$context_$ = null == $data$jscomp$190$$[1] || void 0 == $data$jscomp$190$$[1] ? null : new $AnalyticsContext$$module$third_party$subscriptions_project$swg$$($data$jscomp$190$$[1]);
  this.$D$ = null == $data$jscomp$190$$[2] ? null : $data$jscomp$190$$[2];
}, $JSCompiler_StaticMethods_AnalyticsRequest$$module$third_party$subscriptions_project$swg_prototype$toArray$$ = function($JSCompiler_StaticMethods_AnalyticsRequest$$module$third_party$subscriptions_project$swg_prototype$toArray$self$$) {
  if ($JSCompiler_StaticMethods_AnalyticsRequest$$module$third_party$subscriptions_project$swg_prototype$toArray$self$$.$context_$) {
    var $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$ = $JSCompiler_StaticMethods_AnalyticsRequest$$module$third_party$subscriptions_project$swg_prototype$toArray$self$$.$context_$;
    $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$ = ["AnalyticsContext", $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$P$, $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$F$, 
    $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$I$, $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$O$, $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$J$, $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$K$, 
    $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$D$, $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$G$, $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$.$label_$];
  } else {
    $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$ = [];
  }
  return ["AnalyticsRequest", $JSCompiler_StaticMethods_AnalyticsContext$$module$third_party$subscriptions_project$swg_prototype$toArray$self$jscomp$inline_4674_JSCompiler_temp$jscomp$960$$, $JSCompiler_StaticMethods_AnalyticsRequest$$module$third_party$subscriptions_project$swg_prototype$toArray$self$$.$D$];
}, $assert$$module$third_party$subscriptions_project$swg$$ = function($shouldBeTrueish$jscomp$5$$, $opt_message$jscomp$19$$, $var_args$jscomp$86$$) {
  var $firstElement$jscomp$1$$;
  if (!$shouldBeTrueish$jscomp$5$$) {
    var $e$331_splitMessage$jscomp$1$$ = ($opt_message$jscomp$19$$ || "Assertion failed").split("%s"), $first$jscomp$12_i$330$$ = $e$331_splitMessage$jscomp$1$$.shift(), $formatted$jscomp$1$$ = $first$jscomp$12_i$330$$, $messageArray$jscomp$1$$ = [];
    "" != $first$jscomp$12_i$330$$ && $messageArray$jscomp$1$$.push($first$jscomp$12_i$330$$);
    for ($first$jscomp$12_i$330$$ = 2; $first$jscomp$12_i$330$$ < arguments.length; $first$jscomp$12_i$330$$++) {
      var $val$jscomp$26$$ = arguments[$first$jscomp$12_i$330$$];
      $val$jscomp$26$$ && $val$jscomp$26$$.tagName && ($firstElement$jscomp$1$$ = $val$jscomp$26$$);
      var $nextConstant$jscomp$1$$ = $e$331_splitMessage$jscomp$1$$.shift();
      $messageArray$jscomp$1$$.push($val$jscomp$26$$);
      var $val$jscomp$inline_4680$$ = $nextConstant$jscomp$1$$.trim();
      "" != $val$jscomp$inline_4680$$ && $messageArray$jscomp$1$$.push($val$jscomp$inline_4680$$);
      $formatted$jscomp$1$$ += ($val$jscomp$26$$ && 1 == $val$jscomp$26$$.nodeType ? $val$jscomp$26$$.tagName.toLowerCase() + ($val$jscomp$26$$.id ? "#" + $val$jscomp$26$$.id : "") : $val$jscomp$26$$) + $nextConstant$jscomp$1$$;
    }
    $e$331_splitMessage$jscomp$1$$ = Error($formatted$jscomp$1$$);
    $e$331_splitMessage$jscomp$1$$.$fromAssert$ = !0;
    $e$331_splitMessage$jscomp$1$$.$associatedElement$ = $firstElement$jscomp$1$$;
    $e$331_splitMessage$jscomp$1$$.$messageArray$ = $messageArray$jscomp$1$$;
    throw $e$331_splitMessage$jscomp$1$$;
  }
  return $shouldBeTrueish$jscomp$5$$;
}, $getVendorJsPropertyName$$module$third_party$subscriptions_project$swg$$ = function($style$jscomp$28$$, $camelCase$jscomp$3$$, $opt_bypassCache$jscomp$3$$) {
  if (2 > $camelCase$jscomp$3$$.length ? 0 : 0 == $camelCase$jscomp$3$$.lastIndexOf("--", 0)) {
    return $camelCase$jscomp$3$$;
  }
  $propertyNameCache$$module$third_party$subscriptions_project$swg$$ || ($propertyNameCache$$module$third_party$subscriptions_project$swg$$ = Object.create(null));
  var $propertyName$jscomp$19$$ = $propertyNameCache$$module$third_party$subscriptions_project$swg$$[$camelCase$jscomp$3$$];
  if (!$propertyName$jscomp$19$$ || $opt_bypassCache$jscomp$3$$) {
    $propertyName$jscomp$19$$ = $camelCase$jscomp$3$$;
    if (void 0 === $style$jscomp$28$$[$camelCase$jscomp$3$$]) {
      var $JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$;
      a: {
        for ($JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$ = 0; $JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$ < $vendorPrefixes$$module$third_party$subscriptions_project$swg$$.length; $JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$++) {
          var $propertyName$jscomp$inline_4691$$ = $vendorPrefixes$$module$third_party$subscriptions_project$swg$$[$JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$] + ($camelCase$jscomp$3$$.charAt(0).toUpperCase() + $camelCase$jscomp$3$$.slice(1));
          if (void 0 !== $style$jscomp$28$$[$propertyName$jscomp$inline_4691$$]) {
            $JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$ = $propertyName$jscomp$inline_4691$$;
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$ = "";
      }
      void 0 !== $style$jscomp$28$$[$JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$] && ($propertyName$jscomp$19$$ = $JSCompiler_inline_result$jscomp$963_i$332$jscomp$inline_4690_prefixedPropertyName$jscomp$1$$);
    }
    $opt_bypassCache$jscomp$3$$ || ($propertyNameCache$$module$third_party$subscriptions_project$swg$$[$camelCase$jscomp$3$$] = $propertyName$jscomp$19$$);
  }
  return $propertyName$jscomp$19$$;
}, $setImportantStyles$$module$third_party$subscriptions_project$swg$$ = function($element$jscomp$628$$, $styles$jscomp$10$$) {
  for (var $k$jscomp$76$$ in $styles$jscomp$10$$) {
    $element$jscomp$628$$.style.setProperty($getVendorJsPropertyName$$module$third_party$subscriptions_project$swg$$($styles$jscomp$10$$, $k$jscomp$76$$), $styles$jscomp$10$$[$k$jscomp$76$$].toString(), "important");
  }
}, $setStyles$$module$third_party$subscriptions_project$swg$$ = function($element$jscomp$630$$, $styles$jscomp$11$$) {
  for (var $k$jscomp$77$$ in $styles$jscomp$11$$) {
    var $element$jscomp$inline_4693$$ = $element$jscomp$630$$, $value$jscomp$inline_4695$$ = $styles$jscomp$11$$[$k$jscomp$77$$], $propertyName$jscomp$inline_4698$$ = $getVendorJsPropertyName$$module$third_party$subscriptions_project$swg$$($element$jscomp$inline_4693$$.style, $k$jscomp$77$$, void 0);
    $propertyName$jscomp$inline_4698$$ && ($element$jscomp$inline_4693$$.style[$propertyName$jscomp$inline_4698$$] = $value$jscomp$inline_4695$$);
  }
}, $resetStyles$$module$third_party$subscriptions_project$swg$$ = function($element$jscomp$631$$) {
  var $styleObj$$ = {};
  ["height"].forEach(function($element$jscomp$631$$) {
    $styleObj$$[$element$jscomp$631$$] = null;
  });
  $setStyles$$module$third_party$subscriptions_project$swg$$($element$jscomp$631$$, $styleObj$$);
}, $createElement$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$143_element$jscomp$634$$, $tagName$jscomp$53$$, $attributes$jscomp$29$$) {
  $doc$jscomp$143_element$jscomp$634$$ = $doc$jscomp$143_element$jscomp$634$$.createElement($tagName$jscomp$53$$);
  for (var $attr$jscomp$inline_4702$$ in $attributes$jscomp$29$$) {
    "style" == $attr$jscomp$inline_4702$$ ? $setStyles$$module$third_party$subscriptions_project$swg$$($doc$jscomp$143_element$jscomp$634$$, $attributes$jscomp$29$$[$attr$jscomp$inline_4702$$]) : $doc$jscomp$143_element$jscomp$634$$.setAttribute($attr$jscomp$inline_4702$$, $attributes$jscomp$29$$[$attr$jscomp$inline_4702$$]);
  }
  return $doc$jscomp$143_element$jscomp$634$$;
}, $injectStyleSheet$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$144$$, $styleText$$) {
  var $styleElement$$ = $createElement$$module$third_party$subscriptions_project$swg$$($doc$jscomp$144$$.$getWin$().document, "style", {type:"text/css"});
  $styleElement$$.textContent = $styleText$$;
  $doc$jscomp$144$$.$getHead$().appendChild($styleElement$$);
}, $isEdgeBrowser$1$$module$third_party$subscriptions_project$swg$$ = function($nav$jscomp$3_win$jscomp$454$$) {
  $nav$jscomp$3_win$jscomp$454$$ = $nav$jscomp$3_win$jscomp$454$$.navigator;
  return /Edge/i.test($nav$jscomp$3_win$jscomp$454$$ && $nav$jscomp$3_win$jscomp$454$$.userAgent);
}, $msg$$module$third_party$subscriptions_project$swg$$ = function($lang_langOrElement_search$jscomp$7$$) {
  var $map$jscomp$5$$ = $TITLE_LANG_MAP$$module$third_party$subscriptions_project$swg$$;
  $lang_langOrElement_search$jscomp$7$$ = $lang_langOrElement_search$jscomp$7$$ ? "string" == typeof $lang_langOrElement_search$jscomp$7$$ ? $lang_langOrElement_search$jscomp$7$$ : $lang_langOrElement_search$jscomp$7$$.lang || $lang_langOrElement_search$jscomp$7$$.ownerDocument && $lang_langOrElement_search$jscomp$7$$.ownerDocument.documentElement.lang : "";
  for ($lang_langOrElement_search$jscomp$7$$ = ($lang_langOrElement_search$jscomp$7$$ && $lang_langOrElement_search$jscomp$7$$.toLowerCase() || "en").replace(/_/g, "-"); $lang_langOrElement_search$jscomp$7$$;) {
    if ($lang_langOrElement_search$jscomp$7$$ in $map$jscomp$5$$) {
      return $map$jscomp$5$$[$lang_langOrElement_search$jscomp$7$$];
    }
    var $dash$jscomp$1$$ = $lang_langOrElement_search$jscomp$7$$.lastIndexOf("-");
    $lang_langOrElement_search$jscomp$7$$ = -1 != $dash$jscomp$1$$ ? $lang_langOrElement_search$jscomp$7$$.substring(0, $dash$jscomp$1$$) : "";
  }
  return $map$jscomp$5$$.en;
}, $ButtonApi$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$145$$) {
  this.$doc_$ = $doc$jscomp$145$$;
}, $Callbacks$$module$third_party$subscriptions_project$swg$$ = function() {
  this.$callbacks_$ = {};
  this.$D$ = {};
}, $JSCompiler_StaticMethods_triggerEntitlementsResponse$$ = function($JSCompiler_StaticMethods_triggerEntitlementsResponse$self$$, $promise$jscomp$58$$) {
  $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($JSCompiler_StaticMethods_triggerEntitlementsResponse$self$$, 1, $promise$jscomp$58$$.then(function($JSCompiler_StaticMethods_triggerEntitlementsResponse$self$$) {
    return $JSCompiler_StaticMethods_triggerEntitlementsResponse$self$$.clone();
  }));
}, $JSCompiler_StaticMethods_triggerSubscribeResponse$$ = function($JSCompiler_StaticMethods_triggerSubscribeResponse$self$$, $responsePromise$jscomp$5$$) {
  $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($JSCompiler_StaticMethods_triggerSubscribeResponse$self$$, 3, $responsePromise$jscomp$5$$.then(function($JSCompiler_StaticMethods_triggerSubscribeResponse$self$$) {
    return $JSCompiler_StaticMethods_triggerSubscribeResponse$self$$.clone();
  }));
}, $JSCompiler_StaticMethods_triggerFlowStarted$$ = function($JSCompiler_StaticMethods_triggerFlowStarted$self$$, $flow$$, $opt_data$jscomp$9$$) {
  $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($JSCompiler_StaticMethods_triggerFlowStarted$self$$, 7, {$flow$:$flow$$, data:$opt_data$jscomp$9$$ || {}});
}, $JSCompiler_StaticMethods_triggerFlowCanceled$$ = function($JSCompiler_StaticMethods_triggerFlowCanceled$self$$, $flow$jscomp$1$$) {
  $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($JSCompiler_StaticMethods_triggerFlowCanceled$self$$, 8, {$flow$:$flow$jscomp$1$$, data:{}});
}, $JSCompiler_StaticMethods_setCallback_$$ = function($JSCompiler_StaticMethods_setCallback_$self$$, $id$jscomp$103$$, $callback$jscomp$136$$) {
  $JSCompiler_StaticMethods_setCallback_$self$$.$callbacks_$[$id$jscomp$103$$] = $callback$jscomp$136$$;
  $id$jscomp$103$$ in $JSCompiler_StaticMethods_setCallback_$self$$.$D$ && $JSCompiler_StaticMethods_executeCallback_$$($JSCompiler_StaticMethods_setCallback_$self$$, $id$jscomp$103$$, $callback$jscomp$136$$, $JSCompiler_StaticMethods_setCallback_$self$$.$D$[$id$jscomp$103$$]);
}, $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$ = function($JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$self$$, $id$jscomp$104$$, $data$jscomp$191$$) {
  $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$self$$.$D$[$id$jscomp$104$$] = $data$jscomp$191$$;
  var $callback$jscomp$137$$ = $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$self$$.$callbacks_$[$id$jscomp$104$$];
  $callback$jscomp$137$$ && $JSCompiler_StaticMethods_executeCallback_$$($JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$self$$, $id$jscomp$104$$, $callback$jscomp$137$$, $data$jscomp$191$$);
}, $JSCompiler_StaticMethods_executeCallback_$$ = function($JSCompiler_StaticMethods_executeCallback_$self$$, $id$jscomp$106$$, $callback$jscomp$138$$, $data$jscomp$192$$) {
  window.Promise.resolve().then(function() {
    $callback$jscomp$138$$($data$jscomp$192$$);
    $id$jscomp$106$$ in $JSCompiler_StaticMethods_executeCallback_$self$$.$D$ && delete $JSCompiler_StaticMethods_executeCallback_$self$$.$D$[$id$jscomp$106$$];
  });
}, $View$$module$third_party$subscriptions_project$swg$$ = function() {
}, $ErrorUtils$$module$third_party$subscriptions_project$swg$throwAsync$$ = function($error$jscomp$89$$) {
  (0,window.setTimeout)(function() {
    throw $error$jscomp$89$$;
  });
}, $ActivityIframeView$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$456$$, $activityPorts$$, $src$jscomp$66$$, $args$jscomp$55$$, $shouldFadeBody$$, $hasLoadingIndicator$$) {
  $shouldFadeBody$$ = void 0 === $shouldFadeBody$$ ? !1 : $shouldFadeBody$$;
  $hasLoadingIndicator$$ = void 0 === $hasLoadingIndicator$$ ? !1 : $hasLoadingIndicator$$;
  var $$jscomp$this$jscomp$1146$$ = this;
  this.$I$ = $win$jscomp$456$$;
  this.$doc_$ = this.$I$.document;
  this.$iframe_$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$, "iframe", $iframeAttributes$$module$third_party$subscriptions_project$swg$$);
  this.$src_$ = $src$jscomp$66$$;
  this.$G$ = $args$jscomp$55$$ || {};
  this.$shouldFadeBody_$ = $shouldFadeBody$$;
  this.$hasLoadingIndicator_$ = $hasLoadingIndicator$$;
  this.$F$ = this.$D$ = null;
  this.$J$ = new window.Promise(function($win$jscomp$456$$) {
    $$jscomp$this$jscomp$1146$$.$F$ = $win$jscomp$456$$;
  });
}, $JSCompiler_StaticMethods_onOpenIframeResponse_$$ = function($JSCompiler_StaticMethods_onOpenIframeResponse_$self$$, $port$jscomp$14$$, $dialog$jscomp$1$$) {
  $JSCompiler_StaticMethods_onOpenIframeResponse_$self$$.$D$ = $port$jscomp$14$$;
  $JSCompiler_StaticMethods_onOpenIframeResponse_$self$$.$F$($port$jscomp$14$$);
  $JSCompiler_StaticMethods_onResizeRequest$$($JSCompiler_StaticMethods_onOpenIframeResponse_$self$$.$D$, function($port$jscomp$14$$) {
    $JSCompiler_StaticMethods_resizeView$$($dialog$jscomp$1$$, $JSCompiler_StaticMethods_onOpenIframeResponse_$self$$, $port$jscomp$14$$);
  });
  return $JSCompiler_StaticMethods_onOpenIframeResponse_$self$$.$D$.$whenReady$();
}, $JSCompiler_StaticMethods_onCancel$$ = function($JSCompiler_StaticMethods_onCancel$self$$, $callback$jscomp$140$$) {
  $JSCompiler_StaticMethods_onCancel$self$$.$acceptResult$().catch(function($JSCompiler_StaticMethods_onCancel$self$$) {
    $activityPorts$$module$third_party$subscriptions_project$swg$isAbortError$$($JSCompiler_StaticMethods_onCancel$self$$) && $callback$jscomp$140$$();
    throw $JSCompiler_StaticMethods_onCancel$self$$;
  });
}, $Entitlements$$module$third_party$subscriptions_project$swg$$ = function($service$jscomp$32$$, $raw$jscomp$5$$, $entitlements$$, $currentProduct$$, $ackHandler$$, $isReadyToPay$$) {
  this.$service$ = $service$jscomp$32$$;
  this.raw = $raw$jscomp$5$$;
  this.$D$ = $entitlements$$;
  this.$isReadyToPay$ = $isReadyToPay$$ || !1;
  this.$product_$ = $currentProduct$$;
  this.$ackHandler_$ = $ackHandler$$;
}, $JSCompiler_StaticMethods_enablesThis$$ = function($JSCompiler_StaticMethods_enablesThis$self$$) {
  var $product$jscomp$inline_4705$$ = $JSCompiler_StaticMethods_enablesThis$self$$.$product_$;
  return $product$jscomp$inline_4705$$ ? !!$JSCompiler_StaticMethods_getEntitlementFor$$($JSCompiler_StaticMethods_enablesThis$self$$, $product$jscomp$inline_4705$$) : !1;
}, $JSCompiler_StaticMethods_getEntitlementFor$$ = function($JSCompiler_StaticMethods_getEntitlementFor$self$$, $product$jscomp$1$$) {
  if ($product$jscomp$1$$ && 0 < $JSCompiler_StaticMethods_getEntitlementFor$self$$.$D$.length) {
    for (var $i$335$$ = 0; $i$335$$ < $JSCompiler_StaticMethods_getEntitlementFor$self$$.$D$.length; $i$335$$++) {
      var $JSCompiler_StaticMethods_Entitlement$$module$third_party$subscriptions_project$swg_prototype$enables$self$jscomp$inline_4708_JSCompiler_inline_result$jscomp$970$$ = $JSCompiler_StaticMethods_getEntitlementFor$self$$.$D$[$i$335$$];
      var $product$jscomp$inline_4709$$ = $product$jscomp$1$$;
      if ($product$jscomp$inline_4709$$) {
        var $eq$jscomp$inline_4710$$ = $product$jscomp$inline_4709$$.indexOf(":");
        $JSCompiler_StaticMethods_Entitlement$$module$third_party$subscriptions_project$swg_prototype$enables$self$jscomp$inline_4708_JSCompiler_inline_result$jscomp$970$$ = -1 != $eq$jscomp$inline_4710$$ && $JSCompiler_StaticMethods_Entitlement$$module$third_party$subscriptions_project$swg_prototype$enables$self$jscomp$inline_4708_JSCompiler_inline_result$jscomp$970$$.$D$.includes($product$jscomp$inline_4709$$.substring(0, $eq$jscomp$inline_4710$$ + 1) + "*") ? !0 : $JSCompiler_StaticMethods_Entitlement$$module$third_party$subscriptions_project$swg_prototype$enables$self$jscomp$inline_4708_JSCompiler_inline_result$jscomp$970$$.$D$.includes($product$jscomp$inline_4709$$);
      } else {
        $JSCompiler_StaticMethods_Entitlement$$module$third_party$subscriptions_project$swg_prototype$enables$self$jscomp$inline_4708_JSCompiler_inline_result$jscomp$970$$ = !1;
      }
      if ($JSCompiler_StaticMethods_Entitlement$$module$third_party$subscriptions_project$swg_prototype$enables$self$jscomp$inline_4708_JSCompiler_inline_result$jscomp$970$$) {
        return $JSCompiler_StaticMethods_getEntitlementFor$self$$.$D$[$i$335$$];
      }
    }
  }
  return null;
}, $Entitlement$$module$third_party$subscriptions_project$swg$$ = function($source$jscomp$49$$, $products$$, $subscriptionToken$$) {
  this.source = $source$jscomp$49$$;
  this.$D$ = $products$$;
  this.$subscriptionToken$ = $subscriptionToken$$;
}, $Entitlement$$module$third_party$subscriptions_project$swg$parseListFromJson$$ = function($json$jscomp$23$$) {
  return (Array.isArray($json$jscomp$23$$) ? $json$jscomp$23$$ : [$json$jscomp$23$$]).map(function($json$jscomp$23$$) {
    $json$jscomp$23$$ || ($json$jscomp$23$$ = {});
    return new $Entitlement$$module$third_party$subscriptions_project$swg$$($json$jscomp$23$$.source || "", $json$jscomp$23$$.products || [], $json$jscomp$23$$.subscriptionToken);
  });
}, $UserData$$module$third_party$subscriptions_project$swg$$ = function($idToken$$, $data$jscomp$194$$) {
  this.$F$ = $idToken$$;
  this.data = $data$jscomp$194$$;
  this.id = $data$jscomp$194$$.sub;
  this.$D$ = $data$jscomp$194$$.email;
  this.$G$ = $data$jscomp$194$$.email_verified;
  this.name = $data$jscomp$194$$.name;
  this.$J$ = $data$jscomp$194$$.given_name;
  this.$I$ = $data$jscomp$194$$.family_name;
  this.$K$ = $data$jscomp$194$$.picture;
}, $SubscribeResponse$$module$third_party$subscriptions_project$swg$$ = function($raw$jscomp$6$$, $purchaseData$$, $userData$$, $entitlements$jscomp$1$$, $completeHandler$$) {
  this.raw = $raw$jscomp$6$$;
  this.$G$ = $purchaseData$$;
  this.$F$ = $userData$$;
  this.$D$ = $entitlements$jscomp$1$$;
  this.$I$ = $completeHandler$$;
}, $PurchaseData$$module$third_party$subscriptions_project$swg$$ = function($raw$jscomp$7$$, $signature$jscomp$3$$) {
  this.raw = $raw$jscomp$7$$;
  this.$D$ = $signature$jscomp$3$$;
}, $stringToBytes$$module$third_party$subscriptions_project$swg$$ = function($str$jscomp$34$$) {
  for (var $bytes$jscomp$14$$ = new window.Uint8Array($str$jscomp$34$$.length), $i$337$$ = 0; $i$337$$ < $str$jscomp$34$$.length; $i$337$$++) {
    var $charCode$jscomp$2$$ = $str$jscomp$34$$.charCodeAt($i$337$$);
    $assert$$module$third_party$subscriptions_project$swg$$(255 >= $charCode$jscomp$2$$, "Characters must be in range [0,255]");
    $bytes$jscomp$14$$[$i$337$$] = $charCode$jscomp$2$$;
  }
  return $bytes$jscomp$14$$;
}, $bytesToString$$module$third_party$subscriptions_project$swg$$ = function($bytes$jscomp$15$$) {
  for (var $array$jscomp$23$$ = Array($bytes$jscomp$15$$.length), $i$338$$ = 0; $i$338$$ < $bytes$jscomp$15$$.length; $i$338$$++) {
    $array$jscomp$23$$[$i$338$$] = String.fromCharCode($bytes$jscomp$15$$[$i$338$$]);
  }
  return $array$jscomp$23$$.join("");
}, $utf8DecodeSync$$module$third_party$subscriptions_project$swg$$ = function($asciiString$jscomp$1_bytes$jscomp$16$$) {
  if ("undefined" !== typeof window.TextDecoder) {
    return (new window.TextDecoder("utf-8")).decode($asciiString$jscomp$1_bytes$jscomp$16$$);
  }
  $asciiString$jscomp$1_bytes$jscomp$16$$ = $bytesToString$$module$third_party$subscriptions_project$swg$$(new window.Uint8Array($asciiString$jscomp$1_bytes$jscomp$16$$.buffer || $asciiString$jscomp$1_bytes$jscomp$16$$));
  return (0,window.decodeURIComponent)((0,window.escape)($asciiString$jscomp$1_bytes$jscomp$16$$));
}, $utf8EncodeSync$$module$third_party$subscriptions_project$swg$$ = function($string$jscomp$20$$) {
  return "undefined" !== typeof window.TextEncoder ? (new window.TextEncoder("utf-8")).encode($string$jscomp$20$$) : $stringToBytes$$module$third_party$subscriptions_project$swg$$((0,window.unescape)((0,window.encodeURIComponent)($string$jscomp$20$$)));
}, $base64UrlDecodeToBytes$$module$third_party$subscriptions_project$swg$$ = function($encoded$jscomp$3_str$jscomp$35$$) {
  $encoded$jscomp$3_str$jscomp$35$$ = (0,window.atob)($encoded$jscomp$3_str$jscomp$35$$.replace(/[-_.]/g, function($encoded$jscomp$3_str$jscomp$35$$) {
    return $base64UrlDecodeSubs$$module$third_party$subscriptions_project$swg$$[$encoded$jscomp$3_str$jscomp$35$$];
  }));
  return $stringToBytes$$module$third_party$subscriptions_project$swg$$($encoded$jscomp$3_str$jscomp$35$$);
}, $parseJson$$module$third_party$subscriptions_project$swg$$ = function($json$jscomp$25$$) {
  return JSON.parse($json$jscomp$25$$);
}, $tryParseJson$$module$third_party$subscriptions_project$swg$$ = function($json$jscomp$26$$, $opt_onFailed$jscomp$2$$) {
  try {
    return $parseJson$$module$third_party$subscriptions_project$swg$$($json$jscomp$26$$);
  } catch ($e$339$$) {
    $opt_onFailed$jscomp$2$$ && $opt_onFailed$jscomp$2$$($e$339$$);
  }
}, $JSCompiler_StaticMethods_JwtHelper$$module$third_party$subscriptions_project$swg_prototype$decodeInternal_$$ = function($encodedToken$jscomp$4$$) {
  function $invalidToken$jscomp$1$$() {
    throw Error('Invalid token: "' + $encodedToken$jscomp$4$$ + '"');
  }
  var $parts$jscomp$21$$ = $encodedToken$jscomp$4$$.split(".");
  3 != $parts$jscomp$21$$.length && $invalidToken$jscomp$1$$();
  var $headerUtf8Bytes$jscomp$1$$ = $base64UrlDecodeToBytes$$module$third_party$subscriptions_project$swg$$($parts$jscomp$21$$[0]), $payloadUtf8Bytes$jscomp$1$$ = $base64UrlDecodeToBytes$$module$third_party$subscriptions_project$swg$$($parts$jscomp$21$$[1]);
  return {header:$tryParseJson$$module$third_party$subscriptions_project$swg$$($utf8DecodeSync$$module$third_party$subscriptions_project$swg$$($headerUtf8Bytes$jscomp$1$$), $invalidToken$jscomp$1$$), $payload$:$tryParseJson$$module$third_party$subscriptions_project$swg$$($utf8DecodeSync$$module$third_party$subscriptions_project$swg$$($payloadUtf8Bytes$jscomp$1$$), $invalidToken$jscomp$1$$), $verifiable$:$parts$jscomp$21$$[0] + "." + $parts$jscomp$21$$[1], $sig$:$parts$jscomp$21$$[2]};
}, $parseUrl$1$$module$third_party$subscriptions_project$swg$$ = function($url$jscomp$219$$) {
  $a$$module$third_party$subscriptions_project$swg$$ || ($a$$module$third_party$subscriptions_project$swg$$ = window.self.document.createElement("a"), $cache$$module$third_party$subscriptions_project$swg$$ = window.self.$UrlCache$ || (window.self.$UrlCache$ = Object.create(null)));
  var $a$jscomp$inline_4715_fromCache$$ = $cache$$module$third_party$subscriptions_project$swg$$[$url$jscomp$219$$];
  if ($a$jscomp$inline_4715_fromCache$$) {
    return $a$jscomp$inline_4715_fromCache$$;
  }
  $a$jscomp$inline_4715_fromCache$$ = $a$$module$third_party$subscriptions_project$swg$$;
  $a$jscomp$inline_4715_fromCache$$.href = $url$jscomp$219$$;
  $a$jscomp$inline_4715_fromCache$$.protocol || ($a$jscomp$inline_4715_fromCache$$.href = $a$jscomp$inline_4715_fromCache$$.href);
  var $info$jscomp$inline_4716$$ = {href:$a$jscomp$inline_4715_fromCache$$.href, protocol:$a$jscomp$inline_4715_fromCache$$.protocol, host:$a$jscomp$inline_4715_fromCache$$.host, hostname:$a$jscomp$inline_4715_fromCache$$.hostname, port:"0" == $a$jscomp$inline_4715_fromCache$$.port ? "" : $a$jscomp$inline_4715_fromCache$$.port, pathname:$a$jscomp$inline_4715_fromCache$$.pathname, search:$a$jscomp$inline_4715_fromCache$$.search, hash:$a$jscomp$inline_4715_fromCache$$.hash, origin:""};
  "/" !== $info$jscomp$inline_4716$$.pathname[0] && ($info$jscomp$inline_4716$$.pathname = "/" + $info$jscomp$inline_4716$$.pathname);
  if ("http:" == $info$jscomp$inline_4716$$.protocol && 80 == $info$jscomp$inline_4716$$.port || "https:" == $info$jscomp$inline_4716$$.protocol && 443 == $info$jscomp$inline_4716$$.port) {
    $info$jscomp$inline_4716$$.port = "", $info$jscomp$inline_4716$$.host = $info$jscomp$inline_4716$$.hostname;
  }
  $a$jscomp$inline_4715_fromCache$$.origin && "null" != $a$jscomp$inline_4715_fromCache$$.origin ? $info$jscomp$inline_4716$$.origin = $a$jscomp$inline_4715_fromCache$$.origin : $info$jscomp$inline_4716$$.origin = "data:" != $info$jscomp$inline_4716$$.protocol && $info$jscomp$inline_4716$$.host ? $info$jscomp$inline_4716$$.protocol + "//" + $info$jscomp$inline_4716$$.host : $info$jscomp$inline_4716$$.href;
  return $cache$$module$third_party$subscriptions_project$swg$$[$url$jscomp$219$$] = $info$jscomp$inline_4716$$;
}, $parseQueryString$1$$module$third_party$subscriptions_project$swg$$ = function($query$jscomp$21$$) {
  return $query$jscomp$21$$ ? (/^[?#]/.test($query$jscomp$21$$) ? $query$jscomp$21$$.slice(1) : $query$jscomp$21$$).split("&").reduce(function($query$jscomp$21$$, $key$jscomp$155_param$jscomp$24$$) {
    var $params$jscomp$43$$ = $key$jscomp$155_param$jscomp$24$$.split("=");
    $key$jscomp$155_param$jscomp$24$$ = (0,window.decodeURIComponent)($params$jscomp$43$$[0] || "");
    $params$jscomp$43$$ = (0,window.decodeURIComponent)($params$jscomp$43$$[1] || "");
    $key$jscomp$155_param$jscomp$24$$ && ($query$jscomp$21$$[$key$jscomp$155_param$jscomp$24$$] = $params$jscomp$43$$);
    return $query$jscomp$21$$;
  }, {}) : {};
}, $addQueryParam$$module$third_party$subscriptions_project$swg$$ = function($url$jscomp$221$$) {
  var $period$jscomp$inline_6492_value$jscomp$305$$ = $CACHE_KEYS$$module$third_party$subscriptions_project$swg$$.hr1;
  null == $period$jscomp$inline_6492_value$jscomp$305$$ && ($period$jscomp$inline_6492_value$jscomp$305$$ = 1);
  if (0 === $period$jscomp$inline_6492_value$jscomp$305$$) {
    $period$jscomp$inline_6492_value$jscomp$305$$ = "_";
  } else {
    var $now$jscomp$inline_6493_queryIndex$$ = Date.now();
    $period$jscomp$inline_6492_value$jscomp$305$$ = String(1 >= $period$jscomp$inline_6492_value$jscomp$305$$ ? $now$jscomp$inline_6493_queryIndex$$ : Math.floor($now$jscomp$inline_6493_queryIndex$$ / $period$jscomp$inline_6492_value$jscomp$305$$));
  }
  $now$jscomp$inline_6493_queryIndex$$ = $url$jscomp$221$$.indexOf("?");
  var $fragmentIndex$$ = $url$jscomp$221$$.indexOf("#"), $fragment$jscomp$17$$ = "";
  -1 != $fragmentIndex$$ && ($fragment$jscomp$17$$ = $url$jscomp$221$$.substring($fragmentIndex$$), $url$jscomp$221$$ = $url$jscomp$221$$.substring(0, $fragmentIndex$$));
  -1 == $now$jscomp$inline_6493_queryIndex$$ ? $url$jscomp$221$$ += "?" : $now$jscomp$inline_6493_queryIndex$$ < $url$jscomp$221$$.length - 1 && ($url$jscomp$221$$ += "&");
  $url$jscomp$221$$ += (0,window.encodeURIComponent)("_") + "=" + (0,window.encodeURIComponent)($period$jscomp$inline_6492_value$jscomp$305$$);
  return $url$jscomp$221$$ + $fragment$jscomp$17$$;
}, $feUrl$$module$third_party$subscriptions_project$swg$$ = function($url$jscomp$223$$, $prefix$jscomp$10$$) {
  return $addQueryParam$$module$third_party$subscriptions_project$swg$$("https://news.google.com" + (void 0 === $prefix$jscomp$10$$ ? "" : $prefix$jscomp$10$$) + "/swg/_/ui/v1" + $url$jscomp$223$$);
}, $feArgs$$module$third_party$subscriptions_project$swg$$ = function($args$jscomp$56$$) {
  return Object.assign($args$jscomp$56$$, {_client:"SwG 0.1.22.41"});
}, $PayStartFlow$$module$third_party$subscriptions_project$swg$$ = function($deps$$, $skuOrSubscriptionRequest$$) {
  this.$G$ = $deps$$;
  this.$J$ = $deps$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$payClient_$;
  this.$I$ = $deps$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$;
  this.$D$ = "string" == typeof $skuOrSubscriptionRequest$$ ? {skuId:$skuOrSubscriptionRequest$$} : $skuOrSubscriptionRequest$$;
  this.$F$ = $deps$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$;
}, $PayCompleteFlow$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$1$$) {
  this.$O$ = $deps$jscomp$1$$.$win$();
  this.$G$ = $deps$jscomp$1$$;
  this.$K$ = $deps$jscomp$1$$.$activities$();
  this.$J$ = $deps$jscomp$1$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$;
  this.$I$ = this.$D$ = null;
  this.$F$ = $deps$jscomp$1$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$;
}, $PayCompleteFlow$$module$third_party$subscriptions_project$swg$configurePending$$ = function($deps$jscomp$2$$) {
  $deps$jscomp$2$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$payClient_$.$onResponse$(function($payPromise_promise$jscomp$59$$) {
    $deps$jscomp$2$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$.$blockNextNotification_$ = !0;
    var $flow$jscomp$2$$ = new $PayCompleteFlow$$module$third_party$subscriptions_project$swg$$($deps$jscomp$2$$);
    $payPromise_promise$jscomp$59$$ = $validatePayResponse$$module$third_party$subscriptions_project$swg$$($deps$jscomp$2$$, $payPromise_promise$jscomp$59$$, $flow$jscomp$2$$.complete.bind($flow$jscomp$2$$));
    $JSCompiler_StaticMethods_triggerSubscribeResponse$$($deps$jscomp$2$$.$callbacks_$, $payPromise_promise$jscomp$59$$);
    return $payPromise_promise$jscomp$59$$.then(function($deps$jscomp$2$$) {
      $flow$jscomp$2$$.start($deps$jscomp$2$$);
    }, function($payPromise_promise$jscomp$59$$) {
      $activityPorts$$module$third_party$subscriptions_project$swg$isAbortError$$($payPromise_promise$jscomp$59$$) ? $JSCompiler_StaticMethods_triggerFlowCanceled$$($deps$jscomp$2$$.$callbacks_$, "subscribe") : ($JSCompiler_StaticMethods_logEvent$$($deps$jscomp$2$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$, 2000), $deps$jscomp$2$$.$jserror_$.error("Pay failed", $payPromise_promise$jscomp$59$$));
      throw $payPromise_promise$jscomp$59$$;
    });
  });
}, $validatePayResponse$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$3$$, $payPromise$jscomp$1$$, $completeHandler$jscomp$2$$) {
  return $payPromise$jscomp$1$$.then(function($payPromise$jscomp$1$$) {
    "object" == typeof $payPromise$jscomp$1$$ && $payPromise$jscomp$1$$.googleTransactionId && $deps$jscomp$3$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$.$setTransactionId$($payPromise$jscomp$1$$.googleTransactionId);
    var $JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$ = null, $JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$ = null;
    $payPromise$jscomp$1$$ && ("string" == typeof $payPromise$jscomp$1$$ ? $JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$ = $payPromise$jscomp$1$$ : "swgCallbackData" in $payPromise$jscomp$1$$ ? $JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$ = $payPromise$jscomp$1$$.swgCallbackData : "integratorClientCallbackData" in $payPromise$jscomp$1$$ && ($JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$ = $payPromise$jscomp$1$$.integratorClientCallbackData));
    $JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$ && !$JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$ && ($JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$ = (0,window.atob)($JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$)) && ($JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$ = $parseJson$$module$third_party$subscriptions_project$swg$$($JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$).swgCallbackData);
    if (!$JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$) {
      throw Error("unexpected payment response");
    }
    $payPromise$jscomp$1$$ = $JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$ = JSON.stringify($JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$);
    $JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$ = new $PurchaseData$$module$third_party$subscriptions_project$swg$$($JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$.purchaseData, $JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$.purchaseDataSignature);
    var $JSCompiler_inline_result$jscomp$5679_idToken$jscomp$inline_6498$$;
    if ($JSCompiler_inline_result$jscomp$5679_idToken$jscomp$inline_6498$$ = $JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$.idToken) {
      var $JSCompiler_inline_result$jscomp$inline_6499$$ = $JSCompiler_StaticMethods_JwtHelper$$module$third_party$subscriptions_project$swg_prototype$decodeInternal_$$($JSCompiler_inline_result$jscomp$5679_idToken$jscomp$inline_6498$$).$payload$;
      $JSCompiler_inline_result$jscomp$5679_idToken$jscomp$inline_6498$$ = new $UserData$$module$third_party$subscriptions_project$swg$$($JSCompiler_inline_result$jscomp$5679_idToken$jscomp$inline_6498$$, $JSCompiler_inline_result$jscomp$inline_6499$$);
    } else {
      $JSCompiler_inline_result$jscomp$5679_idToken$jscomp$inline_6498$$ = null;
    }
    return new $SubscribeResponse$$module$third_party$subscriptions_project$swg$$($payPromise$jscomp$1$$, $JSCompiler_temp_const$jscomp$5677_raw$jscomp$inline_4724$$, $JSCompiler_inline_result$jscomp$5679_idToken$jscomp$inline_6498$$, $JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$.signedEntitlements ? $JSCompiler_StaticMethods_parseEntitlements$$($deps$jscomp$3$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$, $JSCompiler_temp_const$jscomp$5678_data$jscomp$196$$) : 
    null, $completeHandler$jscomp$2$$);
  });
}, $parseSkuFromPurchaseDataSafe$$module$third_party$subscriptions_project$swg$$ = function($json$jscomp$28_purchaseData$jscomp$1$$) {
  return ($json$jscomp$28_purchaseData$jscomp$1$$ = $tryParseJson$$module$third_party$subscriptions_project$swg$$($json$jscomp$28_purchaseData$jscomp$1$$.raw)) && $json$jscomp$28_purchaseData$jscomp$1$$.productId || null;
}, $isDocumentReady$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$147_readyState$jscomp$1$$) {
  $doc$jscomp$147_readyState$jscomp$1$$ = $doc$jscomp$147_readyState$jscomp$1$$.readyState;
  return "loading" != $doc$jscomp$147_readyState$jscomp$1$$ && "uninitialized" != $doc$jscomp$147_readyState$jscomp$1$$;
}, $onDocumentState$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$149$$, $callback$jscomp$142$$) {
  var $ready$jscomp$3$$ = $isDocumentReady$$module$third_party$subscriptions_project$swg$$($doc$jscomp$149$$);
  if ($ready$jscomp$3$$) {
    $callback$jscomp$142$$($doc$jscomp$149$$);
  } else {
    var $readyListener$jscomp$2$$ = function() {
      $isDocumentReady$$module$third_party$subscriptions_project$swg$$($doc$jscomp$149$$) && ($ready$jscomp$3$$ || ($ready$jscomp$3$$ = !0, $callback$jscomp$142$$($doc$jscomp$149$$)), $doc$jscomp$149$$.removeEventListener("readystatechange", $readyListener$jscomp$2$$));
    };
    $doc$jscomp$149$$.addEventListener("readystatechange", $readyListener$jscomp$2$$);
  }
}, $whenDocumentReady$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$150$$) {
  return new window.Promise(function($resolve$jscomp$79$$) {
    $onDocumentState$$module$third_party$subscriptions_project$swg$$($doc$jscomp$150$$, $resolve$jscomp$79$$);
  });
}, $GlobalDoc$$module$third_party$subscriptions_project$swg$$ = function($winOrDoc$jscomp$2$$) {
  var $isWin$jscomp$1$$ = !!$winOrDoc$jscomp$2$$.document;
  this.$D$ = $isWin$jscomp$1$$ ? $winOrDoc$jscomp$2$$ : $winOrDoc$jscomp$2$$.defaultView;
  this.$doc_$ = $isWin$jscomp$1$$ ? $winOrDoc$jscomp$2$$.document : $winOrDoc$jscomp$2$$;
}, $resolveDoc$$module$third_party$subscriptions_project$swg$$ = function($input$jscomp$96$$) {
  return 9 === $input$jscomp$96$$.nodeType ? new $GlobalDoc$$module$third_party$subscriptions_project$swg$$($input$jscomp$96$$) : $input$jscomp$96$$.document ? new $GlobalDoc$$module$third_party$subscriptions_project$swg$$($input$jscomp$96$$) : $input$jscomp$96$$;
}, $transition$$module$third_party$subscriptions_project$swg$$ = function($el$jscomp$173$$, $props$jscomp$149$$, $durationMillis$$) {
  var $win$jscomp$457$$ = $el$jscomp$173$$.ownerDocument.defaultView, $previousTransitionValue$$ = $el$jscomp$173$$.style.transition || "";
  return (new window.Promise(function($previousTransitionValue$$) {
    $win$jscomp$457$$.setTimeout(function() {
      $win$jscomp$457$$.setTimeout($previousTransitionValue$$, $durationMillis$$);
      var $resolve$jscomp$80$$ = $durationMillis$$ + "ms ease-out";
      $setImportantStyles$$module$third_party$subscriptions_project$swg$$($el$jscomp$173$$, Object.assign({transition:"transform " + $resolve$jscomp$80$$ + ", opacity " + $resolve$jscomp$80$$}, $props$jscomp$149$$));
    });
  })).then(function() {
    $setImportantStyles$$module$third_party$subscriptions_project$swg$$($el$jscomp$173$$, {transition:$previousTransitionValue$$});
  });
}, $Graypane$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$151$$, $zIndex$jscomp$1$$) {
  this.$doc_$ = $doc$jscomp$151$$;
  this.$fadeBackground_$ = this.$doc_$.$getWin$().document.createElement("swg-popup-background");
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$(this.$fadeBackground_$, {"z-index":$zIndex$jscomp$1$$, display:"none", position:"fixed", top:0, right:0, bottom:0, left:0, "background-color":"rgba(32, 33, 36, .6)"});
}, $LoadingView$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$152_loadingIndicatorTopContainer$jscomp$inline_4734$$) {
  this.$doc_$ = $doc$jscomp$152_loadingIndicatorTopContainer$jscomp$inline_4734$$;
  this.$D$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$, "swg-loading-container", {});
  this.$F$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$, "swg-loading", {});
  this.$D$.appendChild(this.$F$);
  this.$D$.style.setProperty("display", "none", "important");
  var $loadingContainer$jscomp$inline_4733_loadingIndicatorChildContainer$jscomp$inline_4735$$ = this.$F$;
  $doc$jscomp$152_loadingIndicatorTopContainer$jscomp$inline_4734$$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$, "swg-loading-animate", {});
  $loadingContainer$jscomp$inline_4733_loadingIndicatorChildContainer$jscomp$inline_4735$$.appendChild($doc$jscomp$152_loadingIndicatorTopContainer$jscomp$inline_4734$$);
  $loadingContainer$jscomp$inline_4733_loadingIndicatorChildContainer$jscomp$inline_4735$$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$, "swg-loading-image", {});
  $doc$jscomp$152_loadingIndicatorTopContainer$jscomp$inline_4734$$.appendChild($loadingContainer$jscomp$inline_4733_loadingIndicatorChildContainer$jscomp$inline_4735$$);
}, $FriendlyIframe$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$153$$) {
  var $attrs$jscomp$11_mergedAttrs$$ = {"class":"swg-dialog"}, $$jscomp$this$jscomp$1153$$ = this;
  $attrs$jscomp$11_mergedAttrs$$ = void 0 === $attrs$jscomp$11_mergedAttrs$$ ? {} : $attrs$jscomp$11_mergedAttrs$$;
  $attrs$jscomp$11_mergedAttrs$$ = Object.assign({}, $friendlyIframeAttributes$$module$third_party$subscriptions_project$swg$$, $attrs$jscomp$11_mergedAttrs$$);
  this.$iframe_$ = $createElement$$module$third_party$subscriptions_project$swg$$($doc$jscomp$153$$, "iframe", $attrs$jscomp$11_mergedAttrs$$);
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$(this.$iframe_$, $defaultStyles$$module$third_party$subscriptions_project$swg$$);
  this.$ready_$ = new window.Promise(function($doc$jscomp$153$$) {
    $$jscomp$this$jscomp$1153$$.$iframe_$.onload = $doc$jscomp$153$$;
  });
}, $JSCompiler_StaticMethods_getDocument$$ = function($JSCompiler_StaticMethods_getDocument$self_doc$jscomp$154$$) {
  $JSCompiler_StaticMethods_getDocument$self_doc$jscomp$154$$ = $JSCompiler_StaticMethods_getDocument$self_doc$jscomp$154$$.$getElement$().contentDocument || $JSCompiler_StaticMethods_getDocument$self_doc$jscomp$154$$.$getElement$().contentWindow && $JSCompiler_StaticMethods_getDocument$self_doc$jscomp$154$$.$getElement$().contentWindow.document;
  if (!$JSCompiler_StaticMethods_getDocument$self_doc$jscomp$154$$) {
    throw Error("not loaded");
  }
  return $JSCompiler_StaticMethods_getDocument$self_doc$jscomp$154$$;
}, $Dialog$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$155_modifiedImportantStyles$$) {
  var $importantStyles$$ = void 0 === $importantStyles$$ ? {} : $importantStyles$$;
  var $styles$jscomp$12$$ = void 0 === $styles$jscomp$12$$ ? {} : $styles$jscomp$12$$;
  this.$doc_$ = $doc$jscomp$155_modifiedImportantStyles$$;
  this.$iframe_$ = new $FriendlyIframe$$module$third_party$subscriptions_project$swg$$($doc$jscomp$155_modifiedImportantStyles$$.$getWin$().document);
  this.$F$ = new $Graypane$$module$third_party$subscriptions_project$swg$$($doc$jscomp$155_modifiedImportantStyles$$, 2147483646);
  $doc$jscomp$155_modifiedImportantStyles$$ = Object.assign({}, $rootElementImportantStyles$$module$third_party$subscriptions_project$swg$$, $importantStyles$$);
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$(this.$iframe_$.$getElement$(), $doc$jscomp$155_modifiedImportantStyles$$);
  $setStyles$$module$third_party$subscriptions_project$swg$$(this.$iframe_$.$getElement$(), $styles$jscomp$12$$);
  this.$K$ = this.$D$ = this.$container_$ = this.$I$ = null;
  this.$G$ = !1;
  this.$J$ = null;
}, $JSCompiler_StaticMethods_getContainer$$ = function($JSCompiler_StaticMethods_getContainer$self$$) {
  if (!$JSCompiler_StaticMethods_getContainer$self$$.$container_$) {
    throw Error("not opened yet");
  }
  return $JSCompiler_StaticMethods_getContainer$self$$.$container_$;
}, $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$$ = function($JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$self$$) {
  $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$$($JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$self$$, function() {
    $setImportantStyles$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$self$$.$getElement$(), {transform:"translateY(100%)", opactiy:1, visibility:"visible"});
    return $transition$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$self$$.$getElement$(), {transform:"translateY(0)", opacity:1, visibility:"visible"}, 300);
  });
  $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$self$$.$G$ = !1;
}, $JSCompiler_StaticMethods_resizeView$$ = function($JSCompiler_StaticMethods_resizeView$self$$, $view$jscomp$11$$, $height$jscomp$63$$) {
  if ($JSCompiler_StaticMethods_resizeView$self$$.$D$ == $view$jscomp$11$$) {
    var $newHeight$jscomp$15$$ = Math.min($height$jscomp$63$$, 0.9 * $JSCompiler_StaticMethods_resizeView$self$$.$doc_$.$getWin$().innerHeight), $oldHeight$$ = $JSCompiler_StaticMethods_resizeView$self$$.$getElement$().offsetHeight;
    ($newHeight$jscomp$15$$ >= $oldHeight$$ ? $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$$($JSCompiler_StaticMethods_resizeView$self$$, function() {
      $setImportantStyles$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_resizeView$self$$.$getElement$(), {height:$newHeight$jscomp$15$$ + "px", transform:"translateY(" + ($newHeight$jscomp$15$$ - $oldHeight$$) + "px)"});
      return $transition$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_resizeView$self$$.$getElement$(), {transform:"translateY(0)"}, 300);
    }) : $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$$($JSCompiler_StaticMethods_resizeView$self$$, function() {
      return $transition$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_resizeView$self$$.$getElement$(), {transform:"translateY(" + ($oldHeight$$ - $newHeight$jscomp$15$$) + "px)"}, 300).then(function() {
        $setImportantStyles$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_resizeView$self$$.$getElement$(), {height:$newHeight$jscomp$15$$ + "px", transform:"translateY(0)"});
      });
    })).then(function() {
      var $newHeight$jscomp$15$$ = $height$jscomp$63$$ + 20, $oldHeight$$ = $JSCompiler_StaticMethods_resizeView$self$$.$doc_$.$getRootElement$();
      $setImportantStyles$$module$third_party$subscriptions_project$swg$$($oldHeight$$, {"padding-bottom":$newHeight$jscomp$15$$ + "px"});
      $view$jscomp$11$$.$resized$();
    });
  }
}, $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$$ = function($JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$, $callback$jscomp$143$$) {
  return $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$.$K$ = ($JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$.$K$ || window.Promise.resolve()).then(function() {
    return $callback$jscomp$143$$();
  }, function() {
  }).then(function() {
    $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$.$K$ = null;
  });
}, $DialogManager$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$156$$) {
  var $$jscomp$this$jscomp$1160$$ = this;
  this.$doc_$ = $doc$jscomp$156$$;
  this.$G$ = this.$D$ = null;
  this.$F$ = new $Graypane$$module$third_party$subscriptions_project$swg$$($doc$jscomp$156$$, 2147483647);
  this.$I$ = null;
  this.$F$.$getElement$().addEventListener("click", function() {
    if ($$jscomp$this$jscomp$1160$$.$I$) {
      try {
        $$jscomp$this$jscomp$1160$$.$I$.focus();
      } catch ($e$340$$) {
      }
    }
  });
}, $JSCompiler_StaticMethods_completeView$$ = function($JSCompiler_StaticMethods_completeView$self$$, $view$jscomp$13$$) {
  (0,window.setTimeout)(function() {
    $JSCompiler_StaticMethods_completeView$self$$.$D$ && $JSCompiler_StaticMethods_completeView$self$$.$D$.$D$ == $view$jscomp$13$$ && ($JSCompiler_StaticMethods_completeView$self$$.$D$.close(), $JSCompiler_StaticMethods_completeView$self$$.$D$ = null, $JSCompiler_StaticMethods_completeView$self$$.$G$ = null);
  }, 100);
}, $JSCompiler_StaticMethods_completeAll$$ = function($JSCompiler_StaticMethods_completeAll$self$$) {
  $JSCompiler_StaticMethods_completeAll$self$$.$D$ && ($JSCompiler_StaticMethods_completeAll$self$$.$D$.close(), $JSCompiler_StaticMethods_completeAll$self$$.$D$ = null, $JSCompiler_StaticMethods_completeAll$self$$.$G$ = null);
  $JSCompiler_StaticMethods_completeAll$self$$.$F$.$fadeBackground_$.parentNode && $JSCompiler_StaticMethods_completeAll$self$$.$F$.$destroy$();
}, $JSCompiler_StaticMethods_popupOpened$$ = function($JSCompiler_StaticMethods_popupOpened$self$$, $targetWin$jscomp$1$$) {
  $JSCompiler_StaticMethods_popupOpened$self$$.$I$ = $targetWin$jscomp$1$$ || null;
  $JSCompiler_StaticMethods_popupOpened$self$$.$F$.$fadeBackground_$.parentNode || $JSCompiler_StaticMethods_popupOpened$self$$.$F$.$attach$();
  $JSCompiler_StaticMethods_popupOpened$self$$.$F$.show();
}, $JSCompiler_StaticMethods_popupClosed$$ = function($JSCompiler_StaticMethods_popupClosed$self$$) {
  $JSCompiler_StaticMethods_popupClosed$self$$.$I$ = null;
  try {
    $JSCompiler_StaticMethods_popupClosed$self$$.$F$.$hide$();
  } catch ($e$341$$) {
  }
}, $Toast$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$7$$, $src$jscomp$67$$, $args$jscomp$58$$) {
  var $$jscomp$this$jscomp$1163$$ = this;
  this.$doc_$ = $deps$jscomp$7$$.$doc_$;
  $deps$jscomp$7$$.$activities$();
  this.$src_$ = $src$jscomp$67$$;
  this.$F$ = $args$jscomp$58$$;
  this.$D$ = null;
  this.$iframe_$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$.$getWin$().document, "iframe", $iframeAttributes$1$$module$third_party$subscriptions_project$swg$$);
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$(this.$iframe_$, $toastImportantStyles$$module$third_party$subscriptions_project$swg$$);
  this.$ready_$ = new window.Promise(function($deps$jscomp$7$$) {
    $$jscomp$this$jscomp$1163$$.$iframe_$.onload = $deps$jscomp$7$$;
  });
}, $JSCompiler_StaticMethods_buildToast_$$ = function($JSCompiler_StaticMethods_buildToast_$self$$) {
  return $JSCompiler_StaticMethods_openIframe$$($JSCompiler_StaticMethods_buildToast_$self$$.$iframe_$, $JSCompiler_StaticMethods_buildToast_$self$$.$src_$, $JSCompiler_StaticMethods_buildToast_$self$$.$F$).then(function($JSCompiler_StaticMethods_buildToast_$self$$) {
    return $JSCompiler_StaticMethods_buildToast_$self$$.$whenReady$();
  }).then(function() {
    $resetStyles$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_buildToast_$self$$.$iframe_$);
    $JSCompiler_StaticMethods_Toast$$module$third_party$subscriptions_project$swg_prototype$animate_$$($JSCompiler_StaticMethods_buildToast_$self$$, function() {
      $setImportantStyles$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_buildToast_$self$$.$iframe_$, {transform:"translateY(100%)", opactiy:1, visibility:"visible"});
      return $transition$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_buildToast_$self$$.$iframe_$, {transform:"translateY(0)", opacity:1, visibility:"visible"}, 400);
    });
    $JSCompiler_StaticMethods_buildToast_$self$$.$doc_$.$getWin$().setTimeout(function() {
      $JSCompiler_StaticMethods_buildToast_$self$$.close();
    }, 8E3);
  });
}, $JSCompiler_StaticMethods_Toast$$module$third_party$subscriptions_project$swg_prototype$animate_$$ = function($JSCompiler_StaticMethods_Toast$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$, $callback$jscomp$144$$) {
  return $JSCompiler_StaticMethods_Toast$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$.$D$ = ($JSCompiler_StaticMethods_Toast$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$.$D$ || window.Promise.resolve()).then(function() {
    return $callback$jscomp$144$$();
  }, function() {
  }).then(function() {
    $JSCompiler_StaticMethods_Toast$$module$third_party$subscriptions_project$swg_prototype$animate_$self$$.$D$ = null;
  });
}, $EntitlementsManager$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$458$$, $pageConfig$$, $fetcher$$, $deps$jscomp$8$$) {
  this.$I$ = $win$jscomp$458$$;
  this.$O$ = $pageConfig$$;
  this.$P$ = this.$O$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$;
  this.$R$ = $fetcher$$;
  this.$K$ = $deps$jscomp$8$$;
  this.$G$ = null;
  this.$F$ = 0;
  this.$blockNextNotification_$ = !1;
  this.$D$ = $deps$jscomp$8$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$storage_$;
  this.$J$ = $deps$jscomp$8$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$;
  this.$config_$ = $deps$jscomp$8$$.config();
}, $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$$ = function($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$) {
  $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$G$ || ($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$G$ = $JSCompiler_StaticMethods_getEntitlementsFlow_$$($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$));
  return $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$G$.then(function($response$jscomp$68$$) {
    null != $response$jscomp$68$$.$isReadyToPay$ && $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$J$.$setReadyToPay$($response$jscomp$68$$.$isReadyToPay$);
    1 != $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$config_$.$analyticsMode$ && "google" != $parseQueryString$1$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$I$.location.search).utm_source || $JSCompiler_StaticMethods_logEvent$$($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$J$, 
    1);
    return $response$jscomp$68$$;
  });
}, $JSCompiler_StaticMethods_pushNextEntitlements$$ = function($JSCompiler_StaticMethods_pushNextEntitlements$self$$, $raw$jscomp$10$$) {
  var $entitlements$jscomp$5$$ = $JSCompiler_StaticMethods_getValidJwtEntitlements_$$($JSCompiler_StaticMethods_pushNextEntitlements$self$$, $raw$jscomp$10$$, !0, void 0);
  $entitlements$jscomp$5$$ && $JSCompiler_StaticMethods_enablesThis$$($entitlements$jscomp$5$$) && $JSCompiler_StaticMethods_pushNextEntitlements$self$$.$D$.set("ents", $raw$jscomp$10$$);
}, $JSCompiler_StaticMethods_getEntitlementsFlow_$$ = function($JSCompiler_StaticMethods_getEntitlementsFlow_$self$$) {
  return $JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$$($JSCompiler_StaticMethods_getEntitlementsFlow_$self$$).then(function($entitlements$jscomp$6$$) {
    var $blockNotification$jscomp$inline_4765$$ = $JSCompiler_StaticMethods_getEntitlementsFlow_$self$$.$blockNextNotification_$;
    $JSCompiler_StaticMethods_getEntitlementsFlow_$self$$.$blockNextNotification_$ = !1;
    $blockNotification$jscomp$inline_4765$$ || ($JSCompiler_StaticMethods_triggerEntitlementsResponse$$($JSCompiler_StaticMethods_getEntitlementsFlow_$self$$.$K$.$callbacks_$, window.Promise.resolve($entitlements$jscomp$6$$)), $JSCompiler_StaticMethods_maybeShowToast_$$($JSCompiler_StaticMethods_getEntitlementsFlow_$self$$, $entitlements$jscomp$6$$));
    return $entitlements$jscomp$6$$;
  });
}, $JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$$ = function($JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$self$$) {
  return window.Promise.all([$JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$self$$.$D$.get("ents"), $JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$self$$.$D$.get("isreadytopay")]).then(function($JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$) {
    var $cached$jscomp$2_raw$jscomp$11$$ = $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$[0];
    $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$ = $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$[1];
    if ($cached$jscomp$2_raw$jscomp$11$$) {
      a: {
        switch($JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$) {
          case "true":
            $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$ = !0;
            break a;
          case "false":
            $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$ = !1;
            break a;
        }
        $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$ = void 0;
      }
      if (($cached$jscomp$2_raw$jscomp$11$$ = $JSCompiler_StaticMethods_getValidJwtEntitlements_$$($JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$self$$, $cached$jscomp$2_raw$jscomp$11$$, !0, $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$)) && $JSCompiler_StaticMethods_enablesThis$$($cached$jscomp$2_raw$jscomp$11$$)) {
        return $JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$self$$.$F$ = 0, $cached$jscomp$2_raw$jscomp$11$$;
      }
    }
    return $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetchEntitlements_$$($JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$self$$).then(function($JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$) {
      $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$ && $JSCompiler_StaticMethods_enablesThis$$($JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$) && $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$.raw && $JSCompiler_StaticMethods_fetchEntitlementsWithCaching_$self$$.$D$.set("ents", $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$.raw);
      return $JSCompiler_inline_result$jscomp$980_cachedValues_irtp$$;
    });
  });
}, $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetchEntitlements_$$ = function($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetchEntitlements_$self$$) {
  function $attempt$$() {
    $positiveRetries$$--;
    return $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetch_$$($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetchEntitlements_$self$$).then(function($entitlements$jscomp$7$$) {
      return $JSCompiler_StaticMethods_enablesThis$$($entitlements$jscomp$7$$) || 0 >= $positiveRetries$$ ? $entitlements$jscomp$7$$ : new window.Promise(function($positiveRetries$$) {
        $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetchEntitlements_$self$$.$I$.setTimeout(function() {
          $positiveRetries$$($attempt$$());
        }, 550);
      });
    });
  }
  var $positiveRetries$$ = $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetchEntitlements_$self$$.$F$;
  $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetchEntitlements_$self$$.$F$ = 0;
  return $attempt$$();
}, $JSCompiler_StaticMethods_setToastShown$$ = function($JSCompiler_StaticMethods_setToastShown$self$$) {
  $JSCompiler_StaticMethods_setToastShown$self$$.$D$.set("toast", "1");
}, $JSCompiler_StaticMethods_parseEntitlements$$ = function($JSCompiler_StaticMethods_parseEntitlements$self$$, $entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$) {
  var $isReadyToPay$jscomp$1$$ = $entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$.isReadyToPay;
  null == $isReadyToPay$jscomp$1$$ ? $JSCompiler_StaticMethods_parseEntitlements$self$$.$D$.remove("isreadytopay") : $JSCompiler_StaticMethods_parseEntitlements$self$$.$D$.set("isreadytopay", String($isReadyToPay$jscomp$1$$));
  var $signedData$$ = $entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$.signedEntitlements;
  if ($signedData$$) {
    if ($entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$ = $JSCompiler_StaticMethods_getValidJwtEntitlements_$$($JSCompiler_StaticMethods_parseEntitlements$self$$, $signedData$$, !1, $isReadyToPay$jscomp$1$$)) {
      return $entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$;
    }
  } else {
    if ($entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$ = $entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$.entitlements) {
      return $JSCompiler_StaticMethods_createEntitlements_$$($JSCompiler_StaticMethods_parseEntitlements$self$$, "", $entitlements$jscomp$8_json$jscomp$29_plainEntitlements$$, $isReadyToPay$jscomp$1$$);
    }
  }
  return $JSCompiler_StaticMethods_createEntitlements_$$($JSCompiler_StaticMethods_parseEntitlements$self$$, "", [], $isReadyToPay$jscomp$1$$);
}, $JSCompiler_StaticMethods_getValidJwtEntitlements_$$ = function($JSCompiler_StaticMethods_getValidJwtEntitlements_$self$$, $raw$jscomp$12$$, $requireNonExpired$$, $opt_isReadyToPay$jscomp$1$$) {
  try {
    var $jwt$jscomp$5$$ = $JSCompiler_StaticMethods_JwtHelper$$module$third_party$subscriptions_project$swg_prototype$decodeInternal_$$($raw$jscomp$12$$).$payload$;
    if ($requireNonExpired$$ && 1000 * (0,window.parseFloat)($jwt$jscomp$5$$.exp) < Date.now()) {
      return null;
    }
    var $entitlementsClaim$$ = $jwt$jscomp$5$$.entitlements;
    return $entitlementsClaim$$ && $JSCompiler_StaticMethods_createEntitlements_$$($JSCompiler_StaticMethods_getValidJwtEntitlements_$self$$, $raw$jscomp$12$$, $entitlementsClaim$$, $opt_isReadyToPay$jscomp$1$$) || null;
  } catch ($e$342$$) {
    $JSCompiler_StaticMethods_getValidJwtEntitlements_$self$$.$I$.setTimeout(function() {
      throw $e$342$$;
    });
  }
  return null;
}, $JSCompiler_StaticMethods_createEntitlements_$$ = function($JSCompiler_StaticMethods_createEntitlements_$self$$, $raw$jscomp$13$$, $json$jscomp$30$$, $opt_isReadyToPay$jscomp$2$$) {
  return new $Entitlements$$module$third_party$subscriptions_project$swg$$("subscribe.google.com", $raw$jscomp$13$$, $Entitlement$$module$third_party$subscriptions_project$swg$parseListFromJson$$($json$jscomp$30$$), $JSCompiler_StaticMethods_createEntitlements_$self$$.$O$.$PageConfig$$module$third_party$subscriptions_project$config$productId_$, $JSCompiler_StaticMethods_createEntitlements_$self$$.$U$.bind($JSCompiler_StaticMethods_createEntitlements_$self$$), $opt_isReadyToPay$jscomp$2$$);
}, $JSCompiler_StaticMethods_maybeShowToast_$$ = function($JSCompiler_StaticMethods_maybeShowToast_$self$$, $entitlements$jscomp$10$$) {
  var $entitlement$$ = $JSCompiler_StaticMethods_getEntitlementFor$$($entitlements$jscomp$10$$, $entitlements$jscomp$10$$.$product_$);
  $entitlement$$ ? $JSCompiler_StaticMethods_maybeShowToast_$self$$.$D$.get("toast").then(function($entitlements$jscomp$10$$) {
    "1" != $entitlements$jscomp$10$$ && $entitlement$$ && ($entitlements$jscomp$10$$ = $entitlement$$.source || "google", (new $Toast$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_maybeShowToast_$self$$.$K$, $feUrl$$module$third_party$subscriptions_project$swg$$("/toastiframe"), $feArgs$$module$third_party$subscriptions_project$swg$$({publicationId:$JSCompiler_StaticMethods_maybeShowToast_$self$$.$P$, source:$entitlements$jscomp$10$$}))).open());
  }) : window.Promise.resolve();
}, $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetch_$$ = function($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetch_$self$$) {
  var $url$jscomp$225$$ = "https://news.google.com/swg/_/api/v1" + ("/publication/" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetch_$self$$.$P$) + "/entitlements");
  return $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetch_$self$$.$R$.$fetchCredentialedJson$($url$jscomp$225$$).then(function($url$jscomp$225$$) {
    return $JSCompiler_StaticMethods_parseEntitlements$$($JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$fetch_$self$$, $url$jscomp$225$$);
  });
}, $Xhr$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$459$$) {
  this.$win$ = $win$jscomp$459$$;
}, $setupInit$$module$third_party$subscriptions_project$swg$$ = function($init$jscomp$20_opt_init$jscomp$15$$) {
  $init$jscomp$20_opt_init$jscomp$15$$ = $init$jscomp$20_opt_init$jscomp$15$$ || {};
  var $JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$ = $init$jscomp$20_opt_init$jscomp$15$$.method;
  void 0 === $JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$ ? $JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$ = "GET" : ($JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$ = $JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$.toUpperCase(), $assert$$module$third_party$subscriptions_project$swg$$($allowedMethods_$$module$third_party$subscriptions_project$swg$$.includes($JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$), "Only one of %s is currently allowed. Got %s", 
  $allowedMethods_$$module$third_party$subscriptions_project$swg$$.join(", "), $JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$));
  $init$jscomp$20_opt_init$jscomp$15$$.method = $JSCompiler_inline_result$jscomp$981_method$jscomp$inline_4773$$;
  $init$jscomp$20_opt_init$jscomp$15$$.headers = $init$jscomp$20_opt_init$jscomp$15$$.headers || {};
  return $init$jscomp$20_opt_init$jscomp$15$$;
}, $fetchPolyfill$$module$third_party$subscriptions_project$swg$$ = function($input$jscomp$99$$, $init$jscomp$21$$) {
  return new window.Promise(function($resolve$jscomp$84$$, $reject$jscomp$28$$) {
    var $xhr$jscomp$13$$ = $createXhrRequest$$module$third_party$subscriptions_project$swg$$($init$jscomp$21$$.method || "GET", $input$jscomp$99$$);
    "include" == $init$jscomp$21$$.credentials && ($xhr$jscomp$13$$.withCredentials = !0);
    $init$jscomp$21$$.responseType in $allowedFetchTypes_$$module$third_party$subscriptions_project$swg$$ && ($xhr$jscomp$13$$.responseType = $init$jscomp$21$$.responseType);
    $init$jscomp$21$$.headers && Object.keys($init$jscomp$21$$.headers).forEach(function($input$jscomp$99$$) {
      $xhr$jscomp$13$$.setRequestHeader($input$jscomp$99$$, $init$jscomp$21$$.headers[$input$jscomp$99$$]);
    });
    $xhr$jscomp$13$$.onreadystatechange = function() {
      2 > $xhr$jscomp$13$$.readyState || (100 > $xhr$jscomp$13$$.status || 599 < $xhr$jscomp$13$$.status ? ($xhr$jscomp$13$$.onreadystatechange = null, $reject$jscomp$28$$(Error("Unknown HTTP status " + $xhr$jscomp$13$$.status))) : 4 == $xhr$jscomp$13$$.readyState && $resolve$jscomp$84$$(new $FetchResponse$$module$third_party$subscriptions_project$swg$$($xhr$jscomp$13$$)));
    };
    $xhr$jscomp$13$$.onerror = function() {
      $reject$jscomp$28$$(Error("Network failure"));
    };
    $xhr$jscomp$13$$.onabort = function() {
      $reject$jscomp$28$$(Error("Request aborted"));
    };
    "POST" == $init$jscomp$21$$.method ? $xhr$jscomp$13$$.send($init$jscomp$21$$.body) : $xhr$jscomp$13$$.send();
  });
}, $createXhrRequest$$module$third_party$subscriptions_project$swg$$ = function($method$jscomp$33$$, $url$jscomp$226$$) {
  var $xhr$jscomp$14$$ = new window.XMLHttpRequest;
  if ("withCredentials" in $xhr$jscomp$14$$) {
    $xhr$jscomp$14$$.open($method$jscomp$33$$, $url$jscomp$226$$, !0);
  } else {
    throw Error("CORS is not supported");
  }
  return $xhr$jscomp$14$$;
}, $assertSuccess$$module$third_party$subscriptions_project$swg$$ = function($response$jscomp$71$$) {
  return new window.Promise(function($resolve$jscomp$85_status$jscomp$7$$) {
    if ($response$jscomp$71$$.$F$) {
      return $resolve$jscomp$85_status$jscomp$7$$($response$jscomp$71$$);
    }
    $resolve$jscomp$85_status$jscomp$7$$ = $response$jscomp$71$$.status;
    var $err$jscomp$56$$ = Error("HTTP error " + $resolve$jscomp$85_status$jscomp$7$$);
    $err$jscomp$56$$.$retriable$ = 415 == $resolve$jscomp$85_status$jscomp$7$$ || 500 <= $resolve$jscomp$85_status$jscomp$7$$ && 600 > $resolve$jscomp$85_status$jscomp$7$$;
    $err$jscomp$56$$.response = $response$jscomp$71$$;
    throw $err$jscomp$56$$;
  });
}, $FetchResponse$$module$third_party$subscriptions_project$swg$$ = function($xhr$jscomp$15$$) {
  this.$xhr_$ = $xhr$jscomp$15$$;
  this.status = this.$xhr_$.status;
  this.$F$ = 200 <= this.status && 300 > this.status;
  this.headers = new $FetchResponseHeaders$$module$third_party$subscriptions_project$swg$$($xhr$jscomp$15$$);
  this.$D$ = !1;
  this.body = null;
}, $JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$$ = function($JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$self$$) {
  $assert$$module$third_party$subscriptions_project$swg$$(!$JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$self$$.$D$, "Body already used");
  $JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$self$$.$D$ = !0;
  return window.Promise.resolve($JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$self$$.$xhr_$.responseText);
}, $FetchResponseHeaders$$module$third_party$subscriptions_project$swg$$ = function($xhr$jscomp$16$$) {
  this.$xhr_$ = $xhr$jscomp$16$$;
}, $XhrFetcher$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$460$$) {
  this.$xhr_$ = new $Xhr$$module$third_party$subscriptions_project$swg$$($win$jscomp$460$$);
}, $JsError$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$157$$) {
  this.$doc_$ = $doc$jscomp$157$$;
  this.$D$ = window.Promise.resolve();
}, $createErrorVargs$$module$third_party$subscriptions_project$swg$$ = function($var_args$jscomp$88$$) {
  for (var $error$jscomp$91_prop$jscomp$inline_4779$$ = null, $message$jscomp$78$$ = "", $i$343$$ = 0; $i$343$$ < arguments.length; $i$343$$++) {
    var $arg$jscomp$14_error$jscomp$inline_4775$$ = arguments[$i$343$$];
    if ($arg$jscomp$14_error$jscomp$inline_4775$$ instanceof Error && !$error$jscomp$91_prop$jscomp$inline_4779$$) {
      $error$jscomp$91_prop$jscomp$inline_4779$$ = void 0;
      var $messageProperty$jscomp$inline_4776_stack$jscomp$inline_4777$$ = Object.getOwnPropertyDescriptor($arg$jscomp$14_error$jscomp$inline_4775$$, "message");
      if ($messageProperty$jscomp$inline_4776_stack$jscomp$inline_4777$$ && $messageProperty$jscomp$inline_4776_stack$jscomp$inline_4777$$.writable) {
        $error$jscomp$91_prop$jscomp$inline_4779$$ = $arg$jscomp$14_error$jscomp$inline_4775$$;
      } else {
        $messageProperty$jscomp$inline_4776_stack$jscomp$inline_4777$$ = $arg$jscomp$14_error$jscomp$inline_4775$$.stack;
        var $e$jscomp$inline_4778$$ = Error($arg$jscomp$14_error$jscomp$inline_4775$$.message);
        for ($error$jscomp$91_prop$jscomp$inline_4779$$ in $arg$jscomp$14_error$jscomp$inline_4775$$) {
          $e$jscomp$inline_4778$$[$error$jscomp$91_prop$jscomp$inline_4779$$] = $arg$jscomp$14_error$jscomp$inline_4775$$[$error$jscomp$91_prop$jscomp$inline_4779$$];
        }
        $e$jscomp$inline_4778$$.stack = $messageProperty$jscomp$inline_4776_stack$jscomp$inline_4777$$;
        $error$jscomp$91_prop$jscomp$inline_4779$$ = $e$jscomp$inline_4778$$;
      }
    } else {
      $message$jscomp$78$$ && ($message$jscomp$78$$ += " "), $message$jscomp$78$$ += $arg$jscomp$14_error$jscomp$inline_4775$$;
    }
  }
  $error$jscomp$91_prop$jscomp$inline_4779$$ ? $message$jscomp$78$$ && ($error$jscomp$91_prop$jscomp$inline_4779$$.message = $message$jscomp$78$$ + ": " + $error$jscomp$91_prop$jscomp$inline_4779$$.message) : $error$jscomp$91_prop$jscomp$inline_4779$$ = Error($message$jscomp$78$$);
  return $error$jscomp$91_prop$jscomp$inline_4779$$;
}, $acceptPortResultData$$module$third_party$subscriptions_project$swg$$ = function($port$jscomp$19$$, $requireOriginVerified$$, $requireSecureChannel$$) {
  var $requireOrigin$$ = $parseUrl$1$$module$third_party$subscriptions_project$swg$$("https://news.google.com").origin;
  return $port$jscomp$19$$.$acceptResult$().then(function($port$jscomp$19$$) {
    if ($port$jscomp$19$$.origin != $requireOrigin$$ || $requireOriginVerified$$ && !$port$jscomp$19$$.$originVerified$ || $requireSecureChannel$$ && !$port$jscomp$19$$.$secureChannel$) {
      throw Error("channel mismatch");
    }
    return $port$jscomp$19$$.data;
  });
}, $LinkbackFlow$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$9$$) {
  this.$D$ = $deps$jscomp$9$$;
  this.$F$ = $deps$jscomp$9$$.$activities$();
  this.$I$ = $deps$jscomp$9$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$;
  this.$G$ = $deps$jscomp$9$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$;
}, $LinkCompleteFlow$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$10$$, $response$jscomp$73$$) {
  var $$jscomp$this$jscomp$1174$$ = this;
  this.$K$ = $deps$jscomp$10$$.$win$();
  this.$J$ = $deps$jscomp$10$$.$activities$();
  this.$G$ = $deps$jscomp$10$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$;
  this.$D$ = $deps$jscomp$10$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$;
  this.$callbacks_$ = $deps$jscomp$10$$.$callbacks_$;
  this.$F$ = new $ActivityIframeView$$module$third_party$subscriptions_project$swg$$(this.$K$, this.$J$, $feUrl$$module$third_party$subscriptions_project$swg$$("/linkconfirmiframe", "/u/" + ($response$jscomp$73$$ && $response$jscomp$73$$.index || "0")), $feArgs$$module$third_party$subscriptions_project$swg$$({productId:$deps$jscomp$10$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$productId_$, publicationId:$deps$jscomp$10$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$}), 
  !0);
  this.$I$ = null;
  this.$O$ = new window.Promise(function($deps$jscomp$10$$) {
    $$jscomp$this$jscomp$1174$$.$I$ = $deps$jscomp$10$$;
  });
}, $LinkCompleteFlow$$module$third_party$subscriptions_project$swg$configurePending$$ = function($deps$jscomp$11$$) {
  $deps$jscomp$11$$.$activities$().$onResult$("swg-link", function($port$jscomp$20$$) {
    $deps$jscomp$11$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$.$blockNextNotification_$ = !0;
    $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($deps$jscomp$11$$.$callbacks_$, 5, !0);
    $JSCompiler_StaticMethods_popupClosed$$($deps$jscomp$11$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$);
    return $acceptPortResultData$$module$third_party$subscriptions_project$swg$$($port$jscomp$20$$, !1, !1).then(function($port$jscomp$20$$) {
      (new $LinkCompleteFlow$$module$third_party$subscriptions_project$swg$$($deps$jscomp$11$$, $port$jscomp$20$$)).start();
    }, function($port$jscomp$20$$) {
      $activityPorts$$module$third_party$subscriptions_project$swg$isAbortError$$($port$jscomp$20$$) && $JSCompiler_StaticMethods_triggerFlowCanceled$$($deps$jscomp$11$$.$callbacks_$, "linkAccount");
    });
  });
}, $PaymentsRequestDelegate$$module$third_party$subscriptions_project$swg$$ = function($environment$$) {
  this.$F$ = $environment$$;
  this.$D$ = null;
}, $JSCompiler_StaticMethods_createPaymentRequest_$$ = function($request$jscomp$39$$, $environment$jscomp$1$$, $currencyCode$$, $totalPrice$$) {
  var $data$jscomp$200$$ = {};
  $request$jscomp$39$$ && ($data$jscomp$200$$ = JSON.parse(JSON.stringify($request$jscomp$39$$)));
  $data$jscomp$200$$.apiVersion || ($data$jscomp$200$$.apiVersion = 1);
  $data$jscomp$200$$.swg && ($data$jscomp$200$$.allowedPaymentMethods = ["CARD"]);
  $environment$jscomp$1$$ && "TEST" == $environment$jscomp$1$$ && ($data$jscomp$200$$.environment = $environment$jscomp$1$$);
  return new window.PaymentRequest([{supportedMethods:["https://google.com/pay"], data:$data$jscomp$200$$}], {total:{label:"Estimated Total Price", amount:{currency:$currencyCode$$ || "USD", value:$totalPrice$$ || "0"}}});
}, $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$$ = function($JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$, $paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$) {
  $paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$ = $JSCompiler_StaticMethods_createPaymentRequest_$$($paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$, $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$.$F$, $paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$.$transactionInfo$ && $paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$.$transactionInfo$.$currencyCode$ || void 0, $paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$.$transactionInfo$ && $paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$.$transactionInfo$.$totalPrice$ || 
  void 0);
  $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$.$D$($paymentDataRequest$jscomp$2_paymentRequest$jscomp$1$$.show().then(function($JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$) {
    $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$.complete("success");
    return $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$.details;
  }).catch(function($JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$) {
    $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$.statusCode = "CANCELED";
    throw $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$self$$;
  }));
}, $Graypane$1$$module$third_party$subscriptions_project$swg$$ = function() {
  var $doc$jscomp$158$$ = window.document, $$jscomp$this$jscomp$1179$$ = this;
  this.$doc_$ = $doc$jscomp$158$$;
  this.$element_$ = $doc$jscomp$158$$.createElement("gpay-graypane");
  $setImportantStyles$1$$module$third_party$subscriptions_project$swg$$(this.$element_$, {"z-index":2147483647, display:"none", position:"fixed", top:0, right:0, bottom:0, left:0, "background-color":"rgba(32, 33, 36, .6)"});
  this.$popupWindow_$ = null;
  this.$element_$.addEventListener("click", function() {
    if ($$jscomp$this$jscomp$1179$$.$popupWindow_$) {
      try {
        $$jscomp$this$jscomp$1179$$.$popupWindow_$.focus();
      } catch ($e$344$$) {
      }
    }
  });
}, $setImportantStyles$1$$module$third_party$subscriptions_project$swg$$ = function($element$jscomp$636$$, $styles$jscomp$13$$) {
  for (var $k$jscomp$78$$ in $styles$jscomp$13$$) {
    $element$jscomp$636$$.style.setProperty($k$jscomp$78$$, $styles$jscomp$13$$[$k$jscomp$78$$].toString(), "important");
  }
}, $transition$1$$module$third_party$subscriptions_project$swg$$ = function($el$jscomp$174$$, $props$jscomp$150$$) {
  var $win$jscomp$461$$ = $el$jscomp$174$$.ownerDocument.defaultView, $previousTransitionValue$jscomp$1$$ = $el$jscomp$174$$.style.transition || "";
  return (new window.Promise(function($previousTransitionValue$jscomp$1$$) {
    $win$jscomp$461$$.setTimeout(function() {
      $win$jscomp$461$$.setTimeout($previousTransitionValue$jscomp$1$$, 300);
      $setImportantStyles$1$$module$third_party$subscriptions_project$swg$$($el$jscomp$174$$, Object.assign({transition:"transform 300ms ease-out, opacity 300ms ease-out"}, $props$jscomp$150$$));
    });
  })).then(function() {
    $setImportantStyles$1$$module$third_party$subscriptions_project$swg$$($el$jscomp$174$$, Object.assign({transition:$previousTransitionValue$jscomp$1$$}, $props$jscomp$150$$));
  });
}, $PostMessageService$$module$third_party$subscriptions_project$swg$$ = function() {
  this.$D$ = $iframe$$module$third_party$subscriptions_project$swg$$.contentWindow;
}, $PayFrameHelper$$module$third_party$subscriptions_project$swg$sendAndWaitForResponse$$ = function($data$jscomp$201_postMessageData$$, $responseHandler$$) {
  function $callback$jscomp$147$$($data$jscomp$201_postMessageData$$) {
    $data$jscomp$201_postMessageData$$.data.isReadyToPayResponse && ($responseHandler$$($data$jscomp$201_postMessageData$$), window.removeEventListener("message", $callback$jscomp$147$$));
  }
  window.addEventListener("message", $callback$jscomp$147$$);
  $data$jscomp$201_postMessageData$$ = Object.assign({eventType:6}, $data$jscomp$201_postMessageData$$);
  $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$($data$jscomp$201_postMessageData$$);
}, $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$ = function($data$jscomp$202_postMessageData$jscomp$1$$) {
  if ($iframeLoaded$$module$third_party$subscriptions_project$swg$$) {
    $data$jscomp$202_postMessageData$jscomp$1$$ = Object.assign({buyFlowActivityMode:$buyFlowActivityMode$$module$third_party$subscriptions_project$swg$$, googleTransactionId:$googleTransactionId$$module$third_party$subscriptions_project$swg$$, originTimeMs:$originTimeMs$$module$third_party$subscriptions_project$swg$$}, $data$jscomp$202_postMessageData$jscomp$1$$);
    var $iframeUrl$jscomp$inline_4792$$ = "https://pay";
    "SANDBOX" == $environment$$module$third_party$subscriptions_project$swg$$ ? $iframeUrl$jscomp$inline_4792$$ += ".sandbox" : "PREPROD" == $environment$$module$third_party$subscriptions_project$swg$$ && ($iframeUrl$jscomp$inline_4792$$ += "-preprod.sandbox");
    $postMessageService$$module$third_party$subscriptions_project$swg$$.postMessage($data$jscomp$202_postMessageData$jscomp$1$$, $iframeUrl$jscomp$inline_4792$$ + ".google.com");
  } else {
    $buffer$$module$third_party$subscriptions_project$swg$$.push($data$jscomp$202_postMessageData$jscomp$1$$);
  }
}, $PayFrameHelper$$module$third_party$subscriptions_project$swg$iframeLoaded$$ = function() {
  $iframeLoaded$$module$third_party$subscriptions_project$swg$$ = !0;
  $buffer$$module$third_party$subscriptions_project$swg$$.forEach(function($data$jscomp$203$$) {
    $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$($data$jscomp$203$$);
  });
  $buffer$$module$third_party$subscriptions_project$swg$$.length = 0;
}, $chromeSupportsPaymentRequest$$module$third_party$subscriptions_project$swg$$ = function() {
  if (-1 != window.navigator.userAgent.indexOf("OPR/")) {
    return !1;
  }
  var $androidPlatform$$ = window.navigator.userAgent.match(/Android/i), $chromeVersion$jscomp$1$$ = window.navigator.userAgent.match(/Chrome\/([0-9]+)\./i);
  return null != $androidPlatform$$ && "PaymentRequest" in window && "Google Inc." == window.navigator.vendor && null != $chromeVersion$jscomp$1$$ && 59 <= Number($chromeVersion$jscomp$1$$[1]);
}, $doesMerchantSupportOnlyTokenizedCards$$module$third_party$subscriptions_project$swg$$ = function($isReadyToPayRequest$jscomp$1$$) {
  if (2 <= $isReadyToPayRequest$jscomp$1$$.$apiVersion$) {
    var $allowedAuthMethods$$ = $extractAllowedAuthMethodsForCards_$$module$third_party$subscriptions_project$swg$$($isReadyToPayRequest$jscomp$1$$);
    if ($allowedAuthMethods$$ && 1 == $allowedAuthMethods$$.length && "CRYPTOGRAM_3DS" == $allowedAuthMethods$$[0]) {
      return !0;
    }
  }
  return 1 == $isReadyToPayRequest$jscomp$1$$.$allowedPaymentMethods$.length && "TOKENIZED_CARD" == $isReadyToPayRequest$jscomp$1$$.$allowedPaymentMethods$[0];
}, $apiV2DoesMerchantSupportSpecifiedCardType$$module$third_party$subscriptions_project$swg$$ = function($allowedAuthMethods$jscomp$1_isReadyToPayRequest$jscomp$2$$, $apiV2AuthMethod$$) {
  return 2 <= $allowedAuthMethods$jscomp$1_isReadyToPayRequest$jscomp$2$$.$apiVersion$ && ($allowedAuthMethods$jscomp$1_isReadyToPayRequest$jscomp$2$$ = $extractAllowedAuthMethodsForCards_$$module$third_party$subscriptions_project$swg$$($allowedAuthMethods$jscomp$1_isReadyToPayRequest$jscomp$2$$)) && $allowedAuthMethods$jscomp$1_isReadyToPayRequest$jscomp$2$$.includes($apiV2AuthMethod$$) ? !0 : !1;
}, $validateSecureContext$$module$third_party$subscriptions_project$swg$$ = function() {
  return void 0 === window.$isSecureContext$ ? null : window.$isSecureContext$ ? null : "Google Pay APIs should be called in secure context!";
}, $validatePaymentOptions$$module$third_party$subscriptions_project$swg$$ = function($paymentOptions$$) {
  if ($paymentOptions$$.$environment$ && !Object.values($Constants$$module$third_party$subscriptions_project$swg$Environment$$).includes($paymentOptions$$.$environment$)) {
    throw Error("Parameter environment in PaymentOptions can optionally be set to PRODUCTION, otherwise it defaults to TEST.");
  }
}, $validateIsReadyToPayRequest$$module$third_party$subscriptions_project$swg$$ = function($isReadyToPayRequest$jscomp$3$$) {
  if (!$isReadyToPayRequest$jscomp$3$$) {
    return "isReadyToPayRequest must be set!";
  }
  if (2 <= $isReadyToPayRequest$jscomp$3$$.$apiVersion$) {
    if (!("apiVersionMinor" in $isReadyToPayRequest$jscomp$3$$)) {
      return "apiVersionMinor must be set!";
    }
    if (!$isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$ || !Array.isArray($isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$) || 0 == $isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$.length) {
      return "for v2 allowedPaymentMethods must be set to an array containing a list of accepted payment methods";
    }
    for (var $i$jscomp$370$$ = 0; $i$jscomp$370$$ < $isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$.length; $i$jscomp$370$$++) {
      var $allowedAuthMethods$jscomp$2_allowedPaymentMethod$$ = $isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$[$i$jscomp$370$$];
      if ("CARD" == $allowedAuthMethods$jscomp$2_allowedPaymentMethod$$.type) {
        if (!$allowedAuthMethods$jscomp$2_allowedPaymentMethod$$.parameters) {
          return "Field parameters must be setup in each allowedPaymentMethod";
        }
        var $allowedCardNetworks$$ = $allowedAuthMethods$jscomp$2_allowedPaymentMethod$$.parameters.allowedCardNetworks;
        if (!$allowedCardNetworks$$ || !Array.isArray($allowedCardNetworks$$) || 0 == $allowedCardNetworks$$.length) {
          return "allowedCardNetworks must be setup in parameters for type CARD";
        }
        $allowedAuthMethods$jscomp$2_allowedPaymentMethod$$ = $allowedAuthMethods$jscomp$2_allowedPaymentMethod$$.parameters.allowedAuthMethods;
        if (!$allowedAuthMethods$jscomp$2_allowedPaymentMethod$$ || !Array.isArray($allowedAuthMethods$jscomp$2_allowedPaymentMethod$$) || 0 == $allowedAuthMethods$jscomp$2_allowedPaymentMethod$$.length || !$allowedAuthMethods$jscomp$2_allowedPaymentMethod$$.every($isAuthMethodValid$$module$third_party$subscriptions_project$swg$$)) {
          return "allowedAuthMethods must be setup in parameters for type 'CARD'  and must contain 'CRYPTOGRAM_3DS' and/or 'PAN_ONLY'";
        }
      }
    }
  } else {
    if (!$isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$ || !Array.isArray($isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$) || 0 == $isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$.length || !$isReadyToPayRequest$jscomp$3$$.$allowedPaymentMethods$.every($isPaymentMethodValid$$module$third_party$subscriptions_project$swg$$)) {
      return "allowedPaymentMethods must be set to an array containing 'CARD' and/or 'TOKENIZED_CARD'!";
    }
  }
  return null;
}, $isPaymentMethodValid$$module$third_party$subscriptions_project$swg$$ = function($paymentMethod$$) {
  return Object.values($Constants$$module$third_party$subscriptions_project$swg$PaymentMethod$$).includes($paymentMethod$$);
}, $isAuthMethodValid$$module$third_party$subscriptions_project$swg$$ = function($authMethod$$) {
  return Object.values($Constants$$module$third_party$subscriptions_project$swg$AuthMethod$$).includes($authMethod$$);
}, $validatePaymentDataRequest$$module$third_party$subscriptions_project$swg$$ = function($paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$) {
  if (!$paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$) {
    return "paymentDataRequest must be set!";
  }
  if ($paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$swg$) {
    return ($paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$ = $paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$swg$) ? $paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$skuId$ && $paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$publicationId$ ? null : "Both skuId and publicationId must be provided" : "Swg parameters must be provided";
  }
  if ($paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$transactionInfo$) {
    if ($paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$transactionInfo$.$currencyCode$) {
      if (!$paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$transactionInfo$.$totalPriceStatus$ || !Object.values($Constants$$module$third_party$subscriptions_project$swg$TotalPriceStatus$$).includes($paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$transactionInfo$.$totalPriceStatus$)) {
        return "totalPriceStatus in transactionInfo must be set to one of NOT_CURRENTLY_KNOWN, ESTIMATED or FINAL!";
      }
      if ("NOT_CURRENTLY_KNOWN" !== $paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$transactionInfo$.$totalPriceStatus$ && !$paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.$transactionInfo$.$totalPrice$) {
        return "totalPrice in transactionInfo must be set when totalPriceStatus is ESTIMATED or FINAL!";
      }
    } else {
      return "currencyCode in transactionInfo must be set!";
    }
  } else {
    return "transactionInfo must be set!";
  }
  var $allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$ = $getUpiPaymentMethod$$module$third_party$subscriptions_project$swg$$($paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$);
  if ($allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$) {
    if (!$allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$.parameters) {
      return "parameters must be set in allowedPaymentMethod!";
    }
    $allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$ = $allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$.parameters;
    if ($allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$.payeeVpa) {
      if ($allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$.payeeName) {
        if ($allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$.referenceUrl) {
          if (!$allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$.mcc) {
            return "mcc in allowedPaymentMethod parameters must be set!";
          }
          if (!$allowedPaymentMethod$jscomp$1_parameters$jscomp$4$$.transactionReferenceId) {
            return "transactionReferenceId in allowedPaymentMethod parameters must be set!";
          }
        } else {
          return "referenceUrl in allowedPaymentMethod parameters must be set!";
        }
      } else {
        return "payeeName in allowedPaymentMethod parameters must be set!";
      }
    } else {
      return "payeeVpa in allowedPaymentMethod parameters must be set!";
    }
    if ("INR" !== $paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.transactionInfo.currencyCode) {
      return "currencyCode in transactionInfo must be set to INR!";
    }
    if ("FINAL" !== $paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.transactionInfo.totalPriceStatus) {
      return "totalPriceStatus in transactionInfo must be set to FINAL!";
    }
    if (!$paymentDataRequest$jscomp$3_swgParameters$jscomp$inline_4796$$.transactionInfo.transactionNote) {
      return "transactionNote in transactionInfo must be set!";
    }
  }
  return null;
}, $getUpiPaymentMethod$$module$third_party$subscriptions_project$swg$$ = function($request$jscomp$40$$) {
  return !$chromeSupportsPaymentRequest$$module$third_party$subscriptions_project$swg$$() || 2 > $request$jscomp$40$$.$apiVersion$ || !$request$jscomp$40$$.$allowedPaymentMethods$ ? null : $getAllowedPaymentMethodForType_$$module$third_party$subscriptions_project$swg$$($request$jscomp$40$$, "UPI");
}, $extractAllowedAuthMethodsForCards_$$module$third_party$subscriptions_project$swg$$ = function($allowedPaymentMethod$jscomp$2_isReadyToPayRequest$jscomp$4$$) {
  return $allowedPaymentMethod$jscomp$2_isReadyToPayRequest$jscomp$4$$.$allowedPaymentMethods$ && ($allowedPaymentMethod$jscomp$2_isReadyToPayRequest$jscomp$4$$ = $getAllowedPaymentMethodForType_$$module$third_party$subscriptions_project$swg$$($allowedPaymentMethod$jscomp$2_isReadyToPayRequest$jscomp$4$$, "CARD")) && $allowedPaymentMethod$jscomp$2_isReadyToPayRequest$jscomp$4$$.parameters ? $allowedPaymentMethod$jscomp$2_isReadyToPayRequest$jscomp$4$$.parameters.allowedAuthMethods : null;
}, $getAllowedPaymentMethodForType_$$module$third_party$subscriptions_project$swg$$ = function($isReadyToPayRequest$jscomp$5$$, $paymentMethodType$$) {
  for (var $i$jscomp$371$$ = 0; $i$jscomp$371$$ < $isReadyToPayRequest$jscomp$5$$.$allowedPaymentMethods$.length; $i$jscomp$371$$++) {
    var $allowedPaymentMethod$jscomp$3$$ = $isReadyToPayRequest$jscomp$5$$.$allowedPaymentMethods$[$i$jscomp$371$$];
    if ($allowedPaymentMethod$jscomp$3$$.type == $paymentMethodType$$) {
      return $allowedPaymentMethod$jscomp$3$$;
    }
  }
  return null;
}, $PaymentsWebActivityDelegate$$module$third_party$subscriptions_project$swg$$ = function($environment$jscomp$2$$, $opt_activities$$, $opt_redirectKey$$) {
  this.$D$ = $environment$jscomp$2$$;
  this.$activities$ = $opt_activities$$ || new $ActivityPorts$$module$third_party$subscriptions_project$swg$$(window);
  this.$G$ = new $Graypane$1$$module$third_party$subscriptions_project$swg$$;
  this.$F$ = null;
  this.$I$ = $opt_redirectKey$$ || null;
}, $JSCompiler_StaticMethods_fetchRedirectResponse_$$ = function($JSCompiler_StaticMethods_fetchRedirectResponse_$self$$, $redirectEncryptedCallbackData$$) {
  return new window.Promise(function($resolve$jscomp$90$$, $reject$jscomp$30$$) {
    var $url$jscomp$228$$ = $JSCompiler_StaticMethods_getDecryptionUrl_$$($JSCompiler_StaticMethods_fetchRedirectResponse_$self$$), $xhr$jscomp$17$$ = new window.XMLHttpRequest;
    $xhr$jscomp$17$$.open("POST", $url$jscomp$228$$, !0);
    "withCredentials" in $xhr$jscomp$17$$ && ($xhr$jscomp$17$$.withCredentials = !0);
    $xhr$jscomp$17$$.onreadystatechange = function() {
      if (!(2 > $xhr$jscomp$17$$.readyState)) {
        if (100 > $xhr$jscomp$17$$.status || 599 < $xhr$jscomp$17$$.status) {
          $xhr$jscomp$17$$.onreadystatechange = null, $reject$jscomp$30$$(Error("Unknown HTTP status " + $xhr$jscomp$17$$.status));
        } else {
          if (4 == $xhr$jscomp$17$$.readyState) {
            try {
              $resolve$jscomp$90$$(JSON.parse($xhr$jscomp$17$$.responseText));
            } catch ($e$346$$) {
              $reject$jscomp$30$$($e$346$$);
            }
          }
        }
      }
    };
    $xhr$jscomp$17$$.onerror = function() {
      $reject$jscomp$30$$(Error("Network failure"));
    };
    $xhr$jscomp$17$$.onabort = function() {
      $reject$jscomp$30$$(Error("Request aborted"));
    };
    $xhr$jscomp$17$$.send($redirectEncryptedCallbackData$$);
  });
}, $JSCompiler_StaticMethods_getOrigin_$$ = function($JSCompiler_StaticMethods_getOrigin_$self$$) {
  return "LOCAL" == $JSCompiler_StaticMethods_getOrigin_$self$$.$D$ ? "" : "https://" + ("PREPROD" == $JSCompiler_StaticMethods_getOrigin_$self$$.$D$ ? "pay-preprod.sandbox" : "SANDBOX" == $JSCompiler_StaticMethods_getOrigin_$self$$.$D$ ? "pay.sandbox" : "pay") + ".google.com";
}, $JSCompiler_StaticMethods_getDecryptionUrl_$$ = function($JSCompiler_StaticMethods_getDecryptionUrl_$self$$) {
  var $url$jscomp$229$$ = $JSCompiler_StaticMethods_getOrigin_$$($JSCompiler_StaticMethods_getDecryptionUrl_$self$$) + "/gp/p/apis/buyflow/process";
  $JSCompiler_StaticMethods_getDecryptionUrl_$self$$.$I$ && ($url$jscomp$229$$ += "?rk=" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_getDecryptionUrl_$self$$.$I$));
  return $url$jscomp$229$$;
}, $UpiHandler$$module$third_party$subscriptions_project$swg$$ = function() {
}, $JSCompiler_StaticMethods_showUi_$$ = function($request$jscomp$44$$) {
  return $request$jscomp$44$$.show().then(function($request$jscomp$44$$) {
    $request$jscomp$44$$.complete("success");
    return $request$jscomp$44$$.details;
  });
}, $JSCompiler_StaticMethods_checkCanMakePayment_$$ = function($request$jscomp$45$$) {
  var $cacheResult$$ = window.sessionStorage.getItem("google.payments.api.storage.upi.canMakePaymentCache");
  return $cacheResult$$ ? window.Promise.resolve("true" === $cacheResult$$) : $request$jscomp$45$$.$canMakePayment$ ? $request$jscomp$45$$.$canMakePayment$().then(function($request$jscomp$45$$) {
    $request$jscomp$45$$ && window.sessionStorage.setItem("google.payments.api.storage.upi.canMakePaymentCache", $request$jscomp$45$$.toString());
    return $request$jscomp$45$$;
  }) : window.Promise.resolve(!0);
}, $createGoogleTransactionId$$module$third_party$subscriptions_project$swg$$ = function($environment$jscomp$4$$) {
  for (var $uuid$jscomp$inline_4811$$ = Array(36), $rnd$jscomp$inline_4812$$ = 0, $r$jscomp$inline_4813$$, $i$jscomp$inline_4814$$ = 0; 36 > $i$jscomp$inline_4814$$; $i$jscomp$inline_4814$$++) {
    8 == $i$jscomp$inline_4814$$ || 13 == $i$jscomp$inline_4814$$ || 18 == $i$jscomp$inline_4814$$ || 23 == $i$jscomp$inline_4814$$ ? $uuid$jscomp$inline_4811$$[$i$jscomp$inline_4814$$] = "-" : 14 == $i$jscomp$inline_4814$$ ? $uuid$jscomp$inline_4811$$[$i$jscomp$inline_4814$$] = "4" : (2 >= $rnd$jscomp$inline_4812$$ && ($rnd$jscomp$inline_4812$$ = 33554432 + 16777216 * Math.random() | 0), $r$jscomp$inline_4813$$ = $rnd$jscomp$inline_4812$$ & 15, $rnd$jscomp$inline_4812$$ >>= 4, $uuid$jscomp$inline_4811$$[$i$jscomp$inline_4814$$] = 
    $CHARS$$module$third_party$subscriptions_project$swg$$[19 == $i$jscomp$inline_4814$$ ? $r$jscomp$inline_4813$$ & 3 | 8 : $r$jscomp$inline_4813$$]);
  }
  return $uuid$jscomp$inline_4811$$.join("") + "." + $environment$jscomp$4$$;
}, $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$$ = function($paymentOptions$jscomp$1_paymentRequestSupported$$, $onPaymentResponse$$, $opt_activities$jscomp$1$$) {
  this.$K$ = $onPaymentResponse$$;
  $validatePaymentOptions$$module$third_party$subscriptions_project$swg$$($paymentOptions$jscomp$1_paymentRequestSupported$$);
  this.$J$ = null;
  this.$G$ = $paymentOptions$jscomp$1_paymentRequestSupported$$.$environment$ || "TEST";
  $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$googleTransactionId_$$ || ($PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$googleTransactionId_$$ = -1 != $TRUSTED_DOMAINS$$module$third_party$subscriptions_project$swg$$.indexOf(window.location.hostname) && $paymentOptions$jscomp$1_paymentRequestSupported$$.i && $paymentOptions$jscomp$1_paymentRequestSupported$$.i.googleTransactionId ? $paymentOptions$jscomp$1_paymentRequestSupported$$.i.googleTransactionId : 
  $createGoogleTransactionId$$module$third_party$subscriptions_project$swg$$(this.$G$));
  this.$P$ = $paymentOptions$jscomp$1_paymentRequestSupported$$;
  this.$D$ = new $PaymentsWebActivityDelegate$$module$third_party$subscriptions_project$swg$$(this.$G$, $opt_activities$jscomp$1$$, $paymentOptions$jscomp$1_paymentRequestSupported$$.i && $paymentOptions$jscomp$1_paymentRequestSupported$$.i.redirectKey);
  this.$F$ = ($paymentOptions$jscomp$1_paymentRequestSupported$$ = $chromeSupportsPaymentRequest$$module$third_party$subscriptions_project$swg$$()) ? new $PaymentsRequestDelegate$$module$third_party$subscriptions_project$swg$$(this.$G$) : this.$D$;
  this.$O$ = new $UpiHandler$$module$third_party$subscriptions_project$swg$$;
  this.$D$.$onResult$(this.$I$.bind(this));
  this.$F$.$onResult$(this.$I$.bind(this));
  $paymentOptions$jscomp$1_paymentRequestSupported$$ && ($buyFlowActivityMode$$module$third_party$subscriptions_project$swg$$ = 4);
  $googleTransactionId$$module$third_party$subscriptions_project$swg$$ = $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$googleTransactionId_$$;
  $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:9, clientLatencyStartMs:Date.now()});
  window.addEventListener("message", function($paymentOptions$jscomp$1_paymentRequestSupported$$) {
    -1 != $TRUSTED_DOMAINS$$module$third_party$subscriptions_project$swg$$.indexOf(window.location.hostname) && "logPaymentData" === $paymentOptions$jscomp$1_paymentRequestSupported$$.data.name && $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$($paymentOptions$jscomp$1_paymentRequestSupported$$.data.data);
  });
}, $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$$ = function($JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$, $isReadyToPayRequest$jscomp$8$$) {
  if ($getUpiPaymentMethod$$module$third_party$subscriptions_project$swg$$($isReadyToPayRequest$jscomp$8$$)) {
    return $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$.$O$.$isReadyToPay$($isReadyToPayRequest$jscomp$8$$);
  }
  if ($chromeSupportsPaymentRequest$$module$third_party$subscriptions_project$swg$$() && !$isNativeDisabledInRequest$$module$third_party$subscriptions_project$swg$$($isReadyToPayRequest$jscomp$8$$)) {
    if (2 <= $isReadyToPayRequest$jscomp$8$$.$apiVersion$) {
      return $JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$$($JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$, $isReadyToPayRequest$jscomp$8$$);
    }
    var $webPromise$347$$ = $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$.$D$.$isReadyToPay$($isReadyToPayRequest$jscomp$8$$);
    $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$ = $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$.$F$.$isReadyToPay$($isReadyToPayRequest$jscomp$8$$);
    return $doesMerchantSupportOnlyTokenizedCards$$module$third_party$subscriptions_project$swg$$($isReadyToPayRequest$jscomp$8$$) ? $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$ : $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$.then(function() {
      return $webPromise$347$$;
    });
  }
  return $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$self_nativePromise$$.$D$.$isReadyToPay$($isReadyToPayRequest$jscomp$8$$);
}, $JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$$ = function($JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$self$$, $isReadyToPayRequest$jscomp$9$$) {
  var $defaultPromise$$ = window.Promise.resolve({result:!1});
  $isReadyToPayRequest$jscomp$9$$.$existingPaymentMethodRequired$ && ($defaultPromise$$ = window.Promise.resolve({result:!1, paymentMethodPresent:!1}));
  var $nativePromise$jscomp$1_nativeRtpRequest$$ = $defaultPromise$$;
  if ($apiV2DoesMerchantSupportSpecifiedCardType$$module$third_party$subscriptions_project$swg$$($isReadyToPayRequest$jscomp$9$$, "CRYPTOGRAM_3DS")) {
    $nativePromise$jscomp$1_nativeRtpRequest$$ = JSON.parse(JSON.stringify($isReadyToPayRequest$jscomp$9$$));
    for (var $i$jscomp$374$$ = 0; $i$jscomp$374$$ < $nativePromise$jscomp$1_nativeRtpRequest$$.$allowedPaymentMethods$.length; $i$jscomp$374$$++) {
      "CARD" == $nativePromise$jscomp$1_nativeRtpRequest$$.$allowedPaymentMethods$[$i$jscomp$374$$].type && ($nativePromise$jscomp$1_nativeRtpRequest$$.$allowedPaymentMethods$[$i$jscomp$374$$].parameters.allowedAuthMethods = ["CRYPTOGRAM_3DS"]);
    }
    $nativePromise$jscomp$1_nativeRtpRequest$$ = $JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$self$$.$F$.$isReadyToPay$($nativePromise$jscomp$1_nativeRtpRequest$$);
  }
  var $webPromise$jscomp$1$$ = $defaultPromise$$;
  $apiV2DoesMerchantSupportSpecifiedCardType$$module$third_party$subscriptions_project$swg$$($isReadyToPayRequest$jscomp$9$$, "PAN_ONLY") && ($webPromise$jscomp$1$$ = $JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$self$$.$D$.$isReadyToPay$($isReadyToPayRequest$jscomp$9$$));
  return $nativePromise$jscomp$1_nativeRtpRequest$$.then(function($JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$self$$) {
    return 1 == ($JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$self$$ && $JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$self$$.result) ? $JSCompiler_StaticMethods_isReadyToPayApiV2ForChromePaymentRequest_$self$$ : $webPromise$jscomp$1$$;
  });
}, $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$logDevErrorToConsole_$$ = function($apiName$$, $errorMessage$jscomp$4$$) {
  window.console.error("DEVELOPER_ERROR in " + $apiName$$ + " : " + $errorMessage$jscomp$4$$);
}, $JSCompiler_StaticMethods_assignInternalParams_$$ = function($paymentDataRequest$jscomp$15$$) {
  var $internalParam$$ = {startTimeMs:Date.now(), googleTransactionId:$PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$googleTransactionId_$$};
  $paymentDataRequest$jscomp$15$$.i = $paymentDataRequest$jscomp$15$$.i ? Object.assign($internalParam$$, $paymentDataRequest$jscomp$15$$.i) : $internalParam$$;
}, $isNativeDisabledInRequest$$module$third_party$subscriptions_project$swg$$ = function($request$jscomp$46$$) {
  return !0 === ($request$jscomp$46$$.i && $request$jscomp$46$$.i.disableNative);
}, $getExperiments$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$462$$) {
  if (!$experimentMap$$module$third_party$subscriptions_project$swg$$) {
    $experimentMap$$module$third_party$subscriptions_project$swg$$ = {};
    var $combinedExperimentString$$ = "";
    try {
      var $experimentStringFromHash$$ = $parseQueryString$1$$module$third_party$subscriptions_project$swg$$($win$jscomp$462$$.location.hash)["swg.experiments"];
      $experimentStringFromHash$$ && ($combinedExperimentString$$ += "," + $experimentStringFromHash$$);
    } catch ($e$348$$) {
      $ErrorUtils$$module$third_party$subscriptions_project$swg$throwAsync$$($e$348$$);
    }
    $combinedExperimentString$$.split(",").forEach(function($combinedExperimentString$$) {
      if ($combinedExperimentString$$ = $combinedExperimentString$$.trim()) {
        try {
          var $experimentStringFromHash$$ = $combinedExperimentString$$;
          $combinedExperimentString$$ = $experimentMap$$module$third_party$subscriptions_project$swg$$;
          var $experimentMap$jscomp$inline_4825_s$jscomp$51$$ = !1, $eq$jscomp$inline_4829_storageKey$jscomp$inline_4831$$ = $experimentStringFromHash$$.indexOf(":");
          if (-1 == $eq$jscomp$inline_4829_storageKey$jscomp$inline_4831$$) {
            var $experimentId$jscomp$inline_4826$$ = $experimentStringFromHash$$;
            var $fraction$jscomp$inline_4827$$ = 100;
            $experimentMap$jscomp$inline_4825_s$jscomp$51$$ = !1;
          } else {
            $experimentId$jscomp$inline_4826$$ = $experimentStringFromHash$$.substring(0, $eq$jscomp$inline_4829_storageKey$jscomp$inline_4831$$).trim(), $experimentStringFromHash$$ = $experimentStringFromHash$$.substring($eq$jscomp$inline_4829_storageKey$jscomp$inline_4831$$ + 1), "c" == $experimentStringFromHash$$.substring($experimentStringFromHash$$.length - 1) && ($experimentMap$jscomp$inline_4825_s$jscomp$51$$ = !0, $experimentStringFromHash$$ = $experimentStringFromHash$$.substring(0, $experimentStringFromHash$$.length - 
            1)), $fraction$jscomp$inline_4827$$ = (0,window.parseInt)($experimentStringFromHash$$, 10);
          }
          if ((0,window.isNaN)($fraction$jscomp$inline_4827$$)) {
            throw Error("invalid fraction");
          }
          if (99 < $fraction$jscomp$inline_4827$$) {
            var $on$jscomp$inline_4830$$ = !0;
          } else {
            if (1 > $fraction$jscomp$inline_4827$$) {
              $on$jscomp$inline_4830$$ = !1;
            } else {
              if ($win$jscomp$462$$.sessionStorage) {
                $experimentMap$jscomp$inline_4825_s$jscomp$51$$ = $experimentMap$jscomp$inline_4825_s$jscomp$51$$ && 20 >= $fraction$jscomp$inline_4827$$;
                try {
                  $eq$jscomp$inline_4829_storageKey$jscomp$inline_4831$$ = "subscribe.google.com:e:" + $experimentId$jscomp$inline_4826$$ + ":" + $fraction$jscomp$inline_4827$$ + ($experimentMap$jscomp$inline_4825_s$jscomp$51$$ ? "c" : "");
                  var $s$jscomp$inline_6517$$ = $win$jscomp$462$$.sessionStorage.getItem($eq$jscomp$inline_4829_storageKey$jscomp$inline_4831$$);
                  var $selection$jscomp$inline_4832$$ = "e" == $s$jscomp$inline_6517$$ ? "e" : "c" == $s$jscomp$inline_6517$$ ? "c" : null;
                  !$selection$jscomp$inline_4832$$ && 100 * $win$jscomp$462$$.Math.random() <= $fraction$jscomp$inline_4827$$ * ($experimentMap$jscomp$inline_4825_s$jscomp$51$$ ? 2 : 1) && ($selection$jscomp$inline_4832$$ = ($experimentMap$jscomp$inline_4825_s$jscomp$51$$ ? 0.5 >= $win$jscomp$462$$.Math.random() : 1) ? "e" : "c", $win$jscomp$462$$.sessionStorage.setItem($eq$jscomp$inline_4829_storageKey$jscomp$inline_4831$$, $selection$jscomp$inline_4832$$));
                  $on$jscomp$inline_4830$$ = !!$selection$jscomp$inline_4832$$;
                  "c" == $selection$jscomp$inline_4832$$ && ($experimentId$jscomp$inline_4826$$ = "c-" + $experimentId$jscomp$inline_4826$$);
                } catch ($e$350$jscomp$inline_4833$$) {
                  $on$jscomp$inline_4830$$ = !1, $ErrorUtils$$module$third_party$subscriptions_project$swg$throwAsync$$($e$350$jscomp$inline_4833$$);
                }
              } else {
                $on$jscomp$inline_4830$$ = !1;
              }
            }
          }
          $combinedExperimentString$$[$experimentId$jscomp$inline_4826$$] = $on$jscomp$inline_4830$$;
        } catch ($e$349$$) {
          $ErrorUtils$$module$third_party$subscriptions_project$swg$throwAsync$$($e$349$$);
        }
      }
    });
  }
  return $experimentMap$$module$third_party$subscriptions_project$swg$$;
}, $payUrl$$module$third_party$subscriptions_project$swg$$ = function() {
  return $addQueryParam$$module$third_party$subscriptions_project$swg$$($PAY_ORIGIN$$module$third_party$subscriptions_project$swg$$.PRODUCTION + "/gp/p/ui/pay");
}, $PayClient$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$467$$, $activityPorts$jscomp$1$$, $dialogManager$$) {
  this.$D$ = $getExperiments$$module$third_party$subscriptions_project$swg$$($win$jscomp$467$$)["gpay-api"] ? new $PayClientBindingPayjs$$module$third_party$subscriptions_project$swg$$($win$jscomp$467$$, $activityPorts$jscomp$1$$) : new $PayClientBindingSwg$$module$third_party$subscriptions_project$swg$$($win$jscomp$467$$, $activityPorts$jscomp$1$$, $dialogManager$$);
}, $PayClientBindingSwg$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$468$$, $activityPorts$jscomp$2$$, $dialogManager$jscomp$1$$) {
  this.$G$ = $win$jscomp$468$$;
  this.$D$ = $activityPorts$jscomp$2$$;
  this.$F$ = $dialogManager$jscomp$1$$;
}, $JSCompiler_StaticMethods_validatePayResponse_$$ = function($JSCompiler_StaticMethods_validatePayResponse_$self$$, $port$jscomp$26$$) {
  return $port$jscomp$26$$.$acceptResult$().then(function($port$jscomp$26$$) {
    if ($port$jscomp$26$$.origin != $PAY_ORIGIN$$module$third_party$subscriptions_project$swg$$.PRODUCTION) {
      throw Error("channel mismatch");
    }
    var $result$jscomp$81$$ = $port$jscomp$26$$.data;
    if ($result$jscomp$81$$.redirectEncryptedCallbackData) {
      return (new $Xhr$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_validatePayResponse_$self$$.$G$)).fetch($PAY_ORIGIN$$module$third_party$subscriptions_project$swg$$.PRODUCTION + "/gp/p/apis/buyflow/process", {method:"post", headers:{Accept:"text/plain, application/json"}, credentials:"include", body:$result$jscomp$81$$.redirectEncryptedCallbackData, mode:"cors"}).then(function($JSCompiler_StaticMethods_validatePayResponse_$self$$) {
        return $JSCompiler_StaticMethods_validatePayResponse_$self$$.json();
      }).then(function($JSCompiler_StaticMethods_validatePayResponse_$self$$) {
        var $port$jscomp$26$$ = Object.assign({}, $result$jscomp$81$$);
        delete $port$jscomp$26$$.redirectEncryptedCallbackData;
        return Object.assign($port$jscomp$26$$, $JSCompiler_StaticMethods_validatePayResponse_$self$$);
      });
    }
    if ($port$jscomp$26$$.$originVerified$ && $port$jscomp$26$$.$secureChannel$) {
      return $result$jscomp$81$$;
    }
    throw Error("channel mismatch");
  });
}, $PayClientBindingPayjs$$module$third_party$subscriptions_project$swg$$ = function($JSCompiler_StaticMethods_restoreKey$self$jscomp$inline_4835_handler$jscomp$inline_4840_win$jscomp$469$$, $activityPorts$jscomp$3$$) {
  this.$D$ = $JSCompiler_StaticMethods_restoreKey$self$jscomp$inline_4835_handler$jscomp$inline_4840_win$jscomp$469$$;
  this.$J$ = $activityPorts$jscomp$3$$;
  this.$F$ = this.$I$ = null;
  this.$G$ = new $RedirectVerifierHelper$$module$third_party$subscriptions_project$swg$$(this.$D$);
  $JSCompiler_StaticMethods_restoreKey$self$jscomp$inline_4835_handler$jscomp$inline_4840_win$jscomp$469$$ = this.$G$;
  try {
    var $JSCompiler_inline_result$jscomp$997_options$jscomp$inline_4839$$ = $JSCompiler_StaticMethods_restoreKey$self$jscomp$inline_4835_handler$jscomp$inline_4840_win$jscomp$469$$.$D$.localStorage && $JSCompiler_StaticMethods_restoreKey$self$jscomp$inline_4835_handler$jscomp$inline_4840_win$jscomp$469$$.$D$.localStorage.getItem("subscribe.google.com:rk") || null;
  } catch ($e$352$jscomp$inline_4836$$) {
    $JSCompiler_inline_result$jscomp$997_options$jscomp$inline_4839$$ = null;
  }
  $JSCompiler_inline_result$jscomp$997_options$jscomp$inline_4839$$ = {$environment$:"PRODUCTION", i:{redirectKey:$JSCompiler_inline_result$jscomp$997_options$jscomp$inline_4839$$}};
  $JSCompiler_StaticMethods_restoreKey$self$jscomp$inline_4835_handler$jscomp$inline_4840_win$jscomp$469$$ = this.$K$.bind(this);
  this.$O$ = new $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$$($JSCompiler_inline_result$jscomp$997_options$jscomp$inline_4839$$, $JSCompiler_StaticMethods_restoreKey$self$jscomp$inline_4835_handler$jscomp$inline_4840_win$jscomp$469$$, this.$J$);
  $JSCompiler_StaticMethods_prepare$$(this.$G$);
}, $JSCompiler_StaticMethods_convertResponse_$$ = function($JSCompiler_StaticMethods_convertResponse_$self$$, $response$jscomp$84$$) {
  return $response$jscomp$84$$.catch(function($response$jscomp$84$$) {
    return "object" == typeof $response$jscomp$84$$ && "CANCELED" == $response$jscomp$84$$.statusCode ? window.Promise.reject($createAbortError$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_convertResponse_$self$$.$D$, void 0)) : window.Promise.reject($response$jscomp$84$$);
  });
}, $RedirectVerifierHelper$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$470$$) {
  this.$D$ = $win$jscomp$470$$;
  this.$F$ = !1;
  this.$G$ = this.$I$ = null;
}, $JSCompiler_StaticMethods_prepare$$ = function($JSCompiler_StaticMethods_prepare$self$$) {
  $JSCompiler_StaticMethods_getOrCreatePair_$$($JSCompiler_StaticMethods_prepare$self$$, function() {
  });
}, $JSCompiler_StaticMethods_useVerifier$$ = function($JSCompiler_StaticMethods_useVerifier$self$$, $callback$jscomp$154$$) {
  $JSCompiler_StaticMethods_getOrCreatePair_$$($JSCompiler_StaticMethods_useVerifier$self$$, function($pair$jscomp$3$$) {
    if ($pair$jscomp$3$$) {
      try {
        $JSCompiler_StaticMethods_useVerifier$self$$.$D$.localStorage.setItem("subscribe.google.com:rk", $pair$jscomp$3$$.key);
      } catch ($e$351$$) {
        $pair$jscomp$3$$ = null;
      }
    }
    $callback$jscomp$154$$($pair$jscomp$3$$ && $pair$jscomp$3$$.$verifier$ || null);
  });
}, $JSCompiler_StaticMethods_getOrCreatePair_$$ = function($JSCompiler_StaticMethods_getOrCreatePair_$self$$, $callback$jscomp$155$$) {
  $JSCompiler_StaticMethods_createPair_$$($JSCompiler_StaticMethods_getOrCreatePair_$self$$);
  $JSCompiler_StaticMethods_getOrCreatePair_$self$$.$F$ ? $callback$jscomp$155$$($JSCompiler_StaticMethods_getOrCreatePair_$self$$.$I$) : $JSCompiler_StaticMethods_getOrCreatePair_$self$$.$G$ && $JSCompiler_StaticMethods_getOrCreatePair_$self$$.$G$.then(function($JSCompiler_StaticMethods_getOrCreatePair_$self$$) {
    return $callback$jscomp$155$$($JSCompiler_StaticMethods_getOrCreatePair_$self$$);
  });
}, $JSCompiler_StaticMethods_createPair_$$ = function($JSCompiler_StaticMethods_createPair_$self$$) {
  if (!$JSCompiler_StaticMethods_createPair_$self$$.$F$ && !$JSCompiler_StaticMethods_createPair_$self$$.$G$) {
    var $crypto$jscomp$2$$ = $JSCompiler_StaticMethods_createPair_$self$$.$D$.crypto;
    $JSCompiler_StaticMethods_createPair_$self$$.$D$.localStorage && $crypto$jscomp$2$$ && $crypto$jscomp$2$$.getRandomValues && $crypto$jscomp$2$$.subtle && $crypto$jscomp$2$$.subtle.digest ? $JSCompiler_StaticMethods_createPair_$self$$.$G$ = (new window.Promise(function($JSCompiler_StaticMethods_createPair_$self$$, $reject$jscomp$34$$) {
      var $resolve$jscomp$94$$ = new window.Uint8Array(16);
      $crypto$jscomp$2$$.getRandomValues($resolve$jscomp$94$$);
      var $key$jscomp$156$$ = (0,window.btoa)($bytesToString$$module$third_party$subscriptions_project$swg$$($resolve$jscomp$94$$));
      $crypto$jscomp$2$$.subtle.digest({name:"SHA-384"}, $stringToBytes$$module$third_party$subscriptions_project$swg$$($key$jscomp$156$$)).then(function($crypto$jscomp$2$$) {
        $crypto$jscomp$2$$ = (0,window.btoa)($bytesToString$$module$third_party$subscriptions_project$swg$$(new window.Uint8Array($crypto$jscomp$2$$)));
        $JSCompiler_StaticMethods_createPair_$self$$({key:$key$jscomp$156$$, $verifier$:$crypto$jscomp$2$$});
      }, function($JSCompiler_StaticMethods_createPair_$self$$) {
        $reject$jscomp$34$$($JSCompiler_StaticMethods_createPair_$self$$);
      });
    })).catch(function() {
      return null;
    }).then(function($crypto$jscomp$2$$) {
      $JSCompiler_StaticMethods_createPair_$self$$.$F$ = !0;
      return $JSCompiler_StaticMethods_createPair_$self$$.$I$ = $crypto$jscomp$2$$;
    }) : ($JSCompiler_StaticMethods_createPair_$self$$.$F$ = !0, $JSCompiler_StaticMethods_createPair_$self$$.$I$ = null);
  }
}, $setInternalParam$$module$third_party$subscriptions_project$swg$$ = function($paymentRequest$jscomp$5$$, $param$jscomp$26$$, $value$jscomp$309$$) {
  var $$jscomp$compprop107$$ = {};
  $paymentRequest$jscomp$5$$.i = Object.assign($paymentRequest$jscomp$5$$.i || {}, ($$jscomp$compprop107$$[$param$jscomp$26$$] = $value$jscomp$309$$, $$jscomp$compprop107$$));
}, $OffersFlow$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$16$$, $options$jscomp$65$$) {
  this.$D$ = $deps$jscomp$16$$;
  this.$J$ = $deps$jscomp$16$$.$win$();
  this.$G$ = $deps$jscomp$16$$.$activities$();
  this.$I$ = $deps$jscomp$16$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$;
  var $isClosable$$ = $options$jscomp$65$$ && $options$jscomp$65$$.$isClosable$;
  void 0 == $isClosable$$ && ($isClosable$$ = !1);
  this.$F$ = new $ActivityIframeView$$module$third_party$subscriptions_project$swg$$(this.$J$, this.$G$, $feUrl$$module$third_party$subscriptions_project$swg$$("/offersiframe"), $feArgs$$module$third_party$subscriptions_project$swg$$({productId:$deps$jscomp$16$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$productId_$, publicationId:$deps$jscomp$16$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$, 
  showNative:!!$deps$jscomp$16$$.$callbacks_$.$callbacks_$[2], list:$options$jscomp$65$$ && $options$jscomp$65$$.list || "default", skus:$options$jscomp$65$$ && $options$jscomp$65$$.$skus$ || null, isClosable:$isClosable$$}), !0);
}, $AbbrvOfferFlow$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$18$$, $options$jscomp$68$$) {
  $options$jscomp$68$$ = void 0 === $options$jscomp$68$$ ? {} : $options$jscomp$68$$;
  this.$F$ = $deps$jscomp$18$$;
  this.$J$ = $options$jscomp$68$$;
  this.$K$ = $deps$jscomp$18$$.$win$();
  this.$I$ = $deps$jscomp$18$$.$activities$();
  this.$G$ = $deps$jscomp$18$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$;
  this.$D$ = new $ActivityIframeView$$module$third_party$subscriptions_project$swg$$(this.$K$, this.$I$, $feUrl$$module$third_party$subscriptions_project$swg$$("/abbrvofferiframe"), $feArgs$$module$third_party$subscriptions_project$swg$$({publicationId:$deps$jscomp$18$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$, productId:$deps$jscomp$18$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$productId_$, 
  showNative:!!$deps$jscomp$18$$.$callbacks_$.$callbacks_$[2], list:$options$jscomp$68$$ && $options$jscomp$68$$.list || "default", skus:$options$jscomp$68$$ && $options$jscomp$68$$.$skus$ || null, isClosable:!0}), !1);
}, $Preconnect$$module$third_party$subscriptions_project$swg$$ = function($doc$jscomp$159$$) {
  this.$doc_$ = $doc$jscomp$159$$;
}, $JSCompiler_StaticMethods_pre_$$ = function($JSCompiler_StaticMethods_pre_$self$$, $linkEl$jscomp$2_url$jscomp$236$$, $rel$jscomp$2$$, $opt_as$$) {
  $linkEl$jscomp$2_url$jscomp$236$$ = $createElement$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_pre_$self$$.$doc_$, "link", {rel:$rel$jscomp$2$$, href:$linkEl$jscomp$2_url$jscomp$236$$});
  $opt_as$$ && $linkEl$jscomp$2_url$jscomp$236$$.setAttribute("as", $opt_as$$);
  $JSCompiler_StaticMethods_pre_$self$$.$doc_$.head.appendChild($linkEl$jscomp$2_url$jscomp$236$$);
}, $Storage$$module$third_party$subscriptions_project$swg$$ = function($win$jscomp$471$$) {
  this.$D$ = $win$jscomp$471$$;
  this.$F$ = {};
}, $storageKey$$module$third_party$subscriptions_project$swg$$ = function($key$jscomp$160$$) {
  return "subscribe.google.com:" + $key$jscomp$160$$;
}, $uuidFast$$module$third_party$subscriptions_project$swg$$ = function() {
  for (var $uuid$jscomp$2$$ = Array(36), $rnd$jscomp$1$$ = 0, $r$jscomp$46$$, $i$356$$ = 0; 36 > $i$356$$; $i$356$$++) {
    8 === $i$356$$ || 13 === $i$356$$ || 18 === $i$356$$ || 23 === $i$356$$ ? $uuid$jscomp$2$$[$i$356$$] = "-" : 14 === $i$356$$ ? $uuid$jscomp$2$$[$i$356$$] = "4" : (2 >= $rnd$jscomp$1$$ && ($rnd$jscomp$1$$ = 33554432 + 16777216 * Math.random() | 0), $r$jscomp$46$$ = $rnd$jscomp$1$$ & 15, $rnd$jscomp$1$$ >>= 4, $uuid$jscomp$2$$[$i$356$$] = $CHARS$1$$module$third_party$subscriptions_project$swg$$[19 == $i$356$$ ? $r$jscomp$46$$ & 3 | 8 : $r$jscomp$46$$]);
  }
  return $uuid$jscomp$2$$.join("");
}, $AnalyticsService$$module$third_party$subscriptions_project$swg$$ = function($deps$jscomp$19$$) {
  this.$doc_$ = $deps$jscomp$19$$.$doc_$;
  $deps$jscomp$19$$.$activities$();
  this.$iframe_$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$.$getWin$().document, "iframe", {});
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$(this.$iframe_$, $iframeStyles$$module$third_party$subscriptions_project$swg$$);
  this.$src_$ = $feUrl$$module$third_party$subscriptions_project$swg$$("/serviceiframe");
  this.$G$ = $deps$jscomp$19$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$;
  this.$F$ = $feArgs$$module$third_party$subscriptions_project$swg$$({$publicationId$:this.$G$});
  this.$context_$ = new $AnalyticsContext$$module$third_party$subscriptions_project$swg$$;
  this.$context_$.$setTransactionId$($uuidFast$$module$third_party$subscriptions_project$swg$$());
  this.$D$ = null;
}, $JSCompiler_StaticMethods_addLabels$$ = function($JSCompiler_StaticMethods_addLabels$self$$, $labels$$) {
  if ($labels$$ && 0 < $labels$$.length) {
    var $newLabels$$ = [].concat($JSCompiler_StaticMethods_addLabels$self$$.$context_$.$label_$);
    $labels$$.forEach(function($JSCompiler_StaticMethods_addLabels$self$$) {
      -1 == $newLabels$$.indexOf($JSCompiler_StaticMethods_addLabels$self$$) && $newLabels$$.push($JSCompiler_StaticMethods_addLabels$self$$);
    });
    $JSCompiler_StaticMethods_addLabels$self$$.$context_$.$label_$ = $newLabels$$;
  }
}, $JSCompiler_StaticMethods_setContext_$$ = function($JSCompiler_StaticMethods_setContext_$self$$) {
  var $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$ = $parseQueryString$1$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_setContext_$self$$.$doc_$.$getWin$().location.search), $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$ = $parseUrl$1$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_setContext_$self$$.$doc_$.$getWin$().document.referrer).origin;
  $JSCompiler_StaticMethods_setContext_$self$$.$context_$.$I$ = $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$;
  $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$ = $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$.utm_campaign;
  var $experiments$jscomp$inline_4869_medium$$ = $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$.utm_medium;
  $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$ = $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$.utm_source;
  $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$ && ($JSCompiler_StaticMethods_setContext_$self$$.$context_$.$J$ = $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$);
  $experiments$jscomp$inline_4869_medium$$ && ($JSCompiler_StaticMethods_setContext_$self$$.$context_$.$K$ = $experiments$jscomp$inline_4869_medium$$);
  $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$ && ($JSCompiler_StaticMethods_setContext_$self$$.$context_$.$O$ = $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$);
  $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$ = $JSCompiler_StaticMethods_addLabels$$;
  $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$ = $getExperiments$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_setContext_$self$$.$doc_$.$getWin$());
  $experiments$jscomp$inline_4869_medium$$ = [];
  for (var $experiment$jscomp$inline_4870$$ in $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$) {
    $campaign_experimentMap$jscomp$inline_4868_value$jscomp$inline_4856$$[$experiment$jscomp$inline_4870$$] && $experiments$jscomp$inline_4869_medium$$.push($experiment$jscomp$inline_4870$$);
  }
  $JSCompiler_temp_const$jscomp$994_source$jscomp$52_utmParams$jscomp$1$$($JSCompiler_StaticMethods_setContext_$self$$, $experiments$jscomp$inline_4869_medium$$);
}, $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$$ = function($JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$) {
  $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$D$ || ($JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$doc_$.$getBody$().appendChild($JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$getElement$()), $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$D$ = 
  $JSCompiler_StaticMethods_openIframe$$($JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$iframe_$, $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$src_$, $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$F$).then(function($port$jscomp$27$$) {
    $JSCompiler_StaticMethods_setContext_$$($JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$);
    return $port$jscomp$27$$.$whenReady$().then(function() {
      return $port$jscomp$27$$;
    });
  }));
  return $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$self$$.$D$;
}, $JSCompiler_StaticMethods_createLogRequest_$$ = function($JSCompiler_StaticMethods_createLogRequest_$self$$, $event$jscomp$245$$) {
  var $request$jscomp$47$$ = new $AnalyticsRequest$$module$third_party$subscriptions_project$swg$$;
  $request$jscomp$47$$.$D$ = $event$jscomp$245$$;
  $request$jscomp$47$$.$context_$ = $JSCompiler_StaticMethods_createLogRequest_$self$$.$context_$;
  return $request$jscomp$47$$;
}, $JSCompiler_StaticMethods_logEvent$$ = function($JSCompiler_StaticMethods_logEvent$self$$, $event$jscomp$246$$) {
  $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$$($JSCompiler_StaticMethods_logEvent$self$$).then(function($port$jscomp$28$$) {
    $port$jscomp$28$$.message({buf:$JSCompiler_StaticMethods_AnalyticsRequest$$module$third_party$subscriptions_project$swg_prototype$toArray$$($JSCompiler_StaticMethods_createLogRequest_$$($JSCompiler_StaticMethods_logEvent$self$$, $event$jscomp$246$$))});
  });
}, $ConfiguredRuntime$$module$third_party$subscriptions_project$swg$$ = function($preconnect$jscomp$6_winOrDoc$jscomp$3$$, $pageConfig$jscomp$1$$, $opt_integr$$) {
  var $$jscomp$this$jscomp$1205$$ = this;
  this.$doc_$ = $resolveDoc$$module$third_party$subscriptions_project$swg$$($preconnect$jscomp$6_winOrDoc$jscomp$3$$);
  this.$D$ = this.$doc_$.$getWin$();
  this.$config_$ = {$windowOpenMode$:"auto", $analyticsMode$:0};
  $isEdgeBrowser$1$$module$third_party$subscriptions_project$swg$$(this.$D$) && (this.$config_$.$windowOpenMode$ = "redirect");
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$ = $pageConfig$jscomp$1$$;
  this.$F$ = this.$doc_$.$whenReady$();
  this.$jserror_$ = new $JsError$$module$third_party$subscriptions_project$swg$$(this.$doc_$);
  this.$I$ = $opt_integr$$ && $opt_integr$$.$fetcher$ || new $XhrFetcher$$module$third_party$subscriptions_project$swg$$(this.$D$);
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$storage_$ = new $Storage$$module$third_party$subscriptions_project$swg$$(this.$D$);
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$ = new $DialogManager$$module$third_party$subscriptions_project$swg$$(this.$doc_$);
  this.$G$ = new $ActivityPorts$$module$third_party$subscriptions_project$swg$$(this.$D$);
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$payClient_$ = new $PayClient$$module$third_party$subscriptions_project$swg$$(this.$D$, this.$G$, this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$);
  this.$callbacks_$ = new $Callbacks$$module$third_party$subscriptions_project$swg$$;
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$ = new $AnalyticsService$$module$third_party$subscriptions_project$swg$$(this);
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$ = new $EntitlementsManager$$module$third_party$subscriptions_project$swg$$(this.$D$, this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$, this.$I$, this);
  this.$J$ = new $ButtonApi$$module$third_party$subscriptions_project$swg$$(this.$doc_$);
  $preconnect$jscomp$6_winOrDoc$jscomp$3$$ = new $Preconnect$$module$third_party$subscriptions_project$swg$$(this.$D$.document);
  $preconnect$jscomp$6_winOrDoc$jscomp$3$$.$prefetch$("https://news.google.com/swg/js/v1/loader.svg");
  $LinkCompleteFlow$$module$third_party$subscriptions_project$swg$configurePending$$(this);
  $PayCompleteFlow$$module$third_party$subscriptions_project$swg$configurePending$$(this);
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$payClient_$.$preconnect$($preconnect$jscomp$6_winOrDoc$jscomp$3$$);
  $injectStyleSheet$$module$third_party$subscriptions_project$swg$$(this.$doc_$, ".swg-dialog,.swg-toast{box-sizing:border-box;background-color:#fff!important}.swg-toast{position:fixed!important;bottom:0!important;max-height:46px!important;z-index:2147483647!important;border:none!important}@media (max-height:640px), (max-width:640px){.swg-dialog,.swg-toast{width:480px!important;left:-240px!important;margin-left:50vw!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}@media (min-width:640px) and (min-height:640px){.swg-dialog{width:630px!important;left:-315px!important;margin-left:50vw!important;background-color:transparent!important;border:none!important}.swg-toast{left:0!important}}@media (max-width:480px){.swg-dialog,.swg-toast{width:100%!important;left:0!important;right:0!important;margin-left:0!important}}\n/*# sourceURL=/./src/components/dialog.css*/");
  $JSCompiler_StaticMethods_onRedirectError$$(this.$G$, function($preconnect$jscomp$6_winOrDoc$jscomp$3$$) {
    $JSCompiler_StaticMethods_addLabels$$($$jscomp$this$jscomp$1205$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$, ["redirect"]);
    $JSCompiler_StaticMethods_logEvent$$($$jscomp$this$jscomp$1205$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$, 2000);
    $$jscomp$this$jscomp$1205$$.$jserror_$.error("Redirect error", $preconnect$jscomp$6_winOrDoc$jscomp$3$$);
  });
}, $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$$ = function($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$) {
  return $JSCompiler_StaticMethods_EntitlementsManager$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$$($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$).then(function($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$) {
    return $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$self$$.clone();
  });
}, $JSCompiler_StaticMethods_showOffers$$ = function($JSCompiler_StaticMethods_showOffers$self$$, $opt_options$jscomp$87$$) {
  $JSCompiler_StaticMethods_showOffers$self$$.$F$.then(function() {
    return (new $OffersFlow$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_showOffers$self$$, $opt_options$jscomp$87$$)).start();
  });
}, $JSCompiler_StaticMethods_showAbbrvOffer$$ = function($JSCompiler_StaticMethods_showAbbrvOffer$self$$) {
  var $opt_options$jscomp$89$$ = {list:"amp"};
  $JSCompiler_StaticMethods_showAbbrvOffer$self$$.$F$.then(function() {
    return (new $AbbrvOfferFlow$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_showAbbrvOffer$self$$, $opt_options$jscomp$89$$)).start();
  });
}, $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLoginRequest$$ = function($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLoginRequest$self$$, $callback$jscomp$158$$) {
  $JSCompiler_StaticMethods_setCallback_$$($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLoginRequest$self$$.$callbacks_$, 4, $callback$jscomp$158$$);
}, $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLinkComplete$$ = function($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLinkComplete$self$$, $callback$jscomp$159$$) {
  $JSCompiler_StaticMethods_setCallback_$$($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLinkComplete$self$$.$callbacks_$, 6, $callback$jscomp$159$$);
}, $JSCompiler_StaticMethods_linkAccount$$ = function($JSCompiler_StaticMethods_linkAccount$self$$) {
  $JSCompiler_StaticMethods_linkAccount$self$$.$F$.then(function() {
    return (new $LinkbackFlow$$module$third_party$subscriptions_project$swg$$($JSCompiler_StaticMethods_linkAccount$self$$)).start();
  });
}, $JSCompiler_StaticMethods_setOnNativeSubscribeRequest$$ = function($JSCompiler_StaticMethods_setOnNativeSubscribeRequest$self$$, $callback$jscomp$160$$) {
  $JSCompiler_StaticMethods_setCallback_$$($JSCompiler_StaticMethods_setOnNativeSubscribeRequest$self$$.$callbacks_$, 2, $callback$jscomp$160$$);
}, $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnSubscribeResponse$$ = function($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnSubscribeResponse$self$$, $callback$jscomp$161$$) {
  $JSCompiler_StaticMethods_setCallback_$$($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnSubscribeResponse$self$$.$callbacks_$, 3, $callback$jscomp$161$$);
}, $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowStarted$$ = function($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowStarted$self$$, $callback$jscomp$162$$) {
  $JSCompiler_StaticMethods_setCallback_$$($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowStarted$self$$.$callbacks_$, 7, $callback$jscomp$162$$);
}, $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowCanceled$$ = function($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowCanceled$self$$, $callback$jscomp$163$$) {
  $JSCompiler_StaticMethods_setCallback_$$($JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowCanceled$self$$.$callbacks_$, 8, $callback$jscomp$163$$);
}, $JSCompiler_StaticMethods_attachButton$$ = function($JSCompiler_StaticMethods_attachButton$self$$, $button$jscomp$10$$, $optionsOrCallback$jscomp$3$$, $opt_callback$jscomp$13$$) {
  $JSCompiler_StaticMethods_attachButton$self$$.$J$.$attach$($button$jscomp$10$$, $optionsOrCallback$jscomp$3$$, $opt_callback$jscomp$13$$);
}, $GoogleSubscriptionsPlatformService$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$ = function($ampdoc$jscomp$210$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$210$$;
}, $GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$ = function($ampdoc$jscomp$211$$, $platformConfig$jscomp$1$$, $serviceAdapter$jscomp$1$$) {
  var $$jscomp$this$jscomp$1217$$ = this;
  this.$G$ = $serviceAdapter$jscomp$1$$;
  this.$F$ = $serviceAdapter$jscomp$1$$.$D$.$F$;
  this.$D$ = new $ConfiguredRuntime$$module$third_party$subscriptions_project$swg$$(new _.$DocImpl$$module$extensions$amp_subscriptions$0_1$doc_impl$$($ampdoc$jscomp$211$$), $serviceAdapter$jscomp$1$$.$D$.$J$, {$fetcher$:new $AmpFetcher$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$($ampdoc$jscomp$211$$.$win$)});
  $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLoginRequest$$(this.$D$, function($ampdoc$jscomp$211$$) {
    $ampdoc$jscomp$211$$ && $ampdoc$jscomp$211$$.$linkRequested$ && $$jscomp$this$jscomp$1217$$.$I$ ? ($JSCompiler_StaticMethods_linkAccount$$($$jscomp$this$jscomp$1217$$.$D$), $$jscomp$this$jscomp$1217$$.$F$.$F$($$jscomp$this$jscomp$1217$$.$getServiceId$(), "link", "started"), $$jscomp$this$jscomp$1217$$.$F$.$D$("subscriptions-link-requested", $$jscomp$this$jscomp$1217$$.$getServiceId$())) : $JSCompiler_StaticMethods_maybeComplete_$$($$jscomp$this$jscomp$1217$$, $$jscomp$this$jscomp$1217$$.$G$.$G$("login"));
  });
  $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnLinkComplete$$(this.$D$, function() {
    $$jscomp$this$jscomp$1217$$.$G$.$F$();
    $$jscomp$this$jscomp$1217$$.$F$.$F$($$jscomp$this$jscomp$1217$$.$getServiceId$(), "link", "success");
    $$jscomp$this$jscomp$1217$$.$F$.$D$("subscriptions-link-complete", $$jscomp$this$jscomp$1217$$.$getServiceId$());
  });
  $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowStarted$$(this.$D$, function($ampdoc$jscomp$211$$) {
    "subscribe" == $ampdoc$jscomp$211$$.$flow$ && $$jscomp$this$jscomp$1217$$.$F$.$F$($$jscomp$this$jscomp$1217$$.$getServiceId$(), "subscribe", "started");
  });
  $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnFlowCanceled$$(this.$D$, function($ampdoc$jscomp$211$$) {
    "linkAccount" == $ampdoc$jscomp$211$$.$flow$ ? ($$jscomp$this$jscomp$1217$$.$G$.$F$(), $$jscomp$this$jscomp$1217$$.$F$.$F$($$jscomp$this$jscomp$1217$$.$getServiceId$(), "link", "rejected"), $$jscomp$this$jscomp$1217$$.$F$.$D$("subscriptions-link-canceled", $$jscomp$this$jscomp$1217$$.$getServiceId$())) : "subscribe" == $ampdoc$jscomp$211$$.$flow$ && $$jscomp$this$jscomp$1217$$.$F$.$F$($$jscomp$this$jscomp$1217$$.$getServiceId$(), "subscribe", "rejected");
  });
  $JSCompiler_StaticMethods_setOnNativeSubscribeRequest$$(this.$D$, function() {
    $JSCompiler_StaticMethods_maybeComplete_$$($$jscomp$this$jscomp$1217$$, $$jscomp$this$jscomp$1217$$.$G$.$G$("subscribe"));
  });
  $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$setOnSubscribeResponse$$(this.$D$, function($ampdoc$jscomp$211$$) {
    $ampdoc$jscomp$211$$.then(function($ampdoc$jscomp$211$$) {
      $JSCompiler_StaticMethods_onSubscribeResponse_$$($$jscomp$this$jscomp$1217$$, $ampdoc$jscomp$211$$);
    });
  });
  this.$K$ = $platformConfig$jscomp$1$$;
  this.$I$ = !1;
  $JSCompiler_StaticMethods_resolveGoogleViewer_$$(this, _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$211$$));
  this.$J$ = !1;
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$211$$, ".swg-button,.swg-button-dark,.swg-button-light{border:0;border-radius:4px;box-sizing:border-box;outline:0;padding:11px 8px;width:240px;min-width:150px;height:40px;min-height:40px}.swg-button-dark:after,.swg-button-light:after,.swg-button:after{display:block;max-width:200px;max-height:40px;width:100%;height:100%;margin:auto;content:\"\";border:0;background-origin:content-box;background-position:50%;background-repeat:no-repeat;background-size:contain}.swg-button,.swg-button-light{background-color:#fff;box-shadow:0 1px 1px 0 rgba(60,64,67,0.3),0 1px 3px 1px rgba(60,64,67,0.15)}.swg-button-light:after,.swg-button:after{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='235' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M169.367 19c-5.09 0-9.367-4.265-9.367-9.5s4.277-9.5 9.367-9.5c2.818 0 4.823 1.133 6.33 2.622l-1.775 1.827c-1.082-1.04-2.55-1.857-4.555-1.857-3.72 0-6.628 3.081-6.628 6.908 0 3.827 2.907 6.908 6.628 6.908 2.411 0 3.78-1 4.664-1.898.724-.745 1.19-1.806 1.37-3.265h-6.034V8.643h8.494c.09.459.139 1.02.139 1.622 0 1.95-.516 4.357-2.183 6.072-1.627 1.734-3.691 2.663-6.45 2.663z' fill='%234285F4' fill-rule='nonzero'/%3E%3Cpath d='M192 13c0 3.456-2.69 6-6 6s-6-2.544-6-6c0-3.476 2.69-6 6-6s6 2.524 6 6zm-2.63 0c0-2.164-1.563-3.636-3.37-3.636-1.807 0-3.37 1.482-3.37 3.636 0 2.134 1.563 3.636 3.37 3.636 1.807 0 3.37-1.492 3.37-3.636z' fill='%23E94235' fill-rule='nonzero'/%3E%3Cpath d='M205 13c0 3.456-2.69 6-6 6-3.3 0-6-2.544-6-6 0-3.476 2.69-6 6-6s6 2.524 6 6zm-2.62 0c0-2.164-1.563-3.636-3.37-3.636-1.807 0-3.37 1.482-3.37 3.636 0 2.134 1.563 3.636 3.37 3.636 1.807.01 3.37-1.492 3.37-3.636z' fill='%23FABB05' fill-rule='nonzero'/%3E%3Cpath d='M217 7.362v10.53c0 4.337-2.499 6.108-5.457 6.108-2.786 0-4.452-1.908-5.083-3.465l2.192-.93c.392.96 1.35 2.085 2.891 2.085 1.896 0 3.064-1.204 3.064-3.445v-.841h-.087c-.564.714-1.656 1.33-3.025 1.33-2.872 0-5.495-2.554-5.495-5.842C206 9.584 208.633 7 211.495 7c1.37 0 2.46.626 3.025 1.311h.087v-.949H217zm-2.221 5.54c0-2.066-1.35-3.582-3.064-3.582-1.742 0-3.197 1.507-3.197 3.582 0 2.045 1.455 3.533 3.197 3.533 1.714 0 3.064-1.488 3.064-3.533z' fill='%234285F4' fill-rule='nonzero'/%3E%3Cpath fill='%2334A853' fill-rule='nonzero' d='M223 1v18h-3V1z'/%3E%3Cpath d='M232.844 14.973l2.046 1.363c-.662.981-2.256 2.664-5.014 2.664-3.42 0-5.876-2.634-5.876-6 0-3.566 2.487-6 5.585-6 3.119 0 4.643 2.474 5.144 3.816l.271.681-8.032 3.326c.612 1.202 1.574 1.823 2.918 1.823s2.276-.671 2.958-1.673zm-6.307-2.163l5.375-2.224c-.301-.751-1.184-1.272-2.237-1.272-1.343 0-3.208 1.182-3.138 3.496z' fill='%23E94235' fill-rule='nonzero'/%3E%3Cpath d='M6.576 19.384c-1.248 0-2.468-.408-3.66-1.224-1.192-.816-1.972-1.96-2.34-3.432l2.016-.816c.24.944.732 1.74 1.476 2.388.744.648 1.58.972 2.508.972.96 0 1.78-.252 2.46-.756.68-.504 1.02-1.188 1.02-2.052 0-.96-.34-1.7-1.02-2.22-.68-.52-1.756-1.004-3.228-1.452-1.52-.48-2.672-1.1-3.456-1.86-.784-.76-1.176-1.732-1.176-2.916 0-1.232.488-2.304 1.464-3.216.976-.912 2.248-1.368 3.816-1.368 1.456 0 2.64.364 3.552 1.092.912.728 1.504 1.524 1.776 2.388l-2.016.84c-.144-.544-.5-1.048-1.068-1.512-.568-.464-1.3-.696-2.196-.696-.848 0-1.572.236-2.172.708-.6.472-.9 1.06-.9 1.764 0 .64.276 1.18.828 1.62.552.44 1.364.836 2.436 1.188.848.272 1.556.536 2.124.792a9.842 9.842 0 0 1 1.728 1.02 4.065 4.065 0 0 1 1.32 1.584c.296.632.444 1.364.444 2.196 0 .832-.172 1.576-.516 2.232a4.19 4.19 0 0 1-1.368 1.56 6.875 6.875 0 0 1-3.852 1.176zM24.936 19h-2.112v-1.632h-.096c-.336.56-.848 1.036-1.536 1.428a4.345 4.345 0 0 1-2.184.588c-1.472 0-2.588-.448-3.348-1.344-.76-.896-1.14-2.096-1.14-3.6v-7.2h2.208v6.84c0 2.192.968 3.288 2.904 3.288.912 0 1.656-.368 2.232-1.104.576-.736.864-1.584.864-2.544V7.24h2.208V19zm8.904.384c-.896 0-1.7-.192-2.412-.576-.712-.384-1.244-.864-1.596-1.44h-.096V19h-2.112V1.816h2.208V7.24l-.096 1.632h.096c.352-.576.884-1.056 1.596-1.44.712-.384 1.516-.576 2.412-.576 1.52 0 2.832.6 3.936 1.8 1.104 1.2 1.656 2.688 1.656 4.464 0 1.776-.552 3.264-1.656 4.464-1.104 1.2-2.416 1.8-3.936 1.8zm-.36-2.016c1.024 0 1.904-.388 2.64-1.164.736-.776 1.104-1.804 1.104-3.084s-.368-2.308-1.104-3.084c-.736-.776-1.616-1.164-2.64-1.164-1.04 0-1.924.384-2.652 1.152-.728.768-1.092 1.8-1.092 3.096s.364 2.328 1.092 3.096c.728.768 1.612 1.152 2.652 1.152zm12.336 2.016c-1.312 0-2.396-.32-3.252-.96a5.682 5.682 0 0 1-1.884-2.4l1.968-.816c.624 1.472 1.688 2.208 3.192 2.208.688 0 1.252-.152 1.692-.456.44-.304.66-.704.66-1.2 0-.768-.536-1.288-1.608-1.56l-2.376-.576c-.752-.192-1.464-.556-2.136-1.092-.672-.536-1.008-1.26-1.008-2.172 0-1.04.46-1.884 1.38-2.532.92-.648 2.012-.972 3.276-.972 1.04 0 1.968.236 2.784.708a3.99 3.99 0 0 1 1.752 2.028l-1.92.792c-.432-1.04-1.328-1.56-2.688-1.56-.656 0-1.208.136-1.656.408-.448.272-.672.64-.672 1.104 0 .672.52 1.128 1.56 1.368l2.328.552c1.104.256 1.92.696 2.448 1.32.528.624.792 1.328.792 2.112 0 1.056-.432 1.936-1.296 2.64-.864.704-1.976 1.056-3.336 1.056zm11.928 0c-1.76 0-3.208-.596-4.344-1.788-1.136-1.192-1.704-2.684-1.704-4.476 0-1.792.568-3.284 1.704-4.476 1.136-1.192 2.584-1.788 4.344-1.788 1.312 0 2.4.32 3.264.96a5.621 5.621 0 0 1 1.896 2.424l-2.016.84c-.608-1.472-1.704-2.208-3.288-2.208-.976 0-1.836.4-2.58 1.2-.744.8-1.116 1.816-1.116 3.048s.372 2.248 1.116 3.048c.744.8 1.604 1.2 2.58 1.2 1.648 0 2.784-.736 3.408-2.208l1.968.84c-.4.96-1.044 1.764-1.932 2.412-.888.648-1.988.972-3.3.972zm9.36-.384h-2.208V7.24h2.112v1.92h.096c.224-.64.684-1.168 1.38-1.584.696-.416 1.372-.624 2.028-.624.656 0 1.208.096 1.656.288l-.84 2.064c-.288-.112-.68-.168-1.176-.168-.8 0-1.508.316-2.124.948-.616.632-.924 1.46-.924 2.484V19zm8.904-14.712a1.504 1.504 0 0 1-1.104.456c-.432 0-.8-.152-1.104-.456a1.504 1.504 0 0 1-.456-1.104c0-.432.152-.8.456-1.104a1.504 1.504 0 0 1 1.104-.456c.432 0 .8.152 1.104.456.304.304.456.672.456 1.104 0 .432-.152.8-.456 1.104zm0 14.712H73.8V7.24h2.208V19zm9.096.384c-.896 0-1.7-.192-2.412-.576-.712-.384-1.244-.864-1.596-1.44H81V19h-2.112V1.816h2.208V7.24L81 8.872h.096c.352-.576.884-1.056 1.596-1.44.712-.384 1.516-.576 2.412-.576 1.52 0 2.832.6 3.936 1.8 1.104 1.2 1.656 2.688 1.656 4.464 0 1.776-.552 3.264-1.656 4.464-1.104 1.2-2.416 1.8-3.936 1.8zm-.36-2.016c1.024 0 1.904-.388 2.64-1.164.736-.776 1.104-1.804 1.104-3.084s-.368-2.308-1.104-3.084c-.736-.776-1.616-1.164-2.64-1.164-1.04 0-1.924.384-2.652 1.152-.728.768-1.092 1.8-1.092 3.096s.364 2.328 1.092 3.096c.728.768 1.612 1.152 2.652 1.152zm13.296 2.016c-1.776 0-3.22-.592-4.332-1.776-1.112-1.184-1.668-2.68-1.668-4.488 0-1.712.54-3.184 1.62-4.416 1.08-1.232 2.46-1.848 4.14-1.848 1.744 0 3.14.568 4.188 1.704 1.048 1.136 1.572 2.656 1.572 4.56l-.024.408h-9.288c.064 1.184.46 2.12 1.188 2.808.728.688 1.58 1.032 2.556 1.032 1.584 0 2.656-.672 3.216-2.016l1.968.816c-.384.912-1.016 1.676-1.896 2.292-.88.616-1.96.924-3.24.924zm3.168-7.68c-.048-.672-.356-1.312-.924-1.92-.568-.608-1.412-.912-2.532-.912-.816 0-1.524.256-2.124.768-.6.512-1.012 1.2-1.236 2.064h6.816zM123.72 19h-2.256l-2.928-9.024L115.632 19H113.4l-3.792-11.76h2.304l2.616 8.88h.024l2.904-8.88h2.28l2.904 8.88h.024l2.592-8.88h2.256L123.72 19zm7.632-14.712a1.504 1.504 0 0 1-1.104.456c-.432 0-.8-.152-1.104-.456a1.504 1.504 0 0 1-.456-1.104c0-.432.152-.8.456-1.104a1.504 1.504 0 0 1 1.104-.456c.432 0 .8.152 1.104.456.304.304.456.672.456 1.104 0 .432-.152.8-.456 1.104zm0 14.712h-2.208V7.24h2.208V19zm7.968.192c-1.232 0-2.172-.328-2.82-.984-.648-.656-.972-1.584-.972-2.784V9.256h-2.064V7.24h2.064v-3.6h2.208v3.6h2.88v2.016h-2.88v6c0 1.28.528 1.92 1.584 1.92.4 0 .736-.064 1.008-.192l.768 1.896c-.48.208-1.072.312-1.776.312zm5.616-17.376V7.24l-.096 1.632h.096c.32-.56.824-1.036 1.512-1.428a4.389 4.389 0 0 1 2.208-.588c1.456 0 2.568.448 3.336 1.344.768.896 1.152 2.096 1.152 3.6V19h-2.208v-6.864c0-2.176-.968-3.264-2.904-3.264-.912 0-1.656.364-2.232 1.092-.576.728-.864 1.572-.864 2.532V19h-2.208V1.816h2.208z' fill='%235F6368'/%3E%3C/g%3E%3C/svg%3E\")}.swg-button-dark{background-color:#000}.swg-button-dark:after{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='231' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFF' fill-rule='evenodd'%3E%3Cpath d='M6.302 19.368c-1.196 0-2.365-.391-3.507-1.173-1.143-.782-1.89-1.878-2.243-3.289l1.932-.782c.23.905.701 1.667 1.414 2.289.714.62 1.515.931 2.404.931.92 0 1.706-.241 2.357-.725.652-.483.978-1.138.978-1.966 0-.92-.326-1.63-.978-2.128-.651-.498-1.682-.962-3.093-1.391-1.457-.46-2.56-1.054-3.312-1.783-.751-.728-1.127-1.66-1.127-2.794 0-1.18.468-2.208 1.403-3.082.935-.874 2.154-1.311 3.657-1.311 1.395 0 2.53.349 3.404 1.046.874.698 1.441 1.461 1.702 2.289l-1.932.805c-.138-.521-.48-1.004-1.024-1.449-.544-.445-1.245-.667-2.104-.667-.813 0-1.506.226-2.081.679-.576.452-.863 1.015-.863 1.69 0 .613.264 1.13.793 1.553.53.421 1.308.8 2.335 1.138.813.26 1.491.514 2.036.759a9.431 9.431 0 0 1 1.655.978c.56.406.982.912 1.265 1.518.284.605.426 1.307.426 2.104 0 .797-.165 1.51-.494 2.139a4.015 4.015 0 0 1-1.312 1.495 6.589 6.589 0 0 1-3.691 1.127zM23.696 19h-2.024v-1.564h-.092c-.322.537-.813.993-1.472 1.369a4.164 4.164 0 0 1-2.093.563c-1.41 0-2.48-.43-3.209-1.288-.728-.859-1.092-2.009-1.092-3.45v-6.9h2.116v6.555c0 2.1.927 3.151 2.783 3.151.874 0 1.587-.353 2.139-1.058a3.845 3.845 0 0 0 .828-2.438V7.73h2.116V19zm8.677.368c-.86 0-1.63-.184-2.312-.552-.682-.368-1.192-.828-1.53-1.38h-.091V19h-2.024V2.532h2.116V7.73l-.093 1.564h.093c.337-.552.847-1.012 1.529-1.38.682-.368 1.453-.552 2.312-.552 1.456 0 2.713.575 3.772 1.725 1.058 1.15 1.586 2.576 1.586 4.278 0 1.702-.528 3.128-1.587 4.278-1.058 1.15-2.315 1.725-3.771 1.725zm-.345-1.932c.98 0 1.824-.372 2.53-1.116.705-.743 1.057-1.728 1.057-2.955s-.352-2.212-1.058-2.956c-.705-.743-1.548-1.115-2.53-1.115-.996 0-1.843.368-2.541 1.104-.698.736-1.047 1.725-1.047 2.967s.35 2.231 1.047 2.967c.698.736 1.545 1.104 2.542 1.104zm11.85 1.932c-1.257 0-2.296-.307-3.116-.92a5.446 5.446 0 0 1-1.806-2.3l1.886-.782c.598 1.41 1.618 2.116 3.06 2.116.659 0 1.2-.146 1.62-.437.422-.291.633-.675.633-1.15 0-.736-.513-1.234-1.54-1.495l-2.278-.552c-.72-.184-1.403-.533-2.047-1.046-.644-.514-.966-1.208-.966-2.082 0-.997.441-1.805 1.323-2.427.881-.62 1.928-.931 3.14-.931.996 0 1.885.226 2.667.678a3.824 3.824 0 0 1 1.68 1.944l-1.84.759c-.415-.997-1.273-1.495-2.577-1.495-.628 0-1.157.13-1.587.391-.43.26-.644.613-.644 1.058 0 .644.499 1.081 1.495 1.311l2.231.529c1.058.245 1.84.667 2.346 1.265.506.598.76 1.273.76 2.024 0 1.012-.415 1.855-1.243 2.53-.828.675-1.893 1.012-3.197 1.012zm11.69 0c-1.687 0-3.074-.571-4.163-1.713-1.089-1.143-1.633-2.573-1.633-4.29s.544-3.147 1.633-4.29c1.089-1.142 2.476-1.713 4.163-1.713 1.257 0 2.3.307 3.128.92a5.387 5.387 0 0 1 1.817 2.323l-1.932.805c-.583-1.41-1.633-2.116-3.151-2.116-.935 0-1.76.383-2.472 1.15-.714.767-1.07 1.74-1.07 2.921 0 1.18.356 2.154 1.07 2.921.713.767 1.537 1.15 2.472 1.15 1.58 0 2.668-.705 3.266-2.116l1.886.805c-.383.92-1 1.69-1.852 2.311-.85.622-1.905.932-3.162.932zM64.567 19H62.45V7.73h2.024v1.84h.092c.214-.613.655-1.12 1.322-1.518.667-.399 1.315-.598 1.944-.598.628 0 1.157.092 1.587.276l-.805 1.978c-.276-.107-.652-.161-1.127-.161-.767 0-1.445.303-2.036.909-.59.605-.885 1.399-.885 2.38V19zm8.677-14.099a1.441 1.441 0 0 1-1.058.437c-.415 0-.767-.146-1.059-.437a1.441 1.441 0 0 1-.436-1.058c0-.414.145-.767.436-1.058a1.441 1.441 0 0 1 1.059-.437c.414 0 .766.146 1.057.437.292.291.438.644.438 1.058 0 .414-.146.767-.438 1.058zm0 14.099h-2.117V7.73h2.117V19zm8.86.368c-.858 0-1.629-.184-2.311-.552-.683-.368-1.192-.828-1.53-1.38h-.092V19h-2.024V2.532h2.116V7.73l-.092 1.564h.092c.338-.552.847-1.012 1.53-1.38.682-.368 1.453-.552 2.311-.552 1.457 0 2.714.575 3.772 1.725 1.058 1.15 1.587 2.576 1.587 4.278 0 1.702-.529 3.128-1.587 4.278-1.058 1.15-2.315 1.725-3.772 1.725zm-.345-1.932c.982 0 1.825-.372 2.53-1.116.706-.743 1.058-1.728 1.058-2.955s-.352-2.212-1.058-2.956c-.705-.743-1.548-1.115-2.53-1.115-.996 0-1.844.368-2.541 1.104-.698.736-1.047 1.725-1.047 2.967s.35 2.231 1.047 2.967c.697.736 1.545 1.104 2.541 1.104zm12.886 1.932c-1.702 0-3.086-.567-4.151-1.702-1.066-1.135-1.599-2.568-1.599-4.301 0-1.64.517-3.051 1.553-4.232 1.035-1.18 2.357-1.771 3.967-1.771 1.671 0 3.01.544 4.013 1.633 1.005 1.089 1.507 2.545 1.507 4.37l-.023.391h-8.901c.061 1.135.44 2.032 1.139 2.691.697.66 1.514.989 2.449.989 1.518 0 2.545-.644 3.082-1.932l1.886.782c-.368.874-.974 1.606-1.817 2.197-.843.59-1.878.885-3.105.885zm3.036-7.36c-.046-.644-.341-1.257-.885-1.84-.545-.583-1.354-.874-2.427-.874-.782 0-1.46.245-2.035.736-.576.49-.97 1.15-1.185 1.978h6.532zM119.543 19h-2.163l-2.805-8.648L111.79 19h-2.138l-3.635-11.27h2.209l2.507 8.51h.023l2.782-8.51h2.186l2.782 8.51h.023l2.484-8.51h2.163L119.541 19zM127 4.901a1.441 1.441 0 0 1-1.058.437c-.414 0-.766-.146-1.058-.437a1.441 1.441 0 0 1-.437-1.058c0-.414.146-.767.437-1.058a1.441 1.441 0 0 1 1.058-.437c.414 0 .767.146 1.058.437.292.291.437.644.437 1.058 0 .414-.145.767-.437 1.058zM127 19h-2.116V7.73H127V19zm7.665.184c-1.18 0-2.081-.314-2.702-.943-.622-.629-.932-1.518-.932-2.668V9.662h-1.978V7.73h1.978V4.28h2.116v3.45h2.76v1.932h-2.76v5.75c0 1.227.506 1.84 1.518 1.84.383 0 .705-.061.966-.184l.736 1.817c-.46.2-1.027.299-1.702.299zm5.64-16.652V7.73l-.091 1.564h.092c.306-.537.79-.993 1.449-1.369a4.206 4.206 0 0 1 2.116-.563c1.395 0 2.46.43 3.197 1.288.736.859 1.104 2.009 1.104 3.45V19h-2.116v-6.578c0-2.085-.928-3.128-2.783-3.128-.874 0-1.587.349-2.14 1.046-.551.698-.827 1.507-.827 2.427V19h-2.116V2.532h2.116z'/%3E%3Cg fill-rule='nonzero'%3E%3Cpath d='M165.367 19c-5.09 0-9.367-4.265-9.367-9.5s4.277-9.5 9.367-9.5c2.818 0 4.823 1.133 6.33 2.622l-1.775 1.827c-1.082-1.04-2.55-1.857-4.555-1.857-3.72 0-6.628 3.081-6.628 6.908 0 3.827 2.907 6.908 6.628 6.908 2.411 0 3.78-1 4.664-1.898.724-.745 1.19-1.806 1.37-3.265h-6.034V8.643h8.494c.09.459.139 1.02.139 1.622 0 1.95-.516 4.357-2.183 6.072-1.627 1.734-3.691 2.663-6.45 2.663zM188 13c0 3.456-2.69 6-6 6s-6-2.544-6-6c0-3.476 2.69-6 6-6s6 2.524 6 6zm-2.63 0c0-2.164-1.563-3.636-3.37-3.636-1.807 0-3.37 1.482-3.37 3.636 0 2.134 1.563 3.636 3.37 3.636 1.807 0 3.37-1.492 3.37-3.636zM201 13c0 3.456-2.69 6-6 6-3.3 0-6-2.544-6-6 0-3.476 2.69-6 6-6s6 2.524 6 6zm-2.62 0c0-2.164-1.563-3.636-3.37-3.636-1.807 0-3.37 1.482-3.37 3.636 0 2.134 1.563 3.636 3.37 3.636 1.807.01 3.37-1.492 3.37-3.636zM213 7.362v10.53c0 4.337-2.499 6.108-5.457 6.108-2.786 0-4.452-1.908-5.083-3.465l2.192-.93c.392.96 1.35 2.085 2.891 2.085 1.896 0 3.064-1.204 3.064-3.445v-.841h-.087c-.564.714-1.656 1.33-3.025 1.33-2.872 0-5.495-2.554-5.495-5.842C202 9.584 204.633 7 207.495 7c1.37 0 2.46.626 3.025 1.311h.087v-.949H213zm-2.221 5.54c0-2.066-1.35-3.582-3.064-3.582-1.742 0-3.197 1.507-3.197 3.582 0 2.045 1.455 3.533 3.197 3.533 1.714 0 3.064-1.488 3.064-3.533zM219 1v18h-3V1zM228.844 14.973l2.046 1.363c-.662.981-2.256 2.664-5.014 2.664-3.42 0-5.876-2.634-5.876-6 0-3.566 2.487-6 5.585-6 3.119 0 4.643 2.474 5.144 3.816l.271.681-8.032 3.326c.612 1.202 1.574 1.823 2.918 1.823s2.276-.671 2.958-1.673zm-6.307-2.163l5.375-2.224c-.301-.751-1.184-1.272-2.237-1.272-1.343 0-3.208 1.182-3.138 3.496z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")}.swg-button-light:hover,.swg-button:hover{background-color:#f8f8f8}.swg-button-light:focus,.swg-button:focus{box-shadow:#e8e8e8}.swg-button-light:active,.swg-button:active{background-color:#fff}.swg-button-dark:hover{background-color:#3c4043}.swg-button-dark:focus{box-shadow:#202124}.swg-button-dark:active{background-color:#5f6368}.swg-button-light:lang(ar):after,.swg-button:lang(ar):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ar-lt.svg)}.swg-button-dark:lang(ar):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ar-dk.svg)}.swg-button-light:lang(de):after,.swg-button:lang(de):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-de-lt.svg)}.swg-button-dark:lang(de):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-de-dk.svg)}.swg-button-light:lang(es):after,.swg-button:lang(es):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-es-lt.svg)}.swg-button-dark:lang(es):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-es-dk.svg)}.swg-button-light:lang(es-latam):after,.swg-button:lang(es-latam):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-es-latam-lt.svg)}.swg-button-dark:lang(es-latam):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-es-latam-dk.svg)}.swg-button-light:lang(es-latn):after,.swg-button:lang(es-latn):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-es-latam-lt.svg)}.swg-button-dark:lang(es-latn):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-es-latam-dk.svg)}.swg-button-light:lang(fr):after,.swg-button:lang(fr):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-fr-lt.svg)}.swg-button-dark:lang(fr):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-fr-dk.svg)}.swg-button-light:lang(hi):after,.swg-button:lang(hi):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-hi-lt.svg)}.swg-button-dark:lang(hi):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-hi-dk.svg)}.swg-button-light:lang(id):after,.swg-button:lang(id):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-id-lt.svg)}.swg-button-dark:lang(id):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-id-dk.svg)}.swg-button-light:lang(it):after,.swg-button:lang(it):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-it-lt.svg)}.swg-button-dark:lang(it):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-it-dk.svg)}.swg-button-light:lang(jp):after,.swg-button:lang(jp):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-jp-lt.svg)}.swg-button-dark:lang(jp):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-jp-dk.svg)}.swg-button-light:lang(ko):after,.swg-button:lang(ko):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ko-lt.svg)}.swg-button-dark:lang(ko):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ko-dk.svg)}.swg-button-light:lang(ms):after,.swg-button:lang(ms):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ms-lt.svg)}.swg-button-dark:lang(ms):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ms-dk.svg)}.swg-button-light:lang(nl):after,.swg-button:lang(nl):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-nl-lt.svg)}.swg-button-dark:lang(nl):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-nl-dk.svg)}.swg-button-light:lang(no):after,.swg-button:lang(no):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-no-lt.svg)}.swg-button-dark:lang(no):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-no-dk.svg)}.swg-button-light:lang(pl):after,.swg-button:lang(pl):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-pl-lt.svg)}.swg-button-dark:lang(pl):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-pl-dk.svg)}.swg-button-light:lang(pt):after,.swg-button:lang(pt):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-pt-lt.svg)}.swg-button-dark:lang(pt):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-pt-dk.svg)}.swg-button-light:lang(pt-br):after,.swg-button:lang(pt-br):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-pt-br-lt.svg)}.swg-button-dark:lang(pt-br):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-pt-br-dk.svg)}.swg-button-light:lang(ru):after,.swg-button:lang(ru):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ru-lt.svg)}.swg-button-dark:lang(ru):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-ru-dk.svg)}.swg-button-light:lang(se):after,.swg-button:lang(se):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-se-lt.svg)}.swg-button-dark:lang(se):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-se-dk.svg)}.swg-button-light:lang(th):after,.swg-button:lang(th):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-th-lt.svg)}.swg-button-dark:lang(th):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-th-dk.svg)}.swg-button-light:lang(tr):after,.swg-button:lang(tr):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-tr-lt.svg)}.swg-button-dark:lang(tr):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-tr-dk.svg)}.swg-button-light:lang(uk):after,.swg-button:lang(uk):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-uk-lt.svg)}.swg-button-dark:lang(uk):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-uk-dk.svg)}.swg-button-light:lang(zh-tw):after,.swg-button:lang(zh-tw):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-zh-tw-lt.svg)}.swg-button-dark:lang(zh-tw):after{background-image:url(https://news.google.com/swg/js/v1/i18n/b-zh-tw-dk.svg)}\n/*# sourceURL=/extensions/amp-subscriptions-google/0.1/amp-subscriptions-google.css*/", 
  function() {
  }, !1, "amp-subscriptions-google");
}, $JSCompiler_StaticMethods_maybeComplete_$$ = function($JSCompiler_StaticMethods_maybeComplete_$self$$, $promise$jscomp$63$$) {
  $promise$jscomp$63$$.then(function($promise$jscomp$63$$) {
    $promise$jscomp$63$$ && $JSCompiler_StaticMethods_maybeComplete_$self$$.$D$.reset();
  });
}, $JSCompiler_StaticMethods_onSubscribeResponse_$$ = function($JSCompiler_StaticMethods_onSubscribeResponse_$self$$, $response$jscomp$86$$) {
  $response$jscomp$86$$.complete().then(function() {
    $JSCompiler_StaticMethods_onSubscribeResponse_$self$$.$G$.$F$();
  });
  $JSCompiler_StaticMethods_onSubscribeResponse_$self$$.$F$.$F$($JSCompiler_StaticMethods_onSubscribeResponse_$self$$.$getServiceId$(), "subscribe", "success");
}, $JSCompiler_StaticMethods_resolveGoogleViewer_$$ = function($JSCompiler_StaticMethods_resolveGoogleViewer_$self$$, $viewer$jscomp$50$$) {
  var $viewerUrl$$ = $viewer$jscomp$50$$.$params_$.viewerUrl;
  $viewerUrl$$ ? $JSCompiler_StaticMethods_resolveGoogleViewer_$self$$.$I$ = $GOOGLE_DOMAIN_RE$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$.test(_.$parseUrlDeprecated$$module$src$url$$($viewerUrl$$).hostname) : _.$JSCompiler_StaticMethods_getViewerOrigin$$($viewer$jscomp$50$$).then(function($viewer$jscomp$50$$) {
    $viewer$jscomp$50$$ && ($JSCompiler_StaticMethods_resolveGoogleViewer_$self$$.$I$ = $GOOGLE_DOMAIN_RE$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$.test(_.$parseUrlDeprecated$$module$src$url$$($viewer$jscomp$50$$).hostname));
  });
}, $AmpFetcher$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$ = function($win$jscomp$472$$) {
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$($win$jscomp$472$$);
};
_.$DocImpl$$module$extensions$amp_subscriptions$0_1$doc_impl$$.prototype.$getHead$ = _.$JSCompiler_unstubMethod$$(53, function() {
  return this.$ampdoc_$.$getHeadNode$();
});
_.$BaseElement$$module$src$base_element$$.prototype.$getWin$ = _.$JSCompiler_unstubMethod$$(5, function() {
  return this.$win$;
});
_.$AmpDoc$$module$src$service$ampdoc_impl$$.prototype.$getWin$ = _.$JSCompiler_unstubMethod$$(4, function() {
  return this.$win$;
});
_.$DocImpl$$module$extensions$amp_subscriptions$0_1$doc_impl$$.prototype.$getWin$ = _.$JSCompiler_unstubMethod$$(3, function() {
  return this.$ampdoc_$.$win$;
});
var $aResolver$$module$third_party$subscriptions_project$swg$$;
$Messenger$$module$third_party$subscriptions_project$swg$$.prototype.disconnect = function() {
  if (this.$F$ && (this.$F$ = null, this.$D$ && ($closePort$$module$third_party$subscriptions_project$swg$$(this.$D$), this.$D$ = null), this.$I$.removeEventListener("message", this.$O$), this.$G$)) {
    for (var $k$jscomp$75$$ in this.$G$) {
      var $channelObj$$ = this.$G$[$k$jscomp$75$$];
      $channelObj$$.port1 && $closePort$$module$third_party$subscriptions_project$swg$$($channelObj$$.port1);
      $channelObj$$.port2 && $closePort$$module$third_party$subscriptions_project$swg$$($channelObj$$.port2);
    }
    this.$G$ = null;
  }
};
$Messenger$$module$third_party$subscriptions_project$swg$$.prototype.isConnected = function() {
  return null != this.$targetOrigin_$;
};
$Messenger$$module$third_party$subscriptions_project$swg$$.prototype.$R$ = function($event$jscomp$240$$) {
  if ($JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$$(this) == $event$jscomp$240$$.source) {
    var $data$jscomp$183_payload$jscomp$29$$ = $event$jscomp$240$$.data;
    if ($data$jscomp$183_payload$jscomp$29$$ && "__ACTIVITIES__" == $data$jscomp$183_payload$jscomp$29$$.sentinel) {
      var $cmd$jscomp$8$$ = $data$jscomp$183_payload$jscomp$29$$.cmd;
      if (!this.$D$ || "connect" == $cmd$jscomp$8$$ || "start" == $cmd$jscomp$8$$) {
        var $origin$jscomp$34$$ = $event$jscomp$240$$.origin;
        $data$jscomp$183_payload$jscomp$29$$ = $data$jscomp$183_payload$jscomp$29$$.payload || null;
        null == this.$targetOrigin_$ && "start" == $cmd$jscomp$8$$ && (this.$targetOrigin_$ = $origin$jscomp$34$$);
        null == this.$targetOrigin_$ && $event$jscomp$240$$.source && $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getOptionalTarget_$$(this) == $event$jscomp$240$$.source && (this.$targetOrigin_$ = $origin$jscomp$34$$);
        $origin$jscomp$34$$ == this.$targetOrigin_$ && $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$$(this, $cmd$jscomp$8$$, $data$jscomp$183_payload$jscomp$29$$, $event$jscomp$240$$);
      }
    }
  }
};
_.$JSCompiler_prototypeAlias$$ = $ActivityIframePort$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$J$ = !1;
  this.$D$.disconnect();
};
_.$JSCompiler_prototypeAlias$$.$acceptResult$ = function() {
  return this.$W$;
};
_.$JSCompiler_prototypeAlias$$.message = function($payload$jscomp$31$$) {
  $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$(this.$D$, "msg", $payload$jscomp$31$$);
};
_.$JSCompiler_prototypeAlias$$.$onMessage$ = function($callback$jscomp$123$$) {
  this.$D$.$K$ = $callback$jscomp$123$$;
};
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return this.$V$;
};
_.$JSCompiler_prototypeAlias$$.$resized$ = function() {
  this.$J$ && $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$(this.$D$, "resized", {height:this.$iframe_$.offsetHeight});
};
_.$JSCompiler_prototypeAlias$$.$ActivityIframePort$$module$third_party$subscriptions_project$swg_prototype$handleCommand_$ = function($cmd$jscomp$10_code$jscomp$4$$, $payload$jscomp$32_result$jscomp$68$$) {
  "connect" == $cmd$jscomp$10_code$jscomp$4$$ ? (this.$J$ = !0, $JSCompiler_StaticMethods_sendStartCommand$$(this.$D$, this.$R$), this.$O$()) : "result" == $cmd$jscomp$10_code$jscomp$4$$ ? this.$G$ && ($cmd$jscomp$10_code$jscomp$4$$ = $payload$jscomp$32_result$jscomp$68$$.code, $payload$jscomp$32_result$jscomp$68$$ = new $ActivityResult$$module$third_party$subscriptions_project$swg$$($cmd$jscomp$10_code$jscomp$4$$, "failed" == $cmd$jscomp$10_code$jscomp$4$$ ? Error($payload$jscomp$32_result$jscomp$68$$.data || 
  "") : $payload$jscomp$32_result$jscomp$68$$.data, "iframe", $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$getTargetOrigin$$(this.$D$), !0, !0), $resolveResult$$module$third_party$subscriptions_project$swg$$(this.$P$, $payload$jscomp$32_result$jscomp$68$$, this.$G$), this.$G$ = null, $JSCompiler_StaticMethods_Messenger$$module$third_party$subscriptions_project$swg_prototype$sendCommand$$(this.$D$, "close"), this.disconnect()) : "ready" == $cmd$jscomp$10_code$jscomp$4$$ ? 
  this.$F$ && (this.$F$(), this.$F$ = null) : "resize" == $cmd$jscomp$10_code$jscomp$4$$ && (this.$I$ = $payload$jscomp$32_result$jscomp$68$$.height, this.$K$ && this.$K$(this.$I$));
};
$ActivityWindowPort$$module$third_party$subscriptions_project$swg$$.prototype.open = function() {
  return $JSCompiler_StaticMethods_ActivityWindowPort$$module$third_party$subscriptions_project$swg_prototype$openInternal_$$(this);
};
$ActivityWindowPort$$module$third_party$subscriptions_project$swg$$.prototype.disconnect = function() {
  this.$I$ && (this.$D$.clearInterval(this.$I$), this.$I$ = null);
  this.$F$ && (this.$F$.disconnect(), this.$F$ = null);
  if (this.$G$) {
    try {
      this.$G$.close();
    } catch ($e$324$$) {
    }
    this.$G$ = null;
  }
  this.$K$ = null;
};
$ActivityWindowPort$$module$third_party$subscriptions_project$swg$$.prototype.$acceptResult$ = function() {
  return this.$P$;
};
$ActivityWindowPort$$module$third_party$subscriptions_project$swg$$.prototype.$U$ = function($cmd$jscomp$11_code$jscomp$6$$, $payload$jscomp$33$$) {
  var $$jscomp$this$jscomp$1140$$ = this;
  "connect" == $cmd$jscomp$11_code$jscomp$6$$ ? $JSCompiler_StaticMethods_sendStartCommand$$(this.$F$, this.$O$) : "result" == $cmd$jscomp$11_code$jscomp$6$$ ? ($cmd$jscomp$11_code$jscomp$6$$ = $payload$jscomp$33$$.code, $JSCompiler_StaticMethods_result_$$(this, $cmd$jscomp$11_code$jscomp$6$$, "failed" == $cmd$jscomp$11_code$jscomp$6$$ ? Error($payload$jscomp$33$$.data || "") : $payload$jscomp$33$$.data)) : "check" == $cmd$jscomp$11_code$jscomp$6$$ && this.$D$.setTimeout(function() {
    return $JSCompiler_StaticMethods_check_$$($$jscomp$this$jscomp$1140$$);
  }, 200);
};
$ActivityWindowRedirectPort$$module$third_party$subscriptions_project$swg$$.prototype.$acceptResult$ = function() {
  var $$jscomp$this$jscomp$1141$$ = this, $result$jscomp$70$$ = new $ActivityResult$$module$third_party$subscriptions_project$swg$$(this.$F$, this.$data_$, "redirect", this.$targetOrigin_$, this.$G$, !1);
  return new window.Promise(function($resolve$jscomp$76$$) {
    $resolveResult$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1141$$.$D$, $result$jscomp$70$$, $resolve$jscomp$76$$);
  });
};
$ActivityPorts$$module$third_party$subscriptions_project$swg$$.prototype.open = function($requestId$jscomp$2$$, $url$jscomp$217$$, $target$jscomp$187$$, $opt_args$jscomp$18$$, $opt_options$jscomp$85$$) {
  var $$jscomp$this$jscomp$1143$$ = this, $port$jscomp$9$$ = new $ActivityWindowPort$$module$third_party$subscriptions_project$swg$$(this.$I$, $requestId$jscomp$2$$, $url$jscomp$217$$, $target$jscomp$187$$, $opt_args$jscomp$18$$, $opt_options$jscomp$85$$);
  $port$jscomp$9$$.open().then(function() {
    $JSCompiler_StaticMethods_consumeResultAll_$$($$jscomp$this$jscomp$1143$$, $requestId$jscomp$2$$, $port$jscomp$9$$);
  });
  return {$targetWin$:$port$jscomp$9$$.$G$};
};
$ActivityPorts$$module$third_party$subscriptions_project$swg$$.prototype.$onResult$ = function($JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$, $callback$jscomp$125$$) {
  var $handlers$jscomp$1_port$jscomp$inline_4671$$ = this.$F$[$JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$];
  $handlers$jscomp$1_port$jscomp$inline_4671$$ || ($handlers$jscomp$1_port$jscomp$inline_4671$$ = [], this.$F$[$JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$] = $handlers$jscomp$1_port$jscomp$inline_4671$$);
  $handlers$jscomp$1_port$jscomp$inline_4671$$.push($callback$jscomp$125$$);
  $handlers$jscomp$1_port$jscomp$inline_4671$$ = this.$D$[$JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$];
  if (!$handlers$jscomp$1_port$jscomp$inline_4671$$ && this.$G$) {
    try {
      var $win$jscomp$inline_6480$$ = this.$I$, $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ = $parseQueryString$$module$third_party$subscriptions_project$swg$$(this.$G$).__WA_RES__;
      if ($fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$) {
        var $response$jscomp$inline_6484$$ = JSON.parse($fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$);
        if ($response$jscomp$inline_6484$$ && $response$jscomp$inline_6484$$.requestId == $JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$) {
          var $queryString$jscomp$inline_6785$$ = $win$jscomp$inline_6480$$.location.hash;
          if ($queryString$jscomp$inline_6785$$) {
            var $search$jscomp$inline_6786$$ = (0,window.encodeURIComponent)("__WA_RES__") + "=";
            $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ = -1;
            do {
              if ($fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ = $queryString$jscomp$inline_6785$$.indexOf($search$jscomp$inline_6786$$, $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$), -1 != $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$) {
                var $prev$jscomp$inline_6788$$ = 0 < $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ ? $queryString$jscomp$inline_6785$$.substring($fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ - 1, $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$) : "";
                if ("" == $prev$jscomp$inline_6788$$ || "?" == $prev$jscomp$inline_6788$$ || "#" == $prev$jscomp$inline_6788$$ || "&" == $prev$jscomp$inline_6788$$) {
                  var $end$jscomp$inline_6789$$ = $queryString$jscomp$inline_6785$$.indexOf("&", $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ + 1);
                  -1 == $end$jscomp$inline_6789$$ && ($end$jscomp$inline_6789$$ = $queryString$jscomp$inline_6785$$.length);
                  $queryString$jscomp$inline_6785$$ = $queryString$jscomp$inline_6785$$.substring(0, $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$) + $queryString$jscomp$inline_6785$$.substring($end$jscomp$inline_6789$$ + 1);
                } else {
                  $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$++;
                }
              }
            } while (-1 != $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ && $fragmentParam$jscomp$inline_6483_index$jscomp$inline_6787$$ < $queryString$jscomp$inline_6785$$.length);
          }
          var $JSCompiler_inline_result$jscomp$6678_cleanFragment$jscomp$inline_6485$$ = $queryString$jscomp$inline_6785$$;
          $JSCompiler_inline_result$jscomp$6678_cleanFragment$jscomp$inline_6485$$ = $JSCompiler_inline_result$jscomp$6678_cleanFragment$jscomp$inline_6485$$ || "";
          if ($JSCompiler_inline_result$jscomp$6678_cleanFragment$jscomp$inline_6485$$ != $win$jscomp$inline_6480$$.location.hash && $win$jscomp$inline_6480$$.history && $win$jscomp$inline_6480$$.history.replaceState) {
            try {
              $win$jscomp$inline_6480$$.history.replaceState($win$jscomp$inline_6480$$.history.state, "", $JSCompiler_inline_result$jscomp$6678_cleanFragment$jscomp$inline_6485$$);
            } catch ($e$328$jscomp$inline_6490$$) {
            }
          }
          var $code$jscomp$inline_6486$$ = $response$jscomp$inline_6484$$.code, $data$jscomp$inline_6487$$ = $response$jscomp$inline_6484$$.data, $origin$jscomp$inline_6488$$ = $response$jscomp$inline_6484$$.origin, $referrerOrigin$jscomp$inline_6489$$ = $win$jscomp$inline_6480$$.document.referrer && $getOrigin$$module$third_party$subscriptions_project$swg$$($parseUrl$$module$third_party$subscriptions_project$swg$$($win$jscomp$inline_6480$$.document.referrer));
          $handlers$jscomp$1_port$jscomp$inline_4671$$ = new $ActivityWindowRedirectPort$$module$third_party$subscriptions_project$swg$$($win$jscomp$inline_6480$$, $code$jscomp$inline_6486$$, $data$jscomp$inline_6487$$, $origin$jscomp$inline_6488$$, $origin$jscomp$inline_6488$$ == $referrerOrigin$jscomp$inline_6489$$);
        } else {
          $handlers$jscomp$1_port$jscomp$inline_4671$$ = null;
        }
      } else {
        $handlers$jscomp$1_port$jscomp$inline_4671$$ = null;
      }
    } catch ($e$329$jscomp$inline_4672$$) {
      $throwAsync$$module$third_party$subscriptions_project$swg$$($e$329$jscomp$inline_4672$$), this.$J$($e$329$jscomp$inline_4672$$);
    }
    $handlers$jscomp$1_port$jscomp$inline_4671$$ && (this.$D$[$JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$] = $handlers$jscomp$1_port$jscomp$inline_4671$$);
  }
  ($JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$ = $handlers$jscomp$1_port$jscomp$inline_4671$$) && $JSCompiler_StaticMethods_consumeResult_$$($JSCompiler_inline_result$jscomp$956_requestId$jscomp$3$$, $callback$jscomp$125$$);
};
_.$JSCompiler_prototypeAlias$$ = $AnalyticsContext$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getTransactionId$ = function() {
  return this.$F$;
};
_.$JSCompiler_prototypeAlias$$.$setTransactionId$ = function($value$jscomp$293$$) {
  this.$F$ = $value$jscomp$293$$;
};
_.$JSCompiler_prototypeAlias$$.$getSku$ = function() {
  return this.$D$;
};
_.$JSCompiler_prototypeAlias$$.$setSku$ = function($value$jscomp$298$$) {
  this.$D$ = $value$jscomp$298$$;
};
_.$JSCompiler_prototypeAlias$$.$setReadyToPay$ = function($value$jscomp$299$$) {
  this.$G$ = $value$jscomp$299$$;
};
$AnalyticsRequest$$module$third_party$subscriptions_project$swg$$.prototype.getContext = function() {
  return this.$context_$;
};
var $propertyNameCache$$module$third_party$subscriptions_project$swg$$, $vendorPrefixes$$module$third_party$subscriptions_project$swg$$ = "Webkit webkit Moz moz ms O o".split(" "), $defaultStyles$$module$third_party$subscriptions_project$swg$$ = {"align-content":"normal", animation:"none", "align-items":"normal", "align-self":"auto", "alignment-baseline":"auto", "backface-visibility":"hidden", "background-clip":"border-box", "background-image":"none", "baseline-shift":"0", "block-size":"auto", border:"none", 
"border-collapse":"separate", bottom:"0", "box-sizing":"border-box", "break-after":"auto", "break-before":"auto", "break-inside":"auto", "buffered-rendering":"auto", "caption-side":"top", "caret-color":"rgb(51, 51, 51)", clear:"none", color:"rgb(51, 51, 51)", "color-rendering":"auto", "column-count":"auto", "column-fill":"balance", "column-gap":"normal", "column-rule-color":"rgb(51, 51, 51)", "column-rule-style":"none", "column-rule-width":"0", "column-span":"none", "column-width":"auto", contain:"none", 
"counter-increment":"none", "counter-reset":"none", cursor:"auto", direction:"inherit", display:"block", "empty-cells":"show", filter:"none", flex:"none", "flex-flow":"row nowrap", "float":"none", "flood-color":"rgb(0, 0, 0)", "flood-opacity":"1", font:"none", "font-size":"medium", "font-family":"", height:"auto", hyphens:"manual", "image-rendering":"auto", "inline-size":"", isolation:"auto", "justify-content":"normal", "justify-items":"normal", "justify-self":"auto", "letter-spacing":"normal", "lighting-color":"rgb(255, 255, 255)", 
"line-break":"auto", "line-height":"normal", mask:"none", "max-block-size":"none", "max-height":"none", "max-inline-size":"none", "max-width":"none", "min-block-size":"none", "min-height":"0", "min-inline-size":"0", "min-width":"0", "mix-blend-mode":"normal", "object-fit":"fill", "offset-distance":"none", "offset-path":"none", "offset-rotate":"auto 0deg", opacity:"1", order:"0", orphans:"2", outline:"none", "overflow-anchor":"auto", "overflow-wrap":"normal", overflow:"visible", padding:"0", page:"", 
perspective:"none", "pointer-events":"auto", position:"static", quotes:"", resize:"none", right:"0", "scroll-behavior":"auto", "tab-size":"8", "table-layout":"auto", "text-align":"start", "text-align-last":"auto", "text-anchor":"start", "text-combine-upright":"none", "text-decoration":"none", "text-indent":"0", "text-orientation":"mixed", "text-overflow":"clip", "text-rendering":"auto", "text-shadow":"none", "text-size-adjust":"auto", "text-transform":"none", "text-underline-position":"auto", top:"auto", 
"touch-action":"auto", transform:"none", transition:"none 0s ease 0s", "unicode-bidi":"normal", "user-select":"auto", "vector-effect":"none", "vertical-align":"baseline", visibility:"visible", "white-space":"normal", widows:"2", "word-break":"normal", "word-spacing":"0", "word-wrap":"normal", "writing-mode":"horizontal-tb", zoom:"1", "z-index":"auto"}, $TITLE_LANG_MAP$$module$third_party$subscriptions_project$swg$$ = {en:"Subscribe with Google", ar:"\u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0639\u0628\u0631 Google", 
de:"Abonnieren mit Google", es:"Suscr\u00edbete con Google", "es-latam":"Suscribirse con Google", "es-latn":"Suscribirse con Google", fr:"S'abonner avec Google", hi:"Google \u0915\u0940 \u0938\u0926\u0938\u094d\u092f\u0924\u093e \u0932\u0947\u0902", id:"Berlangganan dengan Google", it:"Abbonati con Google", jp:"Google \u3067\u8cfc\u8aad", ko:"Google \uc744(\ub97c) \ud1b5\ud574 \uad6c\ub3c5", ms:"Langgan dengan Google", nl:"Abonneren met Google", no:"Abonner med Google", pl:"Subskrybuj z Google", 
pt:"Subscrever com o Google", "pt-br":"Fa\u00e7a sua assinatura com Google", ru:"\u041f\u043e\u0434\u043f\u0438\u0448\u0438\u0442\u0435\u0441\u044c \u0447\u0435\u0440\u0435\u0437 Google", se:"Prenumerera med Google", th:"\u0e2a\u0e21\u0e31\u0e04\u0e23\u0e23\u0e31\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e14\u0e49\u0e27\u0e22 Google", tr:"Google ile abone olun", uk:"\u041f\u0456\u0434\u043f\u0438\u0441\u0430\u0442\u0438\u0441\u044f \u0447\u0435\u0440\u0435\u0437 Google", "zh-tw":"\u900f\u904e Google \u8a02\u95b1"};
$ButtonApi$$module$third_party$subscriptions_project$swg$$.prototype.init = function() {
  var $head$jscomp$5$$ = this.$doc_$.$getHead$();
  $head$jscomp$5$$ && ($head$jscomp$5$$.querySelector('link[href="https://news.google.com/swg/js/v1/swg-button.css"]') || $head$jscomp$5$$.appendChild($createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$.$getWin$().document, "link", {rel:"stylesheet", type:"text/css", href:"https://news.google.com/swg/js/v1/swg-button.css"})));
};
$ButtonApi$$module$third_party$subscriptions_project$swg$$.prototype.create = function($optionsOrCallback$$, $opt_callback$jscomp$10$$) {
  var $button$jscomp$7$$ = $createElement$$module$third_party$subscriptions_project$swg$$(this.$doc_$.$getWin$().document, "button", {});
  return this.$attach$($button$jscomp$7$$, $optionsOrCallback$$, $opt_callback$jscomp$10$$);
};
$ButtonApi$$module$third_party$subscriptions_project$swg$$.prototype.$attach$ = function($button$jscomp$8$$, $callback$jscomp$127_optionsOrCallback$jscomp$1$$, $opt_callback$jscomp$11_theme$$) {
  var $options$jscomp$58$$ = "function" != typeof $callback$jscomp$127_optionsOrCallback$jscomp$1$$ ? $callback$jscomp$127_optionsOrCallback$jscomp$1$$ : null;
  $callback$jscomp$127_optionsOrCallback$jscomp$1$$ = ("function" == typeof $callback$jscomp$127_optionsOrCallback$jscomp$1$$ ? $callback$jscomp$127_optionsOrCallback$jscomp$1$$ : null) || $opt_callback$jscomp$11_theme$$;
  $opt_callback$jscomp$11_theme$$ = $options$jscomp$58$$ && $options$jscomp$58$$.theme;
  "light" !== $opt_callback$jscomp$11_theme$$ && "dark" !== $opt_callback$jscomp$11_theme$$ && ($opt_callback$jscomp$11_theme$$ = "light");
  $button$jscomp$8$$.classList.add("swg-button-" + $opt_callback$jscomp$11_theme$$);
  $button$jscomp$8$$.setAttribute("role", "button");
  $options$jscomp$58$$ && $options$jscomp$58$$.lang && $button$jscomp$8$$.setAttribute("lang", $options$jscomp$58$$.lang);
  $button$jscomp$8$$.setAttribute("title", $msg$$module$third_party$subscriptions_project$swg$$($button$jscomp$8$$) || "");
  $button$jscomp$8$$.addEventListener("click", $callback$jscomp$127_optionsOrCallback$jscomp$1$$);
  return $button$jscomp$8$$;
};
$View$$module$third_party$subscriptions_project$swg$$.prototype.$resized$ = function() {
};
var $iframeAttributes$$module$third_party$subscriptions_project$swg$$ = {frameborder:"0", scrolling:"no"};
_.$$jscomp$inherits$$($ActivityIframeView$$module$third_party$subscriptions_project$swg$$, $View$$module$third_party$subscriptions_project$swg$$);
_.$JSCompiler_prototypeAlias$$ = $ActivityIframeView$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getElement$ = function() {
  return this.$iframe_$;
};
_.$JSCompiler_prototypeAlias$$.init = function($dialog$$) {
  var $$jscomp$this$jscomp$1147$$ = this;
  return $JSCompiler_StaticMethods_openIframe$$(this.$iframe_$, this.$src_$, this.$G$).then(function($port$jscomp$13$$) {
    return $JSCompiler_StaticMethods_onOpenIframeResponse_$$($$jscomp$this$jscomp$1147$$, $port$jscomp$13$$, $dialog$$);
  });
};
_.$JSCompiler_prototypeAlias$$.port = function() {
  return this.$J$;
};
_.$JSCompiler_prototypeAlias$$.message = function($data$jscomp$193$$) {
  this.port().then(function($port$jscomp$15$$) {
    $port$jscomp$15$$.message($data$jscomp$193$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$onMessage$ = function($callback$jscomp$139$$) {
  this.port().then(function($port$jscomp$16$$) {
    $port$jscomp$16$$.$onMessage$($callback$jscomp$139$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$acceptResult$ = function() {
  return this.port().then(function($port$jscomp$17$$) {
    return $port$jscomp$17$$.$acceptResult$();
  });
};
_.$JSCompiler_prototypeAlias$$.$whenComplete$ = function() {
  return this.$acceptResult$();
};
_.$JSCompiler_prototypeAlias$$.$resized$ = function() {
  this.$D$ && this.$D$.$resized$();
};
$Entitlements$$module$third_party$subscriptions_project$swg$$.prototype.clone = function() {
  return new $Entitlements$$module$third_party$subscriptions_project$swg$$(this.$service$, this.raw, this.$D$.map(function($ent$$) {
    return $ent$$.clone();
  }), this.$product_$, this.$ackHandler_$, this.$isReadyToPay$);
};
$Entitlements$$module$third_party$subscriptions_project$swg$$.prototype.json = function() {
  return {service:this.$service$, entitlements:this.$D$.map(function($item$jscomp$23$$) {
    return $item$jscomp$23$$.json();
  }), isReadyToPay:this.$isReadyToPay$};
};
$Entitlement$$module$third_party$subscriptions_project$swg$$.prototype.clone = function() {
  return new $Entitlement$$module$third_party$subscriptions_project$swg$$(this.source, this.$D$.slice(0), this.$subscriptionToken$);
};
$Entitlement$$module$third_party$subscriptions_project$swg$$.prototype.json = function() {
  return {source:this.source, products:this.$D$, subscriptionToken:this.$subscriptionToken$};
};
$UserData$$module$third_party$subscriptions_project$swg$$.prototype.clone = function() {
  return new $UserData$$module$third_party$subscriptions_project$swg$$(this.$F$, this.data);
};
$UserData$$module$third_party$subscriptions_project$swg$$.prototype.json = function() {
  return {id:this.id, email:this.$D$, emailVerified:this.$G$, name:this.name, givenName:this.$J$, familyName:this.$I$, pictureUrl:this.$K$};
};
$SubscribeResponse$$module$third_party$subscriptions_project$swg$$.prototype.clone = function() {
  return new $SubscribeResponse$$module$third_party$subscriptions_project$swg$$(this.raw, this.$G$, this.$F$, this.$D$, this.$I$);
};
$SubscribeResponse$$module$third_party$subscriptions_project$swg$$.prototype.json = function() {
  return {purchaseData:this.$G$.json(), userData:this.$F$ ? this.$F$.json() : null, entitlements:this.$D$ ? this.$D$.json() : null};
};
$SubscribeResponse$$module$third_party$subscriptions_project$swg$$.prototype.complete = function() {
  return this.$I$();
};
$PurchaseData$$module$third_party$subscriptions_project$swg$$.prototype.clone = function() {
  return new $PurchaseData$$module$third_party$subscriptions_project$swg$$(this.raw, this.$D$);
};
$PurchaseData$$module$third_party$subscriptions_project$swg$$.prototype.json = function() {
  return {data:this.raw, signature:this.$D$};
};
var $base64UrlDecodeSubs$$module$third_party$subscriptions_project$swg$$ = {"-":"+", _:"/", ".":"="}, $a$$module$third_party$subscriptions_project$swg$$, $cache$$module$third_party$subscriptions_project$swg$$, $CACHE_KEYS$$module$third_party$subscriptions_project$swg$$ = {nocache:1, hr1:3600000, hr12:43200000}, $ReplaceSkuProrationModeMapping$$module$third_party$subscriptions_project$swg$$ = {IMMEDIATE_WITH_TIME_PRORATION:1};
$PayStartFlow$$module$third_party$subscriptions_project$swg$$.prototype.start = function() {
  var $swgPaymentRequest$$ = Object.assign({}, this.$D$, {publicationId:this.$I$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$}), $prorationMode$$ = this.$D$.$replaceSkuProrationMode$;
  $prorationMode$$ && ($swgPaymentRequest$$.$replaceSkuProrationMode$ = $ReplaceSkuProrationModeMapping$$module$third_party$subscriptions_project$swg$$[$prorationMode$$]);
  $JSCompiler_StaticMethods_triggerFlowStarted$$(this.$G$.$callbacks_$, "subscribe", this.$D$);
  this.$F$.$setSku$(this.$D$.$skuId$);
  $JSCompiler_StaticMethods_logEvent$$(this.$F$, 1000);
  this.$J$.start({apiVersion:1, allowedPaymentMethods:["CARD"], environment:"PRODUCTION", playEnvironment:"PROD", swg:$swgPaymentRequest$$, i:{startTimeMs:Date.now(), googleTransactionId:this.$F$.$getTransactionId$()}}, {$forceRedirect$:"redirect" == this.$G$.config().$windowOpenMode$});
  return window.Promise.resolve();
};
$PayCompleteFlow$$module$third_party$subscriptions_project$swg$$.prototype.start = function($response$jscomp$66$$) {
  var $$jscomp$this$jscomp$1149$$ = this;
  if (!this.$F$.$getSku$()) {
    $JSCompiler_StaticMethods_addLabels$$(this.$F$, ["redirect"]);
    var $args$jscomp$57_sku$$ = $parseSkuFromPurchaseDataSafe$$module$third_party$subscriptions_project$swg$$($response$jscomp$66$$.$G$);
    $args$jscomp$57_sku$$ && this.$F$.$setSku$($args$jscomp$57_sku$$);
  }
  $JSCompiler_StaticMethods_logEvent$$(this.$F$, 1001);
  this.$G$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$.reset(!0);
  $args$jscomp$57_sku$$ = {publicationId:this.$G$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$};
  $response$jscomp$66$$.$F$ && $response$jscomp$66$$.$D$ ? ($args$jscomp$57_sku$$.idToken = $response$jscomp$66$$.$F$.$F$, $JSCompiler_StaticMethods_pushNextEntitlements$$(this.$G$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$, $response$jscomp$66$$.$D$.raw)) : $args$jscomp$57_sku$$.loginHint = $response$jscomp$66$$.$F$ && $response$jscomp$66$$.$F$.$D$;
  this.$D$ = new $ActivityIframeView$$module$third_party$subscriptions_project$swg$$(this.$O$, this.$K$, $feUrl$$module$third_party$subscriptions_project$swg$$("/payconfirmiframe"), $feArgs$$module$third_party$subscriptions_project$swg$$($args$jscomp$57_sku$$), !0);
  this.$D$.$onMessage$(function($response$jscomp$66$$) {
    $response$jscomp$66$$.entitlements && $JSCompiler_StaticMethods_pushNextEntitlements$$($$jscomp$this$jscomp$1149$$.$G$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$, $response$jscomp$66$$.entitlements);
  });
  this.$D$.$acceptResult$().then(function() {
    $JSCompiler_StaticMethods_completeView$$($$jscomp$this$jscomp$1149$$.$J$, $$jscomp$this$jscomp$1149$$.$D$);
  });
  return this.$I$ = this.$J$.$openView$(this.$D$);
};
$PayCompleteFlow$$module$third_party$subscriptions_project$swg$$.prototype.complete = function() {
  var $$jscomp$this$jscomp$1150$$ = this;
  $JSCompiler_StaticMethods_logEvent$$(this.$F$, 1002);
  this.$G$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$.$blockNextNotification_$ = !1;
  this.$I$.then(function() {
    $$jscomp$this$jscomp$1150$$.$D$.message({complete:!0});
  });
  return this.$D$.$acceptResult$().catch(function() {
  }).then(function() {
    $JSCompiler_StaticMethods_logEvent$$($$jscomp$this$jscomp$1150$$.$F$, 1003);
    $JSCompiler_StaticMethods_setToastShown$$($$jscomp$this$jscomp$1150$$.$G$.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$);
  });
};
_.$JSCompiler_prototypeAlias$$ = $GlobalDoc$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getWin$ = function() {
  return this.$D$;
};
_.$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.$doc_$;
};
_.$JSCompiler_prototypeAlias$$.$getRootElement$ = function() {
  return this.$doc_$.documentElement;
};
_.$JSCompiler_prototypeAlias$$.$getHead$ = function() {
  return this.$doc_$.head;
};
_.$JSCompiler_prototypeAlias$$.$getBody$ = function() {
  return this.$doc_$.body;
};
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return $whenDocumentReady$$module$third_party$subscriptions_project$swg$$(this.$doc_$);
};
_.$JSCompiler_prototypeAlias$$ = $Graypane$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getElement$ = function() {
  return this.$fadeBackground_$;
};
_.$JSCompiler_prototypeAlias$$.$attach$ = function() {
  this.$doc_$.$getBody$().appendChild(this.$fadeBackground_$);
};
_.$JSCompiler_prototypeAlias$$.$destroy$ = function() {
  this.$doc_$.$getBody$().removeChild(this.$fadeBackground_$);
};
_.$JSCompiler_prototypeAlias$$.show = function($animated$$) {
  $animated$$ = void 0 === $animated$$ ? !0 : $animated$$;
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$(this.$fadeBackground_$, {display:"block", opacity:$animated$$ ? 0 : 1});
  if ($animated$$) {
    return $transition$$module$third_party$subscriptions_project$swg$$(this.$fadeBackground_$, {opacity:1}, 300);
  }
};
_.$JSCompiler_prototypeAlias$$.$hide$ = function($animated$jscomp$1$$) {
  var $$jscomp$this$jscomp$1152$$ = this;
  if (void 0 === $animated$jscomp$1$$ || $animated$jscomp$1$$) {
    return $transition$$module$third_party$subscriptions_project$swg$$(this.$fadeBackground_$, {opacity:0}, 300).then(function() {
      $setImportantStyles$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1152$$.$fadeBackground_$, {display:"none"});
    });
  }
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$(this.$fadeBackground_$, {display:"none"});
};
$LoadingView$$module$third_party$subscriptions_project$swg$$.prototype.$getElement$ = function() {
  return this.$D$;
};
$LoadingView$$module$third_party$subscriptions_project$swg$$.prototype.show = function() {
  this.$D$.style.removeProperty("display");
};
$LoadingView$$module$third_party$subscriptions_project$swg$$.prototype.$hide$ = function() {
  this.$D$.style.setProperty("display", "none", "important");
};
var $friendlyIframeAttributes$$module$third_party$subscriptions_project$swg$$ = {frameborder:0, scrolling:"no", src:"about:blank"};
$FriendlyIframe$$module$third_party$subscriptions_project$swg$$.prototype.$whenReady$ = function() {
  return this.$ready_$;
};
$FriendlyIframe$$module$third_party$subscriptions_project$swg$$.prototype.$getElement$ = function() {
  return this.$iframe_$;
};
$FriendlyIframe$$module$third_party$subscriptions_project$swg$$.prototype.$getBody$ = function() {
  return $JSCompiler_StaticMethods_getDocument$$(this).body;
};
$FriendlyIframe$$module$third_party$subscriptions_project$swg$$.prototype.isConnected = function() {
  var $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$ = this.$getElement$();
  if ("isConnected" in $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$) {
    $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$ = $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$.isConnected;
  } else {
    var $root$jscomp$inline_4740$$ = $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$.ownerDocument && $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$.ownerDocument.documentElement;
    $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$ = $root$jscomp$inline_4740$$ && $root$jscomp$inline_4740$$.contains($JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$) || !1;
  }
  return $JSCompiler_inline_result$jscomp$964_node$jscomp$inline_4739$$;
};
var $rootElementImportantStyles$$module$third_party$subscriptions_project$swg$$ = {"min-height":"50px", border:"none", display:"block", position:"fixed", "z-index":2147483647, "box-sizing":"border-box"}, $resetViewStyles$$module$third_party$subscriptions_project$swg$$ = {position:"absolute", top:"0", left:"0", right:"0", bottom:"0", opacity:0, height:0, "max-height":"100%", "max-width":"100%", "min-height":"100%", "min-width":"100%", width:0};
$Dialog$$module$third_party$subscriptions_project$swg$$.prototype.open = function($hidden$jscomp$6$$) {
  var $$jscomp$this$jscomp$1154$$ = this;
  $hidden$jscomp$6$$ = void 0 === $hidden$jscomp$6$$ ? !1 : $hidden$jscomp$6$$;
  var $iframe$jscomp$86$$ = this.$iframe_$;
  if ($iframe$jscomp$86$$.isConnected()) {
    throw Error("already opened");
  }
  this.$doc_$.$getBody$().appendChild($iframe$jscomp$86$$.$getElement$());
  this.$F$.$attach$();
  $hidden$jscomp$6$$ ? ($setImportantStyles$$module$third_party$subscriptions_project$swg$$($iframe$jscomp$86$$.$getElement$(), {visibility:"hidden", opacity:0}), this.$G$ = $hidden$jscomp$6$$) : $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$$(this);
  return $iframe$jscomp$86$$.$whenReady$().then(function() {
    var $hidden$jscomp$6$$ = $$jscomp$this$jscomp$1154$$.$iframe_$.$getBody$(), $iframe$jscomp$86$$ = $JSCompiler_StaticMethods_getDocument$$($$jscomp$this$jscomp$1154$$.$iframe_$);
    $injectStyleSheet$$module$third_party$subscriptions_project$swg$$($resolveDoc$$module$third_party$subscriptions_project$swg$$($iframe$jscomp$86$$), "body{padding:0;margin:0}swg-container,swg-loading,swg-loading-animate,swg-loading-image{display:block}swg-loading-container{width:100%!important;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;min-height:148px!important;height:100%!important;bottom:0!important;margin-top:5px!important;z-index:2147483647!important}@media (min-height:630px), (min-width:630px){swg-loading-container{width:560px!important;margin-left:35px!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;background-color:#fff!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}swg-loading{z-index:2147483647!important;width:36px;height:36px;overflow:hidden;-webkit-animation:mspin-rotate 1568.63ms infinite linear;animation:mspin-rotate 1568.63ms infinite linear}swg-loading-animate{-webkit-animation:mspin-revrot 5332ms infinite steps(4);animation:mspin-revrot 5332ms infinite steps(4)}swg-loading-image{background-image:url(https://news.google.com/swg/js/v1/loader.svg);background-size:100%;width:11664px;height:36px;-webkit-animation:swg-loading-film 5332ms infinite steps(324);animation:swg-loading-film 5332ms infinite steps(324)}@-webkit-keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@-webkit-keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}@keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}\n/*# sourceURL=/./src/ui/ui.css*/");
    $$jscomp$this$jscomp$1154$$.$I$ = new $LoadingView$$module$third_party$subscriptions_project$swg$$($iframe$jscomp$86$$);
    $hidden$jscomp$6$$.appendChild($$jscomp$this$jscomp$1154$$.$I$.$getElement$());
    $$jscomp$this$jscomp$1154$$.$container_$ = $createElement$$module$third_party$subscriptions_project$swg$$($iframe$jscomp$86$$, "swg-container", {});
    $hidden$jscomp$6$$.appendChild($$jscomp$this$jscomp$1154$$.$container_$);
    $setImportantStyles$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1154$$.$getElement$(), {bottom:0});
    return $$jscomp$this$jscomp$1154$$;
  });
};
$Dialog$$module$third_party$subscriptions_project$swg$$.prototype.close = function($animated$jscomp$2$$) {
  var $$jscomp$this$jscomp$1155$$ = this;
  return (void 0 === $animated$jscomp$2$$ || $animated$jscomp$2$$ ? $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$animate_$$(this, function() {
    $$jscomp$this$jscomp$1155$$.$F$.$hide$(!0);
    return $transition$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1155$$.$getElement$(), {transform:"translateY(100%)"}, 300);
  }) : window.Promise.resolve()).then(function() {
    $$jscomp$this$jscomp$1155$$.$doc_$.$getBody$().removeChild($$jscomp$this$jscomp$1155$$.$iframe_$.$getElement$());
    $$jscomp$this$jscomp$1155$$.$doc_$.$getRootElement$().style.removeProperty("padding-bottom");
    $$jscomp$this$jscomp$1155$$.$F$.$destroy$();
  });
};
$Dialog$$module$third_party$subscriptions_project$swg$$.prototype.$getElement$ = function() {
  return this.$iframe_$.$getElement$();
};
$Dialog$$module$third_party$subscriptions_project$swg$$.prototype.$openView$ = function($view$jscomp$10$$) {
  var $$jscomp$this$jscomp$1156$$ = this;
  $setImportantStyles$$module$third_party$subscriptions_project$swg$$($view$jscomp$10$$.$getElement$(), $resetViewStyles$$module$third_party$subscriptions_project$swg$$);
  this.$D$ && this.$D$.$hasLoadingIndicator_$ ? this.$J$ = this.$D$ : ($JSCompiler_StaticMethods_getContainer$$(this).textContent = "", this.$I$.show());
  this.$D$ = $view$jscomp$10$$;
  $JSCompiler_StaticMethods_getContainer$$(this).appendChild($view$jscomp$10$$.$getElement$());
  $view$jscomp$10$$.$shouldFadeBody_$ && !this.$G$ && this.$F$.show(!0);
  return $view$jscomp$10$$.init(this).then(function() {
    $setImportantStyles$$module$third_party$subscriptions_project$swg$$($view$jscomp$10$$.$getElement$(), {opacity:1});
    $$jscomp$this$jscomp$1156$$.$G$ && ($view$jscomp$10$$.$shouldFadeBody_$ && $$jscomp$this$jscomp$1156$$.$F$.show(!0), $JSCompiler_StaticMethods_Dialog$$module$third_party$subscriptions_project$swg_prototype$show_$$($$jscomp$this$jscomp$1156$$));
    if ($$jscomp$this$jscomp$1156$$.$J$) {
      var $element$jscomp$inline_6505$$ = $$jscomp$this$jscomp$1156$$.$J$.$getElement$();
      $element$jscomp$inline_6505$$.parentElement && $element$jscomp$inline_6505$$.parentElement.removeChild($element$jscomp$inline_6505$$);
      $$jscomp$this$jscomp$1156$$.$J$ = null;
    } else {
      $$jscomp$this$jscomp$1156$$.$I$.$hide$();
    }
  });
};
$DialogManager$$module$third_party$subscriptions_project$swg$$.prototype.openDialog = function($hidden$jscomp$7$$) {
  $hidden$jscomp$7$$ = void 0 === $hidden$jscomp$7$$ ? !1 : $hidden$jscomp$7$$;
  this.$G$ || (this.$D$ = new $Dialog$$module$third_party$subscriptions_project$swg$$(this.$doc_$), this.$G$ = this.$D$.open($hidden$jscomp$7$$));
  return this.$G$;
};
$DialogManager$$module$third_party$subscriptions_project$swg$$.prototype.$openView$ = function($view$jscomp$12$$) {
  var $$jscomp$this$jscomp$1161$$ = this;
  var $hidden$jscomp$8$$ = void 0 === $hidden$jscomp$8$$ ? !1 : $hidden$jscomp$8$$;
  $view$jscomp$12$$.$whenComplete$().catch(function($hidden$jscomp$8$$) {
    $activityPorts$$module$third_party$subscriptions_project$swg$isAbortError$$($hidden$jscomp$8$$) && $JSCompiler_StaticMethods_completeView$$($$jscomp$this$jscomp$1161$$, $view$jscomp$12$$);
    throw $hidden$jscomp$8$$;
  });
  return this.openDialog($hidden$jscomp$8$$).then(function($$jscomp$this$jscomp$1161$$) {
    return $$jscomp$this$jscomp$1161$$.$openView$($view$jscomp$12$$);
  });
};
var $toastImportantStyles$$module$third_party$subscriptions_project$swg$$ = {height:0}, $iframeAttributes$1$$module$third_party$subscriptions_project$swg$$ = {frameborder:"0", scrolling:"no", "class":"swg-toast"};
$Toast$$module$third_party$subscriptions_project$swg$$.prototype.$getElement$ = function() {
  return this.$iframe_$;
};
$Toast$$module$third_party$subscriptions_project$swg$$.prototype.open = function() {
  this.$doc_$.$getBody$().appendChild(this.$iframe_$);
  return $JSCompiler_StaticMethods_buildToast_$$(this);
};
$Toast$$module$third_party$subscriptions_project$swg$$.prototype.close = function() {
  var $$jscomp$this$jscomp$1166$$ = this;
  return $JSCompiler_StaticMethods_Toast$$module$third_party$subscriptions_project$swg_prototype$animate_$$(this, function() {
    $$jscomp$this$jscomp$1166$$.$doc_$.$getWin$().setTimeout(function() {
      $$jscomp$this$jscomp$1166$$.$doc_$.$getBody$().removeChild($$jscomp$this$jscomp$1166$$.$iframe_$);
      return window.Promise.resolve();
    }, 500);
    return $transition$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1166$$.$iframe_$, {transform:"translateY(100%)", opacity:1, visibility:"visible"}, 400);
  });
};
$EntitlementsManager$$module$third_party$subscriptions_project$swg$$.prototype.reset = function($opt_expectPositive$$) {
  this.$G$ = null;
  this.$F$ = Math.max(this.$F$, $opt_expectPositive$$ ? 3 : 0);
  $opt_expectPositive$$ && (this.$D$.remove("ents"), this.$D$.remove("isreadytopay"));
};
$EntitlementsManager$$module$third_party$subscriptions_project$swg$$.prototype.clear = function() {
  this.$G$ = null;
  this.$F$ = 0;
  this.$blockNextNotification_$ = !1;
  this.$D$.remove("ents");
  this.$D$.remove("toast");
  this.$D$.remove("isreadytopay");
};
$EntitlementsManager$$module$third_party$subscriptions_project$swg$$.prototype.$U$ = function($entitlements$jscomp$11$$) {
  $JSCompiler_StaticMethods_getEntitlementFor$$($entitlements$jscomp$11$$, $entitlements$jscomp$11$$.$product_$) && $JSCompiler_StaticMethods_setToastShown$$(this);
};
var $allowedMethods_$$module$third_party$subscriptions_project$swg$$ = ["GET", "POST"], $allowedFetchTypes_$$module$third_party$subscriptions_project$swg$$ = {document:1, text:2};
$Xhr$$module$third_party$subscriptions_project$swg$$.prototype.$D$ = function($input$jscomp$97$$, $init$jscomp$18$$) {
  $assert$$module$third_party$subscriptions_project$swg$$("string" == typeof $input$jscomp$97$$, "Only URL supported: %s", $input$jscomp$97$$);
  var $creds$jscomp$1$$ = $init$jscomp$18$$.credentials;
  $assert$$module$third_party$subscriptions_project$swg$$(void 0 === $creds$jscomp$1$$ || "include" == $creds$jscomp$1$$ || "omit" == $creds$jscomp$1$$, "Only credentials=include|omit support: %s", $creds$jscomp$1$$);
  return "document" == $init$jscomp$18$$.responseType ? $fetchPolyfill$$module$third_party$subscriptions_project$swg$$($input$jscomp$97$$, $init$jscomp$18$$) : (this.$win$.fetch || $fetchPolyfill$$module$third_party$subscriptions_project$swg$$).apply(null, arguments);
};
$Xhr$$module$third_party$subscriptions_project$swg$$.prototype.fetch = function($input$jscomp$98$$, $init$jscomp$19_opt_init$jscomp$14$$) {
  $init$jscomp$19_opt_init$jscomp$14$$ = $setupInit$$module$third_party$subscriptions_project$swg$$($init$jscomp$19_opt_init$jscomp$14$$);
  return this.$D$($input$jscomp$98$$, $init$jscomp$19_opt_init$jscomp$14$$).then(function($input$jscomp$98$$) {
    return $input$jscomp$98$$;
  }, function($init$jscomp$19_opt_init$jscomp$14$$) {
    var $reason$jscomp$46$$ = $parseUrl$1$$module$third_party$subscriptions_project$swg$$($input$jscomp$98$$).origin;
    throw Error("XHR Failed fetching" + (" (" + $reason$jscomp$46$$ + "/...):"), $init$jscomp$19_opt_init$jscomp$14$$ && $init$jscomp$19_opt_init$jscomp$14$$.message);
  }).then(function($input$jscomp$98$$) {
    return $assertSuccess$$module$third_party$subscriptions_project$swg$$($input$jscomp$98$$);
  });
};
_.$JSCompiler_prototypeAlias$$ = $FetchResponse$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.clone = function() {
  $assert$$module$third_party$subscriptions_project$swg$$(!this.$D$, "Body already used");
  return new $FetchResponse$$module$third_party$subscriptions_project$swg$$(this.$xhr_$);
};
_.$JSCompiler_prototypeAlias$$.text = function() {
  return $JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$$(this);
};
_.$JSCompiler_prototypeAlias$$.json = function() {
  return $JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$$(this).then($parseJson$$module$third_party$subscriptions_project$swg$$);
};
_.$JSCompiler_prototypeAlias$$.$document_$ = function() {
  $assert$$module$third_party$subscriptions_project$swg$$(!this.$D$, "Body already used");
  this.$D$ = !0;
  $assert$$module$third_party$subscriptions_project$swg$$(this.$xhr_$.responseXML, "responseXML should exist. Make sure to return Content-Type: text/html header.");
  return window.Promise.resolve($assert$$module$third_party$subscriptions_project$swg$$(this.$xhr_$.responseXML));
};
_.$JSCompiler_prototypeAlias$$.arrayBuffer = function() {
  return $JSCompiler_StaticMethods_FetchResponse$$module$third_party$subscriptions_project$swg_prototype$drainText_$$(this).then($utf8EncodeSync$$module$third_party$subscriptions_project$swg$$);
};
$FetchResponseHeaders$$module$third_party$subscriptions_project$swg$$.prototype.get = function($name$jscomp$270$$) {
  return this.$xhr_$.getResponseHeader($name$jscomp$270$$);
};
$FetchResponseHeaders$$module$third_party$subscriptions_project$swg$$.prototype.has = function($name$jscomp$271$$) {
  return null != this.$xhr_$.getResponseHeader($name$jscomp$271$$);
};
$XhrFetcher$$module$third_party$subscriptions_project$swg$$.prototype.$fetchCredentialedJson$ = function($url$jscomp$227$$) {
  return this.$xhr_$.fetch($url$jscomp$227$$, {method:"GET", headers:{Accept:"text/plain, application/json"}, credentials:"include"}).then(function($url$jscomp$227$$) {
    return $url$jscomp$227$$.json();
  });
};
$JsError$$module$third_party$subscriptions_project$swg$$.prototype.error = function($var_args$jscomp$87$$) {
  var $$jscomp$this$jscomp$1173$$ = this, $args$jscomp$59$$ = Array.prototype.slice.call(arguments, 0);
  return this.$D$.then(function() {
    var $var_args$jscomp$87$$ = $createErrorVargs$$module$third_party$subscriptions_project$swg$$.apply(null, $args$jscomp$59$$);
    $var_args$jscomp$87$$.$reported$ || ($$jscomp$this$jscomp$1173$$.$doc_$.$getWin$().document.createElement("img").src = "https://news.google.com/_/SubscribewithgoogleClientUi/jserror?error=" + (0,window.encodeURIComponent)(String($var_args$jscomp$87$$)) + "&script=" + (0,window.encodeURIComponent)("https://news.google.com/swg/js/v1/swg.js") + "&line=" + ($var_args$jscomp$87$$.lineNumber || 1) + "&trace=" + (0,window.encodeURIComponent)($var_args$jscomp$87$$.stack), $var_args$jscomp$87$$.$reported$ = 
    !0);
  });
};
$LinkbackFlow$$module$third_party$subscriptions_project$swg$$.prototype.start = function() {
  $JSCompiler_StaticMethods_triggerFlowStarted$$(this.$D$.$callbacks_$, "linkAccount");
  var $forceRedirect_opener$jscomp$2$$ = "redirect" == this.$D$.config().$windowOpenMode$;
  $forceRedirect_opener$jscomp$2$$ = this.$F$.open("swg-link", $feUrl$$module$third_party$subscriptions_project$swg$$("/linkbackstart"), $forceRedirect_opener$jscomp$2$$ ? "_top" : "_blank", $feArgs$$module$third_party$subscriptions_project$swg$$({publicationId:this.$I$.$PageConfig$$module$third_party$subscriptions_project$config$publicationId_$}), {});
  $JSCompiler_StaticMethods_popupOpened$$(this.$G$, $forceRedirect_opener$jscomp$2$$ && $forceRedirect_opener$jscomp$2$$.$targetWin$);
  return window.Promise.resolve();
};
$LinkCompleteFlow$$module$third_party$subscriptions_project$swg$$.prototype.start = function() {
  var $$jscomp$this$jscomp$1175$$ = this;
  this.$F$.port().then(function($$jscomp$this$jscomp$1175$$) {
    return $acceptPortResultData$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1175$$, !0, !0);
  }).then(function($response$jscomp$75$$) {
    $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($$jscomp$this$jscomp$1175$$.$callbacks_$, 6, !0);
    var $JSCompiler_StaticMethods_resetCallback_$self$jscomp$inline_6794$$ = $$jscomp$this$jscomp$1175$$.$callbacks_$;
    5 in $JSCompiler_StaticMethods_resetCallback_$self$jscomp$inline_6794$$.$D$ && delete $JSCompiler_StaticMethods_resetCallback_$self$jscomp$inline_6794$$.$D$[5];
    $JSCompiler_StaticMethods_setToastShown$$($$jscomp$this$jscomp$1175$$.$D$);
    $$jscomp$this$jscomp$1175$$.$D$.$blockNextNotification_$ = !1;
    $$jscomp$this$jscomp$1175$$.$D$.reset($response$jscomp$75$$ && $response$jscomp$75$$.success || !1);
    $response$jscomp$75$$ && $response$jscomp$75$$.entitlements && $JSCompiler_StaticMethods_pushNextEntitlements$$($$jscomp$this$jscomp$1175$$.$D$, $response$jscomp$75$$.entitlements);
    $$jscomp$this$jscomp$1175$$.$I$();
  }).catch(function($$jscomp$this$jscomp$1175$$) {
    (0,window.setTimeout)(function() {
      throw $$jscomp$this$jscomp$1175$$;
    });
  }).then(function() {
    $JSCompiler_StaticMethods_completeView$$($$jscomp$this$jscomp$1175$$.$G$, $$jscomp$this$jscomp$1175$$.$F$);
  });
  return this.$G$.$openView$(this.$F$);
};
$LinkCompleteFlow$$module$third_party$subscriptions_project$swg$$.prototype.$whenComplete$ = function() {
  return this.$O$;
};
var $Constants$$module$third_party$subscriptions_project$swg$Environment$$ = {$LOCAL$:"LOCAL", $PREPROD$:"PREPROD", $PRODUCTION$:"PRODUCTION", $SANDBOX$:"SANDBOX", $TEST$:"TEST", $TIN$:"TIN"}, $Constants$$module$third_party$subscriptions_project$swg$PaymentMethod$$ = {$CARD$:"CARD", $TOKENIZED_CARD$:"TOKENIZED_CARD", $UPI$:"UPI"}, $Constants$$module$third_party$subscriptions_project$swg$AuthMethod$$ = {$CRYPTOGRAM_3DS$:"CRYPTOGRAM_3DS", $PAN_ONLY$:"PAN_ONLY"}, $Constants$$module$third_party$subscriptions_project$swg$TotalPriceStatus$$ = 
{$ESTIMATED$:"ESTIMATED", $FINAL$:"FINAL", $NOT_CURRENTLY_KNOWN$:"NOT_CURRENTLY_KNOWN"};
$PaymentsRequestDelegate$$module$third_party$subscriptions_project$swg$$.prototype.$onResult$ = function($callback$jscomp$146$$) {
  this.$D$ = $callback$jscomp$146$$;
};
$PaymentsRequestDelegate$$module$third_party$subscriptions_project$swg$$.prototype.$isReadyToPay$ = function($isReadyToPayRequest$$) {
  var $paymentRequest$$ = $JSCompiler_StaticMethods_createPaymentRequest_$$($isReadyToPayRequest$$);
  return new window.Promise(function($resolve$jscomp$88$$) {
    $paymentRequest$$.$canMakePayment$().then(function($paymentRequest$$) {
      window.sessionStorage.setItem("google.payments.api.storage.isreadytopay.result", $paymentRequest$$.toString());
      var $result$jscomp$74$$ = {result:$paymentRequest$$};
      2 <= $isReadyToPayRequest$$.$apiVersion$ && $isReadyToPayRequest$$.$existingPaymentMethodRequired$ && ($result$jscomp$74$$.paymentMethodPresent = $paymentRequest$$);
      $resolve$jscomp$88$$($result$jscomp$74$$);
    }).catch(function() {
      window.sessionStorage.getItem("google.payments.api.storage.isreadytopay.result") ? $resolve$jscomp$88$$({result:"true" == window.sessionStorage.getItem("google.payments.api.storage.isreadytopay.result")}) : $resolve$jscomp$88$$({result:!1});
    });
  });
};
$PaymentsRequestDelegate$$module$third_party$subscriptions_project$swg$$.prototype.$loadPaymentData$ = function($paymentDataRequest$jscomp$1$$) {
  $JSCompiler_StaticMethods_loadPaymentDataThroughPaymentRequest_$$(this, $paymentDataRequest$jscomp$1$$);
};
$Graypane$1$$module$third_party$subscriptions_project$swg$$.prototype.show = function($popupWindow$$) {
  this.$popupWindow_$ = $popupWindow$$ || null;
  this.$doc_$.body.appendChild(this.$element_$);
  $setImportantStyles$1$$module$third_party$subscriptions_project$swg$$(this.$element_$, {display:"block", opacity:0});
  return $transition$1$$module$third_party$subscriptions_project$swg$$(this.$element_$, {opacity:1});
};
$Graypane$1$$module$third_party$subscriptions_project$swg$$.prototype.$hide$ = function() {
  var $$jscomp$this$jscomp$1180$$ = this;
  this.$popupWindow_$ = null;
  if (this.$element_$.parentElement) {
    return $transition$1$$module$third_party$subscriptions_project$swg$$(this.$element_$, {opacity:0}).then(function() {
      $setImportantStyles$1$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1180$$.$element_$, {display:"none"});
      $$jscomp$this$jscomp$1180$$.$doc_$.body.removeChild($$jscomp$this$jscomp$1180$$.$element_$);
    });
  }
};
$PostMessageService$$module$third_party$subscriptions_project$swg$$.prototype.postMessage = function($message$jscomp$80$$, $targetOrigin$jscomp$9$$) {
  this.$D$.postMessage($message$jscomp$80$$, $targetOrigin$jscomp$9$$);
};
var $iframe$$module$third_party$subscriptions_project$swg$$ = null, $postMessageService$$module$third_party$subscriptions_project$swg$$ = null, $environment$$module$third_party$subscriptions_project$swg$$ = null, $googleTransactionId$$module$third_party$subscriptions_project$swg$$ = null, $originTimeMs$$module$third_party$subscriptions_project$swg$$ = Date.now(), $buyFlowActivityMode$$module$third_party$subscriptions_project$swg$$ = null, $iframeLoaded$$module$third_party$subscriptions_project$swg$$ = 
!1, $buffer$$module$third_party$subscriptions_project$swg$$ = [];
$iframe$$module$third_party$subscriptions_project$swg$$ || ($environment$$module$third_party$subscriptions_project$swg$$ = (window.gpayInitParams || {}).$environment$ || "PRODUCTION", $iframe$$module$third_party$subscriptions_project$swg$$ = window.document.createElement("iframe"), $iframe$$module$third_party$subscriptions_project$swg$$.src = "https://pay" + ("PREPROD" == $environment$$module$third_party$subscriptions_project$swg$$ ? "-preprod.sandbox" : "SANDBOX" == $environment$$module$third_party$subscriptions_project$swg$$ ? 
".sandbox" : "") + ".google.com/gp/p/ui/payframe?origin=" + window.location.origin + "&mid=%{merchantId}", $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:15, clientLatencyStartMs:Date.now()}), $iframe$$module$third_party$subscriptions_project$swg$$.height = "0", $iframe$$module$third_party$subscriptions_project$swg$$.width = "0", $iframe$$module$third_party$subscriptions_project$swg$$.style.display = "none", $iframe$$module$third_party$subscriptions_project$swg$$.style.visibility = 
"hidden", $iframe$$module$third_party$subscriptions_project$swg$$.onload = function() {
  $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:17, clientLatencyStartMs:Date.now()});
  $PayFrameHelper$$module$third_party$subscriptions_project$swg$iframeLoaded$$();
}, window.document.body ? (window.document.body.appendChild($iframe$$module$third_party$subscriptions_project$swg$$), $postMessageService$$module$third_party$subscriptions_project$swg$$ = new $PostMessageService$$module$third_party$subscriptions_project$swg$$) : window.document.addEventListener("DOMContentLoaded", function() {
  window.document.body.appendChild($iframe$$module$third_party$subscriptions_project$swg$$);
  $postMessageService$$module$third_party$subscriptions_project$swg$$ = new $PostMessageService$$module$third_party$subscriptions_project$swg$$;
}));
$PaymentsWebActivityDelegate$$module$third_party$subscriptions_project$swg$$.prototype.$onResult$ = function($callback$jscomp$150$$) {
  this.$F$ || (this.$F$ = $callback$jscomp$150$$, this.$activities$.$onResult$("GPAY", this.$J$.bind(this)));
};
$PaymentsWebActivityDelegate$$module$third_party$subscriptions_project$swg$$.prototype.$J$ = function($port$jscomp$23$$) {
  var $$jscomp$this$jscomp$1181$$ = this;
  this.$G$.$hide$();
  this.$F$($port$jscomp$23$$.$acceptResult$().then(function($port$jscomp$23$$) {
    if ($port$jscomp$23$$.origin != $JSCompiler_StaticMethods_getOrigin_$$($$jscomp$this$jscomp$1181$$)) {
      throw Error("channel mismatch");
    }
    var $result$jscomp$75$$ = $port$jscomp$23$$.data;
    if ($result$jscomp$75$$.redirectEncryptedCallbackData) {
      return $buyFlowActivityMode$$module$third_party$subscriptions_project$swg$$ = 3, $JSCompiler_StaticMethods_fetchRedirectResponse_$$($$jscomp$this$jscomp$1181$$, $result$jscomp$75$$.redirectEncryptedCallbackData).then(function($port$jscomp$23$$) {
        var $$jscomp$this$jscomp$1181$$ = Object.assign({}, $result$jscomp$75$$);
        delete $$jscomp$this$jscomp$1181$$.redirectEncryptedCallbackData;
        return Object.assign($$jscomp$this$jscomp$1181$$, $port$jscomp$23$$);
      });
    }
    if (!$port$jscomp$23$$.$originVerified$ || !$port$jscomp$23$$.$secureChannel$) {
      throw Error("channel mismatch");
    }
    return $result$jscomp$75$$;
  }, function($port$jscomp$23$$) {
    var $$jscomp$this$jscomp$1181$$ = $port$jscomp$23$$.message;
    $port$jscomp$23$$ = $port$jscomp$23$$.message;
    try {
      $port$jscomp$23$$ = JSON.parse($$jscomp$this$jscomp$1181$$.substring(7));
    } catch ($e$345$$) {
    }
    $port$jscomp$23$$.statusCode && -1 == ["DEVELOPER_ERROR", "MERCHANT_ACCOUNT_ERROR"].indexOf($port$jscomp$23$$.statusCode) && ($port$jscomp$23$$ = {statusCode:"CANCELED"});
    "AbortError" == $port$jscomp$23$$ && ($port$jscomp$23$$ = {statusCode:"CANCELED"});
    return window.Promise.reject($port$jscomp$23$$);
  }));
};
$PaymentsWebActivityDelegate$$module$third_party$subscriptions_project$swg$$.prototype.$isReadyToPay$ = function($isReadyToPayRequest$jscomp$6$$) {
  var $$jscomp$this$jscomp$1183$$ = this;
  return new window.Promise(function($resolve$jscomp$91$$) {
    if ($doesMerchantSupportOnlyTokenizedCards$$module$third_party$subscriptions_project$swg$$($isReadyToPayRequest$jscomp$6$$)) {
      $resolve$jscomp$91$$({result:!1});
    } else {
      var $userAgent$jscomp$1$$ = window.navigator.userAgent;
      if (0 < $userAgent$jscomp$1$$.indexOf("GSA/") && 0 < $userAgent$jscomp$1$$.indexOf("Safari")) {
        $resolve$jscomp$91$$({result:!1});
      } else {
        if (0 < $userAgent$jscomp$1$$.indexOf("FxiOS")) {
          $resolve$jscomp$91$$({result:!1});
        } else {
          var $isSupported$jscomp$6$$ = 0 < $userAgent$jscomp$1$$.indexOf("Chrome") || 0 < $userAgent$jscomp$1$$.indexOf("Firefox") || 0 < $userAgent$jscomp$1$$.indexOf("Safari");
          $isSupported$jscomp$6$$ && 2 <= $isReadyToPayRequest$jscomp$6$$.$apiVersion$ && $isReadyToPayRequest$jscomp$6$$.$existingPaymentMethodRequired$ ? ($isReadyToPayRequest$jscomp$6$$.$environment$ = $$jscomp$this$jscomp$1183$$.$D$, $PayFrameHelper$$module$third_party$subscriptions_project$swg$sendAndWaitForResponse$$($isReadyToPayRequest$jscomp$6$$, function($$jscomp$this$jscomp$1183$$) {
            var $userAgent$jscomp$1$$ = {result:$isSupported$jscomp$6$$};
            $isReadyToPayRequest$jscomp$6$$.$existingPaymentMethodRequired$ && ($userAgent$jscomp$1$$.paymentMethodPresent = "READY_TO_PAY" == $$jscomp$this$jscomp$1183$$.data.isReadyToPayResponse);
            $resolve$jscomp$91$$($userAgent$jscomp$1$$);
          })) : $resolve$jscomp$91$$({result:$isSupported$jscomp$6$$});
        }
      }
    }
  });
};
$PaymentsWebActivityDelegate$$module$third_party$subscriptions_project$swg$$.prototype.$loadPaymentData$ = function($opener$jscomp$3_paymentDataRequest$jscomp$5$$) {
  $opener$jscomp$3_paymentDataRequest$jscomp$5$$.$swg$ || $opener$jscomp$3_paymentDataRequest$jscomp$5$$.$apiVersion$ || ($opener$jscomp$3_paymentDataRequest$jscomp$5$$.$apiVersion$ = 1);
  $opener$jscomp$3_paymentDataRequest$jscomp$5$$.$environment$ = this.$D$;
  $buyFlowActivityMode$$module$third_party$subscriptions_project$swg$$ = $opener$jscomp$3_paymentDataRequest$jscomp$5$$.forceRedirect ? 3 : 2;
  $opener$jscomp$3_paymentDataRequest$jscomp$5$$ = this.$activities$.open("GPAY", "TIN" == this.$D$ ? "/ui/pay" : $JSCompiler_StaticMethods_getOrigin_$$(this) + "/gp/p/ui/pay", $opener$jscomp$3_paymentDataRequest$jscomp$5$$.forceRedirect ? "_top" : "gp-js-popup", $opener$jscomp$3_paymentDataRequest$jscomp$5$$, {width:600, height:600});
  this.$G$.show($opener$jscomp$3_paymentDataRequest$jscomp$5$$ && $opener$jscomp$3_paymentDataRequest$jscomp$5$$.$targetWin$);
};
$UpiHandler$$module$third_party$subscriptions_project$swg$$.prototype.$isReadyToPay$ = function($request$jscomp$42$$) {
  if ($getUpiPaymentMethod$$module$third_party$subscriptions_project$swg$$($request$jscomp$42$$)) {
    return $request$jscomp$42$$.$existingPaymentMethodRequired$ ? window.Promise.resolve({result:!0, paymentMethodPresent:!0}) : window.Promise.resolve({result:!0});
  }
  throw Error("No Upi payment method found in handler");
};
$UpiHandler$$module$third_party$subscriptions_project$swg$$.prototype.$loadPaymentData$ = function($paymentDataRequest$jscomp$11$$, $upiPaymentMethod$$, $onResultCallback$$) {
  var $parameters$jscomp$5$$ = $upiPaymentMethod$$.parameters, $transactionInfo$$ = $paymentDataRequest$jscomp$11$$.transactionInfo, $supportedInstruments$jscomp$1$$ = [{supportedMethods:["https://tez.google.com/pay"], data:{pa:$parameters$jscomp$5$$.payeeVpa, pn:$parameters$jscomp$5$$.payeeName, tr:$parameters$jscomp$5$$.transactionReferenceId, url:$parameters$jscomp$5$$.referenceUrl, mc:$parameters$jscomp$5$$.mcc, tn:$transactionInfo$$.transactionNote}}];
  $parameters$jscomp$5$$.transactionId && ($supportedInstruments$jscomp$1$$[0].data.tid = $parameters$jscomp$5$$.transactionId);
  var $request$jscomp$43$$ = new window.PaymentRequest($supportedInstruments$jscomp$1$$, {total:{label:"Total", amount:{currency:$transactionInfo$$.currencyCode, value:$transactionInfo$$.totalPrice}}, displayItems:[{label:"Original Amount", amount:{currency:$transactionInfo$$.currencyCode, value:$transactionInfo$$.totalPrice}}]});
  $onResultCallback$$($JSCompiler_StaticMethods_checkCanMakePayment_$$($request$jscomp$43$$).then(function($paymentDataRequest$jscomp$11$$) {
    $paymentDataRequest$jscomp$11$$ ? $paymentDataRequest$jscomp$11$$ = $JSCompiler_StaticMethods_showUi_$$($request$jscomp$43$$) : (window.location.replace("https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user"), $paymentDataRequest$jscomp$11$$ = window.Promise.reject({errorMessage:"Cannot redirect to Tez page in Google Play."}));
    return $paymentDataRequest$jscomp$11$$;
  }).then(function($onResultCallback$$) {
    $onResultCallback$$ = JSON.parse($onResultCallback$$.tezResponse);
    if ("FAILURE" === $onResultCallback$$.Status) {
      switch($onResultCallback$$.responseCode) {
        case "ZM":
          $onResultCallback$$ = {errorCode:3, errorMessage:"Payment failure due to invalid MPIN."};
          break;
        case "Z9":
          $onResultCallback$$ = {errorCode:3, errorMessage:"Payment failure due to insufficient funds."};
          break;
        case "91":
          $onResultCallback$$ = {errorCode:1, errorMessage:"Payment failure due to transaction timeout or connection issue."};
          break;
        default:
          $onResultCallback$$ = {errorMessage:"Payment cancelled."};
      }
      $onResultCallback$$ = window.Promise.reject($onResultCallback$$);
    } else {
      $onResultCallback$$ = window.Promise.resolve({apiVersion:$paymentDataRequest$jscomp$11$$.apiVersion, apiVersionMinor:$paymentDataRequest$jscomp$11$$.apiVersionMinor, paymentMethodData:{type:$upiPaymentMethod$$.type, tokenizationData:{type:"DIRECT", token:{protocolVersion:"ECv1", signature:"", signedMessage:{paymentMethodType:"UPI", payeeVpa:$upiPaymentMethod$$.parameters.payeeVpa, status:$onResultCallback$$.Status, transactionReferenceId:$upiPaymentMethod$$.parameters.transactionReferenceId, 
      transactionId:$upiPaymentMethod$$.parameters.transactionId ? $upiPaymentMethod$$.parameters.transactionId : $onResultCallback$$.txnId, transactionInfo:$paymentDataRequest$jscomp$11$$.transactionInfo}}}}});
    }
    return $onResultCallback$$;
  }).catch(function($paymentDataRequest$jscomp$11$$) {
    $paymentDataRequest$jscomp$11$$.statusCode = "CANCELED";
    return window.Promise.reject($paymentDataRequest$jscomp$11$$);
  }));
};
var $CHARS$$module$third_party$subscriptions_project$swg$$ = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), $TRUSTED_DOMAINS$$module$third_party$subscriptions_project$swg$$ = "actions.google.com amp-actions.sandbox.google.com amp-actions-staging.sandbox.google.com amp-actions-autopush.sandbox.google.com payments.developers.google.com payments.google.com".split(" "), $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$googleTransactionId_$$;
$PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$$.prototype.$isReadyToPay$ = function($isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$) {
  $isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$ && ($isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$ = Object.assign({}, this.$P$, $isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$));
  var $startTimeMs$$ = Date.now(), $errorMessage$jscomp$1$$ = $validateSecureContext$$module$third_party$subscriptions_project$swg$$() || $validateIsReadyToPayRequest$$module$third_party$subscriptions_project$swg$$($isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$);
  if ($errorMessage$jscomp$1$$) {
    return new window.Promise(function($isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$, $startTimeMs$$) {
      $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$logDevErrorToConsole_$$("isReadyToPay", $errorMessage$jscomp$1$$);
      $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:0, error:2});
      $startTimeMs$$({statusCode:"DEVELOPER_ERROR", statusMessage:$errorMessage$jscomp$1$$});
    });
  }
  $isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$ = $JSCompiler_StaticMethods_PaymentsAsyncClient$$module$third_party$subscriptions_project$swg_prototype$isReadyToPay_$$(this, $isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$);
  $isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$.then(function($isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$) {
    $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:0, clientLatencyStartMs:$startTimeMs$$, isReadyToPayApiResponse:$isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$});
    return $isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$;
  });
  return $isReadyToPayPromise_isReadyToPayRequest$jscomp$7$$;
};
$PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$$.prototype.$loadPaymentData$ = function($paymentDataRequest$jscomp$14$$) {
  $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:5});
  var $errorMessage$jscomp$3$$ = $validateSecureContext$$module$third_party$subscriptions_project$swg$$() || $validatePaymentDataRequest$$module$third_party$subscriptions_project$swg$$($paymentDataRequest$jscomp$14$$);
  if ($errorMessage$jscomp$3$$) {
    this.$K$(new window.Promise(function($paymentDataRequest$jscomp$14$$, $upiPaymentMethod$jscomp$2$$) {
      $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:1, error:2});
      $PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$logDevErrorToConsole_$$("loadPaymentData", $errorMessage$jscomp$3$$);
      $upiPaymentMethod$jscomp$2$$({statusCode:"DEVELOPER_ERROR", statusMessage:$errorMessage$jscomp$3$$});
    }));
  } else {
    var $upiPaymentMethod$jscomp$2$$ = $getUpiPaymentMethod$$module$third_party$subscriptions_project$swg$$($paymentDataRequest$jscomp$14$$);
    $upiPaymentMethod$jscomp$2$$ ? this.$O$.$loadPaymentData$($paymentDataRequest$jscomp$14$$, $upiPaymentMethod$jscomp$2$$, this.$I$.bind(this)) : (window.sessionStorage.getItem("google.payments.api.storage.isreadytopay.result"), this.$J$ = Date.now(), $JSCompiler_StaticMethods_assignInternalParams_$$($paymentDataRequest$jscomp$14$$), $isNativeDisabledInRequest$$module$third_party$subscriptions_project$swg$$($paymentDataRequest$jscomp$14$$) ? this.$D$.$loadPaymentData$($paymentDataRequest$jscomp$14$$) : 
    this.$F$.$loadPaymentData$($paymentDataRequest$jscomp$14$$));
  }
};
$PaymentsAsyncClient$$module$third_party$subscriptions_project$swg$$.prototype.$I$ = function($response$jscomp$80$$) {
  var $$jscomp$this$jscomp$1188$$ = this;
  $response$jscomp$80$$.then(function() {
    $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:1, clientLatencyStartMs:$$jscomp$this$jscomp$1188$$.$J$});
  }).catch(function($response$jscomp$80$$) {
    $response$jscomp$80$$.errorCode ? $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:1, error:$response$jscomp$80$$.errorCode}) : $PayFrameHelper$$module$third_party$subscriptions_project$swg$postMessage$$({eventType:1, error:6});
  });
  this.$K$($response$jscomp$80$$);
};
var $experimentMap$$module$third_party$subscriptions_project$swg$$ = null, $PAY_ORIGIN$$module$third_party$subscriptions_project$swg$$ = {PRODUCTION:"https://pay.google.com", SANDBOX:"https://pay.sandbox.google.com"};
$PayClient$$module$third_party$subscriptions_project$swg$$.prototype.$preconnect$ = function($pre$jscomp$3$$) {
  $pre$jscomp$3$$.$prefetch$($payUrl$$module$third_party$subscriptions_project$swg$$());
  $pre$jscomp$3$$.$prefetch$("https://payments.google.com/payments/v4/js/integrator.js?ss=md");
  $pre$jscomp$3$$.$prefetch$("https://clients2.google.com/gr/gr_full_2.0.6.js");
  $pre$jscomp$3$$.$preconnect$("https://www.gstatic.com/");
  $pre$jscomp$3$$.$preconnect$("https://fonts.googleapis.com/");
  $pre$jscomp$3$$.$preconnect$("https://www.google.com/");
};
$PayClient$$module$third_party$subscriptions_project$swg$$.prototype.$getType$ = function() {
  return this.$D$.$getType$();
};
$PayClient$$module$third_party$subscriptions_project$swg$$.prototype.start = function($paymentRequest$jscomp$2$$, $options$jscomp$61$$) {
  $options$jscomp$61$$ = void 0 === $options$jscomp$61$$ ? {} : $options$jscomp$61$$;
  this.$D$.start($paymentRequest$jscomp$2$$, $options$jscomp$61$$);
};
$PayClient$$module$third_party$subscriptions_project$swg$$.prototype.$onResponse$ = function($callback$jscomp$151$$) {
  this.$D$.$onResponse$($callback$jscomp$151$$);
};
$PayClientBindingSwg$$module$third_party$subscriptions_project$swg$$.prototype.$getType$ = function() {
  return "SWG";
};
$PayClientBindingSwg$$module$third_party$subscriptions_project$swg$$.prototype.start = function($opener$jscomp$4_paymentRequest$jscomp$3$$, $options$jscomp$62$$) {
  $opener$jscomp$4_paymentRequest$jscomp$3$$ = this.$D$.open("GPAY", $payUrl$$module$third_party$subscriptions_project$swg$$(), $options$jscomp$62$$.$forceRedirect$ ? "_top" : "_blank", $feArgs$$module$third_party$subscriptions_project$swg$$($opener$jscomp$4_paymentRequest$jscomp$3$$), {});
  $JSCompiler_StaticMethods_popupOpened$$(this.$F$, $opener$jscomp$4_paymentRequest$jscomp$3$$ && $opener$jscomp$4_paymentRequest$jscomp$3$$.$targetWin$ || null);
};
$PayClientBindingSwg$$module$third_party$subscriptions_project$swg$$.prototype.$onResponse$ = function($callback$jscomp$152$$) {
  function $responseCallback$$($responseCallback$$) {
    $JSCompiler_StaticMethods_popupClosed$$($$jscomp$this$jscomp$1189$$.$F$);
    $callback$jscomp$152$$($JSCompiler_StaticMethods_validatePayResponse_$$($$jscomp$this$jscomp$1189$$, $responseCallback$$));
  }
  var $$jscomp$this$jscomp$1189$$ = this;
  this.$D$.$onResult$("GPAY", $responseCallback$$);
  this.$D$.$onResult$("swg-pay", $responseCallback$$);
};
$PayClientBindingPayjs$$module$third_party$subscriptions_project$swg$$.prototype.$getType$ = function() {
  return "PAYJS";
};
$PayClientBindingPayjs$$module$third_party$subscriptions_project$swg$$.prototype.start = function($paymentRequest$jscomp$4$$, $options$jscomp$64$$) {
  var $$jscomp$this$jscomp$1191$$ = this;
  $options$jscomp$64$$.$forceRedirect$ && ($paymentRequest$jscomp$4$$ = Object.assign($paymentRequest$jscomp$4$$, {forceRedirect:$options$jscomp$64$$.$forceRedirect$ || !1}));
  $setInternalParam$$module$third_party$subscriptions_project$swg$$($paymentRequest$jscomp$4$$, "disableNative", this.$D$ != this.$D$.top || !$getExperiments$$module$third_party$subscriptions_project$swg$$(this.$D$)["gpay-native"]);
  $JSCompiler_StaticMethods_useVerifier$$(this.$G$, function($options$jscomp$64$$) {
    $options$jscomp$64$$ && $setInternalParam$$module$third_party$subscriptions_project$swg$$($paymentRequest$jscomp$4$$, "redirectVerifier", $options$jscomp$64$$);
    $$jscomp$this$jscomp$1191$$.$O$.$loadPaymentData$($paymentRequest$jscomp$4$$);
  });
};
$PayClientBindingPayjs$$module$third_party$subscriptions_project$swg$$.prototype.$onResponse$ = function($callback$jscomp$153$$) {
  var $$jscomp$this$jscomp$1192$$ = this;
  this.$I$ = $callback$jscomp$153$$;
  var $response$jscomp$83$$ = this.$F$;
  $response$jscomp$83$$ && window.Promise.resolve().then(function() {
    $response$jscomp$83$$ && $callback$jscomp$153$$($JSCompiler_StaticMethods_convertResponse_$$($$jscomp$this$jscomp$1192$$, $response$jscomp$83$$));
  });
};
$PayClientBindingPayjs$$module$third_party$subscriptions_project$swg$$.prototype.$K$ = function($responsePromise$jscomp$6$$) {
  this.$F$ = $responsePromise$jscomp$6$$;
  this.$I$ && this.$I$($JSCompiler_StaticMethods_convertResponse_$$(this, this.$F$));
};
$OffersFlow$$module$third_party$subscriptions_project$swg$$.prototype.start = function() {
  var $$jscomp$this$jscomp$1197$$ = this;
  $JSCompiler_StaticMethods_triggerFlowStarted$$(this.$D$.$callbacks_$, "showOffers");
  $JSCompiler_StaticMethods_onCancel$$(this.$F$, function() {
    $JSCompiler_StaticMethods_triggerFlowCanceled$$($$jscomp$this$jscomp$1197$$.$D$.$callbacks_$, "showOffers");
  });
  this.$F$.$onMessage$(function($result$jscomp$82$$) {
    $result$jscomp$82$$.alreadySubscribed ? $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($$jscomp$this$jscomp$1197$$.$D$.$callbacks_$, 4, {$linkRequested$:!!$result$jscomp$82$$.linkRequested}) : $result$jscomp$82$$.sku ? (new $PayStartFlow$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1197$$.$D$, $result$jscomp$82$$.sku)).start() : $result$jscomp$82$$["native"] && $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($$jscomp$this$jscomp$1197$$.$D$.$callbacks_$, 
    2, !0);
  });
  return this.$I$.$openView$(this.$F$);
};
$AbbrvOfferFlow$$module$third_party$subscriptions_project$swg$$.prototype.start = function() {
  var $$jscomp$this$jscomp$1199$$ = this;
  $JSCompiler_StaticMethods_triggerFlowStarted$$(this.$F$.$callbacks_$, "showAbbrvOffer");
  $JSCompiler_StaticMethods_onCancel$$(this.$D$, function() {
    $JSCompiler_StaticMethods_triggerFlowCanceled$$($$jscomp$this$jscomp$1199$$.$F$.$callbacks_$, "showAbbrvOffer");
  });
  this.$D$.$onMessage$(function($data$jscomp$209$$) {
    $data$jscomp$209$$.alreadySubscribed && $JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($$jscomp$this$jscomp$1199$$.$F$.$callbacks_$, 4, {$linkRequested$:!!$data$jscomp$209$$.linkRequested});
  });
  this.$D$.$acceptResult$().then(function($options$jscomp$69_result$jscomp$84$$) {
    $options$jscomp$69_result$jscomp$84$$.data.viewOffers ? ($options$jscomp$69_result$jscomp$84$$ = $$jscomp$this$jscomp$1199$$.$J$ || {}, void 0 == $options$jscomp$69_result$jscomp$84$$.$isClosable$ && ($options$jscomp$69_result$jscomp$84$$.$isClosable$ = !0), (new $OffersFlow$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1199$$.$F$, $options$jscomp$69_result$jscomp$84$$)).start()) : $options$jscomp$69_result$jscomp$84$$.data["native"] && ($JSCompiler_StaticMethods_Callbacks$$module$third_party$subscriptions_project$swg_prototype$trigger_$$($$jscomp$this$jscomp$1199$$.$F$.$callbacks_$, 
    2, !0), $JSCompiler_StaticMethods_completeView$$($$jscomp$this$jscomp$1199$$.$G$, $$jscomp$this$jscomp$1199$$.$D$));
  });
  return this.$G$.$openView$(this.$D$);
};
$Preconnect$$module$third_party$subscriptions_project$swg$$.prototype.$preconnect$ = function($url$jscomp$232$$) {
  $JSCompiler_StaticMethods_pre_$$(this, $url$jscomp$232$$, "preconnect");
};
$Preconnect$$module$third_party$subscriptions_project$swg$$.prototype.$prefetch$ = function($url$jscomp$234$$) {
  $JSCompiler_StaticMethods_pre_$$(this, $url$jscomp$234$$, "preconnect prefetch");
};
$Preconnect$$module$third_party$subscriptions_project$swg$$.prototype.$preload$ = function($url$jscomp$235$$, $as$$) {
  $JSCompiler_StaticMethods_pre_$$(this, $url$jscomp$235$$, "preconnect preload", $as$$);
};
$Storage$$module$third_party$subscriptions_project$swg$$.prototype.get = function($key$jscomp$157$$) {
  var $$jscomp$this$jscomp$1200$$ = this;
  this.$F$[$key$jscomp$157$$] || (this.$F$[$key$jscomp$157$$] = new window.Promise(function($resolve$jscomp$95$$) {
    if ($$jscomp$this$jscomp$1200$$.$D$.sessionStorage) {
      try {
        $resolve$jscomp$95$$($$jscomp$this$jscomp$1200$$.$D$.sessionStorage.getItem($storageKey$$module$third_party$subscriptions_project$swg$$($key$jscomp$157$$)));
      } catch ($e$353$$) {
        $resolve$jscomp$95$$(null);
      }
    } else {
      $resolve$jscomp$95$$(null);
    }
  }));
  return this.$F$[$key$jscomp$157$$];
};
$Storage$$module$third_party$subscriptions_project$swg$$.prototype.set = function($key$jscomp$158$$, $value$jscomp$310$$) {
  var $$jscomp$this$jscomp$1201$$ = this;
  this.$F$[$key$jscomp$158$$] = window.Promise.resolve($value$jscomp$310$$);
  return new window.Promise(function($resolve$jscomp$96$$) {
    if ($$jscomp$this$jscomp$1201$$.$D$.sessionStorage) {
      try {
        $$jscomp$this$jscomp$1201$$.$D$.sessionStorage.setItem($storageKey$$module$third_party$subscriptions_project$swg$$($key$jscomp$158$$), $value$jscomp$310$$);
      } catch ($e$354$$) {
      }
    }
    $resolve$jscomp$96$$();
  });
};
$Storage$$module$third_party$subscriptions_project$swg$$.prototype.remove = function($key$jscomp$159$$) {
  var $$jscomp$this$jscomp$1202$$ = this;
  delete this.$F$[$key$jscomp$159$$];
  return new window.Promise(function($resolve$jscomp$97$$) {
    if ($$jscomp$this$jscomp$1202$$.$D$.sessionStorage) {
      try {
        $$jscomp$this$jscomp$1202$$.$D$.sessionStorage.removeItem($storageKey$$module$third_party$subscriptions_project$swg$$($key$jscomp$159$$));
      } catch ($e$355$$) {
      }
    }
    $resolve$jscomp$97$$();
  });
};
var $CHARS$1$$module$third_party$subscriptions_project$swg$$ = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), $iframeStyles$$module$third_party$subscriptions_project$swg$$ = {display:"none"};
_.$JSCompiler_prototypeAlias$$ = $AnalyticsService$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.$setTransactionId$ = function($transactionId$$) {
  this.$context_$.$setTransactionId$($transactionId$$);
};
_.$JSCompiler_prototypeAlias$$.$getTransactionId$ = function() {
  return this.$context_$.$getTransactionId$();
};
_.$JSCompiler_prototypeAlias$$.$getSku$ = function() {
  return this.$context_$.$getSku$();
};
_.$JSCompiler_prototypeAlias$$.$setSku$ = function($sku$jscomp$1$$) {
  this.$context_$.$setSku$($sku$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$getElement$ = function() {
  return this.$iframe_$;
};
_.$JSCompiler_prototypeAlias$$.$setReadyToPay$ = function($isReadyToPay$jscomp$2$$) {
  this.$context_$.$setReadyToPay$($isReadyToPay$jscomp$2$$);
};
_.$JSCompiler_prototypeAlias$$.close = function() {
  this.$doc_$.$getBody$().removeChild(this.$getElement$());
};
_.$JSCompiler_prototypeAlias$$.$onMessage$ = function($callback$jscomp$156$$) {
  $JSCompiler_StaticMethods_AnalyticsService$$module$third_party$subscriptions_project$swg_prototype$start_$$(this).then(function($port$jscomp$29$$) {
    $port$jscomp$29$$.$onMessage$($callback$jscomp$156$$);
  });
};
_.$JSCompiler_prototypeAlias$$ = $ConfiguredRuntime$$module$third_party$subscriptions_project$swg$$.prototype;
_.$JSCompiler_prototypeAlias$$.$win$ = function() {
  return this.$D$;
};
_.$JSCompiler_prototypeAlias$$.$activities$ = function() {
  return this.$G$;
};
_.$JSCompiler_prototypeAlias$$.$analytics$ = function() {
  return this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$analyticsService_$;
};
_.$JSCompiler_prototypeAlias$$.init = function() {
};
_.$JSCompiler_prototypeAlias$$.config = function() {
  return this.$config_$;
};
_.$JSCompiler_prototypeAlias$$.reset = function() {
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$.reset();
  $JSCompiler_StaticMethods_completeAll$$(this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$);
};
_.$JSCompiler_prototypeAlias$$.clear = function() {
  this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$entitlementsManager_$.clear();
  $JSCompiler_StaticMethods_completeAll$$(this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$dialogManager_$);
};
_.$JSCompiler_prototypeAlias$$.start = function() {
  if (!this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$PageConfig$$module$third_party$subscriptions_project$config$productId_$ || !this.$ConfiguredRuntime$$module$third_party$subscriptions_project$swg$pageConfig_$.$locked_$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$$(this);
};
_.$JSCompiler_prototypeAlias$$.subscribe = function($skuOrSubscriptionRequest$jscomp$1$$) {
  var $$jscomp$this$jscomp$1215$$ = this;
  if ("string" != typeof $skuOrSubscriptionRequest$jscomp$1$$ && !$getExperiments$$module$third_party$subscriptions_project$swg$$(this.$D$)["replace-subscription"]) {
    throw Error("Not yet launched!");
  }
  return this.$F$.then(function() {
    return (new $PayStartFlow$$module$third_party$subscriptions_project$swg$$($$jscomp$this$jscomp$1215$$, $skuOrSubscriptionRequest$jscomp$1$$)).start();
  });
};
var $GOOGLE_DOMAIN_RE$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$ = /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/;
_.$JSCompiler_prototypeAlias$$ = $GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$.prototype;
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$getEntitlements$ = function() {
  var $$jscomp$this$jscomp$1220$$ = this;
  return $JSCompiler_StaticMethods_ConfiguredRuntime$$module$third_party$subscriptions_project$swg_prototype$getEntitlements$$(this.$D$).then(function($swgEntitlements$$) {
    $swgEntitlements$$.$isReadyToPay$ && ($$jscomp$this$jscomp$1220$$.$J$ = !0);
    var $swgEntitlement$$ = $JSCompiler_StaticMethods_getEntitlementFor$$($swgEntitlements$$, $swgEntitlements$$.$product_$);
    if (!$swgEntitlement$$) {
      return null;
    }
    $swgEntitlements$$.$ackHandler_$($swgEntitlements$$);
    return new _.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$({source:$swgEntitlement$$.source, raw:$swgEntitlements$$.raw, $service$:"subscribe.google.com", $granted$:!0, $grantReason$:"SUBSCRIBER", $dataObject$:$swgEntitlement$$.json()});
  });
};
_.$JSCompiler_prototypeAlias$$.$getServiceId$ = function() {
  return "subscribe.google.com";
};
_.$JSCompiler_prototypeAlias$$.$activate$ = function($best_entitlement$jscomp$2$$, $grantEntitlement$$) {
  $best_entitlement$jscomp$2$$ = $grantEntitlement$$ || $best_entitlement$jscomp$2$$;
  $best_entitlement$jscomp$2$$.$granted$ ? _.$JSCompiler_StaticMethods_isSubscriber$$($best_entitlement$jscomp$2$$) || $JSCompiler_StaticMethods_showAbbrvOffer$$(this.$D$) : $JSCompiler_StaticMethods_showOffers$$(this.$D$, {list:"amp"});
};
_.$JSCompiler_prototypeAlias$$.reset = function() {
  this.$D$.reset();
};
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$isPingbackEnabled$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google_prototype$pingback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$getSupportedScoreFactor$ = function($factorName$$) {
  switch($factorName$$) {
    case "supportsViewer":
      return this.$I$ ? 1 : 0;
    case "isReadyToPay":
      return this.$J$ ? 1 : 0;
    default:
      return 0;
  }
};
_.$JSCompiler_prototypeAlias$$.$getBaseScore$ = function() {
  return this.$K$.baseScore || 0;
};
_.$JSCompiler_prototypeAlias$$.$executeAction$ = function($action$jscomp$25$$) {
  return "subscribe" == $action$jscomp$25$$ ? ($JSCompiler_StaticMethods_showOffers$$(this.$D$, {list:"amp", $isClosable$:!0}), window.Promise.resolve(!0)) : "login" == $action$jscomp$25$$ ? ($JSCompiler_StaticMethods_linkAccount$$(this.$D$), window.Promise.resolve(!0)) : window.Promise.resolve(!1);
};
_.$JSCompiler_prototypeAlias$$.$decorateUI$ = function($element$jscomp$637$$, $action$jscomp$26$$, $options$jscomp$70$$) {
  "subscribe" === $action$jscomp$26$$ && ($element$jscomp$637$$.textContent = "", $JSCompiler_StaticMethods_attachButton$$(this.$D$, $element$jscomp$637$$, $options$jscomp$70$$, function() {
  }));
};
$AmpFetcher$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$.prototype.$fetchCredentialedJson$ = function($url$jscomp$237$$) {
  return _.$JSCompiler_StaticMethods_fetchJson$$(this.$xhr_$, $url$jscomp$237$$, {credentials:"include"}).then(function($url$jscomp$237$$) {
    return $url$jscomp$237$$.json();
  });
};
(function($AMP$jscomp$108$$) {
  $AMP$jscomp$108$$.registerServiceForDoc("subscriptions-google", function($AMP$jscomp$108$$) {
    var $ampdoc$jscomp$212$$ = new $GoogleSubscriptionsPlatformService$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$($AMP$jscomp$108$$);
    _.$getElementServiceForDoc$$module$src$element_service$$($AMP$jscomp$108$$.$getHeadNode$(), "subscriptions", "amp-subscriptions").then(function($AMP$jscomp$108$$) {
      $AMP$jscomp$108$$.$Y$(function($AMP$jscomp$108$$, $platformService$$) {
        return new $GoogleSubscriptionsPlatform$$module$extensions$amp_subscriptions_google$0_1$amp_subscriptions_google$$($ampdoc$jscomp$212$$.$ampdoc_$, $AMP$jscomp$108$$, $platformService$$);
      });
    });
    return $ampdoc$jscomp$212$$;
  });
})(window.self.AMP);

})});
