(self.AMP=self.AMP||[]).push({n:"amp-script",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($set$jscomp$9$$, $array$jscomp$21$$) {
  for (var $l$jscomp$32$$ = $array$jscomp$21$$.length; $l$jscomp$32$$--;) {
    "string" === typeof $array$jscomp$21$$[$l$jscomp$32$$] && ($array$jscomp$21$$[$l$jscomp$32$$] = $array$jscomp$21$$[$l$jscomp$32$$].toLowerCase()), $set$jscomp$9$$[$array$jscomp$21$$[$l$jscomp$32$$]] = !0;
  }
  return $set$jscomp$9$$;
}, $clone$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($object$jscomp$12$$) {
  var $newObject$jscomp$1$$ = {}, $property$jscomp$28$$ = void 0;
  for ($property$jscomp$28$$ in $object$jscomp$12$$) {
    Object.prototype.hasOwnProperty.call($object$jscomp$12$$, $property$jscomp$28$$) && ($newObject$jscomp$1$$[$property$jscomp$28$$] = $object$jscomp$12$$[$property$jscomp$28$$]);
  }
  return $newObject$jscomp$1$$;
}, $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($arr$jscomp$17$$) {
  if (Array.isArray($arr$jscomp$17$$)) {
    for (var $i$jscomp$365$$ = 0, $arr2$jscomp$2$$ = Array($arr$jscomp$17$$.length); $i$jscomp$365$$ < $arr$jscomp$17$$.length; $i$jscomp$365$$++) {
      $arr2$jscomp$2$$[$i$jscomp$365$$] = $arr$jscomp$17$$[$i$jscomp$365$$];
    }
    return $arr2$jscomp$2$$;
  }
  return Array.from($arr$jscomp$17$$);
}, $createDOMPurify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function() {
  function $_sanitizeAttributes$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    var $_sanitizeElements$jscomp$2$$, $_isNode$jscomp$2$$;
    $_executeHook$jscomp$2$$("beforeSanitizeAttributes", $_sanitizeAttributes$jscomp$2$$, null);
    var $_createIterator$jscomp$2$$ = $_sanitizeAttributes$jscomp$2$$.attributes;
    if ($_createIterator$jscomp$2$$) {
      var $_initDocument$jscomp$2$$ = {attrName:"", $attrValue$:"", $keepAttr$:!0, $allowedAttributes$:$ALLOWED_ATTR$jscomp$1$$};
      for ($_isNode$jscomp$2$$ = $_createIterator$jscomp$2$$.length; $_isNode$jscomp$2$$--;) {
        var $_forceRemove$jscomp$2$$ = $_sanitizeElements$jscomp$2$$ = $_createIterator$jscomp$2$$[$_isNode$jscomp$2$$], $_parseConfig$jscomp$2$$ = $_forceRemove$jscomp$2$$.name;
        $_forceRemove$jscomp$2$$ = $_forceRemove$jscomp$2$$.namespaceURI;
        $_sanitizeElements$jscomp$2$$ = $_sanitizeElements$jscomp$2$$.value.trim();
        var $window$jscomp$31$$ = $_parseConfig$jscomp$2$$.toLowerCase();
        $_initDocument$jscomp$2$$.attrName = $window$jscomp$31$$;
        $_initDocument$jscomp$2$$.$attrValue$ = $_sanitizeElements$jscomp$2$$;
        $_initDocument$jscomp$2$$.$keepAttr$ = !0;
        $_executeHook$jscomp$2$$("uponSanitizeAttribute", $_sanitizeAttributes$jscomp$2$$, $_initDocument$jscomp$2$$);
        $_sanitizeElements$jscomp$2$$ = $_initDocument$jscomp$2$$.$attrValue$;
        if ("name" === $window$jscomp$31$$ && "IMG" === $_sanitizeAttributes$jscomp$2$$.nodeName && $_createIterator$jscomp$2$$.id) {
          var $originalDocument$jscomp$1$$ = $_createIterator$jscomp$2$$.id;
          $_createIterator$jscomp$2$$ = Array.prototype.slice.apply($_createIterator$jscomp$2$$);
          $_removeAttribute$jscomp$2$$("id", $_sanitizeAttributes$jscomp$2$$);
          $_removeAttribute$jscomp$2$$($_parseConfig$jscomp$2$$, $_sanitizeAttributes$jscomp$2$$);
          $_createIterator$jscomp$2$$.indexOf($originalDocument$jscomp$1$$) > $_isNode$jscomp$2$$ && $_sanitizeAttributes$jscomp$2$$.setAttribute("id", $originalDocument$jscomp$1$$.value);
        } else {
          if ("INPUT" !== $_sanitizeAttributes$jscomp$2$$.nodeName || "type" !== $window$jscomp$31$$ || "file" !== $_sanitizeElements$jscomp$2$$ || !$ALLOWED_ATTR$jscomp$1$$[$window$jscomp$31$$] && $FORBID_ATTR$jscomp$1$$[$window$jscomp$31$$]) {
            "id" === $_parseConfig$jscomp$2$$ && $_sanitizeAttributes$jscomp$2$$.setAttribute($_parseConfig$jscomp$2$$, ""), $_removeAttribute$jscomp$2$$($_parseConfig$jscomp$2$$, $_sanitizeAttributes$jscomp$2$$);
          } else {
            continue;
          }
        }
        if ($_initDocument$jscomp$2$$.$keepAttr$ && $_isValidAttribute$jscomp$2$$($_sanitizeAttributes$jscomp$2$$.nodeName.toLowerCase(), $window$jscomp$31$$, $_sanitizeElements$jscomp$2$$)) {
          try {
            $_forceRemove$jscomp$2$$ ? $_sanitizeAttributes$jscomp$2$$.setAttributeNS($_forceRemove$jscomp$2$$, $_parseConfig$jscomp$2$$, $_sanitizeElements$jscomp$2$$) : $_sanitizeAttributes$jscomp$2$$.setAttribute($_parseConfig$jscomp$2$$, $_sanitizeElements$jscomp$2$$), $DOMPurify$jscomp$2$$.$removed$.pop();
          } catch ($err$jscomp$53$$) {
          }
        }
      }
      $_executeHook$jscomp$2$$("afterSanitizeAttributes", $_sanitizeAttributes$jscomp$2$$, null);
    }
  }
  function $_isValidAttribute$jscomp$2$$($_sanitizeAttributes$jscomp$2$$, $_isValidAttribute$jscomp$2$$, $_sanitizeElements$jscomp$2$$) {
    if ($SANITIZE_DOM$jscomp$1$$ && ("id" === $_isValidAttribute$jscomp$2$$ || "name" === $_isValidAttribute$jscomp$2$$) && ($_sanitizeElements$jscomp$2$$ in $document$jscomp$13$$ || $_sanitizeElements$jscomp$2$$ in $formElement$jscomp$1$$)) {
      return !1;
    }
    $SAFE_FOR_TEMPLATES$jscomp$1$$ && ($_sanitizeElements$jscomp$2$$ = $_sanitizeElements$jscomp$2$$.replace($MUSTACHE_EXPR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, " "), $_sanitizeElements$jscomp$2$$ = $_sanitizeElements$jscomp$2$$.replace($ERB_EXPR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, " "));
    if (!$ALLOW_DATA_ATTR$jscomp$1$$ || !$DATA_ATTR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.test($_isValidAttribute$jscomp$2$$)) {
      if (!$ALLOW_ARIA_ATTR$jscomp$1$$ || !$ARIA_ATTR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.test($_isValidAttribute$jscomp$2$$)) {
        if (!$ALLOWED_ATTR$jscomp$1$$[$_isValidAttribute$jscomp$2$$] || $FORBID_ATTR$jscomp$1$$[$_isValidAttribute$jscomp$2$$] || !($URI_SAFE_ATTRIBUTES$jscomp$1$$[$_isValidAttribute$jscomp$2$$] || $IS_ALLOWED_URI$$1$jscomp$1$$.test($_sanitizeElements$jscomp$2$$.replace($ATTR_WHITESPACE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, "")) || ("src" === $_isValidAttribute$jscomp$2$$ || "xlink:href" === $_isValidAttribute$jscomp$2$$) && "script" !== $_sanitizeAttributes$jscomp$2$$ && 
        0 === $_sanitizeElements$jscomp$2$$.indexOf("data:") && $DATA_URI_TAGS$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$] || $ALLOW_UNKNOWN_PROTOCOLS$jscomp$1$$ && !$IS_SCRIPT_OR_DATA$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.test($_sanitizeElements$jscomp$2$$.replace($ATTR_WHITESPACE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, ""))) && $_sanitizeElements$jscomp$2$$) {
          return !1;
        }
      }
    }
    return !0;
  }
  function $_sanitizeElements$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    $_executeHook$jscomp$2$$("beforeSanitizeElements", $_sanitizeAttributes$jscomp$2$$, null);
    if ($_sanitizeAttributes$jscomp$2$$ instanceof $Text$jscomp$2$$ || $_sanitizeAttributes$jscomp$2$$ instanceof $Comment$jscomp$2$$ ? 0 : !("string" === typeof $_sanitizeAttributes$jscomp$2$$.nodeName && "string" === typeof $_sanitizeAttributes$jscomp$2$$.textContent && "function" === typeof $_sanitizeAttributes$jscomp$2$$.removeChild && $_sanitizeAttributes$jscomp$2$$.attributes instanceof $NamedNodeMap$jscomp$2$$ && "function" === typeof $_sanitizeAttributes$jscomp$2$$.removeAttribute && "function" === 
    typeof $_sanitizeAttributes$jscomp$2$$.setAttribute)) {
      return $_forceRemove$jscomp$2$$($_sanitizeAttributes$jscomp$2$$), !0;
    }
    var $_isValidAttribute$jscomp$2$$ = $_sanitizeAttributes$jscomp$2$$.nodeName.toLowerCase();
    $_executeHook$jscomp$2$$("uponSanitizeElement", $_sanitizeAttributes$jscomp$2$$, {tagName:$_isValidAttribute$jscomp$2$$, $allowedTags$:$ALLOWED_TAGS$jscomp$1$$});
    if (!$ALLOWED_TAGS$jscomp$1$$[$_isValidAttribute$jscomp$2$$] || $FORBID_TAGS$jscomp$1$$[$_isValidAttribute$jscomp$2$$]) {
      if ($KEEP_CONTENT$jscomp$1$$ && !$FORBID_CONTENTS$jscomp$1$$[$_isValidAttribute$jscomp$2$$] && "function" === typeof $_sanitizeAttributes$jscomp$2$$.insertAdjacentHTML) {
        try {
          $_sanitizeAttributes$jscomp$2$$.insertAdjacentHTML("AfterEnd", $_sanitizeAttributes$jscomp$2$$.innerHTML);
        } catch ($err$jscomp$52$$) {
        }
      }
      $_forceRemove$jscomp$2$$($_sanitizeAttributes$jscomp$2$$);
      return !0;
    }
    !$SAFE_FOR_JQUERY$jscomp$1$$ || $_sanitizeAttributes$jscomp$2$$.firstElementChild || $_sanitizeAttributes$jscomp$2$$.content && $_sanitizeAttributes$jscomp$2$$.content.firstElementChild || !/</g.test($_sanitizeAttributes$jscomp$2$$.textContent) || ($DOMPurify$jscomp$2$$.$removed$.push({element:$_sanitizeAttributes$jscomp$2$$.cloneNode()}), $_sanitizeAttributes$jscomp$2$$.innerHTML ? $_sanitizeAttributes$jscomp$2$$.innerHTML = $_sanitizeAttributes$jscomp$2$$.innerHTML.replace(/</g, "&lt;") : $_sanitizeAttributes$jscomp$2$$.innerHTML = 
    $_sanitizeAttributes$jscomp$2$$.textContent.replace(/</g, "&lt;"));
    $SAFE_FOR_TEMPLATES$jscomp$1$$ && 3 === $_sanitizeAttributes$jscomp$2$$.nodeType && ($_isValidAttribute$jscomp$2$$ = $_sanitizeAttributes$jscomp$2$$.textContent, $_isValidAttribute$jscomp$2$$ = $_isValidAttribute$jscomp$2$$.replace($MUSTACHE_EXPR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, " "), $_isValidAttribute$jscomp$2$$ = $_isValidAttribute$jscomp$2$$.replace($ERB_EXPR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, " "), $_sanitizeAttributes$jscomp$2$$.textContent !== 
    $_isValidAttribute$jscomp$2$$ && ($DOMPurify$jscomp$2$$.$removed$.push({element:$_sanitizeAttributes$jscomp$2$$.cloneNode()}), $_sanitizeAttributes$jscomp$2$$.textContent = $_isValidAttribute$jscomp$2$$));
    $_executeHook$jscomp$2$$("afterSanitizeElements", $_sanitizeAttributes$jscomp$2$$, null);
    return !1;
  }
  function $_executeHook$jscomp$2$$($_sanitizeAttributes$jscomp$2$$, $_isValidAttribute$jscomp$2$$, $_sanitizeElements$jscomp$2$$) {
    $hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$] && $hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$].forEach(function($_sanitizeAttributes$jscomp$2$$) {
      $_sanitizeAttributes$jscomp$2$$.call($DOMPurify$jscomp$2$$, $_isValidAttribute$jscomp$2$$, $_sanitizeElements$jscomp$2$$, $CONFIG$jscomp$1$$);
    });
  }
  function $_isNode$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    return "object" === ("undefined" === typeof $Node$jscomp$3$$ ? "undefined" : $_typeof$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($Node$jscomp$3$$)) ? $_sanitizeAttributes$jscomp$2$$ instanceof $Node$jscomp$3$$ : $_sanitizeAttributes$jscomp$2$$ && "object" === ("undefined" === typeof $_sanitizeAttributes$jscomp$2$$ ? "undefined" : $_typeof$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($_sanitizeAttributes$jscomp$2$$)) && "number" === typeof $_sanitizeAttributes$jscomp$2$$.nodeType && 
    "string" === typeof $_sanitizeAttributes$jscomp$2$$.nodeName;
  }
  function $_createIterator$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    return $createNodeIterator$jscomp$1$$.call($_sanitizeAttributes$jscomp$2$$.ownerDocument || $_sanitizeAttributes$jscomp$2$$, $_sanitizeAttributes$jscomp$2$$, $NodeFilter$jscomp$2$$.SHOW_ELEMENT | $NodeFilter$jscomp$2$$.SHOW_COMMENT | $NodeFilter$jscomp$2$$.SHOW_TEXT, function() {
      return $NodeFilter$jscomp$2$$.FILTER_ACCEPT;
    }, !1);
  }
  function $_initDocument$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    var $_isValidAttribute$jscomp$2$$ = void 0;
    $FORCE_BODY$jscomp$1$$ && ($_sanitizeAttributes$jscomp$2$$ = "<remove></remove>" + $_sanitizeAttributes$jscomp$2$$);
    if ($useDOMParser$jscomp$1$$) {
      try {
        $_isValidAttribute$jscomp$2$$ = (new $DOMParser$jscomp$2$$).parseFromString($_sanitizeAttributes$jscomp$2$$, "text/html");
      } catch ($err$jscomp$49$$) {
      }
    }
    $removeTitle$jscomp$1$$ && $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($FORBID_TAGS$jscomp$1$$, ["title"]);
    if (!$_isValidAttribute$jscomp$2$$ || !$_isValidAttribute$jscomp$2$$.documentElement) {
      $_isValidAttribute$jscomp$2$$ = $implementation$jscomp$3$$.createHTMLDocument("");
      var $_sanitizeElements$jscomp$2$$ = $_isValidAttribute$jscomp$2$$.body;
      $_sanitizeElements$jscomp$2$$.parentNode.removeChild($_sanitizeElements$jscomp$2$$.parentNode.firstElementChild);
      $_sanitizeElements$jscomp$2$$.outerHTML = $_sanitizeAttributes$jscomp$2$$;
    }
    return $getElementsByTagName$jscomp$1$$.call($_isValidAttribute$jscomp$2$$, $WHOLE_DOCUMENT$jscomp$1$$ ? "html" : "body")[0];
  }
  function $_removeAttribute$jscomp$2$$($_sanitizeAttributes$jscomp$2$$, $_isValidAttribute$jscomp$2$$) {
    try {
      $DOMPurify$jscomp$2$$.$removed$.push({$attribute$:$_isValidAttribute$jscomp$2$$.getAttributeNode($_sanitizeAttributes$jscomp$2$$), from:$_isValidAttribute$jscomp$2$$});
    } catch ($err$jscomp$48$$) {
      $DOMPurify$jscomp$2$$.$removed$.push({$attribute$:null, from:$_isValidAttribute$jscomp$2$$});
    }
    $_isValidAttribute$jscomp$2$$.removeAttribute($_sanitizeAttributes$jscomp$2$$);
  }
  function $_forceRemove$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    $DOMPurify$jscomp$2$$.$removed$.push({element:$_sanitizeAttributes$jscomp$2$$});
    try {
      $_sanitizeAttributes$jscomp$2$$.parentNode.removeChild($_sanitizeAttributes$jscomp$2$$);
    } catch ($err$jscomp$47$$) {
      $_sanitizeAttributes$jscomp$2$$.outerHTML = "";
    }
  }
  function $_parseConfig$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    "object" !== ("undefined" === typeof $_sanitizeAttributes$jscomp$2$$ ? "undefined" : $_typeof$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($_sanitizeAttributes$jscomp$2$$)) && ($_sanitizeAttributes$jscomp$2$$ = {});
    $ALLOWED_TAGS$jscomp$1$$ = "ALLOWED_TAGS" in $_sanitizeAttributes$jscomp$2$$ ? $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, $_sanitizeAttributes$jscomp$2$$.ALLOWED_TAGS) : $DEFAULT_ALLOWED_TAGS$jscomp$1$$;
    $ALLOWED_ATTR$jscomp$1$$ = "ALLOWED_ATTR" in $_sanitizeAttributes$jscomp$2$$ ? $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, $_sanitizeAttributes$jscomp$2$$.ALLOWED_ATTR) : $DEFAULT_ALLOWED_ATTR$jscomp$1$$;
    $FORBID_TAGS$jscomp$1$$ = "FORBID_TAGS" in $_sanitizeAttributes$jscomp$2$$ ? $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, $_sanitizeAttributes$jscomp$2$$.FORBID_TAGS) : {};
    $FORBID_ATTR$jscomp$1$$ = "FORBID_ATTR" in $_sanitizeAttributes$jscomp$2$$ ? $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, $_sanitizeAttributes$jscomp$2$$.FORBID_ATTR) : {};
    $USE_PROFILES$jscomp$1$$ = "USE_PROFILES" in $_sanitizeAttributes$jscomp$2$$ ? $_sanitizeAttributes$jscomp$2$$.USE_PROFILES : !1;
    $ALLOW_ARIA_ATTR$jscomp$1$$ = !1 !== $_sanitizeAttributes$jscomp$2$$.ALLOW_ARIA_ATTR;
    $ALLOW_DATA_ATTR$jscomp$1$$ = !1 !== $_sanitizeAttributes$jscomp$2$$.ALLOW_DATA_ATTR;
    $ALLOW_UNKNOWN_PROTOCOLS$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.ALLOW_UNKNOWN_PROTOCOLS || !1;
    $SAFE_FOR_JQUERY$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.SAFE_FOR_JQUERY || !1;
    $SAFE_FOR_TEMPLATES$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.SAFE_FOR_TEMPLATES || !1;
    $WHOLE_DOCUMENT$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.WHOLE_DOCUMENT || !1;
    $RETURN_DOM$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.RETURN_DOM || !1;
    $RETURN_DOM_FRAGMENT$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.RETURN_DOM_FRAGMENT || !1;
    $RETURN_DOM_IMPORT$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.RETURN_DOM_IMPORT || !1;
    $FORCE_BODY$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.FORCE_BODY || !1;
    $SANITIZE_DOM$jscomp$1$$ = !1 !== $_sanitizeAttributes$jscomp$2$$.SANITIZE_DOM;
    $KEEP_CONTENT$jscomp$1$$ = !1 !== $_sanitizeAttributes$jscomp$2$$.KEEP_CONTENT;
    $IN_PLACE$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.IN_PLACE || !1;
    $IS_ALLOWED_URI$$1$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$.ALLOWED_URI_REGEXP || $IS_ALLOWED_URI$$1$jscomp$1$$;
    $SAFE_FOR_TEMPLATES$jscomp$1$$ && ($ALLOW_DATA_ATTR$jscomp$1$$ = !1);
    $RETURN_DOM_FRAGMENT$jscomp$1$$ && ($RETURN_DOM$jscomp$1$$ = !0);
    $USE_PROFILES$jscomp$1$$ && ($ALLOWED_TAGS$jscomp$1$$ = $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, [].concat($_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($text$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$))), $ALLOWED_ATTR$jscomp$1$$ = [], !0 === $USE_PROFILES$jscomp$1$$.html && ($addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$, 
    $html$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $html$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$)), !0 === $USE_PROFILES$jscomp$1$$.svg && ($addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$, $svg$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), 
    $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $svg$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $xml$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$)), !0 === $USE_PROFILES$jscomp$1$$.svgFilters && ($addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$, 
    $svgFilters$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $svg$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $xml$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$)), !0 === $USE_PROFILES$jscomp$1$$.mathMl && 
    ($addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$, $mathMl$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $mathMl$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $xml$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$)));
    $_sanitizeAttributes$jscomp$2$$.ADD_TAGS && ($ALLOWED_TAGS$jscomp$1$$ === $DEFAULT_ALLOWED_TAGS$jscomp$1$$ && ($ALLOWED_TAGS$jscomp$1$$ = $clone$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$)), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$, $_sanitizeAttributes$jscomp$2$$.ADD_TAGS));
    $_sanitizeAttributes$jscomp$2$$.ADD_ATTR && ($ALLOWED_ATTR$jscomp$1$$ === $DEFAULT_ALLOWED_ATTR$jscomp$1$$ && ($ALLOWED_ATTR$jscomp$1$$ = $clone$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$)), $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_ATTR$jscomp$1$$, $_sanitizeAttributes$jscomp$2$$.ADD_ATTR));
    $_sanitizeAttributes$jscomp$2$$.ADD_URI_SAFE_ATTR && $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($URI_SAFE_ATTRIBUTES$jscomp$1$$, $_sanitizeAttributes$jscomp$2$$.ADD_URI_SAFE_ATTR);
    $KEEP_CONTENT$jscomp$1$$ && ($ALLOWED_TAGS$jscomp$1$$["#text"] = !0);
    $WHOLE_DOCUMENT$jscomp$1$$ && $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$, ["html", "head", "body"]);
    $ALLOWED_TAGS$jscomp$1$$.table && $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($ALLOWED_TAGS$jscomp$1$$, ["tbody"]);
    Object && "freeze" in Object && Object.freeze($_sanitizeAttributes$jscomp$2$$);
    $CONFIG$jscomp$1$$ = $_sanitizeAttributes$jscomp$2$$;
  }
  function $DOMPurify$jscomp$2$$($_sanitizeAttributes$jscomp$2$$) {
    return $createDOMPurify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($_sanitizeAttributes$jscomp$2$$);
  }
  var $window$jscomp$31$$ = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "undefined" === typeof window ? null : window;
  $DOMPurify$jscomp$2$$.version = "1.0.8";
  $DOMPurify$jscomp$2$$.$removed$ = [];
  if (!$window$jscomp$31$$ || !$window$jscomp$31$$.document || 9 !== $window$jscomp$31$$.document.nodeType) {
    return $DOMPurify$jscomp$2$$.isSupported = !1, $DOMPurify$jscomp$2$$;
  }
  var $originalDocument$jscomp$1$$ = $window$jscomp$31$$.document, $useDOMParser$jscomp$1$$ = !1, $removeTitle$jscomp$1$$ = !1, $document$jscomp$13$$ = $window$jscomp$31$$.document, $DocumentFragment$jscomp$2$$ = $window$jscomp$31$$.DocumentFragment, $Node$jscomp$3$$ = $window$jscomp$31$$.Node, $NodeFilter$jscomp$2$$ = $window$jscomp$31$$.NodeFilter, $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$ = $window$jscomp$31$$.NamedNodeMap, $NamedNodeMap$jscomp$2$$ = void 0 === $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$ ? 
  $window$jscomp$31$$.NamedNodeMap || $window$jscomp$31$$.$MozNamedAttrMap$ : $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$, $Text$jscomp$2$$ = $window$jscomp$31$$.Text, $Comment$jscomp$2$$ = $window$jscomp$31$$.Comment, $DOMParser$jscomp$2$$ = $window$jscomp$31$$.DOMParser;
  "function" === typeof $window$jscomp$31$$.HTMLTemplateElement && ($_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$ = $document$jscomp$13$$.createElement("template"), $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$.content && $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$.content.ownerDocument && ($document$jscomp$13$$ = $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$.content.ownerDocument));
  $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$ = $document$jscomp$13$$;
  var $implementation$jscomp$3$$ = $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$.implementation, $createNodeIterator$jscomp$1$$ = $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$.createNodeIterator, $getElementsByTagName$jscomp$1$$ = $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$.getElementsByTagName, $createDocumentFragment$jscomp$1$$ = $_document$jscomp$1__window$NamedNodeMap$jscomp$1_template$jscomp$30$$.createDocumentFragment, 
  $importNode$jscomp$2$$ = $originalDocument$jscomp$1$$.importNode, $hooks$jscomp$1$$ = {};
  $DOMPurify$jscomp$2$$.isSupported = $implementation$jscomp$3$$ && "undefined" !== typeof $implementation$jscomp$3$$.createHTMLDocument && 9 !== $document$jscomp$13$$.documentMode;
  var $IS_ALLOWED_URI$$1$jscomp$1$$ = $IS_ALLOWED_URI$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $ALLOWED_TAGS$jscomp$1$$ = null, $DEFAULT_ALLOWED_TAGS$jscomp$1$$ = $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, [].concat($_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($html$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($svg$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), 
  $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($svgFilters$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mathMl$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($text$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$))), 
  $ALLOWED_ATTR$jscomp$1$$ = null, $DEFAULT_ALLOWED_ATTR$jscomp$1$$ = $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, [].concat($_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($html$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($svg$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), 
  $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mathMl$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$), $_toConsumableArray$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($xml$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$))), $FORBID_TAGS$jscomp$1$$ = null, $FORBID_ATTR$jscomp$1$$ = null, $ALLOW_ARIA_ATTR$jscomp$1$$ = !0, $ALLOW_DATA_ATTR$jscomp$1$$ = !0, $ALLOW_UNKNOWN_PROTOCOLS$jscomp$1$$ = 
  !1, $SAFE_FOR_JQUERY$jscomp$1$$ = !1, $SAFE_FOR_TEMPLATES$jscomp$1$$ = !1, $WHOLE_DOCUMENT$jscomp$1$$ = !1, $SET_CONFIG$jscomp$1$$ = !1, $FORCE_BODY$jscomp$1$$ = !1, $RETURN_DOM$jscomp$1$$ = !1, $RETURN_DOM_FRAGMENT$jscomp$1$$ = !1, $RETURN_DOM_IMPORT$jscomp$1$$ = !1, $SANITIZE_DOM$jscomp$1$$ = !0, $KEEP_CONTENT$jscomp$1$$ = !0, $IN_PLACE$jscomp$1$$ = !1, $USE_PROFILES$jscomp$1$$ = {}, $FORBID_CONTENTS$jscomp$1$$ = $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, 
  "audio head math script style template svg video".split(" ")), $DATA_URI_TAGS$jscomp$1$$ = $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, ["audio", "video", "img", "source", "image"]), $URI_SAFE_ATTRIBUTES$jscomp$1$$ = $addToSet$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$({}, "alt class for id label name pattern placeholder summary title value style xmlns".split(" ")), $CONFIG$jscomp$1$$ = null, $formElement$jscomp$1$$ = $document$jscomp$13$$.createElement("form");
  if ($DOMPurify$jscomp$2$$.isSupported) {
    try {
      $_initDocument$jscomp$2$$('<svg><p><style><img src="</style><img src=x onerror=alert(1)//">').querySelector("svg img") && ($useDOMParser$jscomp$1$$ = !0);
    } catch ($err$jscomp$inline_3927$$) {
    }
    try {
      $_initDocument$jscomp$2$$("<x/><title>&lt;/title&gt;&lt;img&gt;").querySelector("title").textContent.match(/<\/title/) && ($removeTitle$jscomp$1$$ = !0);
    } catch ($err$jscomp$inline_3929$$) {
    }
  }
  var $_sanitizeShadowDOM$jscomp$2$$ = function $_sanitizeShadowDOM$jscomp$3$$($_isValidAttribute$jscomp$2$$) {
    var $_isNode$jscomp$2$$, $_initDocument$jscomp$2$$ = $_createIterator$jscomp$2$$($_isValidAttribute$jscomp$2$$);
    for ($_executeHook$jscomp$2$$("beforeSanitizeShadowDOM", $_isValidAttribute$jscomp$2$$, null); $_isNode$jscomp$2$$ = $_initDocument$jscomp$2$$.nextNode();) {
      $_executeHook$jscomp$2$$("uponSanitizeShadowNode", $_isNode$jscomp$2$$, null), $_sanitizeElements$jscomp$2$$($_isNode$jscomp$2$$) || ($_isNode$jscomp$2$$.content instanceof $DocumentFragment$jscomp$2$$ && $_sanitizeShadowDOM$jscomp$3$$($_isNode$jscomp$2$$.content), $_sanitizeAttributes$jscomp$2$$($_isNode$jscomp$2$$));
    }
    $_executeHook$jscomp$2$$("afterSanitizeShadowDOM", $_isValidAttribute$jscomp$2$$, null);
  };
  $DOMPurify$jscomp$2$$.$sanitize$ = function($_isValidAttribute$jscomp$2$$, $_executeHook$jscomp$2$$) {
    var $_removeAttribute$jscomp$2$$ = void 0, $removeTitle$jscomp$1$$ = void 0;
    $_isValidAttribute$jscomp$2$$ || ($_isValidAttribute$jscomp$2$$ = "\x3c!--\x3e");
    if ("string" !== typeof $_isValidAttribute$jscomp$2$$ && !$_isNode$jscomp$2$$($_isValidAttribute$jscomp$2$$)) {
      if ("function" !== typeof $_isValidAttribute$jscomp$2$$.toString) {
        throw new TypeError("toString is not a function");
      }
      $_isValidAttribute$jscomp$2$$ = $_isValidAttribute$jscomp$2$$.toString();
      if ("string" !== typeof $_isValidAttribute$jscomp$2$$) {
        throw new TypeError("dirty is not a string, aborting");
      }
    }
    if (!$DOMPurify$jscomp$2$$.isSupported) {
      if ("object" === $_typeof$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($window$jscomp$31$$.$toStaticHTML$) || "function" === typeof $window$jscomp$31$$.$toStaticHTML$) {
        if ("string" === typeof $_isValidAttribute$jscomp$2$$) {
          return $window$jscomp$31$$.$toStaticHTML$($_isValidAttribute$jscomp$2$$);
        }
        if ($_isNode$jscomp$2$$($_isValidAttribute$jscomp$2$$)) {
          return $window$jscomp$31$$.$toStaticHTML$($_isValidAttribute$jscomp$2$$.outerHTML);
        }
      }
      return $_isValidAttribute$jscomp$2$$;
    }
    $SET_CONFIG$jscomp$1$$ || $_parseConfig$jscomp$2$$($_executeHook$jscomp$2$$);
    $DOMPurify$jscomp$2$$.$removed$ = [];
    if (!$IN_PLACE$jscomp$1$$) {
      if ($_isValidAttribute$jscomp$2$$ instanceof $Node$jscomp$3$$) {
        $_removeAttribute$jscomp$2$$ = $_initDocument$jscomp$2$$("\x3c!--\x3e"), $_executeHook$jscomp$2$$ = $_removeAttribute$jscomp$2$$.ownerDocument.importNode($_isValidAttribute$jscomp$2$$, !0), 1 === $_executeHook$jscomp$2$$.nodeType && "BODY" === $_executeHook$jscomp$2$$.nodeName ? $_removeAttribute$jscomp$2$$ = $_executeHook$jscomp$2$$ : $_removeAttribute$jscomp$2$$.appendChild($_executeHook$jscomp$2$$);
      } else {
        if (!$RETURN_DOM$jscomp$1$$ && !$WHOLE_DOCUMENT$jscomp$1$$ && -1 === $_isValidAttribute$jscomp$2$$.indexOf("<")) {
          return $_isValidAttribute$jscomp$2$$;
        }
        $_removeAttribute$jscomp$2$$ = $_initDocument$jscomp$2$$($_isValidAttribute$jscomp$2$$);
        if (!$_removeAttribute$jscomp$2$$) {
          return $RETURN_DOM$jscomp$1$$ ? null : "";
        }
      }
    }
    $_removeAttribute$jscomp$2$$ && $FORCE_BODY$jscomp$1$$ && $_forceRemove$jscomp$2$$($_removeAttribute$jscomp$2$$.firstChild);
    for (var $document$jscomp$13$$ = $_createIterator$jscomp$2$$($IN_PLACE$jscomp$1$$ ? $_isValidAttribute$jscomp$2$$ : $_removeAttribute$jscomp$2$$); $_executeHook$jscomp$2$$ = $document$jscomp$13$$.nextNode();) {
      3 === $_executeHook$jscomp$2$$.nodeType && $_executeHook$jscomp$2$$ === $removeTitle$jscomp$1$$ || $_sanitizeElements$jscomp$2$$($_executeHook$jscomp$2$$) || ($_executeHook$jscomp$2$$.content instanceof $DocumentFragment$jscomp$2$$ && $_sanitizeShadowDOM$jscomp$2$$($_executeHook$jscomp$2$$.content), $_sanitizeAttributes$jscomp$2$$($_executeHook$jscomp$2$$), $removeTitle$jscomp$1$$ = $_executeHook$jscomp$2$$);
    }
    if ($IN_PLACE$jscomp$1$$) {
      return $_isValidAttribute$jscomp$2$$;
    }
    if ($RETURN_DOM$jscomp$1$$) {
      if ($RETURN_DOM_FRAGMENT$jscomp$1$$) {
        for ($_isValidAttribute$jscomp$2$$ = $createDocumentFragment$jscomp$1$$.call($_removeAttribute$jscomp$2$$.ownerDocument); $_removeAttribute$jscomp$2$$.firstChild;) {
          $_isValidAttribute$jscomp$2$$.appendChild($_removeAttribute$jscomp$2$$.firstChild);
        }
      } else {
        $_isValidAttribute$jscomp$2$$ = $_removeAttribute$jscomp$2$$;
      }
      $RETURN_DOM_IMPORT$jscomp$1$$ && ($_isValidAttribute$jscomp$2$$ = $importNode$jscomp$2$$.call($originalDocument$jscomp$1$$, $_isValidAttribute$jscomp$2$$, !0));
      return $_isValidAttribute$jscomp$2$$;
    }
    return $WHOLE_DOCUMENT$jscomp$1$$ ? $_removeAttribute$jscomp$2$$.outerHTML : $_removeAttribute$jscomp$2$$.innerHTML;
  };
  $DOMPurify$jscomp$2$$.$I$ = function($_sanitizeAttributes$jscomp$2$$) {
    $_parseConfig$jscomp$2$$($_sanitizeAttributes$jscomp$2$$);
    $SET_CONFIG$jscomp$1$$ = !0;
  };
  $DOMPurify$jscomp$2$$.$D$ = function() {
    $CONFIG$jscomp$1$$ = null;
    $SET_CONFIG$jscomp$1$$ = !1;
  };
  $DOMPurify$jscomp$2$$.$isValidAttribute$ = function($_sanitizeAttributes$jscomp$2$$, $_sanitizeElements$jscomp$2$$, $_executeHook$jscomp$2$$) {
    $CONFIG$jscomp$1$$ || $_parseConfig$jscomp$2$$({});
    return $_isValidAttribute$jscomp$2$$($_sanitizeAttributes$jscomp$2$$.toLowerCase(), $_sanitizeElements$jscomp$2$$.toLowerCase(), $_executeHook$jscomp$2$$);
  };
  $DOMPurify$jscomp$2$$.$addHook$ = function($_sanitizeAttributes$jscomp$2$$, $_isValidAttribute$jscomp$2$$) {
    "function" === typeof $_isValidAttribute$jscomp$2$$ && ($hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$] = $hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$] || [], $hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$].push($_isValidAttribute$jscomp$2$$));
  };
  $DOMPurify$jscomp$2$$.$F$ = function($_sanitizeAttributes$jscomp$2$$) {
    $hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$] && $hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$].pop();
  };
  $DOMPurify$jscomp$2$$.$G$ = function($_sanitizeAttributes$jscomp$2$$) {
    $hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$] && ($hooks$jscomp$1$$[$_sanitizeAttributes$jscomp$2$$] = []);
  };
  $DOMPurify$jscomp$2$$.$removeAllHooks$ = function() {
    $hooks$jscomp$1$$ = {};
  };
  return $DOMPurify$jscomp$2$$;
}, $DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function() {
  this.$config_$ = {};
  this.$D$ = window.document.createElement("div");
}, $JSCompiler_StaticMethods_DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched_prototype$configure$$ = function($config$jscomp$77$$, $callbacks$$) {
  var $JSCompiler_StaticMethods_DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched_prototype$configure$self$$ = $sanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$;
  $JSCompiler_StaticMethods_DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched_prototype$configure$self$$.$config_$ = Object.assign({}, $config$jscomp$77$$, {IN_PLACE:!0});
  $JSCompiler_StaticMethods_DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched_prototype$configure$self$$.$callbacks_$ = $callbacks$$;
}, $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($index$jscomp$131$$) {
  return $strings$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.get($index$jscomp$131$$) || "";
}, $prepare$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($baseElement$jscomp$3$$) {
  $NODES$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = new window.Map([[1, $baseElement$jscomp$3$$], [2, $baseElement$jscomp$3$$]]);
  $BASE_ELEMENT$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = $baseElement$jscomp$3$$;
  $baseElement$jscomp$3$$.$_index_$ = 2;
  $baseElement$jscomp$3$$.childNodes.forEach(function($baseElement$jscomp$3$$) {
    return $storeNodes$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($baseElement$jscomp$3$$);
  });
}, $storeNodes$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($node$jscomp$90$$) {
  $storeNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($node$jscomp$90$$, ++$count$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$);
  $node$jscomp$90$$.childNodes.forEach(function($node$jscomp$90$$) {
    return $storeNodes$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($node$jscomp$90$$);
  });
}, $createNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($skeleton$$, $node$284_sanitizer$$) {
  if (3 === $skeleton$$[0]) {
    return $node$284_sanitizer$$ = window.document.createTextNode($get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($skeleton$$[5])), $storeNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($node$284_sanitizer$$, $skeleton$$[7]), $node$284_sanitizer$$;
  }
  var $namespace$jscomp$10_node$jscomp$92$$ = void 0 !== $skeleton$$[6] ? $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($skeleton$$[6]) : void 0, $nodeName$jscomp$5$$ = $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($skeleton$$[1]);
  $namespace$jscomp$10_node$jscomp$92$$ = $namespace$jscomp$10_node$jscomp$92$$ ? window.document.createElementNS($namespace$jscomp$10_node$jscomp$92$$, $nodeName$jscomp$5$$) : window.document.createElement($nodeName$jscomp$5$$);
  if ($node$284_sanitizer$$ && !$node$284_sanitizer$$.$sanitize$($namespace$jscomp$10_node$jscomp$92$$)) {
    return null;
  }
  $storeNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($namespace$jscomp$10_node$jscomp$92$$, $skeleton$$[7]);
  return $namespace$jscomp$10_node$jscomp$92$$;
}, $getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($id$jscomp$87_node$jscomp$93$$) {
  return ($id$jscomp$87_node$jscomp$93$$ = $NODES$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.get($id$jscomp$87_node$jscomp$93$$)) && "BODY" === $id$jscomp$87_node$jscomp$93$$.nodeName ? $BASE_ELEMENT$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ : $id$jscomp$87_node$jscomp$93$$;
}, $storeNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($node$jscomp$94$$, $id$jscomp$88$$) {
  $node$jscomp$94$$.$_index_$ = $id$jscomp$88$$;
  $NODES$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.set($id$jscomp$88$$, $node$jscomp$94$$);
}, $store$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($value$jscomp$278$$) {
  if ($strings$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.has($value$jscomp$278$$)) {
    return $strings$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.get($value$jscomp$278$$) - 1;
  }
  $strings$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.set($value$jscomp$278$$, ++$count$2$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$);
  $initialStrings$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.push($value$jscomp$278$$);
  return $count$2$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ - 1;
}, $createHydrateableNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($element$jscomp$526$$) {
  var $$jscomp$compprop36_hydrated$$ = {};
  $$jscomp$compprop36_hydrated$$ = ($$jscomp$compprop36_hydrated$$[7] = $element$jscomp$526$$.$_index_$, $$jscomp$compprop36_hydrated$$[8] = 0, $$jscomp$compprop36_hydrated$$[0] = $element$jscomp$526$$.nodeType, $$jscomp$compprop36_hydrated$$[1] = $store$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($element$jscomp$526$$.nodeName), $$jscomp$compprop36_hydrated$$[4] = [].map.call($element$jscomp$526$$.childNodes || [], function($element$jscomp$526$$) {
    return $createHydrateableNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($element$jscomp$526$$);
  }), $$jscomp$compprop36_hydrated$$[2] = [].map.call($element$jscomp$526$$.attributes || [], function($element$jscomp$526$$) {
    return [$store$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($element$jscomp$526$$.namespaceURI || "null"), $store$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($element$jscomp$526$$.name), $store$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($element$jscomp$526$$.value)];
  }), $$jscomp$compprop36_hydrated$$);
  null !== $element$jscomp$526$$.namespaceURI && ($$jscomp$compprop36_hydrated$$[6] = $store$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($element$jscomp$526$$.namespaceURI));
  $NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.includes($element$jscomp$526$$.nodeType) && null !== $element$jscomp$526$$.textContent && ($$jscomp$compprop36_hydrated$$[5] = $store$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($element$jscomp$526$$.textContent));
  return $$jscomp$compprop36_hydrated$$;
}, $createWorker$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($baseElement$jscomp$4$$, $workerDomURL$$, $authorScriptURL$$, $callbacks$jscomp$1$$) {
  $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = $callbacks$jscomp$1$$;
  return window.Promise.all([(0,window.fetch)($workerDomURL$$).then(function($baseElement$jscomp$4$$) {
    return $baseElement$jscomp$4$$.text();
  }), (0,window.fetch)($authorScriptURL$$).then(function($baseElement$jscomp$4$$) {
    return $baseElement$jscomp$4$$.text();
  })]).then(function($workerDomURL$$) {
    var $callbacks$jscomp$1$$ = $workerDomURL$$[0];
    $workerDomURL$$ = $workerDomURL$$[1];
    var $_ref_authorScript$$ = [];
    for ($hydratedNode_key$jscomp$138$$ in window.document.body.style) {
      $_ref_authorScript$$.push("'" + $hydratedNode_key$jscomp$138$$ + "'");
    }
    var $hydratedNode_key$jscomp$138$$ = $createHydrateableNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($baseElement$jscomp$4$$);
    $callbacks$jscomp$1$$ = "\n        'use strict';\n        " + $callbacks$jscomp$1$$ + "\n        (function() {\n          var self = this;\n          var window = this;\n          var document = this.document;\n          var localStorage = this.localStorage;\n          var location = this.location;\n          var defaultView = document.defaultView;\n          var Node = defaultView.Node;\n          var Text = defaultView.Text;\n          var Element = defaultView.Element;\n          var SVGElement = defaultView.SVGElement;\n          var Document = defaultView.Document;\n          var Event = defaultView.Event;\n          var MutationObserver = defaultView.MutationObserver;\n\n          function addEventListener(type, handler) {\n            return document.addEventListener(type, handler);\n          }\n          function removeEventListener(type, handler) {\n            return document.removeEventListener(type, handler);\n          }\n          this.consumeInitialDOM(document, " + 
    JSON.stringify($initialStrings$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$) + ", " + JSON.stringify($hydratedNode_key$jscomp$138$$) + ");\n          this.appendKeys([" + $_ref_authorScript$$ + "]);\n          document.observe();\n          " + $workerDomURL$$ + "\n        }).call(WorkerThread.workerDOM);\n//# sourceURL=" + (0,window.encodeURI)($authorScriptURL$$);
    return new window.Worker(window.URL.createObjectURL(new window.Blob([$callbacks$jscomp$1$$])));
  }).catch(function() {
    return null;
  });
}, $shouldTrackChanges$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($node$jscomp$95$$) {
  return $node$jscomp$95$$ && "value" in $node$jscomp$95$$;
}, $applyDefaultChangeListener$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($worker$jscomp$4$$, $node$jscomp$96$$) {
  $shouldTrackChanges$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($node$jscomp$96$$) && null === $node$jscomp$96$$.onchange && ($node$jscomp$96$$.onchange = function() {
    return $fireValueChange$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($worker$jscomp$4$$, $node$jscomp$96$$);
  });
}, $fireValueChange$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($worker$jscomp$5$$, $message$jscomp$inline_3932_node$jscomp$97$$) {
  var $$jscomp$compprop37$$ = {}, $$jscomp$compprop38$$ = {};
  $message$jscomp$inline_3932_node$jscomp$97$$ = ($$jscomp$compprop38$$[9] = 5, $$jscomp$compprop38$$[38] = ($$jscomp$compprop37$$[7] = $message$jscomp$inline_3932_node$jscomp$97$$.$_index_$, $$jscomp$compprop37$$[18] = $message$jscomp$inline_3932_node$jscomp$97$$.value, $$jscomp$compprop37$$), $$jscomp$compprop38$$);
  $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ && $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$onSendMessage$ && $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$onSendMessage$($message$jscomp$inline_3932_node$jscomp$97$$);
  $worker$jscomp$5$$.postMessage($message$jscomp$inline_3932_node$jscomp$97$$);
}, $eventHandler$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($worker$jscomp$6$$, $_index_$$) {
  return function($event$jscomp$176_message$jscomp$inline_3935$$) {
    $shouldTrackChanges$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($event$jscomp$176_message$jscomp$inline_3935$$.currentTarget) && $fireValueChange$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($worker$jscomp$6$$, $event$jscomp$176_message$jscomp$inline_3935$$.currentTarget);
    var $$jscomp$compprop39$$ = {}, $$jscomp$compprop40$$ = {}, $$jscomp$compprop41$$ = {}, $$jscomp$compprop42$$ = {};
    $event$jscomp$176_message$jscomp$inline_3935$$ = ($$jscomp$compprop42$$[9] = 1, $$jscomp$compprop42$$[37] = ($$jscomp$compprop41$$[7] = $_index_$$, $$jscomp$compprop41$$[22] = $event$jscomp$176_message$jscomp$inline_3935$$.bubbles, $$jscomp$compprop41$$[23] = $event$jscomp$176_message$jscomp$inline_3935$$.cancelable, $$jscomp$compprop41$$[24] = $event$jscomp$176_message$jscomp$inline_3935$$.cancelBubble, $$jscomp$compprop41$$[25] = ($$jscomp$compprop39$$[7] = $event$jscomp$176_message$jscomp$inline_3935$$.currentTarget.$_index_$, 
    $$jscomp$compprop39$$[8] = 1, $$jscomp$compprop39$$), $$jscomp$compprop41$$[26] = $event$jscomp$176_message$jscomp$inline_3935$$.defaultPrevented, $$jscomp$compprop41$$[27] = $event$jscomp$176_message$jscomp$inline_3935$$.eventPhase, $$jscomp$compprop41$$[28] = $event$jscomp$176_message$jscomp$inline_3935$$.isTrusted, $$jscomp$compprop41$$[29] = $event$jscomp$176_message$jscomp$inline_3935$$.returnValue, $$jscomp$compprop41$$[10] = ($$jscomp$compprop40$$[7] = $event$jscomp$176_message$jscomp$inline_3935$$.target.$_index_$, 
    $$jscomp$compprop40$$[8] = 1, $$jscomp$compprop40$$), $$jscomp$compprop41$$[30] = $event$jscomp$176_message$jscomp$inline_3935$$.timeStamp, $$jscomp$compprop41$$[9] = $event$jscomp$176_message$jscomp$inline_3935$$.type, $$jscomp$compprop41$$[32] = "keyCode" in $event$jscomp$176_message$jscomp$inline_3935$$ ? $event$jscomp$176_message$jscomp$inline_3935$$.keyCode : void 0, $$jscomp$compprop41$$), $$jscomp$compprop42$$);
    $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ && $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$onSendMessage$ && $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$onSendMessage$($event$jscomp$176_message$jscomp$inline_3935$$);
    $worker$jscomp$6$$.postMessage($event$jscomp$176_message$jscomp$inline_3935$$);
  };
}, $process$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($mutation$jscomp$2$$) {
  var $worker$jscomp$7$$ = $worker$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $target$jscomp$156$$ = $getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$2$$[10]);
  ($mutation$jscomp$2$$[21] || []).forEach(function($mutation$jscomp$2$$) {
    $processListenerChange$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($worker$jscomp$7$$, $target$jscomp$156$$, !1, $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$2$$[9]), $mutation$jscomp$2$$[33]);
  });
  ($mutation$jscomp$2$$[20] || []).forEach(function($mutation$jscomp$2$$) {
    $processListenerChange$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($worker$jscomp$7$$, $target$jscomp$156$$, !0, $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$2$$[9]), $mutation$jscomp$2$$[33]);
  });
}, $processListenerChange$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($worker$jscomp$8$$, $target$jscomp$157$$, $addEvent$jscomp$1$$, $type$jscomp$187$$, $index$jscomp$132$$) {
  var $changeEventSubscribed$$ = null !== $target$jscomp$157$$.onchange, $shouldTrack$$ = $shouldTrackChanges$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($target$jscomp$157$$), $isChangeEvent$$ = "change" === $type$jscomp$187$$;
  $addEvent$jscomp$1$$ ? ($isChangeEvent$$ && ($changeEventSubscribed$$ = !0, $target$jscomp$157$$.onchange = null), $target$jscomp$157$$.addEventListener($type$jscomp$187$$, $KNOWN_LISTENERS$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$[$index$jscomp$132$$] = $eventHandler$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($worker$jscomp$8$$, $target$jscomp$157$$.$_index_$))) : ($isChangeEvent$$ && ($changeEventSubscribed$$ = !1), $target$jscomp$157$$.removeEventListener($type$jscomp$187$$, 
  $KNOWN_LISTENERS$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$[$index$jscomp$132$$]));
  $shouldTrack$$ && !$changeEventSubscribed$$ && $applyDefaultChangeListener$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($worker$jscomp$8$$, $target$jscomp$157$$);
}, $mutate$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($nodes$jscomp$7$$, $stringValues$$, $mutations$jscomp$15$$, $sanitizer$jscomp$4$$) {
  $stringValues$$.forEach(function($nodes$jscomp$7$$) {
    $strings$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.set(++$count$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $nodes$jscomp$7$$);
  });
  $nodes$jscomp$7$$.forEach(function($nodes$jscomp$7$$) {
    return $createNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($nodes$jscomp$7$$, $sanitizer$jscomp$4$$);
  });
  $MUTATION_QUEUE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = $MUTATION_QUEUE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.concat($mutations$jscomp$15$$);
  $PENDING_MUTATIONS$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ || ($PENDING_MUTATIONS$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = !0, (0,window.requestAnimationFrame)(function() {
    return $syncFlush$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($sanitizer$jscomp$4$$);
  }));
}, $syncFlush$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($sanitizer$jscomp$5$$) {
  $MUTATION_QUEUE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.forEach(function($mutation$jscomp$8$$) {
    $mutators$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$[$mutation$jscomp$8$$[9]]($mutation$jscomp$8$$, $getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$8$$[10]), $sanitizer$jscomp$5$$);
  });
  $MUTATION_QUEUE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = [];
  $PENDING_MUTATIONS$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = !1;
}, $install$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($baseElement$jscomp$5$$, $authorURL$$, $workerDOMUrl$$) {
  var $workerCallbacks$$ = $workerCallbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $sanitizer$jscomp$6$$ = $sanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$;
  $prepare$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($baseElement$jscomp$5$$);
  $createWorker$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($baseElement$jscomp$5$$, $workerDOMUrl$$, $authorURL$$, $workerCallbacks$$).then(function($baseElement$jscomp$5$$) {
    null !== $baseElement$jscomp$5$$ && ($worker$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = $baseElement$jscomp$5$$, $baseElement$jscomp$5$$.onmessage = function($baseElement$jscomp$5$$) {
      var $authorURL$$ = $baseElement$jscomp$5$$.data;
      $ALLOWABLE_MESSAGE_TYPES$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.includes($authorURL$$[9]) && ($mutate$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($authorURL$$[35], $authorURL$$[39], $authorURL$$[34], $sanitizer$jscomp$6$$), $workerCallbacks$$ && $workerCallbacks$$.$onReceiveMessage$ && $workerCallbacks$$.$onReceiveMessage$($baseElement$jscomp$5$$));
    });
  });
}, $readableMessageFromWorker$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($data$jscomp$167_message$jscomp$69$$) {
  $data$jscomp$167_message$jscomp$69$$ = $data$jscomp$167_message$jscomp$69$$.data;
  return 3 === $data$jscomp$167_message$jscomp$69$$[9] || 2 === $data$jscomp$167_message$jscomp$69$$[9] ? {type:3 === $data$jscomp$167_message$jscomp$69$$[9] ? "MUTATE" : "HYDRATE", $mutations$:$data$jscomp$167_message$jscomp$69$$[34].map(function($data$jscomp$167_message$jscomp$69$$) {
    return $readableTransferrableMutationRecord$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($data$jscomp$167_message$jscomp$69$$);
  })} : "Unrecognized MessageFromWorker type: " + $data$jscomp$167_message$jscomp$69$$[9];
}, $readableTransferrableMutationRecord$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($r$jscomp$40_removedEvents$$) {
  var $out$jscomp$6_target$jscomp$162$$ = $r$jscomp$40_removedEvents$$[10];
  $out$jscomp$6_target$jscomp$162$$ = {type:$MUTATION_RECORD_TYPE_REVERSE_MAPPING$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$[$r$jscomp$40_removedEvents$$[9]], target:$getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($out$jscomp$6_target$jscomp$162$$) || $out$jscomp$6_target$jscomp$162$$};
  var $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[11];
  $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ && ($out$jscomp$6_target$jscomp$162$$.addedNodes = $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$.map(function($r$jscomp$40_removedEvents$$) {
    return $readableTransferredNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($r$jscomp$40_removedEvents$$);
  }));
  ($added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[12]) && ($out$jscomp$6_target$jscomp$162$$.removedNodes = $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$.map(function($r$jscomp$40_removedEvents$$) {
    return $readableTransferredNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($r$jscomp$40_removedEvents$$);
  }));
  ($added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[13]) && ($out$jscomp$6_target$jscomp$162$$.previousSibling = $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$);
  ($added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[14]) && ($out$jscomp$6_target$jscomp$162$$.nextSibling = $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$);
  $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[15];
  void 0 !== $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ && ($out$jscomp$6_target$jscomp$162$$.attributeName = $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$));
  $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[16];
  void 0 !== $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ && ($out$jscomp$6_target$jscomp$162$$.attributeNamespace = $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$);
  $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[17];
  void 0 !== $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ && ($out$jscomp$6_target$jscomp$162$$.propertyName = $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$);
  $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[18];
  void 0 !== $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ && ($out$jscomp$6_target$jscomp$162$$.value = $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$));
  $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[19];
  void 0 !== $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ && ($out$jscomp$6_target$jscomp$162$$.oldValue = $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$));
  $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ = $r$jscomp$40_removedEvents$$[20];
  void 0 !== $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$ && ($out$jscomp$6_target$jscomp$162$$.addedEvents = $added$jscomp$3_addedEvents_attributeName$jscomp$3_attributeNamespace_nextSibling$jscomp$2_oldValue$jscomp$6_previousSibling_propertyName$jscomp$15_removed$jscomp$6_value$jscomp$283$$);
  $r$jscomp$40_removedEvents$$ = $r$jscomp$40_removedEvents$$[21];
  void 0 !== $r$jscomp$40_removedEvents$$ && ($out$jscomp$6_target$jscomp$162$$.removedEvents = $r$jscomp$40_removedEvents$$);
  return $out$jscomp$6_target$jscomp$162$$;
}, $readableTransferredNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = function($index$jscomp$133_n$jscomp$49$$) {
  $index$jscomp$133_n$jscomp$49$$ = $index$jscomp$133_n$jscomp$49$$[7];
  return $getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($index$jscomp$133_n$jscomp$49$$) || $index$jscomp$133_n$jscomp$49$$;
}, $AmpScript$$module$extensions$amp_script$0_1$amp_script$$ = function($var_args$jscomp$83$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
}, $html$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = "a abbr acronym address area article aside audio b bdi bdo big blink blockquote body br button canvas caption center cite code col colgroup content data datalist dd decorator del details dfn dir div dl dt element em fieldset figcaption figure font footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i img input ins kbd label legend li main map mark marquee menu menuitem meter nav nobr ol optgroup option output p pre progress q rp rt ruby s samp section select shadow small source spacer span strike strong style sub summary sup table tbody td template textarea tfoot th thead time tr track tt u ul var video wbr".split(" "), 
$svg$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = "svg a altglyph altglyphdef altglyphitem animatecolor animatemotion animatetransform audio canvas circle clippath defs desc ellipse filter font g glyph glyphref hkern image line lineargradient marker mask metadata mpath path pattern polygon polyline radialgradient rect stop style switch symbol text textpath title tref tspan video view vkern".split(" "), $svgFilters$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = 
"feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence".split(" "), $mathMl$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = "math menclose merror mfenced mfrac mglyph mi mlabeledtr mmuliscripts mn mo mover mpadded mphantom mroot mrow ms mpspace msqrt mystyle msub msup msubsup mtable mtd mtext mtr munder munderover".split(" "), 
$text$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = ["#text"], $html$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = "accept action align alt autocomplete background bgcolor border cellpadding cellspacing checked cite class clear color cols colspan coords crossorigin datetime default dir disabled download enctype face for headers height hidden high href hreflang id integrity ismap label lang list loop low max maxlength media method min multiple name noshade novalidate nowrap open optimum pattern placeholder poster preload pubdate radiogroup readonly rel required rev reversed role rows rowspan spellcheck scope selected shape size sizes span srclang start src srcset step style summary tabindex title type usemap valign value width xmlns".split(" "), 
$svg$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = "accent-height accumulate additivive alignment-baseline ascent attributename attributetype azimuth basefrequency baseline-shift begin bias by class clip clip-path clip-rule color color-interpolation color-interpolation-filters color-profile color-rendering cx cy d dx dy diffuseconstant direction display divisor dur edgemode elevation end fill fill-opacity fill-rule filter flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight fx fy g1 g2 glyph-name glyphref gradientunits gradienttransform height href id image-rendering in in2 k k1 k2 k3 k4 kerning keypoints keysplines keytimes lang lengthadjust letter-spacing kernelmatrix kernelunitlength lighting-color local marker-end marker-mid marker-start markerheight markerunits markerwidth maskcontentunits maskunits max mask media method mode min name numoctaves offset operator opacity order orient orientation origin overflow paint-order path pathlength patterncontentunits patterntransform patternunits points preservealpha preserveaspectratio r rx ry radius refx refy repeatcount repeatdur restart result rotate scale seed shape-rendering specularconstant specularexponent spreadmethod stddeviation stitchtiles stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke stroke-width style surfacescale tabindex targetx targety transform text-anchor text-decoration text-rendering textlength type u1 u2 unicode values viewbox visibility vert-adv-y vert-origin-x vert-origin-y width word-spacing wrap writing-mode xchannelselector ychannelselector x x1 x2 xmlns y y1 y2 z zoomandpan".split(" "), 
$mathMl$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = "accent accentunder align bevelled close columnsalign columnlines columnspan denomalign depth dir display displaystyle fence frame height href id largeop length linethickness lspace lquote mathbackground mathcolor mathsize mathvariant maxsize minsize movablelimits notation numalign open rowalign rowlines rowspacing rowspan rspace rquote scriptlevel scriptminsize scriptsizemultiplier selection separator separators stretchy subscriptshift supscriptshift symmetric voffset width xmlns".split(" "), 
$xml$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = ["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"], $MUSTACHE_EXPR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = /\{\{[\s\S]*|[\s\S]*\}\}/gm, $ERB_EXPR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = /<%[\s\S]*|[\s\S]*%>/gm, $DATA_ATTR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = /^data-[\-\w.\u00B7-\uFFFF]/, $ARIA_ATTR$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = 
/^aria-[\-\w]+$/, $IS_ALLOWED_URI$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i, $IS_SCRIPT_OR_DATA$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = /^(?:\w+script|data):/i, $ATTR_WHITESPACE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;
_.$$jscomp$initSymbol$$();
_.$$jscomp$initSymbol$$();
_.$$jscomp$initSymbolIterator$$();
var $_typeof$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = "function" === typeof window.Symbol && "symbol" === typeof window.Symbol.iterator ? function($obj$jscomp$56$$) {
  return typeof $obj$jscomp$56$$;
} : function($obj$jscomp$57$$) {
  _.$$jscomp$initSymbol$$();
  _.$$jscomp$initSymbol$$();
  _.$$jscomp$initSymbol$$();
  return $obj$jscomp$57$$ && "function" === typeof window.Symbol && $obj$jscomp$57$$.constructor === window.Symbol && $obj$jscomp$57$$ !== window.Symbol.prototype ? "symbol" : typeof $obj$jscomp$57$$;
}, $purify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = $createDOMPurify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$(), $propertyToAttribute$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = {};
$DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.prototype.$sanitize$ = function($node$jscomp$88$$) {
  this.$callbacks_$ && this.$callbacks_$.$beforeSanitize$ && this.$callbacks_$.$beforeSanitize$($purify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$);
  var $useWrapper$$ = !$node$jscomp$88$$.parentNode;
  $useWrapper$$ && this.$D$.appendChild($node$jscomp$88$$);
  var $parent$jscomp$54$$ = $node$jscomp$88$$.parentNode || this.$D$;
  $purify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$sanitize$($parent$jscomp$54$$, this.$config_$);
  if (!$parent$jscomp$54$$.firstChild) {
    return this.$callbacks_$ && this.$callbacks_$.$nodeWasRemoved$ && this.$callbacks_$.$nodeWasRemoved$($node$jscomp$88$$), !1;
  }
  if ($useWrapper$$) {
    for (; this.$D$.firstChild;) {
      this.$D$.removeChild(this.$D$.firstChild);
    }
  }
  this.$callbacks_$ && this.$callbacks_$.$afterSanitize$ && this.$callbacks_$.$afterSanitize$($purify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$);
  return !0;
};
var $count$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = 0, $strings$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = new window.Map, $count$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = 2, $NODES$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $BASE_ELEMENT$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = 
[8, 3], $initialStrings$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = [], $strings$1$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = new window.Map, $count$2$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = 0, $callbacks_$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $KNOWN_LISTENERS$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = [], $MUTATION_QUEUE$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = 
[], $PENDING_MUTATIONS$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = !1, $worker$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, $$jscomp$compprop43$$ = {}, $mutators$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = ($$jscomp$compprop43$$[2] = function($mutation$jscomp$3$$, $target$jscomp$158$$, $sanitizer$jscomp$1$$) {
  ($mutation$jscomp$3$$[12] || []).forEach(function($mutation$jscomp$3$$) {
    return $getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$3$$[7]).remove();
  });
  var $addedNodes$jscomp$1$$ = $mutation$jscomp$3$$[11], $nextSibling$jscomp$1$$ = $mutation$jscomp$3$$[14];
  $addedNodes$jscomp$1$$ && $addedNodes$jscomp$1$$.forEach(function($mutation$jscomp$3$$) {
    var $addedNodes$jscomp$1$$ = $getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$3$$[7]);
    if (!$addedNodes$jscomp$1$$) {
      if ($mutation$jscomp$3$$[8]) {
        return;
      }
      $addedNodes$jscomp$1$$ = $createNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$3$$, $sanitizer$jscomp$1$$);
    }
    $addedNodes$jscomp$1$$ && $target$jscomp$158$$.insertBefore($addedNodes$jscomp$1$$, $nextSibling$jscomp$1$$ && $getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($nextSibling$jscomp$1$$[7]) || null);
  });
}, $$jscomp$compprop43$$[0] = function($mutation$jscomp$4_value$jscomp$279$$, $target$jscomp$159$$, $sanitizer$jscomp$2$$) {
  var $attributeName$jscomp$2$$ = void 0 !== $mutation$jscomp$4_value$jscomp$279$$[15] ? $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$4_value$jscomp$279$$[15]) : null;
  $mutation$jscomp$4_value$jscomp$279$$ = void 0 !== $mutation$jscomp$4_value$jscomp$279$$[18] ? $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$4_value$jscomp$279$$[18]) : null;
  null != $attributeName$jscomp$2$$ && (null == $mutation$jscomp$4_value$jscomp$279$$ ? $target$jscomp$159$$.removeAttribute($attributeName$jscomp$2$$) : (!$sanitizer$jscomp$2$$ || $purify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$isValidAttribute$($target$jscomp$159$$.nodeName, $attributeName$jscomp$2$$, $mutation$jscomp$4_value$jscomp$279$$)) && $target$jscomp$159$$.setAttribute($attributeName$jscomp$2$$, $mutation$jscomp$4_value$jscomp$279$$));
}, $$jscomp$compprop43$$[1] = function($mutation$jscomp$5_value$jscomp$280$$, $target$jscomp$160$$) {
  if ($mutation$jscomp$5_value$jscomp$280$$ = $mutation$jscomp$5_value$jscomp$280$$[18]) {
    $target$jscomp$160$$.textContent = $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$5_value$jscomp$280$$);
  }
}, $$jscomp$compprop43$$[3] = function($mutation$jscomp$6_value$jscomp$281$$, $target$jscomp$161$$, $JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$) {
  var $propertyName$jscomp$14$$ = void 0 !== $mutation$jscomp$6_value$jscomp$281$$[17] ? $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$6_value$jscomp$281$$[17]) : null;
  $mutation$jscomp$6_value$jscomp$281$$ = void 0 !== $mutation$jscomp$6_value$jscomp$281$$[18] ? $get$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$6_value$jscomp$281$$[18]) : null;
  if ($propertyName$jscomp$14$$ && null != $mutation$jscomp$6_value$jscomp$281$$) {
    var $stringValue$jscomp$2$$ = String($mutation$jscomp$6_value$jscomp$281$$);
    if (!($JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$ = !$JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$)) {
      $JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$ = $target$jscomp$161$$.nodeName;
      var $attr$jscomp$inline_3941$$ = $propertyToAttribute$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$[$propertyName$jscomp$14$$];
      $JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$ = $attr$jscomp$inline_3941$$ ? $purify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$isValidAttribute$($JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$, $attr$jscomp$inline_3941$$, $stringValue$jscomp$2$$) : $purify$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$.$isValidAttribute$($JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$, 
      $propertyName$jscomp$14$$, $stringValue$jscomp$2$$);
    }
    $JSCompiler_temp$jscomp$834_sanitizer$jscomp$3_tag$jscomp$inline_3938$$ && ($target$jscomp$161$$[$propertyName$jscomp$14$$] = "checked" == $propertyName$jscomp$14$$ ? "true" === $mutation$jscomp$6_value$jscomp$281$$ : $mutation$jscomp$6_value$jscomp$281$$);
  }
}, $$jscomp$compprop43$$[4] = function($mutation$jscomp$7$$) {
  $process$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($mutation$jscomp$7$$);
}, $$jscomp$compprop43$$), $ALLOWABLE_MESSAGE_TYPES$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = [3, 2], $MUTATION_RECORD_TYPE_REVERSE_MAPPING$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = {0:"ATTRIBUTES", 1:"CHARACTER_DATA", 2:"CHILD_LIST", 3:"PROPERTIES", 4:"COMMAND"}, $sanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = new $DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$, 
$callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onSendMessage$$, $callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onReceiveMessage$$, $workerCallbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$ = {$onSendMessage$:function($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$) {
  if ($callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onSendMessage$$) {
    if (1 == $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$[9]) {
      var $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$ = $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$[37];
      $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$ = {type:$e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[9]};
      var $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[22];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.bubbles = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[23];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.cancelable = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[24];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.cancelBubble = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[26];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.defaultPrevented = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[27];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.eventPhase = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[28];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.isTrusted = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[29];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.returnValue = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      ($bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[25]) && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.currentTarget = 
      $readableTransferredNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$));
      ($bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[10]) && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.target = 
      $readableTransferredNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$));
      $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[31];
      void 0 !== $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.scoped = $bubbles$jscomp$inline_6335_cancelBubble$jscomp$inline_6337_cancelable$jscomp$inline_6336_currentTarget$jscomp$inline_6342_defaultPrevented$jscomp$inline_6338_eventPhase$jscomp$inline_6339_isTrusted$jscomp$inline_6340_returnValue$jscomp$inline_6341_scoped$jscomp$inline_6344_target$jscomp$inline_6343$$);
      $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$ = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$[32];
      void 0 !== $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$ && ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$.keyCode = $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$);
      $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$ = {type:"EVENT", event:$JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$};
    } else {
      5 == $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$[9] ? ($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$ = $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$[38], $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$ = $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$[7], 
      $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$ = {type:"SYNC", sync:{target:$getNode$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$) || $e$jscomp$inline_6333_index$jscomp$inline_6348_keyCode$jscomp$inline_6345$$, value:$JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$[18]}}) : 
      $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$ = "Unrecognized MessageToWorker type: " + $JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$[9];
    }
    $callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onSendMessage$$($JSCompiler_temp$jscomp$5646_JSCompiler_temp$jscomp$5648_message$jscomp$73_out$jscomp$inline_6334_v$jscomp$inline_6347$$);
  }
}, $onReceiveMessage$:function($message$jscomp$74_readable$jscomp$1$$) {
  $callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onReceiveMessage$$ && ($message$jscomp$74_readable$jscomp$1$$ = $readableMessageFromWorker$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$($message$jscomp$74_readable$jscomp$1$$), $callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onReceiveMessage$$($message$jscomp$74_readable$jscomp$1$$));
}};
_.$$jscomp$inherits$$($AmpScript$$module$extensions$amp_script$0_1$amp_script$$, window.AMP.BaseElement);
$AmpScript$$module$extensions$amp_script$0_1$amp_script$$.prototype.$isLayoutSupported$ = function($layout$jscomp$91$$) {
  return "container" == $layout$jscomp$91$$ || _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$91$$);
};
$AmpScript$$module$extensions$amp_script$0_1$amp_script$$.prototype.$layoutCallback$ = function() {
  if (!_.$isExperimentOn$$module$src$experiments$$(this.$win$, "amp-script")) {
    return _.$user$$module$src$log$$().error("amp-script", 'Experiment "amp-script" is not enabled.'), window.Promise.reject('Experiment "amp-script" is not enabled.');
  }
  var $authorUrl_config$jscomp$78$$ = _.$purifyConfig$$module$src$purifier$$();
  $JSCompiler_StaticMethods_DOMPurifySanitizer$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched_prototype$configure$$($authorUrl_config$jscomp$78$$, {beforeSanitize:function($authorUrl_config$jscomp$78$$) {
    _.$addPurifyHooks$$module$src$purifier$$($authorUrl_config$jscomp$78$$, !1);
  }, afterSanitize:function($authorUrl_config$jscomp$78$$) {
    $authorUrl_config$jscomp$78$$.$removeAllHooks$();
  }, nodeWasRemoved:function($authorUrl_config$jscomp$78$$) {
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-script", "Node was sanitized:", $authorUrl_config$jscomp$78$$);
  }});
  $callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onSendMessage$$ = function($authorUrl_config$jscomp$78$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-script", "To worker:", $authorUrl_config$jscomp$78$$);
  };
  $callbacks$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$onReceiveMessage$$ = function($authorUrl_config$jscomp$78$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-script", "From worker:", $authorUrl_config$jscomp$78$$);
  };
  $authorUrl_config$jscomp$78$$ = this.element.getAttribute("src");
  var $workerUrl$$ = _.$calculateExtensionScriptUrl$$module$src$service$extension_location$$("amp-script-worker", "0.1");
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-script", "Author URL:", $authorUrl_config$jscomp$78$$, ", worker URL:", $workerUrl$$);
  $install$$module$$ampproject$worker_dom$dist$unminified_index_safe_mjs_patched$$(this.element, $authorUrl_config$jscomp$78$$, $workerUrl$$);
  return window.Promise.resolve();
};
window.self.AMP.registerElement("amp-script", $AmpScript$$module$extensions$amp_script$0_1$amp_script$$);

})});
