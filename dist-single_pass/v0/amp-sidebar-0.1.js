(self.AMP=self.AMP||[]).push({n:"amp-sidebar",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $Toolbar$$module$extensions$amp_sidebar$0_1$toolbar$$ = function($element$jscomp$532$$, $contextElement$$) {
  this.$context_$ = $contextElement$$;
  this.$D$ = $element$jscomp$532$$;
  this.$ampdoc_$ = $contextElement$$.$getAmpDoc$();
  this.$toolbarMedia_$ = this.$D$.getAttribute("toolbar");
  this.$G$ = null;
  this.$F$ = void 0;
  this.$I$ = !1;
  this.$D$.classList.add("amp-sidebar-toolbar-target-hidden");
  $JSCompiler_StaticMethods_buildCallback_$$(this);
}, $JSCompiler_StaticMethods_buildCallback_$$ = function($JSCompiler_StaticMethods_buildCallback_$self$$) {
  $JSCompiler_StaticMethods_buildCallback_$self$$.$G$ = $JSCompiler_StaticMethods_buildCallback_$self$$.$D$.cloneNode(!0);
  var $targetId$jscomp$4$$ = $JSCompiler_StaticMethods_buildCallback_$self$$.$D$.getAttribute("toolbar-target");
  $JSCompiler_StaticMethods_buildCallback_$self$$.$ampdoc_$.$whenReady$().then(function() {
    var $targetElement$jscomp$1$$ = $JSCompiler_StaticMethods_buildCallback_$self$$.$ampdoc_$.getElementById($targetId$jscomp$4$$);
    if ($targetElement$jscomp$1$$) {
      $JSCompiler_StaticMethods_buildCallback_$self$$.$F$ = $targetElement$jscomp$1$$, $JSCompiler_StaticMethods_buildCallback_$self$$.$G$.classList.add("i-amphtml-toolbar"), _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_buildCallback_$self$$.$F$, !1);
    } else {
      throw Error("Could not find the toolbar-target element with an id: " + $targetId$jscomp$4$$);
    }
  });
}, $JSCompiler_StaticMethods_attemptShow_$$ = function($JSCompiler_StaticMethods_attemptShow_$self$$) {
  $JSCompiler_StaticMethods_attemptShow_$self$$.$I$ ? window.Promise.resolve() : $JSCompiler_StaticMethods_attemptShow_$self$$.$context_$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_attemptShow_$self$$.$F$ && (_.$toggle$$module$src$style$$($JSCompiler_StaticMethods_attemptShow_$self$$.$F$, !0), $JSCompiler_StaticMethods_attemptShow_$self$$.$F$.contains($JSCompiler_StaticMethods_attemptShow_$self$$.$G$) || $JSCompiler_StaticMethods_attemptShow_$self$$.$F$.appendChild($JSCompiler_StaticMethods_attemptShow_$self$$.$G$), $JSCompiler_StaticMethods_attemptShow_$self$$.$D$.classList.add("amp-sidebar-toolbar-target-shown"), $JSCompiler_StaticMethods_attemptShow_$self$$.$D$.classList.remove("amp-sidebar-toolbar-target-hidden"), 
    $JSCompiler_StaticMethods_attemptShow_$self$$.$I$ = !0);
  });
}, $JSCompiler_StaticMethods_hideToolbar_$$ = function($JSCompiler_StaticMethods_hideToolbar_$self$$) {
  $JSCompiler_StaticMethods_hideToolbar_$self$$.$I$ && $JSCompiler_StaticMethods_hideToolbar_$self$$.$context_$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_hideToolbar_$self$$.$F$ && (_.$toggle$$module$src$style$$($JSCompiler_StaticMethods_hideToolbar_$self$$.$F$, !1), $JSCompiler_StaticMethods_hideToolbar_$self$$.$D$.classList.add("amp-sidebar-toolbar-target-hidden"), $JSCompiler_StaticMethods_hideToolbar_$self$$.$D$.classList.remove("amp-sidebar-toolbar-target-shown"), $JSCompiler_StaticMethods_hideToolbar_$self$$.$I$ = !1);
  });
}, $AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar$$ = function($$jscomp$super$this$jscomp$90_element$jscomp$533$$) {
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$90_element$jscomp$533$$) || this;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$viewport_$ = null;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$action_$ = null;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$updateFn_$ = null;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$maskElement_$ = null;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$document_$ = $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$win$.document;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$documentElement_$ = $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$document_$.documentElement;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$side_$ = null;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$toolbars_$ = [];
  var $platform$jscomp$13$$ = _.$Services$$module$src$services$platformFor$$($$jscomp$super$this$jscomp$90_element$jscomp$533$$.$win$);
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$isIos_$ = _.$JSCompiler_StaticMethods_isIos$$($platform$jscomp$13$$);
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$isSafari_$ = _.$JSCompiler_StaticMethods_isSafari$$($platform$jscomp$13$$);
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$historyId_$ = -1;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$bottomBarCompensated_$ = !1;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$openerElement_$ = null;
  $$jscomp$super$this$jscomp$90_element$jscomp$533$$.$initialScrollTop_$ = 0;
  return $$jscomp$super$this$jscomp$90_element$jscomp$533$$;
}, $JSCompiler_StaticMethods_isOpen_$$ = function($JSCompiler_StaticMethods_isOpen_$self$$) {
  return $JSCompiler_StaticMethods_isOpen_$self$$.element.hasAttribute("open");
}, $JSCompiler_StaticMethods_setUpdateFn_$$ = function($JSCompiler_StaticMethods_setUpdateFn_$self$$, $updateFn$$, $delay$jscomp$15$$) {
  function $runUpdate$$() {
    $JSCompiler_StaticMethods_setUpdateFn_$self$$.$updateFn_$ === $updateFn$$ && $JSCompiler_StaticMethods_setUpdateFn_$self$$.$mutateElement$($updateFn$$);
  }
  $JSCompiler_StaticMethods_setUpdateFn_$self$$.$updateFn_$ = $updateFn$$;
  $delay$jscomp$15$$ ? _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_setUpdateFn_$self$$.$win$).delay($runUpdate$$, $delay$jscomp$15$$) : $runUpdate$$();
}, $JSCompiler_StaticMethods_updateForPreOpening_$$ = function($JSCompiler_StaticMethods_updateForPreOpening_$self$$) {
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_updateForPreOpening_$self$$.element, !0);
  _.$JSCompiler_StaticMethods_addToFixedLayer$$($JSCompiler_StaticMethods_updateForPreOpening_$self$$.$viewport_$, $JSCompiler_StaticMethods_updateForPreOpening_$self$$.element, !0);
  $JSCompiler_StaticMethods_updateForPreOpening_$self$$.$isIos_$ && $JSCompiler_StaticMethods_updateForPreOpening_$self$$.$isSafari_$ && $JSCompiler_StaticMethods_compensateIosBottombar_$$($JSCompiler_StaticMethods_updateForPreOpening_$self$$);
  $JSCompiler_StaticMethods_updateForPreOpening_$self$$.element.scrollTop = 1;
  $JSCompiler_StaticMethods_setUpdateFn_$$($JSCompiler_StaticMethods_updateForPreOpening_$self$$, function() {
    return $JSCompiler_StaticMethods_updateForOpening_$$($JSCompiler_StaticMethods_updateForPreOpening_$self$$);
  });
}, $JSCompiler_StaticMethods_updateForOpening_$$ = function($JSCompiler_StaticMethods_updateForOpening_$self$$) {
  $JSCompiler_StaticMethods_openMask_$$($JSCompiler_StaticMethods_updateForOpening_$self$$);
  $JSCompiler_StaticMethods_updateForOpening_$self$$.element.setAttribute("open", "");
  $JSCompiler_StaticMethods_updateForOpening_$self$$.element.setAttribute("aria-hidden", "false");
  $JSCompiler_StaticMethods_setUpdateFn_$$($JSCompiler_StaticMethods_updateForOpening_$self$$, function() {
    var $children$jscomp$inline_3994$$ = $JSCompiler_StaticMethods_updateForOpening_$self$$.$getRealChildren$();
    $JSCompiler_StaticMethods_updateForOpening_$self$$.$scheduleLayout$($children$jscomp$inline_3994$$);
    $JSCompiler_StaticMethods_updateForOpening_$self$$.$scheduleResume$($children$jscomp$inline_3994$$);
    _.$tryFocus$$module$src$dom$$($JSCompiler_StaticMethods_updateForOpening_$self$$.element);
    $JSCompiler_StaticMethods_AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$triggerEvent_$$($JSCompiler_StaticMethods_updateForOpening_$self$$, "sidebarOpen");
  }, 350);
}, $JSCompiler_StaticMethods_updateForClosing_$$ = function($JSCompiler_StaticMethods_updateForClosing_$self$$) {
  $JSCompiler_StaticMethods_updateForClosing_$self$$.$maskElement_$ && $JSCompiler_StaticMethods_updateForClosing_$self$$.$maskElement_$.classList.toggle("i-amphtml-ghost", !0);
  $JSCompiler_StaticMethods_updateForClosing_$self$$.element.removeAttribute("open");
  $JSCompiler_StaticMethods_updateForClosing_$self$$.element.setAttribute("aria-hidden", "true");
  $JSCompiler_StaticMethods_setUpdateFn_$$($JSCompiler_StaticMethods_updateForClosing_$self$$, function() {
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_updateForClosing_$self$$.element, !1);
    $JSCompiler_StaticMethods_updateForClosing_$self$$.$schedulePause$($JSCompiler_StaticMethods_updateForClosing_$self$$.$getRealChildren$());
    $JSCompiler_StaticMethods_AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$triggerEvent_$$($JSCompiler_StaticMethods_updateForClosing_$self$$, "sidebarClose");
  }, 350);
}, $JSCompiler_StaticMethods_setSideAttribute_$$ = function($JSCompiler_StaticMethods_setSideAttribute_$self$$, $side$jscomp$1$$) {
  return _.$closestByTag$$module$src$dom$$($JSCompiler_StaticMethods_setSideAttribute_$self$$.element, "amp-story") ? "left" == $side$jscomp$1$$ ? "right" : "left" : $side$jscomp$1$$;
}, $JSCompiler_StaticMethods_openMask_$$ = function($JSCompiler_StaticMethods_openMask_$self$$) {
  if (!$JSCompiler_StaticMethods_openMask_$self$$.$maskElement_$) {
    var $mask$jscomp$19$$ = $JSCompiler_StaticMethods_openMask_$self$$.$document_$.createElement("div");
    $mask$jscomp$19$$.classList.add("i-amphtml-sidebar-mask");
    $mask$jscomp$19$$.addEventListener("click", function() {
      $JSCompiler_StaticMethods_openMask_$self$$.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$();
    });
    $JSCompiler_StaticMethods_openMask_$self$$.element.ownerDocument.body.appendChild($mask$jscomp$19$$);
    $mask$jscomp$19$$.addEventListener("touchmove", function($JSCompiler_StaticMethods_openMask_$self$$) {
      $JSCompiler_StaticMethods_openMask_$self$$.preventDefault();
    });
    $JSCompiler_StaticMethods_openMask_$self$$.$maskElement_$ = $mask$jscomp$19$$;
  }
  $JSCompiler_StaticMethods_openMask_$self$$.$maskElement_$.classList.toggle("i-amphtml-ghost", !1);
}, $JSCompiler_StaticMethods_fixIosElasticScrollLeak_$$ = function($JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$) {
  $JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$.element.addEventListener("scroll", function($e$jscomp$299$$) {
    $JSCompiler_StaticMethods_isOpen_$$($JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$) && (1 > $JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$.element.scrollTop ? ($JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$.element.scrollTop = 1, $e$jscomp$299$$.preventDefault()) : $JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$.element.scrollHeight == $JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$.element.scrollTop + $JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$.element.offsetHeight && 
    (--$JSCompiler_StaticMethods_fixIosElasticScrollLeak_$self$$.element.scrollTop, $e$jscomp$299$$.preventDefault()));
  });
}, $JSCompiler_StaticMethods_compensateIosBottombar_$$ = function($JSCompiler_StaticMethods_compensateIosBottombar_$self$$) {
  if (!$JSCompiler_StaticMethods_compensateIosBottombar_$self$$.$bottomBarCompensated_$) {
    var $div$jscomp$5$$ = $JSCompiler_StaticMethods_compensateIosBottombar_$self$$.$document_$.createElement("div");
    _.$setStyles$$module$src$style$$($div$jscomp$5$$, {height:"29px", width:"100%", "background-color":"transparent"});
    $JSCompiler_StaticMethods_compensateIosBottombar_$self$$.element.appendChild($div$jscomp$5$$);
    $JSCompiler_StaticMethods_compensateIosBottombar_$self$$.$bottomBarCompensated_$ = !0;
  }
}, $JSCompiler_StaticMethods_AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$triggerEvent_$$ = function($JSCompiler_StaticMethods_AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$triggerEvent_$self$$, $name$jscomp$257$$) {
  var $event$jscomp$183$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$triggerEvent_$self$$.$win$, "amp-sidebar toolbar." + $name$jscomp$257$$, _.$dict$$module$src$utils$object$$({}));
  $JSCompiler_StaticMethods_AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$triggerEvent_$self$$.$action_$.$trigger$($JSCompiler_StaticMethods_AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$triggerEvent_$self$$.element, $name$jscomp$257$$, $event$jscomp$183$$, 100);
};
_.$$jscomp$inherits$$($AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$823$$ = this, $element$jscomp$534$$ = this.element;
  $element$jscomp$534$$.classList.add("i-amphtml-overlay");
  $element$jscomp$534$$.classList.add("i-amphtml-scrollable");
  this.$side_$ = $element$jscomp$534$$.getAttribute("side");
  this.$viewport_$ = this.$getViewport$();
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$($element$jscomp$534$$);
  "left" != this.$side_$ && "right" != this.$side_$ && (this.$side_$ = $JSCompiler_StaticMethods_setSideAttribute_$$(this, _.$isRTL$$module$src$dom$$(this.$document_$) ? "right" : "left"), $element$jscomp$534$$.setAttribute("side", this.$side_$));
  _.$toArray$$module$src$types$$($element$jscomp$534$$.querySelectorAll("nav[toolbar]")).forEach(function($element$jscomp$534$$) {
    try {
      $$jscomp$this$jscomp$823$$.$toolbars_$.push(new $Toolbar$$module$extensions$amp_sidebar$0_1$toolbar$$($element$jscomp$534$$, $$jscomp$this$jscomp$823$$));
    } catch ($e$287$$) {
      $$jscomp$this$jscomp$823$$.$user$().error("amp-sidebar toolbar", "Failed to instantiate toolbar", $e$287$$);
    }
  });
  this.$isIos_$ && $JSCompiler_StaticMethods_fixIosElasticScrollLeak_$$(this);
  $JSCompiler_StaticMethods_isOpen_$$(this) ? this.$open_$() : $element$jscomp$534$$.setAttribute("aria-hidden", "true");
  $element$jscomp$534$$.hasAttribute("role") || $element$jscomp$534$$.setAttribute("role", "menu");
  $element$jscomp$534$$.tabIndex = -1;
  this.$documentElement_$.addEventListener("keydown", function($element$jscomp$534$$) {
    "Escape" == $element$jscomp$534$$.key && ($element$jscomp$534$$.preventDefault(), $$jscomp$this$jscomp$823$$.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$());
  });
  var $ariaLabel$jscomp$1$$ = $element$jscomp$534$$.getAttribute("data-close-button-aria-label") || "Close the sidebar", $screenReaderCloseButton$jscomp$1$$ = this.$document_$.createElement("button");
  $screenReaderCloseButton$jscomp$1$$.textContent = $ariaLabel$jscomp$1$$;
  $screenReaderCloseButton$jscomp$1$$.classList.add("i-amphtml-screen-reader");
  $screenReaderCloseButton$jscomp$1$$.tabIndex = -1;
  $screenReaderCloseButton$jscomp$1$$.addEventListener("click", function() {
    $$jscomp$this$jscomp$823$$.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$();
  });
  $element$jscomp$534$$.appendChild($screenReaderCloseButton$jscomp$1$$);
  _.$JSCompiler_StaticMethods_registerDefaultAction$$(this, function($element$jscomp$534$$) {
    return $$jscomp$this$jscomp$823$$.$open_$($element$jscomp$534$$);
  }, "open");
  _.$JSCompiler_StaticMethods_registerAction$$(this, "toggle", this.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$toggle_$.bind(this));
  _.$JSCompiler_StaticMethods_registerAction$$(this, "close", this.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$.bind(this));
  $element$jscomp$534$$.addEventListener("click", function($ariaLabel$jscomp$1$$) {
    if (($ariaLabel$jscomp$1$$ = _.$closestByTag$$module$src$dom$$($ariaLabel$jscomp$1$$.target, "A")) && $ariaLabel$jscomp$1$$.href) {
      var $screenReaderCloseButton$jscomp$1$$ = _.$Services$$module$src$services$urlForDoc$$($element$jscomp$534$$).parse($ariaLabel$jscomp$1$$.href), $e$jscomp$297_target$jscomp$164$$ = $$jscomp$this$jscomp$823$$.$getAmpDoc$().$win$.location.href;
      _.$removeFragment$$module$src$url$$($ariaLabel$jscomp$1$$.href) == _.$removeFragment$$module$src$url$$($e$jscomp$297_target$jscomp$164$$) && $screenReaderCloseButton$jscomp$1$$.hash && $$jscomp$this$jscomp$823$$.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$();
    }
  }, !0);
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  var $$jscomp$this$jscomp$824$$ = this;
  this.$getAmpDoc$().$whenReady$().then(function() {
    $$jscomp$this$jscomp$824$$.$toolbars_$.forEach(function($$jscomp$this$jscomp$824$$) {
      $$jscomp$this$jscomp$824$$.$ampdoc_$.$win$.matchMedia($$jscomp$this$jscomp$824$$.$toolbarMedia_$).matches ? $JSCompiler_StaticMethods_attemptShow_$$($$jscomp$this$jscomp$824$$) : $JSCompiler_StaticMethods_hideToolbar_$$($$jscomp$this$jscomp$824$$);
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$toggle_$ = function($opt_invocation$jscomp$1$$) {
  $JSCompiler_StaticMethods_isOpen_$$(this) ? this.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$() : this.$open_$($opt_invocation$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$open_$ = function($opt_invocation$jscomp$2$$) {
  var $$jscomp$this$jscomp$829$$ = this;
  $JSCompiler_StaticMethods_isOpen_$$(this) || (_.$JSCompiler_StaticMethods_enterOverlayMode$$(this.$viewport_$), $JSCompiler_StaticMethods_setUpdateFn_$$(this, function() {
    return $JSCompiler_StaticMethods_updateForPreOpening_$$($$jscomp$this$jscomp$829$$);
  }), _.$Services$$module$src$services$historyForDoc$$(this.$getAmpDoc$()).push(this.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$.bind(this)).then(function($opt_invocation$jscomp$2$$) {
    $$jscomp$this$jscomp$829$$.$historyId_$ = $opt_invocation$jscomp$2$$;
  }), $opt_invocation$jscomp$2$$ && (this.$openerElement_$ = $opt_invocation$jscomp$2$$.caller, this.$initialScrollTop_$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$(this.$viewport_$)));
};
_.$JSCompiler_prototypeAlias$$.$AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar_prototype$close_$ = function() {
  var $$jscomp$this$jscomp$830$$ = this;
  if ($JSCompiler_StaticMethods_isOpen_$$(this)) {
    _.$JSCompiler_StaticMethods_leaveOverlayMode$$(this.$viewport_$);
    var $scrollDidNotChange$$ = this.$initialScrollTop_$ == _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$(this.$viewport_$), $sidebarIsActive$$ = this.element.contains(this.$document_$.activeElement);
    $JSCompiler_StaticMethods_setUpdateFn_$$(this, function() {
      return $JSCompiler_StaticMethods_updateForClosing_$$($$jscomp$this$jscomp$830$$);
    });
    -1 != this.$historyId_$ && (_.$Services$$module$src$services$historyForDoc$$(this.$getAmpDoc$()).pop(this.$historyId_$), this.$historyId_$ = -1);
    this.$openerElement_$ && $sidebarIsActive$$ && $scrollDidNotChange$$ && _.$tryFocus$$module$src$dom$$(this.$openerElement_$);
  }
};
window.self.AMP.registerElement("amp-sidebar", $AmpSidebar$$module$extensions$amp_sidebar$0_1$amp_sidebar$$, "amp-sidebar{position:fixed!important;top:0;max-height:100vh!important;height:100vh;max-width:80vw;background-color:#efefef;min-width:45px!important;outline:none;overflow-x:hidden!important;overflow-y:auto!important;z-index:2147483647;-webkit-overflow-scrolling:touch;will-change:transform}amp-sidebar[side=left]{left:0!important;-webkit-transform:translateX(-100%)!important;transform:translateX(-100%)!important}amp-sidebar[side=right]{right:0!important;-webkit-transform:translateX(100%)!important;transform:translateX(100%)!important}amp-sidebar[side][open]{-webkit-transform:translateX(0)!important;transform:translateX(0)!important}amp-sidebar[side]{-webkit-transition:-webkit-transform 233ms cubic-bezier(0,0,.21,1);transition:-webkit-transform 233ms cubic-bezier(0,0,.21,1);transition:transform 233ms cubic-bezier(0,0,.21,1);transition:transform 233ms cubic-bezier(0,0,.21,1),-webkit-transform 233ms cubic-bezier(0,0,.21,1)}.i-amphtml-toolbar>ul{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:start;-ms-flex-pack:start;justify-content:flex-start;-ms-flex-wrap:wrap;flex-wrap:wrap;overflow:auto;list-style-type:none;padding:0;margin:0}.i-amphtml-sidebar-mask{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;opacity:0.2;background-image:none!important;background-color:#000;z-index:2147483646}\n/*# sourceURL=/extensions/amp-sidebar/0.1/amp-sidebar.css*/");

})});
