self.AMP_CONFIG||(self.AMP_CONFIG={"test":true,"localDev":true,"allow-doc-opt-in":["amp-next-page","inabox-viewport-friendly","analytics-chunks"],"allow-url-opt-in":["pump-early-frame"],"canary":0,"a4aProfilingRate":0.01,"adsense-ad-size-optimization":0.01,"amp-access-iframe":1,"amp-action-macro":1,"amp-accordion-display-locking":0.01,"amp-ad-ff-adx-ady":0.01,"amp-auto-ads-adsense-holdout":0.1,"amp-consent-restrict-fullscreen":1,"amp-list-init-from-state":1,"amp-mega-menu":1,"amp-nested-menu":1,"amp-playbuzz":1,"amp-sidebar-swipe-to-dismiss":1,"amp-story-responsive-units":1,"amp-story-v1":1,"ampdoc-closest":1,"as-use-attr-for-format":0.01,"blurry-placeholder":1,"chunked-amp":1,"doubleclickSraExp":0.01,"doubleclickSraReportExcludedBlock":0.1,"fix-inconsistent-responsive-height-selection":0,"fixed-elements-in-lightbox":1,"flexAdSlots":0.05,"hidden-mutation-observer":1,"ios-fixed-no-transfer":0,"layoutbox-invalidate-on-scroll":1,"pump-early-frame":1,"random-subdomain-for-safeframe":0.02,"swg-gpay-api":1,"swg-gpay-native":1,"version-locking":1});/*AMP_CONFIG*/var global=self;self.AMP=self.AMP||[];try{(function(_){
var $JSCompiler_prototypeAlias$$, $$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
  function $ctor$$() {
  }
  $ctor$$.prototype = $prototype$$;
  return new $ctor$$;
}, $JSCompiler_temp$jscomp$107$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$107$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$108$$;
  a: {
    var $JSCompiler_x$jscomp$inline_214$$ = {a:!0}, $JSCompiler_y$jscomp$inline_215$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_215$$.__proto__ = $JSCompiler_x$jscomp$inline_214$$;
      $JSCompiler_inline_result$jscomp$108$$ = $JSCompiler_y$jscomp$inline_215$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_216$$) {
    }
    $JSCompiler_inline_result$jscomp$108$$ = !1;
  }
  $JSCompiler_temp$jscomp$107$$ = $JSCompiler_inline_result$jscomp$108$$ ? function($target$jscomp$90$$, $proto$jscomp$3$$) {
    $target$jscomp$90$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$90$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$90$$ + " is not extensible");
    }
    return $target$jscomp$90$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$107$$;
function $$jscomp$inherits$$($childCtor$$, $parentCtor$$) {
  $childCtor$$.prototype = $$jscomp$objectCreate$$($parentCtor$$.prototype);
  $childCtor$$.prototype.constructor = $childCtor$$;
  if ($$jscomp$setPrototypeOf$$) {
    $$jscomp$setPrototypeOf$$($childCtor$$, $parentCtor$$);
  } else {
    for (var $p$$ in $parentCtor$$) {
      if ("prototype" != $p$$) {
        if (Object.defineProperties) {
          var $descriptor$jscomp$1$$ = Object.getOwnPropertyDescriptor($parentCtor$$, $p$$);
          $descriptor$jscomp$1$$ && Object.defineProperty($childCtor$$, $p$$, $descriptor$jscomp$1$$);
        } else {
          $childCtor$$[$p$$] = $parentCtor$$[$p$$];
        }
      }
    }
  }
  $childCtor$$.$superClass_$ = $parentCtor$$.prototype;
}
function $$jscomp$getGlobal$$($passedInThis$$) {
  for (var $possibleGlobals$$ = ["object" == typeof globalThis && globalThis, $passedInThis$$, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global], $i$jscomp$4$$ = 0; $i$jscomp$4$$ < $possibleGlobals$$.length; ++$i$jscomp$4$$) {
    var $maybeGlobal$$ = $possibleGlobals$$[$i$jscomp$4$$];
    if ($maybeGlobal$$ && $maybeGlobal$$.Math == Math) {
      return $maybeGlobal$$;
    }
  }
  return function() {
    throw Error("Cannot find global object");
  }();
}
var $$jscomp$global$$ = $$jscomp$getGlobal$$(this);
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
    var $name$jscomp$70$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$88$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2].replace(/\+/g, " "), $match$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$70$$] = $value$jscomp$88$$;
  }
  return $params$jscomp$1$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
function $getMode$$module$src$mode$$($opt_win$$) {
  var $win$$ = $opt_win$$ || self;
  if ($win$$.__AMP_MODE) {
    var $JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$ = $win$$.__AMP_MODE;
  } else {
    var $JSCompiler_AMP_CONFIG$jscomp$inline_219_JSCompiler_singlePassType$jscomp$inline_223$$ = self.AMP_CONFIG || {};
    $JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$ = !!($JSCompiler_AMP_CONFIG$jscomp$inline_219_JSCompiler_singlePassType$jscomp$inline_223$$.test || $win$$.__AMP_TEST || $win$$.__karma__);
    var $JSCompiler_isLocalDev$jscomp$inline_221$$ = !!$JSCompiler_AMP_CONFIG$jscomp$inline_219_JSCompiler_singlePassType$jscomp$inline_223$$.localDev || $JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$, $JSCompiler_hashQuery$jscomp$inline_222$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.originalHash || $win$$.location.hash);
    $JSCompiler_AMP_CONFIG$jscomp$inline_219_JSCompiler_singlePassType$jscomp$inline_223$$ = $JSCompiler_AMP_CONFIG$jscomp$inline_219_JSCompiler_singlePassType$jscomp$inline_223$$.spt;
    var $JSCompiler_searchQuery$jscomp$inline_224$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $JSCompiler_isLocalDev$jscomp$inline_221$$ ? "2005062057000" : $win$$.AMP_CONFIG && $win$$.AMP_CONFIG.v ? $win$$.AMP_CONFIG.v : "012005062057000");
    $JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$ = {localDev:$JSCompiler_isLocalDev$jscomp$inline_221$$, development:!!(0 <= ["1", "actions", "amp", "amp4ads", "amp4email"].indexOf($JSCompiler_hashQuery$jscomp$inline_222$$.development) || $win$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_222$$.development, esm:!1, geoOverride:$JSCompiler_hashQuery$jscomp$inline_222$$["amp-geo"], minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_224$$.amp_lite, 
    test:$JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$, log:$JSCompiler_hashQuery$jscomp$inline_222$$.log, version:"2005062057000", rtvVersion:$rtvVersion$$module$src$mode$$, singlePassType:$JSCompiler_AMP_CONFIG$jscomp$inline_219_JSCompiler_singlePassType$jscomp$inline_223$$};
    $JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$ = $win$$.__AMP_MODE = $JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$;
  }
  return $JSCompiler_inline_result$jscomp$110_JSCompiler_runningTests$jscomp$inline_220_JSCompiler_temp$jscomp$109$$;
}
;function $includes$$module$src$polyfills$array_includes$$($value$jscomp$89$$, $i$jscomp$5_opt_fromIndex$jscomp$8$$) {
  var $fromIndex$$ = $i$jscomp$5_opt_fromIndex$jscomp$8$$ || 0, $len$$ = this.length;
  for ($i$jscomp$5_opt_fromIndex$jscomp$8$$ = 0 <= $fromIndex$$ ? $fromIndex$$ : Math.max($len$$ + $fromIndex$$, 0); $i$jscomp$5_opt_fromIndex$jscomp$8$$ < $len$$; $i$jscomp$5_opt_fromIndex$jscomp$8$$++) {
    var $other$jscomp$7$$ = this[$i$jscomp$5_opt_fromIndex$jscomp$8$$];
    if ($other$jscomp$7$$ === $value$jscomp$89$$ || $value$jscomp$89$$ !== $value$jscomp$89$$ && $other$jscomp$7$$ !== $other$jscomp$7$$) {
      return !0;
    }
  }
  return !1;
}
;var $resolved$$module$src$resolved_promise$$;
function $resolvedPromise$$module$src$resolved_promise$$() {
  return $resolved$$module$src$resolved_promise$$ ? $resolved$$module$src$resolved_promise$$ : $resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0);
}
;var $VALID_NAME$$module$src$polyfills$custom_elements$$ = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/, $INVALID_NAMES$$module$src$polyfills$custom_elements$$ = "annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "), $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$ = {childList:!0, subtree:!0};
function $assertValidName$$module$src$polyfills$custom_elements$$($SyntaxError$jscomp$1$$, $name$jscomp$71$$) {
  if (!$VALID_NAME$$module$src$polyfills$custom_elements$$.test($name$jscomp$71$$) || $INVALID_NAMES$$module$src$polyfills$custom_elements$$.includes($name$jscomp$71$$)) {
    throw new $SyntaxError$jscomp$1$$('invalid custom element name "' + $name$jscomp$71$$ + '"');
  }
}
function $rethrowAsync$$module$src$polyfills$custom_elements$$($error$jscomp$2$$) {
  setTimeout(function() {
    self.__AMP_REPORT_ERROR($error$jscomp$2$$);
    throw $error$jscomp$2$$;
  });
}
function $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$7$$, $registry$$) {
  this.$win_$ = $win$jscomp$7$$;
  this.$registry_$ = $registry$$;
  this.$pendingDefines_$ = Object.create(null);
}
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.define = function($name$jscomp$72$$, $ctor$jscomp$1$$, $options$jscomp$31$$) {
  this.$registry_$.define($name$jscomp$72$$, $ctor$jscomp$1$$, $options$jscomp$31$$);
  var $pending$$ = this.$pendingDefines_$, $deferred$$ = $pending$$[$name$jscomp$72$$];
  $deferred$$ && ($deferred$$.resolve(), delete $pending$$[$name$jscomp$72$$]);
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.get = function($name$jscomp$73$$) {
  var $def$$ = this.$registry_$.getByName($name$jscomp$73$$);
  if ($def$$) {
    return $def$$.ctor;
  }
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.whenDefined = function($name$jscomp$74$$) {
  var $$jscomp$destructuring$var2_pending$jscomp$1$$ = this.$win_$, $Promise$jscomp$1$$ = $$jscomp$destructuring$var2_pending$jscomp$1$$.Promise;
  $assertValidName$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var2_pending$jscomp$1$$.SyntaxError, $name$jscomp$74$$);
  if (this.$registry_$.getByName($name$jscomp$74$$)) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  $$jscomp$destructuring$var2_pending$jscomp$1$$ = this.$pendingDefines_$;
  var $deferred$jscomp$1$$ = $$jscomp$destructuring$var2_pending$jscomp$1$$[$name$jscomp$74$$];
  if ($deferred$jscomp$1$$) {
    return $deferred$jscomp$1$$.promise;
  }
  var $resolve$$, $promise$$ = new $Promise$jscomp$1$$(function($name$jscomp$74$$) {
    return $resolve$$ = $name$jscomp$74$$;
  });
  $$jscomp$destructuring$var2_pending$jscomp$1$$[$name$jscomp$74$$] = {promise:$promise$$, resolve:$resolve$$};
  return $promise$$;
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.upgrade = function($root$jscomp$3$$) {
  this.$registry_$.upgrade($root$jscomp$3$$);
};
function $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$8$$) {
  this.$win_$ = $win$jscomp$8$$;
  this.$definitions_$ = Object.create(null);
  this.$query_$ = "";
  this.$mutationObserver_$ = this.$current_$ = null;
  this.$roots_$ = [$win$jscomp$8$$.document];
}
$JSCompiler_prototypeAlias$$ = $Registry$$module$src$polyfills$custom_elements$$.prototype;
$JSCompiler_prototypeAlias$$.current = function() {
  var $current$$ = this.$current_$;
  this.$current_$ = null;
  return $current$$;
};
$JSCompiler_prototypeAlias$$.getByName = function($name$jscomp$75$$) {
  var $definition$$ = this.$definitions_$[$name$jscomp$75$$];
  if ($definition$$) {
    return $definition$$;
  }
};
$JSCompiler_prototypeAlias$$.getByConstructor = function($ctor$jscomp$2$$) {
  var $definitions$$ = this.$definitions_$, $name$jscomp$76$$;
  for ($name$jscomp$76$$ in $definitions$$) {
    var $def$jscomp$1$$ = $definitions$$[$name$jscomp$76$$];
    if ($def$jscomp$1$$.ctor === $ctor$jscomp$2$$) {
      return $def$jscomp$1$$;
    }
  }
};
$JSCompiler_prototypeAlias$$.define = function($name$jscomp$77$$, $ctor$jscomp$3$$, $options$jscomp$32$$) {
  var $$jscomp$this$$ = this, $$jscomp$destructuring$var3_SyntaxError$jscomp$3$$ = this.$win_$, $Error$jscomp$1$$ = $$jscomp$destructuring$var3_SyntaxError$jscomp$3$$.Error;
  $$jscomp$destructuring$var3_SyntaxError$jscomp$3$$ = $$jscomp$destructuring$var3_SyntaxError$jscomp$3$$.SyntaxError;
  if ($options$jscomp$32$$) {
    throw new $Error$jscomp$1$$("Extending native custom elements is not supported");
  }
  $assertValidName$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var3_SyntaxError$jscomp$3$$, $name$jscomp$77$$);
  if (this.getByName($name$jscomp$77$$) || this.getByConstructor($ctor$jscomp$3$$)) {
    throw new $Error$jscomp$1$$('duplicate definition "' + $name$jscomp$77$$ + '"');
  }
  this.$definitions_$[$name$jscomp$77$$] = {name:$name$jscomp$77$$, ctor:$ctor$jscomp$3$$};
  $JSCompiler_StaticMethods_observe_$$(this, $name$jscomp$77$$);
  this.$roots_$.forEach(function($ctor$jscomp$3$$) {
    $$jscomp$this$$.upgrade($ctor$jscomp$3$$, $name$jscomp$77$$);
  });
};
$JSCompiler_prototypeAlias$$.upgrade = function($i$jscomp$6_root$jscomp$4$$, $opt_query$$) {
  var $newlyDefined$$ = !!$opt_query$$, $upgradeCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$jscomp$6_root$jscomp$4$$, $opt_query$$ || this.$query_$);
  for ($i$jscomp$6_root$jscomp$4$$ = 0; $i$jscomp$6_root$jscomp$4$$ < $upgradeCandidates$$.length; $i$jscomp$6_root$jscomp$4$$++) {
    var $candidate$jscomp$1$$ = $upgradeCandidates$$[$i$jscomp$6_root$jscomp$4$$];
    $newlyDefined$$ ? $JSCompiler_StaticMethods_connectedCallback_$$(this, $candidate$jscomp$1$$) : this.upgradeSelf($candidate$jscomp$1$$);
  }
};
$JSCompiler_prototypeAlias$$.upgradeSelf = function($node$jscomp$5$$) {
  var $def$jscomp$2$$ = this.getByName($node$jscomp$5$$.localName);
  $def$jscomp$2$$ && $JSCompiler_StaticMethods_upgradeSelf_$$(this, $node$jscomp$5$$, $def$jscomp$2$$);
};
function $JSCompiler_StaticMethods_queryAll_$$($root$jscomp$5$$, $query$jscomp$13$$) {
  return $query$jscomp$13$$ && $root$jscomp$5$$.querySelectorAll ? $root$jscomp$5$$.querySelectorAll($query$jscomp$13$$) : [];
}
function $JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_upgradeSelf_$self$$, $node$jscomp$6$$, $ctor$jscomp$4_def$jscomp$3$$) {
  $ctor$jscomp$4_def$jscomp$3$$ = $ctor$jscomp$4_def$jscomp$3$$.ctor;
  if (!($node$jscomp$6$$ instanceof $ctor$jscomp$4_def$jscomp$3$$)) {
    $JSCompiler_StaticMethods_upgradeSelf_$self$$.$current_$ = $node$jscomp$6$$;
    try {
      if (new $ctor$jscomp$4_def$jscomp$3$$ !== $node$jscomp$6$$) {
        throw new $JSCompiler_StaticMethods_upgradeSelf_$self$$.$win_$.Error("Constructor illegally returned a different instance.");
      }
    } catch ($e$jscomp$9$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$9$$);
    }
  }
}
function $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$) {
  var $def$jscomp$4$$ = $JSCompiler_StaticMethods_connectedCallback_$self$$.getByName($node$jscomp$7$$.localName);
  if ($def$jscomp$4$$ && ($JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$, $def$jscomp$4$$), $node$jscomp$7$$.connectedCallback)) {
    try {
      $node$jscomp$7$$.connectedCallback();
    } catch ($e$jscomp$10$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$10$$);
    }
  }
}
function $JSCompiler_StaticMethods_observe_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$78$$) {
  if ($JSCompiler_StaticMethods_observe_$self$$.$query_$) {
    $JSCompiler_StaticMethods_observe_$self$$.$query_$ += "," + $name$jscomp$78$$;
  } else {
    $JSCompiler_StaticMethods_observe_$self$$.$query_$ = $name$jscomp$78$$;
    var $mo$$ = new $JSCompiler_StaticMethods_observe_$self$$.$win_$.MutationObserver(function($name$jscomp$78$$) {
      $name$jscomp$78$$ && $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$78$$);
    });
    $JSCompiler_StaticMethods_observe_$self$$.$mutationObserver_$ = $mo$$;
    $JSCompiler_StaticMethods_observe_$self$$.$roots_$.forEach(function($JSCompiler_StaticMethods_observe_$self$$) {
      $mo$$.observe($JSCompiler_StaticMethods_observe_$self$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$);
    });
    $installPatches$$module$src$polyfills$custom_elements$$($JSCompiler_StaticMethods_observe_$self$$.$win_$, $JSCompiler_StaticMethods_observe_$self$$);
  }
}
$JSCompiler_prototypeAlias$$.observe = function($tree$jscomp$2$$) {
  this.$roots_$.push($tree$jscomp$2$$);
  this.$mutationObserver_$ && this.$mutationObserver_$.observe($tree$jscomp$2$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$);
};
$JSCompiler_prototypeAlias$$.sync = function() {
  this.$mutationObserver_$ && $JSCompiler_StaticMethods_handleRecords_$$(this, this.$mutationObserver_$.takeRecords());
};
function $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $records$jscomp$1$$) {
  for (var $i$jscomp$7$$ = 0; $i$jscomp$7$$ < $records$jscomp$1$$.length; $i$jscomp$7$$++) {
    var $record$$ = $records$jscomp$1$$[$i$jscomp$7$$];
    if ($record$$) {
      var $$jscomp$destructuring$var5_i$1_i$3$$ = $record$$, $addedNodes$$ = $$jscomp$destructuring$var5_i$1_i$3$$.addedNodes, $removedNodes$$ = $$jscomp$destructuring$var5_i$1_i$3$$.removedNodes;
      for ($$jscomp$destructuring$var5_i$1_i$3$$ = 0; $$jscomp$destructuring$var5_i$1_i$3$$ < $addedNodes$$.length; $$jscomp$destructuring$var5_i$1_i$3$$++) {
        var $i$2_i$5_node$4_node$jscomp$9$$ = $addedNodes$$[$$jscomp$destructuring$var5_i$1_i$3$$], $connectedCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$2_i$5_node$4_node$jscomp$9$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
        $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $i$2_i$5_node$4_node$jscomp$9$$);
        for ($i$2_i$5_node$4_node$jscomp$9$$ = 0; $i$2_i$5_node$4_node$jscomp$9$$ < $connectedCandidates$$.length; $i$2_i$5_node$4_node$jscomp$9$$++) {
          $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $connectedCandidates$$[$i$2_i$5_node$4_node$jscomp$9$$]);
        }
      }
      for ($$jscomp$destructuring$var5_i$1_i$3$$ = 0; $$jscomp$destructuring$var5_i$1_i$3$$ < $removedNodes$$.length; $$jscomp$destructuring$var5_i$1_i$3$$++) {
        $i$2_i$5_node$4_node$jscomp$9$$ = $removedNodes$$[$$jscomp$destructuring$var5_i$1_i$3$$];
        var $disconnectedCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$2_i$5_node$4_node$jscomp$9$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
        if ($i$2_i$5_node$4_node$jscomp$9$$.disconnectedCallback) {
          try {
            $i$2_i$5_node$4_node$jscomp$9$$.disconnectedCallback();
          } catch ($JSCompiler_e$jscomp$inline_228$$) {
            $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_228$$);
          }
        }
        for ($i$2_i$5_node$4_node$jscomp$9$$ = 0; $i$2_i$5_node$4_node$jscomp$9$$ < $disconnectedCandidates$$.length; $i$2_i$5_node$4_node$jscomp$9$$++) {
          var $JSCompiler_node$jscomp$inline_231$$ = $disconnectedCandidates$$[$i$2_i$5_node$4_node$jscomp$9$$];
          if ($JSCompiler_node$jscomp$inline_231$$.disconnectedCallback) {
            try {
              $JSCompiler_node$jscomp$inline_231$$.disconnectedCallback();
            } catch ($JSCompiler_e$jscomp$inline_232$$) {
              $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_232$$);
            }
          }
        }
      }
    }
  }
}
function $installPatches$$module$src$polyfills$custom_elements$$($win$jscomp$9$$, $registry$jscomp$1$$) {
  var $document$jscomp$2$$ = $win$jscomp$9$$.document, $docProto$$ = $win$jscomp$9$$.Document.prototype, $elProto$$ = $win$jscomp$9$$.Element.prototype, $nodeProto$$ = $win$jscomp$9$$.Node.prototype, $createElement$$ = $docProto$$.createElement, $importNode$$ = $docProto$$.importNode, $appendChild$$ = $nodeProto$$.appendChild, $cloneNode$$ = $nodeProto$$.cloneNode, $insertBefore$$ = $nodeProto$$.insertBefore, $removeChild$$ = $nodeProto$$.removeChild, $replaceChild$$ = $nodeProto$$.replaceChild;
  $docProto$$.createElement = function($win$jscomp$9$$) {
    var $document$jscomp$2$$ = $registry$jscomp$1$$.getByName($win$jscomp$9$$);
    return $document$jscomp$2$$ ? new $document$jscomp$2$$.ctor : $createElement$$.apply(this, arguments);
  };
  $docProto$$.importNode = function() {
    var $win$jscomp$9$$ = $importNode$$.apply(this, arguments);
    $win$jscomp$9$$ && this === $document$jscomp$2$$ && ($registry$jscomp$1$$.upgradeSelf($win$jscomp$9$$), $registry$jscomp$1$$.upgrade($win$jscomp$9$$));
    return $win$jscomp$9$$;
  };
  $nodeProto$$.appendChild = function() {
    var $win$jscomp$9$$ = $appendChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $win$jscomp$9$$;
  };
  $nodeProto$$.insertBefore = function() {
    var $win$jscomp$9$$ = $insertBefore$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $win$jscomp$9$$;
  };
  $nodeProto$$.removeChild = function() {
    var $win$jscomp$9$$ = $removeChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $win$jscomp$9$$;
  };
  $nodeProto$$.replaceChild = function() {
    var $win$jscomp$9$$ = $replaceChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $win$jscomp$9$$;
  };
  $nodeProto$$.cloneNode = function() {
    var $win$jscomp$9$$ = $cloneNode$$.apply(this, arguments);
    $win$jscomp$9$$.ownerDocument === $document$jscomp$2$$ && ($registry$jscomp$1$$.upgradeSelf($win$jscomp$9$$), $registry$jscomp$1$$.upgrade($win$jscomp$9$$));
    return $win$jscomp$9$$;
  };
  var $innerHTMLProto$$ = $elProto$$, $innerHTMLDesc$$ = Object.getOwnPropertyDescriptor($innerHTMLProto$$, "innerHTML");
  $innerHTMLDesc$$ || ($innerHTMLProto$$ = Object.getPrototypeOf($win$jscomp$9$$.HTMLElement.prototype), $innerHTMLDesc$$ = Object.getOwnPropertyDescriptor($innerHTMLProto$$, "innerHTML"));
  if ($innerHTMLDesc$$ && $innerHTMLDesc$$.configurable) {
    var $innerHTMLSetter$$ = $innerHTMLDesc$$.set;
    $innerHTMLDesc$$.set = function($win$jscomp$9$$) {
      $innerHTMLSetter$$.call(this, $win$jscomp$9$$);
      $registry$jscomp$1$$.upgrade(this);
    };
    Object.defineProperty($innerHTMLProto$$, "innerHTML", $innerHTMLDesc$$);
  }
}
function $polyfill$$module$src$polyfills$custom_elements$$() {
  function $HTMLElementPolyfill$$() {
    var $HTMLElementPolyfill$$ = this.constructor, $win$jscomp$10$$ = $registry$jscomp$2$$.current();
    $win$jscomp$10$$ || ($win$jscomp$10$$ = $registry$jscomp$2$$.getByConstructor($HTMLElementPolyfill$$), $win$jscomp$10$$ = $createElement$jscomp$1$$.call($document$jscomp$3$$, $win$jscomp$10$$.name));
    $setPrototypeOf$$module$src$polyfills$custom_elements$$($win$jscomp$10$$, $HTMLElementPolyfill$$.prototype);
    return $win$jscomp$10$$;
  }
  var $win$jscomp$10$$ = $JSCompiler_win$jscomp$inline_325$$, $Element$jscomp$2_elProto$jscomp$1$$ = $win$jscomp$10$$.Element, $HTMLElement$jscomp$1$$ = $win$jscomp$10$$.HTMLElement, $document$jscomp$3$$ = $win$jscomp$10$$.document, $createElement$jscomp$1$$ = $document$jscomp$3$$.createElement, $registry$jscomp$2$$ = new $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$10$$), $customElements$jscomp$2$$ = new $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$10$$, 
  $registry$jscomp$2$$);
  Object.defineProperty($win$jscomp$10$$, "customElements", {enumerable:!0, configurable:!0, value:$customElements$jscomp$2$$});
  $Element$jscomp$2_elProto$jscomp$1$$ = $Element$jscomp$2_elProto$jscomp$1$$.prototype;
  var $attachShadow$$ = $Element$jscomp$2_elProto$jscomp$1$$.attachShadow, $createShadowRoot$$ = $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot;
  $attachShadow$$ && ($Element$jscomp$2_elProto$jscomp$1$$.attachShadow = function($HTMLElementPolyfill$$) {
    var $win$jscomp$10$$ = $attachShadow$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($win$jscomp$10$$);
    return $win$jscomp$10$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.attachShadow.toString = function() {
    return $attachShadow$$.toString();
  });
  $createShadowRoot$$ && ($Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot = function() {
    var $HTMLElementPolyfill$$ = $createShadowRoot$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($HTMLElementPolyfill$$);
    return $HTMLElementPolyfill$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot.toString = function() {
    return $createShadowRoot$$.toString();
  });
  $subClass$$module$src$polyfills$custom_elements$$($HTMLElement$jscomp$1$$, $HTMLElementPolyfill$$);
  $win$jscomp$10$$.HTMLElement = $HTMLElementPolyfill$$;
  $HTMLElementPolyfill$$.call || ($HTMLElementPolyfill$$.apply = $win$jscomp$10$$.Function.apply, $HTMLElementPolyfill$$.bind = $win$jscomp$10$$.Function.bind, $HTMLElementPolyfill$$.call = $win$jscomp$10$$.Function.call);
}
function $wrapHTMLElement$$module$src$polyfills$custom_elements$$() {
  function $HTMLElementWrapper$$() {
    return $Reflect$jscomp$1$$.construct($HTMLElement$jscomp$2$$, [], this.constructor);
  }
  var $win$jscomp$11$$ = $JSCompiler_win$jscomp$inline_325$$, $HTMLElement$jscomp$2$$ = $win$jscomp$11$$.HTMLElement, $Reflect$jscomp$1$$ = $win$jscomp$11$$.Reflect;
  $subClass$$module$src$polyfills$custom_elements$$($HTMLElement$jscomp$2$$, $HTMLElementWrapper$$);
  $win$jscomp$11$$.HTMLElement = $HTMLElementWrapper$$;
}
function $subClass$$module$src$polyfills$custom_elements$$($superClass$$, $subClass$$) {
  $subClass$$.prototype = Object.create($superClass$$.prototype, {constructor:{configurable:!0, writable:!0, value:$subClass$$}});
  $setPrototypeOf$$module$src$polyfills$custom_elements$$($subClass$$, $superClass$$);
}
function $setPrototypeOf$$module$src$polyfills$custom_elements$$($obj$jscomp$28$$, $JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$) {
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf($obj$jscomp$28$$, $JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$);
  } else {
    if ({__proto__:{test:!0}}.test) {
      $obj$jscomp$28$$.__proto__ = $JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$;
    } else {
      for (; null !== $JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$ && !Object.isPrototypeOf.call($JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$, $obj$jscomp$28$$);) {
        for (var $JSCompiler_props$jscomp$inline_237$$ = Object.getOwnPropertyNames($JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$), $JSCompiler_i$jscomp$inline_238$$ = 0; $JSCompiler_i$jscomp$inline_238$$ < $JSCompiler_props$jscomp$inline_237$$.length; $JSCompiler_i$jscomp$inline_238$$++) {
          var $JSCompiler_prop$jscomp$inline_239$$ = $JSCompiler_props$jscomp$inline_237$$[$JSCompiler_i$jscomp$inline_238$$];
          if (!Object.hasOwnProperty.call($obj$jscomp$28$$, $JSCompiler_prop$jscomp$inline_239$$)) {
            var $JSCompiler_desc$jscomp$inline_240$$ = Object.getOwnPropertyDescriptor($JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$, $JSCompiler_prop$jscomp$inline_239$$);
            Object.defineProperty($obj$jscomp$28$$, $JSCompiler_prop$jscomp$inline_239$$, $JSCompiler_desc$jscomp$inline_240$$);
          }
        }
        $JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$ = Object.getPrototypeOf($JSCompiler_current$jscomp$inline_236_prototype$jscomp$1$$);
      }
    }
  }
}
;function $domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist$$($token$jscomp$4$$, $opt_force$jscomp$1$$) {
  if (void 0 === $opt_force$jscomp$1$$ ? this.contains($token$jscomp$4$$) : !$opt_force$jscomp$1$$) {
    return this.remove($token$jscomp$4$$), !1;
  }
  this.add($token$jscomp$4$$);
  return !0;
}
function $install$$module$src$polyfills$domtokenlist$$() {
  var $win$jscomp$13$$ = self;
  if (/Trident|MSIE|IEMobile/i.test($win$jscomp$13$$.navigator.userAgent) && $win$jscomp$13$$.DOMTokenList) {
    $win$jscomp$13$$.Object.defineProperty($win$jscomp$13$$.DOMTokenList.prototype, "toggle", {enumerable:!1, configurable:!0, writable:!0, value:$domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist$$});
    var $add$$ = $win$jscomp$13$$.DOMTokenList.prototype.add;
    $win$jscomp$13$$.DOMTokenList.prototype.add = function() {
      for (var $win$jscomp$13$$ = 0; $win$jscomp$13$$ < arguments.length; $win$jscomp$13$$++) {
        $add$$.call(this, arguments[$win$jscomp$13$$]);
      }
    };
  }
}
;function $documentContainsPolyfill$$module$src$polyfills$document_contains$$($node$jscomp$10$$) {
  return $node$jscomp$10$$ == this || this.documentElement.contains($node$jscomp$10$$);
}
;var $toString_$$module$src$types$$ = Object.prototype.toString;
function $isArray$$module$src$types$$($value$jscomp$91$$) {
  return Array.isArray($value$jscomp$91$$);
}
function $isObject$$module$src$types$$($value$jscomp$92$$) {
  return "[object Object]" === $toString_$$module$src$types$$.call($value$jscomp$92$$);
}
function $isFiniteNumber$$module$src$types$$($value$jscomp$93$$) {
  return "number" === typeof $value$jscomp$93$$ && isFinite($value$jscomp$93$$);
}
;function $once$$module$src$utils$function$$($fn$$) {
  var $evaluated$$ = !1, $retValue$$ = null, $callback$jscomp$50$$ = $fn$$;
  return function($fn$$) {
    for (var $args$$ = [], $$jscomp$restIndex$$ = 0; $$jscomp$restIndex$$ < arguments.length; ++$$jscomp$restIndex$$) {
      $args$$[$$jscomp$restIndex$$ - 0] = arguments[$$jscomp$restIndex$$];
    }
    $evaluated$$ || ($retValue$$ = $callback$jscomp$50$$.apply(self, $args$$), $evaluated$$ = !0, $callback$jscomp$50$$ = null);
    return $retValue$$;
  };
}
;var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
function $getMetaUrl$$module$src$config$$($name$jscomp$80$$) {
  if (!self.document || !self.document.head || self.location && $cdnProxyRegex$$module$src$config$$.test(self.location.origin)) {
    return null;
  }
  var $metaEl$$ = self.document.head.querySelector('meta[name="' + $name$jscomp$80$$ + '"]');
  return $metaEl$$ && $metaEl$$.getAttribute("content") || null;
}
var $urls$$module$src$config$$ = {thirdParty:$env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net", thirdPartyFrameHost:$env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net", thirdPartyFrameRegex:("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/, cdn:$env$$module$src$config$$.cdnUrl || $getMetaUrl$$module$src$config$$("runtime-host") || 
"https://cdn.ampproject.org", cdnProxyRegex:$cdnProxyRegex$$module$src$config$$, localhostRegex:/^https?:\/\/localhost(:\d+)?$/, errorReporting:$env$$module$src$config$$.errorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r", betaErrorReporting:$env$$module$src$config$$.betaErrorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta", localDev:$env$$module$src$config$$.localDev || !1, trustedViewerHosts:[/(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/, 
/(^|\.)gmail\.(com|dev)$/], geoApi:$env$$module$src$config$$.geoApiUrl || $getMetaUrl$$module$src$config$$("amp-geo-api")}, $config$$module$src$config$$ = {urls:$urls$$module$src$config$$};
function $noop$$module$src$log$$() {
}
function $isUserErrorMessage$$module$src$log$$($message$jscomp$29$$) {
  return 0 <= $message$jscomp$29$$.indexOf("\u200b\u200b\u200b");
}
var $levelOverride_$$module$src$log$$ = void 0;
function $overrideLogLevel$$module$src$log$$($level$jscomp$19$$) {
  $levelOverride_$$module$src$log$$ = $level$jscomp$19$$;
}
function $externalMessageUrl$$module$src$log$$($id$jscomp$6$$, $interpolatedParts$$) {
  return $interpolatedParts$$.reduce(function($id$jscomp$6$$, $interpolatedParts$$) {
    return $id$jscomp$6$$ + "&s[]=" + encodeURIComponent(String($elementStringOrPassthru$$module$src$log$$($interpolatedParts$$)));
  }, "https://log.amp.dev/?v=012005062057000&id=" + encodeURIComponent($id$jscomp$6$$));
}
function $Log$$module$src$log$$($win$jscomp$16$$, $levelFunc$$, $opt_suffix$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  $opt_suffix$$ = void 0 === $opt_suffix$$ ? "" : $opt_suffix$$;
  this.win = $getMode$$module$src$mode$$().test && $win$jscomp$16$$.__AMP_TEST_IFRAME ? $win$jscomp$16$$.parent : $win$jscomp$16$$;
  this.$levelFunc_$ = $levelFunc$$;
  this.$level_$ = this.win.console && this.win.console.log && "0" != $getMode$$module$src$mode$$().log ? $getMode$$module$src$mode$$().test && this.win.ENABLE_LOG ? 4 : $getMode$$module$src$mode$$().localDev && !$getMode$$module$src$mode$$().log ? 3 : this.$levelFunc_$(parseInt($getMode$$module$src$mode$$().log, 10), $getMode$$module$src$mode$$().development) : 0;
  this.$suffix_$ = $opt_suffix$$;
  this.$messages_$ = null;
  this.$fetchExternalMessagesOnce_$ = $once$$module$src$utils$function$$(function() {
    $win$jscomp$16$$.fetch($urls$$module$src$config$$.cdn + "/rtv/012005062057000/log-messages.simple.json").then(function($win$jscomp$16$$) {
      return $win$jscomp$16$$.json();
    }, $noop$$module$src$log$$).then(function($win$jscomp$16$$) {
      $win$jscomp$16$$ && ($$jscomp$this$jscomp$2$$.$messages_$ = $win$jscomp$16$$);
    });
  });
}
function $JSCompiler_StaticMethods_getLevel_$$($JSCompiler_StaticMethods_getLevel_$self$$) {
  return void 0 !== $levelOverride_$$module$src$log$$ ? $levelOverride_$$module$src$log$$ : $JSCompiler_StaticMethods_getLevel_$self$$.$level_$;
}
function $JSCompiler_StaticMethods_msg_$$($JSCompiler_StaticMethods_msg_$self$$, $prefix$jscomp$3_tag$jscomp$2$$, $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$, $messages$$) {
  if (0 != $JSCompiler_StaticMethods_getLevel_$$($JSCompiler_StaticMethods_msg_$self$$)) {
    var $fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.log;
    "ERROR" == $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$ ? $fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.error || $fn$jscomp$2$$ : "INFO" == $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$ ? $fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.info || $fn$jscomp$2$$ : "WARN" == $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$ && ($fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.warn || $fn$jscomp$2$$);
    $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$ = $isArray$$module$src$types$$($messages$$[0]) ? $JSCompiler_StaticMethods_expandMessageArgs_$$($JSCompiler_StaticMethods_msg_$self$$, $messages$$[0]) : $messages$$;
    $prefix$jscomp$3_tag$jscomp$2$$ = "[" + $prefix$jscomp$3_tag$jscomp$2$$ + "]";
    "string" === typeof $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$[0] ? $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$[0] = $prefix$jscomp$3_tag$jscomp$2$$ + " " + $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$[0] : $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$.unshift($prefix$jscomp$3_tag$jscomp$2$$);
    $fn$jscomp$2$$.apply($JSCompiler_StaticMethods_msg_$self$$.win.console, $JSCompiler_inline_result$jscomp$114_level$jscomp$20$$);
  }
}
$JSCompiler_prototypeAlias$$ = $Log$$module$src$log$$.prototype;
$JSCompiler_prototypeAlias$$.isEnabled = function() {
  return 0 != $JSCompiler_StaticMethods_getLevel_$$(this);
};
$JSCompiler_prototypeAlias$$.fine = function($tag$jscomp$3$$, $var_args$jscomp$34$$) {
  4 <= $JSCompiler_StaticMethods_getLevel_$$(this) && $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$3$$, "FINE", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.info = function($tag$jscomp$4$$, $var_args$jscomp$35$$) {
  3 <= $JSCompiler_StaticMethods_getLevel_$$(this) && $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$4$$, "INFO", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.warn = function($tag$jscomp$5$$, $var_args$jscomp$36$$) {
  2 <= $JSCompiler_StaticMethods_getLevel_$$(this) && $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$5$$, "WARN", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.$error_$ = function($tag$jscomp$6$$, $var_args$jscomp$37$$) {
  if (1 <= $JSCompiler_StaticMethods_getLevel_$$(this)) {
    $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$6$$, "ERROR", Array.prototype.slice.call(arguments, 1));
  } else {
    var $error$jscomp$3$$ = $createErrorVargs$$module$src$log$$.apply(null, Array.prototype.slice.call(arguments, 1));
    $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$3$$);
    return $error$jscomp$3$$;
  }
};
$JSCompiler_prototypeAlias$$.error = function($tag$jscomp$7$$, $var_args$jscomp$38$$) {
  var $error$jscomp$4$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$4$$ && ($error$jscomp$4$$.name = $tag$jscomp$7$$ || $error$jscomp$4$$.name, self.__AMP_REPORT_ERROR($error$jscomp$4$$));
};
$JSCompiler_prototypeAlias$$.expectedError = function($unusedTag$$, $var_args$jscomp$39$$) {
  var $error$jscomp$5$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$5$$ && ($error$jscomp$5$$.expected = !0, self.__AMP_REPORT_ERROR($error$jscomp$5$$));
};
$JSCompiler_prototypeAlias$$.createError = function($var_args$jscomp$40$$) {
  var $error$jscomp$6$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$6$$);
  return $error$jscomp$6$$;
};
$JSCompiler_prototypeAlias$$.createExpectedError = function($var_args$jscomp$41$$) {
  var $error$jscomp$7$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$7$$);
  $error$jscomp$7$$.expected = !0;
  return $error$jscomp$7$$;
};
$JSCompiler_prototypeAlias$$.assert = function($shouldBeTrueish$$, $opt_message$jscomp$7$$, $var_args$jscomp$42$$) {
  var $firstElement$$;
  if ($isArray$$module$src$types$$($opt_message$jscomp$7$$)) {
    return this.assert.apply(this, [$shouldBeTrueish$$].concat($JSCompiler_StaticMethods_expandMessageArgs_$$(this, $opt_message$jscomp$7$$)));
  }
  if (!$shouldBeTrueish$$) {
    var $splitMessage$$ = ($opt_message$jscomp$7$$ || "Assertion failed").split("%s"), $JSCompiler_val$jscomp$inline_249_first$jscomp$5$$ = $splitMessage$$.shift(), $formatted$$ = $JSCompiler_val$jscomp$inline_249_first$jscomp$5$$, $messageArray$$ = [], $e$jscomp$13_i$jscomp$10$$ = 2;
    for ("" != $JSCompiler_val$jscomp$inline_249_first$jscomp$5$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_249_first$jscomp$5$$); 0 < $splitMessage$$.length;) {
      var $nextConstant$$ = $splitMessage$$.shift(), $val$$ = arguments[$e$jscomp$13_i$jscomp$10$$++];
      $val$$ && $val$$.tagName && ($firstElement$$ = $val$$);
      $messageArray$$.push($val$$);
      $JSCompiler_val$jscomp$inline_249_first$jscomp$5$$ = $nextConstant$$.trim();
      "" != $JSCompiler_val$jscomp$inline_249_first$jscomp$5$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_249_first$jscomp$5$$);
      $formatted$$ += $elementStringOrPassthru$$module$src$log$$($val$$) + $nextConstant$$;
    }
    $e$jscomp$13_i$jscomp$10$$ = Error($formatted$$);
    $e$jscomp$13_i$jscomp$10$$.fromAssert = !0;
    $e$jscomp$13_i$jscomp$10$$.associatedElement = $firstElement$$;
    $e$jscomp$13_i$jscomp$10$$.messageArray = $messageArray$$;
    $JSCompiler_StaticMethods_prepareError_$$(this, $e$jscomp$13_i$jscomp$10$$);
    self.__AMP_REPORT_ERROR($e$jscomp$13_i$jscomp$10$$);
    throw $e$jscomp$13_i$jscomp$10$$;
  }
  return $shouldBeTrueish$$;
};
$JSCompiler_prototypeAlias$$.assertElement = function($shouldBeElement$$, $opt_message$jscomp$8$$) {
  $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeElement$$, $shouldBeElement$$ && 1 == $shouldBeElement$$.nodeType, "Element expected", $opt_message$jscomp$8$$);
  return $shouldBeElement$$;
};
$JSCompiler_prototypeAlias$$.assertString = function($shouldBeString$$, $opt_message$jscomp$9$$) {
  $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeString$$, "string" == typeof $shouldBeString$$, "String expected", $opt_message$jscomp$9$$);
  return $shouldBeString$$;
};
$JSCompiler_prototypeAlias$$.assertNumber = function($shouldBeNumber$$, $opt_message$jscomp$10$$) {
  $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeNumber$$, "number" == typeof $shouldBeNumber$$, "Number expected", $opt_message$jscomp$10$$);
  return $shouldBeNumber$$;
};
$JSCompiler_prototypeAlias$$.assertArray = function($shouldBeArray$$, $opt_message$jscomp$11$$) {
  $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeArray$$, $isArray$$module$src$types$$($shouldBeArray$$), "Array expected", $opt_message$jscomp$11$$);
  return $shouldBeArray$$;
};
$JSCompiler_prototypeAlias$$.assertBoolean = function($shouldBeBoolean$$, $opt_message$jscomp$12$$) {
  $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeBoolean$$, !!$shouldBeBoolean$$ === $shouldBeBoolean$$, "Boolean expected", $opt_message$jscomp$12$$);
  return $shouldBeBoolean$$;
};
$JSCompiler_prototypeAlias$$.assertEnumValue = function($JSCompiler_inline_result$jscomp$113_enumObj$jscomp$1$$, $s$jscomp$7$$, $opt_enumName$$) {
  a: {
    for (var $JSCompiler_k$jscomp$inline_253$$ in $JSCompiler_inline_result$jscomp$113_enumObj$jscomp$1$$) {
      if ($JSCompiler_inline_result$jscomp$113_enumObj$jscomp$1$$[$JSCompiler_k$jscomp$inline_253$$] === $s$jscomp$7$$) {
        $JSCompiler_inline_result$jscomp$113_enumObj$jscomp$1$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$113_enumObj$jscomp$1$$ = !1;
  }
  if ($JSCompiler_inline_result$jscomp$113_enumObj$jscomp$1$$) {
    return $s$jscomp$7$$;
  }
  this.assert(!1, 'Unknown %s value: "%s"', $opt_enumName$$ || "enum", $s$jscomp$7$$);
};
function $JSCompiler_StaticMethods_prepareError_$$($JSCompiler_StaticMethods_prepareError_$self$$, $error$jscomp$8$$) {
  $error$jscomp$8$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$8$$);
  $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ ? $error$jscomp$8$$.message ? -1 == $error$jscomp$8$$.message.indexOf($JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) && ($error$jscomp$8$$.message += $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) : $error$jscomp$8$$.message = $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ : $isUserErrorMessage$$module$src$log$$($error$jscomp$8$$.message) && ($error$jscomp$8$$.message = $error$jscomp$8$$.message.replace("\u200b\u200b\u200b", 
  ""));
}
function $JSCompiler_StaticMethods_expandMessageArgs_$$($JSCompiler_StaticMethods_expandMessageArgs_$self$$, $parts$$) {
  var $id$jscomp$7$$ = $parts$$.shift();
  $getMode$$module$src$mode$$($JSCompiler_StaticMethods_expandMessageArgs_$self$$.win).development && $JSCompiler_StaticMethods_expandMessageArgs_$self$$.$fetchExternalMessagesOnce_$();
  return $JSCompiler_StaticMethods_expandMessageArgs_$self$$.$messages_$ && $id$jscomp$7$$ in $JSCompiler_StaticMethods_expandMessageArgs_$self$$.$messages_$ ? [$JSCompiler_StaticMethods_expandMessageArgs_$self$$.$messages_$[$id$jscomp$7$$]].concat($parts$$) : ["More info at " + $externalMessageUrl$$module$src$log$$($id$jscomp$7$$, $parts$$)];
}
function $JSCompiler_StaticMethods_assertType_$$($JSCompiler_StaticMethods_assertType_$self$$, $subject$$, $assertion$$, $defaultMessage$$, $opt_message$jscomp$13$$) {
  $isArray$$module$src$types$$($opt_message$jscomp$13$$) ? $JSCompiler_StaticMethods_assertType_$self$$.assert($assertion$$, $opt_message$jscomp$13$$.concat($subject$$)) : $JSCompiler_StaticMethods_assertType_$self$$.assert($assertion$$, ($opt_message$jscomp$13$$ || $defaultMessage$$) + ": %s", $subject$$);
}
function $elementStringOrPassthru$$module$src$log$$($val$jscomp$2$$) {
  return $val$jscomp$2$$ && 1 == $val$jscomp$2$$.nodeType ? $val$jscomp$2$$.tagName.toLowerCase() + ($val$jscomp$2$$.id ? "#" + $val$jscomp$2$$.id : "") : $val$jscomp$2$$;
}
function $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$9$$) {
  var $messageProperty$$ = Object.getOwnPropertyDescriptor($error$jscomp$9$$, "message");
  if ($messageProperty$$ && $messageProperty$$.writable) {
    return $error$jscomp$9$$;
  }
  var $stack$$ = $error$jscomp$9$$.stack, $e$jscomp$14$$ = Error($error$jscomp$9$$.message), $prop$jscomp$3$$;
  for ($prop$jscomp$3$$ in $error$jscomp$9$$) {
    $e$jscomp$14$$[$prop$jscomp$3$$] = $error$jscomp$9$$[$prop$jscomp$3$$];
  }
  $e$jscomp$14$$.stack = $stack$$;
  return $e$jscomp$14$$;
}
function $createErrorVargs$$module$src$log$$($var_args$jscomp$43$$) {
  for (var $error$jscomp$10$$ = null, $message$jscomp$34$$ = "", $i$jscomp$11$$ = 0; $i$jscomp$11$$ < arguments.length; $i$jscomp$11$$++) {
    var $arg$jscomp$8$$ = arguments[$i$jscomp$11$$];
    $arg$jscomp$8$$ instanceof Error && !$error$jscomp$10$$ ? $error$jscomp$10$$ = $duplicateErrorIfNecessary$$module$src$log$$($arg$jscomp$8$$) : ($message$jscomp$34$$ && ($message$jscomp$34$$ += " "), $message$jscomp$34$$ += $arg$jscomp$8$$);
  }
  $error$jscomp$10$$ ? $message$jscomp$34$$ && ($error$jscomp$10$$.message = $message$jscomp$34$$ + ": " + $error$jscomp$10$$.message) : $error$jscomp$10$$ = Error($message$jscomp$34$$);
  return $error$jscomp$10$$;
}
function $rethrowAsync$$module$src$log$$($var_args$jscomp$44$$) {
  var $error$jscomp$11$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  setTimeout(function() {
    self.__AMP_REPORT_ERROR($error$jscomp$11$$);
    throw $error$jscomp$11$$;
  });
}
self.__AMP_LOG = self.__AMP_LOG || {user:null, dev:null, userForEmbed:null};
var $logs$$module$src$log$$ = self.__AMP_LOG, $logConstructor$$module$src$log$$ = null;
function $user$$module$src$log$$($opt_element$jscomp$5$$) {
  $logs$$module$src$log$$.user || ($logs$$module$src$log$$.user = $getUserLogger$$module$src$log$$("\u200b\u200b\u200b"));
  var $JSCompiler_win$jscomp$inline_256$$ = $logs$$module$src$log$$.user.win;
  return $opt_element$jscomp$5$$ && $opt_element$jscomp$5$$.ownerDocument.defaultView != $JSCompiler_win$jscomp$inline_256$$ ? $logs$$module$src$log$$.userForEmbed ? $logs$$module$src$log$$.userForEmbed : $logs$$module$src$log$$.userForEmbed = $getUserLogger$$module$src$log$$("\u200b\u200b\u200b\u200b") : $logs$$module$src$log$$.user;
}
function $getUserLogger$$module$src$log$$($suffix$$) {
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return new $logConstructor$$module$src$log$$(self, function($suffix$$, $development$$) {
    return $development$$ || 1 <= $suffix$$ ? 4 : 2;
  }, $suffix$$);
}
function $dev$$module$src$log$$() {
  if ($logs$$module$src$log$$.dev) {
    return $logs$$module$src$log$$.dev;
  }
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return $logs$$module$src$log$$.dev = new $logConstructor$$module$src$log$$(self, function($logNum$jscomp$1$$) {
    return 3 <= $logNum$jscomp$1$$ ? 4 : 2 <= $logNum$jscomp$1$$ ? 3 : 0;
  });
}
function $devAssert$$module$src$log$$($shouldBeTrueish$jscomp$2$$) {
  return $getMode$$module$src$mode$$().minified ? $shouldBeTrueish$jscomp$2$$ : $dev$$module$src$log$$().assert($shouldBeTrueish$jscomp$2$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function $userAssert$$module$src$log$$($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$, $opt_4$jscomp$1$$) {
  return $user$$module$src$log$$().assert($shouldBeTrueish$jscomp$3$$, $opt_message$jscomp$15$$, $opt_1$jscomp$1$$, $opt_2$jscomp$1$$, $opt_3$jscomp$1$$, $opt_4$jscomp$1$$, void 0, void 0, void 0, void 0, void 0);
}
;var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $map$$module$src$utils$object$$($opt_initial$$) {
  var $obj$jscomp$30$$ = Object.create(null);
  $opt_initial$$ && Object.assign($obj$jscomp$30$$, $opt_initial$$);
  return $obj$jscomp$30$$;
}
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;function $Deferred$$module$src$utils$promise$$() {
  var $resolve$jscomp$1$$, $reject$$;
  this.promise = new Promise(function($res$jscomp$1$$, $rej$$) {
    $resolve$jscomp$1$$ = $res$jscomp$1$$;
    $reject$$ = $rej$$;
  });
  this.resolve = $resolve$jscomp$1$$;
  this.reject = $reject$$;
}
function $tryResolve$$module$src$utils$promise$$($fn$jscomp$3$$) {
  return new Promise(function($resolve$jscomp$2$$) {
    $resolve$jscomp$2$$($fn$jscomp$3$$());
  });
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
var $regex$$module$third_party$css_escape$css_escape$$ = /(\0)|^(-)$|([\x01-\x1f\x7f]|^-?[0-9])|([\x80-\uffff0-9a-zA-Z_-]+)|[^]/g;
function $escaper$$module$third_party$css_escape$css_escape$$($match$jscomp$1$$, $nil$$, $dash$$, $hexEscape$$, $chars$$) {
  return $chars$$ ? $chars$$ : $nil$$ ? "\ufffd" : $hexEscape$$ ? $match$jscomp$1$$.slice(0, -1) + "\\" + $match$jscomp$1$$.slice(-1).charCodeAt(0).toString(16) + " " : "\\" + $match$jscomp$1$$;
}
;var $scopeSelectorSupported$$module$src$css$$;
function $testScopeSelector$$module$src$css$$($el$jscomp$3$$) {
  try {
    var $doc$jscomp$1$$ = $el$jscomp$3$$.ownerDocument, $testElement$$ = $doc$jscomp$1$$.createElement("div"), $testChild$$ = $doc$jscomp$1$$.createElement("div");
    $testElement$$.appendChild($testChild$$);
    return $testElement$$.querySelector(":scope div") === $testChild$$;
  } catch ($e$jscomp$15$$) {
    return !1;
  }
}
;function $endsWith$$module$src$string$$($string$jscomp$5$$, $suffix$jscomp$1$$) {
  var $index$jscomp$73$$ = $string$jscomp$5$$.length - $suffix$jscomp$1$$.length;
  return 0 <= $index$jscomp$73$$ && $string$jscomp$5$$.indexOf($suffix$jscomp$1$$, $index$jscomp$73$$) == $index$jscomp$73$$;
}
function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
  return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
}
function $trimStart$$module$src$string$$($str$jscomp$8$$) {
  return $str$jscomp$8$$.trimStart ? $str$jscomp$8$$.trimStart() : ($str$jscomp$8$$ + "_").trim().slice(0, -1);
}
;function $waitForChild$$module$src$dom$$($parent$jscomp$4$$, $checkFunc$$, $callback$jscomp$51$$) {
  if ($checkFunc$$($parent$jscomp$4$$)) {
    $callback$jscomp$51$$();
  } else {
    var $win$jscomp$18$$ = $parent$jscomp$4$$.ownerDocument.defaultView;
    if ($win$jscomp$18$$.MutationObserver) {
      var $observer$$ = new $win$jscomp$18$$.MutationObserver(function() {
        $checkFunc$$($parent$jscomp$4$$) && ($observer$$.disconnect(), $callback$jscomp$51$$());
      });
      $observer$$.observe($parent$jscomp$4$$, {childList:!0});
    } else {
      var $interval$$ = $win$jscomp$18$$.setInterval(function() {
        $checkFunc$$($parent$jscomp$4$$) && ($win$jscomp$18$$.clearInterval($interval$$), $callback$jscomp$51$$());
      }, 5);
    }
  }
}
function $waitForChildPromise$$module$src$dom$$($parent$jscomp$5$$, $checkFunc$jscomp$1$$) {
  return new Promise(function($resolve$jscomp$5$$) {
    $waitForChild$$module$src$dom$$($parent$jscomp$5$$, $checkFunc$jscomp$1$$, $resolve$jscomp$5$$);
  });
}
function $waitForBodyOpen$$module$src$dom$$($doc$jscomp$2$$, $callback$jscomp$52$$) {
  $waitForChild$$module$src$dom$$($doc$jscomp$2$$.documentElement, function() {
    return !!$doc$jscomp$2$$.body;
  }, $callback$jscomp$52$$);
}
function $waitForBodyOpenPromise$$module$src$dom$$($doc$jscomp$3$$) {
  return new Promise(function($resolve$jscomp$6$$) {
    return $waitForBodyOpen$$module$src$dom$$($doc$jscomp$3$$, $resolve$jscomp$6$$);
  });
}
function $removeElement$$module$src$dom$$($element$jscomp$13$$) {
  $element$jscomp$13$$.parentElement && $element$jscomp$13$$.parentElement.removeChild($element$jscomp$13$$);
}
function $createElementWithAttributes$$module$src$dom$$($doc$jscomp$4_element$jscomp$17$$) {
  var $attributes$jscomp$2$$ = $dict$$module$src$utils$object$$({src:"about:blank", style:"display:none"});
  $doc$jscomp$4_element$jscomp$17$$ = $doc$jscomp$4_element$jscomp$17$$.createElement("iframe");
  for (var $JSCompiler_attr$jscomp$inline_260$$ in $attributes$jscomp$2$$) {
    $doc$jscomp$4_element$jscomp$17$$.setAttribute($JSCompiler_attr$jscomp$inline_260$$, $attributes$jscomp$2$$[$JSCompiler_attr$jscomp$inline_260$$]);
  }
  return $doc$jscomp$4_element$jscomp$17$$;
}
function $isConnectedNode$$module$src$dom$$($n$jscomp$3_node$jscomp$11$$) {
  var $connected$$ = $n$jscomp$3_node$jscomp$11$$.isConnected;
  if (void 0 !== $connected$$) {
    return $connected$$;
  }
  do {
    if ($n$jscomp$3_node$jscomp$11$$ = $rootNodeFor$$module$src$dom$$($n$jscomp$3_node$jscomp$11$$), $n$jscomp$3_node$jscomp$11$$.host) {
      $n$jscomp$3_node$jscomp$11$$ = $n$jscomp$3_node$jscomp$11$$.host;
    } else {
      break;
    }
  } while (1);
  return $n$jscomp$3_node$jscomp$11$$.nodeType === Node.DOCUMENT_NODE;
}
function $rootNodeFor$$module$src$dom$$($n$jscomp$4_node$jscomp$12$$) {
  if (Node.prototype.getRootNode) {
    return $n$jscomp$4_node$jscomp$12$$.getRootNode() || $n$jscomp$4_node$jscomp$12$$;
  }
  for (; $n$jscomp$4_node$jscomp$12$$.parentNode && !$isShadowRoot$$module$src$dom$$($n$jscomp$4_node$jscomp$12$$); $n$jscomp$4_node$jscomp$12$$ = $n$jscomp$4_node$jscomp$12$$.parentNode) {
  }
  return $n$jscomp$4_node$jscomp$12$$;
}
function $isShadowRoot$$module$src$dom$$($value$jscomp$96$$) {
  return $value$jscomp$96$$ ? "I-AMPHTML-SHADOW-ROOT" == $value$jscomp$96$$.tagName ? !0 : 11 == $value$jscomp$96$$.nodeType && "[object ShadowRoot]" === Object.prototype.toString.call($value$jscomp$96$$) : !1;
}
function $closest$$module$src$dom$$($el$jscomp$4_element$jscomp$18$$, $callback$jscomp$53$$) {
  for (; $el$jscomp$4_element$jscomp$18$$ && void 0 !== $el$jscomp$4_element$jscomp$18$$; $el$jscomp$4_element$jscomp$18$$ = $el$jscomp$4_element$jscomp$18$$.parentElement) {
    if ($callback$jscomp$53$$($el$jscomp$4_element$jscomp$18$$)) {
      return $el$jscomp$4_element$jscomp$18$$;
    }
  }
  return null;
}
function $closestNode$$module$src$dom$$($n$jscomp$5_node$jscomp$13$$, $callback$jscomp$54$$) {
  for (; $n$jscomp$5_node$jscomp$13$$; $n$jscomp$5_node$jscomp$13$$ = $n$jscomp$5_node$jscomp$13$$.parentNode) {
    if ($callback$jscomp$54$$($n$jscomp$5_node$jscomp$13$$)) {
      return $n$jscomp$5_node$jscomp$13$$;
    }
  }
  return null;
}
function $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$19$$, $selector$jscomp$2$$) {
  return $element$jscomp$19$$.closest ? $element$jscomp$19$$.closest($selector$jscomp$2$$) : $closest$$module$src$dom$$($element$jscomp$19$$, function($element$jscomp$19$$) {
    return $matches$$module$src$dom$$($element$jscomp$19$$, $selector$jscomp$2$$);
  });
}
function $childElements$$module$src$dom$$($child$jscomp$3_parent$jscomp$8$$, $callback$jscomp$56$$) {
  var $children$jscomp$128$$ = [];
  for ($child$jscomp$3_parent$jscomp$8$$ = $child$jscomp$3_parent$jscomp$8$$.firstElementChild; $child$jscomp$3_parent$jscomp$8$$; $child$jscomp$3_parent$jscomp$8$$ = $child$jscomp$3_parent$jscomp$8$$.nextElementSibling) {
    $callback$jscomp$56$$($child$jscomp$3_parent$jscomp$8$$) && $children$jscomp$128$$.push($child$jscomp$3_parent$jscomp$8$$);
  }
  return $children$jscomp$128$$;
}
function $lastChildElement$$module$src$dom$$($child$jscomp$4_parent$jscomp$9$$, $callback$jscomp$57$$) {
  for ($child$jscomp$4_parent$jscomp$9$$ = $child$jscomp$4_parent$jscomp$9$$.lastElementChild; $child$jscomp$4_parent$jscomp$9$$; $child$jscomp$4_parent$jscomp$9$$ = $child$jscomp$4_parent$jscomp$9$$.previousElementSibling) {
    if ($callback$jscomp$57$$($child$jscomp$4_parent$jscomp$9$$)) {
      return $child$jscomp$4_parent$jscomp$9$$;
    }
  }
  return null;
}
function $childNodes$$module$src$dom$$($child$jscomp$5_parent$jscomp$10$$, $callback$jscomp$58$$) {
  var $nodes$jscomp$15$$ = [];
  for ($child$jscomp$5_parent$jscomp$10$$ = $child$jscomp$5_parent$jscomp$10$$.firstChild; $child$jscomp$5_parent$jscomp$10$$; $child$jscomp$5_parent$jscomp$10$$ = $child$jscomp$5_parent$jscomp$10$$.nextSibling) {
    $callback$jscomp$58$$($child$jscomp$5_parent$jscomp$10$$) && $nodes$jscomp$15$$.push($child$jscomp$5_parent$jscomp$10$$);
  }
  return $nodes$jscomp$15$$;
}
function $childElementByAttr$$module$src$dom$$($parent$jscomp$11$$, $attr$jscomp$1$$) {
  $devAssert$$module$src$log$$(/^[\w-]+$/.test($attr$jscomp$1$$));
  return $scopedQuerySelector$$module$src$dom$$($parent$jscomp$11$$, "> [" + $attr$jscomp$1$$ + "]");
}
function $matches$$module$src$dom$$($el$jscomp$8$$, $selector$jscomp$3$$) {
  var $matcher$$ = $el$jscomp$8$$.matches || $el$jscomp$8$$.webkitMatchesSelector || $el$jscomp$8$$.mozMatchesSelector || $el$jscomp$8$$.msMatchesSelector || $el$jscomp$8$$.oMatchesSelector;
  return $matcher$$ ? $matcher$$.call($el$jscomp$8$$, $selector$jscomp$3$$) : !1;
}
function $scopedQuerySelectionFallback$$module$src$dom$$($root$jscomp$8$$, $selector$jscomp$4$$) {
  $root$jscomp$8$$.classList.add("i-amphtml-scoped");
  var $scopedSelector$$ = $selector$jscomp$4$$.replace(/^|,/g, "$&.i-amphtml-scoped "), $elements$$ = $root$jscomp$8$$.querySelectorAll($scopedSelector$$);
  $root$jscomp$8$$.classList.remove("i-amphtml-scoped");
  return $elements$$;
}
function $scopedQuerySelector$$module$src$dom$$($root$jscomp$9$$, $selector$jscomp$5$$) {
  if (void 0 !== $scopeSelectorSupported$$module$src$css$$ ? $scopeSelectorSupported$$module$src$css$$ : $scopeSelectorSupported$$module$src$css$$ = $testScopeSelector$$module$src$css$$($root$jscomp$9$$)) {
    return $root$jscomp$9$$.querySelector($selector$jscomp$5$$.replace(/^|,/g, "$&:scope "));
  }
  var $fallbackResult$$ = $scopedQuerySelectionFallback$$module$src$dom$$($root$jscomp$9$$, $selector$jscomp$5$$);
  return void 0 === $fallbackResult$$[0] ? null : $fallbackResult$$[0];
}
function $iterateCursor$$module$src$dom$$($iterable$jscomp$5$$, $cb$$) {
  for (var $length$jscomp$17$$ = $iterable$jscomp$5$$.length, $i$jscomp$16$$ = 0; $i$jscomp$16$$ < $length$jscomp$17$$; $i$jscomp$16$$++) {
    $cb$$($iterable$jscomp$5$$[$i$jscomp$16$$], $i$jscomp$16$$);
  }
}
function $openWindowDialog$$module$src$dom$$($win$jscomp$19$$, $url$jscomp$24$$, $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$, $opt_features$$) {
  try {
    var $res$jscomp$2$$ = $win$jscomp$19$$.open($url$jscomp$24$$, $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$, $opt_features$$);
  } catch ($e$jscomp$16$$) {
    $dev$$module$src$log$$().error("DOM", "Failed to open url on target: ", $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$, $e$jscomp$16$$);
  }
  if (!($JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$ = $res$jscomp$2$$ || "_top" == $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$)) {
    $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$ = $opt_features$$ || "";
    var $JSCompiler_start$jscomp$inline_264$$;
    "number" !== typeof $JSCompiler_start$jscomp$inline_264$$ && ($JSCompiler_start$jscomp$inline_264$$ = 0);
    $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$ = $JSCompiler_start$jscomp$inline_264$$ + 8 > $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$.length ? !1 : -1 !== $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$.indexOf("noopener", $JSCompiler_start$jscomp$inline_264$$);
  }
  $JSCompiler_string$jscomp$inline_262_JSCompiler_temp$jscomp$116_target$jscomp$92$$ || ($res$jscomp$2$$ = $win$jscomp$19$$.open($url$jscomp$24$$, "_top"));
  return $res$jscomp$2$$;
}
function $tryFocus$$module$src$dom$$($element$jscomp$25$$) {
  try {
    $element$jscomp$25$$.focus();
  } catch ($e$jscomp$17$$) {
  }
}
function $isIframed$$module$src$dom$$($win$jscomp$20$$) {
  return $win$jscomp$20$$.parent && $win$jscomp$20$$.parent != $win$jscomp$20$$;
}
;function $recreateNonProtoObject$$module$src$json$$($obj$jscomp$33$$) {
  var $copy$$ = Object.create(null), $k$jscomp$2$$;
  for ($k$jscomp$2$$ in $obj$jscomp$33$$) {
    if ($hasOwnProperty$$module$src$json$$($obj$jscomp$33$$, $k$jscomp$2$$)) {
      var $v$$ = $obj$jscomp$33$$[$k$jscomp$2$$];
      $copy$$[$k$jscomp$2$$] = $isObject$$module$src$types$$($v$$) ? $recreateNonProtoObject$$module$src$json$$($v$$) : $v$$;
    }
  }
  return $copy$$;
}
function $parseJson$$module$src$json$$($json$$) {
  return JSON.parse($json$$);
}
function $hasOwnProperty$$module$src$json$$($obj$jscomp$35$$, $key$jscomp$43$$) {
  return null == $obj$jscomp$35$$ || "object" != typeof $obj$jscomp$35$$ ? !1 : Object.prototype.hasOwnProperty.call($obj$jscomp$35$$, $key$jscomp$43$$);
}
;function $utf8Encode$$module$src$utils$bytes$$($string$jscomp$8$$) {
  return "undefined" !== typeof TextEncoder ? (new TextEncoder("utf-8")).encode($string$jscomp$8$$) : $stringToBytes$$module$src$utils$bytes$$(unescape(encodeURIComponent($string$jscomp$8$$)));
}
function $stringToBytes$$module$src$utils$bytes$$($str$jscomp$10$$) {
  for (var $bytes$jscomp$4$$ = new Uint8Array($str$jscomp$10$$.length), $i$jscomp$19$$ = 0; $i$jscomp$19$$ < $str$jscomp$10$$.length; $i$jscomp$19$$++) {
    var $charCode$$ = $str$jscomp$10$$.charCodeAt($i$jscomp$19$$);
    $devAssert$$module$src$log$$(255 >= $charCode$$);
    $bytes$jscomp$4$$[$i$jscomp$19$$] = $charCode$$;
  }
  return $bytes$jscomp$4$$;
}
function $bytesToString$$module$src$utils$bytes$$($bytes$jscomp$5$$) {
  for (var $array$jscomp$9$$ = Array($bytes$jscomp$5$$.length), $i$jscomp$20$$ = 0; $i$jscomp$20$$ < $bytes$jscomp$5$$.length; $i$jscomp$20$$++) {
    $array$jscomp$9$$[$i$jscomp$20$$] = String.fromCharCode($bytes$jscomp$5$$[$i$jscomp$20$$]);
  }
  return $array$jscomp$9$$.join("");
}
;var $allowedFetchTypes$$module$src$polyfills$fetch$$ = {document:1, text:2}, $allowedMethods$$module$src$polyfills$fetch$$ = ["GET", "POST"];
function $fetchPolyfill$$module$src$polyfills$fetch$$($input$jscomp$9$$, $init$jscomp$2$$) {
  $init$jscomp$2$$ = void 0 === $init$jscomp$2$$ ? {} : $init$jscomp$2$$;
  return new Promise(function($resolve$jscomp$7$$, $reject$jscomp$3$$) {
    var $requestMethod$$ = $normalizeMethod$$module$src$polyfills$fetch$$($init$jscomp$2$$.method || "GET"), $xhr$$ = $createXhrRequest$$module$src$polyfills$fetch$$($requestMethod$$, $input$jscomp$9$$);
    "include" == $init$jscomp$2$$.credentials && ($xhr$$.withCredentials = !0);
    $init$jscomp$2$$.responseType in $allowedFetchTypes$$module$src$polyfills$fetch$$ && ($xhr$$.responseType = $init$jscomp$2$$.responseType);
    $init$jscomp$2$$.headers && Object.keys($init$jscomp$2$$.headers).forEach(function($input$jscomp$9$$) {
      $xhr$$.setRequestHeader($input$jscomp$9$$, $init$jscomp$2$$.headers[$input$jscomp$9$$]);
    });
    $xhr$$.onreadystatechange = function() {
      2 > $xhr$$.readyState || (100 > $xhr$$.status || 599 < $xhr$$.status ? ($xhr$$.onreadystatechange = null, $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Unknown HTTP status " + $xhr$$.status))) : 4 == $xhr$$.readyState && $resolve$jscomp$7$$(new $FetchResponse$$module$src$polyfills$fetch$$($xhr$$)));
    };
    $xhr$$.onerror = function() {
      $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Network failure"));
    };
    $xhr$$.onabort = function() {
      $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Request aborted"));
    };
    "POST" == $requestMethod$$ ? $xhr$$.send($init$jscomp$2$$.body) : $xhr$$.send();
  });
}
function $createXhrRequest$$module$src$polyfills$fetch$$($method$jscomp$1$$, $url$jscomp$25$$) {
  var $xhr$jscomp$1$$ = new XMLHttpRequest;
  if ("withCredentials" in $xhr$jscomp$1$$) {
    $xhr$jscomp$1$$.open($method$jscomp$1$$, $url$jscomp$25$$, !0);
  } else {
    throw $dev$$module$src$log$$().createExpectedError("CORS is not supported");
  }
  return $xhr$jscomp$1$$;
}
function $FetchResponse$$module$src$polyfills$fetch$$($xhr$jscomp$2$$) {
  this.$xhr_$ = $xhr$jscomp$2$$;
  this.status = this.$xhr_$.status;
  this.statusText = this.$xhr_$.statusText;
  this.ok = 200 <= this.status && 300 > this.status;
  this.headers = new $FetchResponseHeaders$$module$src$polyfills$fetch$$($xhr$jscomp$2$$);
  this.bodyUsed = !1;
  this.body = null;
  this.url = $xhr$jscomp$2$$.responseURL;
}
$FetchResponse$$module$src$polyfills$fetch$$.prototype.clone = function() {
  $devAssert$$module$src$log$$(!this.bodyUsed);
  return new $FetchResponse$$module$src$polyfills$fetch$$(this.$xhr_$);
};
function $JSCompiler_StaticMethods_drainText_$$($JSCompiler_StaticMethods_drainText_$self$$) {
  $devAssert$$module$src$log$$(!$JSCompiler_StaticMethods_drainText_$self$$.bodyUsed);
  $JSCompiler_StaticMethods_drainText_$self$$.bodyUsed = !0;
  return Promise.resolve($JSCompiler_StaticMethods_drainText_$self$$.$xhr_$.responseText);
}
$FetchResponse$$module$src$polyfills$fetch$$.prototype.text = function() {
  return $JSCompiler_StaticMethods_drainText_$$(this);
};
$FetchResponse$$module$src$polyfills$fetch$$.prototype.json = function() {
  return $JSCompiler_StaticMethods_drainText_$$(this).then($parseJson$$module$src$json$$);
};
$FetchResponse$$module$src$polyfills$fetch$$.prototype.arrayBuffer = function() {
  return $JSCompiler_StaticMethods_drainText_$$(this).then($utf8Encode$$module$src$utils$bytes$$);
};
function $normalizeMethod$$module$src$polyfills$fetch$$($method$jscomp$2$$) {
  if (void 0 === $method$jscomp$2$$) {
    return "GET";
  }
  $method$jscomp$2$$ = $method$jscomp$2$$.toUpperCase();
  $devAssert$$module$src$log$$($allowedMethods$$module$src$polyfills$fetch$$.includes($method$jscomp$2$$));
  return $method$jscomp$2$$;
}
function $FetchResponseHeaders$$module$src$polyfills$fetch$$($xhr$jscomp$3$$) {
  this.$xhr_$ = $xhr$jscomp$3$$;
}
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.get = function($name$jscomp$85$$) {
  return this.$xhr_$.getResponseHeader($name$jscomp$85$$);
};
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.has = function($name$jscomp$86$$) {
  return null != this.$xhr_$.getResponseHeader($name$jscomp$86$$);
};
function $Response$$module$src$polyfills$fetch$$($body$jscomp$1_data$jscomp$77$$, $init$jscomp$3$$) {
  $init$jscomp$3$$ = void 0 === $init$jscomp$3$$ ? {} : $init$jscomp$3$$;
  var $lowercasedHeaders$$ = $map$$module$src$utils$object$$();
  $body$jscomp$1_data$jscomp$77$$ = Object.assign({}, {status:200, statusText:"OK", responseText:$body$jscomp$1_data$jscomp$77$$ ? String($body$jscomp$1_data$jscomp$77$$) : "", getResponseHeader:function($body$jscomp$1_data$jscomp$77$$) {
    var $init$jscomp$3$$ = String($body$jscomp$1_data$jscomp$77$$).toLowerCase();
    return $hasOwn_$$module$src$utils$object$$.call($lowercasedHeaders$$, $init$jscomp$3$$) ? $lowercasedHeaders$$[$init$jscomp$3$$] : null;
  }}, $init$jscomp$3$$);
  $body$jscomp$1_data$jscomp$77$$.status = void 0 === $init$jscomp$3$$.status ? 200 : parseInt($init$jscomp$3$$.status, 10);
  if ($isArray$$module$src$types$$($init$jscomp$3$$.headers)) {
    $init$jscomp$3$$.headers.forEach(function($body$jscomp$1_data$jscomp$77$$) {
      var $init$jscomp$3$$ = $body$jscomp$1_data$jscomp$77$$[1];
      $lowercasedHeaders$$[String($body$jscomp$1_data$jscomp$77$$[0]).toLowerCase()] = String($init$jscomp$3$$);
    });
  } else {
    if ($isObject$$module$src$types$$($init$jscomp$3$$.headers)) {
      for (var $key$jscomp$44$$ in $init$jscomp$3$$.headers) {
        $lowercasedHeaders$$[String($key$jscomp$44$$).toLowerCase()] = String($init$jscomp$3$$.headers[$key$jscomp$44$$]);
      }
    }
  }
  $init$jscomp$3$$.statusText && ($body$jscomp$1_data$jscomp$77$$.statusText = String($init$jscomp$3$$.statusText));
  $FetchResponse$$module$src$polyfills$fetch$$.call(this, $body$jscomp$1_data$jscomp$77$$);
}
$$jscomp$inherits$$($Response$$module$src$polyfills$fetch$$, $FetchResponse$$module$src$polyfills$fetch$$);
function $layoutRectLtwh$$module$src$layout_rect$$($left$jscomp$2$$, $top$jscomp$3$$, $width$jscomp$26$$, $height$jscomp$25$$) {
  return {left:$left$jscomp$2$$, top:$top$jscomp$3$$, width:$width$jscomp$26$$, height:$height$jscomp$25$$, bottom:$top$jscomp$3$$ + $height$jscomp$25$$, right:$left$jscomp$2$$ + $width$jscomp$26$$, x:$left$jscomp$2$$, y:$top$jscomp$3$$};
}
function $rectIntersection$$module$src$layout_rect$$($var_args$jscomp$45$$) {
  for (var $x0$jscomp$2$$ = -Infinity, $x1$jscomp$5$$ = Infinity, $y0$jscomp$2$$ = -Infinity, $y1$jscomp$5$$ = Infinity, $i$jscomp$21$$ = 0; $i$jscomp$21$$ < arguments.length; $i$jscomp$21$$++) {
    var $current$jscomp$2$$ = arguments[$i$jscomp$21$$];
    if ($current$jscomp$2$$ && ($x0$jscomp$2$$ = Math.max($x0$jscomp$2$$, $current$jscomp$2$$.left), $x1$jscomp$5$$ = Math.min($x1$jscomp$5$$, $current$jscomp$2$$.left + $current$jscomp$2$$.width), $y0$jscomp$2$$ = Math.max($y0$jscomp$2$$, $current$jscomp$2$$.top), $y1$jscomp$5$$ = Math.min($y1$jscomp$5$$, $current$jscomp$2$$.top + $current$jscomp$2$$.height), $x1$jscomp$5$$ < $x0$jscomp$2$$ || $y1$jscomp$5$$ < $y0$jscomp$2$$)) {
      return null;
    }
  }
  return Infinity == $x1$jscomp$5$$ ? null : $layoutRectLtwh$$module$src$layout_rect$$($x0$jscomp$2$$, $y0$jscomp$2$$, $x1$jscomp$5$$ - $x0$jscomp$2$$, $y1$jscomp$5$$ - $y0$jscomp$2$$);
}
function $expandLayoutRect$$module$src$layout_rect$$($rect$jscomp$1$$, $dw$$, $dh$$) {
  return $layoutRectLtwh$$module$src$layout_rect$$($rect$jscomp$1$$.left - $rect$jscomp$1$$.width * $dw$$, $rect$jscomp$1$$.top - $rect$jscomp$1$$.height * $dh$$, $rect$jscomp$1$$.width * (1 + 2 * $dw$$), $rect$jscomp$1$$.height * (1 + 2 * $dh$$));
}
function $moveLayoutRect$$module$src$layout_rect$$($rect$jscomp$2$$, $dx$jscomp$4$$, $dy$jscomp$4$$) {
  return 0 == $dx$jscomp$4$$ && 0 == $dy$jscomp$4$$ || 0 == $rect$jscomp$2$$.width && 0 == $rect$jscomp$2$$.height ? $rect$jscomp$2$$ : $layoutRectLtwh$$module$src$layout_rect$$($rect$jscomp$2$$.left + $dx$jscomp$4$$, $rect$jscomp$2$$.top + $dy$jscomp$4$$, $rect$jscomp$2$$.width, $rect$jscomp$2$$.height);
}
;var $nativeClientRect$$module$src$get_bounding_client_rect$$;
function $getBoundingClientRect$$module$src$get_bounding_client_rect$$() {
  return $isConnectedNode$$module$src$dom$$(this) ? $nativeClientRect$$module$src$get_bounding_client_rect$$.call(this) : $layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
}
function $shouldInstall$$module$src$get_bounding_client_rect$$() {
  var $win$jscomp$24$$ = $JSCompiler_win$jscomp$inline_322$$;
  if (!$win$jscomp$24$$.document) {
    return !1;
  }
  try {
    return 0 !== $win$jscomp$24$$.document.createElement("div").getBoundingClientRect().top;
  } catch ($e$jscomp$19$$) {
    return !0;
  }
}
;function $LruCache$$module$src$utils$lru_cache$$() {
  this.$capacity_$ = 100;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$45$$) {
  return !!this.$cache_$[$key$jscomp$45$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$46$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$46$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_267_key$jscomp$47$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_267_key$jscomp$47$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_267_key$jscomp$47$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_267_key$jscomp$47$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_268$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_270$$;
    for ($JSCompiler_key$jscomp$inline_270$$ in $JSCompiler_cache$jscomp$inline_267_key$jscomp$47$$) {
      var $JSCompiler_access$jscomp$inline_271$$ = $JSCompiler_cache$jscomp$inline_267_key$jscomp$47$$[$JSCompiler_key$jscomp$inline_270$$].access;
      if ($JSCompiler_access$jscomp$inline_271$$ < $JSCompiler_oldest$jscomp$inline_268$$) {
        $JSCompiler_oldest$jscomp$inline_268$$ = $JSCompiler_access$jscomp$inline_271$$;
        var $JSCompiler_oldestKey$jscomp$inline_269$$ = $JSCompiler_key$jscomp$inline_270$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_269$$ && (delete $JSCompiler_cache$jscomp$inline_267_key$jscomp$47$$[$JSCompiler_oldestKey$jscomp$inline_269$$], this.$size_$--);
  }
};
var $SERVING_TYPE_PREFIX$$module$src$url$$ = $dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0, action:!0}), $a$$module$src$url$$, $cache$$module$src$url$$, $AMP_JS_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_js[^&]*/, $AMP_GSA_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_gsa[^&]*/, $AMP_R_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_r[^&]*/, $AMP_KIT_PARAMS_REGEX$$module$src$url$$ = /[?&]amp_kit[^&]*/, $GOOGLE_EXPERIMENT_PARAMS_REGEX$$module$src$url$$ = /[?&]usqp[^&]*/, $INVALID_PROTOCOLS$$module$src$url$$ = 
["javascript:", "data:", "vbscript:"];
function $parseUrlDeprecated$$module$src$url$$($url$jscomp$26$$, $opt_nocache$$) {
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new $LruCache$$module$src$utils$lru_cache$$));
  return $parseUrlWithA$$module$src$url$$($a$$module$src$url$$, $url$jscomp$26$$, $opt_nocache$$ ? null : $cache$$module$src$url$$);
}
function $parseUrlWithA$$module$src$url$$($a$jscomp$3$$, $url$jscomp$27$$, $opt_cache$$) {
  if ($opt_cache$$ && $opt_cache$$.has($url$jscomp$27$$)) {
    return $opt_cache$$.get($url$jscomp$27$$);
  }
  $a$jscomp$3$$.href = $url$jscomp$27$$;
  $a$jscomp$3$$.protocol || ($a$jscomp$3$$.href = $a$jscomp$3$$.href);
  var $info$$ = {href:$a$jscomp$3$$.href, protocol:$a$jscomp$3$$.protocol, host:$a$jscomp$3$$.host, hostname:$a$jscomp$3$$.hostname, port:"0" == $a$jscomp$3$$.port ? "" : $a$jscomp$3$$.port, pathname:$a$jscomp$3$$.pathname, search:$a$jscomp$3$$.search, hash:$a$jscomp$3$$.hash, origin:null};
  "/" !== $info$$.pathname[0] && ($info$$.pathname = "/" + $info$$.pathname);
  if ("http:" == $info$$.protocol && 80 == $info$$.port || "https:" == $info$$.protocol && 443 == $info$$.port) {
    $info$$.port = "", $info$$.host = $info$$.hostname;
  }
  $info$$.origin = $a$jscomp$3$$.origin && "null" != $a$jscomp$3$$.origin ? $a$jscomp$3$$.origin : "data:" != $info$$.protocol && $info$$.host ? $info$$.protocol + "//" + $info$$.host : $info$$.href;
  var $frozen$$ = $getMode$$module$src$mode$$().test && Object.freeze ? Object.freeze($info$$) : $info$$;
  $opt_cache$$ && $opt_cache$$.put($url$jscomp$27$$, $frozen$$);
  return $frozen$$;
}
function $appendEncodedParamStringToUrl$$module$src$url$$($url$jscomp$28$$, $paramString$$, $opt_addToFront$$) {
  if (!$paramString$$) {
    return $url$jscomp$28$$;
  }
  var $mainAndFragment$$ = $url$jscomp$28$$.split("#", 2), $mainAndQuery$$ = $mainAndFragment$$[0].split("?", 2), $newUrl$$ = $mainAndQuery$$[0] + ($mainAndQuery$$[1] ? $opt_addToFront$$ ? "?" + $paramString$$ + "&" + $mainAndQuery$$[1] : "?" + $mainAndQuery$$[1] + "&" + $paramString$$ : "?" + $paramString$$);
  return $newUrl$$ += $mainAndFragment$$[1] ? "#" + $mainAndFragment$$[1] : "";
}
function $addParamsToUrl$$module$src$url$$($url$jscomp$30$$, $params$jscomp$3$$) {
  return $appendEncodedParamStringToUrl$$module$src$url$$($url$jscomp$30$$, $serializeQueryString$$module$src$url$$($params$jscomp$3$$));
}
function $serializeQueryString$$module$src$url$$($params$jscomp$5$$) {
  var $s$jscomp$9$$ = [], $k$jscomp$4$$;
  for ($k$jscomp$4$$ in $params$jscomp$5$$) {
    var $sv$12_v$jscomp$1$$ = $params$jscomp$5$$[$k$jscomp$4$$];
    if (null != $sv$12_v$jscomp$1$$) {
      if ($isArray$$module$src$types$$($sv$12_v$jscomp$1$$)) {
        for (var $i$jscomp$23$$ = 0; $i$jscomp$23$$ < $sv$12_v$jscomp$1$$.length; $i$jscomp$23$$++) {
          var $sv$$ = $sv$12_v$jscomp$1$$[$i$jscomp$23$$];
          $s$jscomp$9$$.push(encodeURIComponent($k$jscomp$4$$) + "=" + encodeURIComponent($sv$$));
        }
      } else {
        $s$jscomp$9$$.push(encodeURIComponent($k$jscomp$4$$) + "=" + encodeURIComponent($sv$12_v$jscomp$1$$));
      }
    }
  }
  return $s$jscomp$9$$.join("&");
}
function $isSecureUrlDeprecated$$module$src$url$$($url$jscomp$32$$) {
  "string" == typeof $url$jscomp$32$$ && ($url$jscomp$32$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$32$$));
  return "https:" == $url$jscomp$32$$.protocol || "localhost" == $url$jscomp$32$$.hostname || "127.0.0.1" == $url$jscomp$32$$.hostname || $endsWith$$module$src$string$$($url$jscomp$32$$.hostname, ".localhost");
}
function $assertHttpsUrl$$module$src$url$$($urlString$jscomp$1$$, $elementContext$$, $sourceName$$) {
  $sourceName$$ = void 0 === $sourceName$$ ? "source" : $sourceName$$;
  $userAssert$$module$src$log$$(null != $urlString$jscomp$1$$, "%s %s must be available", $elementContext$$, $sourceName$$);
  $userAssert$$module$src$log$$($isSecureUrlDeprecated$$module$src$url$$($urlString$jscomp$1$$) || /^(\/\/)/.test($urlString$jscomp$1$$), '%s %s must start with "https://" or "//" or be relative and served from either https or from localhost. Invalid value: %s', $elementContext$$, $sourceName$$, $urlString$jscomp$1$$);
  return $urlString$jscomp$1$$;
}
function $removeFragment$$module$src$url$$($url$jscomp$33$$) {
  var $index$jscomp$75$$ = $url$jscomp$33$$.indexOf("#");
  return -1 == $index$jscomp$75$$ ? $url$jscomp$33$$ : $url$jscomp$33$$.substring(0, $index$jscomp$75$$);
}
function $isProxyOrigin$$module$src$url$$($url$jscomp$35$$) {
  "string" == typeof $url$jscomp$35$$ && ($url$jscomp$35$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$35$$));
  return $urls$$module$src$config$$.cdnProxyRegex.test($url$jscomp$35$$.origin);
}
function $isProtocolValid$$module$src$url$$($url$jscomp$38$$) {
  if (!$url$jscomp$38$$) {
    return !0;
  }
  "string" == typeof $url$jscomp$38$$ && ($url$jscomp$38$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$38$$));
  return !$INVALID_PROTOCOLS$$module$src$url$$.includes($url$jscomp$38$$.protocol);
}
function $removeAmpJsParamsFromUrl$$module$src$url$$($url$jscomp$39$$) {
  var $parsed$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$39$$), $search$$ = $removeAmpJsParamsFromSearch$$module$src$url$$($parsed$$.search);
  return $parsed$$.origin + $parsed$$.pathname + $search$$ + $parsed$$.hash;
}
function $removeAmpJsParamsFromSearch$$module$src$url$$($urlSearch$$) {
  if (!$urlSearch$$ || "?" == $urlSearch$$) {
    return "";
  }
  var $search$jscomp$1$$ = $urlSearch$$.replace($AMP_JS_PARAMS_REGEX$$module$src$url$$, "").replace($AMP_GSA_PARAMS_REGEX$$module$src$url$$, "").replace($AMP_R_PARAMS_REGEX$$module$src$url$$, "").replace($AMP_KIT_PARAMS_REGEX$$module$src$url$$, "").replace($GOOGLE_EXPERIMENT_PARAMS_REGEX$$module$src$url$$, "").replace(/^[?&]/, "");
  return $search$jscomp$1$$ ? "?" + $search$jscomp$1$$ : "";
}
function $getSourceUrl$$module$src$url$$($url$jscomp$41$$) {
  "string" == typeof $url$jscomp$41$$ && ($url$jscomp$41$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$41$$));
  if (!$isProxyOrigin$$module$src$url$$($url$jscomp$41$$)) {
    return $url$jscomp$41$$.href;
  }
  var $path$jscomp$6$$ = $url$jscomp$41$$.pathname.split("/");
  $userAssert$$module$src$log$$($SERVING_TYPE_PREFIX$$module$src$url$$[$path$jscomp$6$$[1]], "Unknown path prefix in url %s", $url$jscomp$41$$.href);
  var $domainOrHttpsSignal$$ = $path$jscomp$6$$[2], $origin$jscomp$1$$ = "s" == $domainOrHttpsSignal$$ ? "https://" + decodeURIComponent($path$jscomp$6$$[3]) : "http://" + decodeURIComponent($domainOrHttpsSignal$$);
  $userAssert$$module$src$log$$(0 < $origin$jscomp$1$$.indexOf("."), "Expected a . in origin %s", $origin$jscomp$1$$);
  $path$jscomp$6$$.splice(1, "s" == $domainOrHttpsSignal$$ ? 3 : 2);
  return $origin$jscomp$1$$ + $path$jscomp$6$$.join("/") + $removeAmpJsParamsFromSearch$$module$src$url$$($url$jscomp$41$$.search) + ($url$jscomp$41$$.hash || "");
}
function $getSourceOrigin$$module$src$url$$($url$jscomp$42$$) {
  return $parseUrlDeprecated$$module$src$url$$($getSourceUrl$$module$src$url$$($url$jscomp$42$$)).origin;
}
function $getCorsUrl$$module$src$url$$($JSCompiler_field$jscomp$inline_277_win$jscomp$27$$, $url$jscomp$43$$) {
  $checkCorsUrl$$module$src$url$$($url$jscomp$43$$);
  var $sourceOrigin$$ = $getSourceOrigin$$module$src$url$$($JSCompiler_field$jscomp$inline_277_win$jscomp$27$$.location.href);
  $JSCompiler_field$jscomp$inline_277_win$jscomp$27$$ = encodeURIComponent("__amp_source_origin") + "=" + encodeURIComponent($sourceOrigin$$);
  return $appendEncodedParamStringToUrl$$module$src$url$$($url$jscomp$43$$, $JSCompiler_field$jscomp$inline_277_win$jscomp$27$$, void 0);
}
function $checkCorsUrl$$module$src$url$$($url$jscomp$44$$) {
  var $parsedUrl$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$44$$), $query$jscomp$14$$ = $parseQueryString_$$module$src$url_parse_query_string$$($parsedUrl$$.search);
  $userAssert$$module$src$log$$(!("__amp_source_origin" in $query$jscomp$14$$), "Source origin is not allowed in %s", $url$jscomp$44$$);
}
;function $isExperimentOn$$module$src$experiments$$($win$jscomp$30$$, $experimentId$$) {
  return !!$experimentToggles$$module$src$experiments$$($win$jscomp$30$$)[$experimentId$$];
}
function $toggleExperiment$$module$src$experiments$$($win$jscomp$31$$, $experimentId$jscomp$1$$, $opt_on$$, $opt_transientExperiment$$) {
  var $currentlyOn$$ = $isExperimentOn$$module$src$experiments$$($win$jscomp$31$$, $experimentId$jscomp$1$$), $on$$ = !(void 0 !== $opt_on$$ ? !$opt_on$$ : $currentlyOn$$);
  if ($on$$ != $currentlyOn$$ && ($experimentToggles$$module$src$experiments$$($win$jscomp$31$$)[$experimentId$jscomp$1$$] = $on$$, !$opt_transientExperiment$$)) {
    var $storedToggles$$ = $getExperimentToggles$$module$src$experiments$$($win$jscomp$31$$);
    $storedToggles$$[$experimentId$jscomp$1$$] = $on$$;
    var $JSCompiler_experimentIds$jscomp$inline_281$$ = [], $JSCompiler_experiment$jscomp$inline_282$$;
    for ($JSCompiler_experiment$jscomp$inline_282$$ in $storedToggles$$) {
      $JSCompiler_experimentIds$jscomp$inline_281$$.push((!1 === $storedToggles$$[$JSCompiler_experiment$jscomp$inline_282$$] ? "-" : "") + $JSCompiler_experiment$jscomp$inline_282$$);
    }
    try {
      "localStorage" in $win$jscomp$31$$ && $win$jscomp$31$$.localStorage.setItem("amp-experiment-toggles", $JSCompiler_experimentIds$jscomp$inline_281$$.join(","));
    } catch ($JSCompiler_e$jscomp$inline_283$$) {
      $user$$module$src$log$$().error("EXPERIMENTS", "Failed to save experiments to localStorage.");
    }
    $getMode$$module$src$mode$$().test || $user$$module$src$log$$().warn("EXPERIMENTS", '"%s" experiment %s for the domain "%s". See: https://amp.dev/documentation/guides-and-tutorials/learn/experimental', $experimentId$jscomp$1$$, $on$$ ? "enabled" : "disabled", $win$jscomp$31$$.location.hostname);
  }
  return $on$$;
}
function $experimentToggles$$module$src$experiments$$($params$jscomp$6_win$jscomp$32$$) {
  if ($params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES) {
    return $params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES;
  }
  $params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
  var $toggles$jscomp$2$$ = $params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES;
  if ($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG) {
    for (var $allowed$13_experimentId$jscomp$2_i$jscomp$24$$ in $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG) {
      var $frequency$$ = $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG[$allowed$13_experimentId$jscomp$2_i$jscomp$24$$];
      "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$13_experimentId$jscomp$2_i$jscomp$24$$] = Math.random() < $frequency$$);
    }
  }
  if ($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-doc-opt-in"].length) {
    var $allowed$$ = $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $params$jscomp$6_win$jscomp$32$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
    if ($meta$$) {
      var $optedInExperiments$$ = $meta$$.getAttribute("content").split(",");
      for ($allowed$13_experimentId$jscomp$2_i$jscomp$24$$ = 0; $allowed$13_experimentId$jscomp$2_i$jscomp$24$$ < $optedInExperiments$$.length; $allowed$13_experimentId$jscomp$2_i$jscomp$24$$++) {
        -1 != $allowed$$.indexOf($optedInExperiments$$[$allowed$13_experimentId$jscomp$2_i$jscomp$24$$]) && ($toggles$jscomp$2$$[$optedInExperiments$$[$allowed$13_experimentId$jscomp$2_i$jscomp$24$$]] = !0);
      }
    }
  }
  Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($params$jscomp$6_win$jscomp$32$$));
  if ($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-url-opt-in"].length) {
    $allowed$13_experimentId$jscomp$2_i$jscomp$24$$ = $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-url-opt-in"];
    $params$jscomp$6_win$jscomp$32$$ = $parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$6_win$jscomp$32$$.location.originalHash || $params$jscomp$6_win$jscomp$32$$.location.hash);
    for (var $i$14$$ = 0; $i$14$$ < $allowed$13_experimentId$jscomp$2_i$jscomp$24$$.length; $i$14$$++) {
      var $param$jscomp$7$$ = $params$jscomp$6_win$jscomp$32$$["e-" + $allowed$13_experimentId$jscomp$2_i$jscomp$24$$[$i$14$$]];
      "1" == $param$jscomp$7$$ && ($toggles$jscomp$2$$[$allowed$13_experimentId$jscomp$2_i$jscomp$24$$[$i$14$$]] = !0);
      "0" == $param$jscomp$7$$ && ($toggles$jscomp$2$$[$allowed$13_experimentId$jscomp$2_i$jscomp$24$$[$i$14$$]] = !1);
    }
  }
  return $toggles$jscomp$2$$;
}
function $getExperimentToggles$$module$src$experiments$$($toggles$jscomp$3_win$jscomp$34$$) {
  var $experimentsString$$ = "";
  try {
    "localStorage" in $toggles$jscomp$3_win$jscomp$34$$ && ($experimentsString$$ = $toggles$jscomp$3_win$jscomp$34$$.localStorage.getItem("amp-experiment-toggles"));
  } catch ($e$jscomp$20$$) {
    $dev$$module$src$log$$().warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
  }
  var $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
  $toggles$jscomp$3_win$jscomp$34$$ = Object.create(null);
  for (var $i$jscomp$25$$ = 0; $i$jscomp$25$$ < $tokens$$.length; $i$jscomp$25$$++) {
    0 != $tokens$$[$i$jscomp$25$$].length && ("-" == $tokens$$[$i$jscomp$25$$][0] ? $toggles$jscomp$3_win$jscomp$34$$[$tokens$$[$i$jscomp$25$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$34$$[$tokens$$[$i$jscomp$25$$]] = !0);
  }
  return $toggles$jscomp$3_win$jscomp$34$$;
}
;var $$jscomp$compprop0$$ = {}, $EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$ = ($$jscomp$compprop0$$["ampdoc-fie"] = {isTrafficEligible:function() {
  return !0;
}, branches:[["21065001"], ["21065002"]]}, $$jscomp$compprop0$$);
function $isInAmpdocFieExperiment$$module$src$ampdoc_fie$$($win$jscomp$42$$) {
  if (!$isExperimentOn$$module$src$experiments$$($win$jscomp$42$$, "ampdoc-fie")) {
    return !1;
  }
  $win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES = $win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES || {};
  for (var $JSCompiler_experimentName$jscomp$inline_288$$ in $EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$) {
    if ($hasOwn_$$module$src$utils$object$$.call($EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$, $JSCompiler_experimentName$jscomp$inline_288$$) && !$hasOwn_$$module$src$utils$object$$.call($win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES, $JSCompiler_experimentName$jscomp$inline_288$$)) {
      if (!$EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$[$JSCompiler_experimentName$jscomp$inline_288$$].isTrafficEligible || !$EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$[$JSCompiler_experimentName$jscomp$inline_288$$].isTrafficEligible($win$jscomp$42$$)) {
        $win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_288$$] = null;
      } else {
        if (!$win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_288$$] && $isExperimentOn$$module$src$experiments$$($win$jscomp$42$$, $JSCompiler_experimentName$jscomp$inline_288$$)) {
          var $JSCompiler_arr$jscomp$inline_867$$ = $EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$[$JSCompiler_experimentName$jscomp$inline_288$$].branches;
          $win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES[$JSCompiler_experimentName$jscomp$inline_288$$] = $JSCompiler_arr$jscomp$inline_867$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_867$$.length)] || null;
        }
      }
    }
  }
  return "21065002" === ($win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES ? $win$jscomp$42$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
}
;function $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$, $JSCompiler_temp$jscomp$142_id$jscomp$8$$) {
  var $win$jscomp$43$$ = $JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$.ownerDocument.defaultView, $topWin$$ = $getTopWindow$$module$src$service$$($win$jscomp$43$$), $isEmbed$$ = $win$jscomp$43$$ != $topWin$$, $ampdocFieExperimentOn$$ = $isInAmpdocFieExperiment$$module$src$ampdoc_fie$$($topWin$$);
  $isEmbed$$ && !$ampdocFieExperimentOn$$ ? $JSCompiler_temp$jscomp$142_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($win$jscomp$43$$, $JSCompiler_temp$jscomp$142_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($win$jscomp$43$$, $JSCompiler_temp$jscomp$142_id$jscomp$8$$) : null : ($JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$), 
  $JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$ = $getAmpdocServiceHolder$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$), $JSCompiler_temp$jscomp$142_id$jscomp$8$$ = $isServiceRegistered$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$, $JSCompiler_temp$jscomp$142_id$jscomp$8$$) ? $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_295_JSCompiler_holder$jscomp$inline_296_element$jscomp$36$$, 
  $JSCompiler_temp$jscomp$142_id$jscomp$8$$) : null);
  return $JSCompiler_temp$jscomp$142_id$jscomp$8$$;
}
function $installServiceInEmbedScope$$module$src$service$$($embedWin$$, $id$jscomp$9$$, $service$$) {
  var $topWin$jscomp$1$$ = $getTopWindow$$module$src$service$$($embedWin$$);
  $devAssert$$module$src$log$$($embedWin$$ != $topWin$jscomp$1$$);
  $devAssert$$module$src$log$$(!$isServiceRegistered$$module$src$service$$($embedWin$$, $id$jscomp$9$$));
  if ($isInAmpdocFieExperiment$$module$src$ampdoc_fie$$($topWin$jscomp$1$$)) {
    var $ampdoc$$ = $getAmpdoc$$module$src$service$$($embedWin$$.document);
    $registerServiceInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($ampdoc$$), $ampdoc$$, $id$jscomp$9$$, function() {
      return $service$$;
    }, !0);
  } else {
    $registerServiceInternal$$module$src$service$$($embedWin$$, $embedWin$$, $id$jscomp$9$$, function() {
      return $service$$;
    }), $getServiceInternal$$module$src$service$$($embedWin$$, $id$jscomp$9$$);
  }
}
function $registerServiceBuilder$$module$src$service$$($win$jscomp$44$$, $id$jscomp$10$$, $constructor$jscomp$2$$) {
  $win$jscomp$44$$ = $getTopWindow$$module$src$service$$($win$jscomp$44$$);
  $registerServiceInternal$$module$src$service$$($win$jscomp$44$$, $win$jscomp$44$$, $id$jscomp$10$$, $constructor$jscomp$2$$);
}
function $registerServiceBuilderForDoc$$module$src$service$$($nodeOrDoc$$, $id$jscomp$11$$, $constructor$jscomp$3$$, $opt_instantiate$jscomp$1$$) {
  var $ampdoc$jscomp$1$$ = $getAmpdoc$$module$src$service$$($nodeOrDoc$$), $holder$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$1$$);
  $registerServiceInternal$$module$src$service$$($holder$$, $ampdoc$jscomp$1$$, $id$jscomp$11$$, $constructor$jscomp$3$$);
  $opt_instantiate$jscomp$1$$ && $getServiceInternal$$module$src$service$$($holder$$, $id$jscomp$11$$);
}
function $getService$$module$src$service$$($win$jscomp$45$$, $id$jscomp$13$$) {
  $win$jscomp$45$$ = $getTopWindow$$module$src$service$$($win$jscomp$45$$);
  return $getServiceInternal$$module$src$service$$($win$jscomp$45$$, $id$jscomp$13$$);
}
function $getExistingServiceOrNull$$module$src$service$$($win$jscomp$47$$) {
  $win$jscomp$47$$ = $getTopWindow$$module$src$service$$($win$jscomp$47$$);
  return $isServiceRegistered$$module$src$service$$($win$jscomp$47$$, "performance") ? $getServiceInternal$$module$src$service$$($win$jscomp$47$$, "performance") : null;
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$, $id$jscomp$17$$) {
  var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
  return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, $id$jscomp$17$$);
}
function $getServicePromiseOrNullForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$2$$, $id$jscomp$20$$) {
  return $getServicePromiseOrNullInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($elementOrAmpDoc$jscomp$2$$), $id$jscomp$20$$);
}
function $getTopWindow$$module$src$service$$($win$jscomp$51$$) {
  return $win$jscomp$51$$.__AMP_TOP || ($win$jscomp$51$$.__AMP_TOP = $win$jscomp$51$$);
}
function $getParentWindowFrameElement$$module$src$service$$($node$jscomp$14_topWin$jscomp$2$$, $opt_topWin$$) {
  var $childWin$$ = ($node$jscomp$14_topWin$jscomp$2$$.ownerDocument || $node$jscomp$14_topWin$jscomp$2$$).defaultView;
  $node$jscomp$14_topWin$jscomp$2$$ = $opt_topWin$$ || $getTopWindow$$module$src$service$$($childWin$$);
  if ($childWin$$ && $childWin$$ != $node$jscomp$14_topWin$jscomp$2$$ && $getTopWindow$$module$src$service$$($childWin$$) == $node$jscomp$14_topWin$jscomp$2$$) {
    try {
      return $childWin$$.frameElement;
    } catch ($e$jscomp$22$$) {
    }
  }
  return null;
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$2$$) {
  return $nodeOrDoc$jscomp$2$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$2$$.ownerDocument || $nodeOrDoc$jscomp$2$$).defaultView, "ampdoc").getAmpDoc($nodeOrDoc$jscomp$2$$) : $nodeOrDoc$jscomp$2$$;
}
function $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$) {
  $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$);
  return $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.isSingleDoc() ? $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.win : $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$4_s$jscomp$10$$, $id$jscomp$21$$) {
  $devAssert$$module$src$log$$($isServiceRegistered$$module$src$service$$($holder$jscomp$4_s$jscomp$10$$, $id$jscomp$21$$));
  $holder$jscomp$4_s$jscomp$10$$ = $getServices$$module$src$service$$($holder$jscomp$4_s$jscomp$10$$)[$id$jscomp$21$$];
  $holder$jscomp$4_s$jscomp$10$$.obj || ($devAssert$$module$src$log$$($holder$jscomp$4_s$jscomp$10$$.ctor), $devAssert$$module$src$log$$($holder$jscomp$4_s$jscomp$10$$.context), $holder$jscomp$4_s$jscomp$10$$.obj = new $holder$jscomp$4_s$jscomp$10$$.ctor($holder$jscomp$4_s$jscomp$10$$.context), $devAssert$$module$src$log$$($holder$jscomp$4_s$jscomp$10$$.obj), $holder$jscomp$4_s$jscomp$10$$.ctor = null, $holder$jscomp$4_s$jscomp$10$$.context = null, $holder$jscomp$4_s$jscomp$10$$.resolve && $holder$jscomp$4_s$jscomp$10$$.resolve($holder$jscomp$4_s$jscomp$10$$.obj));
  return $holder$jscomp$4_s$jscomp$10$$.obj;
}
function $registerServiceInternal$$module$src$service$$($holder$jscomp$5$$, $context$jscomp$1$$, $id$jscomp$22$$, $ctor$jscomp$7$$, $opt_override$$) {
  var $services$jscomp$1$$ = $getServices$$module$src$service$$($holder$jscomp$5$$), $s$jscomp$11$$ = $services$jscomp$1$$[$id$jscomp$22$$];
  $s$jscomp$11$$ || ($s$jscomp$11$$ = $services$jscomp$1$$[$id$jscomp$22$$] = {obj:null, promise:null, resolve:null, reject:null, context:null, ctor:null});
  if ($opt_override$$ || !$s$jscomp$11$$.ctor && !$s$jscomp$11$$.obj) {
    $s$jscomp$11$$.ctor = $ctor$jscomp$7$$, $s$jscomp$11$$.context = $context$jscomp$1$$, $s$jscomp$11$$.resolve && $getServiceInternal$$module$src$service$$($holder$jscomp$5$$, $id$jscomp$22$$);
  }
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
  var $s$jscomp$13$$ = $getServices$$module$src$service$$($holder$jscomp$8$$)[$id$jscomp$25$$];
  if ($s$jscomp$13$$) {
    if ($s$jscomp$13$$.promise) {
      return $s$jscomp$13$$.promise;
    }
    $getServiceInternal$$module$src$service$$($holder$jscomp$8$$, $id$jscomp$25$$);
    return $s$jscomp$13$$.promise = Promise.resolve($s$jscomp$13$$.obj);
  }
  return null;
}
function $getServices$$module$src$service$$($holder$jscomp$9$$) {
  var $services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES;
  $services$jscomp$5$$ || ($services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES = {});
  return $services$jscomp$5$$;
}
function $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$8$$, $id$jscomp$28$$) {
  var $service$jscomp$4$$ = $getServiceInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($devAssert$$module$src$log$$($ampdoc$jscomp$8$$.getParent())), $id$jscomp$28$$);
  $registerServiceInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$8$$), $ampdoc$jscomp$8$$, $id$jscomp$28$$, function() {
    return $service$jscomp$4$$;
  });
}
function $isServiceRegistered$$module$src$service$$($holder$jscomp$12_service$jscomp$5$$, $id$jscomp$30$$) {
  $holder$jscomp$12_service$jscomp$5$$ = $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES && $holder$jscomp$12_service$jscomp$5$$.__AMP_SERVICES[$id$jscomp$30$$];
  return !(!$holder$jscomp$12_service$jscomp$5$$ || !$holder$jscomp$12_service$jscomp$5$$.ctor && !$holder$jscomp$12_service$jscomp$5$$.obj);
}
function $emptyServiceHolderWithPromise$$module$src$service$$() {
  var $$jscomp$destructuring$var28_reject$jscomp$4$$ = new $Deferred$$module$src$utils$promise$$, $promise$jscomp$2$$ = $$jscomp$destructuring$var28_reject$jscomp$4$$.promise, $resolve$jscomp$8$$ = $$jscomp$destructuring$var28_reject$jscomp$4$$.resolve;
  $$jscomp$destructuring$var28_reject$jscomp$4$$ = $$jscomp$destructuring$var28_reject$jscomp$4$$.reject;
  $promise$jscomp$2$$.catch(function() {
  });
  return {obj:null, promise:$promise$jscomp$2$$, resolve:$resolve$jscomp$8$$, reject:$$jscomp$destructuring$var28_reject$jscomp$4$$, context:null, ctor:null};
}
;function $getElementServiceIfAvailable$$module$src$element_service$$($win$jscomp$55$$) {
  var $s$jscomp$14$$ = $getServicePromiseOrNullInternal$$module$src$service$$($win$jscomp$55$$, "share-tracking");
  return $s$jscomp$14$$ ? $s$jscomp$14$$ : $getElementServicePromiseOrNull$$module$src$element_service$$($win$jscomp$55$$, "share-tracking", "amp-share-tracking", !0);
}
function $getElementServiceForDoc$$module$src$element_service$$($element$jscomp$38$$, $id$jscomp$33$$, $extension$jscomp$2$$) {
  return $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$38$$, $id$jscomp$33$$, $extension$jscomp$2$$, void 0).then(function($element$jscomp$38$$) {
    return $userAssert$$module$src$log$$($element$jscomp$38$$, "Service %s was requested to be provided through %s, but %s is not loaded in the current page. To fix this problem load the JavaScript file for %s in this page.", $id$jscomp$33$$, $extension$jscomp$2$$, $extension$jscomp$2$$, $extension$jscomp$2$$);
  });
}
function $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$39$$, $id$jscomp$34$$, $extension$jscomp$3$$, $opt_element$jscomp$10$$) {
  var $s$jscomp$15$$ = $getServicePromiseOrNullForDoc$$module$src$service$$($element$jscomp$39$$, $id$jscomp$34$$);
  if ($s$jscomp$15$$) {
    return $s$jscomp$15$$;
  }
  var $ampdoc$jscomp$9$$ = $getAmpdoc$$module$src$service$$($element$jscomp$39$$);
  return $ampdoc$jscomp$9$$.waitForBodyOpen().then(function() {
    return $waitForExtensionIfPresent$$module$src$element_service$$($ampdoc$jscomp$9$$.win, $extension$jscomp$3$$, $ampdoc$jscomp$9$$.win.document.head);
  }).then(function() {
    if ($opt_element$jscomp$10$$) {
      var $s$jscomp$15$$ = $getServicePromiseOrNullForDoc$$module$src$service$$($element$jscomp$39$$, $id$jscomp$34$$);
    } else {
      $s$jscomp$15$$ = $ampdoc$jscomp$9$$.win, $s$jscomp$15$$ = $s$jscomp$15$$.__AMP_EXTENDED_ELEMENTS && $s$jscomp$15$$.__AMP_EXTENDED_ELEMENTS[$extension$jscomp$3$$] ? $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($element$jscomp$39$$), $id$jscomp$34$$) : null;
    }
    return $s$jscomp$15$$;
  });
}
function $getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($element$jscomp$40$$) {
  var $s$jscomp$16_win$jscomp$57$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($element$jscomp$40$$, "bind");
  if ($s$jscomp$16_win$jscomp$57$$) {
    return Promise.resolve($s$jscomp$16_win$jscomp$57$$);
  }
  $s$jscomp$16_win$jscomp$57$$ = $element$jscomp$40$$.ownerDocument.defaultView;
  var $topWin$jscomp$3$$ = $getTopWindow$$module$src$service$$($s$jscomp$16_win$jscomp$57$$);
  return $s$jscomp$16_win$jscomp$57$$ !== $topWin$jscomp$3$$ ? $getElementServicePromiseOrNull$$module$src$element_service$$($s$jscomp$16_win$jscomp$57$$, "bind", "amp-bind") : $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$40$$, "bind", "amp-bind");
}
function $extensionScriptsInNode$$module$src$element_service$$($head$$) {
  if (!$head$$) {
    return [];
  }
  for (var $scripts$jscomp$1$$ = {}, $list$$ = $head$$.querySelectorAll("script[custom-element],script[custom-template]"), $i$jscomp$26$$ = 0; $i$jscomp$26$$ < $list$$.length; $i$jscomp$26$$++) {
    var $name$jscomp$88_script$jscomp$1$$ = $list$$[$i$jscomp$26$$];
    $name$jscomp$88_script$jscomp$1$$ = $name$jscomp$88_script$jscomp$1$$.getAttribute("custom-element") || $name$jscomp$88_script$jscomp$1$$.getAttribute("custom-template");
    $scripts$jscomp$1$$[$name$jscomp$88_script$jscomp$1$$] = !0;
  }
  return Object.keys($scripts$jscomp$1$$);
}
function $isExtensionScriptInNode$$module$src$element_service$$($ampdoc$jscomp$10$$) {
  return $ampdoc$jscomp$10$$.waitForBodyOpen().then(function() {
    var $JSCompiler_head$jscomp$inline_301$$ = $ampdoc$jscomp$10$$.getHeadNode();
    return $extensionScriptsInNode$$module$src$element_service$$($JSCompiler_head$jscomp$inline_301$$).includes("amp-form");
  });
}
function $waitForExtensionIfPresent$$module$src$element_service$$($win$jscomp$58$$, $extension$jscomp$6$$, $head$jscomp$2$$) {
  return $extensionScriptsInNode$$module$src$element_service$$($head$jscomp$2$$).includes($extension$jscomp$6$$) ? $getService$$module$src$service$$($win$jscomp$58$$, "extensions").waitForExtension($win$jscomp$58$$, $extension$jscomp$6$$) : $resolvedPromise$$module$src$resolved_promise$$();
}
function $getElementServicePromiseOrNull$$module$src$element_service$$($win$jscomp$59$$, $id$jscomp$37$$, $extension$jscomp$7$$, $opt_element$jscomp$11$$) {
  return $waitForBodyOpenPromise$$module$src$dom$$($win$jscomp$59$$.document).then(function() {
    return $waitForExtensionIfPresent$$module$src$element_service$$($win$jscomp$59$$, $extension$jscomp$7$$, $win$jscomp$59$$.document.head);
  }).then(function() {
    return $opt_element$jscomp$11$$ ? $getServicePromiseOrNullInternal$$module$src$service$$($win$jscomp$59$$, $id$jscomp$37$$) : $win$jscomp$59$$.__AMP_EXTENDED_ELEMENTS && $win$jscomp$59$$.__AMP_EXTENDED_ELEMENTS[$extension$jscomp$7$$] ? $getServicePromiseInternal$$module$src$service$$($win$jscomp$59$$, $id$jscomp$37$$) : null;
  });
}
;function $Services$$module$src$services$ampdocServiceFor$$($window$jscomp$1$$) {
  return $getService$$module$src$service$$($window$jscomp$1$$, "ampdoc");
}
function $Services$$module$src$services$documentInfoForDoc$$($elementOrAmpDoc$jscomp$5$$) {
  return $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$5$$, "documentInfo").get();
}
function $Services$$module$src$services$extensionsFor$$($window$jscomp$4$$) {
  return $getService$$module$src$service$$($window$jscomp$4$$, "extensions");
}
function $Services$$module$src$services$mutatorForDoc$$($elementOrAmpDoc$jscomp$9$$) {
  return $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$9$$, "mutator");
}
function $Services$$module$src$services$platformFor$$($window$jscomp$7$$) {
  return $getService$$module$src$service$$($window$jscomp$7$$, "platform");
}
function $Services$$module$src$services$resourcesForDoc$$($elementOrAmpDoc$jscomp$11$$) {
  return $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$11$$, "resources");
}
function $Services$$module$src$services$timerFor$$($window$jscomp$10$$) {
  return $getService$$module$src$service$$($window$jscomp$10$$, "timer");
}
function $Services$$module$src$services$viewerForDoc$$($elementOrAmpDoc$jscomp$15$$) {
  return $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$15$$, "viewer");
}
function $Services$$module$src$services$vsyncFor$$($window$jscomp$11$$) {
  return $getService$$module$src$service$$($window$jscomp$11$$, "vsync");
}
function $Services$$module$src$services$viewportForDoc$$($elementOrAmpDoc$jscomp$17$$) {
  return $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$17$$, "viewport");
}
;function $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$($callback$jscomp$59_root$jscomp$11$$, $options$jscomp$33$$) {
  this.$callback_$ = $callback$jscomp$59_root$jscomp$11$$;
  this.$options_$ = Object.assign({}, {root:null, rootMargin:"0px 0px 0px 0px"}, $options$jscomp$33$$);
  if (($callback$jscomp$59_root$jscomp$11$$ = this.$options_$.root) && 1 !== $callback$jscomp$59_root$jscomp$11$$.nodeType) {
    throw Error("root must be an Element");
  }
  this.$elements_$ = [];
  this.$inst_$ = null;
  $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$._upgraders.push(this.$upgrade_$.bind(this));
}
$JSCompiler_prototypeAlias$$ = $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$.prototype;
$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$inst_$ ? this.$inst_$.disconnect() : this.$elements_$.length = 0;
};
$JSCompiler_prototypeAlias$$.takeRecords = function() {
  return this.$inst_$ ? this.$inst_$.takeRecords() : [];
};
$JSCompiler_prototypeAlias$$.observe = function($target$jscomp$93$$) {
  this.$inst_$ ? this.$inst_$.observe($target$jscomp$93$$) : -1 == this.$elements_$.indexOf($target$jscomp$93$$) && this.$elements_$.push($target$jscomp$93$$);
};
$JSCompiler_prototypeAlias$$.unobserve = function($index$jscomp$78_target$jscomp$94$$) {
  this.$inst_$ ? this.$inst_$.unobserve($index$jscomp$78_target$jscomp$94$$) : ($index$jscomp$78_target$jscomp$94$$ = this.$elements_$.indexOf($index$jscomp$78_target$jscomp$94$$), -1 != $index$jscomp$78_target$jscomp$94$$ && this.$elements_$.splice($index$jscomp$78_target$jscomp$94$$, 1));
};
$JSCompiler_prototypeAlias$$.$upgrade_$ = function($constr$$) {
  var $inst$$ = new $constr$$(this.$callback_$, this.$options_$);
  this.$inst_$ = $inst$$;
  this.$elements_$.forEach(function($constr$$) {
    return $inst$$.observe($constr$$);
  });
  this.$elements_$ = null;
};
$$jscomp$global$$.Object.defineProperties($IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$.prototype, {root:{configurable:!0, enumerable:!0, get:function() {
  return this.$inst_$ ? this.$inst_$.root : this.$options_$.root || null;
}}, rootMargin:{configurable:!0, enumerable:!0, get:function() {
  return this.$inst_$ ? this.$inst_$.rootMargin : this.$options_$.rootMargin;
}}, thresholds:{configurable:!0, enumerable:!0, get:function() {
  return this.$inst_$ ? this.$inst_$.thresholds : [].concat(this.$options_$.threshold || 0);
}}});
$IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$._upgraders = [];
function $fixEntry$$module$src$polyfills$intersection_observer$$() {
  var $win$jscomp$77$$ = $JSCompiler_win$jscomp$inline_334$$;
  !$win$jscomp$77$$.IntersectionObserverEntry || "isIntersecting" in $win$jscomp$77$$.IntersectionObserverEntry.prototype || Object.defineProperty($win$jscomp$77$$.IntersectionObserverEntry.prototype, "isIntersecting", {enumerable:!0, configurable:!0, get:function() {
    return 0 < this.intersectionRatio;
  }});
}
;function $sign$$module$src$polyfills$math_sign$$($x$jscomp$83$$) {
  return ($x$jscomp$83$$ = Number($x$jscomp$83$$)) ? 0 < $x$jscomp$83$$ ? 1 : -1 : $x$jscomp$83$$;
}
;var $hasOwnProperty$$module$src$polyfills$object_assign$$ = Object.prototype.hasOwnProperty;
function $assign$$module$src$polyfills$object_assign$$($target$jscomp$95$$, $var_args$jscomp$46$$) {
  if (null == $target$jscomp$95$$) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  for (var $output$jscomp$2$$ = Object($target$jscomp$95$$), $i$jscomp$27$$ = 1; $i$jscomp$27$$ < arguments.length; $i$jscomp$27$$++) {
    var $source$jscomp$14$$ = arguments[$i$jscomp$27$$];
    if (null != $source$jscomp$14$$) {
      for (var $key$jscomp$50$$ in $source$jscomp$14$$) {
        $hasOwnProperty$$module$src$polyfills$object_assign$$.call($source$jscomp$14$$, $key$jscomp$50$$) && ($output$jscomp$2$$[$key$jscomp$50$$] = $source$jscomp$14$$[$key$jscomp$50$$]);
      }
    }
  }
  return $output$jscomp$2$$;
}
;function $values$$module$src$polyfills$object_values$$($target$jscomp$96$$) {
  return Object.keys($target$jscomp$96$$).map(function($k$jscomp$5$$) {
    return $target$jscomp$96$$[$k$jscomp$5$$];
  });
}
;function $Promise$$module$node_modules$promise_pjs$promise_mjs$$($resolver$jscomp$1$$) {
  if (!(this instanceof $Promise$$module$node_modules$promise_pjs$promise_mjs$$)) {
    throw new TypeError("Constructor Promise requires `new`");
  }
  if (!$isFunction$$module$node_modules$promise_pjs$promise_mjs$$($resolver$jscomp$1$$)) {
    throw new TypeError("Must pass resolver function");
  }
  this._state = $PendingPromise$$module$node_modules$promise_pjs$promise_mjs$$;
  this._value = [];
  this._isChainEnd = !0;
  $doResolve$$module$node_modules$promise_pjs$promise_mjs$$(this, $adopter$$module$node_modules$promise_pjs$promise_mjs$$(this, $FulfilledPromise$$module$node_modules$promise_pjs$promise_mjs$$), $adopter$$module$node_modules$promise_pjs$promise_mjs$$(this, $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$), {then:$resolver$jscomp$1$$});
}
$Promise$$module$node_modules$promise_pjs$promise_mjs$$.prototype.then = function($onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$) {
  $onFulfilled$jscomp$1$$ = $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($onFulfilled$jscomp$1$$) ? $onFulfilled$jscomp$1$$ : void 0;
  $onRejected$jscomp$2$$ = $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($onRejected$jscomp$2$$) ? $onRejected$jscomp$2$$ : void 0;
  if ($onFulfilled$jscomp$1$$ || $onRejected$jscomp$2$$) {
    this._isChainEnd = !1;
  }
  return this._state(this._value, $onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$);
};
$Promise$$module$node_modules$promise_pjs$promise_mjs$$.prototype.catch = function($onRejected$jscomp$3$$) {
  return this.then(void 0, $onRejected$jscomp$3$$);
};
function $Promise$$module$node_modules$promise_pjs$promise_mjs$resolve$$($value$jscomp$101$$) {
  return $value$jscomp$101$$ === Object($value$jscomp$101$$) && $value$jscomp$101$$ instanceof this ? $value$jscomp$101$$ : new this(function($resolve$jscomp$9$$) {
    $resolve$jscomp$9$$($value$jscomp$101$$);
  });
}
function $Promise$$module$node_modules$promise_pjs$promise_mjs$reject$$($reason$jscomp$7$$) {
  return new this(function($_$$, $reject$jscomp$5$$) {
    $reject$jscomp$5$$($reason$jscomp$7$$);
  });
}
function $Promise$$module$node_modules$promise_pjs$promise_mjs$all$$($promises$jscomp$1$$) {
  var $Constructor$jscomp$2$$ = this;
  return new $Constructor$jscomp$2$$(function($resolve$jscomp$10$$, $reject$jscomp$6$$) {
    var $length$jscomp$19$$ = $promises$jscomp$1$$.length, $values$jscomp$11$$ = Array($length$jscomp$19$$);
    if (0 === $length$jscomp$19$$) {
      return $resolve$jscomp$10$$($values$jscomp$11$$);
    }
    $each$$module$node_modules$promise_pjs$promise_mjs$$($promises$jscomp$1$$, function($promises$jscomp$1$$, $index$jscomp$79$$) {
      $Constructor$jscomp$2$$.resolve($promises$jscomp$1$$).then(function($promises$jscomp$1$$) {
        $values$jscomp$11$$[$index$jscomp$79$$] = $promises$jscomp$1$$;
        0 === --$length$jscomp$19$$ && $resolve$jscomp$10$$($values$jscomp$11$$);
      }, $reject$jscomp$6$$);
    });
  });
}
function $Promise$$module$node_modules$promise_pjs$promise_mjs$race$$($promises$jscomp$2$$) {
  var $Constructor$jscomp$3$$ = this;
  return new $Constructor$jscomp$3$$(function($resolve$jscomp$11$$, $reject$jscomp$7$$) {
    for (var $i$jscomp$28$$ = 0; $i$jscomp$28$$ < $promises$jscomp$2$$.length; $i$jscomp$28$$++) {
      $Constructor$jscomp$3$$.resolve($promises$jscomp$2$$[$i$jscomp$28$$]).then($resolve$jscomp$11$$, $reject$jscomp$7$$);
    }
  });
}
function $FulfilledPromise$$module$node_modules$promise_pjs$promise_mjs$$($value$jscomp$103$$, $JSCompiler_promise$jscomp$inline_310_onFulfilled$jscomp$2$$, $unused$jscomp$1$$, $deferred$jscomp$4$$) {
  if (!$JSCompiler_promise$jscomp$inline_310_onFulfilled$jscomp$2$$) {
    return $deferred$jscomp$4$$ && ($JSCompiler_promise$jscomp$inline_310_onFulfilled$jscomp$2$$ = $deferred$jscomp$4$$.promise, $JSCompiler_promise$jscomp$inline_310_onFulfilled$jscomp$2$$._state = $FulfilledPromise$$module$node_modules$promise_pjs$promise_mjs$$, $JSCompiler_promise$jscomp$inline_310_onFulfilled$jscomp$2$$._value = $value$jscomp$103$$), this;
  }
  $deferred$jscomp$4$$ || ($deferred$jscomp$4$$ = new $Deferred$$module$node_modules$promise_pjs$promise_mjs$$(this.constructor));
  $defer$$module$node_modules$promise_pjs$promise_mjs$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise_mjs$$($deferred$jscomp$4$$, $JSCompiler_promise$jscomp$inline_310_onFulfilled$jscomp$2$$, $value$jscomp$103$$));
  return $deferred$jscomp$4$$.promise;
}
function $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$($reason$jscomp$9$$, $JSCompiler_promise$jscomp$inline_315_unused$jscomp$2$$, $onRejected$jscomp$4$$, $deferred$jscomp$5$$) {
  if (!$onRejected$jscomp$4$$) {
    return $deferred$jscomp$5$$ && ($JSCompiler_promise$jscomp$inline_315_unused$jscomp$2$$ = $deferred$jscomp$5$$.promise, $JSCompiler_promise$jscomp$inline_315_unused$jscomp$2$$._state = $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$, $JSCompiler_promise$jscomp$inline_315_unused$jscomp$2$$._value = $reason$jscomp$9$$), this;
  }
  $deferred$jscomp$5$$ || ($deferred$jscomp$5$$ = new $Deferred$$module$node_modules$promise_pjs$promise_mjs$$(this.constructor));
  $defer$$module$node_modules$promise_pjs$promise_mjs$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise_mjs$$($deferred$jscomp$5$$, $onRejected$jscomp$4$$, $reason$jscomp$9$$));
  return $deferred$jscomp$5$$.promise;
}
function $PendingPromise$$module$node_modules$promise_pjs$promise_mjs$$($queue$jscomp$2$$, $onFulfilled$jscomp$3$$, $onRejected$jscomp$5$$, $deferred$jscomp$6$$) {
  if (!$deferred$jscomp$6$$) {
    if (!$onFulfilled$jscomp$3$$ && !$onRejected$jscomp$5$$) {
      return this;
    }
    $deferred$jscomp$6$$ = new $Deferred$$module$node_modules$promise_pjs$promise_mjs$$(this.constructor);
  }
  $queue$jscomp$2$$.push({deferred:$deferred$jscomp$6$$, onFulfilled:$onFulfilled$jscomp$3$$ || $deferred$jscomp$6$$.resolve, onRejected:$onRejected$jscomp$5$$ || $deferred$jscomp$6$$.reject});
  return $deferred$jscomp$6$$.promise;
}
function $Deferred$$module$node_modules$promise_pjs$promise_mjs$$($Promise$jscomp$2$$) {
  var $deferred$jscomp$7$$ = this;
  this.promise = new $Promise$jscomp$2$$(function($Promise$jscomp$2$$, $reject$jscomp$8$$) {
    $deferred$jscomp$7$$.resolve = $Promise$jscomp$2$$;
    $deferred$jscomp$7$$.reject = $reject$jscomp$8$$;
  });
  return $deferred$jscomp$7$$;
}
function $adopt$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$9$$, $state$$, $value$jscomp$104$$, $adoptee$$) {
  var $queue$jscomp$3$$ = $promise$jscomp$9$$._value;
  $promise$jscomp$9$$._state = $state$$;
  $promise$jscomp$9$$._value = $value$jscomp$104$$;
  $adoptee$$ && $state$$ === $PendingPromise$$module$node_modules$promise_pjs$promise_mjs$$ && $adoptee$$._state($value$jscomp$104$$, void 0, void 0, {promise:$promise$jscomp$9$$, resolve:void 0, reject:void 0});
  for (var $i$jscomp$29$$ = 0; $i$jscomp$29$$ < $queue$jscomp$3$$.length; $i$jscomp$29$$++) {
    var $next$$ = $queue$jscomp$3$$[$i$jscomp$29$$];
    $promise$jscomp$9$$._state($value$jscomp$104$$, $next$$.onFulfilled, $next$$.onRejected, $next$$.deferred);
  }
  $queue$jscomp$3$$.length = 0;
  $state$$ === $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$ && $promise$jscomp$9$$._isChainEnd && setTimeout(function() {
    if ($promise$jscomp$9$$._isChainEnd) {
      throw $value$jscomp$104$$;
    }
  }, 0);
}
function $adopter$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$10$$, $state$jscomp$1$$) {
  return function($value$jscomp$105$$) {
    $adopt$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$10$$, $state$jscomp$1$$, $value$jscomp$105$$);
  };
}
function $noop$$module$node_modules$promise_pjs$promise_mjs$$() {
}
function $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($fn$jscomp$4$$) {
  return "function" === typeof $fn$jscomp$4$$;
}
function $each$$module$node_modules$promise_pjs$promise_mjs$$($collection$$, $iterator$jscomp$7$$) {
  for (var $i$jscomp$30$$ = 0; $i$jscomp$30$$ < $collection$$.length; $i$jscomp$30$$++) {
    $iterator$jscomp$7$$($collection$$[$i$jscomp$30$$], $i$jscomp$30$$);
  }
}
function $tryCatchDeferred$$module$node_modules$promise_pjs$promise_mjs$$($deferred$jscomp$9$$, $fn$jscomp$5$$, $arg$jscomp$9$$) {
  var $promise$jscomp$12$$ = $deferred$jscomp$9$$.promise, $resolve$jscomp$13$$ = $deferred$jscomp$9$$.resolve, $reject$jscomp$9$$ = $deferred$jscomp$9$$.reject;
  return function() {
    try {
      var $deferred$jscomp$9$$ = $fn$jscomp$5$$($arg$jscomp$9$$);
      $doResolve$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $deferred$jscomp$9$$, $deferred$jscomp$9$$);
    } catch ($e$jscomp$25$$) {
      $reject$jscomp$9$$($e$jscomp$25$$);
    }
  };
}
var $defer$$module$node_modules$promise_pjs$promise_mjs$$ = function() {
  function $flush$$() {
    for (var $flush$$ = 0; $flush$$ < $length$jscomp$20$$; $flush$$++) {
      var $scheduleFlush$$ = $queue$jscomp$4$$[$flush$$];
      $queue$jscomp$4$$[$flush$$] = null;
      $scheduleFlush$$();
    }
    $length$jscomp$20$$ = 0;
  }
  if ("undefined" !== typeof window && window.postMessage) {
    window.addEventListener("message", $flush$$);
    var $scheduleFlush$$ = function() {
      window.postMessage("macro-task", "*");
    };
  } else {
    $scheduleFlush$$ = function() {
      setTimeout($flush$$, 0);
    };
  }
  var $queue$jscomp$4$$ = Array(16), $length$jscomp$20$$ = 0;
  return function($flush$$) {
    0 === $length$jscomp$20$$ && $scheduleFlush$$();
    $queue$jscomp$4$$[$length$jscomp$20$$++] = $flush$$;
  };
}();
function $doResolve$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$13$$, $resolve$jscomp$14$$, $reject$jscomp$10$$, $value$jscomp$107$$, $context$jscomp$2$$) {
  var $_reject$$ = $reject$jscomp$10$$, $then$$;
  try {
    if ($value$jscomp$107$$ === $promise$jscomp$13$$) {
      throw new TypeError("Cannot fulfill promise with itself");
    }
    var $isObj$$ = $value$jscomp$107$$ === Object($value$jscomp$107$$);
    if ($isObj$$ && $value$jscomp$107$$ instanceof $promise$jscomp$13$$.constructor) {
      $adopt$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$13$$, $value$jscomp$107$$._state, $value$jscomp$107$$._value, $value$jscomp$107$$);
    } else {
      if ($isObj$$ && ($then$$ = $value$jscomp$107$$.then) && $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($then$$)) {
        var $_resolve$$ = function($value$jscomp$107$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise_mjs$$;
          $doResolve$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$13$$, $resolve$jscomp$14$$, $reject$jscomp$10$$, $value$jscomp$107$$, $value$jscomp$107$$);
        };
        $_reject$$ = function($promise$jscomp$13$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise_mjs$$;
          $reject$jscomp$10$$($promise$jscomp$13$$);
        };
        $then$$.call($context$jscomp$2$$, function($promise$jscomp$13$$) {
          $_resolve$$($promise$jscomp$13$$);
        }, function($promise$jscomp$13$$) {
          $_reject$$($promise$jscomp$13$$);
        });
      } else {
        $resolve$jscomp$14$$($value$jscomp$107$$);
      }
    }
  } catch ($e$jscomp$26$$) {
    $_reject$$($e$jscomp$26$$);
  }
}
;(function($win$jscomp$23$$) {
  $win$jscomp$23$$.fetch || (Object.defineProperty($win$jscomp$23$$, "fetch", {value:$fetchPolyfill$$module$src$polyfills$fetch$$, writable:!0, enumerable:!0, configurable:!0}), Object.defineProperty($win$jscomp$23$$, "Response", {value:$Response$$module$src$polyfills$fetch$$, writable:!0, enumerable:!1, configurable:!0}));
})(self);
(function($win$jscomp$78$$) {
  $win$jscomp$78$$.Math.sign || $win$jscomp$78$$.Object.defineProperty($win$jscomp$78$$.Math, "sign", {enumerable:!1, configurable:!0, writable:!0, value:$sign$$module$src$polyfills$math_sign$$});
})(self);
(function($win$jscomp$79$$) {
  $win$jscomp$79$$.Object.assign || $win$jscomp$79$$.Object.defineProperty($win$jscomp$79$$.Object, "assign", {enumerable:!1, configurable:!0, writable:!0, value:$assign$$module$src$polyfills$object_assign$$});
})(self);
(function($win$jscomp$80$$) {
  $win$jscomp$80$$.Object.values || $win$jscomp$80$$.Object.defineProperty($win$jscomp$80$$.Object, "values", {configurable:!0, writable:!0, value:$values$$module$src$polyfills$object_values$$});
})(self);
(function($win$jscomp$81$$) {
  $win$jscomp$81$$.Promise || ($win$jscomp$81$$.Promise = $Promise$$module$node_modules$promise_pjs$promise_mjs$$, $Promise$$module$node_modules$promise_pjs$promise_mjs$$.default && ($win$jscomp$81$$.Promise = $Promise$$module$node_modules$promise_pjs$promise_mjs$$.default), $win$jscomp$81$$.Promise.resolve = $Promise$$module$node_modules$promise_pjs$promise_mjs$resolve$$, $win$jscomp$81$$.Promise.reject = $Promise$$module$node_modules$promise_pjs$promise_mjs$reject$$, $win$jscomp$81$$.Promise.all = 
  $Promise$$module$node_modules$promise_pjs$promise_mjs$all$$, $win$jscomp$81$$.Promise.race = $Promise$$module$node_modules$promise_pjs$promise_mjs$race$$);
})(self);
(function($win$jscomp$4$$) {
  $win$jscomp$4$$.Array.prototype.includes || $win$jscomp$4$$.Object.defineProperty(Array.prototype, "includes", {enumerable:!1, configurable:!0, writable:!0, value:$includes$$module$src$polyfills$array_includes$$});
})(self);
if (self.document) {
  $install$$module$src$polyfills$domtokenlist$$();
  var $JSCompiler_win$jscomp$inline_319$$ = self, $JSCompiler_documentClass$jscomp$inline_320$$ = $JSCompiler_win$jscomp$inline_319$$.HTMLDocument || $JSCompiler_win$jscomp$inline_319$$.Document;
  $JSCompiler_documentClass$jscomp$inline_320$$ && !$JSCompiler_documentClass$jscomp$inline_320$$.prototype.contains && $JSCompiler_win$jscomp$inline_319$$.Object.defineProperty($JSCompiler_documentClass$jscomp$inline_320$$.prototype, "contains", {enumerable:!1, configurable:!0, writable:!0, value:$documentContainsPolyfill$$module$src$polyfills$document_contains$$});
  var $JSCompiler_win$jscomp$inline_322$$ = self;
  $shouldInstall$$module$src$get_bounding_client_rect$$() && ($nativeClientRect$$module$src$get_bounding_client_rect$$ = Element.prototype.getBoundingClientRect, $JSCompiler_win$jscomp$inline_322$$.Object.defineProperty($JSCompiler_win$jscomp$inline_322$$.Element.prototype, "getBoundingClientRect", {value:$getBoundingClientRect$$module$src$get_bounding_client_rect$$}));
  var $JSCompiler_ctor$jscomp$inline_324$$ = function() {
  }, $JSCompiler_win$jscomp$inline_325$$ = self, $JSCompiler_shouldInstall$jscomp$inline_326$$ = $JSCompiler_win$jscomp$inline_325$$.document, $JSCompiler_inline_result$jscomp$838$$, $JSCompiler_customElements$jscomp$inline_874$$ = $JSCompiler_win$jscomp$inline_325$$.customElements;
  $JSCompiler_inline_result$jscomp$838$$ = !!($JSCompiler_customElements$jscomp$inline_874$$ && $JSCompiler_customElements$jscomp$inline_874$$.define && $JSCompiler_customElements$jscomp$inline_874$$.get && $JSCompiler_customElements$jscomp$inline_874$$.whenDefined);
  var $JSCompiler_temp$jscomp$839$$;
  if (!($JSCompiler_temp$jscomp$839$$ = !$JSCompiler_shouldInstall$jscomp$inline_326$$)) {
    var $JSCompiler_temp$jscomp$840$$;
    if ($JSCompiler_temp$jscomp$840$$ = $JSCompiler_inline_result$jscomp$838$$) {
      $JSCompiler_temp$jscomp$840$$ = -1 === $JSCompiler_win$jscomp$inline_325$$.HTMLElement.toString().indexOf("[native code]");
    }
    $JSCompiler_temp$jscomp$839$$ = $JSCompiler_temp$jscomp$840$$;
  }
  if (!$JSCompiler_temp$jscomp$839$$) {
    var $JSCompiler_install$jscomp$inline_328$$ = !0, $JSCompiler_installWrapper$jscomp$inline_329$$ = !1;
    if ($JSCompiler_ctor$jscomp$inline_324$$ && $JSCompiler_inline_result$jscomp$838$$) {
      try {
        var $JSCompiler_Reflect$jscomp$inline_330$$ = $JSCompiler_win$jscomp$inline_325$$.Reflect, $JSCompiler_instance$jscomp$inline_331$$ = Object.create($JSCompiler_ctor$jscomp$inline_324$$.prototype);
        Function.call.call($JSCompiler_ctor$jscomp$inline_324$$, $JSCompiler_instance$jscomp$inline_331$$);
        $JSCompiler_installWrapper$jscomp$inline_329$$ = !(!$JSCompiler_Reflect$jscomp$inline_330$$ || !$JSCompiler_Reflect$jscomp$inline_330$$.construct);
      } catch ($JSCompiler_e$jscomp$inline_332$$) {
        $JSCompiler_install$jscomp$inline_328$$ = !1;
      }
    }
    $JSCompiler_installWrapper$jscomp$inline_329$$ ? $wrapHTMLElement$$module$src$polyfills$custom_elements$$() : $JSCompiler_install$jscomp$inline_328$$ && $polyfill$$module$src$polyfills$custom_elements$$();
  }
  if ($getMode$$module$src$mode$$().localDev || $getMode$$module$src$mode$$().test) {
    var $JSCompiler_win$jscomp$inline_334$$ = self;
    $JSCompiler_win$jscomp$inline_334$$.IntersectionObserver || ($JSCompiler_win$jscomp$inline_334$$.IntersectionObserver = $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$);
    $fixEntry$$module$src$polyfills$intersection_observer$$();
  }
}
;var $htmlContainer$$module$src$static_template$$;
function $htmlFor$$module$src$static_template$$($doc$jscomp$6_nodeOrDoc$jscomp$4$$) {
  $doc$jscomp$6_nodeOrDoc$jscomp$4$$ = $doc$jscomp$6_nodeOrDoc$jscomp$4$$.ownerDocument || $doc$jscomp$6_nodeOrDoc$jscomp$4$$;
  $htmlContainer$$module$src$static_template$$ && $htmlContainer$$module$src$static_template$$.ownerDocument === $doc$jscomp$6_nodeOrDoc$jscomp$4$$ || ($htmlContainer$$module$src$static_template$$ = $doc$jscomp$6_nodeOrDoc$jscomp$4$$.createElement("div"));
  return $html$$module$src$static_template$$;
}
function $html$$module$src$static_template$$($JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$) {
  var $JSCompiler_container$jscomp$inline_337$$ = $htmlContainer$$module$src$static_template$$;
  $devAssert$$module$src$log$$(1 === $JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$.length);
  $JSCompiler_container$jscomp$inline_337$$.innerHTML = $JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$[0];
  $JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$ = $JSCompiler_container$jscomp$inline_337$$.firstElementChild;
  $devAssert$$module$src$log$$($JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$);
  $devAssert$$module$src$log$$(!$JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$.nextElementSibling);
  $JSCompiler_container$jscomp$inline_337$$.removeChild($JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$);
  return $JSCompiler_el$jscomp$inline_338_strings$jscomp$1$$;
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $getVendorJsPropertyName$$module$src$style$$($style$jscomp$1$$, $camelCase$jscomp$1$$, $opt_bypassCache$$) {
  if ($startsWith$$module$src$string$$($camelCase$jscomp$1$$, "--")) {
    return $camelCase$jscomp$1$$;
  }
  $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = $map$$module$src$utils$object$$());
  var $propertyName$jscomp$9$$ = $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$];
  if (!$propertyName$jscomp$9$$ || $opt_bypassCache$$) {
    $propertyName$jscomp$9$$ = $camelCase$jscomp$1$$;
    if (void 0 === $style$jscomp$1$$[$camelCase$jscomp$1$$]) {
      var $JSCompiler_inline_result$jscomp$151_JSCompiler_inline_result$jscomp$152$$ = $camelCase$jscomp$1$$.charAt(0).toUpperCase() + $camelCase$jscomp$1$$.slice(1);
      a: {
        for (var $JSCompiler_i$jscomp$inline_344$$ = 0; $JSCompiler_i$jscomp$inline_344$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_344$$++) {
          var $JSCompiler_propertyName$jscomp$inline_345$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_344$$] + $JSCompiler_inline_result$jscomp$151_JSCompiler_inline_result$jscomp$152$$;
          if (void 0 !== $style$jscomp$1$$[$JSCompiler_propertyName$jscomp$inline_345$$]) {
            $JSCompiler_inline_result$jscomp$151_JSCompiler_inline_result$jscomp$152$$ = $JSCompiler_propertyName$jscomp$inline_345$$;
            break a;
          }
        }
        $JSCompiler_inline_result$jscomp$151_JSCompiler_inline_result$jscomp$152$$ = "";
      }
      var $prefixedPropertyName$$ = $JSCompiler_inline_result$jscomp$151_JSCompiler_inline_result$jscomp$152$$;
      void 0 !== $style$jscomp$1$$[$prefixedPropertyName$$] && ($propertyName$jscomp$9$$ = $prefixedPropertyName$$);
    }
    $opt_bypassCache$$ || ($propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$] = $propertyName$jscomp$9$$);
  }
  return $propertyName$jscomp$9$$;
}
function $setImportantStyles$$module$src$style$$($element$jscomp$66_style$jscomp$2$$, $styles$$) {
  $element$jscomp$66_style$jscomp$2$$ = $element$jscomp$66_style$jscomp$2$$.style;
  for (var $k$jscomp$6$$ in $styles$$) {
    $element$jscomp$66_style$jscomp$2$$.setProperty($getVendorJsPropertyName$$module$src$style$$($element$jscomp$66_style$jscomp$2$$, $k$jscomp$6$$), $styles$$[$k$jscomp$6$$].toString(), "important");
  }
}
function $setStyle$$module$src$style$$($element$jscomp$67$$, $property$jscomp$4_propertyName$jscomp$10$$, $value$jscomp$110$$, $opt_units$$) {
  if ($property$jscomp$4_propertyName$jscomp$10$$ = $getVendorJsPropertyName$$module$src$style$$($element$jscomp$67$$.style, $property$jscomp$4_propertyName$jscomp$10$$, void 0)) {
    var $styleValue$$ = $opt_units$$ ? $value$jscomp$110$$ + $opt_units$$ : $value$jscomp$110$$;
    $startsWith$$module$src$string$$($property$jscomp$4_propertyName$jscomp$10$$, "--") ? $element$jscomp$67$$.style.setProperty($property$jscomp$4_propertyName$jscomp$10$$, $styleValue$$) : $element$jscomp$67$$.style[$property$jscomp$4_propertyName$jscomp$10$$] = $styleValue$$;
  }
}
function $getStyle$$module$src$style$$($element$jscomp$68$$, $property$jscomp$5_propertyName$jscomp$11$$) {
  if ($property$jscomp$5_propertyName$jscomp$11$$ = $getVendorJsPropertyName$$module$src$style$$($element$jscomp$68$$.style, $property$jscomp$5_propertyName$jscomp$11$$, void 0)) {
    return $startsWith$$module$src$string$$($property$jscomp$5_propertyName$jscomp$11$$, "--") ? $element$jscomp$68$$.style.getPropertyValue($property$jscomp$5_propertyName$jscomp$11$$) : $element$jscomp$68$$.style[$property$jscomp$5_propertyName$jscomp$11$$];
  }
}
function $setStyles$$module$src$style$$($element$jscomp$69$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$7$$ in $styles$jscomp$1$$) {
    $setStyle$$module$src$style$$($element$jscomp$69$$, $k$jscomp$7$$, $styles$jscomp$1$$[$k$jscomp$7$$]);
  }
}
function $toggle$$module$src$style$$($element$jscomp$70$$, $opt_display$$) {
  void 0 === $opt_display$$ && ($opt_display$$ = $element$jscomp$70$$.hasAttribute("hidden"));
  $opt_display$$ ? $element$jscomp$70$$.removeAttribute("hidden") : $element$jscomp$70$$.setAttribute("hidden", "");
}
function $computedStyle$$module$src$style$$($win$jscomp$82$$, $el$jscomp$12$$) {
  return $win$jscomp$82$$.getComputedStyle($el$jscomp$12$$) || $map$$module$src$utils$object$$();
}
;var $_template$$module$src$layout$$ = ['<i-amphtml-sizer class=i-amphtml-sizer><img alt="" role=presentation aria-hidden=true class=i-amphtml-intrinsic-sizer></i-amphtml-sizer>'], $Layout$$module$src$layout$$ = {NODISPLAY:"nodisplay", FIXED:"fixed", FIXED_HEIGHT:"fixed-height", RESPONSIVE:"responsive", CONTAINER:"container", FILL:"fill", FLEX_ITEM:"flex-item", FLUID:"fluid", INTRINSIC:"intrinsic"}, $naturalDimensions_$$module$src$layout$$ = {"AMP-PIXEL":{width:"0px", height:"0px"}, "AMP-ANALYTICS":{width:"1px", 
height:"1px"}, "AMP-AUDIO":null, "AMP-SOCIAL-SHARE":{width:"60px", height:"44px"}}, $LOADING_ELEMENTS_$$module$src$layout$$ = {"AMP-AD":!0, "AMP-ANIM":!0, "AMP-EMBED":!0, "AMP-FACEBOOK":!0, "AMP-FACEBOOK-COMMENTS":!0, "AMP-FACEBOOK-PAGE":!0, "AMP-GOOGLE-DOCUMENT-EMBED":!0, "AMP-IFRAME":!0, "AMP-IMG":!0, "AMP-INSTAGRAM":!0, "AMP-LIST":!0, "AMP-PINTEREST":!0, "AMP-PLAYBUZZ":!0, "AMP-TWITTER":!0}, $videoPlayerTagNameRe$$module$src$layout$$ = /^amp\-(video|.+player)|AMP-BRIGHTCOVE|AMP-DAILYMOTION|AMP-YOUTUBE|AMP-VIMEO|AMP-IMA-VIDEO/i;
function $parseLayout$$module$src$layout$$($s$jscomp$17$$) {
  for (var $k$jscomp$8$$ in $Layout$$module$src$layout$$) {
    if ($Layout$$module$src$layout$$[$k$jscomp$8$$] == $s$jscomp$17$$) {
      return $Layout$$module$src$layout$$[$k$jscomp$8$$];
    }
  }
}
function $isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$1$$) {
  return "fixed" == $layout$jscomp$1$$ || "fixed-height" == $layout$jscomp$1$$ || "responsive" == $layout$jscomp$1$$ || "fill" == $layout$jscomp$1$$ || "flex-item" == $layout$jscomp$1$$ || "fluid" == $layout$jscomp$1$$ || "intrinsic" == $layout$jscomp$1$$;
}
function $parseLength$$module$src$layout$$($s$jscomp$18$$) {
  if ("number" == typeof $s$jscomp$18$$) {
    return $s$jscomp$18$$ + "px";
  }
  if ($s$jscomp$18$$ && /^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)?$/.test($s$jscomp$18$$)) {
    return /^\d+(\.\d+)?$/.test($s$jscomp$18$$) ? $s$jscomp$18$$ + "px" : $s$jscomp$18$$;
  }
}
function $assertLength$$module$src$layout$$($length$jscomp$21$$) {
  $userAssert$$module$src$log$$(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)$/.test($length$jscomp$21$$), "Invalid length value: %s", $length$jscomp$21$$);
  return $length$jscomp$21$$;
}
function $assertLengthOrPercent$$module$src$layout$$($length$jscomp$22$$) {
  $userAssert$$module$src$log$$(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|%)$/.test($length$jscomp$22$$), "Invalid length or percent value: %s", $length$jscomp$22$$);
  return $length$jscomp$22$$;
}
function $getLengthUnits$$module$src$layout$$($length$jscomp$23$$) {
  $assertLength$$module$src$layout$$($length$jscomp$23$$);
  return $userAssert$$module$src$log$$(/[a-z]+/i.exec($length$jscomp$23$$), "Failed to read units from %s", $length$jscomp$23$$)[0];
}
function $getLengthNumeral$$module$src$layout$$($length$jscomp$24_res$jscomp$3$$) {
  $length$jscomp$24_res$jscomp$3$$ = parseFloat($length$jscomp$24_res$jscomp$3$$);
  return $isFiniteNumber$$module$src$types$$($length$jscomp$24_res$jscomp$3$$) ? $length$jscomp$24_res$jscomp$3$$ : void 0;
}
;var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$75$$, $eventType$jscomp$3$$, $listener$jscomp$64$$, $opt_evtListenerOpts$$) {
  var $localElement$$ = $element$jscomp$75$$, $localListener$$ = $listener$jscomp$64$$;
  var $wrapped$$ = function($element$jscomp$75$$) {
    try {
      return $localListener$$($element$jscomp$75$$);
    } catch ($e$jscomp$27$$) {
      throw self.__AMP_REPORT_ERROR($e$jscomp$27$$), $e$jscomp$27$$;
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
    var $options$jscomp$34$$ = {get capture() {
      $optsSupported$$module$src$event_helper_listen$$ = !0;
    }};
    self.addEventListener("test-options", null, $options$jscomp$34$$);
    self.removeEventListener("test-options", null, $options$jscomp$34$$);
  } catch ($err$jscomp$3$$) {
  }
  return $optsSupported$$module$src$event_helper_listen$$;
}
;function $listen$$module$src$event_helper$$($element$jscomp$76$$, $eventType$jscomp$4$$, $listener$jscomp$65$$, $opt_evtListenerOpts$jscomp$1$$) {
  return $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$76$$, $eventType$jscomp$4$$, $listener$jscomp$65$$, $opt_evtListenerOpts$jscomp$1$$);
}
function $listenOnce$$module$src$event_helper$$($element$jscomp$77$$, $eventType$jscomp$5$$, $listener$jscomp$66$$, $opt_evtListenerOpts$jscomp$2$$) {
  var $localListener$jscomp$1$$ = $listener$jscomp$66$$, $unlisten$$ = $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$77$$, $eventType$jscomp$5$$, function($element$jscomp$77$$) {
    try {
      $localListener$jscomp$1$$($element$jscomp$77$$);
    } finally {
      $localListener$jscomp$1$$ = null, $unlisten$$();
    }
  }, $opt_evtListenerOpts$jscomp$2$$);
  return $unlisten$$;
}
function $listenOncePromise$$module$src$event_helper$$($element$jscomp$78$$, $opt_cancel$$) {
  var $unlisten$jscomp$1$$, $eventPromise$$ = new Promise(function($opt_cancel$$) {
    $unlisten$jscomp$1$$ = $listenOnce$$module$src$event_helper$$($element$jscomp$78$$, "click", $opt_cancel$$, void 0);
  });
  $eventPromise$$.then($unlisten$jscomp$1$$, $unlisten$jscomp$1$$);
  $opt_cancel$$ && $opt_cancel$$($unlisten$jscomp$1$$);
  return $eventPromise$$;
}
function $isLoaded$$module$src$event_helper$$($eleOrWindow$$) {
  return !!($eleOrWindow$$.complete || "complete" == $eleOrWindow$$.readyState || $isHTMLMediaElement$$module$src$event_helper$$($eleOrWindow$$) && 0 < $eleOrWindow$$.readyState || $eleOrWindow$$.document && "complete" == $eleOrWindow$$.document.readyState);
}
function $loadPromise$$module$src$event_helper$$($eleOrWindow$jscomp$1$$) {
  var $unlistenLoad$$, $unlistenError$$;
  if ($isLoaded$$module$src$event_helper$$($eleOrWindow$jscomp$1$$)) {
    return Promise.resolve($eleOrWindow$jscomp$1$$);
  }
  var $isMediaElement$$ = $isHTMLMediaElement$$module$src$event_helper$$($eleOrWindow$jscomp$1$$);
  return $isMediaElement$$ && $eleOrWindow$jscomp$1$$.__AMP_MEDIA_LOAD_FAILURE_SRC === $eleOrWindow$jscomp$1$$.currentSrc ? Promise.reject($eleOrWindow$jscomp$1$$) : (new Promise(function($resolve$jscomp$16$$, $reject$jscomp$11$$) {
    $unlistenLoad$$ = $isMediaElement$$ ? $listenOnce$$module$src$event_helper$$($eleOrWindow$jscomp$1$$, "loadedmetadata", $resolve$jscomp$16$$, {capture:!0}) : $listenOnce$$module$src$event_helper$$($eleOrWindow$jscomp$1$$, "load", $resolve$jscomp$16$$);
    if ($eleOrWindow$jscomp$1$$.tagName) {
      var $errorTarget$$ = $eleOrWindow$jscomp$1$$;
      if ($isMediaElement$$ && !$eleOrWindow$jscomp$1$$.hasAttribute("src") && ($errorTarget$$ = $lastChildElement$$module$src$dom$$($eleOrWindow$jscomp$1$$, function($eleOrWindow$jscomp$1$$) {
        return "SOURCE" === $eleOrWindow$jscomp$1$$.tagName;
      }), !$errorTarget$$)) {
        return $reject$jscomp$11$$(Error("Media has no source."));
      }
      $unlistenError$$ = $listenOnce$$module$src$event_helper$$($errorTarget$$, "error", $reject$jscomp$11$$);
    }
  })).then(function() {
    $unlistenError$$ && $unlistenError$$();
    return $eleOrWindow$jscomp$1$$;
  }, function() {
    $unlistenLoad$$ && $unlistenLoad$$();
    $isHTMLMediaElement$$module$src$event_helper$$($eleOrWindow$jscomp$1$$) && ($eleOrWindow$jscomp$1$$.__AMP_MEDIA_LOAD_FAILURE_SRC = $eleOrWindow$jscomp$1$$.currentSrc || !0);
    var $unlistenError$$ = $eleOrWindow$jscomp$1$$;
    $unlistenError$$ && $unlistenError$$.src && ($unlistenError$$ = $unlistenError$$.src);
    throw $user$$module$src$log$$().createError("Failed to load:", $unlistenError$$);
  });
}
function $isHTMLMediaElement$$module$src$event_helper$$($eleOrWindow$jscomp$3$$) {
  return "AUDIO" === $eleOrWindow$jscomp$3$$.tagName || "VIDEO" === $eleOrWindow$jscomp$3$$.tagName;
}
;function $BaseElement$$module$src$base_element$$($element$jscomp$79$$) {
  this.element = $element$jscomp$79$$;
  this.layout_ = "nodisplay";
  this.inViewport_ = !1;
  this.win = $element$jscomp$79$$.ownerDocument.defaultView;
  this.defaultActionAlias_ = this.actionMap_ = null;
}
$JSCompiler_prototypeAlias$$ = $BaseElement$$module$src$base_element$$.prototype;
$JSCompiler_prototypeAlias$$.signals = function() {
  return this.element.signals();
};
$JSCompiler_prototypeAlias$$.getDefaultActionAlias = function() {
  return this.defaultActionAlias_;
};
$JSCompiler_prototypeAlias$$.getLayoutPriority = function() {
  return 0;
};
$JSCompiler_prototypeAlias$$.updateLayoutPriority = function($newLayoutPriority$$) {
  this.element.getResources().updateLayoutPriority(this.element, $newLayoutPriority$$);
};
$JSCompiler_prototypeAlias$$.getLayout = function() {
  return this.layout_;
};
$JSCompiler_prototypeAlias$$.getLayoutBox = function() {
  return this.element.getLayoutBox();
};
$JSCompiler_prototypeAlias$$.getPageLayoutBox = function() {
  return this.element.getPageLayoutBox();
};
$JSCompiler_prototypeAlias$$.getWin = function() {
  return this.win;
};
$JSCompiler_prototypeAlias$$.getAmpDoc = function() {
  return this.element.getAmpDoc();
};
$JSCompiler_prototypeAlias$$.getVsync = function() {
  return $Services$$module$src$services$vsyncFor$$(this.win);
};
$JSCompiler_prototypeAlias$$.getConsentPolicy = function() {
  var $policyId$$ = null;
  this.element.hasAttribute("data-block-on-consent") && ($policyId$$ = this.element.getAttribute("data-block-on-consent") || "default");
  return $policyId$$;
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "nodisplay" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.isAlwaysFixed = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.isInViewport = function() {
  return this.inViewport_;
};
$JSCompiler_prototypeAlias$$.upgradeCallback = function() {
  return null;
};
$JSCompiler_prototypeAlias$$.createdCallback = function() {
};
$JSCompiler_prototypeAlias$$.firstAttachedCallback = function() {
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
};
$JSCompiler_prototypeAlias$$.preconnectCallback = function() {
};
$JSCompiler_prototypeAlias$$.detachedCallback = function() {
};
$JSCompiler_prototypeAlias$$.prerenderAllowed = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.isBuildRenderBlocking = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.createPlaceholderCallback = function() {
  return null;
};
$JSCompiler_prototypeAlias$$.createLoaderLogoCallback = function() {
  return {};
};
$JSCompiler_prototypeAlias$$.renderOutsideViewport = function() {
  return "inabox" == $getMode$$module$src$mode$$(this.win).runtime || 3;
};
$JSCompiler_prototypeAlias$$.isRelayoutNeeded = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  return $resolvedPromise$$module$src$resolved_promise$$();
};
$JSCompiler_prototypeAlias$$.firstLayoutCompleted = function() {
  this.togglePlaceholder(!1);
};
$JSCompiler_prototypeAlias$$.viewportCallback = function() {
};
$JSCompiler_prototypeAlias$$.pauseCallback = function() {
};
$JSCompiler_prototypeAlias$$.resumeCallback = function() {
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.unlayoutOnPause = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.reconstructWhenReparented = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.loadPromise = function($element$jscomp$80$$) {
  return $loadPromise$$module$src$event_helper$$($element$jscomp$80$$);
};
function $JSCompiler_StaticMethods_initActionMap_$$($JSCompiler_StaticMethods_initActionMap_$self$$) {
  $JSCompiler_StaticMethods_initActionMap_$self$$.actionMap_ || ($JSCompiler_StaticMethods_initActionMap_$self$$.actionMap_ = $JSCompiler_StaticMethods_initActionMap_$self$$.win.Object.create(null));
}
$JSCompiler_prototypeAlias$$.registerAction = function($alias$$, $handler$jscomp$4$$, $minTrust$$) {
  $minTrust$$ = void 0 === $minTrust$$ ? 2 : $minTrust$$;
  $JSCompiler_StaticMethods_initActionMap_$$(this);
  this.actionMap_[$alias$$] = {handler:$handler$jscomp$4$$, minTrust:$minTrust$$};
};
$JSCompiler_prototypeAlias$$.registerDefaultAction = function($handler$jscomp$5$$, $alias$jscomp$1$$, $minTrust$jscomp$1$$) {
  $alias$jscomp$1$$ = void 0 === $alias$jscomp$1$$ ? "activate" : $alias$jscomp$1$$;
  $minTrust$jscomp$1$$ = void 0 === $minTrust$jscomp$1$$ ? 2 : $minTrust$jscomp$1$$;
  $devAssert$$module$src$log$$(!this.defaultActionAlias_);
  this.registerAction($alias$jscomp$1$$, $handler$jscomp$5$$, $minTrust$jscomp$1$$);
  this.defaultActionAlias_ = $alias$jscomp$1$$;
};
$JSCompiler_prototypeAlias$$.executeAction = function($invocation$$) {
  var $handler$jscomp$6_method$jscomp$3$$ = $invocation$$.method;
  "activate" === $handler$jscomp$6_method$jscomp$3$$ && ($handler$jscomp$6_method$jscomp$3$$ = this.defaultActionAlias_ || $handler$jscomp$6_method$jscomp$3$$);
  $JSCompiler_StaticMethods_initActionMap_$$(this);
  var $holder$jscomp$13$$ = this.actionMap_[$handler$jscomp$6_method$jscomp$3$$];
  $userAssert$$module$src$log$$($holder$jscomp$13$$, "Method not found: " + $handler$jscomp$6_method$jscomp$3$$ + " in " + this.element.tagName);
  $handler$jscomp$6_method$jscomp$3$$ = $holder$jscomp$13$$.handler;
  if ($invocation$$.satisfiesTrust($holder$jscomp$13$$.minTrust)) {
    return $handler$jscomp$6_method$jscomp$3$$($invocation$$);
  }
};
$JSCompiler_prototypeAlias$$.propagateAttributes = function($attributes$jscomp$3$$, $element$jscomp$81$$, $opt_removeMissingAttrs$$) {
  $attributes$jscomp$3$$ = $isArray$$module$src$types$$($attributes$jscomp$3$$) ? $attributes$jscomp$3$$ : [$attributes$jscomp$3$$];
  for (var $i$jscomp$35$$ = 0; $i$jscomp$35$$ < $attributes$jscomp$3$$.length; $i$jscomp$35$$++) {
    var $attr$jscomp$4$$ = $attributes$jscomp$3$$[$i$jscomp$35$$], $val$jscomp$6$$ = this.element.getAttribute($attr$jscomp$4$$);
    null !== $val$jscomp$6$$ ? $element$jscomp$81$$.setAttribute($attr$jscomp$4$$, $val$jscomp$6$$) : $opt_removeMissingAttrs$$ && $element$jscomp$81$$.removeAttribute($attr$jscomp$4$$);
  }
};
$JSCompiler_prototypeAlias$$.propagateDataset = function($targetElement$$) {
  for (var $key$jscomp$51$$ in $targetElement$$.dataset) {
    $key$jscomp$51$$ in this.element.dataset || delete $targetElement$$.dataset[$key$jscomp$51$$];
  }
  for (var $key$17$$ in this.element.dataset) {
    $targetElement$$.dataset[$key$17$$] !== this.element.dataset[$key$17$$] && ($targetElement$$.dataset[$key$17$$] = this.element.dataset[$key$17$$]);
  }
};
$JSCompiler_prototypeAlias$$.forwardEvents = function($events$$, $element$jscomp$82$$) {
  var $$jscomp$this$jscomp$4$$ = this, $unlisteners$$ = ($isArray$$module$src$types$$($events$$) ? $events$$ : [$events$$]).map(function($events$$) {
    return $listen$$module$src$event_helper$$($element$jscomp$82$$, $events$$, function($element$jscomp$82$$) {
      $$jscomp$this$jscomp$4$$.element.dispatchCustomEvent($events$$, $element$jscomp$82$$.data || {});
    });
  });
  return function() {
    return $unlisteners$$.forEach(function($events$$) {
      return $events$$();
    });
  };
};
$JSCompiler_prototypeAlias$$.getPlaceholder = function() {
  return this.element.getPlaceholder();
};
$JSCompiler_prototypeAlias$$.togglePlaceholder = function($state$jscomp$3$$) {
  this.element.togglePlaceholder($state$jscomp$3$$);
};
$JSCompiler_prototypeAlias$$.getFallback = function() {
  return this.element.getFallback();
};
$JSCompiler_prototypeAlias$$.toggleFallback = function($state$jscomp$4$$) {
  this.element.toggleFallback($state$jscomp$4$$);
};
$JSCompiler_prototypeAlias$$.toggleLoading = function($state$jscomp$5$$) {
  this.element.toggleLoading($state$jscomp$5$$);
};
$JSCompiler_prototypeAlias$$.isLoadingReused = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.getOverflowElement = function() {
  return this.element.getOverflowElement();
};
$JSCompiler_prototypeAlias$$.renderStarted = function() {
  this.element.renderStarted();
};
$JSCompiler_prototypeAlias$$.getRealChildNodes = function() {
  return this.element.getRealChildNodes();
};
$JSCompiler_prototypeAlias$$.getRealChildren = function() {
  return this.element.getRealChildren();
};
$JSCompiler_prototypeAlias$$.applyFillContent = function($element$jscomp$83$$, $opt_replacedContent$$) {
  $element$jscomp$83$$.classList.add("i-amphtml-fill-content");
  $opt_replacedContent$$ && $element$jscomp$83$$.classList.add("i-amphtml-replaced-content");
};
$JSCompiler_prototypeAlias$$.getViewport = function() {
  return $Services$$module$src$services$viewportForDoc$$(this.getAmpDoc());
};
$JSCompiler_prototypeAlias$$.getIntersectionElementLayoutBox = function() {
  return this.getLayoutBox();
};
$JSCompiler_prototypeAlias$$.collapse = function() {
  $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).collapseElement(this.element);
};
$JSCompiler_prototypeAlias$$.attemptCollapse = function() {
  return $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).attemptCollapse(this.element);
};
$JSCompiler_prototypeAlias$$.forceChangeHeight = function($newHeight$$) {
  $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).forceChangeSize(this.element, $newHeight$$, void 0);
};
$JSCompiler_prototypeAlias$$.attemptChangeHeight = function($newHeight$jscomp$1$$) {
  return $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).requestChangeSize(this.element, $newHeight$jscomp$1$$, void 0);
};
$JSCompiler_prototypeAlias$$.attemptChangeSize = function($newHeight$jscomp$2$$, $newWidth$$, $opt_event$$) {
  return $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).requestChangeSize(this.element, $newHeight$jscomp$2$$, $newWidth$$, void 0, $opt_event$$);
};
$JSCompiler_prototypeAlias$$.measureElement = function($measurer$$) {
  return $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).measureElement($measurer$$);
};
$JSCompiler_prototypeAlias$$.mutateElement = function($mutator$$, $opt_element$jscomp$12$$) {
  return this.measureMutateElement(null, $mutator$$, $opt_element$jscomp$12$$);
};
$JSCompiler_prototypeAlias$$.measureMutateElement = function($measurer$jscomp$1$$, $mutator$jscomp$1$$, $opt_element$jscomp$13$$) {
  return $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).measureMutateElement($opt_element$jscomp$13$$ || this.element, $measurer$jscomp$1$$, $mutator$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.mutateElementSkipRemeasure = function($mutator$jscomp$2$$) {
  return $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).mutateElement(this.element, $mutator$jscomp$2$$, !0);
};
$JSCompiler_prototypeAlias$$.collapsedCallback = function() {
};
$JSCompiler_prototypeAlias$$.expand = function() {
  $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).expandElement(this.element);
};
$JSCompiler_prototypeAlias$$.expandedCallback = function() {
};
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function() {
};
$JSCompiler_prototypeAlias$$.onLayoutMeasure = function() {
};
$JSCompiler_prototypeAlias$$.onMeasureChanged = function() {
};
$JSCompiler_prototypeAlias$$.user = function() {
  return $user$$module$src$log$$(this.element);
};
function $BaseTemplate$$module$src$service$template_impl$$($element$jscomp$84$$, $win$jscomp$85$$) {
  this.element = $element$jscomp$84$$;
  this.win = $element$jscomp$84$$.ownerDocument.defaultView || $win$jscomp$85$$;
  this.$viewer_$ = $Services$$module$src$services$viewerForDoc$$(this.element);
  this.compileCallback();
}
$JSCompiler_prototypeAlias$$ = $BaseTemplate$$module$src$service$template_impl$$.prototype;
$JSCompiler_prototypeAlias$$.compileCallback = function() {
};
$JSCompiler_prototypeAlias$$.setHtml = function() {
  throw Error("Not implemented");
};
$JSCompiler_prototypeAlias$$.render = function() {
  throw Error("Not implemented");
};
$JSCompiler_prototypeAlias$$.unwrap = function($root$jscomp$13$$) {
  for (var $singleElement$$ = null, $n$jscomp$7$$ = $root$jscomp$13$$.firstChild; null != $n$jscomp$7$$; $n$jscomp$7$$ = $n$jscomp$7$$.nextSibling) {
    if (3 == $n$jscomp$7$$.nodeType) {
      if ($n$jscomp$7$$.textContent.trim()) {
        $singleElement$$ = null;
        break;
      }
    } else {
      if (8 != $n$jscomp$7$$.nodeType) {
        if (1 == $n$jscomp$7$$.nodeType) {
          if ($singleElement$$) {
            $singleElement$$ = null;
            break;
          } else {
            $singleElement$$ = $n$jscomp$7$$;
          }
        } else {
          $singleElement$$ = null;
        }
      }
    }
  }
  return $singleElement$$ || $root$jscomp$13$$;
};
$JSCompiler_prototypeAlias$$.viewerCanRenderTemplates = function() {
  return this.$viewer_$.hasCapability("viewerRenderTemplate");
};
function $Templates$$module$src$service$template_impl$$($win$jscomp$86$$) {
  this.$win_$ = $win$jscomp$86$$;
  this.$templateClassMap_$ = {};
  this.$templateClassResolvers_$ = {};
}
$JSCompiler_prototypeAlias$$ = $Templates$$module$src$service$template_impl$$.prototype;
$JSCompiler_prototypeAlias$$.setHtmlForTemplate = function($templateElement$$, $html$jscomp$1$$) {
  return $JSCompiler_StaticMethods_getImplementation_$$(this, $templateElement$$).then(function($templateElement$$) {
    return $templateElement$$.setHtml($html$jscomp$1$$);
  });
};
$JSCompiler_prototypeAlias$$.renderTemplate = function($templateElement$jscomp$1$$, $data$jscomp$78$$) {
  return $JSCompiler_StaticMethods_getImplementation_$$(this, $templateElement$jscomp$1$$).then(function($templateElement$jscomp$1$$) {
    return $templateElement$jscomp$1$$.render($data$jscomp$78$$);
  });
};
$JSCompiler_prototypeAlias$$.renderTemplateArray = function($templateElement$jscomp$2$$, $array$jscomp$10$$) {
  return 0 == $array$jscomp$10$$.length ? Promise.resolve([]) : $JSCompiler_StaticMethods_getImplementation_$$(this, $templateElement$jscomp$2$$).then(function($templateElement$jscomp$2$$) {
    return $array$jscomp$10$$.map(function($array$jscomp$10$$) {
      return $templateElement$jscomp$2$$.render($array$jscomp$10$$);
    });
  });
};
$JSCompiler_prototypeAlias$$.findAndRenderTemplate = function($parent$jscomp$16$$, $data$jscomp$79$$, $opt_querySelector$$) {
  return this.renderTemplate(this.findTemplate($parent$jscomp$16$$, $opt_querySelector$$), $data$jscomp$79$$);
};
$JSCompiler_prototypeAlias$$.findAndSetHtmlForTemplate = function($parent$jscomp$17$$, $html$jscomp$2$$, $opt_querySelector$jscomp$1$$) {
  return this.setHtmlForTemplate(this.findTemplate($parent$jscomp$17$$, $opt_querySelector$jscomp$1$$), $html$jscomp$2$$);
};
$JSCompiler_prototypeAlias$$.findAndRenderTemplateArray = function($parent$jscomp$18$$, $array$jscomp$11$$, $opt_querySelector$jscomp$2$$) {
  return this.renderTemplateArray(this.findTemplate($parent$jscomp$18$$, $opt_querySelector$jscomp$2$$), $array$jscomp$11$$);
};
$JSCompiler_prototypeAlias$$.hasTemplate = function($parent$jscomp$19$$, $opt_querySelector$jscomp$3$$) {
  return !!this.maybeFindTemplate($parent$jscomp$19$$, $opt_querySelector$jscomp$3$$);
};
$JSCompiler_prototypeAlias$$.findTemplate = function($parent$jscomp$20$$, $opt_querySelector$jscomp$4_templateElement$jscomp$3$$) {
  $opt_querySelector$jscomp$4_templateElement$jscomp$3$$ = this.maybeFindTemplate($parent$jscomp$20$$, $opt_querySelector$jscomp$4_templateElement$jscomp$3$$);
  $userAssert$$module$src$log$$($opt_querySelector$jscomp$4_templateElement$jscomp$3$$, "Template not found for %s", $parent$jscomp$20$$);
  var $templateTagName$$ = $opt_querySelector$jscomp$4_templateElement$jscomp$3$$.tagName;
  $userAssert$$module$src$log$$("TEMPLATE" == $templateTagName$$ || "SCRIPT" == $templateTagName$$ && "text/plain" === $opt_querySelector$jscomp$4_templateElement$jscomp$3$$.getAttribute("type"), 'Template must be defined in a <template> or <script type="text/plain"> tag');
  return $opt_querySelector$jscomp$4_templateElement$jscomp$3$$;
};
$JSCompiler_prototypeAlias$$.maybeFindTemplate = function($parent$jscomp$21$$, $opt_querySelector$jscomp$5$$) {
  var $templateId$$ = $parent$jscomp$21$$.getAttribute("template");
  return $templateId$$ ? $rootNodeFor$$module$src$dom$$($parent$jscomp$21$$).getElementById($templateId$$) : $opt_querySelector$jscomp$5$$ ? $scopedQuerySelector$$module$src$dom$$($parent$jscomp$21$$, $opt_querySelector$jscomp$5$$) : $parent$jscomp$21$$.querySelector('template, script[type="text/plain"]');
};
function $JSCompiler_StaticMethods_getImplementation_$$($JSCompiler_StaticMethods_getImplementation_$self$$, $element$jscomp$85$$) {
  var $impl$jscomp$3_type$jscomp$149$$ = $element$jscomp$85$$.__AMP_IMPL_;
  if ($impl$jscomp$3_type$jscomp$149$$) {
    return Promise.resolve($impl$jscomp$3_type$jscomp$149$$);
  }
  $impl$jscomp$3_type$jscomp$149$$ = "";
  var $promise$jscomp$14_tagName$jscomp$15$$ = $element$jscomp$85$$.tagName;
  "TEMPLATE" == $promise$jscomp$14_tagName$jscomp$15$$ ? $impl$jscomp$3_type$jscomp$149$$ = $element$jscomp$85$$.getAttribute("type") : "SCRIPT" == $promise$jscomp$14_tagName$jscomp$15$$ && ($impl$jscomp$3_type$jscomp$149$$ = $element$jscomp$85$$.getAttribute("template"));
  $userAssert$$module$src$log$$($impl$jscomp$3_type$jscomp$149$$, "Type must be specified: %s", $element$jscomp$85$$);
  if ($promise$jscomp$14_tagName$jscomp$15$$ = $element$jscomp$85$$.__AMP_WAIT_) {
    return $promise$jscomp$14_tagName$jscomp$15$$;
  }
  $promise$jscomp$14_tagName$jscomp$15$$ = $JSCompiler_StaticMethods_waitForTemplateClass_$$($JSCompiler_StaticMethods_getImplementation_$self$$, $impl$jscomp$3_type$jscomp$149$$).then(function($impl$jscomp$3_type$jscomp$149$$) {
    var $promise$jscomp$14_tagName$jscomp$15$$ = $element$jscomp$85$$.__AMP_IMPL_ = new $impl$jscomp$3_type$jscomp$149$$($element$jscomp$85$$, $JSCompiler_StaticMethods_getImplementation_$self$$.$win_$);
    delete $element$jscomp$85$$.__AMP_WAIT_;
    return $promise$jscomp$14_tagName$jscomp$15$$;
  });
  return $element$jscomp$85$$.__AMP_WAIT_ = $promise$jscomp$14_tagName$jscomp$15$$;
}
function $JSCompiler_StaticMethods_waitForTemplateClass_$$($JSCompiler_StaticMethods_waitForTemplateClass_$self$$, $type$jscomp$150$$) {
  if ($JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$templateClassMap_$[$type$jscomp$150$$]) {
    return $JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$templateClassMap_$[$type$jscomp$150$$];
  }
  var $$jscomp$destructuring$var37_resolve$jscomp$17$$ = new $Deferred$$module$src$utils$promise$$, $promise$jscomp$15$$ = $$jscomp$destructuring$var37_resolve$jscomp$17$$.promise;
  $$jscomp$destructuring$var37_resolve$jscomp$17$$ = $$jscomp$destructuring$var37_resolve$jscomp$17$$.resolve;
  $JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$templateClassMap_$[$type$jscomp$150$$] = $promise$jscomp$15$$;
  $JSCompiler_StaticMethods_waitForTemplateClass_$self$$.$templateClassResolvers_$[$type$jscomp$150$$] = $$jscomp$destructuring$var37_resolve$jscomp$17$$;
  return $promise$jscomp$15$$;
}
;var $VisibilityState$$module$src$visibility_state$$ = {PRERENDER:"prerender", VISIBLE:"visible", HIDDEN:"hidden", PAUSED:"paused", INACTIVE:"inactive"};
/*

 Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 Use of this source code is governed by a BSD-style
 license that can be found in the LICENSE file or at
 https://developers.google.com/open-source/licenses/bsd */
var $shadowDomSupportedVersion$$module$src$web_components$$;
function $getShadowDomSupportedVersion$$module$src$web_components$$() {
  if (void 0 === $shadowDomSupportedVersion$$module$src$web_components$$) {
    var $JSCompiler_element$jscomp$inline_350$$ = Element;
    $shadowDomSupportedVersion$$module$src$web_components$$ = $JSCompiler_element$jscomp$inline_350$$.prototype.attachShadow ? "v1" : $JSCompiler_element$jscomp$inline_350$$.prototype.createShadowRoot ? "v0" : "none";
  }
  return $shadowDomSupportedVersion$$module$src$web_components$$;
}
;var $SERVICES$$module$src$render_delaying_services$$ = {"amp-dynamic-css-classes":"[custom-element=amp-dynamic-css-classes]", variant:"amp-experiment", "amp-story-render":"amp-story[standalone]"};
function $waitForServices$$module$src$render_delaying_services$$($win$jscomp$91$$) {
  var $promises$jscomp$3$$ = $includedServices$$module$src$render_delaying_services$$($win$jscomp$91$$).map(function($promises$jscomp$3$$) {
    var $serviceId$$ = $getServicePromiseInternal$$module$src$service$$($win$jscomp$91$$, $promises$jscomp$3$$).then(function($win$jscomp$91$$) {
      return $win$jscomp$91$$ && "function" == typeof $win$jscomp$91$$.whenReady ? $win$jscomp$91$$.whenReady().then(function() {
        return $win$jscomp$91$$;
      }) : $win$jscomp$91$$;
    });
    return $Services$$module$src$services$timerFor$$($win$jscomp$91$$).timeoutPromise(3000, $serviceId$$, "Render timeout waiting for service " + $promises$jscomp$3$$ + " to be ready.");
  });
  return Promise.all($promises$jscomp$3$$);
}
function $includedServices$$module$src$render_delaying_services$$($win$jscomp$93$$) {
  var $doc$jscomp$10$$ = $win$jscomp$93$$.document;
  $devAssert$$module$src$log$$($doc$jscomp$10$$.body);
  return Object.keys($SERVICES$$module$src$render_delaying_services$$).filter(function($win$jscomp$93$$) {
    return $doc$jscomp$10$$.querySelector($SERVICES$$module$src$render_delaying_services$$[$win$jscomp$93$$]);
  });
}
;function $installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$12$$, $cssText$jscomp$3$$, $cb$jscomp$1$$, $opt_isRuntimeCss$$, $opt_ext$$) {
  var $cssRoot$$ = $ampdoc$jscomp$12$$.getHeadNode(), $style$jscomp$7$$ = $insertStyleElement$$module$src$style_installer$$($cssRoot$$, $maybeTransform$$module$src$style_installer$$($cssRoot$$, $cssText$jscomp$3$$), $opt_isRuntimeCss$$ || !1, $opt_ext$$ || null);
  if ($cb$jscomp$1$$) {
    var $rootNode$jscomp$1$$ = $ampdoc$jscomp$12$$.getRootNode();
    if ($styleLoaded$$module$src$style_installer$$($rootNode$jscomp$1$$, $style$jscomp$7$$)) {
      $cb$jscomp$1$$($style$jscomp$7$$);
    } else {
      var $interval$jscomp$1$$ = setInterval(function() {
        $styleLoaded$$module$src$style_installer$$($rootNode$jscomp$1$$, $style$jscomp$7$$) && (clearInterval($interval$jscomp$1$$), $cb$jscomp$1$$($style$jscomp$7$$));
      }, 4);
    }
  }
}
function $insertStyleElement$$module$src$style_installer$$($cssRoot$jscomp$1$$, $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$, $isRuntimeCss$$, $ext$$) {
  var $styleMap$$ = $cssRoot$jscomp$1$$.__AMP_CSS_SM;
  $styleMap$$ || ($styleMap$$ = $cssRoot$jscomp$1$$.__AMP_CSS_SM = $map$$module$src$utils$object$$());
  var $isExtCss$$ = !$isRuntimeCss$$ && $ext$$ && "amp-custom" != $ext$$ && "amp-keyframes" != $ext$$, $key$jscomp$52$$ = $isRuntimeCss$$ ? "amp-runtime" : $isExtCss$$ ? "amp-extension=" + $ext$$ : null;
  if ($key$jscomp$52$$) {
    var $existing$$ = $getExistingStyleElement$$module$src$style_installer$$($cssRoot$jscomp$1$$, $styleMap$$, $key$jscomp$52$$);
    if ($existing$$) {
      return $existing$$.textContent !== $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$ && ($existing$$.textContent = $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$), $existing$$;
    }
  }
  var $style$jscomp$9$$ = ($cssRoot$jscomp$1$$.ownerDocument || $cssRoot$jscomp$1$$).createElement("style");
  $style$jscomp$9$$.textContent = $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$;
  var $afterElement$$ = null;
  $isRuntimeCss$$ ? $style$jscomp$9$$.setAttribute("amp-runtime", "") : $isExtCss$$ ? ($style$jscomp$9$$.setAttribute("amp-extension", $ext$$ || ""), $afterElement$$ = $getExistingStyleElement$$module$src$style_installer$$($cssRoot$jscomp$1$$, $styleMap$$, "amp-runtime")) : ($ext$$ && $style$jscomp$9$$.setAttribute($ext$$, ""), $afterElement$$ = $cssRoot$jscomp$1$$.lastChild);
  $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$ = $afterElement$$;
  ($JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$ = void 0 === $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$ ? null : $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$) ? $cssRoot$jscomp$1$$.insertBefore($style$jscomp$9$$, $JSCompiler_after$jscomp$inline_354_cssText$jscomp$5$$.nextSibling) : $cssRoot$jscomp$1$$.insertBefore($style$jscomp$9$$, $cssRoot$jscomp$1$$.firstChild);
  $key$jscomp$52$$ && ($styleMap$$[$key$jscomp$52$$] = $style$jscomp$9$$);
  return $style$jscomp$9$$;
}
function $getExistingStyleElement$$module$src$style_installer$$($cssRoot$jscomp$2_existing$jscomp$1$$, $styleMap$jscomp$1$$, $key$jscomp$53$$) {
  return $styleMap$jscomp$1$$[$key$jscomp$53$$] ? $styleMap$jscomp$1$$[$key$jscomp$53$$] : ($cssRoot$jscomp$2_existing$jscomp$1$$ = $cssRoot$jscomp$2_existing$jscomp$1$$.querySelector("style[" + $key$jscomp$53$$ + "]")) ? $styleMap$jscomp$1$$[$key$jscomp$53$$] = $cssRoot$jscomp$2_existing$jscomp$1$$ : null;
}
function $maybeTransform$$module$src$style_installer$$($cssRoot$jscomp$4_transformer$jscomp$2$$, $cssText$jscomp$6$$) {
  return ($cssRoot$jscomp$4_transformer$jscomp$2$$ = $cssRoot$jscomp$4_transformer$jscomp$2$$.__AMP_CSS_TR) ? $cssRoot$jscomp$4_transformer$jscomp$2$$($cssText$jscomp$6$$) : $cssText$jscomp$6$$;
}
var $bodyMadeVisible$$module$src$style_installer$$ = !1;
function $makeBodyVisible$$module$src$style_installer$$() {
  var $doc$jscomp$13$$ = self.document;
  $devAssert$$module$src$log$$($doc$jscomp$13$$.defaultView);
  var $win$jscomp$94$$ = $doc$jscomp$13$$.defaultView;
  $waitForBodyOpenPromise$$module$src$dom$$($doc$jscomp$13$$).then(function() {
    return $waitForServices$$module$src$render_delaying_services$$($win$jscomp$94$$);
  }).catch(function($doc$jscomp$13$$) {
    $rethrowAsync$$module$src$log$$($doc$jscomp$13$$);
    return [];
  }).then(function($services$jscomp$7$$) {
    $bodyMadeVisible$$module$src$style_installer$$ = !0;
    $setBodyVisibleStyles$$module$src$style_installer$$($doc$jscomp$13$$);
    $getAmpdoc$$module$src$service$$($doc$jscomp$13$$).signals().signal("render-start");
    0 < $services$jscomp$7$$.length && $Services$$module$src$services$resourcesForDoc$$($doc$jscomp$13$$.documentElement).schedulePass(1, !0);
    try {
      var $perf$$ = $getService$$module$src$service$$($win$jscomp$94$$, "performance");
      $perf$$.tick("mbv");
      $perf$$.flush();
    } catch ($e$jscomp$29$$) {
    }
  });
}
function $makeBodyVisibleRecovery$$module$src$style_installer$$($doc$jscomp$14$$) {
  $devAssert$$module$src$log$$($doc$jscomp$14$$.defaultView);
  $bodyMadeVisible$$module$src$style_installer$$ || ($bodyMadeVisible$$module$src$style_installer$$ = !0, $setBodyVisibleStyles$$module$src$style_installer$$($doc$jscomp$14$$));
}
function $setBodyVisibleStyles$$module$src$style_installer$$($doc$jscomp$15$$) {
  $setStyles$$module$src$style$$($doc$jscomp$15$$.body, {opacity:1, visibility:"visible", animation:"none"});
}
function $styleLoaded$$module$src$style_installer$$($doc$jscomp$16_i$jscomp$38$$, $style$jscomp$10$$) {
  var $sheets$$ = $doc$jscomp$16_i$jscomp$38$$.styleSheets;
  for ($doc$jscomp$16_i$jscomp$38$$ = 0; $doc$jscomp$16_i$jscomp$38$$ < $sheets$$.length; $doc$jscomp$16_i$jscomp$38$$++) {
    if ($sheets$$[$doc$jscomp$16_i$jscomp$38$$].ownerNode == $style$jscomp$10$$) {
      return !0;
    }
  }
  return !1;
}
;var $UNCOMPOSED_SEARCH$$module$src$shadow_embed$$ = {composed:!1};
function $getShadowRootNode$$module$src$shadow_embed$$($node$jscomp$15$$) {
  return "none" != $getShadowDomSupportedVersion$$module$src$web_components$$() && Node.prototype.getRootNode ? $node$jscomp$15$$.getRootNode($UNCOMPOSED_SEARCH$$module$src$shadow_embed$$) : $closestNode$$module$src$dom$$($node$jscomp$15$$, function($node$jscomp$15$$) {
    return $isShadowRoot$$module$src$dom$$($node$jscomp$15$$);
  });
}
;var $cssText$$module$build$ampdoc_css$$ = "html{overflow-x:hidden!important}html.i-amphtml-fie{height:100%!important;width:100%!important}html:not([amp4ads]),html:not([amp4ads]) body{height:auto!important}html:not([amp4ads]) body{margin:0!important}body{-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;-ms-text-size-adjust:100%;text-size-adjust:100%}html.i-amphtml-singledoc.i-amphtml-embedded{-ms-touch-action:pan-y;touch-action:pan-y}html.i-amphtml-fie>body,html.i-amphtml-singledoc>body{overflow:visible!important}html.i-amphtml-fie:not(.i-amphtml-inabox)>body,html.i-amphtml-singledoc:not(.i-amphtml-inabox)>body{position:relative!important}html.i-amphtml-webview>body{overflow-x:hidden!important;overflow-y:visible!important;min-height:100vh!important}html.i-amphtml-ios-embed-legacy>body{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important}html.i-amphtml-ios-embed{overflow-y:auto!important;position:static}#i-amphtml-wrapper{overflow-x:hidden!important;overflow-y:auto!important;position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;margin:0!important;display:block!important}html.i-amphtml-ios-embed.i-amphtml-ios-overscroll,html.i-amphtml-ios-embed.i-amphtml-ios-overscroll>#i-amphtml-wrapper{-webkit-overflow-scrolling:touch!important}#i-amphtml-wrapper>body{position:relative!important;border-top:1px solid transparent!important}#i-amphtml-wrapper+body{visibility:visible}#i-amphtml-wrapper+body .i-amphtml-lightbox-element,#i-amphtml-wrapper+body[i-amphtml-lightbox]{visibility:hidden}#i-amphtml-wrapper+body[i-amphtml-lightbox] .i-amphtml-lightbox-element{visibility:visible}#i-amphtml-wrapper.i-amphtml-scroll-disabled,.i-amphtml-scroll-disabled{overflow-x:hidden!important;overflow-y:hidden!important}amp-instagram{padding:54px 0px 0px!important;background-color:#fff}amp-iframe iframe{box-sizing:border-box!important}[amp-access][amp-access-hide]{display:none}[subscriptions-dialog],body:not(.i-amphtml-subs-ready) [subscriptions-action],body:not(.i-amphtml-subs-ready) [subscriptions-section]{display:none!important}amp-experiment,amp-live-list>[update],amp-share-tracking{display:none}.i-amphtml-jank-meter{position:fixed;background-color:rgba(232,72,95,0.5);bottom:0;right:0;color:#fff;font-size:16px;z-index:1000;padding:5px}amp-list[resizable-children]>.i-amphtml-loading-container.amp-hidden{display:none!important}amp-list [fetch-error],amp-list[load-more] [load-more-button],amp-list[load-more] [load-more-end],amp-list[load-more] [load-more-failed],amp-list[load-more] [load-more-loading]{display:none}amp-list[diffable] div[role=list]{display:block}amp-story-page,amp-story[standalone]{min-height:1px!important;display:block!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;width:100%!important}amp-story[standalone]{background-color:#202125!important;position:relative!important}amp-story-page{background-color:#757575}amp-story .amp-active>div{display:none!important}amp-story-page:not(:first-of-type):not([distance]):not([active]){transform:translateY(1000vh)!important}amp-autocomplete{position:relative!important;display:inline-block!important}amp-autocomplete>input,amp-autocomplete>textarea{padding:0.5rem;border:1px solid rgba(0,0,0,0.33)}.i-amphtml-autocomplete-results,amp-autocomplete>input,amp-autocomplete>textarea{font-size:1rem;line-height:1.5rem}[amp-fx^=fly-in]{visibility:hidden}\n/*# sourceURL=/css/ampdoc.css*/";
var $cssText$$module$build$ampshared_css$$ = "[hidden]{display:none!important}.i-amphtml-element{display:inline-block}.i-amphtml-blurry-placeholder{transition:opacity 0.3s cubic-bezier(0.0,0.0,0.2,1)!important;pointer-events:none}[layout=nodisplay]:not(.i-amphtml-element){display:none!important}.i-amphtml-layout-fixed,[layout=fixed][width][height]:not(.i-amphtml-layout-fixed){display:inline-block;position:relative}.i-amphtml-layout-responsive,[layout=responsive][width][height]:not(.i-amphtml-layout-responsive),[width][height][heights]:not([layout]):not(.i-amphtml-layout-responsive),[width][height][sizes]:not([layout]):not(.i-amphtml-layout-responsive){display:block;position:relative}.i-amphtml-layout-intrinsic,[layout=intrinsic][width][height]:not(.i-amphtml-layout-intrinsic){display:inline-block;position:relative;max-width:100%}.i-amphtml-layout-intrinsic .i-amphtml-sizer{max-width:100%}.i-amphtml-intrinsic-sizer{max-width:100%;display:block!important}.i-amphtml-layout-container,.i-amphtml-layout-fixed-height,[layout=container],[layout=fixed-height][height]:not(.i-amphtml-layout-fixed-height){display:block;position:relative}.i-amphtml-layout-fill,[layout=fill]:not(.i-amphtml-layout-fill){display:block;overflow:hidden!important;position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-layout-flex-item,[layout=flex-item]:not(.i-amphtml-layout-flex-item){display:block;position:relative;-ms-flex:1 1 auto;flex:1 1 auto}.i-amphtml-layout-fluid{position:relative}.i-amphtml-layout-size-defined{overflow:hidden!important}.i-amphtml-layout-awaiting-size{position:absolute!important;top:auto!important;bottom:auto!important}i-amphtml-sizer{display:block!important}.i-amphtml-blurry-placeholder,.i-amphtml-fill-content{display:block;height:0;max-height:100%;max-width:100%;min-height:100%;min-width:100%;width:0;margin:auto}.i-amphtml-layout-size-defined .i-amphtml-fill-content{position:absolute;top:0;left:0;bottom:0;right:0}.i-amphtml-replaced-content,.i-amphtml-screen-reader{padding:0!important;border:none!important}.i-amphtml-screen-reader{position:fixed!important;top:0px!important;left:0px!important;width:4px!important;height:4px!important;opacity:0!important;overflow:hidden!important;margin:0!important;display:block!important;visibility:visible!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:8px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:12px!important}.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader~.i-amphtml-screen-reader{left:16px!important}.i-amphtml-unresolved{position:relative;overflow:hidden!important}.i-amphtml-select-disabled{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;user-select:none!important}.i-amphtml-notbuilt,[layout]:not(.i-amphtml-element),[width][height][heights]:not([layout]):not(.i-amphtml-element),[width][height][sizes]:not([layout]):not(.i-amphtml-element){position:relative;overflow:hidden!important;color:transparent!important}.i-amphtml-notbuilt:not(.i-amphtml-layout-container)>*,[layout]:not([layout=container]):not(.i-amphtml-element)>*,[width][height][heights]:not([layout]):not(.i-amphtml-element)>*,[width][height][sizes]:not([layout]):not(.i-amphtml-element)>*{display:none}.i-amphtml-ghost{visibility:hidden!important}.i-amphtml-element>[placeholder],[layout]:not(.i-amphtml-element)>[placeholder],[width][height][heights]:not([layout]):not(.i-amphtml-element)>[placeholder],[width][height][sizes]:not([layout]):not(.i-amphtml-element)>[placeholder]{display:block}.i-amphtml-element>[placeholder].amp-hidden,.i-amphtml-element>[placeholder].hidden{visibility:hidden}.i-amphtml-element:not(.amp-notsupported)>[fallback],.i-amphtml-layout-container>[placeholder].amp-hidden,.i-amphtml-layout-container>[placeholder].hidden{display:none}.i-amphtml-layout-size-defined>[fallback],.i-amphtml-layout-size-defined>[placeholder]{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;z-index:1}.i-amphtml-notbuilt>[placeholder]{display:block!important}.i-amphtml-hidden-by-media-query{display:none!important}.i-amphtml-element-error{background:red!important;color:#fff!important;position:relative!important}.i-amphtml-element-error:before{content:attr(error-message)}i-amp-scroll-container,i-amphtml-scroll-container{position:absolute;top:0;left:0;right:0;bottom:0;display:block}i-amp-scroll-container.amp-active,i-amphtml-scroll-container.amp-active{overflow:auto;-webkit-overflow-scrolling:touch}.i-amphtml-loading-container{display:block!important;pointer-events:none;z-index:1}.i-amphtml-notbuilt>.i-amphtml-loading-container{display:block!important}.i-amphtml-loading-container.amp-hidden{visibility:hidden}.i-amphtml-element>[overflow]{cursor:pointer;position:relative;z-index:2;visibility:hidden;display:initial}.i-amphtml-element>[overflow].amp-visible{visibility:visible}template{display:none!important}.amp-border-box,.amp-border-box *,.amp-border-box :after,.amp-border-box :before{box-sizing:border-box}amp-pixel{display:none!important}amp-analytics,amp-story-auto-ads{position:fixed!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important;visibility:hidden}html.i-amphtml-fie>amp-analytics{position:initial!important}[visible-when-invalid]:not(.visible),form [submit-error],form [submit-success],form [submitting]{display:none}amp-accordion{display:block!important}amp-accordion>section{float:none!important}amp-accordion>section>*{float:none!important;display:block!important;overflow:hidden!important;position:relative!important}amp-accordion,amp-accordion>section{margin:0}amp-accordion>section>:last-child{display:none!important}amp-accordion>section[expanded]>:last-child{display:block!important}\n/*# sourceURL=/css/ampshared.css*/";
function $throttle$$module$src$utils$rate_limit$$($win$jscomp$100$$, $callback$jscomp$67$$, $minInterval$$) {
  function $fire$$($fire$$) {
    $nextCallArgs$$ = null;
    $locker$$ = $win$jscomp$100$$.setTimeout($waiter$$, $minInterval$$);
    $callback$jscomp$67$$.apply(null, $fire$$);
  }
  function $waiter$$() {
    $locker$$ = 0;
    $nextCallArgs$$ && $fire$$($nextCallArgs$$);
  }
  var $locker$$ = 0, $nextCallArgs$$ = null;
  return function($win$jscomp$100$$) {
    for (var $callback$jscomp$67$$ = [], $minInterval$$ = 0; $minInterval$$ < arguments.length; ++$minInterval$$) {
      $callback$jscomp$67$$[$minInterval$$ - 0] = arguments[$minInterval$$];
    }
    $locker$$ ? $nextCallArgs$$ = $callback$jscomp$67$$ : $fire$$($callback$jscomp$67$$);
  };
}
function $debounce$$module$src$utils$rate_limit$$($win$jscomp$101$$, $callback$jscomp$68$$) {
  function $waiter$jscomp$1$$() {
    $locker$jscomp$1$$ = 0;
    var $remaining$$ = 300 - ($win$jscomp$101$$.Date.now() - $timestamp$$);
    if (0 < $remaining$$) {
      $locker$jscomp$1$$ = $win$jscomp$101$$.setTimeout($waiter$jscomp$1$$, $remaining$$);
    } else {
      var $JSCompiler_args$jscomp$inline_356$$ = $nextCallArgs$jscomp$1$$;
      $nextCallArgs$jscomp$1$$ = null;
      $callback$jscomp$68$$.apply(null, $JSCompiler_args$jscomp$inline_356$$);
    }
  }
  var $locker$jscomp$1$$ = 0, $timestamp$$ = 0, $nextCallArgs$jscomp$1$$ = null;
  return function($callback$jscomp$68$$) {
    for (var $args$jscomp$6$$ = [], $$jscomp$restIndex$jscomp$2$$ = 0; $$jscomp$restIndex$jscomp$2$$ < arguments.length; ++$$jscomp$restIndex$jscomp$2$$) {
      $args$jscomp$6$$[$$jscomp$restIndex$jscomp$2$$ - 0] = arguments[$$jscomp$restIndex$jscomp$2$$];
    }
    $timestamp$$ = $win$jscomp$101$$.Date.now();
    $nextCallArgs$jscomp$1$$ = $args$jscomp$6$$;
    $locker$jscomp$1$$ || ($locker$jscomp$1$$ = $win$jscomp$101$$.setTimeout($waiter$jscomp$1$$, 300));
  };
}
;function $isAmpFormatType$$module$src$format$$($formats$$, $doc$jscomp$24$$) {
  var $html$jscomp$4$$ = $doc$jscomp$24$$.documentElement;
  return $formats$$.some(function($formats$$) {
    return $html$jscomp$4$$.hasAttribute($formats$$);
  });
}
;function $exponentialBackoff$$module$src$exponential_backoff$$() {
  var $getTimeout$$ = $exponentialBackoffClock$$module$src$exponential_backoff$$();
  return function($work$$) {
    return setTimeout($work$$, $getTimeout$$());
  };
}
function $exponentialBackoffClock$$module$src$exponential_backoff$$() {
  var $count$jscomp$39$$ = 0;
  return function() {
    var $wait$$ = Math.pow(1.5, $count$jscomp$39$$++);
    var $JSCompiler_jitter$jscomp$inline_360_JSCompiler_opt_perc$jscomp$inline_359$$ = $wait$$ * ($JSCompiler_jitter$jscomp$inline_360_JSCompiler_opt_perc$jscomp$inline_359$$ || 0.3) * Math.random();
    0.5 < Math.random() && ($JSCompiler_jitter$jscomp$inline_360_JSCompiler_opt_perc$jscomp$inline_359$$ *= -1);
    $wait$$ += $JSCompiler_jitter$jscomp$inline_360_JSCompiler_opt_perc$jscomp$inline_359$$;
    return 1000 * $wait$$;
  };
}
;function $triggerAnalyticsEvent$$module$src$analytics$$($target$jscomp$98$$, $opt_vars$$) {
  $getElementServiceIfAvailableForDoc$$module$src$element_service$$($target$jscomp$98$$, "amp-analytics-instrumentation", "amp-analytics").then(function($analytics$$) {
    $analytics$$ && $analytics$$.triggerEventForTarget($target$jscomp$98$$, "user-error", $opt_vars$$);
  });
}
;var $accumulatedErrorMessages$$module$src$error$$ = self.__AMP_ERRORS || [];
self.__AMP_ERRORS = $accumulatedErrorMessages$$module$src$error$$;
function $reportingBackoff$$module$src$error$$($work$jscomp$1$$) {
  $reportingBackoff$$module$src$error$$ = $exponentialBackoff$$module$src$exponential_backoff$$();
  return $reportingBackoff$$module$src$error$$($work$jscomp$1$$);
}
function $tryJsonStringify$$module$src$error$$($value$jscomp$118$$) {
  try {
    return JSON.stringify($value$jscomp$118$$);
  } catch ($e$jscomp$31$$) {
    return String($value$jscomp$118$$);
  }
}
var $detectedJsEngine$$module$src$error$$;
function $reportError$$module$src$error$$($error$jscomp$17$$, $opt_associatedElement$jscomp$1$$) {
  try {
    if ($error$jscomp$17$$) {
      if (void 0 !== $error$jscomp$17$$.message) {
        $error$jscomp$17$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$17$$);
        var $isValidError$$ = !0;
      } else {
        var $origError$$ = $error$jscomp$17$$;
        $error$jscomp$17$$ = Error($tryJsonStringify$$module$src$error$$($origError$$));
        $error$jscomp$17$$.origError = $origError$$;
      }
    } else {
      $error$jscomp$17$$ = Error("Unknown error");
    }
    $isValidError$$ || !$getMode$$module$src$mode$$().localDev || $getMode$$module$src$mode$$().test || setTimeout(function() {
      throw Error("_reported_ Error reported incorrectly: " + $error$jscomp$17$$);
    });
    if ($error$jscomp$17$$.reported) {
      return $error$jscomp$17$$;
    }
    $error$jscomp$17$$.reported = !0;
    var $element$jscomp$90$$ = $opt_associatedElement$jscomp$1$$ || $error$jscomp$17$$.associatedElement;
    $element$jscomp$90$$ && $element$jscomp$90$$.classList && ($element$jscomp$90$$.classList.add("i-amphtml-error"), $getMode$$module$src$mode$$().development && ($element$jscomp$90$$.classList.add("i-amphtml-element-error"), $element$jscomp$90$$.setAttribute("error-message", $error$jscomp$17$$.message)));
    if (self.console) {
      var $output$jscomp$3$$ = console.error || console.log;
      $error$jscomp$17$$.messageArray ? $output$jscomp$3$$.apply(console, $error$jscomp$17$$.messageArray) : $element$jscomp$90$$ ? $output$jscomp$3$$.call(console, $error$jscomp$17$$.message, $element$jscomp$90$$) : $getMode$$module$src$mode$$().minified ? $output$jscomp$3$$.call(console, $error$jscomp$17$$.message) : $output$jscomp$3$$.call(console, $error$jscomp$17$$.stack);
    }
    $element$jscomp$90$$ && $element$jscomp$90$$.$dispatchCustomEventForTesting$ && $element$jscomp$90$$.$dispatchCustomEventForTesting$("amp:error", $error$jscomp$17$$.message);
    $onError$$module$src$error$$.call(void 0, void 0, void 0, void 0, void 0, $error$jscomp$17$$);
  } catch ($errorReportingError$$) {
    setTimeout(function() {
      throw $errorReportingError$$;
    });
  }
  return $error$jscomp$17$$;
}
function $isBlockedByConsent$$module$src$error$$($errorOrMessage$jscomp$1$$) {
  return $errorOrMessage$jscomp$1$$ ? "string" == typeof $errorOrMessage$jscomp$1$$ ? $startsWith$$module$src$string$$($errorOrMessage$jscomp$1$$, "BLOCK_BY_CONSENT") : "string" == typeof $errorOrMessage$jscomp$1$$.message ? $startsWith$$module$src$string$$($errorOrMessage$jscomp$1$$.message, "BLOCK_BY_CONSENT") : !1 : !1;
}
function $installErrorReporting$$module$src$error$$() {
  var $win$jscomp$103$$ = self;
  $win$jscomp$103$$.onerror = $onError$$module$src$error$$;
  $win$jscomp$103$$.addEventListener("unhandledrejection", function($win$jscomp$103$$) {
    !$win$jscomp$103$$.reason || "CANCELLED" !== $win$jscomp$103$$.reason.message && "BLOCK_BY_CONSENT" !== $win$jscomp$103$$.reason.message && "AbortError" !== $win$jscomp$103$$.reason.message ? $reportError$$module$src$error$$($win$jscomp$103$$.reason || Error("rejected promise " + $win$jscomp$103$$)) : $win$jscomp$103$$.preventDefault();
  });
}
function $onError$$module$src$error$$($message$jscomp$36$$, $filename$jscomp$2$$, $line$$, $col$$, $error$jscomp$18$$) {
  var $$jscomp$this$jscomp$16$$ = this;
  this && this.document && $makeBodyVisibleRecovery$$module$src$style_installer$$(this.document);
  if (!($getMode$$module$src$mode$$().localDev || $getMode$$module$src$mode$$().development || $getMode$$module$src$mode$$().test)) {
    var $hasNonAmpJs$$ = !1;
    try {
      $hasNonAmpJs$$ = $detectNonAmpJs$$module$src$error$$();
    } catch ($ignore$$) {
    }
    if (!($hasNonAmpJs$$ && 0.01 < Math.random())) {
      var $data$jscomp$83$$ = $getErrorReportData$$module$src$error$$($message$jscomp$36$$, $filename$jscomp$2$$, $line$$, $col$$, $error$jscomp$18$$, $hasNonAmpJs$$);
      $data$jscomp$83$$ && $reportingBackoff$$module$src$error$$(function() {
        try {
          return $reportErrorToServerOrViewer$$module$src$error$$($$jscomp$this$jscomp$16$$, $data$jscomp$83$$).catch(function() {
          });
        } catch ($e$jscomp$32$$) {
        }
      });
    }
  }
}
function $reportErrorToServerOrViewer$$module$src$error$$($win$jscomp$104$$, $data$jscomp$84$$) {
  return $data$jscomp$84$$.pt && 0.9 > Math.random() ? $resolvedPromise$$module$src$resolved_promise$$() : $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$104$$, $data$jscomp$84$$).then(function($win$jscomp$104$$) {
    if (!$win$jscomp$104$$) {
      var $reportedErrorToViewer$$ = new XMLHttpRequest;
      $reportedErrorToViewer$$.open("POST", 0.1 > Math.random() ? $urls$$module$src$config$$.betaErrorReporting : $urls$$module$src$config$$.errorReporting, !0);
      $reportedErrorToViewer$$.send(JSON.stringify($data$jscomp$84$$));
    }
  });
}
function $maybeReportErrorToViewer$$module$src$error$$($ampdocService$jscomp$2_win$jscomp$105$$, $data$jscomp$85$$) {
  $ampdocService$jscomp$2_win$jscomp$105$$ = $Services$$module$src$services$ampdocServiceFor$$($ampdocService$jscomp$2_win$jscomp$105$$);
  if (!$ampdocService$jscomp$2_win$jscomp$105$$.isSingleDoc()) {
    return Promise.resolve(!1);
  }
  var $ampdocSingle$$ = $ampdocService$jscomp$2_win$jscomp$105$$.getSingleDoc();
  if (!$ampdocSingle$$.getRootNode().documentElement.hasAttribute("report-errors-to-viewer")) {
    return Promise.resolve(!1);
  }
  var $viewer$jscomp$2$$ = $Services$$module$src$services$viewerForDoc$$($ampdocSingle$$);
  return $viewer$jscomp$2$$.hasCapability("errorReporter") ? $viewer$jscomp$2$$.isTrustedViewer().then(function($ampdocService$jscomp$2_win$jscomp$105$$) {
    if (!$ampdocService$jscomp$2_win$jscomp$105$$) {
      return !1;
    }
    $viewer$jscomp$2$$.sendMessage("error", $dict$$module$src$utils$object$$({m:$data$jscomp$85$$.m, a:$data$jscomp$85$$.a, s:$data$jscomp$85$$.s, el:$data$jscomp$85$$.el, ex:$data$jscomp$85$$.ex, v:$data$jscomp$85$$.v, pt:$data$jscomp$85$$.pt, jse:$data$jscomp$85$$.jse}));
    return !0;
  }) : Promise.resolve(!1);
}
function $getErrorReportData$$module$src$error$$($message$jscomp$38$$, $JSCompiler_element$jscomp$inline_371_filename$jscomp$3$$, $line$jscomp$1$$, $col$jscomp$1$$, $error$jscomp$20$$, $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$) {
  var $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$ = $message$jscomp$38$$;
  $error$jscomp$20$$ && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$ = $error$jscomp$20$$.message ? $error$jscomp$20$$.message : String($error$jscomp$20$$));
  $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$ || ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$ = "Unknown error");
  $message$jscomp$38$$ = $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$;
  var $expected$$ = !(!$error$jscomp$20$$ || !$error$jscomp$20$$.expected);
  if (!/_reported_/.test($message$jscomp$38$$) && "CANCELLED" != $message$jscomp$38$$) {
    var $detachedWindow$$ = !(self && self.window), $throttleBase$$ = Math.random();
    if (-1 != $message$jscomp$38$$.indexOf("Failed to load:") || "Script error." == $message$jscomp$38$$ || $detachedWindow$$) {
      if ($expected$$ = !0, 0.001 < $throttleBase$$) {
        return;
      }
    }
    var $isUserError$$ = $isUserErrorMessage$$module$src$log$$($message$jscomp$38$$);
    if (!($isUserError$$ && 0.1 < $throttleBase$$)) {
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$ = Object.create(null);
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.v = $getMode$$module$src$mode$$().rtvVersion;
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.noAmp = $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.m = $message$jscomp$38$$.replace("\u200b\u200b\u200b", "");
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.a = $isUserError$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.ex = $expected$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.dw = $detachedWindow$$ ? "1" : "0";
      var $runtime$$ = "1p";
      self.context && self.context.location ? ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$["3p"] = "1", $runtime$$ = "3p") : $getMode$$module$src$mode$$().runtime && ($runtime$$ = $getMode$$module$src$mode$$().runtime);
      $getMode$$module$src$mode$$().singlePassType && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.spt = $getMode$$module$src$mode$$().singlePassType);
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.rt = $runtime$$;
      "inabox" === $runtime$$ && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.adid = $getMode$$module$src$mode$$().a4aId);
      $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.ca = $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.canary ? "1" : "0";
      $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.bt = $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type ? $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type : "unknown";
      self.location.ancestorOrigins && self.location.ancestorOrigins[0] && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.or = self.location.ancestorOrigins[0]);
      self.viewerState && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.vs = self.viewerState);
      self.parent && self.parent != self && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.iem = "1");
      if (self.AMP && self.AMP.viewer) {
        var $resolvedViewerUrl$$ = self.AMP.viewer.getResolvedViewerUrl(), $messagingOrigin$$ = self.AMP.viewer.maybeGetMessagingOrigin();
        $resolvedViewerUrl$$ && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.rvu = $resolvedViewerUrl$$);
        $messagingOrigin$$ && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.mso = $messagingOrigin$$);
      }
      $detectedJsEngine$$module$src$error$$ || ($detectedJsEngine$$module$src$error$$ = $detectJsEngineFromStack$$module$src$error$$());
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.jse = $detectedJsEngine$$module$src$error$$;
      var $exps$$ = [];
      $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$ = self.__AMP__EXPERIMENT_TOGGLES || null;
      for (var $exp$$ in $JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$) {
        $exps$$.push($exp$$ + "=" + ($JSCompiler_inline_result$jscomp$140_JSCompiler_win$jscomp$inline_365_JSCompiler_win$jscomp$inline_367_hasNonAmpJs$jscomp$1$$[$exp$$] ? "1" : "0"));
      }
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.exps = $exps$$.join(",");
      $error$jscomp$20$$ ? ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.el = $error$jscomp$20$$.associatedElement ? $error$jscomp$20$$.associatedElement.tagName : "u", $error$jscomp$20$$.args && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.args = JSON.stringify($error$jscomp$20$$.args)), $isUserError$$ || $error$jscomp$20$$.ignoreStack || !$error$jscomp$20$$.stack || ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.s = $error$jscomp$20$$.stack), $error$jscomp$20$$.message && 
      ($error$jscomp$20$$.message += " _reported_")) : ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.f = $JSCompiler_element$jscomp$inline_371_filename$jscomp$3$$ || "", $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.l = $line$jscomp$1$$ || "", $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.c = $col$jscomp$1$$ || "");
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.r = self.document ? self.document.referrer : "";
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.ae = $accumulatedErrorMessages$$module$src$error$$.join(",");
      $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.fr = self.location.originalHash || self.location.hash;
      "production" === $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.rt && ($JSCompiler_message$jscomp$inline_362_data$jscomp$86$$.pt = "1");
      $JSCompiler_element$jscomp$inline_371_filename$jscomp$3$$ = $message$jscomp$38$$;
      25 <= $accumulatedErrorMessages$$module$src$error$$.length && $accumulatedErrorMessages$$module$src$error$$.splice(0, $accumulatedErrorMessages$$module$src$error$$.length - 25 + 1);
      $accumulatedErrorMessages$$module$src$error$$.push($JSCompiler_element$jscomp$inline_371_filename$jscomp$3$$);
      return $JSCompiler_message$jscomp$inline_362_data$jscomp$86$$;
    }
  }
}
function $detectNonAmpJs$$module$src$error$$() {
  var $scripts$jscomp$2_win$jscomp$106$$ = self;
  if (!$scripts$jscomp$2_win$jscomp$106$$.document) {
    return !1;
  }
  $scripts$jscomp$2_win$jscomp$106$$ = $scripts$jscomp$2_win$jscomp$106$$.document.querySelectorAll("script[src]");
  for (var $i$jscomp$41$$ = 0; $i$jscomp$41$$ < $scripts$jscomp$2_win$jscomp$106$$.length; $i$jscomp$41$$++) {
    if (!$isProxyOrigin$$module$src$url$$($scripts$jscomp$2_win$jscomp$106$$[$i$jscomp$41$$].src.toLowerCase())) {
      return !0;
    }
  }
  return !1;
}
function $detectJsEngineFromStack$$module$src$error$$() {
  function $Fn$$() {
  }
  $Fn$$.prototype.t = function() {
    throw Error("message");
  };
  var $object$jscomp$1_stack$jscomp$1$$ = new $Fn$$;
  try {
    $object$jscomp$1_stack$jscomp$1$$.t();
  } catch ($e$jscomp$33$$) {
    $object$jscomp$1_stack$jscomp$1$$ = $e$jscomp$33$$.stack;
    if ($startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "t@")) {
      return "Safari";
    }
    if (-1 < $object$jscomp$1_stack$jscomp$1$$.indexOf(".prototype.t@")) {
      return "Firefox";
    }
    var $last$$ = $object$jscomp$1_stack$jscomp$1$$.split("\n").pop();
    if (/\bat .* \(/i.test($last$$)) {
      return "IE";
    }
    if ($startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "Error: message")) {
      return "Chrome";
    }
  }
  return "unknown";
}
;var $ACTION_MAP_$$module$src$service$action_impl$$ = "__AMP_ACTION_MAP__" + Math.random(), $NON_AMP_ELEMENTS_ACTIONS_$$module$src$service$action_impl$$ = {form:["submit", "clear"]}, $DEFAULT_EMAIL_ALLOWLIST$$module$src$service$action_impl$$ = [{tagOrTarget:"AMP", method:"setState"}, {tagOrTarget:"*", method:"focus"}, {tagOrTarget:"*", method:"hide"}, {tagOrTarget:"*", method:"show"}, {tagOrTarget:"*", method:"toggleClass"}, {tagOrTarget:"*", method:"toggleVisibility"}], $TAPPABLE_ARIA_ROLES$$module$src$service$action_impl$$ = 
{button:!0, checkbox:!0, link:!0, listbox:!0, menuitem:!0, menuitemcheckbox:!0, menuitemradio:!0, option:!0, radio:!0, scrollbar:!0, slider:!0, spinbutton:!0, "switch":!0, tab:!0, treeitem:!0};
function $ActionInvocation$$module$src$service$action_impl$$($node$jscomp$16$$, $method$jscomp$4$$, $args$jscomp$7$$, $source$jscomp$15$$, $caller$$, $event$jscomp$11$$, $trust$$, $actionEventType$$, $tagOrTarget$$, $sequenceId$$) {
  $actionEventType$$ = void 0 === $actionEventType$$ ? "?" : $actionEventType$$;
  $tagOrTarget$$ = void 0 === $tagOrTarget$$ ? null : $tagOrTarget$$;
  $sequenceId$$ = void 0 === $sequenceId$$ ? Math.random() : $sequenceId$$;
  this.node = $node$jscomp$16$$;
  this.method = $method$jscomp$4$$;
  this.args = $args$jscomp$7$$;
  this.source = $source$jscomp$15$$;
  this.caller = $caller$$;
  this.event = $event$jscomp$11$$;
  this.trust = $trust$$;
  this.actionEventType = $actionEventType$$;
  this.tagOrTarget = $tagOrTarget$$ || $node$jscomp$16$$.tagName;
  this.sequenceId = $sequenceId$$;
}
$ActionInvocation$$module$src$service$action_impl$$.prototype.satisfiesTrust = function($minimumTrust$$) {
  if (!$isFiniteNumber$$module$src$types$$(this.trust)) {
    return $dev$$module$src$log$$().error("Action", "Invalid trust for '" + this.method + "': " + this.trust), !1;
  }
  if (this.trust < $minimumTrust$$) {
    a: {
      var $JSCompiler_actionTrust$jscomp$inline_375_JSCompiler_inline_result$jscomp$149_t$jscomp$1$$ = this.trust;
      switch($JSCompiler_actionTrust$jscomp$inline_375_JSCompiler_inline_result$jscomp$149_t$jscomp$1$$) {
        case 1:
          $JSCompiler_actionTrust$jscomp$inline_375_JSCompiler_inline_result$jscomp$149_t$jscomp$1$$ = "low";
          break a;
        case 3:
          $JSCompiler_actionTrust$jscomp$inline_375_JSCompiler_inline_result$jscomp$149_t$jscomp$1$$ = "high";
          break a;
        default:
          $devAssert$$module$src$log$$(2 === $JSCompiler_actionTrust$jscomp$inline_375_JSCompiler_inline_result$jscomp$149_t$jscomp$1$$), $JSCompiler_actionTrust$jscomp$inline_375_JSCompiler_inline_result$jscomp$149_t$jscomp$1$$ = "default";
      }
    }
    $user$$module$src$log$$().error("Action", '"' + this.actionEventType + '" event with "' + $JSCompiler_actionTrust$jscomp$inline_375_JSCompiler_inline_result$jscomp$149_t$jscomp$1$$ + '" trust is not allowed to invoke "' + (this.tagOrTarget.toLowerCase() + "." + this.method + '".'));
    return !1;
  }
  return !0;
};
function $ActionService$$module$src$service$action_impl$$($ampdoc$jscomp$19$$, $opt_root$$) {
  this.ampdoc = $ampdoc$jscomp$19$$;
  this.$root_$ = $opt_root$$ || $ampdoc$jscomp$19$$.getRootNode();
  this.$whitelist_$ = (this.$isEmail_$ = this.ampdoc.isSingleDoc() && $isAmpFormatType$$module$src$format$$(["\u26a14email", "amp4email"], this.$root_$)) ? $DEFAULT_EMAIL_ALLOWLIST$$module$src$service$action_impl$$ : null;
  this.$globalTargets_$ = $map$$module$src$utils$object$$();
  this.$globalMethodHandlers_$ = $map$$module$src$utils$object$$();
  this.addEvent("tap");
  this.addEvent("submit");
  this.addEvent("change");
  this.addEvent("input-debounced");
  this.addEvent("input-throttled");
  this.addEvent("valid");
  this.addEvent("invalid");
}
$ActionService$$module$src$service$action_impl$$.installInEmbedWindow = function($embedWin$jscomp$3$$, $ampdoc$jscomp$20$$) {
  $installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$3$$, "action", new $ActionService$$module$src$service$action_impl$$($ampdoc$jscomp$20$$, $embedWin$jscomp$3$$.document));
};
$JSCompiler_prototypeAlias$$ = $ActionService$$module$src$service$action_impl$$.prototype;
$JSCompiler_prototypeAlias$$.addEvent = function($name$jscomp$92$$) {
  var $$jscomp$this$jscomp$17$$ = this;
  if ("tap" == $name$jscomp$92$$) {
    this.$root_$.addEventListener("click", function($debouncedInput$$) {
      $debouncedInput$$.defaultPrevented || $$jscomp$this$jscomp$17$$.trigger($debouncedInput$$.target, $name$jscomp$92$$, $debouncedInput$$, 3);
    }), this.$root_$.addEventListener("keydown", function($debouncedInput$$) {
      var $throttledInput$$ = $debouncedInput$$.key, $event$jscomp$13$$ = $debouncedInput$$.target;
      if ("Enter" == $throttledInput$$ || " " == $throttledInput$$) {
        var $role$$ = $event$jscomp$13$$.getAttribute("role");
        if ($throttledInput$$ = $role$$) {
          $throttledInput$$ = $role$$.toLowerCase(), $throttledInput$$ = $hasOwn_$$module$src$utils$object$$.call($TAPPABLE_ARIA_ROLES$$module$src$service$action_impl$$, $throttledInput$$);
        }
        var $isTapEventRole$$ = $throttledInput$$;
        !$debouncedInput$$.defaultPrevented && $isTapEventRole$$ && $$jscomp$this$jscomp$17$$.trigger($event$jscomp$13$$, $name$jscomp$92$$, $debouncedInput$$, 3) && $debouncedInput$$.preventDefault();
      }
    });
  } else {
    if ("submit" == $name$jscomp$92$$) {
      this.$root_$.addEventListener($name$jscomp$92$$, function($debouncedInput$$) {
        $$jscomp$this$jscomp$17$$.trigger($debouncedInput$$.target, $name$jscomp$92$$, $debouncedInput$$, 3);
      });
    } else {
      if ("change" == $name$jscomp$92$$) {
        this.$root_$.addEventListener($name$jscomp$92$$, function($debouncedInput$$) {
          var $throttledInput$$ = $debouncedInput$$.target;
          $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$($debouncedInput$$);
          $$jscomp$this$jscomp$17$$.trigger($throttledInput$$, $name$jscomp$92$$, $debouncedInput$$, 3);
        });
      } else {
        if ("input-debounced" == $name$jscomp$92$$) {
          var $debouncedInput$$ = $debounce$$module$src$utils$rate_limit$$(this.ampdoc.win, function($debouncedInput$$) {
            $$jscomp$this$jscomp$17$$.trigger($debouncedInput$$.target, $name$jscomp$92$$, $debouncedInput$$, 3);
          });
          this.$root_$.addEventListener("input", function($name$jscomp$92$$) {
            var $$jscomp$this$jscomp$17$$ = new $DeferredEvent$$module$src$service$action_impl$$($name$jscomp$92$$);
            $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$($$jscomp$this$jscomp$17$$);
            $debouncedInput$$($$jscomp$this$jscomp$17$$);
          });
        } else {
          if ("input-throttled" == $name$jscomp$92$$) {
            var $throttledInput$$ = $throttle$$module$src$utils$rate_limit$$(this.ampdoc.win, function($debouncedInput$$) {
              $$jscomp$this$jscomp$17$$.trigger($debouncedInput$$.target, $name$jscomp$92$$, $debouncedInput$$, 3);
            }, 100);
            this.$root_$.addEventListener("input", function($name$jscomp$92$$) {
              $name$jscomp$92$$ = new $DeferredEvent$$module$src$service$action_impl$$($name$jscomp$92$$);
              $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$($name$jscomp$92$$);
              $throttledInput$$($name$jscomp$92$$);
            });
          } else {
            "valid" != $name$jscomp$92$$ && "invalid" != $name$jscomp$92$$ || this.$root_$.addEventListener($name$jscomp$92$$, function($debouncedInput$$) {
              $$jscomp$this$jscomp$17$$.trigger($debouncedInput$$.target, $name$jscomp$92$$, $debouncedInput$$, 3);
            });
          }
        }
      }
    }
  }
};
$JSCompiler_prototypeAlias$$.addGlobalTarget = function($name$jscomp$93$$, $handler$jscomp$7$$) {
  this.$globalTargets_$[$name$jscomp$93$$] = $handler$jscomp$7$$;
};
$JSCompiler_prototypeAlias$$.addGlobalMethodHandler = function($name$jscomp$94$$, $handler$jscomp$8$$, $minTrust$jscomp$3$$) {
  this.$globalMethodHandlers_$[$name$jscomp$94$$] = {handler:$handler$jscomp$8$$, minTrust:void 0 === $minTrust$jscomp$3$$ ? 2 : $minTrust$jscomp$3$$};
};
$JSCompiler_prototypeAlias$$.trigger = function($target$jscomp$102$$, $eventType$jscomp$10$$, $event$jscomp$21$$, $trust$jscomp$1$$, $opt_args$jscomp$1$$) {
  return $JSCompiler_StaticMethods_action_$$(this, $target$jscomp$102$$, $eventType$jscomp$10$$, $event$jscomp$21$$, $trust$jscomp$1$$, $opt_args$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.execute = function($invocation$jscomp$1_target$jscomp$103$$, $method$jscomp$5$$, $args$jscomp$8$$, $source$jscomp$16$$, $caller$jscomp$1$$, $event$jscomp$22$$, $trust$jscomp$2$$) {
  $invocation$jscomp$1_target$jscomp$103$$ = new $ActionInvocation$$module$src$service$action_impl$$($invocation$jscomp$1_target$jscomp$103$$, $method$jscomp$5$$, $args$jscomp$8$$, $source$jscomp$16$$, $caller$jscomp$1$$, $event$jscomp$22$$, $trust$jscomp$2$$);
  $JSCompiler_StaticMethods_invoke_$$(this, $invocation$jscomp$1_target$jscomp$103$$);
};
$JSCompiler_prototypeAlias$$.installActionHandler = function($target$jscomp$104$$, $handler$jscomp$9$$) {
  var $targetId$$ = $target$jscomp$104$$.getAttribute("id") || "";
  $devAssert$$module$src$log$$("amp-" === $targetId$$.substring(0, 4) || $target$jscomp$104$$.tagName.toLowerCase() in $NON_AMP_ELEMENTS_ACTIONS_$$module$src$service$action_impl$$);
  if ($target$jscomp$104$$.__AMP_ACTION_HANDLER__) {
    $dev$$module$src$log$$().error("Action", "Action handler already installed for " + $target$jscomp$104$$);
  } else {
    $target$jscomp$104$$.__AMP_ACTION_HANDLER__ = $handler$jscomp$9$$;
    var $queuedInvocations$$ = $target$jscomp$104$$.__AMP_ACTION_QUEUE__;
    $isArray$$module$src$types$$($queuedInvocations$$) && $Services$$module$src$services$timerFor$$($target$jscomp$104$$.ownerDocument.defaultView).delay(function() {
      $queuedInvocations$$.forEach(function($target$jscomp$104$$) {
        try {
          $handler$jscomp$9$$($target$jscomp$104$$);
        } catch ($e$jscomp$34$$) {
          $dev$$module$src$log$$().error("Action", "Action execution failed:", $target$jscomp$104$$, $e$jscomp$34$$);
        }
      });
      $target$jscomp$104$$.__AMP_ACTION_QUEUE__.length = 0;
    }, 1);
  }
};
$JSCompiler_prototypeAlias$$.hasAction = function($element$jscomp$96$$, $actionEventType$jscomp$1$$, $opt_stopAt$jscomp$1$$) {
  return !!$JSCompiler_StaticMethods_findAction_$$($element$jscomp$96$$, $actionEventType$jscomp$1$$, $opt_stopAt$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.hasResolvableAction = function($element$jscomp$97$$, $actionEventType$jscomp$2$$, $opt_stopAt$jscomp$2$$) {
  var $$jscomp$this$jscomp$18$$ = this, $action$$ = $JSCompiler_StaticMethods_findAction_$$($element$jscomp$97$$, $actionEventType$jscomp$2$$, $opt_stopAt$jscomp$2$$);
  return $action$$ ? $action$$.actionInfos.some(function($element$jscomp$97$$) {
    return !!$JSCompiler_StaticMethods_getActionNode_$$($$jscomp$this$jscomp$18$$, $element$jscomp$97$$.target);
  }) : !1;
};
$JSCompiler_prototypeAlias$$.hasResolvableActionForTarget = function($action$jscomp$2_element$jscomp$98$$, $actionEventType$jscomp$3$$, $targetElement$jscomp$1$$, $opt_stopAt$jscomp$3$$) {
  var $$jscomp$this$jscomp$19$$ = this;
  return ($action$jscomp$2_element$jscomp$98$$ = $JSCompiler_StaticMethods_findAction_$$($action$jscomp$2_element$jscomp$98$$, $actionEventType$jscomp$3$$, $opt_stopAt$jscomp$3$$)) ? $action$jscomp$2_element$jscomp$98$$.actionInfos.some(function($action$jscomp$2_element$jscomp$98$$) {
    return $JSCompiler_StaticMethods_getActionNode_$$($$jscomp$this$jscomp$19$$, $action$jscomp$2_element$jscomp$98$$.target) == $targetElement$jscomp$1$$;
  }) : !1;
};
function $JSCompiler_StaticMethods_getActionNode_$$($JSCompiler_StaticMethods_getActionNode_$self$$, $target$jscomp$107$$) {
  return $JSCompiler_StaticMethods_getActionNode_$self$$.$globalTargets_$[$target$jscomp$107$$] ? $JSCompiler_StaticMethods_getActionNode_$self$$.$root_$ : $JSCompiler_StaticMethods_getActionNode_$self$$.$root_$.getElementById($target$jscomp$107$$);
}
$JSCompiler_prototypeAlias$$.setWhitelist = function($whitelist$$) {
  $devAssert$$module$src$log$$($whitelist$$.every(function($whitelist$$) {
    return $whitelist$$.tagOrTarget && $whitelist$$.method;
  }));
  this.$whitelist_$ = $whitelist$$;
};
$JSCompiler_prototypeAlias$$.addToWhitelist = function($tagOrTarget$jscomp$1$$, $methods$jscomp$1$$, $opt_forFormat$$) {
  var $$jscomp$this$jscomp$20$$ = this;
  $opt_forFormat$$ && $opt_forFormat$$.includes("email") !== this.$isEmail_$ || (this.$whitelist_$ || (this.$whitelist_$ = []), $isArray$$module$src$types$$($methods$jscomp$1$$) || ($methods$jscomp$1$$ = [$methods$jscomp$1$$]), $methods$jscomp$1$$.forEach(function($methods$jscomp$1$$) {
    $$jscomp$this$jscomp$20$$.$whitelist_$.some(function($opt_forFormat$$) {
      return $opt_forFormat$$.tagOrTarget == $tagOrTarget$jscomp$1$$ && $opt_forFormat$$.method == $methods$jscomp$1$$;
    }) || $$jscomp$this$jscomp$20$$.$whitelist_$.push({tagOrTarget:$tagOrTarget$jscomp$1$$, method:$methods$jscomp$1$$});
  }));
};
function $JSCompiler_StaticMethods_action_$$($JSCompiler_StaticMethods_action_$self$$, $source$jscomp$17$$, $actionEventType$jscomp$4$$, $event$jscomp$23$$, $trust$jscomp$3$$, $opt_args$jscomp$2$$) {
  var $action$jscomp$3$$ = $JSCompiler_StaticMethods_findAction_$$($source$jscomp$17$$, $actionEventType$jscomp$4$$);
  if (!$action$jscomp$3$$) {
    return !1;
  }
  var $sequenceId$jscomp$1$$ = Math.random(), $currentPromise$$ = null;
  $action$jscomp$3$$.actionInfos.forEach(function($actionInfo$jscomp$1$$) {
    function $invokeAction$$() {
      var $opt_args$jscomp$2$$ = $JSCompiler_StaticMethods_getActionNode_$$($JSCompiler_StaticMethods_action_$self$$, $target$jscomp$108$$);
      if ($opt_args$jscomp$2$$) {
        return $opt_args$jscomp$2$$ = new $ActionInvocation$$module$src$service$action_impl$$($opt_args$jscomp$2$$, $method$jscomp$7$$, $dereferencedArgs$$, $source$jscomp$17$$, $action$jscomp$3$$.node, $event$jscomp$23$$, $trust$jscomp$3$$, $actionEventType$jscomp$4$$, $opt_args$jscomp$2$$.tagName || $target$jscomp$108$$, $sequenceId$jscomp$1$$), $JSCompiler_StaticMethods_invoke_$$($JSCompiler_StaticMethods_action_$self$$, $opt_args$jscomp$2$$);
      }
      $JSCompiler_StaticMethods_action_$self$$.$error_$('Target "' + $target$jscomp$108$$ + '" not found for action [' + $str$jscomp$11$$ + "].");
    }
    var $target$jscomp$108$$ = $actionInfo$jscomp$1$$.target, $method$jscomp$7$$ = $actionInfo$jscomp$1$$.method, $str$jscomp$11$$ = $actionInfo$jscomp$1$$.str, $dereferencedArgs$$ = $dereferenceArgsVariables$$module$src$service$action_impl$$($actionInfo$jscomp$1$$.args, $event$jscomp$23$$, $opt_args$jscomp$2$$);
    $currentPromise$$ = $currentPromise$$ ? $currentPromise$$.then($invokeAction$$) : $invokeAction$$();
  });
  return 1 <= $action$jscomp$3$$.actionInfos.length;
}
$JSCompiler_prototypeAlias$$.$error_$ = function($e$jscomp$35_message$jscomp$39$$, $opt_element$jscomp$14$$) {
  if ($opt_element$jscomp$14$$) {
    throw $e$jscomp$35_message$jscomp$39$$ = $user$$module$src$log$$().createError("[Action] " + $e$jscomp$35_message$jscomp$39$$), $reportError$$module$src$error$$($e$jscomp$35_message$jscomp$39$$, $opt_element$jscomp$14$$), $e$jscomp$35_message$jscomp$39$$;
  }
  $user$$module$src$log$$().error("Action", $e$jscomp$35_message$jscomp$39$$);
};
function $JSCompiler_StaticMethods_invoke_$$($JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$, $invocation$jscomp$4$$) {
  var $method$jscomp$8$$ = $invocation$jscomp$4$$.method, $tagOrTarget$jscomp$2$$ = $invocation$jscomp$4$$.tagOrTarget;
  if ($JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$whitelist_$ && !$isActionWhitelisted$$module$src$service$action_impl$$($invocation$jscomp$4$$, $JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$whitelist_$)) {
    return $JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$error_$('"' + $tagOrTarget$jscomp$2$$ + "." + $method$jscomp$8$$ + '" is not whitelisted ' + JSON.stringify($JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$whitelist_$) + "."), null;
  }
  var $globalTarget$$ = $JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$globalTargets_$[$tagOrTarget$jscomp$2$$];
  if ($globalTarget$$) {
    return $globalTarget$$($invocation$jscomp$4$$);
  }
  var $node$jscomp$18$$ = $invocation$jscomp$4$$.node, $globalMethod$$ = $JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$globalMethodHandlers_$[$method$jscomp$8$$];
  if ($globalMethod$$ && $invocation$jscomp$4$$.satisfiesTrust($globalMethod$$.minTrust)) {
    return $globalMethod$$.handler($invocation$jscomp$4$$);
  }
  var $lowerTagName$$ = $node$jscomp$18$$.tagName.toLowerCase();
  if ("amp-" === $lowerTagName$$.substring(0, 4)) {
    return $node$jscomp$18$$.enqueAction ? $node$jscomp$18$$.enqueAction($invocation$jscomp$4$$) : $JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$error_$('Unrecognized AMP element "' + $lowerTagName$$ + '".', $node$jscomp$18$$), null;
  }
  var $nonAmpActions$$ = $NON_AMP_ELEMENTS_ACTIONS_$$module$src$service$action_impl$$[$lowerTagName$$];
  if ("amp-" === ($node$jscomp$18$$.getAttribute("id") || "").substring(0, 4) || $nonAmpActions$$ && -1 < $nonAmpActions$$.indexOf($method$jscomp$8$$)) {
    return ($JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$ = $node$jscomp$18$$.__AMP_ACTION_HANDLER__) ? $JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$($invocation$jscomp$4$$) : ($node$jscomp$18$$.__AMP_ACTION_QUEUE__ = $node$jscomp$18$$.__AMP_ACTION_QUEUE__ || [], $node$jscomp$18$$.__AMP_ACTION_QUEUE__.push($invocation$jscomp$4$$)), null;
  }
  $JSCompiler_StaticMethods_invoke_$self_handler$jscomp$10$$.$error_$("Target (" + $tagOrTarget$jscomp$2$$ + ") doesn't support \"" + $method$jscomp$8$$ + '" action.', $invocation$jscomp$4$$.caller);
  return null;
}
function $JSCompiler_StaticMethods_findAction_$$($n$jscomp$11_target$jscomp$109$$, $actionEventType$jscomp$5$$, $opt_stopAt$jscomp$4$$) {
  for (; $n$jscomp$11_target$jscomp$109$$ && (!$opt_stopAt$jscomp$4$$ || $n$jscomp$11_target$jscomp$109$$ != $opt_stopAt$jscomp$4$$);) {
    var $JSCompiler_actionEventType$jscomp$inline_379$$ = $actionEventType$jscomp$5$$;
    var $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$ = $n$jscomp$11_target$jscomp$109$$;
    var $JSCompiler_action$jscomp$inline_887_JSCompiler_actionEventType$jscomp$inline_885$$ = $JSCompiler_actionEventType$jscomp$inline_379$$, $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$ = $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$[$ACTION_MAP_$$module$src$service$action_impl$$];
    void 0 === $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$ && ($JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$ = null, $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$.hasAttribute("on") ? ($JSCompiler_action$jscomp$inline_887_JSCompiler_actionEventType$jscomp$inline_885$$ = $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$.getAttribute("on"), $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$ = 
    $parseActionMap$$module$src$service$action_impl$$($JSCompiler_action$jscomp$inline_887_JSCompiler_actionEventType$jscomp$inline_885$$, $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$), $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$[$ACTION_MAP_$$module$src$service$action_impl$$] = $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$) : $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$.hasAttribute("execute") && 
    ($JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$ = $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$.getAttribute("execute"), $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$ = $parseActionMap$$module$src$service$action_impl$$($JSCompiler_action$jscomp$inline_887_JSCompiler_actionEventType$jscomp$inline_885$$ + ":" + $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$, $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$), 
    $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$[$ACTION_MAP_$$module$src$service$action_impl$$] = $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$));
    var $actionInfos$$ = ($JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$ = $JSCompiler_actionMap$jscomp$inline_886_action$22$jscomp$inline_888$$) ? $JSCompiler_actionMap$jscomp$inline_380_JSCompiler_node$jscomp$inline_884$$[$JSCompiler_actionEventType$jscomp$inline_379$$] || null : null;
    if ($actionInfos$$ && !$n$jscomp$11_target$jscomp$109$$.disabled && !$matches$$module$src$dom$$($n$jscomp$11_target$jscomp$109$$, ":disabled")) {
      return {node:$n$jscomp$11_target$jscomp$109$$, actionInfos:$devAssert$$module$src$log$$($actionInfos$$)};
    }
    $n$jscomp$11_target$jscomp$109$$ = $n$jscomp$11_target$jscomp$109$$.parentElement;
  }
  return null;
}
$JSCompiler_prototypeAlias$$.setActions = function($node$jscomp$21$$, $actionsStr$$) {
  $node$jscomp$21$$.setAttribute("on", $actionsStr$$);
  delete $node$jscomp$21$$[$ACTION_MAP_$$module$src$service$action_impl$$];
};
function $JSCompiler_StaticMethods_addTargetPropertiesAsDetail_$$($event$jscomp$24$$) {
  var $detail$jscomp$4$$ = $map$$module$src$utils$object$$(), $target$jscomp$110$$ = $event$jscomp$24$$.target;
  void 0 !== $target$jscomp$110$$.value && ($detail$jscomp$4$$.value = $target$jscomp$110$$.value);
  "INPUT" == $target$jscomp$110$$.tagName && ($detail$jscomp$4$$.valueAsNumber = Number($target$jscomp$110$$.value));
  void 0 !== $target$jscomp$110$$.checked && ($detail$jscomp$4$$.checked = $target$jscomp$110$$.checked);
  if (void 0 !== $target$jscomp$110$$.min || void 0 !== $target$jscomp$110$$.max) {
    $detail$jscomp$4$$.min = $target$jscomp$110$$.min, $detail$jscomp$4$$.max = $target$jscomp$110$$.max;
  }
  0 < Object.keys($detail$jscomp$4$$).length && ($event$jscomp$24$$.detail = $detail$jscomp$4$$);
}
function $isActionWhitelisted$$module$src$service$action_impl$$($invocation$jscomp$5_tagOrTarget$jscomp$3$$, $whitelist$jscomp$1$$) {
  var $method$jscomp$9$$ = $invocation$jscomp$5_tagOrTarget$jscomp$3$$.method, $node$jscomp$22$$ = $invocation$jscomp$5_tagOrTarget$jscomp$3$$.node;
  $invocation$jscomp$5_tagOrTarget$jscomp$3$$ = $invocation$jscomp$5_tagOrTarget$jscomp$3$$.tagOrTarget;
  "activate" === $method$jscomp$9$$ && "function" == typeof $node$jscomp$22$$.getDefaultActionAlias && ($method$jscomp$9$$ = $node$jscomp$22$$.getDefaultActionAlias());
  var $lcMethod$$ = $method$jscomp$9$$.toLowerCase(), $lcTagOrTarget$$ = $invocation$jscomp$5_tagOrTarget$jscomp$3$$.toLowerCase();
  return $whitelist$jscomp$1$$.some(function($invocation$jscomp$5_tagOrTarget$jscomp$3$$) {
    return $invocation$jscomp$5_tagOrTarget$jscomp$3$$.tagOrTarget.toLowerCase() !== $lcTagOrTarget$$ && "*" !== $invocation$jscomp$5_tagOrTarget$jscomp$3$$.tagOrTarget || $invocation$jscomp$5_tagOrTarget$jscomp$3$$.method.toLowerCase() !== $lcMethod$$ ? !1 : !0;
  });
}
function $DeferredEvent$$module$src$service$action_impl$$($event$jscomp$25$$) {
  this.detail = null;
  var $JSCompiler_clone$jscomp$inline_384$$ = this || $map$$module$src$utils$object$$(), $JSCompiler_prop$jscomp$inline_385$$;
  for ($JSCompiler_prop$jscomp$inline_385$$ in $event$jscomp$25$$) {
    $JSCompiler_clone$jscomp$inline_384$$[$JSCompiler_prop$jscomp$inline_385$$] = "function" === typeof $event$jscomp$25$$[$JSCompiler_prop$jscomp$inline_385$$] ? $notImplemented$$module$src$service$action_impl$$ : $event$jscomp$25$$[$JSCompiler_prop$jscomp$inline_385$$];
  }
}
function $notImplemented$$module$src$service$action_impl$$() {
  $devAssert$$module$src$log$$(null);
}
function $parseActionMap$$module$src$service$action_impl$$($action$jscomp$5$$, $actionMap$jscomp$2_context$jscomp$3$$) {
  var $assertAction$$ = $assertActionForParser$$module$src$service$action_impl$$.bind(null, $action$jscomp$5$$, $actionMap$jscomp$2_context$jscomp$3$$), $assertToken$$ = $assertTokenForParser$$module$src$service$action_impl$$.bind(null, $action$jscomp$5$$, $actionMap$jscomp$2_context$jscomp$3$$);
  $actionMap$jscomp$2_context$jscomp$3$$ = null;
  var $toks$$ = new $ParserTokenizer$$module$src$service$action_impl$$($action$jscomp$5$$);
  do {
    var $tok$$ = $toks$$.next();
    if ($tok$$.type != $TokenType$$module$src$service$action_impl$EOF$$ && ($tok$$.type != $TokenType$$module$src$service$action_impl$SEPARATOR$$ || ";" != $tok$$.value)) {
      if ($tok$$.type == $TokenType$$module$src$service$action_impl$LITERAL$$ || $tok$$.type == $TokenType$$module$src$service$action_impl$ID$$) {
        var $event$jscomp$26$$ = $tok$$.value;
        $assertToken$$($toks$$.next(), [$TokenType$$module$src$service$action_impl$SEPARATOR$$], ":");
        var $actions$$ = [];
        do {
          var $target$jscomp$111$$ = $assertToken$$($toks$$.next(), [$TokenType$$module$src$service$action_impl$LITERAL$$, $TokenType$$module$src$service$action_impl$ID$$]).value, $method$jscomp$10$$ = "activate", $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$ = null;
          var $peek$$ = $toks$$.peek();
          if ($peek$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "." == $peek$$.value && ($toks$$.next(), $method$jscomp$10$$ = $assertToken$$($toks$$.next(), [$TokenType$$module$src$service$action_impl$LITERAL$$, $TokenType$$module$src$service$action_impl$ID$$]).value || $method$jscomp$10$$, $peek$$ = $toks$$.peek(), $peek$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "(" == $peek$$.value)) {
            $toks$$.next();
            $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$ = $toks$$;
            var $JSCompiler_assertToken$jscomp$inline_388$$ = $assertToken$$, $JSCompiler_assertAction$jscomp$inline_389$$ = $assertAction$$, $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ = $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.peek(), $JSCompiler_args$jscomp$inline_392$$ = null;
            if ($JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$.type == $TokenType$$module$src$service$action_impl$OBJECT$$) {
              $JSCompiler_args$jscomp$inline_392$$ = $map$$module$src$utils$object$$();
              var $JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$ = $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.next().value;
              $JSCompiler_args$jscomp$inline_392$$.__AMP_OBJECT_STRING__ = $JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$;
              $JSCompiler_assertToken$jscomp$inline_388$$($JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.next(), [$TokenType$$module$src$service$action_impl$SEPARATOR$$], ")");
            } else {
              do {
                var $JSCompiler_$jscomp$inline_394_value$23$jscomp$inline_396$$ = $JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$ = $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.next();
                $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ = $JSCompiler_$jscomp$inline_394_value$23$jscomp$inline_396$$.type;
                $JSCompiler_$jscomp$inline_394_value$23$jscomp$inline_396$$ = $JSCompiler_$jscomp$inline_394_value$23$jscomp$inline_396$$.value;
                if ($JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ != $TokenType$$module$src$service$action_impl$SEPARATOR$$ || "," != $JSCompiler_$jscomp$inline_394_value$23$jscomp$inline_396$$ && ")" != $JSCompiler_$jscomp$inline_394_value$23$jscomp$inline_396$$) {
                  if ($JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ == $TokenType$$module$src$service$action_impl$LITERAL$$ || $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ == $TokenType$$module$src$service$action_impl$ID$$) {
                    $JSCompiler_assertToken$jscomp$inline_388$$($JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.next(), [$TokenType$$module$src$service$action_impl$SEPARATOR$$], "=");
                    $JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$ = $JSCompiler_assertToken$jscomp$inline_388$$($JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.next(!0), [$TokenType$$module$src$service$action_impl$LITERAL$$, $TokenType$$module$src$service$action_impl$ID$$]);
                    var $JSCompiler_argValueTokens$jscomp$inline_397$$ = [$JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$];
                    if ($JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$.type == $TokenType$$module$src$service$action_impl$ID$$) {
                      for ($JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ = $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.peek(); $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "." == $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$.value; $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ = 
                      $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.peek()) {
                        $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.next(), $JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$ = $JSCompiler_assertToken$jscomp$inline_388$$($JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.next(!1), [$TokenType$$module$src$service$action_impl$ID$$]), $JSCompiler_argValueTokens$jscomp$inline_397$$.push($JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$);
                      }
                    }
                    $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ = $argValueForTokens$$module$src$service$action_impl$$($JSCompiler_argValueTokens$jscomp$inline_397$$);
                    $JSCompiler_args$jscomp$inline_392$$ || ($JSCompiler_args$jscomp$inline_392$$ = $map$$module$src$utils$object$$());
                    $JSCompiler_args$jscomp$inline_392$$[$JSCompiler_$jscomp$inline_394_value$23$jscomp$inline_396$$] = $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$;
                    $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$ = $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$.peek();
                    $JSCompiler_assertAction$jscomp$inline_389$$($JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && ("," == $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$.value || ")" == $JSCompiler_argValue$jscomp$inline_398_JSCompiler_peek$jscomp$inline_390_JSCompiler_type$jscomp$inline_395$$.value), "Expected either [,] or [)]");
                  } else {
                    $JSCompiler_assertAction$jscomp$inline_389$$(!1, "; unexpected token [" + ($JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$.value || "") + "]");
                  }
                }
              } while ($JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$.type != $TokenType$$module$src$service$action_impl$SEPARATOR$$ || ")" != $JSCompiler_tok$jscomp$inline_391_JSCompiler_value$jscomp$inline_393$$.value);
            }
            $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$ = $JSCompiler_args$jscomp$inline_392$$;
          }
          $actions$$.push({event:$event$jscomp$26$$, target:$target$jscomp$111$$, method:$method$jscomp$10$$, args:$JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$ && $getMode$$module$src$mode$$().test && Object.freeze ? Object.freeze($JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$) : $JSCompiler_toks$jscomp$inline_387_args$jscomp$10$$, str:$action$jscomp$5$$});
          $peek$$ = $toks$$.peek();
        } while ($peek$$.type == $TokenType$$module$src$service$action_impl$SEPARATOR$$ && "," == $peek$$.value && $toks$$.next());
        $actionMap$jscomp$2_context$jscomp$3$$ || ($actionMap$jscomp$2_context$jscomp$3$$ = $map$$module$src$utils$object$$());
        $actionMap$jscomp$2_context$jscomp$3$$[$event$jscomp$26$$] = $actions$$;
      } else {
        $assertAction$$(!1, "; unexpected token [" + ($tok$$.value || "") + "]");
      }
    }
  } while ($tok$$.type != $TokenType$$module$src$service$action_impl$EOF$$);
  return $actionMap$jscomp$2_context$jscomp$3$$;
}
function $argValueForTokens$$module$src$service$action_impl$$($tokens$jscomp$1$$) {
  return 0 == $tokens$jscomp$1$$.length ? null : 1 == $tokens$jscomp$1$$.length ? $tokens$jscomp$1$$[0].value : {expression:$tokens$jscomp$1$$.map(function($tokens$jscomp$1$$) {
    return $tokens$jscomp$1$$.value;
  }).join(".")};
}
function $dereferenceArgsVariables$$module$src$service$action_impl$$($args$jscomp$12$$, $detail$jscomp$5_event$jscomp$27$$, $opt_args$jscomp$3$$) {
  if (!$args$jscomp$12$$) {
    return $args$jscomp$12$$;
  }
  var $data$jscomp$87$$ = $opt_args$jscomp$3$$ || $dict$$module$src$utils$object$$({});
  $detail$jscomp$5_event$jscomp$27$$ && ($detail$jscomp$5_event$jscomp$27$$ = $detail$jscomp$5_event$jscomp$27$$.detail) && ($data$jscomp$87$$.event = $detail$jscomp$5_event$jscomp$27$$);
  var $applied$$ = $map$$module$src$utils$object$$();
  Object.keys($args$jscomp$12$$).forEach(function($detail$jscomp$5_event$jscomp$27$$) {
    var $opt_args$jscomp$3$$ = $args$jscomp$12$$[$detail$jscomp$5_event$jscomp$27$$];
    if ("object" == typeof $opt_args$jscomp$3$$ && $opt_args$jscomp$3$$.expression) {
      $opt_args$jscomp$3$$ = $opt_args$jscomp$3$$.expression;
      if ("." == $opt_args$jscomp$3$$) {
        $opt_args$jscomp$3$$ = $data$jscomp$87$$;
      } else {
        $opt_args$jscomp$3$$ = $opt_args$jscomp$3$$.split(".");
        for (var $key$jscomp$55$$ = $data$jscomp$87$$, $JSCompiler_i$jscomp$inline_404$$ = 0; $JSCompiler_i$jscomp$inline_404$$ < $opt_args$jscomp$3$$.length; $JSCompiler_i$jscomp$inline_404$$++) {
          var $JSCompiler_part$jscomp$inline_405$$ = $opt_args$jscomp$3$$[$JSCompiler_i$jscomp$inline_404$$];
          if ($JSCompiler_part$jscomp$inline_405$$ && $key$jscomp$55$$ && void 0 !== $key$jscomp$55$$[$JSCompiler_part$jscomp$inline_405$$] && $hasOwnProperty$$module$src$json$$($key$jscomp$55$$, $JSCompiler_part$jscomp$inline_405$$)) {
            $key$jscomp$55$$ = $key$jscomp$55$$[$JSCompiler_part$jscomp$inline_405$$];
          } else {
            $key$jscomp$55$$ = void 0;
            break;
          }
        }
        $opt_args$jscomp$3$$ = $key$jscomp$55$$;
      }
      var $exprValue$$ = $opt_args$jscomp$3$$;
      $opt_args$jscomp$3$$ = void 0 === $exprValue$$ ? null : $exprValue$$;
    }
    $applied$$[$detail$jscomp$5_event$jscomp$27$$] = $data$jscomp$87$$[$opt_args$jscomp$3$$] ? $data$jscomp$87$$[$opt_args$jscomp$3$$] : $opt_args$jscomp$3$$;
  });
  return $applied$$;
}
function $assertActionForParser$$module$src$service$action_impl$$($s$jscomp$20$$, $context$jscomp$4$$, $condition$jscomp$2$$, $opt_message$jscomp$16$$) {
  return $userAssert$$module$src$log$$($condition$jscomp$2$$, "Invalid action definition in %s: [%s] %s", $context$jscomp$4$$, $s$jscomp$20$$, $opt_message$jscomp$16$$ || "");
}
function $assertTokenForParser$$module$src$service$action_impl$$($s$jscomp$21$$, $context$jscomp$5$$, $tok$jscomp$2$$, $types$$, $opt_value$jscomp$10$$) {
  void 0 !== $opt_value$jscomp$10$$ ? $assertActionForParser$$module$src$service$action_impl$$($s$jscomp$21$$, $context$jscomp$5$$, $types$$.includes($tok$jscomp$2$$.type) && $tok$jscomp$2$$.value == $opt_value$jscomp$10$$, "; expected [" + $opt_value$jscomp$10$$ + "]") : $assertActionForParser$$module$src$service$action_impl$$($s$jscomp$21$$, $context$jscomp$5$$, $types$$.includes($tok$jscomp$2$$.type));
  return $tok$jscomp$2$$;
}
var $TokenType$$module$src$service$action_impl$EOF$$ = 1, $TokenType$$module$src$service$action_impl$SEPARATOR$$ = 2, $TokenType$$module$src$service$action_impl$LITERAL$$ = 3, $TokenType$$module$src$service$action_impl$ID$$ = 4, $TokenType$$module$src$service$action_impl$OBJECT$$ = 5;
function $ParserTokenizer$$module$src$service$action_impl$$($str$jscomp$12$$) {
  this.$str_$ = $str$jscomp$12$$;
  this.$index_$ = -1;
}
$ParserTokenizer$$module$src$service$action_impl$$.prototype.next = function($opt_convertValues$$) {
  var $tok$jscomp$3$$ = $JSCompiler_StaticMethods_next_$$(this, $opt_convertValues$$ || !1);
  this.$index_$ = $tok$jscomp$3$$.index;
  return $tok$jscomp$3$$;
};
$ParserTokenizer$$module$src$service$action_impl$$.prototype.peek = function($opt_convertValues$jscomp$1$$) {
  return $JSCompiler_StaticMethods_next_$$(this, $opt_convertValues$jscomp$1$$ || !1);
};
function $JSCompiler_StaticMethods_next_$$($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, $convertValues$$) {
  var $newIndex$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$index_$ + 1;
  if ($newIndex$$ >= $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length) {
    return {type:$TokenType$$module$src$service$action_impl$EOF$$, index:$JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$index_$};
  }
  var $c$jscomp$1_i$29$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.charAt($newIndex$$);
  if (-1 != " \t\n\r\f\v\u00a0\u2028\u2029".indexOf($c$jscomp$1_i$29$$)) {
    for ($newIndex$$++; $newIndex$$ < $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length && -1 != " \t\n\r\f\v\u00a0\u2028\u2029".indexOf($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.charAt($newIndex$$)); $newIndex$$++) {
    }
    if ($newIndex$$ >= $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length) {
      return {type:$TokenType$$module$src$service$action_impl$EOF$$, index:$newIndex$$};
    }
    $c$jscomp$1_i$29$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.charAt($newIndex$$);
  }
  if ($convertValues$$ && ($isNum$$module$src$service$action_impl$$($c$jscomp$1_i$29$$) || "." == $c$jscomp$1_i$29$$ && $newIndex$$ + 1 < $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length && $isNum$$module$src$service$action_impl$$($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$[$newIndex$$ + 1]))) {
    for (var $hasFraction$$ = "." == $c$jscomp$1_i$29$$, $end$24_end$26_end$28_end$jscomp$7$$ = $newIndex$$ + 1; $end$24_end$26_end$28_end$jscomp$7$$ < $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length; $end$24_end$26_end$28_end$jscomp$7$$++) {
      var $c2$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.charAt($end$24_end$26_end$28_end$jscomp$7$$);
      if ("." == $c2$$) {
        $hasFraction$$ = !0;
      } else {
        if (!$isNum$$module$src$service$action_impl$$($c2$$)) {
          break;
        }
      }
    }
    $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.substring($newIndex$$, $end$24_end$26_end$28_end$jscomp$7$$);
    $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$ = $hasFraction$$ ? parseFloat($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$) : parseInt($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, 10);
    $newIndex$$ = $end$24_end$26_end$28_end$jscomp$7$$ - 1;
    return {type:$TokenType$$module$src$service$action_impl$LITERAL$$, value:$JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, index:$newIndex$$};
  }
  if (-1 != ";:.()=,|!".indexOf($c$jscomp$1_i$29$$)) {
    return {type:$TokenType$$module$src$service$action_impl$SEPARATOR$$, value:$c$jscomp$1_i$29$$, index:$newIndex$$};
  }
  if (-1 != "\"'".indexOf($c$jscomp$1_i$29$$)) {
    $end$24_end$26_end$28_end$jscomp$7$$ = -1;
    for (var $i$jscomp$42$$ = $newIndex$$ + 1; $i$jscomp$42$$ < $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length; $i$jscomp$42$$++) {
      if ($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.charAt($i$jscomp$42$$) == $c$jscomp$1_i$29$$) {
        $end$24_end$26_end$28_end$jscomp$7$$ = $i$jscomp$42$$;
        break;
      }
    }
    if (-1 == $end$24_end$26_end$28_end$jscomp$7$$) {
      return {type:0, index:$newIndex$$};
    }
    $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.substring($newIndex$$ + 1, $end$24_end$26_end$28_end$jscomp$7$$);
    $newIndex$$ = $end$24_end$26_end$28_end$jscomp$7$$;
    return {type:$TokenType$$module$src$service$action_impl$LITERAL$$, value:$JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, index:$newIndex$$};
  }
  if ("{" == $c$jscomp$1_i$29$$) {
    var $numberOfBraces$$ = 1;
    $end$24_end$26_end$28_end$jscomp$7$$ = -1;
    for ($c$jscomp$1_i$29$$ = $newIndex$$ + 1; $c$jscomp$1_i$29$$ < $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length; $c$jscomp$1_i$29$$++) {
      var $char$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$[$c$jscomp$1_i$29$$];
      "{" == $char$$ ? $numberOfBraces$$++ : "}" == $char$$ && $numberOfBraces$$--;
      if (0 >= $numberOfBraces$$) {
        $end$24_end$26_end$28_end$jscomp$7$$ = $c$jscomp$1_i$29$$;
        break;
      }
    }
    if (-1 == $end$24_end$26_end$28_end$jscomp$7$$) {
      return {type:0, index:$newIndex$$};
    }
    $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.substring($newIndex$$, $end$24_end$26_end$28_end$jscomp$7$$ + 1);
    $newIndex$$ = $end$24_end$26_end$28_end$jscomp$7$$;
    return {type:$TokenType$$module$src$service$action_impl$OBJECT$$, value:$JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, index:$newIndex$$};
  }
  for ($end$24_end$26_end$28_end$jscomp$7$$ = $newIndex$$ + 1; $end$24_end$26_end$28_end$jscomp$7$$ < $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.length && -1 == " \t\n\r\f\x0B\u00a0\u2028\u2029;:.()=,|!\"'{}".indexOf($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.charAt($end$24_end$26_end$28_end$jscomp$7$$)); $end$24_end$26_end$28_end$jscomp$7$$++) {
  }
  $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$ = $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.$str_$.substring($newIndex$$, $end$24_end$26_end$28_end$jscomp$7$$);
  $newIndex$$ = $end$24_end$26_end$28_end$jscomp$7$$ - 1;
  return !$convertValues$$ || "true" != $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$ && "false" != $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$ ? $isNum$$module$src$service$action_impl$$($JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$.charAt(0)) ? {type:$TokenType$$module$src$service$action_impl$LITERAL$$, value:$JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, 
  index:$newIndex$$} : {type:$TokenType$$module$src$service$action_impl$ID$$, value:$JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, index:$newIndex$$} : {type:$TokenType$$module$src$service$action_impl$LITERAL$$, value:"true" == $JSCompiler_StaticMethods_next_$self_s$25_s$jscomp$22_value$27_value$30_value$jscomp$122$$, index:$newIndex$$};
}
function $isNum$$module$src$service$action_impl$$($c$jscomp$2$$) {
  return "0" <= $c$jscomp$2$$ && "9" >= $c$jscomp$2$$;
}
;function $remove$$module$src$utils$array$$($array$jscomp$13$$, $shouldRemove$$) {
  for (var $removed$jscomp$1$$ = [], $index$jscomp$81$$ = 0, $i$jscomp$44$$ = 0; $i$jscomp$44$$ < $array$jscomp$13$$.length; $i$jscomp$44$$++) {
    var $item$jscomp$2$$ = $array$jscomp$13$$[$i$jscomp$44$$];
    $shouldRemove$$($item$jscomp$2$$, $i$jscomp$44$$, $array$jscomp$13$$) ? $removed$jscomp$1$$.push($item$jscomp$2$$) : ($index$jscomp$81$$ < $i$jscomp$44$$ && ($array$jscomp$13$$[$index$jscomp$81$$] = $item$jscomp$2$$), $index$jscomp$81$$++);
  }
  $index$jscomp$81$$ < $array$jscomp$13$$.length && ($array$jscomp$13$$.length = $index$jscomp$81$$);
  return $removed$jscomp$1$$;
}
function $findIndex$$module$src$utils$array$$($array$jscomp$14$$, $predicate$jscomp$1$$) {
  for (var $i$jscomp$45$$ = 0; $i$jscomp$45$$ < $array$jscomp$14$$.length; $i$jscomp$45$$++) {
    if ($predicate$jscomp$1$$($array$jscomp$14$$[$i$jscomp$45$$], $i$jscomp$45$$, $array$jscomp$14$$)) {
      return $i$jscomp$45$$;
    }
  }
  return -1;
}
;function $isFormDataWrapper$$module$src$form_data_wrapper$$($o$jscomp$1$$) {
  return !!$o$jscomp$1$$ && "function" == typeof $o$jscomp$1$$.getFormData;
}
;var $allowedMethods_$$module$src$utils$xhr_utils$$ = ["GET", "POST"], $allowedJsonBodyTypes_$$module$src$utils$xhr_utils$$ = [$isArray$$module$src$types$$, $isObject$$module$src$types$$];
function $toStructuredCloneable$$module$src$utils$xhr_utils$$($input$jscomp$12$$, $JSCompiler_iterator$jscomp$inline_407_init$jscomp$4$$) {
  var $newInit$$ = Object.assign({}, $JSCompiler_iterator$jscomp$inline_407_init$jscomp$4$$);
  if ($isFormDataWrapper$$module$src$form_data_wrapper$$($JSCompiler_iterator$jscomp$inline_407_init$jscomp$4$$.body)) {
    var $wrapper$$ = $JSCompiler_iterator$jscomp$inline_407_init$jscomp$4$$.body;
    $newInit$$.headers["Content-Type"] = "multipart/form-data;charset=utf-8";
    $JSCompiler_iterator$jscomp$inline_407_init$jscomp$4$$ = $wrapper$$.entries();
    for (var $JSCompiler_array$jscomp$inline_408$$ = [], $JSCompiler_e$jscomp$inline_409$$ = $JSCompiler_iterator$jscomp$inline_407_init$jscomp$4$$.next(); !$JSCompiler_e$jscomp$inline_409$$.done; $JSCompiler_e$jscomp$inline_409$$ = $JSCompiler_iterator$jscomp$inline_407_init$jscomp$4$$.next()) {
      $JSCompiler_array$jscomp$inline_408$$.push($JSCompiler_e$jscomp$inline_409$$.value);
    }
    $newInit$$.body = $JSCompiler_array$jscomp$inline_408$$;
  }
  return {input:$input$jscomp$12$$, init:$newInit$$};
}
function $fromStructuredCloneable$$module$src$utils$xhr_utils$$($response$jscomp$3$$, $responseType$$) {
  $userAssert$$module$src$log$$($isObject$$module$src$types$$($response$jscomp$3$$), "Object expected: %s", $response$jscomp$3$$);
  if ("document" != $responseType$$) {
    return new Response($response$jscomp$3$$.body, $response$jscomp$3$$.init);
  }
  var $lowercasedHeaders$jscomp$1$$ = $map$$module$src$utils$object$$(), $data$jscomp$89$$ = {status:200, statusText:"OK", getResponseHeader:function($response$jscomp$3$$) {
    return $lowercasedHeaders$jscomp$1$$[String($response$jscomp$3$$).toLowerCase()] || null;
  }};
  if ($response$jscomp$3$$.init) {
    var $init$jscomp$5$$ = $response$jscomp$3$$.init;
    $isArray$$module$src$types$$($init$jscomp$5$$.headers) && $init$jscomp$5$$.headers.forEach(function($response$jscomp$3$$) {
      var $responseType$$ = $response$jscomp$3$$[1];
      $lowercasedHeaders$jscomp$1$$[String($response$jscomp$3$$[0]).toLowerCase()] = String($responseType$$);
    });
    $init$jscomp$5$$.status && ($data$jscomp$89$$.status = parseInt($init$jscomp$5$$.status, 10));
    $init$jscomp$5$$.statusText && ($data$jscomp$89$$.statusText = String($init$jscomp$5$$.statusText));
  }
  return new Response($response$jscomp$3$$.body ? String($response$jscomp$3$$.body) : "", $data$jscomp$89$$);
}
function $getViewerInterceptResponse$$module$src$utils$xhr_utils$$($win$jscomp$110$$, $ampdocSingle$jscomp$1$$, $input$jscomp$13$$, $init$jscomp$6$$) {
  if (!$ampdocSingle$jscomp$1$$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  var $whenUnblocked$$ = $init$jscomp$6$$.prerenderSafe ? $resolvedPromise$$module$src$resolved_promise$$() : $ampdocSingle$jscomp$1$$.whenFirstVisible(), $viewer$jscomp$3$$ = $Services$$module$src$services$viewerForDoc$$($ampdocSingle$jscomp$1$$), $urlIsProxy$$ = $isProxyOrigin$$module$src$url$$($input$jscomp$13$$), $viewerCanIntercept$$ = $viewer$jscomp$3$$.hasCapability("xhrInterceptor"), $interceptorDisabledForLocalDev$$ = $init$jscomp$6$$.bypassInterceptorForDev && $getMode$$module$src$mode$$($win$jscomp$110$$).localDev;
  return $urlIsProxy$$ || !$viewerCanIntercept$$ || $interceptorDisabledForLocalDev$$ || !$ampdocSingle$jscomp$1$$.getRootNode().documentElement.hasAttribute("allow-xhr-interception") ? $whenUnblocked$$ : $whenUnblocked$$.then(function() {
    return $viewer$jscomp$3$$.isTrustedViewer();
  }).then(function($ampdocSingle$jscomp$1$$) {
    if ($ampdocSingle$jscomp$1$$ || $getMode$$module$src$mode$$($win$jscomp$110$$).localDev || $isExperimentOn$$module$src$experiments$$($win$jscomp$110$$, "untrusted-xhr-interception")) {
      var $whenUnblocked$$ = $dict$$module$src$utils$object$$({originalRequest:$toStructuredCloneable$$module$src$utils$xhr_utils$$($input$jscomp$13$$, $init$jscomp$6$$)});
      return $viewer$jscomp$3$$.sendMessageAwaitResponse("xhr", $whenUnblocked$$).then(function($win$jscomp$110$$) {
        return $fromStructuredCloneable$$module$src$utils$xhr_utils$$($win$jscomp$110$$, $init$jscomp$6$$.responseType);
      });
    }
  });
}
function $setupInput$$module$src$utils$xhr_utils$$($win$jscomp$111$$, $input$jscomp$14$$, $init$jscomp$7$$) {
  $devAssert$$module$src$log$$("string" == typeof $input$jscomp$14$$);
  !1 !== $init$jscomp$7$$.ampCors && ($input$jscomp$14$$ = $getCorsUrl$$module$src$url$$($win$jscomp$111$$, $input$jscomp$14$$));
  return $input$jscomp$14$$;
}
function $setupInit$$module$src$utils$xhr_utils$$($init$jscomp$8_opt_init$jscomp$8$$, $opt_accept$$) {
  $init$jscomp$8_opt_init$jscomp$8$$ = $init$jscomp$8_opt_init$jscomp$8$$ || {};
  var $creds$$ = $init$jscomp$8_opt_init$jscomp$8$$.credentials;
  $devAssert$$module$src$log$$(void 0 === $creds$$ || "include" == $creds$$ || "omit" == $creds$$);
  var $JSCompiler_inline_result$jscomp$166_JSCompiler_method$jscomp$inline_411$$ = $init$jscomp$8_opt_init$jscomp$8$$.method;
  void 0 === $JSCompiler_inline_result$jscomp$166_JSCompiler_method$jscomp$inline_411$$ ? $JSCompiler_inline_result$jscomp$166_JSCompiler_method$jscomp$inline_411$$ = "GET" : ($JSCompiler_inline_result$jscomp$166_JSCompiler_method$jscomp$inline_411$$ = $JSCompiler_inline_result$jscomp$166_JSCompiler_method$jscomp$inline_411$$.toUpperCase(), $devAssert$$module$src$log$$($allowedMethods_$$module$src$utils$xhr_utils$$.includes($JSCompiler_inline_result$jscomp$166_JSCompiler_method$jscomp$inline_411$$)));
  $init$jscomp$8_opt_init$jscomp$8$$.method = $JSCompiler_inline_result$jscomp$166_JSCompiler_method$jscomp$inline_411$$;
  $init$jscomp$8_opt_init$jscomp$8$$.headers = $init$jscomp$8_opt_init$jscomp$8$$.headers || $dict$$module$src$utils$object$$({});
  $opt_accept$$ && ($init$jscomp$8_opt_init$jscomp$8$$.headers.Accept = $opt_accept$$);
  $devAssert$$module$src$log$$(null !== $init$jscomp$8_opt_init$jscomp$8$$.body);
  return $init$jscomp$8_opt_init$jscomp$8$$;
}
function $setupAMPCors$$module$src$utils$xhr_utils$$($targetOrigin$jscomp$1_win$jscomp$112$$, $input$jscomp$15$$, $init$jscomp$9$$) {
  $init$jscomp$9$$ = $init$jscomp$9$$ || {};
  var $currentOrigin$$ = $targetOrigin$jscomp$1_win$jscomp$112$$.origin || $parseUrlDeprecated$$module$src$url$$($targetOrigin$jscomp$1_win$jscomp$112$$.location.href).origin;
  $targetOrigin$jscomp$1_win$jscomp$112$$ = $parseUrlDeprecated$$module$src$url$$($input$jscomp$15$$).origin;
  $currentOrigin$$ == $targetOrigin$jscomp$1_win$jscomp$112$$ && ($init$jscomp$9$$.headers = $init$jscomp$9$$.headers || {}, $init$jscomp$9$$.headers["AMP-Same-Origin"] = "true");
  return $init$jscomp$9$$;
}
function $setupJsonFetchInit$$module$src$utils$xhr_utils$$($init$jscomp$10$$) {
  var $fetchInit$$ = $setupInit$$module$src$utils$xhr_utils$$($init$jscomp$10$$, "application/json");
  "POST" != $fetchInit$$.method || $isFormDataWrapper$$module$src$form_data_wrapper$$($fetchInit$$.body) || ($devAssert$$module$src$log$$($allowedJsonBodyTypes_$$module$src$utils$xhr_utils$$.some(function($init$jscomp$10$$) {
    return $init$jscomp$10$$($fetchInit$$.body);
  })), $fetchInit$$.headers["Content-Type"] = $fetchInit$$.headers["Content-Type"] || "text/plain;charset=utf-8", $fetchInit$$.body = "application/x-www-form-urlencoded" === $fetchInit$$.headers["Content-Type"] ? $serializeQueryString$$module$src$url$$($fetchInit$$.body) : JSON.stringify($fetchInit$$.body));
  return $fetchInit$$;
}
function $assertSuccess$$module$src$utils$xhr_utils$$($response$jscomp$5$$) {
  return new Promise(function($resolve$jscomp$20_status$jscomp$1$$) {
    if ($response$jscomp$5$$.ok) {
      return $resolve$jscomp$20_status$jscomp$1$$($response$jscomp$5$$);
    }
    $resolve$jscomp$20_status$jscomp$1$$ = $response$jscomp$5$$.status;
    var $err$jscomp$5$$ = $user$$module$src$log$$().createError("HTTP error " + $resolve$jscomp$20_status$jscomp$1$$);
    $err$jscomp$5$$.retriable = 415 == $resolve$jscomp$20_status$jscomp$1$$ || 500 <= $resolve$jscomp$20_status$jscomp$1$$ && 600 > $resolve$jscomp$20_status$jscomp$1$$;
    $err$jscomp$5$$.response = $response$jscomp$5$$;
    throw $err$jscomp$5$$;
  });
}
;function $Xhr$$module$src$service$xhr_impl$$($ampdocService$jscomp$3_win$jscomp$113$$) {
  this.win = $ampdocService$jscomp$3_win$jscomp$113$$;
  $ampdocService$jscomp$3_win$jscomp$113$$ = $Services$$module$src$services$ampdocServiceFor$$($ampdocService$jscomp$3_win$jscomp$113$$);
  this.$ampdocSingle_$ = $ampdocService$jscomp$3_win$jscomp$113$$.isSingleDoc() ? $ampdocService$jscomp$3_win$jscomp$113$$.getSingleDoc() : null;
}
$JSCompiler_prototypeAlias$$ = $Xhr$$module$src$service$xhr_impl$$.prototype;
$JSCompiler_prototypeAlias$$.$fetch_$ = function($input$jscomp$16$$, $init$jscomp$11$$) {
  var $$jscomp$arguments$$ = arguments, $$jscomp$this$jscomp$25$$ = this;
  return $getViewerInterceptResponse$$module$src$utils$xhr_utils$$(this.win, this.$ampdocSingle_$, $input$jscomp$16$$, $init$jscomp$11$$).then(function($input$jscomp$16$$) {
    if ($input$jscomp$16$$) {
      return $input$jscomp$16$$;
    }
    $isFormDataWrapper$$module$src$form_data_wrapper$$($init$jscomp$11$$.body) && ($init$jscomp$11$$.body = $init$jscomp$11$$.body.getFormData());
    return $$jscomp$this$jscomp$25$$.win.fetch.apply(null, $$jscomp$arguments$$);
  });
};
function $JSCompiler_StaticMethods_fetchAmpCors_$$($JSCompiler_StaticMethods_fetchAmpCors_$self$$, $input$jscomp$17$$, $init$jscomp$12$$) {
  $init$jscomp$12$$ = void 0 === $init$jscomp$12$$ ? {} : $init$jscomp$12$$;
  $input$jscomp$17$$ = $setupInput$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_fetchAmpCors_$self$$.win, $input$jscomp$17$$, $init$jscomp$12$$);
  $init$jscomp$12$$ = $setupAMPCors$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_fetchAmpCors_$self$$.win, $input$jscomp$17$$, $init$jscomp$12$$);
  return $JSCompiler_StaticMethods_fetchAmpCors_$self$$.$fetch_$($input$jscomp$17$$, $init$jscomp$12$$).then(function($JSCompiler_StaticMethods_fetchAmpCors_$self$$) {
    return $JSCompiler_StaticMethods_fetchAmpCors_$self$$;
  }, function($JSCompiler_StaticMethods_fetchAmpCors_$self$$) {
    var $init$jscomp$12$$ = $parseUrlDeprecated$$module$src$url$$($input$jscomp$17$$).origin;
    throw $user$$module$src$log$$().createExpectedError("XHR", "Failed fetching (" + $init$jscomp$12$$ + "/...):", $JSCompiler_StaticMethods_fetchAmpCors_$self$$ && $JSCompiler_StaticMethods_fetchAmpCors_$self$$.message);
  });
}
$JSCompiler_prototypeAlias$$.fetchJson = function($input$jscomp$18$$, $opt_init$jscomp$9$$) {
  return this.fetch($input$jscomp$18$$, $setupJsonFetchInit$$module$src$utils$xhr_utils$$($opt_init$jscomp$9$$));
};
$JSCompiler_prototypeAlias$$.fetchText = function($input$jscomp$19$$, $opt_init$jscomp$10$$) {
  return this.fetch($input$jscomp$19$$, $setupInit$$module$src$utils$xhr_utils$$($opt_init$jscomp$10$$, "text/plain"));
};
$JSCompiler_prototypeAlias$$.xssiJson = function($res$jscomp$4$$, $prefix$jscomp$6$$) {
  return $prefix$jscomp$6$$ ? $res$jscomp$4$$.text().then(function($res$jscomp$4$$) {
    return $startsWith$$module$src$string$$($res$jscomp$4$$, $prefix$jscomp$6$$) ? $parseJson$$module$src$json$$($res$jscomp$4$$.slice($prefix$jscomp$6$$.length)) : ($user$$module$src$log$$().warn("XHR", 'Failed to strip missing prefix "' + $prefix$jscomp$6$$ + '" in fetch response.'), $parseJson$$module$src$json$$($res$jscomp$4$$));
  }) : $res$jscomp$4$$.json();
};
$JSCompiler_prototypeAlias$$.fetch = function($input$jscomp$20$$, $init$jscomp$13_opt_init$jscomp$11$$) {
  $init$jscomp$13_opt_init$jscomp$11$$ = $setupInit$$module$src$utils$xhr_utils$$($init$jscomp$13_opt_init$jscomp$11$$);
  return $JSCompiler_StaticMethods_fetchAmpCors_$$(this, $input$jscomp$20$$, $init$jscomp$13_opt_init$jscomp$11$$).then(function($input$jscomp$20$$) {
    return $assertSuccess$$module$src$utils$xhr_utils$$($input$jscomp$20$$);
  });
};
$JSCompiler_prototypeAlias$$.sendSignal = function($input$jscomp$21$$, $opt_init$jscomp$12$$) {
  return $JSCompiler_StaticMethods_fetchAmpCors_$$(this, $input$jscomp$21$$, $opt_init$jscomp$12$$).then(function($input$jscomp$21$$) {
    return $assertSuccess$$module$src$utils$xhr_utils$$($input$jscomp$21$$);
  });
};
$JSCompiler_prototypeAlias$$.getCorsUrl = function($win$jscomp$114$$, $url$jscomp$48$$) {
  return $getCorsUrl$$module$src$url$$($win$jscomp$114$$, $url$jscomp$48$$);
};
function $BatchedXhr$$module$src$service$batched_xhr_impl$$($win$jscomp$115$$) {
  $Xhr$$module$src$service$xhr_impl$$.call(this, $win$jscomp$115$$);
  this.$fetchPromises_$ = $map$$module$src$utils$object$$();
}
$$jscomp$inherits$$($BatchedXhr$$module$src$service$batched_xhr_impl$$, $Xhr$$module$src$service$xhr_impl$$);
$BatchedXhr$$module$src$service$batched_xhr_impl$$.prototype.fetch = function($input$jscomp$22$$, $opt_init$jscomp$13$$) {
  var $$jscomp$this$jscomp$26$$ = this, $isBatchable$$ = !$opt_init$jscomp$13$$ || !$opt_init$jscomp$13$$.method || "GET" === $opt_init$jscomp$13$$.method, $key$jscomp$57$$ = $JSCompiler_StaticMethods_getMapKey_$$(this, $input$jscomp$22$$, $opt_init$jscomp$13$$ && $opt_init$jscomp$13$$.headers && $opt_init$jscomp$13$$.headers.Accept || ""), $isBatched$$ = !!this.$fetchPromises_$[$key$jscomp$57$$];
  if ($isBatchable$$ && $isBatched$$) {
    return this.$fetchPromises_$[$key$jscomp$57$$].then(function($input$jscomp$22$$) {
      return $input$jscomp$22$$.clone();
    });
  }
  var $fetchPromise$$ = $Xhr$$module$src$service$xhr_impl$$.prototype.fetch.call(this, $input$jscomp$22$$, $opt_init$jscomp$13$$);
  $isBatchable$$ && (this.$fetchPromises_$[$key$jscomp$57$$] = $fetchPromise$$.then(function($input$jscomp$22$$) {
    delete $$jscomp$this$jscomp$26$$.$fetchPromises_$[$key$jscomp$57$$];
    return $input$jscomp$22$$.clone();
  }, function($input$jscomp$22$$) {
    delete $$jscomp$this$jscomp$26$$.$fetchPromises_$[$key$jscomp$57$$];
    throw $input$jscomp$22$$;
  }));
  return $fetchPromise$$;
};
function $JSCompiler_StaticMethods_getMapKey_$$($JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$, $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$, $responseType$jscomp$1$$) {
  $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$ = $getSourceOrigin$$module$src$url$$($JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$.win.location);
  "string" == typeof $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$ && ($JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$));
  if ("function" == typeof URL) {
    $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$ = (new URL($JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$, $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$.href)).toString();
  } else {
    "string" == typeof $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$ && ($JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$));
    $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$ = $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$.replace(/\\/g, "/");
    var $JSCompiler_relativeUrl$jscomp$inline_892$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$);
    $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$ = $startsWith$$module$src$string$$($JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$.toLowerCase(), $JSCompiler_relativeUrl$jscomp$inline_892$$.protocol) ? $JSCompiler_relativeUrl$jscomp$inline_892$$.href : $startsWith$$module$src$string$$($JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$, "//") ? $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$.protocol + 
    $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$ : $startsWith$$module$src$string$$($JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$, "/") ? $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$.origin + $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$ : $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$.origin + 
    $JSCompiler_StaticMethods_getMapKey_$self_JSCompiler_baseUrl$jscomp$inline_414_JSCompiler_baseUrl$jscomp$inline_891$$.pathname.replace(/\/[^/]*$/, "/") + $JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$;
  }
  return $removeFragment$$module$src$url$$($JSCompiler_relativeUrlString$jscomp$inline_890_JSCompiler_temp$jscomp$844_input$jscomp$23$$) + $responseType$jscomp$1$$;
}
;function $getCookie$$module$src$cookies$$($i$jscomp$49_win$jscomp$125$$, $name$jscomp$103_value$jscomp$129$$) {
  var $cookieString$$ = $tryGetDocumentCookie_$$module$src$cookies$$($i$jscomp$49_win$jscomp$125$$);
  if (!$cookieString$$) {
    return null;
  }
  var $cookies$$ = $cookieString$$.split(";");
  for ($i$jscomp$49_win$jscomp$125$$ = 0; $i$jscomp$49_win$jscomp$125$$ < $cookies$$.length; $i$jscomp$49_win$jscomp$125$$++) {
    var $cookie$$ = $cookies$$[$i$jscomp$49_win$jscomp$125$$].trim(), $eq$$ = $cookie$$.indexOf("="), $JSCompiler_component$jscomp$inline_416_JSCompiler_temp$jscomp$136$$;
    if ($JSCompiler_component$jscomp$inline_416_JSCompiler_temp$jscomp$136$$ = -1 != $eq$$) {
      $JSCompiler_component$jscomp$inline_416_JSCompiler_temp$jscomp$136$$ = $cookie$$.substring(0, $eq$$).trim(), $JSCompiler_component$jscomp$inline_416_JSCompiler_temp$jscomp$136$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_component$jscomp$inline_416_JSCompiler_temp$jscomp$136$$, void 0) == $name$jscomp$103_value$jscomp$129$$;
    }
    if ($JSCompiler_component$jscomp$inline_416_JSCompiler_temp$jscomp$136$$) {
      return $name$jscomp$103_value$jscomp$129$$ = $cookie$$.substring($eq$$ + 1).trim(), $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($name$jscomp$103_value$jscomp$129$$, $name$jscomp$103_value$jscomp$129$$);
    }
  }
  return null;
}
function $tryGetDocumentCookie_$$module$src$cookies$$($win$jscomp$126$$) {
  try {
    return $win$jscomp$126$$.document.cookie;
  } catch ($e$jscomp$37$$) {
    return "";
  }
}
function $setCookie$$module$src$cookies$$($win$jscomp$127$$, $name$jscomp$104$$, $value$jscomp$130$$, $expirationTime$$) {
  var $options$jscomp$38$$ = {highestAvailableDomain:!0};
  $options$jscomp$38$$ = void 0 === $options$jscomp$38$$ ? {} : $options$jscomp$38$$;
  if ($options$jscomp$38$$.allowOnProxyOrigin) {
    $userAssert$$module$src$log$$(!$options$jscomp$38$$.highestAvailableDomain, "Could not support highestAvailable Domain on proxy origin, specify domain explicitly");
  } else {
    $userAssert$$module$src$log$$(!$isProxyOrigin$$module$src$url$$($win$jscomp$127$$.location.href), "Should never attempt to set cookie on proxy origin: " + $name$jscomp$104$$);
    var $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = $parseUrlDeprecated$$module$src$url$$($win$jscomp$127$$.location.href).hostname.toLowerCase(), $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$ = $parseUrlDeprecated$$module$src$url$$($urls$$module$src$config$$.cdn).hostname.toLowerCase();
    $userAssert$$module$src$log$$(!($JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ == $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$ || $endsWith$$module$src$string$$($JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$, 
    "." + $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$)), "Should never attempt to set cookie on proxy origin. (in depth check): " + $name$jscomp$104$$);
  }
  $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = void 0;
  if ($options$jscomp$38$$.domain) {
    $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = $options$jscomp$38$$.domain;
  } else {
    if ($options$jscomp$38$$.highestAvailableDomain) {
      a: {
        if ($JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = $win$jscomp$127$$.document.head && $win$jscomp$127$$.document.head.querySelector("meta[name='amp-cookie-scope']")) {
          $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$.getAttribute("content") || "", $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$ = $getSourceOrigin$$module$src$url$$($win$jscomp$127$$.location.href), 
          $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = $endsWith$$module$src$string$$($JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$, "." + $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$) ? 
          $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ : $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$.split("://")[1];
        } else {
          if (!$isProxyOrigin$$module$src$url$$($win$jscomp$127$$.location.href)) {
            $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = $win$jscomp$127$$.location.hostname.split(".");
            $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$ = $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$[$JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$.length - 1];
            var $JSCompiler_inline_result$jscomp$853_JSCompiler_testCookieName$jscomp$inline_895$$;
            for ($JSCompiler_inline_result$jscomp$853_JSCompiler_testCookieName$jscomp$inline_895$$ = "-test-amp-cookie-tmp"; $getCookie$$module$src$cookies$$($win$jscomp$127$$, $JSCompiler_inline_result$jscomp$853_JSCompiler_testCookieName$jscomp$inline_895$$);) {
              $JSCompiler_inline_result$jscomp$853_JSCompiler_testCookieName$jscomp$inline_895$$ = "-test-amp-cookie-tmp0";
            }
            for (var $JSCompiler_i$jscomp$inline_432$$ = $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$.length - 2; 0 <= $JSCompiler_i$jscomp$inline_432$$; $JSCompiler_i$jscomp$inline_432$$--) {
              if ($JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$ = $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$[$JSCompiler_i$jscomp$inline_432$$] + "." + $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$, $trySetCookie$$module$src$cookies$$($win$jscomp$127$$, 
              $JSCompiler_inline_result$jscomp$853_JSCompiler_testCookieName$jscomp$inline_895$$, "delete", Date.now() + 1000, $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$), "delete" == $getCookie$$module$src$cookies$$($win$jscomp$127$$, $JSCompiler_inline_result$jscomp$853_JSCompiler_testCookieName$jscomp$inline_895$$)) {
                $trySetCookie$$module$src$cookies$$($win$jscomp$127$$, $JSCompiler_inline_result$jscomp$853_JSCompiler_testCookieName$jscomp$inline_895$$, "delete", Date.now() - 1000, $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$);
                $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = $JSCompiler_domain$jscomp$inline_430_JSCompiler_proxy$jscomp$inline_423_JSCompiler_sourceOrigin$jscomp$inline_428$$;
                break a;
              }
            }
          }
          $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$ = null;
        }
      }
    }
  }
  $trySetCookie$$module$src$cookies$$($win$jscomp$127$$, $name$jscomp$104$$, $value$jscomp$130$$, $expirationTime$$, $JSCompiler_cookieScope$jscomp$inline_427_JSCompiler_current$jscomp$inline_422_JSCompiler_metaTag$jscomp$inline_426_JSCompiler_parts$jscomp$inline_429_domain$jscomp$2$$, $options$jscomp$38$$.sameSite, $options$jscomp$38$$.secure);
}
function $trySetCookie$$module$src$cookies$$($win$jscomp$129$$, $cookie$jscomp$1_name$jscomp$105$$, $value$jscomp$131$$, $expirationTime$jscomp$1$$, $domain$jscomp$4$$, $sameSite$$, $secure$$) {
  "ampproject.org" == $domain$jscomp$4$$ && ($value$jscomp$131$$ = "delete", $expirationTime$jscomp$1$$ = 0);
  $cookie$jscomp$1_name$jscomp$105$$ = encodeURIComponent($cookie$jscomp$1_name$jscomp$105$$) + "=" + encodeURIComponent($value$jscomp$131$$) + "; path=/" + ($domain$jscomp$4$$ ? "; domain=" + $domain$jscomp$4$$ : "") + "; expires=" + (new Date($expirationTime$jscomp$1$$)).toUTCString() + ($sameSite$$ ? "; SameSite=" + $sameSite$$ : "") + ($secure$$ ? "; Secure" : "");
  try {
    $win$jscomp$129$$.document.cookie = $cookie$jscomp$1_name$jscomp$105$$;
  } catch ($ignore$jscomp$1$$) {
  }
}
;function $GoogleCidApi$$module$src$service$cid_api$$($ampdoc$jscomp$22$$) {
  this.$win_$ = $ampdoc$jscomp$22$$.win;
  this.$timer_$ = $Services$$module$src$services$timerFor$$(this.$win_$);
  this.$cidPromise_$ = {};
  var $canonicalUrl$$ = $Services$$module$src$services$documentInfoForDoc$$($ampdoc$jscomp$22$$).canonicalUrl;
  this.$canonicalOrigin_$ = $canonicalUrl$$ ? $parseUrlDeprecated$$module$src$url$$($canonicalUrl$$).origin : null;
}
$GoogleCidApi$$module$src$service$cid_api$$.prototype.getScopedCid = function($apiKey$$, $scope$$) {
  var $$jscomp$this$jscomp$27$$ = this;
  if (this.$cidPromise_$[$scope$$]) {
    return this.$cidPromise_$[$scope$$];
  }
  var $token$jscomp$7$$;
  return this.$cidPromise_$[$scope$$] = this.$timer_$.poll(200, function() {
    $token$jscomp$7$$ = $getCookie$$module$src$cookies$$($$jscomp$this$jscomp$27$$.$win_$, "AMP_TOKEN");
    return "$RETRIEVING" !== $token$jscomp$7$$;
  }).then(function() {
    if ("$OPT_OUT" === $token$jscomp$7$$) {
      return "$OPT_OUT";
    }
    if (("$NOT_FOUND" !== $token$jscomp$7$$ || !$isProxyOrigin$$module$src$url$$($$jscomp$this$jscomp$27$$.$win_$.document.referrer)) && $token$jscomp$7$$ && "$" === $token$jscomp$7$$[0]) {
      return null;
    }
    $token$jscomp$7$$ && (!$token$jscomp$7$$ || "$" !== $token$jscomp$7$$[0]) || $JSCompiler_StaticMethods_persistToken_$$($$jscomp$this$jscomp$27$$, "$RETRIEVING", 30000);
    return $$jscomp$this$jscomp$27$$.$fetchCid_$("https://ampcid.google.com/v1/publisher:getClientId?key=" + $apiKey$$, $scope$$, $token$jscomp$7$$).then(function($response$jscomp$11$$) {
      var $cid$$ = $$jscomp$this$jscomp$27$$.$handleResponse_$($response$jscomp$11$$);
      return !$cid$$ && $response$jscomp$11$$.alternateUrl ? $$jscomp$this$jscomp$27$$.$fetchCid_$($response$jscomp$11$$.alternateUrl + "?key=" + $apiKey$$, $scope$$, $token$jscomp$7$$).then($$jscomp$this$jscomp$27$$.$handleResponse_$.bind($$jscomp$this$jscomp$27$$)) : $cid$$;
    }).catch(function($apiKey$$) {
      $JSCompiler_StaticMethods_persistToken_$$($$jscomp$this$jscomp$27$$, "$ERROR", 30000);
      $apiKey$$ && $apiKey$$.response ? $apiKey$$.response.json().then(function($apiKey$$) {
        $dev$$module$src$log$$().error("GoogleCidApi", JSON.stringify($apiKey$$));
      }) : $dev$$module$src$log$$().error("GoogleCidApi", $apiKey$$);
      return null;
    });
  });
};
$GoogleCidApi$$module$src$service$cid_api$$.prototype.$fetchCid_$ = function($url$jscomp$50$$, $payload$jscomp$1_scope$jscomp$1$$, $token$jscomp$8$$) {
  $payload$jscomp$1_scope$jscomp$1$$ = $dict$$module$src$utils$object$$({originScope:$payload$jscomp$1_scope$jscomp$1$$, canonicalOrigin:this.$canonicalOrigin_$});
  $token$jscomp$8$$ && ($payload$jscomp$1_scope$jscomp$1$$.securityToken = $token$jscomp$8$$);
  return this.$timer_$.timeoutPromise(30000, $getService$$module$src$service$$(this.$win_$, "xhr").fetchJson($url$jscomp$50$$, {method:"POST", ampCors:!1, credentials:"include", mode:"cors", body:$payload$jscomp$1_scope$jscomp$1$$}).then(function($url$jscomp$50$$) {
    return $url$jscomp$50$$.json();
  }));
};
$GoogleCidApi$$module$src$service$cid_api$$.prototype.$handleResponse_$ = function($res$jscomp$7$$) {
  if ($res$jscomp$7$$.optOut) {
    return $JSCompiler_StaticMethods_persistToken_$$(this, "$OPT_OUT", 31536E6), "$OPT_OUT";
  }
  if ($res$jscomp$7$$.clientId) {
    return $JSCompiler_StaticMethods_persistToken_$$(this, $res$jscomp$7$$.securityToken, 31536E6), $res$jscomp$7$$.clientId;
  }
  if ($res$jscomp$7$$.alternateUrl) {
    return null;
  }
  $JSCompiler_StaticMethods_persistToken_$$(this, "$NOT_FOUND", 36E5);
  return null;
};
function $JSCompiler_StaticMethods_persistToken_$$($JSCompiler_StaticMethods_persistToken_$self_JSCompiler_inline_result$jscomp$173$$, $tokenValue$$, $expires$$) {
  if ($tokenValue$$) {
    var $JSCompiler_temp_const$jscomp$172$$ = $JSCompiler_StaticMethods_persistToken_$self_JSCompiler_inline_result$jscomp$173$$.$win_$;
    $JSCompiler_StaticMethods_persistToken_$self_JSCompiler_inline_result$jscomp$173$$ = $JSCompiler_StaticMethods_persistToken_$self_JSCompiler_inline_result$jscomp$173$$.$win_$.Date.now() + $expires$$;
    $setCookie$$module$src$cookies$$($JSCompiler_temp_const$jscomp$172$$, "AMP_TOKEN", $tokenValue$$, $JSCompiler_StaticMethods_persistToken_$self_JSCompiler_inline_result$jscomp$173$$);
  }
}
;function $CacheCidApi$$module$src$service$cache_cid_api$$($ampdoc$jscomp$23$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$23$$;
  this.$viewer_$ = $Services$$module$src$services$viewerForDoc$$(this.$ampdoc_$);
  this.$publisherCidPromise_$ = null;
  this.$timer_$ = $Services$$module$src$services$timerFor$$(this.$ampdoc_$.win);
}
$CacheCidApi$$module$src$service$cache_cid_api$$.prototype.isSupported = function() {
  return this.$viewer_$.isCctEmbedded() && this.$viewer_$.isProxyOrigin();
};
$CacheCidApi$$module$src$service$cache_cid_api$$.prototype.getScopedCid = function($scope$jscomp$2$$) {
  var $$jscomp$this$jscomp$28$$ = this;
  if (!this.$viewer_$.isCctEmbedded()) {
    return Promise.resolve(null);
  }
  this.$publisherCidPromise_$ || (this.$publisherCidPromise_$ = this.$fetchCid_$("https://ampcid.google.com/v1/cache:getClientId?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc"));
  return this.$publisherCidPromise_$.then(function($publisherCid$$) {
    return $publisherCid$$ ? $JSCompiler_StaticMethods_scopeCid_$$($$jscomp$this$jscomp$28$$, $publisherCid$$, $scope$jscomp$2$$) : null;
  });
};
$CacheCidApi$$module$src$service$cache_cid_api$$.prototype.$fetchCid_$ = function($url$jscomp$52$$, $useAlternate$$) {
  var $$jscomp$this$jscomp$29$$ = this;
  $useAlternate$$ = void 0 === $useAlternate$$ ? !0 : $useAlternate$$;
  var $payload$jscomp$2$$ = $dict$$module$src$utils$object$$({publisherOrigin:$getSourceOrigin$$module$src$url$$(this.$ampdoc_$.win.location)});
  return this.$timer_$.timeoutPromise(30000, $getService$$module$src$service$$(this.$ampdoc_$.win, "xhr").fetchJson($url$jscomp$52$$, {method:"POST", ampCors:!1, credentials:"include", mode:"cors", body:$payload$jscomp$2$$}), "fetchCidTimeout").then(function($url$jscomp$52$$) {
    return $url$jscomp$52$$.json().then(function($url$jscomp$52$$) {
      if ($url$jscomp$52$$.optOut) {
        return null;
      }
      var $payload$jscomp$2$$ = $url$jscomp$52$$.publisherClientId;
      return !$payload$jscomp$2$$ && $useAlternate$$ && $url$jscomp$52$$.alternateUrl ? $$jscomp$this$jscomp$29$$.$fetchCid_$($url$jscomp$52$$.alternateUrl + "?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc", !1) : $payload$jscomp$2$$;
    });
  }).catch(function($url$jscomp$52$$) {
    $url$jscomp$52$$ && $url$jscomp$52$$.response ? $url$jscomp$52$$.response.json().then(function($url$jscomp$52$$) {
      $dev$$module$src$log$$().error("CacheCidApi", JSON.stringify($url$jscomp$52$$));
    }) : $url$jscomp$52$$ && "fetchCidTimeout" == $url$jscomp$52$$.message ? $dev$$module$src$log$$().expectedError("CacheCidApi", $url$jscomp$52$$) : $dev$$module$src$log$$().error("CacheCidApi", $url$jscomp$52$$);
    return null;
  });
};
function $JSCompiler_StaticMethods_scopeCid_$$($JSCompiler_StaticMethods_scopeCid_$self$$, $publisherCid$jscomp$1_text$jscomp$11$$, $scope$jscomp$3$$) {
  $publisherCid$jscomp$1_text$jscomp$11$$ = $publisherCid$jscomp$1_text$jscomp$11$$ + ";" + $scope$jscomp$3$$;
  return $getService$$module$src$service$$($JSCompiler_StaticMethods_scopeCid_$self$$.$ampdoc_$.win, "crypto").sha384Base64($publisherCid$jscomp$1_text$jscomp$11$$).then(function($JSCompiler_StaticMethods_scopeCid_$self$$) {
    return "amp-" + $JSCompiler_StaticMethods_scopeCid_$self$$;
  });
}
;function $ViewerCidApi$$module$src$service$viewer_cid_api$$($ampdoc$jscomp$24_canonicalUrl$jscomp$1$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$24_canonicalUrl$jscomp$1$$;
  this.$viewer_$ = $Services$$module$src$services$viewerForDoc$$(this.$ampdoc_$);
  this.$canonicalOrigin_$ = ($ampdoc$jscomp$24_canonicalUrl$jscomp$1$$ = $Services$$module$src$services$documentInfoForDoc$$(this.$ampdoc_$).canonicalUrl) ? $parseUrlDeprecated$$module$src$url$$($ampdoc$jscomp$24_canonicalUrl$jscomp$1$$).origin : null;
}
$ViewerCidApi$$module$src$service$viewer_cid_api$$.prototype.isSupported = function() {
  return this.$viewer_$.hasCapability("cid") ? this.$viewer_$.isTrustedViewer() : Promise.resolve(!1);
};
$ViewerCidApi$$module$src$service$viewer_cid_api$$.prototype.getScopedCid = function($apiKey$jscomp$1$$, $payload$jscomp$3_scope$jscomp$4$$) {
  $payload$jscomp$3_scope$jscomp$4$$ = $dict$$module$src$utils$object$$({scope:$payload$jscomp$3_scope$jscomp$4$$, clientIdApi:!!$apiKey$jscomp$1$$, canonicalOrigin:this.$canonicalOrigin_$});
  $apiKey$jscomp$1$$ && ($payload$jscomp$3_scope$jscomp$4$$.apiKey = $apiKey$jscomp$1$$);
  return this.$viewer_$.sendMessageAwaitResponse("cid", $payload$jscomp$3_scope$jscomp$4$$);
};
var $base64UrlEncodeSubs$$module$src$utils$base64$$ = {"+":"-", "/":"_", "=":"."};
function $base64UrlEncodeFromBytes$$module$src$utils$base64$$($bytes$jscomp$7_str$jscomp$15$$) {
  $bytes$jscomp$7_str$jscomp$15$$ = $bytesToString$$module$src$utils$bytes$$($bytes$jscomp$7_str$jscomp$15$$);
  return btoa($bytes$jscomp$7_str$jscomp$15$$).replace(/[+/=]/g, function($bytes$jscomp$7_str$jscomp$15$$) {
    return $base64UrlEncodeSubs$$module$src$utils$base64$$[$bytes$jscomp$7_str$jscomp$15$$];
  });
}
;var $SCOPE_NAME_VALIDATOR$$module$src$service$cid_impl$$ = /^[a-zA-Z0-9-_.]+$/, $CID_API_SCOPE_WHITELIST$$module$src$service$cid_impl$$ = {googleanalytics:"AMP_ECID_GOOGLE"}, $API_KEYS$$module$src$service$cid_impl$$ = {googleanalytics:"AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM"};
function $Cid$$module$src$service$cid_impl$$($ampdoc$jscomp$25$$) {
  this.ampdoc = $ampdoc$jscomp$25$$;
  this.$baseCid_$ = null;
  this.$externalCidCache_$ = Object.create(null);
  this.$cacheCidApi_$ = new $CacheCidApi$$module$src$service$cache_cid_api$$($ampdoc$jscomp$25$$);
  this.$viewerCidApi_$ = new $ViewerCidApi$$module$src$service$viewer_cid_api$$($ampdoc$jscomp$25$$);
  this.$cidApi_$ = new $GoogleCidApi$$module$src$service$cid_api$$($ampdoc$jscomp$25$$);
  this.$apiKeyMap_$ = null;
}
$Cid$$module$src$service$cid_impl$$.prototype.get = function($getCidStruct$$, $consent$jscomp$1$$, $opt_persistenceConsent$jscomp$2$$) {
  var $$jscomp$this$jscomp$30$$ = this;
  $userAssert$$module$src$log$$($SCOPE_NAME_VALIDATOR$$module$src$service$cid_impl$$.test($getCidStruct$$.scope) && $SCOPE_NAME_VALIDATOR$$module$src$service$cid_impl$$.test($getCidStruct$$.cookieName), "The CID scope and cookie name must only use the characters [a-zA-Z0-9-_.]+\nInstead found: %s", $getCidStruct$$.scope);
  return $consent$jscomp$1$$.then(function() {
    return $$jscomp$this$jscomp$30$$.ampdoc.whenFirstVisible();
  }).then(function() {
    return $isOptedOutOfCid$$module$src$service$cid_impl$$($$jscomp$this$jscomp$30$$.ampdoc);
  }).then(function($optedOut$$) {
    if ($optedOut$$) {
      return "";
    }
    var $cidPromise$$ = $JSCompiler_StaticMethods_getExternalCid_$$($$jscomp$this$jscomp$30$$, $getCidStruct$$, $opt_persistenceConsent$jscomp$2$$ || $consent$jscomp$1$$);
    return $Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$30$$.ampdoc.win).timeoutPromise(10000, $cidPromise$$, 'Getting cid for "' + $getCidStruct$$.scope + '" timed out').catch(function($getCidStruct$$) {
      $rethrowAsync$$module$src$log$$($getCidStruct$$);
    });
  });
};
$Cid$$module$src$service$cid_impl$$.prototype.optOut = function() {
  return $optOutOfCid$$module$src$service$cid_impl$$(this.ampdoc);
};
function $JSCompiler_StaticMethods_getExternalCid_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $getCidStruct$jscomp$1$$, $persistenceConsent$$) {
  var $scope$jscomp$5$$ = $getCidStruct$jscomp$1$$.scope, $url$jscomp$53$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getExternalCid_$self$$.ampdoc.win.location.href);
  if (!$isProxyOrigin$$module$src$url$$($url$jscomp$53$$)) {
    var $apiKey$jscomp$2$$ = $JSCompiler_StaticMethods_isScopeOptedIn_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $scope$jscomp$5$$);
    return $apiKey$jscomp$2$$ ? $JSCompiler_StaticMethods_getExternalCid_$self$$.$cidApi_$.getScopedCid($apiKey$jscomp$2$$, $scope$jscomp$5$$).then(function($url$jscomp$53$$) {
      return "$OPT_OUT" == $url$jscomp$53$$ ? null : $url$jscomp$53$$ ? ($setCidCookie$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_getExternalCid_$self$$.ampdoc.win, $getCidStruct$jscomp$1$$.cookieName || $scope$jscomp$5$$, $url$jscomp$53$$), $url$jscomp$53$$) : $getOrCreateCookie$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $getCidStruct$jscomp$1$$, $persistenceConsent$$);
    }) : $getOrCreateCookie$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $getCidStruct$jscomp$1$$, $persistenceConsent$$);
  }
  return $JSCompiler_StaticMethods_getExternalCid_$self$$.$viewerCidApi_$.isSupported().then(function($getCidStruct$jscomp$1$$) {
    if ($getCidStruct$jscomp$1$$) {
      var $apiKey$jscomp$2$$ = $JSCompiler_StaticMethods_isScopeOptedIn_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $scope$jscomp$5$$);
      return $JSCompiler_StaticMethods_getExternalCid_$self$$.$viewerCidApi_$.getScopedCid($apiKey$jscomp$2$$, $scope$jscomp$5$$);
    }
    return $JSCompiler_StaticMethods_getExternalCid_$self$$.$cacheCidApi_$.isSupported() && $JSCompiler_StaticMethods_isScopeOptedIn_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $scope$jscomp$5$$) ? $JSCompiler_StaticMethods_getExternalCid_$self$$.$cacheCidApi_$.getScopedCid($scope$jscomp$5$$).then(function($getCidStruct$jscomp$1$$) {
      return $getCidStruct$jscomp$1$$ ? $getCidStruct$jscomp$1$$ : $JSCompiler_StaticMethods_scopeBaseCid_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $persistenceConsent$$, $scope$jscomp$5$$, $url$jscomp$53$$);
    }) : $JSCompiler_StaticMethods_scopeBaseCid_$$($JSCompiler_StaticMethods_getExternalCid_$self$$, $persistenceConsent$$, $scope$jscomp$5$$, $url$jscomp$53$$);
  });
}
function $JSCompiler_StaticMethods_scopeBaseCid_$$($JSCompiler_StaticMethods_scopeBaseCid_$self$$, $persistenceConsent$jscomp$1$$, $scope$jscomp$6$$, $url$jscomp$54$$) {
  return $getBaseCid$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_scopeBaseCid_$self$$, $persistenceConsent$jscomp$1$$).then(function($persistenceConsent$jscomp$1$$) {
    return $getService$$module$src$service$$($JSCompiler_StaticMethods_scopeBaseCid_$self$$.ampdoc.win, "crypto").sha384Base64($persistenceConsent$jscomp$1$$ + $getProxySourceOrigin$$module$src$service$cid_impl$$($url$jscomp$54$$) + $scope$jscomp$6$$);
  });
}
function $JSCompiler_StaticMethods_isScopeOptedIn_$$($JSCompiler_StaticMethods_isScopeOptedIn_$self$$, $scope$jscomp$7$$) {
  $JSCompiler_StaticMethods_isScopeOptedIn_$self$$.$apiKeyMap_$ || ($JSCompiler_StaticMethods_isScopeOptedIn_$self$$.$apiKeyMap_$ = $JSCompiler_StaticMethods_getOptedInScopes_$$($JSCompiler_StaticMethods_isScopeOptedIn_$self$$));
  return $JSCompiler_StaticMethods_isScopeOptedIn_$self$$.$apiKeyMap_$[$scope$jscomp$7$$];
}
function $JSCompiler_StaticMethods_getOptedInScopes_$$($JSCompiler_StaticMethods_getOptedInScopes_$self$$) {
  var $apiKeyMap$$ = {}, $optInMeta$$ = $JSCompiler_StaticMethods_getOptedInScopes_$self$$.ampdoc.getMetaByName("amp-google-client-id-api");
  $optInMeta$$ && $optInMeta$$.split(",").forEach(function($JSCompiler_StaticMethods_getOptedInScopes_$self$$) {
    $JSCompiler_StaticMethods_getOptedInScopes_$self$$ = $JSCompiler_StaticMethods_getOptedInScopes_$self$$.trim();
    if (0 < $JSCompiler_StaticMethods_getOptedInScopes_$self$$.indexOf("=")) {
      var $optInMeta$$ = $JSCompiler_StaticMethods_getOptedInScopes_$self$$.split("=");
      $JSCompiler_StaticMethods_getOptedInScopes_$self$$ = $optInMeta$$[0].trim();
      $apiKeyMap$$[$JSCompiler_StaticMethods_getOptedInScopes_$self$$] = $optInMeta$$[1].trim();
    } else {
      var $item$jscomp$4_scope$34_scope$jscomp$8$$ = $JSCompiler_StaticMethods_getOptedInScopes_$self$$;
      ($JSCompiler_StaticMethods_getOptedInScopes_$self$$ = $CID_API_SCOPE_WHITELIST$$module$src$service$cid_impl$$[$item$jscomp$4_scope$34_scope$jscomp$8$$]) ? $apiKeyMap$$[$JSCompiler_StaticMethods_getOptedInScopes_$self$$] = $API_KEYS$$module$src$service$cid_impl$$[$item$jscomp$4_scope$34_scope$jscomp$8$$] : $user$$module$src$log$$().warn("CID", "Unsupported client for Google CID API: " + $item$jscomp$4_scope$34_scope$jscomp$8$$ + '.Please remove or correct meta[name="amp-google-client-id-api"]');
    }
  });
  return $apiKeyMap$$;
}
function $optOutOfCid$$module$src$service$cid_impl$$($ampdoc$jscomp$26$$) {
  $Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$26$$).sendMessage("cidOptOut", {});
  return $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$26$$), "storage").then(function($ampdoc$jscomp$26$$) {
    return $ampdoc$jscomp$26$$.set("amp-cid-optout", !0);
  });
}
function $isOptedOutOfCid$$module$src$service$cid_impl$$($ampdoc$jscomp$27$$) {
  return $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$27$$), "storage").then(function($ampdoc$jscomp$27$$) {
    return $ampdoc$jscomp$27$$.get("amp-cid-optout").then(function($ampdoc$jscomp$27$$) {
      return !!$ampdoc$jscomp$27$$;
    });
  }).catch(function() {
    return !1;
  });
}
function $setCidCookie$$module$src$service$cid_impl$$($win$jscomp$133$$, $scope$jscomp$9$$, $cookie$jscomp$2$$) {
  var $expiration$$ = Date.now() + 31536E6;
  $setCookie$$module$src$cookies$$($win$jscomp$133$$, $scope$jscomp$9$$, $cookie$jscomp$2$$, $expiration$$);
}
function $getOrCreateCookie$$module$src$service$cid_impl$$($cid$jscomp$2$$, $getCidStruct$jscomp$2$$, $persistenceConsent$jscomp$2$$) {
  var $win$jscomp$134$$ = $cid$jscomp$2$$.ampdoc.win, $scope$jscomp$10$$ = $getCidStruct$jscomp$2$$.scope, $cookieName$jscomp$1$$ = $getCidStruct$jscomp$2$$.cookieName || $scope$jscomp$10$$, $existingCookie$$ = $getCookie$$module$src$cookies$$($win$jscomp$134$$, $cookieName$jscomp$1$$);
  if (!$existingCookie$$ && !$getCidStruct$jscomp$2$$.createCookieIfNotPresent) {
    return Promise.resolve(null);
  }
  if ($existingCookie$$) {
    return /^amp-/.test($existingCookie$$) && $setCidCookie$$module$src$service$cid_impl$$($win$jscomp$134$$, $cookieName$jscomp$1$$, $existingCookie$$), Promise.resolve($existingCookie$$);
  }
  if ($cid$jscomp$2$$.$externalCidCache_$[$scope$jscomp$10$$]) {
    return $cid$jscomp$2$$.$externalCidCache_$[$scope$jscomp$10$$];
  }
  var $newCookiePromise$$ = $getRandomString64$$module$src$service$cid_impl$$($win$jscomp$134$$).then(function($cid$jscomp$2$$) {
    return "amp-" + $cid$jscomp$2$$;
  });
  Promise.all([$newCookiePromise$$, $persistenceConsent$jscomp$2$$]).then(function($cid$jscomp$2$$) {
    var $getCidStruct$jscomp$2$$ = $cid$jscomp$2$$[0];
    $getCookie$$module$src$cookies$$($win$jscomp$134$$, $cookieName$jscomp$1$$) || $setCidCookie$$module$src$service$cid_impl$$($win$jscomp$134$$, $cookieName$jscomp$1$$, $getCidStruct$jscomp$2$$);
  });
  return $cid$jscomp$2$$.$externalCidCache_$[$scope$jscomp$10$$] = $newCookiePromise$$;
}
function $getProxySourceOrigin$$module$src$service$cid_impl$$($url$jscomp$55$$) {
  $userAssert$$module$src$log$$($isProxyOrigin$$module$src$url$$($url$jscomp$55$$), "Expected proxy origin %s", $url$jscomp$55$$.origin);
  return $getSourceOrigin$$module$src$url$$($url$jscomp$55$$);
}
function $getBaseCid$$module$src$service$cid_impl$$($cid$jscomp$3$$, $persistenceConsent$jscomp$3$$) {
  if ($cid$jscomp$3$$.$baseCid_$) {
    return $cid$jscomp$3$$.$baseCid_$;
  }
  var $win$jscomp$135$$ = $cid$jscomp$3$$.ampdoc.win;
  return $cid$jscomp$3$$.$baseCid_$ = $read$$module$src$service$cid_impl$$($cid$jscomp$3$$.ampdoc).then(function($stored$$) {
    var $needsToStore$$ = !1;
    if ($stored$$ && !$isExpired$$module$src$service$cid_impl$$($stored$$)) {
      var $baseCid$jscomp$1$$ = Promise.resolve($stored$$.cid);
      $shouldUpdateStoredTime$$module$src$service$cid_impl$$($stored$$) && ($needsToStore$$ = !0);
    } else {
      $baseCid$jscomp$1$$ = $getService$$module$src$service$$($win$jscomp$135$$, "crypto").sha384Base64($getEntropy$$module$src$service$cid_impl$$($win$jscomp$135$$)), $needsToStore$$ = !0;
    }
    $needsToStore$$ && $baseCid$jscomp$1$$.then(function($win$jscomp$135$$) {
      $store$$module$src$service$cid_impl$$($cid$jscomp$3$$.ampdoc, $persistenceConsent$jscomp$3$$, $win$jscomp$135$$);
    });
    return $baseCid$jscomp$1$$;
  });
}
function $store$$module$src$service$cid_impl$$($ampdoc$jscomp$28$$, $persistenceConsent$jscomp$4$$, $cidString$$) {
  var $win$jscomp$136$$ = $ampdoc$jscomp$28$$.win;
  $isIframed$$module$src$dom$$($win$jscomp$136$$) ? $viewerBaseCid$$module$src$service$cid_impl$$($ampdoc$jscomp$28$$, $createCidData$$module$src$service$cid_impl$$($cidString$$)) : $persistenceConsent$jscomp$4$$.then(function() {
    try {
      $win$jscomp$136$$.localStorage.setItem("amp-cid", $createCidData$$module$src$service$cid_impl$$($cidString$$));
    } catch ($ignore$jscomp$2$$) {
    }
  });
}
function $viewerBaseCid$$module$src$service$cid_impl$$($ampdoc$jscomp$29$$, $opt_data$jscomp$2$$) {
  var $viewer$jscomp$4$$ = $Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$29$$);
  return $viewer$jscomp$4$$.isTrustedViewer().then(function($ampdoc$jscomp$29$$) {
    if ($ampdoc$jscomp$29$$) {
      return $dev$$module$src$log$$().expectedError("CID", "Viewer does not provide cap=cid"), $viewer$jscomp$4$$.sendMessageAwaitResponse("cid", $opt_data$jscomp$2$$).then(function($ampdoc$jscomp$29$$) {
        var $opt_data$jscomp$2$$;
        if ($opt_data$jscomp$2$$ = $ampdoc$jscomp$29$$) {
          try {
            var $viewer$jscomp$4$$ = $parseJson$$module$src$json$$($ampdoc$jscomp$29$$);
          } catch ($JSCompiler_e$jscomp$inline_441$$) {
            $viewer$jscomp$4$$ = null;
          }
          $opt_data$jscomp$2$$ = !$viewer$jscomp$4$$;
        }
        return $opt_data$jscomp$2$$ ? ($dev$$module$src$log$$().expectedError("CID", "invalid cid format"), JSON.stringify($dict$$module$src$utils$object$$({time:Date.now(), cid:$ampdoc$jscomp$29$$}))) : $ampdoc$jscomp$29$$;
      });
    }
  });
}
function $createCidData$$module$src$service$cid_impl$$($cidString$jscomp$1$$) {
  return JSON.stringify($dict$$module$src$utils$object$$({time:Date.now(), cid:$cidString$jscomp$1$$}));
}
function $read$$module$src$service$cid_impl$$($ampdoc$jscomp$30$$) {
  var $win$jscomp$137$$ = $ampdoc$jscomp$30$$.win;
  try {
    var $data$jscomp$91$$ = $win$jscomp$137$$.localStorage.getItem("amp-cid");
  } catch ($ignore$jscomp$3$$) {
  }
  var $dataPromise$$ = Promise.resolve($data$jscomp$91$$);
  !$data$jscomp$91$$ && $isIframed$$module$src$dom$$($win$jscomp$137$$) && ($dataPromise$$ = $viewerBaseCid$$module$src$service$cid_impl$$($ampdoc$jscomp$30$$));
  return $dataPromise$$.then(function($ampdoc$jscomp$30$$) {
    if (!$ampdoc$jscomp$30$$) {
      return null;
    }
    $ampdoc$jscomp$30$$ = $parseJson$$module$src$json$$($ampdoc$jscomp$30$$);
    return {time:$ampdoc$jscomp$30$$.time, cid:$ampdoc$jscomp$30$$.cid};
  });
}
function $isExpired$$module$src$service$cid_impl$$($storedCidInfo$$) {
  var $createdTime$$ = $storedCidInfo$$.time, $now$$ = Date.now();
  return $createdTime$$ + 31536E6 < $now$$;
}
function $shouldUpdateStoredTime$$module$src$service$cid_impl$$($createdTime$jscomp$1_storedCidInfo$jscomp$1$$) {
  $createdTime$jscomp$1_storedCidInfo$jscomp$1$$ = $createdTime$jscomp$1_storedCidInfo$jscomp$1$$.time;
  var $now$jscomp$1$$ = Date.now();
  return $createdTime$jscomp$1_storedCidInfo$jscomp$1$$ + 864E5 < $now$jscomp$1$$;
}
function $getEntropy$$module$src$service$cid_impl$$($win$jscomp$138$$) {
  var $JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$;
  if (($JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$ = $win$jscomp$138$$.crypto || $win$jscomp$138$$.msCrypto) && $JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$.getRandomValues) {
    var $JSCompiler_uint8array$jscomp$inline_446$$ = new Uint8Array(16);
    $JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$.getRandomValues($JSCompiler_uint8array$jscomp$inline_446$$);
    $JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$ = $JSCompiler_uint8array$jscomp$inline_446$$;
  } else {
    $JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$ = null;
  }
  return $JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$ ? $JSCompiler_cryptoLib$jscomp$inline_445_JSCompiler_inline_result$jscomp$124_uint8array$jscomp$1$$ : String($win$jscomp$138$$.location.href + Date.now() + $win$jscomp$138$$.Math.random() + $win$jscomp$138$$.screen.width + $win$jscomp$138$$.screen.height);
}
function $getRandomString64$$module$src$service$cid_impl$$($win$jscomp$139$$) {
  var $entropy$$ = $getEntropy$$module$src$service$cid_impl$$($win$jscomp$139$$);
  return "string" == typeof $entropy$$ ? $getService$$module$src$service$$($win$jscomp$139$$, "crypto").sha384Base64($entropy$$) : $tryResolve$$module$src$utils$promise$$(function() {
    return $base64UrlEncodeFromBytes$$module$src$utils$base64$$($entropy$$).replace(/\.+$/, "");
  });
}
;function $Crypto$$module$src$service$crypto_impl$$($win$jscomp$140$$) {
  this.$win_$ = $win$jscomp$140$$;
  var $subtle$$ = null, $isLegacyWebkit$$ = !1;
  $win$jscomp$140$$.crypto && ($win$jscomp$140$$.crypto.subtle ? $subtle$$ = $win$jscomp$140$$.crypto.subtle : $win$jscomp$140$$.crypto.webkitSubtle && ($subtle$$ = $win$jscomp$140$$.crypto.webkitSubtle, $isLegacyWebkit$$ = !0));
  this.pkcsAlgo = {name:"RSASSA-PKCS1-v1_5", hash:{name:"SHA-256"}};
  this.subtle = $subtle$$;
  this.$isLegacyWebkit_$ = $isLegacyWebkit$$;
  this.$polyfillPromise_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Crypto$$module$src$service$crypto_impl$$.prototype;
$JSCompiler_prototypeAlias$$.sha384 = function($input$jscomp$24$$) {
  var $$jscomp$this$jscomp$33$$ = this;
  "string" === typeof $input$jscomp$24$$ && ($input$jscomp$24$$ = $stringToBytes$$module$src$utils$bytes$$($input$jscomp$24$$));
  if (!this.subtle || this.$polyfillPromise_$) {
    return (this.$polyfillPromise_$ || $JSCompiler_StaticMethods_loadPolyfill_$$(this)).then(function($$jscomp$this$jscomp$33$$) {
      return $$jscomp$this$jscomp$33$$($input$jscomp$24$$);
    });
  }
  try {
    return this.subtle.digest({name:"SHA-384"}, $input$jscomp$24$$).then(function($input$jscomp$24$$) {
      return new Uint8Array($input$jscomp$24$$);
    }, function($e$jscomp$40$$) {
      $e$jscomp$40$$.message && 0 > $e$jscomp$40$$.message.indexOf("secure origin") && $user$$module$src$log$$().error("Crypto", "SubtleCrypto failed, fallback to closure lib.", $e$jscomp$40$$);
      return $JSCompiler_StaticMethods_loadPolyfill_$$($$jscomp$this$jscomp$33$$).then(function() {
        return $$jscomp$this$jscomp$33$$.sha384($input$jscomp$24$$);
      });
    });
  } catch ($e$jscomp$41$$) {
    return $dev$$module$src$log$$().error("Crypto", "SubtleCrypto failed, fallback to closure lib.", $e$jscomp$41$$), $JSCompiler_StaticMethods_loadPolyfill_$$(this).then(function() {
      return $$jscomp$this$jscomp$33$$.sha384($input$jscomp$24$$);
    });
  }
};
$JSCompiler_prototypeAlias$$.sha384Base64 = function($input$jscomp$25$$) {
  return this.sha384($input$jscomp$25$$).then(function($input$jscomp$25$$) {
    return $base64UrlEncodeFromBytes$$module$src$utils$base64$$($input$jscomp$25$$);
  });
};
$JSCompiler_prototypeAlias$$.uniform = function($input$jscomp$26$$) {
  return this.sha384($input$jscomp$26$$).then(function($input$jscomp$26$$) {
    for (var $buffer$jscomp$18$$ = 0, $i$jscomp$51$$ = 2; 0 <= $i$jscomp$51$$; $i$jscomp$51$$--) {
      $buffer$jscomp$18$$ = ($buffer$jscomp$18$$ + $input$jscomp$26$$[$i$jscomp$51$$]) / 256;
    }
    return $buffer$jscomp$18$$;
  });
};
function $JSCompiler_StaticMethods_loadPolyfill_$$($JSCompiler_StaticMethods_loadPolyfill_$self$$) {
  return $JSCompiler_StaticMethods_loadPolyfill_$self$$.$polyfillPromise_$ ? $JSCompiler_StaticMethods_loadPolyfill_$self$$.$polyfillPromise_$ : $JSCompiler_StaticMethods_loadPolyfill_$self$$.$polyfillPromise_$ = $Services$$module$src$services$extensionsFor$$($JSCompiler_StaticMethods_loadPolyfill_$self$$.$win_$).preloadExtension("amp-crypto-polyfill").then(function() {
    return $getService$$module$src$service$$($JSCompiler_StaticMethods_loadPolyfill_$self$$.$win_$, "crypto-polyfill");
  });
}
$JSCompiler_prototypeAlias$$.isPkcsAvailable = function() {
  return !!this.subtle && !1 !== this.$win_$.isSecureContext;
};
$JSCompiler_prototypeAlias$$.importPkcsKey = function($jwk$$) {
  $devAssert$$module$src$log$$(this.isPkcsAvailable());
  var $keyData$jscomp$1$$ = this.$isLegacyWebkit_$ ? $utf8Encode$$module$src$utils$bytes$$(JSON.stringify($jwk$$)) : $jwk$$;
  return this.subtle.importKey("jwk", $keyData$jscomp$1$$, this.pkcsAlgo, !0, ["verify"]);
};
$JSCompiler_prototypeAlias$$.verifyPkcs = function($key$jscomp$58$$, $signature$jscomp$1$$, $data$jscomp$93$$) {
  $devAssert$$module$src$log$$(this.isPkcsAvailable());
  return this.subtle.verify(this.pkcsAlgo, $key$jscomp$58$$, $signature$jscomp$1$$, $data$jscomp$93$$);
};
var $filteredLinkRels$$module$src$service$document_info_impl$$ = ["prefetch", "preload", "preconnect", "dns-prefetch"];
function $DocInfo$$module$src$service$document_info_impl$$($ampdoc$jscomp$33$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$33$$;
  this.$pageViewId64_$ = this.$info_$ = null;
}
$DocInfo$$module$src$service$document_info_impl$$.prototype.get = function() {
  if (this.$info_$) {
    return this.$info_$;
  }
  var $ampdoc$jscomp$34$$ = this.$ampdoc_$, $canonicalUrl$jscomp$2_url$jscomp$56$$ = $ampdoc$jscomp$34$$.getUrl(), $sourceUrl$$ = $getSourceUrl$$module$src$url$$($canonicalUrl$jscomp$2_url$jscomp$56$$), $rootNode$jscomp$2_viewport$jscomp$1$$ = $ampdoc$jscomp$34$$.getRootNode();
  $canonicalUrl$jscomp$2_url$jscomp$56$$ = $rootNode$jscomp$2_viewport$jscomp$1$$ && $rootNode$jscomp$2_viewport$jscomp$1$$.AMP && $rootNode$jscomp$2_viewport$jscomp$1$$.AMP.canonicalUrl;
  if (!$canonicalUrl$jscomp$2_url$jscomp$56$$) {
    var $canonicalTag$$ = $rootNode$jscomp$2_viewport$jscomp$1$$.querySelector("link[rel=canonical]");
    $canonicalUrl$jscomp$2_url$jscomp$56$$ = $canonicalTag$$ ? $parseUrlDeprecated$$module$src$url$$($canonicalTag$$.href).href : $sourceUrl$$;
  }
  var $pageViewId$$ = String(Math.floor(10000 * $ampdoc$jscomp$34$$.win.Math.random())), $linkRels$$ = $getLinkRels$$module$src$service$document_info_impl$$($ampdoc$jscomp$34$$.win.document);
  $rootNode$jscomp$2_viewport$jscomp$1$$ = $getViewport$$module$src$service$document_info_impl$$($ampdoc$jscomp$34$$.win.document);
  var $replaceParams$$ = $getReplaceParams$$module$src$service$document_info_impl$$($ampdoc$jscomp$34$$);
  return this.$info_$ = {get sourceUrl() {
    return $getSourceUrl$$module$src$url$$($ampdoc$jscomp$34$$.getUrl());
  }, canonicalUrl:$canonicalUrl$jscomp$2_url$jscomp$56$$, pageViewId:$pageViewId$$, get pageViewId64() {
    this.$pageViewId64_$ || (this.$pageViewId64_$ = $getRandomString64$$module$src$service$cid_impl$$($ampdoc$jscomp$34$$.win));
    return this.$pageViewId64_$;
  }, linkRels:$linkRels$$, viewport:$rootNode$jscomp$2_viewport$jscomp$1$$, replaceParams:$replaceParams$$};
};
function $getLinkRels$$module$src$service$document_info_impl$$($doc$jscomp$27_links$jscomp$1$$) {
  var $linkRels$jscomp$1$$ = $map$$module$src$utils$object$$();
  if ($doc$jscomp$27_links$jscomp$1$$.head) {
    $doc$jscomp$27_links$jscomp$1$$ = $doc$jscomp$27_links$jscomp$1$$.head.querySelectorAll("link[rel]");
    for (var $$jscomp$loop$95$$ = {}, $i$jscomp$52$$ = 0; $i$jscomp$52$$ < $doc$jscomp$27_links$jscomp$1$$.length; $$jscomp$loop$95$$ = {$$jscomp$loop$prop$href$96$:$$jscomp$loop$95$$.$$jscomp$loop$prop$href$96$}, $i$jscomp$52$$++) {
      var $link$$ = $doc$jscomp$27_links$jscomp$1$$[$i$jscomp$52$$];
      $$jscomp$loop$95$$.$$jscomp$loop$prop$href$96$ = $link$$.href;
      var $rels$$ = $link$$.getAttribute("rel");
      $rels$$ && $$jscomp$loop$95$$.$$jscomp$loop$prop$href$96$ && $rels$$.split(/\s+/).forEach(function($doc$jscomp$27_links$jscomp$1$$) {
        return function($$jscomp$loop$95$$) {
          if (-1 == $filteredLinkRels$$module$src$service$document_info_impl$$.indexOf($$jscomp$loop$95$$)) {
            var $i$jscomp$52$$ = $linkRels$jscomp$1$$[$$jscomp$loop$95$$];
            $i$jscomp$52$$ ? ($isArray$$module$src$types$$($i$jscomp$52$$) || ($i$jscomp$52$$ = $linkRels$jscomp$1$$[$$jscomp$loop$95$$] = [$i$jscomp$52$$]), $i$jscomp$52$$.push($doc$jscomp$27_links$jscomp$1$$.$$jscomp$loop$prop$href$96$)) : $linkRels$jscomp$1$$[$$jscomp$loop$95$$] = $doc$jscomp$27_links$jscomp$1$$.$$jscomp$loop$prop$href$96$;
          }
        };
      }($$jscomp$loop$95$$));
    }
  }
  return $linkRels$jscomp$1$$;
}
function $getViewport$$module$src$service$document_info_impl$$($doc$jscomp$28$$) {
  var $viewportEl$$ = $doc$jscomp$28$$.head.querySelector('meta[name="viewport"]');
  return $viewportEl$$ ? $viewportEl$$.getAttribute("content") : null;
}
function $getReplaceParams$$module$src$service$document_info_impl$$($ampdoc$jscomp$35_url$jscomp$57$$) {
  var $JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$;
  ($JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$ = !$ampdoc$jscomp$35_url$jscomp$57$$.isSingleDoc()) || ($JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$ = $ampdoc$jscomp$35_url$jscomp$57$$.win.location.href, "string" == typeof $JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$ && ($JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$)), $JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$ = 
  "a" != ($isProxyOrigin$$module$src$url$$($JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$) ? $JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$.pathname.split("/", 2)[1] : null));
  if ($JSCompiler_temp$jscomp$132_JSCompiler_url$jscomp$inline_448$$) {
    return null;
  }
  $ampdoc$jscomp$35_url$jscomp$57$$ = $parseUrlDeprecated$$module$src$url$$($ampdoc$jscomp$35_url$jscomp$57$$.win.location.href);
  var $replaceRaw$$ = $parseQueryString_$$module$src$url_parse_query_string$$($ampdoc$jscomp$35_url$jscomp$57$$.search).amp_r;
  return void 0 === $replaceRaw$$ ? null : $parseQueryString_$$module$src$url_parse_query_string$$($replaceRaw$$);
}
;var $trackImpressionPromise$$module$src$impression$$ = null, $DEFAULT_APPEND_URL_PARAM$$module$src$impression$$ = ["gclid", "gclsrc"], $TRUSTED_REFERRER_HOSTS$$module$src$impression$$ = [/^t.co$/];
function $getTrackImpressionPromise$$module$src$impression$$() {
  return $userAssert$$module$src$log$$($trackImpressionPromise$$module$src$impression$$, "E#19457 trackImpressionPromise");
}
function $maybeTrackImpression$$module$src$impression$$() {
  var $win$jscomp$143$$ = self, $$jscomp$destructuring$var71_viewer$jscomp$5$$ = new $Deferred$$module$src$utils$promise$$, $promise$jscomp$16$$ = $$jscomp$destructuring$var71_viewer$jscomp$5$$.promise, $resolveImpression$$ = $$jscomp$destructuring$var71_viewer$jscomp$5$$.resolve;
  $trackImpressionPromise$$module$src$impression$$ = $Services$$module$src$services$timerFor$$($win$jscomp$143$$).timeoutPromise(8000, $promise$jscomp$16$$, "TrackImpressionPromise timeout").catch(function($win$jscomp$143$$) {
    $dev$$module$src$log$$().warn("IMPRESSION", $win$jscomp$143$$);
  });
  $$jscomp$destructuring$var71_viewer$jscomp$5$$ = $Services$$module$src$services$viewerForDoc$$($win$jscomp$143$$.document.documentElement);
  var $isTrustedViewerPromise$$ = $$jscomp$destructuring$var71_viewer$jscomp$5$$.isTrustedViewer(), $isTrustedReferrerPromise$$ = $$jscomp$destructuring$var71_viewer$jscomp$5$$.getReferrerUrl().then(function($win$jscomp$143$$) {
    return $isTrustedReferrer$$module$src$impression$$($win$jscomp$143$$);
  });
  Promise.all([$isTrustedViewerPromise$$, $isTrustedReferrerPromise$$]).then(function($$jscomp$destructuring$var71_viewer$jscomp$5$$) {
    var $promise$jscomp$16$$ = $$jscomp$destructuring$var71_viewer$jscomp$5$$[1];
    if ($$jscomp$destructuring$var71_viewer$jscomp$5$$[0] || $promise$jscomp$16$$ || $isExperimentOn$$module$src$experiments$$($win$jscomp$143$$, "alp")) {
      var $isTrustedViewerPromise$$ = $handleReplaceUrl$$module$src$impression$$($win$jscomp$143$$), $isTrustedReferrerPromise$$ = $handleClickUrl$$module$src$impression$$($win$jscomp$143$$);
      Promise.all([$isTrustedViewerPromise$$, $isTrustedReferrerPromise$$]).then(function() {
        $resolveImpression$$();
      }, function() {
      });
    } else {
      $resolveImpression$$();
    }
  });
}
function $handleReplaceUrl$$module$src$impression$$($win$jscomp$144$$) {
  var $viewer$jscomp$6$$ = $Services$$module$src$services$viewerForDoc$$($win$jscomp$144$$.document.documentElement);
  return $viewer$jscomp$6$$.getParam("replaceUrl") ? $viewer$jscomp$6$$.hasCapability("replaceUrl") ? $viewer$jscomp$6$$.sendMessageAwaitResponse("getReplaceUrl", void 0).then(function($win$jscomp$144$$) {
    $win$jscomp$144$$ && "object" == typeof $win$jscomp$144$$ ? $viewer$jscomp$6$$.replaceUrl($win$jscomp$144$$.replaceUrl || null) : $dev$$module$src$log$$().warn("IMPRESSION", "get invalid replaceUrl response");
  }, function($win$jscomp$144$$) {
    $dev$$module$src$log$$().warn("IMPRESSION", "Error request replaceUrl from viewer", $win$jscomp$144$$);
  }) : ($viewer$jscomp$6$$.replaceUrl($viewer$jscomp$6$$.getParam("replaceUrl") || null), $resolvedPromise$$module$src$resolved_promise$$()) : $resolvedPromise$$module$src$resolved_promise$$();
}
function $isTrustedReferrer$$module$src$impression$$($referrer$jscomp$1$$) {
  var $url$jscomp$58$$ = $parseUrlDeprecated$$module$src$url$$($referrer$jscomp$1$$);
  return "https:" != $url$jscomp$58$$.protocol ? !1 : $TRUSTED_REFERRER_HOSTS$$module$src$impression$$.some(function($referrer$jscomp$1$$) {
    return $referrer$jscomp$1$$.test($url$jscomp$58$$.hostname);
  });
}
function $handleClickUrl$$module$src$impression$$($win$jscomp$145$$) {
  var $ampdoc$jscomp$36$$ = $getAmpdoc$$module$src$service$$($win$jscomp$145$$.document.documentElement), $clickUrl$$ = $Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$36$$).getParam("click");
  if (!$clickUrl$$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  if (0 != $clickUrl$$.indexOf("https://")) {
    return $user$$module$src$log$$().warn("IMPRESSION", "click fragment param should start with https://. Found ", $clickUrl$$), $resolvedPromise$$module$src$resolved_promise$$();
  }
  $win$jscomp$145$$.location.hash && ($win$jscomp$145$$.location.hash = "");
  return $ampdoc$jscomp$36$$.whenFirstVisible().then(function() {
    return $invoke$$module$src$impression$$($win$jscomp$145$$, $clickUrl$$);
  }).then(function($ampdoc$jscomp$36$$) {
    if ($ampdoc$jscomp$36$$) {
      var $clickUrl$$ = $ampdoc$jscomp$36$$.location;
      ($ampdoc$jscomp$36$$ = $ampdoc$jscomp$36$$.tracking_url || $clickUrl$$) && !$isProxyOrigin$$module$src$url$$($ampdoc$jscomp$36$$) && ((new Image).src = $ampdoc$jscomp$36$$);
      if ($clickUrl$$ && $win$jscomp$145$$.history.replaceState) {
        $ampdoc$jscomp$36$$ = $Services$$module$src$services$viewerForDoc$$($win$jscomp$145$$.document.documentElement);
        var $JSCompiler_trackUrl$jscomp$inline_453_JSCompiler_viewer$jscomp$inline_454_response$jscomp$14$$ = $win$jscomp$145$$.location.href;
        $clickUrl$$ = $parseUrlDeprecated$$module$src$url$$($clickUrl$$);
        $clickUrl$$ = $parseQueryString_$$module$src$url_parse_query_string$$($clickUrl$$.search);
        $clickUrl$$ = $addParamsToUrl$$module$src$url$$($JSCompiler_trackUrl$jscomp$inline_453_JSCompiler_viewer$jscomp$inline_454_response$jscomp$14$$, $clickUrl$$);
        $win$jscomp$145$$.history.replaceState(null, "", $clickUrl$$);
        $ampdoc$jscomp$36$$.maybeUpdateFragmentForCct();
      }
    }
  }).catch(function($win$jscomp$145$$) {
    $user$$module$src$log$$().warn("IMPRESSION", "Error on request clickUrl: ", $win$jscomp$145$$);
  });
}
function $invoke$$module$src$impression$$($win$jscomp$146$$, $clickUrl$jscomp$1$$) {
  $getMode$$module$src$mode$$().localDev && !$getMode$$module$src$mode$$().test && ($clickUrl$jscomp$1$$ = "http://localhost:8000/impression-proxy?url=" + $clickUrl$jscomp$1$$);
  return $getService$$module$src$service$$($win$jscomp$146$$, "xhr").fetchJson($clickUrl$jscomp$1$$, {credentials:"include"}).then(function($win$jscomp$146$$) {
    return 204 == $win$jscomp$146$$.status ? null : $win$jscomp$146$$.json();
  });
}
function $shouldAppendExtraParams$$module$src$impression$$($ampdoc$jscomp$37$$) {
  return $ampdoc$jscomp$37$$.whenReady().then(function() {
    return !!$ampdoc$jscomp$37$$.getBody().querySelector("amp-analytics[type=googleanalytics]");
  });
}
;function $PriorityQueue$$module$src$utils$priority_queue$$() {
  this.$queue_$ = [];
}
$PriorityQueue$$module$src$utils$priority_queue$$.prototype.peek = function() {
  var $l$$ = this.$queue_$.length;
  return $l$$ ? this.$queue_$[$l$$ - 1].item : null;
};
$PriorityQueue$$module$src$utils$priority_queue$$.prototype.enqueue = function($item$jscomp$6$$, $priority$$) {
  if (isNaN($priority$$)) {
    throw Error("Priority must not be NaN.");
  }
  for (var $JSCompiler_i$jscomp$inline_462$$ = -1, $JSCompiler_lo$jscomp$inline_463$$ = 0, $JSCompiler_hi$jscomp$inline_464$$ = this.$queue_$.length; $JSCompiler_lo$jscomp$inline_463$$ <= $JSCompiler_hi$jscomp$inline_464$$;) {
    $JSCompiler_i$jscomp$inline_462$$ = Math.floor(($JSCompiler_lo$jscomp$inline_463$$ + $JSCompiler_hi$jscomp$inline_464$$) / 2);
    if ($JSCompiler_i$jscomp$inline_462$$ === this.$queue_$.length) {
      break;
    }
    if (this.$queue_$[$JSCompiler_i$jscomp$inline_462$$].priority < $priority$$) {
      $JSCompiler_lo$jscomp$inline_463$$ = $JSCompiler_i$jscomp$inline_462$$ + 1;
    } else {
      if (0 < $JSCompiler_i$jscomp$inline_462$$ && this.$queue_$[$JSCompiler_i$jscomp$inline_462$$ - 1].priority >= $priority$$) {
        $JSCompiler_hi$jscomp$inline_464$$ = $JSCompiler_i$jscomp$inline_462$$ - 1;
      } else {
        break;
      }
    }
  }
  this.$queue_$.splice($JSCompiler_i$jscomp$inline_462$$, 0, {item:$item$jscomp$6$$, priority:$priority$$});
};
$PriorityQueue$$module$src$utils$priority_queue$$.prototype.forEach = function($callback$jscomp$69$$) {
  for (var $index$jscomp$82$$ = this.$queue_$.length; $index$jscomp$82$$--;) {
    $callback$jscomp$69$$(this.$queue_$[$index$jscomp$82$$].item);
  }
};
$PriorityQueue$$module$src$utils$priority_queue$$.prototype.dequeue = function() {
  return this.$queue_$.length ? this.$queue_$.pop().item : null;
};
$$jscomp$global$$.Object.defineProperties($PriorityQueue$$module$src$utils$priority_queue$$.prototype, {length:{configurable:!0, enumerable:!0, get:function() {
  return this.$queue_$.length;
}}});
var $VALID_TARGETS$$module$src$service$navigation$$ = ["_top", "_blank"];
function $Navigation$$module$src$service$navigation$$($ampdoc$jscomp$40$$, $opt_rootNode$$) {
  var $$jscomp$this$jscomp$35$$ = this;
  this.ampdoc = $ampdoc$jscomp$40$$;
  this.$rootNode_$ = $opt_rootNode$$ || $ampdoc$jscomp$40$$.getRootNode();
  this.$viewport_$ = $Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$viewer_$ = $Services$$module$src$services$viewerForDoc$$(this.ampdoc);
  this.$history_$ = $getServiceForDoc$$module$src$service$$(this.ampdoc, "history");
  this.$platform_$ = $Services$$module$src$services$platformFor$$(this.ampdoc.win);
  this.$isIosSafari_$ = this.$platform_$.isIos() && this.$platform_$.isSafari();
  this.$isIframed_$ = $isIframed$$module$src$dom$$(this.ampdoc.win) && this.$viewer_$.isOvertakeHistory();
  this.$isEmbed_$ = this.$rootNode_$ != this.ampdoc.getRootNode() || !!this.ampdoc.getParent();
  this.$isInABox_$ = "inabox" == $getMode$$module$src$mode$$(this.ampdoc.win).runtime;
  this.$serviceContext_$ = this.$rootNode_$.nodeType == Node.DOCUMENT_NODE ? this.$rootNode_$.documentElement : this.$rootNode_$;
  this.$boundHandle_$ = this.$handle_$.bind(this);
  this.$rootNode_$.addEventListener("click", this.$boundHandle_$);
  this.$rootNode_$.addEventListener("contextmenu", this.$boundHandle_$);
  this.$appendExtraParams_$ = !1;
  $shouldAppendExtraParams$$module$src$impression$$(this.ampdoc).then(function($ampdoc$jscomp$40$$) {
    $$jscomp$this$jscomp$35$$.$appendExtraParams_$ = $ampdoc$jscomp$40$$;
  });
  this.$isLocalViewer_$ = this.$isTrustedViewer_$ = !1;
  Promise.all([this.$viewer_$.isTrustedViewer(), this.$viewer_$.getViewerOrigin()]).then(function($ampdoc$jscomp$40$$) {
    $$jscomp$this$jscomp$35$$.$isTrustedViewer_$ = $ampdoc$jscomp$40$$[0];
    $ampdoc$jscomp$40$$ = $ampdoc$jscomp$40$$[1];
    "string" == typeof $ampdoc$jscomp$40$$ && ($ampdoc$jscomp$40$$ = $parseUrlDeprecated$$module$src$url$$($ampdoc$jscomp$40$$));
    $ampdoc$jscomp$40$$ = $urls$$module$src$config$$.localhostRegex.test($ampdoc$jscomp$40$$.origin);
    $$jscomp$this$jscomp$35$$.$isLocalViewer_$ = $ampdoc$jscomp$40$$;
  });
  this.$a2aFeatures_$ = null;
  this.$anchorMutators_$ = new $PriorityQueue$$module$src$utils$priority_queue$$;
  this.$navigateToMutators_$ = new $PriorityQueue$$module$src$utils$priority_queue$$;
}
$Navigation$$module$src$service$navigation$$.installInEmbedWindow = function($embedWin$jscomp$4$$, $ampdoc$jscomp$42$$) {
  $installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$4$$, "navigation", new $Navigation$$module$src$service$navigation$$($ampdoc$jscomp$42$$, $embedWin$jscomp$4$$.document));
};
$JSCompiler_prototypeAlias$$ = $Navigation$$module$src$service$navigation$$.prototype;
$JSCompiler_prototypeAlias$$.cleanup = function() {
  this.$boundHandle_$ && (this.$rootNode_$.removeEventListener("click", this.$boundHandle_$), this.$rootNode_$.removeEventListener("contextmenu", this.$boundHandle_$));
};
$JSCompiler_prototypeAlias$$.openWindow = function($win$jscomp$150$$, $url$jscomp$62$$, $target$jscomp$114$$, $opener$$) {
  var $options$jscomp$40$$ = "";
  !this.$platform_$.isIos() && this.$platform_$.isChrome() || $opener$$ || ($options$jscomp$40$$ += "noopener");
  var $newWin$$ = $openWindowDialog$$module$src$dom$$($win$jscomp$150$$, $url$jscomp$62$$, $target$jscomp$114$$, $options$jscomp$40$$);
  $newWin$$ && !$opener$$ && ($newWin$$.opener = null);
};
$JSCompiler_prototypeAlias$$.navigateTo = function($win$jscomp$151$$, $url$jscomp$63$$, $opt_requestedBy$$, $$jscomp$destructuring$var73_target$jscomp$115$$) {
  var $$jscomp$destructuring$var74_opener$jscomp$1$$ = void 0 === $$jscomp$destructuring$var73_target$jscomp$115$$ ? {} : $$jscomp$destructuring$var73_target$jscomp$115$$;
  $$jscomp$destructuring$var73_target$jscomp$115$$ = void 0 === $$jscomp$destructuring$var74_opener$jscomp$1$$.target ? "_top" : $$jscomp$destructuring$var74_opener$jscomp$1$$.target;
  $$jscomp$destructuring$var74_opener$jscomp$1$$ = void 0 === $$jscomp$destructuring$var74_opener$jscomp$1$$.opener ? !1 : $$jscomp$destructuring$var74_opener$jscomp$1$$.opener;
  $url$jscomp$63$$ = $JSCompiler_StaticMethods_applyNavigateToMutators_$$(this, $url$jscomp$63$$);
  var $urlService$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$(this.$serviceContext_$, "url");
  if ($urlService$$.isProtocolValid($url$jscomp$63$$)) {
    if ($userAssert$$module$src$log$$($VALID_TARGETS$$module$src$service$navigation$$.includes($$jscomp$destructuring$var73_target$jscomp$115$$), "Target '" + $$jscomp$destructuring$var73_target$jscomp$115$$ + "' not supported."), $url$jscomp$63$$ = $urlService$$.getSourceUrl($url$jscomp$63$$), "_blank" == $$jscomp$destructuring$var73_target$jscomp$115$$) {
      this.openWindow($win$jscomp$151$$, $url$jscomp$63$$, $$jscomp$destructuring$var73_target$jscomp$115$$, $$jscomp$destructuring$var74_opener$jscomp$1$$);
    } else {
      if ($opt_requestedBy$$ && (this.$a2aFeatures_$ || (this.$a2aFeatures_$ = $JSCompiler_StaticMethods_queryA2AFeatures_$$(this)), this.$a2aFeatures_$.includes($opt_requestedBy$$) && this.navigateToAmpUrl($url$jscomp$63$$, $opt_requestedBy$$))) {
        return;
      }
      $win$jscomp$151$$.top.location.href = $url$jscomp$63$$;
    }
  } else {
    $user$$module$src$log$$().error("navigation", "Cannot navigate to invalid protocol: " + $url$jscomp$63$$);
  }
};
$JSCompiler_prototypeAlias$$.navigateToAmpUrl = function($url$jscomp$64$$, $requestedBy$$) {
  return this.$viewer_$.hasCapability("a2a") ? (this.$viewer_$.sendMessage("a2aNavigate", $dict$$module$src$utils$object$$({url:$url$jscomp$64$$, requestedBy:$requestedBy$$})), !0) : !1;
};
function $JSCompiler_StaticMethods_queryA2AFeatures_$$($JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$1$$) {
  return ($JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$1$$ = $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$1$$.$rootNode_$.querySelector('meta[name="amp-to-amp-navigation"]')) && $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$1$$.hasAttribute("content") ? $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$1$$.getAttribute("content").split(",").map(function($JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$1$$) {
    return $JSCompiler_StaticMethods_queryA2AFeatures_$self_meta$jscomp$1$$.trim();
  }) : [];
}
$JSCompiler_prototypeAlias$$.$handle_$ = function($e$jscomp$43$$) {
  if (!$e$jscomp$43$$.defaultPrevented) {
    var $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$ = $closestAncestorElementBySelector$$module$src$dom$$($e$jscomp$43$$.__AMP_CUSTOM_LINKER_TARGET__ || $e$jscomp$43$$.target, "A");
    if ($JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$ && $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.href) {
      if ("click" == $e$jscomp$43$$.type) {
        $JSCompiler_StaticMethods_expandVarsForAnchor_$$(this, $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$);
        var $JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$ = $JSCompiler_StaticMethods_parseUrl_$$(this, $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.href), $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$;
        if ($JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = !$JSCompiler_StaticMethods_handleA2AClick_$$(this, $e$jscomp$43$$, $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$, $JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$)) {
          if (this.$isIframed_$) {
            $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.ownerDocument.defaultView;
            var $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$ = $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.href, $JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$ = $JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$.protocol;
            "ftp:" == $JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$ ? ($openWindowDialog$$module$src$dom$$($JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$, $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$, 
            "_blank"), $e$jscomp$43$$.preventDefault(), $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = !0) : ($JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$ = /^(https?|mailto):$/.test($JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$), 
            this.$isIosSafari_$ && !$JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$ ? ($openWindowDialog$$module$src$dom$$($JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$, $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$, 
            "_top"), $e$jscomp$43$$.preventDefault(), $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = !0) : $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = !1);
          } else {
            $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = !1;
          }
          $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = !$JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$;
        }
        if ($JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$) {
          if ($JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = $getMode$$module$src$mode$$().test && !this.$isEmbed_$ ? this.ampdoc.win.location.href : "", $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$ = $JSCompiler_StaticMethods_parseUrl_$$(this, 
          $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$), $getHrefMinusHash$$module$src$service$navigation$$($JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$) != $getHrefMinusHash$$module$src$service$navigation$$($JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$) && 
          ($JSCompiler_StaticMethods_applyAnchorMutators_$$(this, $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$, $e$jscomp$43$$), $JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$ = $JSCompiler_StaticMethods_parseUrl_$$(this, $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.href)), $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$ = $JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$, 
          $JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$ = $getHrefMinusHash$$module$src$service$navigation$$($JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$), $JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$ = $getHrefMinusHash$$module$src$service$navigation$$($JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$), 
          $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$.hash && $JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$ == $JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$) {
            $JSCompiler_StaticMethods_handleHashNavigation_$$(this, $e$jscomp$43$$, $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$, $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$);
          } else {
            $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$ = ($JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.getAttribute("target") || "").toLowerCase();
            (this.$isEmbed_$ || this.$isInABox_$) && "_top" != $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$ && "_blank" != $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$ && ($JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$ = "_blank", $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.setAttribute("target", 
            $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$));
            $JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$ = this.ampdoc.win;
            var $JSCompiler_platform$jscomp$inline_918$$ = $Services$$module$src$services$platformFor$$($JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$);
            $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$ = $Services$$module$src$services$viewerForDoc$$($JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$);
            $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$.search && $JSCompiler_platform$jscomp$inline_918$$.isSafari() && 13 <= $JSCompiler_platform$jscomp$inline_918$$.getMajorVersion() && $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.isProxyOrigin() && $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$.isEmbedded() && $JSCompiler_StaticMethods_removeViewerQueryBeforeNavigation_$$($JSCompiler_from$jscomp$inline_915_JSCompiler_isNormalProtocol$jscomp$inline_904_JSCompiler_protocol$jscomp$inline_903_JSCompiler_win$jscomp$inline_917$$, 
            $JSCompiler_baseHref$jscomp$inline_907_JSCompiler_inline_result$jscomp$855_JSCompiler_inline_result$jscomp$856_JSCompiler_temp$jscomp$854_JSCompiler_win$jscomp$inline_901$$, $JSCompiler_target$jscomp$inline_916_JSCompiler_toLocation$jscomp$inline_912_JSCompiler_url$jscomp$inline_902$$);
            this.viewerInterceptsNavigation($JSCompiler_to$jscomp$inline_914_JSCompiler_toLocation$jscomp$inline_471$$, "intercept_click") && $e$jscomp$43$$.preventDefault();
          }
        }
      } else {
        "contextmenu" == $e$jscomp$43$$.type && ($JSCompiler_StaticMethods_expandVarsForAnchor_$$(this, $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$), $JSCompiler_StaticMethods_applyAnchorMutators_$$(this, $JSCompiler_viewer$jscomp$inline_919_target$jscomp$116$$, $e$jscomp$43$$));
      }
    }
  }
};
function $JSCompiler_StaticMethods_applyAnchorMutators_$$($JSCompiler_StaticMethods_applyAnchorMutators_$self$$, $element$jscomp$108$$, $e$jscomp$46$$) {
  $JSCompiler_StaticMethods_applyAnchorMutators_$self$$.$anchorMutators_$.forEach(function($JSCompiler_StaticMethods_applyAnchorMutators_$self$$) {
    $JSCompiler_StaticMethods_applyAnchorMutators_$self$$($element$jscomp$108$$, $e$jscomp$46$$);
  });
}
function $JSCompiler_StaticMethods_applyNavigateToMutators_$$($JSCompiler_StaticMethods_applyNavigateToMutators_$self$$, $url$jscomp$65$$) {
  $JSCompiler_StaticMethods_applyNavigateToMutators_$self$$.$navigateToMutators_$.forEach(function($JSCompiler_StaticMethods_applyNavigateToMutators_$self$$) {
    $url$jscomp$65$$ = $JSCompiler_StaticMethods_applyNavigateToMutators_$self$$($url$jscomp$65$$);
  });
  return $url$jscomp$65$$;
}
function $JSCompiler_StaticMethods_expandVarsForAnchor_$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$, $el$jscomp$14$$) {
  var $defaultExpandParamsUrl$$ = null;
  if ($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.$appendExtraParams_$ && !$JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.$isEmbed_$) {
    $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.ampdoc.win.location.href);
    var $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.search);
    $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$ = [];
    for (var $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ = 0; $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ < $DEFAULT_APPEND_URL_PARAM$$module$src$impression$$.length; $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$++) {
      var $JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$ = $DEFAULT_APPEND_URL_PARAM$$module$src$impression$$[$JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$];
      "undefined" !== typeof $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$[$JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$] && $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.push($JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$);
    }
    $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$ = $el$jscomp$14$$.getAttribute("data-amp-addparams");
    $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ = $el$jscomp$14$$.href;
    $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$ && ($JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ = $addParamsToUrl$$module$src$url$$($JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$, $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$)));
    $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$);
    $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$.search);
    for ($JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ = $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.length - 1; 0 <= $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$; $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$--) {
      "undefined" !== typeof $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$[$JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$[$JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$]] && $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.splice($JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$, 
      1);
    }
    $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$ = "";
    for ($JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ = 0; $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ < $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$.length; $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$++) {
      $JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$ = $JSCompiler_StaticMethods_expandVarsForAnchor_$self_JSCompiler_appendParams$jscomp$inline_482_JSCompiler_url$jscomp$inline_480$$[$JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$], $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$ += 
      0 == $JSCompiler_href$jscomp$inline_486_JSCompiler_i$jscomp$inline_483_JSCompiler_i$jscomp$inline_923_i$35$jscomp$inline_489$$ ? $JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$ + "=QUERY_PARAM(" + $JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$ + ")" : "&" + $JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$ + "=QUERY_PARAM(" + $JSCompiler_param$jscomp$inline_484_JSCompiler_param$jscomp$inline_924$$ + ")";
    }
    $defaultExpandParamsUrl$$ = $JSCompiler_additionalUrlParams$jscomp$inline_485_JSCompiler_existParams$jscomp$inline_488_JSCompiler_loc$jscomp$inline_487_JSCompiler_params$jscomp$inline_481_JSCompiler_url$jscomp$inline_922$$;
  }
  $getExistingServiceForDocInEmbedScope$$module$src$service$$($el$jscomp$14$$, "url-replace").maybeExpandLink($el$jscomp$14$$, $defaultExpandParamsUrl$$);
}
function $JSCompiler_StaticMethods_handleA2AClick_$$($JSCompiler_StaticMethods_handleA2AClick_$self$$, $e$jscomp$48$$, $element$jscomp$110$$, $location$jscomp$81$$) {
  return $element$jscomp$110$$.hasAttribute("rel") && $element$jscomp$110$$.getAttribute("rel").split(" ").map(function($JSCompiler_StaticMethods_handleA2AClick_$self$$) {
    return $JSCompiler_StaticMethods_handleA2AClick_$self$$.trim();
  }).includes("amphtml") ? $JSCompiler_StaticMethods_handleA2AClick_$self$$.navigateToAmpUrl($location$jscomp$81$$.href, "<a rel=amphtml>") ? ($e$jscomp$48$$.preventDefault(), !0) : !1 : !1;
}
function $JSCompiler_StaticMethods_removeViewerQueryBeforeNavigation_$$($win$jscomp$154$$, $fromLocation$jscomp$2$$, $target$jscomp$118$$) {
  function $restoreQuery$$() {
    var $fromLocation$jscomp$2$$ = $win$jscomp$154$$.location.href;
    $fromLocation$jscomp$2$$ == $noQuery$$ ? ($dev$$module$src$log$$().info("navigation", "Restored iframe URL with query string:", $original$jscomp$1$$), $win$jscomp$154$$.history.replaceState(null, "", $original$jscomp$1$$)) : $dev$$module$src$log$$().error("navigation", "Unexpected iframe URL change:", $fromLocation$jscomp$2$$, $noQuery$$);
  }
  $dev$$module$src$log$$().info("navigation", "Removing iframe query string before navigation:", $fromLocation$jscomp$2$$.search);
  var $original$jscomp$1$$ = $fromLocation$jscomp$2$$.href, $noQuery$$ = "" + $fromLocation$jscomp$2$$.origin + $fromLocation$jscomp$2$$.pathname + $fromLocation$jscomp$2$$.hash;
  $win$jscomp$154$$.history.replaceState(null, "", $noQuery$$);
  "_blank" === $target$jscomp$118$$ ? $win$jscomp$154$$.setTimeout($restoreQuery$$, 0) : $win$jscomp$154$$.addEventListener("pageshow", function $onPageShow$$($fromLocation$jscomp$2$$) {
    $fromLocation$jscomp$2$$.persisted && ($restoreQuery$$(), $win$jscomp$154$$.removeEventListener("pageshow", $onPageShow$$));
  });
}
function $JSCompiler_StaticMethods_handleHashNavigation_$$($JSCompiler_StaticMethods_handleHashNavigation_$self$$, $e$jscomp$51$$, $toLocation$jscomp$2$$, $fromLocation$jscomp$3$$) {
  if ($Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_handleHashNavigation_$self$$.ampdoc.win).isIe()) {
    var $id$jscomp$40$$ = $toLocation$jscomp$2$$.hash.substring(1), $elementWithId$$ = $JSCompiler_StaticMethods_handleHashNavigation_$self$$.ampdoc.getElementById($id$jscomp$40$$);
    $elementWithId$$ && (/^(?:a|select|input|button|textarea)$/i.test($elementWithId$$.tagName) || ($elementWithId$$.tabIndex = -1), $tryFocus$$module$src$dom$$($elementWithId$$));
  }
  $e$jscomp$51$$.preventDefault();
  if (!$JSCompiler_StaticMethods_handleHashNavigation_$self$$.$isEmbed_$) {
    var $hash$jscomp$2$$ = $toLocation$jscomp$2$$.hash.slice(1), $el$jscomp$15$$ = null;
    if ($hash$jscomp$2$$) {
      var $escapedHash$$ = String($hash$jscomp$2$$).replace($regex$$module$third_party$css_escape$css_escape$$, $escaper$$module$third_party$css_escape$css_escape$$);
      $el$jscomp$15$$ = $JSCompiler_StaticMethods_handleHashNavigation_$self$$.$rootNode_$.getElementById($hash$jscomp$2$$) || $JSCompiler_StaticMethods_handleHashNavigation_$self$$.$rootNode_$.querySelector('a[name="' + $escapedHash$$ + '"]');
    }
    $toLocation$jscomp$2$$.hash != $fromLocation$jscomp$3$$.hash ? $JSCompiler_StaticMethods_handleHashNavigation_$self$$.$history_$.replaceStateForTarget($toLocation$jscomp$2$$.hash).then(function() {
      $JSCompiler_StaticMethods_scrollToElement_$$($JSCompiler_StaticMethods_handleHashNavigation_$self$$, $el$jscomp$15$$, $hash$jscomp$2$$);
    }) : $JSCompiler_StaticMethods_scrollToElement_$$($JSCompiler_StaticMethods_handleHashNavigation_$self$$, $el$jscomp$15$$, $hash$jscomp$2$$);
  }
}
$JSCompiler_prototypeAlias$$.registerAnchorMutator = function($callback$jscomp$70$$, $priority$jscomp$1$$) {
  this.$anchorMutators_$.enqueue($callback$jscomp$70$$, $priority$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.registerNavigateToMutator = function($callback$jscomp$71$$, $priority$jscomp$2$$) {
  this.$navigateToMutators_$.enqueue($callback$jscomp$71$$, $priority$jscomp$2$$);
};
function $JSCompiler_StaticMethods_scrollToElement_$$($JSCompiler_StaticMethods_scrollToElement_$self$$, $elem$jscomp$1$$, $hash$jscomp$3$$) {
  $elem$jscomp$1$$ ? ($JSCompiler_StaticMethods_scrollToElement_$self$$.$viewport_$.scrollIntoView($elem$jscomp$1$$), $Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_scrollToElement_$self$$.ampdoc.win).delay(function() {
    return $JSCompiler_StaticMethods_scrollToElement_$self$$.$viewport_$.scrollIntoView($elem$jscomp$1$$);
  }, 1)) : $dev$$module$src$log$$().warn("navigation", "failed to find element with id=" + $hash$jscomp$3$$ + " or a[name=" + $hash$jscomp$3$$ + "]");
}
function $JSCompiler_StaticMethods_parseUrl_$$($JSCompiler_StaticMethods_parseUrl_$self$$, $url$jscomp$67$$) {
  return $getExistingServiceForDocInEmbedScope$$module$src$service$$($JSCompiler_StaticMethods_parseUrl_$self$$.$serviceContext_$, "url").parse($url$jscomp$67$$);
}
$JSCompiler_prototypeAlias$$.viewerInterceptsNavigation = function($url$jscomp$68$$, $requestedBy$jscomp$1$$) {
  var $viewerHasCapability$$ = this.$viewer_$.hasCapability("interceptNavigation"), $docOptedIn$jscomp$2$$ = this.ampdoc.getRootNode().documentElement.hasAttribute("allow-navigation-interception");
  if (!$viewerHasCapability$$ || !$docOptedIn$jscomp$2$$ || !this.$isTrustedViewer_$ && !this.$isLocalViewer_$) {
    return !1;
  }
  this.$viewer_$.sendMessage("navigateTo", $dict$$module$src$utils$object$$({url:$url$jscomp$68$$, requestedBy:$requestedBy$jscomp$1$$}));
  return !0;
};
function $getHrefMinusHash$$module$src$service$navigation$$($location$jscomp$82$$) {
  return "" + $location$jscomp$82$$.origin + $location$jscomp$82$$.pathname + $location$jscomp$82$$.search;
}
;function $installGlobalSubmitListenerForDoc$$module$src$document_submit$$($ampdoc$jscomp$44$$) {
  $isExtensionScriptInNode$$module$src$element_service$$($ampdoc$jscomp$44$$).then(function($ampFormInstalled$$) {
    $ampFormInstalled$$ && $ampdoc$jscomp$44$$.getRootNode().addEventListener("submit", $onDocumentFormSubmit_$$module$src$document_submit$$, !0);
  });
}
function $onDocumentFormSubmit_$$module$src$document_submit$$($e$jscomp$53$$) {
  if (!$e$jscomp$53$$.defaultPrevented) {
    var $form$jscomp$4$$ = $e$jscomp$53$$.target;
    if ($form$jscomp$4$$ && "FORM" == $form$jscomp$4$$.tagName) {
      ($form$jscomp$4$$.classList.contains("i-amphtml-form") ? $form$jscomp$4$$.hasAttribute("amp-novalidate") : $form$jscomp$4$$.hasAttribute("novalidate")) || !$form$jscomp$4$$.checkValidity || $form$jscomp$4$$.checkValidity() || $e$jscomp$53$$.preventDefault();
      for (var $inputs$$ = $form$jscomp$4$$.elements, $action$jscomp$6_i$jscomp$57_target$jscomp$120$$ = 0; $action$jscomp$6_i$jscomp$57_target$jscomp$120$$ < $inputs$$.length; $action$jscomp$6_i$jscomp$57_target$jscomp$120$$++) {
        $userAssert$$module$src$log$$(!$inputs$$[$action$jscomp$6_i$jscomp$57_target$jscomp$120$$].name || "__amp_source_origin" != $inputs$$[$action$jscomp$6_i$jscomp$57_target$jscomp$120$$].name, "Illegal input name, %s found: %s", "__amp_source_origin", $inputs$$[$action$jscomp$6_i$jscomp$57_target$jscomp$120$$]);
      }
      $action$jscomp$6_i$jscomp$57_target$jscomp$120$$ = $form$jscomp$4$$.getAttribute("action");
      var $actionXhr$$ = $form$jscomp$4$$.getAttribute("action-xhr"), $method$jscomp$12$$ = ($form$jscomp$4$$.getAttribute("method") || "GET").toUpperCase();
      $actionXhr$$ && ($assertHttpsUrl$$module$src$url$$($actionXhr$$, $form$jscomp$4$$, "action-xhr"), $userAssert$$module$src$log$$(!$isProxyOrigin$$module$src$url$$($actionXhr$$), "form action-xhr should not be on AMP CDN: %s", $form$jscomp$4$$), $checkCorsUrl$$module$src$url$$($actionXhr$$));
      $action$jscomp$6_i$jscomp$57_target$jscomp$120$$ && ($assertHttpsUrl$$module$src$url$$($action$jscomp$6_i$jscomp$57_target$jscomp$120$$, $form$jscomp$4$$, "action"), $userAssert$$module$src$log$$(!$isProxyOrigin$$module$src$url$$($action$jscomp$6_i$jscomp$57_target$jscomp$120$$), "form action should not be on AMP CDN: %s", $form$jscomp$4$$), $checkCorsUrl$$module$src$url$$($action$jscomp$6_i$jscomp$57_target$jscomp$120$$));
      "GET" == $method$jscomp$12$$ ? $userAssert$$module$src$log$$($actionXhr$$ || $action$jscomp$6_i$jscomp$57_target$jscomp$120$$, "form action-xhr or action attribute is required for method=GET: %s", $form$jscomp$4$$) : "POST" == $method$jscomp$12$$ && ($action$jscomp$6_i$jscomp$57_target$jscomp$120$$ && $user$$module$src$log$$().error("form", "action attribute is invalid for method=POST: %s", $form$jscomp$4$$), $actionXhr$$ || ($e$jscomp$53$$.preventDefault(), $userAssert$$module$src$log$$(!1, 
      "Only XHR based (via action-xhr attribute) submissions are support for POST requests. %s", $form$jscomp$4$$)));
      ($action$jscomp$6_i$jscomp$57_target$jscomp$120$$ = $form$jscomp$4$$.getAttribute("target")) ? $userAssert$$module$src$log$$("_blank" == $action$jscomp$6_i$jscomp$57_target$jscomp$120$$ || "_top" == $action$jscomp$6_i$jscomp$57_target$jscomp$120$$, "form target=%s is invalid can only be _blank or _top: %s", $action$jscomp$6_i$jscomp$57_target$jscomp$120$$, $form$jscomp$4$$) : $form$jscomp$4$$.setAttribute("target", "_top");
      $actionXhr$$ && ($e$jscomp$53$$.preventDefault(), $e$jscomp$53$$.stopImmediatePropagation(), $getExistingServiceForDocInEmbedScope$$module$src$service$$($form$jscomp$4$$, "action").execute($form$jscomp$4$$, "submit", null, $form$jscomp$4$$, $form$jscomp$4$$, $e$jscomp$53$$, 3));
    }
  }
}
;function $Observable$$module$src$observable$$() {
  this.$handlers_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Observable$$module$src$observable$$.prototype;
$JSCompiler_prototypeAlias$$.add = function($handler$jscomp$11$$) {
  var $$jscomp$this$jscomp$38$$ = this;
  this.$handlers_$ || (this.$handlers_$ = []);
  this.$handlers_$.push($handler$jscomp$11$$);
  return function() {
    $$jscomp$this$jscomp$38$$.remove($handler$jscomp$11$$);
  };
};
$JSCompiler_prototypeAlias$$.remove = function($handler$jscomp$12_index$jscomp$83$$) {
  this.$handlers_$ && ($handler$jscomp$12_index$jscomp$83$$ = this.$handlers_$.indexOf($handler$jscomp$12_index$jscomp$83$$), -1 < $handler$jscomp$12_index$jscomp$83$$ && this.$handlers_$.splice($handler$jscomp$12_index$jscomp$83$$, 1));
};
$JSCompiler_prototypeAlias$$.removeAll = function() {
  this.$handlers_$ && (this.$handlers_$.length = 0);
};
$JSCompiler_prototypeAlias$$.fire = function($opt_event$jscomp$1$$) {
  if (this.$handlers_$) {
    for (var $handlers$$ = this.$handlers_$, $i$jscomp$58$$ = 0; $i$jscomp$58$$ < $handlers$$.length; $i$jscomp$58$$++) {
      (0,$handlers$$[$i$jscomp$58$$])($opt_event$jscomp$1$$);
    }
  }
};
$JSCompiler_prototypeAlias$$.getHandlerCount = function() {
  return this.$handlers_$ ? this.$handlers_$.length : 0;
};
var $OBSERVER_OPTIONS$$module$src$service$hidden_observer_impl$$ = {attributes:!0, attributeFilter:["hidden"], subtree:!0};
function $HiddenObserver$$module$src$service$hidden_observer_impl$$($ampdoc$jscomp$45$$, $opt_root$jscomp$1$$) {
  this.$root_$ = $opt_root$jscomp$1$$ || $ampdoc$jscomp$45$$.getRootNode();
  this.$win_$ = $devAssert$$module$src$log$$((this.$root_$.ownerDocument || this.$root_$).defaultView);
  this.$observable_$ = this.$mutationObserver_$ = null;
}
$HiddenObserver$$module$src$service$hidden_observer_impl$$.installInEmbedWindow = function($embedWin$jscomp$5$$, $ampdoc$jscomp$46$$) {
  $installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$5$$, "hidden-observer", new $HiddenObserver$$module$src$service$hidden_observer_impl$$($ampdoc$jscomp$46$$, $embedWin$jscomp$5$$.document));
};
$HiddenObserver$$module$src$service$hidden_observer_impl$$.prototype.add = function($handler$jscomp$14$$) {
  var $$jscomp$this$jscomp$39$$ = this;
  $JSCompiler_StaticMethods_init_$$(this);
  var $remove$jscomp$1$$ = this.$observable_$.add($handler$jscomp$14$$);
  return function() {
    $remove$jscomp$1$$();
    0 === $$jscomp$this$jscomp$39$$.$observable_$.getHandlerCount() && $$jscomp$this$jscomp$39$$.dispose();
  };
};
function $JSCompiler_StaticMethods_init_$$($JSCompiler_StaticMethods_init_$self$$) {
  if (!$JSCompiler_StaticMethods_init_$self$$.$mutationObserver_$) {
    $JSCompiler_StaticMethods_init_$self$$.$observable_$ = new $Observable$$module$src$observable$$;
    var $mo$jscomp$1$$ = new $JSCompiler_StaticMethods_init_$self$$.$win_$.MutationObserver(function($mo$jscomp$1$$) {
      $mo$jscomp$1$$ && $JSCompiler_StaticMethods_init_$self$$.$observable_$.fire($mo$jscomp$1$$);
    });
    $JSCompiler_StaticMethods_init_$self$$.$mutationObserver_$ = $mo$jscomp$1$$;
    $mo$jscomp$1$$.observe($JSCompiler_StaticMethods_init_$self$$.$root_$, $OBSERVER_OPTIONS$$module$src$service$hidden_observer_impl$$);
  }
}
$HiddenObserver$$module$src$service$hidden_observer_impl$$.prototype.dispose = function() {
  this.$mutationObserver_$ && (this.$mutationObserver_$.disconnect(), this.$observable_$.removeAll(), this.$observable_$ = this.$mutationObserver_$ = null);
};
function $getState$$module$src$history$$($history$jscomp$1$$) {
  try {
    return $history$jscomp$1$$.state;
  } catch ($e$jscomp$54$$) {
    return null;
  }
}
;function $History$$module$src$service$history_impl$$($ampdoc$jscomp$48$$, $binding$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$48$$;
  this.$timer_$ = $Services$$module$src$services$timerFor$$($ampdoc$jscomp$48$$.win);
  this.$binding_$ = $binding$$;
  this.$stackIndex_$ = 0;
  this.$stackOnPop_$ = [];
  this.$queue_$ = [];
  this.$binding_$.setOnStateUpdated(this.$onStateUpdated_$.bind(this));
}
$JSCompiler_prototypeAlias$$ = $History$$module$src$service$history_impl$$.prototype;
$JSCompiler_prototypeAlias$$.cleanup = function() {
  this.$binding_$.cleanup();
};
$JSCompiler_prototypeAlias$$.push = function($opt_onPop$$, $opt_stateUpdate$$) {
  var $$jscomp$this$jscomp$41$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$41$$.$binding_$.push($opt_stateUpdate$$).then(function($opt_stateUpdate$$) {
      $$jscomp$this$jscomp$41$$.$onStateUpdated_$($opt_stateUpdate$$);
      $opt_onPop$$ && ($$jscomp$this$jscomp$41$$.$stackOnPop_$[$opt_stateUpdate$$.stackIndex] = $opt_onPop$$);
      return $opt_stateUpdate$$.stackIndex;
    });
  }, "push");
};
$JSCompiler_prototypeAlias$$.pop = function($stateId$$) {
  var $$jscomp$this$jscomp$42$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$42$$.$binding_$.pop($stateId$$).then(function($stateId$$) {
      $$jscomp$this$jscomp$42$$.$onStateUpdated_$($stateId$$);
    });
  }, "pop");
};
$JSCompiler_prototypeAlias$$.replace = function($opt_stateUpdate$jscomp$1$$) {
  var $$jscomp$this$jscomp$43$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$43$$.$binding_$.replace($opt_stateUpdate$jscomp$1$$);
  }, "replace");
};
$JSCompiler_prototypeAlias$$.get = function() {
  var $$jscomp$this$jscomp$44$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return $$jscomp$this$jscomp$44$$.$binding_$.get();
  }, "get");
};
$JSCompiler_prototypeAlias$$.goBack = function() {
  var $$jscomp$this$jscomp$45$$ = this;
  return $JSCompiler_StaticMethods_enque_$$(this, function() {
    return 0 >= $$jscomp$this$jscomp$45$$.$stackIndex_$ ? $resolvedPromise$$module$src$resolved_promise$$() : $$jscomp$this$jscomp$45$$.$binding_$.pop($$jscomp$this$jscomp$45$$.$stackIndex_$).then(function($historyState$jscomp$2$$) {
      $$jscomp$this$jscomp$45$$.$onStateUpdated_$($historyState$jscomp$2$$);
    });
  }, "goBack");
};
$JSCompiler_prototypeAlias$$.replaceStateForTarget = function($target$jscomp$121$$) {
  var $$jscomp$this$jscomp$46$$ = this;
  $devAssert$$module$src$log$$("#" == $target$jscomp$121$$[0]);
  var $previousHash$$ = this.$ampdoc_$.win.location.hash;
  return this.push(function() {
    $$jscomp$this$jscomp$46$$.$ampdoc_$.win.location.replace($previousHash$$ || "#");
  }).then(function() {
    $$jscomp$this$jscomp$46$$.$binding_$.replaceStateForTarget($target$jscomp$121$$);
  });
};
$JSCompiler_prototypeAlias$$.getFragment = function() {
  return this.$binding_$.getFragment();
};
$JSCompiler_prototypeAlias$$.updateFragment = function($fragment$jscomp$1$$) {
  "#" == $fragment$jscomp$1$$[0] && ($fragment$jscomp$1$$ = $fragment$jscomp$1$$.substr(1));
  return this.$binding_$.updateFragment($fragment$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.$onStateUpdated_$ = function($historyState$jscomp$3$$) {
  this.$stackIndex_$ = $historyState$jscomp$3$$.stackIndex;
  $JSCompiler_StaticMethods_doPop_$$(this, $historyState$jscomp$3$$);
};
function $JSCompiler_StaticMethods_doPop_$$($JSCompiler_StaticMethods_doPop_$self$$, $historyState$jscomp$4$$) {
  if (!($JSCompiler_StaticMethods_doPop_$self$$.$stackIndex_$ >= $JSCompiler_StaticMethods_doPop_$self$$.$stackOnPop_$.length - 1)) {
    for (var $toPop$$ = [], $$jscomp$loop$97_i$jscomp$59$$ = $JSCompiler_StaticMethods_doPop_$self$$.$stackOnPop_$.length - 1; $$jscomp$loop$97_i$jscomp$59$$ > $JSCompiler_StaticMethods_doPop_$self$$.$stackIndex_$; $$jscomp$loop$97_i$jscomp$59$$--) {
      $JSCompiler_StaticMethods_doPop_$self$$.$stackOnPop_$[$$jscomp$loop$97_i$jscomp$59$$] && ($toPop$$.push($JSCompiler_StaticMethods_doPop_$self$$.$stackOnPop_$[$$jscomp$loop$97_i$jscomp$59$$]), $JSCompiler_StaticMethods_doPop_$self$$.$stackOnPop_$[$$jscomp$loop$97_i$jscomp$59$$] = void 0);
    }
    $JSCompiler_StaticMethods_doPop_$self$$.$stackOnPop_$.splice($JSCompiler_StaticMethods_doPop_$self$$.$stackIndex_$ + 1);
    if (0 < $toPop$$.length) {
      for ($$jscomp$loop$97_i$jscomp$59$$ = {$$jscomp$loop$prop$i$37$98$:0}; $$jscomp$loop$97_i$jscomp$59$$.$$jscomp$loop$prop$i$37$98$ < $toPop$$.length; $$jscomp$loop$97_i$jscomp$59$$ = {$$jscomp$loop$prop$i$37$98$:$$jscomp$loop$97_i$jscomp$59$$.$$jscomp$loop$prop$i$37$98$}, $$jscomp$loop$97_i$jscomp$59$$.$$jscomp$loop$prop$i$37$98$++) {
        $JSCompiler_StaticMethods_doPop_$self$$.$timer_$.delay(function($JSCompiler_StaticMethods_doPop_$self$$) {
          return function() {
            return $toPop$$[$JSCompiler_StaticMethods_doPop_$self$$.$$jscomp$loop$prop$i$37$98$]($historyState$jscomp$4$$);
          };
        }($$jscomp$loop$97_i$jscomp$59$$), 1);
      }
    }
  }
}
function $JSCompiler_StaticMethods_enque_$$($JSCompiler_StaticMethods_enque_$self$$, $callback$jscomp$72$$, $name$jscomp$107$$) {
  var $$jscomp$destructuring$var77$$ = new $Deferred$$module$src$utils$promise$$, $promise$jscomp$17$$ = $$jscomp$destructuring$var77$$.promise;
  $JSCompiler_StaticMethods_enque_$self$$.$queue_$.push({callback:$callback$jscomp$72$$, resolve:$$jscomp$destructuring$var77$$.resolve, reject:$$jscomp$destructuring$var77$$.reject, trace:Error("history trace for " + $name$jscomp$107$$ + ": ")});
  1 == $JSCompiler_StaticMethods_enque_$self$$.$queue_$.length && $JSCompiler_StaticMethods_deque_$$($JSCompiler_StaticMethods_enque_$self$$);
  return $promise$jscomp$17$$;
}
function $JSCompiler_StaticMethods_deque_$$($JSCompiler_StaticMethods_deque_$self$$) {
  if (0 != $JSCompiler_StaticMethods_deque_$self$$.$queue_$.length) {
    var $task$$ = $JSCompiler_StaticMethods_deque_$self$$.$queue_$[0];
    try {
      var $promise$jscomp$18$$ = $task$$.callback();
    } catch ($e$jscomp$55$$) {
      $promise$jscomp$18$$ = Promise.reject($e$jscomp$55$$);
    }
    $promise$jscomp$18$$.then(function($JSCompiler_StaticMethods_deque_$self$$) {
      $task$$.resolve($JSCompiler_StaticMethods_deque_$self$$);
    }, function($JSCompiler_StaticMethods_deque_$self$$) {
      $dev$$module$src$log$$().error("History", "failed to execute a task:", $JSCompiler_StaticMethods_deque_$self$$);
      $task$$.trace && ($task$$.trace.message += $JSCompiler_StaticMethods_deque_$self$$, $dev$$module$src$log$$().error("History", $task$$.trace));
      $task$$.reject($JSCompiler_StaticMethods_deque_$self$$);
    }).then(function() {
      $JSCompiler_StaticMethods_deque_$self$$.$queue_$.splice(0, 1);
      $JSCompiler_StaticMethods_deque_$$($JSCompiler_StaticMethods_deque_$self$$);
    });
  }
}
function $HistoryBindingNatural_$$module$src$service$history_impl$$($history$jscomp$2_win$jscomp$155$$) {
  var $$jscomp$this$jscomp$48$$ = this;
  this.win = $history$jscomp$2_win$jscomp$155$$;
  this.$timer_$ = $Services$$module$src$services$timerFor$$($history$jscomp$2_win$jscomp$155$$);
  $history$jscomp$2_win$jscomp$155$$ = this.win.history;
  this.$startIndex_$ = $history$jscomp$2_win$jscomp$155$$.length - 1;
  var $state$jscomp$8$$ = $getState$$module$src$history$$($history$jscomp$2_win$jscomp$155$$);
  $state$jscomp$8$$ && void 0 !== $state$jscomp$8$$["AMP.History"] && (this.$startIndex_$ = Math.min($state$jscomp$8$$["AMP.History"], this.$startIndex_$));
  this.$stackIndex_$ = this.$startIndex_$;
  this.$onStateUpdated_$ = null;
  this.$supportsState_$ = "state" in $history$jscomp$2_win$jscomp$155$$;
  this.$unsupportedState_$ = $JSCompiler_StaticMethods_historyState_$$(this, this.$stackIndex_$);
  if ($history$jscomp$2_win$jscomp$155$$.pushState && $history$jscomp$2_win$jscomp$155$$.replaceState) {
    this.$origPushState_$ = $history$jscomp$2_win$jscomp$155$$.originalPushState || $history$jscomp$2_win$jscomp$155$$.pushState.bind($history$jscomp$2_win$jscomp$155$$);
    this.$origReplaceState_$ = $history$jscomp$2_win$jscomp$155$$.originalReplaceState || $history$jscomp$2_win$jscomp$155$$.replaceState.bind($history$jscomp$2_win$jscomp$155$$);
    var $pushState$$ = function($history$jscomp$2_win$jscomp$155$$, $state$jscomp$8$$, $pushState$$) {
      $$jscomp$this$jscomp$48$$.$unsupportedState_$ = $history$jscomp$2_win$jscomp$155$$;
      $$jscomp$this$jscomp$48$$.$origPushState_$($history$jscomp$2_win$jscomp$155$$, $state$jscomp$8$$, $pushState$$ || null);
    };
    var $replaceState$$ = function($history$jscomp$2_win$jscomp$155$$, $state$jscomp$8$$, $pushState$$) {
      $$jscomp$this$jscomp$48$$.$unsupportedState_$ = $history$jscomp$2_win$jscomp$155$$;
      void 0 !== $pushState$$ ? $$jscomp$this$jscomp$48$$.$origReplaceState_$($history$jscomp$2_win$jscomp$155$$, $state$jscomp$8$$, $pushState$$) : $$jscomp$this$jscomp$48$$.$origReplaceState_$($history$jscomp$2_win$jscomp$155$$, $state$jscomp$8$$);
    };
    $history$jscomp$2_win$jscomp$155$$.originalPushState || ($history$jscomp$2_win$jscomp$155$$.originalPushState = this.$origPushState_$);
    $history$jscomp$2_win$jscomp$155$$.originalReplaceState || ($history$jscomp$2_win$jscomp$155$$.originalReplaceState = this.$origReplaceState_$);
  } else {
    $pushState$$ = function($history$jscomp$2_win$jscomp$155$$) {
      $$jscomp$this$jscomp$48$$.$unsupportedState_$ = $history$jscomp$2_win$jscomp$155$$;
    }, $replaceState$$ = function($history$jscomp$2_win$jscomp$155$$) {
      $$jscomp$this$jscomp$48$$.$unsupportedState_$ = $history$jscomp$2_win$jscomp$155$$;
    };
  }
  this.$pushState_$ = $pushState$$;
  this.$replaceState_$ = $replaceState$$;
  try {
    this.$replaceState_$($JSCompiler_StaticMethods_historyState_$$(this, this.$stackIndex_$, !0));
  } catch ($e$jscomp$56$$) {
    $dev$$module$src$log$$().error("History", "Initial replaceState failed: " + $e$jscomp$56$$.message);
  }
  $history$jscomp$2_win$jscomp$155$$.pushState = this.$historyPushState_$.bind(this);
  $history$jscomp$2_win$jscomp$155$$.replaceState = this.$historyReplaceState_$.bind(this);
  this.$popstateHandler_$ = function() {
    var $history$jscomp$2_win$jscomp$155$$ = $JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$48$$), $state$jscomp$8$$ = $history$jscomp$2_win$jscomp$155$$ ? $history$jscomp$2_win$jscomp$155$$["AMP.History"] : void 0, $pushState$$ = $$jscomp$this$jscomp$48$$.$stackIndex_$, $replaceState$$ = $$jscomp$this$jscomp$48$$.$waitingState_$;
    $$jscomp$this$jscomp$48$$.$waitingState_$ = void 0;
    $pushState$$ > $$jscomp$this$jscomp$48$$.win.history.length - 2 && ($pushState$$ = $$jscomp$this$jscomp$48$$.win.history.length - 2, $$jscomp$this$jscomp$48$$.$updateHistoryState_$($JSCompiler_StaticMethods_mergeStateUpdate_$$($history$jscomp$2_win$jscomp$155$$, {stackIndex:$pushState$$})));
    $pushState$$ = void 0 == $state$jscomp$8$$ ? $pushState$$ + 1 : $state$jscomp$8$$ < $$jscomp$this$jscomp$48$$.win.history.length ? $state$jscomp$8$$ : $$jscomp$this$jscomp$48$$.win.history.length - 1;
    $history$jscomp$2_win$jscomp$155$$ || ($history$jscomp$2_win$jscomp$155$$ = {});
    $history$jscomp$2_win$jscomp$155$$["AMP.History"] = $pushState$$;
    $$jscomp$this$jscomp$48$$.$replaceState_$($history$jscomp$2_win$jscomp$155$$, void 0, void 0);
    $pushState$$ != $$jscomp$this$jscomp$48$$.$stackIndex_$ && $$jscomp$this$jscomp$48$$.$updateHistoryState_$($JSCompiler_StaticMethods_mergeStateUpdate_$$($history$jscomp$2_win$jscomp$155$$, {stackIndex:$pushState$$}));
    $pushState$$ < $$jscomp$this$jscomp$48$$.$startIndex_$ && ($$jscomp$this$jscomp$48$$.$startIndex_$ = $pushState$$);
    $replaceState$$ && $replaceState$$.resolve();
  };
  this.win.addEventListener("popstate", this.$popstateHandler_$);
}
$JSCompiler_prototypeAlias$$ = $HistoryBindingNatural_$$module$src$service$history_impl$$.prototype;
$JSCompiler_prototypeAlias$$.cleanup = function() {
  this.$origPushState_$ && (this.win.history.pushState = this.$origPushState_$);
  this.$origReplaceState_$ && (this.win.history.replaceState = this.$origReplaceState_$);
  this.win.removeEventListener("popstate", this.$popstateHandler_$);
};
function $JSCompiler_StaticMethods_historyState_$$($JSCompiler_StaticMethods_historyState_$self_state$jscomp$14$$, $stackIndex$$, $opt_replace$jscomp$1$$) {
  $JSCompiler_StaticMethods_historyState_$self_state$jscomp$14$$ = $map$$module$src$utils$object$$($opt_replace$jscomp$1$$ ? $JSCompiler_StaticMethods_getState_$$($JSCompiler_StaticMethods_historyState_$self_state$jscomp$14$$) : void 0);
  $JSCompiler_StaticMethods_historyState_$self_state$jscomp$14$$["AMP.History"] = $stackIndex$$;
  return $JSCompiler_StaticMethods_historyState_$self_state$jscomp$14$$;
}
$JSCompiler_prototypeAlias$$.setOnStateUpdated = function($callback$jscomp$73$$) {
  this.$onStateUpdated_$ = $callback$jscomp$73$$;
};
$JSCompiler_prototypeAlias$$.push = function($opt_stateUpdate$jscomp$4$$) {
  var $$jscomp$this$jscomp$49$$ = this;
  return $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    var $newState$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$49$$), $opt_stateUpdate$jscomp$4$$ || {});
    $$jscomp$this$jscomp$49$$.$historyPushState_$($newState$$, void 0, $newState$$.fragment ? "#" + $newState$$.fragment : void 0);
    return $tryResolve$$module$src$utils$promise$$(function() {
      return $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$$, {stackIndex:$$jscomp$this$jscomp$49$$.$stackIndex_$});
    });
  });
};
$JSCompiler_prototypeAlias$$.pop = function($stackIndex$jscomp$1$$) {
  var $$jscomp$this$jscomp$50$$ = this;
  $stackIndex$jscomp$1$$ = Math.max($stackIndex$jscomp$1$$, this.$startIndex_$);
  return $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    return $JSCompiler_StaticMethods_back_$$($$jscomp$this$jscomp$50$$, $$jscomp$this$jscomp$50$$.$stackIndex_$ - $stackIndex$jscomp$1$$ + 1);
  }).then(function($stackIndex$jscomp$1$$) {
    return $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$50$$), {stackIndex:$stackIndex$jscomp$1$$});
  });
};
$JSCompiler_prototypeAlias$$.replace = function($opt_stateUpdate$jscomp$5$$) {
  var $$jscomp$this$jscomp$51$$ = this;
  $opt_stateUpdate$jscomp$5$$ = void 0 === $opt_stateUpdate$jscomp$5$$ ? {} : $opt_stateUpdate$jscomp$5$$;
  return $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    var $newState$jscomp$1$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$51$$), $opt_stateUpdate$jscomp$5$$ || {}), $url$jscomp$69$$ = ($newState$jscomp$1$$.url || "").replace(/#.*/, ""), $fragment$jscomp$2$$ = $newState$jscomp$1$$.fragment ? "#" + $newState$jscomp$1$$.fragment : "";
    $$jscomp$this$jscomp$51$$.$historyReplaceState_$($newState$jscomp$1$$, $newState$jscomp$1$$.title, $url$jscomp$69$$ || $fragment$jscomp$2$$ ? $url$jscomp$69$$ + $fragment$jscomp$2$$ : void 0);
    return $tryResolve$$module$src$utils$promise$$(function() {
      return $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$jscomp$1$$, {stackIndex:$$jscomp$this$jscomp$51$$.$stackIndex_$});
    });
  });
};
$JSCompiler_prototypeAlias$$.get = function() {
  var $$jscomp$this$jscomp$52$$ = this;
  return $tryResolve$$module$src$utils$promise$$(function() {
    return $JSCompiler_StaticMethods_mergeStateUpdate_$$($JSCompiler_StaticMethods_getState_$$($$jscomp$this$jscomp$52$$), {stackIndex:$$jscomp$this$jscomp$52$$.$stackIndex_$});
  });
};
$JSCompiler_prototypeAlias$$.backTo = function($stackIndex$jscomp$2$$) {
  var $$jscomp$this$jscomp$53$$ = this;
  $stackIndex$jscomp$2$$ = Math.max($stackIndex$jscomp$2$$, this.$startIndex_$);
  return $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    return $JSCompiler_StaticMethods_back_$$($$jscomp$this$jscomp$53$$, $$jscomp$this$jscomp$53$$.$stackIndex_$ - $stackIndex$jscomp$2$$);
  });
};
function $JSCompiler_StaticMethods_getState_$$($JSCompiler_StaticMethods_getState_$self$$) {
  return $JSCompiler_StaticMethods_getState_$self$$.$supportsState_$ ? $getState$$module$src$history$$($JSCompiler_StaticMethods_getState_$self$$.win.history) : $JSCompiler_StaticMethods_getState_$self$$.$unsupportedState_$;
}
function $JSCompiler_StaticMethods_whenReady_$$($JSCompiler_StaticMethods_whenReady_$self$$, $callback$jscomp$74$$) {
  return $JSCompiler_StaticMethods_whenReady_$self$$.$waitingState_$ ? $JSCompiler_StaticMethods_whenReady_$self$$.$waitingState_$.promise.then($callback$jscomp$74$$, $callback$jscomp$74$$) : $callback$jscomp$74$$();
}
function $JSCompiler_StaticMethods_wait_$$($JSCompiler_StaticMethods_wait_$self$$) {
  $devAssert$$module$src$log$$(!$JSCompiler_StaticMethods_wait_$self$$.$waitingState_$);
  var $deferred$jscomp$13_promise$jscomp$19$$ = new $Deferred$$module$src$utils$promise$$, $resolve$jscomp$22$$ = $deferred$jscomp$13_promise$jscomp$19$$.resolve, $reject$jscomp$13$$ = $deferred$jscomp$13_promise$jscomp$19$$.reject;
  $deferred$jscomp$13_promise$jscomp$19$$ = $JSCompiler_StaticMethods_wait_$self$$.$timer_$.timeoutPromise(500, $deferred$jscomp$13_promise$jscomp$19$$.promise);
  $JSCompiler_StaticMethods_wait_$self$$.$waitingState_$ = {promise:$deferred$jscomp$13_promise$jscomp$19$$, resolve:$resolve$jscomp$22$$, reject:$reject$jscomp$13$$};
  return $deferred$jscomp$13_promise$jscomp$19$$;
}
function $JSCompiler_StaticMethods_back_$$($JSCompiler_StaticMethods_back_$self$$, $steps$$) {
  $devAssert$$module$src$log$$(!$JSCompiler_StaticMethods_back_$self$$.$waitingState_$);
  if (0 >= $steps$$) {
    return Promise.resolve($JSCompiler_StaticMethods_back_$self$$.$stackIndex_$);
  }
  $JSCompiler_StaticMethods_back_$self$$.$unsupportedState_$ = $JSCompiler_StaticMethods_historyState_$$($JSCompiler_StaticMethods_back_$self$$, $JSCompiler_StaticMethods_back_$self$$.$stackIndex_$ - $steps$$);
  var $promise$jscomp$20$$ = $JSCompiler_StaticMethods_wait_$$($JSCompiler_StaticMethods_back_$self$$);
  $JSCompiler_StaticMethods_back_$self$$.win.history.go(-$steps$$);
  return $promise$jscomp$20$$.then(function() {
    return Promise.resolve($JSCompiler_StaticMethods_back_$self$$.$stackIndex_$);
  });
}
$JSCompiler_prototypeAlias$$.$historyPushState_$ = function($newState$jscomp$2_state$jscomp$16$$, $title$jscomp$12$$, $url$jscomp$70$$) {
  $devAssert$$module$src$log$$(!this.$waitingState_$);
  $newState$jscomp$2_state$jscomp$16$$ || ($newState$jscomp$2_state$jscomp$16$$ = {});
  var $stackIndex$jscomp$4$$ = this.$stackIndex_$ + 1;
  $newState$jscomp$2_state$jscomp$16$$["AMP.History"] = $stackIndex$jscomp$4$$;
  this.$pushState_$($newState$jscomp$2_state$jscomp$16$$, $title$jscomp$12$$, $url$jscomp$70$$);
  $stackIndex$jscomp$4$$ != this.win.history.length - 1 && ($stackIndex$jscomp$4$$ = this.win.history.length - 1, $newState$jscomp$2_state$jscomp$16$$["AMP.History"] = $stackIndex$jscomp$4$$, this.$replaceState_$($newState$jscomp$2_state$jscomp$16$$));
  $newState$jscomp$2_state$jscomp$16$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$jscomp$2_state$jscomp$16$$, {stackIndex:$stackIndex$jscomp$4$$});
  this.$updateHistoryState_$($newState$jscomp$2_state$jscomp$16$$);
};
$JSCompiler_prototypeAlias$$.replaceStateForTarget = function($target$jscomp$122$$) {
  var $$jscomp$this$jscomp$55$$ = this;
  $devAssert$$module$src$log$$("#" == $target$jscomp$122$$[0]);
  $JSCompiler_StaticMethods_whenReady_$$(this, function() {
    $$jscomp$this$jscomp$55$$.win.removeEventListener("popstate", $$jscomp$this$jscomp$55$$.$popstateHandler_$);
    try {
      $$jscomp$this$jscomp$55$$.win.location.replace($target$jscomp$122$$);
    } finally {
      $$jscomp$this$jscomp$55$$.win.addEventListener("popstate", $$jscomp$this$jscomp$55$$.$popstateHandler_$);
    }
    $$jscomp$this$jscomp$55$$.$historyReplaceState_$();
    return $resolvedPromise$$module$src$resolved_promise$$();
  });
};
$JSCompiler_prototypeAlias$$.$historyReplaceState_$ = function($newState$jscomp$3_state$jscomp$17$$, $title$jscomp$13$$, $url$jscomp$71$$) {
  $devAssert$$module$src$log$$(!this.$waitingState_$);
  $newState$jscomp$3_state$jscomp$17$$ || ($newState$jscomp$3_state$jscomp$17$$ = {});
  var $stackIndex$jscomp$5$$ = Math.min(this.$stackIndex_$, this.win.history.length - 1);
  $newState$jscomp$3_state$jscomp$17$$["AMP.History"] = $stackIndex$jscomp$5$$;
  this.$replaceState_$($newState$jscomp$3_state$jscomp$17$$, $title$jscomp$13$$, $url$jscomp$71$$);
  $newState$jscomp$3_state$jscomp$17$$ = $JSCompiler_StaticMethods_mergeStateUpdate_$$($newState$jscomp$3_state$jscomp$17$$, {stackIndex:$stackIndex$jscomp$5$$});
  this.$updateHistoryState_$($newState$jscomp$3_state$jscomp$17$$);
};
$JSCompiler_prototypeAlias$$.$updateHistoryState_$ = function($historyState$jscomp$5$$) {
  $devAssert$$module$src$log$$(!this.$waitingState_$);
  $historyState$jscomp$5$$.stackIndex = Math.min($historyState$jscomp$5$$.stackIndex, this.win.history.length - 1);
  this.$stackIndex_$ != $historyState$jscomp$5$$.stackIndex && (this.$stackIndex_$ = $historyState$jscomp$5$$.stackIndex, this.$onStateUpdated_$ && this.$onStateUpdated_$($historyState$jscomp$5$$));
};
$JSCompiler_prototypeAlias$$.getFragment = function() {
  var $hash$jscomp$4$$ = this.win.location.hash;
  $hash$jscomp$4$$ = $hash$jscomp$4$$.substr(1);
  return Promise.resolve($hash$jscomp$4$$);
};
$JSCompiler_prototypeAlias$$.updateFragment = function($fragment$jscomp$3$$) {
  return this.replace({fragment:$fragment$jscomp$3$$});
};
function $JSCompiler_StaticMethods_mergeStateUpdate_$$($state$jscomp$18$$, $update$$) {
  var $mergedData$$ = Object.assign({}, $state$jscomp$18$$ && $state$jscomp$18$$.data || {}, $update$$.data || {});
  return Object.assign({}, $state$jscomp$18$$ || {}, $update$$, {data:$mergedData$$});
}
function $HistoryBindingVirtual_$$module$src$service$history_impl$$($win$jscomp$156$$, $viewer$jscomp$10$$) {
  var $$jscomp$this$jscomp$56$$ = this;
  this.win = $win$jscomp$156$$;
  this.$viewer_$ = $viewer$jscomp$10$$;
  this.$stackIndex_$ = 0;
  this.$onStateUpdated_$ = null;
  this.$unlistenOnHistoryPopped_$ = this.$viewer_$.onMessage("historyPopped", function($win$jscomp$156$$) {
    void 0 !== $win$jscomp$156$$.newStackIndex && ($win$jscomp$156$$.stackIndex = $win$jscomp$156$$.newStackIndex);
    $JSCompiler_StaticMethods_isHistoryState_$$($win$jscomp$156$$) ? $$jscomp$this$jscomp$56$$.$updateHistoryState_$($win$jscomp$156$$) : $dev$$module$src$log$$().warn("History", 'Ignored unexpected "historyPopped" data:', $win$jscomp$156$$);
  });
}
$JSCompiler_prototypeAlias$$ = $HistoryBindingVirtual_$$module$src$service$history_impl$$.prototype;
$JSCompiler_prototypeAlias$$.replaceStateForTarget = function($target$jscomp$123$$) {
  $devAssert$$module$src$log$$("#" == $target$jscomp$123$$[0]);
  this.win.location.replace($target$jscomp$123$$);
};
$JSCompiler_prototypeAlias$$.cleanup = function() {
  this.$unlistenOnHistoryPopped_$();
};
$JSCompiler_prototypeAlias$$.setOnStateUpdated = function($callback$jscomp$75$$) {
  this.$onStateUpdated_$ = $callback$jscomp$75$$;
};
function $JSCompiler_StaticMethods_toHistoryState_$$($maybeHistoryState$$, $fallbackState$$, $debugId$$) {
  if ($JSCompiler_StaticMethods_isHistoryState_$$($maybeHistoryState$$)) {
    return $maybeHistoryState$$;
  }
  $dev$$module$src$log$$().warn("History", 'Ignored unexpected "%s" data:', $debugId$$, $maybeHistoryState$$);
  return $fallbackState$$;
}
function $JSCompiler_StaticMethods_isHistoryState_$$($maybeHistoryState$jscomp$1$$) {
  return !!$maybeHistoryState$jscomp$1$$ && void 0 !== $maybeHistoryState$jscomp$1$$.stackIndex;
}
$JSCompiler_prototypeAlias$$.push = function($opt_stateUpdate$jscomp$6$$) {
  var $$jscomp$this$jscomp$57$$ = this, $message$jscomp$40$$ = Object.assign({}, {stackIndex:this.$stackIndex_$ + 1}, $opt_stateUpdate$jscomp$6$$ || {});
  return this.$viewer_$.sendMessageAwaitResponse("pushHistory", $message$jscomp$40$$).then(function($opt_stateUpdate$jscomp$6$$) {
    $opt_stateUpdate$jscomp$6$$ = $JSCompiler_StaticMethods_toHistoryState_$$($opt_stateUpdate$jscomp$6$$, $message$jscomp$40$$, "pushHistory");
    $$jscomp$this$jscomp$57$$.$updateHistoryState_$($opt_stateUpdate$jscomp$6$$);
    return $opt_stateUpdate$jscomp$6$$;
  });
};
$JSCompiler_prototypeAlias$$.pop = function($message$jscomp$41_stackIndex$jscomp$6$$) {
  var $$jscomp$this$jscomp$58$$ = this;
  if ($message$jscomp$41_stackIndex$jscomp$6$$ > this.$stackIndex_$) {
    return this.get();
  }
  $message$jscomp$41_stackIndex$jscomp$6$$ = $dict$$module$src$utils$object$$({stackIndex:this.$stackIndex_$});
  return this.$viewer_$.sendMessageAwaitResponse("popHistory", $message$jscomp$41_stackIndex$jscomp$6$$).then(function($message$jscomp$41_stackIndex$jscomp$6$$) {
    var $newState$jscomp$5_response$jscomp$17$$ = $dict$$module$src$utils$object$$({stackIndex:$$jscomp$this$jscomp$58$$.$stackIndex_$ - 1});
    $message$jscomp$41_stackIndex$jscomp$6$$ = $JSCompiler_StaticMethods_toHistoryState_$$($message$jscomp$41_stackIndex$jscomp$6$$, $newState$jscomp$5_response$jscomp$17$$, "popHistory");
    $$jscomp$this$jscomp$58$$.$updateHistoryState_$($message$jscomp$41_stackIndex$jscomp$6$$);
    return $message$jscomp$41_stackIndex$jscomp$6$$;
  });
};
$JSCompiler_prototypeAlias$$.replace = function($opt_stateUpdate$jscomp$7$$) {
  var $$jscomp$this$jscomp$59$$ = this;
  if ($opt_stateUpdate$jscomp$7$$ && $opt_stateUpdate$jscomp$7$$.url) {
    if (!this.$viewer_$.hasCapability("fullReplaceHistory")) {
      var $curState$$ = $dict$$module$src$utils$object$$({stackIndex:this.$stackIndex_$});
      return Promise.resolve($curState$$);
    }
    var $url$jscomp$72$$ = $opt_stateUpdate$jscomp$7$$.url.replace(/#.*/, "");
    $opt_stateUpdate$jscomp$7$$.url = $url$jscomp$72$$;
  }
  var $message$jscomp$42$$ = Object.assign({}, {stackIndex:this.$stackIndex_$}, $opt_stateUpdate$jscomp$7$$ || {});
  return this.$viewer_$.sendMessageAwaitResponse("replaceHistory", $message$jscomp$42$$, !0).then(function($opt_stateUpdate$jscomp$7$$) {
    $opt_stateUpdate$jscomp$7$$ = $JSCompiler_StaticMethods_toHistoryState_$$($opt_stateUpdate$jscomp$7$$, $message$jscomp$42$$, "replaceHistory");
    $$jscomp$this$jscomp$59$$.$updateHistoryState_$($opt_stateUpdate$jscomp$7$$);
    return $opt_stateUpdate$jscomp$7$$;
  });
};
$JSCompiler_prototypeAlias$$.get = function() {
  return Promise.resolve({data:void 0, fragment:"", stackIndex:this.$stackIndex_$, title:""});
};
$JSCompiler_prototypeAlias$$.$updateHistoryState_$ = function($state$jscomp$19$$) {
  var $stackIndex$jscomp$7$$ = $state$jscomp$19$$.stackIndex;
  this.$stackIndex_$ != $stackIndex$jscomp$7$$ && (this.$stackIndex_$ = $stackIndex$jscomp$7$$, this.$onStateUpdated_$ && this.$onStateUpdated_$($state$jscomp$19$$));
};
$JSCompiler_prototypeAlias$$.getFragment = function() {
  return this.$viewer_$.hasCapability("fragment") ? this.$viewer_$.sendMessageAwaitResponse("getFragment", void 0, !0).then(function($data$jscomp$96_hash$jscomp$5$$) {
    if (!$data$jscomp$96_hash$jscomp$5$$) {
      return "";
    }
    "#" == $data$jscomp$96_hash$jscomp$5$$[0] && ($data$jscomp$96_hash$jscomp$5$$ = $data$jscomp$96_hash$jscomp$5$$.substr(1));
    return $data$jscomp$96_hash$jscomp$5$$;
  }) : Promise.resolve("");
};
$JSCompiler_prototypeAlias$$.updateFragment = function($fragment$jscomp$4$$) {
  return this.$viewer_$.hasCapability("fragment") ? this.$viewer_$.sendMessageAwaitResponse("replaceHistory", $dict$$module$src$utils$object$$({fragment:$fragment$jscomp$4$$}), !0) : $resolvedPromise$$module$src$resolved_promise$$();
};
function $createHistory$$module$src$service$history_impl$$($ampdoc$jscomp$49$$) {
  var $binding$jscomp$1_viewer$jscomp$11$$ = $Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$49$$);
  $binding$jscomp$1_viewer$jscomp$11$$.isOvertakeHistory() || $getMode$$module$src$mode$$($ampdoc$jscomp$49$$.win).test || $ampdoc$jscomp$49$$.win.__AMP_TEST_IFRAME ? $binding$jscomp$1_viewer$jscomp$11$$ = new $HistoryBindingVirtual_$$module$src$service$history_impl$$($ampdoc$jscomp$49$$.win, $binding$jscomp$1_viewer$jscomp$11$$) : ($registerServiceBuilder$$module$src$service$$($ampdoc$jscomp$49$$.win, "global-history-binding", $HistoryBindingNatural_$$module$src$service$history_impl$$), $binding$jscomp$1_viewer$jscomp$11$$ = 
  $getService$$module$src$service$$($ampdoc$jscomp$49$$.win, "global-history-binding"));
  return new $History$$module$src$service$history_impl$$($ampdoc$jscomp$49$$, $binding$jscomp$1_viewer$jscomp$11$$);
}
;function $guaranteeSrcForSrcsetUnsupportedBrowsers$$module$src$utils$img$$($img$jscomp$2$$) {
  if (!$img$jscomp$2$$.hasAttribute("src") && 0 == "srcset" in $img$jscomp$2$$) {
    var $srcset$$ = $img$jscomp$2$$.getAttribute("srcset"), $matches$jscomp$2$$ = /\S+/.exec($srcset$$);
    null != $matches$jscomp$2$$ && $img$jscomp$2$$.setAttribute("src", $matches$jscomp$2$$[0]);
  }
}
;var $stubbedElements$$module$src$element_stub$$ = [];
function $ElementStub$$module$src$element_stub$$($element$jscomp$112$$) {
  $BaseElement$$module$src$base_element$$.call(this, $element$jscomp$112$$);
  $stubbedElements$$module$src$element_stub$$.push(this);
}
$$jscomp$inherits$$($ElementStub$$module$src$element_stub$$, $BaseElement$$module$src$base_element$$);
$ElementStub$$module$src$element_stub$$.prototype.getLayoutPriority = function() {
  return $devAssert$$module$src$log$$(0);
};
$ElementStub$$module$src$element_stub$$.prototype.isLayoutSupported = function() {
  return !0;
};
$ElementStub$$module$src$element_stub$$.prototype.reconstructWhenReparented = function() {
  return !1;
};
var $LABEL_MAP$$module$src$layout_delay_meter$$ = {0:"cld", 2:"adld"};
function $LayoutDelayMeter$$module$src$layout_delay_meter$$($win$jscomp$157$$, $priority$jscomp$3$$) {
  this.$win_$ = $win$jscomp$157$$;
  this.$performance_$ = $getExistingServiceOrNull$$module$src$service$$($win$jscomp$157$$);
  this.$firstLayoutTime_$ = this.$firstInViewportTime_$ = null;
  this.$done_$ = !1;
  this.$label_$ = $LABEL_MAP$$module$src$layout_delay_meter$$[$priority$jscomp$3$$];
}
$LayoutDelayMeter$$module$src$layout_delay_meter$$.prototype.enterViewport = function() {
  this.$label_$ && !this.$firstInViewportTime_$ && (this.$firstInViewportTime_$ = this.$win_$.Date.now(), $JSCompiler_StaticMethods_tryMeasureDelay_$$(this));
};
$LayoutDelayMeter$$module$src$layout_delay_meter$$.prototype.startLayout = function() {
  this.$label_$ && !this.$firstLayoutTime_$ && (this.$firstLayoutTime_$ = this.$win_$.Date.now(), $JSCompiler_StaticMethods_tryMeasureDelay_$$(this));
};
function $JSCompiler_StaticMethods_tryMeasureDelay_$$($JSCompiler_StaticMethods_tryMeasureDelay_$self$$) {
  if ($JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$performance_$ && $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$performance_$.isPerformanceTrackingOn() && !$JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$done_$ && $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$firstInViewportTime_$ && $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$firstLayoutTime_$) {
    var $delay$$ = $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$win_$.Math.max($JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$firstLayoutTime_$ - $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$firstInViewportTime_$, 0);
    $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$performance_$.tickDelta($JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$label_$, $delay$$);
    $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$performance_$.throttledFlush();
    $JSCompiler_StaticMethods_tryMeasureDelay_$self$$.$done_$ = !0;
  }
}
;function $Resource$$module$src$service$resource$$($deferred$jscomp$14_id$jscomp$41$$, $element$jscomp$113$$, $resources$jscomp$2$$) {
  $element$jscomp$113$$.__AMP__RESOURCE = this;
  this.$id_$ = $deferred$jscomp$14_id$jscomp$41$$;
  this.element = $element$jscomp$113$$;
  this.debugid = $element$jscomp$113$$.tagName.toLowerCase() + "#" + $deferred$jscomp$14_id$jscomp$41$$;
  this.hostWin = $element$jscomp$113$$.ownerDocument.defaultView;
  this.$resources_$ = $resources$jscomp$2$$;
  this.$isPlaceholder_$ = $element$jscomp$113$$.hasAttribute("placeholder");
  this.$isBuilding_$ = !1;
  this.$owner_$ = void 0;
  this.$state_$ = $element$jscomp$113$$.isBuilt() ? 1 : 0;
  0 == this.$state_$ && $element$jscomp$113$$.isBuilding() && this.build();
  this.$priorityOverride_$ = -1;
  this.$layoutCount_$ = 0;
  this.$lastLayoutError_$ = null;
  this.$isFixed_$ = !1;
  this.$layoutBox_$ = $layoutRectLtwh$$module$src$layout_rect$$(-1E4, -1E4, 0, 0);
  this.$initialLayoutBox_$ = null;
  this.$isMeasureRequested_$ = !1;
  this.$layoutPromise_$ = this.$withViewportDeferreds_$ = null;
  this.$pendingChangeSize_$ = void 0;
  this.$loadedOnce_$ = !1;
  $deferred$jscomp$14_id$jscomp$41$$ = new $Deferred$$module$src$utils$promise$$;
  this.$loadPromise_$ = $deferred$jscomp$14_id$jscomp$41$$.promise;
  this.$loadPromiseResolve_$ = $deferred$jscomp$14_id$jscomp$41$$.resolve;
  this.$intersect_$ = $resources$jscomp$2$$.isIntersectionExperimentOn();
  this.$premeasuredRect_$ = null;
}
function $Resource$$module$src$service$resource$forElement$$($element$jscomp$114$$) {
  return $devAssert$$module$src$log$$($Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$114$$));
}
function $Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$115$$) {
  return $element$jscomp$115$$.__AMP__RESOURCE;
}
$JSCompiler_prototypeAlias$$ = $Resource$$module$src$service$resource$$.prototype;
$JSCompiler_prototypeAlias$$.getId = function() {
  return this.$id_$;
};
$JSCompiler_prototypeAlias$$.updateOwner = function($owner$jscomp$1$$) {
  this.$owner_$ = $owner$jscomp$1$$;
};
$JSCompiler_prototypeAlias$$.getOwner = function() {
  if (void 0 === this.$owner_$) {
    for (var $n$jscomp$12$$ = this.element; $n$jscomp$12$$; $n$jscomp$12$$ = $n$jscomp$12$$.parentElement) {
      if ($n$jscomp$12$$.__AMP__OWNER) {
        this.$owner_$ = $n$jscomp$12$$.__AMP__OWNER;
        break;
      }
    }
    void 0 === this.$owner_$ && (this.$owner_$ = null);
  }
  return this.$owner_$;
};
$JSCompiler_prototypeAlias$$.hasOwner = function() {
  return !!this.getOwner();
};
$JSCompiler_prototypeAlias$$.getLayoutPriority = function() {
  return -1 != this.$priorityOverride_$ ? this.$priorityOverride_$ : this.element.getLayoutPriority();
};
$JSCompiler_prototypeAlias$$.updateLayoutPriority = function($newPriority$$) {
  this.$priorityOverride_$ = $newPriority$$;
};
$JSCompiler_prototypeAlias$$.getState = function() {
  return this.$state_$;
};
$JSCompiler_prototypeAlias$$.isBuilt = function() {
  return this.element.isBuilt();
};
$JSCompiler_prototypeAlias$$.isBuilding = function() {
  return this.$isBuilding_$;
};
$JSCompiler_prototypeAlias$$.whenBuilt = function() {
  return this.element.signals().whenSignal("res-built");
};
$JSCompiler_prototypeAlias$$.build = function() {
  var $$jscomp$this$jscomp$60$$ = this;
  if (this.$isBuilding_$ || !this.element.isUpgraded()) {
    return null;
  }
  this.$isBuilding_$ = !0;
  return this.element.build().then(function() {
    $$jscomp$this$jscomp$60$$.$isBuilding_$ = !1;
    $$jscomp$this$jscomp$60$$.$intersect_$ && $$jscomp$this$jscomp$60$$.hasBeenMeasured() ? ($$jscomp$this$jscomp$60$$.$state_$ = 2, $$jscomp$this$jscomp$60$$.element.onMeasure(!0)) : $$jscomp$this$jscomp$60$$.$state_$ = 1;
    $$jscomp$this$jscomp$60$$.element.signals().signal("res-built");
  }, function($reason$jscomp$15$$) {
    $$jscomp$this$jscomp$60$$.maybeReportErrorOnBuildFailure($reason$jscomp$15$$);
    $$jscomp$this$jscomp$60$$.$isBuilding_$ = !1;
    $$jscomp$this$jscomp$60$$.element.signals().rejectSignal("res-built", $reason$jscomp$15$$);
    throw $reason$jscomp$15$$;
  });
};
$JSCompiler_prototypeAlias$$.maybeReportErrorOnBuildFailure = function($reason$jscomp$16$$) {
  $isBlockedByConsent$$module$src$error$$($reason$jscomp$16$$) || $dev$$module$src$log$$().error("Resource", "failed to build:", this.debugid, $reason$jscomp$16$$);
};
$JSCompiler_prototypeAlias$$.applySizesAndMediaQuery = function() {
  this.element.applySizesAndMediaQuery();
};
$JSCompiler_prototypeAlias$$.changeSize = function($newHeight$jscomp$3$$, $newWidth$jscomp$1$$, $opt_newMargins$$) {
  this.element.applySize($newHeight$jscomp$3$$, $newWidth$jscomp$1$$, $opt_newMargins$$);
  this.requestMeasure();
};
$JSCompiler_prototypeAlias$$.overflowCallback = function($overflown$$, $requestedHeight$$, $requestedWidth$$, $requestedMargins$$) {
  $overflown$$ && (this.$pendingChangeSize_$ = {height:$requestedHeight$$, width:$requestedWidth$$, margins:$requestedMargins$$});
  this.element.overflowCallback($overflown$$, $requestedHeight$$, $requestedWidth$$, $requestedMargins$$);
};
$JSCompiler_prototypeAlias$$.resetPendingChangeSize = function() {
  this.$pendingChangeSize_$ = void 0;
};
$JSCompiler_prototypeAlias$$.getPendingChangeSize = function() {
  return this.$pendingChangeSize_$;
};
$JSCompiler_prototypeAlias$$.getUpgradeDelayMs = function() {
  return this.element.getUpgradeDelayMs();
};
$JSCompiler_prototypeAlias$$.premeasure = function($clientRect$$) {
  $devAssert$$module$src$log$$(this.$intersect_$);
  this.$premeasuredRect_$ = $clientRect$$;
};
$JSCompiler_prototypeAlias$$.measure = function($usePremeasuredRect$$) {
  $usePremeasuredRect$$ = void 0 === $usePremeasuredRect$$ ? !1 : $usePremeasuredRect$$;
  if (!(this.$isPlaceholder_$ && this.element.parentElement && $startsWith$$module$src$string$$(this.element.parentElement.tagName, "AMP-")) || "__AMP__RESOURCE" in this.element.parentElement) {
    if (this.element.ownerDocument && this.element.ownerDocument.defaultView) {
      this.$isMeasureRequested_$ = !1;
      var $oldBox$$ = this.$layoutBox_$;
      $usePremeasuredRect$$ ? ($JSCompiler_StaticMethods_computeMeasurements_$$(this, $devAssert$$module$src$log$$(this.$premeasuredRect_$)), this.$premeasuredRect_$ = null) : $JSCompiler_StaticMethods_computeMeasurements_$$(this);
      var $newBox$$ = this.$layoutBox_$, $sizeChanges$$ = !($oldBox$$.width == $newBox$$.width && $oldBox$$.height === $newBox$$.height);
      1 != this.$state_$ && $oldBox$$.top == $newBox$$.top && !$sizeChanges$$ || !this.element.isUpgraded() || 0 == this.$state_$ || 1 != this.$state_$ && !this.element.isRelayoutNeeded() || (this.$state_$ = 2);
      this.hasBeenMeasured() || (this.$initialLayoutBox_$ = $newBox$$);
      this.element.updateLayoutBox($newBox$$, $sizeChanges$$);
    } else {
      this.$state_$ = 1;
    }
  }
};
function $JSCompiler_StaticMethods_computeMeasurements_$$($JSCompiler_StaticMethods_computeMeasurements_$self$$, $opt_premeasuredRect$$) {
  var $viewport$jscomp$2$$ = $Services$$module$src$services$viewportForDoc$$($JSCompiler_StaticMethods_computeMeasurements_$self$$.element);
  $JSCompiler_StaticMethods_computeMeasurements_$self$$.$layoutBox_$ = $viewport$jscomp$2$$.getLayoutRect($JSCompiler_StaticMethods_computeMeasurements_$self$$.element, $opt_premeasuredRect$$);
  var $isFixed$$ = !1;
  if ($viewport$jscomp$2$$.supportsPositionFixed() && $JSCompiler_StaticMethods_computeMeasurements_$self$$.isDisplayed()) {
    for (var $win$jscomp$158$$ = $JSCompiler_StaticMethods_computeMeasurements_$self$$.$resources_$.getAmpdoc().win, $body$jscomp$5$$ = $win$jscomp$158$$.document.body, $n$jscomp$13$$ = $JSCompiler_StaticMethods_computeMeasurements_$self$$.element; $n$jscomp$13$$ && $n$jscomp$13$$ != $body$jscomp$5$$; $n$jscomp$13$$ = $n$jscomp$13$$.offsetParent) {
      if ($n$jscomp$13$$.isAlwaysFixed && $n$jscomp$13$$.isAlwaysFixed()) {
        $isFixed$$ = !0;
        break;
      }
      if ($viewport$jscomp$2$$.isDeclaredFixed($n$jscomp$13$$) && "fixed" == $computedStyle$$module$src$style$$($win$jscomp$158$$, $n$jscomp$13$$).position) {
        $isFixed$$ = !0;
        break;
      }
    }
  }
  if ($JSCompiler_StaticMethods_computeMeasurements_$self$$.$isFixed_$ = $isFixed$$) {
    $JSCompiler_StaticMethods_computeMeasurements_$self$$.$layoutBox_$ = $moveLayoutRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_computeMeasurements_$self$$.$layoutBox_$, -$viewport$jscomp$2$$.getScrollLeft(), -$viewport$jscomp$2$$.getScrollTop());
  }
}
$JSCompiler_prototypeAlias$$.completeCollapse = function() {
  $toggle$$module$src$style$$(this.element, !1);
  this.$layoutBox_$ = $layoutRectLtwh$$module$src$layout_rect$$(this.$layoutBox_$.left, this.$layoutBox_$.top, 0, 0);
  this.$isFixed_$ = !1;
  this.element.updateLayoutBox(this.getLayoutBox());
  var $owner$jscomp$2$$ = this.getOwner();
  $owner$jscomp$2$$ && $owner$jscomp$2$$.collapsedCallback(this.element);
};
$JSCompiler_prototypeAlias$$.completeExpand = function() {
  $toggle$$module$src$style$$(this.element, !0);
  this.requestMeasure();
};
$JSCompiler_prototypeAlias$$.isMeasureRequested = function() {
  return this.$isMeasureRequested_$;
};
$JSCompiler_prototypeAlias$$.hasBeenMeasured = function() {
  return !!this.$initialLayoutBox_$;
};
$JSCompiler_prototypeAlias$$.hasBeenPremeasured = function() {
  $devAssert$$module$src$log$$(this.$intersect_$);
  return !!this.$premeasuredRect_$;
};
$JSCompiler_prototypeAlias$$.requestMeasure = function() {
  this.$isMeasureRequested_$ = !0;
};
$JSCompiler_prototypeAlias$$.getLayoutBox = function() {
  if (!this.$isFixed_$) {
    return this.$layoutBox_$;
  }
  var $viewport$jscomp$3$$ = $Services$$module$src$services$viewportForDoc$$(this.element);
  return $moveLayoutRect$$module$src$layout_rect$$(this.$layoutBox_$, $viewport$jscomp$3$$.getScrollLeft(), $viewport$jscomp$3$$.getScrollTop());
};
$JSCompiler_prototypeAlias$$.getPageLayoutBox = function() {
  return this.$layoutBox_$;
};
$JSCompiler_prototypeAlias$$.getPageLayoutBoxAsync = function() {
  var $$jscomp$this$jscomp$61$$ = this;
  return this.hasBeenMeasured() ? $tryResolve$$module$src$utils$promise$$(function() {
    return $$jscomp$this$jscomp$61$$.getPageLayoutBox();
  }) : $Services$$module$src$services$vsyncFor$$(this.hostWin).measurePromise(function() {
    $$jscomp$this$jscomp$61$$.measure();
    return $$jscomp$this$jscomp$61$$.getPageLayoutBox();
  });
};
$JSCompiler_prototypeAlias$$.getInitialLayoutBox = function() {
  return this.$initialLayoutBox_$ || this.$layoutBox_$;
};
$JSCompiler_prototypeAlias$$.isDisplayed = function($usePremeasuredRect$jscomp$1$$) {
  $usePremeasuredRect$jscomp$1$$ = void 0 === $usePremeasuredRect$jscomp$1$$ ? !1 : $usePremeasuredRect$jscomp$1$$;
  $devAssert$$module$src$log$$(!$usePremeasuredRect$jscomp$1$$ || this.$intersect_$);
  var $isFluid$$ = "fluid" == this.element.getLayout(), $box$$ = $usePremeasuredRect$jscomp$1$$ ? $devAssert$$module$src$log$$(this.$premeasuredRect_$) : this.getLayoutBox(), $hasNonZeroSize$$ = 0 < $box$$.height && 0 < $box$$.width;
  return ($isFluid$$ || $hasNonZeroSize$$) && !!this.element.ownerDocument && !!this.element.ownerDocument.defaultView;
};
$JSCompiler_prototypeAlias$$.isFixed = function() {
  return this.$isFixed_$;
};
$JSCompiler_prototypeAlias$$.overlaps = function($rect$jscomp$4$$) {
  var $JSCompiler_r1$jscomp$inline_513$$ = this.getLayoutBox();
  return $JSCompiler_r1$jscomp$inline_513$$.top <= $rect$jscomp$4$$.bottom && $rect$jscomp$4$$.top <= $JSCompiler_r1$jscomp$inline_513$$.bottom && $JSCompiler_r1$jscomp$inline_513$$.left <= $rect$jscomp$4$$.right && $rect$jscomp$4$$.left <= $JSCompiler_r1$jscomp$inline_513$$.right;
};
$JSCompiler_prototypeAlias$$.prerenderAllowed = function() {
  return this.element.prerenderAllowed();
};
$JSCompiler_prototypeAlias$$.isBuildRenderBlocking = function() {
  return this.element.isBuildRenderBlocking();
};
$JSCompiler_prototypeAlias$$.whenWithinViewport = function($viewport$jscomp$4$$) {
  $devAssert$$module$src$log$$(!1 !== $viewport$jscomp$4$$);
  if (!this.isLayoutPending() || !0 === $viewport$jscomp$4$$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  var $key$jscomp$59$$ = String($viewport$jscomp$4$$);
  if (this.$withViewportDeferreds_$ && this.$withViewportDeferreds_$[$key$jscomp$59$$]) {
    return this.$withViewportDeferreds_$[$key$jscomp$59$$].promise;
  }
  if (this.isWithinViewportRatio($viewport$jscomp$4$$)) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  this.$withViewportDeferreds_$ = this.$withViewportDeferreds_$ || {};
  this.$withViewportDeferreds_$[$key$jscomp$59$$] = new $Deferred$$module$src$utils$promise$$;
  return this.$withViewportDeferreds_$[$key$jscomp$59$$].promise;
};
function $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$$($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$) {
  if ($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$withViewportDeferreds_$) {
    var $viewportRatio$$ = $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.getDistanceViewportRatio(), $key$jscomp$60$$;
    for ($key$jscomp$60$$ in $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$withViewportDeferreds_$) {
      $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.isWithinViewportRatio(parseFloat($key$jscomp$60$$), $viewportRatio$$) && ($JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$withViewportDeferreds_$[$key$jscomp$60$$].resolve(), delete $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$self$$.$withViewportDeferreds_$[$key$jscomp$60$$]);
    }
  }
}
$JSCompiler_prototypeAlias$$.getDistanceViewportRatio = function() {
  var $viewportBox$$ = $Services$$module$src$services$viewportForDoc$$(this.element).getRect(), $layoutBox$jscomp$1$$ = this.getLayoutBox(), $scrollDirection$$ = this.$resources_$.getScrollDirection(), $scrollPenalty$$ = 1, $distance$$ = 0;
  if ($viewportBox$$.right < $layoutBox$jscomp$1$$.left || $viewportBox$$.left > $layoutBox$jscomp$1$$.right) {
    return {distance:!1};
  }
  if ($viewportBox$$.bottom < $layoutBox$jscomp$1$$.top) {
    $distance$$ = $layoutBox$jscomp$1$$.top - $viewportBox$$.bottom, -1 == $scrollDirection$$ && ($scrollPenalty$$ = 2);
  } else {
    if ($viewportBox$$.top > $layoutBox$jscomp$1$$.bottom) {
      $distance$$ = $viewportBox$$.top - $layoutBox$jscomp$1$$.bottom, 1 == $scrollDirection$$ && ($scrollPenalty$$ = 2);
    } else {
      return {distance:!0};
    }
  }
  return {distance:$distance$$, scrollPenalty:$scrollPenalty$$, viewportHeight:$viewportBox$$.height};
};
$JSCompiler_prototypeAlias$$.isWithinViewportRatio = function($multiplier$$, $opt_viewportRatio$$) {
  if ("boolean" === typeof $multiplier$$) {
    return $multiplier$$;
  }
  var $$jscomp$destructuring$var84$$ = $opt_viewportRatio$$ || this.getDistanceViewportRatio(), $distance$jscomp$1$$ = $$jscomp$destructuring$var84$$.distance;
  return "boolean" == typeof $distance$jscomp$1$$ ? $distance$jscomp$1$$ : $distance$jscomp$1$$ < $$jscomp$destructuring$var84$$.viewportHeight * $multiplier$$ / $$jscomp$destructuring$var84$$.scrollPenalty;
};
$JSCompiler_prototypeAlias$$.renderOutsideViewport = function() {
  $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$$(this);
  return this.hasOwner() || this.isWithinViewportRatio(this.element.renderOutsideViewport());
};
$JSCompiler_prototypeAlias$$.layoutScheduled = function($scheduleTime$$) {
  this.$state_$ = 3;
  this.element.layoutScheduleTime = $scheduleTime$$;
};
$JSCompiler_prototypeAlias$$.layoutCanceled = function() {
  this.$state_$ = this.hasBeenMeasured() ? 2 : 1;
};
$JSCompiler_prototypeAlias$$.startLayout = function() {
  var $$jscomp$this$jscomp$62$$ = this;
  if (this.$layoutPromise_$) {
    return this.$layoutPromise_$;
  }
  if (4 == this.$state_$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  if (5 == this.$state_$) {
    return Promise.reject(this.$lastLayoutError_$);
  }
  $devAssert$$module$src$log$$(0 != this.$state_$);
  $devAssert$$module$src$log$$(this.isDisplayed());
  if (0 < this.$layoutCount_$ && !this.element.isRelayoutNeeded()) {
    return this.$state_$ = 4, $resolvedPromise$$module$src$resolved_promise$$();
  }
  this.$layoutCount_$++;
  this.$state_$ = 3;
  return this.$layoutPromise_$ = (new Promise(function($resolve$jscomp$23$$, $reject$jscomp$14$$) {
    $Services$$module$src$services$vsyncFor$$($$jscomp$this$jscomp$62$$.hostWin).mutate(function() {
      try {
        $resolve$jscomp$23$$($$jscomp$this$jscomp$62$$.element.layoutCallback());
      } catch ($e$jscomp$58$$) {
        $reject$jscomp$14$$($e$jscomp$58$$);
      }
    });
  })).then(function() {
    return $JSCompiler_StaticMethods_layoutComplete_$$($$jscomp$this$jscomp$62$$, !0);
  }, function($reason$jscomp$17$$) {
    return $JSCompiler_StaticMethods_layoutComplete_$$($$jscomp$this$jscomp$62$$, !1, $reason$jscomp$17$$);
  });
};
function $JSCompiler_StaticMethods_layoutComplete_$$($JSCompiler_StaticMethods_layoutComplete_$self$$, $success$$, $opt_reason$jscomp$1$$) {
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$loadPromiseResolve_$ && ($JSCompiler_StaticMethods_layoutComplete_$self$$.$loadPromiseResolve_$(), $JSCompiler_StaticMethods_layoutComplete_$self$$.$loadPromiseResolve_$ = null);
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$layoutPromise_$ = null;
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$loadedOnce_$ = !0;
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$state_$ = $success$$ ? 4 : 5;
  $JSCompiler_StaticMethods_layoutComplete_$self$$.$lastLayoutError_$ = $opt_reason$jscomp$1$$;
  if (!$success$$) {
    return Promise.reject($opt_reason$jscomp$1$$);
  }
}
$JSCompiler_prototypeAlias$$.isLayoutPending = function() {
  return 4 != this.$state_$ && 5 != this.$state_$;
};
$JSCompiler_prototypeAlias$$.loadedOnce = function() {
  return this.$loadPromise_$;
};
$JSCompiler_prototypeAlias$$.hasLoadedOnce = function() {
  return this.$loadedOnce_$;
};
$JSCompiler_prototypeAlias$$.isInViewport = function() {
  var $isInViewport$$ = this.element.isInViewport();
  $isInViewport$$ && $JSCompiler_StaticMethods_resolveDeferredsWhenWithinViewports_$$(this);
  return $isInViewport$$;
};
$JSCompiler_prototypeAlias$$.setInViewport = function($inViewport$$) {
  this.element.viewportCallback($inViewport$$);
};
$JSCompiler_prototypeAlias$$.unlayout = function() {
  0 != this.$state_$ && 1 != this.$state_$ && (this.setInViewport(!1), this.element.unlayoutCallback() && (this.element.togglePlaceholder(!0), this.$state_$ = 1, this.$layoutCount_$ = 0, this.$layoutPromise_$ = null));
};
$JSCompiler_prototypeAlias$$.getTaskId = function($localId$$) {
  return this.debugid + "#" + $localId$$;
};
$JSCompiler_prototypeAlias$$.pause = function() {
  this.element.pauseCallback();
  this.element.unlayoutOnPause() && this.unlayout();
};
$JSCompiler_prototypeAlias$$.pauseOnRemove = function() {
  this.element.pauseCallback();
};
$JSCompiler_prototypeAlias$$.resume = function() {
  this.element.resumeCallback();
};
$JSCompiler_prototypeAlias$$.unload = function() {
  this.pause();
  this.unlayout();
};
$JSCompiler_prototypeAlias$$.disconnect = function() {
  delete this.element.__AMP__RESOURCE;
  this.element.disconnect(!0);
};
function $Signals$$module$src$utils$signals$$() {
  this.$map_$ = $map$$module$src$utils$object$$();
  this.$promiseMap_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Signals$$module$src$utils$signals$$.prototype;
$JSCompiler_prototypeAlias$$.get = function($name$jscomp$108_v$jscomp$4$$) {
  $name$jscomp$108_v$jscomp$4$$ = this.$map_$[$name$jscomp$108_v$jscomp$4$$];
  return null == $name$jscomp$108_v$jscomp$4$$ ? null : $name$jscomp$108_v$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.whenSignal = function($name$jscomp$109$$) {
  var $promiseStruct$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$109$$];
  if (!$promiseStruct$$) {
    var $$jscomp$destructuring$var85_result$jscomp$5$$ = this.$map_$[$name$jscomp$109$$];
    null != $$jscomp$destructuring$var85_result$jscomp$5$$ ? $promiseStruct$$ = {promise:"number" == typeof $$jscomp$destructuring$var85_result$jscomp$5$$ ? Promise.resolve($$jscomp$destructuring$var85_result$jscomp$5$$) : Promise.reject($$jscomp$destructuring$var85_result$jscomp$5$$)} : ($$jscomp$destructuring$var85_result$jscomp$5$$ = new $Deferred$$module$src$utils$promise$$, $promiseStruct$$ = {promise:$$jscomp$destructuring$var85_result$jscomp$5$$.promise, resolve:$$jscomp$destructuring$var85_result$jscomp$5$$.resolve, 
    reject:$$jscomp$destructuring$var85_result$jscomp$5$$.reject});
    this.$promiseMap_$ || (this.$promiseMap_$ = $map$$module$src$utils$object$$());
    this.$promiseMap_$[$name$jscomp$109$$] = $promiseStruct$$;
  }
  return $promiseStruct$$.promise;
};
$JSCompiler_prototypeAlias$$.signal = function($name$jscomp$110_promiseStruct$jscomp$1$$, $opt_time$$) {
  if (null == this.$map_$[$name$jscomp$110_promiseStruct$jscomp$1$$]) {
    var $time$jscomp$2$$ = $opt_time$$ || Date.now();
    this.$map_$[$name$jscomp$110_promiseStruct$jscomp$1$$] = $time$jscomp$2$$;
    ($name$jscomp$110_promiseStruct$jscomp$1$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$110_promiseStruct$jscomp$1$$]) && $name$jscomp$110_promiseStruct$jscomp$1$$.resolve && ($name$jscomp$110_promiseStruct$jscomp$1$$.resolve($time$jscomp$2$$), $name$jscomp$110_promiseStruct$jscomp$1$$.resolve = void 0, $name$jscomp$110_promiseStruct$jscomp$1$$.reject = void 0);
  }
};
$JSCompiler_prototypeAlias$$.rejectSignal = function($name$jscomp$111_promiseStruct$jscomp$2$$, $error$jscomp$24$$) {
  null == this.$map_$[$name$jscomp$111_promiseStruct$jscomp$2$$] && (this.$map_$[$name$jscomp$111_promiseStruct$jscomp$2$$] = $error$jscomp$24$$, ($name$jscomp$111_promiseStruct$jscomp$2$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$111_promiseStruct$jscomp$2$$]) && $name$jscomp$111_promiseStruct$jscomp$2$$.reject && ($name$jscomp$111_promiseStruct$jscomp$2$$.reject($error$jscomp$24$$), $name$jscomp$111_promiseStruct$jscomp$2$$.resolve = void 0, $name$jscomp$111_promiseStruct$jscomp$2$$.reject = 
  void 0));
};
$JSCompiler_prototypeAlias$$.reset = function($name$jscomp$112$$) {
  this.$map_$[$name$jscomp$112$$] && delete this.$map_$[$name$jscomp$112$$];
  var $promiseStruct$jscomp$3$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$112$$];
  $promiseStruct$jscomp$3$$ && !$promiseStruct$jscomp$3$$.resolve && delete this.$promiseMap_$[$name$jscomp$112$$];
};
function $getLoaderServicePromise$$module$src$loader$$($ampDoc$$, $element$jscomp$117$$) {
  return $Services$$module$src$services$extensionsFor$$($ampDoc$$.win).installExtensionForDoc($ampDoc$$, "amp-loader").then(function() {
    return $getElementServiceForDoc$$module$src$element_service$$($element$jscomp$117$$, "loader", "amp-loader");
  });
}
function $createLoaderElement$$module$src$loader$$($ampDoc$jscomp$1$$, $element$jscomp$118$$, $elementWidth$$, $elementHeight$$, $startTime$jscomp$7$$) {
  $startTime$jscomp$7$$ = void 0 === $startTime$jscomp$7$$ ? $ampDoc$jscomp$1$$.win.Date.now() : $startTime$jscomp$7$$;
  var $loaderRoot$$ = $element$jscomp$118$$.ownerDocument.createElement("div");
  $getLoaderServicePromise$$module$src$loader$$($ampDoc$jscomp$1$$, $element$jscomp$118$$).then(function($loaderService$$) {
    var $initDelay$$ = $ampDoc$jscomp$1$$.win.Date.now() - $startTime$jscomp$7$$;
    $loaderService$$.initializeLoader($element$jscomp$118$$, $loaderRoot$$, $initDelay$$, $elementWidth$$, $elementHeight$$);
  });
  return $loaderRoot$$;
}
;function $Pass$$module$src$pass$$($win$jscomp$159$$, $handler$jscomp$15$$, $opt_defaultDelay$$) {
  var $$jscomp$this$jscomp$63$$ = this;
  this.$timer_$ = $Services$$module$src$services$timerFor$$($win$jscomp$159$$);
  this.$handler_$ = $handler$jscomp$15$$;
  this.$defaultDelay_$ = $opt_defaultDelay$$ || 0;
  this.$scheduled_$ = -1;
  this.$nextTime_$ = 0;
  this.$running_$ = !1;
  this.$boundPass_$ = function() {
    $$jscomp$this$jscomp$63$$.$pass_$();
  };
}
$Pass$$module$src$pass$$.prototype.isPending = function() {
  return -1 != this.$scheduled_$;
};
$Pass$$module$src$pass$$.prototype.schedule = function($delay$jscomp$1_opt_delay$jscomp$2$$) {
  $delay$jscomp$1_opt_delay$jscomp$2$$ = $delay$jscomp$1_opt_delay$jscomp$2$$ || this.$defaultDelay_$;
  this.$running_$ && 10 > $delay$jscomp$1_opt_delay$jscomp$2$$ && ($delay$jscomp$1_opt_delay$jscomp$2$$ = 10);
  var $nextTime$$ = Date.now() + $delay$jscomp$1_opt_delay$jscomp$2$$;
  return !this.isPending() || -10 > $nextTime$$ - this.$nextTime_$ ? (this.cancel(), this.$nextTime_$ = $nextTime$$, this.$scheduled_$ = this.$timer_$.delay(this.$boundPass_$, $delay$jscomp$1_opt_delay$jscomp$2$$), !0) : !1;
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
var $INIT_TIME$$module$src$utils$intersection_observer_polyfill$$ = Date.now();
function $parseSizeList$$module$src$size_list$$($s$jscomp$25$$, $opt_allowPercentAsLength$$) {
  var $sSizes$$ = $s$jscomp$25$$.split(",");
  $userAssert$$module$src$log$$(0 < $sSizes$$.length, "sizes has to have at least one size");
  var $sizes$$ = [];
  $sSizes$$.forEach(function($s$jscomp$25$$) {
    $s$jscomp$25$$ = $s$jscomp$25$$.replace(/\s+/g, " ").trim();
    if (0 != $s$jscomp$25$$.length) {
      var $sSizes$$, $sSize$$ = !1;
      if (")" == $s$jscomp$25$$.charAt($s$jscomp$25$$.length - 1)) {
        $sSize$$ = !0;
        var $parens$$ = 1;
        for ($sSizes$$ = $s$jscomp$25$$.length - 2; 0 <= $sSizes$$; $sSizes$$--) {
          var $c$40_c$41_c$jscomp$3$$ = $s$jscomp$25$$.charAt($sSizes$$);
          "(" == $c$40_c$41_c$jscomp$3$$ ? $parens$$-- : ")" == $c$40_c$41_c$jscomp$3$$ && $parens$$++;
          if (0 == $parens$$) {
            break;
          }
        }
        var $funcEnd$$ = $sSizes$$ - 1;
        if (0 < $sSizes$$) {
          for ($sSizes$$--; 0 <= $sSizes$$ && ($c$40_c$41_c$jscomp$3$$ = $s$jscomp$25$$.charAt($sSizes$$), "%" == $c$40_c$41_c$jscomp$3$$ || "-" == $c$40_c$41_c$jscomp$3$$ || "_" == $c$40_c$41_c$jscomp$3$$ || "a" <= $c$40_c$41_c$jscomp$3$$ && "z" >= $c$40_c$41_c$jscomp$3$$ || "A" <= $c$40_c$41_c$jscomp$3$$ && "Z" >= $c$40_c$41_c$jscomp$3$$ || "0" <= $c$40_c$41_c$jscomp$3$$ && "9" >= $c$40_c$41_c$jscomp$3$$); $sSizes$$--) {
          }
        }
        $userAssert$$module$src$log$$($sSizes$$ < $funcEnd$$, 'Invalid CSS function in "%s"', $s$jscomp$25$$);
      } else {
        for ($sSizes$$ = $s$jscomp$25$$.length - 2; 0 <= $sSizes$$ && ($c$40_c$41_c$jscomp$3$$ = $s$jscomp$25$$.charAt($sSizes$$), "%" == $c$40_c$41_c$jscomp$3$$ || "." == $c$40_c$41_c$jscomp$3$$ || "a" <= $c$40_c$41_c$jscomp$3$$ && "z" >= $c$40_c$41_c$jscomp$3$$ || "A" <= $c$40_c$41_c$jscomp$3$$ && "Z" >= $c$40_c$41_c$jscomp$3$$ || "0" <= $c$40_c$41_c$jscomp$3$$ && "9" >= $c$40_c$41_c$jscomp$3$$); $sSizes$$--) {
        }
      }
      if (0 <= $sSizes$$) {
        var $mediaStr$$ = $s$jscomp$25$$.substring(0, $sSizes$$ + 1).trim();
        var $sizeStr$$ = $s$jscomp$25$$.substring($sSizes$$ + 1).trim();
      } else {
        $sizeStr$$ = $s$jscomp$25$$, $mediaStr$$ = void 0;
      }
      $sizes$$.push({mediaQuery:$mediaStr$$, size:$sSize$$ ? $sizeStr$$ : $opt_allowPercentAsLength$$ ? $assertLengthOrPercent$$module$src$layout$$($sizeStr$$) : $assertLength$$module$src$layout$$($sizeStr$$)});
    }
  });
  return new $SizeList$$module$src$size_list$$($sizes$$);
}
function $SizeList$$module$src$size_list$$($sizes$jscomp$1$$) {
  $userAssert$$module$src$log$$(0 < $sizes$jscomp$1$$.length, "SizeList must have at least one option");
  this.$sizes_$ = $sizes$jscomp$1$$;
  for (var $i$jscomp$73$$ = 0; $i$jscomp$73$$ < $sizes$jscomp$1$$.length; $i$jscomp$73$$++) {
    var $option$jscomp$1$$ = $sizes$jscomp$1$$[$i$jscomp$73$$];
    $i$jscomp$73$$ < $sizes$jscomp$1$$.length - 1 ? $userAssert$$module$src$log$$($option$jscomp$1$$.mediaQuery, "All options except for the last must have a media condition") : $userAssert$$module$src$log$$(!$option$jscomp$1$$.mediaQuery, "The last option must not have a media condition");
  }
}
$SizeList$$module$src$size_list$$.prototype.select = function($win$jscomp$163$$) {
  for (var $sizes$jscomp$2$$ = this.$sizes_$, $length$jscomp$26$$ = $sizes$jscomp$2$$.length - 1, $i$jscomp$74$$ = 0; $i$jscomp$74$$ < $length$jscomp$26$$; $i$jscomp$74$$++) {
    var $option$jscomp$2$$ = $sizes$jscomp$2$$[$i$jscomp$74$$];
    if ($win$jscomp$163$$.matchMedia($option$jscomp$2$$.mediaQuery).matches) {
      return $option$jscomp$2$$.size;
    }
  }
  return $sizes$jscomp$2$$[$length$jscomp$26$$].size;
};
var $deactivated$$module$src$chunk$$ = /nochunking=1/.test(self.location.hash), $resolved$$module$src$chunk$$ = $resolvedPromise$$module$src$resolved_promise$$();
function $chunkServiceForDoc$$module$src$chunk$$($elementOrAmpDoc$jscomp$18$$) {
  $registerServiceBuilderForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$18$$, "chunk", $Chunks$$module$src$chunk$$);
  return $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$jscomp$18$$, "chunk");
}
function $startupChunk$$module$src$chunk$$($doc$jscomp$30$$, $fn$jscomp$8$$, $opt_makesBodyVisible$$) {
  if ($deactivated$$module$src$chunk$$) {
    $resolved$$module$src$chunk$$.then($fn$jscomp$8$$);
  } else {
    var $service$jscomp$13$$ = $chunkServiceForDoc$$module$src$chunk$$($doc$jscomp$30$$.documentElement || $doc$jscomp$30$$);
    $service$jscomp$13$$.runForStartup($fn$jscomp$8$$);
    $opt_makesBodyVisible$$ && $service$jscomp$13$$.runForStartup(function() {
      $service$jscomp$13$$.$bodyIsVisible_$ = !0;
    });
  }
}
function $chunk$$module$src$chunk$$($elementOrAmpDoc$jscomp$19$$, $fn$jscomp$9$$) {
  $deactivated$$module$src$chunk$$ ? $resolved$$module$src$chunk$$.then($fn$jscomp$9$$) : $chunkServiceForDoc$$module$src$chunk$$($elementOrAmpDoc$jscomp$19$$).run($fn$jscomp$9$$, 10);
}
function $Task$$module$src$chunk$$($fn$jscomp$10$$) {
  this.state = "not_run";
  this.$fn_$ = $fn$jscomp$10$$;
}
function $JSCompiler_StaticMethods_runTask_$$($JSCompiler_StaticMethods_runTask_$self$$, $idleDeadline$$) {
  if ("run" != $JSCompiler_StaticMethods_runTask_$self$$.state) {
    $JSCompiler_StaticMethods_runTask_$self$$.state = "run";
    try {
      $JSCompiler_StaticMethods_runTask_$self$$.$fn_$($idleDeadline$$);
    } catch ($e$jscomp$62$$) {
      throw $JSCompiler_StaticMethods_runTask_$self$$.$onTaskError_$(), $e$jscomp$62$$;
    }
  }
}
$Task$$module$src$chunk$$.prototype.$getName_$ = function() {
  return this.$fn_$.displayName || this.$fn_$.name;
};
$Task$$module$src$chunk$$.prototype.$onTaskError_$ = function() {
};
$Task$$module$src$chunk$$.prototype.$immediateTriggerCondition_$ = function() {
  return !1;
};
$Task$$module$src$chunk$$.prototype.$useRequestIdleCallback_$ = function() {
  return !1;
};
function $StartupTask$$module$src$chunk$$($fn$jscomp$11$$, $win$jscomp$164$$, $chunks$$) {
  $Task$$module$src$chunk$$.call(this, $fn$jscomp$11$$);
  this.$chunks_$ = $chunks$$;
}
$$jscomp$inherits$$($StartupTask$$module$src$chunk$$, $Task$$module$src$chunk$$);
$StartupTask$$module$src$chunk$$.prototype.$onTaskError_$ = function() {
  $makeBodyVisibleRecovery$$module$src$style_installer$$(self.document);
};
$StartupTask$$module$src$chunk$$.prototype.$immediateTriggerCondition_$ = function() {
  return this.$chunks_$.ampdoc.isVisible();
};
$StartupTask$$module$src$chunk$$.prototype.$useRequestIdleCallback_$ = function() {
  return this.$chunks_$.$coreReady_$;
};
function $Chunks$$module$src$chunk$$($ampDoc$jscomp$2$$) {
  var $$jscomp$this$jscomp$68$$ = this;
  this.ampdoc = $ampDoc$jscomp$2$$;
  this.$win_$ = $ampDoc$jscomp$2$$.win;
  this.$tasks_$ = new $PriorityQueue$$module$src$utils$priority_queue$$;
  this.$boundExecute_$ = this.$execute_$.bind(this);
  this.$durationOfLastExecution_$ = 0;
  this.$scheduledImmediateInvocation_$ = !1;
  this.$bodyIsVisible_$ = this.$win_$.document.documentElement.hasAttribute("i-amphtml-no-boilerplate");
  this.$win_$.addEventListener("message", function($ampDoc$jscomp$2$$) {
    "amp-macro-task" == $ampDoc$jscomp$2$$.data && $$jscomp$this$jscomp$68$$.$execute_$(null);
  });
  this.$coreReady_$ = !1;
  $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($ampDoc$jscomp$2$$), "viewer").then(function() {
    $$jscomp$this$jscomp$68$$.$coreReady_$ = !0;
  });
  $ampDoc$jscomp$2$$.onVisibilityChanged(function() {
    $ampDoc$jscomp$2$$.isVisible() && $$jscomp$this$jscomp$68$$.$schedule_$();
  });
}
$Chunks$$module$src$chunk$$.prototype.run = function($fn$jscomp$12_t$jscomp$2$$, $priority$jscomp$5$$) {
  $fn$jscomp$12_t$jscomp$2$$ = new $Task$$module$src$chunk$$($fn$jscomp$12_t$jscomp$2$$);
  this.$tasks_$.enqueue($fn$jscomp$12_t$jscomp$2$$, $priority$jscomp$5$$);
  this.$schedule_$();
};
$Chunks$$module$src$chunk$$.prototype.runForStartup = function($fn$jscomp$13_t$jscomp$3$$) {
  $fn$jscomp$13_t$jscomp$3$$ = new $StartupTask$$module$src$chunk$$($fn$jscomp$13_t$jscomp$3$$, this.$win_$, this);
  this.$tasks_$.enqueue($fn$jscomp$13_t$jscomp$3$$, Number.POSITIVE_INFINITY);
  this.$schedule_$();
};
function $JSCompiler_StaticMethods_nextTask_$$($JSCompiler_StaticMethods_nextTask_$self$$, $opt_dequeue$$) {
  for (var $t$jscomp$4$$ = $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.peek(); $t$jscomp$4$$ && "not_run" !== $t$jscomp$4$$.state;) {
    $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.dequeue(), $t$jscomp$4$$ = $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.peek();
  }
  $t$jscomp$4$$ && $opt_dequeue$$ && $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.dequeue();
  return $t$jscomp$4$$;
}
$Chunks$$module$src$chunk$$.prototype.$execute_$ = function($idleDeadline$jscomp$1$$) {
  var $$jscomp$this$jscomp$69$$ = this, $t$jscomp$5$$ = $JSCompiler_StaticMethods_nextTask_$$(this, !0);
  if (!$t$jscomp$5$$) {
    return this.$scheduledImmediateInvocation_$ = !1, this.$durationOfLastExecution_$ = 0, !1;
  }
  try {
    var $before$jscomp$2$$ = Date.now();
    $JSCompiler_StaticMethods_runTask_$$($t$jscomp$5$$, $idleDeadline$jscomp$1$$);
  } finally {
    $resolved$$module$src$chunk$$.then().then().then().then().then().then().then().then().then(function() {
      $$jscomp$this$jscomp$69$$.$scheduledImmediateInvocation_$ = !1;
      $$jscomp$this$jscomp$69$$.$durationOfLastExecution_$ += Date.now() - $before$jscomp$2$$;
      $$jscomp$this$jscomp$69$$.$schedule_$();
    });
  }
  return !0;
};
function $JSCompiler_StaticMethods_executeAsap_$$($JSCompiler_StaticMethods_executeAsap_$self$$) {
  $JSCompiler_StaticMethods_executeAsap_$self$$.$bodyIsVisible_$ && 5 < $JSCompiler_StaticMethods_executeAsap_$self$$.$durationOfLastExecution_$ ? ($JSCompiler_StaticMethods_executeAsap_$self$$.$durationOfLastExecution_$ = 0, $JSCompiler_StaticMethods_requestMacroTask_$$($JSCompiler_StaticMethods_executeAsap_$self$$)) : $resolved$$module$src$chunk$$.then(function() {
    $JSCompiler_StaticMethods_executeAsap_$self$$.$boundExecute_$(null);
  });
}
$Chunks$$module$src$chunk$$.prototype.$schedule_$ = function() {
  if (!this.$scheduledImmediateInvocation_$) {
    var $nextTask$$ = $JSCompiler_StaticMethods_nextTask_$$(this);
    $nextTask$$ && ($nextTask$$.$immediateTriggerCondition_$() ? (this.$scheduledImmediateInvocation_$ = !0, $JSCompiler_StaticMethods_executeAsap_$$(this)) : $nextTask$$.$useRequestIdleCallback_$() && this.$win_$.requestIdleCallback ? $onIdle$$module$src$chunk$$(this.$win_$, this.$boundExecute_$) : $JSCompiler_StaticMethods_requestMacroTask_$$(this));
  }
};
function $JSCompiler_StaticMethods_requestMacroTask_$$($JSCompiler_StaticMethods_requestMacroTask_$self$$) {
  $JSCompiler_StaticMethods_requestMacroTask_$self$$.$win_$.postMessage("amp-macro-task", "*");
}
function $onIdle$$module$src$chunk$$($win$jscomp$165$$, $fn$jscomp$14$$) {
  function $rIC$$($info$jscomp$1$$) {
    if (15 > $info$jscomp$1$$.timeRemaining()) {
      var $remainingTimeout$$ = 2000 - (Date.now() - $startTime$jscomp$8$$);
      0 >= $remainingTimeout$$ || $info$jscomp$1$$.didTimeout ? $fn$jscomp$14$$($info$jscomp$1$$) : $win$jscomp$165$$.requestIdleCallback($rIC$$, {timeout:$remainingTimeout$$});
    } else {
      $fn$jscomp$14$$($info$jscomp$1$$);
    }
  }
  var $startTime$jscomp$8$$ = Date.now();
  $win$jscomp$165$$.requestIdleCallback($rIC$$, {timeout:2000});
}
;var $_template$$module$src$custom_element$$ = ['<div class="i-amphtml-loading-container i-amphtml-fill-content amp-hidden"></div>'], $templateTagSupported$$module$src$custom_element$$;
function $createCustomElementClass$$module$src$custom_element$$($win$jscomp$166$$) {
  function $CustomAmpElement$$() {
    return $BaseCustomElement$$.apply(this, arguments) || this;
  }
  var $BaseCustomElement$$ = $createBaseCustomElementClass$$module$src$custom_element$$($win$jscomp$166$$);
  $$jscomp$inherits$$($CustomAmpElement$$, $BaseCustomElement$$);
  return $CustomAmpElement$$;
}
function $createBaseCustomElementClass$$module$src$custom_element$$($win$jscomp$167$$) {
  function $BaseCustomElement$jscomp$1$$() {
    var $win$jscomp$167$$ = $htmlElement$jscomp$2$$.call(this) || this;
    $win$jscomp$167$$.createdCallback();
    return $win$jscomp$167$$;
  }
  if ($win$jscomp$167$$.__AMP_BASE_CE_CLASS) {
    return $win$jscomp$167$$.__AMP_BASE_CE_CLASS;
  }
  var $htmlElement$jscomp$2$$ = $win$jscomp$167$$.HTMLElement;
  $$jscomp$inherits$$($BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$);
  $BaseCustomElement$jscomp$1$$.prototype.createdCallback = function() {
    this.$isConnected_$ = this.$built_$ = !1;
    this.$buildingPromise_$ = null;
    this.readyState = "loading";
    this.everAttached = !1;
    this.$resources_$ = this.$ampdoc_$ = null;
    this.layout_ = "nodisplay";
    this.$layoutHeight_$ = this.$layoutWidth_$ = -1;
    this.$layoutCount_$ = 0;
    this.$paused_$ = this.$isInViewport_$ = this.$isFirstLayoutCompleted_$ = !1;
    this.$heightsList_$ = this.$sizeList_$ = this.$mediaQuery_$ = void 0;
    this.warnOnMissingOverflow = !0;
    this.$loadingState_$ = this.$loadingDisabled_$ = this.sizerElement = void 0;
    this.$loadingElement_$ = this.$loadingContainer_$ = null;
    this.layoutScheduleTime = this.$overflowElement_$ = void 0;
    var $BaseCustomElement$jscomp$1$$ = $win$jscomp$167$$.__AMP_EXTENDED_ELEMENTS && $win$jscomp$167$$.__AMP_EXTENDED_ELEMENTS[this.localName];
    $getMode$$module$src$mode$$().test && this.implementationClassForTesting && ($BaseCustomElement$jscomp$1$$ = this.implementationClassForTesting);
    $devAssert$$module$src$log$$($BaseCustomElement$jscomp$1$$);
    this.implementation_ = new $BaseCustomElement$jscomp$1$$(this);
    this.$upgradeState_$ = 1;
    this.$upgradeDelayMs_$ = 0;
    this.$isInTemplate_$ = this.$actionQueue_$ = void 0;
    this.$signals_$ = new $Signals$$module$src$utils$signals$$;
    var $htmlElement$jscomp$2$$ = $getExistingServiceOrNull$$module$src$service$$($win$jscomp$167$$);
    this.$perfOn_$ = $htmlElement$jscomp$2$$ && $htmlElement$jscomp$2$$.isPerformanceTrackingOn();
    this.$layoutDelayMeter_$ = null;
    this.__AMP_UPG_RES && (this.__AMP_UPG_RES(this), delete this.__AMP_UPG_RES, delete this.__AMP_UPG_PRM);
  };
  $BaseCustomElement$jscomp$1$$.prototype.signals = function() {
    return this.$signals_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.getAmpDoc = function() {
    $devAssert$$module$src$log$$(this.$ampdoc_$);
    return this.$ampdoc_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.getResources = function() {
    $devAssert$$module$src$log$$(this.$resources_$);
    return this.$resources_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.isUpgraded = function() {
    return 2 == this.$upgradeState_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.whenUpgraded = function() {
    return this.$signals_$.whenSignal("upgraded");
  };
  $BaseCustomElement$jscomp$1$$.prototype.upgrade = function($win$jscomp$167$$) {
    this.$isInTemplate_$ || 1 != this.$upgradeState_$ || (this.implementation_ = new $win$jscomp$167$$(this), this.everAttached && this.$tryUpgrade_$());
  };
  $BaseCustomElement$jscomp$1$$.prototype.getUpgradeDelayMs = function() {
    return this.$upgradeDelayMs_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.$completeUpgrade_$ = function($BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$) {
    this.$upgradeDelayMs_$ = $win$jscomp$167$$.Date.now() - $htmlElement$jscomp$2$$;
    this.$upgradeState_$ = 2;
    this.implementation_ = $BaseCustomElement$jscomp$1$$;
    this.classList.remove("amp-unresolved");
    this.classList.remove("i-amphtml-unresolved");
    this.implementation_.createdCallback();
    this.$assertLayout_$();
    this.implementation_.layout_ = this.layout_;
    this.implementation_.firstAttachedCallback();
    this.$dispatchCustomEventForTesting$("amp:attached");
    this.getResources().upgraded(this);
    this.$signals_$.signal("upgraded");
  };
  $BaseCustomElement$jscomp$1$$.prototype.$assertLayout_$ = function() {
    "nodisplay" == this.layout_ || this.implementation_.isLayoutSupported(this.layout_) || ($userAssert$$module$src$log$$(this.getAttribute("layout"), "The element did not specify a layout attribute. Check https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/control_layout and the respective element documentation for details."), $userAssert$$module$src$log$$(!1, "Layout not supported: " + this.layout_));
  };
  $BaseCustomElement$jscomp$1$$.prototype.isBuilt = function() {
    return this.$built_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.whenBuilt = function() {
    return this.$signals_$.whenSignal("built");
  };
  $BaseCustomElement$jscomp$1$$.prototype.getLayoutPriority = function() {
    $devAssert$$module$src$log$$(this.isUpgraded());
    return this.implementation_.getLayoutPriority();
  };
  $BaseCustomElement$jscomp$1$$.prototype.getLayoutWidth = function() {
    return this.$layoutWidth_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.getDefaultActionAlias = function() {
    $devAssert$$module$src$log$$(this.isUpgraded());
    return this.implementation_.getDefaultActionAlias();
  };
  $BaseCustomElement$jscomp$1$$.prototype.isBuilding = function() {
    return !!this.$buildingPromise_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.build = function() {
    var $win$jscomp$167$$ = this;
    $assertNotTemplate$$module$src$custom_element$$(this);
    $devAssert$$module$src$log$$(this.isUpgraded());
    return this.$buildingPromise_$ ? this.$buildingPromise_$ : this.$buildingPromise_$ = (new Promise(function($BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$) {
      var $$jscomp$this$jscomp$71$$ = $win$jscomp$167$$.$getConsentPolicy_$();
      $$jscomp$this$jscomp$71$$ ? $getElementServiceIfAvailableForDoc$$module$src$element_service$$($win$jscomp$167$$, "consentPolicyManager", "amp-consent").then(function($win$jscomp$167$$) {
        return $win$jscomp$167$$ ? $win$jscomp$167$$.whenPolicyUnblock($$jscomp$this$jscomp$71$$) : !0;
      }).then(function($$jscomp$this$jscomp$71$$) {
        $$jscomp$this$jscomp$71$$ ? $BaseCustomElement$jscomp$1$$($win$jscomp$167$$.implementation_.buildCallback()) : $htmlElement$jscomp$2$$(Error("BLOCK_BY_CONSENT"));
      }) : $BaseCustomElement$jscomp$1$$($win$jscomp$167$$.implementation_.buildCallback());
    })).then(function() {
      $win$jscomp$167$$.preconnect(!1);
      $win$jscomp$167$$.$built_$ = !0;
      $win$jscomp$167$$.classList.remove("i-amphtml-notbuilt");
      $win$jscomp$167$$.classList.remove("amp-notbuilt");
      $win$jscomp$167$$.$signals_$.signal("built");
      $win$jscomp$167$$.$isInViewport_$ && $win$jscomp$167$$.$updateInViewport_$(!0);
      $win$jscomp$167$$.$actionQueue_$ && $Services$$module$src$services$timerFor$$($win$jscomp$167$$.ownerDocument.defaultView).delay($win$jscomp$167$$.$dequeueActions_$.bind($win$jscomp$167$$), 1);
      if (!$win$jscomp$167$$.getPlaceholder()) {
        var $BaseCustomElement$jscomp$1$$ = $win$jscomp$167$$.createPlaceholder();
        $BaseCustomElement$jscomp$1$$ && $win$jscomp$167$$.appendChild($BaseCustomElement$jscomp$1$$);
      }
    }, function($BaseCustomElement$jscomp$1$$) {
      $win$jscomp$167$$.$signals_$.rejectSignal("built", $BaseCustomElement$jscomp$1$$);
      $isBlockedByConsent$$module$src$error$$($BaseCustomElement$jscomp$1$$) || $reportError$$module$src$error$$($BaseCustomElement$jscomp$1$$, $win$jscomp$167$$);
      throw $BaseCustomElement$jscomp$1$$;
    });
  };
  $BaseCustomElement$jscomp$1$$.prototype.preconnect = function($win$jscomp$167$$) {
    var $BaseCustomElement$jscomp$1$$ = this;
    $win$jscomp$167$$ ? this.implementation_.preconnectCallback($win$jscomp$167$$) : $startupChunk$$module$src$chunk$$(this.getAmpDoc(), function() {
      var $htmlElement$jscomp$2$$ = $BaseCustomElement$jscomp$1$$.tagName;
      $BaseCustomElement$jscomp$1$$.ownerDocument ? $BaseCustomElement$jscomp$1$$.ownerDocument.defaultView ? $BaseCustomElement$jscomp$1$$.implementation_.preconnectCallback($win$jscomp$167$$) : $dev$$module$src$log$$().error($htmlElement$jscomp$2$$, "preconnect without defaultView") : $dev$$module$src$log$$().error($htmlElement$jscomp$2$$, "preconnect without ownerDocument");
    });
  };
  $BaseCustomElement$jscomp$1$$.prototype.isAlwaysFixed = function() {
    return this.implementation_.isAlwaysFixed();
  };
  $BaseCustomElement$jscomp$1$$.prototype.updateLayoutBox = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$) {
    $BaseCustomElement$jscomp$1$$ = void 0 === $BaseCustomElement$jscomp$1$$ ? !1 : $BaseCustomElement$jscomp$1$$;
    this.$layoutWidth_$ = $win$jscomp$167$$.width;
    this.$layoutHeight_$ = $win$jscomp$167$$.height;
    if (this.isBuilt()) {
      this.onMeasure($BaseCustomElement$jscomp$1$$);
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.onMeasure = function($win$jscomp$167$$) {
    $win$jscomp$167$$ = void 0 === $win$jscomp$167$$ ? !1 : $win$jscomp$167$$;
    $devAssert$$module$src$log$$(this.isBuilt());
    try {
      if (this.implementation_.onLayoutMeasure(), $win$jscomp$167$$) {
        this.implementation_.onMeasureChanged();
      }
    } catch ($e$jscomp$64$$) {
      $reportError$$module$src$error$$($e$jscomp$64$$, this);
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.$getSizer_$ = function() {
    void 0 !== this.sizerElement || "responsive" !== this.layout_ && "intrinsic" !== this.layout_ || (this.sizerElement = this.querySelector("i-amphtml-sizer"));
    return this.sizerElement || null;
  };
  $BaseCustomElement$jscomp$1$$.prototype.$resetSizer_$ = function($win$jscomp$167$$) {
    if ("responsive" === this.layout_) {
      $setStyle$$module$src$style$$($win$jscomp$167$$, "paddingTop", "0");
    } else {
      if ("intrinsic" === this.layout_) {
        var $BaseCustomElement$jscomp$1$$ = $win$jscomp$167$$.querySelector(".i-amphtml-intrinsic-sizer");
        $BaseCustomElement$jscomp$1$$ && $BaseCustomElement$jscomp$1$$.setAttribute("src", "");
      }
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.applySizesAndMediaQuery = function() {
    $assertNotTemplate$$module$src$custom_element$$(this);
    void 0 === this.$mediaQuery_$ && (this.$mediaQuery_$ = this.getAttribute("media") || null);
    this.$mediaQuery_$ && this.classList.toggle("i-amphtml-hidden-by-media-query", !this.ownerDocument.defaultView.matchMedia(this.$mediaQuery_$).matches);
    if (void 0 === this.$sizeList_$) {
      var $win$jscomp$167$$ = this.getAttribute("sizes");
      this.$sizeList_$ = !this.hasAttribute("disable-inline-width") && $win$jscomp$167$$ ? $parseSizeList$$module$src$size_list$$($win$jscomp$167$$) : null;
    }
    this.$sizeList_$ && $setStyle$$module$src$style$$(this, "width", this.$sizeList_$.select(this.ownerDocument.defaultView));
    void 0 === this.$heightsList_$ && "responsive" === this.layout_ && (this.$heightsList_$ = ($win$jscomp$167$$ = this.getAttribute("heights")) ? $parseSizeList$$module$src$size_list$$($win$jscomp$167$$, !0) : null);
    this.$heightsList_$ && ($win$jscomp$167$$ = this.$getSizer_$()) && $setStyle$$module$src$style$$($win$jscomp$167$$, "paddingTop", this.$heightsList_$.select(this.ownerDocument.defaultView));
  };
  $BaseCustomElement$jscomp$1$$.prototype.applySize = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$) {
    var $newHeight$jscomp$4$$ = this.$getSizer_$();
    $newHeight$jscomp$4$$ && (this.sizerElement = null, this.$resetSizer_$($newHeight$jscomp$4$$), this.$mutateOrInvoke_$(function() {
      $newHeight$jscomp$4$$ && $removeElement$$module$src$dom$$($newHeight$jscomp$4$$);
    }));
    void 0 !== $win$jscomp$167$$ && $setStyle$$module$src$style$$(this, "height", $win$jscomp$167$$, "px");
    void 0 !== $BaseCustomElement$jscomp$1$$ && $setStyle$$module$src$style$$(this, "width", $BaseCustomElement$jscomp$1$$, "px");
    $htmlElement$jscomp$2$$ && (null != $htmlElement$jscomp$2$$.top && $setStyle$$module$src$style$$(this, "marginTop", $htmlElement$jscomp$2$$.top, "px"), null != $htmlElement$jscomp$2$$.right && $setStyle$$module$src$style$$(this, "marginRight", $htmlElement$jscomp$2$$.right, "px"), null != $htmlElement$jscomp$2$$.bottom && $setStyle$$module$src$style$$(this, "marginBottom", $htmlElement$jscomp$2$$.bottom, "px"), null != $htmlElement$jscomp$2$$.left && $setStyle$$module$src$style$$(this, "marginLeft", 
    $htmlElement$jscomp$2$$.left, "px"));
    this.$isAwaitingSize_$() && this.$sizeProvided_$();
    this.dispatchCustomEvent("amp:size-changed");
  };
  $BaseCustomElement$jscomp$1$$.prototype.connectedCallback = function() {
    void 0 === $templateTagSupported$$module$src$custom_element$$ && ($templateTagSupported$$module$src$custom_element$$ = "content" in self.document.createElement("template"));
    $templateTagSupported$$module$src$custom_element$$ || void 0 !== this.$isInTemplate_$ || (this.$isInTemplate_$ = !!$closestAncestorElementBySelector$$module$src$dom$$(this, "template"));
    if (!this.$isInTemplate_$ && !this.$isConnected_$ && $isConnectedNode$$module$src$dom$$(this)) {
      this.$isConnected_$ = !0;
      this.everAttached || (this.classList.add("i-amphtml-element"), this.classList.add("i-amphtml-notbuilt"), this.classList.add("amp-notbuilt"));
      if (!this.$ampdoc_$) {
        var $win$jscomp$167$$ = this.ownerDocument.defaultView, $BaseCustomElement$jscomp$1$$ = $Services$$module$src$services$ampdocServiceFor$$($win$jscomp$167$$).getAmpDoc(this);
        this.$ampdoc_$ = $BaseCustomElement$jscomp$1$$;
        var $htmlElement$jscomp$2$$ = this.tagName.toLowerCase();
        this.implementation_ instanceof $ElementStub$$module$src$element_stub$$ && !$BaseCustomElement$jscomp$1$$.declaresExtension($htmlElement$jscomp$2$$) && $Services$$module$src$services$extensionsFor$$($win$jscomp$167$$).installExtensionForDoc($BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$);
      }
      this.$resources_$ || (this.$resources_$ = $Services$$module$src$services$resourcesForDoc$$(this.$ampdoc_$));
      this.getResources().add(this);
      if (this.everAttached) {
        var $reconstruct$$ = this.reconstructWhenReparented();
        $reconstruct$$ && this.$reset_$();
        this.isUpgraded() && ($reconstruct$$ && this.getResources().upgraded(this), this.$dispatchCustomEventForTesting$("amp:attached"));
      } else {
        this.everAttached = !0;
        try {
          var $JSCompiler_completedLayoutAttr$jscomp$inline_526$$ = this.getAttribute("i-amphtml-layout");
          if ($JSCompiler_completedLayoutAttr$jscomp$inline_526$$) {
            var $layout$15$jscomp$inline_527$$ = $devAssert$$module$src$log$$($parseLayout$$module$src$layout$$($JSCompiler_completedLayoutAttr$jscomp$inline_526$$));
            "responsive" != $layout$15$jscomp$inline_527$$ && "intrinsic" != $layout$15$jscomp$inline_527$$ || !this.firstElementChild ? "nodisplay" == $layout$15$jscomp$inline_527$$ && ($toggle$$module$src$style$$(this, !1), this.style.display = "") : this.sizerElement = this.querySelector("i-amphtml-sizer") || void 0;
            var $JSCompiler_inline_result$jscomp$158$$ = $layout$15$jscomp$inline_527$$;
          } else {
            var $JSCompiler_layoutAttr$jscomp$inline_528$$ = this.getAttribute("layout"), $JSCompiler_widthAttr$jscomp$inline_529$$ = this.getAttribute("width"), $JSCompiler_heightAttr$jscomp$inline_530$$ = this.getAttribute("height"), $JSCompiler_sizesAttr$jscomp$inline_531$$ = this.getAttribute("sizes"), $JSCompiler_heightsAttr$jscomp$inline_532$$ = this.getAttribute("heights"), $JSCompiler_inputLayout$jscomp$inline_533$$ = $JSCompiler_layoutAttr$jscomp$inline_528$$ ? $parseLayout$$module$src$layout$$($JSCompiler_layoutAttr$jscomp$inline_528$$) : 
            null;
            $userAssert$$module$src$log$$(void 0 !== $JSCompiler_inputLayout$jscomp$inline_533$$, 'Invalid "layout" value: %s, %s', $JSCompiler_layoutAttr$jscomp$inline_528$$, this);
            var $JSCompiler_inputWidth$jscomp$inline_534$$ = $JSCompiler_widthAttr$jscomp$inline_529$$ && "auto" != $JSCompiler_widthAttr$jscomp$inline_529$$ ? $parseLength$$module$src$layout$$($JSCompiler_widthAttr$jscomp$inline_529$$) : $JSCompiler_widthAttr$jscomp$inline_529$$;
            $userAssert$$module$src$log$$(void 0 !== $JSCompiler_inputWidth$jscomp$inline_534$$, 'Invalid "width" value: %s, %s', $JSCompiler_widthAttr$jscomp$inline_529$$, this);
            var $JSCompiler_inputHeight$jscomp$inline_535$$ = $JSCompiler_heightAttr$jscomp$inline_530$$ && "fluid" != $JSCompiler_heightAttr$jscomp$inline_530$$ ? $parseLength$$module$src$layout$$($JSCompiler_heightAttr$jscomp$inline_530$$) : $JSCompiler_heightAttr$jscomp$inline_530$$;
            $userAssert$$module$src$log$$(void 0 !== $JSCompiler_inputHeight$jscomp$inline_535$$, 'Invalid "height" value: %s, %s', $JSCompiler_heightAttr$jscomp$inline_530$$, this);
            var $JSCompiler_temp$jscomp$849$$;
            if (!($JSCompiler_temp$jscomp$849$$ = $JSCompiler_inputLayout$jscomp$inline_533$$ && "fixed" != $JSCompiler_inputLayout$jscomp$inline_533$$ && "fixed-height" != $JSCompiler_inputLayout$jscomp$inline_533$$ || $JSCompiler_inputWidth$jscomp$inline_534$$ && $JSCompiler_inputHeight$jscomp$inline_535$$)) {
              var $JSCompiler_tagName$jscomp$inline_926$$ = this.tagName;
              $JSCompiler_tagName$jscomp$inline_926$$ = $JSCompiler_tagName$jscomp$inline_926$$.toUpperCase();
              $JSCompiler_temp$jscomp$849$$ = void 0 === $naturalDimensions_$$module$src$layout$$[$JSCompiler_tagName$jscomp$inline_926$$];
            }
            if ($JSCompiler_temp$jscomp$849$$) {
              var $JSCompiler_width$jscomp$inline_536$$ = $JSCompiler_inputWidth$jscomp$inline_534$$;
              var $JSCompiler_height$jscomp$inline_537$$ = $JSCompiler_inputHeight$jscomp$inline_535$$;
            } else {
              var $JSCompiler_tagName$jscomp$inline_929$$ = this.tagName.toUpperCase();
              $devAssert$$module$src$log$$(void 0 !== $naturalDimensions_$$module$src$layout$$[$JSCompiler_tagName$jscomp$inline_929$$]);
              if (!$naturalDimensions_$$module$src$layout$$[$JSCompiler_tagName$jscomp$inline_929$$]) {
                var $JSCompiler_doc$jscomp$inline_930$$ = this.ownerDocument, $JSCompiler_naturalTagName$jscomp$inline_931$$ = $JSCompiler_tagName$jscomp$inline_929$$.replace(/^AMP\-/, ""), $JSCompiler_temp$jscomp$inline_932$$ = $JSCompiler_doc$jscomp$inline_930$$.createElement($JSCompiler_naturalTagName$jscomp$inline_931$$);
                $JSCompiler_temp$jscomp$inline_932$$.controls = !0;
                $setStyles$$module$src$style$$($JSCompiler_temp$jscomp$inline_932$$, {position:"absolute", visibility:"hidden"});
                $JSCompiler_doc$jscomp$inline_930$$.body.appendChild($JSCompiler_temp$jscomp$inline_932$$);
                $naturalDimensions_$$module$src$layout$$[$JSCompiler_tagName$jscomp$inline_929$$] = {width:($JSCompiler_temp$jscomp$inline_932$$.offsetWidth || 1) + "px", height:($JSCompiler_temp$jscomp$inline_932$$.offsetHeight || 1) + "px"};
                $JSCompiler_doc$jscomp$inline_930$$.body.removeChild($JSCompiler_temp$jscomp$inline_932$$);
              }
              var $JSCompiler_inline_result$jscomp$851$$ = $naturalDimensions_$$module$src$layout$$[$JSCompiler_tagName$jscomp$inline_929$$];
              $JSCompiler_width$jscomp$inline_536$$ = $JSCompiler_inputWidth$jscomp$inline_534$$ || "fixed-height" == $JSCompiler_inputLayout$jscomp$inline_533$$ ? $JSCompiler_inputWidth$jscomp$inline_534$$ : $JSCompiler_inline_result$jscomp$851$$.width;
              $JSCompiler_height$jscomp$inline_537$$ = $JSCompiler_inputHeight$jscomp$inline_535$$ || $JSCompiler_inline_result$jscomp$851$$.height;
            }
            var $JSCompiler_layout$jscomp$inline_538$$ = $JSCompiler_inputLayout$jscomp$inline_533$$ ? $JSCompiler_inputLayout$jscomp$inline_533$$ : $JSCompiler_width$jscomp$inline_536$$ || $JSCompiler_height$jscomp$inline_537$$ ? "fluid" == $JSCompiler_height$jscomp$inline_537$$ ? "fluid" : !$JSCompiler_height$jscomp$inline_537$$ || $JSCompiler_width$jscomp$inline_536$$ && "auto" != $JSCompiler_width$jscomp$inline_536$$ ? $JSCompiler_height$jscomp$inline_537$$ && $JSCompiler_width$jscomp$inline_536$$ && 
            ($JSCompiler_sizesAttr$jscomp$inline_531$$ || $JSCompiler_heightsAttr$jscomp$inline_532$$) ? "responsive" : "fixed" : "fixed-height" : "container";
            "fixed" != $JSCompiler_layout$jscomp$inline_538$$ && "fixed-height" != $JSCompiler_layout$jscomp$inline_538$$ && "responsive" != $JSCompiler_layout$jscomp$inline_538$$ && "intrinsic" != $JSCompiler_layout$jscomp$inline_538$$ || $userAssert$$module$src$log$$($JSCompiler_height$jscomp$inline_537$$, 'The "height" attribute is missing: %s', this);
            "fixed-height" == $JSCompiler_layout$jscomp$inline_538$$ && $userAssert$$module$src$log$$(!$JSCompiler_width$jscomp$inline_536$$ || "auto" == $JSCompiler_width$jscomp$inline_536$$, 'The "width" attribute must be missing or "auto": %s', this);
            "fixed" != $JSCompiler_layout$jscomp$inline_538$$ && "responsive" != $JSCompiler_layout$jscomp$inline_538$$ && "intrinsic" != $JSCompiler_layout$jscomp$inline_538$$ || $userAssert$$module$src$log$$($JSCompiler_width$jscomp$inline_536$$ && "auto" != $JSCompiler_width$jscomp$inline_536$$, 'The "width" attribute must be present and not "auto": %s', this);
            "responsive" == $JSCompiler_layout$jscomp$inline_538$$ || "intrinsic" == $JSCompiler_layout$jscomp$inline_538$$ ? $userAssert$$module$src$log$$($getLengthUnits$$module$src$layout$$($JSCompiler_width$jscomp$inline_536$$) == $getLengthUnits$$module$src$layout$$($JSCompiler_height$jscomp$inline_537$$), 'Length units should be the same for "width" and "height": %s, %s, %s', $JSCompiler_widthAttr$jscomp$inline_529$$, $JSCompiler_heightAttr$jscomp$inline_530$$, this) : $userAssert$$module$src$log$$(null === 
            $JSCompiler_heightsAttr$jscomp$inline_532$$, '"heights" attribute must be missing: %s', this);
            this.classList.add("i-amphtml-layout-" + $JSCompiler_layout$jscomp$inline_538$$);
            $isLayoutSizeDefined$$module$src$layout$$($JSCompiler_layout$jscomp$inline_538$$) && this.classList.add("i-amphtml-layout-size-defined");
            if ("nodisplay" == $JSCompiler_layout$jscomp$inline_538$$) {
              $toggle$$module$src$style$$(this, !1), this.style.display = "";
            } else {
              if ("fixed" == $JSCompiler_layout$jscomp$inline_538$$) {
                $setStyles$$module$src$style$$(this, {width:$JSCompiler_width$jscomp$inline_536$$, height:$JSCompiler_height$jscomp$inline_537$$});
              } else {
                if ("fixed-height" == $JSCompiler_layout$jscomp$inline_538$$) {
                  $setStyle$$module$src$style$$(this, "height", $JSCompiler_height$jscomp$inline_537$$);
                } else {
                  if ("responsive" == $JSCompiler_layout$jscomp$inline_538$$) {
                    var $JSCompiler_sizer$jscomp$inline_540$$ = this.ownerDocument.createElement("i-amphtml-sizer");
                    $setStyles$$module$src$style$$($JSCompiler_sizer$jscomp$inline_540$$, {paddingTop:$getLengthNumeral$$module$src$layout$$($JSCompiler_height$jscomp$inline_537$$) / $getLengthNumeral$$module$src$layout$$($JSCompiler_width$jscomp$inline_536$$) * 100 + "%"});
                    this.insertBefore($JSCompiler_sizer$jscomp$inline_540$$, this.firstChild);
                    this.sizerElement = $JSCompiler_sizer$jscomp$inline_540$$;
                  } else {
                    if ("intrinsic" == $JSCompiler_layout$jscomp$inline_538$$) {
                      var $sizer$16$jscomp$inline_541$$ = $htmlFor$$module$src$static_template$$(this)($_template$$module$src$layout$$);
                      $sizer$16$jscomp$inline_541$$.firstElementChild.setAttribute("src", 'data:image/svg+xml;charset=utf-8,<svg height="' + $JSCompiler_height$jscomp$inline_537$$ + '" width="' + $JSCompiler_width$jscomp$inline_536$$ + '" xmlns="http://www.w3.org/2000/svg" version="1.1"/>');
                      this.insertBefore($sizer$16$jscomp$inline_541$$, this.firstChild);
                      this.sizerElement = $sizer$16$jscomp$inline_541$$;
                    } else {
                      "fill" != $JSCompiler_layout$jscomp$inline_538$$ && "container" != $JSCompiler_layout$jscomp$inline_538$$ && ("flex-item" == $JSCompiler_layout$jscomp$inline_538$$ ? ($JSCompiler_width$jscomp$inline_536$$ && $setStyle$$module$src$style$$(this, "width", $JSCompiler_width$jscomp$inline_536$$), $JSCompiler_height$jscomp$inline_537$$ && $setStyle$$module$src$style$$(this, "height", $JSCompiler_height$jscomp$inline_537$$)) : "fluid" == $JSCompiler_layout$jscomp$inline_538$$ && (this.classList.add("i-amphtml-layout-awaiting-size"), 
                      $JSCompiler_width$jscomp$inline_536$$ && $setStyle$$module$src$style$$(this, "width", $JSCompiler_width$jscomp$inline_536$$), $setStyle$$module$src$style$$(this, "height", 0)));
                    }
                  }
                }
              }
            }
            this.setAttribute("i-amphtml-layout", $JSCompiler_layout$jscomp$inline_538$$);
            $JSCompiler_inline_result$jscomp$158$$ = $JSCompiler_layout$jscomp$inline_538$$;
          }
          this.layout_ = $JSCompiler_inline_result$jscomp$158$$;
        } catch ($e$jscomp$65$$) {
          $reportError$$module$src$error$$($e$jscomp$65$$, this);
        }
        this.implementation_ instanceof $ElementStub$$module$src$element_stub$$ || this.$tryUpgrade_$();
        this.isUpgraded() || (this.classList.add("amp-unresolved"), this.classList.add("i-amphtml-unresolved"), this.$dispatchCustomEventForTesting$("amp:stubbed"));
        this.getResources().isIntersectionExperimentOn() && this.applySizesAndMediaQuery();
      }
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.$isAwaitingSize_$ = function() {
    return this.classList.contains("i-amphtml-layout-awaiting-size");
  };
  $BaseCustomElement$jscomp$1$$.prototype.$sizeProvided_$ = function() {
    this.classList.remove("i-amphtml-layout-awaiting-size");
  };
  $BaseCustomElement$jscomp$1$$.prototype.attachedCallback = function() {
    this.connectedCallback();
  };
  $BaseCustomElement$jscomp$1$$.prototype.$tryUpgrade_$ = function() {
    var $BaseCustomElement$jscomp$1$$ = this, $htmlElement$jscomp$2$$ = this.implementation_;
    $devAssert$$module$src$log$$(!($htmlElement$jscomp$2$$ instanceof $ElementStub$$module$src$element_stub$$));
    if (1 == this.$upgradeState_$) {
      this.$upgradeState_$ = 4;
      var $startTime$jscomp$9$$ = $win$jscomp$167$$.Date.now(), $res$jscomp$12$$ = $htmlElement$jscomp$2$$.upgradeCallback();
      $res$jscomp$12$$ ? "function" == typeof $res$jscomp$12$$.then ? $res$jscomp$12$$.then(function($win$jscomp$167$$) {
        $BaseCustomElement$jscomp$1$$.$completeUpgrade_$($win$jscomp$167$$ || $htmlElement$jscomp$2$$, $startTime$jscomp$9$$);
      }).catch(function($win$jscomp$167$$) {
        $BaseCustomElement$jscomp$1$$.$upgradeState_$ = 3;
        $rethrowAsync$$module$src$log$$($win$jscomp$167$$);
      }) : this.$completeUpgrade_$($res$jscomp$12$$, $startTime$jscomp$9$$) : this.$completeUpgrade_$($htmlElement$jscomp$2$$, $startTime$jscomp$9$$);
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.disconnectedCallback = function() {
    this.disconnect(!1);
  };
  $BaseCustomElement$jscomp$1$$.prototype.detachedCallback = function() {
    this.disconnectedCallback();
  };
  $BaseCustomElement$jscomp$1$$.prototype.disconnect = function($win$jscomp$167$$) {
    this.$isInTemplate_$ || !this.$isConnected_$ || !$win$jscomp$167$$ && $isConnectedNode$$module$src$dom$$(this) || ($win$jscomp$167$$ && this.classList.remove("i-amphtml-element"), this.$isConnected_$ = !1, this.getResources().remove(this), this.implementation_.detachedCallback());
  };
  $BaseCustomElement$jscomp$1$$.prototype.dispatchCustomEvent = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$) {
    $BaseCustomElement$jscomp$1$$ = $BaseCustomElement$jscomp$1$$ || {};
    var $htmlElement$jscomp$2$$ = this.ownerDocument.createEvent("Event");
    $htmlElement$jscomp$2$$.data = $BaseCustomElement$jscomp$1$$;
    $htmlElement$jscomp$2$$.initEvent($win$jscomp$167$$, !0, !0);
    this.dispatchEvent($htmlElement$jscomp$2$$);
  };
  $BaseCustomElement$jscomp$1$$.prototype.$dispatchCustomEventForTesting$ = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$) {
    $getMode$$module$src$mode$$().test && this.dispatchCustomEvent($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$);
  };
  $BaseCustomElement$jscomp$1$$.prototype.prerenderAllowed = function() {
    return this.implementation_.prerenderAllowed();
  };
  $BaseCustomElement$jscomp$1$$.prototype.isBuildRenderBlocking = function() {
    return this.implementation_.isBuildRenderBlocking();
  };
  $BaseCustomElement$jscomp$1$$.prototype.createPlaceholder = function() {
    return this.implementation_.createPlaceholderCallback();
  };
  $BaseCustomElement$jscomp$1$$.prototype.createLoaderLogo = function() {
    return this.implementation_.createLoaderLogoCallback();
  };
  $BaseCustomElement$jscomp$1$$.prototype.renderOutsideViewport = function() {
    return this.implementation_.renderOutsideViewport();
  };
  $BaseCustomElement$jscomp$1$$.prototype.getLayoutBox = function() {
    return this.$getResource_$().getLayoutBox();
  };
  $BaseCustomElement$jscomp$1$$.prototype.getPageLayoutBox = function() {
    return this.$getResource_$().getPageLayoutBox();
  };
  $BaseCustomElement$jscomp$1$$.prototype.getOwner = function() {
    return this.$getResource_$().getOwner();
  };
  $BaseCustomElement$jscomp$1$$.prototype.getIntersectionChangeEntry = function() {
    var $win$jscomp$167$$ = this.implementation_.getIntersectionElementLayoutBox(), $BaseCustomElement$jscomp$1$$ = this.getOwner(), $htmlElement$jscomp$2$$ = this.implementation_.getViewport().getRect(), $ownerBox$$ = $BaseCustomElement$jscomp$1$$ && $BaseCustomElement$jscomp$1$$.getLayoutBox(), $JSCompiler_intersection$jscomp$inline_546_JSCompiler_intersection$jscomp$inline_941$$ = $rectIntersection$$module$src$layout_rect$$($win$jscomp$167$$, $ownerBox$$, $htmlElement$jscomp$2$$) || $layoutRectLtwh$$module$src$layout_rect$$(0, 
    0, 0, 0);
    $BaseCustomElement$jscomp$1$$ = $JSCompiler_intersection$jscomp$inline_546_JSCompiler_intersection$jscomp$inline_941$$.width * $JSCompiler_intersection$jscomp$inline_546_JSCompiler_intersection$jscomp$inline_941$$.height;
    var $JSCompiler_largerBoxArea$jscomp$inline_937_JSCompiler_rootBounds$jscomp$inline_944$$ = $win$jscomp$167$$.width * $win$jscomp$167$$.height;
    $BaseCustomElement$jscomp$1$$ = 0 === $JSCompiler_largerBoxArea$jscomp$inline_937_JSCompiler_rootBounds$jscomp$inline_944$$ ? 0 : $BaseCustomElement$jscomp$1$$ / $JSCompiler_largerBoxArea$jscomp$inline_937_JSCompiler_rootBounds$jscomp$inline_944$$;
    if ($JSCompiler_largerBoxArea$jscomp$inline_937_JSCompiler_rootBounds$jscomp$inline_944$$ = $htmlElement$jscomp$2$$) {
      $JSCompiler_intersection$jscomp$inline_546_JSCompiler_intersection$jscomp$inline_941$$ = $moveLayoutRect$$module$src$layout_rect$$($JSCompiler_intersection$jscomp$inline_546_JSCompiler_intersection$jscomp$inline_941$$, -$htmlElement$jscomp$2$$.left, -$htmlElement$jscomp$2$$.top), $win$jscomp$167$$ = $moveLayoutRect$$module$src$layout_rect$$($win$jscomp$167$$, -$htmlElement$jscomp$2$$.left, -$htmlElement$jscomp$2$$.top), $JSCompiler_largerBoxArea$jscomp$inline_937_JSCompiler_rootBounds$jscomp$inline_944$$ = 
      $moveLayoutRect$$module$src$layout_rect$$($JSCompiler_largerBoxArea$jscomp$inline_937_JSCompiler_rootBounds$jscomp$inline_944$$, -$htmlElement$jscomp$2$$.left, -$htmlElement$jscomp$2$$.top);
    }
    return {time:"undefined" !== typeof performance && performance.now ? performance.now() : Date.now() - $INIT_TIME$$module$src$utils$intersection_observer_polyfill$$, rootBounds:$JSCompiler_largerBoxArea$jscomp$inline_937_JSCompiler_rootBounds$jscomp$inline_944$$, boundingClientRect:$win$jscomp$167$$, intersectionRect:$JSCompiler_intersection$jscomp$inline_546_JSCompiler_intersection$jscomp$inline_941$$, intersectionRatio:$BaseCustomElement$jscomp$1$$};
  };
  $BaseCustomElement$jscomp$1$$.prototype.$getResource_$ = function() {
    return this.getResources().getResourceForElement(this);
  };
  $BaseCustomElement$jscomp$1$$.prototype.getResourceId = function() {
    return this.$getResource_$().getId();
  };
  $BaseCustomElement$jscomp$1$$.prototype.isRelayoutNeeded = function() {
    return this.implementation_.isRelayoutNeeded();
  };
  $BaseCustomElement$jscomp$1$$.prototype.getImpl = function($win$jscomp$167$$) {
    var $BaseCustomElement$jscomp$1$$ = this;
    $win$jscomp$167$$ = void 0 === $win$jscomp$167$$ ? !0 : $win$jscomp$167$$;
    return ($win$jscomp$167$$ ? this.whenBuilt() : this.whenUpgraded()).then(function() {
      return $BaseCustomElement$jscomp$1$$.implementation_;
    });
  };
  $BaseCustomElement$jscomp$1$$.prototype.getLayout = function() {
    return this.layout_;
  };
  $BaseCustomElement$jscomp$1$$.prototype.layoutCallback = function() {
    var $win$jscomp$167$$ = this;
    $assertNotTemplate$$module$src$custom_element$$(this);
    $devAssert$$module$src$log$$(this.isBuilt());
    this.$dispatchCustomEventForTesting$("amp:load-start");
    var $BaseCustomElement$jscomp$1$$ = 0 == this.$layoutCount_$;
    this.$signals_$.reset("unload");
    $BaseCustomElement$jscomp$1$$ && this.$signals_$.signal("load-start");
    this.$perfOn_$ && this.$getLayoutDelayMeter_$().startLayout();
    var $htmlElement$jscomp$2$$ = $tryResolve$$module$src$utils$promise$$(function() {
      return $win$jscomp$167$$.implementation_.layoutCallback();
    });
    this.preconnect(!0);
    this.classList.add("i-amphtml-layout");
    return $htmlElement$jscomp$2$$.then(function() {
      $BaseCustomElement$jscomp$1$$ && $win$jscomp$167$$.$signals_$.signal("load-end");
      $win$jscomp$167$$.readyState = "complete";
      $win$jscomp$167$$.$layoutCount_$++;
      $win$jscomp$167$$.toggleLoading(!1, {cleanup:!0});
      $win$jscomp$167$$.$isFirstLayoutCompleted_$ || ($win$jscomp$167$$.implementation_.firstLayoutCompleted(), $win$jscomp$167$$.$isFirstLayoutCompleted_$ = !0, $win$jscomp$167$$.$dispatchCustomEventForTesting$("amp:load-end"));
    }, function($htmlElement$jscomp$2$$) {
      $BaseCustomElement$jscomp$1$$ && $win$jscomp$167$$.$signals_$.rejectSignal("load-end", $htmlElement$jscomp$2$$);
      $win$jscomp$167$$.$layoutCount_$++;
      $win$jscomp$167$$.toggleLoading(!1, {cleanup:!0});
      throw $htmlElement$jscomp$2$$;
    });
  };
  $BaseCustomElement$jscomp$1$$.prototype.isInViewport = function() {
    return this.$isInViewport_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.viewportCallback = function($BaseCustomElement$jscomp$1$$) {
    var $htmlElement$jscomp$2$$ = this;
    $assertNotTemplate$$module$src$custom_element$$(this);
    if ($BaseCustomElement$jscomp$1$$ != this.$isInViewport_$ && this.ownerDocument && this.ownerDocument.defaultView) {
      this.$isInViewport_$ = $BaseCustomElement$jscomp$1$$;
      if (0 == this.$layoutCount_$) {
        if ($BaseCustomElement$jscomp$1$$) {
          var $inViewport$jscomp$2$$ = $win$jscomp$167$$.Date.now();
          $Services$$module$src$services$timerFor$$(this.ownerDocument.defaultView).delay(function() {
            $htmlElement$jscomp$2$$.$isInViewport_$ && $htmlElement$jscomp$2$$.ownerDocument && $htmlElement$jscomp$2$$.ownerDocument.defaultView && 0 === $htmlElement$jscomp$2$$.$layoutCount_$ && $htmlElement$jscomp$2$$.toggleLoading(!0, {startTime:$inViewport$jscomp$2$$});
          }, 100);
        } else {
          this.toggleLoading(!1);
        }
      }
      this.isBuilt() && this.$updateInViewport_$($BaseCustomElement$jscomp$1$$);
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.$updateInViewport_$ = function($win$jscomp$167$$) {
    this.implementation_.inViewport_ = $win$jscomp$167$$;
    this.implementation_.viewportCallback($win$jscomp$167$$);
    $win$jscomp$167$$ && this.$perfOn_$ && this.$getLayoutDelayMeter_$().enterViewport();
  };
  $BaseCustomElement$jscomp$1$$.prototype.isPaused = function() {
    return this.$paused_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.pauseCallback = function() {
    $assertNotTemplate$$module$src$custom_element$$(this);
    this.$paused_$ || (this.$paused_$ = !0, this.viewportCallback(!1), this.isBuilt() && this.implementation_.pauseCallback());
  };
  $BaseCustomElement$jscomp$1$$.prototype.resumeCallback = function() {
    $assertNotTemplate$$module$src$custom_element$$(this);
    this.$paused_$ && (this.$paused_$ = !1, this.isBuilt() && this.implementation_.resumeCallback());
  };
  $BaseCustomElement$jscomp$1$$.prototype.unlayoutCallback = function() {
    $assertNotTemplate$$module$src$custom_element$$(this);
    if (!this.isBuilt()) {
      return !1;
    }
    this.$signals_$.signal("unload");
    var $win$jscomp$167$$ = this.implementation_.unlayoutCallback();
    $win$jscomp$167$$ && this.$reset_$();
    this.$dispatchCustomEventForTesting$("amp:unload");
    return $win$jscomp$167$$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.$reset_$ = function() {
    this.$layoutCount_$ = 0;
    this.$isFirstLayoutCompleted_$ = !1;
    this.$signals_$.reset("render-start");
    this.$signals_$.reset("load-start");
    this.$signals_$.reset("load-end");
    this.$signals_$.reset("ini-load");
  };
  $BaseCustomElement$jscomp$1$$.prototype.unlayoutOnPause = function() {
    return this.implementation_.unlayoutOnPause();
  };
  $BaseCustomElement$jscomp$1$$.prototype.reconstructWhenReparented = function() {
    return this.implementation_.reconstructWhenReparented();
  };
  $BaseCustomElement$jscomp$1$$.prototype.collapse = function() {
    this.implementation_.collapse();
  };
  $BaseCustomElement$jscomp$1$$.prototype.collapsedCallback = function($win$jscomp$167$$) {
    this.implementation_.collapsedCallback($win$jscomp$167$$);
  };
  $BaseCustomElement$jscomp$1$$.prototype.expand = function() {
    this.implementation_.expand();
  };
  $BaseCustomElement$jscomp$1$$.prototype.expandedCallback = function($win$jscomp$167$$) {
    this.implementation_.expandedCallback($win$jscomp$167$$);
  };
  $BaseCustomElement$jscomp$1$$.prototype.mutatedAttributesCallback = function($win$jscomp$167$$) {
    this.implementation_.mutatedAttributesCallback($win$jscomp$167$$);
  };
  $BaseCustomElement$jscomp$1$$.prototype.enqueAction = function($win$jscomp$167$$) {
    $assertNotTemplate$$module$src$custom_element$$(this);
    this.isBuilt() ? this.$executionAction_$($win$jscomp$167$$, !1) : (void 0 === this.$actionQueue_$ && (this.$actionQueue_$ = []), $devAssert$$module$src$log$$(this.$actionQueue_$).push($win$jscomp$167$$));
  };
  $BaseCustomElement$jscomp$1$$.prototype.$dequeueActions_$ = function() {
    var $win$jscomp$167$$ = this;
    if (this.$actionQueue_$) {
      var $BaseCustomElement$jscomp$1$$ = $devAssert$$module$src$log$$(this.$actionQueue_$);
      this.$actionQueue_$ = null;
      $BaseCustomElement$jscomp$1$$.forEach(function($BaseCustomElement$jscomp$1$$) {
        $win$jscomp$167$$.$executionAction_$($BaseCustomElement$jscomp$1$$, !0);
      });
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.$executionAction_$ = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$) {
    try {
      this.implementation_.executeAction($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$);
    } catch ($e$jscomp$66$$) {
      $rethrowAsync$$module$src$log$$("Action execution failed:", $e$jscomp$66$$, $win$jscomp$167$$.node.tagName, $win$jscomp$167$$.method);
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.$getConsentPolicy_$ = function() {
    var $win$jscomp$167$$ = this.getAttribute("data-block-on-consent");
    if (null === $win$jscomp$167$$) {
      if (($win$jscomp$167$$ = this.getAmpDoc().getMetaByName("amp-consent-blocking")) ? ($win$jscomp$167$$ = $win$jscomp$167$$.toUpperCase().replace(/\s+/g, ""), $win$jscomp$167$$ = $win$jscomp$167$$.split(",").includes(this.tagName)) : $win$jscomp$167$$ = !1, $win$jscomp$167$$) {
        $win$jscomp$167$$ = "default", this.setAttribute("data-block-on-consent", $win$jscomp$167$$);
      } else {
        return null;
      }
    }
    return "" == $win$jscomp$167$$ || "default" == $win$jscomp$167$$ ? this.implementation_.getConsentPolicy() : $win$jscomp$167$$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.getRealChildNodes = function() {
    return $childNodes$$module$src$dom$$(this, function($win$jscomp$167$$) {
      return !$isInternalOrServiceNode$$module$src$custom_element$$($win$jscomp$167$$);
    });
  };
  $BaseCustomElement$jscomp$1$$.prototype.getRealChildren = function() {
    return $childElements$$module$src$dom$$(this, function($win$jscomp$167$$) {
      return !$isInternalOrServiceNode$$module$src$custom_element$$($win$jscomp$167$$);
    });
  };
  $BaseCustomElement$jscomp$1$$.prototype.getPlaceholder = function() {
    return $lastChildElement$$module$src$dom$$(this, function($win$jscomp$167$$) {
      return $win$jscomp$167$$.hasAttribute("placeholder") && !("placeholder" in $win$jscomp$167$$);
    });
  };
  $BaseCustomElement$jscomp$1$$.prototype.togglePlaceholder = function($win$jscomp$167$$) {
    $assertNotTemplate$$module$src$custom_element$$(this);
    if ($win$jscomp$167$$) {
      var $BaseCustomElement$jscomp$1$$ = this.getPlaceholder();
      $BaseCustomElement$jscomp$1$$ && $BaseCustomElement$jscomp$1$$.classList.remove("amp-hidden");
    } else {
      $devAssert$$module$src$log$$(/^[\w-]+$/.test("placeholder"));
      $BaseCustomElement$jscomp$1$$ = (void 0 !== $scopeSelectorSupported$$module$src$css$$ ? $scopeSelectorSupported$$module$src$css$$ : $scopeSelectorSupported$$module$src$css$$ = $testScopeSelector$$module$src$css$$(this)) ? this.querySelectorAll("> [placeholder]".replace(/^|,/g, "$&:scope ")) : $scopedQuerySelectionFallback$$module$src$dom$$(this, "> [placeholder]");
      for (var $htmlElement$jscomp$2$$ = 0; $htmlElement$jscomp$2$$ < $BaseCustomElement$jscomp$1$$.length; $htmlElement$jscomp$2$$++) {
        "placeholder" in $BaseCustomElement$jscomp$1$$[$htmlElement$jscomp$2$$] || $BaseCustomElement$jscomp$1$$[$htmlElement$jscomp$2$$].classList.add("amp-hidden");
      }
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.getFallback = function() {
    return $childElementByAttr$$module$src$dom$$(this, "fallback");
  };
  $BaseCustomElement$jscomp$1$$.prototype.toggleFallback = function($win$jscomp$167$$) {
    $assertNotTemplate$$module$src$custom_element$$(this);
    var $BaseCustomElement$jscomp$1$$ = this.$getResource_$().getState();
    if (!$win$jscomp$167$$ || 0 != $BaseCustomElement$jscomp$1$$ && 1 != $BaseCustomElement$jscomp$1$$ && 2 != $BaseCustomElement$jscomp$1$$) {
      if (this.classList.toggle("amp-notsupported", $win$jscomp$167$$), 1 == $win$jscomp$167$$) {
        var $htmlElement$jscomp$2$$ = this.getFallback();
        $htmlElement$jscomp$2$$ && $getServiceForDoc$$module$src$service$$(this.getAmpDoc(), "owners").scheduleLayout(this, $htmlElement$jscomp$2$$);
      }
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.renderStarted = function() {
    this.$signals_$.signal("render-start");
    this.togglePlaceholder(!1);
    this.toggleLoading(!1);
  };
  $BaseCustomElement$jscomp$1$$.prototype.$isLoadingEnabled_$ = function() {
    if (this.isInA4A()) {
      return !1;
    }
    void 0 === this.$loadingDisabled_$ && (this.$loadingDisabled_$ = this.hasAttribute("noloading"));
    var $win$jscomp$167$$ = 0 < this.$layoutCount_$ || this.$signals_$.get("render-start"), $BaseCustomElement$jscomp$1$$;
    ($BaseCustomElement$jscomp$1$$ = this.$loadingDisabled_$ || $win$jscomp$167$$ && !this.implementation_.isLoadingReused() || 0 >= this.$layoutWidth_$) || ($BaseCustomElement$jscomp$1$$ = this.tagName.toUpperCase(), $BaseCustomElement$jscomp$1$$ = !($LOADING_ELEMENTS_$$module$src$layout$$[$BaseCustomElement$jscomp$1$$] || ("AMP-VIDEO" == $BaseCustomElement$jscomp$1$$ ? 0 : $videoPlayerTagNameRe$$module$src$layout$$.test($BaseCustomElement$jscomp$1$$))));
    return $BaseCustomElement$jscomp$1$$ || $isInternalOrServiceNode$$module$src$custom_element$$(this) || !$isLayoutSizeDefined$$module$src$layout$$(this.layout_) ? !1 : !0;
  };
  $BaseCustomElement$jscomp$1$$.prototype.isInA4A = function() {
    return this.$ampdoc_$ && this.$ampdoc_$.win != this.ownerDocument.defaultView || "inabox" == $getMode$$module$src$mode$$().runtime;
  };
  $BaseCustomElement$jscomp$1$$.prototype.$prepareLoading_$ = function($win$jscomp$167$$) {
    if (this.$isLoadingEnabled_$() && !this.$loadingContainer_$) {
      var $BaseCustomElement$jscomp$1$$ = this.ownerDocument;
      $devAssert$$module$src$log$$($BaseCustomElement$jscomp$1$$);
      $BaseCustomElement$jscomp$1$$ = $htmlFor$$module$src$static_template$$($BaseCustomElement$jscomp$1$$)($_template$$module$src$custom_element$$);
      var $htmlElement$jscomp$2$$ = $createLoaderElement$$module$src$loader$$(this.getAmpDoc(), this, this.$layoutWidth_$, this.$layoutHeight_$, $win$jscomp$167$$);
      $BaseCustomElement$jscomp$1$$.appendChild($htmlElement$jscomp$2$$);
      this.appendChild($BaseCustomElement$jscomp$1$$);
      this.$loadingContainer_$ = $BaseCustomElement$jscomp$1$$;
      this.$loadingElement_$ = $htmlElement$jscomp$2$$;
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.toggleLoading = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$) {
    var $htmlElement$jscomp$2$$ = this, $state$jscomp$21$$ = $BaseCustomElement$jscomp$1$$ && $BaseCustomElement$jscomp$1$$.cleanup, $opt_options$jscomp$91$$ = $BaseCustomElement$jscomp$1$$ && $BaseCustomElement$jscomp$1$$.startTime;
    $assertNotTemplate$$module$src$custom_element$$(this);
    if ($win$jscomp$167$$ !== this.$loadingState_$ || $BaseCustomElement$jscomp$1$$) {
      if ((this.$loadingState_$ = $win$jscomp$167$$) || this.$loadingContainer_$) {
        $win$jscomp$167$$ && !this.$isLoadingEnabled_$() ? this.$loadingState_$ = !1 : this.$mutateOrInvoke_$(function() {
          var $win$jscomp$167$$ = $htmlElement$jscomp$2$$.$loadingState_$;
          $win$jscomp$167$$ && !$htmlElement$jscomp$2$$.$isLoadingEnabled_$() && ($win$jscomp$167$$ = !1);
          $win$jscomp$167$$ && $htmlElement$jscomp$2$$.$prepareLoading_$($opt_options$jscomp$91$$);
          if ($htmlElement$jscomp$2$$.$loadingContainer_$ && ($htmlElement$jscomp$2$$.$loadingContainer_$.classList.toggle("amp-hidden", !$win$jscomp$167$$), $htmlElement$jscomp$2$$.$loadingElement_$.classList.toggle("amp-active", $win$jscomp$167$$), !$win$jscomp$167$$ && $state$jscomp$21$$ && !$htmlElement$jscomp$2$$.implementation_.isLoadingReused())) {
            var $BaseCustomElement$jscomp$1$$ = $htmlElement$jscomp$2$$.$loadingContainer_$;
            $htmlElement$jscomp$2$$.$loadingContainer_$ = null;
            $htmlElement$jscomp$2$$.$loadingElement_$ = null;
            $htmlElement$jscomp$2$$.$mutateOrInvoke_$(function() {
              $removeElement$$module$src$dom$$($BaseCustomElement$jscomp$1$$);
            }, void 0, !0);
          }
        }, void 0, !0);
      }
    }
  };
  $BaseCustomElement$jscomp$1$$.prototype.$getLayoutDelayMeter_$ = function() {
    this.$layoutDelayMeter_$ || (this.$layoutDelayMeter_$ = new $LayoutDelayMeter$$module$src$layout_delay_meter$$(this.ownerDocument.defaultView, this.getLayoutPriority()));
    return this.$layoutDelayMeter_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.getOverflowElement = function() {
    void 0 === this.$overflowElement_$ && (this.$overflowElement_$ = $childElementByAttr$$module$src$dom$$(this, "overflow")) && (this.$overflowElement_$.hasAttribute("tabindex") || this.$overflowElement_$.setAttribute("tabindex", "0"), this.$overflowElement_$.hasAttribute("role") || this.$overflowElement_$.setAttribute("role", "button"));
    return this.$overflowElement_$;
  };
  $BaseCustomElement$jscomp$1$$.prototype.overflowCallback = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$) {
    var $overflown$jscomp$1$$ = this;
    this.getOverflowElement();
    this.$overflowElement_$ ? (this.$overflowElement_$.classList.toggle("amp-visible", $win$jscomp$167$$), this.$overflowElement_$.onclick = $win$jscomp$167$$ ? function() {
      var $win$jscomp$167$$ = $Services$$module$src$services$mutatorForDoc$$($overflown$jscomp$1$$.getAmpDoc());
      $win$jscomp$167$$.forceChangeSize($overflown$jscomp$1$$, $BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$);
      $win$jscomp$167$$.mutateElement($overflown$jscomp$1$$, function() {
        $overflown$jscomp$1$$.overflowCallback(!1, $BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$);
      });
    } : null) : $win$jscomp$167$$ && this.warnOnMissingOverflow && $user$$module$src$log$$().warn("CustomElement", "Cannot resize element and overflow is not available", this);
  };
  $BaseCustomElement$jscomp$1$$.prototype.$mutateOrInvoke_$ = function($win$jscomp$167$$, $BaseCustomElement$jscomp$1$$, $htmlElement$jscomp$2$$) {
    $htmlElement$jscomp$2$$ = void 0 === $htmlElement$jscomp$2$$ ? !1 : $htmlElement$jscomp$2$$;
    this.$ampdoc_$ ? $Services$$module$src$services$mutatorForDoc$$(this.getAmpDoc()).mutateElement($BaseCustomElement$jscomp$1$$ || this, $win$jscomp$167$$, $htmlElement$jscomp$2$$) : $win$jscomp$167$$();
  };
  $win$jscomp$167$$.__AMP_BASE_CE_CLASS = $BaseCustomElement$jscomp$1$$;
  return $win$jscomp$167$$.__AMP_BASE_CE_CLASS;
}
function $assertNotTemplate$$module$src$custom_element$$($element$jscomp$138$$) {
  $devAssert$$module$src$log$$(!$element$jscomp$138$$.$isInTemplate_$);
}
function $isInternalOrServiceNode$$module$src$custom_element$$($node$jscomp$24$$) {
  var $JSCompiler_tagName$jscomp$inline_559$$ = "string" == typeof $node$jscomp$24$$ ? $node$jscomp$24$$ : $node$jscomp$24$$.tagName;
  return $JSCompiler_tagName$jscomp$inline_559$$ && $startsWith$$module$src$string$$($JSCompiler_tagName$jscomp$inline_559$$.toLowerCase(), "i-") || $node$jscomp$24$$.tagName && ($node$jscomp$24$$.hasAttribute("placeholder") || $node$jscomp$24$$.hasAttribute("fallback") || $node$jscomp$24$$.hasAttribute("overflow")) ? !0 : !1;
}
;function $getExtendedElements$$module$src$service$custom_element_registry$$($win$jscomp$169$$) {
  $win$jscomp$169$$.__AMP_EXTENDED_ELEMENTS || ($win$jscomp$169$$.__AMP_EXTENDED_ELEMENTS = {});
  return $win$jscomp$169$$.__AMP_EXTENDED_ELEMENTS;
}
function $tryUpgradeElement_$$module$src$service$custom_element_registry$$($element$jscomp$140$$, $toClass$jscomp$1$$) {
  try {
    $element$jscomp$140$$.upgrade($toClass$jscomp$1$$);
  } catch ($e$jscomp$67$$) {
    $reportError$$module$src$error$$($e$jscomp$67$$, $element$jscomp$140$$);
  }
}
function $stubElementsForDoc$$module$src$service$custom_element_registry$$($ampdoc$jscomp$54$$) {
  $extensionScriptsInNode$$module$src$element_service$$($ampdoc$jscomp$54$$.getHeadNode()).forEach(function($name$jscomp$117$$) {
    $ampdoc$jscomp$54$$.declareExtension($name$jscomp$117$$);
    $stubElementIfNotKnown$$module$src$service$custom_element_registry$$($ampdoc$jscomp$54$$.win, $name$jscomp$117$$);
  });
}
function $stubElementIfNotKnown$$module$src$service$custom_element_registry$$($win$jscomp$171$$, $name$jscomp$118$$) {
  $getExtendedElements$$module$src$service$custom_element_registry$$($win$jscomp$171$$)[$name$jscomp$118$$] || $registerElement$$module$src$service$custom_element_registry$$($win$jscomp$171$$, $name$jscomp$118$$, $ElementStub$$module$src$element_stub$$);
}
function $registerElement$$module$src$service$custom_element_registry$$($win$jscomp$172$$, $name$jscomp$120$$, $implementationClass$$) {
  $getExtendedElements$$module$src$service$custom_element_registry$$($win$jscomp$172$$)[$name$jscomp$120$$] = $implementationClass$$;
  var $klass$jscomp$1$$ = $createCustomElementClass$$module$src$custom_element$$($win$jscomp$172$$);
  $win$jscomp$172$$.customElements.define($name$jscomp$120$$, $klass$jscomp$1$$);
}
;var $ATTRIBUTES_TO_PROPAGATE$$module$builtins$amp_img$$ = "alt aria-describedby aria-label aria-labelledby referrerpolicy sizes src srcset title".split(" ");
function $AmpImg$$module$builtins$amp_img$$($element$jscomp$141$$) {
  $BaseElement$$module$src$base_element$$.call(this, $element$jscomp$141$$);
  this.$prerenderAllowed_$ = this.$allowImgLoadFallback_$ = !0;
  this.$unlistenError_$ = this.$unlistenLoad_$ = this.$img_$ = null;
  this.$sizesWidth_$ = 0;
}
$$jscomp$inherits$$($AmpImg$$module$builtins$amp_img$$, $BaseElement$$module$src$base_element$$);
$JSCompiler_prototypeAlias$$ = $AmpImg$$module$builtins$amp_img$$.prototype;
$JSCompiler_prototypeAlias$$.mutatedAttributesCallback = function($mutations$jscomp$2$$) {
  if (this.$img_$) {
    var $attrs$$ = $ATTRIBUTES_TO_PROPAGATE$$module$builtins$amp_img$$.filter(function($attrs$$) {
      return void 0 !== $mutations$jscomp$2$$[$attrs$$];
    });
    $mutations$jscomp$2$$.src && !$mutations$jscomp$2$$.srcset && this.element.hasAttribute("srcset") && (this.element.removeAttribute("srcset"), $attrs$$.push("srcset"), this.user().warn("amp-img", "Removed [srcset] since [src] was mutated. Recommend adding a [srcset] binding to support responsive images.", this.element));
    this.propagateAttributes($attrs$$, this.$img_$, !0);
    this.propagateDataset(this.$img_$);
    $guaranteeSrcForSrcsetUnsupportedBrowsers$$module$src$utils$img$$(this.$img_$);
  }
};
$JSCompiler_prototypeAlias$$.onMeasureChanged = function() {
  $JSCompiler_StaticMethods_maybeGenerateSizes_$$(this, !1);
};
$JSCompiler_prototypeAlias$$.preconnectCallback = function($onLayout$jscomp$1$$) {
  var $src$jscomp$5_srcset$jscomp$1_srcseturl$jscomp$1$$ = this.element.getAttribute("src");
  $src$jscomp$5_srcset$jscomp$1_srcseturl$jscomp$1$$ ? $getService$$module$src$service$$(this.win, "preconnect").url(this.getAmpDoc(), $src$jscomp$5_srcset$jscomp$1_srcseturl$jscomp$1$$, $onLayout$jscomp$1$$) : ($src$jscomp$5_srcset$jscomp$1_srcseturl$jscomp$1$$ = this.element.getAttribute("srcset")) && ($src$jscomp$5_srcset$jscomp$1_srcseturl$jscomp$1$$ = /\S+/.exec($src$jscomp$5_srcset$jscomp$1_srcseturl$jscomp$1$$)) && $getService$$module$src$service$$(this.win, "preconnect").url(this.getAmpDoc(), 
  $src$jscomp$5_srcset$jscomp$1_srcseturl$jscomp$1$$[0], $onLayout$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.firstAttachedCallback = function() {
  this.element.hasAttribute("noprerender") && (this.$prerenderAllowed_$ = !1);
};
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$5$$) {
  return $isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$5$$);
};
$JSCompiler_prototypeAlias$$.$initialize_$ = function() {
  if (!this.$img_$) {
    this.$allowImgLoadFallback_$ = !this.element.hasAttribute("fallback");
    this.element.hasAttribute("i-amphtml-ssr") && (this.$img_$ = this.element.querySelector("img"));
    this.$img_$ = this.$img_$ || new Image;
    this.$img_$.setAttribute("decoding", "async");
    this.element.id && this.$img_$.setAttribute("amp-img-id", this.element.id);
    "img" == this.element.getAttribute("role") && (this.element.removeAttribute("role"), this.user().error("amp-img", "Setting role=img on amp-img elements breaks screen readers please just set alt or ARIA attributes, they will be correctly propagated for the underlying <img> element."));
    $JSCompiler_StaticMethods_maybeGenerateSizes_$$(this, !0);
    this.propagateAttributes($ATTRIBUTES_TO_PROPAGATE$$module$builtins$amp_img$$, this.$img_$);
    this.propagateDataset(this.$img_$);
    $guaranteeSrcForSrcsetUnsupportedBrowsers$$module$src$utils$img$$(this.$img_$);
    this.applyFillContent(this.$img_$, !0);
    var $JSCompiler_fromEl$jscomp$inline_561$$ = this.element, $JSCompiler_toEl$jscomp$inline_562$$ = this.$img_$;
    $JSCompiler_fromEl$jscomp$inline_561$$.hasAttribute("object-fit") && $setStyle$$module$src$style$$($JSCompiler_toEl$jscomp$inline_562$$, "object-fit", $JSCompiler_fromEl$jscomp$inline_561$$.getAttribute("object-fit"));
    $JSCompiler_fromEl$jscomp$inline_561$$.hasAttribute("object-position") && $setStyle$$module$src$style$$($JSCompiler_toEl$jscomp$inline_562$$, "object-position", $JSCompiler_fromEl$jscomp$inline_561$$.getAttribute("object-position"));
    this.element.appendChild(this.$img_$);
  }
};
function $JSCompiler_StaticMethods_maybeGenerateSizes_$$($JSCompiler_StaticMethods_maybeGenerateSizes_$self$$, $sync$jscomp$5$$) {
  if ($JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.$img_$ && !$JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.element.getAttribute("sizes")) {
    var $srcset$jscomp$2_width$jscomp$29$$ = $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.element.getAttribute("srcset");
    if ($srcset$jscomp$2_width$jscomp$29$$ && !/[0-9]+x(?:,|$)/.test($srcset$jscomp$2_width$jscomp$29$$) && ($srcset$jscomp$2_width$jscomp$29$$ = $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.element.getLayoutWidth(), $JSCompiler_StaticMethods_shouldSetSizes_$$($JSCompiler_StaticMethods_maybeGenerateSizes_$self$$, $srcset$jscomp$2_width$jscomp$29$$))) {
      var $viewportWidth$$ = $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.getViewport().getWidth(), $entry$jscomp$3$$ = "(max-width: " + $viewportWidth$$ + "px) " + $srcset$jscomp$2_width$jscomp$29$$ + "px, ", $defaultSize$$ = $srcset$jscomp$2_width$jscomp$29$$ + "px";
      "fixed" !== $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.getLayout() && ($defaultSize$$ = Math.max(Math.round(100 * $srcset$jscomp$2_width$jscomp$29$$ / $viewportWidth$$), 100) + "vw");
      var $generatedSizes$$ = $entry$jscomp$3$$ + $defaultSize$$;
      $sync$jscomp$5$$ ? $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.$img_$.setAttribute("sizes", $generatedSizes$$) : $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.mutateElement(function() {
        $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.$img_$.setAttribute("sizes", $generatedSizes$$);
      });
      $JSCompiler_StaticMethods_maybeGenerateSizes_$self$$.$sizesWidth_$ = $srcset$jscomp$2_width$jscomp$29$$;
    }
  }
}
function $JSCompiler_StaticMethods_shouldSetSizes_$$($JSCompiler_StaticMethods_shouldSetSizes_$self$$, $newWidth$jscomp$3$$) {
  return $JSCompiler_StaticMethods_shouldSetSizes_$self$$.$img_$.hasAttribute("sizes") ? $newWidth$jscomp$3$$ > $JSCompiler_StaticMethods_shouldSetSizes_$self$$.$sizesWidth_$ : !0;
}
$JSCompiler_prototypeAlias$$.prerenderAllowed = function() {
  return this.$prerenderAllowed_$;
};
$JSCompiler_prototypeAlias$$.reconstructWhenReparented = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $$jscomp$this$jscomp$81$$ = this;
  this.$initialize_$();
  var $img$jscomp$3$$ = this.$img_$;
  this.$unlistenLoad_$ = $listen$$module$src$event_helper$$($img$jscomp$3$$, "load", function() {
    return $JSCompiler_StaticMethods_hideFallbackImg_$$($$jscomp$this$jscomp$81$$);
  });
  this.$unlistenError_$ = $listen$$module$src$event_helper$$($img$jscomp$3$$, "error", function() {
    return $JSCompiler_StaticMethods_onImgLoadingError_$$($$jscomp$this$jscomp$81$$);
  });
  return 0 >= this.element.getLayoutWidth() ? $resolvedPromise$$module$src$resolved_promise$$() : this.loadPromise($img$jscomp$3$$);
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  this.$unlistenError_$ && (this.$unlistenError_$(), this.$unlistenError_$ = null);
  this.$unlistenLoad_$ && (this.$unlistenLoad_$(), this.$unlistenLoad_$ = null);
  var $img$jscomp$4$$ = this.$img_$;
  $img$jscomp$4$$ && !$img$jscomp$4$$.complete && ($img$jscomp$4$$.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=", $removeElement$$module$src$dom$$($img$jscomp$4$$), this.$img_$ = null);
  return !0;
};
$JSCompiler_prototypeAlias$$.firstLayoutCompleted = function() {
  var $placeholder$jscomp$2$$ = this.getPlaceholder();
  $placeholder$jscomp$2$$ && $placeholder$jscomp$2$$.classList.contains("i-amphtml-blurry-placeholder") && $isExperimentOn$$module$src$experiments$$(this.win, "blurry-placeholder") ? $setImportantStyles$$module$src$style$$($placeholder$jscomp$2$$, {opacity:0}) : this.togglePlaceholder(!1);
};
function $JSCompiler_StaticMethods_hideFallbackImg_$$($JSCompiler_StaticMethods_hideFallbackImg_$self$$) {
  !$JSCompiler_StaticMethods_hideFallbackImg_$self$$.$allowImgLoadFallback_$ && $JSCompiler_StaticMethods_hideFallbackImg_$self$$.$img_$.classList.contains("i-amphtml-ghost") && $JSCompiler_StaticMethods_hideFallbackImg_$self$$.getVsync().mutate(function() {
    $JSCompiler_StaticMethods_hideFallbackImg_$self$$.$img_$.classList.remove("i-amphtml-ghost");
    $JSCompiler_StaticMethods_hideFallbackImg_$self$$.toggleFallback(!1);
  });
}
function $JSCompiler_StaticMethods_onImgLoadingError_$$($JSCompiler_StaticMethods_onImgLoadingError_$self$$) {
  $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$allowImgLoadFallback_$ && ($JSCompiler_StaticMethods_onImgLoadingError_$self$$.getVsync().mutate(function() {
    $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$img_$.classList.add("i-amphtml-ghost");
    $JSCompiler_StaticMethods_onImgLoadingError_$self$$.toggleFallback(!0);
    $JSCompiler_StaticMethods_onImgLoadingError_$self$$.togglePlaceholder(!1);
  }), $JSCompiler_StaticMethods_onImgLoadingError_$self$$.$allowImgLoadFallback_$ = !1);
}
;function $Input$$module$src$input$$($win$jscomp$177$$) {
  this.win = $win$jscomp$177$$;
  this.$boundOnKeyDown_$ = this.$onKeyDown_$.bind(this);
  this.$boundOnMouseDown_$ = this.$onMouseDown_$.bind(this);
  this.$boundMouseConfirmed_$ = this.$boundMouseCanceled_$ = this.$boundOnMouseMove_$ = null;
  this.$hasTouch_$ = "ontouchstart" in $win$jscomp$177$$ || void 0 !== $win$jscomp$177$$.navigator.maxTouchPoints && 0 < $win$jscomp$177$$.navigator.maxTouchPoints || void 0 !== $win$jscomp$177$$.DocumentTouch;
  this.$keyboardActive_$ = !1;
  this.win.document.addEventListener("keydown", this.$boundOnKeyDown_$);
  this.win.document.addEventListener("mousedown", this.$boundOnMouseDown_$);
  this.$hasMouse_$ = !0;
  this.$mouseConfirmAttemptCount_$ = 0;
  this.$touchDetectedObservable_$ = new $Observable$$module$src$observable$$;
  this.$mouseDetectedObservable_$ = new $Observable$$module$src$observable$$;
  this.$keyboardStateObservable_$ = new $Observable$$module$src$observable$$;
  this.$hasTouch_$ && (this.$hasMouse_$ = !this.$hasTouch_$, this.$boundOnMouseMove_$ = this.$onMouseMove_$.bind(this), $listenOnce$$module$src$event_helper$$($win$jscomp$177$$.document, "mousemove", this.$boundOnMouseMove_$));
}
$JSCompiler_prototypeAlias$$ = $Input$$module$src$input$$.prototype;
$JSCompiler_prototypeAlias$$.setupInputModeClasses = function($ampdoc$jscomp$55$$) {
  var $$jscomp$this$jscomp$84$$ = this;
  this.onTouchDetected(function($detected$$) {
    $JSCompiler_StaticMethods_toggleInputClass_$$($$jscomp$this$jscomp$84$$, $ampdoc$jscomp$55$$, "amp-mode-touch", $detected$$);
  }, !0);
  this.onMouseDetected(function($detected$jscomp$1$$) {
    $JSCompiler_StaticMethods_toggleInputClass_$$($$jscomp$this$jscomp$84$$, $ampdoc$jscomp$55$$, "amp-mode-mouse", $detected$jscomp$1$$);
  }, !0);
  this.onKeyboardStateChanged(function($active$$) {
    $JSCompiler_StaticMethods_toggleInputClass_$$($$jscomp$this$jscomp$84$$, $ampdoc$jscomp$55$$, "amp-mode-keyboard-active", $active$$);
  }, !0);
};
$JSCompiler_prototypeAlias$$.isTouchDetected = function() {
  return this.$hasTouch_$;
};
$JSCompiler_prototypeAlias$$.onTouchDetected = function($handler$jscomp$16$$, $opt_fireImmediately$$) {
  $opt_fireImmediately$$ && $handler$jscomp$16$$(this.isTouchDetected());
  return this.$touchDetectedObservable_$.add($handler$jscomp$16$$);
};
$JSCompiler_prototypeAlias$$.isMouseDetected = function() {
  return this.$hasMouse_$;
};
$JSCompiler_prototypeAlias$$.onMouseDetected = function($handler$jscomp$17$$, $opt_fireImmediately$jscomp$1$$) {
  $opt_fireImmediately$jscomp$1$$ && $handler$jscomp$17$$(this.isMouseDetected());
  return this.$mouseDetectedObservable_$.add($handler$jscomp$17$$);
};
$JSCompiler_prototypeAlias$$.isKeyboardActive = function() {
  return this.$keyboardActive_$;
};
$JSCompiler_prototypeAlias$$.onKeyboardStateChanged = function($handler$jscomp$18$$, $opt_fireImmediately$jscomp$2$$) {
  $opt_fireImmediately$jscomp$2$$ && $handler$jscomp$18$$(this.isKeyboardActive());
  return this.$keyboardStateObservable_$.add($handler$jscomp$18$$);
};
function $JSCompiler_StaticMethods_toggleInputClass_$$($JSCompiler_StaticMethods_toggleInputClass_$self$$, $ampdoc$jscomp$56$$, $clazz$$, $on$jscomp$3$$) {
  $ampdoc$jscomp$56$$.waitForBodyOpen().then(function($ampdoc$jscomp$56$$) {
    $Services$$module$src$services$vsyncFor$$($JSCompiler_StaticMethods_toggleInputClass_$self$$.win).mutate(function() {
      $ampdoc$jscomp$56$$.classList.toggle($clazz$$, $on$jscomp$3$$);
    });
  });
}
$JSCompiler_prototypeAlias$$.$onKeyDown_$ = function($e$jscomp$68_target$jscomp$125$$) {
  this.$keyboardActive_$ || $e$jscomp$68_target$jscomp$125$$.defaultPrevented || ($e$jscomp$68_target$jscomp$125$$ = $e$jscomp$68_target$jscomp$125$$.target, $e$jscomp$68_target$jscomp$125$$ && ("INPUT" == $e$jscomp$68_target$jscomp$125$$.tagName || "TEXTAREA" == $e$jscomp$68_target$jscomp$125$$.tagName || "SELECT" == $e$jscomp$68_target$jscomp$125$$.tagName || "OPTION" == $e$jscomp$68_target$jscomp$125$$.tagName || $e$jscomp$68_target$jscomp$125$$.hasAttribute("contenteditable"))) || (this.$keyboardActive_$ = 
  !0, this.$keyboardStateObservable_$.fire(!0));
};
$JSCompiler_prototypeAlias$$.$onMouseDown_$ = function() {
  this.$keyboardActive_$ && (this.$keyboardActive_$ = !1, this.$keyboardStateObservable_$.fire(!1));
};
$JSCompiler_prototypeAlias$$.$onMouseMove_$ = function($e$jscomp$69$$) {
  var $$jscomp$this$jscomp$86$$ = this;
  if ($e$jscomp$69$$.sourceCapabilities && $e$jscomp$69$$.sourceCapabilities.firesTouchEvents) {
    this.$mouseCanceled_$();
  } else {
    this.$boundMouseConfirmed_$ || (this.$boundMouseConfirmed_$ = this.$mouseConfirmed_$.bind(this), this.$boundMouseCanceled_$ = this.$mouseCanceled_$.bind(this));
    var $unlisten$jscomp$5$$, $listenPromise$$ = $listenOncePromise$$module$src$event_helper$$(this.win.document, function($e$jscomp$69$$) {
      $unlisten$jscomp$5$$ = $e$jscomp$69$$;
    });
    return $Services$$module$src$services$timerFor$$(this.win).timeoutPromise(300, $listenPromise$$).then(this.$boundMouseCanceled_$, function() {
      $unlisten$jscomp$5$$ && $unlisten$jscomp$5$$();
      $$jscomp$this$jscomp$86$$.$boundMouseConfirmed_$();
    });
  }
};
$JSCompiler_prototypeAlias$$.$mouseConfirmed_$ = function() {
  this.$hasMouse_$ = !0;
  this.$mouseDetectedObservable_$.fire(!0);
};
$JSCompiler_prototypeAlias$$.$mouseCanceled_$ = function() {
  this.$mouseConfirmAttemptCount_$++;
  3 >= this.$mouseConfirmAttemptCount_$ && $listenOnce$$module$src$event_helper$$(this.win.document, "mousemove", this.$boundOnMouseMove_$);
};
function $AmpLayout$$module$builtins$amp_layout$$() {
  $BaseElement$$module$src$base_element$$.apply(this, arguments);
}
$$jscomp$inherits$$($AmpLayout$$module$builtins$amp_layout$$, $BaseElement$$module$src$base_element$$);
$AmpLayout$$module$builtins$amp_layout$$.prototype.isLayoutSupported = function($layout$jscomp$6$$) {
  return "container" == $layout$jscomp$6$$ || $isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$6$$);
};
$AmpLayout$$module$builtins$amp_layout$$.prototype.buildCallback = function() {
  if ("container" != this.getLayout()) {
    var $container$jscomp$6$$ = this.win.document.createElement("div");
    this.applyFillContent($container$jscomp$6$$);
    this.getRealChildNodes().forEach(function($child$jscomp$8$$) {
      $container$jscomp$6$$.appendChild($child$jscomp$8$$);
    });
    this.element.appendChild($container$jscomp$6$$);
  }
};
$AmpLayout$$module$builtins$amp_layout$$.prototype.prerenderAllowed = function() {
  return !0;
};
function $FocusHistory$$module$src$focus_history$$($win$jscomp$180$$) {
  var $$jscomp$this$jscomp$87$$ = this;
  this.win = $win$jscomp$180$$;
  this.$purgeTimeout_$ = 6E4;
  this.$history_$ = [];
  this.$observeFocus_$ = new $Observable$$module$src$observable$$;
  this.$captureFocus_$ = function($win$jscomp$180$$) {
    $win$jscomp$180$$.target && 1 == $win$jscomp$180$$.target.nodeType && $JSCompiler_StaticMethods_pushFocus_$$($$jscomp$this$jscomp$87$$, $win$jscomp$180$$.target);
  };
  this.$captureBlur_$ = function() {
    $Services$$module$src$services$timerFor$$($win$jscomp$180$$).delay(function() {
      $JSCompiler_StaticMethods_pushFocus_$$($$jscomp$this$jscomp$87$$, $$jscomp$this$jscomp$87$$.win.document.activeElement);
    }, 500);
  };
  this.win.document.addEventListener("focus", this.$captureFocus_$, !0);
  this.win.addEventListener("blur", this.$captureBlur_$);
}
$JSCompiler_prototypeAlias$$ = $FocusHistory$$module$src$focus_history$$.prototype;
$JSCompiler_prototypeAlias$$.$cleanup_$ = function() {
  this.win.document.removeEventListener("focus", this.$captureFocus_$, !0);
  this.win.removeEventListener("blur", this.$captureBlur_$);
};
$JSCompiler_prototypeAlias$$.onFocus = function($handler$jscomp$19$$) {
  return this.$observeFocus_$.add($handler$jscomp$19$$);
};
function $JSCompiler_StaticMethods_pushFocus_$$($JSCompiler_StaticMethods_pushFocus_$self$$, $element$jscomp$142$$) {
  var $now$jscomp$2$$ = Date.now();
  0 == $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length || $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$[$JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length - 1].el != $element$jscomp$142$$ ? $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.push({el:$element$jscomp$142$$, time:$now$jscomp$2$$}) : $JSCompiler_StaticMethods_pushFocus_$self$$.$history_$[$JSCompiler_StaticMethods_pushFocus_$self$$.$history_$.length - 1].time = $now$jscomp$2$$;
  $JSCompiler_StaticMethods_pushFocus_$self$$.purgeBefore($now$jscomp$2$$ - $JSCompiler_StaticMethods_pushFocus_$self$$.$purgeTimeout_$);
  $JSCompiler_StaticMethods_pushFocus_$self$$.$observeFocus_$.fire($element$jscomp$142$$);
}
$JSCompiler_prototypeAlias$$.getLast = function() {
  return 0 == this.$history_$.length ? null : this.$history_$[this.$history_$.length - 1].el;
};
$JSCompiler_prototypeAlias$$.purgeBefore = function($time$jscomp$3$$) {
  for (var $index$jscomp$85$$ = this.$history_$.length - 1, $i$jscomp$77$$ = 0; $i$jscomp$77$$ < this.$history_$.length; $i$jscomp$77$$++) {
    if (this.$history_$[$i$jscomp$77$$].time >= $time$jscomp$3$$) {
      $index$jscomp$85$$ = $i$jscomp$77$$ - 1;
      break;
    }
  }
  -1 != $index$jscomp$85$$ && this.$history_$.splice(0, $index$jscomp$85$$ + 1);
};
$JSCompiler_prototypeAlias$$.hasDescendantsOf = function($element$jscomp$143$$) {
  this.win.document.activeElement && $JSCompiler_StaticMethods_pushFocus_$$(this, this.win.document.activeElement);
  for (var $i$jscomp$78$$ = 0; $i$jscomp$78$$ < this.$history_$.length; $i$jscomp$78$$++) {
    if ($element$jscomp$143$$.contains(this.$history_$[$i$jscomp$78$$].el)) {
      return !0;
    }
  }
  return !1;
};
function $MutatorImpl$$module$src$service$mutator_impl$$($ampdoc$jscomp$57$$) {
  var $$jscomp$this$jscomp$88$$ = this;
  this.ampdoc = $ampdoc$jscomp$57$$;
  this.win = $ampdoc$jscomp$57$$.win;
  this.$resources_$ = $Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$57$$);
  this.$viewport_$ = $Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$vsync_$ = $Services$$module$src$services$vsyncFor$$(this.win);
  this.$activeHistory_$ = new $FocusHistory$$module$src$focus_history$$(this.win);
  this.$activeHistory_$.onFocus(function($ampdoc$jscomp$57$$) {
    $JSCompiler_StaticMethods_checkPendingChangeSize_$$($$jscomp$this$jscomp$88$$, $ampdoc$jscomp$57$$);
  });
  this.$intersect_$ = this.$resources_$.isIntersectionExperimentOn();
}
$JSCompiler_prototypeAlias$$ = $MutatorImpl$$module$src$service$mutator_impl$$.prototype;
$JSCompiler_prototypeAlias$$.forceChangeSize = function($element$jscomp$152$$, $newHeight$jscomp$7$$, $newWidth$jscomp$6$$, $opt_callback$jscomp$6$$, $opt_newMargins$jscomp$4$$) {
  $JSCompiler_StaticMethods_scheduleChangeSize_$$(this, $Resource$$module$src$service$resource$forElement$$($element$jscomp$152$$), $newHeight$jscomp$7$$, $newWidth$jscomp$6$$, $opt_newMargins$jscomp$4$$, void 0, !0, $opt_callback$jscomp$6$$);
};
$JSCompiler_prototypeAlias$$.requestChangeSize = function($element$jscomp$153$$, $newHeight$jscomp$8$$, $newWidth$jscomp$7$$, $opt_newMargins$jscomp$5$$, $opt_event$jscomp$3$$) {
  var $$jscomp$this$jscomp$89$$ = this;
  return new Promise(function($resolve$jscomp$27$$, $reject$jscomp$17$$) {
    $JSCompiler_StaticMethods_scheduleChangeSize_$$($$jscomp$this$jscomp$89$$, $Resource$$module$src$service$resource$forElement$$($element$jscomp$153$$), $newHeight$jscomp$8$$, $newWidth$jscomp$7$$, $opt_newMargins$jscomp$5$$, $opt_event$jscomp$3$$, !1, function($element$jscomp$153$$) {
      $element$jscomp$153$$ ? $resolve$jscomp$27$$() : $reject$jscomp$17$$(Error("changeSize attempt denied"));
    });
  });
};
$JSCompiler_prototypeAlias$$.expandElement = function($element$jscomp$154$$) {
  var $resource$$ = $Resource$$module$src$service$resource$forElement$$($element$jscomp$154$$);
  $resource$$.completeExpand();
  var $owner$jscomp$6$$ = $resource$$.getOwner();
  $owner$jscomp$6$$ && $owner$jscomp$6$$.expandedCallback($element$jscomp$154$$);
  this.$resources_$.schedulePass(70);
};
$JSCompiler_prototypeAlias$$.attemptCollapse = function($element$jscomp$155$$) {
  var $$jscomp$this$jscomp$90$$ = this;
  return new Promise(function($resolve$jscomp$28$$, $reject$jscomp$18$$) {
    $JSCompiler_StaticMethods_scheduleChangeSize_$$($$jscomp$this$jscomp$90$$, $Resource$$module$src$service$resource$forElement$$($element$jscomp$155$$), 0, 0, void 0, void 0, !1, function($$jscomp$this$jscomp$90$$) {
      $$jscomp$this$jscomp$90$$ ? ($Resource$$module$src$service$resource$forElement$$($element$jscomp$155$$).completeCollapse(), $resolve$jscomp$28$$()) : $reject$jscomp$18$$($dev$$module$src$log$$().createExpectedError("collapse attempt denied"));
    });
  });
};
$JSCompiler_prototypeAlias$$.collapseElement = function($element$jscomp$156$$) {
  if (!this.$intersect_$) {
    var $box$jscomp$4$$ = this.$viewport_$.getLayoutRect($element$jscomp$156$$);
    0 != $box$jscomp$4$$.width && 0 != $box$jscomp$4$$.height && ($isExperimentOn$$module$src$experiments$$(this.win, "dirty-collapse-element") ? this.dirtyElement($element$jscomp$156$$) : this.$resources_$.setRelayoutTop($box$jscomp$4$$.top));
  }
  $Resource$$module$src$service$resource$forElement$$($element$jscomp$156$$).completeCollapse();
  this.$intersect_$ || this.$resources_$.schedulePass(70);
};
$JSCompiler_prototypeAlias$$.measureElement = function($measurer$jscomp$4$$) {
  return this.$vsync_$.measurePromise($measurer$jscomp$4$$);
};
$JSCompiler_prototypeAlias$$.mutateElement = function($element$jscomp$157$$, $mutator$jscomp$8$$, $skipRemeasure$jscomp$1$$) {
  return $JSCompiler_StaticMethods_measureMutateElementResources_$$(this, $element$jscomp$157$$, null, $mutator$jscomp$8$$, $skipRemeasure$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.measureMutateElement = function($element$jscomp$158$$, $measurer$jscomp$5$$, $mutator$jscomp$9$$) {
  return $JSCompiler_StaticMethods_measureMutateElementResources_$$(this, $element$jscomp$158$$, $measurer$jscomp$5$$, $mutator$jscomp$9$$);
};
function $JSCompiler_StaticMethods_measureMutateElementResources_$$($JSCompiler_StaticMethods_measureMutateElementResources_$self$$, $element$jscomp$159$$, $measurer$jscomp$6$$, $mutator$jscomp$10$$, $skipRemeasure$jscomp$2$$) {
  function $calcRelayoutTop$$() {
    var $measurer$jscomp$6$$ = $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$viewport_$.getLayoutRect($element$jscomp$159$$);
    return 0 != $measurer$jscomp$6$$.width && 0 != $measurer$jscomp$6$$.height ? $measurer$jscomp$6$$.top : -1;
  }
  $skipRemeasure$jscomp$2$$ = void 0 === $skipRemeasure$jscomp$2$$ ? !1 : $skipRemeasure$jscomp$2$$;
  var $relayoutTop$$ = -1;
  return $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$vsync_$.runPromise({measure:function() {
    $measurer$jscomp$6$$ && $measurer$jscomp$6$$();
    $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$intersect_$ || $skipRemeasure$jscomp$2$$ || ($relayoutTop$$ = $calcRelayoutTop$$());
  }, mutate:function() {
    $mutator$jscomp$10$$();
    if (!$skipRemeasure$jscomp$2$$) {
      $element$jscomp$159$$.classList.contains("i-amphtml-element") && $Resource$$module$src$service$resource$forElement$$($element$jscomp$159$$).requestMeasure();
      for (var $measurer$jscomp$6$$ = $element$jscomp$159$$.getElementsByClassName("i-amphtml-element"), $i$jscomp$79$$ = 0; $i$jscomp$79$$ < $measurer$jscomp$6$$.length; $i$jscomp$79$$++) {
        $Resource$$module$src$service$resource$forElement$$($measurer$jscomp$6$$[$i$jscomp$79$$]).requestMeasure();
      }
      $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$resources_$.schedulePass(70);
      $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$intersect_$ ? $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$resources_$.maybeHeightChanged() : (-1 != $relayoutTop$$ && $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$resources_$.setRelayoutTop($relayoutTop$$), $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$vsync_$.measure(function() {
        var $element$jscomp$159$$ = $calcRelayoutTop$$();
        -1 != $element$jscomp$159$$ && $element$jscomp$159$$ != $relayoutTop$$ && ($JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$resources_$.setRelayoutTop($element$jscomp$159$$), $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$resources_$.schedulePass(70));
        $JSCompiler_StaticMethods_measureMutateElementResources_$self$$.$resources_$.maybeHeightChanged();
      }));
    }
  }});
}
$JSCompiler_prototypeAlias$$.dirtyElement = function($element$jscomp$160_r$jscomp$4$$) {
  $devAssert$$module$src$log$$(!this.$intersect_$);
  var $relayoutAll$$ = !1;
  $element$jscomp$160_r$jscomp$4$$.classList.contains("i-amphtml-element") ? ($element$jscomp$160_r$jscomp$4$$ = $Resource$$module$src$service$resource$forElement$$($element$jscomp$160_r$jscomp$4$$), this.$resources_$.setRelayoutTop($element$jscomp$160_r$jscomp$4$$.getLayoutBox().top)) : $relayoutAll$$ = !0;
  this.$resources_$.schedulePass(70, $relayoutAll$$);
};
function $JSCompiler_StaticMethods_checkPendingChangeSize_$$($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$, $element$jscomp$161_resource$jscomp$4$$) {
  var $resourceElement$$ = $closest$$module$src$dom$$($element$jscomp$161_resource$jscomp$4$$, function($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$) {
    return !!$Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$);
  });
  if ($resourceElement$$) {
    $element$jscomp$161_resource$jscomp$4$$ = $Resource$$module$src$service$resource$forElement$$($resourceElement$$);
    var $pendingChangeSize$$ = $element$jscomp$161_resource$jscomp$4$$.getPendingChangeSize();
    void 0 !== $pendingChangeSize$$ && $JSCompiler_StaticMethods_scheduleChangeSize_$$($JSCompiler_StaticMethods_checkPendingChangeSize_$self$$, $element$jscomp$161_resource$jscomp$4$$, $pendingChangeSize$$.height, $pendingChangeSize$$.width, $pendingChangeSize$$.margins, void 0, !0);
  }
}
function $JSCompiler_StaticMethods_scheduleChangeSize_$$($JSCompiler_StaticMethods_scheduleChangeSize_$self$$, $resource$jscomp$5$$, $newHeight$jscomp$9$$, $newWidth$jscomp$8$$, $newMargins$$, $event$jscomp$34$$, $force$jscomp$1$$, $opt_callback$jscomp$7$$) {
  $resource$jscomp$5$$.hasBeenMeasured() && !$newMargins$$ ? $JSCompiler_StaticMethods_completeScheduleChangeSize_$$($JSCompiler_StaticMethods_scheduleChangeSize_$self$$, $resource$jscomp$5$$, $newHeight$jscomp$9$$, $newWidth$jscomp$8$$, void 0, $event$jscomp$34$$, $force$jscomp$1$$, $opt_callback$jscomp$7$$) : $JSCompiler_StaticMethods_scheduleChangeSize_$self$$.$vsync_$.measure(function() {
    $resource$jscomp$5$$.hasBeenMeasured() || $resource$jscomp$5$$.measure();
    if ($newMargins$$) {
      var $JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$ = $computedStyle$$module$src$style$$($JSCompiler_StaticMethods_scheduleChangeSize_$self$$.win, $resource$jscomp$5$$.element);
      $JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$ = {top:parseInt($JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$.marginTop, 10) || 0, right:parseInt($JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$.marginRight, 10) || 0, bottom:parseInt($JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$.marginBottom, 
      10) || 0, left:parseInt($JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$.marginLeft, 10) || 0};
      $JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$ = {newMargins:$newMargins$$, currentMargins:$JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$};
    } else {
      $JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$ = void 0;
    }
    $JSCompiler_StaticMethods_completeScheduleChangeSize_$$($JSCompiler_StaticMethods_scheduleChangeSize_$self$$, $resource$jscomp$5$$, $newHeight$jscomp$9$$, $newWidth$jscomp$8$$, $JSCompiler_inline_result$jscomp$187_JSCompiler_style$jscomp$inline_566_JSCompiler_temp$jscomp$186$$, $event$jscomp$34$$, $force$jscomp$1$$, $opt_callback$jscomp$7$$);
  });
}
function $JSCompiler_StaticMethods_completeScheduleChangeSize_$$($JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$, $resource$jscomp$6$$, $newHeight$jscomp$10$$, $newWidth$jscomp$9$$, $marginChange$jscomp$1$$, $event$jscomp$35$$, $force$jscomp$2$$, $opt_callback$jscomp$8$$) {
  $resource$jscomp$6$$.resetPendingChangeSize();
  var $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$ = $resource$jscomp$6$$.getPageLayoutBox();
  if (!($JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$ = void 0 !== $newHeight$jscomp$10$$ && $newHeight$jscomp$10$$ != $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$.height || void 0 !== $newWidth$jscomp$9$$ && $newWidth$jscomp$9$$ != $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$.width) && ($JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$ = 
  void 0 !== $marginChange$jscomp$1$$)) {
    $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$ = $marginChange$jscomp$1$$.currentMargins;
    var $JSCompiler_change$jscomp$inline_569$$ = $marginChange$jscomp$1$$.newMargins;
    $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$ = void 0 !== $JSCompiler_change$jscomp$inline_569$$.top && $JSCompiler_change$jscomp$inline_569$$.top != $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$.top || void 0 !== $JSCompiler_change$jscomp$inline_569$$.right && $JSCompiler_change$jscomp$inline_569$$.right != $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$.right || 
    void 0 !== $JSCompiler_change$jscomp$inline_569$$.bottom && $JSCompiler_change$jscomp$inline_569$$.bottom != $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$.bottom || void 0 !== $JSCompiler_change$jscomp$inline_569$$.left && $JSCompiler_change$jscomp$inline_569$$.left != $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$.left;
  }
  $JSCompiler_margins$jscomp$inline_568_JSCompiler_temp$jscomp$126_JSCompiler_temp$jscomp$127_layoutBox$jscomp$3$$ ? ($JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$.$resources_$.updateOrEnqueueMutateTask($resource$jscomp$6$$, {resource:$resource$jscomp$6$$, newHeight:$newHeight$jscomp$10$$, newWidth:$newWidth$jscomp$9$$, marginChange:$marginChange$jscomp$1$$, event:$event$jscomp$35$$, force:$force$jscomp$2$$, callback:$opt_callback$jscomp$8$$}), $JSCompiler_StaticMethods_completeScheduleChangeSize_$self$$.$resources_$.schedulePassVsync()) : 
  (void 0 === $newHeight$jscomp$10$$ && void 0 === $newWidth$jscomp$9$$ && void 0 === $marginChange$jscomp$1$$ && $dev$$module$src$log$$().error("Mutator", "attempting to change size with undefined dimensions", $resource$jscomp$6$$.debugid), $opt_callback$jscomp$8$$ && $opt_callback$jscomp$8$$(!0));
}
;function $elements$$module$src$service$owners_impl$$($elements$jscomp$4$$) {
  return $isArray$$module$src$types$$($elements$jscomp$4$$) ? $elements$jscomp$4$$ : [$elements$jscomp$4$$];
}
function $OwnersImpl$$module$src$service$owners_impl$$($ampdoc$jscomp$59$$) {
  this.$resources_$ = $Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$59$$);
}
$JSCompiler_prototypeAlias$$ = $OwnersImpl$$module$src$service$owners_impl$$.prototype;
$JSCompiler_prototypeAlias$$.setOwner = function($JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$, $JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$) {
  $devAssert$$module$src$log$$($JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$.contains($JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$));
  $Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$) && $Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$).updateOwner($JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$);
  $JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$.__AMP__OWNER = $JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$;
  $JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$ = $JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$.getElementsByClassName("i-amphtml-element");
  for ($JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$ = 0; $JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$ < $JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$.length; $JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$++) {
    var $JSCompiler_ele$jscomp$inline_575$$ = $JSCompiler_cachedElements$jscomp$inline_573_element$jscomp$164$$[$JSCompiler_i$jscomp$inline_574_owner$jscomp$8$$];
    $Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_ele$jscomp$inline_575$$) && $Resource$$module$src$service$resource$forElementOptional$$($JSCompiler_ele$jscomp$inline_575$$).updateOwner(void 0);
  }
};
$JSCompiler_prototypeAlias$$.schedulePreload = function($parentElement$jscomp$6$$, $subElements$jscomp$6$$) {
  $JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$$(this, this.$resources_$.getResourceForElement($parentElement$jscomp$6$$), !1, $elements$$module$src$service$owners_impl$$($subElements$jscomp$6$$));
};
$JSCompiler_prototypeAlias$$.scheduleLayout = function($parentElement$jscomp$7$$, $subElements$jscomp$7$$) {
  $JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$$(this, this.$resources_$.getResourceForElement($parentElement$jscomp$7$$), !0, $elements$$module$src$service$owners_impl$$($subElements$jscomp$7$$));
};
$JSCompiler_prototypeAlias$$.schedulePause = function($parentElement$jscomp$8$$, $subElements$jscomp$8$$) {
  var $parentResource$$ = this.$resources_$.getResourceForElement($parentElement$jscomp$8$$);
  $subElements$jscomp$8$$ = $elements$$module$src$service$owners_impl$$($subElements$jscomp$8$$);
  $JSCompiler_StaticMethods_findResourcesInElements_$$(this, $parentResource$$, $subElements$jscomp$8$$, function($parentElement$jscomp$8$$) {
    $parentElement$jscomp$8$$.pause();
  });
};
$JSCompiler_prototypeAlias$$.scheduleResume = function($parentElement$jscomp$9_parentResource$jscomp$1$$, $subElements$jscomp$9$$) {
  $parentElement$jscomp$9_parentResource$jscomp$1$$ = this.$resources_$.getResourceForElement($parentElement$jscomp$9_parentResource$jscomp$1$$);
  $subElements$jscomp$9$$ = $elements$$module$src$service$owners_impl$$($subElements$jscomp$9$$);
  $JSCompiler_StaticMethods_findResourcesInElements_$$(this, $parentElement$jscomp$9_parentResource$jscomp$1$$, $subElements$jscomp$9$$, function($parentElement$jscomp$9_parentResource$jscomp$1$$) {
    $parentElement$jscomp$9_parentResource$jscomp$1$$.resume();
  });
};
$JSCompiler_prototypeAlias$$.scheduleUnlayout = function($parentElement$jscomp$10_parentResource$jscomp$2$$, $subElements$jscomp$10$$) {
  $parentElement$jscomp$10_parentResource$jscomp$2$$ = this.$resources_$.getResourceForElement($parentElement$jscomp$10_parentResource$jscomp$2$$);
  $subElements$jscomp$10$$ = $elements$$module$src$service$owners_impl$$($subElements$jscomp$10$$);
  $JSCompiler_StaticMethods_findResourcesInElements_$$(this, $parentElement$jscomp$10_parentResource$jscomp$2$$, $subElements$jscomp$10$$, function($parentElement$jscomp$10_parentResource$jscomp$2$$) {
    $parentElement$jscomp$10_parentResource$jscomp$2$$.unlayout();
  });
};
$JSCompiler_prototypeAlias$$.updateInViewport = function($parentElement$jscomp$11$$, $subElements$jscomp$11$$, $inLocalViewport$jscomp$1$$) {
  $JSCompiler_StaticMethods_updateInViewportForSubresources_$$(this, this.$resources_$.getResourceForElement($parentElement$jscomp$11$$), $elements$$module$src$service$owners_impl$$($subElements$jscomp$11$$), $inLocalViewport$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.requireLayout = function($element$jscomp$165$$, $opt_parentPriority$jscomp$1$$) {
  var $$jscomp$this$jscomp$93$$ = this, $promises$jscomp$4$$ = [];
  $JSCompiler_StaticMethods_discoverResourcesForElement_$$(this, $element$jscomp$165$$, function($element$jscomp$165$$) {
    4 != $element$jscomp$165$$.getState() && (3 != $element$jscomp$165$$.getState() ? $promises$jscomp$4$$.push($element$jscomp$165$$.whenBuilt().then(function() {
      $element$jscomp$165$$.measure();
      if ($element$jscomp$165$$.isDisplayed()) {
        return $$jscomp$this$jscomp$93$$.$resources_$.scheduleLayoutOrPreload($element$jscomp$165$$, !0, $opt_parentPriority$jscomp$1$$, !0), $element$jscomp$165$$.loadedOnce();
      }
    })) : $element$jscomp$165$$.isDisplayed() && $promises$jscomp$4$$.push($element$jscomp$165$$.loadedOnce()));
  });
  return Promise.all($promises$jscomp$4$$);
};
function $JSCompiler_StaticMethods_findResourcesInElements_$$($JSCompiler_StaticMethods_findResourcesInElements_$self$$, $parentResource$jscomp$3$$, $elements$jscomp$5$$, $callback$jscomp$78$$) {
  $elements$jscomp$5$$.forEach(function($elements$jscomp$5$$) {
    $devAssert$$module$src$log$$($parentResource$jscomp$3$$.element.contains($elements$jscomp$5$$));
    $JSCompiler_StaticMethods_discoverResourcesForElement_$$($JSCompiler_StaticMethods_findResourcesInElements_$self$$, $elements$jscomp$5$$, $callback$jscomp$78$$);
  });
}
function $JSCompiler_StaticMethods_discoverResourcesForElement_$$($JSCompiler_StaticMethods_discoverResourcesForElement_$self$$, $ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$, $callback$jscomp$79$$) {
  if ($ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$.classList.contains("i-amphtml-element")) {
    $callback$jscomp$79$$($JSCompiler_StaticMethods_discoverResourcesForElement_$self$$.$resources_$.getResourceForElement($ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$)), ($ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$ = $ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$.getPlaceholder()) && $JSCompiler_StaticMethods_discoverResourcesForElement_$$($JSCompiler_StaticMethods_discoverResourcesForElement_$self$$, $ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$, 
    $callback$jscomp$79$$);
  } else {
    $ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$ = $ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$.getElementsByClassName("i-amphtml-element");
    for (var $seen$jscomp$1$$ = [], $i$jscomp$80$$ = 0; $i$jscomp$80$$ < $ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$.length; $i$jscomp$80$$++) {
      for (var $ampElement$$ = $ampElements$jscomp$1_element$jscomp$167_placeholder$jscomp$3$$[$i$jscomp$80$$], $covered$$ = !1, $j$jscomp$1$$ = 0; $j$jscomp$1$$ < $seen$jscomp$1$$.length; $j$jscomp$1$$++) {
        if ($seen$jscomp$1$$[$j$jscomp$1$$].contains($ampElement$$)) {
          $covered$$ = !0;
          break;
        }
      }
      $covered$$ || ($seen$jscomp$1$$.push($ampElement$$), $callback$jscomp$79$$($JSCompiler_StaticMethods_discoverResourcesForElement_$self$$.$resources_$.getResourceForElement($ampElement$$)));
    }
  }
}
function $JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $parentResource$jscomp$4$$, $layout$jscomp$7$$, $subElements$jscomp$12$$) {
  $JSCompiler_StaticMethods_findResourcesInElements_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $parentResource$jscomp$4$$, $subElements$jscomp$12$$, function($subElements$jscomp$12$$) {
    0 === $subElements$jscomp$12$$.getState() ? $subElements$jscomp$12$$.whenBuilt().then(function() {
      $JSCompiler_StaticMethods_measureAndTryScheduleLayout_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $subElements$jscomp$12$$, !$layout$jscomp$7$$, $parentResource$jscomp$4$$.getLayoutPriority());
    }) : $JSCompiler_StaticMethods_measureAndTryScheduleLayout_$$($JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$self$$, $subElements$jscomp$12$$, !$layout$jscomp$7$$, $parentResource$jscomp$4$$.getLayoutPriority());
  });
}
function $JSCompiler_StaticMethods_measureAndTryScheduleLayout_$$($JSCompiler_StaticMethods_measureAndTryScheduleLayout_$self$$, $resource$jscomp$12$$, $isPreload$$, $opt_parentPriority$jscomp$2$$) {
  $resource$jscomp$12$$.measure();
  2 === $resource$jscomp$12$$.getState() && $resource$jscomp$12$$.isDisplayed() && $JSCompiler_StaticMethods_measureAndTryScheduleLayout_$self$$.$resources_$.scheduleLayoutOrPreload($resource$jscomp$12$$, !$isPreload$$, $opt_parentPriority$jscomp$2$$);
}
function $JSCompiler_StaticMethods_updateInViewportForSubresources_$$($JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$, $parentResource$jscomp$5$$, $subElements$jscomp$13$$, $inLocalViewport$jscomp$2$$) {
  var $inViewport$jscomp$4$$ = $parentResource$jscomp$5$$.isInViewport() && $inLocalViewport$jscomp$2$$;
  $JSCompiler_StaticMethods_findResourcesInElements_$$($JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$, $parentResource$jscomp$5$$, $subElements$jscomp$13$$, function($JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$) {
    $JSCompiler_StaticMethods_updateInViewportForSubresources_$self$$.setInViewport($inViewport$jscomp$4$$);
  });
}
;function $createNoReferrerPixel$$module$src$pixel$$($win$jscomp$182$$, $src$jscomp$7$$) {
  if ("referrerPolicy" in Image.prototype) {
    return $createImagePixel$$module$src$pixel$$($win$jscomp$182$$, $src$jscomp$7$$, !0);
  }
  var $iframe$jscomp$13$$ = $createElementWithAttributes$$module$src$dom$$($win$jscomp$182$$.document);
  $iframe$jscomp$13$$.onload = function() {
    $createImagePixel$$module$src$pixel$$($iframe$jscomp$13$$.contentWindow, $src$jscomp$7$$);
  };
  $win$jscomp$182$$.document.body.appendChild($iframe$jscomp$13$$);
  return $iframe$jscomp$13$$;
}
function $createImagePixel$$module$src$pixel$$($image$jscomp$3_win$jscomp$183$$, $src$jscomp$8$$, $noReferrer$$) {
  $noReferrer$$ = void 0 === $noReferrer$$ ? !1 : $noReferrer$$;
  $image$jscomp$3_win$jscomp$183$$ = new $image$jscomp$3_win$jscomp$183$$.Image;
  $noReferrer$$ && ($image$jscomp$3_win$jscomp$183$$.referrerPolicy = "no-referrer");
  $image$jscomp$3_win$jscomp$183$$.src = $src$jscomp$8$$;
  return $image$jscomp$3_win$jscomp$183$$;
}
;function $AmpPixel$$module$builtins$amp_pixel$$($element$jscomp$168$$) {
  $BaseElement$$module$src$base_element$$.call(this, $element$jscomp$168$$);
  this.$triggerPromise_$ = null;
}
$$jscomp$inherits$$($AmpPixel$$module$builtins$amp_pixel$$, $BaseElement$$module$src$base_element$$);
$AmpPixel$$module$builtins$amp_pixel$$.prototype.isLayoutSupported = function() {
  return !0;
};
$AmpPixel$$module$builtins$amp_pixel$$.prototype.buildCallback = function() {
  this.element.setAttribute("aria-hidden", "true");
  (this.$referrerPolicy_$ = this.element.getAttribute("referrerpolicy")) && $userAssert$$module$src$log$$("no-referrer" == this.$referrerPolicy_$, 'amp-pixel: invalid "referrerpolicy" value "' + this.$referrerPolicy_$ + '". Only "no-referrer" is supported');
  this.element.hasAttribute("i-amphtml-ssr") && this.element.querySelector("img") ? $dev$$module$src$log$$().info("amp-pixel", "inabox img already present") : this.getAmpDoc().whenFirstVisible().then(this.$trigger_$.bind(this));
};
$AmpPixel$$module$builtins$amp_pixel$$.prototype.$trigger_$ = function() {
  var $$jscomp$this$jscomp$96$$ = this;
  if (this.$triggerPromise_$) {
    return $dev$$module$src$log$$().error("amp-pixel", "duplicate pixel"), this.$triggerPromise_$;
  }
  this.$triggerPromise_$ = $Services$$module$src$services$timerFor$$(this.win).promise(1).then(function() {
    var $src$jscomp$9$$ = $$jscomp$this$jscomp$96$$.element.getAttribute("src");
    if ($src$jscomp$9$$) {
      return $getExistingServiceForDocInEmbedScope$$module$src$service$$($$jscomp$this$jscomp$96$$.element, "url-replace").expandUrlAsync($JSCompiler_StaticMethods_assertSource_$$($src$jscomp$9$$)).then(function($src$jscomp$9$$) {
        if ($$jscomp$this$jscomp$96$$.win) {
          var $src$jscomp$10$$ = $$jscomp$this$jscomp$96$$.win;
          var $JSCompiler_referrerPolicy$jscomp$inline_579$$ = $$jscomp$this$jscomp$96$$.$referrerPolicy_$;
          $JSCompiler_referrerPolicy$jscomp$inline_579$$ && "no-referrer" !== $JSCompiler_referrerPolicy$jscomp$inline_579$$ && $user$$module$src$log$$().error("pixel", "Unsupported referrerPolicy: %s", $JSCompiler_referrerPolicy$jscomp$inline_579$$);
          $src$jscomp$10$$ = "no-referrer" === $JSCompiler_referrerPolicy$jscomp$inline_579$$ ? $createNoReferrerPixel$$module$src$pixel$$($src$jscomp$10$$, $src$jscomp$9$$) : $createImagePixel$$module$src$pixel$$($src$jscomp$10$$, $src$jscomp$9$$);
          $dev$$module$src$log$$().info("amp-pixel", "pixel triggered: ", $src$jscomp$9$$);
          return $src$jscomp$10$$;
        }
      });
    }
  });
};
function $JSCompiler_StaticMethods_assertSource_$$($src$jscomp$11$$) {
  $userAssert$$module$src$log$$(/^(https:\/\/|\/\/)/i.test($src$jscomp$11$$), 'The <amp-pixel> src attribute must start with "https://" or "//". Invalid value: ' + $src$jscomp$11$$);
  return $src$jscomp$11$$;
}
;function $Platform$$module$src$service$platform_impl$$($win$jscomp$185$$) {
  this.$navigator_$ = $win$jscomp$185$$.navigator;
  this.$win_$ = $win$jscomp$185$$;
}
$JSCompiler_prototypeAlias$$ = $Platform$$module$src$service$platform_impl$$.prototype;
$JSCompiler_prototypeAlias$$.isAndroid = function() {
  return /Android/i.test(this.$navigator_$.userAgent);
};
$JSCompiler_prototypeAlias$$.isIos = function() {
  return /iPhone|iPad|iPod/i.test(this.$navigator_$.userAgent);
};
$JSCompiler_prototypeAlias$$.isSafari = function() {
  return /Safari/i.test(this.$navigator_$.userAgent) && !this.isChrome() && !this.isIe() && !this.isEdge() && !this.isFirefox() && !this.isOpera();
};
$JSCompiler_prototypeAlias$$.isChrome = function() {
  return /Chrome|CriOS/i.test(this.$navigator_$.userAgent) && !this.isEdge() && !this.isOpera();
};
$JSCompiler_prototypeAlias$$.isFirefox = function() {
  return /Firefox|FxiOS/i.test(this.$navigator_$.userAgent) && !this.isEdge();
};
$JSCompiler_prototypeAlias$$.isOpera = function() {
  return /OPR\/|Opera|OPiOS/i.test(this.$navigator_$.userAgent);
};
$JSCompiler_prototypeAlias$$.isIe = function() {
  return /Trident|MSIE|IEMobile/i.test(this.$navigator_$.userAgent);
};
$JSCompiler_prototypeAlias$$.isEdge = function() {
  return /Edge/i.test(this.$navigator_$.userAgent);
};
$JSCompiler_prototypeAlias$$.isWebKit = function() {
  return /WebKit/i.test(this.$navigator_$.userAgent) && !this.isEdge();
};
$JSCompiler_prototypeAlias$$.isWindows = function() {
  return /Windows/i.test(this.$navigator_$.userAgent);
};
$JSCompiler_prototypeAlias$$.isStandalone = function() {
  return this.isIos() && this.$navigator_$.standalone || this.isChrome() && this.$win_$.matchMedia("(display-mode: standalone)").matches;
};
$JSCompiler_prototypeAlias$$.isBot = function() {
  return /bot/i.test(this.$navigator_$.userAgent);
};
$JSCompiler_prototypeAlias$$.getMajorVersion = function() {
  return this.isSafari() ? this.isIos() ? this.getIosMajorVersion() || 0 : $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /\sVersion\/(\d+)/, 1) : this.isChrome() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /(Chrome|CriOS)\/(\d+)/, 2) : this.isFirefox() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /(Firefox|FxiOS)\/(\d+)/, 2) : this.isOpera() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /(OPR|Opera|OPiOS)\/(\d+)/, 2) : this.isIe() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, 
  /MSIE\s(\d+)/, 1) : this.isEdge() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /Edge\/(\d+)/, 1) : 0;
};
function $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$, $expr$jscomp$5$$, $index$jscomp$86$$) {
  if (!$JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$.$navigator_$.userAgent) {
    return 0;
  }
  $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$ = $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$.$navigator_$.userAgent.match($expr$jscomp$5$$);
  return !$JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$ || $index$jscomp$86$$ >= $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$.length ? 0 : parseInt($JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$[$index$jscomp$86$$], 10);
}
$JSCompiler_prototypeAlias$$.getIosVersionString = function() {
  if (!this.$navigator_$.userAgent || !this.isIos()) {
    return "";
  }
  var $version$jscomp$5$$ = this.$navigator_$.userAgent.match(/OS ([0-9]+[_.][0-9]+([_.][0-9]+)?)\b/);
  return $version$jscomp$5$$ ? $version$jscomp$5$$ = $version$jscomp$5$$[1].replace(/_/g, ".") : "";
};
$JSCompiler_prototypeAlias$$.getIosMajorVersion = function() {
  var $currentIosVersion$$ = this.getIosVersionString();
  return "" == $currentIosVersion$$ ? null : Number($currentIosVersion$$.split(".")[0]);
};
function $isDocumentReady$$module$src$document_ready$$($doc$jscomp$32$$) {
  return "loading" != $doc$jscomp$32$$.readyState && "uninitialized" != $doc$jscomp$32$$.readyState;
}
function $isDocumentComplete$$module$src$document_ready$$($doc$jscomp$33$$) {
  return "complete" == $doc$jscomp$33$$.readyState;
}
function $onDocumentReady$$module$src$document_ready$$($doc$jscomp$34$$, $callback$jscomp$80$$) {
  $onDocumentState$$module$src$document_ready$$($doc$jscomp$34$$, $isDocumentReady$$module$src$document_ready$$, $callback$jscomp$80$$);
}
function $onDocumentState$$module$src$document_ready$$($doc$jscomp$35$$, $stateFn$$, $callback$jscomp$81$$) {
  var $ready$$ = $stateFn$$($doc$jscomp$35$$);
  if ($ready$$) {
    $callback$jscomp$81$$($doc$jscomp$35$$);
  } else {
    var $readyListener$$ = function() {
      $stateFn$$($doc$jscomp$35$$) && ($ready$$ || ($ready$$ = !0, $callback$jscomp$81$$($doc$jscomp$35$$)), $doc$jscomp$35$$.removeEventListener("readystatechange", $readyListener$$));
    };
    $doc$jscomp$35$$.addEventListener("readystatechange", $readyListener$$);
  }
}
function $whenDocumentReady$$module$src$document_ready$$($doc$jscomp$36$$) {
  return new Promise(function($resolve$jscomp$29$$) {
    $onDocumentReady$$module$src$document_ready$$($doc$jscomp$36$$, $resolve$jscomp$29$$);
  });
}
function $whenDocumentComplete$$module$src$document_ready$$($doc$jscomp$37$$) {
  return new Promise(function($resolve$jscomp$30$$) {
    $onDocumentState$$module$src$document_ready$$($doc$jscomp$37$$, $isDocumentComplete$$module$src$document_ready$$, $resolve$jscomp$30$$);
  });
}
;var $_template$$module$src$preconnect$$ = ["<link rel=preload referrerpolicy=origin>"], $preconnectFeatures$$module$src$preconnect$$ = null;
function $PreconnectService$$module$src$preconnect$$($win$jscomp$187$$) {
  this.$document_$ = $win$jscomp$187$$.document;
  this.$head_$ = $win$jscomp$187$$.document.head;
  this.$origins_$ = {};
  this.$urls_$ = {};
  this.$platform_$ = $Services$$module$src$services$platformFor$$($win$jscomp$187$$);
  this.$origins_$[$parseUrlDeprecated$$module$src$url$$($win$jscomp$187$$.location.href).origin] = !0;
  a: {
    if (!$preconnectFeatures$$module$src$preconnect$$) {
      var $JSCompiler_inline_result$jscomp$191_JSCompiler_linkTag$jscomp$inline_582$$ = $win$jscomp$187$$.document.createElement("link");
      var $JSCompiler_tokenList$jscomp$inline_583$$ = $JSCompiler_inline_result$jscomp$191_JSCompiler_linkTag$jscomp$inline_582$$.relList;
      $JSCompiler_inline_result$jscomp$191_JSCompiler_linkTag$jscomp$inline_582$$.as = "invalid-value";
      if (!$JSCompiler_tokenList$jscomp$inline_583$$ || !$JSCompiler_tokenList$jscomp$inline_583$$.supports) {
        $JSCompiler_inline_result$jscomp$191_JSCompiler_linkTag$jscomp$inline_582$$ = {};
        break a;
      }
      $preconnectFeatures$$module$src$preconnect$$ = {preconnect:$JSCompiler_tokenList$jscomp$inline_583$$.supports("preconnect"), preload:$JSCompiler_tokenList$jscomp$inline_583$$.supports("preload"), onlyValidAs:"invalid-value" != $JSCompiler_inline_result$jscomp$191_JSCompiler_linkTag$jscomp$inline_582$$.as};
    }
    $JSCompiler_inline_result$jscomp$191_JSCompiler_linkTag$jscomp$inline_582$$ = $preconnectFeatures$$module$src$preconnect$$;
  }
  this.$features_$ = $JSCompiler_inline_result$jscomp$191_JSCompiler_linkTag$jscomp$inline_582$$;
  this.$timer_$ = $Services$$module$src$services$timerFor$$($win$jscomp$187$$);
}
$PreconnectService$$module$src$preconnect$$.prototype.url = function($ampdoc$jscomp$61$$, $url$jscomp$73$$, $opt_alsoConnecting$$) {
  var $$jscomp$this$jscomp$97$$ = this;
  $ampdoc$jscomp$61$$.whenFirstVisible().then(function() {
    $$jscomp$this$jscomp$97$$.$url_$($ampdoc$jscomp$61$$, $url$jscomp$73$$, $opt_alsoConnecting$$);
  });
};
$PreconnectService$$module$src$preconnect$$.prototype.$url_$ = function($ampdoc$jscomp$62_origin$jscomp$7$$, $now$jscomp$3_url$jscomp$74$$, $opt_alsoConnecting$jscomp$1$$) {
  if ($JSCompiler_StaticMethods_isInterestingUrl_$$($now$jscomp$3_url$jscomp$74$$)) {
    $ampdoc$jscomp$62_origin$jscomp$7$$ = $parseUrlDeprecated$$module$src$url$$($now$jscomp$3_url$jscomp$74$$).origin;
    $now$jscomp$3_url$jscomp$74$$ = Date.now();
    var $lastPreconnectTimeout$$ = this.$origins_$[$ampdoc$jscomp$62_origin$jscomp$7$$];
    if ($lastPreconnectTimeout$$ && $now$jscomp$3_url$jscomp$74$$ < $lastPreconnectTimeout$$) {
      $opt_alsoConnecting$jscomp$1$$ && (this.$origins_$[$ampdoc$jscomp$62_origin$jscomp$7$$] = $now$jscomp$3_url$jscomp$74$$ + 18E4);
    } else {
      this.$origins_$[$ampdoc$jscomp$62_origin$jscomp$7$$] = $now$jscomp$3_url$jscomp$74$$ + ($opt_alsoConnecting$jscomp$1$$ ? 18E4 : 1E4);
      if (!this.$features_$.preconnect) {
        var $dns$$ = this.$document_$.createElement("link");
        $dns$$.setAttribute("rel", "dns-prefetch");
        $dns$$.setAttribute("href", $ampdoc$jscomp$62_origin$jscomp$7$$);
        this.$head_$.appendChild($dns$$);
      }
      var $preconnect$$ = this.$document_$.createElement("link");
      $preconnect$$.setAttribute("rel", "preconnect");
      $preconnect$$.setAttribute("href", $ampdoc$jscomp$62_origin$jscomp$7$$);
      $preconnect$$.setAttribute("referrerpolicy", "origin");
      this.$head_$.appendChild($preconnect$$);
      this.$timer_$.delay(function() {
        $dns$$ && $dns$$.parentNode && $dns$$.parentNode.removeChild($dns$$);
        $preconnect$$.parentNode && $preconnect$$.parentNode.removeChild($preconnect$$);
      }, 10000);
      $JSCompiler_StaticMethods_preconnectPolyfill_$$(this, $ampdoc$jscomp$62_origin$jscomp$7$$);
    }
  }
};
$PreconnectService$$module$src$preconnect$$.prototype.preload = function($ampdoc$jscomp$63$$, $url$jscomp$75$$, $opt_preloadAs$$) {
  var $$jscomp$this$jscomp$98$$ = this;
  $JSCompiler_StaticMethods_isInterestingUrl_$$($url$jscomp$75$$) && !this.$urls_$[$url$jscomp$75$$] && (this.$urls_$[$url$jscomp$75$$] = !0, this.url($ampdoc$jscomp$63$$, $url$jscomp$75$$, !0), this.$features_$.preload && ("document" == $opt_preloadAs$$ && this.$platform_$.isSafari() || $ampdoc$jscomp$63$$.whenFirstVisible().then(function() {
    var $ampdoc$jscomp$63$$ = $htmlFor$$module$src$static_template$$($$jscomp$this$jscomp$98$$.$document_$)($_template$$module$src$preconnect$$);
    $ampdoc$jscomp$63$$.setAttribute("href", $url$jscomp$75$$);
    $ampdoc$jscomp$63$$.as = $$jscomp$this$jscomp$98$$.$features_$.onlyValidAs ? "fetch" : "";
    $$jscomp$this$jscomp$98$$.$head_$.appendChild($ampdoc$jscomp$63$$);
  })));
};
function $JSCompiler_StaticMethods_isInterestingUrl_$$($url$jscomp$77$$) {
  return $startsWith$$module$src$string$$($url$jscomp$77$$, "https:") || $startsWith$$module$src$string$$($url$jscomp$77$$, "http:") ? !0 : !1;
}
function $JSCompiler_StaticMethods_preconnectPolyfill_$$($JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$, $origin$jscomp$8$$) {
  if (!$JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$features_$.preconnect && ($JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$platform_$.isSafari() || $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$platform_$.isIos())) {
    var $now$jscomp$4$$ = Date.now();
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.$origins_$[$origin$jscomp$8$$] = $now$jscomp$4$$ + 18E4;
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$ = new XMLHttpRequest;
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.open("HEAD", $origin$jscomp$8$$ + "/robots.txt?_AMP_safari_preconnect_polyfill_cachebust=" + ($now$jscomp$4$$ - $now$jscomp$4$$ % 18E4), !0);
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.withCredentials = !0;
    $JSCompiler_StaticMethods_preconnectPolyfill_$self_xhr$jscomp$5$$.send();
  }
}
function $preconnectToOrigin$$module$src$preconnect$$() {
  var $document$jscomp$5$$ = self.document;
  $whenDocumentComplete$$module$src$document_ready$$($document$jscomp$5$$).then(function() {
    var $preconnect$jscomp$1_win$jscomp$188$$ = $document$jscomp$5$$.defaultView;
    if ($preconnect$jscomp$1_win$jscomp$188$$) {
      $preconnect$jscomp$1_win$jscomp$188$$ = $getService$$module$src$service$$($preconnect$jscomp$1_win$jscomp$188$$, "preconnect");
      var $info$jscomp$2$$ = $Services$$module$src$services$documentInfoForDoc$$($document$jscomp$5$$.documentElement), $ampdoc$jscomp$65$$ = $getAmpdoc$$module$src$service$$($document$jscomp$5$$);
      $preconnect$jscomp$1_win$jscomp$188$$.url($ampdoc$jscomp$65$$, $info$jscomp$2$$.sourceUrl);
      $preconnect$jscomp$1_win$jscomp$188$$.url($ampdoc$jscomp$65$$, $info$jscomp$2$$.canonicalUrl);
    }
  });
}
;function $FiniteStateMachine$$module$src$finite_state_machine$$($initialState$$) {
  this.$state_$ = $initialState$$;
  this.$transitions_$ = Object.create(null);
}
$FiniteStateMachine$$module$src$finite_state_machine$$.prototype.addTransition = function($oldState$$, $newState$jscomp$8$$, $callback$jscomp$82$$) {
  var $transition$$ = $oldState$$ + "|" + $newState$jscomp$8$$;
  $devAssert$$module$src$log$$(!this.$transitions_$[$transition$$]);
  this.$transitions_$[$transition$$] = $callback$jscomp$82$$;
};
$FiniteStateMachine$$module$src$finite_state_machine$$.prototype.setState = function($callback$jscomp$83_newState$jscomp$9$$) {
  var $oldState$jscomp$1$$ = this.$state_$;
  this.$state_$ = $callback$jscomp$83_newState$jscomp$9$$;
  ($callback$jscomp$83_newState$jscomp$9$$ = this.$transitions_$[$oldState$jscomp$1$$ + "|" + $callback$jscomp$83_newState$jscomp$9$$]) && $callback$jscomp$83_newState$jscomp$9$$();
};
function $TaskQueue$$module$src$service$task_queue$$() {
  this.$tasks_$ = [];
  this.$taskIdMap_$ = {};
  this.$lastDequeueTime_$ = this.$lastEnqueueTime_$ = 0;
}
$JSCompiler_prototypeAlias$$ = $TaskQueue$$module$src$service$task_queue$$.prototype;
$JSCompiler_prototypeAlias$$.getSize = function() {
  return this.$tasks_$.length;
};
$JSCompiler_prototypeAlias$$.getLastEnqueueTime = function() {
  return this.$lastEnqueueTime_$;
};
$JSCompiler_prototypeAlias$$.getLastDequeueTime = function() {
  return this.$lastDequeueTime_$;
};
$JSCompiler_prototypeAlias$$.getTaskById = function($taskId$$) {
  return this.$taskIdMap_$[$taskId$$] || null;
};
$JSCompiler_prototypeAlias$$.enqueue = function($task$jscomp$2$$) {
  $devAssert$$module$src$log$$(!this.$taskIdMap_$[$task$jscomp$2$$.id]);
  this.$tasks_$.push($task$jscomp$2$$);
  this.$taskIdMap_$[$task$jscomp$2$$.id] = $task$jscomp$2$$;
  this.$lastEnqueueTime_$ = Date.now();
};
$JSCompiler_prototypeAlias$$.dequeue = function($task$jscomp$3$$) {
  if (!this.removeAtIndex($task$jscomp$3$$, this.$tasks_$.indexOf(this.$taskIdMap_$[$task$jscomp$3$$.id]))) {
    return !1;
  }
  this.$lastDequeueTime_$ = Date.now();
  return !0;
};
$JSCompiler_prototypeAlias$$.peek = function($scorer$$, $state$jscomp$23$$) {
  for (var $minScore$$ = 1e6, $minTask$$ = null, $i$jscomp$81$$ = 0; $i$jscomp$81$$ < this.$tasks_$.length; $i$jscomp$81$$++) {
    var $task$jscomp$4$$ = this.$tasks_$[$i$jscomp$81$$], $score$$ = $scorer$$($task$jscomp$4$$, $state$jscomp$23$$);
    $score$$ < $minScore$$ && ($minScore$$ = $score$$, $minTask$$ = $task$jscomp$4$$);
  }
  return $minTask$$;
};
$JSCompiler_prototypeAlias$$.forEach = function($callback$jscomp$85$$) {
  this.$tasks_$.forEach($callback$jscomp$85$$);
};
$JSCompiler_prototypeAlias$$.removeAtIndex = function($task$jscomp$5$$, $index$jscomp$87$$) {
  var $existing$jscomp$3$$ = this.$taskIdMap_$[$task$jscomp$5$$.id];
  if (!$existing$jscomp$3$$ || this.$tasks_$[$index$jscomp$87$$] != $existing$jscomp$3$$) {
    return !1;
  }
  this.$tasks_$.splice($index$jscomp$87$$, 1);
  delete this.$taskIdMap_$[$task$jscomp$5$$.id];
  return !0;
};
$JSCompiler_prototypeAlias$$.purge = function($callback$jscomp$86$$) {
  for (var $index$jscomp$88$$ = this.$tasks_$.length; $index$jscomp$88$$--;) {
    $callback$jscomp$86$$(this.$tasks_$[$index$jscomp$88$$]) && this.removeAtIndex(this.$tasks_$[$index$jscomp$88$$], $index$jscomp$88$$);
  }
};
function $checkAndFix$$module$src$service$ie_media_bug$$($win$jscomp$189$$) {
  return !$Services$$module$src$services$platformFor$$($win$jscomp$189$$).isIe() || $matchMediaIeQuite$$module$src$service$ie_media_bug$$($win$jscomp$189$$) ? null : new Promise(function($resolve$jscomp$31$$) {
    var $endTime$jscomp$5$$ = Date.now() + 2000, $interval$jscomp$3$$ = $win$jscomp$189$$.setInterval(function() {
      var $now$jscomp$5$$ = Date.now(), $matches$jscomp$3$$ = $matchMediaIeQuite$$module$src$service$ie_media_bug$$($win$jscomp$189$$);
      if ($matches$jscomp$3$$ || $now$jscomp$5$$ > $endTime$jscomp$5$$) {
        $win$jscomp$189$$.clearInterval($interval$jscomp$3$$), $resolve$jscomp$31$$(), $matches$jscomp$3$$ || $dev$$module$src$log$$().error("ie-media-bug", "IE media never resolved");
      }
    }, 10);
  });
}
function $matchMediaIeQuite$$module$src$service$ie_media_bug$$($win$jscomp$190$$) {
  var $q$$ = "(min-width: " + ($win$jscomp$190$$.innerWidth - 1) + "px) AND (max-width: " + ($win$jscomp$190$$.innerWidth + 1 + "px)");
  try {
    return $win$jscomp$190$$.matchMedia($q$$).matches;
  } catch ($e$jscomp$71$$) {
    return $dev$$module$src$log$$().error("ie-media-bug", "IE matchMedia failed: ", $e$jscomp$71$$), !0;
  }
}
;function $ResourcesImpl$$module$src$service$resources_impl$$($ampdoc$jscomp$66_root$jscomp$15$$) {
  var $$jscomp$this$jscomp$99$$ = this;
  this.ampdoc = $ampdoc$jscomp$66_root$jscomp$15$$;
  this.win = $ampdoc$jscomp$66_root$jscomp$15$$.win;
  this.$viewer_$ = $Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$66_root$jscomp$15$$);
  this.$isRuntimeOn_$ = this.$viewer_$.isRuntimeOn();
  this.$isBuildOn_$ = !1;
  this.$resourceIdCounter_$ = 0;
  this.$resources_$ = [];
  this.$buildAttemptsCount_$ = this.$addCount_$ = 0;
  this.$visible_$ = this.ampdoc.isVisible();
  this.$prerenderSize_$ = this.$viewer_$.getPrerenderSize();
  this.$documentReady_$ = !1;
  this.$firstPassAfterDocumentReady_$ = !0;
  this.$ampInitialized_$ = !1;
  this.$firstVisibleTime_$ = -1;
  this.$relayoutAll_$ = !0;
  this.$relayoutTop_$ = -1;
  this.$lastVelocity_$ = this.$lastScrollTime_$ = 0;
  this.$pass_$ = new $Pass$$module$src$pass$$(this.win, function() {
    return $$jscomp$this$jscomp$99$$.doPass();
  });
  this.$remeasurePass_$ = new $Pass$$module$src$pass$$(this.win, function() {
    $devAssert$$module$src$log$$(!$$jscomp$this$jscomp$99$$.$intersectionObserver_$);
    $$jscomp$this$jscomp$99$$.$relayoutAll_$ = !0;
    $$jscomp$this$jscomp$99$$.schedulePass();
  });
  this.$exec_$ = new $TaskQueue$$module$src$service$task_queue$$;
  this.$queue_$ = new $TaskQueue$$module$src$service$task_queue$$;
  this.$boundTaskScorer_$ = this.$calcTaskScore_$.bind(this);
  this.$requestsChangeSize_$ = [];
  this.$pendingBuildResources_$ = [];
  this.$isCurrentlyBuildingPendingResources_$ = !1;
  this.$viewport_$ = $Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.$vsync_$ = $Services$$module$src$services$vsyncFor$$(this.win);
  this.$activeHistory_$ = new $FocusHistory$$module$src$focus_history$$(this.win);
  this.$vsyncScheduled_$ = !1;
  this.$contentHeight_$ = 0;
  this.$maybeChangeHeight_$ = !1;
  this.$passCallbacks_$ = [];
  this.$elementsThatScrolled_$ = [];
  this.$firstPassDone_$ = new $Deferred$$module$src$utils$promise$$;
  this.$visibilityStateMachine_$ = new $FiniteStateMachine$$module$src$finite_state_machine$$(this.ampdoc.getVisibilityState());
  this.$intersectionObserver_$ = null;
  this.$intersectionObserverCallbackFired_$ = !1;
  if ($isExperimentOn$$module$src$experiments$$(this.win, "intersect-resources")) {
    var $iframed$$ = $isIframed$$module$src$dom$$(this.win);
    $ampdoc$jscomp$66_root$jscomp$15$$ = this.ampdoc.isSingleDoc() && $iframed$$ ? this.win.document : null;
    try {
      this.$intersectionObserver_$ = new IntersectionObserver(function($ampdoc$jscomp$66_root$jscomp$15$$) {
        return $JSCompiler_StaticMethods_intersects_$$($$jscomp$this$jscomp$99$$, $ampdoc$jscomp$66_root$jscomp$15$$);
      }, {root:$ampdoc$jscomp$66_root$jscomp$15$$, rootMargin:"200% 25%"}), this.$relayoutAll_$ = !1;
    } catch ($e$jscomp$73$$) {
      $dev$$module$src$log$$().warn("Resources", "Falling back to classic Resources:", $e$jscomp$73$$);
    }
  }
  this.$viewport_$.onChanged(function($ampdoc$jscomp$66_root$jscomp$15$$) {
    $$jscomp$this$jscomp$99$$.$lastScrollTime_$ = Date.now();
    $$jscomp$this$jscomp$99$$.$lastVelocity_$ = $ampdoc$jscomp$66_root$jscomp$15$$.velocity;
    $ampdoc$jscomp$66_root$jscomp$15$$.relayoutAll && ($$jscomp$this$jscomp$99$$.$relayoutAll_$ = !0, $$jscomp$this$jscomp$99$$.$maybeChangeHeight_$ = !0);
    !$$jscomp$this$jscomp$99$$.$relayoutAll_$ && $$jscomp$this$jscomp$99$$.$intersectionObserver_$ || $$jscomp$this$jscomp$99$$.schedulePass();
  });
  this.$viewport_$.onScroll(function() {
    $$jscomp$this$jscomp$99$$.$lastScrollTime_$ = Date.now();
  });
  this.ampdoc.onVisibilityChanged(function() {
    -1 == $$jscomp$this$jscomp$99$$.$firstVisibleTime_$ && $$jscomp$this$jscomp$99$$.ampdoc.isVisible() && ($$jscomp$this$jscomp$99$$.$firstVisibleTime_$ = Date.now());
    $$jscomp$this$jscomp$99$$.schedulePass();
  });
  this.$viewer_$.onRuntimeState(function($ampdoc$jscomp$66_root$jscomp$15$$) {
    $$jscomp$this$jscomp$99$$.$isRuntimeOn_$ = $ampdoc$jscomp$66_root$jscomp$15$$;
    $$jscomp$this$jscomp$99$$.schedulePass(1);
  });
  $startupChunk$$module$src$chunk$$(this.ampdoc, function() {
    $JSCompiler_StaticMethods_setupVisibilityStateMachine_$$($$jscomp$this$jscomp$99$$, $$jscomp$this$jscomp$99$$.$visibilityStateMachine_$);
    $$jscomp$this$jscomp$99$$.schedulePass(0);
  });
  $JSCompiler_StaticMethods_rebuildDomWhenReady_$$(this);
  !this.$intersectionObserver_$ && $isExperimentOn$$module$src$experiments$$(this.win, "layoutbox-invalidate-on-scroll") && (this.$throttledScroll_$ = $throttle$$module$src$utils$rate_limit$$(this.win, function($ampdoc$jscomp$66_root$jscomp$15$$) {
    $ampdoc$jscomp$66_root$jscomp$15$$ = $ampdoc$jscomp$66_root$jscomp$15$$.target;
    $ampdoc$jscomp$66_root$jscomp$15$$.nodeType !== Node.ELEMENT_NODE || $ampdoc$jscomp$66_root$jscomp$15$$ === $$jscomp$this$jscomp$99$$.$viewport_$.getScrollingElement() || $$jscomp$this$jscomp$99$$.$elementsThatScrolled_$.includes($ampdoc$jscomp$66_root$jscomp$15$$) || ($$jscomp$this$jscomp$99$$.$elementsThatScrolled_$.push($ampdoc$jscomp$66_root$jscomp$15$$), $$jscomp$this$jscomp$99$$.schedulePass(70));
  }, 250), $listen$$module$src$event_helper$$(this.win.document, "scroll", this.$throttledScroll_$, {capture:!0, passive:!0}));
}
$JSCompiler_prototypeAlias$$ = $ResourcesImpl$$module$src$service$resources_impl$$.prototype;
$JSCompiler_prototypeAlias$$.isIntersectionExperimentOn = function() {
  return !!this.$intersectionObserver_$;
};
function $JSCompiler_StaticMethods_intersects_$$($JSCompiler_StaticMethods_intersects_$self$$, $entries$jscomp$1$$) {
  $devAssert$$module$src$log$$($JSCompiler_StaticMethods_intersects_$self$$.$intersectionObserver_$);
  $devAssert$$module$src$log$$(1 == $JSCompiler_StaticMethods_intersects_$self$$.$prerenderSize_$);
  if ($getMode$$module$src$mode$$().localDev) {
    var $inside$$ = [], $outside$$ = [];
    $entries$jscomp$1$$.forEach(function($JSCompiler_StaticMethods_intersects_$self$$) {
      var $entries$jscomp$1$$ = $Resource$$module$src$service$resource$forElement$$($JSCompiler_StaticMethods_intersects_$self$$.target);
      ($JSCompiler_StaticMethods_intersects_$self$$.isIntersecting ? $inside$$ : $outside$$).push({e:$JSCompiler_StaticMethods_intersects_$self$$, id:$entries$jscomp$1$$.debugid});
    });
  }
  $JSCompiler_StaticMethods_intersects_$self$$.$intersectionObserverCallbackFired_$ = !0;
  $entries$jscomp$1$$.forEach(function($JSCompiler_StaticMethods_intersects_$self$$) {
    var $entries$jscomp$1$$ = $JSCompiler_StaticMethods_intersects_$self$$.boundingClientRect;
    $Resource$$module$src$service$resource$forElement$$($JSCompiler_StaticMethods_intersects_$self$$.target).premeasure($entries$jscomp$1$$);
  });
  $JSCompiler_StaticMethods_intersects_$self$$.schedulePass();
}
function $JSCompiler_StaticMethods_rebuildDomWhenReady_$$($JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$) {
  $JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.ampdoc.whenReady().then(function() {
    $JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.$documentReady_$ = !0;
    $JSCompiler_StaticMethods_buildReadyResources_$$($JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$);
    $JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.$pendingBuildResources_$ = null;
    $getService$$module$src$service$$($JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.win, "input").setupInputModeClasses($JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.ampdoc);
    if (!$JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.$intersectionObserver_$) {
      var $fixPromise$$ = $checkAndFix$$module$src$service$ie_media_bug$$($JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.win), $remeasure$$ = function() {
        return $JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.$remeasurePass_$.schedule();
      };
      $fixPromise$$ ? $fixPromise$$.then($remeasure$$) : $remeasure$$();
      Promise.race([$loadPromise$$module$src$event_helper$$($JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.win), $Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.win).promise(3100)]).then($remeasure$$);
      $JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.win.document.fonts && "loaded" != $JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.win.document.fonts.status && $JSCompiler_StaticMethods_rebuildDomWhenReady_$self$$.win.document.fonts.ready.then($remeasure$$);
    }
  });
}
$JSCompiler_prototypeAlias$$.get = function() {
  return this.$resources_$.slice(0);
};
$JSCompiler_prototypeAlias$$.getAmpdoc = function() {
  return this.ampdoc;
};
$JSCompiler_prototypeAlias$$.getResourceForElement = function($element$jscomp$175$$) {
  return $Resource$$module$src$service$resource$forElement$$($element$jscomp$175$$);
};
$JSCompiler_prototypeAlias$$.getResourceForElementOptional = function($element$jscomp$176$$) {
  return $Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$176$$);
};
$JSCompiler_prototypeAlias$$.getScrollDirection = function() {
  return Math.sign(this.$lastVelocity_$) || 1;
};
$JSCompiler_prototypeAlias$$.add = function($element$jscomp$177$$) {
  this.$addCount_$++;
  1 == this.$addCount_$ && this.$viewport_$.ensureReadyForElements();
  var $resource$jscomp$16$$ = $Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$177$$);
  $resource$jscomp$16$$ && 0 != $resource$jscomp$16$$.getState() && !$element$jscomp$177$$.reconstructWhenReparented() ? this.$intersectionObserver_$ || $resource$jscomp$16$$.requestMeasure() : $resource$jscomp$16$$ = new $Resource$$module$src$service$resource$$(++this.$resourceIdCounter_$, $element$jscomp$177$$, this);
  this.$resources_$.push($resource$jscomp$16$$);
  this.$intersectionObserver_$ ? this.$intersectionObserver_$.observe($element$jscomp$177$$) : this.$remeasurePass_$.schedule(1000);
};
function $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$, $resource$jscomp$17$$, $checkForDupes$$, $ignoreQuota$$) {
  $checkForDupes$$ = void 0 === $checkForDupes$$ ? !1 : $checkForDupes$$;
  $ignoreQuota$$ = void 0 === $ignoreQuota$$ ? !1 : $ignoreQuota$$;
  var $buildingEnabled$$ = $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$isRuntimeOn_$ || $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$isBuildOn_$, $shouldBuildResource$$ = "prerender" != $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.ampdoc.getVisibilityState() || $resource$jscomp$17$$.prerenderAllowed();
  $buildingEnabled$$ && $shouldBuildResource$$ && ($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$documentReady_$ ? $JSCompiler_StaticMethods_buildResourceUnsafe_$$($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$, $resource$jscomp$17$$, $ignoreQuota$$) : $resource$jscomp$17$$.isBuilt() || $resource$jscomp$17$$.isBuilding() || $checkForDupes$$ && $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$pendingBuildResources_$.includes($resource$jscomp$17$$) || 
  ($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$.$pendingBuildResources_$.push($resource$jscomp$17$$), $JSCompiler_StaticMethods_buildReadyResources_$$($JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$self$$)));
}
function $JSCompiler_StaticMethods_buildReadyResources_$$($JSCompiler_StaticMethods_buildReadyResources_$self$$) {
  if (!$JSCompiler_StaticMethods_buildReadyResources_$self$$.$isCurrentlyBuildingPendingResources_$) {
    try {
      $JSCompiler_StaticMethods_buildReadyResources_$self$$.$isCurrentlyBuildingPendingResources_$ = !0;
      for (var $JSCompiler_i$jscomp$inline_594$$ = 0; $JSCompiler_i$jscomp$inline_594$$ < $JSCompiler_StaticMethods_buildReadyResources_$self$$.$pendingBuildResources_$.length; $JSCompiler_i$jscomp$inline_594$$++) {
        var $JSCompiler_resource$jscomp$inline_595$$ = $JSCompiler_StaticMethods_buildReadyResources_$self$$.$pendingBuildResources_$[$JSCompiler_i$jscomp$inline_594$$], $JSCompiler_temp$jscomp$843$$;
        if (!($JSCompiler_temp$jscomp$843$$ = $JSCompiler_StaticMethods_buildReadyResources_$self$$.$documentReady_$)) {
          a: {
            var $JSCompiler_opt_stopNode$jscomp$inline_952$$ = $JSCompiler_StaticMethods_buildReadyResources_$self$$.ampdoc.getRootNode(), $JSCompiler_currentElement$jscomp$inline_953$$ = $JSCompiler_resource$jscomp$inline_595$$.element;
            do {
              if ($JSCompiler_currentElement$jscomp$inline_953$$.nextSibling) {
                $JSCompiler_temp$jscomp$843$$ = !0;
                break a;
              }
            } while (($JSCompiler_currentElement$jscomp$inline_953$$ = $JSCompiler_currentElement$jscomp$inline_953$$.parentNode) && $JSCompiler_currentElement$jscomp$inline_953$$ != $JSCompiler_opt_stopNode$jscomp$inline_952$$);
            $JSCompiler_temp$jscomp$843$$ = !1;
          }
        }
        $JSCompiler_temp$jscomp$843$$ && ($JSCompiler_StaticMethods_buildReadyResources_$self$$.$pendingBuildResources_$.splice($JSCompiler_i$jscomp$inline_594$$--, 1), $JSCompiler_StaticMethods_buildResourceUnsafe_$$($JSCompiler_StaticMethods_buildReadyResources_$self$$, $JSCompiler_resource$jscomp$inline_595$$));
      }
    } finally {
      $JSCompiler_StaticMethods_buildReadyResources_$self$$.$isCurrentlyBuildingPendingResources_$ = !1;
    }
  }
}
function $JSCompiler_StaticMethods_buildResourceUnsafe_$$($JSCompiler_StaticMethods_buildResourceUnsafe_$self$$, $resource$jscomp$19$$, $ignoreQuota$jscomp$1_promise$jscomp$24$$) {
  $ignoreQuota$jscomp$1_promise$jscomp$24$$ = void 0 === $ignoreQuota$jscomp$1_promise$jscomp$24$$ ? !1 : $ignoreQuota$jscomp$1_promise$jscomp$24$$;
  if (20 > $JSCompiler_StaticMethods_buildResourceUnsafe_$self$$.$buildAttemptsCount_$ || $JSCompiler_StaticMethods_buildResourceUnsafe_$self$$.ampdoc.hasBeenVisible() || $ignoreQuota$jscomp$1_promise$jscomp$24$$ || $resource$jscomp$19$$.isBuildRenderBlocking()) {
    if ($ignoreQuota$jscomp$1_promise$jscomp$24$$ = $resource$jscomp$19$$.build()) {
      $JSCompiler_StaticMethods_buildResourceUnsafe_$self$$.$buildAttemptsCount_$++, $ignoreQuota$jscomp$1_promise$jscomp$24$$.then(function() {
        return $JSCompiler_StaticMethods_buildResourceUnsafe_$self$$.schedulePass();
      }, function($ignoreQuota$jscomp$1_promise$jscomp$24$$) {
        $JSCompiler_StaticMethods_removeResource_$$($JSCompiler_StaticMethods_buildResourceUnsafe_$self$$, $resource$jscomp$19$$);
        if (!$isBlockedByConsent$$module$src$error$$($ignoreQuota$jscomp$1_promise$jscomp$24$$)) {
          throw $ignoreQuota$jscomp$1_promise$jscomp$24$$;
        }
      });
    }
  }
}
$JSCompiler_prototypeAlias$$.remove = function($element$jscomp$178_resource$jscomp$20$$) {
  ($element$jscomp$178_resource$jscomp$20$$ = $Resource$$module$src$service$resource$forElementOptional$$($element$jscomp$178_resource$jscomp$20$$)) && $JSCompiler_StaticMethods_removeResource_$$(this, $element$jscomp$178_resource$jscomp$20$$);
};
function $JSCompiler_StaticMethods_removeResource_$$($JSCompiler_StaticMethods_removeResource_$self$$, $resource$jscomp$21$$) {
  var $index$jscomp$89$$ = $JSCompiler_StaticMethods_removeResource_$self$$.$resources_$.indexOf($resource$jscomp$21$$);
  -1 != $index$jscomp$89$$ && $JSCompiler_StaticMethods_removeResource_$self$$.$resources_$.splice($index$jscomp$89$$, 1);
  $resource$jscomp$21$$.isBuilt() && $resource$jscomp$21$$.pauseOnRemove();
  $JSCompiler_StaticMethods_removeResource_$self$$.$intersectionObserver_$ && $JSCompiler_StaticMethods_removeResource_$self$$.$intersectionObserver_$.unobserve($resource$jscomp$21$$.element);
  $JSCompiler_StaticMethods_cleanupTasks_$$($JSCompiler_StaticMethods_removeResource_$self$$, $resource$jscomp$21$$, !0);
}
$JSCompiler_prototypeAlias$$.upgraded = function($element$jscomp$179_resource$jscomp$22$$) {
  $element$jscomp$179_resource$jscomp$22$$ = $Resource$$module$src$service$resource$forElement$$($element$jscomp$179_resource$jscomp$22$$);
  $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$(this, $element$jscomp$179_resource$jscomp$22$$);
};
$JSCompiler_prototypeAlias$$.updateLayoutPriority = function($element$jscomp$180$$, $newLayoutPriority$jscomp$2$$) {
  var $resource$jscomp$23$$ = $Resource$$module$src$service$resource$forElement$$($element$jscomp$180$$);
  $resource$jscomp$23$$.updateLayoutPriority($newLayoutPriority$jscomp$2$$);
  this.$queue_$.forEach(function($element$jscomp$180$$) {
    $element$jscomp$180$$.resource == $resource$jscomp$23$$ && ($element$jscomp$180$$.priority = $newLayoutPriority$jscomp$2$$);
  });
  this.schedulePass();
};
$JSCompiler_prototypeAlias$$.schedulePass = function($opt_delay$jscomp$4$$) {
  return this.$pass_$.schedule($opt_delay$jscomp$4$$);
};
$JSCompiler_prototypeAlias$$.updateOrEnqueueMutateTask = function($resource$jscomp$24$$, $newRequest$jscomp$1$$) {
  for (var $request$jscomp$5$$ = null, $i$jscomp$83$$ = 0; $i$jscomp$83$$ < this.$requestsChangeSize_$.length; $i$jscomp$83$$++) {
    if (this.$requestsChangeSize_$[$i$jscomp$83$$].resource == $resource$jscomp$24$$) {
      $request$jscomp$5$$ = this.$requestsChangeSize_$[$i$jscomp$83$$];
      break;
    }
  }
  $request$jscomp$5$$ ? ($request$jscomp$5$$.newHeight = $newRequest$jscomp$1$$.newHeight, $request$jscomp$5$$.newWidth = $newRequest$jscomp$1$$.newWidth, $request$jscomp$5$$.marginChange = $newRequest$jscomp$1$$.marginChange, $request$jscomp$5$$.event = $newRequest$jscomp$1$$.event, $request$jscomp$5$$.force = $newRequest$jscomp$1$$.force || $request$jscomp$5$$.force, $request$jscomp$5$$.callback = $newRequest$jscomp$1$$.callback) : this.$requestsChangeSize_$.push($newRequest$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.schedulePassVsync = function() {
  var $$jscomp$this$jscomp$102$$ = this;
  this.$vsyncScheduled_$ || (this.$vsyncScheduled_$ = !0, this.$vsync_$.mutate(function() {
    return $$jscomp$this$jscomp$102$$.doPass();
  }));
};
$JSCompiler_prototypeAlias$$.ampInitComplete = function() {
  this.$maybeChangeHeight_$ = this.$ampInitialized_$ = !0;
  this.schedulePass();
};
$JSCompiler_prototypeAlias$$.setRelayoutTop = function($relayoutTop$jscomp$2$$) {
  this.$relayoutTop_$ = -1 == this.$relayoutTop_$ ? $relayoutTop$jscomp$2$$ : Math.min($relayoutTop$jscomp$2$$, this.$relayoutTop_$);
};
$JSCompiler_prototypeAlias$$.maybeHeightChanged = function() {
  this.$maybeChangeHeight_$ = !0;
};
$JSCompiler_prototypeAlias$$.onNextPass = function($callback$jscomp$87$$) {
  this.$passCallbacks_$.push($callback$jscomp$87$$);
};
$JSCompiler_prototypeAlias$$.doPass = function() {
  var $$jscomp$this$jscomp$103$$ = this;
  if (this.$isRuntimeOn_$) {
    this.$visible_$ = this.ampdoc.isVisible();
    this.$prerenderSize_$ = this.$viewer_$.getPrerenderSize();
    if (this.$documentReady_$ && this.$firstPassAfterDocumentReady_$) {
      this.$firstPassAfterDocumentReady_$ = !1;
      var $doc$jscomp$38_i$jscomp$84$$ = this.win.document, $documentInfo$$ = $Services$$module$src$services$documentInfoForDoc$$(this.ampdoc);
      this.$viewer_$.sendMessage("documentLoaded", $dict$$module$src$utils$object$$({title:$doc$jscomp$38_i$jscomp$84$$.title, sourceUrl:$getSourceUrl$$module$src$url$$(this.ampdoc.getUrl()), serverLayout:$doc$jscomp$38_i$jscomp$84$$.documentElement.hasAttribute("i-amphtml-element"), linkRels:$documentInfo$$.linkRels, metaTags:{viewport:$documentInfo$$.viewport}, viewport:$documentInfo$$.viewport}), !0);
      this.$contentHeight_$ = this.$viewport_$.getContentHeight();
      this.$viewer_$.sendMessage("documentHeight", $dict$$module$src$utils$object$$({height:this.$contentHeight_$}), !0);
    }
    this.$viewport_$.getSize();
    this.$pass_$.cancel();
    this.$vsyncScheduled_$ = !1;
    this.$visibilityStateMachine_$.setState(this.ampdoc.getVisibilityState());
    !this.$documentReady_$ || !this.$ampInitialized_$ || this.$intersectionObserver_$ && !this.$intersectionObserverCallbackFired_$ || this.ampdoc.signals().get("ready-scan") || this.ampdoc.signals().signal("ready-scan");
    this.$maybeChangeHeight_$ && (this.$maybeChangeHeight_$ = !1, this.$vsync_$.measure(function() {
      var $doc$jscomp$38_i$jscomp$84$$ = $$jscomp$this$jscomp$103$$.$viewport_$.getContentHeight();
      $doc$jscomp$38_i$jscomp$84$$ != $$jscomp$this$jscomp$103$$.$contentHeight_$ && ($$jscomp$this$jscomp$103$$.$viewer_$.sendMessage("documentHeight", $dict$$module$src$utils$object$$({height:$doc$jscomp$38_i$jscomp$84$$}), !0), $$jscomp$this$jscomp$103$$.$contentHeight_$ = $doc$jscomp$38_i$jscomp$84$$, $$jscomp$this$jscomp$103$$.$viewport_$.contentHeightChanged());
    }));
    for ($doc$jscomp$38_i$jscomp$84$$ = 0; $doc$jscomp$38_i$jscomp$84$$ < this.$passCallbacks_$.length; $doc$jscomp$38_i$jscomp$84$$++) {
      (0,this.$passCallbacks_$[$doc$jscomp$38_i$jscomp$84$$])();
    }
    this.$passCallbacks_$.length = 0;
  }
};
function $JSCompiler_StaticMethods_mutateWork_$$($JSCompiler_StaticMethods_mutateWork_$self$$) {
  var $$jscomp$loop$99_now$jscomp$6$$ = Date.now(), $viewportRect$$ = $JSCompiler_StaticMethods_mutateWork_$self$$.$viewport_$.getRect(), $topOffset$$ = $viewportRect$$.height / 10, $bottomOffset$$ = $viewportRect$$.height / 10, $isScrollingStopped$$ = 1e-2 > Math.abs($JSCompiler_StaticMethods_mutateWork_$self$$.$lastVelocity_$) && 500 < $$jscomp$loop$99_now$jscomp$6$$ - $JSCompiler_StaticMethods_mutateWork_$self$$.$lastScrollTime_$ || 1E3 < $$jscomp$loop$99_now$jscomp$6$$ - $JSCompiler_StaticMethods_mutateWork_$self$$.$lastScrollTime_$;
  if (0 < $JSCompiler_StaticMethods_mutateWork_$self$$.$requestsChangeSize_$.length) {
    var $requestsChangeSize$$ = $JSCompiler_StaticMethods_mutateWork_$self$$.$requestsChangeSize_$;
    $JSCompiler_StaticMethods_mutateWork_$self$$.$requestsChangeSize_$ = [];
    var $minTop$$ = -1, $scrollAdjSet$$ = [], $aboveVpHeightChange$$ = 0;
    $$jscomp$loop$99_now$jscomp$6$$ = {};
    for (var $i$jscomp$85$$ = 0; $i$jscomp$85$$ < $requestsChangeSize$$.length; $$jscomp$loop$99_now$jscomp$6$$ = {$$jscomp$loop$prop$resource$100$:$$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$resource$100$, $$jscomp$loop$prop$widthDiff$101$:$$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$widthDiff$101$, $$jscomp$loop$prop$request$102$:$$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$, $$jscomp$loop$prop$newMargins$103$:$$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$}, 
    $i$jscomp$85$$++) {
      $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$ = $requestsChangeSize$$[$i$jscomp$85$$];
      var $$jscomp$destructuring$var96_event$jscomp$37$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$;
      $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$resource$100$ = $$jscomp$destructuring$var96_event$jscomp$37$$.resource;
      $$jscomp$destructuring$var96_event$jscomp$37$$ = $$jscomp$destructuring$var96_event$jscomp$37$$.event;
      var $box$jscomp$6$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$resource$100$.getLayoutBox(), $topMarginDiff$$ = 0, $bottomMarginDiff$$ = 0, $leftMarginDiff$$ = 0, $rightMarginDiff$$ = 0, $$jscomp$destructuring$var97_margins$jscomp$1$$ = $box$jscomp$6$$, $topUnchangedBoundary$$ = $$jscomp$destructuring$var97_margins$jscomp$1$$.top, $bottomDisplacedBoundary$$ = $$jscomp$destructuring$var97_margins$jscomp$1$$.bottom;
      $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$ = void 0;
      $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.marginChange && ($$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.marginChange.newMargins, $$jscomp$destructuring$var97_margins$jscomp$1$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.marginChange.currentMargins, void 0 != $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.top && ($topMarginDiff$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.top - 
      $$jscomp$destructuring$var97_margins$jscomp$1$$.top), void 0 != $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.bottom && ($bottomMarginDiff$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.bottom - $$jscomp$destructuring$var97_margins$jscomp$1$$.bottom), void 0 != $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.left && ($leftMarginDiff$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.left - $$jscomp$destructuring$var97_margins$jscomp$1$$.left), 
      void 0 != $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.right && ($rightMarginDiff$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$.right - $$jscomp$destructuring$var97_margins$jscomp$1$$.right), $topMarginDiff$$ && ($topUnchangedBoundary$$ = $box$jscomp$6$$.top - $$jscomp$destructuring$var97_margins$jscomp$1$$.top), $bottomMarginDiff$$ && ($bottomDisplacedBoundary$$ = $box$jscomp$6$$.bottom + $$jscomp$destructuring$var97_margins$jscomp$1$$.bottom));
      var $heightDiff$$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newHeight - $box$jscomp$6$$.height;
      $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$widthDiff$101$ = $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newWidth - $box$jscomp$6$$.width;
      var $resize$$ = !1;
      if (0 != $heightDiff$$ || 0 != $topMarginDiff$$ || 0 != $bottomMarginDiff$$ || 0 != $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$widthDiff$101$ || 0 != $leftMarginDiff$$ || 0 != $rightMarginDiff$$) {
        if ($$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.force || !$JSCompiler_StaticMethods_mutateWork_$self$$.$visible_$) {
          $resize$$ = !0;
        } else {
          if ($JSCompiler_StaticMethods_mutateWork_$self$$.$activeHistory_$.hasDescendantsOf($$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$resource$100$.element) || $$jscomp$destructuring$var96_event$jscomp$37$$ && $$jscomp$destructuring$var96_event$jscomp$37$$.userActivation && $$jscomp$destructuring$var96_event$jscomp$37$$.userActivation.hasBeenActive) {
            $resize$$ = !0;
          } else {
            if ($topUnchangedBoundary$$ >= $viewportRect$$.bottom - $bottomOffset$$ || 0 == $topMarginDiff$$ && $box$jscomp$6$$.bottom + Math.min($heightDiff$$, 0) >= $viewportRect$$.bottom - $bottomOffset$$) {
              $resize$$ = !0;
            } else {
              if (1 < $viewportRect$$.top && $bottomDisplacedBoundary$$ <= $viewportRect$$.top + $topOffset$$) {
                if (0 > $heightDiff$$ && $viewportRect$$.top + $aboveVpHeightChange$$ < -$heightDiff$$) {
                  continue;
                }
                $isScrollingStopped$$ ? ($aboveVpHeightChange$$ += $heightDiff$$, $scrollAdjSet$$.push($$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$)) : $JSCompiler_StaticMethods_mutateWork_$self$$.$requestsChangeSize_$.push($$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$);
                continue;
              } else {
                $JSCompiler_StaticMethods_elementNearBottom_$$($JSCompiler_StaticMethods_mutateWork_$self$$, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$resource$100$, $box$jscomp$6$$) ? $resize$$ = !0 : 0 > $heightDiff$$ || 0 > $topMarginDiff$$ || 0 > $bottomMarginDiff$$ || ($$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newHeight == $box$jscomp$6$$.height ? $JSCompiler_StaticMethods_mutateWork_$self$$.$vsync_$.run({measure:function($JSCompiler_StaticMethods_mutateWork_$self$$) {
                  return function($$jscomp$loop$99_now$jscomp$6$$) {
                    $$jscomp$loop$99_now$jscomp$6$$.resize = !1;
                    var $viewportRect$$ = $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$resource$100$.element.parentElement;
                    if ($viewportRect$$) {
                      for (var $topOffset$$ = $viewportRect$$.getLayoutWidth && $viewportRect$$.getLayoutWidth() || $viewportRect$$.offsetWidth, $bottomOffset$$ = $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$widthDiff$101$, $isScrollingStopped$$ = 0; $isScrollingStopped$$ < $viewportRect$$.childElementCount; $isScrollingStopped$$++) {
                        if ($bottomOffset$$ += $viewportRect$$.children[$isScrollingStopped$$].offsetWidth, $bottomOffset$$ > $topOffset$$) {
                          return;
                        }
                      }
                      $$jscomp$loop$99_now$jscomp$6$$.resize = !0;
                    }
                  };
                }($$jscomp$loop$99_now$jscomp$6$$), mutate:function($JSCompiler_StaticMethods_mutateWork_$self$$) {
                  return function($$jscomp$loop$99_now$jscomp$6$$) {
                    $$jscomp$loop$99_now$jscomp$6$$.resize && $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$request$102$.resource.changeSize($JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$request$102$.newHeight, $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$request$102$.newWidth, $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$newMargins$103$);
                    $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$request$102$.resource.overflowCallback(!$$jscomp$loop$99_now$jscomp$6$$.resize, $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$request$102$.newHeight, $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$request$102$.newWidth, $JSCompiler_StaticMethods_mutateWork_$self$$.$$jscomp$loop$prop$newMargins$103$);
                  };
                }($$jscomp$loop$99_now$jscomp$6$$)}, {}) : $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.resource.overflowCallback(!0, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newHeight, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newWidth, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$));
              }
            }
          }
        }
      }
      $resize$$ && (0 <= $box$jscomp$6$$.top && ($minTop$$ = -1 == $minTop$$ ? $box$jscomp$6$$.top : Math.min($minTop$$, $box$jscomp$6$$.top)), $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.resource.changeSize($$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newHeight, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newWidth, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$), $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.resource.overflowCallback(!1, 
      $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newHeight, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.newWidth, $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$newMargins$103$), $JSCompiler_StaticMethods_mutateWork_$self$$.$maybeChangeHeight_$ = !0);
      $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.callback && $$jscomp$loop$99_now$jscomp$6$$.$$jscomp$loop$prop$request$102$.callback($resize$$);
    }
    -1 != $minTop$$ && $JSCompiler_StaticMethods_mutateWork_$self$$.setRelayoutTop($minTop$$);
    0 < $scrollAdjSet$$.length && $JSCompiler_StaticMethods_mutateWork_$self$$.$vsync_$.run({measure:function($$jscomp$loop$99_now$jscomp$6$$) {
      $$jscomp$loop$99_now$jscomp$6$$.scrollHeight = $JSCompiler_StaticMethods_mutateWork_$self$$.$viewport_$.getScrollHeight();
      $$jscomp$loop$99_now$jscomp$6$$.scrollTop = $JSCompiler_StaticMethods_mutateWork_$self$$.$viewport_$.getScrollTop();
    }, mutate:function($$jscomp$loop$99_now$jscomp$6$$) {
      var $viewportRect$$ = -1;
      $scrollAdjSet$$.forEach(function($JSCompiler_StaticMethods_mutateWork_$self$$) {
        var $$jscomp$loop$99_now$jscomp$6$$ = $JSCompiler_StaticMethods_mutateWork_$self$$.resource.getLayoutBox();
        $viewportRect$$ = -1 == $viewportRect$$ ? $$jscomp$loop$99_now$jscomp$6$$.top : Math.min($viewportRect$$, $$jscomp$loop$99_now$jscomp$6$$.top);
        $JSCompiler_StaticMethods_mutateWork_$self$$.resource.changeSize($JSCompiler_StaticMethods_mutateWork_$self$$.newHeight, $JSCompiler_StaticMethods_mutateWork_$self$$.newWidth, $JSCompiler_StaticMethods_mutateWork_$self$$.marginChange ? $JSCompiler_StaticMethods_mutateWork_$self$$.marginChange.newMargins : void 0);
        $JSCompiler_StaticMethods_mutateWork_$self$$.callback && $JSCompiler_StaticMethods_mutateWork_$self$$.callback(!0);
      });
      -1 != $viewportRect$$ && $JSCompiler_StaticMethods_mutateWork_$self$$.setRelayoutTop($viewportRect$$);
      var $topOffset$$ = $JSCompiler_StaticMethods_mutateWork_$self$$.$viewport_$.getScrollHeight();
      $topOffset$$ != $$jscomp$loop$99_now$jscomp$6$$.scrollHeight && $JSCompiler_StaticMethods_mutateWork_$self$$.$viewport_$.setScrollTop($$jscomp$loop$99_now$jscomp$6$$.scrollTop + ($topOffset$$ - $$jscomp$loop$99_now$jscomp$6$$.scrollHeight));
      $JSCompiler_StaticMethods_mutateWork_$self$$.$maybeChangeHeight_$ = !0;
    }}, {});
  }
}
function $JSCompiler_StaticMethods_elementNearBottom_$$($JSCompiler_StaticMethods_elementNearBottom_$self_threshold$jscomp$1$$, $resource$jscomp$25$$, $opt_layoutBox$$) {
  var $contentHeight$$ = $JSCompiler_StaticMethods_elementNearBottom_$self_threshold$jscomp$1$$.$viewport_$.getContentHeight();
  $JSCompiler_StaticMethods_elementNearBottom_$self_threshold$jscomp$1$$ = Math.max(0.85 * $contentHeight$$, $contentHeight$$ - 1000);
  var $box$jscomp$8$$ = $opt_layoutBox$$ || $resource$jscomp$25$$.getLayoutBox(), $initialBox$$ = $resource$jscomp$25$$.getInitialLayoutBox();
  return $box$jscomp$8$$.bottom >= $JSCompiler_StaticMethods_elementNearBottom_$self_threshold$jscomp$1$$ || $initialBox$$.bottom >= $JSCompiler_StaticMethods_elementNearBottom_$self_threshold$jscomp$1$$;
}
function $JSCompiler_StaticMethods_measureResource_$$($r$jscomp$7$$, $usePremeasuredRect$jscomp$2$$) {
  $usePremeasuredRect$jscomp$2$$ = void 0 === $usePremeasuredRect$jscomp$2$$ ? !1 : $usePremeasuredRect$jscomp$2$$;
  var $wasDisplayed$$ = $r$jscomp$7$$.isDisplayed();
  $r$jscomp$7$$.measure($usePremeasuredRect$jscomp$2$$);
  return !($wasDisplayed$$ && !$r$jscomp$7$$.isDisplayed());
}
function $JSCompiler_StaticMethods_unloadResources_$$($JSCompiler_StaticMethods_unloadResources_$self$$, $resources$jscomp$4$$) {
  $resources$jscomp$4$$.length && $JSCompiler_StaticMethods_unloadResources_$self$$.$vsync_$.mutate(function() {
    $resources$jscomp$4$$.forEach(function($resources$jscomp$4$$) {
      $resources$jscomp$4$$.unload();
      $JSCompiler_StaticMethods_cleanupTasks_$$($JSCompiler_StaticMethods_unloadResources_$self$$, $resources$jscomp$4$$);
    });
  });
}
$JSCompiler_prototypeAlias$$.$calcTaskScore_$ = function($task$jscomp$8$$) {
  var $viewport$jscomp$7$$ = this.$viewport_$.getRect(), $box$jscomp$9$$ = $task$jscomp$8$$.resource.getLayoutBox(), $posPriority$$ = Math.floor(($box$jscomp$9$$.top - $viewport$jscomp$7$$.top) / $viewport$jscomp$7$$.height);
  Math.sign($posPriority$$) != this.getScrollDirection() && ($posPriority$$ *= 2);
  $posPriority$$ = Math.abs($posPriority$$);
  return 10 * $task$jscomp$8$$.priority + $posPriority$$;
};
function $JSCompiler_StaticMethods_calcTaskTimeout_$$($JSCompiler_StaticMethods_calcTaskTimeout_$self$$, $task$jscomp$9$$) {
  var $now$jscomp$9$$ = Date.now();
  if (0 == $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$exec_$.getSize()) {
    return -1 === $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$firstVisibleTime_$ ? 0 : Math.max(1000 * $task$jscomp$9$$.priority - ($now$jscomp$9$$ - $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$firstVisibleTime_$), 0);
  }
  var $timeout$jscomp$6$$ = 0;
  $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.$exec_$.forEach(function($JSCompiler_StaticMethods_calcTaskTimeout_$self$$) {
    $timeout$jscomp$6$$ = Math.max($timeout$jscomp$6$$, Math.max(1000 * ($task$jscomp$9$$.priority - $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.priority), 0) - ($now$jscomp$9$$ - $JSCompiler_StaticMethods_calcTaskTimeout_$self$$.startTime));
  });
  return $timeout$jscomp$6$$;
}
$JSCompiler_prototypeAlias$$.$reschedule_$ = function($task$jscomp$10$$) {
  this.$queue_$.getTaskById($task$jscomp$10$$.id) || this.$queue_$.enqueue($task$jscomp$10$$);
};
$JSCompiler_prototypeAlias$$.$taskComplete_$ = function($task$jscomp$11$$, $success$jscomp$3$$, $opt_reason$jscomp$2$$) {
  this.$exec_$.dequeue($task$jscomp$11$$);
  this.schedulePass(1000);
  if (!$success$jscomp$3$$) {
    return $dev$$module$src$log$$().info("Resources", "task failed:", $task$jscomp$11$$.id, $task$jscomp$11$$.resource.debugid, $opt_reason$jscomp$2$$), Promise.reject($opt_reason$jscomp$2$$);
  }
};
function $JSCompiler_StaticMethods_isLayoutAllowed_$$($JSCompiler_StaticMethods_isLayoutAllowed_$self$$, $resource$jscomp$27$$, $forceOutsideViewport$$) {
  return 0 != $resource$jscomp$27$$.getState() && $resource$jscomp$27$$.isDisplayed() && ($JSCompiler_StaticMethods_isLayoutAllowed_$self$$.$visible_$ || "prerender" == $JSCompiler_StaticMethods_isLayoutAllowed_$self$$.ampdoc.getVisibilityState() && $resource$jscomp$27$$.prerenderAllowed()) && ($forceOutsideViewport$$ || $resource$jscomp$27$$.isInViewport() || $resource$jscomp$27$$.renderOutsideViewport()) ? !0 : !1;
}
$JSCompiler_prototypeAlias$$.scheduleLayoutOrPreload = function($resource$jscomp$28$$, $layout$jscomp$9$$, $opt_parentPriority$jscomp$4$$, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$jscomp$1$$) {
  var $isBuilt$$ = 0 != $resource$jscomp$28$$.getState(), $isDisplayed$jscomp$1$$ = $resource$jscomp$28$$.isDisplayed();
  $isBuilt$$ && $isDisplayed$jscomp$1$$ || $devAssert$$module$src$log$$(!1);
  $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$jscomp$1$$ = $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$jscomp$1$$ || !1;
  $JSCompiler_StaticMethods_isLayoutAllowed_$$(this, $resource$jscomp$28$$, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$jscomp$1$$) && ($layout$jscomp$9$$ ? this.$schedule_$($resource$jscomp$28$$, "L", 0, $opt_parentPriority$jscomp$4$$ || 0, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$jscomp$1$$, $resource$jscomp$28$$.startLayout.bind($resource$jscomp$28$$)) : this.$schedule_$($resource$jscomp$28$$, "P", 2, $opt_parentPriority$jscomp$4$$ || 0, $forceOutsideViewport$jscomp$1_opt_forceOutsideViewport$jscomp$1$$, 
  $resource$jscomp$28$$.startLayout.bind($resource$jscomp$28$$)));
};
$JSCompiler_prototypeAlias$$.$schedule_$ = function($resource$jscomp$29_task$jscomp$12$$, $localId$jscomp$1_taskId$jscomp$1$$, $priorityOffset$$, $parentPriority$$, $forceOutsideViewport$jscomp$2$$, $callback$jscomp$88$$) {
  $localId$jscomp$1_taskId$jscomp$1$$ = $resource$jscomp$29_task$jscomp$12$$.getTaskId($localId$jscomp$1_taskId$jscomp$1$$);
  $resource$jscomp$29_task$jscomp$12$$ = {id:$localId$jscomp$1_taskId$jscomp$1$$, resource:$resource$jscomp$29_task$jscomp$12$$, priority:Math.max($resource$jscomp$29_task$jscomp$12$$.getLayoutPriority(), $parentPriority$$) + $priorityOffset$$, forceOutsideViewport:$forceOutsideViewport$jscomp$2$$, callback:$callback$jscomp$88$$, scheduleTime:Date.now(), startTime:0, promise:null};
  var $queued$$ = this.$queue_$.getTaskById($localId$jscomp$1_taskId$jscomp$1$$);
  if (!$queued$$ || $resource$jscomp$29_task$jscomp$12$$.priority < $queued$$.priority) {
    $queued$$ && this.$queue_$.dequeue($queued$$), this.$queue_$.enqueue($resource$jscomp$29_task$jscomp$12$$), this.schedulePass($JSCompiler_StaticMethods_calcTaskTimeout_$$(this, $resource$jscomp$29_task$jscomp$12$$));
  }
  $resource$jscomp$29_task$jscomp$12$$.resource.layoutScheduled($resource$jscomp$29_task$jscomp$12$$.scheduleTime);
};
$JSCompiler_prototypeAlias$$.whenFirstPass = function() {
  return this.$firstPassDone_$.promise;
};
function $JSCompiler_StaticMethods_setupVisibilityStateMachine_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $vsm$$) {
  function $resume$$() {
    $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.forEach(function($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$) {
      return $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.resume();
    });
    $doWork$$();
  }
  function $unload$$() {
    $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.forEach(function($vsm$$) {
      $vsm$$.unload();
      $JSCompiler_StaticMethods_cleanupTasks_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $vsm$$);
    });
    try {
      $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.win.getSelection().removeAllRanges();
    } catch ($JSCompiler_e$jscomp$inline_641$$) {
    }
  }
  function $pause$$() {
    $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.forEach(function($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$) {
      return $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.pause();
    });
  }
  function $noop$$() {
  }
  function $doWork$$() {
    var $vsm$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$viewport_$.getSize();
    if (0 < $vsm$$.height && 0 < $vsm$$.width) {
      0 < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$requestsChangeSize_$.length && $JSCompiler_StaticMethods_mutateWork_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$);
      $vsm$$ = Date.now();
      var $resume$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$relayoutAll_$;
      $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$relayoutAll_$ = !1;
      var $unload$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$relayoutTop_$;
      $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$relayoutTop_$ = -1;
      for (var $pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$elementsThatScrolled_$, $noop$$ = 0, $doWork$$ = 0, $JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$ = 0; $JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$ < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.length; $JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$++) {
        var $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$[$JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$];
        0 != $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$.getState() || $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$.isBuilding() || $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$, !0);
        if ($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$intersectionObserver_$) {
          $resume$$ && $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$.applySizesAndMediaQuery();
        } else {
          if ($resume$$ || !$JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$.hasBeenMeasured() || 1 == $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$.getState()) {
            $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$.applySizesAndMediaQuery(), $noop$$++;
          }
        }
        $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$.isMeasureRequested() && $doWork$$++;
      }
      var $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$;
      if ($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$intersectionObserver_$) {
        for ($resume$$ = 0; $resume$$ < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.length; $resume$$++) {
          $unload$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$[$resume$$], $unload$$.hasOwner() || ($noop$$ = $unload$$.isMeasureRequested(), (($doWork$$ = $unload$$.hasBeenPremeasured()) || $noop$$ || $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$relayoutAll_$) && !$JSCompiler_StaticMethods_measureResource_$$($unload$$, $doWork$$) && ($devAssert$$module$src$log$$(0 != $unload$$.getState()), $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ || 
          ($JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ = []), $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$.push($unload$$)));
        }
      } else {
        if (0 < $noop$$ || 0 < $doWork$$ || $resume$$ || -1 != $unload$$ || 0 < $pause$$.length) {
          for ($noop$$ = 0; $noop$$ < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.length; $noop$$++) {
            if ($doWork$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$[$noop$$], !$doWork$$.hasOwner() || $doWork$$.isMeasureRequested()) {
              $JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$ = $resume$$ || 1 == $doWork$$.getState() || !$doWork$$.hasBeenMeasured() || $doWork$$.isMeasureRequested() || -1 != $unload$$ && $doWork$$.getLayoutBox().bottom >= $unload$$;
              if (!$JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$) {
                for ($JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$ = 0; $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$ < $pause$$.length; $JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$++) {
                  if ($pause$$[$JSCompiler_r$jscomp$inline_607_i$50$jscomp$inline_616$$].contains($doWork$$.element)) {
                    $JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$ = !0;
                    break;
                  }
                }
              }
              $JSCompiler_i$jscomp$inline_606_needsMeasure$49$jscomp$inline_615$$ && !$JSCompiler_StaticMethods_measureResource_$$($doWork$$) && ($JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ || ($JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ = []), $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$.push($doWork$$));
            }
          }
        }
      }
      $pause$$.length = 0;
      $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ && $JSCompiler_StaticMethods_unloadResources_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$);
      $pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$viewport_$.getRect();
      $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$visible_$ ? $expandLayoutRect$$module$src$layout_rect$$($pause$$, 0.25, 2) : 0 < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$prerenderSize_$ ? $expandLayoutRect$$module$src$layout_rect$$($pause$$, 0, $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$prerenderSize_$ - 
      1) : null;
      $pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$visible_$ ? $expandLayoutRect$$module$src$layout_rect$$($pause$$, 0.25, 0.25) : $pause$$;
      for ($resume$$ = 0; $resume$$ < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.length; $resume$$++) {
        $unload$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$[$resume$$], 0 == $unload$$.getState() || $unload$$.hasOwner() || ($noop$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$visible_$ && $unload$$.isDisplayed() && $unload$$.overlaps($pause$$), $unload$$.setInViewport($noop$$));
      }
      if ($JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$) {
        for ($pause$$ = 0; $pause$$ < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.length; $pause$$++) {
          $resume$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$[$pause$$];
          debugger;
          !$resume$$.isBuilt() && !$resume$$.hasOwner() && $resume$$.hasBeenMeasured() && $resume$$.isDisplayed() && $resume$$.overlaps($JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$) && $JSCompiler_StaticMethods_buildOrScheduleBuildForResource_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $resume$$, !0, !0);
          if (2 == $resume$$.getState() && !$resume$$.hasOwner() && $resume$$.isDisplayed() && $resume$$.overlaps($JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$)) {
            debugger;
            $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.scheduleLayoutOrPreload($resume$$, !0);
          }
        }
      }
      if (!$JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$intersectionObserver_$ && $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$visible_$ && 0 == $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$exec_$.getSize() && 0 == $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$queue_$.getSize() && $vsm$$ > $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$exec_$.getLastDequeueTime() + 5000) {
        for ($JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ = $vsm$$ = 0; $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$.length && 4 > $vsm$$; $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$++) {
          $pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$resources_$[$JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$], 2 == $pause$$.getState() && !$pause$$.hasOwner() && $pause$$.isDisplayed() && ($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.scheduleLayoutOrPreload($pause$$, !1), $vsm$$++);
        }
      }
      $vsm$$ = Date.now();
      $resume$$ = -1;
      $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$ = Object.create(null);
      for ($pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$queue_$.peek($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$boundTaskScorer_$, $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$); $pause$$;) {
        $resume$$ = $JSCompiler_StaticMethods_calcTaskTimeout_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $pause$$);
        if (16 < $resume$$) {
          break;
        }
        $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$queue_$.dequeue($pause$$);
        ($resume$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$exec_$.getTaskById($pause$$.id)) ? ($pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$reschedule_$.bind($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $pause$$), $resume$$.promise.then($pause$$, $pause$$)) : ($resume$$ = $pause$$.resource, $unload$$ = !0, $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$intersectionObserver_$ ? $resume$$.hasBeenPremeasured() && 
        ($unload$$ = $resume$$.isDisplayed(!0)) : $resume$$.measure(), $unload$$ && $JSCompiler_StaticMethods_isLayoutAllowed_$$($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $resume$$, $pause$$.forceOutsideViewport) ? ($pause$$.promise = $pause$$.callback(), $pause$$.startTime = $vsm$$, $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$exec_$.enqueue($pause$$), $pause$$.promise.then($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$taskComplete_$.bind($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, 
        $pause$$, !0), $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$taskComplete_$.bind($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$, $pause$$, !1)).catch($reportError$$module$src$error$$)) : $resume$$.layoutCanceled());
        $pause$$ = $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$queue_$.peek($JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$boundTaskScorer_$, $JSCompiler_loadRect$jscomp$inline_618_JSCompiler_state$jscomp$inline_632_JSCompiler_toUnload$jscomp$inline_608_i$56$jscomp$inline_626$$);
        $resume$$ = -1;
      }
      0 <= $resume$$ ? $vsm$$ = $resume$$ : ($vsm$$ = 2 * ($vsm$$ - $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$exec_$.getLastDequeueTime()), $vsm$$ = Math.max(Math.min(30000, $vsm$$), 5000));
      0 < $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$requestsChangeSize_$.length && ($vsm$$ = Math.min($vsm$$, 500));
      $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$visible_$ && $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.schedulePass($vsm$$);
      $JSCompiler_StaticMethods_setupVisibilityStateMachine_$self$$.$firstPassDone_$.resolve();
    }
  }
  $vsm$$.addTransition("prerender", "prerender", $doWork$$);
  $vsm$$.addTransition("prerender", "visible", $doWork$$);
  $vsm$$.addTransition("prerender", "hidden", $doWork$$);
  $vsm$$.addTransition("prerender", "inactive", $doWork$$);
  $vsm$$.addTransition("prerender", "paused", $doWork$$);
  $vsm$$.addTransition("visible", "visible", $doWork$$);
  $vsm$$.addTransition("visible", "hidden", $doWork$$);
  $vsm$$.addTransition("visible", "inactive", $unload$$);
  $vsm$$.addTransition("visible", "paused", $pause$$);
  $vsm$$.addTransition("hidden", "visible", $doWork$$);
  $vsm$$.addTransition("hidden", "hidden", $doWork$$);
  $vsm$$.addTransition("hidden", "inactive", $unload$$);
  $vsm$$.addTransition("hidden", "paused", $pause$$);
  $vsm$$.addTransition("inactive", "visible", $resume$$);
  $vsm$$.addTransition("inactive", "hidden", $resume$$);
  $vsm$$.addTransition("inactive", "inactive", $noop$$);
  $vsm$$.addTransition("inactive", "paused", $doWork$$);
  $vsm$$.addTransition("paused", "visible", $resume$$);
  $vsm$$.addTransition("paused", "hidden", $doWork$$);
  $vsm$$.addTransition("paused", "inactive", $unload$$);
  $vsm$$.addTransition("paused", "paused", $noop$$);
}
function $JSCompiler_StaticMethods_cleanupTasks_$$($JSCompiler_StaticMethods_cleanupTasks_$self$$, $resource$jscomp$30$$, $opt_removePending$$) {
  1 == $resource$jscomp$30$$.getState() && ($JSCompiler_StaticMethods_cleanupTasks_$self$$.$queue_$.purge(function($JSCompiler_StaticMethods_cleanupTasks_$self$$) {
    return $JSCompiler_StaticMethods_cleanupTasks_$self$$.resource == $resource$jscomp$30$$;
  }), $JSCompiler_StaticMethods_cleanupTasks_$self$$.$exec_$.purge(function($JSCompiler_StaticMethods_cleanupTasks_$self$$) {
    return $JSCompiler_StaticMethods_cleanupTasks_$self$$.resource == $resource$jscomp$30$$;
  }), $remove$$module$src$utils$array$$($JSCompiler_StaticMethods_cleanupTasks_$self$$.$requestsChangeSize_$, function($JSCompiler_StaticMethods_cleanupTasks_$self$$) {
    return $JSCompiler_StaticMethods_cleanupTasks_$self$$.resource === $resource$jscomp$30$$;
  }));
  if (0 == $resource$jscomp$30$$.getState() && $opt_removePending$$ && $JSCompiler_StaticMethods_cleanupTasks_$self$$.$pendingBuildResources_$) {
    var $pendingIndex$$ = $JSCompiler_StaticMethods_cleanupTasks_$self$$.$pendingBuildResources_$.indexOf($resource$jscomp$30$$);
    -1 != $pendingIndex$$ && $JSCompiler_StaticMethods_cleanupTasks_$self$$.$pendingBuildResources_$.splice($pendingIndex$$, 1);
  }
}
;var $AMP_CSS_RE$$module$src$service$standard_actions_impl$$ = /^i-amphtml-/;
function $StandardActions$$module$src$service$standard_actions_impl$$($JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$, $context$jscomp$6_opt_win$jscomp$1$$) {
  this.ampdoc = $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$;
  $context$jscomp$6_opt_win$jscomp$1$$ = $context$jscomp$6_opt_win$jscomp$1$$ ? $context$jscomp$6_opt_win$jscomp$1$$.document.documentElement : $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.getHeadNode();
  this.$mutator_$ = $Services$$module$src$services$mutatorForDoc$$($JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$);
  this.$viewport_$ = $Services$$module$src$services$viewportForDoc$$($JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$);
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($context$jscomp$6_opt_win$jscomp$1$$, "action");
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.addGlobalTarget("AMP", this.$handleAmpTarget_$.bind(this));
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.addGlobalMethodHandler("hide", this.$handleHide_$.bind(this));
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.addGlobalMethodHandler("show", this.$handleShow_$.bind(this));
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.addGlobalMethodHandler("toggleVisibility", this.$handleToggle_$.bind(this));
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.addGlobalMethodHandler("scrollTo", this.$handleScrollTo_$.bind(this));
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.addGlobalMethodHandler("focus", this.$handleFocus_$.bind(this));
  $JSCompiler_actionService$jscomp$inline_644_ampdoc$jscomp$68$$.addGlobalMethodHandler("toggleClass", this.$handleToggleClass_$.bind(this));
}
$StandardActions$$module$src$service$standard_actions_impl$$.installInEmbedWindow = function($embedWin$jscomp$6$$, $ampdoc$jscomp$69$$) {
  $installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$6$$, "standard-actions", new $StandardActions$$module$src$service$standard_actions_impl$$($ampdoc$jscomp$69$$, $embedWin$jscomp$6$$));
};
$JSCompiler_prototypeAlias$$ = $StandardActions$$module$src$service$standard_actions_impl$$.prototype;
$JSCompiler_prototypeAlias$$.$handleAmpTarget_$ = function($invocation$jscomp$9$$) {
  if (!$invocation$jscomp$9$$.satisfiesTrust(2)) {
    return null;
  }
  var $node$jscomp$25$$ = $invocation$jscomp$9$$.node, $method$jscomp$13$$ = $invocation$jscomp$9$$.method, $args$jscomp$13$$ = $invocation$jscomp$9$$.args, $win$jscomp$191$$ = ($node$jscomp$25$$.ownerDocument || $node$jscomp$25$$).defaultView;
  switch($method$jscomp$13$$) {
    case "pushState":
    case "setState":
      return $getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($node$jscomp$25$$.nodeType === Node.DOCUMENT_NODE ? $node$jscomp$25$$.documentElement : $node$jscomp$25$$).then(function($node$jscomp$25$$) {
        $userAssert$$module$src$log$$($node$jscomp$25$$, "AMP-BIND is not installed.");
        return $node$jscomp$25$$.invoke($invocation$jscomp$9$$);
      });
    case "navigateTo":
      return $JSCompiler_StaticMethods_handleNavigateTo_$$(this, $invocation$jscomp$9$$);
    case "closeOrNavigateTo":
      return $JSCompiler_StaticMethods_handleCloseOrNavigateTo_$$(this, $invocation$jscomp$9$$);
    case "scrollTo":
      return $userAssert$$module$src$log$$($args$jscomp$13$$.id, "AMP.scrollTo must provide element ID"), $invocation$jscomp$9$$.node = $getAmpdoc$$module$src$service$$($node$jscomp$25$$).getElementById($args$jscomp$13$$.id), this.$handleScrollTo_$($invocation$jscomp$9$$);
    case "goBack":
      return $getServiceForDoc$$module$src$service$$(this.ampdoc, "history").goBack(), null;
    case "print":
      return $win$jscomp$191$$.print(), null;
    case "optoutOfCid":
      return $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$(this.ampdoc), "cid").then(function($invocation$jscomp$9$$) {
        return $invocation$jscomp$9$$.optOut();
      }).catch(function($invocation$jscomp$9$$) {
        $dev$$module$src$log$$().error("STANDARD-ACTIONS", "Failed to opt out of CID", $invocation$jscomp$9$$);
      });
  }
  throw $user$$module$src$log$$().createError("Unknown AMP action ", $method$jscomp$13$$);
};
function $JSCompiler_StaticMethods_handleNavigateTo_$$($JSCompiler_StaticMethods_handleNavigateTo_$self$$, $invocation$jscomp$10_permission$jscomp$1$$) {
  var $node$jscomp$26$$ = $invocation$jscomp$10_permission$jscomp$1$$.node, $caller$jscomp$2$$ = $invocation$jscomp$10_permission$jscomp$1$$.caller, $method$jscomp$14$$ = $invocation$jscomp$10_permission$jscomp$1$$.method, $args$jscomp$14$$ = $invocation$jscomp$10_permission$jscomp$1$$.args, $win$jscomp$192$$ = ($node$jscomp$26$$.ownerDocument || $node$jscomp$26$$).defaultView;
  $invocation$jscomp$10_permission$jscomp$1$$ = $resolvedPromise$$module$src$resolved_promise$$();
  $startsWith$$module$src$string$$($caller$jscomp$2$$.tagName, "AMP-") && ($invocation$jscomp$10_permission$jscomp$1$$ = $caller$jscomp$2$$.getImpl().then(function($JSCompiler_StaticMethods_handleNavigateTo_$self$$) {
    "function" == typeof $JSCompiler_StaticMethods_handleNavigateTo_$self$$.throwIfCannotNavigate && $JSCompiler_StaticMethods_handleNavigateTo_$self$$.throwIfCannotNavigate();
  }));
  return $invocation$jscomp$10_permission$jscomp$1$$.then(function() {
    $getServiceForDoc$$module$src$service$$($JSCompiler_StaticMethods_handleNavigateTo_$self$$.ampdoc, "navigation").navigateTo($win$jscomp$192$$, $args$jscomp$14$$.url, "AMP." + $method$jscomp$14$$, {target:$args$jscomp$14$$.target, opener:$args$jscomp$14$$.opener});
  }, function($JSCompiler_StaticMethods_handleNavigateTo_$self$$) {
    $user$$module$src$log$$().error("STANDARD-ACTIONS", $JSCompiler_StaticMethods_handleNavigateTo_$self$$.message);
  });
}
function $JSCompiler_StaticMethods_handleCloseOrNavigateTo_$$($JSCompiler_StaticMethods_handleCloseOrNavigateTo_$self$$, $invocation$jscomp$11$$) {
  var $node$jscomp$27_win$jscomp$193$$ = $invocation$jscomp$11$$.node;
  $node$jscomp$27_win$jscomp$193$$ = ($node$jscomp$27_win$jscomp$193$$.ownerDocument || $node$jscomp$27_win$jscomp$193$$).defaultView;
  var $hasParent$$ = $node$jscomp$27_win$jscomp$193$$.parent != $node$jscomp$27_win$jscomp$193$$, $wasClosed$$ = !1;
  $node$jscomp$27_win$jscomp$193$$.opener && $JSCompiler_StaticMethods_handleCloseOrNavigateTo_$self$$.ampdoc.isSingleDoc() && !$hasParent$$ && ($node$jscomp$27_win$jscomp$193$$.close(), $wasClosed$$ = $node$jscomp$27_win$jscomp$193$$.closed);
  return $wasClosed$$ ? $resolvedPromise$$module$src$resolved_promise$$() : $JSCompiler_StaticMethods_handleNavigateTo_$$($JSCompiler_StaticMethods_handleCloseOrNavigateTo_$self$$, $invocation$jscomp$11$$);
}
$JSCompiler_prototypeAlias$$.$handleScrollTo_$ = function($args$jscomp$15_invocation$jscomp$12$$) {
  var $node$jscomp$28$$ = $args$jscomp$15_invocation$jscomp$12$$.node, $posOrUndef$$ = ($args$jscomp$15_invocation$jscomp$12$$ = $args$jscomp$15_invocation$jscomp$12$$.args) && $args$jscomp$15_invocation$jscomp$12$$.position, $durationOrUndef$$ = $args$jscomp$15_invocation$jscomp$12$$ && $args$jscomp$15_invocation$jscomp$12$$.duration;
  $posOrUndef$$ && !["top", "bottom", "center"].includes($posOrUndef$$) && ($posOrUndef$$ = void 0);
  $isFiniteNumber$$module$src$types$$($durationOrUndef$$) || ($durationOrUndef$$ = void 0);
  return this.$viewport_$.animateScrollIntoView($node$jscomp$28$$, $posOrUndef$$, $durationOrUndef$$);
};
$JSCompiler_prototypeAlias$$.$handleFocus_$ = function($invocation$jscomp$13$$) {
  $tryFocus$$module$src$dom$$($invocation$jscomp$13$$.node);
  return null;
};
$JSCompiler_prototypeAlias$$.$handleHide_$ = function($invocation$jscomp$14$$) {
  var $target$jscomp$128$$ = $invocation$jscomp$14$$.node;
  $target$jscomp$128$$.classList.contains("i-amphtml-element") ? this.$mutator_$.mutateElement($target$jscomp$128$$, function() {
    return $target$jscomp$128$$.collapse();
  }, !0) : this.$mutator_$.mutateElement($target$jscomp$128$$, function() {
    return $toggle$$module$src$style$$($target$jscomp$128$$, !1);
  });
  return null;
};
$JSCompiler_prototypeAlias$$.$handleShow_$ = function($invocation$jscomp$15$$) {
  var $target$jscomp$129$$ = $invocation$jscomp$15$$.node, $ownerWindow$$ = $target$jscomp$129$$.ownerDocument.defaultView;
  if ($target$jscomp$129$$.classList.contains("i-amphtml-layout-nodisplay")) {
    return $user$$module$src$log$$().warn("STANDARD-ACTIONS", "Elements with layout=nodisplay cannot be dynamically shown.", $target$jscomp$129$$), null;
  }
  this.$mutator_$.measureElement(function() {
    "none" != $computedStyle$$module$src$style$$($ownerWindow$$, $target$jscomp$129$$).display || $target$jscomp$129$$.hasAttribute("hidden") || $user$$module$src$log$$().warn("STANDARD-ACTIONS", 'Elements can only be dynamically shown when they have the "hidden" attribute set or when they were dynamically hidden.', $target$jscomp$129$$);
  });
  var $autofocusElOrNull$$ = $target$jscomp$129$$.hasAttribute("autofocus") ? $target$jscomp$129$$ : $target$jscomp$129$$.querySelector("[autofocus]");
  $autofocusElOrNull$$ && $Services$$module$src$services$platformFor$$($ownerWindow$$).isIos() ? ($JSCompiler_StaticMethods_handleShowSync_$$($target$jscomp$129$$, $autofocusElOrNull$$), this.$mutator_$.mutateElement($target$jscomp$129$$, function() {
  })) : this.$mutator_$.mutateElement($target$jscomp$129$$, function() {
    $JSCompiler_StaticMethods_handleShowSync_$$($target$jscomp$129$$, $autofocusElOrNull$$);
  });
  return null;
};
function $JSCompiler_StaticMethods_handleShowSync_$$($target$jscomp$130$$, $autofocusElOrNull$jscomp$1$$) {
  $target$jscomp$130$$.classList.contains("i-amphtml-element") ? $target$jscomp$130$$.expand() : $toggle$$module$src$style$$($target$jscomp$130$$, !0);
  $autofocusElOrNull$jscomp$1$$ && $tryFocus$$module$src$dom$$($autofocusElOrNull$jscomp$1$$);
}
$JSCompiler_prototypeAlias$$.$handleToggle_$ = function($invocation$jscomp$16$$) {
  return $invocation$jscomp$16$$.node.hasAttribute("hidden") ? this.$handleShow_$($invocation$jscomp$16$$) : this.$handleHide_$($invocation$jscomp$16$$);
};
$JSCompiler_prototypeAlias$$.$handleToggleClass_$ = function($invocation$jscomp$17$$) {
  var $target$jscomp$131$$ = $invocation$jscomp$17$$.node, $args$jscomp$16$$ = $invocation$jscomp$17$$.args, $className$$ = $user$$module$src$log$$().assertString($args$jscomp$16$$["class"], "Argument 'class' must be a string.");
  if ($AMP_CSS_RE$$module$src$service$standard_actions_impl$$.test($className$$)) {
    return null;
  }
  this.$mutator_$.mutateElement($target$jscomp$131$$, function() {
    if (void 0 !== $args$jscomp$16$$.force) {
      var $invocation$jscomp$17$$ = $user$$module$src$log$$().assertBoolean($args$jscomp$16$$.force, "Optional argument 'force' must be a boolean.");
      $target$jscomp$131$$.classList.toggle($className$$, $invocation$jscomp$17$$);
    } else {
      $target$jscomp$131$$.classList.toggle($className$$);
    }
  });
  return null;
};
function $Storage$$module$src$service$storage_impl$$($ampdoc$jscomp$71$$, $viewer$jscomp$12$$, $binding$jscomp$2$$) {
  this.ampdoc = $ampdoc$jscomp$71$$;
  this.$viewer_$ = $viewer$jscomp$12$$;
  this.$binding_$ = $binding$jscomp$2$$;
  this.$origin_$ = $getSourceOrigin$$module$src$url$$(this.ampdoc.win.location);
  this.$storePromise_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Storage$$module$src$service$storage_impl$$.prototype;
$JSCompiler_prototypeAlias$$.get = function($name$jscomp$121$$) {
  return $JSCompiler_StaticMethods_getStore_$$(this).then(function($store$$) {
    return $store$$.get($name$jscomp$121$$);
  });
};
$JSCompiler_prototypeAlias$$.set = function($name$jscomp$122$$, $value$jscomp$134$$, $opt_isUpdate$$) {
  $devAssert$$module$src$log$$("boolean" == typeof $value$jscomp$134$$);
  return this.setNonBoolean($name$jscomp$122$$, $value$jscomp$134$$, $opt_isUpdate$$);
};
$JSCompiler_prototypeAlias$$.setNonBoolean = function($name$jscomp$123$$, $value$jscomp$135$$, $opt_isUpdate$jscomp$1$$) {
  return $JSCompiler_StaticMethods_saveStore_$$(this, function($store$jscomp$1$$) {
    return $store$jscomp$1$$.set($name$jscomp$123$$, $value$jscomp$135$$, $opt_isUpdate$jscomp$1$$);
  });
};
$JSCompiler_prototypeAlias$$.remove = function($name$jscomp$124$$) {
  return $JSCompiler_StaticMethods_saveStore_$$(this, function($store$jscomp$2$$) {
    return $store$jscomp$2$$.remove($name$jscomp$124$$);
  });
};
function $JSCompiler_StaticMethods_getStore_$$($JSCompiler_StaticMethods_getStore_$self$$) {
  $JSCompiler_StaticMethods_getStore_$self$$.$storePromise_$ || ($JSCompiler_StaticMethods_getStore_$self$$.$storePromise_$ = $JSCompiler_StaticMethods_getStore_$self$$.$binding_$.loadBlob($JSCompiler_StaticMethods_getStore_$self$$.$origin_$).then(function($JSCompiler_StaticMethods_getStore_$self$$) {
    return $JSCompiler_StaticMethods_getStore_$self$$ ? $parseJson$$module$src$json$$(atob($JSCompiler_StaticMethods_getStore_$self$$)) : {};
  }).catch(function($JSCompiler_StaticMethods_getStore_$self$$) {
    $dev$$module$src$log$$().expectedError("Storage", "Failed to load store: ", $JSCompiler_StaticMethods_getStore_$self$$);
    return {};
  }).then(function($JSCompiler_StaticMethods_getStore_$self$$) {
    return new $Store$$module$src$service$storage_impl$$($JSCompiler_StaticMethods_getStore_$self$$);
  }));
  return $JSCompiler_StaticMethods_getStore_$self$$.$storePromise_$;
}
function $JSCompiler_StaticMethods_saveStore_$$($JSCompiler_StaticMethods_saveStore_$self$$, $mutator$jscomp$11$$) {
  return $JSCompiler_StaticMethods_getStore_$$($JSCompiler_StaticMethods_saveStore_$self$$).then(function($blob$jscomp$13_store$jscomp$3$$) {
    $mutator$jscomp$11$$($blob$jscomp$13_store$jscomp$3$$);
    $blob$jscomp$13_store$jscomp$3$$ = btoa(JSON.stringify($blob$jscomp$13_store$jscomp$3$$.obj));
    return $JSCompiler_StaticMethods_saveStore_$self$$.$binding_$.saveBlob($JSCompiler_StaticMethods_saveStore_$self$$.$origin_$, $blob$jscomp$13_store$jscomp$3$$);
  }).then($JSCompiler_StaticMethods_saveStore_$self$$.$broadcastReset_$.bind($JSCompiler_StaticMethods_saveStore_$self$$));
}
function $JSCompiler_StaticMethods_listenToBroadcasts_$$($JSCompiler_StaticMethods_listenToBroadcasts_$self$$) {
  $JSCompiler_StaticMethods_listenToBroadcasts_$self$$.$viewer_$.onBroadcast(function($message$jscomp$47$$) {
    "amp-storage-reset" == $message$jscomp$47$$.type && $message$jscomp$47$$.origin == $JSCompiler_StaticMethods_listenToBroadcasts_$self$$.$origin_$ && ($JSCompiler_StaticMethods_listenToBroadcasts_$self$$.$storePromise_$ = null);
  });
}
$JSCompiler_prototypeAlias$$.$broadcastReset_$ = function() {
  this.$viewer_$.broadcast({type:"amp-storage-reset", origin:this.$origin_$});
};
function $Store$$module$src$service$storage_impl$$($obj$jscomp$39$$) {
  this.obj = $recreateNonProtoObject$$module$src$json$$($obj$jscomp$39$$);
  this.$maxValues_$ = 8;
  this.$values_$ = this.obj.vv || Object.create(null);
  this.obj.vv || (this.obj.vv = this.$values_$);
}
$Store$$module$src$service$storage_impl$$.prototype.get = function($item$jscomp$7_name$jscomp$125$$) {
  return ($item$jscomp$7_name$jscomp$125$$ = this.$values_$[$item$jscomp$7_name$jscomp$125$$]) ? $item$jscomp$7_name$jscomp$125$$.v : void 0;
};
$Store$$module$src$service$storage_impl$$.prototype.set = function($item$58_item$jscomp$8_name$jscomp$126$$, $keys$jscomp$1_value$jscomp$136$$, $i$jscomp$87_opt_isUpdate$jscomp$2$$) {
  $devAssert$$module$src$log$$("__proto__" != $item$58_item$jscomp$8_name$jscomp$126$$ && "prototype" != $item$58_item$jscomp$8_name$jscomp$126$$);
  if (void 0 !== this.$values_$[$item$58_item$jscomp$8_name$jscomp$126$$]) {
    $item$58_item$jscomp$8_name$jscomp$126$$ = this.$values_$[$item$58_item$jscomp$8_name$jscomp$126$$];
    var $timestamp$jscomp$1$$ = Date.now();
    $i$jscomp$87_opt_isUpdate$jscomp$2$$ && ($timestamp$jscomp$1$$ = $item$58_item$jscomp$8_name$jscomp$126$$.t);
    $item$58_item$jscomp$8_name$jscomp$126$$.v = $keys$jscomp$1_value$jscomp$136$$;
    $item$58_item$jscomp$8_name$jscomp$126$$.t = $timestamp$jscomp$1$$;
  } else {
    this.$values_$[$item$58_item$jscomp$8_name$jscomp$126$$] = $dict$$module$src$utils$object$$({v:$keys$jscomp$1_value$jscomp$136$$, t:Date.now()});
  }
  $keys$jscomp$1_value$jscomp$136$$ = Object.keys(this.$values_$);
  if ($keys$jscomp$1_value$jscomp$136$$.length > this.$maxValues_$) {
    var $minTime$$ = Infinity, $minKey$$ = null;
    for ($i$jscomp$87_opt_isUpdate$jscomp$2$$ = 0; $i$jscomp$87_opt_isUpdate$jscomp$2$$ < $keys$jscomp$1_value$jscomp$136$$.length; $i$jscomp$87_opt_isUpdate$jscomp$2$$++) {
      $item$58_item$jscomp$8_name$jscomp$126$$ = this.$values_$[$keys$jscomp$1_value$jscomp$136$$[$i$jscomp$87_opt_isUpdate$jscomp$2$$]], $item$58_item$jscomp$8_name$jscomp$126$$.t < $minTime$$ && ($minKey$$ = $keys$jscomp$1_value$jscomp$136$$[$i$jscomp$87_opt_isUpdate$jscomp$2$$], $minTime$$ = $item$58_item$jscomp$8_name$jscomp$126$$.t);
    }
    $minKey$$ && delete this.$values_$[$minKey$$];
  }
};
$Store$$module$src$service$storage_impl$$.prototype.remove = function($name$jscomp$127$$) {
  delete this.$values_$[$name$jscomp$127$$];
};
function $LocalStorageBinding$$module$src$service$storage_impl$$($error$jscomp$26_win$jscomp$194$$) {
  this.win = $error$jscomp$26_win$jscomp$194$$;
  try {
    if ("localStorage" in this.win) {
      this.win.localStorage.getItem("test");
      var $JSCompiler_inline_result$jscomp$195$$ = !0;
    } else {
      $JSCompiler_inline_result$jscomp$195$$ = !1;
    }
  } catch ($JSCompiler_e$jscomp$inline_647$$) {
    $JSCompiler_inline_result$jscomp$195$$ = !1;
  }
  this.$isLocalStorageSupported_$ = $JSCompiler_inline_result$jscomp$195$$;
  this.$isLocalStorageSupported_$ || ($error$jscomp$26_win$jscomp$194$$ = Error("localStorage not supported."), $dev$$module$src$log$$().expectedError("Storage", $error$jscomp$26_win$jscomp$194$$));
}
$LocalStorageBinding$$module$src$service$storage_impl$$.prototype.loadBlob = function($origin$jscomp$10$$) {
  var $$jscomp$this$jscomp$111$$ = this;
  return new Promise(function($resolve$jscomp$32$$) {
    $$jscomp$this$jscomp$111$$.$isLocalStorageSupported_$ ? $resolve$jscomp$32$$($$jscomp$this$jscomp$111$$.win.localStorage.getItem("amp-store:" + $origin$jscomp$10$$)) : $resolve$jscomp$32$$(null);
  });
};
$LocalStorageBinding$$module$src$service$storage_impl$$.prototype.saveBlob = function($origin$jscomp$11$$, $blob$jscomp$14$$) {
  var $$jscomp$this$jscomp$112$$ = this;
  return new Promise(function($resolve$jscomp$33$$) {
    $$jscomp$this$jscomp$112$$.$isLocalStorageSupported_$ && $$jscomp$this$jscomp$112$$.win.localStorage.setItem("amp-store:" + $origin$jscomp$11$$, $blob$jscomp$14$$);
    $resolve$jscomp$33$$();
  });
};
function $ViewerStorageBinding$$module$src$service$storage_impl$$($viewer$jscomp$13$$) {
  this.$viewer_$ = $viewer$jscomp$13$$;
}
$ViewerStorageBinding$$module$src$service$storage_impl$$.prototype.loadBlob = function($origin$jscomp$12$$) {
  return this.$viewer_$.sendMessageAwaitResponse("loadStore", $dict$$module$src$utils$object$$({origin:$origin$jscomp$12$$})).then(function($origin$jscomp$12$$) {
    return $origin$jscomp$12$$.blob;
  });
};
$ViewerStorageBinding$$module$src$service$storage_impl$$.prototype.saveBlob = function($origin$jscomp$13$$, $blob$jscomp$15$$) {
  return this.$viewer_$.sendMessageAwaitResponse("saveStore", $dict$$module$src$utils$object$$({origin:$origin$jscomp$13$$, blob:$blob$jscomp$15$$})).catch(function($origin$jscomp$13$$) {
    throw $dev$$module$src$log$$().createExpectedError("Storage", "Failed to save store: ", $origin$jscomp$13$$);
  });
};
function $installStorageServiceForDoc$$module$src$service$storage_impl$$($ampdoc$jscomp$72$$) {
  $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$72$$, "storage", function() {
    var $JSCompiler_StaticMethods_start_$self$jscomp$inline_649_viewer$jscomp$14$$ = $Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$72$$), $binding$jscomp$3$$ = parseInt($JSCompiler_StaticMethods_start_$self$jscomp$inline_649_viewer$jscomp$14$$.getParam("storage"), 10) ? new $ViewerStorageBinding$$module$src$service$storage_impl$$($JSCompiler_StaticMethods_start_$self$jscomp$inline_649_viewer$jscomp$14$$) : new $LocalStorageBinding$$module$src$service$storage_impl$$($ampdoc$jscomp$72$$.win);
    $JSCompiler_StaticMethods_start_$self$jscomp$inline_649_viewer$jscomp$14$$ = new $Storage$$module$src$service$storage_impl$$($ampdoc$jscomp$72$$, $JSCompiler_StaticMethods_start_$self$jscomp$inline_649_viewer$jscomp$14$$, $binding$jscomp$3$$);
    $JSCompiler_StaticMethods_listenToBroadcasts_$$($JSCompiler_StaticMethods_start_$self$jscomp$inline_649_viewer$jscomp$14$$);
    return $JSCompiler_StaticMethods_start_$self$jscomp$inline_649_viewer$jscomp$14$$;
  }, !0);
}
;var $timersForTesting$$module$src$service$timer_impl$$;
function $Timer$$module$src$service$timer_impl$$($win$jscomp$195$$) {
  this.win = $win$jscomp$195$$;
  this.$resolved_$ = this.win.Promise.resolve();
  this.$taskCount_$ = 0;
  this.$canceled_$ = {};
  this.$startTime_$ = Date.now();
}
$JSCompiler_prototypeAlias$$ = $Timer$$module$src$service$timer_impl$$.prototype;
$JSCompiler_prototypeAlias$$.timeSinceStart = function() {
  return Date.now() - this.$startTime_$;
};
$JSCompiler_prototypeAlias$$.delay = function($callback$jscomp$89$$, $index$jscomp$90_opt_delay$jscomp$5$$) {
  var $$jscomp$this$jscomp$113$$ = this;
  if (!$index$jscomp$90_opt_delay$jscomp$5$$) {
    var $id$jscomp$42$$ = "p" + this.$taskCount_$++;
    this.$resolved_$.then(function() {
      $$jscomp$this$jscomp$113$$.$canceled_$[$id$jscomp$42$$] ? delete $$jscomp$this$jscomp$113$$.$canceled_$[$id$jscomp$42$$] : $callback$jscomp$89$$();
    }).catch($reportError$$module$src$error$$);
    return $id$jscomp$42$$;
  }
  $index$jscomp$90_opt_delay$jscomp$5$$ = this.win.setTimeout(function() {
    try {
      $callback$jscomp$89$$();
    } catch ($e$jscomp$79$$) {
      throw $reportError$$module$src$error$$($e$jscomp$79$$), $e$jscomp$79$$;
    }
  }, $index$jscomp$90_opt_delay$jscomp$5$$);
  $getMode$$module$src$mode$$().test && ($timersForTesting$$module$src$service$timer_impl$$ || ($timersForTesting$$module$src$service$timer_impl$$ = []), $timersForTesting$$module$src$service$timer_impl$$.push($index$jscomp$90_opt_delay$jscomp$5$$));
  return $index$jscomp$90_opt_delay$jscomp$5$$;
};
$JSCompiler_prototypeAlias$$.cancel = function($timeoutId$$) {
  "string" == typeof $timeoutId$$ ? this.$canceled_$[$timeoutId$$] = !0 : this.win.clearTimeout($timeoutId$$);
};
$JSCompiler_prototypeAlias$$.promise = function($opt_delay$jscomp$6$$) {
  var $$jscomp$this$jscomp$114$$ = this;
  return new this.win.Promise(function($resolve$jscomp$34$$) {
    if (-1 == $$jscomp$this$jscomp$114$$.delay($resolve$jscomp$34$$, $opt_delay$jscomp$6$$)) {
      throw Error("Failed to schedule timer.");
    }
  });
};
$JSCompiler_prototypeAlias$$.timeoutPromise = function($delay$jscomp$3$$, $opt_racePromise$$, $opt_message$jscomp$17$$) {
  function $cancel$$() {
    $$jscomp$this$jscomp$115$$.cancel($timerKey$jscomp$1$$);
  }
  var $$jscomp$this$jscomp$115$$ = this, $timerKey$jscomp$1$$, $delayPromise$$ = new this.win.Promise(function($opt_racePromise$$, $cancel$$) {
    $timerKey$jscomp$1$$ = $$jscomp$this$jscomp$115$$.delay(function() {
      $cancel$$($user$$module$src$log$$().createError($opt_message$jscomp$17$$ || "timeout"));
    }, $delay$jscomp$3$$);
    if (-1 == $timerKey$jscomp$1$$) {
      throw Error("Failed to schedule timer.");
    }
  });
  if (!$opt_racePromise$$) {
    return $delayPromise$$;
  }
  $opt_racePromise$$.then($cancel$$, $cancel$$);
  return this.win.Promise.race([$delayPromise$$, $opt_racePromise$$]);
};
$JSCompiler_prototypeAlias$$.poll = function($delay$jscomp$4$$, $predicate$jscomp$2$$) {
  var $$jscomp$this$jscomp$116$$ = this;
  return new this.win.Promise(function($resolve$jscomp$35$$) {
    var $interval$jscomp$4$$ = $$jscomp$this$jscomp$116$$.win.setInterval(function() {
      $predicate$jscomp$2$$() && ($$jscomp$this$jscomp$116$$.win.clearInterval($interval$jscomp$4$$), $resolve$jscomp$35$$());
    }, $delay$jscomp$4$$);
  });
};
function $Url$$module$src$service$url_impl$$($ampdoc$jscomp$73_root$jscomp$16$$, $opt_rootNode$jscomp$1$$) {
  $ampdoc$jscomp$73_root$jscomp$16$$ = $opt_rootNode$jscomp$1$$ || $ampdoc$jscomp$73_root$jscomp$16$$.getRootNode();
  this.$anchor_$ = ($ampdoc$jscomp$73_root$jscomp$16$$.ownerDocument || $ampdoc$jscomp$73_root$jscomp$16$$).createElement("a");
  this.$cache_$ = new $LruCache$$module$src$utils$lru_cache$$;
}
$Url$$module$src$service$url_impl$$.installInEmbedWindow = function($embedWin$jscomp$8$$, $ampdoc$jscomp$74$$) {
  $installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$8$$, "url", new $Url$$module$src$service$url_impl$$($ampdoc$jscomp$74$$, $embedWin$jscomp$8$$.document));
};
$JSCompiler_prototypeAlias$$ = $Url$$module$src$service$url_impl$$.prototype;
$JSCompiler_prototypeAlias$$.parse = function($url$jscomp$79$$, $opt_nocache$jscomp$1$$) {
  return $parseUrlWithA$$module$src$url$$(this.$anchor_$, $url$jscomp$79$$, $opt_nocache$jscomp$1$$ ? null : this.$cache_$);
};
function $JSCompiler_StaticMethods_parse_$$($JSCompiler_StaticMethods_parse_$self$$, $url$jscomp$80$$) {
  return "string" !== typeof $url$jscomp$80$$ ? $url$jscomp$80$$ : $JSCompiler_StaticMethods_parse_$self$$.parse($url$jscomp$80$$);
}
$JSCompiler_prototypeAlias$$.isProtocolValid = function($url$jscomp$81$$) {
  return $isProtocolValid$$module$src$url$$($url$jscomp$81$$);
};
$JSCompiler_prototypeAlias$$.getSourceOrigin = function($url$jscomp$82$$) {
  return $getSourceOrigin$$module$src$url$$($JSCompiler_StaticMethods_parse_$$(this, $url$jscomp$82$$));
};
$JSCompiler_prototypeAlias$$.getSourceUrl = function($url$jscomp$83$$) {
  return $getSourceUrl$$module$src$url$$($JSCompiler_StaticMethods_parse_$$(this, $url$jscomp$83$$));
};
$JSCompiler_prototypeAlias$$.assertHttpsUrl = function($urlString$jscomp$3$$, $elementContext$jscomp$1$$, $sourceName$jscomp$1$$) {
  return $assertHttpsUrl$$module$src$url$$($urlString$jscomp$3$$, $elementContext$jscomp$1$$, void 0 === $sourceName$jscomp$1$$ ? "source" : $sourceName$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.assertAbsoluteHttpOrHttpsUrl = function($urlString$jscomp$4$$) {
  $userAssert$$module$src$log$$(/^https?:/i.test($urlString$jscomp$4$$), 'URL must start with "http://" or "https://". Invalid value: %s', $urlString$jscomp$4$$);
  return $parseUrlDeprecated$$module$src$url$$($urlString$jscomp$4$$).href;
};
$JSCompiler_prototypeAlias$$.isProxyOrigin = function($url$jscomp$84$$) {
  return $isProxyOrigin$$module$src$url$$($JSCompiler_StaticMethods_parse_$$(this, $url$jscomp$84$$));
};
$JSCompiler_prototypeAlias$$.isSecure = function($url$jscomp$85$$) {
  return $isSecureUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_parse_$$(this, $url$jscomp$85$$));
};
$JSCompiler_prototypeAlias$$.getWinOrigin = function($win$jscomp$196$$) {
  return $win$jscomp$196$$.origin || $JSCompiler_StaticMethods_parse_$$(this, $win$jscomp$196$$.location.href).origin;
};
$JSCompiler_prototypeAlias$$.getCdnUrlOnOrigin = function($resourceUrl$$) {
  if ($isProxyOrigin$$module$src$url$$($resourceUrl$$)) {
    return $resourceUrl$$;
  }
  var $$jscomp$destructuring$var107$$ = $JSCompiler_StaticMethods_parse_$$(this, $resourceUrl$$), $hash$jscomp$6$$ = $$jscomp$destructuring$var107$$.hash, $pathname$$ = $$jscomp$destructuring$var107$$.pathname, $search$jscomp$3$$ = $$jscomp$destructuring$var107$$.search, $encodedHost$$ = encodeURIComponent($$jscomp$destructuring$var107$$.host);
  return $urls$$module$src$config$$.cdn + "/c/" + $encodedHost$$ + $pathname$$ + $search$jscomp$3$$ + $hash$jscomp$6$$;
};
var $NAV_TIMING_WAITFOR_EVENTS$$module$src$service$variable_source$$ = {navigationStart:1, redirectStart:1, redirectEnd:1, fetchStart:1, domainLookupStart:1, domainLookupEnd:1, connectStart:1, secureConnectionStart:1, connectEnd:1, requestStart:1, responseStart:1, responseEnd:1, domLoading:2, domInteractive:2, domContentLoaded:2, domComplete:2, loadEventStart:3, loadEventEnd:4};
function $getTimingDataAsync$$module$src$service$variable_source$$($win$jscomp$197$$, $startEvent$$, $endEvent$$) {
  var $startWaitForEvent$$ = $NAV_TIMING_WAITFOR_EVENTS$$module$src$service$variable_source$$[$startEvent$$] || 3, $waitForEvent$$ = Math.max($startWaitForEvent$$, $endEvent$$ ? $NAV_TIMING_WAITFOR_EVENTS$$module$src$service$variable_source$$[$endEvent$$] || 3 : $startWaitForEvent$$);
  if (1 === $waitForEvent$$) {
    var $readyPromise$$ = $resolvedPromise$$module$src$resolved_promise$$();
  } else {
    if (2 === $waitForEvent$$) {
      $readyPromise$$ = $whenDocumentComplete$$module$src$document_ready$$($win$jscomp$197$$.document);
    } else {
      if (3 === $waitForEvent$$) {
        $readyPromise$$ = $loadPromise$$module$src$event_helper$$($win$jscomp$197$$);
      } else {
        if (4 === $waitForEvent$$) {
          var $timer$jscomp$1$$ = $Services$$module$src$services$timerFor$$($win$jscomp$197$$);
          $readyPromise$$ = $loadPromise$$module$src$event_helper$$($win$jscomp$197$$).then(function() {
            return $timer$jscomp$1$$.promise(1);
          });
        }
      }
    }
  }
  $devAssert$$module$src$log$$($readyPromise$$);
  return $readyPromise$$.then(function() {
    return $getTimingDataSync$$module$src$service$variable_source$$($win$jscomp$197$$, $startEvent$$, $endEvent$$);
  });
}
function $getTimingDataSync$$module$src$service$variable_source$$($win$jscomp$198$$, $startEvent$jscomp$1$$, $endEvent$jscomp$1$$) {
  var $timingInfo$$ = $win$jscomp$198$$.performance && $win$jscomp$198$$.performance.timing;
  if ($timingInfo$$ && 0 != $timingInfo$$.navigationStart) {
    var $metric$$ = void 0 === $endEvent$jscomp$1$$ ? $timingInfo$$[$startEvent$jscomp$1$$] : $timingInfo$$[$endEvent$jscomp$1$$] - $timingInfo$$[$startEvent$jscomp$1$$];
    if ($isFiniteNumber$$module$src$types$$($metric$$) && !(0 > $metric$$)) {
      return $metric$$;
    }
  }
}
function $getNavigationData$$module$src$service$variable_source$$($win$jscomp$199$$, $attribute$$) {
  var $navigationInfo$$ = $win$jscomp$199$$.performance && $win$jscomp$199$$.performance.navigation;
  if ($navigationInfo$$ && void 0 !== $navigationInfo$$[$attribute$$]) {
    return $navigationInfo$$[$attribute$$];
  }
}
function $VariableSource$$module$src$service$variable_source$$($ampdoc$jscomp$76$$) {
  this.ampdoc = $ampdoc$jscomp$76$$;
  this.$replacements_$ = Object.create(null);
  this.$initialized_$ = !1;
  $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$(this);
}
$JSCompiler_prototypeAlias$$ = $VariableSource$$module$src$service$variable_source$$.prototype;
$JSCompiler_prototypeAlias$$.$initialize_$ = function() {
  this.initialize();
  this.$initialized_$ = !0;
};
$JSCompiler_prototypeAlias$$.initialize = function() {
};
$JSCompiler_prototypeAlias$$.get = function($name$jscomp$128$$) {
  this.$initialized_$ || this.$initialize_$();
  return this.$replacements_$[$name$jscomp$128$$];
};
$JSCompiler_prototypeAlias$$.set = function($varName$jscomp$1$$, $syncResolver$$) {
  $devAssert$$module$src$log$$(-1 == $varName$jscomp$1$$.indexOf("RETURN"));
  this.$replacements_$[$varName$jscomp$1$$] = this.$replacements_$[$varName$jscomp$1$$] || {sync:void 0, async:void 0};
  this.$replacements_$[$varName$jscomp$1$$].sync = $syncResolver$$;
  return this;
};
$JSCompiler_prototypeAlias$$.setAsync = function($varName$jscomp$2$$, $asyncResolver$$) {
  $devAssert$$module$src$log$$(-1 == $varName$jscomp$2$$.indexOf("RETURN"));
  this.$replacements_$[$varName$jscomp$2$$] = this.$replacements_$[$varName$jscomp$2$$] || {sync:void 0, async:void 0};
  this.$replacements_$[$varName$jscomp$2$$].async = $asyncResolver$$;
  return this;
};
$JSCompiler_prototypeAlias$$.setBoth = function($varName$jscomp$3$$, $syncResolver$jscomp$1$$, $asyncResolver$jscomp$1$$) {
  return this.set($varName$jscomp$3$$, $syncResolver$jscomp$1$$).setAsync($varName$jscomp$3$$, $asyncResolver$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.getExpr = function($opt_bindings$$, $opt_whiteList$$) {
  this.$initialized_$ || this.$initialize_$();
  var $all$$ = Object.assign({}, this.$replacements_$, $opt_bindings$$);
  return $JSCompiler_StaticMethods_buildExpr_$$(this, Object.keys($all$$), $opt_whiteList$$);
};
function $JSCompiler_StaticMethods_buildExpr_$$($JSCompiler_StaticMethods_buildExpr_$self$$, $keys$jscomp$2$$, $opt_whiteList$jscomp$1$$) {
  $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$($JSCompiler_StaticMethods_buildExpr_$self$$) && ($keys$jscomp$2$$ = $keys$jscomp$2$$.filter(function($keys$jscomp$2$$) {
    return $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$($JSCompiler_StaticMethods_buildExpr_$self$$).includes($keys$jscomp$2$$);
  }));
  $opt_whiteList$jscomp$1$$ && ($keys$jscomp$2$$ = $keys$jscomp$2$$.filter(function($JSCompiler_StaticMethods_buildExpr_$self$$) {
    return $opt_whiteList$jscomp$1$$[$JSCompiler_StaticMethods_buildExpr_$self$$];
  }));
  if (0 === $keys$jscomp$2$$.length) {
    return /_^/g;
  }
  $keys$jscomp$2$$.sort(function($JSCompiler_StaticMethods_buildExpr_$self$$, $keys$jscomp$2$$) {
    return $keys$jscomp$2$$.length - $JSCompiler_StaticMethods_buildExpr_$self$$.length;
  });
  var $regexStr$$ = "\\$?(" + $keys$jscomp$2$$.map(function($JSCompiler_StaticMethods_buildExpr_$self$$) {
    return "$" === $JSCompiler_StaticMethods_buildExpr_$self$$[0] ? "\\" + $JSCompiler_StaticMethods_buildExpr_$self$$ : $JSCompiler_StaticMethods_buildExpr_$self$$;
  }).join("|") + ")";
  return new RegExp($regexStr$$, "g");
}
function $JSCompiler_StaticMethods_getUrlMacroWhitelist_$$($JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$) {
  if ($JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$variableWhitelist_$) {
    return $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$variableWhitelist_$;
  }
  if ($JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.ampdoc.isSingleDoc()) {
    var $doc$jscomp$40$$ = $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.ampdoc.getRootNode();
    if ($isAmpFormatType$$module$src$format$$(["\u26a14email", "amp4email"], $doc$jscomp$40$$)) {
      return $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$variableWhitelist_$ = [""], $JSCompiler_StaticMethods_getUrlMacroWhitelist_$self$$.$variableWhitelist_$;
    }
  }
}
;function $Expander$$module$src$service$url_expander$expander$$($variableSource$$, $opt_bindings$jscomp$1$$, $opt_collectVars$$, $opt_sync$$, $opt_whiteList$jscomp$2$$, $opt_noEncode$$) {
  this.$variableSource_$ = $variableSource$$;
  this.$bindings_$ = $opt_bindings$jscomp$1$$;
  this.$collectVars_$ = $opt_collectVars$$;
  this.$sync_$ = $opt_sync$$;
  this.$whiteList_$ = $opt_whiteList$jscomp$2$$;
  this.$encode_$ = !$opt_noEncode$$;
}
$Expander$$module$src$service$url_expander$expander$$.prototype.expand = function($url$jscomp$86$$) {
  if (!$url$jscomp$86$$.length) {
    return this.$sync_$ ? $url$jscomp$86$$ : Promise.resolve($url$jscomp$86$$);
  }
  var $expr$jscomp$6_matches$jscomp$4$$ = this.$variableSource_$.getExpr(this.$bindings_$, this.$whiteList_$);
  $expr$jscomp$6_matches$jscomp$4$$ = $JSCompiler_StaticMethods_findMatches_$$($url$jscomp$86$$, $expr$jscomp$6_matches$jscomp$4$$);
  return $expr$jscomp$6_matches$jscomp$4$$.length ? $JSCompiler_StaticMethods_parseUrlRecursively_$$(this, $url$jscomp$86$$, $expr$jscomp$6_matches$jscomp$4$$) : this.$sync_$ ? $url$jscomp$86$$ : Promise.resolve($url$jscomp$86$$);
};
$Expander$$module$src$service$url_expander$expander$$.prototype.getMacroNames = function($matches$jscomp$5_url$jscomp$87$$) {
  var $expr$jscomp$7$$ = this.$variableSource_$.getExpr(this.$bindings_$, this.$whiteList_$);
  return ($matches$jscomp$5_url$jscomp$87$$ = $matches$jscomp$5_url$jscomp$87$$.match($expr$jscomp$7$$)) ? $matches$jscomp$5_url$jscomp$87$$ : [];
};
function $JSCompiler_StaticMethods_findMatches_$$($url$jscomp$88$$, $expression$jscomp$3$$) {
  var $matches$jscomp$6$$ = [];
  $url$jscomp$88$$.replace($expression$jscomp$3$$, function($url$jscomp$88$$, $expression$jscomp$3$$, $startPosition$$) {
    $url$jscomp$88$$ = $url$jscomp$88$$.length;
    $matches$jscomp$6$$.push({start:$startPosition$$, stop:$url$jscomp$88$$ + $startPosition$$ - 1, name:$expression$jscomp$3$$, length:$url$jscomp$88$$});
  });
  return $matches$jscomp$6$$;
}
function $JSCompiler_StaticMethods_parseUrlRecursively_$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$, $url$jscomp$89$$, $matches$jscomp$7$$) {
  function $evaluateNextLevel$$($encode$$) {
    for (var $binding$59_binding$jscomp$4_builder$jscomp$1$$ = "", $results$jscomp$2$$ = [], $args$jscomp$17$$ = []; $urlIndex$$ < $url$jscomp$89$$.length && $matchIndex$jscomp$1$$ <= $matches$jscomp$7$$.length;) {
      var $trimmedBuilder$$ = $binding$59_binding$jscomp$4_builder$jscomp$1$$.trim();
      if ($match$jscomp$7$$ && $urlIndex$$ === $match$jscomp$7$$.start) {
        $trimmedBuilder$$ && $results$jscomp$2$$.push($numOfPendingCalls$$ ? $trimStart$$module$src$string$$($binding$59_binding$jscomp$4_builder$jscomp$1$$) : $binding$59_binding$jscomp$4_builder$jscomp$1$$), $binding$59_binding$jscomp$4_builder$jscomp$1$$ = void 0, $binding$59_binding$jscomp$4_builder$jscomp$1$$ = $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$bindings_$ && $hasOwn_$$module$src$utils$object$$.call($JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$bindings_$, $match$jscomp$7$$.name) ? 
        {name:$match$jscomp$7$$.name, prioritized:$JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$bindings_$[$match$jscomp$7$$.name], encode:$encode$$} : Object.assign({}, $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$variableSource_$.get($match$jscomp$7$$.name), {name:$match$jscomp$7$$.name, encode:$encode$$}), $urlIndex$$ = $match$jscomp$7$$.stop + 1, $match$jscomp$7$$ = $matches$jscomp$7$$[++$matchIndex$jscomp$1$$], "(" === $url$jscomp$89$$[$urlIndex$$] ? ($urlIndex$$++, $numOfPendingCalls$$++, 
        $stack$jscomp$2$$.push($binding$59_binding$jscomp$4_builder$jscomp$1$$), $results$jscomp$2$$.push($evaluateNextLevel$$(!1))) : $results$jscomp$2$$.push($JSCompiler_StaticMethods_evaluateBinding_$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$, $binding$59_binding$jscomp$4_builder$jscomp$1$$)), $binding$59_binding$jscomp$4_builder$jscomp$1$$ = "";
      } else {
        if ("`" === $url$jscomp$89$$[$urlIndex$$]) {
          $ignoringChars$$ ? ($ignoringChars$$ = !1, $binding$59_binding$jscomp$4_builder$jscomp$1$$.length && $results$jscomp$2$$.push($binding$59_binding$jscomp$4_builder$jscomp$1$$)) : ($ignoringChars$$ = !0, $trimmedBuilder$$ && $results$jscomp$2$$.push($trimmedBuilder$$)), $binding$59_binding$jscomp$4_builder$jscomp$1$$ = "";
        } else {
          if ($numOfPendingCalls$$ && "," === $url$jscomp$89$$[$urlIndex$$] && !$ignoringChars$$) {
            $trimmedBuilder$$ && $results$jscomp$2$$.push($trimmedBuilder$$), $args$jscomp$17$$.push($results$jscomp$2$$), $results$jscomp$2$$ = [], "," === $url$jscomp$89$$[$urlIndex$$ + 1] && ($args$jscomp$17$$.push([""]), $urlIndex$$++), $binding$59_binding$jscomp$4_builder$jscomp$1$$ = "";
          } else {
            if ($numOfPendingCalls$$ && ")" === $url$jscomp$89$$[$urlIndex$$] && !$ignoringChars$$) {
              return $urlIndex$$++, $numOfPendingCalls$$--, $binding$59_binding$jscomp$4_builder$jscomp$1$$ = $stack$jscomp$2$$.pop(), $trimmedBuilder$$ && $results$jscomp$2$$.push($trimmedBuilder$$), $args$jscomp$17$$.push($results$jscomp$2$$), $JSCompiler_StaticMethods_evaluateBinding_$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$, $binding$59_binding$jscomp$4_builder$jscomp$1$$, $args$jscomp$17$$);
            }
            $binding$59_binding$jscomp$4_builder$jscomp$1$$ += $url$jscomp$89$$[$urlIndex$$];
          }
        }
        $urlIndex$$++;
      }
      $urlIndex$$ === $url$jscomp$89$$.length && $binding$59_binding$jscomp$4_builder$jscomp$1$$.length && $results$jscomp$2$$.push($binding$59_binding$jscomp$4_builder$jscomp$1$$);
    }
    return $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$sync_$ ? $results$jscomp$2$$.join("") : Promise.all($results$jscomp$2$$).then(function($JSCompiler_StaticMethods_parseUrlRecursively_$self$$) {
      return $JSCompiler_StaticMethods_parseUrlRecursively_$self$$.join("");
    }).catch(function($JSCompiler_StaticMethods_parseUrlRecursively_$self$$) {
      $rethrowAsync$$module$src$log$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$);
      return "";
    });
  }
  var $stack$jscomp$2$$ = [], $urlIndex$$ = 0, $matchIndex$jscomp$1$$ = 0, $match$jscomp$7$$ = $matches$jscomp$7$$[$matchIndex$jscomp$1$$], $numOfPendingCalls$$ = 0, $ignoringChars$$ = !1;
  return $evaluateNextLevel$$($JSCompiler_StaticMethods_parseUrlRecursively_$self$$.$encode_$);
}
function $JSCompiler_StaticMethods_evaluateBinding_$$($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$, $bindingInfo$$, $opt_args$jscomp$4$$) {
  var $encode$jscomp$1$$ = $bindingInfo$$.encode, $name$jscomp$130$$ = $bindingInfo$$.name;
  if (void 0 != $bindingInfo$$.prioritized) {
    var $binding$jscomp$5$$ = $bindingInfo$$.prioritized;
  } else {
    $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$.$sync_$ && void 0 != $bindingInfo$$.sync ? $binding$jscomp$5$$ = $bindingInfo$$.sync : $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$.$sync_$ ? ($user$$module$src$log$$().error("Expander", "ignoring async replacement key: ", $bindingInfo$$.name), $binding$jscomp$5$$ = "") : $binding$jscomp$5$$ = $bindingInfo$$.async || $bindingInfo$$.sync;
  }
  return $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$.$sync_$ ? ($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$ = $JSCompiler_StaticMethods_evaluateBindingSync_$$($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$, $binding$jscomp$5$$, $name$jscomp$130$$, $opt_args$jscomp$4$$), $encode$jscomp$1$$ ? encodeURIComponent($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) : $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) : 
  $JSCompiler_StaticMethods_evaluateBindingAsync_$$($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$, $binding$jscomp$5$$, $name$jscomp$130$$, $opt_args$jscomp$4$$).then(function($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) {
    return $encode$jscomp$1$$ ? encodeURIComponent($JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$) : $JSCompiler_StaticMethods_evaluateBinding_$self_result$jscomp$6$$;
  });
}
function $JSCompiler_StaticMethods_evaluateBindingAsync_$$($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $binding$jscomp$6$$, $name$jscomp$131$$, $opt_args$jscomp$5$$) {
  try {
    var $value$jscomp$138$$ = "function" === typeof $binding$jscomp$6$$ ? $opt_args$jscomp$5$$ ? $JSCompiler_StaticMethods_processArgsAsync_$$($opt_args$jscomp$5$$).then(function($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$) {
      return $binding$jscomp$6$$.apply(null, $JSCompiler_StaticMethods_evaluateBindingAsync_$self$$);
    }) : $tryResolve$$module$src$utils$promise$$($binding$jscomp$6$$) : Promise.resolve($binding$jscomp$6$$);
    return $value$jscomp$138$$.then(function($binding$jscomp$6$$) {
      $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $name$jscomp$131$$, $binding$jscomp$6$$, $opt_args$jscomp$5$$);
      return null == $binding$jscomp$6$$ ? "" : $binding$jscomp$6$$;
    }).catch(function($binding$jscomp$6$$) {
      $rethrowAsync$$module$src$log$$($binding$jscomp$6$$);
      $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $name$jscomp$131$$, "", $opt_args$jscomp$5$$);
      return Promise.resolve("");
    });
  } catch ($e$jscomp$82$$) {
    return $rethrowAsync$$module$src$log$$($e$jscomp$82$$), $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingAsync_$self$$, $name$jscomp$131$$, "", $opt_args$jscomp$5$$), Promise.resolve("");
  }
}
function $JSCompiler_StaticMethods_processArgsAsync_$$($argsArray$$) {
  return Promise.all($argsArray$$.map(function($argsArray$$) {
    return Promise.all($argsArray$$).then(function($argsArray$$) {
      return $argsArray$$.join("");
    });
  }));
}
function $JSCompiler_StaticMethods_evaluateBindingSync_$$($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $binding$jscomp$7$$, $name$jscomp$132$$, $opt_args$jscomp$6$$) {
  try {
    var $value$jscomp$139$$ = $binding$jscomp$7$$;
    "function" === typeof $binding$jscomp$7$$ && ($value$jscomp$139$$ = $binding$jscomp$7$$.apply(null, $JSCompiler_StaticMethods_processArgsSync_$$($opt_args$jscomp$6$$)));
    if ($value$jscomp$139$$ && $value$jscomp$139$$.then) {
      $user$$module$src$log$$().error("Expander", "ignoring async macro resolution");
      var $result$jscomp$9$$ = "";
    } else {
      "string" === typeof $value$jscomp$139$$ || "number" === typeof $value$jscomp$139$$ || "boolean" === typeof $value$jscomp$139$$ ? ($JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $name$jscomp$132$$, $value$jscomp$139$$, $opt_args$jscomp$6$$), $result$jscomp$9$$ = $value$jscomp$139$$.toString()) : ($JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $name$jscomp$132$$, "", $opt_args$jscomp$6$$), 
      $result$jscomp$9$$ = "");
    }
    return $result$jscomp$9$$;
  } catch ($e$jscomp$83$$) {
    return $rethrowAsync$$module$src$log$$($e$jscomp$83$$), $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_evaluateBindingSync_$self$$, $name$jscomp$132$$, "", $opt_args$jscomp$6$$), "";
  }
}
function $JSCompiler_StaticMethods_processArgsSync_$$($argsArray$jscomp$1$$) {
  return $argsArray$jscomp$1$$ ? $argsArray$jscomp$1$$.map(function($argsArray$jscomp$1$$) {
    return $argsArray$jscomp$1$$.join("");
  }) : $argsArray$jscomp$1$$;
}
function $JSCompiler_StaticMethods_maybeCollectVars_$$($JSCompiler_StaticMethods_maybeCollectVars_$self$$, $name$jscomp$133$$, $value$jscomp$140$$, $opt_args$jscomp$7$$) {
  if ($JSCompiler_StaticMethods_maybeCollectVars_$self$$.$collectVars_$) {
    var $args$jscomp$19$$ = "";
    $opt_args$jscomp$7$$ && ($args$jscomp$19$$ = "(" + $opt_args$jscomp$7$$.filter(function($JSCompiler_StaticMethods_maybeCollectVars_$self$$) {
      return "" !== $JSCompiler_StaticMethods_maybeCollectVars_$self$$;
    }).join(",") + ")");
    $JSCompiler_StaticMethods_maybeCollectVars_$self$$.$collectVars_$["" + $name$jscomp$133$$ + $args$jscomp$19$$] = $value$jscomp$140$$ || "";
  }
}
;function $dateMethod$$module$src$service$url_replacements_impl$$($method$jscomp$15$$) {
  return function() {
    return (new Date)[$method$jscomp$15$$]();
  };
}
function $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$1$$, $property$jscomp$7$$) {
  return function() {
    return $screen$jscomp$1$$[$property$jscomp$7$$];
  };
}
function $GlobalVariableSource$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$77$$) {
  $VariableSource$$module$src$service$variable_source$$.call(this, $ampdoc$jscomp$77$$);
  this.$shareTrackingFragments_$ = null;
}
$$jscomp$inherits$$($GlobalVariableSource$$module$src$service$url_replacements_impl$$, $VariableSource$$module$src$service$variable_source$$);
function $JSCompiler_StaticMethods_setTimingResolver_$$($JSCompiler_StaticMethods_setTimingResolver_$self$$, $varName$jscomp$4$$, $startEvent$jscomp$2$$, $endEvent$jscomp$2$$) {
  $JSCompiler_StaticMethods_setTimingResolver_$self$$.setBoth($varName$jscomp$4$$, function() {
    return $getTimingDataSync$$module$src$service$variable_source$$($JSCompiler_StaticMethods_setTimingResolver_$self$$.ampdoc.win, $startEvent$jscomp$2$$, $endEvent$jscomp$2$$);
  }, function() {
    return $getTimingDataAsync$$module$src$service$variable_source$$($JSCompiler_StaticMethods_setTimingResolver_$self$$.ampdoc.win, $startEvent$jscomp$2$$, $endEvent$jscomp$2$$);
  });
}
$GlobalVariableSource$$module$src$service$url_replacements_impl$$.prototype.initialize = function() {
  function $expandSourceUrl$$() {
    var $expandSourceUrl$$ = $JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$);
    return $removeFragment$$module$src$url$$($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$$($$jscomp$this$jscomp$121$$, $expandSourceUrl$$.sourceUrl));
  }
  var $$jscomp$this$jscomp$121$$ = this, $win$jscomp$200$$ = this.ampdoc.win, $element$jscomp$184$$ = this.ampdoc.getHeadNode(), $viewport$jscomp$8$$ = $Services$$module$src$services$viewportForDoc$$(this.ampdoc);
  this.set("RANDOM", function() {
    return Math.random();
  });
  var $counterStore$$ = Object.create(null);
  this.set("COUNTER", function($expandSourceUrl$$) {
    return $counterStore$$[$expandSourceUrl$$] = ($counterStore$$[$expandSourceUrl$$] | 0) + 1;
  });
  this.set("CANONICAL_URL", function() {
    return $JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).canonicalUrl;
  });
  this.set("CANONICAL_HOST", function() {
    return $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).canonicalUrl).host;
  });
  this.set("CANONICAL_HOSTNAME", function() {
    return $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).canonicalUrl).hostname;
  });
  this.set("CANONICAL_PATH", function() {
    return $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).canonicalUrl).pathname;
  });
  this.setAsync("DOCUMENT_REFERRER", function() {
    return $Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$121$$.ampdoc).getReferrerUrl();
  });
  this.setAsync("EXTERNAL_REFERRER", function() {
    return $Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$121$$.ampdoc).getReferrerUrl().then(function($expandSourceUrl$$) {
      return $expandSourceUrl$$ ? $parseUrlDeprecated$$module$src$url$$($getSourceUrl$$module$src$url$$($expandSourceUrl$$)).hostname === $win$jscomp$200$$.location.hostname ? null : $expandSourceUrl$$ : null;
    });
  });
  this.set("TITLE", function() {
    var $expandSourceUrl$$ = $win$jscomp$200$$.document;
    return $expandSourceUrl$$.originalTitle || $expandSourceUrl$$.title;
  });
  this.set("AMPDOC_URL", function() {
    return $removeFragment$$module$src$url$$($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$$($$jscomp$this$jscomp$121$$, $win$jscomp$200$$.location.href));
  });
  this.set("AMPDOC_HOST", function() {
    var $expandSourceUrl$$ = $parseUrlDeprecated$$module$src$url$$($win$jscomp$200$$.location.href);
    return $expandSourceUrl$$ && $expandSourceUrl$$.host;
  });
  this.set("AMPDOC_HOSTNAME", function() {
    var $expandSourceUrl$$ = $parseUrlDeprecated$$module$src$url$$($win$jscomp$200$$.location.href);
    return $expandSourceUrl$$ && $expandSourceUrl$$.hostname;
  });
  this.setBoth("SOURCE_URL", function() {
    return $expandSourceUrl$$();
  }, function() {
    return $getTrackImpressionPromise$$module$src$impression$$().then(function() {
      return $expandSourceUrl$$();
    });
  });
  this.set("SOURCE_HOST", function() {
    return $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).sourceUrl).host;
  });
  this.set("SOURCE_HOSTNAME", function() {
    return $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).sourceUrl).hostname;
  });
  this.set("SOURCE_PATH", function() {
    return $parseUrlDeprecated$$module$src$url$$($JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).sourceUrl).pathname;
  });
  this.set("PAGE_VIEW_ID", function() {
    return $JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).pageViewId;
  });
  this.setAsync("PAGE_VIEW_ID_64", function() {
    return $JSCompiler_StaticMethods_getDocInfo_$$($$jscomp$this$jscomp$121$$).pageViewId64;
  });
  this.setBoth("QUERY_PARAM", function($expandSourceUrl$$, $win$jscomp$200$$) {
    return $JSCompiler_StaticMethods_getQueryParamData_$$($$jscomp$this$jscomp$121$$, $expandSourceUrl$$, void 0 === $win$jscomp$200$$ ? "" : $win$jscomp$200$$);
  }, function($expandSourceUrl$$, $win$jscomp$200$$) {
    $win$jscomp$200$$ = void 0 === $win$jscomp$200$$ ? "" : $win$jscomp$200$$;
    return $getTrackImpressionPromise$$module$src$impression$$().then(function() {
      return $JSCompiler_StaticMethods_getQueryParamData_$$($$jscomp$this$jscomp$121$$, $expandSourceUrl$$, $win$jscomp$200$$);
    });
  });
  this.set("FRAGMENT_PARAM", function($expandSourceUrl$$, $win$jscomp$200$$) {
    $win$jscomp$200$$ = void 0 === $win$jscomp$200$$ ? "" : $win$jscomp$200$$;
    $userAssert$$module$src$log$$($expandSourceUrl$$, "The first argument to FRAGMENT_PARAM, the fragment string param is required");
    $userAssert$$module$src$log$$("string" == typeof $expandSourceUrl$$, "param should be a string");
    var $element$jscomp$184$$ = $parseQueryString_$$module$src$url_parse_query_string$$($$jscomp$this$jscomp$121$$.ampdoc.win.location.originalHash);
    return void 0 === $element$jscomp$184$$[$expandSourceUrl$$] ? $win$jscomp$200$$ : $element$jscomp$184$$[$expandSourceUrl$$];
  });
  var $clientIds$$ = null;
  this.setBoth("CLIENT_ID", function($expandSourceUrl$$) {
    return $clientIds$$ ? $clientIds$$[$expandSourceUrl$$] : null;
  }, function($expandSourceUrl$$, $win$jscomp$200$$, $viewport$jscomp$8$$) {
    $userAssert$$module$src$log$$($expandSourceUrl$$, "The first argument to CLIENT_ID, the fallback Cookie name, is required");
    var $counterStore$$ = $resolvedPromise$$module$src$resolved_promise$$();
    $win$jscomp$200$$ && ($counterStore$$ = $getElementServiceForDoc$$module$src$element_service$$($element$jscomp$184$$, "userNotificationManager", "amp-user-notification").then(function($expandSourceUrl$$) {
      return $expandSourceUrl$$.get($win$jscomp$200$$);
    }));
    return $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($$jscomp$this$jscomp$121$$.ampdoc), "cid").then(function($$jscomp$this$jscomp$121$$) {
      return $$jscomp$this$jscomp$121$$.get({scope:$expandSourceUrl$$, createCookieIfNotPresent:!0, cookieName:$viewport$jscomp$8$$}, $counterStore$$);
    }).then(function($$jscomp$this$jscomp$121$$) {
      $clientIds$$ || ($clientIds$$ = Object.create(null));
      var $win$jscomp$200$$ = $viewport$jscomp$8$$ || $expandSourceUrl$$;
      $$jscomp$this$jscomp$121$$ && "_ga" == $win$jscomp$200$$ && ("string" === typeof $$jscomp$this$jscomp$121$$ ? $$jscomp$this$jscomp$121$$ = $$jscomp$this$jscomp$121$$.replace(/^(GA1|1)\.[\d-]+\./, "") : $dev$$module$src$log$$().error("UrlReplacements", "non-string cid, what is it?", Object.keys($$jscomp$this$jscomp$121$$)));
      return $clientIds$$[$expandSourceUrl$$] = $$jscomp$this$jscomp$121$$;
    });
  });
  this.setAsync("VARIANT", function($expandSourceUrl$$) {
    return $JSCompiler_StaticMethods_getVariantsValue_$$($$jscomp$this$jscomp$121$$, function($$jscomp$this$jscomp$121$$) {
      var $win$jscomp$200$$ = $$jscomp$this$jscomp$121$$[$expandSourceUrl$$];
      $userAssert$$module$src$log$$(void 0 !== $win$jscomp$200$$, "The value passed to VARIANT() is not a valid experiment in <amp-experiment>:" + $expandSourceUrl$$);
      return null === $win$jscomp$200$$ ? "none" : $win$jscomp$200$$;
    }, "VARIANT");
  });
  this.setAsync("VARIANTS", function() {
    return $JSCompiler_StaticMethods_getVariantsValue_$$($$jscomp$this$jscomp$121$$, function($expandSourceUrl$$) {
      var $$jscomp$this$jscomp$121$$ = [], $win$jscomp$200$$;
      for ($win$jscomp$200$$ in $expandSourceUrl$$) {
        $$jscomp$this$jscomp$121$$.push($win$jscomp$200$$ + "." + ($expandSourceUrl$$[$win$jscomp$200$$] || "none"));
      }
      return $$jscomp$this$jscomp$121$$.join("!");
    }, "VARIANTS");
  });
  this.setAsync("AMP_GEO", function($expandSourceUrl$$) {
    return $JSCompiler_StaticMethods_getGeo_$$($$jscomp$this$jscomp$121$$, function($$jscomp$this$jscomp$121$$) {
      return $expandSourceUrl$$ ? ($userAssert$$module$src$log$$("ISOCountry" === $expandSourceUrl$$, "The value passed to AMP_GEO() is not valid name:" + $expandSourceUrl$$), $$jscomp$this$jscomp$121$$[$expandSourceUrl$$] || "unknown") : $$jscomp$this$jscomp$121$$.matchedISOCountryGroups.join(",");
    });
  });
  this.setAsync("SHARE_TRACKING_INCOMING", function() {
    return $JSCompiler_StaticMethods_getShareTrackingValue_$$($$jscomp$this$jscomp$121$$, function($expandSourceUrl$$) {
      return $expandSourceUrl$$.incomingFragment;
    }, "SHARE_TRACKING_INCOMING");
  });
  this.setAsync("SHARE_TRACKING_OUTGOING", function() {
    return $JSCompiler_StaticMethods_getShareTrackingValue_$$($$jscomp$this$jscomp$121$$, function($expandSourceUrl$$) {
      return $expandSourceUrl$$.outgoingFragment;
    }, "SHARE_TRACKING_OUTGOING");
  });
  this.set("TIMESTAMP", $dateMethod$$module$src$service$url_replacements_impl$$("getTime"));
  this.set("TIMESTAMP_ISO", $dateMethod$$module$src$service$url_replacements_impl$$("toISOString"));
  this.set("TIMEZONE", $dateMethod$$module$src$service$url_replacements_impl$$("getTimezoneOffset"));
  this.set("SCROLL_HEIGHT", function() {
    return $viewport$jscomp$8$$.getScrollHeight();
  });
  this.set("SCROLL_WIDTH", function() {
    return $viewport$jscomp$8$$.getScrollWidth();
  });
  this.set("VIEWPORT_HEIGHT", function() {
    return $viewport$jscomp$8$$.getHeight();
  });
  this.set("VIEWPORT_WIDTH", function() {
    return $viewport$jscomp$8$$.getWidth();
  });
  var $screen$jscomp$2$$ = $win$jscomp$200$$.screen;
  this.set("SCREEN_WIDTH", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "width"));
  this.set("SCREEN_HEIGHT", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "height"));
  this.set("AVAILABLE_SCREEN_HEIGHT", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "availHeight"));
  this.set("AVAILABLE_SCREEN_WIDTH", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "availWidth"));
  this.set("SCREEN_COLOR_DEPTH", $screenProperty$$module$src$service$url_replacements_impl$$($screen$jscomp$2$$, "colorDepth"));
  this.set("DOCUMENT_CHARSET", function() {
    var $expandSourceUrl$$ = $win$jscomp$200$$.document;
    return $expandSourceUrl$$.characterSet || $expandSourceUrl$$.charset;
  });
  this.set("BROWSER_LANGUAGE", function() {
    var $expandSourceUrl$$ = $win$jscomp$200$$.navigator;
    return ($expandSourceUrl$$.language || $expandSourceUrl$$.userLanguage || $expandSourceUrl$$.browserLanguage || "").toLowerCase();
  });
  this.set("USER_AGENT", function() {
    return $win$jscomp$200$$.navigator.userAgent;
  });
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "PAGE_LOAD_TIME", "navigationStart", "loadEventStart");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "DOMAIN_LOOKUP_TIME", "domainLookupStart", "domainLookupEnd");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "TCP_CONNECT_TIME", "connectStart", "connectEnd");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "SERVER_RESPONSE_TIME", "requestStart", "responseStart");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "PAGE_DOWNLOAD_TIME", "responseStart", "responseEnd");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "REDIRECT_TIME", "navigationStart", "fetchStart");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "DOM_INTERACTIVE_TIME", "navigationStart", "domInteractive");
  $JSCompiler_StaticMethods_setTimingResolver_$$(this, "CONTENT_LOAD_TIME", "navigationStart", "domContentLoadedEventStart");
  this.setAsync("ACCESS_READER_ID", function() {
    return $JSCompiler_StaticMethods_getAccessValue_$$($$jscomp$this$jscomp$121$$, function($expandSourceUrl$$) {
      return $expandSourceUrl$$.getAccessReaderId();
    }, "ACCESS_READER_ID");
  });
  this.setAsync("AUTHDATA", function($expandSourceUrl$$) {
    $userAssert$$module$src$log$$($expandSourceUrl$$, "The first argument to AUTHDATA, the field, is required");
    return $JSCompiler_StaticMethods_getAccessValue_$$($$jscomp$this$jscomp$121$$, function($$jscomp$this$jscomp$121$$) {
      return $$jscomp$this$jscomp$121$$.getAuthdataField($expandSourceUrl$$);
    }, "AUTHDATA");
  });
  this.setAsync("VIEWER", function() {
    return $Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$121$$.ampdoc).getViewerOrigin().then(function($expandSourceUrl$$) {
      return void 0 == $expandSourceUrl$$ ? "" : $expandSourceUrl$$;
    });
  });
  this.setAsync("TOTAL_ENGAGED_TIME", function() {
    return $getElementServiceForDoc$$module$src$element_service$$($element$jscomp$184$$, "activity", "amp-analytics").then(function($expandSourceUrl$$) {
      return $expandSourceUrl$$.getTotalEngagedTime();
    });
  });
  this.setAsync("INCREMENTAL_ENGAGED_TIME", function($expandSourceUrl$$, $$jscomp$this$jscomp$121$$) {
    return $getElementServiceForDoc$$module$src$element_service$$($element$jscomp$184$$, "activity", "amp-analytics").then(function($win$jscomp$200$$) {
      return $win$jscomp$200$$.getIncrementalEngagedTime($expandSourceUrl$$, "false" !== $$jscomp$this$jscomp$121$$);
    });
  });
  this.set("NAV_TIMING", function($expandSourceUrl$$, $$jscomp$this$jscomp$121$$) {
    $userAssert$$module$src$log$$($expandSourceUrl$$, "The first argument to NAV_TIMING, the start attribute name, is required");
    return $getTimingDataSync$$module$src$service$variable_source$$($win$jscomp$200$$, $expandSourceUrl$$, $$jscomp$this$jscomp$121$$);
  });
  this.setAsync("NAV_TIMING", function($expandSourceUrl$$, $$jscomp$this$jscomp$121$$) {
    $userAssert$$module$src$log$$($expandSourceUrl$$, "The first argument to NAV_TIMING, the start attribute name, is required");
    return $getTimingDataAsync$$module$src$service$variable_source$$($win$jscomp$200$$, $expandSourceUrl$$, $$jscomp$this$jscomp$121$$);
  });
  this.set("NAV_TYPE", function() {
    return $getNavigationData$$module$src$service$variable_source$$($win$jscomp$200$$, "type");
  });
  this.set("NAV_REDIRECT_COUNT", function() {
    return $getNavigationData$$module$src$service$variable_source$$($win$jscomp$200$$, "redirectCount");
  });
  this.set("AMP_VERSION", function() {
    return "2005062057000";
  });
  this.set("BACKGROUND_STATE", function() {
    return $$jscomp$this$jscomp$121$$.ampdoc.isVisible() ? "0" : "1";
  });
  this.setAsync("VIDEO_STATE", function($expandSourceUrl$$, $win$jscomp$200$$) {
    return $getServiceForDoc$$module$src$service$$($$jscomp$this$jscomp$121$$.ampdoc, "video-manager").getVideoStateProperty($expandSourceUrl$$, $win$jscomp$200$$);
  });
  this.setAsync("AMP_STATE", function($expandSourceUrl$$) {
    var $win$jscomp$200$$ = $$jscomp$this$jscomp$121$$.ampdoc.getRootNode();
    return $getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($win$jscomp$200$$.documentElement || $win$jscomp$200$$).then(function($$jscomp$this$jscomp$121$$) {
      return $$jscomp$this$jscomp$121$$ ? $$jscomp$this$jscomp$121$$.getStateValue($expandSourceUrl$$) || "" : "";
    });
  });
};
function $JSCompiler_StaticMethods_addReplaceParamsIfMissing_$$($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$, $orig$$) {
  if ($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$ = $JSCompiler_StaticMethods_getDocInfo_$$($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$).replaceParams) {
    var $JSCompiler_url$jscomp$inline_658$$ = $removeAmpJsParamsFromUrl$$module$src$url$$($orig$$), $JSCompiler_existingParams$jscomp$inline_661_JSCompiler_location$jscomp$inline_660$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_url$jscomp$inline_658$$);
    $JSCompiler_existingParams$jscomp$inline_661_JSCompiler_location$jscomp$inline_660$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_existingParams$jscomp$inline_661_JSCompiler_location$jscomp$inline_660$$.search);
    for (var $JSCompiler_paramsToAdd$jscomp$inline_662$$ = $dict$$module$src$utils$object$$({}), $JSCompiler_keys$jscomp$inline_663$$ = Object.keys($JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$), $JSCompiler_i$jscomp$inline_664$$ = 0; $JSCompiler_i$jscomp$inline_664$$ < $JSCompiler_keys$jscomp$inline_663$$.length; $JSCompiler_i$jscomp$inline_664$$++) {
      $hasOwn_$$module$src$utils$object$$.call($JSCompiler_existingParams$jscomp$inline_661_JSCompiler_location$jscomp$inline_660$$, $JSCompiler_keys$jscomp$inline_663$$[$JSCompiler_i$jscomp$inline_664$$]) || ($JSCompiler_paramsToAdd$jscomp$inline_662$$[$JSCompiler_keys$jscomp$inline_663$$[$JSCompiler_i$jscomp$inline_664$$]] = $JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$[$JSCompiler_keys$jscomp$inline_663$$[$JSCompiler_i$jscomp$inline_664$$]]);
    }
    $JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$ = $addParamsToUrl$$module$src$url$$($JSCompiler_url$jscomp$inline_658$$, $JSCompiler_paramsToAdd$jscomp$inline_662$$);
  } else {
    $JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$ = $orig$$;
  }
  return $JSCompiler_StaticMethods_addReplaceParamsIfMissing_$self_JSCompiler_temp$jscomp$130_replaceParams$jscomp$1$$;
}
function $JSCompiler_StaticMethods_getDocInfo_$$($JSCompiler_StaticMethods_getDocInfo_$self$$) {
  return $Services$$module$src$services$documentInfoForDoc$$($JSCompiler_StaticMethods_getDocInfo_$self$$.ampdoc);
}
function $JSCompiler_StaticMethods_getAccessValue_$$($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$, $getter$jscomp$1$$, $expr$jscomp$8$$) {
  $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$ = $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$.ampdoc.getHeadNode();
  return Promise.all([$getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$, "access", "amp-access"), $getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$, "subscriptions", "amp-subscriptions")]).then(function($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$) {
    $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$ = $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$[0] || $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$[1];
    return $JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$ ? $getter$jscomp$1$$($JSCompiler_StaticMethods_getAccessValue_$self_element$jscomp$186$$) : ($user$$module$src$log$$().error("UrlReplacements", "Access or subsciptions service is not installed to access: ", $expr$jscomp$8$$), null);
  });
}
function $JSCompiler_StaticMethods_getQueryParamData_$$($JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$, $param$jscomp$13$$, $defaultValue$jscomp$5$$) {
  $userAssert$$module$src$log$$($param$jscomp$13$$, "The first argument to QUERY_PARAM, the query string param is required");
  var $params$jscomp$11_url$jscomp$92$$ = $parseUrlDeprecated$$module$src$url$$($removeAmpJsParamsFromUrl$$module$src$url$$($JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$.ampdoc.win.location.href));
  $params$jscomp$11_url$jscomp$92$$ = $parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$11_url$jscomp$92$$.search);
  $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$ = $JSCompiler_StaticMethods_getDocInfo_$$($JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$).replaceParams;
  return "undefined" !== typeof $params$jscomp$11_url$jscomp$92$$[$param$jscomp$13$$] ? $params$jscomp$11_url$jscomp$92$$[$param$jscomp$13$$] : $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$ && "undefined" !== typeof $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$[$param$jscomp$13$$] ? $JSCompiler_StaticMethods_getQueryParamData_$self_replaceParams$jscomp$2$$[$param$jscomp$13$$] : $defaultValue$jscomp$5$$;
}
function $JSCompiler_StaticMethods_getVariantsValue_$$($JSCompiler_StaticMethods_getVariantsValue_$self$$, $getter$jscomp$2$$, $expr$jscomp$9$$) {
  return $getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_getVariantsValue_$self$$.ampdoc.getHeadNode(), "variant", "amp-experiment", !0).then(function($JSCompiler_StaticMethods_getVariantsValue_$self$$) {
    $userAssert$$module$src$log$$($JSCompiler_StaticMethods_getVariantsValue_$self$$, "To use variable %s, amp-experiment should be configured", $expr$jscomp$9$$);
    return $JSCompiler_StaticMethods_getVariantsValue_$self$$.getVariants();
  }).then(function($JSCompiler_StaticMethods_getVariantsValue_$self$$) {
    return $getter$jscomp$2$$($JSCompiler_StaticMethods_getVariantsValue_$self$$);
  });
}
function $JSCompiler_StaticMethods_getGeo_$$($JSCompiler_StaticMethods_getGeo_$self_element$jscomp$187$$, $getter$jscomp$3$$) {
  $JSCompiler_StaticMethods_getGeo_$self_element$jscomp$187$$ = $JSCompiler_StaticMethods_getGeo_$self_element$jscomp$187$$.ampdoc.getHeadNode();
  return $getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_getGeo_$self_element$jscomp$187$$, "geo", "amp-geo", !0).then(function($JSCompiler_StaticMethods_getGeo_$self_element$jscomp$187$$) {
    $userAssert$$module$src$log$$($JSCompiler_StaticMethods_getGeo_$self_element$jscomp$187$$, "To use variable %s, amp-geo should be configured", "AMP_GEO");
    return $getter$jscomp$3$$($JSCompiler_StaticMethods_getGeo_$self_element$jscomp$187$$);
  });
}
function $JSCompiler_StaticMethods_getShareTrackingValue_$$($JSCompiler_StaticMethods_getShareTrackingValue_$self$$, $getter$jscomp$4$$, $expr$jscomp$11$$) {
  $JSCompiler_StaticMethods_getShareTrackingValue_$self$$.$shareTrackingFragments_$ || ($JSCompiler_StaticMethods_getShareTrackingValue_$self$$.$shareTrackingFragments_$ = $getElementServiceIfAvailable$$module$src$element_service$$($JSCompiler_StaticMethods_getShareTrackingValue_$self$$.ampdoc.win));
  return $JSCompiler_StaticMethods_getShareTrackingValue_$self$$.$shareTrackingFragments_$.then(function($JSCompiler_StaticMethods_getShareTrackingValue_$self$$) {
    $userAssert$$module$src$log$$($JSCompiler_StaticMethods_getShareTrackingValue_$self$$, "To use variable %s, amp-share-tracking should be configured", $expr$jscomp$11$$);
    return $getter$jscomp$4$$($JSCompiler_StaticMethods_getShareTrackingValue_$self$$);
  });
}
function $UrlReplacements$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$78$$, $variableSource$jscomp$1$$) {
  this.ampdoc = $ampdoc$jscomp$78$$;
  this.$variableSource_$ = $variableSource$jscomp$1$$;
}
$JSCompiler_prototypeAlias$$ = $UrlReplacements$$module$src$service$url_replacements_impl$$.prototype;
$JSCompiler_prototypeAlias$$.expandStringSync = function($source$jscomp$21$$, $opt_bindings$jscomp$2$$, $opt_collectVars$jscomp$1$$, $opt_whiteList$jscomp$3$$) {
  return (new $Expander$$module$src$service$url_expander$expander$$(this.$variableSource_$, $opt_bindings$jscomp$2$$, $opt_collectVars$jscomp$1$$, !0, $opt_whiteList$jscomp$3$$, !0)).expand($source$jscomp$21$$);
};
$JSCompiler_prototypeAlias$$.expandStringAsync = function($source$jscomp$22$$, $opt_bindings$jscomp$3$$, $opt_whiteList$jscomp$4$$) {
  return (new $Expander$$module$src$service$url_expander$expander$$(this.$variableSource_$, $opt_bindings$jscomp$3$$, void 0, void 0, $opt_whiteList$jscomp$4$$, !0)).expand($source$jscomp$22$$);
};
$JSCompiler_prototypeAlias$$.expandUrlSync = function($url$jscomp$93$$, $opt_bindings$jscomp$4$$, $opt_collectVars$jscomp$2$$, $opt_whiteList$jscomp$5$$) {
  return $JSCompiler_StaticMethods_ensureProtocolMatches_$$($url$jscomp$93$$, (new $Expander$$module$src$service$url_expander$expander$$(this.$variableSource_$, $opt_bindings$jscomp$4$$, $opt_collectVars$jscomp$2$$, !0, $opt_whiteList$jscomp$5$$)).expand($url$jscomp$93$$));
};
$JSCompiler_prototypeAlias$$.expandUrlAsync = function($url$jscomp$94$$, $opt_bindings$jscomp$5$$, $opt_whiteList$jscomp$6$$, $opt_noEncode$jscomp$1$$) {
  return (new $Expander$$module$src$service$url_expander$expander$$(this.$variableSource_$, $opt_bindings$jscomp$5$$, void 0, void 0, $opt_whiteList$jscomp$6$$, $opt_noEncode$jscomp$1$$)).expand($url$jscomp$94$$).then(function($opt_bindings$jscomp$5$$) {
    return $JSCompiler_StaticMethods_ensureProtocolMatches_$$($url$jscomp$94$$, $opt_bindings$jscomp$5$$);
  });
};
$JSCompiler_prototypeAlias$$.expandInputValueAsync = function($element$jscomp$188$$) {
  return $JSCompiler_StaticMethods_expandInputValue_$$(this, $element$jscomp$188$$, !1);
};
$JSCompiler_prototypeAlias$$.expandInputValueSync = function($element$jscomp$189$$) {
  return $JSCompiler_StaticMethods_expandInputValue_$$(this, $element$jscomp$189$$, !0);
};
function $JSCompiler_StaticMethods_expandInputValue_$$($JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$, $element$jscomp$190$$, $opt_sync$jscomp$1$$) {
  $devAssert$$module$src$log$$("INPUT" == $element$jscomp$190$$.tagName && "hidden" == ($element$jscomp$190$$.getAttribute("type") || "").toLowerCase());
  var $whitelist$jscomp$2$$ = $JSCompiler_StaticMethods_getWhitelistForElement_$$($element$jscomp$190$$);
  if (!$whitelist$jscomp$2$$) {
    return $opt_sync$jscomp$1$$ ? $element$jscomp$190$$.value : Promise.resolve($element$jscomp$190$$.value);
  }
  void 0 === $element$jscomp$190$$["amp-original-value"] && ($element$jscomp$190$$["amp-original-value"] = $element$jscomp$190$$.value);
  $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$ = (new $Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$.$variableSource_$, void 0, void 0, $opt_sync$jscomp$1$$, $whitelist$jscomp$2$$)).expand($element$jscomp$190$$["amp-original-value"] || $element$jscomp$190$$.value);
  return $opt_sync$jscomp$1$$ ? $element$jscomp$190$$.value = $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$ : $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$.then(function($JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$) {
    return $element$jscomp$190$$.value = $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$;
  });
}
function $JSCompiler_StaticMethods_getWhitelistForElement_$$($element$jscomp$191_whitelist$jscomp$3$$, $opt_supportedReplacement$$) {
  if ($element$jscomp$191_whitelist$jscomp$3$$ = $element$jscomp$191_whitelist$jscomp$3$$.getAttribute("data-amp-replace")) {
    var $requestedReplacements$$ = {};
    $element$jscomp$191_whitelist$jscomp$3$$.trim().split(/\s+/).forEach(function($element$jscomp$191_whitelist$jscomp$3$$) {
      !$opt_supportedReplacement$$ || $hasOwn_$$module$src$utils$object$$.call($opt_supportedReplacement$$, $element$jscomp$191_whitelist$jscomp$3$$) ? $requestedReplacements$$[$element$jscomp$191_whitelist$jscomp$3$$] = !0 : $user$$module$src$log$$().warn("URL", "Ignoring unsupported replacement", $element$jscomp$191_whitelist$jscomp$3$$);
    });
    return $requestedReplacements$$;
  }
}
$JSCompiler_prototypeAlias$$.maybeExpandLink = function($element$jscomp$192$$, $defaultUrlParams$$) {
  $devAssert$$module$src$log$$("A" == $element$jscomp$192$$.tagName);
  var $additionalUrlParameters$$ = $element$jscomp$192$$.getAttribute("data-amp-addparams") || "", $whitelist$jscomp$5$$ = $JSCompiler_StaticMethods_getWhitelistForElement_$$($element$jscomp$192$$, {CLIENT_ID:!0, QUERY_PARAM:!0, PAGE_VIEW_ID:!0, PAGE_VIEW_ID_64:!0, NAV_TIMING:!0});
  if ($whitelist$jscomp$5$$ || $additionalUrlParameters$$ || $defaultUrlParams$$) {
    var $href$jscomp$2$$ = $element$jscomp$192$$["amp-original-href"] || $element$jscomp$192$$.getAttribute("href"), $JSCompiler_inline_result$jscomp$197_url$jscomp$96$$ = $parseUrlDeprecated$$module$src$url$$($href$jscomp$2$$);
    null == $element$jscomp$192$$["amp-original-href"] && ($element$jscomp$192$$["amp-original-href"] = $href$jscomp$2$$);
    a: {
      var $JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$ = $Services$$module$src$services$documentInfoForDoc$$(this.ampdoc);
      if ($JSCompiler_inline_result$jscomp$197_url$jscomp$96$$.origin == $parseUrlDeprecated$$module$src$url$$($JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$.canonicalUrl).origin || $JSCompiler_inline_result$jscomp$197_url$jscomp$96$$.origin == $parseUrlDeprecated$$module$src$url$$($JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$.sourceUrl).origin) {
        $JSCompiler_inline_result$jscomp$197_url$jscomp$96$$ = !0;
      } else {
        if ($JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$ = this.ampdoc.getMetaByName("amp-link-variable-allowed-origin")) {
          $JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$ = $JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$.trim().split(/\s+/);
          for (var $JSCompiler_i$jscomp$inline_671$$ = 0; $JSCompiler_i$jscomp$inline_671$$ < $JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$.length; $JSCompiler_i$jscomp$inline_671$$++) {
            if ($JSCompiler_inline_result$jscomp$197_url$jscomp$96$$.origin == $parseUrlDeprecated$$module$src$url$$($JSCompiler_docInfo$jscomp$inline_668_JSCompiler_meta$jscomp$inline_669_JSCompiler_whitelist$jscomp$inline_670$$[$JSCompiler_i$jscomp$inline_671$$]).origin) {
              $JSCompiler_inline_result$jscomp$197_url$jscomp$96$$ = !0;
              break a;
            }
          }
        }
        $JSCompiler_inline_result$jscomp$197_url$jscomp$96$$ = !1;
      }
    }
    var $isAllowedOrigin$$ = $JSCompiler_inline_result$jscomp$197_url$jscomp$96$$;
    $additionalUrlParameters$$ && ($additionalUrlParameters$$ = $isAllowedOrigin$$ ? $JSCompiler_StaticMethods_expandSyncIfAllowedList_$$(this, $additionalUrlParameters$$, $whitelist$jscomp$5$$) : $additionalUrlParameters$$, $href$jscomp$2$$ = $addParamsToUrl$$module$src$url$$($href$jscomp$2$$, $parseQueryString_$$module$src$url_parse_query_string$$($additionalUrlParameters$$)));
    if (!$isAllowedOrigin$$) {
      return $whitelist$jscomp$5$$ && $user$$module$src$log$$().warn("URL", "Ignoring link replacement %s because the link does not go to the document's source, canonical, or whitelisted origin.", $href$jscomp$2$$), $element$jscomp$192$$.href = $href$jscomp$2$$;
    }
    $defaultUrlParams$$ && ($whitelist$jscomp$5$$ && $whitelist$jscomp$5$$.QUERY_PARAM || ($defaultUrlParams$$ = this.expandUrlSync($defaultUrlParams$$, void 0, void 0, {QUERY_PARAM:!0})), $href$jscomp$2$$ = $addParamsToUrl$$module$src$url$$($href$jscomp$2$$, $parseQueryString_$$module$src$url_parse_query_string$$($defaultUrlParams$$)));
    $href$jscomp$2$$ = $JSCompiler_StaticMethods_expandSyncIfAllowedList_$$(this, $href$jscomp$2$$, $whitelist$jscomp$5$$);
    return $element$jscomp$192$$.href = $href$jscomp$2$$;
  }
};
function $JSCompiler_StaticMethods_expandSyncIfAllowedList_$$($JSCompiler_StaticMethods_expandSyncIfAllowedList_$self$$, $href$jscomp$3$$, $allowedList$$) {
  return $allowedList$$ ? $JSCompiler_StaticMethods_expandSyncIfAllowedList_$self$$.expandUrlSync($href$jscomp$3$$, void 0, void 0, $allowedList$$) : $href$jscomp$3$$;
}
$JSCompiler_prototypeAlias$$.collectVars = function($url$jscomp$97$$, $opt_bindings$jscomp$6$$) {
  var $vars$jscomp$2$$ = Object.create(null);
  return (new $Expander$$module$src$service$url_expander$expander$$(this.$variableSource_$, $opt_bindings$jscomp$6$$, $vars$jscomp$2$$)).expand($url$jscomp$97$$).then(function() {
    return $vars$jscomp$2$$;
  });
};
$JSCompiler_prototypeAlias$$.collectUnwhitelistedVarsSync = function($element$jscomp$193$$) {
  var $url$jscomp$98$$ = $element$jscomp$193$$.getAttribute("src"), $macroNames$$ = (new $Expander$$module$src$service$url_expander$expander$$(this.$variableSource_$)).getMacroNames($url$jscomp$98$$), $whitelist$jscomp$6$$ = $JSCompiler_StaticMethods_getWhitelistForElement_$$($element$jscomp$193$$);
  return $whitelist$jscomp$6$$ ? $macroNames$$.filter(function($element$jscomp$193$$) {
    return !$whitelist$jscomp$6$$[$element$jscomp$193$$];
  }) : $macroNames$$;
};
function $JSCompiler_StaticMethods_ensureProtocolMatches_$$($url$jscomp$99$$, $replacement$jscomp$3$$) {
  var $newProtocol$$ = $parseUrlDeprecated$$module$src$url$$($replacement$jscomp$3$$, !0).protocol, $oldProtocol$$ = $parseUrlDeprecated$$module$src$url$$($url$jscomp$99$$, !0).protocol;
  if ($newProtocol$$ != $oldProtocol$$) {
    return $user$$module$src$log$$().error("UrlReplacements", "Illegal replacement of the protocol: ", $url$jscomp$99$$), $url$jscomp$99$$;
  }
  $userAssert$$module$src$log$$($isProtocolValid$$module$src$url$$($replacement$jscomp$3$$), "The replacement url has invalid protocol: %s", $replacement$jscomp$3$$);
  return $replacement$jscomp$3$$;
}
$JSCompiler_prototypeAlias$$.getVariableSource = function() {
  return this.$variableSource_$;
};
function $installUrlReplacementsServiceForDoc$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$79$$) {
  $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$79$$, "url-replace", function($ampdoc$jscomp$79$$) {
    return new $UrlReplacements$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$79$$, new $GlobalVariableSource$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$79$$));
  });
}
;var $TRIM_ORIGIN_PATTERN_$$module$src$service$viewer_impl$$ = /^(https?:\/\/)((www[0-9]*|web|ftp|wap|home|mobile|amp|m)\.)+/i;
function $ViewerImpl$$module$src$service$viewer_impl$$($ampdoc$jscomp$81$$) {
  var $$jscomp$this$jscomp$123$$ = this;
  this.ampdoc = $ampdoc$jscomp$81$$;
  this.win = $ampdoc$jscomp$81$$.win;
  this.$isIframed_$ = $isIframed$$module$src$dom$$(this.win);
  this.$isRuntimeOn_$ = !0;
  this.$overtakeHistory_$ = !1;
  this.$prerenderSize_$ = 1;
  this.$messageObservables_$ = $map$$module$src$utils$object$$();
  this.$messageResponders_$ = $map$$module$src$utils$object$$();
  this.$runtimeOnObservable_$ = new $Observable$$module$src$observable$$;
  this.$broadcastObservable_$ = new $Observable$$module$src$observable$$;
  this.$messagingOrigin_$ = this.$messageDeliverer_$ = null;
  this.$messageQueue_$ = [];
  this.$hashParams_$ = $map$$module$src$utils$object$$();
  $ampdoc$jscomp$81$$.isSingleDoc() && Object.assign(this.$hashParams_$, $parseQueryString_$$module$src$url_parse_query_string$$(this.win.location.hash));
  this.$isRuntimeOn_$ = !parseInt($ampdoc$jscomp$81$$.getParam("off"), 10);
  this.$overtakeHistory_$ = !(!parseInt($ampdoc$jscomp$81$$.getParam("history"), 10) && !this.$overtakeHistory_$);
  this.$prerenderSize_$ = parseInt($ampdoc$jscomp$81$$.getParam("prerenderSize"), 10) || this.$prerenderSize_$;
  $JSCompiler_StaticMethods_prerenderSizeDeprecation_$$(this);
  this.$isCctEmbedded_$ = null;
  this.$isProxyOrigin_$ = $isProxyOrigin$$module$src$url$$($parseUrlDeprecated$$module$src$url$$(this.ampdoc.win.location.href));
  var $messagingDeferred$$ = new $Deferred$$module$src$utils$promise$$;
  this.$messagingReadyResolver_$ = $messagingDeferred$$.resolve;
  this.$messagingReadyPromise_$ = $JSCompiler_StaticMethods_initMessagingChannel_$$(this, $messagingDeferred$$.promise);
  this.$viewerOrigin_$ = this.$isTrustedViewer_$ = null;
  var $referrerParam$$ = $ampdoc$jscomp$81$$.getParam("referrer");
  this.$unconfirmedReferrerUrl_$ = this.isEmbedded() && null != $referrerParam$$ && !1 !== $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$$(this) ? $referrerParam$$ : this.win.document.referrer;
  this.$referrerUrl_$ = new Promise(function($messagingDeferred$$) {
    $$jscomp$this$jscomp$123$$.isEmbedded() && null != $ampdoc$jscomp$81$$.getParam("referrer") ? $$jscomp$this$jscomp$123$$.isTrustedViewer().then(function($referrerParam$$) {
      $referrerParam$$ ? $messagingDeferred$$($ampdoc$jscomp$81$$.getParam("referrer")) : ($messagingDeferred$$($$jscomp$this$jscomp$123$$.win.document.referrer), $$jscomp$this$jscomp$123$$.$unconfirmedReferrerUrl_$ != $$jscomp$this$jscomp$123$$.win.document.referrer && ($dev$$module$src$log$$().expectedError("Viewer", "Untrusted viewer referrer override: " + $$jscomp$this$jscomp$123$$.$unconfirmedReferrerUrl_$ + " at " + $$jscomp$this$jscomp$123$$.$messagingOrigin_$), $$jscomp$this$jscomp$123$$.$unconfirmedReferrerUrl_$ = 
      $$jscomp$this$jscomp$123$$.win.document.referrer));
    }) : $messagingDeferred$$($$jscomp$this$jscomp$123$$.win.document.referrer);
  });
  this.$resolvedViewerUrl_$ = $removeFragment$$module$src$url$$(this.win.location.href || "");
  this.$viewerUrl_$ = new Promise(function($messagingDeferred$$) {
    var $referrerParam$$ = $ampdoc$jscomp$81$$.getParam("viewerUrl");
    $$jscomp$this$jscomp$123$$.isEmbedded() && $referrerParam$$ ? $$jscomp$this$jscomp$123$$.isTrustedViewer().then(function($ampdoc$jscomp$81$$) {
      $ampdoc$jscomp$81$$ ? $$jscomp$this$jscomp$123$$.$resolvedViewerUrl_$ = $devAssert$$module$src$log$$($referrerParam$$) : $dev$$module$src$log$$().expectedError("Viewer", "Untrusted viewer url override: " + $referrerParam$$ + " at " + $$jscomp$this$jscomp$123$$.$messagingOrigin_$);
      $messagingDeferred$$($$jscomp$this$jscomp$123$$.$resolvedViewerUrl_$);
    }) : $messagingDeferred$$($$jscomp$this$jscomp$123$$.$resolvedViewerUrl_$);
  });
  if (this.$hashParams_$.click) {
    var $newUrl$jscomp$2$$ = $removeFragment$$module$src$url$$(this.win.location.href);
    $newUrl$jscomp$2$$ != this.win.location.href && this.win.history.replaceState && (this.win.location.originalHash || (this.win.location.originalHash = this.win.location.hash), this.win.history.replaceState({}, "", $newUrl$jscomp$2$$), delete this.$hashParams_$.click);
  }
  this.ampdoc.whenFirstVisible().then(function() {
    $$jscomp$this$jscomp$123$$.maybeUpdateFragmentForCct();
  });
}
function $JSCompiler_StaticMethods_prerenderSizeDeprecation_$$($JSCompiler_StaticMethods_prerenderSizeDeprecation_$self$$) {
  1 !== $JSCompiler_StaticMethods_prerenderSizeDeprecation_$self$$.$prerenderSize_$ && $dev$$module$src$log$$().expectedError("Viewer", "prerenderSize (" + $JSCompiler_StaticMethods_prerenderSizeDeprecation_$self$$.$prerenderSize_$ + ") is deprecated (#27167)");
}
function $JSCompiler_StaticMethods_initMessagingChannel_$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$, $messagingPromise$$) {
  return $JSCompiler_StaticMethods_initMessagingChannel_$self$$.$isIframed_$ && !$JSCompiler_StaticMethods_initMessagingChannel_$self$$.win.__AMP_TEST_IFRAME && ($JSCompiler_StaticMethods_initMessagingChannel_$self$$.ampdoc.getParam("origin") || $JSCompiler_StaticMethods_initMessagingChannel_$self$$.ampdoc.getParam("visibilityState") || -1 != $JSCompiler_StaticMethods_initMessagingChannel_$self$$.win.location.search.indexOf("amp_js_v")) || $JSCompiler_StaticMethods_initMessagingChannel_$self$$.isWebviewEmbedded() || 
  $JSCompiler_StaticMethods_initMessagingChannel_$self$$.isCctEmbedded() || !$JSCompiler_StaticMethods_initMessagingChannel_$self$$.ampdoc.isSingleDoc() ? $Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$.win).timeoutPromise(20000, $messagingPromise$$, "initMessagingChannel timeout").catch(function($JSCompiler_StaticMethods_initMessagingChannel_$self$$) {
    ($JSCompiler_StaticMethods_initMessagingChannel_$self$$ = $getChannelError$$module$src$service$viewer_impl$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$)) && $endsWith$$module$src$string$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$.message, "initMessagingChannel timeout") && ($JSCompiler_StaticMethods_initMessagingChannel_$self$$ = $dev$$module$src$log$$().createExpectedError($JSCompiler_StaticMethods_initMessagingChannel_$self$$));
    $reportError$$module$src$error$$($JSCompiler_StaticMethods_initMessagingChannel_$self$$);
    throw $JSCompiler_StaticMethods_initMessagingChannel_$self$$;
  }) : null;
}
$JSCompiler_prototypeAlias$$ = $ViewerImpl$$module$src$service$viewer_impl$$.prototype;
$JSCompiler_prototypeAlias$$.getAmpDoc = function() {
  return this.ampdoc;
};
$JSCompiler_prototypeAlias$$.getParam = function($name$jscomp$137$$) {
  return this.ampdoc.getParam($name$jscomp$137$$);
};
$JSCompiler_prototypeAlias$$.hasCapability = function($name$jscomp$138$$) {
  var $capabilities$$ = this.ampdoc.getParam("cap");
  return $capabilities$$ ? -1 != $capabilities$$.split(",").indexOf($name$jscomp$138$$) : !1;
};
$JSCompiler_prototypeAlias$$.isEmbedded = function() {
  return !!this.$messagingReadyPromise_$;
};
$JSCompiler_prototypeAlias$$.isWebviewEmbedded = function() {
  return !this.$isIframed_$ && "1" == this.ampdoc.getParam("webview");
};
$JSCompiler_prototypeAlias$$.isCctEmbedded = function() {
  if (null != this.$isCctEmbedded_$) {
    return this.$isCctEmbedded_$;
  }
  this.$isCctEmbedded_$ = !1;
  if (!this.$isIframed_$) {
    var $queryParams$$ = $parseQueryString_$$module$src$url_parse_query_string$$(this.win.location.search);
    this.$isCctEmbedded_$ = "1" === $queryParams$$.amp_gsa && $startsWith$$module$src$string$$($queryParams$$.amp_js_v || "", "a");
  }
  return this.$isCctEmbedded_$;
};
$JSCompiler_prototypeAlias$$.isProxyOrigin = function() {
  return this.$isProxyOrigin_$;
};
$JSCompiler_prototypeAlias$$.maybeUpdateFragmentForCct = function() {
  if (this.isCctEmbedded() && this.win.history.replaceState) {
    var $sourceOrigin$jscomp$2$$ = $getSourceOrigin$$module$src$url$$(this.win.location.href), $canonicalUrl$jscomp$3$$ = $Services$$module$src$services$documentInfoForDoc$$(this.ampdoc).canonicalUrl, $canonicalSourceOrigin$$ = $getSourceOrigin$$module$src$url$$($canonicalUrl$jscomp$3$$);
    $JSCompiler_StaticMethods_hasRoughlySameOrigin_$$($sourceOrigin$jscomp$2$$, $canonicalSourceOrigin$$) && (this.$hashParams_$.ampshare = $canonicalUrl$jscomp$3$$, this.win.history.replaceState({}, "", "#" + $serializeQueryString$$module$src$url$$(this.$hashParams_$)));
  }
};
function $JSCompiler_StaticMethods_hasRoughlySameOrigin_$$($first$jscomp$6$$, $second$jscomp$2$$) {
  function $trimOrigin$$($first$jscomp$6$$) {
    return 2 < $first$jscomp$6$$.split(".").length ? $first$jscomp$6$$.replace($TRIM_ORIGIN_PATTERN_$$module$src$service$viewer_impl$$, "$1") : $first$jscomp$6$$;
  }
  return $trimOrigin$$($first$jscomp$6$$) == $trimOrigin$$($second$jscomp$2$$);
}
$JSCompiler_prototypeAlias$$.isRuntimeOn = function() {
  return this.$isRuntimeOn_$;
};
$JSCompiler_prototypeAlias$$.toggleRuntime = function() {
  this.$isRuntimeOn_$ = !this.$isRuntimeOn_$;
  this.$runtimeOnObservable_$.fire(this.$isRuntimeOn_$);
};
$JSCompiler_prototypeAlias$$.onRuntimeState = function($handler$jscomp$23$$) {
  return this.$runtimeOnObservable_$.add($handler$jscomp$23$$);
};
$JSCompiler_prototypeAlias$$.isOvertakeHistory = function() {
  return this.$overtakeHistory_$;
};
$JSCompiler_prototypeAlias$$.getVisibilityState = function() {
  return this.ampdoc.getVisibilityState();
};
$JSCompiler_prototypeAlias$$.isVisible = function() {
  return this.ampdoc.isVisible();
};
$JSCompiler_prototypeAlias$$.hasBeenVisible = function() {
  return this.ampdoc.hasBeenVisible();
};
$JSCompiler_prototypeAlias$$.whenFirstVisible = function() {
  return this.ampdoc.whenFirstVisible();
};
$JSCompiler_prototypeAlias$$.whenNextVisible = function() {
  return this.ampdoc.whenNextVisible();
};
$JSCompiler_prototypeAlias$$.getFirstVisibleTime = function() {
  return this.ampdoc.getFirstVisibleTime();
};
$JSCompiler_prototypeAlias$$.getLastVisibleTime = function() {
  return this.ampdoc.getLastVisibleTime();
};
$JSCompiler_prototypeAlias$$.onVisibilityChanged = function($handler$jscomp$24$$) {
  return this.ampdoc.onVisibilityChanged($handler$jscomp$24$$);
};
$JSCompiler_prototypeAlias$$.getPrerenderSize = function() {
  return this.$prerenderSize_$;
};
$JSCompiler_prototypeAlias$$.getResolvedViewerUrl = function() {
  return this.$resolvedViewerUrl_$;
};
$JSCompiler_prototypeAlias$$.getViewerUrl = function() {
  return this.$viewerUrl_$;
};
$JSCompiler_prototypeAlias$$.maybeGetMessagingOrigin = function() {
  return this.$messagingOrigin_$;
};
$JSCompiler_prototypeAlias$$.getUnconfirmedReferrerUrl = function() {
  return this.$unconfirmedReferrerUrl_$;
};
$JSCompiler_prototypeAlias$$.getReferrerUrl = function() {
  return this.$referrerUrl_$;
};
$JSCompiler_prototypeAlias$$.isTrustedViewer = function() {
  if (!this.$isTrustedViewer_$) {
    var $isTrustedAncestorOrigins$$ = $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$$(this);
    this.$isTrustedViewer_$ = void 0 !== $isTrustedAncestorOrigins$$ ? Promise.resolve($isTrustedAncestorOrigins$$) : this.$messagingReadyPromise_$.then(function($isTrustedAncestorOrigins$$) {
      return $isTrustedAncestorOrigins$$ ? $JSCompiler_StaticMethods_isTrustedViewerOrigin_$$($isTrustedAncestorOrigins$$) : !1;
    });
  }
  return this.$isTrustedViewer_$;
};
function $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$$($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$) {
  if (!$JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.isEmbedded()) {
    return !1;
  }
  if ($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.win.location.ancestorOrigins && !$JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.isWebviewEmbedded() && !$JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.isCctEmbedded()) {
    return 0 < $JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.win.location.ancestorOrigins.length && $JSCompiler_StaticMethods_isTrustedViewerOrigin_$$($JSCompiler_StaticMethods_isTrustedAncestorOrigins_$self$$.win.location.ancestorOrigins[0]);
  }
}
$JSCompiler_prototypeAlias$$.getViewerOrigin = function() {
  if (!this.$viewerOrigin_$) {
    var $origin$jscomp$17$$;
    this.isEmbedded() ? this.win.location.ancestorOrigins && 0 < this.win.location.ancestorOrigins.length && ($origin$jscomp$17$$ = this.win.location.ancestorOrigins[0]) : $origin$jscomp$17$$ = "";
    this.$viewerOrigin_$ = void 0 !== $origin$jscomp$17$$ ? Promise.resolve($origin$jscomp$17$$) : $Services$$module$src$services$timerFor$$(this.win).timeoutPromise(1000, this.$messagingReadyPromise_$).catch(function() {
      return "";
    });
  }
  return this.$viewerOrigin_$;
};
function $JSCompiler_StaticMethods_isTrustedViewerOrigin_$$($protocol$jscomp$2_urlString$jscomp$5$$) {
  var $url$jscomp$100$$ = $parseUrlDeprecated$$module$src$url$$($protocol$jscomp$2_urlString$jscomp$5$$);
  $protocol$jscomp$2_urlString$jscomp$5$$ = $url$jscomp$100$$.protocol;
  return "x-thread:" == $protocol$jscomp$2_urlString$jscomp$5$$ ? !0 : "https:" != $protocol$jscomp$2_urlString$jscomp$5$$ ? !1 : $urls$$module$src$config$$.trustedViewerHosts.some(function($protocol$jscomp$2_urlString$jscomp$5$$) {
    return $protocol$jscomp$2_urlString$jscomp$5$$.test($url$jscomp$100$$.hostname);
  });
}
$JSCompiler_prototypeAlias$$.onMessage = function($eventType$jscomp$17$$, $handler$jscomp$25$$) {
  var $observable$$ = this.$messageObservables_$[$eventType$jscomp$17$$];
  $observable$$ || ($observable$$ = new $Observable$$module$src$observable$$, this.$messageObservables_$[$eventType$jscomp$17$$] = $observable$$);
  return $observable$$.add($handler$jscomp$25$$);
};
$JSCompiler_prototypeAlias$$.onMessageRespond = function($eventType$jscomp$18$$, $responder$jscomp$1$$) {
  var $$jscomp$this$jscomp$125$$ = this;
  this.$messageResponders_$[$eventType$jscomp$18$$] = $responder$jscomp$1$$;
  return function() {
    $$jscomp$this$jscomp$125$$.$messageResponders_$[$eventType$jscomp$18$$] === $responder$jscomp$1$$ && delete $$jscomp$this$jscomp$125$$.$messageResponders_$[$eventType$jscomp$18$$];
  };
};
$JSCompiler_prototypeAlias$$.receiveMessage = function($eventType$jscomp$19_responder$jscomp$2$$, $JSCompiler_state$jscomp$inline_674_data$jscomp$108$$) {
  if ("visibilitychange" == $eventType$jscomp$19_responder$jscomp$2$$) {
    void 0 !== $JSCompiler_state$jscomp$inline_674_data$jscomp$108$$.prerenderSize && (this.$prerenderSize_$ = $JSCompiler_state$jscomp$inline_674_data$jscomp$108$$.prerenderSize, $JSCompiler_StaticMethods_prerenderSizeDeprecation_$$(this));
    if ($JSCompiler_state$jscomp$inline_674_data$jscomp$108$$ = $JSCompiler_state$jscomp$inline_674_data$jscomp$108$$.state) {
      $JSCompiler_state$jscomp$inline_674_data$jscomp$108$$ = $dev$$module$src$log$$().assertEnumValue($VisibilityState$$module$src$visibility_state$$, $JSCompiler_state$jscomp$inline_674_data$jscomp$108$$, "VisibilityState"), "hidden" === $JSCompiler_state$jscomp$inline_674_data$jscomp$108$$ && ($JSCompiler_state$jscomp$inline_674_data$jscomp$108$$ = null != this.ampdoc.getLastVisibleTime() ? "inactive" : "prerender"), this.ampdoc.overrideVisibilityState($JSCompiler_state$jscomp$inline_674_data$jscomp$108$$);
    }
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  if ("broadcast" == $eventType$jscomp$19_responder$jscomp$2$$) {
    return this.$broadcastObservable_$.fire($JSCompiler_state$jscomp$inline_674_data$jscomp$108$$), $resolvedPromise$$module$src$resolved_promise$$();
  }
  var $observable$jscomp$1$$ = this.$messageObservables_$[$eventType$jscomp$19_responder$jscomp$2$$];
  $observable$jscomp$1$$ && $observable$jscomp$1$$.fire($JSCompiler_state$jscomp$inline_674_data$jscomp$108$$);
  if ($eventType$jscomp$19_responder$jscomp$2$$ = this.$messageResponders_$[$eventType$jscomp$19_responder$jscomp$2$$]) {
    return $eventType$jscomp$19_responder$jscomp$2$$($JSCompiler_state$jscomp$inline_674_data$jscomp$108$$);
  }
  if ($observable$jscomp$1$$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
};
$JSCompiler_prototypeAlias$$.setMessageDeliverer = function($deliverer$jscomp$1_queue$jscomp$5$$, $origin$jscomp$18$$) {
  var $$jscomp$this$jscomp$126$$ = this;
  if (this.$messageDeliverer_$) {
    throw Error("message channel can only be initialized once");
  }
  if (null == $origin$jscomp$18$$) {
    throw Error("message channel must have an origin");
  }
  this.$messageDeliverer_$ = $deliverer$jscomp$1_queue$jscomp$5$$;
  this.$messagingOrigin_$ = $origin$jscomp$18$$;
  this.$messagingReadyResolver_$($origin$jscomp$18$$);
  0 < this.$messageQueue_$.length && ($deliverer$jscomp$1_queue$jscomp$5$$ = this.$messageQueue_$.slice(0), this.$messageQueue_$ = [], $deliverer$jscomp$1_queue$jscomp$5$$.forEach(function($deliverer$jscomp$1_queue$jscomp$5$$) {
    var $origin$jscomp$18$$ = $$jscomp$this$jscomp$126$$.$messageDeliverer_$($deliverer$jscomp$1_queue$jscomp$5$$.eventType, $deliverer$jscomp$1_queue$jscomp$5$$.data, $deliverer$jscomp$1_queue$jscomp$5$$.awaitResponse);
    $deliverer$jscomp$1_queue$jscomp$5$$.awaitResponse && $deliverer$jscomp$1_queue$jscomp$5$$.responseResolver($origin$jscomp$18$$);
  }));
};
$JSCompiler_prototypeAlias$$.sendMessage = function($eventType$jscomp$20$$, $data$jscomp$109$$, $cancelUnsent$jscomp$2$$) {
  $JSCompiler_StaticMethods_sendMessageInternal_$$(this, $eventType$jscomp$20$$, $data$jscomp$109$$, void 0 === $cancelUnsent$jscomp$2$$ ? !1 : $cancelUnsent$jscomp$2$$, !1);
};
$JSCompiler_prototypeAlias$$.sendMessageAwaitResponse = function($eventType$jscomp$21$$, $data$jscomp$110$$, $cancelUnsent$jscomp$3$$) {
  return $JSCompiler_StaticMethods_sendMessageInternal_$$(this, $eventType$jscomp$21$$, $data$jscomp$110$$, void 0 === $cancelUnsent$jscomp$3$$ ? !1 : $cancelUnsent$jscomp$3$$, !0);
};
function $JSCompiler_StaticMethods_sendMessageInternal_$$($JSCompiler_StaticMethods_sendMessageInternal_$self$$, $eventType$jscomp$22$$, $data$jscomp$111$$, $$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$, $awaitResponse$jscomp$1$$) {
  if ($JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messageDeliverer_$) {
    return $tryResolve$$module$src$utils$promise$$(function() {
      return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messageDeliverer_$($eventType$jscomp$22$$, $data$jscomp$111$$, $awaitResponse$jscomp$1$$);
    });
  }
  if (!$JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messagingReadyPromise_$) {
    return $awaitResponse$jscomp$1$$ ? Promise.reject($getChannelError$$module$src$service$viewer_impl$$()) : $resolvedPromise$$module$src$resolved_promise$$();
  }
  if (!$$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$) {
    return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messagingReadyPromise_$.then(function() {
      return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messageDeliverer_$($eventType$jscomp$22$$, $data$jscomp$111$$, $awaitResponse$jscomp$1$$);
    });
  }
  var $found$$ = $findIndex$$module$src$utils$array$$($JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messageQueue_$, function($JSCompiler_StaticMethods_sendMessageInternal_$self$$) {
    return $JSCompiler_StaticMethods_sendMessageInternal_$self$$.eventType == $eventType$jscomp$22$$;
  });
  -1 != $found$$ ? ($$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$ = $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messageQueue_$.splice($found$$, 1)[0], $$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$.data = $data$jscomp$111$$, $$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$.awaitResponse = $$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$.awaitResponse || $awaitResponse$jscomp$1$$) : ($$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$ = 
  new $Deferred$$module$src$utils$promise$$, $$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$ = {eventType:$eventType$jscomp$22$$, data:$data$jscomp$111$$, awaitResponse:$awaitResponse$jscomp$1$$, responsePromise:$$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$.promise, responseResolver:$$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$.resolve});
  $JSCompiler_StaticMethods_sendMessageInternal_$self$$.$messageQueue_$.push($$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$);
  return $$jscomp$destructuring$var116_cancelUnsent$jscomp$4_message$jscomp$50$$.responsePromise;
}
$JSCompiler_prototypeAlias$$.broadcast = function($message$jscomp$51$$) {
  return this.$messagingReadyPromise_$ ? $JSCompiler_StaticMethods_sendMessageInternal_$$(this, "broadcast", $message$jscomp$51$$, !1, !1).then(function() {
    return !0;
  }, function() {
    return !1;
  }) : Promise.resolve(!1);
};
$JSCompiler_prototypeAlias$$.onBroadcast = function($handler$jscomp$26$$) {
  return this.$broadcastObservable_$.add($handler$jscomp$26$$);
};
$JSCompiler_prototypeAlias$$.whenMessagingReady = function() {
  return this.$messagingReadyPromise_$;
};
$JSCompiler_prototypeAlias$$.replaceUrl = function($newUrl$jscomp$3$$) {
  if ($newUrl$jscomp$3$$ && this.ampdoc.isSingleDoc() && this.win.history.replaceState) {
    try {
      var $url$jscomp$101$$ = $parseUrlDeprecated$$module$src$url$$(this.win.location.href), $replaceUrl$$ = $parseUrlDeprecated$$module$src$url$$($removeFragment$$module$src$url$$($newUrl$jscomp$3$$) + this.win.location.hash);
      $url$jscomp$101$$.origin == $replaceUrl$$.origin && $getSourceOrigin$$module$src$url$$($url$jscomp$101$$) == $getSourceOrigin$$module$src$url$$($replaceUrl$$) && (this.win.history.replaceState({}, "", $replaceUrl$$.href), this.win.location.originalHref = $url$jscomp$101$$.href);
    } catch ($e$jscomp$84$$) {
      $dev$$module$src$log$$().error("Viewer", "replaceUrl failed", $e$jscomp$84$$);
    }
  }
};
function $getChannelError$$module$src$service$viewer_impl$$($opt_reason$jscomp$3$$) {
  if ($opt_reason$jscomp$3$$ instanceof Error) {
    $opt_reason$jscomp$3$$ = $duplicateErrorIfNecessary$$module$src$log$$($opt_reason$jscomp$3$$);
    $opt_reason$jscomp$3$$.message = "No messaging channel: " + $opt_reason$jscomp$3$$.message;
    var $channelError$$ = $opt_reason$jscomp$3$$;
  } else {
    $channelError$$ = Error("No messaging channel: " + $opt_reason$jscomp$3$$);
  }
  $channelError$$.message = $channelError$$.message.replace("\u200b\u200b\u200b", "");
  return $channelError$$;
}
;function $bezierCurve$$module$src$curve$$($x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$3$$, $y2$jscomp$3$$) {
  var $bezier$$ = new $Bezier$$module$src$curve$$($x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$3$$, $y2$jscomp$3$$);
  return $bezier$$.solveYValueFromXValue.bind($bezier$$);
}
function $Bezier$$module$src$curve$$($x1$jscomp$7$$, $y1$jscomp$7$$, $x2$jscomp$4$$, $y2$jscomp$4$$) {
  this.y0 = this.x0 = 0;
  this.x1 = $x1$jscomp$7$$;
  this.y1 = $y1$jscomp$7$$;
  this.x2 = $x2$jscomp$4$$;
  this.y2 = $y2$jscomp$4$$;
  this.y3 = this.x3 = 1;
}
$JSCompiler_prototypeAlias$$ = $Bezier$$module$src$curve$$.prototype;
$JSCompiler_prototypeAlias$$.solveYValueFromXValue = function($xVal$$) {
  return this.getPointY(this.solvePositionFromXValue($xVal$$));
};
$JSCompiler_prototypeAlias$$.solvePositionFromXValue = function($xVal$jscomp$1$$) {
  var $t$jscomp$6$$ = ($xVal$jscomp$1$$ - this.x0) / (this.x3 - this.x0);
  if (0 >= $t$jscomp$6$$) {
    return 0;
  }
  if (1 <= $t$jscomp$6$$) {
    return 1;
  }
  for (var $tMin$$ = 0, $tMax$$ = 1, $value$jscomp$141$$ = 0, $i$60_i$jscomp$89$$ = 0; 8 > $i$60_i$jscomp$89$$; $i$60_i$jscomp$89$$++) {
    $value$jscomp$141$$ = this.getPointX($t$jscomp$6$$);
    var $derivative$$ = (this.getPointX($t$jscomp$6$$ + 1e-6) - $value$jscomp$141$$) / 1e-6;
    if (1e-6 > Math.abs($value$jscomp$141$$ - $xVal$jscomp$1$$)) {
      return $t$jscomp$6$$;
    }
    if (1e-6 > Math.abs($derivative$$)) {
      break;
    } else {
      $value$jscomp$141$$ < $xVal$jscomp$1$$ ? $tMin$$ = $t$jscomp$6$$ : $tMax$$ = $t$jscomp$6$$, $t$jscomp$6$$ -= ($value$jscomp$141$$ - $xVal$jscomp$1$$) / $derivative$$;
    }
  }
  for ($i$60_i$jscomp$89$$ = 0; 1e-6 < Math.abs($value$jscomp$141$$ - $xVal$jscomp$1$$) && 8 > $i$60_i$jscomp$89$$; $i$60_i$jscomp$89$$++) {
    $value$jscomp$141$$ < $xVal$jscomp$1$$ ? ($tMin$$ = $t$jscomp$6$$, $t$jscomp$6$$ = ($t$jscomp$6$$ + $tMax$$) / 2) : ($tMax$$ = $t$jscomp$6$$, $t$jscomp$6$$ = ($t$jscomp$6$$ + $tMin$$) / 2), $value$jscomp$141$$ = this.getPointX($t$jscomp$6$$);
  }
  return $t$jscomp$6$$;
};
$JSCompiler_prototypeAlias$$.getPointX = function($t$jscomp$7$$) {
  if (0 == $t$jscomp$7$$) {
    return this.x0;
  }
  if (1 == $t$jscomp$7$$) {
    return this.x3;
  }
  var $ix0$$ = this.lerp(this.x0, this.x1, $t$jscomp$7$$), $ix1$$ = this.lerp(this.x1, this.x2, $t$jscomp$7$$), $ix2$$ = this.lerp(this.x2, this.x3, $t$jscomp$7$$);
  $ix0$$ = this.lerp($ix0$$, $ix1$$, $t$jscomp$7$$);
  $ix1$$ = this.lerp($ix1$$, $ix2$$, $t$jscomp$7$$);
  return this.lerp($ix0$$, $ix1$$, $t$jscomp$7$$);
};
$JSCompiler_prototypeAlias$$.getPointY = function($t$jscomp$8$$) {
  if (0 == $t$jscomp$8$$) {
    return this.y0;
  }
  if (1 == $t$jscomp$8$$) {
    return this.y3;
  }
  var $iy0$$ = this.lerp(this.y0, this.y1, $t$jscomp$8$$), $iy1$$ = this.lerp(this.y1, this.y2, $t$jscomp$8$$), $iy2$$ = this.lerp(this.y2, this.y3, $t$jscomp$8$$);
  $iy0$$ = this.lerp($iy0$$, $iy1$$, $t$jscomp$8$$);
  $iy1$$ = this.lerp($iy1$$, $iy2$$, $t$jscomp$8$$);
  return this.lerp($iy0$$, $iy1$$, $t$jscomp$8$$);
};
$JSCompiler_prototypeAlias$$.lerp = function($a$jscomp$4$$, $b$jscomp$4$$, $x$jscomp$86$$) {
  return $a$jscomp$4$$ + $x$jscomp$86$$ * ($b$jscomp$4$$ - $a$jscomp$4$$);
};
var $Curves$$module$src$curve$EASE$$ = $bezierCurve$$module$src$curve$$(0.25, 0.1, 0.25, 1.0), $Curves$$module$src$curve$EASE_IN$$ = $bezierCurve$$module$src$curve$$(0.42, 0.0, 1.0, 1.0), $Curves$$module$src$curve$EASE_OUT$$ = $bezierCurve$$module$src$curve$$(0.0, 0.0, 0.58, 1.0), $Curves$$module$src$curve$EASE_IN_OUT$$ = $bezierCurve$$module$src$curve$$(0.42, 0.0, 0.58, 1.0), $NAME_MAP$$module$src$curve$$ = {linear:function($n$jscomp$14$$) {
  return $n$jscomp$14$$;
}, ease:$Curves$$module$src$curve$EASE$$, "ease-in":$Curves$$module$src$curve$EASE_IN$$, "ease-out":$Curves$$module$src$curve$EASE_OUT$$, "ease-in-out":$Curves$$module$src$curve$EASE_IN_OUT$$};
function $getCurve$$module$src$curve$$($curve$$) {
  if (!$curve$$) {
    return null;
  }
  if ("string" == typeof $curve$$) {
    if (-1 != $curve$$.indexOf("cubic-bezier")) {
      var $match$jscomp$8_values$jscomp$16$$ = $curve$$.match(/cubic-bezier\((.+)\)/);
      if ($match$jscomp$8_values$jscomp$16$$ && ($match$jscomp$8_values$jscomp$16$$ = $match$jscomp$8_values$jscomp$16$$[1].split(",").map(parseFloat), 4 == $match$jscomp$8_values$jscomp$16$$.length)) {
        for (var $i$jscomp$90$$ = 0; 4 > $i$jscomp$90$$; $i$jscomp$90$$++) {
          if (isNaN($match$jscomp$8_values$jscomp$16$$[$i$jscomp$90$$])) {
            return null;
          }
        }
        return $bezierCurve$$module$src$curve$$($match$jscomp$8_values$jscomp$16$$[0], $match$jscomp$8_values$jscomp$16$$[1], $match$jscomp$8_values$jscomp$16$$[2], $match$jscomp$8_values$jscomp$16$$[3]);
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
  this.$vsync_$ = $Services$$module$src$services$vsyncFor$$(self);
  this.$curve_$ = null;
  this.$segments_$ = [];
}
function $Animation$$module$src$animation$animate$$($contextNode$jscomp$3$$, $transition$jscomp$2$$, $duration$jscomp$1$$, $opt_curve$$) {
  return (new $Animation$$module$src$animation$$($contextNode$jscomp$3$$)).setCurve($opt_curve$$).add(0, $transition$jscomp$2$$, 1).start($duration$jscomp$1$$);
}
$Animation$$module$src$animation$$.prototype.setCurve = function($curve$jscomp$1$$) {
  $curve$jscomp$1$$ && (this.$curve_$ = $getCurve$$module$src$curve$$($curve$jscomp$1$$));
  return this;
};
$Animation$$module$src$animation$$.prototype.add = function($delay$jscomp$5$$, $transition$jscomp$3$$, $duration$jscomp$2$$, $opt_curve$jscomp$1$$) {
  this.$segments_$.push({delay:$delay$jscomp$5$$, func:$transition$jscomp$3$$, duration:$duration$jscomp$2$$, curve:$getCurve$$module$src$curve$$($opt_curve$jscomp$1$$)});
  return this;
};
$Animation$$module$src$animation$$.prototype.start = function($duration$jscomp$3$$) {
  return new $AnimationPlayer$$module$src$animation$$(this.$vsync_$, this.$contextNode_$, this.$segments_$, this.$curve_$, $duration$jscomp$3$$);
};
function $AnimationPlayer$$module$src$animation$$($i$jscomp$91_vsync$jscomp$1$$, $contextNode$jscomp$4$$, $deferred$jscomp$18_segments$jscomp$2$$, $defaultCurve$$, $duration$jscomp$4$$) {
  this.$vsync_$ = $i$jscomp$91_vsync$jscomp$1$$;
  this.$contextNode_$ = $contextNode$jscomp$4$$;
  this.$segments_$ = [];
  for ($i$jscomp$91_vsync$jscomp$1$$ = 0; $i$jscomp$91_vsync$jscomp$1$$ < $deferred$jscomp$18_segments$jscomp$2$$.length; $i$jscomp$91_vsync$jscomp$1$$++) {
    var $segment$$ = $deferred$jscomp$18_segments$jscomp$2$$[$i$jscomp$91_vsync$jscomp$1$$];
    this.$segments_$.push({delay:$segment$$.delay, func:$segment$$.func, duration:$segment$$.duration, curve:$segment$$.curve || $defaultCurve$$, started:!1, completed:!1});
  }
  this.$duration_$ = $duration$jscomp$4$$;
  this.$startTime_$ = Date.now();
  this.$running_$ = !0;
  this.$state_$ = {};
  $deferred$jscomp$18_segments$jscomp$2$$ = new $Deferred$$module$src$utils$promise$$;
  this.$promise_$ = $deferred$jscomp$18_segments$jscomp$2$$.promise;
  this.$resolve_$ = $deferred$jscomp$18_segments$jscomp$2$$.resolve;
  this.$reject_$ = $deferred$jscomp$18_segments$jscomp$2$$.reject;
  this.$task_$ = this.$vsync_$.createAnimTask(this.$contextNode_$, {mutate:this.$stepMutate_$.bind(this)});
  this.$vsync_$.canAnimate(this.$contextNode_$) ? this.$task_$(this.$state_$) : ($dev$$module$src$log$$().warn("Animation", "cannot animate"), $JSCompiler_StaticMethods_complete_$$(this, !1, 0));
}
$AnimationPlayer$$module$src$animation$$.prototype.then = function($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) {
  return $opt_resolve$jscomp$1$$ || $opt_reject$jscomp$1$$ ? this.$promise_$.then($opt_resolve$jscomp$1$$, $opt_reject$jscomp$1$$) : this.$promise_$;
};
$AnimationPlayer$$module$src$animation$$.prototype.thenAlways = function($callback$jscomp$90_opt_callback$jscomp$9$$) {
  $callback$jscomp$90_opt_callback$jscomp$9$$ = $callback$jscomp$90_opt_callback$jscomp$9$$ || $NOOP_CALLBACK$$module$src$animation$$;
  return this.then($callback$jscomp$90_opt_callback$jscomp$9$$, $callback$jscomp$90_opt_callback$jscomp$9$$);
};
$AnimationPlayer$$module$src$animation$$.prototype.halt = function($opt_dir$$) {
  $JSCompiler_StaticMethods_complete_$$(this, !1, $opt_dir$$ || 0);
};
function $JSCompiler_StaticMethods_complete_$$($JSCompiler_StaticMethods_complete_$self$$, $success$jscomp$4$$, $dir$jscomp$1_i$jscomp$92$$) {
  if ($JSCompiler_StaticMethods_complete_$self$$.$running_$) {
    $JSCompiler_StaticMethods_complete_$self$$.$running_$ = !1;
    if (0 != $dir$jscomp$1_i$jscomp$92$$) {
      1 < $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length && $JSCompiler_StaticMethods_complete_$self$$.$segments_$.sort(function($JSCompiler_StaticMethods_complete_$self$$, $success$jscomp$4$$) {
        return $JSCompiler_StaticMethods_complete_$self$$.delay + $JSCompiler_StaticMethods_complete_$self$$.duration - ($success$jscomp$4$$.delay + $success$jscomp$4$$.duration);
      });
      try {
        if (0 < $dir$jscomp$1_i$jscomp$92$$) {
          for ($dir$jscomp$1_i$jscomp$92$$ = 0; $dir$jscomp$1_i$jscomp$92$$ < $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length; $dir$jscomp$1_i$jscomp$92$$++) {
            $JSCompiler_StaticMethods_complete_$self$$.$segments_$[$dir$jscomp$1_i$jscomp$92$$].func(1, !0);
          }
        } else {
          for (var $i$61$$ = $JSCompiler_StaticMethods_complete_$self$$.$segments_$.length - 1; 0 <= $i$61$$; $i$61$$--) {
            $JSCompiler_StaticMethods_complete_$self$$.$segments_$[$i$61$$].func(0, !1);
          }
        }
      } catch ($e$jscomp$85$$) {
        $dev$$module$src$log$$().error("Animation", "completion failed: " + $e$jscomp$85$$, $e$jscomp$85$$), $success$jscomp$4$$ = !1;
      }
    }
    $success$jscomp$4$$ ? $JSCompiler_StaticMethods_complete_$self$$.$resolve_$() : $JSCompiler_StaticMethods_complete_$self$$.$reject_$();
  }
}
$AnimationPlayer$$module$src$animation$$.prototype.$stepMutate_$ = function() {
  if (this.$running_$) {
    for (var $currentTime$$ = Date.now(), $normLinearTime$$ = Math.min(($currentTime$$ - this.$startTime_$) / this.$duration_$, 1), $i$62_i$jscomp$93$$ = 0; $i$62_i$jscomp$93$$ < this.$segments_$.length; $i$62_i$jscomp$93$$++) {
      var $segment$63_segment$jscomp$1$$ = this.$segments_$[$i$62_i$jscomp$93$$];
      !$segment$63_segment$jscomp$1$$.started && $normLinearTime$$ >= $segment$63_segment$jscomp$1$$.delay && ($segment$63_segment$jscomp$1$$.started = !0);
    }
    for ($i$62_i$jscomp$93$$ = 0; $i$62_i$jscomp$93$$ < this.$segments_$.length; $i$62_i$jscomp$93$$++) {
      if ($segment$63_segment$jscomp$1$$ = this.$segments_$[$i$62_i$jscomp$93$$], $segment$63_segment$jscomp$1$$.started && !$segment$63_segment$jscomp$1$$.completed) {
        a: {
          var $JSCompiler_normLinearTime$jscomp$inline_679$$;
          if (0 < $segment$63_segment$jscomp$1$$.duration) {
            var $JSCompiler_normTime$jscomp$inline_680$$ = $JSCompiler_normLinearTime$jscomp$inline_679$$ = Math.min(($normLinearTime$$ - $segment$63_segment$jscomp$1$$.delay) / $segment$63_segment$jscomp$1$$.duration, 1);
            if ($segment$63_segment$jscomp$1$$.curve && 1 != $JSCompiler_normTime$jscomp$inline_680$$) {
              try {
                $JSCompiler_normTime$jscomp$inline_680$$ = $segment$63_segment$jscomp$1$$.curve($JSCompiler_normLinearTime$jscomp$inline_679$$);
              } catch ($JSCompiler_e$jscomp$inline_681$$) {
                $dev$$module$src$log$$().error("Animation", "step curve failed: " + $JSCompiler_e$jscomp$inline_681$$, $JSCompiler_e$jscomp$inline_681$$);
                $JSCompiler_StaticMethods_complete_$$(this, !1, 0);
                break a;
              }
            }
          } else {
            $JSCompiler_normTime$jscomp$inline_680$$ = $JSCompiler_normLinearTime$jscomp$inline_679$$ = 1;
          }
          1 == $JSCompiler_normLinearTime$jscomp$inline_679$$ && ($segment$63_segment$jscomp$1$$.completed = !0);
          try {
            $segment$63_segment$jscomp$1$$.func($JSCompiler_normTime$jscomp$inline_680$$, $segment$63_segment$jscomp$1$$.completed);
          } catch ($e$64$jscomp$inline_682$$) {
            $dev$$module$src$log$$().error("Animation", "step mutate failed: " + $e$64$jscomp$inline_682$$, $e$64$jscomp$inline_682$$), $JSCompiler_StaticMethods_complete_$$(this, !1, 0);
          }
        }
      }
    }
    1 == $normLinearTime$$ ? $JSCompiler_StaticMethods_complete_$$(this, !0, 0) : this.$vsync_$.canAnimate(this.$contextNode_$) ? this.$task_$(this.$state_$) : ($dev$$module$src$log$$().warn("Animation", "cancel animation"), $JSCompiler_StaticMethods_complete_$$(this, !1, 0));
  }
};
function $isLightbox$$module$src$service$fixed_layer$$($el$jscomp$18$$) {
  return -1 !== $el$jscomp$18$$.tagName.indexOf("LIGHTBOX");
}
function $FixedLayer$$module$src$service$fixed_layer$$($ampdoc$jscomp$83$$, $vsync$jscomp$2$$, $borderTop$$, $paddingTop$$, $transfer$jscomp$5$$) {
  var $$jscomp$this$jscomp$128$$ = this;
  this.ampdoc = $ampdoc$jscomp$83$$;
  this.$vsync_$ = $vsync$jscomp$2$$;
  this.$borderTop_$ = $borderTop$$;
  this.$committedPaddingTop_$ = this.$paddingTop_$ = $paddingTop$$;
  this.$transfer_$ = $transfer$jscomp$5$$ && $ampdoc$jscomp$83$$.isSingleDoc();
  this.$transferLayer_$ = null;
  this.$counter_$ = 0;
  this.$elements_$ = [];
  this.$updatePass_$ = new $Pass$$module$src$pass$$($ampdoc$jscomp$83$$.win, function() {
    return $$jscomp$this$jscomp$128$$.update();
  });
  this.$hiddenObserverUnlistener_$ = null;
  this.$fixedSelectors_$ = [];
  this.$stickySelectors_$ = [];
}
$JSCompiler_prototypeAlias$$ = $FixedLayer$$module$src$service$fixed_layer$$.prototype;
$JSCompiler_prototypeAlias$$.enterLightbox = function($opt_lightbox$$, $opt_onComplete$$) {
  var $$jscomp$this$jscomp$129$$ = this, $transferLayer$$ = $JSCompiler_StaticMethods_getTransferLayer_$$(this);
  $transferLayer$$ && $transferLayer$$.setLightboxMode(!0);
  $opt_lightbox$$ && $opt_onComplete$$ && $opt_onComplete$$.then(function() {
    $JSCompiler_StaticMethods_trySetupSelectors_$$($$jscomp$this$jscomp$129$$, $opt_lightbox$$, !0);
    $JSCompiler_StaticMethods_sortInDomOrder_$$($$jscomp$this$jscomp$129$$);
    $$jscomp$this$jscomp$129$$.update();
  });
};
$JSCompiler_prototypeAlias$$.leaveLightbox = function() {
  var $transferLayer$jscomp$1$$ = $JSCompiler_StaticMethods_getTransferLayer_$$(this);
  $transferLayer$jscomp$1$$ && $transferLayer$jscomp$1$$.setLightboxMode(!1);
  var $fes$$ = $remove$$module$src$utils$array$$(this.$elements_$, function($transferLayer$jscomp$1$$) {
    return !!$transferLayer$jscomp$1$$.lightboxed;
  });
  $JSCompiler_StaticMethods_returnFixedElements_$$(this, $fes$$);
  this.$elements_$.length || $JSCompiler_StaticMethods_unobserveHiddenMutations_$$(this);
};
$JSCompiler_prototypeAlias$$.setup = function() {
  var $platform$jscomp$3_root$jscomp$18_viewer$jscomp$16$$ = $Services$$module$src$services$viewerForDoc$$(this.ampdoc);
  if (!$getMode$$module$src$mode$$().localDev && !$platform$jscomp$3_root$jscomp$18_viewer$jscomp$16$$.isEmbedded()) {
    return !1;
  }
  $platform$jscomp$3_root$jscomp$18_viewer$jscomp$16$$ = this.ampdoc.getRootNode();
  var $stylesheets$$ = $platform$jscomp$3_root$jscomp$18_viewer$jscomp$16$$.styleSheets;
  if (!$stylesheets$$) {
    return !0;
  }
  this.$fixedSelectors_$.length = 0;
  for (var $i$jscomp$94$$ = this.$stickySelectors_$.length = 0; $i$jscomp$94$$ < $stylesheets$$.length; $i$jscomp$94$$++) {
    var $stylesheet$jscomp$2$$ = $stylesheets$$[$i$jscomp$94$$];
    if (!$stylesheet$jscomp$2$$) {
      return $dev$$module$src$log$$().error("FixedLayer", "Aborting setup due to null stylesheet."), !0;
    }
    var $$jscomp$destructuring$var117$$ = $stylesheet$jscomp$2$$, $ownerNode$$ = $$jscomp$destructuring$var117$$.ownerNode;
    $$jscomp$destructuring$var117$$.disabled || !$ownerNode$$ || "STYLE" != $ownerNode$$.tagName || $ownerNode$$.hasAttribute("amp-boilerplate") || $ownerNode$$.hasAttribute("amp-runtime") || $ownerNode$$.hasAttribute("amp-extension") || $JSCompiler_StaticMethods_discoverSelectors_$$(this, $stylesheet$jscomp$2$$.cssRules);
  }
  $JSCompiler_StaticMethods_trySetupSelectors_$$(this, $platform$jscomp$3_root$jscomp$18_viewer$jscomp$16$$, void 0);
  $JSCompiler_StaticMethods_sortInDomOrder_$$(this);
  this.update();
  0 < this.$elements_$.length && this.observeHiddenMutations();
  $platform$jscomp$3_root$jscomp$18_viewer$jscomp$16$$ = $Services$$module$src$services$platformFor$$(this.ampdoc.win);
  0 < this.$elements_$.length && !this.$transfer_$ && $platform$jscomp$3_root$jscomp$18_viewer$jscomp$16$$.isIos() && $user$$module$src$log$$().warn("FixedLayer", "Please test this page inside of an AMP Viewer such as Google's because the fixed or sticky positioning might have slightly different layout.");
  return !0;
};
$JSCompiler_prototypeAlias$$.observeHiddenMutations = function() {
  $isExperimentOn$$module$src$experiments$$(this.ampdoc.win, "hidden-mutation-observer") && $JSCompiler_StaticMethods_initHiddenObserver_$$(this);
};
function $JSCompiler_StaticMethods_unobserveHiddenMutations_$$($JSCompiler_StaticMethods_unobserveHiddenMutations_$self$$) {
  $JSCompiler_StaticMethods_unobserveHiddenMutations_$self$$.$updatePass_$.cancel();
  var $unlisten$jscomp$6$$ = $JSCompiler_StaticMethods_unobserveHiddenMutations_$self$$.$hiddenObserverUnlistener_$;
  $unlisten$jscomp$6$$ && ($unlisten$jscomp$6$$(), $JSCompiler_StaticMethods_unobserveHiddenMutations_$self$$.$hiddenObserverUnlistener_$ = null);
}
function $JSCompiler_StaticMethods_initHiddenObserver_$$($JSCompiler_StaticMethods_initHiddenObserver_$self$$) {
  if (!$JSCompiler_StaticMethods_initHiddenObserver_$self$$.$hiddenObserverUnlistener_$) {
    var $root$jscomp$19$$ = $JSCompiler_StaticMethods_initHiddenObserver_$self$$.ampdoc.getRootNode();
    $JSCompiler_StaticMethods_initHiddenObserver_$self$$.$hiddenObserverUnlistener_$ = $getExistingServiceForDocInEmbedScope$$module$src$service$$($root$jscomp$19$$.documentElement || $root$jscomp$19$$, "hidden-observer").add(function() {
      $JSCompiler_StaticMethods_initHiddenObserver_$self$$.$updatePass_$.isPending() || $JSCompiler_StaticMethods_initHiddenObserver_$self$$.$updatePass_$.schedule(16);
    });
  }
}
$JSCompiler_prototypeAlias$$.updatePaddingTop = function($paddingTop$jscomp$1$$, $opt_transient$$) {
  this.$paddingTop_$ = $paddingTop$jscomp$1$$;
  $opt_transient$$ || (this.$committedPaddingTop_$ = $paddingTop$jscomp$1$$);
  this.update();
};
$JSCompiler_prototypeAlias$$.transformMutate = function($transform$jscomp$1$$) {
  $transform$jscomp$1$$ ? this.$elements_$.forEach(function($e$jscomp$87$$) {
    $e$jscomp$87$$.fixedNow && $e$jscomp$87$$.top && ($setStyle$$module$src$style$$($e$jscomp$87$$.element, "transition", "none"), $e$jscomp$87$$.transform && "none" != $e$jscomp$87$$.transform ? $setStyle$$module$src$style$$($e$jscomp$87$$.element, "transform", $e$jscomp$87$$.transform + " " + $transform$jscomp$1$$) : $setStyle$$module$src$style$$($e$jscomp$87$$.element, "transform", $transform$jscomp$1$$));
  }) : this.$elements_$.forEach(function($transform$jscomp$1$$) {
    $transform$jscomp$1$$.fixedNow && $transform$jscomp$1$$.top && $setStyles$$module$src$style$$($transform$jscomp$1$$.element, {transform:"", transition:""});
  });
};
$JSCompiler_prototypeAlias$$.addElement = function($element$jscomp$195$$, $opt_forceTransfer$$) {
  if (!$JSCompiler_StaticMethods_setupElement_$$(this, $element$jscomp$195$$, "*", "fixed", $opt_forceTransfer$$)) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  $JSCompiler_StaticMethods_sortInDomOrder_$$(this);
  this.observeHiddenMutations();
  return this.update();
};
$JSCompiler_prototypeAlias$$.removeElement = function($element$jscomp$196_fes$jscomp$1$$) {
  $element$jscomp$196_fes$jscomp$1$$ = $JSCompiler_StaticMethods_tearDownElement_$$(this, $element$jscomp$196_fes$jscomp$1$$);
  $JSCompiler_StaticMethods_returnFixedElements_$$(this, $element$jscomp$196_fes$jscomp$1$$);
};
function $JSCompiler_StaticMethods_returnFixedElements_$$($JSCompiler_StaticMethods_returnFixedElements_$self$$, $fes$jscomp$2$$) {
  0 < $fes$jscomp$2$$.length && $JSCompiler_StaticMethods_returnFixedElements_$self$$.$transferLayer_$ && $JSCompiler_StaticMethods_returnFixedElements_$self$$.$vsync_$.mutate(function() {
    for (var $i$jscomp$95$$ = 0; $i$jscomp$95$$ < $fes$jscomp$2$$.length; $i$jscomp$95$$++) {
      var $fe$jscomp$1$$ = $fes$jscomp$2$$[$i$jscomp$95$$];
      "fixed" == $fe$jscomp$1$$.position && $JSCompiler_StaticMethods_returnFixedElements_$self$$.$transferLayer_$.returnFrom($fe$jscomp$1$$);
    }
  });
}
$JSCompiler_prototypeAlias$$.isDeclaredFixed = function($element$jscomp$197$$) {
  return !!$element$jscomp$197$$.__AMP_DECLFIXED;
};
$JSCompiler_prototypeAlias$$.isDeclaredSticky = function($element$jscomp$198$$) {
  return !!$element$jscomp$198$$.__AMP_DECLSTICKY;
};
$JSCompiler_prototypeAlias$$.update = function() {
  var $$jscomp$this$jscomp$132$$ = this;
  this.$elements_$.filter(function($hasTransferables$$) {
    return !$$jscomp$this$jscomp$132$$.ampdoc.contains($hasTransferables$$.element);
  }).forEach(function($hasTransferables$$) {
    return $JSCompiler_StaticMethods_tearDownElement_$$($$jscomp$this$jscomp$132$$, $hasTransferables$$.element);
  });
  if (0 == this.$elements_$.length) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  this.$updatePass_$.cancel();
  var $hasTransferables$$ = !1;
  return this.$vsync_$.runPromise({measure:function($state$jscomp$31$$) {
    for (var $elements$jscomp$6$$ = $$jscomp$this$jscomp$132$$.$elements_$, $autoTops$$ = [], $win$jscomp$201$$ = $$jscomp$this$jscomp$132$$.ampdoc.win, $i$65_i$66_i$67_i$jscomp$96$$ = 0; $i$65_i$66_i$67_i$jscomp$96$$ < $elements$jscomp$6$$.length; $i$65_i$66_i$67_i$jscomp$96$$++) {
      $setImportantStyles$$module$src$style$$($elements$jscomp$6$$[$i$65_i$66_i$67_i$jscomp$96$$].element, {top:"", bottom:"-9999vh", transition:"none"});
    }
    for ($i$65_i$66_i$67_i$jscomp$96$$ = 0; $i$65_i$66_i$67_i$jscomp$96$$ < $elements$jscomp$6$$.length; $i$65_i$66_i$67_i$jscomp$96$$++) {
      $autoTops$$.push($computedStyle$$module$src$style$$($win$jscomp$201$$, $elements$jscomp$6$$[$i$65_i$66_i$67_i$jscomp$96$$].element).top);
    }
    for ($i$65_i$66_i$67_i$jscomp$96$$ = 0; $i$65_i$66_i$67_i$jscomp$96$$ < $elements$jscomp$6$$.length; $i$65_i$66_i$67_i$jscomp$96$$++) {
      $setStyle$$module$src$style$$($elements$jscomp$6$$[$i$65_i$66_i$67_i$jscomp$96$$].element, "bottom", "");
    }
    for ($i$65_i$66_i$67_i$jscomp$96$$ = 0; $i$65_i$66_i$67_i$jscomp$96$$ < $elements$jscomp$6$$.length; $i$65_i$66_i$67_i$jscomp$96$$++) {
      var $fe$jscomp$4$$ = $elements$jscomp$6$$[$i$65_i$66_i$67_i$jscomp$96$$], $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$ = $fe$jscomp$4$$, $$jscomp$destructuring$var120_bottom$jscomp$1_element$jscomp$199$$ = $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$.element, $forceTransfer$$ = $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$.forceTransfer;
      $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$ = $computedStyle$$module$src$style$$($win$jscomp$201$$, $$jscomp$destructuring$var120_bottom$jscomp$1_element$jscomp$199$$);
      var $offsetWidth$$ = $$jscomp$destructuring$var120_bottom$jscomp$1_element$jscomp$199$$.offsetWidth, $offsetHeight$$ = $$jscomp$destructuring$var120_bottom$jscomp$1_element$jscomp$199$$.offsetHeight, $offsetTop$$ = $$jscomp$destructuring$var120_bottom$jscomp$1_element$jscomp$199$$.offsetTop, $$jscomp$destructuring$var121_transform$jscomp$2$$ = $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$, $position$$ = void 0 === $$jscomp$destructuring$var121_transform$jscomp$2$$.position ? 
      "" : $$jscomp$destructuring$var121_transform$jscomp$2$$.position, $display$$ = void 0 === $$jscomp$destructuring$var121_transform$jscomp$2$$.display ? "" : $$jscomp$destructuring$var121_transform$jscomp$2$$.display;
      $$jscomp$destructuring$var120_bottom$jscomp$1_element$jscomp$199$$ = $$jscomp$destructuring$var121_transform$jscomp$2$$.bottom;
      var $zIndex$$ = $$jscomp$destructuring$var121_transform$jscomp$2$$.zIndex, $opacity$$ = parseFloat($$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$.opacity);
      $$jscomp$destructuring$var121_transform$jscomp$2$$ = $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$[$getVendorJsPropertyName$$module$src$style$$($$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$, "transform")];
      $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$ = $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$.top;
      var $isFixed$jscomp$1$$ = "fixed" === $position$$ && ($forceTransfer$$ || 0 < $offsetWidth$$ && 0 < $offsetHeight$$), $isSticky$$ = $endsWith$$module$src$string$$($position$$, "sticky");
      if ("none" === $display$$ || !$isFixed$jscomp$1$$ && !$isSticky$$) {
        $state$jscomp$31$$[$fe$jscomp$4$$.id] = {fixed:!1, sticky:!1, transferrable:!1, top:"", zIndex:""};
      } else {
        if ("auto" === $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$ || $autoTops$$[$i$65_i$66_i$67_i$jscomp$96$$] !== $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$) {
          $$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$ = $isFixed$jscomp$1$$ && $offsetTop$$ === $$jscomp$this$jscomp$132$$.$committedPaddingTop_$ + $$jscomp$this$jscomp$132$$.$borderTop_$ ? "0px" : "";
        }
        var $isTransferrable$$ = !1;
        $isFixed$jscomp$1$$ && ($isTransferrable$$ = !0 === $forceTransfer$$ ? !0 : !1 === $forceTransfer$$ ? !1 : 0 < $opacity$$ && 300 > $offsetHeight$$ && !(!$$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$ && !$$jscomp$destructuring$var120_bottom$jscomp$1_element$jscomp$199$$));
        $isTransferrable$$ && ($hasTransferables$$ = !0);
        $state$jscomp$31$$[$fe$jscomp$4$$.id] = {fixed:$isFixed$jscomp$1$$, sticky:$isSticky$$, transferrable:$isTransferrable$$, top:$$jscomp$destructuring$var119_style$jscomp$13_top$jscomp$4$$, zIndex:$zIndex$$, transform:$$jscomp$destructuring$var121_transform$jscomp$2$$};
      }
    }
  }, mutate:function($state$jscomp$32$$) {
    $hasTransferables$$ && $$jscomp$this$jscomp$132$$.$transfer_$ && $JSCompiler_StaticMethods_getTransferLayer_$$($$jscomp$this$jscomp$132$$).update();
    for (var $elements$jscomp$7$$ = $$jscomp$this$jscomp$132$$.$elements_$, $i$jscomp$97$$ = 0; $i$jscomp$97$$ < $elements$jscomp$7$$.length; $i$jscomp$97$$++) {
      var $fe$jscomp$5$$ = $elements$jscomp$7$$[$i$jscomp$97$$], $feState$$ = $state$jscomp$32$$[$fe$jscomp$5$$.id];
      $setStyle$$module$src$style$$($fe$jscomp$5$$.element, "transition", "none");
      $setStyle$$module$src$style$$($fe$jscomp$5$$.element, "transition", "");
      if ($feState$$) {
        var $JSCompiler_index$jscomp$inline_694$$ = $i$jscomp$97$$, $JSCompiler_state$jscomp$inline_695$$ = $feState$$, $JSCompiler_element$jscomp$inline_696$$ = $fe$jscomp$5$$.element, $JSCompiler_oldFixed$jscomp$inline_697$$ = $fe$jscomp$5$$.fixedNow;
        $fe$jscomp$5$$.fixedNow = $JSCompiler_state$jscomp$inline_695$$.fixed;
        $fe$jscomp$5$$.stickyNow = $JSCompiler_state$jscomp$inline_695$$.sticky;
        $fe$jscomp$5$$.top = $JSCompiler_state$jscomp$inline_695$$.fixed || $JSCompiler_state$jscomp$inline_695$$.sticky ? $JSCompiler_state$jscomp$inline_695$$.top : "";
        $fe$jscomp$5$$.transform = $JSCompiler_state$jscomp$inline_695$$.transform;
        !$JSCompiler_oldFixed$jscomp$inline_697$$ || $JSCompiler_state$jscomp$inline_695$$.fixed && $JSCompiler_state$jscomp$inline_695$$.transferrable || !$$jscomp$this$jscomp$132$$.$transferLayer_$ || $$jscomp$this$jscomp$132$$.$transferLayer_$.returnFrom($fe$jscomp$5$$);
        $JSCompiler_state$jscomp$inline_695$$.top && ($JSCompiler_state$jscomp$inline_695$$.fixed || $JSCompiler_state$jscomp$inline_695$$.sticky) && !$fe$jscomp$5$$.lightboxed && ($JSCompiler_state$jscomp$inline_695$$.fixed || !$$jscomp$this$jscomp$132$$.$transfer_$ ? $setStyle$$module$src$style$$($JSCompiler_element$jscomp$inline_696$$, "top", "calc(" + $JSCompiler_state$jscomp$inline_695$$.top + " + " + $$jscomp$this$jscomp$132$$.$paddingTop_$ + "px)") : $$jscomp$this$jscomp$132$$.$committedPaddingTop_$ === 
        $$jscomp$this$jscomp$132$$.$paddingTop_$ ? $setStyle$$module$src$style$$($JSCompiler_element$jscomp$inline_696$$, "top", $JSCompiler_state$jscomp$inline_695$$.top) : $setStyle$$module$src$style$$($JSCompiler_element$jscomp$inline_696$$, "top", "calc(" + $JSCompiler_state$jscomp$inline_695$$.top + " - " + $$jscomp$this$jscomp$132$$.$committedPaddingTop_$ + "px)"));
        $$jscomp$this$jscomp$132$$.$transfer_$ && $JSCompiler_state$jscomp$inline_695$$.fixed && $JSCompiler_state$jscomp$inline_695$$.transferrable && $JSCompiler_StaticMethods_getTransferLayer_$$($$jscomp$this$jscomp$132$$).transferTo($fe$jscomp$5$$, $JSCompiler_index$jscomp$inline_694$$, $JSCompiler_state$jscomp$inline_695$$);
      }
    }
  }}, {}).catch(function($$jscomp$this$jscomp$132$$) {
    $dev$$module$src$log$$().error("FixedLayer", "Failed to mutate fixed elements:", $$jscomp$this$jscomp$132$$);
  });
};
function $JSCompiler_StaticMethods_trySetupSelectors_$$($JSCompiler_StaticMethods_trySetupSelectors_$self$$, $root$jscomp$20$$, $opt_lightboxMode$jscomp$1$$) {
  try {
    for (var $JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$ = 0; $JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$ < $JSCompiler_StaticMethods_trySetupSelectors_$self$$.$fixedSelectors_$.length; $JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$++) {
      for (var $JSCompiler_fixedSelector$jscomp$inline_703_j$70$jscomp$inline_709$$ = $JSCompiler_StaticMethods_trySetupSelectors_$self$$.$fixedSelectors_$[$JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$], $JSCompiler_elements$jscomp$inline_704$$ = $root$jscomp$20$$.querySelectorAll($JSCompiler_fixedSelector$jscomp$inline_703_j$70$jscomp$inline_709$$), $JSCompiler_j$jscomp$inline_705$$ = 0; $JSCompiler_j$jscomp$inline_705$$ < $JSCompiler_elements$jscomp$inline_704$$.length && !(10 < $JSCompiler_StaticMethods_trySetupSelectors_$self$$.$elements_$.length); $JSCompiler_j$jscomp$inline_705$$++) {
        $JSCompiler_StaticMethods_setupElement_$$($JSCompiler_StaticMethods_trySetupSelectors_$self$$, $JSCompiler_elements$jscomp$inline_704$$[$JSCompiler_j$jscomp$inline_705$$], $JSCompiler_fixedSelector$jscomp$inline_703_j$70$jscomp$inline_709$$, "fixed", void 0, $opt_lightboxMode$jscomp$1$$);
      }
    }
    for ($JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$ = 0; $JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$ < $JSCompiler_StaticMethods_trySetupSelectors_$self$$.$stickySelectors_$.length; $JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$++) {
      var $JSCompiler_stickySelector$jscomp$inline_707$$ = $JSCompiler_StaticMethods_trySetupSelectors_$self$$.$stickySelectors_$[$JSCompiler_i$jscomp$inline_702_i$68$jscomp$inline_706$$], $elements$69$jscomp$inline_708$$ = $root$jscomp$20$$.querySelectorAll($JSCompiler_stickySelector$jscomp$inline_707$$);
      for ($JSCompiler_fixedSelector$jscomp$inline_703_j$70$jscomp$inline_709$$ = 0; $JSCompiler_fixedSelector$jscomp$inline_703_j$70$jscomp$inline_709$$ < $elements$69$jscomp$inline_708$$.length; $JSCompiler_fixedSelector$jscomp$inline_703_j$70$jscomp$inline_709$$++) {
        $JSCompiler_StaticMethods_setupElement_$$($JSCompiler_StaticMethods_trySetupSelectors_$self$$, $elements$69$jscomp$inline_708$$[$JSCompiler_fixedSelector$jscomp$inline_703_j$70$jscomp$inline_709$$], $JSCompiler_stickySelector$jscomp$inline_707$$, "sticky", void 0, $opt_lightboxMode$jscomp$1$$);
      }
    }
  } catch ($e$jscomp$89$$) {
    $dev$$module$src$log$$().error("FixedLayer", "Failed to setup fixed elements:", $e$jscomp$89$$);
  }
}
function $JSCompiler_StaticMethods_setupElement_$$($JSCompiler_StaticMethods_setupElement_$self_id$jscomp$44$$, $element$jscomp$201$$, $selector$jscomp$15$$, $position$jscomp$1$$, $opt_forceTransfer$jscomp$1$$, $elements$jscomp$9_opt_lightboxMode$jscomp$3$$) {
  $opt_forceTransfer$jscomp$1$$ || $element$jscomp$201$$.hasAttribute("style") && ($getStyle$$module$src$style$$($element$jscomp$201$$, "top") || $getStyle$$module$src$style$$($element$jscomp$201$$, "bottom")) && $user$$module$src$log$$().error("FixedLayer", "Inline styles with `top`, `bottom` and other CSS rules are not supported yet for fixed or sticky elements (#14186). Unexpected behavior may occur.", $element$jscomp$201$$);
  if ($isLightbox$$module$src$service$fixed_layer$$($element$jscomp$201$$)) {
    return !1;
  }
  var $isLightboxDescendant$$ = $closest$$module$src$dom$$($element$jscomp$201$$, $isLightbox$$module$src$service$fixed_layer$$);
  if (!$elements$jscomp$9_opt_lightboxMode$jscomp$3$$ && $isLightboxDescendant$$) {
    return !1;
  }
  $elements$jscomp$9_opt_lightboxMode$jscomp$3$$ = $JSCompiler_StaticMethods_setupElement_$self_id$jscomp$44$$.$elements_$;
  for (var $removals$$ = [], $fe$jscomp$6_i$71_i$jscomp$99$$ = 0; $fe$jscomp$6_i$71_i$jscomp$99$$ < $elements$jscomp$9_opt_lightboxMode$jscomp$3$$.length; $fe$jscomp$6_i$71_i$jscomp$99$$++) {
    var $el$jscomp$19_i$72_isFixed$jscomp$2$$ = $elements$jscomp$9_opt_lightboxMode$jscomp$3$$[$fe$jscomp$6_i$71_i$jscomp$99$$].element;
    if ($el$jscomp$19_i$72_isFixed$jscomp$2$$ === $element$jscomp$201$$) {
      break;
    }
    if ($el$jscomp$19_i$72_isFixed$jscomp$2$$.contains($element$jscomp$201$$)) {
      return !1;
    }
    $element$jscomp$201$$.contains($el$jscomp$19_i$72_isFixed$jscomp$2$$) && $removals$$.push($el$jscomp$19_i$72_isFixed$jscomp$2$$);
  }
  for ($fe$jscomp$6_i$71_i$jscomp$99$$ = 0; $fe$jscomp$6_i$71_i$jscomp$99$$ < $removals$$.length; $fe$jscomp$6_i$71_i$jscomp$99$$++) {
    $JSCompiler_StaticMethods_setupElement_$self_id$jscomp$44$$.removeElement($removals$$[$fe$jscomp$6_i$71_i$jscomp$99$$]);
  }
  $fe$jscomp$6_i$71_i$jscomp$99$$ = null;
  for ($el$jscomp$19_i$72_isFixed$jscomp$2$$ = 0; $el$jscomp$19_i$72_isFixed$jscomp$2$$ < $elements$jscomp$9_opt_lightboxMode$jscomp$3$$.length; $el$jscomp$19_i$72_isFixed$jscomp$2$$++) {
    var $el$73$$ = $elements$jscomp$9_opt_lightboxMode$jscomp$3$$[$el$jscomp$19_i$72_isFixed$jscomp$2$$];
    if ($el$73$$.element == $element$jscomp$201$$ && $el$73$$.position == $position$jscomp$1$$) {
      $fe$jscomp$6_i$71_i$jscomp$99$$ = $el$73$$;
      break;
    }
  }
  $el$jscomp$19_i$72_isFixed$jscomp$2$$ = "fixed" == $position$jscomp$1$$;
  $fe$jscomp$6_i$71_i$jscomp$99$$ ? $fe$jscomp$6_i$71_i$jscomp$99$$.selectors.includes($selector$jscomp$15$$) || $fe$jscomp$6_i$71_i$jscomp$99$$.selectors.push($selector$jscomp$15$$) : ($JSCompiler_StaticMethods_setupElement_$self_id$jscomp$44$$ = "F" + $JSCompiler_StaticMethods_setupElement_$self_id$jscomp$44$$.$counter_$++, $element$jscomp$201$$.setAttribute("i-amphtml-fixedid", $JSCompiler_StaticMethods_setupElement_$self_id$jscomp$44$$), $el$jscomp$19_i$72_isFixed$jscomp$2$$ ? $element$jscomp$201$$.__AMP_DECLFIXED = 
  !0 : $element$jscomp$201$$.__AMP_DECLSTICKY = !0, $fe$jscomp$6_i$71_i$jscomp$99$$ = {id:$JSCompiler_StaticMethods_setupElement_$self_id$jscomp$44$$, element:$element$jscomp$201$$, position:$position$jscomp$1$$, selectors:[$selector$jscomp$15$$], fixedNow:!1, stickyNow:!1, lightboxed:!!$isLightboxDescendant$$}, $elements$jscomp$9_opt_lightboxMode$jscomp$3$$.push($fe$jscomp$6_i$71_i$jscomp$99$$));
  $fe$jscomp$6_i$71_i$jscomp$99$$.forceTransfer = $el$jscomp$19_i$72_isFixed$jscomp$2$$ ? $opt_forceTransfer$jscomp$1$$ : !1;
  return !0;
}
function $JSCompiler_StaticMethods_tearDownElement_$$($JSCompiler_StaticMethods_tearDownElement_$self$$, $element$jscomp$202$$) {
  for (var $removed$jscomp$2$$ = [], $i$jscomp$100$$ = 0; $i$jscomp$100$$ < $JSCompiler_StaticMethods_tearDownElement_$self$$.$elements_$.length; $i$jscomp$100$$++) {
    var $fe$jscomp$7$$ = $JSCompiler_StaticMethods_tearDownElement_$self$$.$elements_$[$i$jscomp$100$$];
    $fe$jscomp$7$$.element === $element$jscomp$202$$ && ($fe$jscomp$7$$.lightboxed || $JSCompiler_StaticMethods_tearDownElement_$self$$.$vsync_$.mutate(function() {
      $setStyle$$module$src$style$$($element$jscomp$202$$, "top", "");
    }), $JSCompiler_StaticMethods_tearDownElement_$self$$.$elements_$.splice($i$jscomp$100$$, 1), $removed$jscomp$2$$.push($fe$jscomp$7$$));
  }
  $JSCompiler_StaticMethods_tearDownElement_$self$$.$elements_$.length || $JSCompiler_StaticMethods_unobserveHiddenMutations_$$($JSCompiler_StaticMethods_tearDownElement_$self$$);
  return $removed$jscomp$2$$;
}
function $JSCompiler_StaticMethods_sortInDomOrder_$$($JSCompiler_StaticMethods_sortInDomOrder_$self$$) {
  $JSCompiler_StaticMethods_sortInDomOrder_$self$$.$elements_$.sort(function($JSCompiler_StaticMethods_sortInDomOrder_$self$$, $fe2$$) {
    var $fe1$$ = $JSCompiler_StaticMethods_sortInDomOrder_$self$$.element, $JSCompiler_element2$jscomp$inline_715$$ = $fe2$$.element;
    return $fe1$$ === $JSCompiler_element2$jscomp$inline_715$$ ? 0 : $fe1$$.compareDocumentPosition($JSCompiler_element2$jscomp$inline_715$$) & (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS) ? 1 : -1;
  });
}
function $JSCompiler_StaticMethods_getTransferLayer_$$($JSCompiler_StaticMethods_getTransferLayer_$self$$) {
  if (!$JSCompiler_StaticMethods_getTransferLayer_$self$$.$transfer_$ || $JSCompiler_StaticMethods_getTransferLayer_$self$$.$transferLayer_$) {
    return $JSCompiler_StaticMethods_getTransferLayer_$self$$.$transferLayer_$;
  }
  $JSCompiler_StaticMethods_getTransferLayer_$self$$.$transferLayer_$ = new $TransferLayerBody$$module$src$service$fixed_layer$$($JSCompiler_StaticMethods_getTransferLayer_$self$$.ampdoc.win.document, $JSCompiler_StaticMethods_getTransferLayer_$self$$.$vsync_$);
  return $JSCompiler_StaticMethods_getTransferLayer_$self$$.$transferLayer_$;
}
function $JSCompiler_StaticMethods_discoverSelectors_$$($JSCompiler_StaticMethods_discoverSelectors_$self$$, $rules$jscomp$1$$) {
  for (var $i$jscomp$101$$ = 0; $i$jscomp$101$$ < $rules$jscomp$1$$.length; $i$jscomp$101$$++) {
    var $position$jscomp$2_rule$jscomp$7$$ = $rules$jscomp$1$$[$i$jscomp$101$$];
    if (4 == $position$jscomp$2_rule$jscomp$7$$.type || 12 == $position$jscomp$2_rule$jscomp$7$$.type) {
      $JSCompiler_StaticMethods_discoverSelectors_$$($JSCompiler_StaticMethods_discoverSelectors_$self$$, $position$jscomp$2_rule$jscomp$7$$.cssRules);
    } else {
      if (1 == $position$jscomp$2_rule$jscomp$7$$.type) {
        var $selectorText$$ = $position$jscomp$2_rule$jscomp$7$$.selectorText;
        $position$jscomp$2_rule$jscomp$7$$ = $position$jscomp$2_rule$jscomp$7$$.style.position;
        "*" !== $selectorText$$ && $position$jscomp$2_rule$jscomp$7$$ && ("fixed" === $position$jscomp$2_rule$jscomp$7$$ ? $JSCompiler_StaticMethods_discoverSelectors_$self$$.$fixedSelectors_$.push($selectorText$$) : $endsWith$$module$src$string$$($position$jscomp$2_rule$jscomp$7$$, "sticky") && $JSCompiler_StaticMethods_discoverSelectors_$self$$.$stickySelectors_$.push($selectorText$$));
      }
    }
  }
}
function $TransferLayerBody$$module$src$service$fixed_layer$$($doc$jscomp$45$$, $JSCompiler_style$jscomp$inline_721_JSCompiler_temp_const$jscomp$153_vsync$jscomp$3$$) {
  this.$doc_$ = $doc$jscomp$45$$;
  this.$vsync_$ = $JSCompiler_style$jscomp$inline_721_JSCompiler_temp_const$jscomp$153_vsync$jscomp$3$$;
  this.$layer_$ = $doc$jscomp$45$$.body.cloneNode(!1);
  this.$layer_$.removeAttribute("style");
  $JSCompiler_style$jscomp$inline_721_JSCompiler_temp_const$jscomp$153_vsync$jscomp$3$$ = this.$layer_$;
  var $JSCompiler_styles$jscomp$inline_717$$ = {position:"absolute", top:0, left:0, height:0, width:0, pointerEvents:"none", overflow:"hidden", animation:"none", background:"none", border:"none", borderImage:"none", boxSizing:"border-box", boxShadow:"none", float:"none", margin:0, opacity:1, outline:"none", padding:"none", transform:"none", transition:"none"};
  "display" in $JSCompiler_styles$jscomp$inline_717$$ && $dev$$module$src$log$$().error("STYLE", "`display` style detected in styles. You must use toggle instead.");
  $setStyles$$module$src$style$$($JSCompiler_style$jscomp$inline_721_JSCompiler_temp_const$jscomp$153_vsync$jscomp$3$$, $JSCompiler_styles$jscomp$inline_717$$);
  $JSCompiler_style$jscomp$inline_721_JSCompiler_temp_const$jscomp$153_vsync$jscomp$3$$ = this.$layer_$.style;
  $devAssert$$module$src$log$$(!0);
  $devAssert$$module$src$log$$(!$JSCompiler_style$jscomp$inline_721_JSCompiler_temp_const$jscomp$153_vsync$jscomp$3$$.display);
  $JSCompiler_style$jscomp$inline_721_JSCompiler_temp_const$jscomp$153_vsync$jscomp$3$$.display = "block";
  $doc$jscomp$45$$.documentElement.appendChild(this.$layer_$);
}
$JSCompiler_prototypeAlias$$ = $TransferLayerBody$$module$src$service$fixed_layer$$.prototype;
$JSCompiler_prototypeAlias$$.getRoot = function() {
  return this.$layer_$;
};
$JSCompiler_prototypeAlias$$.setLightboxMode = function($on$jscomp$4$$) {
  var $$jscomp$this$jscomp$133$$ = this;
  this.$vsync_$.mutate(function() {
    var $root$jscomp$22$$ = $$jscomp$this$jscomp$133$$.getRoot();
    $on$jscomp$4$$ ? $root$jscomp$22$$.setAttribute("i-amphtml-lightbox", "") : $root$jscomp$22$$.removeAttribute("i-amphtml-lightbox");
  });
};
$JSCompiler_prototypeAlias$$.update = function() {
  for (var $body$jscomp$7$$ = this.$doc_$.body, $layer$jscomp$2$$ = this.$layer_$, $bodyAttrs$$ = $body$jscomp$7$$.attributes, $layerAttrs$$ = $layer$jscomp$2$$.attributes, $i$74_i$jscomp$102$$ = 0; $i$74_i$jscomp$102$$ < $bodyAttrs$$.length; $i$74_i$jscomp$102$$++) {
    var $attr$jscomp$5_name$jscomp$139$$ = $bodyAttrs$$[$i$74_i$jscomp$102$$];
    "style" !== $attr$jscomp$5_name$jscomp$139$$.name && $layerAttrs$$.setNamedItem($attr$jscomp$5_name$jscomp$139$$.cloneNode(!1));
  }
  for ($i$74_i$jscomp$102$$ = 0; $i$74_i$jscomp$102$$ < $layerAttrs$$.length; $i$74_i$jscomp$102$$++) {
    $attr$jscomp$5_name$jscomp$139$$ = $layerAttrs$$[$i$74_i$jscomp$102$$].name, "style" === $attr$jscomp$5_name$jscomp$139$$ || "i-amphtml-lightbox" === $attr$jscomp$5_name$jscomp$139$$ || $body$jscomp$7$$.hasAttribute($attr$jscomp$5_name$jscomp$139$$) || ($layer$jscomp$2$$.removeAttribute($attr$jscomp$5_name$jscomp$139$$), $i$74_i$jscomp$102$$--);
  }
};
$JSCompiler_prototypeAlias$$.transferTo = function($fe$jscomp$9$$, $index$jscomp$92$$, $state$jscomp$34$$) {
  var $element$jscomp$204$$ = $fe$jscomp$9$$.element;
  if ($element$jscomp$204$$.parentElement != this.$layer_$) {
    $user$$module$src$log$$().warn("FixedLayer", "In order to improve scrolling performance in Safari, we now move the element to a fixed positioning layer:", $fe$jscomp$9$$.element);
    if (!$fe$jscomp$9$$.placeholder) {
      $setStyle$$module$src$style$$($element$jscomp$204$$, "pointer-events", "initial");
      var $placeholder$jscomp$4$$ = $fe$jscomp$9$$.placeholder = this.$doc_$.createElement("i-amphtml-fpa");
      $toggle$$module$src$style$$($placeholder$jscomp$4$$, !1);
      $placeholder$jscomp$4$$.setAttribute("i-amphtml-fixedid", $fe$jscomp$9$$.id);
    }
    $setStyle$$module$src$style$$($element$jscomp$204$$, "zIndex", "calc(" + (10000 + $index$jscomp$92$$) + " + " + ($state$jscomp$34$$.zIndex || 0) + ")");
    $fe$jscomp$9$$.lightboxed && $element$jscomp$204$$.classList.add("i-amphtml-lightbox-element");
    $element$jscomp$204$$.parentElement.replaceChild($fe$jscomp$9$$.placeholder, $element$jscomp$204$$);
    this.$layer_$.appendChild($element$jscomp$204$$);
    $fe$jscomp$9$$.selectors.some(function($fe$jscomp$9$$) {
      try {
        var $index$jscomp$92$$ = $matches$$module$src$dom$$($element$jscomp$204$$, $fe$jscomp$9$$);
      } catch ($JSCompiler_e$jscomp$inline_726$$) {
        $dev$$module$src$log$$().error("FixedLayer", "Failed to test query match:", $JSCompiler_e$jscomp$inline_726$$), $index$jscomp$92$$ = !1;
      }
      return $index$jscomp$92$$;
    }) || ($user$$module$src$log$$().warn("FixedLayer", "Failed to move the element to the fixed position layer. This is most likely due to the compound CSS selector:", $fe$jscomp$9$$.element), this.returnFrom($fe$jscomp$9$$));
  }
};
$JSCompiler_prototypeAlias$$.returnFrom = function($fe$jscomp$10$$) {
  if ($fe$jscomp$10$$.placeholder && this.$doc_$.contains($fe$jscomp$10$$.placeholder)) {
    var $element$jscomp$205$$ = $fe$jscomp$10$$.element, $placeholder$jscomp$5$$ = $fe$jscomp$10$$.placeholder;
    $fe$jscomp$10$$.lightboxed && $element$jscomp$205$$.classList.remove("i-amphtml-lightbox-element");
    this.$doc_$.contains($element$jscomp$205$$) ? ($setStyle$$module$src$style$$($fe$jscomp$10$$.element, "zIndex", ""), $placeholder$jscomp$5$$.parentElement.replaceChild($element$jscomp$205$$, $placeholder$jscomp$5$$)) : $placeholder$jscomp$5$$.parentElement.removeChild($placeholder$jscomp$5$$);
  }
};
function $marginBottomOfLastChild$$module$src$service$viewport$viewport_binding_def$$($win$jscomp$202$$, $element$jscomp$207_n$jscomp$15$$) {
  for ($element$jscomp$207_n$jscomp$15$$ = $element$jscomp$207_n$jscomp$15$$.lastElementChild; $element$jscomp$207_n$jscomp$15$$; $element$jscomp$207_n$jscomp$15$$ = $element$jscomp$207_n$jscomp$15$$.previousElementSibling) {
    if (0 < $element$jscomp$207_n$jscomp$15$$.getBoundingClientRect().height) {
      var $s$jscomp$26$$ = $computedStyle$$module$src$style$$($win$jscomp$202$$, $element$jscomp$207_n$jscomp$15$$);
      if ("static" == $s$jscomp$26$$.position || "relative" == $s$jscomp$26$$.position) {
        var $style$jscomp$14$$ = $s$jscomp$26$$;
        break;
      }
    }
  }
  return $style$jscomp$14$$ ? parseInt($style$jscomp$14$$.marginBottom, 10) : 0;
}
;function $ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$($doc$jscomp$46_win$jscomp$203$$) {
  var $$jscomp$this$jscomp$135$$ = this;
  this.win = $doc$jscomp$46_win$jscomp$203$$;
  this.$vsync_$ = $Services$$module$src$services$vsyncFor$$($doc$jscomp$46_win$jscomp$203$$);
  $doc$jscomp$46_win$jscomp$203$$ = this.win.document;
  var $documentElement$jscomp$1$$ = $doc$jscomp$46_win$jscomp$203$$.documentElement, $topClasses$$ = $documentElement$jscomp$1$$.className;
  $documentElement$jscomp$1$$.classList.add("i-amphtml-ios-embed");
  var $wrapper$jscomp$1$$ = $doc$jscomp$46_win$jscomp$203$$.createElement("html");
  this.$wrapper_$ = $wrapper$jscomp$1$$;
  $wrapper$jscomp$1$$.id = "i-amphtml-wrapper";
  $wrapper$jscomp$1$$.className = $topClasses$$;
  this.$scrollObservable_$ = new $Observable$$module$src$observable$$;
  this.$resizeObservable_$ = new $Observable$$module$src$observable$$;
  this.$boundScrollEventListener_$ = this.$onScrolled_$.bind(this);
  this.$boundResizeEventListener_$ = function() {
    return $$jscomp$this$jscomp$135$$.$resizeObservable_$.fire();
  };
  this.$paddingTop_$ = 0;
  this.$setupDone_$ = !1;
  $waitForBodyOpen$$module$src$dom$$($doc$jscomp$46_win$jscomp$203$$, this.$setup_$.bind(this));
  $whenDocumentReady$$module$src$document_ready$$($doc$jscomp$46_win$jscomp$203$$).then(function() {
    $documentElement$jscomp$1$$.classList.add("i-amphtml-ios-overscroll");
  });
}
$JSCompiler_prototypeAlias$$ = $ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$.prototype;
$JSCompiler_prototypeAlias$$.ensureReadyForElements = function() {
  this.$setup_$();
};
$JSCompiler_prototypeAlias$$.$setup_$ = function() {
  if (!this.$setupDone_$) {
    this.$setupDone_$ = !0;
    var $doc$jscomp$47$$ = this.win.document, $body$jscomp$8$$ = $doc$jscomp$47$$.body;
    $doc$jscomp$47$$.documentElement.appendChild(this.$wrapper_$);
    this.$wrapper_$.appendChild($body$jscomp$8$$);
    Object.defineProperty($doc$jscomp$47$$, "body", {get:function() {
      return $body$jscomp$8$$;
    }});
    this.$onScrolled_$();
  }
};
$JSCompiler_prototypeAlias$$.connect = function() {
  this.win.addEventListener("resize", this.$boundResizeEventListener_$);
  this.$wrapper_$.addEventListener("scroll", this.$boundScrollEventListener_$);
};
$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.win.removeEventListener("resize", this.$boundResizeEventListener_$);
  this.$wrapper_$.removeEventListener("scroll", this.$boundScrollEventListener_$);
};
$JSCompiler_prototypeAlias$$.getBorderTop = function() {
  return 1;
};
$JSCompiler_prototypeAlias$$.requiresFixedLayerTransfer = function() {
  return $isExperimentOn$$module$src$experiments$$(this.win, "ios-fixed-no-transfer") ? 12.2 > parseFloat($Services$$module$src$services$platformFor$$(this.win).getIosVersionString()) : !0;
};
$JSCompiler_prototypeAlias$$.overrideGlobalScrollTo = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.supportsPositionFixed = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.onScroll = function($callback$jscomp$91$$) {
  this.$scrollObservable_$.add($callback$jscomp$91$$);
};
$JSCompiler_prototypeAlias$$.onResize = function($callback$jscomp$92$$) {
  this.$resizeObservable_$.add($callback$jscomp$92$$);
};
$JSCompiler_prototypeAlias$$.updatePaddingTop = function($paddingTop$jscomp$2$$) {
  this.$paddingTop_$ = $paddingTop$jscomp$2$$;
  $setImportantStyles$$module$src$style$$(this.$wrapper_$, {"padding-top":$paddingTop$jscomp$2$$ + "px"});
};
$JSCompiler_prototypeAlias$$.hideViewerHeader = function($transient$$) {
  $transient$$ || this.updatePaddingTop(0);
};
$JSCompiler_prototypeAlias$$.showViewerHeader = function($transient$jscomp$1$$, $paddingTop$jscomp$3$$) {
  $transient$jscomp$1$$ || this.updatePaddingTop($paddingTop$jscomp$3$$);
};
$JSCompiler_prototypeAlias$$.disableScroll = function() {
  this.$wrapper_$.classList.add("i-amphtml-scroll-disabled");
};
$JSCompiler_prototypeAlias$$.resetScroll = function() {
  this.$wrapper_$.classList.remove("i-amphtml-scroll-disabled");
};
$JSCompiler_prototypeAlias$$.updateLightboxMode = function() {
  return $resolvedPromise$$module$src$resolved_promise$$();
};
$JSCompiler_prototypeAlias$$.getSize = function() {
  return {width:this.win.innerWidth, height:this.win.innerHeight};
};
$JSCompiler_prototypeAlias$$.getScrollTop = function() {
  return this.$wrapper_$.scrollTop;
};
$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  return 0;
};
$JSCompiler_prototypeAlias$$.getScrollWidth = function() {
  return this.$wrapper_$.scrollWidth;
};
$JSCompiler_prototypeAlias$$.getScrollHeight = function() {
  return this.$wrapper_$.scrollHeight;
};
$JSCompiler_prototypeAlias$$.getContentHeight = function() {
  var $content$jscomp$2_style$jscomp$15$$ = this.win.document.body, $height$jscomp$28$$ = $content$jscomp$2_style$jscomp$15$$.getBoundingClientRect().height, $childMarginBottom$$ = $marginBottomOfLastChild$$module$src$service$viewport$viewport_binding_def$$(this.win, $content$jscomp$2_style$jscomp$15$$);
  $content$jscomp$2_style$jscomp$15$$ = $computedStyle$$module$src$style$$(this.win, $content$jscomp$2_style$jscomp$15$$);
  return parseInt($content$jscomp$2_style$jscomp$15$$.marginTop, 10) + this.$paddingTop_$ + $height$jscomp$28$$ + $childMarginBottom$$ + parseInt($content$jscomp$2_style$jscomp$15$$.marginBottom, 10);
};
$JSCompiler_prototypeAlias$$.contentHeightChanged = function() {
};
$JSCompiler_prototypeAlias$$.getLayoutRect = function($b$jscomp$5_el$jscomp$20$$, $opt_scrollLeft$$, $opt_scrollTop$$, $opt_premeasuredRect$jscomp$1$$) {
  $b$jscomp$5_el$jscomp$20$$ = $opt_premeasuredRect$jscomp$1$$ || $b$jscomp$5_el$jscomp$20$$.getBoundingClientRect();
  var $scrollTop$$ = void 0 != $opt_scrollTop$$ ? $opt_scrollTop$$ : this.getScrollTop(), $scrollLeft$$ = void 0 != $opt_scrollLeft$$ ? $opt_scrollLeft$$ : this.getScrollLeft();
  return $layoutRectLtwh$$module$src$layout_rect$$(Math.round($b$jscomp$5_el$jscomp$20$$.left + $scrollLeft$$), Math.round($b$jscomp$5_el$jscomp$20$$.top + $scrollTop$$), Math.round($b$jscomp$5_el$jscomp$20$$.width), Math.round($b$jscomp$5_el$jscomp$20$$.height));
};
$JSCompiler_prototypeAlias$$.getRootClientRectAsync = function() {
  return Promise.resolve(null);
};
$JSCompiler_prototypeAlias$$.setScrollTop = function($scrollTop$jscomp$1$$) {
  this.$wrapper_$.scrollTop = $scrollTop$jscomp$1$$ || 1;
};
$JSCompiler_prototypeAlias$$.$onScrolled_$ = function($opt_event$jscomp$4$$) {
  0 == this.$wrapper_$.scrollTop && (this.$wrapper_$.scrollTop = 1, $opt_event$jscomp$4$$ && $opt_event$jscomp$4$$.preventDefault());
  $opt_event$jscomp$4$$ && this.$scrollObservable_$.fire();
};
$JSCompiler_prototypeAlias$$.getScrollingElement = function() {
  return this.$wrapper_$;
};
$JSCompiler_prototypeAlias$$.getScrollingElementScrollsLikeViewport = function() {
  return !1;
};
function $ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$($ampdoc$jscomp$84$$) {
  var $$jscomp$this$jscomp$136$$ = this;
  this.ampdoc = $ampdoc$jscomp$84$$;
  this.win = $ampdoc$jscomp$84$$.win;
  this.$platform_$ = $Services$$module$src$services$platformFor$$(this.win);
  this.$scrollObservable_$ = new $Observable$$module$src$observable$$;
  this.$resizeObservable_$ = new $Observable$$module$src$observable$$;
  this.$boundScrollEventListener_$ = this.$handleScrollEvent_$.bind(this);
  this.$boundResizeEventListener_$ = function() {
    return $$jscomp$this$jscomp$136$$.$resizeObservable_$.fire();
  };
}
$JSCompiler_prototypeAlias$$ = $ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$.prototype;
$JSCompiler_prototypeAlias$$.$handleScrollEvent_$ = function() {
  this.$scrollObservable_$.fire();
};
$JSCompiler_prototypeAlias$$.connect = function() {
  this.win.addEventListener("scroll", this.$boundScrollEventListener_$);
  this.win.addEventListener("resize", this.$boundResizeEventListener_$);
};
$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.win.removeEventListener("scroll", this.$boundScrollEventListener_$);
  this.win.removeEventListener("resize", this.$boundResizeEventListener_$);
};
$JSCompiler_prototypeAlias$$.ensureReadyForElements = function() {
};
$JSCompiler_prototypeAlias$$.getBorderTop = function() {
  return 0;
};
$JSCompiler_prototypeAlias$$.requiresFixedLayerTransfer = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.overrideGlobalScrollTo = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.supportsPositionFixed = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.onScroll = function($callback$jscomp$93$$) {
  this.$scrollObservable_$.add($callback$jscomp$93$$);
};
$JSCompiler_prototypeAlias$$.onResize = function($callback$jscomp$94$$) {
  this.$resizeObservable_$.add($callback$jscomp$94$$);
};
$JSCompiler_prototypeAlias$$.updatePaddingTop = function($paddingTop$jscomp$4$$) {
  $setImportantStyles$$module$src$style$$(this.win.document.documentElement, {"padding-top":$paddingTop$jscomp$4$$ + "px"});
};
$JSCompiler_prototypeAlias$$.hideViewerHeader = function($transient$jscomp$2$$) {
  $transient$jscomp$2$$ || this.updatePaddingTop(0);
};
$JSCompiler_prototypeAlias$$.showViewerHeader = function($transient$jscomp$3$$, $paddingTop$jscomp$5$$) {
  $transient$jscomp$3$$ || this.updatePaddingTop($paddingTop$jscomp$5$$);
};
$JSCompiler_prototypeAlias$$.disableScroll = function() {
  this.win.document.documentElement.classList.add("i-amphtml-scroll-disabled");
};
$JSCompiler_prototypeAlias$$.resetScroll = function() {
  this.win.document.documentElement.classList.remove("i-amphtml-scroll-disabled");
};
$JSCompiler_prototypeAlias$$.updateLightboxMode = function() {
  return $resolvedPromise$$module$src$resolved_promise$$();
};
$JSCompiler_prototypeAlias$$.getSize = function() {
  var $winWidth$$ = this.win.innerWidth, $winHeight$$ = this.win.innerHeight;
  if ($winWidth$$ && $winHeight$$) {
    return {width:$winWidth$$, height:$winHeight$$};
  }
  var $el$jscomp$21$$ = this.win.document.documentElement;
  return {width:$el$jscomp$21$$.clientWidth, height:$el$jscomp$21$$.clientHeight};
};
$JSCompiler_prototypeAlias$$.getScrollTop = function() {
  var $pageScrollTop$$ = this.getScrollingElement().scrollTop || this.win.pageYOffset, $host$jscomp$1$$ = this.ampdoc.getRootNode().host;
  return $host$jscomp$1$$ ? $pageScrollTop$$ - $host$jscomp$1$$.offsetTop : $pageScrollTop$$;
};
$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  return 0;
};
$JSCompiler_prototypeAlias$$.getScrollWidth = function() {
  return this.getScrollingElement().scrollWidth;
};
$JSCompiler_prototypeAlias$$.getScrollHeight = function() {
  return this.getScrollingElement().scrollHeight;
};
$JSCompiler_prototypeAlias$$.getContentHeight = function() {
  var $content$jscomp$3_style$jscomp$16$$ = this.getScrollingElement(), $rect$jscomp$5$$ = $content$jscomp$3_style$jscomp$16$$.getBoundingClientRect(), $top$jscomp$5$$ = $rect$jscomp$5$$.top + this.getScrollTop(), $childMarginBottom$jscomp$1$$ = $Services$$module$src$services$platformFor$$(this.win).isSafari() ? $marginBottomOfLastChild$$module$src$service$viewport$viewport_binding_def$$(this.win, $content$jscomp$3_style$jscomp$16$$) : 0;
  $content$jscomp$3_style$jscomp$16$$ = $computedStyle$$module$src$style$$(this.win, $content$jscomp$3_style$jscomp$16$$);
  return $top$jscomp$5$$ + parseInt($content$jscomp$3_style$jscomp$16$$.marginTop, 10) + $rect$jscomp$5$$.height + $childMarginBottom$jscomp$1$$ + parseInt($content$jscomp$3_style$jscomp$16$$.marginBottom, 10);
};
$JSCompiler_prototypeAlias$$.contentHeightChanged = function() {
};
$JSCompiler_prototypeAlias$$.getLayoutRect = function($b$jscomp$6_el$jscomp$22$$, $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$1$$, $opt_scrollTop$jscomp$1_scrollTop$jscomp$2$$, $opt_premeasuredRect$jscomp$2$$) {
  $b$jscomp$6_el$jscomp$22$$ = $opt_premeasuredRect$jscomp$2$$ || $b$jscomp$6_el$jscomp$22$$.getBoundingClientRect();
  $opt_scrollTop$jscomp$1_scrollTop$jscomp$2$$ = void 0 != $opt_scrollTop$jscomp$1_scrollTop$jscomp$2$$ ? $opt_scrollTop$jscomp$1_scrollTop$jscomp$2$$ : this.getScrollTop();
  $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$1$$ = void 0 != $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$1$$ ? $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$1$$ : this.getScrollLeft();
  return $layoutRectLtwh$$module$src$layout_rect$$(Math.round($b$jscomp$6_el$jscomp$22$$.left + $opt_scrollLeft$jscomp$1_scrollLeft$jscomp$1$$), Math.round($b$jscomp$6_el$jscomp$22$$.top + $opt_scrollTop$jscomp$1_scrollTop$jscomp$2$$), Math.round($b$jscomp$6_el$jscomp$22$$.width), Math.round($b$jscomp$6_el$jscomp$22$$.height));
};
$JSCompiler_prototypeAlias$$.getRootClientRectAsync = function() {
  return Promise.resolve(null);
};
$JSCompiler_prototypeAlias$$.setScrollTop = function($scrollTop$jscomp$3$$) {
  this.getScrollingElement().scrollTop = $scrollTop$jscomp$3$$;
};
$JSCompiler_prototypeAlias$$.getScrollingElement = function() {
  var $doc$jscomp$48$$ = this.win.document;
  return $doc$jscomp$48$$.scrollingElement ? $doc$jscomp$48$$.scrollingElement : $doc$jscomp$48$$.body && this.$platform_$.isWebKit() ? $doc$jscomp$48$$.body : $doc$jscomp$48$$.documentElement;
};
$JSCompiler_prototypeAlias$$.getScrollingElementScrollsLikeViewport = function() {
  return !0;
};
function $clamp$$module$src$utils$math$$($val$jscomp$13$$) {
  $devAssert$$module$src$log$$(!0);
  return Math.min(Math.max($val$jscomp$13$$, 0), 500);
}
;function $numeric$$module$src$transition$$($start$jscomp$12$$, $end$jscomp$8$$) {
  return function($time$jscomp$8$$) {
    return $start$jscomp$12$$ + ($end$jscomp$8$$ - $start$jscomp$12$$) * $time$jscomp$8$$;
  };
}
;function $ViewportImpl$$module$src$service$viewport$viewport_impl$$($ampdoc$jscomp$85$$, $binding$jscomp$8$$, $viewer$jscomp$17$$) {
  var $$jscomp$this$jscomp$137$$ = this, $win$jscomp$204$$ = $ampdoc$jscomp$85$$.win;
  this.ampdoc = $ampdoc$jscomp$85$$;
  this.$globalDoc_$ = this.ampdoc.win.document;
  this.$binding_$ = $binding$jscomp$8$$;
  this.$viewer_$ = $viewer$jscomp$17$$;
  this.$scrollTop_$ = this.$size_$ = this.$rect_$ = null;
  this.$scrollAnimationFrameThrottled_$ = !1;
  this.$scrollLeft_$ = null;
  this.$paddingTop_$ = Number($viewer$jscomp$17$$.getParam("paddingTop") || 0);
  this.$lastPaddingTop_$ = 0;
  this.$timer_$ = $Services$$module$src$services$timerFor$$($win$jscomp$204$$);
  this.$vsync_$ = $Services$$module$src$services$vsyncFor$$($win$jscomp$204$$);
  this.$scrollTracking_$ = !1;
  this.$scrollingElement_$ = null;
  this.$scrollCount_$ = 0;
  this.$changeObservable_$ = new $Observable$$module$src$observable$$;
  this.$scrollObservable_$ = new $Observable$$module$src$observable$$;
  this.$resizeObservable_$ = new $Observable$$module$src$observable$$;
  this.$originalViewportMetaString_$ = this.$viewportMeta_$ = void 0;
  this.$fixedLayer_$ = null;
  this.createFixedLayer($FixedLayer$$module$src$service$fixed_layer$$);
  this.$viewer_$.onMessage("viewport", this.$updateOnViewportEvent_$.bind(this));
  this.$viewer_$.onMessage("scroll", this.$viewerSetScrollTop_$.bind(this));
  this.$viewer_$.onMessage("disableScroll", this.$disableScrollEventHandler_$.bind(this));
  this.$viewer_$.isEmbedded() && this.$binding_$.updatePaddingTop(this.$paddingTop_$);
  this.$binding_$.onScroll(this.$scroll_$.bind(this));
  this.$binding_$.onResize(this.$resize_$.bind(this));
  this.onScroll(this.$sendScrollMessage_$.bind(this));
  this.$visible_$ = !1;
  this.ampdoc.onVisibilityChanged(this.$updateVisibility_$.bind(this));
  this.$updateVisibility_$();
  var $globalDocElement$$ = this.$globalDoc_$.documentElement;
  $ampdoc$jscomp$85$$.isSingleDoc() && $globalDocElement$$.classList.add("i-amphtml-singledoc");
  $viewer$jscomp$17$$.isEmbedded() ? $globalDocElement$$.classList.add("i-amphtml-embedded") : $globalDocElement$$.classList.add("i-amphtml-standalone");
  $isIframed$$module$src$dom$$($win$jscomp$204$$) && $globalDocElement$$.classList.add("i-amphtml-iframed");
  "1" === $viewer$jscomp$17$$.getParam("webview") && $globalDocElement$$.classList.add("i-amphtml-webview");
  $isIframed$$module$src$dom$$($win$jscomp$204$$) && "scrollRestoration" in $win$jscomp$204$$.history && ($win$jscomp$204$$.history.scrollRestoration = "manual");
  if (this.$binding_$.overrideGlobalScrollTo()) {
    try {
      Object.defineProperty($win$jscomp$204$$, "scrollTo", {value:function($ampdoc$jscomp$85$$, $binding$jscomp$8$$) {
        return $$jscomp$this$jscomp$137$$.setScrollTop($binding$jscomp$8$$);
      }}), ["pageYOffset", "scrollY"].forEach(function($ampdoc$jscomp$85$$) {
        Object.defineProperty($win$jscomp$204$$, $ampdoc$jscomp$85$$, {get:function() {
          return $$jscomp$this$jscomp$137$$.getScrollTop();
        }});
      });
    } catch ($e$jscomp$91$$) {
    }
  }
}
$JSCompiler_prototypeAlias$$ = $ViewportImpl$$module$src$service$viewport$viewport_impl$$.prototype;
$JSCompiler_prototypeAlias$$.dispose = function() {
  this.$binding_$.disconnect();
};
$JSCompiler_prototypeAlias$$.ensureReadyForElements = function() {
  this.$binding_$.ensureReadyForElements();
};
$JSCompiler_prototypeAlias$$.$updateVisibility_$ = function() {
  var $visible$jscomp$1$$ = this.ampdoc.isVisible();
  $visible$jscomp$1$$ != this.$visible_$ && ((this.$visible_$ = $visible$jscomp$1$$) ? (this.$binding_$.connect(), this.$size_$ && this.$resize_$(), this.$scrollTop_$ && (this.$scrollTop_$ = null, this.getScrollTop())) : this.$binding_$.disconnect());
};
$JSCompiler_prototypeAlias$$.getPaddingTop = function() {
  return this.$paddingTop_$;
};
$JSCompiler_prototypeAlias$$.getScrollTop = function() {
  null == this.$scrollTop_$ && (this.$scrollTop_$ = this.$binding_$.getScrollTop());
  return this.$scrollTop_$;
};
$JSCompiler_prototypeAlias$$.getScrollLeft = function() {
  null == this.$scrollLeft_$ && (this.$scrollLeft_$ = this.$binding_$.getScrollLeft());
  return this.$scrollLeft_$;
};
$JSCompiler_prototypeAlias$$.setScrollTop = function($scrollPos$jscomp$2$$) {
  this.$scrollTop_$ = null;
  this.$binding_$.setScrollTop($scrollPos$jscomp$2$$);
};
$JSCompiler_prototypeAlias$$.updatePaddingBottom = function($paddingBottom$jscomp$1$$) {
  this.ampdoc.waitForBodyOpen().then(function($body$jscomp$9$$) {
    $setStyle$$module$src$style$$($body$jscomp$9$$, "borderBottom", $paddingBottom$jscomp$1$$ + "px solid transparent");
  });
};
$JSCompiler_prototypeAlias$$.getSize = function() {
  if (this.$size_$) {
    return this.$size_$;
  }
  this.$size_$ = this.$binding_$.getSize();
  if (0 == this.$size_$.width || 0 == this.$size_$.height) {
    var $visibilityState$$ = this.ampdoc.getVisibilityState();
    ("prerender" == $visibilityState$$ || "visible" == $visibilityState$$) && 0.01 > Math.random() && $dev$$module$src$log$$().error("Viewport", "viewport has zero dimensions");
  }
  return this.$size_$;
};
$JSCompiler_prototypeAlias$$.getHeight = function() {
  return this.getSize().height;
};
$JSCompiler_prototypeAlias$$.getWidth = function() {
  return this.getSize().width;
};
$JSCompiler_prototypeAlias$$.getScrollWidth = function() {
  return this.$binding_$.getScrollWidth();
};
$JSCompiler_prototypeAlias$$.getScrollHeight = function() {
  return this.$binding_$.getScrollHeight();
};
$JSCompiler_prototypeAlias$$.getContentHeight = function() {
  return this.$binding_$.getContentHeight();
};
$JSCompiler_prototypeAlias$$.contentHeightChanged = function() {
  this.$binding_$.contentHeightChanged();
};
$JSCompiler_prototypeAlias$$.getRect = function() {
  if (null == this.$rect_$) {
    var $scrollTop$jscomp$4$$ = this.getScrollTop(), $scrollLeft$jscomp$2$$ = this.getScrollLeft(), $size$jscomp$20$$ = this.getSize();
    this.$rect_$ = $layoutRectLtwh$$module$src$layout_rect$$($scrollLeft$jscomp$2$$, $scrollTop$jscomp$4$$, $size$jscomp$20$$.width, $size$jscomp$20$$.height);
  }
  return this.$rect_$;
};
$JSCompiler_prototypeAlias$$.getLayoutRect = function($b$jscomp$9_el$jscomp$25$$, $opt_premeasuredRect$jscomp$4$$) {
  var $c$jscomp$4_scrollLeft$jscomp$3$$ = this.getScrollLeft(), $scrollTop$jscomp$5$$ = this.getScrollTop(), $frameElement$jscomp$1$$ = $getParentWindowFrameElement$$module$src$service$$($b$jscomp$9_el$jscomp$25$$, this.ampdoc.win);
  return $frameElement$jscomp$1$$ ? ($b$jscomp$9_el$jscomp$25$$ = this.$binding_$.getLayoutRect($b$jscomp$9_el$jscomp$25$$, 0, 0, $opt_premeasuredRect$jscomp$4$$), $c$jscomp$4_scrollLeft$jscomp$3$$ = this.$binding_$.getLayoutRect($frameElement$jscomp$1$$, $c$jscomp$4_scrollLeft$jscomp$3$$, $scrollTop$jscomp$5$$), $layoutRectLtwh$$module$src$layout_rect$$(Math.round($b$jscomp$9_el$jscomp$25$$.left + $c$jscomp$4_scrollLeft$jscomp$3$$.left), Math.round($b$jscomp$9_el$jscomp$25$$.top + $c$jscomp$4_scrollLeft$jscomp$3$$.top), 
  Math.round($b$jscomp$9_el$jscomp$25$$.width), Math.round($b$jscomp$9_el$jscomp$25$$.height))) : this.$binding_$.getLayoutRect($b$jscomp$9_el$jscomp$25$$, $c$jscomp$4_scrollLeft$jscomp$3$$, $scrollTop$jscomp$5$$, $opt_premeasuredRect$jscomp$4$$);
};
$JSCompiler_prototypeAlias$$.getClientRectAsync = function($el$jscomp$26$$) {
  var $local$$ = this.$vsync_$.measurePromise(function() {
    return $el$jscomp$26$$.getBoundingClientRect();
  }), $root$jscomp$23$$ = this.$binding_$.getRootClientRectAsync(), $frameElement$jscomp$2$$ = $getParentWindowFrameElement$$module$src$service$$($el$jscomp$26$$, this.ampdoc.win);
  $frameElement$jscomp$2$$ && ($root$jscomp$23$$ = this.$vsync_$.measurePromise(function() {
    return $frameElement$jscomp$2$$.getBoundingClientRect();
  }));
  return Promise.all([$local$$, $root$jscomp$23$$]).then(function($el$jscomp$26$$) {
    var $local$$ = $el$jscomp$26$$[0];
    return ($el$jscomp$26$$ = $el$jscomp$26$$[1]) ? $moveLayoutRect$$module$src$layout_rect$$($local$$, $el$jscomp$26$$.left, $el$jscomp$26$$.top) : $layoutRectLtwh$$module$src$layout_rect$$(Number($local$$.left), Number($local$$.top), Number($local$$.width), Number($local$$.height));
  });
};
$JSCompiler_prototypeAlias$$.supportsPositionFixed = function() {
  return this.$binding_$.supportsPositionFixed();
};
$JSCompiler_prototypeAlias$$.isDeclaredFixed = function($element$jscomp$215$$) {
  return this.$fixedLayer_$ ? this.$fixedLayer_$.isDeclaredFixed($element$jscomp$215$$) : !1;
};
$JSCompiler_prototypeAlias$$.scrollIntoView = function($element$jscomp$216$$) {
  var $$jscomp$this$jscomp$138$$ = this;
  return $JSCompiler_StaticMethods_getScrollingContainerFor_$$(this, $element$jscomp$216$$).then(function($parent$jscomp$25$$) {
    return $JSCompiler_StaticMethods_scrollIntoViewInternal_$$($$jscomp$this$jscomp$138$$, $element$jscomp$216$$, $parent$jscomp$25$$);
  });
};
function $JSCompiler_StaticMethods_scrollIntoViewInternal_$$($JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$, $element$jscomp$217$$, $parent$jscomp$26$$) {
  var $elementTop$$ = $JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$.$binding_$.getLayoutRect($element$jscomp$217$$).top;
  $tryResolve$$module$src$utils$promise$$(function() {
    return Math.max(0, $elementTop$$ - $JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$.$paddingTop_$);
  }).then(function($element$jscomp$217$$) {
    return $JSCompiler_StaticMethods_setElementScrollTop_$$($JSCompiler_StaticMethods_scrollIntoViewInternal_$self$$, $parent$jscomp$26$$, $element$jscomp$217$$);
  });
}
$JSCompiler_prototypeAlias$$.animateScrollIntoView = function($element$jscomp$218$$, $pos$jscomp$4$$, $opt_duration$jscomp$5$$, $opt_curve$jscomp$4$$) {
  var $$jscomp$this$jscomp$140$$ = this;
  $pos$jscomp$4$$ = void 0 === $pos$jscomp$4$$ ? "top" : $pos$jscomp$4$$;
  $devAssert$$module$src$log$$(!$opt_curve$jscomp$4$$ || void 0 !== $opt_duration$jscomp$5$$);
  return $JSCompiler_StaticMethods_getScrollingContainerFor_$$(this, $element$jscomp$218$$).then(function($parent$jscomp$27$$) {
    return $$jscomp$this$jscomp$140$$.animateScrollWithinParent($element$jscomp$218$$, $parent$jscomp$27$$, $pos$jscomp$4$$, $opt_duration$jscomp$5$$, $opt_curve$jscomp$4$$);
  });
};
$JSCompiler_prototypeAlias$$.animateScrollWithinParent = function($element$jscomp$219$$, $parent$jscomp$28$$, $pos$jscomp$5$$, $opt_duration$jscomp$6$$, $opt_curve$jscomp$5$$) {
  var $$jscomp$this$jscomp$141$$ = this;
  $devAssert$$module$src$log$$(!$opt_curve$jscomp$5$$ || void 0 !== $opt_duration$jscomp$6$$);
  var $elementRect$jscomp$1$$ = this.$binding_$.getLayoutRect($element$jscomp$219$$), $parentHeight$$ = ($parent$jscomp$28$$ == this.$binding_$.getScrollingElement() ? this.getSize() : this.getLayoutRect($parent$jscomp$28$$)).height;
  switch($pos$jscomp$5$$) {
    case "bottom":
      var $offset$jscomp$26$$ = -$parentHeight$$ + $elementRect$jscomp$1$$.height;
      break;
    case "center":
      $offset$jscomp$26$$ = -$parentHeight$$ / 2 + $elementRect$jscomp$1$$.height / 2;
      break;
    default:
      $offset$jscomp$26$$ = 0;
  }
  return $JSCompiler_StaticMethods_getElementScrollTop_$$(this, $parent$jscomp$28$$).then(function($element$jscomp$219$$) {
    var $pos$jscomp$5$$ = Math.max(0, $elementRect$jscomp$1$$.top - $$jscomp$this$jscomp$141$$.$paddingTop_$ + $offset$jscomp$26$$);
    if ($pos$jscomp$5$$ != $element$jscomp$219$$) {
      return $JSCompiler_StaticMethods_interpolateScrollIntoView_$$($$jscomp$this$jscomp$141$$, $parent$jscomp$28$$, $element$jscomp$219$$, $pos$jscomp$5$$, $opt_duration$jscomp$6$$, $opt_curve$jscomp$5$$);
    }
  });
};
function $JSCompiler_StaticMethods_interpolateScrollIntoView_$$($JSCompiler_StaticMethods_interpolateScrollIntoView_$self$$, $parent$jscomp$29$$, $curScrollTop$jscomp$1$$, $newScrollTop$jscomp$2$$, $duration$jscomp$5_opt_duration$jscomp$7$$, $curve$jscomp$3$$) {
  $curve$jscomp$3$$ = void 0 === $curve$jscomp$3$$ ? "ease-in" : $curve$jscomp$3$$;
  $duration$jscomp$5_opt_duration$jscomp$7$$ = void 0 !== $duration$jscomp$5_opt_duration$jscomp$7$$ ? $duration$jscomp$5_opt_duration$jscomp$7$$ : Math.floor($clamp$$module$src$utils$math$$(0.65 * Math.abs($curScrollTop$jscomp$1$$ - $newScrollTop$jscomp$2$$)));
  var $interpolate$$ = $numeric$$module$src$transition$$($curScrollTop$jscomp$1$$, $newScrollTop$jscomp$2$$);
  return $Animation$$module$src$animation$animate$$($parent$jscomp$29$$, function($curScrollTop$jscomp$1$$) {
    $JSCompiler_StaticMethods_setElementScrollTop_$$($JSCompiler_StaticMethods_interpolateScrollIntoView_$self$$, $parent$jscomp$29$$, $interpolate$$($curScrollTop$jscomp$1$$));
  }, $duration$jscomp$5_opt_duration$jscomp$7$$, $curve$jscomp$3$$).thenAlways(function() {
    $JSCompiler_StaticMethods_setElementScrollTop_$$($JSCompiler_StaticMethods_interpolateScrollIntoView_$self$$, $parent$jscomp$29$$, $newScrollTop$jscomp$2$$);
  });
}
function $JSCompiler_StaticMethods_getScrollingContainerFor_$$($JSCompiler_StaticMethods_getScrollingContainerFor_$self$$, $element$jscomp$220$$) {
  return $JSCompiler_StaticMethods_getScrollingContainerFor_$self$$.$vsync_$.measurePromise(function() {
    return $closestAncestorElementBySelector$$module$src$dom$$($element$jscomp$220$$, ".i-amphtml-scrollable") || $JSCompiler_StaticMethods_getScrollingContainerFor_$self$$.$binding_$.getScrollingElement();
  });
}
function $JSCompiler_StaticMethods_setElementScrollTop_$$($JSCompiler_StaticMethods_setElementScrollTop_$self$$, $element$jscomp$221$$, $scrollTop$jscomp$6$$) {
  $element$jscomp$221$$ == $JSCompiler_StaticMethods_setElementScrollTop_$self$$.$binding_$.getScrollingElement() ? $JSCompiler_StaticMethods_setElementScrollTop_$self$$.$binding_$.setScrollTop($scrollTop$jscomp$6$$) : $JSCompiler_StaticMethods_setElementScrollTop_$self$$.$vsync_$.mutate(function() {
    $element$jscomp$221$$.scrollTop = $scrollTop$jscomp$6$$;
  });
}
function $JSCompiler_StaticMethods_getElementScrollTop_$$($JSCompiler_StaticMethods_getElementScrollTop_$self$$, $element$jscomp$222$$) {
  return $element$jscomp$222$$ == $JSCompiler_StaticMethods_getElementScrollTop_$self$$.$binding_$.getScrollingElement() ? $tryResolve$$module$src$utils$promise$$(function() {
    return $JSCompiler_StaticMethods_getElementScrollTop_$self$$.getScrollTop();
  }) : $JSCompiler_StaticMethods_getElementScrollTop_$self$$.$vsync_$.measurePromise(function() {
    return $element$jscomp$222$$.scrollTop;
  });
}
$JSCompiler_prototypeAlias$$.getScrollingElement = function() {
  return this.$scrollingElement_$ ? this.$scrollingElement_$ : this.$scrollingElement_$ = this.$binding_$.getScrollingElement();
};
$JSCompiler_prototypeAlias$$.onChanged = function($handler$jscomp$30$$) {
  return this.$changeObservable_$.add($handler$jscomp$30$$);
};
$JSCompiler_prototypeAlias$$.onScroll = function($handler$jscomp$31$$) {
  return this.$scrollObservable_$.add($handler$jscomp$31$$);
};
$JSCompiler_prototypeAlias$$.onResize = function($handler$jscomp$32$$) {
  return this.$resizeObservable_$.add($handler$jscomp$32$$);
};
$JSCompiler_prototypeAlias$$.enterLightboxMode = function($opt_requestingElement$jscomp$2$$, $opt_onComplete$jscomp$2$$) {
  this.$viewer_$.sendMessage("requestFullOverlay", {}, !0);
  this.enterOverlayMode();
  this.$fixedLayer_$.enterLightbox($opt_requestingElement$jscomp$2$$, $opt_onComplete$jscomp$2$$);
  $opt_requestingElement$jscomp$2$$ && this.maybeEnterFieLightboxMode($opt_requestingElement$jscomp$2$$);
  return this.$binding_$.updateLightboxMode(!0);
};
$JSCompiler_prototypeAlias$$.leaveLightboxMode = function($opt_requestingElement$jscomp$3$$) {
  this.$viewer_$.sendMessage("cancelFullOverlay", {}, !0);
  this.$fixedLayer_$.leaveLightbox();
  this.leaveOverlayMode();
  $opt_requestingElement$jscomp$3$$ && this.maybeLeaveFieLightboxMode($opt_requestingElement$jscomp$3$$);
  return this.$binding_$.updateLightboxMode(!1);
};
$JSCompiler_prototypeAlias$$.isLightboxExperimentOn = function() {
  return $isExperimentOn$$module$src$experiments$$(this.ampdoc.win, "amp-lightbox-a4a-proto");
};
$JSCompiler_prototypeAlias$$.maybeEnterFieLightboxMode = function($requestingElement$$) {
  var $fieOptional$$ = $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$$(this, $requestingElement$$);
  $fieOptional$$ && ($devAssert$$module$src$log$$(this.isLightboxExperimentOn()), $fieOptional$$.enterFullOverlayMode());
};
$JSCompiler_prototypeAlias$$.maybeLeaveFieLightboxMode = function($fieOptional$jscomp$1_requestingElement$jscomp$1$$) {
  ($fieOptional$jscomp$1_requestingElement$jscomp$1$$ = $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$$(this, $fieOptional$jscomp$1_requestingElement$jscomp$1$$)) && $devAssert$$module$src$log$$($fieOptional$jscomp$1_requestingElement$jscomp$1$$).leaveFullOverlayMode();
};
function $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$$($JSCompiler_StaticMethods_getFriendlyIframeEmbed_$self$$, $element$jscomp$224$$) {
  var $iframeOptional$$ = $getParentWindowFrameElement$$module$src$service$$($element$jscomp$224$$, $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$self$$.ampdoc.win);
  return $iframeOptional$$ && $iframeOptional$$.__AMP_EMBED__;
}
$JSCompiler_prototypeAlias$$.enterOverlayMode = function() {
  this.disableTouchZoom();
  this.disableScroll();
};
$JSCompiler_prototypeAlias$$.leaveOverlayMode = function() {
  this.resetScroll();
  this.restoreOriginalTouchZoom();
};
$JSCompiler_prototypeAlias$$.disableScroll = function() {
  var $$jscomp$this$jscomp$145$$ = this, $win$jscomp$205$$ = this.ampdoc.win, $documentElement$jscomp$2$$ = $win$jscomp$205$$.document.documentElement, $requestedMarginRight$$;
  this.$vsync_$.measure(function() {
    var $existingMargin$$ = $computedStyle$$module$src$style$$($win$jscomp$205$$, $documentElement$jscomp$2$$).marginRight;
    var $JSCompiler_inline_result$jscomp$120_JSCompiler_win$jscomp$inline_728$$ = $$jscomp$this$jscomp$145$$.ampdoc.win;
    $JSCompiler_inline_result$jscomp$120_JSCompiler_win$jscomp$inline_728$$ = $JSCompiler_inline_result$jscomp$120_JSCompiler_win$jscomp$inline_728$$.innerWidth - $JSCompiler_inline_result$jscomp$120_JSCompiler_win$jscomp$inline_728$$.document.documentElement.clientWidth;
    $requestedMarginRight$$ = parseInt($existingMargin$$, 10) + $JSCompiler_inline_result$jscomp$120_JSCompiler_win$jscomp$inline_728$$;
  });
  this.$vsync_$.mutate(function() {
    $setStyle$$module$src$style$$($documentElement$jscomp$2$$, "margin-right", $requestedMarginRight$$, "px");
    $$jscomp$this$jscomp$145$$.$binding_$.disableScroll();
  });
};
$JSCompiler_prototypeAlias$$.resetScroll = function() {
  var $$jscomp$this$jscomp$146$$ = this, $documentElement$jscomp$3$$ = this.ampdoc.win.document.documentElement;
  this.$vsync_$.mutate(function() {
    $setStyle$$module$src$style$$($documentElement$jscomp$3$$, "margin-right", "");
    $$jscomp$this$jscomp$146$$.$binding_$.resetScroll();
  });
};
$JSCompiler_prototypeAlias$$.resetTouchZoom = function() {
  var $$jscomp$this$jscomp$147$$ = this, $windowHeight$$ = this.ampdoc.win.innerHeight, $documentHeight$$ = this.$globalDoc_$.documentElement.clientHeight;
  $windowHeight$$ && $documentHeight$$ && $windowHeight$$ === $documentHeight$$ || this.disableTouchZoom() && this.$timer_$.delay(function() {
    $$jscomp$this$jscomp$147$$.restoreOriginalTouchZoom();
  }, 50);
};
$JSCompiler_prototypeAlias$$.disableTouchZoom = function() {
  var $viewportMeta$$ = $JSCompiler_StaticMethods_getViewportMeta_$$(this);
  if (!$viewportMeta$$) {
    return !1;
  }
  var $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$ = $viewportMeta$$.content, $JSCompiler_updateParams$jscomp$inline_731$$ = {"maximum-scale":"1", "user-scalable":"no"};
  var $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$ = Object.create(null);
  if ($JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$) {
    for (var $JSCompiler_changed$jscomp$inline_733_JSCompiler_pairs$jscomp$inline_957$$ = $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$.split(/,|;/), $JSCompiler_i$jscomp$inline_958$$ = 0; $JSCompiler_i$jscomp$inline_958$$ < $JSCompiler_changed$jscomp$inline_733_JSCompiler_pairs$jscomp$inline_957$$.length; $JSCompiler_i$jscomp$inline_958$$++) {
      var $JSCompiler_split$jscomp$inline_959_JSCompiler_value$jscomp$inline_961$$ = $JSCompiler_changed$jscomp$inline_733_JSCompiler_pairs$jscomp$inline_957$$[$JSCompiler_i$jscomp$inline_958$$].split("="), $JSCompiler_name$jscomp$inline_960$$ = $JSCompiler_split$jscomp$inline_959_JSCompiler_value$jscomp$inline_961$$[0].trim();
      $JSCompiler_split$jscomp$inline_959_JSCompiler_value$jscomp$inline_961$$ = $JSCompiler_split$jscomp$inline_959_JSCompiler_value$jscomp$inline_961$$[1];
      $JSCompiler_split$jscomp$inline_959_JSCompiler_value$jscomp$inline_961$$ = ($JSCompiler_split$jscomp$inline_959_JSCompiler_value$jscomp$inline_961$$ || "").trim();
      $JSCompiler_name$jscomp$inline_960$$ && ($JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$[$JSCompiler_name$jscomp$inline_960$$] = $JSCompiler_split$jscomp$inline_959_JSCompiler_value$jscomp$inline_961$$);
    }
  }
  $JSCompiler_changed$jscomp$inline_733_JSCompiler_pairs$jscomp$inline_957$$ = !1;
  for (var $JSCompiler_k$jscomp$inline_734$$ in $JSCompiler_updateParams$jscomp$inline_731$$) {
    $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$[$JSCompiler_k$jscomp$inline_734$$] !== $JSCompiler_updateParams$jscomp$inline_731$$[$JSCompiler_k$jscomp$inline_734$$] && ($JSCompiler_changed$jscomp$inline_733_JSCompiler_pairs$jscomp$inline_957$$ = !0, void 0 !== $JSCompiler_updateParams$jscomp$inline_731$$[$JSCompiler_k$jscomp$inline_734$$] ? $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$[$JSCompiler_k$jscomp$inline_734$$] = $JSCompiler_updateParams$jscomp$inline_731$$[$JSCompiler_k$jscomp$inline_734$$] : 
    delete $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$[$JSCompiler_k$jscomp$inline_734$$]);
  }
  if ($JSCompiler_changed$jscomp$inline_733_JSCompiler_pairs$jscomp$inline_957$$) {
    $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$ = "";
    for (var $JSCompiler_k$jscomp$inline_965$$ in $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$) {
      0 < $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$.length && ($JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$ += ","), $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$ = $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$[$JSCompiler_k$jscomp$inline_965$$] ? $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$ + ($JSCompiler_k$jscomp$inline_965$$ + 
      "=" + $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$[$JSCompiler_k$jscomp$inline_965$$]) : $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$ + $JSCompiler_k$jscomp$inline_965$$;
    }
    $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$ = $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$;
  } else {
    $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$ = $JSCompiler_content$jscomp$inline_964_JSCompiler_currentValue$jscomp$inline_730$$;
  }
  return $JSCompiler_StaticMethods_setViewportMetaString_$$(this, $JSCompiler_params$jscomp$inline_956_JSCompiler_temp$jscomp$859$$);
};
$JSCompiler_prototypeAlias$$.restoreOriginalTouchZoom = function() {
  return void 0 !== this.$originalViewportMetaString_$ ? $JSCompiler_StaticMethods_setViewportMetaString_$$(this, this.$originalViewportMetaString_$) : !1;
};
$JSCompiler_prototypeAlias$$.updateFixedLayer = function() {
  this.$fixedLayer_$.update();
};
$JSCompiler_prototypeAlias$$.addToFixedLayer = function($element$jscomp$225$$, $opt_forceTransfer$jscomp$3$$) {
  return this.$fixedLayer_$.addElement($element$jscomp$225$$, $opt_forceTransfer$jscomp$3$$);
};
$JSCompiler_prototypeAlias$$.removeFromFixedLayer = function($element$jscomp$226$$) {
  this.$fixedLayer_$.removeElement($element$jscomp$226$$);
};
$JSCompiler_prototypeAlias$$.createFixedLayer = function($constructor$jscomp$5$$) {
  var $$jscomp$this$jscomp$148$$ = this;
  this.$fixedLayer_$ = new $constructor$jscomp$5$$(this.ampdoc, this.$vsync_$, this.$binding_$.getBorderTop(), this.$paddingTop_$, this.$binding_$.requiresFixedLayerTransfer());
  this.ampdoc.whenReady().then(function() {
    return $$jscomp$this$jscomp$148$$.$fixedLayer_$.setup();
  });
};
function $JSCompiler_StaticMethods_setViewportMetaString_$$($JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$, $viewportMetaString$$) {
  return ($JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$ = $JSCompiler_StaticMethods_getViewportMeta_$$($JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$)) && $JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$.content != $viewportMetaString$$ ? ($JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$.content = $viewportMetaString$$, !0) : !1;
}
function $JSCompiler_StaticMethods_getViewportMeta_$$($JSCompiler_StaticMethods_getViewportMeta_$self$$) {
  if ($isIframed$$module$src$dom$$($JSCompiler_StaticMethods_getViewportMeta_$self$$.ampdoc.win)) {
    return null;
  }
  void 0 === $JSCompiler_StaticMethods_getViewportMeta_$self$$.$viewportMeta_$ && ($JSCompiler_StaticMethods_getViewportMeta_$self$$.$viewportMeta_$ = $JSCompiler_StaticMethods_getViewportMeta_$self$$.$globalDoc_$.querySelector("meta[name=viewport]"), $JSCompiler_StaticMethods_getViewportMeta_$self$$.$viewportMeta_$ && ($JSCompiler_StaticMethods_getViewportMeta_$self$$.$originalViewportMetaString_$ = $JSCompiler_StaticMethods_getViewportMeta_$self$$.$viewportMeta_$.content));
  return $JSCompiler_StaticMethods_getViewportMeta_$self$$.$viewportMeta_$;
}
$JSCompiler_prototypeAlias$$.$viewerSetScrollTop_$ = function($data$jscomp$112$$) {
  this.setScrollTop($data$jscomp$112$$.scrollTop);
};
$JSCompiler_prototypeAlias$$.$updateOnViewportEvent_$ = function($data$jscomp$113$$) {
  var $$jscomp$this$jscomp$149$$ = this, $paddingTop$jscomp$6$$ = $data$jscomp$113$$.paddingTop, $duration$jscomp$6$$ = $data$jscomp$113$$.duration || 0, $curve$jscomp$4$$ = $data$jscomp$113$$.curve, $transient$jscomp$4$$ = $data$jscomp$113$$["transient"];
  if (void 0 != $paddingTop$jscomp$6$$ && $paddingTop$jscomp$6$$ != this.$paddingTop_$) {
    this.$lastPaddingTop_$ = this.$paddingTop_$;
    this.$paddingTop_$ = $paddingTop$jscomp$6$$;
    var $animPromise$$ = $JSCompiler_StaticMethods_animateFixedElements_$$(this, $duration$jscomp$6$$, $curve$jscomp$4$$, $transient$jscomp$4$$);
    $paddingTop$jscomp$6$$ < this.$lastPaddingTop_$ ? this.$binding_$.hideViewerHeader($transient$jscomp$4$$, this.$lastPaddingTop_$) : $animPromise$$.then(function() {
      $$jscomp$this$jscomp$149$$.$binding_$.showViewerHeader($transient$jscomp$4$$, $paddingTop$jscomp$6$$);
    });
  }
};
$JSCompiler_prototypeAlias$$.$disableScrollEventHandler_$ = function($data$jscomp$114$$) {
  $data$jscomp$114$$ ? this.disableScroll() : this.resetScroll();
};
function $JSCompiler_StaticMethods_animateFixedElements_$$($JSCompiler_StaticMethods_animateFixedElements_$self$$, $duration$jscomp$7$$, $curve$jscomp$5$$, $transient$jscomp$5$$) {
  $JSCompiler_StaticMethods_animateFixedElements_$self$$.$fixedLayer_$.updatePaddingTop($JSCompiler_StaticMethods_animateFixedElements_$self$$.$paddingTop_$, $transient$jscomp$5$$);
  if (0 >= $duration$jscomp$7$$) {
    return $resolvedPromise$$module$src$resolved_promise$$();
  }
  var $tr$jscomp$2$$ = $numeric$$module$src$transition$$($JSCompiler_StaticMethods_animateFixedElements_$self$$.$lastPaddingTop_$ - $JSCompiler_StaticMethods_animateFixedElements_$self$$.$paddingTop_$, 0);
  return $Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_animateFixedElements_$self$$.ampdoc.getRootNode(), function($duration$jscomp$7$$) {
    $duration$jscomp$7$$ = $tr$jscomp$2$$($duration$jscomp$7$$);
    $JSCompiler_StaticMethods_animateFixedElements_$self$$.$fixedLayer_$.transformMutate("translateY(" + $duration$jscomp$7$$ + "px)");
  }, $duration$jscomp$7$$, $curve$jscomp$5$$).thenAlways(function() {
    $JSCompiler_StaticMethods_animateFixedElements_$self$$.$fixedLayer_$.transformMutate(null);
  });
}
function $JSCompiler_StaticMethods_changed_$$($JSCompiler_StaticMethods_changed_$self$$, $relayoutAll$jscomp$2$$, $velocity$$) {
  var $size$jscomp$21$$ = $JSCompiler_StaticMethods_changed_$self$$.getSize(), $scrollTop$jscomp$7$$ = $JSCompiler_StaticMethods_changed_$self$$.getScrollTop(), $scrollLeft$jscomp$4$$ = $JSCompiler_StaticMethods_changed_$self$$.getScrollLeft();
  $JSCompiler_StaticMethods_changed_$self$$.$changeObservable_$.fire({relayoutAll:$relayoutAll$jscomp$2$$, top:$scrollTop$jscomp$7$$, left:$scrollLeft$jscomp$4$$, width:$size$jscomp$21$$.width, height:$size$jscomp$21$$.height, velocity:$velocity$$});
}
$JSCompiler_prototypeAlias$$.$scroll_$ = function() {
  var $$jscomp$this$jscomp$151$$ = this;
  this.$rect_$ = null;
  this.$scrollCount_$++;
  this.$scrollLeft_$ = this.$binding_$.getScrollLeft();
  var $newScrollTop$jscomp$3$$ = this.$binding_$.getScrollTop();
  if (!(0 > $newScrollTop$jscomp$3$$)) {
    this.$scrollTop_$ = $newScrollTop$jscomp$3$$;
    if (!this.$scrollTracking_$) {
      this.$scrollTracking_$ = !0;
      var $now$jscomp$10$$ = Date.now();
      this.$timer_$.delay(function() {
        $$jscomp$this$jscomp$151$$.$vsync_$.measure(function() {
          $$jscomp$this$jscomp$151$$.$throttledScroll_$($now$jscomp$10$$, $newScrollTop$jscomp$3$$);
        });
      }, 36);
    }
    this.$scrollObservable_$.fire();
  }
};
$JSCompiler_prototypeAlias$$.$throttledScroll_$ = function($referenceTime$$, $referenceTop$$) {
  var $$jscomp$this$jscomp$152$$ = this, $newScrollTop$jscomp$4$$ = this.$scrollTop_$ = this.$binding_$.getScrollTop(), $now$jscomp$11$$ = Date.now(), $velocity$jscomp$1$$ = 0;
  $now$jscomp$11$$ != $referenceTime$$ && ($velocity$jscomp$1$$ = ($newScrollTop$jscomp$4$$ - $referenceTop$$) / ($now$jscomp$11$$ - $referenceTime$$));
  0.03 > Math.abs($velocity$jscomp$1$$) ? ($JSCompiler_StaticMethods_changed_$$(this, !1, $velocity$jscomp$1$$), this.$scrollTracking_$ = !1) : this.$timer_$.delay(function() {
    return $$jscomp$this$jscomp$152$$.$vsync_$.measure($$jscomp$this$jscomp$152$$.$throttledScroll_$.bind($$jscomp$this$jscomp$152$$, $now$jscomp$11$$, $newScrollTop$jscomp$4$$));
  }, 20);
};
$JSCompiler_prototypeAlias$$.$sendScrollMessage_$ = function() {
  var $$jscomp$this$jscomp$153$$ = this;
  this.$scrollAnimationFrameThrottled_$ || (this.$scrollAnimationFrameThrottled_$ = !0, this.$vsync_$.measure(function() {
    $$jscomp$this$jscomp$153$$.$scrollAnimationFrameThrottled_$ = !1;
    $$jscomp$this$jscomp$153$$.$viewer_$.sendMessage("scroll", $dict$$module$src$utils$object$$({scrollTop:$$jscomp$this$jscomp$153$$.getScrollTop()}), !0);
  }));
};
$JSCompiler_prototypeAlias$$.$resize_$ = function() {
  var $$jscomp$this$jscomp$154$$ = this;
  this.$rect_$ = null;
  var $oldSize$$ = this.$size_$;
  this.$size_$ = null;
  var $newSize$$ = this.getSize();
  (this.$fixedLayer_$ ? this.$fixedLayer_$.update() : $resolvedPromise$$module$src$resolved_promise$$()).then(function() {
    var $widthChanged$$ = !$oldSize$$ || $oldSize$$.width != $newSize$$.width;
    $JSCompiler_StaticMethods_changed_$$($$jscomp$this$jscomp$154$$, $widthChanged$$, 0);
    ($widthChanged$$ || $oldSize$$.height != $newSize$$.height) && $$jscomp$this$jscomp$154$$.$resizeObservable_$.fire({relayoutAll:$widthChanged$$, width:$newSize$$.width, height:$newSize$$.height});
  });
};
function $createViewport$$module$src$service$viewport$viewport_impl$$($ampdoc$jscomp$86$$) {
  var $viewer$jscomp$18$$ = $Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$86$$), $binding$jscomp$9_win$jscomp$207$$ = $ampdoc$jscomp$86$$.win, $JSCompiler_isIframedIos$jscomp$inline_738_JSCompiler_temp$jscomp$205$$;
  if ($JSCompiler_isIframedIos$jscomp$inline_738_JSCompiler_temp$jscomp$205$$ = $ampdoc$jscomp$86$$.isSingleDoc()) {
    $JSCompiler_isIframedIos$jscomp$inline_738_JSCompiler_temp$jscomp$205$$ = $Services$$module$src$services$platformFor$$($binding$jscomp$9_win$jscomp$207$$).isIos() && $isIframed$$module$src$dom$$($binding$jscomp$9_win$jscomp$207$$), $JSCompiler_isIframedIos$jscomp$inline_738_JSCompiler_temp$jscomp$205$$ = ($getMode$$module$src$mode$$($binding$jscomp$9_win$jscomp$207$$).test && $JSCompiler_isIframedIos$jscomp$inline_738_JSCompiler_temp$jscomp$205$$ || $JSCompiler_isIframedIos$jscomp$inline_738_JSCompiler_temp$jscomp$205$$ && 
    $viewer$jscomp$18$$.isEmbedded() && !$viewer$jscomp$18$$.hasCapability("iframeScroll") ? $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL_IOS_EMBED$$ : $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL$$) == $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL_IOS_EMBED$$;
  }
  $binding$jscomp$9_win$jscomp$207$$ = $JSCompiler_isIframedIos$jscomp$inline_738_JSCompiler_temp$jscomp$205$$ ? new $ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$($binding$jscomp$9_win$jscomp$207$$) : new $ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$($ampdoc$jscomp$86$$);
  return new $ViewportImpl$$module$src$service$viewport$viewport_impl$$($ampdoc$jscomp$86$$, $binding$jscomp$9_win$jscomp$207$$, $viewer$jscomp$18$$);
}
var $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL$$ = "natural", $ViewportType$$module$src$service$viewport$viewport_impl$NATURAL_IOS_EMBED$$ = "natural-ios-embed";
var $_template$$module$src$service$jank_meter$$ = ["<div class=i-amphtml-jank-meter></div>"];
function $JankMeter$$module$src$service$jank_meter$$($win$jscomp$209$$) {
  this.$win_$ = $win$jscomp$209$$;
  this.$longTaskSelf_$ = this.$longTaskChild_$ = this.$totalFrameCnt_$ = this.$badFrameCnt_$ = 0;
  this.$scheduledTime_$ = null;
  this.$perf_$ = $getExistingServiceOrNull$$module$src$service$$($win$jscomp$209$$);
  this.$longTaskObserver_$ = this.$batteryLevelStart_$ = this.$batteryManager_$ = null;
  $JSCompiler_StaticMethods_initializeLongTaskObserver_$$(this);
}
$JankMeter$$module$src$service$jank_meter$$.prototype.onScheduled = function() {
  $JSCompiler_StaticMethods_isEnabled_$$(this) && null == this.$scheduledTime_$ && (this.$scheduledTime_$ = this.$win_$.Date.now());
};
$JankMeter$$module$src$service$jank_meter$$.prototype.onRun = function() {
  if ($JSCompiler_StaticMethods_isEnabled_$$(this) && null != this.$scheduledTime_$) {
    var $paintLatency$$ = this.$win_$.Date.now() - this.$scheduledTime_$;
    this.$scheduledTime_$ = null;
    this.$totalFrameCnt_$++;
    16 < $paintLatency$$ && (this.$badFrameCnt_$++, $dev$$module$src$log$$().info("JANK", "Paint latency: " + $paintLatency$$ + "ms"));
    if (this.$perf_$ && 200 == this.$totalFrameCnt_$) {
      var $gfp$$ = this.$win_$.Math.floor((this.$totalFrameCnt_$ - this.$badFrameCnt_$) / this.$totalFrameCnt_$ * 100);
      this.$perf_$.tickDelta("gfp", $gfp$$);
      this.$perf_$.tickDelta("bf", this.$badFrameCnt_$);
      this.$longTaskObserver_$ && (this.$perf_$.tickDelta("lts", this.$longTaskSelf_$), this.$perf_$.tickDelta("ltc", this.$longTaskChild_$), this.$longTaskObserver_$.disconnect(), this.$longTaskObserver_$ = null);
      var $batteryDrop$$ = 0;
      this.$batteryManager_$ && null != this.$batteryLevelStart_$ && ($batteryDrop$$ = this.$win_$.Math.max(0, this.$win_$.Math.floor(100 * this.$batteryManager_$.level - this.$batteryLevelStart_$)), this.$perf_$.tickDelta("bd", $batteryDrop$$));
      this.$perf_$.flush();
      if ($isExperimentOn$$module$src$experiments$$(this.$win_$, "jank-meter")) {
        var $JSCompiler_batteryDrop$jscomp$inline_741$$ = $batteryDrop$$, $JSCompiler_doc$jscomp$inline_742$$ = this.$win_$.document, $JSCompiler_display$jscomp$inline_743$$ = $htmlFor$$module$src$static_template$$($JSCompiler_doc$jscomp$inline_742$$)($_template$$module$src$service$jank_meter$$);
        $JSCompiler_display$jscomp$inline_743$$.textContent = "bf:" + this.$badFrameCnt_$ + ", lts: " + this.$longTaskSelf_$ + ", ltc:" + (this.$longTaskChild_$ + ", bd:" + $JSCompiler_batteryDrop$jscomp$inline_741$$);
        $JSCompiler_doc$jscomp$inline_742$$.body.appendChild($JSCompiler_display$jscomp$inline_743$$);
      }
    }
  }
};
function $JSCompiler_StaticMethods_isEnabled_$$($JSCompiler_StaticMethods_isEnabled_$self$$) {
  return $isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_isEnabled_$self$$.$win_$, "jank-meter") || $JSCompiler_StaticMethods_isEnabled_$self$$.$perf_$ && $JSCompiler_StaticMethods_isEnabled_$self$$.$perf_$.isPerformanceTrackingOn() && 200 > $JSCompiler_StaticMethods_isEnabled_$self$$.$totalFrameCnt_$;
}
function $JSCompiler_StaticMethods_initializeLongTaskObserver_$$($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$) {
  $JSCompiler_StaticMethods_isEnabled_$$($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$) && $isLongTaskApiSupported$$module$src$service$jank_meter$$($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$win_$) && ($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$longTaskObserver_$ = new $JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$win_$.PerformanceObserver(function($entryList$$) {
    for (var $entries$jscomp$2$$ = $entryList$$.getEntries(), $i$jscomp$106$$ = 0; $i$jscomp$106$$ < $entries$jscomp$2$$.length; $i$jscomp$106$$++) {
      if ("longtask" == $entries$jscomp$2$$[$i$jscomp$106$$].entryType) {
        var $span$$ = $JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$win_$.Math.floor($entries$jscomp$2$$[$i$jscomp$106$$].duration / 50);
        "cross-origin-descendant" == $entries$jscomp$2$$[$i$jscomp$106$$].name ? ($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$longTaskChild_$ += $span$$, $user$$module$src$log$$().info("LONGTASK", "from child frame " + $entries$jscomp$2$$[$i$jscomp$106$$].duration + "ms")) : ($JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$longTaskSelf_$ += $span$$, $dev$$module$src$log$$().info("LONGTASK", "from self frame " + $entries$jscomp$2$$[$i$jscomp$106$$].duration + "ms"));
      }
    }
  }), $JSCompiler_StaticMethods_initializeLongTaskObserver_$self$$.$longTaskObserver_$.observe({entryTypes:["longtask"]}));
}
function $isLongTaskApiSupported$$module$src$service$jank_meter$$($win$jscomp$211$$) {
  return !!$win$jscomp$211$$.PerformanceObserver && !!$win$jscomp$211$$.TaskAttributionTiming && "containerName" in $win$jscomp$211$$.TaskAttributionTiming.prototype;
}
;function $getDocumentVisibilityState$$module$src$utils$document_visibility$$($doc$jscomp$50$$) {
  var $visibilityStateProp$$ = $getVendorJsPropertyName$$module$src$style$$($doc$jscomp$50$$, "visibilityState", !0);
  if ($doc$jscomp$50$$[$visibilityStateProp$$]) {
    return $doc$jscomp$50$$[$visibilityStateProp$$];
  }
  var $hiddenProp$$ = $getVendorJsPropertyName$$module$src$style$$($doc$jscomp$50$$, "hidden", !0);
  return $doc$jscomp$50$$[$hiddenProp$$] ? $doc$jscomp$50$$[$hiddenProp$$] ? "hidden" : "visible" : "visible";
}
function $addDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$($doc$jscomp$52$$, $handler$jscomp$33$$) {
  if ($doc$jscomp$52$$.addEventListener) {
    var $visibilityChangeEvent$$ = $getVisibilityChangeEvent$$module$src$utils$document_visibility$$($doc$jscomp$52$$);
    $visibilityChangeEvent$$ && $doc$jscomp$52$$.addEventListener($visibilityChangeEvent$$, $handler$jscomp$33$$);
  }
}
function $removeDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$($doc$jscomp$53$$, $handler$jscomp$34$$) {
  if ($doc$jscomp$53$$.removeEventListener) {
    var $visibilityChangeEvent$jscomp$1$$ = $getVisibilityChangeEvent$$module$src$utils$document_visibility$$($doc$jscomp$53$$);
    $visibilityChangeEvent$jscomp$1$$ && $doc$jscomp$53$$.removeEventListener($visibilityChangeEvent$jscomp$1$$, $handler$jscomp$34$$);
  }
}
function $getVisibilityChangeEvent$$module$src$utils$document_visibility$$($doc$jscomp$54_hiddenProp$jscomp$1$$) {
  $doc$jscomp$54_hiddenProp$jscomp$1$$ = $getVendorJsPropertyName$$module$src$style$$($doc$jscomp$54_hiddenProp$jscomp$1$$, "hidden", !0);
  var $vendorStop$$ = $doc$jscomp$54_hiddenProp$jscomp$1$$.indexOf("Hidden");
  return -1 != $vendorStop$$ ? $doc$jscomp$54_hiddenProp$jscomp$1$$.substring(0, $vendorStop$$) + "Visibilitychange" : "visibilitychange";
}
;function $Vsync$$module$src$service$vsync_impl$$($win$jscomp$212$$) {
  this.win = $win$jscomp$212$$;
  this.$ampdocService_$ = $Services$$module$src$services$ampdocServiceFor$$(this.win);
  this.$raf_$ = $JSCompiler_StaticMethods_getRaf_$$(this);
  this.$tasks_$ = [];
  this.$nextTasks_$ = [];
  this.$states_$ = [];
  this.$nextStates_$ = [];
  this.$scheduled_$ = !1;
  this.$nextFrameResolver_$ = this.$nextFramePromise_$ = null;
  this.$boundRunScheduledTasks_$ = this.$runScheduledTasks_$.bind(this);
  this.$invisiblePass_$ = new $Pass$$module$src$pass$$(this.win, this.$boundRunScheduledTasks_$, 16);
  this.$backupPass_$ = new $Pass$$module$src$pass$$(this.win, this.$boundRunScheduledTasks_$, 40);
  this.$boundOnVisibilityChanged_$ = this.$onVisibilityChanged_$.bind(this);
  if (this.$ampdocService_$.isSingleDoc()) {
    this.$ampdocService_$.getSingleDoc().onVisibilityChanged(this.$boundOnVisibilityChanged_$);
  } else {
    $addDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$(this.win.document, this.$boundOnVisibilityChanged_$);
  }
  this.$jankMeter_$ = new $JankMeter$$module$src$service$jank_meter$$(this.win);
}
$JSCompiler_prototypeAlias$$ = $Vsync$$module$src$service$vsync_impl$$.prototype;
$JSCompiler_prototypeAlias$$.dispose = function() {
  $removeDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$(this.win.document, this.$boundOnVisibilityChanged_$);
};
$JSCompiler_prototypeAlias$$.$onVisibilityChanged_$ = function() {
  this.$scheduled_$ && $JSCompiler_StaticMethods_forceSchedule_$$(this);
};
$JSCompiler_prototypeAlias$$.run = function($task$jscomp$15$$, $opt_state$$) {
  this.$tasks_$.push($task$jscomp$15$$);
  this.$states_$.push($opt_state$$ || void 0);
  this.$schedule_$();
};
$JSCompiler_prototypeAlias$$.runPromise = function($deferred$jscomp$19_task$jscomp$16$$, $opt_state$jscomp$1$$) {
  this.run($deferred$jscomp$19_task$jscomp$16$$, $opt_state$jscomp$1$$);
  if (this.$nextFramePromise_$) {
    return this.$nextFramePromise_$;
  }
  $deferred$jscomp$19_task$jscomp$16$$ = new $Deferred$$module$src$utils$promise$$;
  this.$nextFrameResolver_$ = $deferred$jscomp$19_task$jscomp$16$$.resolve;
  return this.$nextFramePromise_$ = $deferred$jscomp$19_task$jscomp$16$$.promise;
};
$JSCompiler_prototypeAlias$$.createTask = function($task$jscomp$17$$) {
  var $$jscomp$this$jscomp$157$$ = this;
  return function($opt_state$jscomp$2$$) {
    $$jscomp$this$jscomp$157$$.run($task$jscomp$17$$, $opt_state$jscomp$2$$);
  };
};
$JSCompiler_prototypeAlias$$.mutate = function($mutator$jscomp$12$$) {
  this.run({measure:void 0, mutate:$mutator$jscomp$12$$});
};
$JSCompiler_prototypeAlias$$.mutatePromise = function($mutator$jscomp$13$$) {
  return this.runPromise({measure:void 0, mutate:$mutator$jscomp$13$$});
};
$JSCompiler_prototypeAlias$$.measure = function($measurer$jscomp$7$$) {
  this.run({measure:$measurer$jscomp$7$$, mutate:void 0});
};
$JSCompiler_prototypeAlias$$.measurePromise = function($measurer$jscomp$8$$) {
  var $$jscomp$this$jscomp$158$$ = this;
  return new Promise(function($resolve$jscomp$38$$) {
    $$jscomp$this$jscomp$158$$.measure(function() {
      $resolve$jscomp$38$$($measurer$jscomp$8$$());
    });
  });
};
$JSCompiler_prototypeAlias$$.canAnimate = function($contextNode$jscomp$5$$) {
  return $JSCompiler_StaticMethods_canAnimate_$$(this, $devAssert$$module$src$log$$($contextNode$jscomp$5$$));
};
function $JSCompiler_StaticMethods_canAnimate_$$($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$, $opt_contextNode$$) {
  return "visible" != $getDocumentVisibilityState$$module$src$utils$document_visibility$$($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$.win.document) ? !1 : $JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$.$ampdocService_$.isSingleDoc() ? $JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$.$ampdocService_$.getSingleDoc().isVisible() : $opt_contextNode$$ ? ($JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$ = $JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$.$ampdocService_$.getAmpDocIfAvailable($opt_contextNode$$), 
  !$JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$ || $JSCompiler_StaticMethods_canAnimate_$self_ampdoc$jscomp$88$$.isVisible()) : !0;
}
$JSCompiler_prototypeAlias$$.runAnim = function($contextNode$jscomp$6$$, $task$jscomp$18$$, $opt_state$jscomp$3$$) {
  if (!$JSCompiler_StaticMethods_canAnimate_$$(this, $contextNode$jscomp$6$$)) {
    return $dev$$module$src$log$$().warn("VSYNC", "Did not schedule a vsync request, because document was invisible"), !1;
  }
  this.run($task$jscomp$18$$, $opt_state$jscomp$3$$);
  return !0;
};
$JSCompiler_prototypeAlias$$.createAnimTask = function($contextNode$jscomp$7$$, $task$jscomp$19$$) {
  var $$jscomp$this$jscomp$159$$ = this;
  return function($opt_state$jscomp$4$$) {
    return $$jscomp$this$jscomp$159$$.runAnim($contextNode$jscomp$7$$, $task$jscomp$19$$, $opt_state$jscomp$4$$);
  };
};
$JSCompiler_prototypeAlias$$.runAnimMutateSeries = function($contextNode$jscomp$8$$, $mutator$jscomp$14$$, $opt_timeout$$) {
  var $$jscomp$this$jscomp$160$$ = this;
  return $JSCompiler_StaticMethods_canAnimate_$$(this, $contextNode$jscomp$8$$) ? new Promise(function($resolve$jscomp$39$$, $reject$jscomp$20$$) {
    var $startTime$jscomp$12$$ = Date.now(), $prevTime$$ = 0, $task$jscomp$20$$ = $$jscomp$this$jscomp$160$$.createAnimTask($contextNode$jscomp$8$$, {mutate:function($contextNode$jscomp$8$$) {
      var $$jscomp$this$jscomp$160$$ = Date.now() - $startTime$jscomp$12$$;
      $mutator$jscomp$14$$($$jscomp$this$jscomp$160$$, $$jscomp$this$jscomp$160$$ - $prevTime$$, $contextNode$jscomp$8$$) ? $opt_timeout$$ && $$jscomp$this$jscomp$160$$ > $opt_timeout$$ ? $reject$jscomp$20$$(Error("timeout")) : ($prevTime$$ = $$jscomp$this$jscomp$160$$, $task$jscomp$20$$($contextNode$jscomp$8$$)) : $resolve$jscomp$39$$();
    }});
    $task$jscomp$20$$({});
  }) : Promise.reject(Error("CANCELLED"));
};
$JSCompiler_prototypeAlias$$.$schedule_$ = function() {
  this.$scheduled_$ || (this.$scheduled_$ = !0, this.$jankMeter_$.onScheduled(), $JSCompiler_StaticMethods_forceSchedule_$$(this));
};
function $JSCompiler_StaticMethods_forceSchedule_$$($JSCompiler_StaticMethods_forceSchedule_$self$$) {
  $JSCompiler_StaticMethods_canAnimate_$$($JSCompiler_StaticMethods_forceSchedule_$self$$) ? ($JSCompiler_StaticMethods_forceSchedule_$self$$.$raf_$($JSCompiler_StaticMethods_forceSchedule_$self$$.$boundRunScheduledTasks_$), $JSCompiler_StaticMethods_forceSchedule_$self$$.$backupPass_$.schedule()) : $JSCompiler_StaticMethods_forceSchedule_$self$$.$invisiblePass_$.schedule();
}
$JSCompiler_prototypeAlias$$.$runScheduledTasks_$ = function() {
  this.$backupPass_$.cancel();
  this.$scheduled_$ = !1;
  this.$jankMeter_$.onRun();
  var $tasks$$ = this.$tasks_$, $states$$ = this.$states_$, $resolver$jscomp$3$$ = this.$nextFrameResolver_$;
  this.$nextFramePromise_$ = this.$nextFrameResolver_$ = null;
  this.$tasks_$ = this.$nextTasks_$;
  this.$states_$ = this.$nextStates_$;
  for (var $i$75_i$jscomp$107$$ = 0; $i$75_i$jscomp$107$$ < $tasks$$.length; $i$75_i$jscomp$107$$++) {
    $tasks$$[$i$75_i$jscomp$107$$].measure && !$callTask_$$module$src$service$vsync_impl$$($tasks$$[$i$75_i$jscomp$107$$].measure, $states$$[$i$75_i$jscomp$107$$]) && ($tasks$$[$i$75_i$jscomp$107$$].mutate = void 0);
  }
  for ($i$75_i$jscomp$107$$ = 0; $i$75_i$jscomp$107$$ < $tasks$$.length; $i$75_i$jscomp$107$$++) {
    $tasks$$[$i$75_i$jscomp$107$$].mutate && $callTask_$$module$src$service$vsync_impl$$($tasks$$[$i$75_i$jscomp$107$$].mutate, $states$$[$i$75_i$jscomp$107$$]);
  }
  this.$nextTasks_$ = $tasks$$;
  this.$nextStates_$ = $states$$;
  this.$nextTasks_$.length = 0;
  this.$nextStates_$.length = 0;
  $resolver$jscomp$3$$ && $resolver$jscomp$3$$();
};
function $JSCompiler_StaticMethods_getRaf_$$($JSCompiler_StaticMethods_getRaf_$self$$) {
  var $raf$$ = $JSCompiler_StaticMethods_getRaf_$self$$.win.requestAnimationFrame || $JSCompiler_StaticMethods_getRaf_$self$$.win.webkitRequestAnimationFrame;
  if ($raf$$) {
    return $raf$$.bind($JSCompiler_StaticMethods_getRaf_$self$$.win);
  }
  var $lastTime$$ = 0;
  return function($raf$$) {
    var $fn$jscomp$16$$ = Date.now(), $timeToCall$$ = Math.max(0, 16 - ($fn$jscomp$16$$ - $lastTime$$));
    $lastTime$$ = $fn$jscomp$16$$ + $timeToCall$$;
    $JSCompiler_StaticMethods_getRaf_$self$$.win.setTimeout($raf$$, $timeToCall$$);
  };
}
function $callTask_$$module$src$service$vsync_impl$$($callback$jscomp$95$$, $state$jscomp$36$$) {
  $devAssert$$module$src$log$$($callback$jscomp$95$$);
  try {
    void 0 !== $callback$jscomp$95$$($state$jscomp$36$$) && $dev$$module$src$log$$().error("VSYNC", "callback returned a value but vsync cannot propogate it: %s", $callback$jscomp$95$$.toString());
  } catch ($e$jscomp$92$$) {
    return $rethrowAsync$$module$src$log$$($e$jscomp$92$$), !1;
  }
  return !0;
}
;function $installRuntimeServices$$module$src$service$core_services$$($global$jscomp$1$$) {
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "crypto", $Crypto$$module$src$service$crypto_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "batched-xhr", $BatchedXhr$$module$src$service$batched_xhr_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "platform", $Platform$$module$src$service$platform_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "templates", $Templates$$module$src$service$template_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "timer", $Timer$$module$src$service$timer_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "timer", $Timer$$module$src$service$timer_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "vsync", $Vsync$$module$src$service$vsync_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "xhr", $Xhr$$module$src$service$xhr_impl$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "input", $Input$$module$src$input$$);
  $registerServiceBuilder$$module$src$service$$($global$jscomp$1$$, "preconnect", $PreconnectService$$module$src$preconnect$$);
}
function $installAmpdocServices$$module$src$service$core_services$$($ampdoc$jscomp$89$$) {
  var $isEmbedded$jscomp$1$$ = !!$ampdoc$jscomp$89$$.getParent();
  $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "url", $Url$$module$src$service$url_impl$$, !0);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "documentInfo") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "documentInfo", $DocInfo$$module$src$service$document_info_impl$$);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "cid") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "cid", $Cid$$module$src$service$cid_impl$$);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "viewer") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "viewer", $ViewerImpl$$module$src$service$viewer_impl$$, !0);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "viewport") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "viewport", $createViewport$$module$src$service$viewport$viewport_impl$$, !0);
  $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "hidden-observer", $HiddenObserver$$module$src$service$hidden_observer_impl$$);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "history") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "history", $createHistory$$module$src$service$history_impl$$);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "resources") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "resources", $ResourcesImpl$$module$src$service$resources_impl$$);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "owners") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "owners", $OwnersImpl$$module$src$service$owners_impl$$);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "mutator") : $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "mutator", $MutatorImpl$$module$src$service$mutator_impl$$);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "url-replace") : $installUrlReplacementsServiceForDoc$$module$src$service$url_replacements_impl$$($ampdoc$jscomp$89$$);
  $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "action", $ActionService$$module$src$service$action_impl$$, !0);
  $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "standard-actions", $StandardActions$$module$src$service$standard_actions_impl$$, !0);
  $isEmbedded$jscomp$1$$ ? $adoptServiceForEmbedDoc$$module$src$service$$($ampdoc$jscomp$89$$, "storage") : $installStorageServiceForDoc$$module$src$service$storage_impl$$($ampdoc$jscomp$89$$);
  $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$89$$, "navigation", $Navigation$$module$src$service$navigation$$, !0);
  $installGlobalSubmitListenerForDoc$$module$src$document_submit$$($ampdoc$jscomp$89$$);
}
;function $parseExtensionUrl$$module$src$service$extension_location$$($scriptUrl$$) {
  var $matches$jscomp$9$$ = $scriptUrl$$.match(/^(.*)\/(.*)-([0-9.]+|latest)(\.max)?\.(?:js|mjs)$/i);
  return {extensionId:$matches$jscomp$9$$ ? $matches$jscomp$9$$[2] : void 0, extensionVersion:$matches$jscomp$9$$ ? $matches$jscomp$9$$[3] : void 0};
}
;var $LEGACY_ELEMENTS$$module$src$service$extensions_impl$$ = ["amp-ad", "amp-embed", "amp-video"], $CUSTOM_TEMPLATES$$module$src$service$extensions_impl$$ = ["amp-mustache"];
function $Extensions$$module$src$service$extensions_impl$$($win$jscomp$214$$) {
  this.win = $win$jscomp$214$$;
  this.$ampdocService_$ = $Services$$module$src$services$ampdocServiceFor$$($win$jscomp$214$$);
  this.$extensions_$ = {};
  this.$currentExtensionId_$ = null;
}
$JSCompiler_prototypeAlias$$ = $Extensions$$module$src$service$extensions_impl$$.prototype;
$JSCompiler_prototypeAlias$$.registerExtension = function($extensionId$jscomp$6$$, $factory$$, $arg$jscomp$11$$) {
  var $holder$jscomp$14$$ = $JSCompiler_StaticMethods_getExtensionHolder_$$(this, $extensionId$jscomp$6$$, !0);
  try {
    this.$currentExtensionId_$ = $extensionId$jscomp$6$$;
    $factory$$($arg$jscomp$11$$, $arg$jscomp$11$$._);
    if (($getMode$$module$src$mode$$(this.win).localDev || $getMode$$module$src$mode$$(this.win).test) && Object.freeze) {
      var $m$jscomp$2$$ = $holder$jscomp$14$$.extension;
      $m$jscomp$2$$.elements = Object.freeze($m$jscomp$2$$.elements);
      $holder$jscomp$14$$.extension = Object.freeze($m$jscomp$2$$);
    }
    $holder$jscomp$14$$.loaded = !0;
    $holder$jscomp$14$$.resolve && $holder$jscomp$14$$.resolve($holder$jscomp$14$$.extension);
  } catch ($e$jscomp$93$$) {
    throw $holder$jscomp$14$$.error = $e$jscomp$93$$, $holder$jscomp$14$$.reject && $holder$jscomp$14$$.reject($e$jscomp$93$$), $e$jscomp$93$$;
  } finally {
    this.$currentExtensionId_$ = null;
  }
};
$JSCompiler_prototypeAlias$$.waitForExtension = function($win$jscomp$215$$, $extensionId$jscomp$7$$, $opt_timeout$jscomp$1$$) {
  return $Services$$module$src$services$timerFor$$($win$jscomp$215$$).timeoutPromise($opt_timeout$jscomp$1$$ || 16000, $JSCompiler_StaticMethods_waitFor_$$($JSCompiler_StaticMethods_getExtensionHolder_$$(this, $extensionId$jscomp$7$$, !1)), "Render timeout waiting for extension " + $extensionId$jscomp$7$$ + " to be load.");
};
$JSCompiler_prototypeAlias$$.preloadExtension = function($JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$, $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$) {
  "amp-embed" == $JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$ && ($JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$ = "amp-ad");
  var $holder$jscomp$15$$ = $JSCompiler_StaticMethods_getExtensionHolder_$$(this, $JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$, !1);
  if ($holder$jscomp$15$$.loaded || $holder$jscomp$15$$.error) {
    var $JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ = !1;
  } else {
    void 0 === $holder$jscomp$15$$.scriptPresent && ($JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ = $JSCompiler_StaticMethods_getExtensionScript_$$(this, $JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$), $holder$jscomp$15$$.scriptPresent = !!$JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$), 
    $JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ = !$holder$jscomp$15$$.scriptPresent;
  }
  if ($JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$) {
    $JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ = $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$;
    $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$ = this.win.document.createElement("script");
    $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$.async = !0;
    $startsWith$$module$src$string$$($JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$, "_") ? $JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ = "" : $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$.setAttribute(0 <= $CUSTOM_TEMPLATES$$module$src$service$extensions_impl$$.indexOf($JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$) ? 
    "custom-template" : "custom-element", $JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$);
    $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$.setAttribute("data-script", $JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$);
    $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$.setAttribute("i-amphtml-inserted", "");
    var $JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$ = this.win.document.head.querySelector("script[nonce]");
    $JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$ && $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$.setAttribute("nonce", $JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$.getAttribute("nonce"));
    $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$.setAttribute("crossorigin", "anonymous");
    $JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$ = this.win.location;
    $getMode$$module$src$mode$$(this.win).test && this.win.testLocation && ($JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$ = this.win.testLocation);
    var $JSCompiler_base$jscomp$inline_987_JSCompiler_inline_result$jscomp$1010_JSCompiler_location$jscomp$inline_983$$ = $JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$, $JSCompiler_opt_isLocalDev$jscomp$inline_985_JSCompiler_prefix$jscomp$inline_1013_JSCompiler_rtv$jscomp$inline_988$$ = $getMode$$module$src$mode$$(this.win).localDev;
    $JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$ = $getMode$$module$src$mode$$().esm ? ".mjs" : ".js";
    $JSCompiler_opt_isLocalDev$jscomp$inline_985_JSCompiler_prefix$jscomp$inline_1013_JSCompiler_rtv$jscomp$inline_988$$ ? ($JSCompiler_opt_isLocalDev$jscomp$inline_985_JSCompiler_prefix$jscomp$inline_1013_JSCompiler_rtv$jscomp$inline_988$$ = $JSCompiler_base$jscomp$inline_987_JSCompiler_inline_result$jscomp$1010_JSCompiler_location$jscomp$inline_983$$.protocol + "//" + $JSCompiler_base$jscomp$inline_987_JSCompiler_inline_result$jscomp$1010_JSCompiler_location$jscomp$inline_983$$.host, "about:" == 
    $JSCompiler_base$jscomp$inline_987_JSCompiler_inline_result$jscomp$1010_JSCompiler_location$jscomp$inline_983$$.protocol && ($JSCompiler_opt_isLocalDev$jscomp$inline_985_JSCompiler_prefix$jscomp$inline_1013_JSCompiler_rtv$jscomp$inline_988$$ = ""), $JSCompiler_base$jscomp$inline_987_JSCompiler_inline_result$jscomp$1010_JSCompiler_location$jscomp$inline_983$$ = $JSCompiler_opt_isLocalDev$jscomp$inline_985_JSCompiler_prefix$jscomp$inline_1013_JSCompiler_rtv$jscomp$inline_988$$ + "/dist") : $JSCompiler_base$jscomp$inline_987_JSCompiler_inline_result$jscomp$1010_JSCompiler_location$jscomp$inline_983$$ = 
    $urls$$module$src$config$$.cdn;
    $JSCompiler_opt_isLocalDev$jscomp$inline_985_JSCompiler_prefix$jscomp$inline_1013_JSCompiler_rtv$jscomp$inline_988$$ = $getMode$$module$src$mode$$().rtvVersion;
    null == $JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ && ($JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ = "0.1");
    $JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$.src = $JSCompiler_base$jscomp$inline_987_JSCompiler_inline_result$jscomp$1010_JSCompiler_location$jscomp$inline_983$$ + "/rtv/" + $JSCompiler_opt_isLocalDev$jscomp$inline_985_JSCompiler_prefix$jscomp$inline_1013_JSCompiler_rtv$jscomp$inline_988$$ + "/v0/" + $JSCompiler_extensionId$jscomp$inline_788_extensionId$jscomp$8$$ + ($JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ ? 
    "-" + $JSCompiler_inline_result$jscomp$860_JSCompiler_opt_extensionVersion$jscomp$inline_978_JSCompiler_opt_extensionVersion$jscomp$inline_984_JSCompiler_scriptInHead$jscomp$inline_974$$ : "") + $JSCompiler_currentScript$jscomp$inline_980_JSCompiler_fileExtension$jscomp$inline_986_JSCompiler_loc$jscomp$inline_981$$;
    this.win.document.head.appendChild($JSCompiler_scriptElement$jscomp$inline_979_opt_extensionVersion$jscomp$1$$);
    $holder$jscomp$15$$.scriptPresent = !0;
  }
  return $JSCompiler_StaticMethods_waitFor_$$($holder$jscomp$15$$);
};
$JSCompiler_prototypeAlias$$.installExtensionForDoc = function($ampdoc$jscomp$90$$, $extensionId$jscomp$9$$, $opt_extensionVersion$jscomp$2$$) {
  var $$jscomp$this$jscomp$162$$ = this, $rootNode$jscomp$3$$ = $ampdoc$jscomp$90$$.getRootNode(), $extLoaders$$ = $rootNode$jscomp$3$$.__AMP_EXT_LDR;
  $extLoaders$$ || ($extLoaders$$ = $rootNode$jscomp$3$$.__AMP_EXT_LDR = $map$$module$src$utils$object$$());
  if ($extLoaders$$[$extensionId$jscomp$9$$]) {
    return $extLoaders$$[$extensionId$jscomp$9$$];
  }
  $stubElementIfNotKnown$$module$src$service$custom_element_registry$$($ampdoc$jscomp$90$$.win, $extensionId$jscomp$9$$);
  return $extLoaders$$[$extensionId$jscomp$9$$] = this.preloadExtension($extensionId$jscomp$9$$, $opt_extensionVersion$jscomp$2$$).then(function() {
    return $$jscomp$this$jscomp$162$$.installExtensionInDoc($ampdoc$jscomp$90$$, $extensionId$jscomp$9$$);
  });
};
$JSCompiler_prototypeAlias$$.reloadExtension = function($extensionId$jscomp$10$$) {
  var $el$jscomp$27$$ = $JSCompiler_StaticMethods_getExtensionScript_$$(this, $extensionId$jscomp$10$$, !1);
  $devAssert$$module$src$log$$($el$jscomp$27$$);
  var $holder$jscomp$16$$ = this.$extensions_$[$extensionId$jscomp$10$$];
  $holder$jscomp$16$$ && ($devAssert$$module$src$log$$(!$holder$jscomp$16$$.loaded && !$holder$jscomp$16$$.error), $holder$jscomp$16$$.scriptPresent = !1);
  $el$jscomp$27$$.setAttribute("i-amphtml-loaded-new-version", $extensionId$jscomp$10$$);
  var $urlParts$$ = $parseExtensionUrl$$module$src$service$extension_location$$($el$jscomp$27$$.src);
  return this.preloadExtension($extensionId$jscomp$10$$, $urlParts$$.extensionVersion);
};
function $JSCompiler_StaticMethods_getExtensionScript_$$($JSCompiler_StaticMethods_getExtensionScript_$self_matches$jscomp$10$$, $extensionId$jscomp$11$$, $includeInserted$$) {
  $includeInserted$$ = void 0 === $includeInserted$$ ? !0 : $includeInserted$$;
  $JSCompiler_StaticMethods_getExtensionScript_$self_matches$jscomp$10$$ = $JSCompiler_StaticMethods_getExtensionScript_$self_matches$jscomp$10$$.win.document.head.querySelectorAll('script[src*="/' + $extensionId$jscomp$11$$ + '-"]:not([i-amphtml-loaded-new-version])' + ($includeInserted$$ ? "" : ":not([i-amphtml-inserted])"));
  for (var $i$jscomp$108$$ = 0; $i$jscomp$108$$ < $JSCompiler_StaticMethods_getExtensionScript_$self_matches$jscomp$10$$.length; $i$jscomp$108$$++) {
    var $match$jscomp$9$$ = $JSCompiler_StaticMethods_getExtensionScript_$self_matches$jscomp$10$$[$i$jscomp$108$$];
    if ($parseExtensionUrl$$module$src$service$extension_location$$($match$jscomp$9$$.src).extensionId === $extensionId$jscomp$11$$) {
      return $match$jscomp$9$$;
    }
  }
  return null;
}
$JSCompiler_prototypeAlias$$.loadElementClass = function($elementName$jscomp$5$$) {
  return this.preloadExtension($elementName$jscomp$5$$).then(function($extension$jscomp$8$$) {
    return $devAssert$$module$src$log$$($extension$jscomp$8$$.elements[$elementName$jscomp$5$$]).implementationClass;
  });
};
$JSCompiler_prototypeAlias$$.addElement = function($name$jscomp$141$$, $implementationClass$jscomp$1$$, $css$jscomp$4$$) {
  $JSCompiler_StaticMethods_getCurrentExtensionHolder_$$(this, $name$jscomp$141$$).extension.elements[$name$jscomp$141$$] = {implementationClass:$implementationClass$jscomp$1$$, css:$css$jscomp$4$$};
  this.addDocFactory(function($ampdoc$jscomp$91$$) {
    $JSCompiler_StaticMethods_installElement_$$($ampdoc$jscomp$91$$, $name$jscomp$141$$, $implementationClass$jscomp$1$$, $css$jscomp$4$$);
  });
};
function $JSCompiler_StaticMethods_installElement_$$($ampdoc$jscomp$92$$, $name$jscomp$142$$, $implementationClass$jscomp$2$$, $css$jscomp$5$$) {
  $css$jscomp$5$$ ? $installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$92$$, $css$jscomp$5$$, function() {
    $JSCompiler_StaticMethods_registerElementInWindow_$$($ampdoc$jscomp$92$$.win, $name$jscomp$142$$, $implementationClass$jscomp$2$$);
  }, !1, $name$jscomp$142$$) : $JSCompiler_StaticMethods_registerElementInWindow_$$($ampdoc$jscomp$92$$.win, $name$jscomp$142$$, $implementationClass$jscomp$2$$);
}
function $JSCompiler_StaticMethods_registerElementInWindow_$$($win$jscomp$216$$, $name$jscomp$143$$, $implementationClass$jscomp$3$$) {
  var $JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$ = $getExtendedElements$$module$src$service$custom_element_registry$$($win$jscomp$216$$);
  if (!$JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$[$name$jscomp$143$$]) {
    $registerElement$$module$src$service$custom_element_registry$$($win$jscomp$216$$, $name$jscomp$143$$, $implementationClass$jscomp$3$$);
  } else {
    if ($JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$[$name$jscomp$143$$] != $implementationClass$jscomp$3$$) {
      for ($userAssert$$module$src$log$$($JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$[$name$jscomp$143$$] == $ElementStub$$module$src$element_stub$$, "%s is already registered. The script tag for %s is likely included twice in the page.", $name$jscomp$143$$, $name$jscomp$143$$), $JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$[$name$jscomp$143$$] = $implementationClass$jscomp$3$$, $JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$ = 
      0; $JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$ < $stubbedElements$$module$src$element_stub$$.length; $JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$++) {
        var $JSCompiler_element$jscomp$inline_798$$ = $stubbedElements$$module$src$element_stub$$[$JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$].element;
        $JSCompiler_element$jscomp$inline_798$$.tagName.toLowerCase() == $name$jscomp$143$$ && $JSCompiler_element$jscomp$inline_798$$.ownerDocument.defaultView == $win$jscomp$216$$ && ($tryUpgradeElement_$$module$src$service$custom_element_registry$$($JSCompiler_element$jscomp$inline_798$$, $implementationClass$jscomp$3$$), $stubbedElements$$module$src$element_stub$$.splice($JSCompiler_i$jscomp$inline_797_JSCompiler_knownElements$jscomp$inline_796$$--, 1));
      }
    }
  }
  $registerServiceBuilder$$module$src$service$$($win$jscomp$216$$, $name$jscomp$143$$, $emptyService$$module$src$service$extensions_impl$$);
}
$JSCompiler_prototypeAlias$$.addService = function($name$jscomp$144$$, $implementationClass$jscomp$4$$) {
  $JSCompiler_StaticMethods_getCurrentExtensionHolder_$$(this).extension.services.push({serviceName:$name$jscomp$144$$, serviceClass:$implementationClass$jscomp$4$$});
  this.addDocFactory(function($ampdoc$jscomp$93$$) {
    $registerServiceBuilderForDoc$$module$src$service$$($ampdoc$jscomp$93$$, $name$jscomp$144$$, $implementationClass$jscomp$4$$, !0);
  });
};
$JSCompiler_prototypeAlias$$.addDocFactory = function($factory$jscomp$1$$, $opt_forName$$) {
  var $holder$jscomp$19$$ = $JSCompiler_StaticMethods_getCurrentExtensionHolder_$$(this, $opt_forName$$);
  $holder$jscomp$19$$.docFactories.push($factory$jscomp$1$$);
  if (this.$currentExtensionId_$ && this.$ampdocService_$.isSingleDoc()) {
    var $ampdoc$jscomp$94$$ = this.$ampdocService_$.getAmpDoc(this.win.document);
    ($ampdoc$jscomp$94$$.declaresExtension(this.$currentExtensionId_$) || $holder$jscomp$19$$.auto) && $factory$jscomp$1$$($ampdoc$jscomp$94$$);
  }
};
$JSCompiler_prototypeAlias$$.installExtensionsInDoc = function($ampdoc$jscomp$95$$, $extensionIds$jscomp$3$$) {
  var $$jscomp$this$jscomp$165$$ = this, $promises$jscomp$5$$ = [];
  $extensionIds$jscomp$3$$.forEach(function($extensionIds$jscomp$3$$) {
    $promises$jscomp$5$$.push($$jscomp$this$jscomp$165$$.installExtensionInDoc($ampdoc$jscomp$95$$, $extensionIds$jscomp$3$$));
  });
  return Promise.all($promises$jscomp$5$$);
};
$JSCompiler_prototypeAlias$$.installExtensionInDoc = function($ampdoc$jscomp$96$$, $extensionId$jscomp$14$$) {
  var $holder$jscomp$20$$ = $JSCompiler_StaticMethods_getExtensionHolder_$$(this, $extensionId$jscomp$14$$, !1);
  return $JSCompiler_StaticMethods_waitFor_$$($holder$jscomp$20$$).then(function() {
    $ampdoc$jscomp$96$$.declareExtension($extensionId$jscomp$14$$);
    $holder$jscomp$20$$.docFactories.forEach(function($holder$jscomp$20$$) {
      try {
        $holder$jscomp$20$$($ampdoc$jscomp$96$$);
      } catch ($e$jscomp$94$$) {
        $rethrowAsync$$module$src$log$$("Doc factory failed: ", $e$jscomp$94$$, $extensionId$jscomp$14$$);
      }
    });
  });
};
function $JSCompiler_StaticMethods_getExtensionHolder_$$($JSCompiler_StaticMethods_getExtensionHolder_$self$$, $extensionId$jscomp$15$$, $auto$$) {
  var $holder$jscomp$21$$ = $JSCompiler_StaticMethods_getExtensionHolder_$self$$.$extensions_$[$extensionId$jscomp$15$$];
  $holder$jscomp$21$$ || ($holder$jscomp$21$$ = {extension:{elements:{}, services:[]}, auto:$auto$$, docFactories:[], promise:void 0, resolve:void 0, reject:void 0, loaded:void 0, error:void 0, scriptPresent:void 0}, $JSCompiler_StaticMethods_getExtensionHolder_$self$$.$extensions_$[$extensionId$jscomp$15$$] = $holder$jscomp$21$$);
  return $holder$jscomp$21$$;
}
function $JSCompiler_StaticMethods_getCurrentExtensionHolder_$$($JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$, $opt_forName$jscomp$1$$) {
  $JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$.$currentExtensionId_$ || $getMode$$module$src$mode$$($JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$.win).test || $dev$$module$src$log$$().error("extensions", "unknown extension for ", $opt_forName$jscomp$1$$);
  return $JSCompiler_StaticMethods_getExtensionHolder_$$($JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$, $JSCompiler_StaticMethods_getCurrentExtensionHolder_$self$$.$currentExtensionId_$ || "_UNKNOWN_", !0);
}
function $JSCompiler_StaticMethods_waitFor_$$($holder$jscomp$22$$) {
  if (!$holder$jscomp$22$$.promise) {
    if ($holder$jscomp$22$$.loaded) {
      $holder$jscomp$22$$.promise = Promise.resolve($holder$jscomp$22$$.extension);
    } else {
      if ($holder$jscomp$22$$.error) {
        $holder$jscomp$22$$.promise = Promise.reject($holder$jscomp$22$$.error);
      } else {
        var $deferred$jscomp$20$$ = new $Deferred$$module$src$utils$promise$$;
        $holder$jscomp$22$$.promise = $deferred$jscomp$20$$.promise;
        $holder$jscomp$22$$.resolve = $deferred$jscomp$20$$.resolve;
        $holder$jscomp$22$$.reject = $deferred$jscomp$20$$.reject;
      }
    }
  }
  return $holder$jscomp$22$$.promise;
}
function $stubLegacyElements$$module$src$service$extensions_impl$$($win$jscomp$217$$) {
  $LEGACY_ELEMENTS$$module$src$service$extensions_impl$$.forEach(function($name$jscomp$145$$) {
    $stubElementIfNotKnown$$module$src$service$custom_element_registry$$($win$jscomp$217$$, $name$jscomp$145$$);
  });
}
function $emptyService$$module$src$service$extensions_impl$$() {
  return {};
}
;(function() {
  $logConstructor$$module$src$log$$ = $Log$$module$src$log$$;
  $dev$$module$src$log$$();
  $user$$module$src$log$$();
})();
(function($fn$jscomp$1$$) {
  self.__AMP_REPORT_ERROR = $fn$jscomp$1$$;
})(function($JSCompiler_root$jscomp$inline_991_win$jscomp$102$$, $JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$, $opt_associatedElement$$) {
  $reportError$$module$src$error$$($JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$, $opt_associatedElement$$);
  $JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$ && $JSCompiler_root$jscomp$inline_991_win$jscomp$102$$ && $isUserErrorMessage$$module$src$log$$($JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$.message) && !(0 <= $JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$.message.indexOf("\u200b\u200b\u200b\u200b")) && $Services$$module$src$services$ampdocServiceFor$$($JSCompiler_root$jscomp$inline_991_win$jscomp$102$$).isSingleDoc() && ($JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$ = $dict$$module$src$utils$object$$({errorName:$JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$.name, 
  errorMessage:$JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$.message}), $JSCompiler_root$jscomp$inline_991_win$jscomp$102$$ = $Services$$module$src$services$ampdocServiceFor$$($JSCompiler_root$jscomp$inline_991_win$jscomp$102$$).getSingleDoc().getRootNode(), $triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_root$jscomp$inline_991_win$jscomp$102$$.documentElement || $JSCompiler_root$jscomp$inline_991_win$jscomp$102$$.body || $JSCompiler_root$jscomp$inline_991_win$jscomp$102$$, $JSCompiler_vars$jscomp$inline_810_error$jscomp$16$$));
}.bind(null, self));
function $adoptShared$$module$src$runtime$$($callback$jscomp$96_i$jscomp$109$$) {
  function $installExtension$$($callback$jscomp$96_i$jscomp$109$$) {
    function $installExtension$$() {
      $iniPromise$$.then(function() {
        "function" == typeof $callback$jscomp$96_i$jscomp$109$$ ? $callback$jscomp$96_i$jscomp$109$$($global$jscomp$2$$.AMP, $global$jscomp$2$$.AMP._) : $extensions$jscomp$3$$.registerExtension($callback$jscomp$96_i$jscomp$109$$.n, $callback$jscomp$96_i$jscomp$109$$.f, $global$jscomp$2$$.AMP);
      });
    }
    "function" != typeof $callback$jscomp$96_i$jscomp$109$$ && $callback$jscomp$96_i$jscomp$109$$.i ? $preloadDeps$$module$src$runtime$$($extensions$jscomp$3$$, $callback$jscomp$96_i$jscomp$109$$).then(function() {
      return $startRegisterOrChunk$$module$src$runtime$$($global$jscomp$2$$, $callback$jscomp$96_i$jscomp$109$$, $installExtension$$);
    }) : $startRegisterOrChunk$$module$src$runtime$$($global$jscomp$2$$, $callback$jscomp$96_i$jscomp$109$$, $installExtension$$);
  }
  var $global$jscomp$2$$ = self;
  if ($global$jscomp$2$$.__AMP_TAG) {
    $resolvedPromise$$module$src$resolved_promise$$();
  } else {
    $global$jscomp$2$$.__AMP_TAG = !0;
    var $preregisteredExtensions$$ = $global$jscomp$2$$.AMP || [];
    $registerServiceBuilder$$module$src$service$$($global$jscomp$2$$, "extensions", $Extensions$$module$src$service$extensions_impl$$);
    var $extensions$jscomp$3$$ = $Services$$module$src$services$extensionsFor$$($global$jscomp$2$$);
    $installRuntimeServices$$module$src$service$core_services$$($global$jscomp$2$$);
    $stubLegacyElements$$module$src$service$extensions_impl$$($global$jscomp$2$$);
    $global$jscomp$2$$.AMP = {win:$global$jscomp$2$$, _:$global$jscomp$2$$.AMP ? $global$jscomp$2$$.AMP._ : void 0};
    $getMode$$module$src$mode$$().minified || ($global$jscomp$2$$.AMP.extension = function($callback$jscomp$96_i$jscomp$109$$, $installExtension$$, $preregisteredExtensions$$) {
      $preregisteredExtensions$$($global$jscomp$2$$.AMP);
    });
    $global$jscomp$2$$.AMP.config = $config$$module$src$config$$;
    $global$jscomp$2$$.AMP.BaseElement = $BaseElement$$module$src$base_element$$;
    $global$jscomp$2$$.AMP.BaseTemplate = $BaseTemplate$$module$src$service$template_impl$$;
    $global$jscomp$2$$.AMP.registerElement = $extensions$jscomp$3$$.addElement.bind($extensions$jscomp$3$$);
    $global$jscomp$2$$.AMP.registerTemplate = function($callback$jscomp$96_i$jscomp$109$$, $installExtension$$) {
      var $preregisteredExtensions$$ = $getService$$module$src$service$$($global$jscomp$2$$, "templates");
      if ($preregisteredExtensions$$.$templateClassMap_$[$callback$jscomp$96_i$jscomp$109$$]) {
        var $extensions$jscomp$3$$ = $preregisteredExtensions$$.$templateClassResolvers_$[$callback$jscomp$96_i$jscomp$109$$];
        $userAssert$$module$src$log$$($extensions$jscomp$3$$, "Duplicate template type: %s", $callback$jscomp$96_i$jscomp$109$$);
        delete $preregisteredExtensions$$.$templateClassResolvers_$[$callback$jscomp$96_i$jscomp$109$$];
        $extensions$jscomp$3$$($installExtension$$);
      } else {
        $preregisteredExtensions$$.$templateClassMap_$[$callback$jscomp$96_i$jscomp$109$$] = Promise.resolve($installExtension$$);
      }
    };
    $global$jscomp$2$$.AMP.registerServiceForDoc = $extensions$jscomp$3$$.addService.bind($extensions$jscomp$3$$);
    $global$jscomp$2$$.AMP.isExperimentOn = $isExperimentOn$$module$src$experiments$$.bind(null, $global$jscomp$2$$);
    $global$jscomp$2$$.AMP.toggleExperiment = $toggleExperiment$$module$src$experiments$$.bind(null, $global$jscomp$2$$);
    $global$jscomp$2$$.AMP.setLogLevel = $overrideLogLevel$$module$src$log$$.bind(null);
    $global$jscomp$2$$.AMP.setTickFunction = function() {
    };
    var $iniPromise$$ = $callback$jscomp$96_i$jscomp$109$$($global$jscomp$2$$, $extensions$jscomp$3$$);
    for ($callback$jscomp$96_i$jscomp$109$$ = 0; $callback$jscomp$96_i$jscomp$109$$ < $preregisteredExtensions$$.length; $callback$jscomp$96_i$jscomp$109$$++) {
      var $fnOrStruct$$ = $preregisteredExtensions$$[$callback$jscomp$96_i$jscomp$109$$];
      if ($maybeLoadCorrectVersion$$module$src$runtime$$($global$jscomp$2$$, $fnOrStruct$$)) {
        $preregisteredExtensions$$.splice($callback$jscomp$96_i$jscomp$109$$--, 1);
      } else {
        if ("function" == typeof $fnOrStruct$$ || "high" == $fnOrStruct$$.p) {
          try {
            $installExtension$$($fnOrStruct$$);
          } catch ($e$jscomp$95$$) {
            $dev$$module$src$log$$().error("runtime", "Extension failed: ", $e$jscomp$95$$, $fnOrStruct$$.n);
          }
          $preregisteredExtensions$$.splice($callback$jscomp$96_i$jscomp$109$$--, 1);
        }
      }
    }
    $maybePumpEarlyFrame$$module$src$runtime$$($global$jscomp$2$$, function() {
      $global$jscomp$2$$.AMP.push = function($callback$jscomp$96_i$jscomp$109$$) {
        $maybeLoadCorrectVersion$$module$src$runtime$$($global$jscomp$2$$, $callback$jscomp$96_i$jscomp$109$$) || $installExtension$$($callback$jscomp$96_i$jscomp$109$$);
      };
      for (var $callback$jscomp$96_i$jscomp$109$$ = 0; $callback$jscomp$96_i$jscomp$109$$ < $preregisteredExtensions$$.length; $callback$jscomp$96_i$jscomp$109$$++) {
        var $extensions$jscomp$3$$ = $preregisteredExtensions$$[$callback$jscomp$96_i$jscomp$109$$];
        if (!$maybeLoadCorrectVersion$$module$src$runtime$$($global$jscomp$2$$, $extensions$jscomp$3$$)) {
          try {
            $installExtension$$($extensions$jscomp$3$$);
          } catch ($e$78$$) {
            $dev$$module$src$log$$().error("runtime", "Extension failed: ", $e$78$$, $extensions$jscomp$3$$.n);
          }
        }
      }
      $preregisteredExtensions$$.length = 0;
    });
    $global$jscomp$2$$.AMP.push || ($global$jscomp$2$$.AMP.push = $preregisteredExtensions$$.push.bind($preregisteredExtensions$$));
    $Services$$module$src$services$platformFor$$($global$jscomp$2$$).isIos() && $setStyle$$module$src$style$$($global$jscomp$2$$.document.documentElement, "cursor", "pointer");
    if ($getMode$$module$src$mode$$().localDev || $getMode$$module$src$mode$$().test) {
      $global$jscomp$2$$.IntersectionObserver && $global$jscomp$2$$.IntersectionObserver !== $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$ && $global$jscomp$2$$.IntersectionObserverEntry || $Services$$module$src$services$extensionsFor$$($global$jscomp$2$$).preloadExtension("amp-intersection-observer-polyfill");
    }
  }
}
function $preloadDeps$$module$src$runtime$$($extensions$jscomp$4$$, $fnOrStruct$jscomp$3_promises$jscomp$6$$) {
  if (Array.isArray($fnOrStruct$jscomp$3_promises$jscomp$6$$.i)) {
    return $fnOrStruct$jscomp$3_promises$jscomp$6$$ = $fnOrStruct$jscomp$3_promises$jscomp$6$$.i.map(function($fnOrStruct$jscomp$3_promises$jscomp$6$$) {
      return $extensions$jscomp$4$$.preloadExtension($fnOrStruct$jscomp$3_promises$jscomp$6$$);
    }), Promise.all($fnOrStruct$jscomp$3_promises$jscomp$6$$);
  }
  if ("string" == typeof $fnOrStruct$jscomp$3_promises$jscomp$6$$.i) {
    return $extensions$jscomp$4$$.preloadExtension($fnOrStruct$jscomp$3_promises$jscomp$6$$.i);
  }
  $dev$$module$src$log$$().error("RUNTIME", "dependency is neither an array or a string", $fnOrStruct$jscomp$3_promises$jscomp$6$$.i);
  return $resolvedPromise$$module$src$resolved_promise$$();
}
function $startRegisterOrChunk$$module$src$runtime$$($global$jscomp$3$$, $fnOrStruct$jscomp$4$$, $register$jscomp$1$$) {
  "function" == typeof $fnOrStruct$jscomp$4$$ || "high" == $fnOrStruct$jscomp$4$$.p ? $resolvedPromise$$module$src$resolved_promise$$().then($register$jscomp$1$$) : ($register$jscomp$1$$.displayName = $fnOrStruct$jscomp$4$$.n, $startupChunk$$module$src$chunk$$($global$jscomp$3$$.document, $register$jscomp$1$$));
}
function $adoptWithMultidocDeps$$module$src$runtime$$() {
  $adoptShared$$module$src$runtime$$(function($global$jscomp$7$$) {
    $adoptServicesAndResources$$module$src$runtime$$($global$jscomp$7$$);
    $adoptMultiDocDeps$$module$src$runtime$$($global$jscomp$7$$);
    return $waitForBodyOpenPromise$$module$src$dom$$($global$jscomp$7$$.document).then(function() {
      $stubElementsForDoc$$module$src$service$custom_element_registry$$($global$jscomp$7$$.AMP.ampdoc);
    });
  });
}
function $adoptServicesAndResources$$module$src$runtime$$($global$jscomp$8$$) {
  var $documentElement$jscomp$4_viewport$jscomp$9$$ = $global$jscomp$8$$.document.documentElement, $ampdoc$jscomp$97_viewer$jscomp$20$$ = $Services$$module$src$services$ampdocServiceFor$$($global$jscomp$8$$).getSingleDoc();
  $global$jscomp$8$$.AMP.ampdoc = $ampdoc$jscomp$97_viewer$jscomp$20$$;
  $ampdoc$jscomp$97_viewer$jscomp$20$$ = $Services$$module$src$services$viewerForDoc$$($documentElement$jscomp$4_viewport$jscomp$9$$);
  $global$jscomp$8$$.AMP.viewer = $ampdoc$jscomp$97_viewer$jscomp$20$$;
  $getMode$$module$src$mode$$().development && ($global$jscomp$8$$.AMP.toggleRuntime = $ampdoc$jscomp$97_viewer$jscomp$20$$.toggleRuntime.bind($ampdoc$jscomp$97_viewer$jscomp$20$$), $global$jscomp$8$$.AMP.resources = $Services$$module$src$services$resourcesForDoc$$($documentElement$jscomp$4_viewport$jscomp$9$$));
  $documentElement$jscomp$4_viewport$jscomp$9$$ = $Services$$module$src$services$viewportForDoc$$($documentElement$jscomp$4_viewport$jscomp$9$$);
  $global$jscomp$8$$.AMP.viewport = {};
  $global$jscomp$8$$.AMP.viewport.getScrollLeft = $documentElement$jscomp$4_viewport$jscomp$9$$.getScrollLeft.bind($documentElement$jscomp$4_viewport$jscomp$9$$);
  $global$jscomp$8$$.AMP.viewport.getScrollWidth = $documentElement$jscomp$4_viewport$jscomp$9$$.getScrollWidth.bind($documentElement$jscomp$4_viewport$jscomp$9$$);
  $global$jscomp$8$$.AMP.viewport.getWidth = $documentElement$jscomp$4_viewport$jscomp$9$$.getWidth.bind($documentElement$jscomp$4_viewport$jscomp$9$$);
}
function $adoptMultiDocDeps$$module$src$runtime$$($global$jscomp$9$$) {
  $global$jscomp$9$$.AMP.installAmpdocServices = $installAmpdocServices$$module$src$service$core_services$$.bind(null);
  $global$jscomp$9$$.AMP.combinedCss = $cssText$$module$build$ampdoc_css$$ + $cssText$$module$build$ampshared_css$$;
}
function $maybeLoadCorrectVersion$$module$src$runtime$$($win$jscomp$218$$, $fnOrStruct$jscomp$5$$) {
  if (!$isExperimentOn$$module$src$experiments$$($win$jscomp$218$$, "version-locking") || "function" == typeof $fnOrStruct$jscomp$5$$ || "2005062057000" == $fnOrStruct$jscomp$5$$.v) {
    return !1;
  }
  $Services$$module$src$services$extensionsFor$$($win$jscomp$218$$).reloadExtension($fnOrStruct$jscomp$5$$.n);
  return !0;
}
function $maybePumpEarlyFrame$$module$src$runtime$$($win$jscomp$219$$, $cb$jscomp$3$$) {
  $isExperimentOn$$module$src$experiments$$($win$jscomp$219$$, "pump-early-frame") ? $win$jscomp$219$$.document.body ? 0 < $includedServices$$module$src$render_delaying_services$$($win$jscomp$219$$).length ? $cb$jscomp$3$$() : $Services$$module$src$services$timerFor$$($win$jscomp$219$$).delay($cb$jscomp$3$$, 1) : $cb$jscomp$3$$() : $cb$jscomp$3$$();
}
;function $fontStylesheetTimeout$$module$src$font_stylesheet_timeout$$() {
  var $win$jscomp$220$$ = self;
  $onDocumentReady$$module$src$document_ready$$($win$jscomp$220$$.document, function() {
    return $maybeTimeoutFonts$$module$src$font_stylesheet_timeout$$($win$jscomp$220$$);
  });
}
function $maybeTimeoutFonts$$module$src$font_stylesheet_timeout$$($win$jscomp$221$$) {
  var $timeSinceNavigationStart$$ = 1500, $perf$jscomp$2$$ = $win$jscomp$221$$.performance;
  $perf$jscomp$2$$ && $perf$jscomp$2$$.timing && $perf$jscomp$2$$.timing.navigationStart && ($timeSinceNavigationStart$$ = Date.now() - $perf$jscomp$2$$.timing.navigationStart);
  var $timeout$jscomp$7$$ = Math.max(1, 2100 - $timeSinceNavigationStart$$);
  $win$jscomp$221$$.setTimeout(function() {
    $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($win$jscomp$221$$);
    var $timeSinceNavigationStart$$ = $win$jscomp$221$$.document.styleSheets;
    if ($timeSinceNavigationStart$$) {
      for (var $perf$jscomp$2$$ = $win$jscomp$221$$.document.querySelectorAll('link[rel~="stylesheet"]:not([href^="' + String($urls$$module$src$config$$.cdn).replace($regex$$module$third_party$css_escape$css_escape$$, $escaper$$module$third_party$css_escape$css_escape$$) + '"])'), $timedoutStyleSheets$$ = [], $$jscomp$loop$104_i$jscomp$110$$ = 0; $$jscomp$loop$104_i$jscomp$110$$ < $perf$jscomp$2$$.length; $$jscomp$loop$104_i$jscomp$110$$++) {
        for (var $i$79_link$jscomp$1$$ = $perf$jscomp$2$$[$$jscomp$loop$104_i$jscomp$110$$], $found$jscomp$1$$ = !1, $n$jscomp$16$$ = 0; $n$jscomp$16$$ < $timeSinceNavigationStart$$.length; $n$jscomp$16$$++) {
          if ($timeSinceNavigationStart$$[$n$jscomp$16$$].ownerNode == $i$79_link$jscomp$1$$) {
            $found$jscomp$1$$ = !0;
            break;
          }
        }
        $found$jscomp$1$$ || $timedoutStyleSheets$$.push($i$79_link$jscomp$1$$);
      }
      $$jscomp$loop$104_i$jscomp$110$$ = {};
      for ($i$79_link$jscomp$1$$ = 0; $i$79_link$jscomp$1$$ < $timedoutStyleSheets$$.length; $$jscomp$loop$104_i$jscomp$110$$ = {$$jscomp$loop$prop$link$80$105$:$$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$, $$jscomp$loop$prop$media$106$:$$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$media$106$}, $i$79_link$jscomp$1$$++) {
        $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$ = $timedoutStyleSheets$$[$i$79_link$jscomp$1$$], $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$media$106$ = $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$.media || "all", $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$.media = "print", $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$.onload = function($timeSinceNavigationStart$$) {
          return function() {
            $timeSinceNavigationStart$$.$$jscomp$loop$prop$link$80$105$.media = $timeSinceNavigationStart$$.$$jscomp$loop$prop$media$106$;
            $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($win$jscomp$221$$);
          };
        }($$jscomp$loop$104_i$jscomp$110$$), $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$.setAttribute("i-amphtml-timeout", $timeout$jscomp$7$$), $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$.parentNode.insertBefore($$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$, $$jscomp$loop$104_i$jscomp$110$$.$$jscomp$loop$prop$link$80$105$.nextSibling);
      }
    }
  }, $timeout$jscomp$7$$);
}
function $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$) {
  $doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$ = $doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$.document;
  if ($doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$.fonts && $doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$.fonts.values) {
    for (var $it$$ = $doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$.fonts.values(); $doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$ = $it$$.next();) {
      var $fontFace$$ = $doc$jscomp$55_entry$jscomp$5_win$jscomp$222$$.value;
      if (!$fontFace$$) {
        break;
      }
      "loading" == $fontFace$$.status && "display" in $fontFace$$ && "auto" == $fontFace$$.display && ($fontFace$$.display = "swap");
    }
  }
}
;function $isStoryDocument$$module$src$utils$story$$($ampdoc$jscomp$98$$) {
  return $ampdoc$jscomp$98$$.waitForBodyOpen().then(function() {
    var $body$jscomp$10$$ = $ampdoc$jscomp$98$$.getBody(), $childPromise$$ = $waitForChildPromise$$module$src$dom$$($body$jscomp$10$$, function() {
      return !!$body$jscomp$10$$.firstElementChild;
    });
    return $Services$$module$src$services$timerFor$$($ampdoc$jscomp$98$$.win).timeoutPromise(2000, $childPromise$$).then(function() {
      return "AMP-STORY" === $body$jscomp$10$$.firstElementChild.tagName;
    }, function() {
      return !1;
    });
  });
}
;function $installAutoLightboxExtension$$module$src$auto_lightbox$$($ampdoc$jscomp$99$$) {
  var $win$jscomp$223$$ = $ampdoc$jscomp$99$$.win;
  $isAmpFormatType$$module$src$format$$(["\u26a1", "amp"], $win$jscomp$223$$.document) && $ampdoc$jscomp$99$$.isSingleDoc() && $chunk$$module$src$chunk$$($ampdoc$jscomp$99$$, function() {
    $isStoryDocument$$module$src$utils$story$$($ampdoc$jscomp$99$$).then(function($isStory$$) {
      $isStory$$ || $Services$$module$src$services$extensionsFor$$($win$jscomp$223$$).installExtensionForDoc($ampdoc$jscomp$99$$, "amp-auto-lightbox");
    });
  });
}
;function $AmpDocService$$module$src$service$ampdoc_impl$$($win$jscomp$224$$) {
  this.win = $win$jscomp$224$$;
  this.$singleDoc_$ = null;
  var $JSCompiler_params$jscomp$inline_820$$ = $map$$module$src$utils$object$$();
  $win$jscomp$224$$.name && 0 == $win$jscomp$224$$.name.indexOf("__AMP__") && Object.assign($JSCompiler_params$jscomp$inline_820$$, $parseQueryString_$$module$src$url_parse_query_string$$($win$jscomp$224$$.name.substring(7)));
  $win$jscomp$224$$.location && $win$jscomp$224$$.location.hash && Object.assign($JSCompiler_params$jscomp$inline_820$$, $parseQueryString_$$module$src$url_parse_query_string$$($win$jscomp$224$$.location.hash));
  this.$singleDoc_$ = new $AmpDocSingle$$module$src$service$ampdoc_impl$$($win$jscomp$224$$, {params:$JSCompiler_params$jscomp$inline_820$$});
  $win$jscomp$224$$.document.__AMPDOC = this.$singleDoc_$;
  this.$ampdocFieExperimentOn_$ = $isInAmpdocFieExperiment$$module$src$ampdoc_fie$$($win$jscomp$224$$);
  this.$mightHaveShadowRoots_$ = !1;
}
$JSCompiler_prototypeAlias$$ = $AmpDocService$$module$src$service$ampdoc_impl$$.prototype;
$JSCompiler_prototypeAlias$$.isSingleDoc = function() {
  return !!this.$singleDoc_$;
};
$JSCompiler_prototypeAlias$$.getSingleDoc = function() {
  return $devAssert$$module$src$log$$(this.$singleDoc_$);
};
$JSCompiler_prototypeAlias$$.getAmpDocIfAvailable = function($node$jscomp$33$$) {
  if (this.$ampdocFieExperimentOn_$) {
    for (var $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $node$jscomp$33$$; $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$;) {
      var $cachedAmpDoc$$ = $node$jscomp$33$$.everAttached && "function" === typeof $node$jscomp$33$$.getAmpDoc ? $node$jscomp$33$$.getAmpDoc() : null;
      if ($cachedAmpDoc$$) {
        return $cachedAmpDoc$$;
      }
      $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $rootNodeFor$$module$src$dom$$($n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$);
      if (!$n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$) {
        break;
      }
      var $ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$ = $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$.__AMPDOC;
      if ($ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$) {
        return $ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$;
      }
      $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$.host ? $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$.host : $getParentWindowFrameElement$$module$src$service$$($n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$, this.win);
    }
    return null;
  }
  for ($n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $node$jscomp$33$$; $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$;) {
    if ($ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$ = $node$jscomp$33$$.everAttached && "function" === typeof $node$jscomp$33$$.getAmpDoc ? $node$jscomp$33$$.getAmpDoc() : null) {
      return $ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$;
    }
    if ($ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$ = $getParentWindowFrameElement$$module$src$service$$($n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$, this.win)) {
      $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$;
    } else {
      if (!this.$mightHaveShadowRoots_$) {
        break;
      }
      $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = 9 == $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$.nodeType ? $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ : $getShadowRootNode$$module$src$shadow_embed$$($n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$);
      if (!$n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$) {
        break;
      }
      if ($ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$ = $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$.__AMPDOC) {
        return $ampdoc$84_ampdoc$jscomp$100_cachedAmpDoc$83_frameElement$jscomp$3$$;
      }
      $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $n$82_n$jscomp$17_rootNode$jscomp$4_shadowRoot$jscomp$14$$.host;
    }
  }
  return this.$singleDoc_$;
};
$JSCompiler_prototypeAlias$$.getAmpDoc = function($node$jscomp$34$$) {
  $devAssert$$module$src$log$$(void 0 === $node$jscomp$34$$.isConnected || !0 === $node$jscomp$34$$.isConnected);
  var $ampdoc$jscomp$101$$ = this.getAmpDocIfAvailable($node$jscomp$34$$);
  if (!$ampdoc$jscomp$101$$) {
    throw $dev$$module$src$log$$().createError("No ampdoc found for", $node$jscomp$34$$);
  }
  return $ampdoc$jscomp$101$$;
};
$JSCompiler_prototypeAlias$$.installShadowDoc = function($ampdoc$jscomp$102_url$jscomp$102$$, $shadowRoot$jscomp$15$$, $opt_options$jscomp$92$$) {
  this.$mightHaveShadowRoots_$ = !0;
  $devAssert$$module$src$log$$(!$shadowRoot$jscomp$15$$.__AMPDOC);
  $ampdoc$jscomp$102_url$jscomp$102$$ = new $AmpDocShadow$$module$src$service$ampdoc_impl$$(this.win, $ampdoc$jscomp$102_url$jscomp$102$$, $shadowRoot$jscomp$15$$, $opt_options$jscomp$92$$);
  return $shadowRoot$jscomp$15$$.__AMPDOC = $ampdoc$jscomp$102_url$jscomp$102$$;
};
$JSCompiler_prototypeAlias$$.installFieDoc = function($ampdoc$jscomp$103_url$jscomp$103$$, $childWin$jscomp$3$$, $opt_options$jscomp$93$$) {
  var $doc$jscomp$56$$ = $childWin$jscomp$3$$.document;
  $devAssert$$module$src$log$$(!$doc$jscomp$56$$.__AMPDOC);
  var $frameElement$jscomp$4$$ = $devAssert$$module$src$log$$($childWin$jscomp$3$$.frameElement);
  $ampdoc$jscomp$103_url$jscomp$103$$ = new $AmpDocFie$$module$src$service$ampdoc_impl$$($childWin$jscomp$3$$, $ampdoc$jscomp$103_url$jscomp$103$$, this.getAmpDoc($frameElement$jscomp$4$$), $opt_options$jscomp$93$$);
  return $doc$jscomp$56$$.__AMPDOC = $ampdoc$jscomp$103_url$jscomp$103$$;
};
function $AmpDoc$$module$src$service$ampdoc_impl$$($win$jscomp$225$$, $parent$jscomp$30$$, $opt_options$jscomp$94$$) {
  var $$jscomp$this$jscomp$166$$ = this;
  this.win = $win$jscomp$225$$;
  this.$hasTrackingIframe_$ = !1;
  this.$parent_$ = $parent$jscomp$30$$;
  this.$signals_$ = $opt_options$jscomp$94$$ && $opt_options$jscomp$94$$.signals || new $Signals$$module$src$utils$signals$$;
  this.$params_$ = $opt_options$jscomp$94$$ && $opt_options$jscomp$94$$.params || $map$$module$src$utils$object$$();
  this.$meta_$ = null;
  this.$declaredExtensions_$ = [];
  this.$visibilityStateOverride_$ = $opt_options$jscomp$94$$ && $opt_options$jscomp$94$$.visibilityState || this.$params_$.visibilityState && $dev$$module$src$log$$().assertEnumValue($VisibilityState$$module$src$visibility_state$$, this.$params_$.visibilityState, "VisibilityState") || null;
  this.$visibilityState_$ = null;
  this.$visibilityStateHandlers_$ = new $Observable$$module$src$observable$$;
  this.$lastVisibleTime_$ = null;
  this.$unsubsribes_$ = [];
  var $boundUpdateVisibilityState$$ = this.$updateVisibilityState_$.bind(this);
  this.$parent_$ && this.$unsubsribes_$.push(this.$parent_$.onVisibilityChanged($boundUpdateVisibilityState$$));
  $addDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$(this.win.document, $boundUpdateVisibilityState$$);
  this.$unsubsribes_$.push(function() {
    return $removeDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$($$jscomp$this$jscomp$166$$.win.document, $boundUpdateVisibilityState$$);
  });
  this.$updateVisibilityState_$();
}
$JSCompiler_prototypeAlias$$ = $AmpDoc$$module$src$service$ampdoc_impl$$.prototype;
$JSCompiler_prototypeAlias$$.dispose = function() {
  this.$unsubsribes_$.forEach(function($unsubsribe$$) {
    return $unsubsribe$$();
  });
};
$JSCompiler_prototypeAlias$$.isSingleDoc = function() {
  return $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.getParent = function() {
  return this.$parent_$;
};
$JSCompiler_prototypeAlias$$.getWin = function() {
  return this.win;
};
$JSCompiler_prototypeAlias$$.signals = function() {
  return this.$signals_$;
};
$JSCompiler_prototypeAlias$$.getParam = function($name$jscomp$147_v$jscomp$7$$) {
  $name$jscomp$147_v$jscomp$7$$ = this.$params_$[$name$jscomp$147_v$jscomp$7$$];
  return null == $name$jscomp$147_v$jscomp$7$$ ? null : $name$jscomp$147_v$jscomp$7$$;
};
$JSCompiler_prototypeAlias$$.getMeta = function() {
  var $$jscomp$this$jscomp$167$$ = this;
  if (this.$meta_$) {
    return $map$$module$src$utils$object$$(this.$meta_$);
  }
  this.$meta_$ = $map$$module$src$utils$object$$();
  var $metaEls$$ = this.win.document.head.querySelectorAll("meta[name]");
  $iterateCursor$$module$src$dom$$($metaEls$$, function($metaEls$$) {
    var $content$jscomp$6_metaEl$jscomp$1$$ = $metaEls$$.getAttribute("name");
    $metaEls$$ = $metaEls$$.getAttribute("content");
    $content$jscomp$6_metaEl$jscomp$1$$ && null !== $metaEls$$ && void 0 === $$jscomp$this$jscomp$167$$.$meta_$[$content$jscomp$6_metaEl$jscomp$1$$] && ($$jscomp$this$jscomp$167$$.$meta_$[$content$jscomp$6_metaEl$jscomp$1$$] = $metaEls$$);
  });
  return $map$$module$src$utils$object$$(this.$meta_$);
};
$JSCompiler_prototypeAlias$$.getMetaByName = function($content$jscomp$7_name$jscomp$149$$) {
  if (!$content$jscomp$7_name$jscomp$149$$) {
    return null;
  }
  $content$jscomp$7_name$jscomp$149$$ = this.getMeta()[$content$jscomp$7_name$jscomp$149$$];
  return void 0 !== $content$jscomp$7_name$jscomp$149$$ ? $content$jscomp$7_name$jscomp$149$$ : null;
};
$JSCompiler_prototypeAlias$$.setMetaByName = function() {
  $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.declaresExtension = function($extensionId$jscomp$20$$) {
  return -1 != this.$declaredExtensions_$.indexOf($extensionId$jscomp$20$$);
};
$JSCompiler_prototypeAlias$$.declareExtension = function($extensionId$jscomp$21$$) {
  this.declaresExtension($extensionId$jscomp$21$$) || this.$declaredExtensions_$.push($extensionId$jscomp$21$$);
};
$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.getHeadNode = function() {
};
$JSCompiler_prototypeAlias$$.isBodyAvailable = function() {
  return $devAssert$$module$src$log$$(!1);
};
$JSCompiler_prototypeAlias$$.getBody = function() {
  return $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.waitForBodyOpen = function() {
  return $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.isReady = function() {
  return $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.whenReady = function() {
  return $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.getUrl = function() {
  return $devAssert$$module$src$log$$(null);
};
$JSCompiler_prototypeAlias$$.getElementById = function($id$jscomp$45$$) {
  return this.getRootNode().getElementById($id$jscomp$45$$);
};
$JSCompiler_prototypeAlias$$.contains = function($node$jscomp$35$$) {
  return this.getRootNode().contains($node$jscomp$35$$);
};
$JSCompiler_prototypeAlias$$.overrideVisibilityState = function($visibilityState$jscomp$1$$) {
  this.$visibilityStateOverride_$ != $visibilityState$jscomp$1$$ && (this.$visibilityStateOverride_$ = $visibilityState$jscomp$1$$, this.$updateVisibilityState_$());
};
$JSCompiler_prototypeAlias$$.$updateVisibilityState_$ = function() {
  for (var $naturalVisibilityState$$ = $getDocumentVisibilityState$$module$src$utils$document_visibility$$(this.win.document), $parentVisibilityState$$ = "visible", $p$jscomp$4_visibilityState$jscomp$2$$ = this.$parent_$; $p$jscomp$4_visibilityState$jscomp$2$$; $p$jscomp$4_visibilityState$jscomp$2$$ = $p$jscomp$4_visibilityState$jscomp$2$$.getParent()) {
    if ("visible" != $p$jscomp$4_visibilityState$jscomp$2$$.getVisibilityState()) {
      $parentVisibilityState$$ = $p$jscomp$4_visibilityState$jscomp$2$$.getVisibilityState();
      break;
    }
  }
  var $visibilityStateOverride$$ = this.$visibilityStateOverride_$ || "visible";
  $p$jscomp$4_visibilityState$jscomp$2$$ = "visible" == $visibilityStateOverride$$ && "visible" == $parentVisibilityState$$ && "visible" == $naturalVisibilityState$$ ? "visible" : "hidden" == $naturalVisibilityState$$ && "paused" == $visibilityStateOverride$$ ? $naturalVisibilityState$$ : "paused" == $visibilityStateOverride$$ || "inactive" == $visibilityStateOverride$$ ? $visibilityStateOverride$$ : "paused" == $parentVisibilityState$$ || "inactive" == $parentVisibilityState$$ ? $parentVisibilityState$$ : 
  "prerender" == $visibilityStateOverride$$ || "prerender" == $naturalVisibilityState$$ || "prerender" == $parentVisibilityState$$ ? "prerender" : "hidden";
  this.$visibilityState_$ != $p$jscomp$4_visibilityState$jscomp$2$$ && (this.$visibilityState_$ = $p$jscomp$4_visibilityState$jscomp$2$$, "visible" == $p$jscomp$4_visibilityState$jscomp$2$$ ? (this.$lastVisibleTime_$ = Date.now(), this.$signals_$.signal("-ampdoc-first-visible"), this.$signals_$.signal("-ampdoc-next-visible")) : this.$signals_$.reset("-ampdoc-next-visible"), this.$visibilityStateHandlers_$.fire());
};
$JSCompiler_prototypeAlias$$.whenFirstVisible = function() {
  return this.$signals_$.whenSignal("-ampdoc-first-visible").then(function() {
  });
};
$JSCompiler_prototypeAlias$$.whenNextVisible = function() {
  return this.$signals_$.whenSignal("-ampdoc-next-visible").then(function() {
  });
};
$JSCompiler_prototypeAlias$$.getFirstVisibleTime = function() {
  return this.$signals_$.get("-ampdoc-first-visible");
};
$JSCompiler_prototypeAlias$$.getLastVisibleTime = function() {
  return this.$lastVisibleTime_$;
};
$JSCompiler_prototypeAlias$$.getVisibilityState = function() {
  return $devAssert$$module$src$log$$(this.$visibilityState_$);
};
$JSCompiler_prototypeAlias$$.isVisible = function() {
  return "visible" == this.$visibilityState_$;
};
$JSCompiler_prototypeAlias$$.hasBeenVisible = function() {
  return null != this.getLastVisibleTime();
};
$JSCompiler_prototypeAlias$$.onVisibilityChanged = function($handler$jscomp$35$$) {
  return this.$visibilityStateHandlers_$.add($handler$jscomp$35$$);
};
$JSCompiler_prototypeAlias$$.registerTrackingIframe = function() {
  return this.$hasTrackingIframe_$ ? !1 : this.$hasTrackingIframe_$ = !0;
};
function $AmpDocSingle$$module$src$service$ampdoc_impl$$($win$jscomp$226$$, $opt_options$jscomp$95$$) {
  $AmpDoc$$module$src$service$ampdoc_impl$$.call(this, $win$jscomp$226$$, null, $opt_options$jscomp$95$$);
  var $$jscomp$this$jscomp$168$$ = this;
  this.$bodyPromise_$ = this.win.document.body ? Promise.resolve(this.win.document.body) : $waitForBodyOpenPromise$$module$src$dom$$(this.win.document).then(function() {
    return $$jscomp$this$jscomp$168$$.getBody();
  });
  this.$readyPromise_$ = $whenDocumentReady$$module$src$document_ready$$(this.win.document);
}
$$jscomp$inherits$$($AmpDocSingle$$module$src$service$ampdoc_impl$$, $AmpDoc$$module$src$service$ampdoc_impl$$);
$JSCompiler_prototypeAlias$$ = $AmpDocSingle$$module$src$service$ampdoc_impl$$.prototype;
$JSCompiler_prototypeAlias$$.isSingleDoc = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.win.document;
};
$JSCompiler_prototypeAlias$$.getUrl = function() {
  return this.win.location.href;
};
$JSCompiler_prototypeAlias$$.getHeadNode = function() {
  return this.win.document.head;
};
$JSCompiler_prototypeAlias$$.isBodyAvailable = function() {
  return !!this.win.document.body;
};
$JSCompiler_prototypeAlias$$.getBody = function() {
  return this.win.document.body;
};
$JSCompiler_prototypeAlias$$.waitForBodyOpen = function() {
  return this.$bodyPromise_$;
};
$JSCompiler_prototypeAlias$$.isReady = function() {
  return $isDocumentReady$$module$src$document_ready$$(this.win.document);
};
$JSCompiler_prototypeAlias$$.whenReady = function() {
  return this.$readyPromise_$;
};
function $AmpDocShadow$$module$src$service$ampdoc_impl$$($win$jscomp$227$$, $url$jscomp$104$$, $shadowRoot$jscomp$16$$, $opt_options$jscomp$96$$) {
  $AmpDoc$$module$src$service$ampdoc_impl$$.call(this, $win$jscomp$227$$, null, $opt_options$jscomp$96$$);
  this.$url_$ = $url$jscomp$104$$;
  this.$shadowRoot_$ = $shadowRoot$jscomp$16$$;
  this.$body_$ = null;
  var $bodyDeferred$$ = new $Deferred$$module$src$utils$promise$$;
  this.$bodyPromise_$ = $bodyDeferred$$.promise;
  this.$bodyResolver_$ = $bodyDeferred$$.resolve;
  this.$ready_$ = !1;
  var $readyDeferred$$ = new $Deferred$$module$src$utils$promise$$;
  this.$readyPromise_$ = $readyDeferred$$.promise;
  this.$readyResolver_$ = $readyDeferred$$.resolve;
}
$$jscomp$inherits$$($AmpDocShadow$$module$src$service$ampdoc_impl$$, $AmpDoc$$module$src$service$ampdoc_impl$$);
$JSCompiler_prototypeAlias$$ = $AmpDocShadow$$module$src$service$ampdoc_impl$$.prototype;
$JSCompiler_prototypeAlias$$.isSingleDoc = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.$shadowRoot_$;
};
$JSCompiler_prototypeAlias$$.getUrl = function() {
  return this.$url_$;
};
$JSCompiler_prototypeAlias$$.getHeadNode = function() {
  return this.$shadowRoot_$;
};
$JSCompiler_prototypeAlias$$.isBodyAvailable = function() {
  return !!this.$body_$;
};
$JSCompiler_prototypeAlias$$.getBody = function() {
  return this.$body_$;
};
$JSCompiler_prototypeAlias$$.setBody = function($body$jscomp$11$$) {
  $devAssert$$module$src$log$$(!this.$body_$);
  this.$body_$ = $body$jscomp$11$$;
  this.$bodyResolver_$($body$jscomp$11$$);
  this.$bodyResolver_$ = void 0;
};
$JSCompiler_prototypeAlias$$.waitForBodyOpen = function() {
  return this.$bodyPromise_$;
};
$JSCompiler_prototypeAlias$$.isReady = function() {
  return this.$ready_$;
};
$JSCompiler_prototypeAlias$$.setReady = function() {
  $devAssert$$module$src$log$$(!this.$ready_$);
  this.$ready_$ = !0;
  this.$readyResolver_$();
  this.$readyResolver_$ = void 0;
};
$JSCompiler_prototypeAlias$$.whenReady = function() {
  return this.$readyPromise_$;
};
$JSCompiler_prototypeAlias$$.getMeta = function() {
  return $map$$module$src$utils$object$$(this.$meta_$);
};
$JSCompiler_prototypeAlias$$.setMetaByName = function($name$jscomp$150$$, $content$jscomp$8$$) {
  $devAssert$$module$src$log$$($name$jscomp$150$$);
  this.$meta_$ || (this.$meta_$ = $map$$module$src$utils$object$$());
  this.$meta_$[$name$jscomp$150$$] = $content$jscomp$8$$;
};
function $AmpDocFie$$module$src$service$ampdoc_impl$$($readyDeferred$jscomp$1_win$jscomp$228$$, $url$jscomp$105$$, $parent$jscomp$31$$, $opt_options$jscomp$97$$) {
  $AmpDoc$$module$src$service$ampdoc_impl$$.call(this, $readyDeferred$jscomp$1_win$jscomp$228$$, $parent$jscomp$31$$, $opt_options$jscomp$97$$);
  var $$jscomp$this$jscomp$169$$ = this;
  this.$url_$ = $url$jscomp$105$$;
  this.$bodyPromise_$ = this.win.document.body ? Promise.resolve(this.win.document.body) : $waitForBodyOpenPromise$$module$src$dom$$(this.win.document).then(function() {
    return $$jscomp$this$jscomp$169$$.getBody();
  });
  this.$ready_$ = !1;
  $readyDeferred$jscomp$1_win$jscomp$228$$ = new $Deferred$$module$src$utils$promise$$;
  this.$readyPromise_$ = $readyDeferred$jscomp$1_win$jscomp$228$$.promise;
  this.$readyResolver_$ = $readyDeferred$jscomp$1_win$jscomp$228$$.resolve;
}
$$jscomp$inherits$$($AmpDocFie$$module$src$service$ampdoc_impl$$, $AmpDoc$$module$src$service$ampdoc_impl$$);
$JSCompiler_prototypeAlias$$ = $AmpDocFie$$module$src$service$ampdoc_impl$$.prototype;
$JSCompiler_prototypeAlias$$.isSingleDoc = function() {
  return !1;
};
$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.win.document;
};
$JSCompiler_prototypeAlias$$.getUrl = function() {
  return this.$url_$;
};
$JSCompiler_prototypeAlias$$.getHeadNode = function() {
  return this.win.document.head;
};
$JSCompiler_prototypeAlias$$.isBodyAvailable = function() {
  return !!this.win.document.body;
};
$JSCompiler_prototypeAlias$$.getBody = function() {
  return this.win.document.body;
};
$JSCompiler_prototypeAlias$$.waitForBodyOpen = function() {
  return this.$bodyPromise_$;
};
$JSCompiler_prototypeAlias$$.isReady = function() {
  return this.$ready_$;
};
$JSCompiler_prototypeAlias$$.whenReady = function() {
  return this.$readyPromise_$;
};
$JSCompiler_prototypeAlias$$.setReady = function() {
  $devAssert$$module$src$log$$(!this.$ready_$);
  this.$ready_$ = !0;
  this.$readyResolver_$();
  this.$readyResolver_$ = void 0;
};
function $installDocService$$module$src$service$ampdoc_impl$$() {
  var $win$jscomp$230$$ = self;
  $registerServiceBuilder$$module$src$service$$($win$jscomp$230$$, "ampdoc", function() {
    return new $AmpDocService$$module$src$service$ampdoc_impl$$($win$jscomp$230$$);
  });
}
;var $EXCLUDE_INI_LOAD$$module$src$ini_load$$ = ["AMP-AD", "AMP-ANALYTICS", "AMP-PIXEL", "AMP-AD-EXIT"];
function $whenContentIniLoad$$module$src$ini_load$$($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$, $hostWin$$, $rect$jscomp$6$$) {
  $ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$ = $getAmpdoc$$module$src$service$$($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$);
  return $getMeasuredResources$$module$src$ini_load$$($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$, $hostWin$$, function($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$) {
    return $ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$.isDisplayed() && ($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$.overlaps($rect$jscomp$6$$) || $ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$.isFixed()) && $ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$.prerenderAllowed() ? !0 : !1;
  }).then(function($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$) {
    var $hostWin$$ = [];
    $ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$.forEach(function($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$) {
      $EXCLUDE_INI_LOAD$$module$src$ini_load$$.includes($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$.element.tagName) || $hostWin$$.push($ampdoc$jscomp$104_elementOrAmpDoc$jscomp$22$$.loadedOnce());
    });
    return Promise.all($hostWin$$);
  });
}
function $getMeasuredResources$$module$src$ini_load$$($ampdoc$jscomp$105$$, $hostWin$jscomp$1$$, $filterFn$$) {
  return $ampdoc$jscomp$105$$.signals().whenSignal("ready-scan").then(function() {
    var $filterFn$$ = [];
    $Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$105$$).get().forEach(function($ampdoc$jscomp$105$$) {
      $ampdoc$jscomp$105$$.hasBeenMeasured() || $ampdoc$jscomp$105$$.hostWin != $hostWin$jscomp$1$$ || $ampdoc$jscomp$105$$.hasOwner() || $filterFn$$.push($ampdoc$jscomp$105$$.getPageLayoutBoxAsync());
    });
    return Promise.all($filterFn$$);
  }).then(function() {
    return $Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$105$$).get().filter(function($ampdoc$jscomp$105$$) {
      return $ampdoc$jscomp$105$$.hostWin == $hostWin$jscomp$1$$ && !$ampdoc$jscomp$105$$.hasOwner() && $ampdoc$jscomp$105$$.hasBeenMeasured() && $filterFn$$($ampdoc$jscomp$105$$);
    });
  });
}
;function $Performance$$module$src$service$performance_impl$$($win$jscomp$231$$) {
  var $$jscomp$this$jscomp$170$$ = this;
  this.win = $win$jscomp$231$$;
  this.$events_$ = [];
  this.$timeOrigin_$ = $win$jscomp$231$$.performance.timeOrigin || $win$jscomp$231$$.performance.timing.navigationStart;
  this.$resources_$ = this.$viewer_$ = this.$ampdoc_$ = null;
  this.$isPerformanceTrackingOn_$ = this.$isMessagingReady_$ = !1;
  this.$enabledExperiments_$ = $map$$module$src$utils$object$$();
  this.$ampexp_$ = "";
  this.$fcpDeferred_$ = new $Deferred$$module$src$utils$promise$$;
  this.$fvrDeferred_$ = new $Deferred$$module$src$utils$promise$$;
  this.$mbvDeferred_$ = new $Deferred$$module$src$utils$promise$$;
  this.$platform_$ = $Services$$module$src$services$platformFor$$(this.win);
  this.$platform_$.isChrome() || this.$platform_$.isOpera() || this.$fcpDeferred_$.resolve(null);
  this.$aggregateShiftScore_$ = this.$shiftScoresTicked_$ = 0;
  var $supportedEntryTypes$$ = this.win.PerformanceObserver && this.win.PerformanceObserver.supportedEntryTypes || [];
  this.$supportsLayoutShift_$ = $supportedEntryTypes$$.includes("layout-shift");
  this.$supportsEventTiming_$ = $supportedEntryTypes$$.includes("first-input");
  this.$supportsLargestContentfulPaint_$ = $supportedEntryTypes$$.includes("largest-contentful-paint");
  this.$supportsNavigation_$ = $supportedEntryTypes$$.includes("navigation");
  this.$largestContentfulPaintRenderTime_$ = this.$largestContentfulPaintLoadTime_$ = null;
  this.$boundOnVisibilityChange_$ = this.$onVisibilityChange_$.bind(this);
  this.$onAmpDocVisibilityChange_$ = this.$onAmpDocVisibilityChange_$.bind(this);
  this.addEnabledExperiment("rtv-" + $getMode$$module$src$mode$$(this.win).rtvVersion);
  $whenDocumentReady$$module$src$document_ready$$($win$jscomp$231$$.document).then(function() {
    $$jscomp$this$jscomp$170$$.tick("dr");
    $$jscomp$this$jscomp$170$$.flush();
  });
  $whenDocumentComplete$$module$src$document_ready$$($win$jscomp$231$$.document).then(function() {
    $$jscomp$this$jscomp$170$$.tick("ol");
    if (!$$jscomp$this$jscomp$170$$.win.PerformancePaintTiming && $$jscomp$this$jscomp$170$$.win.chrome && "function" == typeof $$jscomp$this$jscomp$170$$.win.chrome.loadTimes) {
      var $win$jscomp$231$$ = 1000 * $$jscomp$this$jscomp$170$$.win.chrome.loadTimes().firstPaintTime - $$jscomp$this$jscomp$170$$.win.performance.timing.navigationStart;
      1 >= $win$jscomp$231$$ || $$jscomp$this$jscomp$170$$.tickDelta("fp", $win$jscomp$231$$);
    }
    $$jscomp$this$jscomp$170$$.flush();
  });
  $JSCompiler_StaticMethods_registerPerformanceObserver_$$(this);
  $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$$(this);
}
$JSCompiler_prototypeAlias$$ = $Performance$$module$src$service$performance_impl$$.prototype;
$JSCompiler_prototypeAlias$$.coreServicesAvailable = function() {
  var $$jscomp$this$jscomp$171$$ = this, $documentElement$jscomp$5$$ = this.win.document.documentElement;
  this.$ampdoc_$ = $getAmpdoc$$module$src$service$$($documentElement$jscomp$5$$);
  this.$viewer_$ = $Services$$module$src$services$viewerForDoc$$($documentElement$jscomp$5$$);
  this.$resources_$ = $Services$$module$src$services$resourcesForDoc$$($documentElement$jscomp$5$$);
  this.$isPerformanceTrackingOn_$ = this.$viewer_$.isEmbedded() && "1" === this.$viewer_$.getParam("csi");
  this.$ampdoc_$.onVisibilityChanged(this.flush.bind(this));
  $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$$(this);
  var $channelPromise$$ = this.$viewer_$.whenMessagingReady();
  this.$ampdoc_$.whenFirstVisible().then(function() {
    $$jscomp$this$jscomp$171$$.tick("ofv");
    $$jscomp$this$jscomp$171$$.flush();
  });
  if (this.$supportsLargestContentfulPaint_$ || this.$supportsLayoutShift_$) {
    this.win.addEventListener("visibilitychange", this.$boundOnVisibilityChange_$, {capture:!0}), this.$ampdoc_$.onVisibilityChanged(this.$onAmpDocVisibilityChange_$);
  }
  return $channelPromise$$ ? $channelPromise$$.then(function() {
    $$jscomp$this$jscomp$171$$.tickDelta("msr", $$jscomp$this$jscomp$171$$.win.performance.now());
    $$jscomp$this$jscomp$171$$.tick("timeOrigin", void 0, $$jscomp$this$jscomp$171$$.$timeOrigin_$);
    return $JSCompiler_StaticMethods_maybeAddStoryExperimentId_$$($$jscomp$this$jscomp$171$$);
  }).then(function() {
    $$jscomp$this$jscomp$171$$.$isMessagingReady_$ = !0;
    $JSCompiler_StaticMethods_flushQueuedTicks_$$($$jscomp$this$jscomp$171$$);
    $$jscomp$this$jscomp$171$$.flush();
  }) : $resolvedPromise$$module$src$resolved_promise$$();
};
function $JSCompiler_StaticMethods_maybeAddStoryExperimentId_$$($JSCompiler_StaticMethods_maybeAddStoryExperimentId_$self$$) {
  var $ampdoc$jscomp$106$$ = $Services$$module$src$services$ampdocServiceFor$$($JSCompiler_StaticMethods_maybeAddStoryExperimentId_$self$$.win).getSingleDoc();
  return $isStoryDocument$$module$src$utils$story$$($ampdoc$jscomp$106$$).then(function($ampdoc$jscomp$106$$) {
    $ampdoc$jscomp$106$$ && $JSCompiler_StaticMethods_maybeAddStoryExperimentId_$self$$.addEnabledExperiment("story");
  });
}
function $JSCompiler_StaticMethods_registerPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$) {
  if ("inabox" !== $getMode$$module$src$mode$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.win).runtime) {
    var $recordedFirstPaint$$ = !1, $recordedFirstContentfulPaint$$ = !1, $recordedFirstInputDelay$$ = !1, $recordedNavigation$$ = !1, $processEntry$$ = function($processEntry$$) {
      "first-paint" != $processEntry$$.name || $recordedFirstPaint$$ ? "first-contentful-paint" != $processEntry$$.name || $recordedFirstContentfulPaint$$ ? "first-input" !== $processEntry$$.entryType || $recordedFirstInputDelay$$ ? "layout-shift" === $processEntry$$.entryType ? $processEntry$$.hadRecentInput || ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$aggregateShiftScore_$ += $processEntry$$.value) : "largest-contentful-paint" === $processEntry$$.entryType ? ($processEntry$$.loadTime && 
      ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$largestContentfulPaintLoadTime_$ = $processEntry$$.loadTime), $processEntry$$.renderTime && ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$largestContentfulPaintRenderTime_$ = $processEntry$$.renderTime)) : "navigation" != $processEntry$$.entryType || $recordedNavigation$$ || ("domComplete domContentLoadedEventEnd domContentLoadedEventStart domInteractive loadEventEnd loadEventStart requestStart responseStart".split(" ").forEach(function($recordedFirstPaint$$) {
        return $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tick($recordedFirstPaint$$, $processEntry$$[$recordedFirstPaint$$]);
      }), $recordedNavigation$$ = !0) : ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tickDelta("fid", $processEntry$$.processingStart - $processEntry$$.startTime), $recordedFirstInputDelay$$ = !0) : ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tickDelta("fcp", $processEntry$$.startTime + $processEntry$$.duration), $recordedFirstContentfulPaint$$ = !0) : ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tickDelta("fp", $processEntry$$.startTime + $processEntry$$.duration), 
      $recordedFirstPaint$$ = !0);
    }, $entryTypesToObserve$$ = [];
    $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.win.PerformancePaintTiming && ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.win.performance.getEntriesByType("paint").forEach($processEntry$$), $entryTypesToObserve$$.push("paint"));
    $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsEventTiming_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({type:"first-input", buffered:!0});
    $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsLayoutShift_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({type:"layout-shift", buffered:!0});
    $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsLargestContentfulPaint_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({type:"largest-contentful-paint", buffered:!0});
    $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsNavigation_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({type:"navigation", buffered:!0});
    if (0 !== $entryTypesToObserve$$.length) {
      var $observer$jscomp$1$$ = $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$);
      try {
        $observer$jscomp$1$$.observe({entryTypes:$entryTypesToObserve$$});
      } catch ($err$jscomp$9$$) {
        $dev$$module$src$log$$().warn($err$jscomp$9$$);
      }
    }
  }
}
function $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_createPerformanceObserver_$self$$, $processEntry$jscomp$1$$) {
  return new $JSCompiler_StaticMethods_createPerformanceObserver_$self$$.win.PerformanceObserver(function($list$jscomp$1$$) {
    $list$jscomp$1$$.getEntries().forEach($processEntry$jscomp$1$$);
    $JSCompiler_StaticMethods_createPerformanceObserver_$self$$.flush();
  });
}
function $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$$($JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$) {
  if ($JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.win.perfMetrics && $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.win.perfMetrics.onFirstInputDelay) {
    $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.win.perfMetrics.onFirstInputDelay(function($delay$jscomp$6$$) {
      $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.tickDelta("fid-polyfill", $delay$jscomp$6$$);
      $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.flush();
    });
  }
}
$JSCompiler_prototypeAlias$$.$onVisibilityChange_$ = function() {
  "hidden" === this.win.document.visibilityState && (this.$supportsLayoutShift_$ && $JSCompiler_StaticMethods_tickLayoutShiftScore_$$(this), this.$supportsLargestContentfulPaint_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$$(this));
};
$JSCompiler_prototypeAlias$$.$onAmpDocVisibilityChange_$ = function() {
  "inactive" === this.$ampdoc_$.getVisibilityState() && (this.$supportsLayoutShift_$ && $JSCompiler_StaticMethods_tickLayoutShiftScore_$$(this), this.$supportsLargestContentfulPaint_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$$(this));
};
function $JSCompiler_StaticMethods_tickLayoutShiftScore_$$($JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$) {
  0 === $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ ? ($JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.tickDelta("cls", $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$aggregateShiftScore_$), $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.flush(), $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ = 1) : 1 === $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ && ($JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.tickDelta("cls-2", 
  $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$aggregateShiftScore_$), $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.flush(), $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ = 2, $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.win.removeEventListener("visibilitychange", $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$boundOnVisibilityChange_$, {capture:!0}));
}
function $JSCompiler_StaticMethods_tickLargestContentfulPaint_$$($JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$) {
  null !== $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintLoadTime_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.tickDelta("lcpl", $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintLoadTime_$);
  null !== $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintRenderTime_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.tickDelta("lcpr", $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintRenderTime_$);
  $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.flush();
}
function $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$) {
  var $didStartInPrerender$$ = !$JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$ampdoc_$.hasBeenVisible(), $docVisibleTime$$ = -1;
  $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$ampdoc_$.whenFirstVisible().then(function() {
    $docVisibleTime$$ = $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.win.performance.now();
    $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.mark("visible");
  });
  $JSCompiler_StaticMethods_whenViewportLayoutComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$).then(function() {
    if ($didStartInPrerender$$) {
      var $userPerceivedVisualCompletenesssTime$$ = -1 < $docVisibleTime$$ ? $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.win.performance.now() - $docVisibleTime$$ : 0;
      $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$ampdoc_$.whenFirstVisible().then(function() {
        $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.tickDelta("pc", $userPerceivedVisualCompletenesssTime$$);
      });
      $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$, $userPerceivedVisualCompletenesssTime$$);
      $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.mark("pc");
    } else {
      $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.tick("pc"), $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$, $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.win.performance.now() - $docVisibleTime$$);
    }
    $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.flush();
  });
}
function $JSCompiler_StaticMethods_whenViewportLayoutComplete_$$($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$) {
  return $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.$resources_$.whenFirstPass().then(function() {
    var $documentElement$jscomp$6$$ = $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.win.document.documentElement, $rect$jscomp$7_size$jscomp$22$$ = $Services$$module$src$services$viewportForDoc$$($documentElement$jscomp$6$$).getSize();
    $rect$jscomp$7_size$jscomp$22$$ = $layoutRectLtwh$$module$src$layout_rect$$(0, 0, $rect$jscomp$7_size$jscomp$22$$.width, $rect$jscomp$7_size$jscomp$22$$.height);
    return $whenContentIniLoad$$module$src$ini_load$$($documentElement$jscomp$6$$, $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.win, $rect$jscomp$7_size$jscomp$22$$);
  });
}
$JSCompiler_prototypeAlias$$.tick = function($label$jscomp$10$$, $opt_delta$$, $opt_value$jscomp$11$$) {
  $devAssert$$module$src$log$$(void 0 == $opt_delta$$ || void 0 == $opt_value$jscomp$11$$);
  var $data$jscomp$115$$ = $dict$$module$src$utils$object$$({label:$label$jscomp$10$$}), $delta$jscomp$3$$;
  void 0 != $opt_delta$$ ? $data$jscomp$115$$.delta = $delta$jscomp$3$$ = Math.max($opt_delta$$, 0) : void 0 != $opt_value$jscomp$11$$ ? $data$jscomp$115$$.value = $opt_value$jscomp$11$$ : (this.mark($label$jscomp$10$$), $delta$jscomp$3$$ = this.win.performance.now(), $data$jscomp$115$$.value = this.$timeOrigin_$ + $delta$jscomp$3$$);
  this.$isMessagingReady_$ && this.$isPerformanceTrackingOn_$ ? this.$viewer_$.sendMessage("tick", $data$jscomp$115$$) : (50 <= this.$events_$.length && this.$events_$.shift(), this.$events_$.push($data$jscomp$115$$));
  switch($label$jscomp$10$$) {
    case "fcp":
      this.$fcpDeferred_$.resolve($delta$jscomp$3$$);
      break;
    case "pc":
      this.$fvrDeferred_$.resolve($delta$jscomp$3$$);
      break;
    case "mbv":
      this.$mbvDeferred_$.resolve($delta$jscomp$3$$);
  }
};
$JSCompiler_prototypeAlias$$.mark = function($label$jscomp$11$$) {
  this.win.performance && this.win.performance.mark && 1 == arguments.length && this.win.performance.mark($label$jscomp$11$$);
};
$JSCompiler_prototypeAlias$$.tickDelta = function($label$jscomp$12$$, $value$jscomp$144$$) {
  this.tick($label$jscomp$12$$, $value$jscomp$144$$);
};
$JSCompiler_prototypeAlias$$.tickSinceVisible = function($label$jscomp$13$$) {
  var $now$jscomp$13$$ = this.$timeOrigin_$ + this.win.performance.now(), $visibleTime$$ = this.$ampdoc_$ ? this.$ampdoc_$.getFirstVisibleTime() : 0;
  this.tickDelta($label$jscomp$13$$, $visibleTime$$ ? Math.max($now$jscomp$13$$ - $visibleTime$$, 0) : 0);
};
$JSCompiler_prototypeAlias$$.flush = function() {
  this.$isMessagingReady_$ && this.$isPerformanceTrackingOn_$ && this.$viewer_$.sendMessage("sendCsi", $dict$$module$src$utils$object$$({ampexp:this.$ampexp_$}), !0);
};
$JSCompiler_prototypeAlias$$.throttledFlush = function() {
  this.$throttledFlush_$ || (this.$throttledFlush_$ = $throttle$$module$src$utils$rate_limit$$(this.win, this.flush.bind(this), 100));
  this.$throttledFlush_$();
};
$JSCompiler_prototypeAlias$$.addEnabledExperiment = function($experimentId$jscomp$3$$) {
  this.$enabledExperiments_$[$experimentId$jscomp$3$$] = !0;
  this.$ampexp_$ = Object.keys(this.$enabledExperiments_$).join(",");
};
function $JSCompiler_StaticMethods_flushQueuedTicks_$$($JSCompiler_StaticMethods_flushQueuedTicks_$self$$) {
  $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$viewer_$ && ($JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$isPerformanceTrackingOn_$ && $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$events_$.forEach(function($tickEvent$$) {
    $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$viewer_$.sendMessage("tick", $tickEvent$$);
  }), $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$events_$.length = 0);
}
function $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_prerenderComplete_$self$$, $value$jscomp$145$$) {
  $JSCompiler_StaticMethods_prerenderComplete_$self$$.$viewer_$ && $JSCompiler_StaticMethods_prerenderComplete_$self$$.$viewer_$.sendMessage("prerenderComplete", $dict$$module$src$utils$object$$({value:$value$jscomp$145$$}), !0);
}
$JSCompiler_prototypeAlias$$.isPerformanceTrackingOn = function() {
  return this.$isPerformanceTrackingOn_$;
};
$JSCompiler_prototypeAlias$$.getFirstContentfulPaint = function() {
  return this.$fcpDeferred_$.promise;
};
$JSCompiler_prototypeAlias$$.getMakeBodyVisible = function() {
  return this.$mbvDeferred_$.promise;
};
$JSCompiler_prototypeAlias$$.getFirstViewportReady = function() {
  return this.$fvrDeferred_$.promise;
};
function $PullToRefreshBlocker$$module$src$pull_to_refresh$$($doc$jscomp$57$$, $viewport$jscomp$10$$) {
  this.$doc_$ = $doc$jscomp$57$$;
  this.$viewport_$ = $viewport$jscomp$10$$;
  this.$tracking_$ = !1;
  this.$startPos_$ = 0;
  this.$boundTouchStart_$ = this.$onTouchStart_$.bind(this);
  this.$boundTouchMove_$ = this.$onTouchMove_$.bind(this);
  this.$boundTouchEnd_$ = this.$onTouchEnd_$.bind(this);
  this.$boundTouchCancel_$ = this.$onTouchCancel_$.bind(this);
  this.$doc_$.addEventListener("touchstart", this.$boundTouchStart_$, !0);
}
$JSCompiler_prototypeAlias$$ = $PullToRefreshBlocker$$module$src$pull_to_refresh$$.prototype;
$JSCompiler_prototypeAlias$$.cleanup = function() {
  $JSCompiler_StaticMethods_stopTracking_$$(this);
  this.$doc_$.removeEventListener("touchstart", this.$boundTouchStart_$, !0);
};
$JSCompiler_prototypeAlias$$.$onTouchStart_$ = function($JSCompiler_startPos$jscomp$inline_828_event$jscomp$39$$) {
  this.$tracking_$ || !$JSCompiler_startPos$jscomp$inline_828_event$jscomp$39$$.touches || 1 != $JSCompiler_startPos$jscomp$inline_828_event$jscomp$39$$.touches.length || 0 < this.$viewport_$.getScrollTop() || ($JSCompiler_startPos$jscomp$inline_828_event$jscomp$39$$ = $JSCompiler_startPos$jscomp$inline_828_event$jscomp$39$$.touches[0].clientY, this.$tracking_$ = !0, this.$startPos_$ = $JSCompiler_startPos$jscomp$inline_828_event$jscomp$39$$, this.$doc_$.addEventListener("touchmove", this.$boundTouchMove_$, 
  !0), this.$doc_$.addEventListener("touchend", this.$boundTouchEnd_$, !0), this.$doc_$.addEventListener("touchcancel", this.$boundTouchCancel_$, !0));
};
function $JSCompiler_StaticMethods_stopTracking_$$($JSCompiler_StaticMethods_stopTracking_$self$$) {
  $JSCompiler_StaticMethods_stopTracking_$self$$.$tracking_$ = !1;
  $JSCompiler_StaticMethods_stopTracking_$self$$.$startPos_$ = 0;
  $JSCompiler_StaticMethods_stopTracking_$self$$.$doc_$.removeEventListener("touchmove", $JSCompiler_StaticMethods_stopTracking_$self$$.$boundTouchMove_$, !0);
  $JSCompiler_StaticMethods_stopTracking_$self$$.$doc_$.removeEventListener("touchend", $JSCompiler_StaticMethods_stopTracking_$self$$.$boundTouchEnd_$, !0);
  $JSCompiler_StaticMethods_stopTracking_$self$$.$doc_$.removeEventListener("touchcancel", $JSCompiler_StaticMethods_stopTracking_$self$$.$boundTouchCancel_$, !0);
}
$JSCompiler_prototypeAlias$$.$onTouchMove_$ = function($event$jscomp$40$$) {
  if (this.$tracking_$) {
    var $dy$jscomp$5$$ = $event$jscomp$40$$.touches[0].clientY - this.$startPos_$;
    0 < $dy$jscomp$5$$ && $event$jscomp$40$$.preventDefault();
    0 != $dy$jscomp$5$$ && $JSCompiler_StaticMethods_stopTracking_$$(this);
  }
};
$JSCompiler_prototypeAlias$$.$onTouchEnd_$ = function() {
  $JSCompiler_StaticMethods_stopTracking_$$(this);
};
$JSCompiler_prototypeAlias$$.$onTouchCancel_$ = function() {
  $JSCompiler_StaticMethods_stopTracking_$$(this);
};
function $installStandaloneExtension$$module$src$standalone$$($ampdoc$jscomp$107$$) {
  var $win$jscomp$233$$ = $ampdoc$jscomp$107$$.win;
  $isAmpFormatType$$module$src$format$$(["\u26a1", "amp"], $win$jscomp$233$$.document) && $Services$$module$src$services$platformFor$$($ampdoc$jscomp$107$$.win).isStandalone() && $chunk$$module$src$chunk$$($ampdoc$jscomp$107$$, function() {
    $Services$$module$src$services$extensionsFor$$($win$jscomp$233$$).installExtensionForDoc($ampdoc$jscomp$107$$, "amp-standalone").then(function() {
      return $getElementServiceForDoc$$module$src$element_service$$($ampdoc$jscomp$107$$.getBody(), "standalone", "amp-standalone");
    }).then(function($ampdoc$jscomp$107$$) {
      return $ampdoc$jscomp$107$$.initialize();
    });
  });
}
;function $maybeValidate$$module$src$validator_integration$$() {
  var $win$jscomp$234$$ = self, $filename$jscomp$4$$ = $win$jscomp$234$$.location.href;
  if (!$startsWith$$module$src$string$$($filename$jscomp$4$$, "about:")) {
    var $validator$$ = !1;
    $getMode$$module$src$mode$$().development && ($validator$$ = "0" !== $parseQueryString_$$module$src$url_parse_query_string$$($win$jscomp$234$$.location.originalHash || $win$jscomp$234$$.location.hash).validate);
    $validator$$ ? $loadScript$$module$src$validator_integration$$($win$jscomp$234$$.document, $urls$$module$src$config$$.cdn + "/v0/validator.js").then(function() {
      amp.validator.validateUrlAndLog($filename$jscomp$4$$, $win$jscomp$234$$.document);
    }) : $getMode$$module$src$mode$$().examiner && $loadScript$$module$src$validator_integration$$($win$jscomp$234$$.document, $urls$$module$src$config$$.cdn + "/examiner.js");
  }
}
function $loadScript$$module$src$validator_integration$$($doc$jscomp$58$$, $currentScript$jscomp$1_promise$jscomp$26_url$jscomp$106$$) {
  var $script$jscomp$2$$ = $doc$jscomp$58$$.createElement("script");
  $script$jscomp$2$$.src = $currentScript$jscomp$1_promise$jscomp$26_url$jscomp$106$$;
  ($currentScript$jscomp$1_promise$jscomp$26_url$jscomp$106$$ = $doc$jscomp$58$$.head.querySelector("script[nonce]")) && $script$jscomp$2$$.setAttribute("nonce", $currentScript$jscomp$1_promise$jscomp$26_url$jscomp$106$$.getAttribute("nonce"));
  $currentScript$jscomp$1_promise$jscomp$26_url$jscomp$106$$ = $loadPromise$$module$src$event_helper$$($script$jscomp$2$$).then(function() {
    $doc$jscomp$58$$.head.removeChild($script$jscomp$2$$);
  }, function() {
  });
  $doc$jscomp$58$$.head.appendChild($script$jscomp$2$$);
  return $currentScript$jscomp$1_promise$jscomp$26_url$jscomp$106$$;
}
;function $bootstrap$$module$src$amp$$($ampdoc$jscomp$108$$, $perf$jscomp$3$$) {
  $startupChunk$$module$src$chunk$$(self.document, function() {
    $installRuntimeServices$$module$src$service$core_services$$(self);
    $installAmpdocServices$$module$src$service$core_services$$($ampdoc$jscomp$108$$);
    $perf$jscomp$3$$.coreServicesAvailable();
    $maybeTrackImpression$$module$src$impression$$();
  });
  $startupChunk$$module$src$chunk$$(self.document, function() {
    $adoptWithMultidocDeps$$module$src$runtime$$();
  });
  $startupChunk$$module$src$chunk$$(self.document, function() {
    var $ampdoc$jscomp$108$$ = self;
    $registerElement$$module$src$service$custom_element_registry$$($ampdoc$jscomp$108$$, "amp-img", $AmpImg$$module$builtins$amp_img$$);
    $registerElement$$module$src$service$custom_element_registry$$($ampdoc$jscomp$108$$, "amp-pixel", $AmpPixel$$module$builtins$amp_pixel$$);
    $registerElement$$module$src$service$custom_element_registry$$($ampdoc$jscomp$108$$, "amp-layout", $AmpLayout$$module$builtins$amp_layout$$);
  });
  $startupChunk$$module$src$chunk$$(self.document, function() {
    $stubElementsForDoc$$module$src$service$custom_element_registry$$($ampdoc$jscomp$108$$);
  });
  $startupChunk$$module$src$chunk$$(self.document, function() {
    var $perf$jscomp$3$$ = self, $JSCompiler_documentElement$jscomp$inline_833$$ = $perf$jscomp$3$$.document.documentElement;
    "0" == $Services$$module$src$services$viewerForDoc$$($JSCompiler_documentElement$jscomp$inline_833$$).getParam("p2r") && $Services$$module$src$services$platformFor$$($perf$jscomp$3$$).isChrome() && new $PullToRefreshBlocker$$module$src$pull_to_refresh$$($perf$jscomp$3$$.document, $Services$$module$src$services$viewportForDoc$$($JSCompiler_documentElement$jscomp$inline_833$$));
    $installAutoLightboxExtension$$module$src$auto_lightbox$$($ampdoc$jscomp$108$$);
    $installStandaloneExtension$$module$src$standalone$$($ampdoc$jscomp$108$$);
    $maybeValidate$$module$src$validator_integration$$();
    $makeBodyVisible$$module$src$style_installer$$();
    $preconnectToOrigin$$module$src$preconnect$$();
  }, !0);
  $startupChunk$$module$src$chunk$$(self.document, function() {
    $perf$jscomp$3$$.tick("e_is");
    $Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$108$$).ampInitComplete();
    $perf$jscomp$3$$.flush();
  });
}
if (!self.IS_AMP_ALT) {
  self.location && (self.location.originalHash = self.location.hash);
  var ampdocService;
  try {
    $installErrorReporting$$module$src$error$$(), $installDocService$$module$src$service$ampdoc_impl$$(), ampdocService = $Services$$module$src$services$ampdocServiceFor$$(self);
  } catch ($e$jscomp$96$$) {
    throw $makeBodyVisibleRecovery$$module$src$style_installer$$(self.document), $e$jscomp$96$$;
  }
  $startupChunk$$module$src$chunk$$(self.document, function() {
    var $ampdoc$jscomp$109$$ = ampdocService.getAmpDoc(self.document);
    $registerServiceBuilder$$module$src$service$$(self, "platform", $Platform$$module$src$service$platform_impl$$);
    $registerServiceBuilder$$module$src$service$$(self, "performance", $Performance$$module$src$service$performance_impl$$);
    var $perf$jscomp$4$$ = $getService$$module$src$service$$(self, "performance");
    self.document.documentElement.hasAttribute("i-amphtml-no-boilerplate") && $perf$jscomp$4$$.addEnabledExperiment("no-boilerplate");
    $getMode$$module$src$mode$$().esm && $perf$jscomp$4$$.addEnabledExperiment("esm");
    $fontStylesheetTimeout$$module$src$font_stylesheet_timeout$$();
    $perf$jscomp$4$$.tick("is");
    $installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$109$$, $cssText$$module$build$ampdoc_css$$ + $cssText$$module$build$ampshared_css$$, function() {
      return $bootstrap$$module$src$amp$$($ampdoc$jscomp$109$$, $perf$jscomp$4$$);
    }, !0, "amp-runtime");
  });
  self.console && (console.info || console.log).call(console, "Powered by AMP \u26a1 HTML \u2013 Version 2005062057000", self.location.href);
  self.document.documentElement.setAttribute("amp-version", "2005062057000");
}
;})(AMP._=AMP._||{})}catch(e){setTimeout(function(){var s=document.body.style;s.opacity=1;s.visibility="visible";s.animation="none";s.WebkitAnimation="none;"},1000);throw e};

//# sourceMappingURL=v0.js.map
