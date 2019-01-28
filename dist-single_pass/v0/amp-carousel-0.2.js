(self.AMP=self.AMP||[]).push({n:"amp-carousel",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $ResponsiveAttributes$$module$extensions$amp_carousel$0_2$responsive_attributes$$ = function($config$jscomp$52$$) {
  this.$config_$ = $config$jscomp$52$$;
  this.$D$ = {};
  this.$F$ = {};
}, $JSCompiler_StaticMethods_updateAttribute$$ = function($JSCompiler_StaticMethods_updateAttribute$self$$, $name$jscomp$218$$, $newValue$jscomp$12$$) {
  function $notifyIfChanged$$() {
    var $newValue$jscomp$12$$;
    a: {
      for ($newValue$jscomp$12$$ = 0; $newValue$jscomp$12$$ < $mqlv$$.length; $newValue$jscomp$12$$++) {
        var $notifyIfChanged$$ = $mqlv$$[$newValue$jscomp$12$$], $prevMqlv$$ = $notifyIfChanged$$.value;
        if ($notifyIfChanged$$.$mediaQueryList$.matches) {
          $newValue$jscomp$12$$ = $prevMqlv$$;
          break a;
        }
      }
      $newValue$jscomp$12$$ = "";
    }
    $JSCompiler_StaticMethods_updateAttribute$self$$.$D$[$name$jscomp$218$$] !== $newValue$jscomp$12$$ && (($notifyIfChanged$$ = $JSCompiler_StaticMethods_updateAttribute$self$$.$config_$[$name$jscomp$218$$]) && $notifyIfChanged$$($newValue$jscomp$12$$), $JSCompiler_StaticMethods_updateAttribute$self$$.$D$[$name$jscomp$218$$] = $newValue$jscomp$12$$);
  }
  var $prevMqlv$$ = $JSCompiler_StaticMethods_updateAttribute$self$$.$F$[$name$jscomp$218$$];
  $prevMqlv$$ && $JSCompiler_StaticMethods_setOnchange_$$($prevMqlv$$, null);
  var $mqlv$$ = $JSCompiler_StaticMethods_getMediaQueryListsAndValues_$$($newValue$jscomp$12$$);
  $JSCompiler_StaticMethods_setOnchange_$$($mqlv$$, $notifyIfChanged$$);
  $notifyIfChanged$$();
  $JSCompiler_StaticMethods_updateAttribute$self$$.$F$[$name$jscomp$218$$] = $mqlv$$;
}, $JSCompiler_StaticMethods_getMediaQueryListsAndValues_$$ = function($value$jscomp$205$$) {
  return $value$jscomp$205$$.split(",").map(function($value$jscomp$205$$) {
    var $part$jscomp$2$$ = /[a-z0-9.]+$/.exec($value$jscomp$205$$).index, $value$jscomp$206$$ = $value$jscomp$205$$.slice($part$jscomp$2$$);
    return {$mediaQueryList$:window.matchMedia($value$jscomp$205$$.slice(0, $part$jscomp$2$$).trim()), value:$value$jscomp$206$$};
  });
}, $JSCompiler_StaticMethods_setOnchange_$$ = function($mediaQueryListsAndValues$jscomp$1$$, $fn$jscomp$23$$) {
  $mediaQueryListsAndValues$jscomp$1$$.forEach(function($mediaQueryListsAndValues$jscomp$1$$) {
    $mediaQueryListsAndValues$jscomp$1$$.$mediaQueryList$.onchange = $fn$jscomp$23$$;
  });
}, $getDimension$$module$extensions$amp_carousel$0_2$dimensions$$ = function($axis$$, $el$jscomp$48_top$jscomp$9$$) {
  var $$jscomp$destructuring$var361_width$jscomp$42$$ = $el$jscomp$48_top$jscomp$9$$.getBoundingClientRect();
  $el$jscomp$48_top$jscomp$9$$ = $$jscomp$destructuring$var361_width$jscomp$42$$.top;
  var $bottom$jscomp$3$$ = $$jscomp$destructuring$var361_width$jscomp$42$$.bottom, $height$jscomp$38$$ = $$jscomp$destructuring$var361_width$jscomp$42$$.height, $left$jscomp$13$$ = $$jscomp$destructuring$var361_width$jscomp$42$$.left, $right$jscomp$8$$ = $$jscomp$destructuring$var361_width$jscomp$42$$.right;
  $$jscomp$destructuring$var361_width$jscomp$42$$ = $$jscomp$destructuring$var361_width$jscomp$42$$.width;
  return {start:0 == $axis$$ ? $left$jscomp$13$$ : $el$jscomp$48_top$jscomp$9$$, end:0 == $axis$$ ? $right$jscomp$8$$ : $bottom$jscomp$3$$, length:0 == $axis$$ ? $$jscomp$destructuring$var361_width$jscomp$42$$ : $height$jscomp$38$$};
}, $getCenter$$module$extensions$amp_carousel$0_2$dimensions$$ = function($$jscomp$destructuring$var362_axis$jscomp$1$$, $el$jscomp$49$$) {
  $$jscomp$destructuring$var362_axis$jscomp$1$$ = $getDimension$$module$extensions$amp_carousel$0_2$dimensions$$($$jscomp$destructuring$var362_axis$jscomp$1$$, $el$jscomp$49$$);
  return ($$jscomp$destructuring$var362_axis$jscomp$1$$.start + $$jscomp$destructuring$var362_axis$jscomp$1$$.end) / 2;
}, $updateLengthStyle$$module$extensions$amp_carousel$0_2$dimensions$$ = function($axis$jscomp$3$$, $el$jscomp$51$$, $length$jscomp$36$$) {
  0 == $axis$jscomp$3$$ ? _.$setStyle$$module$src$style$$($el$jscomp$51$$, "width", $length$jscomp$36$$ + "px") : _.$setStyle$$module$src$style$$($el$jscomp$51$$, "height", $length$jscomp$36$$ + "px");
}, $forwardWrappingDistance$$module$extensions$amp_carousel$0_2$array_util$$ = function($a$jscomp$204$$, $b$jscomp$184$$, $arr$jscomp$12_length$jscomp$37$$) {
  $arr$jscomp$12_length$jscomp$37$$ = $arr$jscomp$12_length$jscomp$37$$.length;
  return $a$jscomp$204$$ === $b$jscomp$184$$ ? $arr$jscomp$12_length$jscomp$37$$ : _.$mod$$module$src$utils$math$$($b$jscomp$184$$ - $a$jscomp$204$$, $arr$jscomp$12_length$jscomp$37$$);
}, $backwardWrappingDistance$$module$extensions$amp_carousel$0_2$array_util$$ = function($a$jscomp$205$$, $b$jscomp$185$$, $arr$jscomp$13_length$jscomp$38$$) {
  $arr$jscomp$13_length$jscomp$38$$ = $arr$jscomp$13_length$jscomp$38$$.length;
  return $a$jscomp$205$$ === $b$jscomp$185$$ ? $arr$jscomp$13_length$jscomp$38$$ : _.$mod$$module$src$utils$math$$($a$jscomp$205$$ - $b$jscomp$185$$, $arr$jscomp$13_length$jscomp$38$$);
}, $AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance$$ = function($config$jscomp$53$$) {
  var $$jscomp$this$jscomp$520$$ = this, $scrollContainer$$ = $config$jscomp$53$$.$scrollContainer$, $advanceable$$ = $config$jscomp$53$$.$advanceable$;
  this.$O$ = $config$jscomp$53$$.$win$;
  this.$I$ = $scrollContainer$$;
  this.$P$ = $advanceable$$;
  this.$D$ = !1;
  this.$J$ = 1;
  this.$G$ = 2000;
  this.$F$ = !1;
  this.$K$ = null;
  $JSCompiler_StaticMethods_createDebouncedAdvance_$$(this, this.$G$);
  this.$I$.addEventListener("scroll", function() {
    $JSCompiler_StaticMethods_resetAutoAdvance_$$($$jscomp$this$jscomp$520$$);
  }, !0);
  this.$I$.addEventListener("touchstart", function() {
    return $JSCompiler_StaticMethods_AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance_prototype$handleTouchStart_$$($$jscomp$this$jscomp$520$$);
  }, !0);
}, $JSCompiler_StaticMethods_createDebouncedAdvance_$$ = function($JSCompiler_StaticMethods_createDebouncedAdvance_$self$$, $interval$jscomp$9$$) {
  $JSCompiler_StaticMethods_createDebouncedAdvance_$self$$.$K$ = _.$debounce$$module$src$utils$rate_limit$$($JSCompiler_StaticMethods_createDebouncedAdvance_$self$$.$O$, function() {
    $JSCompiler_StaticMethods_createDebouncedAdvance_$self$$.$D$ && !$JSCompiler_StaticMethods_createDebouncedAdvance_$self$$.$F$ && $JSCompiler_StaticMethods_createDebouncedAdvance_$self$$.$P$.advance($JSCompiler_StaticMethods_createDebouncedAdvance_$self$$.$J$);
  }, $interval$jscomp$9$$);
}, $JSCompiler_StaticMethods_AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance_prototype$handleTouchStart_$$ = function($JSCompiler_StaticMethods_AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance_prototype$handleTouchStart_$self$$) {
  $JSCompiler_StaticMethods_AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance_prototype$handleTouchStart_$self$$.$F$ = !0;
  _.$listenOnce$$module$src$event_helper$$(window, "touchend", function() {
    $JSCompiler_StaticMethods_AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance_prototype$handleTouchStart_$self$$.$F$ = !1;
    $JSCompiler_StaticMethods_resetAutoAdvance_$$($JSCompiler_StaticMethods_AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance_prototype$handleTouchStart_$self$$);
  }, {capture:!0});
}, $JSCompiler_StaticMethods_resetAutoAdvance_$$ = function($JSCompiler_StaticMethods_resetAutoAdvance_$self$$) {
  $JSCompiler_StaticMethods_resetAutoAdvance_$self$$.$D$ && $JSCompiler_StaticMethods_resetAutoAdvance_$self$$.$K$();
}, $runDisablingSmoothScroll$$module$extensions$amp_carousel$0_2$carousel$$ = function($el$jscomp$56$$, $cb$jscomp$6$$) {
  var $scrollBehavior$$ = _.$getStyle$$module$src$style$$($el$jscomp$56$$, "scrollBehavior");
  _.$setStyle$$module$src$style$$($el$jscomp$56$$, "scrollBehavior", "auto");
  $cb$jscomp$6$$();
  _.$setStyle$$module$src$style$$($el$jscomp$56$$, "scrollBehavior", $scrollBehavior$$);
}, $sum$$module$extensions$amp_carousel$0_2$carousel$$ = function($arr$jscomp$14$$) {
  $arr$jscomp$14$$.reduce(function($arr$jscomp$14$$, $c$jscomp$136$$) {
    return $arr$jscomp$14$$ + $c$jscomp$136$$;
  }, 0);
}, $Carousel$$module$extensions$amp_carousel$0_2$carousel$$ = function($config$jscomp$54$$) {
  var $$jscomp$this$jscomp$523$$ = this, $win$jscomp$339$$ = $config$jscomp$54$$.$win$, $element$jscomp$377$$ = $config$jscomp$54$$.element, $scrollContainer$jscomp$1$$ = $config$jscomp$54$$.$scrollContainer$;
  this.$fa$ = $config$jscomp$54$$.$runMutate$;
  this.$element_$ = $element$jscomp$377$$;
  this.$D$ = $scrollContainer$jscomp$1$$;
  this.$P$ = new $AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance$$({$win$:$win$jscomp$339$$, $scrollContainer$:$scrollContainer$jscomp$1$$, $advanceable$:this});
  this.$aa$ = _.$debounce$$module$src$utils$rate_limit$$($win$jscomp$339$$, function() {
    return $JSCompiler_StaticMethods_resetScrollReferencePoint_$$($$jscomp$this$jscomp$523$$);
  }, 200);
  this.$advanceCount_$ = 1;
  this.$ba$ = !1;
  this.$slides_$ = [];
  this.$V$ = !1;
  this.$K$ = [];
  this.$O$ = [];
  this.$J$ = [];
  this.$R$ = !1;
  this.$ea$ = window.NaN;
  this.$U$ = !1;
  this.$G$ = "start";
  this.$F$ = this.$I$ = 0;
  this.$loop_$ = !1;
  this.$ga$ = Number.MAX_VALUE;
  this.$Y$ = !0;
  this.$W$ = this.$ha$ = 1;
  this.$D$.addEventListener("scroll", function() {
    $$jscomp$this$jscomp$523$$.$R$ ? $$jscomp$this$jscomp$523$$.$R$ = !1 : $$jscomp$this$jscomp$523$$.$aa$();
  }, !0);
  this.$D$.addEventListener("touchstart", function() {
    return $JSCompiler_StaticMethods_Carousel$$module$extensions$amp_carousel$0_2$carousel_prototype$handleTouchStart_$$($$jscomp$this$jscomp$523$$);
  }, !0);
}, $JSCompiler_StaticMethods_goToSlide$$ = function($JSCompiler_StaticMethods_goToSlide$self$$, $index$jscomp$116$$) {
  0 > $index$jscomp$116$$ || $index$jscomp$116$$ > $JSCompiler_StaticMethods_goToSlide$self$$.$slides_$.length - 1 || ($JSCompiler_StaticMethods_goToSlide$self$$.$F$ = $index$jscomp$116$$, $JSCompiler_StaticMethods_scrollCurrentIntoView_$$($JSCompiler_StaticMethods_goToSlide$self$$));
}, $JSCompiler_StaticMethods_updateSlides$$ = function($JSCompiler_StaticMethods_updateSlides$self$$, $slides$jscomp$1$$) {
  $JSCompiler_StaticMethods_updateSlides$self$$.$slides_$ = $slides$jscomp$1$$;
  $JSCompiler_StaticMethods_updateUi$$($JSCompiler_StaticMethods_updateSlides$self$$);
}, $JSCompiler_StaticMethods_updateUi$$ = function($JSCompiler_StaticMethods_updateUi$self$$) {
  $JSCompiler_StaticMethods_updateUi$self$$.$V$ || ($JSCompiler_StaticMethods_updateUi$self$$.$V$ = !0, $JSCompiler_StaticMethods_updateUi$self$$.$fa$(function() {
    $JSCompiler_StaticMethods_updateUi$self$$.$V$ = !1;
    $JSCompiler_StaticMethods_updateUi$self$$.$D$.setAttribute("mixed-length", $JSCompiler_StaticMethods_updateUi$self$$.$ba$);
    $JSCompiler_StaticMethods_updateUi$self$$.$D$.setAttribute("user-scrollable", !0);
    $JSCompiler_StaticMethods_updateUi$self$$.$D$.setAttribute("horizontal", 0 == $JSCompiler_StaticMethods_updateUi$self$$.$I$);
    $JSCompiler_StaticMethods_updateUi$self$$.$D$.setAttribute("loop", $JSCompiler_StaticMethods_updateUi$self$$.$loop_$);
    $JSCompiler_StaticMethods_updateUi$self$$.$D$.setAttribute("snap", $JSCompiler_StaticMethods_updateUi$self$$.$Y$);
    $JSCompiler_StaticMethods_updateUi$self$$.$slides_$.length && ($JSCompiler_StaticMethods_updateSpacers_$$($JSCompiler_StaticMethods_updateUi$self$$), $JSCompiler_StaticMethods_setChildrenSnapAlign_$$($JSCompiler_StaticMethods_updateUi$self$$), $JSCompiler_StaticMethods_hideSpacersAndSlides_$$($JSCompiler_StaticMethods_updateUi$self$$), $JSCompiler_StaticMethods_resetScrollReferencePoint_$$($JSCompiler_StaticMethods_updateUi$self$$, !0), $JSCompiler_StaticMethods_updateUi$self$$.$R$ = !0, $runDisablingSmoothScroll$$module$extensions$amp_carousel$0_2$carousel$$($JSCompiler_StaticMethods_updateUi$self$$.$D$, 
    function() {
      $JSCompiler_StaticMethods_scrollCurrentIntoView_$$($JSCompiler_StaticMethods_updateUi$self$$);
    }));
  }));
}, $JSCompiler_StaticMethods_Carousel$$module$extensions$amp_carousel$0_2$carousel_prototype$handleTouchStart_$$ = function($JSCompiler_StaticMethods_Carousel$$module$extensions$amp_carousel$0_2$carousel_prototype$handleTouchStart_$self$$) {
  $JSCompiler_StaticMethods_Carousel$$module$extensions$amp_carousel$0_2$carousel_prototype$handleTouchStart_$self$$.$U$ = !0;
  _.$listenOnce$$module$src$event_helper$$(window, "touchend", function() {
    $JSCompiler_StaticMethods_Carousel$$module$extensions$amp_carousel$0_2$carousel_prototype$handleTouchStart_$self$$.$U$ = !1;
    $JSCompiler_StaticMethods_Carousel$$module$extensions$amp_carousel$0_2$carousel_prototype$handleTouchStart_$self$$.$aa$();
  }, {capture:!0});
}, $JSCompiler_StaticMethods_getSlideLengths_$$ = function($JSCompiler_StaticMethods_getSlideLengths_$self$$) {
  return $JSCompiler_StaticMethods_getSlideLengths_$self$$.$slides_$.map(function($s$jscomp$34$$) {
    return $getDimension$$module$extensions$amp_carousel$0_2$dimensions$$($JSCompiler_StaticMethods_getSlideLengths_$self$$.$I$, $s$jscomp$34$$).length;
  });
}, $JSCompiler_StaticMethods_createSpacers_$$ = function($count$jscomp$19$$) {
  for (var $spacers$$ = [], $i$jscomp$272$$ = 0; $i$jscomp$272$$ < $count$jscomp$19$$; $i$jscomp$272$$++) {
    var $spacer$$ = window.document.createElement("div");
    $spacer$$.className = "i-amphtml-carousel-spacer";
    $spacers$$.push($spacer$$);
  }
  return $spacers$$;
}, $JSCompiler_StaticMethods_updateSpacers_$$ = function($JSCompiler_StaticMethods_updateSpacers_$self$$) {
  var $axis_$$ = $JSCompiler_StaticMethods_updateSpacers_$self$$.$I$, $slides_$$ = $JSCompiler_StaticMethods_updateSpacers_$self$$.$slides_$, $slideLengths$$ = $JSCompiler_StaticMethods_getSlideLengths_$$($JSCompiler_StaticMethods_updateSpacers_$self$$);
  $sum$$module$extensions$amp_carousel$0_2$carousel$$($slideLengths$$);
  var $count$jscomp$20$$ = $JSCompiler_StaticMethods_updateSpacers_$self$$.$loop_$ ? $slides_$$.length : 0;
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$K$.forEach(function($axis_$$) {
    $JSCompiler_StaticMethods_updateSpacers_$self$$.$D$.removeChild($axis_$$);
  });
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$K$ = $JSCompiler_StaticMethods_createSpacers_$$($count$jscomp$20$$);
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$K$.forEach(function($count$jscomp$20$$, $i$jscomp$273$$) {
    $updateLengthStyle$$module$extensions$amp_carousel$0_2$dimensions$$($axis_$$, $count$jscomp$20$$, $slideLengths$$[$i$jscomp$273$$]);
    $JSCompiler_StaticMethods_updateSpacers_$self$$.$D$.insertBefore($count$jscomp$20$$, $slides_$$[0]);
  });
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$O$.forEach(function($axis_$$) {
    $JSCompiler_StaticMethods_updateSpacers_$self$$.$D$.removeChild($axis_$$);
  });
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$O$ = $JSCompiler_StaticMethods_createSpacers_$$($count$jscomp$20$$);
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$O$.forEach(function($slides_$$, $count$jscomp$20$$) {
    $updateLengthStyle$$module$extensions$amp_carousel$0_2$dimensions$$($axis_$$, $slides_$$, $slideLengths$$[$count$jscomp$20$$]);
    $JSCompiler_StaticMethods_updateSpacers_$self$$.$D$.appendChild($slides_$$);
  });
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$J$.forEach(function($axis_$$) {
    $JSCompiler_StaticMethods_updateSpacers_$self$$.$D$.removeChild($axis_$$);
  });
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$J$ = $JSCompiler_StaticMethods_createSpacers_$$($count$jscomp$20$$);
  $JSCompiler_StaticMethods_updateSpacers_$self$$.$J$.forEach(function($slides_$$, $count$jscomp$20$$) {
    $updateLengthStyle$$module$extensions$amp_carousel$0_2$dimensions$$($axis_$$, $slides_$$, $slideLengths$$[$count$jscomp$20$$]);
    $JSCompiler_StaticMethods_updateSpacers_$self$$.$D$.appendChild($slides_$$);
  });
}, $JSCompiler_StaticMethods_setChildrenSnapAlign_$$ = function($JSCompiler_StaticMethods_setChildrenSnapAlign_$self$$) {
  var $slideCount$$ = $JSCompiler_StaticMethods_setChildrenSnapAlign_$self$$.$slides_$.length, $oddVisibleCount$$ = 1 == _.$mod$$module$src$utils$math$$($JSCompiler_StaticMethods_setChildrenSnapAlign_$self$$.$W$, 2), $coordinate$$ = "start" == $JSCompiler_StaticMethods_setChildrenSnapAlign_$self$$.$G$ || $oddVisibleCount$$ ? "0%" : "50%";
  _.$iterateCursor$$module$src$dom$$($JSCompiler_StaticMethods_setChildrenSnapAlign_$self$$.$D$.children, function($oddVisibleCount$$, $index$jscomp$117_shouldSnap$$) {
    $index$jscomp$117_shouldSnap$$ = 0 == _.$mod$$module$src$utils$math$$(_.$mod$$module$src$utils$math$$($index$jscomp$117_shouldSnap$$, $slideCount$$), $JSCompiler_StaticMethods_setChildrenSnapAlign_$self$$.$ha$);
    _.$setStyles$$module$src$style$$($oddVisibleCount$$, {"scroll-snap-align":$index$jscomp$117_shouldSnap$$ ? $JSCompiler_StaticMethods_setChildrenSnapAlign_$self$$.$G$ : "none", "scroll-snap-coordinate":$index$jscomp$117_shouldSnap$$ ? $coordinate$$ : "none"});
  });
}, $JSCompiler_StaticMethods_hideSpacersAndSlides_$$ = function($JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$) {
  var $afterSpacers_$$ = $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.$J$, $beforeSpacers_$$ = $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.$K$, $currentIndex_$jscomp$1$$ = $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.$F$, $loop_$$ = $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.$loop_$, $slides_$jscomp$1$$ = $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.$slides_$, $sideSlideCount$jscomp$1$$ = Math.min($slides_$jscomp$1$$.length - 1, $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.$ga$), 
  $numBeforeSpacers$$ = Math.max(0, $slides_$jscomp$1$$.length - $currentIndex_$jscomp$1$$ - 1), $numAfterSpacers$$ = Math.max(0, $currentIndex_$jscomp$1$$ - 1);
  [$slides_$jscomp$1$$, $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.$O$].forEach(function($JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$) {
    $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.forEach(function($afterSpacers_$$, $beforeSpacers_$$) {
      $afterSpacers_$$.hidden = ($loop_$$ ? $currentIndex_$jscomp$1$$ === $beforeSpacers_$$ ? 0 : Math.min($forwardWrappingDistance$$module$extensions$amp_carousel$0_2$array_util$$($currentIndex_$jscomp$1$$, $beforeSpacers_$$, $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$), $backwardWrappingDistance$$module$extensions$amp_carousel$0_2$array_util$$($currentIndex_$jscomp$1$$, $beforeSpacers_$$, $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$)) : Math.abs($currentIndex_$jscomp$1$$ - 
      $beforeSpacers_$$)) > $sideSlideCount$jscomp$1$$;
    });
  });
  $beforeSpacers_$$.forEach(function($JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$, $afterSpacers_$$) {
    $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.hidden = $backwardWrappingDistance$$module$extensions$amp_carousel$0_2$array_util$$($currentIndex_$jscomp$1$$, $afterSpacers_$$, $beforeSpacers_$$) > $sideSlideCount$jscomp$1$$ || $afterSpacers_$$ < $slides_$jscomp$1$$.length - $numBeforeSpacers$$;
  });
  $afterSpacers_$$.forEach(function($JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$, $beforeSpacers_$$) {
    $JSCompiler_StaticMethods_hideSpacersAndSlides_$self$$.hidden = $forwardWrappingDistance$$module$extensions$amp_carousel$0_2$array_util$$($currentIndex_$jscomp$1$$, $beforeSpacers_$$, $afterSpacers_$$) > $sideSlideCount$jscomp$1$$ || $beforeSpacers_$$ > $numAfterSpacers$$;
  });
}, $JSCompiler_StaticMethods_resetScrollReferencePoint_$$ = function($JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$, $force$jscomp$4$$) {
  $JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$.$U$ || $JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$.$ea$ == $JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$.$F$ && (void 0 === $force$jscomp$4$$ || !$force$jscomp$4$$) || ($sum$$module$extensions$amp_carousel$0_2$carousel$$($JSCompiler_StaticMethods_getSlideLengths_$$($JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$)), $JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$.$fa$(function() {
    $JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$.$ea$ = $JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$.$F$;
    $JSCompiler_StaticMethods_hideSpacersAndSlides_$$($JSCompiler_StaticMethods_resetScrollReferencePoint_$self$$);
  }));
}, $JSCompiler_StaticMethods_scrollCurrentIntoView_$$ = function($JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$) {
  var $el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$ = $JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$.$slides_$[$JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$.$F$], $container$jscomp$inline_2997$$ = $JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$.$D$, 
  $axis$jscomp$inline_2998$$ = $JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$.$I$;
  $el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$ = ($JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$ = "start" == $JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$.$G$) ? $getDimension$$module$extensions$amp_carousel$0_2$dimensions$$($axis$jscomp$inline_2998$$, $el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$).start : 
  $getCenter$$module$extensions$amp_carousel$0_2$dimensions$$($axis$jscomp$inline_2998$$, $el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$);
  $JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$ = $JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$ ? $getDimension$$module$extensions$amp_carousel$0_2$dimensions$$($axis$jscomp$inline_2998$$, $container$jscomp$inline_2997$$).start : $getCenter$$module$extensions$amp_carousel$0_2$dimensions$$($axis$jscomp$inline_2998$$, $container$jscomp$inline_2997$$);
  $el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$ = (0 == $axis$jscomp$inline_2998$$ ? $container$jscomp$inline_2997$$.scrollLeft : $container$jscomp$inline_2997$$.scrollTop) + ($el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$ - $JSCompiler_StaticMethods_scrollCurrentIntoView_$self_scrollOffset$jscomp$inline_3002_startAligned$jscomp$inline_3000$$);
  0 == $axis$jscomp$inline_2998$$ ? $container$jscomp$inline_2997$$.scrollLeft = $el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$ : $container$jscomp$inline_2997$$.scrollTop = $el$jscomp$inline_2996_position$jscomp$inline_6769_snapOffset$jscomp$inline_3001$$;
}, $JSCompiler_StaticMethods_inLastWindow_$$ = function($JSCompiler_StaticMethods_inLastWindow_$self$$, $index$jscomp$118$$) {
  var $visibleCount_$$ = $JSCompiler_StaticMethods_inLastWindow_$self$$.$W$;
  return $index$jscomp$118$$ >= $JSCompiler_StaticMethods_inLastWindow_$self$$.$slides_$.length - ("start" == $JSCompiler_StaticMethods_inLastWindow_$self$$.$G$ ? $visibleCount_$$ : $visibleCount_$$ / 2);
}, $AmpCarousel$$module$extensions$amp_carousel$0_2$amp_carousel$$ = function($element$jscomp$378$$) {
  var $$jscomp$super$this$jscomp$33$$ = window.AMP.BaseElement.call(this, $element$jscomp$378$$) || this;
  $$jscomp$super$this$jscomp$33$$.$advanceCount_$ = 1;
  $$jscomp$super$this$jscomp$33$$.$carousel_$ = null;
  $$jscomp$super$this$jscomp$33$$.$slides_$ = [];
  $$jscomp$super$this$jscomp$33$$.$responsiveAttributes_$ = new $ResponsiveAttributes$$module$extensions$amp_carousel$0_2$responsive_attributes$$({"advance-count":function($element$jscomp$378$$) {
    $$jscomp$super$this$jscomp$33$$.$carousel_$.$advanceCount_$ = Number($element$jscomp$378$$) || 0;
  }, "auto-advance":function($element$jscomp$378$$) {
    $$jscomp$super$this$jscomp$33$$.$carousel_$.$updateAutoAdvance$("true" == $element$jscomp$378$$);
  }, "auto-advance-count":function($element$jscomp$378$$) {
    $$jscomp$super$this$jscomp$33$$.$carousel_$.$updateAutoAdvanceCount$(Number($element$jscomp$378$$) || 0);
  }, "auto-advance-interval":function($element$jscomp$378$$) {
    $$jscomp$super$this$jscomp$33$$.$carousel_$.$updateAutoAdvanceInterval$(Number($element$jscomp$378$$) || 0);
  }, horizontal:function($element$jscomp$378$$) {
    var $newValue$jscomp$17$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $newValue$jscomp$17$$.$I$ = "true" == $element$jscomp$378$$ ? 0 : 1;
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$17$$);
  }, "initial-index":function() {
    $JSCompiler_StaticMethods_updateUi$$($$jscomp$super$this$jscomp$33$$.$carousel_$);
  }, loop:function($element$jscomp$378$$) {
    var $newValue$jscomp$19$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $newValue$jscomp$19$$.$loop_$ = "true" == $element$jscomp$378$$;
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$19$$);
  }, "mixed-length":function($element$jscomp$378$$) {
    var $newValue$jscomp$20$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $newValue$jscomp$20$$.$ba$ = "true" == $element$jscomp$378$$;
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$20$$);
  }, "side-slide-count":function($element$jscomp$378$$) {
    var $newValue$jscomp$21_sideSlideCount$jscomp$inline_3019$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $element$jscomp$378$$ = Number($element$jscomp$378$$) || 0;
    $newValue$jscomp$21_sideSlideCount$jscomp$inline_3019$$.$ga$ = 0 < $element$jscomp$378$$ ? $element$jscomp$378$$ : Number.MAX_VALUE;
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$21_sideSlideCount$jscomp$inline_3019$$);
  }, snap:function($element$jscomp$378$$) {
    var $newValue$jscomp$22$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $newValue$jscomp$22$$.$Y$ = "true" == $element$jscomp$378$$;
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$22$$);
  }, "snap-align":function($element$jscomp$378$$) {
    var $newValue$jscomp$23$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $newValue$jscomp$23$$.$G$ = "start" == $element$jscomp$378$$ ? "start" : "center";
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$23$$);
  }, "snap-by":function($element$jscomp$378$$) {
    var $newValue$jscomp$24$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $newValue$jscomp$24$$.$ha$ = Math.max(1, Number($element$jscomp$378$$) || 0);
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$24$$);
  }, "visible-count":function($element$jscomp$378$$) {
    var $newValue$jscomp$25$$ = $$jscomp$super$this$jscomp$33$$.$carousel_$;
    $newValue$jscomp$25$$.$W$ = Math.max(1, Number($element$jscomp$378$$) || 0);
    $JSCompiler_StaticMethods_updateUi$$($newValue$jscomp$25$$);
  }});
  return $$jscomp$super$this$jscomp$33$$;
}, $JSCompiler_StaticMethods_setupActions_$$ = function($JSCompiler_StaticMethods_setupActions_$self$$) {
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_setupActions_$self$$, "prev", function() {
    var $JSCompiler_StaticMethods_prev$self$jscomp$inline_3041$$ = $JSCompiler_StaticMethods_setupActions_$self$$.$carousel_$;
    $JSCompiler_StaticMethods_prev$self$jscomp$inline_3041$$.advance(-$JSCompiler_StaticMethods_prev$self$jscomp$inline_3041$$.$advanceCount_$);
  }, 1);
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_setupActions_$self$$, "next", function() {
    return $JSCompiler_StaticMethods_setupActions_$self$$.$carousel_$.next();
  }, 1);
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_setupActions_$self$$, "goToSlide", function($$jscomp$destructuring$var373$$) {
    $JSCompiler_StaticMethods_goToSlide$$($JSCompiler_StaticMethods_setupActions_$self$$.$carousel_$, $$jscomp$destructuring$var373$$.args.index || -1);
  }, 1);
};
$AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance$$.prototype.$updateAutoAdvance$ = function($autoAdvance$$) {
  this.$D$ = $autoAdvance$$;
  $JSCompiler_StaticMethods_resetAutoAdvance_$$(this);
};
$AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance$$.prototype.$updateAutoAdvanceCount$ = function($autoAdvanceCount$$) {
  this.$J$ = $autoAdvanceCount$$;
  $JSCompiler_StaticMethods_resetAutoAdvance_$$(this);
};
$AutoAdvance$$module$extensions$amp_carousel$0_2$auto_advance$$.prototype.$updateAutoAdvanceInterval$ = function($autoAdvanceInterval$$) {
  this.$G$ = Math.max($autoAdvanceInterval$$, 2000);
  $JSCompiler_StaticMethods_createDebouncedAdvance_$$(this, this.$G$);
  $JSCompiler_StaticMethods_resetAutoAdvance_$$(this);
};
_.$JSCompiler_prototypeAlias$$ = $Carousel$$module$extensions$amp_carousel$0_2$carousel$$.prototype;
_.$JSCompiler_prototypeAlias$$.next = function() {
  this.advance(this.$advanceCount_$);
};
_.$JSCompiler_prototypeAlias$$.advance = function($delta$jscomp$3$$) {
  var $currentIndex_$$ = this.$F$, $newIndex$jscomp$7$$ = $currentIndex_$$ + $delta$jscomp$3$$, $endIndex$$ = this.$slides_$.length - 1, $atStart$$ = 0 == $currentIndex_$$, $atEnd$$ = $currentIndex_$$ == $endIndex$$, $passingStart$$ = 0 > $newIndex$jscomp$7$$, $passingEnd$$ = $newIndex$jscomp$7$$ > $endIndex$$;
  this.$loop_$ ? $JSCompiler_StaticMethods_goToSlide$$(this, _.$mod$$module$src$utils$math$$($newIndex$jscomp$7$$, $endIndex$$ + 1)) : 0 < $delta$jscomp$3$$ && $JSCompiler_StaticMethods_inLastWindow_$$(this, $currentIndex_$$) && $JSCompiler_StaticMethods_inLastWindow_$$(this, $newIndex$jscomp$7$$) ? $JSCompiler_StaticMethods_goToSlide$$(this, 0) : $passingStart$$ && $atStart$$ || $passingEnd$$ && !$atEnd$$ ? $JSCompiler_StaticMethods_goToSlide$$(this, $endIndex$$) : $passingStart$$ && !$atStart$$ || 
  $passingEnd$$ && $atEnd$$ ? $JSCompiler_StaticMethods_goToSlide$$(this, 0) : $JSCompiler_StaticMethods_goToSlide$$(this, $newIndex$jscomp$7$$);
};
_.$JSCompiler_prototypeAlias$$.$updateAutoAdvance$ = function($autoAdvance$jscomp$1$$) {
  this.$P$.$updateAutoAdvance$($autoAdvance$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$updateAutoAdvanceCount$ = function($autoAdvanceCount$jscomp$1$$) {
  this.$P$.$updateAutoAdvanceCount$($autoAdvanceCount$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$updateAutoAdvanceInterval$ = function($autoAdvanceInterval$jscomp$1$$) {
  this.$P$.$updateAutoAdvanceInterval$($autoAdvanceInterval$jscomp$1$$);
};
var $_template$$module$extensions$amp_carousel$0_2$amp_carousel$$ = ["<div class=i-amphtml-carousel-scroll></div>"];
_.$$jscomp$inherits$$($AmpCarousel$$module$extensions$amp_carousel$0_2$amp_carousel$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpCarousel$$module$extensions$amp_carousel$0_2$amp_carousel$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$46$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$46$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$531$$ = this, $element$jscomp$379$$ = this.element, $win$jscomp$340$$ = this.$win$;
  this.$slides_$ = _.$toArray$$module$src$types$$($element$jscomp$379$$.children).filter(function($$jscomp$this$jscomp$531$$) {
    return "I-AMPHTML-SIZER" != $$jscomp$this$jscomp$531$$.tagName;
  });
  $element$jscomp$379$$.appendChild(_.$htmlFor$$module$src$static_template$$(this.element)($_template$$module$extensions$amp_carousel$0_2$amp_carousel$$));
  var $scrollContainer$jscomp$2$$ = this.element.querySelector(".i-amphtml-carousel-scroll");
  this.$carousel_$ = new $Carousel$$module$extensions$amp_carousel$0_2$carousel$$({$win$:$win$jscomp$340$$, element:$element$jscomp$379$$, $scrollContainer$:$scrollContainer$jscomp$2$$, $runMutate$:function($element$jscomp$379$$) {
    return $$jscomp$this$jscomp$531$$.$mutateElement$($element$jscomp$379$$);
  }});
  _.$toArray$$module$src$types$$(this.element.attributes).forEach(function($element$jscomp$379$$) {
    $JSCompiler_StaticMethods_updateAttribute$$($$jscomp$this$jscomp$531$$.$responsiveAttributes_$, $element$jscomp$379$$.name, $element$jscomp$379$$.value);
  });
  $JSCompiler_StaticMethods_setupActions_$$(this);
  this.$slides_$.forEach(function($$jscomp$this$jscomp$531$$) {
    $$jscomp$this$jscomp$531$$.classList.add("i-amphtml-carousel-slotted");
    $scrollContainer$jscomp$2$$.appendChild($$jscomp$this$jscomp$531$$);
  });
  $JSCompiler_StaticMethods_updateSlides$$(this.$carousel_$, this.$slides_$);
  return this.$mutateElement$(function() {
  });
};
_.$JSCompiler_prototypeAlias$$.$isRelayoutNeeded$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  $JSCompiler_StaticMethods_updateUi$$(this.$carousel_$);
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$7$$) {
  for (var $key$jscomp$116$$ in $mutations$jscomp$7$$) {
    $JSCompiler_StaticMethods_updateAttribute$$(this.$responsiveAttributes_$, $key$jscomp$116$$, $mutations$jscomp$7$$[$key$jscomp$116$$]);
  }
};
var $AMP$jscomp$inline_3043$$ = window.self.AMP;
_.$isExperimentOn$$module$src$experiments$$($AMP$jscomp$inline_3043$$.$win$, "amp-carousel-v2") && $AMP$jscomp$inline_3043$$.registerElement("amp-carousel", $AmpCarousel$$module$extensions$amp_carousel$0_2$amp_carousel$$, "amp-carousel{display:block;overflow:hidden}.i-amphtml-carousel-scroll{position:absolute;top:0;left:0;display:-webkit-box;display:-ms-flexbox;display:flex;width:100%;height:100%;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-transform:translateZ(0);transform:translateZ(0);scroll-behavior:smooth;box-sizing:content-box!important;-webkit-overflow-scrolling:touch!important;--visible-count:1}.i-amphtml-carousel-scroll[horizontal=true]{-webkit-box-orient:horizontal;-webkit-box-direction:normal;-ms-flex-direction:row;flex-direction:row;scroll-snap-type-x:mandatory;-webkit-scroll-snap-type:x mandatory;scroll-snap-type:x mandatory;padding-bottom:20px!important;overflow-y:hidden}.i-amphtml-carousel-scroll[horizontal=false]{-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;scroll-snap-type-y:mandatory;-webkit-scroll-snap-type:y mandatory;scroll-snap-type:y mandatory;padding-right:20px!important;overflow-x:hidden}.i-amphtml-carousel-scroll[snap=false]{-webkit-scroll-snap-type:none;scroll-snap-type:none}.i-amphtml-carousel-scroll[user-scrollable=false]{overflow:hidden}.i-amphtml-carousel-spacer{z-index:-1}.i-amphtml-carousel-scroll>.i-amphtml-carousel-slotted,.i-amphtml-carousel-scroll>.i-amphtml-carousel-spacer{box-sizing:border-box!important;margin:0!important;-ms-flex-negative:0!important;flex-shrink:0!important}.i-amphtml-carousel-scroll[horizontal=true][mixed-length=false]>.i-amphtml-carousel-slotted,.i-amphtml-carousel-scroll[horizontal=true][mixed-length=false]>.i-amphtml-carousel-spacer{width:calc(100%/var(--visible-count))!important;min-width:auto!important;max-width:none!important}.i-amphtml-carousel-scroll[horizontal=false][mixed-length=false]>.i-amphtml-carousel-slotted,.i-amphtml-carousel-scroll[horizontal=false][mixed-length=false]>.i-amphtml-carousel-spacer{height:calc(100%/var(--visible-count))!important;min-height:auto!important;max-height:none!important}.i-amphtml-carousel-scroll[horizontal=true][snap=true][mixed-length=true]>.i-amphtml-carousel-slotted,.i-amphtml-carousel-scroll[horizontal=true][snap=true][mixed-length=true]>.i-amphtml-carousel-spacer{max-width:100%!important}.i-amphtml-carousel-scroll[horizontal=false][snap=true][mixed-length=true]>.i-amphtml-carousel-slotted,.i-amphtml-carousel-scroll[horizontal=false][snap=true][mixed-length=true]>.i-amphtml-carousel-spacer{max-height:100%!important}.i-amphtml-carousel-scroll>.i-amphtml-carousel-slotted{will-change:transform}.i-amphtml-carousel-scroll[horizontal=true]>.i-amphtml-carousel-spacer{height:100%}.i-amphtml-carousel-scroll[horizontal=false]>.i-amphtml-carousel-spacer{width:100%}\n/*# sourceURL=/extensions/amp-carousel/0.2/amp-carousel.css*/");

})});
