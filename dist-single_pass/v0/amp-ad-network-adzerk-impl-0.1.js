(self.AMP=self.AMP||[]).push({n:"amp-ad-network-adzerk-impl",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $AmpAdNetworkAdzerkImpl$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$ = function($$jscomp$super$this$jscomp$10_element$jscomp$291$$) {
  $$jscomp$super$this$jscomp$10_element$jscomp$291$$ = _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.call(this, $$jscomp$super$this$jscomp$10_element$jscomp$291$$) || this;
  $$jscomp$super$this$jscomp$10_element$jscomp$291$$.$creativeMetadata_$ = null;
  $$jscomp$super$this$jscomp$10_element$jscomp$291$$.$ampCreativeJson_$ = null;
  $ampAdTemplateHelper$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$ = $ampAdTemplateHelper$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$ || new _.$AmpAdTemplateHelper$$module$extensions$amp_a4a$0_1$amp_ad_template_helper$$($$jscomp$super$this$jscomp$10_element$jscomp$291$$.$win$);
  return $$jscomp$super$this$jscomp$10_element$jscomp$291$$;
}, $ampAdTemplateHelper$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$;
_.$$jscomp$inherits$$($AmpAdNetworkAdzerkImpl$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$, _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$);
_.$JSCompiler_prototypeAlias$$ = $AmpAdNetworkAdzerkImpl$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.isValidElement = function() {
  return !!this.$getAdUrl$();
};
_.$JSCompiler_prototypeAlias$$.$getSigningServiceNames$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$getAdUrl$ = function() {
  var $data$jscomp$91$$ = this.element.getAttribute("data-r");
  return "https://engine.adzerk.net/amp?r=" + (0,window.encodeURIComponent)($data$jscomp$91$$);
};
_.$JSCompiler_prototypeAlias$$.$maybeValidateAmpCreative$ = function($bytes$jscomp$11$$, $headers$jscomp$6$$) {
  var $$jscomp$this$jscomp$317$$ = this;
  if ("amp-mustache" !== $headers$jscomp$6$$.get("AMP-template-amp-creative")) {
    return window.Promise.resolve(null);
  }
  var $checkStillCurrent$jscomp$5$$ = this.$verifyStillCurrent$();
  return _.$tryResolve$$module$src$utils$promise$$(function() {
    return _.$utf8Decode$$module$src$utils$bytes$$($bytes$jscomp$11$$);
  }).then(function($bytes$jscomp$11$$) {
    $checkStillCurrent$jscomp$5$$();
    $$jscomp$this$jscomp$317$$.$ampCreativeJson_$ = _.$tryParseJson$$module$src$json$$($bytes$jscomp$11$$) || {};
    return $ampAdTemplateHelper$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$.fetch($$jscomp$this$jscomp$317$$.$ampCreativeJson_$.$templateUrl$).then(function($bytes$jscomp$11$$) {
      $bytes$jscomp$11$$ = $bytes$jscomp$11$$.replace(/<script async.+?<\/script>/g, "");
      $$jscomp$this$jscomp$317$$.$creativeMetadata_$ = {$minifiedCreative$:$bytes$jscomp$11$$, $customElementExtensions$:[], $extensions$:[]};
      return _.$utf8Encode$$module$src$utils$bytes$$($bytes$jscomp$11$$);
    }).catch(function($bytes$jscomp$11$$) {
      _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-ad-network-adzerk-impl", "Error fetching/expanding template", $$jscomp$this$jscomp$317$$.$ampCreativeJson_$, $bytes$jscomp$11$$);
      _.$JSCompiler_StaticMethods_forceCollapse$$($$jscomp$this$jscomp$317$$);
      return window.Promise.reject("NO-CONTENT-RESPONSE");
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$getAmpAdMetadata$ = function() {
  this.$creativeMetadata_$ || (this.$creativeMetadata_$ = {});
  this.$creativeMetadata_$.customElementExtensions || (this.$creativeMetadata_$.customElementExtensions = []);
  if (this.$ampCreativeJson_$.$analytics$) {
    var $array$jscomp$inline_2252_array$jscomp$inline_2255$$ = this.$creativeMetadata_$.customElementExtensions;
    0 > $array$jscomp$inline_2252_array$jscomp$inline_2255$$.indexOf("amp-analytics") && $array$jscomp$inline_2252_array$jscomp$inline_2255$$.push("amp-analytics");
  }
  $array$jscomp$inline_2252_array$jscomp$inline_2255$$ = this.$creativeMetadata_$.customElementExtensions;
  0 > $array$jscomp$inline_2252_array$jscomp$inline_2255$$.indexOf("amp-mustache") && $array$jscomp$inline_2252_array$jscomp$inline_2255$$.push("amp-mustache");
  return this.$creativeMetadata_$;
};
_.$JSCompiler_prototypeAlias$$.$onCreativeRender$ = function() {
  var $$jscomp$this$jscomp$318$$ = this;
  this.$ampCreativeJson_$ && this.$ampCreativeJson_$.data && $ampAdTemplateHelper$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$.render(this.$ampCreativeJson_$.data, this.iframe.contentWindow.document.body).then(function($renderedElement$jscomp$1$$) {
    $$jscomp$this$jscomp$318$$.$ampCreativeJson_$.$analytics$ && _.$JSCompiler_StaticMethods_insertAnalytics$$($renderedElement$jscomp$1$$, $$jscomp$this$jscomp$318$$.$ampCreativeJson_$.$analytics$);
    $$jscomp$this$jscomp$318$$.iframe.contentWindow.document.body.innerHTML = $renderedElement$jscomp$1$$.innerHTML;
  });
};
window.self.AMP.registerElement("amp-ad-network-adzerk-impl", $AmpAdNetworkAdzerkImpl$$module$extensions$amp_ad_network_adzerk_impl$0_1$amp_ad_network_adzerk_impl$$);

})});
