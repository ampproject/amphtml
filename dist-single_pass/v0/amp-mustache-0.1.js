(self.AMP=self.AMP||[]).push({n:"amp-mustache",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $sanitizeHtml$$module$src$sanitizer$$ = function($html$jscomp$14$$, $diffing$jscomp$3$$) {
  function $emit$jscomp$1$$($html$jscomp$14$$) {
    0 == $ignore$jscomp$4$$ && $output$jscomp$5$$.push($html$jscomp$14$$);
  }
  var $tagPolicy$jscomp$3$$ = $html$$module$third_party$caja$html_sanitizer$$.$makeTagPolicy$(function($html$jscomp$14$$) {
    return "https" === $html$jscomp$14$$.$getScheme$() ? $html$jscomp$14$$ : null;
  }), $output$jscomp$5$$ = [], $ignore$jscomp$4$$ = 0, $cajaBlacklistedTags$$ = Object.assign({script:!0, svg:!0}, _.$BLACKLISTED_TAGS$$module$src$purifier$$);
  $html$$module$third_party$caja$html_sanitizer$$.$makeSaxParser$({startTag:function($html$jscomp$14$$, $output$jscomp$5$$) {
    if (0 < $ignore$jscomp$4$$) {
      $SELF_CLOSING_TAGS$$module$src$sanitizer$$[$html$jscomp$14$$] || $ignore$jscomp$4$$++;
    } else {
      for (var $tagName$jscomp$44$$ = _.$startsWith$$module$src$string$$($html$jscomp$14$$, "amp-"), $attribs$jscomp$3$$ = [], $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ = 0; $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ < $output$jscomp$5$$.length; $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ += 2) {
        var $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ = $output$jscomp$5$$[$attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$];
        if ($attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$) {
          var $attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$ = "[" == $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$[0] && "]" == $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$.length - 1], $alternativeBinding$jscomp$1_i$273$$ = _.$startsWith$$module$src$string$$($attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$, "data-amp-bind-");
          $attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$ && ($output$jscomp$5$$[$attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$] = $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$.slice(1, -1));
          ($attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$ || $alternativeBinding$jscomp$1_i$273$$) && $attribs$jscomp$3$$.push($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$);
        }
      }
      if ($cajaBlacklistedTags$$[$html$jscomp$14$$]) {
        $ignore$jscomp$4$$++;
      } else {
        if (!$tagName$jscomp$44$$) {
          $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ = $output$jscomp$5$$.slice(0);
          if ($attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ = $tagPolicy$jscomp$3$$($html$jscomp$14$$, $output$jscomp$5$$)) {
            for ($output$jscomp$5$$ = $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$.$attribs$, $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ = 0; $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ < $output$jscomp$5$$.length; $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ += 2) {
              $attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$ = $output$jscomp$5$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$], _.$WHITELISTED_ATTRS$$module$src$purifier$$.includes($attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$) ? $output$jscomp$5$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ + 1] = $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ + 
              1] : 0 == $attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$.search($WHITELISTED_ATTR_PREFIX_REGEX$$module$src$sanitizer$$) ? $output$jscomp$5$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ + 1] = $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ + 1] : _.$WHITELISTED_ATTRS_BY_TAGS$$module$src$purifier$$[$html$jscomp$14$$] && _.$WHITELISTED_ATTRS_BY_TAGS$$module$src$purifier$$[$html$jscomp$14$$].includes($attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$) && 
              ($output$jscomp$5$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ + 1] = $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ + 1]);
            }
          } else {
            $ignore$jscomp$4$$++;
          }
          if ("a" == $html$jscomp$14$$) {
            $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ = -1;
            $attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$ = !1;
            for ($alternativeBinding$jscomp$1_i$273$$ = 0; $alternativeBinding$jscomp$1_i$273$$ < $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$.length; $alternativeBinding$jscomp$1_i$273$$ += 2) {
              "target" == $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$[$alternativeBinding$jscomp$1_i$273$$] ? $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ = $alternativeBinding$jscomp$1_i$273$$ + 1 : "href" == $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$[$alternativeBinding$jscomp$1_i$273$$] && ($attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$ = null != $output$jscomp$5$$[$alternativeBinding$jscomp$1_i$273$$ + 1]);
            }
            $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ = -1 != $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ ? $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$] : null;
            null != $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ ? ($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ = $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$.toLowerCase(), $output$jscomp$5$$[$attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$] = -1 != _.$WHITELISTED_TARGETS$$module$src$purifier$$.indexOf($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$) ? $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ : 
            "_top") : $attrName$jscomp$12_classicBinding$jscomp$1_hasHref$$ && $output$jscomp$5$$.push("target", "_top");
          }
        }
      }
      if (0 < $ignore$jscomp$4$$) {
        $SELF_CLOSING_TAGS$$module$src$sanitizer$$[$html$jscomp$14$$] && $ignore$jscomp$4$$--;
      } else {
        ($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ = $attribs$jscomp$3$$.some(function($html$jscomp$14$$) {
          return !!$output$jscomp$5$$[$html$jscomp$14$$ + 1];
        })) && $output$jscomp$5$$.push("i-amphtml-binding", "");
        ($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ || $tagName$jscomp$44$$) && $diffing$jscomp$3$$ && $output$jscomp$5$$.push("i-amphtml-key", String($KEY_COUNTER$$module$src$sanitizer$$++));
        $emit$jscomp$1$$("<");
        $emit$jscomp$1$$($html$jscomp$14$$);
        for ($tagName$jscomp$44$$ = 0; $tagName$jscomp$44$$ < $output$jscomp$5$$.length; $tagName$jscomp$44$$ += 2) {
          $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ = $output$jscomp$5$$[$tagName$jscomp$44$$], $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ = $output$jscomp$5$$[$tagName$jscomp$44$$ + 1], _.$isValidAttr$$module$src$purifier$$($html$jscomp$14$$, $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$, $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$) ? ($emit$jscomp$1$$(" "), $attribs$jscomp$3$$.includes($tagName$jscomp$44$$) && 
          !_.$startsWith$$module$src$string$$($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$, "data-amp-bind-") ? $emit$jscomp$1$$("[" + $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ + "]") : $emit$jscomp$1$$($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$), $emit$jscomp$1$$('="'), $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ && ($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ = 
          $attribs$jscomp$3$$.includes($tagName$jscomp$44$$) ? $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ : _.$rewriteAttributeValue$$module$src$purifier$$($html$jscomp$14$$, $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$, $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$), $emit$jscomp$1$$($html$$module$third_party$caja$html_sanitizer$$.$escapeAttrib$($attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$))), 
          $emit$jscomp$1$$('"')) : _.$user$$module$src$log$$().error("SANITIZER", "Removed unsafe attribute: " + $attrName$275_hasBindings_i$jscomp$359_origTarget_rewrite_savedAttribs$$ + '="' + $attr$jscomp$22_attrValue$jscomp$6_i$272_index$jscomp$128_scrubbed$$ + '"');
        }
        $emit$jscomp$1$$(">");
      }
    }
  }, endTag:function($html$jscomp$14$$) {
    0 < $ignore$jscomp$4$$ ? $ignore$jscomp$4$$-- : ($emit$jscomp$1$$("</"), $emit$jscomp$1$$($html$jscomp$14$$), $emit$jscomp$1$$(">"));
  }, pcdata:$emit$jscomp$1$$, rcdata:$emit$jscomp$1$$, cdata:$emit$jscomp$1$$})($html$jscomp$14$$);
  return $output$jscomp$5$$.join("");
}, $sanitizeTagsForTripleMustache$$module$src$sanitizer$$ = function($html$jscomp$15$$) {
  return $html$$module$third_party$caja$html_sanitizer$$.$sanitizeWithPolicy$($html$jscomp$15$$, $tripleMustacheTagPolicy$$module$src$sanitizer$$);
}, $tripleMustacheTagPolicy$$module$src$sanitizer$$ = function($tagName$jscomp$46$$, $attribs$jscomp$4$$) {
  if ("template" == $tagName$jscomp$46$$) {
    for (var $i$jscomp$361$$ = 0; $i$jscomp$361$$ < $attribs$jscomp$4$$.length; $i$jscomp$361$$ += 2) {
      if ("type" == $attribs$jscomp$4$$[$i$jscomp$361$$] && "amp-mustache" == $attribs$jscomp$4$$[$i$jscomp$361$$ + 1]) {
        return {tagName:$tagName$jscomp$46$$, $attribs$:["type", "amp-mustache"]};
      }
    }
  }
  return _.$TRIPLE_MUSTACHE_WHITELISTED_TAGS$$module$src$purifier$$.includes($tagName$jscomp$46$$) ? {tagName:$tagName$jscomp$46$$, $attribs$:$attribs$jscomp$4$$} : null;
}, $AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache$$ = function($$jscomp$super$this$jscomp$75_element$jscomp$500$$, $win$jscomp$364$$) {
  $$jscomp$super$this$jscomp$75_element$jscomp$500$$ = window.AMP.BaseTemplate.call(this, $$jscomp$super$this$jscomp$75_element$jscomp$500$$, $win$jscomp$364$$) || this;
  _.$Mustache$$module$third_party$mustache$mustache$$.$setUnescapedSanitizer$($sanitizeTagsForTripleMustache$$module$src$sanitizer$$);
  _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-mustache", 'The extension "amp-mustache-0.1.js" is deprecated. Please use a more recent version of this extension.');
  return $$jscomp$super$this$jscomp$75_element$jscomp$500$$;
}, $JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache_prototype$processNestedTemplates_$$ = function($JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache_prototype$processNestedTemplates_$self$$, $content$jscomp$20$$) {
  _.$iterateCursor$$module$src$dom$$($content$jscomp$20$$.querySelectorAll("template"), function($content$jscomp$20$$, $index$jscomp$129_nestedTemplateKey$$) {
    $index$jscomp$129_nestedTemplateKey$$ = "__AMP_NESTED_TEMPLATE_" + $index$jscomp$129_nestedTemplateKey$$;
    $JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache_prototype$processNestedTemplates_$self$$.$G$[$index$jscomp$129_nestedTemplateKey$$] = $content$jscomp$20$$.outerHTML;
    $content$jscomp$20$$.parentNode.replaceChild($JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache_prototype$processNestedTemplates_$self$$.element.ownerDocument.createTextNode("{{{" + $index$jscomp$129_nestedTemplateKey$$ + "}}}"), $content$jscomp$20$$);
  });
}, $JSCompiler_StaticMethods_serializeHtml_$$ = function($JSCompiler_StaticMethods_serializeHtml_$self_root$jscomp$68$$, $html$jscomp$18_sanitized$jscomp$1$$) {
  $JSCompiler_StaticMethods_serializeHtml_$self_root$jscomp$68$$ = $JSCompiler_StaticMethods_serializeHtml_$self_root$jscomp$68$$.$win$.document.createElement("div");
  var $diffing$jscomp$4$$ = _.$isExperimentOn$$module$src$experiments$$(window.self, "amp-list-diffing");
  $html$jscomp$18_sanitized$jscomp$1$$ = $sanitizeHtml$$module$src$sanitizer$$($html$jscomp$18_sanitized$jscomp$1$$, $diffing$jscomp$4$$);
  $JSCompiler_StaticMethods_serializeHtml_$self_root$jscomp$68$$.innerHTML = $html$jscomp$18_sanitized$jscomp$1$$;
  return _.$JSCompiler_StaticMethods_unwrap$$($JSCompiler_StaticMethods_serializeHtml_$self_root$jscomp$68$$);
}, $URI$$module$third_party$caja$html_sanitizer$$ = function() {
  function $parse$jscomp$5$$($parse$jscomp$5$$) {
    return ($parse$jscomp$5$$ = ("" + $parse$jscomp$5$$).match($URI_RE_$$)) ? new $URI$$($nullIfAbsent$$($parse$jscomp$5$$[1]), $nullIfAbsent$$($parse$jscomp$5$$[2]), $nullIfAbsent$$($parse$jscomp$5$$[3]), $nullIfAbsent$$($parse$jscomp$5$$[4]), $nullIfAbsent$$($parse$jscomp$5$$[5]), $nullIfAbsent$$($parse$jscomp$5$$[6]), $nullIfAbsent$$($parse$jscomp$5$$[7])) : null;
  }
  function $encodeIfExists2$$($parse$jscomp$5$$, $encodeIfExists2$$) {
    return "string" == typeof $parse$jscomp$5$$ ? (0,window.encodeURI)($parse$jscomp$5$$).replace($encodeIfExists2$$, $encodeOne$$) : null;
  }
  function $encodeOne$$($parse$jscomp$5$$) {
    $parse$jscomp$5$$ = $parse$jscomp$5$$.charCodeAt(0);
    return "%" + "0123456789ABCDEF".charAt($parse$jscomp$5$$ >> 4 & 15) + "0123456789ABCDEF".charAt($parse$jscomp$5$$ & 15);
  }
  function $collapse_dots$$($parse$jscomp$5$$) {
    if (null === $parse$jscomp$5$$) {
      return null;
    }
    $parse$jscomp$5$$ = $parse$jscomp$5$$.replace(/(^|\/)\.(?:\/|$)/g, "$1").replace(/\/{2,}/g, "/");
    for (var $encodeIfExists2$$ = $PARENT_DIRECTORY_HANDLER_RE$$, $encodeOne$$; ($encodeOne$$ = $parse$jscomp$5$$.replace($encodeIfExists2$$, "$1")) != $parse$jscomp$5$$; $parse$jscomp$5$$ = $encodeOne$$) {
    }
    return $parse$jscomp$5$$;
  }
  function $resolve$jscomp$61$$($parse$jscomp$5$$, $encodeIfExists2$$) {
    $parse$jscomp$5$$ = $parse$jscomp$5$$.clone();
    var $encodeOne$$ = $encodeIfExists2$$.$hasScheme$();
    $encodeOne$$ ? $parse$jscomp$5$$.$setRawScheme$($encodeIfExists2$$.$scheme_$) : $encodeOne$$ = $encodeIfExists2$$.$hasCredentials$();
    $encodeOne$$ ? $parse$jscomp$5$$.$setRawCredentials$($encodeIfExists2$$.$credentials_$) : $encodeOne$$ = $encodeIfExists2$$.$hasDomain$();
    $encodeOne$$ ? $parse$jscomp$5$$.$setRawDomain$($encodeIfExists2$$.$domain_$) : $encodeOne$$ = $encodeIfExists2$$.$hasPort$();
    var $resolve$jscomp$61$$ = $encodeIfExists2$$.$URI$path_$, $URI$$ = $collapse_dots$$($resolve$jscomp$61$$);
    if ($encodeOne$$) {
      $parse$jscomp$5$$.$setPort$($encodeIfExists2$$.$getPort$()), $URI$$ = $URI$$ && $URI$$.replace($EXTRA_PARENT_PATHS_RE$$, "");
    } else {
      if ($encodeOne$$ = !!$resolve$jscomp$61$$) {
        if (47 !== $URI$$.charCodeAt(0)) {
          $URI$$ = $collapse_dots$$($parse$jscomp$5$$.$URI$path_$ || "").replace($EXTRA_PARENT_PATHS_RE$$, "");
          var $nullIfAbsent$$ = $URI$$.lastIndexOf("/") + 1;
          $URI$$ = $collapse_dots$$(($nullIfAbsent$$ ? $URI$$.substring(0, $nullIfAbsent$$) : "") + $collapse_dots$$($resolve$jscomp$61$$)).replace($EXTRA_PARENT_PATHS_RE$$, "");
        }
      } else {
        $URI$$ = $URI$$ && $URI$$.replace($EXTRA_PARENT_PATHS_RE$$, ""), $URI$$ !== $resolve$jscomp$61$$ && $parse$jscomp$5$$.$setRawPath$($URI$$);
      }
    }
    $encodeOne$$ ? $parse$jscomp$5$$.$setRawPath$($URI$$) : $encodeOne$$ = $encodeIfExists2$$.$hasQuery$();
    $encodeOne$$ ? $parse$jscomp$5$$.$setRawQuery$($encodeIfExists2$$.$URI$query_$) : $encodeOne$$ = $encodeIfExists2$$.$hasFragment$();
    $encodeOne$$ && $parse$jscomp$5$$.$setRawFragment$($encodeIfExists2$$.$URI$fragment_$);
    return $parse$jscomp$5$$;
  }
  function $URI$$($parse$jscomp$5$$, $encodeIfExists2$$, $encodeOne$$, $collapse_dots$$, $resolve$jscomp$61$$, $URI$$, $nullIfAbsent$$) {
    this.$scheme_$ = $parse$jscomp$5$$;
    this.$credentials_$ = $encodeIfExists2$$;
    this.$domain_$ = $encodeOne$$;
    this.$D$ = $collapse_dots$$;
    this.$URI$path_$ = $resolve$jscomp$61$$;
    this.$URI$query_$ = $URI$$;
    this.$URI$fragment_$ = $nullIfAbsent$$;
  }
  function $nullIfAbsent$$($parse$jscomp$5$$) {
    return "string" == typeof $parse$jscomp$5$$ && 0 < $parse$jscomp$5$$.length ? $parse$jscomp$5$$ : null;
  }
  var $PARENT_DIRECTORY_HANDLER_RE$$ = new RegExp(/(\/|^)(?:[^./][^/]*|\.{2,}(?:[^./][^/]*)|\.{3,}[^/]*)\/\.\.(?:\/|$)/), $EXTRA_PARENT_PATHS_RE$$ = /^(?:\.\.\/)*(?:\.\.$)?/;
  $URI$$.prototype.toString = function() {
    var $parse$jscomp$5$$ = [];
    null !== this.$scheme_$ && $parse$jscomp$5$$.push(this.$scheme_$, ":");
    null !== this.$domain_$ && ($parse$jscomp$5$$.push("//"), null !== this.$credentials_$ && $parse$jscomp$5$$.push(this.$credentials_$, "@"), $parse$jscomp$5$$.push(this.$domain_$), null !== this.$D$ && $parse$jscomp$5$$.push(":", this.$D$.toString()));
    null !== this.$URI$path_$ && $parse$jscomp$5$$.push(this.$URI$path_$);
    null !== this.$URI$query_$ && $parse$jscomp$5$$.push("?", this.$URI$query_$);
    null !== this.$URI$fragment_$ && $parse$jscomp$5$$.push("#", this.$URI$fragment_$);
    return $parse$jscomp$5$$.join("");
  };
  $URI$$.prototype.clone = function() {
    return new $URI$$(this.$scheme_$, this.$credentials_$, this.$domain_$, this.$D$, this.$URI$path_$, this.$URI$query_$, this.$URI$fragment_$);
  };
  $URI$$.prototype.$getScheme$ = function() {
    return this.$scheme_$ && (0,window.decodeURIComponent)(this.$scheme_$).toLowerCase();
  };
  $URI$$.prototype.$setRawScheme$ = function($parse$jscomp$5$$) {
    this.$scheme_$ = $parse$jscomp$5$$ ? $parse$jscomp$5$$ : null;
  };
  $URI$$.prototype.$hasScheme$ = function() {
    return null !== this.$scheme_$;
  };
  $URI$$.prototype.$setRawCredentials$ = function($parse$jscomp$5$$) {
    this.$credentials_$ = $parse$jscomp$5$$ ? $parse$jscomp$5$$ : null;
  };
  $URI$$.prototype.$hasCredentials$ = function() {
    return null !== this.$credentials_$;
  };
  $URI$$.prototype.$setRawDomain$ = function($parse$jscomp$5$$) {
    this.$domain_$ = $parse$jscomp$5$$ ? $parse$jscomp$5$$ : null;
    this.$setRawPath$(this.$URI$path_$);
  };
  $URI$$.prototype.$hasDomain$ = function() {
    return null !== this.$domain_$;
  };
  $URI$$.prototype.$getPort$ = function() {
    return this.$D$ && (0,window.decodeURIComponent)(this.$D$);
  };
  $URI$$.prototype.$setPort$ = function($parse$jscomp$5$$) {
    if ($parse$jscomp$5$$) {
      $parse$jscomp$5$$ = Number($parse$jscomp$5$$);
      if ($parse$jscomp$5$$ !== ($parse$jscomp$5$$ & 65535)) {
        throw Error("Bad port number " + $parse$jscomp$5$$);
      }
      this.$D$ = "" + $parse$jscomp$5$$;
    } else {
      this.$D$ = null;
    }
  };
  $URI$$.prototype.$hasPort$ = function() {
    return null !== this.$D$;
  };
  $URI$$.prototype.$F$ = function() {
    return this.$URI$path_$ && (0,window.decodeURIComponent)(this.$URI$path_$);
  };
  $URI$$.prototype.$setRawPath$ = function($parse$jscomp$5$$) {
    $parse$jscomp$5$$ ? ($parse$jscomp$5$$ = String($parse$jscomp$5$$), this.$URI$path_$ = !this.$domain_$ || /^\//.test($parse$jscomp$5$$) ? $parse$jscomp$5$$ : "/" + $parse$jscomp$5$$) : this.$URI$path_$ = null;
  };
  $URI$$.prototype.$setRawQuery$ = function($parse$jscomp$5$$) {
    this.$URI$query_$ = $parse$jscomp$5$$ ? $parse$jscomp$5$$ : null;
  };
  $URI$$.prototype.$hasQuery$ = function() {
    return null !== this.$URI$query_$;
  };
  $URI$$.prototype.$G$ = function($parse$jscomp$5$$) {
    if ("object" === typeof $parse$jscomp$5$$ && !($parse$jscomp$5$$ instanceof Array) && ($parse$jscomp$5$$ instanceof Object || "[object Array]" !== Object.prototype.toString.call($parse$jscomp$5$$))) {
      var $encodeIfExists2$$ = [], $encodeOne$$ = -1;
      for ($URI$$ in $parse$jscomp$5$$) {
        var $collapse_dots$$ = $parse$jscomp$5$$[$URI$$];
        "string" === typeof $collapse_dots$$ && ($encodeIfExists2$$[++$encodeOne$$] = $URI$$, $encodeIfExists2$$[++$encodeOne$$] = $collapse_dots$$);
      }
      $parse$jscomp$5$$ = $encodeIfExists2$$;
    }
    $encodeIfExists2$$ = [];
    $encodeOne$$ = "";
    for (var $resolve$jscomp$61$$ = 0; $resolve$jscomp$61$$ < $parse$jscomp$5$$.length;) {
      var $URI$$ = $parse$jscomp$5$$[$resolve$jscomp$61$$++];
      $collapse_dots$$ = $parse$jscomp$5$$[$resolve$jscomp$61$$++];
      $encodeIfExists2$$.push($encodeOne$$, (0,window.encodeURIComponent)($URI$$.toString()));
      $encodeOne$$ = "&";
      $collapse_dots$$ && $encodeIfExists2$$.push("=", (0,window.encodeURIComponent)($collapse_dots$$.toString()));
    }
    this.$URI$query_$ = $encodeIfExists2$$.join("");
  };
  $URI$$.prototype.$setRawFragment$ = function($parse$jscomp$5$$) {
    this.$URI$fragment_$ = $parse$jscomp$5$$ ? $parse$jscomp$5$$ : null;
  };
  $URI$$.prototype.$hasFragment$ = function() {
    return null !== this.$URI$fragment_$;
  };
  var $URI_RE_$$ = /^(?:([^:/?#]+):)?(?:\/\/(?:([^/?#]*)@)?([^/?#:@]*)(?::([0-9]+))?)?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/, $URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_$$ = /[#\/\?@]/g, $URI_DISALLOWED_IN_PATH_$$ = /[#\?]/g;
  $URI$$.parse = $parse$jscomp$5$$;
  $URI$$.create = function($parse$jscomp$5$$, $collapse_dots$$, $resolve$jscomp$61$$, $nullIfAbsent$$, $PARENT_DIRECTORY_HANDLER_RE$$, $EXTRA_PARENT_PATHS_RE$$, $URI_RE_$$) {
    $parse$jscomp$5$$ = new $URI$$($encodeIfExists2$$($parse$jscomp$5$$, $URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_$$), $encodeIfExists2$$($collapse_dots$$, $URI_DISALLOWED_IN_SCHEME_OR_CREDENTIALS_$$), "string" == typeof $resolve$jscomp$61$$ ? (0,window.encodeURIComponent)($resolve$jscomp$61$$) : null, 0 < $nullIfAbsent$$ ? $nullIfAbsent$$.toString() : null, $encodeIfExists2$$($PARENT_DIRECTORY_HANDLER_RE$$, $URI_DISALLOWED_IN_PATH_$$), null, "string" == typeof $URI_RE_$$ ? (0,window.encodeURIComponent)($URI_RE_$$) : 
    null);
    $EXTRA_PARENT_PATHS_RE$$ && ("string" === typeof $EXTRA_PARENT_PATHS_RE$$ ? $parse$jscomp$5$$.$setRawQuery$($EXTRA_PARENT_PATHS_RE$$.replace(/[^?&=0-9A-Za-z_\-~.%]/g, $encodeOne$$)) : $parse$jscomp$5$$.$G$($EXTRA_PARENT_PATHS_RE$$));
    return $parse$jscomp$5$$;
  };
  $URI$$.resolve = $resolve$jscomp$61$$;
  $URI$$.$D$ = $collapse_dots$$;
  $URI$$.$F$ = {$mimeTypeOf$:function($encodeIfExists2$$) {
    $encodeIfExists2$$ = $parse$jscomp$5$$($encodeIfExists2$$);
    return /\.html$/.test($encodeIfExists2$$.$F$()) ? "text/html" : "application/javascript";
  }, resolve:function($encodeIfExists2$$, $encodeOne$$) {
    return $encodeIfExists2$$ ? $resolve$jscomp$61$$($parse$jscomp$5$$($encodeIfExists2$$), $parse$jscomp$5$$($encodeOne$$)).toString() : "" + $encodeOne$$;
  }};
  return $URI$$;
}(), $html4$$module$third_party$caja$html_sanitizer$$ = {$atype$:{NONE:0, URI:1, URI_FRAGMENT:11, SCRIPT:2, STYLE:3, HTML:12, ID:4, IDREF:5, IDREFS:6, GLOBAL_NAME:7, LOCAL_NAME:8, CLASSES:9, FRAME_TARGET:10, MEDIA_QUERY:13}};
$html4$$module$third_party$caja$html_sanitizer$$.atype = $html4$$module$third_party$caja$html_sanitizer$$.$atype$;
$html4$$module$third_party$caja$html_sanitizer$$.$ATTRIBS$ = {"*::class":9, "*::dir":0, "*::draggable":0, "*::hidden":0, "*::id":4, "*::inert":0, "*::itemprop":0, "*::itemref":6, "*::itemscope":0, "*::lang":0, "*::onblur":2, "*::onchange":2, "*::onclick":2, "*::ondblclick":2, "*::onerror":2, "*::onfocus":2, "*::onkeydown":2, "*::onkeypress":2, "*::onkeyup":2, "*::onload":2, "*::onmousedown":2, "*::onmousemove":2, "*::onmouseout":2, "*::onmouseover":2, "*::onmouseup":2, "*::onreset":2, "*::onscroll":2, 
"*::onselect":2, "*::onsubmit":2, "*::ontouchcancel":2, "*::ontouchend":2, "*::ontouchenter":2, "*::ontouchleave":2, "*::ontouchmove":2, "*::ontouchstart":2, "*::onunload":2, "*::spellcheck":0, "*::style":3, "*::tabindex":0, "*::title":0, "*::translate":0, "a::accesskey":0, "a::coords":0, "a::href":1, "a::hreflang":0, "a::name":7, "a::onblur":2, "a::onfocus":2, "a::shape":0, "a::target":10, "a::type":0, "area::accesskey":0, "area::alt":0, "area::coords":0, "area::href":1, "area::nohref":0, "area::onblur":2, 
"area::onfocus":2, "area::shape":0, "area::target":10, "audio::controls":0, "audio::loop":0, "audio::mediagroup":5, "audio::muted":0, "audio::preload":0, "audio::src":1, "bdo::dir":0, "blockquote::cite":1, "br::clear":0, "button::accesskey":0, "button::disabled":0, "button::name":8, "button::onblur":2, "button::onfocus":2, "button::type":0, "button::value":0, "canvas::height":0, "canvas::width":0, "caption::align":0, "col::align":0, "col::char":0, "col::charoff":0, "col::span":0, "col::valign":0, 
"col::width":0, "colgroup::align":0, "colgroup::char":0, "colgroup::charoff":0, "colgroup::span":0, "colgroup::valign":0, "colgroup::width":0, "command::checked":0, "command::command":5, "command::disabled":0, "command::icon":1, "command::label":0, "command::radiogroup":0, "command::type":0, "data::value":0, "del::cite":1, "del::datetime":0, "details::open":0, "dir::compact":0, "div::align":0, "dl::compact":0, "fieldset::disabled":0, "font::color":0, "font::face":0, "font::size":0, "form::accept":0, 
"form::action":1, "form::autocomplete":0, "form::enctype":0, "form::method":0, "form::name":7, "form::novalidate":0, "form::onreset":2, "form::onsubmit":2, "form::target":10, "h1::align":0, "h2::align":0, "h3::align":0, "h4::align":0, "h5::align":0, "h6::align":0, "hr::align":0, "hr::noshade":0, "hr::size":0, "hr::width":0, "iframe::align":0, "iframe::frameborder":0, "iframe::height":0, "iframe::marginheight":0, "iframe::marginwidth":0, "iframe::width":0, "img::align":0, "img::alt":0, "img::border":0, 
"img::height":0, "img::hspace":0, "img::ismap":0, "img::name":7, "img::src":1, "img::usemap":11, "img::vspace":0, "img::width":0, "input::accept":0, "input::accesskey":0, "input::align":0, "input::alt":0, "input::autocomplete":0, "input::checked":0, "input::disabled":0, "input::inputmode":0, "input::ismap":0, "input::list":5, "input::max":0, "input::maxlength":0, "input::min":0, "input::multiple":0, "input::name":8, "input::onblur":2, "input::onchange":2, "input::onfocus":2, "input::onselect":2, 
"input::pattern":0, "input::placeholder":0, "input::readonly":0, "input::required":0, "input::size":0, "input::src":1, "input::step":0, "input::type":0, "input::usemap":11, "input::value":0, "ins::cite":1, "ins::datetime":0, "label::accesskey":0, "label::for":5, "label::onblur":2, "label::onfocus":2, "legend::accesskey":0, "legend::align":0, "li::type":0, "li::value":0, "map::name":7, "menu::compact":0, "menu::label":0, "menu::type":0, "meter::high":0, "meter::low":0, "meter::max":0, "meter::min":0, 
"meter::optimum":0, "meter::value":0, "ol::compact":0, "ol::reversed":0, "ol::start":0, "ol::type":0, "optgroup::disabled":0, "optgroup::label":0, "option::disabled":0, "option::label":0, "option::selected":0, "option::value":0, "output::for":6, "output::name":8, "p::align":0, "pre::width":0, "progress::max":0, "progress::min":0, "progress::value":0, "q::cite":1, "select::autocomplete":0, "select::disabled":0, "select::multiple":0, "select::name":8, "select::onblur":2, "select::onchange":2, "select::onfocus":2, 
"select::required":0, "select::size":0, "source::src":1, "source::type":0, "table::align":0, "table::bgcolor":0, "table::border":0, "table::cellpadding":0, "table::cellspacing":0, "table::frame":0, "table::rules":0, "table::summary":0, "table::width":0, "tbody::align":0, "tbody::char":0, "tbody::charoff":0, "tbody::valign":0, "td::abbr":0, "td::align":0, "td::axis":0, "td::bgcolor":0, "td::char":0, "td::charoff":0, "td::colspan":0, "td::headers":6, "td::height":0, "td::nowrap":0, "td::rowspan":0, 
"td::scope":0, "td::valign":0, "td::width":0, "template::type":0, "textarea::accesskey":0, "textarea::autocomplete":0, "textarea::cols":0, "textarea::disabled":0, "textarea::inputmode":0, "textarea::name":8, "textarea::onblur":2, "textarea::onchange":2, "textarea::onfocus":2, "textarea::onselect":2, "textarea::placeholder":0, "textarea::readonly":0, "textarea::required":0, "textarea::rows":0, "textarea::wrap":0, "tfoot::align":0, "tfoot::char":0, "tfoot::charoff":0, "tfoot::valign":0, "th::abbr":0, 
"th::align":0, "th::axis":0, "th::bgcolor":0, "th::char":0, "th::charoff":0, "th::colspan":0, "th::headers":6, "th::height":0, "th::nowrap":0, "th::rowspan":0, "th::scope":0, "th::valign":0, "th::width":0, "thead::align":0, "thead::char":0, "thead::charoff":0, "thead::valign":0, "tr::align":0, "tr::bgcolor":0, "tr::char":0, "tr::charoff":0, "tr::valign":0, "track::default":0, "track::kind":0, "track::label":0, "track::srclang":0, "ul::compact":0, "ul::type":0, "video::controls":0, "video::height":0, 
"video::loop":0, "video::mediagroup":5, "video::muted":0, "video::poster":1, "video::preload":0, "video::src":1, "video::width":0};
$html4$$module$third_party$caja$html_sanitizer$$.ATTRIBS = $html4$$module$third_party$caja$html_sanitizer$$.$ATTRIBS$;
$html4$$module$third_party$caja$html_sanitizer$$.$eflags$ = {OPTIONAL_ENDTAG:1, EMPTY:2, CDATA:4, RCDATA:8, UNSAFE:16, FOLDABLE:32, SCRIPT:64, STYLE:128, VIRTUALIZED:256};
$html4$$module$third_party$caja$html_sanitizer$$.eflags = $html4$$module$third_party$caja$html_sanitizer$$.$eflags$;
$html4$$module$third_party$caja$html_sanitizer$$.$ELEMENTS$ = {a:0, abbr:0, acronym:0, address:0, applet:272, area:2, article:0, aside:0, audio:0, b:0, base:274, basefont:274, bdi:0, bdo:0, big:0, blockquote:0, body:305, br:2, button:0, canvas:0, caption:0, center:0, cite:0, code:0, col:2, colgroup:1, command:2, data:0, datalist:0, dd:1, del:0, details:0, dfn:0, dialog:272, dir:0, div:0, dl:0, dt:1, em:0, fieldset:0, figcaption:0, figure:0, font:0, footer:0, form:0, frame:274, frameset:272, h1:0, 
h2:0, h3:0, h4:0, h5:0, h6:0, head:305, header:0, hgroup:0, hr:2, html:305, i:0, iframe:4, img:2, input:2, ins:0, isindex:274, kbd:0, keygen:274, label:0, legend:0, li:1, link:274, map:0, mark:0, menu:0, meta:274, meter:0, nav:0, nobr:0, noembed:276, noframes:276, noscript:276, object:272, ol:0, optgroup:0, option:1, output:0, p:1, param:274, pre:0, progress:0, q:0, s:0, samp:0, script:84, section:0, select:0, small:0, source:2, span:0, strike:0, strong:0, style:148, sub:0, summary:0, sup:0, table:0, 
tbody:1, td:1, template:4, textarea:8, tfoot:1, th:1, thead:1, time:0, title:280, tr:1, track:2, tt:0, u:0, ul:0, "var":0, video:0, wbr:2};
$html4$$module$third_party$caja$html_sanitizer$$.ELEMENTS = $html4$$module$third_party$caja$html_sanitizer$$.$ELEMENTS$;
$html4$$module$third_party$caja$html_sanitizer$$.$ELEMENT_DOM_INTERFACES$ = {a:"HTMLAnchorElement", abbr:"HTMLElement", acronym:"HTMLElement", address:"HTMLElement", applet:"HTMLAppletElement", area:"HTMLAreaElement", article:"HTMLElement", aside:"HTMLElement", audio:"HTMLAudioElement", b:"HTMLElement", base:"HTMLBaseElement", basefont:"HTMLBaseFontElement", bdi:"HTMLElement", bdo:"HTMLElement", big:"HTMLElement", blockquote:"HTMLQuoteElement", body:"HTMLBodyElement", br:"HTMLBRElement", button:"HTMLButtonElement", 
canvas:"HTMLCanvasElement", caption:"HTMLTableCaptionElement", center:"HTMLElement", cite:"HTMLElement", code:"HTMLElement", col:"HTMLTableColElement", colgroup:"HTMLTableColElement", command:"HTMLCommandElement", data:"HTMLElement", datalist:"HTMLDataListElement", dd:"HTMLElement", del:"HTMLModElement", details:"HTMLDetailsElement", dfn:"HTMLElement", dialog:"HTMLDialogElement", dir:"HTMLDirectoryElement", div:"HTMLDivElement", dl:"HTMLDListElement", dt:"HTMLElement", em:"HTMLElement", fieldset:"HTMLFieldSetElement", 
figcaption:"HTMLElement", figure:"HTMLElement", font:"HTMLFontElement", footer:"HTMLElement", form:"HTMLFormElement", frame:"HTMLFrameElement", frameset:"HTMLFrameSetElement", h1:"HTMLHeadingElement", h2:"HTMLHeadingElement", h3:"HTMLHeadingElement", h4:"HTMLHeadingElement", h5:"HTMLHeadingElement", h6:"HTMLHeadingElement", head:"HTMLHeadElement", header:"HTMLElement", hgroup:"HTMLElement", hr:"HTMLHRElement", html:"HTMLHtmlElement", i:"HTMLElement", iframe:"HTMLIFrameElement", img:"HTMLImageElement", 
input:"HTMLInputElement", ins:"HTMLModElement", isindex:"HTMLUnknownElement", kbd:"HTMLElement", keygen:"HTMLKeygenElement", label:"HTMLLabelElement", legend:"HTMLLegendElement", li:"HTMLLIElement", link:"HTMLLinkElement", map:"HTMLMapElement", mark:"HTMLElement", menu:"HTMLMenuElement", meta:"HTMLMetaElement", meter:"HTMLMeterElement", nav:"HTMLElement", nobr:"HTMLElement", noembed:"HTMLElement", noframes:"HTMLElement", noscript:"HTMLElement", object:"HTMLObjectElement", ol:"HTMLOListElement", optgroup:"HTMLOptGroupElement", 
option:"HTMLOptionElement", output:"HTMLOutputElement", p:"HTMLParagraphElement", param:"HTMLParamElement", pre:"HTMLPreElement", progress:"HTMLProgressElement", q:"HTMLQuoteElement", s:"HTMLElement", samp:"HTMLElement", script:"HTMLScriptElement", section:"HTMLElement", select:"HTMLSelectElement", small:"HTMLElement", source:"HTMLSourceElement", span:"HTMLSpanElement", strike:"HTMLElement", strong:"HTMLElement", style:"HTMLStyleElement", sub:"HTMLElement", summary:"HTMLElement", sup:"HTMLElement", 
table:"HTMLTableElement", tbody:"HTMLTableSectionElement", td:"HTMLTableDataCellElement", template:"HTMLTemplateElement", textarea:"HTMLTextAreaElement", tfoot:"HTMLTableSectionElement", th:"HTMLTableHeaderCellElement", thead:"HTMLTableSectionElement", time:"HTMLTimeElement", title:"HTMLTitleElement", tr:"HTMLTableRowElement", track:"HTMLTrackElement", tt:"HTMLElement", u:"HTMLElement", ul:"HTMLUListElement", "var":"HTMLElement", video:"HTMLVideoElement", wbr:"HTMLElement"};
$html4$$module$third_party$caja$html_sanitizer$$.ELEMENT_DOM_INTERFACES = $html4$$module$third_party$caja$html_sanitizer$$.$ELEMENT_DOM_INTERFACES$;
$html4$$module$third_party$caja$html_sanitizer$$.$ueffects$ = {NOT_LOADED:0, SAME_DOCUMENT:1, NEW_DOCUMENT:2};
$html4$$module$third_party$caja$html_sanitizer$$.ueffects = $html4$$module$third_party$caja$html_sanitizer$$.$ueffects$;
$html4$$module$third_party$caja$html_sanitizer$$.$URIEFFECTS$ = {"a::href":2, "area::href":2, "audio::src":1, "blockquote::cite":0, "command::icon":1, "del::cite":0, "form::action":2, "img::src":1, "input::src":1, "ins::cite":0, "q::cite":0, "video::poster":1, "video::src":1};
$html4$$module$third_party$caja$html_sanitizer$$.URIEFFECTS = $html4$$module$third_party$caja$html_sanitizer$$.$URIEFFECTS$;
$html4$$module$third_party$caja$html_sanitizer$$.$ltypes$ = {UNSANDBOXED:2, SANDBOXED:1, DATA:0};
$html4$$module$third_party$caja$html_sanitizer$$.ltypes = $html4$$module$third_party$caja$html_sanitizer$$.$ltypes$;
$html4$$module$third_party$caja$html_sanitizer$$.$LOADERTYPES$ = {"a::href":2, "area::href":2, "audio::src":2, "blockquote::cite":2, "command::icon":1, "del::cite":2, "form::action":2, "img::src":1, "input::src":1, "ins::cite":2, "q::cite":2, "video::poster":1, "video::src":2};
$html4$$module$third_party$caja$html_sanitizer$$.LOADERTYPES = $html4$$module$third_party$caja$html_sanitizer$$.$LOADERTYPES$;
var $html$$module$third_party$caja$html_sanitizer$$ = function($html4$$) {
  function $lookupEntity$$($html4$$) {
    if ($ENTITIES$$.hasOwnProperty($html4$$)) {
      return $ENTITIES$$[$html4$$];
    }
    var $lookupEntity$$ = $html4$$.match($decimalEscapeRe$$);
    return $lookupEntity$$ ? String.fromCharCode((0,window.parseInt)($lookupEntity$$[1], 10)) : ($lookupEntity$$ = $html4$$.match($hexEscapeRe$$)) ? String.fromCharCode((0,window.parseInt)($lookupEntity$$[1], 16)) : $entityLookupElement$$ && $safeEntityNameRe$$.test($html4$$) ? ($entityLookupElement$$.innerHTML = "&" + $html4$$ + ";", $lookupEntity$$ = $entityLookupElement$$.textContent, $ENTITIES$$[$html4$$] = $lookupEntity$$) : "&" + $html4$$ + ";";
  }
  function $decodeOneEntity$$($html4$$, $decodeOneEntity$$) {
    return $lookupEntity$$($decodeOneEntity$$);
  }
  function $unescapeEntities$$($html4$$) {
    return $html4$$.replace($ENTITY_RE_1$$, $decodeOneEntity$$);
  }
  function $escapeAttrib$$($html4$$) {
    return ("" + $html4$$).replace($ampRe$$, "&amp;").replace($ltRe$$, "&lt;").replace($gtRe$$, "&gt;").replace($quotRe$$, "&#34;");
  }
  function $normalizeRCData$$($html4$$) {
    return $html4$$.replace($looseAmpRe$$, "&amp;$1").replace($ltRe$$, "&lt;").replace($gtRe$$, "&gt;");
  }
  function $makeSaxParser$$($html4$$) {
    var $lookupEntity$$ = {$cdata$:$html4$$.$cdata$ || $html4$$.cdata, $comment$:$html4$$.$comment$ || $html4$$.comment, $endDoc$:$html4$$.$endDoc$ || $html4$$.endDoc, $endTag$:$html4$$.$endTag$ || $html4$$.endTag, $pcdata$:$html4$$.$pcdata$ || $html4$$.pcdata, $rcdata$:$html4$$.$rcdata$ || $html4$$.rcdata, $startDoc$:$html4$$.$startDoc$ || $html4$$.startDoc, $startTag$:$html4$$.$startTag$ || $html4$$.startTag};
    return function($html4$$, $decodeOneEntity$$) {
      var $unescapeEntities$$ = /(<\/|\x3c!--|<[!?]|[&<>])/g;
      if ($splitWillCapture$$) {
        $html4$$ = $html4$$.split($unescapeEntities$$);
      } else {
        for (var $escapeAttrib$$ = [], $normalizeRCData$$ = 0, $makeSaxParser$$; null !== ($makeSaxParser$$ = $unescapeEntities$$.exec($html4$$));) {
          $escapeAttrib$$.push($html4$$.substring($normalizeRCData$$, $makeSaxParser$$.index)), $escapeAttrib$$.push($makeSaxParser$$[0]), $normalizeRCData$$ = $makeSaxParser$$.index + $makeSaxParser$$[0].length;
        }
        $escapeAttrib$$.push($html4$$.substring($normalizeRCData$$));
        $html4$$ = $escapeAttrib$$;
      }
      $parseCPS$$($lookupEntity$$, $html4$$, 0, {$noMoreGT$:!1, $noMoreEndComments$:!1}, $decodeOneEntity$$);
    };
  }
  function $continuationMaker$$($html4$$, $lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$) {
    return function() {
      $parseCPS$$($html4$$, $lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$);
    };
  }
  function $parseCPS$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$) {
    try {
      $lookupEntity$$.$startDoc$ && 0 == $unescapeEntities$$ && $lookupEntity$$.$startDoc$($normalizeRCData$$);
      for (var $makeSaxParser$$, $parseCPS$$, $makeHtmlSanitizer$$, $safeUri$$ = $decodeOneEntity$$.length; $unescapeEntities$$ < $safeUri$$;) {
        var $lookupAttribute$$ = $decodeOneEntity$$[$unescapeEntities$$++], $log$$ = $decodeOneEntity$$[$unescapeEntities$$];
        switch($lookupAttribute$$) {
          case "&":
            $ENTITY_RE_2$$.test($log$$) ? ($lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&" + $log$$, $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$)), $unescapeEntities$$++) : $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&amp;", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            break;
          case "</":
            if ($makeSaxParser$$ = /^([-\w:]+)[^'"]*/.exec($log$$)) {
              if ($makeSaxParser$$[0].length === $log$$.length && ">" === $decodeOneEntity$$[$unescapeEntities$$ + 1]) {
                $unescapeEntities$$ += 2, $makeHtmlSanitizer$$ = $makeSaxParser$$[1].toLowerCase(), $lookupEntity$$.$endTag$ && $lookupEntity$$.$endTag$($makeHtmlSanitizer$$, $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
              } else {
                var $sanitizeAttribs$$ = $decodeOneEntity$$, $parts$jscomp$15$$ = $unescapeEntities$$, $ltRe$$ = $lookupEntity$$, $sanitizeWithPolicy$$ = $normalizeRCData$$, $ENTITIES$$ = $continuationMarker$$, $sanitizeCssProperty$$ = $escapeAttrib$$, $makeTagPolicy$$ = $parseTagAndAttrs$$($sanitizeAttribs$$, $parts$jscomp$15$$);
                $makeTagPolicy$$ ? ($ltRe$$.$endTag$ && $ltRe$$.$endTag$($makeTagPolicy$$.name, $sanitizeWithPolicy$$, $ENTITIES$$, $continuationMaker$$($ltRe$$, $sanitizeAttribs$$, $parts$jscomp$15$$, $sanitizeCssProperty$$, $sanitizeWithPolicy$$)), $unescapeEntities$$ = $makeTagPolicy$$.next) : $unescapeEntities$$ = $sanitizeAttribs$$.length;
              }
            } else {
              $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&lt;/", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            }
            break;
          case "<":
            if ($makeSaxParser$$ = /^([-\w:]+)\s*\/?/.exec($log$$)) {
              if ($makeSaxParser$$[0].length === $log$$.length && ">" === $decodeOneEntity$$[$unescapeEntities$$ + 1]) {
                $unescapeEntities$$ += 2;
                $makeHtmlSanitizer$$ = $makeSaxParser$$[1].toLowerCase();
                $lookupEntity$$.$startTag$ && $lookupEntity$$.$startTag$($makeHtmlSanitizer$$, [], $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
                var $eflags$$ = $html4$$.$ELEMENTS$[$makeHtmlSanitizer$$];
                $eflags$$ & $EFLAGS_TEXT$$ && ($unescapeEntities$$ = $parseText$$($decodeOneEntity$$, {name:$makeHtmlSanitizer$$, next:$unescapeEntities$$, $eflags$:$eflags$$}, $lookupEntity$$, $normalizeRCData$$, $continuationMarker$$, $escapeAttrib$$));
              } else {
                $sanitizeAttribs$$ = $decodeOneEntity$$;
                $parts$jscomp$15$$ = $lookupEntity$$;
                $ltRe$$ = $normalizeRCData$$;
                $sanitizeWithPolicy$$ = $continuationMarker$$;
                $ENTITIES$$ = $escapeAttrib$$;
                var $tag$jscomp$inline_3699$$ = $parseTagAndAttrs$$($sanitizeAttribs$$, $unescapeEntities$$);
                $tag$jscomp$inline_3699$$ ? ($parts$jscomp$15$$.$startTag$ && $parts$jscomp$15$$.$startTag$($tag$jscomp$inline_3699$$.name, $tag$jscomp$inline_3699$$.$attrs$, $ltRe$$, $sanitizeWithPolicy$$, $continuationMaker$$($parts$jscomp$15$$, $sanitizeAttribs$$, $tag$jscomp$inline_3699$$.next, $ENTITIES$$, $ltRe$$)), $unescapeEntities$$ = $tag$jscomp$inline_3699$$.$eflags$ & $EFLAGS_TEXT$$ ? $parseText$$($sanitizeAttribs$$, $tag$jscomp$inline_3699$$, $parts$jscomp$15$$, $ltRe$$, $sanitizeWithPolicy$$, 
                $ENTITIES$$) : $tag$jscomp$inline_3699$$.next) : $unescapeEntities$$ = $sanitizeAttribs$$.length;
              }
            } else {
              $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&lt;", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            }
            break;
          case "\x3c!--":
            if (!$escapeAttrib$$.$noMoreEndComments$) {
              for ($parseCPS$$ = $unescapeEntities$$ + 1; $parseCPS$$ < $safeUri$$ && (">" !== $decodeOneEntity$$[$parseCPS$$] || !/--$/.test($decodeOneEntity$$[$parseCPS$$ - 1])); $parseCPS$$++) {
              }
              if ($parseCPS$$ < $safeUri$$) {
                if ($lookupEntity$$.$comment$) {
                  var $ENTITY_RE_1$$ = $decodeOneEntity$$.slice($unescapeEntities$$, $parseCPS$$).join("");
                  $lookupEntity$$.$comment$($ENTITY_RE_1$$.substr(0, $ENTITY_RE_1$$.length - 2), $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $parseCPS$$ + 1, $escapeAttrib$$, $normalizeRCData$$));
                }
                $unescapeEntities$$ = $parseCPS$$ + 1;
              } else {
                $escapeAttrib$$.$noMoreEndComments$ = !0;
              }
            }
            $escapeAttrib$$.$noMoreEndComments$ && $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&lt;!--", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            break;
          case "<!":
            if (/^\w/.test($log$$)) {
              if (!$escapeAttrib$$.$noMoreGT$) {
                for ($parseCPS$$ = $unescapeEntities$$ + 1; $parseCPS$$ < $safeUri$$ && ">" !== $decodeOneEntity$$[$parseCPS$$]; $parseCPS$$++) {
                }
                $parseCPS$$ < $safeUri$$ ? $unescapeEntities$$ = $parseCPS$$ + 1 : $escapeAttrib$$.$noMoreGT$ = !0;
              }
              $escapeAttrib$$.$noMoreGT$ && $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&lt;!", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            } else {
              $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&lt;!", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            }
            break;
          case "<?":
            if (!$escapeAttrib$$.$noMoreGT$) {
              for ($parseCPS$$ = $unescapeEntities$$ + 1; $parseCPS$$ < $safeUri$$ && ">" !== $decodeOneEntity$$[$parseCPS$$]; $parseCPS$$++) {
              }
              $parseCPS$$ < $safeUri$$ ? $unescapeEntities$$ = $parseCPS$$ + 1 : $escapeAttrib$$.$noMoreGT$ = !0;
            }
            $escapeAttrib$$.$noMoreGT$ && $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&lt;?", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            break;
          case ">":
            $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$("&gt;", $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
            break;
          case "":
            break;
          default:
            $lookupEntity$$.$pcdata$ && $lookupEntity$$.$pcdata$($lookupAttribute$$, $normalizeRCData$$, $continuationMarker$$, $continuationMaker$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$));
        }
      }
      $lookupEntity$$.$endDoc$ && $lookupEntity$$.$endDoc$($normalizeRCData$$);
    } catch ($e$270$$) {
      if ($e$270$$ !== $continuationMarker$$) {
        throw $e$270$$;
      }
    }
  }
  function $parseText$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $makeSaxParser$$, $parseCPS$$) {
    var $parseText$$ = $lookupEntity$$.length;
    $endTagRe$$.hasOwnProperty($decodeOneEntity$$.name) || ($endTagRe$$[$decodeOneEntity$$.name] = new RegExp("^" + $decodeOneEntity$$.name + "(?:[\\s\\/]|$)", "i"));
    for (var $parseTagAndAttrs$$ = $endTagRe$$[$decodeOneEntity$$.name], $makeHtmlSanitizer$$ = $decodeOneEntity$$.next, $safeUri$$ = $decodeOneEntity$$.next + 1; $safeUri$$ < $parseText$$ && ("</" !== $lookupEntity$$[$safeUri$$ - 1] || !$parseTagAndAttrs$$.test($lookupEntity$$[$safeUri$$])); $safeUri$$++) {
    }
    $safeUri$$ < $parseText$$ && --$safeUri$$;
    $parseText$$ = $lookupEntity$$.slice($makeHtmlSanitizer$$, $safeUri$$).join("");
    if ($decodeOneEntity$$.$eflags$ & $html4$$.$eflags$.CDATA) {
      $unescapeEntities$$.$cdata$ && $unescapeEntities$$.$cdata$($parseText$$, $escapeAttrib$$, $makeSaxParser$$, $continuationMaker$$($unescapeEntities$$, $lookupEntity$$, $safeUri$$, $parseCPS$$, $escapeAttrib$$));
    } else {
      if ($decodeOneEntity$$.$eflags$ & $html4$$.$eflags$.RCDATA) {
        $unescapeEntities$$.$rcdata$ && $unescapeEntities$$.$rcdata$($normalizeRCData$$($parseText$$), $escapeAttrib$$, $makeSaxParser$$, $continuationMaker$$($unescapeEntities$$, $lookupEntity$$, $safeUri$$, $parseCPS$$, $escapeAttrib$$));
      } else {
        throw Error("bug");
      }
    }
    return $safeUri$$;
  }
  function $parseTagAndAttrs$$($lookupEntity$$, $decodeOneEntity$$) {
    var $escapeAttrib$$ = /^([-\w:]+)/.exec($lookupEntity$$[$decodeOneEntity$$]), $normalizeRCData$$ = {};
    $normalizeRCData$$.name = $escapeAttrib$$[1].toLowerCase();
    $normalizeRCData$$.$eflags$ = $html4$$.$ELEMENTS$[$normalizeRCData$$.name];
    var $makeSaxParser$$ = $lookupEntity$$[$decodeOneEntity$$].substr($escapeAttrib$$[0].length);
    $decodeOneEntity$$ += 1;
    for (var $continuationMaker$$ = $lookupEntity$$.length; $decodeOneEntity$$ < $continuationMaker$$ && ">" !== $lookupEntity$$[$decodeOneEntity$$]; $decodeOneEntity$$++) {
      $makeSaxParser$$ += $lookupEntity$$[$decodeOneEntity$$];
    }
    if (!($continuationMaker$$ <= $decodeOneEntity$$)) {
      for (var $parseCPS$$ = []; "" !== $makeSaxParser$$;) {
        if ($escapeAttrib$$ = $ATTR_RE$$.exec($makeSaxParser$$)) {
          if ($escapeAttrib$$[4] && !$escapeAttrib$$[5] || $escapeAttrib$$[6] && !$escapeAttrib$$[7]) {
            $escapeAttrib$$ = $escapeAttrib$$[4] || $escapeAttrib$$[6];
            var $parseText$$ = !1;
            for ($makeSaxParser$$ = [$makeSaxParser$$, $lookupEntity$$[$decodeOneEntity$$++]]; $decodeOneEntity$$ < $continuationMaker$$; $decodeOneEntity$$++) {
              if ($parseText$$) {
                if (">" === $lookupEntity$$[$decodeOneEntity$$]) {
                  break;
                }
              } else {
                0 <= $lookupEntity$$[$decodeOneEntity$$].indexOf($escapeAttrib$$) && ($parseText$$ = !0);
              }
              $makeSaxParser$$.push($lookupEntity$$[$decodeOneEntity$$]);
            }
            if ($continuationMaker$$ <= $decodeOneEntity$$) {
              break;
            }
            $makeSaxParser$$ = $makeSaxParser$$.join("");
          } else {
            $parseText$$ = $escapeAttrib$$[1].toLowerCase();
            if ($escapeAttrib$$[2]) {
              var $parseTagAndAttrs$$ = $escapeAttrib$$[3];
              var $makeHtmlSanitizer$$ = $parseTagAndAttrs$$.charCodeAt(0);
              if (34 === $makeHtmlSanitizer$$ || 39 === $makeHtmlSanitizer$$) {
                $parseTagAndAttrs$$ = $parseTagAndAttrs$$.substr(1, $parseTagAndAttrs$$.length - 2);
              }
              $parseTagAndAttrs$$ = $unescapeEntities$$($parseTagAndAttrs$$.replace($nulRe$$, ""));
            } else {
              $parseTagAndAttrs$$ = "";
            }
            $parseCPS$$.push($parseText$$, $parseTagAndAttrs$$);
            $makeSaxParser$$ = $makeSaxParser$$.substr($escapeAttrib$$[0].length);
          }
        } else {
          $makeSaxParser$$ = $makeSaxParser$$.replace(/^[\s\S][^a-z\s]*/, "");
        }
      }
      $normalizeRCData$$.$attrs$ = $parseCPS$$;
      $normalizeRCData$$.next = $decodeOneEntity$$ + 1;
      return $normalizeRCData$$;
    }
  }
  function $makeHtmlSanitizer$$($lookupEntity$$) {
    function $decodeOneEntity$$($html4$$, $lookupEntity$$) {
      $normalizeRCData$$ || $lookupEntity$$.push($html4$$);
    }
    var $unescapeEntities$$, $normalizeRCData$$;
    return $makeSaxParser$$({startDoc:function() {
      $unescapeEntities$$ = [];
      $normalizeRCData$$ = !1;
    }, startTag:function($decodeOneEntity$$, $makeSaxParser$$, $continuationMaker$$) {
      if (!$normalizeRCData$$ && $html4$$.$ELEMENTS$.hasOwnProperty($decodeOneEntity$$)) {
        var $parseCPS$$ = $html4$$.$ELEMENTS$[$decodeOneEntity$$];
        if (!($parseCPS$$ & $html4$$.$eflags$.FOLDABLE)) {
          var $parseText$$ = $lookupEntity$$($decodeOneEntity$$, $makeSaxParser$$);
          if ($parseText$$) {
            if ("object" !== typeof $parseText$$) {
              throw Error("tagPolicy did not return object (old API?)");
            }
            if ("attribs" in $parseText$$) {
              $makeSaxParser$$ = $parseText$$.attribs;
            } else {
              throw Error("tagPolicy gave no attribs");
            }
            if ("tagName" in $parseText$$) {
              var $parseTagAndAttrs$$ = $parseText$$.tagName;
              $parseText$$ = $html4$$.$ELEMENTS$[$parseTagAndAttrs$$];
            } else {
              $parseTagAndAttrs$$ = $decodeOneEntity$$, $parseText$$ = $parseCPS$$;
            }
            if ($parseCPS$$ & $html4$$.$eflags$.OPTIONAL_ENDTAG) {
              var $makeHtmlSanitizer$$ = $unescapeEntities$$[$unescapeEntities$$.length - 1];
              !$makeHtmlSanitizer$$ || $makeHtmlSanitizer$$.$orig$ !== $decodeOneEntity$$ || $makeHtmlSanitizer$$.$rep$ === $parseTagAndAttrs$$ && $decodeOneEntity$$ === $parseTagAndAttrs$$ || $continuationMaker$$.push("</", $makeHtmlSanitizer$$.$rep$, ">");
            }
            $parseCPS$$ & $html4$$.$eflags$.EMPTY || $unescapeEntities$$.push({$orig$:$decodeOneEntity$$, $rep$:$parseTagAndAttrs$$});
            $continuationMaker$$.push("<", $parseTagAndAttrs$$);
            $decodeOneEntity$$ = 0;
            for ($makeHtmlSanitizer$$ = $makeSaxParser$$.length; $decodeOneEntity$$ < $makeHtmlSanitizer$$; $decodeOneEntity$$ += 2) {
              var $safeUri$$ = $makeSaxParser$$[$decodeOneEntity$$], $lookupAttribute$$ = $makeSaxParser$$[$decodeOneEntity$$ + 1];
              null !== $lookupAttribute$$ && void 0 !== $lookupAttribute$$ && $continuationMaker$$.push(" ", $safeUri$$, '="', $escapeAttrib$$($lookupAttribute$$), '"');
            }
            $continuationMaker$$.push(">");
            $parseCPS$$ & $html4$$.$eflags$.EMPTY && !($parseText$$ & $html4$$.$eflags$.EMPTY) && $continuationMaker$$.push("</", $parseTagAndAttrs$$, ">");
          } else {
            $normalizeRCData$$ = !($parseCPS$$ & $html4$$.$eflags$.EMPTY);
          }
        }
      }
    }, endTag:function($lookupEntity$$, $decodeOneEntity$$) {
      if ($normalizeRCData$$) {
        $normalizeRCData$$ = !1;
      } else {
        if ($html4$$.$ELEMENTS$.hasOwnProperty($lookupEntity$$)) {
          var $escapeAttrib$$ = $html4$$.$ELEMENTS$[$lookupEntity$$];
          if (!($escapeAttrib$$ & ($html4$$.$eflags$.EMPTY | $html4$$.$eflags$.FOLDABLE))) {
            if ($escapeAttrib$$ & $html4$$.$eflags$.OPTIONAL_ENDTAG) {
              for ($escapeAttrib$$ = $unescapeEntities$$.length; 0 <= --$escapeAttrib$$;) {
                var $makeSaxParser$$ = $unescapeEntities$$[$escapeAttrib$$].$orig$;
                if ($makeSaxParser$$ === $lookupEntity$$) {
                  break;
                }
                if (!($html4$$.$ELEMENTS$[$makeSaxParser$$] & $html4$$.$eflags$.OPTIONAL_ENDTAG)) {
                  return;
                }
              }
            } else {
              for ($escapeAttrib$$ = $unescapeEntities$$.length; 0 <= --$escapeAttrib$$ && $unescapeEntities$$[$escapeAttrib$$].$orig$ !== $lookupEntity$$;) {
              }
            }
            if (!(0 > $escapeAttrib$$)) {
              for ($makeSaxParser$$ = $unescapeEntities$$.length; --$makeSaxParser$$ > $escapeAttrib$$;) {
                var $continuationMaker$$ = $unescapeEntities$$[$makeSaxParser$$].$rep$;
                $html4$$.$ELEMENTS$[$continuationMaker$$] & $html4$$.$eflags$.OPTIONAL_ENDTAG || $decodeOneEntity$$.push("</", $continuationMaker$$, ">");
              }
              $escapeAttrib$$ < $unescapeEntities$$.length && ($lookupEntity$$ = $unescapeEntities$$[$escapeAttrib$$].$rep$);
              $unescapeEntities$$.length = $escapeAttrib$$;
              $decodeOneEntity$$.push("</", $lookupEntity$$, ">");
            }
          }
        }
      }
    }, pcdata:$decodeOneEntity$$, rcdata:$decodeOneEntity$$, cdata:$decodeOneEntity$$, endDoc:function($html4$$) {
      for (; $unescapeEntities$$.length; $unescapeEntities$$.length--) {
        $html4$$.push("</", $unescapeEntities$$[$unescapeEntities$$.length - 1].$rep$, ">");
      }
    }});
  }
  function $safeUri$$($html4$$, $lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$) {
    if (!$escapeAttrib$$) {
      return null;
    }
    try {
      var $normalizeRCData$$ = $URI$$module$third_party$caja$html_sanitizer$$.parse("" + $html4$$);
      if ($normalizeRCData$$ && (!$normalizeRCData$$.$hasScheme$() || $ALLOWED_URI_SCHEMES$$.test($normalizeRCData$$.$getScheme$()))) {
        var $makeSaxParser$$ = $escapeAttrib$$($normalizeRCData$$, $lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$);
        return $makeSaxParser$$ ? $makeSaxParser$$.toString() : null;
      }
    } catch ($e$271$$) {
    }
    return null;
  }
  function $log$$($html4$$, $lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$) {
    $decodeOneEntity$$ || $html4$$($lookupEntity$$ + " removed", {$change$:"removed", tagName:$lookupEntity$$});
    if ($unescapeEntities$$ !== $escapeAttrib$$) {
      var $normalizeRCData$$ = "changed";
      $unescapeEntities$$ && !$escapeAttrib$$ ? $normalizeRCData$$ = "removed" : !$unescapeEntities$$ && $escapeAttrib$$ && ($normalizeRCData$$ = "added");
      $html4$$($lookupEntity$$ + "." + $decodeOneEntity$$ + " " + $normalizeRCData$$, {$change$:$normalizeRCData$$, tagName:$lookupEntity$$, $attribName$:$decodeOneEntity$$, oldValue:$unescapeEntities$$, newValue:$escapeAttrib$$});
    }
  }
  function $lookupAttribute$$($html4$$, $lookupEntity$$, $decodeOneEntity$$) {
    $lookupEntity$$ = $lookupEntity$$ + "::" + $decodeOneEntity$$;
    if ($html4$$.hasOwnProperty($lookupEntity$$)) {
      return $html4$$[$lookupEntity$$];
    }
    $lookupEntity$$ = "*::" + $decodeOneEntity$$;
    if ($html4$$.hasOwnProperty($lookupEntity$$)) {
      return $html4$$[$lookupEntity$$];
    }
  }
  function $sanitizeAttribs$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$, $escapeAttrib$$, $normalizeRCData$$) {
    for (var $makeSaxParser$$ = 0; $makeSaxParser$$ < $decodeOneEntity$$.length; $makeSaxParser$$ += 2) {
      var $continuationMaker$$ = $decodeOneEntity$$[$makeSaxParser$$], $parseCPS$$ = $decodeOneEntity$$[$makeSaxParser$$ + 1], $parseText$$ = $parseCPS$$, $parseTagAndAttrs$$ = null, $makeHtmlSanitizer$$;
      if (($makeHtmlSanitizer$$ = $lookupEntity$$ + "::" + $continuationMaker$$, $html4$$.$ATTRIBS$.hasOwnProperty($makeHtmlSanitizer$$)) || ($makeHtmlSanitizer$$ = "*::" + $continuationMaker$$, $html4$$.$ATTRIBS$.hasOwnProperty($makeHtmlSanitizer$$))) {
        $parseTagAndAttrs$$ = $html4$$.$ATTRIBS$[$makeHtmlSanitizer$$];
      }
      if (null !== $parseTagAndAttrs$$) {
        switch($parseTagAndAttrs$$) {
          case $html4$$.$atype$.NONE:
            break;
          case $html4$$.$atype$.SCRIPT:
            $parseCPS$$ = null;
            $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
            break;
          case $html4$$.$atype$.STYLE:
            if ("undefined" === typeof $parseCssDeclarations$$) {
              $parseCPS$$ = null;
              $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
              break;
            }
            var $sanitizeAttribs$$ = [];
            $parseCssDeclarations$$($parseCPS$$, {declaration:function($lookupEntity$$, $decodeOneEntity$$) {
              var $escapeAttrib$$ = $lookupEntity$$.toLowerCase();
              $sanitizeCssProperty$$($escapeAttrib$$, $decodeOneEntity$$, $unescapeEntities$$ ? function($lookupEntity$$) {
                return $safeUri$$($lookupEntity$$, $html4$$.$ueffects$.$SAME_DOCUMENT$, $html4$$.$ltypes$.$SANDBOXED$, {TYPE:"CSS", CSS_PROP:$escapeAttrib$$}, $unescapeEntities$$);
              } : null);
              $decodeOneEntity$$.length && $sanitizeAttribs$$.push($escapeAttrib$$ + ": " + $decodeOneEntity$$.join(" "));
            }});
            $parseCPS$$ = 0 < $sanitizeAttribs$$.length ? $sanitizeAttribs$$.join(" ; ") : null;
            $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
            break;
          case $html4$$.$atype$.ID:
          case $html4$$.$atype$.IDREF:
          case $html4$$.$atype$.IDREFS:
          case $html4$$.$atype$.GLOBAL_NAME:
          case $html4$$.$atype$.LOCAL_NAME:
          case $html4$$.$atype$.CLASSES:
            $parseCPS$$ = $escapeAttrib$$ ? $escapeAttrib$$($parseCPS$$) : $parseCPS$$;
            $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
            break;
          case $html4$$.$atype$.URI:
            $parseCPS$$ = $safeUri$$($parseCPS$$, $lookupAttribute$$($html4$$.$URIEFFECTS$, $lookupEntity$$, $continuationMaker$$), $lookupAttribute$$($html4$$.$LOADERTYPES$, $lookupEntity$$, $continuationMaker$$), {TYPE:"MARKUP", XML_ATTR:$continuationMaker$$, XML_TAG:$lookupEntity$$}, $unescapeEntities$$);
            $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
            break;
          case $html4$$.$atype$.URI_FRAGMENT:
            $parseCPS$$ && "#" === $parseCPS$$.charAt(0) ? ($parseCPS$$ = $parseCPS$$.substring(1), $parseCPS$$ = $escapeAttrib$$ ? $escapeAttrib$$($parseCPS$$) : $parseCPS$$, null !== $parseCPS$$ && void 0 !== $parseCPS$$ && ($parseCPS$$ = "#" + $parseCPS$$)) : $parseCPS$$ = null;
            $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
            break;
          default:
            $parseCPS$$ = null, $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
        }
      } else {
        $parseCPS$$ = null, $normalizeRCData$$ && $log$$($normalizeRCData$$, $lookupEntity$$, $continuationMaker$$, $parseText$$, $parseCPS$$);
      }
      $decodeOneEntity$$[$makeSaxParser$$ + 1] = $parseCPS$$;
    }
    return $decodeOneEntity$$;
  }
  function $makeTagPolicy$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$) {
    return function($escapeAttrib$$, $normalizeRCData$$) {
      if ($html4$$.$ELEMENTS$[$escapeAttrib$$] & $html4$$.$eflags$.UNSAFE) {
        $unescapeEntities$$ && $log$$($unescapeEntities$$, $escapeAttrib$$, void 0, void 0, void 0);
      } else {
        return {attribs:$sanitizeAttribs$$($escapeAttrib$$, $normalizeRCData$$, $lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$)};
      }
    };
  }
  function $sanitizeWithPolicy$$($html4$$, $lookupEntity$$) {
    var $decodeOneEntity$$ = [];
    $makeHtmlSanitizer$$($lookupEntity$$)($html4$$, $decodeOneEntity$$);
    return $decodeOneEntity$$.join("");
  }
  if ("undefined" !== typeof window) {
    var $parseCssDeclarations$$ = window.parseCssDeclarations;
    var $sanitizeCssProperty$$ = window.sanitizeCssProperty;
  }
  var $ENTITIES$$ = {lt:"<", LT:"<", gt:">", GT:">", amp:"&", AMP:"&", quot:'"', apos:"'", nbsp:"\u00a0"}, $decimalEscapeRe$$ = /^#(\d+)$/, $hexEscapeRe$$ = /^#x([0-9A-Fa-f]+)$/, $safeEntityNameRe$$ = /^[A-Za-z][A-Za-z0-9]+$/, $entityLookupElement$$ = "undefined" !== typeof window && window.document ? window.document.createElement("textarea") : null, $nulRe$$ = /\0/g, $ENTITY_RE_1$$ = /&(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/g, $ENTITY_RE_2$$ = /^(#[0-9]+|#[xX][0-9A-Fa-f]+|\w+);/, $ampRe$$ = /&/g, $looseAmpRe$$ = 
  /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi, $ltRe$$ = /[<]/g, $gtRe$$ = />/g, $quotRe$$ = /"/g, $ATTR_RE$$ = /^\s*(\[[-.:\w]+\]|[-.:\w]+)(?:\s*(=)\s*((")[^"]*("|$)|(')[^']*('|$)|(?=[a-z][-\w]*\s*=)|[^"'\s]*))?/i, $splitWillCapture$$ = 3 === "a,b".split(/(,)/).length, $EFLAGS_TEXT$$ = $html4$$.$eflags$.CDATA | $html4$$.$eflags$.RCDATA, $continuationMarker$$ = {}, $endTagRe$$ = {}, $ALLOWED_URI_SCHEMES$$ = /^(?:https?|geo|mailto|sms|tel)$/i, $html$jscomp$13$$ = {};
  $html$jscomp$13$$.$escapeAttrib$ = $html$jscomp$13$$.escapeAttrib = $escapeAttrib$$;
  $html$jscomp$13$$.$makeHtmlSanitizer$ = $html$jscomp$13$$.makeHtmlSanitizer = $makeHtmlSanitizer$$;
  $html$jscomp$13$$.$makeSaxParser$ = $html$jscomp$13$$.makeSaxParser = $makeSaxParser$$;
  $html$jscomp$13$$.$makeTagPolicy$ = $html$jscomp$13$$.makeTagPolicy = $makeTagPolicy$$;
  $html$jscomp$13$$.$normalizeRCData$ = $html$jscomp$13$$.normalizeRCData = $normalizeRCData$$;
  $html$jscomp$13$$.$sanitize$ = $html$jscomp$13$$.sanitize = function($html4$$, $lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$) {
    return $sanitizeWithPolicy$$($html4$$, $makeTagPolicy$$($lookupEntity$$, $decodeOneEntity$$, $unescapeEntities$$));
  };
  $html$jscomp$13$$.$sanitizeAttribs$ = $html$jscomp$13$$.sanitizeAttribs = $sanitizeAttribs$$;
  $html$jscomp$13$$.$sanitizeWithPolicy$ = $html$jscomp$13$$.sanitizeWithPolicy = $sanitizeWithPolicy$$;
  $html$jscomp$13$$.$unescapeEntities$ = $html$jscomp$13$$.unescapeEntities = $unescapeEntities$$;
  return $html$jscomp$13$$;
}($html4$$module$third_party$caja$html_sanitizer$$);
var $SELF_CLOSING_TAGS$$module$src$sanitizer$$ = _.$dict$$module$src$utils$object$$({br:!0, col:!0, hr:!0, img:!0, input:!0, source:!0, track:!0, wbr:!0, area:!0, base:!0, command:!0, embed:!0, keygen:!0, link:!0, meta:!0, param:!0}), $WHITELISTED_ATTR_PREFIX_REGEX$$module$src$sanitizer$$ = /^(data-|aria-)|^role$/i, $KEY_COUNTER$$module$src$sanitizer$$ = 0;
_.$$jscomp$inherits$$($AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache$$, window.AMP.BaseTemplate);
$AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache$$.prototype.$F$ = function() {
  if (!_.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "viewerRenderTemplate")) {
    this.$G$ = {};
    if ("TEMPLATE" == this.element.tagName) {
      var $JSCompiler_inline_result$jscomp$807_content$jscomp$inline_3705$$ = _.$templateContentClone$$module$src$dom$$(this.element);
      $JSCompiler_StaticMethods_AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache_prototype$processNestedTemplates_$$(this, $JSCompiler_inline_result$jscomp$807_content$jscomp$inline_3705$$);
      var $container$jscomp$inline_3706$$ = this.element.ownerDocument.createElement("div");
      $container$jscomp$inline_3706$$.appendChild($JSCompiler_inline_result$jscomp$807_content$jscomp$inline_3705$$);
      $JSCompiler_inline_result$jscomp$807_content$jscomp$inline_3705$$ = $container$jscomp$inline_3706$$.innerHTML;
    } else {
      $JSCompiler_inline_result$jscomp$807_content$jscomp$inline_3705$$ = "SCRIPT" == this.element.tagName ? this.element.textContent : "";
    }
    this.$I$ = $JSCompiler_inline_result$jscomp$807_content$jscomp$inline_3705$$;
    _.$Mustache$$module$third_party$mustache$mustache$$.parse(this.$I$, void 0);
  }
};
$AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache$$.prototype.$D$ = function($html$jscomp$16$$) {
  return $JSCompiler_StaticMethods_serializeHtml_$$(this, $html$jscomp$16$$);
};
$AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache$$.prototype.render = function($data$jscomp$147_html$jscomp$17$$) {
  var $mustacheData$$ = $data$jscomp$147_html$jscomp$17$$;
  "object" === typeof $data$jscomp$147_html$jscomp$17$$ && ($mustacheData$$ = Object.assign({}, $data$jscomp$147_html$jscomp$17$$, this.$G$));
  $data$jscomp$147_html$jscomp$17$$ = _.$Mustache$$module$third_party$mustache$mustache$$.render(this.$I$, $mustacheData$$, void 0);
  return $JSCompiler_StaticMethods_serializeHtml_$$(this, $data$jscomp$147_html$jscomp$17$$);
};
window.self.AMP.registerTemplate("amp-mustache", $AmpMustache$$module$extensions$amp_mustache$0_1$amp_mustache$$);

})});
