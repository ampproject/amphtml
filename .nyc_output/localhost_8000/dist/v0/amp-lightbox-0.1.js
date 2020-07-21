(self.AMP=self.AMP||[]).push({n:"amp-lightbox",v:"2007210308000",f:(function(AMP,_){
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
var $JSCompiler_temp$jscomp$21$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$21$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$22$$;
  a: {
    var $JSCompiler_x$jscomp$inline_42$$ = {a:!0}, $JSCompiler_y$jscomp$inline_43$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_43$$.__proto__ = $JSCompiler_x$jscomp$inline_42$$;
      $JSCompiler_inline_result$jscomp$22$$ = $JSCompiler_y$jscomp$inline_43$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_44$$) {
    }
    $JSCompiler_inline_result$jscomp$22$$ = !1;
  }
  $JSCompiler_temp$jscomp$21$$ = $JSCompiler_inline_result$jscomp$22$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$21$$;
function $$jscomp$inherits$$($childCtor$$, $parentCtor$$) {
  $childCtor$$.prototype = $$jscomp$objectCreate$$($parentCtor$$.prototype);
  $childCtor$$.prototype.constructor = $childCtor$$;
  if ($$jscomp$setPrototypeOf$$) {
    $$jscomp$setPrototypeOf$$($childCtor$$, $parentCtor$$);
  } else {
    for (var $p$$ in $parentCtor$$) {
      if ("prototype" != $p$$) {
        if (Object.defineProperties) {
          var $descriptor$jscomp$2$$ = Object.getOwnPropertyDescriptor($parentCtor$$, $p$$);
          $descriptor$jscomp$2$$ && Object.defineProperty($childCtor$$, $p$$, $descriptor$jscomp$2$$);
        } else {
          $childCtor$$[$p$$] = $parentCtor$$[$p$$];
        }
      }
    }
  }
  $childCtor$$.$superClass_$ = $parentCtor$$.prototype;
}
var $resolved$$module$src$resolved_promise$$;
function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$) {
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
    var $name$jscomp$71$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$88$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2].replace(/\+/g, " "), $match$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$71$$] = $value$jscomp$88$$;
  }
  return $params$jscomp$1$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
function $getMode$$module$src$mode$$($opt_win$$) {
  var $win$$ = $opt_win$$ || self;
  if ($win$$.__AMP_MODE) {
    var $JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$ = $win$$.__AMP_MODE;
  } else {
    $JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.originalHash || $win$$.location.hash);
    var $JSCompiler_searchQuery$jscomp$inline_48$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $win$$.AMP_CONFIG && $win$$.AMP_CONFIG.v ? $win$$.AMP_CONFIG.v : "012007210308000");
    $JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$ = {localDev:!1, development:!!(0 <= ["1", "actions", "amp", "amp4ads", "amp4email"].indexOf($JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$.development) || $win$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$.development, esm:!1, geoOverride:$JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$["amp-geo"], 
    minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_48$$.amp_lite, test:!1, log:$JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$.log, version:"2007210308000", rtvVersion:$rtvVersion$$module$src$mode$$};
    $JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$ = $win$$.__AMP_MODE = $JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$;
  }
  return $JSCompiler_hashQuery$jscomp$inline_47_JSCompiler_inline_result$jscomp$25_JSCompiler_temp$jscomp$24$$;
}
;function $toArray$$module$src$types$$($arrayLike$jscomp$1$$) {
  return $arrayLike$jscomp$1$$ ? Array.prototype.slice.call($arrayLike$jscomp$1$$) : [];
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
function $dev$$module$src$log$$() {
  if ($logs$$module$src$log$$.dev) {
    return $logs$$module$src$log$$.dev;
  }
  throw Error("failed to call initLogConstructor");
}
;function $Deferred$$module$src$utils$promise$$() {
  var $resolve$$, $reject$$;
  this.promise = new Promise(function($res$$, $rej$$) {
    $resolve$$ = $res$$;
    $reject$$ = $rej$$;
  });
  this.resolve = $resolve$$;
  this.reject = $reject$$;
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
$JSCompiler_prototypeAlias$$.remove = function($handler$jscomp$4_index$jscomp$74$$) {
  this.$handlers_$ && ($handler$jscomp$4_index$jscomp$74$$ = this.$handlers_$.indexOf($handler$jscomp$4_index$jscomp$74$$), -1 < $handler$jscomp$4_index$jscomp$74$$ && this.$handlers_$.splice($handler$jscomp$4_index$jscomp$74$$, 1));
};
$JSCompiler_prototypeAlias$$.removeAll = function() {
  this.$handlers_$ && (this.$handlers_$.length = 0);
};
$JSCompiler_prototypeAlias$$.fire = function($opt_event$$) {
  if (this.$handlers_$) {
    for (var $handlers$$ = this.$handlers_$, $i$jscomp$11$$ = 0; $i$jscomp$11$$ < $handlers$$.length; $i$jscomp$11$$++) {
      (0,$handlers$$[$i$jscomp$11$$])($opt_event$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.getHandlerCount = function() {
  return this.$handlers_$ ? this.$handlers_$.length : 0;
};
var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $experimentToggles$$module$src$experiments$$($params$jscomp$5_win$jscomp$12$$) {
  if ($params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $params$jscomp$5_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$3_experimentId$jscomp$2_i$jscomp$16$$ in $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG[$allowed$3_experimentId$jscomp$2_i$jscomp$16$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$16$$] = Math.random() < $frequency$$);
    }
  }
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $params$jscomp$5_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$3_experimentId$jscomp$2_i$jscomp$16$$ = 0; $allowed$3_experimentId$jscomp$2_i$jscomp$16$$ < $optedInExperiments$$.length; $allowed$3_experimentId$jscomp$2_i$jscomp$16$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$16$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$16$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($params$jscomp$5_win$jscomp$12$$));
  if ($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$3_experimentId$jscomp$2_i$jscomp$16$$ = $params$jscomp$5_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    $params$jscomp$5_win$jscomp$12$$ = $parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$5_win$jscomp$12$$.location.originalHash || $params$jscomp$5_win$jscomp$12$$.location.hash);
    for (var $i$4$$ = 0; $i$4$$ < $allowed$3_experimentId$jscomp$2_i$jscomp$16$$.length; $i$4$$++) {
      var $param$jscomp$6$$ = $params$jscomp$5_win$jscomp$12$$["e-" + $allowed$3_experimentId$jscomp$2_i$jscomp$16$$[$i$4$$]];
      "1" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$16$$[$i$4$$]] = !0);
      "0" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$16$$[$i$4$$]] = !1);
    }
  }
  return $toggles$jscomp$2$$;
}
function $getExperimentToggles$$module$src$experiments$$($toggles$jscomp$3_win$jscomp$14$$) {
  var $experimentsString$$ = "";
  try {
    "localStorage" in $toggles$jscomp$3_win$jscomp$14$$ && ($experimentsString$$ = $toggles$jscomp$3_win$jscomp$14$$.localStorage.getItem("amp-experiment-toggles"));
  } catch ($e$jscomp$11$$) {
    $dev$$module$src$log$$().warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
  }
  var $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
  $toggles$jscomp$3_win$jscomp$14$$ = Object.create(null);
  for (var $i$jscomp$17$$ = 0; $i$jscomp$17$$ < $tokens$$.length; $i$jscomp$17$$++) {
    0 != $tokens$$[$i$jscomp$17$$].length && ("-" == $tokens$$[$i$jscomp$17$$][0] ? $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$17$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$17$$]] = !0);
  }
  return $toggles$jscomp$3_win$jscomp$14$$;
}
;var $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$ = [{experimentId:"ampdoc-fie", isTrafficEligible:function() {
  return !0;
}, branches:["21065001", "21065002"]}];
function $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$) {
  var $win$jscomp$23$$ = $JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$.ownerDocument.defaultView, $topWin$$ = $win$jscomp$23$$.__AMP_TOP || ($win$jscomp$23$$.__AMP_TOP = $win$jscomp$23$$), $isEmbed$$ = $win$jscomp$23$$ != $topWin$$, $JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$;
  if ($experimentToggles$$module$src$experiments$$($topWin$$)["ampdoc-fie"]) {
    $topWin$$.__AMP_EXPERIMENT_BRANCHES = $topWin$$.__AMP_EXPERIMENT_BRANCHES || {};
    for ($JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$ = 0; $JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$++) {
      var $JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$], $JSCompiler_experimentName$jscomp$inline_163$$ = $JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($topWin$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_163$$) || ($JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$.isTrafficEligible($topWin$$) ? !$topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_163$$] && $experimentToggles$$module$src$experiments$$($topWin$$)[$JSCompiler_experimentName$jscomp$inline_163$$] && 
      ($JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$ = $JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$.branches, $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_163$$] = $JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_176_JSCompiler_experiment$jscomp$inline_162$$.length)] || null) : $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_163$$] = 
      null);
    }
    $JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$ = "21065002" === ($topWin$$.__AMP_EXPERIMENT_BRANCHES ? $topWin$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$ = !1;
  }
  var $ampdocFieExperimentOn$$ = $JSCompiler_i$jscomp$inline_161_JSCompiler_inline_result$jscomp$131$$;
  $isEmbed$$ && !$ampdocFieExperimentOn$$ ? $JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$ = $isServiceRegistered$$module$src$service$$($win$jscomp$23$$, "action") ? $getServiceInternal$$module$src$service$$($win$jscomp$23$$, "action") : null : ($JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$), 
  $JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$), $JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$, 
  "action") ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$, "action") : null);
  return $JSCompiler_ampdoc$jscomp$inline_142_JSCompiler_holder$jscomp$inline_143_JSCompiler_temp$jscomp$132_element$jscomp$13$$;
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
  var $JSCompiler_services$jscomp$inline_54$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_54$$ || ($JSCompiler_services$jscomp$inline_54$$ = $holder$jscomp$4_s$jscomp$9$$.__AMP_SERVICES = {});
  $holder$jscomp$4_s$jscomp$9$$ = $JSCompiler_services$jscomp$inline_54$$[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$9$$.obj || ($holder$jscomp$4_s$jscomp$9$$.obj = new $holder$jscomp$4_s$jscomp$9$$.ctor($holder$jscomp$4_s$jscomp$9$$.context), $holder$jscomp$4_s$jscomp$9$$.ctor = null, $holder$jscomp$4_s$jscomp$9$$.context = null, $holder$jscomp$4_s$jscomp$9$$.resolve && $holder$jscomp$4_s$jscomp$9$$.resolve($holder$jscomp$4_s$jscomp$9$$.obj));
  return $holder$jscomp$4_s$jscomp$9$$.obj;
}
function $isServiceRegistered$$module$src$service$$($holder$jscomp$12_service$jscomp$5$$, $id$jscomp$30$$) {
  $holder$jscomp$12_service$jscomp$5$$ = $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES && $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES[$id$jscomp$30$$];
  return !(!$holder$jscomp$12_service$jscomp$5$$ || !$holder$jscomp$12_service$jscomp$5$$.ctor && !$holder$jscomp$12_service$jscomp$5$$.obj);
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $closest$$module$src$dom$$($el$jscomp$2_element$jscomp$20$$, $callback$jscomp$53$$) {
  for (; $el$jscomp$2_element$jscomp$20$$ && void 0 !== $el$jscomp$2_element$jscomp$20$$; $el$jscomp$2_element$jscomp$20$$ = $el$jscomp$2_element$jscomp$20$$.parentElement) {
    if ($callback$jscomp$53$$($el$jscomp$2_element$jscomp$20$$)) {
      return $el$jscomp$2_element$jscomp$20$$;
    }
  }
  return null;
}
function $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$21$$) {
  return $element$jscomp$21$$.closest ? $element$jscomp$21$$.closest(".i-amphtml-fie") : $closest$$module$src$dom$$($element$jscomp$21$$, function($element$jscomp$21$$) {
    var $el$jscomp$3$$ = $element$jscomp$21$$.matches || $element$jscomp$21$$.webkitMatchesSelector || $element$jscomp$21$$.mozMatchesSelector || $element$jscomp$21$$.msMatchesSelector || $element$jscomp$21$$.oMatchesSelector;
    return $el$jscomp$3$$ ? $el$jscomp$3$$.call($element$jscomp$21$$, ".i-amphtml-fie") : !1;
  });
}
function $tryFocus$$module$src$dom$$($element$jscomp$27$$) {
  try {
    $element$jscomp$27$$.focus();
  } catch ($e$jscomp$17$$) {
  }
}
;function $Services$$module$src$services$ownersForDoc$$($elementOrAmpDoc$jscomp$10$$) {
  return $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$10$$, "owners");
}
;function $Pass$$module$src$pass$$($win$jscomp$54$$, $handler$jscomp$6$$) {
  var $$jscomp$this$jscomp$3$$ = this;
  this.$timer_$ = $getService$$module$src$service$$($win$jscomp$54$$, "timer");
  this.$handler_$ = $handler$jscomp$6$$;
  this.$defaultDelay_$ = 0;
  this.$scheduled_$ = -1;
  this.$nextTime_$ = 0;
  this.$running_$ = !1;
  this.$boundPass_$ = function() {
    $$jscomp$this$jscomp$3$$.$pass_$();
  };
}
$Pass$$module$src$pass$$.prototype.isPending = function() {
  return -1 != this.$scheduled_$;
};
$Pass$$module$src$pass$$.prototype.schedule = function($opt_delay$jscomp$2$$) {
  var $delay$$ = $opt_delay$jscomp$2$$ || this.$defaultDelay_$;
  this.$running_$ && 10 > $delay$$ && ($delay$$ = 10);
  var $nextTime$$ = Date.now() + $delay$$;
  return !this.isPending() || -10 > $nextTime$$ - this.$nextTime_$ ? (this.cancel(), this.$nextTime_$ = $nextTime$$, this.$scheduled_$ = this.$timer_$.delay(this.$boundPass_$, $delay$$), !0) : !1;
};
$Pass$$module$src$pass$$.prototype.$pass_$ = function() {
  this.$scheduled_$ = -1;
  this.$nextTime_$ = 0;
  this.$running_$ = !0;
  this.$handler_$();
  this.$running_$ = !1;
};
$Pass$$module$src$pass$$.prototype.cancel = function() {
  this.isPending() && (this.$timer_$.cancel(this.$scheduled_$), this.$scheduled_$ = -1);
};
function $findIndex$$module$src$utils$array$$($array$jscomp$10$$, $predicate$jscomp$1$$) {
  for (var $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $array$jscomp$10$$.length; $i$jscomp$23$$++) {
    if ($predicate$jscomp$1$$($array$jscomp$10$$[$i$jscomp$23$$], $i$jscomp$23$$, $array$jscomp$10$$)) {
      return $i$jscomp$23$$;
    }
  }
  return -1;
}
;var $passiveSupported$$module$src$event_helper_listen$$;
function $supportsPassiveEventListener$$module$src$event_helper_listen$$($win$jscomp$55$$) {
  if (void 0 !== $passiveSupported$$module$src$event_helper_listen$$) {
    return $passiveSupported$$module$src$event_helper_listen$$;
  }
  $passiveSupported$$module$src$event_helper_listen$$ = !1;
  try {
    var $options$jscomp$34$$ = {get passive() {
      $passiveSupported$$module$src$event_helper_listen$$ = !0;
      return !1;
    }};
    $win$jscomp$55$$.addEventListener("test-options", null, $options$jscomp$34$$);
    $win$jscomp$55$$.removeEventListener("test-options", null, $options$jscomp$34$$);
  } catch ($err$jscomp$4$$) {
  }
  return $passiveSupported$$module$src$event_helper_listen$$;
}
;function $Gesture$$module$src$gesture$$($type$jscomp$148$$, $data$jscomp$77$$, $time$jscomp$1$$, $event$jscomp$6$$) {
  this.type = $type$jscomp$148$$;
  this.data = $data$jscomp$77$$;
  this.time = $time$jscomp$1$$;
  this.event = $event$jscomp$6$$;
}
function $Gestures$$module$src$gesture$$($element$jscomp$63$$, $shouldNotPreventDefault$$, $shouldStopPropagation$$) {
  this.$element_$ = $element$jscomp$63$$;
  this.$recognizers_$ = [];
  this.$tracking_$ = [];
  this.$ready_$ = [];
  this.$pending_$ = [];
  this.$eventing_$ = null;
  this.$shouldNotPreventDefault_$ = $shouldNotPreventDefault$$;
  this.$shouldStopPropagation_$ = $shouldStopPropagation$$;
  this.$wasEventing_$ = !1;
  this.$pass_$ = new $Pass$$module$src$pass$$($element$jscomp$63$$.ownerDocument.defaultView, this.$doPass_$.bind(this));
  this.$pointerDownObservable_$ = new $Observable$$module$src$observable$$;
  this.$overservers_$ = Object.create(null);
  this.$boundOnTouchStart_$ = this.$onTouchStart_$.bind(this);
  this.$boundOnTouchEnd_$ = this.$onTouchEnd_$.bind(this);
  this.$boundOnTouchMove_$ = this.$onTouchMove_$.bind(this);
  this.$boundOnTouchCancel_$ = this.$onTouchCancel_$.bind(this);
  var $passiveSupported$$ = $supportsPassiveEventListener$$module$src$event_helper_listen$$($element$jscomp$63$$.ownerDocument.defaultView);
  this.$element_$.addEventListener("touchstart", this.$boundOnTouchStart_$, $passiveSupported$$ ? {passive:!0} : !1);
  this.$element_$.addEventListener("touchend", this.$boundOnTouchEnd_$);
  this.$element_$.addEventListener("touchmove", this.$boundOnTouchMove_$, $passiveSupported$$ ? {passive:!0} : !1);
  this.$element_$.addEventListener("touchcancel", this.$boundOnTouchCancel_$);
  this.$passAfterEvent_$ = !1;
}
function $Gestures$$module$src$gesture$get$$($element$jscomp$64$$) {
  var $opt_shouldNotPreventDefault$$ = void 0 === $opt_shouldNotPreventDefault$$ ? !1 : $opt_shouldNotPreventDefault$$;
  var $opt_shouldStopPropagation$$ = void 0 === $opt_shouldStopPropagation$$ ? !1 : $opt_shouldStopPropagation$$;
  var $res$jscomp$2$$ = $element$jscomp$64$$.__AMP_Gestures;
  $res$jscomp$2$$ || ($res$jscomp$2$$ = new $Gestures$$module$src$gesture$$($element$jscomp$64$$, $opt_shouldNotPreventDefault$$, $opt_shouldStopPropagation$$), $element$jscomp$64$$.__AMP_Gestures = $res$jscomp$2$$);
  return $res$jscomp$2$$;
}
$JSCompiler_prototypeAlias$$ = $Gestures$$module$src$gesture$$.prototype;
$JSCompiler_prototypeAlias$$.cleanup = function() {
  this.$element_$.removeEventListener("touchstart", this.$boundOnTouchStart_$);
  this.$element_$.removeEventListener("touchend", this.$boundOnTouchEnd_$);
  this.$element_$.removeEventListener("touchmove", this.$boundOnTouchMove_$);
  this.$element_$.removeEventListener("touchcancel", this.$boundOnTouchCancel_$);
  delete this.$element_$.__AMP_Gestures;
  this.$pass_$.cancel();
};
$JSCompiler_prototypeAlias$$.onGesture = function($recognizerConstr$$, $handler$jscomp$7$$) {
  var $recognizer$$ = new $recognizerConstr$$(this), $type$jscomp$149$$ = $recognizer$$.getType(), $overserver$$ = this.$overservers_$[$type$jscomp$149$$];
  $overserver$$ || (this.$recognizers_$.push($recognizer$$), $overserver$$ = new $Observable$$module$src$observable$$, this.$overservers_$[$type$jscomp$149$$] = $overserver$$);
  return $overserver$$.add($handler$jscomp$7$$);
};
$JSCompiler_prototypeAlias$$.removeGesture = function($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$) {
  var $type$jscomp$150$$ = (new $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$(this)).getType();
  if ($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$ = this.$overservers_$[$type$jscomp$150$$]) {
    $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$.removeAll();
    $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$ = $findIndex$$module$src$utils$array$$(this.$recognizers_$, function($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$) {
      return $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$.getType() == $type$jscomp$150$$;
    });
    if (0 > $index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$) {
      return !1;
    }
    this.$recognizers_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    this.$ready_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    this.$pending_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    this.$tracking_$.splice($index$jscomp$81_overserver$jscomp$1_recognizerConstr$jscomp$1$$, 1);
    delete this.$overservers_$[$type$jscomp$150$$];
    return !0;
  }
  return !1;
};
$JSCompiler_prototypeAlias$$.onPointerDown = function($handler$jscomp$8$$) {
  return this.$pointerDownObservable_$.add($handler$jscomp$8$$);
};
$JSCompiler_prototypeAlias$$.$onTouchStart_$ = function($event$jscomp$7$$) {
  var $now$$ = Date.now();
  this.$wasEventing_$ = !1;
  this.$pointerDownObservable_$.fire($event$jscomp$7$$);
  for (var $i$jscomp$24$$ = 0; $i$jscomp$24$$ < this.$recognizers_$.length; $i$jscomp$24$$++) {
    if (!this.$ready_$[$i$jscomp$24$$] && (this.$pending_$[$i$jscomp$24$$] && this.$pending_$[$i$jscomp$24$$] < $now$$ && $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$24$$), this.$recognizers_$[$i$jscomp$24$$].onTouchStart($event$jscomp$7$$))) {
      var $JSCompiler_index$jscomp$inline_61$$ = $i$jscomp$24$$;
      this.$tracking_$[$JSCompiler_index$jscomp$inline_61$$] = !0;
      this.$pending_$[$JSCompiler_index$jscomp$inline_61$$] = 0;
    }
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$7$$);
};
$JSCompiler_prototypeAlias$$.$onTouchMove_$ = function($event$jscomp$8$$) {
  for (var $now$jscomp$1$$ = Date.now(), $i$jscomp$25$$ = 0; $i$jscomp$25$$ < this.$recognizers_$.length; $i$jscomp$25$$++) {
    this.$tracking_$[$i$jscomp$25$$] && (this.$pending_$[$i$jscomp$25$$] && this.$pending_$[$i$jscomp$25$$] < $now$jscomp$1$$ ? $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$25$$) : this.$recognizers_$[$i$jscomp$25$$].onTouchMove($event$jscomp$8$$) || $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$25$$));
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$8$$);
};
$JSCompiler_prototypeAlias$$.$onTouchEnd_$ = function($event$jscomp$9$$) {
  for (var $now$jscomp$2$$ = Date.now(), $i$jscomp$26$$ = 0; $i$jscomp$26$$ < this.$recognizers_$.length; $i$jscomp$26$$++) {
    if (this.$tracking_$[$i$jscomp$26$$]) {
      if (this.$pending_$[$i$jscomp$26$$] && this.$pending_$[$i$jscomp$26$$] < $now$jscomp$2$$) {
        $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$26$$);
      } else {
        this.$recognizers_$[$i$jscomp$26$$].onTouchEnd($event$jscomp$9$$);
        var $isReady$$ = !this.$pending_$[$i$jscomp$26$$], $isExpired$$ = this.$pending_$[$i$jscomp$26$$] < $now$jscomp$2$$;
        this.$eventing_$ != this.$recognizers_$[$i$jscomp$26$$] && ($isReady$$ || $isExpired$$) && $JSCompiler_StaticMethods_stopTracking_$$(this, $i$jscomp$26$$);
      }
    }
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$9$$);
};
$JSCompiler_prototypeAlias$$.$onTouchCancel_$ = function($event$jscomp$10$$) {
  for (var $i$jscomp$27$$ = 0; $i$jscomp$27$$ < this.$recognizers_$.length; $i$jscomp$27$$++) {
    var $JSCompiler_index$jscomp$inline_146$$ = $i$jscomp$27$$;
    this.$ready_$[$JSCompiler_index$jscomp$inline_146$$] = 0;
    $JSCompiler_StaticMethods_stopTracking_$$(this, $JSCompiler_index$jscomp$inline_146$$);
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$10$$);
};
function $JSCompiler_StaticMethods_afterEvent_$$($JSCompiler_StaticMethods_afterEvent_$self$$, $event$jscomp$12$$) {
  var $cancelEvent$$ = !!$JSCompiler_StaticMethods_afterEvent_$self$$.$eventing_$ || $JSCompiler_StaticMethods_afterEvent_$self$$.$wasEventing_$;
  $JSCompiler_StaticMethods_afterEvent_$self$$.$wasEventing_$ = !1;
  if (!$cancelEvent$$) {
    for (var $now$jscomp$5$$ = Date.now(), $i$jscomp$30$$ = 0; $i$jscomp$30$$ < $JSCompiler_StaticMethods_afterEvent_$self$$.$recognizers_$.length; $i$jscomp$30$$++) {
      if ($JSCompiler_StaticMethods_afterEvent_$self$$.$ready_$[$i$jscomp$30$$] || $JSCompiler_StaticMethods_afterEvent_$self$$.$pending_$[$i$jscomp$30$$] && $JSCompiler_StaticMethods_afterEvent_$self$$.$pending_$[$i$jscomp$30$$] >= $now$jscomp$5$$) {
        $cancelEvent$$ = !0;
        break;
      }
    }
  }
  $cancelEvent$$ ? ($event$jscomp$12$$.stopPropagation(), $JSCompiler_StaticMethods_afterEvent_$self$$.$shouldNotPreventDefault_$ || $event$jscomp$12$$.preventDefault()) : $JSCompiler_StaticMethods_afterEvent_$self$$.$shouldStopPropagation_$ && $event$jscomp$12$$.stopPropagation();
  $JSCompiler_StaticMethods_afterEvent_$self$$.$passAfterEvent_$ && ($JSCompiler_StaticMethods_afterEvent_$self$$.$passAfterEvent_$ = !1, $JSCompiler_StaticMethods_afterEvent_$self$$.$doPass_$());
}
$JSCompiler_prototypeAlias$$.$doPass_$ = function() {
  for (var $JSCompiler_index$jscomp$inline_64_now$jscomp$6$$ = Date.now(), $readyIndex$$ = -1, $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$ = 0; $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$ < this.$recognizers_$.length; $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$++) {
    if (!this.$ready_$[$JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$]) {
      this.$pending_$[$JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$] && this.$pending_$[$JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$] < $JSCompiler_index$jscomp$inline_64_now$jscomp$6$$ && $JSCompiler_StaticMethods_stopTracking_$$(this, $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$);
    } else {
      if (-1 == $readyIndex$$ || this.$ready_$[$JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$] > this.$ready_$[$readyIndex$$]) {
        $readyIndex$$ = $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$;
      }
    }
  }
  if (-1 != $readyIndex$$) {
    var $waitTime$$ = 0;
    for ($JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$ = 0; $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$ < this.$recognizers_$.length; $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$++) {
      !this.$ready_$[$JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$] && this.$tracking_$[$JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$] && ($waitTime$$ = Math.max($waitTime$$, this.$pending_$[$JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$] - $JSCompiler_index$jscomp$inline_64_now$jscomp$6$$));
    }
    if (2 > $waitTime$$) {
      $JSCompiler_index$jscomp$inline_64_now$jscomp$6$$ = $readyIndex$$;
      $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$ = this.$recognizers_$[$JSCompiler_index$jscomp$inline_64_now$jscomp$6$$];
      for (var $JSCompiler_i$jscomp$inline_66$$ = 0; $JSCompiler_i$jscomp$inline_66$$ < this.$recognizers_$.length; $JSCompiler_i$jscomp$inline_66$$++) {
        if ($JSCompiler_i$jscomp$inline_66$$ != $JSCompiler_index$jscomp$inline_64_now$jscomp$6$$) {
          var $JSCompiler_index$jscomp$inline_149$$ = $JSCompiler_i$jscomp$inline_66$$;
          this.$ready_$[$JSCompiler_index$jscomp$inline_149$$] = 0;
          $JSCompiler_StaticMethods_stopTracking_$$(this, $JSCompiler_index$jscomp$inline_149$$);
        }
      }
      this.$ready_$[$JSCompiler_index$jscomp$inline_64_now$jscomp$6$$] = 0;
      this.$pending_$[$JSCompiler_index$jscomp$inline_64_now$jscomp$6$$] = 0;
      this.$eventing_$ = $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$;
      $JSCompiler_recognizer$jscomp$inline_65_i$5_i$jscomp$31$$.acceptStart();
    } else {
      this.$pass_$.schedule($waitTime$$);
    }
  }
};
function $JSCompiler_StaticMethods_stopTracking_$$($JSCompiler_StaticMethods_stopTracking_$self$$, $index$jscomp$84$$) {
  $JSCompiler_StaticMethods_stopTracking_$self$$.$tracking_$[$index$jscomp$84$$] = !1;
  $JSCompiler_StaticMethods_stopTracking_$self$$.$pending_$[$index$jscomp$84$$] = 0;
  $JSCompiler_StaticMethods_stopTracking_$self$$.$ready_$[$index$jscomp$84$$] || $JSCompiler_StaticMethods_stopTracking_$self$$.$recognizers_$[$index$jscomp$84$$].acceptCancel();
}
function $GestureRecognizer$$module$src$gesture$$($type$jscomp$151$$, $manager$$) {
  this.$type_$ = $type$jscomp$151$$;
  this.$manager_$ = $manager$$;
}
$JSCompiler_prototypeAlias$$ = $GestureRecognizer$$module$src$gesture$$.prototype;
$JSCompiler_prototypeAlias$$.getType = function() {
  return this.$type_$;
};
$JSCompiler_prototypeAlias$$.signalReady = function($offset$jscomp$27$$) {
  var $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_68$$ = this.$manager_$;
  if ($JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_68$$.$eventing_$) {
    this.acceptCancel();
  } else {
    for (var $JSCompiler_now$jscomp$inline_71$$ = Date.now(), $JSCompiler_i$jscomp$inline_72$$ = 0; $JSCompiler_i$jscomp$inline_72$$ < $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_68$$.$recognizers_$.length; $JSCompiler_i$jscomp$inline_72$$++) {
      $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_68$$.$recognizers_$[$JSCompiler_i$jscomp$inline_72$$] == this && ($JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_68$$.$ready_$[$JSCompiler_i$jscomp$inline_72$$] = $JSCompiler_now$jscomp$inline_71$$ + $offset$jscomp$27$$, $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_68$$.$pending_$[$JSCompiler_i$jscomp$inline_72$$] = 0);
    }
    $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_68$$.$passAfterEvent_$ = !0;
  }
};
$JSCompiler_prototypeAlias$$.signalPending = function($timeLeft$jscomp$1$$) {
  var $JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_74$$ = this.$manager_$;
  if ($JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_74$$.$eventing_$) {
    this.acceptCancel();
  } else {
    for (var $JSCompiler_now$jscomp$inline_77$$ = Date.now(), $JSCompiler_i$jscomp$inline_78$$ = 0; $JSCompiler_i$jscomp$inline_78$$ < $JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_74$$.$recognizers_$.length; $JSCompiler_i$jscomp$inline_78$$++) {
      $JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_74$$.$recognizers_$[$JSCompiler_i$jscomp$inline_78$$] == this && ($JSCompiler_StaticMethods_signalPending_$self$jscomp$inline_74$$.$pending_$[$JSCompiler_i$jscomp$inline_78$$] = $JSCompiler_now$jscomp$inline_77$$ + $timeLeft$jscomp$1$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.signalEnd = function() {
  var $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_80$$ = this.$manager_$;
  $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_80$$.$eventing_$ == this && ($JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_80$$.$eventing_$ = null, $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_80$$.$wasEventing_$ = !0);
};
$JSCompiler_prototypeAlias$$.signalEmit = function($data$jscomp$79$$, $event$jscomp$13$$) {
  var $JSCompiler_overserver$jscomp$inline_87$$ = this.$manager_$.$overservers_$[this.getType()];
  $JSCompiler_overserver$jscomp$inline_87$$ && $JSCompiler_overserver$jscomp$inline_87$$.fire(new $Gesture$$module$src$gesture$$(this.getType(), $data$jscomp$79$$, Date.now(), $event$jscomp$13$$));
};
$JSCompiler_prototypeAlias$$.acceptStart = function() {
};
$JSCompiler_prototypeAlias$$.acceptCancel = function() {
};
$JSCompiler_prototypeAlias$$.onTouchStart = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.onTouchMove = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.onTouchEnd = function() {
};
function $calcVelocity$$module$src$motion$$($deltaV$$, $deltaTime$$, $prevVelocity$$) {
  1 > $deltaTime$$ && ($deltaTime$$ = 1);
  var $depr$$ = 0.5 + Math.min($deltaTime$$ / 33.34, 0.5);
  return $deltaV$$ / $deltaTime$$ * $depr$$ + $prevVelocity$$ * (1 - $depr$$);
}
;function $SwipeRecognizer$$module$src$gesture_recognizers$$($type$jscomp$152$$, $manager$jscomp$3$$, $horiz$$, $vert$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, $type$jscomp$152$$, $manager$jscomp$3$$);
  this.$horiz_$ = $horiz$$;
  this.$vert_$ = $vert$$;
  this.$eventing_$ = !1;
  this.$velocityY_$ = this.$velocityX_$ = this.$prevTime_$ = this.$lastTime_$ = this.$startTime_$ = this.$prevY_$ = this.$prevX_$ = this.$lastY_$ = this.$lastX_$ = this.$startY_$ = this.$startX_$ = 0;
}
$$jscomp$inherits$$($SwipeRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
$JSCompiler_prototypeAlias$$ = $SwipeRecognizer$$module$src$gesture_recognizers$$.prototype;
$JSCompiler_prototypeAlias$$.onTouchStart = function($e$jscomp$26_touches$jscomp$6$$) {
  $e$jscomp$26_touches$jscomp$6$$ = $e$jscomp$26_touches$jscomp$6$$.touches;
  return this.$eventing_$ && $e$jscomp$26_touches$jscomp$6$$ && 1 < $e$jscomp$26_touches$jscomp$6$$.length ? !0 : $e$jscomp$26_touches$jscomp$6$$ && 1 == $e$jscomp$26_touches$jscomp$6$$.length ? (this.$startTime_$ = Date.now(), this.$startX_$ = $e$jscomp$26_touches$jscomp$6$$[0].clientX, this.$startY_$ = $e$jscomp$26_touches$jscomp$6$$[0].clientY, !0) : !1;
};
$JSCompiler_prototypeAlias$$.onTouchMove = function($dx$jscomp$6_e$jscomp$27$$) {
  var $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$ = $dx$jscomp$6_e$jscomp$27$$.touches;
  if ($dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$ && 1 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$.length) {
    var $$jscomp$destructuring$var16_y$jscomp$68$$ = $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$[0];
    $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$ = $$jscomp$destructuring$var16_y$jscomp$68$$.clientX;
    $$jscomp$destructuring$var16_y$jscomp$68$$ = $$jscomp$destructuring$var16_y$jscomp$68$$.clientY;
    this.$lastX_$ = $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$;
    this.$lastY_$ = $$jscomp$destructuring$var16_y$jscomp$68$$;
    if (this.$eventing_$) {
      $JSCompiler_StaticMethods_emit_$$(this, !1, !1, $dx$jscomp$6_e$jscomp$27$$);
    } else {
      if ($dx$jscomp$6_e$jscomp$27$$ = Math.abs($dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$ - this.$startX_$), $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$ = Math.abs($$jscomp$destructuring$var16_y$jscomp$68$$ - this.$startY_$), this.$horiz_$ && this.$vert_$) {
        (8 <= $dx$jscomp$6_e$jscomp$27$$ || 8 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$) && this.signalReady(-10);
      } else {
        if (this.$horiz_$) {
          if (8 <= $dx$jscomp$6_e$jscomp$27$$ && $dx$jscomp$6_e$jscomp$27$$ > $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$) {
            this.signalReady(-10);
          } else {
            if (8 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$) {
              return !1;
            }
          }
        } else {
          if (this.$vert_$) {
            if (8 <= $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$ && $dy$jscomp$6_touches$jscomp$7_x$jscomp$83$$ > $dx$jscomp$6_e$jscomp$27$$) {
              this.signalReady(-10);
            } else {
              if (8 <= $dx$jscomp$6_e$jscomp$27$$) {
                return !1;
              }
            }
          } else {
            return !1;
          }
        }
      }
    }
    return !0;
  }
  return !1;
};
$JSCompiler_prototypeAlias$$.onTouchEnd = function($e$jscomp$28$$) {
  var $touches$jscomp$8$$ = $e$jscomp$28$$.touches;
  $touches$jscomp$8$$ && 0 == $touches$jscomp$8$$.length && this.$eventing_$ && (this.$eventing_$ = !1, $JSCompiler_StaticMethods_emit_$$(this, !1, !0, $e$jscomp$28$$), this.signalEnd());
};
$JSCompiler_prototypeAlias$$.acceptStart = function() {
  this.$eventing_$ = !0;
  this.$prevX_$ = this.$startX_$;
  this.$prevY_$ = this.$startY_$;
  this.$prevTime_$ = this.$startTime_$;
  this.$startX_$ = this.$lastX_$;
  this.$startY_$ = this.$lastY_$;
  $JSCompiler_StaticMethods_emit_$$(this, !0, !1, null);
};
$JSCompiler_prototypeAlias$$.acceptCancel = function() {
  this.$eventing_$ = !1;
};
function $JSCompiler_StaticMethods_emit_$$($JSCompiler_StaticMethods_emit_$self$$, $first$jscomp$6$$, $last$$, $event$jscomp$14$$) {
  $JSCompiler_StaticMethods_emit_$self$$.$lastTime_$ = Date.now();
  var $deltaTime$jscomp$1$$ = $JSCompiler_StaticMethods_emit_$self$$.$lastTime_$ - $JSCompiler_StaticMethods_emit_$self$$.$prevTime_$;
  if (!$last$$ && 4 < $deltaTime$jscomp$1$$ || $last$$ && 16 < $deltaTime$jscomp$1$$) {
    var $velocityX$$ = $calcVelocity$$module$src$motion$$($JSCompiler_StaticMethods_emit_$self$$.$lastX_$ - $JSCompiler_StaticMethods_emit_$self$$.$prevX_$, $deltaTime$jscomp$1$$, $JSCompiler_StaticMethods_emit_$self$$.$velocityX_$), $velocityY$$ = $calcVelocity$$module$src$motion$$($JSCompiler_StaticMethods_emit_$self$$.$lastY_$ - $JSCompiler_StaticMethods_emit_$self$$.$prevY_$, $deltaTime$jscomp$1$$, $JSCompiler_StaticMethods_emit_$self$$.$velocityY_$);
    if (!$last$$ || 32 < $deltaTime$jscomp$1$$ || 0 != $velocityX$$ || 0 != $velocityY$$) {
      $JSCompiler_StaticMethods_emit_$self$$.$velocityX_$ = 1e-4 < Math.abs($velocityX$$) ? $velocityX$$ : 0, $JSCompiler_StaticMethods_emit_$self$$.$velocityY_$ = 1e-4 < Math.abs($velocityY$$) ? $velocityY$$ : 0;
    }
    $JSCompiler_StaticMethods_emit_$self$$.$prevX_$ = $JSCompiler_StaticMethods_emit_$self$$.$lastX_$;
    $JSCompiler_StaticMethods_emit_$self$$.$prevY_$ = $JSCompiler_StaticMethods_emit_$self$$.$lastY_$;
    $JSCompiler_StaticMethods_emit_$self$$.$prevTime_$ = $JSCompiler_StaticMethods_emit_$self$$.$lastTime_$;
  }
  $JSCompiler_StaticMethods_emit_$self$$.signalEmit({first:$first$jscomp$6$$, last:$last$$, time:$JSCompiler_StaticMethods_emit_$self$$.$lastTime_$, deltaX:$JSCompiler_StaticMethods_emit_$self$$.$lastX_$ - $JSCompiler_StaticMethods_emit_$self$$.$startX_$, deltaY:$JSCompiler_StaticMethods_emit_$self$$.$lastY_$ - $JSCompiler_StaticMethods_emit_$self$$.$startY_$, startX:$JSCompiler_StaticMethods_emit_$self$$.$startX_$, startY:$JSCompiler_StaticMethods_emit_$self$$.$startY_$, lastX:$JSCompiler_StaticMethods_emit_$self$$.$lastX_$, 
  lastY:$JSCompiler_StaticMethods_emit_$self$$.$lastY_$, velocityX:$JSCompiler_StaticMethods_emit_$self$$.$velocityX_$, velocityY:$JSCompiler_StaticMethods_emit_$self$$.$velocityY_$}, $event$jscomp$14$$);
}
function $SwipeXYRecognizer$$module$src$gesture_recognizers$$($manager$jscomp$4$$) {
  $SwipeRecognizer$$module$src$gesture_recognizers$$.call(this, "swipe-xy", $manager$jscomp$4$$, !0, !0);
}
$$jscomp$inherits$$($SwipeXYRecognizer$$module$src$gesture_recognizers$$, $SwipeRecognizer$$module$src$gesture_recognizers$$);
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $getVendorJsPropertyName$$module$src$style$$($style$jscomp$1$$, $camelCase$jscomp$1$$, $opt_bypassCache$$) {
  if (2 > $camelCase$jscomp$1$$.length ? 0 : 0 == $camelCase$jscomp$1$$.lastIndexOf("--", 0)) {
    return $camelCase$jscomp$1$$;
  }
  $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
  var $propertyName$jscomp$9$$ = $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$];
  if (!$propertyName$jscomp$9$$ || $opt_bypassCache$$) {
    $propertyName$jscomp$9$$ = $camelCase$jscomp$1$$;
    if (void 0 === $style$jscomp$1$$[$camelCase$jscomp$1$$]) {
      var $JSCompiler_inline_result$jscomp$32_JSCompiler_inline_result$jscomp$33$$ = $camelCase$jscomp$1$$.charAt(0).toUpperCase() + $camelCase$jscomp$1$$.slice(1);
      a: {
        for (var $JSCompiler_i$jscomp$inline_96$$ = 0; $JSCompiler_i$jscomp$inline_96$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_96$$++) {
          var $JSCompiler_propertyName$jscomp$inline_97$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_96$$] + $JSCompiler_inline_result$jscomp$32_JSCompiler_inline_result$jscomp$33$$;
          if (void 0 !== $style$jscomp$1$$[$JSCompiler_propertyName$jscomp$inline_97$$]) {
            $JSCompiler_inline_result$jscomp$32_JSCompiler_inline_result$jscomp$33$$ = $JSCompiler_propertyName$jscomp$inline_97$$;
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$32_JSCompiler_inline_result$jscomp$33$$ = "";
      }
      var $prefixedPropertyName$$ = $JSCompiler_inline_result$jscomp$32_JSCompiler_inline_result$jscomp$33$$;
      void 0 !== $style$jscomp$1$$[$prefixedPropertyName$$] && ($propertyName$jscomp$9$$ = $prefixedPropertyName$$);
    }
    $opt_bypassCache$$ || ($propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$] = $propertyName$jscomp$9$$);
  }
  return $propertyName$jscomp$9$$;
}
function $setImportantStyles$$module$src$style$$($element$jscomp$65_style$jscomp$2$$, $styles$$) {
  $element$jscomp$65_style$jscomp$2$$ = $element$jscomp$65_style$jscomp$2$$.style;
  for (var $k$jscomp$3$$ in $styles$$) {
    $element$jscomp$65_style$jscomp$2$$.setProperty($getVendorJsPropertyName$$module$src$style$$($element$jscomp$65_style$jscomp$2$$, $k$jscomp$3$$), $styles$$[$k$jscomp$3$$].toString(), "important");
  }
}
function $setStyle$$module$src$style$$($element$jscomp$66$$, $property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$97$$) {
  ($property$jscomp$7_propertyName$jscomp$10$$ = $getVendorJsPropertyName$$module$src$style$$($element$jscomp$66$$.style, $property$jscomp$7_propertyName$jscomp$10$$, void 0)) && ((2 > $property$jscomp$7_propertyName$jscomp$10$$.length ? 0 : 0 == $property$jscomp$7_propertyName$jscomp$10$$.lastIndexOf("--", 0)) ? $element$jscomp$66$$.style.setProperty($property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$97$$) : $element$jscomp$66$$.style[$property$jscomp$7_propertyName$jscomp$10$$] = $value$jscomp$97$$);
}
function $setStyles$$module$src$style$$($element$jscomp$68$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$4$$ in $styles$jscomp$1$$) {
    $setStyle$$module$src$style$$($element$jscomp$68$$, $k$jscomp$4$$, $styles$jscomp$1$$[$k$jscomp$4$$]);
  }
}
function $assertDoesNotContainDisplay$$module$src$style$$($styles$jscomp$2$$) {
  "display" in $styles$jscomp$2$$ && $dev$$module$src$log$$().error("STYLE", "`display` style detected in styles. You must use toggle instead.");
  return $styles$jscomp$2$$;
}
function $toggle$$module$src$style$$($element$jscomp$69$$) {
  var $opt_display$$ = !0;
  void 0 === $opt_display$$ && ($opt_display$$ = $element$jscomp$69$$.hasAttribute("hidden"));
  $opt_display$$ ? $element$jscomp$69$$.removeAttribute("hidden") : $element$jscomp$69$$.setAttribute("hidden", "");
}
function $resetStyles$$module$src$style$$($element$jscomp$70$$) {
  for (var $properties$jscomp$3$$ = ["transition"], $i$jscomp$34$$ = 0; $i$jscomp$34$$ < $properties$jscomp$3$$.length; $i$jscomp$34$$++) {
    $setStyle$$module$src$style$$($element$jscomp$70$$, $properties$jscomp$3$$[$i$jscomp$34$$], null);
  }
}
;function $debounce$$module$src$utils$rate_limit$$($win$jscomp$60$$, $callback$jscomp$63$$) {
  function $waiter$jscomp$1$$() {
    $locker$jscomp$1$$ = 0;
    var $remaining$$ = 500 - ($win$jscomp$60$$.Date.now() - $timestamp$$);
    if (0 < $remaining$$) {
      $locker$jscomp$1$$ = $win$jscomp$60$$.setTimeout($waiter$jscomp$1$$, $remaining$$);
    } else {
      var $JSCompiler_args$jscomp$inline_99$$ = $nextCallArgs$jscomp$1$$;
      $nextCallArgs$jscomp$1$$ = null;
      $callback$jscomp$63$$.apply(null, $JSCompiler_args$jscomp$inline_99$$);
    }
  }
  var $locker$jscomp$1$$ = 0, $timestamp$$ = 0, $nextCallArgs$jscomp$1$$ = null;
  return function($callback$jscomp$63$$) {
    for (var $args$jscomp$6$$ = [], $$jscomp$restIndex$jscomp$2$$ = 0; $$jscomp$restIndex$jscomp$2$$ < arguments.length; ++$$jscomp$restIndex$jscomp$2$$) {
      $args$jscomp$6$$[$$jscomp$restIndex$jscomp$2$$ - 0] = arguments[$$jscomp$restIndex$jscomp$2$$];
    }
    $timestamp$$ = $win$jscomp$60$$.Date.now();
    $nextCallArgs$jscomp$1$$ = $args$jscomp$6$$;
    $locker$jscomp$1$$ || ($locker$jscomp$1$$ = $win$jscomp$60$$.setTimeout($waiter$jscomp$1$$, 500));
  };
}
;var $htmlContainer$$module$src$static_template$$;
function $isInFie$$module$src$iframe_helper$$($element$jscomp$79$$) {
  return $element$jscomp$79$$.classList.contains("i-amphtml-fie") || !!$closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$79$$);
}
;var $_template$$module$extensions$amp_lightbox$0_1$amp_lightbox$$ = ['<i-amphtml-ad-close-header role=button tabindex=0 aria-label="Close Ad"><div>Ad</div><i-amphtml-ad-close-button class=amp-ad-close-button></i-amphtml-ad-close-button></i-amphtml-ad-close-header>'], $AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$ = {"fade-in":{openStyle:$dict$$module$src$utils$object$$({opacity:1}), closedStyle:$dict$$module$src$utils$object$$({opacity:0}), durationSeconds:0.1}, "fly-in-bottom":{openStyle:$dict$$module$src$utils$object$$({transform:"translate(0, 0)"}), 
closedStyle:$dict$$module$src$utils$object$$({transform:"translate(0, 100%)"}), durationSeconds:0.2}, "fly-in-top":{openStyle:$dict$$module$src$utils$object$$({transform:"translate(0, 0)"}), closedStyle:$dict$$module$src$utils$object$$({transform:"translate(0, -100%)"}), durationSeconds:0.2}};
function $AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$($element$jscomp$80$$) {
  var $$jscomp$super$this$$ = AMP.BaseElement.call(this, $element$jscomp$80$$) || this;
  $$jscomp$super$this$$.$size_$ = null;
  $$jscomp$super$this$$.$container_$ = null;
  $$jscomp$super$this$$.$document_$ = $$jscomp$super$this$$.win.document;
  $$jscomp$super$this$$.$action_$ = null;
  $$jscomp$super$this$$.$historyId_$ = -1;
  $$jscomp$super$this$$.$active_$ = !1;
  $$jscomp$super$this$$.$boundCloseOnEscape_$ = null;
  $$jscomp$super$this$$.$boundCloseOnEnter_$ = null;
  $$jscomp$super$this$$.$boundFocusin_$ = null;
  $$jscomp$super$this$$.$boundClose_$ = null;
  $$jscomp$super$this$$.$openerElement_$ = null;
  $$jscomp$super$this$$.$isScrollable_$ = !1;
  $$jscomp$super$this$$.$pos_$ = 0;
  $$jscomp$super$this$$.$oldPos_$ = 0;
  $$jscomp$super$this$$.$eventCounter_$ = 0;
  $$jscomp$super$this$$.$scrollTimerId_$ = null;
  $$jscomp$super$this$$.$animationPreset_$ = ($element$jscomp$80$$.getAttribute("animate-in") || "fade-in").toLowerCase();
  $$jscomp$super$this$$.$closeButtonHeader_$ = null;
  $$jscomp$super$this$$.$closeButton_$ = null;
  $$jscomp$super$this$$.$closeButtonSR_$ = null;
  var $platform$$ = $getService$$module$src$service$$($$jscomp$super$this$$.win, "platform");
  $$jscomp$super$this$$.$isIos_$ = $platform$$.isIos();
  $$jscomp$super$this$$.$boundReschedule_$ = $debounce$$module$src$utils$rate_limit$$($$jscomp$super$this$$.win, function() {
    var $element$jscomp$80$$ = $user$$module$src$log$$().assertElement($$jscomp$super$this$$.$container_$, "E#19457 this.container_"), $platform$$ = $Services$$module$src$services$ownersForDoc$$($$jscomp$super$this$$.element);
    $platform$$.scheduleLayout($$jscomp$super$this$$.element, $element$jscomp$80$$);
    $platform$$.scheduleResume($$jscomp$super$this$$.element, $element$jscomp$80$$);
  });
  return $$jscomp$super$this$$;
}
$$jscomp$inherits$$($AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$, AMP.BaseElement);
$JSCompiler_prototypeAlias$$ = $AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$.prototype;
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  var $$jscomp$this$jscomp$6$$ = this;
  this.user().assert($hasOwn_$$module$src$utils$object$$.call($AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$, this.$animationPreset_$), "Invalid `animate-in` value %s", this.$animationPreset_$);
  this.element.classList.add("i-amphtml-overlay");
  this.$action_$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$(this.element);
  $JSCompiler_StaticMethods_maybeSetTransparentBody_$$(this);
  this.registerDefaultAction(function($i$jscomp$45$$) {
    return $JSCompiler_StaticMethods_open_$$($$jscomp$this$jscomp$6$$, $i$jscomp$45$$.trust, $i$jscomp$45$$.caller);
  }, "open");
  this.registerAction("close", function($i$jscomp$46$$) {
    return $$jscomp$this$jscomp$6$$.close($i$jscomp$46$$.trust);
  });
  this.$action_$.addToAllowlist("AMP-LIGHTBOX", ["open", "close"], ["email"]);
};
function $JSCompiler_StaticMethods_takeOwnershipOfDescendants_$$($JSCompiler_StaticMethods_takeOwnershipOfDescendants_$self$$) {
  $toArray$$module$src$types$$($JSCompiler_StaticMethods_takeOwnershipOfDescendants_$self$$.element.getElementsByClassName("i-amphtml-element")).forEach(function($child$jscomp$7$$) {
    $Services$$module$src$services$ownersForDoc$$($JSCompiler_StaticMethods_takeOwnershipOfDescendants_$self$$.element).setOwner($child$jscomp$7$$, $JSCompiler_StaticMethods_takeOwnershipOfDescendants_$self$$.element);
  });
}
function $JSCompiler_StaticMethods_initialize_$$($JSCompiler_StaticMethods_initialize_$self$$) {
  if (!$JSCompiler_StaticMethods_initialize_$self$$.$container_$) {
    var $element$jscomp$81$$ = $JSCompiler_StaticMethods_initialize_$self$$.element;
    $JSCompiler_StaticMethods_initialize_$self$$.$isScrollable_$ = $element$jscomp$81$$.hasAttribute("scrollable");
    var $children$jscomp$129$$ = $JSCompiler_StaticMethods_initialize_$self$$.getRealChildren();
    $JSCompiler_StaticMethods_initialize_$self$$.$container_$ = $element$jscomp$81$$.ownerDocument.createElement("div");
    $JSCompiler_StaticMethods_initialize_$self$$.$isScrollable_$ || $JSCompiler_StaticMethods_initialize_$self$$.applyFillContent($JSCompiler_StaticMethods_initialize_$self$$.$container_$);
    $element$jscomp$81$$.appendChild($JSCompiler_StaticMethods_initialize_$self$$.$container_$);
    $children$jscomp$129$$.forEach(function($element$jscomp$81$$) {
      $JSCompiler_StaticMethods_initialize_$self$$.$container_$.appendChild($element$jscomp$81$$);
    });
    $JSCompiler_StaticMethods_initialize_$self$$.$isScrollable_$ && ($JSCompiler_StaticMethods_takeOwnershipOfDescendants_$$($JSCompiler_StaticMethods_initialize_$self$$), $element$jscomp$81$$.classList.add("i-amphtml-scrollable"), $element$jscomp$81$$.addEventListener("amp:dom-update", function() {
      $JSCompiler_StaticMethods_takeOwnershipOfDescendants_$$($JSCompiler_StaticMethods_initialize_$self$$);
      $JSCompiler_StaticMethods_updateChildrenInViewport_$$($JSCompiler_StaticMethods_initialize_$self$$, $JSCompiler_StaticMethods_initialize_$self$$.$pos_$, $JSCompiler_StaticMethods_initialize_$self$$.$pos_$);
    }), $element$jscomp$81$$.addEventListener("scroll", $JSCompiler_StaticMethods_initialize_$self$$.$scrollHandler_$.bind($JSCompiler_StaticMethods_initialize_$self$$)));
    if (!$JSCompiler_StaticMethods_initialize_$self$$.$isScrollable_$) {
      $Gestures$$module$src$gesture$get$$($element$jscomp$81$$).onGesture($SwipeXYRecognizer$$module$src$gesture_recognizers$$, function() {
      });
    }
    $JSCompiler_StaticMethods_maybeCreateCloseButtonHeader_$$($JSCompiler_StaticMethods_initialize_$self$$);
  }
}
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  $resolved$$module$src$resolved_promise$$ || ($resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0));
  var $JSCompiler_inline_result$jscomp$23$$ = $resolved$$module$src$resolved_promise$$;
  return $JSCompiler_inline_result$jscomp$23$$;
};
function $JSCompiler_StaticMethods_open_$$($JSCompiler_StaticMethods_open_$self$$, $trust$$, $openerElement$$) {
  if (!$JSCompiler_StaticMethods_open_$self$$.$active_$) {
    $JSCompiler_StaticMethods_initialize_$$($JSCompiler_StaticMethods_open_$self$$);
    $JSCompiler_StaticMethods_open_$self$$.$boundCloseOnEscape_$ = $JSCompiler_StaticMethods_open_$self$$.$closeOnEscape_$.bind($JSCompiler_StaticMethods_open_$self$$);
    $JSCompiler_StaticMethods_open_$self$$.$document_$.documentElement.addEventListener("keydown", $JSCompiler_StaticMethods_open_$self$$.$boundCloseOnEscape_$);
    $JSCompiler_StaticMethods_open_$self$$.$boundFocusin_$ = $JSCompiler_StaticMethods_open_$self$$.$onFocusin_$.bind($JSCompiler_StaticMethods_open_$self$$);
    $JSCompiler_StaticMethods_open_$self$$.$document_$.documentElement.addEventListener("focusin", $JSCompiler_StaticMethods_open_$self$$.$boundFocusin_$);
    $openerElement$$ && ($JSCompiler_StaticMethods_open_$self$$.$openerElement_$ = $openerElement$$);
    var $$jscomp$destructuring$var31$$ = new $Deferred$$module$src$utils$promise$$, $promise$jscomp$2$$ = $$jscomp$destructuring$var31$$.promise, $resolve$jscomp$10$$ = $$jscomp$destructuring$var31$$.resolve;
    $JSCompiler_StaticMethods_open_$self$$.getViewport().enterLightboxMode($JSCompiler_StaticMethods_open_$self$$.element, $promise$jscomp$2$$).then(function() {
      return $JSCompiler_StaticMethods_finalizeOpen_$$($JSCompiler_StaticMethods_open_$self$$, $resolve$jscomp$10$$, $trust$$);
    });
  }
}
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$$) {
  var $open$jscomp$2$$ = $mutations$$.open;
  void 0 !== $open$jscomp$2$$ && ($open$jscomp$2$$ ? $JSCompiler_StaticMethods_open_$$(this, 2, document.activeElement) : this.close(2));
};
function $JSCompiler_StaticMethods_handleAutofocus_$$($JSCompiler_StaticMethods_handleAutofocus_$self$$) {
  var $autofocusElement$$ = $JSCompiler_StaticMethods_handleAutofocus_$self$$.$container_$.querySelector("[autofocus]");
  $autofocusElement$$ && $tryFocus$$module$src$dom$$($autofocusElement$$);
}
function $JSCompiler_StaticMethods_finalizeOpen_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$, $callback$jscomp$65$$, $trust$jscomp$1$$) {
  function $onAnimationEnd$$() {
    $JSCompiler_StaticMethods_finalizeOpen_$self$$.$boundReschedule_$();
    $callback$jscomp$65$$();
  }
  var $element$jscomp$82$$ = $JSCompiler_StaticMethods_finalizeOpen_$self$$.element, $$jscomp$destructuring$var33_container$jscomp$6$$ = $AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$[$JSCompiler_StaticMethods_finalizeOpen_$self$$.$animationPreset_$], $durationSeconds$$ = $$jscomp$destructuring$var33_container$jscomp$6$$.durationSeconds, $openStyle$$ = $$jscomp$destructuring$var33_container$jscomp$6$$.openStyle, $closedStyle$$ = $$jscomp$destructuring$var33_container$jscomp$6$$.closedStyle, 
  $transition$$ = Object.keys($openStyle$$).map(function($JSCompiler_StaticMethods_finalizeOpen_$self$$) {
    return $JSCompiler_StaticMethods_finalizeOpen_$self$$ + " " + $durationSeconds$$ + "s ease-in";
  }).join(",");
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$eventCounter_$++;
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$isScrollable_$ && $setStyle$$module$src$style$$($element$jscomp$82$$, "webkitOverflowScrolling", "touch");
  $setStyle$$module$src$style$$($element$jscomp$82$$, "transition", $transition$$);
  $setStyles$$module$src$style$$($element$jscomp$82$$, $assertDoesNotContainDisplay$$module$src$style$$($closedStyle$$));
  $toggle$$module$src$style$$($element$jscomp$82$$);
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.mutateElement(function() {
    $element$jscomp$82$$.scrollTop = 0;
  });
  $JSCompiler_StaticMethods_handleAutofocus_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$);
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.mutateElement(function() {
    $setStyles$$module$src$style$$($element$jscomp$82$$, $assertDoesNotContainDisplay$$module$src$style$$($openStyle$$));
  });
  $$jscomp$destructuring$var33_container$jscomp$6$$ = $JSCompiler_StaticMethods_finalizeOpen_$self$$.$container_$;
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$isScrollable_$ ? ($JSCompiler_StaticMethods_finalizeOpen_$self$$.$scrollHandler_$(), $JSCompiler_StaticMethods_updateChildrenInViewport_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$, $JSCompiler_StaticMethods_finalizeOpen_$self$$.$pos_$, $JSCompiler_StaticMethods_finalizeOpen_$self$$.$pos_$)) : $Services$$module$src$services$ownersForDoc$$($JSCompiler_StaticMethods_finalizeOpen_$self$$.element).updateInViewport($JSCompiler_StaticMethods_finalizeOpen_$self$$.element, 
  $$jscomp$destructuring$var33_container$jscomp$6$$, !0);
  $element$jscomp$82$$.addEventListener("transitionend", $onAnimationEnd$$);
  $element$jscomp$82$$.addEventListener("animationend", $onAnimationEnd$$);
  var $owners$jscomp$1$$ = $Services$$module$src$services$ownersForDoc$$($JSCompiler_StaticMethods_finalizeOpen_$self$$.element);
  $owners$jscomp$1$$.scheduleLayout($JSCompiler_StaticMethods_finalizeOpen_$self$$.element, $$jscomp$destructuring$var33_container$jscomp$6$$);
  $owners$jscomp$1$$.scheduleResume($JSCompiler_StaticMethods_finalizeOpen_$self$$.element, $$jscomp$destructuring$var33_container$jscomp$6$$);
  $JSCompiler_StaticMethods_triggerEvent_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$, "lightboxOpen", $trust$jscomp$1$$);
  $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_finalizeOpen_$self$$.getAmpDoc(), "history").push($JSCompiler_StaticMethods_finalizeOpen_$self$$.close.bind($JSCompiler_StaticMethods_finalizeOpen_$self$$)).then(function($callback$jscomp$65$$) {
    $JSCompiler_StaticMethods_finalizeOpen_$self$$.$historyId_$ = $callback$jscomp$65$$;
  });
  $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$);
  $JSCompiler_StaticMethods_focusInModal_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$);
  $JSCompiler_StaticMethods_tieCloseButton_$$($JSCompiler_StaticMethods_finalizeOpen_$self$$);
  $JSCompiler_StaticMethods_finalizeOpen_$self$$.$active_$ = !0;
}
function $JSCompiler_StaticMethods_maybeCreateCloseButtonHeader_$$($JSCompiler_StaticMethods_maybeCreateCloseButtonHeader_$self$$) {
  var $element$jscomp$83$$ = $JSCompiler_StaticMethods_maybeCreateCloseButtonHeader_$self$$.element;
  if (null != $element$jscomp$83$$.getAttribute("close-button")) {
    var $JSCompiler_container$jscomp$inline_168_JSCompiler_doc$jscomp$inline_152$$ = $element$jscomp$83$$.ownerDocument || $element$jscomp$83$$;
    $htmlContainer$$module$src$static_template$$ && $htmlContainer$$module$src$static_template$$.ownerDocument === $JSCompiler_container$jscomp$inline_168_JSCompiler_doc$jscomp$inline_152$$ || ($htmlContainer$$module$src$static_template$$ = $JSCompiler_container$jscomp$inline_168_JSCompiler_doc$jscomp$inline_152$$.createElement("div"));
    $JSCompiler_container$jscomp$inline_168_JSCompiler_doc$jscomp$inline_152$$ = $htmlContainer$$module$src$static_template$$;
    $JSCompiler_container$jscomp$inline_168_JSCompiler_doc$jscomp$inline_152$$.innerHTML = $_template$$module$extensions$amp_lightbox$0_1$amp_lightbox$$[0];
    var $JSCompiler_el$jscomp$inline_169$$ = $JSCompiler_container$jscomp$inline_168_JSCompiler_doc$jscomp$inline_152$$.firstElementChild;
    $JSCompiler_container$jscomp$inline_168_JSCompiler_doc$jscomp$inline_152$$.removeChild($JSCompiler_el$jscomp$inline_169$$);
    $JSCompiler_StaticMethods_maybeCreateCloseButtonHeader_$self$$.$closeButtonHeader_$ = $JSCompiler_el$jscomp$inline_169$$;
    $element$jscomp$83$$.insertBefore($JSCompiler_StaticMethods_maybeCreateCloseButtonHeader_$self$$.$closeButtonHeader_$, $JSCompiler_StaticMethods_maybeCreateCloseButtonHeader_$self$$.$container_$);
  }
}
function $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$$($JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$) {
  if ($JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$closeButtonHeader_$) {
    $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$boundCloseOnEnter_$ = $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$closeOnEnter_$.bind($JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$);
    $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$closeButtonHeader_$.addEventListener("keydown", $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$boundCloseOnEnter_$);
    var $headerHeight$$;
    $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.measureMutateElement(function() {
      $headerHeight$$ = $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$closeButtonHeader_$.getBoundingClientRect().height;
    }, function() {
      $JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$closeButtonHeader_$.classList.add("amp-ad-close-header");
      $setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_maybeRenderCloseButtonHeader_$self$$.$container_$, {"margin-top":$headerHeight$$ + "px", "min-height":"calc(100vh - " + ($headerHeight$$ + "px)")});
    });
  }
}
function $JSCompiler_StaticMethods_tieCloseButton_$$($JSCompiler_StaticMethods_tieCloseButton_$self$$) {
  if ($JSCompiler_StaticMethods_tieCloseButton_$self$$.$closeButtonSR_$ || $JSCompiler_StaticMethods_tieCloseButton_$self$$.$closeButtonHeader_$) {
    $JSCompiler_StaticMethods_tieCloseButton_$self$$.$boundClose_$ = $JSCompiler_StaticMethods_tieCloseButton_$self$$.$closeOnClick_$.bind($JSCompiler_StaticMethods_tieCloseButton_$self$$), $JSCompiler_StaticMethods_tieCloseButton_$self$$.$closeButton_$.addEventListener("click", $JSCompiler_StaticMethods_tieCloseButton_$self$$.$boundClose_$);
  }
}
function $JSCompiler_StaticMethods_untieCloseButton_$$($JSCompiler_StaticMethods_untieCloseButton_$self$$) {
  if ($JSCompiler_StaticMethods_untieCloseButton_$self$$.$closeButtonSR_$ || $JSCompiler_StaticMethods_untieCloseButton_$self$$.$closeButtonHeader_$) {
    $JSCompiler_StaticMethods_untieCloseButton_$self$$.$closeButton_$.removeEventListener("click", $JSCompiler_StaticMethods_untieCloseButton_$self$$.$boundClose_$), $JSCompiler_StaticMethods_untieCloseButton_$self$$.$boundClose_$ = null, $JSCompiler_StaticMethods_untieCloseButton_$self$$.$closeButtonHeader_$ && ($JSCompiler_StaticMethods_untieCloseButton_$self$$.$closeButtonHeader_$.removeEventListener("keydown", $JSCompiler_StaticMethods_untieCloseButton_$self$$.$boundCloseOnEnter_$), $JSCompiler_StaticMethods_untieCloseButton_$self$$.$boundCloseOnEnter_$ = 
    null);
  }
}
$JSCompiler_prototypeAlias$$.$closeOnClick_$ = function() {
  this.close(3);
};
$JSCompiler_prototypeAlias$$.$closeOnEscape_$ = function($event$jscomp$27$$) {
  "Escape" == $event$jscomp$27$$.key && ($event$jscomp$27$$.preventDefault(), this.close(3));
};
$JSCompiler_prototypeAlias$$.$closeOnEnter_$ = function($event$jscomp$28$$) {
  "Enter" == $event$jscomp$28$$.key && ($event$jscomp$28$$.preventDefault(), this.close(3));
};
$JSCompiler_prototypeAlias$$.close = function($trust$jscomp$2$$) {
  var $$jscomp$this$jscomp$12$$ = this;
  this.$active_$ && (this.$isScrollable_$ && $setStyle$$module$src$style$$(this.element, "webkitOverflowScrolling", ""), this.getViewport().leaveLightboxMode(this.element).then(function() {
    return $JSCompiler_StaticMethods_finalizeClose_$$($$jscomp$this$jscomp$12$$, $trust$jscomp$2$$);
  }));
};
function $JSCompiler_StaticMethods_finalizeClose_$$($JSCompiler_StaticMethods_finalizeClose_$self$$, $trust$jscomp$3$$) {
  function $collapseAndReschedule$$() {
    $event$jscomp$29$$ == $JSCompiler_StaticMethods_finalizeClose_$self$$.$eventCounter_$ && ($JSCompiler_StaticMethods_finalizeClose_$self$$.collapse(), $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundReschedule_$());
  }
  var $element$jscomp$84$$ = $JSCompiler_StaticMethods_finalizeClose_$self$$.element, $event$jscomp$29$$ = ++$JSCompiler_StaticMethods_finalizeClose_$self$$.$eventCounter_$;
  $JSCompiler_StaticMethods_isInAd_$$($JSCompiler_StaticMethods_finalizeClose_$self$$) ? ($resetStyles$$module$src$style$$($element$jscomp$84$$), $collapseAndReschedule$$()) : ($element$jscomp$84$$.addEventListener("transitionend", $collapseAndReschedule$$), $element$jscomp$84$$.addEventListener("animationend", $collapseAndReschedule$$));
  $setStyles$$module$src$style$$($element$jscomp$84$$, $assertDoesNotContainDisplay$$module$src$style$$($AnimationPresets$$module$extensions$amp_lightbox$0_1$amp_lightbox$$[$JSCompiler_StaticMethods_finalizeClose_$self$$.$animationPreset_$].closedStyle));
  -1 != $JSCompiler_StaticMethods_finalizeClose_$self$$.$historyId_$ && $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_finalizeClose_$self$$.getAmpDoc(), "history").pop($JSCompiler_StaticMethods_finalizeClose_$self$$.$historyId_$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$document_$.documentElement.removeEventListener("keydown", $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundCloseOnEscape_$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundCloseOnEscape_$ = null;
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$document_$.documentElement.removeEventListener("focusin", $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundFocusin_$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$boundFocusin_$ = null;
  $JSCompiler_StaticMethods_untieCloseButton_$$($JSCompiler_StaticMethods_finalizeClose_$self$$);
  $Services$$module$src$services$ownersForDoc$$($JSCompiler_StaticMethods_finalizeClose_$self$$.element).schedulePause($JSCompiler_StaticMethods_finalizeClose_$self$$.element, $JSCompiler_StaticMethods_finalizeClose_$self$$.$container_$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$active_$ = !1;
  $JSCompiler_StaticMethods_triggerEvent_$$($JSCompiler_StaticMethods_finalizeClose_$self$$, "lightboxClose", $trust$jscomp$3$$);
  $JSCompiler_StaticMethods_finalizeClose_$self$$.$openerElement_$ && $tryFocus$$module$src$dom$$($JSCompiler_StaticMethods_finalizeClose_$self$$.$openerElement_$);
}
function $JSCompiler_StaticMethods_isInAd_$$($JSCompiler_StaticMethods_isInAd_$self$$) {
  return "inabox" == $getMode$$module$src$mode$$($JSCompiler_StaticMethods_isInAd_$self$$.win).runtime || $isInFie$$module$src$iframe_helper$$($JSCompiler_StaticMethods_isInAd_$self$$.element);
}
$JSCompiler_prototypeAlias$$.$onFocusin_$ = function() {
  this.element.contains(document.activeElement) || this.close(3);
};
function $JSCompiler_StaticMethods_focusInModal_$$($JSCompiler_StaticMethods_focusInModal_$self$$) {
  if (!$JSCompiler_StaticMethods_focusInModal_$self$$.element.contains(document.activeElement)) {
    a: {
      if ($JSCompiler_StaticMethods_focusInModal_$self$$.$closeButton_$) {
        var $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$ = $JSCompiler_StaticMethods_focusInModal_$self$$.$closeButton_$;
      } else {
        if ($JSCompiler_StaticMethods_focusInModal_$self$$.$closeButtonHeader_$) {
          $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$ = $JSCompiler_StaticMethods_focusInModal_$self$$.$closeButtonHeader_$;
        } else {
          $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$ = $JSCompiler_StaticMethods_focusInModal_$self$$.element;
          for (var $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$ = $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$.querySelectorAll("[on]"), $JSCompiler_i$jscomp$inline_111$$ = 0; $JSCompiler_i$jscomp$inline_111$$ < $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$.length; $JSCompiler_i$jscomp$inline_111$$++) {
            var $JSCompiler_candidate$jscomp$inline_112$$ = $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$[$JSCompiler_i$jscomp$inline_111$$];
            if ($JSCompiler_StaticMethods_focusInModal_$self$$.$action_$.hasResolvableActionForTarget($JSCompiler_candidate$jscomp$inline_112$$, "tap", $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$, $JSCompiler_candidate$jscomp$inline_112$$.parentElement)) {
              $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$ = $JSCompiler_candidate$jscomp$inline_112$$;
              break a;
            }
          }
          $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$ = void 0;
        }
      }
    }
    $JSCompiler_StaticMethods_focusInModal_$self$$.$closeButton_$ = $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$;
    $JSCompiler_StaticMethods_focusInModal_$self$$.$closeButton_$ || ($JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$ = $JSCompiler_StaticMethods_focusInModal_$self$$.element.getAttribute("data-close-button-aria-label") || "Close the modal", $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$ = $JSCompiler_StaticMethods_focusInModal_$self$$.$document_$.createElement("button"), $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$.textContent = 
    $JSCompiler_ariaLabel$jscomp$inline_115_JSCompiler_element$jscomp$inline_109_JSCompiler_inline_result$jscomp$38$$, $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$.classList.add("i-amphtml-screen-reader"), $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$.tabIndex = -1, $JSCompiler_StaticMethods_focusInModal_$self$$.$closeButtonSR_$ = $JSCompiler_candidates$jscomp$inline_110_JSCompiler_screenReaderCloseButton$jscomp$inline_116$$, 
    $JSCompiler_StaticMethods_focusInModal_$self$$.element.insertBefore($JSCompiler_StaticMethods_focusInModal_$self$$.$closeButtonSR_$, $JSCompiler_StaticMethods_focusInModal_$self$$.element.firstChild), $JSCompiler_StaticMethods_focusInModal_$self$$.$closeButton_$ = $JSCompiler_StaticMethods_focusInModal_$self$$.$closeButtonSR_$);
    $tryFocus$$module$src$dom$$($JSCompiler_StaticMethods_focusInModal_$self$$.$closeButton_$);
  }
}
$JSCompiler_prototypeAlias$$.$scrollHandler_$ = function() {
  var $currentScrollTop$$ = this.element.scrollTop;
  this.$isIos_$ && (0 == $currentScrollTop$$ ? this.element.scrollTop = 1 : this.element.scrollHeight == $currentScrollTop$$ + this.element.offsetHeight && (this.element.scrollTop = $currentScrollTop$$ - 1));
  this.$pos_$ = $currentScrollTop$$;
  null === this.$scrollTimerId_$ && $JSCompiler_StaticMethods_waitForScroll_$$(this, $currentScrollTop$$);
};
function $JSCompiler_StaticMethods_waitForScroll_$$($JSCompiler_StaticMethods_waitForScroll_$self$$, $startingScrollTop$$) {
  $JSCompiler_StaticMethods_waitForScroll_$self$$.$scrollTimerId_$ = $getService$$module$src$service$$($JSCompiler_StaticMethods_waitForScroll_$self$$.win, "timer").delay(function() {
    if (30 > Math.abs($startingScrollTop$$ - $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$)) {
      $dev$$module$src$log$$().fine("amp-lightbox", "slow scrolling: %s - %s", $startingScrollTop$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$);
      $JSCompiler_StaticMethods_waitForScroll_$self$$.$scrollTimerId_$ = null;
      var $JSCompiler_pos$jscomp$inline_119$$ = $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$;
      $dev$$module$src$log$$().fine("amp-lightbox", "update_");
      $JSCompiler_StaticMethods_updateChildrenInViewport_$$($JSCompiler_StaticMethods_waitForScroll_$self$$, $JSCompiler_pos$jscomp$inline_119$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$oldPos_$);
      $JSCompiler_StaticMethods_waitForScroll_$self$$.$oldPos_$ = $JSCompiler_pos$jscomp$inline_119$$;
      $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$ = $JSCompiler_pos$jscomp$inline_119$$;
    } else {
      $dev$$module$src$log$$().fine("amp-lightbox", "fast scrolling: %s - %s", $startingScrollTop$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$), $JSCompiler_StaticMethods_waitForScroll_$$($JSCompiler_StaticMethods_waitForScroll_$self$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$);
    }
  }, 100);
}
function $JSCompiler_StaticMethods_updateChildrenInViewport_$$($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$, $newPos$$, $oldPos$$) {
  var $seen$jscomp$1$$ = [];
  $JSCompiler_StaticMethods_forEachVisibleChild_$$($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$, $newPos$$, function($newPos$$) {
    $seen$jscomp$1$$.push($newPos$$);
    var $oldPos$$ = $Services$$module$src$services$ownersForDoc$$($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.element);
    $oldPos$$.updateInViewport($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.element, $newPos$$, !0);
    $oldPos$$.scheduleLayout($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.element, $newPos$$);
  });
  $oldPos$$ != $newPos$$ && $JSCompiler_StaticMethods_forEachVisibleChild_$$($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$, $oldPos$$, function($newPos$$) {
    $seen$jscomp$1$$.includes($newPos$$) || $Services$$module$src$services$ownersForDoc$$($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.element).updateInViewport($JSCompiler_StaticMethods_updateChildrenInViewport_$self$$.element, $newPos$$, !1);
  });
}
function $JSCompiler_StaticMethods_forEachVisibleChild_$$($JSCompiler_StaticMethods_forEachVisibleChild_$self$$, $pos$jscomp$2$$, $callback$jscomp$66$$) {
  $JSCompiler_StaticMethods_forEachVisibleChild_$self$$.$size_$ || ($JSCompiler_StaticMethods_forEachVisibleChild_$self$$.$size_$ = {width:$JSCompiler_StaticMethods_forEachVisibleChild_$self$$.element.clientWidth, height:$JSCompiler_StaticMethods_forEachVisibleChild_$self$$.element.clientHeight});
  for (var $containerHeight$$ = $JSCompiler_StaticMethods_forEachVisibleChild_$self$$.$size_$.height, $descendants$$ = $toArray$$module$src$types$$($JSCompiler_StaticMethods_forEachVisibleChild_$self$$.element.getElementsByClassName("i-amphtml-element")), $i$jscomp$48$$ = 0; $i$jscomp$48$$ < $descendants$$.length; $i$jscomp$48$$++) {
    for (var $descendant$jscomp$1$$ = $descendants$$[$i$jscomp$48$$], $offsetTop$$ = 0, $n$jscomp$7$$ = $descendant$jscomp$1$$; $n$jscomp$7$$ && $JSCompiler_StaticMethods_forEachVisibleChild_$self$$.element.contains($n$jscomp$7$$); $n$jscomp$7$$ = $n$jscomp$7$$.offsetParent) {
      $offsetTop$$ += $n$jscomp$7$$.offsetTop;
    }
    var $visibilityMargin$$ = 2 * $containerHeight$$;
    $offsetTop$$ + $descendant$jscomp$1$$.offsetHeight >= $pos$jscomp$2$$ - $visibilityMargin$$ && $offsetTop$$ <= $pos$jscomp$2$$ + $visibilityMargin$$ && $callback$jscomp$66$$($descendant$jscomp$1$$);
  }
}
function $JSCompiler_StaticMethods_maybeSetTransparentBody_$$($JSCompiler_StaticMethods_maybeSetTransparentBody_$self$$) {
  var $win$jscomp$63$$ = $JSCompiler_StaticMethods_maybeSetTransparentBody_$self$$.win;
  $isInFie$$module$src$iframe_helper$$($JSCompiler_StaticMethods_maybeSetTransparentBody_$self$$.element) && $setTransparentBody$$module$extensions$amp_lightbox$0_1$amp_lightbox$$($win$jscomp$63$$, $win$jscomp$63$$.document.body);
}
function $JSCompiler_StaticMethods_triggerEvent_$$($JSCompiler_StaticMethods_triggerEvent_$self$$, $name$jscomp$79$$, $trust$jscomp$4$$) {
  var $JSCompiler_e$jscomp$inline_128_JSCompiler_win$jscomp$inline_123$$ = $JSCompiler_StaticMethods_triggerEvent_$self$$.win;
  var $JSCompiler_inline_result$jscomp$34_JSCompiler_type$jscomp$inline_124$$ = "amp-lightbox." + $name$jscomp$79$$;
  var $JSCompiler_detail$jscomp$inline_125$$ = $dict$$module$src$utils$object$$({}), $JSCompiler_eventInit$jscomp$inline_127$$ = {detail:$JSCompiler_detail$jscomp$inline_125$$};
  Object.assign($JSCompiler_eventInit$jscomp$inline_127$$, void 0);
  "function" == typeof $JSCompiler_e$jscomp$inline_128_JSCompiler_win$jscomp$inline_123$$.CustomEvent ? $JSCompiler_inline_result$jscomp$34_JSCompiler_type$jscomp$inline_124$$ = new $JSCompiler_e$jscomp$inline_128_JSCompiler_win$jscomp$inline_123$$.CustomEvent($JSCompiler_inline_result$jscomp$34_JSCompiler_type$jscomp$inline_124$$, $JSCompiler_eventInit$jscomp$inline_127$$) : ($JSCompiler_e$jscomp$inline_128_JSCompiler_win$jscomp$inline_123$$ = $JSCompiler_e$jscomp$inline_128_JSCompiler_win$jscomp$inline_123$$.document.createEvent("CustomEvent"), 
  $JSCompiler_e$jscomp$inline_128_JSCompiler_win$jscomp$inline_123$$.initCustomEvent($JSCompiler_inline_result$jscomp$34_JSCompiler_type$jscomp$inline_124$$, !!$JSCompiler_eventInit$jscomp$inline_127$$.bubbles, !!$JSCompiler_eventInit$jscomp$inline_127$$.cancelable, $JSCompiler_detail$jscomp$inline_125$$), $JSCompiler_inline_result$jscomp$34_JSCompiler_type$jscomp$inline_124$$ = $JSCompiler_e$jscomp$inline_128_JSCompiler_win$jscomp$inline_123$$);
  $JSCompiler_StaticMethods_triggerEvent_$self$$.$action_$.trigger($JSCompiler_StaticMethods_triggerEvent_$self$$.element, $name$jscomp$79$$, $JSCompiler_inline_result$jscomp$34_JSCompiler_type$jscomp$inline_124$$, $trust$jscomp$4$$);
}
function $setTransparentBody$$module$extensions$amp_lightbox$0_1$amp_lightbox$$($win$jscomp$64$$, $body$jscomp$2$$) {
  var $state$$ = {}, $ampdoc$jscomp$12$$ = $getService$$module$src$service$$($win$jscomp$64$$, "ampdoc").getAmpDoc($body$jscomp$2$$);
  $getServiceForDoc$$module$src$service$$($ampdoc$jscomp$12$$, "mutator").measureMutateElement($body$jscomp$2$$, function() {
    $state$$.alreadyTransparent = "rgba(0, 0, 0, 0)" == ($win$jscomp$64$$.getComputedStyle($body$jscomp$2$$) || Object.create(null))["background-color"];
  }, function() {
    $state$$.alreadyTransparent || $user$$module$src$log$$().warn("amp-lightbox", "The background of the <body> element has been forced to transparent. If you need to set background, use an intermediate container.");
    $setImportantStyles$$module$src$style$$($body$jscomp$2$$, {background:"transparent"});
  });
}
(function($AMP$jscomp$1$$) {
  "inabox" == $getMode$$module$src$mode$$().runtime && $setTransparentBody$$module$extensions$amp_lightbox$0_1$amp_lightbox$$(window, document.body);
  $AMP$jscomp$1$$.registerElement("amp-lightbox", $AmpLightbox$$module$extensions$amp_lightbox$0_1$amp_lightbox$$, "amp-lightbox{display:none;position:fixed!important;z-index:1000;top:0!important;left:0!important;bottom:0!important;right:0!important}amp-lightbox[scrollable]{overflow-y:auto!important;overflow-x:hidden!important}i-amphtml-ad-close-header{height:60px!important;display:block!important;visibility:visible!important;opacity:0;position:fixed!important;top:0!important;left:0!important;right:0!important;z-index:1000!important;display:-ms-flexbox!important;display:flex!important;-ms-flex-align:center!important;align-items:center!important;-ms-flex-pack:right!important;justify-content:right!important;transition:opacity 0.1s ease-in}[animate-in=fly-in-bottom]>i-amphtml-ad-close-header,[animate-in=fly-in-top]>i-amphtml-ad-close-header{transition-delay:0.2s}.amp-ad-close-header{opacity:1!important;box-sizing:border-box;padding:5px;line-height:40px;background-color:#000;color:#fff;font-family:Helvetica,sans-serif;font-size:12px;cursor:pointer}.amp-ad-close-header>:first-child{margin-left:auto!important;pointer-events:none!important}.amp-ad-close-button{display:block!important;background:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23fff'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\") no-repeat;background-position:50%;width:40px;height:40px;pointer-events:none!important;border-radius:40px;margin-left:5px}.amp-ad-close-header:active>.amp-ad-close-button{background-color:hsla(0,0%,100%,0.3)}\n/*# sourceURL=/extensions/amp-lightbox/0.1/amp-lightbox.css*/");
})(self.AMP);

})});

//# sourceMappingURL=amp-lightbox-0.1.js.map
