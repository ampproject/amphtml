(self.AMP=self.AMP||[]).push({n:"amp-audio",v:"2007210308000",f:(function(AMP,_){
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
var $JSCompiler_temp$jscomp$19$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$19$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$20$$;
  a: {
    var $JSCompiler_x$jscomp$inline_31$$ = {a:!0}, $JSCompiler_y$jscomp$inline_32$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_32$$.__proto__ = $JSCompiler_x$jscomp$inline_31$$;
      $JSCompiler_inline_result$jscomp$20$$ = $JSCompiler_y$jscomp$inline_32$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_33$$) {
    }
    $JSCompiler_inline_result$jscomp$20$$ = !1;
  }
  $JSCompiler_temp$jscomp$19$$ = $JSCompiler_inline_result$jscomp$20$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$19$$;
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
var $toString_$$module$src$types$$ = Object.prototype.toString;
var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
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
function $devAssert$$module$src$log$$() {
}
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$) {
  $user$$module$src$log$$().assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$, void 0, void 0, void 0, void 0, void 0, void 0);
}
;var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $LruCache$$module$src$utils$lru_cache$$() {
  this.$capacity_$ = 100;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$44$$) {
  return !!this.$cache_$[$key$jscomp$44$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$45$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$45$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_39_key$jscomp$46$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_39_key$jscomp$46$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_39_key$jscomp$46$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_39_key$jscomp$46$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_40$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_42$$;
    for ($JSCompiler_key$jscomp$inline_42$$ in $JSCompiler_cache$jscomp$inline_39_key$jscomp$46$$) {
      var $JSCompiler_access$jscomp$inline_43$$ = $JSCompiler_cache$jscomp$inline_39_key$jscomp$46$$[$JSCompiler_key$jscomp$inline_42$$].access;
      if ($JSCompiler_access$jscomp$inline_43$$ < $JSCompiler_oldest$jscomp$inline_40$$) {
        $JSCompiler_oldest$jscomp$inline_40$$ = $JSCompiler_access$jscomp$inline_43$$;
        var $JSCompiler_oldestKey$jscomp$inline_41$$ = $JSCompiler_key$jscomp$inline_42$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_41$$ && (delete $JSCompiler_cache$jscomp$inline_39_key$jscomp$46$$[$JSCompiler_oldestKey$jscomp$inline_41$$], this.$size_$--);
  }
};
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $assertHttpsUrl$$module$src$url$$($urlString$jscomp$1$$, $elementContext$$) {
  var $sourceName$$ = void 0 === $sourceName$$ ? "source" : $sourceName$$;
  $userAssert$$module$src$log$$(null != $urlString$jscomp$1$$, "%s %s must be available", $elementContext$$, $sourceName$$);
  var $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$ = $urlString$jscomp$1$$;
  if ("string" == typeof $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$) {
    $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new $LruCache$$module$src$utils$lru_cache$$));
    var $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ = $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_123$$ = $a$$module$src$url$$;
    if ($JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ && $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$.has($JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$)) {
      $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$ = $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$.get($JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$);
    } else {
      $JSCompiler_a$jscomp$inline_123$$.href = $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$;
      $JSCompiler_a$jscomp$inline_123$$.protocol || ($JSCompiler_a$jscomp$inline_123$$.href = $JSCompiler_a$jscomp$inline_123$$.href);
      var $JSCompiler_info$jscomp$inline_124$$ = {href:$JSCompiler_a$jscomp$inline_123$$.href, protocol:$JSCompiler_a$jscomp$inline_123$$.protocol, host:$JSCompiler_a$jscomp$inline_123$$.host, hostname:$JSCompiler_a$jscomp$inline_123$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_123$$.port ? "" : $JSCompiler_a$jscomp$inline_123$$.port, pathname:$JSCompiler_a$jscomp$inline_123$$.pathname, search:$JSCompiler_a$jscomp$inline_123$$.search, hash:$JSCompiler_a$jscomp$inline_123$$.hash, origin:null};
      "/" !== $JSCompiler_info$jscomp$inline_124$$.pathname[0] && ($JSCompiler_info$jscomp$inline_124$$.pathname = "/" + $JSCompiler_info$jscomp$inline_124$$.pathname);
      if ("http:" == $JSCompiler_info$jscomp$inline_124$$.protocol && 80 == $JSCompiler_info$jscomp$inline_124$$.port || "https:" == $JSCompiler_info$jscomp$inline_124$$.protocol && 443 == $JSCompiler_info$jscomp$inline_124$$.port) {
        $JSCompiler_info$jscomp$inline_124$$.port = "", $JSCompiler_info$jscomp$inline_124$$.host = $JSCompiler_info$jscomp$inline_124$$.hostname;
      }
      $JSCompiler_info$jscomp$inline_124$$.origin = $JSCompiler_a$jscomp$inline_123$$.origin && "null" != $JSCompiler_a$jscomp$inline_123$$.origin ? $JSCompiler_a$jscomp$inline_123$$.origin : "data:" != $JSCompiler_info$jscomp$inline_124$$.protocol && $JSCompiler_info$jscomp$inline_124$$.host ? $JSCompiler_info$jscomp$inline_124$$.protocol + "//" + $JSCompiler_info$jscomp$inline_124$$.host : $JSCompiler_info$jscomp$inline_124$$.href;
      $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ && $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$.put($JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$, $JSCompiler_info$jscomp$inline_124$$);
      $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$ = $JSCompiler_info$jscomp$inline_124$$;
    }
  }
  ($JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ = "https:" == $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$.protocol || "localhost" == $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$.hostname || "127.0.0.1" == $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$.hostname) || ($JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$ = 
  $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$.hostname, $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ = $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$.length - 10, $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ = 0 <= $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ && 
  $JSCompiler_string$jscomp$inline_89_JSCompiler_url$jscomp$inline_47_JSCompiler_url$jscomp$inline_87$$.indexOf(".localhost", $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$) == $JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$);
  $userAssert$$module$src$log$$($JSCompiler_index$jscomp$inline_90_JSCompiler_opt_cache$jscomp$inline_122_JSCompiler_temp$jscomp$81$$ || /^(\/\/)/.test($urlString$jscomp$1$$), '%s %s must start with "https://" or "//" or be relative and served from either https or from localhost. Invalid value: %s', $elementContext$$, $sourceName$$, $urlString$jscomp$1$$);
}
;function $experimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$) {
  if ($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ in $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$] = Math.random() < $frequency$$);
    }
  }
  if ($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$3_experimentId$jscomp$2_i$jscomp$15$$ = 0; $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ < $optedInExperiments$$.length; $allowed$3_experimentId$jscomp$2_i$jscomp$15$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$));
  if ($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$3_experimentId$jscomp$2_i$jscomp$15$$ = $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    var $JSCompiler_queryString$jscomp$inline_92_i$4$$ = $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.location.originalHash || $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$.location.hash;
    $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$ = Object.create(null);
    if ($JSCompiler_queryString$jscomp$inline_92_i$4$$) {
      for (var $JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$; $JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$ = $regex$$module$src$url_parse_query_string$$.exec($JSCompiler_queryString$jscomp$inline_92_i$4$$);) {
        var $JSCompiler_name$jscomp$inline_95_param$jscomp$6$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$[1], $JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$[1]);
        $JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$ = $JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$[2].replace(/\+/g, " "), $JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$[2]) : "";
        $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$[$JSCompiler_name$jscomp$inline_95_param$jscomp$6$$] = $JSCompiler_match$jscomp$inline_94_JSCompiler_value$jscomp$inline_96$$;
      }
    }
    for ($JSCompiler_queryString$jscomp$inline_92_i$4$$ = 0; $JSCompiler_queryString$jscomp$inline_92_i$4$$ < $allowed$3_experimentId$jscomp$2_i$jscomp$15$$.length; $JSCompiler_queryString$jscomp$inline_92_i$4$$++) {
      $JSCompiler_name$jscomp$inline_95_param$jscomp$6$$ = $JSCompiler_params$jscomp$inline_93_win$jscomp$12$$["e-" + $allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_92_i$4$$]], "1" == $JSCompiler_name$jscomp$inline_95_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_92_i$4$$]] = !0), "0" == $JSCompiler_name$jscomp$inline_95_param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$3_experimentId$jscomp$2_i$jscomp$15$$[$JSCompiler_queryString$jscomp$inline_92_i$4$$]] = 
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
function $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$) {
  var $win$jscomp$23$$ = $JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$.ownerDocument.defaultView, $topWin$$ = $win$jscomp$23$$.__AMP_TOP || ($win$jscomp$23$$.__AMP_TOP = $win$jscomp$23$$), $isEmbed$$ = $win$jscomp$23$$ != $topWin$$, $JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$;
  if ($experimentToggles$$module$src$experiments$$($topWin$$)["ampdoc-fie"]) {
    $topWin$$.__AMP_EXPERIMENT_BRANCHES = $topWin$$.__AMP_EXPERIMENT_BRANCHES || {};
    for ($JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$ = 0; $JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$++) {
      var $JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$], $JSCompiler_experimentName$jscomp$inline_130$$ = $JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($topWin$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_130$$) || ($JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$.isTrafficEligible($topWin$$) ? !$topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_130$$] && $experimentToggles$$module$src$experiments$$($topWin$$)[$JSCompiler_experimentName$jscomp$inline_130$$] && 
      ($JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$ = $JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$.branches, $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_130$$] = $JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_147_JSCompiler_experiment$jscomp$inline_129$$.length)] || null) : $topWin$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_130$$] = 
      null);
    }
    $JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$ = "21065002" === ($topWin$$.__AMP_EXPERIMENT_BRANCHES ? $topWin$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$ = !1;
  }
  var $ampdocFieExperimentOn$$ = $JSCompiler_i$jscomp$inline_128_JSCompiler_inline_result$jscomp$83$$;
  $isEmbed$$ && !$ampdocFieExperimentOn$$ ? $JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$ = $isServiceRegistered$$module$src$service$$($win$jscomp$23$$, "url") ? $getServiceInternal$$module$src$service$$($win$jscomp$23$$, "url") : null : ($JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$), 
  $JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$), $JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$, 
  "url") ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$, "url") : null);
  return $JSCompiler_ampdoc$jscomp$inline_102_JSCompiler_holder$jscomp$inline_103_JSCompiler_temp$jscomp$84_element$jscomp$13$$;
}
function $getService$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$) {
  $win$jscomp$25$$ = $win$jscomp$25$$.__AMP_TOP || ($win$jscomp$25$$.__AMP_TOP = $win$jscomp$25$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$);
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
;var $resolved$$module$src$resolved_promise$$;
/*
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
  return $element$jscomp$21$$.closest ? $element$jscomp$21$$.closest("AMP-STORY") : $closest$$module$src$dom$$($element$jscomp$21$$, function($element$jscomp$21$$) {
    var $el$jscomp$3$$ = $element$jscomp$21$$.matches || $element$jscomp$21$$.webkitMatchesSelector || $element$jscomp$21$$.mozMatchesSelector || $element$jscomp$21$$.msMatchesSelector || $element$jscomp$21$$.oMatchesSelector;
    return $el$jscomp$3$$ ? $el$jscomp$3$$.call($element$jscomp$21$$, "AMP-STORY") : !1;
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
      var $JSCompiler_inline_result$jscomp$119_JSCompiler_scripts$jscomp$inline_135$$ = {};
      $s$jscomp$14$$ = $s$jscomp$14$$.querySelectorAll("script[custom-element],script[custom-template]");
      for (var $JSCompiler_i$jscomp$inline_137$$ = 0; $JSCompiler_i$jscomp$inline_137$$ < $s$jscomp$14$$.length; $JSCompiler_i$jscomp$inline_137$$++) {
        var $JSCompiler_name$jscomp$inline_139_JSCompiler_script$jscomp$inline_138$$ = $s$jscomp$14$$[$JSCompiler_i$jscomp$inline_137$$];
        $JSCompiler_name$jscomp$inline_139_JSCompiler_script$jscomp$inline_138$$ = $JSCompiler_name$jscomp$inline_139_JSCompiler_script$jscomp$inline_138$$.getAttribute("custom-element") || $JSCompiler_name$jscomp$inline_139_JSCompiler_script$jscomp$inline_138$$.getAttribute("custom-template");
        $JSCompiler_inline_result$jscomp$119_JSCompiler_scripts$jscomp$inline_135$$[$JSCompiler_name$jscomp$inline_139_JSCompiler_script$jscomp$inline_138$$] = !0;
      }
      $JSCompiler_inline_result$jscomp$119_JSCompiler_scripts$jscomp$inline_135$$ = Object.keys($JSCompiler_inline_result$jscomp$119_JSCompiler_scripts$jscomp$inline_135$$);
    } else {
      $JSCompiler_inline_result$jscomp$119_JSCompiler_scripts$jscomp$inline_135$$ = [];
    }
    $JSCompiler_inline_result$jscomp$119_JSCompiler_scripts$jscomp$inline_135$$.includes("amp-analytics") ? $element$jscomp$36$$ = $getService$$module$src$service$$($element$jscomp$36$$, "extensions").waitForExtension($element$jscomp$36$$, "amp-analytics") : ($resolved$$module$src$resolved_promise$$ || ($resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0)), $element$jscomp$36$$ = $resolved$$module$src$resolved_promise$$);
    return $element$jscomp$36$$;
  }).then(function() {
    var $s$jscomp$14$$ = $ampdoc$jscomp$9$$.win;
    if ($s$jscomp$14$$.__AMP_EXTENDED_ELEMENTS && $s$jscomp$14$$.__AMP_EXTENDED_ELEMENTS["amp-analytics"]) {
      $s$jscomp$14$$ = $getAmpdocServiceHolder$$module$src$service$$($element$jscomp$36$$);
      var $JSCompiler_cached$jscomp$inline_113$$ = $getServicePromiseOrNullInternal$$module$src$service$$($s$jscomp$14$$);
      $JSCompiler_cached$jscomp$inline_113$$ ? $s$jscomp$14$$ = $JSCompiler_cached$jscomp$inline_113$$ : ($s$jscomp$14$$ = $getServices$$module$src$service$$($s$jscomp$14$$), $s$jscomp$14$$["amp-analytics-instrumentation"] = $emptyServiceHolderWithPromise$$module$src$service$$(), $s$jscomp$14$$ = $s$jscomp$14$$["amp-analytics-instrumentation"].promise);
    } else {
      $s$jscomp$14$$ = null;
    }
    return $s$jscomp$14$$;
  });
}
;var $EMPTY_METADATA$$module$src$mediasession_helper$$ = {title:"", artist:"", album:"", artwork:[{src:""}]};
function $setMediaSession$$module$src$mediasession_helper$$($element$jscomp$63$$, $win$jscomp$54$$, $metadata$$, $playHandler$$, $pauseHandler$$) {
  var $navigator$jscomp$1$$ = $win$jscomp$54$$.navigator;
  "mediaSession" in $navigator$jscomp$1$$ && $win$jscomp$54$$.MediaMetadata && ($navigator$jscomp$1$$.mediaSession.metadata = new $win$jscomp$54$$.MediaMetadata($EMPTY_METADATA$$module$src$mediasession_helper$$), $validateMetadata$$module$src$mediasession_helper$$($element$jscomp$63$$, $metadata$$), $navigator$jscomp$1$$.mediaSession.metadata = new $win$jscomp$54$$.MediaMetadata($metadata$$), $navigator$jscomp$1$$.mediaSession.setActionHandler("play", $playHandler$$), $navigator$jscomp$1$$.mediaSession.setActionHandler("pause", 
  $pauseHandler$$));
}
function $parseSchemaImage$$module$src$mediasession_helper$$($doc$jscomp$6$$) {
  var $schema$$ = $doc$jscomp$6$$.querySelector('script[type="application/ld+json"]');
  if ($schema$$) {
    try {
      var $JSCompiler_inline_result$jscomp$28$$ = JSON.parse($schema$$.textContent);
    } catch ($JSCompiler_e$jscomp$inline_65$$) {
      $JSCompiler_inline_result$jscomp$28$$ = null;
    }
    var $schemaJson$$ = $JSCompiler_inline_result$jscomp$28$$;
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
function $validateMetadata$$module$src$mediasession_helper$$($element$jscomp$64$$, $metadata$jscomp$1$$) {
  var $urlService$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$64$$);
  if ($metadata$jscomp$1$$ && $metadata$jscomp$1$$.artwork) {
    var $artwork$$ = $metadata$jscomp$1$$.artwork;
    $devAssert$$module$src$log$$(Array.isArray($artwork$$));
    $artwork$$.forEach(function($element$jscomp$64$$) {
      $element$jscomp$64$$ && ($element$jscomp$64$$ = "[object Object]" === $toString_$$module$src$types$$.call($element$jscomp$64$$) ? $element$jscomp$64$$.src : $element$jscomp$64$$, $userAssert$$module$src$log$$($urlService$$.isProtocolValid($element$jscomp$64$$)));
    });
  }
}
;var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$75$$, $eventType$jscomp$3$$, $listener$jscomp$64$$) {
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$();
  $element$jscomp$75$$.addEventListener($eventType$jscomp$3$$, function($element$jscomp$75$$) {
    try {
      return $listener$jscomp$64$$($element$jscomp$75$$);
    } catch ($e$jscomp$19$$) {
      throw self.__AMP_REPORT_ERROR($e$jscomp$19$$), $e$jscomp$19$$;
    }
  }, $optsSupported$$ ? void 0 : !1);
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
;function $listen$$module$src$event_helper$$($element$jscomp$76$$, $eventType$jscomp$4$$, $listener$jscomp$65$$) {
  $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$76$$, $eventType$jscomp$4$$, $listener$jscomp$65$$);
}
;function $triggerAnalyticsEvent$$module$src$analytics$$($target$jscomp$99$$, $eventType$jscomp$7$$) {
  var $vars$$ = void 0 === $vars$$ ? {} : $vars$$;
  var $enableDataVars$$ = void 0 === $enableDataVars$$ ? !0 : $enableDataVars$$;
  $getElementServiceIfAvailableForDoc$$module$src$element_service$$($target$jscomp$99$$).then(function($analytics$$) {
    $analytics$$ && $analytics$$.triggerEventForTarget($target$jscomp$99$$, $eventType$jscomp$7$$, $vars$$, $enableDataVars$$);
  });
}
;function $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$($$jscomp$super$this_element$jscomp$81$$) {
  $$jscomp$super$this_element$jscomp$81$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$81$$) || this;
  $$jscomp$super$this_element$jscomp$81$$.$audio_$ = null;
  $$jscomp$super$this_element$jscomp$81$$.$metadata_$ = $EMPTY_METADATA$$module$src$mediasession_helper$$;
  $$jscomp$super$this_element$jscomp$81$$.isPlaying = !1;
  return $$jscomp$super$this_element$jscomp$81$$;
}
var $JSCompiler_parentCtor$jscomp$inline_68$$ = AMP.BaseElement;
$AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_68$$.prototype);
$AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$.prototype.constructor = $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$, $JSCompiler_parentCtor$jscomp$inline_68$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_69$$ in $JSCompiler_parentCtor$jscomp$inline_68$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_69$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_70$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_68$$, $JSCompiler_p$jscomp$inline_69$$);
        $JSCompiler_descriptor$jscomp$inline_70$$ && Object.defineProperty($AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$, $JSCompiler_p$jscomp$inline_69$$, $JSCompiler_descriptor$jscomp$inline_70$$);
      } else {
        $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$[$JSCompiler_p$jscomp$inline_69$$] = $JSCompiler_parentCtor$jscomp$inline_68$$[$JSCompiler_p$jscomp$inline_69$$];
      }
    }
  }
}
$AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_68$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$.prototype;
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  "nodisplay" === this.getLayout() && (this.element.removeAttribute("autoplay"), this.buildAudioElement());
  this.element.classList.add("i-amphtml-media-component");
  this.registerAction("play", this.$play_$.bind(this));
  this.registerAction("pause", this.$pause_$.bind(this));
};
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$$) {
  if (this.$audio_$) {
    var $src$jscomp$5_title$jscomp$12$$ = $mutations$$.src, $controlsList$$ = $mutations$$.controlsList, $loop$$ = $mutations$$.loop;
    if (void 0 !== $src$jscomp$5_title$jscomp$12$$ || void 0 !== $controlsList$$ || void 0 !== $loop$$) {
      void 0 !== $src$jscomp$5_title$jscomp$12$$ && $assertHttpsUrl$$module$src$url$$($src$jscomp$5_title$jscomp$12$$, this.element), this.propagateAttributes(["src", "loop", "controlsList"], this.$audio_$);
    }
    $src$jscomp$5_title$jscomp$12$$ = $mutations$$.title;
    var $album$$ = $mutations$$.album, $artwork$jscomp$1$$ = $mutations$$.artwork;
    void 0 === $mutations$$.artist && void 0 === $src$jscomp$5_title$jscomp$12$$ && void 0 === $album$$ && void 0 === $artwork$jscomp$1$$ || $JSCompiler_StaticMethods_updateMetadata_$$(this);
  }
};
$JSCompiler_prototypeAlias$$.buildAudioElement = function() {
  var $$jscomp$this$jscomp$2$$ = this, $audio$$ = this.element.ownerDocument.createElement("audio");
  if ($audio$$.play) {
    $audio$$.controls = !0;
    var $src$jscomp$6$$ = this.element.getAttribute("src");
    $src$jscomp$6$$ && $assertHttpsUrl$$module$src$url$$($src$jscomp$6$$, this.element);
    this.propagateAttributes("src preload autoplay muted loop aria-label aria-describedby aria-labelledby controlsList".split(" "), $audio$$);
    this.applyFillContent($audio$$);
    this.getRealChildNodes().forEach(function($$jscomp$this$jscomp$2$$) {
      $$jscomp$this$jscomp$2$$.getAttribute && $$jscomp$this$jscomp$2$$.getAttribute("src") && $assertHttpsUrl$$module$src$url$$($$jscomp$this$jscomp$2$$.getAttribute("src"), $$jscomp$this$jscomp$2$$);
      $audio$$.appendChild($$jscomp$this$jscomp$2$$);
    });
    this.element.appendChild($audio$$);
    this.$audio_$ = $audio$$;
    $listen$$module$src$event_helper$$(this.$audio_$, "playing", function() {
      return $JSCompiler_StaticMethods_audioPlaying_$$($$jscomp$this$jscomp$2$$);
    });
    $listen$$module$src$event_helper$$(this.$audio_$, "play", function() {
      return $triggerAnalyticsEvent$$module$src$analytics$$($$jscomp$this$jscomp$2$$.element, "audio-play");
    });
    $listen$$module$src$event_helper$$(this.$audio_$, "pause", function() {
      return $triggerAnalyticsEvent$$module$src$analytics$$($$jscomp$this$jscomp$2$$.element, "audio-pause");
    });
  } else {
    this.toggleFallback(!0);
  }
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  "nodisplay" !== this.getLayout() && this.buildAudioElement();
  $JSCompiler_StaticMethods_updateMetadata_$$(this);
  return "none" === this.element.getAttribute("preload") ? this.$audio_$ : this.loadPromise(this.$audio_$);
};
function $JSCompiler_StaticMethods_updateMetadata_$$($JSCompiler_StaticMethods_updateMetadata_$self$$) {
  var $JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$ = $JSCompiler_StaticMethods_updateMetadata_$self$$.getAmpDoc().win.document, $artist$jscomp$1$$ = $JSCompiler_StaticMethods_updateMetadata_$self$$.element.getAttribute("artist") || "", $title$jscomp$13$$ = $JSCompiler_StaticMethods_updateMetadata_$self$$.element.getAttribute("title") || $JSCompiler_StaticMethods_updateMetadata_$self$$.element.getAttribute("aria-label") || $JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$.title || 
  "", $album$jscomp$1$$ = $JSCompiler_StaticMethods_updateMetadata_$self$$.element.getAttribute("album") || "", $JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$;
  ($JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$ = $JSCompiler_StaticMethods_updateMetadata_$self$$.element.getAttribute("artwork") || $parseSchemaImage$$module$src$mediasession_helper$$($JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$)) || ($JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$ = ($JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$ = $JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$.querySelector('meta[property="og:image"]')) ? 
  $JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$.getAttribute("content") : void 0);
  $JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$ || ($JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$ = ($JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$ = $JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$.querySelector('link[rel="shortcut icon"]') || $JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$.querySelector('link[rel="icon"]')) ? $JSCompiler_linkTag$jscomp$inline_78_document$jscomp$3$$.getAttribute("href") : 
  void 0);
  $JSCompiler_StaticMethods_updateMetadata_$self$$.$metadata_$ = {title:$title$jscomp$13$$, artist:$artist$jscomp$1$$, album:$album$jscomp$1$$, artwork:[{src:$JSCompiler_metaTag$jscomp$inline_75_JSCompiler_temp$jscomp$29_JSCompiler_temp$jscomp$30$$ || ""}]};
}
$JSCompiler_prototypeAlias$$.renderOutsideViewport = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.pauseCallback = function() {
  this.$audio_$ && this.$audio_$.pause();
};
function $JSCompiler_StaticMethods_isInvocationValid_$$($JSCompiler_StaticMethods_isInvocationValid_$self$$) {
  return $JSCompiler_StaticMethods_isInvocationValid_$self$$.$audio_$ ? $closestAncestorElementBySelector$$module$src$dom$$($JSCompiler_StaticMethods_isInvocationValid_$self$$.element) ? ($user$$module$src$log$$().warn("amp-audio", "<amp-story> elements do not support actions on <amp-audio> elements"), !1) : !0 : !1;
}
$JSCompiler_prototypeAlias$$.$pause_$ = function() {
  $JSCompiler_StaticMethods_isInvocationValid_$$(this) && this.$audio_$.pause();
};
$JSCompiler_prototypeAlias$$.$play_$ = function() {
  $JSCompiler_StaticMethods_isInvocationValid_$$(this) && this.$audio_$.play();
};
function $JSCompiler_StaticMethods_audioPlaying_$$($JSCompiler_StaticMethods_audioPlaying_$self$$) {
  $setMediaSession$$module$src$mediasession_helper$$($JSCompiler_StaticMethods_audioPlaying_$self$$.element, $JSCompiler_StaticMethods_audioPlaying_$self$$.win, $JSCompiler_StaticMethods_audioPlaying_$self$$.$metadata_$, function() {
    $JSCompiler_StaticMethods_audioPlaying_$self$$.$audio_$.play();
  }, function() {
    $JSCompiler_StaticMethods_audioPlaying_$self$$.$audio_$.pause();
  });
}
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-audio", $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-audio-0.1.js.map
