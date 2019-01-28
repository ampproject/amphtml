(self.AMP=self.AMP||[]).push({n:"amp-iframe",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$ = function($$jscomp$super$this$jscomp$58_element$jscomp$434$$) {
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$58_element$jscomp$434$$) || this;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$placeholder_$ = null;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$isClickToPlay_$ = !1;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$isAdLike_$ = !1;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$isTrackingFrame_$ = !1;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$isDisallowedAsAd_$ = !1;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$iframeLayoutBox_$ = null;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$isResizable_$ = !1;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$intersectionObserverApi_$ = null;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$sandbox_$ = "";
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$iframeSrc$ = null;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$container_$ = null;
  $$jscomp$super$this$jscomp$58_element$jscomp$434$$.$targetOrigin_$ = null;
  return $$jscomp$super$this$jscomp$58_element$jscomp$434$$;
}, $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$$ = function($JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$self_urlService$jscomp$5$$, $src$jscomp$39$$) {
  var $containerSrc$$ = window.location.href;
  $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$self_urlService$jscomp$5$$ = _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$self_urlService$jscomp$5$$.element);
  $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$self_urlService$jscomp$5$$.parse($src$jscomp$39$$);
  $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$self_urlService$jscomp$5$$.parse($containerSrc$$);
  return $src$jscomp$39$$;
}, $JSCompiler_StaticMethods_transformSrc_$$ = function($$jscomp$destructuring$var410_JSCompiler_StaticMethods_transformSrc_$self$$, $src$jscomp$40$$) {
  if ($src$jscomp$40$$) {
    $$jscomp$destructuring$var410_JSCompiler_StaticMethods_transformSrc_$self$$ = _.$Services$$module$src$services$urlForDoc$$($$jscomp$destructuring$var410_JSCompiler_StaticMethods_transformSrc_$self$$.element).parse($src$jscomp$40$$);
    var $hash$jscomp$15$$ = $$jscomp$destructuring$var410_JSCompiler_StaticMethods_transformSrc_$self$$.hash;
    return "data:" == $$jscomp$destructuring$var410_JSCompiler_StaticMethods_transformSrc_$self$$.protocol || $hash$jscomp$15$$ && "#" != $hash$jscomp$15$$ ? $src$jscomp$40$$ : _.$removeFragment$$module$src$url$$($src$jscomp$40$$) + "#amp=1";
  }
}, $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$$ = function($JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$self$$) {
  if ($JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$self$$.$iframe_$) {
    var $iframeBox$jscomp$5$$ = $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$self$$.$getViewport$().$getLayoutRect$($JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$self$$.$iframe_$), $box$jscomp$17$$ = $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$self$$.$getLayoutBox$();
    $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$self$$.$iframeLayoutBox_$ = _.$moveLayoutRect$$module$src$layout_rect$$($iframeBox$jscomp$5$$, -$box$jscomp$17$$.left, -$box$jscomp$17$$.top);
  }
}, $JSCompiler_StaticMethods_registerIframeMessaging_$$ = function($JSCompiler_StaticMethods_registerIframeMessaging_$self$$) {
  if (_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$win$, "iframe-messaging")) {
    var $element$jscomp$437$$ = $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.element, $src$jscomp$42$$ = $element$jscomp$437$$.getAttribute("src");
    $src$jscomp$42$$ && ($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$ = _.$Services$$module$src$services$urlForDoc$$($element$jscomp$437$$).parse($src$jscomp$42$$).origin);
    _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$, "postMessage", function($element$jscomp$437$$) {
      $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$ ? $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$iframe_$.contentWindow.postMessage($element$jscomp$437$$.args, $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$) : _.$user$$module$src$log$$().error("amp-iframe", '"postMessage" action is only allowed with "src"attribute with an origin.');
    }, 100);
    if ($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$) {
      var $unexpectedMessages$$ = 0, $listener$jscomp$85$$ = function($element$jscomp$437$$) {
        if ($element$jscomp$437$$.source === $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$iframe_$.contentWindow) {
          if ($element$jscomp$437$$.origin !== $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$) {
            _.$user$$module$src$log$$().error("amp-iframe", '"message" received from unexpected origin: ' + $element$jscomp$437$$.origin + ". Only allowed from: " + $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$targetOrigin_$);
          } else {
            if ($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$getAmpDoc$().getRootNode().activeElement !== $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$iframe_$) {
              var $src$jscomp$42$$ = !1;
            } else {
              $src$jscomp$42$$ = $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$win$.document.createElement("audio"), $src$jscomp$42$$.play(), $src$jscomp$42$$ = $src$jscomp$42$$.paused ? !1 : !0;
            }
            if ($src$jscomp$42$$) {
              $element$jscomp$437$$ = $element$jscomp$437$$.data;
              try {
                var $e$jscomp$224_unsanitized$$ = _.$parseJson$$module$src$json$$(JSON.stringify($element$jscomp$437$$));
              } catch ($e$258$$) {
                _.$user$$module$src$log$$().error("amp-iframe", 'Data from "message" event must be JSON.');
                return;
              }
              $e$jscomp$224_unsanitized$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$win$, "amp-iframe:message", _.$dict$$module$src$utils$object$$({data:$e$jscomp$224_unsanitized$$}));
              _.$Services$$module$src$services$actionServiceForDoc$$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.element).$trigger$($JSCompiler_StaticMethods_registerIframeMessaging_$self$$.element, "message", $e$jscomp$224_unsanitized$$, 100);
            } else {
              $unexpectedMessages$$++, _.$user$$module$src$log$$().error("amp-iframe", '"message" event may only be triggered from a user gesture.'), 10 <= $unexpectedMessages$$ && (_.$user$$module$src$log$$().error("amp-iframe", 'Too many non-gesture-triggered "message" events; detaching event listener.'), $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$win$.removeEventListener("message", $listener$jscomp$85$$));
            }
          }
        }
      };
      $JSCompiler_StaticMethods_registerIframeMessaging_$self$$.$win$.addEventListener("message", $listener$jscomp$85$$);
    }
  }
}, $adSizes$$module$src$iframe_helper$$ = [[300, 250], [320, 50], [300, 50], [320, 100]], $ATTRIBUTES_TO_PROPAGATE$$module$extensions$amp_iframe$0_1$amp_iframe$$ = "allowfullscreen allowpaymentrequest allowtransparency allow frameborder referrerpolicy scrolling".split(" "), $count$$module$extensions$amp_iframe$0_1$amp_iframe$$ = 0, $trackingIframeCount$$module$extensions$amp_iframe$0_1$amp_iframe$$ = 0;
_.$$jscomp$inherits$$($AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$66$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$66$$);
};
_.$JSCompiler_prototypeAlias$$.$firstAttachedCallback$ = function() {
  this.$sandbox_$ = this.element.getAttribute("sandbox");
  var $JSCompiler_temp$jscomp$761_srcdoc$jscomp$inline_3368$$;
  ($JSCompiler_temp$jscomp$761_srcdoc$jscomp$inline_3368$$ = $JSCompiler_StaticMethods_transformSrc_$$(this, this.element.getAttribute("src"))) || ($JSCompiler_temp$jscomp$761_srcdoc$jscomp$inline_3368$$ = ($JSCompiler_temp$jscomp$761_srcdoc$jscomp$inline_3368$$ = this.element.getAttribute("srcdoc")) ? "data:text/html;charset=utf-8;base64," + (0,window.btoa)(_.$bytesToString$$module$src$utils$bytes$$(_.$utf8Encode$$module$src$utils$bytes$$($JSCompiler_temp$jscomp$761_srcdoc$jscomp$inline_3368$$))) : 
  void 0);
  this.$iframeSrc$ = $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$$(this, $JSCompiler_temp$jscomp$761_srcdoc$jscomp$inline_3368$$);
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$5$$) {
  this.$iframeSrc$ && this.$preconnect$.url(this.$iframeSrc$, $onLayout$jscomp$5$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$placeholder_$ = this.$getPlaceholder$();
  this.$isClickToPlay_$ = !!this.$placeholder_$;
  (this.$isResizable_$ = this.element.hasAttribute("resizable")) && this.element.setAttribute("scrolling", "no");
  this.element.hasAttribute("frameborder") || this.element.setAttribute("frameborder", "0");
  var $JSCompiler_inline_result$jscomp$763_element$jscomp$inline_3370$$ = this.element;
  if ("no" != $JSCompiler_inline_result$jscomp$763_element$jscomp$inline_3370$$.getAttribute("scrolling")) {
    var $wrapper$jscomp$inline_3371$$ = $JSCompiler_inline_result$jscomp$763_element$jscomp$inline_3370$$.ownerDocument.createElement("i-amphtml-scroll-container");
    $JSCompiler_inline_result$jscomp$763_element$jscomp$inline_3370$$.appendChild($wrapper$jscomp$inline_3371$$);
    $JSCompiler_inline_result$jscomp$763_element$jscomp$inline_3370$$ = $wrapper$jscomp$inline_3371$$;
  }
  this.$container_$ = $JSCompiler_inline_result$jscomp$763_element$jscomp$inline_3370$$;
  $JSCompiler_StaticMethods_registerIframeMessaging_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$$(this);
  var $element$jscomp$436$$ = this.element;
  a: {
    var $$jscomp$inline_3374_width$jscomp$inline_3376$$ = $element$jscomp$436$$.$getLayoutBox$();
    var $JSCompiler_inline_result$jscomp$758_height$jscomp$inline_3375$$ = $$jscomp$inline_3374_width$jscomp$inline_3376$$.height;
    $$jscomp$inline_3374_width$jscomp$inline_3376$$ = $$jscomp$inline_3374_width$jscomp$inline_3376$$.width;
    for (var $i$jscomp$inline_3377$$ = 0; $i$jscomp$inline_3377$$ < $adSizes$$module$src$iframe_helper$$.length; $i$jscomp$inline_3377$$++) {
      var $refWidth$jscomp$inline_3378$$ = $adSizes$$module$src$iframe_helper$$[$i$jscomp$inline_3377$$][0], $refHeight$jscomp$inline_3379$$ = $adSizes$$module$src$iframe_helper$$[$i$jscomp$inline_3377$$][1];
      if (!($refHeight$jscomp$inline_3379$$ > $JSCompiler_inline_result$jscomp$758_height$jscomp$inline_3375$$ || $refWidth$jscomp$inline_3378$$ > $$jscomp$inline_3374_width$jscomp$inline_3376$$) && 20 >= $JSCompiler_inline_result$jscomp$758_height$jscomp$inline_3375$$ - $refHeight$jscomp$inline_3379$$ && 20 >= $$jscomp$inline_3374_width$jscomp$inline_3376$$ - $refWidth$jscomp$inline_3378$$) {
        $JSCompiler_inline_result$jscomp$758_height$jscomp$inline_3375$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$758_height$jscomp$inline_3375$$ = !1;
  }
  this.$isAdLike_$ = $JSCompiler_inline_result$jscomp$758_height$jscomp$inline_3375$$;
  this.$isTrackingFrame_$ = _.$looksLikeTrackingIframe$$module$src$iframe_helper$$(this.element);
  this.$isDisallowedAsAd_$ = this.$isAdLike_$ && !_.$isAdPositionAllowed$$module$src$ad_helper$$($element$jscomp$436$$, this.$win$);
  this.$intersectionObserverApi_$ && this.$intersectionObserverApi_$.$fire$();
};
_.$JSCompiler_prototypeAlias$$.$getIntersectionElementLayoutBox$ = function() {
  if (!this.$iframe_$) {
    return window.AMP.BaseElement.prototype.$getIntersectionElementLayoutBox$.call(this);
  }
  var $box$jscomp$18$$ = this.$getLayoutBox$();
  this.$iframeLayoutBox_$ || $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$measureIframeLayoutBox_$$(this);
  return _.$moveLayoutRect$$module$src$layout_rect$$(this.$iframeLayoutBox_$, $box$jscomp$18$$.left, $box$jscomp$18$$.top);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$642$$ = this;
  this.$isClickToPlay_$ || (this.element.$getLayoutBox$(), this.$getViewport$().$getSize$());
  if (!this.$iframeSrc$) {
    return window.Promise.resolve();
  }
  if (this.$isTrackingFrame_$ && ($trackingIframeCount$$module$extensions$amp_iframe$0_1$amp_iframe$$++, 1 < $trackingIframeCount$$module$extensions$amp_iframe$0_1$amp_iframe$$)) {
    return window.console.error("Only 1 analytics/tracking iframe allowed per page. Please use amp-analytics instead or file a GitHub issue for your use case: https://github.com/ampproject/amphtml/issues/new"), window.Promise.resolve();
  }
  var $iframe$jscomp$59$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$59$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$59$$);
  $iframe$jscomp$59$$.name = "amp_iframe" + $count$$module$extensions$amp_iframe$0_1$amp_iframe$$++;
  this.$isClickToPlay_$ && _.$setStyle$$module$src$style$$($iframe$jscomp$59$$, "zIndex", -1);
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $ATTRIBUTES_TO_PROPAGATE$$module$extensions$amp_iframe$0_1$amp_iframe$$, $iframe$jscomp$59$$);
  $iframe$jscomp$59$$.setAttribute("sandbox", this.$sandbox_$ || "");
  $iframe$jscomp$59$$.src = this.$iframeSrc$;
  this.$isTrackingFrame_$ || (this.$intersectionObserverApi_$ = new _.$IntersectionObserverApi$$module$src$intersection_observer_polyfill$$(this, $iframe$jscomp$59$$));
  $iframe$jscomp$59$$.onload = function() {
    $iframe$jscomp$59$$.readyState = "complete";
    $$jscomp$this$jscomp$642$$.$activateIframe_$();
    $$jscomp$this$jscomp$642$$.$isTrackingFrame_$ && ($$jscomp$this$jscomp$642$$.$iframeSrc$ = null, _.$Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$642$$.$win$).$promise$(5000).then(function() {
      _.$removeElement$$module$src$dom$$($iframe$jscomp$59$$);
      $$jscomp$this$jscomp$642$$.element.setAttribute("amp-removed", "");
      $$jscomp$this$jscomp$642$$.$iframe_$ = null;
    }));
  };
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$59$$, "embed-size", function($iframe$jscomp$59$$) {
    $$jscomp$this$jscomp$642$$.$updateSize_$($iframe$jscomp$59$$.height, $iframe$jscomp$59$$.width);
  });
  this.$isClickToPlay_$ && _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$59$$, "embed-ready", this.$activateIframe_$.bind(this));
  this.$container_$.appendChild($iframe$jscomp$59$$);
  return this.$loadPromise$($iframe$jscomp$59$$).then(function() {
    $$jscomp$this$jscomp$642$$.$container_$ != $$jscomp$this$jscomp$642$$.element && _.$Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$642$$.$win$).delay(function() {
      $$jscomp$this$jscomp$642$$.$mutateElement$(function() {
        $$jscomp$this$jscomp$642$$.$container_$.classList.add("amp-active");
      });
    }, 1000);
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$placeholder_$ && this.$togglePlaceholder$(!0), this.$iframe_$ = null, this.$intersectionObserverApi_$ && (this.$intersectionObserverApi_$.$destroy$(), this.$intersectionObserverApi_$ = null));
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$19$$) {
  this.$intersectionObserverApi_$ && this.$intersectionObserverApi_$.$onViewportCallback$($inViewport$jscomp$19$$);
};
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return this.$isAdLike_$ ? 2 : this.$isTrackingFrame_$ ? 1 : window.AMP.BaseElement.prototype.$getLayoutPriority$.call(this);
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$10_src$jscomp$41$$) {
  $mutations$jscomp$10_src$jscomp$41$$ = $mutations$jscomp$10_src$jscomp$41$$.src;
  void 0 !== $mutations$jscomp$10_src$jscomp$41$$ && (this.$iframeSrc$ = $JSCompiler_StaticMethods_transformSrc_$$(this, $mutations$jscomp$10_src$jscomp$41$$), this.$iframe_$ && (this.$iframe_$.src = $JSCompiler_StaticMethods_AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe_prototype$assertSource_$$(this, this.$iframeSrc$)));
};
_.$JSCompiler_prototypeAlias$$.$activateIframe_$ = function() {
  var $$jscomp$this$jscomp$643$$ = this;
  this.$placeholder_$ && _.$JSCompiler_StaticMethods_getVsync$$(this).$mutate$(function() {
    $$jscomp$this$jscomp$643$$.$iframe_$ && (_.$setStyle$$module$src$style$$($$jscomp$this$jscomp$643$$.$iframe_$, "zIndex", 0), $$jscomp$this$jscomp$643$$.$togglePlaceholder$(!1));
  });
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$throwIfCannotNavigate$ = function() {
  if (!/\sallow-top-navigation\s/i.test(" " + this.$sandbox_$ + " ")) {
    throw _.$user$$module$src$log$$().$createError$('"AMP.navigateTo" is only allowed on <amp-iframe> when its "sandbox" attribute contains "allow-top-navigation".');
  }
};
_.$JSCompiler_prototypeAlias$$.$updateSize_$ = function($height$jscomp$42$$, $width$jscomp$47$$) {
  var $$jscomp$this$jscomp$644$$ = this;
  if (this.$isResizable_$) {
    if (100 > $height$jscomp$42$$) {
      this.$user$().error("amp-iframe", "Ignoring embed-size request because the resize height is less than 100px. If you are using amp-iframe to display ads, consider using amp-ad instead.", this.element);
    } else {
      var $newHeight$jscomp$14$$, $newWidth$jscomp$10$$;
      $height$jscomp$42$$ = (0,window.parseInt)($height$jscomp$42$$, 10);
      (0,window.isNaN)($height$jscomp$42$$) || ($newHeight$jscomp$14$$ = Math.max($height$jscomp$42$$ + (this.element.offsetHeight - this.$iframe_$.offsetHeight), $height$jscomp$42$$));
      $width$jscomp$47$$ = (0,window.parseInt)($width$jscomp$47$$, 10);
      (0,window.isNaN)($width$jscomp$47$$) || ($newWidth$jscomp$10$$ = Math.max($width$jscomp$47$$ + (this.element.offsetWidth - this.$iframe_$.offsetWidth), $width$jscomp$47$$));
      void 0 !== $newHeight$jscomp$14$$ || void 0 !== $newWidth$jscomp$10$$ ? this.$attemptChangeSize$($newHeight$jscomp$14$$, $newWidth$jscomp$10$$).then(function() {
        void 0 !== $newHeight$jscomp$14$$ && $$jscomp$this$jscomp$644$$.element.setAttribute("height", $newHeight$jscomp$14$$);
        void 0 !== $newWidth$jscomp$10$$ && $$jscomp$this$jscomp$644$$.element.setAttribute("width", $newWidth$jscomp$10$$);
      }, function() {
      }) : this.$user$().error("amp-iframe", "Ignoring embed-size request because no width or height value is provided", this.element);
    }
  } else {
    this.$user$().error("amp-iframe", "Ignoring embed-size request because this iframe is not resizable", this.element);
  }
};
window.self.AMP.registerElement("amp-iframe", $AmpIframe$$module$extensions$amp_iframe$0_1$amp_iframe$$);

})});
