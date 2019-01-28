(self.AMP=self.AMP||[]).push({n:"amp-mustache",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $purifyTagsForTripleMustache$$module$src$purifier$$ = function($fragment$jscomp$5_html$jscomp$6$$, $div$jscomp$1_doc$jscomp$63$$) {
  $div$jscomp$1_doc$jscomp$63$$ = void 0 === $div$jscomp$1_doc$jscomp$63$$ ? window.self.document : $div$jscomp$1_doc$jscomp$63$$;
  var $allowedTags$jscomp$1$$;
  _.$DomPurify$$module$src$purifier$$.$addHook$("uponSanitizeElement", function($fragment$jscomp$5_html$jscomp$6$$, $div$jscomp$1_doc$jscomp$63$$) {
    var $node$jscomp$57_type$jscomp$140$$ = $div$jscomp$1_doc$jscomp$63$$.tagName;
    $allowedTags$jscomp$1$$ = $div$jscomp$1_doc$jscomp$63$$.$allowedTags$;
    "template" === $node$jscomp$57_type$jscomp$140$$ && ($fragment$jscomp$5_html$jscomp$6$$ = $fragment$jscomp$5_html$jscomp$6$$.getAttribute("type")) && "amp-mustache" === $fragment$jscomp$5_html$jscomp$6$$.toLowerCase() && ($allowedTags$jscomp$1$$.template = !0);
  });
  _.$DomPurify$$module$src$purifier$$.$addHook$("afterSanitizeElements", function() {
    $allowedTags$jscomp$1$$.template = !1;
  });
  $fragment$jscomp$5_html$jscomp$6$$ = _.$DomPurify$$module$src$purifier$$.$sanitize$($fragment$jscomp$5_html$jscomp$6$$, {ALLOWED_TAGS:_.$TRIPLE_MUSTACHE_WHITELISTED_TAGS$$module$src$purifier$$, FORCE_BODY:!0, RETURN_DOM_FRAGMENT:!0});
  _.$DomPurify$$module$src$purifier$$.$removeAllHooks$();
  $div$jscomp$1_doc$jscomp$63$$ = $div$jscomp$1_doc$jscomp$63$$.createElement("div");
  $div$jscomp$1_doc$jscomp$63$$.appendChild($fragment$jscomp$5_html$jscomp$6$$);
  return $div$jscomp$1_doc$jscomp$63$$.innerHTML;
}, $AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache$$ = function($element$jscomp$501$$, $win$jscomp$365$$) {
  var $$jscomp$super$this$jscomp$76$$ = window.AMP.BaseTemplate.call(this, $element$jscomp$501$$, $win$jscomp$365$$) || this;
  _.$Mustache$$module$third_party$mustache$mustache$$.$setUnescapedSanitizer$(function($element$jscomp$501$$) {
    return $purifyTagsForTripleMustache$$module$src$purifier$$($element$jscomp$501$$, $$jscomp$super$this$jscomp$76$$.$win$.document);
  });
  return $$jscomp$super$this$jscomp$76$$;
}, $JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache_prototype$processNestedTemplates_$$ = function($JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache_prototype$processNestedTemplates_$self$$, $content$jscomp$22$$) {
  _.$iterateCursor$$module$src$dom$$($content$jscomp$22$$.querySelectorAll("template"), function($content$jscomp$22$$, $index$jscomp$130_key$jscomp$137$$) {
    $index$jscomp$130_key$jscomp$137$$ = "__AMP_NESTED_TEMPLATE_" + $index$jscomp$130_key$jscomp$137$$;
    $JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache_prototype$processNestedTemplates_$self$$.$G$[$index$jscomp$130_key$jscomp$137$$] = $content$jscomp$22$$.outerHTML;
    $content$jscomp$22$$.parentNode.replaceChild($JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache_prototype$processNestedTemplates_$self$$.element.ownerDocument.createTextNode("{{{" + $index$jscomp$130_key$jscomp$137$$ + "}}}"), $content$jscomp$22$$);
  });
}, $JSCompiler_StaticMethods_purifyAndSetHtml_$$ = function($JSCompiler_StaticMethods_purifyAndSetHtml_$self_root$jscomp$69$$, $body$jscomp$inline_3717_html$jscomp$21$$) {
  var $diffing$jscomp$inline_3715$$ = _.$isExperimentOn$$module$src$experiments$$(window.self, "amp-list-diffing");
  $diffing$jscomp$inline_3715$$ = void 0 === $diffing$jscomp$inline_3715$$ ? !1 : $diffing$jscomp$inline_3715$$;
  var $config$jscomp$inline_3716$$ = _.$purifyConfig$$module$src$purifier$$();
  _.$addPurifyHooks$$module$src$purifier$$(_.$DomPurify$$module$src$purifier$$, $diffing$jscomp$inline_3715$$);
  $body$jscomp$inline_3717_html$jscomp$21$$ = _.$DomPurify$$module$src$purifier$$.$sanitize$($body$jscomp$inline_3717_html$jscomp$21$$, $config$jscomp$inline_3716$$);
  _.$DomPurify$$module$src$purifier$$.$removeAllHooks$();
  $JSCompiler_StaticMethods_purifyAndSetHtml_$self_root$jscomp$69$$ = $JSCompiler_StaticMethods_purifyAndSetHtml_$self_root$jscomp$69$$.$win$.document.createElement("div");
  $JSCompiler_StaticMethods_purifyAndSetHtml_$self_root$jscomp$69$$.innerHTML = $body$jscomp$inline_3717_html$jscomp$21$$.innerHTML;
  return _.$JSCompiler_StaticMethods_unwrap$$($JSCompiler_StaticMethods_purifyAndSetHtml_$self_root$jscomp$69$$);
};
_.$$jscomp$inherits$$($AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache$$, window.AMP.BaseTemplate);
$AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache$$.prototype.$F$ = function() {
  if (!_.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "viewerRenderTemplate")) {
    this.$G$ = {};
    if ("TEMPLATE" == this.element.tagName) {
      var $JSCompiler_inline_result$jscomp$809_content$jscomp$inline_3711$$ = _.$templateContentClone$$module$src$dom$$(this.element);
      $JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache_prototype$processNestedTemplates_$$(this, $JSCompiler_inline_result$jscomp$809_content$jscomp$inline_3711$$);
      var $container$jscomp$inline_3712$$ = this.element.ownerDocument.createElement("div");
      $container$jscomp$inline_3712$$.appendChild($JSCompiler_inline_result$jscomp$809_content$jscomp$inline_3711$$);
      $JSCompiler_inline_result$jscomp$809_content$jscomp$inline_3711$$ = $container$jscomp$inline_3712$$.innerHTML;
    } else {
      $JSCompiler_inline_result$jscomp$809_content$jscomp$inline_3711$$ = "SCRIPT" == this.element.tagName ? this.element.textContent : "";
    }
    this.$I$ = $JSCompiler_inline_result$jscomp$809_content$jscomp$inline_3711$$;
    _.$Mustache$$module$third_party$mustache$mustache$$.parse(this.$I$, void 0);
  }
};
$AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache$$.prototype.$D$ = function($html$jscomp$19$$) {
  return $JSCompiler_StaticMethods_purifyAndSetHtml_$$(this, $html$jscomp$19$$);
};
$AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache$$.prototype.render = function($data$jscomp$148_html$jscomp$20$$) {
  var $mustacheData$jscomp$1$$ = $data$jscomp$148_html$jscomp$20$$;
  "object" === typeof $data$jscomp$148_html$jscomp$20$$ && ($mustacheData$jscomp$1$$ = Object.assign({}, $data$jscomp$148_html$jscomp$20$$, this.$G$));
  $data$jscomp$148_html$jscomp$20$$ = _.$Mustache$$module$third_party$mustache$mustache$$.render(this.$I$, $mustacheData$jscomp$1$$, void 0);
  return $JSCompiler_StaticMethods_purifyAndSetHtml_$$(this, $data$jscomp$148_html$jscomp$20$$);
};
window.self.AMP.registerTemplate("amp-mustache", $AmpMustache$$module$extensions$amp_mustache$0_2$amp_mustache$$);

})});
