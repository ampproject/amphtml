(self.AMP=self.AMP||[]).push({n:"amp-pan-zoom",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom$$ = function($$jscomp$super$this$jscomp$81_element$jscomp$512$$) {
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$81_element$jscomp$512$$) || this;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$content_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$action_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$sourceWidth_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$sourceHeight_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$elementBox_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$contentBox_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$unlistenOnSwipePan_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$scale_$ = 1;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$startScale_$ = 1;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$minScale_$ = 1;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$maxScale_$ = 3;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$initialX_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$initialY_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$initialScale_$ = 1;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$startX_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$startY_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$posX_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$posY_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$minX_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$minY_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$maxX_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$maxY_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$gestures_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$motion_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$resetOnResize_$ = !1;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$zoomButton_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$disableDoubleTap_$ = !1;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$unlistenMouseDown_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$unlistenMouseUp_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$unlistenMouseMove_$ = null;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$mouseStartY_$ = 0;
  $$jscomp$super$this$jscomp$81_element$jscomp$512$$.$mouseStartX_$ = 0;
  return $$jscomp$super$this$jscomp$81_element$jscomp$512$$;
}, $JSCompiler_StaticMethods_createZoomButton_$$ = function($JSCompiler_StaticMethods_createZoomButton_$self$$) {
  $JSCompiler_StaticMethods_createZoomButton_$self$$.$zoomButton_$ = $JSCompiler_StaticMethods_createZoomButton_$self$$.element.ownerDocument.createElement("div");
  $JSCompiler_StaticMethods_createZoomButton_$self$$.$zoomButton_$.classList.add("amp-pan-zoom-in-icon");
  $JSCompiler_StaticMethods_createZoomButton_$self$$.$zoomButton_$.classList.add("amp-pan-zoom-button");
  $JSCompiler_StaticMethods_createZoomButton_$self$$.$zoomButton_$.addEventListener("click", function() {
    $JSCompiler_StaticMethods_createZoomButton_$self$$.$zoomButton_$.classList.contains("amp-pan-zoom-in-icon") ? ($JSCompiler_StaticMethods_createZoomButton_$self$$.transform(0, 0, $JSCompiler_StaticMethods_createZoomButton_$self$$.$maxScale_$), $JSCompiler_StaticMethods_toggleZoomButtonOut_$$($JSCompiler_StaticMethods_createZoomButton_$self$$)) : ($JSCompiler_StaticMethods_createZoomButton_$self$$.transform(0, 0, $JSCompiler_StaticMethods_createZoomButton_$self$$.$minScale_$), $JSCompiler_StaticMethods_toggleZoomButtonIn_$$($JSCompiler_StaticMethods_createZoomButton_$self$$));
  });
  $JSCompiler_StaticMethods_createZoomButton_$self$$.element.appendChild($JSCompiler_StaticMethods_createZoomButton_$self$$.$zoomButton_$);
}, $JSCompiler_StaticMethods_getNumberAttributeOr_$$ = function($JSCompiler_StaticMethods_getNumberAttributeOr_$self_element$jscomp$514$$, $attribute$jscomp$6$$, $defaultValue$jscomp$8$$) {
  $JSCompiler_StaticMethods_getNumberAttributeOr_$self_element$jscomp$514$$ = $JSCompiler_StaticMethods_getNumberAttributeOr_$self_element$jscomp$514$$.element;
  return $JSCompiler_StaticMethods_getNumberAttributeOr_$self_element$jscomp$514$$.hasAttribute($attribute$jscomp$6$$) ? (0,window.parseInt)($JSCompiler_StaticMethods_getNumberAttributeOr_$self_element$jscomp$514$$.getAttribute($attribute$jscomp$6$$), 10) : $defaultValue$jscomp$8$$;
}, $JSCompiler_StaticMethods_resetContentDimensions_$$ = function($JSCompiler_StaticMethods_resetContentDimensions_$self$$) {
  return $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$mutateElement$(function() {
    _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$content_$, {width:"", height:""});
  }).then(function() {
    return $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$measureMutateElement$(function() {
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceWidth_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$content_$.scrollWidth;
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceHeight_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$content_$.scrollHeight;
      var $maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceWidth_$ / $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceHeight_$;
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$getViewport$().$getLayoutRect$($JSCompiler_StaticMethods_resetContentDimensions_$self$$.element);
      var $$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$ = Math.min($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$.width / $maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$, $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$.height), $width$jscomp$inline_6291$$ = Math.min($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$.height * $maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$, 
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$.width);
      16 >= Math.abs($width$jscomp$inline_6291$$ - $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceWidth_$) && 16 >= Math.abs($$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$ - $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceHeight_$) && ($width$jscomp$inline_6291$$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceWidth_$, $$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$sourceHeight_$);
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$contentBox_$ = _.$layoutRectLtwh$$module$src$layout_rect$$(0, 0, Math.round($width$jscomp$inline_6291$$), Math.round($$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$));
      $$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$;
      $$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$ = $$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$.width / $$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$.height;
      $maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$ = Math.max($$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$ / $maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$, $maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$ / $$jscomp$inline_6295_elementBoxRatio$jscomp$inline_6296_height$jscomp$inline_6290$$);
      (0,window.isNaN)($maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$) || ($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$maxScale_$ = Math.max($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$maxScale_$, $maxScale$jscomp$inline_6297_sourceAspectRatio$jscomp$inline_3791$$));
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$startScale_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$scale_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$initialScale_$;
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$startX_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$posX_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$initialX_$;
      $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$startY_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$posY_$ = $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$initialY_$;
    }, function() {
      _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$content_$, {width:_.$px$$module$src$style$$($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$contentBox_$.width), height:_.$px$$module$src$style$$($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$contentBox_$.height)});
    }, $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$content_$);
  }).then(function() {
    var $contentBox$jscomp$inline_3796$$ = _.$layoutRectFromDomRect$$module$src$layout_rect$$($JSCompiler_StaticMethods_resetContentDimensions_$self$$.$content_$.getBoundingClientRect());
    $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$contentBox_$.top = $contentBox$jscomp$inline_3796$$.top - $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$.top;
    $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$contentBox_$.left = $contentBox$jscomp$inline_3796$$.left - $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$elementBox_$.left;
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_resetContentDimensions_$self$$, $JSCompiler_StaticMethods_resetContentDimensions_$self$$.$scale_$);
    return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_resetContentDimensions_$self$$);
  });
}, $JSCompiler_StaticMethods_setupEvents_$$ = function($JSCompiler_StaticMethods_setupEvents_$self$$) {
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$$($JSCompiler_StaticMethods_setupEvents_$self$$);
  $JSCompiler_StaticMethods_setupEvents_$self$$.$unlistenMouseDown_$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_setupEvents_$self$$.element, "mousedown", function($e$jscomp$273$$) {
    return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$$($JSCompiler_StaticMethods_setupEvents_$self$$, $e$jscomp$273$$);
  });
}, $JSCompiler_StaticMethods_cleanupEvents_$$ = function($JSCompiler_StaticMethods_cleanupEvents_$self$$) {
  $JSCompiler_StaticMethods_cleanupEvents_$self$$.$gestures_$ && ($JSCompiler_StaticMethods_cleanupEvents_$self$$.$gestures_$.$cleanup$(), $JSCompiler_StaticMethods_cleanupEvents_$self$$.$gestures_$ = null);
  $JSCompiler_StaticMethods_cleanupEvents_$self$$.$unlisten_$($JSCompiler_StaticMethods_cleanupEvents_$self$$.$unlistenMouseDown_$);
  $JSCompiler_StaticMethods_cleanupEvents_$self$$.$unlisten_$($JSCompiler_StaticMethods_cleanupEvents_$self$$.$unlistenMouseMove_$);
  $JSCompiler_StaticMethods_cleanupEvents_$self$$.$unlisten_$($JSCompiler_StaticMethods_cleanupEvents_$self$$.$unlistenMouseUp_$);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$, $clientY$jscomp$3_e$jscomp$274$$) {
  if (2 != $clientY$jscomp$3_e$jscomp$274$$.button) {
    $clientY$jscomp$3_e$jscomp$274$$.preventDefault();
    var $clientX$jscomp$3$$ = $clientY$jscomp$3_e$jscomp$274$$.clientX;
    $clientY$jscomp$3_e$jscomp$274$$ = $clientY$jscomp$3_e$jscomp$274$$.clientY;
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlisten_$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlistenMouseMove_$);
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlisten_$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlistenMouseUp_$);
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$mouseStartX_$ = $clientX$jscomp$3$$;
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$mouseStartY_$ = $clientY$jscomp$3_e$jscomp$274$$;
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlistenMouseMove_$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.element, "mousemove", function($clientY$jscomp$3_e$jscomp$274$$) {
      $clientY$jscomp$3_e$jscomp$274$$.preventDefault();
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$scale_$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$, 
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$startX_$ + ($clientY$jscomp$3_e$jscomp$274$$.clientX - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$mouseStartX_$), !0), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$, 
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$startY_$ + ($clientY$jscomp$3_e$jscomp$274$$.clientY - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$mouseStartY_$), !0), !1);
    });
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlistenMouseUp_$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$win$, "mouseup", function($clientY$jscomp$3_e$jscomp$274$$) {
      $clientY$jscomp$3_e$jscomp$274$$.preventDefault();
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$);
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlisten_$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlistenMouseMove_$);
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlisten_$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMouseDown_$self$$.$unlistenMouseUp_$);
    });
  }
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$) {
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$gestures_$ || ($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$gestures_$ = _.$Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.element), _.$JSCompiler_StaticMethods_onPointerDown$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$gestures_$, 
  function() {
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$motion_$ && $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$motion_$.$halt$();
  }), _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$gestures_$, _.$PinchRecognizer$$module$src$gesture_recognizers$$, function($e$jscomp$279$$) {
    return $JSCompiler_StaticMethods_handlePinch$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$, $e$jscomp$279$$.data);
  }), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$disableDoubleTap_$ || (_.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$gestures_$, _.$DoubletapRecognizer$$module$src$gesture_recognizers$$, function($e$jscomp$280$$) {
    return $JSCompiler_StaticMethods_handleDoubleTap$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$, $e$jscomp$280$$.data);
  }), _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$gestures_$, _.$TapRecognizer$$module$src$gesture_recognizers$$, function($data$jscomp$inline_3807_e$jscomp$281$$) {
    $data$jscomp$inline_3807_e$jscomp$281$$ = $data$jscomp$inline_3807_e$jscomp$281$$.data;
    var $event$jscomp$inline_3808$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$setupGestures_$self$$.$win$, "click", null, {bubbles:!0});
    $data$jscomp$inline_3807_e$jscomp$281$$.target.dispatchEvent($event$jscomp$inline_3808$$);
  })));
}, $JSCompiler_StaticMethods_handleDoubleTap$$ = function($JSCompiler_StaticMethods_handleDoubleTap$self$$, $data$jscomp$151$$) {
  return $JSCompiler_StaticMethods_onDoubletapZoom_$$($JSCompiler_StaticMethods_handleDoubleTap$self$$, $data$jscomp$151$$.clientX, $data$jscomp$151$$.clientY).then(function() {
    return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$$($JSCompiler_StaticMethods_handleDoubleTap$self$$);
  });
}, $JSCompiler_StaticMethods_handlePinch$$ = function($JSCompiler_StaticMethods_handlePinch$self$$, $data$jscomp$152$$) {
  var $last$jscomp$6$$ = $data$jscomp$152$$.$last$;
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$$($JSCompiler_StaticMethods_handlePinch$self$$, $data$jscomp$152$$.$centerClientX$, $data$jscomp$152$$.$centerClientY$, $data$jscomp$152$$.deltaX, $data$jscomp$152$$.deltaY, $data$jscomp$152$$.dir).then(function() {
    if ($last$jscomp$6$$) {
      return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$$($JSCompiler_StaticMethods_handlePinch$self$$);
    }
  });
}, $JSCompiler_StaticMethods_handleSwipe$$ = function($JSCompiler_StaticMethods_handleSwipe$self$$, $data$jscomp$153$$) {
  var $last$jscomp$7$$ = $data$jscomp$153$$.$last$, $velocityX$$ = $data$jscomp$153$$.velocityX, $velocityY$$ = $data$jscomp$153$$.velocityY;
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$$($JSCompiler_StaticMethods_handleSwipe$self$$, $JSCompiler_StaticMethods_handleSwipe$self$$.$scale_$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$$($JSCompiler_StaticMethods_handleSwipe$self$$, $JSCompiler_StaticMethods_handleSwipe$self$$.$startX_$ + $data$jscomp$153$$.deltaX, !0), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$$($JSCompiler_StaticMethods_handleSwipe$self$$, 
  $JSCompiler_StaticMethods_handleSwipe$self$$.$startY_$ + $data$jscomp$153$$.deltaY, !0), !1).then(function() {
    if ($last$jscomp$7$$) {
      return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$$($JSCompiler_StaticMethods_handleSwipe$self$$, $velocityX$$, $velocityY$$);
    }
  });
}, $JSCompiler_StaticMethods_registerPanningGesture_$$ = function($JSCompiler_StaticMethods_registerPanningGesture_$self$$) {
  $JSCompiler_StaticMethods_registerPanningGesture_$self$$.$unlistenOnSwipePan_$ = _.$JSCompiler_StaticMethods_onGesture$$($JSCompiler_StaticMethods_registerPanningGesture_$self$$.$gestures_$, _.$SwipeXYRecognizer$$module$src$gesture_recognizers$$, function($e$jscomp$282$$) {
    return $JSCompiler_StaticMethods_handleSwipe$$($JSCompiler_StaticMethods_registerPanningGesture_$self$$, $e$jscomp$282$$.data);
  });
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$self$$, $x$jscomp$100$$, $allowExtent$jscomp$7_extent$jscomp$inline_6302$$) {
  var $maxExtent$$ = 0.25 * $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$self$$.$elementBox_$.width;
  $allowExtent$jscomp$7_extent$jscomp$inline_6302$$ = $allowExtent$jscomp$7_extent$jscomp$inline_6302$$ && 1 < $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$self$$.$scale_$ ? $maxExtent$$ : 0;
  return _.$clamp$$module$src$utils$math$$($x$jscomp$100$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$self$$.$minX_$ - $allowExtent$jscomp$7_extent$jscomp$inline_6302$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$self$$.$maxX_$ + $allowExtent$jscomp$7_extent$jscomp$inline_6302$$);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$self$$, $y$jscomp$77$$, $allowExtent$jscomp$8_extent$jscomp$inline_6307$$) {
  var $maxExtent$jscomp$1$$ = 0.25 * $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$self$$.$elementBox_$.height;
  $allowExtent$jscomp$8_extent$jscomp$inline_6307$$ = $allowExtent$jscomp$8_extent$jscomp$inline_6307$$ && 1 < $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$self$$.$scale_$ ? $maxExtent$jscomp$1$$ : 0;
  return _.$clamp$$module$src$utils$math$$($y$jscomp$77$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$self$$.$minY_$ - $allowExtent$jscomp$8_extent$jscomp$inline_6307$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$self$$.$maxY_$ + $allowExtent$jscomp$8_extent$jscomp$inline_6307$$);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$self$$, $scale$jscomp$8$$) {
  var $$jscomp$destructuring$var469_yOffset$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$self$$.$contentBox_$, $cWidth$$ = $$jscomp$destructuring$var469_yOffset$$.width, $xOffset$$ = $$jscomp$destructuring$var469_yOffset$$.left, $cHeight$$ = $$jscomp$destructuring$var469_yOffset$$.height;
  $$jscomp$destructuring$var469_yOffset$$ = $$jscomp$destructuring$var469_yOffset$$.top;
  var $$jscomp$destructuring$var470$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$self$$.$elementBox_$, $eHeight$$ = $$jscomp$destructuring$var470$$.height;
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$self$$.$minX_$ = Math.min(0, $$jscomp$destructuring$var470$$.width - ($xOffset$$ + $cWidth$$ * ($scale$jscomp$8$$ + 1) / 2));
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$self$$.$maxX_$ = Math.max(0, ($cWidth$$ * $scale$jscomp$8$$ - $cWidth$$) / 2 - $xOffset$$);
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$self$$.$minY_$ = Math.min(0, $eHeight$$ - ($$jscomp$destructuring$var469_yOffset$$ + $cHeight$$ * ($scale$jscomp$8$$ + 1) / 2));
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$self$$.$maxY_$ = Math.max(0, ($cHeight$$ * $scale$jscomp$8$$ - $cHeight$$) / 2 - $$jscomp$destructuring$var469_yOffset$$);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$self$$) {
  var $s$jscomp$47$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$self$$.$scale_$, $x$jscomp$101$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$self$$.$posX_$, $y$jscomp$78$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$self$$.$posY_$, $content$jscomp$24$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$self$$.$content_$;
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$self$$.$mutateElement$(function() {
    _.$setStyles$$module$src$style$$($content$jscomp$24$$, {transform:_.$translate$$module$src$style$$($x$jscomp$101$$, $y$jscomp$78$$) + " " + _.$scale$$module$src$style$$($s$jscomp$47$$)});
  }, $content$jscomp$24$$);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$, $veloX$jscomp$6$$, $veloY$jscomp$6$$) {
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$motion_$ = _.$continueMotion$$module$src$motion$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$content_$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$posX_$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$posY_$, 
  $veloX$jscomp$6$$, $veloY$jscomp$6$$, function($veloX$jscomp$6$$, $veloY$jscomp$6$$) {
    $veloX$jscomp$6$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$, $veloX$jscomp$6$$, !0);
    $veloY$jscomp$6$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$, $veloY$jscomp$6$$, !0);
    if (1 > Math.abs($veloX$jscomp$6$$ - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$posX_$) && 1 > Math.abs($veloY$jscomp$6$$ - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$posY_$)) {
      return !1;
    }
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$scale_$, $veloX$jscomp$6$$, $veloY$jscomp$6$$, !1);
    return !0;
  });
  return _.$JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$motion_$, function() {
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$.$motion_$ = null;
    return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onMoveRelease_$self$$);
  });
}, $JSCompiler_StaticMethods_onDoubletapZoom_$$ = function($JSCompiler_StaticMethods_onDoubletapZoom_$self$$, $clientX$jscomp$6_dx$jscomp$13$$, $clientY$jscomp$6_dy$jscomp$18$$) {
  var $newScale$jscomp$10$$ = $JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$scale_$ == $JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$minScale_$ ? $JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$maxScale_$ : $JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$minScale_$;
  $clientX$jscomp$6_dx$jscomp$13$$ = $JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$elementBox_$.width / 2 - ($clientX$jscomp$6_dx$jscomp$13$$ - ($JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$elementBox_$.left - $JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$getViewport$().getScrollLeft()));
  $clientY$jscomp$6_dy$jscomp$18$$ = $JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$elementBox_$.height / 2 - ($clientY$jscomp$6_dy$jscomp$18$$ - ($JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$elementBox_$.top - _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_onDoubletapZoom_$self$$.$getViewport$())));
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$$($JSCompiler_StaticMethods_onDoubletapZoom_$self$$, $newScale$jscomp$10$$, $clientX$jscomp$6_dx$jscomp$13$$, $clientY$jscomp$6_dy$jscomp$18$$, !0);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$, $centerClientX$jscomp$7_deltaCenterX$jscomp$2$$, $centerClientY$jscomp$7_deltaCenterY$jscomp$2$$, $deltaX$jscomp$17_dist$jscomp$4$$, $deltaY$jscomp$19$$, $dir$jscomp$12_newScale$jscomp$11$$) {
  if (0 == $dir$jscomp$12_newScale$jscomp$11$$) {
    return window.Promise.resolve();
  }
  var $$jscomp$destructuring$var472$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$.$elementBox_$, $height$jscomp$53$$ = $$jscomp$destructuring$var472$$.height;
  $deltaX$jscomp$17_dist$jscomp$4$$ = Math.sqrt($deltaX$jscomp$17_dist$jscomp$4$$ * $deltaX$jscomp$17_dist$jscomp$4$$ + $deltaY$jscomp$19$$ * $deltaY$jscomp$19$$);
  $dir$jscomp$12_newScale$jscomp$11$$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$.$startScale_$ * (1 + $dir$jscomp$12_newScale$jscomp$11$$ * $deltaX$jscomp$17_dist$jscomp$4$$ / 100);
  $centerClientX$jscomp$7_deltaCenterX$jscomp$2$$ = $$jscomp$destructuring$var472$$.width / 2 - ($centerClientX$jscomp$7_deltaCenterX$jscomp$2$$ - ($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$.$elementBox_$.left - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$.$getViewport$().getScrollLeft()));
  $centerClientY$jscomp$7_deltaCenterY$jscomp$2$$ = $height$jscomp$53$$ / 2 - ($centerClientY$jscomp$7_deltaCenterY$jscomp$2$$ - ($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$.$elementBox_$.top - _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$.$getViewport$())));
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onPinchZoom_$self$$, $dir$jscomp$12_newScale$jscomp$11$$, Math.min($deltaX$jscomp$17_dist$jscomp$4$$ / 100, 1) * $centerClientX$jscomp$7_deltaCenterX$jscomp$2$$, Math.min($deltaX$jscomp$17_dist$jscomp$4$$ / 100, 1) * $centerClientY$jscomp$7_deltaCenterY$jscomp$2$$, !1);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$, $newScale$jscomp$12_scale$jscomp$10$$, $deltaX$jscomp$18$$, $deltaY$jscomp$20$$, $animate$jscomp$11$$) {
  $newScale$jscomp$12_scale$jscomp$10$$ = _.$clamp$$module$src$utils$math$$($newScale$jscomp$12_scale$jscomp$10$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$.$minScale_$ - 0.25, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$.$maxScale_$ + 0.25);
  if ($newScale$jscomp$12_scale$jscomp$10$$ == $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$.$scale_$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$, $newScale$jscomp$12_scale$jscomp$10$$);
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$, $newScale$jscomp$12_scale$jscomp$10$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$.$startX_$ + 
  $deltaX$jscomp$18$$ * $newScale$jscomp$12_scale$jscomp$10$$, !1), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoom_$self$$.$startY_$ + $deltaY$jscomp$20$$ * $newScale$jscomp$12_scale$jscomp$10$$, !1), $animate$jscomp$11$$);
}, $JSCompiler_StaticMethods_toggleZoomButtonIn_$$ = function($JSCompiler_StaticMethods_toggleZoomButtonIn_$self$$) {
  $JSCompiler_StaticMethods_toggleZoomButtonIn_$self$$.$zoomButton_$ && ($JSCompiler_StaticMethods_toggleZoomButtonIn_$self$$.$zoomButton_$.classList.add("amp-pan-zoom-in-icon"), $JSCompiler_StaticMethods_toggleZoomButtonIn_$self$$.$zoomButton_$.classList.remove("amp-pan-zoom-out-icon"));
}, $JSCompiler_StaticMethods_toggleZoomButtonOut_$$ = function($JSCompiler_StaticMethods_toggleZoomButtonOut_$self$$) {
  $JSCompiler_StaticMethods_toggleZoomButtonOut_$self$$.$zoomButton_$ && ($JSCompiler_StaticMethods_toggleZoomButtonOut_$self$$.$zoomButton_$.classList.remove("amp-pan-zoom-in-icon"), $JSCompiler_StaticMethods_toggleZoomButtonOut_$self$$.$zoomButton_$.classList.add("amp-pan-zoom-out-icon"));
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$) {
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$).then(function() {
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$scale_$ <= $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$minScale_$ ? ($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$unlistenOnSwipePan_$ && ($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$unlistenOnSwipePan_$(), 
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$unlistenOnSwipePan_$ = null, _.$JSCompiler_StaticMethods_removeGesture$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$gestures_$)), $JSCompiler_StaticMethods_toggleZoomButtonIn_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$content_$.classList.remove("i-amphtml-pan-zoom-scrollable")) : 
    ($JSCompiler_StaticMethods_registerPanningGesture_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$), $JSCompiler_StaticMethods_toggleZoomButtonOut_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$self$$.$content_$.classList.add("i-amphtml-pan-zoom-scrollable"));
  });
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$, $newScale$jscomp$13$$, $newPosX$jscomp$13$$, $newPosY$jscomp$13$$, $animate$jscomp$12$$) {
  var $ds$jscomp$2_dur$jscomp$4$$ = $newScale$jscomp$13$$ - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$scale_$, $dist$jscomp$5_dx$jscomp$15$$ = $newPosX$jscomp$13$$ - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posX_$, $dy$jscomp$20$$ = $newPosY$jscomp$13$$ - $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posY_$;
  $dist$jscomp$5_dx$jscomp$15$$ = Math.sqrt($dist$jscomp$5_dx$jscomp$15$$ * $dist$jscomp$5_dx$jscomp$15$$ + $dy$jscomp$20$$ * $dy$jscomp$20$$);
  $ds$jscomp$2_dur$jscomp$4$$ = $animate$jscomp$12$$ ? 250 * Math.min(1, Math.max(0.01 * $dist$jscomp$5_dx$jscomp$15$$, Math.abs($ds$jscomp$2_dur$jscomp$4$$))) : 0;
  if (16 < $ds$jscomp$2_dur$jscomp$4$$ && $animate$jscomp$12$$) {
    var $scaleFunc$jscomp$2$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$scale_$, $newScale$jscomp$13$$), $xFunc$jscomp$2$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posX_$, $newPosX$jscomp$13$$), $yFunc$jscomp$2$$ = _.$numeric$$module$src$transition$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posY_$, 
    $newPosY$jscomp$13$$);
    return _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$(_.$Animation$$module$src$animation$animate$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$content_$, function($newScale$jscomp$13$$) {
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$scale_$ = $scaleFunc$jscomp$2$$($newScale$jscomp$13$$);
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posX_$ = $xFunc$jscomp$2$$($newScale$jscomp$13$$);
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posY_$ = $yFunc$jscomp$2$$($newScale$jscomp$13$$);
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$);
    }, $ds$jscomp$2_dur$jscomp$4$$, $PAN_ZOOM_CURVE_$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom$$), function() {
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$scale_$ = $newScale$jscomp$13$$;
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posX_$ = $newPosX$jscomp$13$$;
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posY_$ = $newPosY$jscomp$13$$;
      $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$);
    });
  }
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$scale_$ = $newScale$jscomp$13$$;
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posX_$ = $newPosX$jscomp$13$$;
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$.$posY_$ = $newPosY$jscomp$13$$;
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoom_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$self$$);
}, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$$ = function($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$) {
  var $newScale$jscomp$14$$ = _.$clamp$$module$src$utils$math$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$scale_$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$minScale_$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$maxScale_$);
  $newScale$jscomp$14$$ != $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$scale_$ && $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$, $newScale$jscomp$14$$);
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$, $newScale$jscomp$14$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$posX_$ / 
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$scale_$ * $newScale$jscomp$14$$, !1), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$posY_$ / $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$scale_$ * 
  $newScale$jscomp$14$$, !1), !0).then(function() {
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$startScale_$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$scale_$;
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$startX_$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$posX_$;
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$startY_$ = $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$posY_$;
    var $newScale$jscomp$14$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$win$, "amp-pan-zoom.transformEnd", _.$dict$$module$src$utils$object$$({scale:$JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$scale_$, x:$JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$posX_$, 
    y:$JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$posY_$}));
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.$action_$.$trigger$($JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.element, "transformEnd", $newScale$jscomp$14$$, 100);
    $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$release_$self$$.element.$D$("transformEnd");
  });
};
var $PAN_ZOOM_CURVE_$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom$$ = _.$bezierCurve$$module$src$curve$$(0.4, 0, 0.2, 1.4);
_.$$jscomp$inherits$$($AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$785$$ = this;
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.element);
  var $children$jscomp$141$$ = this.$getRealChildren$();
  this.element.classList.add("i-amphtml-pan-zoom");
  this.$content_$ = $children$jscomp$141$$[0];
  this.$content_$.classList.add("i-amphtml-pan-zoom-child");
  this.$maxScale_$ = $JSCompiler_StaticMethods_getNumberAttributeOr_$$(this, "max-scale", 3);
  this.$initialScale_$ = $JSCompiler_StaticMethods_getNumberAttributeOr_$$(this, "initial-scale", 1);
  this.$initialX_$ = $JSCompiler_StaticMethods_getNumberAttributeOr_$$(this, "initial-x", 0);
  this.$initialY_$ = $JSCompiler_StaticMethods_getNumberAttributeOr_$$(this, "initial-y", 0);
  this.$resetOnResize_$ = this.element.hasAttribute("reset-on-resize");
  this.$disableDoubleTap_$ = this.element.hasAttribute("disable-double-tap");
  _.$JSCompiler_StaticMethods_registerAction$$(this, "transform", function($children$jscomp$141$$) {
    if ($children$jscomp$141$$ = $children$jscomp$141$$.args) {
      return $$jscomp$this$jscomp$785$$.transform($children$jscomp$141$$.x || 0, $children$jscomp$141$$.y || 0, $children$jscomp$141$$.scale || 1);
    }
  });
};
_.$JSCompiler_prototypeAlias$$.transform = function($x$jscomp$99$$, $y$jscomp$76$$, $scale$jscomp$7$$) {
  var $$jscomp$this$jscomp$786$$ = this;
  $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$updatePanZoomBounds_$$(this, $scale$jscomp$7$$);
  return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$set_$$(this, $scale$jscomp$7$$, $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundX_$$(this, $x$jscomp$99$$, !1), $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$boundY_$$(this, $y$jscomp$76$$, !1), !0).then(function() {
    return $JSCompiler_StaticMethods_AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom_prototype$onZoomRelease_$$($$jscomp$this$jscomp$786$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$onMeasureChanged$ = function() {
  this.$resetOnResize_$ && $JSCompiler_StaticMethods_resetContentDimensions_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  $JSCompiler_StaticMethods_createZoomButton_$$(this);
  return $JSCompiler_StaticMethods_resetContentDimensions_$$(this).then($JSCompiler_StaticMethods_setupEvents_$$(this));
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  $JSCompiler_StaticMethods_cleanupEvents_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  this.$content_$ && this.$scheduleLayout$(this.$content_$);
  $JSCompiler_StaticMethods_setupEvents_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  $JSCompiler_StaticMethods_cleanupEvents_$$(this);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$83$$) {
  return "fixed" == $layout$jscomp$83$$ || "fixed-height" == $layout$jscomp$83$$ || "fill" == $layout$jscomp$83$$ || "responsive" == $layout$jscomp$83$$;
};
_.$JSCompiler_prototypeAlias$$.$unlisten_$ = function($handle$jscomp$11$$) {
  $handle$jscomp$11$$ && $handle$jscomp$11$$();
};
window.self.AMP.registerElement("amp-pan-zoom", $AmpPanZoom$$module$extensions$amp_pan_zoom$0_1$amp_pan_zoom$$, ".i-amphtml-pan-zoom{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.i-amphtml-pan-zoom-child{position:absolute}.i-amphtml-pan-zoom-scrollable{cursor:all-scroll}.amp-pan-zoom-button{position:absolute;right:12px;width:36px;height:36px;bottom:12px;background-repeat:no-repeat;background-position:50%;box-shadow:1px 1px 2px;background-color:#fff;border-radius:3px}.amp-pan-zoom-in-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg height='24' width='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")}.amp-pan-zoom-out-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg height='24' width='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 13H5v-2h14z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")}\n/*# sourceURL=/extensions/amp-pan-zoom/0.1/amp-pan-zoom.css*/");

})});
