(self.AMP=self.AMP||[]).push({n:"amp-anim",v:"2007210308000",f:(function(AMP,_){
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
var $JSCompiler_temp$jscomp$10$$;
if ("function" == typeof Object.setPrototypeOf) {
  $JSCompiler_temp$jscomp$10$$ = Object.setPrototypeOf;
} else {
  var $JSCompiler_inline_result$jscomp$11$$;
  a: {
    var $JSCompiler_x$jscomp$inline_13$$ = {a:!0}, $JSCompiler_y$jscomp$inline_14$$ = {};
    try {
      $JSCompiler_y$jscomp$inline_14$$.__proto__ = $JSCompiler_x$jscomp$inline_13$$;
      $JSCompiler_inline_result$jscomp$11$$ = $JSCompiler_y$jscomp$inline_14$$.a;
      break a;
    } catch ($JSCompiler_e$jscomp$inline_15$$) {
    }
    $JSCompiler_inline_result$jscomp$11$$ = !1;
  }
  $JSCompiler_temp$jscomp$10$$ = $JSCompiler_inline_result$jscomp$11$$ ? function($target$jscomp$95$$, $proto$jscomp$3$$) {
    $target$jscomp$95$$.__proto__ = $proto$jscomp$3$$;
    if ($target$jscomp$95$$.__proto__ !== $proto$jscomp$3$$) {
      throw new TypeError($target$jscomp$95$$ + " is not extensible");
    }
    return $target$jscomp$95$$;
  } : null;
}
var $$jscomp$setPrototypeOf$$ = $JSCompiler_temp$jscomp$10$$;
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
var $propertyNameCache$$module$src$style$$, $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
function $setStyle$$module$src$style$$($element$jscomp$14$$, $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$93$$) {
  var $JSCompiler_style$jscomp$inline_17$$ = $element$jscomp$14$$.style;
  if (2 > $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$.length || 0 != $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$.lastIndexOf("--", 0)) {
    $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = Object.create(null));
    var $JSCompiler_propertyName$jscomp$inline_20$$ = $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$];
    if (!$JSCompiler_propertyName$jscomp$inline_20$$) {
      $JSCompiler_propertyName$jscomp$inline_20$$ = $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$;
      if (void 0 === $JSCompiler_style$jscomp$inline_17$$[$JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$]) {
        var $JSCompiler_inline_result$jscomp$37_JSCompiler_inline_result$jscomp$38_JSCompiler_prefixedPropertyName$jscomp$inline_22$$ = $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$.charAt(0).toUpperCase() + $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$.slice(1);
        b: {
          for (var $JSCompiler_i$jscomp$inline_45$$ = 0; $JSCompiler_i$jscomp$inline_45$$ < $vendorPrefixes$$module$src$style$$.length; $JSCompiler_i$jscomp$inline_45$$++) {
            var $JSCompiler_propertyName$jscomp$inline_46$$ = $vendorPrefixes$$module$src$style$$[$JSCompiler_i$jscomp$inline_45$$] + $JSCompiler_inline_result$jscomp$37_JSCompiler_inline_result$jscomp$38_JSCompiler_prefixedPropertyName$jscomp$inline_22$$;
            if (void 0 !== $JSCompiler_style$jscomp$inline_17$$[$JSCompiler_propertyName$jscomp$inline_46$$]) {
              $JSCompiler_inline_result$jscomp$37_JSCompiler_inline_result$jscomp$38_JSCompiler_prefixedPropertyName$jscomp$inline_22$$ = $JSCompiler_propertyName$jscomp$inline_46$$;
              break b;
            }
          }
          $JSCompiler_inline_result$jscomp$37_JSCompiler_inline_result$jscomp$38_JSCompiler_prefixedPropertyName$jscomp$inline_22$$ = "";
        }
        void 0 !== $JSCompiler_style$jscomp$inline_17$$[$JSCompiler_inline_result$jscomp$37_JSCompiler_inline_result$jscomp$38_JSCompiler_prefixedPropertyName$jscomp$inline_22$$] && ($JSCompiler_propertyName$jscomp$inline_20$$ = $JSCompiler_inline_result$jscomp$37_JSCompiler_inline_result$jscomp$38_JSCompiler_prefixedPropertyName$jscomp$inline_22$$);
      }
      $propertyNameCache$$module$src$style$$[$JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$] = $JSCompiler_propertyName$jscomp$inline_20$$;
    }
    $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$ = $JSCompiler_propertyName$jscomp$inline_20$$;
  }
  $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$ && ((2 > $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$.length ? 0 : 0 == $JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$.lastIndexOf("--", 0)) ? $element$jscomp$14$$.style.setProperty($JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$, $value$jscomp$93$$) : $element$jscomp$14$$.style[$JSCompiler_inline_result$jscomp$12_property$jscomp$7_propertyName$jscomp$10$$] = 
  $value$jscomp$93$$);
}
function $toggle$$module$src$style$$($element$jscomp$17$$, $opt_display$$) {
  void 0 === $opt_display$$ && ($opt_display$$ = $element$jscomp$17$$.hasAttribute("hidden"));
  $opt_display$$ ? $element$jscomp$17$$.removeAttribute("hidden") : $element$jscomp$17$$.setAttribute("hidden", "");
}
;var $BUILD_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$ = ["alt", "aria-label", "aria-describedby", "aria-labelledby"], $LAYOUT_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$ = ["src", "srcset"];
function $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$($$jscomp$super$this_element$jscomp$23$$) {
  $$jscomp$super$this_element$jscomp$23$$ = AMP.BaseElement.call(this, $$jscomp$super$this_element$jscomp$23$$) || this;
  $$jscomp$super$this_element$jscomp$23$$.$img_$ = null;
  $$jscomp$super$this_element$jscomp$23$$.$hasLoaded_$ = !1;
  return $$jscomp$super$this_element$jscomp$23$$;
}
var $JSCompiler_parentCtor$jscomp$inline_25$$ = AMP.BaseElement;
$AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$.prototype = $$jscomp$objectCreate$$($JSCompiler_parentCtor$jscomp$inline_25$$.prototype);
$AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$.prototype.constructor = $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$;
if ($$jscomp$setPrototypeOf$$) {
  $$jscomp$setPrototypeOf$$($AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$, $JSCompiler_parentCtor$jscomp$inline_25$$);
} else {
  for (var $JSCompiler_p$jscomp$inline_26$$ in $JSCompiler_parentCtor$jscomp$inline_25$$) {
    if ("prototype" != $JSCompiler_p$jscomp$inline_26$$) {
      if (Object.defineProperties) {
        var $JSCompiler_descriptor$jscomp$inline_27$$ = Object.getOwnPropertyDescriptor($JSCompiler_parentCtor$jscomp$inline_25$$, $JSCompiler_p$jscomp$inline_26$$);
        $JSCompiler_descriptor$jscomp$inline_27$$ && Object.defineProperty($AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$, $JSCompiler_p$jscomp$inline_26$$, $JSCompiler_descriptor$jscomp$inline_27$$);
      } else {
        $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$[$JSCompiler_p$jscomp$inline_26$$] = $JSCompiler_parentCtor$jscomp$inline_25$$[$JSCompiler_p$jscomp$inline_26$$];
      }
    }
  }
}
$AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$.$superClass_$ = $JSCompiler_parentCtor$jscomp$inline_25$$.prototype;
$JSCompiler_prototypeAlias$$ = $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$.prototype;
$JSCompiler_prototypeAlias$$.isLayoutSupported = function($layout$jscomp$4$$) {
  return "fixed" == $layout$jscomp$4$$ || "fixed-height" == $layout$jscomp$4$$ || "responsive" == $layout$jscomp$4$$ || "fill" == $layout$jscomp$4$$ || "flex-item" == $layout$jscomp$4$$ || "fluid" == $layout$jscomp$4$$ || "intrinsic" == $layout$jscomp$4$$;
};
$JSCompiler_prototypeAlias$$.buildCallback = function() {
  this.$img_$ = new Image;
  this.$img_$.setAttribute("decoding", "async");
  this.propagateAttributes($BUILD_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$, this.$img_$);
  this.applyFillContent(this.$img_$, !0);
  var $JSCompiler_fromEl$jscomp$inline_29$$ = this.element, $JSCompiler_toEl$jscomp$inline_30$$ = this.$img_$;
  $JSCompiler_fromEl$jscomp$inline_29$$.hasAttribute("object-fit") && $setStyle$$module$src$style$$($JSCompiler_toEl$jscomp$inline_30$$, "object-fit", $JSCompiler_fromEl$jscomp$inline_29$$.getAttribute("object-fit"));
  $JSCompiler_fromEl$jscomp$inline_29$$.hasAttribute("object-position") && $setStyle$$module$src$style$$($JSCompiler_toEl$jscomp$inline_30$$, "object-position", $JSCompiler_fromEl$jscomp$inline_29$$.getAttribute("object-position"));
  "img" == this.element.getAttribute("role") && (this.element.removeAttribute("role"), this.user().error("AMP-ANIM", "Setting role=img on amp-anim elements breaks screen readers. Please just set alt or ARIA attributes, they will be correctly propagated for the underlying <img> element."));
  $toggle$$module$src$style$$(this.$img_$, !this.getPlaceholder());
  this.element.appendChild(this.$img_$);
};
$JSCompiler_prototypeAlias$$.isRelayoutNeeded = function() {
  return !0;
};
$JSCompiler_prototypeAlias$$.layoutCallback = function() {
  var $img$jscomp$3$$ = this.$img_$;
  this.propagateAttributes($LAYOUT_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$, $img$jscomp$3$$, !0);
  if (!$img$jscomp$3$$.hasAttribute("src") && 0 == "srcset" in $img$jscomp$3$$) {
    var $JSCompiler_matches$jscomp$inline_34_JSCompiler_srcset$jscomp$inline_33$$ = $img$jscomp$3$$.getAttribute("srcset");
    $JSCompiler_matches$jscomp$inline_34_JSCompiler_srcset$jscomp$inline_33$$ = /\S+/.exec($JSCompiler_matches$jscomp$inline_34_JSCompiler_srcset$jscomp$inline_33$$);
    null != $JSCompiler_matches$jscomp$inline_34_JSCompiler_srcset$jscomp$inline_33$$ && $img$jscomp$3$$.setAttribute("src", $JSCompiler_matches$jscomp$inline_34_JSCompiler_srcset$jscomp$inline_33$$[0]);
  }
  return this.loadPromise($img$jscomp$3$$);
};
$JSCompiler_prototypeAlias$$.firstLayoutCompleted = function() {
  this.$hasLoaded_$ = !0;
  $JSCompiler_StaticMethods_updateInViewport_$$(this);
};
$JSCompiler_prototypeAlias$$.viewportCallback = function() {
  this.$hasLoaded_$ && $JSCompiler_StaticMethods_updateInViewport_$$(this);
};
$JSCompiler_prototypeAlias$$.unlayoutCallback = function() {
  this.$img_$.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  this.$img_$.srcset = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  this.$hasLoaded_$ = !1;
  return !0;
};
function $JSCompiler_StaticMethods_updateInViewport_$$($JSCompiler_StaticMethods_updateInViewport_$self$$) {
  var $inViewport$$ = $JSCompiler_StaticMethods_updateInViewport_$self$$.isInViewport();
  $JSCompiler_StaticMethods_updateInViewport_$self$$.togglePlaceholder(!$inViewport$$);
  $toggle$$module$src$style$$($JSCompiler_StaticMethods_updateInViewport_$self$$.$img_$, $inViewport$$);
}
(function($AMP$jscomp$1$$) {
  $AMP$jscomp$1$$.registerElement("amp-anim", $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$);
})(self.AMP);

})});

//# sourceMappingURL=amp-anim-0.1.js.map
