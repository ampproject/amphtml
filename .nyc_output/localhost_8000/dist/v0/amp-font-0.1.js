(self.AMP=self.AMP||[]).push({n:"amp-font",v:"2007210308000",f:(function(AMP,_){
var $$jscomp$objectCreate$$ = "function" == typeof Object.create ? Object.create : function($prototype$$) {
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
var $JSCompiler_temp$jscomp$13$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$13$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$14$$;
  a: {
    var $JSCompiler_x$jscomp$inline_20$$ = {a:!0}, $JSCompiler_y$jscomp$inline_21$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_21$$.__proto__ = $JSCompiler_x$jscomp$inline_20$$;
      $JSCompiler_inline_result$jscomp$14$$ = $JSCompiler_y$jscomp$inline_21$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_22$$) {
    }
    $JSCompiler_inline_result$jscomp$14$$ = !1;
  }
  $JSCompiler_temp$jscomp$13$$ = $JSCompiler_inline_result$jscomp$14$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$13$$;
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
;(function($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
})({c:!0, v:!0, a:!0, ad:!0, action:!0});
function $getService$$module$src$service$$($JSCompiler_holder$jscomp$inline_27_win$jscomp$25$$, $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$) {
  $JSCompiler_holder$jscomp$inline_27_win$jscomp$25$$ = $JSCompiler_holder$jscomp$inline_27_win$jscomp$25$$.__AMP_TOP || ($JSCompiler_holder$jscomp$inline_27_win$jscomp$25$$.__AMP_TOP = $JSCompiler_holder$jscomp$inline_27_win$jscomp$25$$);
  var $JSCompiler_services$jscomp$inline_77$$ = $JSCompiler_holder$jscomp$inline_27_win$jscomp$25$$.__AMP_SERVICES;
  $JSCompiler_services$jscomp$inline_77$$ || ($JSCompiler_services$jscomp$inline_77$$ = $JSCompiler_holder$jscomp$inline_27_win$jscomp$25$$.__AMP_SERVICES = {});
  $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$ = $JSCompiler_services$jscomp$inline_77$$[$JSCompiler_s$jscomp$inline_29_id$jscomp$13$$];
  $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.obj || ($JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.obj = new $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.ctor($JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.context), $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.ctor = null, $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.context = null, $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.resolve && $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.resolve($JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.obj));
  return $JSCompiler_s$jscomp$inline_29_id$jscomp$13$$.obj;
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyles$$module$src$style$$($element$jscomp$65$$, $styles$jscomp$1$$) {
  for (var $k$jscomp$4$$ in $styles$jscomp$1$$) {
    var $JSCompiler_element$jscomp$inline_31$$ = $element$jscomp$65$$, $JSCompiler_styleValue$jscomp$inline_37_JSCompiler_value$jscomp$inline_33$$ = $styles$jscomp$1$$[$k$jscomp$4$$];
    var $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$ = $JSCompiler_element$jscomp$inline_31$$.style;
    var $JSCompiler_camelCase$jscomp$inline_80$$ = $k$jscomp$4$$;
    if (2 > $JSCompiler_camelCase$jscomp$inline_80$$.length ? 0 : 0 == $JSCompiler_camelCase$jscomp$inline_80$$.lastIndexOf("--", 0)) {
      $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$ = $JSCompiler_camelCase$jscomp$inline_80$$;
    } else {
      $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
      var $JSCompiler_propertyName$jscomp$inline_82$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_80$$];
      if (!$JSCompiler_propertyName$jscomp$inline_82$$) {
        $JSCompiler_propertyName$jscomp$inline_82$$ = $JSCompiler_camelCase$jscomp$inline_80$$;
        if (void 0 === $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$[$JSCompiler_camelCase$jscomp$inline_80$$]) {
          var $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$ = $JSCompiler_camelCase$jscomp$inline_80$$;
          $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$ = $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$.charAt(0).toUpperCase() + $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$.slice(1);
          b: {
            for (var $JSCompiler_i$jscomp$inline_92$$ = 0; $JSCompiler_i$jscomp$inline_92$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_92$$++) {
              var $JSCompiler_propertyName$jscomp$inline_93$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_92$$] + $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$;
              if (void 0 !== $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$[$JSCompiler_propertyName$jscomp$inline_93$$]) {
                $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$ = $JSCompiler_propertyName$jscomp$inline_93$$;
                break b;
              }
            }
            $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$ = "";
          }
          void 0 !== $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$[$JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$] && ($JSCompiler_propertyName$jscomp$inline_82$$ = $JSCompiler_camelCase$jscomp$inline_88_JSCompiler_prefixedPropertyName$jscomp$inline_84_JSCompiler_titleCase$jscomp$inline_83$$);
        }
        $propertyNameCache$$module$src$style$$[$JSCompiler_camelCase$jscomp$inline_80$$] = $JSCompiler_propertyName$jscomp$inline_82$$;
      }
      $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$ = $JSCompiler_propertyName$jscomp$inline_82$$;
    }
    $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$ && ((2 > $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$.length ? 0 : 0 == $JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$.lastIndexOf("--", 0)) ? $JSCompiler_element$jscomp$inline_31$$.style.setProperty($JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$, $JSCompiler_styleValue$jscomp$inline_37_JSCompiler_value$jscomp$inline_33$$) : 
    $JSCompiler_element$jscomp$inline_31$$.style[$JSCompiler_propertyName$jscomp$inline_36_JSCompiler_style$jscomp$inline_79$$] = $JSCompiler_styleValue$jscomp$inline_37_JSCompiler_value$jscomp$inline_33$$);
  }
}
;var $DEFAULT_FONTS_$$module$extensions$amp_font$0_1$fontloader$$ = ["sans-serif", "serif"];
function $FontLoader$$module$extensions$amp_font$0_1$fontloader$$($ampdoc$jscomp$12$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$12$$;
  this.$document_$ = $ampdoc$jscomp$12$$.win.document;
  this.$fontConfig_$ = this.$container_$ = null;
  this.$fontLoadRejected_$ = this.$fontLoadResolved_$ = !1;
}
$FontLoader$$module$extensions$amp_font$0_1$fontloader$$.prototype.load = function($fontConfig$$, $timeout$jscomp$3$$) {
  var $$jscomp$this$jscomp$2$$ = this;
  this.$fontConfig_$ = $fontConfig$$;
  return $getService$$module$src$service$$(this.$ampdoc_$.win, "timer").timeoutPromise($timeout$jscomp$3$$, $JSCompiler_StaticMethods_load_$$(this)).then(function() {
    $$jscomp$this$jscomp$2$$.$fontLoadResolved_$ = !0;
    $$jscomp$this$jscomp$2$$.$dispose_$();
  }, function($fontConfig$$) {
    $$jscomp$this$jscomp$2$$.$fontLoadRejected_$ = !0;
    $$jscomp$this$jscomp$2$$.$dispose_$();
    throw $fontConfig$$;
  });
};
function $JSCompiler_StaticMethods_load_$$($JSCompiler_StaticMethods_load_$self$$) {
  return new Promise(function($resolve$jscomp$7$$, $reject$jscomp$4$$) {
    var $fontString$$ = $JSCompiler_StaticMethods_load_$self$$.$fontConfig_$.fontStyle + " " + $JSCompiler_StaticMethods_load_$self$$.$fontConfig_$.variant + " " + $JSCompiler_StaticMethods_load_$self$$.$fontConfig_$.weight + " " + $JSCompiler_StaticMethods_load_$self$$.$fontConfig_$.size + " '" + $JSCompiler_StaticMethods_load_$self$$.$fontConfig_$.family + "'";
    "fonts" in $JSCompiler_StaticMethods_load_$self$$.$document_$ ? $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.check($fontString$$) ? $resolve$jscomp$7$$() : $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.load($fontString$$).then(function() {
      return $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.load($fontString$$);
    }).then(function() {
      $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.check($fontString$$) ? $resolve$jscomp$7$$() : $reject$jscomp$4$$(Error("Font could not be loaded, probably due to incorrect @font-face."));
    }).catch($reject$jscomp$4$$) : $JSCompiler_StaticMethods_loadWithPolyfill_$$($JSCompiler_StaticMethods_load_$self$$).then($resolve$jscomp$7$$, $reject$jscomp$4$$);
  });
}
function $JSCompiler_StaticMethods_loadWithPolyfill_$$($JSCompiler_StaticMethods_loadWithPolyfill_$self$$) {
  return new Promise(function($resolve$jscomp$8$$, $reject$jscomp$5$$) {
    var $vsync$$ = $getService$$module$src$service$$($JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$ampdoc_$.win, "vsync"), $comparators$$ = $JSCompiler_StaticMethods_createFontComparators_$$($JSCompiler_StaticMethods_loadWithPolyfill_$self$$), $vsyncTask$$ = $vsync$$.createTask({measure:function() {
      $JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$fontLoadResolved_$ ? $resolve$jscomp$8$$() : $JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$fontLoadRejected_$ ? $reject$jscomp$5$$(Error("Font loading timed out.")) : $comparators$$.some(function($JSCompiler_StaticMethods_loadWithPolyfill_$self$$) {
        return $JSCompiler_StaticMethods_loadWithPolyfill_$self$$.compare();
      }) ? $resolve$jscomp$8$$() : $vsyncTask$$();
    }});
    $vsyncTask$$();
  });
}
function $JSCompiler_StaticMethods_createFontComparators_$$($JSCompiler_StaticMethods_createFontComparators_$self$$) {
  var $containerElement$$ = $JSCompiler_StaticMethods_createFontComparators_$self$$.$container_$ = $JSCompiler_StaticMethods_createFontComparators_$self$$.$document_$.createElement("div");
  $setStyles$$module$src$style$$($containerElement$$, {fontSize:"40px", fontVariant:$JSCompiler_StaticMethods_createFontComparators_$self$$.$fontConfig_$.variant, fontWeight:$JSCompiler_StaticMethods_createFontComparators_$self$$.$fontConfig_$.weight, fontStyle:$JSCompiler_StaticMethods_createFontComparators_$self$$.$fontConfig_$.fontStyle, left:"-999px", lineHeight:"normal", margin:0, padding:0, position:"absolute", top:"-999px", visibility:"hidden"});
  var $comparators$jscomp$1$$ = $DEFAULT_FONTS_$$module$extensions$amp_font$0_1$fontloader$$.map(function($comparators$jscomp$1$$) {
    return new $FontComparator$$module$extensions$amp_font$0_1$fontloader$$($containerElement$$, $JSCompiler_StaticMethods_createFontComparators_$self$$.$fontConfig_$.family, $comparators$jscomp$1$$);
  });
  $JSCompiler_StaticMethods_createFontComparators_$self$$.$ampdoc_$.getBody().appendChild($containerElement$$);
  return $comparators$jscomp$1$$;
}
$FontLoader$$module$extensions$amp_font$0_1$fontloader$$.prototype.$dispose_$ = function() {
  if (this.$container_$) {
    var $JSCompiler_element$jscomp$inline_39$$ = this.$container_$;
    $JSCompiler_element$jscomp$inline_39$$.parentElement && $JSCompiler_element$jscomp$inline_39$$.parentElement.removeChild($JSCompiler_element$jscomp$inline_39$$);
  }
  this.$container_$ = null;
};
function $FontComparator$$module$extensions$amp_font$0_1$fontloader$$($container$jscomp$4$$, $customFont$$, $defaultFont$jscomp$1$$) {
  var $doc$jscomp$6$$ = $container$jscomp$4$$.ownerDocument, $testFontFamily$$ = $customFont$$ + "," + $defaultFont$jscomp$1$$;
  this.$defaultFontElement_$ = $JSCompiler_StaticMethods_getFontElement_$$($doc$jscomp$6$$, $defaultFont$jscomp$1$$);
  this.$testFontElement_$ = $JSCompiler_StaticMethods_getFontElement_$$($doc$jscomp$6$$, $testFontFamily$$);
  $container$jscomp$4$$.appendChild(this.$defaultFontElement_$);
  $container$jscomp$4$$.appendChild(this.$testFontElement_$);
}
function $JSCompiler_StaticMethods_getFontElement_$$($doc$jscomp$7_element$jscomp$68$$, $fontFamily$jscomp$1$$) {
  $doc$jscomp$7_element$jscomp$68$$ = $doc$jscomp$7_element$jscomp$68$$.createElement("div");
  $doc$jscomp$7_element$jscomp$68$$.textContent = "MAxmTYklsjo190QW";
  $setStyles$$module$src$style$$($doc$jscomp$7_element$jscomp$68$$, {float:"left", fontFamily:$fontFamily$jscomp$1$$, margin:0, padding:0, whiteSpace:"nowrap"});
  return $doc$jscomp$7_element$jscomp$68$$;
}
$FontComparator$$module$extensions$amp_font$0_1$fontloader$$.prototype.compare = function() {
  var $hasHeightChanged$$ = 2 < Math.abs(this.$defaultFontElement_$.offsetHeight - this.$testFontElement_$.offsetHeight);
  return 2 < Math.abs(this.$defaultFontElement_$.offsetWidth - this.$testFontElement_$.offsetWidth) || $hasHeightChanged$$;
};
function $AmpFont$$module$extensions$amp_font$0_1$amp_font$$($$jscomp$super$this_element$jscomp$69$$) {
  $$jscomp$super$this_element$jscomp$69$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$69$$) || this;
  $$jscomp$super$this_element$jscomp$69$$.$fontFamily_$ = "";
  $$jscomp$super$this_element$jscomp$69$$.$fontWeight_$ = "";
  $$jscomp$super$this_element$jscomp$69$$.$fontStyle_$ = "";
  $$jscomp$super$this_element$jscomp$69$$.$fontVariant_$ = "";
  $$jscomp$super$this_element$jscomp$69$$.$fontLoader_$ = null;
  return $$jscomp$super$this_element$jscomp$69$$;
}
var $JSCompiler_parentCtor$jscomp$inline_42$$ = AMP.BaseElement;
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_42$$.prototype);
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.prototype.constructor = $AmpFont$$module$extensions$amp_font$0_1$amp_font$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpFont$$module$extensions$amp_font$0_1$amp_font$$, $JSCompiler_parentCtor$jscomp$inline_42$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_43$$ in $JSCompiler_parentCtor$jscomp$inline_42$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_43$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_44$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_42$$, $JSCompiler_p$jscomp$inline_43$$);
        $JSCompiler_descriptor$jscomp$inline_44$$ && Object.defineProperty($AmpFont$$module$extensions$amp_font$0_1$amp_font$$, $JSCompiler_p$jscomp$inline_43$$, $JSCompiler_descriptor$jscomp$inline_44$$);
      } else {
        $AmpFont$$module$extensions$amp_font$0_1$amp_font$$[$JSCompiler_p$jscomp$inline_43$$] = $JSCompiler_parentCtor$jscomp$inline_42$$[$JSCompiler_p$jscomp$inline_43$$];
      }
    }
  }
}
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_42$$.prototype;
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.prototype.prerenderAllowed = function() {
  return !0;
};
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.prototype.buildCallback = function() {
  var $JSCompiler_shouldBeTrueish$jscomp$inline_46$$ = this.element.getAttribute("font-family"), $JSCompiler_opt_1$jscomp$inline_47$$ = this.element;
  this.$fontFamily_$ = $user$$module$src$log$$().assert($JSCompiler_shouldBeTrueish$jscomp$inline_46$$, "The font-family attribute is required for <amp-font> %s", $JSCompiler_opt_1$jscomp$inline_47$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
  this.$fontWeight_$ = this.element.getAttribute("font-weight") || "400";
  this.$fontStyle_$ = this.element.getAttribute("font-style") || "normal";
  this.$fontVariant_$ = this.element.getAttribute("font-variant") || "normal";
  this.$fontLoader_$ = new $FontLoader$$module$extensions$amp_font$0_1$fontloader$$(this.getAmpDoc());
  $JSCompiler_StaticMethods_startLoad_$$(this);
};
function $JSCompiler_StaticMethods_startLoad_$$($JSCompiler_StaticMethods_startLoad_$self$$) {
  $JSCompiler_StaticMethods_startLoad_$self$$.$fontLoader_$.load({fontStyle:$JSCompiler_StaticMethods_startLoad_$self$$.$fontStyle_$, variant:$JSCompiler_StaticMethods_startLoad_$self$$.$fontVariant_$, weight:$JSCompiler_StaticMethods_startLoad_$self$$.$fontWeight_$, size:"medium", family:$JSCompiler_StaticMethods_startLoad_$self$$.$fontFamily_$}, $JSCompiler_StaticMethods_getTimeout_$$($JSCompiler_StaticMethods_startLoad_$self$$)).then(function() {
    var $JSCompiler_addClassName$jscomp$inline_59$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-load-add-class"), $JSCompiler_removeClassName$jscomp$inline_60$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-load-remove-class");
    $JSCompiler_StaticMethods_onFontLoadFinish_$$($JSCompiler_StaticMethods_startLoad_$self$$, $JSCompiler_addClassName$jscomp$inline_59$$, $JSCompiler_removeClassName$jscomp$inline_60$$);
  }).catch(function() {
    var $JSCompiler_addClassName$jscomp$inline_63$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-error-add-class"), $JSCompiler_removeClassName$jscomp$inline_64$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-error-remove-class");
    $JSCompiler_StaticMethods_onFontLoadFinish_$$($JSCompiler_StaticMethods_startLoad_$self$$, $JSCompiler_addClassName$jscomp$inline_63$$, $JSCompiler_removeClassName$jscomp$inline_64$$);
    $user$$module$src$log$$().warn("amp-font", "Font download timed out for " + $JSCompiler_StaticMethods_startLoad_$self$$.$fontFamily_$);
  });
}
function $JSCompiler_StaticMethods_onFontLoadFinish_$$($JSCompiler_StaticMethods_onFontLoadFinish_$self$$, $addClassName$jscomp$2$$, $removeClassName$jscomp$2$$) {
  var $ampdoc$jscomp$13_root$jscomp$9$$ = $JSCompiler_StaticMethods_onFontLoadFinish_$self$$.getAmpDoc();
  $ampdoc$jscomp$13_root$jscomp$9$$ = $ampdoc$jscomp$13_root$jscomp$9$$.getRootNode().documentElement || $ampdoc$jscomp$13_root$jscomp$9$$.getBody();
  $addClassName$jscomp$2$$ && $ampdoc$jscomp$13_root$jscomp$9$$.classList.add($addClassName$jscomp$2$$);
  $removeClassName$jscomp$2$$ && $ampdoc$jscomp$13_root$jscomp$9$$.classList.remove($removeClassName$jscomp$2$$);
  $JSCompiler_StaticMethods_onFontLoadFinish_$self$$.$dispose_$();
}
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.prototype.$dispose_$ = function() {
  this.$fontLoader_$ = null;
};
function $JSCompiler_StaticMethods_getTimeout_$$($JSCompiler_StaticMethods_getTimeout_$self$$) {
  var $timeoutInMs$$ = parseInt($JSCompiler_StaticMethods_getTimeout_$self$$.element.getAttribute("timeout"), 10), $JSCompiler_value$jscomp$inline_66$$ = $timeoutInMs$$;
  $timeoutInMs$$ = "number" !== typeof $JSCompiler_value$jscomp$inline_66$$ || !isFinite($JSCompiler_value$jscomp$inline_66$$) || 0 > $timeoutInMs$$ ? 3000 : $timeoutInMs$$;
  return $timeoutInMs$$ = Math.max($timeoutInMs$$ - $getService$$module$src$service$$($JSCompiler_StaticMethods_getTimeout_$self$$.win, "timer").timeSinceStart(), 100);
}
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-font", $AmpFont$$module$extensions$amp_font$0_1$amp_font$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-font-0.1.js.map
