(self.AMP=self.AMP||[]).push({n:"amp-image-viewer",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$ = function($$jscomp$super$this$jscomp$62_element$jscomp$446$$) {
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$62_element$jscomp$446$$) || this;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$image_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$srcset_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$sourceWidth_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$sourceHeight_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$elementBox_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$imageBox_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$unlistenOnSwipePan_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$unlistenOnClickHaltMotion_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$scale_$ = 1;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$startScale_$ = 1;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$maxSeenScale_$ = 1;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$minScale_$ = 1;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$maxScale_$ = 2;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$startX_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$startY_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$posX_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$posY_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$minX_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$minY_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$maxX_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$maxY_$ = 0;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$gestures_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$motion_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$sourceAmpImage_$ = null;
  $$jscomp$super$this$jscomp$62_element$jscomp$446$$.$loadPromise_$ = null;
  return $$jscomp$super$this$jscomp$62_element$jscomp$446$$;
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$self$$, $ampImg$jscomp$2$$) {
  var $img$jscomp$10$$ = _.$elementByTag$$module$src$dom$$($ampImg$jscomp$2$$, "img");
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$self$$.$measureElement$(function() {
    $img$jscomp$10$$ ? ($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$self$$.$sourceWidth_$ = $img$jscomp$10$$.naturalWidth || $ampImg$jscomp$2$$.offsetWidth, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$self$$.$sourceHeight_$ = $img$jscomp$10$$.naturalHeight || $ampImg$jscomp$2$$.offsetHeight) : ($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$self$$.$sourceWidth_$ = 
    $ampImg$jscomp$2$$.offsetWidth, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$self$$.$sourceHeight_$ = $ampImg$jscomp$2$$.offsetHeight);
  });
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$) {
  if ($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$image_$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$image_$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.element.ownerDocument.createElement("img");
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$image_$.classList.add("i-amphtml-image-viewer-image");
  var $ampImg$jscomp$3$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$sourceAmpImage_$;
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setSourceDimensions_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$, $ampImg$jscomp$3$$);
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$srcset_$ = _.$srcsetFromElement$$module$src$srcset$$($ampImg$jscomp$3$$);
  return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$mutateElement$(function() {
    _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$image_$, {top:0, left:0, width:0, height:0});
    _.$toggle$$module$src$style$$($ampImg$jscomp$3$$, !1);
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.element.appendChild($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$image_$);
    return $ampImg$jscomp$3$$.$getImpl$().then(function($ampImg$jscomp$3$$) {
      _.$JSCompiler_StaticMethods_propagateAttributes$$($ampImg$jscomp$3$$, $ARIA_ATTRIBUTES$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$self$$.$image_$);
    });
  });
}, $JSCompiler_StaticMethods_resetImageDimensions_$$ = function($JSCompiler_StaticMethods_resetImageDimensions_$self$$) {
  return $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$measureElement$(function() {
    $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$ = _.$layoutRectFromDomRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$.element.getBoundingClientRect());
    var $sourceAspectRatio$jscomp$inline_3428$$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$sourceWidth_$ / $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$sourceHeight_$, $elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$ = Math.min($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.width / $sourceAspectRatio$jscomp$inline_3428$$, $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.height), $width$jscomp$inline_3430$$ = Math.min($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.height * 
    $sourceAspectRatio$jscomp$inline_3428$$, $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.width);
    16 >= Math.abs($width$jscomp$inline_3430$$ - $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$sourceWidth_$) && Math.abs(16 >= $elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$ - $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$sourceHeight_$) && ($width$jscomp$inline_3430$$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$sourceWidth_$, $elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$sourceHeight_$);
    $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$imageBox_$ = _.$layoutRectLtwh$$module$src$layout_rect$$(Math.round(($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.width - $width$jscomp$inline_3430$$) / 2), Math.round(($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.height - $elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$) / 2), Math.round($width$jscomp$inline_3430$$), Math.round($elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$));
    $elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.width / $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$elementBox_$.height;
    $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$maxScale_$ = Math.max(2, Math.max($elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$ / $sourceAspectRatio$jscomp$inline_3428$$, $sourceAspectRatio$jscomp$inline_3428$$ / $elementBoxRatio$jscomp$inline_3431_height$jscomp$inline_3429$$));
    $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$startScale_$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$scale_$ = 1;
    $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$startX_$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$posX_$ = 0;
    $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$startY_$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$posY_$ = 0;
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$, $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$scale_$);
  }).then(function() {
    var $image$jscomp$9$$ = $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$image_$;
    return $JSCompiler_StaticMethods_resetImageDimensions_$self$$.$mutateElement$(function() {
      _.$setStyles$$module$src$style$$($image$jscomp$9$$, {top:_.$px$$module$src$style$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$imageBox_$.top), left:_.$px$$module$src$style$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$imageBox_$.left), width:_.$px$$module$src$style$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$imageBox_$.width), height:_.$px$$module$src$style$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$.$imageBox_$.height)});
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$);
    }, $image$jscomp$9$$);
  }).then(function() {
    return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$$($JSCompiler_StaticMethods_resetImageDimensions_$self$$);
  });
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$) {
  if (!$JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$srcset_$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$maxSeenScale_$ = Math.max($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$maxSeenScale_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$scale_$);
  var $src$jscomp$44$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$srcset_$.select(Math.max($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$imageBox_$.width * $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$maxSeenScale_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$sourceWidth_$), 
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$getDpr$());
  return $src$jscomp$44$$ == $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$image_$.getAttribute("src") ? window.Promise.resolve() : $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$image_$.setAttribute("src", $src$jscomp$44$$);
  }, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$self$$.$image_$);
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$) {
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$gestures_$ = _.$Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.element);
  _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$gestures_$, _.$DoubletapRecognizer$$module$src$gesture_recognizers$$, function($data$jscomp$133_gesture$$) {
    $data$jscomp$133_gesture$$ = $data$jscomp$133_gesture$$.data;
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$, 1 == $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$scale_$ ? $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$maxScale_$ : 
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$minScale_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$elementBox_$.width / 2 - $data$jscomp$133_gesture$$.clientX, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$elementBox_$.height / 2 - $data$jscomp$133_gesture$$.clientY, 
    !0).then(function() {
      return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$);
    });
  });
  _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$gestures_$, _.$TapzoomRecognizer$$module$src$gesture_recognizers$$, function($data$jscomp$134_gesture$jscomp$1$$) {
    $data$jscomp$134_gesture$jscomp$1$$ = $data$jscomp$134_gesture$jscomp$1$$.data;
    var $deltaX$jscomp$inline_3436$$ = $data$jscomp$134_gesture$jscomp$1$$.deltaX, $deltaY$jscomp$inline_3437$$ = $data$jscomp$134_gesture$jscomp$1$$.deltaY;
    $JSCompiler_StaticMethods_zoomToPoint_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$, $data$jscomp$134_gesture$jscomp$1$$.$centerClientX$, $data$jscomp$134_gesture$jscomp$1$$.$centerClientY$, $deltaX$jscomp$inline_3436$$, $deltaY$jscomp$inline_3437$$, Math.abs($deltaY$jscomp$inline_3437$$) > Math.abs($deltaX$jscomp$inline_3436$$) ? Math.sign($deltaY$jscomp$inline_3437$$) : Math.sign(-$deltaX$jscomp$inline_3436$$));
    $data$jscomp$134_gesture$jscomp$1$$.$last$ && $JSCompiler_StaticMethods_onTapZoomRelease_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$, $data$jscomp$134_gesture$jscomp$1$$.$centerClientX$, $data$jscomp$134_gesture$jscomp$1$$.$centerClientY$, $data$jscomp$134_gesture$jscomp$1$$.deltaX, $data$jscomp$134_gesture$jscomp$1$$.deltaY, $data$jscomp$134_gesture$jscomp$1$$.velocityY, $data$jscomp$134_gesture$jscomp$1$$.velocityY);
  });
  _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$.$gestures_$, _.$PinchRecognizer$$module$src$gesture_recognizers$$, function($data$jscomp$135_gesture$jscomp$2$$) {
    $data$jscomp$135_gesture$jscomp$2$$ = $data$jscomp$135_gesture$jscomp$2$$.data;
    $JSCompiler_StaticMethods_zoomToPoint_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$, $data$jscomp$135_gesture$jscomp$2$$.$centerClientX$, $data$jscomp$135_gesture$jscomp$2$$.$centerClientY$, $data$jscomp$135_gesture$jscomp$2$$.deltaX, $data$jscomp$135_gesture$jscomp$2$$.deltaY, $data$jscomp$135_gesture$jscomp$2$$.dir);
    $data$jscomp$135_gesture$jscomp$2$$.$last$ && $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$self$$);
  });
}, $JSCompiler_StaticMethods_onZoomedIn_$$ = function($JSCompiler_StaticMethods_onZoomedIn_$self$$) {
  $JSCompiler_StaticMethods_onZoomedIn_$self$$.$unlistenOnSwipePan_$ = _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_onZoomedIn_$self$$.$gestures_$, _.$SwipeXYRecognizer$$module$src$gesture_recognizers$$, function($data$jscomp$136_gesture$jscomp$3$$) {
    $data$jscomp$136_gesture$jscomp$3$$ = $data$jscomp$136_gesture$jscomp$3$$.data;
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$$($JSCompiler_StaticMethods_onZoomedIn_$self$$, $JSCompiler_StaticMethods_onZoomedIn_$self$$.$scale_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($JSCompiler_StaticMethods_onZoomedIn_$self$$.$startX_$ + $data$jscomp$136_gesture$jscomp$3$$.deltaX, $JSCompiler_StaticMethods_onZoomedIn_$self$$.$minX_$, $JSCompiler_StaticMethods_onZoomedIn_$self$$.$maxX_$, 
    0), $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($JSCompiler_StaticMethods_onZoomedIn_$self$$.$startY_$ + $data$jscomp$136_gesture$jscomp$3$$.deltaY, $JSCompiler_StaticMethods_onZoomedIn_$self$$.$minY_$, $JSCompiler_StaticMethods_onZoomedIn_$self$$.$maxY_$, 0), !1);
    $data$jscomp$136_gesture$jscomp$3$$.$last$ && $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$$($JSCompiler_StaticMethods_onZoomedIn_$self$$, $data$jscomp$136_gesture$jscomp$3$$.velocityX, $data$jscomp$136_gesture$jscomp$3$$.velocityY);
  });
  $JSCompiler_StaticMethods_onZoomedIn_$self$$.$unlistenOnClickHaltMotion_$ = _.$JSCompiler_StaticMethods_onPointerDown$$($JSCompiler_StaticMethods_onZoomedIn_$self$$.$gestures_$, function($event$jscomp$136_target$jscomp$inline_3452$$) {
    if ($JSCompiler_StaticMethods_onZoomedIn_$self$$.$motion_$) {
      $JSCompiler_StaticMethods_onZoomedIn_$self$$.$motion_$.$halt$();
    } else {
      $event$jscomp$136_target$jscomp$inline_3452$$ = $event$jscomp$136_target$jscomp$inline_3452$$.target;
      var $event$jscomp$inline_3453$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_onZoomedIn_$self$$.$win$, "click", null, {bubbles:!0});
      $event$jscomp$136_target$jscomp$inline_3452$$.dispatchEvent($event$jscomp$inline_3453$$);
    }
  });
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$ = function($v$jscomp$18$$, $min$jscomp$10$$, $max$jscomp$11$$, $extent$jscomp$1$$) {
  return Math.max($min$jscomp$10$$ - $extent$jscomp$1$$, Math.min($max$jscomp$11$$ + $extent$jscomp$1$$, $v$jscomp$18$$));
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$, $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$) {
  var $dh$jscomp$2_maxY$jscomp$2$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$elementBox_$.height - $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$imageBox_$.height * $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$;
  if (0 <= $dh$jscomp$2_maxY$jscomp$2$$) {
    var $minY$jscomp$1$$ = $dh$jscomp$2_maxY$jscomp$2$$ = 0;
  } else {
    $minY$jscomp$1$$ = $dh$jscomp$2_maxY$jscomp$2$$ / 2, $dh$jscomp$2_maxY$jscomp$2$$ = -$minY$jscomp$1$$;
  }
  $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$elementBox_$.width - $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$imageBox_$.width * $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$;
  if (0 <= $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$) {
    var $minX$jscomp$1$$ = $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$ = 0;
  } else {
    $minX$jscomp$1$$ = $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$ / 2, $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$ = -$minX$jscomp$1$$;
  }
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$minX_$ = $minX$jscomp$1$$;
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$minY_$ = $minY$jscomp$1$$;
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$maxX_$ = $dw$jscomp$2_maxX$jscomp$1_scale$jscomp$4$$;
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$self$$.$maxY_$ = $dh$jscomp$2_maxY$jscomp$2$$;
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$self$$) {
  _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$self$$.$image_$, {transform:_.$translate$$module$src$style$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$self$$.$posX_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$self$$.$posY_$) + " " + 
  _.$scale$$module$src$style$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$self$$.$scale_$)});
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$, $veloX$jscomp$4$$, $veloY$jscomp$4$$) {
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$motion_$ = _.$continueMotion$$module$src$motion$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$image_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$posX_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$posY_$, 
  $veloX$jscomp$4$$, $veloY$jscomp$4$$, function($veloX$jscomp$4$$, $veloY$jscomp$4$$) {
    $veloX$jscomp$4$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($veloX$jscomp$4$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$minX_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$maxX_$, 0);
    $veloY$jscomp$4$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($veloY$jscomp$4$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$minY_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$maxY_$, 0);
    if (1 > Math.abs($veloX$jscomp$4$$ - $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$posX_$) && 1 > Math.abs($veloY$jscomp$4$$ - $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$posY_$)) {
      return !1;
    }
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$scale_$, $veloX$jscomp$4$$, $veloY$jscomp$4$$, !1);
    return !0;
  });
  _.$JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$motion_$, function() {
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$.$motion_$ = null;
    return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onMoveRelease_$self$$);
  });
}, $JSCompiler_StaticMethods_zoomToPoint_$$ = function($JSCompiler_StaticMethods_zoomToPoint_$self$$, $centerClientX$jscomp$4$$, $centerClientY$jscomp$4_deltaCenterY$jscomp$1$$, $deltaCenterX$jscomp$1_deltaX$jscomp$10$$, $deltaY$jscomp$11_dist$jscomp$2$$, $dir$jscomp$10_newScale$jscomp$6$$) {
  0 != $dir$jscomp$10_newScale$jscomp$6$$ && ($deltaY$jscomp$11_dist$jscomp$2$$ = Math.sqrt($deltaCenterX$jscomp$1_deltaX$jscomp$10$$ * $deltaCenterX$jscomp$1_deltaX$jscomp$10$$ + $deltaY$jscomp$11_dist$jscomp$2$$ * $deltaY$jscomp$11_dist$jscomp$2$$), $dir$jscomp$10_newScale$jscomp$6$$ = $JSCompiler_StaticMethods_zoomToPoint_$self$$.$startScale_$ * (1 + $dir$jscomp$10_newScale$jscomp$6$$ * $deltaY$jscomp$11_dist$jscomp$2$$ / 100), $deltaCenterX$jscomp$1_deltaX$jscomp$10$$ = $JSCompiler_StaticMethods_zoomToPoint_$self$$.$elementBox_$.width / 
  2 - $centerClientX$jscomp$4$$, $centerClientY$jscomp$4_deltaCenterY$jscomp$1$$ = $JSCompiler_StaticMethods_zoomToPoint_$self$$.$elementBox_$.height / 2 - $centerClientY$jscomp$4_deltaCenterY$jscomp$1$$, $deltaCenterX$jscomp$1_deltaX$jscomp$10$$ = Math.min($deltaCenterX$jscomp$1_deltaX$jscomp$10$$, $deltaY$jscomp$11_dist$jscomp$2$$ / 100 * $deltaCenterX$jscomp$1_deltaX$jscomp$10$$), $deltaY$jscomp$11_dist$jscomp$2$$ = Math.min($centerClientY$jscomp$4_deltaCenterY$jscomp$1$$, $deltaY$jscomp$11_dist$jscomp$2$$ / 
  100 * $centerClientY$jscomp$4_deltaCenterY$jscomp$1$$), $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$$($JSCompiler_StaticMethods_zoomToPoint_$self$$, $dir$jscomp$10_newScale$jscomp$6$$, $deltaCenterX$jscomp$1_deltaX$jscomp$10$$, $deltaY$jscomp$11_dist$jscomp$2$$, !1));
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$, $newScale$jscomp$7_scale$jscomp$5$$, $deltaX$jscomp$11$$, $deltaY$jscomp$12$$, $animate$jscomp$8$$) {
  $newScale$jscomp$7_scale$jscomp$5$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($newScale$jscomp$7_scale$jscomp$5$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$minScale_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$maxScale_$, 0.25);
  if ($newScale$jscomp$7_scale$jscomp$5$$ != $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$scale_$) {
    return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$, $newScale$jscomp$7_scale$jscomp$5$$), $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$, 
    $newScale$jscomp$7_scale$jscomp$5$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$startX_$ + $deltaX$jscomp$11$$ * $newScale$jscomp$7_scale$jscomp$5$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$minX_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$maxX_$, 
    0), $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$startY_$ + $deltaY$jscomp$12$$ * $newScale$jscomp$7_scale$jscomp$5$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$minY_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoom_$self$$.$maxY_$, 
    0), $animate$jscomp$8$$);
  }
}, $JSCompiler_StaticMethods_onTapZoomRelease_$$ = function($JSCompiler_StaticMethods_onTapZoomRelease_$self$$, $centerClientX$jscomp$5$$, $centerClientY$jscomp$5$$, $deltaX$jscomp$12$$, $deltaY$jscomp$13$$, $veloX$jscomp$5$$, $veloY$jscomp$5$$) {
  (0 == $veloX$jscomp$5$$ && 0 == $veloY$jscomp$5$$ ? window.Promise.resolve() : _.$JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$$(_.$continueMotion$$module$src$motion$$($JSCompiler_StaticMethods_onTapZoomRelease_$self$$.$image_$, $deltaX$jscomp$12$$, $deltaY$jscomp$13$$, $veloX$jscomp$5$$, $veloY$jscomp$5$$, function($deltaX$jscomp$12$$, $deltaY$jscomp$13$$) {
    $JSCompiler_StaticMethods_zoomToPoint_$$($JSCompiler_StaticMethods_onTapZoomRelease_$self$$, $centerClientX$jscomp$5$$, $centerClientY$jscomp$5$$, $deltaX$jscomp$12$$, $deltaY$jscomp$13$$, Math.abs($deltaY$jscomp$13$$) > Math.abs($deltaX$jscomp$12$$) ? Math.sign($deltaY$jscomp$13$$) : Math.sign(-$deltaX$jscomp$12$$));
    return !0;
  }))).then(function() {
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$$($JSCompiler_StaticMethods_onTapZoomRelease_$self$$);
  });
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$) {
  var $relayout$jscomp$1$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$scale_$ > $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$startScale_$;
  return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$).then(function() {
    $relayout$jscomp$1$$ && $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updateSrc_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$);
    1 < $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$scale_$ ? $JSCompiler_StaticMethods_onZoomedIn_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$) : ($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$unlistenOnSwipePan_$ && ($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$unlistenOnSwipePan_$(), 
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$unlistenOnSwipePan_$ = null, _.$JSCompiler_StaticMethods_removeGesture$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$gestures_$)), $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$unlistenOnClickHaltMotion_$ && 
    ($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$unlistenOnClickHaltMotion_$(), $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$onZoomRelease_$self$$.$unlistenOnClickHaltMotion_$ = null));
  });
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$, $newScale$jscomp$8$$, $newPosX$jscomp$8$$, $newPosY$jscomp$8$$, $animate$jscomp$9$$) {
  var $ds$jscomp$1$$ = $newScale$jscomp$8$$ - $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$scale_$, $dist$jscomp$3_dx$jscomp$12$$ = $newPosX$jscomp$8$$ - $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posX_$, $dur$jscomp$3_dy$jscomp$15$$ = $newPosY$jscomp$8$$ - $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posY_$;
  $dist$jscomp$3_dx$jscomp$12$$ = Math.sqrt($dist$jscomp$3_dx$jscomp$12$$ * $dist$jscomp$3_dx$jscomp$12$$ + $dur$jscomp$3_dy$jscomp$15$$ * $dur$jscomp$3_dy$jscomp$15$$);
  $dur$jscomp$3_dy$jscomp$15$$ = 0;
  $animate$jscomp$9$$ && ($dur$jscomp$3_dy$jscomp$15$$ = Math.min(250, Math.max(2.5 * $dist$jscomp$3_dx$jscomp$12$$, 250 * Math.abs($ds$jscomp$1$$))));
  if (16 < $dur$jscomp$3_dy$jscomp$15$$ && $animate$jscomp$9$$) {
    var $scaleFunc$jscomp$1$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$scale_$, $newScale$jscomp$8$$), $xFunc$jscomp$1$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posX_$, $newPosX$jscomp$8$$), $yFunc$jscomp$1$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posY_$, 
    $newPosY$jscomp$8$$);
    var $promise$jscomp$47$$ = _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$image_$, function($newScale$jscomp$8$$) {
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$scale_$ = $scaleFunc$jscomp$1$$($newScale$jscomp$8$$);
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posX_$ = $xFunc$jscomp$1$$($newScale$jscomp$8$$);
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posY_$ = $yFunc$jscomp$1$$($newScale$jscomp$8$$);
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$);
    }, $dur$jscomp$3_dy$jscomp$15$$, $PAN_ZOOM_CURVE_$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$), function() {
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$scale_$ = $newScale$jscomp$8$$;
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posX_$ = $newPosX$jscomp$8$$;
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posY_$ = $newPosY$jscomp$8$$;
      $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$);
    });
  } else {
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$scale_$ = $newScale$jscomp$8$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posX_$ = $newPosX$jscomp$8$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$.$posY_$ = $newPosY$jscomp$8$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$self$$), 
    $animate$jscomp$9$$ ? $promise$jscomp$47$$ = window.Promise.resolve() : $promise$jscomp$47$$ = void 0;
  }
  return $promise$jscomp$47$$;
}, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$$ = function($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$) {
  var $newScale$jscomp$9$$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$scale_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$minScale_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$maxScale_$, 
  0);
  $newScale$jscomp$9$$ != $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$scale_$ && $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$, $newScale$jscomp$9$$);
  return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$set_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$, $newScale$jscomp$9$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$posX_$ / 
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$scale_$ * $newScale$jscomp$9$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$minX_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$maxX_$, 0), $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$boundValue_$$($JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$posY_$ / 
  $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$scale_$ * $newScale$jscomp$9$$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$minY_$, $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$maxY_$, 0), !0).then(function() {
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$startScale_$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$scale_$;
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$startX_$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$posX_$;
    $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$startY_$ = $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$release_$self$$.$posY_$;
  });
};
var $PAN_ZOOM_CURVE_$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$ = _.$bezierCurve$$module$src$curve$$(0.4, 0, 0.2, 1.4), $ARIA_ATTRIBUTES$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$ = ["aria-label", "aria-describedby", "aria-labelledby"];
_.$$jscomp$inherits$$($AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.element.classList.add("i-amphtml-image-viewer");
  this.$sourceAmpImage_$ = this.$getRealChildren$()[0];
  _.$Resource$$module$src$service$resource$setOwner$$(this.$sourceAmpImage_$, this.element);
};
_.$JSCompiler_prototypeAlias$$.$onMeasureChanged$ = function() {
  var $$jscomp$this$jscomp$672$$ = this;
  this.$loadPromise_$ && this.$loadPromise_$.then(function() {
    return $JSCompiler_StaticMethods_resetImageDimensions_$$($$jscomp$this$jscomp$672$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$673$$ = this;
  if (this.$loadPromise_$) {
    return this.$loadPromise_$;
  }
  var $ampImg$jscomp$1$$ = this.$sourceAmpImage_$, $isLaidOut$$ = $ampImg$jscomp$1$$.hasAttribute("i-amphtml-layout") || $ampImg$jscomp$1$$.classList.contains("i-amphtml-layout"), $laidOutPromise$$ = $isLaidOut$$ ? window.Promise.resolve() : $ampImg$jscomp$1$$.signals().whenSignal("load-end");
  $isLaidOut$$ || this.$scheduleLayout$($ampImg$jscomp$1$$);
  return this.$loadPromise_$ = $laidOutPromise$$.then(function() {
    return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$init_$$($$jscomp$this$jscomp$673$$);
  }).then(function() {
    return $JSCompiler_StaticMethods_resetImageDimensions_$$($$jscomp$this$jscomp$673$$);
  }).then(function() {
    return $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$$($$jscomp$this$jscomp$673$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  var $$jscomp$this$jscomp$674$$ = this;
  this.$loadPromise_$ && this.$loadPromise_$.then(function() {
    $JSCompiler_StaticMethods_resetImageDimensions_$$($$jscomp$this$jscomp$674$$);
    $$jscomp$this$jscomp$674$$.$gestures_$ && ($$jscomp$this$jscomp$674$$.$gestures_$.$cleanup$(), $$jscomp$this$jscomp$674$$.$gestures_$ = null);
  });
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  var $$jscomp$this$jscomp$675$$ = this;
  this.$loadPromise_$ && this.$loadPromise_$.then(function() {
    $$jscomp$this$jscomp$675$$.$gestures_$ || $JSCompiler_StaticMethods_AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer_prototype$setupGestures_$$($$jscomp$this$jscomp$675$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$gestures_$ && (this.$gestures_$.$cleanup$(), this.$gestures_$ = null);
  this.$loadPromise_$ = null;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$69$$) {
  return "fill" == $layout$jscomp$69$$;
};
_.$JSCompiler_prototypeAlias$$.$getImage$ = function() {
  return this.$image_$;
};
_.$JSCompiler_prototypeAlias$$.$getImageBoxWithOffset$ = function() {
  if (0 == this.$posX_$ && 0 == this.$posY_$ || !this.$imageBox_$) {
    return this.$imageBox_$;
  }
  var $expansionScale$$ = (this.$scale_$ - 1) / 2;
  return _.$moveLayoutRect$$module$src$layout_rect$$(_.$expandLayoutRect$$module$src$layout_rect$$(this.$imageBox_$, $expansionScale$$, $expansionScale$$), this.$posX_$, this.$posY_$);
};
window.self.AMP.registerElement("amp-image-viewer", $AmpImageViewer$$module$extensions$amp_image_viewer$0_1$amp_image_viewer$$, ".i-amphtml-image-viewer-image{position:absolute}.i-amphtml-image-viewer{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;-webkit-transform:translateZ(0);transform:translateZ(0)}\n/*# sourceURL=/extensions/amp-image-viewer/0.1/amp-image-viewer.css*/");

})});
