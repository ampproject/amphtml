(self.AMP=self.AMP||[]).push({n:"amp-carousel",v:"2007210308000",f:(function(AMP,_){
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
var $JSCompiler_temp$jscomp$20$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$20$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$21$$;
  a: {
    var $JSCompiler_x$jscomp$inline_37$$ = {a:!0}, $JSCompiler_y$jscomp$inline_38$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_38$$.__proto__ = $JSCompiler_x$jscomp$inline_37$$;
      $JSCompiler_inline_result$jscomp$21$$ = $JSCompiler_y$jscomp$inline_38$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_39$$) {
    }
    $JSCompiler_inline_result$jscomp$21$$ = !1;
  }
  $JSCompiler_temp$jscomp$20$$ = $JSCompiler_inline_result$jscomp$21$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$20$$;
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
function $resolvedPromise$$module$src$resolved_promise$$() {
  return $resolved$$module$src$resolved_promise$$ ? $resolved$$module$src$resolved_promise$$ : $resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0);
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
function $isFiniteNumber$$module$src$types$$($value$jscomp$92$$) {
  return "number" === typeof $value$jscomp$92$$ && isFinite($value$jscomp$92$$);
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
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$) {
  $user$$module$src$log$$().assert($shouldBeTrueish$jscomp$3$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
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
;var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $experimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$) {
  if ($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ in $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$] = Math.random() < $frequency$$);
    }
  }
  if ($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$3_experimentId$jscomp$2_i$jscomp$15$$ = 0; $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ < $optedInExperiments$$.length; $allowed$3_experimentId$jscomp$2_i$jscomp$15$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$));
  if ($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ = $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    var $JSCompiler_queryString$jscomp$inline_113_i$4$$ = $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.location.originalHash || $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$.location.hash;
    $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$ = Object.create(null);
    if ($JSCompiler_queryString$jscomp$inline_113_i$4$$) {
      for (var $JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$; $JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$ = $regex$$module$src$url_parse_query_string$$.exec($JSCompiler_queryString$jscomp$inline_113_i$4$$);) {
        var $JSCompiler_name$jscomp$inline_116_param$jscomp$6$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$[1], $JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$[1]);
        $JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$ = $JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$[2].replace(/\+/g, " "), $JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$[2]) : "";
        $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$[$JSCompiler_name$jscomp$inline_116_param$jscomp$6$$] = $JSCompiler_match$jscomp$inline_115_JSCompiler_value$jscomp$inline_117$$;
      }
    }
    for ($JSCompiler_queryString$jscomp$inline_113_i$4$$ = 0; $JSCompiler_queryString$jscomp$inline_113_i$4$$ < $allowed$3_experimentId$jscomp$2_i$jscomp$15$$.length; $JSCompiler_queryString$jscomp$inline_113_i$4$$++) {
      $JSCompiler_name$jscomp$inline_116_param$jscomp$6$$ = $JSCompiler_params$jscomp$inline_114_win$jscomp$12$$["e-" + $allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_113_i$4$$]], "1" == $JSCompiler_name$jscomp$inline_116_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_113_i$4$$]] = !0), "0" == $JSCompiler_name$jscomp$inline_116_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_113_i$4$$]] = 
      !1);
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
  for (var $i$jscomp$16$$ = 0; $i$jscomp$16$$ < $tokens$$.length; $i$jscomp$16$$++) {
    0 != $tokens$$[$i$jscomp$16$$].length && ("-" == $tokens$$[$i$jscomp$16$$][0] ? $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$16$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$16$$]] = !0);
  }
  return $toggles$jscomp$3_win$jscomp$14$$;
}
;var $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$ = [{experimentId:"ampdoc-fie", isTrafficEligible:function() {
  return !0;
}, branches:["21065001", "21065002"]}];
function $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$) {
  var $win$jscomp$23$$ = $JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$.ownerDocument.defaultView, $topWin$$ = $win$jscomp$23$$.__AMP_TOP || ($win$jscomp$23$$.__AMP_TOP = $win$jscomp$23$$), $isEmbed$$ = $win$jscomp$23$$ != $topWin$$, $JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$;
  if ($experimentToggles$$module$src$experiments$$($topWin$$)["ampdoc-fie"]) {
    $topWin$$.__AMP_EXPERIMENT_BRANCHES = $topWin$$.__AMP_EXPERIMENT_BRANCHES || {};
    for ($JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$ = 0; $JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$++) {
      var $JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$], $JSCompiler_experimentName$jscomp$inline_144$$ = $JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($topWin$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_144$$) || ($JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$.isTrafficEligible($topWin$$) ? !$topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_144$$] && $experimentToggles$$module$src$experiments$$($topWin$$)[$JSCompiler_experimentName$jscomp$inline_144$$] && 
      ($JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$ = $JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$.branches, $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_144$$] = $JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_160_JSCompiler_experiment$jscomp$inline_143$$.length)] || null) : $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_144$$] = 
      null);
    }
    $JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$ = "21065002" === ($topWin$$.__AMP_EXPERIMENT_BRANCHES ? $topWin$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$ = !1;
  }
  var $ampdocFieExperimentOn$$ = $JSCompiler_i$jscomp$inline_142_JSCompiler_inline_result$jscomp$110$$;
  $isEmbed$$ && !$ampdocFieExperimentOn$$ ? $JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$ = $isServiceRegistered$$module$src$service$$($win$jscomp$23$$, "action") ? $getServiceInternal$$module$src$service$$($win$jscomp$23$$, "action") : null : ($JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$), 
  $JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$), $JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$, 
  "action") ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$, "action") : null);
  return $JSCompiler_ampdoc$jscomp$inline_123_JSCompiler_holder$jscomp$inline_124_JSCompiler_temp$jscomp$111_element$jscomp$13$$;
}
function $getService$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$) {
  $win$jscomp$25$$ = $win$jscomp$25$$.__AMP_TOP || ($win$jscomp$25$$.__AMP_TOP = $win$jscomp$25$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$) {
  var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, "owners");
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
function $getServicePromiseOrNullInternal$$module$src$service$$($holder$jscomp$8$$) {
  var $s$jscomp$12$$ = $getServices$$module$src$service$$($holder$jscomp$8$$)["amp-analytics-instrumentation"];
  if ($s$jscomp$12$$) {
    if ($s$jscomp$12$$.promise) {
      return $s$jscomp$12$$.promise;
    }
    $getServiceInternal$$module$src$service$$($holder$jscomp$8$$, "amp-analytics-instrumentation");
    return $s$jscomp$12$$.promise = Promise.resolve($s$jscomp$12$$.obj);
  }
  return null;
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
function $emptyServiceHolderWithPromise$$module$src$service$$() {
  var $$jscomp$destructuring$var4_reject$jscomp$3$$ = new $Deferred$$module$src$utils$promise$$, $promise$jscomp$1$$ = $$jscomp$destructuring$var4_reject$jscomp$3$$.promise, $resolve$jscomp$4$$ = $$jscomp$destructuring$var4_reject$jscomp$3$$.resolve;
  $$jscomp$destructuring$var4_reject$jscomp$3$$ = $$jscomp$destructuring$var4_reject$jscomp$3$$.reject;
  $promise$jscomp$1$$.catch(function() {
  });
  return {obj:null, promise:$promise$jscomp$1$$, resolve:$resolve$jscomp$4$$, reject:$$jscomp$destructuring$var4_reject$jscomp$3$$, context:null, ctor:null};
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
  return $element$jscomp$21$$.closest ? $element$jscomp$21$$.closest("[i-amphtml-scale-animation]") : $closest$$module$src$dom$$($element$jscomp$21$$, function($element$jscomp$21$$) {
    var $el$jscomp$3$$ = $element$jscomp$21$$.matches || $element$jscomp$21$$.webkitMatchesSelector || $element$jscomp$21$$.mozMatchesSelector || $element$jscomp$21$$.msMatchesSelector || $element$jscomp$21$$.oMatchesSelector;
    return $el$jscomp$3$$ ? $el$jscomp$3$$.call($element$jscomp$21$$, "[i-amphtml-scale-animation]") : !1;
  });
}
;function $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$36$$) {
  var $s$jscomp$14$$ = $getServicePromiseOrNullInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($element$jscomp$36$$));
  if ($s$jscomp$14$$) {
    return $s$jscomp$14$$;
  }
  var $ampdoc$jscomp$9$$ = $getAmpdoc$$module$src$service$$($element$jscomp$36$$);
  return $ampdoc$jscomp$9$$.waitForBodyOpen().then(function() {
    var $element$jscomp$36$$ = $ampdoc$jscomp$9$$.win;
    var $s$jscomp$14$$ = $ampdoc$jscomp$9$$.win.document.head;
    if ($s$jscomp$14$$) {
      var $JSCompiler_inline_result$jscomp$138_JSCompiler_scripts$jscomp$inline_149$$ = {};
      $s$jscomp$14$$ = $s$jscomp$14$$.querySelectorAll("script[custom-element],script[custom-template]");
      for (var $JSCompiler_i$jscomp$inline_151$$ = 0; $JSCompiler_i$jscomp$inline_151$$ < $s$jscomp$14$$.length; $JSCompiler_i$jscomp$inline_151$$++) {
        var $JSCompiler_name$jscomp$inline_153_JSCompiler_script$jscomp$inline_152$$ = $s$jscomp$14$$[$JSCompiler_i$jscomp$inline_151$$];
        $JSCompiler_name$jscomp$inline_153_JSCompiler_script$jscomp$inline_152$$ = $JSCompiler_name$jscomp$inline_153_JSCompiler_script$jscomp$inline_152$$.getAttribute("custom-element") || $JSCompiler_name$jscomp$inline_153_JSCompiler_script$jscomp$inline_152$$.getAttribute("custom-template");
        $JSCompiler_inline_result$jscomp$138_JSCompiler_scripts$jscomp$inline_149$$[$JSCompiler_name$jscomp$inline_153_JSCompiler_script$jscomp$inline_152$$] = !0;
      }
      $JSCompiler_inline_result$jscomp$138_JSCompiler_scripts$jscomp$inline_149$$ = Object.keys($JSCompiler_inline_result$jscomp$138_JSCompiler_scripts$jscomp$inline_149$$);
    } else {
      $JSCompiler_inline_result$jscomp$138_JSCompiler_scripts$jscomp$inline_149$$ = [];
    }
    return $JSCompiler_inline_result$jscomp$138_JSCompiler_scripts$jscomp$inline_149$$.includes("amp-analytics") ? $getService$$module$src$service$$($element$jscomp$36$$, "extensions").waitForExtension($element$jscomp$36$$, "amp-analytics") : $resolvedPromise$$module$src$resolved_promise$$();
  }).then(function() {
    var $s$jscomp$14$$ = $ampdoc$jscomp$9$$.win;
    if ($s$jscomp$14$$.__AMP_EXTENDED_ELEMENTS && $s$jscomp$14$$.__AMP_EXTENDED_ELEMENTS["amp-analytics"]) {
      $s$jscomp$14$$ = $getAmpdocServiceHolder$$module$src$service$$($element$jscomp$36$$);
      var $JSCompiler_cached$jscomp$inline_133$$ = $getServicePromiseOrNullInternal$$module$src$service$$($s$jscomp$14$$);
      $JSCompiler_cached$jscomp$inline_133$$ ? $s$jscomp$14$$ = $JSCompiler_cached$jscomp$inline_133$$ : ($s$jscomp$14$$ = $getServices$$module$src$service$$($s$jscomp$14$$), $s$jscomp$14$$["amp-analytics-instrumentation"] = $emptyServiceHolderWithPromise$$module$src$service$$(), $s$jscomp$14$$ = $s$jscomp$14$$["amp-analytics-instrumentation"].promise);
    } else {
      $s$jscomp$14$$ = null;
    }
    return $s$jscomp$14$$;
  });
}
;function $Services$$module$src$services$timerFor$$($window$jscomp$10$$) {
  return $getService$$module$src$service$$($window$jscomp$10$$, "timer");
}
;function $bezierCurve$$module$src$curve$$($x1$jscomp$5$$, $y1$jscomp$5$$, $x2$jscomp$3$$, $y2$jscomp$3$$) {
  var $bezier$$ = new $Bezier$$module$src$curve$$($x1$jscomp$5$$, $y1$jscomp$5$$, $x2$jscomp$3$$, $y2$jscomp$3$$);
  return $bezier$$.solveYValueFromXValue.bind($bezier$$);
}
function $Bezier$$module$src$curve$$($x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$4$$, $y2$jscomp$4$$) {
  this.y0 = this.x0 = 0;
  this.x1 = $x1$jscomp$6$$;
  this.y1 = $y1$jscomp$6$$;
  this.x2 = $x2$jscomp$4$$;
  this.y2 = $y2$jscomp$4$$;
  this.y3 = this.x3 = 1;
}
$JSCompiler_prototypeAlias$$ = $Bezier$$module$src$curve$$.prototype;
$JSCompiler_prototypeAlias$$.solveYValueFromXValue = function($xVal$$) {
  return this.getPointY(this.solvePositionFromXValue($xVal$$));
};
$JSCompiler_prototypeAlias$$.solvePositionFromXValue = function($xVal$jscomp$1$$) {
  var $t$$ = ($xVal$jscomp$1$$ - this.x0) / (this.x3 - this.x0);
  if (0 >= $t$$) {
    return 0;
  }
  if (1 <= $t$$) {
    return 1;
  }
  for (var $tMin$$ = 0, $tMax$$ = 1, $value$jscomp$97$$ = 0, $i$5_i$jscomp$20$$ = 0; 8 > $i$5_i$jscomp$20$$; $i$5_i$jscomp$20$$++) {
    $value$jscomp$97$$ = this.getPointX($t$$);
    var $derivative$$ = (this.getPointX($t$$ + 1e-6) - $value$jscomp$97$$) / 1e-6;
    if (1e-6 > Math.abs($value$jscomp$97$$ - $xVal$jscomp$1$$)) {
      return $t$$;
    }
    if (1e-6 > Math.abs($derivative$$)) {
      break;
    } else {
      $value$jscomp$97$$ < $xVal$jscomp$1$$ ? $tMin$$ = $t$$ : $tMax$$ = $t$$, $t$$ -= ($value$jscomp$97$$ - $xVal$jscomp$1$$) / $derivative$$;
    }
  }
  for ($i$5_i$jscomp$20$$ = 0; 1e-6 < Math.abs($value$jscomp$97$$ - $xVal$jscomp$1$$) && 8 > $i$5_i$jscomp$20$$; $i$5_i$jscomp$20$$++) {
    $value$jscomp$97$$ < $xVal$jscomp$1$$ ? ($tMin$$ = $t$$, $t$$ = ($t$$ + $tMax$$) / 2) : ($tMax$$ = $t$$, $t$$ = ($t$$ + $tMin$$) / 2), $value$jscomp$97$$ = this.getPointX($t$$);
  }
  return $t$$;
};
$JSCompiler_prototypeAlias$$.getPointX = function($t$jscomp$1$$) {
  if (0 == $t$jscomp$1$$) {
    return this.x0;
  }
  if (1 == $t$jscomp$1$$) {
    return this.x3;
  }
  var $ix0$$ = this.lerp(this.x0, this.x1, $t$jscomp$1$$), $ix1$$ = this.lerp(this.x1, this.x2, $t$jscomp$1$$), $ix2$$ = this.lerp(this.x2, this.x3, $t$jscomp$1$$);
  $ix0$$ = this.lerp($ix0$$, $ix1$$, $t$jscomp$1$$);
  $ix1$$ = this.lerp($ix1$$, $ix2$$, $t$jscomp$1$$);
  return this.lerp($ix0$$, $ix1$$, $t$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.getPointY = function($t$jscomp$2$$) {
  if (0 == $t$jscomp$2$$) {
    return this.y0;
  }
  if (1 == $t$jscomp$2$$) {
    return this.y3;
  }
  var $iy0$$ = this.lerp(this.y0, this.y1, $t$jscomp$2$$), $iy1$$ = this.lerp(this.y1, this.y2, $t$jscomp$2$$), $iy2$$ = this.lerp(this.y2, this.y3, $t$jscomp$2$$);
  $iy0$$ = this.lerp($iy0$$, $iy1$$, $t$jscomp$2$$);
  $iy1$$ = this.lerp($iy1$$, $iy2$$, $t$jscomp$2$$);
  return this.lerp($iy0$$, $iy1$$, $t$jscomp$2$$);
};
$JSCompiler_prototypeAlias$$.lerp = function($a$jscomp$3$$, $b$jscomp$3$$, $x$jscomp$83$$) {
  return $a$jscomp$3$$ + $x$jscomp$83$$ * ($b$jscomp$3$$ - $a$jscomp$3$$);
};
var $Curves$$module$src$curve$EASE$$ = $bezierCurve$$module$src$curve$$(0.25, 0.1, 0.25, 1.0), $Curves$$module$src$curve$EASE_IN$$ = $bezierCurve$$module$src$curve$$(0.42, 0.0, 1.0, 1.0), $Curves$$module$src$curve$EASE_OUT$$ = $bezierCurve$$module$src$curve$$(0.0, 0.0, 0.58, 1.0), $Curves$$module$src$curve$EASE_IN_OUT$$ = $bezierCurve$$module$src$curve$$(0.42, 0.0, 0.58, 1.0), $NAME_MAP$$module$src$curve$$ = {linear:function($n$jscomp$6$$) {
  return $n$jscomp$6$$;
}, ease:$Curves$$module$src$curve$EASE$$, "ease-in":$Curves$$module$src$curve$EASE_IN$$, "ease-out":$Curves$$module$src$curve$EASE_OUT$$, "ease-in-out":$Curves$$module$src$curve$EASE_IN_OUT$$};
function $getCurve$$module$src$curve$$($curve$$) {
  if (!$curve$$) {
    return null;
  }
  if ("string" == typeof $curve$$) {
    if (-1 != $curve$$.indexOf("cubic-bezier")) {
      var $match$jscomp$4_values$jscomp$11$$ = $curve$$.match(/cubic-bezier\((.+)\)/);
      if ($match$jscomp$4_values$jscomp$11$$ && ($match$jscomp$4_values$jscomp$11$$ = $match$jscomp$4_values$jscomp$11$$[1].split(",").map(parseFloat), 4 == $match$jscomp$4_values$jscomp$11$$.length)) {
        for (var $i$jscomp$21$$ = 0; 4 > $i$jscomp$21$$; $i$jscomp$21$$++) {
          if (isNaN($match$jscomp$4_values$jscomp$11$$[$i$jscomp$21$$])) {
            return null;
          }
        }
        return $bezierCurve$$module$src$curve$$($match$jscomp$4_values$jscomp$11$$[0], $match$jscomp$4_values$jscomp$11$$[1], $match$jscomp$4_values$jscomp$11$$[2], $match$jscomp$4_values$jscomp$11$$[3]);
      }
      return null;
    }
    return $NAME_MAP$$module$src$curve$$[$curve$$];
  }
  return $curve$$;
}
;function $NOOP_CALLBACK$$module$src$animation$$() {
}
function $Animation$$module$src$animation$$($contextNode$jscomp$2$$) {
  this.$contextNode_$ = $contextNode$jscomp$2$$;
  this.$vsync_$ = $getService$$module$src$service$$(self, "vsync");
  this.$curve_$ = null;
  this.$segments_$ = [];
}
function $Animation$$module$src$animation$animate$$($contextNode$jscomp$3$$, $transition$$, $duration$jscomp$1$$, $opt_curve$$) {
  return (new $Animation$$module$src$animation$$($contextNode$jscomp$3$$)).setCurve($opt_curve$$).add(0, $transition$$, 1).start($duration$jscomp$1$$);
}
$Animation$$module$src$animation$$.prototype.setCurve = function($curve$jscomp$1$$) {
  $curve$jscomp$1$$ && (this.$curve_$ = $getCurve$$module$src$curve$$($curve$jscomp$1$$));
  return this;
};
$Animation$$module$src$animation$$.prototype.add = function($delay$$, $transition$jscomp$1$$, $duration$jscomp$2$$, $opt_curve$jscomp$1$$) {
  this.$segments_$.push({delay:$delay$$, func:$transition$jscomp$1$$, duration:$duration$jscomp$2$$, curve:$getCurve$$module$src$curve$$($opt_curve$jscomp$1$$)});
  return this;
};
$Animation$$module$src$animation$$.prototype.start = function($duration$jscomp$3$$) {
  return new $AnimationPlayer$$module$src$animation$$(this.$vsync_$, this.$contextNode_$, this.$segments_$, this.$curve_$, $duration$jscomp$3$$);
};
function $AnimationPlayer$$module$src$animation$$($vsync$$, $contextNode$jscomp$4_i$jscomp$22$$, $deferred$jscomp$2_segments$jscomp$2$$, $defaultCurve$$, $duration$jscomp$4$$) {
  this.$vsync_$ = $vsync$$;
  this.$contextNode_$ = $contextNode$jscomp$4_i$jscomp$22$$;
  this.$segments_$ = [];
  for ($contextNode$jscomp$4_i$jscomp$22$$ = 0; $contextNode$jscomp$4_i$jscomp$22$$ < $deferred$jscomp$2_segments$jscomp$2$$.length; $contextNode$jscomp$4_i$jscomp$22$$++) {
    var $segment$$ = $deferred$jscomp$2_segments$jscomp$2$$[$contextNode$jscomp$4_i$jscomp$22$$];
    this.$segments_$.push({delay:$segment$$.delay, func:$segment$$.func, duration:$segment$$.duration, curve:$segment$$.curve || $defaultCurve$$, started:!1, completed:!1});
  }
  this.$duration_$ = $duration$jscomp$4$$;
  this.$startTime_$ = Date.now();
  this.$running_$ = !0;
  this.$state_$ = {};
  $deferred$jscomp$2_segments$jscomp$2$$ = new $Deferred$$module$src$utils$promise$$;
  this.$promise_$ = $deferred$jscomp$2_segments$jscomp$2$$.promise;
  this.$resolve_$ = $deferred$jscomp$2_segments$jscomp$2$$.resolve;
  this.$reject_$ = $deferred$jscomp$2_segments$jscomp$2$$.reject;
  this.$task_$ = this.$vsync_$.createAnimTask(this.$contextNode_$, {mutate:this.$stepMutate_$.bind(this)});
  this.$vsync_$.canAnimate(this.$contextNode_$) ? this.$task_$(this.$state_$) : ($dev$$module$src$log$$().warn("Animation", "cannot animate"), $JSCompiler_StaticMethods_complete_$$(this, !1, 0));
}
$AnimationPlayer$$module$src$animation$$.prototype.then = function($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) {
  return $opt_resolve$jscomp$1$$ || $opt_reject$jscomp$1$$ ? this.$promise_$.then($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) : this.$promise_$;
};
$AnimationPlayer$$module$src$animation$$.prototype.thenAlways = function($callback$jscomp$59_opt_callback$jscomp$5$$) {
  $callback$jscomp$59_opt_callback$jscomp$5$$ = $callback$jscomp$59_opt_callback$jscomp$5$$ || $NOOP_CALLBACK$$module$src$animation$$;
  return this.then($callback$jscomp$59_opt_callback$jscomp$5$$, $callback$jscomp$59_opt_callback$jscomp$5$$);
};
$AnimationPlayer$$module$src$animation$$.prototype.halt = function($opt_dir$$) {
  $JSCompiler_StaticMethods_complete_$$(this, !1, $opt_dir$$ || 0);
};
function $JSCompiler_StaticMethods_complete_$$($JSCompiler_StaticMethods_complete_$self$$, $success$$, $dir$jscomp$1_i$jscomp$23$$) {
  if ($JSCompiler_StaticMethods_complete_$self$$.$running_$) {
    $JSCompiler_StaticMethods_complete_$self$$.$running_$ = !1;
    if (0 != $dir$jscomp$1_i$jscomp$23$$) {
      1 < $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length && $JSCompiler_StaticMethods_complete_$self$$.$segments_$.sort(function($JSCompiler_StaticMethods_complete_$self$$, $success$$) {
        return $JSCompiler_StaticMethods_complete_$self$$.delay + $JSCompiler_StaticMethods_complete_$self$$.duration - ($success$$.delay + $success$$.duration);
      });
      try {
        if (0 < $dir$jscomp$1_i$jscomp$23$$) {
          for ($dir$jscomp$1_i$jscomp$23$$ = 0; $dir$jscomp$1_i$jscomp$23$$ < $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length; $dir$jscomp$1_i$jscomp$23$$++) {
            $JSCompiler_StaticMethods_complete_$self$$.$segments_$[$dir$jscomp$1_i$jscomp$23$$].func(1, !0);
          }
        } else {
          for (var $i$6$$ = $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length - 1; 0 <= $i$6$$; $i$6$$--) {
            $JSCompiler_StaticMethods_complete_$self$$.$segments_$[$i$6$$].func(0, !1);
          }
        }
      } catch ($e$jscomp$18$$) {
        $dev$$module$src$log$$().error("Animation", "completion failed: " + $e$jscomp$18$$, $e$jscomp$18$$), $success$$ = !1;
      }
    }
    $success$$ ? $JSCompiler_StaticMethods_complete_$self$$.$resolve_$() : $JSCompiler_StaticMethods_complete_$self$$.$reject_$();
  }
}
$AnimationPlayer$$module$src$animation$$.prototype.$stepMutate_$ = function() {
  if (this.$running_$) {
    for (var $currentTime$$ = Date.now(), $normLinearTime$$ = Math.min(($currentTime$$ - this.$startTime_$) / this.$duration_$, 1), $i$7_i$jscomp$24$$ = 0; $i$7_i$jscomp$24$$ < this.$segments_$.length; $i$7_i$jscomp$24$$++) {
      var $segment$8_segment$jscomp$1$$ = this.$segments_$[$i$7_i$jscomp$24$$];
      !$segment$8_segment$jscomp$1$$.started && $normLinearTime$$ >= $segment$8_segment$jscomp$1$$.delay && ($segment$8_segment$jscomp$1$$.started = !0);
    }
    for ($i$7_i$jscomp$24$$ = 0; $i$7_i$jscomp$24$$ < this.$segments_$.length; $i$7_i$jscomp$24$$++) {
      if ($segment$8_segment$jscomp$1$$ = this.$segments_$[$i$7_i$jscomp$24$$], $segment$8_segment$jscomp$1$$.started && !$segment$8_segment$jscomp$1$$.completed) {
        a: {
          var $JSCompiler_normLinearTime$jscomp$inline_63$$;
          if (0 < $segment$8_segment$jscomp$1$$.duration) {
            var $JSCompiler_normTime$jscomp$inline_64$$ = $JSCompiler_normLinearTime$jscomp$inline_63$$ = Math.min(($normLinearTime$$ - $segment$8_segment$jscomp$1$$.delay) / $segment$8_segment$jscomp$1$$.duration, 1);
            if ($segment$8_segment$jscomp$1$$.curve && 1 != $JSCompiler_normTime$jscomp$inline_64$$) {
              try {
                $JSCompiler_normTime$jscomp$inline_64$$ = $segment$8_segment$jscomp$1$$.curve($JSCompiler_normLinearTime$jscomp$inline_63$$);
              } catch ($JSCompiler_e$jscomp$inline_65$$) {
                $dev$$module$src$log$$().error("Animation", "step curve failed: " + $JSCompiler_e$jscomp$inline_65$$, $JSCompiler_e$jscomp$inline_65$$);
                $JSCompiler_StaticMethods_complete_$$(this, !1, 0);
                break a;
              }
            }
          } else {
            $JSCompiler_normTime$jscomp$inline_64$$ = $JSCompiler_normLinearTime$jscomp$inline_63$$ = 1;
          }
          1 == $JSCompiler_normLinearTime$jscomp$inline_63$$ && ($segment$8_segment$jscomp$1$$.completed = !0);
          try {
            $segment$8_segment$jscomp$1$$.func($JSCompiler_normTime$jscomp$inline_64$$, $segment$8_segment$jscomp$1$$.completed);
          } catch ($e$9$jscomp$inline_66$$) {
            $dev$$module$src$log$$().error("Animation", "step mutate failed: " + $e$9$jscomp$inline_66$$, $e$9$jscomp$inline_66$$), $JSCompiler_StaticMethods_complete_$$(this, !1, 0);
          }
        }
      }
    }
    1 == $normLinearTime$$ ? $JSCompiler_StaticMethods_complete_$$(this, !0, 0) : this.$vsync_$.canAnimate(this.$contextNode_$) ? this.$task_$(this.$state_$) : ($dev$$module$src$log$$().warn("Animation", "cancel animation"), $JSCompiler_StaticMethods_complete_$$(this, !1, 0));
  }
};
function $isAmpFormatType$$module$src$format$$($doc$jscomp$6$$) {
  var $html$$ = $doc$jscomp$6$$.documentElement;
  return ["\u26a14email", "amp4email"].some(function($doc$jscomp$6$$) {
    return $html$$.hasAttribute($doc$jscomp$6$$);
  });
}
;function $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$($$jscomp$super$this_element$jscomp$62$$) {
  $$jscomp$super$this_element$jscomp$62$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$62$$) || this;
  $$jscomp$super$this_element$jscomp$62$$.$prevButton_$ = null;
  $$jscomp$super$this_element$jscomp$62$$.$nextButton_$ = null;
  $$jscomp$super$this_element$jscomp$62$$.$showControls_$ = !1;
  return $$jscomp$super$this_element$jscomp$62$$;
}
$$jscomp$inherits$$($BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$, AMP.BaseElement);
$JSCompiler_prototypeAlias$$ = $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$.prototype;
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  var $input$jscomp$9$$ = $getService$$module$src$service$$(this.win, "input");
  (this.$showControls_$ = $isAmpFormatType$$module$src$format$$(this.element.ownerDocument) || $input$jscomp$9$$.isMouseDetected() || this.element.hasAttribute("controls")) && this.element.classList.add("i-amphtml-carousel-has-controls");
  this.buildCarousel();
  this.buildButtons();
  this.setupGestures();
  this.setControlsState();
};
$JSCompiler_prototypeAlias$$.viewportCallback = function($inViewport$$) {
  this.onViewportCallback($inViewport$$);
  $inViewport$$ && this.hintControls();
};
$JSCompiler_prototypeAlias$$.onViewportCallback = function() {
};
$JSCompiler_prototypeAlias$$.buildButton = function($className$$, $onInteraction$$) {
  var $button$$ = this.element.ownerDocument.createElement("div");
  $button$$.tabIndex = 0;
  $button$$.classList.add("amp-carousel-button");
  $button$$.classList.add($className$$);
  $button$$.setAttribute("role", this.buttonsAriaRole());
  $button$$.onkeydown = function($className$$) {
    "Enter" != $className$$.key && " " != $className$$.key || $className$$.defaultPrevented || ($className$$.preventDefault(), $onInteraction$$());
  };
  $button$$.onclick = $onInteraction$$;
  return $button$$;
};
$JSCompiler_prototypeAlias$$.buttonsAriaRole = function() {
  return "button";
};
$JSCompiler_prototypeAlias$$.buildButtons = function() {
  var $$jscomp$this$jscomp$2$$ = this;
  this.$prevButton_$ = this.buildButton("amp-carousel-button-prev", function() {
    $$jscomp$this$jscomp$2$$.interactionPrev();
  });
  this.element.appendChild(this.$prevButton_$);
  this.$nextButton_$ = this.buildButton("amp-carousel-button-next", function() {
    $$jscomp$this$jscomp$2$$.interactionNext();
  });
  this.updateButtonTitles();
  this.element.appendChild(this.$nextButton_$);
};
$JSCompiler_prototypeAlias$$.prerenderAllowed = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.isRelayoutNeeded = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.buildCarousel = function() {
};
$JSCompiler_prototypeAlias$$.setupGestures = function() {
};
$JSCompiler_prototypeAlias$$.go = function($dir$jscomp$2$$, $animate$$, $opt_autoplay$$) {
  $opt_autoplay$$ = void 0 === $opt_autoplay$$ ? !1 : $opt_autoplay$$;
  this.goCallback($dir$jscomp$2$$, $animate$$, $opt_autoplay$$);
};
$JSCompiler_prototypeAlias$$.goCallback = function() {
};
$JSCompiler_prototypeAlias$$.setControlsState = function() {
  this.$prevButton_$.classList.toggle("amp-disabled", !this.hasPrev());
  this.$prevButton_$.setAttribute("aria-disabled", !this.hasPrev());
  this.$nextButton_$.classList.toggle("amp-disabled", !this.hasNext());
  this.$nextButton_$.setAttribute("aria-disabled", !this.hasNext());
};
$JSCompiler_prototypeAlias$$.hintControls = function() {
  var $$jscomp$this$jscomp$3$$ = this;
  !this.$showControls_$ && this.isInViewport() && this.getVsync().mutate(function() {
    $$jscomp$this$jscomp$3$$.element.classList.add("i-amphtml-carousel-button-start-hint");
    $Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$3$$.win).delay(function() {
      $$jscomp$this$jscomp$3$$.mutateElement(function() {
        $$jscomp$this$jscomp$3$$.element.classList.remove("i-amphtml-carousel-button-start-hint");
        var $JSCompiler_element$jscomp$inline_68$$ = $$jscomp$this$jscomp$3$$.element, $JSCompiler_enabled$jscomp$inline_72_JSCompiler_forced$jscomp$inline_69$$ = !$$jscomp$this$jscomp$3$$.$showControls_$, $JSCompiler_hasAttribute$jscomp$inline_71$$ = $JSCompiler_element$jscomp$inline_68$$.hasAttribute("i-amphtml-carousel-hide-buttons");
        $JSCompiler_enabled$jscomp$inline_72_JSCompiler_forced$jscomp$inline_69$$ = void 0 !== $JSCompiler_enabled$jscomp$inline_72_JSCompiler_forced$jscomp$inline_69$$ ? $JSCompiler_enabled$jscomp$inline_72_JSCompiler_forced$jscomp$inline_69$$ : !$JSCompiler_hasAttribute$jscomp$inline_71$$;
        $JSCompiler_enabled$jscomp$inline_72_JSCompiler_forced$jscomp$inline_69$$ !== $JSCompiler_hasAttribute$jscomp$inline_71$$ && ($JSCompiler_enabled$jscomp$inline_72_JSCompiler_forced$jscomp$inline_69$$ ? $JSCompiler_element$jscomp$inline_68$$.setAttribute("i-amphtml-carousel-hide-buttons", "") : $JSCompiler_element$jscomp$inline_68$$.removeAttribute("i-amphtml-carousel-hide-buttons"));
      });
    }, 4000);
  });
};
$JSCompiler_prototypeAlias$$.updateButtonTitles = function() {
  this.$nextButton_$.title = this.getNextButtonTitle();
  this.$prevButton_$.title = this.getPrevButtonTitle();
};
$JSCompiler_prototypeAlias$$.getNextButtonTitle = function() {
  return this.element.getAttribute("data-next-button-aria-label") || "Next item in carousel";
};
$JSCompiler_prototypeAlias$$.getPrevButtonTitle = function() {
  return this.element.getAttribute("data-prev-button-aria-label") || "Previous item in carousel";
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.hasPrev = function() {
};
$JSCompiler_prototypeAlias$$.hasNext = function() {
};
$JSCompiler_prototypeAlias$$.interactionNext = function() {
  this.$nextButton_$.classList.contains("amp-disabled") || this.go(1, !0, !1);
};
$JSCompiler_prototypeAlias$$.interactionPrev = function() {
  this.$prevButton_$.classList.contains("amp-disabled") || this.go(-1, !0, !1);
};
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $getVendorJsPropertyName$$module$src$style$$($style$jscomp$1$$, $camelCase$jscomp$1$$) {
  if ($startsWith$$module$src$string$$($camelCase$jscomp$1$$, "--")) {
    return $camelCase$jscomp$1$$;
  }
  $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
  var $propertyName$jscomp$9$$ = $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$];
  if (!$propertyName$jscomp$9$$) {
    $propertyName$jscomp$9$$ = $camelCase$jscomp$1$$;
    if (void 0 === $style$jscomp$1$$[$camelCase$jscomp$1$$]) {
      var $JSCompiler_inline_result$jscomp$31_JSCompiler_inline_result$jscomp$32$$ = $camelCase$jscomp$1$$.charAt(0).toUpperCase() + $camelCase$jscomp$1$$.slice(1);
      a: {
        for (var $JSCompiler_i$jscomp$inline_81$$ = 0; $JSCompiler_i$jscomp$inline_81$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_81$$++) {
          var $JSCompiler_propertyName$jscomp$inline_82$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_81$$] + $JSCompiler_inline_result$jscomp$31_JSCompiler_inline_result$jscomp$32$$;
          if (void 0 !== $style$jscomp$1$$[$JSCompiler_propertyName$jscomp$inline_82$$]) {
            $JSCompiler_inline_result$jscomp$31_JSCompiler_inline_result$jscomp$32$$ = $JSCompiler_propertyName$jscomp$inline_82$$;
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$31_JSCompiler_inline_result$jscomp$32$$ = "";
      }
      var $prefixedPropertyName$$ = $JSCompiler_inline_result$jscomp$31_JSCompiler_inline_result$jscomp$32$$;
      void 0 !== $style$jscomp$1$$[$prefixedPropertyName$$] && ($propertyName$jscomp$9$$ = $prefixedPropertyName$$);
    }
    $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$] = $propertyName$jscomp$9$$;
  }
  return $propertyName$jscomp$9$$;
}
function $setStyle$$module$src$style$$($element$jscomp$65$$, $value$jscomp$98$$) {
  var $propertyName$jscomp$10$$ = $getVendorJsPropertyName$$module$src$style$$($element$jscomp$65$$.style, "order");
  $propertyName$jscomp$10$$ && ($startsWith$$module$src$string$$($propertyName$jscomp$10$$, "--") ? $element$jscomp$65$$.style.setProperty($propertyName$jscomp$10$$, $value$jscomp$98$$) : $element$jscomp$65$$.style[$propertyName$jscomp$10$$] = $value$jscomp$98$$);
}
function $getStyle$$module$src$style$$($element$jscomp$66$$) {
  var $propertyName$jscomp$11$$ = $getVendorJsPropertyName$$module$src$style$$($element$jscomp$66$$.style, "scrollSnapType");
  if ($propertyName$jscomp$11$$) {
    return $startsWith$$module$src$string$$($propertyName$jscomp$11$$, "--") ? $element$jscomp$66$$.style.getPropertyValue($propertyName$jscomp$11$$) : $element$jscomp$66$$.style[$propertyName$jscomp$11$$];
  }
}
;var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$73$$, $eventType$jscomp$3$$, $listener$jscomp$64$$) {
  var $opt_evtListenerOpts$$ = {passive:!0}, $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$(), $capture$$ = !1;
  $opt_evtListenerOpts$$ && ($capture$$ = $opt_evtListenerOpts$$.capture);
  $element$jscomp$73$$.addEventListener($eventType$jscomp$3$$, function($element$jscomp$73$$) {
    try {
      return $listener$jscomp$64$$($element$jscomp$73$$);
    } catch ($e$jscomp$20$$) {
      throw self.__AMP_REPORT_ERROR($e$jscomp$20$$), $e$jscomp$20$$;
    }
  }, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$$);
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
;function $listen$$module$src$event_helper$$($element$jscomp$74$$, $eventType$jscomp$4$$, $listener$jscomp$65$$) {
  $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$74$$, $eventType$jscomp$4$$, $listener$jscomp$65$$);
}
;function $numeric$$module$src$transition$$($start$jscomp$12$$, $end$jscomp$7$$) {
  return function($time$jscomp$5$$) {
    return $start$jscomp$12$$ + ($end$jscomp$7$$ - $start$jscomp$12$$) * $time$jscomp$5$$;
  };
}
;function $AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$($$jscomp$super$this$jscomp$1_element$jscomp$78$$) {
  $$jscomp$super$this$jscomp$1_element$jscomp$78$$ = $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$.call(this, $$jscomp$super$this$jscomp$1_element$jscomp$78$$) || this;
  $$jscomp$super$this$jscomp$1_element$jscomp$78$$.$pos_$ = 0;
  $$jscomp$super$this$jscomp$1_element$jscomp$78$$.$oldPos_$ = 0;
  $$jscomp$super$this$jscomp$1_element$jscomp$78$$.$cells_$ = null;
  $$jscomp$super$this$jscomp$1_element$jscomp$78$$.$container_$ = null;
  $$jscomp$super$this$jscomp$1_element$jscomp$78$$.$scrollTimerId_$ = null;
  return $$jscomp$super$this$jscomp$1_element$jscomp$78$$;
}
$$jscomp$inherits$$($AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$, $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$);
$JSCompiler_prototypeAlias$$ = $AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$.prototype;
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.buildCarousel = function() {
  var $$jscomp$this$jscomp$4$$ = this;
  this.$cells_$ = this.getRealChildren();
  this.$container_$ = this.element.ownerDocument.createElement("div");
  this.$container_$.classList.add("i-amphtml-scrollable-carousel-container");
  this.$container_$.setAttribute("tabindex", "-1");
  this.element.appendChild(this.$container_$);
  this.$cells_$.forEach(function($cell$$) {
    $getServiceForDoc$$module$src$service$$($$jscomp$this$jscomp$4$$.element).setOwner($cell$$, $$jscomp$this$jscomp$4$$.element);
    $cell$$.classList.add("amp-carousel-slide");
    $cell$$.classList.add("amp-scrollable-carousel-slide");
    $$jscomp$this$jscomp$4$$.$container_$.appendChild($cell$$);
  });
  this.$cancelTouchEvents_$();
  this.$container_$.addEventListener("scroll", this.$scrollHandler_$.bind(this));
  this.$container_$.addEventListener("keydown", this.$keydownHandler_$.bind(this));
  this.registerAction("goToSlide", function($invocation$$) {
    var $args$jscomp$3_index$jscomp$78$$ = $invocation$$.args;
    $args$jscomp$3_index$jscomp$78$$ && ($args$jscomp$3_index$jscomp$78$$ = parseInt($args$jscomp$3_index$jscomp$78$$.index, 10), $JSCompiler_StaticMethods_goToSlide_$$($$jscomp$this$jscomp$4$$, $args$jscomp$3_index$jscomp$78$$));
  }, 1);
  $getExistingServiceForDocInEmbedScope$$module$src$service$$(this.element).addToAllowlist("amp-carousel", "goToSlide", ["email"]);
};
$JSCompiler_prototypeAlias$$.buttonsAriaRole = function() {
  return "presentation";
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  $JSCompiler_StaticMethods_doLayout_$$(this, this.$pos_$);
  $JSCompiler_StaticMethods_preloadNext_$$(this, this.$pos_$, 1);
  this.setControlsState();
  return $resolvedPromise$$module$src$resolved_promise$$();
};
$JSCompiler_prototypeAlias$$.onViewportCallback = function() {
  $JSCompiler_StaticMethods_updateInViewport_$$(this, this.$pos_$, this.$pos_$);
};
$JSCompiler_prototypeAlias$$.goCallback = function($dir$jscomp$3$$, $animate$jscomp$1$$) {
  var $$jscomp$this$jscomp$5$$ = this, $newPos$$ = $JSCompiler_StaticMethods_nextPos_$$(this, this.$pos_$, $dir$jscomp$3$$), $oldPos$$ = this.$pos_$;
  if ($newPos$$ != $oldPos$$) {
    if ($animate$jscomp$1$$) {
      var $interpolate$$ = $numeric$$module$src$transition$$($oldPos$$, $newPos$$);
      $Animation$$module$src$animation$animate$$(this.element, function($dir$jscomp$3$$) {
        $$jscomp$this$jscomp$5$$.$container_$.scrollLeft = $interpolate$$($dir$jscomp$3$$);
      }, 200, "ease-in-out").thenAlways(function() {
        $JSCompiler_StaticMethods_commitSwitch_$$($$jscomp$this$jscomp$5$$, $newPos$$);
      });
    } else {
      $JSCompiler_StaticMethods_commitSwitch_$$(this, $newPos$$), this.$container_$.scrollLeft = $newPos$$;
    }
  }
};
function $JSCompiler_StaticMethods_goToSlide_$$($JSCompiler_StaticMethods_goToSlide_$self$$, $index$jscomp$79$$) {
  var $noOfSlides$$ = $JSCompiler_StaticMethods_goToSlide_$self$$.$cells_$.length;
  if (!isFinite($index$jscomp$79$$) || 0 > $index$jscomp$79$$ || $index$jscomp$79$$ >= $noOfSlides$$) {
    $JSCompiler_StaticMethods_goToSlide_$self$$.user().error("amp-scrollable-carousel", "Invalid [slide] value: %s", $index$jscomp$79$$), $resolvedPromise$$module$src$resolved_promise$$();
  } else {
    var $oldPos$jscomp$1$$ = $JSCompiler_StaticMethods_goToSlide_$self$$.$pos_$, $newPos$jscomp$1$$ = $oldPos$jscomp$1$$;
    $JSCompiler_StaticMethods_goToSlide_$self$$.measureMutateElement(function() {
      $newPos$jscomp$1$$ = $JSCompiler_StaticMethods_goToSlide_$self$$.$cells_$[$index$jscomp$79$$].offsetLeft - ($JSCompiler_StaticMethods_goToSlide_$self$$.element.offsetWidth - $JSCompiler_StaticMethods_goToSlide_$self$$.$cells_$[$index$jscomp$79$$].offsetWidth) / 2;
    }, function() {
      if ($newPos$jscomp$1$$ != $oldPos$jscomp$1$$) {
        var $index$jscomp$79$$ = $numeric$$module$src$transition$$($oldPos$jscomp$1$$, $newPos$jscomp$1$$);
        $Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_goToSlide_$self$$.element, function($noOfSlides$$) {
          $JSCompiler_StaticMethods_goToSlide_$self$$.$container_$.scrollLeft = $index$jscomp$79$$($noOfSlides$$);
        }, 200, "ease-in-out").thenAlways(function() {
          $JSCompiler_StaticMethods_commitSwitch_$$($JSCompiler_StaticMethods_goToSlide_$self$$, $newPos$jscomp$1$$);
        });
      }
    });
  }
}
$JSCompiler_prototypeAlias$$.$scrollHandler_$ = function() {
  var $currentScrollLeft$$ = this.$container_$.scrollLeft;
  this.$pos_$ = $currentScrollLeft$$;
  null === this.$scrollTimerId_$ && $JSCompiler_StaticMethods_waitForScroll_$$(this, $currentScrollLeft$$);
};
$JSCompiler_prototypeAlias$$.$keydownHandler_$ = function($event$jscomp$10$$) {
  var $key$jscomp$51$$ = $event$jscomp$10$$.key;
  "ArrowLeft" != $key$jscomp$51$$ && "ArrowRight" != $key$jscomp$51$$ || $event$jscomp$10$$.stopPropagation();
};
function $JSCompiler_StaticMethods_waitForScroll_$$($JSCompiler_StaticMethods_waitForScroll_$self$$, $startingScrollLeft$$) {
  $JSCompiler_StaticMethods_waitForScroll_$self$$.$scrollTimerId_$ = $Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_waitForScroll_$self$$.win).delay(function() {
    30 > Math.abs($startingScrollLeft$$ - $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$) ? ($dev$$module$src$log$$().fine("amp-scrollable-carousel", "slow scrolling: %s - %s", $startingScrollLeft$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$), $JSCompiler_StaticMethods_waitForScroll_$self$$.$scrollTimerId_$ = null, $JSCompiler_StaticMethods_commitSwitch_$$($JSCompiler_StaticMethods_waitForScroll_$self$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$)) : ($dev$$module$src$log$$().fine("amp-scrollable-carousel", 
    "fast scrolling: %s - %s", $startingScrollLeft$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$), $JSCompiler_StaticMethods_waitForScroll_$$($JSCompiler_StaticMethods_waitForScroll_$self$$, $JSCompiler_StaticMethods_waitForScroll_$self$$.$pos_$));
  }, 100);
}
function $JSCompiler_StaticMethods_commitSwitch_$$($JSCompiler_StaticMethods_commitSwitch_$self$$, $pos$jscomp$3$$) {
  $JSCompiler_StaticMethods_updateInViewport_$$($JSCompiler_StaticMethods_commitSwitch_$self$$, $pos$jscomp$3$$, $JSCompiler_StaticMethods_commitSwitch_$self$$.$oldPos_$);
  $JSCompiler_StaticMethods_doLayout_$$($JSCompiler_StaticMethods_commitSwitch_$self$$, $pos$jscomp$3$$);
  $JSCompiler_StaticMethods_preloadNext_$$($JSCompiler_StaticMethods_commitSwitch_$self$$, $pos$jscomp$3$$, Math.sign($pos$jscomp$3$$ - $JSCompiler_StaticMethods_commitSwitch_$self$$.$oldPos_$));
  $JSCompiler_StaticMethods_commitSwitch_$self$$.$oldPos_$ = $pos$jscomp$3$$;
  $JSCompiler_StaticMethods_commitSwitch_$self$$.$pos_$ = $pos$jscomp$3$$;
  $JSCompiler_StaticMethods_commitSwitch_$self$$.setControlsState();
}
function $JSCompiler_StaticMethods_nextPos_$$($JSCompiler_StaticMethods_nextPos_$self_newPos$jscomp$2$$, $pos$jscomp$4$$, $dir$jscomp$4$$) {
  var $containerWidth$jscomp$1$$ = $JSCompiler_StaticMethods_nextPos_$self_newPos$jscomp$2$$.element.offsetWidth, $fullWidth$$ = $JSCompiler_StaticMethods_nextPos_$self_newPos$jscomp$2$$.$container_$.scrollWidth;
  $JSCompiler_StaticMethods_nextPos_$self_newPos$jscomp$2$$ = $pos$jscomp$4$$ + $dir$jscomp$4$$ * $containerWidth$jscomp$1$$;
  return 0 > $JSCompiler_StaticMethods_nextPos_$self_newPos$jscomp$2$$ ? 0 : $fullWidth$$ >= $containerWidth$jscomp$1$$ && $JSCompiler_StaticMethods_nextPos_$self_newPos$jscomp$2$$ > $fullWidth$$ - $containerWidth$jscomp$1$$ ? $fullWidth$$ - $containerWidth$jscomp$1$$ : $JSCompiler_StaticMethods_nextPos_$self_newPos$jscomp$2$$;
}
function $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_withinWindow_$self$$, $pos$jscomp$5$$, $callback$jscomp$60$$) {
  for (var $containerWidth$jscomp$2$$ = $JSCompiler_StaticMethods_withinWindow_$self$$.element.getLayoutWidth(), $i$jscomp$30$$ = 0; $i$jscomp$30$$ < $JSCompiler_StaticMethods_withinWindow_$self$$.$cells_$.length; $i$jscomp$30$$++) {
    var $cell$jscomp$1$$ = $JSCompiler_StaticMethods_withinWindow_$self$$.$cells_$[$i$jscomp$30$$];
    $cell$jscomp$1$$.offsetLeft + $cell$jscomp$1$$.offsetWidth >= $pos$jscomp$5$$ && $cell$jscomp$1$$.offsetLeft <= $pos$jscomp$5$$ + $containerWidth$jscomp$2$$ && $callback$jscomp$60$$($cell$jscomp$1$$);
  }
}
function $JSCompiler_StaticMethods_doLayout_$$($JSCompiler_StaticMethods_doLayout_$self$$, $pos$jscomp$6$$) {
  $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_doLayout_$self$$, $pos$jscomp$6$$, function($pos$jscomp$6$$) {
    $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_doLayout_$self$$.element).scheduleLayout($JSCompiler_StaticMethods_doLayout_$self$$.element, $pos$jscomp$6$$);
  });
}
function $JSCompiler_StaticMethods_preloadNext_$$($JSCompiler_StaticMethods_preloadNext_$self$$, $pos$jscomp$7$$, $dir$jscomp$5$$) {
  var $nextPos$$ = $JSCompiler_StaticMethods_nextPos_$$($JSCompiler_StaticMethods_preloadNext_$self$$, $pos$jscomp$7$$, $dir$jscomp$5$$);
  $nextPos$$ != $pos$jscomp$7$$ && $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_preloadNext_$self$$, $nextPos$$, function($pos$jscomp$7$$) {
    $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_preloadNext_$self$$.element).schedulePreload($JSCompiler_StaticMethods_preloadNext_$self$$.element, $pos$jscomp$7$$);
  });
}
function $JSCompiler_StaticMethods_updateInViewport_$$($JSCompiler_StaticMethods_updateInViewport_$self$$, $newPos$jscomp$3$$, $oldPos$jscomp$2$$) {
  var $seen$jscomp$1$$ = [];
  $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_updateInViewport_$self$$, $newPos$jscomp$3$$, function($newPos$jscomp$3$$) {
    $seen$jscomp$1$$.push($newPos$jscomp$3$$);
    $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_updateInViewport_$self$$.element).updateInViewport($JSCompiler_StaticMethods_updateInViewport_$self$$.element, $newPos$jscomp$3$$, !0);
  });
  $oldPos$jscomp$2$$ != $newPos$jscomp$3$$ && $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_updateInViewport_$self$$, $oldPos$jscomp$2$$, function($newPos$jscomp$3$$) {
    if (!$seen$jscomp$1$$.includes($newPos$jscomp$3$$)) {
      var $oldPos$jscomp$2$$ = $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_updateInViewport_$self$$.element);
      $oldPos$jscomp$2$$.updateInViewport($JSCompiler_StaticMethods_updateInViewport_$self$$.element, $newPos$jscomp$3$$, !1);
      $oldPos$jscomp$2$$.schedulePause($JSCompiler_StaticMethods_updateInViewport_$self$$.element, $newPos$jscomp$3$$);
    }
  });
}
$JSCompiler_prototypeAlias$$.hasPrev = function() {
  return 0 != this.$pos_$;
};
$JSCompiler_prototypeAlias$$.hasNext = function() {
  var $containerWidth$jscomp$3$$ = this.element.getLayoutWidth();
  return this.$pos_$ != Math.max(this.$container_$.scrollWidth - $containerWidth$jscomp$3$$, 0);
};
$JSCompiler_prototypeAlias$$.$cancelTouchEvents_$ = function() {
  $listen$$module$src$event_helper$$(this.element, "touchmove", function($event$jscomp$11$$) {
    return $event$jscomp$11$$.stopPropagation();
  });
};
function $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$($$jscomp$super$this$jscomp$2_element$jscomp$79$$) {
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$ = $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$.call(this, $$jscomp$super$this$jscomp$2_element$jscomp$79$$) || this;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$autoplayTimeoutId_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$hasLoop_$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$loopAdded_$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$hasAutoplay_$ = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$autoplayDelay_$ = 5000;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$autoplayLoops_$ = null;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$loopsMade_$ = 0;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.shouldLoop = !1;
  $$jscomp$super$this$jscomp$2_element$jscomp$79$$.$shouldAutoplay_$ = !1;
  return $$jscomp$super$this$jscomp$2_element$jscomp$79$$;
}
$$jscomp$inherits$$($BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$, $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$);
$JSCompiler_prototypeAlias$$ = $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype;
$JSCompiler_prototypeAlias$$.buildCarousel = function() {
  var $$jscomp$this$jscomp$11$$ = this;
  this.$hasLoop_$ = this.element.hasAttribute("loop");
  this.$hasAutoplay_$ = this.element.hasAttribute("autoplay");
  var $autoplayVal$$ = this.element.getAttribute("autoplay");
  $autoplayVal$$ && (this.$autoplayLoops_$ = parseInt($autoplayVal$$, 10), $userAssert$$module$src$log$$($isFiniteNumber$$module$src$types$$(this.$autoplayLoops_$)));
  this.buildSlides();
  this.shouldLoop = this.$hasLoop_$ && this.isLoopingEligible();
  (this.$shouldAutoplay_$ = this.$hasAutoplay_$ && this.isLoopingEligible()) && 0 != this.$autoplayLoops_$ && $JSCompiler_StaticMethods_setupAutoplay_$$(this);
  this.registerAction("toggleAutoplay", function($autoplayVal$$) {
    ($autoplayVal$$ = $autoplayVal$$.args) && void 0 !== $autoplayVal$$.toggleOn ? $JSCompiler_StaticMethods_toggleAutoplay_$$($$jscomp$this$jscomp$11$$, $autoplayVal$$.toggleOn) : $JSCompiler_StaticMethods_toggleAutoplay_$$($$jscomp$this$jscomp$11$$, !$$jscomp$this$jscomp$11$$.$hasAutoplay_$);
  }, 1);
};
$JSCompiler_prototypeAlias$$.buildSlides = function() {
};
$JSCompiler_prototypeAlias$$.onViewportCallback = function($inViewport$jscomp$1$$) {
  this.updateViewportState($inViewport$jscomp$1$$);
  $inViewport$jscomp$1$$ ? $JSCompiler_StaticMethods_autoplay_$$(this) : this.clearAutoplay();
};
$JSCompiler_prototypeAlias$$.goCallback = function($dir$jscomp$6$$, $animate$jscomp$2$$, $opt_autoplay$jscomp$2$$) {
  this.moveSlide($dir$jscomp$6$$, $animate$jscomp$2$$, $opt_autoplay$jscomp$2$$ ? 1 : 3);
  $opt_autoplay$jscomp$2$$ ? $JSCompiler_StaticMethods_autoplay_$$(this) : this.clearAutoplay();
};
$JSCompiler_prototypeAlias$$.moveSlide = function() {
};
$JSCompiler_prototypeAlias$$.updateViewportState = function() {
};
$JSCompiler_prototypeAlias$$.isLoopingEligible = function() {
  return !1;
};
function $JSCompiler_StaticMethods_setupAutoplay_$$($JSCompiler_StaticMethods_setupAutoplay_$self$$) {
  var $delayValue$$ = Number($JSCompiler_StaticMethods_setupAutoplay_$self$$.element.getAttribute("delay"));
  0 < $delayValue$$ && ($JSCompiler_StaticMethods_setupAutoplay_$self$$.$autoplayDelay_$ = Math.max(1000, $delayValue$$));
  $JSCompiler_StaticMethods_setupAutoplay_$self$$.$hasLoop_$ || ($JSCompiler_StaticMethods_setupAutoplay_$self$$.element.setAttribute("loop", ""), $JSCompiler_StaticMethods_setupAutoplay_$self$$.$loopAdded_$ = !0, $JSCompiler_StaticMethods_setupAutoplay_$self$$.$hasLoop_$ = !0, $JSCompiler_StaticMethods_setupAutoplay_$self$$.shouldLoop = !0);
}
function $JSCompiler_StaticMethods_autoplay_$$($JSCompiler_StaticMethods_autoplay_$self$$) {
  $JSCompiler_StaticMethods_autoplay_$self$$.$shouldAutoplay_$ && 0 != $JSCompiler_StaticMethods_autoplay_$self$$.$autoplayLoops_$ && ($JSCompiler_StaticMethods_autoplay_$self$$.clearAutoplay(), $JSCompiler_StaticMethods_autoplay_$self$$.$autoplayTimeoutId_$ = $Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_autoplay_$self$$.win).delay($JSCompiler_StaticMethods_autoplay_$self$$.go.bind($JSCompiler_StaticMethods_autoplay_$self$$, 1, !0, !0), $JSCompiler_StaticMethods_autoplay_$self$$.$autoplayDelay_$));
}
function $JSCompiler_StaticMethods_toggleAutoplay_$$($JSCompiler_StaticMethods_toggleAutoplay_$self$$, $toggleOn$$) {
  if ($toggleOn$$ != $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$) {
    var $prevAutoplayStatus$$ = $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$;
    $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$hasAutoplay_$ = $toggleOn$$;
    $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$ = $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$hasAutoplay_$ && $JSCompiler_StaticMethods_toggleAutoplay_$self$$.isLoopingEligible();
    !$prevAutoplayStatus$$ && $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$ && $JSCompiler_StaticMethods_setupAutoplay_$$($JSCompiler_StaticMethods_toggleAutoplay_$self$$);
    $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$ ? $JSCompiler_StaticMethods_autoplay_$$($JSCompiler_StaticMethods_toggleAutoplay_$self$$) : $JSCompiler_StaticMethods_toggleAutoplay_$self$$.clearAutoplay();
  }
}
$JSCompiler_prototypeAlias$$.clearAutoplay = function() {
  null !== this.$autoplayTimeoutId_$ && ($Services$$module$src$services$timerFor$$(this.win).cancel(this.$autoplayTimeoutId_$), this.$autoplayTimeoutId_$ = null);
};
$JSCompiler_prototypeAlias$$.removeAutoplay = function() {
  this.clearAutoplay();
  this.$loopAdded_$ && (this.element.removeAttribute("loop"), this.shouldLoop = this.$hasLoop_$ = this.$loopAdded_$ = !1);
  this.$shouldAutoplay_$ = this.$hasAutoplay_$ = !1;
};
function $triggerAnalyticsEvent$$module$src$analytics$$($target$jscomp$99$$, $eventType$jscomp$7$$, $vars$$) {
  $vars$$ = void 0 === $vars$$ ? {} : $vars$$;
  var $enableDataVars$$ = void 0 === $enableDataVars$$ ? !0 : $enableDataVars$$;
  $getElementServiceIfAvailableForDoc$$module$src$element_service$$($target$jscomp$99$$).then(function($analytics$$) {
    $analytics$$ && $analytics$$.triggerEventForTarget($target$jscomp$99$$, $eventType$jscomp$7$$, $vars$$, $enableDataVars$$);
  });
}
;function $AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$($$jscomp$super$this$jscomp$3_element$jscomp$80$$) {
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$ = $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.call(this, $$jscomp$super$this$jscomp$3_element$jscomp$80$$) || this;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$vsync_$ = null;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$hasNativeSnapPoints_$ = !1;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$slides_$ = [];
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$noOfSlides_$ = 0;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$slidesContainer_$ = null;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$slideWrappers_$ = [];
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$snappingInProgress_$ = !1;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$scrollTimeout_$ = null;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$isTouching_$ = !1;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$elasticScrollState_$ = 0;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$slideIndex_$ = null;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$initialSlideIndex_$ = 0;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$slideWidth_$ = 0;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$previousScrollLeft_$ = 0;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$dataSlideIdArr_$ = [];
  var $platform$$ = $getService$$module$src$service$$($$jscomp$super$this$jscomp$3_element$jscomp$80$$.win, "platform");
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$isIos_$ = $platform$$.isIos();
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$action_$ = null;
  $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$shouldDisableCssSnap_$ = $startsWith$$module$src$string$$($getService$$module$src$service$$($$jscomp$super$this$jscomp$3_element$jscomp$80$$.win, "platform").getIosVersionString(), "10.3") ? !0 : $$jscomp$super$this$jscomp$3_element$jscomp$80$$.$isIos_$ ? !1 : !$experimentToggles$$module$src$experiments$$($$jscomp$super$this$jscomp$3_element$jscomp$80$$.win)["amp-carousel-chrome-scroll-snap"];
  return $$jscomp$super$this$jscomp$3_element$jscomp$80$$;
}
$$jscomp$inherits$$($AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$, $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$);
$JSCompiler_prototypeAlias$$ = $AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$.prototype;
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$5$$) {
  return "fixed" == $layout$jscomp$5$$ || "fixed-height" == $layout$jscomp$5$$ || "responsive" == $layout$jscomp$5$$ || "fill" == $layout$jscomp$5$$ || "flex-item" == $layout$jscomp$5$$ || "fluid" == $layout$jscomp$5$$ || "intrinsic" == $layout$jscomp$5$$;
};
$JSCompiler_prototypeAlias$$.buildSlides = function() {
  var $$jscomp$this$jscomp$12$$ = this;
  this.$vsync_$ = this.getVsync();
  this.$action_$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$(this.element);
  this.$action_$.addToAllowlist("AMP-CAROUSEL", "goToSlide", ["email"]);
  this.$hasNativeSnapPoints_$ = void 0 != $getStyle$$module$src$style$$(this.element);
  this.$shouldDisableCssSnap_$ && (this.$hasNativeSnapPoints_$ = !1);
  this.element.classList.add("i-amphtml-slidescroll");
  this.$slides_$ = this.getRealChildren();
  this.$noOfSlides_$ = this.$slides_$.length;
  this.$slidesContainer_$ = this.win.document.createElement("div");
  this.$slidesContainer_$.setAttribute("tabindex", "-1");
  this.$slidesContainer_$.classList.add("i-amphtml-slides-container");
  this.$slidesContainer_$.setAttribute("aria-live", "polite");
  this.$shouldDisableCssSnap_$ && this.$slidesContainer_$.classList.add("i-amphtml-slidescroll-no-snap");
  if (this.$hasNativeSnapPoints_$) {
    var $end$jscomp$9_start$jscomp$14$$ = this.win.document.createElement("div");
    $end$jscomp$9_start$jscomp$14$$.classList.add("i-amphtml-carousel-start-marker");
    this.$slidesContainer_$.appendChild($end$jscomp$9_start$jscomp$14$$);
    $end$jscomp$9_start$jscomp$14$$ = this.win.document.createElement("div");
    $end$jscomp$9_start$jscomp$14$$.classList.add("i-amphtml-carousel-end-marker");
    this.$slidesContainer_$.appendChild($end$jscomp$9_start$jscomp$14$$);
  }
  this.element.appendChild(this.$slidesContainer_$);
  this.$slides_$.forEach(function($end$jscomp$9_start$jscomp$14$$, $index$jscomp$81$$) {
    $$jscomp$this$jscomp$12$$.$dataSlideIdArr_$.push($end$jscomp$9_start$jscomp$14$$.getAttribute("data-slide-id") || $index$jscomp$81$$.toString());
    $getServiceForDoc$$module$src$service$$($$jscomp$this$jscomp$12$$.element).setOwner($end$jscomp$9_start$jscomp$14$$, $$jscomp$this$jscomp$12$$.element);
    $end$jscomp$9_start$jscomp$14$$.classList.add("amp-carousel-slide");
    var $slide$$ = $$jscomp$this$jscomp$12$$.win.document.createElement("div");
    $slide$$.classList.add("i-amphtml-slide-item");
    $$jscomp$this$jscomp$12$$.$slidesContainer_$.appendChild($slide$$);
    $slide$$.appendChild($end$jscomp$9_start$jscomp$14$$);
    $$jscomp$this$jscomp$12$$.$slideWrappers_$.push($slide$$);
  });
  this.$cancelTouchEvents_$();
  this.$slidesContainer_$.addEventListener("scroll", this.$scrollHandler_$.bind(this));
  this.$slidesContainer_$.addEventListener("keydown", this.$keydownHandler_$.bind(this));
  $listen$$module$src$event_helper$$(this.$slidesContainer_$, "touchmove", this.$touchMoveHandler_$.bind(this));
  $listen$$module$src$event_helper$$(this.$slidesContainer_$, "touchend", this.$touchEndHandler_$.bind(this));
  this.registerAction("goToSlide", function($end$jscomp$9_start$jscomp$14$$) {
    ($end$jscomp$9_start$jscomp$14$$ = $end$jscomp$9_start$jscomp$14$$.args) && $$jscomp$this$jscomp$12$$.goToSlide($end$jscomp$9_start$jscomp$14$$.index, 3);
  }, 1);
};
$JSCompiler_prototypeAlias$$.isLoopingEligible = function() {
  return 1 < this.$noOfSlides_$;
};
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$$) {
  var $slide$jscomp$1$$ = $mutations$$.slide;
  void 0 !== $slide$jscomp$1$$ && this.goToSlide($slide$jscomp$1$$, 3);
};
$JSCompiler_prototypeAlias$$.$touchMoveHandler_$ = function() {
  this.clearAutoplay();
  this.$isTouching_$ = !0;
};
function $JSCompiler_StaticMethods_waitForScrollSettled_$$($JSCompiler_StaticMethods_waitForScrollSettled_$self$$, $timeout$jscomp$3$$) {
  $JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$scrollTimeout_$ && $Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_waitForScrollSettled_$self$$.win).cancel($JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$scrollTimeout_$);
  $JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$scrollTimeout_$ = $Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_waitForScrollSettled_$self$$.win).delay(function() {
    $JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$scrollTimeout_$ = null;
    if (!$JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$snappingInProgress_$ && !$JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$isTouching_$) {
      var $timeout$jscomp$3$$ = $JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$slidesContainer_$.scrollLeft;
      $JSCompiler_StaticMethods_waitForScrollSettled_$self$$.$hasNativeSnapPoints_$ ? $JSCompiler_StaticMethods_updateOnScroll_$$($JSCompiler_StaticMethods_waitForScrollSettled_$self$$, $timeout$jscomp$3$$, 1) : $JSCompiler_StaticMethods_customSnap_$$($JSCompiler_StaticMethods_waitForScrollSettled_$self$$, $timeout$jscomp$3$$, void 0, 1);
    }
  }, $timeout$jscomp$3$$);
}
$JSCompiler_prototypeAlias$$.$touchEndHandler_$ = function() {
  var $timeout$jscomp$4$$ = this.$shouldDisableCssSnap_$ ? 45 : 100;
  this.$isTouching_$ = !1;
  $JSCompiler_StaticMethods_waitForScrollSettled_$$(this, $timeout$jscomp$4$$);
};
$JSCompiler_prototypeAlias$$.onLayoutMeasure = function() {
  this.$slideWidth_$ = this.element.getLayoutWidth();
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  if ($closestAncestorElementBySelector$$module$src$dom$$(this.element)) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  if (null === this.$slideIndex_$) {
    $JSCompiler_StaticMethods_showSlide_$$(this, this.$initialSlideIndex_$);
  } else {
    var $index$jscomp$82$$ = $user$$module$src$log$$().assertNumber(this.$slideIndex_$, "E#19457 this.slideIndex_"), $scrollLeft$$ = $JSCompiler_StaticMethods_getScrollLeftForIndex_$$(this, $index$jscomp$82$$);
    $getServiceForDoc$$module$src$service$$(this.element).scheduleLayout(this.element, this.$slides_$[$index$jscomp$82$$]);
    this.$previousScrollLeft_$ = this.$slidesContainer_$.scrollLeft = $scrollLeft$$;
  }
  return $resolvedPromise$$module$src$resolved_promise$$();
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  this.$slideIndex_$ = null;
  return $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype.unlayoutCallback.call(this);
};
$JSCompiler_prototypeAlias$$.updateViewportState = function($inViewport$jscomp$2$$) {
  null !== this.$slideIndex_$ && $getServiceForDoc$$module$src$service$$(this.element).updateInViewport(this.element, this.$slides_$[$user$$module$src$log$$().assertNumber(this.$slideIndex_$, "E#19457 this.slideIndex_")], $inViewport$jscomp$2$$);
};
$JSCompiler_prototypeAlias$$.hasPrev = function() {
  return this.shouldLoop || 0 < this.$slideIndex_$;
};
$JSCompiler_prototypeAlias$$.hasNext = function() {
  return this.shouldLoop || this.$slideIndex_$ < this.$slides_$.length - 1;
};
$JSCompiler_prototypeAlias$$.moveSlide = function($dir$jscomp$7$$, $animate$jscomp$3$$, $trust$jscomp$1$$) {
  if (null !== this.$slideIndex_$) {
    var $hasNext$$ = this.hasNext(), $hasPrev$$ = this.hasPrev();
    if (1 == $dir$jscomp$7$$ && $hasNext$$ || -1 == $dir$jscomp$7$$ && $hasPrev$$) {
      var $newIndex$$ = this.$slideIndex_$ + $dir$jscomp$7$$;
      -1 == $newIndex$$ ? $newIndex$$ = this.$noOfSlides_$ - 1 : $newIndex$$ >= this.$noOfSlides_$ && ($newIndex$$ = 0);
      $animate$jscomp$3$$ ? $JSCompiler_StaticMethods_customSnap_$$(this, 1 != $dir$jscomp$7$$ || $hasPrev$$ ? this.$slideWidth_$ : 0, $dir$jscomp$7$$, $trust$jscomp$1$$) : $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$(this, $newIndex$$, $trust$jscomp$1$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.$scrollHandler_$ = function() {
  var $currentScrollLeft$jscomp$3$$ = this.$slidesContainer_$.scrollLeft;
  this.$isIos_$ || $JSCompiler_StaticMethods_handleCustomElasticScroll_$$(this, $currentScrollLeft$jscomp$3$$);
  $JSCompiler_StaticMethods_waitForScrollSettled_$$(this, this.$hasNativeSnapPoints_$ ? 200 : this.$isIos_$ ? 45 : 100);
  this.$previousScrollLeft_$ = $currentScrollLeft$jscomp$3$$;
};
$JSCompiler_prototypeAlias$$.$keydownHandler_$ = function($event$jscomp$12$$) {
  var $key$jscomp$52$$ = $event$jscomp$12$$.key;
  "ArrowLeft" != $key$jscomp$52$$ && "ArrowRight" != $key$jscomp$52$$ || $event$jscomp$12$$.stopPropagation();
};
function $JSCompiler_StaticMethods_handleCustomElasticScroll_$$($JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$, $currentScrollLeft$jscomp$4$$) {
  var $scrollWidth$jscomp$1$$ = $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$slidesContainer_$.scrollWidth;
  -1 == $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ && $currentScrollLeft$jscomp$4$$ >= $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$previousScrollLeft_$ ? $JSCompiler_StaticMethods_customSnap_$$($JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$, $currentScrollLeft$jscomp$4$$).then(function() {
    $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ = 0;
  }) : 1 == $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ && $currentScrollLeft$jscomp$4$$ <= $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$previousScrollLeft_$ ? $JSCompiler_StaticMethods_customSnap_$$($JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$, $currentScrollLeft$jscomp$4$$).then(function() {
    $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ = 0;
  }) : $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ = 0 > $currentScrollLeft$jscomp$4$$ ? -1 : $currentScrollLeft$jscomp$4$$ + $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$slideWidth_$ > $scrollWidth$jscomp$1$$ ? 1 : 0;
}
function $JSCompiler_StaticMethods_customSnap_$$($JSCompiler_StaticMethods_customSnap_$self$$, $currentScrollLeft$jscomp$5$$, $opt_forceDir$$, $opt_trust$$) {
  $JSCompiler_StaticMethods_customSnap_$self$$.$snappingInProgress_$ = !0;
  var $diff$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$$($JSCompiler_StaticMethods_customSnap_$self$$, $currentScrollLeft$jscomp$5$$) - $JSCompiler_StaticMethods_customSnap_$self$$.$slideIndex_$, $hasPrev$jscomp$1$$ = $JSCompiler_StaticMethods_customSnap_$self$$.hasPrev(), $toScrollLeft$$ = $hasPrev$jscomp$1$$ ? $JSCompiler_StaticMethods_customSnap_$self$$.$slideWidth_$ : 0;
  0 != $diff$$ || 1 != $opt_forceDir$$ && -1 != $opt_forceDir$$ || ($diff$$ = $opt_forceDir$$);
  if (1 == $diff$$ || -1 != $diff$$ && $diff$$ == -1 * ($JSCompiler_StaticMethods_customSnap_$self$$.$noOfSlides_$ - 1)) {
    $toScrollLeft$$ = $hasPrev$jscomp$1$$ ? 2 * $JSCompiler_StaticMethods_customSnap_$self$$.$slideWidth_$ : $JSCompiler_StaticMethods_customSnap_$self$$.$slideWidth_$;
  } else {
    if (-1 == $diff$$ || $diff$$ == $JSCompiler_StaticMethods_customSnap_$self$$.$noOfSlides_$ - 1) {
      $toScrollLeft$$ = 0;
    }
  }
  return $JSCompiler_StaticMethods_animateScrollLeft_$$($JSCompiler_StaticMethods_customSnap_$self$$, $currentScrollLeft$jscomp$5$$, $toScrollLeft$$).then(function() {
    $JSCompiler_StaticMethods_updateOnScroll_$$($JSCompiler_StaticMethods_customSnap_$self$$, $toScrollLeft$$, $opt_trust$$);
  });
}
function $JSCompiler_StaticMethods_getNextSlideIndex_$$($JSCompiler_StaticMethods_getNextSlideIndex_$self$$, $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$) {
  var $scrolledSlideIndex$$ = Math.round($currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ / $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$slideWidth_$), $updateValue$$ = 0;
  $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.hasPrev();
  var $hasNext$jscomp$1$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.hasNext();
  $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ && $hasNext$jscomp$1$$ ? $updateValue$$ = $scrolledSlideIndex$$ - 1 : $hasNext$jscomp$1$$ ? $updateValue$$ = $scrolledSlideIndex$$ : $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ && ($updateValue$$ = $scrolledSlideIndex$$ - 1);
  $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$slideIndex_$ + $updateValue$$;
  return $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.shouldLoop ? 0 > $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ ? $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ - 1 : $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ >= $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ ? 0 : $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ : 0 > $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ ? 
  0 : $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$ >= $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ ? $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ - 1 : $currentScrollLeft$jscomp$6_hasPrev$jscomp$2_newIndex$jscomp$2$$;
}
function $JSCompiler_StaticMethods_getButtonTitleSuffix_$$($JSCompiler_StaticMethods_getButtonTitleSuffix_$self$$, $buttonIndex$$) {
  var $index$jscomp$83$$ = String($buttonIndex$$ + 1), $count$jscomp$40$$ = String($JSCompiler_StaticMethods_getButtonTitleSuffix_$self$$.$noOfSlides_$);
  return " " + ($JSCompiler_StaticMethods_getButtonTitleSuffix_$self$$.element.getAttribute("data-button-count-format") || "(%s of %s)").replace("%s", $index$jscomp$83$$).replace("%s", $count$jscomp$40$$);
}
$JSCompiler_prototypeAlias$$.getPrevButtonTitle = function() {
  var $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$ = this.$slideIndex_$;
  $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$ = 0 <= $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$ - 1 ? $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$ - 1 : this.shouldLoop ? this.$noOfSlides_$ - 1 : null;
  $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$ = null == $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$ ? 0 : $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$;
  return $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype.getPrevButtonTitle.call(this) + $JSCompiler_StaticMethods_getButtonTitleSuffix_$$(this, $JSCompiler_currentIndex$jscomp$inline_85_JSCompiler_inline_result$jscomp$34_index$jscomp$84$$);
};
$JSCompiler_prototypeAlias$$.getNextButtonTitle = function() {
  var $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$ = this.$slideIndex_$;
  $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$ = $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$ + 1 < this.$noOfSlides_$ ? $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$ + 1 : this.shouldLoop ? 0 : null;
  $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$ = null == $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$ ? this.$noOfSlides_$ - 1 : $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$;
  return $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype.getNextButtonTitle.call(this) + $JSCompiler_StaticMethods_getButtonTitleSuffix_$$(this, $JSCompiler_currentIndex$jscomp$inline_88_JSCompiler_inline_result$jscomp$35_index$jscomp$85$$);
};
function $JSCompiler_StaticMethods_updateOnScroll_$$($JSCompiler_StaticMethods_updateOnScroll_$self$$, $currentScrollLeft$jscomp$7$$, $opt_trust$jscomp$1$$) {
  if ($isFiniteNumber$$module$src$types$$($currentScrollLeft$jscomp$7$$) && null !== $JSCompiler_StaticMethods_updateOnScroll_$self$$.$slideIndex_$) {
    $JSCompiler_StaticMethods_updateOnScroll_$self$$.$snappingInProgress_$ = !0;
    var $newIndex$jscomp$3$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$$($JSCompiler_StaticMethods_updateOnScroll_$self$$, $currentScrollLeft$jscomp$7$$);
    $JSCompiler_StaticMethods_updateOnScroll_$self$$.$vsync_$.mutate(function() {
      $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$($JSCompiler_StaticMethods_updateOnScroll_$self$$, $newIndex$jscomp$3$$, $opt_trust$jscomp$1$$);
      $JSCompiler_StaticMethods_updateOnScroll_$self$$.$vsync_$.mutate(function() {
        $JSCompiler_StaticMethods_updateOnScroll_$self$$.$snappingInProgress_$ = !1;
      });
    });
  }
}
$JSCompiler_prototypeAlias$$.goToSlide = function($value$jscomp$105$$, $trust$jscomp$2$$) {
  var $index$jscomp$86$$ = parseInt($value$jscomp$105$$, 10);
  !isFinite($index$jscomp$86$$) || 0 > $index$jscomp$86$$ || $index$jscomp$86$$ >= this.$noOfSlides_$ ? this.user().error("AMP-CAROUSEL", "Invalid [slide] value: ", $value$jscomp$105$$) : null === this.$slideIndex_$ ? this.$initialSlideIndex_$ = $index$jscomp$86$$ : $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$(this, $index$jscomp$86$$, $trust$jscomp$2$$);
};
function $JSCompiler_StaticMethods_showSlide_$$($JSCompiler_StaticMethods_showSlide_$self$$, $newIndex$jscomp$4$$) {
  var $noOfSlides_$$ = $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$;
  if (0 > $newIndex$jscomp$4$$ || $newIndex$jscomp$4$$ >= $noOfSlides_$$ || $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ == $newIndex$jscomp$4$$) {
    return !1;
  }
  var $prevIndex$jscomp$1$$ = 0 <= $newIndex$jscomp$4$$ - 1 ? $newIndex$jscomp$4$$ - 1 : $JSCompiler_StaticMethods_showSlide_$self$$.shouldLoop ? $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$ - 1 : null, $nextIndex$jscomp$1$$ = $newIndex$jscomp$4$$ + 1 < $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$ ? $newIndex$jscomp$4$$ + 1 : $JSCompiler_StaticMethods_showSlide_$self$$.shouldLoop ? 0 : null, $showIndexArr$$ = [];
  null != $prevIndex$jscomp$1$$ && $showIndexArr$$.push($prevIndex$jscomp$1$$);
  $showIndexArr$$.push($newIndex$jscomp$4$$);
  null != $nextIndex$jscomp$1$$ && $nextIndex$jscomp$1$$ !== $prevIndex$jscomp$1$$ && $showIndexArr$$.push($nextIndex$jscomp$1$$);
  null !== $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ && $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_showSlide_$self$$.element).updateInViewport($JSCompiler_StaticMethods_showSlide_$self$$.element, $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$user$$module$src$log$$().assertNumber($JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$, "E#19457 this.slideIndex_")], !1);
  var $newSlideInView$$ = $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$newIndex$jscomp$4$$];
  if (void 0 === $newSlideInView$$) {
    return $dev$$module$src$log$$().error("AMP-CAROUSEL", "Attempting to access a non-existant slide %s / %s", $newIndex$jscomp$4$$, $noOfSlides_$$), !1;
  }
  $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_showSlide_$self$$.element).updateInViewport($JSCompiler_StaticMethods_showSlide_$self$$.element, $newSlideInView$$, !0);
  $showIndexArr$$.forEach(function($noOfSlides_$$, $prevIndex$jscomp$1$$) {
    $JSCompiler_StaticMethods_showSlide_$self$$.shouldLoop && $setStyle$$module$src$style$$($JSCompiler_StaticMethods_showSlide_$self$$.$slideWrappers_$[$noOfSlides_$$], $prevIndex$jscomp$1$$ + 1);
    $JSCompiler_StaticMethods_showSlide_$self$$.$slideWrappers_$[$noOfSlides_$$].classList.add("i-amphtml-slide-item-show");
    var $nextIndex$jscomp$1$$ = $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_showSlide_$self$$.element);
    $noOfSlides_$$ == $newIndex$jscomp$4$$ ? ($nextIndex$jscomp$1$$.scheduleLayout($JSCompiler_StaticMethods_showSlide_$self$$.element, $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$]), $nextIndex$jscomp$1$$.scheduleResume($JSCompiler_StaticMethods_showSlide_$self$$.element, $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$]), $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$].setAttribute("aria-hidden", "false")) : ($nextIndex$jscomp$1$$.schedulePreload($JSCompiler_StaticMethods_showSlide_$self$$.element, 
    $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$]), $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$].setAttribute("aria-hidden", "true"));
  });
  $JSCompiler_StaticMethods_showSlide_$self$$.$slidesContainer_$.scrollLeft = $JSCompiler_StaticMethods_getScrollLeftForIndex_$$($JSCompiler_StaticMethods_showSlide_$self$$, $newIndex$jscomp$4$$);
  $JSCompiler_StaticMethods_triggerAnalyticsEvent_$$($JSCompiler_StaticMethods_showSlide_$self$$, $newIndex$jscomp$4$$);
  $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ = $newIndex$jscomp$4$$;
  $JSCompiler_StaticMethods_showSlide_$self$$.$autoplayLoops_$ && $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ === $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$ - 1 && ($JSCompiler_StaticMethods_showSlide_$self$$.$loopsMade_$++, $JSCompiler_StaticMethods_showSlide_$self$$.$loopsMade_$ == $JSCompiler_StaticMethods_showSlide_$self$$.$autoplayLoops_$ && $JSCompiler_StaticMethods_showSlide_$self$$.removeAutoplay());
  $JSCompiler_StaticMethods_hideRestOfTheSlides_$$($JSCompiler_StaticMethods_showSlide_$self$$, $showIndexArr$$);
  $JSCompiler_StaticMethods_showSlide_$self$$.setControlsState();
  $JSCompiler_StaticMethods_showSlide_$self$$.updateButtonTitles();
  return !0;
}
function $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$($JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$, $newIndex$jscomp$5$$, $opt_trust$jscomp$2$$) {
  $opt_trust$jscomp$2$$ = void 0 === $opt_trust$jscomp$2$$ ? 1 : $opt_trust$jscomp$2$$;
  if ($JSCompiler_StaticMethods_showSlide_$$($JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$, $newIndex$jscomp$5$$)) {
    var $JSCompiler_e$jscomp$inline_95_JSCompiler_win$jscomp$inline_90$$ = $JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.win;
    var $JSCompiler_detail$jscomp$inline_91_JSCompiler_inline_result$jscomp$33$$ = $dict$$module$src$utils$object$$({index:$newIndex$jscomp$5$$});
    var $JSCompiler_eventInit$jscomp$inline_94$$ = {detail:$JSCompiler_detail$jscomp$inline_91_JSCompiler_inline_result$jscomp$33$$};
    Object.assign($JSCompiler_eventInit$jscomp$inline_94$$, void 0);
    "function" == typeof $JSCompiler_e$jscomp$inline_95_JSCompiler_win$jscomp$inline_90$$.CustomEvent ? $JSCompiler_detail$jscomp$inline_91_JSCompiler_inline_result$jscomp$33$$ = new $JSCompiler_e$jscomp$inline_95_JSCompiler_win$jscomp$inline_90$$.CustomEvent("slidescroll.slideChange", $JSCompiler_eventInit$jscomp$inline_94$$) : ($JSCompiler_e$jscomp$inline_95_JSCompiler_win$jscomp$inline_90$$ = $JSCompiler_e$jscomp$inline_95_JSCompiler_win$jscomp$inline_90$$.document.createEvent("CustomEvent"), 
    $JSCompiler_e$jscomp$inline_95_JSCompiler_win$jscomp$inline_90$$.initCustomEvent("slidescroll.slideChange", !!$JSCompiler_eventInit$jscomp$inline_94$$.bubbles, !!$JSCompiler_eventInit$jscomp$inline_94$$.cancelable, $JSCompiler_detail$jscomp$inline_91_JSCompiler_inline_result$jscomp$33$$), $JSCompiler_detail$jscomp$inline_91_JSCompiler_inline_result$jscomp$33$$ = $JSCompiler_e$jscomp$inline_95_JSCompiler_win$jscomp$inline_90$$);
    $JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.$action_$.trigger($JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.element, "slideChange", $JSCompiler_detail$jscomp$inline_91_JSCompiler_inline_result$jscomp$33$$, $opt_trust$jscomp$2$$);
    $JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.element.dispatchCustomEvent("slideChange", {index:$newIndex$jscomp$5$$, actionTrust:$opt_trust$jscomp$2$$});
  }
}
function $JSCompiler_StaticMethods_getScrollLeftForIndex_$$($JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$, $index$jscomp$87$$) {
  var $newScrollLeft$$ = $JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$.$slideWidth_$;
  if (!$JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$.shouldLoop && 0 == $index$jscomp$87$$ || 1 >= $JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$.$slides_$.length) {
    $newScrollLeft$$ = 0;
  }
  return $newScrollLeft$$;
}
function $JSCompiler_StaticMethods_hideRestOfTheSlides_$$($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$, $indexArr$$) {
  for (var $noOfSlides_$jscomp$1$$ = $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$noOfSlides_$, $i$jscomp$31$$ = 0; $i$jscomp$31$$ < $noOfSlides_$jscomp$1$$; $i$jscomp$31$$++) {
    $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideWrappers_$[$i$jscomp$31$$].classList.contains("i-amphtml-slide-item-show") && ($indexArr$$.includes($i$jscomp$31$$) || ($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.shouldLoop && $setStyle$$module$src$style$$($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideWrappers_$[$i$jscomp$31$$], ""), $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideWrappers_$[$i$jscomp$31$$].classList.remove("i-amphtml-slide-item-show"), 
    $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slides_$[$i$jscomp$31$$].removeAttribute("aria-hidden")), $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideIndex_$ != $i$jscomp$31$$ && $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.element).schedulePause($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.element, $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slides_$[$i$jscomp$31$$]));
  }
}
function $JSCompiler_StaticMethods_animateScrollLeft_$$($JSCompiler_StaticMethods_animateScrollLeft_$self$$, $fromScrollLeft$$, $curve$jscomp$5_toScrollLeft$jscomp$1$$) {
  if ($fromScrollLeft$$ == $curve$jscomp$5_toScrollLeft$jscomp$1$$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  var $interpolate$jscomp$2$$ = $numeric$$module$src$transition$$($fromScrollLeft$$, $curve$jscomp$5_toScrollLeft$jscomp$1$$);
  $curve$jscomp$5_toScrollLeft$jscomp$1$$ = $bezierCurve$$module$src$curve$$(0.8, 0, 0.6, 1);
  return $Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_animateScrollLeft_$self$$.$slidesContainer_$, function($fromScrollLeft$$) {
    $JSCompiler_StaticMethods_animateScrollLeft_$self$$.$slidesContainer_$.scrollLeft = $interpolate$jscomp$2$$($fromScrollLeft$$);
  }, 80, $curve$jscomp$5_toScrollLeft$jscomp$1$$).thenAlways();
}
$JSCompiler_prototypeAlias$$.$cancelTouchEvents_$ = function() {
  $listen$$module$src$event_helper$$(this.element, "touchmove", function($event$jscomp$14$$) {
    return $event$jscomp$14$$.stopPropagation();
  });
};
function $JSCompiler_StaticMethods_triggerAnalyticsEvent_$$($JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$, $newSlideIndex$$) {
  var $direction$jscomp$7$$ = $newSlideIndex$$ - $JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.$slideIndex_$;
  if (0 != $direction$jscomp$7$$) {
    1 !== Math.abs($direction$jscomp$7$$) && ($direction$jscomp$7$$ = 0 > $direction$jscomp$7$$ ? 1 : -1, null === $JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.$slideIndex_$ && ($direction$jscomp$7$$ = 1));
    var $vars$jscomp$1$$ = $dict$$module$src$utils$object$$({fromSlide:null === $JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.$slideIndex_$ ? "null" : $JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.$dataSlideIdArr_$[$JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.$slideIndex_$], toSlide:$JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.$dataSlideIdArr_$[$newSlideIndex$$]});
    $triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.element, "amp-carousel-change", $vars$jscomp$1$$);
    1 == $direction$jscomp$7$$ ? $triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.element, "amp-carousel-next", $vars$jscomp$1$$) : $triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_triggerAnalyticsEvent_$self$$.element, "amp-carousel-prev", $vars$jscomp$1$$);
  }
}
;function $CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$() {
  return AMP.BaseElement.apply(this, arguments) || this;
}
$$jscomp$inherits$$($CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$, AMP.BaseElement);
$CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$.prototype.upgradeCallback = function() {
  return "slides" == this.element.getAttribute("type") ? new $AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$(this.element) : new $AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$(this.element);
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-carousel", $CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$, ".amp-carousel-slide>.i-amphtml-replaced-content{-o-object-fit:contain;object-fit:contain}.amp-carousel-button{position:absolute;box-sizing:border-box;top:50%;height:34px;width:34px;border-radius:2px;opacity:0;pointer-events:all;background-color:rgba(0,0,0,0.5);background-position:50% 50%;background-repeat:no-repeat;transform:translateY(-50%);visibility:hidden;z-index:10}.amp-mode-mouse .amp-carousel-button,amp-carousel.i-amphtml-carousel-has-controls .amp-carousel-button,amp-carousel[controls] .amp-carousel-button{opacity:1;visibility:visible}.amp-carousel-button-prev{left:16px;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='%23fff'%3E%3Cpath d='M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z'/%3E%3C/svg%3E\");background-size:18px 18px}.amp-carousel-button-next{right:16px;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='%23fff'%3E%3Cpath d='M9 3L7.94 4.06l4.19 4.19H3v1.5h9.13l-4.19 4.19L9 15l6-6z'/%3E%3C/svg%3E\");background-size:18px 18px}.i-amphtml-carousel-button-start-hint .amp-carousel-button:not(.amp-disabled){animation:i-amphtml-carousel-hint 1s ease-in 3s 1 normal both}.amp-mode-mouse .i-amphtml-carousel-button-start-hint .amp-carousel-button:not(.amp-disabled){animation:none}@keyframes i-amphtml-carousel-hint{0%{opacity:1;visibility:visible}to{opacity:0;visibility:hidden}}amp-carousel .amp-carousel-button.amp-disabled{animation:none;opacity:0;visibility:hidden}amp-carousel[i-amphtml-carousel-hide-buttons] .amp-carousel-button-next,amp-carousel[i-amphtml-carousel-hide-buttons] .amp-carousel-button-prev{opacity:0;pointer-events:none;visibility:visible!important}.i-amphtml-slides-container{display:-ms-flexbox!important;display:flex!important;-ms-flex-wrap:nowrap;flex-wrap:nowrap;height:100%!important;left:0;overflow-x:auto!important;overflow-y:hidden!important;position:absolute!important;top:0;width:100%!important;scroll-snap-type:x mandatory!important;scrollbar-width:none;padding-bottom:20px!important;box-sizing:content-box!important;-webkit-overflow-scrolling:touch!important}.i-amphtml-slides-container::-webkit-scrollbar{display:none!important}.i-amphtml-slides-container.i-amphtml-no-scroll{overflow-x:hidden!important}.i-amphtml-slide-item{-ms-flex-align:center!important;align-items:center!important;display:none!important;-ms-flex:0 0 100%!important;flex:0 0 100%!important;height:100%!important;-ms-flex-pack:center!important;justify-content:center!important;position:relative!important;scroll-snap-align:start!important;width:100%!important}.i-amphtml-slide-item>*{height:100%;width:100%;overflow:hidden!important}.i-amphtml-slide-item-show{display:-ms-flexbox!important;display:flex!important}.i-amphtml-carousel-end-marker,.i-amphtml-carousel-start-marker{background-color:transparent!important;display:block!important;-ms-flex:0 0 1px!important;flex:0 0 1px!important;height:100%!important;position:relative!important;scroll-snap-align:start!important;width:1px!important}.i-amphtml-carousel-start-marker{-ms-flex-order:-1!important;order:-1!important;margin-left:-1px!important}.i-amphtml-carousel-end-marker{-ms-flex-order:100000000!important;order:100000000!important;margin-right:-1px!important}.i-amphtml-slidescroll-no-snap.i-amphtml-slides-container{scroll-snap-type:none!important}.i-amphtml-slidescroll-no-snap .i-amphtml-slide-item{scroll-snap-align:none!important}.i-amphtml-slidescroll-no-snap.i-amphtml-slides-container.i-amphtml-no-scroll{-webkit-overflow-scrolling:auto!important}.amp-scrollable-carousel-slide{display:inline-block!important;margin-left:8px}.amp-scrollable-carousel-slide:first-child{margin-left:0px}.i-amphtml-scrollable-carousel-container{white-space:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important}\n/*# sourceURL=/extensions/amp-carousel/0.1/amp-carousel.css*/");
})(self.AMP);

})});

//# sourceMappingURL=amp-carousel-0.1.js.map
