(self.AMP=self.AMP||[]).push({n:"amp-sticky-ad",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $AmpStickyAd$$module$extensions$amp_sticky_ad$1_0$amp_sticky_ad$$ = function($$jscomp$super$this$jscomp$96_element$jscomp$549$$) {
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$96_element$jscomp$549$$) || this;
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$.$vsync_$ = _.$JSCompiler_StaticMethods_getVsync$$($$jscomp$super$this$jscomp$96_element$jscomp$549$$);
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$.$ad_$ = null;
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$.$viewport_$ = null;
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$.$visible_$ = !1;
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$.$scrollUnlisten_$ = null;
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$.$collapsed_$ = !1;
  $$jscomp$super$this$jscomp$96_element$jscomp$549$$.$adReadyPromise_$ = null;
  return $$jscomp$super$this$jscomp$96_element$jscomp$549$$;
}, $JSCompiler_StaticMethods_removeOnScrollListener_$$ = function($JSCompiler_StaticMethods_removeOnScrollListener_$self$$) {
  $JSCompiler_StaticMethods_removeOnScrollListener_$self$$.$scrollUnlisten_$ && ($JSCompiler_StaticMethods_removeOnScrollListener_$self$$.$scrollUnlisten_$(), $JSCompiler_StaticMethods_removeOnScrollListener_$self$$.$scrollUnlisten_$ = null);
}, $JSCompiler_StaticMethods_display_$$ = function($JSCompiler_StaticMethods_display_$self$$) {
  $JSCompiler_StaticMethods_removeOnScrollListener_$$($JSCompiler_StaticMethods_display_$self$$);
  $JSCompiler_StaticMethods_display_$self$$.$adReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_display_$self$$.$mutateElement$(function() {
      $JSCompiler_StaticMethods_display_$self$$.$collapsed_$ || ($JSCompiler_StaticMethods_display_$self$$.$visible_$ = !0, $JSCompiler_StaticMethods_addCloseButton_$$($JSCompiler_StaticMethods_display_$self$$), _.$JSCompiler_StaticMethods_addToFixedLayer$$($JSCompiler_StaticMethods_display_$self$$.$viewport_$, $JSCompiler_StaticMethods_display_$self$$.element, !0).then(function() {
        return $JSCompiler_StaticMethods_scheduleLayoutForAd_$$($JSCompiler_StaticMethods_display_$self$$);
      }));
    });
  });
}, $JSCompiler_StaticMethods_scheduleLayoutForAd_$$ = function($JSCompiler_StaticMethods_scheduleLayoutForAd_$self$$) {
  _.$whenUpgradedToCustomElement$$module$src$dom$$($JSCompiler_StaticMethods_scheduleLayoutForAd_$self$$.$ad_$).then(function($ad$jscomp$5$$) {
    $ad$jscomp$5$$.$K$().then($JSCompiler_StaticMethods_scheduleLayoutForAd_$self$$.$layoutAd_$.bind($JSCompiler_StaticMethods_scheduleLayoutForAd_$self$$));
  });
}, $JSCompiler_StaticMethods_addCloseButton_$$ = function($JSCompiler_StaticMethods_addCloseButton_$self$$) {
  var $closeButton$jscomp$1$$ = $JSCompiler_StaticMethods_addCloseButton_$self$$.$win$.document.createElement("button");
  $closeButton$jscomp$1$$.classList.add("amp-sticky-ad-close-button");
  $closeButton$jscomp$1$$.setAttribute("aria-label", $JSCompiler_StaticMethods_addCloseButton_$self$$.element.getAttribute("data-close-button-aria-label") || "Close this ad");
  var $boundOnCloseButtonClick$$ = $JSCompiler_StaticMethods_addCloseButton_$self$$.$onCloseButtonClick_$.bind($JSCompiler_StaticMethods_addCloseButton_$self$$);
  $closeButton$jscomp$1$$.addEventListener("click", $boundOnCloseButtonClick$$);
  $JSCompiler_StaticMethods_addCloseButton_$self$$.element.appendChild($closeButton$jscomp$1$$);
};
_.$BaseElement$$module$src$base_element$$.prototype.$scheduleUnlayout$ = _.$JSCompiler_unstubMethod$$(18, function($elements$jscomp$7$$) {
  this.element.$getResources$().$scheduleUnlayout$(this.element, $elements$jscomp$7$$);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$scheduleUnlayout$ = _.$JSCompiler_unstubMethod$$(17, function($parentElement$jscomp$3_parentResource$jscomp$2$$, $subElements$jscomp$3$$) {
  $parentElement$jscomp$3_parentResource$jscomp$2$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($parentElement$jscomp$3_parentResource$jscomp$2$$);
  $subElements$jscomp$3$$ = _.$elements_$$module$src$service$resources_impl$$($subElements$jscomp$3$$);
  _.$JSCompiler_StaticMethods_discoverResourcesForArray_$$(this, $parentElement$jscomp$3_parentResource$jscomp$2$$, $subElements$jscomp$3$$, function($parentElement$jscomp$3_parentResource$jscomp$2$$) {
    _.$JSCompiler_StaticMethods_unlayout$$($parentElement$jscomp$3_parentResource$jscomp$2$$);
  });
});
_.$$jscomp$inherits$$($AmpStickyAd$$module$extensions$amp_sticky_ad$1_0$amp_sticky_ad$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpStickyAd$$module$extensions$amp_sticky_ad$1_0$amp_sticky_ad$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$850$$ = this;
  this.$viewport_$ = this.$getViewport$();
  this.element.classList.add("i-amphtml-sticky-ad-layout");
  this.$ad_$ = this.$getRealChildren$()[0];
  _.$Resource$$module$src$service$resource$setOwner$$(this.$ad_$, this.element);
  this.$adReadyPromise_$ = _.$whenUpgradedToCustomElement$$module$src$dom$$(this.$ad_$).then(function($$jscomp$this$jscomp$850$$) {
    return $$jscomp$this$jscomp$850$$.$K$();
  }).then(function() {
    return $$jscomp$this$jscomp$850$$.$mutateElement$(function() {
      _.$toggle$$module$src$style$$($$jscomp$this$jscomp$850$$.element, !0);
    });
  });
  var $paddingBar$jscomp$1$$ = this.$win$.document.createElement("amp-sticky-ad-top-padding");
  $paddingBar$jscomp$1$$.classList.add("amp-sticky-ad-top-padding");
  this.element.insertBefore($paddingBar$jscomp$1$$, this.$ad_$);
  this.$win$.setTimeout(function() {
    $$jscomp$this$jscomp$850$$.$scrollUnlisten_$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($$jscomp$this$jscomp$850$$.$viewport_$, function() {
      1 < _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($$jscomp$this$jscomp$850$$.$viewport_$) && $JSCompiler_StaticMethods_display_$$($$jscomp$this$jscomp$850$$);
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  this.$visible_$ && (_.$toggle$$module$src$style$$(this.element, !0), _.$JSCompiler_StaticMethods_updatePaddingBottom$$(this.$viewport_$, this.element.offsetHeight), this.$updateInViewport$(this.$ad_$, !0), this.$scheduleLayout$(this.$ad_$));
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$isAlwaysFixed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  _.$JSCompiler_StaticMethods_updatePaddingBottom$$(this.$viewport_$, 0);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.detachedCallback = function() {
  $JSCompiler_StaticMethods_removeOnScrollListener_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$collapsedCallback$ = function() {
  var $$jscomp$this$jscomp$851$$ = this;
  this.$collapsed_$ = !0;
  this.$visible_$ = !1;
  _.$toggle$$module$src$style$$(this.element, !1);
  this.$vsync_$.$mutate$(function() {
    _.$JSCompiler_StaticMethods_updatePaddingBottom$$($$jscomp$this$jscomp$851$$.$viewport_$, 0);
  });
};
_.$JSCompiler_prototypeAlias$$.$layoutAd_$ = function() {
  var $$jscomp$this$jscomp$854$$ = this, $ad$jscomp$6_signals$jscomp$4$$ = this.$ad_$;
  this.$updateInViewport$($ad$jscomp$6_signals$jscomp$4$$, !0);
  this.$scheduleLayout$($ad$jscomp$6_signals$jscomp$4$$);
  $ad$jscomp$6_signals$jscomp$4$$ = $ad$jscomp$6_signals$jscomp$4$$.signals();
  return window.Promise.race([$ad$jscomp$6_signals$jscomp$4$$.whenSignal("render-start"), $ad$jscomp$6_signals$jscomp$4$$.whenSignal("load-end")]).then(function() {
    var $ad$jscomp$6_signals$jscomp$4$$;
    return $$jscomp$this$jscomp$854$$.$measureElement$(function() {
      $ad$jscomp$6_signals$jscomp$4$$ = _.$computedStyle$$module$src$style$$($$jscomp$this$jscomp$854$$.$win$, $$jscomp$this$jscomp$854$$.element).backgroundColor;
    }).then(function() {
      return _.$JSCompiler_StaticMethods_mutatePromise$$($$jscomp$this$jscomp$854$$.$vsync_$, function() {
        $$jscomp$this$jscomp$854$$.element.setAttribute("visible", "");
        _.$JSCompiler_StaticMethods_updatePaddingBottom$$($$jscomp$this$jscomp$854$$.$viewport_$, $$jscomp$this$jscomp$854$$.element.offsetHeight);
        var $backgroundColor$$ = $ad$jscomp$6_signals$jscomp$4$$.replace(/\(([^,]+),([^,]+),([^,)]+),[^)]+\)/g, "($1,$2,$3, 1)");
        $ad$jscomp$6_signals$jscomp$4$$ != $backgroundColor$$ && (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("AMP-STICKY-AD", "Do not allow container to be semitransparent"), _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$854$$.element, "background-color", $backgroundColor$$));
      });
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$onCloseButtonClick_$ = function() {
  var $$jscomp$this$jscomp$855$$ = this;
  this.$vsync_$.$mutate$(function() {
    $$jscomp$this$jscomp$855$$.$visible_$ = !1;
    $$jscomp$this$jscomp$855$$.$scheduleUnlayout$($$jscomp$this$jscomp$855$$.$ad_$);
    _.$JSCompiler_StaticMethods_removeFromFixedLayer$$($$jscomp$this$jscomp$855$$.$viewport_$, $$jscomp$this$jscomp$855$$.element);
    _.$removeElement$$module$src$dom$$($$jscomp$this$jscomp$855$$.element);
    _.$JSCompiler_StaticMethods_updatePaddingBottom$$($$jscomp$this$jscomp$855$$.$viewport_$, 0);
  });
};
window.self.AMP.registerElement("amp-sticky-ad", $AmpStickyAd$$module$extensions$amp_sticky_ad$1_0$amp_sticky_ad$$, "amp-sticky-ad{position:fixed!important;text-align:center;bottom:0!important;left:0;width:100%!important;z-index:11;max-height:100px!important;box-sizing:border-box;opacity:1!important;background-image:none!important;background-color:#fff;box-shadow:0 0 5px 0 rgba(0,0,0,0.2)!important;margin-bottom:0!important}amp-sticky-ad-top-padding{display:block;width:100%!important;background:#fff;height:4px;max-height:5px!important;z-index:12}.i-amphtml-sticky-ad-layout{display:-webkit-box;display:-ms-flexbox;display:flex;visibility:hidden!important;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;overflow:visible!important;-webkit-transform:translateZ(0)!important;transform:translateZ(0)!important}amp-sticky-ad[visible]{visibility:visible!important}.i-amphtml-sticky-ad-layout>amp-ad{display:block}.amp-sticky-ad-close-button{position:absolute;visibility:hidden;width:28px;height:28px;top:-28px;right:0;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='13' height='13' viewBox='341 8 13 13' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%234F4F4F' d='M354 9.31L352.69 8l-5.19 5.19L342.31 8 341 9.31l5.19 5.19-5.19 5.19 1.31 1.31 5.19-5.19 5.19 5.19 1.31-1.31-5.19-5.19z' fill-rule='evenodd'/%3E%3C/svg%3E\");background-size:13px 13px;background-position:9px;background-color:#fff;background-repeat:no-repeat;box-shadow:0 -1px 1px 0 rgba(0,0,0,0.2);border:none;border-radius:12px 0 0 0}amp-sticky-ad[visible]>.amp-sticky-ad-close-button{visibility:visible}.amp-sticky-ad-close-button:before{position:absolute;content:\"\";top:-20px;right:0;left:-20px;bottom:0}[dir=rtl] .amp-sticky-ad-close-button{right:auto;left:0;border-top-left-radius:0;border-top-right-radius:12px;background-position:6px}[dir=rtl] .amp-sticky-ad-close-button:before{right:-20px;left:0}\n/*# sourceURL=/extensions/amp-sticky-ad/1.0/amp-sticky-ad.css*/");

})});
