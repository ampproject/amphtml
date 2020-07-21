(self.AMP=self.AMP||[]).push({n:"amp-youtube",v:"2007210308000",f:(function(AMP,_){
var $JSCompiler_prototypeAlias$$, $$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
  function $ctor$$() {
  }
  $ctor$$.prototype = $prototype$$;
  return new $ctor$$;
};
function $$jscomp$getGlobal$$($passedInThis$$) {
  for (var $possibleGlobals$$ = ["object" == typeof globalThis && globalThis, $passedInThis$$, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, ], $i$jscomp$4$$ = 0; $i$jscomp$4$$ < $possibleGlobals$$.length; ++$i$jscomp$4$$) {
    var $maybeGlobal$$ = $possibleGlobals$$[$i$jscomp$4$$];
    if ($maybeGlobal$$ && $maybeGlobal$$.Math == Math) {
      return;
    }
  }
  (function() {
    throw Error("Cannot find global object");
  })();
}
$$jscomp$getGlobal$$(this);
"function" === typeof Symbol && Symbol("x");
var $JSCompiler_temp$jscomp$22$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$22$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$23$$;
  a: {
    var $JSCompiler_x$jscomp$inline_49$$ = {a:!0}, $JSCompiler_y$jscomp$inline_50$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_50$$.__proto__ = $JSCompiler_x$jscomp$inline_49$$;
      $JSCompiler_inline_result$jscomp$23$$ = $JSCompiler_y$jscomp$inline_50$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_51$$) {
    }
    $JSCompiler_inline_result$jscomp$23$$ = !1;
  }
  $JSCompiler_temp$jscomp$22$$ = $JSCompiler_inline_result$jscomp$23$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$22$$;
function $Deferred$$module$src$utils$promise$$() {
  var $resolve$$, $reject$$;
  this.promise = new Promise(function($res$$, $rej$$) {
    $resolve$$ = $res$$;
    $reject$$ = $rej$$;
  });
  this.resolve = $resolve$$;
  this.reject = $reject$$;
}
;function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
  $fallback$$ = void 0 === $fallback$$ ? "" : $fallback$$;
  try {
    return decodeURIComponent($component$jscomp$4$$);
  } catch ($e$jscomp$8$$) {
    return $fallback$$;
  }
}
;var $regex$$module$src$url_parse_query_string$$ = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
function $parseQueryString_$$module$src$url_parse_query_string$$($queryString$$) {
  var $params$jscomp$1$$ = Object.create(null);
  if (!$queryString$$) {
    return $params$jscomp$1$$;
  }
  for (var $match$$; $match$$ = $regex$$module$src$url_parse_query_string$$.exec($queryString$$);) {
    var $name$jscomp$71$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$89$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2].replace(/\+/g, " "), $match$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$71$$] = $value$jscomp$89$$;
  }
  return $params$jscomp$1$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
var $toString_$$module$src$types$$ = Object.prototype.toString;
function $isObject$$module$src$types$$($value$jscomp$92$$) {
  return "[object Object]" === $toString_$$module$src$types$$.call($value$jscomp$92$$);
}
function $isFiniteNumber$$module$src$types$$($value$jscomp$93$$) {
  return "number" === typeof $value$jscomp$93$$ && isFinite($value$jscomp$93$$);
}
;function $once$$module$src$utils$function$$($fn$jscomp$1$$) {
  var $evaluated$$ = !1, $retValue$$ = null, $callback$jscomp$50$$ = $fn$jscomp$1$$;
  return function($fn$jscomp$1$$) {
    for (var $args$$ = [], $$jscomp$restIndex$$ = 0; $$jscomp$restIndex$$ < arguments.length; ++$$jscomp$restIndex$$) {
      $args$$[$$jscomp$restIndex$$ - 0] = arguments[$$jscomp$restIndex$$];
    }
    $evaluated$$ || ($retValue$$ = $callback$jscomp$50$$.apply(self, $args$$), $evaluated$$ = !0, $callback$jscomp$50$$ = null);
    return $retValue$$;
  };
}
;var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
function $getMetaUrl$$module$src$config$$($name$jscomp$72$$) {
  if (self.document && self.document.head && (!self.location || !$cdnProxyRegex$$module$src$config$$.test(self.location.origin))) {
    var $metaEl$$ = self.document.head.querySelector('meta[name="' + $name$jscomp$72$$ + '"]');
    $metaEl$$ && $metaEl$$.getAttribute("content");
  }
}
$env$$module$src$config$$.cdnUrl || $getMetaUrl$$module$src$config$$("runtime-host");
$env$$module$src$config$$.geoApiUrl || $getMetaUrl$$module$src$config$$("amp-geo-api");
self.__AMP_LOG = self.__AMP_LOG || {user:null, dev:null, userForEmbed:null};
var $logs$$module$src$log$$ = self.__AMP_LOG;
function $user$$module$src$log$$() {
  if (!$logs$$module$src$log$$.user) {
    throw Error("failed to call initLogConstructor");
  }
  return $logs$$module$src$log$$.user;
}
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$) {
  return $user$$module$src$log$$().assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
;var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $map$$module$src$utils$object$$($opt_initial$$) {
  var $obj$jscomp$28$$ = Object.create(null);
  $opt_initial$$ && Object.assign($obj$jscomp$28$$, $opt_initial$$);
  return $obj$jscomp$28$$;
}
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $experimentToggles$$module$src$experiments$$($params$jscomp$5_win$jscomp$12$$) {
  if ($params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$5_experimentId$jscomp$2_i$jscomp$15$$ in $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG[$allowed$5_experimentId$jscomp$2_i$jscomp$15$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$5_experimentId$jscomp$2_i$jscomp$15$$] = Math.random() < $frequency$$);
    }
  }
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $params$jscomp$5_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$5_experimentId$jscomp$2_i$jscomp$15$$ = 0; $allowed$5_experimentId$jscomp$2_i$jscomp$15$$ < $optedInExperiments$$.length; $allowed$5_experimentId$jscomp$2_i$jscomp$15$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$5_experimentId$jscomp$2_i$jscomp$15$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$5_experimentId$jscomp$2_i$jscomp$15$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($params$jscomp$5_win$jscomp$12$$));
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$5_experimentId$jscomp$2_i$jscomp$15$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    $params$jscomp$5_win$jscomp$12$$ = $parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$5_win$jscomp$12$$.location.originalHash || $params$jscomp$5_win$jscomp$12$$.location.hash);
    for (var $i$6$$ = 0; $i$6$$ < $allowed$5_experimentId$jscomp$2_i$jscomp$15$$.length; $i$6$$++) {
      var $param$jscomp$6$$ = $params$jscomp$5_win$jscomp$12$$["e-" + $allowed$5_experimentId$jscomp$2_i$jscomp$15$$[$i$6$$]];
      "1" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$5_experimentId$jscomp$2_i$jscomp$15$$[$i$6$$]] = !0);
      "0" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$5_experimentId$jscomp$2_i$jscomp$15$$[$i$6$$]] = !1);
    }
  }
  return $toggles$jscomp$2$$;
}
function $getExperimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$) {
  var $experimentsString$$ = "";
  try {
    "localStorage" in $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$ && ($experimentsString$$ = $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$.localStorage.getItem("amp-experiment-toggles"));
  } catch ($e$jscomp$11$$) {
    if ($logs$$module$src$log$$.dev) {
      $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$ = $logs$$module$src$log$$.dev;
    } else {
      throw Error("failed to call initLogConstructor");
    }
    $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$.warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
  }
  var $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
  $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$ = Object.create(null);
  for (var $i$jscomp$16$$ = 0; $i$jscomp$16$$ < $tokens$$.length; $i$jscomp$16$$++) {
    0 != $tokens$$[$i$jscomp$16$$].length && ("-" == $tokens$$[$i$jscomp$16$$][0] ? $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$16$$].substr(1)] = !1 : $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$16$$]] = !0);
  }
  return $JSCompiler_inline_result$jscomp$25_toggles$jscomp$3_win$jscomp$14$$;
}
;var $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$ = [{experimentId:"ampdoc-fie", isTrafficEligible:function() {
  return !0;
}, branches:["21065001", "21065002"]}];
function $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$, $JSCompiler_temp$jscomp$28_id$jscomp$8$$) {
  var $win$jscomp$23$$ = $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$.ownerDocument.defaultView, $topWin$$ = $win$jscomp$23$$.__AMP_TOP || ($win$jscomp$23$$.__AMP_TOP = $win$jscomp$23$$), $isEmbed$$ = $win$jscomp$23$$ != $topWin$$, $JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$;
  if ($experimentToggles$$module$src$experiments$$($topWin$$)["ampdoc-fie"]) {
    $topWin$$.__AMP_EXPERIMENT_BRANCHES = $topWin$$.__AMP_EXPERIMENT_BRANCHES || {};
    for ($JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$ = 0; $JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$++) {
      var $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$], $JSCompiler_experimentName$jscomp$inline_190$$ = $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($topWin$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_190$$) || ($JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$.isTrafficEligible($topWin$$) ? !$topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_190$$] && $experimentToggles$$module$src$experiments$$($topWin$$)[$JSCompiler_experimentName$jscomp$inline_190$$] && 
      ($JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$ = $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$.branches, $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_190$$] = $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_265_JSCompiler_experiment$jscomp$inline_189$$.length)] || null) : $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_190$$] = 
      null);
    }
    $JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$ = "21065002" === ($topWin$$.__AMP_EXPERIMENT_BRANCHES ? $topWin$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$ = !1;
  }
  var $ampdocFieExperimentOn$$ = $JSCompiler_i$jscomp$inline_188_JSCompiler_inline_result$jscomp$27$$;
  $isEmbed$$ && !$ampdocFieExperimentOn$$ ? $JSCompiler_temp$jscomp$28_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($win$jscomp$23$$, $JSCompiler_temp$jscomp$28_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($win$jscomp$23$$, $JSCompiler_temp$jscomp$28_id$jscomp$8$$) : null : ($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$), 
  $JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$), $JSCompiler_temp$jscomp$28_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$, $JSCompiler_temp$jscomp$28_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_61_JSCompiler_holder$jscomp$inline_62_element$jscomp$13$$, 
  $JSCompiler_temp$jscomp$28_id$jscomp$8$$) : null);
  return $JSCompiler_temp$jscomp$28_id$jscomp$8$$;
}
function $getService$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$) {
  $win$jscomp$25$$ = $win$jscomp$25$$.__AMP_TOP || ($win$jscomp$25$$.__AMP_TOP = $win$jscomp$25$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$, $id$jscomp$17$$) {
  var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, $id$jscomp$17$$);
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$2$$) {
  return $nodeOrDoc$jscomp$2$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$2$$.ownerDocument || $nodeOrDoc$jscomp$2$$).defaultView, "ampdoc").getAmpDoc($nodeOrDoc$jscomp$2$$) : $nodeOrDoc$jscomp$2$$;
}
function $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$) {
  $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$);
  return $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.isSingleDoc() ? $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.win : $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$, $id$jscomp$21$$) {
  $isServiceRegistered$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$, $id$jscomp$21$$);
  $holder$jscomp$4_s$jscomp$9$$ = $getServices$$module$src$service$$($holder$jscomp$4_s$jscomp$9$$)[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
function $getServices$$module$src$service$$($holder$jscomp$9$$) {
  var $services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES;
  $services$jscomp$5$$ || ($services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES = {});
  return $services$jscomp$5$$;
}
function $isServiceRegistered$$module$src$service$$($holder$jscomp$12_service$jscomp$5$$, $id$jscomp$30$$) {
  $holder$jscomp$12_service$jscomp$5$$ = $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES && $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES[$id$jscomp$30$$];
  return !(!$holder$jscomp$12_service$jscomp$5$$ || !$holder$jscomp$12_service$jscomp$5$$.ctor && !$holder$jscomp$12_service$jscomp$5$$.obj);
}
;var $resolved$$module$src$resolved_promise$$;
function $resolvedPromise$$module$src$resolved_promise$$() {
  return $resolved$$module$src$resolved_promise$$ ? $resolved$$module$src$resolved_promise$$ : $resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0);
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $removeElement$$module$src$dom$$($element$jscomp$15$$) {
  $element$jscomp$15$$.parentElement && $element$jscomp$15$$.parentElement.removeChild($element$jscomp$15$$);
}
function $getDataParamsFromAttributes$$module$src$dom$$($element$jscomp$23_params$jscomp$6$$) {
  function $computeParamNameFunc$$($element$jscomp$23_params$jscomp$6$$) {
    return $element$jscomp$23_params$jscomp$6$$;
  }
  var $dataset$$ = $element$jscomp$23_params$jscomp$6$$.dataset;
  $element$jscomp$23_params$jscomp$6$$ = {};
  var $paramPattern$$ = /^param(.+)/, $key$jscomp$49$$;
  for ($key$jscomp$49$$ in $dataset$$) {
    var $matches$$ = $key$jscomp$49$$.match($paramPattern$$);
    if ($matches$$) {
      var $param$jscomp$7$$ = $matches$$[1][0].toLowerCase() + $matches$$[1].substr(1);
      $element$jscomp$23_params$jscomp$6$$[$computeParamNameFunc$$($param$jscomp$7$$)] = $dataset$$[$key$jscomp$49$$];
    }
  }
  return $element$jscomp$23_params$jscomp$6$$;
}
;function $userInteractedWith$$module$src$video_interface$$($video$jscomp$1$$) {
  $video$jscomp$1$$.signals().signal("user-interacted");
}
;var $htmlContainer$$module$src$static_template$$;
function $htmlFor$$module$src$static_template$$($doc$jscomp$6_nodeOrDoc$jscomp$4$$) {
  $doc$jscomp$6_nodeOrDoc$jscomp$4$$ = $doc$jscomp$6_nodeOrDoc$jscomp$4$$.ownerDocument || $doc$jscomp$6_nodeOrDoc$jscomp$4$$;
  $htmlContainer$$module$src$static_template$$ && $htmlContainer$$module$src$static_template$$.ownerDocument === $doc$jscomp$6_nodeOrDoc$jscomp$4$$ || ($htmlContainer$$module$src$static_template$$ = $doc$jscomp$6_nodeOrDoc$jscomp$4$$.createElement("div"));
  return $html$$module$src$static_template$$;
}
function $html$$module$src$static_template$$($JSCompiler_el$jscomp$inline_66_strings$jscomp$1$$) {
  var $JSCompiler_container$jscomp$inline_65$$ = $htmlContainer$$module$src$static_template$$;
  $JSCompiler_container$jscomp$inline_65$$.innerHTML = $JSCompiler_el$jscomp$inline_66_strings$jscomp$1$$[0];
  $JSCompiler_el$jscomp$inline_66_strings$jscomp$1$$ = $JSCompiler_container$jscomp$inline_65$$.firstElementChild;
  $JSCompiler_container$jscomp$inline_65$$.removeChild($JSCompiler_el$jscomp$inline_66_strings$jscomp$1$$);
  return $JSCompiler_el$jscomp$inline_66_strings$jscomp$1$$;
}
;function $tryParseJson$$module$src$json$$($json$jscomp$1$$) {
  try {
    return JSON.parse($json$jscomp$1$$);
  } catch ($e$jscomp$18$$) {
    return null;
  }
}
;var $_template$$module$src$iframe_video$$ = ["<iframe frameborder=0 allowfullscreen></iframe>"];
function $redispatch$$module$src$iframe_video$$($element$jscomp$66$$, $event$jscomp$6$$, $events$$) {
  if (null != $events$$[$event$jscomp$6$$]) {
    var $dispatchEvent$$ = $events$$[$event$jscomp$6$$];
    (Array.isArray($dispatchEvent$$) ? $dispatchEvent$$ : [$dispatchEvent$$]).forEach(function($event$jscomp$6$$) {
      $element$jscomp$66$$.dispatchCustomEvent($event$jscomp$6$$);
    });
  }
}
function $createFrameFor$$module$src$iframe_video$$($video$jscomp$2$$, $src$jscomp$4$$) {
  var $element$jscomp$67$$ = $video$jscomp$2$$.element, $frame$$ = $htmlFor$$module$src$static_template$$($element$jscomp$67$$)($_template$$module$src$iframe_video$$);
  $video$jscomp$2$$.propagateAttributes(["referrerpolicy"], $frame$$);
  $frame$$.src = $getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$67$$, "url").assertHttpsUrl($src$jscomp$4$$, $element$jscomp$67$$);
  $video$jscomp$2$$.applyFillContent($frame$$);
  $element$jscomp$67$$.appendChild($frame$$);
  return $frame$$;
}
function $addUnsafeAllowAutoplay$$module$src$iframe_video$$($iframe$jscomp$1$$) {
  var $val$jscomp$5$$ = $iframe$jscomp$1$$.getAttribute("allow") || "";
  $iframe$jscomp$1$$.setAttribute("allow", $val$jscomp$5$$ + "autoplay;");
}
;var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$68$$, $eventType$jscomp$3$$, $listener$jscomp$64$$, $opt_evtListenerOpts$$) {
  var $localElement$$ = $element$jscomp$68$$, $localListener$$ = $listener$jscomp$64$$;
  var $wrapped$$ = function($element$jscomp$68$$) {
    try {
      return $localListener$$($element$jscomp$68$$);
    } catch ($e$jscomp$20$$) {
      throw self.__AMP_REPORT_ERROR($e$jscomp$20$$), $e$jscomp$20$$;
    }
  };
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$(), $capture$$ = !1;
  $opt_evtListenerOpts$$ && ($capture$$ = $opt_evtListenerOpts$$.capture);
  $localElement$$.addEventListener($eventType$jscomp$3$$, $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$$);
  return function() {
    $localElement$$ && $localElement$$.removeEventListener($eventType$jscomp$3$$, $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$$);
    $wrapped$$ = $localElement$$ = $localListener$$ = null;
  };
}
function $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$() {
  if (void 0 !== $optsSupported$$module$src$event_helper_listen$$) {
    return $optsSupported$$module$src$event_helper_listen$$;
  }
  $optsSupported$$module$src$event_helper_listen$$ = !1;
  try {
    var $options$jscomp$33$$ = {get capture() {
      $optsSupported$$module$src$event_helper_listen$$ = !0;
    }};
    self.addEventListener("test-options", null, $options$jscomp$33$$);
    self.removeEventListener("test-options", null, $options$jscomp$33$$);
  } catch ($err$jscomp$3$$) {
  }
  return $optsSupported$$module$src$event_helper_listen$$;
}
;function $createCustomEvent$$module$src$event_helper$$($e$jscomp$21_win$jscomp$55$$, $type$jscomp$148$$, $detail$jscomp$3$$) {
  var $eventInit$jscomp$1$$ = {detail:$detail$jscomp$3$$};
  Object.assign($eventInit$jscomp$1$$, void 0);
  if ("function" == typeof $e$jscomp$21_win$jscomp$55$$.CustomEvent) {
    return new $e$jscomp$21_win$jscomp$55$$.CustomEvent($type$jscomp$148$$, $eventInit$jscomp$1$$);
  }
  $e$jscomp$21_win$jscomp$55$$ = $e$jscomp$21_win$jscomp$55$$.document.createEvent("CustomEvent");
  $e$jscomp$21_win$jscomp$55$$.initCustomEvent($type$jscomp$148$$, !!$eventInit$jscomp$1$$.bubbles, !!$eventInit$jscomp$1$$.cancelable, $detail$jscomp$3$$);
  return $e$jscomp$21_win$jscomp$55$$;
}
function $listen$$module$src$event_helper$$($element$jscomp$69$$, $eventType$jscomp$4$$, $listener$jscomp$65$$) {
  return $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$69$$, $eventType$jscomp$4$$, $listener$jscomp$65$$, void 0);
}
function $listenOnce$$module$src$event_helper$$($element$jscomp$70$$, $eventType$jscomp$5$$, $listener$jscomp$66$$, $opt_evtListenerOpts$jscomp$2$$) {
  var $localListener$jscomp$1$$ = $listener$jscomp$66$$, $unlisten$$ = $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$70$$, $eventType$jscomp$5$$, function($element$jscomp$70$$) {
    try {
      $localListener$jscomp$1$$($element$jscomp$70$$);
    } finally {
      $localListener$jscomp$1$$ = null, $unlisten$$();
    }
  }, $opt_evtListenerOpts$jscomp$2$$);
  return $unlisten$$;
}
function $listenOncePromise$$module$src$event_helper$$($element$jscomp$71$$) {
  var $unlisten$jscomp$1$$, $eventPromise$$ = new Promise(function($eventPromise$$) {
    $unlisten$jscomp$1$$ = $listenOnce$$module$src$event_helper$$($element$jscomp$71$$, "load", $eventPromise$$, void 0);
  });
  $eventPromise$$.then($unlisten$jscomp$1$$, $unlisten$jscomp$1$$);
  return $eventPromise$$;
}
;var $EMPTY_METADATA$$module$src$mediasession_helper$$ = {title:"", artist:"", album:"", artwork:[{src:""}]};
function $parseSchemaImage$$module$src$mediasession_helper$$($doc$jscomp$8$$) {
  var $schema$$ = $doc$jscomp$8$$.querySelector('script[type="application/ld+json"]');
  if ($schema$$) {
    var $schemaJson$$ = $tryParseJson$$module$src$json$$($schema$$.textContent);
    if ($schemaJson$$ && $schemaJson$$.image) {
      if ("string" === typeof $schemaJson$$.image) {
        return $schemaJson$$.image;
      }
      if ($schemaJson$$.image["@list"] && "string" === typeof $schemaJson$$.image["@list"][0]) {
        return $schemaJson$$.image["@list"][0];
      }
      if ("string" === typeof $schemaJson$$.image.url) {
        return $schemaJson$$.image.url;
      }
      if ("string" === typeof $schemaJson$$.image[0]) {
        return $schemaJson$$.image[0];
      }
    }
  }
}
function $validateMetadata$$module$src$mediasession_helper$$($element$jscomp$73$$, $metadata$jscomp$1$$) {
  var $urlService$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$73$$, "url");
  if ($metadata$jscomp$1$$ && $metadata$jscomp$1$$.artwork) {
    var $artwork$$ = $metadata$jscomp$1$$.artwork;
    Array.isArray($artwork$$);
    $artwork$$.forEach(function($element$jscomp$73$$) {
      $element$jscomp$73$$ && ($element$jscomp$73$$ = $isObject$$module$src$types$$($element$jscomp$73$$) ? $element$jscomp$73$$.src : $element$jscomp$73$$, $userAssert$$module$src$log$$($urlService$$.isProtocolValid($element$jscomp$73$$)));
    });
  }
}
;function $Observable$$module$src$observable$$() {
  this.$handlers_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Observable$$module$src$observable$$.prototype;
$JSCompiler_prototypeAlias$$.add = function($handler$jscomp$3$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  this.$handlers_$ || (this.$handlers_$ = []);
  this.$handlers_$.push($handler$jscomp$3$$);
  return function() {
    $$jscomp$this$jscomp$2$$.remove($handler$jscomp$3$$);
  };
};
$JSCompiler_prototypeAlias$$.remove = function($handler$jscomp$4_index$jscomp$78$$) {
  this.$handlers_$ && ($handler$jscomp$4_index$jscomp$78$$ = this.$handlers_$.indexOf($handler$jscomp$4_index$jscomp$78$$), -1 < $handler$jscomp$4_index$jscomp$78$$ && this.$handlers_$.splice($handler$jscomp$4_index$jscomp$78$$, 1));
};
$JSCompiler_prototypeAlias$$.removeAll = function() {
  this.$handlers_$ && (this.$handlers_$.length = 0);
};
$JSCompiler_prototypeAlias$$.fire = function($opt_event$$) {
  if (this.$handlers_$) {
    for (var $handlers$$ = this.$handlers_$, $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $handlers$$.length; $i$jscomp$23$$++) {
      (0,$handlers$$[$i$jscomp$23$$])($opt_event$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.getHandlerCount = function() {
  return this.$handlers_$ ? this.$handlers_$.length : 0;
};
function $VideoSessionManager$$module$src$service$video_session_manager$$() {
  this.$isSessionActive_$ = !1;
  this.$endSessionObservable_$ = new $Observable$$module$src$observable$$;
}
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.onSessionEnd = function($listener$jscomp$67$$) {
  this.$endSessionObservable_$.add($listener$jscomp$67$$);
};
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.beginSession = function() {
  this.$isSessionActive_$ = !0;
};
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.endSession = function() {
  this.$isSessionActive_$ && this.$endSessionObservable_$.fire();
  this.$isSessionActive_$ = !1;
};
$VideoSessionManager$$module$src$service$video_session_manager$$.prototype.isSessionActive = function() {
  return this.$isSessionActive_$;
};
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyles$$module$src$style$$($element$jscomp$77$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$6$$ in $styles$jscomp$1$$) {
    var $JSCompiler_element$jscomp$inline_68$$ = $element$jscomp$77$$, $JSCompiler_styleValue$jscomp$inline_74_JSCompiler_value$jscomp$inline_70$$ = $styles$jscomp$1$$[$k$jscomp$6$$];
    var $JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$ = $JSCompiler_element$jscomp$inline_68$$.style;
    var $JSCompiler_camelCase$jscomp$inline_195$$ = $k$jscomp$6$$;
    if ($startsWith$$module$src$string$$($JSCompiler_camelCase$jscomp$inline_195$$, "--")) {
      $JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$ = $JSCompiler_camelCase$jscomp$inline_195$$;
    } else {
      $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = $map$$module$src$utils$object$$());
      var $JSCompiler_propertyName$jscomp$inline_197$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_195$$];
      if (!$JSCompiler_propertyName$jscomp$inline_197$$) {
        $JSCompiler_propertyName$jscomp$inline_197$$ = $JSCompiler_camelCase$jscomp$inline_195$$;
        if (void 0 === $JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$[$JSCompiler_camelCase$jscomp$inline_195$$]) {
          var $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$ = $JSCompiler_camelCase$jscomp$inline_195$$;
          $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$ = $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$.charAt(0).toUpperCase() + $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$.slice(1);
          b: {
            for (var $JSCompiler_i$jscomp$inline_272$$ = 0; $JSCompiler_i$jscomp$inline_272$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_272$$++) {
              var $JSCompiler_propertyName$jscomp$inline_273$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_272$$] + $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$;
              if (void 0 !== $JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$[$JSCompiler_propertyName$jscomp$inline_273$$]) {
                $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$ = $JSCompiler_propertyName$jscomp$inline_273$$;
                break b;
              }
            }
            $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$ = "";
          }
          void 0 !== $JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$[$JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$] && ($JSCompiler_propertyName$jscomp$inline_197$$ = $JSCompiler_camelCase$jscomp$inline_268_JSCompiler_prefixedPropertyName$jscomp$inline_199_JSCompiler_titleCase$jscomp$inline_198$$);
        }
        $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_195$$] = $JSCompiler_propertyName$jscomp$inline_197$$;
      }
      $JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$ = $JSCompiler_propertyName$jscomp$inline_197$$;
    }
    $JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$ && ($startsWith$$module$src$string$$($JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$, "--") ? $JSCompiler_element$jscomp$inline_68$$.style.setProperty($JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$, $JSCompiler_styleValue$jscomp$inline_74_JSCompiler_value$jscomp$inline_70$$) : $JSCompiler_element$jscomp$inline_68$$.style[$JSCompiler_propertyName$jscomp$inline_73_JSCompiler_style$jscomp$inline_194$$] = 
    $JSCompiler_styleValue$jscomp$inline_74_JSCompiler_value$jscomp$inline_70$$);
  }
}
;function $isAutoplaySupportedImpl$$module$src$utils$video$$($win$jscomp$58$$, $isLiteViewer$$) {
  if ($isLiteViewer$$) {
    return Promise.resolve(!1);
  }
  var $detectionElement$$ = $win$jscomp$58$$.document.createElement("video");
  $detectionElement$$.setAttribute("muted", "");
  $detectionElement$$.setAttribute("playsinline", "");
  $detectionElement$$.setAttribute("webkit-playsinline", "");
  $detectionElement$$.setAttribute("height", "0");
  $detectionElement$$.setAttribute("width", "0");
  $detectionElement$$.muted = !0;
  $detectionElement$$.playsinline = !0;
  $detectionElement$$.webkitPlaysinline = !0;
  $setStyles$$module$src$style$$($detectionElement$$, {position:"fixed", top:"0", width:"0", height:"0", opacity:"0"});
  (new Promise(function($win$jscomp$58$$) {
    return $win$jscomp$58$$($detectionElement$$.play());
  })).catch(function() {
  });
  return Promise.resolve(!$detectionElement$$.paused);
}
var $isAutoplaySupported$$module$src$utils$video$$ = null;
function $getExistingStyleElement$$module$src$style_installer$$($cssRoot$jscomp$2_existing$jscomp$1$$, $styleMap$jscomp$1$$, $key$jscomp$53$$) {
  return $styleMap$jscomp$1$$[$key$jscomp$53$$] ? $styleMap$jscomp$1$$[$key$jscomp$53$$] : ($cssRoot$jscomp$2_existing$jscomp$1$$ = $cssRoot$jscomp$2_existing$jscomp$1$$.querySelector("style[" + $key$jscomp$53$$ + "]")) ? $styleMap$jscomp$1$$[$key$jscomp$53$$] = $cssRoot$jscomp$2_existing$jscomp$1$$ : null;
}
;var $cssText$$module$build$video_autoplay_css$$ = "i-amphtml-video-mask{display:block;z-index:1}.amp-video-eq{display:none}.i-amphtml-video-interface:not(amp-video) .amp-video-eq,amp-story .amp-video-eq,amp-video[controls] .amp-video-eq{display:-ms-flexbox;display:flex}[noaudio] .amp-video-eq{display:none!important}.amp-video-eq{pointer-events:none!important;-ms-flex-align:end;align-items:flex-end;bottom:7px;height:12px;opacity:0.8;overflow:hidden;position:absolute;right:7px;width:20px;z-index:1}.amp-video-eq .amp-video-eq-col{-ms-flex:1;flex:1;height:100%;margin-right:1px;position:relative}.amp-video-eq .amp-video-eq-col div{animation-name:amp-video-eq-animation;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;background-color:#fafafa;height:100%;position:absolute;width:100%;will-change:transform;animation-play-state:paused}.amp-video-eq[unpausable] .amp-video-eq-col div{animation-name:none}.amp-video-eq[unpausable].amp-video-eq-play .amp-video-eq-col div{animation-name:amp-video-eq-animation}.amp-video-eq.amp-video-eq-play .amp-video-eq-col div{animation-play-state:running}.amp-video-eq-1-1{animation-duration:0.3s;transform:translateY(60%)}.amp-video-eq-1-2{animation-duration:0.45s;transform:translateY(60%)}.amp-video-eq-2-1{animation-duration:0.5s;transform:translateY(30%)}.amp-video-eq-2-2{animation-duration:0.4s;transform:translateY(30%)}.amp-video-eq-3-1{animation-duration:0.3s;transform:translateY(70%)}.amp-video-eq-3-2{animation-duration:0.35s;transform:translateY(70%)}.amp-video-eq-4-1{animation-duration:0.4s;transform:translateY(50%)}.amp-video-eq-4-2{animation-duration:0.25s;transform:translateY(50%)}@keyframes amp-video-eq-animation{0%{transform:translateY(100%)}to{transform:translateY(0)}}\n/*# sourceURL=/css/video-autoplay.css*/";
var $_template$$module$src$service$video$autoplay$$ = ["<i-amphtml-video-mask class=i-amphtml-fill-content role=button></i-amphtml-video-mask>"], $_template2$$module$src$service$video$autoplay$$ = ["<i-amphtml-video-icon class=amp-video-eq><div class=amp-video-eq-col><div class=amp-video-eq-filler></div><div class=amp-video-eq-filler></div></div></i-amphtml-video-icon>"];
function $renderIcon$$module$src$service$video$autoplay$$($win$jscomp$64$$, $elOrDoc$jscomp$1_i$jscomp$27$$) {
  var $icon$$ = $htmlFor$$module$src$static_template$$($elOrDoc$jscomp$1_i$jscomp$27$$)($_template2$$module$src$service$video$autoplay$$), $firstCol$$ = $icon$$.firstElementChild;
  for ($elOrDoc$jscomp$1_i$jscomp$27$$ = 0; 4 > $elOrDoc$jscomp$1_i$jscomp$27$$; $elOrDoc$jscomp$1_i$jscomp$27$$++) {
    for (var $col$$ = $firstCol$$.cloneNode(!0), $fillers$$ = $col$$.children, $j$$ = 0; $j$$ < $fillers$$.length; $j$$++) {
      $fillers$$[$j$$].classList.add("amp-video-eq-" + ($elOrDoc$jscomp$1_i$jscomp$27$$ + 1) + "-" + ($j$$ + 1));
    }
    $icon$$.appendChild($col$$);
  }
  $removeElement$$module$src$dom$$($firstCol$$);
  $getService$$module$src$service$$($win$jscomp$64$$, "platform").isIos() && $icon$$.setAttribute("unpausable", "");
  return $icon$$;
}
;function $VideoManager$$module$src$service$video_manager_impl$$($ampdoc$jscomp$15$$) {
  var $$jscomp$this$jscomp$3$$ = this;
  this.ampdoc = $ampdoc$jscomp$15$$;
  this.installAutoplayStyles = $once$$module$src$utils$function$$(function() {
    var $ampdoc$jscomp$15$$ = $cssText$$module$build$video_autoplay_css$$, $JSCompiler_cssRoot$jscomp$inline_208$$ = $$jscomp$this$jscomp$3$$.ampdoc.getHeadNode();
    var $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$ = ($JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$ = $JSCompiler_cssRoot$jscomp$inline_208$$.__AMP_CSS_TR) ? $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$($ampdoc$jscomp$15$$) : $ampdoc$jscomp$15$$;
    ($ampdoc$jscomp$15$$ = $JSCompiler_cssRoot$jscomp$inline_208$$.__AMP_CSS_SM) || ($ampdoc$jscomp$15$$ = $JSCompiler_cssRoot$jscomp$inline_208$$.__AMP_CSS_SM = $map$$module$src$utils$object$$());
    var $JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$ = $getExistingStyleElement$$module$src$style_installer$$($JSCompiler_cssRoot$jscomp$inline_208$$, $ampdoc$jscomp$15$$, "amp-extension=amp-video-autoplay");
    $JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$ ? $JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$.textContent !== $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$ && ($JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$.textContent = $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$) : 
    ($JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$ = ($JSCompiler_cssRoot$jscomp$inline_208$$.ownerDocument || $JSCompiler_cssRoot$jscomp$inline_208$$).createElement("style"), $JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$.textContent = $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$, $JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$.setAttribute("amp-extension", 
    "amp-video-autoplay"), $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$ = $getExistingStyleElement$$module$src$style_installer$$($JSCompiler_cssRoot$jscomp$inline_208$$, $ampdoc$jscomp$15$$, "amp-runtime"), ($JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$ = void 0 === $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$ ? 
    null : $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$) ? $JSCompiler_cssRoot$jscomp$inline_208$$.insertBefore($JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$, $JSCompiler_after$jscomp$inline_287_JSCompiler_inline_result$jscomp$263_JSCompiler_transformer$jscomp$inline_277$$.nextSibling) : $JSCompiler_cssRoot$jscomp$inline_208$$.insertBefore($JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$, 
    $JSCompiler_cssRoot$jscomp$inline_208$$.firstChild), $ampdoc$jscomp$15$$["amp-extension=amp-video-autoplay"] = $JSCompiler_existing$jscomp$inline_284_JSCompiler_style$jscomp$inline_285$$);
  });
  this.$viewport_$ = $getServiceForDoc$$module$src$service$$(this.ampdoc, "viewport");
  this.$lastFoundEntry_$ = this.$entries_$ = null;
  this.$scrollListenerInstalled_$ = !1;
  this.$timer_$ = $getService$$module$src$service$$($ampdoc$jscomp$15$$.win, "timer");
  this.$actions_$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($ampdoc$jscomp$15$$.getHeadNode(), "action");
  this.$boundSecondsPlaying_$ = function() {
    for (var $ampdoc$jscomp$15$$ = 0; $ampdoc$jscomp$15$$ < $$jscomp$this$jscomp$3$$.$entries_$.length; $ampdoc$jscomp$15$$++) {
      var $JSCompiler_entry$jscomp$inline_84$$ = $$jscomp$this$jscomp$3$$.$entries_$[$ampdoc$jscomp$15$$];
      if ("paused" !== $JSCompiler_entry$jscomp$inline_84$$.getPlayingState()) {
        $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_entry$jscomp$inline_84$$, "video-seconds-played");
        var $JSCompiler_currentTime$jscomp$inline_213_JSCompiler_event$jscomp$inline_215$$ = $JSCompiler_entry$jscomp$inline_84$$.video.getCurrentTime(), $JSCompiler_duration$jscomp$inline_214$$ = $JSCompiler_entry$jscomp$inline_84$$.video.getDuration();
        $isFiniteNumber$$module$src$types$$($JSCompiler_currentTime$jscomp$inline_213_JSCompiler_event$jscomp$inline_215$$) && $isFiniteNumber$$module$src$types$$($JSCompiler_duration$jscomp$inline_214$$) && 0 < $JSCompiler_duration$jscomp$inline_214$$ && ($JSCompiler_currentTime$jscomp$inline_213_JSCompiler_event$jscomp$inline_215$$ = $createCustomEvent$$module$src$event_helper$$($$jscomp$this$jscomp$3$$.ampdoc.win, "video-manager.timeUpdate", $dict$$module$src$utils$object$$({time:$JSCompiler_currentTime$jscomp$inline_213_JSCompiler_event$jscomp$inline_215$$, 
        percent:$JSCompiler_currentTime$jscomp$inline_213_JSCompiler_event$jscomp$inline_215$$ / $JSCompiler_duration$jscomp$inline_214$$})), $$jscomp$this$jscomp$3$$.$actions_$.trigger($JSCompiler_entry$jscomp$inline_84$$.video.element, "timeUpdate", $JSCompiler_currentTime$jscomp$inline_213_JSCompiler_event$jscomp$inline_215$$, 1));
      }
    }
    $$jscomp$this$jscomp$3$$.$timer_$.delay($$jscomp$this$jscomp$3$$.$boundSecondsPlaying_$, 1000);
  };
  this.$getAutoFullscreenManager_$ = $once$$module$src$utils$function$$(function() {
    return new $AutoFullscreenManager$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$3$$.ampdoc, $$jscomp$this$jscomp$3$$);
  });
  this.$timer_$.delay(this.$boundSecondsPlaying_$, 1000);
}
$JSCompiler_prototypeAlias$$ = $VideoManager$$module$src$service$video_manager_impl$$.prototype;
$JSCompiler_prototypeAlias$$.dispose = function() {
  this.$getAutoFullscreenManager_$().dispose();
  if (this.$entries_$) {
    for (var $i$jscomp$28$$ = 0; $i$jscomp$28$$ < this.$entries_$.length; $i$jscomp$28$$++) {
      this.$entries_$[$i$jscomp$28$$].dispose();
    }
  }
};
$JSCompiler_prototypeAlias$$.register = function($video$jscomp$3$$) {
  $JSCompiler_StaticMethods_registerCommonActions_$$($video$jscomp$3$$);
  if ($video$jscomp$3$$.supportsPlatform()) {
    this.$entries_$ = this.$entries_$ || [];
    var $element$jscomp$81_entry$jscomp$3$$ = new $VideoEntry$$module$src$service$video_manager_impl$$(this, $video$jscomp$3$$);
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$$(this, $element$jscomp$81_entry$jscomp$3$$);
    this.$entries_$.push($element$jscomp$81_entry$jscomp$3$$);
    $element$jscomp$81_entry$jscomp$3$$ = $element$jscomp$81_entry$jscomp$3$$.video.element;
    $element$jscomp$81_entry$jscomp$3$$.dispatchCustomEvent("registered");
    $element$jscomp$81_entry$jscomp$3$$.classList.add("i-amphtml-media-component");
    $video$jscomp$3$$.signals().signal("registered");
    $element$jscomp$81_entry$jscomp$3$$.classList.add("i-amphtml-video-interface");
  }
};
function $JSCompiler_StaticMethods_registerCommonActions_$$($video$jscomp$4$$) {
  function $fullscreenEnter$$() {
    return $video$jscomp$4$$.fullscreenEnter();
  }
  function $registerAction$$($fullscreenEnter$$, $registerAction$$) {
    $video$jscomp$4$$.registerAction($fullscreenEnter$$, function() {
      $userInteractedWith$$module$src$video_interface$$($video$jscomp$4$$);
      $registerAction$$();
    }, 1);
  }
  $registerAction$$("play", function() {
    return $video$jscomp$4$$.play(!1);
  });
  $registerAction$$("pause", function() {
    return $video$jscomp$4$$.pause();
  });
  $registerAction$$("mute", function() {
    return $video$jscomp$4$$.mute();
  });
  $registerAction$$("unmute", function() {
    return $video$jscomp$4$$.unmute();
  });
  $registerAction$$("fullscreenenter", $fullscreenEnter$$);
  $registerAction$$("fullscreen", $fullscreenEnter$$);
}
function $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$$($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$, $entry$jscomp$4$$) {
  var $element$jscomp$82$$ = $entry$jscomp$4$$.video.element;
  $listen$$module$src$event_helper$$($element$jscomp$82$$, "amp:video:visibility", function($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$) {
    ($JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$ = $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.data) && 1 == $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.visible ? $entry$jscomp$4$$.updateVisibility(!0) : $entry$jscomp$4$$.updateVisibility();
  });
  $listen$$module$src$event_helper$$($element$jscomp$82$$, "reloaded", function() {
    $entry$jscomp$4$$.videoLoaded();
  });
  if (!$JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$scrollListenerInstalled_$) {
    var $scrollListener$$ = function() {
      for (var $entry$jscomp$4$$ = 0; $entry$jscomp$4$$ < $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$entries_$.length; $entry$jscomp$4$$++) {
        $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$entries_$[$entry$jscomp$4$$].updateVisibility();
      }
    };
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$viewport_$.onScroll($scrollListener$$);
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$viewport_$.onChanged($scrollListener$$);
    $JSCompiler_StaticMethods_maybeInstallVisibilityObserver_$self$$.$scrollListenerInstalled_$ = !0;
  }
}
function $JSCompiler_StaticMethods_getEntry_$$($JSCompiler_StaticMethods_getEntry_$self$$, $videoOrElement$$) {
  if ($isEntryFor$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_getEntry_$self$$.$lastFoundEntry_$, $videoOrElement$$)) {
    return $JSCompiler_StaticMethods_getEntry_$self$$.$lastFoundEntry_$;
  }
  for (var $i$jscomp$31$$ = 0; $i$jscomp$31$$ < $JSCompiler_StaticMethods_getEntry_$self$$.$entries_$.length; $i$jscomp$31$$++) {
    var $entry$jscomp$5$$ = $JSCompiler_StaticMethods_getEntry_$self$$.$entries_$[$i$jscomp$31$$];
    if ($isEntryFor$$module$src$service$video_manager_impl$$($entry$jscomp$5$$, $videoOrElement$$)) {
      return $JSCompiler_StaticMethods_getEntry_$self$$.$lastFoundEntry_$ = $entry$jscomp$5$$;
    }
  }
  return null;
}
$JSCompiler_prototypeAlias$$.registerForAutoFullscreen = function($entry$jscomp$6$$) {
  this.$getAutoFullscreenManager_$().register($entry$jscomp$6$$);
};
$JSCompiler_prototypeAlias$$.$getAutoFullscreenManagerForTesting_$ = function() {
  return this.$getAutoFullscreenManager_$();
};
$JSCompiler_prototypeAlias$$.getVideoStateProperty = function($entry$jscomp$7_id$jscomp$38$$, $property$jscomp$10$$) {
  var $root$jscomp$10$$ = this.ampdoc.getRootNode(), $videoElement$$ = $user$$module$src$log$$().assertElement($root$jscomp$10$$.getElementById($entry$jscomp$7_id$jscomp$38$$), 'Could not find an element with id="' + $entry$jscomp$7_id$jscomp$38$$ + '" for VIDEO_STATE');
  $entry$jscomp$7_id$jscomp$38$$ = $JSCompiler_StaticMethods_getEntry_$$(this, $videoElement$$);
  return ($entry$jscomp$7_id$jscomp$38$$ ? $entry$jscomp$7_id$jscomp$38$$.getAnalyticsDetails() : $resolvedPromise$$module$src$resolved_promise$$()).then(function($entry$jscomp$7_id$jscomp$38$$) {
    return $entry$jscomp$7_id$jscomp$38$$ ? $entry$jscomp$7_id$jscomp$38$$[$property$jscomp$10$$] : "";
  });
};
$JSCompiler_prototypeAlias$$.getPlayingState = function($videoOrElement$jscomp$1$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$1$$).getPlayingState();
};
$JSCompiler_prototypeAlias$$.isMuted = function($videoOrElement$jscomp$2$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$2$$).isMuted();
};
$JSCompiler_prototypeAlias$$.userInteracted = function($videoOrElement$jscomp$3$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$3$$).userInteracted();
};
$JSCompiler_prototypeAlias$$.isRollingAd = function($videoOrElement$jscomp$4$$) {
  return $JSCompiler_StaticMethods_getEntry_$$(this, $videoOrElement$jscomp$4$$).isRollingAd();
};
$JSCompiler_prototypeAlias$$.pauseOtherVideos = function($entryBeingPlayed$$) {
  this.$entries_$.forEach(function($entry$jscomp$8$$) {
    $entry$jscomp$8$$.isPlaybackManaged() && $entry$jscomp$8$$ !== $entryBeingPlayed$$ && "playing_manual" == $entry$jscomp$8$$.getPlayingState() && $entry$jscomp$8$$.video.pause();
  });
};
function $isEntryFor$$module$src$service$video_manager_impl$$($entry$jscomp$9$$, $videoOrElement$jscomp$5$$) {
  return !!$entry$jscomp$9$$ && ($entry$jscomp$9$$.video === $videoOrElement$jscomp$5$$ || $entry$jscomp$9$$.video.element === $videoOrElement$jscomp$5$$);
}
function $VideoEntry$$module$src$service$video_manager_impl$$($manager$$, $video$jscomp$5$$) {
  var $$jscomp$this$jscomp$5$$ = this;
  this.$manager_$ = $manager$$;
  this.$ampdoc_$ = $manager$$.ampdoc;
  this.video = $video$jscomp$5$$;
  this.$managePlayback_$ = !0;
  this.$isVisible_$ = this.$isRollingAd_$ = this.$isPlaying_$ = this.$loaded_$ = !1;
  this.$actionSessionManager_$ = new $VideoSessionManager$$module$src$service$video_session_manager$$;
  this.$actionSessionManager_$.onSessionEnd(function() {
    return $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-session");
  });
  this.$visibilitySessionManager_$ = new $VideoSessionManager$$module$src$service$video_session_manager$$;
  this.$visibilitySessionManager_$.onSessionEnd(function() {
    return $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-session-visible");
  });
  this.$supportsAutoplay_$ = function() {
    var $manager$$ = $$jscomp$this$jscomp$5$$.$ampdoc_$.win, $video$jscomp$5$$ = $manager$$ || self;
    if ($video$jscomp$5$$.__AMP_MODE) {
      $video$jscomp$5$$ = $video$jscomp$5$$.__AMP_MODE;
    } else {
      var $JSCompiler_hashQuery$jscomp$inline_218_JSCompiler_inline_result$jscomp$175$$ = $parseQueryString_$$module$src$url_parse_query_string$$($video$jscomp$5$$.location.originalHash || $video$jscomp$5$$.location.hash);
      var $JSCompiler_searchQuery$jscomp$inline_219$$ = $parseQueryString_$$module$src$url_parse_query_string$$($video$jscomp$5$$.location.search);
      $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $video$jscomp$5$$.AMP_CONFIG && $video$jscomp$5$$.AMP_CONFIG.v ? $video$jscomp$5$$.AMP_CONFIG.v : "012007210308000");
      $JSCompiler_hashQuery$jscomp$inline_218_JSCompiler_inline_result$jscomp$175$$ = {localDev:!1, development:!!(0 <= ["1", "actions", "amp", "amp4ads", "amp4email"].indexOf($JSCompiler_hashQuery$jscomp$inline_218_JSCompiler_inline_result$jscomp$175$$.development) || $video$jscomp$5$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_218_JSCompiler_inline_result$jscomp$175$$.development, esm:!1, geoOverride:$JSCompiler_hashQuery$jscomp$inline_218_JSCompiler_inline_result$jscomp$175$$["amp-geo"], 
      minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_219$$.amp_lite, test:!1, log:$JSCompiler_hashQuery$jscomp$inline_218_JSCompiler_inline_result$jscomp$175$$.log, version:"2007210308000", rtvVersion:$rtvVersion$$module$src$mode$$};
      $video$jscomp$5$$ = $video$jscomp$5$$.__AMP_MODE = $JSCompiler_hashQuery$jscomp$inline_218_JSCompiler_inline_result$jscomp$175$$;
    }
    $video$jscomp$5$$ = $video$jscomp$5$$.lite;
    $isAutoplaySupported$$module$src$utils$video$$ || ($isAutoplaySupported$$module$src$utils$video$$ = $once$$module$src$utils$function$$($isAutoplaySupportedImpl$$module$src$utils$video$$));
    return $isAutoplaySupported$$module$src$utils$video$$($manager$$, $video$jscomp$5$$);
  };
  this.$getAnalyticsPercentageTracker_$ = $once$$module$src$utils$function$$(function() {
    return new $AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$.$ampdoc_$.win, $$jscomp$this$jscomp$5$$);
  });
  this.$pauseCalledByAutoplay_$ = this.$playCalledByAutoplay_$ = !1;
  this.$internalElement_$ = null;
  this.$hasSeenPlayEvent_$ = this.$muted_$ = !1;
  (this.hasAutoplay = $video$jscomp$5$$.element.hasAttribute("autoplay")) && this.$manager_$.installAutoplayStyles();
  this.$metadata_$ = $EMPTY_METADATA$$module$src$mediasession_helper$$;
  this.$boundMediasessionPlay_$ = function() {
    $$jscomp$this$jscomp$5$$.video.play(!1);
  };
  this.$boundMediasessionPause_$ = function() {
    $$jscomp$this$jscomp$5$$.video.pause();
  };
  $listenOncePromise$$module$src$event_helper$$($video$jscomp$5$$.element).then(function() {
    return $$jscomp$this$jscomp$5$$.videoLoaded();
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "pause", function() {
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-pause");
    $$jscomp$this$jscomp$5$$.$isPlaying_$ = !1;
    $$jscomp$this$jscomp$5$$.$pauseCalledByAutoplay_$ ? $$jscomp$this$jscomp$5$$.$pauseCalledByAutoplay_$ = !1 : $$jscomp$this$jscomp$5$$.$actionSessionManager_$.endSession();
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "play", function() {
    $$jscomp$this$jscomp$5$$.$hasSeenPlayEvent_$ = !0;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-play");
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "playing", function() {
    $$jscomp$this$jscomp$5$$.$isPlaying_$ = !0;
    "playing_manual" == $$jscomp$this$jscomp$5$$.getPlayingState() && ($$jscomp$this$jscomp$5$$.$firstPlayEventOrNoop_$(), $$jscomp$this$jscomp$5$$.$manager_$.pauseOtherVideos($$jscomp$this$jscomp$5$$));
    var $manager$$ = $$jscomp$this$jscomp$5$$.video, $video$jscomp$5$$ = $manager$$.element;
    if (!$manager$$.preimplementsMediaSessionAPI() && !$video$jscomp$5$$.classList.contains("i-amphtml-disable-mediasession")) {
      $manager$$ = $$jscomp$this$jscomp$5$$.$ampdoc_$.win;
      var $JSCompiler_metadata$jscomp$inline_224$$ = $$jscomp$this$jscomp$5$$.$metadata_$, $JSCompiler_playHandler$jscomp$inline_225$$ = $$jscomp$this$jscomp$5$$.$boundMediasessionPlay_$, $JSCompiler_pauseHandler$jscomp$inline_226$$ = $$jscomp$this$jscomp$5$$.$boundMediasessionPause_$, $JSCompiler_navigator$jscomp$inline_227$$ = $manager$$.navigator;
      "mediaSession" in $JSCompiler_navigator$jscomp$inline_227$$ && $manager$$.MediaMetadata && ($JSCompiler_navigator$jscomp$inline_227$$.mediaSession.metadata = new $manager$$.MediaMetadata($EMPTY_METADATA$$module$src$mediasession_helper$$), $validateMetadata$$module$src$mediasession_helper$$($video$jscomp$5$$, $JSCompiler_metadata$jscomp$inline_224$$), $JSCompiler_navigator$jscomp$inline_227$$.mediaSession.metadata = new $manager$$.MediaMetadata($JSCompiler_metadata$jscomp$inline_224$$), $JSCompiler_navigator$jscomp$inline_227$$.mediaSession.setActionHandler("play", 
      $JSCompiler_playHandler$jscomp$inline_225$$), $JSCompiler_navigator$jscomp$inline_227$$.mediaSession.setActionHandler("pause", $JSCompiler_pauseHandler$jscomp$inline_226$$));
    }
    $$jscomp$this$jscomp$5$$.$actionSessionManager_$.beginSession();
    $$jscomp$this$jscomp$5$$.$isVisible_$ && $$jscomp$this$jscomp$5$$.$visibilitySessionManager_$.beginSession();
    $$jscomp$this$jscomp$5$$.$hasSeenPlayEvent_$ || $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-play");
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "muted", function() {
    return $$jscomp$this$jscomp$5$$.$muted_$ = !0;
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "unmuted", function() {
    $$jscomp$this$jscomp$5$$.$muted_$ = !1;
    $$jscomp$this$jscomp$5$$.$manager_$.pauseOtherVideos($$jscomp$this$jscomp$5$$);
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "amp:video:tick", function($manager$$) {
    $manager$$ = $manager$$.data;
    var $video$jscomp$5$$ = $manager$$.eventType;
    $video$jscomp$5$$ && $JSCompiler_StaticMethods_logCustomAnalytics_$$($$jscomp$this$jscomp$5$$, $video$jscomp$5$$, $manager$$.vars);
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "ended", function() {
    $$jscomp$this$jscomp$5$$.$isRollingAd_$ = !1;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-ended");
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "ad_start", function() {
    $$jscomp$this$jscomp$5$$.$isRollingAd_$ = !0;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-ad-start");
  });
  $listen$$module$src$event_helper$$($video$jscomp$5$$.element, "ad_end", function() {
    $$jscomp$this$jscomp$5$$.$isRollingAd_$ = !1;
    $analyticsEvent$$module$src$service$video_manager_impl$$($$jscomp$this$jscomp$5$$, "video-ad-end");
  });
  $video$jscomp$5$$.signals().whenSignal("registered").then(function() {
    var $manager$$ = $$jscomp$this$jscomp$5$$.video.element;
    ($$jscomp$this$jscomp$5$$.video.preimplementsAutoFullscreen() || !$manager$$.hasAttribute("rotate-to-fullscreen") ? 0 : $userAssert$$module$src$log$$($$jscomp$this$jscomp$5$$.video.isInteractive(), "Only interactive videos are allowed to enter fullscreen on rotate. Set the `controls` attribute on %s to enable.", $manager$$)) && $$jscomp$this$jscomp$5$$.$manager_$.registerForAutoFullscreen($$jscomp$this$jscomp$5$$);
    $$jscomp$this$jscomp$5$$.updateVisibility();
    $$jscomp$this$jscomp$5$$.hasAutoplay && $JSCompiler_StaticMethods_autoplayVideoBuilt_$$($$jscomp$this$jscomp$5$$);
  });
  this.$firstPlayEventOrNoop_$ = $once$$module$src$utils$function$$(function() {
    var $manager$$ = $createCustomEvent$$module$src$event_helper$$($$jscomp$this$jscomp$5$$.$ampdoc_$.win, "firstPlay", $dict$$module$src$utils$object$$({})), $video$jscomp$5$$ = $$jscomp$this$jscomp$5$$.video.element;
    $getExistingServiceForDocInEmbedScope$$module$src$service$$($video$jscomp$5$$, "action").trigger($video$jscomp$5$$, "firstPlay", $manager$$, 1);
  });
  $JSCompiler_StaticMethods_listenForPlaybackDelegation_$$(this);
}
$JSCompiler_prototypeAlias$$ = $VideoEntry$$module$src$service$video_manager_impl$$.prototype;
$JSCompiler_prototypeAlias$$.dispose = function() {
  this.$getAnalyticsPercentageTracker_$().stop();
};
function $JSCompiler_StaticMethods_logCustomAnalytics_$$($JSCompiler_StaticMethods_logCustomAnalytics_$self$$, $eventType$jscomp$8$$, $vars$$) {
  var $$jscomp$compprop0$$ = {}, $prefixedVars$$ = ($$jscomp$compprop0$$["__amp:eventType"] = $eventType$jscomp$8$$, $$jscomp$compprop0$$);
  Object.keys($vars$$).forEach(function($JSCompiler_StaticMethods_logCustomAnalytics_$self$$) {
    $prefixedVars$$["custom_" + $JSCompiler_StaticMethods_logCustomAnalytics_$self$$] = $vars$$[$JSCompiler_StaticMethods_logCustomAnalytics_$self$$];
  });
  $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_logCustomAnalytics_$self$$, "video-hosted-custom", $prefixedVars$$);
}
function $JSCompiler_StaticMethods_listenForPlaybackDelegation_$$($JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$) {
  $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.video.signals().whenSignal("playback-delegated").then(function() {
    $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.$managePlayback_$ = !1;
    $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.$isPlaying_$ && $JSCompiler_StaticMethods_listenForPlaybackDelegation_$self$$.video.pause();
  });
}
$JSCompiler_prototypeAlias$$.isMuted = function() {
  return this.$muted_$;
};
$JSCompiler_prototypeAlias$$.isPlaybackManaged = function() {
  return this.$managePlayback_$;
};
$JSCompiler_prototypeAlias$$.videoLoaded = function() {
  this.$loaded_$ = !0;
  this.$internalElement_$ = this.video.element.querySelector("video, iframe");
  if (!this.video.preimplementsMediaSessionAPI()) {
    this.video.getMetadata() && (this.$metadata_$ = $map$$module$src$utils$object$$(this.video.getMetadata()));
    var $JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$ = this.$ampdoc_$.win.document;
    if (!this.$metadata_$.artwork || 0 == this.$metadata_$.artwork.length) {
      var $JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$;
      ($JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$ = $parseSchemaImage$$module$src$mediasession_helper$$($JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$)) || ($JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$ = ($JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$ = 
      $JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$.querySelector('meta[property="og:image"]')) ? $JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$.getAttribute("content") : void 0);
      $JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$ || ($JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$ = ($JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$ = 
      $JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$.querySelector('link[rel="shortcut icon"]') || $JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$.querySelector('link[rel="icon"]')) ? $JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$.getAttribute("href") : void 0);
      $JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$ && (this.$metadata_$.artwork = [{src:$JSCompiler_linkTag$jscomp$inline_236_JSCompiler_metaTag$jscomp$inline_233_JSCompiler_posterUrl$jscomp$inline_104_JSCompiler_temp$jscomp$181_JSCompiler_temp$jscomp$182$$}]);
    }
    !this.$metadata_$.title && ($JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$ = this.video.element.getAttribute("title") || this.video.element.getAttribute("aria-label") || this.$internalElement_$.getAttribute("title") || this.$internalElement_$.getAttribute("aria-label") || $JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$.title) && (this.$metadata_$.title = $JSCompiler_doc$jscomp$inline_103_JSCompiler_title$jscomp$inline_105$$);
  }
  this.$getAnalyticsPercentageTracker_$().start();
  this.updateVisibility();
  this.$isVisible_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$(this);
};
function $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$) {
  $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$ampdoc_$.isVisible() && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$supportsAutoplay_$().then(function($supportsAutoplay$$) {
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.hasAutoplay && !$JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.userInteracted() && $supportsAutoplay$$ ? $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$managePlayback_$ && ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isVisible_$ ? ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.beginSession(), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.video.play(!0), 
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$playCalledByAutoplay_$ = !0) : ($JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isPlaying_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.endSession(), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.video.pause(), $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$pauseCalledByAutoplay_$ = !0)) : $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isVisible_$ ? 
    $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.beginSession() : $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$isPlaying_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$self$$.$visibilitySessionManager_$.endSession();
  });
}
function $JSCompiler_StaticMethods_autoplayVideoBuilt_$$($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$) {
  $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.isInteractive() && $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.hideControls();
  $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.$supportsAutoplay_$().then(function($supportsAutoplay$jscomp$1$$) {
    !$supportsAutoplay$jscomp$1$$ && $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.isInteractive() ? $JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.showControls() : ($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$.video.mute(), $JSCompiler_StaticMethods_installAutoplayArtifacts_$$($JSCompiler_StaticMethods_autoplayVideoBuilt_$self$$));
  });
}
function $JSCompiler_StaticMethods_installAutoplayArtifacts_$$($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
  var $video$jscomp$7$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $$jscomp$destructuring$var25_win$jscomp$66$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $element$jscomp$86$$ = $$jscomp$destructuring$var25_win$jscomp$66$$.element;
  $$jscomp$destructuring$var25_win$jscomp$66$$ = $$jscomp$destructuring$var25_win$jscomp$66$$.win;
  if (!$element$jscomp$86$$.hasAttribute("noaudio") && !$element$jscomp$86$$.signals().get("user-interacted")) {
    var $animation$$ = $renderIcon$$module$src$service$video$autoplay$$($$jscomp$destructuring$var25_win$jscomp$66$$, $element$jscomp$86$$), $toggleAnimation$$ = function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
      $video$jscomp$7$$.mutateElementSkipRemeasure(function() {
        return $animation$$.classList.toggle("amp-video-eq-play", $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$);
      });
    };
    $video$jscomp$7$$.mutateElementSkipRemeasure(function() {
      return $element$jscomp$86$$.appendChild($animation$$);
    });
    var $unlisteners$$ = [$listen$$module$src$event_helper$$($element$jscomp$86$$, "pause", function() {
      return $toggleAnimation$$(!1);
    }), $listen$$module$src$event_helper$$($element$jscomp$86$$, "playing", function() {
      return $toggleAnimation$$(!0);
    })];
    $video$jscomp$7$$.signals().whenSignal("user-interacted").then(function() {
      var $video$jscomp$7$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.video, $$jscomp$destructuring$var25_win$jscomp$66$$ = $video$jscomp$7$$.element;
      $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$.$firstPlayEventOrNoop_$();
      $video$jscomp$7$$.isInteractive() && $video$jscomp$7$$.showControls();
      $video$jscomp$7$$.unmute();
      $unlisteners$$.forEach(function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$();
      });
      $video$jscomp$7$$ = $$jscomp$destructuring$var25_win$jscomp$66$$.querySelector(".amp-video-eq");
      $$jscomp$destructuring$var25_win$jscomp$66$$ = $$jscomp$destructuring$var25_win$jscomp$66$$.querySelector("i-amphtml-video-mask");
      $video$jscomp$7$$ && $removeElement$$module$src$dom$$($video$jscomp$7$$);
      $$jscomp$destructuring$var25_win$jscomp$66$$ && $removeElement$$module$src$dom$$($$jscomp$destructuring$var25_win$jscomp$66$$);
    });
    if ($video$jscomp$7$$.isInteractive()) {
      var $mask$jscomp$7$$ = $htmlFor$$module$src$static_template$$($element$jscomp$86$$)($_template$$module$src$service$video$autoplay$$), $setMaskDisplay$$ = function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        $video$jscomp$7$$.mutateElementSkipRemeasure(function() {
          var $video$jscomp$7$$ = $JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$;
          void 0 === $video$jscomp$7$$ && ($video$jscomp$7$$ = $mask$jscomp$7$$.hasAttribute("hidden"));
          $video$jscomp$7$$ ? $mask$jscomp$7$$.removeAttribute("hidden") : $mask$jscomp$7$$.setAttribute("hidden", "");
        });
      };
      $video$jscomp$7$$.hideControls();
      $video$jscomp$7$$.mutateElementSkipRemeasure(function() {
        return $element$jscomp$86$$.appendChild($mask$jscomp$7$$);
      });
      [$listen$$module$src$event_helper$$($mask$jscomp$7$$, "click", function() {
        return $userInteractedWith$$module$src$video_interface$$($video$jscomp$7$$);
      }), $listen$$module$src$event_helper$$($element$jscomp$86$$, "ad_start", function() {
        $setMaskDisplay$$(!1);
        $video$jscomp$7$$.showControls();
      }), $listen$$module$src$event_helper$$($element$jscomp$86$$, "ad_end", function() {
        $setMaskDisplay$$(!0);
        $video$jscomp$7$$.hideControls();
      }), $listen$$module$src$event_helper$$($element$jscomp$86$$, "unmuted", function() {
        return $userInteractedWith$$module$src$video_interface$$($video$jscomp$7$$);
      })].forEach(function($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$) {
        return $unlisteners$$.push($JSCompiler_StaticMethods_installAutoplayArtifacts_$self$$);
      });
    }
  }
}
$JSCompiler_prototypeAlias$$.updateVisibility = function($opt_forceVisible$$) {
  var $wasVisible$$ = this.$isVisible_$;
  if ($opt_forceVisible$$) {
    this.$isVisible_$ = !0;
  } else {
    var $ratio$$ = this.video.element.getIntersectionChangeEntry().intersectionRatio;
    this.$isVisible_$ = 0.5 <= ($isFiniteNumber$$module$src$types$$($ratio$$) ? $ratio$$ : 0);
  }
  this.$isVisible_$ != $wasVisible$$ && this.$loaded_$ && $JSCompiler_StaticMethods_loadedVideoVisibilityChanged_$$(this);
};
$JSCompiler_prototypeAlias$$.getPlayingState = function() {
  return this.$isPlaying_$ ? this.$isPlaying_$ && this.$playCalledByAutoplay_$ && !this.userInteracted() ? "playing_auto" : "playing_manual" : "paused";
};
$JSCompiler_prototypeAlias$$.isRollingAd = function() {
  return this.$isRollingAd_$;
};
$JSCompiler_prototypeAlias$$.userInteracted = function() {
  return null != this.video.signals().get("user-interacted");
};
$JSCompiler_prototypeAlias$$.getAnalyticsDetails = function() {
  var $$jscomp$this$jscomp$10$$ = this, $video$jscomp$9$$ = this.video;
  return this.$supportsAutoplay_$().then(function($supportsAutoplay$jscomp$2$$) {
    var $$jscomp$destructuring$var30_height$jscomp$25$$ = $video$jscomp$9$$.element.getLayoutBox(), $width$jscomp$26$$ = $$jscomp$destructuring$var30_height$jscomp$25$$.width;
    $$jscomp$destructuring$var30_height$jscomp$25$$ = $$jscomp$destructuring$var30_height$jscomp$25$$.height;
    var $autoplay$$ = $$jscomp$this$jscomp$10$$.hasAutoplay && $supportsAutoplay$jscomp$2$$, $playedRanges$$ = $video$jscomp$9$$.getPlayedRanges(), $playedTotal$$ = $playedRanges$$.reduce(function($$jscomp$this$jscomp$10$$, $video$jscomp$9$$) {
      return $$jscomp$this$jscomp$10$$ + $video$jscomp$9$$[1] - $video$jscomp$9$$[0];
    }, 0);
    return {autoplay:$autoplay$$, currentTime:$video$jscomp$9$$.getCurrentTime(), duration:$video$jscomp$9$$.getDuration(), height:$$jscomp$destructuring$var30_height$jscomp$25$$, id:$video$jscomp$9$$.element.id, muted:$$jscomp$this$jscomp$10$$.$muted_$, playedTotal:$playedTotal$$, playedRangesJson:JSON.stringify($playedRanges$$), state:$$jscomp$this$jscomp$10$$.getPlayingState(), width:$width$jscomp$26$$};
  });
};
function $AutoFullscreenManager$$module$src$service$video_manager_impl$$($ampdoc$jscomp$16$$, $manager$jscomp$1$$) {
  var $$jscomp$this$jscomp$11$$ = this;
  this.$manager_$ = $manager$jscomp$1$$;
  this.$ampdoc_$ = $ampdoc$jscomp$16$$;
  this.$currentlyCentered_$ = this.$currentlyInFullscreen_$ = null;
  this.$entries_$ = [];
  this.$unlisteners_$ = [];
  this.$boundSelectBestCentered_$ = function() {
    return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$($$jscomp$this$jscomp$11$$);
  };
  this.$boundIncludeOnlyPlaying_$ = function($ampdoc$jscomp$16$$) {
    return "playing_manual" == $$jscomp$this$jscomp$11$$.$manager_$.getPlayingState($ampdoc$jscomp$16$$);
  };
  this.$boundCompareEntries_$ = function($ampdoc$jscomp$16$$, $manager$jscomp$1$$) {
    $ampdoc$jscomp$16$$ = $ampdoc$jscomp$16$$.element.getIntersectionChangeEntry();
    var $JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$ = $ampdoc$jscomp$16$$.intersectionRatio;
    $ampdoc$jscomp$16$$ = $ampdoc$jscomp$16$$.boundingClientRect;
    var $JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$ = $manager$jscomp$1$$.element.getIntersectionChangeEntry();
    $manager$jscomp$1$$ = $JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$.boundingClientRect;
    $JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$ -= $JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$.intersectionRatio;
    0.1 < Math.abs($JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$) ? $ampdoc$jscomp$16$$ = $JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$ : ($JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$ = $getServiceForDoc$$module$src$service$$($$jscomp$this$jscomp$11$$.$ampdoc_$, "viewport"), $JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$ = 
    $centerDist$$module$src$service$video_manager_impl$$($JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$, $ampdoc$jscomp$16$$), $JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$ = $centerDist$$module$src$service$video_manager_impl$$($JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$, $manager$jscomp$1$$), $ampdoc$jscomp$16$$ = $JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$ < $JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$ || $JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$ > 
    $JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$ ? $JSCompiler_$jscomp$inline_119_JSCompiler_inline_result$jscomp$47_JSCompiler_rectA$jscomp$inline_121_a$jscomp$6$$ - $JSCompiler_rectB$jscomp$inline_123_b$jscomp$6$$ : $ampdoc$jscomp$16$$.top - $manager$jscomp$1$$.top);
    return $ampdoc$jscomp$16$$;
  };
  $JSCompiler_StaticMethods_installOrientationObserver_$$(this);
  $JSCompiler_StaticMethods_installFullscreenListener_$$(this);
}
$AutoFullscreenManager$$module$src$service$video_manager_impl$$.prototype.dispose = function() {
  this.$unlisteners_$.forEach(function($unlisten$jscomp$2$$) {
    return $unlisten$jscomp$2$$();
  });
  this.$unlisteners_$.length = 0;
};
$AutoFullscreenManager$$module$src$service$video_manager_impl$$.prototype.register = function($entry$jscomp$10_video$jscomp$12$$) {
  $entry$jscomp$10_video$jscomp$12$$ = $entry$jscomp$10_video$jscomp$12$$.video;
  var $element$jscomp$89$$ = $entry$jscomp$10_video$jscomp$12$$.element;
  if ("video" == $element$jscomp$89$$.querySelector("video, iframe").tagName.toLowerCase()) {
    var $JSCompiler_inline_result$jscomp$45_JSCompiler_platform$jscomp$inline_131$$ = !0;
  } else {
    $JSCompiler_inline_result$jscomp$45_JSCompiler_platform$jscomp$inline_131$$ = $getService$$module$src$service$$(this.$ampdoc_$.win, "platform"), $JSCompiler_inline_result$jscomp$45_JSCompiler_platform$jscomp$inline_131$$ = $JSCompiler_inline_result$jscomp$45_JSCompiler_platform$jscomp$inline_131$$.isIos() || $JSCompiler_inline_result$jscomp$45_JSCompiler_platform$jscomp$inline_131$$.isSafari() ? !!{"amp-dailymotion":!0, "amp-ima-video":!0}[$element$jscomp$89$$.tagName.toLowerCase()] : !0;
  }
  $JSCompiler_inline_result$jscomp$45_JSCompiler_platform$jscomp$inline_131$$ && (this.$entries_$.push($entry$jscomp$10_video$jscomp$12$$), $listen$$module$src$event_helper$$($element$jscomp$89$$, "pause", this.$boundSelectBestCentered_$), $listen$$module$src$event_helper$$($element$jscomp$89$$, "playing", this.$boundSelectBestCentered_$), $listen$$module$src$event_helper$$($element$jscomp$89$$, "ended", this.$boundSelectBestCentered_$), $entry$jscomp$10_video$jscomp$12$$.signals().whenSignal("user-interacted").then(this.$boundSelectBestCentered_$), 
  $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$(this));
};
function $JSCompiler_StaticMethods_installFullscreenListener_$$($JSCompiler_StaticMethods_installFullscreenListener_$self$$) {
  function $exitHandler$$() {
    $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$currentlyInFullscreen_$ = null;
  }
  var $root$jscomp$11$$ = $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$ampdoc_$.getRootNode();
  $JSCompiler_StaticMethods_installFullscreenListener_$self$$.$unlisteners_$.push($listen$$module$src$event_helper$$($root$jscomp$11$$, "webkitfullscreenchange", $exitHandler$$), $listen$$module$src$event_helper$$($root$jscomp$11$$, "mozfullscreenchange", $exitHandler$$), $listen$$module$src$event_helper$$($root$jscomp$11$$, "fullscreenchange", $exitHandler$$), $listen$$module$src$event_helper$$($root$jscomp$11$$, "MSFullscreenChange", $exitHandler$$));
}
$AutoFullscreenManager$$module$src$service$video_manager_impl$$.prototype.isInLandscape = function() {
  var $JSCompiler_win$jscomp$inline_135$$ = this.$ampdoc_$.win;
  return $JSCompiler_win$jscomp$inline_135$$.screen && "orientation" in $JSCompiler_win$jscomp$inline_135$$.screen ? $startsWith$$module$src$string$$($JSCompiler_win$jscomp$inline_135$$.screen.orientation.type, "landscape") : 90 == Math.abs($JSCompiler_win$jscomp$inline_135$$.orientation);
};
function $JSCompiler_StaticMethods_installOrientationObserver_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$) {
  var $win$jscomp$67$$ = $JSCompiler_StaticMethods_installOrientationObserver_$self$$.$ampdoc_$.win, $screen$jscomp$1$$ = $win$jscomp$67$$.screen;
  $screen$jscomp$1$$ && "orientation" in $screen$jscomp$1$$ && $JSCompiler_StaticMethods_installOrientationObserver_$self$$.$unlisteners_$.push($listen$$module$src$event_helper$$($screen$jscomp$1$$.orientation, "change", function() {
    return $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$);
  }));
  $JSCompiler_StaticMethods_installOrientationObserver_$self$$.$unlisteners_$.push($listen$$module$src$event_helper$$($win$jscomp$67$$, "orientationchange", function() {
    return $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_installOrientationObserver_$self$$);
  }));
}
function $JSCompiler_StaticMethods_onRotation_$$($JSCompiler_StaticMethods_onRotation_$self$$) {
  $JSCompiler_StaticMethods_onRotation_$self$$.isInLandscape() ? null != $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyCentered_$ && $JSCompiler_StaticMethods_enter_$$($JSCompiler_StaticMethods_onRotation_$self$$, $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyCentered_$) : $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyInFullscreen_$ && $JSCompiler_StaticMethods_exit_$$($JSCompiler_StaticMethods_onRotation_$self$$, $JSCompiler_StaticMethods_onRotation_$self$$.$currentlyInFullscreen_$);
}
function $JSCompiler_StaticMethods_enter_$$($JSCompiler_StaticMethods_enter_$self$$, $video$jscomp$14$$) {
  var $platform$jscomp$1$$ = $getService$$module$src$service$$($JSCompiler_StaticMethods_enter_$self$$.$ampdoc_$.win, "platform");
  $JSCompiler_StaticMethods_enter_$self$$.$currentlyInFullscreen_$ = $video$jscomp$14$$;
  $platform$jscomp$1$$.isAndroid() && $platform$jscomp$1$$.isChrome() ? $video$jscomp$14$$.fullscreenEnter() : $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_enter_$self$$, $video$jscomp$14$$).then(function() {
    return $video$jscomp$14$$.fullscreenEnter();
  });
}
function $JSCompiler_StaticMethods_exit_$$($JSCompiler_StaticMethods_exit_$self$$, $video$jscomp$15$$) {
  $JSCompiler_StaticMethods_exit_$self$$.$currentlyInFullscreen_$ = null;
  $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_exit_$self$$, $video$jscomp$15$$, "center").then(function() {
    return $video$jscomp$15$$.fullscreenExit();
  });
}
function $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$, $video$jscomp$16$$, $optPos$$) {
  $optPos$$ = void 0 === $optPos$$ ? null : $optPos$$;
  var $element$jscomp$90$$ = $video$jscomp$16$$.element, $viewport$$ = $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.$ampdoc_$, "viewport");
  return $getService$$module$src$service$$($JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.$ampdoc_$.win, "timer").promise(330).then(function() {
    var $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ = $element$jscomp$90$$.getIntersectionChangeEntry().boundingClientRect, $video$jscomp$16$$ = $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.top;
    $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ = $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$.bottom;
    var $vh$$ = $viewport$$.getSize().height;
    return 0 <= $video$jscomp$16$$ && $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ <= $vh$$ ? $resolvedPromise$$module$src$resolved_promise$$() : $viewport$$.animateScrollIntoView($element$jscomp$90$$, $optPos$$ ? $optPos$$ : $JSCompiler_StaticMethods_scrollIntoIfNotVisible_$self$$ > $vh$$ ? "bottom" : "top");
  });
}
function $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$$($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$) {
  if ($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.isInLandscape()) {
    return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$;
  }
  $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$ = null;
  var $selected$$ = $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$entries_$.filter($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$boundIncludeOnlyPlaying_$).sort($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$boundCompareEntries_$)[0];
  $selected$$ && 0.5 <= $selected$$.element.getIntersectionChangeEntry().intersectionRatio && ($JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$ = $selected$$);
  return $JSCompiler_StaticMethods_selectBestCenteredInPortrait_$self$$.$currentlyCentered_$;
}
function $centerDist$$module$src$service$video_manager_impl$$($viewport$jscomp$2$$, $rect$$) {
  var $centerY$jscomp$1$$ = $rect$$.top + $rect$$.height / 2, $centerViewport$$ = $viewport$jscomp$2$$.getSize().height / 2;
  return Math.abs($centerY$jscomp$1$$ - $centerViewport$$);
}
function $AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$($win$jscomp$69$$, $entry$jscomp$11$$) {
  this.$timer_$ = $getService$$module$src$service$$($win$jscomp$69$$, "timer");
  this.$entry_$ = $entry$jscomp$11$$;
  this.$unlisteners_$ = null;
  this.$triggerId_$ = this.$last_$ = 0;
}
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.start = function() {
  var $$jscomp$this$jscomp$14$$ = this, $element$jscomp$91$$ = this.$entry_$.video.element;
  this.stop();
  this.$unlisteners_$ = this.$unlisteners_$ || [];
  $JSCompiler_StaticMethods_hasDuration_$$(this) ? $JSCompiler_StaticMethods_calculate_$$(this, this.$triggerId_$) : this.$unlisteners_$.push($listenOnce$$module$src$event_helper$$($element$jscomp$91$$, "loadedmetadata", function() {
    $JSCompiler_StaticMethods_hasDuration_$$($$jscomp$this$jscomp$14$$) && $JSCompiler_StaticMethods_calculate_$$($$jscomp$this$jscomp$14$$, $$jscomp$this$jscomp$14$$.$triggerId_$);
  }));
  this.$unlisteners_$.push($listen$$module$src$event_helper$$($element$jscomp$91$$, "ended", function() {
    $JSCompiler_StaticMethods_hasDuration_$$($$jscomp$this$jscomp$14$$) && $JSCompiler_StaticMethods_maybeTrigger_$$($$jscomp$this$jscomp$14$$, 100);
  }));
};
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.stop = function() {
  if (this.$unlisteners_$) {
    for (; 0 < this.$unlisteners_$.length;) {
      this.$unlisteners_$.pop()();
    }
    this.$triggerId_$++;
  }
};
function $JSCompiler_StaticMethods_hasDuration_$$($JSCompiler_StaticMethods_hasDuration_$self$$) {
  var $video$jscomp$18$$ = $JSCompiler_StaticMethods_hasDuration_$self$$.$entry_$.video, $duration$jscomp$3$$ = $video$jscomp$18$$.getDuration();
  if (!($duration$jscomp$3$$ && !isNaN($duration$jscomp$3$$) && 1 < $duration$jscomp$3$$)) {
    return !1;
  }
  250 > 50 * $duration$jscomp$3$$ && $JSCompiler_StaticMethods_hasDuration_$self$$.$warnForTesting_$("This video is too short for `video-percentage-played`. Reports may be innacurate. For best results, use videos over", 5, "seconds long.", $video$jscomp$18$$.element);
  return !0;
}
$AnalyticsPercentageTracker$$module$src$service$video_manager_impl$$.prototype.$warnForTesting_$ = function($args$jscomp$3$$) {
  for (var $$jscomp$restParams$jscomp$1$$ = [], $$jscomp$restIndex$jscomp$1$$ = 0; $$jscomp$restIndex$jscomp$1$$ < arguments.length; ++$$jscomp$restIndex$jscomp$1$$) {
    $$jscomp$restParams$jscomp$1$$[$$jscomp$restIndex$jscomp$1$$ - 0] = arguments[$$jscomp$restIndex$jscomp$1$$];
  }
  $user$$module$src$log$$().warn.apply($user$$module$src$log$$(), ["video-manager"].concat($$jscomp$restParams$jscomp$1$$));
};
function $JSCompiler_StaticMethods_calculate_$$($JSCompiler_StaticMethods_calculate_$self$$, $triggerId$$) {
  if ($triggerId$$ == $JSCompiler_StaticMethods_calculate_$self$$.$triggerId_$) {
    var $duration$jscomp$4_entry$jscomp$12$$ = $JSCompiler_StaticMethods_calculate_$self$$.$entry_$, $timer$$ = $JSCompiler_StaticMethods_calculate_$self$$.$timer_$, $video$jscomp$19$$ = $duration$jscomp$4_entry$jscomp$12$$.video, $calculateAgain$$ = function() {
      return $JSCompiler_StaticMethods_calculate_$$($JSCompiler_StaticMethods_calculate_$self$$, $triggerId$$);
    };
    if ("paused" == $duration$jscomp$4_entry$jscomp$12$$.getPlayingState()) {
      $timer$$.delay($calculateAgain$$, 500);
    } else {
      if (($duration$jscomp$4_entry$jscomp$12$$ = $video$jscomp$19$$.getDuration()) && !isNaN($duration$jscomp$4_entry$jscomp$12$$) && 1 < $duration$jscomp$4_entry$jscomp$12$$) {
        var $frequencyMs$$ = Math.min(Math.max(50 * $duration$jscomp$4_entry$jscomp$12$$, 250), 4000), $percentage$$ = $video$jscomp$19$$.getCurrentTime() / $duration$jscomp$4_entry$jscomp$12$$ * 100, $normalizedPercentage$$ = 5 * Math.floor($percentage$$ / 5);
        $isFiniteNumber$$module$src$types$$($normalizedPercentage$$);
        $JSCompiler_StaticMethods_maybeTrigger_$$($JSCompiler_StaticMethods_calculate_$self$$, $normalizedPercentage$$);
        $timer$$.delay($calculateAgain$$, $frequencyMs$$);
      } else {
        $timer$$.delay($calculateAgain$$, 500);
      }
    }
  }
}
function $JSCompiler_StaticMethods_maybeTrigger_$$($JSCompiler_StaticMethods_maybeTrigger_$self$$, $normalizedPercentage$jscomp$1$$) {
  0 >= $normalizedPercentage$jscomp$1$$ || $JSCompiler_StaticMethods_maybeTrigger_$self$$.$last_$ == $normalizedPercentage$jscomp$1$$ || ($JSCompiler_StaticMethods_maybeTrigger_$self$$.$last_$ = $normalizedPercentage$jscomp$1$$, $analyticsEvent$$module$src$service$video_manager_impl$$($JSCompiler_StaticMethods_maybeTrigger_$self$$.$entry_$, "video-percentage-played", {normalizedPercentage:$normalizedPercentage$jscomp$1$$.toString()}));
}
function $analyticsEvent$$module$src$service$video_manager_impl$$($entry$jscomp$13$$, $eventType$jscomp$9$$, $opt_vars$$) {
  var $video$jscomp$20$$ = $entry$jscomp$13$$.video;
  $entry$jscomp$13$$.getAnalyticsDetails().then(function($entry$jscomp$13$$) {
    $opt_vars$$ && Object.assign($entry$jscomp$13$$, $opt_vars$$);
    $video$jscomp$20$$.element.dispatchCustomEvent($eventType$jscomp$9$$, $entry$jscomp$13$$);
  });
}
;var $_template$$module$extensions$amp_youtube$0_1$amp_youtube$$ = ["<img placeholder referrerpolicy=origin>"];
function $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$($$jscomp$super$this_element$jscomp$95$$) {
  $$jscomp$super$this_element$jscomp$95$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$95$$) || this;
  $$jscomp$super$this_element$jscomp$95$$.$videoid_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$liveChannelid_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$muted_$ = !1;
  $$jscomp$super$this_element$jscomp$95$$.$isLoop_$ = !1;
  $$jscomp$super$this_element$jscomp$95$$.$isPlaylist_$ = !1;
  $$jscomp$super$this_element$jscomp$95$$.$iframe_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$info_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$videoIframeSrc_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$unlistenMessage_$ = null;
  $$jscomp$super$this_element$jscomp$95$$.$unlistenLooping_$ = null;
  return $$jscomp$super$this_element$jscomp$95$$;
}
var $JSCompiler_parentCtor$jscomp$inline_141$$ = AMP.BaseElement;
$AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_141$$.prototype);
$AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$.prototype.constructor = $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$, $JSCompiler_parentCtor$jscomp$inline_141$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_142$$ in $JSCompiler_parentCtor$jscomp$inline_141$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_142$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_143$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_141$$, $JSCompiler_p$jscomp$inline_142$$);
        $JSCompiler_descriptor$jscomp$inline_143$$ && Object.defineProperty($AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$, $JSCompiler_p$jscomp$inline_142$$, $JSCompiler_descriptor$jscomp$inline_143$$);
      } else {
        $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$[$JSCompiler_p$jscomp$inline_142$$] = $JSCompiler_parentCtor$jscomp$inline_141$$[$JSCompiler_p$jscomp$inline_142$$];
      }
    }
  }
}
$AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_141$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$.prototype;
$JSCompiler_prototypeAlias$$.preconnectCallback = function($opt_onLayout$$) {
  var $preconnect$$ = $getService$$module$src$service$$(this.win, "preconnect"), $ampdoc$jscomp$17$$ = this.getAmpDoc();
  $preconnect$$.url($ampdoc$jscomp$17$$, $JSCompiler_StaticMethods_getVideoIframeSrc_$$(this));
  $preconnect$$.url($ampdoc$jscomp$17$$, "https://s.ytimg.com", $opt_onLayout$$);
  $preconnect$$.url($ampdoc$jscomp$17$$, "https://i.ytimg.com", $opt_onLayout$$);
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.renderOutsideViewport = function() {
  return 0.75;
};
$JSCompiler_prototypeAlias$$.viewportCallback = function($visible$$) {
  this.element.dispatchCustomEvent("amp:video:visibility", {visible:$visible$$});
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  this.$videoid_$ = this.element.getAttribute("data-videoid");
  this.$liveChannelid_$ = this.element.getAttribute("data-live-channelid");
  $JSCompiler_StaticMethods_assertDatasourceExists_$$(this);
  var $JSCompiler_ampdoc$jscomp$inline_240_deferred$jscomp$2$$ = new $Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $JSCompiler_ampdoc$jscomp$inline_240_deferred$jscomp$2$$.promise;
  this.$playerReadyResolver_$ = $JSCompiler_ampdoc$jscomp$inline_240_deferred$jscomp$2$$.resolve;
  !this.getPlaceholder() && this.$videoid_$ && $JSCompiler_StaticMethods_buildImagePlaceholder_$$(this);
  $JSCompiler_ampdoc$jscomp$inline_240_deferred$jscomp$2$$ = $getAmpdoc$$module$src$service$$(this.element);
  var $JSCompiler_holder$jscomp$inline_241$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_240_deferred$jscomp$2$$), $JSCompiler_services$jscomp$inline_292$$ = $getServices$$module$src$service$$($JSCompiler_holder$jscomp$inline_241$$), $JSCompiler_s$jscomp$inline_293$$ = $JSCompiler_services$jscomp$inline_292$$["video-manager"];
  $JSCompiler_s$jscomp$inline_293$$ || ($JSCompiler_s$jscomp$inline_293$$ = $JSCompiler_services$jscomp$inline_292$$["video-manager"] = {obj:null, promise:null, resolve:null, reject:null, context:null, ctor:null});
  $JSCompiler_s$jscomp$inline_293$$.ctor || $JSCompiler_s$jscomp$inline_293$$.obj || ($JSCompiler_s$jscomp$inline_293$$.ctor = $VideoManager$$module$src$service$video_manager_impl$$, $JSCompiler_s$jscomp$inline_293$$.context = $JSCompiler_ampdoc$jscomp$inline_240_deferred$jscomp$2$$, $JSCompiler_s$jscomp$inline_293$$.resolve && $getServiceInternal$$module$src$service$$($JSCompiler_holder$jscomp$inline_241$$, "video-manager"));
};
function $JSCompiler_StaticMethods_getVideoIframeSrc_$$($JSCompiler_StaticMethods_getVideoIframeSrc_$self$$) {
  if ($JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$videoIframeSrc_$) {
    return $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$videoIframeSrc_$;
  }
  $JSCompiler_StaticMethods_assertDatasourceExists_$$($JSCompiler_StaticMethods_getVideoIframeSrc_$self$$);
  var $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ = "";
  "omit" === ($JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.element.getAttribute("credentials") || "include") && ($JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ = "-nocookie");
  $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ = "https://www.youtube" + $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ + ".com/embed/";
  var $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$ = $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$videoid_$ ? encodeURIComponent($JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$videoid_$ || "") + "?" : "live_stream?channel=" + (encodeURIComponent($JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$liveChannelid_$ || "") + "&");
  $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$ = "" + $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ + $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$ + "enablejsapi=1&amp=1";
  var $JSCompiler_s$jscomp$inline_244_element$jscomp$96$$ = $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.element;
  $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ = $getDataParamsFromAttributes$$module$src$dom$$($JSCompiler_s$jscomp$inline_244_element$jscomp$96$$);
  "autoplay" in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ && (delete $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$.autoplay, $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.user().error("AMP-YOUTUBE", "Use autoplay attribute instead of data-param-autoplay"));
  "playsinline" in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ || ($JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$.playsinline = "1");
  $JSCompiler_s$jscomp$inline_244_element$jscomp$96$$.hasAttribute("autoplay") && ("iv_load_policy" in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ || ($JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$.iv_load_policy = "3"), $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$.playsinline = 
  "1");
  "loop" in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ && $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.user().warn("AMP-YOUTUBE", "Use loop attribute instead of the deprecated data-param-loop");
  $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$isLoop_$ = $JSCompiler_s$jscomp$inline_244_element$jscomp$96$$.hasAttribute("loop") || "loop" in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ && "1" == $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$.loop;
  $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$isPlaylist_$ = "playlist" in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$;
  $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$isLoop_$ && ($JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$isPlaylist_$ ? $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$.loop = "1" : "loop" in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ && delete $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$.loop);
  $JSCompiler_s$jscomp$inline_244_element$jscomp$96$$ = [];
  for ($JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$ in $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$) {
    var $JSCompiler_v$jscomp$inline_246_sv$4$jscomp$inline_249$$ = $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$[$JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$];
    if (null != $JSCompiler_v$jscomp$inline_246_sv$4$jscomp$inline_249$$) {
      if (Array.isArray($JSCompiler_v$jscomp$inline_246_sv$4$jscomp$inline_249$$)) {
        for (var $JSCompiler_i$jscomp$inline_247$$ = 0; $JSCompiler_i$jscomp$inline_247$$ < $JSCompiler_v$jscomp$inline_246_sv$4$jscomp$inline_249$$.length; $JSCompiler_i$jscomp$inline_247$$++) {
          var $JSCompiler_sv$jscomp$inline_248$$ = $JSCompiler_v$jscomp$inline_246_sv$4$jscomp$inline_249$$[$JSCompiler_i$jscomp$inline_247$$];
          $JSCompiler_s$jscomp$inline_244_element$jscomp$96$$.push(encodeURIComponent($JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$) + "=" + encodeURIComponent($JSCompiler_sv$jscomp$inline_248$$));
        }
      } else {
        $JSCompiler_s$jscomp$inline_244_element$jscomp$96$$.push(encodeURIComponent($JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$) + "=" + encodeURIComponent($JSCompiler_v$jscomp$inline_246_sv$4$jscomp$inline_249$$));
      }
    }
  }
  var $JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$ = $JSCompiler_s$jscomp$inline_244_element$jscomp$96$$.join("&");
  $JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$ && ($JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$ = $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$.split("#", 2), $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$ = 
  $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$[0].split("?", 2), $JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$ = $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$[0] + ($JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$[1] ? 
  "?" + $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$[1] + "&" + $JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$ : "?" + $JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$), $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$ = 
  $JSCompiler_inline_result$jscomp$177_JSCompiler_k$jscomp$inline_245_JSCompiler_newUrl$jscomp$inline_255$$ += $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$[1] ? "#" + $JSCompiler_baseUrl$jscomp$inline_149_JSCompiler_mainAndFragment$jscomp$inline_253_JSCompiler_urlSuffix$jscomp$inline_148_params$jscomp$7$$[1] : "");
  return $JSCompiler_StaticMethods_getVideoIframeSrc_$self$$.$videoIframeSrc_$ = $JSCompiler_descriptor$jscomp$inline_150_JSCompiler_mainAndQuery$jscomp$inline_254_JSCompiler_temp_const$jscomp$176_src$jscomp$6$$;
}
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$16$$ = this, $iframe$jscomp$2$$ = $createFrameFor$$module$src$iframe_video$$(this, $JSCompiler_StaticMethods_getVideoIframeSrc_$$(this));
  $addUnsafeAllowAutoplay$$module$src$iframe_video$$($iframe$jscomp$2$$);
  this.$iframe_$ = $iframe$jscomp$2$$;
  $getServiceForDoc$$module$src$service$$(this.element, "video-manager").register(this);
  this.$unlistenMessage_$ = $listen$$module$src$event_helper$$(this.win, "message", this.$handleYoutubeMessage_$.bind(this));
  this.$isLoop_$ && !this.$isPlaylist_$ && (this.$unlistenLooping_$ = $listen$$module$src$event_helper$$(this.element, "ended", function() {
    return $$jscomp$this$jscomp$16$$.play(!1);
  }));
  var $loaded$$ = this.loadPromise(this.$iframe_$).then(function() {
    return $getService$$module$src$service$$($$jscomp$this$jscomp$16$$.win, "timer").promise(300);
  }).then(function() {
    $$jscomp$this$jscomp$16$$.$iframe_$ && $$jscomp$this$jscomp$16$$.$iframe_$.contentWindow.postMessage(JSON.stringify($dict$$module$src$utils$object$$({event:"listening"})), "*");
    $$jscomp$this$jscomp$16$$.element.dispatchCustomEvent("load");
  });
  this.$playerReadyResolver_$($loaded$$);
  return $loaded$$;
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  this.$iframe_$ && ($removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  this.$unlistenLooping_$ && this.$unlistenLooping_$();
  var $deferred$jscomp$3$$ = new $Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$3$$.promise;
  this.$playerReadyResolver_$ = $deferred$jscomp$3$$.resolve;
  return !0;
};
$JSCompiler_prototypeAlias$$.pauseCallback = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.pause();
};
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$$) {
  null != $mutations$$["data-videoid"] && (this.$videoid_$ = this.element.getAttribute("data-videoid"), this.$iframe_$ && $JSCompiler_StaticMethods_sendCommand_$$(this, "loadVideoById", [this.$videoid_$]));
};
function $JSCompiler_StaticMethods_assertDatasourceExists_$$($JSCompiler_StaticMethods_assertDatasourceExists_$self$$) {
  $userAssert$$module$src$log$$(!($JSCompiler_StaticMethods_assertDatasourceExists_$self$$.$videoid_$ && $JSCompiler_StaticMethods_assertDatasourceExists_$self$$.$liveChannelid_$) && ($JSCompiler_StaticMethods_assertDatasourceExists_$self$$.$videoid_$ || $JSCompiler_StaticMethods_assertDatasourceExists_$self$$.$liveChannelid_$), "Exactly one of data-videoid or data-live-channelid should be present for <amp-youtube> %s", $JSCompiler_StaticMethods_assertDatasourceExists_$self$$.element);
}
function $JSCompiler_StaticMethods_sendCommand_$$($JSCompiler_StaticMethods_sendCommand_$self$$, $command$$, $opt_args$jscomp$1$$) {
  $JSCompiler_StaticMethods_sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    if ($JSCompiler_StaticMethods_sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_sendCommand_$self$$.$iframe_$.contentWindow) {
      var $message$jscomp$36$$ = JSON.stringify($dict$$module$src$utils$object$$({event:"command", func:$command$$, args:$opt_args$jscomp$1$$ || ""}));
      $JSCompiler_StaticMethods_sendCommand_$self$$.$iframe_$.contentWindow.postMessage($message$jscomp$36$$, "*");
    }
  });
}
$JSCompiler_prototypeAlias$$.$handleYoutubeMessage_$ = function($$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$) {
  var $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$ = this.$iframe_$;
  if ($JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$ && $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$.source == $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$.contentWindow && "https://www.youtube.com" == $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$.origin) {
    var $eventData$$ = $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$.data;
    if ($eventData$$ && ($isObject$$module$src$types$$($eventData$$) || $startsWith$$module$src$string$$($eventData$$, "{")) && ($JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$ = $isObject$$module$src$types$$($eventData$$) ? $eventData$$ : $tryParseJson$$module$src$json$$($eventData$$), null != $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$)) {
      $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$ = $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$.event;
      var $info$jscomp$1$$ = $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$.info || {};
      $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$ = this.element;
      var $playerState$$ = $info$jscomp$1$$.playerState;
      if ("infoDelivery" == $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$ && null != $playerState$$) {
        $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$ = {}, $redispatch$$module$src$iframe_video$$($JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$, $playerState$$.toString(), ($$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$[1] = "playing", $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$[2] = "pause", $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$[0] = ["ended", "pause"], $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$));
      } else {
        var $muted$$ = $info$jscomp$1$$.muted;
        "infoDelivery" == $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$ && $info$jscomp$1$$ && null != $muted$$ ? this.$muted_$ != $muted$$ && (this.$muted_$ = $muted$$, $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$.dispatchCustomEvent(this.$muted_$ ? "muted" : "unmuted")) : "initialDelivery" == $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$ ? (this.$info_$ = $info$jscomp$1$$, $JSCompiler_iframe$jscomp$inline_155_JSCompiler_inline_result$jscomp$35_element$jscomp$97$$.dispatchCustomEvent("loadedmetadata")) : 
        "infoDelivery" == $$jscomp$compprop1_event$jscomp$13_eventType$jscomp$10$$ && void 0 !== $info$jscomp$1$$.currentTime && (this.$info_$.currentTime = $info$jscomp$1$$.currentTime);
      }
    }
  }
};
function $JSCompiler_StaticMethods_buildImagePlaceholder_$$($JSCompiler_StaticMethods_buildImagePlaceholder_$self$$) {
  var $el$jscomp$11$$ = $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.element, $imgPlaceholder$$ = $htmlFor$$module$src$static_template$$($el$jscomp$11$$)($_template$$module$extensions$amp_youtube$0_1$amp_youtube$$), $videoid$$ = $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.$videoid_$;
  $setStyles$$module$src$style$$($imgPlaceholder$$, {"object-fit":"cover", visibility:"hidden"});
  $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.propagateAttributes(["aria-label"], $imgPlaceholder$$);
  $imgPlaceholder$$.src = "https://i.ytimg.com/vi/" + encodeURIComponent($videoid$$) + "/sddefault.jpg#404_is_fine";
  $imgPlaceholder$$.hasAttribute("aria-label") ? $imgPlaceholder$$.setAttribute("alt", "Loading video - " + $imgPlaceholder$$.getAttribute("aria-label")) : $imgPlaceholder$$.setAttribute("alt", "Loading video");
  $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.applyFillContent($imgPlaceholder$$);
  $el$jscomp$11$$.appendChild($imgPlaceholder$$);
  $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.loadPromise($imgPlaceholder$$).then(function() {
    if (120 == $imgPlaceholder$$.naturalWidth && 90 == $imgPlaceholder$$.naturalHeight) {
      throw Error("sddefault.jpg is not found");
    }
  }).catch(function() {
    $imgPlaceholder$$.src = "https://i.ytimg.com/vi/" + encodeURIComponent($videoid$$) + "/hqdefault.jpg";
    return $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.loadPromise($imgPlaceholder$$);
  }).then(function() {
    $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.getVsync().mutate(function() {
      $setStyles$$module$src$style$$($imgPlaceholder$$, {visibility:""});
    });
  });
}
$JSCompiler_prototypeAlias$$.supportsPlatform = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.isInteractive = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_sendCommand_$$(this, "playVideo");
};
$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_sendCommand_$$(this, "pauseVideo");
};
$JSCompiler_prototypeAlias$$.mute = function() {
  $JSCompiler_StaticMethods_sendCommand_$$(this, "mute");
};
$JSCompiler_prototypeAlias$$.unmute = function() {
  $JSCompiler_StaticMethods_sendCommand_$$(this, "unMute");
};
$JSCompiler_prototypeAlias$$.showControls = function() {
};
$JSCompiler_prototypeAlias$$.hideControls = function() {
};
$JSCompiler_prototypeAlias$$.fullscreenEnter = function() {
  if (this.$iframe_$) {
    var $JSCompiler_element$jscomp$inline_162$$ = this.$iframe_$, $JSCompiler_requestFs$jscomp$inline_163$$ = $JSCompiler_element$jscomp$inline_162$$.requestFullscreen || $JSCompiler_element$jscomp$inline_162$$.requestFullScreen || $JSCompiler_element$jscomp$inline_162$$.webkitRequestFullscreen || $JSCompiler_element$jscomp$inline_162$$.webkitEnterFullscreen || $JSCompiler_element$jscomp$inline_162$$.msRequestFullscreen || $JSCompiler_element$jscomp$inline_162$$.mozRequestFullScreen;
    $JSCompiler_requestFs$jscomp$inline_163$$ && $JSCompiler_requestFs$jscomp$inline_163$$.call($JSCompiler_element$jscomp$inline_162$$);
  }
};
$JSCompiler_prototypeAlias$$.fullscreenExit = function() {
  if (this.$iframe_$) {
    var $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$ = this.$iframe_$, $JSCompiler_docBoundExit$jscomp$inline_168_JSCompiler_elementBoundExit$jscomp$inline_166$$ = $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.cancelFullScreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.exitFullscreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.webkitExitFullscreen || 
    $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.webkitCancelFullScreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.mozCancelFullScreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.msExitFullscreen;
    $JSCompiler_docBoundExit$jscomp$inline_168_JSCompiler_elementBoundExit$jscomp$inline_166$$ ? $JSCompiler_docBoundExit$jscomp$inline_168_JSCompiler_elementBoundExit$jscomp$inline_166$$.call($JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$) : ($JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$ = $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.ownerDocument) && ($JSCompiler_docBoundExit$jscomp$inline_168_JSCompiler_elementBoundExit$jscomp$inline_166$$ = 
    $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.cancelFullScreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.exitFullscreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.webkitExitFullscreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.webkitCancelFullScreen || $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.mozCancelFullScreen || 
    $JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$.msExitFullscreen) && $JSCompiler_docBoundExit$jscomp$inline_168_JSCompiler_elementBoundExit$jscomp$inline_166$$.call($JSCompiler_element$jscomp$inline_165_JSCompiler_ownerDocument$jscomp$inline_167$$);
  }
};
$JSCompiler_prototypeAlias$$.isFullscreen = function() {
  if (this.$iframe_$) {
    var $JSCompiler_element$jscomp$inline_170_JSCompiler_temp$jscomp$31$$ = this.$iframe_$;
    var $JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$ = $JSCompiler_element$jscomp$inline_170_JSCompiler_temp$jscomp$31$$.webkitDisplayingFullscreen;
    $JSCompiler_element$jscomp$inline_170_JSCompiler_temp$jscomp$31$$ = void 0 !== $JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$ ? $JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$ : ($JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$ = $JSCompiler_element$jscomp$inline_170_JSCompiler_temp$jscomp$31$$.ownerDocument) ? ($JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$.fullscreenElement || 
    $JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$.webkitFullscreenElement || $JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$.mozFullScreenElement || $JSCompiler_ownerDocument$jscomp$inline_172_JSCompiler_webkitDisplayingFullscreen$jscomp$inline_171$$.webkitCurrentFullScreenElement) == $JSCompiler_element$jscomp$inline_170_JSCompiler_temp$jscomp$31$$ : !1;
  } else {
    $JSCompiler_element$jscomp$inline_170_JSCompiler_temp$jscomp$31$$ = !1;
  }
  return $JSCompiler_element$jscomp$inline_170_JSCompiler_temp$jscomp$31$$;
};
$JSCompiler_prototypeAlias$$.getMetadata = function() {
};
$JSCompiler_prototypeAlias$$.preimplementsMediaSessionAPI = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.preimplementsAutoFullscreen = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.getCurrentTime = function() {
  return this.$info_$ ? this.$info_$.currentTime : NaN;
};
$JSCompiler_prototypeAlias$$.getDuration = function() {
  return this.$info_$ ? this.$info_$.duration : NaN;
};
$JSCompiler_prototypeAlias$$.getPlayedRanges = function() {
  return [];
};
$JSCompiler_prototypeAlias$$.seekTo = function() {
  this.user().error("amp-youtube", "`seekTo` not supported.");
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-youtube", $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-youtube-0.1.js.map
