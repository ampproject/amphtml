(self.AMP=self.AMP||[]).push({n:"amp-image-slider",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $SwipeXRecognizer$$module$src$gesture_recognizers$$ = function($manager$jscomp$9$$) {
  _.$SwipeRecognizer$$module$src$gesture_recognizers$$.call(this, "swipe-x", $manager$jscomp$9$$, !0, !1);
}, $AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider$$ = function($$jscomp$super$this$jscomp$61_element$jscomp$444$$) {
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$61_element$jscomp$444$$) || this;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$doc_$ = $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$win$.document;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$container_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$leftAmpImage_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$rightAmpImage_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$leftLabelWrapper_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$leftLabel_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$rightLabelWrapper_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$rightLabel_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$leftMask_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$rightMask_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$bar_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$barStick_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$hintLeftArrow_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$hintRightArrow_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$hintLeftBody_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$hintRightBody_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$unlistenMouseDown_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$unlistenMouseUp_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$unlistenMouseMove_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$unlistenKeyDown_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$stepSize_$ = $$jscomp$super$this$jscomp$61_element$jscomp$444$$.element.hasAttribute("step-size") ? Number($$jscomp$super$this$jscomp$61_element$jscomp$444$$.element.getAttribute("step-size")) || 0.1 : 0.1;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$shouldHintReappear_$ = !$$jscomp$super$this$jscomp$61_element$jscomp$444$$.element.hasAttribute("disable-hint-reappear");
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$gestures_$ = null;
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$isEdge_$ = _.$JSCompiler_StaticMethods_isEdge$$(_.$Services$$module$src$services$platformFor$$($$jscomp$super$this$jscomp$61_element$jscomp$444$$.$win$));
  $$jscomp$super$this$jscomp$61_element$jscomp$444$$.$isEventRegistered$ = !1;
  return $$jscomp$super$this$jscomp$61_element$jscomp$444$$;
}, $JSCompiler_StaticMethods_buildHint_$$ = function($JSCompiler_StaticMethods_buildHint_$self$$) {
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintLeftBody_$ = $JSCompiler_StaticMethods_buildHint_$self$$.$doc_$.createElement("div");
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintLeftBody_$.classList.add("i-amphtml-image-slider-hint");
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintRightBody_$ = $JSCompiler_StaticMethods_buildHint_$self$$.$doc_$.createElement("div");
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintRightBody_$.classList.add("i-amphtml-image-slider-hint");
  var $leftHintWrapper$$ = $JSCompiler_StaticMethods_buildHint_$self$$.$doc_$.createElement("div");
  $leftHintWrapper$$.classList.add("i-amphtml-image-slider-hint-left-wrapper");
  var $rightHintWrapper$$ = $JSCompiler_StaticMethods_buildHint_$self$$.$doc_$.createElement("div");
  $rightHintWrapper$$.classList.add("i-amphtml-image-slider-hint-right-wrapper");
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintLeftArrow_$ = $JSCompiler_StaticMethods_buildHint_$self$$.$doc_$.createElement("div");
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintLeftArrow_$.classList.add("amp-image-slider-hint-left");
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintRightArrow_$ = $JSCompiler_StaticMethods_buildHint_$self$$.$doc_$.createElement("div");
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintRightArrow_$.classList.add("amp-image-slider-hint-right");
  $leftHintWrapper$$.appendChild($JSCompiler_StaticMethods_buildHint_$self$$.$hintLeftArrow_$);
  $rightHintWrapper$$.appendChild($JSCompiler_StaticMethods_buildHint_$self$$.$hintRightArrow_$);
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintLeftBody_$.appendChild($leftHintWrapper$$);
  $JSCompiler_StaticMethods_buildHint_$self$$.$hintRightBody_$.appendChild($rightHintWrapper$$);
}, $JSCompiler_StaticMethods_checkARIA_$$ = function($JSCompiler_StaticMethods_checkARIA_$self$$) {
  var $leftAmpImage$$ = $JSCompiler_StaticMethods_checkARIA_$self$$.$leftAmpImage_$, $rightAmpImage$$ = $JSCompiler_StaticMethods_checkARIA_$self$$.$rightAmpImage_$;
  $leftAmpImage$$.signals().whenSignal("load-end").then(function() {
    if (0 < $leftAmpImage$$.childElementCount) {
      var $rightAmpImage$$ = $leftAmpImage$$.querySelector("img"), $newAltText$$;
      $JSCompiler_StaticMethods_checkARIA_$self$$.$measureMutateElement$(function() {
        var $JSCompiler_StaticMethods_checkARIA_$self$$ = $leftAmpImage$$.getAttribute("data-left-image-aria-suffix") || "left image";
        $newAltText$$ = $leftAmpImage$$.hasAttribute("alt") ? $leftAmpImage$$.getAttribute("alt") + ", " + $JSCompiler_StaticMethods_checkARIA_$self$$ : $JSCompiler_StaticMethods_checkARIA_$self$$;
      }, function() {
        $rightAmpImage$$.setAttribute("alt", $newAltText$$);
      });
    }
  });
  $rightAmpImage$$.signals().whenSignal("load-end").then(function() {
    if (0 < $rightAmpImage$$.childElementCount) {
      var $leftAmpImage$$ = $rightAmpImage$$.querySelector("img"), $newAltText$jscomp$1$$;
      $JSCompiler_StaticMethods_checkARIA_$self$$.$measureMutateElement$(function() {
        var $JSCompiler_StaticMethods_checkARIA_$self$$ = $rightAmpImage$$.getAttribute("data-right-image-aria-suffix") || "right image";
        $newAltText$jscomp$1$$ = $rightAmpImage$$.hasAttribute("alt") ? $rightAmpImage$$.getAttribute("alt") + ", " + $JSCompiler_StaticMethods_checkARIA_$self$$ : $JSCompiler_StaticMethods_checkARIA_$self$$;
      }, function() {
        $leftAmpImage$$.setAttribute("alt", $newAltText$jscomp$1$$);
      });
    }
  });
}, $JSCompiler_StaticMethods_registerTouchGestures_$$ = function($JSCompiler_StaticMethods_registerTouchGestures_$self$$) {
  $JSCompiler_StaticMethods_registerTouchGestures_$self$$.$gestures_$ || ($JSCompiler_StaticMethods_registerTouchGestures_$self$$.$gestures_$ = _.$Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_registerTouchGestures_$self$$.element), _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_registerTouchGestures_$self$$.$gestures_$, $SwipeXRecognizer$$module$src$gesture_recognizers$$, function($e$jscomp$230$$) {
    $e$jscomp$230$$.data.first && $JSCompiler_StaticMethods_animateHideHint_$$($JSCompiler_StaticMethods_registerTouchGestures_$self$$);
    $JSCompiler_StaticMethods_pointerMoveX_$$($JSCompiler_StaticMethods_registerTouchGestures_$self$$, $e$jscomp$230$$.data.$startX$ + $e$jscomp$230$$.data.deltaX);
  }), _.$JSCompiler_StaticMethods_onPointerDown$$($JSCompiler_StaticMethods_registerTouchGestures_$self$$.$gestures_$, function($e$jscomp$231$$) {
    $JSCompiler_StaticMethods_pointerMoveX_$$($JSCompiler_StaticMethods_registerTouchGestures_$self$$, $e$jscomp$231$$.touches[0].pageX, !0);
    $JSCompiler_StaticMethods_animateHideHint_$$($JSCompiler_StaticMethods_registerTouchGestures_$self$$);
  }));
}, $JSCompiler_StaticMethods_animateShowHint_$$ = function($JSCompiler_StaticMethods_animateShowHint_$self$$) {
  $JSCompiler_StaticMethods_animateShowHint_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_animateShowHint_$self$$.$hintLeftBody_$.classList.remove("i-amphtml-image-slider-hint-hidden");
    $JSCompiler_StaticMethods_animateShowHint_$self$$.$hintRightBody_$.classList.remove("i-amphtml-image-slider-hint-hidden");
  });
}, $JSCompiler_StaticMethods_animateHideHint_$$ = function($JSCompiler_StaticMethods_animateHideHint_$self$$) {
  $JSCompiler_StaticMethods_animateHideHint_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_animateHideHint_$self$$.$hintLeftBody_$.classList.add("i-amphtml-image-slider-hint-hidden");
    $JSCompiler_StaticMethods_animateHideHint_$self$$.$hintRightBody_$.classList.add("i-amphtml-image-slider-hint-hidden");
  });
}, $JSCompiler_StaticMethods_registerEvents_$$ = function($JSCompiler_StaticMethods_registerEvents_$self$$) {
  $JSCompiler_StaticMethods_registerEvents_$self$$.$isEventRegistered$ || ($JSCompiler_StaticMethods_registerEvents_$self$$.$unlistenMouseDown_$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_registerEvents_$self$$.element, "mousedown", $JSCompiler_StaticMethods_registerEvents_$self$$.$AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider_prototype$onMouseDown_$.bind($JSCompiler_StaticMethods_registerEvents_$self$$)), $JSCompiler_StaticMethods_registerEvents_$self$$.$unlistenKeyDown_$ = 
  _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_registerEvents_$self$$.element, "keydown", $JSCompiler_StaticMethods_registerEvents_$self$$.$onKeyDown_$.bind($JSCompiler_StaticMethods_registerEvents_$self$$)), $JSCompiler_StaticMethods_registerTouchGestures_$$($JSCompiler_StaticMethods_registerEvents_$self$$), $JSCompiler_StaticMethods_registerEvents_$self$$.$isEventRegistered$ = !0);
}, $JSCompiler_StaticMethods_unregisterEvents_$$ = function($JSCompiler_StaticMethods_unregisterEvents_$self$$) {
  $JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlisten_$($JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlistenMouseDown_$);
  $JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlisten_$($JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlistenMouseMove_$);
  $JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlisten_$($JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlistenMouseUp_$);
  $JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlisten_$($JSCompiler_StaticMethods_unregisterEvents_$self$$.$unlistenKeyDown_$);
  $JSCompiler_StaticMethods_unregisterEvents_$self$$.$gestures_$ && ($JSCompiler_StaticMethods_unregisterEvents_$self$$.$gestures_$.$cleanup$(), $JSCompiler_StaticMethods_unregisterEvents_$self$$.$gestures_$ = null);
  $JSCompiler_StaticMethods_unregisterEvents_$self$$.$isEventRegistered$ = !1;
}, $JSCompiler_StaticMethods_getCurrentSliderPercentage_$$ = function($$jscomp$destructuring$var420_JSCompiler_StaticMethods_getCurrentSliderPercentage_$self$$) {
  var $barLeft$$ = $$jscomp$destructuring$var420_JSCompiler_StaticMethods_getCurrentSliderPercentage_$self$$.$bar_$.getBoundingClientRect().left;
  $$jscomp$destructuring$var420_JSCompiler_StaticMethods_getCurrentSliderPercentage_$self$$ = $$jscomp$destructuring$var420_JSCompiler_StaticMethods_getCurrentSliderPercentage_$self$$.$getLayoutBox$();
  return ($barLeft$$ - $$jscomp$destructuring$var420_JSCompiler_StaticMethods_getCurrentSliderPercentage_$self$$.left) / $$jscomp$destructuring$var420_JSCompiler_StaticMethods_getCurrentSliderPercentage_$self$$.width;
}, $JSCompiler_StaticMethods_stepLeft_$$ = function($JSCompiler_StaticMethods_stepLeft_$self$$, $opt_toEnd$$) {
  if (!0 === $opt_toEnd$$) {
    $JSCompiler_StaticMethods_stepLeft_$self$$.$mutateElement$(function() {
      $JSCompiler_StaticMethods_updatePositions_$$($JSCompiler_StaticMethods_stepLeft_$self$$, 0);
    });
  } else {
    var $newPercentage$$;
    $JSCompiler_StaticMethods_stepLeft_$self$$.$measureMutateElement$(function() {
      var $opt_toEnd$$ = $JSCompiler_StaticMethods_getCurrentSliderPercentage_$$($JSCompiler_StaticMethods_stepLeft_$self$$) - $JSCompiler_StaticMethods_stepLeft_$self$$.$stepSize_$;
      $newPercentage$$ = _.$clamp$$module$src$utils$math$$($opt_toEnd$$, 0, 1);
    }, function() {
      $JSCompiler_StaticMethods_updatePositions_$$($JSCompiler_StaticMethods_stepLeft_$self$$, $newPercentage$$);
    });
  }
}, $JSCompiler_StaticMethods_stepExactCenter_$$ = function($JSCompiler_StaticMethods_stepExactCenter_$self$$) {
  $JSCompiler_StaticMethods_stepExactCenter_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_updatePositions_$$($JSCompiler_StaticMethods_stepExactCenter_$self$$, 0.5);
  });
}, $JSCompiler_StaticMethods_stepRight_$$ = function($JSCompiler_StaticMethods_stepRight_$self$$, $opt_toEnd$jscomp$1$$) {
  if (!0 === $opt_toEnd$jscomp$1$$) {
    $JSCompiler_StaticMethods_stepRight_$self$$.$mutateElement$(function() {
      $JSCompiler_StaticMethods_updatePositions_$$($JSCompiler_StaticMethods_stepRight_$self$$, 1);
    });
  } else {
    var $newPercentage$jscomp$1$$;
    $JSCompiler_StaticMethods_stepRight_$self$$.$measureMutateElement$(function() {
      var $opt_toEnd$jscomp$1$$ = $JSCompiler_StaticMethods_getCurrentSliderPercentage_$$($JSCompiler_StaticMethods_stepRight_$self$$) + $JSCompiler_StaticMethods_stepRight_$self$$.$stepSize_$;
      $newPercentage$jscomp$1$$ = _.$clamp$$module$src$utils$math$$($opt_toEnd$jscomp$1$$, 0, 1);
    }, function() {
      $JSCompiler_StaticMethods_updatePositions_$$($JSCompiler_StaticMethods_stepRight_$self$$, $newPercentage$jscomp$1$$);
    });
  }
}, $JSCompiler_StaticMethods_pointerMoveX_$$ = function($JSCompiler_StaticMethods_pointerMoveX_$self$$, $pointerX$$, $layoutBox$jscomp$10_opt_recal$$) {
  if (void 0 === $layoutBox$jscomp$10_opt_recal$$ ? 0 : $layoutBox$jscomp$10_opt_recal$$) {
    $JSCompiler_StaticMethods_pointerMoveX_$self$$.$measureMutateElement$(function() {
      var $pointerX$$ = $JSCompiler_StaticMethods_pointerMoveX_$self$$.element.getBoundingClientRect();
      $width$jscomp$51$$ = $pointerX$$.width;
      $left$jscomp$14$$ = $pointerX$$.left;
      $right$jscomp$9$$ = $pointerX$$.right;
    }, function() {
      $JSCompiler_StaticMethods_updatePositions_$$($JSCompiler_StaticMethods_pointerMoveX_$self$$, (Math.max($left$jscomp$14$$, Math.min($pointerX$$, $right$jscomp$9$$)) - $left$jscomp$14$$) / $width$jscomp$51$$);
    });
  } else {
    $layoutBox$jscomp$10_opt_recal$$ = $JSCompiler_StaticMethods_pointerMoveX_$self$$.$getLayoutBox$();
    var $width$jscomp$51$$ = $layoutBox$jscomp$10_opt_recal$$.width;
    var $left$jscomp$14$$ = $layoutBox$jscomp$10_opt_recal$$.left;
    var $right$jscomp$9$$ = $layoutBox$jscomp$10_opt_recal$$.right;
    var $newPercentage$jscomp$2$$ = (Math.max($left$jscomp$14$$, Math.min($pointerX$$, $right$jscomp$9$$)) - $left$jscomp$14$$) / $width$jscomp$51$$;
    $JSCompiler_StaticMethods_pointerMoveX_$self$$.$mutateElement$(function() {
      $JSCompiler_StaticMethods_updatePositions_$$($JSCompiler_StaticMethods_pointerMoveX_$self$$, $newPercentage$jscomp$2$$);
    });
  }
}, $JSCompiler_StaticMethods_updatePositions_$$ = function($JSCompiler_StaticMethods_updatePositions_$self$$, $percentFromLeft$$) {
  $percentFromLeft$$ = _.$clamp$$module$src$utils$math$$($percentFromLeft$$, 0, 1);
  $JSCompiler_StaticMethods_updateTranslateX_$$($JSCompiler_StaticMethods_updatePositions_$self$$.$bar_$, $percentFromLeft$$);
  $JSCompiler_StaticMethods_updateTranslateX_$$($JSCompiler_StaticMethods_updatePositions_$self$$.$rightMask_$, $percentFromLeft$$);
  $JSCompiler_StaticMethods_updateTranslateX_$$($JSCompiler_StaticMethods_updatePositions_$self$$.$rightAmpImage_$, -$percentFromLeft$$);
  var $adjustedDeltaFromLeft$$ = $percentFromLeft$$ - 0.5;
  $JSCompiler_StaticMethods_updateTranslateX_$$($JSCompiler_StaticMethods_updatePositions_$self$$.$hintLeftBody_$, $adjustedDeltaFromLeft$$);
  $JSCompiler_StaticMethods_updateTranslateX_$$($JSCompiler_StaticMethods_updatePositions_$self$$.$hintRightBody_$, $adjustedDeltaFromLeft$$);
  $JSCompiler_StaticMethods_updatePositions_$self$$.$rightLabelWrapper_$ && $JSCompiler_StaticMethods_updateTranslateX_$$($JSCompiler_StaticMethods_updatePositions_$self$$.$rightLabelWrapper_$, -$percentFromLeft$$);
}, $JSCompiler_StaticMethods_updateTranslateX_$$ = function($element$jscomp$445$$, $percentage$jscomp$4$$) {
  _.$setStyles$$module$src$style$$($element$jscomp$445$$, {transform:"translateX(" + 100 * $percentage$jscomp$4$$ + "%)"});
};
_.$$jscomp$inherits$$($SwipeXRecognizer$$module$src$gesture_recognizers$$, _.$SwipeRecognizer$$module$src$gesture_recognizers$$);
_.$$jscomp$inherits$$($AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  for (var $$jscomp$this$jscomp$662$$ = this, $children$jscomp$138$$ = this.$getRealChildren$(), $i$jscomp$326$$ = 0; $i$jscomp$326$$ < $children$jscomp$138$$.length; $i$jscomp$326$$++) {
    var $child$jscomp$22$$ = $children$jscomp$138$$[$i$jscomp$326$$];
    "amp-img" === $child$jscomp$22$$.tagName.toLowerCase() ? this.$leftAmpImage_$ ? this.$rightAmpImage_$ ? _.$user$$module$src$log$$().error("AMP-IMAGE-SLIDER", "Should not contain more than 2 <amp-img>s.") : this.$rightAmpImage_$ = $child$jscomp$22$$ : this.$leftAmpImage_$ = $child$jscomp$22$$ : "div" === $child$jscomp$22$$.tagName.toLowerCase() && ($child$jscomp$22$$.hasAttribute("first") ? this.$leftLabel_$ = $child$jscomp$22$$ : $child$jscomp$22$$.hasAttribute("second") ? this.$rightLabel_$ = 
    $child$jscomp$22$$ : _.$user$$module$src$log$$().error("AMP-IMAGE-SLIDER", 'Should not contain <div>s without "first" or "second" attributes.'));
  }
  _.$isExperimentOn$$module$src$experiments$$(this.$win$, "layers") || (_.$Resource$$module$src$service$resource$setOwner$$(this.$leftAmpImage_$, this.element), _.$Resource$$module$src$service$resource$setOwner$$(this.$rightAmpImage_$, this.element));
  this.$container_$ = this.$doc_$.createElement("div");
  this.$container_$.classList.add("i-amphtml-image-slider-container");
  this.$leftMask_$ = this.$doc_$.createElement("div");
  this.$rightMask_$ = this.$doc_$.createElement("div");
  this.$container_$.appendChild(this.$leftMask_$);
  this.$container_$.appendChild(this.$rightMask_$);
  this.$leftMask_$.classList.add("i-amphtml-image-slider-left-mask");
  this.$leftLabel_$ && (this.$leftLabelWrapper_$ = this.$doc_$.createElement("div"), this.$leftLabelWrapper_$.classList.add("i-amphtml-image-slider-label-wrapper"), this.$leftLabelWrapper_$.appendChild(this.$leftLabel_$), this.$leftMask_$.appendChild(this.$leftLabelWrapper_$));
  this.$rightMask_$.classList.add("i-amphtml-image-slider-right-mask");
  this.$rightMask_$.classList.add("i-amphtml-image-slider-push-right");
  this.$rightAmpImage_$.classList.add("i-amphtml-image-slider-push-left");
  this.$rightLabel_$ && (this.$rightLabelWrapper_$ = this.$doc_$.createElement("div"), this.$rightLabelWrapper_$.classList.add("i-amphtml-image-slider-label-wrapper"), this.$rightLabelWrapper_$.classList.add("i-amphtml-image-slider-push-left"), this.$rightLabelWrapper_$.appendChild(this.$rightLabel_$), this.$rightMask_$.appendChild(this.$rightLabelWrapper_$));
  this.$bar_$ = this.$doc_$.createElement("div");
  this.$barStick_$ = this.$doc_$.createElement("div");
  this.$bar_$.appendChild(this.$barStick_$);
  this.$bar_$.classList.add("i-amphtml-image-slider-bar");
  this.$bar_$.classList.add("i-amphtml-image-slider-push-right");
  this.$barStick_$.classList.add("i-amphtml-image-slider-bar-stick");
  this.$barStick_$.classList.add("i-amphtml-image-slider-push-left");
  this.$container_$.appendChild(this.$bar_$);
  $JSCompiler_StaticMethods_buildHint_$$(this);
  $JSCompiler_StaticMethods_checkARIA_$$(this);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "seekTo", function($children$jscomp$138$$) {
    if (($children$jscomp$138$$ = $children$jscomp$138$$.args) && void 0 !== $children$jscomp$138$$.percent) {
      var $i$jscomp$326$$ = $children$jscomp$138$$.percent;
      _.$JSCompiler_StaticMethods_assertNumber$$(_.$user$$module$src$log$$(), $i$jscomp$326$$, "value to seek to must be a number");
      $$jscomp$this$jscomp$662$$.$mutateElement$(function() {
        $JSCompiler_StaticMethods_updatePositions_$$($$jscomp$this$jscomp$662$$, $i$jscomp$326$$);
      });
    }
  }, 1);
  var $initialPositionString$$ = this.element.getAttribute("initial-slider-position");
  return this.$mutateElement$(function() {
    $$jscomp$this$jscomp$662$$.element.appendChild($$jscomp$this$jscomp$662$$.$container_$);
    $$jscomp$this$jscomp$662$$.$leftMask_$.appendChild($$jscomp$this$jscomp$662$$.$leftAmpImage_$);
    $$jscomp$this$jscomp$662$$.$rightMask_$.appendChild($$jscomp$this$jscomp$662$$.$rightAmpImage_$);
    $initialPositionString$$ && $JSCompiler_StaticMethods_updatePositions_$$($$jscomp$this$jscomp$662$$, Number($initialPositionString$$));
    $$jscomp$this$jscomp$662$$.$isEdge_$ && _.$setStyles$$module$src$style$$($$jscomp$this$jscomp$662$$.element, {"touch-action":"pan-y"});
  });
};
_.$JSCompiler_prototypeAlias$$.$AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider_prototype$onMouseDown_$ = function($e$jscomp$232$$) {
  $e$jscomp$232$$.preventDefault();
  $JSCompiler_StaticMethods_pointerMoveX_$$(this, $e$jscomp$232$$.pageX, !0);
  this.$unlisten_$(this.$unlistenMouseMove_$);
  this.$unlisten_$(this.$unlistenMouseUp_$);
  this.$unlistenMouseMove_$ = _.$listen$$module$src$event_helper$$(this.$win$, "mousemove", this.$AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider_prototype$onMouseMove_$.bind(this));
  this.$unlistenMouseUp_$ = _.$listen$$module$src$event_helper$$(this.$win$, "mouseup", this.$AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider_prototype$onMouseUp_$.bind(this));
  $JSCompiler_StaticMethods_animateHideHint_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider_prototype$onMouseMove_$ = function($e$jscomp$233$$) {
  $e$jscomp$233$$.preventDefault();
  $JSCompiler_StaticMethods_pointerMoveX_$$(this, $e$jscomp$233$$.pageX);
};
_.$JSCompiler_prototypeAlias$$.$AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider_prototype$onMouseUp_$ = function($e$jscomp$234$$) {
  $e$jscomp$234$$.preventDefault();
  this.$unlisten_$(this.$unlistenMouseMove_$);
  this.$unlisten_$(this.$unlistenMouseUp_$);
};
_.$JSCompiler_prototypeAlias$$.$onKeyDown_$ = function($e$jscomp$235$$) {
  if (this.$doc_$.activeElement === this.element) {
    switch($JSCompiler_StaticMethods_animateHideHint_$$(this), $e$jscomp$235$$.key.toLowerCase()) {
      case "left":
      case "arrowleft":
        $e$jscomp$235$$.preventDefault();
        $e$jscomp$235$$.stopPropagation();
        $JSCompiler_StaticMethods_stepLeft_$$(this);
        break;
      case "right":
      case "arrowright":
        $e$jscomp$235$$.preventDefault();
        $e$jscomp$235$$.stopPropagation();
        $JSCompiler_StaticMethods_stepRight_$$(this);
        break;
      case "pageup":
        $e$jscomp$235$$.preventDefault();
        $e$jscomp$235$$.stopPropagation();
        $JSCompiler_StaticMethods_stepLeft_$$(this, !0);
        break;
      case "pagedown":
        $e$jscomp$235$$.preventDefault();
        $e$jscomp$235$$.stopPropagation();
        $JSCompiler_StaticMethods_stepRight_$$(this, !0);
        break;
      case "home":
        $e$jscomp$235$$.preventDefault(), $e$jscomp$235$$.stopPropagation(), $JSCompiler_StaticMethods_stepExactCenter_$$(this);
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$unlisten_$ = function($unlistenHandle$$) {
  $unlistenHandle$$ && $unlistenHandle$$();
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$68$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$68$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$671$$ = this;
  this.$scheduleLayout$(this.$leftAmpImage_$);
  this.$scheduleLayout$(this.$rightAmpImage_$);
  $JSCompiler_StaticMethods_registerEvents_$$(this);
  return window.Promise.all([this.$leftAmpImage_$.signals().whenSignal("load-end"), this.$rightAmpImage_$.signals().whenSignal("load-end")]).then(function() {
    $$jscomp$this$jscomp$671$$.$container_$.appendChild($$jscomp$this$jscomp$671$$.$hintLeftBody_$);
    $$jscomp$this$jscomp$671$$.$container_$.appendChild($$jscomp$this$jscomp$671$$.$hintRightBody_$);
  }, function() {
    $$jscomp$this$jscomp$671$$.$container_$.appendChild($$jscomp$this$jscomp$671$$.$hintLeftBody_$);
    $$jscomp$this$jscomp$671$$.$container_$.appendChild($$jscomp$this$jscomp$671$$.$hintRightBody_$);
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  $JSCompiler_StaticMethods_unregisterEvents_$$(this);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  $JSCompiler_StaticMethods_unregisterEvents_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  $JSCompiler_StaticMethods_registerEvents_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$20$$) {
  $inViewport$jscomp$20$$ && this.$shouldHintReappear_$ && $JSCompiler_StaticMethods_animateShowHint_$$(this);
};
window.self.AMP.registerElement("amp-image-slider", $AmpImageSlider$$module$extensions$amp_image_slider$0_1$amp_image_slider$$, ".i-amphtml-image-slider-container{position:absolute!important;top:0!important;right:0!important;bottom:0!important;left:0!important;-webkit-transform:translateZ(0)!important;transform:translateZ(0)!important;-webkit-tap-highlight-color:rgba(0,0,0,0)}.i-amphtml-image-slider-left-mask,.i-amphtml-image-slider-right-mask{position:absolute!important;top:0!important;right:0!important;bottom:0!important;left:0!important;overflow:hidden!important}.i-amphtml-image-slider-right-mask{z-index:1!important}amp-image-slider amp-img>img{-o-object-fit:cover;object-fit:cover}.i-amphtml-image-slider-push-left{-webkit-transform:translateX(-50%);transform:translateX(-50%)}.i-amphtml-image-slider-push-right{-webkit-transform:translateX(50%);transform:translateX(50%)}.i-amphtml-image-slider-bar{direction:ltr!important;position:absolute!important;top:0!important;right:0!important;bottom:0!important;left:0!important;z-index:3!important}.i-amphtml-image-slider-bar-stick{width:20%!important;height:100%!important;cursor:col-resize!important}.i-amphtml-image-slider-bar-stick:before{content:\"\"!important;position:absolute!important;display:block!important;top:0!important;left:50%!important;bottom:0!important;border:0.5px solid #fff!important;box-sizing:border-box!important;opacity:0.5!important;-webkit-transform:translate(-50%)!important;transform:translate(-50%)!important}.i-amphtml-image-slider-label-wrapper{position:absolute!important;top:0!important;right:0!important;bottom:0!important;left:0!important;z-index:1!important}.i-amphtml-image-slider-label-wrapper>[first],.i-amphtml-image-slider-label-wrapper>[second]{position:absolute!important}.i-amphtml-image-slider-hint-hidden{opacity:0;-webkit-transition:opacity 0.4s linear;transition:opacity 0.4s linear}.i-amphtml-image-slider-hint{position:absolute!important;top:0!important;right:0!important;bottom:0!important;left:0!important;z-index:2;-webkit-transition:opacity 0.4s ease-in;transition:opacity 0.4s ease-in}.i-amphtml-image-slider-hint-left-wrapper{right:50%!important}.i-amphtml-image-slider-hint-left-wrapper,.i-amphtml-image-slider-hint-right-wrapper{position:absolute!important;height:100%!important;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-orient:vertical!important;-webkit-box-direction:normal!important;-ms-flex-direction:column!important;flex-direction:column!important;-webkit-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important}.i-amphtml-image-slider-hint-right-wrapper{left:50%!important}.amp-image-slider-hint-left{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 8'%3E%3Cpath d='M4 5h12V3H4V0L0 4l4 4z' fill='%23fff'/%3E%3C/svg%3E\")}.amp-image-slider-hint-left,.amp-image-slider-hint-right{background-size:56px 16px;width:56px;height:16px;-webkit-filter:drop-shadow(3px 3px 4px #000);filter:drop-shadow(3px 3px 4px black)}.amp-image-slider-hint-right{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 8'%3E%3Cpath d='M24 5H12V3h12V0l4 4-4 4z' fill='%23fff'/%3E%3C/svg%3E\")}\n/*# sourceURL=/extensions/amp-image-slider/0.1/amp-image-slider.css*/");

})});
