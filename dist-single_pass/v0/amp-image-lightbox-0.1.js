(self.AMP=self.AMP||[]).push({n:"amp-image-lightbox",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $concat$$module$src$transition$$ = function($transitions$jscomp$1$$) {
  var $opt_delimiter$$ = void 0 === $opt_delimiter$$ ? " " : $opt_delimiter$$;
  return function($time$jscomp$5$$, $complete$jscomp$1$$) {
    for (var $results$jscomp$3$$ = [], $i$jscomp$106$$ = 0; $i$jscomp$106$$ < $transitions$jscomp$1$$.length; $i$jscomp$106$$++) {
      var $result$jscomp$12$$ = (0,$transitions$jscomp$1$$[$i$jscomp$106$$])($time$jscomp$5$$, $complete$jscomp$1$$);
      "string" == typeof $result$jscomp$12$$ && $results$jscomp$3$$.push($result$jscomp$12$$);
    }
    return $results$jscomp$3$$.join($opt_delimiter$$);
  };
}, $translate$$module$src$transition$$ = function($transitionX$$, $opt_transitionY$$) {
  return function($time$jscomp$14_y$jscomp$60$$) {
    var $x$jscomp$78$$ = $transitionX$$($time$jscomp$14_y$jscomp$60$$);
    "number" == typeof $x$jscomp$78$$ && ($x$jscomp$78$$ = _.$px$$module$src$style$$($x$jscomp$78$$));
    if (!$opt_transitionY$$) {
      return "translate(" + $x$jscomp$78$$ + ")";
    }
    $time$jscomp$14_y$jscomp$60$$ = $opt_transitionY$$($time$jscomp$14_y$jscomp$60$$);
    "number" == typeof $time$jscomp$14_y$jscomp$60$$ && ($time$jscomp$14_y$jscomp$60$$ = _.$px$$module$src$style$$($time$jscomp$14_y$jscomp$60$$));
    return "translate(" + $x$jscomp$78$$ + "," + $time$jscomp$14_y$jscomp$60$$ + ")";
  };
}, $scale$$module$src$transition$$ = function($transition$jscomp$8$$) {
  return function($time$jscomp$15$$) {
    return "scale(" + $transition$jscomp$8$$($time$jscomp$15$$) + ")";
  };
}, $ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = function($lightbox$$, $win$jscomp$351$$, $loadPromise$$) {
  this.$F$ = $lightbox$$;
  this.$win$ = $win$jscomp$351$$;
  this.$loadPromise_$ = $loadPromise$$;
  this.$viewer_$ = $lightbox$$.element.ownerDocument.createElement("div");
  this.$viewer_$.classList.add("i-amphtml-image-lightbox-viewer");
  this.$image_$ = $lightbox$$.element.ownerDocument.createElement("img");
  this.$image_$.classList.add("i-amphtml-image-lightbox-viewer-image");
  this.$viewer_$.appendChild(this.$image_$);
  this.$srcset_$ = null;
  this.$sourceHeight_$ = this.$sourceWidth_$ = 0;
  this.$D$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  this.$imageBox_$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  this.$minScale_$ = this.$maxSeenScale_$ = this.$startScale_$ = this.$scale_$ = 1;
  this.$maxScale_$ = 2;
  this.$maxY_$ = this.$maxX_$ = this.$minY_$ = this.$minX_$ = this.$posY_$ = this.$posX_$ = this.$startY_$ = this.$startX_$ = 0;
  this.$motion_$ = null;
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$$(this);
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setSourceDimensions_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setSourceDimensions_$self$$, $ampImg$$, $img$jscomp$7$$) {
  $img$jscomp$7$$ ? ($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setSourceDimensions_$self$$.$sourceWidth_$ = $img$jscomp$7$$.naturalWidth || $ampImg$$.offsetWidth, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setSourceDimensions_$self$$.$sourceHeight_$ = $img$jscomp$7$$.naturalHeight || $ampImg$$.offsetHeight) : ($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setSourceDimensions_$self$$.$sourceWidth_$ = 
  $ampImg$$.offsetWidth, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setSourceDimensions_$self$$.$sourceHeight_$ = $ampImg$$.offsetHeight);
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$) {
  if (!$JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$srcset_$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$maxSeenScale_$ = Math.max($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$maxSeenScale_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$scale_$);
  var $src$jscomp$43$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$srcset_$.select($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$imageBox_$.width * $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$maxSeenScale_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$F$.$getDpr$());
  return $src$jscomp$43$$ == $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$image_$.getAttribute("src") ? window.Promise.resolve() : _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$win$).$promise$(1).then(function() {
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$image_$.setAttribute("src", $src$jscomp$43$$);
    return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$loadPromise_$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$self$$.$image_$);
  });
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$) {
  var $gestures$$ = _.$Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$image_$);
  _.$JSCompiler_StaticMethods_onGesture$$($gestures$$, _.$TapRecognizer$$module$src$gesture_recognizers$$, function() {
    $JSCompiler_StaticMethods_toggleViewMode$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$F$);
  });
  _.$JSCompiler_StaticMethods_onGesture$$($gestures$$, _.$SwipeXYRecognizer$$module$src$gesture_recognizers$$, function($gestures$$) {
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$scale_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, 
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$startX_$ + $gestures$$.data.deltaX, !0), $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$startY_$ + 
    $gestures$$.data.deltaY, !0), !1);
    $gestures$$.data.$last$ && $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, $gestures$$.data.velocityX, $gestures$$.data.velocityY);
  });
  _.$JSCompiler_StaticMethods_onPointerDown$$($gestures$$, function() {
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$motion_$ && $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$motion_$.$halt$();
  });
  _.$JSCompiler_StaticMethods_onGesture$$($gestures$$, _.$DoubletapRecognizer$$module$src$gesture_recognizers$$, function($gestures$$) {
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, 1 == $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$scale_$ ? $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$maxScale_$ : 
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$minScale_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$D$.width / 2 - $gestures$$.data.clientX, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$.$D$.height / 2 - $gestures$$.data.clientY, !0).then(function() {
      return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, 0, 0, 0, 0, 0, 0);
    });
  });
  _.$JSCompiler_StaticMethods_onGesture$$($gestures$$, _.$TapzoomRecognizer$$module$src$gesture_recognizers$$, function($gestures$$) {
    $JSCompiler_StaticMethods_onZoomInc_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, $gestures$$.data.$centerClientX$, $gestures$$.data.$centerClientY$, $gestures$$.data.deltaX, $gestures$$.data.deltaY);
    $gestures$$.data.$last$ && $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setupGestures_$self$$, $gestures$$.data.$centerClientX$, $gestures$$.data.$centerClientY$, $gestures$$.data.deltaX, $gestures$$.data.deltaY, $gestures$$.data.velocityY, $gestures$$.data.velocityY);
  });
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundValue_$$ = function($v$jscomp$17$$, $min$jscomp$9$$, $max$jscomp$10$$, $extent$$) {
  return Math.max($min$jscomp$9$$ - $extent$$, Math.min($max$jscomp$10$$ + $extent$$, $v$jscomp$17$$));
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$self$$, $x$jscomp$92$$, $allowExtent$jscomp$1$$) {
  return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundValue_$$($x$jscomp$92$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$self$$.$minX_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$self$$.$maxX_$, $allowExtent$jscomp$1$$ && 1 < $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$self$$.$scale_$ ? 
  0.25 * $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$self$$.$D$.width : 0);
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$self$$, $y$jscomp$69$$, $allowExtent$jscomp$2$$) {
  return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundValue_$$($y$jscomp$69$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$self$$.$minY_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$self$$.$maxY_$, $allowExtent$jscomp$2$$ ? 0.25 * $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$self$$.$D$.height : 
  0);
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$, $dw$jscomp$1_maxX_scale$jscomp$2$$) {
  var $dh$jscomp$1_maxY$jscomp$1$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$D$.height - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$imageBox_$.height * $dw$jscomp$1_maxX_scale$jscomp$2$$;
  if (0 <= $dh$jscomp$1_maxY$jscomp$1$$) {
    var $minY$$ = $dh$jscomp$1_maxY$jscomp$1$$ = 0;
  } else {
    $minY$$ = $dh$jscomp$1_maxY$jscomp$1$$ / 2, $dh$jscomp$1_maxY$jscomp$1$$ = -$minY$$;
  }
  $dw$jscomp$1_maxX_scale$jscomp$2$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$D$.width - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$imageBox_$.width * $dw$jscomp$1_maxX_scale$jscomp$2$$;
  if (0 <= $dw$jscomp$1_maxX_scale$jscomp$2$$) {
    var $minX$$ = $dw$jscomp$1_maxX_scale$jscomp$2$$ = 0;
  } else {
    $minX$$ = $dw$jscomp$1_maxX_scale$jscomp$2$$ / 2, $dw$jscomp$1_maxX_scale$jscomp$2$$ = -$minX$$;
  }
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$minX_$ = $minX$$;
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$minY_$ = $minY$$;
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$maxX_$ = $dw$jscomp$1_maxX_scale$jscomp$2$$;
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$self$$.$maxY_$ = $dh$jscomp$1_maxY$jscomp$1$$;
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$self$$) {
  _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$self$$.$image_$, {transform:_.$translate$$module$src$style$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$self$$.$posX_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$self$$.$posY_$) + 
  " " + _.$scale$$module$src$style$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$self$$.$scale_$)});
  1 != $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$self$$.$scale_$ && $JSCompiler_StaticMethods_toggleViewMode$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$self$$.$F$, !0);
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$, $veloX$jscomp$2$$, $veloY$jscomp$2$$) {
  var $deltaY$jscomp$3$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$posY_$ - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$startY_$;
  1 == $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$scale_$ && 10 < Math.abs($deltaY$jscomp$3$$) ? $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$F$.close() : ($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$motion_$ = _.$continueMotion$$module$src$motion$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$image_$, 
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$posX_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$posY_$, $veloX$jscomp$2$$, $veloY$jscomp$2$$, function($veloX$jscomp$2$$, $veloY$jscomp$2$$) {
    $veloX$jscomp$2$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$, $veloX$jscomp$2$$, !0);
    $veloY$jscomp$2$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$, $veloY$jscomp$2$$, !0);
    if (1 > Math.abs($veloX$jscomp$2$$ - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$posX_$) && 1 > Math.abs($veloY$jscomp$2$$ - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$posY_$)) {
      return !1;
    }
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$scale_$, $veloX$jscomp$2$$, $veloY$jscomp$2$$, !1);
    return !0;
  }), _.$JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$motion_$, function() {
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$.$motion_$ = null;
    return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onMoveRelease_$self$$);
  }));
}, $JSCompiler_StaticMethods_onZoomInc_$$ = function($JSCompiler_StaticMethods_onZoomInc_$self$$, $centerClientX_deltaCenterX$$, $centerClientY_deltaCenterY$$, $deltaX$jscomp$3$$, $deltaY$jscomp$4$$) {
  var $dist$$ = Math.sqrt($deltaX$jscomp$3$$ * $deltaX$jscomp$3$$ + $deltaY$jscomp$4$$ * $deltaY$jscomp$4$$), $newScale$jscomp$1_zoomSign$$ = Math.abs($deltaY$jscomp$4$$) > Math.abs($deltaX$jscomp$3$$) ? Math.sign($deltaY$jscomp$4$$) : Math.sign(-$deltaX$jscomp$3$$);
  0 != $newScale$jscomp$1_zoomSign$$ && ($newScale$jscomp$1_zoomSign$$ = $JSCompiler_StaticMethods_onZoomInc_$self$$.$startScale_$ * (1 + $newScale$jscomp$1_zoomSign$$ * $dist$$ / 100), $centerClientX_deltaCenterX$$ = $JSCompiler_StaticMethods_onZoomInc_$self$$.$D$.width / 2 - $centerClientX_deltaCenterX$$, $centerClientY_deltaCenterY$$ = $JSCompiler_StaticMethods_onZoomInc_$self$$.$D$.height / 2 - $centerClientY_deltaCenterY$$, $deltaX$jscomp$3$$ = Math.min($centerClientX_deltaCenterX$$, $dist$$ / 
  100 * $centerClientX_deltaCenterX$$), $deltaY$jscomp$4$$ = Math.min($centerClientY_deltaCenterY$$, $dist$$ / 100 * $centerClientY_deltaCenterY$$), $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$$($JSCompiler_StaticMethods_onZoomInc_$self$$, $newScale$jscomp$1_zoomSign$$, $deltaX$jscomp$3$$, $deltaY$jscomp$4$$, !1));
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$, $newScale$jscomp$2_scale$jscomp$3$$, $deltaX$jscomp$4$$, $deltaY$jscomp$5$$, $animate$jscomp$5$$) {
  $newScale$jscomp$2_scale$jscomp$3$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundValue_$$($newScale$jscomp$2_scale$jscomp$3$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$.$minScale_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$.$maxScale_$, 0.25);
  if ($newScale$jscomp$2_scale$jscomp$3$$ != $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$.$scale_$) {
    return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$, $newScale$jscomp$2_scale$jscomp$3$$), $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$, 
    $newScale$jscomp$2_scale$jscomp$3$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$.$startX_$ + $deltaX$jscomp$4$$ * $newScale$jscomp$2_scale$jscomp$3$$, !1), $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$, 
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoom_$self$$.$startY_$ + $deltaY$jscomp$5$$ * $newScale$jscomp$2_scale$jscomp$3$$, !1), $animate$jscomp$5$$);
  }
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$self$$, $centerClientX$jscomp$1$$, $centerClientY$jscomp$1$$, $deltaX$jscomp$5_promise$jscomp$44$$, $deltaY$jscomp$6$$, $veloX$jscomp$3$$, $veloY$jscomp$3$$) {
  $deltaX$jscomp$5_promise$jscomp$44$$ = 0 == $veloX$jscomp$3$$ && 0 == $veloY$jscomp$3$$ ? window.Promise.resolve() : _.$JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$$(_.$continueMotion$$module$src$motion$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$self$$.$image_$, $deltaX$jscomp$5_promise$jscomp$44$$, $deltaY$jscomp$6$$, $veloX$jscomp$3$$, $veloY$jscomp$3$$, function($deltaX$jscomp$5_promise$jscomp$44$$, 
  $deltaY$jscomp$6$$) {
    $JSCompiler_StaticMethods_onZoomInc_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$self$$, $centerClientX$jscomp$1$$, $centerClientY$jscomp$1$$, $deltaX$jscomp$5_promise$jscomp$44$$, $deltaY$jscomp$6$$);
    return !0;
  }));
  var $relayout$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$self$$.$scale_$ > $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$self$$.$startScale_$;
  return $deltaX$jscomp$5_promise$jscomp$44$$.then(function() {
    return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$self$$);
  }).then(function() {
    $relayout$$ && $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$onZoomRelease_$self$$);
  });
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$, $newScale$jscomp$3$$, $newPosX$jscomp$3$$, $newPosY$jscomp$3$$, $animate$jscomp$6$$) {
  var $ds$$ = $newScale$jscomp$3$$ - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$scale_$, $dist$jscomp$1_dx$jscomp$9$$ = $newPosX$jscomp$3$$ - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posX_$, $dur_dy$jscomp$12$$ = $newPosY$jscomp$3$$ - $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posY_$;
  $dist$jscomp$1_dx$jscomp$9$$ = Math.sqrt($dist$jscomp$1_dx$jscomp$9$$ * $dist$jscomp$1_dx$jscomp$9$$ + $dur_dy$jscomp$12$$ * $dur_dy$jscomp$12$$);
  $dur_dy$jscomp$12$$ = 0;
  $animate$jscomp$6$$ && ($dur_dy$jscomp$12$$ = Math.min(250, Math.max(2.5 * $dist$jscomp$1_dx$jscomp$9$$, 250 * Math.abs($ds$$))));
  if (16 < $dur_dy$jscomp$12$$ && $animate$jscomp$6$$) {
    var $scaleFunc$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$scale_$, $newScale$jscomp$3$$), $xFunc$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posX_$, $newPosX$jscomp$3$$), $yFunc$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posY_$, 
    $newPosY$jscomp$3$$);
    var $promise$jscomp$45$$ = _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$image_$, function($newScale$jscomp$3$$) {
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$scale_$ = $scaleFunc$$($newScale$jscomp$3$$);
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posX_$ = $xFunc$$($newScale$jscomp$3$$);
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posY_$ = $yFunc$$($newScale$jscomp$3$$);
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$);
    }, $dur_dy$jscomp$12$$, $PAN_ZOOM_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$), function() {
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$scale_$ = $newScale$jscomp$3$$;
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posX_$ = $newPosX$jscomp$3$$;
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posY_$ = $newPosY$jscomp$3$$;
      $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$);
    });
  } else {
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$scale_$ = $newScale$jscomp$3$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posX_$ = $newPosX$jscomp$3$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$.$posY_$ = $newPosY$jscomp$3$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$self$$), 
    $animate$jscomp$6$$ ? $promise$jscomp$45$$ = window.Promise.resolve() : $promise$jscomp$45$$ = void 0;
  }
  return $promise$jscomp$45$$;
}, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$$ = function($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$) {
  var $newScale$jscomp$4$$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundValue_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$scale_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$minScale_$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$maxScale_$, 
  0);
  $newScale$jscomp$4$$ != $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$scale_$ && $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$, $newScale$jscomp$4$$);
  return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$set_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$, $newScale$jscomp$4$$, $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundX_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$, 
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$posX_$ / $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$scale_$ * $newScale$jscomp$4$$, !1), $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$boundY_$$($JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$, 
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$posY_$ / $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$scale_$ * $newScale$jscomp$4$$, !1), !0).then(function() {
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$startScale_$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$scale_$;
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$startX_$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$posX_$;
    $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$startY_$ = $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$release_$self$$.$posY_$;
  });
}, $AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = function($element$jscomp$443$$) {
  var $$jscomp$super$this$jscomp$60$$ = window.AMP.BaseElement.call(this, $element$jscomp$443$$) || this;
  $$jscomp$super$this$jscomp$60$$.$historyId_$ = -1;
  $$jscomp$super$this$jscomp$60$$.$active_$ = !1;
  $$jscomp$super$this$jscomp$60$$.$entering_$ = !1;
  $$jscomp$super$this$jscomp$60$$.$sourceElement_$ = null;
  $$jscomp$super$this$jscomp$60$$.$sourceImage_$ = null;
  $$jscomp$super$this$jscomp$60$$.$unlistenViewport_$ = null;
  $$jscomp$super$this$jscomp$60$$.$container_$ = null;
  $$jscomp$super$this$jscomp$60$$.$imageViewer_$ = null;
  $$jscomp$super$this$jscomp$60$$.$captionElement_$ = null;
  $$jscomp$super$this$jscomp$60$$.$boundCloseOnEscape_$ = $$jscomp$super$this$jscomp$60$$.$closeOnEscape_$.bind($$jscomp$super$this$jscomp$60$$);
  _.$JSCompiler_StaticMethods_registerDefaultAction$$($$jscomp$super$this$jscomp$60$$, function($element$jscomp$443$$) {
    return $$jscomp$super$this$jscomp$60$$.$open_$($element$jscomp$443$$);
  }, "open");
  return $$jscomp$super$this$jscomp$60$$;
}, $JSCompiler_StaticMethods_buildLightbox_$$ = function($JSCompiler_StaticMethods_buildLightbox_$self$$) {
  if (!$JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$) {
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.ownerDocument.createElement("div");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$.classList.add("i-amphtml-image-lightbox-container");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.element.appendChild($JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$);
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$imageViewer_$ = new $ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$($JSCompiler_StaticMethods_buildLightbox_$self$$, $JSCompiler_StaticMethods_buildLightbox_$self$$.$win$, $JSCompiler_StaticMethods_buildLightbox_$self$$.$loadPromise$.bind($JSCompiler_StaticMethods_buildLightbox_$self$$));
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$.appendChild($JSCompiler_StaticMethods_buildLightbox_$self$$.$imageViewer_$.$getElement$());
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.ownerDocument.createElement("div");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$.setAttribute("id", $JSCompiler_StaticMethods_buildLightbox_$self$$.element.getAttribute("id") + "-caption");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$.classList.add("amp-image-lightbox-caption");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$.classList.add("i-amphtml-image-lightbox-caption");
    $JSCompiler_StaticMethods_buildLightbox_$self$$.$container_$.appendChild($JSCompiler_StaticMethods_buildLightbox_$self$$.$captionElement_$);
    var $gestures$jscomp$1_screenReaderCloseButton$$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.ownerDocument.createElement("button"), $ariaLabel$$ = $JSCompiler_StaticMethods_buildLightbox_$self$$.element.getAttribute("data-close-button-aria-label") || "Close the lightbox";
    $gestures$jscomp$1_screenReaderCloseButton$$.textContent = $ariaLabel$$;
    $gestures$jscomp$1_screenReaderCloseButton$$.classList.add("i-amphtml-screen-reader");
    $gestures$jscomp$1_screenReaderCloseButton$$.tabIndex = -1;
    $gestures$jscomp$1_screenReaderCloseButton$$.addEventListener("click", function() {
      $JSCompiler_StaticMethods_buildLightbox_$self$$.close();
    });
    $JSCompiler_StaticMethods_buildLightbox_$self$$.element.appendChild($gestures$jscomp$1_screenReaderCloseButton$$);
    $gestures$jscomp$1_screenReaderCloseButton$$ = _.$Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_buildLightbox_$self$$.element);
    $JSCompiler_StaticMethods_buildLightbox_$self$$.element.addEventListener("click", function($gestures$jscomp$1_screenReaderCloseButton$$) {
      $JSCompiler_StaticMethods_buildLightbox_$self$$.$entering_$ || $JSCompiler_StaticMethods_buildLightbox_$self$$.$imageViewer_$.$getImage$().contains($gestures$jscomp$1_screenReaderCloseButton$$.target) || $JSCompiler_StaticMethods_buildLightbox_$self$$.close();
    });
    _.$JSCompiler_StaticMethods_onGesture$$($gestures$jscomp$1_screenReaderCloseButton$$, _.$TapRecognizer$$module$src$gesture_recognizers$$, function() {
      $JSCompiler_StaticMethods_buildLightbox_$self$$.$entering_$ || $JSCompiler_StaticMethods_buildLightbox_$self$$.close();
    });
    _.$JSCompiler_StaticMethods_onGesture$$($gestures$jscomp$1_screenReaderCloseButton$$, _.$SwipeXYRecognizer$$module$src$gesture_recognizers$$, function() {
    });
  }
}, $JSCompiler_StaticMethods_toggleViewMode$$ = function($JSCompiler_StaticMethods_toggleViewMode$self$$, $opt_on$jscomp$1$$) {
  void 0 !== $opt_on$jscomp$1$$ ? $JSCompiler_StaticMethods_toggleViewMode$self$$.$container_$.classList.toggle("i-amphtml-image-lightbox-view-mode", $opt_on$jscomp$1$$) : $JSCompiler_StaticMethods_toggleViewMode$self$$.$container_$.classList.toggle("i-amphtml-image-lightbox-view-mode");
}, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$$ = function($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$, $describedBy_sourceElement$jscomp$1$$) {
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$sourceElement_$ = $describedBy_sourceElement$jscomp$1$$;
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$sourceImage_$ = _.$childElementByTag$$module$src$dom$$($describedBy_sourceElement$jscomp$1$$, "img");
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$imageViewer_$.init($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$sourceElement_$, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$sourceImage_$);
  var $caption$$ = null, $figure$$ = _.$closestByTag$$module$src$dom$$($describedBy_sourceElement$jscomp$1$$, "figure");
  $figure$$ && ($caption$$ = _.$elementByTag$$module$src$dom$$($figure$$, "figcaption"));
  $caption$$ || ($describedBy_sourceElement$jscomp$1$$ = $describedBy_sourceElement$jscomp$1$$.getAttribute("aria-describedby"), $caption$$ = $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.element.ownerDocument.getElementById($describedBy_sourceElement$jscomp$1$$));
  $caption$$ && (_.$copyChildren$$module$src$dom$$($caption$$, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$captionElement_$), $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$imageViewer_$.$getImage$().setAttribute("aria-describedby", $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$captionElement_$.getAttribute("id")));
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$self$$.$captionElement_$.classList.toggle("i-amphtml-empty", !$caption$$);
}, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$$ = function($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$self$$) {
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$self$$.$imageViewer_$.reset();
  _.$removeChildren$$module$src$dom$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$self$$.$captionElement_$);
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$self$$.$sourceElement_$ = null;
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$self$$.$sourceImage_$ = null;
  $JSCompiler_StaticMethods_toggleViewMode$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$self$$, !1);
}, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$$ = function($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$) {
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$entering_$ = !0;
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.element, !0);
  _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.element, {opacity:0});
  $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$imageViewer_$.measure();
  var $anim$$ = new _.$Animation$$module$src$animation$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.element);
  $anim$$.add(0, _.$setStyles$$module$src$transition$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.element, {opacity:_.$numeric$$module$src$transition$$(0, 1)}), 0.6, $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
  var $transLayer$$ = null;
  if ($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$sourceImage_$ && _.$isLoaded$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$sourceImage_$) && $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$sourceImage_$.src) {
    $transLayer$$ = $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.element.ownerDocument.createElement("div");
    $transLayer$$.classList.add("i-amphtml-image-lightbox-trans");
    $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$getAmpDoc$().$getBody$().appendChild($transLayer$$);
    var $rect$jscomp$17$$ = _.$layoutRectFromDomRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$sourceImage_$.getBoundingClientRect()), $imageBox$$ = $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$imageViewer_$.$imageBox_$, $clone$jscomp$1$$ = $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$sourceImage_$.cloneNode(!0);
    $clone$jscomp$1$$.className = "";
    _.$setStyles$$module$src$style$$($clone$jscomp$1$$, {position:"absolute", top:_.$px$$module$src$style$$($rect$jscomp$17$$.top), left:_.$px$$module$src$style$$($rect$jscomp$17$$.left), width:_.$px$$module$src$style$$($rect$jscomp$17$$.width), height:_.$px$$module$src$style$$($rect$jscomp$17$$.height), transformOrigin:"top left", willChange:"transform"});
    $transLayer$$.appendChild($clone$jscomp$1$$);
    $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$sourceImage_$.classList.add("i-amphtml-ghost");
    var $dy$jscomp$13$$ = $imageBox$$.top - $rect$jscomp$17$$.top;
    $anim$$.add(0, _.$setStyles$$module$src$transition$$($clone$jscomp$1$$, {transform:$concat$$module$src$transition$$([$translate$$module$src$transition$$(_.$numeric$$module$src$transition$$(0, $imageBox$$.left - $rect$jscomp$17$$.left), _.$numeric$$module$src$transition$$(0, $dy$jscomp$13$$)), $scale$$module$src$transition$$(_.$numeric$$module$src$transition$$(1, 0 != $rect$jscomp$17$$.width ? $imageBox$$.width / $rect$jscomp$17$$.width : 1))])}), Math.max(0.2, Math.min(0.8, Math.abs($dy$jscomp$13$$) / 
    250 * 0.8)), $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$container_$, {opacity:0});
    $anim$$.add(0.8, _.$setStyles$$module$src$transition$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$container_$, {opacity:_.$numeric$$module$src$transition$$(0, 1)}), 0.1, $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $anim$$.add(0.9, _.$setStyles$$module$src$transition$$($transLayer$$, {opacity:_.$numeric$$module$src$transition$$(1, 0.01)}), 0.1, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
  }
  _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$($anim$$.start(500), function() {
    $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$entering_$ = !1;
    _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.element, {opacity:""});
    _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$container_$, {opacity:""});
    $transLayer$$ && $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$self$$.$getAmpDoc$().$getBody$().removeChild($transLayer$$);
  });
}, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$$ = function($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$) {
  var $dy$jscomp$14_image$jscomp$8$$ = $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$imageViewer_$.$getImage$(), $imageBox$jscomp$1_motionTime$jscomp$1$$ = $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$imageViewer_$.$getImageBoxWithOffset$(), $anim$jscomp$1$$ = new _.$Animation$$module$src$animation$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.element), 
  $dur$jscomp$2$$ = 500;
  $anim$jscomp$1$$.add(0, _.$setStyles$$module$src$transition$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.element, {opacity:_.$numeric$$module$src$transition$$(1, 0)}), 0.9, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
  var $transLayer$jscomp$1$$ = null;
  if (_.$isLoaded$$module$src$event_helper$$($dy$jscomp$14_image$jscomp$8$$) && $dy$jscomp$14_image$jscomp$8$$.src && $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$sourceImage_$) {
    $transLayer$jscomp$1$$ = $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.element.ownerDocument.createElement("div");
    $transLayer$jscomp$1$$.classList.add("i-amphtml-image-lightbox-trans");
    $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$getAmpDoc$().$getBody$().appendChild($transLayer$jscomp$1$$);
    var $rect$jscomp$18$$ = _.$layoutRectFromDomRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$sourceImage_$.getBoundingClientRect()), $clone$jscomp$2$$ = $dy$jscomp$14_image$jscomp$8$$.cloneNode(!0);
    _.$setStyles$$module$src$style$$($clone$jscomp$2$$, {position:"absolute", top:_.$px$$module$src$style$$($imageBox$jscomp$1_motionTime$jscomp$1$$.top), left:_.$px$$module$src$style$$($imageBox$jscomp$1_motionTime$jscomp$1$$.left), width:_.$px$$module$src$style$$($imageBox$jscomp$1_motionTime$jscomp$1$$.width), height:_.$px$$module$src$style$$($imageBox$jscomp$1_motionTime$jscomp$1$$.height), transform:"", transformOrigin:"top left", willChange:"transform"});
    $transLayer$jscomp$1$$.appendChild($clone$jscomp$2$$);
    $anim$jscomp$1$$.add(0, _.$setStyles$$module$src$transition$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$container_$, {opacity:_.$numeric$$module$src$transition$$(1, 0)}), 0.1, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $dy$jscomp$14_image$jscomp$8$$ = $rect$jscomp$18$$.top - $imageBox$jscomp$1_motionTime$jscomp$1$$.top;
    var $moveAndScale$$ = _.$setStyles$$module$src$transition$$($clone$jscomp$2$$, {transform:$concat$$module$src$transition$$([$translate$$module$src$transition$$(_.$numeric$$module$src$transition$$(0, $rect$jscomp$18$$.left - $imageBox$jscomp$1_motionTime$jscomp$1$$.left), _.$numeric$$module$src$transition$$(0, $dy$jscomp$14_image$jscomp$8$$)), $scale$$module$src$transition$$(_.$numeric$$module$src$transition$$(1, 0 != $imageBox$jscomp$1_motionTime$jscomp$1$$.width ? $rect$jscomp$18$$.width / $imageBox$jscomp$1_motionTime$jscomp$1$$.width : 
    1))])});
    $imageBox$jscomp$1_motionTime$jscomp$1$$ = Math.max(0.2, Math.min(0.8, Math.abs($dy$jscomp$14_image$jscomp$8$$) / 250 * 0.8));
    $anim$jscomp$1$$.add(Math.min(0.8 - $imageBox$jscomp$1_motionTime$jscomp$1$$, 0.2), function($dy$jscomp$14_image$jscomp$8$$, $imageBox$jscomp$1_motionTime$jscomp$1$$) {
      $moveAndScale$$($dy$jscomp$14_image$jscomp$8$$);
      $imageBox$jscomp$1_motionTime$jscomp$1$$ && $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$sourceImage_$.classList.remove("i-amphtml-ghost");
    }, $imageBox$jscomp$1_motionTime$jscomp$1$$, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $anim$jscomp$1$$.add(0.8, _.$setStyles$$module$src$transition$$($transLayer$jscomp$1$$, {opacity:_.$numeric$$module$src$transition$$(1, 0.01)}), 0.2, $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$);
    $dur$jscomp$2$$ = Math.max(Math.min(Math.abs($dy$jscomp$14_image$jscomp$8$$) / 250 * $dur$jscomp$2$$, $dur$jscomp$2$$), 300);
  }
  _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$($anim$jscomp$1$$.start($dur$jscomp$2$$), function() {
    $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$sourceImage_$ && $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$sourceImage_$.classList.remove("i-amphtml-ghost");
    $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.collapse();
    _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.element, {opacity:""});
    _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$container_$, {opacity:""});
    $transLayer$jscomp$1$$ && $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$.$getAmpDoc$().$getBody$().removeChild($transLayer$jscomp$1$$);
    $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$$($JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$self$$);
  });
};
var $ARIA_ATTRIBUTES$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = ["aria-label", "aria-describedby", "aria-labelledby"], $ENTER_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = _.$bezierCurve$$module$src$curve$$(0.4, 0, 0.2, 1), $EXIT_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = _.$bezierCurve$$module$src$curve$$(0.4, 0, 0.2, 1), $PAN_ZOOM_CURVE_$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$ = _.$bezierCurve$$module$src$curve$$(0.4, 
0, 0.2, 1.4);
_.$JSCompiler_prototypeAlias$$ = $ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getElement$ = function() {
  return this.$viewer_$;
};
_.$JSCompiler_prototypeAlias$$.$getImage$ = function() {
  return this.$image_$;
};
_.$JSCompiler_prototypeAlias$$.$getImageBoxWithOffset$ = function() {
  return 0 == this.$posX_$ && 0 == this.$posY_$ ? this.$imageBox_$ : _.$moveLayoutRect$$module$src$layout_rect$$(this.$imageBox_$, this.$posX_$, this.$posY_$);
};
_.$JSCompiler_prototypeAlias$$.reset = function() {
  var $$jscomp$this$jscomp$649$$ = this;
  this.$image_$.setAttribute("src", "");
  $ARIA_ATTRIBUTES$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.forEach(function($key$jscomp$127$$) {
    $$jscomp$this$jscomp$649$$.$image_$.removeAttribute($key$jscomp$127$$);
  });
  this.$image_$.removeAttribute("aria-describedby");
  this.$srcset_$ = null;
  this.$imageBox_$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, 0, 0);
  this.$sourceHeight_$ = this.$sourceWidth_$ = 0;
  this.$startScale_$ = this.$scale_$ = this.$maxSeenScale_$ = 1;
  this.$maxScale_$ = 2;
  this.$maxY_$ = this.$maxX_$ = this.$minY_$ = this.$minX_$ = this.$posY_$ = this.$posX_$ = this.$startY_$ = this.$startX_$ = 0;
  this.$motion_$ && this.$motion_$.$halt$();
  this.$motion_$ = null;
};
_.$JSCompiler_prototypeAlias$$.init = function($sourceElement$$, $sourceImage$$) {
  var $$jscomp$this$jscomp$650$$ = this;
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$setSourceDimensions_$$(this, $sourceElement$$, $sourceImage$$);
  this.$srcset_$ = _.$srcsetFromElement$$module$src$srcset$$($sourceElement$$);
  $sourceElement$$.$getImpl$().then(function($sourceElement$$) {
    _.$JSCompiler_StaticMethods_propagateAttributes$$($sourceElement$$, $ARIA_ATTRIBUTES$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$, $$jscomp$this$jscomp$650$$.$image_$);
  });
  $sourceImage$$ && _.$isLoaded$$module$src$event_helper$$($sourceImage$$) && $sourceImage$$.src && this.$image_$.setAttribute("src", $sourceImage$$.src);
};
_.$JSCompiler_prototypeAlias$$.measure = function() {
  this.$D$ = _.$layoutRectFromDomRect$$module$src$layout_rect$$(this.$viewer_$.getBoundingClientRect());
  var $sourceAspectRatio$$ = this.$sourceWidth_$ / this.$sourceHeight_$, $height$jscomp$44_viewerBoxRatio$$ = Math.min(this.$D$.width / $sourceAspectRatio$$, this.$D$.height), $width$jscomp$49$$ = Math.min(this.$D$.height * $sourceAspectRatio$$, this.$D$.width);
  16 >= Math.abs($width$jscomp$49$$ - this.$sourceWidth_$) && 16 >= Math.abs($height$jscomp$44_viewerBoxRatio$$ - this.$sourceHeight_$) && ($width$jscomp$49$$ = this.$sourceWidth_$, $height$jscomp$44_viewerBoxRatio$$ = this.$sourceHeight_$);
  this.$imageBox_$ = _.$layoutRectLtwh$$module$src$layout_rect$$(Math.round((this.$D$.width - $width$jscomp$49$$) / 2), Math.round((this.$D$.height - $height$jscomp$44_viewerBoxRatio$$) / 2), Math.round($width$jscomp$49$$), Math.round($height$jscomp$44_viewerBoxRatio$$));
  _.$setStyles$$module$src$style$$(this.$image_$, {top:_.$px$$module$src$style$$(this.$imageBox_$.top), left:_.$px$$module$src$style$$(this.$imageBox_$.left), width:_.$px$$module$src$style$$(this.$imageBox_$.width), height:_.$px$$module$src$style$$(this.$imageBox_$.height)});
  $height$jscomp$44_viewerBoxRatio$$ = this.$D$.width / this.$D$.height;
  this.$maxScale_$ = Math.max(2, Math.max($height$jscomp$44_viewerBoxRatio$$ / $sourceAspectRatio$$, $sourceAspectRatio$$ / $height$jscomp$44_viewerBoxRatio$$));
  this.$startScale_$ = this.$scale_$ = 1;
  this.$startY_$ = this.$posY_$ = this.$startX_$ = this.$posX_$ = 0;
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoomBounds_$$(this, this.$scale_$);
  $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updatePanZoom_$$(this);
  return $JSCompiler_StaticMethods_ImageViewer$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$updateSrc_$$(this);
};
_.$$jscomp$inherits$$($AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$, window.AMP.BaseElement);
$AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype.$open_$ = function($invocation$jscomp$41_source$jscomp$42$$) {
  var $$jscomp$this$jscomp$659$$ = this;
  this.$active_$ || ($JSCompiler_StaticMethods_buildLightbox_$$(this), $invocation$jscomp$41_source$jscomp$42$$ = $invocation$jscomp$41_source$jscomp$42$$.caller, this.$active_$ = !0, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$reset_$$(this), $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$init_$$(this, $invocation$jscomp$41_source$jscomp$42$$), this.$win$.document.documentElement.addEventListener("keydown", 
  this.$boundCloseOnEscape_$), _.$JSCompiler_StaticMethods_enterLightboxMode$$(this.$getViewport$()), $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$enter_$$(this), this.$unlistenViewport_$ = _.$JSCompiler_StaticMethods_onChanged$$(this.$getViewport$(), function() {
    $$jscomp$this$jscomp$659$$.$active_$ && (_.$startsWith$$module$src$string$$(_.$JSCompiler_StaticMethods_getIosVersionString$$(_.$Services$$module$src$services$platformFor$$($$jscomp$this$jscomp$659$$.$win$)), "10.3") ? _.$Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$659$$.$win$).delay(function() {
      $$jscomp$this$jscomp$659$$.$imageViewer_$.measure();
    }, 500) : $$jscomp$this$jscomp$659$$.$imageViewer_$.measure());
  }), _.$Services$$module$src$services$historyForDoc$$(this.$getAmpDoc$()).push(this.close.bind(this)).then(function($invocation$jscomp$41_source$jscomp$42$$) {
    $$jscomp$this$jscomp$659$$.$historyId_$ = $invocation$jscomp$41_source$jscomp$42$$;
  }));
};
$AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype.$closeOnEscape_$ = function($event$jscomp$134$$) {
  "Escape" == $event$jscomp$134$$.key && ($event$jscomp$134$$.preventDefault(), this.close());
};
$AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$.prototype.close = function() {
  this.$active_$ && (this.$entering_$ = this.$active_$ = !1, $JSCompiler_StaticMethods_AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox_prototype$exit_$$(this), this.$unlistenViewport_$ && (this.$unlistenViewport_$(), this.$unlistenViewport_$ = null), _.$JSCompiler_StaticMethods_leaveLightboxMode$$(this.$getViewport$()), -1 != this.$historyId_$ && _.$Services$$module$src$services$historyForDoc$$(this.$getAmpDoc$()).pop(this.$historyId_$), this.$win$.document.documentElement.removeEventListener("keydown", 
  this.$boundCloseOnEscape_$), this.$sourceElement_$ && _.$tryFocus$$module$src$dom$$(this.$sourceElement_$));
};
window.self.AMP.registerElement("amp-image-lightbox", $AmpImageLightbox$$module$extensions$amp_image_lightbox$0_1$amp_image_lightbox$$, "amp-image-lightbox{position:fixed!important;top:0!important;left:0!important;bottom:0!important;right:0!important;margin:0!important;padding:0!important;overflow:hidden!important;-webkit-transform:translateZ(0)!important;transform:translateZ(0)!important;-ms-touch-action:none!important;touch-action:none!important;z-index:1000;background:rgba(0,0,0,0.95);color:#f2f2f2}.i-amphtml-image-lightbox-container{position:absolute;z-index:0;top:0;left:0;right:0;bottom:0;overflow:hidden;-webkit-transform:translateZ(0);transform:translateZ(0)}.i-amphtml-image-lightbox-trans{pointer-events:none!important;position:fixed;z-index:1001;top:0;left:0;bottom:0;right:0}.i-amphtml-image-lightbox-caption{position:absolute!important;z-index:2;bottom:0!important;left:0!important;right:0!important}.i-amphtml-image-lightbox-caption.i-amphtml-empty,.i-amphtml-image-lightbox-view-mode .i-amphtml-image-lightbox-caption{visibility:hidden}.amp-image-lightbox-caption{background:rgba(0,0,0,0.5);max-height:25%;padding:8px}.i-amphtml-image-lightbox-viewer{position:absolute;z-index:1;top:0;left:0;right:0;bottom:0;overflow:hidden;-webkit-transform:translateZ(0);transform:translateZ(0)}.i-amphtml-image-lightbox-viewer-image{position:absolute;z-index:1;display:block;-webkit-transform-origin:50% 50%;transform-origin:50% 50%}\n/*# sourceURL=/extensions/amp-image-lightbox/0.1/amp-image-lightbox.css*/");

})});
