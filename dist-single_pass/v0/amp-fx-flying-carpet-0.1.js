(self.AMP=self.AMP||[]).push({n:"amp-fx-flying-carpet",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpFlyingCarpet$$module$extensions$amp_fx_flying_carpet$0_1$amp_fx_flying_carpet$$ = function($$jscomp$super$this$jscomp$50_element$jscomp$424$$) {
  $$jscomp$super$this$jscomp$50_element$jscomp$424$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$50_element$jscomp$424$$) || this;
  $$jscomp$super$this$jscomp$50_element$jscomp$424$$.$children_$ = [];
  $$jscomp$super$this$jscomp$50_element$jscomp$424$$.$totalChildren_$ = 0;
  $$jscomp$super$this$jscomp$50_element$jscomp$424$$.$container_$ = null;
  $$jscomp$super$this$jscomp$50_element$jscomp$424$$.$firstLayoutCompleted_$ = !1;
  return $$jscomp$super$this$jscomp$50_element$jscomp$424$$;
}, $JSCompiler_StaticMethods_visibileChildren_$$ = function($nodes$jscomp$6$$) {
  return $nodes$jscomp$6$$.filter(function($nodes$jscomp$6$$) {
    return 1 === $nodes$jscomp$6$$.nodeType ? !0 : 3 === $nodes$jscomp$6$$.nodeType ? /\S/.test($nodes$jscomp$6$$.textContent) : !1;
  });
};
_.$$jscomp$inherits$$($AmpFlyingCarpet$$module$extensions$amp_fx_flying_carpet$0_1$amp_fx_flying_carpet$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpFlyingCarpet$$module$extensions$amp_fx_flying_carpet$0_1$amp_fx_flying_carpet$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$60$$) {
  return "fixed-height" == $layout$jscomp$60$$;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$630$$ = this, $clip_doc$jscomp$92$$ = this.element.ownerDocument, $container$jscomp$14$$ = $clip_doc$jscomp$92$$.createElement("div");
  this.$children_$ = this.$getRealChildren$();
  this.$container_$ = $container$jscomp$14$$;
  var $childNodes$$ = this.$getRealChildNodes$();
  this.$totalChildren_$ = $JSCompiler_StaticMethods_visibileChildren_$$($childNodes$$).length;
  this.$children_$.forEach(function($clip_doc$jscomp$92$$) {
    _.$Resource$$module$src$service$resource$setOwner$$($clip_doc$jscomp$92$$, $$jscomp$this$jscomp$630$$.element);
  });
  $clip_doc$jscomp$92$$ = $clip_doc$jscomp$92$$.createElement("div");
  $clip_doc$jscomp$92$$.setAttribute("class", "i-amphtml-fx-flying-carpet-clip");
  $container$jscomp$14$$.setAttribute("class", "i-amphtml-fx-flying-carpet-container");
  $childNodes$$.forEach(function($$jscomp$this$jscomp$630$$) {
    return $container$jscomp$14$$.appendChild($$jscomp$this$jscomp$630$$);
  });
  $clip_doc$jscomp$92$$.appendChild($container$jscomp$14$$);
  this.element.appendChild($clip_doc$jscomp$92$$);
  _.$JSCompiler_StaticMethods_addToFixedLayer$$(this.$getViewport$(), $container$jscomp$14$$, !1);
};
_.$JSCompiler_prototypeAlias$$.$onMeasureChanged$ = function() {
  var $$jscomp$this$jscomp$631$$ = this, $width$jscomp$46$$ = this.$layoutWidth_$;
  this.$mutateElement$(function() {
    _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$631$$.$container_$, "width", $width$jscomp$46$$, "px");
  });
  this.$firstLayoutCompleted_$ && (this.$scheduleLayout$(this.$children_$), _.$listen$$module$src$event_helper$$(this.element, "amp:built", this.$layoutBuiltChild_$.bind(this)));
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$18$$) {
  this.$updateInViewport$(this.$children_$, $inViewport$jscomp$18$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  try {
    this.element.$getLayoutBox$(), _.$JSCompiler_StaticMethods_getHeight$$(this.$getViewport$());
  } catch ($e$257$$) {
    throw this.collapse(), $e$257$$;
  }
  this.$scheduleLayout$(this.$children_$);
  _.$listen$$module$src$event_helper$$(this.element, "amp:built", this.$layoutBuiltChild_$.bind(this));
  this.$firstLayoutCompleted_$ = !0;
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$layoutBuiltChild_$ = function($child$jscomp$19_event$jscomp$127$$) {
  $child$jscomp$19_event$jscomp$127$$ = $child$jscomp$19_event$jscomp$127$$.target;
  $child$jscomp$19_event$jscomp$127$$.$getOwner$() === this.element && this.$scheduleLayout$($child$jscomp$19_event$jscomp$127$$);
};
_.$JSCompiler_prototypeAlias$$.$collapsedCallback$ = function($child$jscomp$20_index$jscomp$123$$) {
  $child$jscomp$20_index$jscomp$123$$ = this.$children_$.indexOf($child$jscomp$20_index$jscomp$123$$);
  -1 < $child$jscomp$20_index$jscomp$123$$ && (this.$children_$.splice($child$jscomp$20_index$jscomp$123$$, 1), this.$totalChildren_$--, 0 == this.$totalChildren_$ && this.$attemptCollapse$().catch(function() {
  }));
};
window.self.AMP.registerElement("amp-fx-flying-carpet", $AmpFlyingCarpet$$module$extensions$amp_fx_flying_carpet$0_1$amp_fx_flying_carpet$$, "amp-fx-flying-carpet{position:relative!important;box-sizing:border-box!important}amp-fx-flying-carpet>.i-amphtml-fx-flying-carpet-clip{position:absolute!important;top:0!important;left:0!important;width:100%!important;height:100%!important;border:0!important;margin:0!important;padding:0!important;clip:rect(0,auto,auto,0)!important;-webkit-clip-path:polygon(0px 0px,100% 0px,100% 100%,0px 100%)!important;clip-path:polygon(0px 0px,100% 0px,100% 100%,0px 100%)!important}amp-fx-flying-carpet>.i-amphtml-fx-flying-carpet-clip>.i-amphtml-fx-flying-carpet-container{position:fixed!important;top:0!important;width:100%;height:100%;-webkit-transform:translateZ(0)!important;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.i-amphtml-fx-flying-carpet-container>.i-amphtml-layout-fixed-height,.i-amphtml-fx-flying-carpet-container>.i-amphtml-layout-responsive{-ms-flex-item-align:stretch;align-self:stretch}\n/*# sourceURL=/extensions/amp-fx-flying-carpet/0.1/amp-fx-flying-carpet.css*/");

})});
