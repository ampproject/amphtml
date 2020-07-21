(self.AMP=self.AMP||[]).push({n:"amp-ad",v:"2007210308000",f:(function(AMP,_){
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
var $JSCompiler_temp$jscomp$34$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$34$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$35$$;
  a: {
    var $JSCompiler_x$jscomp$inline_64$$ = {a:!0}, $JSCompiler_y$jscomp$inline_65$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_65$$.__proto__ = $JSCompiler_x$jscomp$inline_64$$;
      $JSCompiler_inline_result$jscomp$35$$ = $JSCompiler_y$jscomp$inline_65$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_66$$) {
    }
    $JSCompiler_inline_result$jscomp$35$$ = !1;
  }
  $JSCompiler_temp$jscomp$34$$ = $JSCompiler_inline_result$jscomp$35$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$34$$;
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
;var $$jscomp$compprop0$$ = {}, $LAYOUT_ASPECT_RATIO_MAP$$module$ads$google$a4a$shared$content_recommendation$$ = ($$jscomp$compprop0$$.image_stacked = 1 / 1.91, $$jscomp$compprop0$$.image_sidebyside = 1 / 3.82, $$jscomp$compprop0$$.mobile_banner_image_sidebyside = 1 / 3.82, $$jscomp$compprop0$$.pub_control_image_stacked = 1 / 1.91, $$jscomp$compprop0$$.pub_control_image_sidebyside = 1 / 3.82, $$jscomp$compprop0$$.pub_control_image_card_stacked = 1 / 1.91, $$jscomp$compprop0$$.pub_control_image_card_sidebyside = 
1 / 3.74, $$jscomp$compprop0$$.pub_control_text = 0, $$jscomp$compprop0$$.pub_control_text_card = 0, $$jscomp$compprop0$$), $$jscomp$compprop1$$ = {}, $LAYOUT_TEXT_HEIGHT_MAP$$module$ads$google$a4a$shared$content_recommendation$$ = ($$jscomp$compprop1$$.image_stacked = 80, $$jscomp$compprop1$$.image_sidebyside = 0, $$jscomp$compprop1$$.mobile_banner_image_sidebyside = 0, $$jscomp$compprop1$$.pub_control_image_stacked = 80, $$jscomp$compprop1$$.pub_control_image_sidebyside = 0, $$jscomp$compprop1$$.pub_control_image_card_stacked = 
85, $$jscomp$compprop1$$.pub_control_image_card_sidebyside = 0, $$jscomp$compprop1$$.pub_control_text = 80, $$jscomp$compprop1$$.pub_control_text_card = 80, $$jscomp$compprop1$$), $$jscomp$compprop2$$ = {}, $LAYOUT_AD_WIDTH_MAP$$module$ads$google$a4a$shared$content_recommendation$$ = ($$jscomp$compprop2$$.pub_control_image_stacked = 100, $$jscomp$compprop2$$.pub_control_image_sidebyside = 200, $$jscomp$compprop2$$.pub_control_image_card_stacked = 150, $$jscomp$compprop2$$.pub_control_image_card_sidebyside = 
250, $$jscomp$compprop2$$.pub_control_text = 100, $$jscomp$compprop2$$.pub_control_text_card = 150, $$jscomp$compprop2$$);
function $validateAndParsePubControlParams$$module$ads$google$a4a$shared$content_recommendation$$($i$jscomp$7_params$jscomp$1$$) {
  var $numberOfPubControlParams$$ = 0;
  $i$jscomp$7_params$jscomp$1$$.layoutType && $numberOfPubControlParams$$++;
  $i$jscomp$7_params$jscomp$1$$.numberOfColumns && $numberOfPubControlParams$$++;
  $i$jscomp$7_params$jscomp$1$$.numberOfRows && $numberOfPubControlParams$$++;
  if (3 > $numberOfPubControlParams$$) {
    return {validationError:"Tags data-matched-content-ui-type, data-matched-content-columns-num and data-matched-content-rows-num should be set together."};
  }
  var $layoutTypes$$ = $i$jscomp$7_params$jscomp$1$$.layoutType.split(","), $numberOfRows$$ = $i$jscomp$7_params$jscomp$1$$.numberOfRows.split(","), $numberOfColumns$$ = $i$jscomp$7_params$jscomp$1$$.numberOfColumns.split(",");
  if ($layoutTypes$$.length !== $numberOfRows$$.length || $layoutTypes$$.length !== $numberOfColumns$$.length) {
    return {validationError:'Lengths of parameters data-matched-content-ui-type, data-matched-content-columns-num and data-matched-content-rows-num must match. Example: \n data-matched-content-rows-num="4,2"\ndata-matched-content-columns-num="1,6"\ndata-matched-content-ui-type="image_stacked,image_card_sidebyside"'};
  }
  if (2 < $layoutTypes$$.length) {
    return {validationError:"The parameter length of attribute data-matched-content-ui-type, data-matched-content-columns-num and data-matched-content-rows-num is too long. At most 2 parameters for each attribute are needed: one for mobile and one for desktop, while you are providing " + ($layoutTypes$$.length + ' parameters. Example: \n data-matched-content-rows-num="4,2"\ndata-matched-content-columns-num="1,6"\ndata-matched-content-ui-type="image_stacked,image_card_sidebyside".')};
  }
  var $numberOfRowsAsNumbers$$ = [], $numberOfColumnsAsNumbers$$ = [];
  for ($i$jscomp$7_params$jscomp$1$$ = 0; $i$jscomp$7_params$jscomp$1$$ < $layoutTypes$$.length; $i$jscomp$7_params$jscomp$1$$++) {
    var $row$$ = Number($numberOfRows$$[$i$jscomp$7_params$jscomp$1$$]);
    if (isNaN($row$$) || 0 === $row$$) {
      return {validationError:"Wrong value '" + $numberOfRows$$[$i$jscomp$7_params$jscomp$1$$] + "' for data-matched-content-rows-num."};
    }
    $numberOfRowsAsNumbers$$.push($row$$);
    var $col$$ = Number($numberOfColumns$$[$i$jscomp$7_params$jscomp$1$$]);
    if (isNaN($col$$) || 0 === $col$$) {
      return {validationError:"Wrong value '" + $numberOfColumns$$[$i$jscomp$7_params$jscomp$1$$] + "' for data-matched-content-columns-num."};
    }
    $numberOfColumnsAsNumbers$$.push($col$$);
  }
  return {numberOfRows:$numberOfRowsAsNumbers$$, numberOfColumns:$numberOfColumnsAsNumbers$$, layoutTypes:$layoutTypes$$};
}
function $getAutoSlotSize$$module$ads$google$a4a$shared$content_recommendation$$($availableWidth$jscomp$2$$) {
  return 1200 <= $availableWidth$jscomp$2$$ ? {width:1200, height:600} : 850 <= $availableWidth$jscomp$2$$ ? {width:$availableWidth$jscomp$2$$, height:Math.floor(0.5 * $availableWidth$jscomp$2$$)} : 550 <= $availableWidth$jscomp$2$$ ? {width:$availableWidth$jscomp$2$$, height:Math.floor(0.6 * $availableWidth$jscomp$2$$)} : 468 <= $availableWidth$jscomp$2$$ ? {width:$availableWidth$jscomp$2$$, height:Math.floor(0.7 * $availableWidth$jscomp$2$$)} : {width:$availableWidth$jscomp$2$$, height:Math.floor(3.44 * 
  $availableWidth$jscomp$2$$)};
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
  var $params$jscomp$2$$ = Object.create(null);
  if (!$queryString$$) {
    return $params$jscomp$2$$;
  }
  for (var $match$$; $match$$ = $regex$$module$src$url_parse_query_string$$.exec($queryString$$);) {
    var $name$jscomp$71$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$88$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2].replace(/\+/g, " "), $match$$[2]) : "";
    $params$jscomp$2$$[$name$jscomp$71$$] = $value$jscomp$88$$;
  }
  return $params$jscomp$2$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
function $getMode$$module$src$mode$$() {
  var $win$$ = self;
  if ($win$$.__AMP_MODE) {
    var $JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$ = $win$$.__AMP_MODE;
  } else {
    $JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.originalHash || $win$$.location.hash);
    var $JSCompiler_searchQuery$jscomp$inline_73$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $win$$.AMP_CONFIG && $win$$.AMP_CONFIG.v ? $win$$.AMP_CONFIG.v : "012007210308000");
    $JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$ = {localDev:!1, development:!!(0 <= ["1", "actions", "amp", "amp4ads", "amp4email"].indexOf($JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$.development) || $win$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$.development, esm:!1, geoOverride:$JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$["amp-geo"], 
    minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_73$$.amp_lite, test:!1, log:$JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$.log, version:"2007210308000", rtvVersion:$rtvVersion$$module$src$mode$$};
    $JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$ = $win$$.__AMP_MODE = $JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$;
  }
  return $JSCompiler_hashQuery$jscomp$inline_72_JSCompiler_inline_result$jscomp$38_JSCompiler_temp$jscomp$37$$;
}
;var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
function $getMetaUrl$$module$src$config$$($name$jscomp$72$$) {
  if (!self.document || !self.document.head || self.location && $cdnProxyRegex$$module$src$config$$.test(self.location.origin)) {
    return null;
  }
  var $metaEl$$ = self.document.head.querySelector('meta[name="' + $name$jscomp$72$$ + '"]');
  return $metaEl$$ && $metaEl$$.getAttribute("content") || null;
}
var $urls$$module$src$config$$ = {thirdParty:$env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net", thirdPartyFrameHost:$env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net", thirdPartyFrameRegex:("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/, cdn:$env$$module$src$config$$.cdnUrl || $getMetaUrl$$module$src$config$$("runtime-host") || 
"https://cdn.ampproject.org", cdnProxyRegex:$cdnProxyRegex$$module$src$config$$, localhostRegex:/^https?:\/\/localhost(:\d+)?$/, errorReporting:$env$$module$src$config$$.errorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r", betaErrorReporting:$env$$module$src$config$$.betaErrorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta", localDev:$env$$module$src$config$$.localDev || !1, trustedViewerHosts:[/(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/, 
/(^|\.)gmail\.(com|dev)$/], geoApi:$env$$module$src$config$$.geoApiUrl || $getMetaUrl$$module$src$config$$("amp-geo-api")};
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
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$, $opt_4$jscomp$1$$) {
  return $user$$module$src$log$$().assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$, $opt_4$jscomp$1$$, void 0, void 0, void 0, void 0, void 0);
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
function $map$$module$src$utils$object$$($opt_initial$$) {
  var $obj$jscomp$28$$ = Object.create(null);
  $opt_initial$$ && Object.assign($obj$jscomp$28$$, $opt_initial$$);
  return $obj$jscomp$28$$;
}
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $LruCache$$module$src$utils$lru_cache$$() {
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
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_79_key$jscomp$46$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_79_key$jscomp$46$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_79_key$jscomp$46$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_79_key$jscomp$46$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_80$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_82$$;
    for ($JSCompiler_key$jscomp$inline_82$$ in $JSCompiler_cache$jscomp$inline_79_key$jscomp$46$$) {
      var $JSCompiler_access$jscomp$inline_83$$ = $JSCompiler_cache$jscomp$inline_79_key$jscomp$46$$[$JSCompiler_key$jscomp$inline_82$$].access;
      if ($JSCompiler_access$jscomp$inline_83$$ < $JSCompiler_oldest$jscomp$inline_80$$) {
        $JSCompiler_oldest$jscomp$inline_80$$ = $JSCompiler_access$jscomp$inline_83$$;
        var $JSCompiler_oldestKey$jscomp$inline_81$$ = $JSCompiler_key$jscomp$inline_82$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_81$$ && (delete $JSCompiler_cache$jscomp$inline_79_key$jscomp$46$$[$JSCompiler_oldestKey$jscomp$inline_81$$], this.$size_$--);
  }
};
function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
;$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$41_url$jscomp$24$$) {
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new $LruCache$$module$src$utils$lru_cache$$));
  var $JSCompiler_opt_cache$jscomp$inline_86$$ = $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_87$$ = $a$$module$src$url$$;
  if ($JSCompiler_opt_cache$jscomp$inline_86$$ && $JSCompiler_opt_cache$jscomp$inline_86$$.has($JSCompiler_inline_result$jscomp$41_url$jscomp$24$$)) {
    $JSCompiler_inline_result$jscomp$41_url$jscomp$24$$ = $JSCompiler_opt_cache$jscomp$inline_86$$.get($JSCompiler_inline_result$jscomp$41_url$jscomp$24$$);
  } else {
    $JSCompiler_a$jscomp$inline_87$$.href = $JSCompiler_inline_result$jscomp$41_url$jscomp$24$$;
    $JSCompiler_a$jscomp$inline_87$$.protocol || ($JSCompiler_a$jscomp$inline_87$$.href = $JSCompiler_a$jscomp$inline_87$$.href);
    var $JSCompiler_info$jscomp$inline_88$$ = {href:$JSCompiler_a$jscomp$inline_87$$.href, protocol:$JSCompiler_a$jscomp$inline_87$$.protocol, host:$JSCompiler_a$jscomp$inline_87$$.host, hostname:$JSCompiler_a$jscomp$inline_87$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_87$$.port ? "" : $JSCompiler_a$jscomp$inline_87$$.port, pathname:$JSCompiler_a$jscomp$inline_87$$.pathname, search:$JSCompiler_a$jscomp$inline_87$$.search, hash:$JSCompiler_a$jscomp$inline_87$$.hash, origin:null};
    "/" !== $JSCompiler_info$jscomp$inline_88$$.pathname[0] && ($JSCompiler_info$jscomp$inline_88$$.pathname = "/" + $JSCompiler_info$jscomp$inline_88$$.pathname);
    if ("http:" == $JSCompiler_info$jscomp$inline_88$$.protocol && 80 == $JSCompiler_info$jscomp$inline_88$$.port || "https:" == $JSCompiler_info$jscomp$inline_88$$.protocol && 443 == $JSCompiler_info$jscomp$inline_88$$.port) {
      $JSCompiler_info$jscomp$inline_88$$.port = "", $JSCompiler_info$jscomp$inline_88$$.host = $JSCompiler_info$jscomp$inline_88$$.hostname;
    }
    $JSCompiler_info$jscomp$inline_88$$.origin = $JSCompiler_a$jscomp$inline_87$$.origin && "null" != $JSCompiler_a$jscomp$inline_87$$.origin ? $JSCompiler_a$jscomp$inline_87$$.origin : "data:" != $JSCompiler_info$jscomp$inline_88$$.protocol && $JSCompiler_info$jscomp$inline_88$$.host ? $JSCompiler_info$jscomp$inline_88$$.protocol + "//" + $JSCompiler_info$jscomp$inline_88$$.host : $JSCompiler_info$jscomp$inline_88$$.href;
    $JSCompiler_opt_cache$jscomp$inline_86$$ && $JSCompiler_opt_cache$jscomp$inline_86$$.put($JSCompiler_inline_result$jscomp$41_url$jscomp$24$$, $JSCompiler_info$jscomp$inline_88$$);
    $JSCompiler_inline_result$jscomp$41_url$jscomp$24$$ = $JSCompiler_info$jscomp$inline_88$$;
  }
  return $JSCompiler_inline_result$jscomp$41_url$jscomp$24$$;
}
;function $experimentToggles$$module$src$experiments$$($params$jscomp$6_win$jscomp$12$$) {
  if ($params$jscomp$6_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES) {
    return $params$jscomp$6_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $params$jscomp$6_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $params$jscomp$6_win$jscomp$12$$.__AMP__EXPERIMENT_TOGGLES;
  if ($params$jscomp$6_win$jscomp$12$$.AMP_CONFIG) {
    for (var $allowed$8_experimentId$jscomp$2_i$jscomp$17$$ in $params$jscomp$6_win$jscomp$12$$.AMP_CONFIG) {
      var $frequency$$ = $params$jscomp$6_win$jscomp$12$$.AMP_CONFIG[$allowed$8_experimentId$jscomp$2_i$jscomp$17$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$8_experimentId$jscomp$2_i$jscomp$17$$] = Math.random() < $frequency$$);
    }
  }
  if ($params$jscomp$6_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $params$jscomp$6_win$jscomp$12$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $params$jscomp$6_win$jscomp$12$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$8_experimentId$jscomp$2_i$jscomp$17$$ = 0; $allowed$8_experimentId$jscomp$2_i$jscomp$17$$ < $optedInExperiments$$.length; $allowed$8_experimentId$jscomp$2_i$jscomp$17$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$8_experimentId$jscomp$2_i$jscomp$17$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$8_experimentId$jscomp$2_i$jscomp$17$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($params$jscomp$6_win$jscomp$12$$));
  if ($params$jscomp$6_win$jscomp$12$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$8_experimentId$jscomp$2_i$jscomp$17$$ = $params$jscomp$6_win$jscomp$12$$.AMP_CONFIG["allow-url-opt-in"];
    $params$jscomp$6_win$jscomp$12$$ = $parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$6_win$jscomp$12$$.location.originalHash || $params$jscomp$6_win$jscomp$12$$.location.hash);
    for (var $i$9$$ = 0; $i$9$$ < $allowed$8_experimentId$jscomp$2_i$jscomp$17$$.length; $i$9$$++) {
      var $param$jscomp$6$$ = $params$jscomp$6_win$jscomp$12$$["e-" + $allowed$8_experimentId$jscomp$2_i$jscomp$17$$[$i$9$$]];
      "1" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$8_experimentId$jscomp$2_i$jscomp$17$$[$i$9$$]] = !0);
      "0" == $param$jscomp$6$$ && ($toggles$jscomp$2$$[$allowed$8_experimentId$jscomp$2_i$jscomp$17$$[$i$9$$]] = !1);
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
  for (var $i$jscomp$18$$ = 0; $i$jscomp$18$$ < $tokens$$.length; $i$jscomp$18$$++) {
    0 != $tokens$$[$i$jscomp$18$$].length && ("-" == $tokens$$[$i$jscomp$18$$][0] ? $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$18$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$14$$[$tokens$$[$i$jscomp$18$$]] = !0);
  }
  return $toggles$jscomp$3_win$jscomp$14$$;
}
;var $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$ = [{experimentId:"ampdoc-fie", isTrafficEligible:function() {
  return !0;
}, branches:["21065001", "21065002"]}];
function $getService$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$) {
  $win$jscomp$25$$ = $win$jscomp$25$$.__AMP_TOP || ($win$jscomp$25$$.__AMP_TOP = $win$jscomp$25$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$25$$, $id$jscomp$13$$);
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$, $id$jscomp$17$$) {
  var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, $id$jscomp$17$$);
}
function $getServicePromiseOrNullForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$2$$, $id$jscomp$20$$) {
  return $getServicePromiseOrNullInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($elementOrAmpDoc$jscomp$2$$), $id$jscomp$20$$);
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
function $getServicePromiseInternal$$module$src$service$$($holder$jscomp$6_services$jscomp$2$$, $id$jscomp$23$$) {
  var $cached$$ = $getServicePromiseOrNullInternal$$module$src$service$$($holder$jscomp$6_services$jscomp$2$$, $id$jscomp$23$$);
  if ($cached$$) {
    return $cached$$;
  }
  $holder$jscomp$6_services$jscomp$2$$ = $getServices$$module$src$service$$($holder$jscomp$6_services$jscomp$2$$);
  $holder$jscomp$6_services$jscomp$2$$[$id$jscomp$23$$] = $emptyServiceHolderWithPromise$$module$src$service$$();
  return $holder$jscomp$6_services$jscomp$2$$[$id$jscomp$23$$].promise;
}
function $getServicePromiseOrNullInternal$$module$src$service$$($holder$jscomp$8$$, $id$jscomp$25$$) {
  var $s$jscomp$12$$ = $getServices$$module$src$service$$($holder$jscomp$8$$)[$id$jscomp$25$$];
  if ($s$jscomp$12$$) {
    if ($s$jscomp$12$$.promise) {
      return $s$jscomp$12$$.promise;
    }
    $getServiceInternal$$module$src$service$$($holder$jscomp$8$$, $id$jscomp$25$$);
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
var $scopeSelectorSupported$$module$src$css$$;
function $closest$$module$src$dom$$($el$jscomp$2_element$jscomp$21$$, $callback$jscomp$53$$) {
  for (; $el$jscomp$2_element$jscomp$21$$ && void 0 !== $el$jscomp$2_element$jscomp$21$$; $el$jscomp$2_element$jscomp$21$$ = $el$jscomp$2_element$jscomp$21$$.parentElement) {
    if ($callback$jscomp$53$$($el$jscomp$2_element$jscomp$21$$)) {
      return $el$jscomp$2_element$jscomp$21$$;
    }
  }
  return null;
}
function $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$22$$) {
  return $element$jscomp$22$$.closest ? $element$jscomp$22$$.closest("BODY") : $closest$$module$src$dom$$($element$jscomp$22$$, function($element$jscomp$22$$) {
    var $el$jscomp$3$$ = $element$jscomp$22$$.matches || $element$jscomp$22$$.webkitMatchesSelector || $element$jscomp$22$$.mozMatchesSelector || $element$jscomp$22$$.msMatchesSelector || $element$jscomp$22$$.oMatchesSelector;
    return $el$jscomp$3$$ ? $el$jscomp$3$$.call($element$jscomp$22$$, "BODY") : !1;
  });
}
function $ancestorElements$$module$src$dom$$($child$$, $predicate$$) {
  for (var $ancestors$$ = [], $ancestor$$ = $child$$.parentElement; $ancestor$$; $ancestor$$ = $ancestor$$.parentElement) {
    $predicate$$($ancestor$$) && $ancestors$$.push($ancestor$$);
  }
  return $ancestors$$;
}
function $ancestorElementsByTag$$module$src$dom$$($child$jscomp$1$$) {
  var $tagName$jscomp$5$$ = "amp-fx-flying-carpet";
  /^[\w-]+$/.test($tagName$jscomp$5$$);
  $tagName$jscomp$5$$ = $tagName$jscomp$5$$.toUpperCase();
  return $ancestorElements$$module$src$dom$$($child$jscomp$1$$, function($child$jscomp$1$$) {
    return $child$jscomp$1$$.tagName == $tagName$jscomp$5$$;
  });
}
;function $getElementServiceForDoc$$module$src$element_service$$($element$jscomp$36$$) {
  return $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$36$$, "userNotificationManager", "amp-user-notification", void 0).then(function($element$jscomp$36$$) {
    return $userAssert$$module$src$log$$($element$jscomp$36$$, "Service %s was requested to be provided through %s, but %s is not loaded in the current page. To fix this problem load the JavaScript file for %s in this page.", "userNotificationManager", "amp-user-notification", "amp-user-notification", "amp-user-notification");
  });
}
function $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$37$$, $id$jscomp$34$$, $extension$jscomp$3$$, $opt_element$jscomp$10$$) {
  var $s$jscomp$14$$ = $getServicePromiseOrNullForDoc$$module$src$service$$($element$jscomp$37$$, $id$jscomp$34$$);
  if ($s$jscomp$14$$) {
    return $s$jscomp$14$$;
  }
  var $ampdoc$jscomp$9$$ = $getAmpdoc$$module$src$service$$($element$jscomp$37$$);
  return $ampdoc$jscomp$9$$.waitForBodyOpen().then(function() {
    var $element$jscomp$37$$ = $ampdoc$jscomp$9$$.win;
    var $id$jscomp$34$$ = $ampdoc$jscomp$9$$.win.document.head;
    if ($id$jscomp$34$$) {
      var $opt_element$jscomp$10$$ = {};
      $id$jscomp$34$$ = $id$jscomp$34$$.querySelectorAll("script[custom-element],script[custom-template]");
      for (var $s$jscomp$14$$ = 0; $s$jscomp$14$$ < $id$jscomp$34$$.length; $s$jscomp$14$$++) {
        var $JSCompiler_name$jscomp$inline_350_JSCompiler_script$jscomp$inline_349$$ = $id$jscomp$34$$[$s$jscomp$14$$];
        $JSCompiler_name$jscomp$inline_350_JSCompiler_script$jscomp$inline_349$$ = $JSCompiler_name$jscomp$inline_350_JSCompiler_script$jscomp$inline_349$$.getAttribute("custom-element") || $JSCompiler_name$jscomp$inline_350_JSCompiler_script$jscomp$inline_349$$.getAttribute("custom-template");
        $opt_element$jscomp$10$$[$JSCompiler_name$jscomp$inline_350_JSCompiler_script$jscomp$inline_349$$] = !0;
      }
      $opt_element$jscomp$10$$ = Object.keys($opt_element$jscomp$10$$);
    } else {
      $opt_element$jscomp$10$$ = [];
    }
    return $opt_element$jscomp$10$$.includes($extension$jscomp$3$$) ? $getService$$module$src$service$$($element$jscomp$37$$, "extensions").waitForExtension($element$jscomp$37$$, $extension$jscomp$3$$) : $resolvedPromise$$module$src$resolved_promise$$();
  }).then(function() {
    if ($opt_element$jscomp$10$$) {
      var $s$jscomp$14$$ = $getServicePromiseOrNullForDoc$$module$src$service$$($element$jscomp$37$$, $id$jscomp$34$$);
    } else {
      $s$jscomp$14$$ = $ampdoc$jscomp$9$$.win, $s$jscomp$14$$ = $s$jscomp$14$$.__AMP_EXTENDED_ELEMENTS && $s$jscomp$14$$.__AMP_EXTENDED_ELEMENTS[$extension$jscomp$3$$] ? $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($element$jscomp$37$$), $id$jscomp$34$$) : null;
    }
    return $s$jscomp$14$$;
  });
}
;function $Services$$module$src$services$consentPolicyServiceForDocOrNull$$($element$jscomp$58$$) {
  return $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$58$$, "consentPolicyManager", "amp-consent");
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyle$$module$src$style$$($element$jscomp$64$$, $JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$97$$, $opt_units$$) {
  var $JSCompiler_style$jscomp$inline_106$$ = $element$jscomp$64$$.style;
  if (!$startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$, "--")) {
    $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = $map$$module$src$utils$object$$());
    var $JSCompiler_propertyName$jscomp$inline_109$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$];
    if (!$JSCompiler_propertyName$jscomp$inline_109$$) {
      $JSCompiler_propertyName$jscomp$inline_109$$ = $JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$;
      if (void 0 === $JSCompiler_style$jscomp$inline_106$$[$JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$]) {
        var $JSCompiler_inline_result$jscomp$245_JSCompiler_inline_result$jscomp$246_JSCompiler_prefixedPropertyName$jscomp$inline_111$$ = $JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$.charAt(0).toUpperCase() + $JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$.slice(1);
        b: {
          for (var $JSCompiler_i$jscomp$inline_263$$ = 0; $JSCompiler_i$jscomp$inline_263$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_263$$++) {
            var $JSCompiler_propertyName$jscomp$inline_264$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_263$$] + $JSCompiler_inline_result$jscomp$245_JSCompiler_inline_result$jscomp$246_JSCompiler_prefixedPropertyName$jscomp$inline_111$$;
            if (void 0 !== $JSCompiler_style$jscomp$inline_106$$[$JSCompiler_propertyName$jscomp$inline_264$$]) {
              $JSCompiler_inline_result$jscomp$245_JSCompiler_inline_result$jscomp$246_JSCompiler_prefixedPropertyName$jscomp$inline_111$$ = $JSCompiler_propertyName$jscomp$inline_264$$;
              break b;
            }
          }
          $JSCompiler_inline_result$jscomp$245_JSCompiler_inline_result$jscomp$246_JSCompiler_prefixedPropertyName$jscomp$inline_111$$ = "";
        }
        void 0 !== $JSCompiler_style$jscomp$inline_106$$[$JSCompiler_inline_result$jscomp$245_JSCompiler_inline_result$jscomp$246_JSCompiler_prefixedPropertyName$jscomp$inline_111$$] && ($JSCompiler_propertyName$jscomp$inline_109$$ = $JSCompiler_inline_result$jscomp$245_JSCompiler_inline_result$jscomp$246_JSCompiler_prefixedPropertyName$jscomp$inline_111$$);
      }
      $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$] = $JSCompiler_propertyName$jscomp$inline_109$$;
    }
    $JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$ = $JSCompiler_propertyName$jscomp$inline_109$$;
  }
  if ($JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$) {
    var $styleValue$$ = $opt_units$$ ? $value$jscomp$97$$ + $opt_units$$ : $value$jscomp$97$$;
    $startsWith$$module$src$string$$($JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$, "--") ? $element$jscomp$64$$.style.setProperty($JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$, $styleValue$$) : $element$jscomp$64$$.style[$JSCompiler_inline_result$jscomp$50_property$jscomp$7_propertyName$jscomp$10$$] = $styleValue$$;
  }
}
;var $CONTAINERS$$module$src$ad_helper$$ = {"AMP-FX-FLYING-CARPET":!0, "AMP-LIGHTBOX":!0, "AMP-STICKY-AD":!0, "AMP-LIGHTBOX-GALLERY":!0};
function $isAdPositionAllowed$$module$src$ad_helper$$($el$jscomp$10_element$jscomp$69$$, $win$jscomp$56$$) {
  var $hasFixedAncestor$$ = !1, $containers$$ = 0;
  do {
    if ($CONTAINERS$$module$src$ad_helper$$[$el$jscomp$10_element$jscomp$69$$.tagName]) {
      $containers$$++, $hasFixedAncestor$$ = !1;
    } else {
      var $JSCompiler_position$jscomp$inline_115$$ = ($win$jscomp$56$$.getComputedStyle($el$jscomp$10_element$jscomp$69$$) || $map$$module$src$utils$object$$()).position;
      "fixed" != $JSCompiler_position$jscomp$inline_115$$ && "sticky" != $JSCompiler_position$jscomp$inline_115$$ || ($hasFixedAncestor$$ = !0);
    }
    $el$jscomp$10_element$jscomp$69$$ = $el$jscomp$10_element$jscomp$69$$.parentElement;
  } while ($el$jscomp$10_element$jscomp$69$$ && "BODY" != $el$jscomp$10_element$jscomp$69$$.tagName);
  return !$hasFixedAncestor$$ && 1 >= $containers$$;
}
function $getAdContainer$$module$src$ad_helper$$($element$jscomp$70$$) {
  if (void 0 === $element$jscomp$70$$.__AMP__AD_CONTAINER) {
    for (var $el$jscomp$11$$ = $element$jscomp$70$$.parentElement; $el$jscomp$11$$ && "BODY" != $el$jscomp$11$$.tagName;) {
      if ($CONTAINERS$$module$src$ad_helper$$[$el$jscomp$11$$.tagName]) {
        return $element$jscomp$70$$.__AMP__AD_CONTAINER = $el$jscomp$11$$.tagName;
      }
      $el$jscomp$11$$ = $el$jscomp$11$$.parentElement;
    }
    $element$jscomp$70$$.__AMP__AD_CONTAINER = null;
  }
  return $element$jscomp$70$$.__AMP__AD_CONTAINER;
}
;function $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$($JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$) {
  this.$baseInstance_$ = $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$;
  this.$element_$ = $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$.element;
  this.$doc_$ = $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$.win.document;
  this.$containerElement_$ = null;
  if (this.$element_$.hasAttribute("data-ad-container-id")) {
    var $JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$ = this.$element_$.getAttribute("data-ad-container-id");
    ($JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$ = this.$doc_$.getElementById($JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$)) && "AMP-LAYOUT" == $JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$.tagName && $JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$.contains(this.$element_$) && (this.$containerElement_$ = $JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$);
  }
  $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$.getFallback() || ("AMP-EMBED" == this.$element_$.tagName ? $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$ = null : ($JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$ = this.$doc_$.createElement("div"), $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$.setAttribute("fallback", 
  ""), $JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$ = this.$doc_$.createElement("div"), $JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$.classList.add("i-amphtml-ad-default-holder"), $JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$.setAttribute("data-ad-holder-text", "Ad"), $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$.appendChild($JSCompiler_content$jscomp$inline_120_container$jscomp$4_id$jscomp$38$$)), 
  $JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$ && this.$baseInstance_$.element.appendChild($JSCompiler_inline_result$jscomp$52_JSCompiler_uiComponent$jscomp$inline_119_baseInstance$jscomp$2_fallback$jscomp$1$$));
}
$AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$.prototype.applyNoContentUI = function() {
  var $$jscomp$this$jscomp$2$$ = this;
  if ("AMP-STICKY-AD" === $getAdContainer$$module$src$ad_helper$$(this.$element_$)) {
    this.$baseInstance_$.collapse();
  } else {
    if ("AMP-FX-FLYING-CARPET" === $getAdContainer$$module$src$ad_helper$$(this.$element_$)) {
      $ancestorElementsByTag$$module$src$dom$$(this.$element_$)[0].getImpl().then(function($attemptCollapsePromise$$) {
        var $implementation$$ = $attemptCollapsePromise$$.getChildren();
        1 === $implementation$$.length && $implementation$$[0] === $$jscomp$this$jscomp$2$$.$element_$ && $$jscomp$this$jscomp$2$$.$baseInstance_$.collapse();
      });
    } else {
      if (this.$containerElement_$) {
        var $attemptCollapsePromise$$ = $getServiceForDoc$$module$src$service$$(this.$element_$.getAmpDoc(), "mutator").attemptCollapse(this.$containerElement_$);
        $attemptCollapsePromise$$.then(function() {
        });
      } else {
        $attemptCollapsePromise$$ = this.$baseInstance_$.attemptCollapse();
      }
      $attemptCollapsePromise$$.catch(function() {
        $$jscomp$this$jscomp$2$$.$baseInstance_$.mutateElement(function() {
          $$jscomp$this$jscomp$2$$.$baseInstance_$.togglePlaceholder(!1);
          $$jscomp$this$jscomp$2$$.$baseInstance_$.toggleFallback(!0);
        });
      });
    }
  }
};
$AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$.prototype.applyUnlayoutUI = function() {
  var $$jscomp$this$jscomp$3$$ = this;
  this.$baseInstance_$.mutateElement(function() {
    $$jscomp$this$jscomp$3$$.$baseInstance_$.toggleFallback(!1);
  });
};
$AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$.prototype.updateSize = function($height$jscomp$27$$, $width$jscomp$28$$, $iframeHeight$$, $iframeWidth$$, $event$jscomp$5$$) {
  var $newHeight$$, $newWidth$$;
  $height$jscomp$27$$ = parseInt($height$jscomp$27$$, 10);
  isNaN($height$jscomp$27$$) || ($newHeight$$ = Math.max(this.$element_$.offsetHeight + $height$jscomp$27$$ - $iframeHeight$$, $height$jscomp$27$$));
  $width$jscomp$28$$ = parseInt($width$jscomp$28$$, 10);
  isNaN($width$jscomp$28$$) || ($newWidth$$ = Math.max(this.$element_$.offsetWidth + $width$jscomp$28$$ - $iframeWidth$$, $width$jscomp$28$$));
  var $resizeInfo$$ = {success:!0, newWidth:$newWidth$$, newHeight:$newHeight$$};
  return $newHeight$$ || $newWidth$$ ? "AMP-STICKY-AD" == $getAdContainer$$module$src$ad_helper$$(this.$element_$) ? ($resizeInfo$$.success = !1, Promise.resolve($resizeInfo$$)) : this.$baseInstance_$.attemptChangeSize($newHeight$$, $newWidth$$, $event$jscomp$5$$).then(function() {
    return $resizeInfo$$;
  }, function() {
    $resizeInfo$$.success = !1;
    return $resizeInfo$$;
  }) : Promise.reject(Error("undefined width and height"));
};
AMP.AmpAdUIHandler = $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$;
function $tryParseJson$$module$src$json$$($json$jscomp$1$$, $opt_onFailed$$) {
  try {
    return JSON.parse($json$jscomp$1$$);
  } catch ($e$jscomp$20$$) {
    return $opt_onFailed$$ && $opt_onFailed$$($e$jscomp$20$$), null;
  }
}
;function $deserializeMessage$$module$src$3p_frame_messaging$$($message$jscomp$36$$) {
  if (!$isAmpMessage$$module$src$3p_frame_messaging$$($message$jscomp$36$$)) {
    return null;
  }
  var $startPos$$ = $message$jscomp$36$$.indexOf("{");
  try {
    return JSON.parse($message$jscomp$36$$.substr($startPos$$));
  } catch ($e$jscomp$21$$) {
    return $dev$$module$src$log$$().error("MESSAGING", "Failed to parse message: " + $message$jscomp$36$$, $e$jscomp$21$$), null;
  }
}
function $isAmpMessage$$module$src$3p_frame_messaging$$($message$jscomp$37$$) {
  return "string" == typeof $message$jscomp$37$$ && 0 == $message$jscomp$37$$.indexOf("amp-") && -1 != $message$jscomp$37$$.indexOf("{");
}
;function $remove$$module$src$utils$array$$($array$jscomp$9$$, $shouldRemove$$) {
  for (var $removed$$ = [], $index$jscomp$79$$ = 0, $i$jscomp$27$$ = 0; $i$jscomp$27$$ < $array$jscomp$9$$.length; $i$jscomp$27$$++) {
    var $item$jscomp$1$$ = $array$jscomp$9$$[$i$jscomp$27$$];
    $shouldRemove$$($item$jscomp$1$$, $i$jscomp$27$$, $array$jscomp$9$$) ? $removed$$.push($item$jscomp$1$$) : ($index$jscomp$79$$ < $i$jscomp$27$$ && ($array$jscomp$9$$[$index$jscomp$79$$] = $item$jscomp$1$$), $index$jscomp$79$$++);
  }
  $index$jscomp$79$$ < $array$jscomp$9$$.length && ($array$jscomp$9$$.length = $index$jscomp$79$$);
}
;function $getListenForSentinel$$module$src$iframe_helper$$($JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$, $sentinel$jscomp$1$$, $opt_create$jscomp$1$$) {
  var $JSCompiler_listeningFors$jscomp$inline_124$$ = $JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$.listeningFors;
  !$JSCompiler_listeningFors$jscomp$inline_124$$ && $opt_create$jscomp$1$$ && ($JSCompiler_listeningFors$jscomp$inline_124$$ = $JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$.listeningFors = Object.create(null));
  $JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$ = $JSCompiler_listeningFors$jscomp$inline_124$$ || null;
  if (!$JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$) {
    return $JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$;
  }
  var $listenSentinel$$ = $JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$[$sentinel$jscomp$1$$];
  !$listenSentinel$$ && $opt_create$jscomp$1$$ && ($listenSentinel$$ = $JSCompiler_inline_result$jscomp$53_parentWin$jscomp$2$$[$sentinel$jscomp$1$$] = []);
  return $listenSentinel$$ || null;
}
function $getOrCreateListenForEvents$$module$src$iframe_helper$$($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $iframe$$, $opt_is3P$$) {
  var $i$jscomp$29_sentinel$jscomp$2$$ = $opt_is3P$$ ? $iframe$$.getAttribute("data-amp-3p-sentinel") : "amp";
  $listenSentinel$jscomp$1_parentWin$jscomp$3$$ = $getListenForSentinel$$module$src$iframe_helper$$($listenSentinel$jscomp$1_parentWin$jscomp$3$$, $i$jscomp$29_sentinel$jscomp$2$$, !0);
  for ($i$jscomp$29_sentinel$jscomp$2$$ = 0; $i$jscomp$29_sentinel$jscomp$2$$ < $listenSentinel$jscomp$1_parentWin$jscomp$3$$.length; $i$jscomp$29_sentinel$jscomp$2$$++) {
    var $we$$ = $listenSentinel$jscomp$1_parentWin$jscomp$3$$[$i$jscomp$29_sentinel$jscomp$2$$];
    if ($we$$.frame === $iframe$$) {
      var $windowEvents$$ = $we$$;
      break;
    }
  }
  $windowEvents$$ || ($windowEvents$$ = {frame:$iframe$$, events:Object.create(null)}, $listenSentinel$jscomp$1_parentWin$jscomp$3$$.push($windowEvents$$));
  return $windowEvents$$.events;
}
function $dropListenSentinel$$module$src$iframe_helper$$($listenSentinel$jscomp$3$$) {
  for (var $noopData$$ = $dict$$module$src$utils$object$$({sentinel:"unlisten"}), $i$jscomp$31$$ = $listenSentinel$jscomp$3$$.length - 1; 0 <= $i$jscomp$31$$; $i$jscomp$31$$--) {
    var $windowEvents$jscomp$2$$ = $listenSentinel$jscomp$3$$[$i$jscomp$31$$];
    if (!$windowEvents$jscomp$2$$.frame.contentWindow) {
      $listenSentinel$jscomp$3$$.splice($i$jscomp$31$$, 1);
      var $events$$ = $windowEvents$jscomp$2$$.events, $name$jscomp$79$$;
      for ($name$jscomp$79$$ in $events$$) {
        $events$$[$name$jscomp$79$$].splice(0, Infinity).forEach(function($listenSentinel$jscomp$3$$) {
          $listenSentinel$jscomp$3$$($noopData$$);
        });
      }
    }
  }
}
function $registerGlobalListenerIfNeeded$$module$src$iframe_helper$$($parentWin$jscomp$5$$) {
  $parentWin$jscomp$5$$.listeningFors || $parentWin$jscomp$5$$.addEventListener("message", function($event$jscomp$11$$) {
    if ($event$jscomp$11$$.data) {
      var $data$jscomp$78$$ = $parseIfNeeded$$module$src$iframe_helper$$($event$jscomp$11$$.data);
      if ($data$jscomp$78$$ && $data$jscomp$78$$.sentinel) {
        var $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$ = $event$jscomp$11$$.source;
        var $JSCompiler_listenSentinel$jscomp$inline_129$$ = $getListenForSentinel$$module$src$iframe_helper$$($parentWin$jscomp$5$$, $data$jscomp$78$$.sentinel);
        if ($JSCompiler_listenSentinel$jscomp$inline_129$$) {
          for (var $JSCompiler_windowEvents$jscomp$inline_130$$, $JSCompiler_i$jscomp$inline_131$$ = 0; $JSCompiler_i$jscomp$inline_131$$ < $JSCompiler_listenSentinel$jscomp$inline_129$$.length; $JSCompiler_i$jscomp$inline_131$$++) {
            var $JSCompiler_we$jscomp$inline_132$$ = $JSCompiler_listenSentinel$jscomp$inline_129$$[$JSCompiler_i$jscomp$inline_131$$], $JSCompiler_contentWindow$jscomp$inline_133$$ = $JSCompiler_we$jscomp$inline_132$$.frame.contentWindow;
            if ($JSCompiler_contentWindow$jscomp$inline_133$$) {
              var $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$;
              if (!($JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ = $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$ == $JSCompiler_contentWindow$jscomp$inline_133$$)) {
                b: {
                  for ($JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ = $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$; $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ && $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ != $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$.parent; $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ = $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$.parent) {
                    if ($JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ == $JSCompiler_contentWindow$jscomp$inline_133$$) {
                      $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ = !0;
                      break b;
                    }
                  }
                  $JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$ = !1;
                }
              }
              if ($JSCompiler_temp$jscomp$248_JSCompiler_win$jscomp$inline_268$$) {
                $JSCompiler_windowEvents$jscomp$inline_130$$ = $JSCompiler_we$jscomp$inline_132$$;
                break;
              }
            } else {
              setTimeout($dropListenSentinel$$module$src$iframe_helper$$, 0, $JSCompiler_listenSentinel$jscomp$inline_129$$);
            }
          }
          $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$ = $JSCompiler_windowEvents$jscomp$inline_130$$ ? $JSCompiler_windowEvents$jscomp$inline_130$$.events : null;
        } else {
          $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$ = $JSCompiler_listenSentinel$jscomp$inline_129$$;
        }
        var $listenForEvents$$ = $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$;
        if ($listenForEvents$$) {
          var $listeners$$ = $listenForEvents$$[$data$jscomp$78$$.type];
          if ($listeners$$) {
            for ($listeners$$ = $listeners$$.slice(), $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$ = 0; $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$ < $listeners$$.length; $JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$++) {
              (0,$listeners$$[$JSCompiler_inline_result$jscomp$54_JSCompiler_triggerWin$jscomp$inline_128_i$jscomp$32$$])($data$jscomp$78$$, $event$jscomp$11$$.source, $event$jscomp$11$$.origin, $event$jscomp$11$$);
            }
          }
        }
      }
    }
  });
}
function $listenFor$$module$src$iframe_helper$$($iframe$jscomp$1$$, $typeOfMessage$$, $callback$jscomp$59$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $opt_includingNestedWindows$$) {
  function $listener$jscomp$69$$($typeOfMessage$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $listener$jscomp$69$$, $parentWin$jscomp$6$$) {
    if ("amp" == $typeOfMessage$$.sentinel) {
      if ($listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ != $iframe$jscomp$1$$.contentWindow) {
        return;
      }
      var $data$jscomp$79$$ = "null" == $listener$jscomp$69$$ && void 0;
      if ($iframeOrigin$$ != $listener$jscomp$69$$ && !$data$jscomp$79$$) {
        return;
      }
    }
    if ($opt_includingNestedWindows$$ || $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ == $iframe$jscomp$1$$.contentWindow) {
      "unlisten" == $typeOfMessage$$.sentinel ? $unlisten$jscomp$2$$() : $callback$jscomp$59$$($typeOfMessage$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$, $listener$jscomp$69$$, $parentWin$jscomp$6$$);
    }
  }
  var $parentWin$jscomp$6$$ = $iframe$jscomp$1$$.ownerDocument.defaultView;
  $registerGlobalListenerIfNeeded$$module$src$iframe_helper$$($parentWin$jscomp$6$$);
  $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$ = $getOrCreateListenForEvents$$module$src$iframe_helper$$($parentWin$jscomp$6$$, $iframe$jscomp$1$$, $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$);
  var $iframeOrigin$$ = $parseUrlDeprecated$$module$src$url$$($iframe$jscomp$1$$.src).origin, $events$jscomp$1$$ = $listenForEvents$jscomp$1_opt_is3P$jscomp$1$$[$typeOfMessage$$] || ($listenForEvents$jscomp$1_opt_is3P$jscomp$1$$[$typeOfMessage$$] = []), $unlisten$jscomp$2$$;
  $events$jscomp$1$$.push($listener$jscomp$69$$);
  return $unlisten$jscomp$2$$ = function() {
    if ($listener$jscomp$69$$) {
      var $iframe$jscomp$1$$ = $events$jscomp$1$$.indexOf($listener$jscomp$69$$);
      -1 < $iframe$jscomp$1$$ && $events$jscomp$1$$.splice($iframe$jscomp$1$$, 1);
      $callback$jscomp$59$$ = $events$jscomp$1$$ = $listener$jscomp$69$$ = null;
    }
  };
}
function $listenForOncePromise$$module$src$iframe_helper$$($iframe$jscomp$2$$, $typeOfMessages$$) {
  var $unlistenList$$ = [];
  "string" == typeof $typeOfMessages$$ && ($typeOfMessages$$ = [$typeOfMessages$$]);
  return new Promise(function($resolve$jscomp$9$$) {
    for (var $i$jscomp$33$$ = 0; $i$jscomp$33$$ < $typeOfMessages$$.length; $i$jscomp$33$$++) {
      var $unlisten$jscomp$3$$ = $listenFor$$module$src$iframe_helper$$($iframe$jscomp$2$$, $typeOfMessages$$[$i$jscomp$33$$], function($iframe$jscomp$2$$, $typeOfMessages$$, $i$jscomp$33$$, $unlisten$jscomp$3$$) {
        for (var $data$jscomp$80$$ = 0; $data$jscomp$80$$ < $unlistenList$$.length; $data$jscomp$80$$++) {
          $unlistenList$$[$data$jscomp$80$$]();
        }
        $resolve$jscomp$9$$({data:$iframe$jscomp$2$$, source:$typeOfMessages$$, origin:$i$jscomp$33$$, event:$unlisten$jscomp$3$$});
      }, !0);
      $unlistenList$$.push($unlisten$jscomp$3$$);
    }
  });
}
function $postMessageToWindows$$module$src$iframe_helper$$($iframe$jscomp$4_payload$jscomp$1$$, $targets$$, $type$jscomp$151$$, $i$jscomp$34_object$jscomp$2$$, $opt_is3P$jscomp$4_target$jscomp$99$$) {
  if ($iframe$jscomp$4_payload$jscomp$1$$.contentWindow) {
    for ($i$jscomp$34_object$jscomp$2$$.type = $type$jscomp$151$$, $i$jscomp$34_object$jscomp$2$$.sentinel = $opt_is3P$jscomp$4_target$jscomp$99$$ ? $iframe$jscomp$4_payload$jscomp$1$$.getAttribute("data-amp-3p-sentinel") : "amp", $iframe$jscomp$4_payload$jscomp$1$$ = $i$jscomp$34_object$jscomp$2$$, $opt_is3P$jscomp$4_target$jscomp$99$$ && ($iframe$jscomp$4_payload$jscomp$1$$ = "amp-" + JSON.stringify($i$jscomp$34_object$jscomp$2$$)), $i$jscomp$34_object$jscomp$2$$ = 0; $i$jscomp$34_object$jscomp$2$$ < 
    $targets$$.length; $i$jscomp$34_object$jscomp$2$$++) {
      $opt_is3P$jscomp$4_target$jscomp$99$$ = $targets$$[$i$jscomp$34_object$jscomp$2$$], $opt_is3P$jscomp$4_target$jscomp$99$$.win.postMessage($iframe$jscomp$4_payload$jscomp$1$$, $opt_is3P$jscomp$4_target$jscomp$99$$.origin);
    }
  }
}
function $parseIfNeeded$$module$src$iframe_helper$$($data$jscomp$81$$) {
  "string" == typeof $data$jscomp$81$$ && ($data$jscomp$81$$ = "{" == $data$jscomp$81$$.charAt(0) ? $tryParseJson$$module$src$json$$($data$jscomp$81$$, function($data$jscomp$81$$) {
    $dev$$module$src$log$$().warn("IFRAME-HELPER", "Postmessage could not be parsed. Is it in a valid JSON format?", $data$jscomp$81$$);
  }) || null : $isAmpMessage$$module$src$3p_frame_messaging$$($data$jscomp$81$$) ? $deserializeMessage$$module$src$3p_frame_messaging$$($data$jscomp$81$$) : null);
  return $data$jscomp$81$$;
}
function $SubscriptionApi$$module$src$iframe_helper$$($iframe$jscomp$6$$, $type$jscomp$152$$, $requestCallback$$) {
  var $$jscomp$this$jscomp$4$$ = this;
  this.$iframe_$ = $iframe$jscomp$6$$;
  this.$is3p_$ = !0;
  this.$clientWindows_$ = [];
  this.$unlisten_$ = $listenFor$$module$src$iframe_helper$$(this.$iframe_$, $type$jscomp$152$$, function($iframe$jscomp$6$$, $type$jscomp$152$$, $origin$jscomp$5$$) {
    $$jscomp$this$jscomp$4$$.$clientWindows_$.some(function($iframe$jscomp$6$$) {
      return $iframe$jscomp$6$$.win == $type$jscomp$152$$;
    }) || $$jscomp$this$jscomp$4$$.$clientWindows_$.push({win:$type$jscomp$152$$, origin:$origin$jscomp$5$$});
    $requestCallback$$($iframe$jscomp$6$$, $type$jscomp$152$$, $origin$jscomp$5$$);
  }, this.$is3p_$, this.$is3p_$);
}
$SubscriptionApi$$module$src$iframe_helper$$.prototype.send = function($type$jscomp$153$$, $data$jscomp$83$$) {
  $remove$$module$src$utils$array$$(this.$clientWindows_$, function($type$jscomp$153$$) {
    return !$type$jscomp$153$$.win.parent;
  });
  $postMessageToWindows$$module$src$iframe_helper$$(this.$iframe_$, this.$clientWindows_$, $type$jscomp$153$$, $data$jscomp$83$$, this.$is3p_$);
};
$SubscriptionApi$$module$src$iframe_helper$$.prototype.destroy = function() {
  this.$unlisten_$();
  this.$clientWindows_$.length = 0;
};
function $makePausable$$module$src$iframe_helper$$($iframe$jscomp$9$$) {
  var $oldAllow$$ = ($iframe$jscomp$9$$.getAttribute("allow") || "").trim();
  $iframe$jscomp$9$$.setAttribute("allow", "execution-while-not-rendered 'none';" + $oldAllow$$);
}
;function $moveLayoutRect$$module$src$layout_rect$$($JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$, $JSCompiler_left$jscomp$inline_135_dx$jscomp$4$$, $JSCompiler_top$jscomp$inline_136_dy$jscomp$4$$) {
  if (!(0 == $JSCompiler_left$jscomp$inline_135_dx$jscomp$4$$ && 0 == $JSCompiler_top$jscomp$inline_136_dy$jscomp$4$$ || 0 == $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$.width && 0 == $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$.height)) {
    $JSCompiler_left$jscomp$inline_135_dx$jscomp$4$$ = $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$.left + $JSCompiler_left$jscomp$inline_135_dx$jscomp$4$$;
    $JSCompiler_top$jscomp$inline_136_dy$jscomp$4$$ = $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$.top + $JSCompiler_top$jscomp$inline_136_dy$jscomp$4$$;
    var $JSCompiler_width$jscomp$inline_137$$ = $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$.width;
    $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$ = $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$.height;
    $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$ = {left:$JSCompiler_left$jscomp$inline_135_dx$jscomp$4$$, top:$JSCompiler_top$jscomp$inline_136_dy$jscomp$4$$, width:$JSCompiler_width$jscomp$inline_137$$, height:$JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$, bottom:$JSCompiler_top$jscomp$inline_136_dy$jscomp$4$$ + $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$, right:$JSCompiler_left$jscomp$inline_135_dx$jscomp$4$$ + 
    $JSCompiler_width$jscomp$inline_137$$, x:$JSCompiler_left$jscomp$inline_135_dx$jscomp$4$$, y:$JSCompiler_top$jscomp$inline_136_dy$jscomp$4$$};
  }
  return $JSCompiler_height$jscomp$inline_138_JSCompiler_temp$jscomp$57_rect$jscomp$2$$;
}
;function $IntersectionObserverHostForAd$$module$extensions$amp_ad$0_1$intersection_observer_host$$($baseElement$$, $iframe$jscomp$12$$) {
  var $$jscomp$this$jscomp$5$$ = this;
  this.$baseElement_$ = $baseElement$$;
  this.$timer_$ = $getService$$module$src$service$$($baseElement$$.win, "timer");
  this.inViewport_ = this.$shouldSendIntersectionChanges_$ = !1;
  this.$pendingChanges_$ = [];
  this.$flushTimeout_$ = 0;
  this.$boundFlush_$ = this.$flush_$.bind(this);
  this.$postMessageApi_$ = new $SubscriptionApi$$module$src$iframe_helper$$($iframe$jscomp$12$$, "send-intersections", function() {
    return $JSCompiler_StaticMethods_startSendingIntersectionChanges_$$($$jscomp$this$jscomp$5$$);
  });
  this.$unlistenViewportChanges_$ = null;
}
$IntersectionObserverHostForAd$$module$extensions$amp_ad$0_1$intersection_observer_host$$.prototype.fire = function() {
  if (this.$shouldSendIntersectionChanges_$) {
    var $JSCompiler_change$jscomp$inline_141$$ = this.$baseElement_$.element.getIntersectionChangeEntry();
    0 < this.$pendingChanges_$.length && this.$pendingChanges_$[this.$pendingChanges_$.length - 1].time == $JSCompiler_change$jscomp$inline_141$$.time || (this.$pendingChanges_$.push($JSCompiler_change$jscomp$inline_141$$), this.$flushTimeout_$ || (this.$flush_$(), this.$flushTimeout_$ = this.$timer_$.delay(this.$boundFlush_$, 100)));
  }
};
function $JSCompiler_StaticMethods_startSendingIntersectionChanges_$$($JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$) {
  $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$shouldSendIntersectionChanges_$ = !0;
  $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$baseElement_$.getVsync().measure(function() {
    if ($JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.$baseElement_$.isInViewport()) {
      $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.onViewportCallback(!0);
    }
    $JSCompiler_StaticMethods_startSendingIntersectionChanges_$self$$.fire();
  });
}
$IntersectionObserverHostForAd$$module$extensions$amp_ad$0_1$intersection_observer_host$$.prototype.onViewportCallback = function($inViewport$$) {
  if (this.inViewport_ != $inViewport$$) {
    if (this.inViewport_ = $inViewport$$, this.fire(), $inViewport$$) {
      var $send$$ = this.fire.bind(this), $unlistenScroll$$ = this.$baseElement_$.getViewport().onScroll($send$$), $unlistenChanged$$ = this.$baseElement_$.getViewport().onChanged($send$$);
      this.$unlistenViewportChanges_$ = function() {
        $unlistenScroll$$();
        $unlistenChanged$$();
      };
    } else {
      this.$unlistenViewportChanges_$ && (this.$unlistenViewportChanges_$(), this.$unlistenViewportChanges_$ = null);
    }
  }
};
$IntersectionObserverHostForAd$$module$extensions$amp_ad$0_1$intersection_observer_host$$.prototype.$flush_$ = function() {
  this.$flushTimeout_$ = 0;
  this.$pendingChanges_$.length && (this.$postMessageApi_$.send("intersection", $dict$$module$src$utils$object$$({changes:this.$pendingChanges_$})), this.$pendingChanges_$.length = 0);
};
$IntersectionObserverHostForAd$$module$extensions$amp_ad$0_1$intersection_observer_host$$.prototype.destroy = function() {
  this.$timer_$.cancel(this.$flushTimeout_$);
  this.$unlistenViewportChanges_$ && (this.$unlistenViewportChanges_$(), this.$unlistenViewportChanges_$ = null);
  this.$postMessageApi_$.destroy();
};
var $excludedTags$$module$src$get_html$$ = ["script", "style"], $allowedAmpTags$$module$src$get_html$$ = "amp-accordion amp-app-banner amp-carousel amp-fit-text amp-form amp-selector amp-sidebar".split(" "), $allowedAttributes$$module$src$get_html$$ = "action alt class disabled height href id name placeholder readonly src tabindex title type value width".split(" ");
function $appendToResult$$module$src$get_html$$($child$jscomp$7_node$jscomp$10$$, $attrs$jscomp$1$$, $result$jscomp$3$$) {
  for (var $stack$jscomp$1$$ = [$child$jscomp$7_node$jscomp$10$$], $allowedAttrs$$ = $attrs$jscomp$1$$.filter(function($child$jscomp$7_node$jscomp$10$$) {
    return $allowedAttributes$$module$src$get_html$$.includes($child$jscomp$7_node$jscomp$10$$);
  }); 0 < $stack$jscomp$1$$.length;) {
    if ($child$jscomp$7_node$jscomp$10$$ = $stack$jscomp$1$$.pop(), "string" === typeof $child$jscomp$7_node$jscomp$10$$) {
      $result$jscomp$3$$.push($child$jscomp$7_node$jscomp$10$$);
    } else {
      if ($child$jscomp$7_node$jscomp$10$$.nodeType === Node.TEXT_NODE) {
        $result$jscomp$3$$.push($child$jscomp$7_node$jscomp$10$$.textContent);
      } else {
        if ($child$jscomp$7_node$jscomp$10$$.nodeType === Node.ELEMENT_NODE && $isApplicableNode$$module$src$get_html$$($child$jscomp$7_node$jscomp$10$$)) {
          for ($appendOpenTag$$module$src$get_html$$($child$jscomp$7_node$jscomp$10$$, $allowedAttrs$$, $result$jscomp$3$$), $stack$jscomp$1$$.push("</" + $child$jscomp$7_node$jscomp$10$$.tagName.toLowerCase() + ">"), $child$jscomp$7_node$jscomp$10$$ = $child$jscomp$7_node$jscomp$10$$.lastChild; $child$jscomp$7_node$jscomp$10$$; $child$jscomp$7_node$jscomp$10$$ = $child$jscomp$7_node$jscomp$10$$.previousSibling) {
            $stack$jscomp$1$$.push($child$jscomp$7_node$jscomp$10$$);
          }
        }
      }
    }
  }
}
function $isApplicableNode$$module$src$get_html$$($node$jscomp$11$$) {
  var $tagName$jscomp$9$$ = $node$jscomp$11$$.tagName.toLowerCase();
  return $startsWith$$module$src$string$$($tagName$jscomp$9$$, "amp-") ? !(!$allowedAmpTags$$module$src$get_html$$.includes($tagName$jscomp$9$$) || !$node$jscomp$11$$.textContent) : !($excludedTags$$module$src$get_html$$.includes($tagName$jscomp$9$$) || !$node$jscomp$11$$.textContent);
}
function $appendOpenTag$$module$src$get_html$$($node$jscomp$12$$, $attrs$jscomp$2$$, $result$jscomp$4$$) {
  $result$jscomp$4$$.push("<" + $node$jscomp$12$$.tagName.toLowerCase());
  $attrs$jscomp$2$$.forEach(function($attrs$jscomp$2$$) {
    $node$jscomp$12$$.hasAttribute($attrs$jscomp$2$$) && $result$jscomp$4$$.push(" " + $attrs$jscomp$2$$ + '="' + $node$jscomp$12$$.getAttribute($attrs$jscomp$2$$) + '"');
  });
  $result$jscomp$4$$.push(">");
}
;function $indexWithinParent$$module$src$utils$dom_fingerprint$$($element$jscomp$83$$) {
  for (var $nodeName$jscomp$1$$ = $element$jscomp$83$$.nodeName, $i$jscomp$37$$ = 0, $count$jscomp$40$$ = 0, $sibling$$ = $element$jscomp$83$$.previousElementSibling; $sibling$$ && 25 > $count$jscomp$40$$ && 100 > $i$jscomp$37$$;) {
    $sibling$$.nodeName == $nodeName$jscomp$1$$ && $count$jscomp$40$$++, $i$jscomp$37$$++, $sibling$$ = $sibling$$.previousElementSibling;
  }
  return 25 > $count$jscomp$40$$ && 100 > $i$jscomp$37$$ ? "." + $count$jscomp$40$$ : "";
}
;function $getConsentPolicyState$$module$src$consent$$($element$jscomp$84$$, $policyId$$) {
  $policyId$$ = void 0 === $policyId$$ ? "default" : $policyId$$;
  return $Services$$module$src$services$consentPolicyServiceForDocOrNull$$($element$jscomp$84$$).then(function($element$jscomp$84$$) {
    return $element$jscomp$84$$ ? $element$jscomp$84$$.whenPolicyResolved($policyId$$) : null;
  });
}
function $getConsentPolicySharedData$$module$src$consent$$($element$jscomp$85$$, $policyId$jscomp$1$$) {
  return $Services$$module$src$services$consentPolicyServiceForDocOrNull$$($element$jscomp$85$$).then(function($element$jscomp$85$$) {
    return $element$jscomp$85$$ ? $element$jscomp$85$$.getMergedSharedData($policyId$jscomp$1$$) : null;
  });
}
function $getConsentPolicyInfo$$module$src$consent$$($element$jscomp$86$$, $policyId$jscomp$2$$) {
  return $Services$$module$src$services$consentPolicyServiceForDocOrNull$$($element$jscomp$86$$).then(function($element$jscomp$86$$) {
    return $element$jscomp$86$$ ? $element$jscomp$86$$.getConsentStringInfo($policyId$jscomp$2$$) : null;
  });
}
;var $adConfig$$module$ads$_config$$ = JSON.parse('{"_ping_":{"renderStartImplemented":true,"clientIdScope":"_PING_","consentHandlingOverride":true},"1wo":{},"24smi":{"prefetch":"https://jsn.24smi.net/smi.js","preconnect":"https://data.24smi.net"},"a8":{"prefetch":"https://statics.a8.net/amp/ad.js","renderStartImplemented":true},"a9":{"prefetch":"https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US"},"accesstrade":{"prefetch":"https://h.accesstrade.net/js/amp/amp.js"},"adagio":{"prefetch":"https://js-ssl.neodatagroup.com/adagio_amp.js","preconnect":["https://ad-aws-it.neodatagroup.com","https://tracker.neodatagroup.com"],"renderStartImplemented":true},"adblade":{"prefetch":"https://web.adblade.com/js/ads/async/show.js","preconnect":["https://staticd.cdn.adblade.com","https://static.adblade.com"],"renderStartImplemented":true},"adbutler":{"prefetch":"https://servedbyadbutler.com/app.js"},"adform":{},"adfox":{"prefetch":"https://yastatic.net/pcode/adfox/loader.js","renderStartImplemented":true},"adgeneration":{"prefetch":"https://i.socdm.com/sdk/js/adg-script-loader.js"},"adglare":{"renderStartImplemented":true},"adhese":{"renderStartImplemented":true},"adincube":{"renderStartImplemented":true},"adition":{},"adman":{},"admanmedia":{"renderStartImplemented":true},"admixer":{"renderStartImplemented":true,"preconnect":["https://inv-nets.admixer.net","https://cdn.admixer.net"]},"adocean":{"consentHandlingOverride":true},"adop":{},"adpicker":{"renderStartImplemented":true},"adplugg":{"prefetch":"https://www.adplugg.com/serve/js/ad.js","renderStartImplemented":true},"adpon":{"prefetch":"https://ad.adpon.jp/amp.js","clientIdScope":"AMP_ECID_ADPON"},"adreactor":{},"adsensor":{"prefetch":"https://wfpscripts.webspectator.com/amp/adsensor-amp.js","clientIdScope":"amp_ecid_adensor","renderStartImplemented":true},"adservsolutions":{},"adsloom":{"clientIdScope":"AMP_ECID_ADSLOOM"},"adsnative":{"prefetch":"https://static.adsnative.com/static/js/render.v1.js","preconnect":"https://api.adsnative.com"},"adspeed":{"preconnect":"https://g.adspeed.net","renderStartImplemented":true},"adspirit":{},"adstir":{"prefetch":"https://js.ad-stir.com/js/adstir_async.js","preconnect":"https://ad.ad-stir.com"},"adstyle":{"prefetch":"https://widgets.ad.style/amp.js","preconnect":["https://w.ad.style"]},"adtech":{"prefetch":"https://s.aolcdn.com/os/ads/adsWrapper3.js","preconnect":["https://mads.at.atwola.com","https://aka-cdn.adtechus.com"]},"adthrive":{"prefetch":["https://www.googletagservices.com/tag/js/gpt.js"],"preconnect":["https://partner.googleadservices.com","https://securepubads.g.doubleclick.net","https://tpc.googlesyndication.com"],"renderStartImplemented":true},"adunity":{"preconnect":["https://content.adunity.com"],"renderStartImplemented":true},"aduptech":{"prefetch":"https://s.d.adup-tech.com/jsapi","preconnect":["https://d.adup-tech.com","https://m.adup-tech.com"],"renderStartImplemented":true},"adventive":{"preconnect":["https://ads.adventive.com","https://amp.adventivedev.com"],"renderStartImplemented":true},"adverline":{"prefetch":"https://ads.adverline.com/richmedias/amp.js","preconnect":["https://adnext.fr"],"renderStartImplemented":true},"adverticum":{},"advertserve":{"renderStartImplemented":true},"adyoulike":{"consentHandlingOverride":true,"prefetch":"https://fo-static.omnitagjs.com/amp.js","renderStartImplemented":true},"adzerk":{},"affiliateb":{"prefetch":"https://track.affiliate-b.com/amp/a.js","renderStartImplemented":true},"aja":{"prefetch":["https://cdn.as.amanad.adtdp.com/sdk/asot-amp.js","https://cdn.as.amanad.adtdp.com/sdk/asot-v2.js"],"preconnect":["https://ad.as.amanad.adtdp.com"]},"appvador":{"prefetch":["https://cdn.apvdr.com/js/VastAdUnit.min.js","https://cdn.apvdr.com/js/VideoAd.min.js","https://cdn.apvdr.com/js/VideoAd3PAS.min.js","https://cdn.apvdr.com/js/VideoAdAutoPlay.min.js","https://cdn.apvdr.com/js/VideoAdNative.min.js"],"renderStartImplemented":true},"amoad":{"prefetch":["https://j.amoad.com/js/a.js","https://j.amoad.com/js/n.js"],"preconnect":["https://d.amoad.com","https://i.amoad.com","https://m.amoad.com","https://v.amoad.com"]},"aniview":{"renderStartImplemented":true},"anyclip":{"prefetch":"https://player.anyclip.com/anyclip-widget/lre-widget/prod/v1/src/lre.js","preconnect":["https://trafficmanager.anyclip.com","https://lreprx-server.anyclip.com"],"renderStartImplemented":true},"appnexus":{"prefetch":"https://acdn.adnxs.com/ast/ast.js","preconnect":"https://ib.adnxs.com","renderStartImplemented":true},"atomx":{"prefetch":"https://s.ato.mx/p.js"},"beaverads":{"renderStartImplemented":true},"beopinion":{"prefetch":"https://widget.beop.io/sdk.js","preconnect":["https://t.beop.io","https://s.beop.io","https://data.beop.io"],"renderStartImplemented":true},"bidtellect":{},"blade":{"prefetch":"https://sdk.streamrail.com/blade/sr.blade.js","renderStartImplemented":true},"brainy":{},"bringhub":{"renderStartImplemented":true,"preconnect":["https://static.bh-cdn.com","https://core-api.bringhub.io"]},"broadstreetads":{"prefetch":"https://cdn.broadstreetads.com/init-2.min.js"},"byplay":{},"caajainfeed":{"prefetch":["https://cdn.amanad.adtdp.com/sdk/ajaamp.js"],"preconnect":["https://ad.amanad.adtdp.com"]},"capirs":{"renderStartImplemented":true},"caprofitx":{"prefetch":["https://cdn.caprofitx.com/pfx.min.js","https://cdn.caprofitx.com/tags/amp/profitx_amp.js"],"preconnect":"https://ad.caprofitx.adtdp.com"},"cedato":{"renderStartImplemented":true},"chargeads":{},"colombia":{"prefetch":"https://static.clmbtech.com/ad/commons/js/colombia-amp.js"},"conative":{"renderStartImplemented":true},"connatix":{"renderStartImplemented":true},"contentad":{},"criteo":{"prefetch":"https://static.criteo.net/js/ld/publishertag.js","preconnect":"https://cas.criteo.com"},"csa":{"prefetch":"https://www.google.com/adsense/search/ads.js"},"dable":{"preconnect":["https://static.dable.io","https://api.dable.io","https://images.dable.io"],"renderStartImplemented":true},"directadvert":{"renderStartImplemented":true},"distroscale":{"preconnect":["https://c.jsrdn.com","https://s.jsrdn.com","https://i.jsrdn.com"],"renderStartImplemented":true},"dotandads":{"prefetch":"https://amp.ad.dotandad.com/dotandadsAmp.js","preconnect":"https://bal.ad.dotandad.com"},"dynad":{"preconnect":["https://t.dynad.net","https://tm.jsuol.com.br"]},"eadv":{"renderStartImplemented":true,"clientIdScope":"AMP_ECID_EADV","prefetch":["https://www.eadv.it/track/esr.min.js","https://www.eadv.it/track/ead.min.js"]},"eas":{"prefetch":"https://amp.emediate.eu/amp.v0.js","renderStartImplemented":true},"empower":{"prefetch":"https://cdn.empower.net/sdk/amp-ad.min.js","renderStartImplemented":true},"engageya":{},"epeex":{},"eplanning":{"prefetch":"https://us.img.e-planning.net/layers/epl-amp.js"},"ezoic":{"prefetch":["https://www.googletagservices.com/tag/js/gpt.js","https://g.ezoic.net/ezoic/ampad.js"],"clientIdScope":"AMP_ECID_EZOIC","consentHandlingOverride":true},"f1e":{"prefetch":"https://img.ak.impact-ad.jp/util/f1e_amp.min.js"},"f1h":{"preconnect":"https://img.ak.impact-ad.jp","renderStartImplemented":true},"fake":{},"felmat":{"prefetch":"https://t.felmat.net/js/fmamp.js","renderStartImplemented":true},"flite":{},"fluct":{"preconnect":["https://cdn-fluct.sh.adingo.jp","https://s.sh.adingo.jp","https://i.adingo.jp"]},"forkmedia":{"renderStartImplemented":true},"freewheel":{"prefetch":"https://cdn.stickyadstv.com/prime-time/fw-amp.min.js","renderStartImplemented":true},"fusion":{"prefetch":"https://assets.adtomafusion.net/fusion/latest/fusion-amp.min.js"},"genieessp":{"prefetch":"https://js.gsspcln.jp/l/amp.js"},"giraff":{"renderStartImplemented":true},"gmossp":{"prefetch":"https://cdn.gmossp-sp.jp/ads/amp.js"},"gumgum":{"prefetch":"https://js.gumgum.com/slot.js","renderStartImplemented":true},"holder":{"prefetch":"https://i.holder.com.ua/js2/holder/ajax/ampv1.js","preconnect":"https://h.holder.com.ua","renderStartImplemented":true},"ibillboard":{},"idealmedia":{"renderStartImplemented":true,"preconnect":["https://jsc.idealmedia.io","https://servicer.idealmedia.io","https://s-img.idealmedia.io/"]},"imedia":{"prefetch":"https://i.imedia.cz/js/im3.js","renderStartImplemented":true},"imobile":{"prefetch":"https://spamp.i-mobile.co.jp/script/amp.js","preconnect":"https://spad.i-mobile.co.jp"},"imonomy":{"renderStartImplemented":true},"improvedigital":{},"industrybrains":{"prefetch":"https://web.industrybrains.com/js/ads/async/show.js","preconnect":["https://staticd.cdn.industrybrains.com","https://static.industrybrains.com"],"renderStartImplemented":true},"inmobi":{"prefetch":"https://cf.cdn.inmobi.com/ad/inmobi.secure.js","renderStartImplemented":true},"innity":{"prefetch":"https://cdn.innity.net/admanager.js","preconnect":"https://as.innity.com","renderStartImplemented":true},"insticator":{"preconnect":"https://d3lcz8vpax4lo2.cloudfront.net","renderStartImplemented":true},"invibes":{"prefetch":"https://k.r66net.com/GetAmpLink","renderStartImplemented":true,"consentHandlingOverride":true},"iprom":{"prefetch":"https://cdn.ipromcloud.com/ipromNS.js"},"ix":{"prefetch":["https://js-sec.indexww.com/apl/amp.js"],"preconnect":"https://as-sec.casalemedia.com","renderStartImplemented":true},"jubna":{},"kargo":{},"kiosked":{"renderStartImplemented":true},"kixer":{"prefetch":"https://cdn.kixer.com/ad/load.js","renderStartImplemented":true},"kuadio":{},"lentainform":{"renderStartImplemented":true,"preconnect":["https://jsc.lentainform.com","https://servicer.lentainform.com","https://s-img.lentainform.com"]},"ligatus":{"prefetch":"https://ssl.ligatus.com/render/ligrend.js","renderStartImplemented":true},"lockerdome":{"prefetch":"https://cdn2.lockerdomecdn.com/_js/amp.js","renderStartImplemented":true},"logly":{"preconnect":["https://l.logly.co.jp","https://cdn.logly.co.jp"],"renderStartImplemented":true},"loka":{"prefetch":"https://loka-cdn.akamaized.net/scene/amp.js","preconnect":["https://scene-front.lokaplatform.com","https://loka-materials.akamaized.net"],"renderStartImplemented":true},"mads":{"prefetch":"https://eu2.madsone.com/js/tags.js"},"mantis-display":{"prefetch":"https://assets.mantisadnetwork.com/mantodea.min.js","preconnect":["https://mantodea.mantisadnetwork.com","https://res.cloudinary.com","https://resize.mantisadnetwork.com"]},"marfeel":{"prefetch":"https://www.googletagservices.com/tag/js/gpt.js","preconnect":"https://live.mrf.io","consentHandlingOverride":true},"mantis-recommend":{"prefetch":"https://assets.mantisadnetwork.com/recommend.min.js","preconnect":["https://mantodea.mantisadnetwork.com","https://resize.mantisadnetwork.com"]},"mediaad":{},"medianet":{"preconnect":"https://contextual.media.net","renderStartImplemented":true},"mediavine":{"prefetch":"https://amp.mediavine.com/wrapper.min.js","preconnect":["https://partner.googleadservices.com","https://securepubads.g.doubleclick.net","https://tpc.googlesyndication.com"],"renderStartImplemented":true,"consentHandlingOverride":true},"medyanet":{"renderStartImplemented":true},"meg":{"renderStartImplemented":true},"mgid":{"renderStartImplemented":true,"preconnect":["https://jsc.mgid.com","https://servicer.mgid.com","https://s-img.mgid.com"]},"microad":{"prefetch":"https://j.microad.net/js/camp.js","preconnect":["https://s-rtb.send.microad.jp","https://s-rtb.send.microadinc.com","https://cache.send.microad.jp","https://cache.send.microadinc.com","https://deb.send.microad.jp"]},"miximedia":{"renderStartImplemented":true},"mixpo":{"prefetch":"https://cdn.mixpo.com/js/loader.js","preconnect":["https://player1.mixpo.com","https://player2.mixpo.com"]},"monetizer101":{"renderStartImplemented":true},"mox":{"prefetch":["https://ad.mox.tv/js/amp.min.js","https://ad.mox.tv/mox/mwayss_invocation.min.js"],"renderStartImplemented":true},"my6sense":{"renderStartImplemented":true},"mytarget":{"prefetch":"https://ad.mail.ru/static/ads-async.js","renderStartImplemented":true},"mywidget":{"preconnect":"https://likemore-fe.go.mail.ru","prefetch":"https://likemore-go.imgsmail.ru/widget_amp.js","renderStartImplemented":true},"nativeroll":{"prefetch":"https://cdn01.nativeroll.tv/js/seedr-player.min.js"},"nativery":{"preconnect":"https://cdn.nativery.com"},"nativo":{"prefetch":"https://s.ntv.io/serve/load.js"},"navegg":{"renderStartImplemented":true},"nend":{"prefetch":"https://js1.nend.net/js/amp.js","preconnect":["https://output.nend.net","https://img1.nend.net"]},"netletix":{"preconnect":["https://call.netzathleten-media.de"],"renderStartImplemented":true},"noddus":{"prefetch":"https://noddus.com/amp_loader.js","renderStartImplemented":true},"nokta":{"prefetch":"https://static.virgul.com/theme/mockups/noktaamp/ampjs.js","renderStartImplemented":true},"nws":{},"oblivki":{"renderStartImplemented":true},"onead":{"prefetch":"https://ad-specs.guoshipartners.com/static/js/onead-amp.min.js","renderStartImplemented":true},"onnetwork":{"renderStartImplemented":true},"openadstream":{},"openx":{"prefetch":"https://www.googletagservices.com/tag/js/gpt.js","preconnect":["https://partner.googleadservices.com","https://securepubads.g.doubleclick.net","https://tpc.googlesyndication.com"],"renderStartImplemented":true},"opinary":{},"outbrain":{"renderStartImplemented":true,"prefetch":"https://widgets.outbrain.com/widgetAMP/outbrainAMP.min.js","preconnect":["https://odb.outbrain.com"],"consentHandlingOverride":true},"pixels":{"prefetch":"https://cdn.adsfactor.net/amp/pixels-amp.min.js","clientIdCookieName":"__AF","renderStartImplemented":true},"plista":{},"polymorphicads":{"prefetch":"https://www.polymorphicads.jp/js/amp.js","preconnect":["https://img.polymorphicads.jp","https://ad.polymorphicads.jp"],"renderStartImplemented":true},"popin":{"renderStartImplemented":true},"postquare":{},"ppstudio":{"renderStartImplemented":true},"pressboard":{"renderStartImplemented":true},"promoteiq":{},"pubexchange":{},"pubguru":{"renderStartImplemented":true},"pubmatic":{"prefetch":"https://ads.pubmatic.com/AdServer/js/amp.js"},"pubmine":{"prefetch":["https://s.pubmine.com/head.js"],"preconnect":"https://delivery.g.switchadhub.com","renderStartImplemented":true},"puffnetwork":{"prefetch":"https://static.puffnetwork.com/amp_ad.js","renderStartImplemented":true},"pulsepoint":{"prefetch":"https://ads.contextweb.com/TagPublish/getjs.static.js","preconnect":"https://tag.contextweb.com"},"purch":{"prefetch":"https://ramp.purch.com/serve/creative_amp.js","renderStartImplemented":true},"quoraad":{"prefetch":"https://a.quora.com/amp_ad.js","preconnect":"https://ampad.quora.com","renderStartImplemented":true},"rakutenunifiedads":{"prefetch":"https://s-cdn.rmp.rakuten.co.jp/js/amp.js","renderStartImplemented":true},"rbinfox":{"renderStartImplemented":true},"readmo":{"renderStartImplemented":true},"realclick":{"renderStartImplemented":true},"recomad":{"renderStartImplemented":true},"recreativ":{"prefetch":"https://go.rcvlink.com/static/amp.js","renderStartImplemented":true},"relap":{"renderStartImplemented":true},"relappro":{"prefetch":"https://cdn.relappro.com/adservices/amp/relappro.amp.min.js","preconnect":"https://tags.relappro.com","renderStartImplemented":true},"revcontent":{"prefetch":"https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js","preconnect":["https://trends.revcontent.com","https://cdn.revcontent.com","https://img.revcontent.com"],"renderStartImplemented":true},"revjet":{"prefetch":"https://cdn.revjet.com/~cdn/JS/03/amp.js","renderStartImplemented":true},"rfp":{"prefetch":"https://js.rfp.fout.jp/rfp-amp.js","preconnect":"https://ad.rfp.fout.jp","renderStartImplemented":true},"rnetplus":{},"rubicon":{},"runative":{"prefetch":"https://cdn.run-syndicate.com/sdk/v1/n.js","renderStartImplemented":true},"sas":{"renderStartImplemented":true},"seedingalliance":{},"sekindo":{"renderStartImplemented":true},"sharethrough":{"renderStartImplemented":true},"shemedia":{"prefetch":["https://securepubads.g.doubleclick.net/tag/js/gpt.js","https://ads.shemedia.com/static/amp.js"],"preconnect":["https://partner.googleadservices.com","https://tpc.googlesyndication.com","https://ads.blogherads.com"],"renderStartImplemented":true},"sklik":{"prefetch":"https://c.imedia.cz/js/amp.js"},"slimcutmedia":{"preconnect":["https://sb.freeskreen.com","https://static.freeskreen.com","https://video.freeskreen.com"],"renderStartImplemented":true},"smartads":{"prefetch":"https://smart-ads.biz/amp.js"},"smartadserver":{"prefetch":"https://ec-ns.sascdn.com/diff/js/amp.v0.js","preconnect":"https://static.sascdn.com","renderStartImplemented":true},"smartclip":{"prefetch":"https://cdn.smartclip.net/amp/amp.v0.js","preconnect":"https://des.smartclip.net","renderStartImplemented":true},"smi2":{"renderStartImplemented":true},"smilewanted":{"prefetch":"https://prebid.smilewanted.com/amp/amp.js","preconnect":"https://static.smilewanted.com","renderStartImplemented":true},"sogouad":{"prefetch":"https://theta.sogoucdn.com/wap/js/aw.js","renderStartImplemented":true},"sortable":{"prefetch":"https://www.googletagservices.com/tag/js/gpt.js","preconnect":["https://tags-cdn.deployads.com","https://partner.googleadservices.com","https://securepubads.g.doubleclick.net","https://tpc.googlesyndication.com"],"renderStartImplemented":true},"sona":{"renderStartImplemented":true},"sovrn":{"prefetch":"https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js"},"speakol":{"renderStartImplemented":true},"spotx":{"preconnect":"https://js.spotx.tv","renderStartImplemented":true},"springAds":{"prefetch":"https://www.asadcdn.com/adlib/adlib_seq.js","preconnect":["https://ib.adnxs.com"],"renderStartImplemented":true},"ssp":{"prefetch":"https://ssp.imedia.cz/static/js/ssp.js","renderStartImplemented":true,"consentHandlingOverride":true},"strossle":{"preconnect":["https://amp.spklw.com","https://widgets.sprinklecontent.com","https://images.sprinklecontent.com"]},"sunmedia":{"prefetch":"https://vod.addevweb.com/sunmedia/amp/ads/sunmedia.js","preconnect":"https://static.addevweb.com","renderStartImplemented":true},"svknative":{"renderStartImplemented":true,"prefetch":"https://widget.svk-native.ru/js/embed.js"},"swoop":{"prefetch":"https://www.swoop-amp.com/amp.js","preconnect":["https://www.swpsvc.com","https://client.swpcld.com"],"renderStartImplemented":true},"taboola":{},"tcsemotion":{"prefetch":"https://ads.tcsemotion.com/www/delivery/amphb.js","renderStartImplemented":true},"teads":{"prefetch":"https://s8t.teads.tv/media/format/v3/teads-format.min.js","preconnect":["https://cdn2.teads.tv","https://a.teads.tv","https://t.teads.tv","https://r.teads.tv"],"consentHandlingOverride":true},"temedya":{"prefetch":["https://widget.cdn.vidyome.com/builds/loader-amp.js","https://vidyome-com.cdn.vidyome.com/vidyome/builds/widgets.js"],"renderStartImplemented":true},"torimochi":{"renderStartImplemented":true},"tracdelight":{"prefetch":"https://scripts.tracdelight.io/amp.js","renderStartImplemented":true},"triplelift":{},"trugaze":{"clientIdScope":"__tg_amp","renderStartImplemented":true},"uas":{"prefetch":"https://ads.pubmatic.com/AdServer/js/phoenix.js"},"ucfunnel":{"renderStartImplemented":true},"uzou":{"preconnect":["https://speee-ad.akamaized.net"],"renderStartImplemented":true},"unruly":{"prefetch":"https://video.unrulymedia.com/native/native-loader.js","renderStartImplemented":true},"valuecommerce":{"prefetch":"https://amp.valuecommerce.com/amp_bridge.js","preconnect":["https://ad.jp.ap.valuecommerce.com"],"renderStartImplemented":true},"vdoai":{"prefetch":"https://a.vdo.ai/core/dependencies_amp/vdo.min.js","renderStartImplemented":true},"videointelligence":{"preconnect":"https://s.vi-serve.com","renderStartImplemented":true},"videonow":{"renderStartImplemented":true},"viralize":{"renderStartImplemented":true},"vmfive":{"prefetch":"https://man.vm5apis.com/dist/adn-web-sdk.js","preconnect":["https://vawpro.vm5apis.com","https://vahfront.vm5apis.com"],"renderStartImplemented":true},"webediads":{"prefetch":"https://eu1.wbdds.com/amp.min.js","preconnect":["https://goutee.top","https://mediaathay.org.uk"],"renderStartImplemented":true},"weborama-display":{"prefetch":["https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js","https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js"]},"whopainfeed":{"prefetch":"https://widget.infeed.com.ar/widget/widget-amp.js"},"widespace":{},"wisteria":{"renderStartImplemented":true},"wpmedia":{"prefetch":"https://std.wpcdn.pl/wpjslib/wpjslib-amp.js","preconnect":["https://www.wp.pl","https://v.wpimg.pl"],"renderStartImplemented":true},"xlift":{"prefetch":"https://cdn.x-lift.jp/resources/common/xlift_amp.js","renderStartImplemented":true},"yahoo":{"prefetch":"https://s.yimg.com/aaq/ampad/display.js","preconnect":"https://us.adserver.yahoo.com"},"yahoofedads":{"renderStartImplemented":true},"yahoojp":{"prefetch":["https://s.yimg.jp/images/listing/tool/yads/ydn/amp/amp.js","https://yads.c.yimg.jp/js/yads.js"],"preconnect":"https://yads.yahoo.co.jp"},"yahoonativeads":{"renderStartImplemented":true},"yandex":{"prefetch":"https://an.yandex.ru/system/context_amp.js","renderStartImplemented":true},"yengo":{"renderStartImplemented":true},"yieldbot":{"prefetch":["https://cdn.yldbt.com/js/yieldbot.intent.amp.js","https://msg.yldbt.com/js/ybmsg.html"],"preconnect":"https://i.yldbt.com"},"yieldmo":{"prefetch":"https://static.yieldmo.com/ym.1.js","preconnect":["https://s.yieldmo.com","https://ads.yieldmo.com"],"renderStartImplemented":true},"yieldone":{"prefetch":"https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js"},"yieldpro":{"preconnect":"https://creatives.yieldpro.eu","renderStartImplemented":true},"zedo":{"prefetch":"https://ss3.zedo.com/gecko/tag/Gecko.amp.min.js","renderStartImplemented":true},"zen":{"prefetch":"https://zen.yandex.ru/widget-loader","preconnect":["https://yastatic.net/"],"renderStartImplemented":true},"zergnet":{},"zucks":{"preconnect":["https://j.zucks.net.zimg.jp","https://sh.zucks.net","https://k.zucks.net","https://static.zucks.net.zimg.jp"]},"baidu":{"prefetch":"https://dup.baidustatic.com/js/dm.js","renderStartImplemented":true},"sulvo":{}}');
function $getAdCid$$module$src$ad_cid$$($adElement$$) {
  var $config$jscomp$3$$ = $adConfig$$module$ads$_config$$[$adElement$$.element.getAttribute("type")];
  return $config$jscomp$3$$ && $config$jscomp$3$$.clientIdScope ? $getOrCreateAdCid$$module$src$ad_cid$$($adElement$$.getAmpDoc(), $config$jscomp$3$$.clientIdScope, $config$jscomp$3$$.clientIdCookieName) : $resolvedPromise$$module$src$resolved_promise$$();
}
function $getOrCreateAdCid$$module$src$ad_cid$$($ampDoc$$, $clientIdScope$$, $opt_clientIdCookieName$$) {
  var $timeout$jscomp$3$$ = (isNaN(void 0), 1000), $cidPromise$$ = $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($ampDoc$$), "cid").then(function($ampDoc$$) {
    if ($ampDoc$$) {
      return $ampDoc$$.get({scope:$clientIdScope$$, createCookieIfNotPresent:!0, cookieName:$opt_clientIdCookieName$$}, Promise.resolve(void 0)).catch(function($ampDoc$$) {
        $dev$$module$src$log$$().error("AD-CID", $ampDoc$$);
      });
    }
  });
  return $getService$$module$src$service$$($ampDoc$$.win, "timer").timeoutPromise($timeout$jscomp$3$$, $cidPromise$$, "cid timeout").catch(function($ampDoc$$) {
    $dev$$module$src$log$$().warn("AD-CID", $ampDoc$$);
  });
}
;var $CDN_PROXY_REGEXP$$module$ads$google$a4a$utils$$ = /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;
function $isGoogleAdsA4AValidEnvironment$$module$ads$google$a4a$utils$$($win$jscomp$66$$) {
  return $win$jscomp$66$$.crypto && ($win$jscomp$66$$.crypto.subtle || $win$jscomp$66$$.crypto.webkitSubtle) && (!!$CDN_PROXY_REGEXP$$module$ads$google$a4a$utils$$.test($win$jscomp$66$$.location.origin) || !1);
}
;function $triggerAnalyticsEvent$$module$src$analytics$$($target$jscomp$100$$, $vars$jscomp$1$$) {
  var $enableDataVars$$ = !1;
  $vars$jscomp$1$$ = void 0 === $vars$jscomp$1$$ ? {} : $vars$jscomp$1$$;
  $enableDataVars$$ = void 0 === $enableDataVars$$ ? !0 : $enableDataVars$$;
  $getElementServiceIfAvailableForDoc$$module$src$element_service$$($target$jscomp$100$$, "amp-analytics-instrumentation", "amp-analytics").then(function($analytics$$) {
    $analytics$$ && $analytics$$.triggerEventForTarget($target$jscomp$100$$, "user-error", $vars$jscomp$1$$, $enableDataVars$$);
  });
}
;self.__AMP_ERRORS = self.__AMP_ERRORS || [];
function $throttle$$module$src$utils$rate_limit$$($win$jscomp$96$$, $callback$jscomp$63$$) {
  function $fire$$($fire$$) {
    $nextCallArgs$$ = null;
    $locker$$ = $win$jscomp$96$$.setTimeout($waiter$$, 100);
    $callback$jscomp$63$$.apply(null, $fire$$);
  }
  function $waiter$$() {
    $locker$$ = 0;
    $nextCallArgs$$ && $fire$$($nextCallArgs$$);
  }
  var $locker$$ = 0, $nextCallArgs$$ = null;
  return function($win$jscomp$96$$) {
    for (var $callback$jscomp$63$$ = [], $waiter$$ = 0; $waiter$$ < arguments.length; ++$waiter$$) {
      $callback$jscomp$63$$[$waiter$$ - 0] = arguments[$waiter$$];
    }
    $locker$$ ? $nextCallArgs$$ = $callback$jscomp$63$$ : $fire$$($callback$jscomp$63$$);
  };
}
;function $AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$($baseInstance$jscomp$3$$) {
  this.$win_$ = $baseInstance$jscomp$3$$.win;
  this.$baseInstance_$ = $baseInstance$jscomp$3$$;
  this.$element_$ = $baseInstance$jscomp$3$$.element;
  this.$uiHandler_$ = $baseInstance$jscomp$3$$.uiHandler;
  this.$inaboxPositionApi_$ = this.$embedStateApi_$ = this.$intersectionObserverHost_$ = this.iframe = null;
  this.$isInaboxPositionApiInit_$ = !1;
  this.$unlisteners_$ = [];
  this.$viewport_$ = $getServiceForDoc$$module$src$service$$(this.$baseInstance_$.getAmpDoc(), "viewport");
  this.$sendPositionPending_$ = !1;
}
$JSCompiler_prototypeAlias$$ = $AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$.prototype;
$JSCompiler_prototypeAlias$$.init = function($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$, $opt_isA4A$$, $opt_letCreativeTriggerRenderStart$$) {
  var $$jscomp$this$jscomp$9$$ = this;
  this.iframe = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$;
  this.iframe.setAttribute("scrolling", "no");
  this.$baseInstance_$.applyFillContent(this.iframe);
  var $timer$jscomp$1$$ = $getService$$module$src$service$$(this.$baseInstance_$.win, "timer");
  this.$intersectionObserverHost_$ = new $IntersectionObserverHostForAd$$module$extensions$amp_ad$0_1$intersection_observer_host$$(this.$baseInstance_$, this.iframe);
  this.$embedStateApi_$ = new $SubscriptionApi$$module$src$iframe_helper$$(this.iframe, "send-embed-state", function() {
    return $JSCompiler_StaticMethods_sendEmbedInfo_$$($$jscomp$this$jscomp$9$$, $$jscomp$this$jscomp$9$$.$baseInstance_$.isInViewport());
  });
  if ($experimentToggles$$module$src$experiments$$(this.$win_$)["inabox-position-api"] || /^adsense$/i.test(this.$element_$.getAttribute("type")) && !$isGoogleAdsA4AValidEnvironment$$module$ads$google$a4a$utils$$(this.$win_$)) {
    this.$inaboxPositionApi_$ = new $SubscriptionApi$$module$src$iframe_helper$$(this.iframe, "send-positions", function() {
      $JSCompiler_StaticMethods_sendPosition_$$($$jscomp$this$jscomp$9$$);
      $JSCompiler_StaticMethods_registerPosition_$$($$jscomp$this$jscomp$9$$);
    });
  }
  $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "entity-id").then(function($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$) {
    $$jscomp$this$jscomp$9$$.$element_$.creativeId = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.data.id;
  });
  $JSCompiler_StaticMethods_handleOneTimeRequest_$$(this, "get-html", function($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$) {
    var $opt_isA4A$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.selector;
    $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.attributes;
    var $opt_letCreativeTriggerRenderStart$$ = "";
    $$jscomp$this$jscomp$9$$.$element_$.hasAttribute("data-html-access-allowed") && ($opt_isA4A$$ = $$jscomp$this$jscomp$9$$.$baseInstance_$.win.document.querySelector($opt_isA4A$$), $opt_letCreativeTriggerRenderStart$$ = [], $opt_isA4A$$ && $appendToResult$$module$src$get_html$$($opt_isA4A$$, $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$, $opt_letCreativeTriggerRenderStart$$), $opt_letCreativeTriggerRenderStart$$ = $opt_letCreativeTriggerRenderStart$$.join("").replace(/\s{2,}/g, 
    " "));
    return Promise.resolve($opt_letCreativeTriggerRenderStart$$);
  });
  $JSCompiler_StaticMethods_handleOneTimeRequest_$$(this, "get-consent-state", function() {
    return $$jscomp$this$jscomp$9$$.$baseInstance_$.getConsentState().then(function($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$) {
      return {consentState:$$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$};
    });
  });
  this.$unlisteners_$.push($listenFor$$module$src$iframe_helper$$(this.iframe, "embed-size", function($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$, $opt_isA4A$$, $opt_letCreativeTriggerRenderStart$$, $timer$jscomp$1$$) {
    $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.hasOverflow && ($$jscomp$this$jscomp$9$$.$element_$.warnOnMissingOverflow = !1);
    $JSCompiler_StaticMethods_handleResize_$$($$jscomp$this$jscomp$9$$, $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.height, $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.width, $opt_isA4A$$, $opt_letCreativeTriggerRenderStart$$, $timer$jscomp$1$$);
  }, !0, !0));
  this.$unlisteners_$.push(this.$baseInstance_$.getAmpDoc().onVisibilityChanged(function() {
    $JSCompiler_StaticMethods_sendEmbedInfo_$$($$jscomp$this$jscomp$9$$, $$jscomp$this$jscomp$9$$.$baseInstance_$.isInViewport());
  }));
  this.$unlisteners_$.push($listenFor$$module$src$iframe_helper$$(this.iframe, "user-error-in-iframe", function($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$) {
    $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.message;
    if ("string" == typeof $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$) {
      var $opt_isA4A$$ = Error($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$);
      $opt_isA4A$$.name = "3pError";
      $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$ = $$jscomp$this$jscomp$9$$.$baseInstance_$.win;
      $getService$$module$src$service$$($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$, "ampdoc").isSingleDoc() && ($opt_isA4A$$ = $dict$$module$src$utils$object$$({errorName:$opt_isA4A$$.name, errorMessage:$opt_isA4A$$.message}), $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$ = $getService$$module$src$service$$($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$, "ampdoc").getSingleDoc().getRootNode(), $triggerAnalyticsEvent$$module$src$analytics$$($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.documentElement || 
      $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.body || $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$, $opt_isA4A$$));
    }
  }, !0, !0));
  var $iframeLoadPromise$$ = this.$baseInstance_$.loadPromise(this.iframe).then(function() {
    $$jscomp$this$jscomp$9$$.iframe && ($$jscomp$this$jscomp$9$$.iframe.readyState = "complete");
    return $timer$jscomp$1$$.promise(10);
  });
  $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$ = new $Deferred$$module$src$utils$promise$$;
  var $renderStartPromise$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.promise, $renderStartResolve$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.resolve;
  $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$ = new $Deferred$$module$src$utils$promise$$;
  var $noContentPromise$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.promise, $noContentResolve$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.resolve;
  this.$baseInstance_$.config && this.$baseInstance_$.config.renderStartImplemented ? $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, ["render-start", "no-content"]).then(function($$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$) {
    if ("render-start" == $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.data.type) {
      var $opt_isA4A$$ = $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.data;
      $JSCompiler_StaticMethods_handleResize_$$($$jscomp$this$jscomp$9$$, $opt_isA4A$$.height, $opt_isA4A$$.width, $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.source, $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.origin, $$jscomp$destructuring$var29_$jscomp$destructuring$var30_iframe$jscomp$13$$.event);
      $renderStartResolve$$();
    } else {
      $JSCompiler_StaticMethods_noContent_$$($$jscomp$this$jscomp$9$$), $noContentResolve$$();
    }
  }) : ($listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "bootstrap-loaded").then(function() {
    $renderStartResolve$$();
  }), $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "no-content").then(function() {
    $JSCompiler_StaticMethods_noContent_$$($$jscomp$this$jscomp$9$$);
    $noContentResolve$$();
  }));
  $listenForOncePromise$$module$src$iframe_helper$$(this.iframe, "ini-load").then(function() {
    $$jscomp$this$jscomp$9$$.$baseInstance_$.signals().signal("ini-load");
  });
  $experimentToggles$$module$src$experiments$$(this.$win_$)["pausable-iframe"] && $makePausable$$module$src$iframe_helper$$(this.iframe);
  this.$element_$.appendChild(this.iframe);
  $opt_isA4A$$ && !$opt_letCreativeTriggerRenderStart$$ ? (this.$baseInstance_$.renderStarted(), $renderStartResolve$$()) : $setStyle$$module$src$style$$(this.iframe, "visibility", "hidden");
  ($opt_isA4A$$ && $opt_letCreativeTriggerRenderStart$$ ? $renderStartPromise$$ : Promise.race([$renderStartPromise$$, $iframeLoadPromise$$, $timer$jscomp$1$$.promise(10000)])).then(function() {
    $$jscomp$this$jscomp$9$$.$baseInstance_$.renderStarted();
    $$jscomp$this$jscomp$9$$.iframe && $setStyle$$module$src$style$$($$jscomp$this$jscomp$9$$.iframe, "visibility", "");
  });
  return Promise.race([$iframeLoadPromise$$, $noContentPromise$$]);
};
function $JSCompiler_StaticMethods_handleOneTimeRequest_$$($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$, $requestType$$, $getter$jscomp$1$$) {
  $JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.$unlisteners_$.push($listenFor$$module$src$iframe_helper$$($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.iframe, $requestType$$, function($info$jscomp$3$$, $source$jscomp$18$$, $origin$jscomp$8$$) {
    if ($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.iframe) {
      var $messageId$$ = $info$jscomp$3$$.messageId;
      $getter$jscomp$1$$($info$jscomp$3$$.payload).then(function($getter$jscomp$1$$) {
        var $info$jscomp$3$$ = {messageId:$messageId$$};
        $info$jscomp$3$$.content = $getter$jscomp$1$$;
        $postMessageToWindows$$module$src$iframe_helper$$($JSCompiler_StaticMethods_handleOneTimeRequest_$self$$.iframe, [{win:$source$jscomp$18$$, origin:$origin$jscomp$8$$}], $requestType$$ + "-result", $info$jscomp$3$$, !0);
      });
    }
  }, !0, !1));
}
$JSCompiler_prototypeAlias$$.freeXOriginIframe = function($opt_keep$$) {
  $JSCompiler_StaticMethods_cleanup_$$(this);
  if (!$opt_keep$$ && this.iframe) {
    var $JSCompiler_element$jscomp$inline_161$$ = this.iframe;
    $JSCompiler_element$jscomp$inline_161$$.parentElement && $JSCompiler_element$jscomp$inline_161$$.parentElement.removeChild($JSCompiler_element$jscomp$inline_161$$);
    this.iframe = null;
  }
};
function $JSCompiler_StaticMethods_noContent_$$($JSCompiler_StaticMethods_noContent_$self$$) {
  $JSCompiler_StaticMethods_noContent_$self$$.iframe && ($JSCompiler_StaticMethods_noContent_$self$$.freeXOriginIframe(0 <= $JSCompiler_StaticMethods_noContent_$self$$.iframe.name.indexOf("_master")), $JSCompiler_StaticMethods_noContent_$self$$.$uiHandler_$.applyNoContentUI());
}
function $JSCompiler_StaticMethods_cleanup_$$($JSCompiler_StaticMethods_cleanup_$self$$) {
  $JSCompiler_StaticMethods_cleanup_$self$$.$unlisteners_$.forEach(function($JSCompiler_StaticMethods_cleanup_$self$$) {
    return $JSCompiler_StaticMethods_cleanup_$self$$();
  });
  $JSCompiler_StaticMethods_cleanup_$self$$.$unlisteners_$.length = 0;
  $JSCompiler_StaticMethods_cleanup_$self$$.$embedStateApi_$ && ($JSCompiler_StaticMethods_cleanup_$self$$.$embedStateApi_$.destroy(), $JSCompiler_StaticMethods_cleanup_$self$$.$embedStateApi_$ = null);
  $JSCompiler_StaticMethods_cleanup_$self$$.$inaboxPositionApi_$ && ($JSCompiler_StaticMethods_cleanup_$self$$.$inaboxPositionApi_$.destroy(), $JSCompiler_StaticMethods_cleanup_$self$$.$inaboxPositionApi_$ = null);
  $JSCompiler_StaticMethods_cleanup_$self$$.$intersectionObserverHost_$ && ($JSCompiler_StaticMethods_cleanup_$self$$.$intersectionObserverHost_$.destroy(), $JSCompiler_StaticMethods_cleanup_$self$$.$intersectionObserverHost_$ = null);
}
function $JSCompiler_StaticMethods_handleResize_$$($JSCompiler_StaticMethods_handleResize_$self$$, $height$jscomp$30$$, $width$jscomp$31$$, $source$jscomp$19$$, $origin$jscomp$9$$, $event$jscomp$16$$) {
  $JSCompiler_StaticMethods_handleResize_$self$$.$baseInstance_$.getVsync().mutate(function() {
    $JSCompiler_StaticMethods_handleResize_$self$$.iframe && $JSCompiler_StaticMethods_handleResize_$self$$.$uiHandler_$.updateSize($height$jscomp$30$$, $width$jscomp$31$$, $JSCompiler_StaticMethods_handleResize_$self$$.iframe.offsetHeight, $JSCompiler_StaticMethods_handleResize_$self$$.iframe.offsetWidth, $event$jscomp$16$$).then(function($height$jscomp$30$$) {
      $JSCompiler_StaticMethods_handleResize_$self$$.iframe && $postMessageToWindows$$module$src$iframe_helper$$($JSCompiler_StaticMethods_handleResize_$self$$.iframe, [{win:$source$jscomp$19$$, origin:$origin$jscomp$9$$}], $height$jscomp$30$$.success ? "embed-size-changed" : "embed-size-denied", $dict$$module$src$utils$object$$({requestedWidth:$height$jscomp$30$$.newWidth, requestedHeight:$height$jscomp$30$$.newHeight}), !0);
    }, function() {
    });
  });
}
function $JSCompiler_StaticMethods_sendEmbedInfo_$$($JSCompiler_StaticMethods_sendEmbedInfo_$self$$, $inViewport$jscomp$1$$) {
  $JSCompiler_StaticMethods_sendEmbedInfo_$self$$.$embedStateApi_$ && $JSCompiler_StaticMethods_sendEmbedInfo_$self$$.$embedStateApi_$.send("embed-state", $dict$$module$src$utils$object$$({inViewport:$inViewport$jscomp$1$$, pageHidden:!$JSCompiler_StaticMethods_sendEmbedInfo_$self$$.$baseInstance_$.getAmpDoc().isVisible()}));
}
function $JSCompiler_StaticMethods_getIframePositionPromise_$$($JSCompiler_StaticMethods_getIframePositionPromise_$self$$) {
  return $JSCompiler_StaticMethods_getIframePositionPromise_$self$$.$viewport_$.getClientRectAsync($JSCompiler_StaticMethods_getIframePositionPromise_$self$$.iframe).then(function($position$jscomp$1$$) {
    var $viewport$jscomp$3$$ = $JSCompiler_StaticMethods_getIframePositionPromise_$self$$.$viewport_$.getRect();
    return $dict$$module$src$utils$object$$({targetRect:$position$jscomp$1$$, viewportRect:$viewport$jscomp$3$$});
  });
}
function $JSCompiler_StaticMethods_sendPosition_$$($JSCompiler_StaticMethods_sendPosition_$self$$) {
  $JSCompiler_StaticMethods_sendPosition_$self$$.$sendPositionPending_$ || ($JSCompiler_StaticMethods_sendPosition_$self$$.$sendPositionPending_$ = !0, $JSCompiler_StaticMethods_getIframePositionPromise_$$($JSCompiler_StaticMethods_sendPosition_$self$$).then(function($position$jscomp$2$$) {
    $JSCompiler_StaticMethods_sendPosition_$self$$.$sendPositionPending_$ = !1;
    $JSCompiler_StaticMethods_sendPosition_$self$$.$inaboxPositionApi_$.send("position", $position$jscomp$2$$);
  }));
}
function $JSCompiler_StaticMethods_registerPosition_$$($JSCompiler_StaticMethods_registerPosition_$self$$) {
  $JSCompiler_StaticMethods_registerPosition_$self$$.$isInaboxPositionApiInit_$ || ($JSCompiler_StaticMethods_registerPosition_$self$$.$isInaboxPositionApiInit_$ = !0, $JSCompiler_StaticMethods_registerPosition_$self$$.$unlisteners_$.push($JSCompiler_StaticMethods_registerPosition_$self$$.$viewport_$.onScroll($throttle$$module$src$utils$rate_limit$$($JSCompiler_StaticMethods_registerPosition_$self$$.$win_$, function() {
    $JSCompiler_StaticMethods_getIframePositionPromise_$$($JSCompiler_StaticMethods_registerPosition_$self$$).then(function($position$jscomp$3$$) {
      $JSCompiler_StaticMethods_registerPosition_$self$$.$inaboxPositionApi_$.send("position", $position$jscomp$3$$);
    });
  }))), $JSCompiler_StaticMethods_registerPosition_$self$$.$unlisteners_$.push($JSCompiler_StaticMethods_registerPosition_$self$$.$viewport_$.onResize(function() {
    $JSCompiler_StaticMethods_getIframePositionPromise_$$($JSCompiler_StaticMethods_registerPosition_$self$$).then(function($position$jscomp$4$$) {
      $JSCompiler_StaticMethods_registerPosition_$self$$.$inaboxPositionApi_$.send("position", $position$jscomp$4$$);
    });
  })));
}
$JSCompiler_prototypeAlias$$.viewportCallback = function($inViewport$jscomp$2$$) {
  if (this.$intersectionObserverHost_$) {
    this.$intersectionObserverHost_$.onViewportCallback($inViewport$jscomp$2$$);
  }
  $JSCompiler_StaticMethods_sendEmbedInfo_$$(this, $inViewport$jscomp$2$$);
};
$JSCompiler_prototypeAlias$$.onLayoutMeasure = function() {
  this.$intersectionObserverHost_$ && this.$intersectionObserverHost_$.fire();
};
$JSCompiler_prototypeAlias$$.isPausable = function() {
  var $JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$;
  if ($JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$ = !!$experimentToggles$$module$src$experiments$$(this.$win_$)["pausable-iframe"] && !!this.iframe) {
    $JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$ = this.iframe, $JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$ = !!$JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$.featurePolicy && -1 != $JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$.featurePolicy.features().indexOf("execution-while-not-rendered") && !$JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$.featurePolicy.allowsFeature("execution-while-not-rendered");
  }
  return $JSCompiler_iframe$jscomp$inline_170_JSCompiler_temp$jscomp$55$$;
};
$JSCompiler_prototypeAlias$$.setPaused = function($JSCompiler_opt_display$jscomp$inline_275_paused$jscomp$1$$) {
  if ($experimentToggles$$module$src$experiments$$(this.$win_$)["pausable-iframe"] && this.iframe) {
    var $JSCompiler_element$jscomp$inline_274$$ = this.iframe;
    $JSCompiler_opt_display$jscomp$inline_275_paused$jscomp$1$$ = !$JSCompiler_opt_display$jscomp$inline_275_paused$jscomp$1$$;
    void 0 === $JSCompiler_opt_display$jscomp$inline_275_paused$jscomp$1$$ && ($JSCompiler_opt_display$jscomp$inline_275_paused$jscomp$1$$ = $JSCompiler_element$jscomp$inline_274$$.hasAttribute("hidden"));
    $JSCompiler_opt_display$jscomp$inline_275_paused$jscomp$1$$ ? $JSCompiler_element$jscomp$inline_274$$.removeAttribute("hidden") : $JSCompiler_element$jscomp$inline_274$$.setAttribute("hidden", "");
  }
};
AMP.AmpAdXOriginIframeHandler = $AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$;
function $isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$7$$) {
  return "fixed" == $layout$jscomp$7$$ || "fixed-height" == $layout$jscomp$7$$ || "responsive" == $layout$jscomp$7$$ || "fill" == $layout$jscomp$7$$ || "flex-item" == $layout$jscomp$7$$ || "fluid" == $layout$jscomp$7$$ || "intrinsic" == $layout$jscomp$7$$;
}
function $getLengthNumeral$$module$src$layout$$($length$jscomp$21_res$jscomp$3$$) {
  $length$jscomp$21_res$jscomp$3$$ = parseFloat($length$jscomp$21_res$jscomp$3$$);
  return "number" === typeof $length$jscomp$21_res$jscomp$3$$ && isFinite($length$jscomp$21_res$jscomp$3$$) ? $length$jscomp$21_res$jscomp$3$$ : void 0;
}
;var $throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$ = null, $throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$ = null;
function $incrementLoadingAds$$module$extensions$amp_ad$0_1$concurrent_load$$($win$jscomp$99$$, $opt_loadingPromise$$) {
  void 0 === $win$jscomp$99$$["3pla"] && ($win$jscomp$99$$["3pla"] = 0);
  $win$jscomp$99$$["3pla"]++;
  if (!$throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$) {
    var $deferred$jscomp$2$$ = new $Deferred$$module$src$utils$promise$$;
    $throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$ = $deferred$jscomp$2$$.promise;
    $throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$ = $deferred$jscomp$2$$.resolve;
  }
  $getService$$module$src$service$$($win$jscomp$99$$, "timer").timeoutPromise(1000, $opt_loadingPromise$$).catch(function() {
  }).then(function() {
    --$win$jscomp$99$$["3pla"] || ($throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$(), $throttlePromiseResolver_$$module$extensions$amp_ad$0_1$concurrent_load$$ = $throttlePromise_$$module$extensions$amp_ad$0_1$concurrent_load$$ = null);
  });
}
;var $count$$module$src$3p_frame$$ = {};
function $getFrameAttributes$$module$src$3p_frame$$($JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$, $element$jscomp$105$$, $opt_type$jscomp$11_type$jscomp$157$$, $opt_context$$) {
  $opt_type$jscomp$11_type$jscomp$157$$ = $opt_type$jscomp$11_type$jscomp$157$$ || $element$jscomp$105$$.getAttribute("type");
  $userAssert$$module$src$log$$($opt_type$jscomp$11_type$jscomp$157$$, "Attribute type required for <amp-ad>: %s", $element$jscomp$105$$);
  var $JSCompiler_inline_result$jscomp$62_JSCompiler_windowDepth$jscomp$inline_176$$ = 0;
  for (var $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ = $JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$; $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ && $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ != $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$.parent; $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ = 
  $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$.parent) {
    $JSCompiler_inline_result$jscomp$62_JSCompiler_windowDepth$jscomp$inline_176$$++;
  }
  $JSCompiler_inline_result$jscomp$62_JSCompiler_windowDepth$jscomp$inline_176$$ = String($JSCompiler_inline_result$jscomp$62_JSCompiler_windowDepth$jscomp$inline_176$$) + "-" + $getRandom$$module$src$3p_frame$$($JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$);
  var $JSCompiler_attributes$jscomp$inline_180_JSCompiler_height$jscomp$inline_193_JSCompiler_temp_const$jscomp$334$$ = $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ = {}, $JSCompiler_dataset$jscomp$inline_181_JSCompiler_temp_const$jscomp$333$$ = $element$jscomp$105$$.dataset, $JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$;
  for ($JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$ in $JSCompiler_dataset$jscomp$inline_181_JSCompiler_temp_const$jscomp$333$$) {
    $startsWith$$module$src$string$$($JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$, "vars") || ($JSCompiler_attributes$jscomp$inline_180_JSCompiler_height$jscomp$inline_193_JSCompiler_temp_const$jscomp$334$$[$JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$] = $JSCompiler_dataset$jscomp$inline_181_JSCompiler_temp_const$jscomp$333$$[$JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$]);
  }
  if ($JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$ = $element$jscomp$105$$.getAttribute("json")) {
    $JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$ = $tryParseJson$$module$src$json$$($JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$);
    if (void 0 === $JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$) {
      throw $user$$module$src$log$$().createError("Error parsing JSON in json attribute in element %s", $element$jscomp$105$$);
    }
    for (var $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$ in $JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$) {
      $JSCompiler_attributes$jscomp$inline_180_JSCompiler_height$jscomp$inline_193_JSCompiler_temp_const$jscomp$334$$[$JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$] = $JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$[$JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$];
    }
  }
  $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$ = $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$;
  $JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$ = Date.now();
  $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ = $element$jscomp$105$$.getAttribute("width");
  $JSCompiler_attributes$jscomp$inline_180_JSCompiler_height$jscomp$inline_193_JSCompiler_temp_const$jscomp$334$$ = $element$jscomp$105$$.getAttribute("height");
  $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$ = $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$ ? $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$ : {};
  $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$.width = $getLengthNumeral$$module$src$layout$$($JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$);
  $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$.height = $getLengthNumeral$$module$src$layout$$($JSCompiler_attributes$jscomp$inline_180_JSCompiler_height$jscomp$inline_193_JSCompiler_temp_const$jscomp$334$$);
  $element$jscomp$105$$.getAttribute("title") && ($JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$.title = $element$jscomp$105$$.getAttribute("title"));
  var $JSCompiler_locationHref$jscomp$inline_194_JSCompiler_temp_const$jscomp$329$$ = $JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$.location.href;
  "about:srcdoc" == $JSCompiler_locationHref$jscomp$inline_194_JSCompiler_temp_const$jscomp$329$$ && ($JSCompiler_locationHref$jscomp$inline_194_JSCompiler_temp_const$jscomp$329$$ = $JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$.parent.location.href);
  var $JSCompiler_ampdoc$jscomp$inline_195_JSCompiler_temp_const$jscomp$325$$ = $getAmpdoc$$module$src$service$$($element$jscomp$105$$), $JSCompiler_docInfo$jscomp$inline_196_JSCompiler_temp_const$jscomp$330$$ = $getServiceForDoc$$module$src$service$$($element$jscomp$105$$, "documentInfo").get();
  $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ = $getServiceForDoc$$module$src$service$$($element$jscomp$105$$, "viewer").getUnconfirmedReferrerUrl();
  var $JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$ = $element$jscomp$105$$.getPageLayoutBox();
  $JSCompiler_attributes$jscomp$inline_180_JSCompiler_height$jscomp$inline_193_JSCompiler_temp_const$jscomp$334$$ = $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$;
  $JSCompiler_dataset$jscomp$inline_181_JSCompiler_temp_const$jscomp$333$$ = $urls$$module$src$config$$.thirdParty + "/2007210308000/ampcontext-v0.js";
  var $JSCompiler_temp_const$jscomp$332$$ = $JSCompiler_docInfo$jscomp$inline_196_JSCompiler_temp_const$jscomp$330$$.sourceUrl, $JSCompiler_temp_const$jscomp$331$$ = $JSCompiler_docInfo$jscomp$inline_196_JSCompiler_temp_const$jscomp$330$$.canonicalUrl;
  $JSCompiler_docInfo$jscomp$inline_196_JSCompiler_temp_const$jscomp$330$$ = $JSCompiler_docInfo$jscomp$inline_196_JSCompiler_temp_const$jscomp$330$$.pageViewId;
  $JSCompiler_locationHref$jscomp$inline_194_JSCompiler_temp_const$jscomp$329$$ = {href:$JSCompiler_locationHref$jscomp$inline_194_JSCompiler_temp_const$jscomp$329$$};
  var $JSCompiler_temp_const$jscomp$328$$ = $element$jscomp$105$$.tagName, $JSCompiler_temp_const$jscomp$327$$ = {localDev:!1, development:$getMode$$module$src$mode$$().development, esm:!1, minified:!0, lite:$getMode$$module$src$mode$$().lite, test:!1, log:$getMode$$module$src$mode$$().log, version:$getMode$$module$src$mode$$().version, rtvVersion:$getMode$$module$src$mode$$().rtvVersion}, $JSCompiler_temp_const$jscomp$326$$ = !(!$JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$.AMP_CONFIG || 
  !$JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$.AMP_CONFIG.canary);
  $JSCompiler_ampdoc$jscomp$inline_195_JSCompiler_temp_const$jscomp$325$$ = !$JSCompiler_ampdoc$jscomp$inline_195_JSCompiler_temp_const$jscomp$325$$.isVisible();
  $JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$ = $JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$ ? {left:$JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$.left, top:$JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$.top, width:$JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$.width, height:$JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$.height} : 
  null;
  var $JSCompiler_temp_const$jscomp$323$$ = $element$jscomp$105$$.getIntersectionChangeEntry();
  var $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$ = $element$jscomp$105$$;
  for (var $JSCompiler_ids$jscomp$inline_356_JSCompiler_length$jscomp$inline_362$$ = [], $JSCompiler_hash$jscomp$inline_363_JSCompiler_level$jscomp$inline_357$$ = 0; $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$ && 1 == $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$.nodeType && 25 > $JSCompiler_hash$jscomp$inline_363_JSCompiler_level$jscomp$inline_357$$;) {
    var $JSCompiler_i$jscomp$inline_364_JSCompiler_id$jscomp$inline_358$$ = "";
    $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$.id && ($JSCompiler_i$jscomp$inline_364_JSCompiler_id$jscomp$inline_358$$ = "/" + $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$.id);
    var $JSCompiler_nodeName$jscomp$inline_359$$ = $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$.nodeName.toLowerCase();
    $JSCompiler_ids$jscomp$inline_356_JSCompiler_length$jscomp$inline_362$$.push("" + $JSCompiler_nodeName$jscomp$inline_359$$ + $JSCompiler_i$jscomp$inline_364_JSCompiler_id$jscomp$inline_358$$ + $indexWithinParent$$module$src$utils$dom_fingerprint$$($JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$));
    $JSCompiler_hash$jscomp$inline_363_JSCompiler_level$jscomp$inline_357$$++;
    $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$ = $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$.parentElement;
  }
  $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$ = $JSCompiler_ids$jscomp$inline_356_JSCompiler_length$jscomp$inline_362$$.join();
  $JSCompiler_ids$jscomp$inline_356_JSCompiler_length$jscomp$inline_362$$ = $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$.length;
  $JSCompiler_hash$jscomp$inline_363_JSCompiler_level$jscomp$inline_357$$ = 5381;
  for ($JSCompiler_i$jscomp$inline_364_JSCompiler_id$jscomp$inline_358$$ = 0; $JSCompiler_i$jscomp$inline_364_JSCompiler_id$jscomp$inline_358$$ < $JSCompiler_ids$jscomp$inline_356_JSCompiler_length$jscomp$inline_362$$; $JSCompiler_i$jscomp$inline_364_JSCompiler_id$jscomp$inline_358$$++) {
    $JSCompiler_hash$jscomp$inline_363_JSCompiler_level$jscomp$inline_357$$ = 33 * $JSCompiler_hash$jscomp$inline_363_JSCompiler_level$jscomp$inline_357$$ ^ $JSCompiler_element$jscomp$inline_355_JSCompiler_inline_result$jscomp$342$$.charCodeAt($JSCompiler_i$jscomp$inline_364_JSCompiler_id$jscomp$inline_358$$);
  }
  $JSCompiler_attributes$jscomp$inline_180_JSCompiler_height$jscomp$inline_193_JSCompiler_temp_const$jscomp$334$$._context = $dict$$module$src$utils$object$$({ampcontextVersion:"2007210308000", ampcontextFilepath:$JSCompiler_dataset$jscomp$inline_181_JSCompiler_temp_const$jscomp$333$$, sourceUrl:$JSCompiler_temp_const$jscomp$332$$, referrer:$JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$, canonicalUrl:$JSCompiler_temp_const$jscomp$331$$, 
  pageViewId:$JSCompiler_docInfo$jscomp$inline_196_JSCompiler_temp_const$jscomp$330$$, location:$JSCompiler_locationHref$jscomp$inline_194_JSCompiler_temp_const$jscomp$329$$, startTime:$JSCompiler_json$jscomp$inline_183_JSCompiler_name$jscomp$inline_182_JSCompiler_obj$jscomp$inline_184_JSCompiler_startTime$jscomp$inline_191$$, tagName:$JSCompiler_temp_const$jscomp$328$$, mode:$JSCompiler_temp_const$jscomp$327$$, canary:$JSCompiler_temp_const$jscomp$326$$, hidden:$JSCompiler_ampdoc$jscomp$inline_195_JSCompiler_temp_const$jscomp$325$$, 
  initialLayoutRect:$JSCompiler_layoutRect$jscomp$inline_198_JSCompiler_temp_const$jscomp$324$$, initialIntersection:$JSCompiler_temp_const$jscomp$323$$, domFingerprint:String($JSCompiler_hash$jscomp$inline_363_JSCompiler_level$jscomp$inline_357$$ >>> 0), experimentToggles:$experimentToggles$$module$src$experiments$$($JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$), sentinel:$JSCompiler_inline_result$jscomp$62_JSCompiler_windowDepth$jscomp$inline_176$$});
  ($JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$ = $element$jscomp$105$$.getAttribute("src")) && ($JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$.src = $JSCompiler_adSrc$jscomp$inline_199_parentWindow$jscomp$1$$);
  $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$ = $JSCompiler_attributes$jscomp$inline_190_JSCompiler_key$jscomp$inline_185$$;
  $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$.type = $opt_type$jscomp$11_type$jscomp$157$$;
  Object.assign($JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$._context, $opt_context$$);
  return $JSCompiler_referrer$jscomp$inline_197_JSCompiler_width$jscomp$inline_192_JSCompiler_win$jscomp$inline_177_attributes$jscomp$5$$;
}
function $getIframe$$module$src$3p_frame$$($baseUrl$jscomp$5_parentWindow$jscomp$2$$, $parentElement$$, $opt_type$jscomp$12$$, $attributes$jscomp$6_opt_context$jscomp$1$$, $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$) {
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$ = void 0 === $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$ ? {} : $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$;
  var $disallowCustom$$ = $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.disallowCustom, $allowFullscreen$$ = $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.allowFullscreen;
  $attributes$jscomp$6_opt_context$jscomp$1$$ = $getFrameAttributes$$module$src$3p_frame$$($baseUrl$jscomp$5_parentWindow$jscomp$2$$, $parentElement$$, $opt_type$jscomp$12$$, $attributes$jscomp$6_opt_context$jscomp$1$$);
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$ = $baseUrl$jscomp$5_parentWindow$jscomp$2$$.document.createElement("iframe");
  $count$$module$src$3p_frame$$[$attributes$jscomp$6_opt_context$jscomp$1$$.type] || ($count$$module$src$3p_frame$$[$attributes$jscomp$6_opt_context$jscomp$1$$.type] = 0);
  $count$$module$src$3p_frame$$[$attributes$jscomp$6_opt_context$jscomp$1$$.type] += 1;
  var $ampdoc$jscomp$21_name$jscomp$81$$ = $parentElement$$.getAmpDoc();
  $baseUrl$jscomp$5_parentWindow$jscomp$2$$ = $getBootstrapBaseUrl$$module$src$3p_frame$$($baseUrl$jscomp$5_parentWindow$jscomp$2$$, $ampdoc$jscomp$21_name$jscomp$81$$, $disallowCustom$$);
  var $host$$ = $parseUrlDeprecated$$module$src$url$$($baseUrl$jscomp$5_parentWindow$jscomp$2$$).hostname;
  $ampdoc$jscomp$21_name$jscomp$81$$ = JSON.stringify($dict$$module$src$utils$object$$({host:$host$$, type:$attributes$jscomp$6_opt_context$jscomp$1$$.type, count:$count$$module$src$3p_frame$$[$attributes$jscomp$6_opt_context$jscomp$1$$.type], attributes:$attributes$jscomp$6_opt_context$jscomp$1$$}));
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.src = $baseUrl$jscomp$5_parentWindow$jscomp$2$$;
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.ampLocation = $parseUrlDeprecated$$module$src$url$$($baseUrl$jscomp$5_parentWindow$jscomp$2$$);
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.name = $ampdoc$jscomp$21_name$jscomp$81$$;
  $attributes$jscomp$6_opt_context$jscomp$1$$.width && ($$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.width = $attributes$jscomp$6_opt_context$jscomp$1$$.width);
  $attributes$jscomp$6_opt_context$jscomp$1$$.height && ($$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.height = $attributes$jscomp$6_opt_context$jscomp$1$$.height);
  $attributes$jscomp$6_opt_context$jscomp$1$$.title && ($$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.title = $attributes$jscomp$6_opt_context$jscomp$1$$.title);
  $allowFullscreen$$ && $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.setAttribute("allowfullscreen", "true");
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.setAttribute("scrolling", "no");
  $setStyle$$module$src$style$$($$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$, "border", "none");
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.onload = function() {
    this.readyState = "complete";
  };
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.setAttribute("allow", "sync-xhr 'none';");
  ["facebook"].includes($opt_type$jscomp$12$$) || $applySandbox$$module$src$3p_frame$$($$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$);
  $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$.setAttribute("data-amp-3p-sentinel", $attributes$jscomp$6_opt_context$jscomp$1$$._context.sentinel);
  return $$jscomp$destructuring$var32_$jscomp$destructuring$var33_iframe$jscomp$14$$;
}
function $preloadBootstrap$$module$src$3p_frame$$($url$jscomp$47_win$jscomp$100$$, $ampdoc$jscomp$22$$, $preconnect$$, $opt_disallowCustom$$) {
  $url$jscomp$47_win$jscomp$100$$ = $getBootstrapBaseUrl$$module$src$3p_frame$$($url$jscomp$47_win$jscomp$100$$, $ampdoc$jscomp$22$$, $opt_disallowCustom$$);
  $preconnect$$.preload($ampdoc$jscomp$22$$, $url$jscomp$47_win$jscomp$100$$, "document");
  $preconnect$$.preload($ampdoc$jscomp$22$$, $urls$$module$src$config$$.thirdParty + "/2007210308000/f.js", "script");
}
function $getBootstrapBaseUrl$$module$src$3p_frame$$($parentWindow$jscomp$3$$, $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$, $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$) {
  if ($JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$) {
    var $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ = null;
  } else {
    if ($JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$ = $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$.getMetaByName("amp-3p-iframe-src")) {
      $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ = void 0 === $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ ? "source" : $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$;
      $userAssert$$module$src$log$$(null != $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$, "%s %s must be available", 'meta[name="amp-3p-iframe-src"]', $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$);
      $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$ = $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$;
      "string" == typeof $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$ && ($JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$));
      var $JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$;
      ($JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$ = "https:" == $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$.protocol || "localhost" == $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$.hostname || "127.0.0.1" == $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$.hostname) || ($JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$ = 
      $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$.hostname, $JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$ = $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$.length - 10, $JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$ = 0 <= $JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$ && $JSCompiler_string$jscomp$inline_400_JSCompiler_url$jscomp$inline_366_opt_disallowCustom$jscomp$1$$.indexOf(".localhost", 
      $JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$) == $JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$);
      $userAssert$$module$src$log$$($JSCompiler_index$jscomp$inline_401_JSCompiler_temp$jscomp$399$$ || /^(\/\/)/.test($JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$), '%s %s must start with "https://" or "//" or be relative and served from either https or from localhost. Invalid value: %s', 'meta[name="amp-3p-iframe-src"]', $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$, $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$);
      $userAssert$$module$src$log$$(-1 == $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$.indexOf("?"), "3p iframe url must not include query string %s in element %s.", $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$, $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$);
      $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$);
      $userAssert$$module$src$log$$("localhost" == $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$.hostname && !0 || $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$.origin != $parseUrlDeprecated$$module$src$url$$($parentWindow$jscomp$3$$.location.href).origin, "3p iframe url must not be on the same origin as the current document %s (%s) in element %s. See https://github.com/ampproject/amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.", 
      $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$, $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$.origin, $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$);
      $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ = $JSCompiler_meta$jscomp$inline_204_ampdoc$jscomp$23$$ + "?2007210308000";
    } else {
      $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ = null;
    }
  }
  $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ || ($parentWindow$jscomp$3$$.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN = $parentWindow$jscomp$3$$.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN || "d-" + $getRandom$$module$src$3p_frame$$($parentWindow$jscomp$3$$), $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$ = "https://" + $parentWindow$jscomp$3$$.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN + 
  ("." + $urls$$module$src$config$$.thirdPartyFrameHost + "/2007210308000/frame.html"));
  return $JSCompiler_parsed$jscomp$inline_206_JSCompiler_sourceName$jscomp$inline_278_JSCompiler_temp$jscomp$60_JSCompiler_temp$jscomp$61$$;
}
function $getRandom$$module$src$3p_frame$$($win$jscomp$104$$) {
  if ($win$jscomp$104$$.crypto && $win$jscomp$104$$.crypto.getRandomValues) {
    var $uint32array$$ = new Uint32Array(2);
    $win$jscomp$104$$.crypto.getRandomValues($uint32array$$);
    var $rand$$ = String($uint32array$$[0]) + $uint32array$$[1];
  } else {
    $rand$$ = String($win$jscomp$104$$.Math.random()).substr(2) + "0";
  }
  return $rand$$;
}
function $applySandbox$$module$src$3p_frame$$($iframe$jscomp$15$$) {
  if ($iframe$jscomp$15$$.sandbox && $iframe$jscomp$15$$.sandbox.supports) {
    for (var $requiredFlags$$ = ["allow-top-navigation-by-user-activation", "allow-popups-to-escape-sandbox"], $i$jscomp$42$$ = 0; $i$jscomp$42$$ < $requiredFlags$$.length; $i$jscomp$42$$++) {
      var $flag$jscomp$1$$ = $requiredFlags$$[$i$jscomp$42$$];
      if (!$iframe$jscomp$15$$.sandbox.supports($flag$jscomp$1$$)) {
        $dev$$module$src$log$$().info("3p-frame", "Iframe doesn't support %s", $flag$jscomp$1$$);
        return;
      }
    }
    $iframe$jscomp$15$$.sandbox = $requiredFlags$$.join(" ") + " allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts";
  }
}
;function $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$($$jscomp$super$this_element$jscomp$107$$) {
  $$jscomp$super$this_element$jscomp$107$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$107$$) || this;
  $$jscomp$super$this_element$jscomp$107$$.$iframe_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.config = null;
  $$jscomp$super$this_element$jscomp$107$$.uiHandler = null;
  $$jscomp$super$this_element$jscomp$107$$.$xOriginIframeHandler_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.$placeholder_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.$fallback_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.$isInFixedContainer_$ = !1;
  $$jscomp$super$this_element$jscomp$107$$.$iframeLayoutBox_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.$unlistenViewportChanges_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.$intersectionObserver_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.$container_$ = void 0;
  $$jscomp$super$this_element$jscomp$107$$.$layoutPromise_$ = null;
  $$jscomp$super$this_element$jscomp$107$$.$type_$ = void 0;
  $$jscomp$super$this_element$jscomp$107$$.$isFullWidthAligned_$ = !1;
  $$jscomp$super$this_element$jscomp$107$$.$isFullWidthRequested_$ = !1;
  return $$jscomp$super$this_element$jscomp$107$$;
}
$$jscomp$inherits$$($AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$, AMP.BaseElement);
$JSCompiler_prototypeAlias$$ = $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$.prototype;
$JSCompiler_prototypeAlias$$.getLayoutPriority = function() {
  return this.element.getAmpDoc().isSingleDoc() ? 2 : 1;
};
$JSCompiler_prototypeAlias$$.renderOutsideViewport = function() {
  if (this.win["3pla"]) {
    return !1;
  }
  var $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$ = this.element.getAttribute("data-loading-strategy");
  if (null == $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$) {
    var $JSCompiler_errorMessage$jscomp$inline_214_JSCompiler_inline_result$jscomp$59$$ = null;
  } else {
    "prefer-viewability-over-views" == $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$ || "" == $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$ ? $JSCompiler_errorMessage$jscomp$inline_214_JSCompiler_inline_result$jscomp$59$$ = 1.25 : ($JSCompiler_errorMessage$jscomp$inline_214_JSCompiler_inline_result$jscomp$59$$ = "Value of data-loading-strategy should be a float number in range of [0, 3], but got " + $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$, 
    $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$ = $user$$module$src$log$$().assertNumber(parseFloat($JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$), $JSCompiler_errorMessage$jscomp$inline_214_JSCompiler_inline_result$jscomp$59$$), $userAssert$$module$src$log$$(0 <= $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$ && 3 >= $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$, 
    $JSCompiler_errorMessage$jscomp$inline_214_JSCompiler_inline_result$jscomp$59$$), $JSCompiler_errorMessage$jscomp$inline_214_JSCompiler_inline_result$jscomp$59$$ = $JSCompiler_rawValue$jscomp$inline_213_JSCompiler_viewportNumber$jscomp$inline_215$$);
  }
  var $elementCheck$$ = $JSCompiler_errorMessage$jscomp$inline_214_JSCompiler_inline_result$jscomp$59$$;
  return null !== $elementCheck$$ ? $elementCheck$$ : AMP.BaseElement.prototype.renderOutsideViewport.call(this);
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$10$$) {
  return $isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$10$$);
};
$JSCompiler_prototypeAlias$$.getResource = function() {
  return this.element.getResources().getResourceForElement(this.element);
};
$JSCompiler_prototypeAlias$$.getConsentPolicy = function() {
  var $config$jscomp$7_type$jscomp$158$$ = this.element.getAttribute("type");
  return ($config$jscomp$7_type$jscomp$158$$ = $adConfig$$module$ads$_config$$[$config$jscomp$7_type$jscomp$158$$]) && $config$jscomp$7_type$jscomp$158$$.consentHandlingOverride ? null : AMP.BaseElement.prototype.getConsentPolicy.call(this);
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  this.$type_$ = this.element.getAttribute("type");
  var $upgradeDelayMs$$ = Math.round(this.getResource().getUpgradeDelayMs());
  $dev$$module$src$log$$().info("amp-ad-3p-impl", "upgradeDelay " + this.$type_$ + ": " + $upgradeDelayMs$$);
  this.$placeholder_$ = this.getPlaceholder();
  this.$fallback_$ = this.getFallback();
  this.config = $adConfig$$module$ads$_config$$[this.$type_$];
  $userAssert$$module$src$log$$(this.config, 'Type "' + this.$type_$ + '" is not supported in amp-ad');
  this.uiHandler = new $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$(this);
  if (this.element.hasAttribute("data-full-width")) {
    $userAssert$$module$src$log$$("100vw" == this.element.getAttribute("width"), 'Ad units with data-full-width must have width="100vw".');
    $userAssert$$module$src$log$$(!!this.config.fullWidthHeightRatio, "Ad network does not support full width ads.");
    $dev$$module$src$log$$().info("amp-ad-3p-impl", "#${this.getResource().getId()} Full width requested");
    var $JSCompiler_inline_result$jscomp$63$$ = !0;
  } else {
    $JSCompiler_inline_result$jscomp$63$$ = !1;
  }
  if (this.$isFullWidthRequested_$ = $JSCompiler_inline_result$jscomp$63$$) {
    return $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$$(this);
  }
};
$JSCompiler_prototypeAlias$$.preconnectCallback = function($opt_onLayout$$) {
  var $$jscomp$this$jscomp$15$$ = this, $preconnect$jscomp$1$$ = $getService$$module$src$service$$(this.win, "preconnect");
  $preloadBootstrap$$module$src$3p_frame$$(this.win, this.getAmpDoc(), $preconnect$jscomp$1$$, this.config.remoteHTMLDisabled);
  "string" == typeof this.config.prefetch ? $preconnect$jscomp$1$$.preload(this.getAmpDoc(), this.config.prefetch, "script") : this.config.prefetch && this.config.prefetch.forEach(function($opt_onLayout$$) {
    $preconnect$jscomp$1$$.preload($$jscomp$this$jscomp$15$$.getAmpDoc(), $opt_onLayout$$, "script");
  });
  "string" == typeof this.config.preconnect ? $preconnect$jscomp$1$$.url(this.getAmpDoc(), this.config.preconnect, $opt_onLayout$$) : this.config.preconnect && this.config.preconnect.forEach(function($src$jscomp$4$$) {
    $preconnect$jscomp$1$$.url($$jscomp$this$jscomp$15$$.getAmpDoc(), $src$jscomp$4$$, $opt_onLayout$$);
  });
  var $src$jscomp$4$$ = this.element.getAttribute("src");
  $src$jscomp$4$$ && $preconnect$jscomp$1$$.url(this.getAmpDoc(), $src$jscomp$4$$);
};
$JSCompiler_prototypeAlias$$.onLayoutMeasure = function() {
  var $$jscomp$this$jscomp$16$$ = this;
  this.$isInFixedContainer_$ = !$isAdPositionAllowed$$module$src$ad_helper$$(this.element, this.win);
  void 0 === this.$container_$ && (this.$container_$ = $getAdContainer$$module$src$ad_helper$$(this.element));
  $JSCompiler_StaticMethods_measureIframeLayoutBox_$$(this);
  if (this.$xOriginIframeHandler_$) {
    this.$xOriginIframeHandler_$.onLayoutMeasure();
  }
  if (this.$isFullWidthRequested_$ && !this.$isFullWidthAligned_$) {
    this.$isFullWidthAligned_$ = !0;
    var $layoutBox$jscomp$1$$ = this.getLayoutBox();
    this.getVsync().run({measure:function($layoutBox$jscomp$1$$) {
      $layoutBox$jscomp$1$$.direction = ($$jscomp$this$jscomp$16$$.win.getComputedStyle($$jscomp$this$jscomp$16$$.element) || $map$$module$src$utils$object$$()).direction;
    }, mutate:function($state$jscomp$1$$) {
      "rtl" == $state$jscomp$1$$.direction ? $setStyle$$module$src$style$$($$jscomp$this$jscomp$16$$.element, "marginRight", $layoutBox$jscomp$1$$.left, "px") : $setStyle$$module$src$style$$($$jscomp$this$jscomp$16$$.element, "marginLeft", -$layoutBox$jscomp$1$$.left, "px");
    }}, {direction:""});
  }
};
function $JSCompiler_StaticMethods_measureIframeLayoutBox_$$($JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$) {
  if ($JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.$xOriginIframeHandler_$ && $JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.$xOriginIframeHandler_$.iframe) {
    var $iframeBox$$ = $JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.getViewport().getLayoutRect($JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.$xOriginIframeHandler_$.iframe), $box$jscomp$2$$ = $JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.getLayoutBox();
    $JSCompiler_StaticMethods_measureIframeLayoutBox_$self$$.$iframeLayoutBox_$ = $moveLayoutRect$$module$src$layout_rect$$($iframeBox$$, -$box$jscomp$2$$.left, -$box$jscomp$2$$.top);
  }
}
$JSCompiler_prototypeAlias$$.getIntersectionElementLayoutBox = function() {
  if (!this.$xOriginIframeHandler_$ || !this.$xOriginIframeHandler_$.iframe) {
    return AMP.BaseElement.prototype.getIntersectionElementLayoutBox.call(this);
  }
  var $box$jscomp$3$$ = this.getLayoutBox();
  this.$iframeLayoutBox_$ || $JSCompiler_StaticMethods_measureIframeLayoutBox_$$(this);
  return $moveLayoutRect$$module$src$layout_rect$$(this.$iframeLayoutBox_$, $box$jscomp$3$$.left, $box$jscomp$3$$.top);
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$17$$ = this;
  if (this.$layoutPromise_$) {
    return this.$layoutPromise_$;
  }
  $userAssert$$module$src$log$$(!this.$isInFixedContainer_$, "<amp-ad> is not allowed to be placed in elements with position:fixed: %s", this.element);
  var $consentPromise$$ = this.getConsentState(), $consentPolicyId$jscomp$1$$ = AMP.BaseElement.prototype.getConsentPolicy.call(this), $consentStringPromise$$ = $consentPolicyId$jscomp$1$$ ? $getConsentPolicyInfo$$module$src$consent$$(this.element, $consentPolicyId$jscomp$1$$) : Promise.resolve(null), $sharedDataPromise$$ = $consentPolicyId$jscomp$1$$ ? $getConsentPolicySharedData$$module$src$consent$$(this.element, $consentPolicyId$jscomp$1$$) : Promise.resolve(null);
  this.$layoutPromise_$ = Promise.all([$getAdCid$$module$src$ad_cid$$(this), $consentPromise$$, $sharedDataPromise$$, $consentStringPromise$$]).then(function($consentPromise$$) {
    var $consentPolicyId$jscomp$1$$ = $dict$$module$src$utils$object$$({clientId:$consentPromise$$[0] || null, container:$$jscomp$this$jscomp$17$$.$container_$, initialConsentState:$consentPromise$$[1], consentSharedData:$consentPromise$$[2]});
    $consentPolicyId$jscomp$1$$.initialConsentValue = $consentPromise$$[3];
    $consentPolicyId$jscomp$1$$ = $getIframe$$module$src$3p_frame$$($$jscomp$this$jscomp$17$$.element.ownerDocument.defaultView, $$jscomp$this$jscomp$17$$.element, $$jscomp$this$jscomp$17$$.$type_$, $consentPolicyId$jscomp$1$$, {disallowCustom:$$jscomp$this$jscomp$17$$.config.remoteHTMLDisabled});
    $$jscomp$this$jscomp$17$$.$xOriginIframeHandler_$ = new $AmpAdXOriginIframeHandler$$module$extensions$amp_ad$0_1$amp_ad_xorigin_iframe_handler$$($$jscomp$this$jscomp$17$$);
    return $$jscomp$this$jscomp$17$$.$xOriginIframeHandler_$.init($consentPolicyId$jscomp$1$$);
  });
  $incrementLoadingAds$$module$extensions$amp_ad$0_1$concurrent_load$$(this.win, this.$layoutPromise_$);
  return this.$layoutPromise_$;
};
$JSCompiler_prototypeAlias$$.viewportCallback = function($inViewport$jscomp$3$$) {
  this.$xOriginIframeHandler_$ && this.$xOriginIframeHandler_$.viewportCallback($inViewport$jscomp$3$$);
};
$JSCompiler_prototypeAlias$$.unlayoutOnPause = function() {
  return !this.$xOriginIframeHandler_$ || !this.$xOriginIframeHandler_$.isPausable();
};
$JSCompiler_prototypeAlias$$.pauseCallback = function() {
  this.$xOriginIframeHandler_$ && this.$xOriginIframeHandler_$.setPaused(!0);
};
$JSCompiler_prototypeAlias$$.resumeCallback = function() {
  this.$xOriginIframeHandler_$ && this.$xOriginIframeHandler_$.setPaused(!1);
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  this.$layoutPromise_$ = null;
  this.uiHandler.applyUnlayoutUI();
  this.$xOriginIframeHandler_$ && (this.$xOriginIframeHandler_$.freeXOriginIframe(), this.$xOriginIframeHandler_$ = null);
  return !0;
};
$JSCompiler_prototypeAlias$$.getConsentState = function() {
  var $consentPolicyId$jscomp$2$$ = AMP.BaseElement.prototype.getConsentPolicy.call(this);
  return $consentPolicyId$jscomp$2$$ ? $getConsentPolicyState$$module$src$consent$$(this.element, $consentPolicyId$jscomp$2$$) : Promise.resolve(null);
};
function $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$$($JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$) {
  var $viewportSize$jscomp$2$$ = $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$.getViewport().getSize(), $width$jscomp$35$$ = $viewportSize$jscomp$2$$.width, $height$jscomp$34$$ = $JSCompiler_StaticMethods_getFullWidthHeight_$$($JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$, $width$jscomp$35$$, Math.min(500, $viewportSize$jscomp$2$$.height));
  return $JSCompiler_StaticMethods_attemptFullWidthSizeChange_$self$$.attemptChangeSize($height$jscomp$34$$, $width$jscomp$35$$).then(function() {
    $dev$$module$src$log$$().info("amp-ad-3p-impl", "Size change accepted: " + $width$jscomp$35$$ + "x" + $height$jscomp$34$$);
  }, function() {
    $dev$$module$src$log$$().info("amp-ad-3p-impl", "Size change rejected: " + $width$jscomp$35$$ + "x" + $height$jscomp$34$$);
  });
}
function $JSCompiler_StaticMethods_getFullWidthHeight_$$($JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$, $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$, $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$) {
  if ("mcrspv" === $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.element.getAttribute("data-auto-format")) {
    $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$ = $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.element;
    $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ = {numberOfRows:$JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.getAttribute("data-matched-content-rows-num"), numberOfColumns:$JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.getAttribute("data-matched-content-columns-num"), 
    layoutType:$JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.getAttribute("data-matched-content-ui-type")};
    if ($JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$.numberOfRows || $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$.numberOfColumns || $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$.layoutType) {
      var $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$ = $validateAndParsePubControlParams$$module$ads$google$a4a$shared$content_recommendation$$($JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$);
      if ($JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$.validationError) {
        $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = {slotWidth:0, slotHeight:0, numberOfColumns:0, numberOfRows:0, layoutType:"image_stacked", validationError:$JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$.validationError};
      } else {
        var $JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$ = 2 === $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$.layoutTypes.length && 468 <= $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ ? 1 : 0;
        $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ = $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$.layoutTypes[$JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$];
        $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ = 0 === $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$.indexOf("pub_control_") ? $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ : 
        "pub_control_" + $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$;
        var $JSCompiler_inline_result$jscomp$321_JSCompiler_minWidth$jscomp$inline_373$$ = $LAYOUT_AD_WIDTH_MAP$$module$ads$google$a4a$shared$content_recommendation$$[$JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$];
        for (var $JSCompiler_optimizedNumColumns$jscomp$inline_374$$ = $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$.numberOfColumns[$JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$]; $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ / $JSCompiler_optimizedNumColumns$jscomp$inline_374$$ < $JSCompiler_inline_result$jscomp$321_JSCompiler_minWidth$jscomp$inline_373$$ && 
        1 < $JSCompiler_optimizedNumColumns$jscomp$inline_374$$;) {
          $JSCompiler_optimizedNumColumns$jscomp$inline_374$$--;
        }
        $JSCompiler_inline_result$jscomp$321_JSCompiler_minWidth$jscomp$inline_373$$ = $JSCompiler_optimizedNumColumns$jscomp$inline_374$$;
        $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$ = $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$.numberOfRows[$JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$];
        $JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$ = Math.floor((($JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ - 8 * $JSCompiler_inline_result$jscomp$321_JSCompiler_minWidth$jscomp$inline_373$$ - 8) / $JSCompiler_inline_result$jscomp$321_JSCompiler_minWidth$jscomp$inline_373$$ * $LAYOUT_ASPECT_RATIO_MAP$$module$ads$google$a4a$shared$content_recommendation$$[$JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$] + 
        $LAYOUT_TEXT_HEIGHT_MAP$$module$ads$google$a4a$shared$content_recommendation$$[$JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$]) * $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$ + 8 * $JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$ + 8);
        $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = 1500 < $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ ? {width:0, height:0, sizeError:"Calculated slot width is too large: " + $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$} : 
        1500 < $JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$ ? {width:0, height:0, sizeError:"Calculated slot height is too large: " + $JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$} : {width:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$, height:$JSCompiler_index$jscomp$inline_283_JSCompiler_slotHeight$jscomp$inline_380$$};
        $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.sizeError ? {slotWidth:0, slotHeight:0, numberOfColumns:0, numberOfRows:0, layoutType:$JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$, 
        validationError:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.sizeError} : {slotWidth:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.width, slotHeight:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.height, 
        numberOfColumns:$JSCompiler_inline_result$jscomp$321_JSCompiler_minWidth$jscomp$inline_373$$, numberOfRows:$JSCompiler_numRows$jscomp$inline_286_JSCompiler_pubParams$jscomp$inline_282$$, layoutType:$JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$};
      }
    } else {
      468 > $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ ? 468 >= $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ ? ($JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ = 
      $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ - 8 - 8, $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ = Math.floor($JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ / 
      1.91 + 70) + Math.floor(11 * ($JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$ * $LAYOUT_ASPECT_RATIO_MAP$$module$ads$google$a4a$shared$content_recommendation$$.mobile_banner_image_sidebyside + $LAYOUT_TEXT_HEIGHT_MAP$$module$ads$google$a4a$shared$content_recommendation$$.mobile_banner_image_sidebyside) + 96), $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = 
      {slotWidth:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$, slotHeight:$JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$, numberOfColumns:1, numberOfRows:12, layoutType:"mobile_banner_image_sidebyside"}) : 
      ($JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = $getAutoSlotSize$$module$ads$google$a4a$shared$content_recommendation$$($JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$), $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = 
      {slotWidth:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.width, slotHeight:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.height, numberOfColumns:1, numberOfRows:13, layoutType:"image_sidebyside"}) : ($JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = 
      $getAutoSlotSize$$module$ads$google$a4a$shared$content_recommendation$$($JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$), $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ = {slotWidth:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.width, 
      slotHeight:$JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.height, numberOfColumns:4, numberOfRows:2, layoutType:"image_stacked"});
    }
    $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.validationError ? ($user$$module$src$log$$().error("AMP-AD", $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.validationError), $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$ = 
    0) : ($JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.setAttribute("data-matched-content-rows-num", $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.numberOfRows), $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.setAttribute("data-matched-content-columns-num", 
    $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.numberOfColumns), $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.setAttribute("data-matched-content-ui-type", $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.layoutType), 
    $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$ = $JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$.slotHeight);
  } else {
    $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$ = Math.min(Math.max(Math.round($JSCompiler_config$jscomp$inline_222_JSCompiler_inline_result$jscomp$318_JSCompiler_temp$jscomp$239_slotSize$3$jscomp$inline_292_slotSize$4$jscomp$inline_293_width$jscomp$36$$ / $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$.config.fullWidthHeightRatio), 100), $JSCompiler_adWidth$jscomp$inline_383_JSCompiler_inline_result$jscomp$320_JSCompiler_layout$jscomp$inline_368_JSCompiler_object_inline_height_418_JSCompiler_pubControlParams$jscomp$inline_221_maxHeight$jscomp$1$$);
  }
  return $JSCompiler_StaticMethods_getFullWidthHeight_$self_JSCompiler_element$jscomp$inline_220_JSCompiler_temp$jscomp$40$$;
}
;var $ampCustomadXhrPromises$$module$extensions$amp_ad$0_1$amp_ad_custom$$ = {}, $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$ = null;
function $AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$($$jscomp$super$this$jscomp$1_element$jscomp$108$$) {
  $$jscomp$super$this$jscomp$1_element$jscomp$108$$ = AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$1_element$jscomp$108$$) || this;
  $$jscomp$super$this$jscomp$1_element$jscomp$108$$.$url_$ = null;
  $$jscomp$super$this$jscomp$1_element$jscomp$108$$.$slot_$ = null;
  $$jscomp$super$this$jscomp$1_element$jscomp$108$$.uiHandler = null;
  return $$jscomp$super$this$jscomp$1_element$jscomp$108$$;
}
$$jscomp$inherits$$($AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$, AMP.BaseElement);
$JSCompiler_prototypeAlias$$ = $AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$.prototype;
$JSCompiler_prototypeAlias$$.getLayoutPriority = function() {
  return 0;
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$11$$) {
  return $isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$11$$);
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  this.$url_$ = this.element.getAttribute("data-url");
  this.$slot_$ = this.element.getAttribute("data-slot");
  $userAssert$$module$src$log$$(null === this.$slot_$ || this.$slot_$.match(/^[0-9a-z]+$/), "custom ad slot should be alphanumeric: " + this.$slot_$);
  var $JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$ = this.element, $JSCompiler_win$jscomp$inline_298$$ = $JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$.ownerDocument.defaultView, $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$ = $JSCompiler_win$jscomp$inline_298$$.__AMP_TOP || ($JSCompiler_win$jscomp$inline_298$$.__AMP_TOP = 
  $JSCompiler_win$jscomp$inline_298$$), $JSCompiler_isEmbed$jscomp$inline_300$$ = $JSCompiler_win$jscomp$inline_298$$ != $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$;
  if ($experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$)["ampdoc-fie"]) {
    $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES = $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES || {};
    for (var $JSCompiler_i$jscomp$inline_405$$ = 0; $JSCompiler_i$jscomp$inline_405$$ < $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$.length; $JSCompiler_i$jscomp$inline_405$$++) {
      var $JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$ = $EXPERIMENT_INFO_LIST$$module$src$ampdoc_fie$$[$JSCompiler_i$jscomp$inline_405$$], $JSCompiler_experimentName$jscomp$inline_407$$ = $JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$.experimentId;
      $hasOwn_$$module$src$utils$object$$.call($JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_407$$) || ($JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$.isTrafficEligible && $JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$.isTrafficEligible($JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$) ? !$JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_407$$] && 
      $experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$)[$JSCompiler_experimentName$jscomp$inline_407$$] && ($JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$ = $JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$.branches, $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_407$$] = $JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$[Math.floor(Math.random() * 
      $JSCompiler_arr$jscomp$inline_414_JSCompiler_experiment$jscomp$inline_406$$.length)] || null) : $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_407$$] = null);
    }
    $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$ = "21065002" === ($JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES ? $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
  } else {
    $JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$ = !1;
  }
  $JSCompiler_isEmbed$jscomp$inline_300$$ && !$JSCompiler_inline_result$jscomp$337_JSCompiler_topWin$jscomp$inline_299$$ ? $JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_win$jscomp$inline_298$$, "url") ? $getServiceInternal$$module$src$service$$($JSCompiler_win$jscomp$inline_298$$, "url") : null : ($JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$ = 
  $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$), $JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$), 
  $JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$, "url") ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$, 
  "url") : null);
  $userAssert$$module$src$log$$(this.$url_$ && $JSCompiler_ampdoc$jscomp$inline_390_JSCompiler_element$jscomp$inline_297_JSCompiler_holder$jscomp$inline_391_JSCompiler_temp$jscomp$338$$.isSecure(this.$url_$), "custom ad url must be an HTTPS URL");
  this.uiHandler = new $AmpAdUIHandler$$module$extensions$amp_ad$0_1$amp_ad_ui$$(this);
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$18$$ = this, $fullUrl$$ = $JSCompiler_StaticMethods_getFullUrl_$$(this), $responsePromise$$ = $ampCustomadXhrPromises$$module$extensions$amp_ad$0_1$amp_ad_custom$$[$fullUrl$$] || $getService$$module$src$service$$(this.win, "xhr").fetchJson($fullUrl$$).then(function($$jscomp$this$jscomp$18$$) {
    return $$jscomp$this$jscomp$18$$.json();
  });
  null !== this.$slot_$ && ($ampCustomadXhrPromises$$module$extensions$amp_ad$0_1$amp_ad_custom$$[$fullUrl$$] = $responsePromise$$);
  return $responsePromise$$.then(function($fullUrl$$) {
    var $responsePromise$$ = $fullUrl$$;
    null !== $$jscomp$this$jscomp$18$$.$slot_$ && ($responsePromise$$ = $hasOwn_$$module$src$utils$object$$.call($fullUrl$$, $$jscomp$this$jscomp$18$$.$slot_$) ? $fullUrl$$[$$jscomp$this$jscomp$18$$.$slot_$] : null);
    if ($responsePromise$$ && "object" == typeof $responsePromise$$) {
      $responsePromise$$ = $JSCompiler_StaticMethods_handleTemplateData_$$($$jscomp$this$jscomp$18$$, $responsePromise$$);
      $$jscomp$this$jscomp$18$$.renderStarted();
      try {
        $getService$$module$src$service$$($$jscomp$this$jscomp$18$$.win, "templates").findAndRenderTemplate($$jscomp$this$jscomp$18$$.element, $responsePromise$$).then(function($fullUrl$$) {
          for (var $responsePromise$$ = $$jscomp$this$jscomp$18$$.element; $responsePromise$$.firstChild;) {
            $responsePromise$$.removeChild($responsePromise$$.firstChild);
          }
          $$jscomp$this$jscomp$18$$.element.appendChild($fullUrl$$);
          $$jscomp$this$jscomp$18$$.signals().signal("ini-load");
        });
      } catch ($e$jscomp$33$$) {
        $$jscomp$this$jscomp$18$$.uiHandler.applyNoContentUI();
      }
    } else {
      $$jscomp$this$jscomp$18$$.uiHandler.applyNoContentUI();
    }
  });
};
function $JSCompiler_StaticMethods_handleTemplateData_$$($JSCompiler_StaticMethods_handleTemplateData_$self$$, $templateData$jscomp$1$$) {
  var $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$ = $JSCompiler_StaticMethods_handleTemplateData_$self$$.element;
  /^[\w-]+$/.test("template");
  if (void 0 !== $scopeSelectorSupported$$module$src$css$$) {
    var $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ = $scopeSelectorSupported$$module$src$css$$;
  } else {
    try {
      var $JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$ = $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$.ownerDocument, $JSCompiler_testElement$jscomp$inline_395$$ = $JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$.createElement("div"), $JSCompiler_testChild$jscomp$inline_396$$ = $JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$.createElement("div");
      $JSCompiler_testElement$jscomp$inline_395$$.appendChild($JSCompiler_testChild$jscomp$inline_396$$);
      $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ = $JSCompiler_testElement$jscomp$inline_395$$.querySelector(":scope div") === $JSCompiler_testChild$jscomp$inline_396$$;
    } catch ($JSCompiler_e$jscomp$inline_397$$) {
      $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ = !1;
    }
    $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ = $scopeSelectorSupported$$module$src$css$$ = $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$;
  }
  $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ ? $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$ = $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$.querySelector("> template".replace(/^|,/g, "$&:scope ")) : ($JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$.classList.add("i-amphtml-scoped"), 
  $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ = "> template".replace(/^|,/g, "$&.i-amphtml-scoped "), $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ = $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$.querySelectorAll($JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$), 
  $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$.classList.remove("i-amphtml-scoped"), $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$ = void 0 === $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$[0] ? null : $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$[0]);
  if ($JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$) {
    return $templateData$jscomp$1$$;
  }
  $userAssert$$module$src$log$$($templateData$jscomp$1$$.templateId, "TemplateId not specified");
  $userAssert$$module$src$log$$($templateData$jscomp$1$$.data && "object" == typeof $templateData$jscomp$1$$.data, "Template data not specified");
  $JSCompiler_StaticMethods_handleTemplateData_$self$$.element.setAttribute("template", $templateData$jscomp$1$$.templateId);
  if ($templateData$jscomp$1$$.vars && "object" == typeof $templateData$jscomp$1$$.vars) {
    for ($JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$ = $templateData$jscomp$1$$.vars, $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$ = Object.keys($JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$), $JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$ = 0; $JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$ < $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$.length; $JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$++) {
      var $attrName$$ = "data-vars-" + $JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$[$JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$];
      try {
        $JSCompiler_StaticMethods_handleTemplateData_$self$$.element.setAttribute($attrName$$, $JSCompiler_inline_result$jscomp$44_JSCompiler_parent$jscomp$inline_230_vars$jscomp$3$$[$JSCompiler_elements$jscomp$inline_309_JSCompiler_inline_result$jscomp$340_JSCompiler_scopedSelector$jscomp$inline_308_JSCompiler_temp$jscomp$339_keys$jscomp$3$$[$JSCompiler_doc$jscomp$inline_394_i$jscomp$43$$]]);
      } catch ($e$jscomp$34$$) {
        $JSCompiler_StaticMethods_handleTemplateData_$self$$.user().error("amp-ad-custom", "Fail to set attribute: ", $e$jscomp$34$$);
      }
    }
  }
  return $templateData$jscomp$1$$.data;
}
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  this.uiHandler.applyUnlayoutUI();
  return !0;
};
function $JSCompiler_StaticMethods_getFullUrl_$$($JSCompiler_StaticMethods_getFullUrl_$self$$) {
  if (null === $JSCompiler_StaticMethods_getFullUrl_$self$$.$slot_$) {
    return $userAssert$$module$src$log$$($JSCompiler_StaticMethods_getFullUrl_$self$$.$url_$);
  }
  if (null === $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$) {
    $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$ = {};
    for (var $slots$$ = {}, $JSCompiler_temp_const$jscomp$42_elements$jscomp$3$$ = $closestAncestorElementBySelector$$module$src$dom$$($JSCompiler_StaticMethods_getFullUrl_$self$$.element).querySelectorAll("amp-ad[type=custom]"), $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ = 0; $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ < 
    $JSCompiler_temp_const$jscomp$42_elements$jscomp$3$$.length; $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$++) {
      var $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$ = $JSCompiler_temp_const$jscomp$42_elements$jscomp$3$$[$JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$], $JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$ = $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$.getAttribute("data-url");
      $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$ = $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$.getAttribute("data-slot");
      null !== $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$ && ($JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$ in $slots$$ || ($slots$$[$JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$] = []), $slots$$[$JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$].push(encodeURIComponent($JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$)));
    }
    for (var $baseUrl$jscomp$6$$ in $slots$$) {
      $JSCompiler_temp_const$jscomp$42_elements$jscomp$3$$ = $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$, $JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$ = $baseUrl$jscomp$6$$, $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ = $slots$$[$baseUrl$jscomp$6$$].join(","), ($JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ = 
      encodeURIComponent("ampslots") + "=" + encodeURIComponent($JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$)) ? ($JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$ = $JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$.split("#", 2), $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$ = 
      $JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$[0].split("?", 2), $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ = $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$[0] + ($JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$[1] ? "?" + $JSCompiler_mainAndQuery$jscomp$inline_315_elem$jscomp$1_slotId$jscomp$1$$[1] + 
      "&" + $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ : "?" + $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$), $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ += 
      $JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$[1] ? "#" + $JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$[1] : "") : $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$ = $JSCompiler_mainAndFragment$jscomp$inline_314_JSCompiler_url$jscomp$inline_233_url$jscomp$50$$, $JSCompiler_temp_const$jscomp$42_elements$jscomp$3$$[$baseUrl$jscomp$6$$] = 
      $JSCompiler_inline_result$jscomp$43_JSCompiler_newUrl$jscomp$inline_316_JSCompiler_paramString$jscomp$inline_312_JSCompiler_value$jscomp$inline_234_index$jscomp$82$$;
    }
  }
  return $ampCustomadFullUrls$$module$extensions$amp_ad$0_1$amp_ad_custom$$[$JSCompiler_StaticMethods_getFullUrl_$self$$.$url_$];
}
;var $a4aRegistry$$module$ads$_a4a_config$$;
function $getA4ARegistry$$module$ads$_a4a_config$$() {
  $a4aRegistry$$module$ads$_a4a_config$$ || ($a4aRegistry$$module$ads$_a4a_config$$ = $map$$module$src$utils$object$$({adsense:function() {
    return !0;
  }, adzerk:function() {
    return !0;
  }, doubleclick:function() {
    return !0;
  }, fake:function() {
    return !0;
  }}));
  return $a4aRegistry$$module$ads$_a4a_config$$;
}
;function $AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$() {
  return AMP.BaseElement.apply(this, arguments) || this;
}
$$jscomp$inherits$$($AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$, AMP.BaseElement);
$AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$.prototype.isLayoutSupported = function() {
  return !0;
};
$AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$.prototype.upgradeCallback = function() {
  var $$jscomp$this$jscomp$19$$ = this, $a4aRegistry$$ = $getA4ARegistry$$module$ads$_a4a_config$$(), $consentId$$ = this.element.getAttribute("data-consent-notification-id"), $consent$jscomp$1$$ = $consentId$$ ? $getElementServiceForDoc$$module$src$element_service$$(this.element).then(function($$jscomp$this$jscomp$19$$) {
    return $$jscomp$this$jscomp$19$$.get($consentId$$);
  }) : $resolvedPromise$$module$src$resolved_promise$$(), $type$jscomp$160$$ = this.element.getAttribute("type");
  return $consent$jscomp$1$$.then(function() {
    var $consentId$$ = "custom" === $type$jscomp$160$$;
    $userAssert$$module$src$log$$($consentId$$ || $hasOwn_$$module$src$utils$object$$.call($adConfig$$module$ads$_config$$, $type$jscomp$160$$) || $hasOwn_$$module$src$utils$object$$.call($a4aRegistry$$, $type$jscomp$160$$), 'Unknown ad type "' + $type$jscomp$160$$ + '"');
    if ($consentId$$) {
      return new $AmpAdCustom$$module$extensions$amp_ad$0_1$amp_ad_custom$$($$jscomp$this$jscomp$19$$.element);
    }
    $$jscomp$this$jscomp$19$$.win.ampAdSlotIdCounter = $$jscomp$this$jscomp$19$$.win.ampAdSlotIdCounter || 0;
    var $consent$jscomp$1$$ = $$jscomp$this$jscomp$19$$.win.ampAdSlotIdCounter++;
    return new Promise(function($consentId$$) {
      $$jscomp$this$jscomp$19$$.getVsync().mutate(function() {
        $$jscomp$this$jscomp$19$$.element.setAttribute("data-amp-slot-index", $consent$jscomp$1$$);
        var $isCustom$$ = !($adConfig$$module$ads$_config$$[$type$jscomp$160$$] || {}).remoteHTMLDisabled && $$jscomp$this$jscomp$19$$.element.getAmpDoc().getMetaByName("amp-3p-iframe-src");
        if (!$a4aRegistry$$[$type$jscomp$160$$] || !$a4aRegistry$$[$type$jscomp$160$$]($$jscomp$this$jscomp$19$$.win, $$jscomp$this$jscomp$19$$.element, $isCustom$$)) {
          return $consentId$$(new $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$($$jscomp$this$jscomp$19$$.element));
        }
        var $slotId$jscomp$2$$ = "amp-ad-network-" + $type$jscomp$160$$ + "-impl";
        $$jscomp$this$jscomp$19$$.element.setAttribute("data-a4a-upgrade-type", $slotId$jscomp$2$$);
        $consentId$$($getService$$module$src$service$$($$jscomp$this$jscomp$19$$.win, "extensions").loadElementClass($slotId$jscomp$2$$).then(function($a4aRegistry$$) {
          return new $a4aRegistry$$($$jscomp$this$jscomp$19$$.element);
        }).catch(function($a4aRegistry$$) {
          var $consentId$$ = $$jscomp$this$jscomp$19$$.element.tagName;
          $$jscomp$this$jscomp$19$$.user().error($consentId$$, "Unable to load ad implementation for type ", $type$jscomp$160$$, ", falling back to 3p, error: ", $a4aRegistry$$);
          return new $AmpAd3PImpl$$module$extensions$amp_ad$0_1$amp_ad_3p_impl$$($$jscomp$this$jscomp$19$$.element);
        }));
      });
    });
  });
};
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-ad", $AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$, 'amp-ad iframe,amp-embed iframe{border:0!important;margin:0!important;padding:0!important}.i-amphtml-ad-default-holder{position:absolute;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;background-color:hsla(0,0%,78.4%,0.05)}.i-amphtml-ad-default-holder:after{content:"Ad";content:attr(data-ad-holder-text);background-color:transparent;border-radius:2px;color:#696969;font-size:10px;line-height:1;font-family:Arial,sans-serif;padding:3px 4px 1px;border:1px solid #696969}amp-ad[type=adsense],amp-ad[type=doubleclick]{direction:ltr}amp-ad[data-a4a-upgrade-type=amp-ad-network-adsense-impl]>iframe,amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl]>iframe{min-height:0;min-width:0}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl][height=fluid]>iframe{height:100%!important;width:100%!important;position:relative}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl][height=fluid]{width:100%!important}\n/*# sourceURL=/extensions/amp-ad/0.1/amp-ad.css*/');
  $AMP$jscomp$1$$.registerElement("amp-embed", $AmpAd$$module$extensions$amp_ad$0_1$amp_ad$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-ad-0.1.js.map
