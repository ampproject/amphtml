(self.AMP=self.AMP||[]).push({n:"amp-anim",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$ = function($$jscomp$super$this$jscomp$16_element$jscomp$329$$) {
  $$jscomp$super$this$jscomp$16_element$jscomp$329$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$16_element$jscomp$329$$) || this;
  $$jscomp$super$this$jscomp$16_element$jscomp$329$$.$img_$ = null;
  $$jscomp$super$this$jscomp$16_element$jscomp$329$$.$hasLoaded_$ = !1;
  return $$jscomp$super$this$jscomp$16_element$jscomp$329$$;
}, $JSCompiler_StaticMethods_AmpAnim$$module$extensions$amp_anim$0_1$amp_anim_prototype$updateInViewport_$$ = function($JSCompiler_StaticMethods_AmpAnim$$module$extensions$amp_anim$0_1$amp_anim_prototype$updateInViewport_$self$$) {
  var $inViewport$jscomp$13$$ = $JSCompiler_StaticMethods_AmpAnim$$module$extensions$amp_anim$0_1$amp_anim_prototype$updateInViewport_$self$$.$isInViewport$();
  $JSCompiler_StaticMethods_AmpAnim$$module$extensions$amp_anim$0_1$amp_anim_prototype$updateInViewport_$self$$.$togglePlaceholder$(!$inViewport$jscomp$13$$);
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_AmpAnim$$module$extensions$amp_anim$0_1$amp_anim_prototype$updateInViewport_$self$$.$img_$, $inViewport$jscomp$13$$);
}, $BUILD_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$ = ["alt", "aria-label", "aria-describedby", "aria-labelledby"], $LAYOUT_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$ = ["src", "srcset"];
_.$$jscomp$inherits$$($AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$33$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$33$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$img_$ = new window.Image;
  this.$img_$.setAttribute("decoding", "async");
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $BUILD_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$, this.$img_$);
  _.$JSCompiler_StaticMethods_applyFillContent$$(this.$img_$, !0);
  "img" == this.element.getAttribute("role") && (this.element.removeAttribute("role"), this.$user$().error("AMP-ANIM", "Setting role=img on amp-anim elements breaks screen readers. Please just set alt or ARIA attributes, they will be correctly propagated for the underlying <img> element."));
  _.$toggle$$module$src$style$$(this.$img_$, !this.$getPlaceholder$());
  this.element.appendChild(this.$img_$);
};
_.$JSCompiler_prototypeAlias$$.$isRelayoutNeeded$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $img$jscomp$5$$ = this.$img_$;
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $LAYOUT_ATTRIBUTES$$module$extensions$amp_anim$0_1$amp_anim$$, $img$jscomp$5$$);
  _.$guaranteeSrcForSrcsetUnsupportedBrowsers$$module$src$utils$img$$($img$jscomp$5$$);
  return this.$loadPromise$($img$jscomp$5$$);
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
  this.$hasLoaded_$ = !0;
  $JSCompiler_StaticMethods_AmpAnim$$module$extensions$amp_anim$0_1$amp_anim_prototype$updateInViewport_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function() {
  this.$hasLoaded_$ && $JSCompiler_StaticMethods_AmpAnim$$module$extensions$amp_anim$0_1$amp_anim_prototype$updateInViewport_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$img_$.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  this.$img_$.srcset = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  this.$hasLoaded_$ = !1;
  return !0;
};
window.self.AMP.registerElement("amp-anim", $AmpAnim$$module$extensions$amp_anim$0_1$amp_anim$$);

})});
