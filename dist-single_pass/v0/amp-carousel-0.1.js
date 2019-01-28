(self.AMP=self.AMP||[]).push({n:"amp-carousel",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$ = function($$jscomp$super$this$jscomp$29_element$jscomp$373$$) {
  $$jscomp$super$this$jscomp$29_element$jscomp$373$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$29_element$jscomp$373$$) || this;
  $$jscomp$super$this$jscomp$29_element$jscomp$373$$.$prevButton_$ = null;
  $$jscomp$super$this$jscomp$29_element$jscomp$373$$.$nextButton_$ = null;
  $$jscomp$super$this$jscomp$29_element$jscomp$373$$.$showControls_$ = !1;
  return $$jscomp$super$this$jscomp$29_element$jscomp$373$$;
}, $JSCompiler_StaticMethods_buildButton$$ = function($JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$, $className$jscomp$3$$, $onInteraction$$) {
  $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$ = $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.element.ownerDocument.createElement("div");
  $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.tabIndex = 0;
  $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.classList.add("amp-carousel-button");
  $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.classList.add($className$jscomp$3$$);
  $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.setAttribute("role", "button");
  $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.onkeydown = function($JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$) {
    "Enter" != $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.key && " " != $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.key || $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.defaultPrevented || ($JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.preventDefault(), $onInteraction$$());
  };
  $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$.onclick = $onInteraction$$;
  return $JSCompiler_StaticMethods_buildButton$self_button$jscomp$1$$;
}, $JSCompiler_StaticMethods_buildButtons$$ = function($JSCompiler_StaticMethods_buildButtons$self$$) {
  $JSCompiler_StaticMethods_buildButtons$self$$.$prevButton_$ = $JSCompiler_StaticMethods_buildButton$$($JSCompiler_StaticMethods_buildButtons$self$$, "amp-carousel-button-prev", function() {
    $JSCompiler_StaticMethods_buildButtons$self$$.$interactionPrev$();
  });
  $JSCompiler_StaticMethods_buildButtons$self$$.element.appendChild($JSCompiler_StaticMethods_buildButtons$self$$.$prevButton_$);
  $JSCompiler_StaticMethods_buildButtons$self$$.$nextButton_$ = $JSCompiler_StaticMethods_buildButton$$($JSCompiler_StaticMethods_buildButtons$self$$, "amp-carousel-button-next", function() {
    $JSCompiler_StaticMethods_buildButtons$self$$.$interactionNext$();
  });
  $JSCompiler_StaticMethods_buildButtons$self$$.element.appendChild($JSCompiler_StaticMethods_buildButtons$self$$.$nextButton_$);
}, $JSCompiler_StaticMethods_setControlsState$$ = function($JSCompiler_StaticMethods_setControlsState$self$$) {
  $JSCompiler_StaticMethods_setControlsState$self$$.$prevButton_$.classList.toggle("amp-disabled", !$JSCompiler_StaticMethods_setControlsState$self$$.$hasPrev$());
  $JSCompiler_StaticMethods_setControlsState$self$$.$prevButton_$.setAttribute("aria-disabled", !$JSCompiler_StaticMethods_setControlsState$self$$.$hasPrev$());
  $JSCompiler_StaticMethods_setControlsState$self$$.$nextButton_$.classList.toggle("amp-disabled", !$JSCompiler_StaticMethods_setControlsState$self$$.$hasNext$());
  $JSCompiler_StaticMethods_setControlsState$self$$.$nextButton_$.setAttribute("aria-disabled", !$JSCompiler_StaticMethods_setControlsState$self$$.$hasNext$());
}, $JSCompiler_StaticMethods_hintControls$$ = function($JSCompiler_StaticMethods_hintControls$self$$) {
  !$JSCompiler_StaticMethods_hintControls$self$$.$showControls_$ && $JSCompiler_StaticMethods_hintControls$self$$.$isInViewport$() && _.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_hintControls$self$$).$mutate$(function() {
    $JSCompiler_StaticMethods_hintControls$self$$.element.classList.add("i-amphtml-carousel-button-start-hint");
    _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_hintControls$self$$.$win$).delay(function() {
      $JSCompiler_StaticMethods_hintControls$self$$.$mutateElement$(function() {
        $JSCompiler_StaticMethods_hintControls$self$$.element.classList.remove("i-amphtml-carousel-button-start-hint");
        $JSCompiler_StaticMethods_hintControls$self$$.$prevButton_$.classList.toggle("i-amphtml-screen-reader", !$JSCompiler_StaticMethods_hintControls$self$$.$showControls_$);
        $JSCompiler_StaticMethods_hintControls$self$$.$nextButton_$.classList.toggle("i-amphtml-screen-reader", !$JSCompiler_StaticMethods_hintControls$self$$.$showControls_$);
      });
    }, 4000);
  });
}, $JSCompiler_StaticMethods_updateButtonTitles$$ = function($JSCompiler_StaticMethods_updateButtonTitles$self$$) {
  $JSCompiler_StaticMethods_updateButtonTitles$self$$.$nextButton_$.title = $JSCompiler_StaticMethods_updateButtonTitles$self$$.$getNextButtonTitle$();
  $JSCompiler_StaticMethods_updateButtonTitles$self$$.$prevButton_$.title = $JSCompiler_StaticMethods_updateButtonTitles$self$$.$getPrevButtonTitle$();
}, $AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$ = function($$jscomp$super$this$jscomp$30_element$jscomp$374$$) {
  $$jscomp$super$this$jscomp$30_element$jscomp$374$$ = $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$.call(this, $$jscomp$super$this$jscomp$30_element$jscomp$374$$) || this;
  $$jscomp$super$this$jscomp$30_element$jscomp$374$$.$pos_$ = 0;
  $$jscomp$super$this$jscomp$30_element$jscomp$374$$.$oldPos_$ = 0;
  $$jscomp$super$this$jscomp$30_element$jscomp$374$$.$cells_$ = null;
  $$jscomp$super$this$jscomp$30_element$jscomp$374$$.$container_$ = null;
  $$jscomp$super$this$jscomp$30_element$jscomp$374$$.$scrollTimerId_$ = null;
  $$jscomp$super$this$jscomp$30_element$jscomp$374$$.$useLayers_$ = !1;
  return $$jscomp$super$this$jscomp$30_element$jscomp$374$$;
}, $JSCompiler_StaticMethods_goToSlide_$$ = function($JSCompiler_StaticMethods_goToSlide_$self$$, $index$jscomp$106$$) {
  var $noOfSlides$$ = $JSCompiler_StaticMethods_goToSlide_$self$$.$cells_$.length;
  if (!(0,window.isFinite)($index$jscomp$106$$) || 0 > $index$jscomp$106$$ || $index$jscomp$106$$ >= $noOfSlides$$) {
    $JSCompiler_StaticMethods_goToSlide_$self$$.$user$().error("amp-scrollable-carousel", "Invalid [slide] value: %s", $index$jscomp$106$$), window.Promise.resolve();
  } else {
    var $oldPos$jscomp$1$$ = $JSCompiler_StaticMethods_goToSlide_$self$$.$pos_$, $newPos$jscomp$1$$ = $oldPos$jscomp$1$$;
    $JSCompiler_StaticMethods_goToSlide_$self$$.$measureMutateElement$(function() {
      $newPos$jscomp$1$$ = $JSCompiler_StaticMethods_goToSlide_$self$$.$cells_$[$index$jscomp$106$$].offsetLeft - ($JSCompiler_StaticMethods_goToSlide_$self$$.element.offsetWidth - $JSCompiler_StaticMethods_goToSlide_$self$$.$cells_$[$index$jscomp$106$$].offsetWidth) / 2;
    }, function() {
      if ($newPos$jscomp$1$$ != $oldPos$jscomp$1$$) {
        var $index$jscomp$106$$ = _.$numeric$$module$src$transition$$($oldPos$jscomp$1$$, $newPos$jscomp$1$$);
        _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_goToSlide_$self$$.element, function($noOfSlides$$) {
          $JSCompiler_StaticMethods_goToSlide_$self$$.$container_$.scrollLeft = $index$jscomp$106$$($noOfSlides$$);
        }, 200, "ease-in-out"), function() {
          $JSCompiler_StaticMethods_commitSwitch_$$($JSCompiler_StaticMethods_goToSlide_$self$$, $newPos$jscomp$1$$);
        });
      }
    });
  }
}, $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$$ = function($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$, $startingScrollLeft$$) {
  $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$.$scrollTimerId_$ = _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$.$win$).delay(function() {
    30 > Math.abs($startingScrollLeft$$ - $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$.$pos_$) ? ("amp-scrollable-carousel", $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$.$scrollTimerId_$ = null, $JSCompiler_StaticMethods_commitSwitch_$$($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$, 
    $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$.$pos_$)) : ("amp-scrollable-carousel", $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$$($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$, $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$self$$.$pos_$));
  }, 100);
}, $JSCompiler_StaticMethods_commitSwitch_$$ = function($JSCompiler_StaticMethods_commitSwitch_$self$$, $pos$jscomp$13$$) {
  $JSCompiler_StaticMethods_commitSwitch_$self$$.$useLayers_$ || ($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$$($JSCompiler_StaticMethods_commitSwitch_$self$$, $pos$jscomp$13$$, $JSCompiler_StaticMethods_commitSwitch_$self$$.$oldPos_$), $JSCompiler_StaticMethods_doLayout_$$($JSCompiler_StaticMethods_commitSwitch_$self$$, $pos$jscomp$13$$), $JSCompiler_StaticMethods_preloadNext_$$($JSCompiler_StaticMethods_commitSwitch_$self$$, 
  $pos$jscomp$13$$, Math.sign($pos$jscomp$13$$ - $JSCompiler_StaticMethods_commitSwitch_$self$$.$oldPos_$)), $JSCompiler_StaticMethods_commitSwitch_$self$$.$oldPos_$ = $pos$jscomp$13$$);
  $JSCompiler_StaticMethods_commitSwitch_$self$$.$pos_$ = $pos$jscomp$13$$;
  $JSCompiler_StaticMethods_setControlsState$$($JSCompiler_StaticMethods_commitSwitch_$self$$);
}, $JSCompiler_StaticMethods_nextPos_$$ = function($JSCompiler_StaticMethods_nextPos_$self_fullWidth$$, $newPos$jscomp$2_pos$jscomp$14$$, $dir$jscomp$4$$) {
  var $containerWidth$jscomp$1$$ = $JSCompiler_StaticMethods_nextPos_$self_fullWidth$$.element.offsetWidth;
  $JSCompiler_StaticMethods_nextPos_$self_fullWidth$$ = $JSCompiler_StaticMethods_nextPos_$self_fullWidth$$.$container_$.scrollWidth;
  $newPos$jscomp$2_pos$jscomp$14$$ += $dir$jscomp$4$$ * $containerWidth$jscomp$1$$;
  return 0 > $newPos$jscomp$2_pos$jscomp$14$$ ? 0 : $JSCompiler_StaticMethods_nextPos_$self_fullWidth$$ >= $containerWidth$jscomp$1$$ && $newPos$jscomp$2_pos$jscomp$14$$ > $JSCompiler_StaticMethods_nextPos_$self_fullWidth$$ - $containerWidth$jscomp$1$$ ? $JSCompiler_StaticMethods_nextPos_$self_fullWidth$$ - $containerWidth$jscomp$1$$ : $newPos$jscomp$2_pos$jscomp$14$$;
}, $JSCompiler_StaticMethods_withinWindow_$$ = function($JSCompiler_StaticMethods_withinWindow_$self$$, $pos$jscomp$15$$, $callback$jscomp$117$$) {
  for (var $containerWidth$jscomp$2$$ = $JSCompiler_StaticMethods_withinWindow_$self$$.$layoutWidth_$, $i$jscomp$269$$ = 0; $i$jscomp$269$$ < $JSCompiler_StaticMethods_withinWindow_$self$$.$cells_$.length; $i$jscomp$269$$++) {
    var $cell$jscomp$1$$ = $JSCompiler_StaticMethods_withinWindow_$self$$.$cells_$[$i$jscomp$269$$];
    $cell$jscomp$1$$.offsetLeft + $cell$jscomp$1$$.offsetWidth >= $pos$jscomp$15$$ && $cell$jscomp$1$$.offsetLeft <= $pos$jscomp$15$$ + $containerWidth$jscomp$2$$ && $callback$jscomp$117$$($cell$jscomp$1$$);
  }
}, $JSCompiler_StaticMethods_doLayout_$$ = function($JSCompiler_StaticMethods_doLayout_$self$$, $pos$jscomp$16$$) {
  $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_doLayout_$self$$, $pos$jscomp$16$$, function($pos$jscomp$16$$) {
    $JSCompiler_StaticMethods_doLayout_$self$$.$scheduleLayout$($pos$jscomp$16$$);
  });
}, $JSCompiler_StaticMethods_preloadNext_$$ = function($JSCompiler_StaticMethods_preloadNext_$self$$, $pos$jscomp$17$$, $dir$jscomp$5_nextPos$$) {
  $dir$jscomp$5_nextPos$$ = $JSCompiler_StaticMethods_nextPos_$$($JSCompiler_StaticMethods_preloadNext_$self$$, $pos$jscomp$17$$, $dir$jscomp$5_nextPos$$);
  $dir$jscomp$5_nextPos$$ != $pos$jscomp$17$$ && $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_preloadNext_$self$$, $dir$jscomp$5_nextPos$$, function($pos$jscomp$17$$) {
    $JSCompiler_StaticMethods_preloadNext_$self$$.$schedulePreload$($pos$jscomp$17$$);
  });
}, $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$$ = function($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$self$$, $newPos$jscomp$3$$, $oldPos$jscomp$2$$) {
  var $seen$jscomp$2$$ = [];
  $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$self$$, $newPos$jscomp$3$$, function($newPos$jscomp$3$$) {
    $seen$jscomp$2$$.push($newPos$jscomp$3$$);
    $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$self$$.$updateInViewport$($newPos$jscomp$3$$, !0);
  });
  $oldPos$jscomp$2$$ != $newPos$jscomp$3$$ && $JSCompiler_StaticMethods_withinWindow_$$($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$self$$, $oldPos$jscomp$2$$, function($newPos$jscomp$3$$) {
    $seen$jscomp$2$$.includes($newPos$jscomp$3$$) || ($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$self$$.$updateInViewport$($newPos$jscomp$3$$, !1), $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$self$$.$schedulePause$($newPos$jscomp$3$$));
  });
}, $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$cancelTouchEvents_$$ = function($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$cancelTouchEvents_$self$$) {
  $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$cancelTouchEvents_$self$$.element.addEventListener("touchmove", function($JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$cancelTouchEvents_$self$$) {
    $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$cancelTouchEvents_$self$$.stopPropagation();
  });
}, $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$ = function($$jscomp$super$this$jscomp$31_element$jscomp$375$$) {
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$ = $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$.call(this, $$jscomp$super$this$jscomp$31_element$jscomp$375$$) || this;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$autoplayTimeoutId_$ = null;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$hasLoop_$ = !1;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$loopAdded_$ = !1;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$hasAutoplay_$ = !1;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$autoplayDelay_$ = 5000;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$autoplayLoops_$ = null;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$loopsMade_$ = 0;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$shouldLoop$ = !1;
  $$jscomp$super$this$jscomp$31_element$jscomp$375$$.$shouldAutoplay_$ = !1;
  return $$jscomp$super$this$jscomp$31_element$jscomp$375$$;
}, $JSCompiler_StaticMethods_setupAutoplay_$$ = function($JSCompiler_StaticMethods_setupAutoplay_$self$$) {
  var $delayValue$$ = Number($JSCompiler_StaticMethods_setupAutoplay_$self$$.element.getAttribute("delay"));
  0 < $delayValue$$ && ($JSCompiler_StaticMethods_setupAutoplay_$self$$.$autoplayDelay_$ = Math.max(1000, $delayValue$$));
  $JSCompiler_StaticMethods_setupAutoplay_$self$$.$hasLoop_$ || ($JSCompiler_StaticMethods_setupAutoplay_$self$$.element.setAttribute("loop", ""), $JSCompiler_StaticMethods_setupAutoplay_$self$$.$loopAdded_$ = !0, $JSCompiler_StaticMethods_setupAutoplay_$self$$.$hasLoop_$ = !0, $JSCompiler_StaticMethods_setupAutoplay_$self$$.$shouldLoop$ = !0);
}, $JSCompiler_StaticMethods_toggleAutoplay_$$ = function($JSCompiler_StaticMethods_toggleAutoplay_$self$$, $toggleOn$$) {
  if ($toggleOn$$ != $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$) {
    var $prevAutoplayStatus$$ = $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$;
    $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$hasAutoplay_$ = $toggleOn$$;
    $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$ = $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$hasAutoplay_$ && $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$isLoopingEligible$();
    !$prevAutoplayStatus$$ && $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$ && $JSCompiler_StaticMethods_setupAutoplay_$$($JSCompiler_StaticMethods_toggleAutoplay_$self$$);
    $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$shouldAutoplay_$ ? $JSCompiler_StaticMethods_toggleAutoplay_$self$$.$autoplay_$() : $JSCompiler_StaticMethods_clearAutoplay$$($JSCompiler_StaticMethods_toggleAutoplay_$self$$);
  }
}, $JSCompiler_StaticMethods_clearAutoplay$$ = function($JSCompiler_StaticMethods_clearAutoplay$self$$) {
  null !== $JSCompiler_StaticMethods_clearAutoplay$self$$.$autoplayTimeoutId_$ && (_.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_clearAutoplay$self$$.$win$).cancel($JSCompiler_StaticMethods_clearAutoplay$self$$.$autoplayTimeoutId_$), $JSCompiler_StaticMethods_clearAutoplay$self$$.$autoplayTimeoutId_$ = null);
}, $JSCompiler_StaticMethods_removeAutoplay$$ = function($JSCompiler_StaticMethods_removeAutoplay$self$$) {
  $JSCompiler_StaticMethods_clearAutoplay$$($JSCompiler_StaticMethods_removeAutoplay$self$$);
  $JSCompiler_StaticMethods_removeAutoplay$self$$.$loopAdded_$ && ($JSCompiler_StaticMethods_removeAutoplay$self$$.element.removeAttribute("loop"), $JSCompiler_StaticMethods_removeAutoplay$self$$.$loopAdded_$ = !1, $JSCompiler_StaticMethods_removeAutoplay$self$$.$hasLoop_$ = !1, $JSCompiler_StaticMethods_removeAutoplay$self$$.$shouldLoop$ = !1);
  $JSCompiler_StaticMethods_removeAutoplay$self$$.$hasAutoplay_$ = !1;
  $JSCompiler_StaticMethods_removeAutoplay$self$$.$shouldAutoplay_$ = $JSCompiler_StaticMethods_removeAutoplay$self$$.$hasAutoplay_$ && $JSCompiler_StaticMethods_removeAutoplay$self$$.$isLoopingEligible$();
}, $AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$ = function($$jscomp$super$this$jscomp$32_element$jscomp$376$$) {
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$ = $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.call(this, $$jscomp$super$this$jscomp$32_element$jscomp$376$$) || this;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$vsync_$ = null;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$hasNativeSnapPoints_$ = !1;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$slides_$ = [];
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$noOfSlides_$ = 0;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$slidesContainer_$ = null;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$slideWrappers_$ = [];
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$snappingInProgress_$ = !1;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$scrollTimeout_$ = null;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$touchEndTimeout_$ = null;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$hasTouchMoved_$ = !1;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$elasticScrollState_$ = 0;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$slideIndex_$ = null;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$initialSlideIndex_$ = 0;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$slideWidth_$ = 0;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$previousScrollLeft_$ = 0;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$dataSlideIdArr_$ = [];
  var $platform$jscomp$9$$ = _.$Services$$module$src$services$platformFor$$($$jscomp$super$this$jscomp$32_element$jscomp$376$$.$win$);
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$isIos_$ = _.$JSCompiler_StaticMethods_isIos$$($platform$jscomp$9$$);
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$action_$ = null;
  $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$shouldDisableCssSnap_$ = _.$startsWith$$module$src$string$$(_.$JSCompiler_StaticMethods_getIosVersionString$$(_.$Services$$module$src$services$platformFor$$($$jscomp$super$this$jscomp$32_element$jscomp$376$$.$win$)), "10.3") ? !0 : $$jscomp$super$this$jscomp$32_element$jscomp$376$$.$isIos_$ ? !1 : !_.$isExperimentOn$$module$src$experiments$$($$jscomp$super$this$jscomp$32_element$jscomp$376$$.$win$, "amp-carousel-chrome-scroll-snap");
  return $$jscomp$super$this$jscomp$32_element$jscomp$376$$;
}, $JSCompiler_StaticMethods_handleCustomElasticScroll_$$ = function($JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$, $currentScrollLeft$jscomp$4$$) {
  var $scrollWidth$jscomp$1$$ = $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$slidesContainer_$.scrollWidth;
  -1 == $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ && $currentScrollLeft$jscomp$4$$ >= $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$previousScrollLeft_$ ? $JSCompiler_StaticMethods_customSnap_$$($JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$, $currentScrollLeft$jscomp$4$$).then(function() {
    $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ = 0;
  }) : 1 == $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ && $currentScrollLeft$jscomp$4$$ <= $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$previousScrollLeft_$ ? $JSCompiler_StaticMethods_customSnap_$$($JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$, $currentScrollLeft$jscomp$4$$).then(function() {
    $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ = 0;
  }) : $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$elasticScrollState_$ = 0 > $currentScrollLeft$jscomp$4$$ ? -1 : $currentScrollLeft$jscomp$4$$ + $JSCompiler_StaticMethods_handleCustomElasticScroll_$self$$.$slideWidth_$ > $scrollWidth$jscomp$1$$ ? 1 : 0;
}, $JSCompiler_StaticMethods_customSnap_$$ = function($JSCompiler_StaticMethods_customSnap_$self$$, $currentScrollLeft$jscomp$5$$, $opt_forceDir$$) {
  $JSCompiler_StaticMethods_customSnap_$self$$.$snappingInProgress_$ = !0;
  var $diff$jscomp$1$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$$($JSCompiler_StaticMethods_customSnap_$self$$, $currentScrollLeft$jscomp$5$$) - $JSCompiler_StaticMethods_customSnap_$self$$.$slideIndex_$, $hasPrev$jscomp$1$$ = $JSCompiler_StaticMethods_customSnap_$self$$.$hasPrev$(), $toScrollLeft$$ = $hasPrev$jscomp$1$$ ? $JSCompiler_StaticMethods_customSnap_$self$$.$slideWidth_$ : 0;
  0 != $diff$jscomp$1$$ || 1 != $opt_forceDir$$ && -1 != $opt_forceDir$$ || ($diff$jscomp$1$$ = $opt_forceDir$$);
  if (1 == $diff$jscomp$1$$ || -1 != $diff$jscomp$1$$ && $diff$jscomp$1$$ == -1 * ($JSCompiler_StaticMethods_customSnap_$self$$.$noOfSlides_$ - 1)) {
    $toScrollLeft$$ = $hasPrev$jscomp$1$$ ? 2 * $JSCompiler_StaticMethods_customSnap_$self$$.$slideWidth_$ : $JSCompiler_StaticMethods_customSnap_$self$$.$slideWidth_$;
  } else {
    if (-1 == $diff$jscomp$1$$ || $diff$jscomp$1$$ == $JSCompiler_StaticMethods_customSnap_$self$$.$noOfSlides_$ - 1) {
      $toScrollLeft$$ = 0;
    }
  }
  return $JSCompiler_StaticMethods_animateScrollLeft_$$($JSCompiler_StaticMethods_customSnap_$self$$, $currentScrollLeft$jscomp$5$$, $toScrollLeft$$).then(function() {
    $JSCompiler_StaticMethods_updateOnScroll_$$($JSCompiler_StaticMethods_customSnap_$self$$, $toScrollLeft$$);
  });
}, $JSCompiler_StaticMethods_getNextSlideIndex_$$ = function($JSCompiler_StaticMethods_getNextSlideIndex_$self$$, $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$) {
  $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ = Math.round($currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ / $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$slideWidth_$);
  var $updateValue$$ = 0, $hasPrev$jscomp$2$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$hasPrev$(), $hasNext$jscomp$1$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$hasNext$();
  $hasPrev$jscomp$2$$ && $hasNext$jscomp$1$$ ? $updateValue$$ = $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ - 1 : $hasNext$jscomp$1$$ ? $updateValue$$ = $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ : $hasPrev$jscomp$2$$ && ($updateValue$$ = $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ - 1);
  $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$slideIndex_$ + $updateValue$$;
  return $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$shouldLoop$ ? 0 > $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ ? $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ - 1 : $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ >= $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ ? 0 : $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ : 
  0 > $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ ? 0 : $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$ >= $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ ? $JSCompiler_StaticMethods_getNextSlideIndex_$self$$.$noOfSlides_$ - 1 : $currentScrollLeft$jscomp$6_newIndex$jscomp$3_scrolledSlideIndex$$;
}, $JSCompiler_StaticMethods_getButtonTitleSuffix_$$ = function($JSCompiler_StaticMethods_getButtonTitleSuffix_$self$$, $buttonIndex_index$jscomp$110$$) {
  $buttonIndex_index$jscomp$110$$ = String($buttonIndex_index$jscomp$110$$ + 1);
  var $count$jscomp$18$$ = String($JSCompiler_StaticMethods_getButtonTitleSuffix_$self$$.$noOfSlides_$);
  return " " + ($JSCompiler_StaticMethods_getButtonTitleSuffix_$self$$.element.getAttribute("data-button-count-format") || "(%s of %s)").replace("%s", $buttonIndex_index$jscomp$110$$).replace("%s", $count$jscomp$18$$);
}, $JSCompiler_StaticMethods_updateOnScroll_$$ = function($JSCompiler_StaticMethods_updateOnScroll_$self$$, $currentScrollLeft$jscomp$7$$) {
  if (_.$isFiniteNumber$$module$src$types$$($currentScrollLeft$jscomp$7$$) && null !== $JSCompiler_StaticMethods_updateOnScroll_$self$$.$slideIndex_$) {
    $JSCompiler_StaticMethods_updateOnScroll_$self$$.$snappingInProgress_$ = !0;
    var $newIndex$jscomp$4$$ = $JSCompiler_StaticMethods_getNextSlideIndex_$$($JSCompiler_StaticMethods_updateOnScroll_$self$$, $currentScrollLeft$jscomp$7$$);
    $JSCompiler_StaticMethods_updateOnScroll_$self$$.$vsync_$.$mutate$(function() {
      $JSCompiler_StaticMethods_updateOnScroll_$self$$.$isIos_$ && $JSCompiler_StaticMethods_updateOnScroll_$self$$.$slidesContainer_$.classList.add("i-amphtml-no-scroll");
      $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$($JSCompiler_StaticMethods_updateOnScroll_$self$$, $newIndex$jscomp$4$$);
      $JSCompiler_StaticMethods_updateOnScroll_$self$$.$vsync_$.$mutate$(function() {
        $JSCompiler_StaticMethods_updateOnScroll_$self$$.$isIos_$ && $JSCompiler_StaticMethods_updateOnScroll_$self$$.$slidesContainer_$.classList.remove("i-amphtml-no-scroll");
        $JSCompiler_StaticMethods_updateOnScroll_$self$$.$snappingInProgress_$ = !1;
      });
    });
  }
}, $JSCompiler_StaticMethods_showSlide_$$ = function($JSCompiler_StaticMethods_showSlide_$self$$, $newIndex$jscomp$5$$) {
  var $noOfSlides_$$ = $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$;
  if (0 > $newIndex$jscomp$5$$ || $newIndex$jscomp$5$$ >= $noOfSlides_$$ || $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ == $newIndex$jscomp$5$$) {
    return !1;
  }
  var $newSlideInView_prevIndex$jscomp$3$$ = 0 <= $newIndex$jscomp$5$$ - 1 ? $newIndex$jscomp$5$$ - 1 : $JSCompiler_StaticMethods_showSlide_$self$$.$shouldLoop$ ? $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$ - 1 : null, $nextIndex$jscomp$2$$ = $newIndex$jscomp$5$$ + 1 < $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$ ? $newIndex$jscomp$5$$ + 1 : $JSCompiler_StaticMethods_showSlide_$self$$.$shouldLoop$ ? 0 : null, $showIndexArr$$ = [];
  null != $newSlideInView_prevIndex$jscomp$3$$ && $showIndexArr$$.push($newSlideInView_prevIndex$jscomp$3$$);
  $showIndexArr$$.push($newIndex$jscomp$5$$);
  null != $nextIndex$jscomp$2$$ && $nextIndex$jscomp$2$$ !== $newSlideInView_prevIndex$jscomp$3$$ && $showIndexArr$$.push($nextIndex$jscomp$2$$);
  null !== $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ && $JSCompiler_StaticMethods_showSlide_$self$$.$updateInViewport$($JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[_.$JSCompiler_StaticMethods_assertNumber$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$, "E#19457 this.slideIndex_")], !1);
  $newSlideInView_prevIndex$jscomp$3$$ = $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$newIndex$jscomp$5$$];
  if (void 0 === $newSlideInView_prevIndex$jscomp$3$$) {
    return _.$dev$$module$src$log$$().error("AMP-CAROUSEL", "Attempting to access a non-existant slide %s / %s", $newIndex$jscomp$5$$, $noOfSlides_$$), !1;
  }
  $JSCompiler_StaticMethods_showSlide_$self$$.$updateInViewport$($newSlideInView_prevIndex$jscomp$3$$, !0);
  $showIndexArr$$.forEach(function($noOfSlides_$$, $newSlideInView_prevIndex$jscomp$3$$) {
    $JSCompiler_StaticMethods_showSlide_$self$$.$shouldLoop$ && _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_showSlide_$self$$.$slideWrappers_$[$noOfSlides_$$], "order", $newSlideInView_prevIndex$jscomp$3$$ + 1);
    $JSCompiler_StaticMethods_showSlide_$self$$.$slideWrappers_$[$noOfSlides_$$].classList.add("i-amphtml-slide-item-show");
    $noOfSlides_$$ == $newIndex$jscomp$5$$ ? ($JSCompiler_StaticMethods_showSlide_$self$$.$scheduleLayout$($JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$]), $JSCompiler_StaticMethods_showSlide_$self$$.$scheduleResume$($JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$]), $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$].setAttribute("aria-hidden", "false")) : ($JSCompiler_StaticMethods_showSlide_$self$$.$schedulePreload$($JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$]), 
    $JSCompiler_StaticMethods_showSlide_$self$$.$slides_$[$noOfSlides_$$].setAttribute("aria-hidden", "true"));
  });
  $JSCompiler_StaticMethods_showSlide_$self$$.$slidesContainer_$.scrollLeft = $JSCompiler_StaticMethods_getScrollLeftForIndex_$$($JSCompiler_StaticMethods_showSlide_$self$$, $newIndex$jscomp$5$$);
  $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$$($JSCompiler_StaticMethods_showSlide_$self$$, $newIndex$jscomp$5$$);
  $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ = $newIndex$jscomp$5$$;
  $JSCompiler_StaticMethods_showSlide_$self$$.$autoplayLoops_$ && $JSCompiler_StaticMethods_showSlide_$self$$.$slideIndex_$ === $JSCompiler_StaticMethods_showSlide_$self$$.$noOfSlides_$ - 1 && ($JSCompiler_StaticMethods_showSlide_$self$$.$loopsMade_$++, $JSCompiler_StaticMethods_showSlide_$self$$.$loopsMade_$ == $JSCompiler_StaticMethods_showSlide_$self$$.$autoplayLoops_$ && $JSCompiler_StaticMethods_removeAutoplay$$($JSCompiler_StaticMethods_showSlide_$self$$));
  $JSCompiler_StaticMethods_hideRestOfTheSlides_$$($JSCompiler_StaticMethods_showSlide_$self$$, $showIndexArr$$);
  $JSCompiler_StaticMethods_setControlsState$$($JSCompiler_StaticMethods_showSlide_$self$$);
  $JSCompiler_StaticMethods_updateButtonTitles$$($JSCompiler_StaticMethods_showSlide_$self$$);
  return !0;
}, $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$ = function($JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$, $newIndex$jscomp$6$$) {
  if ($JSCompiler_StaticMethods_showSlide_$$($JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$, $newIndex$jscomp$6$$)) {
    var $event$jscomp$98$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.$win$, "slidescroll.slideChange", _.$dict$$module$src$utils$object$$({index:$newIndex$jscomp$6$$}));
    $JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.$action_$.$trigger$($JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.element, "slideChange", $event$jscomp$98$$, 100);
    $JSCompiler_StaticMethods_showSlideAndTriggerAction_$self$$.element.$D$("slideChange", {index:$newIndex$jscomp$6$$});
  }
}, $JSCompiler_StaticMethods_getScrollLeftForIndex_$$ = function($JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$, $index$jscomp$114$$) {
  var $newScrollLeft$$ = $JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$.$slideWidth_$;
  if (!$JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$.$shouldLoop$ && 0 == $index$jscomp$114$$ || 1 >= $JSCompiler_StaticMethods_getScrollLeftForIndex_$self$$.$slides_$.length) {
    $newScrollLeft$$ = 0;
  }
  return $newScrollLeft$$;
}, $JSCompiler_StaticMethods_hideRestOfTheSlides_$$ = function($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$, $indexArr$$) {
  for (var $noOfSlides_$jscomp$1$$ = $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$noOfSlides_$, $i$jscomp$270$$ = 0; $i$jscomp$270$$ < $noOfSlides_$jscomp$1$$; $i$jscomp$270$$++) {
    $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideWrappers_$[$i$jscomp$270$$].classList.contains("i-amphtml-slide-item-show") && ($indexArr$$.includes($i$jscomp$270$$) || ($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$shouldLoop$ && _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideWrappers_$[$i$jscomp$270$$], "order", ""), $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideWrappers_$[$i$jscomp$270$$].classList.remove("i-amphtml-slide-item-show"), 
    $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slides_$[$i$jscomp$270$$].removeAttribute("aria-hidden")), $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slideIndex_$ != $i$jscomp$270$$ && $JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$schedulePause$($JSCompiler_StaticMethods_hideRestOfTheSlides_$self$$.$slides_$[$i$jscomp$270$$]));
  }
}, $JSCompiler_StaticMethods_animateScrollLeft_$$ = function($JSCompiler_StaticMethods_animateScrollLeft_$self$$, $curve$jscomp$11_fromScrollLeft$$, $toScrollLeft$jscomp$1$$) {
  if ($curve$jscomp$11_fromScrollLeft$$ == $toScrollLeft$jscomp$1$$) {
    return window.Promise.resolve();
  }
  var $interpolate$jscomp$3$$ = _.$numeric$$module$src$transition$$($curve$jscomp$11_fromScrollLeft$$, $toScrollLeft$jscomp$1$$);
  $curve$jscomp$11_fromScrollLeft$$ = _.$bezierCurve$$module$src$curve$$(0.8, 0, 0.6, 1);
  return _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_animateScrollLeft_$self$$.$slidesContainer_$, function($curve$jscomp$11_fromScrollLeft$$) {
    $JSCompiler_StaticMethods_animateScrollLeft_$self$$.$slidesContainer_$.scrollLeft = $interpolate$jscomp$3$$($curve$jscomp$11_fromScrollLeft$$);
  }, 80, $curve$jscomp$11_fromScrollLeft$$));
}, $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$cancelTouchEvents_$$ = function($JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$cancelTouchEvents_$self$$) {
  $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$cancelTouchEvents_$self$$.element.addEventListener("touchmove", function($JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$cancelTouchEvents_$self$$) {
    $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$cancelTouchEvents_$self$$.stopPropagation();
  });
}, $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$$ = function($JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$, $newSlideIndex_vars$jscomp$22$$) {
  var $direction$jscomp$7$$ = $newSlideIndex_vars$jscomp$22$$ - $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.$slideIndex_$;
  0 != $direction$jscomp$7$$ && (1 !== Math.abs($direction$jscomp$7$$) && ($direction$jscomp$7$$ = 0 > $direction$jscomp$7$$ ? 1 : -1, null === $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.$slideIndex_$ && ($direction$jscomp$7$$ = 1)), $newSlideIndex_vars$jscomp$22$$ = _.$dict$$module$src$utils$object$$({fromSlide:null === $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.$slideIndex_$ ? 
  "null" : $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.$dataSlideIdArr_$[$JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.$slideIndex_$], toSlide:$JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.$dataSlideIdArr_$[$newSlideIndex_vars$jscomp$22$$]}), _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.element, 
  "amp-carousel-change", $newSlideIndex_vars$jscomp$22$$), 1 == $direction$jscomp$7$$ ? _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.element, "amp-carousel-next", $newSlideIndex_vars$jscomp$22$$) : _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$triggerAnalyticsEvent_$self$$.element, 
  "amp-carousel-prev", $newSlideIndex_vars$jscomp$22$$));
}, $CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$ = function($var_args$jscomp$71$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
};
_.$BaseElement$$module$src$base_element$$.prototype.$schedulePreload$ = _.$JSCompiler_unstubMethod$$(16, function($elements$jscomp$6$$) {
  this.element.$getResources$().$schedulePreload$(this.element, $elements$jscomp$6$$);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$schedulePreload$ = _.$JSCompiler_unstubMethod$$(15, function($parentElement$jscomp$4$$, $subElements$jscomp$4$$) {
  _.$JSCompiler_StaticMethods_scheduleLayoutOrPreloadForSubresources_$$(this, _.$Resource$$module$src$service$resource$forElementOptional$$($parentElement$jscomp$4$$), !1, _.$elements_$$module$src$service$resources_impl$$($subElements$jscomp$4$$));
});
_.$$jscomp$inherits$$($BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  (this.$showControls_$ = _.$getService$$module$src$service$$(this.$win$, "input").$hasMouse_$ || this.element.hasAttribute("controls")) && this.element.classList.add("i-amphtml-carousel-has-controls");
  this.$buildCarousel$();
  $JSCompiler_StaticMethods_buildButtons$$(this);
  $JSCompiler_StaticMethods_setControlsState$$(this);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$15$$) {
  this.$onViewportCallback$($inViewport$jscomp$15$$);
  $inViewport$jscomp$15$$ && $JSCompiler_StaticMethods_hintControls$$(this);
};
_.$JSCompiler_prototypeAlias$$.$onViewportCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$prerenderAllowed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isRelayoutNeeded$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel_prototype$go$ = function($dir$jscomp$2$$, $animate$$, $opt_autoplay$$) {
  this.$goCallback$($dir$jscomp$2$$, $animate$$, void 0 === $opt_autoplay$$ ? !1 : $opt_autoplay$$);
};
_.$JSCompiler_prototypeAlias$$.$goCallback$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$getNextButtonTitle$ = function() {
  return this.element.getAttribute("data-next-button-aria-label") || "Next item in carousel";
};
_.$JSCompiler_prototypeAlias$$.$getPrevButtonTitle$ = function() {
  return this.element.getAttribute("data-prev-button-aria-label") || "Previous item in carousel";
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$hasPrev$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$hasNext$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$interactionNext$ = function() {
  this.$nextButton_$.classList.contains("amp-disabled") || this.$BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel_prototype$go$(1, !0, !1);
};
_.$JSCompiler_prototypeAlias$$.$interactionPrev$ = function() {
  this.$prevButton_$.classList.contains("amp-disabled") || this.$BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel_prototype$go$(-1, !0, !1);
};
_.$$jscomp$inherits$$($AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$, $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$);
_.$JSCompiler_prototypeAlias$$ = $AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$44$$) {
  return "fixed" == $layout$jscomp$44$$ || "fixed-height" == $layout$jscomp$44$$;
};
_.$JSCompiler_prototypeAlias$$.$buildCarousel$ = function() {
  var $$jscomp$this$jscomp$503$$ = this;
  this.$cells_$ = this.$getRealChildren$();
  this.$container_$ = this.element.ownerDocument.createElement("div");
  this.$container_$.classList.add("i-amphtml-scrollable-carousel-container");
  this.element.appendChild(this.$container_$);
  this.$useLayers_$ = _.$isExperimentOn$$module$src$experiments$$(this.$win$, "layers");
  this.$cells_$.forEach(function($cell$$) {
    $$jscomp$this$jscomp$503$$.$useLayers_$ || _.$Resource$$module$src$service$resource$setOwner$$($cell$$, $$jscomp$this$jscomp$503$$.element);
    $cell$$.classList.add("amp-carousel-slide");
    $cell$$.classList.add("amp-scrollable-carousel-slide");
    $$jscomp$this$jscomp$503$$.$container_$.appendChild($cell$$);
  });
  $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$cancelTouchEvents_$$(this);
  this.$container_$.addEventListener("scroll", this.$AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$scrollHandler_$.bind(this));
  _.$JSCompiler_StaticMethods_registerAction$$(this, "goToSlide", function($args$jscomp$33_invocation$jscomp$28$$) {
    ($args$jscomp$33_invocation$jscomp$28$$ = $args$jscomp$33_invocation$jscomp$28$$.args) && $JSCompiler_StaticMethods_goToSlide_$$($$jscomp$this$jscomp$503$$, (0,window.parseInt)($args$jscomp$33_invocation$jscomp$28$$.index, 10));
  }, 1);
  this.$useLayers_$ && this.$declareLayer$(this.$container_$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  this.$useLayers_$ || ($JSCompiler_StaticMethods_doLayout_$$(this, this.$pos_$), $JSCompiler_StaticMethods_preloadNext_$$(this, this.$pos_$, 1));
  $JSCompiler_StaticMethods_setControlsState$$(this);
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$onViewportCallback$ = function() {
  this.$useLayers_$ || $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$updateInViewport_$$(this, this.$pos_$, this.$pos_$);
};
_.$JSCompiler_prototypeAlias$$.$goCallback$ = function($dir$jscomp$3_oldPos$$, $animate$jscomp$1$$) {
  var $$jscomp$this$jscomp$504$$ = this, $newPos$$ = $JSCompiler_StaticMethods_nextPos_$$(this, this.$pos_$, $dir$jscomp$3_oldPos$$);
  $dir$jscomp$3_oldPos$$ = this.$pos_$;
  if ($newPos$$ != $dir$jscomp$3_oldPos$$) {
    if ($animate$jscomp$1$$) {
      var $interpolate$jscomp$1$$ = _.$numeric$$module$src$transition$$($dir$jscomp$3_oldPos$$, $newPos$$);
      _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$(this.element, function($dir$jscomp$3_oldPos$$) {
        $$jscomp$this$jscomp$504$$.$container_$.scrollLeft = $interpolate$jscomp$1$$($dir$jscomp$3_oldPos$$);
      }, 200, "ease-in-out"), function() {
        $JSCompiler_StaticMethods_commitSwitch_$$($$jscomp$this$jscomp$504$$, $newPos$$);
      });
    } else {
      $JSCompiler_StaticMethods_commitSwitch_$$(this, $newPos$$), this.$container_$.scrollLeft = $newPos$$;
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$scrollHandler_$ = function() {
  var $currentScrollLeft$$ = this.$container_$.scrollLeft;
  this.$pos_$ = $currentScrollLeft$$;
  null === this.$scrollTimerId_$ && $JSCompiler_StaticMethods_AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel_prototype$waitForScroll_$$(this, $currentScrollLeft$$);
};
_.$JSCompiler_prototypeAlias$$.$hasPrev$ = function() {
  return 0 != this.$pos_$;
};
_.$JSCompiler_prototypeAlias$$.$hasNext$ = function() {
  return this.$pos_$ != Math.max(this.$container_$.scrollWidth - this.$layoutWidth_$, 0);
};
_.$$jscomp$inherits$$($BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$, $BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel$$);
_.$JSCompiler_prototypeAlias$$ = $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCarousel$ = function() {
  var $$jscomp$this$jscomp$510$$ = this;
  this.$hasLoop_$ = this.element.hasAttribute("loop");
  this.$hasAutoplay_$ = this.element.hasAttribute("autoplay");
  var $autoplayVal$$ = this.element.getAttribute("autoplay");
  $autoplayVal$$ && (this.$autoplayLoops_$ = (0,window.parseInt)($autoplayVal$$, 10));
  this.$buildSlides$();
  this.$shouldLoop$ = this.$hasLoop_$ && this.$isLoopingEligible$();
  (this.$shouldAutoplay_$ = this.$hasAutoplay_$ && this.$isLoopingEligible$()) && 0 != this.$autoplayLoops_$ && $JSCompiler_StaticMethods_setupAutoplay_$$(this);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "toggleAutoplay", function($autoplayVal$$) {
    ($autoplayVal$$ = $autoplayVal$$.args) && void 0 !== $autoplayVal$$.toggleOn ? $JSCompiler_StaticMethods_toggleAutoplay_$$($$jscomp$this$jscomp$510$$, $autoplayVal$$.toggleOn) : $JSCompiler_StaticMethods_toggleAutoplay_$$($$jscomp$this$jscomp$510$$, !$$jscomp$this$jscomp$510$$.$hasAutoplay_$);
  }, 1);
};
_.$JSCompiler_prototypeAlias$$.$buildSlides$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$onViewportCallback$ = function($inViewport$jscomp$16$$) {
  this.$updateViewportState$($inViewport$jscomp$16$$);
  $inViewport$jscomp$16$$ ? this.$autoplay_$() : $JSCompiler_StaticMethods_clearAutoplay$$(this);
};
_.$JSCompiler_prototypeAlias$$.$goCallback$ = function($dir$jscomp$6$$, $animate$jscomp$2$$, $opt_autoplay$jscomp$2$$) {
  this.$moveSlide$($dir$jscomp$6$$, $animate$jscomp$2$$);
  $opt_autoplay$jscomp$2$$ ? this.$autoplay_$() : $JSCompiler_StaticMethods_clearAutoplay$$(this);
};
_.$JSCompiler_prototypeAlias$$.$moveSlide$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$updateViewportState$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$isLoopingEligible$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$autoplay_$ = function() {
  this.$shouldAutoplay_$ && 0 != this.$autoplayLoops_$ && ($JSCompiler_StaticMethods_clearAutoplay$$(this), this.$autoplayTimeoutId_$ = _.$Services$$module$src$services$timerFor$$(this.$win$).delay(this.$BaseCarousel$$module$extensions$amp_carousel$0_1$base_carousel_prototype$go$.bind(this, 1, !0, !0), this.$autoplayDelay_$));
};
_.$$jscomp$inherits$$($AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$, $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$);
_.$JSCompiler_prototypeAlias$$ = $AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$45$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$45$$);
};
_.$JSCompiler_prototypeAlias$$.$buildSlides$ = function() {
  var $$jscomp$this$jscomp$511$$ = this;
  this.$vsync_$ = _.$JSCompiler_StaticMethods_getVsync$$(this);
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.element);
  this.$hasNativeSnapPoints_$ = void 0 != _.$getStyle$$module$src$style$$(this.element, "scrollSnapType");
  this.$shouldDisableCssSnap_$ && (this.$hasNativeSnapPoints_$ = !1);
  this.element.classList.add("i-amphtml-slidescroll");
  this.$slides_$ = this.$getRealChildren$();
  this.$noOfSlides_$ = this.$slides_$.length;
  this.$slidesContainer_$ = this.$win$.document.createElement("div");
  this.$slidesContainer_$.classList.add("i-amphtml-slides-container");
  this.$slidesContainer_$.setAttribute("aria-live", "polite");
  this.$shouldDisableCssSnap_$ && this.$slidesContainer_$.classList.add("i-amphtml-slidescroll-no-snap");
  if (this.$hasNativeSnapPoints_$) {
    var $end$jscomp$7_start$jscomp$15$$ = this.$win$.document.createElement("div");
    $end$jscomp$7_start$jscomp$15$$.classList.add("i-amphtml-carousel-start-marker");
    this.$slidesContainer_$.appendChild($end$jscomp$7_start$jscomp$15$$);
    $end$jscomp$7_start$jscomp$15$$ = this.$win$.document.createElement("div");
    $end$jscomp$7_start$jscomp$15$$.classList.add("i-amphtml-carousel-end-marker");
    this.$slidesContainer_$.appendChild($end$jscomp$7_start$jscomp$15$$);
  }
  this.element.appendChild(this.$slidesContainer_$);
  this.$slides_$.forEach(function($end$jscomp$7_start$jscomp$15$$, $index$jscomp$108_slideWrapper$$) {
    $$jscomp$this$jscomp$511$$.$dataSlideIdArr_$.push($end$jscomp$7_start$jscomp$15$$.getAttribute("data-slide-id") || $index$jscomp$108_slideWrapper$$.toString());
    _.$Resource$$module$src$service$resource$setOwner$$($end$jscomp$7_start$jscomp$15$$, $$jscomp$this$jscomp$511$$.element);
    $end$jscomp$7_start$jscomp$15$$.classList.add("amp-carousel-slide");
    $index$jscomp$108_slideWrapper$$ = $$jscomp$this$jscomp$511$$.$win$.document.createElement("div");
    $index$jscomp$108_slideWrapper$$.classList.add("i-amphtml-slide-item");
    $$jscomp$this$jscomp$511$$.$slidesContainer_$.appendChild($index$jscomp$108_slideWrapper$$);
    $index$jscomp$108_slideWrapper$$.appendChild($end$jscomp$7_start$jscomp$15$$);
    $$jscomp$this$jscomp$511$$.$slideWrappers_$.push($index$jscomp$108_slideWrapper$$);
  });
  $JSCompiler_StaticMethods_AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$cancelTouchEvents_$$(this);
  this.$slidesContainer_$.addEventListener("scroll", this.$AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$scrollHandler_$.bind(this));
  this.$slidesContainer_$.addEventListener("touchmove", this.$touchMoveHandler_$.bind(this));
  this.$slidesContainer_$.addEventListener("touchend", this.$touchEndHandler_$.bind(this));
  _.$JSCompiler_StaticMethods_registerAction$$(this, "goToSlide", function($end$jscomp$7_start$jscomp$15$$) {
    ($end$jscomp$7_start$jscomp$15$$ = $end$jscomp$7_start$jscomp$15$$.args) && $$jscomp$this$jscomp$511$$.$showSlideWhenReady$($end$jscomp$7_start$jscomp$15$$.index);
  }, 1);
};
_.$JSCompiler_prototypeAlias$$.$isLoopingEligible$ = function() {
  return 1 < this.$noOfSlides_$;
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$6_slide$jscomp$1$$) {
  $mutations$jscomp$6_slide$jscomp$1$$ = $mutations$jscomp$6_slide$jscomp$1$$.slide;
  void 0 !== $mutations$jscomp$6_slide$jscomp$1$$ && this.$showSlideWhenReady$($mutations$jscomp$6_slide$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$touchMoveHandler_$ = function() {
  $JSCompiler_StaticMethods_clearAutoplay$$(this);
  this.$hasNativeSnapPoints_$ && (this.$hasTouchMoved_$ = !0, this.$touchEndTimeout_$ && _.$Services$$module$src$services$timerFor$$(this.$win$).cancel(this.$touchEndTimeout_$));
};
_.$JSCompiler_prototypeAlias$$.$touchEndHandler_$ = function() {
  var $$jscomp$this$jscomp$512$$ = this;
  if (this.$hasTouchMoved_$) {
    this.$scrollTimeout_$ && _.$Services$$module$src$services$timerFor$$(this.$win$).cancel(this.$scrollTimeout_$);
    var $timeout$jscomp$11$$ = this.$shouldDisableCssSnap_$ ? 45 : 100;
    this.$touchEndTimeout_$ = _.$Services$$module$src$services$timerFor$$(this.$win$).delay(function() {
      $$jscomp$this$jscomp$512$$.$snappingInProgress_$ || ($JSCompiler_StaticMethods_updateOnScroll_$$($$jscomp$this$jscomp$512$$, $$jscomp$this$jscomp$512$$.$slidesContainer_$.scrollLeft), $$jscomp$this$jscomp$512$$.$touchEndTimeout_$ = null);
    }, $timeout$jscomp$11$$);
  }
  this.$hasTouchMoved_$ = !1;
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  this.$slideWidth_$ = this.$layoutWidth_$;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  if (null === this.$slideIndex_$) {
    $JSCompiler_StaticMethods_showSlide_$$(this, this.$initialSlideIndex_$);
  } else {
    var $index$jscomp$109$$ = _.$JSCompiler_StaticMethods_assertNumber$$(_.$user$$module$src$log$$(), this.$slideIndex_$, "E#19457 this.slideIndex_"), $scrollLeft$jscomp$8$$ = $JSCompiler_StaticMethods_getScrollLeftForIndex_$$(this, $index$jscomp$109$$);
    this.$scheduleLayout$(this.$slides_$[$index$jscomp$109$$]);
    this.$previousScrollLeft_$ = this.$slidesContainer_$.scrollLeft = $scrollLeft$jscomp$8$$;
  }
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$slideIndex_$ = null;
  return $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype.$unlayoutCallback$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$updateViewportState$ = function($inViewport$jscomp$17$$) {
  null !== this.$slideIndex_$ && this.$updateInViewport$(this.$slides_$[_.$JSCompiler_StaticMethods_assertNumber$$(_.$user$$module$src$log$$(), this.$slideIndex_$, "E#19457 this.slideIndex_")], $inViewport$jscomp$17$$);
};
_.$JSCompiler_prototypeAlias$$.$hasPrev$ = function() {
  return this.$shouldLoop$ || 0 < this.$slideIndex_$;
};
_.$JSCompiler_prototypeAlias$$.$hasNext$ = function() {
  return this.$shouldLoop$ || this.$slideIndex_$ < this.$slides_$.length - 1;
};
_.$JSCompiler_prototypeAlias$$.$moveSlide$ = function($dir$jscomp$7$$, $animate$jscomp$3$$) {
  if (null !== this.$slideIndex_$) {
    var $hasNext_newIndex$jscomp$1$$ = this.$hasNext$(), $hasPrev$$ = this.$hasPrev$();
    if (1 == $dir$jscomp$7$$ && $hasNext_newIndex$jscomp$1$$ || -1 == $dir$jscomp$7$$ && $hasPrev$$) {
      $hasNext_newIndex$jscomp$1$$ = this.$slideIndex_$ + $dir$jscomp$7$$, -1 == $hasNext_newIndex$jscomp$1$$ ? $hasNext_newIndex$jscomp$1$$ = this.$noOfSlides_$ - 1 : $hasNext_newIndex$jscomp$1$$ >= this.$noOfSlides_$ && ($hasNext_newIndex$jscomp$1$$ = 0), $animate$jscomp$3$$ ? $JSCompiler_StaticMethods_customSnap_$$(this, 1 != $dir$jscomp$7$$ || $hasPrev$$ ? this.$slideWidth_$ : 0, $dir$jscomp$7$$) : $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$(this, $hasNext_newIndex$jscomp$1$$);
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll_prototype$scrollHandler_$ = function() {
  var $$jscomp$this$jscomp$513$$ = this;
  this.$scrollTimeout_$ && _.$Services$$module$src$services$timerFor$$(this.$win$).cancel(this.$scrollTimeout_$);
  var $currentScrollLeft$jscomp$3$$ = this.$slidesContainer_$.scrollLeft;
  this.$isIos_$ || $JSCompiler_StaticMethods_handleCustomElasticScroll_$$(this, $currentScrollLeft$jscomp$3$$);
  if (!this.$touchEndTimeout_$) {
    var $timeout$jscomp$12$$ = this.$hasNativeSnapPoints_$ ? 135 : this.$isIos_$ ? 45 : 100;
    this.$scrollTimeout_$ = _.$Services$$module$src$services$timerFor$$(this.$win$).delay(function() {
      $$jscomp$this$jscomp$513$$.$snappingInProgress_$ || ($$jscomp$this$jscomp$513$$.$hasNativeSnapPoints_$ ? $JSCompiler_StaticMethods_updateOnScroll_$$($$jscomp$this$jscomp$513$$, $currentScrollLeft$jscomp$3$$) : $JSCompiler_StaticMethods_customSnap_$$($$jscomp$this$jscomp$513$$, $currentScrollLeft$jscomp$3$$));
    }, $timeout$jscomp$12$$);
  }
  this.$previousScrollLeft_$ = $currentScrollLeft$jscomp$3$$;
};
_.$JSCompiler_prototypeAlias$$.$getPrevButtonTitle$ = function() {
  var $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$ = this.$slideIndex_$;
  $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$ = 0 <= $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$ - 1 ? $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$ - 1 : this.$shouldLoop$ ? this.$noOfSlides_$ - 1 : null;
  $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$ = null == $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$ ? 0 : $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$;
  return $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype.$getPrevButtonTitle$.call(this) + $JSCompiler_StaticMethods_getButtonTitleSuffix_$$(this, $JSCompiler_inline_result$jscomp$706_currentIndex$jscomp$inline_2957_index$jscomp$111$$);
};
_.$JSCompiler_prototypeAlias$$.$getNextButtonTitle$ = function() {
  var $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$ = this.$slideIndex_$;
  $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$ = $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$ + 1 < this.$noOfSlides_$ ? $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$ + 1 : this.$shouldLoop$ ? 0 : null;
  $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$ = null == $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$ ? this.$noOfSlides_$ - 1 : $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$;
  return $BaseSlides$$module$extensions$amp_carousel$0_1$base_slides$$.prototype.$getNextButtonTitle$.call(this) + $JSCompiler_StaticMethods_getButtonTitleSuffix_$$(this, $JSCompiler_inline_result$jscomp$707_currentIndex$jscomp$inline_2960_index$jscomp$112$$);
};
_.$JSCompiler_prototypeAlias$$.$showSlideWhenReady$ = function($value$jscomp$204$$) {
  var $index$jscomp$113$$ = (0,window.parseInt)($value$jscomp$204$$, 10);
  !(0,window.isFinite)($index$jscomp$113$$) || 0 > $index$jscomp$113$$ || $index$jscomp$113$$ >= this.$noOfSlides_$ ? this.$user$().error("AMP-CAROUSEL", "Invalid [slide] value: ", $value$jscomp$204$$) : null === this.$slideIndex_$ ? this.$initialSlideIndex_$ = $index$jscomp$113$$ : $JSCompiler_StaticMethods_showSlideAndTriggerAction_$$(this, $index$jscomp$113$$);
};
_.$$jscomp$inherits$$($CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$, window.AMP.BaseElement);
$CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$.prototype.$upgradeCallback$ = function() {
  return "slides" == this.element.getAttribute("type") ? new $AmpSlideScroll$$module$extensions$amp_carousel$0_1$slidescroll$$(this.element) : new $AmpScrollableCarousel$$module$extensions$amp_carousel$0_1$scrollable_carousel$$(this.element);
};
window.self.AMP.registerElement("amp-carousel", $CarouselSelector$$module$extensions$amp_carousel$0_1$amp_carousel$$, ".amp-carousel-slide>.i-amphtml-replaced-content{-o-object-fit:contain;object-fit:contain}.amp-carousel-button{position:absolute;box-sizing:border-box;top:50%;height:34px;width:34px;border-radius:2px;opacity:0;pointer-events:all;background-color:rgba(0,0,0,0.5);background-position:50% 50%;background-repeat:no-repeat;-webkit-transform:translateY(-50%);transform:translateY(-50%);visibility:hidden;z-index:10}.amp-mode-mouse .amp-carousel-button,amp-carousel[controls] .amp-carousel-button{opacity:1;visibility:visible}.amp-carousel-button-prev{left:16px;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='%23fff'%3E%3Cpath d='M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z'/%3E%3C/svg%3E\");background-size:18px 18px}.amp-carousel-button-next{right:16px;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='%23fff'%3E%3Cpath d='M9 3L7.94 4.06l4.19 4.19H3v1.5h9.13l-4.19 4.19L9 15l6-6z'/%3E%3C/svg%3E\");background-size:18px 18px}.i-amphtml-carousel-button-start-hint .amp-carousel-button:not(.amp-disabled){-webkit-animation:i-amphtml-carousel-hint 1s ease-in 3s 1 normal both;animation:i-amphtml-carousel-hint 1s ease-in 3s 1 normal both}.amp-mode-mouse .i-amphtml-carousel-button-start-hint .amp-carousel-button:not(.amp-disabled){-webkit-animation:none;animation:none}@-webkit-keyframes i-amphtml-carousel-hint{0%{opacity:1;visibility:visible}to{opacity:0;visibility:hidden}}@keyframes i-amphtml-carousel-hint{0%{opacity:1;visibility:visible}to{opacity:0;visibility:hidden}}amp-carousel .amp-carousel-button.amp-disabled{-webkit-animation:none;animation:none;opacity:0;visibility:hidden}.i-amphtml-slides-container{display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-ms-flex-wrap:nowrap;flex-wrap:nowrap;height:100%!important;left:0;overflow-x:auto!important;overflow-y:hidden!important;position:absolute!important;top:0;width:100%!important;-webkit-scroll-snap-type:x mandatory!important;scroll-snap-type:x mandatory!important;padding-bottom:20px!important;box-sizing:content-box!important;-webkit-overflow-scrolling:touch!important}.i-amphtml-slides-container.i-amphtml-no-scroll{overflow-x:hidden!important}.i-amphtml-slide-item{-webkit-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;display:none!important;-webkit-box-flex:0!important;-ms-flex:0 0 100%!important;flex:0 0 100%!important;height:100%!important;-webkit-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;position:relative!important;scroll-snap-align:start!important;width:100%!important}.i-amphtml-slide-item>*{height:100%;width:100%;overflow:hidden!important}.i-amphtml-slide-item-show{display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important}.i-amphtml-carousel-end-marker,.i-amphtml-carousel-start-marker{background-color:transparent!important;display:block!important;-webkit-box-flex:0!important;-ms-flex:0 0 1px!important;flex:0 0 1px!important;height:100%!important;position:relative!important;scroll-snap-align:start!important;width:1px!important}.i-amphtml-carousel-start-marker{-webkit-box-ordinal-group:0!important;-ms-flex-order:-1!important;order:-1!important;margin-left:-1px!important}.i-amphtml-carousel-end-marker{-webkit-box-ordinal-group:100000001!important;-ms-flex-order:100000000!important;order:100000000!important;margin-right:-1px!important}.i-amphtml-slidescroll-no-snap.i-amphtml-slides-container{-webkit-scroll-snap-type:none!important;scroll-snap-type:none!important}.i-amphtml-slidescroll-no-snap .i-amphtml-slide-item{scroll-snap-align:none!important}.i-amphtml-slidescroll-no-snap.i-amphtml-slides-container.i-amphtml-no-scroll{-webkit-overflow-scrolling:auto!important}.amp-scrollable-carousel-slide{display:inline-block!important;margin-left:8px}.amp-scrollable-carousel-slide:first-child{margin-left:0px}.i-amphtml-scrollable-carousel-container{white-space:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important}\n/*# sourceURL=/extensions/amp-carousel/0.1/amp-carousel.css*/");

})});
