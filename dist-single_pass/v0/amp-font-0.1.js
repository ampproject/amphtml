(self.AMP=self.AMP||[]).push({n:"amp-font",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_createTask$$ = function($JSCompiler_StaticMethods_createTask$self$$, $task$jscomp$19$$) {
  return function($opt_state$jscomp$2$$) {
    _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$($JSCompiler_StaticMethods_createTask$self$$, $task$jscomp$19$$, $opt_state$jscomp$2$$);
  };
}, $FontLoader$$module$extensions$amp_font$0_1$fontloader$$ = function($ampdoc$jscomp$166$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$166$$;
  this.$document_$ = $ampdoc$jscomp$166$$.$win$.document;
  this.$D$ = this.$container_$ = null;
  this.$F$ = this.$G$ = !1;
}, $JSCompiler_StaticMethods_load_$$ = function($JSCompiler_StaticMethods_load_$self$$) {
  return new window.Promise(function($resolve$jscomp$59$$, $reject$jscomp$23$$) {
    var $fontString$$ = $JSCompiler_StaticMethods_load_$self$$.$D$.fontStyle + " " + $JSCompiler_StaticMethods_load_$self$$.$D$.variant + " " + $JSCompiler_StaticMethods_load_$self$$.$D$.weight + " " + $JSCompiler_StaticMethods_load_$self$$.$D$.size + " '" + $JSCompiler_StaticMethods_load_$self$$.$D$.family + "'";
    "fonts" in $JSCompiler_StaticMethods_load_$self$$.$document_$ ? $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.check($fontString$$) ? $resolve$jscomp$59$$() : $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.load($fontString$$).then(function() {
      return $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.load($fontString$$);
    }).then(function() {
      $JSCompiler_StaticMethods_load_$self$$.$document_$.fonts.check($fontString$$) ? $resolve$jscomp$59$$() : $reject$jscomp$23$$(Error("Font could not be loaded, probably due to incorrect @font-face."));
    }).catch($reject$jscomp$23$$) : $JSCompiler_StaticMethods_loadWithPolyfill_$$($JSCompiler_StaticMethods_load_$self$$).then($resolve$jscomp$59$$, $reject$jscomp$23$$);
  });
}, $JSCompiler_StaticMethods_loadWithPolyfill_$$ = function($JSCompiler_StaticMethods_loadWithPolyfill_$self$$) {
  return new window.Promise(function($resolve$jscomp$60$$, $reject$jscomp$24$$) {
    var $vsync$jscomp$4$$ = _.$Services$$module$src$services$vsyncFor$$($JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$ampdoc_$.$win$), $comparators$$ = $JSCompiler_StaticMethods_createFontComparators_$$($JSCompiler_StaticMethods_loadWithPolyfill_$self$$), $vsyncTask$$ = $JSCompiler_StaticMethods_createTask$$($vsync$jscomp$4$$, {measure:function() {
      $JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$G$ ? $resolve$jscomp$60$$() : $JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$F$ ? $reject$jscomp$24$$(Error("Font loading timed out.")) : $comparators$$.some(function($JSCompiler_StaticMethods_loadWithPolyfill_$self$$) {
        var $resolve$jscomp$60$$ = 2 < Math.abs($JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$D$.offsetHeight - $JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$F$.offsetHeight);
        return 2 < Math.abs($JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$D$.offsetWidth - $JSCompiler_StaticMethods_loadWithPolyfill_$self$$.$F$.offsetWidth) || $resolve$jscomp$60$$;
      }) ? $resolve$jscomp$60$$() : $vsyncTask$$();
    }});
    $vsyncTask$$();
  });
}, $JSCompiler_StaticMethods_createFontComparators_$$ = function($JSCompiler_StaticMethods_createFontComparators_$self$$) {
  var $containerElement$$ = $JSCompiler_StaticMethods_createFontComparators_$self$$.$container_$ = $JSCompiler_StaticMethods_createFontComparators_$self$$.$document_$.createElement("div");
  _.$setStyles$$module$src$style$$($containerElement$$, {fontSize:"40px", fontVariant:$JSCompiler_StaticMethods_createFontComparators_$self$$.$D$.variant, fontWeight:$JSCompiler_StaticMethods_createFontComparators_$self$$.$D$.weight, fontStyle:$JSCompiler_StaticMethods_createFontComparators_$self$$.$D$.fontStyle, left:"-999px", lineHeight:"normal", margin:0, padding:0, position:"absolute", top:"-999px", visibility:"hidden"});
  var $comparators$jscomp$1$$ = $DEFAULT_FONTS_$$module$extensions$amp_font$0_1$fontloader$$.map(function($comparators$jscomp$1$$) {
    return new $FontComparator$$module$extensions$amp_font$0_1$fontloader$$($containerElement$$, $JSCompiler_StaticMethods_createFontComparators_$self$$.$D$.family, $comparators$jscomp$1$$);
  });
  $JSCompiler_StaticMethods_createFontComparators_$self$$.$ampdoc_$.$getBody$().appendChild($containerElement$$);
  return $comparators$jscomp$1$$;
}, $FontComparator$$module$extensions$amp_font$0_1$fontloader$$ = function($container$jscomp$11$$, $customFont_testFontFamily$$, $defaultFont$jscomp$1$$) {
  var $doc$jscomp$87$$ = $container$jscomp$11$$.ownerDocument;
  $customFont_testFontFamily$$ = $customFont_testFontFamily$$ + "," + $defaultFont$jscomp$1$$;
  this.$D$ = $JSCompiler_StaticMethods_getFontElement_$$($doc$jscomp$87$$, $defaultFont$jscomp$1$$);
  this.$F$ = $JSCompiler_StaticMethods_getFontElement_$$($doc$jscomp$87$$, $customFont_testFontFamily$$);
  $container$jscomp$11$$.appendChild(this.$D$);
  $container$jscomp$11$$.appendChild(this.$F$);
}, $JSCompiler_StaticMethods_getFontElement_$$ = function($doc$jscomp$88_element$jscomp$401$$, $fontFamily$jscomp$1$$) {
  $doc$jscomp$88_element$jscomp$401$$ = $doc$jscomp$88_element$jscomp$401$$.createElement("div");
  $doc$jscomp$88_element$jscomp$401$$.textContent = "MAxmTYklsjo190QW";
  _.$setStyles$$module$src$style$$($doc$jscomp$88_element$jscomp$401$$, {$float$:"left", fontFamily:$fontFamily$jscomp$1$$, margin:0, padding:0, whiteSpace:"nowrap"});
  return $doc$jscomp$88_element$jscomp$401$$;
}, $AmpFont$$module$extensions$amp_font$0_1$amp_font$$ = function($$jscomp$super$this$jscomp$49_element$jscomp$402$$) {
  $$jscomp$super$this$jscomp$49_element$jscomp$402$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$49_element$jscomp$402$$) || this;
  $$jscomp$super$this$jscomp$49_element$jscomp$402$$.$fontFamily_$ = "";
  $$jscomp$super$this$jscomp$49_element$jscomp$402$$.$fontWeight_$ = "";
  $$jscomp$super$this$jscomp$49_element$jscomp$402$$.$fontStyle_$ = "";
  $$jscomp$super$this$jscomp$49_element$jscomp$402$$.$fontVariant_$ = "";
  $$jscomp$super$this$jscomp$49_element$jscomp$402$$.$fontLoader_$ = null;
  return $$jscomp$super$this$jscomp$49_element$jscomp$402$$;
}, $JSCompiler_StaticMethods_startLoad_$$ = function($JSCompiler_StaticMethods_startLoad_$self$$) {
  $JSCompiler_StaticMethods_startLoad_$self$$.$fontLoader_$.load({fontStyle:$JSCompiler_StaticMethods_startLoad_$self$$.$fontStyle_$, variant:$JSCompiler_StaticMethods_startLoad_$self$$.$fontVariant_$, weight:$JSCompiler_StaticMethods_startLoad_$self$$.$fontWeight_$, size:"medium", family:$JSCompiler_StaticMethods_startLoad_$self$$.$fontFamily_$}, $JSCompiler_StaticMethods_AmpFont$$module$extensions$amp_font$0_1$amp_font_prototype$getTimeout_$$($JSCompiler_StaticMethods_startLoad_$self$$)).then(function() {
    var $addClassName$jscomp$inline_3219$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-load-add-class"), $removeClassName$jscomp$inline_3220$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-load-remove-class");
    $JSCompiler_StaticMethods_onFontLoadFinish_$$($JSCompiler_StaticMethods_startLoad_$self$$, $addClassName$jscomp$inline_3219$$, $removeClassName$jscomp$inline_3220$$);
  }).catch(function() {
    var $addClassName$jscomp$inline_3223$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-error-add-class"), $removeClassName$jscomp$inline_3224$$ = $JSCompiler_StaticMethods_startLoad_$self$$.element.getAttribute("on-error-remove-class");
    $JSCompiler_StaticMethods_onFontLoadFinish_$$($JSCompiler_StaticMethods_startLoad_$self$$, $addClassName$jscomp$inline_3223$$, $removeClassName$jscomp$inline_3224$$);
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-font", "Font download timed out for " + $JSCompiler_StaticMethods_startLoad_$self$$.$fontFamily_$);
  });
}, $JSCompiler_StaticMethods_onFontLoadFinish_$$ = function($JSCompiler_StaticMethods_onFontLoadFinish_$self$$, $addClassName$jscomp$2$$, $removeClassName$jscomp$2$$) {
  var $ampdoc$jscomp$167_root$jscomp$66$$ = $JSCompiler_StaticMethods_onFontLoadFinish_$self$$.$getAmpDoc$();
  $ampdoc$jscomp$167_root$jscomp$66$$ = $ampdoc$jscomp$167_root$jscomp$66$$.getRootNode().documentElement || $ampdoc$jscomp$167_root$jscomp$66$$.$getBody$();
  $addClassName$jscomp$2$$ && $ampdoc$jscomp$167_root$jscomp$66$$.classList.add($addClassName$jscomp$2$$);
  $removeClassName$jscomp$2$$ && $ampdoc$jscomp$167_root$jscomp$66$$.classList.remove($removeClassName$jscomp$2$$);
  $JSCompiler_StaticMethods_onFontLoadFinish_$self$$.$fontLoader_$ = null;
}, $JSCompiler_StaticMethods_AmpFont$$module$extensions$amp_font$0_1$amp_font_prototype$getTimeout_$$ = function($JSCompiler_StaticMethods_AmpFont$$module$extensions$amp_font$0_1$amp_font_prototype$getTimeout_$self$$) {
  var $timeoutInMs$$ = (0,window.parseInt)($JSCompiler_StaticMethods_AmpFont$$module$extensions$amp_font$0_1$amp_font_prototype$getTimeout_$self$$.element.getAttribute("timeout"), 10);
  $timeoutInMs$$ = !_.$isFiniteNumber$$module$src$types$$($timeoutInMs$$) || 0 > $timeoutInMs$$ ? 3000 : $timeoutInMs$$;
  return $timeoutInMs$$ = Math.max($timeoutInMs$$ - (Date.now() - _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_AmpFont$$module$extensions$amp_font$0_1$amp_font_prototype$getTimeout_$self$$.$win$).$F$), 100);
}, $DEFAULT_FONTS_$$module$extensions$amp_font$0_1$fontloader$$ = ["sans-serif", "serif"];
$FontLoader$$module$extensions$amp_font$0_1$fontloader$$.prototype.load = function($fontConfig$$, $timeout$jscomp$13$$) {
  var $$jscomp$this$jscomp$597$$ = this;
  this.$D$ = $fontConfig$$;
  return _.$JSCompiler_StaticMethods_timeoutPromise$$(_.$Services$$module$src$services$timerFor$$(this.$ampdoc_$.$win$), $timeout$jscomp$13$$, $JSCompiler_StaticMethods_load_$$(this)).then(function() {
    $$jscomp$this$jscomp$597$$.$G$ = !0;
    $$jscomp$this$jscomp$597$$.$container_$ && _.$removeElement$$module$src$dom$$($$jscomp$this$jscomp$597$$.$container_$);
    $$jscomp$this$jscomp$597$$.$container_$ = null;
  }, function($fontConfig$$) {
    $$jscomp$this$jscomp$597$$.$F$ = !0;
    $$jscomp$this$jscomp$597$$.$container_$ && _.$removeElement$$module$src$dom$$($$jscomp$this$jscomp$597$$.$container_$);
    $$jscomp$this$jscomp$597$$.$container_$ = null;
    throw $fontConfig$$;
  });
};
_.$$jscomp$inherits$$($AmpFont$$module$extensions$amp_font$0_1$amp_font$$, window.AMP.BaseElement);
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.prototype.$prerenderAllowed$ = function() {
  return !0;
};
$AmpFont$$module$extensions$amp_font$0_1$amp_font$$.prototype.$buildCallback$ = function() {
  this.$fontFamily_$ = this.element.getAttribute("font-family");
  this.$fontWeight_$ = this.element.getAttribute("font-weight") || "400";
  this.$fontStyle_$ = this.element.getAttribute("font-style") || "normal";
  this.$fontVariant_$ = this.element.getAttribute("font-variant") || "normal";
  this.$fontLoader_$ = new $FontLoader$$module$extensions$amp_font$0_1$fontloader$$(this.$getAmpDoc$());
  $JSCompiler_StaticMethods_startLoad_$$(this);
};
window.self.AMP.registerElement("amp-font", $AmpFont$$module$extensions$amp_font$0_1$amp_font$$);

})});
