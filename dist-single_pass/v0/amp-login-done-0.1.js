(function(){var $JSCompiler_prototypeAlias$$, $$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
  function $ctor$$() {
  }
  $ctor$$.prototype = $prototype$$;
  return new $ctor$$;
}, $JSCompiler_temp$jscomp$18$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$18$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$19$$;
  a: {
    var $JSCompiler_x$jscomp$inline_40$$ = {a:!0}, $JSCompiler_y$jscomp$inline_41$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_41$$.__proto__ = $JSCompiler_x$jscomp$inline_40$$;
      $JSCompiler_inline_result$jscomp$19$$ = $JSCompiler_y$jscomp$inline_41$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_42$$) {
    }
    $JSCompiler_inline_result$jscomp$19$$ = !1;
  }
  $JSCompiler_temp$jscomp$18$$ = $JSCompiler_inline_result$jscomp$19$$ ? function($target$jscomp$55$$, $proto$jscomp$3$$) {
    $target$jscomp$55$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$55$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$55$$ + " is not extensible");
    }
    return $target$jscomp$55$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$18$$;
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
    var $name$jscomp$65$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$84$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2], $match$$[2]) : "";
    $params$jscomp$1$$[$name$jscomp$65$$] = $value$jscomp$84$$;
  }
  return $params$jscomp$1$$;
}
;var $rtvVersion$$module$src$mode$$ = "";
function $getMode$$module$src$mode$$($opt_win$$) {
  var $win$$ = $opt_win$$ || self;
  if ($win$$.AMP_MODE) {
    var $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$ = $win$$.AMP_MODE;
  } else {
    $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$ = $win$$;
    var $JSCompiler_AMP_CONFIG$jscomp$inline_45_JSCompiler_singlePassType$jscomp$inline_52$$ = self.AMP_CONFIG || {}, $JSCompiler_runningTests$jscomp$inline_49$$ = !!$JSCompiler_AMP_CONFIG$jscomp$inline_45_JSCompiler_singlePassType$jscomp$inline_52$$.test || !1, $JSCompiler_hashQuery$jscomp$inline_51$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$.location.originalHash || $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$.location.hash);
    $JSCompiler_AMP_CONFIG$jscomp$inline_45_JSCompiler_singlePassType$jscomp$inline_52$$ = $JSCompiler_AMP_CONFIG$jscomp$inline_45_JSCompiler_singlePassType$jscomp$inline_52$$.spt;
    var $JSCompiler_searchQuery$jscomp$inline_53$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$.location.search);
    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$.AMP_CONFIG && $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$.AMP_CONFIG.v ? $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$.AMP_CONFIG.v : "011901181729101");
    $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$ = $win$$.AMP_MODE = {localDev:!1, development:!("1" != $JSCompiler_hashQuery$jscomp$inline_51$$.development && !$JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$.AMP_DEV_MODE), examiner:"2" == $JSCompiler_hashQuery$jscomp$inline_51$$.development, filter:$JSCompiler_hashQuery$jscomp$inline_51$$.filter, geoOverride:$JSCompiler_hashQuery$jscomp$inline_51$$["amp-geo"], minified:!0, lite:void 0 != $JSCompiler_searchQuery$jscomp$inline_53$$.amp_lite, 
    test:$JSCompiler_runningTests$jscomp$inline_49$$, log:$JSCompiler_hashQuery$jscomp$inline_51$$.log, version:"1901181729101", rtvVersion:$rtvVersion$$module$src$mode$$, singlePassType:$JSCompiler_AMP_CONFIG$jscomp$inline_45_JSCompiler_singlePassType$jscomp$inline_52$$};
  }
  return $JSCompiler_temp$jscomp$20_JSCompiler_win$jscomp$inline_44$$;
}
;function $includes$$module$src$polyfills$array_includes$$($value$jscomp$85$$, $i$jscomp$3_opt_fromIndex$jscomp$10$$) {
  var $fromIndex$$ = $i$jscomp$3_opt_fromIndex$jscomp$10$$ || 0, $len$$ = this.length;
  for ($i$jscomp$3_opt_fromIndex$jscomp$10$$ = 0 <= $fromIndex$$ ? $fromIndex$$ : Math.max($len$$ + $fromIndex$$, 0); $i$jscomp$3_opt_fromIndex$jscomp$10$$ < $len$$; $i$jscomp$3_opt_fromIndex$jscomp$10$$++) {
    var $other$jscomp$4$$ = this[$i$jscomp$3_opt_fromIndex$jscomp$10$$];
    if ($other$jscomp$4$$ === $value$jscomp$85$$ || $value$jscomp$85$$ !== $value$jscomp$85$$ && $other$jscomp$4$$ !== $other$jscomp$4$$) {
      return !0;
    }
  }
  return !1;
}
;var $VALID_NAME$$module$src$polyfills$custom_elements$$ = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/, $INVALID_NAMES$$module$src$polyfills$custom_elements$$ = "annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "), $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$ = {childList:!0, subtree:!0};
function $assertValidName$$module$src$polyfills$custom_elements$$($SyntaxError$jscomp$1$$, $name$jscomp$66$$) {
  if (!$VALID_NAME$$module$src$polyfills$custom_elements$$.test($name$jscomp$66$$) || $INVALID_NAMES$$module$src$polyfills$custom_elements$$.includes($name$jscomp$66$$)) {
    throw new $SyntaxError$jscomp$1$$('invalid custom element name "' + $name$jscomp$66$$ + '"');
  }
}
function $rethrowAsync$$module$src$polyfills$custom_elements$$($error$jscomp$2$$) {
  new Promise(function() {
    throw $error$jscomp$2$$;
  });
}
function $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$7$$, $registry$$) {
  this.$win_$ = $win$jscomp$7$$;
  this.$registry_$ = $registry$$;
  this.$pendingDefines_$ = $win$jscomp$7$$.Object.create(null);
}
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.define = function($name$jscomp$67$$, $ctor$jscomp$1$$, $options$jscomp$13$$) {
  this.$registry_$.define($name$jscomp$67$$, $ctor$jscomp$1$$, $options$jscomp$13$$);
  var $pending$$ = this.$pendingDefines_$, $deferred$$ = $pending$$[$name$jscomp$67$$];
  $deferred$$ && ($deferred$$.resolve(), delete $pending$$[$name$jscomp$67$$]);
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.get = function($name$jscomp$68$$) {
  var $def$$ = this.$registry_$.getByName($name$jscomp$68$$);
  if ($def$$) {
    return $def$$.ctor;
  }
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.whenDefined = function($name$jscomp$69$$) {
  var $$jscomp$destructuring$var1_pending$jscomp$1$$ = this.$win_$, $Promise$jscomp$1$$ = $$jscomp$destructuring$var1_pending$jscomp$1$$.Promise;
  $assertValidName$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var1_pending$jscomp$1$$.SyntaxError, $name$jscomp$69$$);
  if (this.$registry_$.getByName($name$jscomp$69$$)) {
    return $Promise$jscomp$1$$.resolve();
  }
  $$jscomp$destructuring$var1_pending$jscomp$1$$ = this.$pendingDefines_$;
  var $deferred$jscomp$1$$ = $$jscomp$destructuring$var1_pending$jscomp$1$$[$name$jscomp$69$$];
  if ($deferred$jscomp$1$$) {
    return $deferred$jscomp$1$$.promise;
  }
  var $resolve$$, $promise$$ = new $Promise$jscomp$1$$(function($name$jscomp$69$$) {
    return $resolve$$ = $name$jscomp$69$$;
  });
  $$jscomp$destructuring$var1_pending$jscomp$1$$[$name$jscomp$69$$] = {promise:$promise$$, resolve:$resolve$$};
  return $promise$$;
};
$CustomElementRegistry$$module$src$polyfills$custom_elements$$.prototype.upgrade = function($root$jscomp$2$$) {
  this.$registry_$.upgrade($root$jscomp$2$$);
};
function $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$8$$) {
  this.$win_$ = $win$jscomp$8$$;
  this.$doc_$ = $win$jscomp$8$$.document;
  this.$definitions_$ = $win$jscomp$8$$.Object.create(null);
  this.$query_$ = "";
  this.$mutationObserver_$ = this.$current_$ = null;
  this.$observed_$ = [$win$jscomp$8$$.document];
}
$JSCompiler_prototypeAlias$$ = $Registry$$module$src$polyfills$custom_elements$$.prototype;
$JSCompiler_prototypeAlias$$.current = function() {
  var $current$$ = this.$current_$;
  this.$current_$ = null;
  return $current$$;
};
$JSCompiler_prototypeAlias$$.getByName = function($name$jscomp$70$$) {
  var $definition$$ = this.$definitions_$[$name$jscomp$70$$];
  if ($definition$$) {
    return $definition$$;
  }
};
$JSCompiler_prototypeAlias$$.getByConstructor = function($ctor$jscomp$2$$) {
  var $definitions$$ = this.$definitions_$, $name$jscomp$71$$;
  for ($name$jscomp$71$$ in $definitions$$) {
    var $def$jscomp$1$$ = $definitions$$[$name$jscomp$71$$];
    if ($def$jscomp$1$$.ctor === $ctor$jscomp$2$$) {
      return $def$jscomp$1$$;
    }
  }
};
$JSCompiler_prototypeAlias$$.define = function($name$jscomp$72$$, $ctor$jscomp$3$$, $options$jscomp$14$$) {
  var $$jscomp$destructuring$var2_SyntaxError$jscomp$3$$ = this.$win_$, $Error$jscomp$1$$ = $$jscomp$destructuring$var2_SyntaxError$jscomp$3$$.Error;
  $$jscomp$destructuring$var2_SyntaxError$jscomp$3$$ = $$jscomp$destructuring$var2_SyntaxError$jscomp$3$$.SyntaxError;
  if ($options$jscomp$14$$) {
    throw new $Error$jscomp$1$$("Extending native custom elements is not supported");
  }
  $assertValidName$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var2_SyntaxError$jscomp$3$$, $name$jscomp$72$$);
  if (this.getByName($name$jscomp$72$$) || this.getByConstructor($ctor$jscomp$3$$)) {
    throw new $Error$jscomp$1$$('duplicate definition "' + $name$jscomp$72$$ + '"');
  }
  this.$definitions_$[$name$jscomp$72$$] = {name:$name$jscomp$72$$, ctor:$ctor$jscomp$3$$};
  $JSCompiler_StaticMethods_observe_$$(this, $name$jscomp$72$$);
  this.upgrade(this.$doc_$, $name$jscomp$72$$);
};
$JSCompiler_prototypeAlias$$.upgrade = function($i$jscomp$4_root$jscomp$3$$, $opt_query$$) {
  var $newlyDefined$$ = !!$opt_query$$, $upgradeCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$jscomp$4_root$jscomp$3$$, $opt_query$$ || this.$query_$);
  for ($i$jscomp$4_root$jscomp$3$$ = 0; $i$jscomp$4_root$jscomp$3$$ < $upgradeCandidates$$.length; $i$jscomp$4_root$jscomp$3$$++) {
    var $candidate$jscomp$1$$ = $upgradeCandidates$$[$i$jscomp$4_root$jscomp$3$$];
    $newlyDefined$$ ? $JSCompiler_StaticMethods_connectedCallback_$$(this, $candidate$jscomp$1$$) : this.upgradeSelf($candidate$jscomp$1$$);
  }
};
$JSCompiler_prototypeAlias$$.upgradeSelf = function($node$jscomp$2$$) {
  var $def$jscomp$2$$ = this.getByName($node$jscomp$2$$.localName);
  $def$jscomp$2$$ && $JSCompiler_StaticMethods_upgradeSelf_$$(this, $node$jscomp$2$$, $def$jscomp$2$$);
};
function $JSCompiler_StaticMethods_queryAll_$$($root$jscomp$4$$, $query$jscomp$9$$) {
  return $query$jscomp$9$$ && $root$jscomp$4$$.querySelectorAll ? $root$jscomp$4$$.querySelectorAll($query$jscomp$9$$) : [];
}
function $JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_upgradeSelf_$self$$, $node$jscomp$3$$, $ctor$jscomp$4_def$jscomp$3$$) {
  $ctor$jscomp$4_def$jscomp$3$$ = $ctor$jscomp$4_def$jscomp$3$$.ctor;
  if (!($node$jscomp$3$$ instanceof $ctor$jscomp$4_def$jscomp$3$$)) {
    $JSCompiler_StaticMethods_upgradeSelf_$self$$.$current_$ = $node$jscomp$3$$;
    try {
      var $el$$ = new $ctor$jscomp$4_def$jscomp$3$$;
      if ($el$$ !== $node$jscomp$3$$) {
        throw new $JSCompiler_StaticMethods_upgradeSelf_$self$$.$win_$.Error("Constructor illegally returned a different instance.");
      }
    } catch ($e$jscomp$9$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$9$$);
    }
  }
}
function $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$4$$) {
  var $def$jscomp$4$$ = $JSCompiler_StaticMethods_connectedCallback_$self$$.getByName($node$jscomp$4$$.localName);
  if ($def$jscomp$4$$ && ($JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$4$$, $def$jscomp$4$$), $node$jscomp$4$$.connectedCallback)) {
    try {
      $node$jscomp$4$$.connectedCallback();
    } catch ($e$jscomp$10$$) {
      $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$10$$);
    }
  }
}
function $JSCompiler_StaticMethods_observe_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$73$$) {
  if ($JSCompiler_StaticMethods_observe_$self$$.$query_$) {
    $JSCompiler_StaticMethods_observe_$self$$.$query_$ += "," + $name$jscomp$73$$;
  } else {
    $JSCompiler_StaticMethods_observe_$self$$.$query_$ = $name$jscomp$73$$;
    var $mo$$ = new $JSCompiler_StaticMethods_observe_$self$$.$win_$.MutationObserver(function($name$jscomp$73$$) {
      $name$jscomp$73$$ && $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$73$$);
    });
    $JSCompiler_StaticMethods_observe_$self$$.$mutationObserver_$ = $mo$$;
    $JSCompiler_StaticMethods_observe_$self$$.$observed_$.forEach(function($JSCompiler_StaticMethods_observe_$self$$) {
      $mo$$.observe($JSCompiler_StaticMethods_observe_$self$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$);
    });
    $JSCompiler_StaticMethods_observe_$self$$.$observed_$.length = 0;
    $installPatches$$module$src$polyfills$custom_elements$$($JSCompiler_StaticMethods_observe_$self$$.$win_$, $JSCompiler_StaticMethods_observe_$self$$);
  }
}
$JSCompiler_prototypeAlias$$.observe = function($tree$jscomp$1$$) {
  this.$mutationObserver_$ ? this.$mutationObserver_$.observe($tree$jscomp$1$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$) : this.$observed_$.push($tree$jscomp$1$$);
};
$JSCompiler_prototypeAlias$$.sync = function() {
  this.$mutationObserver_$ && $JSCompiler_StaticMethods_handleRecords_$$(this, this.$mutationObserver_$.takeRecords());
};
function $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $records$jscomp$1$$) {
  for (var $i$jscomp$5$$ = 0; $i$jscomp$5$$ < $records$jscomp$1$$.length; $i$jscomp$5$$++) {
    var $record$$ = $records$jscomp$1$$[$i$jscomp$5$$];
    if ($record$$) {
      var $$jscomp$destructuring$var4_i$0_i$2$$ = $record$$, $addedNodes$$ = $$jscomp$destructuring$var4_i$0_i$2$$.addedNodes, $removedNodes$$ = $$jscomp$destructuring$var4_i$0_i$2$$.removedNodes;
      for ($$jscomp$destructuring$var4_i$0_i$2$$ = 0; $$jscomp$destructuring$var4_i$0_i$2$$ < $addedNodes$$.length; $$jscomp$destructuring$var4_i$0_i$2$$++) {
        var $i$1_i$4_node$3_node$jscomp$6$$ = $addedNodes$$[$$jscomp$destructuring$var4_i$0_i$2$$], $connectedCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$1_i$4_node$3_node$jscomp$6$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
        $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $i$1_i$4_node$3_node$jscomp$6$$);
        for ($i$1_i$4_node$3_node$jscomp$6$$ = 0; $i$1_i$4_node$3_node$jscomp$6$$ < $connectedCandidates$$.length; $i$1_i$4_node$3_node$jscomp$6$$++) {
          $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $connectedCandidates$$[$i$1_i$4_node$3_node$jscomp$6$$]);
        }
      }
      for ($$jscomp$destructuring$var4_i$0_i$2$$ = 0; $$jscomp$destructuring$var4_i$0_i$2$$ < $removedNodes$$.length; $$jscomp$destructuring$var4_i$0_i$2$$++) {
        $i$1_i$4_node$3_node$jscomp$6$$ = $removedNodes$$[$$jscomp$destructuring$var4_i$0_i$2$$];
        var $disconnectedCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$1_i$4_node$3_node$jscomp$6$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
        if ($i$1_i$4_node$3_node$jscomp$6$$.disconnectedCallback) {
          try {
            $i$1_i$4_node$3_node$jscomp$6$$.disconnectedCallback();
          } catch ($JSCompiler_e$jscomp$inline_57$$) {
            $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_57$$);
          }
        }
        for ($i$1_i$4_node$3_node$jscomp$6$$ = 0; $i$1_i$4_node$3_node$jscomp$6$$ < $disconnectedCandidates$$.length; $i$1_i$4_node$3_node$jscomp$6$$++) {
          var $JSCompiler_node$jscomp$inline_60$$ = $disconnectedCandidates$$[$i$1_i$4_node$3_node$jscomp$6$$];
          if ($JSCompiler_node$jscomp$inline_60$$.disconnectedCallback) {
            try {
              $JSCompiler_node$jscomp$inline_60$$.disconnectedCallback();
            } catch ($JSCompiler_e$jscomp$inline_61$$) {
              $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_61$$);
            }
          }
        }
      }
    }
  }
}
function $installPatches$$module$src$polyfills$custom_elements$$($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$, $registry$jscomp$1$$) {
  var $Object$jscomp$1$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.Object, $docProto$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.Document.prototype, $elProto$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.Element.prototype, $nodeProto$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.Node.prototype;
  $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $docProto$$;
  var $createElement$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.createElement, $importNode$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.importNode;
  $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $nodeProto$$;
  var $appendChild$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.appendChild, $cloneNode$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.cloneNode, $insertBefore$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.insertBefore, $removeChild$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.removeChild, $replaceChild$$ = $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$.replaceChild;
  $docProto$$.createElement = function($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$) {
    var $Object$jscomp$1$$ = $registry$jscomp$1$$.getByName($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$);
    return $Object$jscomp$1$$ ? new $Object$jscomp$1$$.ctor : $createElement$$.apply(this, arguments);
  };
  $docProto$$.importNode = function() {
    var $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $importNode$$.apply(this, arguments);
    $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ && ($registry$jscomp$1$$.upgradeSelf($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$), $registry$jscomp$1$$.upgrade($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$));
    return $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$;
  };
  $nodeProto$$.appendChild = function() {
    var $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $appendChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$;
  };
  $nodeProto$$.insertBefore = function() {
    var $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $insertBefore$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$;
  };
  $nodeProto$$.removeChild = function() {
    var $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $removeChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$;
  };
  $nodeProto$$.replaceChild = function() {
    var $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $replaceChild$$.apply(this, arguments);
    $registry$jscomp$1$$.sync();
    return $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$;
  };
  $nodeProto$$.cloneNode = function() {
    var $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$ = $cloneNode$$.apply(this, arguments);
    $registry$jscomp$1$$.upgradeSelf($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$);
    $registry$jscomp$1$$.upgrade($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$);
    return $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$;
  };
  var $innerHTMLDesc$$ = $Object$jscomp$1$$.getOwnPropertyDescriptor($elProto$$, "innerHTML"), $innerHTMLSetter$$ = $innerHTMLDesc$$.set;
  $innerHTMLDesc$$.set = function($$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$) {
    $innerHTMLSetter$$.call(this, $$jscomp$destructuring$var6_$jscomp$destructuring$var7_win$jscomp$9$$);
    $registry$jscomp$1$$.upgrade(this);
  };
  $Object$jscomp$1$$.defineProperty($elProto$$, "innerHTML", $innerHTMLDesc$$);
}
function $polyfill$$module$src$polyfills$custom_elements$$() {
  var $win$jscomp$10$$ = $JSCompiler_win$jscomp$inline_147$$;
  function $HTMLElementPolyfill$$() {
    var $win$jscomp$10$$ = this.constructor, $HTMLElementPolyfill$$ = $registry$jscomp$2$$.current();
    $HTMLElementPolyfill$$ || ($HTMLElementPolyfill$$ = $registry$jscomp$2$$.getByConstructor($win$jscomp$10$$), $HTMLElementPolyfill$$ = $createElement$jscomp$1$$.call($document$jscomp$1$$, $HTMLElementPolyfill$$.name));
    $Object$jscomp$2$$.setPrototypeOf($HTMLElementPolyfill$$, $win$jscomp$10$$.prototype);
    return $HTMLElementPolyfill$$;
  }
  var $Element$jscomp$2_elProto$jscomp$1$$ = $win$jscomp$10$$.Element, $HTMLElement$jscomp$1$$ = $win$jscomp$10$$.HTMLElement, $Object$jscomp$2$$ = $win$jscomp$10$$.Object, $document$jscomp$1$$ = $win$jscomp$10$$.document, $createElement$jscomp$1$$ = $document$jscomp$1$$.createElement, $registry$jscomp$2$$ = new $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$10$$), $customElements$jscomp$2$$ = new $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$10$$, $registry$jscomp$2$$);
  $Object$jscomp$2$$.defineProperty($win$jscomp$10$$, "customElements", {enumerable:!0, configurable:!0, value:$customElements$jscomp$2$$});
  $Element$jscomp$2_elProto$jscomp$1$$ = $Element$jscomp$2_elProto$jscomp$1$$.prototype;
  var $attachShadow$$ = $Element$jscomp$2_elProto$jscomp$1$$.attachShadow, $createShadowRoot$$ = $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot;
  $attachShadow$$ && ($Element$jscomp$2_elProto$jscomp$1$$.attachShadow = function($win$jscomp$10$$) {
    var $HTMLElementPolyfill$$ = $attachShadow$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($HTMLElementPolyfill$$);
    return $HTMLElementPolyfill$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.attachShadow.toString = function() {
    return $attachShadow$$.toString();
  });
  $createShadowRoot$$ && ($Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot = function() {
    var $win$jscomp$10$$ = $createShadowRoot$$.apply(this, arguments);
    $registry$jscomp$2$$.observe($win$jscomp$10$$);
    return $win$jscomp$10$$;
  }, $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot.toString = function() {
    return $createShadowRoot$$.toString();
  });
  $subClass$$module$src$polyfills$custom_elements$$($Object$jscomp$2$$, $HTMLElement$jscomp$1$$, $HTMLElementPolyfill$$);
  $win$jscomp$10$$.HTMLElement = $HTMLElementPolyfill$$;
}
function $subClass$$module$src$polyfills$custom_elements$$($Object$jscomp$4$$, $superClass$$, $subClass$$) {
  $subClass$$.prototype = $Object$jscomp$4$$.create($superClass$$.prototype, {constructor:{configurable:!0, writable:!0, value:$subClass$$}});
}
;function $domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist_toggle$$($token$jscomp$2$$, $opt_force$jscomp$1$$) {
  var $remove$$ = void 0 === $opt_force$jscomp$1$$ ? this.contains($token$jscomp$2$$) : !$opt_force$jscomp$1$$;
  if ($remove$$) {
    return this.remove($token$jscomp$2$$), !1;
  }
  this.add($token$jscomp$2$$);
  return !0;
}
;function $documentContainsPolyfill$$module$src$polyfills$document_contains$$($node$jscomp$7$$) {
  return $node$jscomp$7$$ == this || this.documentElement.contains($node$jscomp$7$$);
}
;var $toString_$$module$src$types$$ = Object.prototype.toString;
function $Log$$module$src$log$$($win$jscomp$16$$, $levelFunc$$, $opt_suffix$$) {
  this.win = $win$jscomp$16$$;
  this.$levelFunc_$ = $levelFunc$$;
  this.$level_$ = this.win.console && this.win.console.log && "0" != $getMode$$module$src$mode$$().log ? this.$levelFunc_$({localDev:!1, development:$getMode$$module$src$mode$$(void 0).development, filter:$getMode$$module$src$mode$$(void 0).filter, minified:!0, lite:$getMode$$module$src$mode$$(void 0).lite, test:!1, log:$getMode$$module$src$mode$$(void 0).log, version:$getMode$$module$src$mode$$(void 0).version, rtvVersion:$getMode$$module$src$mode$$(void 0).rtvVersion, singlePassType:$getMode$$module$src$mode$$(void 0).singlePassType}) : 
  0;
  this.$suffix_$ = $opt_suffix$$ || "";
}
function $JSCompiler_StaticMethods_msg_$$($JSCompiler_StaticMethods_msg_$self$$, $level$jscomp$8$$, $messages$$) {
  if (0 != $JSCompiler_StaticMethods_msg_$self$$.$level_$) {
    var $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.log;
    "ERROR" == $level$jscomp$8$$ ? $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.error || $fn$jscomp$1$$ : "INFO" == $level$jscomp$8$$ ? $fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.info || $fn$jscomp$1$$ : "WARN" == $level$jscomp$8$$ && ($fn$jscomp$1$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.warn || $fn$jscomp$1$$);
    $fn$jscomp$1$$.apply($JSCompiler_StaticMethods_msg_$self$$.win.console, $messages$$);
  }
}
$JSCompiler_prototypeAlias$$ = $Log$$module$src$log$$.prototype;
$JSCompiler_prototypeAlias$$.isEnabled = function() {
  return 0 != this.$level_$;
};
$JSCompiler_prototypeAlias$$.fine = function($tag$jscomp$3$$, $var_args$jscomp$47$$) {
  4 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "FINE", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.info = function($tag$jscomp$4$$, $var_args$jscomp$48$$) {
  3 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "INFO", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.warn = function($tag$jscomp$5$$, $var_args$jscomp$49$$) {
  2 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, "WARN", Array.prototype.slice.call(arguments, 1));
};
$JSCompiler_prototypeAlias$$.$error_$ = function($tag$jscomp$6$$, $var_args$jscomp$50$$) {
  if (1 <= this.$level_$) {
    $JSCompiler_StaticMethods_msg_$$(this, "ERROR", Array.prototype.slice.call(arguments, 1));
  } else {
    var $error$jscomp$3$$ = $createErrorVargs$$module$src$log$$.apply(null, Array.prototype.slice.call(arguments, 1));
    $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$3$$);
    return $error$jscomp$3$$;
  }
};
$JSCompiler_prototypeAlias$$.error = function($tag$jscomp$7$$, $var_args$jscomp$51$$) {
  var $error$jscomp$4$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$4$$ && ($error$jscomp$4$$.name = $tag$jscomp$7$$ || $error$jscomp$4$$.name, self.reportError($error$jscomp$4$$));
};
$JSCompiler_prototypeAlias$$.expectedError = function($unusedTag$$, $var_args$jscomp$52$$) {
  var $error$jscomp$5$$ = this.$error_$.apply(this, arguments);
  $error$jscomp$5$$ && ($error$jscomp$5$$.expected = !0, self.reportError($error$jscomp$5$$));
};
$JSCompiler_prototypeAlias$$.createError = function($var_args$jscomp$53$$) {
  var $error$jscomp$6$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$6$$);
  return $error$jscomp$6$$;
};
$JSCompiler_prototypeAlias$$.createExpectedError = function($var_args$jscomp$54$$) {
  var $error$jscomp$7$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
  $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$7$$);
  $error$jscomp$7$$.expected = !0;
  return $error$jscomp$7$$;
};
$JSCompiler_prototypeAlias$$.assert = function($shouldBeTrueish$$, $opt_message$jscomp$7$$, $var_args$jscomp$55$$) {
  var $firstElement$$;
  if (!$shouldBeTrueish$$) {
    var $splitMessage$$ = ($opt_message$jscomp$7$$ || "Assertion failed").split("%s"), $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$ = $splitMessage$$.shift(), $formatted$$ = $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$, $messageArray$$ = [], $e$jscomp$13_i$jscomp$6$$ = 2;
    for ("" != $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$); 0 < $splitMessage$$.length;) {
      var $nextConstant$$ = $splitMessage$$.shift(), $val$$ = arguments[$e$jscomp$13_i$jscomp$6$$++];
      $val$$ && $val$$.tagName && ($firstElement$$ = $val$$);
      $messageArray$$.push($val$$);
      $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$ = $nextConstant$$.trim();
      "" != $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$);
      $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$ = $val$$;
      $formatted$$ += ($JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$ && 1 == $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$.nodeType ? $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$.tagName.toLowerCase() + ($JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$.id ? "#" + $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$.id : "") : $JSCompiler_val$jscomp$inline_67_JSCompiler_val$jscomp$inline_69_first$jscomp$4$$) + 
      $nextConstant$$;
    }
    $e$jscomp$13_i$jscomp$6$$ = Error($formatted$$);
    $e$jscomp$13_i$jscomp$6$$.fromAssert = !0;
    $e$jscomp$13_i$jscomp$6$$.associatedElement = $firstElement$$;
    $e$jscomp$13_i$jscomp$6$$.messageArray = $messageArray$$;
    $JSCompiler_StaticMethods_prepareError_$$(this, $e$jscomp$13_i$jscomp$6$$);
    self.reportError($e$jscomp$13_i$jscomp$6$$);
    throw $e$jscomp$13_i$jscomp$6$$;
  }
  return $shouldBeTrueish$$;
};
$JSCompiler_prototypeAlias$$.assertElement = function($shouldBeElement$$, $opt_message$jscomp$8$$) {
  this.assert($shouldBeElement$$ && 1 == $shouldBeElement$$.nodeType, ($opt_message$jscomp$8$$ || "Element expected") + ": %s", $shouldBeElement$$);
  return $shouldBeElement$$;
};
$JSCompiler_prototypeAlias$$.assertString = function($shouldBeString$$, $opt_message$jscomp$9$$) {
  this.assert("string" == typeof $shouldBeString$$, ($opt_message$jscomp$9$$ || "String expected") + ": %s", $shouldBeString$$);
  return $shouldBeString$$;
};
$JSCompiler_prototypeAlias$$.assertNumber = function($shouldBeNumber$$, $opt_message$jscomp$10$$) {
  this.assert("number" == typeof $shouldBeNumber$$, ($opt_message$jscomp$10$$ || "Number expected") + ": %s", $shouldBeNumber$$);
  return $shouldBeNumber$$;
};
$JSCompiler_prototypeAlias$$.assertArray = function($shouldBeArray$$, $opt_message$jscomp$11$$) {
  this.assert(Array.isArray($shouldBeArray$$), ($opt_message$jscomp$11$$ || "Array expected") + ": %s", $shouldBeArray$$);
  return $shouldBeArray$$;
};
$JSCompiler_prototypeAlias$$.assertBoolean = function($shouldBeBoolean$$, $opt_message$jscomp$12$$) {
  this.assert(!!$shouldBeBoolean$$ === $shouldBeBoolean$$, ($opt_message$jscomp$12$$ || "Boolean expected") + ": %s", $shouldBeBoolean$$);
  return $shouldBeBoolean$$;
};
$JSCompiler_prototypeAlias$$.assertEnumValue = function($JSCompiler_inline_result$jscomp$23_enumObj$jscomp$1$$, $s$jscomp$3$$, $opt_enumName$$) {
  a: {
    for (var $JSCompiler_k$jscomp$inline_73$$ in $JSCompiler_inline_result$jscomp$23_enumObj$jscomp$1$$) {
      if ($JSCompiler_inline_result$jscomp$23_enumObj$jscomp$1$$[$JSCompiler_k$jscomp$inline_73$$] === $s$jscomp$3$$) {
        $JSCompiler_inline_result$jscomp$23_enumObj$jscomp$1$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$23_enumObj$jscomp$1$$ = !1;
  }
  if ($JSCompiler_inline_result$jscomp$23_enumObj$jscomp$1$$) {
    return $s$jscomp$3$$;
  }
  this.assert(!1, 'Unknown %s value: "%s"', $opt_enumName$$ || "enum", $s$jscomp$3$$);
};
function $JSCompiler_StaticMethods_prepareError_$$($JSCompiler_StaticMethods_prepareError_$self$$, $error$jscomp$8$$) {
  $error$jscomp$8$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$8$$);
  $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ ? $error$jscomp$8$$.message ? -1 == $error$jscomp$8$$.message.indexOf($JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) && ($error$jscomp$8$$.message += $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) : $error$jscomp$8$$.message = $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ : 0 <= $error$jscomp$8$$.message.indexOf("\u200b\u200b\u200b") && ($error$jscomp$8$$.message = $error$jscomp$8$$.message.replace("\u200b\u200b\u200b", 
  ""));
}
function $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$9$$) {
  var $messageProperty$$ = Object.getOwnPropertyDescriptor($error$jscomp$9$$, "message");
  if ($messageProperty$$ && $messageProperty$$.writable) {
    return $error$jscomp$9$$;
  }
  var $stack$$ = $error$jscomp$9$$.stack, $e$jscomp$14$$ = Error($error$jscomp$9$$.message), $prop$jscomp$4$$;
  for ($prop$jscomp$4$$ in $error$jscomp$9$$) {
    $e$jscomp$14$$[$prop$jscomp$4$$] = $error$jscomp$9$$[$prop$jscomp$4$$];
  }
  $e$jscomp$14$$.stack = $stack$$;
  return $e$jscomp$14$$;
}
function $createErrorVargs$$module$src$log$$($var_args$jscomp$56$$) {
  for (var $error$jscomp$10$$ = null, $message$jscomp$27$$ = "", $i$jscomp$7$$ = 0; $i$jscomp$7$$ < arguments.length; $i$jscomp$7$$++) {
    var $arg$jscomp$6$$ = arguments[$i$jscomp$7$$];
    $arg$jscomp$6$$ instanceof Error && !$error$jscomp$10$$ ? $error$jscomp$10$$ = $duplicateErrorIfNecessary$$module$src$log$$($arg$jscomp$6$$) : ($message$jscomp$27$$ && ($message$jscomp$27$$ += " "), $message$jscomp$27$$ += $arg$jscomp$6$$);
  }
  $error$jscomp$10$$ ? $message$jscomp$27$$ && ($error$jscomp$10$$.message = $message$jscomp$27$$ + ": " + $error$jscomp$10$$.message) : $error$jscomp$10$$ = Error($message$jscomp$27$$);
  return $error$jscomp$10$$;
}
self.log = self.log || {user:null, dev:null, userForEmbed:null};
var $logs$$module$src$log$$ = self.log, $logConstructor$$module$src$log$$ = null;
function $user$$module$src$log$$() {
  $logs$$module$src$log$$.user || ($logs$$module$src$log$$.user = $getUserLogger$$module$src$log$$());
  return $logs$$module$src$log$$.user;
}
function $getUserLogger$$module$src$log$$() {
  var $suffix$$ = "\u200b\u200b\u200b";
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return new $logConstructor$$module$src$log$$(self, function($suffix$$) {
    var $mode$jscomp$10$$ = parseInt($suffix$$.log, 10);
    return $suffix$$.development || 1 <= $mode$jscomp$10$$ ? 4 : 2;
  }, $suffix$$);
}
function $dev$$module$src$log$$() {
  if ($logs$$module$src$log$$.dev) {
    return $logs$$module$src$log$$.dev;
  }
  if (!$logConstructor$$module$src$log$$) {
    throw Error("failed to call initLogConstructor");
  }
  return $logs$$module$src$log$$.dev = new $logConstructor$$module$src$log$$(self, function($logNum$jscomp$1_mode$jscomp$11$$) {
    $logNum$jscomp$1_mode$jscomp$11$$ = parseInt($logNum$jscomp$1_mode$jscomp$11$$.log, 10);
    return 3 <= $logNum$jscomp$1_mode$jscomp$11$$ ? 4 : 2 <= $logNum$jscomp$1_mode$jscomp$11$$ ? 3 : 0;
  });
}
;var $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
function $map$$module$src$utils$object$$() {
  var $opt_initial$$, $obj$jscomp$25$$ = Object.create(null);
  $opt_initial$$ && Object.assign($obj$jscomp$25$$, $opt_initial$$);
  return $obj$jscomp$25$$;
}
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$2$$) {
  return $prefix$jscomp$2$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$2$$, 0);
}
;function $parseJson$$module$src$json$$($json$$) {
  return JSON.parse($json$$);
}
;function $utf8Encode$$module$src$utils$bytes$$($JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$) {
  if ("undefined" !== typeof TextEncoder) {
    $JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$ = (new TextEncoder("utf-8")).encode($JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$);
  } else {
    $JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$ = unescape(encodeURIComponent($JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$));
    for (var $JSCompiler_bytes$jscomp$inline_79$$ = new Uint8Array($JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$.length), $JSCompiler_i$jscomp$inline_80$$ = 0; $JSCompiler_i$jscomp$inline_80$$ < $JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$.length; $JSCompiler_i$jscomp$inline_80$$++) {
      $JSCompiler_bytes$jscomp$inline_79$$[$JSCompiler_i$jscomp$inline_80$$] = $JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$.charCodeAt($JSCompiler_i$jscomp$inline_80$$);
    }
    $JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$ = $JSCompiler_bytes$jscomp$inline_79$$;
  }
  return $JSCompiler_str$jscomp$inline_78_JSCompiler_temp$jscomp$27_string$jscomp$7$$;
}
;var $allowedFetchTypes$$module$src$polyfills$fetch$$ = {document:1, text:2}, $allowedMethods$$module$src$polyfills$fetch$$ = ["GET", "POST"];
function $fetchPolyfill$$module$src$polyfills$fetch$$($input$jscomp$9$$, $init$jscomp$1$$) {
  $init$jscomp$1$$ = void 0 === $init$jscomp$1$$ ? {} : $init$jscomp$1$$;
  return new Promise(function($resolve$jscomp$7$$, $reject$jscomp$3$$) {
    var $requestMethod$$ = $normalizeMethod$$module$src$polyfills$fetch$$($init$jscomp$1$$.method || "GET"), $xhr$$ = $createXhrRequest$$module$src$polyfills$fetch$$($requestMethod$$, $input$jscomp$9$$);
    "include" == $init$jscomp$1$$.credentials && ($xhr$$.withCredentials = !0);
    $init$jscomp$1$$.responseType in $allowedFetchTypes$$module$src$polyfills$fetch$$ && ($xhr$$.responseType = $init$jscomp$1$$.responseType);
    $init$jscomp$1$$.headers && Object.keys($init$jscomp$1$$.headers).forEach(function($input$jscomp$9$$) {
      $xhr$$.setRequestHeader($input$jscomp$9$$, $init$jscomp$1$$.headers[$input$jscomp$9$$]);
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
    "POST" == $requestMethod$$ ? $xhr$$.send($init$jscomp$1$$.body) : $xhr$$.send();
  });
}
function $createXhrRequest$$module$src$polyfills$fetch$$($method$jscomp$1$$, $url$jscomp$22$$) {
  var $xhr$jscomp$1$$ = new XMLHttpRequest;
  if ("withCredentials" in $xhr$jscomp$1$$) {
    $xhr$jscomp$1$$.open($method$jscomp$1$$, $url$jscomp$22$$, !0);
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
}
$FetchResponse$$module$src$polyfills$fetch$$.prototype.clone = function() {
  return new $FetchResponse$$module$src$polyfills$fetch$$(this.$xhr_$);
};
function $JSCompiler_StaticMethods_drainText_$$($JSCompiler_StaticMethods_drainText_$self$$) {
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
  $allowedMethods$$module$src$polyfills$fetch$$.includes($method$jscomp$2$$);
  return $method$jscomp$2$$;
}
function $FetchResponseHeaders$$module$src$polyfills$fetch$$($xhr$jscomp$3$$) {
  this.$xhr_$ = $xhr$jscomp$3$$;
}
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.get = function($name$jscomp$77$$) {
  return this.$xhr_$.getResponseHeader($name$jscomp$77$$);
};
$FetchResponseHeaders$$module$src$polyfills$fetch$$.prototype.has = function($name$jscomp$78$$) {
  return null != this.$xhr_$.getResponseHeader($name$jscomp$78$$);
};
function $Response$$module$src$polyfills$fetch$$($body$jscomp$1_data$jscomp$33$$, $init$jscomp$2$$) {
  $init$jscomp$2$$ = void 0 === $init$jscomp$2$$ ? {} : $init$jscomp$2$$;
  var $lowercasedHeaders$$ = $map$$module$src$utils$object$$();
  $body$jscomp$1_data$jscomp$33$$ = Object.assign({status:200, statusText:"OK", responseText:$body$jscomp$1_data$jscomp$33$$ ? String($body$jscomp$1_data$jscomp$33$$) : "", getResponseHeader:function($body$jscomp$1_data$jscomp$33$$) {
    var $init$jscomp$2$$ = String($body$jscomp$1_data$jscomp$33$$).toLowerCase();
    return $hasOwn_$$module$src$utils$object$$.call($lowercasedHeaders$$, $init$jscomp$2$$) ? $lowercasedHeaders$$[$init$jscomp$2$$] : null;
  }}, $init$jscomp$2$$);
  $body$jscomp$1_data$jscomp$33$$.status = void 0 === $init$jscomp$2$$.status ? 200 : parseInt($init$jscomp$2$$.status, 10);
  if (Array.isArray($init$jscomp$2$$.headers)) {
    $init$jscomp$2$$.headers.forEach(function($body$jscomp$1_data$jscomp$33$$) {
      var $init$jscomp$2$$ = $body$jscomp$1_data$jscomp$33$$[1];
      $lowercasedHeaders$$[String($body$jscomp$1_data$jscomp$33$$[0]).toLowerCase()] = String($init$jscomp$2$$);
    });
  } else {
    if ("[object Object]" === $toString_$$module$src$types$$.call($init$jscomp$2$$.headers)) {
      for (var $key$jscomp$42$$ in $init$jscomp$2$$.headers) {
        $lowercasedHeaders$$[String($key$jscomp$42$$).toLowerCase()] = String($init$jscomp$2$$.headers[$key$jscomp$42$$]);
      }
    }
  }
  $init$jscomp$2$$.statusText && ($body$jscomp$1_data$jscomp$33$$.statusText = String($init$jscomp$2$$.statusText));
  $FetchResponse$$module$src$polyfills$fetch$$.call(this, $body$jscomp$1_data$jscomp$33$$);
}
var $JSCompiler_parentCtor$jscomp$inline_84$$ = $FetchResponse$$module$src$polyfills$fetch$$;
$Response$$module$src$polyfills$fetch$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_84$$.prototype);
$Response$$module$src$polyfills$fetch$$.prototype.constructor = $Response$$module$src$polyfills$fetch$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($Response$$module$src$polyfills$fetch$$, $JSCompiler_parentCtor$jscomp$inline_84$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_85$$ in $JSCompiler_parentCtor$jscomp$inline_84$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_85$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_86$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_84$$, $JSCompiler_p$jscomp$inline_85$$);
        $JSCompiler_descriptor$jscomp$inline_86$$ && Object.defineProperty($Response$$module$src$polyfills$fetch$$, $JSCompiler_p$jscomp$inline_85$$, $JSCompiler_descriptor$jscomp$inline_86$$);
      } else {
        $Response$$module$src$polyfills$fetch$$[$JSCompiler_p$jscomp$inline_85$$] = $JSCompiler_parentCtor$jscomp$inline_84$$[$JSCompiler_p$jscomp$inline_85$$];
      }
    }
  }
}
$Response$$module$src$polyfills$fetch$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_84$$.prototype;
function $sign$$module$src$polyfills$math_sign$$($x$jscomp$75$$) {
  return ($x$jscomp$75$$ = Number($x$jscomp$75$$)) ? 0 < $x$jscomp$75$$ ? 1 : -1 : $x$jscomp$75$$;
}
;var $hasOwnProperty$$module$src$polyfills$object_assign$$ = Object.prototype.hasOwnProperty;
function $assign$$module$src$polyfills$object_assign$$($target$jscomp$58$$, $var_args$jscomp$58$$) {
  if (null == $target$jscomp$58$$) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  for (var $output$jscomp$2$$ = Object($target$jscomp$58$$), $i$jscomp$17$$ = 1; $i$jscomp$17$$ < arguments.length; $i$jscomp$17$$++) {
    var $source$jscomp$13$$ = arguments[$i$jscomp$17$$];
    if (null != $source$jscomp$13$$) {
      for (var $key$jscomp$43$$ in $source$jscomp$13$$) {
        $hasOwnProperty$$module$src$polyfills$object_assign$$.call($source$jscomp$13$$, $key$jscomp$43$$) && ($output$jscomp$2$$[$key$jscomp$43$$] = $source$jscomp$13$$[$key$jscomp$43$$]);
      }
    }
  }
  return $output$jscomp$2$$;
}
;function $values$$module$src$polyfills$object_values$$($target$jscomp$59$$) {
  return Object.keys($target$jscomp$59$$).map(function($k$jscomp$3$$) {
    return $target$jscomp$59$$[$k$jscomp$3$$];
  });
}
;function $module$node_modules$promise_pjs$promise$default$$($resolver$jscomp$1$$) {
  if (!(this instanceof $module$node_modules$promise_pjs$promise$default$$)) {
    throw new TypeError("Constructor Promise requires `new`");
  }
  if (!$isFunction$$module$node_modules$promise_pjs$promise$$($resolver$jscomp$1$$)) {
    throw new TypeError("Must pass resolver function");
  }
  this._state = $PendingPromise$$module$node_modules$promise_pjs$promise$$;
  this._value = [];
  this._isChainEnd = !0;
  $doResolve$$module$node_modules$promise_pjs$promise$$(this, $adopter$$module$node_modules$promise_pjs$promise$$(this, $FulfilledPromise$$module$node_modules$promise_pjs$promise$$), $adopter$$module$node_modules$promise_pjs$promise$$(this, $RejectedPromise$$module$node_modules$promise_pjs$promise$$), {then:$resolver$jscomp$1$$});
}
$module$node_modules$promise_pjs$promise$default$$.prototype.then = function($onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$) {
  $onFulfilled$jscomp$1$$ = $isFunction$$module$node_modules$promise_pjs$promise$$($onFulfilled$jscomp$1$$) ? $onFulfilled$jscomp$1$$ : void 0;
  $onRejected$jscomp$2$$ = $isFunction$$module$node_modules$promise_pjs$promise$$($onRejected$jscomp$2$$) ? $onRejected$jscomp$2$$ : void 0;
  if ($onFulfilled$jscomp$1$$ || $onRejected$jscomp$2$$) {
    this._isChainEnd = !1;
  }
  return this._state(this._value, $onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$);
};
$module$node_modules$promise_pjs$promise$default$$.prototype.catch = function($onRejected$jscomp$3$$) {
  return this.then(void 0, $onRejected$jscomp$3$$);
};
function $module$node_modules$promise_pjs$promise$default$resolve$$($value$jscomp$93$$) {
  var $Constructor$$ = this;
  return $value$jscomp$93$$ === Object($value$jscomp$93$$) && $value$jscomp$93$$ instanceof this ? $value$jscomp$93$$ : new $Constructor$$(function($Constructor$$) {
    $Constructor$$($value$jscomp$93$$);
  });
}
function $module$node_modules$promise_pjs$promise$default$reject$$($reason$jscomp$6$$) {
  return new this(function($_$$, $reject$jscomp$4$$) {
    $reject$jscomp$4$$($reason$jscomp$6$$);
  });
}
function $module$node_modules$promise_pjs$promise$default$all$$($promises$jscomp$1$$) {
  var $Constructor$jscomp$2$$ = this;
  return new $Constructor$jscomp$2$$(function($resolve$jscomp$9$$, $reject$jscomp$5$$) {
    var $length$jscomp$19$$ = $promises$jscomp$1$$.length, $values$jscomp$6$$ = Array($length$jscomp$19$$);
    if (0 === $length$jscomp$19$$) {
      return $resolve$jscomp$9$$($values$jscomp$6$$);
    }
    $each$$module$node_modules$promise_pjs$promise$$($promises$jscomp$1$$, function($promises$jscomp$1$$, $index$jscomp$55$$) {
      $Constructor$jscomp$2$$.resolve($promises$jscomp$1$$).then(function($promises$jscomp$1$$) {
        $values$jscomp$6$$[$index$jscomp$55$$] = $promises$jscomp$1$$;
        0 === --$length$jscomp$19$$ && $resolve$jscomp$9$$($values$jscomp$6$$);
      }, $reject$jscomp$5$$);
    });
  });
}
function $module$node_modules$promise_pjs$promise$default$race$$($promises$jscomp$2$$) {
  var $Constructor$jscomp$3$$ = this;
  return new $Constructor$jscomp$3$$(function($resolve$jscomp$10$$, $reject$jscomp$6$$) {
    for (var $i$jscomp$18$$ = 0; $i$jscomp$18$$ < $promises$jscomp$2$$.length; $i$jscomp$18$$++) {
      $Constructor$jscomp$3$$.resolve($promises$jscomp$2$$[$i$jscomp$18$$]).then($resolve$jscomp$10$$, $reject$jscomp$6$$);
    }
  });
}
function $FulfilledPromise$$module$node_modules$promise_pjs$promise$$($value$jscomp$95$$, $JSCompiler_promise$jscomp$inline_91_onFulfilled$jscomp$2$$, $unused$jscomp$1$$, $deferred$jscomp$3$$) {
  if (!$JSCompiler_promise$jscomp$inline_91_onFulfilled$jscomp$2$$) {
    return $deferred$jscomp$3$$ && ($JSCompiler_promise$jscomp$inline_91_onFulfilled$jscomp$2$$ = $deferred$jscomp$3$$.promise, $JSCompiler_promise$jscomp$inline_91_onFulfilled$jscomp$2$$._state = $FulfilledPromise$$module$node_modules$promise_pjs$promise$$, $JSCompiler_promise$jscomp$inline_91_onFulfilled$jscomp$2$$._value = $value$jscomp$95$$), this;
  }
  $deferred$jscomp$3$$ || ($deferred$jscomp$3$$ = new $Deferred$$module$node_modules$promise_pjs$promise$$(this.constructor));
  $defer$$module$node_modules$promise_pjs$promise$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise$$($deferred$jscomp$3$$, $JSCompiler_promise$jscomp$inline_91_onFulfilled$jscomp$2$$, $value$jscomp$95$$));
  return $deferred$jscomp$3$$.promise;
}
function $RejectedPromise$$module$node_modules$promise_pjs$promise$$($reason$jscomp$8$$, $JSCompiler_promise$jscomp$inline_96_unused$jscomp$2$$, $onRejected$jscomp$4$$, $deferred$jscomp$4$$) {
  if (!$onRejected$jscomp$4$$) {
    return $deferred$jscomp$4$$ && ($JSCompiler_promise$jscomp$inline_96_unused$jscomp$2$$ = $deferred$jscomp$4$$.promise, $JSCompiler_promise$jscomp$inline_96_unused$jscomp$2$$._state = $RejectedPromise$$module$node_modules$promise_pjs$promise$$, $JSCompiler_promise$jscomp$inline_96_unused$jscomp$2$$._value = $reason$jscomp$8$$), this;
  }
  $deferred$jscomp$4$$ || ($deferred$jscomp$4$$ = new $Deferred$$module$node_modules$promise_pjs$promise$$(this.constructor));
  $defer$$module$node_modules$promise_pjs$promise$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise$$($deferred$jscomp$4$$, $onRejected$jscomp$4$$, $reason$jscomp$8$$));
  return $deferred$jscomp$4$$.promise;
}
function $PendingPromise$$module$node_modules$promise_pjs$promise$$($queue$jscomp$2$$, $onFulfilled$jscomp$3$$, $onRejected$jscomp$5$$, $deferred$jscomp$5$$) {
  if (!$deferred$jscomp$5$$) {
    if (!$onFulfilled$jscomp$3$$ && !$onRejected$jscomp$5$$) {
      return this;
    }
    $deferred$jscomp$5$$ = new $Deferred$$module$node_modules$promise_pjs$promise$$(this.constructor);
  }
  $queue$jscomp$2$$.push({deferred:$deferred$jscomp$5$$, onFulfilled:$onFulfilled$jscomp$3$$ || $deferred$jscomp$5$$.resolve, onRejected:$onRejected$jscomp$5$$ || $deferred$jscomp$5$$.reject});
  return $deferred$jscomp$5$$.promise;
}
function $Deferred$$module$node_modules$promise_pjs$promise$$($Promise$jscomp$2$$) {
  var $deferred$jscomp$6$$ = this;
  this.promise = new $Promise$jscomp$2$$(function($Promise$jscomp$2$$, $reject$jscomp$7$$) {
    $deferred$jscomp$6$$.resolve = $Promise$jscomp$2$$;
    $deferred$jscomp$6$$.reject = $reject$jscomp$7$$;
  });
  return $deferred$jscomp$6$$;
}
function $adopt$$module$node_modules$promise_pjs$promise$$($promise$jscomp$8$$, $state$$, $value$jscomp$96$$, $adoptee$$) {
  var $queue$jscomp$3$$ = $promise$jscomp$8$$._value;
  $promise$jscomp$8$$._state = $state$$;
  $promise$jscomp$8$$._value = $value$jscomp$96$$;
  $adoptee$$ && $state$$ === $PendingPromise$$module$node_modules$promise_pjs$promise$$ && $adoptee$$._state($value$jscomp$96$$, void 0, void 0, {promise:$promise$jscomp$8$$, resolve:void 0, reject:void 0});
  for (var $i$jscomp$19$$ = 0; $i$jscomp$19$$ < $queue$jscomp$3$$.length; $i$jscomp$19$$++) {
    var $next$$ = $queue$jscomp$3$$[$i$jscomp$19$$];
    $promise$jscomp$8$$._state($value$jscomp$96$$, $next$$.onFulfilled, $next$$.onRejected, $next$$.deferred);
  }
  $queue$jscomp$3$$.length = 0;
  $state$$ === $RejectedPromise$$module$node_modules$promise_pjs$promise$$ && $promise$jscomp$8$$._isChainEnd && setTimeout(function() {
    if ($promise$jscomp$8$$._isChainEnd) {
      throw $value$jscomp$96$$;
    }
  }, 0);
}
function $adopter$$module$node_modules$promise_pjs$promise$$($promise$jscomp$9$$, $state$jscomp$1$$) {
  return function($value$jscomp$97$$) {
    $adopt$$module$node_modules$promise_pjs$promise$$($promise$jscomp$9$$, $state$jscomp$1$$, $value$jscomp$97$$);
  };
}
function $noop$$module$node_modules$promise_pjs$promise$$() {
}
function $isFunction$$module$node_modules$promise_pjs$promise$$($fn$jscomp$3$$) {
  return "function" === typeof $fn$jscomp$3$$;
}
function $each$$module$node_modules$promise_pjs$promise$$($collection$$, $iterator$jscomp$6$$) {
  for (var $i$jscomp$20$$ = 0; $i$jscomp$20$$ < $collection$$.length; $i$jscomp$20$$++) {
    $iterator$jscomp$6$$($collection$$[$i$jscomp$20$$], $i$jscomp$20$$);
  }
}
function $tryCatchDeferred$$module$node_modules$promise_pjs$promise$$($deferred$jscomp$8$$, $fn$jscomp$4$$, $arg$jscomp$7$$) {
  var $promise$jscomp$11$$ = $deferred$jscomp$8$$.promise, $resolve$jscomp$12$$ = $deferred$jscomp$8$$.resolve, $reject$jscomp$8$$ = $deferred$jscomp$8$$.reject;
  return function() {
    try {
      var $deferred$jscomp$8$$ = $fn$jscomp$4$$($arg$jscomp$7$$);
      $doResolve$$module$node_modules$promise_pjs$promise$$($promise$jscomp$11$$, $resolve$jscomp$12$$, $reject$jscomp$8$$, $deferred$jscomp$8$$, $deferred$jscomp$8$$);
    } catch ($e$jscomp$19$$) {
      $reject$jscomp$8$$($e$jscomp$19$$);
    }
  };
}
var $defer$$module$node_modules$promise_pjs$promise$$ = function() {
  function $flush$$() {
    for (var $flush$$ = 0; $flush$$ < $length$jscomp$20$$; $flush$$++) {
      var $defer$$ = $queue$jscomp$4$$[$flush$$];
      $queue$jscomp$4$$[$flush$$] = null;
      $defer$$();
    }
    $length$jscomp$20$$ = 0;
  }
  function $defer$$($flush$$) {
    0 === $length$jscomp$20$$ && $scheduleFlush$$();
    $queue$jscomp$4$$[$length$jscomp$20$$++] = $flush$$;
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
  return $defer$$;
}();
function $doResolve$$module$node_modules$promise_pjs$promise$$($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $value$jscomp$99$$, $context$$) {
  var $_reject$$ = $reject$jscomp$9$$, $then$$;
  try {
    if ($value$jscomp$99$$ === $promise$jscomp$12$$) {
      throw new TypeError("Cannot fulfill promise with itself");
    }
    var $isObj$$ = $value$jscomp$99$$ === Object($value$jscomp$99$$);
    if ($isObj$$ && $value$jscomp$99$$ instanceof $promise$jscomp$12$$.constructor) {
      $adopt$$module$node_modules$promise_pjs$promise$$($promise$jscomp$12$$, $value$jscomp$99$$._state, $value$jscomp$99$$._value, $value$jscomp$99$$);
    } else {
      if ($isObj$$ && ($then$$ = $value$jscomp$99$$.then) && $isFunction$$module$node_modules$promise_pjs$promise$$($then$$)) {
        var $_resolve$$ = function($value$jscomp$99$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise$$;
          $doResolve$$module$node_modules$promise_pjs$promise$$($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $value$jscomp$99$$, $value$jscomp$99$$);
        };
        $_reject$$ = function($promise$jscomp$12$$) {
          $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise$$;
          $reject$jscomp$9$$($promise$jscomp$12$$);
        };
        $then$$.call($context$$, function($promise$jscomp$12$$) {
          $_resolve$$($promise$jscomp$12$$);
        }, function($promise$jscomp$12$$) {
          $_reject$$($promise$jscomp$12$$);
        });
      } else {
        $resolve$jscomp$13$$($value$jscomp$99$$);
      }
    }
  } catch ($e$jscomp$20$$) {
    $_reject$$($e$jscomp$20$$);
  }
}
;/*
 Copyright (C) 2014-2016 by Andrea Giammarchi - @WebReflection

Use of this source code is governed by a MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.

*/
function $installCustomElements$$module$node_modules$document_register_element$build$document_register_element_patched$$() {
  function $secondArgument$$($secondArgument$$) {
    return $secondArgument$$.toLowerCase();
  }
  var $window$jscomp$1$$ = self, $polyfill$$ = "auto";
  function $ASAP$$() {
    var $secondArgument$$ = $asapQueue$$.splice(0, $asapQueue$$.length);
    for ($asapTimer$$ = 0; $secondArgument$$.length;) {
      $secondArgument$$.shift().call(null, $secondArgument$$.shift());
    }
  }
  function $loopAndVerify$$($secondArgument$$, $window$jscomp$1$$) {
    for (var $polyfill$$ = 0, $ASAP$$ = $secondArgument$$.length; $polyfill$$ < $ASAP$$; $polyfill$$++) {
      $verifyAndSetupAndAction$$($secondArgument$$[$polyfill$$], $window$jscomp$1$$);
    }
  }
  function $loopAndSetup$$($secondArgument$$) {
    for (var $window$jscomp$1$$ = 0, $polyfill$$ = $secondArgument$$.length, $ASAP$$; $window$jscomp$1$$ < $polyfill$$; $window$jscomp$1$$++) {
      $ASAP$$ = $secondArgument$$[$window$jscomp$1$$], $patch$$($ASAP$$, $protos$$[$getTypeIndex$$($ASAP$$)]);
    }
  }
  function $executeAction$$($secondArgument$$) {
    return function($window$jscomp$1$$) {
      $isValidNode$$($window$jscomp$1$$) && ($verifyAndSetupAndAction$$($window$jscomp$1$$, $secondArgument$$), $query$jscomp$10$$.length && $loopAndVerify$$($window$jscomp$1$$.querySelectorAll($query$jscomp$10$$), $secondArgument$$));
    };
  }
  function $getTypeIndex$$($secondArgument$$) {
    var $window$jscomp$1$$ = $getAttribute$$.call($secondArgument$$, "is"), $polyfill$$ = $secondArgument$$.nodeName.toUpperCase();
    $secondArgument$$ = $indexOf$$.call($types$$, $window$jscomp$1$$ ? $PREFIX_IS$$ + $window$jscomp$1$$.toUpperCase() : $PREFIX_TAG$$ + $polyfill$$);
    return $window$jscomp$1$$ && -1 < $secondArgument$$ && !$isInQSA$$($polyfill$$, $window$jscomp$1$$) ? -1 : $secondArgument$$;
  }
  function $isInQSA$$($secondArgument$$, $window$jscomp$1$$) {
    return -1 < $query$jscomp$10$$.indexOf($secondArgument$$ + '[is="' + $window$jscomp$1$$ + '"]');
  }
  function $onDOMAttrModified$$($secondArgument$$) {
    var $window$jscomp$1$$ = $secondArgument$$.currentTarget, $polyfill$$ = $secondArgument$$.attrChange, $ASAP$$ = $secondArgument$$.attrName, $loopAndVerify$$ = $secondArgument$$.target, $loopAndSetup$$ = $secondArgument$$[$ADDITION$$] || 2, $executeAction$$ = $secondArgument$$[$REMOVAL$$] || 3;
    if ($notFromInnerHTMLHelper$$ && (!$loopAndVerify$$ || $loopAndVerify$$ === $window$jscomp$1$$) && $window$jscomp$1$$[$ATTRIBUTE_CHANGED_CALLBACK$$] && "style" !== $ASAP$$ && ($secondArgument$$.prevValue !== $secondArgument$$.newValue || "" === $secondArgument$$.newValue && ($polyfill$$ === $loopAndSetup$$ || $polyfill$$ === $executeAction$$))) {
      $window$jscomp$1$$[$ATTRIBUTE_CHANGED_CALLBACK$$]($ASAP$$, $polyfill$$ === $loopAndSetup$$ ? null : $secondArgument$$.prevValue, $polyfill$$ === $executeAction$$ ? null : $secondArgument$$.newValue);
    }
  }
  function $onDOMNode$$($secondArgument$$) {
    var $window$jscomp$1$$ = $executeAction$$($secondArgument$$);
    return function($secondArgument$$) {
      $asapQueue$$.push($window$jscomp$1$$, $secondArgument$$.target);
      $asapTimer$$ && clearTimeout($asapTimer$$);
      $asapTimer$$ = setTimeout($ASAP$$, 1);
    };
  }
  function $onReadyStateChange$$($secondArgument$$) {
    $dropDomContentLoaded$$ && ($dropDomContentLoaded$$ = !1, $secondArgument$$.currentTarget.removeEventListener($DOM_CONTENT_LOADED$$, $onReadyStateChange$$));
    $query$jscomp$10$$.length && $loopAndVerify$$(($secondArgument$$.target || $document$jscomp$2$$).querySelectorAll($query$jscomp$10$$), $secondArgument$$.detail === $DETACHED$$ ? $DETACHED$$ : $ATTACHED$$);
    $IE8$$ && $purge$$();
  }
  function $patchedSetAttribute$$($secondArgument$$, $window$jscomp$1$$) {
    $setAttribute$$.call(this, $secondArgument$$, $window$jscomp$1$$);
    $onSubtreeModified$$.call(this, {target:this});
  }
  function $setupNode$$($secondArgument$$, $window$jscomp$1$$) {
    $setPrototype$$($secondArgument$$, $window$jscomp$1$$);
    $observer$jscomp$1$$ ? $observer$jscomp$1$$.observe($secondArgument$$, $attributesObserver$$) : ($doesNotSupportDOMAttrModified$$ && ($secondArgument$$.setAttribute = $patchedSetAttribute$$, $secondArgument$$[$EXPANDO_UID$$] = $getAttributesMirror$$($secondArgument$$), $secondArgument$$[$ADD_EVENT_LISTENER$$]($DOM_SUBTREE_MODIFIED$$, $onSubtreeModified$$)), $secondArgument$$[$ADD_EVENT_LISTENER$$]($DOM_ATTR_MODIFIED$$, $onDOMAttrModified$$));
    $secondArgument$$[$CREATED_CALLBACK$$] && $notFromInnerHTMLHelper$$ && ($secondArgument$$.created = !0, $secondArgument$$[$CREATED_CALLBACK$$](), $secondArgument$$.created = !1);
  }
  function $purge$$() {
    for (var $secondArgument$$, $window$jscomp$1$$ = 0, $polyfill$$ = $targets$$.length; $window$jscomp$1$$ < $polyfill$$; $window$jscomp$1$$++) {
      $secondArgument$$ = $targets$$[$window$jscomp$1$$], $documentElement$$.contains($secondArgument$$) || ($polyfill$$--, $targets$$.splice($window$jscomp$1$$--, 1), $verifyAndSetupAndAction$$($secondArgument$$, $DETACHED$$));
    }
  }
  function $throwTypeError$$($secondArgument$$) {
    throw Error("A " + $secondArgument$$ + " type is already registered");
  }
  function $verifyAndSetupAndAction$$($secondArgument$$, $window$jscomp$1$$) {
    var $polyfill$$, $ASAP$$ = $getTypeIndex$$($secondArgument$$);
    -1 < $ASAP$$ && ($patchIfNotAlready$$($secondArgument$$, $protos$$[$ASAP$$]), $ASAP$$ = 0, $window$jscomp$1$$ !== $ATTACHED$$ || $secondArgument$$[$ATTACHED$$] ? $window$jscomp$1$$ !== $DETACHED$$ || $secondArgument$$[$DETACHED$$] || ($secondArgument$$[$ATTACHED$$] = !1, $secondArgument$$[$DETACHED$$] = !0, $ASAP$$ = 1) : ($secondArgument$$[$DETACHED$$] = !1, $secondArgument$$[$ATTACHED$$] = !0, $ASAP$$ = 1, $IE8$$ && 0 > $indexOf$$.call($targets$$, $secondArgument$$) && $targets$$.push($secondArgument$$)), 
    $ASAP$$ && ($polyfill$$ = $secondArgument$$[$window$jscomp$1$$ + $CALLBACK$$]) && $polyfill$$.call($secondArgument$$));
  }
  function $CustomElementRegistry$jscomp$1$$() {
  }
  function $CERDefine$$($window$jscomp$1$$, $polyfill$$, $ASAP$$) {
    $ASAP$$ = $ASAP$$ && $ASAP$$[$EXTENDS$$] || "";
    var $loopAndVerify$$ = $polyfill$$.prototype, $loopAndSetup$$ = $create$$($loopAndVerify$$), $executeAction$$ = $polyfill$$.observedAttributes || $empty$$, $Class$$ = {prototype:$loopAndSetup$$};
    $safeProperty$$($loopAndSetup$$, $CREATED_CALLBACK$$, {value:function() {
      if ($justCreated$$) {
        $justCreated$$ = !1;
      } else {
        if (!this[$DRECEV1$$]) {
          this[$DRECEV1$$] = !0;
          new $polyfill$$(this);
          $loopAndVerify$$[$CREATED_CALLBACK$$] && $loopAndVerify$$[$CREATED_CALLBACK$$].call(this);
          var $secondArgument$$ = $constructors$$[$nodeNames$$.get($polyfill$$)];
          (!$usableCustomElements$$ || 1 < $secondArgument$$.create.length) && $notifyAttributes$$(this);
        }
      }
    }});
    $safeProperty$$($loopAndSetup$$, $ATTRIBUTE_CHANGED_CALLBACK$$, {value:function($secondArgument$$) {
      -1 < $indexOf$$.call($executeAction$$, $secondArgument$$) && $loopAndVerify$$[$ATTRIBUTE_CHANGED_CALLBACK$$].apply(this, arguments);
    }});
    $loopAndVerify$$[$CONNECTED_CALLBACK$$] && $safeProperty$$($loopAndSetup$$, $ATTACHED_CALLBACK$$, {value:$loopAndVerify$$[$CONNECTED_CALLBACK$$]});
    $loopAndVerify$$[$DISCONNECTED_CALLBACK$$] && $safeProperty$$($loopAndSetup$$, $DETACHED_CALLBACK$$, {value:$loopAndVerify$$[$DISCONNECTED_CALLBACK$$]});
    $ASAP$$ && ($Class$$[$EXTENDS$$] = $ASAP$$);
    $window$jscomp$1$$ = $window$jscomp$1$$.toUpperCase();
    $constructors$$[$window$jscomp$1$$] = {constructor:$polyfill$$, create:$ASAP$$ ? [$ASAP$$, $secondArgument$$($window$jscomp$1$$)] : [$window$jscomp$1$$]};
    $nodeNames$$.set($polyfill$$, $window$jscomp$1$$);
    $document$jscomp$2$$[$REGISTER_ELEMENT$$]($window$jscomp$1$$.toLowerCase(), $Class$$);
    $whenDefined$$($window$jscomp$1$$);
    $waitingList$$[$window$jscomp$1$$].r();
  }
  function $get$$($secondArgument$$) {
    return ($secondArgument$$ = $constructors$$[$secondArgument$$.toUpperCase()]) && $secondArgument$$.constructor;
  }
  function $getIs$$($secondArgument$$) {
    return "string" === typeof $secondArgument$$ ? $secondArgument$$ : $secondArgument$$ && $secondArgument$$.is || "";
  }
  function $notifyAttributes$$($secondArgument$$) {
    for (var $window$jscomp$1$$ = $secondArgument$$[$ATTRIBUTE_CHANGED_CALLBACK$$], $polyfill$$ = $window$jscomp$1$$ ? $secondArgument$$.attributes : $empty$$, $ASAP$$ = $polyfill$$.length, $loopAndVerify$$; $ASAP$$--;) {
      $loopAndVerify$$ = $polyfill$$[$ASAP$$], $window$jscomp$1$$.call($secondArgument$$, $loopAndVerify$$.name || $loopAndVerify$$.nodeName, null, $loopAndVerify$$.value || $loopAndVerify$$.nodeValue);
    }
  }
  function $whenDefined$$($secondArgument$$) {
    $secondArgument$$ = $secondArgument$$.toUpperCase();
    $secondArgument$$ in $waitingList$$ || ($waitingList$$[$secondArgument$$] = {}, $waitingList$$[$secondArgument$$].p = new $Promise$jscomp$3$$(function($window$jscomp$1$$) {
      $waitingList$$[$secondArgument$$].r = $window$jscomp$1$$;
    }));
    return $waitingList$$[$secondArgument$$].p;
  }
  function $polyfillV1$$() {
    function $polyfill$$($secondArgument$$) {
      var $polyfill$$ = $window$jscomp$1$$[$secondArgument$$];
      if ($polyfill$$) {
        $window$jscomp$1$$[$secondArgument$$] = function($secondArgument$$) {
          var $window$jscomp$1$$;
          $secondArgument$$ || ($secondArgument$$ = this);
          $secondArgument$$[$DRECEV1$$] || ($justCreated$$ = !0, $secondArgument$$ = $constructors$$[$nodeNames$$.get($secondArgument$$.constructor)], $secondArgument$$ = ($window$jscomp$1$$ = $usableCustomElements$$ && 1 === $secondArgument$$.create.length) ? Reflect.construct($polyfill$$, $empty$$, $secondArgument$$.constructor) : $document$jscomp$2$$.createElement.apply($document$jscomp$2$$, $secondArgument$$.create), $secondArgument$$[$DRECEV1$$] = !0, $justCreated$$ = !1, $window$jscomp$1$$ || 
          $notifyAttributes$$($secondArgument$$));
          return $secondArgument$$;
        };
        $window$jscomp$1$$[$secondArgument$$].prototype = $polyfill$$.prototype;
        try {
          $polyfill$$.prototype.constructor = $window$jscomp$1$$[$secondArgument$$];
        } catch ($WebKit$$) {
          $defineProperty$$($polyfill$$, $DRECEV1$$, {value:$window$jscomp$1$$[$secondArgument$$]});
        }
      }
    }
    $customElements$jscomp$3$$ && delete $window$jscomp$1$$.customElements;
    $defineProperty$$($window$jscomp$1$$, "customElements", {configurable:!0, value:new $CustomElementRegistry$jscomp$1$$});
    $defineProperty$$($window$jscomp$1$$, "CustomElementRegistry", {configurable:!0, value:$CustomElementRegistry$jscomp$1$$});
    for (var $ASAP$$ = $htmlClass$$.get(/^HTML[A-Z]*[a-z]/), $loopAndVerify$$ = $ASAP$$.length; $loopAndVerify$$--; $polyfill$$($ASAP$$[$loopAndVerify$$])) {
    }
    $document$jscomp$2$$.createElement = function($window$jscomp$1$$, $polyfill$$) {
      return ($polyfill$$ = $getIs$$($polyfill$$)) ? $patchedCreateElement$$.call(this, $window$jscomp$1$$, $secondArgument$$($polyfill$$)) : $patchedCreateElement$$.call(this, $window$jscomp$1$$);
    };
    $V0$$ || ($justSetup$$ = !0, $document$jscomp$2$$[$REGISTER_ELEMENT$$](""));
  }
  var $document$jscomp$2$$ = $window$jscomp$1$$.document, $Object$jscomp$5$$ = $window$jscomp$1$$.Object, $htmlClass$$ = function($secondArgument$$) {
    function $window$jscomp$1$$($secondArgument$$, $window$jscomp$1$$) {
      $window$jscomp$1$$ = $window$jscomp$1$$.toLowerCase();
      $window$jscomp$1$$ in $loopAndVerify$$ || ($loopAndVerify$$[$secondArgument$$] = ($loopAndVerify$$[$secondArgument$$] || []).concat($window$jscomp$1$$), $loopAndVerify$$[$window$jscomp$1$$] = $loopAndVerify$$[$window$jscomp$1$$.toUpperCase()] = $secondArgument$$);
    }
    function $polyfill$$($secondArgument$$) {
      var $window$jscomp$1$$ = [], $polyfill$$;
      for ($polyfill$$ in $loopAndVerify$$) {
        $secondArgument$$.test($polyfill$$) && $window$jscomp$1$$.push($polyfill$$);
      }
      return $window$jscomp$1$$;
    }
    var $ASAP$$ = /^[A-Z]+[a-z]/, $loopAndVerify$$ = ($Object$jscomp$5$$.create || $Object$jscomp$5$$)(null), $loopAndSetup$$ = {}, $executeAction$$, $getTypeIndex$$, $isInQSA$$;
    for ($getTypeIndex$$ in $secondArgument$$) {
      for ($isInQSA$$ in $secondArgument$$[$getTypeIndex$$]) {
        var $onDOMAttrModified$$ = $secondArgument$$[$getTypeIndex$$][$isInQSA$$];
        $loopAndVerify$$[$isInQSA$$] = $onDOMAttrModified$$;
        for ($executeAction$$ = 0; $executeAction$$ < $onDOMAttrModified$$.length; $executeAction$$++) {
          $loopAndVerify$$[$onDOMAttrModified$$[$executeAction$$].toLowerCase()] = $loopAndVerify$$[$onDOMAttrModified$$[$executeAction$$].toUpperCase()] = $isInQSA$$;
        }
      }
    }
    $loopAndSetup$$.get = function($secondArgument$$) {
      return "string" === typeof $secondArgument$$ ? $loopAndVerify$$[$secondArgument$$] || ($ASAP$$.test($secondArgument$$) ? [] : "") : $polyfill$$($secondArgument$$);
    };
    $loopAndSetup$$.set = function($secondArgument$$, $polyfill$$) {
      return $ASAP$$.test($secondArgument$$) ? $window$jscomp$1$$($secondArgument$$, $polyfill$$) : $window$jscomp$1$$($polyfill$$, $secondArgument$$), $loopAndSetup$$;
    };
    return $loopAndSetup$$;
  }({collections:{HTMLAllCollection:["all"], HTMLCollection:["forms"], HTMLFormControlsCollection:["elements"], HTMLOptionsCollection:["options"]}, elements:{Element:["element"], HTMLAnchorElement:["a"], HTMLAppletElement:["applet"], HTMLAreaElement:["area"], HTMLAttachmentElement:["attachment"], HTMLAudioElement:["audio"], HTMLBRElement:["br"], HTMLBaseElement:["base"], HTMLBodyElement:["body"], HTMLButtonElement:["button"], HTMLCanvasElement:["canvas"], HTMLContentElement:["content"], HTMLDListElement:["dl"], 
  HTMLDataElement:["data"], HTMLDataListElement:["datalist"], HTMLDetailsElement:["details"], HTMLDialogElement:["dialog"], HTMLDirectoryElement:["dir"], HTMLDivElement:["div"], HTMLDocument:["document"], HTMLElement:"element abbr address article aside b bdi bdo cite code command dd dfn dt em figcaption figure footer header i kbd mark nav noscript rp rt ruby s samp section small strong sub summary sup u var wbr".split(" "), HTMLEmbedElement:["embed"], HTMLFieldSetElement:["fieldset"], HTMLFontElement:["font"], 
  HTMLFormElement:["form"], HTMLFrameElement:["frame"], HTMLFrameSetElement:["frameset"], HTMLHRElement:["hr"], HTMLHeadElement:["head"], HTMLHeadingElement:"h1 h2 h3 h4 h5 h6".split(" "), HTMLHtmlElement:["html"], HTMLIFrameElement:["iframe"], HTMLImageElement:["img"], HTMLInputElement:["input"], HTMLKeygenElement:["keygen"], HTMLLIElement:["li"], HTMLLabelElement:["label"], HTMLLegendElement:["legend"], HTMLLinkElement:["link"], HTMLMapElement:["map"], HTMLMarqueeElement:["marquee"], HTMLMediaElement:["media"], 
  HTMLMenuElement:["menu"], HTMLMenuItemElement:["menuitem"], HTMLMetaElement:["meta"], HTMLMeterElement:["meter"], HTMLModElement:["del", "ins"], HTMLOListElement:["ol"], HTMLObjectElement:["object"], HTMLOptGroupElement:["optgroup"], HTMLOptionElement:["option"], HTMLOutputElement:["output"], HTMLParagraphElement:["p"], HTMLParamElement:["param"], HTMLPictureElement:["picture"], HTMLPreElement:["pre"], HTMLProgressElement:["progress"], HTMLQuoteElement:["blockquote", "q", "quote"], HTMLScriptElement:["script"], 
  HTMLSelectElement:["select"], HTMLShadowElement:["shadow"], HTMLSlotElement:["slot"], HTMLSourceElement:["source"], HTMLSpanElement:["span"], HTMLStyleElement:["style"], HTMLTableCaptionElement:["caption"], HTMLTableCellElement:["td", "th"], HTMLTableColElement:["col", "colgroup"], HTMLTableElement:["table"], HTMLTableRowElement:["tr"], HTMLTableSectionElement:["thead", "tbody", "tfoot"], HTMLTemplateElement:["template"], HTMLTextAreaElement:["textarea"], HTMLTimeElement:["time"], HTMLTitleElement:["title"], 
  HTMLTrackElement:["track"], HTMLUListElement:["ul"], HTMLUnknownElement:["unknown", "vhgroupv", "vkeygen"], HTMLVideoElement:["video"]}, nodes:{Attr:["node"], Audio:["audio"], CDATASection:["node"], CharacterData:["node"], Comment:["#comment"], Document:["#document"], DocumentFragment:["#document-fragment"], DocumentType:["node"], HTMLDocument:["#document"], Image:["img"], Option:["option"], ProcessingInstruction:["node"], ShadowRoot:["#shadow-root"], Text:["#text"], XMLDocument:["xml"]}});
  $polyfill$$ || ($polyfill$$ = "auto");
  var $REGISTER_ELEMENT$$ = "registerElement", $EXPANDO_UID$$ = "__" + $REGISTER_ELEMENT$$ + (10e4 * $window$jscomp$1$$.Math.random() >> 0), $ADD_EVENT_LISTENER$$ = "addEventListener", $ATTACHED$$ = "attached", $CALLBACK$$ = "Callback", $DETACHED$$ = "detached", $EXTENDS$$ = "extends", $ATTRIBUTE_CHANGED_CALLBACK$$ = "attributeChanged" + $CALLBACK$$, $ATTACHED_CALLBACK$$ = $ATTACHED$$ + $CALLBACK$$, $CONNECTED_CALLBACK$$ = "connected" + $CALLBACK$$, $DISCONNECTED_CALLBACK$$ = "disconnected" + $CALLBACK$$, 
  $CREATED_CALLBACK$$ = "created" + $CALLBACK$$, $DETACHED_CALLBACK$$ = $DETACHED$$ + $CALLBACK$$, $ADDITION$$ = "ADDITION", $MODIFICATION$$ = "MODIFICATION", $REMOVAL$$ = "REMOVAL", $DOM_ATTR_MODIFIED$$ = "DOMAttrModified", $DOM_CONTENT_LOADED$$ = "DOMContentLoaded", $DOM_SUBTREE_MODIFIED$$ = "DOMSubtreeModified", $PREFIX_TAG$$ = "<", $PREFIX_IS$$ = "=", $validName$$ = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/, $invalidNames$$ = "ANNOTATION-XML COLOR-PROFILE FONT-FACE FONT-FACE-SRC FONT-FACE-URI FONT-FACE-FORMAT FONT-FACE-NAME MISSING-GLYPH".split(" "), 
  $types$$ = [], $protos$$ = [], $query$jscomp$10$$ = "", $documentElement$$ = $document$jscomp$2$$.documentElement, $indexOf$$ = $types$$.indexOf || function($secondArgument$$) {
    for (var $window$jscomp$1$$ = this.length; $window$jscomp$1$$-- && this[$window$jscomp$1$$] !== $secondArgument$$;) {
    }
    return $window$jscomp$1$$;
  }, $OP$$ = $Object$jscomp$5$$.prototype, $hOP$$ = $OP$$.hasOwnProperty, $iPO$$ = $OP$$.isPrototypeOf, $defineProperty$$ = $Object$jscomp$5$$.defineProperty, $empty$$ = [], $gOPD$$ = $Object$jscomp$5$$.getOwnPropertyDescriptor, $gOPN$$ = $Object$jscomp$5$$.getOwnPropertyNames, $gPO$$ = $Object$jscomp$5$$.getPrototypeOf, $sPO$$ = $Object$jscomp$5$$.setPrototypeOf, $hasProto$$ = !!$Object$jscomp$5$$.__proto__, $DRECEV1$$ = "__dreCEv1", $customElements$jscomp$3$$ = $window$jscomp$1$$.customElements, 
  $usableCustomElements$$ = "force" !== $polyfill$$ && !!($customElements$jscomp$3$$ && $customElements$jscomp$3$$.define && $customElements$jscomp$3$$.get && $customElements$jscomp$3$$.whenDefined), $Dict$$ = $Object$jscomp$5$$.create || $Object$jscomp$5$$, $Map$jscomp$1$$ = $window$jscomp$1$$.Map || function() {
    var $secondArgument$$ = [], $window$jscomp$1$$ = [], $polyfill$$;
    return {get:function($polyfill$$) {
      return $window$jscomp$1$$[$indexOf$$.call($secondArgument$$, $polyfill$$)];
    }, set:function($ASAP$$, $loopAndVerify$$) {
      $polyfill$$ = $indexOf$$.call($secondArgument$$, $ASAP$$);
      0 > $polyfill$$ ? $window$jscomp$1$$[$secondArgument$$.push($ASAP$$) - 1] = $loopAndVerify$$ : $window$jscomp$1$$[$polyfill$$] = $loopAndVerify$$;
    }};
  }, $Promise$jscomp$3$$ = $window$jscomp$1$$.Promise || function($secondArgument$$) {
    function $window$jscomp$1$$($secondArgument$$) {
      for ($ASAP$$ = !0; $polyfill$$.length;) {
        $polyfill$$.shift()($secondArgument$$);
      }
    }
    var $polyfill$$ = [], $ASAP$$ = !1, $loopAndVerify$$ = {"catch":function() {
      return $loopAndVerify$$;
    }, then:function($secondArgument$$) {
      $polyfill$$.push($secondArgument$$);
      $ASAP$$ && setTimeout($window$jscomp$1$$, 1);
      return $loopAndVerify$$;
    }};
    $secondArgument$$($window$jscomp$1$$);
    return $loopAndVerify$$;
  }, $justCreated$$ = !1, $constructors$$ = $Dict$$(null), $waitingList$$ = $Dict$$(null), $nodeNames$$ = new $Map$jscomp$1$$, $create$$ = $Object$jscomp$5$$.create || function $Bridge$$($secondArgument$$) {
    return $secondArgument$$ ? ($Bridge$$.prototype = $secondArgument$$, new $Bridge$$) : this;
  }, $setPrototype$$ = $sPO$$ || ($hasProto$$ ? function($secondArgument$$, $window$jscomp$1$$) {
    $secondArgument$$.__proto__ = $window$jscomp$1$$;
    return $secondArgument$$;
  } : $gOPN$$ && $gOPD$$ ? function() {
    function $secondArgument$$($secondArgument$$, $window$jscomp$1$$) {
      for (var $polyfill$$, $ASAP$$ = $gOPN$$($window$jscomp$1$$), $loopAndVerify$$ = 0, $loopAndSetup$$ = $ASAP$$.length; $loopAndVerify$$ < $loopAndSetup$$; $loopAndVerify$$++) {
        $polyfill$$ = $ASAP$$[$loopAndVerify$$], $hOP$$.call($secondArgument$$, $polyfill$$) || $defineProperty$$($secondArgument$$, $polyfill$$, $gOPD$$($window$jscomp$1$$, $polyfill$$));
      }
    }
    return function($window$jscomp$1$$, $polyfill$$) {
      do {
        $secondArgument$$($window$jscomp$1$$, $polyfill$$);
      } while (($polyfill$$ = $gPO$$($polyfill$$)) && !$iPO$$.call($polyfill$$, $window$jscomp$1$$));
      return $window$jscomp$1$$;
    };
  }() : function($secondArgument$$, $window$jscomp$1$$) {
    for (var $polyfill$$ in $window$jscomp$1$$) {
      $secondArgument$$[$polyfill$$] = $window$jscomp$1$$[$polyfill$$];
    }
    return $secondArgument$$;
  }), $MutationObserver$jscomp$1$$ = $window$jscomp$1$$.MutationObserver || $window$jscomp$1$$.WebKitMutationObserver, $HTMLElementPrototype$$ = ($window$jscomp$1$$.HTMLElement || $window$jscomp$1$$.Element || $window$jscomp$1$$.Node).prototype, $IE8$$ = !$iPO$$.call($HTMLElementPrototype$$, $documentElement$$), $safeProperty$$ = $IE8$$ ? function($secondArgument$$, $window$jscomp$1$$, $polyfill$$) {
    $secondArgument$$[$window$jscomp$1$$] = $polyfill$$.value;
    return $secondArgument$$;
  } : $defineProperty$$, $isValidNode$$ = $IE8$$ ? function($secondArgument$$) {
    return 1 === $secondArgument$$.nodeType;
  } : function($secondArgument$$) {
    return $iPO$$.call($HTMLElementPrototype$$, $secondArgument$$);
  }, $targets$$ = $IE8$$ && [], $attachShadow$jscomp$1$$ = $HTMLElementPrototype$$.attachShadow, $cloneNode$jscomp$1$$ = $HTMLElementPrototype$$.cloneNode, $dispatchEvent$$ = $HTMLElementPrototype$$.dispatchEvent, $getAttribute$$ = $HTMLElementPrototype$$.getAttribute, $hasAttribute$$ = $HTMLElementPrototype$$.hasAttribute, $removeAttribute$$ = $HTMLElementPrototype$$.removeAttribute, $setAttribute$$ = $HTMLElementPrototype$$.setAttribute, $createElement$jscomp$2$$ = $document$jscomp$2$$.createElement, 
  $patchedCreateElement$$ = $createElement$jscomp$2$$, $attributesObserver$$ = $MutationObserver$jscomp$1$$ && {attributes:!0, characterData:!0, attributeOldValue:!0}, $DOMAttrModified$$ = $MutationObserver$jscomp$1$$ || function() {
    $doesNotSupportDOMAttrModified$$ = !1;
    $documentElement$$.removeEventListener($DOM_ATTR_MODIFIED$$, $DOMAttrModified$$);
  }, $asapQueue$$, $asapTimer$$ = 0, $V0$$ = $REGISTER_ELEMENT$$ in $document$jscomp$2$$, $setListener$$ = !0, $justSetup$$ = !1, $doesNotSupportDOMAttrModified$$ = !0, $dropDomContentLoaded$$ = !0, $notFromInnerHTMLHelper$$ = !0, $observer$jscomp$1$$, $observe$$;
  if (!$V0$$) {
    if ($sPO$$ || $hasProto$$) {
      var $patchIfNotAlready$$ = function($secondArgument$$, $window$jscomp$1$$) {
        $iPO$$.call($window$jscomp$1$$, $secondArgument$$) || $setupNode$$($secondArgument$$, $window$jscomp$1$$);
      };
      var $patch$$ = $setupNode$$;
    } else {
      $patch$$ = $patchIfNotAlready$$ = function($secondArgument$$, $window$jscomp$1$$) {
        $secondArgument$$[$EXPANDO_UID$$] || ($secondArgument$$[$EXPANDO_UID$$] = $Object$jscomp$5$$(!0), $setupNode$$($secondArgument$$, $window$jscomp$1$$));
      };
    }
    if ($IE8$$) {
      $doesNotSupportDOMAttrModified$$ = !1, function() {
        function $secondArgument$$($secondArgument$$) {
          var $window$jscomp$1$$ = $secondArgument$$.currentTarget, $polyfill$$ = $window$jscomp$1$$[$EXPANDO_UID$$];
          $secondArgument$$ = $secondArgument$$.propertyName;
          if ($polyfill$$.hasOwnProperty($secondArgument$$)) {
            $polyfill$$ = $polyfill$$[$secondArgument$$];
            var $ASAP$$ = new CustomEvent($DOM_ATTR_MODIFIED$$, {bubbles:!0});
            $ASAP$$.attrName = $polyfill$$.name;
            $ASAP$$.prevValue = $polyfill$$.value || null;
            $ASAP$$.newValue = $polyfill$$.value = $window$jscomp$1$$[$secondArgument$$] || null;
            null == $ASAP$$.prevValue ? $ASAP$$[$ADDITION$$] = $ASAP$$.attrChange = 0 : $ASAP$$[$MODIFICATION$$] = $ASAP$$.attrChange = 1;
            $dispatchEvent$$.call($window$jscomp$1$$, $ASAP$$);
          }
        }
        function $window$jscomp$1$$($secondArgument$$, $window$jscomp$1$$) {
          var $polyfill$$ = $hasAttribute$$.call(this, $secondArgument$$), $ASAP$$ = $polyfill$$ && $getAttribute$$.call(this, $secondArgument$$), $loopAndVerify$$ = new CustomEvent($DOM_ATTR_MODIFIED$$, {bubbles:!0});
          $setAttribute$$.call(this, $secondArgument$$, $window$jscomp$1$$);
          $loopAndVerify$$.attrName = $secondArgument$$;
          $loopAndVerify$$.prevValue = $polyfill$$ ? $ASAP$$ : null;
          $loopAndVerify$$.newValue = $window$jscomp$1$$;
          $polyfill$$ ? $loopAndVerify$$[$MODIFICATION$$] = $loopAndVerify$$.attrChange = 1 : $loopAndVerify$$[$ADDITION$$] = $loopAndVerify$$.attrChange = 0;
          $dispatchEvent$$.call(this, $loopAndVerify$$);
        }
        function $polyfill$$($secondArgument$$) {
          var $window$jscomp$1$$ = new CustomEvent($DOM_ATTR_MODIFIED$$, {bubbles:!0});
          $window$jscomp$1$$.attrName = $secondArgument$$;
          $window$jscomp$1$$.prevValue = $getAttribute$$.call(this, $secondArgument$$);
          $window$jscomp$1$$.newValue = null;
          $window$jscomp$1$$[$REMOVAL$$] = $window$jscomp$1$$.attrChange = 2;
          $removeAttribute$$.call(this, $secondArgument$$);
          $dispatchEvent$$.call(this, $window$jscomp$1$$);
        }
        var $ASAP$$ = $gOPD$$($HTMLElementPrototype$$, $ADD_EVENT_LISTENER$$), $loopAndVerify$$ = $ASAP$$.value;
        $ASAP$$.value = function($ASAP$$, $loopAndSetup$$, $executeAction$$) {
          $ASAP$$ === $DOM_ATTR_MODIFIED$$ && this[$ATTRIBUTE_CHANGED_CALLBACK$$] && this.setAttribute !== $window$jscomp$1$$ && (this[$EXPANDO_UID$$] = {className:{name:"class", value:this.className}}, this.setAttribute = $window$jscomp$1$$, this.removeAttribute = $polyfill$$, $loopAndVerify$$.call(this, "propertychange", $secondArgument$$));
          $loopAndVerify$$.call(this, $ASAP$$, $loopAndSetup$$, $executeAction$$);
        };
        $defineProperty$$($HTMLElementPrototype$$, $ADD_EVENT_LISTENER$$, $ASAP$$);
      }();
    } else {
      if (!$MutationObserver$jscomp$1$$ && ($documentElement$$[$ADD_EVENT_LISTENER$$]($DOM_ATTR_MODIFIED$$, $DOMAttrModified$$), $documentElement$$.setAttribute($EXPANDO_UID$$, 1), $documentElement$$.removeAttribute($EXPANDO_UID$$), $doesNotSupportDOMAttrModified$$)) {
        var $onSubtreeModified$$ = function($secondArgument$$) {
          var $window$jscomp$1$$, $polyfill$$;
          if (this === $secondArgument$$.target) {
            var $ASAP$$ = this[$EXPANDO_UID$$];
            this[$EXPANDO_UID$$] = $window$jscomp$1$$ = $getAttributesMirror$$(this);
            for ($polyfill$$ in $window$jscomp$1$$) {
              if (!($polyfill$$ in $ASAP$$)) {
                return $callDOMAttrModified$$(0, this, $polyfill$$, $ASAP$$[$polyfill$$], $window$jscomp$1$$[$polyfill$$], $ADDITION$$);
              }
              if ($window$jscomp$1$$[$polyfill$$] !== $ASAP$$[$polyfill$$]) {
                return $callDOMAttrModified$$(1, this, $polyfill$$, $ASAP$$[$polyfill$$], $window$jscomp$1$$[$polyfill$$], $MODIFICATION$$);
              }
            }
            for ($polyfill$$ in $ASAP$$) {
              if (!($polyfill$$ in $window$jscomp$1$$)) {
                return $callDOMAttrModified$$(2, this, $polyfill$$, $ASAP$$[$polyfill$$], $window$jscomp$1$$[$polyfill$$], $REMOVAL$$);
              }
            }
          }
        };
        var $callDOMAttrModified$$ = function($secondArgument$$, $window$jscomp$1$$, $polyfill$$, $ASAP$$, $loopAndVerify$$, $loopAndSetup$$) {
          $polyfill$$ = {attrChange:$secondArgument$$, currentTarget:$window$jscomp$1$$, attrName:$polyfill$$, prevValue:$ASAP$$, newValue:$loopAndVerify$$};
          $polyfill$$[$loopAndSetup$$] = $secondArgument$$;
          $onDOMAttrModified$$($polyfill$$);
        };
        var $getAttributesMirror$$ = function($secondArgument$$) {
          for (var $window$jscomp$1$$, $polyfill$$ = {}, $ASAP$$ = $secondArgument$$.attributes, $loopAndVerify$$ = 0, $loopAndSetup$$ = $ASAP$$.length; $loopAndVerify$$ < $loopAndSetup$$; $loopAndVerify$$++) {
            $secondArgument$$ = $ASAP$$[$loopAndVerify$$], $window$jscomp$1$$ = $secondArgument$$.name, "setAttribute" !== $window$jscomp$1$$ && ($polyfill$$[$window$jscomp$1$$] = $secondArgument$$.value);
          }
          return $polyfill$$;
        };
      }
    }
    $document$jscomp$2$$[$REGISTER_ELEMENT$$] = function($secondArgument$$, $window$jscomp$1$$) {
      function $polyfill$$() {
        return $onDOMAttrModified$$ ? $document$jscomp$2$$.createElement($type$jscomp$119$$, $ASAP$$) : $document$jscomp$2$$.createElement($type$jscomp$119$$);
      }
      var $ASAP$$ = $secondArgument$$.toUpperCase();
      $setListener$$ && ($setListener$$ = !1, $MutationObserver$jscomp$1$$ ? ($observer$jscomp$1$$ = function($secondArgument$$, $window$jscomp$1$$) {
        function $polyfill$$($secondArgument$$, $window$jscomp$1$$) {
          for (var $polyfill$$ = 0, $ASAP$$ = $secondArgument$$.length; $polyfill$$ < $ASAP$$; $window$jscomp$1$$($secondArgument$$[$polyfill$$++])) {
          }
        }
        return new $MutationObserver$jscomp$1$$(function($ASAP$$) {
          for (var $loopAndVerify$$, $loopAndSetup$$, $executeAction$$, $getTypeIndex$$ = 0, $isInQSA$$ = $ASAP$$.length; $getTypeIndex$$ < $isInQSA$$; $getTypeIndex$$++) {
            if ($loopAndVerify$$ = $ASAP$$[$getTypeIndex$$], "childList" === $loopAndVerify$$.type) {
              $polyfill$$($loopAndVerify$$.addedNodes, $secondArgument$$), $polyfill$$($loopAndVerify$$.removedNodes, $window$jscomp$1$$);
            } else {
              if ($loopAndSetup$$ = $loopAndVerify$$.target, $notFromInnerHTMLHelper$$ && $loopAndSetup$$[$ATTRIBUTE_CHANGED_CALLBACK$$] && "style" !== $loopAndVerify$$.attributeName && ($executeAction$$ = $getAttribute$$.call($loopAndSetup$$, $loopAndVerify$$.attributeName), $executeAction$$ !== $loopAndVerify$$.oldValue)) {
                $loopAndSetup$$[$ATTRIBUTE_CHANGED_CALLBACK$$]($loopAndVerify$$.attributeName, $loopAndVerify$$.oldValue, $executeAction$$);
              }
            }
          }
        });
      }($executeAction$$($ATTACHED$$), $executeAction$$($DETACHED$$)), $observe$$ = function($secondArgument$$) {
        $observer$jscomp$1$$.observe($secondArgument$$, {childList:!0, subtree:!0});
        return $secondArgument$$;
      }, $observe$$($document$jscomp$2$$), $attachShadow$jscomp$1$$ && ($HTMLElementPrototype$$.attachShadow = function() {
        return $observe$$($attachShadow$jscomp$1$$.apply(this, arguments));
      })) : ($asapQueue$$ = [], $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]("DOMNodeInserted", $onDOMNode$$($ATTACHED$$)), $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]("DOMNodeRemoved", $onDOMNode$$($DETACHED$$))), $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]($DOM_CONTENT_LOADED$$, $onReadyStateChange$$), $document$jscomp$2$$[$ADD_EVENT_LISTENER$$]("readystatechange", $onReadyStateChange$$), $HTMLElementPrototype$$.cloneNode = function($secondArgument$$) {
        var $window$jscomp$1$$ = $cloneNode$jscomp$1$$.call(this, !!$secondArgument$$), $polyfill$$ = $getTypeIndex$$($window$jscomp$1$$);
        -1 < $polyfill$$ && $patch$$($window$jscomp$1$$, $protos$$[$polyfill$$]);
        $secondArgument$$ && $query$jscomp$10$$.length && $loopAndSetup$$($window$jscomp$1$$.querySelectorAll($query$jscomp$10$$));
        return $window$jscomp$1$$;
      });
      if ($justSetup$$) {
        return $justSetup$$ = !1;
      }
      -2 < $indexOf$$.call($types$$, $PREFIX_IS$$ + $ASAP$$) + $indexOf$$.call($types$$, $PREFIX_TAG$$ + $ASAP$$) && $throwTypeError$$($secondArgument$$);
      if (!$validName$$.test($ASAP$$) || -1 < $indexOf$$.call($invalidNames$$, $ASAP$$)) {
        throw Error("The type " + $secondArgument$$ + " is invalid");
      }
      var $isInQSA$$ = $window$jscomp$1$$ || $OP$$, $onDOMAttrModified$$ = $hOP$$.call($isInQSA$$, $EXTENDS$$), $type$jscomp$119$$ = $onDOMAttrModified$$ ? $window$jscomp$1$$[$EXTENDS$$].toUpperCase() : $ASAP$$;
      $onDOMAttrModified$$ && -1 < $indexOf$$.call($types$$, $PREFIX_TAG$$ + $type$jscomp$119$$) && $throwTypeError$$($type$jscomp$119$$);
      $window$jscomp$1$$ = $types$$.push(($onDOMAttrModified$$ ? $PREFIX_IS$$ : $PREFIX_TAG$$) + $ASAP$$) - 1;
      $query$jscomp$10$$ = $query$jscomp$10$$.concat($query$jscomp$10$$.length ? "," : "", $onDOMAttrModified$$ ? $type$jscomp$119$$ + '[is="' + $secondArgument$$.toLowerCase() + '"]' : $type$jscomp$119$$);
      $polyfill$$.prototype = $protos$$[$window$jscomp$1$$] = $hOP$$.call($isInQSA$$, "prototype") ? $isInQSA$$.prototype : $create$$($HTMLElementPrototype$$);
      $query$jscomp$10$$.length && $loopAndVerify$$($document$jscomp$2$$.querySelectorAll($query$jscomp$10$$), $ATTACHED$$);
      return $polyfill$$;
    };
    $document$jscomp$2$$.createElement = $patchedCreateElement$$ = function($window$jscomp$1$$, $polyfill$$) {
      var $ASAP$$ = $getIs$$($polyfill$$), $loopAndVerify$$ = $ASAP$$ ? $createElement$jscomp$2$$.call($document$jscomp$2$$, $window$jscomp$1$$, $secondArgument$$($ASAP$$)) : $createElement$jscomp$2$$.call($document$jscomp$2$$, $window$jscomp$1$$);
      $window$jscomp$1$$ = "" + $window$jscomp$1$$;
      var $loopAndSetup$$ = $indexOf$$.call($types$$, ($ASAP$$ ? $PREFIX_IS$$ : $PREFIX_TAG$$) + ($ASAP$$ || $window$jscomp$1$$).toUpperCase()), $executeAction$$ = -1 < $loopAndSetup$$;
      $ASAP$$ && ($loopAndVerify$$.setAttribute("is", $ASAP$$ = $ASAP$$.toLowerCase()), $executeAction$$ && ($executeAction$$ = $isInQSA$$($window$jscomp$1$$.toUpperCase(), $ASAP$$)));
      $notFromInnerHTMLHelper$$ = !$document$jscomp$2$$.createElement.innerHTMLHelper;
      $executeAction$$ && $patch$$($loopAndVerify$$, $protos$$[$loopAndSetup$$]);
      return $loopAndVerify$$;
    };
  }
  $CustomElementRegistry$jscomp$1$$.prototype = {constructor:$CustomElementRegistry$jscomp$1$$, define:$usableCustomElements$$ ? function($secondArgument$$, $window$jscomp$1$$, $polyfill$$) {
    if ($polyfill$$) {
      $CERDefine$$($secondArgument$$, $window$jscomp$1$$, $polyfill$$);
    } else {
      var $ASAP$$ = $secondArgument$$.toUpperCase();
      $constructors$$[$ASAP$$] = {constructor:$window$jscomp$1$$, create:[$ASAP$$]};
      $nodeNames$$.set($window$jscomp$1$$, $ASAP$$);
      $customElements$jscomp$3$$.define($secondArgument$$, $window$jscomp$1$$);
    }
  } : $CERDefine$$, get:$usableCustomElements$$ ? function($secondArgument$$) {
    return $customElements$jscomp$3$$.get($secondArgument$$) || $get$$($secondArgument$$);
  } : $get$$, whenDefined:$usableCustomElements$$ ? function($secondArgument$$) {
    return $Promise$jscomp$3$$.race([$customElements$jscomp$3$$.whenDefined($secondArgument$$), $whenDefined$$($secondArgument$$)]);
  } : $whenDefined$$};
  if ($customElements$jscomp$3$$ && "force" !== $polyfill$$) {
    try {
      (function($secondArgument$$, $polyfill$$, $ASAP$$) {
        $polyfill$$[$EXTENDS$$] = "a";
        $secondArgument$$.prototype = $create$$(HTMLAnchorElement.prototype);
        $secondArgument$$.prototype.constructor = $secondArgument$$;
        $window$jscomp$1$$.customElements.define($ASAP$$, $secondArgument$$, $polyfill$$);
        if ($getAttribute$$.call($document$jscomp$2$$.createElement("a", {is:$ASAP$$}), "is") !== $ASAP$$ || $usableCustomElements$$ && $getAttribute$$.call(new $secondArgument$$, "is") !== $ASAP$$) {
          throw $polyfill$$;
        }
      })(function $DRE$jscomp$1$$() {
        return Reflect.construct(HTMLAnchorElement, [], $DRE$jscomp$1$$);
      }, {}, "document-register-element-a");
    } catch ($o_O$$) {
      $polyfillV1$$();
    }
  } else {
    $polyfillV1$$();
  }
  try {
    $createElement$jscomp$2$$.call($document$jscomp$2$$, "a", "a");
  } catch ($FireFox$$) {
    $secondArgument$$ = function($secondArgument$$) {
      return {is:$secondArgument$$.toLowerCase()};
    };
  }
}
;function $LruCache$$module$src$utils$lru_cache$$() {
  var $capacity$$ = 100;
  this.$capacity_$ = $capacity$$;
  this.$access_$ = this.$size_$ = 0;
  this.$cache_$ = Object.create(null);
}
$LruCache$$module$src$utils$lru_cache$$.prototype.has = function($key$jscomp$47$$) {
  return !!this.$cache_$[$key$jscomp$47$$];
};
$LruCache$$module$src$utils$lru_cache$$.prototype.get = function($key$jscomp$48$$) {
  var $cacheable$$ = this.$cache_$[$key$jscomp$48$$];
  if ($cacheable$$) {
    return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
  }
};
$LruCache$$module$src$utils$lru_cache$$.prototype.put = function($JSCompiler_cache$jscomp$inline_101_key$jscomp$49$$, $payload$$) {
  this.has($JSCompiler_cache$jscomp$inline_101_key$jscomp$49$$) || this.$size_$++;
  this.$cache_$[$JSCompiler_cache$jscomp$inline_101_key$jscomp$49$$] = {payload:$payload$$, access:this.$access_$};
  if (!(this.$size_$ <= this.$capacity_$)) {
    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
    $JSCompiler_cache$jscomp$inline_101_key$jscomp$49$$ = this.$cache_$;
    var $JSCompiler_oldest$jscomp$inline_102$$ = this.$access_$ + 1, $JSCompiler_key$jscomp$inline_104$$;
    for ($JSCompiler_key$jscomp$inline_104$$ in $JSCompiler_cache$jscomp$inline_101_key$jscomp$49$$) {
      var $JSCompiler_access$jscomp$inline_105$$ = $JSCompiler_cache$jscomp$inline_101_key$jscomp$49$$[$JSCompiler_key$jscomp$inline_104$$].access;
      if ($JSCompiler_access$jscomp$inline_105$$ < $JSCompiler_oldest$jscomp$inline_102$$) {
        $JSCompiler_oldest$jscomp$inline_102$$ = $JSCompiler_access$jscomp$inline_105$$;
        var $JSCompiler_oldestKey$jscomp$inline_103$$ = $JSCompiler_key$jscomp$inline_104$$;
      }
    }
    void 0 !== $JSCompiler_oldestKey$jscomp$inline_103$$ && (delete $JSCompiler_cache$jscomp$inline_101_key$jscomp$49$$[$JSCompiler_oldestKey$jscomp$inline_103$$], this.$size_$--);
  }
};
var $env$$module$src$config$$ = self.AMP_CONFIG || {}, $urls$$module$src$config$$ = {thirdParty:$env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net", thirdPartyFrameHost:$env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net", thirdPartyFrameRegex:("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/, cdn:$env$$module$src$config$$.cdnUrl || 
"https://cdn.ampproject.org", cdnProxyRegex:("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/, localhostRegex:/^https?:\/\/localhost(:\d+)?$/, errorReporting:$env$$module$src$config$$.errorReportingUrl || "https://amp-error-reporting.appspot.com/r", localDev:$env$$module$src$config$$.localDev || !1};
$dict$$module$src$utils$object$$({c:!0, v:!0, a:!0, ad:!0});
var $a$$module$src$url$$, $cache$$module$src$url$$;
function $parseUrlDeprecated$$module$src$url$$($JSCompiler_inline_result$jscomp$29_url$jscomp$23$$) {
  var $opt_nocache$$;
  $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), $cache$$module$src$url$$ = self.UrlCache || (self.UrlCache = new $LruCache$$module$src$utils$lru_cache$$));
  var $JSCompiler_opt_cache$jscomp$inline_108$$ = $opt_nocache$$ ? null : $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_109$$ = $a$$module$src$url$$;
  if ($JSCompiler_opt_cache$jscomp$inline_108$$ && $JSCompiler_opt_cache$jscomp$inline_108$$.has($JSCompiler_inline_result$jscomp$29_url$jscomp$23$$)) {
    $JSCompiler_inline_result$jscomp$29_url$jscomp$23$$ = $JSCompiler_opt_cache$jscomp$inline_108$$.get($JSCompiler_inline_result$jscomp$29_url$jscomp$23$$);
  } else {
    $JSCompiler_a$jscomp$inline_109$$.href = $JSCompiler_inline_result$jscomp$29_url$jscomp$23$$;
    $JSCompiler_a$jscomp$inline_109$$.protocol || ($JSCompiler_a$jscomp$inline_109$$.href = $JSCompiler_a$jscomp$inline_109$$.href);
    var $JSCompiler_info$jscomp$inline_110$$ = {href:$JSCompiler_a$jscomp$inline_109$$.href, protocol:$JSCompiler_a$jscomp$inline_109$$.protocol, host:$JSCompiler_a$jscomp$inline_109$$.host, hostname:$JSCompiler_a$jscomp$inline_109$$.hostname, port:"0" == $JSCompiler_a$jscomp$inline_109$$.port ? "" : $JSCompiler_a$jscomp$inline_109$$.port, pathname:$JSCompiler_a$jscomp$inline_109$$.pathname, search:$JSCompiler_a$jscomp$inline_109$$.search, hash:$JSCompiler_a$jscomp$inline_109$$.hash, origin:null};
    "/" !== $JSCompiler_info$jscomp$inline_110$$.pathname[0] && ($JSCompiler_info$jscomp$inline_110$$.pathname = "/" + $JSCompiler_info$jscomp$inline_110$$.pathname);
    if ("http:" == $JSCompiler_info$jscomp$inline_110$$.protocol && 80 == $JSCompiler_info$jscomp$inline_110$$.port || "https:" == $JSCompiler_info$jscomp$inline_110$$.protocol && 443 == $JSCompiler_info$jscomp$inline_110$$.port) {
      $JSCompiler_info$jscomp$inline_110$$.port = "", $JSCompiler_info$jscomp$inline_110$$.host = $JSCompiler_info$jscomp$inline_110$$.hostname;
    }
    $JSCompiler_info$jscomp$inline_110$$.origin = $JSCompiler_a$jscomp$inline_109$$.origin && "null" != $JSCompiler_a$jscomp$inline_109$$.origin ? $JSCompiler_a$jscomp$inline_109$$.origin : "data:" != $JSCompiler_info$jscomp$inline_110$$.protocol && $JSCompiler_info$jscomp$inline_110$$.host ? $JSCompiler_info$jscomp$inline_110$$.protocol + "//" + $JSCompiler_info$jscomp$inline_110$$.host : $JSCompiler_info$jscomp$inline_110$$.href;
    $JSCompiler_opt_cache$jscomp$inline_108$$ && $JSCompiler_opt_cache$jscomp$inline_108$$.put($JSCompiler_inline_result$jscomp$29_url$jscomp$23$$, $JSCompiler_info$jscomp$inline_110$$);
    $JSCompiler_inline_result$jscomp$29_url$jscomp$23$$ = $JSCompiler_info$jscomp$inline_110$$;
  }
  return $JSCompiler_inline_result$jscomp$29_url$jscomp$23$$;
}
function $assertAbsoluteHttpOrHttpsUrl$$module$src$url$$($urlString$jscomp$2$$) {
  var $JSCompiler_shouldBeTrueish$jscomp$inline_113$$ = /^https?:/i.test($urlString$jscomp$2$$);
  $user$$module$src$log$$().assert($JSCompiler_shouldBeTrueish$jscomp$inline_113$$, 'URL must start with "http://" or "https://". Invalid value: %s', $urlString$jscomp$2$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
  return $parseUrlDeprecated$$module$src$url$$($urlString$jscomp$2$$).href;
}
;function $getExperimentTogglesFromCookie$$module$src$experiments$$($JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$) {
  a: {
    try {
      var $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$ = $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$.document.cookie;
    } catch ($JSCompiler_e$jscomp$inline_203$$) {
      $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$ = "";
    }
    if ($JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$ = $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$) {
      for ($JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$ = $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$.split(";"), $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$ = 0; $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$ < 
      $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$.length; $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$++) {
        var $JSCompiler_cookie$jscomp$inline_130$$ = $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$[$JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$].trim(), $JSCompiler_eq$jscomp$inline_131$$ = $JSCompiler_cookie$jscomp$inline_130$$.indexOf("=");
        if (-1 != $JSCompiler_eq$jscomp$inline_131$$ && "AMP_EXP" == $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_cookie$jscomp$inline_130$$.substring(0, $JSCompiler_eq$jscomp$inline_131$$).trim(), void 0)) {
          $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$ = $JSCompiler_cookie$jscomp$inline_130$$.substring($JSCompiler_eq$jscomp$inline_131$$ + 1).trim();
          $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$, $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$);
          break a;
        }
      }
    }
    $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$ = null;
  }
  var $experimentCookie$$ = $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$, $tokens$$ = $experimentCookie$$ ? $experimentCookie$$.split(/\s*,\s*/g) : [];
  $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$ = Object.create(null);
  for ($JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$ = 0; $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$ < $tokens$$.length; $JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$++) {
    0 != $tokens$$[$JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$].length && ("-" == $tokens$$[$JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$][0] ? $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$[$tokens$$[$JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$].substr(1)] = 
    !1 : $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$[$tokens$$[$JSCompiler_i$jscomp$inline_129_JSCompiler_inline_result$jscomp$199_i$jscomp$44$$]] = !0);
  }
  return $JSCompiler_cookieString$jscomp$inline_127_JSCompiler_cookies$jscomp$inline_128_JSCompiler_inline_result$jscomp$31_JSCompiler_value$jscomp$inline_132_toggles$jscomp$3_win$jscomp$40$$;
}
;(function($win$jscomp$13$$) {
  /Trident|MSIE|IEMobile/i.test($win$jscomp$13$$.navigator.userAgent) && $win$jscomp$13$$.DOMTokenList && $win$jscomp$13$$.Object.defineProperty($win$jscomp$13$$.DOMTokenList.prototype, "toggle", {enumerable:!1, configurable:!0, writable:!0, value:$domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist_toggle$$});
})(self);
(function($win$jscomp$22$$) {
  $win$jscomp$22$$.fetch || (Object.defineProperty($win$jscomp$22$$, "fetch", {value:$fetchPolyfill$$module$src$polyfills$fetch$$, writable:!0, enumerable:!0, configurable:!0}), Object.defineProperty($win$jscomp$22$$, "Response", {value:$Response$$module$src$polyfills$fetch$$, writable:!0, enumerable:!1, configurable:!0}));
})(self);
(function($win$jscomp$23$$) {
  $win$jscomp$23$$.Math.sign || $win$jscomp$23$$.Object.defineProperty($win$jscomp$23$$.Math, "sign", {enumerable:!1, configurable:!0, writable:!0, value:$sign$$module$src$polyfills$math_sign$$});
})(self);
(function($win$jscomp$24$$) {
  $win$jscomp$24$$.Object.assign || $win$jscomp$24$$.Object.defineProperty($win$jscomp$24$$.Object, "assign", {enumerable:!1, configurable:!0, writable:!0, value:$assign$$module$src$polyfills$object_assign$$});
})(self);
(function($win$jscomp$25$$) {
  $win$jscomp$25$$.Object.values || $win$jscomp$25$$.Object.defineProperty($win$jscomp$25$$.Object, "values", {configurable:!0, writable:!0, value:$values$$module$src$polyfills$object_values$$});
})(self);
(function($win$jscomp$26$$) {
  $win$jscomp$26$$.Promise || ($win$jscomp$26$$.Promise = $module$node_modules$promise_pjs$promise$default$$, $module$node_modules$promise_pjs$promise$default$$.default && ($win$jscomp$26$$.Promise = $module$node_modules$promise_pjs$promise$default$$.default), $win$jscomp$26$$.Promise.resolve = $module$node_modules$promise_pjs$promise$default$resolve$$, $win$jscomp$26$$.Promise.reject = $module$node_modules$promise_pjs$promise$default$reject$$, $win$jscomp$26$$.Promise.all = $module$node_modules$promise_pjs$promise$default$all$$, 
  $win$jscomp$26$$.Promise.race = $module$node_modules$promise_pjs$promise$default$race$$);
})(self);
(function($win$jscomp$15$$) {
  var $documentClass$$ = $win$jscomp$15$$.HTMLDocument || $win$jscomp$15$$.Document;
  $documentClass$$.prototype.contains || $win$jscomp$15$$.Object.defineProperty($documentClass$$.prototype, "contains", {enumerable:!1, configurable:!0, writable:!0, value:$documentContainsPolyfill$$module$src$polyfills$document_contains$$});
})(self);
(function($win$jscomp$4$$) {
  $win$jscomp$4$$.Array.prototype.includes || $win$jscomp$4$$.Object.defineProperty(Array.prototype, "includes", {enumerable:!1, configurable:!0, writable:!0, value:$includes$$module$src$polyfills$array_includes$$});
})(self);
if (function($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$, $experimentId$$) {
  if ($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.__AMP__EXPERIMENT_TOGGLES) {
    var $JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$ = $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.__AMP__EXPERIMENT_TOGGLES;
  } else {
    $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
    $JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$ = $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.__AMP__EXPERIMENT_TOGGLES;
    if ($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG) {
      for (var $JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$ in $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG) {
        var $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ = $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG[$JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$];
        "number" === typeof $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ && 0 <= $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ && 1 >= $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ && ($JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$[$JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$] = 
        Math.random() < $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$);
      }
    }
    if ($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG["allow-doc-opt-in"].length && ($JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$ = $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG["allow-doc-opt-in"], $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ = 
    $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]'))) {
      $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ = $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$.getAttribute("content").split(",");
      for (var $JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$ = 0; $JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$ < $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$.length; $JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$++) {
        -1 != $JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$.indexOf($JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$[$JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$]) && ($JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$[$JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$[$JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$]] = 
        !0);
      }
    }
    Object.assign($JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$, $getExperimentTogglesFromCookie$$module$src$experiments$$($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$));
    if ($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG && Array.isArray($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG["allow-url-opt-in"].length) {
      for ($JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$ = $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.AMP_CONFIG["allow-url-opt-in"], $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$ = $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.location.originalHash || $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$.location.hash), $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ = 
      0; $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$ < $JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$.length; $JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$++) {
        $JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$ = $JSCompiler_params$jscomp$inline_143_win$jscomp$36$$["e-" + $JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$[$JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$]], "1" == $JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$ && ($JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$[$JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$[$JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$]] = 
        !0), "0" == $JSCompiler_i$jscomp$inline_141_JSCompiler_param$jscomp$inline_145$$ && ($JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$[$JSCompiler_allowed$jscomp$inline_138_JSCompiler_experimentId$jscomp$inline_136_allowed$13$jscomp$inline_142$$[$JSCompiler_frequency$jscomp$inline_137_JSCompiler_meta$jscomp$inline_139_JSCompiler_optedInExperiments$jscomp$inline_140_i$14$jscomp$inline_144$$]] = !1);
      }
    }
  }
  var $toggles$$ = $JSCompiler_inline_result$jscomp$34_JSCompiler_toggles$jscomp$inline_135$$;
  return !!$toggles$$[$experimentId$$];
}(self, "custom-elements-v1")) {
  var $JSCompiler_win$jscomp$inline_147$$ = self;
  -1 === $JSCompiler_win$jscomp$inline_147$$.HTMLElement.toString().indexOf("[native code]") || $polyfill$$module$src$polyfills$custom_elements$$();
} else {
  $installCustomElements$$module$node_modules$document_register_element$build$document_register_element_patched$$();
}
;var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$31$$, $listener$jscomp$56$$) {
  var $opt_evtListenerOpts$$ = void 0, $localElement$$ = $element$jscomp$31$$, $localListener$$ = $listener$jscomp$56$$;
  var $wrapped$$ = function($element$jscomp$31$$) {
    try {
      return $localListener$$($element$jscomp$31$$);
    } catch ($e$jscomp$31$$) {
      throw self.reportError($e$jscomp$31$$), $e$jscomp$31$$;
    }
  };
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$(), $capture$jscomp$1$$ = !1;
  $opt_evtListenerOpts$$ && ($capture$jscomp$1$$ = $opt_evtListenerOpts$$.capture);
  $localElement$$.addEventListener("message", $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$jscomp$1$$);
  return function() {
    $localElement$$ && $localElement$$.removeEventListener("message", $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$jscomp$1$$);
    $wrapped$$ = $localElement$$ = $localListener$$ = null;
  };
}
function $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$() {
  if (void 0 !== $optsSupported$$module$src$event_helper_listen$$) {
    return $optsSupported$$module$src$event_helper_listen$$;
  }
  $optsSupported$$module$src$event_helper_listen$$ = !1;
  try {
    var $options$jscomp$22$$ = {get capture() {
      $optsSupported$$module$src$event_helper_listen$$ = !0;
    }};
    self.addEventListener("test-options", null, $options$jscomp$22$$);
    self.removeEventListener("test-options", null, $options$jscomp$22$$);
  } catch ($err$jscomp$3$$) {
  }
  return $optsSupported$$module$src$event_helper_listen$$;
}
;function $listen$$module$src$event_helper$$($element$jscomp$32$$, $listener$jscomp$57$$) {
  return $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$32$$, $listener$jscomp$57$$);
}
;function $LoginDoneDialog$$module$build$all$amp_access_0_1$amp_login_done_dialog$$() {
  this.win = window;
}
$LoginDoneDialog$$module$build$all$amp_access_0_1$amp_login_done_dialog$$.prototype.start = function() {
  var $JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$ = this.win.document, $JSCompiler_style$jscomp$inline_157$$ = $JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$.createElement("style");
  a: {
    var $JSCompiler_langSet$jscomp$inline_212_JSCompiler_query$jscomp$inline_208$$ = $parseQueryString_$$module$src$url_parse_query_string$$(this.win.location.search), $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$ = this.win;
    var $JSCompiler_doc$jscomp$inline_210_JSCompiler_inline_result$jscomp$200$$ = $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$.document;
    $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$ = $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$.navigator;
    $JSCompiler_langSet$jscomp$inline_212_JSCompiler_query$jscomp$inline_208$$ = [$JSCompiler_langSet$jscomp$inline_212_JSCompiler_query$jscomp$inline_208$$.hl, $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$.language, $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$.userLanguage, "en-US"];
    for ($JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$ = 0; $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$ < $JSCompiler_langSet$jscomp$inline_212_JSCompiler_query$jscomp$inline_208$$.length; $JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$++) {
      var $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$ = $JSCompiler_langSet$jscomp$inline_212_JSCompiler_query$jscomp$inline_208$$[$JSCompiler_$jscomp$inline_209_JSCompiler_i$jscomp$inline_213_JSCompiler_nav$jscomp$inline_211$$];
      if ($JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$) {
        if ($JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$) {
          $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$ = $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$.split("-");
          for (var $JSCompiler_langExpr$jscomp$inline_218$$ = "", $JSCompiler_langPrefix$jscomp$inline_219$$ = "", $JSCompiler_i$jscomp$inline_220$$ = 0; $JSCompiler_i$jscomp$inline_220$$ < $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$.length; $JSCompiler_i$jscomp$inline_220$$++) {
            0 < $JSCompiler_i$jscomp$inline_220$$ && ($JSCompiler_langExpr$jscomp$inline_218$$ += ", ", $JSCompiler_langPrefix$jscomp$inline_219$$ += "-"), $JSCompiler_langPrefix$jscomp$inline_219$$ += 0 == $JSCompiler_i$jscomp$inline_220$$ ? $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$[$JSCompiler_i$jscomp$inline_220$$].toLowerCase() : $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$[$JSCompiler_i$jscomp$inline_220$$].toUpperCase(), 
            $JSCompiler_langPrefix$jscomp$inline_219$$ = $JSCompiler_langPrefix$jscomp$inline_219$$.replace(/[^a-zA-Z\-]/g, ""), $JSCompiler_langExpr$jscomp$inline_218$$ += '[lang="' + $JSCompiler_langPrefix$jscomp$inline_219$$ + '"]';
          }
          $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$ = $JSCompiler_langExpr$jscomp$inline_218$$;
        } else {
          $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$ = null;
        }
        if ($JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$ && $JSCompiler_doc$jscomp$inline_210_JSCompiler_inline_result$jscomp$200$$.querySelector($JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$)) {
          $JSCompiler_doc$jscomp$inline_210_JSCompiler_inline_result$jscomp$200$$ = $JSCompiler_inline_result$jscomp$inline_215_JSCompiler_lang$jscomp$inline_214_JSCompiler_lang$jscomp$inline_216_JSCompiler_parts$jscomp$inline_217_JSCompiler_selector$jscomp$inline_221$$ + " {display: block}";
          break a;
        }
      }
    }
    $JSCompiler_doc$jscomp$inline_210_JSCompiler_inline_result$jscomp$200$$ = "";
  }
  $JSCompiler_style$jscomp$inline_157$$.textContent = $JSCompiler_doc$jscomp$inline_210_JSCompiler_inline_result$jscomp$200$$;
  $JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$.head.appendChild($JSCompiler_style$jscomp$inline_157$$);
  $JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$ = $parseQueryString_$$module$src$url_parse_query_string$$(this.win.location.search);
  this.win.opener && this.win.opener != this.win ? $JSCompiler_StaticMethods_postback_$$(this).then(this.$postbackSuccess_$.bind(this), this.$postbackError_$.bind(this)) : $JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$.url ? ($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$ = $JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$.url, 
  /^https?%/i.test($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$) && ($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$, 
  void 0)), this.win.location.replace($assertAbsoluteHttpOrHttpsUrl$$module$src$url$$($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$)), Promise.resolve()) : ($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$ = Error("No opener or return location available"), this.$postbackError_$($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$), 
  Promise.reject($JSCompiler_doc$jscomp$inline_156_JSCompiler_error$jscomp$inline_162_JSCompiler_query$jscomp$inline_160_JSCompiler_url$jscomp$inline_161$$));
};
function $JSCompiler_StaticMethods_postback_$$($JSCompiler_StaticMethods_postback_$self$$) {
  function $unlisten$jscomp$2$$() {
  }
  var $response$jscomp$2$$ = $JSCompiler_StaticMethods_postback_$self$$.win.location.hash;
  return (new Promise(function($resolve$jscomp$18$$, $reject$jscomp$11$$) {
    var $opener$$ = $JSCompiler_StaticMethods_postback_$self$$.win.opener;
    $opener$$ ? ($unlisten$jscomp$2$$ = $listen$$module$src$event_helper$$($JSCompiler_StaticMethods_postback_$self$$.win, function($JSCompiler_StaticMethods_postback_$self$$) {
      $JSCompiler_StaticMethods_postback_$self$$.data && "amp" == $JSCompiler_StaticMethods_postback_$self$$.data.sentinel && "result-ack" == $JSCompiler_StaticMethods_postback_$self$$.data.type && $resolve$jscomp$18$$();
    }), $opener$$.postMessage({sentinel:"amp", type:"result", result:$response$jscomp$2$$}, "*"), $JSCompiler_StaticMethods_postback_$self$$.win.setTimeout(function() {
      $reject$jscomp$11$$(Error("Timed out"));
    }, 5000)) : $reject$jscomp$11$$(Error("Opener not available"));
  })).then(function() {
    $unlisten$jscomp$2$$();
  }, function($JSCompiler_StaticMethods_postback_$self$$) {
    $unlisten$jscomp$2$$();
    throw $JSCompiler_StaticMethods_postback_$self$$;
  });
}
$LoginDoneDialog$$module$build$all$amp_access_0_1$amp_login_done_dialog$$.prototype.$postbackSuccess_$ = function() {
  var $$jscomp$this$jscomp$3$$ = this;
  try {
    this.win.close();
  } catch ($e$jscomp$34$$) {
  }
  this.win.setTimeout(function() {
    $$jscomp$this$jscomp$3$$.$postbackError_$(Error("Failed to close the dialog"));
  }, 3000);
};
$LoginDoneDialog$$module$build$all$amp_access_0_1$amp_login_done_dialog$$.prototype.$postbackError_$ = function($error$jscomp$15$$) {
  var $$jscomp$this$jscomp$4$$ = this;
  this.win.console && this.win.console.log && (this.win.console.error || this.win.console.log).call(this.win.console, "Postback failed: ", $error$jscomp$15$$);
  var $doc$jscomp$8$$ = this.win.document;
  $doc$jscomp$8$$.documentElement.classList.toggle("amp-error", !0);
  $doc$jscomp$8$$.documentElement.setAttribute("data-error", "postback");
  $doc$jscomp$8$$.getElementById("closeButton").onclick = function() {
    try {
      $$jscomp$this$jscomp$4$$.win.close();
    } catch ($e$jscomp$35$$) {
    }
    $$jscomp$this$jscomp$4$$.win.setTimeout(function() {
      $$jscomp$this$jscomp$4$$.win.closed || $doc$jscomp$8$$.documentElement.setAttribute("data-error", "close");
    }, 1000);
  };
};
function $getService$$module$src$service$$($win$jscomp$51$$) {
  $win$jscomp$51$$ = $win$jscomp$51$$.__AMP_TOP || $win$jscomp$51$$;
  return $getServiceInternal$$module$src$service$$($win$jscomp$51$$, "ampdoc");
}
function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$) {
  var $JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
  $JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$ = $getAmpdoc$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$);
  $JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$ = $JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$.isSingleDoc() ? $JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$.win : $JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$;
  return $getServiceInternal$$module$src$service$$($JSCompiler_ampdoc$jscomp$inline_225_JSCompiler_inline_result$jscomp$201_ampdoc$jscomp$1$$, "viewer");
}
function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$1$$) {
  return $nodeOrDoc$jscomp$1$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$1$$.ownerDocument || $nodeOrDoc$jscomp$1$$).defaultView).getAmpDoc($nodeOrDoc$jscomp$1$$) : $nodeOrDoc$jscomp$1$$;
}
function $getServiceInternal$$module$src$service$$($holder$jscomp$3_s$jscomp$5$$, $id$jscomp$18$$) {
  var $JSCompiler_services$jscomp$inline_175$$ = $holder$jscomp$3_s$jscomp$5$$.services;
  $JSCompiler_services$jscomp$inline_175$$ || ($JSCompiler_services$jscomp$inline_175$$ = $holder$jscomp$3_s$jscomp$5$$.services = {});
  var $services$$ = $JSCompiler_services$jscomp$inline_175$$;
  $holder$jscomp$3_s$jscomp$5$$ = $services$$[$id$jscomp$18$$];
  $holder$jscomp$3_s$jscomp$5$$.obj || ($holder$jscomp$3_s$jscomp$5$$.obj = new $holder$jscomp$3_s$jscomp$5$$.ctor($holder$jscomp$3_s$jscomp$5$$.context), $holder$jscomp$3_s$jscomp$5$$.ctor = null, $holder$jscomp$3_s$jscomp$5$$.context = null, $holder$jscomp$3_s$jscomp$5$$.resolve && $holder$jscomp$3_s$jscomp$5$$.resolve($holder$jscomp$3_s$jscomp$5$$.obj));
  return $holder$jscomp$3_s$jscomp$5$$.obj;
}
;var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
var $bodyMadeVisible$$module$src$style_installer$$ = !1;
function $makeBodyVisibleRecovery$$module$src$style_installer$$($JSCompiler_element$jscomp$inline_227_doc$jscomp$13$$) {
  if (!$bodyMadeVisible$$module$src$style_installer$$) {
    $bodyMadeVisible$$module$src$style_installer$$ = !0;
    $JSCompiler_element$jscomp$inline_227_doc$jscomp$13$$ = $JSCompiler_element$jscomp$inline_227_doc$jscomp$13$$.body;
    var $JSCompiler_styles$jscomp$inline_228$$ = {opacity:1, visibility:"visible", animation:"none"}, $JSCompiler_k$jscomp$inline_229$$;
    for ($JSCompiler_k$jscomp$inline_229$$ in $JSCompiler_styles$jscomp$inline_228$$) {
      var $JSCompiler_element$jscomp$inline_231$$ = $JSCompiler_element$jscomp$inline_227_doc$jscomp$13$$, $JSCompiler_value$jscomp$inline_233$$ = $JSCompiler_styles$jscomp$inline_228$$[$JSCompiler_k$jscomp$inline_229$$];
      var $JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$ = $JSCompiler_element$jscomp$inline_231$$.style;
      var $JSCompiler_camelCase$jscomp$inline_238$$ = $JSCompiler_k$jscomp$inline_229$$;
      if ($startsWith$$module$src$string$$($JSCompiler_camelCase$jscomp$inline_238$$, "--")) {
        $JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$ = $JSCompiler_camelCase$jscomp$inline_238$$;
      } else {
        $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = $map$$module$src$utils$object$$());
        var $JSCompiler_propertyName$jscomp$inline_240$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_238$$];
        if (!$JSCompiler_propertyName$jscomp$inline_240$$) {
          $JSCompiler_propertyName$jscomp$inline_240$$ = $JSCompiler_camelCase$jscomp$inline_238$$;
          if (void 0 === $JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$[$JSCompiler_camelCase$jscomp$inline_238$$]) {
            var $JSCompiler_prefixedPropertyName$jscomp$inline_242_JSCompiler_titleCase$jscomp$inline_241$$ = $JSCompiler_camelCase$jscomp$inline_238$$.charAt(0).toUpperCase() + $JSCompiler_camelCase$jscomp$inline_238$$.slice(1);
            b: {
              for (var $JSCompiler_i$jscomp$inline_246$$ = 0; $JSCompiler_i$jscomp$inline_246$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_246$$++) {
                var $JSCompiler_propertyName$jscomp$inline_247$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_246$$] + $JSCompiler_prefixedPropertyName$jscomp$inline_242_JSCompiler_titleCase$jscomp$inline_241$$;
                if (void 0 !== $JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$[$JSCompiler_propertyName$jscomp$inline_247$$]) {
                  $JSCompiler_prefixedPropertyName$jscomp$inline_242_JSCompiler_titleCase$jscomp$inline_241$$ = $JSCompiler_propertyName$jscomp$inline_247$$;
                  break b;
                }
              }
              $JSCompiler_prefixedPropertyName$jscomp$inline_242_JSCompiler_titleCase$jscomp$inline_241$$ = "";
            }
            void 0 !== $JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$[$JSCompiler_prefixedPropertyName$jscomp$inline_242_JSCompiler_titleCase$jscomp$inline_241$$] && ($JSCompiler_propertyName$jscomp$inline_240$$ = $JSCompiler_prefixedPropertyName$jscomp$inline_242_JSCompiler_titleCase$jscomp$inline_241$$);
          }
          $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_238$$] = $JSCompiler_propertyName$jscomp$inline_240$$;
        }
        $JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$ = $JSCompiler_propertyName$jscomp$inline_240$$;
      }
      $JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$ && ($JSCompiler_element$jscomp$inline_231$$.style[$JSCompiler_propertyName$jscomp$inline_235_JSCompiler_style$jscomp$inline_237$$] = $JSCompiler_value$jscomp$inline_233$$);
    }
  }
}
;function $isDocumentReady$$module$src$document_ready$$($doc$jscomp$17$$) {
  return "loading" != $doc$jscomp$17$$.readyState && "uninitialized" != $doc$jscomp$17$$.readyState;
}
function $onDocumentState$$module$src$document_ready$$($doc$jscomp$20$$, $callback$jscomp$62$$) {
  var $stateFn$$ = $isDocumentReady$$module$src$document_ready$$, $ready$$ = $stateFn$$($doc$jscomp$20$$);
  if ($ready$$) {
    $callback$jscomp$62$$($doc$jscomp$20$$);
  } else {
    var $readyListener$$ = function() {
      $stateFn$$($doc$jscomp$20$$) && ($ready$$ || ($ready$$ = !0, $callback$jscomp$62$$($doc$jscomp$20$$)), $doc$jscomp$20$$.removeEventListener("readystatechange", $readyListener$$));
    };
    $doc$jscomp$20$$.addEventListener("readystatechange", $readyListener$$);
  }
}
;function $exponentialBackoff$$module$src$exponential_backoff$$() {
  var $getTimeout$$ = $exponentialBackoffClock$$module$src$exponential_backoff$$();
  return function($work$$) {
    return setTimeout($work$$, $getTimeout$$());
  };
}
function $exponentialBackoffClock$$module$src$exponential_backoff$$() {
  var $count$jscomp$15$$ = 0;
  return function() {
    var $wait$$ = Math.pow(1.5, $count$jscomp$15$$++);
    var $JSCompiler_jitter$jscomp$inline_181_JSCompiler_opt_perc$jscomp$inline_180$$ = $wait$$ * ($JSCompiler_jitter$jscomp$inline_181_JSCompiler_opt_perc$jscomp$inline_180$$ || .3) * Math.random();
    .5 < Math.random() && ($JSCompiler_jitter$jscomp$inline_181_JSCompiler_opt_perc$jscomp$inline_180$$ *= -1);
    $wait$$ += $JSCompiler_jitter$jscomp$inline_181_JSCompiler_opt_perc$jscomp$inline_180$$;
    return 1000 * $wait$$;
  };
}
;var $accumulatedErrorMessages$$module$src$error$$ = self.AMPErrors || [];
self.AMPErrors = $accumulatedErrorMessages$$module$src$error$$;
function $reportingBackoff$$module$src$error$$($work$jscomp$1$$) {
  $reportingBackoff$$module$src$error$$ = $exponentialBackoff$$module$src$exponential_backoff$$();
  return $reportingBackoff$$module$src$error$$($work$jscomp$1$$);
}
function $tryJsonStringify$$module$src$error$$($value$jscomp$117$$) {
  try {
    return JSON.stringify($value$jscomp$117$$);
  } catch ($e$jscomp$40$$) {
    return String($value$jscomp$117$$);
  }
}
var $detectedJsEngine$$module$src$error$$;
function $onError$$module$src$error$$($message$jscomp$29$$, $filename$$, $line$$, $col$$, $error$jscomp$18$$) {
  var $$jscomp$this$jscomp$5$$ = this;
  this && this.document && $makeBodyVisibleRecovery$$module$src$style_installer$$(this.document);
  if (!$getMode$$module$src$mode$$().development) {
    var $hasNonAmpJs$$ = !1;
    try {
      $hasNonAmpJs$$ = $detectNonAmpJs$$module$src$error$$();
    } catch ($ignore$jscomp$1$$) {
    }
    if (!($hasNonAmpJs$$ && 0.01 < Math.random())) {
      var $data$jscomp$34$$ = $getErrorReportData$$module$src$error$$($message$jscomp$29$$, $filename$$, $line$$, $col$$, $error$jscomp$18$$, $hasNonAmpJs$$);
      $data$jscomp$34$$ && $reportingBackoff$$module$src$error$$(function() {
        return $reportErrorToServerOrViewer$$module$src$error$$($$jscomp$this$jscomp$5$$, $data$jscomp$34$$);
      });
    }
  }
}
function $reportErrorToServerOrViewer$$module$src$error$$($win$jscomp$86$$, $data$jscomp$35$$) {
  return $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$86$$, $data$jscomp$35$$).then(function($win$jscomp$86$$) {
    if (!$win$jscomp$86$$) {
      var $reportedErrorToViewer$$ = new XMLHttpRequest;
      $reportedErrorToViewer$$.open("POST", $urls$$module$src$config$$.errorReporting, !0);
      $reportedErrorToViewer$$.send(JSON.stringify($data$jscomp$35$$));
    }
  });
}
function $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$87$$, $data$jscomp$36$$) {
  var $ampdocService$$ = $getService$$module$src$service$$($win$jscomp$87$$);
  if (!$ampdocService$$.isSingleDoc()) {
    return Promise.resolve(!1);
  }
  var $ampdocSingle$$ = $ampdocService$$.getAmpDoc(), $htmlElement$$ = $ampdocSingle$$.getRootNode().documentElement, $docOptedIn$$ = $htmlElement$$.hasAttribute("report-errors-to-viewer");
  if (!$docOptedIn$$) {
    return Promise.resolve(!1);
  }
  var $viewer$$ = $getServiceForDoc$$module$src$service$$($ampdocSingle$$);
  return $viewer$$.hasCapability("errorReporter") ? $viewer$$.isTrustedViewer().then(function($win$jscomp$87$$) {
    if (!$win$jscomp$87$$) {
      return !1;
    }
    $viewer$$.sendMessage("error", $dict$$module$src$utils$object$$({m:$data$jscomp$36$$.m, a:$data$jscomp$36$$.a, s:$data$jscomp$36$$.s, el:$data$jscomp$36$$.el, v:$data$jscomp$36$$.v, jse:$data$jscomp$36$$.jse}));
    return !0;
  }) : Promise.resolve(!1);
}
function $getErrorReportData$$module$src$error$$($message$jscomp$31$$, $JSCompiler_element$jscomp$inline_192_filename$jscomp$1$$, $line$jscomp$1$$, $col$jscomp$1$$, $error$jscomp$20$$, $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$) {
  var $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$ = $message$jscomp$31$$;
  $error$jscomp$20$$ && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$ = $error$jscomp$20$$.message ? $error$jscomp$20$$.message : String($error$jscomp$20$$));
  $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$ || ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$ = "Unknown error");
  $message$jscomp$31$$ = $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$;
  var $expected$$ = !(!$error$jscomp$20$$ || !$error$jscomp$20$$.expected);
  if (!/_reported_/.test($message$jscomp$31$$) && "CANCELLED" != $message$jscomp$31$$) {
    var $detachedWindow$$ = !(self && self.window), $throttleBase$$ = Math.random();
    if (-1 != $message$jscomp$31$$.indexOf("Failed to load:") || "Script error." == $message$jscomp$31$$ || $detachedWindow$$) {
      if ($expected$$ = !0, 0.001 < $throttleBase$$) {
        return;
      }
    }
    var $isUserError$$ = 0 <= $message$jscomp$31$$.indexOf("\u200b\u200b\u200b");
    if (!($isUserError$$ && 0.1 < $throttleBase$$)) {
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$ = Object.create(null);
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.v = $getMode$$module$src$mode$$().rtvVersion;
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.noAmp = $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.m = $message$jscomp$31$$.replace("\u200b\u200b\u200b", "");
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.a = $isUserError$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.ex = $expected$$ ? "1" : "0";
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.dw = $detachedWindow$$ ? "1" : "0";
      var $runtime$$ = "1p";
      self.context && self.context.location ? ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$["3p"] = "1", $runtime$$ = "3p") : $getMode$$module$src$mode$$().runtime && ($runtime$$ = $getMode$$module$src$mode$$().runtime);
      $getMode$$module$src$mode$$().singlePassType && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.spt = $getMode$$module$src$mode$$().singlePassType);
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.rt = $runtime$$;
      "inabox" === $runtime$$ && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.adid = $getMode$$module$src$mode$$().a4aId);
      $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.ca = $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.canary ? "1" : "0";
      $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$ = self;
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.bt = $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type ? $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type : "unknown";
      self.location.ancestorOrigins && self.location.ancestorOrigins[0] && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.or = self.location.ancestorOrigins[0]);
      self.viewerState && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.vs = self.viewerState);
      self.parent && self.parent != self && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.iem = "1");
      if (self.AMP && self.AMP.viewer) {
        var $resolvedViewerUrl$$ = self.AMP.viewer.getResolvedViewerUrl(), $messagingOrigin$$ = self.AMP.viewer.maybeGetMessagingOrigin();
        $resolvedViewerUrl$$ && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.rvu = $resolvedViewerUrl$$);
        $messagingOrigin$$ && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.mso = $messagingOrigin$$);
      }
      $detectedJsEngine$$module$src$error$$ || ($detectedJsEngine$$module$src$error$$ = $detectJsEngineFromStack$$module$src$error$$());
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.jse = $detectedJsEngine$$module$src$error$$;
      var $exps$$ = [];
      $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$ = self.__AMP__EXPERIMENT_TOGGLES || null;
      for (var $exp$$ in $JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$) {
        $exps$$.push($exp$$ + "=" + ($JSCompiler_inline_result$jscomp$35_JSCompiler_win$jscomp$inline_186_JSCompiler_win$jscomp$inline_188_hasNonAmpJs$jscomp$1$$[$exp$$] ? "1" : "0"));
      }
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.exps = $exps$$.join(",");
      $error$jscomp$20$$ ? ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.el = $error$jscomp$20$$.associatedElement ? $error$jscomp$20$$.associatedElement.tagName : "u", $error$jscomp$20$$.args && ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.args = JSON.stringify($error$jscomp$20$$.args)), $isUserError$$ || $error$jscomp$20$$.ignoreStack || !$error$jscomp$20$$.stack || ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.s = $error$jscomp$20$$.stack), $error$jscomp$20$$.message && 
      ($error$jscomp$20$$.message += " _reported_")) : ($JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.f = $JSCompiler_element$jscomp$inline_192_filename$jscomp$1$$ || "", $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.l = $line$jscomp$1$$ || "", $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.c = $col$jscomp$1$$ || "");
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.r = self.document.referrer;
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.ae = $accumulatedErrorMessages$$module$src$error$$.join(",");
      $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$.fr = self.location.originalHash || self.location.hash;
      $JSCompiler_element$jscomp$inline_192_filename$jscomp$1$$ = $message$jscomp$31$$;
      25 <= $accumulatedErrorMessages$$module$src$error$$.length && $accumulatedErrorMessages$$module$src$error$$.splice(0, $accumulatedErrorMessages$$module$src$error$$.length - 25 + 1);
      $accumulatedErrorMessages$$module$src$error$$.push($JSCompiler_element$jscomp$inline_192_filename$jscomp$1$$);
      return $JSCompiler_message$jscomp$inline_183_data$jscomp$37$$;
    }
  }
}
function $detectNonAmpJs$$module$src$error$$() {
  for (var $scripts$jscomp$2$$ = self.document.querySelectorAll("script[src]"), $i$jscomp$51$$ = 0; $i$jscomp$51$$ < $scripts$jscomp$2$$.length; $i$jscomp$51$$++) {
    var $JSCompiler_url$jscomp$inline_196$$ = $scripts$jscomp$2$$[$i$jscomp$51$$].src.toLowerCase();
    "string" == typeof $JSCompiler_url$jscomp$inline_196$$ && ($JSCompiler_url$jscomp$inline_196$$ = $parseUrlDeprecated$$module$src$url$$($JSCompiler_url$jscomp$inline_196$$));
    if (!$urls$$module$src$config$$.cdnProxyRegex.test($JSCompiler_url$jscomp$inline_196$$.origin)) {
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
  } catch ($e$jscomp$41$$) {
    $object$jscomp$1_stack$jscomp$1$$ = $e$jscomp$41$$.stack;
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
;(function() {
  $bodyMadeVisible$$module$src$style_installer$$ = !0;
})(window);
(function() {
  $logConstructor$$module$src$log$$ = $Log$$module$src$log$$;
  $dev$$module$src$log$$();
  $user$$module$src$log$$();
})();
(function($fn$$) {
  self.reportError = $fn$$;
})(function($error$jscomp$17$$, $opt_associatedElement$jscomp$1$$) {
  try {
    if ($error$jscomp$17$$) {
      if (void 0 !== $error$jscomp$17$$.message) {
        $error$jscomp$17$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$17$$);
      } else {
        var $origError$$ = $error$jscomp$17$$;
        $error$jscomp$17$$ = Error($tryJsonStringify$$module$src$error$$($origError$$));
        $error$jscomp$17$$.origError = $origError$$;
      }
    } else {
      $error$jscomp$17$$ = Error("Unknown error");
    }
    if ($error$jscomp$17$$.reported) {
      return $error$jscomp$17$$;
    }
    $error$jscomp$17$$.reported = !0;
    var $element$jscomp$65$$ = $opt_associatedElement$jscomp$1$$ || $error$jscomp$17$$.associatedElement;
    $element$jscomp$65$$ && $element$jscomp$65$$.classList && ($element$jscomp$65$$.classList.add("i-amphtml-error"), $getMode$$module$src$mode$$().development && ($element$jscomp$65$$.classList.add("i-amphtml-element-error"), $element$jscomp$65$$.setAttribute("error-message", $error$jscomp$17$$.message)));
    if (self.console) {
      var $output$jscomp$3$$ = console.error || console.log;
      $error$jscomp$17$$.messageArray ? $output$jscomp$3$$.apply(console, $error$jscomp$17$$.messageArray) : $element$jscomp$65$$ ? $output$jscomp$3$$.call(console, $error$jscomp$17$$.message, $element$jscomp$65$$) : $output$jscomp$3$$.call(console, $error$jscomp$17$$.message);
    }
    $element$jscomp$65$$ && $element$jscomp$65$$.$dispatchCustomEventForTesting$ && $element$jscomp$65$$.$dispatchCustomEventForTesting$("amp:error", $error$jscomp$17$$.message);
    $onError$$module$src$error$$.call(void 0, void 0, void 0, void 0, void 0, $error$jscomp$17$$);
  } catch ($errorReportingError$$) {
    setTimeout(function() {
      throw $errorReportingError$$;
    });
  }
  return $error$jscomp$17$$;
});
(function($doc$jscomp$19$$, $callback$jscomp$61$$) {
  $onDocumentState$$module$src$document_ready$$($doc$jscomp$19$$, $callback$jscomp$61$$);
})(document, function() {
  (new $LoginDoneDialog$$module$build$all$amp_access_0_1$amp_login_done_dialog$$).start();
});
})();
//# sourceMappingURL=amp-login-done-0.1.js.map

