(self.AMP=self.AMP||[]).push({n:"amp-dynamic-css-classes",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$ = function($referrer$jscomp$9$$) {
  var $domainBase$$ = "";
  return $referrer$jscomp$9$$.split(".").reduceRight(function($referrer$jscomp$9$$, $domain$jscomp$7$$) {
    $domainBase$$ && ($domain$jscomp$7$$ += "." + $domainBase$$);
    $domainBase$$ = $domain$jscomp$7$$;
    $referrer$jscomp$9$$.push($domain$jscomp$7$$);
    return $referrer$jscomp$9$$;
  }, []);
}, $normalizedReferrers$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$ = function($ampdoc$jscomp$157$$) {
  var $JSCompiler_inline_result$jscomp$737_referrer$jscomp$inline_3189$$ = ($JSCompiler_inline_result$jscomp$737_referrer$jscomp$inline_3189$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$157$$).$W$) ? _.$Services$$module$src$services$urlForDoc$$($ampdoc$jscomp$157$$.$getHeadNode$()).parse($JSCompiler_inline_result$jscomp$737_referrer$jscomp$inline_3189$$).hostname : "";
  return "t.co" === $JSCompiler_inline_result$jscomp$737_referrer$jscomp$inline_3189$$ ? $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$("twitter.com") : !$JSCompiler_inline_result$jscomp$737_referrer$jscomp$inline_3189$$ && /Pinterest/.test($ampdoc$jscomp$157$$.$win$.navigator.userAgent) ? $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$("www.pinterest.com") : $referrers_$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($JSCompiler_inline_result$jscomp$737_referrer$jscomp$inline_3189$$);
}, $addDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$ = function($ampdoc$jscomp$158$$, $classes$jscomp$1$$) {
  $ampdoc$jscomp$158$$.$isBodyAvailable$() ? $addCssClassesToBody$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$158$$.$getBody$(), $classes$jscomp$1$$) : $ampdoc$jscomp$158$$.$whenBodyAvailable$().then(function($ampdoc$jscomp$158$$) {
    return $addCssClassesToBody$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$158$$, $classes$jscomp$1$$);
  });
}, $addCssClassesToBody$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$ = function($body$jscomp$23_classList$jscomp$7$$, $classes$jscomp$2$$) {
  $body$jscomp$23_classList$jscomp$7$$ = $body$jscomp$23_classList$jscomp$7$$.classList;
  for (var $i$jscomp$308$$ = 0; $i$jscomp$308$$ < $classes$jscomp$2$$.length; $i$jscomp$308$$++) {
    $body$jscomp$23_classList$jscomp$7$$.add($classes$jscomp$2$$[$i$jscomp$308$$]);
  }
}, $addReferrerClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$ = function($ampdoc$jscomp$159$$) {
  var $classes$jscomp$3$$ = $normalizedReferrers$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$159$$).map(function($ampdoc$jscomp$159$$) {
    return "amp-referrer-" + $ampdoc$jscomp$159$$.replace(/\./g, "-");
  });
  _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$159$$.$win$).$mutate$(function() {
    $addDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$159$$, $classes$jscomp$3$$);
  });
}, $addViewerClass$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$ = function($ampdoc$jscomp$160$$) {
  _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$160$$).$F$ && _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$160$$.$win$).$mutate$(function() {
    $addDynamicCssClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($ampdoc$jscomp$160$$, ["amp-viewer"]);
  });
};
(function($AMP$jscomp$42$$) {
  $AMP$jscomp$42$$.registerServiceForDoc("amp-dynamic-css-classes", function($AMP$jscomp$42$$) {
    $addReferrerClasses$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($AMP$jscomp$42$$);
    $addViewerClass$$module$extensions$amp_dynamic_css_classes$0_1$amp_dynamic_css_classes$$($AMP$jscomp$42$$);
    return {};
  });
})(window.self.AMP);

})});
